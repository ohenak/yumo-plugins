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

No property's **claim** changed in this delta. Every edit is either a locator rewrite or prose about
the state of PLAN and the repository, so what I checked is whether each touched property still reads
true against HEAD.

- **PROP-BOUND-03** (:235–252) — the property text is untouched; only its T-O-6 locator moved from
  `TSPEC §T.5, T-O-6` to `TSPEC, Named obligations carried forward, T-O-6`. The new locator is the
  **correct** one and the old one was wrong: T-O-6 is a row of the table under
  `### Named obligations carried forward` (TSPEC:1502, row at TSPEC:1511), not of §T.5. The quoted
  fragment "State the zero conjunct, keep `0` in the domain" is verbatim in that row. Good change.
  Its cost sentence ("one added case in `learningsBlock.test.js` … under the **existing** LI-08 red /
  LI-17 green tasks") is still altitude-correct, but see F-01: LI-08 *and* LI-17 have both landed at
  HEAD (`5e522a52`, `2cbacada`), and `learningsBlock.test.js` at HEAD carries four tests with no
  `maxBytes <= 0` case (the only `bounded: false` assertions are the unbounded arm at :89 and the
  block-shape arm at :48), so the amendment lands on **green committed code**, not on a suite still
  scheduled to red.
- **PROP-CONFIG-09** — same locator rewrite in §O.5's L3 table (:710), same verdict: correct target,
  correct quote. Its partition sentence against PROP-BOUND-03 is unchanged and still non-overlapping.
- **PROP-BOUND-05/07/08** — no text change. §C.4 now counts them together with PROP-BOUND-03 as
  "**four** properties, not three" landing in `learningsBlock.test.js`; that count is right (the
  three Group-D amendments plus the zero case), and I confirmed none of the four is present in the
  landed suite, so all four are genuinely still owed.
- **Counts.** `grep -o 'PROP-[A-Z]*-[0-9]*' | sort -u | wc -l` → **70**, unchanged and still matching
  §C.4's summary table and the header. §C.3's 23-task accounting is untouched; PLAN still carries
  LI-01…LI-23 and v0.7 added no task.

The one property-adjacent conclusion the delta *does* damage is §C.4's closing inference — that this
document's four properties "enter no ledger row unless that commit is brought forward". That
inference is drawn from P-A-6 correctly, but from a false premise about where the run is: at HEAD the
suites those amendments target are landed **and greened**, which is exactly PLAN's case B, not the
pre-batch-7 case the paragraph's framing assumes. The properties themselves survive; the scheduling
claim about them does not. That is F-01, and it is the only High.

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
