# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation — PROPERTIES bytes unchanged, FSPEC changed)

## Overview

**Question answered.** Does PROPERTIES, whose own bytes have not changed since my v2 approval,
still hold as a faithful compression of FSPEC as FSPEC now stands?

**What moved.** My v2 approval recorded `UPSTREAM-STATE: FSPEC sha256:fb18dbda…`, which is FSPEC
v0.12 at commit `c1d7218e`. FSPEC at HEAD is `sha256:ae75fa6291f1…` — v0.13, six commits
(`eeafa236` … `cfb3d4d6`) of one erratum round. REQ (`ff605dd3…`), TSPEC (`f629d29d…`),
DECISIONS (`85888c03…`) and PLAN (`20f574e2…`) at HEAD are byte-identical to what my v2 approval
recorded, so **FSPEC is the only upstream that moved**, and REQ did not move underneath it — the
erratum absorbed no new product decision, it settled three questions PROPERTIES itself had routed
upward.

**The three decisions the erratum landed** (`git diff c1d7218e..HEAD` on FSPEC):

1. **Byte-accounting basis is material only.** BR-6's *The byte-accounting basis* paragraph is
   rewritten: a document's **contributed bytes** are "its **material** — the section headings and
   bodies taken from it, and nothing else"; the identification line, per-document delimiters,
   source-path label and block preamble "count toward none of the three quantities", grounded on
   REQ AC-2.3, which bounds "the material taken". The pre-round text charged the identification
   line and delimiters to the document.
2. **`maxBytesPerDocument: 0` is decided.** New edge **E-36**; BR-6 gains a *Where the bound is
   zero* clause; BR-9's catalogue entry for `RSN-NO-MATERIAL` widens to "carries none of BR-6's
   priority sections, **or** the per-document bound is zero and admits none"; D-12 is restated as
   "Does the document yield any material?"; **AT-30** gains a third arm and the extra assertion
   that every corpus document carries `RSN-NO-MATERIAL` in that arm; the branch-coverage check
   now reads E-01 … E-36.
3. **F-O-1 owns both heading-recognition rules** — the document-shape predicate *and* the rule by
   which a heading counts as one of BR-6's named sections.

**Method.** I re-read my own v1 and v2 cross-reviews of PROPERTIES, took the FSPEC diff above,
then re-read every PROPERTIES passage that leans on the changed upstream text at its current
version — Group D's `PROP-BOUND-03…08`, `PROP-CONFIG-04`, §C.1's AT-30 row, §F.3's heading-forms
note, §G.2's known gaps and §G.3's routed errata. Per DEC-ERR-03, my scope is this document
measured against upstream at HEAD, not the routed item list.

**Answer in one line.** PROPERTIES' *properties* still hold — none is contradicted by the new
FSPEC, and the byte-accounting decision landed on the side PROPERTIES already asserts, which
retires a contradiction rather than creating one. What no longer holds is PROPERTIES' **account of
upstream**: two of its three §G.2 known gaps and two §G.3 routed errata describe FSPEC questions
that FSPEC has now answered, and the newly decided `maxBytesPerDocument: 0` arm of AT-30 has no
property asserting it. Those are Medium — no REQ acceptance criterion lost its property coverage —
so the round confirms with minor changes rather than routing back.

## Properties

Do the properties themselves still compress FSPEC faithfully? Property by property, over the
surface the erratum touched.

### P.1 The byte-accounting decision lands on PROPERTIES' side

`PROP-BOUND-07` asserts that all three thresholds "range over one pool — **material only**", that
`bytesInjected` equals the hand-computed literal byte count of the document's declared sections,
and that "per-document framing (opener, `ABRIDGED` annotation, closer) and block framing (header,
preamble, trailer) **must** be charged to **no** bound and to no row". Against pre-round FSPEC that
was a *divergence* PROPERTIES declared openly in §G.2.2 and routed as an erratum; against FSPEC at
HEAD it is now a **verbatim** compression of BR-6's "framing carries no byte charge … count toward
none of the three quantities".

The consequence chain is intact rather than broken:

- `PROP-BOUND-03` (per-document cut) and `PROP-BOUND-04` (whole-document total cut) are both stated
  over *material*, not over contributed-bytes-including-framing — so the new basis leaves their
  expected values unchanged.
