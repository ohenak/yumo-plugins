---
feature: pdlc-plugin-retirement
---

# FSPEC — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` (v0.12); measured surface `docs/_constraints/pdlc-retirement-baseline.md` |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-*-FSPEC-v*.md`: SE v1, v3–v5, v7–v9; TE v1–v9 |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.8 | 2026-08-18 |

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

Every behaviour below traces to `REQ-pdlc-plugin-retirement.md` v0.11. No FSPEC section exists
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
| 1 | CI jobs | `pr-tests.yml`'s `artifact-freshness` and `fresh-clone-bootstrap` jobs and the index-mode assertions inside `script-syntax` (M-11a); `publish.yml`'s tag gate steps (M-11b); the engine's arrangement oracle over the job set and CLAUDE.md's CI section, **including the oracle's own explanatory prose about the required-check set's size and membership** (M-11c); **the count-word claims inside the workflow files' own comment headers that the same oracle reads — `fixture-machine.yml`'s "six PR-gate jobs" and `publish.yml`'s "six rendered check names"** (BR-DOC-1a); CLAUDE.md's `### Continuous integration` table, count word, and `pdlc/OPERATIONS.md`'s `## Continuous integration` count word and named files (M-11k, M-11l share) | First. Spans three workflow files and an oracle bound to all of them by set-equality — C-5 would split it and C-7 forbids the red intermediate, so **C-7 wins and the class lands whole** (REQ C-5) |
| 2 | Engine-side drift coverage | `smoke.test.js` drift-gate and `checkEnabled` cases (M-11d); `fs-observation.test.js` (M-11m); the `consumer-ac12/` fixture tree deleted with its only consumer (M-11e first disposition) | Before class 6 |
| 3 | Queue drift gate | The gate and its `distribution.checkEnabled` key in `orchestrate-queue.js` (M-11i (a)), with the gate's workflow-suite coverage | After class 2 |
| 4 | Drift hook | `check-workflow-drift.sh` (M-3) and its `SessionStart` registration in `pdlc/hooks/hooks.json` (M-11i) | After classes 1–3 |
| 5 | Drift library and sync script | `pdlc-drift.sh` (M-2), `sync-workflows.sh` (M-1) | After class 4 |
| 6 | Test corpus | M-8's 21 `*.test.js` and its six dedicated helpers, deleted (never skipped); the re-homing of assertions about **surviving** behaviour (queue triage around the gate, hook-manifest compatibility) into surviving modules; M-11p's deletions and edits, including the reduction of `helpers/driftGenerators.js` to what its surviving importers use | Re-homing lands in the **same** commit as, or earlier than, the deletion of its host file (REQ R-8) |
| 7 | Bundles and their emission | The three retired bundles (M-4, M-5, M-10) and the manifest (M-6, which REQ O-3 settles as not surviving), and the reduction of the build step (M-7) to emitting the probe CLI only | After class 6, so no surviving test asserts over a deleted bundle |
| 8 | Ignore/worktree rows | `.worktreeinclude`'s single row and `.gitignore`'s row **with its rationale comment block** (M-11j); a file left with no remaining rows is deleted, not left empty | Any time after class 7 |
| 9 | Document oracles | The packaging and advertised-version checks over `dist/`, the drift scan's generated-tree exemptions (M-11g), the surviving `documentOracles` assertion that CLAUDE.md *contains* the two retired script names (M-11f), and the re-fixturing of the `covered-violations/` tree (M-11e second disposition) | Same commit as, or after, class 7; the CLAUDE.md prose it guards moves in this commit (M-11f) |
| 10 | Wave-gate config values | **Prose only** (TSPEC §6.1 erratum 5): `.claude/pdlc.config.example.json`'s `postWaveCommand` / `postWavePathspecs` **values stay** (they still regenerate the surviving probe CLI); only their CLAUDE.md prose is edited; `consolidationPreflight.test.js`'s two assertions (M-11h) survive, with `postWavePathspecs` tightened from containment to set-equality (C-6). The generic facility in `orchestrate-dev.js` and its `waveExecution` coverage are **not** touched | After class 7 (the edited prose names deleted outputs) |
| 11 | Skills and banners | The two orchestration skills rewritten as delegators and `consolidate-learnings/SKILL.md`'s bundle reference **deleted, not rewritten** (no host survives to name); §3.3 step 4 disposes the capability (M-11n); the three workflow modules' header banners (M-11o, M-11i (b)); the surviving `orchestrateDevSkill` assertion that moves with `orchestrate-dev/SKILL.md` (M-11p) | Skill text and the assertion over it land together |
| 12 | Documentation | CLAUDE.md's bootstrap/sync/drift/worktree/distribution-channel prose, `pdlc/OPERATIONS.md`'s retired sections, both READMEs, `pdlc/RELEASE-CHECKLIST.md`'s retired rows (M-11k, M-11l); the superseding entry in `DECISIONS-plugin-distribution.md`; stale operator notes (REQ O-6) | Last of the deletion classes |
| 13 | Consumer cleanup | The operator-invoked cleanup step of §3.5 and the operator documentation that describes it | Independent; may land any time, but its documentation is part of the one story class 12 tells |

**Held classes.** Class 6 waits on TSPEC §6.1 erratum 6; classes 7–12
waited on erratum 3, disposed in §3.3 step 4, releasing that hold. A held class leaves AC-1.1
unsatisfied on an unmerged branch — **not** a C-7 red, never registered as a tolerated
failure (REQ C-7).

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
4. Rewrite, rather than delete, text whose subject survives — the release checklist rows restated
   against the engine's release artifact. `consolidate-learnings/SKILL.md`'s bundle reference is
   the exception: **deleted**, since after class 7 no host survives for a rewrite to name.
   **Capability disposition, decided here (TSPEC §6.1 erratum 3):** the bundle-hosted unattended
   run retires with the sweep; the skill survives, still operator-invocable in session as
   `/pdlc:consolidate-learnings`, so no user-visible way to run
   consolidation is lost and no SKILL.md advertises a dead host (REQ G-3, NG-1, NG-3). Re-hosting
   it under the engine is successor work (REQ NG-5).
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

1. It inspects the consumer's `.claude/workflows/` directory and the drift-state record at
   `.claude/workflows/.pdlc-drift-state.json` (the path the retired drift library wrote,
   `pdlc/hooks/scripts/lib/pdlc-drift.sh`, `pdlc_write_drift_state`). Either may be absent: a
   consumer that never enabled the drift hook has the copy but no record, and absence of the
   record is **not** an error and not an unexpected entry.
