---
feature: pdlc-rcv-reset-region
ready: true
depends-on: [pdlc-rcv-budget-stop]
---

# REQ — pdlc-rcv-reset-region

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the measured facts `M-*`, the declared thresholds and the shared non-goals `N-1 … N-10`. **Read it first.** Facts are cited by id (`M-8d`), never restated. |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — the family vocabulary (§1), the closed catalogue `S-1 … S-17` (§2), the run-report row schema (§3) and **row B's unconfirmable-append render (§4)**, used by reference. |
| Predecessor | `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` v2.0 (`REQ-RCV-01`) — this REQ is the **implementation-altitude half** split out of that document's v1.6 AC-1.5(4), §6 and O-10 on 2026-08-01. See §10 and `docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md`. |
| Siblings | `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` (REQ-RCV-02); `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04); `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Upstream | `docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md` (v1.0) root causes 1 and 3, recommendations R-3 and R-4; operator direction of 2026-08-01 |
| Downstream | `FSPEC-pdlc-rcv-reset-region.md` |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`41f9369`** on `feat-pdlc-rcv-budget-stop`, at which every line cited below was re-derived. Baseline §2.8's `M-8*` rows were read at `cf207bd` and hold unchanged at `41f9369`. Citations name the enclosing symbol and a distinctive literal; re-baselining is a mechanical fix, not a finding. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-08-01 |

**v1.0** is the split half. Nothing here is new material: every criterion below was `REQ-RCV-01`
v1.6's AC-1.5(4), §6 or O-10 text, re-stated against the measured facts `M-8a … M-8j` that
`docs/_constraints/pdlc-rcv-baseline.md` §2.8 added on the same day. **No `S-*` id is minted, and no
requirement, AC or threshold of `REQ-RCV-01` changed meaning** — only which document states it.

## 1. Problem

## 2. Users and value

## 3. Prerequisites

## 4. Definitions and the catalogue ids this REQ reads

## 5. Acceptance criteria

## 6. Declared thresholds

## 7. Non-goals and out of scope

## 8. Downstream obligations

## 9. Risks, assumptions and deferrals

## 10. Traceability
