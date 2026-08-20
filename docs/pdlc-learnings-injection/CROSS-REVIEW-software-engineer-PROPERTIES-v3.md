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

The oracle sections were re-read against the delta for two things: an oracle whose *operand* changed
meaning, and a defeater that the delta either strengthened or made moot.

- **§O.8's M-5 — strengthened, no edit needed.** M-5 is "charge per-document framing to
  `maxBytesPerDocument`", killed by PROP-BOUND-07 because `bytesInjected` stops equalling the
  hand-computed material count. At v2 this mutation sat on contested ground: an implementation charging
  framing was arguably conforming to FSPEC BR-6 as it then read, so M-5 was mutating toward one
  upstream document and away from another. The delta removes the ambiguity — charging framing is now a
  spec violation under both FSPEC and TSPEC, and M-5 is an unambiguous mutation of a settled rule. This
  is the delta's clearest win for this document.
- **§O.7's precedence argument — unaffected.** §O.7 fixes the reason-id precedence as
  `RSN-NO-MATERIAL`, then the count cut, then the byte cut, and BR-6's new zero paragraph is written in
  that same order ("dropped **before** the total bound with `RSN-NO-MATERIAL` … and consumes no slot").
  Upstream landed the ordering §O.7 already assumed. The inherited `87 of 89` figure and its locally
  checkable 9-of-9 / 19,340–50,695-bytes restatement are untouched by the delta; my v2 handling of them
  stands.
- **§O.7's new-blocking-causes rule is what F-02 trips.** The section's own argument is that a
  newly-reachable blocking cause must acquire a defeater rather than inherit one. `maxBytesPerDocument: 0`
  is exactly a newly-*decided* blocking cause: before the delta it was an undecided configuration and
  §G.2.1's deliberate silence was defensible; after it, it is a specified path to an empty selection
  with a specified reason id, and §O.7's rule says it needs its own oracle. The property F-02 asks for
  is the defeater — and it is not vacuous, because a fixture with a non-empty document at
  `maxBytesPerDocument: 0` distinguishes `RSN-NO-MATERIAL` (correct) from `RSN-BYTES` (the plausible
  wrong answer §G.2.1 itself lists) and from a zero-byte `bounded: true` row (the answer PROP-BOUND-03
  currently mandates).
- **§O.1's three static-scan absences, §O.2's byte-identity oracles, §O.3–§O.6** — none takes an operand
  from BR-6's accounting basis, AT-30, D-12 or F-O-1. Re-read, unchanged, no finding. My v2 F-03 (make
  the shared static walk compare against §C.4's hand-transcribed literal) remains open as recorded and
  is untouched by this delta.
- **§O.9's generated arms.** Two of the three parameterised obligations (T-O-4 permutation/strict weak
  ordering, T-O-5 totality) are indifferent to the delta. The third, T-O-6, is the one F-01 names: its
  generated arm quantifies over inputs of §D.5 including `maxBytes = 0`, so whatever precondition
  PROP-BOUND-03 acquires must be mirrored in the generator's domain, or the boundary must be routed to
  the new property. Stating which of the two is intended is part of resolving F-01.

## Fixtures

- **`NO-MATERIAL` (§F.1)** — "one document with all five BR-6 sections **absent** and an Approval
  Record present", defeating "`RSN-NO-MATERIAL` implemented as *document empty*". Still correct for the
  first disjunct; it cannot exercise the second. The zero-bound disjunct needs the *mirror* fixture — a
  document that **carries** material, run at `maxBytesPerDocument: 0` — and that mirror is what proves
  the implementation reaches `RSN-NO-MATERIAL` by "yields no material" rather than by "carries no
  section." Note the shape: this is the same positive/negative pairing discipline §F.1 already applies
  in `DISCARDED-NESTED` / `DISCARDED-DIRECT` and `COUNT-BINDING` / `BYTES-BINDING`, so the fixture table
  has the precedent to follow rather than a new pattern to invent. Cheapest realisation is a threshold
  override on an existing corpus fixture rather than a fourteenth case id — §G.2.1's own estimate, "one
  case in `learningsConfig.test.js`", is right.
