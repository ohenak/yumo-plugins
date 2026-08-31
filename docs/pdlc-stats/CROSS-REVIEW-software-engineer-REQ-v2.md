# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 2

**Delta base:** `fed7325de` (the commit carrying v1 of this review) → `HEAD`. Reviewed by
`git diff fed7325de..HEAD -- docs/pdlc-stats/REQ-pdlc-stats.md` (166 insertions, 159 deletions);
unchanged sections already accepted in v1 were not re-litigated.

## Prior-finding disposition (v1)

| v1 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | REQ-STATS-03 now names the outcome — "the highest round index present on disk for that document type, taken across all roles" — instead of equating the count to the driver's *round window*. No off-by-one is left to inherit from `deriveRoundWindow`'s `{startIndex, endIndex}` upcoming-budget pair (`pdlc/workflows/orchestrate-dev.js:10192`). |
| F-02 | High | **Resolved** | C-2 no longer attributes the two-location preference to `CLAUDE.md`; it claims the order as this REQ's own decision and re-points the archive evidence at `pdlc/OPERATIONS.md:146` ("`docs/*/LEARNINGS-*.md` and `docs/completed/*/LEARNINGS-*.md`") — verified verbatim — plus `docs/completed/REQ-completed.md`, which exists. `CLAUDE.md` still contains zero occurrences of `completed`, exactly as C-2 now states. |
| F-03 | High | **Resolved** | REQ-STATS-07 declares the exclusion set "fixed, this-REQ-owned" rather than citing `CLAUDE.md`/`pdlc/OPERATIONS.md` for directories they never name. |
| F-04 | High | **Resolved** | `docs/completed/` is now in the exclusion set and typed correctly as a *container* — traversed for children, never itself a row — which is the precise fix for the phantom `completed` feature. The added "directories only" rule also covers the loose file I flagged: `docs/PLAN-pdlc-integration-boundary-gates.md` is still the only `.md` at the `docs/` root and is now unambiguously not a feature. Checked against the live tree: the eight excluded names are set-equal to the non-feature directories actually present under `docs/`. |
| F-05 | Medium | **Resolved** | C-5 is widened from round counts to *every* parsing rule the command re-reads, and REQ-STATS-05 now defers marker matching wholesale instead of restating `RESOLVED: yes`. The fenced-block qualifier I asked for is inherited rather than duplicated — the better fix (see F-03 below for a small factual wrinkle in how C-5 describes it). |
| F-06 | Medium | **Resolved** | REQ-STATS-03 fixes aggregation explicitly: one number per document type, not per role, max across roles, with a worked example (5 and 3 report `5`). |
| F-07 | Medium | **Resolved** | The refusal state is now specified as **unmeasurable**, naming the colliding role — which matches what the driver actually returns: `{ok: false, reason: "malformed_round_one_duplicate", role}` (`pdlc/workflows/orchestrate-dev.js:10225-10231`), so the role is available to report. |
| F-08 | Low | **Resolved** | Malformed reporting is now scoped to basenames that begin `CROSS-REVIEW-`, with ordinary artifacts explicitly "neither counted nor called malformed" — matching `parseReviewFilename`'s `not_cross_review` short-circuit (`pdlc/workflows/orchestrate-dev.js:10135-10137`) versus its four genuine grammar rejections. |
