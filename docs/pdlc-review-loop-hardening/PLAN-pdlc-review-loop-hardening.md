# PLAN — pdlc-review-loop-hardening

**Version:** v1.0
**Scope:** Work breakdown for implementing TSPEC v1.5 (`pdlc-review-loop-hardening`) — task list, batch
assignment, file ownership, TDD order, traceability and halt conditions. This document specifies **when
and by whom** each change is built. It specifies **no behaviour**: every behavioural, structural and
algorithmic statement lives in REQ v1.6 / FSPEC v1.8 / TSPEC v1.5 and is cited here, never restated.

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → **PLAN**` |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN[-v{N}].md` |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` |

---

## 1. Overview

### 1.1 What is being built

Four harness defects (TSPEC §1.2 `H-1`…`H-4`) are fixed inside the existing `pdlc/workflows/` ES
modules. Five tracked paths change and nothing outside them does — TSPEC §1.3 owns the change surface.
No new package, no new dependency, no new source file under `pdlc/workflows/` (TSPEC §2.1, §2.2).

The work decomposes into **34 tasks across 16 batches**. The shape is unusual and the reason is
structural rather than stylistic: almost all of it lands in **one** physical file
(`pdlc/workflows/orchestrate-dev.js`), and every commit that touches a tracked workflow source must
also rebuild `pdlc/workflows/dist/` in the same commit (§3 below). Those two facts together mean the
**source lane is fully serialised** — one source-writing task per batch — while the test, fixture and
SKILL lanes fan out widely beside it. Batch 2 carries nine tasks; the source lane carries one.

### 1.2 How to read this document

**This PLAN cites; it does not restate.** Every task row names the TSPEC section that owns the thing
being built. If a task row and the TSPEC disagree, the TSPEC wins and the task row is the defect.

That rule is not stylistic either. This feature's own review history is the argument for it: every
residual defect across four consecutive rounds of TSPEC cross-review was a **consistency failure
between duplicated statements of a single rule** — one `ListFailure` contract stated in six places, one
read bound in three, one signature in three. A PLAN that re-describes `selectMode` or the digest
becomes the seventh copy and is wrong within a round. So a task row states only what the TSPEC does
not: *when* the work happens, *who* owns which file, *which test comes first*, and *what stops*.

Where a task row does carry a normative statement, it is a **process** statement (batch, owner, gate,
order) and the TSPEC is silent on it by design.

### 1.3 Test-name namespacing — mandatory

Every jest test this feature adds is named **`RLH-AT-{N}`**, never bare `AT-{N}` (TSPEC §8.3). The
collision is measured, not hypothetical: `pdlc/workflows/__tests__/documentOracles.test.js` at HEAD
carries `test("AT-22 [red-until-L-06]: coveredViolations(LIVE_ROOT) is empty post-landing", …)` from the
preceding feature, and this feature's AT-22 is a different assertion entirely. The TSPEC-local ATs
follow the same rule: `RLH-AT-01a`, `RLH-AT-13a`, `RLH-AT-43a`.

Throughout this document bare `AT-{N}` refers to the **FSPEC's** numbering (which is how the FSPEC
numbers them); the jest name is always the `RLH-` form.

## 2. Test baseline and the exit criterion

### 2.1 The measured baseline

**Re-measured for this PLAN**, at HEAD on `feat-pdlc-review-loop-hardening`, by
`cd pdlc/workflows && npm test`:

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
Time:        179.175 s
```

The single failure is `__tests__/documentOracles.test.js`'s **intentional** red placeholder
`AT-22 [red-until-L-06]`, carried deliberately from the preceding feature. It is **not this feature's
test and must not be fixed, deleted or skipped.** This figure agrees with the TSPEC's own measurement
(§8.3, taken at `ef4705a`).

### 2.2 The exit criterion, stated once — every task cites this section

> **The gate is "no new failures against the §2.1 baseline", never "the suite is green."**
> A batch passes when `npm test` reports **1038 passing / 1 failing / 70 skipped or better**, the one
> failure is still `documentOracles.test.js` `AT-22 [red-until-L-06]` and no other, **plus** any
> `RLH-AT-*` test whose greening task (column `Greened by` in §4) has not yet run.
> A second unexplained failure, or a *different* single failure, is a regression.

The `Greened by` column makes the permitted-red set mechanically derivable at every batch: a red test
owned by this feature is permitted exactly until the batch of its greening task completes, and is a
regression from the batch after that onwards.

Two batches are **RED-terminal by construction** — batch 2 and batch 3, which write test files ahead
of their subjects. Their gate wording is therefore: *the new `RLH-AT-*` tests fail for the stated
reason (their subject does not exist yet) and every pre-existing test still passes.* No batch is gated
on absolute green.

### 2.3 The 179-second hazard — how to run the suite

The full suite takes **179 s**, which sits one second under the 180 s stall watchdog that produced
`H-3` in the first place. A `se-implement` agent that runs `npm test` in the foreground as its
inner-loop command will be killed mid-run, repeatedly, and will conclude the suite hangs.

Normative for every task in this PLAN:

- **Inner TDD loop:** run only the task's own file(s) —
  `cd pdlc/workflows && npx jest __tests__/scanLines.test.js`. Single files are seconds, not minutes.
- **Batch gate:** run the full suite **in the background** and read the output file, or with an
  explicit timeout above 300 s. Never in a blocking foreground call.
