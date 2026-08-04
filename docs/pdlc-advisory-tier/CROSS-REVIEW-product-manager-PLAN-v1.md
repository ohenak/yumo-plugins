# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.1, 2026-08-03)
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** Local

## Grounding

Every structural claim in this review was checked against the working tree, not against the upstream
documents alone. Branch `feat-pdlc-advisory-tier`, HEAD `e7ffd1d` (the PLAN cites `ca55bb6`; the
thirteen commits since are the PLAN's own authoring commits, and `orchestrate-dev.js`,
`orchestrate-queue.js` and `build-runtime.mjs` are byte-for-byte unchanged at 8,642 / 1,587 / 383
lines — the PLAN's §1 figures).

What was verified, and what it showed:

- **The §2.1 pre-flight claim.** `git merge-base --is-ancestor 26c3f1c HEAD` and
  `… 5d66c48 HEAD` both succeed. The rebase TSPEC §13.6 asks for is genuinely already satisfied.
- **Every §2.2 `BL-PREREQ` symbol and line.** All eighteen resolve at the stated locations:
  `effectiveGuardPaths` (`orchestrate-dev.js:708`), `guardVerdict` (`:731`),
  `parseImplementationConfig` (`:181`), `MERGE_ESCALATIONS` (`:1321`), `MODEL_IMPLEMENTATION`
  (`:1621`), `parsePlanTasks` (`:2039`), `checkPrCi` (`:5927`), `parseDodStatus` (`:6059`),
  `rebaseOntoDefault` (`:6254`), `dodVerifyLoop` (`:6273`), `raisePrAndVerifyCi` (`:6337`),
  `computeTopologicalBatches` (`:6533`), `defaultAppendFile` (`:6805`), `gitWithLockRetry` (`:6862`),
  `commitPaths` (`:6905`), `buildFinalReport` (`:8595`); `parseQueue` (`orchestrate-queue.js:116`),
  `parseTriageVerdict` (`:302`), `precheckDependencies` (`:630`), `triagePrompt` (`:653`),
  `runPicked` (`:961`), `buildQueueReport` (`:1221`). The two "module-private at HEAD" claims are
  correct: `commitPaths` (`:6905`) and `buildFinalReport` (`:8595`) carry no `export`.
- **The §7 integration ranges.** `orchestrate-dev.js:8282-8288` is exactly the rebase-conflict
  `recordPhase` + `throw haltError`; `:8294-8302` is exactly the DoD-not-passed pair; `:6371-6373`
  is exactly `if (status === "failed") { throw haltError(...) }`; `:8342`/`:8348` are the literal
  guard-block test and the `/pdlc guard: refusing to delete CROSS-REVIEW files in \[([^\]]+)\]/`
  extraction; `build-runtime.mjs:87` is the dev export array and `:96-103` the queue prelude;
  `guard-harvest-before-delete.sh:35`, `:43`, `:57-59` are the early-exit test, token regex and
  refusal message.
- **The §5.1 defect the new task A-00 repairs.** `.claude/pdlc.config.json` holds
  `cd pdlc/workflows && npm test -- --testPathIgnorePatterns=documentOracles` verbatim, and
  `pdlc/workflows/package.json`'s `jest` block sets `testPathIgnorePatterns` to
  `["/node_modules/", "/__tests__/helpers/", "/__tests__/fixtures/"]`. The override-replaces-list
  claim is real, and it does bite this feature specifically (A-02 lands a module under
  `__tests__/helpers/`, A-15 a fixture under `__tests__/fixtures/`).
- **The §6.4 coverage claim.** That same `jest` block carries no `collectCoverage`,
  `coverageThreshold` or `coverageProvider` key — the PLAN's "there is no configured coverage gate
  to inherit" is accurate, and the withdrawal recorded in the v1.1 changelog was the right call.
- **The test-suite layout the coverage map assumes.** 69 `*.test.js` files exist under
  `pdlc/workflows/__tests__/`; excluding `documentOracles` leaves 68, exactly the count §5.1 states.
  `helpers/mergeDoubles.js`, `helpers/seams.js`, `helpers/guardFixtures.js` and
  `fixtures/tmpGitFixture.js` — the four shipped assets §6.1/§6.2 compose with rather than
  re-author — all exist.
- **Case-count arithmetic against FSPEC §18.1.** The ten series and the 81 total are FSPEC's own,
  and every per-file split in §8.1 sums to its series count (T-01 2+5=7, T-02 2+4=6, T-03 8+2=10,
  T-08 4+7=11).

Only findings that survived that check appear below.

## Findings

## Questions

## Positive Observations

## Recommendation