- **`BYTES-BINDING` (§F.1)** — 8 documents of 7,000 injectable bytes under `maxDocuments: 5`,
  `maxBytesPerDocument: 6000`, `maxTotalBytes: 20000`, expected 3 contribute / 5 `RSN-BYTES` /
  0 `RSN-COUNT`. Re-derived against the new accounting basis: 7,000 > 6,000 so each document bounds to
  6,000 of material; 6,000 × 3 = 18,000 ≤ 20,000 and a fourth would reach 24,000 > 20,000; so 3 / 5 / 0
  holds, and it now holds *without* the correction term the old framing basis would have required
  (identification line + delimiters + source-path label per document, against a 20,000-byte total). The
  literal is unchanged and is now easier to defend from the fixture alone, which is what §F.1's closing
  rule — "expected values are hand-transcribed literals … never re-derived at assertion time" —
  demands. `COUNT-BINDING`'s 200-byte-section arithmetic is likewise unperturbed.
- **§F.2's byte-identity baseline** — captured from the merge-base checkout and unaffected: the delta
  changes no rendered-block wording, no delimiter and no preamble. PROP-META-04's retained digests stay
  valid, and none of the routed items touches the capture procedure.
- **§F.3's verbatim-string families** — re-checked all three against the new FSPEC bytes. The five BR-6
  section names and `Approval Record` are byte-identical in the delta. The C-4 delimiters and preamble
  are untouched. The three frozen catalogues are TSPEC-sourced and TSPEC did not move. One nuance worth
  recording: `LEARNINGS_REJECT_REASONS`' membership is unchanged — the delta widened
  `RSN-NO-MATERIAL`'s *meaning*, not the catalogue — so PROP-RECORD-03's six-member hand-transcribed
  set equality still holds exactly as written. That is the good outcome; a widened meaning that had
  arrived as a seventh id would have invalidated a transcribed literal.
- **§F.3's F-O-1 paragraph** — its claim that "TSPEC's F-O-1 discharge covers only the document-shape
  predicate" remains true (TSPEC did not move), but its framing of *why* the section matcher is
  unowned has shifted under it: FSPEC now names an owner for it. See **F-05**; this is bookkeeping, and
  the property it protects (PROP-BOUND-08) is unaffected.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | PROP-BOUND-03's universal statement is contradicted by BR-6's new zero-bound rule: at `maxBytesPerDocument: 0` it demands a zero-byte contribution flagged `bounded: true` consuming a slot, where FSPEC now demands the document be dropped with `RSN-NO-MATERIAL` consuming no slot (E-36). §G.1's T-O-6 discharge and §O.9's generated arm inherit it. Fix: add an explicit `maxBytesPerDocument > 0` precondition to PROP-BOUND-03 and state whether the generator's domain excludes zero or routes it to F-02's property | §Group D — PROP-BOUND-03; §G.1 T-O-6; §O.9 |
