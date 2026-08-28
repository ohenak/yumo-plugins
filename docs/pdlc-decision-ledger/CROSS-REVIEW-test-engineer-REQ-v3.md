# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.2, `ba52b2460`)
**Date:** 2026-08-28
**Iteration:** 3
**Scope:** Delta re-review over `CROSS-REVIEW-test-engineer-REQ-v2.md`. Diff base `34beffcbc` (v1.1, the bytes v2 reviewed) → `ba52b2460`. Changed sections only: header table, §2 G-1/G-2/G-4, §4 C-5, §5 REQ-DECLEDGER-01/03/04/06/08, §6 R-5, §7 O-1, A-1. Unchanged sections already approved in v2 were not re-litigated.

## Round-2 finding disposition

| v2 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-12 | High | **Not resolved (re-filed as F-16)** | The edit replaced the per-file scope rule with a per-decision one — right direction — but the rule now turns on "whatever carries the id (heading or bullet)" while O-1 routes *"which id carriers are recognised"* to TSPEC. AC-01 still promises set equality. The load-bearing exemplar is also false at HEAD (see F-16). Expected set at HEAD is still reader-dependent: 41, 46 or 48. |
| F-13 | Medium | **Resolved** | REQ-DECLEDGER-06 now names one observable — "**The observable is the prompt text**, as in REQ-DECLEDGER-03; the reviewer's prose is the intended effect, not an asserted outcome." A tester now asserts against rendered prompt text and nothing against generated prose. The `DEC-LOOPECON-06` reconciliation survived intact. |
| F-14 | Medium | **Resolved** | Two halves both landed: AC-01's set equality is now explicitly over the **rendered** set ("the in-scope set after REQ-DECLEDGER-07's budgeting"), and C-5's `maxEntries` moved `40` → `60` with a HEAD-measured rationale, so the default no longer drops a line on day one. A-1 and R-5 were re-split accordingly (`maxEntries` measured, `maxBytes` still an analogy) rather than left claiming both are unmeasured. The residual is narrower and non-gating — see F-18. |
| F-15 | Low | **Resolved** | G-2's heading now reads "one key with G-1 — C-3", so no TSPEC reader can infer a fourth switch behind "requires G-1"; it points at the enumeration that forbids one. |

**Verification of new/changed claims against HEAD (not against the document):**

- C-5's "41 ids under `docs/_decisions/`" — confirmed for the **heading-only** reading: `grep -rhoE '^#{1,6} +DEC-…' docs/_decisions/*.md` = 41.
- C-5's "largest feature record (14)" — confirmed: `docs/completed/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` carries 14 `## DEC-` headings, the maximum across all non-project `DECISIONS-*.md`.
- G-1's "at HEAD `DEC-AWG-Q1`…`Q5` are bullets in `DECISIONS-advisory-wave-gate-questions.md`" — **not confirmed; false at HEAD** (F-16).
- REQ-DECLEDGER-04's re-pointed `learningsInjection` fail-open precedent and NG-6's engine precedents were verified in round 2 and are untouched by this diff.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
