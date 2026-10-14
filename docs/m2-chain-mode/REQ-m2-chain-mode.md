# REQ: Opt-in M2 chain mode

Source of authority: [Yumo issue #89](https://github.com/ohenak/yumo-plugins/issues/89) and its [workflow correction decision](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6173830868). The accepted issue handoff sets scope. This document specifies the Yumo delivery mechanism; it does not replace that issue as the decision record.

## Purpose

Give a feature with an accepted GitHub Issue handoff a bounded, single-provider route through named SDLC artifacts, implementation, tests, Definition of Done (DoD), one pull request, and a current-head CI result. The route must not restart cross-review rounds that widen accepted scope. Existing `pdlc dev` behavior remains the default.

## Requirements

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| REQ-CHAIN-01 | Paired explicit options select chain mode for one feature and assert acceptance of its GitHub Issue handoff. The URL alone is not acceptance proof. An absent or malformed URL halts before authoring. Default `pdlc dev` remains unchanged. | CLI and direct workflow tests cover opt-in, invalid input, and default parity; report records the acceptance assertion and issue URL. |
| REQ-CHAIN-02 | Chain mode takes the feature REQ, `_evidence/seam-map.md`, and `_evidence/issue-decisions.md` as handoff inputs. It gates those inputs, then creates any missing FSPEC, TSPEC, DECISIONS, PLAN, and PROPERTIES artifacts and gates each once in order. Each file must be readable and nonempty; issue decisions must contain the accepted issue URL; FSPEC must contain exactly the REQ IDs extracted from the REQ. Other artifact content remains the author's responsibility. | A missing or empty file, missing issue URL, or FSPEC REQ-ID mismatch halts at its gate. |
| REQ-CHAIN-03 | Chain mode does not call `reviewLoop`, repeat an author/optimizer cycle, or generate `CROSS-REVIEW-*` files. It reports `chain-validated` for artifact gates, not reviewer approval. | Each later artifact receives at most one author pass, with zero review/optimizer calls; report identifies each `chain-validated` artifact. |
| REQ-CHAIN-04 | After artifact validation, chain mode requires implementation, tests, one pre-PR DoD verdict, harvest, and PR/CI. The DoD verifier reviews local workflow scope, tests, and staged-file privacy; its review file must cite the accepted issue. A failed verdict halts before PR with no remediation loop. PR URL, head CI, and controlled red/repair evidence belong to PUB after PR creation. The verified PR stays open; automatic Phase MERGE does not run. | Focused tests prove one DoD dispatch, review-file and issue citation gates, halt on failed verdict, required PUB, and no MERGE. [DoD/PR decision](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6174183309); [sequencing clarification](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6175299366). |
| REQ-CHAIN-05 | The PR gate reuses one PR and records its URL and `headRefOid`. CI passes only when every returned branch `push` run for that exact SHA is completed with `success`, with at least one returned run. Missing, unknown, stale, failed, or timed-out evidence halts. A `pull_request` synthetic-merge check alone cannot prove the branch head. | Run fixtures cover all returned exact-SHA push runs green, no run, pending, failed, stale head, and query error. |
| REQ-CHAIN-06 | A failed current-head CI result permits one bounded repair push for the same blocker, followed by a fresh current-head CI check. Failed repair or second red result halts. The report links the initial failed result, repair commit, and final result. | Controlled failure/repair test and failed-repair test. |
| REQ-CHAIN-07 | Chain mode emits a machine-readable terminal report naming the issue, artifact gates, implementation/test/DoD result, PR URL, exact branch-head SHA, GitHub Actions run URL and result, and repair count. It never calls a skipped review an approval or a missing run a pass. | Report-schema assertions for success and each halt. |

## Bounds

This feature changes Yumo's opt-in delivery path. It does not change regime-ledger report logic, auto-merge a PR, or copy private account, position, or quote values into artifacts or logs. M2's external experiment and evidence remain tracked in the accepted repository issues.
