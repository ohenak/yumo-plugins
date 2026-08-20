# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.1)
**Date:** 2026-08-20
**Iteration:** 1

## Verification performed at HEAD

Every claim below was re-measured on `feat-pdlc-learnings-injection`, not read off the document.

| PLAN claim | Result |
|---|---|
| `MERGE_CONFIG_PATH` `:48`, `parseAdvisoryConfig` `:1964`, `reviewLoop` `:7266`, `dispatchAndVerify` `:8862`, `main` `:12022`, `buildFinalReport` `:15240`; 15,311 lines | **all six exact**, line count exact |
| `consolidate-learnings.js` `LS_FILES_ARGV` `:1338`, `enumerateCorpus` `:1349` | exact; `enumerateCorpus` is `export async function`, `LS_FILES_ARGV` module-private |
| `helpers/seams.js` `fakeFs` `:245`, `fakeGit` `:413`; `helpers/consolidationDoubles.js` re-export `:35` | exact |
| every `learnings*.test.js`, `helpers/learningsFixtures.js`, `fixtures/learnings-baseline/` is new | confirmed absent under `pdlc/workflows/__tests__/` |
| repo root has no `scripts/`; `.gitignore` is 599 B; `git check-ignore -v .baseline-worktree` exits non-zero | all three confirmed (exit 1) |
| `buildFinalReport` already takes `notices = []`; `...(advisory ? { advisory } : {})` precedent | both confirmed (`orchestrate-dev.js:15259`, `:15309`) |
| `advisoryDisabled.test.js` uses `import mainDev, * as dev from "../orchestrate-dev.js"` | exact, at `:70` |
| `documentOracles.test.js` carries a prior feature's `AT-22`/`AT-23` names — the namespacing premise | exact, at `:75` and `:79` |
| arrangement's `testCommand` / `postWaveCommand` / `postWavePathspecs` | exact, `.claude/pdlc.config.example.json` |
| baseline: `1 failed, 98 passed, 99 total` / `2 failed, 70 skipped, 3851 passed, 3923 total` | **reproduced exactly** (26.4 s); both failures are the two named `documentOracles` tests |
| `pdlc/engine`: `pass 841 / fail 3` | **reproduced exactly** |
| P-2a's four `dispatchKind: "authoring"` sites | four exist, but see F-12 — only three are `dispatchKind:` key sites (`:12861`, `:12955`, `:13657`); the fourth is a positional `"authoring"` at `:7663` |

The measured-baseline section is the strongest part of this document: it is the rare PLAN whose
numbers reproduce to the digit, including the engine failures that block the gate before this
feature's suites ever run.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | Batches 7–13's gate is stated as "full suite green", but the PLAN's own rows admit suites stay red across those batches. The gate as written halts the wave at batch 7 | §Verification "The two gate wordings"; LI-15, LI-20 |
| F-02 | High | Local | `LI-T-SUITEMAP` has no red mechanism at batch 6 and no causal path by which LI-15 greens it. Batch 6's RED-terminal gate is unsatisfiable as worded | §Batches LI-14, LI-15; §Traceability TSPEC-local table |
| F-03 | High | Local | `LI-T-WORKTREE`'s load-bearing second conjunct (`git worktree list` shows no entry) is unfalsifiable under the injected-seam driving TSPEC §T.3 prescribes; with `_git` faked it degrades to an argv assertion and cannot distinguish `rm -rf` — the exact false green it exists to prevent | §Batches LI-03, LI-05 |
| F-04 | High | Local | LI-06 authors the baseline digest guard **green** over its own capture: no red predecessor and no falsification step for the feature's most load-bearing oracle | §Batches LI-06; §Traceability TSPEC-local row 6 |
| F-05 | High | Local | LI-01 owns no file and sits in a batch whose gate is "full suite green" — satisfiable without performing the task. The premise pre-flight that H-1/H-2 depend on is a vacuous green | §Batches LI-01; §Dependencies ladder batch 1 |
| F-06 | Medium | Local | `LI-T-IGNORE` is a single-conjunct oracle: an unanchored or over-broad `.gitignore` rule passes it, so LI-04's explicitly promised root anchoring has no oracle | §Batches LI-03, LI-04 |
| F-07 | Medium | Local | The §T.7 twelve-arm inventory — which TSPEC makes *the* coverage obligation for this region — is discharged by human inspection in LI-22, with no artifact and nothing that reds when an arm goes unentered | §Traceability fail-open inventory; §Batches LI-22; DoD 3 |
| F-08 | Medium | Local | `scripts/capture-learnings-baseline.mjs` is a new module outside `pdlc/workflows/package.json`'s `c8.include` and outside the `--per-file --branches 85` gate; no task owns `package.json` | §File-ownership manifest; DoD 11 |
| F-09 | Medium | Local | DoD 11 asserts `npm run test:coverage` is "unchanged from baseline expectations", but §The measured baseline never measured it — the one unmeasured gate in an otherwise measured section | §Verification; DoD 11 |
| F-10 | Low | Local | §Overview's change-surface table omits `learningsBaselineGuard.test.js` and LI-06 from the "all new" suite row | §Overview change surface |
| F-11 | Low | Local | "Fifteen files, fifteen distinct owners" does not reconcile with the two tables above it (16 file rows, LI-06 owns two, 21 distinct owners) | §File-ownership manifest closing line |
| F-12 | Low | Local | LI-01's P-2a phrasing ("the four `dispatchKind: \"authoring\"` sites") does not match HEAD's shape: three are `dispatchKind:` key sites, the fourth is a positional argument. A literal pre-flight grep halts on a premise that in fact holds | §Batches LI-01 |

