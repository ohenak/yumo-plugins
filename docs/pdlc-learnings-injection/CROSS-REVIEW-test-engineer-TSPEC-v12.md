# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (bytes unchanged since v11 approval, `REVIEWED-COMMIT: bfe58851`)
**Upstream under test:** FSPEC `sha256:ae75fa62…` (v0.13, erratum round `c1d7218e..cfb3d4d6`); REQ `sha256:ff605dd3…` (v0.9, unchanged)
**Date:** 2026-08-20
**Iteration:** 12
**Round type:** upstream-cascade confirmation

## Overview

**Question answered:** TSPEC's own bytes have not moved since my v11 approval
(`REVIEWED-COMMIT: bfe58851`, recorded against FSPEC `sha256:fb18dbda…`, v0.12). FSPEC has: the
v0.13 erratum (`c1d7218e..cfb3d4d6`) lands three decisions. Does TSPEC still read as a faithful
compression of FSPEC as it now stands?

**Answer: no — two High findings, both `delta`, both `local`.** The three landed decisions are not
in dispute and two of them are good news for this TSPEC. What is in dispute is that two of them
moved upstream text this TSPEC restates, and TSPEC's restatements were written against the older
wording.

What the erratum changed, and what it does to this TSPEC:

| FSPEC v0.13 decision | Effect on TSPEC |
|---|---|
| **Byte-accounting basis is material only.** Contributed bytes are the section headings and bodies taken; the identification line, per-document delimiters, source-path label and block preamble are charged to no threshold (REQ AC-2.3, "the material taken"). | **Resolves in TSPEC's favour.** §D.5's three-pool table already says exactly this — Material bounded, per-document framing and block framing bounded by nothing. The contradiction the erratum names was FSPEC's side; §D.5, AT-11's and AT-12's hand-computable fixtures and T-O-6's property all stand unchanged. No finding. |
| **`maxBytesPerDocument: 0` decided (E-36, AT-30).** No document yields material, every one carries `RSN-NO-MATERIAL` and **consumes no slot**; the run is BR-14's enabled, empty-selection run. `RSN-NO-MATERIAL` and D-12 are now stated over *"yields material"*, not *"carries a section"*. | **Breaks two TSPEC restatements.** §T.6's decision-branch map still fires `RSN-NO-MATERIAL` on the structural condition (*"No BR-6 section present"*), which a zero-bound document with sections does not satisfy — under TSPEC as written it is selected with `bytes: 0` and takes a slot, contradicting E-36 and AT-30's third case (F-01, High). §I.2's AT-30 gloss still enumerates two zero cases and omits the `RSN-NO-MATERIAL` conjunct (F-03, Medium). |
| **F-O-1 now owns *both* heading-recognition rules** — the document-shape predicate **and** the rule by which a heading counts as one of BR-6's named sections (numbered form / bare title / prefix). | **Leaves an obligation undischarged.** §D.3 discharges the first rule only, and §T.6's obligation map still glosses F-O-1 as "the 'presents as a LEARNINGS document' predicate". The second rule has an owner named upstream and no text in the owner (F-02, High). |

**Scope note (DEC-ERR-03).** Both Highs are findings of *this* confirmation, not of the item list:
the items landed cleanly in FSPEC. The defect is that this TSPEC no longer compresses the upstream
text those items produced. Both are repairable inside TSPEC in a bounded follow-up — neither asks
FSPEC to move again, and neither touches a settled decision.

**Verification performed.** Read the full FSPEC diff `c1d7218e..HEAD`; re-read TSPEC §D.3, §D.5,
§I.2 (config/threshold validation), §I.3, §T.5 and §T.6 at HEAD; confirmed the two upstream hashes
in the dispatch against the working tree (`shasum -a 256` — both match); grepped TSPEC for
`RSN-NO-MATERIAL` (2 hits: the frozen catalogue at §D.1, the decision map at §T.6), for
`maxBytesPerDocument` (11 hits, all threshold-plumbing or the character-safe cut) and for any
statement of BR-6's heading-matching rule (none).

## Architecture

The architecture TSPEC specifies is untouched by this erratum and I re-checked only the two seams
the changed upstream text reaches.

**§A.1/§A.2 — where selection sits.** F-O-6's discharge is unaffected: the erratum changes what
counts toward a bound and what a zero bound means, not where the step runs or how the block reaches
the composer. The four authoring dispatch sites, BR-1's two conjuncts and the conditional-spread
precedent I confirmed in v11 are all still verbatim-present upstream at `sha256:ae75fa62…`
(re-grepped BR-1, BR-15, D-2 — the v0.12 erratum's text survived v0.13 unchanged, and the v0.13
header note says "No other change").

**The drop-before-bounds ordering is the architectural claim now under strain.** FSPEC BR-6 at HEAD
orders the pipeline as: extract material → a document that yields nothing is **dropped before the
bounds are applied** with `RSN-NO-MATERIAL` → the count and total bounds run over what remains.
TSPEC's §I.3 delegates the whole of BR-2/BR-4/BR-5/BR-6 to one pure `selectLearnings`, which is the
right shape and can express this ordering — the function sees `thresholds` and each entry's text,
so `extractInjectableMaterial(text, 0)` returning empty material is decidable inside it. The
architecture is not what breaks; the **stated firing condition** for the drop is (F-01). This is
worth saying explicitly, because it bounds the repair: no seam moves, no signature changes, and
`selectLearnings`'s contract in §I.3 is already wide enough. The fix is textual, in §T.6's decision
map and wherever the drop condition is restated.

**No new production-path exposure.** The zero-per-document case is reachable only through
configuration, and §T.5 already routes AT-30 to `learningsConfig.test.js` as an **L3** seam-driven
run over the real `main()` (`import mainDev, * as dev from "../orchestrate-dev.js"`, on the
`advisoryDisabled.test.js` pattern). That is the correct level for the new third case too — the
claim "BR-8 rows present and empty, and every corpus document carries `RSN-NO-MATERIAL`" is a
whole-run claim about the finished report, exactly as AT-30's other two zeros are, and a unit test
over `selectLearnings` could not falsify the report-key half of it. So the third case inherits a
level assignment that is already justified; it needs a fixture, not a new suite.

**Cross-feature check.** Nothing in the erratum touches DC-07 (builder-not-wired), DC-09 (coverage
gate) or the DOMAIN-CONSTRAINTS entries this feature leans on; I re-read `docs/_constraints/` and
`docs/_decisions/DECISIONS-review-severity-bars.md` for the DEC-DOC-01 anchor rule applied below.

## Interfaces

_pending_

## Data Model

_pending_

## Test Strategy

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
