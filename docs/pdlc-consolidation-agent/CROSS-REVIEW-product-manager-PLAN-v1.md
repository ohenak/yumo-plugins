# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 1
**Scope:** product fidelity of the PLAN against `REQ-pdlc-consolidation-agent` and
`FSPEC-pdlc-consolidation-agent` v11.3 — acceptance-criterion coverage, scope compliance,
and the accuracy of every claim the PLAN makes about the repository at HEAD.

## 1. What was verified, and how

This PLAN stakes its credibility on measurement: §1 opens **"Verified against HEAD before this
PLAN was written"**, §3 tabulates BL-PREREQs with line numbers, §6 claims the Phase-P gate
functions were run over the document, and §9.1 raises three upstream errata each "measured how".
A hostile reviewer's obligation is therefore not to read those claims but to re-run them. Every
citation below was independently re-measured on the working tree at
`feat-pdlc-consolidation-agent`.

**Re-measured and confirmed exact** (no finding):

| Claim | Re-measured |
|---|---|
| `resolveAdvisoryRung` `:1833` exported, `MERGE_GUARD_DEFAULTS` `:48`, `mergeCommandFor` `:319`, `ADVISORY_RUNG_SKILL` `:1797`, `commitPaths` `:8669` | `orchestrate-dev.js` — all exact |
| `gitWithLockRetry` `:8617` declared `async function` and **not** exported | exact; the PLAN's one known-absent BL-PREREQ is real, and T11 schedules it |
| `rtShellQuote:668`, `rtWriteFile:802`, `rtCheckFile:817`, `rtAppendFile:863`, `rtListFiles:905`, `rtGit:945`, `rtDevInjections:1086`, `rtReadProbe:369`, `rtReadFile:493`, `rtRunCommand:1034` | `runtime-adapter.js` — all exact |
| `"relative to the repository root"` occurs **exactly once**, at `runtime-adapter.js:805` | exact — T03's uniqueness conjunct is well founded |
| `stripModuleSyntax:45`, `wrapModule:55`, `QUEUE_META:127`, `QUEUE_ENTRY:185`, `bundles:448` | `build-runtime.mjs` — all exact |
| `AT19_SEAM_NAMES:215` (consumed `:427`), `AWAIT_SCAN_SOURCES:1040` (consumed `:1054`), `RLH-SCAN-01:626` | `__tests__/runtimeBundle.test.js` — all exact; neither set carries `consolidate-learnings.js`, `_envPresent` or `_makeTempDir` today |
| §9.1 erratum 2: `BUNDLES` at `runtimeBundle.test.js:26`, consumed at `:503`, `:509`, `:549`, `:1044`, `:1290`, `:1584` | **all six exact.** `:1584` reads `const ARTIFACTS = [...BUNDLES, "pdlc-cli.mjs"]` — the erratum is real and correctly measured |
| §9.1 erratum 3: `CLAUDE.md:58-60` names three artifacts and `:62` closes "Those three are the tracked, shipped outputs" | exact |
| §9.1 erratum 1: `__tests__/skillFiles.test.js:13-17` hard-codes `se-review`/`te-review`/`pm-review` and asserts VERDICT-trailer text only | exact — the two `SKILL.md` edits genuinely have no oracle |
| Hook landing sites: `PY_BIN` probe `:13-20`, `THRESHOLD = 5` `:25`, `CLAUDE_PROJECT_DIR` `:26`, glob `:28`, early `sys.exit(0)` `:29-30`, predicate `:41`, `n >= THRESHOLD` `:43`, output `:47-48` | `nudge-consolidation.sh` — all exact, including the probe's silent `exit 0` |
| T07/T08 landing sites: `consolidate-learnings/SKILL.md:35` (Date Completed boundary), `:41` (`DECISIONS-{topic}.md` route); `harvest-learnings/SKILL.md:77` (`Harvested from`) inside the `:70-78` table | all exact |
| §2's wave-gate citation `orchestrate-dev.js:10136-10143`, the V-wave repeat at `:10225-10234`, the pathspec-scoped stage at `:10151` | exact |
| `.claude/pdlc.config.json` is untracked (`git ls-files .claude` empty) and carries the three `implementation.*` keys T00 asserts | exact — the branch-on-presence gate is justified, not defensive padding |
| Shipped doubles: `seams.js` `fakeFs:243`, `fakeListFiles:132`, `fakeGit:389`, `LIST_FAILURE_VALUES:58`; `mergeDoubles.js` `matchKey:45`, `fakeGhRun:75`, `passingGh:163`, `GH_SURFACE_NAMES:181`, `FIXED_NOW_MS:256`, `fakeNow:259`; `advisoryDoubles.js` `makeAgentDouble:53`; `driftGenerators.js` `seeded:76`, `resolveSeed:134` | all exact |
| `docs/_constraints/pdlc-consolidation-vocabularies.md` `Version` cell reads `1.4 · 2026-08-06` at `:7` | exact |
| `.gitignore`'s trailing `/.claude/workflows/` entry and its anchoring comment block | present; T10's gitignore(5) reasoning is correct |
| `pdlc/workflows/consolidate-learnings.js` and `__tests__/helpers/consolidationDoubles.js` do not exist | correct — both are declared **(new)** by T02 and T01 |

That is an unusually high hit rate and it is worth saying plainly. The findings below are the
places where re-measurement **disagreed** with the document.

## 2. Findings

## 3. Questions

## 4. Positive Observations

## 5. Errata raised against upstream documents

## Verdict
