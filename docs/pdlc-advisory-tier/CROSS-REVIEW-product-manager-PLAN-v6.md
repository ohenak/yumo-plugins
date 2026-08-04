# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md
**Date:** 2026-08-04
**Iteration:** 6 (delta confirmation — Phase PR erratum round)
**Scope of this round:** delta confirmation only. Base `bc6dccf` (the PLAN v1.5 bytes approved in
v5) → head `7097b57` (PLAN v1.6). Sections outside that diff are not re-reviewed.

## Erratum items under confirmation

Ten erratum lines were routed to this PLAN (PM ×2, SE ×3, TE ×5); they collapse into four distinct
defects. Each is confirmed against the delta and against the upstream document it cites.

| # | Erratum (raised by) | Where the delta lands it | Confirmed |
|---|---|---|---|
| E-1 | A1's `verifyGate` had two representations — PLAN §8.2 / §3 A-07 / §3 A-31 said `verifyGate == null`, TSPEC §5.5/§6.3 (at the time) said `async () => ({ passed: true })` (PM, SE, TE) | `deada89`. PLAN keeps **`null`** and cites `TSPEC §5.5/§6.3` for it in all three places; §8.2 now states the mutation **in both directions** — for a seam that declares a gate, *replacing* it with the passing stub must fail the case; for A1, which declares none, *installing* that stub must fail it. A-31's row carries the same wording. | ✅ resolved, and the upstream half is closed too: TSPEC §5.5's A1 row (`TSPEC:653`) now reads **`null`** — "Deliberately **not** `async () => ({ passed: true })`: that is the trivially-passing stub FSPEC T-03-6(b) treats as a falsifying mutation". One representation, one meaning for the stub. |
| E-2 | §6.5's P-4 closure conjunct was stated over the eight-member `ADVISORY_REFUSAL_REASONS`, so it could not falsify a classifier returning `low-confidence` / `budget-exhausted` (PM, SE, TE) | `c5c3b4c`. §6.5's P-4 and §3's A-06 row both now state `result.reason ∈ {"prohibited-action","revert-on-test-touch","out-of-envelope"} ∪ {null}`, transcribed from `classifyEnvelope`'s declared return, and say explicitly why the two sets differ and where the eight-member closed-set assertion still lives (T-03-8). | ✅ resolved. Verified against `TSPEC:530` — the JSDoc `@returns` line reads `reason ∈ {"prohibited-action","revert-on-test-touch","out-of-envelope"} \| null`. The property is now falsifiable in exactly the way the erratum asked for; no other PLAN site still states the eight-member form for `classifyEnvelope`. |
| E-3 | `pdlc/workflows/__tests__/fixtures/scanFixtures.js` (PROPERTIES §2.1, §13.1 item 5) had no owner and no §4 manifest row; the Phase I wave commit stages only `task.files` (`orchestrate-dev.js:8143-8159`), and `validatePlanContract` requires the row before Phase I (SE, TE) | `1bd7268`. A-01 owns it — §3's A-01 Test File cell and §4's A-01 manifest row both name it, with the batch-safety-rule-4 rationale (shared test prerequisite, created serially in batch 1, every consumer strictly downstream via A-02) and the staging/`validatePlanContract` reason stated inline. | ✅ resolved. Task table and manifest each carry 36 rows, so the bijection holds; no other task claims the path or its parent directory, so the ownership-disjointness partition is unchanged. §10 records the re-parse (36/36, ok, 20 batches). |
| E-4 | §8.3 note 2 raised an erratum against TSPEC §7.4 for naming a case id outside FSPEC's T-06-1…T-06-6 catalogue — a discrepancy that no longer exists (TE) | `43e1c3a`. The note now records the **closure**: TSPEC §7.4 states the A4 no-`testCommand` test carries no FSPEC case id, so the obligation is tagged by task id (A-10 unit → A-23; A-10 → A-25 phase integration) rather than by a manufactured `T-06-7`/`T-06-8`. | ✅ resolved. Verified against `TSPEC:937-938`: "**This test carries no FSPEC case id.** FSPEC §18.1's T-06 catalogue is exactly T-06-1 … T-06-6, and this TSPEC does not extend it". The note describes the world as it now is. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
