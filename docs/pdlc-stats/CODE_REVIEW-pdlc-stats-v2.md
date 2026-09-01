# CODE REVIEW — pdlc-stats (v2)

| Field | Detail |
|---|---|
| Feature | pdlc-stats |
| Branch | feat-pdlc-stats |
| Review version | 2 |
| Date | 2026-08-31 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 96.27% (`pdlc/workflows/lib/stats.mjs`, carried forward — remediation was comment-only) |
| Requirements traced | 22/22 |

Scope: delta re-verification of the remediation for `CODE_REVIEW-pdlc-stats-v1.md`, covering commits `c11c1e863` (PROP-RATIO-11 end-to-end test) and `e10acc4a2` (stats.mjs header) since the v1 commit `d7b0d1919`. Diff is 2 files, +94/−10: `pdlc/engine/__tests__/stats-cli.test.js` (+86) and `pdlc/workflows/lib/stats.mjs` (+8/−10). Unchanged code verified in v1 was not re-scanned.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Adjacent-surface falsification (crit. 6a) | low | `pdlc/engine/__tests__/stats-cli.test.js:4-18` | File header still narrates the pre-implementation state: "RED at T-09: `stats` is not yet a case in `bin/cli.mjs`'s `main()` switch (TSPEC §3.4's 'Four edits, all additive' have not landed)… Until then every test in this file fails for that one reason." All three claims are false at branch tip — `bin/cli.mjs` carries `statsParsers:1272`, `statsIo:1291`, `cmdStats:1320` and `case "stats":1361`, and every test in the file passes. The remediation commit appended a *passing* test (PROP-RATIO-11) to this file, extending the reach of the header's false universal quantifier. | Rewrite the header to describe delivered behaviour, as `e10acc4a2` did for `stats.mjs`. Keep the load-bearing TSPEC references (§3.4, §5, §6.2) and the in-process/`--cwd` rationale; drop only the "not yet landed / every test fails" narrative. | Cross-Feature |
| 2 | Adjacent-surface falsification (crit. 6a) | low | `pdlc/engine/__tests__/stats-cli-structure.test.js:4-10, 437-441` | Same defect class, sibling member. Header claims "RED at T-10: `bin/cli.mjs` carries no `stats` surface at all yet (no `statsParsers`, no `statsIo`, no `cmdStats`) — that lands in T-17", and that every stats-seam oracle "is therefore committed `test.skip` … un-skip each block exactly when T-17 lands". Both false: the seam exists, and the file contains **zero** actual skips — the only two `test.skip` occurrences (`:7`, `:441`) are inside these comments, and the suite's 2 skips are the unrelated `PDLC_LIVE=1` opt-in tests. The block comment at `:437-441` repeats the claim. | Rewrite both narratives to describe the delivered oracles. Retain the TSPEC §6.4 references and the classifier-purity exception note. | Cross-Feature |

No new stubs, TODO/FIXME/HACK/XXX markers, `NotImplementedError`, coverage-exemption pragmas, mock/fake data, unwired integrations or placeholder URLs were introduced by the remediation diff.

## §2 Requirements Traceability

