# CODE REVIEW — pdlc-wave-resume (v1)

| Field | Detail |
|---|---|
| Feature | pdlc-wave-resume |
| Branch | feat-pdlc-wave-resume |
| Review version | 1 |
| Date | 2026-08-24 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 72.13% (`pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`) |
| Requirements traced | 10/10 REQ ACs implemented; 4 PROPERTIES obligations untraced |

**Scan basis.** `git diff --name-only main...HEAD` → production surface is
`pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`,
`pdlc/workflows/package.json`, the generated `pdlc/workflows/dist/pdlc-cli.mjs`, plus docs
(`CLAUDE.md`, `pdlc/OPERATIONS.md`, `docs/_constraints/*`, `docs/requirements/traceability-matrix.md`).
`npm test` → 123 suites, 4495 passed, 0 failed. `npm run test:coverage` → exit 0
(`orchestrate-dev.js` 88.90 % branch, delta gate reports 0 uncovered lines inside the introduced
ranges). `node pdlc/workflows/build-runtime.mjs --check` → in-sync.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Coverage (crit. 4) | medium | `pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs` (whole module) | New production module measures **72.13 % branch** (`npx c8 --include='**/scripts/check-wave-resume-delta-coverage.mjs' npm test -- waveResumeDeltaGate`; uncovered `78, 120, 247`, funcs 60 %), below the 85 % DoD floor. It is also **absent from `package.json`'s `c8.include` set**, so the shipped `test:coverage` gate — which this same feature wires into the required `Unit tests (ubuntu-latest, node 20)` check — never measures it. The module is not test-only: it is step 3 of `test:coverage` and can fail CI. | Either add `**/pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs` to `c8.include` and cover the uncovered branches (the injected-IO defaults at `:78`, the diff-failure arm at `:120`, the non-`GateFailure` rethrow at `:247`) to ≥85 %, or record an explicit, REQ-level scope-out for the module with the reason the floor does not apply. | Local |

No criterion-1 (stub/TODO/placeholder), criterion-2 (unwired integration) or criterion-3 (mock/fake
data) violations were found in the production diff. Function bodies were read, not signatures:
`classifyWaveLedger` implements all seven guards, `headCorroborated` implements the three fail-open
arms, `writeWaveLedger` implements the best-effort notice, and `runDeltaCoverageGate` implements the
base resolution, hunk parsing, uncovered-line derivation and both readings of an empty range set.
`.claude/pdlc-wave-state.json` has exactly one reader and one writer, both in `orchestrate-dev.js`;
no other module in `pdlc/workflows` or `pdlc/engine` names the path.

