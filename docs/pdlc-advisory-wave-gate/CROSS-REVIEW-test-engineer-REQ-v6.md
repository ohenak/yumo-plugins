# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md (v1.16)
**Date:** 2026-08-20
**Iteration:** 6 (delta confirmation, erratum round — DEC-A6-03 halt-message obligation)

## Problem / Context

This round is a **delta confirmation**, not a review. I approved this REQ at v5
(`CROSS-REVIEW-test-engineer-REQ-v5.md`, `REVIEWED-COMMIT: 0cef7148`, document v1.15). One targeted
erratum edit has since landed — `30d8bf7b`, carrying the document to v1.16 — addressing the single
item this round routed, raised identically by se-author, pm-review and me: DEC-A6-03's
operator-facing halt-message obligation (the halt names a captured pre-A6 tree state but never warns
that re-running the feature destroys it) had been routed since round 5 and never landed.

Method: `git show 30d8bf7b` on the REQ (12 insertions, 2 deletions, two hunks — the version/changelog
header and §6 AC-6.3), then a re-read of the upstream this REQ leans on **at HEAD** —
`docs/_constraints/pdlc-wave-gate-baseline.md` v1.2 (`64654032`, unchanged since v5),
`docs/_constraints/pdlc-advisory-corpus-baseline.md` v1.0 (unchanged since v5), and this feature's
`DECISIONS-pdlc-advisory-wave-gate.md` DEC-A6-03, which AC-6.3 now cites by id — to check the REQ is
still a faithful compression of what those files currently say (DEC-ERR-03). Sections outside the two
hunks are not re-litigated except where the upstream re-read reaches them.

## Goals

1. Confirm the routed item landed, as an observable operator-visible outcome rather than a mechanism.
2. Confirm the landed edit breaks nothing I approved at v5 — in particular that AC-6.3 still carries
   its original diagnosis/root-cause obligation, that the addition leaks no capture *name* or storage
   form across the O-1 boundary, and that AC-5.1's excluded-carrier set (the v5 High) is untouched.
3. Re-measure the REQ against upstream at HEAD and report any citation upstream no longer supports,
   whether or not it appears in the routed item list (DEC-ERR-03).

## Non-Goals

- Re-reviewing sections this edit did not touch and the upstream re-read does not reach (§2–§4,
  §5 C-1…C-4, §6 REQ-AWG-01…05, §7, §8 beyond O-1/O-2).
- Product strategy, technical design, or the FSPEC's parallel landing. This confirmation measures the
  **REQ**; whether FSPEC E-28/AT-05-5 also need the warning is the FSPEC's own round (see F-01, which
  raises only the consequence for testability *of this REQ*).
- Reopening DEC-A6-03. The decision is unchanged; only its routed operator-facing obligation moved.

## Constraints

## Acceptance Criteria

## Risks

## Questions

## Positive Observations

## Obligations

## Recommendation

## Delta-Confirmation Findings

## Verdict
