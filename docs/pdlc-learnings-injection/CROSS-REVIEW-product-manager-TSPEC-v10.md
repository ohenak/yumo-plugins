# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 10
**Round type:** upstream-cascade confirmation (FSPEC v0.10 → v0.12)

## Overview

**One question, one answer: does TSPEC still hold as approved against FSPEC at HEAD?**

TSPEC has not moved. Its bytes are `sha256:eff5a19bffcc35383ae71b18a43ec71418411f885ebfd99f63865d6377ba72d3`,
byte-identical to the `APPROVAL-HASH` recorded in `CROSS-REVIEW-product-manager-TSPEC-v9.md`, and
`git log 260f34bc..HEAD -- TSPEC-pdlc-learnings-injection.md` is empty. REQ has not moved either:
`sha256:ff605dd3…` at HEAD, the same bytes this document has been reviewed against since v7.

FSPEC has moved, and this time **not** header-only. It went from `sha256:a4f775bd…` (v0.10, the
`UPSTREAM-STATE` recorded in v9) to `sha256:fb18dbda…` (v0.12) over six commits (`3f21bd3b..c1d7218e`),
+54/−26 lines. The substantive content of that delta is that upstream **adopted the two corrections
this TSPEC itself routed upstream** as ERR-7 and ERR-3:

1. **BR-1 now states REQ C-1's rule with both conjuncts** — authoring-classified **and** target
   document among REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES — and says in terms that the second
   conjunct is "load-bearing, not defensive", naming the code-review phase's optimizer round as the
   dispatch it excludes (REQ AC-1.2, NG-5).
2. **BR-1's complement is carried through** to BR-11, AT-03 and AT-29, which now quantify over
   dispatches "outside BR-1's rule" rather than over "non-authoring" ones; AT-02 gains a fixture
   containing an authoring-classified dispatch with no C-1 target, and D-2 asks the two-conjunct
   question with all three branches named.
3. **BR-15's expected read set** drops the corpus enumeration (which opens no file under `docs/` and
   so contributes no member to that instrument) and is stated as an enumerable set equality, not a
   count; AT-33 follows.
4. The Overview and A-2 stop restating one conjunct when deferring to BR-1, and the header
   Cross-Reviews row stops hand-enumerating rounds.

**The answer is yes, TSPEC still holds — and its central design claim is now stronger, not weaker.**
TSPEC's `injectHere = dispatchKind === "authoring" && LEARNINGS_TARGET_DOCTYPES.includes(docType)`
(§A.2) was, at approval, a *divergence* from FSPEC BR-1 that TSPEC honestly refused to resolve
silently in code and routed as ERR-7. Upstream has now agreed. The same design text that was a
routed conflict is, at HEAD, an exact compression of BR-1. No rule, threshold, notice id, config
state, report field or acceptance criterion that TSPEC compresses changed against it.

What the delta *does* leave behind is bookkeeping that upstream has overtaken: two open ERR entries
in TSPEC (ERR-7, ERR-3) that quote FSPEC text no longer at HEAD and describe a conflict that no
longer exists, and one AT-02 fixture obligation FSPEC newly names that TSPEC's fixture inventory
does not yet enumerate. Those are the findings below — Medium, none gating, all inside the material
this delta targeted.

## Architecture

**What this TSPEC leans on upstream, re-read at the current version.** I did not re-read TSPEC from
scratch; I re-read the FSPEC sections it compresses, at `sha256:fb18dbda…`, and checked TSPEC's
transcription against those bytes rather than against my memory of v0.10.

| TSPEC claim | Upstream locus at HEAD | Still says it |
|---|---|---|
| Injection attaches at `dispatchAndVerify`, gated on `dispatchKind === "authoring"` **and** `docType ∈ {REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES}` (§A.2, `TSPEC:131`, `:35-36`) | FSPEC BR-1 (v0.12, two conjuncts), REQ C-1, AC-1.2, NG-5 | **Yes — and newly so.** At v0.10 this was TSPEC's routed divergence; at v0.12 it is upstream's own rule, word for word in substance |
| Phase CR's optimizer round (`docType: null` over a directory target) carries no block, contributes no `dispatches[]` row and no filesystem footprint, and its prompt is byte-identical to the disabled run's (§A.2, `TSPEC:134-137`) | FSPEC BR-1's "load-bearing, not defensive" paragraph; BR-11 and AT-03 as re-quantified over dispatches "outside BR-1's rule" | Yes — upstream now names exactly this dispatch |
| The `docType` conjunct consumes two existing pipeline values rather than restating a call-site membership list (§A.2 property 1) | FSPEC BR-1 "Both conjuncts read the pipeline's own existing values, not a new list maintained by this feature"; FSPEC A-2 as rewritten | Yes — A-2's rewrite is TSPEC's argument, adopted upstream |
| `RSN-SELF` is decided from the path before any read, so a self document is never opened, which is what BR-15's expected-set exclusion requires (§D.6, `TSPEC:777-781`) | FSPEC BR-15 at HEAD (expected set = report-named documents less `RSN-SELF`) | Yes |
| The corpus enumeration is a `git ls-files` call, not an open under `docs/` (§I.1, §A.3) | FSPEC BR-15 at HEAD: "The corpus enumeration … contributes **no** member: it opens no file under `docs/`" | Yes — upstream adopted TSPEC's ERR-3 reading |
| Ordering keys and corpus outcomes are recorded **per dispatch**, at the two loci AC-3.3 names (§A.5, §D.1, §D.2) | FSPEC BR-9/BR-10, AT-19…AT-22 | Yes — untouched by this delta |
| Four config states owned by exactly two ATs, AT-31/AT-32 (§I.2, `TSPEC:464-469`) | FSPEC E-21…E-34 mapping rows | Yes — block byte-identical across the delta |

**The one architectural consequence of the delta is subtractive, not additive.** Nothing in TSPEC's
design has to change to match FSPEC v0.12; what has to change is TSPEC's *account of its own
disagreement*. §A.2's property 1 still closes with "FSPEC BR-1 as written forbids this conjunct
… so the divergence is **routed as ERR-7**, not resolved silently in code" (`TSPEC:155-158`), and
ERR-7 itself (`TSPEC:1297-1311`) quotes BR-1's old single-conjunct sentence verbatim — "the pipeline
classifies it as authoring at the moment it is composed", "consumes the classification, it does not
restate the membership" — as the text TSPEC is in tension with. Upstream no longer contains either
sentence in that form. Per DEC-ERR-03 that is a finding of this confirmation whether or not it was
on the item list: TSPEC cites upstream text upstream no longer says (F-01).

This is a good problem. The routed conflict was resolved in the direction TSPEC argued for, which is
precisely the outcome the routing existed to obtain. What is left is to record the resolution the
same way TSPEC already records ERR-4 and ERR-6 — "**CLOSED**, resolved by FSPEC v0.12" — so that a
PLAN author or implementer reading the erratum log does not go looking for a live contradiction.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Findings

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
