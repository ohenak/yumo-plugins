---
feature: pdlc-headless-engine
---

# PROPERTIES — pdlc-headless-engine

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → **PROPERTIES** (`REQ-pdlc-headless-engine.md` v0.10; `FSPEC-pdlc-headless-engine.md` v1.6; `TSPEC-pdlc-headless-engine.md` v1.5; `DECISIONS-pdlc-headless-engine.md` v1.3; `PLAN-pdlc-headless-engine.md` v1.2) |
| Downstream | IMPL and tests (`pdlc/engine/__tests__/`, `pdlc/workflows/__tests__/`) |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,software-engineer}-PROPERTIES-v{N}.md` |
| LEARNINGS | `docs/pdlc-headless-engine/LEARNINGS-pdlc-headless-engine.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-11 |

## 1. Purpose and scope

## 2. How to read a property row

## 3. Pipeline parity, anti-fork and the read-set (PROP-PARITY, PROP-FORK, PROP-READ)

## 4. Startup ladder, plugin handshake and skill-set equality (PROP-START, PROP-HAND, PROP-SKILL)

## 5. Auth posture, per-dispatch auth policy and environment (PROP-AUTH, PROP-ENV)

## 6. Dispatch boundary, model forwarding and permission posture (PROP-DISP, PROP-MODEL, PROP-PERM)

## 7. Outcome taxonomy, retry machine and engine-fatal stops (PROP-FAIL, PROP-RETRY)

## 8. Queue surface, loop stop reasons and exit codes (PROP-QUEUE, PROP-EXIT)

## 9. Run report and tunables (PROP-REP, PROP-TUNE)

## 10. Guard parity and the M-ENG-09 measurement (PROP-GUARD)

## 11. Test-suite mechanics: hermeticity, fixtures, catalogue, set-equality harness (PROP-VER, PROP-MSG, PROP-SUITE)

## 12. Negative properties — what must not happen

## 13. Property-based testing strategies

## 14. Coverage matrix — acceptance criteria to properties

## 15. Coverage matrix — properties to PLAN tasks and test files

## 16. Gaps, risks and open items

REVISION-COMPLETE: yes
