# Seam map: current Yumo delivery path

Inspected at the Yumo main baseline used for this worktree. The accepted decision is [issue #89's workflow correction](https://github.com/ohenak/yumo-plugins/issues/89#issuecomment-6173830868).

| Surface | Existing symbol or file | Relevant behavior |
| --- | --- | --- |
| CLI | `pdlc/engine/bin/cli.mjs`: `FLAGS_BY_COMMAND.dev`, `cmdDev` | `dev` accepts a REQ path and existing flags, then calls `deps.runDev` with `reqPath` and `forcePhases`. No chain selector exists. |
| Specification phases | `pdlc/workflows/orchestrate-dev.js`: `main`, `converge`, `reviewLoop` | Phase R always enters `converge`; `converge` calls `reviewLoop` for R/F/T/P. The review window permits five rounds per invocation and fifteen lifetime rounds. |
| Artifact checks | `main`'s `phaseGate`; `checkFileNonEmpty`/injected `_checkFile` | Existing phase gates check review state and files. Chain validation needs its own explicit outcome so it cannot imply review approval. |
| Delivery path | `main`: implementation waves, Phase DOD, Phase H, Phase PUB | Existing implementation, test, DoD, harvest, and PR logic follows specification phases. Keep this path reachable after chain validation. |
| PR and CI | `raisePrAndVerifyCi`, `checkPrCi`, `classifyCheckRollupEntry` | `checkPrCi` reads `statusCheckRollup` only; it does not prove an Actions run's `headSha` equals PR `headRefOid`. `raisePrAndVerifyCi` returns `ciStatus: "no-checks"` after timeout, and `main` records that as success. Chain mode needs the exact pushed branch-head result without changing default behavior. |
| Existing tests | `pdlc/workflows/__tests__/`, `pdlc/engine/__tests__/cli.test.js` | Add focused chain gate, CI, and CLI tests near these seams. |

No Yumo queue row currently names `m2-chain-mode`; issue #89 is the accepted handoff. A queue flip must not be invented for a nonexistent row.
