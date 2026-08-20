# LEARNINGS — pdlc-advisory-wave-gate

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-wave-gate |
| REQ | docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md |
| Date Completed | 2026-08-20 |
| Total Iterations | REQ: 8, FSPEC: 7, TSPEC: 12, DECISIONS: 11, PLAN: 12, PROPERTIES: 6, REVIEW: 2, IMPL: 3 (DoD rounds) |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | 116 cross-reviews + 3 DoD code reviews (all deleted in the harvest commit): `CROSS-REVIEW-software-engineer-REQ-v{1..8}`, `CROSS-REVIEW-test-engineer-REQ-v{1..8}`, `CROSS-REVIEW-software-engineer-FSPEC-v{1..7}`, `CROSS-REVIEW-test-engineer-FSPEC-v{1..7}`, `CROSS-REVIEW-product-manager-TSPEC-v{1..12}`, `CROSS-REVIEW-test-engineer-TSPEC-v{1..12}`, `CROSS-REVIEW-product-manager-DECISIONS-v{1..11}`, `CROSS-REVIEW-test-engineer-DECISIONS-v{1..11}`, `CROSS-REVIEW-product-manager-PLAN-v{1..12}`, `CROSS-REVIEW-test-engineer-PLAN-v{1..12}`, `CROSS-REVIEW-product-manager-PROPERTIES-v{1..6}`, `CROSS-REVIEW-software-engineer-PROPERTIES-v{1..6}`, `CROSS-REVIEW-product-manager-REVIEW-v{1..2}`, `CROSS-REVIEW-test-engineer-REVIEW-v{1..2}`, `CODE_REVIEW-pdlc-advisory-wave-gate-v{1..3}`. Also read, and **retained** (post-mortems are not harvested away): `POSTMORTEM-T-pdlc-advisory-wave-gate.md`, `POSTMORTEM-D-pdlc-advisory-wave-gate.md`. |
| Phases exercised | R, F, T, D, P, V, I, REVIEW, DOD, H |
| DoD rounds | 3 (`CODE_REVIEW-…-v1` Findings → `v2` Findings → `v3` Pass) |

## 1. Non-Convergences

Three review loops failed to converge inside their window. Two produced post-mortems; both resolved. The headline: **every one of the three stalled on a document asserting a measurement of a moving working tree, not on a design question.**

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| D (DECISIONS) | product-manager + test-engineer (agreeing) | `REVIEW-CAP` halt (`MAX_REVIEW_ROUNDS = 5`, rounds 4–8). The four decisions `DEC-A6-01…04` were approved on substance by round 5 and stayed byte-identical. Every round 4–8 turned on one sub-section — the `DEC-A6-04` "sizing" bullet block enumerating how many tree sites carry the pre-A6 five-member seam literal and four-member envelope literal. Each round re-measured one of its three columns and left another stale, closing exactly one High and opening exactly one new High **in the same paragraph**. | The block was relocated out of DECISIONS to `SIZING-pdlc-advisory-wave-gate.md`, leaving DECISIONS with a pointer and the re-derivation *recipe* rather than the totals. Round 9 confirmed; rounds 10–11 were upstream-cascade confirmations. `RESOLVED: yes`. | 11 (halt at 8) |
| T (TSPEC → routed PLAN erratum) | product-manager + test-engineer (agreeing) | `ERRATUM-PROTOCOL` halt. TSPEC itself converged at v1.10 / round 11. TSPEC §6 routed a "revert vs. keep-and-re-derive" fork into the already-approved PLAN, opening erratum round 4 (PLAN v1.3 → v1.4). The delta-confirmation round (round 6) returned **Needs revision from both lenses** — but on *collateral*, not on the routed items, which both reviewers judged discharged. The erratum re-grounded on the TSPEC section that routed the item (§1.3/§6) and **not** on the sections that had moved underneath the rest of the document (§4.4, §5.1, and the DEC-DOC-01 citation re-anchoring). | One bounded PLAN revision (v1.5) closing the round-6 list, then a single delta-confirmation round. TSPEC not reopened, erratum not re-litigated. `RESOLVED: yes`; PLAN went on to approve at rounds 10–12. | PLAN 12 (halt at 6); TSPEC 12 |
| T (TSPEC, earlier halt) | product-manager + test-engineer | Prior `REVIEW-CAP` halt at `MAX_REVIEW_ROUNDS 5` on the wave gate's resolution predicate (the `ledgerAnchor` mechanism, refined across rounds 2→5). Full text preserved at `447cd7dc:docs/pdlc-advisory-wave-gate/POSTMORTEM-T-…`. | Round-5 findings addressed in TSPEC v1.5; confirmation round ran; TSPEC converged and approved at v1.10 in round 11. Superseded in the postmortem file by the erratum halt above. | 12 total |

**Shared shape, stated once.** In all three, no reviewer contradicted another reviewer — the two lenses independently raised the *same* defects, differing only on severity and on inherited-vs-delta attribution. The disagreement was always **author versus HEAD**. A loop where both lenses agree and the document still will not converge is not a review-quality problem; it is a signal that the document is carrying a claim it cannot keep true.

## 2. Cross-Feature Patterns

## 3. Rejected Proposals (with rationale)

## 4. Process Learnings

## 5. Open Items for Consolidation

## 6. Approval Record
