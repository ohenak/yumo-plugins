# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md`
**Date:** 2026-08-21
**Iteration:** 3
**Round type:** Upstream-cascade confirmation (PLAN bytes unchanged; upstream TSPEC edited after approval)

## Overview

**The one question.** PLAN was approved at round v2 (`CROSS-REVIEW-test-engineer-PLAN-v2.md`,
`Approved with minor changes`, anchors recorded at `88677711`). Its own bytes have not moved since:
the PLAN blob at that approval commit and at HEAD are both `4df3434e`. What moved is TSPEC, which
took a round-4 erratum edit. So the question is narrow and singular — **is PLAN still a faithful
compression of TSPEC as TSPEC now stands?** Not "is PLAN good", which round v2 already answered, and
not "did the routed items land", which is necessary but not sufficient (DEC-ERR-03).

**What the upstream edit did.** Three commits (`91f93b8e`, `6ac1df9f`, `5d5bbd75`), +9/−4 lines,
touching exactly three places in TSPEC: the version cell (1.2 → 1.3), a new revision-history row,
§5.8's coverage-floor assignment, and the RT-7 mitigation cell of §6.4. The substance in one
sentence: the 85% per-file branch floor is **re-assigned from "the last implementation wave's
`postWaveCommand`" to "the last implementation task (PLAN T-10, RK-2)"**, on the reasoning that
V-13 closes the config surface at four keys with a single *global* `postWaveCommand`, so a
per-wave-scoped setting is not expressible and a global one would run `test:coverage` after every
wave. Threshold, backstop and the floor itself are unchanged.

**The shape of the answer.** This erratum moved TSPEC *toward* PLAN, not away from it. PLAN had
already refused the `postWaveCommand` framing, assigned the floor to T-10, and raised the divergence
as an erratum in RK-2 and §3.4 — the erratum this very round landed. So every **obligation** PLAN
carries is now exactly what TSPEC asks for; the mechanism, the runner, the threshold and the
reporting requirement all agree. Nothing in the task table, the batch DAG, the ownership manifest,
the AT mapping, the oracle rules or the DoD is disturbed.

What *is* disturbed is narrower and entirely descriptive: PLAN's §3.4 and RK-2 still describe TSPEC
as asking for the `postWaveCommand` framing and still describe the erratum as one *this dispatch
raises*. Both sentences were true when written and are false against TSPEC v1.3. They are
rationale prose in a hand-off position, not gate text, and correcting them changes no test, no
oracle and no batch — so they are recorded at Medium, not High, per the demotion bar in
`docs/_decisions/DECISIONS-review-severity-bars.md` (DEC-ERR-01: a false statement about upstream
confined to a hand-off/rationale section is demoted, not gating).

**Scope of this round.** Delta-confirmation only. I re-read my own v2 cross-review, the full diff of
the upstream edit, TSPEC §5.8 and §6.4 at HEAD, and every PLAN section that leans on them (§3.4,
§4.4/RK-2, T-10's task row, §4.5/§4.5.1's DoD checkboxes). I did not re-litigate the three v2
findings F-11/F-12/F-13, which were non-gating Mediums and Lows left to the author's judgement, and
I did not re-derive conclusions that rest only on PLAN bytes that have not changed.

## Batches

_(pending)_

## Dependencies

_(pending)_

## Verification

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Verdict

_(pending)_
