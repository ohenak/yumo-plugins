# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 16
**Scope:** DELTA re-review. Diff reviewed: `2f18dbd7..HEAD` on this file only — one hunk,
3 insertions / 2 deletions, all inside §8.4's producing-side paragraph. v15 was
**Approved with minor changes**. I did not re-read the document; I read the diff, re-derived the
two citations it touches against HEAD source, and re-checked that the two Lows I left open in v15
are unmoved rather than newly broken.

## Delta

The single change is a **locator repair inside §8.4** (`:1524-1527`). The sentence previously said
the convention this feature adds to `pdlc/skills/harvest-learnings/SKILL.md` is the *metadata table
(`:70-78`)*; it now says the **§5 Open Items convention, `:103-108`**, and adds an explicit negative
clause ("*not* the metadata table, which is where §8.3's separate `Phases exercised` row lands").

| Claim in the new text | Verified against HEAD | Disposition |
|---|---|---|
| The `failure-mode-id` convention lives at `harvest-learnings/SKILL.md:103-108` | `:103` is `## 5. Open Items for Consolidation`; `:104` is the lookup rule ("copy that list's id verbatim onto the item — never re-slug, abbreviate, or mint a new id"); `:106-108` is the fenced `failure-mode-id: {id}` form. The range is exact at both ends — `:102` is §4's body, `:109` is blank before §6 | **Correct** |
| The metadata table is where the *separate* `Phases exercised` row lands | `:70-71` are the metadata table's header and delimiter, `:78` is `\| Phases exercised \| {list of phases this feature's pipeline ran…} \|` | **Correct** |
| §8.3's own citation of `:70-78` (`:1497-1498`, untouched by this diff) still resolves | Same table; the `Phases exercised` row is at `:78`, inside the cited range | **Still correct — not invalidated by the repair** |

The two citations are now **disjoint and each points at the artifact its own sentence is about**,
which is the whole content of the repair. Before it, §8.3 and §8.4 cited the same eight lines for
two different conventions, and only one of them was there — a test author writing AT-F15's fixture
from §8.4 would have gone to the metadata table, found no `failure-mode-id` form, and either
invented one or filed the spec as underspecified.

I also confirmed no other line in the FSPEC cites the harvest skill: `harvest-learnings/SKILL.md`
appears at `:1498`, `:1525` and `:1552` only, and `:1552` carries no line range (it is O-C6's
"nothing at this layer can assert compliance" statement, which is a scope claim, not a locator).
So the repair is complete rather than one of two stale copies.

**Nothing downstream of the sentence moved.** §8.4's four-step table (`:1531-1534`) is
byte-unchanged, and step 3's `append failure-mode-id: {id}` … "never re-slug, never abbreviate,
never mint a new id" is a **literal transcription** of `SKILL.md:104` plus `:107` — the test
author's expected value is still a spec literal, not something derived from the skill file at
test time. AT-F15 (`:2207`), AT-F16 (`:2208`) and AT-F19's set-equality form are untouched, and
all three remain receive-side tests over constructed corpus fixtures, with the producing (LLM)
side still carried as O-C6 rather than claimed as testable. The oracle strength of the section is
exactly what it was in v15.

## Findings

Two **Low**, both **carried forward unchanged from v15** — the diff did not touch §13.5 and did not
claim to. Nothing High or Medium: the delta resolves a real locator defect and breaks nothing
approved in fifteen prior rounds.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| L-01 | Low | Local | **Carried from v15 L-01, unaddressed and non-blocking.** AT-Q7 still states its containment bound by reference to §6.5's columns ("observed ⊆ the domain's permitted set (§6.5's obliged ∪ permitted columns)") while its sibling AT-Q7c states the same bound with the seven-member widened literal spelled in. Both forms are correct — the by-reference form is the one that survives the next TSPEC §9.3 widening — so this is a readability asymmetry between two adjacent rows, not a wrong expected value in either. | §13.5 AT-Q7 (`:2166`), AT-Q7c (`:2168`) |
| L-02 | Low | Local | **Carried from v15 L-02, unaddressed and non-blocking.** AT-Q7c's seven-member literal is pinned to TSPEC §9.3's current contents, so a fifth recorded widening restages the erratum that produced it. Mitigated in the cell itself: the row states the shape rule ("§6.5's frozen set ∪ every widening TSPEC records against it under DEC-LAYER-01") before the instantiation, so a reader who finds the literal short knows which side governs. Recorded as a known drift point, not a repair request. | §13.5 AT-Q7c (`:2168`) |

## Questions

None. The delta is one locator and it resolves cleanly against HEAD.

## Positive Observations

- **The repair states the negative as well as the positive.** It would have been enough to swap
  `:70-78` for `:103-108`. The added clause naming *what does* live in the metadata table
  (§8.3's `Phases exercised` row) is what stops the next reader from re-deriving the same wrong
  citation from §8.3's nearby sentence, which is plausibly how the original defect arose — the two
  conventions are added by one feature, four sections apart, and the first one written was the
  metadata row.
- **Both endpoints of the new range were checkable and both are right.** `:103` and `:108` bound
  the heading through the closing fence exactly; a range short by one at the tail would have cut
  the `failure-mode-id: {id}` form itself out of the citation, which is the one line step 3
  transcribes. I checked the boundary rather than the midpoint for that reason.
- **The pre-existing §8.3 citation was re-verified, not assumed.** A locator repair in one section
  is a standing risk to the neighbouring citation it distinguishes itself from; here `:70-78` still
  contains the row §8.3 claims for it, so the diff leaves two true statements rather than trading
  one false one for another.
- **The expected values in §8.4's step table are still literals.** Step 3's assertion text is a
  transcription of the skill's own words, so a test written from this section cannot accidentally
  import its expectation from the skill file at runtime — the failure mode a locator repair could
  have tempted an author into ("just read the SKILL and compare").
- **The diff is proportionate to the defect.** Three lines, one hunk, no adjacent "while I'm here"
  edits into §8.3 or §13.5. Nothing I approved in v15 needed re-derivation beyond the two citations
  the hunk touches.

## Recommendation

**Approved with minor changes**

The delta repairs a genuine mis-citation in §8.4 with a correct, boundary-exact replacement, adds a
distinguishing clause that prevents its recurrence, and leaves every acceptance test, oracle and
set-equality obligation in the document unchanged. The two Lows are v15's, restated for the record;
neither blocks and neither would cause a test author to write a wrong test today.

## Verdict

VERDICT: Approved with minor changes

{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:bdb8fe63d045321433105d8c4b6bc4a50fb4209fa8cffbf875cdf161d7290df9
REVIEWED-COMMIT: 76476315aa85373a44e166bfe9781954b7687f59
