# Cross-Review: test-engineer — Final Codebase Review

**Reviewer:** test-engineer
**Reviewed:** `git diff main...HEAD`, branch `feat-pdlc-merge-phase`, HEAD `ae406c6`
**Date:** 2026-08-02
**Iteration:** 1
**Scope:** line

Testing lens over the shipped code: does the suite actually deliver TSPEC §13 + PROPERTIES v1.1?
I ran the suites myself and performed two source mutations (both reverted; tree verified clean and
`build-runtime.mjs --check` back to PASS).

**Measurements taken.**

| Check | Result |
|---|---|
| `npm test -- mergeDecision mergePhase` | **1225 passed**, 2 suites, 0 failed |
| Whole suite | 62 suites, **61 green**; sole red `documentOracles.test.js:246` AT-23 — the documented `.tokensave` untracked-file false positive |
| Mutation — drop `"pdlc/skills/"` from `MERGE_GUARD_DEFAULTS` (`orchestrate-dev.js:47`–`:52`) | **1087 tests red across 2 suites**, naming AT-M3 arm B at `mergeGuard.test.js:204`. Restored, green |
| Mutation — garble `MERGE_ESCALATIONS.tree` + `.queue` wording (`orchestrate-dev.js:1245`–`:1248`) | **whole suite still passes** — see finding 2 |
| Mutation — garble `MERGE_ESCALATIONS.ci` | reds `mergePhase` row 9 (correctly falsifiable) |
| Skip/todo residue in the ten new merge files | **none**; the suite's 70 skips are all pre-existing files |
| §13 test files landed | all 8 named in TSPEC §13.2, plus the PLAN's declared ninth `mergePostMerge.test.js` |

## Findings

### 1. [blocking] The §11 row-table self-count assertion never landed, and its DoD box is ticked

TSPEC §13.3 (`TSPEC-pdlc-merge-phase.md:1354`) requires: *"The suite asserts its own case count is
**25** (rows 1–23 plus 11a and 13a) so a dropped row is a failure rather than an absence."*
`PLAN-pdlc-merge-phase.md:277` records that box as `[x]`.

What actually shipped is a different assertion. `mergeDecision.test.js:46`–`:57` self-checks the
**test-local `ROW_IDS` transcription** — that the literal array at `:40`–`:44` has 25 members, no
duplicates, and both lettered rows. That is a check on the *list*, not on coverage. `ROW_IDS`'
only other uses are **containment** checks — `expect(ROW_IDS).toContain(outcome.resolution.row)`
(`:525`, `:826`) — which prove *soundness* (every row the core emits is a legal id), never
*completeness*.

The rows themselves are 31 free-standing `test("row N …")` calls in `mergePhase.test.js` (24 distinct
ids: 1–22 plus 11a and 13a) with row 23 covered separately in `haltAndQueue.test.js` (PROP-M-17
report-totality). So all 25 rows genuinely have passing cases today — but **deleting any one of them
leaves the suite green**, which is precisely the failure mode the TSPEC clause was written to
prevent. The anti-rot device is the thing that is missing, and it is the thing the DoD box claims.

