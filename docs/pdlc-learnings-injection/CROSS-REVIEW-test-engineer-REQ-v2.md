# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.2)
**Date:** 2026-08-18
**Iteration:** 2

Delta re-review against `CROSS-REVIEW-test-engineer-REQ-v1.md` and `git diff 27d7f006..HEAD` on the
REQ. Sections unchanged since v1 are not re-litigated. All HEAD claims cited below were re-checked
against the tree, not inferred.

## Resolution of v1 findings

| v1 ID | Sev | Status | Evidence in v0.2 |
|---|---|---|---|
| F-01 | High | **Resolved** | C-1 is now a rule over the existing `dispatchKind: "authoring"` taxonomy and states Phase R has no creator; AC-1.1 explicitly disowns the count of six. Taxonomy claim re-verified: `orchestrate-dev.js:13515` (creator), `:7657-7660` (optimizer, shares author session), `:12821`/`:12915` (erratum and land-proof retry) all tag `authoring`; `PHASE_DISPATCH.R.creator` is still `null` (`:3629`). |
| F-02 | High | **Resolved** | C-1 now names optimizer and erratum dispatches in scope and the conditional DECISIONS phase out of the hand-counted set; AC-1.2's oracle is a set equality over the pipeline's own classification "evaluated against the run that happened", which is falsifiable on a run with no DECISIONS phase and on a run with five optimizer rounds. |
| F-03 | High | **Resolved** | AC-3.4 no longer asks any author to emit anything; the negative conjunct is paired with the AC-3.1 rows as the operator trace, and O-3 owns the observation. G-5/NG-3 are no longer contradicted. |
| F-04 | High | **Resolved** | AC-2.3 now requires the per-document bounded flag, AC-3.1's closed enumeration carries it, and AC-3.2's reason set gained `RSN-TRUNCATED` and `RSN-UNLISTABLE`. A set-equality completeness test over AC-3.1 and AC-3.2 no longer falsifies AC-2.3. |
| F-05 | High | **Resolved** | §7.1 pastes the DC-09 stopping rule into the document, including the fixed-point rule and the same-clause split rule. |
| F-06 | Med | **Resolved** | AC-4.3 is restated as "no injection-derived value reaches any gate input", naming verdict parsing, completeness scoring, round-window arithmetic, approval anchors and erratum routing, and says why the verdict-comparison form was vacuous. |
| F-07 | Med | **Resolved** | AC-2.2 now fixes a total tiebreak (byte order over document path) and two invariants testable today (mtime permutation, directory rename). Tiebreak claim checked: `LS_FILES_ARGV` (`pdlc/workflows/consolidate-learnings.js:1337-1345`) and a scratch-repo run of that argv both return path-byte order across mixed cached/untracked entries. |
| F-08 | Med | **Resolved** | Truncation is now a first-class state in C-7, AC-4.2 and `RSN-TRUNCATED`. |
| F-09 | Low | **Resolved** | AC-5.1a asserts "the run's recorded count of corpus reads is zero", an observable, and leaves the recording seam to TSPEC. |

All five v1 blockers are closed, and none of the closures introduced a High. Citations added this
round were checked for authority existence: `DEC-CONS-05` exists
(`docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:422`), `D-CONS-02`
exists (`docs/completed/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md:690`), and the
fail-open-on-unlistable behaviour C-3 attributes to shipped code is real
(`consolidate-learnings.js:1347-1354`, `{unlistable: true}`).

## Findings (new, scoped to sections changed this round)

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-10 | Medium | Local | **`RSN-UNLISTABLE` cannot occupy a row in the table AC-3.2 defines, so the set-equality test over the id set is underdetermined.** AC-3.2's shape is "names the corpus documents **not** selected, each with a reason drawn from a closed set"; six of the seven ids are per-document facts, but `RSN-UNLISTABLE` is precisely the state in which no document can be named — `enumerateCorpus` returns `{unlistable: true, detail}` with no file list at all (`pdlc/workflows/consolidate-learnings.js:1347-1354`), and AC-4.2 reinforces it ("for a failed listing, nothing is injected") while still calling the listing an "affected source ... skipped with its AC-3.2 reason id recorded". A completeness test asserting set equality over the seven ids must construct one fixture per id; for `RSN-UNLISTABLE` there is no row to construct, and the REQ does not say whether the id appears as a run-level report field instead. Fix inside REQ altitude without implementation detail: state that the reason ids are asserted set-equal over the report as a whole, and that `RSN-UNLISTABLE` is recorded as a dispatch-level (not document-level) entry. | AC-3.2, AC-4.2, C-9 |
| F-11 | Medium | Local | **AC-3.1's closure and AC-3.3's hand-reproduction obligation pull in opposite directions for the same report object.** AC-3.1 declares its per-authoring-dispatch enumeration closed — paths in order, bytes per document, bounded flag, total bytes — "a completeness test asserts set equality". AC-3.3 requires "every input the rule used is present in the report" so an operator can reproduce selection by hand; the inputs the rule uses include the ordering key value per document and the three §4.1 thresholds in force, none of which are members of AC-3.1's closed set. An implementation that adds them fails AC-3.1's set-equality test; one that omits them fails AC-3.3's reproduction. This is the same shape as v1 F-04 on a different pair, so it is worth closing explicitly rather than by reading: say that AC-3.1's closure is over the per-dispatch row fields and that AC-3.3's inputs are a separate run-level record, or add them to the enumeration and re-close it. | AC-3.1, AC-3.3 |
| F-12 | Medium | Cross-Feature | **C-3/O-7 ask for the shape DEC-CONS-05 considered and rejected, and cite DEC-CONS-05 as the authority for it.** C-3 is titled "One corpus definition, shared with consolidation" and O-7 asks to bind the definition "as a single shared definition rather than a second implementation of the same rule", citing DEC-CONS-05. That decision ships "**one predicate, two enumerations**" and lists "One shared implementation" under *Alternatives considered — rejected*, and separately rejects "assert enumeration set-equality" as "**red on correct code**" (`docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:422-470`). The testing consequence is concrete: O-7's optional "shared test asserts the two agree" is exactly the oracle DEC-CONS-05 predicts red, unless the REQ says *which two* readers are held equal. The JS pass and this feature (both plain-Node, both able to reuse `LS_FILES_ARGV`) can be held byte-equal; the Python `SessionStart` hook cannot, and that asymmetry is the whole content of the decision. State in C-3 that the shared definition is scoped to the JS-side readers and that the hook remains pinned literally per DEC-CONS-05, so a downstream test author does not derive a three-way equality oracle from this REQ. | C-3, O-7, §1.2 claim 2 |
| F-13 | Low | Local | **AC-1.2's byte-identity conjunct is only realisable under AC-6.1's fixture harness, and does not say so.** "every dispatch outside it ... is byte-identical to the same run with injection disabled" compares two runs; on a live run the authored documents themselves differ (that is the feature), so review, implementation and DoD dispatch prompts that quote or derive from document state are not comparable, and a red result would be feature-working rather than defect. Under AC-6.1's scripted fixtures the comparison is exact and falsifiable. AC-4.3 already states this scoping argument for verdict comparison; AC-1.2 should inherit the same sentence. | AC-1.2, AC-4.3, AC-6.1 |
