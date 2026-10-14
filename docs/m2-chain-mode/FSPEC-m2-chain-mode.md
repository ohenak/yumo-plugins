# FSPEC: Opt-in M2 chain mode

The acceptance source is `REQ-m2-chain-mode.md`, as governed by [Yumo issue #89](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6173830868).

| Requirement | Observable behavior |
| --- | --- |
| REQ-CHAIN-01 | Operator invokes `pdlc dev <REQ> --delivery-mode chain --accepted-issue <issue-url>`. This explicit assertion is visible in the report. CLI rejects an absent value or URL outside the feature's repository. No mode means the existing route. |
| REQ-CHAIN-02 | The run checks REQ, seam map, and issue decisions as inputs, then creates missing later artifacts and checks each once in order. A gate rejects missing or empty content, an issue-decisions file without the accepted issue URL, or an FSPEC whose REQ IDs differ from those in the REQ. The run does not prove other artifact semantics or read remote issue comments. GitHub Issues remain the operator's decision record. |
| REQ-CHAIN-03 | Specification gates report `chain-validated` only. Each later artifact gets at most one author pass, no cross-review records, and no claim of reviewer approval. |
| REQ-CHAIN-04 | After green local implementation/tests, one pre-PR DoD verifier checks workflow scope, local suite, and staged-file privacy. It writes a review citing the accepted issue; a missing review or failed verdict halts without remediation. PUB then creates/verifies the PR and current-head CI. The controlled red/repair demonstration is post-PR evidence. The PR stays open; Phase MERGE does not run. |
| REQ-CHAIN-05 | PR evidence includes URL and `headRefOid`. CI is green only if at least one branch `push` run for that exact SHA is returned and every returned matching run is completed with `success`. No run, stale run, or uncertain status halts. |
| REQ-CHAIN-06 | One failed CI result can trigger one repair attempt and a new check. A second failed result or failed repair ends the run with the blocker and both commits recorded. |
| REQ-CHAIN-07 | Success report contains the issue URL, artifact statuses, test/DoD statuses, PR URL, branch-head SHA, Actions run URL/result, and repair count. Halt report contains the gate and reason. |

The accepted issue URL identifies the operator's decision record; the URL alone is not proof of acceptance. The explicit `--delivery-mode chain --accepted-issue` invocation states that the operator accepts this handoff.

## Feature-branch CI prerequisite

Before chain mode creates the PR, the feature branch must contain a tracked GitHub Actions workflow with a `push` trigger that covers that branch. Give the workflow a `name:` so the CI gate can wait for every expected push run on the PR head commit. A workflow restricted to `main`, or triggered only by `pull_request`, cannot supply this gate's current-head evidence. Preflight halts before PR creation if no qualifying workflow is present.
