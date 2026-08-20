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

**§D.5's byte accounting is now the aligned side, and I want to record that plainly.** The v0.13
erratum's own note says the material-only basis "removes the contradiction with TSPEC's
accounting" — i.e. FSPEC moved to TSPEC. Re-reading §D.5 against the new BR-6 paragraph, the two
now say the same thing in the same terms:

| Claim | FSPEC v0.13 (BR-6, "The byte-accounting basis") | TSPEC §D.5 |
|---|---|---|
| What is charged | "a document's **contributed bytes** are its **material** — the section headings and bodies taken from it, and nothing else" | Pool **Material**: "only the section headings and bodies taken from that document under BR-6" |
| What is not charged | identification line, per-document delimiters and source-path label, block preamble — "count toward none of the three quantities" | Pools **Per-document framing** and **Block framing**: "Bounded by — Nothing" |
| The three quantities | `maxBytesPerDocument` per document, `maxTotalBytes` over the sum, BR-8's *bytes injected* the same quantity | identical, plus `bytesInjected === bytes` and `totalBytesInjected === ` their sum |
| Why it matters | "an expected byte count is computable from a fixture alone" | "expected counts are hand-computable from the fixture alone" |

The consequence for testing is that **no oracle moves**: AT-11's section-set equality, AT-12's
exact-byte oracle on the character-safe cut, and T-O-6's property over
`extractInjectableMaterial` all keep the semantics they were written against, and the
non-circularity argument §D.5 makes (the `ABRIDGED` marker is emitted *because* the document was
bounded, so charging it to the document's own budget would make the budget depend on its own
outcome) is now upstream-endorsed rather than merely TSPEC-local. This is the one place where the
erratum makes this TSPEC *more* faithful than it was at v11. No finding.

**§D.1's frozen catalogues survive unchanged — but one member's meaning widened.**
`LEARNINGS_REJECT_REASONS` still has exactly the six ids upstream's per-document catalogue lists,
so the set-equality test (DC-01, C-9) is unaffected: the erratum added no id. What changed is the
**gloss** of one member. Upstream now reads `RSN-NO-MATERIAL` as *"Eligible, but yields no
material — it carries none of BR-6's priority sections, **or** the per-document bound is zero and
admits none"*, and D-12's question moved from "Does the document carry any priority section?" to
"Does the document **yield any material**?". TSPEC's catalogue is a bare id list, so the frozen
literal is fine; the disjunction is lost only where TSPEC restates the firing condition, which is
§T.6 (F-01). A reviewer could read this as a documentation nit — it is not. The two disjuncts route
a document to **different arrays** (`rejected[]` vs `selected[]`) with different slot accounting,
and only one of the two is stated.

**§D.2's report record and §I.2's threshold validation are untouched and remain correct.** §I.2
already validates the three thresholds as **non-negative** integers (`Number.isInteger(v) && v >= 0`)
precisely so that `0` is a valid admits-nothing configuration rather than an invalid key falling
back to its default — that reading, written for AC-4.4's other two zeros, extends to
`maxBytesPerDocument: 0` with no edit. E-36 therefore has a config path today; what it lacks is the
selection semantics (F-01) and the fixture (F-03).

## Test Strategy

**§T.5's suite map still balances, and AT-30's level assignment still holds.** The erratum added no
AT: AT-30 grew a third case and a conjunct, so the 35-member `learningsSuiteMap` literal, the
six-suite disjointness assertion and the arithmetic (2 + 9 + 3 + 3 + 6 + 12 = 35) are all
unaffected. AT-30 stays in `learningsConfig.test.js` at **L3**, and §T.5's justification for that
level — "AT-30 requires an enabled run with BR-8 rows **present and empty**, a claim only the whole
run can make" — is *strengthened* by E-36, whose second conjunct ("every corpus document carries
`RSN-NO-MATERIAL`") is a claim about the finished report's per-document reason rows. A unit test
over `selectLearnings` would prove the reason rows and miss the report-key half; the L3 seam-driven
run over the real `main()` proves both. No finding on level assignment.

