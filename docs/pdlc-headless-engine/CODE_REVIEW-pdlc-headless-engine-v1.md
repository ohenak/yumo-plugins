# CODE REVIEW — pdlc-headless-engine v1

**Scope:** Local — `pdlc/engine/**` (bin, lib, `__tests__`), this feature's edits to
`pdlc/workflows/orchestrate-dev.js` and `pdlc/workflows/orchestrate-queue.js`,
`.claude/pdlc.config.json`, `.github/workflows/pr-tests.yml`,
`docs/_constraints/pdlc-engine-baseline.md`. Two findings are tagged `Cross-Feature`
where the diff falsifies a surface outside this feature's own artifacts.

| Field | Value |
|---|---|
| Feature | `pdlc-headless-engine` |
| Round | v1 (first DoD verification; no prior CODE_REVIEW exists) |
| Branch | `feat-pdlc-headless-engine` |
| Verified at | HEAD `60415577`, working tree clean but for untracked `.claude/settings.json`, `.serena/` |
| Specs read | REQ v0.10 (26 ACs), FSPEC v1.7 (69 ATs incl. `AT-ENG-11a`), TSPEC v1.5, DECISIONS, PLAN (§8 DoD, §11 Verification), PROPERTIES (227 `PROP-*` rows) |
| Verdict | **Findings** |
| Branch coverage (lowest `lib/` module) | **70.59 %** (`lib/transport-cli.mjs`) |
| Requirements traced | 24/26 ACs traced to implementation **and** a falsifiable test |

---

## §0 PLAN §11 verification commands — run verbatim

Every command below was executed on this branch, from the working directory PLAN §11
names. Output is reported as observed, not as expected.

