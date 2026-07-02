# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/harden-harvest-guard/PLAN-harden-harvest-guard.md (v1.1)
**Date:** 2026-07-02
**Iteration:** 2

Upstream baseline: REQ v1.7 · FSPEC v1.4 · TSPEC v1.1 · DECISIONS v1.2 — unchanged since iteration 1; the four header cites still match.

## Verification of iteration-1 findings

| Prior finding | Status | Evidence |
|---|---|---|
| F-01 (Medium) — B3 mutual interference: TASK-06's green checkpoint ran jest on `guardMatrix.test.js` mid-write by TASK-05, and TASK-05's 🔴 verification spawned the guard script mid-rewrite by TASK-06 | **Resolved** | TASK-06's Depends-on is now `TASK-03, TASK-05`; B3 = {TASK-05, TASK-07} and the serial chain shifts to B4–B9 (11 batches). Both interference directions are gone: TASK-05 red-verifies against a guard nothing in B3 writes (rewrite starts at B4), and TASK-06 (alone in B4) runs jest on a `guardMatrix.test.js` that is fully written. The batching rule itself is strengthened to the reading my finding demanded — "never write, execute, or red/green-verify against the same file," explicitly covering Test-File execute targets and checkpoint-spawned scripts — so the fix is structural, not just this one edge. |
| F-02 (Low) — DoD/TASK-14 demanded "four self-audit meta-tests" while TASK-03's folded-conjunct shape produced three | **Resolved** | The CFD-7 dispatch-map key-equality is split out of meta-test (1) into a standalone meta-test (4) — the alternative shape CFD-7 sanctions verbatim ("fourth conjunct of meta-test 1, **or a meta-test 4**"). TASK-03 now defines (1), (2), (4); TASK-04 defines (3); DoD bullet 2 attributes all four to their tasks; TASK-14's "four self-audit meta-tests" is now literally checkable by counting `it()` titles across the two suites. Meta-test (1) retains the length-vs-Set duplication check, so nothing was weakened by the split. |

## New-defect scan (v1.0 → v1.1 delta, mechanical)

- **DAG re-derivation (11 batches):** for all 14 tasks, `batch == max(dep batch) + 1` holds — 01/02→B1; 03/04 (deps B1)→B2; 05 (dep 03)→B3; 07 (dep 04)→B3; 06 (deps 03, 05: max B3)→B4; 08→B5; 09→B6; 10→B7; 11→B8; 12 (deps 11, 05: max B8)→B9; 13→B10; 14→B11. Graph acyclic, every dep resolves, max parallelism 2 (≤ 5). No desync between the Depends-on column and the Batch overview.
- **Within-batch disjointness under the strengthened rule:** B1 (two distinct helper files), B2 (TASK-03 writes `guardMatrix.test.js`/executes the guard; TASK-04 writes `hookCompatibility.test.js`/executes `check-scope-field.sh` — post-migration that file spawns only the scope check, verified against the current PROP-COMPAT-04 block), B3 (TASK-05 writes `guardMatrix.test.js`/executes the guard; TASK-07 writes `check-scope-field.sh`/executes `hookCompatibility.test.js`) — all pairwise disjoint. No task's checkpoint executes a file another same-batch task writes.
- **Incremental `--self-test` restructure (TE F-01 option (a)) coverage-checked:** family arithmetic is exact — tokenizer 11 + segmenter 11 + heredoc 5 (TASK-08, 27 cases) + verb-identifier 11 (TASK-09) = 38 = `SELF_TEST_MIN_CASES`, and the segmenter decomposition (7 connectors incl. `|&` + quoted operators + nested quotes + 2 group openers) matches the TSPEC § 6.6 corner enumeration. § 6.6's "calls the § 3.5 functions directly — no JSON envelope, no git, no fs" confirms the TASK-08/09 checkpoints are genuinely runnable before the decision engine exists. TASK-10 is explicitly declared the only checkpoint-less chain task with an enumerated regression gate (which includes the equivalent direct `--self-test` count ≥ 38 check), and nothing that TASK-12 previously landed was dropped — its audit retains the § 6.6 uncovered-corner sweep, the CFD-1 "pick one, don't stack both" gate verification, and the output contract. No requirement coverage moved out of the plan; the DoD still binds every REQ-GUARD-05 acceptance criterion, the 38 floor, and the four meta-tests.
- **Requirement landing unchanged:** the v1.1 delta touches batching, checkpoint sequencing, meta-test shape, red-verification wording, and the floor constant only. The iteration-1 landing map (REQ-GUARD-01–07, NFR-01, FSPEC-GUARD-01–06, CFD-1–CFD-8, M-row partition, `M33_RERUN_IDS` verbatim) was re-spot-checked and is intact — no row, criterion, or CFD obligation dropped or narrowed. TE Q-02's acceptance (untested wrapper no-interpreter self-test branch) is a test-scope call on a production-unreachable branch (hooks pass no argv, C16) and does not touch matrix accounting — no product objection.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| — | — | — | None. | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | (Editorial, no action required for dispatch) TASK-08 says the jest self-test binding "stays red until the TASK-12 floor is met," but the 38-case floor is reached at TASK-09 — the binding test will in fact pre-pass from TASK-09 onward and is merely *asserted* at TASK-12. This is consistent with the plan's own "green at TASK-N = assertion point / rows may pre-pass" convention, but the se-author may want to reword "TASK-12 floor" → "floor (reached at TASK-09, asserted at TASK-12)" in a future touch so no implementing agent misreads early greenness as a violation. Likewise TASK-04's Source File parenthetical "and the guard" is stale post-migration (carried from v1.0; harmless — no B2/B3 interference either way). |

## Positive Observations

- Both iteration-1 fixes are structural rather than cosmetic: the serialization lands as a dependency edge plus a strengthened batch rule that generalizes beyond the flagged pair, and the meta-test split adopts a CFD-7-sanctioned shape with the duplication check preserved.
- The incremental self-test landing gives every serial-chain task except the explicitly-declared TASK-10 a directly invocable green gate, and the disposition table maps every iteration-1 finding (PM and TE) to a verifiable change in the task table — nothing was dispositioned by prose alone.
- `SELF_TEST_MIN_CASES = 38` is now derivation-bound with a mandatory comment at the declaration, converting CFD-6 from a letter-of-the-law floor into a real emptied-table tripwire.

## Recommendation

**Approved**

The re-batched 11-batch DAG is mechanically sound, both prior findings are resolved at the root, and the self-test restructure introduces no coverage or dependency defect. Nothing blocks dispatch to tech-lead/se-implement.
