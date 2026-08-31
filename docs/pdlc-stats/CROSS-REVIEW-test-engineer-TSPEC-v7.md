# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.5)
**Date:** 2026-08-31
**Iteration:** 7 (erratum round 5 — delta confirmation)
**Prior round:** `CROSS-REVIEW-test-engineer-TSPEC-v6.md` (Approved, v1.4 @ `c61ed537c`)

## Overview

The dispatched erratum item was that §2.1 and §8/RK-1 still listed **five** in-repo co-change sites
while `DEC-STATS-01`'s `K-1` derived more, and that `K-7`'s two sibling-feature document edits
appeared in no site list.

**The item is landed, and it was landed correctly.** I verified this against the body rather than
against the changelog's assertion of it. §2.1's table carries ten in-repo rows — `prepack.mjs`,
`publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`, `package.json`,
`loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`,
`learningsPremises.test.js`, `README.md` — and two further rows (§2.1:215, :216) name the sibling
edits explicitly: `docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-26` and that feature's
FSPEC §5.2 per-class count five → six, both tagged `K-7`-owned and both placed **outside** the ten.
§1, §6.4, §7.3 and RK-1 all carry `ten`. `DECISIONS-pdlc-stats.md` is itself now at ten (`:33`,
`:249`, `:294`), so the dispatch's own premise that `K-1` "derives nine" is the stale number here —
the TSPEC agrees with the current DECISIONS, not with the dispatch's summary of it.

The four wording corrections (§1's "including" → "and", RK-1's matching mis-scoping, §6.4's
"script-side" → "the four enumerations `assertAdditiveOnly` reads", §2.1's verbatim P-1 title) are
scoping and citation only. I diffed them: no oracle, type, signature, exit code or fixture changed.

**But landing the item is necessary, not sufficient.** Both upstream documents moved under this
TSPEC since v1.4 was approved, and one of those moves reversed a disposition the TSPEC's oracles
depend on. That is F-01, and it is why this confirmation does not approve.

## Architecture

_TBD_

## Interfaces

_TBD_

## Data Model

_TBD_

## Test Strategy

_TBD_

## Open Questions

_TBD_

## Recommendation

_TBD_

## Delta-Confirmation Findings

_TBD_

## Verdict

_TBD_
