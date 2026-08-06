# TSPEC — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer,product-manager}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-06 |

> **Scope in one line.** The mechanism for one consolidation pass: one new workflow module
> (`pdlc/workflows/consolidate-learnings.js`), the seam protocol it is injected with, the pure
> functions its behaviour decomposes into, the one edit it makes to shipped code
> (`resolveAdvisoryRung`'s optional `skill` parameter), and the test strategy that falsifies each.

## 1. Scope, inputs, and what this document decides

## 2. Technology stack and new dependencies

## 3. Project structure — files created and modified

## 4. Module architecture — decomposition and dependency graph

## 5. Interfaces — the injected seam protocol

## 6. Data model — types

## 7. Algorithms

## 8. Reuse of the advisory rung ladder, and the bundle wiring

## 9. The pull-request route — clone, commit, credential

## 10. Error handling

## 11. Test strategy

## 12. Traceability

## 13. Risks and open items handed downstream
