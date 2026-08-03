<!--
  Fixture excerpted verbatim (long table cells truncated to keep the file small —
  truncation touches description-style cells only, never an id, dependency or
  batch cell) from:
    docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md
  The eight per-batch task tables (61 tasks in total), one interleaved
  non-task table, and two disposition tables the pre-fix parser swallowed.
-->

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 35-40 — PM disposition table — id column, no dependencies column -->

| ID | Disposition |
| --- | --- |
| **PM F-01** |   Fixed — Phase 7 resequenced.   Order is now  L-02 → L … |
| **TE F-01** |   Fixed — AT-7's  driftClassify.test.js  half is T-22's … |
| **TE F-02** |   Fixed — the mutation-pair prose is replaced by §3.1's … |
| **TE F-03** |   Fixed — honestly, on both legs.   The false claim ("e … |

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 158-166 — cross-review disposition table — id column, no dependencies column -->

| ID | Sev | Disposition |
| --- | --- | --- |
| **G-01** | M |   Fixed, with a detector — see the G-01 row in the roun … |
| **G-02** | M |   Fixed, with a detector — see the G-02 row in the dete … |
| **G-03** | M |   Fixed.   The two C1-availability gate messages are no … |
| **G-04** | L |   Fixed   — see the SE F-15 row above; corrected at all … |
| **G-05** | L |   Fixed, with detectors — see the G-05 row in the round … |
| **G-06** | L |   Fixed   — a comment at the  eval "declare -a ${ pdlc … |
| **G-07** | Process | **Fixed by this section.** |

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 257-259 — task table, batch 1 -->

| # | Task | Test File | Source File | Batch | Deps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| P0-00 |   Pre-flight gate (must be the first task).   Assert at … | *(gate — no test file)* | *(gate — no source file)* | 1 | — | ✅ |

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 265-273 — task table, batches 2-5 -->

| # | Task | Test File | Source File | Batch | Deps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| T-01 |   RED   Author the helper-contract suite.   (a) Capabil … | `__tests__/driftHelpers.test.js` | — | 2 | P0-00 | ✅ |
| T-02 |   RED   Author  documentOracles.test.js  in full: AT-19 … | `__tests__/documentOracles.test.js` | — | 2 | P0-00 | ✅ |
| T-03 |   RED   Author  driftRecordShape.test.js : the   sixtee … | `__tests__/driftRecordShape.test.js` | — | 2 | P0-00 | ✅ |
| T-04 |   RED   Author  queueDriftGate.test.js 's   pure   half … | `__tests__/queueDriftGate.test.js` | — | 2 | P0-00 | ✅ |
| T-05 |   RED   Repoint  runtimeBundle.test.js  at  pdlc/workfl … | `__tests__/runtimeBundle.test.js` | — | 2 | P0-00 | ✅ |
| T-06 |   RED   Author  bootstrap.test.js : AT-24's   seven   a … | `__tests__/bootstrap.test.js` | — | 2 | P0-00 | ✅ |
| T-19 |   RED   Append to the existing  hookCompatibility.test. … | `__tests__/hookCompatibility.test.js` | — | 2 | P0-00 | ✅ |

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 279-294 — task table, batches 6-10 -->

| # | Task | Test File | Source File | Batch | Deps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| T-07 |   Fake first   Implement the capability helpers:  descr … | `__tests__/driftHelpers.test.js` | `__tests__/helpers/driftCapabilities.js` | 3 | T-01 | ✅ |
| T-08a |   Fake first   Implement the harness core:  runScript(e … | `__tests__/driftHelpers.test.js` | `__tests__/helpers/driftHarness.js` | 3 | T-01 | ✅ |
| T-09 |   Fake first   Implement  document-oracles.mjs  —   pro … | `__tests__/documentOracles.test.js` | `pdlc/workflows/lib/document-oracles.mjs` | 3 | T-02 | ✅ |
| T-10 |   Fake first   Create the   checked-in   fixture tree o … | `__tests__/documentOracles.test.js` | `__tests__/fixtures/covered-violations/**` (12 files) | 3 | T-02 | ✅ |
| T-14 |   Fake first     C5   — retarget and manifest emission … |    tests  /runtimeBundle.test.js ,    tests  /documentO … |  pdlc/workflows/build-runtime.mjs ,  pdlc/workflows/dis … | 3 | T-05 | ✅ |
| T-08b |   Fake first   Extend the harness with the message laye … | `__tests__/driftHelpers.test.js` | `__tests__/helpers/driftHarness.js` | 4 | T-08a | ✅ |
| T-15 |   Fake first   Implement the fixture builders:  makeCon … |    tests  /driftHelpers.test.js  (T-01 clause (b) — eve … | `__tests__/helpers/driftFixtures.js` | 4 | T-01, T-08a | ✅ |
| T-16 |   Fake first   Implement the trace/ordering helpers: th … |    tests  /driftHelpers.test.js  (T-01 clause (c) — cod … | `__tests__/helpers/driftOrdering.js` | 4 | T-01, T-08a | ✅ |
| T-17 |   Fake first   Implement  makeFreshClone()  — TSPEC §9. … | `__tests__/bootstrap.test.js` | `__tests__/helpers/freshClone.js` | 4 | T-06, T-08a | ✅ |
| T-18 |   Fake first   Implement the batched grammar driver  ba … | `__tests__/driftHelpers.test.js` (T-01 clause (d)) | `__tests__/helpers/bin/backup-grammar.sh` | 4 | T-01, T-08a | ✅ |
| T-39 |   Fake first     Sourced-probe driver   —  bin/lib-prob … |  err TAB <reason> ), plus a  dump TAB <varName>  form f … | `__tests__/driftHelpers.test.js` (T-01 clause (d)) |    tests  /helpers/bin/lib-probe.sh ,    tests  /helper … | 4 | T-01, T-08a | ✅ |
| T-11 |   Fake first     C6 (1/3)   — export  validateDriftReco … | `__tests__/driftRecordShape.test.js` |  pdlc/workflows/orchestrate-queue.js ,  pdlc/workflows/ … | 4 | T-03, T-14 | ✅ |
| T-12 |   Fake first     C6 (2/3)   — export  mapDriftState(rec … | `__tests__/queueDriftGate.test.js` |  pdlc/workflows/orchestrate-queue.js ,  pdlc/workflows/ … | 5 | T-04, T-11 | ✅ |
| T-13 |   Fake first     C6 (3/3) — O-19(d) and the gate wiring … | `__tests__/queueDriftGate.test.js` |  pdlc/workflows/orchestrate-queue.js ,  pdlc/workflows/ … | 6 | T-04, T-12 | ✅ |

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 303-315 — task table, batches 11-13 -->

| # | Task | Test File | Source File | Batch | Deps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| T-20 |   RED   Repo-root suite: AT-2, AT-33, §8.2's five fixtu … | `__tests__/driftRepoRoot.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ✅ |
| T-21 |   RED   Baseline suite: AT-3 (incl. v2.1's  expectRemed … | `__tests__/driftBaseline.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ✅ |
| T-22 |   RED   Classify suite: AT-1, AT-6,   AT-7's  driftClas … | `__tests__/driftClassify.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ✅ |
| T-23 |   RED   Sync suite: AT-8a, AT-8b, AT-9, AT-10, AT-12, A … | `__tests__/driftSync.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ✅ |
| T-24 |   RED   Hook suite: AT-5(a)/(b), AT-11, AT-32(b), §14.1 … | `__tests__/driftHook.test.js` | — | 5 | T-08b, T-15, T-16 | ✅ |
| T-25 |   RED   Ladder suite: AT-14 (§6.5's five assertions on … | `__tests__/driftLadder.test.js` | — | 5 | T-08b, T-15, T-16 | ✅ |
| T-26 |   RED   Write-failure suite: AT-17 (drift-state line … | `__tests__/driftWriteFailure.test.js` | — | 5 | T-08b, T-15, T-16 | ✅ |
| T-27 |   RED   Fault-seam suite: AT-18a ( countOf(stderr,"N-7" … | `__tests__/driftFault.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ✅ |
| T-28 |   RED   Message suite: AT-30's pairwise  distinct()  ov … | `__tests__/driftMessages.test.js` | — | 5 | T-08b, T-15, T-16, T-39 | ✅ |
| T-29 |   RED   Ordering suite: §4.3's four conjuncts as the AC … | `__tests__/driftOrdering.test.js` | — | 5 | T-08b, T-15, T-16 | ✅ |
| T-30 |   RED   Backup suite: §11.3 row 4's retention binding ( … | `__tests__/driftBackups.test.js` | — | 5 | T-08b, T-15, T-16 | ✅ |

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 332-338 — layer/batch summary — not a task table -->

| Layer | Batch | Sourced-observable green in that batch | Still red until batch 11 |
| --- | --- | --- | --- |
| T-31 primitives | 6 |  backup-grammar.sh  grammar cases; T-27's probe cases ( … | N-7   on stderr of a run  , trace-file production by a … |
| T-32 resolution/baseline | 7 | T-20's and T-21's probe cases ( pdlc resolve repo root … | W-1 on stderr,  --check  exit   3  , §8.3's  expectRepo … |
| T-33 classifier | 8 | T-22's probe cases (six-state ladder, four  unknown  re … |  --check  exit 2, the on-disk record, AT-7's exit conju … |
| T-34 writers/ladder/backups | 9 | T-23's probe cases (writer routine, copy, backup→verify … | exit 4, fail-open stderr, `expectFailOpen` |
| T-35 messages | 10 | T-28's AT-30 batched-driver rendering and the  syncComm … | M-1/M-2/M-3's per-run stderr routing |

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 345-351 — task table, batch 14 -->

| # | Task | Test File | Source File | Batch | Deps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| T-31 |   C1 layer 1 — seams and primitives.   The   idempotent … | \ | true );  pdlc probe json tool ,  pdlc json read  (0/10/ … |    tests  /driftFault.test.js ,  driftOrdering.test.js … | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | 6 | T-18, T-25, T-27, T-29, T-30 |   DISCOVERED BLOCKER (flagged for follow-up, not fixed … |  | true  fails silently — so   every    lib-probe.sh -driv … | ✅ |
| T-32 |   C1 layer 2 — resolution and baseline.    pdlc resolve … |    tests  /driftRepoRoot.test.js ,  driftBaseline.test. … | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | 7 | T-20, T-21, T-31 | ✅ |
| T-33 |   C1 layer 3 — the classifier.    pdlc classify row <ph … | `__tests__/driftClassify.test.js` | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | 8 | T-22, T-32 | ✅ |
| T-34 |   C1 layer 4 — writers, the ladder and backups.   The … |    tests  /driftSync.test.js ,  driftWriteFailure.test. … | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | 9 | T-23, T-25, T-26, T-30, T-33 | ✅ |
| T-35 |   C1 layer 5 — the message catalogue.    pdlc msg    em … |    tests  /driftMessages.test.js ,  driftHook.test.js , … | `pdlc/hooks/scripts/lib/pdlc-drift.sh` | 10 | T-24, T-28, T-34 | ✅ |

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 355-358 — task table, batch 15 -->

| # | Task | Test File | Source File | Batch | Deps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| T-36 |   C2 —  check-workflow-drift.sh    (SessionStart hook). … |    tests  /driftHook.test.js ,  driftFault.test.js ,  d … | `pdlc/hooks/scripts/check-workflow-drift.sh` | 11 | T-19, T-24, T-35 | ✅ |
| T-37 |   C3 —  sync-workflows.sh    ( --check , sync,  --force … |    tests  /driftSync.test.js ,  driftBaseline.test.js , … | `pdlc/hooks/scripts/sync-workflows.sh` | 11 | T-21, T-23, T-35 | ✅ |

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 369-382 — task table, batches 16-19 -->

| # | Task | Test File | Source File | Batch | Deps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| T-38 | Append the   fixture-backed   queue cases to  queueDrif … | `__tests__/queueDriftGate.test.js` | — | 12 | T-04, T-13, T-36, T-37 | ✅ |
| T-40 |   Fake first   Implement the generator library (PROPERT … | *(consumed by every property task below)* |    tests  /helpers/driftGenerators.js ,  docs/…/FALSIFI … | 7 | T-15, T-31 | ✅ |
| T-41 | Classifier properties: PROP-CLS-01…08, PROP-RSN-01…06, … | `__tests__/driftClassify.test.js` | — | 12 | T-22, T-33, T-36, T-37, T-40 | ✅ |
| T-42 | Baseline properties: PROP-BSL-01, -02, -03, -04, -08; P … | `__tests__/driftBaseline.test.js` | — | 12 | T-21, T-32, T-37, T-40 | ✅ |
| T-43 | Ordering/trace properties: PROP-BSL-07, PROP-CLS-04's t … | `__tests__/driftOrdering.test.js` | — | 12 | T-16, T-29, T-37, T-40 | ✅ |
| T-44 | Sync/measurement-time properties: PROP-MTM-01, -03, -04 … | `__tests__/driftSync.test.js` | — | 12 | T-23, T-34, T-37, T-40 | ✅ |
| T-45 | Hook properties: PROP-MTM-02's hook half, PROP-MTM-04's … | `__tests__/driftHook.test.js` | — | 12 | T-24, T-36, T-40 | ✅ |
| T-46 | Write-failure properties: PROP-NEG-03's converse half — … | `__tests__/driftWriteFailure.test.js` | — | 12 | T-26, T-34, T-37, T-40 | ✅ |
| T-47 | Repo-root properties: PROP-BSL-06, PROP-NEG-02 (nothing … | `__tests__/driftRepoRoot.test.js` | — | 12 | T-20, T-32, T-36, T-40 | ✅ |
| T-48 | Seam-closure properties: PROP-SEAM-01 (recognition == e … | `__tests__/driftFault.test.js` | — | 12 | T-27, T-31, T-36, T-37, T-40 | ✅ |
| T-49 | Backup-grammar properties: PROP-BKP-01…13, all through … | `__tests__/driftBackups.test.js` | — | 12 | T-18, T-30, T-34, T-37, T-40 | ✅ |
| T-50 | Queue-side properties: PROP-MTM-05's queue half, PROP-N … | `__tests__/queueDriftGate.test.js` | `docs/…/FALSIFICATION-LEDGER.md` | 13 | T-38, T-40, T-41, T-42, T-43, T-44, T-45, T-46, T-47, T … | ✅ |

<!-- docs/completed/pdlc-workflow-distribution/PLAN-pdlc-workflow-distribution.md lines 423-433 — task table, batches 20-22 -->

| # | Task | Test File | Source File | Batch | Deps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| L-02 |    .worktreeinclude    (§7.5 item 7, OQ-3 Option B) at … | *(no automated test — FSPEC §11.1)* | `.worktreeinclude` | 14 | T-05, T-38, T-41, T-42, T-43, T-44, T-45, T-46, T-47, T … | ✅ |
| L-03 |   Execute bits on five scripts   (§7.5 item 4, REQ §0 f … | `__tests__/bootstrap.test.js` (§9.3) |  pdlc/hooks/scripts/ .sh   (mode only for the three sib … | 15 | L-02 | ✅ |
| L-04 |    hooks.json  second  SessionStart  entry   (§7.5 item … | `__tests__/hookCompatibility.test.js` | `pdlc/hooks/hooks.json` | 16 | L-03 | ✅ |
| L-07 |   Create  pdlc/RELEASE-CHECKLIST.md    (TSPEC §2.1a, §1 … | `__tests__/documentOracles.test.js` (AT-22, via L-06) | `pdlc/RELEASE-CHECKLIST.md` | 17 | L-04 | ✅ |
| L-08 |   Bootstrap and worktree documentation   (§7.5 items 6 … |    tests  /bootstrap.test.js  (AC-6.5 sequence),  docum … | `CLAUDE.md`, `pdlc/README.md` | 18 | L-07 | ✅ |
| L-06 |   Document corrections and the  dist/  path sweep   (§7 … |    tests  /documentOracles.test.js  (AT-22),  runtimeBu … | the 7 files of §6.2; the §6.3 files;  pdlc/workflows/di … | 19 | T-09, L-08 | ✅ |
| L-01 |   Untrack and anchor   (§7.5 item 1) — the   last state … |    tests  /documentOracles.test.js  (tracked-ness guard … | `.gitignore`, *(index only)* `.claude/workflows/**` | 20 | L-06 | ✅ |
| L-05 |   Version bump and final build   (§7.5 item 2, AC-6.6). … |    tests  /documentOracles.test.js  (§10.3),  runtimeBu … |  pdlc/.claude-plugin/plugin.json ,  pdlc/workflows/dist … | 21 | L-01 | ✅ |
| L-09 |   Landing verification, then the single landing commit. … | *(whole suite)* | *(verification + the landing commit)* | 22 | L-05 | ✅ |
