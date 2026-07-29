# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md` (v5.1, Draft)
**Date:** 2026-07-28
**Iteration:** 6 (SCOPE: verification-only, operator-delegated past the 5-round budget)
**Scope of review:** Exclusively the disposition of my round-5 findings (F-29 Medium; F-30, F-31,
F-32 Low) from `CROSS-REVIEW-software-engineer-FSPEC-v5.md`, verified against v5.1. Per the
operator's explicit scoping instruction, I did **not** re-review the document at large and did not
open new fronts outside the v5.1 diff (`1cdccf3..9fd8c8f`). TE's round-5 findings (F-43/F-45/F-44)
are cross-checked only insofar as they name the same sites as mine; TE's own disposition is TE's to
verify, not mine.

## Verification method

1. Read `CROSS-REVIEW-software-engineer-FSPEC-v5.md` in full to recall the four findings' exact text
   and stated fixes.
2. Ran `git diff 1cdccf3..9fd8c8f -- docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md`
   in full and read every hunk.
3. Grepped the current (post-diff) document for the specific clauses each finding's fix targets, to
   confirm the fix landed at the site claimed and did not regress a site the diff's changelog doesn't
   mention.
4. Confirmed the closed-set/arithmetic invariants F-29's fix depends on (§4.5's nine-member
   `operation` set; §4.4a's 4 stderr-only + 5 recordable = 9 filter arithmetic) are byte-identical to
   v5.0 — i.e. the fix removed a conjunct rather than adding a compensating one.

## Disposition of my v5 findings

| v5 ID | Claim | Verdict | Evidence |
|---|---|---|---|
| F-29 | Medium — AT-15's stderr-token conjunct asserted `operation` tokens with inverted polarity against §4.5's failure-record semantics; a test written verbatim from the Then fails against a correct implementation, and the obvious "fix" (emitting a success token) would grow §4.5's closed nine-member set | **Fixed by removal, exactly as I endorsed, not by re-polarizing.** AT-15's Then (line 2947) now reads only "**Discriminating observable (SE F-29/TE F-43, v5.1):** … the Then asserts that the drift-state file's inode identity **changes** … rather than being preserved … — this discriminates the two rungs on its own." The stderr-token clause is gone; no `drift-state-unlink`/`drift-state-invalidate` presence/absence assertion remains in AT-15. **No success-token emission was added anywhere** — I grepped for any new `operation` value or any sentence describing a token that fires on rung success; there is none. **§4.5's operation set is still exactly nine members** (line 1673: "`operation` is the closed nine-member set of §4: `mkdir`, `drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink` …"), byte-identical wording to v5.0. **§4.4a's 4+5 filter arithmetic is intact** (line 1510: "§4.5's arithmetic, 4 stderr-only + 5 recordable = 9, is the correct one"), unchanged. **The v5.0 note's F-41 disposition was corrected**: the surviving v5.0-note text is now annotated in place — "**Superseded in v5.1 (SE F-29 ≡ TE F-43):** the stderr-token conjunct's polarity was inverted against §4.5's own failure-record semantics and is dropped from AT-15; the inode-identity observable, stated correctly from v5.0, is the sole discriminating oracle going forward" (diff hunk at the F-41 changelog bullet). This is the correct disposition of a stale changelog claim: annotate, don't silently rewrite history. All four sub-claims verified. |
| F-30 | Low — §10 O-11 still carried F-27's "only cause" overclaim, falsified by its own text against the v5.1 fault-seam and ENOSPC changes; plus two nits in §4.4's rung note | **Fixed, all three parts.** O-11 (line 2805) now reads "rung (i)'s only **permission-constructible** cause vanishes (§4.6 fault seam still reaches rung (i) on runner — §4.4's row note — but not AT-14b tests)" — the exact fix I proposed, scoping the overclaim to permission-constructibility and cross-referencing the fault seam and O-11's own test scope. The two rung-table-note nits are both fixed: "Row 2 below" → "Row 2 above" (line 1592: "Row 2 above is the narrower, residual case"), and the mechanism attribution corrected from row 1's (permission-asymmetry) mechanism to row 2's own v4.0 block-release paragraph (line 1589: "block-release argument row 2's own v4.0 paragraph below makes"). |
| F-31 | Low — the not-removed clause's antecedent enumeration named only `stale` and asserted two sub-claims false on the `--force`/`local-edit` path, at three sites (§4.5 contract box, §4.5 explanatory paragraph, §5.5 summary bullet) | **Fixed at all three sites**, verified by grep: line 1654 (§4.5 contract box) — "the row keeps whatever state it had (`stale`, or under `--force` `local-edit`/`unverified`), which is the honest classification of bytes the run never changed"; line 1664 (§4.5 explanatory paragraph) — same substance, tagged "(TE F-39, v5.0; corrected SE F-31, v5.1)"; line 2027 (§5.9/AC-3.7 area) — same substance, same tag. No site was missed and no site diverges in wording from the fix I proposed. |
| F-32 | Low — the v5.0 changelog note claimed a §5.9 sentence for TE Q-01 that the diff never added; §5.9 was byte-identical to v4.0 | **Fixed by correcting the changelog note, as I recommended (not by adding a §5.9 sentence).** The v5.1 note's Q-01 bullet now reads "**answered inside the review; assessed satisfied, no §5.9 change needed (corrected SE F-32 ≡ TE F-44, v5.1):** … a condition that case does not satisfy, so §5.9's existing text already covers it without amendment." This is the honest disposition — it retracts the false "is now a sentence in §5.9" claim rather than compounding it, and does not touch §5.9 itself (consistent with my scoping note that §5.9 changes were TE's to make, not required by my finding). |

