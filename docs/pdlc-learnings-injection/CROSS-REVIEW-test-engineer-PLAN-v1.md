# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.1)
**Date:** 2026-08-20
**Iteration:** 1

## Verification performed at HEAD

Every claim below was re-measured on `feat-pdlc-learnings-injection`, not read off the document.

| PLAN claim | Result |
|---|---|
| `MERGE_CONFIG_PATH` `:48`, `parseAdvisoryConfig` `:1964`, `reviewLoop` `:7266`, `dispatchAndVerify` `:8862`, `main` `:12022`, `buildFinalReport` `:15240`; 15,311 lines | **all six exact**, line count exact |
| `consolidate-learnings.js` `LS_FILES_ARGV` `:1338`, `enumerateCorpus` `:1349` | exact; `enumerateCorpus` is `export async function`, `LS_FILES_ARGV` module-private |
| `helpers/seams.js` `fakeFs` `:245`, `fakeGit` `:413`; `helpers/consolidationDoubles.js` re-export `:35` | exact |
| every `learnings*.test.js`, `helpers/learningsFixtures.js`, `fixtures/learnings-baseline/` is new | confirmed absent under `pdlc/workflows/__tests__/` |
| repo root has no `scripts/`; `.gitignore` is 599 B; `git check-ignore -v .baseline-worktree` exits non-zero | all three confirmed (exit 1) |
| `buildFinalReport` already takes `notices = []`; `...(advisory ? { advisory } : {})` precedent | both confirmed (`orchestrate-dev.js:15259`, `:15309`) |
| `advisoryDisabled.test.js` uses `import mainDev, * as dev from "../orchestrate-dev.js"` | exact, at `:70` |
| `documentOracles.test.js` carries a prior feature's `AT-22`/`AT-23` names — the namespacing premise | exact, at `:75` and `:79` |
| arrangement's `testCommand` / `postWaveCommand` / `postWavePathspecs` | exact, `.claude/pdlc.config.example.json` |
| baseline: `1 failed, 98 passed, 99 total` / `2 failed, 70 skipped, 3851 passed, 3923 total` | **reproduced exactly** (26.4 s); both failures are the two named `documentOracles` tests |
| `pdlc/engine`: `pass 841 / fail 3` | **reproduced exactly** |
| P-2a's four `dispatchKind: "authoring"` sites | four exist, but see F-12 — only three are `dispatchKind:` key sites (`:12861`, `:12955`, `:13657`); the fourth is a positional `"authoring"` at `:7663` |

The measured-baseline section is the strongest part of this document: it is the rare PLAN whose
numbers reproduce to the digit, including the engine failures that block the gate before this
feature's suites ever run.

## Findings

<!-- pending -->

## Questions

<!-- pending -->

## Positive Observations

<!-- pending -->

## Recommendation

<!-- pending -->
