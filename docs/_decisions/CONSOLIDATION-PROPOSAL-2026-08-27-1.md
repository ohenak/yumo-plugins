# Consolidation Proposal 2026-08-27-1

Skill-prompt changes proposed by the third `/pdlc:consolidate-learnings` pass, over six LEARNINGS:
`pdlc-advisory-wave-gate`, `pdlc-learnings-injection`, `pdlc-wave-resume`, `pdlc-engineering-loop`,
`pdlc-review-convergence` (discarded), `pdlc-rcv-budget-stop` (discarded).

**Nothing applied.** Agents proposing changes to agent prompts pass through human judgment; review
and apply or reject it. This continues the numbering boundary set by
`CONSOLIDATION-PROPOSAL-2026-08-19-1.md` (Pass 2; rows R1–R7 here are a new series, not a
continuation of that proposal's Q-series).

| # | Source LEARNINGS | Target | Proposed change | Rationale |
|---|---|---|---|---|
| **R1** | pdlc-engineering-loop (scope-tag absence measured at ~97% in the feature's own harvest, re-derived independently in `pdlc-advisory-wave-gate` and `pdlc-learnings-injection` harvests) | `pm-review`, `se-review`, `te-review`, `dod-verify` `SKILL.md` | Gate on `Scope:` for findings the same way `FINDING:` grammar is already gated — fail-closed, exactly, not advisory prose. | DC-13 already names this defect; restating it in a fourth LEARNINGS changes nothing without enforcement. Scope-tag absence recurred at ~97% in this pass's own harvest corpus. |
| **R2** | pdlc-advisory-wave-gate, pdlc-engineering-loop | `dod-verify` `SKILL.md` | Edits to `OPERATIONS.md` / `README.md` / `CLAUDE.md` / `plugin.json` should be tagged `Scope: Cross-Feature` by default, not left to reviewer discretion. | These four files recur as the site of cross-feature edits across every feature in this pass's corpus; leaving the tag to discretion reproduces R1's gap on exactly the files most likely to affect other features. |
| **R3** | pdlc-engineering-loop (P-2), pdlc-wave-resume (O-5) | engine (`orchestrate-dev.js` `reviewLoop`) | Implement DEC-TERM-01 as a derivative rule in the engine loop driver: no new ≥Medium finding for N consecutive rounds ⇒ converged, evaluated independently of the round cap. | DEC-TERM-01 records the decision; without an engine-side implementation the 15-round cap keeps doing the converging (114 approving verdicts still ran to ceiling in `pdlc-engineering-loop`). |
| **R4** | pdlc-wave-resume (repo's own cascade halts), corroborated independently by the regime-ledger corpus (longhorizon-product-scaffold: DECISIONS v2–v7 identical approval hash across six rounds) | engine (erratum/cascade dispatch construction) | Per DEC-ERRROUTE-01: a confirmation round is mechanical, not a review — a dispatch cheap dependency-cell check (does the document's own hash change, or only upstream pins move) should route pin-only cascades through one sweep that covers all affected docs in one pass, rather than re-opening a full confirmation round per document per pin move. | Pin-only cascade rounds recur as the largest single class of wasted rounds across this pass's corpus (DEC-ERRROUTE-01, DEC-TERM-02); a mechanical routing distinguishes "document content changed" from "an upstream pin moved" before spending a review round. |
| **R5** | pdlc-wave-resume (POSTMORTEM: routing failure will recur), pdlc-learnings-injection | engine | Implement DEC-ERRROUTE-01: findings recorded in a confirmation cross-review mechanically mint erratum items; no reliance on reviewer discretion. | Distinct from R4: R4 cheapens pin-only rounds, R5 closes the route-never-close loop when content DID change. |
| **R6** | pdlc-engineering-loop (stale dispatch-hash re-filed as Low in 54 reviews), pdlc-wave-resume (8 hand-copied pin findings in one round) | engine, mechanical-defect tier | Compute APPROVAL-HASH/UPSTREAM-STATE anchors harness-side at write time (never agent-transcribed); derive DoD round number from max(CODE_REVIEW-*-v*)+1 on disk; fix stale upstream hash quoted as "current" in erratum/delta dispatches; deduplicate staleness findings against an existing open item per DEC-TERM-02. | Pure defects — no process-design judgment involved; largest single token-burn class in the corpus. |
| **R7** | pdlc-rcv-budget-stop (61KB REQ at 99.8% ceiling for one constant + 4 pure functions), pdlc-review-convergence (REQ grew to 311KB) | engine + pdlc/hooks/scripts/check-req-size.sh | Make the 5g split-on-recurrence trigger a mechanical halt when one High finding blocks two consecutive rounds; make REQ byte-ceiling ≥90% trigger a mechanical relocation prompt (constraint text → docs/_constraints/) at the next authoring round. | Both were advice nobody acted on until a feature died; corroborated in regime-ledger (regime-swing-confirmation: trigger fired, was answered in-place, feature ran to 188 cross-review files). |

---

## Not proposed / deferred

| Item | Source | Reason not proposed |
|---|---|---|
| Structural `VERDICT`/no-verdict enforcement — removing headings-only stubs that read as indistinguishable rounds | pdlc-wave-resume (two no-verdict cross-reviews found in this pass) | Corroborates a class already tracked; no new mechanism proposed beyond what Q-4/Q-11 of the 2026-08-19-1 proposal already cover, deferred to that row's disposition. |
