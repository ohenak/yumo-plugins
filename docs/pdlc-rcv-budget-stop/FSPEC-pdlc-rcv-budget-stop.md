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

This FSPEC specifies the **behaviour** of REQ-RCV-01's one requirement: a review window that is three
rounds wide, counted per document from an origin the operator can move exactly once per halt, and a
halt path that records the accounting the origin is read from.

**Altitude.** This document states, for every named branch, *what is observable after it is taken*:
which rounds are dispatched, which lines exist in which file, which strings the operator reads, what
the run report carries. It states **no** algorithm, decision procedure, seam, signature, module or
constant placement, byte-level write mechanic, fixture or oracle design. Those are TSPEC/PLAN and
PROPERTIES material and are **not missing here** (`REQ-RCV-01` §8 routes each one by obligation id).

**Inputs, and how they are cited.** The REQ, the shared baseline, the shared catalogue and the shared
split record. Shipped behaviour is referenced only by measured-fact id (`M-*`), never by line
(`REQ-RCV-01` NB-4). Boundary-crossing strings are referenced by catalogue id (`S-*`) and are **not
restated**, with the two exceptions §8 names — the Iterations heading, whose exact text this feature
introduces, and the ❌ row texts, quoted from catalogue §4 so an acceptance test has a subject.

**Vocabulary is the catalogue's** (§1 there): *current window*, *reset region*, *phase refusal*,
*approval refusal*, *blocking count*, *crashed round*, *zero-delta round*, *unavailable*. Used here
with exactly those meanings and not redefined.

### 1.1 What this FSPEC does not specify

| # | Not specified here | Owner |
|---|---|---|
| **F-N-1** | How the *region validates* predicate decides, what a torn region or answering line leaves behind, the sanctioned repair per S-16 reason, the validation-failure refusal's strings | `REQ-RCV-07` AC-7.1–AC-7.6 (forward edge **X-06**) |
| **F-N-2** | The fixed-point test, the zero-delta test, how a round's blocking count is read, S-3 and S-11 emission | `pdlc-rcv-fixed-point-stop` |
| **F-N-3** | Panel shape, verifier rounds, growth measurement, the round-anchor writer, `DOC-BYTES:` / `DOC-SHA256:` / `REVIEW-MODE:` | `pdlc-rcv-panel-topology` |
| **F-N-4** | Where in the pipeline each rule runs, which values are threaded through which seam, how test code reaches the budget declaration, the site enumeration | TSPEC (`REQ-RCV-01` O-12, O-13) |
| **F-N-5** | Fixtures, generation axes, call-count oracles, the falsification ledger's contents | PROPERTIES (`REQ-RCV-01` O-10), PLAN (O-15) |

### 1.2 The interim, stated once

`REQ-RCV-01` X-06 makes the *region validates* conjunct **not in force at this ship**. Every branch
below is therefore written twice where it differs: **at this ship** (the two decidable conjuncts — a
readable `RESOLVED: yes`, and `A < H`) and **at target state** (all three). Where a branch is marked
*target state*, no behaviour changes at this ship and no acceptance test asserts it here; the legs
belong to `REQ-RCV-07` O-10. Where a branch is unmarked it is in force now.

**In force at this ship, and easily mistaken for deferred:** the `WINDOW-START:` / `WINDOW-RESUMED:`
**grammars** (S-13, S-14) — a value outside the grammar contributes no origin while still counting
toward `A` — and both halt-path **confirmation** obligations with their refusals (§7).

## 2. Criterion and obligation map

| REQ criterion | FSPEC flow | Named branches |
|---|---|---|
| AC-1.1 (budget is three, per document, not per invocation), AC-1.2 (one constant, one budget) | **FSPEC-BUD-01** (§3) | B-BUD-1 … B-BUD-5 |
| AC-1.1, AC-1.5(1), AC-1.5(2) (window end, start, origin wins) | **FSPEC-WIN-01** (§4) | B-WIN-1 … B-WIN-7 |
| AC-1.5(4) read model; S-12, S-13, S-14, S-15 | **FSPEC-REG-01** (§5) | B-REG-1 … B-REG-7 |
| AC-1.5(3), AC-1.5(4), AC-1.5(5) (the gate, the answering line) | **FSPEC-CLR-01** (§6) | B-CLR-1 … B-CLR-7 |
| AC-1.4 (every halt maintains the region; no re-author) | **FSPEC-HALT-01** (§7) | B-HALT-1 … B-HALT-9 |
| AC-1.3 (reported quantities named), row C, row B | **FSPEC-RPT-01** (§8) | B-RPT-1 … B-RPT-6 |
| AC-1.4's no-re-author path; **O-9** | **FSPEC-PROMPT-01** (§9) | B-PMT-1 … B-PMT-3 |

**Obligations this FSPEC discharges.** **O-9** in full (§9). **O-14**'s FSPEC half — the Iterations
render's placement and not-found disposition, the empty reviewer-verdict list, the no-re-author
path — in §7 and §8, as observable outcomes; the threading is TSPEC's. **O-5**, **O-11**, **O-12**,
**O-13**, **O-10** and **O-15** are named where they attach and are **not** discharged here.

**DC-05 is honoured by construction:** every `B-*` id above appears in §11 with at least one
acceptance test. §11's first row is the index.

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