2. Every entry it finds is classified **by name only**, against the fixed set of names the
   retired channel installed there — L-11's consumer-side installed-name set (§4.2).
   *Expected* means the name is in that set; *unexpected* means anything else. No content is
   compared and no repo artifact is consulted: the manifest and the bundles it described are
   deleted by the sweep (class 7), so a content predicate would be undecidable, not conservative.
   The name set travels with the cleanup step; where it is carried is the TSPEC's (BR-CLN-3a).
3. **All expected, nothing unexpected** → every expected entry of L-11 that is present is
   removed (the `.pdlc-backups/` directory with its contents), a directory left empty by that
   removal is removed, the repo's tracked files are
   untouched, the step reports what it removed and exits zero.
4. **Nothing left to remove** → it changes nothing, says so and exits zero (idempotence).
5. **Any unexpected entry** → it removes **nothing at all**, leaves every file byte-identical,
   names each unexpected path on stderr and exits with the fixed refusal status of BR-CLN-4.

### 3.6 Post-sweep verification

1. A real feature is run end-to-end through the engine in this repo; it reaches its configured
   final phase and produces the same artifact classes as before (AC-5.1).
2. That run's report is compared against the pre-sweep report committed under BL-08: **field sets
   over the whole report, values over the stable field subset only** (AC-5.2, AT-5.2).
3. The probe CLI is invoked at its surviving path in a checkout of the consuming project and
   answers as before (AC-5.3).
4. The handshake regression guards (AC-3.2, AC-3.5, AC-3.6) are re-exercised **after** the sweep,
   with the post-sweep plugin version, so the refusal and the matched path are both shown to
   survive the removal.

## 4. Business Rules

### 4.1 Sweep rules

- **BR-SWEEP-1 — One class, one commit; classes partition *edits*, not files.** A commit contains
  the edits of exactly one class of §3.1. A commit mixing classes fails AC-1.8 even if the tree is
  green (REQ C-5). The unit a class owns is a **(file, section) pair**, not a file: CLAUDE.md is
  edited by classes 1, 9, 10 and 12, `pdlc/OPERATIONS.md` by 1 and 12, and the two fixture trees
  by 2 and 9. Each such edit belongs to exactly one class, decided by the section it changes — the
  CI section to class 1, oracle-guarded hooks and distribution-channel prose to class 9, wave-gate
  documentation to class 10, everything else to class 12 — and the baseline's per-file
  dispositions carry that section split for every multi-class file (REQ C-5, C-6).
- **BR-SWEEP-2 — Green at every commit.** Every commit of the sweep passes the L-9 gate command
  set when run at that commit. A commit that is red and repaired by its successor is a defect,
  not an intermediate state (REQ C-7).