Carried forward from v1. Only row 19 was touched by the remediation; it now closes. `lib/stats.mjs` line references are shifted −2 throughout because the header edit is net −2 lines (verified: `computeReviewRounds:218`, `computeDodRounds:253`, `computeHalts:267`, `computeByteRatio:287`, `findFeatureDir:396`, `ratioToken:508`, `renderSingleHuman:544`, `renderJson:615`).

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ-STATS-01 | Single-feature human-readable table (rounds, DoD, halts, ratio) | `lib/stats.mjs:544` `renderSingleHuman` | `workflows/__tests__/statsRender.test.js` (60 assertions); real-path smoke verified | No | — | — |
| 2 | REQ-STATS-02 | `--json` mode, top-level key set set-equal to the printed metric set + `schemaVersion` | `lib/stats.mjs:615` `renderJson` | `statsRender.test.js:128,143` — hand-transcribed literal, set-equality both directions | No | — | — |
| 3 | REQ-STATS-03 | Review rounds per doc type across all roles; malformed bucket separate | `lib/stats.mjs:218` `computeReviewRounds` | `statsMetrics.test.js` (40 assertions); `statsRealPaths.test.js:48,67` real-corpus literals | No | — | — |
| 4 | REQ-STATS-04 | DoD rounds = highest `N` on disk, not file count | `lib/stats.mjs:253` `computeDodRounds` | `statsMetrics.test.js`; `statsRealPaths.test.js:87` (pdlc-loop-economics ⇒ exactly `2`, not `3`) | No | — | — |
| 5 | REQ-STATS-05 | One entry per phase, resolved/open by the driver's `RESOLVED:` rule; `0` when none | `lib/stats.mjs:267` `computeHalts` | `statsMetrics.test.js`; `statsRealPaths.test.js:96` | No | — | — |
| 6 | REQ-STATS-06 | Process/spec byte ratio; not-available on zero denominator; harvested precedence | `lib/stats.mjs:287` `computeByteRatio` | `statsMetrics.test.js` (removal probes); `statsOutcome.test.js` | No | — | — |
| 7 | REQ-STATS-07 | Fleet mode; directories only; `completed` traversed not reported; gaps explicit | `lib/stats.mjs:358` `discoverFeatures`, `:450` fleet loop | `statsDiscovery.test.js`; `statsRealPaths.test.js:145`; real-path smoke | No | — | — |
| 8 | REQ-STATS-08 | Read-only, no network, no git writes, on every path | `bin/cli.mjs:1291` `statsIo()` — exactly `readdirSync`/`lstatSync`/`readFileSync`/`existsSync` | `engine/__tests__/stats-read-only.test.js` (before/after tree snapshots, success + failure paths) | No | — | — |
| 9 | REQ-STATS-09 | Unknown feature exits non-zero, named, never truncated partial JSON | `lib/stats.mjs:430` `not_found` | `engine/__tests__/stats-cli.test.js`; smoke: `stats nope --json` ⇒ exit 1, 3-key error object | No | — | — |
| 10 | REQ C-1 / C-2 / C-3 / C-4 / C-5 | Read-only; live-over-archived preference never summed; fixed spec set; configurable process set; driver-parser fidelity | `lib/stats.mjs:396` `findFeatureDir`; parsers injected, never re-implemented | `stats-cli-structure.test.js:447` (`===` identity with `orchestrate-dev.js` exports), `:456` (pass-through), `:221` (single construction site) | No | — | — |
| 11 | PROP-CLI-01…08 | Argv surface, closed flag set, exit codes ∈ {0,1}, cwd resolved once, unexpected-throw handling | `lib/stats.mjs:143`; `bin/cli.mjs` `FLAGS_BY_COMMAND.stats`, `cmdStats`, `USAGE` line | `statsArgv.test.js`; `stats-cli.test.js`; `stats-cli-structure.test.js` | No | — | — |
| 12 | PROP-DISC-01…10 | Discovery: preference byte-identity, directories only, `completed` as container, unclassified bucket, ordering, empty root | `lib/stats.mjs:358` | `statsDiscovery.test.js`; `statsRealPaths.test.js` | No | — | — |
| 13 | PROP-RR-01…13 | Round derivation, malformed partition, collision `unmeasurable`, per-doc-type harvested, frozen row set | `lib/stats.mjs:218`, `:181` | `statsMetrics.test.js`; `statsAntiDrift.test.js`; `statsRealPaths.test.js` | No | — | — |
| 14 | PROP-DOD-01…04 | Highest version wins; harvested vs `0`; leftovers contribute nothing | `lib/stats.mjs:248,253` | `statsMetrics.test.js`; `statsRealPaths.test.js:87` | No | — | — |
| 15 | PROP-HALT-01…08 | Per-phase entries, fail-closed `open`, `[^-]+` phase capture, verbatim phase id, code-unit ordering | `lib/stats.mjs:267` | `statsMetrics.test.js`; `statsRealPaths.test.js` | No | — | — |
| 16 | PROP-RATIO-01…03, 06…10 | Membership by removal probe, neither-list files inert, harvested-before-zero precedence, one rounded value in both modes | `lib/stats.mjs:287`, `:208` `round2`, `:508` `ratioToken` | `statsMetrics.test.js`; `statsRender.test.js` | No | — | — |
| 17 | PROP-RATIO-04 | Symlink contributes its own size — behavioural, on `realStatsIo()` | `lib/stats.mjs:296` `sizeOf` | `statsRealPaths.test.js:150-181` | No | — | — |
| 18 | PROP-RATIO-05 | `bin/cli.mjs` whole source matches boundary-anchored `statSync(` zero times — structural | `bin/cli.mjs:1302` `statsIo().fileSize` (`lstatSync`) | `stats-cli-structure.test.js:512-552` | No | — | — |
| 19 | PROP-RATIO-11 | Symlink size taken from the SHIPPED seam, driven end-to-end via `main(["node","pdlc","stats",{feature},"--json","--cwd",{tempRoot}])` over a temp root holding a small regular file plus a symlink to an order-of-magnitude larger target; reported total must equal the link's own `lstat` size. | `bin/cli.mjs:1302` `statsIo().fileSize` | `engine/__tests__/stats-cli.test.js:489-574` — **verified RED under mutation** (see §3) | No | — | — |
| 20 | PROP-RENDER-01…06 | Single/fleet layouts, `none` line, ratio line carries byte totals, gap+unclassified rows inline | `lib/stats.mjs:525-583` | `statsRender.test.js` | No | — | — |
| 21 | PROP-JSON-01…10 | One document, empty stdout on usage error, key set-equalities, states inside their metric, `schemaVersion === 1` | `lib/stats.mjs:615` | `statsRender.test.js`; `statsOutcome.test.js`; `stats-cli.test.js` | No | — | — |
| 22 | PROP-ERR-01…10, PROP-RO-01…06, PROP-DRIFT-01…07, PROP-PBT-01…04, PROP-NEG-01…04 | Refusal corpus and reason set-equality, read-only snapshots, parser reference identity, vendoring membership, bounded generative properties, negative properties | `lib/stats.mjs:407-460`; `bin/cli.mjs` `statsParsers`/`statsIo`/`cmdStats`; `prepack.mjs`/`publish-preflight.mjs`/`fixture-machine.mjs` | `statsOutcome.test.js`; `statsProperties.test.js` (fast-check, 24 uses); `stats-read-only.test.js`; `stats-cli-structure.test.js`; `stats-vendoring.test.js`; `coverageInstrumentation.test.js` | No | — | — |

