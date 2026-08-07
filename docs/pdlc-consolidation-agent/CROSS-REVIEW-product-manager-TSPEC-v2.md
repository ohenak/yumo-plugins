# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.1)
**Date:** 2026-08-06
**Iteration:** 2
**Scope:** Local (per-finding tags in the table)
**Delta base:** `ccdf799` (the commit carrying my v1 review) → HEAD `ea5be5a`; `git diff` over the document is 594 insertions / 89 deletions across §1.3, §3, §4.1, §5, §6.2, §7.1, §7.3, §7.6, §7.7, §7.9, §8.3, §9.2, §9.3, §10.1, §10.3, §11, §12 and §13. Only changed sections are re-read; unchanged sections approved at v1 are not re-litigated.

## Prior findings — disposition

| v1 ID | Sev | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | §10.1 replaces "unconditionally … there is only one exit" with a three-row guard table and pseudocode. `state.status === "skipped-cadence"` gates **all three** steps — no terminal row, no §9.4 commit, no marker touch — and the section names the single producer (`main()`'s step-4 branch, where `triggerFor` returns it, before `mintPassId` / `takeMarker`), which is what makes the carve-out one early return rather than a threaded condition. It also adds AC-C3's **positive** conjunct (the report body carries the status alone, FSPEC §10.1 row 3), so the branch is not asserted by four absences that a pass which never ran would also satisfy. |
| F-02 | High | **Resolved** | §10.1's second guard row: `state.status !== "refused"` gates the **commit** only, quoting FSPEC §4.3's Commits column and the pathspec-stages-a-whole-file reason. The marker release stays guarded by `state.markerHeld`. §10.1 also states why no fourth guard is needed for the consumed pair — the pair is step 7, downstream of the step-6 refusal, so its absence is structural (AT-M1, AT-M6b). |
| F-03 | High | **Resolved** | §7.6 introduces `routeProposal(proposal)` as the **only** caller of `routeOf`, with the three-row action×landing-site table and the code, and §4.1's call graph now names `routeProposal` with `routeOf` nested beneath it. The table matches REQ AC-5.4 (`REQ-pdlc-consolidation-agent.md:428-433`) clause for clause: a guard-set promotion is retired by a PR; one that landed in `DOMAIN-CONSTRAINTS.md` / `DECISIONS-{topic}.md` diverts to the proposal file and is never applied; a revision routes exactly as that promotion's retirement would. |
| F-04 | High | **Resolved** | §7.9 names `renderPrBody`, `renderProposalFile` and `renderPromotionCommitMessage`; §4.1's graph carries both new write paths; §12.2 adds rows T-11 and T-12; §12.3 assigns AT-Q2 … AT-Q5, AT-Q8 … AT-Q12 to `consolidationRoute.test.js`. The NFR-4 duplicate key is closed by construction rather than by discipline — `PDLC-CONSOLIDATION-PROMOTIONS` is derived from the same `enacted` array the renderer renders sections from — and AT-Q4 pins writer to reader as a round-trip, which is the right shape given `enactedByPr` reads what `renderPrBody` writes. |
| F-05 | Medium | **Resolved** | §12.4 no longer claims full conformance. ER-6 is recorded with the interim value stated (`route: "degraded"` for a proposal-file promotion), the reason it fails safe (`enactedByLog` does not enact on `degraded`, so the item is re-proposed — the right behaviour for something awaiting operator approval), and the residual loss named (a routed propose-only item and a degraded PR attempt read alike; §7.9 item 4's report body is the discriminator). §12.2's T-12 row carries the test. |
| F-06 | Low | **Partially resolved** | The two declarations are now cited correctly — `stripModuleSyntax` is `build-runtime.mjs:45` and `wrapModule` is `:55`, verified at HEAD. But the parenthetical that corrects them is itself off by one on one of the two: it reads "not their doc comments at `:43` / `:54`", and `:43` is a blank line — `stripModuleSyntax`'s doc comment is `:44`. Rolled into F-08 with the other citation drift the revision introduces. |

Questions Q-01, Q-02 and Q-03 are all answered in the document. Q-01: §12.2 row T-12 states AC-3.4's second clause is **vacuous** when the pass enacts everything, and the URL lives in the terminal row's `pr:` field alone. Q-02: §7.7 and §11.5 both carry the standing caution that no AT-A fixture may be written against the REQ's AC-6.3 wording. Q-03: §12.2's unnumbered row gives the dropped-code arm **two** fixtures over one code — one legal pair that appears, one illegal pair that is dropped — with `no-cadence-datum` used as the control that must never drop, so the narrowing is observed against a positive rather than assumed.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
