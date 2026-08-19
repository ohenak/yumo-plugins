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
