---
feature: pdlc-advisory-tier
---

# TSPEC — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{pm,test-engineer}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-03 |

## 1. Scope, baseline pin, and what this TSPEC decides

### 1.1 Baseline pin — and a warning about this branch's tree

Every `file:line` in this document is read at **default-branch commit `26c3f1c`**, the commit REQ
BL-02 pins and FSPEC §2 cites by baseline id. That pin is load-bearing here in a way it is not in
most features:

> `feat-pdlc-advisory-tier` is branched from a **pre-`26c3f1c`** default branch. At this branch's
> head, `pdlc/workflows/orchestrate-dev.js` is 2,139 lines and `pdlc/workflows/orchestrate-queue.js`
> is 735 lines; at `26c3f1c` they are **8,527** and **1,587** lines respectively. Every symbol this
> TSPEC names exists at `26c3f1c` and many do not exist on this branch's current tree.

Implementation therefore begins with a rebase onto `26c3f1c`-or-later, before any task in the PLAN
runs. This is not a nicety: `computeWaves`, `parseImplementationConfig`, `phaseMerge`,
`MERGE_ESCALATIONS` and `defaultAppendFile` — all integration points below — postdate this branch's
base. PLAN owns that as its first gate (§13.6).

### 1.2 What FSPEC left to this document

FSPEC §1 names six things as TSPEC's: module and constant placement, seam and function signatures,
the literal advisory model alias, prompt text, byte-level file formats, and code order. FSPEC §13
adds one substantive open question, OQ-3. This TSPEC resolves each:

| # | Left open by | Resolved here |
|---|---|---|
| 1 | FSPEC §1 | module and constant placement — §2 |
| 2 | FSPEC §1 | seam and function signatures — §4, §6, §7, §8 |
| 3 | FSPEC §1, REQ BL-01 / OQ-1 | the literal advisory alias — §3.3 |
| 4 | FSPEC §1 | prompt text — §4.4, §6.3, §7.2, §8.2 |
| 5 | FSPEC §1 | byte-level file formats — §9.1, §10.1 |
| 6 | FSPEC §13 OQ-3 | what restores a verified state after an A5 push — §8.5 |
| 7 | FSPEC §1 | code order — deferred to PLAN |

### 1.3 What this TSPEC does not decide

Whether a given consuming repo can read the default branch's check history (BL-05) or re-run a
workflow run (BL-06) is a per-repo runtime fact, not a design choice. §8.3 specifies capability
probes whose *absence* is a first-class, tested outcome; it does not assume either capability.

### 1.4 Notation

`dev` = `pdlc/workflows/orchestrate-dev.js`, `queue` = `pdlc/workflows/orchestrate-queue.js`,
`adapter` = `pdlc/workflows/runtime-adapter.js`, `build` = `pdlc/workflows/build-runtime.mjs`, all at
`26c3f1c`. FSPEC rule ids (`V-5`, `A5-3`, `X-a`, …) are used verbatim; this document never restates
a rule it is only implementing.

## 2. Architecture — where the code lives, and the bundle constraint

## 3. Configuration and model-rung resolution (FSPEC-ADV-01)

## 4. The advisory core — types, protocols, invocation lifecycle (FSPEC-ADV-02)

## 5. Envelope enforcement, refusal ladder, prohibitions (FSPEC-ADV-03, ADV-04)

## 6. Seams A1 and A2 — the queue module (FSPEC-ADV-04)

## 7. Seams A3 and A4 — Phase DOD (FSPEC-ADV-05, ADV-06)

## 8. Seam A5 — Phase PUB (FSPEC-ADV-07)

## 9. Advisory record, harvest, delete guard, run-report summary (FSPEC-ADV-08)

## 10. Escalation log and report notices (FSPEC-ADV-09)

## 11. Disabled-tier equivalence (FSPEC-ADV-10)

## 12. Error handling — every failure scenario

## 13. Test strategy and test doubles

## 14. Requirement → component traceability

## 15. Feasibility, cost, and risks

## 16. Decisions warranting a DECISIONS record
