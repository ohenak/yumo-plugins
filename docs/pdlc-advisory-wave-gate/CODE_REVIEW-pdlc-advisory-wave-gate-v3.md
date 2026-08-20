# CODE REVIEW — pdlc-advisory-wave-gate (v3)

| Field | Detail |
|---|---|
| Feature | pdlc-advisory-wave-gate |
| Branch | feat-pdlc-advisory-wave-gate |
| Review version | 3 |
| Date | 2026-08-20 |
| Verdict | Pass |
| Branch coverage (lowest new module) | 88.23% (`build-runtime.mjs`) — unchanged; no production source in the diff |
| Requirements traced | 34/34 |

Scope: Delta re-verify over the single remediation commit `9ba230a2..HEAD` (`7bdafde8`).
Per the v2+ contract, unchanged code verified in v1/v2 was not re-scanned. The diff is
**one documentation file, +13/−5 lines** — no production source, no test, no config —
so criteria 1–4 have no new surface.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|

(No violations in criteria 1–4, and no new criterion-6 finding in the diff.)

## §1b Prior-Finding Disposition (v2 §1)

| v2 # | Finding | Remediation commit | Verified how | Status |
|---|---|---|---|---|
| 1 | REQ §1's re-measured ledger paragraph says "one **tracked** `.claude/pdlc-wave-state.json`"; commit `c5ce8d56` had untracked it, so the word was false at the tip, and the v1.10 changelog asserted it too | `7bdafde8` | **Both halves of the required fix landed.** §1's evidence sentence (`REQ:143`) now reads "one **untracked** `.claude/pdlc-wave-state.json`, present in the working tree only and ignored by `/.claude/pdlc-wave-state.json` … a working-tree observation, not a shared artifact"; the v1.10 changelog entry (`REQ:27`) is corrected in place rather than silently rewritten ("Its tracked/untracked status as stated in this entry was superseded by v1.11") and a v1.11 entry (`REQ:19–23`) records the correction with its cause. Version bumped 1.10→1.11. **Independently re-measured at the tip, all four conjuncts:** `git ls-files --error-unmatch` → "did not match any file(s) known to git" (untracked); the file is present in the working tree (161 B); `git check-ignore -v` → `.gitignore:41:/.claude/pdlc-wave-state.json` (ignored, by exactly the anchored rule the prose names); tracked `.claude/` set is exactly `{pdlc.config.example.json, settings.json}`. The paragraph's surviving substantive claims also re-measure true: `feature: pdlc-advisory-wave-gate`, `lastGreenWave: 7`, and recorded head `a998fae1` **is** an ancestor of the branch tip (`git merge-base --is-ancestor` → 0). The word "tracked" no longer appears as an assertion anywhere in the REQ. | **Remediated** |

**Falsifying test for the remediated claim (evidence bar, not just prose-matches-tip).**
The v2 finding was documentation-only, so the bar is that the *state* the prose now asserts
is pinned by a test that could fail. It is: `documentOracles.test.js:426+` pins the tracked
`.claude/` set by set-equality **and** requires `.claude/pdlc-wave-state.json` to be ignored.
**Mutation-verified this round:** deleting `.gitignore:41` (the anchored ignore rule) makes
`git check-ignore` report NOT IGNORED and turns the suite **RED** at
`documentOracles.test.js:488` (`1 failed, 34 passed`). `.gitignore` restored byte-for-byte;
`git status --porcelain` empty afterwards. So the newly-written sentence is not an
unfalsifiable assertion — a commit that re-tracks the ledger reds CI and reds this prose with it.

## §2 Requirements Traceability (carried forward from v2; `Gap?` updated)

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

**No row moved this round.** The remediation touched REQ §1 — the problem-framing and
economics narrative — which carries no acceptance criterion. All 34 rows carry forward from
v2 with `Gap?` = No, each tracing to an implementation path **and** a falsifying test.

## §3 Criterion 6 — Integration Boundary

**(a) Adjacent-surface falsification — clean.** Swept the diff's own disclosure family:

- **Stale-disclosure family sweep.** `grep -rn "pdlc-wave-state"` across all `.md`/`.json`/
  `.js`/`.mjs`/`.sh` (excluding `node_modules`, and excluding process artifacts) returns the
  family. Every present-tense member agrees with the tip: `REQ:21,143` (corrected this round),
  `docs/pdlc-wave-resume/REQ:300` ("consumer-local and untracked" — already agrees),
  `TSPEC:369` (describes the writer, makes no tracking claim), `orchestrate-dev.js:12142` /
  `dist/pdlc-cli.mjs:12151` (path constant, no claim), `documentOracles.test.js:436,444`
  (the oracle itself). The v1.10 changelog entry — the one other member that asserted
  "tracked" — is the second half of the fix and is corrected. **No unswept sibling.**
