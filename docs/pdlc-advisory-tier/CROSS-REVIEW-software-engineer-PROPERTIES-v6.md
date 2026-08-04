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

One Low, carried forward unchanged in substance and narrowed in scope. No new finding: there is no
new text to find one in.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 (carried from v5) | Low | Local | **§6.5's conjunct-1 parenthetical still calls the A1/A3 form "stronger" after the surrounding text renamed it "different".** `PROPERTIES:566` reads "A1 and A3 take **the stronger form** stated below"; `PROPERTIES:593` reads "**A1 and A3 take a different form, and for the same reason**". "Stronger" was accurate under v1.2, when A1/A3 carried one conjunct against A2/A4/A5's two. Under v1.4 both families carry exactly two conjuncts and the only distinction is the direction of the mutation control — at A2/A4/A5 the stub *replaces* a declared gate, at A1/A3 it is *installed* where the shipped seam declares `null` (`PROPERTIES:619-623`, agreeing with `PLAN:869` and `PLAN:258`). A test author who reads "stronger" and stops there could reasonably infer that A1/A3 must assert everything A2/A4/A5 assert *plus* something, and then look for a `post-action-verification-failed` disposition at a seam that can never produce one. Nothing downstream is wrong — the correct assertion is stated unambiguously twelve lines later, and no property, level, count or oracle is affected — which is why this is Low and not Medium. **Fix:** at `:566` replace "the stronger form" with "the A1/A3 form". One phrase, one line, no other edit required. | §6.5, PROP-GATE-01 … PROP-GATE-05 |

### Checks re-run against the three oracle-quality bars

Unchanged text, so unchanged conclusions — restated because the bars are a standing gate, not a
one-round test:

- **No implementation echoes.** §6.5 conjunct 2's expected value for the gateless seams is the
  literal `null` transcribed from `TSPEC:655` and `TSPEC:657`, which I re-read at HEAD and which
  still carry that word normatively. Nothing in the oracle imports from or derives against the seam
  module under test.
- **No absence-only oracles.** The A1/A3 behavioural conjunct pairs "`resolved` is unreachable on
  every path" with the positive O-1 triple on the same path (`PROPERTIES:607-611`), and §6.5 says in
  as many words that "Never `resolved`" alone is satisfied by a thrown error, by `no-action`, or by
  an unset field (`PROPERTIES:571-573`).
- **Completeness by set-equality.** PROP-GATE-06 asserts the gate registry's key set equals
  `ADVISORY_SEAMS` by set equality in one place, so a deleted case fails rather than passes
  vacuously; PROP-PROH-05 does the same over the seams the advisory paths receive.

### Trace and test-home checks

- **Every PLAN task the document claims a Home in resolves.** The `Home:` cells name PLAN §8.2 block
  ids (`A-22 — driver lifecycle`, `A-23 — A3/A4 gate exclusivity`, `A-24 — A5 gate exclusivity`,
  `A-31 — A1/A2 gate exclusivity`) and PLAN task ids (`A-01`, `A-06`, `A-07`); I spot-verified the
  ones my v5 review had already grounded — `PLAN:252` and `PLAN:308` for A-01, `PLAN:257` for A-06,
  `PLAN:258` and `PLAN:869` for A-07 — and PLAN is unchanged at HEAD, so they still resolve.
- **Every named test file is either present or explicitly new.** `advisoryPreflight.test.js` exists
  on the branch (`pdlc/workflows/__tests__/advisoryPreflight.test.js`, currently untracked, owned by
  `A-01` per `PLAN:308`). The other thirteen homes — `advisoryBundle`, `advisoryConfig`,
  `advisoryDisabled`, `advisoryDodSeams`, `advisoryDriver`, `advisoryEnvelope`,
  `advisoryEscalationLog`, `advisoryHarvest`, `advisoryPubSeam`, `advisoryQueueSeams`,
  `advisoryRecord`, `advisoryRung`, `advisoryVerdict` — do not exist yet and are not claimed to; each
  is a new file created by its owning PLAN task. That is the correct state for a PROPERTIES document
  at Phase PR, not a gap.

## Questions

## Positive Observations

## Recommendation

## Verdict
