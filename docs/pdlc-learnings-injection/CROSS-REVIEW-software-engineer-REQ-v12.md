# Cross-Review: software-engineer — REQ (delta re-review, round 12)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.10)
**Date:** 2026-08-21
**Iteration:** 12

## Problem / Context

This is a DoD-round erratum re-review. The delta under review is **not yet committed** — it sits in
the working tree over `HEAD` (`bbc88069`, "dod: code review v1"):

```
docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md | 7 +++++--
```

Two hunks, five inserted lines, two removed:

1. **Header row** — version `0.9` → `0.10`, with the erratum note naming its trigger
   (DoD round 1, `CODE_REVIEW-pdlc-learnings-injection-v1.md` F11) and its claim ("what the
   shipped selection does and what FSPEC v0.14's BR-6 now states").
2. **AC-2.4** — a new attribution clause: a document already cut by the count bound (AC-2.2) is
   reported under **that** cause even when the total bound also failed on the documents that
   remained; only documents the total bound drops are reported under it. Closing sentence: "The
   reason ids of AC-3.2 name causes, not coincidences."

Nothing else in the REQ moved. My v11 review anchored `REVIEWED-COMMIT: 4db24c50`; that commit is
not an ancestor of the current `HEAD` (branch history was rewritten by the implementation phase), so
I re-anchored the delta against the REQ's last committed state — `caeb5f54` ("REQ erratum v0.9"),
whose bytes are the v0.9 text I approved in v11 — and diffed the working tree against it. The
result is the two hunks above and nothing more; I verified this with `git diff` on the path, not by
re-reading the document.

Per the delta protocol I did not re-read the sections I approved in rounds 1–11. I verified
(a) the two changed hunks against shipped code at HEAD, (b) the three v11 findings, and
(c) that the delta did not falsify any neighbouring AC it now references (AC-2.2, AC-3.2).

## Goals

1. Confirm the AC-2.4 attribution clause is true of the code that ships at HEAD — that it describes
   the implementation rather than prescribing a change to it.
2. Confirm the header's two factual claims about other documents (FSPEC v0.14's BR-6; CODE_REVIEW v1
   F11) resolve to the cited text.
3. Confirm the clause does not contradict AC-2.2, AC-3.2's reason-id catalogue, or the owning
   acceptance test.
4. Dispose of my three v11 findings (F-01 TSPEC divergence, F-02 FSPEC pointer, F-03 AC-5.1b
   attribution).

## Non-Goals

- Re-litigating settled AC content. DECISION FREEZE is in force; only a defect this delta
  introduced, or a factual contradiction with HEAD or an upstream document, may block.
- Re-reviewing unchanged sections. AC-1.x, AC-2.1/2.3/2.5/2.6, AC-3.x, AC-4.x, AC-5.x, §1–§4 are
  unchanged bytes I have already approved.
- Reviewing the TSPEC, FSPEC or PLAN as artifacts. They are read here only as far as the REQ delta
  cites them.
- Product-strategy or test-pyramid judgement. Engineering lens only.

## Constraints

## Acceptance Criteria — delta verification

## Findings

## Questions

## Risks

## Obligations

## Positive Observations

## Recommendation

## Verdict
