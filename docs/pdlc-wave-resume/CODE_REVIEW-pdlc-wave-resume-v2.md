# CODE REVIEW — pdlc-wave-resume (v2)

| Field | Detail |
|---|---|
| Feature | pdlc-wave-resume |
| Branch | feat-pdlc-wave-resume |
| Review version | 2 |
| Date | 2026-08-24 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 94.44% (`pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`) |
| Requirements traced | 21/21 (all four v1 PROPERTIES gaps closed) |

**Scan basis.** Delta re-verify, not a full re-scan. Exactly one remediation commit since v1:
`664a7344` *"test(pdlc-wave-resume): close CODE_REVIEW v1 findings 1, 12-15 and B-1..B-4"* —
9 files, +525/-64, touching **no production source**. `pdlc/workflows/orchestrate-dev.js`,
`orchestrate-queue.js` and `dist/pdlc-cli.mjs` are byte-identical to their v1 state; the diff is
tests, `package.json` c8 config, and docs.

Measured in this tree at the branch tip, independently of the commit message's claims:
`npm test` → **123 suites, 4503 passed, 0 failed**. `npm run test:coverage` → **exit 0**,
`check-wave-resume-delta-coverage.mjs` **100 % stmt / 94.44 % branch / 100 % funcs**,
`orchestrate-dev.js` 88.9 % branch, delta gate `uncovered lines inside introduced ranges: 0 - OK`.
`node pdlc/workflows/build-runtime.mjs --check` → `in-sync`. Working tree clean.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|

(Empty. v1 §1-1 is remediated — see §3 — and the remediation diff introduces no stub, mock-data,
unwired-integration or coverage violation. The diff's only non-test, non-doc change is
`pdlc/workflows/package.json`'s `c8.include`, which adds one path-qualified entry consistent with the
existing `**/`-anchored convention the `//c8` note documents.)

## §2 Requirements Traceability

