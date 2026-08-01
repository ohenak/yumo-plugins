# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 4
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v3.md` (baseline `2e1ccec`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `4df1199`, clean.

## 1. Delta scan

This round is the opposite of round 3: the document really changed, and substantially.

```
git rev-parse 2e1ccec:docs/.../REQ-pdlc-review-convergence.md → ab4d55f…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → 5258bbb…
git diff --stat 2e1ccec HEAD -- …/REQ-…md → 354 insertions(+), 75 deletions(-)
bytes: 116,569 → 151,011   (+34,442)
```

The revision is v1.1 → v1.2 and it answers both panels' round-2/3 lists. Changed sections, and the
only ones scanned below: the header (Citation-baseline paragraph, Cross-Reviews row, revision note),
§3 BL-01, §4.3 M-3d, §4.7, §5 (*panel shape*, *crashed*, *round growth*, new *zero-delta*; the
durability table; the closed catalogue, now eleven strings with a two-writer table), AC-1.5(4),
AC-2.2, AC-2.4, AC-2.7, **new AC-2.8**, AC-3.2(2), AC-3.3, AC-3.4, AC-3.5(a)/(e), **AC-4.1**,
AC-4.7, AC-6.4, §6 (three rows changed, one added), N-3/N-7, O-4/O-10 and **new O-12**, R-5, **new
R-8**, §9.3, and new §10.7. Sections I approved earlier and that did not change — §1, §2, AC-1.1–1.4,
AC-2.1/2.3/2.5/2.6, AC-3.1/3.6/3.7, AC-4.2–4.6, AC-5, AC-6.1–6.3/6.5–6.8 — are not re-litigated,
except where a changed section is stated *over* one of them (AC-3.1 and AC-4.2 are read in §3 F-01
only as the receivers of AC-4.1's restated formula).

Growth into this round is +34,442 bytes — under this REQ's own AC-4.2 that is **new-mechanism**
(> 12,000), and AC-3.1 would therefore have escalated round 4 to the full panel. It did, which is
the right outcome for a revision that adds a new AC (AC-2.8), a new writer, two new catalogue strings
and a new clause to AC-1.5.

## 2. Disposition of round-3 findings

## 3. Findings

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict
