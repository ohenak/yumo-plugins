# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.7)
**Date:** 2026-08-31
**Iteration:** 9 (erratum round 7 — delta confirmation)
**Scope:** Delta confirmation only. Routed erratum items, plus DEC-ERR-03 re-grounding of TSPEC against upstream REQ/FSPEC at current HEAD.

## Overview

Two routed items, both naming the same defect in §2.1's `coverageInstrumentation.test.js` row: the row narrated P9-02's title move as *six → seven*, when HEAD already measures seven. Both land, and both land on the **measurement** rather than on the printed word — which is the distinction that made this defect worth an erratum in the first place.

I did not take the row's arithmetic on trust. Measured at HEAD:

| Claim in the delta | Verified at HEAD | Result |
|---|---|---|
| `REQUIRED_INCLUDES` holds **four** entries | `coverageInstrumentation.test.js:37-47` — two orchestrators, `build-runtime.mjs`, `scripts/check-wave-resume-delta-coverage.mjs` (the last carrying its `CODE_REVIEW v1 §1-1` comment) | ✅ |
| Shipped literal is `4 + 1 + 2` = **seven** | `pdlc/workflows/package.json` → `c8.include` has exactly 7 entries, in the order the spread produces | ✅ |
| Title still prints `six`, comment still says six-member / three-entry | `:264` title verbatim; `:260-262` comment verbatim | ✅ (both stale at HEAD, before this feature) |
| Feature moves the set **seven → eight**, printed `six` → `eight` | adding `lib/stats.mjs` to a 7-member `toEqual` literal | ✅ |
| Comment restated as four + one + **three** `lib/` modules | 4 + 1 + 3 = 8, consistent | ✅ |

The correction is right, and the *framing* is what I want to flag as well done: the row now says the title and comment "are already stale at HEAD and this feature moves them by one, not from the number they print." That sentence is what stops the next implementer re-deriving the wrong delta from a stale printed word.

The v1.3 changelog row (`TSPEC:113-114`) is neutralised in place rather than rewritten — the live number is removed from the row, and a parenthetical records that v1.3 wrote "six → seven", labels it wrong on HEAD's measurement, and points at the v1.7 correction. That is the right treatment for a superseded changelog row: the historical record survives, but no reader can mistake it for a live count. A `grep` for `six → seven` across the document returns only these two framed, explicitly-superseded mentions.

## Architecture

**DEC-ERR-03 re-grounding — did upstream move, and is the compression still faithful?**

v1.7's changelog opens by attesting no upstream movement. I verified that independently rather than reading the attestation, because the *previous* round (v1.6) existed precisely to correct a false no-movement attestation in v1.5:

```
REQ-pdlc-stats.md    5f3e80519b982f29ab0b6dad30fa776b4be4b2d34085b235ad755890064ed9f8
FSPEC-pdlc-stats.md  c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d
```

Both match the pins the document carries (`TSPEC:19`, `TSPEC:63`) to the digit. REQ v1.6 / FSPEC v1.7 are the same bytes v1.6 absorbed. The attestation holds, and this round is a pure defect correction with no upstream decision to absorb — no new `BR-`, `E-` or `AC-` row, no vocabulary rename.

**Is §4.3 still a faithful compression of BR-16 at v1.7?** I re-read FSPEC's BR-16 rule text (`FSPEC:364-380`) against §4.3's rendering:

- BR-16 evaluates the harvested test "over exactly the file set BR-14's numerator sums, so the two never disagree." §4.3 states the same and derives the same consequence — a grammar-failing basename contributes no bytes and counts as no file remaining. Faithful.
- BR-16 says the `docs/completed/pdlc-advisory-wave-gate/` citation borrows a basename *shape*, and that the directory "carries four of them **alongside** grammar-matching cross-reviews and so reports a measured ratio itself; only the shape is borrowed, not the verdict." §4.3 renders this correctly, including the correction of the earlier revision that misread it as naming the directory harvested. Faithful.

§4.3's runtime-measured numbers for that directory are load-bearing for §6.1's baselines and §7.2's AT-09 row, so I measured them too: 62 `CROSS-REVIEW-*` files, of which 4 are the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` form, leaving 58 grammar-matching. The document states 62 / 4 / 58 and concludes `crossReviews.length` is 58 with the harvested disjunct not firing. Correct at HEAD.

## Interfaces

**Did the edit break anything previously approved?** The diff is 23 insertions / 3 deletions across exactly two places — the v1.7 changelog block and the one table row, plus the neutralising parenthetical in the v1.3 row. No behavioural claim, type, signature, exit code, oracle or code sketch is touched. I checked the seams most likely to be disturbed by a count edit:

| Previously approved element | Status after delta |
|---|---|
| §2.1's **ten** co-change sites | Intact. The table still holds 12 rows = 10 sites + 2 completed-sibling document edits, matching the prose "ten … plus two document edits in a completed sibling feature". The 24 − 14 = 10 derivation is untouched. |
| Packed class `5` → `6` (`_tspec-packed-set.mjs`, sibling TSPEC §5.4 / FSPEC §5.2) | Untouched, and still explicitly held distinct from the copied class. |
| Copied class `4` → `5` (`MODULE_NAMES`, README) | Untouched. Verified at HEAD: `MODULE_NAMES` is exactly the four modules, and the README sentence prints "four workflow modules" over the same four. The row's warning that the two counts "must not be synchronised to each other" survives verbatim. |
| `learningsPremises.test.js` title quoted "verbatim at HEAD" | Verified: `:78` reads exactly "MODULE_NAMES is exactly the four canonical workflow modules". |
| `loop-distribution.test.js` row's `4 + 15 + 5 + 1` → `4 + 15 + 6 + 1` and `vendoredClassWord` ternary arm | Untouched by this edit. |

