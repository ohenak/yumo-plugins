---
feature: pdlc-plugin-retirement
---

# FSPEC — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.9); measured surface `docs/_constraints/pdlc-retirement-baseline.md` |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | — |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-17 |

**FSPEC-RET-01** — behavioural specification of the retirement sweep, its gates, its
pinned literals and the consumer cleanup step.

## 1. Overview

The sweep removes the workflow-runtime host's machinery from the repo while the pdlc plugin
stays installed permanently as the engine's skills carrier (REQ G-1, G-2, NG-1). This
specification fixes the *observable* behaviour of that sweep: the order its work lands in, the
gates each commit must pass, the literal values the checkable criteria compare against, what the
orchestration skills do after they stop carrying pipeline logic, and how the one-time consumer
cleanup behaves. It states no implementation contract; how each behaviour is realised is the
TSPEC's and PLAN's.

**Measured base commit for every literal in this document: `b3f24fc6`** (2026-08-17,
`feat-pdlc-plugin-retirement`). Every pinned literal in §4 is transcribed here at authoring time
and **re-transcribed at C-6 re-measurement time** against the sweep's actual base commit before
the first deletion commit; a literal that moved between the two is corrected in this FSPEC, not
worked around in a test.

### 1.1 What is in this feature's scope

| Area | Behaviour specified here |
|---|---|
| Deletion sweep | Commit classes, per-commit gate set, ordering constraints (§3.1, §4.1) |
| Pinned literals | AC-1.2's term set and its expected-empty command; AC-1.3's suite count; AC-1.7's hook-entry set; AC-3.3's skill set; AC-1.8's gate command set (§4.2) |
| Documentation | The instructional set, and what a reader must no longer be able to find (§3.3, §4.3) |
| Delegator skills | What `orchestrate-dev` / `orchestrate-queue` do when invoked after the sweep, including how an engine refusal reaches the human (§3.4, §4.4 — REQ O-2) |
| Consumer cleanup | Invocation, idempotence, refusal behaviour and exit convention (§3.5, §4.5) |
| Version handshake | Which plugin version line the sweep may ship under the published engine's declared range (§4.6 — REQ BL-07, C-10) |

### 1.2 What is *not* decided here

Per REQ O-3 and O-4, the probe CLI's surviving path (and therefore AC-1.1's branch) and the
Phase-MERGE self-modification guard paths are settled in the **TSPEC**. This FSPEC pins AC-1.3's
literals and treats the CLI's post-sweep location as "the single surviving path the TSPEC names".
Engine-side runtime capability stays with the engine's own successors (REQ NG-5), except the two
carve-outs REQ NG-5 makes explicit: the declared compatible-plugin range, and engine-side tests
and fixtures whose subject is a retired artifact.

### 1.3 State of the prerequisites at authoring time

Checked at `b3f24fc6`; each is re-checked at Phase R gate time, and BL-03/BL-07/BL-08 gate the
first deletion commit rather than this document.

| Row | State at HEAD | Evidence |
|---|---|---|
| BL-01 | satisfied | `docs/completed/pdlc-headless-engine/` present; `docs/_queue/QUEUE.md` records the row's removal on 2026-08-12 |
| BL-02 | satisfied | `docs/completed/pdlc-engine-distribution/` present; `QUEUE.md` records row 4's removal on 2026-08-16 as merged |
| BL-03 | **not satisfied** — no adoption run report is tracked at HEAD; a `grep` of `git ls-files` for a report artifact returns none. C-1's four thresholds are the operator's to judge and the reports are the operator's to capture and commit; §7 O-A carries this as the gating obligation | — |
| BL-04 | operator-judged; the guard carrier is exercised on the engine path (`pdlc/engine/lib/startup.mjs` `checkGuardCarrier`) | re-confirmed at gate time |
| BL-05 | **not satisfied** — `QUEUE.md` row 8 (`pdlc-release-ci`) is still `blocked` and still describes the retired copy channel | `docs/_queue/QUEUE.md` row 8 |
| BL-06 | pending — `docs/_decisions/DECISIONS-plugin-distribution.md` exists and is unsuperseded at HEAD | that file |
| BL-07 | **not satisfied for a minor bump** — the published engine `@kaneho/pdlc-engine@0.2.0` declares `pluginCompat: ^0.23.0` (`docs/completed/pdlc-engine-distribution/EVIDENCE-ENGINE-V0.2.0.md` §2), and the repo's `pdlc/engine/package.json:18` declares the same `^0.23.0`. The plugin is at `0.23.1` (`pdlc/.claude-plugin/plugin.json`). See BR-VER-1 | as cited |
| BL-08 | not yet captured — no pre-sweep report or gate transcript is tracked at HEAD | §7 O-B |

