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

*Closes FSPEC O-2's execution half — "how does the pin actually execute?". Mechanism: TSPEC
§6.1, §6.2, §6.3.*

**Context.** The REQ asks for two things at once: `pdlc` runs the **latest** installed engine
by default (AC-5.1), and a repo pinning a version that is **not installed** is **refused**
rather than silently upgraded or downgraded (AC-5.5). AC-5.5's wording — "refuse when the
pinned version is not installed, run it when it is" — presumes a plural "what is installed".

**Decision.** Installed engine versions live side by side under one store root
(`$PDLC_HOME/versions/{version}/`, defaulting to `~/.pdlc/versions/`), populated by a
`postinstall` script. The `PATH` entry is a thin launcher that parses just enough argv to know
the consumer cwd and the resolution-affecting flags, runs a **pure, total** resolution ladder
(TSPEC §6.3: `dev ≻ pin ≻ latest`, with named refusal branches for a corrupt config, an
incomplete `--dev`, a missing pin, a malformed pin and an empty store), and hands off to the
resolved version's own `bin/pdlc.mjs` with an env marker so the child never re-resolves.
Resolution happens exactly once per invocation, which is BR-1.5's structural precondition.

**Alternatives considered.**

- **A single global install** (`npm i -g` one version, upgrade in place) — rejected. It cannot
  answer "what is installed" in the plural, so AC-5.1 and AC-5.5 are jointly unsatisfiable: with
  one resident version the engine can only run that one, and a pin naming any other must either
  fetch or lie.
- **A global install plus `npx @{scope}/pdlc-engine@{pin}` per pinned repo** — rejected on
  NG-3. `npx` **fetches on a miss**, which is precisely the "never fetches, never
  auto-upgrades" prohibition; the failure would also be a network error rather than AC-5.5's
  named refusal.
- **Per-repo local installs** (`node_modules/.bin/pdlc` in each consumer) — rejected. It
  satisfies side-by-side residency, but every consumer repo pays install cost and gains a
  dependency entry, which contradicts C-2/BR-2.1's "the engine is machine-level state outside
  every consumer repo" and would put the engine into the diff of repos it is meant to observe.
- **Resolve by dynamic `import` of the target version inside one process** — rejected, and
  recorded separately as DEC-EDIST-06 because the reasoning is about process semantics rather
  than about the store.

**Constraints that forced the shape.** AC-5.1 + AC-5.5 jointly (side-by-side residency);
NG-3 (no fetching); C-2/BR-2.1 (machine-level, not repo-level); AC-2.5/BR-2.6 (the engine
install must not touch the plugin's tree under `~/.claude/`, which a store under `$PDLC_HOME`
satisfies by construction rather than by discipline).

**Reversibility.** Hard. The store root is on-disk state an operator's machine accumulates, and
the launcher hop is observable in exit codes and stdio. Retreating to a single global install
means re-opening AC-5.5. The store's *shape* is contained — only `lib/store.mjs` knows it — so
the layout can change behind that module cheaply; the decision to have a store cannot.

**Re-evaluation triggers.** `postinstall` being unavailable in enough environments to make
population unreliable (TSPEC R-B — the mitigation today is that the refusal is loud and
`doctor` still runs, per DEC-EDIST-07); the two-process startup cost (R-C) becoming measurable
against the dispatch path; a package manager the store cannot be populated from.

## 5. DEC-EDIST-04: Ignore a bare `PDLC_PLUGIN_ROOT`, with a notice

*Closes FSPEC Q-4 (which branch AC-5.6 takes). Mechanism: TSPEC §6.5.*

**Context.** T-6 says dev-mode must be declared **per invocation**, explicitly. At HEAD the env
var `PDLC_PLUGIN_ROOT` is an equal-ranking explicit override alongside the `--plugin-root` flag
(`pdlc/engine/lib/skills.mjs:212-217`) — an ambient variable exported once in a shell can
therefore steer every subsequent run at a checkout, which is what T-6 objects to. AC-5.6 leaves
open which of two branches to take: refuse when the variable is set without a per-invocation
dev declaration, or ignore it.

**Decision.** Ignore, with a notice. `resolvePluginRoot` gains a `devDeclared: boolean` input;
when it is false and `PDLC_PLUGIN_ROOT` is set, discovery proceeds as if the variable were
unset and the run emits `PDLC_PLUGIN_ROOT was set (<value>) and ignored — dev-mode was not
declared; pass --dev to honour it`. The `--plugin-root` **flag** keeps its current precedence in
all four rows: it is explicit and per-invocation, which is exactly what T-6 asks for. The notice
is a catalogue entry (TSPEC §10.3), so `lib/catalogue.mjs`'s shipped registered-message
set-equality covers it without a bespoke test. In the same change, the compat-refusal `REMEDY`
text (`pdlc/engine/lib/handshake.mjs:131-134`) is updated to recommend
`--dev PDLC_PLUGIN_ROOT=…` rather than the bare variable.

**Alternatives considered.**

- **Refuse on a bare `PDLC_PLUGIN_ROOT`** — the stricter branch, seriously considered because it
  reads T-6 unconditionally. Rejected because the variable is *shipped and documented in the
  product's own refusal text today* (`handshake.mjs:131-134`): it is currently an operator's
  remedy for a compat refusal. Turning the documented remedy into a second refusal punishes
  operators for following the product's own instruction, and does so at the worst moment — while
  they are already blocked by the first refusal.
- **Honour it silently, as today** — rejected: it is the status quo AC-5.6 exists to change,
  and it makes dev-mode ambient rather than per-invocation.
- **Honour it but warn** — rejected as the worst of both. The warning admits the input is
  suspect while still letting it steer the run, so nothing about T-6's ambient-state problem
  changes and the warning becomes noise operators learn to skip.

**Constraints that forced the shape.** T-6 (per-invocation declaration); the variable's
existing role in shipped refusal text; the principle that a product must not ignore an operator
input *silently* — hence the notice, which is the whole difference between this branch and the
status quo.

**Reversibility.** Easy — one branch in one function. Not a one-way door in either direction:
flipping to refusal later costs the same single branch, plus the message.

**Re-evaluation triggers.** Evidence that operators are hitting the notice repeatedly and not
acting on it (the ignore is then failing to teach, and refusal becomes the better teacher);
`REMEDY` losing its `PDLC_PLUGIN_ROOT` recommendation entirely, which removes the reason this
branch was chosen over refusal.

## 6. DEC-EDIST-05: A `files` allow-list, not an `.npmignore` deny-list

## 7. DEC-EDIST-06: The launcher hop is a child process, not a dynamic import

## 8. DEC-EDIST-07: `--version` and `doctor` resolve but never refuse

## 9. DEC-EDIST-08: An unreadable consumer config refuses, even when no pin was declared

## 10. DEC-EDIST-09: A dependency-free guard entry point; the CLI body moves to `bin/cli.mjs`

## 11. DEC-EDIST-10: `publish.yml` duplicates the gate jobs rather than extracting a reusable workflow

## 12. Decisions deliberately not taken here
