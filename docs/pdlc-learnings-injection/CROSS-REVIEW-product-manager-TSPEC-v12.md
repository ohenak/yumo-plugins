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

_pending_

## Test Strategy

_pending_

## Open Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_
