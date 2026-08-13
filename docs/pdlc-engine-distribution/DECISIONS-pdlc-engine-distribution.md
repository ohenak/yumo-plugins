# DECISIONS — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **DECISIONS**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10), `FSPEC-pdlc-engine-distribution.md` (v0.2), `TSPEC-pdlc-engine-distribution.md` (v0.9), `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-01…05) |
| Downstream | PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-DECISIONS-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft (Phase T) | Claude | 0.1 | 2026-08-13 |

**Changelog**

| Version | Change |
|---|---|
| 0.1 | Initial draft — DEC-EDIST-01…10 recorded from TSPEC v0.9 §4, §6.2, §6.4, §8.2, §9.3 |

## 1. Scope

This document records the load-bearing decisions the TSPEC takes, with the alternatives that
were rejected and why. It is the *record*, not a second authority: where a mechanism is
specified, the TSPEC section named in each entry is normative and this file states only what
was chosen, what was rejected, and what would make the choice worth revisiting.

Ten entries. Five (DEC-EDIST-01…05) close the obligations the FSPEC parked — O-10, O-9, O-2's
execution half, Q-4 and Q-5 — and are the five listed in TSPEC §4. Five more
(DEC-EDIST-06…10) are decisions taken inside the TSPEC's body that a later reader would
otherwise have to reconstruct from prose: they each rejected a plausible alternative, each
have a reversal cost worth stating, and each are cited by more than one downstream artifact.

Project-level decisions in `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-01…05)
are **not** re-litigated here. Two of them are load-bearing inputs: DEC-DIST-02's three-tier
source/artifact/consumer-copy discipline is what DEC-EDIST-01 reuses, and DEC-DIST-05's
"scoped public npm package" is the channel every entry below assumes.

Nothing here decides the operator-owned items — the npm scope (N-6), the licence (N-2) or
BL-03's transcription (N-3). §12 lists them with their owners.

## 2. DEC-EDIST-01: Vendor the workflow modules at build time, into the tarball only

*Closes FSPEC O-10 / REQ R-5. Mechanism: TSPEC §5.2, §5.3.*

**Context.** The engine reaches the workflow modules by a path relative to the repo checkout —
`new URL("../../workflows/orchestrate-dev.js", import.meta.url)`
(`pdlc/engine/lib/run.mjs:52-55`). A tarball rooted at `pdlc/engine/` contains nothing at that
path, so an installed engine cannot load a workflow module at all. Something had to change, and
the constraint C-4 puts on it is that `pdlc/workflows/` — the tree the plugin channel,
`build-runtime.mjs` and `sync-workflows.sh` all read — must not move.

**Decision.** A `prepack` script copies the two modules byte-for-byte into
`pdlc/engine/vendor/workflows/` with a SHA-256 `VENDOR-MANIFEST.json`; `vendor/` is git-ignored
(`pdlc/engine/.gitignore` carries only `node_modules/` at HEAD, so the rule is new) and exists
only inside the packed artifact. `WORKFLOW_MODULE_URLS` becomes a two-root resolution —
`../vendor/workflows/` first, then the checkout's `../../workflows/` — and the anti-fork oracle
is **restated, not deleted**: AF-1 reads git-tracked-ness rather than walking the directory,
AF-2 asserts the vendored bytes hash-equal the canonical sources, AF-3 keeps `PROP-FORK-1`'s
exact-path equality.

**Alternatives considered.**

- **Publish from the workspace root** — rejected. It needs no test changes, but the published
  package's internal shape becomes the repo's directory shape: both `pdlc/workflows/` and
  `pdlc/engine/` land inside the tarball, and any future repo reorganisation becomes a
  consumer-visible breaking change. It also drags the plugin's own tree across the package
  boundary that C-4 exists to hold.
- **Relocate the modules under the package root** — rejected *for now*, and it is the cleanest
  end state. Today it moves the files that `pdlc/workflows/build-runtime.mjs` and
  `pdlc/hooks/scripts/sync-workflows.sh` read, i.e. it breaks the plugin channel to fix the
  engine channel. Verified cost: `build-runtime.mjs` and the sync script both address the tree
  by path (`build-runtime.mjs:19,48-49`), and `pdlc/engine/__tests__/run.test.js:45-46` pins
  the canonical `pdlc/workflows/orchestrate-{dev,queue}.js` path literally, so
  the move is a three-consumer edit, not a `git mv`. It belongs to `pdlc-plugin-retirement`,
  which removes the second channel and makes it a one-consumer edit.
- **Fetch the modules at runtime** — rejected without much weighing: NG-3 forbids the engine
  fetching anything.

**Constraints that forced the shape.** C-4 (`pdlc/workflows/` does not move); NG-3 (no
fetching); R-5 (the package as arranged cannot contain the modules); BR-8.2 (the no-fork
property must survive in a checkable form). DEC-DIST-02's existing tier discipline —
tracked source, built artifact, untracked consumer copy — is reused rather than a new
convention invented: `vendor/` is the same tier as `pdlc/workflows/dist/`'s relationship to
`.claude/workflows/`.

**Reversibility.** Easy in the direction that matters. Deleting the vendor step and the second
root restores HEAD behaviour; the oracle restatement is the only part with an edit cost, and
AF-1/AF-2 remain correct assertions about a repo that vendors nothing.

**Re-evaluation triggers.** `pdlc-plugin-retirement` landing (the relocation alternative
becomes correct and cheap); a third consumer of `pdlc/workflows/` appearing (raises the
relocation cost further); the vendored set growing past two files (the manifest's hand-written
`modules` set-equality stops being the cheap check it is at two).

**Residual risk (TSPEC R-A).** AF-1's tracked-ness reading no longer catches an *untracked*
fork under `pdlc/engine/` — which is precisely what vendoring produces, so the weakening is
deliberate. The uncovered residual is a hand-placed untracked copy that is also byte-identical
to the source, which is harmless by definition.

## 3. DEC-EDIST-02: One optional, default-inert `_provenance` seam

## 4. DEC-EDIST-03: A version store plus a resolving launcher

## 5. DEC-EDIST-04: Ignore a bare `PDLC_PLUGIN_ROOT`, with a notice

## 6. DEC-EDIST-05: A `files` allow-list, not an `.npmignore` deny-list

## 7. DEC-EDIST-06: The launcher hop is a child process, not a dynamic import

## 8. DEC-EDIST-07: `--version` and `doctor` resolve but never refuse

## 9. DEC-EDIST-08: An unreadable consumer config refuses, even when no pin was declared

## 10. DEC-EDIST-09: A dependency-free guard entry point; the CLI body moves to `bin/cli.mjs`

## 11. DEC-EDIST-10: `publish.yml` duplicates the gate jobs rather than extracting a reusable workflow

## 12. Decisions deliberately not taken here
