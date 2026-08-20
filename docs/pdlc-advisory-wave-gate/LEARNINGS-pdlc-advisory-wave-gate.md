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

Findings tagged `Cross-Feature` (20 occurrences across the set), plus `Local`-tagged findings re-routed here under the under-tagging check because they name a sibling feature or a repo-wide mechanism.

| Finding | Suggested Promotion Target |
|---|---|
| **A tracked machine-local runtime artifact can be silently re-added after a retirement sweep deleted it.** DoD v1 finding 1: six `.claude/` runtime/state files were tracked at HEAD — the exact consumer-runtime copies `pdlc-plugin-retirement` T22 deleted — re-added by this feature's `e3b9d5a3`. The `/.claude/workflows/` ignore rule had been *dropped* at retirement T22 (`c9be212e`), so nothing stopped the re-add. Remediated by `git rm --cached` + anchored ignore rules + a set-equality oracle. Tagged `Local`; it is repo-wide. | `docs/_constraints/` — a standing rule that a retirement sweep must leave an ignore rule behind, not just a deletion. |
| **`PROP-SWEEP-2(b)`'s sweep gate reds on a feature's own docs, because the oracle walks the entire tree including ignored paths.** DoD v1 finding 5: the retirement sweep returned 23 tracked paths, every one attributable to this feature (18 of its own review docs). Root-caused at source in `c5ce8d56`: AT-22 now filters `coveredViolations(LIVE_ROOT)` through `git check-ignore --no-index`, with a non-vacuity control. This is the same trap the project CLAUDE.md already warns about. | `docs/_constraints/` — any oracle walking `root` must filter through `git check-ignore`; and any doc-set that quotes retired vocabulary needs an A-1 disposition row, not a bare glob. |
| **The shipped default gate command carried a coverage exemption that hid a red suite.** DoD v1 finding 4: `implementation.testCommand` excluded `documentOracles`, so the shipped gate was green while plain `npm test` was red on this feature's own artifacts. A6's own wave gate could never have caught it. Exclusion dropped; `ci-arrangement.test.js` now pins the ignore set by `deepEqual`, mutation-verified. Tagged `Process`; it is a cross-feature configuration hazard. | `docs/_decisions/` — exemptions in a shipped gate command must be narrow, owned, and recorded in `pdlc/OPERATIONS.md`. |
| **A stale disclosure *family*, not a nearest occurrence.** DoD v1 finding 6: four claims in `pdlc/OPERATIONS.md`'s Advisory tier section were falsified by one diff (seam count, seam enumeration, config-key list, per-seam row count). Remediated by deriving the expected runbook text from `ADVISORY_SEAMS` / `ADVISORY_DEFAULTS` / `ENVELOPE_DEFAULTS`, so a seventh seam reds the runbook. | `docs/_constraints/` — human-facing disclosure prose about an enumerable constant should be oracle-derived from that constant, not hand-copied. |
| **Deferrals must bind to a queue row, not to prose.** DoD v1 finding 8: `PROP-REST-03` shipped as the suite's only `test.todo`, its named successor being "an erratum on an upstream doc" — prose, not a `docs/_queue/QUEUE.md` row. Contrast the six `D-AWG-*` deferrals, correctly bound to rows 6 and 20. Fixed by binding OQ-7 to row 6. | `docs/_constraints/` — a deferral is unbound unless it names a QUEUE row id. |
| **Two features can each assume the other bumps a coupled integer literal.** TE PLAN F-03 (`Cross-Feature`): `documentOracles` T15 (99 vs 100) is coupled to another feature's sweep, and neither side owned it. TE Q-01 explicitly warned both sides would assume the other. | `docs/_decisions/` — a shared literal needs a named owning feature at the moment the coupling is created. |
| **A wave-boundary oracle asserting a clean tree cannot pass where a session hook rewrites a tracked file.** `consumerCleanup.test.js` AT-4.1 asserted clean `git status --porcelain` inside the wave gate's scope while a hook rewrote tracked `.pdlc-drift-state.json` — reddening *every* wave boundary, not just wave 1. | `docs/_constraints/` — decide tracked-ness before a plan depends on a clean-tree assertion. |
| **A defaults change hidden inside a compression step.** PM PLAN F-01/F-02 (`Cross-Feature`): the PLAN's A6-06 row, compressing a withdrawn TSPEC claim, would have shipped `advisory.enabled: true` in `.claude/pdlc.config.example.json` — flipping the advisory tier **on by default for every repo copying the example config**, a user-visible behaviour change no requirement asked for. | `docs/_constraints/` — a task row that writes bytes into a shipped example config is a defaults change and needs an explicit requirement citation. |

## 3. Rejected Proposals (with rationale)

## 4. Process Learnings

## 5. Open Items for Consolidation

## 6. Approval Record
