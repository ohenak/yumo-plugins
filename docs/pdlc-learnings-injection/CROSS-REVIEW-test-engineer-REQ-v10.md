# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 10
**Round type:** delta confirmation under decision freeze — delta present (`a2353445`, erratum v0.9)
**Scope:** the v0.9 diff (`386e4f0c..a2353445`, +14/-8, four hunks) and the three findings v9 left open.

## Problem / Context

Round 9 was a no-delta round: the erratum dispatch had not landed, so its three findings
(F-01 High, F-02 Medium, F-03 Low) stood against unedited bytes. Round 10 has a real delta.
`a2353445` ("REQ erratum v0.9 — v9 findings: unlistable divergence, AC-3.1 closure scope")
touches exactly four passages: the changelog row, §1.2 claim 2, AC-3.1's closure sentence with
an adjacent AC-3.2 clause, and AC-5.1b's sibling-reader attribution. That is one passage per
routed item plus the version bump, with no collateral edits elsewhere in the 493-line document.

All three routed items landed, and all three landed *correctly against HEAD source* — I
re-derived each code claim from the working tree rather than accepting the erratum's own
account of it. F-01, which had survived three rounds, is now stated in terms that match
`consolidate-learnings.js` line for line and, more importantly, names the divergence the
previous phrasing concealed. No High finding remains open.

Under the decision freeze, two observations about the delta are recorded as Low findings and
one as a `DEFERRED:` line; none meets the blocking bar, since none is a defect the delta
introduced and none contradicts the repository at HEAD.

## Goals

- Confirm the v0.9 delta resolves v9's F-01, F-02 and F-03 without breaking approved sections.
- Re-verify every code-level premise the delta touches directly against HEAD, not against the
  erratum's summary of HEAD.
- Scan only the four changed passages for new issues, and check the delta against the sections
  that cite them (§1.3, C-3, AC-3.3) for contradictions the edit could have opened.

## Non-Goals

- Re-litigating unchanged sections already approved in earlier rounds.
- Opening any new decision. The round is frozen; improvements I would have argued for in an
  open round are recorded as `DEFERRED:` lines, not findings.
- TSPEC-altitude mechanics. Findings below ask only whether the REQ's black-box observables are
  writable as tests today and whether its premises match shipped code.
