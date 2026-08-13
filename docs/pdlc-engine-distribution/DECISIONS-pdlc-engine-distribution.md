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

*Closes FSPEC O-9 (Q-1's "one decision or three?"). Mechanism: TSPEC §7.1, §7.2, §7.4.*

**Context.** Three acceptance criteria want provenance to travel: the version pair in committed
halt artifacts (AC-4.2), the authored-file enumeration in the run report (AC-4.5), and the load
root (AC-6.2). The version pair already exists engine-side — `buildEngineBlock` /`stampReport`
(`pdlc/engine/lib/report.mjs:54`, `:110`), wired at `pdlc/engine/bin/pdlc.mjs:323-325` — but the
module that writes the artifacts cannot see it. Q-1 offered "one carrier or three"; the
measured answer is that the three criteria are in three different states.

**Decision.** One carrier, and it serves only the criterion that needs one.

- **AC-4.2 — new work.** `main()` in both workflow modules gains one keyword parameter,
  `_provenance = NO_PROVENANCE`, following the shipped default-inert idiom exactly
  (`NO_PROBE`/`NO_RUN_COMMAND`, `pdlc/workflows/orchestrate-dev.js:7342`, `:7354`, consumed at
  `:6211-6212`, `:10655`). The value is a frozen plain-data `Provenance` (TSPEC §7.1) whose
  `line` and `block` are **pre-rendered by the engine**: the module places strings and never
  formats or branches on `mode`, so one renderer feeds four placements and the banner, report
  and commit rows cannot drift apart. The engine side pays for it with a key on each of the two
  injection objects (`devInjection` an 8th, `queueInjection` a 6th, `pdlc/engine/lib/run.mjs:80-91`,
  `:114-123`) and the matching edit to `PROP-PARITY-12`'s pinned seam lists
  (`pdlc/engine/__tests__/seam-contract.test.js:47-63`, seven and five members at HEAD).
- **AC-4.5 — no carrier at all.** The report already returns `artifactPaths`
  (`orchestrate-dev.js:13088`). What it needs is *more members*, not a new channel: the only
  push site is `:11507`, reachable only from `converge()`, so LEARNINGS, `CODE_REVIEW-*`,
  POSTMORTEMs, `ADVISORY-*` and anchor-appended cross-reviews are all absent today. That is
  enumeration work in the module, and the FSPEC's `[blocked on O-9]` marking of AT-4.5 is
  therefore wrong — raised as an erratum, not fixed here.
- **AC-6.2 — engine half only.** `Provenance.loadRoot` is real, run-bound evidence
  (`workflowModulePath`, `pdlc/engine/lib/run.mjs:57-62`). The bundle half stays open because
  C-4 forbids teaching `.claude/workflows/`'s runtime to self-report; recorded as N-3 in §12.

**Alternatives considered.**

- **A required parameter, or a module-level import of an engine module** — rejected. It makes
  the workflow modules depend on the engine, which breaks the plugin channel outright: the same
  file must keep loading in the Claude Code workflow runtime, where `import` does not exist
  (DEC-DIST-01).
- **Three separate carriers, one per criterion** — rejected as Q-1's expensive branch, and
  measurement showed two of the three need no carrier at all.
- **Have the module render the provenance text from the raw values** — rejected. Three call
  sites formatting independently is exactly how a banner and a commit row start disagreeing;
  pre-rendering makes BR-5.1's "both halves travel together" a property of one function.
- **A global or env-var channel** (`PDLC_PROVENANCE` read inside the module) — rejected: it is
  invisible to the seam-contract test, cannot be frozen per run, and leaks into subprocesses the
  pipeline spawns.

**Constraints that forced the shape.** DEC-DIST-01 (the modules must stay loadable in a
constrained runtime with no `import`, no `process`, no `fs`); NG-5 and C-4 (a run with no engine
must produce byte-identical artifacts — the same guarantee the advisory tier ships with,
`pdlc/workflows/__tests__/advisoryDisabled.test.js`); BR-1.5 (one frozen value per run).

**Reversibility.** Easy per placement, moderate as a whole. The parameter is additive and inert
by default, so removing the engine's injection reverts behaviour with one edit; removing the
parameter itself also touches the pinned seam lists and the commit helpers that compose `line`.

**Re-evaluation triggers.** The bundle channel retiring (the seam could become a plain import);
a second consumer wanting a different rendering (`line`/`block` pre-rendering stops being an
asset and the raw fields become the contract); `artifactPaths` growing a second writer outside
`main()` (AC-4.5's enumeration route in TSPEC §7.4 would need re-deciding).

## 4. DEC-EDIST-03: A version store plus a resolving launcher

## 5. DEC-EDIST-04: Ignore a bare `PDLC_PLUGIN_ROOT`, with a notice

## 6. DEC-EDIST-05: A `files` allow-list, not an `.npmignore` deny-list

## 7. DEC-EDIST-06: The launcher hop is a child process, not a dynamic import

## 8. DEC-EDIST-07: `--version` and `doctor` resolve but never refuse

## 9. DEC-EDIST-08: An unreadable consumer config refuses, even when no pin was declared

## 10. DEC-EDIST-09: A dependency-free guard entry point; the CLI body moves to `bin/cli.mjs`

## 11. DEC-EDIST-10: `publish.yml` duplicates the gate jobs rather than extracting a reusable workflow

## 12. Decisions deliberately not taken here
