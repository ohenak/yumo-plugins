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

All seven v1 findings are resolved. Both findings below are **new**, and both live inside sections
the revision changed — §3's new skip discipline and §6.4's new coverage procedure.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-08 | High | Local | **The new skip discipline requires every 🟢 task to edit a test file it does not own and to make two commits — and the wave runner forbids both, so §9.2's red-evidence checkbox is unsatisfiable as written and Phase DOD would reject the feature on evidence that could not have been produced.** §3's new preamble (steps 2 and 3) makes the 🟢 task delete `.skip` from its own block in the 🔴 task's file, then "un-skips first, runs the file, captures the failure, and commits that as its red commit before writing any production code"; §9.2 turns that into a DoD row — "**The red evidence is the 🟢 task's own commit pair** … A green task with a single commit has no red evidence and does not satisfy this row." Both halves collide with the Phase I wave runner this PLAN targets, and neither collision is a style question: (a) `waveImplementPrompt` tells every wave agent verbatim `You own EXACTLY these files: {manifest row}. Do not create or modify any other file.` (`pdlc/workflows/orchestrate-dev.js:5849`), and §4's manifest deliberately gives the test file to the 🔴 task alone — "the 🔴 task that authored it stays its only writer for the life of the PLAN" — so the un-skip is an edit the agent is instructed not to make; (b) the very next prompt line is `Do NOT run git add or git commit — the orchestrator verifies your work and commits it.` (`:5851`), and the script commits **once per task, pathspec-scoped to `task.files`** (`:8143-8159`, `commitPaths({ paths, … })`) — so a green task can produce exactly one commit, never a pair, and that one commit **excludes the test file**, leaving the un-skip edit permanently uncommitted in the working tree. The product consequence is not a stalled wave but a false one: the suite goes green because the block was un-skipped on disk, the evidence of *why* it is green is never committed, and §9.1's own checkbox "No task's diff touches a file outside its §4 manifest row" is violated by every single green task. **Fix (three coordinated edits, all mechanically supported):** (1) add the test file to each 🟢 task's §4 manifest row — `validatePlanContract` (`:2344-2367`) only requires a task↔row bijection by task id, not path uniqueness, and `computeWaves`/`pathsCollide` (`:2377`) will then *enforce* the "one un-skipper at a time" separation that §3 currently only argues for; restate §4's opening sentence accordingly (the 🔴 task remains the only writer of **case bodies**, which is the invariant that matters). (2) Restate §3 step 3 and §9.2's red-evidence row against what the runner can actually produce: the green task **reports** the captured pre-implementation failure in its summary, and the red evidence is the wave's script-owned commit plus that transcript — not a two-commit pair the agent is forbidden to create. (3) Re-run `parsePlanOwnership` + `validatePlanContract` + `computeTopologicalBatches` after the manifest edit and re-transcribe §5.2's executor table, since added ownership rows can change the wave partition even when the batch count does not. | REQ-ADV-04 AC-4.6; FSPEC §18.1 (all 81 cases "failing before, passing after"); §9.1, §9.2 |
| F-09 | Low | Local | **§6.4's declared advisory surface and the command that measures it disagree by two symbols, so part of the surface is scoped in but never counted.** The new module table puts in scope, for `orchestrate-queue.js`, "`hasResidualSeamToken`, `honourA1Verdict`, **plus the advisory branches added inside `parseTriageVerdict` and `triagePrompt`**" — but the `node -e` command's name list ends `… hasResidualSeamToken honourA1Verdict`, 24 names, and the filter is `if (N.has(fn.name))`, so every statement and branch inside `parseTriageVerdict` and `triagePrompt` contributes **nothing** to the printed pair. §9.1's checkbox then reads "all 24 enumerated function names resolve", cementing the smaller set. The advisory branch inside `parseTriageVerdict` is the A1/A2 seam-token routing (REQ-ADV-05), so a measurable floor that silently excludes it under-reports exactly the surface AC-5.x depends on. This is a Low, not a Medium, because the floor is a supporting instrument and T-04's ten named cases carry the real obligation — but the contradiction should not survive into an audit. **Fix:** pick one and say so. Either drop the "plus the advisory branches…" clause and state that those two pre-existing functions are out of the denominator (with T-04-1…T-04-9 named as the evidence instead), or add both names to the command's argument list and to §9.1's count, noting that their pre-existing bodies inflate the denominator and by roughly how much. | REQ-ADV-05; §6.4, §9.1 |


## Positive Observations

## Recommendation

## Verdict
