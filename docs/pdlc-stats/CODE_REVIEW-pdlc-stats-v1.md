# CODE REVIEW — pdlc-stats (v1)

| Field | Detail |
|---|---|
| Feature | pdlc-stats |
| Branch | feat-pdlc-stats |
| Review version | 1 |
| Date | 2026-08-31 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 96.27% (`pdlc/workflows/lib/stats.mjs`) |
| Requirements traced | 20/22 |

Scope: pdlc-stats implementation on `feat-pdlc-stats` — `pdlc/workflows/lib/stats.mjs` (new, 633 lines) and the `stats` subcommand added to `pdlc/engine/bin/cli.mjs` (+90 lines), plus the vendoring/coverage wiring in `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`, `package.json` and `coverageInstrumentation.test.js`.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Adjacent-surface falsification (crit. 6a) | low | `pdlc/workflows/lib/stats.mjs:12-20` | The module header still describes the file as PLAN task T-12 only: "It turns T-03 … and T-08 … green. The remaining exports named in TSPEC §3.3 (`discoverFeatures`, `computeFeatureStats`, `runStats`, `renderHuman`, `renderJson`) land in later tasks on this module's single-writer chain (T-13 through T-16) **and are not defined here**." All five are in fact defined in this same file (`computeFeatureStats:320`, `discoverFeatures:360`, `runStats:472`, `renderHuman:593`, `renderJson:617`). T-13…T-16 landed on the same branch and silently falsified the docstring they were written under. | Rewrite the header to describe the module's delivered surface (all six exports plus the two frozen constants). Drop the "not defined here" clause and the per-task narrative, or restate it in the past tense. | Local |

Criteria 1–3 are otherwise clean. No `TODO`/`FIXME`/`HACK`/`XXX`, no `NotImplementedError`, no `throw new Error("not implemented")`, no hollow bodies, no `placeholder`/`stub`/`dummy`/`mock`/`fake` identifiers, no coverage-exemption pragmas, no hardcoded sample data, and no placeholder URLs in either production file. Every function body was read, not just its signature.

