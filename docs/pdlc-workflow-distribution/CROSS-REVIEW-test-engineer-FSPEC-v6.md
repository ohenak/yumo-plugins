# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md` (Draft v5.1, 2026-07-28)
**Date:** 2026-07-28
**Iteration:** 6 (SCOPED VERIFICATION — operator-delegated, past the 5-round budget)

**Scope of this review.** This is **not** a normal delta re-review. Phase F's REQ↔FSPEC review loop
hit its 5-iteration budget at round 5 (`CROSS-REVIEW-test-engineer-FSPEC-v5.md`, one Medium: F-43).
By operator delegation, this round is a **narrow verification** limited exclusively to the
disposition of my own round-5 findings (F-43 Medium, F-44/F-45 Low) against FSPEC v5.1, plus a
diff-cleanliness check confirming v5.1 contains nothing beyond those dispositions, SE's
F-29/F-30/F-31/F-32 dispositions, and version/header/revision-note bookkeeping. No re-review of the
document at large, no new fronts opened outside the v5.0→v5.1 diff.

I read `CROSS-REVIEW-test-engineer-FSPEC-v5.md` in full, then `git diff 1cdccf3..9fd8c8f --
docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md`, then the surrounding context of
every changed hunk (the v5.0 note's TE F-41/Q-01 entries, the new v5.1 note block, §4.4's rung-(ii)
row note, §4.5's contract box + explanatory paragraph, §5.5's summary bullet, §9/§10 O-11, and AT-15
in full) to confirm each disposition holds in the document itself, not merely in the note's prose.

## Disposition of my round-5 findings — verified against v5.1

| v5 ID | Sev | Verified disposition |
|---|---|---|
| F-43 | Medium | **Fixed by the prescribed option 2 — the stderr-token conjunct is removed from AT-15 entirely, not repolarized.** AT-15's Then now reads only: "**Discriminating observable (SE F-29/TE F-43, v5.1):** rungs (i) and (ii) write byte-identical invalidation records, so the Then asserts that the drift-state file's inode identity **changes** (rung (ii)'s `unlink`+create) rather than being preserved (rung (i)'s in-place `O_WRONLY\|O_TRUNC` retains `st_ino`) — this discriminates the two rungs on its own." No stderr token, no `operation` value, appears anywhere in the row. The inode-identity conjunct is unmodified from v5.0 and was already stated correctly (verified in my v5 review); it now stands alone as the sole rung discriminator, and it is oracle-sound as such: rung (i)'s in-place `O_TRUNC` preserves `st_ino` by construction (same inode, truncated in place), rung (ii)'s `unlink`+create necessarily allocates a fresh inode, so "changed vs. preserved" is a total, single-valued, conforming-implementation-observable partition over exactly the two rungs AT-15's Given can reach (rung (iii) is excluded by construction — the parenthetical after the Then still states the unwritable-directory case reaches (iii) instead). §4.5's closed nine-member `operation` set is untouched by the diff (confirmed by direct read of §4.5's `writeFailures`-filtering paragraph and the "nine `operation` values" line, both byte-identical to v5.0) — no success-token emission was introduced, so the closed-set/filter-arithmetic hazard I flagged as "the cheapest way to make AT-15 green" cannot have been taken. The v5.0 disposition note's third-wrong-polarity description is corrected: the v5.1 note appends, at the same TE F-41 entry, "**Superseded in v5.1 (SE F-29 ≡ TE F-43):** the stderr-token conjunct's polarity was inverted against §4.5's own failure-record semantics and is dropped from AT-15; the inode-identity observable, stated correctly from v5.0, is the sole discriminating oracle going forward" — this supersedes rather than silently overwrites the old (also-wrong) note text, which is the more honest of the two ways to close a note that had itself been wrong; the new v5.1 note's own SE F-29≡TE F-43 entry restates the correct polarity a second time, independently, and the two agree with each other and with §4.5. Closed. |
| F-44 | Low | **Fixed by correcting the note, not by adding a §5.9 sentence — the alternative I offered, and the one that is actually true.** The v5.1 note's TE Q-01 entry now reads "answered inside the review; **assessed satisfied, no §5.9 change needed (corrected SE F-32 ≡ TE F-44, v5.1)**" and states §5.9's existing no-change-re-sync precondition already excludes the uncovered `--force`-re-run case. I diffed §5.9 directly against v5.0: it is byte-identical (no hunk touches it), matching the note's own claim this time. Closed. |
| F-45 | Low | **Fixed, the prescribed one-word edit.** AT-15's Given now reads "a fixture may fault **any subset** of the three guards", matching §4.6's wording exactly. Closed. |