## 2. Linked Requirements

Every behaviour below traces to `REQ-pdlc-plugin-retirement.md` v0.9. No FSPEC section exists
without a REQ parent; no REQ acceptance criterion is left without a behavioural home.

| REQ item | Where specified here |
|---|---|
| G-1 single execution path | §3.1 commit classes; §4.1 gate rules |
| G-2 plugin keeps skills, gains delegator role | §3.4; §4.4; BR-DEL-1…4 |
| G-3 docs tell one story | §3.3; §4.3; BR-DOC-1…3 |
| G-4 guided consumer cleanup | §3.5; §4.5; BR-CLN-1…5 |
| G-5 probe CLI survives | §4.1 (class 12); §6 AT-5.3 |
| C-1 / BL-03 evidence gate | §3.0; §7 O-A |
| C-2 guard parity, hook survivors | §4.2 (L-4); BR-HOOK-1 |
| C-3 drift gate removed, not bypassed | §4.1 class 6; BR-GATE-1, BR-GATE-2 |
| C-5 per-class commits; C-7 green at every commit | §3.1; BR-SWEEP-1…4 |
| C-6 exhaustive re-measurement | §3.0; BR-SWEEP-5 |
| C-8 tests removed, never skipped | BR-SWEEP-6 |
| C-9 / NG-6 operator-invoked, conservative cleanup | §3.5; BR-CLN-3…5 |
| C-10 version handshake | §4.6; BR-VER-1…3 |
| AC-1.1 | §4.2 (L-1); AT-1.1 |
| AC-1.2 | §4.2 (L-2, L-3); AT-1.2 |
| AC-1.3 | §4.2 (L-5, L-6); AT-1.3 |
| AC-1.4 / AC-1.4b / AC-1.4c | §4.3 (L-7, L-8); AT-1.4, AT-1.4b, AT-1.4c |
| AC-1.5 | §4.1 class 8; AT-1.5 |
| AC-1.6 | §4.1 class 9; §5 E-6; AT-1.6 |
| AC-1.7 | §4.2 (L-4); AT-1.7 |
| AC-1.8 | §4.2 (L-9); AT-1.8 |
| AC-2.1 / AC-2.2 / AC-2.3 | §4.3; AT-2.1…AT-2.3 |
| AC-3.1 | §3.4; AT-3.1 |
| AC-3.2 / AC-3.5 / AC-3.6 | §4.6; AT-3.2, AT-3.5, AT-3.6 |
| AC-3.3 / AC-3.4 | §4.2 (L-10); AT-3.3, AT-3.4 |
| AC-4.1…AC-4.4 | §3.5; §4.5; AT-4.1…AT-4.4 |
| AC-5.1…AC-5.3 | §3.6; AT-5.1…AT-5.3 |
| O-1 hooks that survive | §4.2 (L-4) — **resolved here** |
| O-2 delegator shape | §3.4, §4.4 — **resolved here** |
| O-3 probe CLI home | routed to TSPEC (§1.2, §7 O-C) |
| O-4 self-modification guard paths | routed to TSPEC (§7 O-D) |
| O-5 documentation inventory | §4.3's instructional set; enumerated per file in the PLAN |
| O-6 stale operator notes | §3.3 step 5 |
| O-7 live queue row | §4.3 BR-DOC-3; AT-2.3 |

