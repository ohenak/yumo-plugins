# Cross-Review: software-engineer — FSPEC (delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.6)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` (re-verified at HEAD)
**Date:** 2026-08-31
**Iteration:** 9 (delta re-review, decision freeze)

## Scope and delta

My v8 approved this document at commit `65f49aca`. `git diff 65f49aca..HEAD --
docs/pdlc-stats/FSPEC-pdlc-stats.md` is **19 insertions / 7 deletions across three sites**, and no
other pipeline document moved in a way this review depends on:

| Site | Change | Round's stated purpose |
|---|---|---|
| Header changelog (§ version table) | `Draft \| pm-author \| 1.5` → `1.6`, plus a v1.6 revision paragraph | Record the round |
| §4.2 BR-16 | Rewrites the out-of-catalogue carve-out; adds the `docs/completed/pdlc-advisory-wave-gate/` provenance sentence | TE v7 F-02 — cite the directory for the *basename shape* only, not the verdict |
| §6.6 AT-15 | Adds a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` to the neither-list and a paired assertion | TE v7 F-03 — pin BR-16's no-bytes half |

Both routed items land in substance. **One factual defect is introduced by this round's edit**: the
new BR-16 sentence states a count of the cited directory that is false at HEAD and contradicts this
same document's §4.2 BR-06. That is F-01 below, and it is why this round is Needs revision.

Under the freeze I checked only the three changed sites, the claims they make about the repository,
and the neighbouring rows those edits could have disturbed. No rule, exit code, enum value or
acceptance-test oracle outside these sites moved (`git diff` carries no `EC-*` or `AT-*` definition
line other than AT-15).
## Business Rules

## Acceptance Tests

## Edge Cases and Error Scenarios

## Delta-Confirmation Findings

## Findings

## Open Questions

## Positive Observations

## Recommendation

