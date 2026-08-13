# CODE REVIEW — pdlc-headless-engine — v2 (re-verification round)

**Scope:** Local — the remediation diff `24d37f74..HEAD` (four commits: `f9491499`,
`66651e30`, `c69e1691`, `819a57af`), plus a per-finding re-verification of every v1
finding against HEAD. Two findings tagged `Cross-Feature` where a claim outside the
engine's own artifacts is falsified. `CODE_REVIEW-…-v1.md` is history and is not
edited by this round.

| Field | Value |
|---|---|
| Feature | `pdlc-headless-engine` |
| Round | v2 (delta re-verification; v1 at `24d37f74`) |
| Branch | `feat-pdlc-headless-engine` (`git rev-parse --abbrev-ref HEAD` confirmed) |
| Verified HEAD | `819a57af`; working tree carries only untracked `.claude/settings.json`, `.serena/` (same as v1) |
| Remediation footprint | 7 files, +1572 / −64 — **6 test files + 1 constraints doc. No production file changed** (`git diff --stat 24d37f74..HEAD`) |
| Verdict | **Findings** |
| Branch coverage (lowest `lib/` module) | **78.89 %** (`lib/skills.mjs`) — was 70.59 % (`lib/transport-cli.mjs`) at v1 |
| Requirements traced | 25/26 ACs traced to implementation **and** a falsifying test |

---

## §0 PLAN §11 verification commands, re-run at HEAD

Executed on this branch. Output is what was observed, not what was expected.

| # | Command | Exit | Observed |
|---|---|---|---|
| **V1** | `cd pdlc/engine && npm test` | **0** | `# tests 578 / # pass 576 / # fail 0 / # skipped 2`. Both skips are the opt-in live files, correctly gated: `O-2 live measurement …` (`__tests__/live/guard-measurement.test.js`) and the **new** `AC-6.2 live smoke …` (`__tests__/live/smoke.test.js`), both `# SKIP requires PDLC_LIVE=1`. Step 4 (`_assert-suite-wide.mjs`) ran and exited 0 — see the oracle-mutation check below. Was 525/524/1 at v1. |
| **V2** | `npm test` at repo root (`pdlc/workflows`) | **1** | **Carried forward from v1 unchanged, not re-derived** — the single failure is `__tests__/documentOracles.test.js:246` (`AT-22`) reacting to untracked working-tree paths (`.claude/worktrees/**`, `.serena/cache/**`, `.tokensave/tokensave.db`). Environmental; not feature-caused; no remediation commit touched `pdlc/workflows/`. |
| **V3** | `node pdlc/workflows/build-runtime.mjs --check` | **0** | `in-sync` on all four artifacts (`orchestrate-queue.bundle.js`, `orchestrate-dev.bundle.js`, `pdlc-cli.mjs`, `distribution-manifest.json`). Unchanged from v1; the remediation commits touched no built source. |
| **V4** | `pdlc/hooks/scripts/sync-workflows.sh --check` | **1** | Re-run this round and **byte-identical to v1**: the `distribution.checkEnabled`-absent warning plus the one retired-present row `consolidate-learnings.bundle.js`. v1's determination (stale consumer copy on an un-rebased branch, cleared by Phase DOD step 0's rebase + a plain sync) stands. No engine-side defect. |
| **V5** | `cd pdlc/engine && npm test -- --experimental-test-coverage` | **0** | Coverage table below. |

**V5 branch coverage at HEAD, per module** (Δ against v1 where it moved):

| Module | Line % | **Branch %** | Func % | vs 85 % floor |
|---|---|---|---|---|
| `lib/outcome.mjs` | 100.00 | **100.00** | 100.00 | ✅ |
| `lib/report.mjs` | 100.00 | **100.00** | 100.00 | ✅ |
| `lib/transport-cli.mjs` | 82.63 | **100.00** ⬆ *(was 70.59)* | 77.78 | ✅ **F-02 cleared** |
| `lib/handshake.mjs` | 100.00 | **95.06** | 100.00 | ✅ |
| `lib/guard-measurement.mjs` | 97.87 | **93.94** | 100.00 | ✅ |
| `lib/auth.mjs` | 100.00 | **93.33** | 100.00 | ✅ |
| `lib/run.mjs` | 98.83 | **92.73** | 100.00 | ✅ |
| `lib/catalogue.mjs` | 100.00 | **92.31** | 100.00 | ✅ |
| `lib/startup.mjs` | 98.38 | **89.92** | 100.00 | ✅ |
| `lib/adapter.mjs` | 98.97 | **89.08** | 90.32 | ✅ |
| `lib/transport.mjs` | 98.39 | **88.73** | 100.00 | ✅ |
| `lib/skills.mjs` | 98.64 | **78.89** | 89.47 | ❌ **(F-08, unchanged)** |
| `bin/pdlc.mjs` | 84.09 | **67.65** | 80.95 | ❌ (outside `lib/`, F-12) |
| all files | 84.21 | 81.79 | 85.54 | — |