| F-02 | High | delta | local | AT-30's new third arm (`maxBytesPerDocument: 0` ⇒ enabled run, empty selection, **and** every corpus document carries `RSN-NO-MATERIAL`) and new edge E-36 have no owning property. PROP-CONFIG-04 enumerates only `maxDocuments: 0` and `maxTotalBytes: 0`, yet §C.1's AT-30 row claims the AT covered. §G.2.1's justification for the omission — "undecided upstream and therefore untested here" — is a claim about FSPEC that FSPEC no longer supports; the erratum §G.3 routed was answered. Fix: land the Group H property §G.2.1 itself specifies, beside PROP-CONFIG-04, and strike or rewrite the gap entry | §C.1 AT-30 row; §Group H PROP-CONFIG-04; §G.2.1 |
| F-03 | Medium | delta | local | PROP-BOUND-06 and the `NO-MATERIAL` fixture pin only the first disjunct of a reason id that now has two: BR-9's gloss reads "yields no material — it carries none of BR-6's priority sections, **or** the per-document bound is zero and admits none", and D-12 moved from "carry any priority section?" to "yield any material?". PROP-BOUND-06's remaining three conjuncts (no slot, not bounded, rest of corpus used normally) are exactly what the second disjunct needs, so extending it is the cheapest discharge of F-02 | §Group D — PROP-BOUND-06; §F.1 `NO-MATERIAL` |
| F-04 | Medium | delta | local | §G.2.2 asserts as present-tense fact that "FSPEC BR-6's worked example charges the identification line and delimiters", and §G.3 routes that conflict as an open erratum. FSPEC no longer says it — BR-6 now reads material-only, framing "counts toward none of the three quantities" — so the gap is closed in this document's favour. Fix: mark §G.2.2 resolved, strike its §G.3 item (and the dependent TSPEC AT-11 arithmetic item, whose premise was FSPEC's framing arithmetic), and let PROP-BOUND-07 cite FSPEC BR-6 alongside TSPEC §D.5 now that they agree | §G.2.2; §G.3 items 1 and 3 |
| F-05 | Low | delta | local | §G.3's fourth routed erratum states that BR-6 delegates the section-heading recognition rule to F-O-1 "where TSPEC's F-O-1 discharge covers only the document-shape predicate". FSPEC v0.13 landed the ownership half — F-O-1 now explicitly owns both rules — so the item should be narrowed to what is genuinely still open: TSPEC's discharge of the section matcher. §F.3's parallel sentence needs the same narrowing | §G.3 item 4; §F.3 |

FINDING: High | delta | local | §Group D — PROP-BOUND-03 (with §G.1 T-O-6, §O.9) | PROP-BOUND-03 states universally that a document whose material exceeds `maxBytesPerDocument` contributes material up to the bound with `bounded: true`; at the newly-decided `maxBytesPerDocument: 0` that demands a zero-byte contribution occupying a slot, which directly contradicts BR-6's new rule and E-36 (dropped, `RSN-NO-MATERIAL`, no slot). Needs an explicit `maxBytesPerDocument > 0` precondition, with §O.9's generated T-O-6 arm's domain stated to match.
FINDING: High | delta | local | §C.1 AT-30 row and §Group H PROP-CONFIG-04 (with §G.2.1) | AT-30 grew a third arm and E-36 is new, but no property asserts them: PROP-CONFIG-04 covers only `maxDocuments: 0` and `maxTotalBytes: 0`, while §C.1 still claims AT-30 covered. §G.2.1's stated justification — that upstream leaves `maxBytesPerDocument: 0` undecided — is no longer true of FSPEC, so the deliberate omission has become an unowned coverage gap.
FINDING: Medium | delta | local | §Group D — PROP-BOUND-06 and §F.1 `NO-MATERIAL` fixture | `RSN-NO-MATERIAL` now means "yields no material" with two disjuncts (no priority section, or a zero per-document bound admitting none) and D-12 was restated to match; PROP-BOUND-06 and its fixture pin only the first, so the property is a compression of the pre-delta meaning.
FINDING: Medium | delta | local | §G.2.2 and §G.3 items 1 and 3 | §G.2.2 states as fact that FSPEC BR-6 charges the identification line and delimiters to the byte bounds, and §G.3 routes it as open; BR-6 is now material-only and framing is charged to nothing, so the claim about upstream is stale and both erratum items are answered in this document's favour.
FINDING: Low | delta | local | §G.3 item 4 and §F.3's F-O-1 paragraph | The routed erratum's ownership half landed — F-O-1 now explicitly owns the section-heading matching rule as well as the document-shape predicate — so the item should be narrowed to TSPEC's outstanding discharge rather than left stated against FSPEC's delegation.

## Recommendation

## Verdict
