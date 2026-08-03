# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** Delta re-review. Prior review: `CROSS-REVIEW-test-engineer-TSPEC-v2.md` (iteration 2, at TSPEC state `590f12d`). Changed sections diffed `590f12d..HEAD` (commits `3701694`, `18f531b`, `dd46b66`). Only §1.1, §7.4, §11.2, and §14's file-table row changed; all other sections are byte-identical to the v2 state I already approved and were not re-reviewed. Provenance claims re-verified against the repo at branch HEAD.

## Prior-finding disposition

| Prior ID | Status | Evidence |
|----------|--------|----------|
| F-05 (Medium) — D-6 baseline rewrite premised on a false `raisePrAndVerifyCi` provenance claim | **Resolved** | The author took option (b): §11.2 restores the D-6 baseline to REQ's pin `26c3f1c`, deletes the "pre-feature branch tip" rewrite, and **withdraws** the `> Upstream note (routed as an erratum)` entirely (no residual erratum, `grep` confirms). The fixture is renamed `created-files-26c3f1c.json` in both §11.2 and the §14 file table. §1.1's false "`26c3f1c` predates `raisePrAndVerifyCi`" sentence is replaced with the correct, now-verified statement. Every claim checks out against the repo: `git merge-base --is-ancestor 4d5e4dc 26c3f1c` ⇒ **true**; `raisePrAndVerifyCi` is **defined** at `26c3f1c:6222`; `git grep -c 'raisePrAndVerifyCi' 26c3f1c` ⇒ **4**; `26c3f1c` is an ancestor of HEAD ⇒ **true**. The one transcribed fixture in the feature now rests on a rationale a test author can confirm. |
| F-06 (Low) — T-06-8's "routes to escalation end-to-end" overstated | **Resolved** | §7.4 now scopes T-06-8 to the **phase wiring** (a scripted `escalated` disposition threading through the Phase DOD body to the report and the pre-existing `haltError`) and attributes the `testCommand: null → revert+escalate` routing proof to the **Seam-unit** test (§13.2, E-24 → §7.4), where the real `verifyGate` sees `testCommand: null`. The two-test decomposition is exactly the fix requested; the routing-branch rule remains satisfied by the suite. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No open findings. | — |

## Questions

None. (v2 Q-01 is closed: no postdating file-creating path was needed — `26c3f1c` is confirmed an adequate D-6 baseline, and the rewrite/erratum were dropped as the alternative branch of that question anticipated.)

## Positive Observations

- The revision resolves F-05 the honest way: rather than manufacturing a postdating path to defend the pre-feature-tip baseline, the author confirmed `26c3f1c` already carries every file-creating pipeline path and restored it — removing the sole transcribed-fixture's dependence on a provenance claim, and withdrawing (not merely re-routing) the erratum that was premised on the same false claim.
- §1.1 now explains the two-pin distinction correctly and minimally: the pins differ only because source *line numbers* churn between `26c3f1c` and HEAD, while every named symbol resolves at both commits — a claim I verified by count and by definition-line, no longer a provenance error.
- §7.4's split cleanly separates the falsifiable routing oracle (seam-unit, real `verifyGate` over `testCommand: null`) from the phase-wiring assertion (T-06-8 over a scripted disposition), so neither test claims to prove what its fake structurally cannot.

## Recommendation

**Approved**

Both open v2 findings (F-05 Medium, F-06 Low) are resolved, and the changed sections introduce no new issues — every provenance claim they add is verified true against the repo. No unchanged section is re-litigated.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