### F-01 (High) — the source-lane gate contradicts the source-lane rows

§Verification's gate table assigns batches 1, 4 and **7–14** the gate "Full suite green under the
arrangement's `testCommand`, with the documented pre-existing exclusions and no others."

The task rows say otherwise, in their own words:

- LI-15 (batch 7): "`learningsConfig.test.js`'s AT rows stay red until LI-21" — i.e. until batch 13.
- LI-20 (batch 12): "Greens `learningsDispatchSet.test.js` **except its report-shape rows**".

Both are correct as engineering: red suites authored in batches 2–6 green one lane at a time.
What is wrong is the gate. Under the wording as written the wave halts at batch 7 and stays halted
through batch 12, and the halt is indistinguishable from a real regression. §Verification also
forbids the obvious workaround — "No exemption list grows during this feature… Adding a third to
make a batch pass is a halt condition" — so the implementer has no conforming move.

**What must change:** replace the single "full suite green" wording for batches 7–13 with a
per-batch **expected-red ledger**: for each of batches 7…13, the exact suites (and, where a suite is
split across two green tasks, the exact test-name prefixes) that are still expected red, plus the
requirement that no *other* test's status changes. Batch 14 keeps the unqualified green gate. The
ledger must shrink monotonically — a batch that leaves more red than its predecessor allows is a
failure. This is the same instrument as the batch 2–6 RED-terminal wording, applied to the mixed
batches, and without it the document's own DoD item 4 cannot be evaluated batch by batch.

### F-02 (High) — `LI-T-SUITEMAP` is red for no stated reason and green for no stated cause

LI-14 sits in batch 6, which §Batches declares RED-terminal with the gate "the new tests **fail for
the specified reason** — the symbol under test is not defined yet, or `.gitignore` lacks the rule".
`LI-T-SUITEMAP` has no symbol under test: it asserts the six suites' hand-transcribed AT lists are
pairwise disjoint, set-equal to the 35-member literal, and match the `LI-AT-` names registered in
each suite file. All six suite files exist and register their names at the end of batch 5. So the
test is **green on authoring**, and batch 6's declared terminal state cannot be reached.

The mirror defect is in LI-15, which claims "Greens `LI-T-PIN-1` and `LI-T-SUITEMAP`". LI-15 adds
constants and a config reader to `orchestrate-dev.js` and, per the file-ownership manifest, writes
no test file. There is no mechanism by which it changes a suite-map assertion's outcome. `LI-T-PIN-1`
is different and correct: it reds because `LEARNINGS_CORPUS_ARGV` does not exist, and LI-15 defines
it. `LI-T-SUITEMAP` has been carried along in the same clause without the same story.

