---
feature: pdlc-advisory-tier
---

# FSPEC — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-03 |

## 1. Scope and reading order

This FSPEC specifies the **observable behaviour** of the advisory tier described by
`REQ-pdlc-advisory-tier.md`. It covers the five judgment seams A1–A5, the advisory verdict
lifecycle, the envelope and its refusal ladder, the advisory record, and the escalation log.

**Behavioural complexity is why each of these has an FSPEC entry.** Every one has branching that an
engineer should not decide alone: a resolution path and a refusal path that must be observably
identical in their effect on the pipeline, an ordered reason ladder where two triggers can fire at
once, and a disabled mode that must be byte-for-byte inert.

| FSPEC | Requirement(s) | Behaviour specified |
|---|---|---|
| FSPEC-ADV-01 | REQ-ADV-01 | rung resolution, declared fallback, unresolvable failure, configuration |
| FSPEC-ADV-02 | REQ-ADV-02 | one advisory invocation from dispatch to disposition |
| FSPEC-ADV-03 | REQ-ADV-03, REQ-ADV-04 | envelope membership, prohibitions, ordered refusal reasons |
| FSPEC-ADV-04 | REQ-ADV-05 | seams A1 (triage abstention) and A2 (stale-REQ re-grounding) |
| FSPEC-ADV-05 | REQ-ADV-06 | seam A3 (DoD exhaustion classification) |
| FSPEC-ADV-06 | REQ-ADV-07 | seam A4 (rebase conflict) |
| FSPEC-ADV-07 | REQ-ADV-08 | seam A5 (CI failure) |
| FSPEC-ADV-08 | REQ-ADV-09 | advisory record, its harvest, the delete guard |
| FSPEC-ADV-09 | REQ-ADV-10 | escalation log and report notices |
| FSPEC-ADV-10 | AC-1.6, NFR-3 | disabled-tier equivalence |

**Not specified here** (owned downstream by TSPEC / PLAN): module and constant placement, seam and
function signatures, the literal advisory model alias, prompt text, file formats at the byte level,
and the order in which code is written. Where this document names a value it is a **product-visible
value** (a config key, a verdict word, a refusal reason) that a reviewer or an operator reads.

**Terminology.** *Seam* — one of the five points A1–A5 where the pipeline stops today.
*Invocation* — one advisory dispatch at one seam within one pipeline run. *Attempt* — one
diagnose-and-act cycle inside an invocation. *Resolution* — an in-envelope action applied and
verified. *Escalation* — an invocation that ends without an applied resolution, recorded for the
operator, leaving the pipeline's pre-advisory behaviour intact.

**Citation pin.** Every `file:line` in §2 is read at default-branch commit `26c3f1c`, the commit
REQ BL-02 pins for re-verification. Later sections cite those observations **by baseline id (B-n)**
rather than repeating line numbers, so a re-pin touches one section.

## 2. Baseline — the five seams as they behave today

## 3. FSPEC-ADV-01 — Advisory rung resolution and declared fallback

## 4. FSPEC-ADV-02 — Advisory invocation lifecycle

## 5. FSPEC-ADV-03 — Envelope, prohibitions, and the refusal ladder

## 6. FSPEC-ADV-04 — Seams A1 and A2: queue triage and re-grounding

## 7. FSPEC-ADV-05 — Seam A3: DoD exhaustion

## 8. FSPEC-ADV-06 — Seam A4: rebase conflict

## 9. FSPEC-ADV-07 — Seam A5: CI failure

## 10. FSPEC-ADV-08 — Advisory record and its harvest

## 11. FSPEC-ADV-09 — Escalation output

## 12. FSPEC-ADV-10 — Disabled-tier equivalence

## 13. Open questions
