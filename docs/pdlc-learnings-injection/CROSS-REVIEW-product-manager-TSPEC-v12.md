# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation, round v12)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.7, bytes unchanged since v11 approval)
**Upstream at HEAD:** REQ v0.9 (`sha256:ff605dd3…`), FSPEC v0.13 (`sha256:ae75fa62…`)
**Date:** 2026-08-20
**Iteration:** 12 (upstream-cascade confirmation)

## Overview

**Question asked:** my v11 approval of TSPEC v0.7 was recorded against FSPEC
`sha256:fb18dbda…` (v0.12). FSPEC has since moved to `sha256:ae75fa62…` (v0.13) via a six-commit
erratum round (`eeafa236`, `402185b3`, `c33bec50`, `5dcd00e0`, `0884fe45`, `cfb3d4d6`). Does TSPEC
still hold as approved against FSPEC as it now stands? TSPEC's own bytes are unchanged.

**Answer: no — two High findings.** The FSPEC v0.13 erratum lands three decisions. One of them
(BR-6's material-only byte basis) resolves *in TSPEC's favour* and makes §D.5 upstream-true where
it was previously in tension — genuinely good news, and no work for this document. The other two
move ground TSPEC stands on:

| FSPEC v0.13 decision | Effect on TSPEC v0.7 | Verdict |
|---|---|---|
| BR-6 byte basis is **material only**; framing (identification line, per-document delimiters and source-path label, block preamble) is charged to no threshold, per REQ AC-2.3 "the material taken" | TSPEC §D.5's three-disjoint-pools accounting already said exactly this; upstream absorbed TSPEC's reading and named the contradiction removed | **Still true** — no finding |
| `maxBytesPerDocument: 0` decided: no document yields material, every one carries `RSN-NO-MATERIAL` and consumes no slot; new **E-36**, folded into **AT-30** as a third case; `RSN-NO-MATERIAL`'s BR-9 catalogue entry widened; D-12 restated as "yields any material" | TSPEC §I.2 restates AT-30 parenthetically as **two** zeros (`maxDocuments: 0`, `maxTotalBytes: 0`) and §T.6 states `RSN-NO-MATERIAL`'s only entry arm as "No BR-6 section present" | **F-01, High** |
| **F-O-1** now owns **two** heading-recognition rules — the document-shape predicate **and** the rule by which a heading counts as one of BR-6's named sections (numbered form / bare title / prefix) | TSPEC discharges only the first (§D.3); §Open Questions' obligation table maps F-O-1 → §D.3 and describes it as "the 'presents as a LEARNINGS document' predicate" alone | **F-02, High** |

Both findings are `delta` (this edit introduced them) and `local` (they sit in the upstream
material this edit changed: BR-6/BR-9/D-12/E-36/AT-30 and F-O-1). Neither is a re-litigation of a
settled decision, and neither disturbs anything v10/v11 approved — the byte-accounting core,
BR-1's two conjuncts, the corpus-outcome domain and the seam inventory are all untouched by this
delta and remain faithful.

**Scope discipline.** I re-read the upstream text TSPEC leans on at HEAD rather than checking off
the item list (DEC-ERR-03). F-02 in particular is not on any routed item list — it falls out of
F-O-1's widening, which is an obligation *transferred to this document*.

## Architecture

The delta touches no architectural claim in TSPEC. §A.1's placement of the selection step, §A.2's
dispatch-classification argument, §A.3's `_git`-not-`_listFiles` reasoning, §A.4's "the thresholds
do not bound prompt growth exactly" caveat and §A.5's `notices` threading all rest on BR-1 …
BR-5, BR-14 and BR-15 — none of which FSPEC v0.13 edited. I re-read BR-1 and BR-15 at HEAD to be
sure the v0.12 wording I approved in v11 survived this round unchanged: it did, byte-for-byte.

One architectural consequence of the delta is worth stating so the author can size the fix, though
it does not itself become a finding beyond F-01:

- **`maxBytesPerDocument: 0` is now a run-shape edge, not just a bound edge.** E-36 places it
  beside `maxDocuments: 0` and `maxTotalBytes: 0` as an *enabled, empty-selection* run. §A.4's
  argument that the enabled/disabled distinction is carried by the presence of the
  `learningsInjection` report key — not by the block's emptiness — is what makes the third case
  behave correctly, and it already holds. So the architecture absorbs E-36 without change; what
  does not absorb it is TSPEC's restatement of AT-30 (F-01) and its reject-arm inventory.

- **The material-only basis is now upstream's, not just TSPEC's.** §A.4's caveat that the realised
  block is larger than `totalBytesInjected` by a framing constant is, after v0.13, a restatement of
  FSPEC BR-6 rather than a TSPEC-side reconciliation of it. The paragraph stays correct as written;
  a future edit could cite BR-6 directly instead of arguing the point, but nothing is false.

No finding in this section.

## Interfaces

The delta changes no seam, no signature and no threshold key, so §I.1's module map and §I.5's
changed-signature table are untouched. Two §I.2/§I.3 claims are in the delta's blast radius, and
they part company:

**§I.2's threshold validation still holds — and is now more load-bearing.** TSPEC states the three
thresholds validate as **non-negative** integers (`Number.isInteger(v) && v >= 0`), not positive
ones, "because AC-4.4 requires `0` to be a *valid* admits-nothing configuration". FSPEC v0.13's
E-36 makes `maxBytesPerDocument: 0` a decided, exercised configuration rather than a merely
tolerated one, which is exactly the reading §I.2 already took. Had TSPEC validated positives, the
delta would have contradicted it outright. It does not.

**§I.2's parenthetical restatement of AT-30 no longer matches upstream (F-01).** The sentence
"**AT-30 owns none of them** — it is the admits-nothing-thresholds AT for AC-4.4 (`maxDocuments:
0`, `maxTotalBytes: 0` ⇒ enabled run, BR-8 rows present and empty)" enumerates the AT's cases, and
FSPEC AT-30 at HEAD now reads "`maxDocuments: 0`, separately `maxTotalBytes: 0`, **and separately
`maxBytesPerDocument: 0`** … *and* in the `maxBytesPerDocument: 0` case every corpus document
carries `RSN-NO-MATERIAL` (E-36)". TSPEC's compression is a strict narrowing of the AT it names,
and the narrowing is silent — a reader building §T.5's `learningsConfig.test.js` from TSPEC would
write two cases where the acceptance criterion now requires three. This is the contract-fidelity
class, not a wording nit: the dropped case has a distinct observable outcome (per-document reject
rows over the whole corpus) that neither of the two retained cases produces.

**§I.3's `extractInjectableMaterial` contract survives the delta, and is the right home for the
zero case.** The documented return `{material, bounded, bytes, sections}` with
`bytes = Buffer.byteLength(material, "utf8") <= maxBytes` is already total over non-negative
`maxBytes`, so `maxBytes: 0` yields empty material without a special case. What TSPEC does not say
is what the *selector* does with that result — whether an empty-material document is emitted as
`RSN-NO-MATERIAL` before the count and total bounds are applied ("consumes no slot", FSPEC BR-6/
E-36). TSPEC's stated policy is that behaviour "is FSPEC's and is referenced by rule id, never
restated", so the omission is defensible; but §I.3's `selectLearnings` doc comment names
BR-2/BR-4/BR-5/BR-6 as its scope, and BR-6 is precisely the rule that moved. Folding the zero case
into F-01's fix keeps the comment honest.

## Data Model

This is where the delta's good news lands, and where its second High lands.

**§D.5's byte accounting is now upstream-true — the contradiction closed in TSPEC's favour.**
Before this round FSPEC BR-6 defined a document's *contributed bytes* as "its identification line,
its delimiters and source-path label (BR-7), **and** the section headings and bodies taken", while
TSPEC §D.5 defined three disjoint pools with `maxBytesPerDocument` and `bytesInjected` bounding
**material only** and framing charged to nothing. That was a genuine divergence in a
product-visible quantity (what AC-2.3's *bounded* flag means, and what a fixture's expected byte
count is). FSPEC v0.13 resolves it by adopting TSPEC's basis verbatim in substance — "a document's
**contributed bytes** are its **material** — the section headings and bodies taken from it, and
nothing else … the identification line, the document's delimiters and source-path label, and the
block's preamble (BR-7) count toward none of the three quantities" — and names the reason TSPEC
gave (TE F-02's circularity: "a document is never abridged to pay for the annotation that says it
was abridged"), grounded on REQ AC-2.3's "the material taken". §D.5's pool table, the
`extractInjectableMaterial` contract, the "hand-computable from the fixture alone" claim and the
character-safe cutting paragraph are all still exact against HEAD. Nothing to change.

**§D.3 discharges only half of F-O-1 as it now stands (F-02).** FSPEC's obligation row is now:
"Two heading-recognition rules, on the same terms: the predicate for 'presents as a LEARNINGS
document' (BR-3), **and** the rule by which a heading counts as one of BR-6's named sections —
whether the numbered form, the bare title or a prefix of it is matched. Both are bounded by two
requirements this FSPEC fixes: each consults only the document's bytes, and each is decidable
without a model call." TSPEC §D.3 is titled "The document-shape predicate *(discharges F-O-1)*"
and answers the first rule only, with `LEARNINGS_HEADING_RE = /^#\s+LEARNINGS\b/`. There is no
second-rule statement anywhere in the document: §I.3's doc comment says only "BR-6's five priority
sections, in priority order", and P-6 in the ground-truth table *observes* that corpus headings
take the `## N. Title` form without turning that observation into a matching rule. §Open Questions'
entry-obligation table then records F-O-1 as discharged, citing §D.3.

This matters at the product lens, not merely the bookkeeping one. The section-heading matching rule
decides which material a document contributes, and therefore what AC-2.1's priority ordering and
AC-2.3's bound actually operate on. Two implementations differing only in whether they match the
bare title or require the numbered prefix select different bytes from the same corpus — and the
`## N. Title` form is a convention of `harvest-learnings/SKILL.md`, not an invariant of documents
already on disk. FSPEC has deliberately declined to fix it and named TSPEC the owner; TSPEC must
answer, or the question is owned by nobody and gets decided by whichever regex the implementer
writes.

Everything else in §D is untouched by the delta: §D.1's non-`null`-scoped domain membership,
§D.2's record shape, `LEARNINGS_CORPUS_OUTCOMES` and the frozen reason/notice catalogues (§D.1,
line-600 literal) are unchanged upstream and remain faithful. Note that `RSN-NO-MATERIAL` is
already a member of the frozen reason catalogue, so F-01's fix costs no catalogue change — only a
correction of what the id means and when it is emitted.

