---
feature: pdlc-workflow-distribution
---

# PROPERTIES — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-workflow-distribution.md` v17.0 (approved) → `FSPEC-pdlc-workflow-distribution.md` v5.1 (dual-approved) → `TSPEC-pdlc-workflow-distribution.md` v2.1 (dual-approved) → **PROPERTIES** |
| Downstream | `PLAN-pdlc-workflow-distribution.md`, IMPL tests (`pdlc/workflows/__tests__/**`) |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,product-manager}-PROPERTIES-v{N}.md` (this branch, while active) |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` (Phase H) |
| Entry obligations disposed here | **O-9**, **O-18**, **O-20**, TSPEC §16's `PDLC_FAULT`-subset row, REQ **AC-1.8(iv)** |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **Draft** | Claude + operator | 1.0 | 2026-07-28 |

> **Altitude.** The REQ states observable behavior, the FSPEC how it is produced, the TSPEC how it is
> built and proved with *examples*. This document states what must hold over **generated** inputs:
> the axes, the invariants quantified over them, the shrink order, and — for each property —
> whether it is executable on the TSPEC's harness or is a design-time argument with a named
> example-based surrogate. It restates no FSPEC behavior; behavior is cited by section.

---

## 0. Scope and obligation index

### 0.1 What this document decides

### 0.2 Disposition of the entry obligations

### 0.3 Explicitly out of scope

## 1. Conventions

### 1.1 Property identifier scheme and classification

### 1.2 Executable vs design-time, and the two executable harnesses

### 1.3 The generator library — seeded, dependency-free, shrink-explicit

### 1.4 Spawn budget: why axes are packed into rows, not runs

### 1.5 Determinism rules every property inherits (TSPEC §2.5)

### 1.6 uid-0 and capability skips — the named inventory this document adds

## 2. The classifier's generation axes (O-9, regenerated)

### 2.1 Why the axes are a dependent tree, not a cross-product table

### 2.2 Run-level axis A0 — the hash utility

### 2.3 Per-row axes A1–A6 and the eleven leaves

### 2.4 Unconstructible combinations the generator must refuse

### 2.5 Shrink order

## 3. Row-state properties (O-9: totality, single-valuedness, determinism)

## 4. Row-reason properties (AC-1.8(iv))

## 5. Baseline-resolution axes and properties (O-9, second half)

### 5.1 Evidence axes E1–E7 and determinacy

### 5.2 Properties

## 6. Backup filename grammar properties (O-18)

### 6.1 The surface under test

### 6.2 Generators

### 6.3 Format/parse properties

### 6.4 Sort properties

### 6.5 Prune properties

## 7. Measurement-time properties (O-20, AC-2.6)

## 8. Seam-closure properties (`PDLC_FAULT` ⊆ 16; M6; trace grammar)

## 9. Determinism properties (TSPEC §2.5, AC-1.3)

## 10. Negative properties

## 11. Skip inventory and design-time arguments

## 12. Property → test file placement

## 13. Traceability — property ↔ AC ↔ FSPEC/TSPEC section

## 14. Coverage gaps and stated residuals
