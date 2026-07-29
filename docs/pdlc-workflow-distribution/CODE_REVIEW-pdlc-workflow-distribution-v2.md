# CODE REVIEW — pdlc-workflow-distribution (v2)

Scope: Local + Cross-Feature — a **delta re-verification** of the ten v1 findings at source, plus a
fresh scan of the remediation diff `ec94a31..ded17d8`. Surfaces touched by that diff:
`pdlc/workflows/orchestrate-queue.js`, `pdlc/workflows/lib/document-oracles.mjs`,
`pdlc/workflows/__tests__/{queueDriftGate,runtimeBundle,documentOracles,driftHelpers}.test.js`,
`pdlc/workflows/__tests__/helpers/{driftCapabilities,skipSink,skipSinkSetup,skipSinkTeardown}.js`,
`pdlc/workflows/__tests__/fixtures/covered-violations/docs/design/distribution-manifest.json`,
`pdlc/workflows/package.json`, `pdlc/.claude-plugin/plugin.json`, `pdlc/workflows/dist/**`,
`CLAUDE.md`, `pdlc/README.md`, `pdlc/skills/orchestrate-queue/SKILL.md`,
`PLAN-pdlc-workflow-distribution.md`, `docs/_queue/QUEUE.md`.

| Field | Detail |
|---|---|
| Feature | pdlc-workflow-distribution |
| Branch | feat-pdlc-workflow-distribution (`ded17d8`) |
| Review version | 2 |
| Date | 2026-07-29 |
| Verdict | **Findings** (0 high / 1 medium / 2 low) |
| Branch coverage (lowest new module) | **39.13%** (`build-runtime.mjs`); next lowest **74.28%** (`__tests__/helpers/skipSink.js`) |
| Requirements traced | 30/30 (all six v1 gaps closed) |

## Measurements taken (run, not read)

| Command / probe | Result |
|---|---|
| `cd pdlc/workflows && npm test` | **35/35 suites, 1022 passed, 70 skipped, 0 failed**, 180 s, `globalTeardown` clean, **exit 0** |
| `npm test -- --coverage` | same counts; branch: `orchestrate-queue.js` **86.83%**, `document-oracles.mjs` **85.12%**, `skipSink.js` **74.28%**, `build-runtime.mjs` **39.13%** |
| `node pdlc/workflows/build-runtime.mjs --check` | exit **0**, 3 rows in-sync |
| `pdlc/hooks/scripts/sync-workflows.sh --check` | exit **0**, **zero bytes** on stdout+stderr (this tree is now bootstrapped; both rows `in-sync`) |
| drift-state mtime across that `--check` | `1785353224 → 1785353690`, body `"generatedBy": "check"` — **`--check` does write**, confirming DOD-05's corrected CLAUDE.md row |
| `pdlc/hooks/scripts/check-workflow-drift.sh` | exit 0, silent (tree in sync) |
| `coveredViolations` / `packagingViolations` / `advertisedVersionViolation` at LIVE_ROOT | `[]` / `[]` / `{skipped: "AC-6.6 inert: … no change under pdlc/workflows/dist/ …"}` (≠ `"red"`) |
| `EXEMPTIONS` | length **4**, `Object.isFrozen` **true**, clause order unchanged (TE F-10 respected) |
| `S_*` exports in `document-oracles.mjs` | **5** (`S_GIT_ABSENT`, `S_NO_GIT_DIR`, `S_UNBORN_HEAD`, `S_PLUGIN_JSON_UNREADABLE`, `S_NOTHING_STAGED`) |
| distinct AT ids in `__tests__` | 45 raw labels; **40** under PLAN §9's counting convention (36 base + net 1 each for 8a/8b, 14b, 18a/18b, 32(a)/32(b)); `AT-5(a)/(b)` and `AT-31(a)/(b)` are sub-parts, per §9's own text |
| `AT-32(a)` / `AT-32(b)` | both real blocks — `driftClassify.test.js:367`, `driftHook.test.js:231` |
| `plugin.json` / `dist/distribution-manifest.json` | both **0.12.0**; every row's `artifactVersion` **0.12.0** |
| capability skips this run | **zero** — no `describeOrSkip`/`itOrSkip` skip line in the full log; all 70 skips remain `guardMatrix.test.js`'s `it.skip.each` (uid 501 ≠ 0) |
| skip-sink transport probe (direct, out of jest) | `appendSkipRecord` returns `false` with no env, `true` with env; `readSkipRecords` round-trips the record — the transport **works**, it is simply never exercised by any test |

