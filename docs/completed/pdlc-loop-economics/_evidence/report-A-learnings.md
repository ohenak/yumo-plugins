# Agent A — un-consolidated LEARNINGS distillation (yumo-plugins corpus, 6 files post 2026-08-19 boundary)

## Iteration/cost table
| Feature | Rounds | Waste signal |
|---|---|---|
| pdlc-advisory-wave-gate | REQ 8, FSPEC 7, TSPEC 12, DECISIONS 11, PLAN 12, PROPERTIES 6, REVIEW 2, DoD 3 | 2 REVIEW-CAP halts (T,D) + 1 erratum halt; DECISIONS sizing block: 5 consecutive rounds each closed one High and opened a new High in the same paragraph; 44/116 findings tagged Process |
| pdlc-learnings-injection | REQ 12, FSPEC 15, TSPEC 15, PLAN 15, PROPERTIES 15, DECISIONS 9, DoD 2 | 4 of 6 docs pinned at the 15-round cap; 3 erratum halts all on delta-confirmation channel (first two the SAME failure two phases apart); zero FINDING: lines across 6 consecutive approving rounds (silent conformance decay); DoD clean in 2 (contrast) |
| pdlc-wave-resume | REQ 6, FSPEC 5, TSPEC 7, DECISIONS 5, PLAN 7, PROPERTIES 6, DoD 3 | 1 halt = routing failure: cascade rounds record findings that mint no erratum item; 2 of PLAN/TSPEC's 7 rounds were confirmations where document bytes never moved; 2 cross-reviews ended with no verdict |
| pdlc-engineering-loop | REQ 14, FSPEC 15, TSPEC 15, PLAN 15, PROPERTIES 12, DECISIONS 12, CR 3, IMPL 10 waves, DoD 5 (v1–v4 FAILED) | 172 cross-reviews; 4/6 docs at 15-cap; 114 verdicts were APPROVING yet loop ran to ceiling; stale dispatch-hash defect re-filed as Low in 54 separate reviews, zero edits owed; process artifacts 3.45MB vs specs 617KB = 5.6×; single cross-reviews (20–37KB) exceed the doc under review |
| pdlc-review-convergence (discarded) | REQ 9, everything else 0 | REQ grew 1,000→2,629 lines/311KB; round 3 dispatched over a byte-identical document; 18 cross-reviews ≈530KB |
| pdlc-rcv-budget-stop (discarded) | REQ 5+4, FSPEC 4, TSPEC 1 | 61KB REQ at 99.8% of ceiling for a change implementing one constant + ~4 pure functions; operator refused a 6th round (no blocking finding since round 2) |

## Cross-feature patterns (gatekeeper disposition)
- A. Erratum/cascade channel structurally too narrow for work routed into it (4/6 files) — ADOPT: cascade findings must mint erratum items mechanically; channel budget scales with routed-change size. No DC covers.
- B. Partial re-grounding worse than none (4/6 files) — ADOPT: re-ground the FULL named upstream interval/commit, enumerate absorptions/withdrawals before editing.
- C. The round cap is doing the converging, not the reviewers (5/6 files) — ADOPT: derivative stop rule (no new ≥Medium finding for N consecutive rounds ⇒ converged), nominated independently by wave-resume O-5 and engineering-loop P-2.
- D-narrow. Byte-identical finding text across both reviewer lenses = generator signature, not independent agreement (engineering-loop Phase PR) — ADOPT (append to DECISIONS-test-oracle-mechanics).
- E. Restated literal counts drift — SUPPRESSED (DC-18). F. Mutation-verification DoD floor — SUPPRESSED (DC-06). G. Scope-tag under-use — constraint SUPPRESSED (DC-13) but the fail-closed Scope-gate MECHANISM is un-promoted → proposal row. H. Shared operator surfaces (OPERATIONS/README/CLAUDE/plugin.json) mis-tagged Local → dod-verify defaults them Cross-Feature → proposal row. I. Unbound deferrals — SUPPRESSED (DC-08).

## Efficiency findings (form-not-substance burn)
- Wrong completeness-gate template checked for 7 consecutive rounds (advisory-wave-gate) — dispatcher wiring bug.
- One `Scope` column serving two axes cost 2–3 halts (learnings-injection).
- Pacing obligation without a literal `##` heading decayed from 3–5 FINDING lines/round to zero over 6 rounds.
- 54 identical Low re-filings on stale dispatch hash — largest single token-burn on staleness, zero substance.
- Round-3 zero-delta dispatch (review-convergence) — 100% waste, since mechanized (AC-2.8 DOC-SHA256 guard).
- 8 findings in one erratum round from hand-copied version pins instead of hash-derived citation (wave-resume).
