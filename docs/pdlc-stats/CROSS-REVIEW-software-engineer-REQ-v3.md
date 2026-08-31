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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | REQ-STATS-06's harvested trigger is looser than the per-metric rule the same round installed elsewhere, and it parses two ways. It reads "Where `LEARNINGS-{feature}.md` is present and no `CROSS-REVIEW-*` **or** no `CODE_REVIEW-*` file remains" — a disjunction of two absences, so the ratio goes harvested when *either* process-artifact family is gone. Two problems. (a) Precedence is ambiguous to a test author transcribing it verbatim: `LEARNINGS ∧ (¬CR ∨ ¬CODE_REVIEW)` is the intended reading, but the sentence also supports `(LEARNINGS ∧ ¬CR) ∨ ¬CODE_REVIEW`, which would report harvested on any feature that never ran DoD. (b) Even on the intended reading it fires on a feature whose cross-reviews are fully intact but which has no `CODE_REVIEW-*` — the numerator is then complete for C-4's cross-review and post-mortem members and the ratio is measurable, yet it is suppressed. That is a live combination now that REQ-STATS-03/04 explicitly admit partially harvested trees. This is the one place in the diff where REQ-STATS-03's new "per document type, not per feature" discipline did not carry over. Fix (one sentence): state the condition as a parenthesised conjunction and say which absence counts — e.g. "where `LEARNINGS-{feature}.md` is present **and** at least one of the `CROSS-REVIEW-*` / `CODE_REVIEW-*` families has been fully deleted". | REQ-STATS-06, C-4 |
| F-02 | Low | Local | REQ-STATS-08's conjunct (b) lost its list separator in this round's edit. v1.1 read "…by path and modification time, issues no network request and runs no `git` write command"; the comma is gone in v1.2, so the clause now reads "…set-equal before and after by path and modification time issues no network request…", which parses on first read as "modification time issues no network request". The three sub-conjuncts of (b) — tree set-equality, no network, no `git` write — are exactly what a property will transcribe as a set-equality oracle, so the separator is load-bearing prose, not a style nit. Fix: restore the comma (or make it an explicit three-item list). | REQ-STATS-08 |
| F-03 | Low | Local | REQ-STATS-04's harvested test is stated over `CODE_REVIEW-*`, which is broader than the grammar C-5 binds it to. The driver matches `^CODE_REVIEW-{feature}-v(\d+)\.md$` with the feature name taken literally and regex-escaped (`pdlc/workflows/orchestrate-dev.js:12386-12387`), so a stray `CODE_REVIEW-other-feature-v1.md` in the directory contributes nothing to the count yet, read literally, is "a `CODE_REVIEW-*` file that survives" and would suppress the harvested state — the same file is simultaneously non-contributing and evidence-of-non-harvest. Low because the situation is rare and the intent is obvious. Fix: scope the harvested test to files matching the metric's own grammar ("no `CODE_REVIEW-{feature}-v{N}.md` file"). | REQ-STATS-04 |