Carried forward from v1; only rows the remediation touched are restated (12–15, 21).

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ-WVR-01 | Automatic resume at the failed wave | `orchestrate-dev.js:16259-16289` | `waveExecution.test.js:2279` | No | — | — |
| 2 | REQ-WVR-02 IG-1..5 | Foreign/stale record → announced full run | `classifyWaveLedger` guards 2–6 | `waveExecution.test.js`; `waveResume.test.js` | No | — | — |
| 3 | REQ-WVR-02 IG-6 | Absent record → **silent** full run | guard 1 (`silent: true`) | `waveExecution.test.js:2988` | No | — | — |
| 4 | REQ-WVR-03 | Verification independence (gate before first commit) | wave loop gate ordering | `waveExecution.test.js:2556-2582` | No | — | — |
| 5 | REQ-WVR-04 | Operator override outranks the record | `orchestrate-dev.js:16217` + `if (!explicitPointer)` | `waveExecution.test.js:2758` | No | — | — |
| 6 | REQ-WVR-05 | Retention with invalidation | record left standing on skip | `waveExecution.test.js:2347`, `:2358` | No | — | — |
| 7 | REQ-WVR-06 | Completion evidence is never commit presence | write keyed on transport | `waveExecution.test.js:3044` | No | — | — |
| 8 | REQ-WVR-07 | Unattended queue parity | `orchestrate-queue` `_runPipeline` default | `waveResumeQueueParity.test.js` | No | — | — |
| 9 | REQ-WVR-08 | All waves recorded → Phase I skipped in full | `skip-phase` arm + `⏭` report row | `waveExecution.test.js:2358` | No | — | — |
| 10 | REQ-WVR-09 | Verified-but-uncommitted is never recorded | write guarded on git transport | `waveExecution.test.js:2669` | No | — | — |
| 11 | REQ-WVR-10 (repo half) | The record never becomes tracked content | `.gitignore:46` | `waveResumeRepoState.test.js:76` | No | — | — |
| 12 | **PROP-REPO-03** (REQ-WVR-10 run half) | No commit a run produces may contain the record | Emergent (no wave owns the path) | **`waveExecution.test.js:2358-2384`** — new `it("no commit a full run produces ever stages the wave ledger")`: flattens the `add` argv list, asserts a **positive** `staged.length > 0` presence conjunct, then `not.toContain(WAVE_STATE_PATH)`, `not.toContain(".claude/pdlc-wave-state.json")` and an `endsWith` suffix sweep | **No** (was YES) | — | Local |
| 13 | **PROP-SKIP-04** | Outcome (c): flattened `add` argv set-equal to `[]` **and** the positive branch-guard conjunct | `orchestrate-dev.js` skip arm | **`waveExecution.test.js:2429-2439`** — `makeGit([])` replaced by a recording double `makeGit(gitCalls)`; asserts `gitCalls.filter(a => a[0]==="add").flat()` `toEqual([])` **and** `toContainEqual(["rev-parse","--abbrev-ref","HEAD"])`. The absence-only shape PROPERTIES R-3 forbids is gone | **No** (was YES) | — | Local |
| 14 | **PROP-COV-03** | Five TSPEC §5.5 mutations applied, observed RED against a named oracle, reverted, output **recorded** | n/a (process duty) | **`docs/pdlc-wave-resume/MUTATION-EVIDENCE-pdlc-wave-resume.md`** (tracked) + **`waveResumeRepoState.test.js:392-416`**, which asserts the artifact exists, names both properties, carries all six oracle ids as a **set** (not a count), and holds ≥6 real `● `-prefixed jest failure blocks containing `expect(received)` | **No** (was YES) | — | Process |
| 15 | **PROP-PARITY-04** | Queue-parity falsification arm executed and output recorded | n/a (process duty) | Same artifact, `## PROP-PARITY-04` — **both** arms recorded (in-suite arm; production-side `orchestrate-queue.js:1582` mutation → 1 failed / 211 passed, PROP-PARITY-02 alone red). Mechanically pinned by the same `waveResumeRepoState.test.js` case | **No** (was YES) | — | Process |
| 16 | PROP-PRE-01/-02 | Pre-flight export/key/config gate | exports + `package.json` | `waveResumePreflight.test.js` | No | — | — |
| 17 | PROP-LAW-01..04 | Round-trip, totality, hash discrimination | `parseWaveLedger`/`formatWaveLedger`/`classifyWaveLedger`/`computePlanHash` | `waveResumeProperties.test.js` (`numRuns: 500`) | No | — | — |
| 18 | PROP-DISREGARD-07/-08/-09 | Probe laziness, zero-probe honouring, unanswerable probe | `headCorroborated` + `ANCESTRY_INDEPENDENT_CODES` | `waveExecution.test.js:2472`, `:2519`, `:2585` — **strengthened**: the `feature-mismatch` and `plan-changed` fixtures now carry `head: DISREGARDED_HEAD`, so the zero-probe conjunct is no longer vacuous | No | — | — |
| 19 | PROP-DISREGARD-11 | Announcement catalogue closed at five rows | §2.4 suffixes | `waveExecution.test.js:3068` | No | — | — |
| 20 | PROP-REPO-04 | `M-WVR-1`/`M-WVR-2` promoted with version bump | `docs/_constraints/pdlc-wave-gate-baseline.md` §5 | `waveResumeRepoState.test.js` | No | — | — |
| 21 | PROP-COV-01/-02 | `test:coverage` exits 0; no uncovered line in introduced ranges | `scripts/check-wave-resume-delta-coverage.mjs` | Re-measured: exit 0, `orchestrate-dev.js` 88.9 % ≥ 88.75 baseline, delta gate 0 uncovered. The gate module itself is now **inside** `c8.include` and measured at 94.44 % branch | No | — | — |

## §3 Prior-Finding Remediation Verdicts

