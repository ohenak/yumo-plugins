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

## Questions

<!-- pending -->

## Positive Observations

<!-- pending -->

## Recommendation

<!-- pending -->
