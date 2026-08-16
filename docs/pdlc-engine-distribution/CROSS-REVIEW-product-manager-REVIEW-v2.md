# Cross-Review: product-manager — Final Codebase Review (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the implementation on `feat-pdlc-engine-distribution` (delta
`b8212190..HEAD`), read against `REQ-pdlc-engine-distribution.md` §5 and my own round-1
review `CROSS-REVIEW-product-manager-REVIEW-v1.md`
**Date:** 2026-08-16
**Iteration:** 2
**Scope:** Local / Cross-Feature / Process tags per finding

## Method

Delta review, per the protocol: round-1's file re-read first, then
`git diff b8212190..HEAD` (14 files, +1 721/−24), then the changed surfaces exercised. Nothing
outside the delta was re-litigated, and every claim below was checked by running the code:

- **The shipped CLI was run, not read.** `node pdlc/engine/bin/pdlc.mjs --version` now prints
  the triple plus `mode:` and exits 0; `pdlc doctor` prints the store-root/installed/install-
  command trio; `PDLC_PLUGIN_ROOT=/tmp/nope pdlc doctor` prints
  `PDLC_PLUGIN_ROOT was set (/tmp/nope) and ignored — dev-mode was not declared; pass --dev to
  honour it`. All three were absent at round 1.
- **The launcher arm each round-1 finding named was driven directly** through `launch()` with
  injected seams (store `fs`, `exec`, `runMain`), including the one arm the new suite does not
  cover — see F-01 below.
