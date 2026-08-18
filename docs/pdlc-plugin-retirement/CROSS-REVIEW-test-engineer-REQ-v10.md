# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md (v0.12)
**Date:** 2026-08-18
**Iteration:** 10 (delta confirmation, erratum round)

## Scope of this round

Delta confirmation only. Routed item: **C-7 needs a disposition for the held-branch interim
state** — whether AC-1.1's red while classes 7–12 are held is a registered expected failure
(`SKIP_INVENTORY`-style) or a genuine gate that forbids an intermediate commit (raised by
se-author).

Reviewed: `git diff cc009367^..cc009367` on the REQ, plus the upstream text the delta leans on
(AC-1.1's *given*, C-5, C-7's pre-existing body, C-8) and the downstream statements the delta
must stay faithful to (`DECISIONS-pdlc-plugin-retirement.md` §"What a gated merge looks like",
FSPEC §3.1 class table). Unchanged sections were not re-litigated.

## Verdict on the routed item

**Resolved.** The delta answers the question in the only direction that keeps the criteria
falsifiable: AC-1.1's unsatisfied set-equality while a class is held is an *incomplete feature
on an unmerged branch*, not a C-7 red and not a registered failure. Three properties I checked
specifically, because each is what a skip-register would have destroyed:

- **No absence-shaped escape hatch.** "There is no skip-list, no expected-failure inventory and
  no tolerated-red register in this feature" is stated positively and unconditionally, and the
  rationale is the right one — "a criterion that is allowed to be red by registration stops
  being a criterion". AC-1.1 stays a falsifiable oracle for the whole sweep.
- **The resolution named is ordering, not registration.** "Where a check that observes a held
  class would otherwise run red in repo CI before that class lands, the resolution is ordering —
  the check becomes live with the class it covers." This is testable at the commit level and
  matches TSPEC's BR-SWEEP-4 (a gate-read reference never lags its subject) and TSPEC T-5's
  blocking note.
- **The merge bar is unchanged.** "The branch does not merge on a green subset: completion is
  all criteria satisfied at HEAD, held classes included." Faithful to DECISIONS' "intended
  interim outcome is a partial merge held on branch, not a partial main".

Citation check: AC-1.1's *given* does read "Given the sweep is complete at HEAD" (`:296`), so
the delta's appeal to it is accurate; C-5's one-class-one-commit rule is what makes "does not
forbid the ungated classes from landing as their own commits" coherent. Nothing previously
approved is contradicted or weakened by the added paragraph — it is additive prose inside C-7
and touches no criterion text.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | The new paragraph attributes the general prohibition to C-8 ("C-8 already forbids that shape"), but C-8's text is narrower than the claim: it forbids *tests deleted with their subject (M-8)* being "skipped, marked pending or left asserting a vacuous truth" — it says nothing about a tolerated-red register for acceptance criteria. The prohibition still holds, because the paragraph states it directly in its own right; only the attribution overreaches. Suggested wording: "C-8 forbids the test-level form of that shape, and this constraint forbids the criterion-level form." | §5 C-7, held-classes paragraph |

## Questions

| ID | Question |
|----|---------|
| Q-01 | None blocking. For TSPEC/PROPERTIES: the ordering rule implies a class's AT lands **in or after** its class commit, never as a standalone red-test commit on the branch. Confirm PROPERTIES states which commit hosts each gated AT (classes 7–12), so the TDD red is observed locally rather than committed red. |

## Positive Observations

- The disposition picks the falsifiability-preserving branch of the question rather than the
  convenient one. A `SKIP_INVENTORY`-style register would have converted AC-1.1 from an oracle
  into an advisory note, and the REQ names exactly that failure mode in one sentence.
- "Ordering, never registration" is a rule an implementer can apply mechanically at each commit,
  and a reviewer can check by reading a diff — no judgement call, no per-case negotiation.
- The paragraph separates the two things the routed item conflated: what C-7 governs (repo CI at
  each commit) from what AC-1.1 governs (the completed sweep at HEAD). That distinction is what
  makes both checkable at once instead of appearing to contradict.
- Nothing was added to the criteria themselves; the erratum stayed inside the constraint prose it
  was routed to, so no previously approved oracle moved.

## Recommendation

**Approved with minor changes**

The routed item is resolved and nothing previously approved regressed. F-01 is a citation
precision fix inside one clause; it changes no rule and does not require a REQ round of its own —
fold it into the next edit that touches C-7 for any other reason.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
