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

The REQ at HEAD is necessary but not sufficient: I re-read the whole document as a compression of
its upstream sources and re-checked every existing-behaviour claim the edit relies on.

**Claims verified against source and disk (all hold):**

- *"The driver builds that path from a phase it already holds and classifies no `POSTMORTEM-*`
  basename"* — true of the driver: `orchestrate-dev.js:8618` / `:9402` construct the path; the only
  `POSTMORTEM-*` **classification** anywhere in the workflows is
  `consolidate-learnings.js:1684`, a different component and outside C-5's stated fidelity target.
  Accurate as written; see F-02 for the precision note this leaves for FSPEC.
- *"the grammatical-but-out-of-catalogue names the pipeline writes"* — `REVIEW` passes
  `CROSS_REVIEW_RE` (`:10095`) and is then rejected against `REVIEW_DOC_TYPES` (`:10102-10110`),
  reason `bad_doc_type`. Four such files exist under `docs/completed/pdlc-advisory-wave-gate/`.
- *"harvest deletes cross-reviews and DoD reviews while post-mortems survive"* (REQ-STATS-06's
  rationale, load-bearing for the harvested predicate and for REQ-STATS-05 having no harvested
  state) — confirmed both in the skill (`harvest-learnings/SKILL.md` steps 3, 8 and checklist line
  129 delete only `CROSS-REVIEW-*` and `CODE_REVIEW-*`) and on disk: nine of thirteen harvested
  features under `docs/completed/` still carry `POSTMORTEM-*` files (e.g.
  `pdlc-engine-distribution` 4, `pdlc-headless-engine` 4, `pdlc-learnings-injection` 3). So
  REQ-STATS-05 legitimately needs no harvested state, and R-6's mitigation is complete as scoped.
- **REQ-STATS-07's exclusion set is set-equal-assertable at HEAD.** The named eight
  (`_queue`, `_constraints`, `_decisions`, `design`, `requirements`, `ideas`, `discarded`,
  `completed`) are exactly the non-feature directories under `docs/` today; the remaining thirteen
  are feature directories. The "directories only" rule is also fixture-backed — `docs/` currently
  holds one loose file (`PLAN-pdlc-integration-boundary-gates.md`) that the rule must not report as
  a feature, and `docs/completed/REQ-completed.md` is the phantom-`completed` case the AC names.
- **The `RESOLVED:` narrowings still hold** (re-checked from v3): literal token matched
  case-sensitively (`:7604`), only the captured value lowercased (`:7611`).

**Testability of the edited ACs.** Each edited criterion still yields one expected output per
input, and each new clause is a fixture I can name in this repo:
REQ-STATS-03 → the four `-REVIEW-v{N}` files (malformed, counted in no row);
REQ-STATS-04 → `deriveDodRoundIndex`'s grammar (`pdlc-headless-engine`: no surviving `CODE_REVIEW-*`
+ LEARNINGS ⇒ `harvested`);
REQ-STATS-06 → `pdlc-headless-engine` and `pdlc-loop-economics` now agree on `harvested` under one
reading rather than two;
REQ-STATS-07 → a readable-but-empty directory is a normal zero row, an unreadable one is a gap row,
exit 0 either way;
REQ-STATS-09 → root-absent is no longer this AC's case, so its not-found test and EC-09's root test
cannot both claim the same fixture.
No clarifying question is needed to write a black-box acceptance test for any of them, which is the
altitude bar for a REQ.

## Positive Observations

- **The C-5 carve-out is drawn at the seam that actually exists in code, not a convenient one.** It
  separates *classification of bytes* (deferred to the driver: the `RESOLVED:` marker, the
  cross-review grammar, the `CODE_REVIEW-` version grammar) from *discovery of which files exist*
  (owned here, because the driver never discovers — it constructs a path from a phase it holds).
  That is checkable in one grep, and it makes REQ-STATS-05 writable as a test without inventing a
  fidelity oracle that has no counterpart.
- **REQ-STATS-03 takes the unflattering answer rather than the comfortable one.** Disposing of
  pipeline-authored `-REVIEW-v{N}` files as *malformed* reads badly in a report, and the edit says so
  in the AC instead of inventing a third bucket that would have been an independent parsing rule.
  The result is that one existing directory in this repo now has exactly one defensible expected
  output, and the discomfort is routed to FSPEC §7.3 as an erratum rather than papered over.
- **REQ-STATS-06's predicate is now stated at the scope its own rationale argued for.** The
  explicit "(no `CROSS-REVIEW-*` remains, or no `CODE_REVIEW-*` does, or neither)" closes the
  negation-scope ambiguity my v3 F-01 raised without changing behaviour — a test author reads the
  predicate rather than inferring intent from the adjacent paragraph.
- **REQ-STATS-09's carve-out preserves falsifiability on both sides.** By excluding the
  no-`docs/`-root case, the AC keeps its not-found oracle positive and specific, and leaves the root
  failure a distinct, separately assertable outcome (FSPEC's `no_docs_root` reason code) instead of
  two criteria claiming one fixture.
- **All four v3 findings closed with single-clause edits**, and none of them enlarged the REQ's
  scope or pulled FSPEC material upward.

## Recommendation

**Approved with minor changes**

The delta resolves all ten routed items — nine fully, one (item 5) in the acceptance criterion that
governs tests, leaving the identical stale phrase in the **G-3** goal statement one section up. No
approved section was broken by the edit, and every existing-behaviour claim it added checks out
against source or disk. There is no open High finding, old or new, so this confirmation approves.

The two findings below are both non-gating and single-clause: F-01 aligns G-3's summary with the
REQ-STATS-07 text this round corrected, so a reader of the Goals section does not derive an
expectation the ACs contradict; F-02 is a precision note so that FSPEC's post-mortem listing rule is
chosen deliberately against the one adjacent grammar that already exists, rather than by accident.

## Delta-Confirmation Findings

_(filled below)_

## Verdict

_(filled below)_