### 2.1 User-story coverage

| Story | Served by |
|---|---|
| US-01 one execution path | §3.1, §3.4, AT-5.1 |
| US-02 sync/drift apparatus gone | §3.1 classes 1–3, 6–9, AT-1.2 |
| US-03 documented consumer cleanup | §3.5, AT-4.1…AT-4.4 |
| US-04 interactive skills and nudges keep working | §4.2 (L-4, L-10), AT-3.3 |

## 3. Behavioral Flow

### 3.0 Entry gate (before any deletion commit)

1. **Prerequisite check.** Every row of REQ §2 is read at HEAD and recorded as satisfied or not.
   Any unsatisfied row stops the sweep — the flow does not start "and fix it later" (REQ §2:
   "No work starts until every row below reads satisfied").
2. **Re-measurement (C-6).** The commands in `docs/_constraints/pdlc-retirement-baseline.md`
   §*How to re-measure* are re-run at the sweep's base commit; the baseline file is updated in
   place; the partition is re-closed (every swept path in exactly one class of M-row / M-11 row /
   A-1, unclassified remainder **empty**, no path owned twice).
3. **Literal transcription.** The literals of §4.2 are re-transcribed into this FSPEC from that
   same run, each labelled with the base commit. Transcription happens once, here; downstream
   documents cite these literals rather than re-deriving them.
4. **Green start (C-7).** The gate command set of L-9 is run at the base commit and its output —
   including each suite's summary counts — is committed under BL-08 together with the pre-sweep
   engine-path run report AC-5.2 compares against. A suite that executed zero tests and exited 0
   is not a green start (REQ BL-08).

Only when steps 1–4 are complete does the first deletion commit land.

### 3.1 Commit classes and their order

Each row below is **one commit** (REQ C-5). The order is *dependents before subjects*: a
reference to an artifact is removed in the same commit as the artifact, or in an earlier one —
never a later one, because that leaves a commit asserting a file that no longer exists (C-7).