## Oracle-check: is AT-15 as it now stands constructible and falsifiable?

Yes. Traced end to end:
- **Given** selects the rungs: fault-inject (independently, any subset per F-45's fix) on
  `drift-state-replace` (atomic-replace guard) and/or `drift-state-invalidate` (rung-(i) in-place-write
  guard), with rung (ii)'s `unlink`/fresh-write guard left clean. AT-15's specific fixture faults both
  of the first two and leaves the third clean — a concrete member of that subset space, not the
  universal case, which is correct (AT-16 is the mirror fixture with all three faulted, per §4.6's
  closure paragraph, unaffected by this diff).
- **Then** discriminates the rungs by the inode observable alone: `st_ino` unchanged ⇒ rung (i)
  landed in place; `st_ino` changed ⇒ rung (ii)'s unlink+create landed. This is a positive,
  bidirectional conjunct (not absence-only) and is single-valued over the two reachable rungs.
- **Nothing in the AT depends on a stderr token** — confirmed by direct read of the current row; the
  word "stderr" does not appear in it. A conforming implementation that emits `drift-state-replace`
  and `drift-state-invalidate` (both correctly, as failure records under §4.5) but not
  `drift-state-unlink` (rung (ii) succeeded) is unconstrained by this AT and passes on the inode
  observable alone, exactly as it should.
- A wrong implementation that never actually falls through to rung (ii) (e.g. gives up after rung (i)
  fails) would leave `st_ino` unchanged and no fresh write landing — red, correctly. A wrong
  implementation that fakes success without a real unlink+create would either fail to change `st_ino`
  (red) or fail the "fresh write lands" clause (red). The AT is falsifiable in both directions.

## Diff-cleanliness check

`git diff 1cdccf3..9fd8c8f -- docs/pdlc-workflow-distribution/FSPEC-pdlc-workflow-distribution.md`
touches exactly: (1) the header table's Cross-Reviews row and version/date bump to 5.1; (2) the
existing v5.0 note's TE F-41 and TE Q-01 entries, amended in place with superseding/correcting
callouts (no other v5.0 note entries touched); (3) a wholly new "v5.1 — SE/TE cross-review round 5"
note block disposing SE F-29≡TE F-43, TE F-45, SE F-30, SE F-31, SE F-32≡TE F-44, plus a
nothing-deferred line; (4) §4.4's rung-(ii) row note (SE F-30: "Row 2 below"→"Row 2 above" plus the
derivation-attribution correction); (5) §4.5's contract box and explanatory paragraph (SE F-31: the
not-removed clause's wording); (6) §9/§10 O-11 (SE F-30: "only constructible cause" →
"only permission-constructible cause", with the classic-filesystem-`ENOSPC` parenthetical); (7) §5.5's
summary bullet (SE F-31, same wording fix, second carrying site); (8) AT-15's row (F-43 fix + F-45
fix). Every hunk maps to one of the eight disposed findings (my three + SE's four, one of which —
SE F-30 — touches two sites, and one — SE F-31 — touches three) or to header/version bookkeeping. No
hunk introduces new AT numbering, new REQ text, or content outside these eight dispositions' stated
scope — consistent with the v5.1 note's own "Nothing deferred" line and the "no restructuring, no new
AT, REQ untouched" framing.

## Recommendation

**Approved.** All three of my round-5 findings — the blocking Medium (F-43) and both Lows (F-44,
F-45) — are verified fixed against the document itself, not merely against the disposition note's
prose (F-44 specifically was a note-only defect last round, and I re-diffed §5.9 directly rather than
trusting this round's note too). AT-15 is constructible and falsifiable on the surviving inode-only
oracle, §4.5's closed nine-member set is intact, and the v5.1 diff carries nothing beyond the eight
findings' dispositions and version bookkeeping. Blocking counts across rounds: 12H/10M → 4H/7M →
3H/3M → 0H/1M → 0H/1M → **0H/0M**. No new findings raised — this round's scope is exclusively the
round-5 disposition, per the operator's delegation, and nothing encountered while verifying that scope
warrants an out-of-scope flag.

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
