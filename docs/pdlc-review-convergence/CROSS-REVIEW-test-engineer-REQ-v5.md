# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 5
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v4.md` (baseline `4df1199`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `4f5be4f`, clean.

## 1. Delta scan

```
git rev-parse 4df1199:docs/.../REQ-pdlc-review-convergence.md → 5258bbb…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → c9343be…
git diff --stat 4df1199 HEAD -- …/REQ-…md → 328 insertions(+), 105 deletions(-)
bytes: 151,011 → 178,410   (+27,399)
```

The revision is v1.2 → v1.3 and it answers round 4 from both panels. Changed sections, and the only
ones scanned below: the header (Cross-Reviews row, v1.3 revision note), §5 (*round growth*, new
*current window*, *zero-delta*; three durability rows plus a new one; the two-writer table; the
catalogue lead-in, the new `HALT-REASON:` paragraph, S-4 and S-10), AC-1.4 (the new preservation
paragraph), AC-1.5(1), AC-1.5(4) restated over counts with a five-row receive side, **new
AC-1.5(5)**, AC-2.1, AC-2.2, AC-2.6's *When* column, AC-2.7 rows 4–5, AC-2.8 (window scoping, the
report row, the digest paragraph), AC-3.1, AC-3.4's five-step reader, AC-4.1 (rewritten), AC-4.2,
AC-4.5, AC-4.7 (`classification` column, the AC-2.8 row, the precedence table now seven rows), §6's
`DOC-SHA256:` row, O-5/O-9/O-10/O-12, **new R-9**, §9.3's new row, and new §10.8. Sections that did
not change — §1–§4, AC-1.1–1.3, AC-2.3–2.5, AC-3.2/3.3/3.5/3.6/3.7, AC-4.3/4.4/4.6, AC-5, AC-6 — are
not re-litigated, except where a changed section is stated *over* one of them: AC-3.2 and AC-1.4's
re-entry gate are read below only as the receivers of AC-1.5(5) and AC-3.1's new window semantics.

Growth into this round is +27,399 bytes — new-mechanism under this REQ's own AC-4.2, and under
**v1.3's** AC-3.1 that classification now escalates *this* round rather than the next, which is the
correct call for a revision that adds a new clause (AC-1.5(5)), a new durable line (`HALT-REASON:`),
a new §5 term (*current window*) and a new risk (R-9).

## 2. Disposition of round-4 findings

## 3. Findings

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict
