# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.3, 2026-08-03)
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** Local

## Grounding

Delta re-review. Base for the diff is `2a290df`, the commit v2 reviewed; the document has moved
through eleven authoring commits to HEAD `7a44317` (+182 / −74 lines). I read the diff, not the
document, and re-executed every mechanical claim the revision newly makes.

What was re-run at HEAD, and what it showed:

- **The manifest-overlap argument holds in code, not just in prose.** `validatePlanContract`
  (`pdlc/workflows/orchestrate-dev.js:2344`) checks only the two bijection directions — task without
  a row, row without a task — and its own doc comment says so explicitly: *"File OVERLAP between rows
  is NOT a problem. Overlap is the normal case in a real PLAN … waves are what separate the writers,
  and rejecting overlap here would reject correct PLANs"* (`:2334-2338`). `pathsCollide` is at
  `:2377` and is what actually separates writers. §4's new preamble cites both correctly.
- **The re-parse figures are real, and I re-derived the wave partition rather than trusting the
  claim.** Against this document at HEAD: `parsePlanTasks` ⇒ **36 tasks**, `parsePlanOwnership` ⇒
  **36 rows**, `validatePlanContract` ⇒ `{"ok":true}`, `computeTopologicalBatches` ⇒ **20 batches**,
  no cycle, and `computeWaves` ⇒ **20 waves** — `[[A-01],[A-02],[A-03…A-07],[A-08…A-12],[A-13…A-15],
  [A-16,A-17,A-28],[A-18],[A-19],[A-20],[A-21],[A-22],[A-23,A-29],[A-24,A-30],[A-25,A-31],[A-26],
  [A-27],[A-32],[A-33],[A-34,A-35],[A-36]]`. That is identical to §5.2's transcription, so no batch
  had to be split by `pathsCollide` — the widened manifest cost nothing and §4.1's "re-executed after
  the v1.3 manifest edit" paragraph is accurate line for line.
- **Every writer of a shared test file lands in a different wave.** `advisoryDriver.test.js` is
  written by A-07 (wave 3), A-22 (11), A-23 (12), A-24 (13), A-31 (14); `advisoryDodSeams.test.js` by
  A-10 (4), A-23 (12), A-25 (14); `advisoryHarvest.test.js` by A-13 (5), A-28 (6), A-27 (16). The
  "one block, one un-skipper, one wave" discipline is now mechanically enforced, exactly as F-08
  asked.
- **The prompt lines the revision reasons from.** `Do NOT run git add or git commit — the
  orchestrator verifies your work and commits it.` is `orchestrate-dev.js:5851`, and the script
  commits once per task at `:8143-8159`, pathspec-scoped to `task.files`. The ownership line is at
  **`:5850`**, not `:5849` (`:5849` is the *"Run only your task's targeted tests — do not run the
  full suite"* line) — a one-line citation slip carried over from my own v2 finding, noted below and
  not worth a finding of its own. F-10 is about `:5849`'s actual content.
- **A-01's fresh-clone branch is grounded.** `.github/workflows/pr-tests.yml:75` is bare
  `run: npm test`, and `parseImplementationConfig`'s `if (text == null) return degraded(false)` at
  `:188` returns exactly `{ config: IMPLEMENTATION_DEFAULTS, sectionMalformed: false, invalidKeys: [] }`
  (`:182-186`), with `IMPLEMENTATION_DEFAULTS.testCommand === null` at `:160-164`. Both cited line
  ranges and the asserted literal are correct.
- **§6.4's arithmetic after the F-09 fix.** The dev-module row lists 22 names, the queue row now
  lists 2 (`hasResidualSeamToken`, `honourA1Verdict`) — 24, matching §9.1's "all 24 enumerated
  function names resolve" unchanged. The denominator and the declared surface now agree.
- **`PLAN_FILES_HEADER_CELLS`** is an exact-cell set at `:2188-2195`, so §4's parenthetical warning
  against re-wording the header cell is correct and worth keeping.

Only findings that survived that check appear below.

## Prior findings — disposition

| v2 ID | Severity | Status | Evidence in v1.3 |
|---|---|---|---|
| F-08 | High | **Resolved, in all three parts.** | (1) §4's manifest gives every 🟢 task the test file it un-skips (A-17…A-33 rows), and §4's opening is restated as "the 🔴 task … remains its only writer of **case bodies**", which is the invariant that matters. (2) §3 step 3 now explains *why* the edit is legal against the runner, and step 4 replaces the two-commit pair with "captures the verbatim failure output and reports it in its task summary … the red evidence is that transcript plus the wave's single script-owned commit"; §9.2's first checkbox is restated identically, including "A green task whose summary contains no captured failure output does not satisfy this row" — so the DoD row is still falsifiable, just against something the runner can produce. (3) The gate was re-run and §4.1 re-transcribed; I re-executed it independently and got the same 36/36/`{"ok":true}`/20 batches/20 waves, with the wave partition unchanged. §9.1's "No task's diff touches a file outside its §4 manifest row" is now satisfiable by construction. |
| F-09 | Low | **Resolved** | §6.4's queue row now reads "`hasResidualSeamToken` and `honourA1Verdict` — **and nothing else**", and the exclusion paragraph explains the mechanical reason (the reducer selects by `fnMap` name match, so a partial function cannot be expressed) and names the behavioural evidence that replaces it (T-04-1, T-04-2, T-04-3, T-04-3b plus the A2 citation-drift obligation, owned by A-12 🔴 / A-29 🟢). The declared surface and the measured surface are the same 24 names. |
| Q-05 | — | **Answered, and the answer became §5.2's new paragraph** | The per-file assertions are now read off a `--json` run rather than the aggregate summary, with the exact fields named (`numPassingTests`/`numFailingTests`/`numPendingTests` per `testFilePath`) and the pass/fail authority left with the script-owned aggregate. The mechanism is right; F-10 below is only about which command produces it. |
| Q-06 | — | **Answered by execution, not by assertion** | §4.1 re-ran `computeWaves` and reports 20 waves identical to §5.2. I re-ran it too and confirm it. |
| Q-07 | — | **Answered and recorded** | §2.4 gains an explicit "*The residual risk the operator accepts by leaving it untracked*" paragraph, and §10.1 item 7 carries it with the failure mode named ("no signal until wave 1 halts") and the recovery. It is now a recorded deferral rather than an implied one. |

## Findings

## Questions

## Positive Observations

## Recommendation