The one adjacent count that *could* have been wrongly synchronised — the `loop-distribution.test.js` vendored-class-size `5` → `6` — was correctly left alone. That is the trap this row's whole class of defects sets, and the edit did not fall into it.

## Data Model

No type, constant or signature moved this round. For completeness against the counts the corrected row now leans on, the shipped `c8.include` array at HEAD is:

```
**/pdlc/workflows/orchestrate-dev.js                          ┐
**/pdlc/workflows/orchestrate-queue.js                        │ REQUIRED_INCLUDES
**/pdlc/workflows/build-runtime.mjs                           │  (four entries)
**/pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs┘
**/scripts/capture-learnings-baseline.mjs                     ← CAPTURE_SCRIPT_INCLUDE
**/pdlc/workflows/lib/loop-session.mjs                        ┐ two lib/ modules
**/pdlc/workflows/lib/escalation-view.mjs                     ┘
```

Seven members, in exactly the spread order the `toEqual` literal produces — which is why the row's note that "the shipped assertion is `toEqual`, i.e. array-equality, so position matters" remains correct and load-bearing. Adding `lib/stats.mjs` as an eighth member at the end of the `lib/` group keeps position discipline; the row says so.

The document's own §4.2 surface (`lib/stats.mjs` exporting six functions and two frozen constants, `REVIEW_DOC_TYPE_ROWS` as BR-09's six rows) is unchanged and was not re-reviewed — it was approved at v1.6 and the edit does not touch it.

## Test Strategy

From the testing lens, the corrected row now describes a co-change an implementer can execute without re-deriving anything:

- **The assertion-carrying edit is unambiguous.** `c8.include` gains one `**/`-anchored entry at a stated position; omission or misordering reds through `toEqual`. That was already true at v1.6 and is unchanged.
- **The non-assertion edits are now correctly scoped.** The title and the arithmetic comment carry no assertion, so neither can red — which is exactly why a stale narration here is dangerous rather than harmless. Nothing would have caught an implementer who "corrected" `six` → `seven` per the old row and left the shipped set at eight. The row now names the endpoint (`eight`) instead of the delta from a stale word, so the edit is checkable by reading the file after the change.
- **The stale-comment risk is now explicit.** The comment at `:260-262` says "REQUIRED_INCLUDES' three entries" while the constant holds four. The row's restatement to "four entries, `CAPTURE_SCRIPT_INCLUDE` and the three `lib/` modules" fixes both halves of the staleness in one pass, rather than leaving the comment one revision behind the title.

**One residual observation, not a finding.** Neither the title nor the arithmetic comment is pinned by any oracle, so this class of drift — a printed count word diverging from the literal beneath it — can recur silently. §2.1 already names `pdlc/README.md`'s prose enumeration as RK-1's unpinned residue; this row is a second instance of the same shape. That is a known, documented residue rather than a new gap, and pinning comment text is not something I would ask this feature to take on. I raise it here so harvest can see the pattern recurring across two sites.

**The routed REQ-STATS-06 / BR-16 disagreement remains open**, and §4.3 plus §8.3 continue to state it accurately: the sketch is written against BR-16 as the immediate upstream, AT-17's fourth leg is named as the single place the contested scoping becomes an assertion, and the three re-stamp sites are enumerated. That item is inherited, was raised and routed in an earlier round, is untouched by this edit, and is already tracked by the document itself — I do not re-raise it here.

## Positive Observations

- **The correction is grounded in measurement, not in the previous text.** The row states four `REQUIRED_INCLUDES` entries, the literal `4 + 1 + 2`, and the shipped seven, and every one of those is verifiable by opening the file. This is the difference between fixing a number and fixing the reason the number was wrong.
- **It distinguishes the printed word from the measured count.** "The title and comment are already stale at HEAD and this feature moves them by one, not from the number they print" is the sentence that prevents the defect recurring; the title moves `six` → `eight` while the *set* moves seven → eight, and both facts are stated without conflating them.
- **The v1.3 changelog row is neutralised rather than rewritten.** Removing the live number while preserving the record of what v1.3 wrote, explicitly labelled wrong, is the correct handling of a superseded row — history intact, no readable stale claim.
- **The no-upstream-movement attestation is honest this time.** After v1.6 existed to correct a false attestation in v1.5, v1.7 re-grounds and its hashes match REQ and FSPEC at HEAD to the digit. I checked; it holds.
- **Adjacent counts were left alone.** The packed class (5 → 6), the copied class (4 → 5) and `loop-distribution.test.js`'s vendored-class size were all untouched, and the standing warning that these counts must not be synchronised to one another survives.

## Recommendation

**Approved**

The delta resolves both routed items and breaks nothing previously approved. TSPEC remains a faithful compression of REQ v1.6 / FSPEC v1.7 at their current HEAD bytes.

## Delta-Confirmation Findings

No findings.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
