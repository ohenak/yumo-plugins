---
feature: pdlc-stats
---

# PLAN — pdlc-stats

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` (`docs/completed/pdlc-stats/REQ-pdlc-stats.md`, `FSPEC-pdlc-stats.md`, `TSPEC-pdlc-stats.md`, `DECISIONS-pdlc-stats.md`) |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-PLAN[-v{N}].md` |
| LEARNINGS | `docs/completed/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | se-author | 1.4 | 2026-08-31 |

**v1.4 (round 5, erratum round).** Addresses `CROSS-REVIEW-product-manager-PLAN-v5.md` (`VERDICT: Approved with minor changes`) and `CROSS-REVIEW-test-engineer-PLAN-v5.md` (`VERDICT: Approved`). **Upstream re-grounded first, and upstream had moved twice past this dispatch's own snapshot:** the dispatch pinned TSPEC `sha256:7b119eb7…`, but TSPEC at HEAD is `sha256:f32d9cb5…` (**v1.8**); REQ (`f75c348f…`, v1.7), FSPEC (`a493133f…`, v1.8) and DECISIONS (`ca3f7219…`) match the dispatch. No new `BR-`, `E-` or `AC-` row and no vocabulary rename arrive with the move — TSPEC v1.8 only absorbs the REQ-STATS-06-versus-BR-16 withdrawal that v1.3 had already re-grounded on, closing §8.3's second bullet as discharged and moving its count word two → one. Both v5 reviewers measured the PLAN at `sha256:87b439ea…`, the pre-v1.3 bytes, so all four of their findings are answered on their decided form rather than re-raised: pm F-01 (T-24's backticks around `lib/`) and pm F-02 (T-23's `assertAdditiveOnly` anchor) were **already** fixed by v1.3 and take no new write; te F-01 routes to TSPEC's own phase and TSPEC v1.8 has since discharged it; te F-02 asks for a re-stamp inside `CROSS-REVIEW-…-PLAN-v4.md`, a reviewer-owned artifact this document does not write.

Two edits land, both from re-grounding rather than from the v5 item list, which the erratum round treats as a floor. T-10's justification for its whole-file `statSync` conjunct was measured against a `bin/cli.mjs` that no longer exists: it asserted the file "contains neither `statSync` nor `lstatSync` anywhere" and pinned a raw `:262` line anchor (itself a `DEC-DOC-01` misuse, and off by five at HEAD). T-17's edits have since landed, so at HEAD the file carries `nodeFs.lstatSync(absPath).size` in `statsIo()` and a bare `statSync` in that function's doc comment. The conjunct itself is **unchanged and not re-litigated** — the boundary-anchored `/(?<![A-Za-z])statSync\s*\(/` still yields zero matches over the whole source, re-measured at HEAD — but the row now says *why* on the anchors themselves rather than on a baseline property that has expired, and records that comment- or string-masking is therefore not owed. Separately, the `Status` column is declared a planning-time ledger that is **not maintained during implementation**, with the branch's `feat(pdlc-stats): T-NN` commits named as the authoritative record; it is stated rather than hand-reconciled because a mid-wave sync goes stale on the next commit and a partially-updated column misreads as authoritative to a DoD reviewer.

**v1.3 (round 4 revision).** Addresses `CROSS-REVIEW-product-manager-PLAN-v4.md` and `CROSS-REVIEW-test-engineer-PLAN-v4.md` (both `VERDICT: Approved with minor changes`). The Verification section's AT-15 coverage cell names `T-09 (shipped seam, end-to-end)`, so it agrees with the anti-drift table that already recorded T-09's AT-15/EC-19 leg (te F-01). T-24's second-`P9-02` transcription drops the backticks the source string does not carry around `lib/`, and says plainly that `two` is one of the stale count words the task corrects (pm F-02). T-23's `assertAdditiveOnly` citation names the closing `assert.equal`'s `label` template literal and corrects the anchor to the literal at `77` / the statement at `74-78` (pm F-03, te F-02). Batch 10's gate scopes its red signal to TSPEC §6.4's **four enumerations `assertAdditiveOnly` reads** (§2.1 sites 1–4) and states that T-24's same-batch `c8.include` edit is not one of them (te F-04). **Upstream re-grounded first:** TSPEC is at v1.8, which *closes* the REQ-STATS-06-versus-BR-16 erratum — discharged at REQ v1.7, absorbed by FSPEC v1.8 in BR-16's favour, with no expected value moved. Both findings that asked this PLAN to carry that erratum as live work are therefore answered on its **decided** form rather than re-raised: T-04 names AT-17's fourth leg as the site and records that it already carried the winning reading, so no re-stamp is owed (te F-05); the Residual risks table gains a discharged row for it and marks BR-26/EC-10 as the sole erratum §8.3 still carries open (pm F-01). te F-03 (T-23's nine edits versus TSPEC §2.1's eight) was filed as recorded-not-to-be-fixed — the PLAN is the superset and already names the ninth with its rationale — so it takes no edit.

**v1.2 (round 2 revision).** Addresses `CROSS-REVIEW-test-engineer-PLAN-v2.md` (`CROSS-REVIEW-product-manager-PLAN-v2.md` filed no findings — `VERDICT: Approved`). T-09's production-path conjunct gains AT-15's symbolic-link case, so EC-19 has behavioural evidence on the **shipped** seam and not only over T-02's helper and T-10's source text (te F-01); T-10's `lstat`-not-`stat` conjunct names a boundary-anchored `/(?<![A-Za-z])statSync\s*\(/` over the whole file and drops the undelimited "in the `stats` seam" qualifier, because `lstatSync` contains `statSync` and the naive matcher makes the oracle unfalsifiable (te F-02); the Overview's standing-cost premise and T-21's promoted constraint name `documentOracles.test.js` as `document-oracles.mjs`'s **sole** consumer (te F-03); T-24's P9-02 title and T-23's `assertAdditiveOnly` message are transcribed verbatim from source (te F-04); the File Ownership Manifest moves the batch into its own column so every `File` cell is a bare path (te F-05). pm Q-01 is answered by te F-04's fix; pm Q-02's two round-1 questions stay open for harvest and the erratum channel.

**v1.1 (round 1 revision).** Addresses `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v1.md`: AT-15's symbolic-link leg gets a real-fs falsifying test in T-18 plus an `lstat`-not-`stat` structural conjunct in T-10 (te F-01); T-01 cites `pdlc/engine/lib/run.mjs` for `resolveWorkflowRoot` (te F-02); T-04 names the `unmeasurable`/`harvested` mutant's dedicated fixture and T-26 declares it authors no test file (te F-03); T-10 regains the parser-identity pass-through conjunct (te F-04); the "Claims verified" measurements are corrected — three `lib/` modules, 20 helper modules (te F-05, pm F-02/F-04); T-18's dependency rationale states its seam and T-02's `realStatsIo()` gains an equivalence pin (te F-06); T-24 names the second P9-02 test (te F-07); T-09's conjunct takes `--cwd` (te F-08); T-23 counts nine assertion edits and names the ninth (te F-09); the co-change premise and the constraint T-21 promotes are scoped to runtime-reachable modules with `document-oracles.mjs` as the worked exclusion (pm F-01); AT coverage reads "at least one task" (pm F-03). File Ownership Manifest gives T-12…T-16 one row each so the PLAN contract lint parses them.

## Overview

Build `pdlc stats [feature] [--json] [--cwd <path>]`: a read-only reporting subcommand of the engine
CLI that reads a feature's artifact directory and reports four metrics — review rounds by document
type, DoD rounds, halts by phase and resolution, and the process-to-spec byte ratio — in a human
table or as one JSON document, for one feature or for the whole fleet.

**What lands.** One new pure module, `pdlc/workflows/lib/stats.mjs`, holding six exported functions
(`parseStatsArgv`, `discoverFeatures`, `computeFeatureStats`, `runStats`, `renderHuman`,
`renderJson`) and two frozen constants (`REVIEW_DOC_TYPE_ROWS`, `NON_FEATURE_DIRS`) — TSPEC §3.3.
One additive edit set to `pdlc/engine/bin/cli.mjs` (a `stats` row in `FLAGS_BY_COMMAND`, a `case` in
`main()`'s `switch`, a `USAGE` line, and the `cmdStats` / `statsIo` / `statsParsers` functions) —
TSPEC §3.4. No metric logic lives in the CLI; nothing below `cmdStats` reads ambient process state.

**The four driver classifiers are reused, never re-implemented** (REQ C-5). All four already exist
and are already `export`ed in `pdlc/workflows/orchestrate-dev.js` — verified at HEAD:
`parseResolvedMarker`, `parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`. They are
injected as a bundle (`StatsParsers`) and pinned by a reference-identity oracle, per
`DEC-STATS-03`.

**The standing cost this PLAN has to carry.** Adding a module the shipped engine **loads at
runtime** obliges a co-change across the vendoring enumerations, stated once in `DEC-STATS-01`'s
carve-out and cited here rather than restated (`K-6`). The trigger is runtime reachability, not
membership in `pdlc/workflows/lib/`: HEAD already carries the counterexample — `lib/document-oracles.mjs`
sits in that directory, is imported only by `documentOracles.test.js` (`advisoryWaveGate.test.js`
merely names it in a comment, `:140`, and imports nothing from it),
and appears in none of the enumerations below. `stats.mjs` owes the co-change because `bin/cli.mjs`
loads it for `pdlc stats`. T-21 promotes the sweep in exactly this scoped form, with
`document-oracles.mjs` as its worked exclusion. Every site named below was confirmed present at HEAD:

| Site | Symbol | Confirmed at HEAD |
|---|---|---|
| `pdlc/engine/scripts/prepack.mjs` | `MODULE_NAMES` | four entries, ending `lib/escalation-view.mjs` |
| `pdlc/engine/scripts/publish-preflight.mjs` | `WORKFLOW_MEMBERS` | five `vendor/workflows/…` entries |
| `pdlc/engine/scripts/fixture-machine.mjs` | `WORKFLOW_MODULE_NAMES` | four entries |
| `pdlc/engine/__tests__/_tspec-packed-set.mjs` | `WORKFLOW_MEMBERS`, `tspecPackedCount` | five members; `4 + 15 + 5 + 1` |
| `pdlc/workflows/package.json` | `c8.include` | seven `**/`-anchored entries |
| `pdlc/engine/__tests__/loop-distribution.test.js` | baselines, `NEW_LIB_MEMBERS_*`, `vendoredClassWord` | present, `assertAdditiveOnly` live |
| `pdlc/workflows/__tests__/coverageInstrumentation.test.js` | `REQUIRED_INCLUDES` + P9-02's `toEqual` literal | present |
| `pdlc/engine/__tests__/run.test.js` | manifest `deepEqual`s + `scratchWorkflows` copy list | present |
| `pdlc/workflows/__tests__/learningsPremises.test.js` | P-1's `MODULE_NAMES` regex literal | present |
| `pdlc/README.md` | the "four workflow modules it dispatches" prose enumeration | present, no oracle pins it |
| `docs/completed/pdlc-engine-distribution/TSPEC-….md` §5.4 | `PK-*` table, vendored-members note | sibling-document edit, `K-7` |
| `docs/completed/pdlc-engine-distribution/FSPEC-….md` §5.2 | per-class count | sibling-document edit, `K-7` |

The co-change lands as one batch (batch 10) behind one deliberately-red oracle (batch 9), so a
partial edit cannot ship: `DEC-STATS-01` `K-1`'s "partial edit ships an engine whose `pdlc stats`
fails only for installed users" is closed by ordering, not by discipline.

**Test arrangement.** Two suites, two runners, both already in the gate's required-check set:
`pdlc/workflows/__tests__/` under jest + c8 (`Unit tests (ubuntu-latest, node 20)`), and
`pdlc/engine/__tests__/` under `node:test` via `__tests__/_run-suite.mjs`
(`Engine tests (ubuntu-latest)`). Tests that reach the metric functions live in the workflows suite;
tests that drive `bin/cli.mjs` live in the engine suite. Both directions of package-boundary reading
are precedented: `pdlc/workflows/__tests__/learningsPremises.test.js` already parses
`pdlc/engine/scripts/prepack.mjs`'s source.

**Scale.** 27 tasks, 11 batches. Batches 3–7 are a serial chain because
`pdlc/workflows/lib/stats.mjs` is one physical file and batch-safety rule 2 admits one writer per
batch — the same cost `DEC-LOOPECON-08` recorded for `orchestrate-dev.js`, taken knowingly here for
a much smaller file.

## Batches

Status key: ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done.
The `Status` column is a **planning-time** ledger and is deliberately **not maintained during implementation**: the authoritative record of what has landed is the branch's `feat(pdlc-stats): T-NN` commits reachable from HEAD, which a DoD reviewer should read instead of this column. The three `✅` ticks below are incidental and confer no authority; a `⬚` here is not a claim that the task has not landed. This is stated rather than reconciled because a column hand-synchronised mid-wave goes stale again on the next commit, and a partially-updated ledger misreads as authoritative.
`[Fake first]` marks test-double creation. Every file in the `Source File` column is **new** unless
the row says `(exists)`. Red rows do not write their `Source File`; they name the module their
assertions target, and carry `—` where they target nothing yet on disk.

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-01 | **Pre-flight gate (BL-PREREQ).** Assert the four driver classifiers are importable from `pdlc/workflows/orchestrate-dev.js` at HEAD (`parseReviewFilename`, `deriveRoundWindow`, `deriveDodRoundIndex`, `parseResolvedMarker`) and that `resolveWorkflowRoot` is exported from `pdlc/engine/lib/run.mjs` (verified at HEAD: `export function resolveWorkflowRoot` in `pdlc/engine/lib/run.mjs`; `bin/cli.mjs` only *imports* it from `../lib/run.mjs` and does not re-export it, so asserting it on `cli.mjs`'s export surface would red the gate spuriously). **Existence only** — never the new shape a later task creates. Any absent symbol is promoted to blocking work before T-03 runs. | `pdlc/workflows/__tests__/statsPreflight.test.js` | — | 1 | — | ✅ |
| T-02 | **[Fake first]** Shared doubles module: `fakeStatsIo(tree, {throwOn})` (four read seams, **no write member**, per-call-site throw injection), `recordingParsers(real)` wrapping the real driver exports by default, `realStatsIo()` for real-path tests, and the artifact-directory tree builder every fixture uses (TSPEC §6.1). `realStatsIo()` is **not** a free second implementation of the shipped seam: it is written as the same four `node:fs` calls `bin/cli.mjs`'s `statsIo()` makes — `readdirSync(…, {withFileTypes:true})`, `lstatSync(…).size`, `readFileSync`, `existsSync` — and T-10 carries the equivalence conjunct that pins both construction sites to that identical call set (including `lstatSync`, never `statSync`), so a divergence between helper and shipped seam reds rather than hiding. | `pdlc/workflows/__tests__/helpers/statsDoubles.js` | — | 1 | — | ⬚ |
| T-03 | 🔴 `parseStatsArgv` reds: BR-01's closed surface, two-positionals refusal, `--json`/`--cwd` acceptance, `{ok:false,message}` shape. AT-24 (parser half). | `pdlc/workflows/__tests__/statsArgv.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-04 | 🔴 `computeFeatureStats` reds over `fakeStatsIo`: review rounds (AT-07, AT-08, AT-09 fixture leg, AT-25), DoD rounds (AT-12, AT-28), halts (AT-13 companion `RESOLVED: no` leg, AT-14), byte ratio (AT-15 incl. the removal probe, AT-16, AT-17's four directories). **AT-17's fourth leg** is the one assertion site the REQ-STATS-06-versus-FSPEC-BR-16 disagreement over the out-of-catalogue cross-review basename ever reached; TSPEC §8.3 records it **discharged at REQ v1.7 and absorbed by FSPEC v1.8 in BR-16's favour** — an unrecognised basename counts as no file of its family remaining, which is the reading TSPEC §4.3 and AT-17 already carried, so no expected value moves and the implementer owes no re-stamp here. AT-15's **symbolic-link leg is not claimed here** — a fake returns the fixture's declared size and cannot distinguish `lstatSync` from `statSync`; its falsifying test is T-18's real-fs leg, with T-10's structural conjunct naming the call. Named dedicated fixture for TSPEC §6.6's `unmeasurable`/`harvested` mutant: AT-25's round-1 collision **plus** a `LEARNINGS-{feature}.md` sibling in the same directory — the only configuration in which the two branch orders disagree, and not claimable from AT-25's own *Given*. Branch-order conjuncts of TSPEC §4.3 asserted explicitly. | `pdlc/workflows/__tests__/statsMetrics.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-05 | 🔴 `discoverFeatures` reds over `fakeStatsIo`: BR-02 live-before-archive (AT-02), `isDirectory`-only (AT-18's constructed roots, EC-18 case pair, EC-20 empty root), `unclassified` (AT-19 fixture leg), empty-feature row (AT-26). | `pdlc/workflows/__tests__/statsDiscovery.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-06 | 🔴 Renderer reds over hand-built `StatsReport` values: AT-01 block order, AT-05 five-key set, AT-06 cross-mode correspondence **plus** TSPEC §6.3's four conjuncts (exact key sets against literal transcriptions, no `feature`/`dir` leakage, `schemaVersion === 1` as a literal, fleet entry discriminant), AT-14b's literal `D, F, I, T` and `P, PR` sequences, AT-19's three-key fleet document, AT-23's three-key error document. | `pdlc/workflows/__tests__/statsRender.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-07 | 🔴 `runStats` reds over `fakeStatsIo`: flows A/B/C, AT-03 subdirectory byte-identity, AT-04 single-document stdout, AT-20 gap rows (both the read-failure leg and EC-21's catch-all leg), AT-26 fleet row, AT-27's fleet half and its eight root-failure runs, exit codes `0` and `1` only. | `pdlc/workflows/__tests__/statsOutcome.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ⬚ |
| T-08 | 🔴 Anti-drift reds (TSPEC §6.4, workflows half): doc-type catalogue **set-equality** between `REVIEW_DOC_TYPE_ROWS` and the types `parseReviewFilename` accepts, probed with a real role slug over the all-caps candidate set; exclusion-set **equality** between `NON_FEATURE_DIRS` and the real `docs/` root's non-feature directories, using the artifact-naming witness (never the predicate under test). | `pdlc/workflows/__tests__/statsAntiDrift.test.js` | `pdlc/workflows/lib/stats.mjs` | 2 | T-01, T-02 | ✅ |
| T-09 | 🔴 CLI process-level reds, `main(["node","pdlc","stats",…])` in-process with stdout/stderr captured (`captureRun`'s shape from `pdlc/engine/__tests__/loop-cli.test.js` (exists), extended to swap `process.stdout.write`/`process.stderr.write` as well as `console.*`): AT-24's five refusals with **empty stdout**, AT-04, AT-23 both modes, AT-27's single-feature half, and an end-to-end real-path conjunct (`pdlc stats pdlc-loop-economics --json --cwd <repoRoot>` reads DoD rounds `2`; `--cwd` is **required**, because `Engine tests` runs `cd pdlc/engine && npm test` and `pdlc/engine/` carries no `docs/`, so the flagless form yields a root-not-found refusal at exit 1) exercising the production `statsIo`; **and a symbolic-link leg on that same production path** — one temp root under `--cwd` holding a feature directory with one small regular file plus a symlink whose target is very much larger, asserting the reported byte total counts the *link's own* size (EC-19). This is the only **behavioural** evidence that the **shipped** seam counts the link and not its target: T-18's leg runs over T-02's `realStatsIo()` (a helper this PLAN also asks the implementer to write), and T-10's conjunct is source-level. A `statSync` implementation of `statsIo().fileSize` reds here. | `pdlc/engine/__tests__/stats-cli.test.js` | `pdlc/engine/bin/cli.mjs` | 2 | T-01, T-02 | ⬚ |
| T-10 | 🔴 CLI structure reds (TSPEC §6.4, engine half): parser-identity, **both** conjuncts of TSPEC §2.5/§6.4 — (i) `statsParsers()`'s four members are `===` `orchestrate-dev.js`'s exports, and (ii) the parser object `cmdStats` hands `runStats` **is that same bundle** (pass-through, not a rebuilt or wrapped object), the conjunct that stops §6.1's `recordingParsers` double from silently becoming the production path (T-09 cannot substitute: the recording double wraps the real exports and returns identical values); classifier purity — twice-called on a freshly-imported instance, `deepEqual` **and** non-aliased, plus `deriveDodRoundIndex`'s A-B-A conjunct; construction-site count (the four-classifier object literal occurs **exactly once** in `bin/cli.mjs`'s source, set-equality over occurrences); no-write capability (the `StatsIo` literal has exactly `listDir`, `fileSize`, `readFile`, `exists`); **`lstat`-not-`stat` seam conjunct** — `statsIo().fileSize`'s body names `lstatSync`, and `bin/cli.mjs`'s **whole source** matches the boundary-anchored `/(?<![A-Za-z])statSync\s*\(/` **zero** times. The matcher is normative, not illustrative: a naive `source.includes("statSync")` matches the *correct* `lstatSync` and so can never red — the conjunct would be unfalsifiable. The assertion is whole-file and carries no "in the `stats` seam" qualifier, and it stays whole-file now that T-17's `bin/cli.mjs` edits have landed. Re-measured at HEAD: the file **does** now carry the token both ways — `statsIo()`'s `fileSize` body is `nodeFs.lstatSync(absPath).size`, and the doc comment above `statsIo()` carries a bare `statSync` in the prose "`lstatSync`, never `statSync`". The boundary-anchored matcher nevertheless yields **zero** matches over the whole source at HEAD, and does so by construction on both of its anchors: `(?<![A-Za-z])` rejects the `lstatSync` call site, and `\s*\(` rejects the comment occurrence, which is not a call. So the conjunct is **not** re-opened and comment- or string-masking of the source is **not** owed — its falsifiability rests on the two anchors, never on the file being free of the token, which was only ever an incidental property of the pre-T-17 baseline and is no longer true (TSPEC §2.4/§3.1: `lstat().size — never follows a link`), plus the equivalence conjunct that T-02's `realStatsIo()` uses the identical four-call set, so the helper cannot drift from the shipped seam. Structural conjuncts follow `pdlc/engine/__tests__/bin-guard-structure.test.js` (exists). | `pdlc/engine/__tests__/stats-cli-structure.test.js` | `pdlc/engine/bin/cli.mjs` | 2 | T-01, T-02 | ⬚ |
| T-11 | 🔴 Read-only reds (AT-21, AT-22): snapshot path+mtime under the repository root excluding `.git/`, `node_modules/` and the declared scratch prefixes; run; re-snapshot; assert **set-equality between the two snapshots** plus the liveness conjunct (metric set on stdout exit 0 / refusal exit 1). Owns the exported scratch-prefix constant (today exactly `.tmp-*`, the prefix `pdlc/workflows/__tests__/learningsCaptureScript.test.js` (exists) creates under `pdlc/workflows/`) and the guard conjunct that keeps the exclusion non-empty and pre-run-empty. | `pdlc/engine/__tests__/stats-read-only.test.js`, `pdlc/engine/__tests__/_stats-scratch-prefixes.mjs` | `pdlc/engine/bin/cli.mjs` | 2 | T-01, T-02 | ⬚ |
| T-12 | 🟢 Create `lib/stats.mjs`: module header, JSDoc types of TSPEC §3.1/§3.2/§4.1/§4.2, `parseStatsArgv`, and the two frozen constants. Turns T-03 and T-08 green. | `pdlc/workflows/__tests__/statsArgv.test.js`, `…/statsAntiDrift.test.js` | `pdlc/workflows/lib/stats.mjs` | 3 | T-03, T-08 | ⬚ |
| T-13 | 🟢 `computeFeatureStats`: one `listDir` call, `!isDirectory` filter at the source, the four metric computations in TSPEC §4.3's fixed branch order, `round2` once. Turns T-04 green. | `pdlc/workflows/__tests__/statsMetrics.test.js` | `pdlc/workflows/lib/stats.mjs` | 4 | T-12, T-04 | ⬚ |
| T-14 | 🟢 `discoverFeatures`: live/archived listing, `NON_FEATURE_DIRS` filter, the (provisional, per TSPEC §4.4 and RK-5) leading-underscore `unclassified` predicate, BR-02 preference, `dir` recorded per feature. Turns T-05 green. | `pdlc/workflows/__tests__/statsDiscovery.test.js` | `pdlc/workflows/lib/stats.mjs` | 5 | T-13, T-05 | ⬚ |
| T-15 | 🟢 `renderHuman` and `renderJson`, both total over `StatsReport`, `renderJson` as the §4.2.1 **projection** (five/three/three key sets, `feature` and `dir` dropped, `SCHEMA_VERSION` hoisted, key order by object-literal construction). Turns T-06 green. | `pdlc/workflows/__tests__/statsRender.test.js` | `pdlc/workflows/lib/stats.mjs` | 6 | T-14, T-06 | ⬚ |
| T-16 | 🟢 `runStats`: argv → report → rendered `{stdout, stderr, exitCode}`; the three `kind: "error"` reasons; per-feature `try`/`catch` → `{gap}` with fleet exit 0; sequential fleet computation. Never throws for a decided scenario. Turns T-07 green. | `pdlc/workflows/__tests__/statsOutcome.test.js` | `pdlc/workflows/lib/stats.mjs` | 7 | T-15, T-07 | ✅ |
| T-17 | 🟢 `bin/cli.mjs` edits, all additive: `FLAGS_BY_COMMAND.stats = ["json","cwd"]`; `case "stats"` in `main()`'s `switch`; the `USAGE` line; `statsIo()`; `export async function statsParsers()` (the single construction site, mirroring `loopSessionModule()`); `export async function cmdStats(argv)` with the outermost `try`/`catch`. Turns T-09, T-10 and T-11 green. | `pdlc/engine/__tests__/stats-cli.test.js`, `…/stats-cli-structure.test.js`, `…/stats-read-only.test.js` | `pdlc/engine/bin/cli.mjs` (exists) | 8 | T-16, T-09, T-10, T-11 | ⬚ |
| T-18 | 🟢 Real-path acceptance tests over the live archive, expectations as **literals declared as measurements** (FSPEC §6): AT-09 (`docs/completed/pdlc-advisory-wave-gate/` — TSPEC row `6`, four `…-REVIEW-v{1,2}.md` basenames malformed), AT-10 (`pdlc-headless-engine` — TSPEC `13`, five rows `harvested`), AT-11 (`pdlc-loop-economics` — DoD `2`), AT-13 (`pdlc-wave-resume` **copied to a temp root**, `POSTMORTEM-P-some-other-feature.md` added there and never to the repository), AT-14b (`pdlc-headless-engine`'s four post-mortems, sequence `D, F, I, T`), AT-18 (this repository's `docs/` fleet), and **AT-15's symbolic-link leg over a real filesystem** — a temp artifact directory holding one small regular file plus a symlink whose target is very much larger, asserting the byte total counts the *link's own* size (EC-19); a `statSync` implementation reds here, which no `fakeStatsIo` leg can achieve. **Seam:** every leg runs over T-02's `realStatsIo()`, which T-10's equivalence and `lstat`-not-`stat` conjuncts pin to `bin/cli.mjs`'s shipped `statsIo()` call set; T-09 remains the behavioural exercise of the shipped seam through `main()`. | `pdlc/workflows/__tests__/statsRealPaths.test.js` | — | 9 | T-17 | ⬚ |
| T-19 | 🟢 Property tests (`fast-check`, already a `pdlc/workflows` dev dependency): PROP-1 partition, PROP-2 state totality, PROP-3 order independence over a **generated permutation** of the listing. | `pdlc/workflows/__tests__/statsProperties.test.js` | — | 9 | T-17 | ⬚ |
| T-20 | 🔴 Vendoring co-change oracle (TSPEC §6.4): `lib/stats.mjs` present in `prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s and `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`, and `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES`; and `vendoredClassSize === MODULE_NAMES.length + 1`, **derived** from `MODULE_NAMES` rather than transcribed (`pdlc-loop-economics` LEARNINGS F-4). Red on landing: no enumeration names the module yet. | `pdlc/engine/__tests__/stats-vendoring.test.js` | — | 9 | T-17 | ⬚ |
| T-21 | 🟢 `K-9` cluster, one change: add `lib/stats.mjs` to `prepack.mjs`'s `MODULE_NAMES`; amend `run.test.js`'s manifest `deepEqual`s **and** its `scratchWorkflows` copy list (an uncopied member makes `runPrepack` throw `ENOENT` and reds the process-entry leg); amend `learningsPremises.test.js`'s P-1 literal and its title's count word; update `pdlc/README.md`'s prose enumeration (count word and member list) **and** add the `pdlc stats` bullet to its command list; promote the repo-scoped, source-restricted `git grep -l` co-change sweep to `docs/_constraints/DOMAIN-CONSTRAINTS.md`, **scoped to modules the shipped engine loads at runtime**, never to `pdlc/workflows/lib/` membership as such. The promoted text must carry `lib/document-oracles.mjs` as its worked exclusion: it exists at HEAD in `pdlc/workflows/lib/`, is imported only by `documentOracles.test.js` — `advisoryWaveGate.test.js` merely mentions it in a comment and is **not** a consumer — and appears in **none** of the vendoring enumerations (not `prepack.mjs`'s `MODULE_NAMES`, neither `WORKFLOW_MEMBERS` copy, not `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES`, not `package.json`'s `c8.include`) — a dev-only `lib/` module owes no co-change. `stats.mjs` owes the sweep because the engine CLI loads it, not because of where it sits. | `pdlc/engine/__tests__/run.test.js` (exists), `pdlc/workflows/__tests__/learningsPremises.test.js` (exists) | `pdlc/engine/scripts/prepack.mjs` (exists), `pdlc/README.md` (exists), `docs/_constraints/DOMAIN-CONSTRAINTS.md` (exists) | 10 | T-20 | ⬚ |
| T-22 | 🟢 `K-7` cluster, one change: `_tspec-packed-set.mjs` gains `vendor/workflows/lib/stats.mjs` in `WORKFLOW_MEMBERS` and `tspecPackedCount` moves `4 + 15 + 5 + 1` → `4 + 15 + 6 + 1`; the sibling feature's frozen enumerations are amended on the same versioned route — `docs/completed/pdlc-engine-distribution/TSPEC-….md` §5.4 gains `PK-26` and its vendored-members note moves five → **six**, and `FSPEC-….md` §5.2's per-class count moves five → **six**, each with its own changelog row naming this feature. Cites `DEC-STATS-01`'s carve-out; does not restate it (`K-6`). | `pdlc/engine/__tests__/loop-distribution.test.js` (exists, P7-02 document oracle) | `pdlc/engine/__tests__/_tspec-packed-set.mjs` (exists), `docs/completed/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (exists), `docs/completed/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (exists) | 10 | T-20 | ⬚ |
| T-23 | 🟢 `K-8`: `loop-distribution.test.js`'s **nine** assertion edits — `D1_BASELINE`, `D2_D3_BASELINE`, `D5_BASELINE` re-based onto HEAD's post-state; `NEW_LIB_MEMBERS_BARE` / `NEW_LIB_MEMBERS_VENDORED` reduced to this feature's single member; `tspecPackedCount`'s literal and the derived `assert.equal(vendoredClassSize, 5, …)`; and `vendoredClassWord`'s ternary replaced by a number-word map so `6 → "six"` matches the word T-22 writes into the sibling documents. The ninth site is P7-02's conjunct (d): `postFixMembers` concatenates `WORKFLOW_MEMBERS.filter(…)` with `NEW_LIB_MEMBERS_VENDORED`, so once T-22 adds `vendor/workflows/lib/stats.mjs` to `WORKFLOW_MEMBERS` the member is double-counted — harmless to the assertion, but the concatenation and `assertAdditiveOnly`'s hard-coded message — the `label` template literal in that function's closing `assert.equal`, verbatim `` `${label}: delta over baseline must be exactly the two new members, got …` `` (`loop-distribution.test.js`; at the pre-change baseline the literal is line `77` and the `assert.equal(` statement spans `74-78`) — both go stale and are edited here. The importability conjunct iterates the **post-state** member set, not the delta. | `pdlc/engine/__tests__/loop-distribution.test.js` (exists) | — | 10 | T-20 | ⬚ |
| T-24 | 🟢 `K-3`: append `"**/pdlc/workflows/lib/stats.mjs"` to `c8.include` in `pdlc/workflows/package.json` **and** to `coverageInstrumentation.test.js`'s P9-02 literal at the same index (the shipped assertion is `toEqual` — array equality, position-sensitive), correcting the stale count words in P9-02's title and comment; edit the **second** P9-02 test as well — the resolution oracle whose title is, verbatim at the pre-change baseline, `P9-02: the shipped c8 config resolves the two new lib/ modules too (F4)` — the source string carries no backticks around `lib/`, and the count word `two` is one of the stale words this task corrects (`coverageInstrumentation.test.js`, the second `P9-02` test), whose generated driver `import()`s `loop-session.mjs` and `escalation-view.mjs` by name: its driver import list, its title and its comment are the artifact to change, so the real c8 run's `json-summary` is asserted to name the module, so a declared-but-unresolving glob is caught. Carries the per-file coverage obligation: `lib/stats.mjs` must clear branches ≥ 85. | `pdlc/workflows/__tests__/coverageInstrumentation.test.js` (exists) | `pdlc/workflows/package.json` (exists) | 10 | T-20 | ⬚ |
| T-25 | 🟢 Publication-path enumerations: add `vendor/workflows/lib/stats.mjs` to `publish-preflight.mjs`'s `WORKFLOW_MEMBERS` and `lib/stats.mjs` to `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES`. `publish-preflight.mjs` is the production-side copy a `__tests__/`-scoped sweep does not reach (RK-1). | `pdlc/engine/__tests__/stats-vendoring.test.js` | `pdlc/engine/scripts/publish-preflight.mjs` (exists), `pdlc/engine/scripts/fixture-machine.mjs` (exists) | 10 | T-20 | ⬚ |
| T-26 | 🟢 Mutation evidence: run TSPEC §6.6's four mutants — drop `- 1` from each of the two driver-index conversions, swap `unmeasurable`/`harvested`, swap BR-16's harvested test against BR-15's zero-denominator test — and record the **named** killing test for each. A surviving mutant is blocking work, not a note. **T-26 authors no test file**: its `Test File` column names the suites it *runs*, both owned by T-04 and T-18, so the File Ownership Manifest keeps their single-owner rows; a mutant that survives is remediated as blocking work inside the owning task's file (the `unmeasurable`/`harvested` killer is T-04's named `LEARNINGS`-sibling fixture). | `pdlc/workflows/__tests__/statsMetrics.test.js`, `…/statsRealPaths.test.js` | `docs/completed/pdlc-stats/MUTATION-EVIDENCE-pdlc-stats.md` | 11 | T-18, T-19, T-21 | ⬚ |
| T-27 | 🟢 Operator documentation: `pdlc/OPERATIONS.md` gains `pdlc stats`'s full flag semantics, its exit codes (`0` / `1` only, never the halt `2`), and its read-only stance — the file `pdlc/README.md` defers to for flag detail. | — | `pdlc/OPERATIONS.md` (exists) | 11 | T-21 | ⬚ |

### Batch gates

Two gate wordings are used. A **green gate** means the full suite is green after the batch. A
**split gate** names the tests permitted to be red and why, because "full suite green after every
batch" is unsatisfiable when a batch legitimately ends red.

| Batch | Tasks | Gate |
|---|---|---|
| 1 | T-01, T-02 | **Green gate.** T-01 passes at HEAD (it asserts only baseline-symbol existence); T-02 adds no assertions. Full suite green, both packages. |
| 2 | T-03 … T-11 | **Split gate.** The nine new test files fail for the specified reason — `pdlc/workflows/lib/stats.mjs` does not exist, and `bin/cli.mjs` has no `stats` case, `cmdStats`, `statsIo` or `statsParsers`. **Every pre-existing test in both suites stays green.** A new file failing for any other reason (import error in a helper, a typo'd fixture path) is a batch failure, not a red. |
| 3 | T-12 | **Split gate.** `statsArgv.test.js` and `statsAntiDrift.test.js` go green; the seven other new files stay red for the specified reason; all pre-existing tests green. |
| 4 | T-13 | **Split gate.** `statsMetrics.test.js` goes green; five new files stay red; all pre-existing tests green. |
| 5 | T-14 | **Split gate.** `statsDiscovery.test.js` goes green; four new files stay red; all pre-existing tests green. |
| 6 | T-15 | **Split gate.** `statsRender.test.js` goes green; three new files stay red; all pre-existing tests green. |
| 7 | T-16 | **Split gate.** `statsOutcome.test.js` goes green; the three engine-side files (T-09, T-10, T-11) stay red for the specified reason — `bin/cli.mjs` is untouched; all pre-existing tests green. |
| 8 | T-17 | **Green gate.** Both suites fully green, `Unit tests` and `Engine tests` alike. This is the first batch at which `pdlc stats` runs end to end. |
| 9 | T-18, T-19, T-20 | **Split gate.** `stats-vendoring.test.js` (T-20) is the **only** permitted red, and only for its specified reason: no enumeration names `lib/stats.mjs` yet. T-18 and T-19 land green. Everything else green. |
| 10 | T-21 … T-25 | **Green gate**, and the batch's whole point. Five tasks, five disjoint file clusters, landing in one change. On entry to this batch `loop-distribution.test.js`'s `assertAdditiveOnly` goes red as soon as the first of the **four enumerations `assertAdditiveOnly` reads** moves (TSPEC §6.4, §2.1's sites 1–4: `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`) — T-24's `c8.include` edit is in this batch and is **not** one of them, so landing T-24 first leaves the suite green and that is not drift — that is `K-1`'s "reds first" signal and is expected mid-batch; the gate is measured at batch end. `lib/stats.mjs` enters the per-file c8 branch floor of 85 here (T-24): a short module fails this gate, and the remedy is tests in the batch, never a lowered floor. |
| 11 | T-26, T-27 | **Green gate**, plus T-26's own bar: each of the four mutants turns a **named** test red. |

**Wave-gate note.** `.claude/pdlc.config.example.json`'s `postWaveCommand`
(`node pdlc/workflows/build-runtime.mjs`, staging `pdlc/workflows/dist/`) runs after every wave and
is unchanged by this feature. `lib/stats.mjs` is not a member of the generated `pdlc-cli.mjs`
bundle — the stats surface is reached through the engine CLI, not through the workflow runtime — so
no task edits `pdlc/workflows/dist/` and no batch expects it to move.

## File Ownership Manifest

One file, one owning task per batch — the premise batch-safety rule 2 rests on, stated mechanically
so it is auditable rather than asserted.

**Reading the table.** The `File` column holds a **bare path and nothing else**, so a same-batch /
same-file grouping pass keyed on that column sees one key per file. Where one file is written across
several batches — `pdlc/workflows/lib/stats.mjs`, built up by T-12…T-16 — it takes one row per
batch, and the batch lives in its own `Batch(es)` column. Disambiguating duplicate rows by appending
prose *to the path* would defeat exactly the grouping pass this manifest exists to feed: the next
feature should add a column, never decorate a path.

| File | Batch(es) | Owning task(s) | New? |
|---|---|---|---|
| `pdlc/workflows/__tests__/statsPreflight.test.js` | 1 | T-01 | new |
| `pdlc/workflows/__tests__/helpers/statsDoubles.js` | 1 | T-02 | new |
| `pdlc/workflows/__tests__/statsArgv.test.js` | 2 | T-03 | new |
| `pdlc/workflows/__tests__/statsMetrics.test.js` | 2 | T-04 | new |
| `pdlc/workflows/__tests__/statsDiscovery.test.js` | 2 | T-05 | new |
| `pdlc/workflows/__tests__/statsRender.test.js` | 2 | T-06 | new |
| `pdlc/workflows/__tests__/statsOutcome.test.js` | 2 | T-07 | new |
| `pdlc/workflows/__tests__/statsAntiDrift.test.js` | 2 | T-08 | new |
| `pdlc/engine/__tests__/stats-cli.test.js` | 2 | T-09 | new |
| `pdlc/engine/__tests__/stats-cli-structure.test.js` | 2 | T-10 | new |
| `pdlc/engine/__tests__/stats-read-only.test.js` | 2 | T-11 | new |
| `pdlc/engine/__tests__/_stats-scratch-prefixes.mjs` | 2 | T-11 | new |
| `pdlc/workflows/lib/stats.mjs` | 3 | T-12 | new |
| `pdlc/workflows/lib/stats.mjs` | 4 | T-13 | exists from T-12 |
| `pdlc/workflows/lib/stats.mjs` | 5 | T-14 | exists from T-12 |
| `pdlc/workflows/lib/stats.mjs` | 6 | T-15 | exists from T-12 |
| `pdlc/workflows/lib/stats.mjs` | 7 | T-16 | exists from T-12 |
| `pdlc/engine/bin/cli.mjs` | 8 | T-17 | exists |
| `pdlc/workflows/__tests__/statsRealPaths.test.js` | 9 | T-18 | new |
| `pdlc/workflows/__tests__/statsProperties.test.js` | 9 | T-19 | new |
| `pdlc/engine/__tests__/stats-vendoring.test.js` | 9 | T-20 | new |
| `pdlc/engine/scripts/prepack.mjs` | 10 | T-21 | exists |
| `pdlc/engine/__tests__/run.test.js` | 10 | T-21 | exists |
| `pdlc/workflows/__tests__/learningsPremises.test.js` | 10 | T-21 | exists |
| `pdlc/README.md` | 10 | T-21 | exists |
| `docs/_constraints/DOMAIN-CONSTRAINTS.md` | 10 | T-21 | exists |
| `pdlc/engine/__tests__/_tspec-packed-set.mjs` | 10 | T-22 | exists |
| `docs/completed/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` | 10 | T-22 | exists |
| `docs/completed/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` | 10 | T-22 | exists |
| `pdlc/engine/__tests__/loop-distribution.test.js` | 10 | T-23 | exists |
| `pdlc/workflows/package.json` | 10 | T-24 | exists |
| `pdlc/workflows/__tests__/coverageInstrumentation.test.js` | 10 | T-24 | exists |
| `pdlc/engine/scripts/publish-preflight.mjs` | 10 | T-25 | exists |
| `pdlc/engine/scripts/fixture-machine.mjs` | 10 | T-25 | exists |
| `docs/completed/pdlc-stats/MUTATION-EVIDENCE-pdlc-stats.md` | 11 | T-26 | new |
| `pdlc/OPERATIONS.md` | 11 | T-27 | exists |

**The one multi-owner file is `pdlc/workflows/lib/stats.mjs`**, and it is serialized rather than
noted: its five writing tasks sit in five **distinct** batches (3, 4, 5, 6, 7), forced by real
`Deps` edges (T-13 → T-12, T-14 → T-13, T-15 → T-14, T-16 → T-15), never by prose. No batch in this
PLAN contains two tasks that create or append the same physical file — checked row by row against
the table above, including the batch-10 cluster, whose five tasks touch twelve files with no
overlap.

`pdlc/README.md` is edited by exactly one task (T-21), which carries both the prose-enumeration
co-change `K-9` requires and the new command bullet, so no second batch re-opens the file.

## Dependencies

### Batch derivation

Every `Batch` value is `max(batch of its dependencies) + 1`, sources being batch 1. Re-derived row
by row:

| Task | Deps (batches) | max + 1 | Column |
|---|---|---|---|
| T-01, T-02 | — (source) | 1 | 1 |
| T-03 … T-11 | T-01 (1), T-02 (1) | 2 | 2 |
| T-12 | T-03 (2), T-08 (2) | 3 | 3 |
| T-13 | T-12 (3), T-04 (2) | 4 | 4 |
| T-14 | T-13 (4), T-05 (2) | 5 | 5 |
| T-15 | T-14 (5), T-06 (2) | 6 | 6 |
| T-16 | T-15 (6), T-07 (2) | 7 | 7 |
| T-17 | T-16 (7), T-09 (2), T-10 (2), T-11 (2) | 8 | 8 |
| T-18, T-19, T-20 | T-17 (8) | 9 | 9 |
| T-21 … T-25 | T-20 (9) | 10 | 10 |
| T-26 | T-18 (9), T-19 (9), T-21 (10) | 11 | 11 |
| T-27 | T-21 (10) | 11 | 11 |

The graph is acyclic: every edge points from a higher-numbered batch to a strictly lower one. Task
ids are written identically in the `#` column and in every `Deps` cell — bare `T-NN`, no emphasis
markers — so the parser reads them as the same tokens.

### Why each ordering edge exists

- **T-03 … T-11 depend on T-02, not merely on T-01.** Every red fixture is built with
  `fakeStatsIo`; a red written before the double exists fails for the wrong reason and the batch-2
  split gate cannot distinguish it from a genuine red.
- **T-12 → T-13 → T-14 → T-15 → T-16 is the single-writer chain** on `pdlc/workflows/lib/stats.mjs`
  (see the manifest). It is the feature's dominant serialization cost and is taken deliberately: the
  alternative — splitting the module — is refused by `DEC-STATS-01`, which fixes one module path.
- **T-17 depends on all three engine-side reds**, not just on T-16. T-10's construction-site count
  and T-11's scratch-prefix constant both constrain how `bin/cli.mjs` may be written; landing the
  edit before its structural oracles exist would let a second `StatsParsers` construction site pass
  unnoticed, which is exactly `K-4`'s residual.
- **T-18 depends on T-17, not on T-16**, and the reason is the *seam*, not the command: T-18 runs
  workflows-side over T-02's `realStatsIo()` (the CLI-driving tests live in the engine suite, per
  the Overview's suite arrangement — T-09 is where the shipped command is exercised). `realStatsIo()`
  is only trustworthy once the seam it mirrors exists and is pinned: T-17 authors `statsIo()`, and
  T-10's equivalence plus `lstat`-not-`stat` conjuncts assert the helper and the shipped seam make
  the identical four `fs` calls. Without that edge the helper could pass while the shipped seam
  diverged — the exact mechanism by which an F-01-style `stat`/`lstat` substitution would hide.
- **T-20 gates the whole co-change batch.** Its red is what makes batch 10's five tasks a single
  atomic obligation: `K-1`'s partial-edit failure mode is closed by the oracle being red *before*
  any enumeration moves, so a batch that lands four clusters and forgets the fifth cannot go green.
- **T-22 and T-23 are separated deliberately.** `loop-distribution.test.js`'s P7-02 oracle greps the
  sibling documents' member-count **sentences** and derives the class size from `tspecPackedCount`,
  and its word map (`6 → "six"`) must agree with the word T-22 writes. They are two files, so they
  are two tasks in one batch; the coupling is real and is why neither may slip to a later batch.
- **T-21 and T-24 are not merged**, per `DEC-STATS-01`'s note on `K-3` versus `K-9`: T-24's pair
  (`package.json` + `coverageInstrumentation.test.js`) sits wholly inside `Unit tests`, while
  T-21's files straddle the package boundary (`run.test.js` under `Engine tests`,
  `learningsPremises.test.js` under `Unit tests`), so a partial edit reds a check on each side.
- **T-26 depends on T-21**, so mutants are measured against the post-co-change tree, with the c8
  per-file floor already active on `lib/stats.mjs`.

### Integration points

| Point | Direction | Detail |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | read-only consumer | four `export`ed classifiers imported by reference; **no edit to this file in any task** |
| `pdlc/engine/bin/cli.mjs` | extended | `FLAGS_BY_COMMAND`, `main()`'s `switch`, `USAGE`, three new functions; `validateFlags`, `checkFlags`, `readFlag`, `VALUE_FLAGS` and `launch()`'s non-`dev`/`queue` passthrough are **reused unchanged** |
| `resolveWorkflowRoot()` | reused unchanged | probes `orchestrate-dev.js` / `orchestrate-queue.js`; `lib/stats.mjs` loads from the resolved root exactly as `lib/loop-session.mjs` does |
| Vendoring channel | extended | the five enumerations and four pinning test files of the Overview table |
| `docs/completed/` archive | read-only fixture | T-18's literals are measurements of the archive; a future archive move reds them loudly (RK-4, and the `doc-moves-break-pinned-tests` pattern) — re-measure, never path-rewrite |
| Required CI checks | unchanged set | no workflow file is added or edited; `pdlc/engine/__tests__/ci-arrangement.test.js` needs no amendment, and no task edits it |

### Prior-phase baseline

T-01 is the `P2-00`-shaped pre-flight gate and is the **first** task in the PLAN. Its `BL-PREREQ`
set is the four driver classifiers plus `resolveWorkflowRoot`; it asserts **existence and
importability only**, never the shape a later task creates. Any absent symbol is promoted to
blocking work before batch 2 is dispatched.

## Verification

### Commands

| Command | Where | What it gates |
|---|---|---|
| `cd pdlc/workflows && npm test` | jest | every `stats*.test.js` in the workflows suite, plus the two amended pins (`coverageInstrumentation`, `learningsPremises`) |
| `cd pdlc/workflows && npm run test:coverage` | c8 + jest `--runInBand` | the `Unit tests (ubuntu-latest, node 20)` check, including the per-file `--branches 85` pass that `lib/stats.mjs` joins at T-24 |
| `cd pdlc/engine && npm test` | `node __tests__/_run-suite.mjs` | the `Engine tests (ubuntu-latest)` check: `stats-cli`, `stats-cli-structure`, `stats-read-only`, `stats-vendoring`, plus the amended `run.test.js`, `loop-distribution.test.js`, `_tspec-packed-set.mjs` |
| `bash -n` over tracked `*.sh` | CI | unaffected — this feature adds no shell script |
| `pdlc/engine/scripts/fixture-machine.mjs` legs | CI | the install leg exercises the **packed tarball**, so a missed vendoring entry surfaces there rather than in the field (RK-1) |

The four required checks named in `CLAUDE.md`'s CI table are unchanged in membership; no task edits
a workflow file or `ci-arrangement.test.js`.

### Acceptance-test coverage

Every FSPEC acceptance test is owned by **at least one** task, and where ownership is split the
split is named in the row (AT-24's parser half and process half, for instance, genuinely belong to
different suites). Verified against the FSPEC's own AT list
(AT-01 … AT-28, with AT-14b) — 29 tests, all assigned:

| AT | Task | AT | Task |
|---|---|---|---|
| AT-01 | T-06 | AT-15 | T-04 (size arithmetic, removal probe), T-18 (symbolic-link leg, real fs), T-09 (shipped seam, end-to-end) |
| AT-02 | T-05 | AT-16 | T-04 |
| AT-03 | T-07 | AT-17 | T-04 |
| AT-04 | T-07, T-09 | AT-18 | T-05 (constructed roots), T-18 (real `docs/`) |
| AT-05 | T-06 | AT-19 | T-05, T-06, T-08 (set-equality half) |
| AT-06 | T-06 | AT-20 | T-07 |
| AT-07 | T-04 | AT-21 | T-11 |
| AT-08 | T-04 | AT-22 | T-11 |
| AT-09 | T-04 (fixture), T-18 (real path) | AT-23 | T-06, T-09 |
| AT-10 | T-18 | AT-24 | T-03 (parser half), T-09 (process half) |
| AT-11 | T-18, T-09 (end-to-end conjunct) | AT-25 | T-04 |
| AT-12 | T-04 | AT-26 | T-05, T-07 |
| AT-13 | T-04 (companion leg), T-18 (real path) | AT-27 | T-07 (fleet + root-failure), T-09 (single-feature) |
| AT-14 | T-04 | AT-28 | T-04 |
| AT-14b | T-18 | | |

FSPEC's own EC table maps EC-01…EC-21 onto these ATs, so EC coverage follows; EC-03's rule-only
edge is carried by AT-26 (T-05, T-07) as FSPEC records.

### Anti-drift and property coverage

| Oracle (TSPEC §6.4/§6.5/§6.6) | Task | Suite |
|---|---|---|
| Parser identity — `===` against the driver's exports **and** the bundle `cmdStats` hands `runStats` is that same object | T-10 | engine |
| Classifier purity (non-aliasing ×3, A-B-A for `deriveDodRoundIndex`) | T-10 | engine |
| Construction-site count (exactly one four-classifier literal) | T-10 | engine |
| No-write capability (`StatsIo` has exactly four members) | T-10 | engine |
| `lstat`-not-`stat` seam: `statsIo().fileSize` names `lstatSync`; whole-file boundary-anchored `/(?<![A-Za-z])statSync\s*\(/` matches zero times (never the naive substring, which `lstatSync` satisfies); `realStatsIo()` makes the identical call set | T-10 | engine |
| AT-15's symbolic-link leg over a real filesystem (link's own size, not the target's) | T-18 | workflows |
| AT-15/EC-19 behaviourally on the **shipped** seam — `main()` over the production `statsIo` with `--cwd` on a temp root containing a symlink | T-09 | engine |
| Doc-type catalogue set-equality | T-08 | workflows |
| Exclusion-set equality over the real `docs/` root | T-08 | workflows |
| Vendoring co-change, `MODULE_NAMES.length + 1` derived | T-20 | engine |
| `c8.include` pair (declared literal + resolved c8 run) | T-24 | workflows |
| Read-only snapshot pair + scratch-prefix guard | T-11 | engine |
| PROP-1 / PROP-2 / PROP-3 | T-19 | workflows |
| Four mutants, each with a named killing test | T-26 | both |

### Claims verified against the tree while writing this PLAN

Not asserted from the upstream documents — re-checked at HEAD, because a PLAN that names a file the
implementer cannot find is a PLAN that halts a wave:

- All four driver classifiers are present and `export`ed in `pdlc/workflows/orchestrate-dev.js`.
- `pdlc/workflows/lib/` holds **three** modules at HEAD — `loop-session.mjs`, `escalation-view.mjs`
  and `document-oracles.mjs`; **`stats.mjs` does not exist** — every row naming it declares it new.
  `document-oracles.mjs` is in **neither** `prepack.mjs`'s `MODULE_NAMES` nor `package.json`'s
  `c8.include` (nor either `WORKFLOW_MEMBERS` copy, nor `WORKFLOW_MODULE_NAMES`): directory
  membership is therefore *not* what obliges the co-change. `stats.mjs` owes it because the shipped
  engine CLI loads it at runtime — see the Overview and T-21.
- `MODULE_NAMES` (4 entries), both `WORKFLOW_MEMBERS` copies (5 entries each),
  `WORKFLOW_MODULE_NAMES` (4 entries), `tspecPackedCount`'s `4 + 15 + 5 + 1`, and `c8.include`'s
  seven `**/`-anchored entries are all as the TSPEC describes them.
- `docs/` holds exactly the eight non-feature directories `NON_FEATURE_DIRS` names — `_queue`,
  `_constraints`, `_decisions`, `design`, `requirements`, `ideas`, `discarded`, `completed` — and
  the loose file `docs/PLAN-pdlc-integration-boundary-gates.md` AT-18 names.
- Every real-path fixture T-18 depends on exists: `pdlc-advisory-wave-gate`'s four
  `…-REVIEW-v{1,2}.md` basenames, `pdlc-headless-engine`'s `CROSS-REVIEW-software-engineer-TSPEC-v13.md`,
  `LEARNINGS-…` and four `POSTMORTEM-{D,F,I,T}-…` files, `pdlc-loop-economics`'s two `CODE_REVIEW`
  files, and `pdlc-wave-resume`'s `POSTMORTEM-PR-…`.
- `pdlc/workflows/__tests__/helpers/` exists (20 `.js` modules at HEAD), so T-02 adds a peer, not a
  directory; `pdlc/engine/__tests__/` has no `helpers/` directory, which is why T-11's constant
  lands as `_stats-scratch-prefixes.mjs` beside the engine suite's other `_`-prefixed helpers.
- `pdlc/engine/__tests__/bin-guard-structure.test.js` and `loop-cli.test.js` exist and carry the
  structural-count and `captureRun` precedents T-10 and T-09 reuse.

### Residual risks carried into implementation

Named so the DoD reviewer inherits them rather than discovering them. None is closed by a task here:

| Residual | Source | Disposition |
|---|---|---|
| `PK-26`'s existence row in the sibling TSPEC's `PK-*` table has no mechanical falsifier (the *count* half does) | `DEC-STATS-01` `K-7` | discharged by T-22 as a single owning task + review |
| `pdlc/README.md`'s prose enumeration is pinned by no oracle | `K-9`, RK-1 | discharged by T-21 + review; drift here is silent |
| A second `StatsParsers` construction site would void the identity oracle | `K-4` | T-10's construction-site count is the detector; it is why T-17 depends on T-10 |
| The leading-underscore discovery predicate is **provisional** on an open FSPEC erratum — BR-26/EC-10's missing positive feature-recognition predicate, which is the **only** erratum TSPEC §8.3 still carries open | TSPEC §4.4, §8.3, RK-5 | T-14 implements the provisional predicate; the blast radius of every possible answer is `discoverFeatures` plus AT-26's fixture |
| The REQ-STATS-06-versus-FSPEC-BR-16 disagreement over the out-of-catalogue cross-review basename — **carried here only to close it**, so the DoD reviewer does not re-open it | TSPEC §8.3 (second bullet at TSPEC v1.7, removed at v1.8) | **Discharged**: settled at REQ v1.7, absorbed by FSPEC v1.8 in BR-16's favour. Its whole blast radius was the harvested disjunct and T-04's AT-17 fourth-leg expected value; both already carried the winning reading, so no task changes and nothing re-stamps |
| Real-path literals bind to the live archive | RK-4 | T-18 declares each literal a measurement in its own comment |

## Definition of Done

- [ ] `pdlc stats {feature}`, `pdlc stats {feature} --json`, `pdlc stats`, `pdlc stats --json` and
      `--cwd <path>` all behave as FSPEC §4 fixes them; no other flag is accepted.
- [ ] All 29 FSPEC acceptance tests pass, each owned by the task the coverage table names.
- [ ] `cd pdlc/workflows && npm run test:coverage` exits 0, with `pdlc/workflows/lib/stats.mjs` in
      `c8.include` and clearing the per-file `--branches 85` floor.
- [ ] `cd pdlc/engine && npm test` exits 0.
- [ ] All four required CI checks are green; the check set itself is unchanged.
- [ ] The vendoring co-change is complete across all ten in-repo sites and both sibling-feature
      documents, and `stats-vendoring.test.js` is green with its `MODULE_NAMES.length + 1` conjunct
      **derived**, not transcribed.
- [ ] The read-only oracle passes on both a success and a failure invocation, with a non-empty
      scratch-prefix constant and the guard conjunct green.
- [ ] The parser-identity oracle is green on **both** conjuncts (`===` members and the pass-through
      bundle `cmdStats` hands `runStats`), and the classifier-purity, construction-site-count,
      no-write-capability, `lstat`-not-`stat` seam, doc-type-catalogue and exclusion-set oracles are
      all green.
- [ ] PROP-1, PROP-2 and PROP-3 pass; PROP-3 is stated over a **generated permutation**, not over a
      repeated call.
- [ ] All four mutants of TSPEC §6.6 are killed, each by a **named** test, recorded in
      `docs/completed/pdlc-stats/MUTATION-EVIDENCE-pdlc-stats.md`.
- [ ] No production code writes anywhere: `StatsIo` has four read members and no fifth; no task adds
      a `git`, network or write capability to any seam.
- [ ] No task edited `pdlc/workflows/orchestrate-dev.js`, and no grammar was re-implemented — REQ
      C-5 is satisfied by import-and-call, pinned by reference identity.
- [ ] `pdlc/README.md` and `pdlc/OPERATIONS.md` describe the shipped command surface;
      `docs/_constraints/DOMAIN-CONSTRAINTS.md` carries the co-change sweep.
- [ ] Every artifact committed on `feat-pdlc-stats`; `pdlc/workflows/dist/` regenerated by the wave
      gate's `postWaveCommand` where a wave touched `pdlc/workflows/*.js` (no task here does).
