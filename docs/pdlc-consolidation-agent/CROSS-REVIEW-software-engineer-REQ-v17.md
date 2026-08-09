# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md
**Date:** 2026-08-09
**Iteration:** 17 (delta confirmation — erratum round v2.2, Phase PR)
**Scope:** Erratum delta only. Two items: AC-6.3 population wording, AC-3.4 second carrier. No re-review of previously approved sections.

## Delta examined

`git diff 809dd114..202441d0 -- docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` — three hunks, all in scope: version row `2.1 → 2.2` plus an erratum note, AC-3.4, AC-6.3. Nothing else in the file changed.

## Erratum 1 — AC-6.3 population (raised by te-author): **Resolved**

The prior text made the two conjuncts range "across the consumed window", which is a filter no conforming implementation applies. The settled contract is BR-37a (`FSPEC:2648`): *"the quantity ranges over the **whole** `ESCALATIONS.md` — no filter on `Feature`, none on date, no relation to the pass's consumed set"*, restated in FSPEC §9.5's conjunct table as "population is the whole file, §9.2".

The new wording is `anywhere in docs/_queue/ESCALATIONS.md` / `anywhere in that same file`, followed by an explicit population sentence that reproduces BR-37a's three negations verbatim. That is set-equal to the FSPEC contract, not merely compatible with it, so the divergence that would have failed a conforming `seamCandidates` is gone.

Two checks that the fix did not buy conformance at the cost of something already approved:

- **The non-emptiness gate survives.** Both conjuncts remain required, and the "first pass on a stock repo cannot propose widening all five `ADVISORY_SEAMS`" argument is untouched. Widening a whole-file population would have been the easy way to lose that gate; it is still there and still load-bearing.
- **AC-6.1 row 3 stays the gate AC-6.3 cites.** AC-6.1 already reads `ESCALATIONS.md` whole-file per `Seam` per `Feature`, with no consumed-set relation anywhere in its three-state table. The old AC-6.3 was the one criterion in REQ-CONS-06 that implied a narrower population than its own gating criterion; after the edit the family is internally consistent.

## Erratum 2 — AC-3.4 second carrier (raised by te-author): **Resolved**

The prior text required the PR URL in both `.consolidation-log.md` and `CONSOLIDATION-PROPOSAL-{passId}.md`. FSPEC §5.3 writes the proposal file *"when, and only when, the pass has something to propose that it does not enact"*, and states that its existence is decided by three causes *"and by nothing else — never by the terminal status"*. An opened PR is enacted, so on AC-3.4's own Given the file does not exist and the second conjunct was vacuously satisfiable — exactly the shape that lets an implementation pass a criterion by doing nothing.

The new text removes the conjunct and, better, says *why* it is removed: it names the three causes (AC-3.5, AC-5.4, AC-6.3) and concludes "on this path no proposal file exists to record into." The reconciliation now lives in REQ, where the tension was raised, rather than in a test that picks a reading — which is what the downstream layers repeatedly declined to do (`PROPERTIES:1861`, TSPEC §12.2 T-12's "vacuous" note, `CROSS-REVIEW-product-manager-TSPEC-v1.md` Q-01). Those downstream readings agree with the direction taken here, so the edit ratifies the layer consensus instead of overturning it.

The append-only half that closed F-43 in an earlier round is preserved intact: the URL is still the `pr:` field of the pass's single terminal row, still not an in-place edit (AC-1.3), still appended once (AC-7.2), and "exactly one report counts reports" survives verbatim. The edit is a deletion of one conjunct plus a justification, not a rewrite of the criterion.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **AC-3.8b's proposal-file cause list is now one short of AC-3.4's.** AC-3.8b enumerates `CONSOLIDATION-PROPOSAL-{passId}.md (AC-3.5, AC-5.4)`; the new AC-3.4 text enumerates the causes as `(AC-3.5, AC-5.4, AC-6.3)`, matching FSPEC §5.3's three rows (row 3 = a widening the consumer must adopt in its own untracked config). The mismatch is cosmetic — AC-3.8b's parenthetical is illustrative of *which artifacts get committed*, not a normative cause list, and the commit mechanics are identical whichever cause wrote the file — but the two lists are now visibly different in one document. Adding `, AC-6.3` to AC-3.8b's parenthetical closes it. Not gating; no behaviour turns on it. | AC-3.8b, AC-3.4, FSPEC §5.3 |
| F-02 | Low | Local | **Downstream standing cautions about AC-6.3 are now stale statements of fact.** TSPEC (`:1328`, `:2382`), PLAN (`:262`, `:616`) and PROPERTIES (`:831`, `:1861`) each carry a caution phrased as *"REQ's AC-6.3 text still says 'across the consumed window'"*, instructing implementers to follow FSPEC §9.5/BR-37a over REQ. As of v2.2 that premise is false — REQ now agrees with FSPEC. The instructions those cautions give remain correct, so nothing mis-implements if they are left alone; the risk is a later reader trusting the caution's premise and re-opening a settled question. This is a downstream-document residue of the erratum wave, not a REQ defect, and belongs to the propagation step for TSPEC/PLAN/PROPERTIES rather than to this confirmation. Recorded here so the wave does not lose it. | TSPEC §11.5, PLAN T18, PROPERTIES §13.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | None. Both errata were self-contained and the delta answers each in the document rather than deferring. |

## Positive Observations

- **The delta is genuinely targeted.** Three hunks, two criteria, one version row, one dated erratum note that names both corrections and asserts "nothing else changed" — and the diff bears that out. No adjacent tidying crept in, which is what makes a one-question delta confirmation cheap to do honestly.
- **Both fixes quote their authority rather than paraphrasing it.** AC-6.3 reproduces BR-37a's three negations; AC-3.4 reproduces FSPEC §5.3's "when, and only when … does not enact" test. A future reader can check conformance without holding both documents open, and a future edit to either side will produce a visible textual divergence rather than a silent semantic one.
- **AC-3.4 states the negative explicitly.** "It is **not** also recorded in … : that file is written when, and only when …" is stronger than simply deleting the conjunct. Silent deletion would have left the next reviewer to wonder whether the second carrier was dropped deliberately or lost in an edit; the explicit negative plus reasoning forecloses the re-litigation.
- **The erratum-round header is accumulating a usable changelog.** v2.1's three corrections and v2.2's two now sit adjacent at the top of the document with phase and date. That is the artifact a harvest pass wants and it cost nothing to maintain.

## Recommendation

**Approved with minor changes**

The delta resolves both errata against their cited authorities and breaks nothing previously approved. The two Low findings are non-gating: F-01 is a one-token citation tidy inside REQ, F-02 belongs to the downstream leg of the same erratum wave. My prior approval of REQ stands, extended to v2.2.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
