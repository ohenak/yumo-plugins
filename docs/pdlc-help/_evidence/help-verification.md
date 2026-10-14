# M1 `pdlc-help` verification

Recorded 2026-10-14 for [approved REQ](../REQ-pdlc-help.md), [properties](../PROPERTIES-pdlc-help.md), and [PLAN P3](../PLAN-pdlc-help.md). This records local branch evidence and [open PR #87](https://github.com/ohenak/yumo-plugins/pull/87). It does not claim a final current-head CI result or a full PDLC delivery run.

| Check | Observed result |
|---|---|
| Red test before the CLI change | The six focused help tests failed: 0 passed, 6 failed. `pdlc --help` exited 1 with `Unknown command: --help`; `dev --help` reached the unknown-flag path. |
| Focused help tests after the CLI change | The original six focused help tests passed. They exercise both general forms, eight named command forms, repeated-output identity, a clean temporary directory without provider credentials or project setup, no project writes, and launcher bypass of version resolution and dispatch. |
| Focused help tests after Claude review fixes | Seven focused help tests passed, 0 failed. The added test covers mixed and unknown help-shaped inputs; the existing tests now require successful help on stdout with empty stderr and strict launcher exit status 0. |
| Scoped CLI and launcher tests | Both `pdlc/engine/__tests__/cli.test.js` and `pdlc/engine/__tests__/launch-wiring.test.js` passed. Existing non-help unknown-command and invalid-flag cases remained in the scoped run. |
| Full engine suite, first attempt | 971 passed, 1 failed, 2 skipped. The isolated worktree lacked `node_modules`; this was an environment failure, not evidence of a help regression. |
| Full engine suite, first rerun with dependencies available | A temporary symlink to the existing `yumo-plugins` engine `node_modules` made dependencies available. This earlier rerun reported 972 passed, 0 failed, 2 skipped. |
| Full engine suite, final run after test fixes | 975 tests: 973 passed, 0 failed, 2 skipped. This is the final local full-suite result. The temporary dependency symlink was removed afterward. |
| Existing dry-run path | A dry-run emitted 31,821 bytes and performed no dispatch. This checks that the existing inspection path remains reachable; it is not a full workflow delivery. |
| Whitespace and patch shape | `git diff --check` passed. |
| Boundary suite | `tests/boundary/` does not exist in this repository. The help feature adds no cross-product edge, so no boundary-suite result is claimed. |
| Pull request | [PR #87](https://github.com/ohenak/yumo-plugins/pull/87) is open against `main`. Its initial head was `8a8f625336be9587c7ca9b154f9f18f27f87c840`. Document updates can change that head; use the [PR checks page](https://github.com/ohenak/yumo-plugins/pull/87/checks) for the eventual current-head result. No final CI outcome is claimed here. |
| PR CI at `1798afa6e` | [Run 38582490055](https://github.com/ohenak/yumo-plugins/actions/runs/38582490055) failed: engine tests, fixture checks, and shell parsing passed; the workflows unit job failed. One cause was the new `docs/proposal/` and `docs/proposal-data/` directories missing from `NON_FEATURE_DIRS`. Another was an unrelated half-cent property assertion seeing binary floating-point difference `0.0050000000000000044`. This is a historical failed head, not the final PR result. |
| Narrow follow-up and local checks | `pdlc/workflows/lib/stats.mjs` now excludes the two proposal directories; `statsDiscovery.test.js` mirrors the list; `statsProperties.test.js` allows binary representation error at a half-cent boundary. Focused local checks passed. The next-head CI result is pending. |

## Verification commands and context

Run these from `pdlc/engine` in the isolated `m1-pdlc-help` worktree:

```sh
node --test --test-name-pattern='help:' __tests__/cli.test.js __tests__/launch-wiring.test.js
node --test __tests__/cli.test.js __tests__/launch-wiring.test.js
NPM_CONFIG_CACHE=/tmp/yumo-m1-npm-cache npm test
```

The final full-suite run used a temporary link to the existing `yumo-plugins` engine `node_modules`, because this worktree had no local installation. That link was removed after the run. The first full-suite attempt above was made without that dependency link and had one environment failure.

Run this dry-run check from the worktree repository root:

```sh
node pdlc/engine/bin/pdlc.mjs dev docs/pdlc-help/REQ-pdlc-help.md --dry-run --plugin-root pdlc
```

Elapsed time: **UNKNOWN**. Model calls: **UNKNOWN**. Model tokens: **UNKNOWN**. Cost: **UNKNOWN**. No measurement for these fields was recorded in this evidence.

## Requirement coverage and limits

The focused tests cover REQ-HELP-01 and REQ-HELP-02 through the two global forms; REQ-HELP-03 through all eight named commands and their syntax and applicable flags; REQ-HELP-04 through subprocesses in a temporary non-project directory without credentials or project setup; and REQ-HELP-05 through no-dispatch and no-write checks. The existing error tests cover the REQ's non-help preservation statement. See the [properties table](../PROPERTIES-pdlc-help.md) for individual test names.

The full-suite rerun is local evidence only. [PR #87](https://github.com/ohenak/yumo-plugins/pull/87) has a documented failed run at `1798afa6e`; narrow fixes and focused local checks followed it. The next-head CI result is pending. Check the [PR checks page](https://github.com/ohenak/yumo-plugins/pull/87/checks) after the final document commit. No claim is made that the whole PDLC engine delivery workflow completed.
