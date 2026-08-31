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

No edge-case row changed. EC-05 — the row that classifies a `CROSS-REVIEW-`-prefixed basename
failing the grammar, explicitly including "a document type outside BR-09's six … including the
pipeline's own `CROSS-REVIEW-{role}-REVIEW-v{N}.md`" — is byte-identical and remains consistent
with the rewritten BR-16 and the extended AT-15: excluded from every round count, listed as
malformed, exit column `0`. EC-12 (`n/a` on zero denominator) and EC-19 (a link contributes its own
size) are untouched and still agree with the AT-15 legs that cite them.

This was the neighbour set most exposed to the edit — a rule rewrite about out-of-catalogue
basenames could easily have drifted from the edge-case row that classifies them — so I checked it
rather than assuming the "no rule changed" self-certification. The certification holds for
behaviour: no exit code, enum token (`no_docs_root`, `unreadable_feature`, `harvested`, `n/a`,
`unmeasurable`) or JSON field moved in the diff.

## Open Questions

None. The one open item is F-01, which is a one-word correction with an unambiguous direction, not
a question needing a decision.
## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | High | delta | local | BR-16's new provenance sentence says `docs/completed/pdlc-advisory-wave-gate/` "carries **two**" out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files. It carries **four** at HEAD (pm v1/v2, te v1/v2, present on `origin/main`), and §4.2 BR-06 in this same document says "Four such files sit in" that directory, while AT-09 asserts "all four basenames appear in the malformed list". The round's edit introduces both a false repository claim and an internal contradiction with the oracle that consumes the same directory. Fix: `two` → `four`; BR-06 and AT-09 are correct and must not move. | §4.2 BR-16 |

FINDING: High | delta | local | §4.2 BR-16 provenance sentence | Says the cited directory carries "two" out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files; HEAD carries four, and §4.2 BR-06 and AT-09 in this same document both say four — fix the count to four in BR-16 only

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | BR-16's new provenance sentence undercounts the cited real directory as "two" out-of-catalogue cross-reviews where HEAD has four, contradicting §4.2 BR-06 ("Four such files sit in…") and AT-09's "all four basenames" oracle. One document, two counts of the same directory; a reader who trusts BR-16 and "corrects" AT-09 breaks a passing oracle. Change `two` to `four` in BR-16; leave BR-06 and AT-09 as they are. | §4.2 BR-16 |
## Findings

## Open Questions

## Positive Observations

- **The shape-not-verdict distinction is the right repair, and it is true.** TE v7 F-02's risk was
  that citing a real directory for a malformed basename would be read as citing it for a
  `harvested` verdict. The edit separates the two explicitly and the separation survives checking:
  the directory really does report a measured ratio, because both harvest-deleted families are
  non-empty there and all six spec documents are present. The claim that would have been easiest to
  hand-wave is the one that holds.
- **AT-15's new leg is properly paired.** The natural way to pin "these bytes reach neither side" is
  an absence-only assertion, which no implementation error would ever fail. The edit instead hangs
  the new file off the existing literal-sum equality and names the failing implementation — a
  `CROSS-REVIEW-*` glob into the process total — so the leg has a concrete falsifier.
- **The `nine` was kept honest.** Adding a file to AT-15's *Given* is exactly where an enumeration
  count silently rots. The added file went to the neither-list and the nine stayed six-plus-three,
  with the removal probe and its set-equality rationale intact.

## Recommendation

**Needs revision** — one High finding (F-01), introduced by this round's edit.

Both routed items land in substance and I would otherwise approve: the rule, exit codes, enum
tokens, edge-case rows and every acceptance test but AT-15 are byte-identical, AT-15's new leg is
correctly paired and set-equality-preserving, and BR-16's shape-not-verdict citation is sound where
it matters most. What blocks is narrow and factual: the new sentence miscounts a real directory as
carrying two out-of-catalogue cross-reviews when it carries four, contradicting both the repository
at HEAD and this document's own BR-06 and AT-09.

The fix is one word — `two` → `four` in §4.2 BR-16, with BR-06 and AT-09 left untouched, since both
are correct as written and AT-09's oracle is verified green against the real directory.
## Recommendation

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 0}