- **One near-miss, correctly out of scope.** `docs/pdlc-wave-resume/REQ:77` still reads "**no
  `.claude/pdlc-wave-state.json` exists anywhere in this repo, including its worktrees**",
  which the ledger's present existence contradicts. It is **not** this diff's to answer for,
  on the same reasoning v2 applied to the `package.json:16` citation: the line is explicitly
  date-stamped as a historical observation ("Operational finding, **2026-08-13**"), it is
  pre-existing on `main` (`2ca2335a`), and `git diff main..HEAD -- docs/pdlc-wave-resume/`
  is **empty** — this branch never touched that file. This feature's REQ §1 additionally
  withdraws the stronger version of that claim in prose. Recorded here so the sweep is
  auditable, not raised as a finding.
- **Re-measured recorded derivations.** The REQ paragraph's other measured claims were
  re-measured at the tip, not taken on trust — see §1b (feature/`lastGreenWave`/ancestry all
  true). `build-runtime.mjs --check` → **`in-sync`**, so DEC-08's rebuild-and-stage discipline
  holds; no production source changed, so no rebuild was owed. REQ size budget re-measured
  after the +13 lines: **636/700 lines, 51 165/61 440 bytes** — the `check-req-size` hook
  budget is not breached.
- **No oracle pins the REQ's prose or version**, so the edit could not silently red or
  silently green a test: `grep -rn "REQ-pdlc-advisory-wave-gate"` across `pdlc/**/*.js|*.mjs`
  returns nothing.

**(b) Deferral binding — clean, unchanged.** The diff introduces no new deferral. The one
deferral this feature carries — OQ-7 / `PROP-REST-03` — remains bound to `docs/_queue/QUEUE.md`
row 6 (`pdlc-engineering-loop`, `pending`, `Depends-On: pdlc-advisory-wave-gate`), with the
`test.todo` at `advisoryWaveGate.test.js:516` naming that row inline.

**boundary_gaps = 0.**

## Notes

**Test-suite state (real-config smoke, shipped default command).** Re-run at the v3 tip:
`(cd pdlc/engine && npm test)` → **845 pass, 0 fail, 2 skipped** (the two documented
`PDLC_LIVE=1` opt-in legs). `(cd pdlc/workflows && npm test -- --testPathIgnorePatterns
'/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/')` → **102/102 suites,
4151 pass, 0 fail, 1 todo, 70 skipped** — identical to v2's numbers, so the docs-only
remediation regressed nothing. Working tree clean; `git status --porcelain` empty.

**Coverage not re-run, and why that is sound.** The v2+ contract scopes coverage to the
remediation diff. `git diff 9ba230a2..HEAD --stat` is one `.md` file, +13/−5 — no `.js`,
`.mjs`, or test file — so no branch in any measured module changed. v2's measurement stands:
per-file branch 88.44 / 88.75 / 88.23, `npm run test:coverage` (with `--per-file --branches 85`)
exits 0, A6's own five regions 231/258 = 89.53%.

**One observation, logged not raised.** The same §1 paragraph's closing sentence states the
consumer runtime copy under `.claude/workflows/` "is still out of sync with the built
artifacts — the drift check exits non-zero with three rows stale and one missing". The
**substance re-measures true**: `.claude/workflows/pdlc-cli.mjs` (sha256 `7ef2fd81…`) differs
from `pdlc/workflows/dist/pdlc-cli.mjs` (`0420f730…`), so the copy is genuinely stale. The
precise enumeration "three rows stale and one missing" is not reproducible at this tip —
`.claude/workflows/.pdlc-drift-state.json` currently reports `rows: []` with
`baselineStatus: "unresolved"`, `baselineReason: "manifest-absent"`, and its recorded
`syncCommand` (`pdlc/hooks/scripts/sync-workflows.sh`) no longer exists in the repo, that
sync path having been retired by `pdlc-plugin-retirement`/DEC-02. This is **not** raised as a
finding: the sentence is unchanged by this diff and pre-dates v1, it sits outside v2 finding
1's stated required fix, its claim is true in substance, and the number describes untracked
machine-local state that no shipped behaviour or CI check depends on — failing a round on it
would be failing on an environment artefact. Worth one line in the post-mortem as a candidate
for date-stamping (the precedent `pdlc-engine-distribution`'s PLAN v0.13 already sets), not a
remediation round.

**Why this round passes.** The single v2 finding is remediated in both halves the fix
required, its claim was re-measured from the tree rather than read back from the prose, and
the state it asserts is pinned by a mutation-verified oracle. The remediation diff is
documentation-only and introduces no stub, mock datum, unwired integration, unbound deferral
or falsified sibling surface. The recurrence the v2 note warned about — a measurement
outliving the commit that made it true — did not recur: this round's fix was the only commit
in the round, so there was no second commit to falsify it, and it was re-measured at the tip
regardless.

**Trailer count mapping.** `stubs: 0`, `mock_data: 0`, `unwired_integrations: 0`,
`coverage_below_threshold: false` / `branch_coverage_pct: 88`, `req_gaps: 0` (all 34 §2 rows
trace to implementation **and** a falsifying test), `boundary_gaps: 0`.
