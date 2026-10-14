# TSPEC: Opt-in M2 chain mode

## Entry and isolation

Extend `FLAGS_BY_COMMAND.dev` and `cmdDev` in `pdlc/engine/bin/cli.mjs` with `--delivery-mode chain --accepted-issue <URL>`, then pass both values into `pdlc/workflows/orchestrate-dev.js` `main`. Keep the no-option call path unchanged. The paired flags are the operator's explicit acceptance assertion; record them and cite the issue in the report. The current gate checks GitHub issue URL syntax; it does not fetch the issue or verify its repository. The operator must review the issue decision record before invocation.

## Artifact gates

In chain mode, check handoff inputs REQ, `_evidence/seam-map.md`, and `_evidence/issue-decisions.md` first. Dispatch one author pass only when a later artifact is missing: FSPEC; TSPEC and DECISIONS; PLAN; PROPERTIES. Check each artifact before the next phase. `validateChainArtifact` rejects unreadable or empty content, requires the accepted issue URL in `issue-decisions.md`, and compares all REQ IDs extracted from REQ with FSPEC. It does not check feature names, PROPERTIES traces, TSPEC/PLAN ownership, or substantive agreement with the issue. Record `chain-validated`, never `approved`; do not call `reviewLoop` or optimizer dispatch. Reuse downstream implementation, DoD, harvest, and PR stages after the gates.

## CI and repair

The chain-specific observer queries PR `headRefOid` and `gh run list --commit <SHA> --event push --limit 100`. The regime-ledger workflow must trigger on branch `push` as well as `pull_request`, because a `pull_request` run may use a synthetic merge commit. From returned runs, consider only `event: push` with `headSha` equal to the PR branch head. Pass requires at least one such run and every returned matching run completed with `conclusion: success`; pending, failed, empty, or unknown results cannot pass. This is a gate over returned runs, not an inventory of every configured workflow. On red CI, allow at most one repair dispatch and push, then query the new PR head and matching runs. Report run URLs and repair commit. Keep default `raisePrAndVerifyCi` semantics. Source: [Yumo #89 exact-head decision](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6173951462).

## Tests and reports

Use injected `gh`, agent, clock, and file probes in `pdlc/workflows/__tests__/` to test input gates, one author pass per later artifact, zero review dispatch, downstream reachability, exact `headRefOid`/`headSha` matching, no-run halt, one repair, and second-red halt. Add CLI parsing/default parity tests in `pdlc/engine/__tests__/cli.test.js`. Extend the terminal report with chain evidence only for opted-in runs, preserving default report shape.

Do not log account, position, or quote payloads. The consumer experiment is linked by issue/PR/commit/test/check URLs and redacted gate outcomes only.

Chain mode requires Phase DOD and Phase PUB regardless of normal optional toggles. `chainDodVerifyPrompt` asks one verifier to check accepted workflow scope, run the relevant local suite, record command/result/count, and check staged files for private data; PR URL, head CI, and controlled red/repair evidence are deferred to PUB. `dodVerifyLoop` in chain mode makes one dispatch, requires a nonempty `CODE_REVIEW-{feature}-v{N}.md` containing the accepted issue URL, and accepts only `DOD_STATUS: passed`; any other result halts without remediation. The code gates the review artifact and verdict, while the verifier supplies the substantive findings. After exact-head CI, return PR evidence and stop before MERGE. Source: [Yumo #89 DoD/PR decision](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6174183309) and [sequencing clarification](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6175299366).
