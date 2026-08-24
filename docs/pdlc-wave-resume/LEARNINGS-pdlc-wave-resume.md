# LEARNINGS — pdlc-wave-resume

| Field | Detail |
|---|---|
| Feature | pdlc-wave-resume |
| REQ | docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md |
| Date Completed | 2026-08-24 |
| Total Iterations | REQ: 6, FSPEC: 5, TSPEC: 7, DECISIONS: 5, PLAN: 7, PROPERTIES: 6, REVIEW: 3, DOD: 3 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | CROSS-REVIEW-{product-manager,software-engineer,test-engineer}-{REQ,FSPEC,TSPEC,DECISIONS,PLAN,PROPERTIES,REVIEW}-v{N}.md (76 files), CODE_REVIEW-pdlc-wave-resume-v{1,2,3}.md, POSTMORTEM-PR-pdlc-wave-resume.md (retained) — all CROSS-REVIEW-* and CODE_REVIEW-* now deleted |
| Phases exercised | R, F, T, D, P (PLAN), PROP, I, DOD, PR (erratum), REVIEW, H |
| DoD rounds | 3 |

## 1. Non-Convergences

The one halt this feature took is the highest-signal artifact it produced, and it was **not** a
reviewer disagreement. `POSTMORTEM-PR-pdlc-wave-resume.md` (RESOLVED) records a **routing failure**:
upstream-cascade confirmation rounds record findings but do not, by themselves, mint erratum items.
When Phase PR opened its erratum round for the PLAN, the item list was minted from routed
`ERRATUM: PLAN` lines only, so three findings filed by the PLAN's own approvers in the v3/v4 cascade
rounds had no channel into the edit. They were re-raised, uncontested, in three successive rounds and
never argued against — *a finding that is disagreed with generates argument; a finding that is
unrouted generates silence.*

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| PR (PLAN erratum) | pm-review + te-review (agreeing on substance) | Mutation-5 High, plus two coverage-floor Lows, filed as `F-` rows in upstream-cascade rounds v3/v4, never entered any erratum item list; PLAN kept asserting "four mutations" against a TSPEC §5.5 that had grown to five | R4 `erratumPostmortemHalt` fired; post-mortem written, six remediations (R-1…R-6) enumerated and landed; PLAN v1.2 → approved at v6, `Approved` at v7 | 7 rounds (2 of them upstream-cascade confirmations that moved zero PLAN bytes) |
| PR (PLAN erratum) | pm-review vs te-review | The **only** true disagreement was metadata: the identical defect tagged `delta`/`nonlocal` by pm and `inherited`/`local` by te. Both readings defensible — pm reads provenance against the *round*, te against the *document*. The gate takes the union, so pm's tagging selected the halt branch | Halt honoured; tag semantics left unresolved and routed to §5 | 1 round |
| PROPERTIES | pm-review, se-review | Five rounds needed; se-review filed `Needs revision` at v2, v3 and v5 — the only doc type where a reviewer reverted to `Needs revision` *after* an approving round (v4 approved, v5 back to revision) | Converged at v6 (both roles, `Approved with minor changes`, `sha256:8a3a16e…`) | 6 |
| TSPEC | te-review | TSPEC moved **twice** under an already-approved PLAN (v1.2→v1.3 reassigned the RT-7 coverage floor; v1.3→v1.4 added two mutations and an AT-05 conjunct). The second move created a *new obligation* downstream had never been asked to discharge | Absorbed only after the PR halt forced re-grounding | 7 |

Two reviews terminated **without a verdict at all** — `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`
(3.8 KB, truncated mid-table) and `CROSS-REVIEW-test-engineer-PLAN-v1.md` (`## Verdict` → `*(pending)*`).
Neither blocked the pipeline, because the next round superseded them, but both are silent failures: an
aborted review is indistinguishable from a review that found nothing.

## 2. Cross-Feature Patterns

## 3. Rejected Proposals (with rationale)

## 4. Process Learnings

## 5. Open Items for Consolidation

## 6. Approval Record