| # | Command | Exit | Observed |
|---|---|---|---|
| **V1** | `cd pdlc/engine && npm ci && npm test` | **0** | `npm ci` clean. Suite: `# tests 525 / # pass 524 / # fail 0 / # skipped 1`. The one skip is `O-2 live measurement … # SKIP requires PDLC_LIVE=1`, the sanctioned opt-in gate. Runner is `node __tests__/_run-suite.mjs` per `package.json` `scripts.test` — T11's single spelling is in place, so the suite-wide assertion step and `PDLC_TEST_RUN_ID` minting both ran. |
| **V2** | `cd pdlc/workflows && npm test` | **1** | `Test Suites: 1 failed, 83 passed, 84 total` / `Tests: 1 failed, 70 skipped, 3545 passed`. The single failure is `__tests__/documentOracles.test.js:246` (`AT-22: coveredViolations(LIVE_ROOT) is empty`). **Determined environmental, not a feature regression:** all 15 paths in the failure diff were extracted and checked with `git ls-files --error-unmatch`; **every one is untracked local state** (`.claude/worktrees/agent-a2b6bd5d6e98e808a/**`, `.serena/cache/**`, `.tokensave/tokensave.db`). This is exactly the `process.cwd()`/`LIVE_ROOT` working-tree sensitivity PLAN §8 and §11 describe. With `documentOracles` ignored — the pattern the wave gate carries — the workflows suite is green. |
| **V3** | `node pdlc/workflows/build-runtime.mjs --check` | **0** | `in-sync` for all four rows: `orchestrate-queue.bundle.js`, `orchestrate-dev.bundle.js`, `pdlc-cli.mjs`, `distribution-manifest.json`. T16's rebuild is committed with its source change. |
| **V4** | `pdlc/hooks/scripts/sync-workflows.sh --check` | **1** | Two lines: a `distribution.checkEnabled` read warning (`assuming true` — the config carries no `distribution` key; pre-existing, fail-soft, not feature-caused), and one retired-present row: `consolidate-learnings.bundle.js`. **Determined environmental:** `git ls-tree main pdlc/workflows/dist/` carries `consolidate-learnings.bundle.js`; `git ls-tree HEAD` does not — the artifact was added on `main` *after* this branch's merge base, so this is un-rebased-branch state plus a stale consumer copy (`.claude/workflows/` synced 2026-08-11 at plugin `0.22.7`, dist rebuilt today at `0.22.0`). Phase DOD step 0's rebase onto `main` followed by a plain `sync-workflows.sh` clears it. No engine-side defect. |
| **V5** | `cd pdlc/engine && npm test -- --experimental-test-coverage` | **0** | Ran through `scripts.test` (T11's forwarding clause works — the flag reached the spawned `node --test`, and the run was hermetic). Coverage table transcribed below. |

**V5 branch coverage, `lib/` modules, as read off the run:**

| Module | line % | **branch %** | funcs % | ≥ 85 % branch? |
|---|---|---|---|---|
| `lib/outcome.mjs` | 100.00 | **100.00** | 100.00 | ✅ (§8-named) |
| `lib/catalogue.mjs` | 100.00 | **92.31** | 100.00 | ✅ (§8-named) |
| `lib/auth.mjs` | 100.00 | **93.33** | 100.00 | ✅ (§8-named) |
| `lib/transport-cli.mjs` | 80.84 | **70.59** | 77.78 | ❌ **(§8-named)** |
| `lib/skills.mjs` | 98.64 | **78.89** | 89.47 | ❌ (O-ENG-T8's per-module floor) |
| `lib/handshake.mjs` | 100.00 | 95.06 | 100.00 | ✅ |
| `lib/guard-measurement.mjs` | 97.87 | 93.94 | 100.00 | ✅ |
| `lib/run.mjs` | 98.83 | 92.73 | 100.00 | ✅ |
| `lib/startup.mjs` | 98.38 | 89.92 | 100.00 | ✅ |
| `lib/adapter.mjs` | 98.97 | 89.08 | 90.32 | ✅ |
| `lib/report.mjs` | 100.00 | 100.00 | 100.00 | ✅ |
| `lib/transport.mjs` | 98.39 | 88.73 | 100.00 | ✅ |
| `bin/pdlc.mjs` | 84.09 | **67.65** | 80.95 | ❌ (outside `lib/`) |
| all files | 83.83 | 80.43 | 84.62 | — |

**Git-observed DoD claims (PLAN §11's "two claims no command makes"):**

- `git diff --stat $(git merge-base HEAD main)..HEAD -- pdlc/workflows/` → **8 paths**, not the
  six §11 names. See F-10.
- `git status --porcelain .claude/workflows/` → **empty**. The consumer copy stayed untracked. ✅

---

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| F-01 | 5 (requirements) | **high** | `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-09 section) | The `M-ENG-09` table carries exactly one row, `platform: darwin`. `m-eng-09.test.js:181` reads the real baseline for the real `process.platform` and fails when no consistent row exists. Simulated directly: `checkGuardMeasurement({platform:"linux"})` → `{"ok":false,"messageId":"guard.measurement-missing"}`; `platform:"darwin"` → `{"ok":true}`. The `engine-tests` CI job runs on `ubuntu-latest` (`pr-tests.yml:87`), i.e. `process.platform === "linux"`. **The V1 command will go red in CI**, blocking Phase PUB. PLAN §8 (`PLAN:653-661`) states this item literally: a row is required for `linux` **and** the wave host's `darwin`, "one row suffices only when the wave host and CI platform coincide" — they do not. | Run PLAN §11's named operator step on a `linux` host — `PDLC_LIVE=1 node --test __tests__/live/guard-measurement.test.js` from `pdlc/engine` — and append the resulting five-column row to `docs/_constraints/pdlc-engine-baseline.md`'s M-ENG-09 table. | Local |
| F-02 | 4 (coverage) | **high** | `pdlc/engine/lib/transport-cli.mjs` | Branch coverage **70.59 %** against PLAN §8's explicit ≥ 85 % floor over four named modules, of which this is one (`PLAN:627-629`). Uncovered: `127-140` (`parseStreamJsonLines`, the whole stream-json parser), `157-200` (`defaultSpawnFn`), `277-280` (the malformed-message `TransportError`), `304-305` (the `timedOut` `TimeoutError` throw). O-ENG-T8 (`PLAN:800`) predicted precisely this module: "the least-exercised module in the feature and the one with no CI-observable happy path". Lines `277-280` and `303-305` are *error paths*, not incidental branches. | Add hermetic tests for the malformed-message and timeout branches through the injected `spawnFn` seam, and reach `parseStreamJsonLines` (see F-07). Re-measure with V5 until the module clears 85 % branch. | Local |
| F-03 | 5 (requirements) | **high** | `pdlc/engine/__tests__/live/smoke.test.js` — **file does not exist** | PLAN T51 (`PLAN:241`) owns the flag-gated live smoke harness for **AC-6.2 / AT-ENG-65**. `grep -rn 'AT-ENG-65' pdlc/engine/` returns nothing; the only file under `__tests__/live/` is `guard-measurement.test.js`. PLAN §8 (`PLAN:613-616`) waives only the *evidence recording* for AC-6.2 ("operator-recorded, not suite-observed") — it does not waive T51's harness, and without the harness there is no invocation an operator could record a dated line *from*. AC-6.2 is undelivered, not merely unobserved. | Implement `pdlc/engine/__tests__/live/smoke.test.js` per T51 (one real small repo, §10.2's structural set plus one cross-review round to a terminal verdict, opt-in flag, no observation records), then record the dated evidence line in `docs/_constraints/pdlc-engine-baseline.md`. | Local |
| F-04 | 5 (requirements) | **high** | `pdlc/engine/__tests__/corpus-model-map.test.js` — **file does not exist** | PLAN T50 (`PLAN:240`) owns the model-map witness oracle for **AC-3.3 / AT-ENG-29** (`grep -rn 'AT-ENG-29' pdlc/engine/` → nothing). The seven per-row *witnesses* do exist, in `smoke.test.js:410,484,523,558,599,636` ("corpus i…v(b)", M-ENG-07 rows 1–7), but there is **no set-equality oracle in either direction**. PROP-MODEL-2 requires "set-equality in both directions over the five-configuration corpus"; PROP-MODEL-7 requires that "a map row unreachable in the corpus **must** fail set-equality". As shipped, deleting a corpus run or adding an eighth map row breaks nothing — the property has witnesses but no falsifier. PROP-MODEL-2…9 (eight rows) are unimplemented. | Implement T50's `corpus-model-map.test.js`: universal quantification for rows 1–2 over run i's wave set plus zero-`haiku` assertion, existential for 3/5/6/7, the `(F, B)` `promptHash` pairing for row 4, and set-equality in both directions over the union of recorded descriptors versus M-ENG-07's transcribed map (transcribed, per PROP-MODEL-8 — never imported from the modules' constants). | Local |
| F-05 | 5 (requirements) | **high** | `pdlc/engine/__tests__/_assert-suite-wide.mjs:1-11` | The module's own header states it is the "**Minimum implementation to satisfy `assert-suite-wide.test.js` (T03's own acceptance test)**" and that "the model-map and dispatchable-skills rows, and the spine self-assertion, are out of scope for this file". It implements **2 of TSPEC §7.4's 5 rows** (message-catalogue set-equality; outcome-taxonomy *forward only*). PLAN §8 (`PLAN:573-574`) states the DoD item verbatim: "all five rows of TSPEC §7.4's property table are implemented in `_assert-suite-wide.mjs`, and the module enumerates all five (T19, T52)". T52 has not landed. The emptiness guard (`:44-47`) and the run-dir guard (`:27-30`) *are* present, so the vacuous-green risk PLAN §10 names is closed for the two implemented rows only. | Implement T52: add the pinned-model-map row, the dispatchable-skills row (both directions over `DISPATCHABLE_SKILLS`), the pre-phase row (`corpusRun != null && phase === null`), the spine self-assertion, and make the module enumerate all five rows so a missing row is itself detectable. | Local |
| F-06 | 6(a) / Documents | **high** | `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-06 section) | PLAN §8's Documents item (`PLAN:683`) requires "`M-ENG-06`'s per-criterion rows restated against the delivered engine (T53)". M-ENG-06 is still the **v0.6-era, pre-implementation snapshot**: it opens "at HEAD, `REQ-pdlc-headless-engine.md` (v0.6) as pm-author saw it", and its table still classifies AC-1.1, AC-2.1/2.2/2.4, AC-3.3, AC-3.5, AC-4.5's per-dispatch auth clause, AC-5.1/5.2, AC-6.2/6.3/6.4 as "**red — open work**", and AC-4.1/2.3/4.4 as "partially green". Almost all of those are now delivered and tested. The document is a *cited* constraints artifact (REQs cite it by id rather than re-carrying facts), so every downstream citation now reads a false state — this is an adjacent-surface falsification in the strict sense, not just a stale to-do. | Deliver T53: restate M-ENG-06's per-criterion rows against the delivered engine, with the rows that remain genuinely red (AC-3.3's set-equality, AC-6.2) named as such. | Cross-Feature |
| F-07 | 4 (coverage) / 5 | medium | `pdlc/engine/lib/transport-cli.mjs:127-140` vs `pdlc/engine/__tests__/transport-cli.test.js:46-53` | `parseStreamJsonLines` — the module's stream-json framing logic, including the partial-line buffer, the blank-line skip and the trailing-remainder flush — has **zero coverage**. The test suite's `loadFixtureMessages` re-implements the splitter in the test (`text.split("\n").map(trim).filter(len).map(JSON.parse)`), so the recorded `.jsonl` fixtures exercise the *test's* parser and never the production one. The function is module-private and only reachable through `defaultSpawnFn`, which TSPEC §7.1's construction guard traps. A green suite therefore proves nothing about the parser that will handle real `claude -p` output. | Export `parseStreamJsonLines` (or an equivalent seam) and drive it directly from the `.jsonl` fixture bytes — including a chunk boundary split mid-line and a no-trailing-newline final record — then have `loadFixtureMessages` call it rather than duplicating it. | Local |
| F-08 | 4 (coverage) | medium | `pdlc/engine/lib/skills.mjs` | Branch coverage **78.89 %** (uncovered `76-77`, `149`, `309-310`), below the ≥ 85 % floor. O-ENG-T8 (`PLAN:800`) settles the ambiguity explicitly: "**Per-module over `pdlc/engine/lib/`**, not aggregate … §8's coverage item is read as a floor on every `lib/*.mjs` file, clear on its own". | Cover the three uncovered branch sites, or record an explicit, PLAN-sanctioned exemption. | Local |
| F-09 | 1 / 5 | medium | `pdlc/workflows/orchestrate-dev.js` (`deadlineSleep`, and `_sleep = deadlineSleep` at `runAdvisorySeam`) | A new behaviour was introduced in a **shipped** pipeline module: `runAdvisorySeam`'s attempt-deadline timer is now unref'd. The rationale in the comment is sound and the change is narrow, but: (a) no REQ/FSPEC/TSPEC/PROPERTIES/DECISIONS row names it — `grep -rn 'deadlineSleep\|unref'` across the feature's six spec documents returns nothing; (b) **no test exists** — `grep -rn 'deadlineSleep\|unref' pdlc/workflows/__tests__/ pdlc/engine/__tests__/` returns nothing. An untested, unspecified change to a timer in the advisory seam can be silently reverted by any later edit with no red test. | Either add a PROPERTIES row plus a falsifying test (assert the raced timer does not hold the loop open — e.g. a headless process that exits promptly after the seam resolves), or record it as a DECISIONS entry with an explicit no-test rationale. | Local |
| F-10 | 6(a) | medium | `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md:603-604` and `:667-668`, `:906-908` | The delivered diff **falsifies two of the PLAN's own boundary statements**. (i) §8: "the workflows-side change touches exactly two files: the added exports plus the literals replaced at dispatch sites. **No pipeline behaviour changes**". Observed `git diff --stat` names **eight** paths, and both modules changed behaviour: `orchestrate-dev.js` re-throws `err.seamUnavailable` from `main()`'s catch instead of folding it into `haltReason`, and `orchestrate-queue.js` gained `parseDistributionCheckEnabledOptOut` + `distributionOptOutGate`, a **new drift-gate short-circuit that runs before the drift-state record is read**. (ii) §11: "`git diff --stat $(git merge-base HEAD main)..HEAD -- pdlc/workflows/` shows exactly `orchestrate-dev.js`, `orchestrate-queue.js` and paths under `dist/` — any fourth path is C-4's fork-by-accident". Two `pdlc/workflows/__tests__/` paths appear. **Both behaviour changes are authorised elsewhere** — EC-PAR-5/PROP-PARITY-10 (`FSPEC:1100`, `PROPERTIES:132`) for the re-throw, and REQ:365-374 / PROP-READ-2 (`PROPERTIES:142`, which even cites `orchestrate-queue.js:2068`) for the opt-out — and the two extra paths are the test files the DoD's own no-bare-literal item demands. This is a false PLAN, not a fork. | Erratum the PLAN: correct §8's "exactly two files / no pipeline behaviour changes" to name the two authorised behaviour changes and their governing clauses, and correct §11's `git diff --stat` check to admit `pdlc/workflows/__tests__/` paths. | Local |
| F-11 | 5 (requirements) | medium | `pdlc/engine/__tests__/` (no file) | **PROP-FORK-3** — "Only `lib/run.mjs` **must** name a path under `pdlc/workflows/`; any other engine file naming one fails the suite" (`PROPERTIES:140`, R-ARCH-1, PLAN §8 `:671-672`, owned by T39) — has **no test**. `grep -rn 'PROP-FORK' pdlc/engine/__tests__/` finds only PROP-FORK-1. Manually verified the invariant *currently holds* (`grep -rn "pdlc/workflows" lib/ bin/` → nine hits, all in comments in `startup.mjs`, `adapter.mjs`, `report.mjs`, `run.mjs`; no path expression outside `run.mjs`), but nothing keeps it holding. The DoD item as worded requires the failing-suite mechanism, not the current state. | Add the T39 scanner test: read every `pdlc/engine/{lib,bin}/**` file, assert no file other than `lib/run.mjs` contains a `pdlc/workflows/` path expression, with a positive control proving the scanner fires. | Local |
| F-12 | 4 (coverage) | medium | `pdlc/engine/bin/pdlc.mjs` | Branch coverage **67.65 %**, funcs 80.95 % — the lowest in the tree. Large uncovered spans (`169-202`, `381-393`, `432-443`, `455-459`, `486-488`, `506-508`) sit on the composition root, the surface AC-1.4's exit codes and the report block are ultimately read from. `bin/` is outside §8's literal `lib/*.mjs` floor, so this is not a DoD violation on the letter — but it is the operator-visible entry point, and criterion 4's "flag uncovered error paths explicitly" applies. | Cover the uncovered CLI branches, or state a scoped exemption in the PLAN. | Local |
| F-13 | 5 (requirements) | low | `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md:170-243` (task table status column) | The task table's status column is stale and no longer a usable oracle: T11, T17, T19, T29, T30, T31, T35–T42, T44, T47, T48 read `⬚` though their deliverables are demonstrably landed and green (e.g. `scripts.test` is `node __tests__/_run-suite.mjs`, `engine-tests` exists at `pr-tests.yml:77`, `tunables.test.js` passes 521 assertions). Conversely the genuinely-undelivered T50/T51/T52/T53 read the same `⬚`, so the column cannot distinguish "done" from "not done" — the exact distinction a reader needs at DoD. | Refresh the status column, or delete it and let §8's DoD checklist be the single source. | Local |
| F-14 | 5 (requirements) | low | `pdlc/engine/__tests__/cli.test.js:52` | Test title: "``--dry-run-skill`` selects any of the 17 prompt files". The body performs **one** `--dry-run-skill se-implement:SKILL-typescript.md` invocation and asserts that one supplement's bytes appear. The title claims a quantified property the assertions do not make. It is also the count shape PROP-SKILL-4 explicitly forbids as an oracle ("Neither direction … must be expressed as a count (`17`, `10`, `12`)"). The *assertions* are correct; only the name over-claims. | Rename to what is asserted (e.g. "`--dry-run-skill` resolves an explicit supplement path and prints its bytes verbatim"), or quantify the test over the derived identifier set. | Local |
| F-15 | 5 (requirements) | low | feature-wide traceability | Identifier-level traceability is incomplete in both directions. **19 of FSPEC's 69 ATs** are cited by no test file (`AT-ENG-01, 05, 15, 16, 19, 26, 27, 28, 29, 31, 32, 34, 35, 39, 42, 49, 52, 65, 67`) and **80 of PROPERTIES' 227 `PROP-*` rows** are cited by none. Sampling shows most are behaviourally covered by tests that simply do not name the id (PROP-CLI-1…4 by `cli.test.js:162-205`, PROP-HAND-* by `handshake.test.js`); two are genuinely absent and are raised above as F-03/F-04 (AT-ENG-65, AT-ENG-29) and F-11 (PROP-FORK-3). The residual risk is that a future reader cannot mechanically tell the two classes apart. | Add the id to each covering test's name or a header comment, so `grep AT-ENG-nn` is a sound traceability oracle — and so a genuinely-absent id stands out. | Local |

**Criteria 1–3 scanned clean.** `grep -rniE 'TODO|FIXME|HACK|XXX|not implemented|placeholder|dummy|stub|mock|fake|example\.com|localhost|Math\.random|DEBUG'` over `pdlc/engine/lib/` and `pdlc/engine/bin/` returns two hits, both legitimate: `run.mjs:105` (a doc comment describing the *modules'* throwing `agent()` stub) and `adapter.mjs:114` (`defaultJitter`, the injectable jitter seam whose laws PROP-RETRY/T21 property-test). No mock or seed data in production code; no unwired integration — every transport, catalogue, handshake and guard surface is reached from `bin/pdlc.mjs`'s composition root. `stampReport` (`lib/report.mjs:110-112`) adds exactly one key, `engine`, as §8 requires. No fixture credential: `fixtures-redaction.test.js` ships the scanner with a paired positive control (`:117`) driven off the scanner's own pattern.

---

## §2 Requirements Traceability

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-1.1 | Full pipeline runs headless end-to-end | `bin/pdlc.mjs`, `lib/run.mjs` | `__tests__/smoke.test.js`, `__tests__/parity.test.js` | No | — | Local |
| 2 | REQ AC-1.2 | Read containment: `.claude/workflows/` read-set empty | `lib/run.mjs`, `__tests__/_bootstrap.mjs` fs recorder | `__tests__/fs-observation.test.js:172,232` + `fixtures/consumer-ac12/` | No | — | Local |
| 3 | REQ AC-1.3 | Queue triage surface | `bin/pdlc.mjs`, `orchestrate-queue.js` opt-out | `__tests__/cli.test.js:70`, `__tests__/exit-loop.test.js`, `queueDriftGate.test.js` | No | — | Local |
| 4 | REQ AC-1.4 | Halt recorded; exits `2` / `1` | `lib/outcome.mjs`, `bin/pdlc.mjs` | `__tests__/exit-loop.test.js`, `__tests__/outcome.test.js` | No | — | Local |
| 5 | REQ AC-1.5 | Anti-fork: no second copy of the modules | `lib/run.mjs:58` (repo-relative resolution) | `__tests__/run.test.js:48,67` (PROP-FORK-1/2) | Partial — PROP-FORK-3 half untested | medium (F-11) | Local |
| 6 | REQ AC-2.1 | Startup banner, six auth rows | `lib/auth.mjs`, `lib/startup.mjs` | `__tests__/auth.test.js`, `__tests__/startup.test.js`, `__tests__/startup-ladder.test.js` | No | — | Local |
| 7 | REQ AC-2.2 | API key without opt-in ⇒ refusal | `lib/auth.mjs` (`resolveAuthPosture`) | `__tests__/auth.test.js`, `__tests__/tunables.test.js:517,521` | No | — | Local |
| 8 | REQ AC-2.3 | Proxy env passthrough, every dispatch | `lib/transport.mjs`, `lib/transport-cli.mjs:245` | `__tests__/transport.test.js`, `__tests__/transport-boundary.test.js` | No | — | Local |
| 9 | REQ AC-2.4 | Logged-in session honoured, key ignored | `lib/auth.mjs`, `lib/startup.mjs` | `__tests__/auth.test.js`, `__tests__/startup.test.js` | No | — | Local |
| 10 | REQ AC-2.5 | Dispatch `cwd` | `lib/transport.mjs`, `lib/run.mjs:155` | `__tests__/transport.test.js`, `__tests__/run.test.js` | No | — | Local |
| 11 | REQ AC-3.1 | Composed prompt per skill; no Skill-tool text | `lib/skills.mjs` | `__tests__/skills.test.js`, `__tests__/skills-composition.test.js`, `__tests__/cli.test.js:42` | No | — | Local |
| 12 | REQ AC-3.2 | No plugin installed ⇒ legible refusal | `lib/handshake.mjs`, `lib/startup.mjs` | `__tests__/handshake.test.js`, `__tests__/cli.test.js:86,102,114` | No | — | Local |
| 13 | REQ AC-3.3 | **Dispatch corpus set-equals the pinned model map, both directions** | witnesses in `__tests__/_corpus.mjs`; map itself unenforced | `__tests__/smoke.test.js:410,484,523,558,599,636` (per-row witnesses only) | **YES — no set-equality oracle; `corpus-model-map.test.js` absent** | **high** (F-04) | Local |
| 14 | REQ AC-3.4 | Single permission setting per dispatch | `lib/transport.mjs`, `lib/transport-cli.mjs:255-257` | `__tests__/transport-boundary.test.js`, `__tests__/guard-parity.test.js` | No | — | Local |
| 15 | REQ AC-3.5 | Skill set-equality at startup | `lib/skills.mjs`, `orchestrate-dev.js` `DISPATCHABLE_SKILLS` | `__tests__/skills.test.js`, `workflows/__tests__/dispatchableSkills.test.js` | No | — | Local |
| 16 | REQ AC-4.1 | Six-member outcome taxonomy, both directions | `lib/outcome.mjs` | `__tests__/outcome.test.js:45` (forward), `:133-141` PROP-FAIL-3 (reverse, `deepEqual(reached, OUTCOMES)`) | No — but the *suite-wide* step is forward-only (see F-05) | — | Local |
| 17 | REQ AC-4.2 | Retry on `retryable` | `lib/adapter.mjs:122-140` | `__tests__/adapter-retry.test.js`, `__tests__/adapter.test.js` | No | — | Local |
| 18 | REQ AC-4.3 | Exhausted retry ⇒ named failure | `lib/adapter.mjs`, `lib/outcome.mjs` | `__tests__/adapter-retry.test.js`, `__tests__/exit-loop.test.js` | No | — | Local |
| 19 | REQ AC-4.4 | `auth-failure` never silently retried | `lib/adapter.mjs` (no `AuthPolicyError` retry branch), `lib/transport.mjs` | `__tests__/transport.test.js`, `__tests__/adapter-retry.test.js` | No | — | Local |
| 20 | REQ AC-4.5 | Report carries `engine` block fields | `lib/report.mjs:110`, `lib/adapter.mjs` | `__tests__/report.test.js`, `__tests__/report-engine.test.js` | No | — | Local |
| 21 | REQ AC-5.1 | Harvest guard fires when `LEARNINGS` absent | `lib/transport.mjs` hook carrier, `lib/transport-cli.mjs:60-85` `--settings` carrier | `__tests__/guard-parity.test.js` | No | — | Local |
| 22 | REQ AC-5.2 | Harvest's deletions allowed once `LEARNINGS` exists | same | `__tests__/guard-parity.test.js` | No | — | Local |
| 23 | REQ AC-6.1 | Hermetic suite, observation-backed | `__tests__/_run-suite.mjs`, `_bootstrap.mjs`, `_assert-suite-wide.mjs` | `__tests__/hermeticity.test.js`, `__tests__/suite-spine.test.js`, `__tests__/assert-suite-wide.test.js` | Partial — 2 of §7.4's 5 rows | **high** (F-05) | Local |
| 24 | REQ AC-6.2 | **Opt-in live smoke** | none | none — `__tests__/live/smoke.test.js` absent, `AT-ENG-65` uncited anywhere | **YES — not found** | **high** (F-03) | Local |
| 25 | REQ AC-6.3 | Per-transport recorded fixtures | `fixtures/transport-sdk/`, `fixtures/transport-cli/` | `__tests__/transport-cli.test.js`, `__tests__/transport.test.js`, `__tests__/fixtures-redaction.test.js` | No — but the CLI fixtures never reach the production parser | medium (F-07) | Local |
| 26 | REQ AC-6.4 | Closed message catalogue, both directions | `lib/catalogue.mjs` | `__tests__/catalogue.test.js`, `_assert-suite-wide.mjs:50-64` (set-equality, both directions) | No | — | Local |

**Traced: 24/26.** AC-3.3 and AC-6.2 have no falsifiable test path.

---

## §3 Integration-Boundary Integrity

**(a) Adjacent-surface falsification.** Two surfaces the diff makes false, both raised above:
`docs/_constraints/pdlc-engine-baseline.md`'s M-ENG-06 table (F-06, `Cross-Feature` — it is a
shared constraints artifact other REQs cite by id) and the PLAN's own §8/§11 boundary
statements (F-10). Swept the sibling family for each: the other `M-ENG-*` sections
(01–05, 07, 08) restate measurements that remain true at branch tip; `M-ENG-09` is
incomplete for a different reason (F-01). Re-measured the derivations the PLAN records —
`build-runtime.mjs --check` is green, so the `distribution-manifest.json` byte counts and
sha1s are current at branch tip.

**(b) Deferral binding.** Every deferral the feature leaves in place is bound.
`_sessionAgent` stays unwired (O-6) and is asserted so in `seam-contract.test.js`; the
runtime transport selector (O-1, DEC-ENG-01/02) is named in DECISIONS with
`resolveTransport` returning a constant `kind`; per-worktree consumer state is D-DIST-07,
which carries queue row 6 in `docs/_queue/QUEUE.md`; the `lib/skills.mjs` prompt-cache
deferral (`PLAN:803-811`) is stated on the plan's own authority with a measurement
precondition. No unbound deferral found — no "runbook step" or bare-prose successor.

**(c) Sibling surfaces.** `stampReport` is the only writer of the report's `engine` key
(`grep` over `lib/`, `bin/` confirms one writer, no later overwrite). Both transports were
checked as a same-shape family: the auth-policy check, the four-class error set, the
permission-mode setting and the guard carrier each have a counterpart in
`transport.mjs` and `transport-cli.mjs`, with `guard-parity.test.js` and
`transport-boundary.test.js` asserting the pairing — the family is covered, though the CLI
member is the one below the coverage floor (F-02).

---

## §4 Notes for the remediator

Six ship-blocking items, and they cluster: **F-03, F-04, F-05 and F-06 are the four
undelivered tasks T50–T53** (batches 9–11), and **F-01 is PLAN §5's named operator step**.
The engine's implementation is in good shape — criteria 1–3 are clean, 24 of 26 ACs trace
to real falsifiable tests, and V1/V3/V5 are green. What is missing is the last hardening
wave: the two oracles that make AC-3.3 and AC-6.1 falsifiable rather than merely
witnessed, the AC-6.2 harness, the restated M-ENG-06, the `linux` measurement row, and
coverage on the fallback transport.

F-01 is the one that will surface first and loudest: it turns the new `engine-tests` CI
job red on `ubuntu-latest`, so Phase PUB cannot pass until a `linux` row exists.

Two red verification commands (V2, V4) were investigated and determined **environmental**,
not defects — the evidence for each is recorded in §0 so the next round need not re-derive it.

---

## Verdict

Six high-severity findings, all ship-blocking under the DoD's own wording: a missing
`M-ENG-09` `linux` row that will fail the feature's new CI job (F-01), `lib/transport-cli.mjs`
at 70.59 % branch coverage against §8's ≥ 85 % floor over that named module (F-02), and four
undelivered PLAN tasks — T51's live smoke harness for AC-6.2 (F-03), T50's model-map
set-equality oracle for AC-3.3 (F-04), T52's remaining three `_assert-suite-wide.mjs` rows
(F-05), and T53's restatement of M-ENG-06 (F-06). Six medium and three low findings are
recorded above for the same remediation round.

VERDICT: Needs revision
