# CODE REVIEW — pdlc-workflow-distribution (v1)

Scope: Local + Cross-Feature — production surfaces of the distribution mechanism
(`pdlc/hooks/scripts/{check-workflow-drift.sh,sync-workflows.sh,lib/pdlc-drift.sh}`,
`pdlc/workflows/lib/document-oracles.mjs`, `pdlc/workflows/build-runtime.mjs`,
`pdlc/workflows/orchestrate-queue.js`) plus the documentation and packaging surfaces the
diff touches (`CLAUDE.md`, `pdlc/README.md`, `pdlc/RELEASE-CHECKLIST.md`, `pdlc/hooks/hooks.json`,
`.gitignore`, `.worktreeinclude`, `docs/_queue/QUEUE.md`).

| Field | Detail |
|---|---|
| Feature | pdlc-workflow-distribution |
| Branch | feat-pdlc-workflow-distribution (`ec94a31`) |
| Review version | 1 |
| Date | 2026-07-29 |
| Verdict | **Findings** |
| Branch coverage (lowest new module) | **39.13%** (`pdlc/workflows/build-runtime.mjs`) |
| Requirements traced | 26/30 |

## Measurements taken (not read — run)

| Command | Result |
|---|---|
| `cd pdlc/workflows && npm test` | 35/35 suites, **997 passed, 70 skipped, 0 failed**, 221 s |
| `node pdlc/workflows/build-runtime.mjs --check` | exit **0**, 3 rows in-sync |
| `pdlc/hooks/scripts/sync-workflows.sh --check` | exit **1**, **zero bytes on stdout and stderr** (this tree's `.claude/workflows/` is unbootstrapped; both rows `missing`) |
| `pdlc/hooks/scripts/check-workflow-drift.sh` | exit 0, two `pdlc: … is missing. Run: …` lines |
| `coveredViolations(LIVE_ROOT)` / `packagingViolations(LIVE_ROOT)` | `[]` / `[]` |
| `advertisedVersionViolation(LIVE_ROOT)` | `{skipped: S_NOTHING_STAGED}` (≠ `"red"`) |
| bash on this runner | GNU bash **3.2.57** — no `declare -A`, `${var^^}`, `mapfile`, `stat -c`, `find -newer`, `ls -t` anywhere in C1/C2/C3 |
| index modes | `100755` × 5 scripts, `100644` `lib/pdlc-drift.sh` |
| `git check-ignore -v --no-index` | `.claude/workflows/…` ignored by anchored `/​.claude/workflows/`; `pdlc/workflows/dist/…` **not** ignored |
| distinct `PROP-*` ids in `__tests__` | **63** (8 CLS / 6 RSN / 8 BSL / 13 BKP / 7 MTM / 8 SEAM / 6 DET / 7 NEG) — matches PLAN §9 |
| distinct `PROP-*` ids in `FALSIFICATION-LEDGER.md` | **63**, 73 rows |
| skips | all **70** originate in the pre-existing `__tests__/guardMatrix.test.js` (`it.skip.each`); zero from this feature's suites (runner uid ≠ 0) |
| branch coverage (full suite, `--coverage`) | `orchestrate-queue.js` **86.34%**, `lib/document-oracles.mjs` **85.12%**, `build-runtime.mjs` **39.13%** |

All mutations below were reverted and confirmed byte-identical by `shasum`; `git status --short` is
empty apart from this file.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| **DOD-01** | Unwired integration / req gap | **high** | `pdlc/workflows/orchestrate-queue.js:539-549` | The drift gate's report and reasons are propagated **only** on `outcome === "blocked"`. On a *proceeding* verdict — row 2 (`checkEnabled:false` opt-out) and row 8 (`local-edit`/`unverified`) — `driftGate.reasons` and `driftGate.report` are silently discarded: no `emit()`, no `driftReport` key in the `QueueReport`. **Measured**: driving the real `main()` with a `checkEnabled:false` record carrying a `stale` row returns `{"outcome":"idle","reason":"no candidate passed the readiness gate","remaining":1,…}` with **no** `driftReport` and logs `["Skip \"f1\": …","No ready REQ this pass …"]` — the skip is nowhere. Identical result for a `local-edit` row. AC-4.1 row 2 says "proceed; **skip noted in report**", row 8 says "proceed, **rows named in the run report**", AC-4.3 says "skips state evaluation **and notes the skip**". Every existing assertion (`queueDriftGate.test.js`, ~130 cases) is on `mapDriftState`'s **returned object** — node output, not the operator-visible artifact. | In `main()`, on `driftGate.outcome === "proceed"` with `row !== 9`, `emit(…)` the gate reasons and attach `driftReport: driftGate.report` to the returned report. Add a `main()`-level test (the only one today is the row-1 gate-placement case) that asserts the returned `QueueReport` names the skip for row 2 and names the rows for row 8. | Local |
| **DOD-02** | Unwired integration / vacuous oracle | **high** | `pdlc/workflows/__tests__/helpers/driftCapabilities.js:92,131` | PLAN §9's first DoD bullet claims: "`driftHelpers.test.js` compares `REGISTERED_SKIPS` against T-07's exported inventory (TSPEC §1.3 ∪ PROPERTIES §11.1) and fails on any member of the former absent from the latter, or with an empty invariant list". **That comparator does not exist.** `grep -rn "REGISTERED_SKIPS\|SKIP_INVENTORY" __tests__` matches only `driftCapabilities.js` itself and three *comments*; `driftHelpers.test.js` contains neither identifier. Both are dead exports. (The "empty invariant list" half *is* covered — `driftHelpers.test.js:81-95` exercises `assertInvariants`.) Secondary, structural: even if the comparator were written in `driftHelpers.test.js`, jest gives every test **file** its own module registry, so `REGISTERED_SKIPS` there would only ever hold skips registered by that same file — i.e. always empty, and the subset check always vacuously true. | Either (a) implement the comparator as a per-file assertion in every suite that can skip, or (b) move it to a jest reporter / `globalTeardown` that sees the whole run, or (c) if neither is wanted, delete `REGISTERED_SKIPS`/`SKIP_INVENTORY` and correct PLAN §9's bullet to state what is actually enforced. Do not leave the bullet claiming a guard that no code performs. | Local |
| **DOD-03** | Non-binding test / coverage gap | **high** | `pdlc/workflows/build-runtime.mjs:203-208,241-246`; `__tests__/runtimeBundle.test.js:85` | The generated-artifact freshness gate — the mechanism CLAUDE.md, PLAN §9 and the whole "`dist/` must be rebuilt in the same commit" discipline rest on — has **no falsifying test**. `runtimeBundle.test.js` only spawns `build-runtime.mjs --check` on an already-fresh tree and asserts exit 0; that passes whether or not the detector works. No test anywhere asserts `--check` reports `STALE` or exits non-zero. **Measured**: neutralising *both* `stale = true` assignments (bundle staleness at :204 and, newly added by this feature, manifest staleness at :242) so `--check` can never fail leaves the **entire suite green — 35/35 suites, 997 passed, 0 failed**. (Separately confirmed the detector *does* work: forcing a byte-difference makes `--check` print two `STALE` rows and exit 1 — so this is a missing oracle, not broken code.) Branch coverage of `build-runtime.mjs` is **39.13%**, well under the 85% floor; the uncovered lines are exactly these two branches plus the write path. | Add a test that builds a throwaway tree (or copies `dist/` to a temp root), perturbs one artifact **and** the manifest, runs `build-runtime.mjs --check` against it, and asserts non-zero exit plus a `STALE` line naming each perturbed row. The manifest-staleness branch is new in this diff and must ship its own falsifying test. | Local |
| **DOD-04** | Non-binding test (FSPEC §7.5 exemption iii) | medium | `pdlc/workflows/lib/document-oracles.mjs:114-117` | Exemption (iii) — "any `distribution-manifest.json`" — has **no detector**. **Measured**: mutating `isDistributionManifest` to `return false` (removing the clause entirely) leaves every oracle-consuming suite green: `documentOracles.test.js` 58/58, `driftBackups.test.js` + `driftFault.test.js` 93/93. The reason is a fixture short-circuit: the only `distribution-manifest.json` under `__tests__/fixtures/covered-violations/` sits at `pdlc/workflows/dist/distribution-manifest.json`, already exempt under clause (i)'s generated-tree prefix, so clause (iii) is never the decisive exemption. The `EXEMPTIONS` assertion PLAN §9 cites is set-equality against a literal four-member **string** array — helper output, not behaviour. | Add a fixture file `distribution-manifest.json` **outside** both generated trees (e.g. `docs/design/distribution-manifest.json`) containing one of the five patterns, and assert it is absent from `coveredViolations(FIXTURE_ROOT)`. Update the "exactly 7 enumerated paths" expectation accordingly. | Local |
| **DOD-05** | Adjacent-surface falsification | medium | `CLAUDE.md` — "Distribution scripts" table, `sync-workflows.sh` row | The row states `--check` "reports per-row sync state **without writing**". Both halves are false. (a) **It writes.** FSPEC §5.4's mode table is explicit — `--check` → "Writes drift state? **yes** (and, per AC-2.9(1), the directory containing it)". **Measured**: `.claude/workflows/.pdlc-drift-state.json` mtime advanced 1785350036 → 1785350087 across a `--check` run, with `"generatedBy": "check"` in the body. (b) **It does not report per-row state.** FSPEC §8.2's warning taxonomy is hook-only; C3 emits only W-1/W-3/W-4/W-6/W-7, so a consumer whose rows are all `stale`/`missing` gets **zero bytes on stdout and stderr** and a bare exit 1 — measured on this very repo. A row-by-row report is only available from `check-workflow-drift.sh`. | Correct the CLAUDE.md row to describe what `--check` does: classifies without copying artifacts, still writes the drift-state record, warns only on `unverified` / `local-edit` / degraded-baseline / write-failure rows, and signals `stale`/`missing` through the exit code. Cross-check `pdlc/README.md`'s equivalent paragraph. | Cross-Feature |
| **DOD-06** | Adjacent-surface / doc gap | medium | `CLAUDE.md`, `pdlc/README.md`, `pdlc/skills/orchestrate-queue/SKILL.md` | REQ-DIST-04 adds a **new blocking phase** to `orchestrate-queue` ("Queue: Drift gate") that can refuse to run the queue *before* `QUEUE.md` is even read, and a new operator control (`.claude/pdlc.config.json` → `distribution.checkEnabled`). None of the three operator-facing documents mentions either. `orchestrate-queue/SKILL.md`'s diff on this branch touches only the "Workflow Script Path" section. CLAUDE.md's queue paragraph still describes only `pending → in-progress → awaiting-merge → done` / `halted` / `blocked` with no drift precondition. | Add the drift gate and the `checkEnabled` opt-out to CLAUDE.md's queue section and to `orchestrate-queue/SKILL.md`, including what an operator does when the queue returns `outcome: "blocked", reason: "Drift gate row N: …"`. | Cross-Feature |
| **DOD-07** | Adjacent-surface falsification (self-inconsistent within one diff) | low | `docs/_queue/QUEUE.md` (table row 1 vs. prose block added by the same branch) | The table at HEAD reads `| 1 | in-progress | pdlc-workflow-distribution | … |`, while prose added in the same branch reads "**Row 1 is `halted`**, but not for the original reason…" and "**Land row 8 before setting this row back to `pending`.**" The shipped file contradicts itself, and the prose instruction is unreachable from the state the table declares. | Reconcile: either restore the prose to describe the actual status, or scope the paragraph as historical ("Row 1 *was* halted…"). | Cross-Feature |
| **DOD-08** | Coverage gap | low | `pdlc/RELEASE-CHECKLIST.md` | PLAN §9 requires the file to exist "with the three §2.1a rows and carrying none of the five patterns". The second half is covered only incidentally by `coveredViolations(LIVE_ROOT) == []`; the **existence and content half has no detector at all** — `grep -rn "RELEASE-CHECKLIST" pdlc/workflows/__tests__` returns exactly one hit, and it is a comment in `documentOracles.test.js:357`. Deleting the file would leave the suite green (and would make `coveredViolations` *more* green, not less). The file itself is present and correct; this is a missing oracle. | Add an assertion beside the D-1/D-2/D-3 document-correction oracles: `pdlc/RELEASE-CHECKLIST.md` exists at `LIVE_ROOT` and contains headings for all three commitments (AC-6.2a, AC-6.6 residual, NFR-2). | Local |
| **DOD-09** | Stale docstring | low | `pdlc/workflows/lib/document-oracles.mjs:11-22` | The module's own export list omits `S_PLUGIN_JSON_UNREADABLE` (added by CR F-19) — it names four `S_*` constants while five are exported. PLAN §8's batch-3 gate carries the same stale count ("four `S_*` strings exported"). | Add the fifth constant to the docstring; correct PLAN §8's batch-3 row. | Local |
| **DOD-10** | Stale derivation | low | `PLAN-pdlc-workflow-distribution.md:790` (§9) | The AT count is stated as **39** ("AT-1…AT-36 incl. AT-8a/8b, AT-14b, AT-18a/18b"). `AT-32(a)` is omitted from that enumeration yet ships as a real `it()` **and** as a `SKIP_INVENTORY` row (`driftCapabilities.js:96`). The measured distinct AT-id set for this feature is **40**. | Correct §9's count to 40 and add AT-32(a) to the enumeration. | Local |

## §2 Requirements Traceability

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ-DIST-00 | Managed set + comparison baseline | `lib/pdlc-drift.sh:952` `pdlc_load_manifest`, `:887` `pdlc_resolve_baseline` | `driftBaseline.test.js` (8 baseline reasons, set-equality) | No | — | — |
| 2 | REQ-DIST-01 / AC-1.x | Row classification, 6 states / 4 unknown reasons | `lib/pdlc-drift.sh:1257` `pdlc_classify_row`, `:1395` `pdlc_classify_all` | `driftClassify.test.js`, `PROP-CLS-*`, `PROP-RSN-*` | No | — | — |
| 3 | REQ-DIST-02 / AC-2.1–2.5a | SessionStart hook warns, exit 0 always | `check-workflow-drift.sh` | `driftHook.test.js`, `driftC1Absent.test.js` | No | — | — |
| 4 | AC-2.4 | Hook stays at exit 0 through a `set -u` fatal (`trap … ERR EXIT`) | `check-workflow-drift.sh:43` | `driftC1Absent.test.js` "G-02 / AC-2.4" | No | — | — |
| 5 | AC-2.7 / AC-2.9(1) | Every writer refreshes drift state; classify-before-write | `lib/pdlc-drift.sh:1559` `pdlc_write_drift_state` | `driftOrdering.test.js`, `PROP-MTM-*` | No | — | — |
| 6 | AC-2.9(3) | Write-failure ladder, 3 rungs | `lib/pdlc-drift.sh` ladder | `driftLadder.test.js`, `driftWriteFailure.test.js` | No | — | — |
| 7 | AC-2.9(5) | Unrecognised `PDLC_FAULT` ⇒ hook 0, `--check`/sync 4 | `lib/pdlc-drift.sh:121,175` | `driftFault.test.js` (AT-18a/18b) | No | — | — |
| 8 | REQ-DIST-03 / AC-3.1–3.2 | Copy semantics, backup-then-write, post-copy verify | `sync-workflows.sh:369-...`, `lib/pdlc-drift.sh:1645,1707` | `driftSync.test.js`, `driftBackups.test.js` | No | — | — |
| 9 | AC-3.3 | Exit-code table applied post-run | `sync-workflows.sh:604-...` | `driftSync.test.js`, `PROP-MTM-04` | No | — | — |
| 10 | AC-3.4/3.5 (`--force`) | `--force` also overwrites `local-edit`/`unverified` | `sync-workflows.sh:372-377` | `driftSync.test.js` `PROP-MTM-03`, `driftBackups.test.js` `PROP-NEG-03` — **mutation-verified**: dropping `unverified` from the force-eligible set reds 3 tests across 2 suites | No | — | — |
| 11 | AC-3.9 | Backup grammar / pruning | `lib/pdlc-drift.sh:381-501` | `driftBackups.test.js` (13 `PROP-BKP-*`) | No | — | — |
| 12 | **AC-4.1 row 2** | `checkEnabled:false` ⇒ **proceed; skip noted in report** | `orchestrate-queue.js:1027-1030` decides correctly, but `main():539-549` **discards the report on proceed** | `queueDriftGate.test.js` asserts `mapDriftState`'s return value only; no `main()`-level assertion | **YES** | **high** | Local |
| 13 | **AC-4.1 row 8** | `local-edit`/`unverified` ⇒ **proceed, rows named in the run report** | `orchestrate-queue.js:1077-1082` decides correctly; same discard at `main():539-549` | same — node-output assertions only | **YES** | **high** | Local |
| 14 | **AC-4.3** | Queue "skips state evaluation **and notes the skip**" | shell writer half delivered (`lib/pdlc-drift.sh:839` `pdlc_resolve_check_enabled`); queue-side *notice* not delivered | `driftBaseline.test.js` covers the writer half; nothing covers the notice | **YES** | **high** | Local |
| 15 | AC-4.1 rows 1,3–7,9,10 | Blocking precedence table | `orchestrate-queue.js:1011-1099` | `queueDriftGate.test.js` (10 rows + exception-set equality); `main()` wiring mutation-verified (`if (false)` reds the gate-placement case) | No | — | — |
| 16 | AC-4.1 (one-read rule) | Exactly one injected read, before any queue read | `orchestrate-queue.js:537` (`await`ed) | `queueDriftGate.test.js` "§12.4 gate placement" | No | — | — |
| 17 | §12.3 | Throwing / `null` / non-object read ⇒ row-1 `blocked` **report**, never an abort | `orchestrate-queue.js:1121-1127`, `:1016-1020` | `queueDriftGate.test.js` three-way injection table | No | — | — |
| 18 | AC-5.1 | `artifactVersion` per row + top-level `pluginVersion` from `plugin.json` | `build-runtime.mjs:180,216,230` | `runtimeBundle.test.js` (freshness only — see DOD-03) | No | — | — |
| 19 | AC-5.2 | No version field on any module/bundle `meta`; **no semver comparator in the diff** | verified by inspection — bundles export `meta` only, one `export` each | `runtimeBundle.test.js:55-63` | No | — | — |
| 20 | AC-5.4 | `pluginVersion` never an input to a state decision | grep: no read of `pluginVersion` in any decision path | — | No | — | — |
| 21 | AC-5.3 | *Rendered* version lines in the report | not implemented — declared residual **R-12**, routed in PLAN §7 to a follow-up REQ / `consolidate-learnings` | n/a | No (declared) | — | — |
| 22 | AC-6.1 / AC-6.2 | `dist/` is the sole output dir; packaging oracle | `build-runtime.mjs`, `document-oracles.mjs:246` | `documentOracles.test.js` (incl. the CR G-01 totality fuzz) | No | — | — |
| 23 | AC-6.2a | Published package really carries `workflows/dist/` | `pdlc/RELEASE-CHECKLIST.md` §1 (manual gate) | **none** | **YES** | low | Local — DOD-08 |
| 24 | AC-6.6 | Advertised-version oracle, skip-loudly | `document-oracles.mjs:573-617` | `documentOracles.test.js` | No | — | — |
| 25 | AC-6.5 | Two-command fresh-clone bootstrap | `CLAUDE.md`, `pdlc/README.md`; scripts `100755` | `bootstrap.test.js` AT-24 (7 assertions incl. bare-path/126 and `$HOME` non-write) | No | — | — |
| 26 | REQ §6 / D-1,D-2,D-3 | Document corrections in CLAUDE.md + pdlc/README.md | both files edited | `documentOracles.test.js:687-712` | No | — | — |
| 27 | FSPEC §7.5 exemption (i),(ii),(iv) | Generated trees / feature-docs / `__tests__` | `document-oracles.mjs:99-122` | `documentOracles.test.js` FIXTURE_ROOT 7-path expectation | No | — | — |
| 28 | **FSPEC §7.5 exemption (iii)** | Any `distribution-manifest.json` | `document-oracles.mjs:114-117` | **no falsifying test** (mutation survives) | **YES** | medium | Local — DOD-04 |
| 29 | NFR-5 / bash 3.2 | POSIX-ish bash 3.2, no bash-4 constructs | all three shells | executed under `bash 3.2.57` | No | — | — |
| 30 | PLAN §9 "zero unexpected skips" | Mechanical `REGISTERED_SKIPS` ⊆ inventory comparator | `driftCapabilities.js:92,131` exports exist | **no consumer** | **YES** | high | Local — DOD-02 |

## §3 Integration-Boundary Notes (criterion 6)

**Adjacent surfaces falsified:** DOD-05 (CLAUDE.md's `--check` row contradicts FSPEC §5.4 and
measured behaviour), DOD-06 (three operator docs silent on the new blocking queue phase), DOD-07
(`QUEUE.md` table vs. its own prose). `boundary_gaps = 3`.

**Sibling sweep — clean.** The `.claude/workflows/` disclosure family was swept: no line in
`CLAUDE.md`, `pdlc/README.md`, or either orchestrator `SKILL.md` still describes a hand copy, and
`coveredViolations(LIVE_ROOT) == []` proves it over the whole tree. Both bundle rows are handled,
not just one. `retired` in the manifest is the union of the rows' `retires`, asserted by
`packagingViolations` clause 6.2(c).

**Deferral binding — satisfied.** D-DIST-01/02/03/05 → `QUEUE.md` row 6 (`pdlc-install-mechanism`);
D-DIST-06 → row 7 (`pdlc-release-ci`); D-DIST-07 (per-worktree consumer state, cited in both
`CLAUDE.md:100` and `pdlc/README.md:96`) → row 6. R-12 (AC-5.3's rendered version lines) is routed
in PLAN §7. Rows 6 and 7 are `blocked` and their REQ files do not yet exist — `QUEUE.md` says so
explicitly, and criterion 6(b) is satisfied by the queue row itself, so this is recorded as
context, not a finding.

**Re-measured derivations.** The manifest's `pluginSha1` values and `pluginVersion: "0.11.0"` were
re-measured against the branch tip via `build-runtime.mjs --check` (exit 0). The
`FALSIFICATION-LEDGER.md` property set was re-counted at 63/63 against the test tree.

## Notes for the remediator

Ordering hint — DOD-01, DOD-02 and DOD-03 are independent; DOD-01 is the only one that changes
shipped behaviour and should be done first.

- **DOD-01** is a four-line change in `main()` plus one new `main()`-level test per proceeding row.
  Do not "fix" it by asserting harder on `mapDriftState` — the whole point of the finding is that
  the node-output assertions already pass.
- **DOD-03** needs a temp-root harness (copy `pdlc/` + `dist/` to a tmpdir, perturb, run `--check`
  there). Do **not** perturb the real `pdlc/workflows/dist/`.
- **DOD-04** requires editing the `covered-violations` fixture and the "exactly 7 paths"
  expectation together; per FSPEC §7.5 the patterns must **not** be narrowed and `EXEMPTIONS` must
  **not** be widened.
- The shell layer (C1/C2/C3) came through this review clean: the one mutation applied to it
  (`--force` eligibility for `unverified`) was caught by 3 tests in 2 suites. `sync-workflows.sh`
  restored to `f1011454d5e1134272bf487d8cbe2f068ecf6bfa`, `orchestrate-queue.js` to
  `78cb3797a51158ae8d77039ab4d003cf768ad52b`, `build-runtime.mjs` to
  `a03c5dad7887729f3f97268b1b819d0ba439afe3`, `lib/document-oracles.mjs` to
  `99e9956483f99968c37c0d314d8e5dde160f5452`; `lib/pdlc-drift.sh` untouched throughout at
  `604199b7758da8a4e09356ec65ad8442a4387e3f`. Working tree clean apart from this file.
