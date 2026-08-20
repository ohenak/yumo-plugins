# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation — PROPERTIES bytes unchanged; FSPEC moved v0.12 → v0.13)

## Overview

**The one question.** PROPERTIES' own bytes have not changed since my v2 approval
(`REVIEWED-COMMIT: f10dbd43`). FSPEC has: my approval recorded
`UPSTREAM-STATE: FSPEC sha256:fb18dbda…` (commit `c1d7218e`, v0.12), and FSPEC at this dispatch is
`sha256:ae75fa62…` (commit `cfb3d4d6`, v0.13). REQ, TSPEC, DECISIONS and PLAN hashes are byte-identical
to the ones my v2 recorded, so this confirmation is scoped to the FSPEC delta and to what PROPERTIES
leans on it for.

**What the delta did.** `git diff c1d7218e cfb3d4d6` over FSPEC is +38/−18 across six sites, and it
lands the three decisions the v0.13 erratum block names:

1. **BR-6's byte-accounting basis is now material only.** Contributed bytes are "the section headings
   and bodies taken from it, and nothing else"; the identification line, the per-document delimiters
   and source-path label, and the block preamble "count toward none of the three quantities."
   v0.12 said the opposite — contributed bytes were "its identification line, its delimiters and
   source-path label (BR-7), **and** the section headings and bodies taken."
2. **`maxBytesPerDocument: 0` is decided.** New edge **E-36**; BR-6 gains the zero paragraph ("no
   material is admissible from any document: each yields nothing, is dropped before the total bound
   with `RSN-NO-MATERIAL` (BR-9) and consumes no slot"); **AT-30 grows a third arm**; `RSN-NO-MATERIAL`'s
   catalogue gloss and D-12 are restated over "yields material" rather than "carries a section."
3. **F-O-1 now owns both heading-recognition rules** — the document-shape predicate *and* the rule by
   which a heading counts as one of BR-6's named sections.

**The finding of this confirmation.** Two of those three land squarely on text PROPERTIES wrote *about
this exact uncertainty*, and the direction is mixed. Decision 1 resolves §G.2.2 in PROPERTIES' favour:
PROP-BOUND-07 and mutation M-5 were written to TSPEC §D.5's material-only reading against an FSPEC that
disagreed, and FSPEC has now moved to them. Nothing in Group D or §O.8 has to change for it, and that
is the strongest thing this delta does.

Decision 2 goes the other way. PROPERTIES §G.2.1 states, as a load-bearing justification for a
deliberate omission, that `maxBytesPerDocument: 0` "is undecided upstream and therefore untested here"
and that "**No property asserts it**, deliberately: inventing the answer here would freeze a guess into
the suite." FSPEC has now decided it — the erratum PROPERTIES itself routed in §G.3 was answered — so
the premise of the omission no longer holds, and the omission is now an ordinary coverage gap rather
than a principled deferral. §G.2.1 even names where the property belongs ("Group H beside
PROP-CONFIG-04… one case in `learningsConfig.test.js`"), which is the fix. Worse, one property that
*is* stated universally now contradicts the new rule at the zero bound. That pair is why this
confirmation does not approve.

**Method.** I read my v2 cross-review, diffed FSPEC across the two recorded hashes, then re-read every
PROPERTIES site that cites the changed material — Group D in full, PROP-CONFIG-04, PROP-RECORD-02, §C.1's
AT-30 row, §F.1's `NO-MATERIAL` and `BYTES-BINDING` fixtures, §F.3, §O.8's M-5 row, §G.1's T-O-6
discharge, and §G.2/§G.3 — against FSPEC as it now stands. I did not re-review unchanged material and I
have not re-litigated any v2 finding; the five v2 Medium/Low findings remain open as recorded and are
not restated here.

## Properties

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
