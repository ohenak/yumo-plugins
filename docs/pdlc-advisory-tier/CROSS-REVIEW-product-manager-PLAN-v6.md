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

No High and no Medium findings. Two Low findings, both about pointer accuracy in text the delta
touched — neither changes scope, task count, dependency edges, or any acceptance criterion.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | §8.2's T-03-6 row cites "**TSPEC §5.4's five `verifyGate` rows**" as the home of the gate table. TSPEC §5.4 (`TSPEC:630`) is *Prohibitions — structural, not asserted* (P-1…P-4); the five-row gate table is TSPEC **§5.5** (`TSPEC:648-658`). The parenthetical's *content* is right — the five rows it lists are FSPEC §5.4's gate table, which is where the "A1 none / A2 next-invocation triage / A3 DOD verify / A4 rebase+tests / A5 rollup read" wording comes from — only the TSPEC section number is off by one. Fix: cite "FSPEC §5.4's gate table; TSPEC §5.5's five `verifyGate` rows". Cheap, and it matters because the erratum this round just settled turned on reading exactly those two TSPEC sections. | AC-4.5 (FSPEC §5.4 gate table) |
| F-02 | Low | Cross-Feature | **A3's gate is now represented two ways across the document set — the same defect class E-1 just closed for A1, one seam over.** FSPEC §5.4's gate table gives A3 a gate ("Phase DOD's verify step" → "no findings remaining"), and this PLAN is faithful to it: §3's A-07 row puts A3 in block `A-23 — A3/A4 gate exclusivity` "each need that seam's `verifyGate` to exist", §8.2 says "A-23 lands **both** gates", and A-23's own row does not declare A3 gateless. TSPEC v1.3 (`TSPEC:655`) now declares **`verifyGate: null`** for A3 — "same shape as A1: `permittedActions: []`, step 6 unreachable, `resolved` never reached". Both cannot hold: an implementer following TSPEC ships A3 with `verifyGate: null`, and PLAN's A3 gate-exclusivity case (stub-the-gate-to-fail, then replace-with-passing-stub) has no gate to exercise. **The defect is upstream, not here** — the PLAN follows FSPEC, and FSPEC is the approved product contract — so it is routed as `ERRATUM: TSPEC` rather than as a PLAN revision, and the PLAN's Low is only this: once TSPEC resolves, §3's A-07 row and §8.2 must state A3's direction explicitly the way they now state A1's (declares-none ⇒ *installing* the passing stub must fail the case), rather than leaving A3 inside the undifferentiated "A3+A4 … both gates" phrasing. | AC-4.5, AC-4.6 / BR-6 (FSPEC:1024) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROPERTIES §13.1 item 5 and its §10 table row still record `fixtures/scanFixtures.js` as "A-01 proposed — **no PLAN ownership row yet**". E-3 closed that gap in this PLAN (A-01 owns it, §4 row present), so the PROPERTIES open item is now stale. It is a PROPERTIES-side bookkeeping correction, not a PLAN one, and PROPERTIES is still in its own review loop — flagging it here only so it is not carried into harvest as an open item. |
| Q-02 | On F-02: is A3's gate a product decision either document may make? FSPEC §5.4 states A3's gate as "Phase DOD's verify step / no findings remaining", which is an outcome an operator can observe; TSPEC's `null` reasons from `permittedActions: []`. If TSPEC's reading is the correct one, the change belongs in FSPEC's gate table first (A3 row → "none", with A3's safety resting on its classification-only product, as A1's rests on A1-3) — not in TSPEC alone, because AC-4.5's five-row table is the approved contract this PLAN's T-03-6(b) quantifies over. |

## Positive Observations

- **The A1 fix was made in the one place that makes it stick, and in both directions.** The delta did
  not simply flip PLAN's assertion to match TSPEC; it named the asymmetry — replace-the-gate for a
  seam that declares one, install-the-stub for a seam that does not — so `async () => ({ passed: true })`
  now has exactly one meaning across TSPEC and PLAN: the mutant. That is the shape of fix that stops
  the same contradiction from re-forming at the next seam.
- **E-2's resolution kept the strong assertion and moved it, rather than dropping it.** Narrowing P-4
  to `classifyEnvelope`'s three-member enum could have quietly lost the closed-set check over the
  eight-member `ADVISORY_REFUSAL_REASONS`; §6.5 explicitly re-homes it in T-03-8's set-equality case
  and says why the two sets differ. Nothing testable was traded away to close the erratum.
- **E-3 was closed with the mechanism named, not just the row added.** The A-01 row states *why* the
  file needs an owner (wave commit stages only `task.files`; `validatePlanContract` checks the
  bijection before Phase I) and *why A-01* (batch-safety rule 4, batch 1, consumers downstream via
  A-02). The next reader does not have to reconstruct the reasoning.
- **E-4 was closed as a closure, not by deletion.** §8.3 note 2 now records that the discrepancy was
  raised, that TSPEC answered it, and what the obligation is tagged by instead — so the audit trail
  survives while the stale claim does not.
- **Scope discipline held.** 36 tasks, 36 manifest rows, unchanged dependency edges and batch labels;
  the manifest gained one file on an existing row. §10's v1.6 entry states exactly that and records
  the re-parse (36/36, ok, 20 batches). Nothing in the delta touches a requirement, an acceptance
  criterion, or a phase boundary.

## Recommendation

**Approved**

The delta resolves all four distinct erratum defects (E-1 … E-4), each verified against the upstream
document it cites rather than against the erratum text alone, and it breaks nothing this reviewer
approved at v5: no requirement, acceptance criterion, task, dependency edge, batch label, or phase
boundary changed, and the task↔manifest bijection still holds at 36/36.

Two Low findings stand (F-01 pointer, F-02 A3 gate representation). Per the approval rules, Low-only
⇒ this would be "Approved with minor changes"; the delta-confirmation contract asks whether the
erratum edit resolves the items without regression, and it does, so this round is recorded as
**Approved** with F-01 and F-02 carried forward:

- **F-01** is a one-line citation correction; fold it into the next PLAN touch, no round of its own.
- **F-02** is not a PLAN defect. It is emitted as an erratum against TSPEC — see the `ERRATUM: TSPEC`
  line in this reviewer's response. The PLAN follows FSPEC §5.4's gate table, which is the approved
  product contract; TSPEC v1.3's A3 `verifyGate: null` is what diverged from it. If the resolution
  goes the other way (A3 genuinely has no gate), that is a **FSPEC** change first — see Q-02 — and
  the PLAN's §3 A-07 and §8.2 A3 wording then needs the same both-directions treatment E-1 just gave
  A1. Neither path blocks this PLAN today.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 2}