**F-03 — §I.2's AT-30 gloss is now a two-thirds transcription.** §I.2 says, in the passage that
disowns the four config rows: *"**AT-30 owns none of them** — it is the admits-nothing-thresholds
AT for AC-4.4 (`maxDocuments: 0`, `maxTotalBytes: 0` ⇒ enabled run, BR-8 rows present and empty)"*.
Upstream AT-30 at HEAD enumerates **three** zeros — `maxDocuments: 0`, separately
`maxTotalBytes: 0`, and separately `maxBytesPerDocument: 0` — and adds *"and in the
`maxBytesPerDocument: 0` case every corpus document carries `RSN-NO-MATERIAL` (E-36)"*. A PLAN
author deriving `learningsConfig.test.js`'s fixtures from TSPEC writes two cases and the third
zero ships untested, with E-36 named by no test at all. This is the same defect class I recorded at
v11 as F-01 (§T.6's AT-02 fixture list carrying three of four run shapes) — a fixture-enumeration
transcription gap — and it earns the same Medium: the strategy is right, the enumeration is short.
The repair is one clause in §I.2 plus, ideally, an explicit note that the third case's oracle is
**three positive conjuncts** (BR-8 rows present and empty; the `learningsInjection` key present,
not absent; every corpus path in the per-document reason rows with reason exactly
`RSN-NO-MATERIAL`) — never an absence-only "no rows" assertion, which any accidental disabled run
would also satisfy.

**F-01's test consequence, stated as the test that would fail.** Write AT-30's third case today
against TSPEC as written and the two documents disagree about the expected value, so the case
cannot be authored without choosing which one to believe:

- FSPEC v0.13 / E-36: `selected` is empty, `rejected` carries one `RSN-NO-MATERIAL` row per corpus
  document, `bytesInjected` rows absent, no slot consumed.
- TSPEC §T.6 as written: the drop fires only on "No BR-6 section present", so a section-carrying
  document under a zero bound is **selected** with `bytes: 0` and takes a `maxDocuments` slot, and
  BR-8's rows are present and **non-empty**.

That is not a doc-hygiene finding; it is a specification contradiction reachable by a supported
configuration, and it is why F-01 is High. The repair is to restate the drop over *yields no
material* — which is also the more falsifiable condition, since it is a property of the extractor's
return value rather than of the document's shape, and can be asserted directly on
`extractInjectableMaterial`'s `{material: "", sections: []}`.

**F-02's test consequence — an unowned rule makes two oracles unfalsifiable.** Without the
heading-matching rule, AT-11 (set equality over `sections`) and AT-28 (no BR-6 section ⇒
`RSN-NO-MATERIAL`) are both authored by guessing. Worse, the guess is invisible: a fixture written
with `## 2. Cross-Feature Patterns` passes under numbered-form matching, bare-title matching and
prefix matching alike, so the suite is green under all three readings and the choice is pinned
nowhere. The mutation check that would expose it — change a fixture heading to the bare
`## Cross-Feature Patterns` and expect a decided outcome — cannot even be written, because there is
no specified outcome to expect. §D.3's existing shape is the model for the repair: one exported
predicate, a regex, a "bytes only, no model call" contract, and a grounding sentence against
`pdlc/skills/harvest-learnings/SKILL.md` §"LEARNINGS Document Format" (P-6 already measures the
`## N. Title` form across all 9 corpus documents, so the ground truth is in hand). Note the rule
must decide the **non**-conventional forms too, since P-6 measures only what the harvest skill
writes today and E-33's section-less document is an eligible state, not an `RSN-UNPARSEABLE` one.

**Carried findings, re-verified at HEAD.** The two Mediums and the anchor Lows from v11 are
unresolved because TSPEC's bytes have not moved; I re-checked each rather than copying it forward.
§T.6's AT-02 fixture list still carries three of upstream's four dispatch run shapes (F-05,
inherited); `present` is still returned by `parseLearningsConfig` with no consumer in §I.3's gate
(which drops it) and no behavioural oracle in §T.5 — §OQ's rationale keeps it for AC-5.1a's
report-key distinction, but no test reads it (F-06, inherited); §A.2's six `converge()` `docType` line anchors and the four
seam anchors in §Ground-truth P-7/P-8, §A.4 and §A.5 are still stale against HEAD (F-07, F-08,
inherited, DEC-DOC-01); and the header's Upstream row, already one version behind at v11, is now
two — it reads FSPEC **v0.12** where HEAD is **v0.13**, alongside the five passages still citing
"FSPEC v0.9" (F-09, now `delta` for the version string itself). None of these falsify a cited
proposition, and none gate.

## Open Questions

**Q-01 — Is `bounded` `true` or `false` when `maxBytesPerDocument` is `0`?** §D.5 decides `bounded`
"at the cut", and at a zero bound nothing is taken, so no cut occurs — yet the document is
maximally abridged. Under E-36 the document never reaches a BR-8 row, so the flag is unobservable
*there*; but T-O-6's property quantifies over **any** non-negative `maxBytes`. Decide it in TSPEC
before PROPERTIES writes the generator, or exclude `0` from the property's domain explicitly with a
stated reason. (Basis of F-04.)

**Q-02 — Does `maxTotalBytes: 0` now drop or select?** The erratum decided the per-document zero
(drop, `RSN-NO-MATERIAL`, no slot) but left E-25's total zero as it was: "Enabled run, empty
selection, BR-8 rows present and empty". Two zeros with the same observable outcome may reach it by
different routes — one through `RSN-NO-MATERIAL`, the other presumably through `RSN-BYTES` — and
BR-9 requires **every** known document to carry a reason. If both zeros are asserted with the same
oracle, a fixture cannot tell the routes apart and a regression that swapped them would stay green.
Not a finding against this TSPEC (upstream owns the two edges), but AT-30's three cases should
assert their **reason ids** distinctly, not merely "rows empty".

**Q-03 — Which repair round owns F-01 and F-02?** Both are delta-and-local, both are repairable in
TSPEC alone, and neither asks FSPEC to move again. My reading is that one bounded follow-up round
on TSPEC discharges both: F-01 is a restatement of §T.6's drop condition over *yields no material*,
and F-02 is a new §D.3-shaped subsection stating BR-6's heading-matching rule and re-glossing
F-O-1 in §T.6's obligation map. If the orchestrator instead routes this to TSPEC's ordinary
revision loop, both findings survive the transfer unchanged.

**Q-04 — Does the PLAN already carry a task that would silently absorb F-02?** PLAN was authored
against F-O-1's single-rule wording. If a task exists for "implement `looksLikeLearningsDocument`
and its pin test", it will look complete while the second rule remains unwritten. Worth a check
when the TSPEC repair lands, so the PLAN grows the matching-rule task rather than inheriting an
implicit one.

**Assumption I relied on.** The dispatch's two upstream hashes match the working tree
(`ae75fa62…` FSPEC, `ff605dd3…` REQ, both verified by `shasum -a 256`), and REQ is genuinely
unchanged this round — so every finding below is about FSPEC's movement only, and the REQ-anchored
claims I confirmed at v11 (AC-2.3's "material taken", AC-4.4's admits-nothing zeros, AC-5.1a's
report-key distinction, §4.1's declared defaults) are undisturbed.

## Positive Observations

- The material-only basis lands FSPEC on **TSPEC's** side of a contradiction I have been tracking
  since v10. §D.5's three-pool table needed no edit to absorb it — a good sign that the accounting
  was specified at the right altitude.
- `maxBytesPerDocument: 0` was reachable-but-undecided before this round; deciding it as
  drop-with-`RSN-NO-MATERIAL` (rather than select-with-zero-bytes) is the choice that keeps BR-8's
  rows meaningful, and E-36 + AT-30 give it both an edge id and a named test.
- The erratum's header note states its own scope ("No other change") and I confirmed that against
  the diff: BR-1's two conjuncts, BR-15's set equality and the four dispatch sites are byte-stable
  from v0.12. A scoped erratum is a reviewable erratum.
- §I.2's non-negative-integer threshold validation, written for AC-4.4's other two zeros, extends
  to the new zero with no edit — the kind of generality that makes an erratum cheap.

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