| v1 # | Finding | Verified remediated? | Evidence bar met |
|---|---|---|---|
| §1-1 | Delta-coverage gate module at 72.13 % branch and absent from `c8.include` | **Yes** | Both halves. `package.json` `c8.include` gains `**/pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`, and `coverageInstrumentation.test.js`'s `REQUIRED_INCLUDES` gains the matching row, so a future removal reds. **Independently measured**: the module now reports 100 / 94.44 / 100 in the shipped `test:coverage` report — above the 85 % floor, not merely visible. The three v1-named uncovered readings (injected-IO defaults `:78`, diff-failure arm `:120`, non-`GateFailure` rethrow `:247`) each gained a real case in `waveResumeDeltaGate.test.js` with substantive assertions, not smoke calls |
| §2-12 | PROP-REPO-03 had no `add`-argv oracle | **Yes — mutation-verified by this review** | Applied the mutation `["add","--",...paths]` → `["add","--",...paths, WAVE_STATE_PATH]` at `orchestrate-dev.js:13568`. The new test went **RED** at `waveExecution.test.js:2380` (`Received array: ["add","--","src/one.js",".claude/pdlc-wave-state.json", …]`). Mutation reverted; `git diff` clean. The oracle is load-bearing, not decorative |
| §2-13 | PROP-SKIP-04 asserted against a discarded call log | **Yes — mutation-verified by this review** | Bypassed the git seam inside `readHeadBranch` (`orchestrate-dev.js:5258`), the mutation the positive conjunct exists to catch. The test went **RED**. Reverted; `git diff` clean. Both conjuncts now ride one run, as v1's Notes prescribed |
| §2-14 | PROP-COV-03 evidence lived only in an agent transcript | **Yes** | `MUTATION-EVIDENCE-pdlc-wave-resume.md` is tracked and substantive — five mutations, each with the mutated expression, the named oracle, real jest output including the diff hunks, and a restore confirmation. Notably honest rather than self-serving: it records that **mutation 4 survived first application** and explains why (vacuous zero-probe conjunct), then documents the fixture strengthening that killed it. That survival is itself the strongest evidence the duty was really discharged rather than asserted |
| §2-15 | PROP-PARITY-04 arm unrecorded | **Yes** | Both arms recorded with output and discrimination (`PROP-PARITY-02` alone red, `PROP-RESUME-01 … PROP-OVERRIDE-01` green) |
| B-1 | DECISIONS record's "interim" framing + "not observably firing" + stale `:9976` pointer | **Yes** | The line pointer is removed entirely (repointed to the file, so it cannot go stale again), both clauses are date-qualified to 2026-08-13, and an `**Update 2026-08-24**` paragraph states the shipped position. The original analysis is preserved as a dated record — the option v1 explicitly allowed |
| B-2 | `waveBudgetPerRun` deferral bound to nothing | **Yes** | Closed via v1's second permitted route: the record now says the deferral **is closed at `1`**, that no successor REQ or queue row is opened, and that raising the budget needs a fresh REQ "not this record's standing permission". Verified no new unbound deferral replaces it — the diff introduces none |
| B-3 | PROPERTIES G-4 / §11 / errata claims falsified by later commits | **Yes — re-measured by this review** | `git ls-files .claude` → only `pdlc.config.example.json`, `settings.json`. `git ls-files pdlc/workflows/coverage` → empty. `git check-ignore -v .claude/pdlc-wave-state.json` → `.gitignore:46`, **exit 0**. `documentOracles.test.js:740` carries `docs/pdlc-wave-resume/**`. All four restatements in PROPERTIES v1.6 are true at the tip. No red was closed by weakening an assertion — the suite still passes 4503 |
| B-4 | `OPERATIONS.md:40` overclaimed the ancestry precondition | **Yes — verified against the code** | The new sentence names both fail-open arms. Checked against `headCorroborated` (`orchestrate-dev.js:16242-16257`): `if (!recordedHead) return true` (zero probes) and `if (!transport) return true` / `catch { return true }`. The runbook now matches the implementation exactly |

## §4 Integration-Boundary Findings — new, introduced by the remediation diff (criterion 6)

The remediation's substantive test change was adding `head: DISREGARDED_HEAD` to the
`feature-mismatch` and `plan-changed` ledger fixtures, because without it TSPEC §5.5's mutation 4
survived. That change was propagated to **one** member of its two-member disclosure family —
`PROPERTIES-pdlc-wave-resume.md`'s fixture table, updated at v1.6 — and not to the other.
`TSPEC-pdlc-wave-resume.md` is **untouched by `664a7344`** and still states the pre-discovery account.

