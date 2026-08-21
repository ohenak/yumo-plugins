# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 7 (delta re-review of PROPERTIES v0.3 → v0.4; frozen round)

## Overview

**What I reviewed.** The delta `5fceba19..HEAD` on
`PROPERTIES-pdlc-learnings-injection.md` (v0.3 → v0.4, four commits: `315bdc3c`, `353e1f26`,
`d6f90732`, `a12b20f9`). Five changed places: the header's PLAN pin (v0.5 → v0.7), three T-O-6
locator rewrites (`TSPEC §T.5` → `TSPEC, Named obligations carried forward`) at :250, :710 and
§G.1's T-O-6 row, §C.4's landed-files paragraph, and a new struck item in §G.3. Upstream REQ, FSPEC,
TSPEC and DECISIONS are byte-identical to the versions I approved against
(`ff605dd3…`, `ae75fa62…`, `22dee8ce…`, `56617f5a…`); PLAN moved v0.6 → v0.7 (`b9fbd3ea…`).

**My three v6 findings.** All three are addressed on their face:

- **F-01 (Medium)** — §C.4 no longer says the ledger-row naming "is routed as an erratum, not decided
  here". It now records the item as answered at HEAD and paraphrases PLAN's two-case table. Resolved.
- **F-02 (Low)** — the header pin now reads `PLAN-…md (v0.7 …)`; PLAN's version cell at HEAD is
  `0.7` (PLAN:18). Resolved.
- **F-03 (Low)** — §C.4 now splits the two mechanisms correctly: case B's named row is scoped to
  `LI-AT-11`'s heading-form cases, and this document's own properties are attributed to **P-A-6**,
  which PLAN:590 states as "commit at the first point the suite is green, in practice after LI-21
  (batch 13)". The citation matches the source. Resolved.

**What the revision broke.** §C.4's re-measurement is the load-bearing casualty. The paragraph
announces itself as "re-measured at HEAD (implementation has begun)" and the delta *extended* the
measurement (LI-05 added to the committed-task list, the "two of them own none of the fourteen"
arithmetic, the capture-script sentence rewritten from absence to presence). But the measurement it
extends is stale by an entire implementation run: at the commit that carries this very edit
(`a12b20f9`), `git ls-tree -r a12b20f9 pdlc/workflows/__tests__` already lists **all fourteen**
manifest paths, and HEAD carries `feat(pdlc-learnings-injection): LI-01` … `LI-21` plus `LI-23`
(only LI-22 is absent, and PLAN says LI-22 owns no file). So "Seven of the fourteen files have
landed" and "The remaining seven are explicitly planned and unstarted" are both false at HEAD, seven
`not yet created` cells in the table are false, and the two downstream sentences that lean on them —
"the not-yet-created `learningsConfig.test.js` (LI-12)", and the P-A-6 conclusion that this
document's four properties "enter no ledger row" — inherit the falsity. That is finding **F-01**,
and it is category (ii) under the freeze: a factual contradiction with the repository at HEAD that
makes a load-bearing claim of this document false. It is also delta-introduced in the sense that
matters: this revision re-asserted the measurement rather than leaving it as an acknowledged
snapshot.

**Verification method.** `shasum -a 256` over all five upstream files against the v6 pins;
`git diff 5fceba19..HEAD` on PROPERTIES and PLAN; `git ls-files pdlc/workflows/__tests__`,
`git ls-files scripts/`, `git ls-tree -r a12b20f9`, and `git log --diff-filter=A` per test file;
`grep` of `Named obligations carried forward` and `T-O-6` in TSPEC; `grep` of `P-A-6`/`P-A-7` in
PLAN; direct read of `learningsBlock.test.js` and `learningsConfig.test.js` at HEAD.

## Properties

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
