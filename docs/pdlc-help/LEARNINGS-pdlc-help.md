# LEARNINGS: pdlc help

| Field | Detail |
|---|---|
| Feature | `pdlc-help` (M1, queue row 35) |
| Status | Local implementation verified; [PR #87](https://github.com/ohenak/yumo-plugins/pull/87) open; final current-head CI pending |
| Date recorded | 2026-10-14 |
| Harvested from | The operator's `$deliver-feature-chain` invocation for M1; [issue #86 and its decisions](https://github.com/ohenak/yumo-plugins/issues/86); the gatekeeper's recon, red/green checks, Claude review fixes, and [verification record](_evidence/help-verification.md). |
| Measurement | Elapsed time: **UNKNOWN**; model calls: **UNKNOWN**; tokens: **UNKNOWN**; cost: **UNKNOWN**. |

## 1. Non-Convergences

No unresolved requirement or design dispute was recorded. The operator approved the [REQ](REQ-pdlc-help.md) in issue #86 before implementation. Two local evidence gaps were resolved during the run: the first full engine test attempt lacked this worktree's dependencies, and Claude review found missing error-path tests and insufficient output-channel assertions. The final local engine tests passed after those fixes. [PR #87](https://github.com/ohenak/yumo-plugins/pull/87) is open. A later [CI run at `1798afa6e`](https://github.com/ohenak/yumo-plugins/actions/runs/38582490055) failed in workflows unit tests; the next-head CI result is pending.

## 2. Cross-Feature Patterns

- A small CLI help feature still crosses the installed package entry point, launcher, and command dispatcher. Recon identified that `dev` and `queue` can enter version resolution before `main()`; testing only `main()` would miss that path.
- An isolated worktree keeps the dirty source checkout untouched, but it may not contain `node_modules`. State the dependency setup used by a test run and remove temporary links afterward.
- GitHub issue comments can carry an approved decision while the issue remains open. The first comment settled help forms, exit status, and setup; the second settled command-specific syntax and flags; the third signed off the REQ. The issue body alone did not establish approval.

## 3. Rejected Proposals

| Proposal | Disposition |
|---|---|
| Add `-h` or new behavior for mixed/malformed help requests | Outside the approved M1 contract. The implementation and regression tests preserve existing specific usage errors for non-help forms. |
| Treat a successful dry-run as delivery of the whole engine workflow | Rejected as an evidence claim. The 31,821-byte dry-run proved compatibility and no dispatch only. |
| Count Claude review as operator PR or CI approval | Rejected as an evidence claim. Claude ran no-tools document and code reviews; the reported gaps were checked and addressed locally. |

## 4. Process Learnings

The feature followed the chain's red-before-green sequence: six focused help tests failed against the old CLI, then passed after the CLI change. Claude no-tools reviews of the documents and code identified test gaps. The tests were tightened to require stdout usage, empty stderr, strict success status, and specific errors for mixed and unknown forms. Seven focused help tests then passed. The final local engine suite reported 975 tests: 973 passed, 0 failed, 2 skipped. The first full-suite attempt reported 971 passed, 1 failed, 2 skipped because the isolated worktree lacked `node_modules`; a temporary link to the existing checkout's dependencies enabled the green reruns and was removed. The later PR [CI run at `1798afa6e`](https://github.com/ohenak/yumo-plugins/actions/runs/38582490055) passed engine tests, fixture checks, and shell parsing but failed workflows unit tests. The new proposal directories were missing from `NON_FEATURE_DIRS`, and a separate half-cent property assertion failed at `0.0050000000000000044`. Narrow fixes landed in `stats.mjs`, `statsDiscovery.test.js`, and `statsProperties.test.js`; focused local checks passed. See the [verification record](_evidence/help-verification.md) for commands and limits.

## 5. Open Items and Consolidation

1. [PR #87](https://github.com/ohenak/yumo-plugins/pull/87) is open. Its initial head was `8a8f625336be9587c7ca9b154f9f18f27f87c840`; [CI at `1798afa6e`](https://github.com/ohenak/yumo-plugins/actions/runs/38582490055) failed, and follow-up fixes came later. Check the [PR checks page](https://github.com/ohenak/yumo-plugins/pull/87/checks) for the next-head result. Do not report local tests as CI evidence or claim the new CI passed yet.
2. No full `pdlc dev` delivery run was performed for this feature. The engine dry-run was a compatibility check with no dispatch.
3. Elapsed time, model calls, token use, and cost have no recorded measurements; keep them **UNKNOWN** rather than estimate them.

## 6. Approval Record

The operator approved the requirement and M1 build in [issue #86's sign-off comment](https://github.com/ohenak/yumo-plugins/issues/86#issuecomment-6163694833). Claude's no-tools document and code reviews supplied feedback, and the local gatekeeper checked the resulting artifacts and test results. [PR #87](https://github.com/ohenak/yumo-plugins/pull/87) is open. A pull request review, final current-head CI pass, and merge approval are not yet recorded.
