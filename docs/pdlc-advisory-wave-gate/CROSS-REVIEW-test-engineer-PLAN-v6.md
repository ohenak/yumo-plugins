# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-19
**Iteration:** 6 (delta confirmation on erratum round 4, PLAN v1.4)
**Scope:** Delta confirmation. Routed items re-checked; PLAN re-measured against upstream at HEAD (TSPEC v1.10) and against the branch as it actually runs.

## Overview

The erratum edit answers the routed question directly and, on the two items it was asked to
settle, answers it well. `e3b9d5a3`'s early landing is now described as the state of the branch
rather than as future work; the revert-vs-keep fork TSPEC §1.3/§6 routed here is decided in the
document ("keeps them and re-derives") with three measured reasons rather than a preference; and
A6-00 is restated as *discharged by verification* with an argument — existence-only assertions
cannot be masked by seam-cardinality drift — that survives inspection.

I re-measured every load-bearing number in the new text. Nearly all of them hold:

- `advisoryWaveGate.test.js` exists and is **green** at HEAD (verified by running it), and its
  export-existence table matches A6-00's row name for name, all thirteen.
- Seven of the eight coupled surfaces already assert six members; the single untranscribed residue
  is exactly `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality against `["A1" … "A5"]`,
  with its sibling `test.each` already retargeted — as the document says.
- No `toHaveLength(5)` remains in any advisory suite.
- The failure split is exact: 19 failures across `advisoryEnvelope`, `advisoryConfig` and
  `advisoryRecord`, plus 5 across `advisoryDriver`, `advisoryHarvest`, `advisoryDisabled` and
  `advisoryQueueSeams` — 24, every one a production-side absence closed by A6-05's green step.

What the round did not do is measure the branch **outside** the advisory suites. The wave gate's
configured command ignores `documentOracles`; the DoD's own command and CI do not. Run the way the
DoD and CI run it, HEAD is red in two more places, both caused by the same commit the round chose
to keep, and neither closed by any task in this plan. That is F-01, and it is the reason this
confirmation cannot approve.

## Batches

Re-derived mechanically from the task table at HEAD (`batch == max(dep batch) + 1`):

| Task | Deps | Dep batches | Derived | Column | OK |
|---|---|---|---|---|---|
| A6-00 | — | — | 1 | 1 | yes |
| A6-01 | — | — | 1 | 1 | yes |
| A6-04 | — | — | 1 | 1 | yes |
| A6-05 | — | — | 1 | 1 | yes |
| A6-06 | A6-04 | 1 | 2 | 2 | yes |
| A6-08 | A6-00, A6-05 | 1, 1 | 2 | 2 | yes |
| A6-10 | A6-08 | 2 | 3 | 3 | yes |
| A6-12 | A6-10 | 3 | 4 | 4 | yes |
| A6-14 | A6-12 | 4 | 5 | 5 | yes |
| A6-18 | A6-14 | 5 | 6 | 6 | yes |
| A6-21 | A6-18 | 6 | 7 | 7 | yes |

**The routed batch-column item is resolved.** Graph is acyclic, ids unique, every dependency
resolves to a declared task, and no column understates its derivation. The A6-00/A6-04/A6-05 rows
keep their wave-1 slots for reasons the document now states rather than assumes: A6-00 because its
answer is the precondition for trusting the drift analysis, A6-04 because it is test-only on a
channel the wave gate does not run, A6-05 because its green step is what closes the inherited red.

Same-batch same-new-file check, batch 1 (the only batch with parallelism): A6-00 owns
`advisoryWaveGate.test.js` (and is told not to re-create it), A6-01 owns
`helpers/advisoryDoubles.js`, A6-04 owns the new `pdlc/engine/__tests__/advisory-config-example.test.js`,
A6-05 owns the eight advisory suites plus `orchestrate-dev.js`. No two batch-1 tasks create or
append the same file, and single-writer-per-file-per-batch holds for `orchestrate-dev.js`
throughout. A6-08's later write to `advisoryWaveGate.test.js` is batch 2, serialized behind A6-00.

## Dependencies

**Upstream fidelity (DEC-ERR-03 re-read).** TSPEC is at v1.10; the PLAN's v1.4 changelog names that
version and the re-grounding it carries. The routing claim is faithful: TSPEC §1.3 does end its
HEAD-drift table with "revert `e3b9d5a3`'s test-side edits and let Phase I redo them in PLAN order,
or keep them and re-derive PLAN's A6 batches around what already landed … a PLAN decision, not a
TSPEC one", and TSPEC v1.10's changelog repeats that the choice "is PLAN's and Phase I's to make".
The PLAN now makes it explicitly. TSPEC's own residue table — production `ADVISORY_SEAMS` still
five, `ENVELOPE_DEFAULTS` still four, `ADVISORY_DEFAULTS.waveBudgetPerRun` absent — matches what I
measured, and matches A6-05's green step item for item.

One upstream instruction did **not** come through. TSPEC v1.10's changelog records that "§1.3's
four row-count pins and its PROP-DIS-06 pin are re-anchored to stable content per DEC-DOC-01 (they
had drifted with `e3b9d5a3`)". The PLAN's batch-1 gate wording — a line this round rewrote — still
carries the drifted numeric pins. That is F-02.

Two upstream couplings I checked and found intact:

- `ADVISORY_SEAM_PHASES` stays module-private per TSPEC §3.1, and its A6 row is proved
  behaviourally through PROP-REC-07's escalation-entry oracle rather than a constant assertion.
  TSPEC assigns that to PLAN A6-17; the v1.3 merge folds A6-17 into A6-18, and the AT map still
  routes AT-06-3/-5/-6 to A6-18 in `advisoryEscalationLog.test.js`. No coverage lost in the merge.
- A6-04's widening to assert **both** `enabled` and `waveBudgetPerRun` is consistent with TSPEC
  §4.4/E-33 and with A6-06 shipping the pair; the DoD's engine leg now says in full which command
  runs it and why the wave gate never does.

## Verification

Everything below was run on this branch at HEAD.

**1. The pre-flight gate is green, and green for the right reason.**
`npm test -- __tests__/advisoryWaveGate.test.js` passes. Its thirteen assertions are
`expect(mod[name]).toBeDefined()` — existence only, no shape — so the seam-cardinality drift
cannot mask a baseline break, and a red there still means what A6-00's row says it means. The
routed "does A6-00 still discriminate" question is answered correctly, and the answer is
structural, not incidental.

**2. The advisory suites are red exactly as the document enumerates.**
Running the nine suites the document names: `advisoryWaveGate` and `consolidationProperties` pass;
the other seven fail with 24 failures. Split: `advisoryConfig` 14, `advisoryEnvelope` 4,
`advisoryRecord` 1 (= 19), `advisoryDriver` 1, `advisoryHarvest` 2, `advisoryDisabled` 1,
`advisoryQueueSeams` 1 (= 5). Every named cause is present and production-side:
`ADVISORY_SEAMS` five-member, `ENVELOPE_DEFAULTS` four-member, `ADVISORY_ROOT_CAUSES` and
`A6_PROHIBITIONS` absent, `waveBudgetPerRun` absent, and `advisoryDriver`'s PROP-GATE-06 comparing
a six-key `GATE_EXCLUSIVITY_REGISTRY` against the five-member constant. The `19 + 5` claim is
exact.

**3. The whole-suite picture is not the one the document describes.**
`cd pdlc/workflows && npm test` at HEAD: **9 suites failed, 28 tests failed**, 3846 passed. The
two extra suites are `documentOracles.test.js` and `consumerCleanup.test.js`, and neither appears
in the plan's enumeration:

- `documentOracles.test.js` T15 asserts
  `readdirSync(__tests__).filter(.test.js).length === 99`. Tracked count at `e3b9d5a3^` was **99**;
  at `e3b9d5a3` and at HEAD it is **100**. The extra file is `advisoryWaveGate.test.js` itself.
  This test was green before the early landing and is red because of it.
- `documentOracles.test.js` PROP-SWEEP-2(b) reports 25 unswept paths, of which the tracked ones are
  the 14 `.claude/workflows/.pdlc-backups/*.bak` files: `0` tracked at `e3b9d5a3^`, `14` at HEAD.
  Same commit. (The rest of that diff — `.serena/cache/…`, `.tokensave/tokensave.db` — is local
  tool cache, the known `coveredViolations` whole-tree walk, and not attributable to the branch.)
- `consumerCleanup.test.js` AT-4.1 asserts `git status --porcelain` is empty and reports
  `M .claude/workflows/.pdlc-drift-state.json` — a tracked file a session hook rewrites with a
  fresh timestamp. Environmental rather than authored, but in wave-gate scope. That is F-03.

**4. Why the round missed items in (3), and why it matters.**
`implementation.testCommand` is
`cd pdlc/workflows && npm test -- --testPathIgnorePatterns … 'documentOracles'`. Measured through
that command, the plan's enumeration is complete and the wave-1 gate reasoning holds. But the
document's own DoD requires `cd pdlc/workflows && npm run test:coverage`, which is
`c8 npm test -- --runInBand` with **no** ignore patterns, and `.github/workflows/pr-tests.yml`'s
unit-tests job runs that same `npm run test:coverage`. Both run `documentOracles`. So the two reds
in (3) do not halt a wave — they fail the DoD and turn the PR red, and no task in this plan closes
either. No workflows-side test file is created by any A6 task (A6-04's new file is under
`pdlc/engine`), so the count stays at 100 through the end of the feature while the oracle stays
pinned at 99. That is F-01.

**5. Batch-1 anchors do not resolve at HEAD.**
The four row-count sites cited as `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`,
`advisoryHarvest.test.js:571` and `:726` are, at HEAD, at `:629`, `:634`, `:578` and `:733`; the
cited lines now hold a `describe` title, a `_readAdvisoryConfig` double, a `_git` double and a
`pushCalls` assertion respectively. `helpers/advisoryDoubles.js:271`'s `SEAMS` literal is at
`:354`. F-02 and F-05.

**6. The inherited-red framing itself is sound.**
"Confirm the failing set is exactly the listed one — not produce it" is the right oracle for a wave
that opens red, and it is falsifiable because the document commits to a count (19 + 5) and to named
causes. Fix F-01 and this framing becomes checkable end to end.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | The keep-and-re-derive rationale's third bullet — "Every failure at HEAD is a *production*-side absence, and every one is supplied by A6-05's green step" — is false as stated, and the enumeration behind it is incomplete. Measured with `npm test`: 28 failures across 9 suites, not 24 across 7. The two unlisted suites are red because of the very commit this round chose to keep: `documentOracles.test.js` T15 pins the `__tests__/*.test.js` count at 99 and `e3b9d5a3` took it from 99 to 100 by landing `advisoryWaveGate.test.js`; PROP-SWEEP-2(b) reports the 14 `.pdlc-backups/*.bak` files the same commit tracked (0 → 14). Neither is production-side, neither is closed by A6-05 or any other task, and no A6 task adds or removes a workflows test file, so the count stays 100 to the end of the feature. They escaped the enumeration because it was measured through `implementation.testCommand`, which carries `--testPathIgnorePatterns … 'documentOracles'` — but the plan's own DoD (`npm run test:coverage`) and `pr-tests.yml`'s unit-tests job both run without those patterns. As written the feature cannot satisfy its own DoD and cannot land a green PR. The remedy is a decision, not a wording fix: either the keep branch acquires an explicit task that closes both (bump the T15 literal to 100 with the reason recorded, untrack the `.bak` blobs), and the third bullet is restated as "every failure *in the advisory suites*", or the revert option is re-opened now that its cost/benefit includes these two. | §1.3 HEAD-drift note, third bullet ("No re-batching is required"); DoD checklist |
| F-02 | Medium | Local | Batch 1's gate wording — rewritten this round — still pins the four bare row-count sites at `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571` and `:726`. Those lines drifted with `e3b9d5a3`; at HEAD the assertions are at `:629`, `:634`, `:578` and `:733`, and the cited lines hold unrelated code. Upstream already corrected this exact class: TSPEC v1.10's changelog records that "§1.3's four row-count pins and its PROP-DIS-06 pin are re-anchored to stable content per DEC-DOC-01 (they had drifted with `e3b9d5a3`)". The PLAN's compression of that upstream kept the drifted form. Re-anchor to content (`expect(result.advisory.rows).toHaveLength(6)` in each named file) as TSPEC did; the sites remain recoverable via the documented `advisory.rows` + `toHaveLength` grep, which is why this is Medium and not High. | Batch-1 gate wording; §1.3 |
| F-03 | Medium | Cross-Feature | `consumerCleanup.test.js` AT-4.1 asserts `git status --porcelain` is empty and is **inside** the wave gate's scope. It is red at HEAD on `M .claude/workflows/.pdlc-drift-state.json`, a tracked file a session hook rewrites with a fresh `generatedAtUtc` on every session. A wave boundary can therefore go red for a reason no task owns and no implementer can attribute — and batch 1's new wording instructs that "any failure outside that set is drift to escalate", which would escalate this. Wave 1's inherited-red paragraph should either name this failure as expected-and-unowned or state a tree-clean precondition for the gate. Not caused by this feature, which is why it is tagged Cross-Feature rather than Local. | Batch-1 gate wording, "Inherited red (HEAD drift)" |
| F-04 | Low | Local | A6-01 still describes "the `SEAMS` literal retargeted to six members (`helpers/advisoryDoubles.js:271`)" as work to do. At HEAD that literal is already six-member and sits at `:354`. A6-00 received an explicit "already landed and green at HEAD … discharged by verification" note this round; A6-01, whose file was touched by the same commit, did not. Give it the same treatment so the implementer is not looking for an edit that is already made. | A6-01 row |
| F-05 | Low | Local | A6-00's row (edited this round) says of `pathsCollide` that "A6-05 exports it if and only if A6-07 ends up importing it directly", while the landed file the row now certifies says in its header comment "A6-05 exports only `computeWaves` directly". The row instructs the implementer to "confirm the export list still matches this row", so a divergence between row and file is a trap at exactly the moment the row asks for a comparison. Reconcile the two wordings. | A6-00 row vs `advisoryWaveGate.test.js:16`–`:18` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | For F-01: does bumping `documentOracles.test.js`'s T15 literal from 99 to 100 belong to this feature at all? The comment above it ties the literal to another feature's sweep ("only holds once T15's deletions … land"). If that sweep is in flight, the two features are now coupled through a single integer and the fix needs an owner named in one plan or the other — otherwise both sides will assume the other bumps it. |
| Q-02 | For F-01: are the 14 tracked `.claude/workflows/.pdlc-backups/*.bak` files intended to stay tracked? TSPEC v1.10 recorded them as hygiene "not fixable in this document" and routed nothing. If they are untracked in Phase I, PROP-SWEEP-2(b) closes for free; if they stay, that oracle stays red for the life of the branch. |
| Q-03 | For F-03: is the wave gate expected to run against a clean tree? If yes, say so in the batch-1 wording; if no, `consumerCleanup.test.js` AT-4.1 will fail intermittently at every wave boundary in this shared tree, not just wave 1's. |

## Positive Observations

- The revert-vs-keep decision is *made*, not deferred, and made on measured grounds. The three
  reasons are each independently checkable, and I checked each one: the pre-flight gate is green,
  seven of eight surfaces already read six with `advisoryRecord.test.js`'s equality the single
  residue, and the `19 + 5` failure split is exact to the test. That is unusually good evidence
  discipline for an erratum round.
- A6-00's restatement answers the routed question structurally rather than by assertion: because
  the gate asserts existence and never shape, seam-cardinality drift provably cannot mask baseline
  rot. The row also says "do not re-create the file", which is the instruction the merged-task
  structure needed.
- "Observe the red in-session" is correctly re-read as "confirm the failing set is exactly the
  listed one — not produce it", with escalation for anything outside the set. That converts an
  inherited red from a hazard into a checkable precondition, and it is a falsifiable oracle because
  the document commits to both a count and named causes.
- The stale-test-name note ("a red test whose name contradicts its assertion is the next reader's
  trap") catches something a batch re-derivation alone would have missed. I confirmed the residue:
  `advisoryDisabled.test.js`'s `PROP-DIS-05` still reads "reports five zero rows" over a
  `toHaveLength(6)`, and `advisoryHarvest.test.js`'s T-08-6 still says "report still five seams".
- The batch column survives re-derivation unchanged, and the DoD's engine leg now states which
  command runs it and why the wave gate cannot see it — closing the v4 finding cleanly.

## Recommendation

## Verdict
