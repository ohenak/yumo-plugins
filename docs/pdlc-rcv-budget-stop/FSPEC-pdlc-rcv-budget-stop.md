---
feature: pdlc-rcv-budget-stop
---

# FSPEC — pdlc-rcv-budget-stop

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-rcv-budget-stop.md` v3.1 → **FSPEC** |
| Downstream | `TSPEC-pdlc-rcv-budget-stop.md`, `PLAN-…`, `PROPERTIES-…` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` while active |
| LEARNINGS | `docs/pdlc-rcv-budget-stop/LEARNINGS-pdlc-rcv-budget-stop.md` |
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — measured facts `M-*`, declared thresholds (§3, §3.1), durable homes (§3.2), shared non-goals `N-*` |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — vocabulary (§1), closed catalogue `S-1 … S-17` (§2), row schema (§3), row-B render (§4) |
| Shared split record | `docs/_constraints/pdlc-rcv-split.md` — paired edges (§5) and the shared arguments (§5.1–§5.8) |
| Sibling | `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` (**REQ-RCV-07**) — the region's machinery, forward edge X-06 |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-08-02 |

## 1. Scope, inputs and altitude

## 2. Criterion and obligation map

## 3. FSPEC-BUD-01 — The budget constant and every place it is reported

## 4. FSPEC-WIN-01 — Window resolution and round admission

## 5. FSPEC-REG-01 — The reset region as a read model

## 6. FSPEC-CLR-01 — The clearance gate and the answering line

## 7. FSPEC-HALT-01 — Halt-path region maintenance

## 8. FSPEC-RPT-01 — Operator-visible reporting

## 9. FSPEC-PROMPT-01 — The post-mortem authoring prompt

## 10. Edge cases and error scenarios

## 11. Acceptance tests

## 12. Open questions

## 13. Traceability
