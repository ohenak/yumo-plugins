# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1

## Verification Performed

I did not take this document's word for anything mechanically checkable. Every claim below was
re-derived against the working tree at HEAD (`6f3be45e6`).

**Driver classifiers executed, not read.** I imported `pdlc/workflows/orchestrate-dev.js` and ran its
four exported classifiers over the archive directories the document names. Every real-path literal in
§Fixtures and §Oracles' kill map reproduces exactly:

| Document's claim | Executed result | Verdict |
|---|---|---|
| `deriveRoundWindow(…, "TSPEC").startIndex` over `docs/completed/pdlc-advisory-wave-gate/` is `7`, reported value `6` | `startIndex=7`, `−1 = 6` | ✅ |
| same over `docs/completed/pdlc-headless-engine/` is `14`, reported `13` | `startIndex=14`, `−1 = 13` | ✅ |
| `deriveDodRoundIndex(…, "pdlc-loop-economics")` is `3`, reported `2` | `3`, `−1 = 2` | ✅ |
| `parseResolvedMarker` over `POSTMORTEM-PR-pdlc-wave-resume.md` returns `{ok:true,resolved:true}` | exactly that | ✅ |
| `parseReviewFilename("CROSS-REVIEW-product-manager-REVIEW-v1.md")` → `bad_doc_type` | exactly that | ✅ |
| `parseReviewFilename("LEARNINGS-x.md")` → `not_cross_review` | exactly that | ✅ |
| PROP-RR-13's warning that a `se-review` probe returns `bad_role` before the doc-type test | `{ok:false,reason:"bad_role"}` — the warning is correct and load-bearing | ✅ |
| `RESOLVED: yes` is line-leading on the **third** line of `POSTMORTEM-PR-pdlc-wave-resume.md` | line 3, `cat -A` confirms no leading whitespace | ✅ |

**Shipped-code premises.** `pdlc/engine/bin/cli.mjs:141` `VALUE_FLAGS`; `:168` `FLAGS_BY_COMMAND`
carrying exactly four rows (`dev`, `queue`, `doctor`, `decide`), with `doctor:
["plugin-root","cwd","allow-api-key-billing","dev"]` verbatim as PROP-CLI-03 quotes it;
`pdlc/workflows/lib/stats.mjs` absent; `REVIEW_DOC_TYPES` a module-private
`const … Object.freeze([…])` at `orchestrate-dev.js:10105` (**not** `export const`, exactly as
PROP-RR-13 and G-2 state); `REVIEWER_ROLE_SLUGS` = `software-engineer` / `product-manager` /
`test-engineer` (`orchestrate-dev.js:10044`); `export const MODULE_NAMES` at
`pdlc/engine/scripts/prepack.mjs:20` with four members; `resolveWorkflowRoot` exported at
`pdlc/engine/lib/run.mjs:90`; `fast-check` `^4.9.0` in `pdlc/workflows/package.json`; `captureRun` at
`pdlc/engine/__tests__/loop-cli.test.js:386`; `mkdtempSync(path.join(SCRATCH_ROOT,
".tmp-capture-driver-"))` at `learningsCaptureScript.test.js:215` with `SCRATCH_ROOT =
path.resolve(__dirname, "..")` — i.e. genuinely under `pdlc/workflows/`, as PROP-RO-04 says. No
`statSync`/`lstatSync` exists in `bin/cli.mjs` at HEAD, so PROP-RATIO-05's structural conjunct is a
clean additive assertion. `emitReport` is the sole exit-code producer for report commands,
supporting PROP-CLI-06/PROP-NEG-08.

**PLAN task trace — complete.** PLAN §Batches declares `T-01…T-27` (27 rows); §PLAN tasks carries
27 rows, one per task. No task is untraced and no phantom task appears.

**Test-file status — every claim correct.** All fifteen files declared *new* are absent at HEAD
(`statsPreflight`, `statsDoubles`, `statsArgv`, `statsMetrics`, `statsDiscovery`, `statsRender`,
`statsOutcome`, `statsAntiDrift`, `stats-cli`, `stats-cli-structure`, `stats-read-only`,
`_stats-scratch-prefixes.mjs`, `statsRealPaths`, `statsProperties`, `stats-vendoring`). All five
amended test files plus `publish-preflight.mjs` and `fixture-machine.mjs` are present.

**Internal bookkeeping — exact.** I parsed the property tables and the §Test-level distribution
programmatically: 102 property IDs defined, 102 unique, zero duplicates; the distribution partitions
all 102 with declared counts (5/27/16/19/13/22) matching parsed membership row-for-row; and **every
property's `Level` cell agrees with the level it is filed under** — zero disagreements. §Coverage
Matrix cites all 30 FSPEC BRs, all 29 ATs, all 21 ECs and all 9 `REQ-STATS-*` criteria with nothing
in the upstream left uncited.

**PROP-DRIFT-05's "derived" clause — checked, and correct.** I initially read
"`tspecPackedCount`'s vendored class size … **derived** from `MODULE_NAMES` rather than transcribed"
as an implementation echo that would disarm the count oracle. It is not.
`loop-distribution.test.js:186` computes `vendoredClassSize = tspecPackedCount({licence:false}) −
(4 + 15 + 1)`, so the subject comes from `_tspec-packed-set.mjs`'s **transcribed** literal
(`4 + 15 + 5 + 1`, which PLAN T-22 moves to `4 + 15 + 6 + 1`) while the expectation comes from the
independent production enumeration `MODULE_NAMES`. `MODULE_NAMES.length + 1 = 5` equals today's
vendored class size, and both move to `6` together. That is a cross-enumeration tie between two
independently maintained lists, not a value derived from the code under test — the co-change signal
survives. DEC-STATS-01 K-2's note that the count is "deliberately derived from class sizes, not from
`tspecPackedSet().length`" is preserved rather than contradicted. **No finding.**

**Read-only feasibility.** PROP-RO-01/03/04 snapshot the repository root, which invites cross-suite
flake. I checked: no engine test writes repo-root-relative scratch, `pdlc/engine`'s suite is
`node __tests__/_run-suite.mjs` (serial), and CI runs the workflows and engine suites as separate
jobs. `.tmp-*` is the only in-tree scratch prefix, which is exactly what PROP-RO-04 declares. The
stance is feasible as specified. **No finding.**

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