## Diff-cleanliness check

I read every hunk in `git diff 1cdccf3..9fd8c8f`. Beyond the four dispositions above, the diff
contains only:
- The version/status header bump (5.0 → 5.1) and the Cross-Reviews table row appending
  `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v5.md` as disposed in the v5.1 note.
- The v5.1 changelog note block itself (the prose disposing SE F-29/F-30/F-31/F-32 and TE
  F-43/F-44/F-45), which is the mechanism by which the four fixes are indexed, not an independent
  document change.
- One TE-owned edit inside AT-15's Given: "either or both of the three guards" → "any subset of the
  three guards" (TE F-45), matching §4.6's existing wording — this is TE's finding, not mine, and is
  a wording-only alignment with no contract effect; I note it for completeness but it is outside my
  round-5 scope and I take no position on it beyond confirming it introduces no regression against
  anything I found.

Nothing beyond these dispositions plus the version/header/revision-note updates is present. No AT
was added or renumbered, no REQ text was touched, and no new `operation`/`rows[].reason`/
`baselineReason` value was introduced — consistent with the v5.1 note's own "Nothing deferred"
closing line, which I independently confirmed rather than took on faith.

## Findings

None. All four round-5 findings are correctly disposed; the diff introduces no new issue within the
scope of this verification pass.

## Questions

None carried forward in scope. (My v5 Q-01, re: AT-16's uid-0/root-capability status under the
rung-granular fault seam, was explicitly not an FSPEC-change request and remains open for TSPEC
authoring per its own text — it is not a round-5 finding subject to this verification pass and I do
not re-litigate it here.)

## Positive Observations

- **F-29's fix took the cheaper and correct branch.** Removing the stderr-token conjunct rather than
  re-polarizing it avoids reopening the closed nine-member `operation` set and the 4+5 filter
  arithmetic — the exact trap I flagged as the "obvious repair" risk. The inode-identity observable
  was already correct from v5.0 and is sufficient on its own; nothing was lost by dropping the
  redundant, broken conjunct.
- **The two false changelog claims (F-30's O-11 rationale, F-32's §5.9 claim) were both fixed by
  correcting the note itself**, not by making the document say something new to retroactively
  justify the note. This is the honest disposition and keeps the changelog auditable for the next
  reviewer, which was the meta-point of both findings.
- **The not-removed clause fix (F-31) was applied uniformly at all three sites** with identical
  substance, avoiding the partial-fix pattern (a subset of sites updated, the rest left stale) that
  this same defect class has produced in prior rounds (v3 F-23).

## Recommendation

**Approved**

All four round-5 findings — one Medium (F-29), three Low (F-30, F-31, F-32) — are correctly and
completely disposed in v5.1. The diff contains nothing beyond these four fixes, the version/header/
revision-note bookkeeping, and one TE-owned wording alignment (F-45) outside my scope. The closed-set
invariants (§4.5's nine-member `operation` set, §4.4a's 4+5 filter arithmetic) that F-29's fix had to
preserve are verified byte-identical to v5.0.

Trajectory: 12H/10M → 4H/7M → 0H/1M → 0H/0M → 0H/1M → **0H/0M (verified)**.

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
