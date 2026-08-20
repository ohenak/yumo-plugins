# CODE REVIEW — pdlc-advisory-wave-gate (v2)

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-wave-gate |
| Branch | feat-pdlc-advisory-wave-gate |
| Review version | 2 |
| Date | 2026-08-20 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 88.23% (`build-runtime.mjs`); `orchestrate-dev.js` 88.44%; A6's own five regions 231/258 = **89.53%** |
| Requirements traced | 34/34 |

Scope: Delta re-verify over the seven remediation commits `32a24011..HEAD`
(`455644ec`, `c5ce8d56`, `6d98b622`, `4959cc3d`, `2fd56a5c`, `f0376063`, `68f2c5ca`).
Per the v2+ contract, unchanged code verified in v1 was not re-scanned. **No production
source file changed in this range** — the diff is tests, docs, config, ignore rules and
one `git rm --cached`, so criteria 1–3 have no new production surface to scan.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Adjacent-surface falsification (re-measured derivation) | medium | `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` §1 ("Corroborating evidence, **re-measured 2026-08-20**") | **v1 finding 7 regressed inside its own remediation.** `455644ec` re-measured the ledger paragraph to read "one **tracked** `.claude/pdlc-wave-state.json`" — true at that commit. The **very next** commit `c5ce8d56` (v1 finding 1) `git rm --cached`'d that exact path and added an anchored ignore rule, so at HEAD the file is **untracked** (`git ls-files --error-unmatch` → "Did you forget to 'git add'?"; it exists in the working tree only, gitignored). The word "tracked" is now false, and the v1.10 changelog entry asserting it is false with it. The paragraph's other claims re-measure clean: the record is this feature's own run (`feature: pdlc-advisory-wave-gate`, `lastGreenWave: 7`) and its recorded head `a998fae1` **is** an ancestor of the branch tip (verified `git merge-base --is-ancestor`). This is the same defect class v1 finding 7 named — a measured claim silently falsified by a later commit on the same branch — recurring because the two fixes landed 8 minutes apart in the wrong order and neither re-measured after the other. | Restate §1's evidence sentence at the branch tip: the ledger file is **untracked** (working-tree only, now ignored by `/.claude/pdlc-wave-state.json`), which is what makes it a working-tree observation rather than a shared artifact — and update the v1.10 changelog line, which currently records the opposite. No decision reopens; the economics argument is unaffected. | Cross-Feature |

## §1b Prior-Finding Disposition (v1 §1)

| v1 # | Finding | Remediation commit | Verified how | Status |
|---|---|---|---|---|
| 1 | Six machine-local `.claude/` runtime/state artifacts tracked | `c5ce8d56` | `git ls-files .claude/` now returns exactly `pdlc.config.example.json` + `settings.json`. Oracle in `documentOracles.test.js:426+` pins four conjuncts — none of the six tracked, **set-equality** on the tracked set (a seventh artifact reds), each ignored, and the fixture's nested `.claude/workflows/` **not** ignored (anchoring). Anchored rules `/.claude/workflows/`, `/.claude/pdlc-wave-state.json` added. T21's literal-string proxy correctly narrowed to M-11j's actual obligation. | **Remediated** |
| 2 | A6 regions 252/297 = 84.85% branch, under bar | `68f2c5ca` | Independently re-measured from c8 `lcov.info` over v1's own five region ranges: **231/258 = 89.53%**. `npm run test:coverage` (`--per-file --branches 85`) **exits 0**; per-file branch 88.44 / 88.75 / 88.23. Named error arms (`:3283`, `:12577`, `:12586`, `:12612`, `:3435`, `:3461`, `:12544`) now driven. | **Remediated** |
| 3 | No property-based tests for the five pure helpers | `f0376063` | `fast-check ^4.9.0` added to `package.json`; new `advisoryHelperProperties.test.js` (516 lines) carries real generative properties — TOTALITY, ROUND-TRIP, IDEMPOTENCE, LAST-WINS, CLOSEDNESS for `parseA6RootCause`; INDEPENDENCE/EMPTINESS for `parseA6Promotion`; SOUNDNESS + floor-boundary for `citesGateOutput`. Not assertion-free. | **Remediated** |
| 4 | Coverage exemption on a served flow (`documentOracles` excluded from shipped gate command) | `c5ce8d56` | Exclusion dropped from `.claude/pdlc.config.example.json`. `ci-arrangement.test.js:807+` pins the ignore set to the three structural patterns by `deepEqual`. **Mutation-verified**: re-adding `'documentOracles'` to the shipped command turns `ci-arrangement.test.js` RED (`# fail 1`); tree restored. | **Remediated** |
| 5 | `PROP-SWEEP-2(b)` red on the feature's own artifacts while the gate stayed green | `c5ce8d56` | Root cause fixed at source: AT-22 now filters `coveredViolations(LIVE_ROOT)` through `git check-ignore --no-index`, making it environment-independent, **with a non-vacuity control** proving the filter only ever removes ignored paths and that a real path (`orchestrate-dev.js`) survives. Residuals dispositioned: narrow `docs/pdlc-advisory-wave-gate/**` A-1 row in the retirement baseline (scoped to one feature dir, deliberately not `docs/*/**`, with a measured rationale), and the test-file sample path fragment-assembled per existing discipline. **Real-config smoke green.** | **Remediated** |
| 6 | Stale disclosure family — four falsified claims in `pdlc/OPERATIONS.md` | `6d98b622` | All four re-trued at `:52` ("six"), `:57–68` (A6 bullet added with its one-condition/never-commits/restore summary), `:69–73` (`waveBudgetPerRun` added, `envelope` now "six-member literal: E-1…E-6"), `:74` (row count). New `documentOracles` block **derives** expected text from `ADVISORY_SEAMS`/`ADVISORY_DEFAULTS`/`ENVELOPE_DEFAULTS`, so a seventh seam reds the runbook; count assertions are two-sided. Family confinement re-checked (CLAUDE.md, README.md carry no seam-count prose). | **Remediated** |
| 7 | REQ §1 measured claim stale on its own tip | `455644ec` | Fix landed, then **was itself falsified** by `c5ce8d56`. See §1 finding 1. | **REGRESSED** |
| 8 | OQ-7 / `PROP-REST-03` deferral bound to nothing | `4959cc3d` | `docs/_queue/QUEUE.md:187` binds OQ-7 to **row 6** (`pdlc-engineering-loop`, `pending`), which already carries a `Depends-On` edge on `pdlc-advisory-wave-gate`. The `test.todo` at `advisoryWaveGate.test.js:516` now names that row as its successor. A real queue row, not prose. | **Remediated** |