- `PROP-BLOCK-02`'s `(ABRIDGED: bounded at {n} bytes)` annotation is asserted as a rendering fact
  iff `bounded: true`, never as a byte charge — consistent with "a document is never abridged to pay
  for the annotation that says it was abridged".
- §O.8's mutation **M-5** — *charge per-document framing to `maxBytesPerDocument`* → reds
  `PROP-BOUND-07` — is now a mutation away from FSPEC as well as away from TSPEC §D.5. The ledger
  entry got stronger, not stale.
- The `BYTES-BINDING` fixture's literal 3/5/0 split is stated over "8 documents of 7,000
  **injectable** bytes each", i.e. material — unchanged by the new basis.

No property needs an expected-value edit for decision 1. This is the cleanest possible cascade
outcome, and it is worth naming: PROPERTIES declined to guess and named the divergence instead, and
the erratum resolved it the way PROPERTIES had reasoned.

### P.2 The `maxBytesPerDocument: 0` decision is not yet compressed

`PROP-CONFIG-04` enumerates the zero cases explicitly: "`maxDocuments: 0` **and** `maxTotalBytes: 0`
**must** each yield an **enabled** run with BR-8's rows present and empty", tracing `E-24, E-25,
AT-30`. AT-30 at HEAD now has a **third** arm (`maxBytesPerDocument: 0`) and one extra assertion in
that arm ("every corpus document carries `RSN-NO-MATERIAL` (E-36)"). §C.1's AT-30 row maps AT-30 →
`PROP-CONFIG-04, PROP-RECORD-02`, and §C.1's headline claim is "every one of TSPEC §T.5's 35 ATs is
claimed by at least one property".

The headline claim survives literally — AT-30 is still claimed, the 35-member partition is
unchanged because E-36 rides on an existing AT id rather than adding one, and `PROP-META-05`'s
partition oracle does not red. What does not survive is the **content** of the claim: the arm the
erratum added is asserted by no property, and the extra `RSN-NO-MATERIAL` assertion is asserted by
none either. `PROP-BOUND-06` covers `RSN-NO-MATERIAL` only for its other arm — "a document carrying
**none** of BR-6's five priority sections" — which is now the narrower half of BR-9's widened
catalogue entry.

This is F-01 and F-04 below. I hold it at Medium, not High, on the product lens: **no REQ
acceptance criterion lost property coverage.** REQ AC-4.4's zero-threshold behaviour is asserted by
`PROP-CONFIG-04` for two of its three instantiations, and the third is the same product behaviour
(enabled run, empty selection, no refusal) reached by a third route — not a new user-visible
promise. The fix is the one PROPERTIES itself pre-specified in §G.2.1: one clause in
`PROP-CONFIG-04`, "one case in `learningsConfig.test.js`", plus the `RSN-NO-MATERIAL` conjunct.

### P.3 The F-O-1 ownership decision changes an attribution, not a property

`PROP-BOUND-08` traces `BR-6, F-O-1` and is deliberately scoped to *bounding this document's
exposure* to the unspecified section matcher rather than deciding it. FSPEC now makes F-O-1 the
explicit owner of that rule, so `PROP-BOUND-08`'s `F-O-1` trace is better grounded at HEAD than it
was at approval. The underlying gap it hedges against is **unchanged**: TSPEC is byte-identical to
what I approved, so §D.3's discharge still covers only `LEARNINGS_HEADING_RE`, and no upstream text
still says whether `## 3. Rejected Proposals (with rationale)` is matched on the numbered form, the
bare title or a prefix. Only the prose that describes *where* the delegation sits is now slightly
off (F-03).

### P.4 Everything else the erratum touched

- **D-12's restatement** ("carry any priority section" → "yield any material"): no property or
  oracle quotes D-12's wording, so nothing is stranded.
- **BR-9's catalogue membership** is unchanged — the reason-id **set** `LEARNINGS_REJECT_REASONS`
  gained no member, only a widened meaning — so the frozen-catalogue set-equality properties
  (`PROP-FAILOPEN-01`, `PROP-RECORD-03`, `PROP-CONFIG-07`) do not red and need no edit.
- **BR-1's two-conjunct rule, A-2, AT-02/03/33** were the *v0.12* erratum, already present in the
  FSPEC I approved at v2. Not in this delta; not re-litigated here.

## Oracles

## Fixtures

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