## §2 Requirements Traceability

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ-WVR-01 | Automatic resume at the failed wave | `orchestrate-dev.js:16259-16289` (`decision.outcome === "resume"`) | `waveExecution.test.js:2279` | No | — | — |
| 2 | REQ-WVR-02 IG-1..5 | Foreign/stale record → announced full run | `classifyWaveLedger` guards 2–6, `orchestrate-dev.js:12905-12995` | `waveExecution.test.js:2884`; `waveResume.test.js` (parse arms, guard table) | No | — | — |
| 3 | REQ-WVR-02 IG-6 | Absent record → **silent** full run | `orchestrate-dev.js` guard 1 (`silent: true`) | `waveExecution.test.js:2988` | No | — | — |
| 4 | REQ-WVR-03 | Verification independence (gate before first commit) | wave loop gate ordering, unchanged | `waveExecution.test.js:2556-2582` (H-1 ordered event sink, 4 fixtures) | No | — | — |
| 5 | REQ-WVR-04 | Operator override outranks the record | `orchestrate-dev.js:16217` + `if (!explicitPointer)` guard | `waveExecution.test.js:2758` (incl. write-side plan-absolute `lastGreenWave: 3`) | No | — | — |
| 6 | REQ-WVR-05 | Retention with invalidation | record left standing on skip; `ledgerWrites` empty | `waveExecution.test.js:2347`, `:2358` | No | — | — |
| 7 | REQ-WVR-06 | Completion evidence is never commit presence | write site keyed on transport, not on staged paths | `waveExecution.test.js:3044` | No | — | — |
| 8 | REQ-WVR-07 | Unattended queue parity | `orchestrate-queue` `_runPipeline` default (unchanged) | `waveResumeQueueParity.test.js` (8 tests) | No | — | — |
| 9 | REQ-WVR-08 | All waves recorded → Phase I skipped in full | `orchestrate-dev.js` `skip-phase` arm + `⏭` report row | `waveExecution.test.js:2358` | No | — | — |
| 10 | REQ-WVR-09 | Verified-but-uncommitted is never recorded | write guarded on git transport | `waveExecution.test.js:2669` | No | — | — |
| 11 | REQ-WVR-10 (repo half) | The record never becomes tracked content | `.gitignore:46` `/.claude/pdlc-wave-state.json` | `waveResumeRepoState.test.js:76` (`check-ignore -v` resolves to that line) | No | — | — |
| 12 | **PROP-REPO-03** (REQ-WVR-10 run half) | No commit a run produces may contain the record: the `_git` `add` argv list across a full run names `.claude/pdlc-wave-state.json` nowhere | Emergent (no wave owns the path) | **Not found** — `grep -n "WAVE_STATE_PATH" waveExecution.test.js` shows only read/write/banner uses; no `add`-argv assertion exists in any suite | **YES** | high | Local |
| 13 | **PROP-SKIP-04** | Under outcome (c): flattened `add` argv list set-equal to `[]`, **and** the positive `["rev-parse","--abbrev-ref","HEAD"]` branch-guard conjunct proving the git seam was live | `orchestrate-dev.js` skip arm | Partial — `waveExecution.test.js:2358` asserts the V-wave dispatch count and the gate command, but passes `git: makeGit([])` (calls discarded), so neither the `add`-list nor the branch-guard conjunct is asserted. As written the absence half is an absence-only oracle, which PROPERTIES R-3 forbids | **YES** | medium | Local |
| 14 | **PROP-COV-03** | Each of TSPEC §5.5's five mutations applied, observed RED against its named oracle, reverted, failure output **recorded** | n/a (process duty) | **Not found** — no repo artifact records the mutation runs or their RED output | **YES** | medium | Process |
| 15 | **PROP-PARITY-04** | The queue-parity falsification arm must be executed and its output recorded ("a parity net that cannot be shown to fail is not a net") | n/a (process duty) | **Not found** — no repo artifact records the arm's execution | **YES** | low | Process |
| 16 | PROP-PRE-01/-02 | Pre-flight export/key/config gate | exports + `package.json` | `waveResumePreflight.test.js` (11 tests) | No | — | — |
| 17 | PROP-LAW-01..04 | Generative round-trip, totality (reader/classifier), hash discrimination | `parseWaveLedger`, `formatWaveLedger`, `classifyWaveLedger`, `computePlanHash` | `waveResumeProperties.test.js` (fast-check, `numRuns: 500`) | No | — | — |
| 18 | PROP-DISREGARD-07/-08/-09 | Ancestry probe laziness, zero-probe honouring, unanswerable probe honoured | `headCorroborated` + `ANCESTRY_INDEPENDENT_CODES` | `waveExecution.test.js:2472`, `:2519`, `:2585` | No | — | — |
| 19 | PROP-DISREGARD-11 | The announcement catalogue is closed at five announcing rows | §2.4 suffixes | `waveExecution.test.js:3068` | No | — | — |
| 20 | PROP-REPO-04 | `M-WVR-1`/`M-WVR-2` promoted into a new baseline section with version bump | `docs/_constraints/pdlc-wave-gate-baseline.md` §5, Version 1.2→1.3 | `waveResumeRepoState.test.js` (`M-WVR-1`) | No | — | — |
| 21 | PROP-COV-01/-02 | `test:coverage` exits 0; no uncovered line inside the introduced ranges | `scripts/check-wave-resume-delta-coverage.mjs` | Measured: `orchestrate-dev.js` 88.90 % ≥ 88.75 baseline; delta gate "uncovered lines inside introduced ranges: 0" | No | — | — |

## §3 Integration-Boundary Findings (criterion 6)

