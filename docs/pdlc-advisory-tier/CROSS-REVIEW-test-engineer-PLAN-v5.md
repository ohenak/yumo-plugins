# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.5)
**Date:** 2026-08-03
**Iteration:** 5
**Scope:** delta re-review — my v4 findings (F-01 High, F-02 Low) and question (Q-01), plus new
issues in the changed sections only. Testing lens: testability, TDD ordering, batch-DAG mechanics,
oracle falsifiability, coverage measurability.

## Disposition of my v4 findings

Diffed `dc6997c..HEAD` (six revision commits, `f6e8665` … `bc6dccf`) over the PLAN. **Both v4
findings and the v4 question are resolved**, and every claim below was re-executed against HEAD, not
read off the document.

| v4 | Verdict | Evidence |
|---|---|---|
| F-01 (H) one `/tmp/adv-gate-w{n}.json` path, up to five concurrent writers; batch 3–5's defective-red detector passes vacuously by absence | **Resolved on all three consequences, and resolved structurally rather than by adding a caveat.** (a) *Last-writer-wins* is gone: §5.2 replaces the per-wave path with `/tmp/adv-gate-{taskId}-pre.json` / `-post.json`, "one writer per file, so no race", and no stale `w{n}` reference survives outside the historical 1.3/1.4 changelog rows (grepped). (b) *Vacuous pass by absence* is closed by the named **existence conjunct**: "`perFile` must contain a key for **each** of this task's owned `advisory*.test.js` paths. A missing key **fails** the gate" — restated inside the batch 3–5 row itself as conjunct (1), ahead of the numbers conjunct (2), so the detector is quantified over a *declared* set rather than over whatever jest happened to collect. (c) *Mid-flight sibling attribution* is closed by scoping every assertion to the running task's own §4 manifest rows, with the disjointness argument grounded at `pathsCollide` (`orchestrate-dev.js:2377` — exact, `function pathsCollide(a, b) {`). I re-executed the manifest: wave 3 is five agents each owning exactly one distinct `advisory*.test.js` (`advisoryConfig`, `advisoryRung`, `advisoryVerdict`, `advisoryEnvelope`, `advisoryDriver`), and wave 12/13/14's pairs are disjoint in exactly the way the new 7–17 row claims — A-23 owns `advisoryDodSeams` + `advisoryDriver` against A-29's `advisoryQueueSeams`; A-24 owns `advisoryPubSeam` + `advisoryDriver` against A-30's `advisoryQueueSeams`; A-31 owns `advisoryQueueSeams` + `advisoryDriver` against A-25's `advisoryDodSeams`. The union-over-tasks framing ("the wave's claim is the union over its tasks' summaries") makes the wave-level claim complete by construction, since each task asserts over its own declared set. |
| F-02 (L) P-4's ladder range `TSPEC:525-534` omits check 6 | **Resolved, with the correction stated rather than silently applied.** §6.5 P-4 now cites `TSPEC:525-535` and adds "the six rows themselves at `:530-535`, so check 6, `X-c / membership`, is inside the range". Re-read at HEAD: `TSPEC:528` table header, `:529` separator, `:530`…`:535` the six checks, `:535` = `| 6 | X-c / membership | …`. Exact in both the outer and the inner range. |
| Q-01 (batches 1–2: the targeted pattern matches nothing and jest exits non-zero) | **Answered, and the premise is now verified rather than assumed.** §5.2 adds "**The targeted run applies from executor batch 3 onward** — the first batch that creates an `advisory*.test.js` file … no gate row there asks for the run, and no agent should perform it defensively." I confirmed the failure mode is real on the pinned jest: `npm test -- --json --outputFile=… 'advisory.*\.test\.js'` at HEAD exits **1** with `Pattern: advisory.*\.test\.js - 0 matches`, so the clause prevents a genuine false red, not a hypothetical one. |

## Verification performed

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
