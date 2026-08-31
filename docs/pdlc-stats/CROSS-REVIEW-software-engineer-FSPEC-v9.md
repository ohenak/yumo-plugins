# Cross-Review: software-engineer — FSPEC (delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.6)
**Upstream pinned:** `docs/pdlc-stats/REQ-pdlc-stats.md` (re-verified at HEAD)
**Date:** 2026-08-31
**Iteration:** 9 (delta re-review, decision freeze)

## Scope and delta

My v8 approved this document at commit `65f49aca`. `git diff 65f49aca..HEAD --
docs/pdlc-stats/FSPEC-pdlc-stats.md` is **19 insertions / 7 deletions across three sites**, and no
other pipeline document moved in a way this review depends on:

| Site | Change | Round's stated purpose |
|---|---|---|
| Header changelog (§ version table) | `Draft \| pm-author \| 1.5` → `1.6`, plus a v1.6 revision paragraph | Record the round |
| §4.2 BR-16 | Rewrites the out-of-catalogue carve-out; adds the `docs/completed/pdlc-advisory-wave-gate/` provenance sentence | TE v7 F-02 — cite the directory for the *basename shape* only, not the verdict |
| §6.6 AT-15 | Adds a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` to the neither-list and a paired assertion | TE v7 F-03 — pin BR-16's no-bytes half |

Both routed items land in substance. **One factual defect is introduced by this round's edit**: the
new BR-16 sentence states a count of the cited directory that is false at HEAD and contradicts this
same document's §4.2 BR-06. That is F-01 below, and it is why this round is Needs revision.

Under the freeze I checked only the three changed sites, the claims they make about the repository,
and the neighbouring rows those edits could have disturbed. No rule, exit code, enum value or
acceptance-test oracle outside these sites moved (`git diff` carries no `EC-*` or `AT-*` definition
line other than AT-15).
## Business Rules

BR-16 is the round's main edit. The **rule** is unchanged — `harvested` still fires when
`LEARNINGS-{feature}.md` is present and at least one harvest-deleted process family is entirely
absent, still evaluated over exactly BR-14's numerator set, still ordered before BR-15's
zero-denominator test. The edit rewrites the surrounding carve-out and adds a provenance sentence.
I verified each half of that new sentence against the repository rather than against the round's
own account of it.

**Half 1 — the basename shape (holds).** `docs/completed/pdlc-advisory-wave-gate/` does carry files
of shape `CROSS-REVIEW-{role}-REVIEW-v{N}.md`: `CROSS-REVIEW-product-manager-REVIEW-v{1,2}.md` and
`CROSS-REVIEW-test-engineer-REVIEW-v{1,2}.md`. They are on `origin/main`, not a branch artifact, so
the citation is stable ground for a fixture shape.

**Half 2 — "reports a measured ratio itself" (holds).** This is the load-bearing half of the
shape-not-verdict distinction, and it checks out against BR-16's own predicate. The directory has
`LEARNINGS-pdlc-advisory-wave-gate.md` present, but **neither** harvest-deleted family is empty: 58
grammar-matching cross-reviews remain (REQ 12, TSPEC 12, FSPEC 10, DECISIONS 8, PLAN 8, PROPERTIES
8) and `CODE_REVIEW-pdlc-advisory-wave-gate-v{1,2}.md` both remain. So the `harvested` predicate is
false, and all six BR-14 spec documents are present, so the denominator is non-zero and BR-15's
`n/a` does not fire either. The directory reports a measured ratio, exactly as the sentence claims.
Borrowing the shape without the verdict is therefore a sound citation — which is what TE v7 F-02
asked for.

**Half 3 — the count (fails).** The sentence says the directory "carries **two** of them". It
carries **four**. This is not a stale-by-drift number: the same document already states the right
one 94 lines earlier, in §4.2 BR-06 — *"Four such files sit in
`docs/completed/pdlc-advisory-wave-gate/`."* — and AT-09 pins the oracle on that count, asserting
**"all four basenames appear in the malformed list by name"**. The round's edit therefore leaves
one document asserting two counts of the same real directory. See F-01.

The rest of BR-16's rewrite is a faithful compression. The pre-edit text said a directory holding
*only* out-of-catalogue files reports `harvested`; the new text says a directory whose only
`CROSS-REVIEW-` **basenames** are out-of-catalogue does. That is the sharper and correct statement
of the same rule — it scopes the "only" to the cross-review family rather than the whole directory,
which is what BR-14's per-family enumeration actually does. The `CODE_REVIEW-{feature}-draft.md`
clause and the harvest-asymmetry rationale are carried across unchanged.
## Acceptance Tests

AT-15 is the only acceptance test carrying a diff line. The edit adds a
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` file to the *Given*'s neither-list and extends the *Then* with
the assertion that its bytes reach neither side. I applied the three oracle bars to the new leg:

- **Not an absence-only oracle.** The negative — "adding a file on neither list leaves both
  unchanged" — is not asserted alone. It sits on a path that also asserts the positive: the two
  totals equal **the literal sums of their members**. An implementation that globbed
  `CROSS-REVIEW-*` into the process total moves that literal sum and fails, which the edit says in
  as many words. Correctly paired.
- **No implementation echo.** The expected values are literal sums of fixture file sizes chosen by
  the test, not values derived from the code under test.
- **Set-equality, not containment.** The removal probe survives the edit intact — removing any one
  of the nine changes its side's total by exactly that file's size — and the edit does not disturb
  the note that the enumeration and removal legs are non-skippable while the symlink leg is. The
  `nine` remains arithmetically right: six BR-14 spec documents plus three process families, and
  the newly added file is on the neither-list, so it is deliberately outside the nine. Adding it
  did not silently invalidate the count.

The new leg is also the right test for the half TE v7 F-03 identified as unpinned: BR-16's claim
that a `CROSS-REVIEW-`-prefixed basename outside BR-09's six types contributes no bytes had no
falsifying test, and now it has one on the byte-ratio path.

**AT-09 not disturbed, and independently re-grounded.** AT-09 is unchanged by the diff but is the
test that consumes the same real directory, so I re-checked its two repository claims at HEAD: all
four out-of-catalogue basenames are present as it asserts, and its `TSPEC` row expectation of `6`
is right — the grammatical TSPEC cross-reviews there run `v1`…`v6` per role, highest index 6. AT-09
is correct as written; it is BR-16's new sentence that disagrees with it, not the reverse. That
matters for the fix direction in F-01: **BR-16 moves to four, AT-09 and BR-06 stay.**

No other `AT-*` definition carries a diff line — AT-16, AT-17 and the AT-12 malformed-count legs
are byte-identical, so the round did not move an oracle while rewording the rule it pins.
## Edge Cases and Error Scenarios

## Delta-Confirmation Findings

## Findings

## Open Questions

## Positive Observations

## Recommendation

