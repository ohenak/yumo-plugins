# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.2, 2026-08-03)
**Date:** 2026-08-03
**Iteration:** 2
**Scope:** Local

## Grounding

Delta re-review. Base for the diff is `e7ffd1d`, the commit v1 reviewed; the document has moved
through eleven authoring commits to HEAD `2a290df` (+272 / −72 lines). I read the diff, not the
document, and re-ran every mechanical claim the revision newly makes.

What was re-verified at HEAD `2a290df`, and what it showed:

- **§2.4's "cannot be a task" argument is exactly right, and the line numbers hold.** `implRaw` /
  `implParsed` / `implConfig` are assigned at `pdlc/workflows/orchestrate-dev.js:8040-8042`, inside
  wave mode and **above** the wave loop, which opens at `:8094`; every wave's gate reads that one
  cached value at `:8113`, and `:8113-8118` is
  `const gate = await runCommandFn(implConfig.testCommand); if (!gate || gate.ok !== true) { throw haltError(...) }`.
  A batch-1 task could not have repaired the gate its own run reads. Deleting A-00 was the correct
  call, not a workaround.
- **Both §2.4 command counts, run rather than read.** The shipped form collects **92** suites
  (`--listTests`), consistent with the recorded `23 failed, 69 passed, 92 total`; the restated form
  collects exactly **68**, and none from `helpers/`, `fixtures/` or `documentOracles`.
- **`.claude/pdlc.config.json` really is untracked.** `git ls-files .claude` returns nothing, so
  §2.4's "disk requirement, not a commit requirement" caveat is accurate and correctly left to the
  operator.
- **The v1.2 parse claim, re-executed against this document.** `parsePlanTasks` ⇒ **36 tasks**,
  `parsePlanOwnership` ⇒ **36 rows**, `validatePlanContract` ⇒ `{"ok":true}`,
  `computeTopologicalBatches` ⇒ **20 batches**, no cycle. The changelog's figures are the real ones.
- **§6.5's reuse claim.** `pdlc/workflows/__tests__/helpers/driftGenerators.js` exists and exports
  `seeded` (`:76`), `resolveSeed` (`:134`) and `enumerateLeaves` (`:158`); **13** shipped
  `*.test.js` files import it — the count §6.5 states. Reusing it rather than re-authoring a PRNG is
  a real edge, not an aspiration.
- **§6.4's 24-name enumeration.** The two module rows list 22 + 2 = 24 function names, matching
  §9.1's "all 24 enumerated function names resolve" checkbox, and the five `(reused)` exclusions
  (`guardVerdict`, `checkPrCi` — `orchestrate-dev.js:5927` — `commitPaths`, `rebaseOntoDefault`,
  `_runCommand`) are symbols this feature calls but does not own.
- **Every green task's `Deps` edge to its 🔴 author exists**, and no two green owners of the same
  test file share a §3 batch (A-23/A-25 at 10/12, A-24/A-26 at 11/13, A-29/A-30/A-31 at 10/11/12,
  A-27/A-28 at 14/4) — so the skip discipline's "exactly one un-skipper per block" claim is sound
  *as a claim about ordering*. F-08 below is about a different mechanism.

Only findings that survived that check appear below.

## Prior findings — disposition

| v1 ID | Severity | Status | Evidence in v1.2 |
|---|---|---|---|
| F-01 | High | **Resolved** | §8.2's T-03-6 row is restated at FSPEC §18.2's full quantification — four prohibition cases *plus* one parameterised case per `ADVISORY_SEAMS` member asserting `resolved` is reachable only through the seam's declared `verifyGate`, driven off the exported constant, with both the stub-fails and gate-removed directions named. Assigned to A-07 (🔴) with A-23/A-24 as 🟢 owners, and mirrored verbatim into §9.2's third checkbox. AC-4.5's five gate rows now each have a named case. |
| F-02 | Medium | **Resolved** | The `T-10-4` token is gone from A-03's row; A-03 now describes the `invalidKeys` emit-gate as a *mechanism* and explicitly disclaims the case id, naming `advisoryDisabled.test.js` (A-16/A-33) as its single home. §8.1 is unchanged and still routes T-10-1…T-10-5 there. One home, one owner. |
| F-03 | Medium | **Resolved, and better than asked.** | A-34 carries a binding two-form discharge rule: `RESULT: verified` **only** with verbatim runtime output pasted beneath it, or `RESULT: unverified — no runtime available` naming what would settle it and recording that BL-01 stays open. Form (ii) satisfies §9.4 in full; an inferred result is named as mock data and a DoD violation that `dod-verify`'s scan binds to. The row also observes that a wave agent has no synced `.claude/workflows/` copy, so the honest form is the *expected* one — which removes the incentive to fabricate rather than merely forbidding it. |
| F-04 | Low | **Resolved** | §8.1's total row now reads "**14 files** (the 12 distinct files above … plus `advisoryPreflight.test.js` and `advisoryBundle.test.js`), matching §4's manifest row-for-row", and enumerates the twelve so the count is checkable rather than asserted. |
| F-05 | Low | **Resolved** | §4.1 now opens "Twelve tasks own `orchestrate-dev.js`, four own `orchestrate-queue.js`", agreeing with its own table. |
| F-06 | Low | **Resolved** | §6.3's `ADVISORY-{feature}.md` row now ends "… the candidate feature's own next dev-side run picks the record up at its post-PUB distil step (AC-9.1), so persistence is **deferral, not retention**, and AC-9.3's 'absent at end of run' holds of that later run." The queue-side record no longer reads as permanent. |
| F-07 | Low | **Resolved** | §1 gains a declared paragraph naming the `testCommand` repair as out-of-REQ-§5-scope enabling work; §10.1 gains it as carried item 5 with the repo-wide effect stated; §4.1 and I-23 both reassign it from A-00 to "the §2.4 operator pre-flight step … pinned by A-01". A Phase DOD reviewer now meets it as a declared deviation in three places. |
| Q-01 | — | **Answered, and acted on** | The answer turned out to be stronger than the question: not merely *should* it be lifted out of the task table, but it *must* be, because `implConfig` is cached above the wave loop. §2.4 is the result. |
| Q-02 | — | **Answered** | §6.3 and §9.4 now require the `RESULT:` line to be copied into LEARNINGS **verbatim, including an `unverified` outcome**. |
| Q-03 | — | Not taken up | §8.1's T-08 split (T-08-6 in `advisoryHarvest`, T-08-10 in `advisoryRecord`) is unchanged. I do not press it: the contiguous-range rationale is defensible and §8.1's row-level assignment is explicit enough to audit. |
| Q-04 | — | **Answered honestly** | §10.1 item 4 now states that the deferral reason is Phase MERGE's **existing** catalogue, that this feature does not widen it (§5.4(4), AC-10.5), and that naming the advisory distil commit would require a new MERGE reason and is deliberately deferred. That is the right answer — the alternative would have widened AC-10.5's catalogue by stealth. |


## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
