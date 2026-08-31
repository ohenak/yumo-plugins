# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 3

**Delta base:** `5a116eba8` (the commit carrying the v2 review) → `HEAD` (`bb6f56af2`). I reviewed
`git diff 5a116eba8..HEAD -- docs/pdlc-stats/REQ-pdlc-stats.md` (25 insertions, 15 deletions), which
touches only the metadata block, C-5, and REQ-STATS-02/03/04/06/08. Sections unchanged since v2 are
not re-litigated.

## Prior-finding disposition (v2)

| v2 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | REQ-STATS-04 dropped the malformed clause entirely: a `CODE_REVIEW-` basename that fails the version grammar "simply does not contribute, exactly as an unrelated file". That is exactly `deriveDodRoundIndex` (`pdlc/workflows/orchestrate-dev.js:12384-12396`), whose single `pattern.exec` + `if (!match) continue;` makes no distinction between a near-miss and an unrelated name. C-5 gained the matching general rule — fidelity binds "the driver's per-file rejection reason, not its coarser aggregate reject list" — which is a true description of `parseReviewFilename` (`:10133-10163`), where `not_cross_review` short-circuits before the four real grammar reasons (`bad_role`, `bad_doc_type`, `bad_round`, `trailing_junk`). The AC and the constraint now say the same thing and both match HEAD. |
| F-02 | Medium | **Resolved** | REQ-STATS-06 now states the true reason: harvest "deletes cross-reviews and DoD reviews while post-mortems survive, so the numerator is only *partially* deleted and a computed value would silently undercount rather than be absent". Re-verified against `pdlc/skills/harvest-learnings/SKILL.md:10`, `:28`, `:59` — every deletion step names `CROSS-REVIEW-*` and `CODE_REVIEW-*` only; no step deletes `POSTMORTEM-*`. |
| F-03 | Low | **Resolved** | C-5 now reads "the `RESOLVED:` marker's case-insensitive *value* matching", which is what `parseResolvedMarker` does — `values[0].toLowerCase()` (`orchestrate-dev.js:7611`) after a case-sensitive `/^\s*RESOLVED:\s*(\S*)\s*$/` key match (`:7604`). |
| Q-01 | — | **Answered** | REQ-STATS-03: "That test is per document type, not per feature" — a partially harvested feature reports `harvested` per row for gone types and a measured index for surviving ones. REQ-STATS-04 answers the DoD half symmetrically: harvested only when this metric's own evidence is absent. |
| Q-02 | — | **Answered** | REQ-STATS-02: the malformed / unmeasurable / harvested states "ride in their own metric's value, never as extra top-level keys", so the set-equality oracle enumerates 4 metrics + 1 schema-version field and nothing longer. |
| Q-03 | — | Not taken | Whether REQ-STATS-08's tree-comparison spans ignored/untracked paths is still open; it remains cheap FSPEC material and does not gate. |