- Both suites executed: `pdlc/engine` → `1..743`, 800 pass / 0 fail / 2 skipped (both the
  documented `PDLC_LIVE=1` opt-in legs); `pdlc/workflows` → 4 515 pass, 1 fail, which is the
  same known local false red as round 1 (`documentOracles.test.js` AT-22 walking this
  checkout's untracked `.claude/worktrees/` tree) and is not a finding.
- **Production-caller sweep re-run over the delta.** `bin/pdlc.mjs` now calls `launch()`, and
  `launch()` is the production edge that reaches `resolveVersion`, `launchMoveFor` and
  `execLauncher` (`pdlc/engine/bin/cli.mjs:958-1026`, `bin/pdlc.mjs:35-42`). No seam added in
  this round is builder-only.

## Round-1 findings: disposition

| Round-1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | `main()` carries `--version` / `-v` / `version` cases (`bin/cli.mjs:909-919`) and `cmdDoctor` routes through the same `versionDoctorFor` builder (`:411-442`), so the two surfaces cannot drift. Observed live: `--version` exits 0 with the triple; `doctor` carries all four store lines. Driven at process level by `__tests__/launch-wiring.test.js:88-132`, including a leg asserting every `--version` line appears verbatim in `doctor`'s output |
| F-02 | High | **Resolved** | `bin/pdlc.mjs:35-42` invokes `launch()`, which resolves for `dev`/`queue` only, `exec`s the resolved store entry and refuses on the four operator-declaration branches (`cli.mjs:993-1025`, `REFUSING_REFUSAL_IDS` at `:302-307`). End-to-end legs per branch: pinned-and-installed execs the **pin**, not the highest (`launch-wiring.test.js:188-215`); pinned-and-missing runs *nothing*, exits 1, names the pin **and** what is installed (`:225-241`); unpinned resolves `0.10.0` over `0.3.0` by semver (`:243-260`); the child never re-resolves, garbled marker included (`:273-289`) |
| F-03 | High | **Resolved** | `runStartupChecks` now threads `devDeclared` (`lib/startup.mjs:346,366-372`) and `formatStartup` renders `result.notices` (`:505-523`) — deliberately at the one rendering function all six surfaces share, not per call site. `--dev` is in the closed flag set for `dev`, `queue` and `doctor` (`cli.mjs:115-127`). The oracle asserts the notice is **emitted** (`launch-wiring.test.js:429-450`), which is the positive half AC-5.6 needs; asserting "resolved elsewhere" would have been satisfied by the silence AC-5.6 forbids |
| F-04 | High | **Resolved** | `provenanceFor` reads the resolution off the marker (`cli.mjs:553-574`); `markerValueFor`/`launchMoveFor` put it there (`:309-331`). The agreement oracle now exists: a released unpinned run is asserted `mode === "latest"` **and** `!== "dev"`, with `Mode: latest` in the artifact-borne block (`launch-wiring.test.js:377-396`); a pinned run stamps `pin` and names it (`:398-406`). The round-1 `undefined` leak in `engineVersion`/`pluginCompat` is separately pinned (`:408-421`) |
| F-05 | Medium | **Resolved** | `scripts/fixture-machine.mjs` gains a real `version-ladder` leg (`:306-320`, `legVersionLadder` at `:658+`) over a real `pdlc` on `PATH`, real child processes and real exit codes, registered in `SKIP_INVENTORY` with `unverifiedInvariants: ["AT-5.1","AT-5.2","AT-5.4","AT-5.5"]` (`:163-170`) and wired into the runner's gated-leg list (`:786-795`) — not inventory-only. The refusal leg asserts "no engine ran" **positively** (`expected.engine: null`), not by absence of failure |
| F-06 | Low | **Resolved** | `cli.mjs:462-465` now states the condition: `…or with PDLC_PLUGIN_ROOT=<path> together with --dev (the variable alone is ignored — DEC-EDIST-04)` |
| F-07 | Low | **Partly resolved** | T51/T52/T56 are ✅ and committed (`832b4c70`); the working tree no longer carries an uncommitted PLAN. The broader ledger gap survives — see F-03 (v2) |


## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | The empty-store **dispatching** arm is the one launcher outcome with no test leg, and it is also the one that departs from the approved spec. `launchMoveFor` excludes `store.empty` from `REFUSING_REFUSAL_IDS` (`pdlc/engine/bin/cli.mjs:302-307`), so `pdlc dev` on an empty store runs in place. Driven directly, that is what happens: `launch(["node","pdlc","dev",…])` with an empty store took the in-process arm (`runMain` once, `exec` zero), logged the branch text, and set `PDLC_RESOLVED_ENGINE={"mode":"unresolved","version":null,"pin":null}`. The behaviour is defensible and I am not asking for it to change — but `launch-wiring.test.js` covers pin/latest/dev/refuse/marker arms and not this one, so the single arm that diverges from TSPEC §6.2 is the single arm no oracle observes. One leg asserting *in-process + announcement emitted + `mode: "unresolved"` stamped* closes it | AC-5.2, AC-5.5 |
| F-02 | Medium | Local | The announcement that arm prints is branch 7's **refusal** wording, reused as a proceed notice, so it advises against the thing it is doing: `no engine version is installed; run the documented install command to populate the version store **before running pdlc**` — printed immediately before `pdlc` runs the pipeline. On `--version`/`doctor` the wording is right (nothing runs); on `dev`/`queue` it tells an operator the run is not happening while it happens. AC-5.2 is met in the "never silent" sense, but the operator-facing text names the wrong outcome. A proceed-variant of the message (`…running in place as vX; install to the version store to pin a version`) makes the shipped behaviour legible | AC-5.2 |
| F-03 | Low | Process | The PLAN completion ledger still under-reports the branch. T51/T52/T56 are now ✅, but T05…T50 remain ⬚ across the table while their work is on the branch and green (e.g. T50's `.github/workflows/fixture-machine.yml` exists, T48's `_provenance` carrier is wired at `cli.mjs:667,717,740`). Only the three `[manual]` rows are ticked, so a DoD reader taking the committed PLAN as the completion record sees a feature that has barely started. Inherited, not introduced this round; wave-mode ledger state lives in the untracked `.claude/pdlc-wave-state.json`, which is precisely why the committed record needs a one-pass reconciliation before ship | — |
| F-04 | Low | Local | The workflows-side oracle named in round 1's remedy #4 is still presence-only: `pdlc/workflows/__tests__/devModeKinds.test.js` asserts the mark appears on each kind, never that the stamped mode equals the resolved one. The agreement oracle now exists engine-side (`launch-wiring.test.js:377-406`), so AC-5.3 is genuinely covered and this is not a gap in the guarantee — but the two suites now disagree about what the mark means, and the weaker one is the one a future edit will read first | AC-5.3 |

### F-01/F-02 — the arm that departs from the spec is the arm nothing watches

Two things are true at once and only one of them is a code finding.

The **product** behaviour is right. `bin/pdlc.mjs` ships beside a complete `lib/` and
`vendor/` tree, so "no store entry" does not mean "no engine" — it means the only installed
engine is the one already running. Refusing there would deny an operator a run the engine can
perform, and would make every surface conditional on a store that AC-2.1's one-command install
is not required to have populated (`postinstall.mjs` does populate it; R-B's `--ignore-scripts`
is the case in question). Running in place, announced, with `mode: "unresolved"` stamped, is
the outcome I would choose.

The **record** is not right, and that is an upstream matter rather than a verdict on this
code: TSPEC §6.2 still specifies a *thin* launcher and cites branch 7 refusing as the R-B
scenario, DECISIONS:235 repeats "thin launcher" and DECISIONS:516 states branch 7 refuses. The
implementation's own comment (`cli.mjs:286-301`) says the departure was "raised as an erratum
against TSPEC §6.2 and DEC-EDIST-03" — but no such change is in either document, so today the
only place the decision exists is a code comment. Errata are filed below rather than folded
into this verdict.

What *is* a finding here is the pair the departure leaves behind: no oracle over the shipped
arm (F-01), and a message that contradicts the arm it announces (F-02). Neither blocks: the
guarantee AC-5.2 asks for — never silent — holds, observably.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Round-1 Q-01 is answered by the work rather than by a document: REQ-EDIST-05's execution half was not deferred, it was unwired, and it is now wired. Nothing to carry forward — recording the resolution so the next reader does not re-open it. |
| Q-02 | The `store.empty` departure (F-01) was decided inside an implementation wave and recorded in a code comment. Is the operator content for it to land as a TSPEC/DECISIONS erratum in this run, or should it become its own `DEC-EDIST-` row given it changes what "thin launcher" means for the whole distribution story? |
| Q-03 | Unchanged from round 1 and still worth one shared fix rather than two per-oracle defences: `documentOracles.test.js` walks untracked trees (it skips only `.git/` and `node_modules/`), so a local `.claude/worktrees/` checkout reddens a document oracle for reasons no diff explains. CI is green; this is a local-ergonomics item, not a finding. |

## Positive Observations

- **Every round-1 High was closed by wiring the production edge, not by widening a test.** The
  fix for F-01/F-02 is four lines of dispatch (`bin/pdlc.mjs:35-42`, `cli.mjs:909-919`) plus a
  launcher that sits *above* `main()` rather than inside `cmdDev` — which keeps `main(argv,
  deps)` the same five-seam in-process entry the existing suite drives, so nothing already
  proven had to be re-proven. That is the cheapest possible shape for this repair.
- **The new legs assert the arm first, by count, then the argument.** `assert.equal(calls.exec.length, 0)`
  *and* `assert.equal(calls.runMain.length, 0)` before anything about the message
  (`launch-wiring.test.js:233-234`) is what makes the AC-5.5 refusal leg a real oracle: the
  defect it guards is a silent fallback, and a message assertion alone would pass on a run that
  refused loudly and then ran anyway.
- **F-04's fix is proven through the real `provenanceFor`, not around it.** The leg injects the
  store, the five-member `deps` seam and the engine's own version, then lets `launch()` set the
  marker and the real `main()` build provenance (`launch-wiring.test.js:313-371`) — the one
  function under test is the one not stubbed. It also asserts the *negative* (`!== "dev"`) and
  the *positive* (`=== "latest"`, `Mode: latest` in the block) on the same path.
- **The fixture-machine leg refuses to infer.** `legVersionLadder` stubs only the far end (which
  engine ran), keeps `PATH`, the child process and the exit codes real, and asserts the refusal
  case as `expected.engine: null` — so a child that failed to start for an unrelated reason
  cannot pass as a refusal. This is the leg whose absence let round 1's unwired path stay green.
- **Two findings I did not raise were closed anyway, in the right place.** `prepack`'s
  process-entry guard became a pure exported predicate with both polarities asserted
  (`scripts/prepack.mjs:60-70`, `run.test.js`), and the publish failure path now redacts
  `NODE_AUTH_TOKEN` out of npm's own stderr before it is printed
  (`scripts/publish-preflight.mjs:313-336`) — a credential-in-logs hole on the one path that
  runs when a real publish goes wrong.

## Recommendation

**Approved with minor changes** (0 High, 2 Medium, 2 Low).

All four round-1 High findings are resolved on the shipped path, and I verified each by
running the CLI rather than by reading the diff: `--version` answers, the pin executes, an
uninstalled pin refuses naming both the pin and what is installed, the ignored env var is
announced, and a released run is stamped `latest` — not `dev` — in the block the consumer's
POSTMORTEMs and `QUEUE.md` rows carry. REQ-EDIST-05's operator surface exists now, and the
revision broke nothing: both suites are in the same state as round 1 (743 engine tests green,
the workflows red being the same known local false positive).

What I would still do, none of it gating:

1. One leg over the empty-store `dev` arm — in-process, announcement emitted, `mode:
   "unresolved"` stamped (F-01). It is the only launcher arm with no oracle, and the only one
   that departs from the approved TSPEC.
2. A proceed-variant of the empty-store message, so the run being performed is not announced
   with the words for a run being refused (F-02).
3. Reconcile the PLAN ledger with the branch in one pass before ship (F-03) — the committed
   record currently says almost nothing landed.
4. When convenient, lift `devModeKinds`'s oracle from presence to agreement so the two suites
   say the same thing about what the dev mark means (F-04).

Errata against TSPEC and DECISIONS are emitted separately; they concern the record of the
`store.empty` decision, not this code.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