## §2 Requirements Traceability

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ-STATS-01 | Single-feature human-readable table (rounds, DoD, halts, ratio) | `lib/stats.mjs:546` `renderSingleHuman` | `workflows/__tests__/statsRender.test.js` (60 assertions); real-path smoke verified | No | — | — |
| 2 | REQ-STATS-02 | `--json` mode, top-level key set set-equal to the printed metric set + `schemaVersion` | `lib/stats.mjs:617` `renderJson` | `statsRender.test.js:128,143` — hand-transcribed literal, set-equality both directions | No | — | — |
| 3 | REQ-STATS-03 | Review rounds per doc type across all roles; malformed bucket separate | `lib/stats.mjs:220` `computeReviewRounds` | `statsMetrics.test.js` (40 assertions); `statsRealPaths.test.js:48,67` real-corpus literals | No | — | — |
| 4 | REQ-STATS-04 | DoD rounds = highest `N` on disk, not file count | `lib/stats.mjs:255` `computeDodRounds` | `statsMetrics.test.js`; `statsRealPaths.test.js:87` (pdlc-loop-economics ⇒ exactly `2`, not `3`) | No | — | — |
| 5 | REQ-STATS-05 | One entry per phase, resolved/open by the driver's `RESOLVED:` rule; `0` when none | `lib/stats.mjs:269` `computeHalts` | `statsMetrics.test.js`; `statsRealPaths.test.js:96` | No | — | — |
| 6 | REQ-STATS-06 | Process/spec byte ratio; not-available on zero denominator; harvested precedence | `lib/stats.mjs:289` `computeByteRatio` | `statsMetrics.test.js` (removal probes); `statsOutcome.test.js` | No | — | — |
| 7 | REQ-STATS-07 | Fleet mode; directories only; `completed` traversed not reported; gaps explicit | `lib/stats.mjs:360` `discoverFeatures`, `:452` fleet loop | `statsDiscovery.test.js`; `statsRealPaths.test.js:145`; real-path smoke | No | — | — |
| 8 | REQ-STATS-08 | Read-only, no network, no git writes, on every path | `bin/cli.mjs` `statsIo()` — exactly `readdirSync`/`lstatSync`/`readFileSync`/`existsSync` | `engine/__tests__/stats-read-only.test.js` (before/after tree snapshots, success + failure paths) | No | — | — |
| 9 | REQ-STATS-09 | Unknown feature exits non-zero, named, never truncated partial JSON | `lib/stats.mjs:432` `not_found` | `engine/__tests__/stats-cli.test.js`; smoke: `stats nope --json` ⇒ exit 1, 3-key error object | No | — | — |
| 10 | REQ C-1 / C-2 / C-3 / C-4 / C-5 | Read-only; live-over-archived preference never summed; fixed spec set; configurable process set; driver-parser fidelity | `lib/stats.mjs:398` `findFeatureDir`; parsers injected, never re-implemented | `stats-cli-structure.test.js:447` (`===` identity with `orchestrate-dev.js` exports), `:456` (pass-through), `:221` (single construction site) | No | — | — |
| 11 | PROP-CLI-01…08 | Argv surface, closed flag set, exit codes ∈ {0,1}, cwd resolved once, unexpected-throw handling | `lib/stats.mjs:145`; `bin/cli.mjs` `FLAGS_BY_COMMAND.stats`, `cmdStats`, `USAGE` line | `statsArgv.test.js`; `stats-cli.test.js`; `stats-cli-structure.test.js` | No | — | — |
| 12 | PROP-DISC-01…10 | Discovery: preference byte-identity, directories only, `completed` as container, unclassified bucket, ordering, empty root | `lib/stats.mjs:360` | `statsDiscovery.test.js`; `statsRealPaths.test.js` | No | — | — |
| 13 | PROP-RR-01…13 | Round derivation, malformed partition, collision `unmeasurable`, per-doc-type harvested, frozen row set | `lib/stats.mjs:220`, `:183` | `statsMetrics.test.js`; `statsAntiDrift.test.js`; `statsRealPaths.test.js` | No | — | — |
| 14 | PROP-DOD-01…04 | Highest version wins; harvested vs `0`; leftovers contribute nothing | `lib/stats.mjs:250,255` | `statsMetrics.test.js`; `statsRealPaths.test.js:87` | No | — | — |
| 15 | PROP-HALT-01…08 | Per-phase entries, fail-closed `open`, `[^-]+` phase capture, verbatim phase id, code-unit ordering | `lib/stats.mjs:269` | `statsMetrics.test.js`; `statsRealPaths.test.js` | No | — | — |
| 16 | PROP-RATIO-01…03, 06…10 | Membership by removal probe, neither-list files inert, harvested-before-zero precedence, one rounded value in both modes | `lib/stats.mjs:289`, `:210` `round2`, `:510` `ratioToken` | `statsMetrics.test.js`; `statsRender.test.js` | No | — | — |
| 17 | PROP-RATIO-04 | Symlink contributes its own size — behavioural, on `realStatsIo()` | `lib/stats.mjs:298` `sizeOf` | `statsRealPaths.test.js:150-181` | No | — | — |
| 18 | PROP-RATIO-05 | `bin/cli.mjs` whole source matches boundary-anchored `statSync(` zero times — structural | `bin/cli.mjs` `statsIo().fileSize` (`lstatSync`) | `stats-cli-structure.test.js:512-552` | No | — | — |
| 19 | **PROP-RATIO-11** | **Symlink size taken from the SHIPPED seam, driven end-to-end: `main(["node","pdlc","stats",{feature},"--json","--cwd",{tempRoot}])` over a temp root holding a small regular file plus a symlink to an order-of-magnitude larger target; the reported total must equal the link's own `lstat` size.** | `bin/cli.mjs` `statsIo().fileSize` — present and correct | **Not found** | **YES** | **medium** | Local |
| 20 | PROP-RENDER-01…06 | Single/fleet layouts, `none` line, ratio line carries byte totals, gap+unclassified rows inline | `lib/stats.mjs:527-585` | `statsRender.test.js` | No | — | — |
| 21 | PROP-JSON-01…10 | One document, empty stdout on usage error, key set-equalities, states inside their metric, `schemaVersion === 1` | `lib/stats.mjs:617` | `statsRender.test.js`; `statsOutcome.test.js`; `stats-cli.test.js` | No | — | — |
| 22 | PROP-ERR-01…10, PROP-RO-01…06, PROP-DRIFT-01…07, PROP-PBT-01…04, PROP-NEG-01…04 | Refusal corpus and reason set-equality, read-only snapshots, parser reference identity, vendoring membership, bounded generative properties, negative properties | `lib/stats.mjs:409-462`; `bin/cli.mjs` `statsParsers`/`statsIo`/`cmdStats`; `prepack.mjs`/`publish-preflight.mjs`/`fixture-machine.mjs` | `statsOutcome.test.js`; `statsProperties.test.js` (fast-check, 24 uses); `stats-read-only.test.js`; `stats-cli-structure.test.js`; `stats-vendoring.test.js`; `coverageInstrumentation.test.js` | No | — | — |

## §3 Criterion-4 Coverage

`pdlc/workflows/lib/stats.mjs` — **96.27% branch**, 99.68% statements, 100% functions, well above the 85% floor. The full `npm run test:coverage` gate (stage 2, `--per-file --branches 85`) exits 0. The engine suite is green: 925 pass, 0 fail, 2 skipped (the two `isRoot`-guarded unreadable-directory legs, which is a declared and correct guard, not a coverage evasion).

