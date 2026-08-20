# CODE REVIEW — pdlc-advisory-wave-gate (v1)

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-wave-gate |
| Branch | feat-pdlc-advisory-wave-gate |
| Review version | 1 |
| Date | 2026-08-20 |
| Verdict | Findings |
| Branch coverage (lowest new region) | 84.85% (A6 regions of `orchestrate-dev.js`; file-level 85.49%) |
| Requirements traced | 27/33 (27 ACs + 6 NFRs) |

Scope of the code scan: the 58 commits `5a365aae^..HEAD` (A6-00 pre-flight gate through CR round 2),
which touch `pdlc/workflows/orchestrate-dev.js` (+1183/-53), `pdlc/workflows/orchestrate-queue.js`
(3 lines), `.claude/pdlc.config.example.json`, the generated `pdlc/workflows/dist/pdlc-cli.mjs`, and
ten test suites. `main...HEAD` spans several earlier unmerged features and was **not** used to scope
criteria 1–3.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Mock/local data in the repo | high | `.claude/workflows/orchestrate-dev.bundle.js`, `.claude/workflows/orchestrate-queue.bundle.js`, `.claude/workflows/pdlc-cli.mjs`, `.claude/workflows/.pdlc-drift-state.json`, `.claude/workflows/.pdlc-sync-manifest.json`, `.claude/pdlc-wave-state.json` | Six machine-local runtime/state artifacts are **tracked** at HEAD. They are absent on `main`; the `.claude/workflows/*` four were re-added by this feature's commit `e3b9d5a3` ("docs(cross-review): se REQ v7 — High findings"), which also swept in 14 `.pdlc-backups/*.bak` blobs (since removed, and `.pdlc-backups/` gitignored by A6-00). These are exactly the consumer-runtime copies `pdlc-plugin-retirement` T22 deleted, and `.claude/pdlc-wave-state.json` is the local wave ledger REQ §1 describes as a working-tree observation. | `git rm --cached` all six; restore an ignore rule for `.claude/workflows/` and `.claude/pdlc-wave-state.json` (the `/.claude/workflows/` rule was dropped at retirement T22 `c9be212e`, so nothing stops a re-add). | Local |
| 2 | Branch coverage < 85% | medium | `pdlc/workflows/orchestrate-dev.js` — A6 regions (≈1940–2015, 2370–2450, 3040–3720, 10430–10460, 12540–12700) | Measured from `coverage-final.json`: **252/297 branches = 84.85%** across A6's own added regions (statements 97.00%). File-level is 85.49%, repo aggregate 83.61%. Uncovered statements inside A6 regions: `orchestrate-dev.js:2407, 3283, 3435, 3461, 12544, 12577, 12586, 12612` — `2407` is `parseA6Promotion`'s non-string arm, `3435`/`3461` are the record- and escalation-log **write-failure** notice arms, `12577`/`12586`/`12612` are `captureTreeSnapshot`/`restoreTreeSnapshot` git-failure arms. Error paths, not happy paths. | Add cases for the four uncovered error arms; re-measure the A6 region to ≥85%. | Local |
| 3 | Missing property-based tests | medium | `pdlc/workflows/orchestrate-dev.js:2378` (`parseA6RootCause`), `:2406` (`parseA6Promotion`), `:2429` (`citesGateOutput`), `:1999` (`a6ProhibitedPaths`), `:2096` (`nonNegativeInt`) | A6 introduces five pure, parameterisable helpers (two trailer parsers, a substring/normalisation validator, a set derivation, a numeric validator). All are exercised by hand-written `test.each` tables only. `fast-check` appears nowhere in the repo (`grep -rl "fast-check" pdlc/workflows/__tests__` → empty), so no generative input space is explored — e.g. `citesGateOutput`'s whitespace-collapse-then-substring contract at the 24-char floor has no generative falsifier. | Add `fast-check` properties for the parsers and `citesGateOutput` (round-trip / idempotence / floor-boundary), or record an explicit project-level decision that the table-driven convention substitutes. | Local |
| 4 | Coverage exemption on a served flow | medium | `.claude/pdlc.config.example.json` (`implementation.testCommand`) | The **shipped default gate command** ends `--testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'`. Real-config smoke, run for this review: the shipped command is **green** (engine 845 pass; workflows 100 suites, 4018 pass) while plain `cd pdlc/workflows && npm test` is **RED** — `documentOracles.test.js` fails `PROP-SWEEP-2(b)` on this feature's own artifacts (finding 5). The exclusion pre-dates this feature, but it is what let finding 5 land invisibly: A6's own wave gate would never have caught it. | Either narrow the exclusion to the environment-sensitive `AT-22` case and let `PROP-SWEEP-2(b)` run in the gate, or record the exemption and its owner in `pdlc/OPERATIONS.md`. | Process |
| 5 | Adjacent-surface falsification (red gate) | high | `pdlc/workflows/__tests__/documentOracles.test.js:583` (`PROP-SWEEP-2(b)`, retirement FSPEC AC-1.2) | The retirement sweep gate — `grep -rln '<7-term alternation>' $(git ls-files)` minus A-1's frozen glob list — must be **empty**. It now returns **23 tracked paths**, every one attributable to this feature: the 4 `.claude/workflows/*` files of finding 1, 18 of this feature's own docs (`CROSS-REVIEW-*-PLAN-v6…v12`, `CROSS-REVIEW-product-manager-DECISIONS-v10`, `CROSS-REVIEW-product-manager-TSPEC-v12`, `CROSS-REVIEW-software-engineer-PROPERTIES-v1`, `DECISIONS-`, `PLAN-`, `PROPERTIES-`, `TSPEC-pdlc-advisory-wave-gate.md`), and `pdlc/workflows/__tests__/advisoryWaveGate.test.js`. Verified against a clean tree (`git status --porcelain` empty; `coverage/` removed before the run). | Untrack the four runtime files (finding 1); then either fragment-assemble the retired terms at their remaining occurrences (the discipline `documentOracles.test.js:470` and `document-oracles.mjs`'s `COVERED_PATTERNS` already use for the same self-reference reason) or add a per-file disposition row for `docs/pdlc-advisory-wave-gate/**` to `docs/_constraints/pdlc-retirement-baseline.md`'s A-1 glob table — `PROP-SWEEP-3` requires the disposition, so a bare glob addition is not enough. | Cross-Feature |
| 6 | Stale disclosure family | high | `pdlc/OPERATIONS.md:52`, `:57–62`, `:63–65`, `:74` | Four claims in the runbook's "Advisory tier" section are falsified by this diff: (a) `:52` "remediation at **five** named seams"; (b) `:57–62` the seam bullet enumerates `A1`…`A5` with no `A6`; (c) `:63–65` the config-key list is `enabled`/`attemptBudget`/`seamBudgetMinutes`/`envelope` — missing `waveBudgetPerRun` (`orchestrate-dev.js:1948`) — and calls `envelope` a "four-member literal" where `ENVELOPE_DEFAULTS` now carries E-1…E-6; (d) `:74` "the final report's `advisory` field carries **five** per-seam rows", where `advisorySummaryRows` maps over `ADVISORY_SEAMS` (`orchestrate-dev.js:1952`, six members; `:3691`) and `orchestrate-dev.js:16106`'s own comment already says "six". This is the whole disclosure family, not the nearest occurrence: `CLAUDE.md` and `README.md` carry no seam-count prose (checked). | Update all four sites in the same commit. | Cross-Feature |
| 7 | Falsified doc claim | medium | `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` §1 ("Corroborating evidence, re-measured 2026-08-18") | The REQ's measured claim reads "one **untracked** `.claude/pdlc-wave-state.json`". At HEAD that file is tracked (`git ls-files .claude/` lists it). The measurement the REQ's M-WG-6 correction rests on is stale against its own branch tip. | Re-measure and restate, or untrack the file per finding 1 and the claim becomes true again. | Cross-Feature |
| 8 | Unbound deferral | medium | `docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md` PROP-REST-03; `pdlc/workflows/__tests__/advisoryWaveGate.test.js:502`; TSPEC §6 OQ-7 | PROP-REST-03 (the `git clean -fd` vs `-fdx` boundary under AC-5.1) ships as `test.todo` — the suite's only `todo` — pending OQ-7, recorded "Open, **not decided here** — raised as an erratum on FSPEC BR-9 / AT-05-1 and REQ AC-5.1". The successor named is an *erratum on an upstream doc*, which is prose, not a queue row. No `docs/_queue/QUEUE.md` row and no successor REQ owns OQ-7. Contrast the six `D-AWG-*` deferrals, which are correctly bound (rows 6 `pdlc-engineering-loop` and 20 `pdlc-wave-resume`, both with REQ files on disk — verified). | Add a QUEUE row owning OQ-7's boundary decision, or bind PROP-REST-03 to row 6 the way D-AWG-01…06 are bound. | Process |

## §2 Requirements Traceability

Every REQ acceptance criterion and NFR, traced through the PROPERTIES §C-1 AC→property map to a test.
Implementation paths are `pdlc/workflows/orchestrate-dev.js` unless noted; test paths are relative to
`pdlc/workflows/__tests__/`.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-1.1 | Seam catalogue carries a sixth member `A6` | `:1952` `ADVISORY_SEAMS` | `advisoryEnvelope.test.js:312` (PROP-SEAM-01), `advisoryRecord.test.js:496,505` | No | — | — |
| 2 | REQ AC-1.2 | A6 fires on exactly one condition (script-owned gate) | `:3349`, call site `:15365` | `advisoryWaveGateMain.test.js:199` (PROP-SEAM-07/08) | No | — | — |
| 3 | REQ AC-1.3 | A6 does not fire on the PROPERTIES V-wave | `:3361` guard | `waveExecution.test.js:965` (PROP-SEAM-04), `:982` | No | — | — |
| 4 | REQ AC-1.4 | Provably inert when `advisory.enabled` is false | `:3389` early return | `advisoryDisabled.test.js:646` (PROP-SEAM-05), `:620` (PROP-SEAM-06), `advisoryWaveGateMain.test.js:230` (PROP-SEAM-09) | No | — | — |
| 5 | REQ AC-1.5 | No-manifest / no-script-gate inapplicability notice, once per run | `:1933`, `:3361` | `advisoryWaveGateMain.test.js:199,215` (PROP-SEAM-07/08/10) | No | — | — |
| 6 | REQ AC-2.1 | Verdict shape unchanged but for the classification; malformed ⇒ escalation | `:3158` `classifyReply` wrapper | `advisoryWaveGate.test.js:1282` (PROP-CTR-04), `:1308` (PROP-CTR-06) | No | — | — |
| 7 | REQ AC-2.2 | Closed four-member root-cause catalogue | `:1954`, `:2378` `parseA6RootCause` | `advisoryWaveGate.test.js:169,1200` (PROP-CTR-02/03), `advisoryDriver.test.js:906` (PROP-GATE-11) | No | — | — |
| 8 | REQ AC-2.3 | Diagnosis cites the gate command's own output | `:2429` `citesGateOutput`, `:3165` | `advisoryWaveGate.test.js:214,535` (PROP-CTR-05/07) | No | — | — |
| 9 | REQ AC-2.4 | Escalate rather than retry when any budget is exceeded | `:3510` wave budget, `:2096` `nonNegativeInt` | `advisoryWaveGate.test.js:1333,1392,1497,1058,1577` (PROP-CTR-09…13) | No | — | — |
| 10 | REQ AC-3.1 | Envelope gains exactly E-5 and E-6 | `:1941` `ENVELOPE_DEFAULTS`, `:3112` | `advisoryEnvelope.test.js:282,291,380,443,279` (PROP-ENV-01/04/08/11/12) | No | — | — |
| 11 | REQ AC-3.2 | Tier exclusion set binds A6 unchanged | `:3083` matcher | `advisoryEnvelope.test.js:291` (PROP-ENV-04), `advisoryWaveGate.test.js:2277` (PROP-ENV-05), `advisoryEnvelope.test.js:77` (PROP-ENV-06) | No | — | — |
| 12 | REQ AC-3.3 | Four additional prohibitions (f)–(i), closed set | `:1964` `A6_PROHIBITIONS`, `:1985`, `:1999` `a6ProhibitedPaths`, `:3088` | `advisoryEnvelope.test.js:340` (PROP-ENV-10), `advisoryWaveGate.test.js:2158` | No | — | — |
| 13 | REQ AC-3.4 | Refusal reasons drawn from the tier's closed set, not extended | `:3444`, `:3465` | `advisoryEnvelope.test.js:258` (PROP-ENV-07), `advisoryWaveGate.test.js:1227` (PROP-CTR-08), `:1657` (PROP-REST-08) | No | — | — |
| 14 | REQ AC-3.5 | Violating proposal/production ⇒ no change, refusal recorded | `:3128`, `:3231` | `advisoryEnvelope.test.js:411` (PROP-ENV-09), `:340` (PROP-ENV-10) | No | — | — |
| 15 | REQ AC-4.1 | Gated only by the configured gate command; three positive conjuncts | `:3295` gate sequence, `:3250` | `advisoryWaveGate.test.js:1412` (PROP-GATE-03), `:1195` (PROP-GATE-04), `:1831` (PROP-GATE-05), `erratumProtocol.test.js:1008` (PROP-GATE-02) | No | — | — |
| 16 | REQ AC-4.2 | A6 never commits | `:3063` `buildA6SeamOps` exposes no committing transport | `erratumProtocol.test.js:1114` (PROP-GATE-07), `advisoryDriver.test.js:1015` (PROP-NFR-02) | No | — | — |
| 17 | REQ AC-4.3 | Never edits a test file, the PLAN, or the implementation config | `:1985` `A6_PROHIBITION_PATHS`, `:1999` | `advisoryEnvelope.test.js:340` (PROP-ENV-10 — the mapped property; AC-4.3 itself is cited in no test title) | No | — | — |
| 18 | REQ AC-4.4 | Whole gate sequence re-runs in shipped order; sequence equality | `:3295` shared gate-sequence helper, `:3259` | `advisoryDriver.test.js:31` (PROP-GATE-01), `:24` (PROP-GATE-06), `advisoryWaveGate.test.js:321,381` (PROP-REST-01/02), `:2521` | No | — | — |
| 19 | REQ AC-4.5 | Each of AC-4.1…AC-4.4 has a failing test proving the prohibition | — (meta) | PROP-ENV-10 ✔, PROP-GATE-05 ✔, **PROP-REST-04 ✘ (row 22)** | YES | high | Local |
| 20 | REQ AC-4.6 | E-6 repair reaches the committed state; later task's dispatch informed | `:3323` promotion grouping, `:10433` dispatch notice | `waveExecution.test.js:1136,1189` (PROP-GATE-08/09) | No | — | — |
| 21 | REQ AC-5.1 | Refusal / exhaustion / red re-gate ⇒ whole-tree restore | `:12566` `captureTreeSnapshot`, `:12635` `restoreTreeSnapshot`, `:3403` | `advisoryWaveGate.test.js:321` (PROP-REST-01), `:403` (PROP-REST-05), `:454` (PROP-REST-06); **PROP-REST-03 ships as `test.todo` at `:502`** — the ignored-path boundary is undelivered pending OQ-7 (finding 8) | YES | medium | Local |
| 22 | REQ AC-5.3 / AC-4.5 | Restoration triggers are exactly `{refusal, exhaustion, red re-gate}`; a green re-gate followed by an un-skip halt restores **nothing** | `:3250` (restore reached only on the three arms) | `waveExecution.test.js:1092` (AT-05-4) asserts only `haltAdvisory` deep-equality. PROP-REST-04's central conjuncts are absent: the fixture sets `repairApplied: false, repairPaths: []` where the property requires `true` and the repair's paths; nothing asserts the repair is still present in the working tree; nothing asserts **no restoration occurred** (no `_git` `read-tree` count). The property is unfalsifiable as tested — the "no restoration after a green re-gate" claim has no failing path. | YES | high | Local |
| 23 | REQ AC-5.2 | Unresolved wave ⇒ halt reason **equals** the pre-A6 reason; queue row written `halted`; tree is the restored one incl. first-pass build outputs | `:3346` fall-through to the wave's own gate halt | `waveExecution.test.js:943,965` (PROP-SEAM-03/04) cover the fall-through, but **PROP-REST-09 has no test**: the only A6-path assertions are `toContain` fragments (`advisoryWaveGateMain.test.js:368`, `waveExecution.test.js:1072,1087`), never equality against a captured pre-A6 baseline; no A6 run asserts the queue row is written `halted`; no assertion that first-pass build outputs survive the restore | YES | medium | Local |
| 24 | REQ AC-6.1 | Advisory-record entry per invocation, field set by set-equality | `:3091`, `:3418` | `advisoryRecord.test.js:4,39` (PROP-REC-01/02), `advisoryWaveGate.test.js:1657` (PROP-REST-08) | No | — | — |
| 25 | REQ AC-6.2 | Escalation-log entry carries the class and pipeline state | `:3426`, `:3819` `ADVISORY_SEAM_PHASES` | `advisoryEscalationLog.test.js:595,799,723` (PROP-REC-03/04/07) | No | — | — |
| 26 | REQ AC-6.3 | Halt report carries diagnosis + root cause in `advisory` fields | `:2678`, `:4035` | `advisoryRecord.test.js:310` (PROP-REC-05), `advisoryWaveGate.test.js:1270` | No | — | — |
| 27 | REQ AC-6.4 | `plan-ordering-defect` countable per feature from `ESCALATIONS.md` alone | `:3426` | `advisoryEscalationLog.test.js:636` (PROP-REC-06) | No | — | — |
| 28 | REQ NFR-1 | Every boundary enforced by the workflow script, never only by prompt | `:3083`, `:3088`, `:3128`, `:3231` | **Not found.** PROP-NFR-03 requires BR-1…BR-16 partitioned into proposable / non-proposable sets, the partition asserted by **set-equality against a transcribed literal**, each proposable rule driven by a stub agent double returning a violating proposal. `grep -rn "proposable" pdlc/workflows/__tests__/` returns nothing outside an unrelated `consolidationRoute` title; AT-07-1 is cited in no test file. Individual refusals are tested; the *partition* — the thing that proves no boundary is prompt-only — is not | YES | high | Local |
| 29 | REQ NFR-1 | No A6 datum at module scope; five pure helpers read no ambient state | `:3403` (wave-scoped snapshot), `:3396` (wave-scoped `invocations`), `:11780`, `:1999`, `:2378`, `:2429` | **Not found.** PROP-NFR-04 is cited in no test. `waveOwnedPaths`/`laterOwnedPaths`/`ownedSetCovers` are behaviourally tested (`advisoryWaveGate.test.js:82,107`, PROP-ENV-02) but nothing asserts run-/wave-/invocation-scoping or that the helpers read no `process` and no clock. A module-scope regression on `waveBudget` would leak across features in a queue run with no test going red | YES | medium | Local |
| 30 | REQ NFR-2 | Disabled-tier run byte-identical to the pre-advisory baseline | `:3389` | `advisoryDisabled.test.js:646,620` (PROP-SEAM-05/06), `advisoryWaveGateMain.test.js:230` (PROP-SEAM-09) | No | — | — |
| 31 | REQ NFR-3 | Dispatch options equal a shipped seam's, member for member; no `git` capability | `:3063` `buildA6SeamOps` | `advisoryDriver.test.js:1015` (PROP-NFR-02) | No | — | — |
| 32 | REQ NFR-4 | Budget window is dispatch→verdict, restarting each attempt | `:3481` | `advisoryWaveGate.test.js:1392` (PROP-CTR-10) | No | — | — |
| 33 | REQ NFR-5 | A green wave in a run that also carries a red-gated wave pays nothing | `:15365` per-wave call site | `waveExecution.test.js:1018` (AT-07-3) is a **single-wave** run: it asserts `a6.calls.length === 1` and that commits land. PROP-GATE-10's oracle is a run carrying **both** a green and a red-gated wave, with the green wave's dispatch count `0` *and* its post-gate commit performed, and the red wave's `≥ 1`. No two-wave fixture exists; `waveExecution.test.js:986` (AT-04-3) is an all-green run, a different population | YES | medium | Local |
| 34 | REQ NFR-6 | A6's rung resolved through the tier's resolver against the shared memo | `:3481` | `pipelineWiring.test.js` (PROP-NFR-01) | No | — | — |

Property coverage: 65 of the 71 `PROP-*` ids in PROPERTIES are cited by a test. Six are not
(`PROP-NFR-03`, `PROP-NFR-04`, `PROP-REST-09`, `PROP-GATE-10`, `PROP-REST-04`, `PROP-SEAM-02`); of
those, `PROP-SEAM-02` **is** delivered under its AT id (`advisoryRecord.test.js:496,505` read six —
the one literal TSPEC §1.3 recorded as untranscribed is now transcribed), and `PROP-GATE-10` and
`PROP-REST-04` are cited by AT id but with substituted, weaker oracles (rows 33 and 22).

## Notes

**Test-suite state.** `cd pdlc/workflows && npm test`: 100 of 101 suites pass, 4041 tests pass,
2 fail — both in `documentOracles.test.js`. `cd pdlc/engine && npm test`: 845 pass, 0 fail.
`node pdlc/workflows/build-runtime.mjs --check` reports `in-sync`, so `dist/pdlc-cli.mjs` carries the
source changes and the DEC-08 rebuild-and-stage discipline held across all seven waves.

**Environmental, not a finding.** The second `documentOracles` failure, `AT-22`
(`coveredViolations(LIVE_ROOT)`), reports three paths — `.serena/cache/typescript/document_symbols.pkl`,
`.serena/cache/typescript/raw_document_symbols.pkl`, `.tokensave/tokensave.db`. All three are
gitignored local tool caches, and `coveredViolations` walks the tree with `readdirSync` and never
consults git (the CLAUDE.md debugging note names exactly this failure mode). Not attributable to this
feature and not counted. `PROP-SWEEP-2(b)` (finding 5) is a different matter: it sweeps
`git ls-files`, so every one of its 23 residual paths is tracked.

**Trailer count mapping**, so the numbers are auditable against the tables above:

- `mock_data: 1` — §1 finding 1 (one class, six files).
- `coverage_below_threshold: true`, `branch_coverage_pct: 84` — §1 finding 2 (A6 regions 84.85%).
- `req_gaps: 6` — §2 rows 19, 21, 22, 23, 28, 29, 33 collapse to six distinct undelivered
  properties: PROP-REST-04 (rows 19 and 22 are the same defect), PROP-REST-03, PROP-REST-09,
  PROP-NFR-03, PROP-NFR-04, PROP-GATE-10.
- `boundary_gaps: 5` — §1 findings 4, 5, 6, 7, 8.
- `stubs: 0`, `unwired_integrations: 0` — the production diff carries no TODO/FIXME/placeholder/stub
  marker and no hollow body, and every A6 symbol is reached from the wave loop
  (`runWaveGateSeam` at `:15365` via the `_runWaveGateSeam` DI default, `a6ProhibitedPaths` at
  `:3088`, `citesGateOutput` at `:3165`, `parseA6Promotion` at `:3187`, `laterOwnedPaths` at `:3112`,
  `captureTreeSnapshot` at `:3403`, `restoreTreeSnapshot` at `:3250`).

**Ordering hint for the remediator.** Finding 1 is the cheapest and unblocks finding 5 partially
(4 of its 23 residual paths) and finding 7 entirely. Rows 22 and 28 are the two that matter most for
whether this seam is safe to enable: row 22 is the only oracle standing behind "a green re-gate
restores nothing", and row 28 is the only oracle standing behind "no boundary is prompt-only" —
G-2 and US-03 respectively. Finding 4 should be settled before the next round, or a repeat of
finding 5 will again be invisible to the pipeline's own gate.
