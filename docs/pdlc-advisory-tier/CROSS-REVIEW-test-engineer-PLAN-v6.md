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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The A1 fix stops one seam short: A3 also declares `verifyGate: null`, and §8.2 still tells the RED author to stub a gate A3 does not have.** The same TSPEC erratum round that settled A1 settled A3 identically — `TSPEC:657` gives A3 "**`null`** — same shape as A1: `permittedActions: []`, step 6 unreachable, `resolved` never reached", `TSPEC:865` repeats it in §7.2's member table, and `TSPEC:434` states it for both seams together. PLAN §8.2's T-03-6 row (`PLAN:869`) was updated for A1 only and now asserts three things that are false for A3: (i) the per-seam case is "with that seam's gate stubbed to fail the disposition is never `resolved`, and with the gate replaced by `async () => ({ passed: true })` the case fails" — A3 has no gate to stub or replace; (ii) "**A1 is the direction that runs backwards**" — A1 *and* A3 are; (iii) "A3 and A4 ⇒ block `A-23 — A3/A4 gate exclusivity` (**A-23 lands both gates**, batch 10)" — A-23 lands one gate (A4's); its own §3 row (`PLAN:274`) correctly gives A3 only `permittedActions: []` with throwing `apply`/`revert` stubs. This is not a wording nit: §8.2 is the row A-07 authors the RED block from, and PROPERTIES already predicted the exact failure mode — "Asserting conjunct 1 at A3 would require stubbing a gate A3 never reaches and observing a disposition A3 cannot produce — it would fail against a correct build, in the RED batch (A-07) that authors it, and not be diagnosed until A-23" (`PROPERTIES:568`). A3's gate-exclusivity case would therefore be authored red-against-correct, or silently written vacuous, and AC-4.6's mutation control would be lost at one of five seams. **Fix (one sentence, no scope change):** generalise the sentence you just added — say that A1 **and A3** declare no gate, so for both the mutation is to *install* `async () => ({ passed: true })` and the case must fail; both assert `verifyGate === null` plus `resolved` unreachable on every path, terminating in `escalated`/`no-action` with its own O-1 triple (PROPERTIES §6 PROP-GATE-01…05 already states this form verbatim — transcribe it). Correct "A-23 lands both gates" to "A-23 lands A4's gate and A3's gateless seam", and drop "A1 is the direction that runs backwards" in favour of "A1 and A3 run backwards". | §8.2, `PLAN:869`; cf. `PLAN:274`, `TSPEC:434`, `:657`, `:865`, `PROPERTIES:559-568` |
| F-02 | Low | Local | **Citation slip in the same sentence F-01 touches.** `PLAN:869` cites "TSPEC §5.4's five `verifyGate` rows". §5.4 is *Prohibitions — structural, not asserted* (`TSPEC:630`); the five-row per-seam gate table is **§5.5** (`TSPEC:650-660`), which is what the rest of the document (and `PLAN:258`, `:282`) cites. Pre-existing, not introduced by this delta, but the F-01 fix rewrites that clause anyway — repoint it while you are there. | §8.2, `PLAN:869` |
| F-03 | Low | Local | **PROPERTIES §12.3 and §13.1 item 5 are now stale in this document's favour, and nothing in the PLAN says so.** `PROPERTIES:1045` still lists `fixtures/scanFixtures.js` as "A-01 proposed — **no PLAN ownership row yet**", and §13.1 item 5 (`PROPERTIES:1126-1129`) still routes that as an open erratum against the PLAN. Item 3 above closed it. No action is required of the PLAN author beyond awareness — I am recording it here so the PROPERTIES author can strike the item on its next touch rather than have a reviewer re-raise a defect that has been fixed, and so harvest does not preserve a closed erratum as durable signal. I am deliberately **not** emitting an `ERRATUM: PROPERTIES:` line for a note that has already been overtaken by the fix it asked for. | §4, `PLAN:308`; `PROPERTIES:1045`, `:1126-1129` |

## Questions

## Positive Observations

## Recommendation

## Verdict
