# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.8, 2026-08-17)
**Date:** 2026-08-17
**Iteration:** 5

**Scope:** Delta re-review of the v0.7 → v0.8 diff (`0e86f11a..f89736fb`: baseline partition
closure `9174b23f`, REQ `f89736fb`). Round-4 findings re-checked against the tree at HEAD, not
against prose. Final round of the budget; no settled decision re-litigated.

## Round-4 Disposition

| Round-4 ID | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| F-27 (partition red on 24 paths, two of them live wave-gate code) | High | **Resolved — re-derived independently** | I re-ran the baseline's dependent sweep at HEAD (`f89736fb`) and rebuilt the claimed set from the baseline's own rows. Sweep returns **133** paths, 0 duplicates. Removing the 9 single-file M-rows, M-8's 25 (18 regex-matched `*.test.js` in the sweep + 7 helper files), M-11o's 2, M-11p's 6 and A-1's 61 leaves a remainder of **exactly 30** paths, and every one of the 30 belongs to an M-11a…M-11n row. `comm` in the other direction is empty: no claimed path falls outside the sweep. So **133 swept / 133 classified / 0 unclassified / 0 multi-owned** re-derives, and the breakdown 9 + 25 + 30 + 2 + 6 + 61 is the one the baseline records. The 30 also reconcile per-row: M-11a 1, M-11b 1, M-11c 0, M-11d 1, M-11e 10, M-11f 1, M-11g 1, M-11h 4, M-11i 2, M-11j 1 (`.gitignore`), M-11k 3, M-11l 1, M-11m 1, M-11n 3. |
| F-27 (live-code sub-claim) | — | **Resolved** | AC-1.2 now defines the search term by construction and states the bare key name `postWavePathspecs` is out of it. The three cited parser sites verify verbatim: `pdlc/workflows/orchestrate-dev.js:168` (`postWavePathspecs: Object.freeze([])`), `:218`–`:245` (generic array-of-non-empty-strings validation, `invalidKeys.push`), `:14416` (`if (postWaveRan && implConfig.postWavePathspecs.length > 0)`). `pdlc/workflows/__tests__/waveExecution.test.js` is classified under M-11h as a **survivor**, not a deletion. The retired *value* is where the baseline says it is: `pdlc/workflows/__tests__/consolidationPreflight.test.js:205`–`:208` asserts `toContain("pdlc/workflows/dist/")` and `toBe("node pdlc/workflows/build-runtime.mjs")`. The engine-channel module is no longer asked to lose live code. |
| F-28 (M-8 and M-11e undercount their own classes) | Medium | **Resolved** | M-8 re-measures to 21 `*.test.js` / 15,109 lines + 6 helper files / 2,024 lines = **27 files / 17,133 lines**, and `wc -l` over the union prints 17133 exactly; 119 total `*.test.js` in `pdlc/workflows/__tests__/` confirms. M-8's claim that every importer of the three helper modules and both referents of `helpers/bin/` sits inside its own 21 also holds — the importer set is `bootstrap`, `queueDriftGate` and thirteen `drift*` test modules, all regex members. M-11e re-measures to 10 (6 `consumer-ac12/` + 4 `covered-violations/`), matching the sweep. REQ §7 R-8 and §6 carry the restated numbers (27 files / ~17,100 lines); no stale "21 files / 15,109" survives anywhere in the REQ. |
| Q-12 (`postWavePathspecs` in scope at all?) | — | **Answered** | M-11h answers it directly: the mechanism keeps a caller because the sweep-reduced build step that emits M-9 still runs under O-3, so the class edits *which pathspec is configured*, not whether the facility exists. AC-1.2 defers which values the term carries to the same O-3 disposition rather than guessing now. That is the right shape — the answer is a pointer to a named open question, not a silent assumption. |

