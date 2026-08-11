# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (v1.3)
**Date:** 2026-08-11
**Iteration:** 3

**Scope:** Delta re-review only. The diff `07bb1b0a..HEAD` on this document is three
hunks (header/changelog, DEC-ENG-03's authority paragraph, one deleted §7 bullet);
those are what I read. Round-2 findings are dispositioned below; unchanged sections
already approved are not re-litigated. Every claim is grounded at HEAD on
`feat-pdlc-headless-engine` with `file:line`.

## Round-2 disposition

| Prior | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 (containment test's position predicate — `name:` fields in exported `meta` objects are skill-name literals but not union members) | Medium | **Open, carried forward** | DEC-ENG-05 is byte-unchanged in this diff. The collision still exists at HEAD: `name: "orchestrate-dev"` (`pdlc/workflows/orchestrate-dev.js:3316`) and `name: "orchestrate-queue"` (`pdlc/workflows/orchestrate-queue.js:45`) are skill-identifier literals in modules the containment test scans, and neither names a dispatchable skill. Non-gating, re-recorded as F-02 below |
| F-02 (filtered-run skip has no positive counterpart, so the false-positive detector can be permanently green) | Medium | **Open, carried forward** | DEC-ENG-10's §7 row is byte-unchanged: "the runner detects a filtered invocation and reports the suite-wide step skipped-with-reason rather than passing or failing it" (`DECISIONS:850`) — still one-directional. Non-gating, re-recorded as F-03 |
| F-03 (no clause saying the interpreter probe's PROPERTIES rows wait on the FSPEC errata) | Low | **Partly overtaken, still open** | The REQ half of the block has genuinely cleared (C-11 landed), which narrows what PROPERTIES must wait on, but §8's row (`DECISIONS:844`) still carries no scheduling clause and now also mis-states what remains blocked — see F-01 below |

**Did the revision break anything?** No. I checked the one deletion specifically:
the §7 bullet "Two concurrent runs against one worktree remain undetected
(DEC-ENG-14)" was removed, but it was the *weaker* of a duplicate pair — the
stronger statement survives verbatim at `DECISIONS:858-859` ("not merely undetected
but **undisclosed** … closing that is left to O-ENG-T2 alongside detection"). A
dedupe that keeps the stronger sentence is a net improvement, not a lost cost row.
The header's reviewer-lineage correction is also right: the DECISIONS cross-reviews
on this branch are `product-manager` and `test-engineer`, and no
`CROSS-REVIEW-software-engineer-DECISIONS-*` file exists.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **§8's blocked-on-upstream row was not re-synced with the authority that landed, so it now contradicts the entry it summarises.** DEC-ENG-03's body says the REQ half has landed and cites it (`DECISIONS:192-197`, C-11 at `REQ-pdlc-headless-engine.md:284-298`, v0.10 — I read the range; the bullet does start at `:284` and ends at `:298`, and REQ's version row reads `0.10` at `:20`). §8's row still lists "the precondition's authority (a REQ constraint)" among the items that "are FSPEC/REQ errata, not PLAN's to choose" (`DECISIONS:844`). §8 is the row PLAN reads to decide what it may schedule; an overstated block is a scheduling defect in the same way an understated one is, and here the two halves of the document disagree about a fact that is checkable in one grep. The fix is the same sentence the body already contains: strike the REQ constraint from that row's blocked list, leaving the EC row, message obligations, rung placement and dry-run fatality — the four that are genuinely still outstanding (`grep -icE "python\|interpreter"` over `FSPEC-pdlc-headless-engine.md` returns `0` at HEAD, so the FSPEC half of the row is accurate as written). | §8 collated table, DEC-ENG-03 |
| F-02 | Medium | Local | **Carry-forward, unchanged from round 2.** DEC-ENG-05's containment test ("every skill-identifier literal in either module is a member of the exported union", no exemption list — `DECISIONS:848`) is falsified at HEAD by two literals that are not dispatchable skills: `orchestrate-dev.js:3316` and `orchestrate-queue.js:45`. An implementer transcribing the clause literally gets a red suite the spec says should be green. One sentence fixes it — scope the quantifier to the enumerated dispatch-carrying positions and state that exported `meta.name` fields are out of scope. Recorded, not gating: it lands in PROPERTIES/PLAN authoring either way. | DEC-ENG-05, §7 |
| F-03 | Medium | Local | **Carry-forward, unchanged from round 2.** DEC-ENG-10 obliges only the *filtered* run to report the suite-wide step skipped-with-reason (`DECISIONS:850`). With no counterpart obligation on the **unfiltered** run — that the step actually *ran*, i.e. the summary carries a pass rather than a skip — an over-matching filtered-invocation detector (an added npm script flag, a CI wrapper passing `--test-reporter`, an argv-parsing slip) leaves the three set-equality assertions permanently skipped and permanently green. Pairing the two directions is cheap and makes the detector falsifiable both ways. | DEC-ENG-10, §7 |
| F-04 | Low | Local | **Carry-forward, narrowed.** §8 still records no scheduling clause for the interpreter probe's test artifacts. With C-11 landed the wait is now solely on the FSPEC erratum (EC row, message obligations, rung placement, dry-run fatality), which makes the clause easier to write than it was in round 2: "no PROPERTIES row for the interpreter probe is authored before the FSPEC erratum lands." Without it, PROPERTIES written against the current text is written twice. | DEC-ENG-03, §8 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Both round-2 questions (Q-01 on whether a mis-built hook path actually yields an explicit `allow` verdict rather than an execution error; Q-02 on whether DEC-ENG-04's red fixture reads the *running* pair from `process.platform` and the resolved transport, or from fixture data) went unanswered in v1.3 because the revision was scoped to Step 3 of POSTMORTEM-D. Neither blocks this verdict. Both become unavoidable when the corresponding PROPERTIES rows are written — worth settling in the TE authoring pass rather than in implementation review. |

## Positive Observations

- **The correction is exactly as wide as the fact that changed.** DEC-ENG-03's
  authority paragraph now separates the two halves: REQ landed and is cited
  (`DECISIONS:193`), FSPEC is still zero-hits and still an erratum
  (`DECISIONS:195-197`). I re-derived both halves independently — C-11 exists at
  `REQ:284-298` in v0.10, and the FSPEC grep returns 0 — and the change note's
  self-description ("the 'zero hits in both' claim was half false", `DECISIONS:20`)
  is the honest wording, not the flattering one.
- **The narrow half survived the good news.** The easy move on learning that C-11
  landed would have been to widen the decision to match the new authority. The entry
  instead keeps the same narrow claim it had when it had no authority at all
  (`DECISIONS:197-199`) and still refuses to settle rung placement and dry-run
  fatality. A decision that does not grow when its cover grows is one a reviewer can
  stop re-checking.
- **The DEC-ENG-14 dedupe removed the right sentence.** Two bullets said the same
  thing at different strengths; the survivor is the stronger one
  (`DECISIONS:858-859`). Deletions in a standing-costs list are the ones worth
  auditing, and this one loses no cost.

## Recommendation

**Approved with minor changes**

No High findings. The v1.3 delta is correct on every claim it makes, and the one
deletion it performs loses nothing — I checked both directions rather than assuming
the dedupe was benign.

The four open findings are one-sentence edits, none of which changes a decision or
blocks PLAN: re-sync §8's blocked list with the authority that landed (F-01), scope
the containment quantifier's positions (F-02), pair the filtered-run skip with a
positive "the step ran" assertion on unfiltered runs (F-03), and record that the
interpreter probe's PROPERTIES rows wait on the FSPEC erratum (F-04). F-02 and F-03
are unchanged from round 2 and are recorded, not gating, per the High-only
convergence bar.

No upstream erratum filed this round. The FSPEC half of DEC-ENG-03's authority is
genuinely still missing at HEAD, but the document already records it as filed and in
flight (`DECISIONS:196-197`, `:215`, `:227`); re-filing would duplicate an item
already routed.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}

APPROVAL-HASH: sha256:a55bd7b4160bd8dc9367e0d512aef0efa0a7503441b1207fbcd95f8a78303371
REVIEWED-COMMIT: 4c89a75aff43be09dade15f96430b7cc6fbd0470