## Test Strategy

Product lens only: does TSPEC's test mapping still preserve the acceptance criteria as upstream now
states them? Two places drift, both consequences of the same delta and both folded into F-01.

**§T.5's suite map and closure count survive; the AT-30 justification does not.** The map assigns
`learningsConfig.test.js` → AT-30, AT-32, count 2, and the closure claim 2+9+3+3+6+12 = 35 is a
count of **ATs**, not of cases, so E-36 adding a third case to AT-30 does not break the arithmetic
and no AT is added or moved. Good. What does drift is the paragraph justifying the suite's L3
layer: it characterises AT-30 as "requires an enabled run whose BR-8 rows are **present and
empty** — a claim only a whole run can make". True of all three cases, but incomplete for the third:
AT-30 at HEAD additionally requires that in the `maxBytesPerDocument: 0` case **every corpus
document carries `RSN-NO-MATERIAL`**. That is an assertion over per-document reject rows, which
needs a **non-empty corpus fixture** — the other two cases can pass over an empty or arbitrary
corpus. A PLAN task derived from TSPEC as written would not know to supply one, and the test would
be written against whatever corpus the seam happens to return.

**§T.6's fail-open arm inventory now under-states `RSN-NO-MATERIAL`.** The row reads "No BR-6
section present ⇒ `RSN-NO-MATERIAL` | AT-28". FSPEC BR-9's catalogue at HEAD reads "Eligible, but
yields **no material** — it carries none of BR-6's priority sections, **or the per-document bound is
zero and admits none** (BR-6)", and D-12's question is restated from "Does the document carry any
priority section?" to "Does the document **yield any material**?". §T.6 is explicitly the coverage
*obligation* inventory — "the inventory above is the obligation" — so an arm missing from it is an
arm no test is obliged to enter. The second entry path into `RSN-NO-MATERIAL` (AT-30's third case,
E-36) has no row.