**What must change:** pick one and say it. Either (a) LI-14 is a **green-terminal** task — move it
out of the RED-terminal set, state that its terminal state is green over the six authored suites,
and delete the "Greens `LI-T-SUITEMAP`" clause from LI-15; or (b) `LI-T-SUITEMAP` is specified to
also assert something LI-15 creates (e.g. that every `LI-AT-` name maps to a doc type in
`LEARNINGS_TARGET_DOCTYPES`), in which case name that conjunct in LI-14's row so the red reason is
checkable. Option (a) is the smaller change and loses nothing: the suite map's value is regression
pressure over the life of the region, not a red-then-green episode.

### F-03 (High) — the worktree oracle cannot falsify the thing it exists to catch

TSPEC §T.3 states the obligation-2 oracle as two conjuncts — the path is absent **and**
`git worktree list` shows no entry — and, three paragraphs later, that "neither needs a real capture
run… (2) drives the script with an injected failing seam". LI-03 transcribes the two conjuncts and
inherits the ambiguity without resolving it, which is the PLAN's job: the row is what an implementer
executes.

If `_git` is a fixture double, then `git worktree list` is answered by the double, and the assertion
reduces to "the script called `git worktree remove`" — an argv oracle. An `rm -rf` implementation
fails that argv oracle, so the test is not vacuous; but the conjunct TSPEC calls "load-bearing" —
the **administrative entry under `.git/worktrees/`** — is never observed, and an implementation that
issues `git worktree remove` against the wrong path, or after the process has already been torn
down, passes. Conversely, if `git` is real, the test performs `git worktree add` against the
developer's live repository, which is a working-tree mutation the feature's own NG-1/AC-5.2
discipline (DoD 8) refuses everywhere else.

**What must change:** LI-03 states the instrument explicitly — a **dedicated temporary git
repository created by the test and used as the script's `cwd`**, with a **real** `git`, the throw
injected through the script's *fixture/import* seam (not `_git`), and the post-condition read from
that temp repo's real `git worktree list`. That gives both conjuncts a real referent, keeps the
developer's tree untouched, and costs one `git init` per test. If the PLAN instead intends the argv
reading, say so and re-state the conjunct as an argv assertion — but then §T.3's `rm -rf`
distinction is no longer proven and that must be recorded, not implied.

### F-04 (High) — the baseline guard is authored green and never demonstrated to fail

§Traceability's TSPEC-local table gives the baseline digest guard the red column value
"— (authored green over the fresh capture)". Everything else in the feature has a named red first;
this one oracle — the anchor for DoD item 4, halt condition H-4, and every byte-identity claim in
the feature — is written after the artifact it guards, from that artifact, and is never observed
failing. A guard that has only ever been green is not yet known to be a guard: a transcription slip,
a digest computed over the wrong bytes, or an assertion accidentally scoped to an empty key set all
look identical to success.

The design around it is right — hand-transcribed literals per DC-14, checked against both the
recomputed digests and `MANIFEST.json`, set equality over `{caseId}` keys rather than containment.
The missing piece is a falsification step, and it is cheap.

**What must change:** LI-06's row gains an explicit, gated mutation proof, performed before the
commit and recorded in the task's completion note:

1. Flip one byte in one committed baseline `.txt` → the digest assertion for that `{caseId}` reds;
   restore.
2. Delete one whole `{caseId}` directory → the **set-equality** assertion reds (this is the conjunct
   containment would have let pass); restore.
3. Add a spurious `{caseId}` directory not in the transcribed literals → set equality reds; remove.

Each of the three targets a different clause, so all three are needed. Without them the guard's
strength is asserted by the document rather than by the suite.

### F-05 (High) — batch 1 passes without anyone doing LI-01

LI-01 carries the whole premise pre-flight — P-1, P-2a, P-3, P-4, P-7/P-8, P-10 and the change-
surface table — plus the triage of the three `pdlc/engine` failures that block the arrangement's
`testCommand` before this feature's suites are reached. Its `Test File` and `Source File` columns
are both `—`, and §Dependencies gives batch 1 the terminal state "green (assertions over HEAD)".

There are no assertions over HEAD. Batch 1's gate, per §Verification, is "full suite green" — which
is exactly the state of the tree before LI-01 runs (modulo the documented pre-existing failures). A
wave that skipped LI-01 entirely would show the same gate result as one that performed it. Halt
condition H-1 ("an LI-01 premise no longer holds") therefore has no detector, and H-2's CI-evidence
decision has no artifact a later reviewer can find.