**Fix (~10 lines):** have each row case register its id (a module-level `COVERED` array, or derive
the set from the describe block's test names), then one final assertion that the covered set equals
`ROW_IDS`. See finding 4 for the row-23 cross-file wrinkle that fix must handle.

### 2. [blocking] `MERGE_ESCALATIONS.tree` and `.queue` have no falsifiable oracle — measured, not inferred

Every assertion on these two templates is an **implementation echo**: the expected value is produced
by calling the same frozen catalogue the implementation uses. Sites —
`mergePhase.test.js:369`, `:385`, `:580`, `:581`, `:777`, `:781`, `:796`, `:797` — all of the form
`expect(escalationLines(outcome)).toEqual([MERGE_ESCALATIONS.queue({…}), MERGE_ESCALATIONS.tree({…})])`,
with both sides resolving to `orchestrate-dev.js:1245`–`:1248`.

I measured it rather than arguing it. Garbling both templates in the source
(`working tree not updated after merging` → `TREE-GARBLE after merging`; `but the queue row for` →
`QUEUE-GARBLE for`) and running the **entire** suite: **61/62 suites green, 2929 tests passed**, the
only failure the pre-existing `.tokensave` document-oracle red. Two operator-facing lines that FSPEC
§9.3 pins verbatim can be reworded arbitrarily and ship.

This is an inconsistency, not a blind spot — the correct pattern exists in-repo twice:
`mergePhase.test.js:552` anchors the guard escalation's **literal text**
(`MERGE ESCALATION: self-modification guard fired for ${PR_URL} — matched paths: pdlc/skills/x.md`),
and `mergePostMerge.test.js:411` anchors `MERGE_NOTES.aheadOfRemote`'s literal. The `ci` template is
also genuinely falsifiable (my mutation red it at row 9). Only `queue` and `tree` are unanchored.

Worth naming because it compounds: **AT-M6** (`mergePhase.test.js:573`–`:581`) asserts both lines
*and their §9.3 order* — the ordering oracle is real, but the two lines it orders are exactly the two
whose text can drift.

**Fix:** two literal-text assertions mirroring `:552`, one per template.

### 3. [advisory] Most `MERGE_NOTES` templates are echoes on the same pattern

`mergePhase.test.js:360`, `:410`, `:531`, `:691`, `:905`, `:934` assert notes against
`MERGE_NOTES.*(…)`. Only `aheadOfRemote` has a literal anchor (`mergePostMerge.test.js:411`). Lower
stakes than finding 2 — notes are advisory rather than the escalation channel — but the same one-line
remedy applies, and doing both together is cheaper than doing them twice.

### 4. [advisory] Row 23's case lives in a different file, which finding 1's fix must account for

24 rows are in `mergePhase.test.js`; row 23 is in `haltAndQueue.test.js` because `phaseMerge` is never
called on that path — correctly reasoned and recorded, but only as a header comment
(`mergePhase.test.js:5`–`:16`). A completeness assertion added for finding 1 must either span both
files or exempt row 23 explicitly with the cross-reference, or the new assertion will itself be
quietly wrong.

## Positive Observations

- **The guard pillar is genuinely load-bearing.** Dropping one member of `MERGE_GUARD_DEFAULTS` reds 1087 tests and names AT-M3 arm B by line. That is the strongest mutation result I could have hoped for.
- **AT-M3's arms are both positive**, not absence-only: arm A asserts `fired === false` **and** `matched === []`; arm B asserts `fired === true` **and** `matched === ["pdlc/skills/x.md"]` (`mergeGuard.test.js:184`–`:206`).
- **The D_core enumeration is real and self-counting.** `mergeDecision.test.js:483`–`:484` asserts `|D_core| === 419`, with further self-counts at `:487` (209 mode-independent), `:491` (36 candidate leaves), `:497`/`:571` (120 row-18), `:721`–`:722` (CI 10), and `mergeConfig.test.js:189`–`:190` (28 = 7 keys × 4 corruption modes). PROPERTIES §29's "each `enum(n)` row asserts its own case count" is honoured everywhere **except** the §11 row table (finding 1).
- **`ROW_IDS` deliberately avoids the echo trap**, with the reasoning recorded at `mergeDecision.test.js:36`–`:38`: *"a test that read this list from the implementation's own catalogue would never catch a mutation of a row id there."* That the team articulated this principle is exactly why finding 2 reads as an inconsistency worth one small commit.
- **PROP-M-21 is a true differential**, not a table restatement: `:760`–`:775` runs each non-`none` CI value under both `mergeRequiresCi` settings and asserts identical rows, so "the flag relaxes exactly one cell" is falsifiable; `:744`–`:758` adds the escalation-count differential.
- **Golden provenance is airtight.** `__tests__/fixtures/queue-goldens/` has exactly **one** commit in its history — F1 (`9aa98f3`, 12:41:08) — and B2, which changes `updateQueueStatus` (`00cd26d`), landed at 13:41:01. Captured an hour before the change and never regenerated, which is the strongest form of the check.
- **Both vacuity traps are closed.** `runtimeBundle.test.js:1121`–`:1128` asserts no seam named `_recordHalt` survives, and a repo-wide grep confirms zero occurrences outside that assertion itself — source, tests, adapter and bundle all clean. `AT19_SEAM_NAMES` (`:212`–`:216`) now carries `_recordQueueRow` **and** `_ghRun`, so the new transport is inside the await-discipline scan; `NEW_SEAMS` (`pipelineWiring.test.js:441`–`:447`) carries `_recordQueueRow` with the filter + `toHaveLength(5)` still sound.
- **No test-suite residue.** Not one `it.skip`, `test.skip`, `describe.skip`, `it.todo` or `.only` in any of the ten new merge files.
- Generated artifacts are in sync: `build-runtime.mjs --check` reports all four rows `in-sync`.

## Recommendation

**Needs revision**

Two blocking findings, both narrow and both mechanical to fix. The implementation itself is in good
shape — the mutation probe on the guard says the central pillar is real, the 419-case D_core
enumeration runs, PROP-M-21 is a genuine differential, the goldens are provably HEAD-captured, and
both vacuity traps are closed. What is missing is falsifiability in two specific places: the row
table's self-count device that TSPEC §13.3 named and PLAN §11 already ticks, and literal anchors for
the two escalation templates I demonstrated can be reworded with the whole suite still green.
Neither requires new scope; together they are roughly a dozen lines, and the repo already contains
the pattern for both.

## Verdict

VERDICT: REVISE
{"high": 2, "medium": 0, "low": 2}
