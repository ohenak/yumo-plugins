# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 8 (delta re-review of PROPERTIES v0.4 → v0.5; frozen round)

## Overview

**What I reviewed.** The delta `a12b20f9..HEAD` on
`PROPERTIES-pdlc-learnings-injection.md` (v0.4 → v0.5, four commits: `21edb7c5`, `91aeb6bb`,
`4cb84db5`, `7ac7fe8b`). Two changed places, and only two: the header's upstream row (PLAN pin
re-worded, version cell 0.4 → 0.5) and §C.4's *Reconciliation* block, which is rewritten wholesale —
the fourteen-row inventory, the "which task ids stand behind them" paragraph, the re-red paragraph,
the P-A-6 spend paragraph, and the closing "no property names a file the PLAN does not create"
paragraph. Nothing else in the document moved: `git diff --stat` shows the PROPERTIES file plus the
two v7 cross-reviews and nothing more. §G.3, all ten property groups, §O.1–§O.9, §F.1–§F.4 and
§C.1–§C.3 are byte-identical to the text I approved against.

**My two v7 findings.**

- **F-01 (High)** — §C.4's stale "seven of fourteen" measurement. **Resolved, and resolved the way
  Q-01 asked.** The table is now declared "a **snapshot, not a live claim**", pinned to commit
  `21edb7c5`, and each row carries the commit that added the file. I re-ran the measurement:
  `git ls-tree -r --name-only 21edb7c5 pdlc/workflows/__tests__` returns all twelve
  `learnings*.test.js` suites, `helpers/learningsFixtures.js` and the four files under
  `fixtures/learnings-baseline/` — fourteen of fourteen, as the table now says. All fourteen
  `Added by` shas check out against `git log --diff-filter=A -1 21edb7c5 -- <path>`: `1920f281`,
  `cdeb1509`, `688a5651`, `07af8f52`, `1544fdbd`, `5e522a52`, `b79b7859`, `4a6c1816`, `2fe07964`,
  `c3e723e5`, `eb32d7d2`, `100e3d9c`, `960c229c`, `4a6c1816` — every one exact, no transposition.
  The three dependent statements are all repaired: the `not yet created` cells are gone;
  `learningsConfig.test.js` is now cited as landed at `eb32d7d2` with its three LI-AT-30 cases at
  `:226`, `:242`, `:258` (verified — the third is the `maxBytesPerDocument: 0` case asserting
  `RSN-NO-MATERIAL` set-equality over non-self paths); and the ledger consequence is re-derived from
  **case B**, correctly, with case A explicitly declared unreachable.
- **F-02 (Low, Process)** — the "re-measured at HEAD" banner applied sentence-by-sentence. Resolved:
  the banner is replaced by a pinned-snapshot framing and the whole paragraph is re-run against one
  commit rather than patched in place.

**What the revision broke.** Nothing load-bearing. Every new factual claim in §C.4 that I could
check against the repository checks out, with three exceptions, all inside the delta and none of them
High: one bookkeeping inconsistency between §C.4 and §G.3 (F-01, Medium) and two overstatements in
the "none of the four is present in the landed suite" enumeration (F-02, F-03, Low) that do not
change the conclusion they support.

**Verification method.** `git diff a12b20f9..HEAD` on the document and `--stat` over `docs/`;
`git ls-tree -r 21edb7c5` and per-file `git log --diff-filter=A`; `git log | grep -oE 'LI-[0-9]+'`
for the task-id universe; `git log -S'/.baseline-worktree/' -- .gitignore` and `sed -n 13p
.gitignore`; direct read of `learningsBlock.test.js` (147 lines, 7,739 bytes) and
`learningsConfig.test.js:220–275`; `grep -n 'P-A-6\|P-A-7'` and the 0.6/0.7 changelog rows of PLAN.

## Properties

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