| # | Kind | Severity | File:Line | Falsified / unhandled / unbound | Required fix | Scope |
|---|---|---|---|---|---|---|
| B-1 | Adjacent-surface falsification (6a) | medium | `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md:29`, `:40-42` | The decision record still calls the mechanism the "**interim** wave ledger (`WAVE_STATE_PATH`, `orchestrate-dev.js:9976`)" and states that "**the ledger is not observably firing**", citing `docs/pdlc-wave-resume/REQ…§1, queue row 20`. This diff removes the INTERIM framing from the shipped source (`orchestrate-dev.js:12846`) and makes the ledger observably fire under three announced outcomes, so both clauses are now false. The cited line number `:9976` is stale as well. | Update the two clauses to the shipped state (or mark the paragraph as a dated record of the 2026-08-13 decision), and drop/repoint the stale line citation. | Cross-Feature |
| B-2 | Deferral binding (6b) | medium | `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md:44-45` | "Revisiting to `2` is in scope **once wave resume lands** and re-invocation demonstrably resumes the failed wave — recorded as revisitable, not settled forever." This feature *is* the named trigger, and the deferral names no successor: `docs/_queue/QUEUE.md` has no row for revisiting `advisory.waveBudgetPerRun`, and no successor REQ file exists. Bare prose is not a successor. | Add a `docs/_queue/QUEUE.md` row (or a named successor REQ) for the `waveBudgetPerRun` revisit, or close the deferral explicitly in the decision record. | Cross-Feature |
| B-3 | Re-measured derivation now false (6a) | low | `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md` G-4 (`:674-699`), § revision-history 1.3 (`:20`), routed-errata table (`:749`) | G-4 records, as a live red measured 2026-08-23, that `.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json` and `pdlc/workflows/coverage/**` are **tracked on this branch** and that `check-ignore` therefore exits 1; and the errata table records the `A1_GLOBS` entry as "still absent at HEAD". Re-measured at the current tip: `git ls-files .claude` → only `pdlc.config.example.json`, `settings.json`; `git ls-files pdlc/workflows/coverage` → 0; `git check-ignore -v .claude/pdlc-wave-state.json` → `.gitignore:46` exit 0; `documentOracles.test.js:740` carries `docs/pdlc-wave-resume/**`. All three claims were falsified by later commits on this same branch. | Re-measure G-4, § 11's local-red enumeration and the errata table against the branch tip and restate them as closed. | Local |
| B-4 | Adjacent-surface falsification (6a) | low | `pdlc/OPERATIONS.md:40` | The new operator-facing text claims the record "is **only ever** honoured when it names this feature and hashes to this plan, and when the commit it records is an ancestor of `HEAD`." Shipped behaviour honours it in two further cases the same feature specifies: FSPEC EC-21 (record names no commit → honoured, zero probes, `orchestrate-dev.js:16243`) and FSPEC EC-07 (probe absent or throwing → honoured, `:16246`, `:16254`). | Add the two fail-open cases to the sentence, so the runbook matches `headCorroborated`. | Local |

Family sweep performed: `grep -rn "pdlc-wave-state"` over `pdlc/workflows/*.js`, `pdlc/workflows/scripts/`
and `pdlc/engine/{lib,bin,scripts}` returns exactly one production site (`WAVE_STATE_PATH`), so the
record has a single writer and a single reader — no later-stage overwrite of the traced artifact
exists. `grep -rni interim` over `pdlc/`, `CLAUDE.md`, `docs/_queue/`, `docs/_decisions/` and `.claude/`
found the disclosure family behind B-1; the only other hits are an unrelated `ER-6` interim, a test
fixture snapshot of a historical file list, and untracked local artifacts
(`.claude/workflows/pdlc-cli.mjs`, `pdlc/workflows/coverage/lcov-report/`), which ship nothing.
`docs/ideas/halt-hardening-followups.md` §2 (the `planHash` re-key follow-up that names this feature)
**is** bound — `docs/_queue/QUEUE.md` row 22, `pdlc-halt-hardening-followups`.

## Notes

- Findings 12 and 13 are the sharpest: REQ-WVR-10's run-side conjunct and PROP-SKIP-04's
  positive/negative pair are the two places where the suite currently proves less than PROPERTIES
  says it proves. Both are additive test work in `waveExecution.test.js`; neither requires a
  production change. For 13, replace `git: makeGit([])` in the outcome-(c) test at `:2358` with a
  recording double and assert the flattened `add` list is `[]` **and** that
  `["rev-parse","--abbrev-ref","HEAD"]` was called.
- Finding 1 is the only criterion-1..4 defect. Note the asymmetry it creates: the feature adds a
  coverage gate to CI for `orchestrate-dev.js` while the gate's own module is unmeasured.
- Findings 14 and 15 are process duties whose evidence lives in agent task reports, not the
  repository. If the pipeline intends them to be verifiable after the fact, the evidence needs a
  tracked home; otherwise they should be restated as non-repo obligations.
- No stubs, no mock data, no unwired integrations. `build-runtime.mjs --check` is in-sync, so
  `dist/pdlc-cli.mjs` was rebuilt with the source change as required.
