# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 1
**Scope:** Local (with one TSPEC erratum raised separately)

## Method

Every file the task table names was resolved on disk, and every `file:line` citation in §1, §3, §6.1
and §7 was read at HEAD rather than trusted. The batch column was re-derived from the `Deps` cells
for all 34 rows. The two coverage claims §1 declares "checked against the current suite layout" were
re-measured, and the FSPEC §13 acceptance-test register was diffed against TSPEC §12.3 and against
the PLAN's own task cells.

**What verified clean.** All of these are correct as written and are not re-listed below:
`orchestrate-dev.js` `MERGE_GUARD_DEFAULTS:48`, `mergeCommandFor:319` (throw at `:350`, audit comment
at `:273`), `ADVISORY_RUNG_SKILL:1797`, `resolveAdvisoryRung:1833` (doc comment `:1800`, shipped call
site `:3132`), `gitWithLockRetry:8617` (`async function`, **not** exported — the PLAN's one
known-absent BL-PREREQ is real), `commitPaths:8669` with its unscoped `git commit -m` at `:8690`, the
wave gate at `:10136`/`:10151`/`:10225`; `runtime-adapter.js` `rtReadProbe:369` (cwd instruction
`:374`), `rtReadFile:493`, `rtShellQuote:668`, `rtWriteFile:802` with `relative to the repository
root` at `:805`, `rtCheckFile:817` (`test -s` at `:823`), `rtAppendFile:863`, `rtListFiles:905`
(`:915`, `:929`), `rtGit:945`, `rtRunCommand:1034`, `rtDevInjections:1086`; `build-runtime.mjs`
`stripModuleSyntax:45`, `wrapModule:55`, the three `readFileSync` reads at `:83-85`, the queue prelude
at `:113-123`, `QUEUE_META:127`, `QUEUE_ENTRY:185`, `bundles:448`; `runtimeBundle.test.js`
`BUNDLES:26`, `AT19_SEAM_NAMES:215` consumed at `:427`, `RLH-SCAN-01:626`, `AWAIT_SCAN_SOURCES:1040`
consumed at `:1054`; every shipped double placement (`seams.js` `LIST_FAILURE_VALUES:58`,
`fakeListFiles:132`, `fakeFs:243`, `file_empty` at `:296-299`, `fakeGit:389`; `mergeDoubles.js`
`matchKey:45`, `fakeGhRun:75`, `passingGh:163`, `GH_SURFACE_NAMES:181`, `FIXED_NOW_MS:256`,
`fakeNow:259`; `advisoryDoubles.js` `makeAgentDouble:53`; `driftGenerators.js` `seeded:76`,
`resolveSeed:134`); `package.json:18-21`'s `testPathIgnorePatterns`; `skillFiles.test.js:13-17`'s
hard-coded three-member list (so §9.1 erratum 1 is correct); every one of the ten
`nudge-consolidation.sh` citations (`:13-20`, `:25`, `:26`, `:28`, `:29-30`, `:41`, `:43`, `:47-48`);
`orchestrate-queue.js` `NOTHING_TO_COMMIT_RE:1554`, `commitQueueRow:1576`,
`commitAdvisoryRecord:1615`; `consolidate-learnings/SKILL.md:35` and `:41`;
`harvest-learnings/SKILL.md:70-78` with `Harvested from` at `:77`;
`pdlc-consolidation-vocabularies.md:7` reading `1.4 · 2026-08-06`;
`docs/pdlc-advisory-tier/PLAN-…:207-216`'s skip-discipline precedent; `.claude` untracked
(`git ls-files .claude` is empty). The batch arithmetic re-derives with **zero** mismatches across all
34 rows, and no two same-batch tasks share a manifest file. Nothing marked **(new)** exists; every
file not marked **(new)** does.

## Findings

## Questions

## Positive Observations

## Recommendation
