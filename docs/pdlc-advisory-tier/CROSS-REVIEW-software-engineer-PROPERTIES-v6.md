# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 6
**Scope:** Local (unless a finding row says otherwise)

## Delta analysis

**Delta base:** `865c520` (the commit my v5 review was written against) → `4df1f7b` (HEAD).

**The document under review is byte-identical to the one I approved in v5.**
`git diff 865c520 HEAD -- docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md` produces empty
output, and `git log --oneline 865c520..HEAD -- docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
lists no commits. The last commit to touch it is still `6bcd258` ("R-4 §6.5/§12.3 — answer se Q-09 …"),
and the header still stamps version **1.4 / 2026-08-04**.

The two upstream documents PROPERTIES cites most heavily are also unchanged over the same window:
`git log 865c520..HEAD` is empty for both `PLAN-pdlc-advisory-tier.md` and
`TSPEC-pdlc-advisory-tier.md`. `git diff --stat 865c520 HEAD` for the whole tree is six files, all of
them cross-review documents (`pm PLAN v10`, `pm PROPERTIES v5`, `se FSPEC v8`, `se PROPERTIES v5`,
`te FSPEC v8`, `te PLAN v10`), plus the anchor-recording commit `4df1f7b`. No source file, no spec,
no test file changed.

Consequences for this round, stated plainly so the record is unambiguous:

- **Nothing was broken by the revision**, because there was no revision. The property inventory is
  necessarily still 183 rows and §12.3's 195 / 148 / 40 / 7 / 0 split is necessarily still intact —
  not because I recounted, but because the bytes did not move.
- **Every citation I re-grounded in v5 still resolves**, for the same reason: the citing lines and
  both cited documents are unchanged. I re-checked the two that would be most sensitive to an
  upstream edit — `TSPEC:655` and `TSPEC:657`, the normative `verifyGate: null` rows for A1 and A3 —
  and both are byte-identical to what I quoted in v5.
- **My one v5 finding is by construction still open.** It was Low then and it is Low now; it does not
  change the verdict.

Because there is no delta, the delta protocol's "scan only the changed sections" reduces to a
no-op scan. I did not re-litigate the unchanged sections I approved in v5, v4 and earlier — that is
the protocol working as designed, not an abbreviated review.

## Disposition of v5 findings

| v5 | Sev | Status | Evidence |
|----|-----|--------|----------|
| F-01 | Low | **Still open — and narrower than I wrote it** | The finding had two halves. The half that stands: `PROPERTIES:566` still reads "(at the three seams that can apply an action — A2, A4, A5; A1 and A3 take **the stronger form** stated below)", while `PROPERTIES:593` describes the same two seams as taking "**a different form**, and for the same reason". "Stronger" is the word the v1.3 text used when A1/A3 carried one conjunct and A2/A4/A5 carried two; both families now carry two, so it is a stale comparative. The half I should not have filed: I quoted `:562-563` as ending at "take the two-conjunct form stated below", but the line actually continues "…, **which runs the mutation in the opposite direction**" — the distinguishing information I asked for is already there, and my quote was truncated. I withdraw that half rather than carry it. The residue is a single stale adjective at one line. |

I am recording the withdrawal explicitly rather than silently dropping it: a reviewer who mis-quotes
a line and then files against the mis-quote costs the author a round, and the correction belongs in
the same ledger the finding was raised in.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