### Mutations applied (all reverted, `shasum` before == after, `git status --porcelain` empty)

| # | Subject | Mutation | Red observed |
|---|---|---|---|
| M1 | `orchestrate-queue.js:565` | `driftNotice = null` (drop the proceeding notice) | `queueDriftGate.test.js` **5 red** — DOD-01(a)…(e) |
| M1b | `orchestrate-queue.js:565` | `driftNotice = driftGate.report` (report even on row 9) | `queueDriftGate.test.js` **1 red** — DOD-01(f) |
| M2 | `build-runtime.mjs:204,242` | both `stale = true` → `stale = false` | `runtimeBundle.test.js` **4 red** |
| M2b | `build-runtime.mjs:242` only | manifest branch neutralised alone | `runtimeBundle.test.js` **3 red** — the manifest branch is independently bound |
| M3 | `document-oracles.mjs:115` | `isDistributionManifest` → `return false` | `documentOracles.test.js` **3 red** (incl. AT-23's "exactly 7 paths") |
| M4 | `driftCapabilities.js` `SKIP_INVENTORY` | duplicate an entry name | run **fails from `globalTeardown`**: `skip-inventory comparator failed (1 violation(s)) … duplicate entry name`, **`npm test` exit 1** |
| M5 | `pdlc/RELEASE-CHECKLIST.md` | file removed | `documentOracles.test.js` **1 red** — the DOD-08 oracle |

Restored hashes: `orchestrate-queue.js` `1eee5909…`, `build-runtime.mjs` `a03c5dad…`,
`lib/document-oracles.mjs` `47ccaa77…`, `__tests__/helpers/driftCapabilities.js` `64e07515…`,
`pdlc/RELEASE-CHECKLIST.md` `03c82bc4…`. Working tree clean apart from this file.

## §1 Re-verification of the v1 findings

| v1 # | Sev | Verdict | Evidence |
|---|---|---|---|
| **DOD-01** | high | **Fixed — mutation-verified** | `orchestrate-queue.js:551-571` captures the notice once and routes **every** remaining exit path (incl. `runPicked`'s two) through the injected `finish` funnel; `grep` confirms only the row-1 `blocked` return still calls `buildQueueReport` directly, and it passes `driftReport` itself (`:547`). Six new `main()`-level cases assert the **returned `QueueReport`** for rows 2 and 8 across the `idle` / `ran` / `halted` / `no-queue` exits, plus a negative case pinning row 9's silence. M1 reds 5, M1b reds the 6th — the oracle binds in both directions. |
| **DOD-02** | high | **Fixed — mutation-verified** (with a residual, see DOD-11) | The comparator now exists and is run-wide: `helpers/skipSink.js` `validateSkipRecords()` (C1 structural / C2 inventory agreement / C3 inventory well-formedness), fed by a JSONL sink whose path `globalSetup` publishes, evaluated once in `globalTeardown`. M4 proves it **fails the run** (`npm test` exit 1), so it is not a vacuous export. Eleven unit cases in `driftHelpers.test.js` exercise each clause in both directions. PLAN §9 and T-07's row were rewritten to describe what is actually enforced, and to state that closure is deliberately **not** enforced and why. |
| **DOD-03** | high | **Fixed — mutation-verified** | `runtimeBundle.test.js:104-230` builds a throwaway tmpdir tree, runs the real builder there, perturbs artifacts, and asserts non-zero exit plus a `STALE` row naming each. M2 reds 4; M2b shows the **new** manifest-staleness branch reds independently of the bundle branch. The real `pdlc/workflows/dist/` is never written. (Coverage instrumentation still cannot see it — see DOD-13.) |
| **DOD-04** | medium | **Fixed — mutation-verified** | New fixture `__tests__/fixtures/covered-violations/docs/design/distribution-manifest.json` sits outside both generated trees, outside any REQ-bearing `docs/<X>/`, outside `__tests__`, and carries the covered pattern `"managed manually"` — so clause (iii) is the only exemption that can excuse it. M3 reds 3 tests. Patterns unchanged and `EXEMPTIONS` still the frozen four (verified at runtime), so R-10 and TE F-10 are both respected. |
| **DOD-05** | medium | **Fixed — measured** | CLAUDE.md's `sync-workflows.sh` row now states that `--check` classifies without copying, **writes** the drift-state record, warns only on `unverified`/`local-edit`/write-failure/degraded-baseline rows, and signals `stale`/`missing` through the exit code alone. The write half is re-measured above (mtime advanced, `generatedBy: "check"`). The "prints nothing" half was measured in v1 on an unbootstrapped tree; **this tree is now in-sync**, so I could only re-confirm silence in the all-clear case, not in the `stale`/`missing` case — stated plainly rather than inferred. |
| **DOD-06** | medium | **Fixed, with a gap — see DOD-12** | The drift gate and `distribution.checkEnabled` are now documented in all three places: `CLAUDE.md` (queue bullet), `pdlc/README.md:42-50`, and a new "Drift gate" section plus selection step 0 in `orchestrate-queue/SKILL.md`. The `Drift gate row N: …` reason string matches `orchestrate-queue.js:545` verbatim. The SKILL's blocking-cause enumeration is incomplete (DOD-12). |
| **DOD-07** | low | **Fixed** | `docs/_queue/QUEUE.md:14` reads `in-progress`, and the prose was rewritten to describe both halts as resolved history; the "Land row 8 before setting this row back to `pending`" instruction became "Row 8's harness fixes remain the recommended precondition for further Phase F attempts". Row 8's own paragraph was reconciled the same way. No self-contradiction remains. |
| **DOD-08** | low | **Fixed — mutation-verified** | `documentOracles.test.js:752-770` asserts `pdlc/RELEASE-CHECKLIST.md` exists and carries headings matching `AC-6.2a`, `AC-6.6`, `NFR-2`. M5 (file removed) reds exactly that case; the three headings exist at `:17`, `:84`, `:119`. |
| **DOD-09** | low | **Fixed — verified at source** | `document-oracles.mjs:17-22` now names all five `S_*` constants; runtime probe confirms exactly five exports. PLAN T-09's row was corrected to the same five. |
| **DOD-10** | low | **Fixed — verified at source** | PLAN §9 now says **40** and enumerates `AT-32(a)/32(b)`; both ship as real blocks. The count is arithmetically consistent with §9's own splitting convention (see the measurement table). |

**All ten v1 findings confirmed fixed.** Seven of the ten were confirmed by mutation rather than by
reading the diff.

## §2 New findings in the remediation diff

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| **DOD-11** | Coverage gap / non-falsifiable wiring | **medium** | `pdlc/workflows/__tests__/helpers/skipSink.js:57-96` | The remediation for a **high** finding rests on a transport that no test touches and no run exercises. Measured branch coverage of `skipSink.js` is **74.28%** (stmts 62.12%), below the 85% floor; the uncovered region is exactly lines **58-95** — `skipSinkPath()`, `appendSkipRecord()`, `readSkipRecords()`. `grep` confirms the only importer outside the helper pair is `driftHelpers.test.js`, and it imports **only** the pure `validateSkipRecords`. Nothing asserts a record written by `appendSkipRecord` is readable by `readSkipRecords`, that a missing env var is handled, or that a malformed line surfaces as a violation. At runtime the path is dormant too: on any non-root runner no `describeOrSkip`/`itOrSkip` skip fires (measured — **zero** capability-skip lines in the 1022-test run), so C1 and C2 evaluate over an empty record set every run. `appendSkipRecord` also swallows every error by design (`catch { return false }`). Consequence: if the sink write or read broke, the run would stay green and C1/C2 would silently become vacuous — the exact broken-oracle class DOD-02 was raised about. Only C3 (which reads `SKIP_INVENTORY` directly) is genuinely load-bearing today, and M4 exercised C3 alone. | Add a round-trip test for the transport: set `PDLC_SKIP_SINK` to a tmp file, call `appendSkipRecord`, read back with `readSkipRecords`, assert the record survives verbatim; plus the no-env branch (`skipSinkPath() === null`, `appendSkipRecord(...) === false`) and the malformed-line branch (`malformedLines` non-empty). Optionally register a synthetic skip through the real `registerSkip` path so C1/C2 have at least one live record on every runner. Bring `skipSink.js` to ≥85% branch. | Local |
| **DOD-12** | Adjacent-surface / doc accuracy | low | `pdlc/skills/orchestrate-queue/SKILL.md` — "Drift gate" section, **Blocking** bullet | The new operator doc enumerates the blocking causes as "the drift record missing/unreadable, a recorded write failure, an unresolved baseline, or any managed row still `missing`, `stale`, or `unknown`" — **rows 1, 3, 4, 5, 6**. It omits **row 7** (`retiredPresent` non-empty — `orchestrate-queue.js:1100-1104`, blocks even when every row is `in-sync`) and **row 10** (shape-valid but matching no row 1-9, `:1124-1127`). The sentence carries no "e.g." hedge, so an operator who hits `Drift gate row 7: retired artifact present: …` finds their reason absent from the list that claims to describe the blocking set. (CLAUDE.md's parallel list *is* hedged with "e.g." and is therefore not falsified.) The operator remedy given — plain `sync-workflows.sh` — does in fact clear row 7 (C3 retires resolved predecessors), so the guidance is right; only the enumeration is short. | Add rows 7 and 10 to the SKILL's blocking bullet (a retired artifact still present; a drift record that matches no recognised outcome), or mark the list explicitly non-exhaustive and point at FSPEC §6.2's table as the authority. | Cross-Feature |
| **DOD-13** | Coverage gap (measurement) | low | `pdlc/workflows/build-runtime.mjs:203-208,241-246,252-253` | Branch coverage is **39.13%**, unchanged from v1 and below the 85% floor. The uncovered lines are precisely the staleness branches DOD-03 was about. They are now genuinely bound — M2/M2b red 4 and 3 tests respectively — but the DOD-03 harness spawns the builder as a **subprocess**, which istanbul does not instrument, so the number cannot move. Nothing in PLAN §9 or the test file records that the floor is knowingly unmet for this module, so the next reader sees a bare 39% against a stated 85% standard with no explanation. | Either record the instrumentation limitation explicitly (PLAN §9 / a comment beside the DOD-03 block, citing the mutation evidence), or add an in-process test that imports the comparison helper directly so the branches are attributable. No behavioural change is required — this is a bookkeeping gap, not a broken oracle. | Local |

Criteria 1-3 over the remediation diff are clean: the only production changes are
`orchestrate-queue.js`'s funnel (real logic, no stubs) and a `document-oracles.mjs` docstring. No
mock/fake data outside `__tests__/fixtures/`; no new imports left uncalled; `package.json`'s new
`globalSetup`/`globalTeardown` are both wired and demonstrably executing (M4).

## §3 Requirements Traceability (carried forward from v1; only changed rows shown in full)

Rows 1-11, 15-22, 24-27, 29 are unchanged from v1 and remain `Gap? No`. The six rows v1 marked
`YES` are re-evaluated here.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 12 | AC-4.1 row 2 | `checkEnabled:false` ⇒ proceed; **skip noted in report** | `orchestrate-queue.js:565-571` (`finish` funnel) | `queueDriftGate.test.js` DOD-01(a), (c), (e) — **mutation-verified (M1)** | No | — | — |
| 13 | AC-4.1 row 8 | `local-edit`/`unverified` ⇒ proceed, **rows named in the run report** | same funnel; row-8 mapping `:1107-1112` | `queueDriftGate.test.js` DOD-01(b), (d) — **mutation-verified (M1)** | No | — | — |
| 14 | AC-4.3 | Queue "skips state evaluation **and notes the skip**" | shell writer half `lib/pdlc-drift.sh:839`; queue-side notice `orchestrate-queue.js:565-571` | `driftBaseline.test.js` + `queueDriftGate.test.js` DOD-01(a) | No | — | — |
| 23 | AC-6.2a | Published package really carries `workflows/dist/` | `pdlc/RELEASE-CHECKLIST.md` §1 (manual gate) | `documentOracles.test.js:752` — **mutation-verified (M5)** | No | — | — |
| 28 | FSPEC §7.5 exemption (iii) | Any `distribution-manifest.json` | `document-oracles.mjs:114-117` | `documentOracles.test.js:275-296` — **mutation-verified (M3)** | No | — | — |
| 30 | PLAN §9 "zero unexpected skips" | Mechanical comparator over registered skips | `helpers/skipSink.js` + `skipSinkSetup.js` + `skipSinkTeardown.js` | `driftHelpers.test.js` (11 unit cases) + `globalTeardown` — **mutation-verified (M4)** for clause C3 | No¹ | — | — |

¹ The comparator exists, runs run-wide, and fails the run. Its C1/C2 clauses are nonetheless
dormant on a non-root runner and their transport is untested — recorded as **DOD-11** under
criterion 4 rather than as a traceability gap, since both an implementation path and a binding
test path do exist.

Row 21 (AC-5.3 rendered version lines) remains a declared residual (R-12, routed in PLAN §7) —
not a gap.

## §4 Integration-Boundary Notes (criterion 6)

**Adjacent surfaces.** The three v1 falsifications (DOD-05, DOD-06, DOD-07) are corrected and were
re-checked at source. One new one: **DOD-12** (SKILL.md's blocking enumeration omits precedence
rows 7 and 10). `boundary_gaps = 1`.

**Version-bump sweep — clean.** `plugin.json` moved `0.11.0 → 0.12.0` in the same commit as the
`dist/` byte change, and `dist/distribution-manifest.json` carries `0.12.0` at both the top level
and every row. Every other `0.11.0` occurrence in the tree is an illustrative example inside a
spec, fixture, or historical review, not a claim about the shipped version. PLAN L-05's
`0.10.0 → 0.11.0` text is a truthful record of what that batch did and is not falsified by a later
bump.

**Historical review artifacts.** `CROSS-REVIEW-test-engineer-PLAN-v2.md:26` still says "T-01
asserts membership and non-empty invariant lists", which DOD-02's remediation supersedes. Recorded
as context, not a finding: cross-review files are point-in-time process records, harvested and
deleted in Phase H, not shipped disclosures.

**Deferral binding — satisfied, unchanged.** D-DIST-01/02/03/05/07 → `QUEUE.md` row 6; D-DIST-06 →
row 7; R-12 routed in PLAN §7. The remediation introduces one new non-goal — "closure is
deliberately not enforced" (PLAN §9, `skipSink.js:37-46`) — which is declared out of scope with a
stated reason (widening a spec-derived inventory would be a spec change), not deferred to an absent
successor, so criterion 6(b) does not bite.

**Re-measured derivations.** `build-runtime.mjs --check` exit 0 and `sync-workflows.sh --check`
exit 0 against the current branch tip; the AT count and the `S_*` export count were both re-derived
mechanically rather than read.

## Notes for the remediator

- **DOD-11 is the only one that matters.** It is a test-side change in
  `pdlc/workflows/__tests__/` — no production file needs to move. Do not "fix" it by asserting
  harder on `validateSkipRecords`; that function is already well covered. The missing coverage is
  the **transport** (`appendSkipRecord` → file → `readSkipRecords`) and the `skipSinkPath()`
  null branch.
- **DOD-13 may be closed with documentation alone.** The branches are proven bound by mutation
  (M2/M2b, recorded above); what is missing is a record that the 39.13% is a subprocess-instrumentation
  artifact rather than an untested branch. Do not add an in-process duplicate of the `--check`
  logic just to move a number.
- **DOD-12 is a two-line edit** to `pdlc/skills/orchestrate-queue/SKILL.md`. Rows 7 and 10 of
  `mapDriftState` (`orchestrate-queue.js:1100`, `:1124`) are the authority.
- Do **not** touch `EXEMPTIONS` (frozen four, TE F-10), the five `coveredViolations` patterns
  (R-10), or anything under `pdlc/workflows/dist/`. If any change alters `dist/` bytes, bump
  `plugin.json` in the same commit — AC-6.6's oracle goes red otherwise.

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": true, "branch_coverage_pct": 39, "req_gaps": 0, "boundary_gaps": 1}
