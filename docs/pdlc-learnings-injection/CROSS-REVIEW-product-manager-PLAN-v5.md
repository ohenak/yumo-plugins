# Cross-Review: product-manager — PLAN (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.4, bytes unchanged)
**Date:** 2026-08-20
**Iteration:** 5
**Mode:** upstream-cascade confirmation — FSPEC moved under a recorded approval

## Overview

My v4 approval of PLAN v0.4 was recorded against FSPEC `sha256:a4f775bd…` (commit `9a4b7593`,
FSPEC v0.10). FSPEC at HEAD is `sha256:fb18dbda…` — two erratum rounds later, v0.12. PLAN's own
bytes have not moved (`REVIEWED-COMMIT: f08bfbf8`, still current for this file). The single
question here is whether PLAN v0.4 is still a faithful compression of FSPEC as it now stands.

The delta is 54 insertions / 26 deletions across nine loci, and it is not cosmetic — it changes the
**central product rule this PLAN is built around**:

| FSPEC locus | Before (the version I approved against) | After (HEAD) |
|---|---|---|
| **BR-1** | A dispatch carries the block iff the pipeline classifies it authoring. "It consumes the classification, it does not restate the membership" | A dispatch carries the block iff **both** hold: classified authoring **and** the target document is one of REQ C-1's six types. An authoring-classified dispatch with no C-1 target (the code-review phase's optimizer round at HEAD) is **outside** the rule |
| **D-2** | "Is this dispatch an authoring dispatch? yes / no" | "Does BR-1's two-conjunct rule hold?" — three branches, the third being authoring-classified with a non-C-1 target |
| **A-2** | Assumed the pipeline's classification is stable enough to be consumed and **not restated** | Restated in terms of BR-1's two conjuncts |
| **BR-15 / AT-33** | Expected read set = "the corpus-root enumeration, plus one open attempt per report-named document" | Expected read set = **exactly** one attempt per report-named document; the enumeration contributes **no member** |
| **AT-02** | Three fixtured run shapes (no DECISIONS phase, Phase R with no creator, five optimizer rounds) | **Four** — plus "a run containing an authoring-classified dispatch whose target is none of the six C-1 document types", with the stated mutation "reverting BR-1's second conjunct reds the test" |
| **AT-03 / AT-29** | Byte-identity asserted over "every **non-authoring** dispatch" | Byte-identity asserted over "every dispatch **outside BR-1's rule**" — explicitly including authoring-classified dispatches with no C-1 target |

**The headline:** this delta lands, almost word for word, the two upstream errata my v4 review
re-raised and PLAN routes in its §Errata section. That is good news for PLAN's *task rows* — LI-11's
AT-02 and AT-33 were written to **TSPEC's** reading, and TSPEC's reading is now FSPEC's reading, so
the tests PLAN commissions are now correct against both upstreams instead of only one. It is bad
news for PLAN's *prose about upstream*: three passages describe an FSPEC that no longer exists. None
of them changes what an implementer builds; all three misdescribe HEAD, and one of them (the AT-02
fixture inventory) now under-counts a fixture FSPEC names by hand.

No finding here is High. PLAN still holds as approved; three Medium corrections should be folded in
on its next pass, and none of them requires a task row to be added, split, or re-ordered.

## Batches

## Dependencies

## Verification

## Delta-Confirmation Findings

## Verdict