Lines 443–444 (`unreadable_feature` catch) read as uncovered under a workflows-only run; they are exercised by `engine/__tests__/stats-cli.test.js:294-307` via a real `chmod`ed directory, so this is a suite-boundary artefact, not a gap.

Property-based testing is present and real: `statsProperties.test.js` uses `fast-check` across partition, state-totality, order-independence and boundedness properties over the parameterisable metric core.

## §4 Criterion-6 Integration Boundary

**(a) Adjacent-surface falsification.** One finding — §1 #1, the falsified module header. Its disclosure family was swept: `grep` for `not defined here` / `land in later tasks` / `lands in T-` across `pdlc/workflows/lib/` and `pdlc/engine/bin/` returns exactly this one module, so there is no second stale member.

The rest of the boundary is clean, and notably well handled:
- **Multi-writer sweep.** `pdlc stats` writes only stdout/stderr and `process.exitCode`. `main()`'s `switch` breaks immediately after `cmdStats`, and no later stage in `bin/cli.mjs` rewrites either. The launcher correctly exempts `stats` from the two dispatching commands that resolve. The operator-visible artifact was traced end-to-end, not to builder output: the real binary was run against the shipped default config for single-feature, `--json`, fleet, not-found and bad-flag paths, and all five produce the specified output.
- **Vendoring family enumerated and fully covered.** `lib/stats.mjs` was added to *all* sibling writers, not just the nearest: `prepack.mjs` `MODULE_NAMES`, `publish-preflight.mjs` `WORKFLOW_MEMBERS`, `fixture-machine.mjs` `WORKFLOW_MODULE_NAMES`, and `_tspec-packed-set.mjs`.
- **Recorded derivations re-measured.** `coverageInstrumentation.test.js`'s prose counts were updated with the code ("the six-member literal" → "seven-member", "the two lib/ modules" → "three"), and the `c8.include` array-equality literal was extended at the correct index. These are exactly the counted-claim surfaces that usually go stale; they did not.
- **Runtime artifact in sync.** `node pdlc/workflows/build-runtime.mjs --check` reports `in-sync`, satisfying the repo rule that `pdlc/workflows/dist/` is rebuilt in the same commit as any workflow-source change.
- **Doc surfaces updated.** `pdlc/OPERATIONS.md` gained a `pdlc stats` section (incl. the exit-code contract) and `pdlc/README.md` the CLI line. `CLAUDE.md` carries no CLI-subcommand enumeration to falsify — it delegates operational detail to `OPERATIONS.md` — so its silence is correct, not stale. No new CI workflow was added, so FSPEC §5.1's four-check table is untouched.

**(b) Deferral binding.** No unbound deferrals. REQ O-4 explicitly declares NG-2 (cross-repo aggregation), NG-3 (payload size) and NG-8 (dispatch count) as out-of-scope non-capabilities owing no successor, which is a legitimate scope-out rather than a deferral. NG-1's `harvest-learnings`/`consolidate-learnings` JSON-consumption follow-up is bound to real queue rows: `docs/_queue/QUEUE.md` rows 28 (`pdlc-review-tightenings`), 29 (`pdlc-queue-autoresolve`) and 30 (`pdlc-phase-g`) all carry `depends-on: pdlc-stats`, and rows 29 and 30 name `pdlc stats` output in their REQ bodies. These are queue rows with successor REQ files on disk, not runbook prose.

## Notes for the remediator

Two items, both small; neither is a correctness defect in the shipped behaviour.

1. **§1 #1 (low)** — a comment-only edit to `pdlc/workflows/lib/stats.mjs:12-20`. No code change, no test change. Do not delete the TSPEC section references (`§3.1`, `§3.2`, `§4.1`, `§4.2`) — they are load-bearing navigation; only the task-narrative and the "not defined here" claim are false.

2. **§2 #19 / PROP-RATIO-11 (medium)** — add the missing end-to-end test. The property is deliberate and explicitly anticipates the two tests that *do* exist: it states it is "the only behavioural evidence on the **shipped** seam", because PROP-RATIO-04 exercises the `realStatsIo()` test double and PROP-RATIO-05 is source-level. The existing equivalence oracle at `stats-cli-structure.test.js:535-552` — asserting `statsIo()` and `realStatsIo()` make an identical `node:fs` call set — is precisely the "helper-plus-call-set-equivalence" the property names as insufficient. Implement it as PROP-RATIO-11 specifies: drive `main(["node","pdlc","stats",feature,"--json","--cwd",tempRoot])` over a temp root holding one small regular spec file plus one symlink whose target is an order of magnitude larger, parse stdout, and assert the process-side byte total equals the link's own `lstat` size and is strictly less than the target's. `engine/__tests__/stats-cli.test.js` is the right home (it already drives `main()` 18 times). Verify the oracle by mutation: switch `statsIo().fileSize` to `statSync` and confirm the new test goes RED — the structural oracle at `:525` will also red, which is expected and fine.