**Oracle-mutation check on the new T52 step** (per this SKILL's re-verification bar —
a new invariant must be shown load-bearing, not merely present): ran
`PDLC_TEST_RUN_DIR=<scratch> node __tests__/_assert-suite-wide.mjs` over a run dir
holding one non-corpus record. Exit **1**, naming
`[pinned-model-map] no corpus dispatch descriptors recorded (corpusRun != null)`
alongside eight `[message-catalogue]` failures. The step fails closed on an empty
corpus rather than passing vacuously — the exact failure mode PLAN §10 flagged.

**Git-observed DoD claims, re-checked:** `git diff --stat $(git merge-base HEAD main)..HEAD -- pdlc/workflows/`
still shows **8 paths**, not the six PLAN §11 names (F-10, unchanged).
`git status --porcelain .claude/workflows/` still **empty**.

---

## §1 Per-finding disposition of v1

Every row below was re-derived at HEAD from commands or diffs, not read off the
remediation commit messages.

| v1 # | Severity (v1) | Disposition | Evidence at HEAD |
|---|---|---|---|
| **F-01** | high | **STILL OPEN — operator-gated, not a remediation failure** | See §1.1 below. |
| **F-02** | high | **RESOLVED** | `lib/transport-cli.mjs` branch coverage **70.59 → 100.00 %** (V5). `transport-cli.test.js:223-396` adds ten cases, each driving a real `dispatch()` through the module's own `spawnFn` seam over an in-memory stream, cloning message shapes from the recorded `.jsonl` fixtures rather than inventing them: missing-`type` → `TransportError`; `cwd`/`maxTurns` forwarding; absent `apiKeySource` → `"absent"`; absent `rate_limit_info`; absent `permission_denials`; absent `errors`; post-loop `TimeoutError`; bare-string throw; `{}` throw; 429 with no message. All are real behavioural oracles — each asserts the thrown class *and* the message/field, so a reverted branch goes red. |
| **F-03** | high | **RESOLVED (harness); evidence half is PLAN-waived and operator-gated** | `pdlc/engine/__tests__/live/smoke.test.js` now exists (272 lines, T51). It builds a real scratch git repo on `feat-{feature}`, constructs the **real** transport (`createTransport()`, no double), runs `runDev` through the same `createAdapter`/`runDev` seams as the hermetic suite, and asserts §10.2's structural set from **directory ground truth**, not from the report: every phase-declared core doc exists on disk for each `passed` phase, every `CROSS-REVIEW-*` file carries a parseable `^VERDICT:` line, at least one reaches `Approved` **and** carries both `APPROVAL-HASH:` and `REVIEWED-COMMIT:` anchors, and dispatch counts are non-zero. `PHASE_CORE_DOC` is transcribed, not imported from `PHASE_DISPATCH`, so a later edit cannot make it vacuous. Correctly gated: `{ skip: !LIVE && "…" }` at `:158`, confirmed by V1's `# skipped 2`. `AT-ENG-65` is now cited (`:159`). The *dated evidence line* is still unrecorded — but PLAN §8 (`PLAN:613-616`) explicitly waives that as "operator-recorded, not suite-observed", and `docs/_constraints/pdlc-engine-baseline.md`'s AC-6.2 row now says so in as many words rather than overclaiming. |
| **F-04** | high | **RESOLVED** | `pdlc/engine/__tests__/corpus-model-map.test.js` now exists (572 lines, 36 tests, T50). `_assert-suite-wide.mjs:79-175` carries `M_ENG_07` — all seven rows with per-row `witness()` predicates, **transcribed** from the baseline, never imported from `MODEL_*` (PROP-MODEL-8 is itself asserted at `corpus-model-map.test.js:476`, with a positive control so a wrongly-sliced read cannot pass). `checkModelMap` (`:239`) runs both directions: forward (every recorded model ∈ M-ENG-07's model column) and reverse (each of the seven rows witnessed by ≥1 descriptor in its own corpus run). Both directions carry falsifiers — an unmapped model (`:162`), a deleted corpus run per row (`:214`, parameterised over all seven), an eighth-row guard (`:228`), and vacuous-empty (`:205`). Rows 1 and 2 are *quantified*, not existential, and row 2 requires both wave-set members. `_corpus.mjs:553-583` now publishes each corpus run's real records into the suite-wide run dir, so the step reads the T48 corpus's actual descriptors in a normal `npm test`, not a synthetic stand-in. |
| **F-05** | high | **RESOLVED** | `_assert-suite-wide.mjs` now enumerates and implements all **five** of TSPEC §7.4's rows: `SUITE_WIDE_ROWS` (`:46`) names `message-catalogue`, `outcome-taxonomy`, `pinned-model-map`, `dispatchable-skills`, `pre-phase-window`, and `assertSuiteWide` (`:362-380`) tests the enumeration against `implementedRows()` **in both directions** — an enumerated-but-unimplemented row and an implemented-but-unenumerated check each produce a failure, so a row that goes missing is itself detectable (PLAN §8's exact wording). `checkDispatchableSkills` (`:310`) is set-equality over the modules' own `DEV_SKILLS ∪ QUEUE_SKILLS ∪ ADVISORY_RUNG_SKILL` against §3.3's transcribed ten-identifier table, both directions, with falsifiers at `corpus-model-map.test.js:408,414`. `checkPrePhaseWindow` (`:333`) has falsifiers at `:351,372,391`. |
| **F-06** | high | **RESOLVED** | `docs/_constraints/pdlc-engine-baseline.md`'s M-ENG-06 table is restated at HEAD (T53, `c69e1691`). Nine rows the v0.6 snapshot called red or partially green are re-measured green with `file:line` evidence (AC-1.1, AC-2.1/2.2/2.4, AC-3.3, AC-3.5, AC-4.1, AC-4.5's per-dispatch auth clause, AC-5.1/5.2, AC-6.3, AC-6.4), a correction paragraph names the snapshot and why it drifted, and only AC-2.3, AC-4.4 and AC-6.2 remain short of green — each with its residual clause named in its own row. I spot-checked five of the newly-green evidence citations (`lib/outcome.mjs:35-42`, `run.test.js:67`, `hermeticity.test.js:111`, `skills-composition.test.js:64`, `guard-parity.test.js` rows) and each resolves to a real assertion. |
| **F-07** | medium | **STILL OPEN — and its disposition regressed into a false disclosure** (see F-16) | `parseStreamJsonLines` (`lib/transport-cli.mjs:127-140`) is still module-private; `grep '^export' lib/transport-cli.mjs` returns only `buildGuardSettingsFile` and `createCliTransport`. `transport-cli.test.js:46-53` still re-implements the shape. Lines 127-140 and 157-200 remain the module's only uncovered lines (V5), and function coverage stayed at 77.78 %. Branch coverage reached 100 % without touching this. |
| **F-08** | medium | **STILL OPEN** | `lib/skills.mjs` branch coverage unchanged at **78.89 %**, same uncovered sites `76-77`, `149`, `309-310`. No PLAN-sanctioned exemption was recorded. |
| **F-09** | medium | **STILL OPEN** | `grep -rn 'deadlineSleep\|unref' pdlc/workflows/__tests__/ pdlc/engine/__tests__/` returns nothing relevant (the one hit, `pacingWrapper.test.js:649`, is an unrelated title). No spec row, no test. |
| **F-10** | medium | **STILL OPEN** | `git diff --stat $(git merge-base HEAD main)..HEAD -- pdlc/workflows/` still lists 8 paths against PLAN §11's "exactly six". PLAN §8's "exactly two files / no pipeline behaviour changes" wording is unedited. |
| **F-11** | medium | **STILL OPEN** | `grep -rn 'PROP-FORK-3' pdlc/engine/__tests__/` → no match. No failing-suite oracle over `pdlc/engine/{lib,bin}/**` for the "only `lib/run.mjs` names a `pdlc/workflows/` path" invariant. |
| **F-12** | low | **STILL OPEN** | `bin/pdlc.mjs` branch coverage unchanged at **67.65 %**; no scoped exemption recorded in PLAN. |
| **F-13** | low | **STILL OPEN** | 36 `⬚` markers remain in `PLAN-pdlc-headless-engine.md`'s status column; T50–T53 landed this round and still read `⬚`, so the column is now *more* misleading than at v1. |
| **F-14** | low | **STILL OPEN** | `cli.test.js:52` still titled "`--dry-run-skill` selects among 17 prompt files"; body still asserts one supplement's bytes. |
| **F-15** | low | **STILL OPEN, materially improved** | `AT-ENG-65` and `AT-ENG-29` are now cited (`live/smoke.test.js:159`, `corpus-model-map.test.js` header + PROP-MODEL rows), so two of v1's 19 uncited ATs are closed; PROP-MODEL-2…9 and PROP-FAIL/SUITE ids are now cited throughout the new files. The remaining uncited identifier set is smaller but was not measured exhaustively this round. |

