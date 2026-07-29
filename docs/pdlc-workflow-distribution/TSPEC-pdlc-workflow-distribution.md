---
feature: pdlc-workflow-distribution
---

# TSPEC — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-workflow-distribution.md` v17.0 (approved, product scope) → `FSPEC-pdlc-workflow-distribution.md` v5.1 (dual-approved 2026-07-28) → **TSPEC** |
| Downstream | `PROPERTIES-pdlc-workflow-distribution.md`, `PLAN-pdlc-workflow-distribution.md`, implementation |
| FSPEC §10 rows disposed here | O-1, O-3, O-7, O-10, O-11, O-12, O-16, O-17 (the eight whose "Lands in" names TSPEC) |
| Rows carried forward | O-9, O-18, O-20 → PROPERTIES; O-19 → implementation phase (duty (d) unit-tested here); O-13 → `consolidate-learnings` |
| Cross-Reviews | *(none yet — Phase T)* |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` (Phase H) |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 1.0 | 2026-07-28 |

> **Altitude.** The REQ states observable behavior; the FSPEC states how it is produced (components,
> data formats, algorithms, operator strings). This TSPEC states **how it is built and how it is
> proved**: the test surface architecture, the harness that runs bash from jest, the seam grammars
> (`PDLC_TRACE_FILE`, `PDLC_FAULT`), every fixture's construction recipe, the module surface of the
> bash library, and the mapping from the FSPEC's AT-1…AT-36 onto named test cases in named files.
> It does not restate FSPEC behavior; where a behavior is needed to justify a test design it is
> cited by FSPEC section, not reproduced.

---

## 0. Scope and obligation index

## 1. Test surface architecture

### 1.1 The one automated surface

### 1.2 Harness decision — child_process from jest, not bats

### 1.3 Runner capability policy and skip-loudly vocabulary

### 1.4 Coverage floors

## 2. Implementation architecture

### 2.1 File inventory

### 2.2 C1 (`pdlc-drift.sh`) — the sourced library surface

### 2.3 C5 (`build-runtime.mjs`) — retarget and manifest emission

### 2.4 C6 (`orchestrate-queue.js`) — the drift gate

### 2.5 Determinism rules binding every component

## 3. The bash harness

### 3.1 `runScript()` — the single driver

### 3.2 The environment sandbox

### 3.3 Consumer-tree builders

### 3.4 Reading back the artifacts

## 4. `PDLC_TRACE_FILE` — grammar and the classify-before-create oracle (O-1, O-7)

### 4.1 Grammar

### 4.2 What is traced, and what is not

### 4.3 The AC-2.9(1) oracle

### 4.4 The unwritable-trace red test

## 5. `PDLC_FAULT` — the closed token enumeration (O-10)

### 5.1 Token grammar and composition

### 5.2 The enumeration

### 5.3 Rung granularity for the invalidation ladder

### 5.4 Unrecognised tokens

## 6. Write-failure test design (O-10)

### 6.1 Injectability matrix

### 6.2 Per-runner fixture requirements and the uid-0 caveat

### 6.3 Fail-open assertions per writer surface

### 6.4 The removal-only sync-manifest-rewrite fixture

### 6.5 The json-tool-absent ladder tests — AT-14 and AT-14b

## 7. Probe vocabulary and permission-fixture policy (O-11)

## 8. Repo-root resolution — the non-git fixture and its oracle (O-3)

## 9. Bootstrap fixture construction (O-12)

## 10. Root-parameterised jest oracles

### 10.1 `coveredViolations(root)` and the pinned fixture tree (O-17)

### 10.2 `packagingViolations(root)`

### 10.3 `advertisedVersionViolation(root)` and the skip-loudly branches (O-16)

## 11. Backup filename grammar — TSPEC's contribution (O-18 hand-off)

## 12. Queue-side design — shape validator and the O-19(d) wrapper

## 13. Fixture inventory with construction recipes

## 14. AT → test case → file placement

## 15. Traceability

## 16. Hand-off table — obligations leaving this document

## 17. Risks and stated residuals
