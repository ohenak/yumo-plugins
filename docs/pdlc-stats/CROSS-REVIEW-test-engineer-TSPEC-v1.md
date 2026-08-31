# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1

## Summary

Reviewed through the testing lens only: testability of the design, oracle falsifiability,
completeness of the test strategy against FSPEC's decided observables, and TDD/coverage posture.
Architecture choice (§2.1's three-option table), module placement economics and the vendoring
cost argument are the software-engineer's lens and are not contested here.

Every claim this review makes about existing repository behavior was checked against HEAD, and the
`file:line` anchor is given in the finding. Four High findings all sit in §6.4/§6.5 — the four
anti-drift oracles and the read-only oracle. Those five oracles carry the whole verification weight
of REQ C-5, BR-26 and BR-28; as written, two of them assert something false at HEAD, one cannot
detect the drift it exists to detect, and one is flaky against this repository's own test suite.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | §6.4's doc-type catalogue oracle probes `parseReviewFilename("CROSS-REVIEW-se-review-{T}-v1.md")` and asserts it parses `ok`. At HEAD that probe returns `{ok:false, reason:"bad_role"}` for all six doc types: `se-review` is a **reviewer skill id**, not a role slug. The closed catalogue is `Object.values(MAP)` = `software-engineer`, `product-manager`, `test-engineer` (`pdlc/workflows/orchestrate-dev.js:10038-10044`), validated at `:10143`. The oracle as specified is red against a correct implementation. | §6.4, row 2 |
| F-02 | High | Local | §6.4's vendoring oracle asserts "`tspecPackedCount`'s vendored class size equals that list's length", deriving from `MODULE_NAMES`. The two enumerations are not the same length and never were: `MODULE_NAMES` has **4** members (`pdlc/engine/scripts/prepack.mjs:20-25`) while the packed vendored class has **5** (`pdlc/engine/__tests__/_tspec-packed-set.mjs:51-57`) because `vendor/workflows/VENDOR-MANIFEST.json` is a packed member with no source module. After this feature the numbers are 5 and 6. The equality asserted is false by construction; the true invariant is `vendoredClassSize === MODULE_NAMES.length + 1`, and `tspecPackedCount` is a hand-written sum (`:98-100`) that must be co-edited. | §6.4, row 3; §2.1 |
| F-03 | High | Cross-Feature | §6.4's catalogue oracle is a **containment** check, not the set-equality its own stated purpose requires. Probing that six known types are accepted and one known-rejected token (`REVIEW`) stays rejected cannot detect "a seventh type the driver accepts is missing from the row set" — a driver adding `SIZING` to `REVIEW_DOC_TYPES` (`orchestrate-dev.js:10105-10112`) leaves every probe green while `REVIEW_DOC_TYPE_ROWS` silently under-reports a whole row. RK-3's entire mitigation rests on this oracle. A set-equality is reachable (export the catalogue, or probe a derived candidate set); a fixed-probe containment test is not. | §6.4, row 2; §8.2 RK-3 |
| F-04 | High | Cross-Feature | §6.5's read-only oracle snapshots "every path under the repository root except `.git/`" around one invocation. This repository's own workflows suite writes **inside the tree** while it runs: `learningsCaptureScript.test.js:212,215` creates `.tmp-capture-driver-*` scratch directories under `pdlc/workflows/` (deliberately — jest's ESM loader refuses a specifier outside `rootDir`) and removes them in `afterEach`. `npm test` (`pdlc/workflows/package.json:7`) runs test files in parallel workers with no `--runInBand`; only `test:coverage` serialises. A concurrent worker creating or deleting a scratch path inside the snapshot window fails AT-21/AT-22 for a reason unrelated to `stats`. §6.5 names the *stale untracked file* flake and closes it, but not the *concurrent write* flake, which is the one this suite actually produces. The TSPEC must specify the isolation (dedicated serialised worker, or a snapshot root that excludes the suite's own declared scratch prefixes) — the scope itself is FSPEC-fixed by AT-21 and cannot be narrowed here. | §6.5 |
| F-05 | Medium | Local | The two oracles' subjects are unreachable from a test. §6.4 row 1 asserts `statsParsers()`'s members are `===` the driver exports and row 4 asserts `statsIo()` returns exactly four keys, but §3.4 declares `cmdStats` (and by implication its two helpers) as module-private `async function`s, and `bin/cli.mjs` exports only `launch`, `launchInputs`, `launchMoveFor` and friends. §3.4's "three edits to `bin/cli.mjs`, all additive" does not include exporting either helper. As specified, neither oracle can be written. | §3.4, §6.4 |
| F-06 | Medium | Local | §3.4's `cmdStats` listing has no `try`/`catch`, but §5's last row produces its observable "at the outermost `try`/`catch` in `cmdStats`" — the row that guarantees "never a stack trace on stdout in `--json` mode" at exit 1. The document's own implementation sketch contradicts the error table it is meant to satisfy, and the sketch is the artifact an implementer transcribes. Name the wrapper in the listing, and name the test that drives an injected throw through it. | §3.4, §5 |
| F-07 | Medium | Local | `schemaVersion` appears **nowhere** in this TSPEC. FSPEC BR-24 makes it an integer top-level key of every JSON document; BR-21 (§4 line 410), BR-23 (line 449) and BR-30 (line 502) all put it in an **exact** top-level key set, and AT-19 and AT-27 assert those sets set-equal. Neither `StatsReport` nor `FeatureStats` (§4.1, §4.2) carries it, §3.3's `renderJson` contract does not mention it, and §6.2's render level says only "key sets". A decided observable with an exact-set oracle has no home in the data model. | §4.1, §4.2, §3.3 |
| F-08 | Medium | Local | §4.3's byte-ratio harvested test is `harvested && (crossReviews.length === 0 \|\| dodReviews.length === 0)` where `crossReviews` is grammatical membership (`parseReviewFilename(...).ok`). FSPEC BR-16 words the same condition as "no `CROSS-REVIEW-*` file **remains**". The two diverge on a directory where harvest deleted the grammatical cross-reviews but a Phase CR `CROSS-REVIEW-{role}-REVIEW-v{N}.md` survives: TSPEC computes `harvested`, BR-16 read literally does not. §4.3 (lines 502-505) argues the grammatical reading for BR-14's byte sets but never carries the argument to BR-16's test, and no AT covers the boundary. Decide it, state it, and name the fixture. | §4.3 (byte ratio) |
| F-09 | Medium | Local | PROP-3 cannot falsify what it claims. Two `runStats` calls over the same tree in the same process produce identical bytes even when a `Set` or object-key iteration *does* reach the output — JS `Map`/`Set` iteration is insertion-ordered and object key order is deterministic within a run. The stated falsification target ("any set- or object-key iteration reaching the output (BR-09, BR-13, BR-18 ordering claims)") needs a **permutation** property: generate the listing, shuffle it, assert `stdout` is byte-identical across permutations. That falsifies a row order derived from listing order; the current statement falsifies nothing. | §6.6 PROP-3 |
| F-10 | Medium | Local | BR-26's decided conjunct is that the exclusion set is "**checked set-equal** against the non-feature directories present at the `docs/` root" (FSPEC line 472). §4.4 asserts the eight are exactly that set **in prose** ("All eight are present … and they are exactly the non-feature directories there") and §6.4's four anti-drift oracles do not include it. AT-19 covers the *unclassified reporting* half, not the set-equality half. An enumerated contract stated in prose with no oracle is the exact failure §6.4's own header calls out. | §4.4, §6.4 |
| F-11 | Medium | Local | The halt matcher `^POSTMORTEM-(.+?)-{escapedFeature}\.md$` (§4.3) escapes the feature but leaves the phase capture open, so a basename with extra segments before the feature name still matches and reports the surplus as the phase (`POSTMORTEM-D-pdlc-stats.md` under feature `stats` → phase `D-pdlc`). This is asymmetric with the DoD matcher, which §4.3 correctly praises for being fully anchored so a foreign-feature `CODE_REVIEW-` contributes nothing (verified: `orchestrate-dev.js:12386-12388`). BR-12's "phase taken verbatim, no validation" may well be the right answer, but the asymmetry is undecided here and has no negative test. | §4.3 (halts) |
| F-12 | Low | Local | §4.1 declares `ReviewRounds.malformed` as "basenames, listing order, **deduped**"; §4.3's producer is a plain `basenames.filter(...)` with no dedup step. A directory listing cannot repeat a name, so the two agree in practice — but the type comment states a guarantee the code shown does not implement, and a property test written from §4.1 (dedup) would not be satisfied by the algorithm in §4.3. Drop the word or add the step. | §4.1, §4.3 |
| F-13 | Low | Local | Two `cwd` sources with no stated precedence: §3.3's `parseStatsArgv` returns a `cwd: string \| null` field, and §3.4's `cmdStats` independently resolves `readFlag(argv, "cwd")` and passes `cwd` into `runStats`. §2.2's layering diagram compounds it, showing `statsIo({cwd})` where §3.4 calls `statsIo()`, and omitting `cwd` from `runStats`'s argument bundle that §3.3 declares. One of the two readers wins; say which, and pin it with a test that passes `--cwd` and a differing `process.cwd()`. | §2.2, §3.3, §3.4 |
| F-14 | Low | Local | §6.1 promises real-path literals are "measurements of the archive … re-measured if the archive changes", but records only the *fixture inventories*, never the *asserted values*. AT-09's own expected `TSPEC` row (`6`, verified: `docs/completed/pdlc-advisory-wave-gate/` carries `CROSS-REVIEW-{product-manager,test-engineer}-TSPEC-v1…v6.md`), AT-11's `2` and AT-14b's `D, F, I, T` are the numbers that go stale. Record the measured values alongside the inventories so RK-4's "re-measure" has a baseline to compare against. | §6.1, §8.2 RK-4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §6.4 row 1's identity oracle asserts `===` against the driver exports, while §6.1's default double is `recordingParsers(real)`, which **wraps** them. Is the wrapper ever passed through a production construction path in any test, and if so what stops a future refactor from making the wrapper the production bundle? A one-line assertion that `statsParsers()` is never the recording double would close it. |
| Q-02 | §6.6's mutation list includes "dropping the `- 1` from either of the two driver-index conversions". For the DoD conversion, dropping `- 1` turns a 0-round feature's `1` into `1` where the harvested branch would otherwise fire — which test in the AT set goes red for that mutation specifically? Naming it makes the mutation claim checkable rather than aspirational. |
| Q-03 | §6.2 lists a "Process" level running `main([...])` in-process. AT-24 asserts stdout is empty on a usage error, but `checkFlags` writes via `console.error` (`pdlc/engine/bin/cli.mjs:1012-1019`) and sets `process.exitCode` on the **shared** process. How is `process.exitCode` reset between legs so a usage-error test does not colour a later leg's exit assertion? `cli.test.js` presumably has the idiom; cite it. |
| Q-04 | Does the fleet-mode per-feature `try`/`catch` (§5 rows 6-7) wrap `discoverFeatures` too, or only `computeFeatureStats`? A throw from the `docs/completed/` listing inside discovery is neither a root failure nor attributable to one feature, and the error table has no row for it. |

## Positive Observations

- **The parser-injection-plus-identity-oracle pattern is the right shape for REQ C-5.** §2.5's argument — that behavioral equivalence passes for a re-implementation that agrees on today's corpus, so only reference identity enforces the constraint — is exactly right, and it is the reason F-01/F-05 are worth fixing rather than dropping: the oracle is the correct oracle, just unreachable and mis-probed as written.
- **Verified: all four driver classifiers exist, are exported, and have the shapes §1's table transcribes.** `parseReviewFilename` (`orchestrate-dev.js:10134`), `deriveRoundWindow` (`:10192`), `deriveDodRoundIndex` (`:12384`), `parseResolvedMarker` (`:7601`). The two arithmetic claims check out at the source: `startIndex = indices.length ? Math.max(...indices) + 1 : 1` (`:10238`) makes BR-05's "highest present" exactly `startIndex - 1` and `0` for an empty type, and `return max + 1` (`:12396`) makes BR-10's highest version exactly `deriveDodRoundIndex(...) - 1`. Deriving two metrics by subtraction from a shipped function instead of re-deriving a grammar is the single best decision in this document.
- **§3.2's note 1 is a genuine, verified catch.** `deriveRoundWindow` really does return early on the round-1 collision (`:10225-10231`) with no `skipped` array, so taking BR-06's malformed list from `w.skipped` would silently drop malformed basenames on exactly the features that most need them. Routing the malformed list through a separate `parseReviewFilename` pass is correct and is the kind of finding that only comes from reading the callee.
- **The seam bundle carries no write capability, and the argument is structural rather than a promise.** "There is no API through which a write could be attempted" (§5) is a much stronger claim than "the implementation does not write", and §6.4 row 4's four-key assertion is the right guard on it.
- **The coverage posture is verified, not asserted.** `pdlc/workflows/package.json`'s `test:coverage` really does run a second `c8 report --check-coverage --per-file --branches 85` pass, so adding `lib/stats.mjs` to `c8.include` genuinely subjects it to an 85 % per-file branch floor rather than letting it hide in `orchestrate-dev.js`'s aggregate. The gate command is named, not inferred from source-list membership.
- **Property-based testing is present, at the right level, with `fast-check` already a dev dependency** (`package.json:13`) and precedent in the suite (`learningsConfig.test.js`, `advisoryHelperProperties.test.js`). PROP-1's partition property is a real invariant over generated input, not an example dressed up.
- **§5's error table names a produced value and a catch site per row**, and the EC-21 row explicitly explains why the catch-all placement is load-bearing ("a guard placed around the `listDir` call alone would pass the first leg and fail this one") — which is precisely AT-20's second leg, correctly read.
- **Every CLI mechanism §3.4 claims to reuse exists and behaves as described**: `VALUE_FLAGS` contains `cwd` and not `json` (`bin/cli.mjs:141-160`), `checkFlags` writes `USAGE` and the error to stderr and sets `exitCode = 1` with nothing on stdout (`:1012-1019`), and `launch()` opens with `if (cmd !== "dev" && cmd !== "queue") return runMain(argv)` (`:1329-1330`), so `stats` really does bypass the version-resolution ladder.

## Recommendation

**Needs revision**

Four High findings, all in the verification layer (§6.4, §6.5). None touches the design's shape —
the module boundary, the seam bundle, the injected-parser pattern and the metric arithmetic are
sound and, where they make claims about the driver, verified true at HEAD. What needs another pass
is the set of oracles those claims are supposed to be held to:

1. **F-01** — replace `se-review` with a real role slug (`software-engineer`, `product-manager` or
   `test-engineer`) in the catalogue probe, or the six-type assertion is red on day one.
2. **F-02** — restate the vendoring oracle's invariant as `vendoredClassSize === MODULE_NAMES.length + 1`
   (the `VENDOR-MANIFEST.json` member), and say that `tspecPackedCount`'s hand-written sum is the
   thing being checked.
3. **F-03** — make the catalogue oracle a set-equality over the driver's doc-type catalogue, not a
   fixed-probe containment check; it is RK-3's only mitigation.
4. **F-04** — specify how AT-21/AT-22's whole-tree snapshot is isolated from the suite's own
   in-tree scratch writes (`.tmp-capture-driver-*` under `pdlc/workflows/`) under a parallel
   `npm test`.

The seven Medium findings are worth folding into the same revision — F-05 and F-06 are one-line
additions to §3.4, F-07 is a missing field in §4's data model that two exact-key-set ATs depend on,
and F-08/F-11 are two undecided boundaries that will otherwise be decided silently by whoever
implements them.

## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 7, "low": 3}
