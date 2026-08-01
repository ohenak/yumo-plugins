# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-08-01
**Iteration:** 8
**Scope:** REQ — testability, oracle falsifiability, edge-case completeness, negative-case coverage
**Review type:** delta re-review. Prior review:
`docs/pdlc-review-convergence/CROSS-REVIEW-test-engineer-REQ-v7.md` (baseline `db9b544`).
**Verification baseline:** branch `feat-pdlc-review-convergence` at `af5359c`, clean.

## 1. Delta scan

```
git rev-parse db9b544:docs/.../REQ-pdlc-review-convergence.md → b0af913…
git rev-parse HEAD:docs/.../REQ-pdlc-review-convergence.md    → f86d9a1…
git diff --stat db9b544 HEAD -- …/REQ-…md → 239 insertions(+), 48 deletions(-)
bytes: 241,698 → 268,264   (+26,566)
```

The revision is v1.5 → v1.6 and it answers round 7 from both panels, across nine document commits
(`232fedb` … `9bc94d1`). Changed sections, and the only ones scanned below: the header (Cross-Reviews
row, the v1.6 revision note, the v1.5 note's seven → eight correction), §5 (*reset region* and the two
durability rows, the catalogue lead-in now **seventeen**, the kind list now **six** kinds with the S-16
and S-9 rows moved, the S-16 render, the new **S-17** row, the amended *unavailable* / *malformed*
definition), AC-1.4 (the new *"every halt is exactly that, and an entry refused by AC-1.5(4) is not
one"* paragraph), AC-1.5(1) clause 1 (the not-reached note), AC-1.5(4) (the new *refusal is not a halt*
paragraph and its four bullets, the per-reason repair table, the *why counts-mismatch is repaired by
deletion* paragraph, step 3's hand-edit note, step 4's refusal sentence, the invariant paragraph's
refusal clause), AC-1.5(5) clause 5's re-wrap, AC-2.7's row-3 paragraph, AC-3.2 (*Given* and clause 1
restated over S-17, the new *the range is a boundary-crossing value* paragraph and its two bullets, the
loop-side-response paragraph), AC-4.7 (row A / row B split, row B's six-cell table and its justifying
paragraph, precedence row 8 trimmed), §6 (the `WINDOW-START:` row's scoped prohibition, the S-16 render
row, the new S-17 row), O-3, O-9(c), O-10 (six new or amended bullets), §10.10's lead-in and its TE F-02
row, and new §10.11. Sections that did not change — §1–§4, AC-1.1–1.3, AC-2.1–2.6, AC-2.8, AC-3.1,
AC-3.3–3.7, AC-4.1–4.6, AC-5, AC-6, §7–§9 — are not re-litigated, except where a changed section is
stated *over* one of them: AC-3.2's `## Disposition` receive-side table (`:1413-1424`, unchanged) is
read below as the receiver of the new S-17 refusal, because the new text explicitly delegates to it.

Growth into this round is +26,566 bytes — `new-mechanism` under AC-4.2 (S-17 is a new catalogue member
and AC-4.7 row B is a new report row), which under AC-3.1 escalates round 8 to the full panel, which is
what it got. That is five consecutive `new-mechanism` rounds; R-9 already carries the observation and I
do not re-file it, but the trajectory note in §8 says what the shape of it now is.

## 2. Disposition of round-7 findings

## 3. Findings

## 4. Mechanical fixes

## 5. Measurement Required

## 6. Questions

## 7. Positive Observations

## 8. Recommendation

## Verdict