## §3 Verification of v1 Findings

**v1 §1 #1 — stale `stats.mjs` task-narrative header (low) — REMEDIATED.** `e10acc4a2` replaced the T-12 narrative with a "Delivered surface" paragraph. Every claim in the new header was checked against the file rather than taken on trust: all six TSPEC §3.3 exports are defined (`parseStatsArgv:143`, `computeFeatureStats:318`, `discoverFeatures:358`, `runStats:470`, `renderHuman:591`, `renderJson:615`) and both frozen constants are present (`REVIEW_DOC_TYPE_ROWS:181`, `NON_FEATURE_DIRS:191`). The load-bearing TSPEC navigation references (§3.1, §3.2, §4.1, §4.2) were retained as the v1 note required, and the false "land in later tasks … not defined here" clause is gone. Comment-only; no code or test change, consistent with the finding's stated remedy.

**v1 §2 #19 / PROP-RATIO-11 — missing end-to-end symlink test (medium) — REMEDIATED, and load-bearing.** `c11c1e863` adds `stats-cli.test.js:489-574`, which builds a `mkdtemp` root with one small regular spec file and one process-side member that is a symlink to a 20 000-byte target written *outside* the feature directory, then drives the real `main(["node","pdlc","stats",…,"--json","--cwd",root])`. It asserts `byteRatio.processBytes === lstat(link).size`, plus the falsifier `processBytes < targetBytes`, plus `state === "measured"`. This is not an assertion-free or stub-backed test: I confirmed it goes **RED** by mutating the shipped seam at `bin/cli.mjs:1302` from `lstatSync` to `statSync` and running the test in isolation — it failed with the target-size falsifier, exactly the defect the property exists to catch. The seam was restored (`git diff --quiet bin/cli.mjs` clean) and the full engine suite re-run green afterwards. Engine suite: **928 tests, 926 pass, 0 fail, 2 skipped** (the 2 skips are the unrelated `PDLC_LIVE=1` opt-in live tests, not stats oracles) — up exactly one passing test from v1's 925.

