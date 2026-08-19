# Cross-Review: software-engineer — FSPEC (round 7, delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.4)
**Date:** 2026-08-19
**Iteration:** 7

## Scope of this round

Delta only, frozen round. `git diff c3ae2087..HEAD -- FSPEC-pdlc-advisory-wave-gate.md` is
**empty**: the FSPEC is byte-identical to the revision approved in v6. The delta this round is
entirely **upstream** — REQ moved v1.8 → v1.9 (erratum round 5, `680efb0c` + `e619b6d6`), which
restored five round-3 sites a rebase had reverted and landed two Medium corrections. So the review
question is narrow: does the unchanged FSPEC still hold against REQ at HEAD and against the shipped
source at HEAD?

Verified against HEAD, not against documents alone:

- REQ v1.9's new ledger citations are true symbols, not drifted line numbers:
  `export const WAVE_STATE_PATH` (`pdlc/workflows/orchestrate-dev.js:11322`),
  `export function parseWaveLedger` (`:11375`), consumed by the resume block that emits
  `Notice: the wave ledger … was ignored` (`:14218`, `:14221`). No erratum owed upstream.
- The five restored sites the FSPEC leans on all exist at REQ HEAD: C-2's
  `advisory.waveBudgetPerRun` default `1` per Q-1 (`REQ:237`, `:239`, `:575`), O-7 (`REQ:558`),
  M-WG-6 (`REQ:109`), and the Upstream row's `docs/completed/…` path, which resolves on disk
  (`docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`).
- FSPEC's dependent references are consistent with those restorations: O-7 at `FSPEC:146` and
  `:494`, M-WG-6 at `:497`, default `1` at `:296`, `:350`, `:456`.
- All seven canonical top-level sections are present (`§1`…`§7`), and the v1.4 sites approved in
  v6 survive at HEAD: AT-04-1a/AT-04-1b (3 occurrences), AT-01-5 (`:329`), A-1 (`:505`),
  A-4 (`:512`). The rebase that damaged REQ did not touch this document.

## Disposition of prior findings

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| v6 F-01 — residual "per-dispatch" phrasing after the per-attempt rewrite | Low | **Open, inherited** | The FSPEC was not edited this round. One residual survives: §3.2 Step 3 still reads "the time budget is per-dispatch (BR-11)" (`FSPEC:94`). Behaviourally correct — one attempt encloses exactly one dispatch — but the name is the pre-erratum one. Re-filed below as F-02, still non-gating. |
| v6 Q-01 (NFR-4 carve-out rationale) / Q-02 (AT-04-1b transport) | — | Carried, non-gating | Both were routed to TSPEC/§6.4 as touch-ups; neither is a Phase F blocker and neither is reopened here. |

No settled decision is reopened, and no unchanged section is re-litigated. Since the FSPEC did not
change, criterion (i) — a defect this round's edit introduced — cannot apply. The only live
question is criterion (ii), a load-bearing claim contradicted by HEAD; one such clause is recorded
below, and it is not load-bearing.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **BR-11's naming clause is false at HEAD, and REQ v1.9 has now corrected its twin while the FSPEC keeps the old wording.** BR-11 states the gate "runs between attempts, never inside a dispatch→verdict window" (`FSPEC:210-211`). At HEAD the attempt loop opens at `pdlc/workflows/orchestrate-dev.js:3397` (`while (true)`) and `seamOps.verifyGate()` is awaited at `:3549-3550` inside that same iteration — the gate runs *inside* an attempt, after the measured span, not between attempts. BR-11's own closing sentence agrees ("An attempt is one repair-and-re-gate cycle", `FSPEC:221`), so the clause also contradicts its own paragraph. The **conclusion is unaffected**: `Promise.race` closes the window at verdict (`:3420-3421`), so no subtraction and no carve-out is still right — which is exactly why REQ v7 F-07 graded the identical clause Medium and REQ v1.9 repaired it to "the window closes at the attempt's verdict, and the gate runs after that verdict, not within the measured span" (`REQ:503-505`). Same one-clause repair is owed here; not load-bearing, so not gating. |
| F-02 | Low | Local | **Residual pre-erratum vocabulary at §3.2 Step 3.** "the time budget is per-dispatch (BR-11)" (`FSPEC:94`) survives the v1.4 rewrite that moved the window to per-**attempt** (`FSPEC:213-216`, `E-25` at `:292`). Inherited from v6 F-01, unchanged because the document was not edited. Correct in substance, stale in name; fold into the same touch-up as F-01. |
