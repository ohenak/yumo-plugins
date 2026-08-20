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

**Cross-feature check.** The erratum violates no standing constraint and contradicts no promoted
decision: I re-read `docs/_constraints/DOMAIN-CONSTRAINTS.md` (note its own preamble: this repo's
DC-07/DC-08/DC-09 are *not* the generic review-skill constraints of the same ids) and
`docs/_decisions/DECISIONS-review-severity-bars.md` §DEC-DOC-01, whose cite-content-not-line-number
rule is the basis for the Low anchor findings carried below. Nothing raised here is
`Cross-Feature` — the defects are this document's restatements of its own upstream.

## Interfaces

Two interface contracts carry the erratum's weight, and one of them is now short a rule.

**`extractInjectableMaterial(text, maxBytes)` (§I.3) — contract holds, semantics of `maxBytes: 0`
are derivable but unstated.** The JSDoc contract is *"BR-6's five priority sections, in priority
order, bounded to `maxBytes` UTF-8 bytes of MATERIAL (§D.5); `bounded` is decided at the cut, not
re-derived downstream"*, returning `{material, bounded, bytes, sections}`. At `maxBytes: 0` the
character-safe cut of §D.5 yields `material: ""`, `bytes: 0`, `sections: []` — the return value E-36
needs. So the interface *supports* the decision without a signature change; what no TSPEC sentence
says is whether `bounded` is `true` or `false` in that case. It matters for a test author: BR-8's
row carries the **bounded** flag, and under E-36 the document never reaches a BR-8 row at all
(it is dropped), so the flag's value is unobservable there — but T-O-6's property, which PROPERTIES
owes, asserts *"`bounded` is `true` exactly when material was cut"* over **any** non-negative
`maxBytes`, and `maxBytes: 0` is now a distinguished member of that space. A generator that samples
`0` will decide the question by accident unless TSPEC decides it first. Recorded as F-04 (Medium) —
it is a gap the erratum widened rather than created, but `maxBytesPerDocument: 0` was a *possible*
configuration before v0.13 and is a *specified* one now.

**`selectLearnings({entries, feature, thresholds})` (§I.3) — wide enough, but its stated drop rule
is the wrong one.** The function owns "the whole of BR-2/BR-4/BR-5/BR-6 as one pure function" and
returns `{selected, rejected, totalBytes, orderKeys}`. Because it receives `thresholds`, the
zero-bound drop is decidable inside it and `rejected[]` is already documented as **total over
`entries`** — so E-36's "every one carries `RSN-NO-MATERIAL`" has a producible path today. The
break is F-01: the only place TSPEC states *when* `RSN-NO-MATERIAL` fires says *"No BR-6 section
present"*. A document that carries three sections under `maxBytesPerDocument: 0` fails that
condition, so an implementer following TSPEC puts it in `selected` with `bytes: 0`, consuming one
of `maxDocuments`' slots and emitting a BR-8 row — and AT-30's third case ("BR-8 rows present and
**empty**") reds. Two documents disagreeing about which array the entry lands in is precisely the
kind of divergence a delta confirmation exists to catch.

**`looksLikeLearningsDocument(text)` (§I.3, §D.3) — unchanged and still correct, but no longer the
whole of F-O-1.** Its contract (*"Bytes only, no model call (F-O-1)"*) satisfies both bounds FSPEC
fixes. Upstream now names a **second** rule on the same terms, and there is no second exported
function, no regex and no prose in TSPEC that answers it: given a heading line, is it one of BR-6's
five named sections — matched as `## N. Title`, as the bare title, or as a prefix? FSPEC is
explicit that it will not decide this ("Which heading forms count as which section is F-O-1's,
not text to be matched literally from here"), so the rule exists nowhere in the pipeline. That is F-02. Its
test consequence is concrete: AT-11's oracle is a **set equality over `sections`**, the BR-6
priority names actually taken, and AT-28's oracle is "no BR-6 section present ⇒
`RSN-NO-MATERIAL`" — neither can be written without knowing what counts as a match, and a fixture
author will silently pick one interpretation, pin it, and make the choice unfalsifiable.

**Unchanged interface surface.** §I.4's shell (`gatherLearningsCorpus`, `renderLearningsBlock`,
`buildLearningsInjector`) and §I.5's five defaulted-parameter extensions are untouched by this
erratum: the disabled path still branches before entering the feature (AC-5.1a), and a
zero-threshold run is an **enabled** run, so it takes the same path the other two zeros take. I
re-confirmed that reading against BR-14 at HEAD.

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