### §1.1 F-01 in detail — still open, operator-gated

Re-derived, not assumed:

- `docs/_constraints/pdlc-engine-baseline.md`'s M-ENG-09 table still carries **exactly one**
  data row: `| 2026-08-12 | darwin | agent-sdk | 0.3.226 | yes |`. No `linux` row was added
  by any remediation commit (`git diff 24d37f74..HEAD -- docs/_constraints/…` touches only
  the M-ENG-06 section).
- Simulated directly against the real baseline text:
  `checkGuardMeasurement({platform:"linux"})` → `{"ok":false,"messageId":"guard.measurement-missing",…}`;
  `platform:"darwin"` → `{"ok":true, row:{date:"2026-08-12",…}}`.
- `m-eng-09.test.js:181` runs the gate against the real file and the real
  `process.platform`, so it will `assert.fail` on any host where `process.platform === "linux"`.
- `.github/workflows/pr-tests.yml:87` still pins `engine-tests` to `os: [ubuntu-latest]`.

**Disposition: open, operator-gated — correctly not remediated by an agent.** PLAN §11
names this as a *named operator step*: a real credentialed measurement on a Linux host
(`PDLC_LIVE=1 node --test __tests__/live/guard-measurement.test.js`, then appending that
host's own five-column row). No agent-authored row would be a measurement; writing one
without running it would fabricate the evidence the gate exists to demand. The
implementation is correct and the gate is behaving exactly as designed
(`m-eng-09.test.js:170-179` documents this intended red state verbatim). **It nonetheless
remains ship-blocking**: until the operator records the row, `engine-tests` is red on
`ubuntu-latest` and Phase PUB cannot pass. This is a human step, not a remediation round.

### §1.2 New findings in the remediation diff

The remediation diff touches **no production file** — six test files and one constraints
doc — so criteria 1–3 (stubs, mock data, unwired integrations) cannot have regressed and
were not re-scanned, per this SKILL's v2+ delta rule. Spot-reviewing the diff for new
defects surfaced two, **neither High**:

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| **F-16** | 6(a) (adjacent-surface falsification) | low | `pdlc/engine/__tests__/transport-cli.test.js:229-233` | The new header block states the file "deliberately does not attempt to exercise `defaultSpawnFn` or `parseStreamJsonLines`: **both are reachable only via a real `claude` child process**, which the hermeticity guard blocks by construction". That is true of `defaultSpawnFn`; it is **false of `parseStreamJsonLines`**, which is a pure `async function*` over *any* async-iterable of chunks (`lib/transport-cli.mjs:117-140`) — it takes `childStdout` as a parameter and never touches `spawn`. Exporting it and feeding it a fixture-byte generator needs no child at all. The comment converts v1's F-07 (an open coverage gap with a named fix) into a claim that the fix is impossible, which will read to the next maintainer as a settled exclusion. It also forward-references "this file's own DoD report for the residual coverage note" — this is that note. | Correct the sentence to name `defaultSpawnFn` alone, or implement F-07's fix (export `parseStreamJsonLines`, drive `.jsonl` fixture bytes chunked mid-line and with no trailing newline) and delete the disclosure. | Local |
| **F-17** | 5 (requirements) / 6(a) | medium | `pdlc/engine/__tests__/_assert-suite-wide.mjs:265-268`, `corpus-model-map.test.js:443-449` | Both new files decline PROP-MODEL-9 (`no dispatch may yield a descriptor recording `"unpinned"` or any fabricated value`) by citing an owner: "*the `"unpinned"` descriptor spelling itself is PROP-MODEL-9's, owned by `adapter-descriptor.test.js` (T22 → T36), not this row's*". **That owner does not carry it.** `grep -rn 'unpinned\|PROP-MODEL-9' pdlc/engine/` matches only these two comments — nothing in `adapter-descriptor.test.js`, which asserts only *pinned* dispatches (`:157` `model:"sonnet"`, `:170,177` `model:"opus"`). The production behaviour is correct (`adapter.mjs:386` records `dispatchOpts.model ?? null`), but no test drives an unpinned `_agent(skill, prompt)` call and asserts the descriptor's `model` is `null` — `grep` for any assertion of a null `model` returns nothing. So PROP-MODEL-9 is unasserted anywhere, and two new comments now assert that it is covered. `corpus-model-map.test.js:443` only shows the *oracle* rejects a hand-built `"unpinned"` record; it says nothing about what production emits. | Add one test in `adapter-descriptor.test.js`: dispatch through `_agent` with no `model` option and assert the recorded descriptor's `model === null` (not `"unpinned"`, not `undefined`, not a fabricated default) — then the two comments become true. | Local |

No new High-severity issue was introduced. Specifically checked and clean: the new
`publishRecords` path (`_corpus.mjs:553-568`) is per-pid **and** per-call
(`corpus-${process.pid}-${publishSeq++}.jsonl`), so parallel test processes cannot
collide, and it is a no-op when `PDLC_TEST_RUN_DIR` is unset — the per-run scratch
isolation that runs ii and v(b) depend on for exact record counts is preserved;
`assert-suite-wide.test.js` imports the synthetic witness population from `_corpus.mjs`
rather than from another `*.test.js` (which would re-register its `test()` calls);
`M_ENG_07`'s row-4 witness reads `B.seq > F.seq` rather than adjacency, so interleaving
cannot make it flaky.

---

## §2 Requirements Traceability (carried forward from v1; only remediated rows re-derived)

Rows 1–12, 14–15, 17–23, 25–26 are carried forward from v1 unchanged — the remediation
diff does not touch their implementation or test paths. Re-derived rows:

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 5 | REQ | AC-1.5 — Anti-fork | `lib/run.mjs:58` | `__tests__/run.test.js:51,67` (PROP-FORK-1/2) | PROP-FORK-3 still untested | medium (F-11) | Local |
| 13 | REQ | AC-3.3 — Dispatch model set-equals pinned map, both directions | `orchestrate-dev.js` / `orchestrate-queue.js` model constants; `_corpus.mjs` five-run corpus | `__tests__/corpus-model-map.test.js` (36 tests) + `_assert-suite-wide.mjs:239` suite-wide row over the corpus's real published descriptors | **No** — was YES/high at v1 | — | Local |
| 16 | REQ | AC-4.1 — Six-member outcome taxonomy | `lib/outcome.mjs:35-42,55-65` | `__tests__/outcome.test.js:45` (reverse) + `_assert-suite-wide.mjs` forward row, five-row enumeration self-asserted | **No** — was Partial/high at v1 | — | Local |
| 23 | REQ | AC-6.1 — Hermetic suite, observation-backed, §7.4's five rows | `__tests__/_run-suite.mjs`, `_bootstrap.mjs`, `_assert-suite-wide.mjs` | `assert-suite-wide.test.js`, `corpus-model-map.test.js`, `suite-spine.test.js`, `hermeticity.test.js`; oracle-mutation verified (§0) | **No** — was Partial (2 of 5 rows)/high at v1 | — | Local |
| 24 | REQ | AC-6.2 — Opt-in live smoke | `__tests__/live/smoke.test.js` (real transport, real repo) | itself, gated on `PDLC_LIVE=1`; collected-and-skipped in the hermetic suite | **No** for the harness; the dated evidence line is PLAN §8-waived to the operator | — | Local |
| — | PROPERTIES | PROP-MODEL-9 — no descriptor records `"unpinned"`/a fabricated model | `lib/adapter.mjs:386` (`?? null`) — correct | **Not found** anywhere; two comments cite an owner that does not carry it | **YES** | medium (F-17) | Local |
| — | REQ/M-ENG-09 | Guard measurement recorded per platform | `lib/guard-measurement.mjs`, `m-eng-09.test.js:181` | gate is real and red on `linux` | **YES — operator-gated** | high (F-01) | Local |

**Traced: 25/26 ACs** (up from 24/26). AC-3.3 and AC-6.1 gained real falsifiable oracles;
AC-6.2 gained its harness. The one remaining AC-level gap is M-ENG-09's `linux` row, which
is an operator measurement, not code.

---

## §3 Integration-Boundary Integrity

**(a) Adjacent-surface falsification.** The remediation *closed* v1's largest one
(M-ENG-06's stale table, F-06) and, notably, updated M-ENG-06's AC-6.2 row honestly —
"the mechanism is delivered; no maintainer-recorded live run exists yet" — rather than
marking it green off the new harness. That is the right call and I verified the row's own
citations resolve. Two adjacent-surface claims are still or newly false: PLAN §8/§11's
workflows-diff claims (F-10, unchanged — re-measured at 8 paths this round), and the new
`transport-cli.test.js` header's `parseStreamJsonLines` reachability claim (F-16). F-17 is
the same class one level down: a comment asserting coverage that its named owner does not
provide.

**(b) Deferral binding.** No new deferral was introduced by the remediation diff. v1's
survey stands: the deferrals present (O-1/O-6, D-DIST-07 at queue row 6, the `lib/skills.mjs`
prompt-cache deferral) are each bound to a queue row, a DECISIONS entry or a measurement
precondition. F-01 is not an unbound deferral — PLAN §11 binds it to a named operator step
with an exact command, and the gate itself is what enforces it.

**(c) Sibling surfaces.** The CLI transport was v1's under-covered member of the
two-transport family; at 100 % branch it is now the *better*-covered member on that axis
(`transport.mjs` is 88.73 %), and `guard-parity.test.js` / `transport-boundary.test.js`
still assert the pairing. The new suite-wide step writes into `PDLC_TEST_RUN_DIR` alongside
`_bootstrap.mjs`'s observation writer; I checked for a second writer overwriting the same
key and found none — `publishRecords` appends under a distinct per-pid, per-call filename
and never rewrites the bootstrap writer's `${pid}.jsonl`.

---

## §4 Notes for the remediator

The remediation round did what it set out to do. Five of v1's six High findings are
genuinely closed, each with a real falsifying oracle rather than an assertion-free test —
I drove the new suite-wide step into a red state by hand to confirm it is load-bearing,
and re-measured coverage rather than trusting the commit message. The work also stayed
strictly inside the test tier: **not one production line changed**, so nothing already
verified in v1 could regress.

What remains:

1. **F-01 is the only ship-blocker and it is not yours.** It needs a human on a Linux host
   to run the named PLAN §11 command and append the measured row. Until then `engine-tests`
   is red on `ubuntu-latest` and Phase PUB cannot pass. Do not synthesise the row.
2. **F-17 (medium) is the sharpest of the new findings**: two comments now claim
   PROP-MODEL-9 is owned elsewhere when nothing asserts it. One test in
   `adapter-descriptor.test.js` closes it and makes both comments true.
3. **F-16 (low)** — one sentence to correct, or F-07 to implement. The two are the same
   decision: either `parseStreamJsonLines` gets exported and fixture-driven (closing F-07,
   raising `transport-cli.mjs` line/function coverage off 82.63/77.78), or the comment
   stops claiming that is impossible.
4. F-08 (`skills.mjs` 78.89 % branch) is the one remaining *coverage* violation of PLAN §8's
   per-module floor, and is unchanged from v1. F-09, F-10, F-11 and the four lows are all
   unchanged and untouched.

V2 and V4 remain environmental, exactly as v1 determined; V4 was re-run this round and its
output is byte-identical, so the next round need not re-derive it either.

---

## Verdict

One High-severity finding remains open and ship-blocking: M-ENG-09's missing `linux`
measurement row (F-01), which turns the `engine-tests` CI job red on `ubuntu-latest`. It is
**operator-gated by design** — PLAN §11 names it as a human step requiring a real
credentialed measurement — not a remediation failure, and no agent should close it. Five of
v1's six High findings (F-02, F-03, F-04, F-05, F-06) are verified resolved against HEAD
commands and diffs. No new High-severity issue was introduced; two new lower-severity
findings (F-17 medium, F-16 low) concern comments that overclaim coverage. Seven of v1's
mediums and lows carry forward unchanged.

VERDICT: Needs revision