| # | Kind | Severity | File:Line | Falsified / unhandled / unbound | Required fix | Scope |
|---|---|---|---|---|---|---|
| B-5 | Adjacent-surface falsification (6a) — stale-disclosure family sweep | medium | `docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md:780-781` (and the AT-03 description at `:754`) | §5.4's fixture table treats `head` presence as a **specified** attribute of each fixture — the `head-unreachable` row names `head: HEAD_SHA`, and the `over-count` row bolds "**`head` omitted**" with the reason. Against that grammar, the `feature-mismatch` and `plan-changed` rows' silence now diverges from the shipped fixtures, which carry `head: DISREGARDED_HEAD`, and from PROPERTIES' twin table, which was updated in the same commit. `:754`'s AT-03 gloss — "asserted `toEqual([])` — zero, equality not containment, **so an extra probe reds**" — is true only *because* the fixtures now carry a `head`; as written it re-plants the trap for anyone rebuilding the fixtures from TSPEC | Add the `head` to both rows (mirroring PROPERTIES v1.6's "**`head` present** … the `head` is what makes the zero-probe conjunct falsifiable"), and add the same clause to `:754`'s AT-03 gloss | Cross-Feature |
| B-6 | Adjacent-surface falsification (6a) — recorded derivation re-measured false | medium | `docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md:799-805` | §5.5 mutation 4 states it is "Killed **only by** AT-03's and AT-11's `merge-base` call-count assertions, **and only because** they use `toEqual` on the filtered call list", concluding "This is the mutation that makes the choice of matcher load-bearing rather than stylistic." The remediation's own measurement falsifies this: `MUTATION-EVIDENCE-pdlc-wave-resume.md` records that mutation 4 **survived** (212 passed, 0 failed) against those exact `toEqual` assertions, and was killed only after the fixtures gained a `head`. The matcher is necessary but **not sufficient**; the fixture's `head` is the other half, and §5.5 attributes the kill wholly to the matcher | Restate mutation 4's kill condition as the conjunction — `toEqual` on the filtered list **and** an ancestry-independent fixture carrying a `head` — citing the measured survival in `MUTATION-EVIDENCE-pdlc-wave-resume.md` | Cross-Feature |

**Sweeps performed on the diff.** Other writers of the touched artifacts: `MUTATION-EVIDENCE-*` has
exactly one writer and two readers (`PROPERTIES` prose, `waveResumeRepoState.test.js:395`); no later
stage overwrites it. Deferral binding: `git show 664a7344 | grep -E "^\+.*(deferred|TODO|follow-up|successor)"`
returns one line — B-2's explicit closure — so the diff **introduces no new deferral**, bound or
otherwise. `PLAN:490-491`'s laziness checklist ("zero `merge-base` calls on the feature-mismatch,
plan-changed and no-`head` fixtures") was re-read and remains **true** under the new fixtures, so PLAN
is not a third member of the B-5 family. `documentOracles.test.js` and the retirement sweep already
cover `docs/pdlc-wave-resume/**` (`:740`), so the new tracked artifact does not fall out of A-1's glob
list.

## Notes

- Both new findings are **documentation-only and confined to TSPEC**. No production source, no test
  and no behaviour is wrong; the suite is green at 4503 and the delta gate is clean. A remediator can
  close B-5 and B-6 with two edits to `TSPEC-pdlc-wave-resume.md` plus a revision-history row, and
  nothing else needs to move. They are recorded rather than waived because §5.5 is the document a
  future implementer consults to rebuild these fixtures, and it currently teaches the exact belief
  that let the mutation survive.
- The remediation is otherwise of unusually high quality for a DoD round: it changed no production
  code (correctly — every v1 finding was an oracle, instrumentation or documentation gap), it
  strengthened rather than weakened two oracles, and it surfaced a latent suite defect (the vacuous
  zero-probe conjunct) that v1 did not catch. Findings 12 and 13 were mutation-verified by this
  review rather than taken on the commit message's word, and both are genuinely load-bearing.
- `MUTATION-EVIDENCE-pdlc-wave-resume.md` is a **new durable feature artifact type** not named in
  `CLAUDE.md`'s artifact-convention sentence (`:93`) or `pdlc/OPERATIONS.md`'s artifact list. This is
  deliberately *not* filed as a finding: the convention sentence is descriptive rather than a closed
  enumeration, and the file must persist (PROPERTIES and a test both depend on it), so it correctly
  falls outside Phase H's harvest-then-delete set, which names only `CROSS-REVIEW-*` and
  `CODE_REVIEW-*`. Worth a line in the convention if the pattern is reused by a later feature.
