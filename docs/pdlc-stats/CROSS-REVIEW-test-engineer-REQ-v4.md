# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/REQ-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 4 (erratum delta confirmation)
**Previous round:** `docs/pdlc-stats/CROSS-REVIEW-test-engineer-REQ-v3.md` (Approved with minor changes; 0 High, 1 Medium, 3 Low)
**Round type:** delta confirmation of a targeted erratum edit against a previously approved REQ

## Routed-item disposition

Every routed item is checked against the bytes at HEAD, and against source where the edit makes a
claim about existing behaviour.

| # | Routed item (raised by) | Landed? | Evidence at HEAD |
|---|---|---|---|
| 1 | C-5's "re-reads" sweeps in REQ-STATS-05's halts listing, which has no upstream rule to defer to (se-review) | **Yes** | C-5 now carves it out explicitly: "Discovering *which* phases have a post-mortem is carved out: the driver builds that path from a phase it already holds and classifies no `POSTMORTEM-*` basename… fidelity binds the `RESOLVED:` marker, not the discovery." Verified in source: `orchestrate-dev.js:8618` and `:9402` both build `docs/${feature}/POSTMORTEM-${phase}-${feature}.md` from a phase the driver already holds — path construction, no basename classification, no directory listing. |
| 2 | REQ-STATS-05 discovers phases by basename while C-5 enumerates only three re-read rules and defines no listing (pm-author) | **Yes** | Same carve-out sentence; the listing is now explicitly "this REQ's own (REQ-STATS-05)", so REQ-STATS-05 no longer asserts a rule C-5 forbids it from owning. |
| 3 | REQ-STATS-03's malformed disposition reports pipeline-authored `CROSS-REVIEW-{role}-REVIEW-v{N}.md` as malformed (pm-author, D-8) | **Yes** | REQ-STATS-03 now names the case: "covers the grammatical-but-out-of-catalogue names the pipeline writes (`CROSS-REVIEW-{role}-REVIEW-v{N}.md`); one label stands: a third bucket would be an independent rule C-5 forbids." Code-accurate: `parseReviewFilename` matches the regex at `:10095` and then rejects `REVIEW` at the closed catalogue `REVIEW_DOC_TYPES` (`:10102-10110`, `:10145`) with per-file reason `bad_doc_type`. Four such files exist today under `docs/completed/pdlc-advisory-wave-gate/`, so the expectation is fixture-backed, not hypothetical. |
| 4 | REQ-STATS-09's *Given* sweeps in the no-`docs/`-root case, contradicting FSPEC EC-09/D-9 (se-review, pm-author) | **Yes** | REQ-STATS-09 now reads "…in a repository whose `docs/` root is present and readable — a missing or unreadable `docs/` root is not this criterion's case but a root failure." That is exactly one expected output per input again: EC-09/D-9's root failure and EC-01's not-found no longer both claim the same fixture. |
| 5 | REQ-STATS-07's "missing/malformed" does not describe FSPEC BR-27's readable-but-empty zero state (se-review, pm-author) | **Partly** | The AC landed: "for any feature whose directory cannot be read, reports it by name with the reason rather than omitting it; a readable but empty directory is not a gap but a normal row whose metrics report their zero states" — which matches BR-27 and EC-03. The identical stale phrase one section up in **G-3** was not touched; see F-01. |
| 6 | REQ-STATS-06's harvested predicate parses two ways (pm-author; my v3 F-01) | **Yes** | Now scoped explicitly: "at least one of the two process families is entirely absent (no `CROSS-REVIEW-*` remains, or no `CODE_REVIEW-*` does, or neither)". Applied to `docs/completed/pdlc-headless-engine/` (LEARNINGS present, one surviving TSPEC cross-review, zero `CODE_REVIEW-*`) it yields one expectation — `harvested` — where v3's wording admitted two. |
| 7 | REQ-STATS-04's harvested clause lost its subject (pm-author; my v3 F-02) | **Yes** | Now "this metric reports **harvested** rather than `0`" — the subject is the metric, not the file. |
| 8 | REQ-STATS-04 should test over the `CODE_REVIEW-{feature}-v{N}.md` grammar, not a bare prefix (pm-author) | **Yes** | The harvested predicate now reads "no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar remains", consistent with the same AC's earlier statement that a non-matching `CODE_REVIEW-` basename "simply does not contribute" — and with `deriveDodRoundIndex`'s `if (!match) continue` (`orchestrate-dev.js:12387-12392`). |
| 9 | REQ-STATS-02's state enumeration over-distributes across the ACs it names (pm-author; my v3 F-03) | **Yes** | Now "REQ-STATS-03's malformed and unmeasurable states and REQ-STATS-03/04/06's harvested state" — each state is attributed only to the AC that defines it, so a `--json` key-set test written from REQ-STATS-02 alone no longer expects a slot REQ-STATS-04 forbids. |
| 10 | REQ-STATS-08's conjunct (b) lost its list separator (pm-author; my v3 F-04) | **Yes** | Restored: "…set-equal before and after by path and modification time, issues no network request, and runs no `git` write command". Three enumerable assertions with marked boundaries. |

All four of my v3 findings (F-01 Medium, F-02/F-03/F-04 Low) are resolved by this edit.

## Independent re-read

_(filled below)_

## Positive Observations

_(filled below)_

## Recommendation

_(filled below)_

## Delta-Confirmation Findings

_(filled below)_

## Verdict

_(filled below)_