## §2 Requirements Traceability (carried forward from v1; `Gap?` updated)

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-1.1 | Seam catalogue carries sixth member `A6` | `orchestrate-dev.js:1952` | `advisoryEnvelope.test.js:312`; `advisoryRecord.test.js:496,505` | No | — | — |
| 2 | REQ AC-1.2 | A6 fires on exactly one condition (script-owned red gate) | `:3349`, call site `:15365` | `advisoryWaveGateMain.test.js:199` | No | — | — |
| 3 | REQ AC-1.3 | Never on a PROPERTIES V-wave | `:3361` guard | `waveExecution.test.js:965,982` | No | — | — |
| 4 | REQ AC-1.4 | Provably inert when `advisory.enabled` false | `:3389` early return | `advisoryDisabled.test.js:646,620`; `advisoryWaveGateMain.test.js:230` | No | — | — |
| 5 | REQ AC-1.5 | No-manifest / no-script-gate inapplicability notice | `:1933`, `:3361` | `advisoryWaveGateMain.test.js:199,215` | No | — | — |
| 6 | REQ AC-2.1 | Verdict classification | `:3158` `classifyReply` | `advisoryWaveGate.test.js:1282,1308` | No | — | — |
| 7 | REQ AC-2.2 | Four-member root-cause vocabulary | `:1954`, `:2378` | `advisoryWaveGate.test.js:169,1200`; `advisoryDriver.test.js:906`; **`advisoryHelperProperties.test.js:100` (generative)** | No | — | — |
| 8 | REQ AC-2.3 | Gate-output citation | `:2429`, `:3165` | `advisoryWaveGate.test.js:214,535`; **`advisoryHelperProperties.test.js:260` (generative)** | No | — | — |
| 9 | REQ AC-2.4 | Promotion trailers | `:3510`, `:2096` | `advisoryWaveGate.test.js:1333,1392,1497,1058,1577`; **`advisoryHelperProperties.test.js:183` (generative)** | No | — | — |
| 10 | REQ AC-3.1 | Envelope E-5/E-6 | `:1941` `ENVELOPE_DEFAULTS`, `:3112` | `advisoryEnvelope.test.js:282,291,380,443,279` | No | — | — |
| 11 | REQ AC-3.2 | Owned-set derivation | `:3083` | `advisoryEnvelope.test.js:291,77`; `advisoryWaveGate.test.js:2277` | No | — | — |
| 12 | REQ AC-3.3 | Four prohibitions (f)–(i) | `:1964`, `:1985`, `:1999`, `:3088` | `advisoryEnvelope.test.js:340`; `advisoryWaveGate.test.js:2158` | No | — | — |
| 13 | REQ AC-3.4 | Envelope closed, not extended | `:3444`, `:3465` | `advisoryEnvelope.test.js:258`; `advisoryWaveGate.test.js:1227,1657` | No | — | — |
| 14 | REQ AC-3.5 | Violating proposal ⇒ no change, refusal | `:3128`, `:3231` | `advisoryEnvelope.test.js:411,340` | No | — | — |
| 15 | REQ AC-4.1 | Gated only on the configured gate command | `:3295`, `:3250` | `advisoryWaveGate.test.js:1412,1195,1831`; `erratumProtocol.test.js:1008` | No | — | — |
| 16 | REQ AC-4.2 | A6 never commits | `:3063` `buildA6SeamOps` | `erratumProtocol.test.js:1114`; `advisoryDriver.test.js:1015`; **`advisoryWaveGate.test.js:2864` `recordingGit` argv observation** | No | — | — |
| 17 | REQ AC-4.3 | Never edits a test file, PLAN or config | `:1985`, `:1999` | `advisoryEnvelope.test.js:340` | No | — | — |
| 18 | REQ AC-4.4 | Re-runs the same gate | `:3295`, `:3259` | `advisoryDriver.test.js:31,24`; `advisoryWaveGate.test.js:321,381,2521` | No | — | — |
| 19 | REQ AC-4.5 | Advisory halt fields on every terminal arm | `:3250`, `:3444` | **`advisoryWaveGate.test.js:2320` (PROP-REST-04) — `haltFields.repairApplied: true` + `repairPaths` on the green arm, plus four-arm partition set-equality** | **No** (was YES) | — | — |
| 20 | REQ AC-4.6 | E-6 promotion into a later wave | `:3323`, `:10433` | `waveExecution.test.js:1136,1189` | No | — | — |
| 21 | REQ AC-5.1 | Whole-tree restore on the three unresolved arms | `:12566`, `:12635`, `:3403` | `advisoryWaveGate.test.js:321,403,454`; **`:2320` PROP-REST-04**. `PROP-REST-03` remains `test.todo` at `:516` but is now **bound to QUEUE row 6** — the deferral is the `-fd`/`-fdx` *decision*; the shipped `-fd` behaviour is observed by PROP-REST-01 | **No** (was YES) | — | — |
| 22 | REQ AC-5.3 / AC-4.5 | Restoration triggers exactly `{refusal, exhaustion, red re-gate}`; a green re-gate restores **nothing** | `:3250` | **`advisoryWaveGate.test.js:2320` (PROP-REST-04)** — call-count spy on the **real** `_git` against a **real** temp repo: `readTreeCalls() == []` on the green arm, repair still on disk with post-repair content, `>= 1` on each unresolved arm with the repair gone; plus an exactness test set-equalling all four arms | **No** (was YES) | — | — |
| 23 | REQ AC-5.2 | Unresolved wave halts on the pre-A6 reason; queue row `halted`; tree restored incl. first-pass build outputs | `:3346` | **`waveExecution.test.js:1112` (PROP-REST-09)** — **equality** against the captured pre-A6 baseline (not `toContain` fragments) + queue row `halted`; tree conjunct at **`advisoryWaveGate.test.js:2475`** (first-pass build outputs intact, A6's leftover gone) | **No** (was YES) | — | — |
| 24 | REQ AC-6.1 | Advisory-record invocation, set-equality | `:3091`, `:3418` | `advisoryRecord.test.js:4,39`; `advisoryWaveGate.test.js:1657` | No | — | — |
| 25 | REQ AC-6.2 | Escalation-log phases | `:3426`, `:3819` | `advisoryEscalationLog.test.js:595,799,723` | No | — | — |
| 26 | REQ AC-6.3 | Disposition ordering | `:2678`, `:4035` | `advisoryRecord.test.js:310`; `advisoryWaveGate.test.js:1270` | No | — | — |
| 27 | REQ AC-6.4 | `plan-ordering-defect` → `ESCALATIONS.md` | `:3426` | `advisoryEscalationLog.test.js:636` | No | — | — |
| 28 | REQ NFR-1 | BR-1…BR-16 proposable/non-proposable partition is script-enforced, not prompt-only | `:3083`, `:3088`, `:3128`, `:3231` | **`advisoryWaveGate.test.js:2833` (PROP-NFR-03)** — transcribed AT-07-1 literal asserted **total, disjoint and count-exact** against BR-1…BR-16, plus per-rule behavioural arms driving a stub agent that emits a violating proposal against a real repo (`hashTree` unchanged, `attempts: 0`) | **No** (was YES) | — | — |
| 29 | REQ NFR-1 | No A6 datum at module scope; the five pure helpers read no ambient state | `:3403`, `:3396`, `:11780`, `:1999`, `:2378`, `:2429` | **`advisoryWaveGate.test.js:3065` (PROP-NFR-04)** — static module-scope regex over all seven TSPEC §4.3 bindings **with an explicit non-vacuity control** (`A6_PROHIBITIONS` must still match), plus the queue-run leak asserted directly: two invocations with their own `waveBudget` both resolve under `waveBudgetPerRun: 1`; purity half at `:3183` | **No** (was YES) | — | — |
| 30 | REQ NFR-2 | Disabled-tier byte-identical to pre-advisory baseline | `:3389` | `advisoryDisabled.test.js:646,620`; `advisoryWaveGateMain.test.js:230` | No | — | — |
| 31 | REQ NFR-3 | Capability-free seam member | `:3063` | `advisoryDriver.test.js:1015` | No | — | — |
| 32 | REQ NFR-4 | Budget window dispatch→verdict | `:3481` | `advisoryWaveGate.test.js:1392` | No | — | — |
| 33 | REQ NFR-5 | A green wave in a run that also carries a red-gated wave pays zero A6 dispatches | `:15365` per-wave dispatch | **`waveExecution.test.js:1182` (PROP-GATE-10)** — the two-wave fixture neither AT-07-3 (single-wave) nor AT-04-3 (all-green) supplied: green wave = 0 dispatches yet still reaches its post-gate commit; only the red wave dispatches | **No** (was YES) | — | — |
| 34 | REQ NFR-6 | Pipeline wiring | `:3481` | `pipelineWiring.test.js` | No | — | — |

**Property citation coverage.** All six previously-uncited `PROP-*` ids are now cited by a
real test: `PROP-REST-04`, `PROP-REST-09`, `PROP-NFR-03`, `PROP-NFR-04`, `PROP-GATE-10`
delivered by `2fd56a5c`; `PROP-SEAM-02` was already delivered under an AT id and is now
transcribed. `PROP-REST-03` is the single remaining `test.todo`, bound to QUEUE row 6.

## §3 Criterion 6 — Integration Boundary

**(a) Adjacent-surface falsification.** One finding — §1 finding 1, the REQ §1 ledger
paragraph falsified by the untracking commit that followed it. Swept clean otherwise:
`pdlc/OPERATIONS.md`'s advisory-tier family is re-trued **and** now oracle-backed against
the constants it describes; CLAUDE.md and README.md re-checked for seam-count prose (none);
`build-runtime.mjs --check` reports **`in-sync`**, so DEC-08's rebuild-and-stage discipline
holds (and no production source changed in this range, so no rebuild was owed); the
`CODE_REVIEW v2 §1-1` citation in `package.json:16` is **pre-existing** (added by merged
commit `a9885dc8`, a different feature's review) and is not this diff's to answer for.

**(b) Deferral binding.** Clean. The one deferral this feature carries — OQ-7 / `PROP-REST-03`
— is bound to `docs/_queue/QUEUE.md` row 6 (`pdlc-engineering-loop`, `pending`, already
`Depends-On: pdlc-advisory-wave-gate`), and the `test.todo` names that row inline.

## Notes

**Test-suite state (real-config smoke, shipped default command).**
`(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/'` → **exit 0**.
Engine: 845 pass, 0 fail. Workflows: **102/102 suites, 4151 pass, 0 fail, 1 todo** (the
bound `PROP-REST-03`), 70 skipped. v1's two `documentOracles` failures are both gone —
`PROP-SWEEP-2(b)` by disposition, AT-22 by being made environment-independent at source
rather than excluded. `npm run test:coverage` exits 0 including the `--per-file --branches 85`
stage. Working tree clean; `git status --porcelain` empty.

**On the one finding.** It is medium and documentation-only: no code path, test or shipped
behaviour is wrong, and the ledger paragraph's substantive claims (this feature's own run,
recorded head an ancestor of the tip) re-measure true. What fails is the single word
"tracked". It is worth one more round rather than a waiver because it is the *second*
occurrence of the same class in this feature — a recorded measurement outliving the commit
that made it true — and because the remediation that introduced it was the fix for the first
occurrence. The cheap structural lesson for the remediator: when one commit in a round
changes the state another commit in the same round measured, re-measure at the round's tip,
not at the commit.

**Trailer count mapping.** `stubs: 0`, `mock_data: 0` (v1's sole entry, the six tracked
machine-local artifacts, is remediated and oracle-pinned), `unwired_integrations: 0`,
`coverage_below_threshold: false` / `branch_coverage_pct: 88` (lowest per-file among the
three included modules, `build-runtime.mjs` 88.23; A6's own regions 89.53), `req_gaps: 0`
(all 34 §2 rows trace to implementation **and** a falsifying test), `boundary_gaps: 1`
(§1 finding 1, an adjacent-surface falsification of a re-measured derivation).
