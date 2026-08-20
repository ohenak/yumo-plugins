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

The oracles are where a cascade usually breaks, because an oracle transcribes an upstream number or
an upstream sentence. I re-read the ones that touch the changed FSPEC text.

| Oracle / matrix | Leans on | Still faithful at FSPEC HEAD? |
|---|---|---|
| §C.1 AT-30 row → `PROP-CONFIG-04`, `PROP-RECORD-02` | AT-30's statement | **Partially.** The row is still true as a claim of ownership; the AT's third arm and its `RSN-NO-MATERIAL` conjunct are unasserted (F-01) |
| §C.1 "35 of 35 covered"; §C.4 count table (`FSPEC acceptance tests 35`) | TSPEC §T.5 partition | **Yes.** E-36 rides on AT-30; no AT id added or retired; `PROP-META-05`'s partition oracle does not red |
| §C.2 AC → property matrix, AC-4.4 row | REQ AC-4.4 | **Yes.** REQ is byte-identical to my v2 approval; AC-4.4 keeps `PROP-CONFIG-04` |
| §O.8 mutation ledger, M-5 | BR-6 byte basis | **Yes, and strengthened** — M-5 is now a mutation away from FSPEC *and* TSPEC §D.5 |
| §O.9 generated arms for T-O-6 (`bytes === Buffer.byteLength(material)`, `bytes <= maxBytes`) | TSPEC §D.5 | **Yes.** Stated over material; a zero `maxBytes` is inside the generated domain, so the generated arm already ranges over the newly decided case even though no *example* property names it |
| §G.1 carried-obligation table (T-O-4/5/6) | TSPEC | **Yes.** TSPEC unchanged |
| Reject-catalogue set equalities (`PROP-FAILOPEN-01`, `PROP-RECORD-03`, `PROP-CONFIG-07`) | BR-9 / TSPEC §D.2 member lists | **Yes.** Membership unchanged; only `RSN-NO-MATERIAL`'s *meaning* widened |
| §C.3 PLAN task ↔ property matrix (LI-08/LI-12/LI-17/LI-21) | PLAN | **Yes.** PLAN is byte-identical to my v2 approval; the F-01 fix lands inside LI-12/LI-21's existing `learningsConfig.test.js` rows and needs no new task |

Two oracle-adjacent statements are now **assertions about upstream that upstream contradicts**, and
they are the substance of F-01 and F-02:

- §G.2.1 — "**`maxBytesPerDocument: 0` is undecided upstream and therefore untested here.** AT-30
  exercises `maxDocuments: 0` and `maxTotalBytes: 0` only … REQ AC-4.4's 'zero bytes' branch does not
  say whether the outcome is `RSN-NO-MATERIAL`, `RSN-BYTES`, or a zero-byte contribution." FSPEC at
  HEAD says exactly which: `RSN-NO-MATERIAL`, no slot consumed, enabled empty-selection run (E-36),
  and AT-30 now exercises all three zeros. The premise for deliberately not asserting it is gone.
- §G.2.2 — "**Byte accounting of framing is specified two ways.** TSPEC §D.5 says material only,
  framing never charged; FSPEC BR-6's worked example charges the identification line and delimiters."
  FSPEC BR-6 no longer charges either. The contradiction this gap records is closed, and the
  conditional it carries — "if FSPEC's reading is the intended one, both properties' expected counts
  change and LI-08's row changes with them" — now resolves to *no change*, which is a materially
  different message to the implementer than the one the text sends.

§G.3's routed-errata list carries the same two items plus "TSPEC's AT-11 byte count, which inherits
FSPEC's framing arithmetic and so cannot be right if §D.5 is". That third bullet's *premise* has
changed — AT-11's count no longer inherits FSPEC's framing arithmetic, because FSPEC has none — but
its *conclusion* is unaffected and arguably sharper: TSPEC is unchanged, so if its AT-11 count was
computed with framing charged, it is now at odds with FSPEC as well. Re-word, do not delete.

## Fixtures

Fixtures are the other place a cascade bites, because a fixture freezes an upstream number into the
suite. §F's inventory survives this delta intact, with one addition owed.

| Fixture | Leans on changed FSPEC text? | Verdict |
|---|---|---|
| `COUNT-BINDING` (3/5 split) | No — count bound only | Unaffected |
| `BYTES-BINDING` (8 docs × 7,000 **injectable** bytes; literal 3 contribute / 5 `RSN-BYTES` / 0 `RSN-COUNT`) | Yes — BR-6 byte basis | **Unaffected.** Stated over injectable (material) bytes, which is now precisely FSPEC's basis. Had PROPERTIES followed the pre-round FSPEC and charged framing, this literal split would have had to be recomputed |
| `MULTIBYTE-BOUND` (material straddling `maxBytesPerDocument` mid-codepoint) | Yes — per-document cut | Unaffected; the character-safe cut is orthogonal to the basis |
| `NO-MATERIAL` (one document with all five BR-6 sections absent, Approval Record present) | Yes — BR-9's widened entry | Unaffected but now **partial**: it exercises the "carries no section" arm of `RSN-NO-MATERIAL` and not the "bound is zero admits none" arm (F-04) |
| `GATE-GRAMMAR` (AT-29), corpus/self/unreadable fixtures | No | Unaffected |
| §F.3 real-corpus measurement — 9 of 9 documents carry the five numbered headings, 0 of 9 carry a bare title | F-O-1 ownership | Measurement unaffected (corpus unchanged, re-measured at HEAD in v2); the surrounding attribution sentence is stale (F-03) |
| §F.4 seam doubles (`fakeFs`, `fakeGit`, `_recordDocType`, `_readFile`) | No | Unaffected |

**The one fixture owed.** Closing F-01 needs a `maxBytesPerDocument: 0` configuration case rather
than a new corpus fixture: it reuses any existing multi-document corpus fixture and sets the third
threshold to zero, then asserts the enabled empty-selection shape plus a `RSN-NO-MATERIAL` row for
**every** corpus document with the contributing count at zero and no slot consumed. PROPERTIES
already sized this itself — "costs one case in `learningsConfig.test.js`" — and §C.3 already maps
that suite to LI-12 (red) / LI-21 (green), so **no PLAN task is added and PLAN needs no re-approval**
to absorb it. That is why this cascade does not need to route back through the plan.

**What the fixtures do not need.** Because the byte basis moved toward PROPERTIES rather than away
from it, no hand-computed literal in §F changes, and PLAN LI-08's expected-red ledger row keeps its
current arithmetic. A cascade that had gone the other way would have invalidated `PROP-BOUND-07`,
`PROP-BLOCK-02`, the `BYTES-BINDING` literals and LI-08's row together — worth recording as the
counterfactual that makes this round cheap.

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