Two of the premises do get pinned later by other rows — P-4 by `LI-T-PIN-1` at batch 2, part of P-2a
by the composition-site set equality at batch 12 (H-5 relies on precisely this) — which shows the
mechanism is available and affordable.

**What must change:** give LI-01 an artifact and a falsifiable gate. Concretely: a new non-AT suite
(e.g. `__tests__/learningsPremises.test.js`, owned by LI-01, batch 1, added to the file-ownership
manifest) carrying one assertion per premise, each phrased structurally rather than positionally —
the count of authoring dispatch sites, `MODULE_NAMES`' exact membership, `dispatchAndVerify`'s
parameter names, `buildFinalReport`'s `notices` parameter, `enumerateCorpus`'s export. It is green
at batch 1 by construction and, unlike a one-time human read, it stays green — or reds the moment a
rebase moves a premise mid-wave, which is what H-1 is for. The engine-triage half of LI-01 is not a
test; it needs a named written artifact (a line in the task's completion note citing the CI run) so
the H-2 decision is auditable.

### F-06 (Medium) — `LI-T-IGNORE` cannot see the anchoring it is paired with

LI-03 states the oracle as one conjunct: `git check-ignore .baseline-worktree` exits 0 at the
repository root. LI-04 promises rather more than that — `/.baseline-worktree/`, "root-anchored the
way `/.claude/pdlc.config.json` already is, so a nested fixture directory of that name is
untouched". Nothing asserts the second half. A bare `.baseline-worktree` line, or `*`, or
`.baseline*`, all pass the stated oracle while breaking the property LI-04 exists to preserve — and
an over-broad rule would silently un-track fixture material this feature is about to commit under
`__tests__/fixtures/`.

**What must change:** LI-T-IGNORE gets its paired conjuncts, all three checkable with the same
`git check-ignore` probe: (1) `.baseline-worktree` at the root **is** ignored; (2) a nested
`pdlc/workflows/__tests__/fixtures/x/.baseline-worktree` is **not** ignored; (3) an unrelated
sibling path (e.g. `pdlc/workflows/__tests__/fixtures/learnings-baseline/`) is **not** ignored. (2)
and (3) are the positive-pairing this feature demands everywhere else.

### F-07 (Medium) — the coverage obligation is discharged by reading, not by running

TSPEC §T.7 and this PLAN both accept that the `--per-file --branches 85` gate cannot see a ~300-line
region inside a 15,311-line file (verified: `pdlc/workflows/package.json:9`, `c8.include` is the
three module files), and both conclude that the twelve-arm fail-open inventory **is** the coverage
obligation. The inventory in §Traceability is good work — every arm has a named entering AT and task.
But its discharge is LI-22 "walked row by row", a human reading in a refactor task, producing no
artifact. Nothing reds when an arm silently stops being entered — for instance when a fixture edit
in LI-11 makes the `RSN-EMPTY` path unreachable, or when the outer `try/catch` arm's fault injection
stops reaching the catch after LI-18's refactor.

**What must change:** make the inventory mechanical, cheaply. The catalogues are already frozen
literals in TSPEC §D.1, so the instrument is a set-equality test, not a coverage tool: one non-AT
test (owned by LI-14 or a new row before LI-22) that accumulates the reason codes actually observed
across the new suites' runs — `corpusOutcome` values and `rejected[].reason` values, plus the two
`NTC-*` notices — and asserts the observed set **equals** the frozen catalogue. Set equality, not
containment, so both a missing arm and an invented code red. If that accumulation is judged too
invasive, the fallback is P-Q-3's region-scoped `c8` invocation with a hard `--branches 85` on the
region — but taken unconditionally, not "only if it costs nothing".

### F-08 (Medium) — the new capture script sits outside every coverage gate

`scripts/capture-learnings-baseline.mjs` is new production-adjacent code — it drives `main()`,
shells out to `git`, and writes committed fixtures. `pdlc/workflows/package.json`'s `c8.include` is
`["orchestrate-dev.js", "orchestrate-queue.js", "build-runtime.mjs"]`, all resolved relative to
`pdlc/workflows`, so the new script is measured by nothing. Two named oracles cover two of its
behaviours; its argument handling, merge-base resolution, manifest writing and per-file digesting
are covered by neither a floor nor an inventory. `pdlc/workflows/package.json` also appears in no
row of the file-ownership manifest, so adding it to `c8.include` currently has no owner.

**What must change:** decide explicitly and record it. Either add the script to the coverage gate —
which requires a `package.json` row in the manifest, owned by a batch-3 task alongside LI-05 — or
state the exemption in DoD 11 with its justification (a human-invoked one-shot tool) *and* name the
oracles that stand in its place. Silence is the one option that leaves a new module ungated.

### F-09 (Medium) — DoD 11's coverage gate has no measured baseline

§The measured baseline measures `npm test` in both packages to the digit. DoD 11 then requires
`npm run test:coverage` to pass "both stages, unchanged from baseline expectations" — a comparison
against a baseline this document never took. `test:coverage` is a two-stage command
(`pdlc/workflows/package.json:9`) whose stage 2 applies `--per-file --branches 85` to
`orchestrate-dev.js` itself; adding a ~300-line region with twelve fail-open arms to that file moves
that number, and nobody currently knows in which direction or from what.

**What must change:** run `npm run test:coverage` at HEAD and record its stage-2 per-file numbers in
§The measured baseline beside the two suite counts, so DoD 11 names a real prior value. If the
command does not currently pass at HEAD, that is a second H-2-shaped pre-flight item for LI-01 and
belongs in the halt table.

### F-10 (Low) — the change-surface table's new-suite row omits LI-06's files

§Overview's change-surface table lists "the seven suites of TSPEC §T.5, plus `learningsSuiteMap.test.js`
and `learningsCaptureScript.test.js` … **all new**", owned by "LI-03, LI-07…LI-14".
`learningsBaselineGuard.test.js` and `__tests__/fixtures/learnings-baseline/` are LI-06's, and LI-06
is outside that owner range; the fixtures subtree gets its own row but the guard suite does not
appear at all. The file-ownership manifest is complete and correct, so this is a transcription gap
in the summary, not a real ownership hole — but the change-surface table is the one a reviewer greps.

### F-11 (Low) — the manifest's closing arithmetic does not reconcile

"Fifteen files, fifteen distinct owners across the two tables" does not match the tables: the two
tables carry 16 file rows (4 + 12), one of which (`dist/pdlc-cli.mjs`) is deliberately unowned, LI-06
owns two rows, and the distinct-owner count across both tables is 21 of the 22 tasks (LI-01 owns
none — see F-05). The audit itself is sound and its load-bearing claim — "the only multi-owner file
is `orchestrate-dev.js`, and its eight owners occupy eight different batches" — is true. Restate the
closing sentence so the count a reader checks matches the tables above it.

### F-12 (Low) — P-2a's pre-flight will halt on a premise that holds

LI-01 asks the implementer to assert "the four `dispatchKind: \"authoring\"` sites". At HEAD there
are three sites spelled that way — `orchestrate-dev.js:12861`, `:12955`, `:13657` — and a fourth
that is a positional `"authoring"` argument to `runWrapped` at `:7663`. A literal grep therefore
returns 3 and, under H-1's wording ("a premise no longer holds — e.g. … a fifth
`dispatchKind: "authoring"` site exists"), halts the feature on a premise that is in fact intact.
Restate the premise by shape — "three object-literal `dispatchKind: \"authoring\"` sites plus the
positional argument at the review-loop optimizer call" — which is also the phrasing the
premise-pin suite of F-05 would assert. (TSPEC's own anchors for these sites are stale; routed as an
erratum, not charged to this document.)

## Questions

| ID | Question |
|----|---------|
| Q-01 | Which rows of `learningsDispatchSet.test.js` are the "report-shape rows" LI-20 does not green and LI-21 does? Naming them (by `LI-AT-` id) is a precondition for F-01's expected-red ledger, and AT-23/AT-24/AT-31 read like the intended set — but the row leaves it to inference |
| Q-02 | Does `LI-T-SUITEMAP` read each suite's registered test names by static parse of the file text, or by importing the suite? The two have different failure modes at batch 6 (a static parse is green immediately; an import may throw on a missing symbol) and F-02's disposition depends on the answer |
| Q-03 | Which repository do LI-03's `git check-ignore` and `git worktree list` probes run against — the developer's live checkout, or a temp repo? DoD 8 puts every other git-touching instrument in a dedicated temp repository; these two rows are silent |
| Q-04 | LI-05's capture script (repo root, `.mjs`) imports the L3 fixture matrix from `pdlc/workflows/__tests__/helpers/learningsFixtures.js`. Is that import direction intended to be permanent, and does anything stop the helper from acquiring a jest-only dependency (`expect`, `jest.fn`) that would break the script? A one-line note in LI-02 ("no jest globals in this helper") would pin it |
| Q-05 | Batch 3's terminal state is described as "mixed" — LI-04/LI-05 green their own oracles while LI-07…LI-09 are red. Is the dispatcher's batch gate able to express a mixed terminal state at all, or does batch 3 need the same per-suite ledger F-01 asks for in batches 7–13? |

## Positive Observations

- **The batch column re-derives cleanly.** I recomputed `batch == max(dep batch) + 1` for all 22
  rows from the declared `Deps` edges: every one matches the column, ids are unique, every
  dependency resolves, and the graph is acyclic. LI-14 → six suites → batch 6, and LI-15's
  `Deps` of LI-06/LI-13/LI-14 → batch 7, are the two that most easily go wrong and both are right.
- **T-O-2 is bound structurally, not by memory.** LI-15 → LI-06 is a single edge that makes "no
  production edit before the capture" a property of the DAG. H-3 then names the failure mode if it
  is ever violated. This is the correct way to encode an ordering obligation.
- **No same-batch same-new-file collision exists.** Batch 2 (three distinct new files), batch 3
  (`.gitignore`, the new script, three distinct suites), batch 5 (three distinct suites) and the
  serial source lane 7–14 are all single-writer, and the manifest states the invariant it audits.
  The "`Test File` means the suite this task must green, not the suite it writes" note is exactly
  the disambiguation that prevents a phantom second writer.
- **Every green task has a red predecessor referencing the same suite** — LI-04/LI-05 → LI-03,
  LI-16 → LI-07, LI-17 → LI-08, LI-18 → LI-09, LI-19 → LI-10, LI-20 → LI-11, LI-21 → LI-12, and
  LI-15 → LI-13/LI-14. TDD order holds across the whole table.
- **Set equality over containment, repeatedly and deliberately** — the baseline `{caseId}` keys, the
  composition-site probe on both operands, the BR-8 row-field set, the two-member notice set, the
  suite-map partition, and H-5's refusal to relax the composition-site equality to containment.
  This is the discipline that makes a deleted case fail rather than disappear.
- **No implementation echoes.** AT-33's expected read set is hand-transcribed from the fixture's
  scripted `ls-files` stdout "never derived from `gatherLearningsCorpus`"; AT-05's rendered form is
  transcribed from TSPEC §OQ.1 rather than keyword-matched; the composition-site expectation and the
  baseline digests are hand-transcribed. Each of these is a place a lazier PLAN would have imported
  the answer from the code under test.
- **Absence-only oracles are refused where it matters.** LI-11's "loop is live" material asserts
  positive membership, LI-19's `corpusDiverged` is pinned to `false` (never `null`) on the first
  dispatch, and LI-10 is explicit that `runMirror` is asserted by *nothing* because upstream leaves
  it unconstrained — refusing to over-assert is as much testing discipline as refusing to
  under-assert.
- **The measured baseline reproduces exactly**, including the three `pdlc/engine` failures that halt
  the arrangement's `testCommand` before this feature's suites run, and the PLAN routes them to an
  LI-01 triage with H-2 rather than guessing. `.gitignore`'s missing rule, the absent `scripts/`
  directory, and the prior feature's `AT-22`/`AT-23` names in `documentOracles.test.js` all check
  out — the last of which justifies the `LI-` namespacing rule that runs through the whole document.
- **`dist/` is correctly left unowned**, with the arrangement's `postWaveCommand` /
  `postWavePathspecs` cited and verified in `.claude/pdlc.config.example.json`. Giving it a task row
  would have manufactured the very multi-writer race the manifest exists to prevent.

## Recommendation

<!-- pending -->