Spot-checks requested this round both hold. `pdlc/engine/__tests__/ci-arrangement.test.js` returns
**zero** sweep hits (the grep exits 1) while genuinely being a dependent — it carries `GATE_JOB_IDS`
at `:47` — so the "sweep is a lower bound, not a definition" clause in §1.2 is stating a measured
fact, not a hedge. `.worktreeinclude` is the same case: tracked, its single row is `.claude/workflows/`,
zero sweep hits. The engine gate re-measures green at HEAD under a clean environment:
`env -u NODE_TEST_CONTEXT npm test` in `pdlc/engine` prints `# tests 842 / # pass 840 / # fail 0 /
# skipped 2`, exit 0 — a non-vacuous green start, so C-7's BL-08 claim still verifies.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-29 | Medium | Local | **`orchestrate-queue.js`'s header banner has no row carrying an edit obligation, so AC-1.2 can red on a third surviving module.** `pdlc/workflows/orchestrate-queue.js:5`–`:6` carries the identical two-line banner to the two M-11o names — `Built artifact: pdlc/workflows/dist/orchestrate-queue.bundle.js` and `Consumer runtime copy: installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh` — both retired names. The partition's exactly-one-class rule puts the file in **M-11i**, whose obligation text is only "queue drift gate and its `distribution.checkEnabled` key". M-11o names the banner class but explicitly excludes the file ("`orchestrate-queue.js` carries the same banner but is already named by M-11i"), and that cross-reference is not true of M-11i's content: M-11i names the *file*, not the banner work. M-11k still carries the residual phrase "header prose in the workflow modules" that M-11o says it split out, but M-11k's three swept paths are the two READMEs and `RELEASE-CHECKLIST.md` — no workflow module. So a maintainer working the inventory rewrites two banners, edits one drift gate, and AC-1.2's required-empty search reds on a surviving engine-channel module — the same failure shape M-11o was created to prevent, one file short of prevented. Also inconsistent in the REQ, which says "M-11o the header banners inside the **two** surviving workflow source modules" (§1.2) and repeats "two live workflow modules". Fix is one phrase, not a re-measurement: extend M-11i's obligation to name the banner at `:5`–`:6` (or widen M-11o to three paths and move `orchestrate-queue.js`'s ownership there), drop M-11k's now-dead phrase, and read "two" as "three" in §1.2 and §5 C-5. | §1.2 (M-11o, M-11i, M-11k), AC-1.2, C-5 |
| F-30 | Low | Local | **The `driftGenerators.js` reduction is measured more narrowly than the tree supports, in both directions.** M-8 says "seven surviving modules (`approvalHash`, `completeness`, `forcePhases`, `pacingWrapper`, `roundDerivation`, `scanLines`, `consolidationPreflight`) import its `seeded`/`resolveSeed`/`shrink` primitives". There is an eighth: `pdlc/workflows/__tests__/helpers/mergeDoubles.js:14` imports `seeded, resolveSeed` from it and is not an M-8 member. Symmetrically, M-11p names only `C1_PATH` (`:64`) and `readFaultTokens` (`:477`–`:526`) as the drift-only surface that goes; but `enumerateLeaves`, `enumerateEvidenceVectors`, `MANIFEST_CHAIN_VECTORS`, `genId` and `genStamp` likewise have no consumer outside M-8's deleted 21, so a reduction derived from the cell as written leaves five dead exports behind. Neither error changes the disposition — "reduced, not deleted" is right, and the outcome is dead code rather than a red suite — which is why this is Low rather than a blocker. Fix: correct "seven" to eight (naming `mergeDoubles.js`, a helper rather than a test module, which is why it was missed), and mark the removed-export list explicitly non-exhaustive so TSPEC derives it from a fresh consumer scan instead of transcribing two names. | §1.2 (M-8, M-11p), R-8 |

## Delta tags

FINDING: Medium | delta | local | §1.2 M-11i / M-11o / M-11k | this round's M-11o split left `orchestrate-queue.js:5`–`:6`'s banner owned by M-11i, whose obligation text does not cover it; M-11k's superseded "header prose" phrase names no path
FINDING: Low | delta | local | §1.2 M-8 / M-11p | `driftGenerators.js` has eight surviving importers, not seven (`helpers/mergeDoubles.js:14`), and five more exports than the two named lose all consumers with M-8

## Questions

| ID | Question |
|----|---------|
| — | None. Q-12 is answered; no new question is open. |

## Positive Observations

- The partition did the job it was built for. Running it end to end at HEAD reproduced every
  number in the baseline's **Partition** section — including the two rows that contribute zero
  and one hit — with no hand-adjustment. That is the first round where the inventory's totals
  survived being recomputed by someone who did not write them.
- Reclassifying M-11h as a config-**value** change is the correct call and is now argued from the
  code rather than asserted: the default at `:168`, the generic validator at `:218`–`:245` and the
  single consumer at `:14416` are all key-agnostic, so retiring the configured pathspec really does
  leave the facility and its tests untouched. AC-1.2's "it never contains a surviving identifier"
  turns that into a rule future terms cannot quietly violate.
- §1.2's new "the sweep is a lower bound, not a definition" paragraph is the durable lesson of the
  whole round sequence, and it is stated with the two counterexamples that prove it rather than as
  a caution. `ci-arrangement.test.js` at zero hits is a better argument for keeping a curated
  inventory than any of the four rounds of found-a-missing-file were.

## Recommendation

**Approved with minor changes**

Round 4's High is closed in the tree, not merely in prose: the partition re-derives at 133/133/0/0
from an independent reconstruction, and the wave-gate reclassification checks out line by line
against `orchestrate-dev.js` and `consolidationPreflight.test.js`. F-28's sizes re-measure exactly.
The engine gate is a real green at 842/840/0/2.

What remains is one banner in a third workflow module that the new M-11o/M-11i boundary leaves
without an owning obligation, and a narrow measurement of the `driftGenerators.js` reduction.
Both are phrase-level corrections to the baseline plus a word in §1.2; neither reopens the
partition, changes a count, or touches a settled decision. They can land with the FSPEC rather
than costing another REQ round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