| # | Class | Covers | Ordering obligation |
|---|---|---|---|
| 1 | CI jobs | `pr-tests.yml`'s `artifact-freshness` and `fresh-clone-bootstrap` jobs and the index-mode assertions inside `script-syntax` (M-11a); `publish.yml`'s tag gate steps (M-11b); the engine's arrangement oracle over the job set and CLAUDE.md's CI section (M-11c); CLAUDE.md's `### Continuous integration` table, count word, and `pdlc/OPERATIONS.md`'s `## Continuous integration` count word and named files (M-11k, M-11l share) | First. Spans two workflow files and an oracle bound to both by set-equality — C-5 would split it and C-7 forbids the red intermediate, so **C-7 wins and the class lands whole** (REQ C-5) |
| 2 | Engine-side drift coverage | `smoke.test.js` drift-gate and `checkEnabled` cases (M-11d); `fs-observation.test.js` (M-11m); the `consumer-ac12/` fixture tree deleted with its only consumer (M-11e first disposition) | Before class 6 |
| 3 | Queue drift gate | The gate and its `distribution.checkEnabled` key in `orchestrate-queue.js` (M-11i (a)), with the gate's workflow-suite coverage | After class 2 |
| 4 | Drift hook | `check-workflow-drift.sh` (M-3) and its `SessionStart` registration in `pdlc/hooks/hooks.json` (M-11i) | After classes 1–3 |
| 5 | Drift library and sync script | `pdlc-drift.sh` (M-2), `sync-workflows.sh` (M-1) | After class 4 |
| 6 | Test corpus | M-8's 21 `*.test.js` and its six dedicated helpers, deleted (never skipped); the re-homing of assertions about **surviving** behaviour (queue triage around the gate, hook-manifest compatibility) into surviving modules; M-11p's deletions and edits, including the reduction of `helpers/driftGenerators.js` to what its surviving importers use | Re-homing lands in the **same** commit as, or earlier than, the deletion of its host file (REQ R-8) |
| 7 | Bundles and their emission | The three retired bundles (M-4, M-5, M-10) and the manifest (M-6, subject to the TSPEC's O-3 branch), and the reduction of the build step (M-7) to emitting the probe CLI only | After class 6, so no surviving test asserts over a deleted bundle |
| 8 | Ignore/worktree rows | `.worktreeinclude`'s single row and `.gitignore`'s row **with its rationale comment block** (M-11j); a file left with no remaining rows is deleted, not left empty | Any time after class 7 |
| 9 | Document oracles | The packaging and advertised-version checks over `dist/`, the drift scan's generated-tree exemptions (M-11g), the surviving `documentOracles` assertion that CLAUDE.md *contains* the two retired script names (M-11f), and the re-fixturing of the `covered-violations/` tree (M-11e second disposition) | Same commit as, or after, class 7; the CLAUDE.md prose it guards moves in this commit (M-11f) |
| 10 | Wave-gate config values | `.claude/pdlc.config.example.json`'s retired `postWaveCommand` / `postWavePathspecs` **values**, their CLAUDE.md documentation, and the two literals asserted in `consolidationPreflight.test.js` (M-11h). The generic facility in `orchestrate-dev.js` and its `waveExecution` coverage are **not** touched | After class 7 (the retired value names a deleted output) |
| 11 | Skills and banners | The two orchestration skills rewritten as delegators and `consolidate-learnings/SKILL.md`'s bundle reference rewritten (M-11n); the three workflow modules' header banners (M-11o, M-11i (b)); the surviving `orchestrateDevSkill` assertion that moves with `orchestrate-dev/SKILL.md` (M-11p) | Skill text and the assertion over it land together |
| 12 | Documentation | CLAUDE.md's bootstrap/sync/drift/worktree/distribution-channel prose, `pdlc/OPERATIONS.md`'s retired sections, both READMEs, `pdlc/RELEASE-CHECKLIST.md`'s retired rows (M-11k, M-11l); the superseding entry in `DECISIONS-plugin-distribution.md`; stale operator notes (REQ O-6) | Last of the deletion classes |
| 13 | Consumer cleanup | The operator-invoked cleanup step of §3.5 and the operator documentation that describes it | Independent; may land any time, but its documentation is part of the one story class 12 tells |

### 3.2 Per-commit loop

For every commit of §3.1, in order:

1. Make the class's edits — the whole class, nothing from another class.
2. Run the gate command set (L-9) locally.
3. Green → commit. Red → the commit is not made; the class's boundary is wrong and is corrected
   before anything is committed (a red commit "fixed by the next one" is forbidden by C-7).
4. After the last class, replay the whole sweep range commit-by-commit, running L-9 at each
   commit, and capture the output (AC-1.8) — hosted CI runs only on the PR head, so intermediate
   commits are never otherwise exercised.

### 3.3 Documentation sweep

1. Enumerate, at re-measurement time, every instructional file naming a retired concept (REQ O-5;
   the PLAN carries the per-file list).
2. For each: **remove** the section, row or sentence. A retired concept is never left behind a
   deprecation notice, a pointer or a "formerly" note (REQ G-3).
3. Where a document describes the required-check set, update the rows, the **count word** and the
   **named workflow files** together (§4.3).
4. Rewrite, rather than delete, text whose subject survives — the release checklist rows that can
   be restated against the engine's release artifact, and `consolidate-learnings/SKILL.md`'s
   bundle reference.
5. Correct stored operator notes describing the workflow-launcher registry cache and sync
   behaviours (REQ O-6) as part of this feature's Phase H step.
6. Leave historical records untouched: `docs/completed/**`, `docs/discarded/**`, LEARNINGS and
   post-mortems are records, not instructions (REQ NG-4; A-1 allow-lists them).

### 3.4 Delegator skills (resolves REQ O-2)

After the sweep, `/pdlc:orchestrate-dev` and `/pdlc:orchestrate-queue` behave as thin
delegators. On invocation:

1. The skill resolves the engine's CLI entrypoint and invokes it for the requested work — a named
   REQ path for `orchestrate-dev`, a queue pass (default `docs/_queue/QUEUE.md`) for
   `orchestrate-queue`.
2. The skill makes **no pipeline decision**: it does not pick a queue row, evaluate readiness,
   dispatch a phase, parse a verdict or write a queue row. Every such decision is the engine's.
3. When the engine finishes, the skill relays the engine's run report into the session
   substantially as the engine emitted it, plus the engine's exit disposition in the session's own
   words (finished / halted / refused).
4. When the engine **refuses** — handshake mismatch, missing plugin, auth policy — the skill
   relays the engine's banner and refusal together, unedited, and reports the invocation as
   refused. It does not retry, does not fall back to any in-plugin path, and does not summarise
   the refusal into a shorter message that drops a version (§4.4, §4.6).
5. The `/loop run /pdlc:orchestrate-queue` habit is preserved: one invocation processes at most
   one ready feature and returns.

### 3.5 Consumer cleanup (G-4)

The operator runs the documented cleanup step once, in a repo that previously hosted the runtime
copy. The step never runs by itself — no hook, session start or engine startup path invokes it
(REQ NG-6).

1. It inspects the consumer's `.claude/workflows/` directory and the drift-state record.
2. Every entry it finds is classified as *expected* (a file the retired sync channel itself
   installed, matching what that channel would have written) or *unexpected* (anything else,
   including a hand-modified copy).
3. **All expected, nothing unexpected** → the expected entries and the drift-state record are
   removed, a directory left empty by that removal is removed, the repo's tracked files are
   untouched, the step reports what it removed and exits zero.
4. **Nothing left to remove** → it changes nothing, says so and exits zero (idempotence).
5. **Any unexpected entry** → it removes **nothing at all**, leaves every file byte-identical,
   names each unexpected path on stderr and exits non-zero (§4.5).

### 3.6 Post-sweep verification

1. A real feature is run end-to-end through the engine in this repo; it reaches its configured
   final phase and produces the same artifact classes as before (AC-5.1).
2. That run's report is compared field-set-wise against the pre-sweep report committed under
   BL-08 (AC-5.2).
3. The probe CLI is invoked at its surviving path in a checkout of the consuming project and
   answers as before (AC-5.3).
4. The handshake regression guards (AC-3.2, AC-3.5, AC-3.6) are re-exercised **after** the sweep,
   with the post-sweep plugin version, so the refusal and the matched path are both shown to
   survive the removal.

## 4. Business Rules

### 4.1 Sweep rules

- **BR-SWEEP-1 — One class, one commit.** A commit contains the edits of exactly one class of
  §3.1. A commit mixing classes fails AC-1.8 even if the tree is green (REQ C-5).
- **BR-SWEEP-2 — Green at every commit.** Every commit of the sweep passes the L-9 gate command
  set when run at that commit. A commit that is red and repaired by its successor is a defect,
  not an intermediate state (REQ C-7).
- **BR-SWEEP-3 — C-7 outranks C-5 on conflict.** When a class cannot be split without producing a
  red intermediate commit — the CI-jobs class, whose members are bound across two workflow files
  and an oracle by set-equality — the class lands whole (REQ C-5's own conflict rule).
- **BR-SWEEP-4 — Dependents never lag their subject.** A reference to a deleted artifact is
  removed in the same commit as the artifact or earlier; never later.
- **BR-SWEEP-5 — Inventory is re-measured, not trusted, and the sweep is a lower bound.** The
  C-6 partition's pinned expectation is an **empty unclassified remainder**, never a path total:
  the total grows by one file per cross-review through A-1's feature-directory glob. An empty
  remainder proves no *unknown* swept path exists; it does not prove the inventory is complete. A
  dependent no search term reaches — `pdlc/engine/__tests__/ci-arrangement.test.js` and
  `.worktreeinclude` are the two measured instances — is added by reading, not by re-running the
  command (REQ C-6, §1.2).
- **BR-SWEEP-6 — Deleted, never skipped.** A test whose subject is deleted is removed with it. No
  `skip`, no pending marker, no assertion left vacuously true against an empty directory (REQ
  C-8). Conversely, an assertion about **surviving** behaviour that happens to live in a deleted
  file is re-homed into a surviving module before its host is deleted (REQ R-8).
- **BR-SWEEP-7 — The sweep sizes from dispositions, not row counts.** The PLAN's task sizes come
  from the partition's per-file dispositions in the baseline, not from the 16 M-11 rows (REQ R-2).
- **BR-GATE-1 — The queue drift gate is removed, not disabled.** No dead flag, no
  permanently-true branch and no config key a consumer can set with no effect survives (REQ C-3).
- **BR-GATE-2 — A stale consumer key is ignored, not an error.** A consumer config still carrying
  `distribution.checkEnabled` after the sweep is ignored silently; it never fails a run (REQ C-3).
- **BR-HOOK-1 — Hook removal is exactly one entry.** Only the drift reporter leaves the manifest.
  Interactive hooks stay, including the second `SessionStart` entry (REQ C-2, NG-1, O-1).

### 4.2 Pinned literals

Transcribed at base commit **`b3f24fc6`**, 2026-08-17. Re-transcribed at C-6 re-measurement time
against the sweep's base commit (§3.0 step 3); a literal that moved is corrected here.

- **L-1 — `pdlc/workflows/dist/` entries, pre-sweep (5):** `consolidate-learnings.bundle.js`,
  `distribution-manifest.json`, `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`,
  `pdlc-cli.mjs`. **Post-sweep expectation:** the entry set **set-equals** `{pdlc-cli.mjs}`, or
  the directory is gone and the probe CLI lives at the single surviving path the **TSPEC** names
  (REQ AC-1.1, O-3). Set-equality, not containment: an entry added to `dist/` between now and the
  sweep fails rather than slipping through.
- **L-2 — AC-1.2's term set (7 search terms, a set-equality).** Adding a term fails the criterion
  and removing one fails it too.

  | Term | Retired artifact(s) it names |
  |---|---|
  | `sync-workflows` | M-1, `pdlc/hooks/scripts/sync-workflows.sh` |
  | `pdlc-drift` | M-2, `pdlc/hooks/scripts/lib/pdlc-drift.sh` |
  | `check-workflow-drift` | M-3, `pdlc/hooks/scripts/check-workflow-drift.sh` |
  | `\.bundle\.js` | M-4, M-5, M-10 — the three retired runtime bundles |
  | `distribution-manifest` | M-6 |
  | `pdlc-drift-state` | the consumer's drift-state record |
  | `distribution\.checkEnabled` | the retired queue-gate config key |

  **No surviving identifier is a member.** `build-runtime.mjs` and `pdlc/workflows/dist/` are not
  terms (M-7 is reduced and AC-1.1 requires the probe CLI to survive, so either would red
  permanently on files this feature keeps), and neither is the bare key `postWavePathspecs`
  (M-11h retires a *value*; the generic facility in `orchestrate-dev.js` and its `waveExecution`
  coverage survive). The retired wave-gate values are caught by M-11h's per-file dispositions,
  not by a repo-wide term.

- **L-3 — AC-1.2's expected-empty command,** transcribed literally from
  `docs/_constraints/pdlc-retirement-baseline.md` §*The sweep recipe and AC-1.2's search term*:

  ```sh
  grep -rln 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled' \
    $(git ls-files)
  ```

  Post-sweep, its output minus A-1's path globs must be **empty**. The baseline's **sweep recipe**
  is the same command plus `postWavePathspecs` — a documented superset whose delta (4 paths at
  `b73fb4de`) is owned by M-11h and M-10. The two commands are not interchangeable: the recipe is
  the inventory control, L-3 is the required-empty gate.

- **L-4 — Registered hook entries at the base commit (5), by event and script name,** read from
  `pdlc/hooks/hooks.json`:

  | Event | Matcher | Script |
  |---|---|---|
  | `PreToolUse` | `Bash` | `guard-harvest-before-delete.sh` |
  | `PostToolUse` | `Write\|Edit` | `check-scope-field.sh` |
  | `PostToolUse` | `Write\|Edit` | `check-req-size.sh` |
  | `SessionStart` | — | `nudge-consolidation.sh` |
  | `SessionStart` | — | `check-workflow-drift.sh` ← **the only entry removed** |

  **Post-sweep expectation:** the registered entry set **set-equals** the first four rows — an
  absence check on `check-workflow-drift.sh` alone is not sufficient, because deleting the whole
  `SessionStart` event would pass it while losing the consolidation nudge (REQ AC-1.7, O-1).

- **L-5 — Workflow suite size.** `pdlc/workflows/__tests__/*.test.js` counts **119** at the base
  commit. The sweep deletes **22**: M-8's 21 modules (`bootstrap`, `driftBackups`,
  `driftBaseline`, `driftC1Absent`, `driftClassify`, `driftFault`, `driftHelpers`, `driftHook`,
  `driftLadder`, `driftMessageSplit`, `driftMessages`, `driftOrdering`, `driftRecordShape`,
  `driftRelpath`, `driftRepoRoot`, `driftSync`, `driftWriteFailure`, `hookCompatibility`,
  `queueDriftGate`, `runtimeBundle`, `worktreeInclude`) plus M-11p's `runtimeProvenanceWiring`.
  **Post-sweep expectation: 97**, on the rule that re-homed assertions land in modules that
  already exist. If re-homing creates a new module, this literal is corrected at re-measurement
  time — never reconciled by a test that counts loosely (REQ AC-1.3).
- **L-6 — Retained modules that must be present and passing after re-homing:** the surviving
  module carrying the queue-triage assertions re-homed from `queueDriftGate`, and the surviving
  module carrying the hook-manifest compatibility assertions re-homed from `hookCompatibility`.
  Their names are fixed at re-measurement time and transcribed here; the *placement* decision is
  the TSPEC's (REQ AC-1.3, R-8).
- **L-9 — The gate command set** run at every commit (§3.2, AC-1.8):

  | # | Command | Working directory |
  |---|---|---|
  | 1 | `npm test` (the workflows jest suite) | `pdlc/workflows` |
  | 2 | `npm ci && npm test` (the engine suite) | `pdlc/engine` |
  | 3 | `bash -n` over every tracked `*.sh` (`git ls-files '*.sh'`) | repo root |

  This set is the local stand-in for hosted CI at intermediate commits; hosted CI runs on the PR
  head only. AC-1.8 is satisfied by pasted output of the replay, not by inspection.
- **L-10 — Skill-directory listing at the base commit (15),** `pdlc/skills/*/SKILL.md`:
  `consolidate-learnings`, `dod-verify`, `harvest-learnings`, `orchestrate-dev`,
  `orchestrate-queue`, `pm-author`, `pm-review`, `se-author`, `se-implement`, `se-review`,
  `ship-pr`, `te-author`, `te-review`, `tech-lead`, `tech-lead-python`. **Post-sweep expectation:
  the set is unchanged** — the sweep edits three of these files and deletes none (REQ AC-3.3,
  NG-1). Skill file locations do not move; if one ever did, every known `ptah.config.json`
  consumer is updated in the same change (REQ C-4).

## 5. Edge Cases and Error Scenarios

## 6. Acceptance Tests

## 7. Open Questions
