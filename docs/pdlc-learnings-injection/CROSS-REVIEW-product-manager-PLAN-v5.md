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

Not one task row's *instruction* is falsified by this delta — the rows that touch BR-1 and BR-15
were already written to TSPEC's stricter reading, which FSPEC has now adopted. I walked the three
rows that carry the affected material.

**LI-11 (batch 5, the RED dispatch-universe suite) — its two contested oracles are now doubly
grounded, not newly wrong.**

| LI-11 oracle | What FSPEC said when I approved | What FSPEC says at HEAD | Effect |
|---|---|---|---|
| `LI-AT-02` set equality over block-carrying dispatches, plus the TSPEC-local composition-site probe whose **accepted set equals `LEARNINGS_TARGET_DOCTYPES`** and whose observed set equals `LEARNINGS_TARGET_DOCTYPES ∪ {null, "LEARNINGS"}` | BR-1 forbade restating membership, so the `docType` conjunct had no upstream warrant and AT-02 had two contradictory expected sets | BR-1 **requires** the `docType ∈ C-1's six` conjunct | The row is now the faithful reading of both documents. The contradiction PLAN routed is gone |
| `LI-AT-33`'s expected read set, **hand-transcribed** from the fixture's scripted `ls-files` stdout minus the self paths, enumeration excluded | BR-15 put "the corpus-root enumeration" in the expected set on a `docs/`-file-open instrument that cannot observe a `git ls-files` call | BR-15/AT-33 now say the expected set is exactly one attempt per report-named document, and that the enumeration's candidate paths contribute **no** member | The row was already written this way. It is now what FSPEC asks for verbatim |

That is the substance of the confirmation: the delta moved FSPEC **toward** this PLAN, so the
implementation LI-11 commissions is unchanged and is now defensible against either upstream. A test
author working from FSPEC at HEAD and a test author working from TSPEC now write the same suite —
which is exactly the failure mode PLAN's §Errata section existed to prevent.

**But the fixture inventory FSPEC now carries is one shape wider than PLAN records.** FSPEC AT-02 at
HEAD enumerates four run shapes and names the fourth by hand: "a run containing an
authoring-classified dispatch whose target is none of the six C-1 document types — reverting BR-1's
second conjunct reds the test". PLAN's §Errata paragraph on ERR-2 says the opposite in so many
words: "AT-02's fixture list includes the fourth run shape TSPEC §T.6 adds **beyond FSPEC's three**".
FSPEC no longer has three, and its fourth is a *different* shape from TSPEC's fourth (the erratum
land-proof retry). Neither LI-11's row nor LI-02's fixture list names a run carrying an
authoring-classified non-C-1 dispatch.

I looked for whether the coverage is nonetheless present, because a naming gap and a coverage gap
are different severities. It is present: LI-11's composition-site probe asserts the **accepted** set
equals `LEARNINGS_TARGET_DOCTYPES` while the **observed** set equals that union `{null, "LEARNINGS"}`
— which can only pass if a `docType: null` dispatch (Phase CR's optimizer round, reaching the
composition site through `reviewLoop`'s `wrapped` closure per LI-20) is in the fixture universe and
is **not** accepted. Reverting BR-1's second conjunct makes `null` accepted and reds that equality,
which is precisely the mutation FSPEC AT-02 names. So the oracle exists and the mutation is caught;
what is missing is the **mapping** — F-02 below asks for the shape to be named in LI-11's fixture
list and in §Traceability, so a reader of FSPEC AT-02 can find its owner. Medium, not High: no test
is missing, one pointer is.

**LI-15 and LI-20 (batches 7 and 12) are untouched and remain correct.** LI-15 ships
`LEARNINGS_TARGET_DOCTYPES` as a frozen catalogue; LI-20 wires
`injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)`. That
conjunction *is* FSPEC BR-1 at HEAD, expressed in code. When I approved v4 it was a TSPEC-only
construct that BR-1 as written forbade; it now has direct FSPEC warrant. Halt condition H-5's
instruction — "relaxing set equality to containment is the one repair that must not be made", with
the product reason attached (REQ C-1, NG-5) — reads even better against HEAD, since FSPEC now names
NG-5 in the same breath.

## Dependencies

## Verification

## Delta-Confirmation Findings

## Verdict