**Criterion 4 (carried forward, not re-measured).** The workflows suite was re-run: **163/163 suites passed, 5121 passed, 70 skipped, 0 failed**. The `npm run test:coverage` process then hung on Jest's known "did not exit one second after the test run has completed" open-handle condition and was killed manually, so its shell exit status (1) reflects that kill, **not** a failing test or a breached threshold — no coverage table was emitted in that run. The v1 figure is carried forward rather than re-measured, which is sound here because the remediation changed **zero executable lines** in `stats.mjs`: filtering the diff for changed lines that are not `//` comments yields 0. Comments carry no branches, so `stats.mjs` branch coverage is necessarily still v1's 96.27%. A reviewer wanting an independently measured number should re-run the coverage gate in CI, where the `Unit tests (ubuntu-latest, node 20)` leg runs it under c8 with the `--per-file --branches 85` threshold.

## §4 Criterion-6 Integration Boundary (diff-scoped)

**(a) Adjacent-surface falsification.** The `stats.mjs` header fix is correct in itself and its own family sweep is clean: `grep` for `not defined here` / `land in later tasks` / `lands in T-` across `pdlc/workflows/lib/` and `pdlc/engine/bin/` now returns nothing. However, extending that sweep to the branch's changed **test** files — the same stale-task-narrative family, which v1's sweep did not cover because it was scoped to `lib/` and `bin/` only — surfaces the two sibling members recorded as §1 #1 and #2. Both are falsified by T-17 having landed, verified against `bin/cli.mjs` (`statsParsers:1272`, `statsIo:1291`, `cmdStats:1320`, `case "stats":1361`) and against the actual skip state (zero real skips in the structure file). These are pre-existing rather than introduced by the diff, but the remediation appended a passing test to one of the two files without correcting its "every test in this file fails" claim, so the diff extends the falsehood it should have swept.

**Runtime artifact.** `stats.mjs` is a workflow source, so the repo rule that `pdlc/workflows/dist/` be rebuilt in the same commit applies. Checked: `node pdlc/workflows/build-runtime.mjs --check` reports `in-sync` and exits 0, and `stats.mjs` is not bundled into `dist/pdlc-cli.mjs` at all (zero matches for `stats.mjs`/`parseStatsArgv`, and zero occurrences of the old header text), so no staleness is possible from this edit. Correctly no `dist/` churn in the diff.

**Multi-writer sweep.** The traced artifact for PROP-RATIO-11 is `pdlc stats`'s stdout. `bin/cli.mjs` remains its only writer; the new test pins the final operator-visible JSON document out of `main()`, not a node/builder return value, and does so under the shipped `statsIo()` rather than a fixture seam — precisely the real-config smoke the criterion asks for.

**(b) Deferral binding.** Untouched by the diff and re-confirmed intact: `docs/_queue/QUEUE.md` rows 28 (`pdlc-review-tightenings`), 29 (`pdlc-queue-autoresolve`) and 30 (`pdlc-phase-g`) all carry `pdlc-stats` in their depends-on column, and all three successor REQ files exist on disk. No unbound deferrals.

## Notes for the remediator

Both findings are comment-only edits in test files; neither is a correctness defect in shipped behaviour, and no production code or assertion should change.

1. **§1 #1** — `pdlc/engine/__tests__/stats-cli.test.js:4-18`. Rewrite the "RED at T-09 / Until then every test in this file fails" narrative to describe what the file now pins. Keep the TSPEC §3.4/§5/§6.2 references and the paragraph explaining why the tests run in-process through `main([...])`, which is still true and still load-bearing.
2. **§1 #2** — `pdlc/engine/__tests__/stats-cli-structure.test.js:4-10` and `:437-441`. Same treatment. Note the `test.skip` instruction is doubly stale: the blocks were correctly un-skipped when T-17 landed, so delete the un-skip instruction rather than acting on it. Keep the TSPEC §6.4 reference and the classifier-purity exception.

Apply the same one-line sweep `e10acc4a2` should have carried before re-verification: `grep -nE "RED at T-|not yet|have not landed|Until then|lands? in T-" $(git diff --name-only main...HEAD | grep -E '\.(mjs|js)$')` should return nothing.
