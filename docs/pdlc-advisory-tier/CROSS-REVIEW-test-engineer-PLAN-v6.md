# Cross-Review: test-engineer — PLAN (delta confirmation, Phase PR erratum round)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md (v1.6)
**Date:** 2026-08-04
**Iteration:** 6
**Scope:** Delta confirmation only — the five erratum items routed to this document after my v5
approval, plus a check that the edit broke nothing I previously approved. Unchanged sections are not
re-reviewed.
**Diff reviewed:** `bc6dccf..7097b57` (five commits: `1bd7268`, `c5c3b4c`, `deada89`, `43e1c3a`,
`7097b57`)

## 1. Routed items — disposition

The five routed items collapse to four distinct defects (each was raised by two or three reviewers).
All four are resolved, and each resolution is grounded against the document it was supposed to agree
with — I checked every citation rather than trusting the changelog.

| # | Item (raisers) | Disposition | Evidence I checked |
|---|---|---|---|
| 1 | A1's `verifyGate`: `null` vs `async () => ({ passed: true })` — §8.2 + §3 A-07/A-31 rows (PM, SE, TE) | **Resolved, and resolved in the direction that keeps the mutation falsifying** | The conflict was real and is now settled *both* ways: TSPEC v1.3 (`TSPEC:655`, `:740`) declares A1's `verifyGate` as **`null`**, "deliberately not `async () => ({ passed: true })`", and PLAN `:258`/`:282`/`:869` now cite TSPEC §5.5/§6.3 and say the same. One representation (`null`), one meaning for the passing stub (the mutant). PLAN `:869` additionally states the mutation in **both** directions — replace, for a seam that declares a gate; install, for a seam that declares none, with A1's case required to fail when it is installed. That is the stronger form: it keeps a falsifying oracle at a seam that has no gate to stub, which the previous text did not. |
| 2 | §6.5 P-4's closure conjunct stated over the eight-member `ADVISORY_REFUSAL_REASONS` (PM, SE, TE) | **Resolved at both sites** | `TSPEC:532`'s JSDoc declares `reason ∈ {"prohibited-action","revert-on-test-touch","out-of-envelope"} \| null` — three members. PLAN `:779` (P-4) and `:257` (A-06's row) now transcribe exactly those three and name the citation. The revision also says *why* the two sets differ and where the eight-member set-equality assertion still lives (T-03-8, §8.2), so the constant is not left unasserted. P-4 can now falsify a classifier returning `low-confidence` or `budget-exhausted`; before, it could not. |
| 3 | `pdlc/workflows/__tests__/fixtures/scanFixtures.js` has no ownership row (TE, SE) | **Resolved, and mechanically verified** | The file is now in A-01's Test File cell (`:252`) and in §4's manifest (`:308`), with the rationale stated in the terms that matter: the wave commit stages only `task.files` (`orchestrate-dev.js:8143-8159`) and `validatePlanContract` requires the row before Phase I. I re-ran the gate against the current bytes: `parsePlanTasks` ⇒ 36 tasks, `validatePlanContract` ⇒ `{"ok":true}`, `computeTopologicalBatches` ⇒ 20 batches. A-01 is the only owner of the path, so no same-batch same-new-file collision is introduced. |
| 4 | §8.3 note 2 describes a TSPEC discrepancy that no longer exists (TE) | **Resolved** | `TSPEC:937-938` now states the A4 no-`testCommand` test **carries no FSPEC case id**, that FSPEC §18.1's T-06 catalogue is exactly T-06-1…T-06-6, and that no downstream document invents `T-06-7`/`T-06-8`. PLAN `:880-886` now records the erratum as closed and tags the obligation by task id (A-10 unit → A-23; A-10 → A-25 phase integration) instead of by a manufactured case id. The two-test split (unit + phase integration, neither subsuming the other) is unchanged and still correct. |

**Nothing I previously approved was weakened by these four edits.** The batch DAG, the un-skipper
rule, the file-ownership manifest bijection and the red/green pairing all still hold — I re-derived
the first and the third mechanically above. Every edit was additive at the sentence level; no task
row, dependency edge or batch number moved.

One defect is introduced by the delta, and it is the same defect class the round just closed, one
seam over. See F-01.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