- Do **not** shorten the suite to fit the watchdog. Do not add `--silent`-driven partial runs to the
  gate. The gate is the whole suite against §2.2 or it is not the gate.

## 3. Generated-artifact discipline and why it serialises the source lane

### 3.1 The three tiers

| Tier | Paths | Rule |
|---|---|---|
| **Tracked source** | `pdlc/workflows/{orchestrate-dev,orchestrate-queue,runtime-adapter}.js`, `pdlc/workflows/build-runtime.mjs` | hand-edited; the single source of truth |
| **Tracked generated** | `pdlc/workflows/dist/orchestrate-dev.bundle.js`, `…/orchestrate-queue.bundle.js`, `…/distribution-manifest.json` | **never hand-edited**; regenerated by `node pdlc/workflows/build-runtime.mjs` and committed **in the same commit** as the source change (TSPEC §7.3, `CLAUDE.md`, `DEC-DIST-01/02`) |
| **Untracked consumer copy** | `.claude/workflows/` | produced by `pdlc/hooks/scripts/sync-workflows.sh`; **never committed, never hand-edited**. No task in this PLAN commits it |

`build-runtime.mjs --check` exits non-zero when a `dist/` artifact is stale and
`__tests__/runtimeBundle.test.js` asserts freshness, so a source commit without a rebuild reds the
suite. That is the intended behaviour and it is not to be worked around.

### 3.2 The consequence: one source-writing task per batch

`pdlc/workflows/dist/` is a **shared physical write surface for every task that edits any tracked
workflow source**, because each such task must rebuild it. Batch-safety rule 2 (single writer per
physical file per batch) therefore applies to `dist/` and forces:

> **No two tasks in the same batch may edit any tracked source under `pdlc/workflows/`.**

This is why §4's source lane is a strict chain — `RLH-05 → 10 → 13 → 15 → 16 → 18 → 20 → 23 → 26 → 27
→ 30 → 32 → 33` — with one link per batch, and why several of its `Deps` edges exist **for
serialisation alone**. Those edges are marked `[dist]` in §4 so a reader does not mistake a
serialisation edge for a logical one. Removing a `[dist]` edge does not break a compile; it produces a
batch in which two agents rebuild `dist/` concurrently and one silently loses the other's bytes behind
a green suite — precisely the last-writer-wins race rule 2 exists to prevent.

The alternative — deferring the rebuild to one task at the end — was **rejected**: it violates
TSPEC §7.3's same-commit rule on every intermediate commit and leaves the branch shippable-looking
with a stale bundle at thirteen points in its history.

### 3.3 The four `build-runtime.mjs` edits, and their ordering

TSPEC §7.2 specifies four edits (edit 2 being two edits, 2a and 2b, to different literals). All four
are owned by **one task, `RLH-32`**, and land in one commit with one rebuild. They are not split:

- edit 2a and edit 2b touch **different** injection objects in `QUEUE_ENTRY` and TSPEC §7.2 states
  outright that conflating them "leaves the production path unwired behind a green suite". Two tasks
  editing the same literal region in the same file cannot be batched in parallel anyway, and splitting
  them across batches would ship an intermediate commit where `_recordHalt` is unwired on the queue
  path — the exact defect edit 2b exists to close.
- edit 4 (inserting `queueModule` into the dev bundle's `contents` array) carries the **ordering
  hazard** TSPEC §7.2 names: `devModule` must still precede `queueModule`, because `queueModule`'s
  `wrapModule` prelude is `const realMain = __dev.main;`. Verified at HEAD: the dev bundle's array is
  `[DEV_META, BANNER, adapter, devModule, DEV_ENTRY]` and the queue bundle's is
  `[QUEUE_META, BANNER, adapter, devModule, queueModule, QUEUE_ENTRY]`. Reversing produces a bundle
  that throws at load, which no unit test of a source module can see.
- edit 3 extends `wrapModule("__queue", …, ["main", "meta", "DEFAULT_QUEUE_PATH"])` with
  `rewriteStatus` and `updateQueueStatus`. Its precondition is that `orchestrate-queue.js` **exports**
  `rewriteStatus` — non-exported at HEAD (verified). That precondition is `RLH-20`, which is why
  `RLH-32` depends on it and cannot precede it.

Sequencing rule for `RLH-32`: make all four edits, then run `node pdlc/workflows/build-runtime.mjs`,
then `node pdlc/workflows/build-runtime.mjs --check`, then the batch gate. The bundle is never left
stale between the edits and the commit because there is only one commit.

### 3.4 The version bump

`pdlc/.claude-plugin/plugin.json`'s `version` is bumped by **`RLH-33`**, in its own batch **after**
`RLH-32`, and that task rebuilds `dist/` again. The ordering is not arbitrary:
`distribution-manifest.json` records the plugin version the bytes were built at (TSPEC §7.5), so a
bump without a subsequent rebuild produces a manifest that under-reports what changed — and a rebuild
before the bump records the old version.

## 4. Batches

## 5. File-ownership manifest

## 6. Dependencies

## 7. Traceability — task → acceptance tests

## 8. Traceability — FSPEC obligations and defects

## 9. The C-2 runtime gate

## 10. SKILL amendments and how each is verified

## 11. Halt conditions

## 12. Verification

## 13. Open Questions

## 14. Changelog