**What is unaffected, checked rather than assumed:** AT-11's and AT-12's expected byte counts rest
on §D.5's material-only basis, which upstream has now adopted, so those oracles are *more* firmly
grounded than when I approved them — they would have been the tests to break had v0.13 gone the
other way. AT-28's arm (document carrying none of BR-6's five sections) is untouched. AT-31/AT-32's
enabled/disabled distinction, AT-26's set-equality closure over the two-member notice catalogue,
and the `COUNT-BINDING`/`BYTES-BINDING` fixtures are all outside the delta.

No acceptance criterion loses coverage silently in a way TE's lens would catch and mine would not;
the two drifts above are traceability defects — an AC whose full statement no longer maps to a
named test obligation.

## Open Questions

**Erratum ledger, re-checked against FSPEC v0.13.** No entry changes state as a result of this
round, and I verified each rather than carrying it forward:

| TSPEC erratum | State in v0.7 | At FSPEC v0.13 |
|---|---|---|
| ERR-1 (FSPEC BR-14) | OPEN | Still open — BR-14's bullets are byte-unchanged in this delta; v0.13 *cites* BR-14 (E-36's run is "the enabled, empty-selection run BR-14 describes") without editing it |
| ERR-2 (FSPEC §Edge Cases, run-shape edges — no row for the erratum land-proof retry dispatch) | OPEN | Still open, and now **more** conspicuous: v0.13 added E-36 to the run-shape edge inventory and renumbered the closure sentence to "E-01 … E-36", so the round touched that very table and still left the land-proof retry unrowed |
| ERR-3 (BR-15), ERR-4 (REQ G-1), ERR-6 (AC-3.3), ERR-7 (BR-1) | CLOSED | Still closed; the closing text is unchanged at HEAD |
| ERR-5 (FSPEC E-13's "measured: occurs at HEAD") | OPEN | Still open — E-13 untouched |

ERR-2's non-closure is not a finding of *this* confirmation (it is a routed item against FSPEC, not
a fidelity defect in TSPEC), but the ledger entry stays accurate, which is what I check.

**The header's upstream pin is stale (F-03).** The header table's Upstream row pins FSPEC
`(v0.12)`, and the v0.7 erratum note is titled "re-grounded on FSPEC v0.12 / REQ v0.9 at HEAD".
FSPEC is v0.13 at HEAD. The REQ pin (v0.9) is still correct — REQ did not move in this round, and
FSPEC's own v0.13 note says so explicitly ("re-grounded on REQ v0.9 at HEAD, unchanged — no
upstream decision to absorb"). Low, because no claim in the body is false *because of* the pin;
but the pin is the mechanism by which the next reader knows which upstream version the body was
checked against, and it currently promises a version that no longer exists. It should be corrected
in the same edit that lands F-01 and F-02, with a v0.8 erratum note recording what v0.13 moved.

**One question I am not filing as a finding.** The Cross-Reviews row still enumerates rounds only
through v6 while this is round v12 — the same bookkeeping drift I noted at v11. FSPEC solved it by
replacing the enumeration with "every round present on branch, not hand-enumerated". Still worth
adopting whenever the header is next edited (which F-03 now forces), still not a false claim.

## Positive Observations

_pending_

## Recommendation

_pending_
