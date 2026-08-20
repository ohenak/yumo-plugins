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

Scope of this section: the properties whose statements touch the FSPEC delta. Everything not listed
here was re-checked only for citation validity against the new bytes and is unaffected.

### Still holds — and now holds against agreeing upstream text

- **PROP-BOUND-07** (all three thresholds range over one pool, material only; framing charged to no
  bound and to no row) is now a *faithful compression of FSPEC*, where at v2 it was a faithful
  compression of TSPEC §D.5 in open conflict with FSPEC. Its expected values — `bytesInjected` as the
  hand-computed literal of the fixture's declared sections, `totalBytesInjected` as their sum, the
  fixture's framing cost stated as its own literal beside them so the test proves the two numbers
  differ — need no change. FSPEC's new sentence "so a document is never abridged to pay for the
  annotation that says it was abridged" is the same invariant PROP-BOUND-07 encodes.
- **PROP-BLOCK-02** (the `(ABRIDGED: bounded at {n} bytes)` annotation asserted in both directions)
  likewise: §G.2.2 flagged it as exposed to the framing question, and the resolution went its way. The
  annotation is framing, it is charged to nothing, and the bidirectional assertion is untouched.
- **PROP-BOUND-05** (material is exactly BR-6's five priority sections the document carries, in
  priority order, Approval Record absent) — BR-6's priority table and its five names are byte-unchanged
  in the delta. Verbatim transcription still matches.
- **PROP-BOUND-08** (real-corpus recognition arm) survives intact and gains a cleaner citation: it
  already cites F-O-1, and F-O-1 now explicitly owns the section-matching rule as well as the
  document-shape predicate, so the property is citing an owner that upstream now really assigns. §F.3's
  "which heading forms count as which section is F-O-1's, not this document's to decide" was ahead of
  upstream at v2 and is now simply correct.
- **PROP-BOUND-01, PROP-BOUND-02, PROP-BOUND-04** — the count bound, the mirror byte-binding arm and
  the low-end whole-document drop are stated over §4.1's declared non-zero values and are untouched by
  a change to the zero case and to what framing costs. `BYTES-BINDING`'s 3-contribute / 5-`RSN-BYTES` /
  0-`RSN-COUNT` split is computed from 7,000 injectable bytes against a 6,000-byte bound and a 20,000-byte
  total; under material-only accounting those numbers get *more* defensible, not less, since the framing
  that would have perturbed them is now explicitly uncharged.

### No longer holds as approved

- **PROP-BOUND-03** is now contradicted by BR-6 at the zero bound (**F-01**). It states universally that
  "a document whose material exceeds `maxBytesPerDocument` **must** contribute material of at most that
  bound, **must** carry `bounded: true` decided at the cut." Instantiate at `maxBytesPerDocument: 0`:
  any document with material exceeds `0`, so the property demands a zero-byte contribution flagged
  `bounded: true` — occupying a `maxDocuments` slot and appearing as a BR-8 row. FSPEC now prescribes
  the opposite for that configuration: the document "yields nothing, is dropped before the total bound
  with `RSN-NO-MATERIAL` (BR-9) and consumes no slot," and E-36 says every document carries
  `RSN-NO-MATERIAL`. The two cannot both be satisfied. §G.1's T-O-6 discharge inherits the defect,
  because it names PROP-BOUND-03 as the carrier of "`bounded` true exactly when cut" for *all* inputs of
  §D.5, and §O.9's generated arm is explicitly the "all-inputs claim" half — a generator that samples
  `maxBytes = 0` reds a conforming implementation. The fix is small and belongs in the property, not the
  generator: give PROP-BOUND-03 an explicit `maxBytesPerDocument > 0` precondition and let the new
  zero-bound property (F-02) own the boundary.
- **PROP-CONFIG-04** no longer covers the AT it claims (**F-02**). It enumerates the admits-nothing
  cases as "`maxDocuments: 0` **and** `maxTotalBytes: 0` **must** each yield an enabled run" — exactly
  AT-30's two v0.12 arms. AT-30 now carries three, and the third is not a repetition of the other two:
  it adds the conjunct "*and* in the `maxBytesPerDocument: 0` case every corpus document carries
  `RSN-NO-MATERIAL` (E-36)." §C.1's AT-30 row (PROP-CONFIG-04, PROP-RECORD-02) therefore now asserts a
  coverage claim the properties do not discharge, which is precisely the failure mode §C.1's own
  paragraph guards against. PROP-CONFIG-04's non-negative-integer validation clause is unaffected and
  correct — `0` remains a valid value, and the delta reinforces that.
- **PROP-BOUND-06** pins one disjunct of a reason id that now has two (**F-03**). It reads "a document
  carrying **none** of BR-6's five priority sections **must** carry `RSN-NO-MATERIAL`." BR-9's
  catalogue gloss now reads "yields no material — it carries none of BR-6's priority sections, **or**
  the per-document bound is zero and admits none," and D-12's question moved from "carry any priority
  section?" to "yield any material?" for the same reason. The property is still *true*, and its three
  further conjuncts (no slot consumed, not flagged bounded, rest of corpus used normally) are exactly
  what E-36 needs — which is why extending PROP-BOUND-06 rather than writing a property from scratch is
  the cheapest route to F-02. As written it is a compression of the old one-disjunct meaning.
- **PROP-RECORD-02** (a dispatch that injected nothing carries an empty row set and a present
  `totalBytesInjected` of `0`) still holds on its own terms and cites AT-30 legitimately, but it is the
  *generic* empty-selection oracle. It cannot distinguish the zero-per-document run from the
  `maxDocuments: 0` run, because both produce an empty selection; the discriminating observable is the
  `rejected[]` reason id, which only F-02's property would assert. No change needed to PROP-RECORD-02
  itself.

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
