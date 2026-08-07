# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 2
**Scope:** Local (two TSPEC errata re-emitted, unchanged in substance from the PLAN's own §9.1)

## Method

Delta re-review. `git diff 9cd44a8a..HEAD` over the PLAN (128 insertions, 54 deletions) was read in
full; every prior finding was re-measured against HEAD rather than against the PLAN's account of it;
only changed sections were scanned for new issues.

## Disposition of v1 findings

Every one re-measured at HEAD, not read off the revision.

| v1 | Severity | Status | Evidence re-measured this round |
|----|----------|--------|--------------------------------|
| F-01 | High | **Resolved** | T05 no longer transcribes a count. The row now reads the register, pins `FSPEC 11.3` / `TSPEC 1.7`, carries a non-vacuity floor (parsed register non-empty, size in the failure message), and states the one precondition that could red it — TSPEC §12.3 at 96 — with the halt-and-name-the-ids behaviour rather than a degradation to containment. My own enumeration of `AT-…` tokens over `FSPEC:2041-2191`, de-duplicated, returns **99**, matching the PLAN's measurement of record exactly. The residual red is now a *routed upstream defect* (§9.1 erratum 4/5), not a PLAN defect; I re-emit it as an ERRATUM below so the channel carries it |
| F-02 | High | **Resolved** | `AT-M11`, `AT-Q13`, `AT-R7` now appear **3 times each** in the PLAN (grep) against 0 at v1. AT-M11 lands in T20 in **both** halves — `markerVerdict` returns `free` on both register fixtures, and the pass-level half sits beside AT-M3 in the same block, which is the pairing `FSPEC:2084` explicitly asks for ("without the pair, an implementation recording `reclaimed-stale-lock` on every take passes this row"). Both halves in one file, so T05's one-file-per-id contract is undisturbed — the PLAN says so itself. AT-Q13 and AT-R7 move to T21 and the two stale **(no FSPEC AT)** labels are gone; I read `FSPEC:2126` and `:2106` and the PLAN's transcription of both *Given* sets and both *Then* sets is faithful, including AT-Q13's fixture (b) (single-occurrence, AC-2.3 standing-invariant) as the arm that defeats an unconditional recurrence list, and AT-R7's fixture (c) as the positive control against (a)/(b) |
| F-03 | Medium | **Resolved** | `parsePlanTasks` over the current file returns `T25.dependencies = ["T09","T13","T14","T19"]`. §6.1 records the edge and its reasoning, and separately records the T31 → T06/T20/T21/T22/T24 closure so the same re-derivation is not repeated. Batch numbers unchanged (T19 batch 3, T25 batch 4) |
| F-04 | Medium | **Resolved** | §1 now fixes a single `dist/` vocabulary — "third bundle", "five `dist/` files", "four manifest rows" — anchored to `runtimeBundle.test.js:26` (`BUNDLES`) and `:1584` (`ARTIFACTS = [...BUNDLES, "pdlc-cli.mjs"]`), both read at HEAD. §8.3's row now names the five files and the four manifest rows. Measured at HEAD: `git ls-files pdlc/workflows/dist/` returns four paths and the manifest carries three `id` rows, so three-bundles/five-files/four-rows after T32 is arithmetically right |
| F-05 | Medium | **Resolved** | (a) `git ls-files 'pdlc/workflows/__tests__/*.test.js' \| wc -l` = **83**, `ls … \| grep -c '^consolidation'` = **0** — both now stated with the command that produced them, and the PLAN correctly names the zero as the load-bearing half. (b) **34** tasks, **9** shipped-file editors (T07-T13, T32, T33), 34 − 9 = 25, which is what §1 now says. (c) **Sixteen** suites, and §8.1 now shows the arithmetic (5 + 5 + 3 + 1 + 1 + `consolidationReport`); §8.3's grep row and §10's risk row both say sixteen |
| F-06 | Medium | **Resolved** | The byte-identity claim is gone from §6.3(2) and §8.3, replaced by T04's two-arm block. Arm (a) is above-threshold and compares the `additionalContext` **text** against HEAD's hook *and* against the message transcribed from the shipped template; arm (b) requires the two hooks to **differ** and pins the edited hook's text to the transcribed message at the **new** `n`. The two arms sit in one block, so neither can pass vacuously. I re-read the hook: `THRESHOLD = 5` at `:25`, glob `:28`, early exit `:29-30`, predicate `:41`, `n >= THRESHOLD` `:43`, template `:44-46`, print `:47-48` — every citation in the new text is exact, including the `:44-46` the PLAN newly introduces |
| F-07 | Low | **Resolved** | The `mergeDoubles.js` row now carries six names and six lines in name order; `fakeSleep` is at `:258` (`export const fakeSleep = async () => {};`), between `FIXED_NOW_MS:256` and `fakeNow:259` |
| F-08 | Low | **Resolved** | T32 now says **three** of the four names are new to `devModule`'s export list. Verified: the list opens at `build-runtime.mjs:87`, carries `"resolveAdvisoryRung"` at `:101`, and carries none of `MERGE_GUARD_DEFAULTS` / `mergeCommandFor` / `gitWithLockRetry`; the queue prelude re-binds `resolveAdvisoryRung` at `:119`. §9.1 erratum 3 now states the `CLAUDE.md:62` error as **already false at HEAD**, which `git ls-files pdlc/workflows/dist/` confirms |
| F-09 | Low | **Resolved** | One count everywhere: §2 "**eight** tasks write (T02, then T25 … T31)", §4.2 "eight writers in total — T02's skeleton in §4.1 and the **seven** below". `grep 'nine tasks write'` returns nothing |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