- **BR-SWEEP-3 — C-7 outranks C-5 on conflict.** When a class cannot be split without producing a
  red intermediate commit — the CI-jobs class, whose members are bound across three workflow files
  and an oracle by set-equality — the class lands whole (REQ C-5's own conflict rule).
- **BR-SWEEP-4 — Gate-relevant dependents never lag their subject.** A reference an executable
  gate reads — a workflow step, a test assertion, a config key, a manifest row — is removed in the
  same commit as the artifact it names or earlier; never later. **Prose references in
  instructional documents are out of this rule's scope**, because at HEAD an oracle asserts that
  CLAUDE.md *contains* two retired script names (`documentOracles.test.js`): deleting that prose
  ahead of its oracle reds the gate BR-SWEEP-2 requires green. Prose is governed instead by two
  rules — oracle-guarded prose moves in the **same commit as its oracle** (class 9, M-11f),
  unguarded prose in **class 12**, last. No gate-read reference may use this exception.
- **BR-SWEEP-5 — Inventory is re-measured, not trusted, and the sweep is a lower bound.** The
  C-6 partition's pinned expectation is an **empty unclassified remainder**, never a path total:
  the total grows by one file per cross-review through A-1's feature-directory glob. An empty
  remainder proves no *unknown* swept path exists; it does not prove the inventory is complete. A
  dependent no search term reaches — `pdlc/engine/__tests__/ci-arrangement.test.js` and
  `.worktreeinclude` are the two measured instances — is added by reading, not by re-running the
  command (REQ C-6, §1.2).
- **BR-SWEEP-6 — Deleted, never skipped.** A test whose subject is deleted is removed with it.
  Across the **swept surface** — M-8's deleted modules and the surviving modules that host R-8's
  re-homed assertions — no `skip` or pending marker survives **that does not reach the run's skip
  sink as a registered record**: a capability-gated skip registering into
  the sink is a declared runner limitation, not a sweep defect; a bare `it.skip` or unregistered pending marker
  in that surface still fails. The boundary is sink membership at run time, not `SKIP_INVENTORY`
  membership — the inventory is deliberately not closed over registered skips, so keying the
  exemption to it would fail correct skips. Pending markers outside the swept surface
  (`guardMatrix.test.js`'s rows are the measured instance) are pre-existing state
  this feature does not repair. No assertion is left vacuously true against an empty directory
  (REQ C-8). Conversely, an assertion about **surviving** behaviour that happens to live in a deleted
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
against the sweep's base commit (§3.0 step 3); a literal that moved is corrected here. L-7 and
L-8, the two documentation/CI literals, live in §4.3 with the rules that consume them.

Throughout this document **`A-1`** names one thing only: the retired-name allow-list in
`docs/_constraints/pdlc-retirement-baseline.md` §*A-1 retired-name allow-list*. This FSPEC's own
assumptions are numbered `ASM-1`…`ASM-4` (§7.1) to keep the two apart.

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
  (M-11h is prose-only — the values, the facility in
  `orchestrate-dev.js` and its `waveExecution` coverage all survive).

- **L-3 — AC-1.2's expected-empty command,** transcribed literally from
  `docs/_constraints/pdlc-retirement-baseline.md` §*The sweep recipe and AC-1.2's search term*:

  ```sh
  grep -rln 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled' \
    $(git ls-files)
  ```

  Post-sweep, its output minus A-1's path globs must be **empty**, where A-1 is the glob list
  transcribed at re-measurement time from the baseline section named above and **frozen for the
  duration of the sweep**: a glob added to A-1 after that transcription does not filter AT-1.2's
  output unless the addition carries a per-file disposition recorded in the baseline, so a red
  search can never be greened by widening the filter (the mirror of E-12 on the exclusion side).
  A-1's two mandatory members — `docs/_decisions/DECISIONS-plugin-distribution.md` and
  `docs/_constraints/pdlc-retirement-baseline.md` — must remain covered; they are what makes
  AT-1.2's positive control non-empty. The baseline's **sweep recipe**
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
- **L-6 — Re-homed assertions, by host module *and* by assertion title.** Two rows, each naming
  the surviving module and the **titles** of the assertions it must contain: the queue-triage
  assertions re-homed from `queueDriftGate.test.js`, and the hook-manifest compatibility
  assertions re-homed from `hookCompatibility.test.js`. Both halves are transcribed here at
  re-measurement time, once the TSPEC has decided placement (REQ AC-1.3, R-8, §7 O-E). Titles are
  part of the literal because a module-presence check alone passes on a module that survived
  without receiving anything. L-6's hook-manifest row names only what L-4's set-equality does not
  already assert; anything L-4 covers is dropped with its host rather than re-homed twice.
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

- **L-11 — `.claude/workflows/` installed names, pre-cleanup (9):** the four consumer paths the
  retired channel wrote — `consolidate-learnings.bundle.js`, `orchestrate-dev.bundle.js`,
  `orchestrate-queue.bundle.js`, `pdlc-cli.mjs` — the two pre-bundle paths the same channel
  installed and later superseded, `orchestrate-dev.js` and `orchestrate-queue.js` (only a sync run
  removed them; a drift-check-only consumer still holds them, reported and left in place) — plus the three state entries it created beside them, `.pdlc-drift-state.json`,
  `.pdlc-sync-manifest.json` and the `.pdlc-backups/` directory.
  Any member may be absent; absence is never an error (§3.5 step 1). This set is
  **consumer-side and is not L-1**: `distribution-manifest.json` is a repo-side build artifact the
  channel never installed, so a file of that name here is **unexpected** and refuses (E-16).
  A crash-residue temp file the channel left mid-write is likewise **not** a member and refuses
  (E-16b). `.pdlc-backups/` is expected **as a whole directory**, removed with its contents; the
  timestamped `.bak` files inside are never classified individually, their names being
  unenumerable in advance.

### 4.3 Documentation and CI rules

- **L-7 — The required-check set.** At the base commit it is **six** checks across **two**
  PR-triggered workflow files:

  | Check name | File | Post-sweep |
  |---|---|---|
  | `Unit tests (ubuntu-latest, node 20)` | `pr-tests.yml` | survives |
  | `Engine tests (ubuntu-latest)` | `pr-tests.yml` | survives |
  | `Generated artifacts are in sync` | `pr-tests.yml` | **removed** (M-11a) |
  | `Fresh-clone bootstrap works` | `pr-tests.yml` | **removed** (M-11a) |
  | `Shell scripts parse` | `pr-tests.yml` | survives, **narrowed** — its executable-bit assertions name only surviving scripts |
  | `Fixture machine (install/upgrade, launcher, container, two-repo)` | `fixture-machine.yml` | survives — it names no retired artifact |

  **Post-sweep expectation: four checks across the same two workflow files.**
- **BR-DOC-1 — Rows, count word and named files move together.** Wherever a tracked instructional
  document describes the required-check set, its rows **set-equal** L-7's post-sweep set, its
  prose **count word** equals that set's size (`four`), and the workflow files it names
  **set-equal** the files those checks are defined in. This binds CLAUDE.md's
  `### Continuous integration` section (oracle-covered) **and** `pdlc/OPERATIONS.md`'s
  `## Continuous integration` section (no oracle — its count word reads "six checks" at
  `OPERATIONS.md:59` today) with the same three-part assertion (REQ AC-1.4, M-11l).
- **BR-DOC-1a — Count words inside the workflow files themselves are part of the same set.** The
  arrangement oracle flattens the comment headers of all three workflow files it knows and fails
  any count word claiming a size other than the required-check set's. Two such claims are live at
  the base commit — `fixture-machine.yml`'s "six PR-gate jobs" and `publish.yml`'s "six rendered
  check names" — so both are corrected to `four` in **class 1**, in the same commit that shrinks
  the set. Neither edit changes a `name:` key, a trigger or a step: `fixture-machine.yml`'s
  rendered check still survives unchanged (ASM-1), and `publish.yml` stays tag-triggered and
  outside the PR-gate set.
- **BR-DOC-1b — The post-sweep set has one carrier, and every pointer names it.** After the sweep
  the required-check set's human-facing carrier is **CLAUDE.md's `### Continuous integration`
  section** — the one carrier an oracle covers. The arrangement oracle's own explanatory prose,
  which today routes a maintainer to a completed feature's FSPEC §5.1, is rewritten in class 1 to
  name that carrier and the post-sweep count. A surviving pointer naming a `docs/completed/**`
  section as the live source is a defect: BR-DOC-5 forbids editing the historical document, not
  correcting pointers into it.
- **BR-DOC-2 — Removed, not deprecated.** In the tracked instructional set — CLAUDE.md,
  `pdlc/OPERATIONS.md`, `README.md`, `pdlc/README.md`, `pdlc/RELEASE-CHECKLIST.md` and the three
  `pdlc/skills/*/SKILL.md` files of M-11n — a reader who never saw the old path can find **no**
  instruction to build runtime bundles, sync, force-sync, check drift, bootstrap a fresh clone's
  runtime artifacts, or work around the self-created-worktree gap, and finds **exactly one**
  described way to run the pipeline unattended (REQ G-3, AC-2.1). `pdlc/OPERATIONS.md`'s retired
  sections are named by their verbatim headings in the baseline's M-11l row; its
  `## The engine channel (\`pdlc/engine\`)` section is **not** retired.
- **BR-DOC-3 — No live record still mandates the retired channel.** After the sweep, no live
  decision in `docs/_decisions/` and no open row in `docs/_queue/QUEUE.md` mandates the retired
  copy channel. A superseded decision carries an explicit superseding entry naming what it
  supersedes — which is why `DECISIONS-plugin-distribution.md` legitimately still contains
  retired names and is allow-listed by A-1 (REQ AC-2.3, BL-05, BL-06). `QUEUE.md` row 8
  (`pdlc-release-ci`, `blocked`) is the one live row concerned; its disposition is decided
  upstream and gates AC-2.3 (REQ O-7).
- **L-8 — `publish.yml`'s tag gate, post-sweep.** No step of the tag-triggered `gate` job invokes
  a deleted artifact: no build-and-check of the retired bundles, no rebuild-diff over them, no
  two-command bootstrap, no sync invocation, and no executable-bit assertion naming a deleted
  script. The release path still gates on L-7's surviving checks. Because a failure here surfaces
  only at the next release tag, it is asserted before the sweep closes (REQ AC-1.4b, M-11b).
- **BR-DOC-4 — Release-checklist rows are performable.** Every row whose subject was the retired
  machinery is removed or rewritten against the engine's release artifact; no row survives
  instructing a check that can no longer be performed (REQ AC-2.2).
- **BR-DOC-5 — History is not rewritten.** `docs/completed/**`, `docs/discarded/**`, LEARNINGS
  and post-mortems are not edited to drop retired names, and the two allow-listed files that must
  survive carrying them — `DECISIONS-plugin-distribution.md` and the baseline itself — do
  (REQ NG-4; baseline A-1).

### 4.4 Delegator rules (REQ O-2, G-2)

- **BR-DEL-1 — No pipeline logic in the plugin.** After the sweep the orchestration skills carry
  no queue selection, readiness evaluation, phase dispatch, verdict parsing or queue-row write,
  and no copy of the workflow code. Every pipeline decision is the engine's (REQ AC-3.1).
- **BR-DEL-2 — Relay, don't summarise.** The skill relays the engine's run report substantially
  as emitted. It may add the session-facing disposition line; it may not drop, rename or
  re-compute a report field.
- **BR-DEL-3 — A refusal is surfaced whole.** On an engine refusal the skill surfaces the
  engine's startup banner **and** its refusal together — the banner is where the version triple
  lives, so relaying the refusal line alone would hide the diagnosis (REQ AC-3.6). The skill does
  not retry and does not fall back to any in-plugin execution path; there is none.
- **BR-DEL-4 — The `/loop` habit is preserved.** One `/pdlc:orchestrate-queue` invocation
  processes at most one ready feature and returns, exactly as before the sweep (REQ G-2).

### 4.5 Consumer cleanup rules (REQ G-4, C-9, NG-6)

- **BR-CLN-1 — Operator-invoked only.** Nothing invokes the cleanup automatically: not a hook,
  not a session-start action, not the engine's startup path (REQ NG-6).
- **BR-CLN-2 — Idempotent.** A second run over an already-cleaned repo changes nothing, says so
  and exits zero (REQ AC-4.2).
- **BR-CLN-3 — Refuse rather than delete broadly.** On encountering any entry it did not expect,
  the step deletes **nothing at all** in that invocation — it is not a partial-progress tool.
  Every file is left byte-identical (REQ AC-4.3, C-9).
- **BR-CLN-3a — Expectation is by name, and the name set is self-contained.** §3.5 step 2's
  classification rests on **L-11's** consumer-side installed-name set, carried by the cleanup
  step: not the manifest (deleted in class 7, and never installed consumer-side), not content. **Consequence, stated rather than left implicit:** a file with an
  expected *name* and hand-modified *content* is removed like any other expected entry, because no
  post-sweep artifact can distinguish it. Conservatism comes from the name predicate — one entry
  the channel never installed refuses the whole invocation. REQ AC-4.3 (v0.11) scopes the
  criterion to the unexpected-entry case and states that hand-modification of an expected entry is **not** covered (REQ C-9) — the rule stated here, not a reinterpretation of it.
- **BR-CLN-4 — Refusal is checkable without reading the implementation, and its status is a fixed
  value.** A refusal names each unexpected path on **stderr** and exits **`3`** — not merely
  "non-zero", which a missing interpreter (`127`) or an uncaught signal also satisfies, greening a
  refusal test on a step that never ran. `3` is the status the retired sync tooling used for this
  case: an *unknown* row and two unmet evidence preconditions exited `3`, `local-edit`/`unverified`
  exited `2`, stale-or-missing exited `1`, and a successful run exited `0`
  (`pdlc/hooks/scripts/sync-workflows.sh`, **five** terminal exit statuses). The fifth, `4`, was
  that tooling's usage-error, unrecognised-seam-token and write-failure status; the
  cleanup keeps `4` reserved for that class and never reuses it for refusal.
- **BR-CLN-5 — Tracked files are never touched.** The cleanup removes only untracked consumer
  runtime state; a successful run leaves the repo's tracked files unchanged (REQ AC-4.1).
- **BR-CLN-6 — Leftovers are inert.** A consumer that never runs the cleanup still runs features
  to their configured final phase; the run's report has the **same field set** as the same run in
  a clean repo (two whole reports are never value-equal — timestamps and ids differ by
  construction, so "set-equals" is read as AT-5.2 reads it, over fields); and neither the output
  nor the report names a leftover path. The positive half — completion through the configured
  final phase — is what stops an unrelated failure from satisfying the absences (REQ AC-4.4, R-6).

### 4.6 Version-handshake rules (REQ C-10, BL-07, R-3)

- **BR-VER-1 — The sweep's plugin version must stay inside the *published* engine's declared
  range, or a new engine release must precede the first deletion commit.** Measured at the base
  commit: the published `@kaneho/pdlc-engine@0.2.0` declares `pluginCompat: ^0.23.0`
  (`docs/completed/pdlc-engine-distribution/EVIDENCE-ENGINE-V0.2.0.md` §2), the repo's engine
  declares `pdlcPluginCompat: "^0.23.0"` (`pdlc/engine/package.json:18`), and the plugin is at
  `0.23.1` (`pdlc/.claude-plugin/plugin.json`). Under the handshake's leftmost-non-zero caret
  semantics (`pdlc/engine/lib/handshake.mjs`, `satisfiesRange`), `^0.23.0` admits `0.23.x` and
  **not** `0.24.0`. So the sweep either ships a `0.23.x` plugin version, or BL-07's published
  release with a widened declared range lands **before** the first deletion commit. Shipping a
  `0.24.0` plugin against the published `^0.23.0` engine turns C-10's handshake into an outage on
  the retirement commit (REQ R-3).
- **BR-VER-2 — Widening the declared range is in scope; cutting the release is the operator's.**
  Editing the engine's declared compatible-plugin range is explicitly carved into scope by REQ
  NG-5; publishing the release that carries it is an operator step, and BL-07 gates the first
  deletion commit on it.
- **BR-VER-3 — Refusal is loud, and the version triple is observable.** A version mismatch or a
  missing plugin refuses before any skill dispatch, performs no pipeline action, and the
  invocation's terminal output — banner plus refusal together — carries the engine version, the
  plugin version and the expected range; the run report carries the same three. The refusal
  message's own wording is engine-side and out of scope here (REQ AC-3.6, NG-5).

## 5. Edge Cases and Error Scenarios

| ID | Scenario | Expected behaviour |
|---|---|---|
| E-1 | The C-6 re-measurement finds a path the inventory does not claim | The sweep does not start. The path is classified into an M-row, an M-11 row or A-1 and the baseline is updated first; sweeps fail by omission, not excess (REQ C-6) |
| E-2 | The partition's swept **total** differs from the baseline's recorded total | Not a failure by itself — A-1's feature-directory glob grows by one file per cross-review. Only a non-empty unclassified remainder, or a multi-owned path, blocks (BR-SWEEP-5) |
| E-3 | A dependent exists that no search term reaches (e.g. a file naming a job id or a consumer directory) | The sweep cannot see it; it is carried as an inventory row and swept by reading. `ci-arrangement.test.js` and `.worktreeinclude` are the two measured instances |
| E-4 | A commit's gate run is red mid-sweep | The commit is not made. The class boundary is corrected first; a red commit repaired by its successor violates C-7 and breaks C-5's bisectability |
| E-5 | An assertion about surviving behaviour is discovered inside a file scheduled for deletion | It is re-homed into a surviving module in the same commit or earlier; the deletion does not proceed until it is (REQ R-8) |
| E-6 | The document-oracle suite is red locally but green in CI | Untracked local files (tool caches, editor backups) change this oracle's result independently of the diff. It is judged against a **clean tracked-files-only checkout** before it is treated as a sweep regression (REQ AC-1.6) |
| E-7 | Removing the drift scan's generated-tree exemptions reds the oracle on generated content elsewhere | The oracle must be **green on this repo** after the change, not merely compile. Surviving generated content is disposed of explicitly, not exempted by a leftover rule (REQ R-4) |
| E-8 | The `.gitignore` row's second effect (keeping a nested fixture tree addable) would be lost with the row | The fixture's own disposition under AC-1.2 discharges that effect explicitly; it is never left implicit. The row's ~20-line rationale comment block, which exists only to explain that row, is deleted **with** the row — `.gitignore` is the file that carries such a block (REQ AC-1.5) |
| E-9 | A file (`.worktreeinclude`) has no rows left after its retired row is removed | The file is deleted, not left empty. `.worktreeinclude` is a single row and carries no comment; the comment-block obligation is E-8's (REQ AC-1.5) |
| E-10 | The build step's reduction would orphan the probe CLI as a hand-maintained checked-in file | Not permitted: the CLI stays **generated** by a reduced build step and behaviourally unchanged (REQ G-5, R-5) |
| E-11 | An entry appears in `dist/` between authoring and the sweep | AC-1.1's set-equality fails rather than admitting it. The entry is classified and disposed of before the sweep closes |
| E-12 | An implementer proposes narrowing L-2's term set to green a red search | Refused: L-2 is a set-equality. A red search means an unswept dependent, not an over-wide term (REQ AC-1.2) |
| E-13 | An implementer proposes adding `build-runtime.mjs`, `pdlc/workflows/dist/` or `postWavePathspecs` to L-2 | Refused: each names a surviving artifact or mechanism and would red permanently on files this feature keeps |
| E-14 | The whole `SessionStart` event is dropped with the drift reporter | Fails L-4's set-equality: the consolidation nudge is a `SessionStart` survivor (REQ AC-1.7, US-04) |
| E-15 | A consumer's config still carries `distribution.checkEnabled` after the sweep | Ignored silently. It never errors and never changes behaviour (BR-GATE-2) |
| E-16 | The cleanup finds an entry whose **name** the retired channel never installed | Nothing is deleted in that invocation, every file stays byte-identical, each unexpected path is named on stderr, exit is `3` (BR-CLN-3, BR-CLN-3a, BR-CLN-4) |
| E-16a | The cleanup finds a hand-modified file at an **expected** name | It is removed with the other expected entries: no post-sweep artifact can detect the modification (BR-CLN-3a). The operator's protection is the report of what was removed, and REQ AC-4.3 and C-9 (v0.11), which place a hand-modified expected entry outside the refusal predicate |
| E-16b | The cleanup finds a `.pdlc-tmp.*` file the retired channel left behind when a write was killed mid-rename | Treated as unexpected: refuse per E-16, even though the channel wrote the name — no post-sweep artifact proves the residue is junk rather than an operator's file. The stderr path tells the operator what to remove by hand before re-running (BR-CLN-3) |
| E-17 | The cleanup is run in a repo with no leftovers, or run twice | Succeeds, changes nothing, says so, exits zero (BR-CLN-2) |
| E-18 | The cleanup's target directory holds a file the consumer tracks in git | Treated as unexpected: refuse per E-16. Tracked files are never touched (BR-CLN-5) |
| E-19 | The sweep bumps the plugin to a version outside the published engine's declared range | The handshake refuses every run from that commit on. Prevented by BR-VER-1: either the version stays in `0.23.x`, or BL-07's widened published release lands first |
| E-20 | The engine refuses (handshake, missing plugin, auth policy) during a delegated run | The skill surfaces banner **and** refusal together and reports the invocation as refused; no retry, no fallback path, no shortened message that drops a version (BR-DEL-3) |
| E-21 | The post-sweep run report has a field the pre-sweep baseline lacks, or vice versa | AC-5.2 fails. Field **sets** must be equal over the whole report. Value comparison is scoped to AT-5.2's stable field subset: the two version-provenance fields and the eight run-variable collections REQ AC-5.2 enumerates exhaustively — `authSources`, `startup`, `dispatches`, `retries`, `pauses`, `denials`, `loop`, `outcomes` — differ between any two correct runs and are compared for **presence and shape**, never for value |
| E-22 | The AC-5.1 verification run halts for an unrelated reason | AC-5.1 is unmet, not waived: it requires a positive completion through the configured final phase. A halt is investigated before the sweep is declared done |
| E-23 | The pre-sweep gate transcript records a suite that ran zero tests and exited 0 | Not a green start. BL-08 requires each suite's summary counts, so a vacuous pass is visible and is repaired before the first deletion commit (REQ C-7, BL-08) |
| E-24 | A Ptah consumer's configured skill path would move | Forbidden unless every known consumer config is updated in the same change (REQ C-4, AC-3.4) |
| E-25 | An adjacent feature's PLAN or a new document re-introduces a retired name after the sweep | Not allow-listed: A-1's planning glob names specific shipped-feature paths, deliberately not a wildcard over future features' PLANs, so the search reds on it |

## 6. Acceptance Tests

Each test names the REQ criterion it discharges. Every one is checkable from the tree, from a
committed transcript or from an observed run; none is satisfied by an agent reporting success.

### 6.1 Surface removal

- **AT-1.1** (AC-1.1) *Who:* maintainer. *Given* HEAD after the sweep, *when* the tree is listed,
  *then* M-1…M-6 and M-10 are not tracked files, and either the entry set of
  `pdlc/workflows/dist/` set-equals `{pdlc-cli.mjs}` or that directory is absent and the probe CLI
  exists at the single path the TSPEC names. A `dist/` entry outside L-1's post-sweep expectation
  fails.
- **AT-1.2** (AC-1.2) *Who:* maintainer. *Given* HEAD, *when* L-3's command is run, *then* three
  things hold together, because the first alone cannot fail for the right reason:
  1. **Positive control (the search ran).** The **unfiltered** output is **non-empty** and
     **contains** both `docs/_decisions/DECISIONS-plugin-distribution.md` and
     `docs/_constraints/pdlc-retirement-baseline.md` — the two allow-listed files that survive the
     sweep still carrying retired names. Containment, not set-equality, is the checkable shape on
     this side: A-1's glob coverage is an open set that grows with every cross-review landing under
     BR-SWEEP-5's globs, and most covered files carry no retired term, so equality is measured
     false today. Clause 2 supplies the matching upper bound; the two together are the control. An
     empty unfiltered output **fails**: the search did not execute (word-split term list, wrong
     working directory, `grep` exiting non-zero), which an absence-only oracle would score as a
     pass.
  2. **The gate.** That output minus A-1's frozen glob list (§4.2, L-3) is **empty**.
  3. **Term fidelity.** The command's term list set-equals L-2's seven terms — a run with a term
     added or removed does not satisfy this test.
- **AT-1.3** (AC-1.3) *Who:* maintainer. *Given* HEAD, *when* the workflow suite runs, *then* it
  is green; across the **swept surface** (M-8's deleted modules and the surviving modules hosting
  R-8's re-homed assertions) the suite contains **no skipped or pending test absent from the skip
  sink's records for that run** — a capability-gated skip that registers itself into the sink is a
  declared runner limitation and does not fail this test, a bare `it.skip` or unregistered pending
  marker in that surface does, and pending markers elsewhere in the suite are out of scope
  (BR-SWEEP-6);
  `*.test.js` under `pdlc/workflows/__tests__/` counts exactly L-5's post-sweep literal; and, for
  each of L-6's two rows, the named module exists **and contains the named assertion titles**,
  each of which reds when the behaviour it re-homes is reverted. Module presence without the
  titles fails: it is the shape a lost re-homing takes.
- **AT-1.4** (AC-1.4) *Who:* maintainer. *Given* HEAD, *when* CI runs on a pull request, *then*
  the set of checks rendered by the PR-triggered workflow files **set-equals L-7's post-sweep four
  rows** — stated as set-equality, not as the absence of the two removed names, because an absence
  check passes just as well when a third check has silently disappeared, which is precisely the
  drift class 1 risks; the surviving shell-script check asserts only surviving scripts (no deleted
  entrypoint, no deleted sourced library); every rendered check is green; and, in **both**
  CLAUDE.md's `### Continuous integration` section and `pdlc/OPERATIONS.md`'s
  `## Continuous integration` section, the described rows set-equal that same set, the prose count
  word equals its size, and the named workflow files set-equal the files those checks are defined
  in. Membership is decided by each file's `on:` trigger, not by its name.
- **AT-1.4b** (AC-1.4b) *Who:* maintainer. *Given* HEAD, *when* `publish.yml`'s tag gate is read
  and asserted against the surviving job set, *then* L-8 holds: no step invokes a deleted
  artifact, and the release path still gates on L-7's surviving checks.
- **AT-1.4c** (AC-1.4c) *Who:* maintainer. *Given* **each** commit of the sweep, *when* the engine
  suite runs at that commit, *then* it is green — including the CI-arrangement oracle over the job
  set and CLAUDE.md's CI section, table and prose count word, the drift-gate smoke cases and the
  observation tests. Baseline: the same suite green at the pre-sweep base commit, per the BL-08
  transcript.
- **AT-1.5** (AC-1.5) *Who:* maintainer. *Given* HEAD, *when* `.worktreeinclude` and `.gitignore`
  are inspected, *then* neither carries a row whose only purpose was the consumer runtime copy,
  each removed row's comment block is gone with it, a file left with no rows is deleted rather
  than empty, and the `.gitignore` row's fixture-addability effect is discharged by that fixture's
  own disposition.
- **AT-1.6** (AC-1.6) *Who:* maintainer. *Given* a clean tracked-files-only checkout at HEAD,
  *when* the document-oracle suite runs, *then* the packaging and advertised-version checks over
  the deleted bundles are gone with their tests, the drift scan carries no exemption for a tree
  that no longer exists, the assertion requiring CLAUDE.md to contain the two retired script names
  is gone together with the prose it guarded, and the remaining oracles pass.
- **AT-1.7** (AC-1.7) *Who:* maintainer. *Given* HEAD, *when* `pdlc/hooks/hooks.json` is read,
  *then* its registered entry set (by event and script name) set-equals L-4's post-sweep four
  rows. Deleting the whole `SessionStart` event fails this test.
- **AT-1.8** (AC-1.8, C-5, C-7) *Who:* maintainer. *Given* the sweep's commit range, *when* each
  commit is checked out in turn and L-9's three commands are run at it, *then* every command
  passes at every commit, and every **hunk** of each commit's diff belongs to the same one class
  of §3.1. The unit judged is the (file, section) pair of BR-SWEEP-1, not the file: a commit
  touching CLAUDE.md is checked against the sections that class owns, and a commit carrying two
  sections of CLAUDE.md that belong to different classes fails even though only one file changed.
  Evidence is the pasted replay output plus, per commit, the class it claims.

### 6.2 One documented story

- **AT-2.1** (AC-2.1) *Who:* a reader new to the repo. *Given* HEAD, *when* they read the
  instructional set of BR-DOC-2, *then* they find no instruction to build runtime bundles, sync,
  force-sync, check drift, bootstrap a fresh clone's runtime artifacts or work around the
  self-created-worktree gap — the sections are absent, not replaced by pointers — and exactly one
  described way to run the pipeline unattended. Falsifiable by search over the retired concepts'
  names and by the verbatim headings of M-11l.
- **AT-2.2** (AC-2.2) *Who:* operator. *Given* HEAD, *when* `pdlc/RELEASE-CHECKLIST.md` is read,
  *then* every row whose subject was the retired machinery is removed or rewritten against the
  engine's release artifact, and no surviving row instructs a check that cannot be performed.
- **AT-2.3** (AC-2.3) *Who:* operator. *Given* HEAD, *when* `docs/_decisions/` and
  `docs/_queue/QUEUE.md` are read, *then* no live decision and no open queue row mandates the
  retired copy channel — specifically, `QUEUE.md`'s `pdlc-release-ci` row no longer does — and
  each superseded decision carries an explicit superseding entry.

### 6.3 Plugin serves humans; engine cannot run without it

- **AT-3.1** (AC-3.1) *Who:* operator in a consumer repo with plugin and engine installed.
  *Given* a ready queue row, *when* they invoke `/pdlc:orchestrate-queue`, *then* all three of
  these are observable rather than asserted by the agent: the session transcript's tool-invocation
  **sequence** for the skill has **length 1** and its single member is the engine CLI call, which
  is discharged by counting — a sequence, not a set, so a second identical invocation reds rather
  than collapsing into one member; the
  engine's run report carries a
  **non-empty dispatch record**, which is positive proof the phase decision was made engine-side;
  and the skill's response reproduces that report's fields without dropping, renaming or
  recomputing one. "No pipeline decision inside the plugin" is discharged by these positives plus
  the static half — the delegator skill files contain no queue selection, readiness evaluation,
  dispatch, verdict parsing or queue-row write — never by an unbounded negative claim
  (BR-DEL-1, BR-DEL-2).
- **AT-3.2** (AC-3.2 — regression guard, pre-satisfied at HEAD) *Who:* operator in a consumer repo
  with the plugin **not** installed. *Given* a ready queue row, *when* they invoke the engine from
  a terminal, *then* it refuses to dispatch any skill-driven phase and names the missing plugin as
  the cause. Asserted **after** the sweep.
- **AT-3.3** (AC-3.3) *Who:* maintainer, then a human in a Claude Code session. *Given* the plugin
  at HEAD, *then* two mechanical halves hold, and no half rests on an agent reporting success:
  1. **Skills.** The set of `pdlc/skills/*/SKILL.md` **set-equals** L-10's fifteen names, and each
     path resolves from the engine's skill catalogue. "Loads and runs when invoked" is not asserted
     here — it has no observation short of running every skill, and AT-3.1 already exercises the
     dispatch path.
  2. **Hooks.** Each of L-4's four surviving entries is run against a synthetic payload and emits
     its **named observable on its own channel**: the harvest guard writes its refusal message,
     naming the missing LEARNINGS file, to **stderr** and exits **2** (the PreToolUse blocking
     payload); the scope-field warning and the REQ-size warning each arrive as the
     `hookSpecificOutput.additionalContext` string of a **stdout JSON object** with exit **0**,
     naming the missing `Scope:` field and the exceeded budget respectively; the consolidation
     nudge arrives the same way as SessionStart context, naming the stale LEARNINGS count. Channel,
     exit status and message text are all part of the assertion — a harness that expects a warning
     on stderr with a non-zero exit fails three correct hooks.
- **AT-3.4** (AC-3.4) *Who:* a Ptah-configured consumer. *Given* HEAD, *when* each configured
  skill path is resolved, *then* every path exists.
- **AT-3.5** (AC-3.5 — regression guard) *Who:* operator. *Given* the published engine of BL-07
  and the **post-sweep** plugin version inside its declared range, *when* the engine dispatches a
  skill, *then* it reads that skill from the installed plugin and the run report carries both
  versions; no engine-side snapshot exists to skew against the plugin.
- **AT-3.6** (AC-3.6 — regression guard) *Who:* operator. *Given* the plugin installed at a
  version outside the engine's declared range, *when* they invoke the engine, *then* it refuses
  before dispatching any skill, performs no pipeline action, and the invocation's terminal output
  — banner plus refusal together — carries engine version, plugin version and expected range; the
  run report carries the same three (BR-VER-3).

### 6.4 Consumer cleanup

- **AT-4.1** (AC-4.1) *Who:* operator in a repo that previously hosted the runtime copy. *Given* a
  `.claude/workflows/` holding **every** L-11 entry, its `.pdlc-backups/` directory non-empty,
  *when* the cleanup runs once, *then* all nine are gone, backups directory with its contents,
  the directory left empty by that removal is gone, the repo's tracked files are unchanged, and
  the step exits `0` reporting each path it removed. Second construction, same expected outcome:
  the copy present with **no** drift-state record (a consumer that never enabled the hook) —
  the missing record is not an unexpected entry and does not trigger a refusal (§3.5 step 1).
- **AT-4.2** (AC-4.2) *Who:* same operator. *Given* the cleanup has already run, *when* it runs
  again, *then* it succeeds, changes nothing and says so.
- **AT-4.3** (AC-4.3) *Who:* the same operator. *Given* the target directory built as AT-4.1
  builds it — holding **every** L-11 entry — **plus** one unexpected file, a name the retired
  channel never installed and no L-11 member, neither `orchestrate-dev.js` nor
  `orchestrate-queue.js` — *when* the cleanup runs, *then* all four hold: (a) **every L-11 entry
  is still present** and byte-identical (compared by content, before and after), so a run that
  deleted some expected entry before refusing reds this test; (b) the unexpected file is still
  present and byte-identical; (c) its path is named on **stderr**; (d) the exit status is exactly
  **`3`** — the value BR-CLN-4 fixes. "Non-zero" is not the oracle: `127` for a missing
  interpreter would satisfy it while proving the step never ran. Presence of the survivors is
  asserted positively, not inferred from the absence of a diff, because a directory holding only
  the unexpected entry passes a not-modified check vacuously. Second construction, same expected
  outcome: the unexpected entry is a `.pdlc-tmp.<pid>.<rand>` residue the retired channel itself
  left behind when a write was killed mid-rename (E-16b) — it is refused on the same four clauses,
  so the refusal class covers channel-written junk as well as operator files.
- **AT-4.4** (AC-4.4) *Who:* a consumer repo owner who never adopts the cleanup. *Given* the
  leftovers remain, *when* they run a feature through the engine, *then* the run reaches its
  configured final phase; the **artifact compared** is the engine's run report as written at its
  reported path (the same artifact AT-5.2 compares, named by path and commit in the evidence);
  that report's **field set** equals the field set of the same feature's run in a repo with no
  leftovers, values compared only over AT-5.2's stable subset; and no line of the run's output and
  no report field names a leftover path. Two runs are required to falsify it, and both are part of
  the evidence.

### 6.5 Nothing deleted was load-bearing

- **AT-5.1** (AC-5.1) *Who:* operator. *Given* every deletion merged, *when* a real feature runs
  end-to-end through the engine in this repo, *then* it completes through its configured final
  phase and produces the same artifact classes as before — spec files, cross-reviews with verdicts
  and anchors, queue-row writes and a final report.
- **AT-5.2** (AC-5.2) *Who:* operator. *Given* that run's report and the pre-sweep baseline report
  committed under BL-08 (both cited by path and commit), *when* the two are compared, *then*:
  1. their **field sets are equal** over the whole report — an added or removed field fails, and
     this is the clause that discharges "no field, phase or gate disappeared with the deleted
     machinery"; and
  2. **values** are compared over a **stable field subset only**, named in the TSPEC's
     comparison list. Excluded from value comparison, because they differ between any two
     *correct* runs: the feature name, timestamps, ids and paths already enumerated upstream, the
     two **version-provenance** fields (BR-VER-1 permits a `0.23.x` bump, and BL-07's branch ships a
     new engine release), and the report's **eight run-variable collections** as REQ AC-5.2
     enumerates them exhaustively — the per-dispatch auth-source rows (`authSources`), the startup
     ladder (`startup`), the dispatch counts (`dispatches`), the retry, pause and denial logs
     (`retries`, `pauses`, `denials`), the loop record (`loop`) and the outcome counts
     (`outcomes`) — each compared for presence and shape, never for value.

  Stated this way because whole-report value equality is unachievable by construction: a test
  written for it fails on a correct sweep, so the gate could not pass rather than being a strict
  one. The excluded set here is exactly REQ AC-5.2's enumerated allowed-difference set at v0.11 —
  no field is exempted here that the REQ does not exempt, and none it exempts is value-compared here.
- **AT-5.3** (AC-5.3, G-5) *Who:* operator. *Given* HEAD after the sweep, *when* the probe CLI is
  invoked at its surviving repo path, directly, in a checkout of the consuming project, *then* it
  answers exactly as before and is still produced by a build step rather than maintained by hand.

## 7. Open Questions

Each row names where it is resolved and who owns it. A row with no owner would be a blocking gap,
not a note.

| # | Item | Owner / resolution |
|---|---|---|
| O-A | **BL-03's adoption evidence is not citable at HEAD.** No run report is tracked in the repo at `b3f24fc6`. C-1's four thresholds are operator-judged and the reports are operator-captured | **Operator**, before the first deletion commit. The report paths and commits are transcribed into this FSPEC at C-6 re-measurement time (REQ BL-03) |
| O-B | **BL-08's pre-sweep report and gate transcript are not yet captured.** Both are uncapturable after the sweep starts | **Operator**, at §3.0 step 4; committed at fixed paths in `docs/pdlc-plugin-retirement/` and cited by path + commit here |
| O-C | **Which surviving directory holds the probe CLI's build after `dist/` retires** | **TSPEC** (REQ O-3). REQ v0.11 settles the manifest branch: the manifest does not survive, so AC-1.1's set-equality of the `dist/` entry set with `{M-9}` holds without exception. This FSPEC pins AC-1.3's literals only; see §1.2 |
| O-D | **Phase MERGE's self-modification guard paths** once `pdlc/workflows/` and `.claude/workflows/` change meaning or cease to exist | **TSPEC** (REQ O-4); if the resolution needs engine-side change it binds to a successor REQ under NG-5 |
| O-E | **Which surviving modules host the re-homed queue-triage and hook-manifest assertions** (L-6's rows) | **TSPEC** decides placement; the module names **and the re-homed assertion titles** are transcribed into L-6 at re-measurement time |
| O-F | **BL-05's disposition of `QUEUE.md` row 8 (`pdlc-release-ci`)** | **Operator**, decided upstream per `pdlc-engine-distribution` O-3. AT-2.3 refuses to pass while the row still mandates the retired channel |
| O-G | **Whether the sweep ships a `0.23.x` plugin version or waits on a widened engine release** (BR-VER-1) | **Operator** chooses; either branch satisfies BL-07, and the choice is recorded in the TSPEC before the first deletion commit |

### 7.1 Assumptions

Numbered `ASM-n` so that `A-1` in this document always means the baseline's retired-name
allow-list (§4.2 preamble), never an assumption of this FSPEC.

| # | Assumption | Veto path |
|---|---|---|
| ASM-1 | The **rendered check** of `fixture-machine.yml` survives the sweep unchanged — it names no retired artifact at the base commit (verified by L-3's search over that file). Its comment header is edited in class 1 for the count word alone (BR-DOC-1a); no `name:` key, trigger or step changes | If a retired name lands in the file before the sweep, L-7's post-sweep set and BR-DOC-1's count word change |
| ASM-2 | Re-homed assertions land in modules that already exist, so L-5's post-sweep count is 119 − 22 = 97 | If the TSPEC creates a new module for them, L-5 is corrected at re-measurement, not loosened |
| ASM-3 | The consumer cleanup ships as an operator-invoked step in the plugin's script surface; its exit convention follows the retired sync tooling (BR-CLN-4) | Its form and home are the TSPEC's; the behaviour of §3.5 and §4.5 binds whatever form is chosen |
| ASM-4 | The delegator skills invoke the engine's installed CLI entrypoint (`pdlc`, `pdlc/engine/bin/pdlc.mjs` at the base commit); the resolution mechanism is the TSPEC's | If the engine's invocation surface changes, BR-DEL-1…4 still bind |

### 7.2 Upstream errata — resolved

The three defects this FSPEC raised against `REQ-pdlc-plugin-retirement.md` v0.9 were folded
in upstream and are **closed**; REQ v0.12 (2026-08-18) is the version this FSPEC now traces.
No criterion was relaxed in the FSPEC to work around any of them.

| # | Raised against | Resolution in REQ HEAD |
|---|---|---|
| 1 | AC-1.1 / O-3 — whether the manifest (M-6) survives for the probe CLI's build | O-3 states the manifest does **not** survive; AC-1.1's set-equality with `{M-9}` stands unopposed. Only *which* surviving directory holds the build is still open (O-C, TSPEC) |
| 2 | AC-5.2 — allowed-difference set too narrow to be passable | AC-5.2 now enumerates the provenance fields **and** the report's eight run-variable collections, compared for presence, not content |
| 3 | AC-4.3 — asked the cleanup to detect a *hand-modified* file no post-sweep artifact can decide | AC-4.3 keeps the unexpected-entry case, states the post-refusal directory state, and C-9 drops the hand-edited clause it contradicted |

### 7.3 Downstream errata — accepted

Three TSPEC §6.1 errata are folded in here (v0.8); no other erratum edits this
document.

| # | Raised as | Edit made here |
|---|---|---|
| erratum 3 | `consolidate-learnings` loses its only execution host in class 7; M-11n's rewrite has nothing to name | Disposed in §3.3 step 4; class 11 amended |
| erratum 5 | Class 10 listed the wave-gate config **values** as retired; both stay valid | Class 10 is now **prose only**; its assertion tightened to set-equality |
| TSPEC §6.1 erratum 9 | AT-1.3 / BR-SWEEP-6's "no skipped or pending test at all" has no satisfying runner once TT-1b's root-conditional `chmod 000` arm exists — and capability-gated skips already register on a root runner at HEAD, so the wider clause was already false | AT-1.3 and BR-SWEEP-6 now scope the prohibition to the **swept surface** (M-8's deleted modules and the hosts of R-8's re-homed assertions) and exempt a skip that reaches the run's **skip sink records**; the exemption is not keyed to `SKIP_INVENTORY` membership, because that inventory is deliberately not closed over registered skips. REQ AC-1.3 and C-8 are M-8-scoped, so this clause is no wider than upstream's *skipped-test* conjunct; AC-1.3's separate "present and passing" conjunct still binds re-homed hosts (SE v9 F-01). REQ needs no edit |
| SE FSPEC v8 F-04 | Membership-only exemption lets the inventory be widened to buy a green gate without any skip firing | Not folded in as written: HEAD's comparator deliberately does not close over inventory membership, so an inventory-join clause would fail correct skips. The exemption is keyed to sink records instead; whether the sink comparator additionally pins a join, and how, is routed to TSPEC §5.5 |
