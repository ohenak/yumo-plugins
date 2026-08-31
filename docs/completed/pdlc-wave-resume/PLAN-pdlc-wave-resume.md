# PLAN — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | se-author |
| Version | 1.6 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → **PLAN** |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-test-engineer-PLAN-v1.md`, `CROSS-REVIEW-product-manager-PLAN-v4.md`, `CROSS-REVIEW-test-engineer-PLAN-v4.md`, `CROSS-REVIEW-product-manager-PLAN-v5.md`, `CROSS-REVIEW-test-engineer-PLAN-v5.md` |
| LEARNINGS | `docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md` |

**Revision history.**

| Version | Change |
|---|---|
| 1.0 | Initial authoring. |
| 1.1 | Round-1 test-engineer review addressed (F-01 … F-10). Structural change: the three RED/GREEN task pairs are **merged**, so every batch is green-terminal and the runtime's script-owned gate can evaluate it (F-01); `implementation.testCommand` is transcribed as a literal and its resolution is asserted by T-01 (F-02, F-07); T-10 gains the `waveExecution.test.js` manifest row and a delta-scoped coverage oracle (F-03, F-05); §4.3's four mutations gain owning tasks, an execution step and a DoD checkbox (F-04); T-08 pins `numRuns: 500` on its precedent (F-06); the report-row extension carries its `N > 1` condition (F-08); T-01 gains a stated lifecycle and drops the weakened AT-14 restatement (F-09); §1.2's bare line anchors are replaced by content citations (F-10). Ids `T-05`, `T-06` and `T-09` are **retired, not reused** — each was merged into its red predecessor, and keeping the surviving ids stable keeps every round-1 review reference resolvable. |
| 1.2 | **Erratum round (Phase PR).** Corrections only — no decision re-litigated, no scope change, no task restructured. Two **precondition tasks** are added to batch 1, because three document oracles are red in this tree *before* any of this feature's own work starts, and batch 1's gate wording ("the `pdlc/workflows` suite is green") is therefore unsatisfiable as written (PM, TE, SE): **T-11** promotes `docs/pdlc-wave-resume/**` onto A-1's frozen glob list — `A1_GLOBS` in `documentOracles.test.js` plus the matching row in `docs/_constraints/pdlc-retirement-baseline.md` — on the `docs/pdlc-advisory-wave-gate/**` precedent, closing `PROP-SWEEP-2(b)`; **T-12** untracks the machine-local artifacts a mid-pipeline commit added to the index (`.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json`, `pdlc/workflows/coverage/**`), closing the two `.claude/`-tracking oracles. §2.2's batch-1 row, §3.1's edge table, §3.3's manifest and §4.5's DoD carry both. **T-04's fixture rationale is corrected** (PM, TE, and PROPERTIES §Fixtures): the `distribution.checkEnabled: false` opt-out no longer gates anything — the drift gate it addressed is retired from `orchestrate-queue.js` — so the fixture is inert and may be supplied or omitted; it is no longer the *reason* the three-fixture set is complete. The §5.7 `numRuns` divergence raised this round is **absorbed, not applied**: TSPEC v1.4 now pins `numRuns: 500`, which is what T-08 already says. Ids `T-05`, `T-06`, `T-09` remain retired and are still not reused. |
| 1.3 | **Round-5 delta confirmation addressed (PM F-01…F-03, TE F-01…F-05, TE Q-01).** **F-01 (High, both reviewers, unlanded since v4) landed:** §4.3 gains a **fifth** mutation row — suppressing the record write while `explicitPointer` is true, whose only oracle is AT-05's write-side conjunct (TSPEC §5.5 mutation 5) — owned and *run* by T-07, and the five count claims are corrected (§4.3 heading, §1.1's trade paragraph, T-07's mutation duty `rows 1–4` → `rows 1–5`, RK-1, §4.5's DoD checkbox). No new task, no batch move, no `Deps` change; parser re-run confirms 9 tasks and the same four batches. **PM F-02/F-03 and TE F-03:** §3.4's `Coverage floor` row and §4.4's RK-2 no longer describe an open erratum — TSPEC RT-7 assigns the floor to the last implementation **task** (PLAN T-10, RK-2) and gives PLAN's reasoning back, so both now record agreement; values and mitigations unchanged. **TE F-02:** T-12's `pdlc/workflows/coverage/**` rationale is corrected from diff-noise to the measured one — 94 tracked files (81 under `coverage/tmp/`) that `test:coverage` rewrites, so leaving them tracked reds `PROP-SWEEP-2(a)` during T-10's own batch-4 gate. Action and DoD unchanged. **TE F-04:** T-10's oracle (i), §2.2's batch-4 gate and §4.5's DoD line are scoped to `orchestrate-dev.js`'s per-file branch number `>= 85`, with the whole-command exit **reported, not asserted**, because `c8.include`'s fourth entry (`**/scripts/capture-learnings-baseline.mjs`, `allow-external`) takes the same `--per-file` floor and is outside this feature's reach (TSPEC §5.8). **TE F-05:** §4.6's `Retired ids` row now reports the measured **nine** tasks. **TE Q-01 answered in T-11:** the implementer re-measures the sweep residual at promotion time rather than transcribing the ten counted at v1.2. Also corrected, not raised: §1.2's baseline table is now dated to v1.0 authoring — the OB-F1 rebase has landed (`HEAD..origin/main` → `0`, `WAVE_STATE_PATH` present, baseline file tracked), and T-01 is retained on its stated permanent-gate lifecycle, not as a one-shot check. Ids `T-05`, `T-06`, `T-09` remain retired and unreused. |
| 1.4 | **Round-6 minor changes landed (PM F-01, TE F-01 — both Low, both local).** TE F-01: §4.4 RK-5's T-07 sizing now counts **five** mutation runs, matching §4.3's five-row table — this was the single surviving "four mutation" instance outside the v1.1 revision-history row, where the count is historical and correct. PM F-01: §4.6's preamble no longer cites "1,637 commits behind" — retracted by §1.2's re-dating (`git rev-list --count HEAD..origin/main` → `0`) — and records the parse as re-run after the v1.3 edit; the parser cited is the shipped one at `origin/main`, byte-identical to this tree's copy. Every row of §4.6's table is unchanged. No task, batch, `Deps`, oracle or parse-result change. |
| 1.5 | **Phase CR round 1 addressed (PM F-01 High; TE F-04 Medium).** PM F-01: T-10's two oracles are landed rather than described. §4.5.1's mapping table no longer carries `*(filled in by T-10…)*` placeholders — every branch class names the tests that cover it — and the table's own completeness is checked by `waveResumeRepoState.test.js` › `PLAN §4.5.1's delta coverage map is complete` (branch-class set-equality, no-placeholder, and every named test title present in the file the row names). Oracle (i) is measured at **88.90 %** per-file branches for `orchestrate-dev.js` (the 88.88 % on the same c8 table is the `All files` aggregate, not this file's row); oracle (ii) ships as `pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`, wired as the third step of `npm run test:coverage` so the `Unit tests (ubuntu-latest, node 20)` required check gates it. On first run it found one uncovered line inside the feature's ranges — the report row's `self-report gate` ternary arm — closed by a new `waveExecution.test.js` case; it now reports **0**. TE F-04: `coverageInstrumentation.test.js`, `package.json` and the delta script are named in §3.3's manifest and §4.6's `parsePlanOwnership` transcription as T-10's (as is `waveResumeRepoState.test.js`, which T-10's completeness oracle appends to — T-03 owns it in batch 2, `T-10 → T-03` is a real `Deps` edge), and the dist-race retry's bound is now asserted (`raceWindowNeverClosed: false`) instead of only argued. No decision re-litigated, no task added or restructured; the nine ids and four batches are unchanged. |
| 1.6 | **Phase CR round 2 addressed (TE F-08 High; TE F-09, PM F-01 Medium).** TE F-08: `check-wave-resume-delta-coverage.mjs`'s empty-introduced-range case was a hard failure, so the gate — chained into the required `Unit tests (ubuntu-latest, node 20)` check — would have gone permanently red on `main` the moment this feature merged. An empty delta is now a **success** ("no delta in range"); the subject absent from the checkout, a missing coverage artifact and a subject missing from the report stay fail-closed. §4.5.1 records the decision that oracle (ii) is permanent rather than feature-duration (TE Q-03). TE F-09: every IO edge of the gate is injected and it returns an exit code instead of calling `process.exit`, so `waveResumeDeltaGate.test.js` (new, T-10, batch 4 — §2.1, §3.3, §4.6) drives all four exit paths plus the positive path, first case being F-08's own; it also pins `PINNED_BASE_SHA`'s ancestry (TE Q-04). TE F-10/F-11 (Low): the gate warns rather than fails on an uncommitted subject (a fail would block the local edit-and-run loop CI never hits), and the `waveResume*` census now also equals a transcribed literal set of six suite names, so a matched-pair deletion reds. PM F-01: §4.5's boxes are reconciled against observed evidence and §2.1's status column marks the nine landed tasks ✅; three boxes stay unticked **with reasons**, and the ticking convention (a Phase DOD act, not a per-task one) is written down (PM Q-02). PM F-02 (Low): the gate's header names the correct neighbouring `test:coverage` step. No decision re-litigated; the nine task ids and four batches are unchanged. |

## 1. Overview

### 1.1 What is being built

TSPEC §1.2 scopes this feature to **eleven delta rows (D-1 … D-11)** against a mechanism that
already ships on the default branch. Nothing here designs a second resume mechanism; the work is
(a) one behaviour-preserving extraction, (b) two announcement changes, (c) one comment
replacement, (d) one constraints-file promotion, and (e) the test suites that make the ratified
contract falsifiable.

| Delta | Landed by |
|---|---|
| D-1 remove the INTERIM commentary, cite the TSPEC | T-02 |
| D-2 provenance token on every announcing outcome | T-07 |
| D-3 resume point + provenance on the executed Phase I report row | T-07 |
| D-4 keep the `{}` read tolerance, add no writer (DEC-WVR-04) | T-02 (asserted; no code change) |
| D-5 extract the decision as a pure classifier; add the set-equality suites | T-02 (suite **and** code, in that order within the task) |
| D-6 EC-15a discriminating test (early write succeeds, later write fails) | T-07 |
| D-7 the ignore-rule assertion | T-03 |
| D-8 queue/direct parity | T-04 |
| D-9 this PLAN claims the record in no wave's owned-path set | T-03 (§3.3 is the subject) |
| D-10 `M-WVR-1..2` in `docs/_constraints/pdlc-wave-gate-baseline.md` | T-03 |
| D-11 the three shipped whole-string assertions | T-07 |

**Why one task lands both halves of D-5 and of D-2/D-3.** v1.0 split each red suite from the green
code that satisfies it, which put two batches in a state the runtime cannot evaluate (round-1 F-01).
The split is now internal to the task: each merged task writes its failing tests **first**, observes
and records the RED, then writes the code that turns it green. §2.3 states the trade that makes
this legitimate — the same trade T-04 already made in v1.0 — and §2.2's gates are green-terminal
throughout.

### 1.2 The one precondition this PLAN is built around

REQ BL-04 / FSPEC OB-F1 / TSPEC §6.2 were **not met in this tree** at v1.0 authoring time, and
that was verified rather than assumed. The table below is that measurement, kept as the record of
why T-01 exists — **it is no longer the tree's current state:** the OB-F1 rebase has since landed on
this branch (re-measured at v1.3: `git rev-list --count HEAD..origin/main` → `0`;
`grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` → `10`;
`docs/_constraints/pdlc-wave-gate-baseline.md` present; `.gitignore:46` carries
`/.claude/pdlc-wave-state.json`; `pdlc/workflows/package.json` defines `test:coverage` with
`--per-file --branches 85`). T-01 stays, and stays first, for the lifecycle reason stated in its
row: it is a permanent gate against a later drift or de-rebase, not a one-shot check that this
re-measurement discharges.

| Fact | Command run in this tree (at v1.0 authoring, pre-rebase) | Result |
|---|---|---|
| The branch is behind the default branch | `git rev-list --count HEAD..origin/main` | `1637` |
| The shipped mechanism is absent here | `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` | `0` |
| The wave-gate baseline is absent here | `ls docs/_constraints/` | no `pdlc-wave-gate-baseline.md` |
| The ignore rule is absent here | `grep -n 'wave-state' .gitignore` | no match; the only `.claude`-anchored rule present is `/.claude/workflows/` |
| `fast-check` / `c8` / `test:coverage` are absent here | `grep -nE '"test\|fast-check\|c8' pdlc/workflows/package.json` | only `test` and `test:watch` |

All five are present at `origin/main` (`345ae358`), verified by name:
`WAVE_STATE_PATH`, `parseWaveLedger`, `computePlanHash`, `formatWaveLedger`, `writeWaveLedger`,
`headCorroborated` and `IMPLEMENTATION_DEFAULTS` all resolve in
`git show origin/main:pdlc/workflows/orchestrate-dev.js`; `classifyWaveLedger` and
`RESUME_OUTCOMES` resolve **nowhere** (they are this feature's new exports);
`docs/_constraints/pdlc-wave-gate-baseline.md` is tracked; `.gitignore` carries the verbatim line
`/.claude/pdlc-wave-state.json` in the same block as `/.claude/workflows/`; and
`pdlc/workflows/package.json` defines the `test:coverage` script with `--per-file --branches 85`
alongside the `c8` and `fast-check` devDependencies. Cited by content rather than by line number
on purpose (DEC-DOC-01): every one of these anchors would move under the rebase this section is
about, and the content is what the claim is.

**Consequence for this PLAN, and it is structural, not a caveat.** TSPEC §5.4 AT-14 and §6.2 OB-F1
state that in wave mode a red gate halts the wave *and every wave after it*, so the wave carrying
AT-14 must not be dispatched before the rebase. This PLAN discharges that mechanically rather than
in prose: **T-01 is the first task, it is a pre-flight gate over exactly those baseline facts, and
every other task depends on it** (directly or transitively). A pre-rebase run therefore fails at
T-01 — the cheapest possible wave, and the whole of batch 1 — instead of at T-03's ignore-rule
assertion a wave later.

### 1.3 Scope boundaries this PLAN inherits

- The extraction is **behaviour-preserving** and lands alone, before any announcement change
  (TSPEC RT-2). T-02 leaves `pdlc/workflows/__tests__/waveExecution.test.js` byte-unchanged; that
  shipped `describe` block *is* the extraction's regression net, and a task that edits its net in
  the same diff has no net.
- The record is **consumer-local and untracked**. It appears in no task's owned-path set and in no
  `implementation.postWavePathspecs` value (§3.3, FSPEC OB-F6, TSPEC AT-17).
- Phase PT's V-wave is outside this feature's scope (TSPEC §1.3); no task changes it.
- `pdlc/workflows/dist/` is **generated**. No task owns it; it is carried per wave by
  `implementation.postWavePathspecs` (§3.4, TSPEC RT-5).

## 2. Batches

**Status key:** ⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

**`[Fake first]` convention.** This feature adds no production test doubles: TSPEC §5.2 reuses the
shipped `makeLedgerArgs` / `ledgerWrites` / `PLAN_THREE_WAVES` / `CONFIG_WITH_TEST_COMMAND` harness
(all four resolve in `git show origin/main:pdlc/workflows/__tests__/waveExecution.test.js` — 18, 7,
9 and 29 occurrences respectively). The two harness *extensions* H-1 and H-2 are the only
double-shaped work, and they are additive, default-off, and owned by T-07 together with the file
they live in. Rows that create a test double or a test-only fixture ahead of the production code
they exercise are marked `[Fake first]`. Since v1.1 that precedence is **within** the marked task —
its test half is written, run and committed before its code half (§2.3) — and, where the component
crosses tasks, still through a real `Deps` edge (`T-07 → T-02`, `T-10 → T-07`), never through id
order.

### 2.1 Task table

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-01 | **Pre-flight gate (BL-PREREQ) and run-precondition gate.** Two obligations, both cheap, both permanent. (a) *Baseline existence at HEAD:* `WAVE_STATE_PATH`, `parseWaveLedger`, `computePlanHash`, `formatWaveLedger`, `IMPLEMENTATION_DEFAULTS` exported from `orchestrate-dev.js`; `docs/_constraints/pdlc-wave-gate-baseline.md` tracked; `pdlc/workflows/package.json` carrying `test:coverage`, `c8` and `fast-check`. Existence only — never the new shape T-02 creates. **No `.gitignore` arm here:** AT-14's ignore-rule conjunct belongs to T-03 in its strict form, and a second `includes`-shaped restatement would be exactly the weakening T-03 forbids (round-1 F-09). (b) *The gate is script-owned (round-1 F-02):* assert that `.claude/pdlc.config.json`'s resolved `implementation.testCommand` **string-equals** the literal transcribed in §3.4. The file is untracked, so the arm is guarded: absent ⇒ assert `process.env.GITHUB_ACTIONS === "true"` (a fresh CI clone legitimately has no consumer config), so a *locally* missing or drifted config still reds instead of passing vacuously. The positive half — Phase I's report naming `script-owned gate` and emitting no degradation notice — is a DoD observation (§4.5), because it is a property of the run, not of the tree. **Lifecycle (round-1 F-09):** permanent, and not tautological after the rebase — (a) reds if a later change removes a symbol this feature's classifier depends on, (b) reds on config drift before any wave is dispatched. Absent symbol ⇒ blocking work (the rebase OB-F1 owes), promoted before any dependent task runs. | `pdlc/workflows/__tests__/waveResumePreflight.test.js` *(new)* | — *(gate only, no production source)* | 1 | — | ✅ |
| T-02 | `[Fake first]` **Pure-unit suite, then the extraction (D-5, D-1, D-4).** *Red half, written and committed first within the task:* `classifyWaveLedger` over all eight rows of TSPEC §3.2's guard table; transcribed set-equality over `RESUME_OUTCOMES`, `RESUME_PROVENANCE`, `Object.keys(WAVE_IGNORE_REASONS)` (seven codes) and `Object.keys(IMPLEMENTATION_DEFAULTS)` (four keys); `parseWaveLedger`'s three arms with their exact shipped sentences, including the three no-record literals `null`, `""`, `"{}"` each returning exactly `{state: null, reason: null}` (D-4, IG-6's closure home); `formatWaveLedger`'s two shapes; one unit case per reason renderer from a transcribed `ReasonContext` literal. Every expectation transcribed from TSPEC §3.1/§3.2 — never read back out of the module (§4.2). *Green half:* in `orchestrate-dev.js` add the three frozen catalogues (`RESUME_OUTCOMES`, `RESUME_PROVENANCE`, `WAVE_IGNORE_REASONS`) and `ANCESTRY_INDEPENDENT_CODES`; add `classifyWaveLedger` implementing §3.2's ordered guard table; rewire `main()`'s inline chain to the optimistic-then-reclassify lazy-probe protocol of §2.2; replace the INTERIM commentary with the formalised contract citing the TSPEC (D-1, comment-only). **No announcement or report text changes in this task.** **Regression-net invariant (RT-2): `waveExecution.test.js` is byte-unchanged by this task and green** — mechanically checked in §2.2's batch-2 gate. **Mutation duty (§4.3 row 1, unit half):** apply, observe RED, revert, record. **ATs:** AT-02 (unit half), AT-03 (unit half), AT-08 (iii), AT-13 (unit half). | `pdlc/workflows/__tests__/waveResume.test.js` *(new)* | `pdlc/workflows/orchestrate-dev.js` | 2 | T-01 | ✅ |
| T-03 | `[Fake first]` **Repo-state suite, then the constraints promotion (D-7, D-9, D-10).** *Red half first:* AT-14's three conjuncts — a line **equal** to `/.claude/pdlc-wave-state.json` in `.gitignore`; the leading `/` asserted on that matched line (root-anchored, per the rationale the sibling `/.claude/workflows/` rule records in the same block); `git check-ignore -v .claude/pdlc-wave-state.json` resolving to **that** line, not a broader pattern. Plus AT-17's finite check over **this PLAN**: no row of §3.3's ownership manifest and no `implementation.postWavePathspecs` value names `WAVE_STATE_PATH` (D-9, OB-F6). Plus the `M-WVR-1` / `M-WVR-2` presence assertion over `docs/_constraints/pdlc-wave-gate-baseline.md`. Forbidden weakenings, named so a reviewer can check them: no `some(line => line.includes(...))`, no "no churn observed". *Green half:* append a **new `## 5`** to `docs/_constraints/pdlc-wave-gate-baseline.md` at the next unoccupied number and next unoccupied ids, carrying `M-WVR-1` (replay cost: 7 no-op dispatches over waves 1–3 of a 16-wave plan) and `M-WVR-2` (a completed task may legitimately produce no commit; stray agent commits observed), each with a Measured-by command; bump the file's `Version` to the next version **above whatever is found at promotion time** (found at `origin/main`: `1.2 · 2026-08-20`, sections through `## 4`, ids through `M-WG-14` ⇒ `## 5`, `1.3`); the new section states the version it was checked against and records that `M-WG-6` was **reviewed and left**, not missed. **ATs:** AT-14, AT-17 (repo-state half). | `pdlc/workflows/__tests__/waveResumeRepoState.test.js` *(new)* | `docs/_constraints/pdlc-wave-gate-baseline.md` | 2 | T-01 | ✅ |
| T-04 | **Queue-parity suite (characterisation).** AT-16 exactly as DEC-WVR-07 scopes it: (i) `orchestrate-queue`'s `_runPipeline` is left at its default and that fact is asserted; (ii) the delegation payload's key set is asserted `toEqual(["reqPath"])` against a spy; (iii) the direct run's `_readFile` call list, filtered to the ledger path, compared for string equality against `WAVE_STATE_PATH`. Fixtures, corrected in v1.2 against the retirement TSPEC AT-16 still records: **two** are required — a `QUEUE.md` with one `pending` row for this feature, and a Phase-0 readiness-triage `_agent` double. The third, a `.claude/pdlc.config.json` carrying `distribution.checkEnabled: false`, is **inert and optional**: the distribution drift gate that opt-out addressed has been retired from `orchestrate-queue.js` (`git grep parseDistributionCheckEnabledOptOut origin/main` resolves only under `docs/completed/**`, and `orchestrateQueue.test.js` asserts the module source contains neither `"distribution" + ".checkEnabled"` nor `"DRIFT_STATE" + "_PATH"`), so it cannot be the reason the fixture set is complete. Supplying it is harmless; citing it as a precondition is a false premise, and an oracle resting on it guards nothing (PROPERTIES §Fixtures, routed here as an erratum). Green on write against shipped `orchestrate-queue.js` — it is a **regression net over a boundary this feature must not move**, and the falsification arm (forward any additional key ⇒ (ii) reds while AT-01..05 still pass) is executed and recorded in the task's report. **ATs:** AT-16. | `pdlc/workflows/__tests__/waveResumeQueueParity.test.js` *(new)* | — | 2 | T-01 | ✅ |
| T-07 | `[Fake first]` **The integration suite, sole owner of `waveExecution.test.js`, then the announcements (D-2, D-3, D-6, D-11).** *Red half first, three parts:* (a) harness extensions **H-1** (optional `events` array; both the `_runCommand` and `_git` doubles append `["runCommand", cmd]` / `["git", …argv]`; existing per-double logs unchanged) and **H-2** (optional `failWriteOn(path, callIndex)` predicate; default keeps the current always-capture behaviour) — both additive and default-off, so with neither supplied `makeLedgerArgs` returns exactly what it returns today; (b) the **three** whole-string assertion updates TSPEC §2.4 enumerates, each to the new string transcribed as a literal, **no matcher relaxed**, no other assertion in the ledger `describe` touched; (c) every new integration case of TSPEC §5.4 — AT-01, AT-02 (per-code runs incl. IG-6's positive conjunct), AT-03 (`merge-base` call lists `toEqual([])` / `toEqual([[…]])`), AT-04 (H-1 interleaving), AT-05, AT-06, AT-07, AT-08 (i)(ii), AT-09 + companion, AT-10, AT-11, AT-12 (four conjuncts), AT-13 announcement-table set equality, AT-15 arms 1 and 2 (H-2; D-6), AT-17 integration half, AT-18 — plus the one arm owed to the existing `describe("computePlanHash — the ledger's plan fingerprint")`: hashing the same PLAN **text** twice through `parsePlanTasks`/`computeWaves` (extended in place, never duplicated). *Green half:* in `orchestrate-dev.js` append ` (provenance: operator-set)` / ` (provenance: automatic)` to each of the five announcing rows of TSPEC §2.4 — **after the sentence's terminal punctuation and outside every existing parenthesis**, never interpolated — leaving the IG-6 row silent and leaving the config-validation `is not a valid value` notice untouched (the one excluded notice, named in §2.4); and change the executed Phase I `✅` row's detail **only in the `N > 1` case**, to TSPEC §2.4's `Waves N–M complete, waves 1–(N-1) skipped as previously completed (wave mode, {gate}) (provenance: {p})` — a run starting at wave 1 keeps the shipped `All M waves complete (wave mode, {gate})` string verbatim, which is what holds the shipped-assertion count at three (round-1 F-08). The `⏭` row gains ` (provenance: automatic)` outside the existing parenthesis so `toContain("recorded green (wave ledger)")` still passes. Per-wave skip lines and the operator banner's shipped sentence body unchanged. **Mutation duty (§4.3 rows 1–5, including row 5's suppressed write on operator-pointed runs, whose only oracle is AT-05's write-side conjunct):** apply each, observe RED against the named oracle, revert, record. | `pdlc/workflows/__tests__/waveExecution.test.js` *(existing, at `origin/main`)* | `pdlc/workflows/orchestrate-dev.js` | 3 | T-02 | ✅ |
| T-08 | **Generative property suite.** `fast-check@^4.9.0` (already a devDependency at `origin/main`), split into its own file on the precedent of `pdlc/workflows/__tests__/advisoryHelperProperties.test.js`. P-1 round trip, P-2 reader totality, P-3 classifier totality, P-4 hash discrimination — with P-4's bounded-corpus caveat stated in the suite. `fc.assert(fc.property(…), { numRuns: 500 })` — the depth the cited precedent pins for its own generative block (`const runs = { numRuns: 500 }` in `describe("PROP-CTR-05 (generative): citesGateOutput …")`, applied at five `fc.assert` sites there; the file's other properties take fast-check's default). Round-1 F-06 is right that a plan citing that file as its model must not run 5× shallower than the block it is modelled on, and P-1…P-4 are the same kind of law, so all four are pinned at 500; no pinned seed, one `describe` per subject, law named in the title (`TOTALITY:`, `ROUND-TRIP:`). **ATs:** none directly; this is the law-level net behind AT-02/AT-13 and TSPEC §5.7. | `pdlc/workflows/__tests__/waveResumeProperties.test.js` *(new)* | — | 3 | T-02 | ✅ |
| T-10 | **Coverage floor and delta-scoped coverage oracle (RT-7, TSPEC §5.8).** Run `npm run test:coverage` from `pdlc/workflows` (`--per-file --branches 85`) and close every gap this feature opened, in **both** files this task owns: pure-unit arms in `waveResume.test.js` for the eight classifier arms, the seven renderer closures and the lazy-probe short-circuit; integration arms appended to `waveExecution.test.js` for the announcement and report branches, which live in `main()` and are reachable only through `makeLedgerArgs` (round-1 F-03). Owning `waveExecution.test.js` in batch 4 is legal under rule 2 — T-07 owns it in batch 3 and `T-10 → T-07` is a real `Deps` edge. **Two oracles, because the floor alone cannot see this feature (round-1 F-05):** (i) the whole-file floor, **scoped to this feature's module** — `npm run test:coverage` is run and c8's per-file branch number for `orchestrate-dev.js` is asserted `>= 85`; the *whole-command* exit status is **reported, not asserted**. Scoped this way on purpose: `c8.include` in `pdlc/workflows/package.json` carries four entries, and the fourth — `**/scripts/capture-learnings-baseline.mjs`, outside `pdlc/workflows/` and the reason `allow-external: true` is set — covers no code this feature touches, yet `--per-file` applies the 85 floor to it independently (TSPEC §5.8 discloses exactly this). A non-zero exit caused by drift in an unrelated included module would then be a failure T-10 cannot fix and this feature did not cause; asserting the per-file number keeps the oracle falsifiable by this feature's own work while the reported exit status still surfaces the wider red for whoever owns it; (ii) the delta oracle — report c8's per-file **uncovered line list** for `orchestrate-dev.js` and assert that no uncovered line falls inside the line ranges this feature introduced, against the transcribed mapping table of §4.5.1 (each classifier arm, each renderer, the short-circuit, and each announcement/report branch → the named test that covers it). A deleted case fails the set-equality of that table rather than moving a percentage by 0.05. | `pdlc/workflows/__tests__/waveResume.test.js`, `pdlc/workflows/__tests__/waveExecution.test.js`, `pdlc/workflows/__tests__/waveResumeRepoState.test.js`, `pdlc/workflows/__tests__/coverageInstrumentation.test.js`, `pdlc/workflows/__tests__/waveResumeDeltaGate.test.js` | `pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`, `pdlc/workflows/package.json` | 4 | T-07, T-08, T-03, T-04 | ✅ |
| T-11 | **Retirement-sweep glob promotion — precondition, not a delta (added v1.2).** This feature's own tracked artifacts quote the retired `distribution.checkEnabled` key *while documenting its retirement*, so they hit `L2_TERMS` and `PROP-SWEEP-2(b)` is **already red in this tree**, before any task below runs. Measured at v1.2 authoring time, the residual is ten paths, all under `docs/pdlc-wave-resume/`: `TSPEC-`, `PLAN-`, `PROPERTIES-` and seven cross-review files. Add `"docs/pdlc-wave-resume/**"` to `A1_GLOBS` in `documentOracles.test.js` **and** the matching row to the glob table in `docs/_constraints/pdlc-retirement-baseline.md` — both, because `PROP-SWEEP-3` asserts every `A1_GLOBS` entry carries a per-file disposition in the baseline, so a one-sided edit trades one red for another. Precedent, cited and followed rather than re-argued: `docs/pdlc-advisory-wave-gate/**`, whose baseline row records the same rationale — the feature's subject matter *is* the retired mechanism, the scope is one feature directory (deliberately not `docs/*/**`), and the set grows one file per cross-review round, which is why the pinned expectation is the empty remainder and never a total. The new row records the same three things: rationale, scope justification, and the measured hit count **at promotion time** — the implementer re-runs the sweep and records what it then returns rather than transcribing the ten above, because the set grows by one file per cross-review round (this row included), and no oracle pins the number either way: `PROP-SWEEP-3` asserts only that the glob entry carries a disposition row. **ATs:** none; this is a wave-gate precondition. | `pdlc/workflows/__tests__/documentOracles.test.js` *(existing)* | `docs/_constraints/pdlc-retirement-baseline.md` | 1 | — | ✅ |
| T-12 | **Untrack the machine-local artifacts already in the index — precondition (added v1.2).** Commit `b1b846bd` on this branch added `.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json` and `pdlc/workflows/coverage/**` to the index. `.gitignore` already carries the rules for all three (`/.claude/pdlc-wave-state.json`, `/.claude/pdlc.config.json`, `coverage/`) — an ignore rule does not untrack what is already tracked, so `git rm -r --cached` on those paths is the whole of this task; **no `.gitignore` edit, and no file deleted from the working tree.** Two document oracles are red on this today and both are named so the fix is checkable, not inferred: `none of the six machine-local artifacts are tracked` and `the only tracked files under \`.claude/\` are the two shared, reviewable ones` (the latter is a **set-equality** over `.claude/`, so it stays red until the tracked set is exactly `pdlc.config.example.json` + `settings.json`). `pdlc/workflows/coverage/**` reds no oracle on a pristine tree, and the reason it is in scope anyway is stronger than diff noise — it gates batch 4. Measured: `git ls-files pdlc/workflows/coverage` returns **94** tracked files, 81 of them under `coverage/tmp/`, and `test:coverage` (`c8 … && c8 report`, `report-dir` `coverage`) deletes and rewrites exactly those. So the moment T-10 runs the floor in batch 4, tracked files disappear from the working tree and the sweep's `grep` over them errors out, reddening **`PROP-SWEEP-2(a)`** as well. Verified in this tree: pristine → 3 document-oracle reds; after `npm run test:coverage` → 4, the extra one being 2(a). Untracking the coverage output is therefore a precondition of T-10's own gate, not tidiness; the diff-noise benefit is real but secondary. **Boundary:** this task must not touch `.claude/pdlc.config.json` in the working tree — T-01 reads it (§3.4) and T-12 removing it would red T-01 outside CI. **ATs:** none; this is a wave-gate precondition. | `pdlc/workflows/__tests__/documentOracles.test.js` *(read only — no edit; T-11 owns the file)* | *(git index only: `.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json`, `pdlc/workflows/coverage/**`)* | 1 | — | ✅ |

### 2.2 Batch composition and gate wording

Batches re-derive mechanically as `batch == max(batch of dependencies) + 1`; sources are batch 1.
The derivation is shown so a reviewer checks arithmetic, not intent.

| Batch | Contents | Paths written (pairwise disjoint) | Gate wording |
|---|---|---|---|
| 1 | T-01, T-11, T-12 | `__tests__/waveResumePreflight.test.js`; `__tests__/documentOracles.test.js` + `docs/_constraints/pdlc-retirement-baseline.md`; *(T-12 writes no file — `git rm --cached` only)* | Full `pdlc/workflows` suite green, **including** T-01, `PROP-SWEEP-2(b)` and the two `.claude/`-tracking oracles. A red T-01 is either the rebase (OB-F1) missing or `implementation.testCommand` drifted from §3.4's literal; both are blocking work, neither is a flaky gate. **Why this batch grew in v1.2:** those three oracles are red in this tree *before* any task runs (measured — §2.1 T-11, T-12), so the gate as written in v1.1 was unsatisfiable and every later batch inherits the same red. T-11 and T-12 have no dependencies and are pairwise disjoint from T-01 and from each other (T-11 owns `documentOracles.test.js`; T-12 touches the index only), so they are batch-1 sources under the same `max(dep batches) + 1` derivation. |
| 2 | T-02, T-03, T-04 | `__tests__/waveResume.test.js` + `orchestrate-dev.js`; `__tests__/waveResumeRepoState.test.js` + `docs/_constraints/pdlc-wave-gate-baseline.md`; `__tests__/waveResumeQueueParity.test.js` | Full suite green, **and** `waveExecution.test.js` byte-unchanged across every commit of this batch (`git diff --stat` over that path is empty — RT-2's regression-net invariant, mechanically checkable). |
| 3 | T-07, T-08 | `__tests__/waveExecution.test.js` + `orchestrate-dev.js`; `__tests__/waveResumeProperties.test.js` | Full suite green, including the three enumerated whole-string assertion updates and every prefix matcher and both `startsWith` negatives TSPEC §2.4 names. Nothing else in the ledger `describe` changed. |
| 4 | T-10 | `__tests__/waveResume.test.js`, `__tests__/waveExecution.test.js` | Full suite green **and** `npm run test:coverage` run from `pdlc/workflows`, with `orchestrate-dev.js`'s per-file branch number `>= 85` (the whole-command exit status reported, not gated — §2.1 T-10 oracle (i)) **and** §4.5.1's mapping table is complete with no uncovered line inside this feature's ranges. |

**Every batch is green-terminal, and that is a deliberate change from v1.0.** v1.0 declared batches 2
and 4 RED-terminal on the strength of rule 3's split gate wording. Round-1 F-01 showed why that does
not survive contact with the runtime: a red script-owned wave gate is a **halt** — `orchestrate-dev.js`
throws ``Wave ${waveNum} test gate failed — `${implConfig.testCommand}` did not pass`` inside the
`if (scriptGate)` branch of the wave loop — the runtime has no notion of a *declared* RED-terminal
wording, and the only documented escape (`implementation.startWave`) is the one setting §3.4 forbids
for this feature. Worse, on a gate failure the wave's agent-authored work survives **uncommitted**
(`pdlc-wave-gate-baseline.md` `M-WG-4`), so the red tests the batch existed to produce would not even
be on the branch when the halt fired. A plan whose happy path requires hand-surgery inside a
script-owned phase is not a plan; so the RED/GREEN split moved **inside** the task, where the runtime
never sees it.

**Batch 1 carries two precondition tasks, and that is not scope creep (v1.2).** Neither T-11 nor
T-12 lands a TSPEC delta row; both exist because a wave gate is a whole-suite gate. A red that this
feature did not introduce halts the wave just as hard as one it did, and three such reds are sitting
in this tree today. The alternative — weakening batch 1's gate to "green except for the three
known reds" — was rejected: the gate is script-owned (§3.4), the script compares an exit code, and
there is no wording the runtime reads. Fixing the tree is the only form the fix can take.

### 2.3 Where red-before-green now lives, and the trade that buys it

Rule 3 makes red-before-green a dependency edge *between tasks*. Merging each pair converts that
edge into an ordering **within** one task: the merged task writes and commits its failing tests
first, runs them, records the observed failure in its task report, and only then writes the code
that turns them green.

| Merged pair (v1.0 ids) | Surviving id | Paths touched, disjoint, which is what makes the merge legal |
|---|---|---|
| T-02 + T-05 | T-02 | `__tests__/waveResume.test.js` / `orchestrate-dev.js` — neither touches `waveExecution.test.js`, so RT-2's byte-unchanged invariant survives intact |
| T-03 + T-06 | T-03 | `__tests__/waveResumeRepoState.test.js` / `docs/_constraints/pdlc-wave-gate-baseline.md` |
| T-07 + T-09 | T-07 | `__tests__/waveExecution.test.js` / `orchestrate-dev.js` |

**The trade, stated rather than hidden.** "The red was observed first" becomes a task-report claim
instead of a batch gate. That is a real loss of mechanical enforcement, and this document already
made exactly the same trade in v1.0 for T-04, whose falsification arm "is executed and recorded in
the task's report". It is bought back three ways: (i) each merged task commits the test half in a
separate commit from the code half, so `git log -p` over the task's two commits shows the red half
landing first — checkable after the fact without trusting the report; (ii) §4.3's five mutations are
now *executed*, which is a stronger statement about the oracles than the ordering of two commits;
(iii) the DoD carries a checkbox for both.

**Why `waveExecution.test.js` is one task and not four.** TSPEC §5.3 makes it a design obligation
on this PLAN: the file is large, heavily shared, and `makeLedgerArgs` is shared by the whole ledger
`describe`, so H-1/H-2 cannot be split from the cases that use them without two tasks appending to
one physical file in one batch. Rule 2 is unenforceable-by-prose for precisely this shape — the
green gate cannot detect last-writer-wins between concurrent agents — so the file has exactly one
owner per batch: T-07 in batch 3, then T-10 in batch 4, strictly downstream through `Deps`.

**Why T-02 and T-07 are two tasks and not one.** They both write `orchestrate-dev.js`, so rule 2
alone would force them apart, but the binding reason is RT-2: an extraction that ships in the same
diff as an announcement change has no regression net, because the net is the very assertion set the
announcement change edits. T-02 is measured against the shipped `describe` block unchanged; only
then does T-07 edit it.

## 3. Dependencies

### 3.1 Dependency edges, and why each exists

Every edge below is a real ordering constraint, not id order. Task ids are written identically in
the `#` column and in `Deps` cells — bare `T-NN`, never bolded in one and plain in the other. Ids
`T-05`, `T-06` and `T-09` are retired by the v1.1 merge and appear in no `Deps` cell.

| Edge | Why |
|---|---|
| T-11, T-12 → *(none)* | Both are batch-1 sources: they depend on nothing this feature builds, and everything else depends on the tree they leave behind. Stating the absence of edges explicitly, rather than by omission, is what makes the `max(dep batches) + 1` derivation for batch 1 checkable. |
| T-01 → *(none, but co-batched with T-11 and T-12)* | T-01's gate is the whole suite, so it cannot pass while `PROP-SWEEP-2(b)` or the two `.claude/`-tracking oracles are red. This is a **gate** relation, not a `Deps` edge: T-01's own assertions do not read anything T-11 or T-12 produces, so forcing a batch split would serialise three independent tasks for nothing. The batch gate is what enforces the joint condition, and it is evaluated once, after all three. |
| T-02, T-03, T-04 → T-01 | §1.2: no task may run before the baseline is proven present and the gate is proven script-owned. T-03 in particular carries AT-14, which is red pre-rebase, and a red gate in wave mode halts the wave and every wave after it. |
| T-07 → T-02 | The integration cases assert on the classifier's resolved outcomes and on the lazy-probe call counts, which do not exist until T-02's green half. It is also rule 2 twice over: T-07 must not append to `waveExecution.test.js` in the batch that proves T-02 left it unchanged, and both tasks write `orchestrate-dev.js`. |
| T-08 → T-02 | P-3 quantifies over `ClassifyInput` and asserts `outcome ∈ RESUME_OUTCOMES`; both symbols are T-02's. |
| T-10 → T-07 | The announcement and report branches are the last branches added; the floor and the delta oracle are measured over the complete diff. It is also rule 2: T-10 appends to `waveExecution.test.js`, which T-07 owns in the previous batch. |
| T-10 → T-08, T-03, T-04 | The floor is measured over the whole suite as it will merge; a suite still missing the property, repo-state or queue-parity files would measure a different number. |

**No cycle.** The edge set is `T-01 → {T-02,T-03,T-04}`, `T-02 → {T-07,T-08}`,
`{T-07,T-08,T-03,T-04} → T-10`, with `T-11` and `T-12` as isolated sources: a DAG whose
topological order is exactly the batch numbering of §2.2.

### 3.2 Prior-phase baseline pre-flight (T-01)

`BL-PREREQ` symbols and files, asserted **present** at HEAD and nothing more — never the shape T-02
creates:

| Subject | Assertion form | Where it lives at `origin/main` |
|---|---|---|
| `WAVE_STATE_PATH`, `parseWaveLedger`, `computePlanHash`, `formatWaveLedger`, `IMPLEMENTATION_DEFAULTS` | importable / present on the module's exports | `pdlc/workflows/orchestrate-dev.js` |
| `docs/_constraints/pdlc-wave-gate-baseline.md` | file exists and is tracked | tracked at `origin/main`; **absent in this tree** |
| `test:coverage`, `c8`, `fast-check` | keys present in the manifest | `pdlc/workflows/package.json` at `origin/main`; **absent in this tree** |
| `makeLedgerArgs`, `ledgerWrites`, `PLAN_THREE_WAVES`, `CONFIG_WITH_TEST_COMMAND` | referenced in the ledger harness | `pdlc/workflows/__tests__/waveExecution.test.js` at `origin/main` |
| `implementation.testCommand` | resolved value **string-equals** §3.4's transcribed literal; when `.claude/pdlc.config.json` is absent, `process.env.GITHUB_ACTIONS === "true"` | `.claude/pdlc.config.json` (untracked, consumer-local) |

The ignore rule is deliberately **not** a row here: AT-14 owns it in T-03 in its strict, line-equality
form, and restating it in T-01 could only be done in the weaker `includes` shape T-03 forbids
(round-1 F-09). T-01 still proves the rebase landed — the tracked constraints file and the three
manifest keys are absent in this tree and present at `origin/main`, so either one reds pre-rebase.

`classifyWaveLedger`, `RESUME_OUTCOMES`, `RESUME_PROVENANCE`, `WAVE_IGNORE_REASONS` and
`ANCESTRY_INDEPENDENT_CODES` are **deliberately not** in this table: they do not exist at
`origin/main` either (verified: zero occurrences), and asserting them here would make the pre-flight
gate assert the new shape a dependent task creates, which the gate's contract forbids.

**Lifecycle (round-1 F-09).** `pdlc/workflows/__tests__/waveResumePreflight.test.js` is a fifth new
test file beyond the four TSPEC §5.3 names, and it **ships permanently**; no task deletes it. Its
two obligations survive the rebase that makes the first half look tautological: the export arms red
if a later change removes a symbol `classifyWaveLedger` depends on, and the config arm reds whenever
a consumer's `.claude/pdlc.config.json` drifts from §3.4's literal — which is the difference between
a script-owned wave gate and an agent grading its own homework (round-1 F-02). It is kept out of
`waveResumeRepoState.test.js` on purpose: that file is T-03's, and the gate must run in an earlier
batch than any file whose assertions the gate protects.

### 3.3 File-ownership manifest (per batch, mechanically auditable)

Every physical file any task creates or appends to, with its single owning task. Two tasks in the
same batch never share a row's file.

| Owning task | Files | Batch | New? |
|---|---|---|---|
| T-01 | `pdlc/workflows/__tests__/waveResumePreflight.test.js` | 1 | new |
| T-02 | `pdlc/workflows/__tests__/waveResume.test.js`, `pdlc/workflows/orchestrate-dev.js` | 2 | new; existing, tracked at `origin/main` |
| T-03 | `pdlc/workflows/__tests__/waveResumeRepoState.test.js`, `docs/_constraints/pdlc-wave-gate-baseline.md` | 2 | new; existing at `origin/main`, absent in this tree until the rebase |
| T-04 | `pdlc/workflows/__tests__/waveResumeQueueParity.test.js` | 2 | new |
| T-07 | `pdlc/workflows/__tests__/waveExecution.test.js`, `pdlc/workflows/orchestrate-dev.js` | 3 | existing, tracked at `origin/main`; second owner of the module, batch 2 ≠ batch 3 |
| T-08 | `pdlc/workflows/__tests__/waveResumeProperties.test.js` | 3 | new |
| T-10 | `pdlc/workflows/__tests__/waveResume.test.js`, `pdlc/workflows/__tests__/waveExecution.test.js`, `pdlc/workflows/__tests__/waveResumeRepoState.test.js`, `pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`, `pdlc/workflows/package.json`, `pdlc/workflows/__tests__/coverageInstrumentation.test.js`, `pdlc/workflows/__tests__/waveResumeDeltaGate.test.js` | 4 | the three suites existing by then (second owner of each — `waveResume.test.js` T-02 batch 2, `waveResumeRepoState.test.js` T-03 batch 2, `waveExecution.test.js` T-07 batch 3, all ≠ batch 4, and `T-10 → T-02/T-03/T-07` are real `Deps` edges); the script **new**; `package.json` and `coverageInstrumentation.test.js` existing and tracked, sole owner of each in this plan — both are oracle (ii)'s wiring, added in Phase CR round 1 (TE F-04); `waveResumeDeltaGate.test.js` **new**, the gate script's own four-exit-path suite, added in Phase CR round 2 (TE F-09) |
| T-11 | `pdlc/workflows/__tests__/documentOracles.test.js`, `docs/_constraints/pdlc-retirement-baseline.md` | 1 | both existing and tracked; sole owner of each in this plan |
| T-12 | *(no file written — index-only removal; the three paths are spelled in §2.1's T-12 row)* | 1 | tracked today, untracked after; T-12 writes no bytes, so it collides with nothing. The cell carries no backticked span deliberately: the ownership parser reads every backticked span as a path, and T-12 owns none |

The manifest is **one row per owning task**, never a merged cell, so every owner cell is a bare
task id the ownership parser resolves, and every file cell is a comma-separated list of backticked
paths (the parser reads every backticked span in the cell). Three files therefore appear twice, each
time with a different owner **in a different batch** — which rule 2 permits and rule 4 constrains:
`orchestrate-dev.js` (T-02, batch 2 → T-07, batch 3), `waveResume.test.js` (T-02, batch 2 → T-10,
batch 4) and `waveExecution.test.js` (T-07, batch 3 → T-10, batch 4). In every case the later task
is strictly downstream of the earlier one through the `Deps` chain (`T-10 → T-07 → T-02 → T-01`), so
none is a shared-prerequisite race, and no two tasks in one batch share a path.

**T-12's row deliberately spells no path (v1.2).** T-03's AT-17 is a finite check over *this*
manifest — no row may name `WAVE_STATE_PATH` — and D-9's invariant is that no wave claims the
ledger as something it writes. T-12's obligation is the exact opposite of an owned write path: it
**removes** the ledger from the index, and leaves the working-tree file alone. Keeping the paths in
§2.1's task text rather than in the manifest keeps both true at once — AT-17 stays exactly as T-03
states it, and D-9 is strengthened rather than weakened, since after T-12 the ledger is untracked
as well as unowned.

**This is the only ownership manifest in this document.** Every other table here is prose
structure: §2.2 names batch contents, §2.3 names the merged pairs, §4.1 maps ATs to suites, §4.3
maps mutations to tasks, §4.5.1 maps branches to covering tests. Their headers are deliberately
spelled so none of them qualifies as, or near-misses, an ownership manifest — the parser must find
exactly one.

**Files not in this manifest, and why (D-9, FSPEC OB-F6, TSPEC AT-17):**

- **`.claude/pdlc-wave-state.json` is owned by no task and named by no row.** It is
  consumer-local and excluded by a root-anchored ignore rule. This absence is the
  subject of T-03's finite check — the assertion reads this manifest, so the claim is falsifiable
  rather than editorial. **Correction (v1.2):** it is *not* untracked in this tree — commit
  `b1b846bd` put it in the index, where an ignore rule does not reach it. T-12 removes it from the
  index in batch 1; until that lands, T-03's `git check-ignore` conjunct is describing a file git is
  still tracking, which is a different claim from the one AT-14 makes.
- **`pdlc/workflows/dist/*` is owned by no task.** It is generated by
  `node pdlc/workflows/build-runtime.mjs`; §3.4 carries it per wave through
  `implementation.postWavePathspecs`. A task that hand-edited it would be editing a build output.
- **`.claude/workflows/*` is owned by no task.** It is the untracked consumer copy, produced by
  `pdlc/hooks/scripts/sync-workflows.sh`, never committed.
- **`.claude/pdlc.config.json` is owned by no task.** It is run configuration (§3.4). T-01
  *reads* it and asserts on its content; reading is not ownership, and no task writes it.
  **Correction (v1.2):** like the ledger, it is tracked in this tree despite `/.claude/pdlc.config.json`
  being in `.gitignore`. T-12 untracks it — `git rm --cached`, never `git rm` — so the file stays on
  disk and T-01's read still resolves. Untracking is not writing, so the "owned by no task" claim
  above continues to hold after T-12.

### 3.4 Integration points and run configuration

| Point | Value | Why |
|---|---|---|
| `implementation.testCommand` | transcribed literal, exactly: `(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/'` | The script-owned wave gate. Present ⇒ the gate is script-owned; absent ⇒ the run degrades to the legacy self-report gate (`Notice: the script-owned test gate is unavailable — …`), which would make every gate wording in §2.2 unenforceable. It is the oracle every batch gate rests on, so it is a literal, not a description (round-1 F-07), and T-01 asserts the resolved value against this exact string (round-1 F-02). |
| `implementation.postWaveCommand` | `node pdlc/workflows/build-runtime.mjs` | RT-5: editing `orchestrate-dev.js` leaves `pdlc/workflows/dist/` stale, and the suite itself reds on stale artifacts. The post-wave command runs **before** the gate (`pdlc-wave-gate-baseline.md` `M-WG-2`), which is what makes this ordering work. |
| `implementation.postWavePathspecs` | `pdlc/workflows/dist/` | The regenerated artifacts are committed per wave as a chore commit. This value names **no** consumer-local path, and in particular not `WAVE_STATE_PATH` — asserted by T-03. |
| `implementation.startWave` | **unset** | Leaving it unset is what lets this feature's own resume mechanism govern a re-invocation. Setting it would suppress record consultation entirely (FSPEC BR-04) — on the very feature whose behaviour is under test. Since v1.1 no batch is RED-terminal, nothing in the happy path wants it (round-1 F-01). |
| Coverage floor | **T-10**, not `postWaveCommand` | See RK-2 in §4.4. TSPEC RT-7 assigns the floor to "the last implementation **task** (PLAN T-10, RK-2)" and gives this reasoning back, so the two documents agree and no erratum is open (was routed in v1.1; closed upstream in TSPEC v1.3). The reasoning, unchanged: `implementation.postWaveCommand` is a single global key (TSPEC V-13 closes the config surface at four keys), so "the last implementation wave's `postWaveCommand`" is not expressible; setting it globally would run `test:coverage` after **every** wave, including waves where this feature's new branches are not yet covered. |
| Upstream branch | `feat-pdlc-wave-resume`, rebased onto the default branch | OB-F1. T-01 is the gate that proves it landed. |

**A note on the literal.** The string above is what `.claude/pdlc.config.json` carries in this
working tree, verified by reading it. `.claude/pdlc.config.example.json` at `origin/main` carries a
longer variant that also runs `pdlc/engine`'s suite; the example is not what the runtime reads, and
the consumer config is untracked, so the rebase does not change the resolved value. If an operator
does widen it, T-01 reds in batch 1 and this row is the thing to update — which is the intended
failure mode, not an inconvenience.

## 4. Verification

### 4.1 Acceptance-test coverage — every FSPEC AT has an owning task

TSPEC §5.4 is the contract that no AT is left without a home; this table is the contract that no AT
is left without an *owner*. Files are named as they will exist after T-01's gate passes.

| FSPEC AT | Discharged by | Suite |
|---|---|---|
| AT-01 automatic resume at the failed wave | T-07 | `waveExecution.test.js` |
| AT-02 disregard catalogue complete and closed | T-02 (unit, incl. IG-6's closure), T-07 (integration, per code) | `waveResume.test.js`, `waveExecution.test.js` |
| AT-03 ordering of disregard causes | T-02 (unit pair), T-07 (`merge-base` call-count oracle) | both |
| AT-04 verification independence | T-07 (via H-1's ordered event sink) | `waveExecution.test.js` |
| AT-05 operator override wins | T-07 | `waveExecution.test.js` |
| AT-06 pointer at default is not a setting | T-07 | `waveExecution.test.js` |
| AT-07 pointer past the end | T-07 | `waveExecution.test.js` |
| AT-08 the hatch is named, and is the only one | T-07 (i)(ii), T-02 (iii, `IMPLEMENTATION_DEFAULTS` set equality) | both |
| AT-09 verified-but-uncommitted is never completed | T-07 (+ companion arm) | `waveExecution.test.js` |
| AT-10 a no-change wave is still completed | T-07 | `waveExecution.test.js` |
| AT-11 ancestry is falsification, not archaeology | T-07 | `waveExecution.test.js` |
| AT-12 complete record skips the wave loop in full | T-07 (four conjuncts) | `waveExecution.test.js` |
| AT-13 outcome catalogue closed at three | T-02 (set equality), T-07 (announcement-table closure) | both |
| AT-14 the record never becomes tracked content | T-03 | `waveResumeRepoState.test.js` |
| AT-15 failed writes are notices, bounded | T-07 (arm 1 and arm 2, via H-2) | `waveExecution.test.js` |
| AT-16 queue parity | T-04 | `waveResumeQueueParity.test.js` |
| AT-17 advisory remediation composes | T-07 (integration half), T-03 (ownership-manifest half) | both |
| AT-18 completion accumulates across invocations | T-07 | `waveExecution.test.js` |
| P-1 … P-4 (TSPEC §5.7 laws) | T-08 | `waveResumeProperties.test.js` |

Coverage claims above are stated against the **current** suite layout, verified: of the six files
named, exactly one — `pdlc/workflows/__tests__/waveExecution.test.js` — exists today (2,761 lines
at `origin/main`); `waveResume.test.js`, `waveResumeProperties.test.js`,
`waveResumeQueueParity.test.js`, `waveResumeRepoState.test.js` and `waveResumePreflight.test.js`
match nothing under `pdlc/workflows/__tests__/` at `origin/main` or in this tree, and every task row
that names one declares it new.

### 4.2 The three oracle rules every task is held to

Restated here rather than assumed, because they are what makes the tests above falsifiable
(TSPEC §5.1):

1. **No implementation echoes.** Every expected value is a literal transcribed from the TSPEC or
   the FSPEC. An expected announcement is never obtained by calling `WAVE_IGNORE_REASONS[code](ctx)`
   — that would make each renderer trivially agree with itself.
2. **No absence-only oracles.** Every skip assertion is a call count on a spy paired with a
   positive conjunct. "No commit was produced" cannot distinguish a skipped wave from one that ran
   with nothing to add.
3. **No matcher is relaxed.** Replacing `toContain(exactString)` with a `startsWith` predicate is
   forbidden in T-07; `toEqual` on the filtered `merge-base` call list is load-bearing, not
   stylistic — `toContainEqual` passes under the eager-probe mutation DEC-WVR-08 rejects.

### 4.3 Mutation resistance — five mutations, each with an owner who **runs** it

v1.0 asserted these as predictions ("killed by"). Round-1 F-04 is right that a believed
mutation is not an observed one, so each row now names the task that must **apply the mutation,
observe the RED against the named oracle, revert, and record the observed failure output in its
task report** — the shape T-04's falsification arm already used in v1.0. The DoD carries the
checkbox.

| Mutation | Oracle that must red | Applied and observed by |
|---|---|---|
| Delete the ancestry guard | AT-02 set equality (`head-unreachable` disappears) + AT-11 | unit half T-02, integration half T-07 |
| Move the record write outside the transport branch | AT-09's empty `ledgerWrites(writes)` | T-07 |
| Record a run-relative wave number | AT-18 only | T-07 |
| Resolve the ancestry probe eagerly | AT-03/AT-11 `merge-base` call counts, `toEqual` only | T-07 |
| Suppress the record write while `explicitPointer` is true (write only on automatic runs) | AT-05's **write-side** conjunct only — the mutation leaves AT-05's resume-point, provenance-token and never-consulted conjuncts green, and leaves AT-07, AT-15 and AT-18 green with them (TSPEC §5.5, mutation 5) | T-07 |

The fourth is the reason T-02 and T-07 are ordered as they are, and it is the row that most needed
promoting from claim to observation: the eager-probe mutation is invisible to every behavioural
assertion, and TSPEC §5.5 records that the shipped ancestry test's `toContainEqual` **passes** under
it. A matcher that load-bearing is demonstrated, not asserted — if T-07's author reaches for
`toContainEqual` by muscle memory, the recorded mutation run is what notices.

The fifth (added v1.3, from TSPEC §5.5's five-mutation set) is the one that removes resume from
exactly the recovery path §2.5 ratifies the write for: an operator who points a run at a wave still
gets a record written, so the *next* resume works. Suppressing the write on operator-pointed runs
only is invisible to the automatic-provenance tests — which is why AT-05's write-side conjunct is
the single oracle named, and why T-07 must run this mutation rather than predict its outcome.

Mechanics, so the observation is cheap rather than ceremonial: apply the mutation in the working
tree, run only the named oracle's test file, paste the failure header into the task report,
`git checkout --` the file. Nothing is committed in the mutated state.

### 4.4 Risks this PLAN carries

| # | Risk | Mitigation |
|---|---|---|
| RK-1 | **Red-before-green is now a within-task ordering, not a batch gate** (§2.3). The runtime cannot enforce it, so a task that wrote its code first and its tests second would look identical at the gate. | Three partial replacements, none of which is a promise: each merged task lands the test half in its own commit before the code half, so `git log -p` over the task's commits is the after-the-fact check; §4.3's five mutations are *executed*, which tests the oracles harder than commit ordering does; and the DoD carries a checkbox for both. This is a genuine loss of mechanical enforcement, accepted knowingly, and it is the same trade v1.0 already made for T-04. |
| RK-2 | **The coverage floor is not a wave gate.** The config surface has one *global* `postWaveCommand` (V-13), so setting the floor there would run `test:coverage` after every wave — red on waves whose new branches are not yet covered. | §3.4 assigns the floor to **T-10**, the last task, which runs it explicitly, reports the measured per-file branch number for `orchestrate-dev.js`, and pairs it with §4.5.1's delta oracle. The floor stays a Phase-I-level gate rather than a PUB-time surprise. TSPEC §5.8 / RT-7 assigns the floor the same way — to the last implementation **task**, citing PLAN T-10 and this risk row by id, and explicitly **not** to `implementation.postWaveCommand` — so this is a recorded agreement, not a divergence. |
| RK-3 | **Rebase churn (TSPEC RT-1).** `orchestrate-dev.js` is the largest tracked source module (734,711 B at `origin/main`) and this feature's edit surface. | The rebase happens before implementation, gated by T-01. The edit surface is one comment block, one extracted function, five announcement suffixes and one conditional report detail. |
| RK-4 | **A fourth shipped assertion turns out to break** (TSPEC RT-3's residual). | T-07 runs the full `pdlc/workflows` suite as its own check before the wave's gate; any further assertion found to change is added to TSPEC §2.4's table in the same commit, never fixed silently. |
| RK-5 | **T-07 is now the largest task in the plan** — harness extensions, three assertion updates, sixteen integration cases, five announcement suffixes, one report-row branch and five mutation runs, in two files. Splitting the test file is what rule 2 forbids; splitting the code half back out is what round-1 F-01 forbids. | Bounded by the fact that its parts have distinct oracles and by T-02's extraction having already landed and been proven net-neutral. If T-07 exceeds a wave's budget the correct response is to re-invoke — the wave ledger this feature is *about* resumes it — not to split the file across two same-batch tasks. |
| RK-6 | **The gate could silently degrade to self-report** if a consumer's `.claude/pdlc.config.json` loses or misspells `implementation.testCommand`; every gate wording in §2.2 would become an agent's claim about itself. | T-01 asserts the resolved value against §3.4's literal in batch 1 (round-1 F-02), and the DoD requires the positive observation — the Phase I report row naming `script-owned gate`, with no degradation notice in the run log. |

### 4.5 Definition of Done

**How this checklist is kept (Phase CR round 2, PM F-01 / Q-02).** A box is ticked only against
**observed** evidence recorded beside it — a measured number, a named green oracle, or a command and
its exit status — in the form T-10's two boxes already modelled. A box whose claim cannot be
observed from the branch is left **unticked with the reason stated**, because an honest unticked box
is information and an unticked box on landed work is noise. Ticking is a **Phase DOD** act, not a
per-task one: tasks land behaviour, and this record is reconciled once, against the tree, when the
feature is complete. Evidence below was observed at `2012e9b9` unless stated otherwise.

- [x] T-01 passes: the branch is rebased, every `BL-PREREQ` symbol and file is present at HEAD, and
      the resolved `implementation.testCommand` string-equals §3.4's literal. — `waveResumePreflight.test.js`
      › `testCommand string-equals the §3.4 transcribed literal, or CI supplies the guard` and the
      `BL-PREREQ` presence cases, green in the 7-suite / **205-test** `waveResume|waveExecution` run.
- [x] **T-11 passes:** `PROP-SWEEP-2(b)` is green — `docs/pdlc-wave-resume/**` is on `A1_GLOBS`
      **and** carries a row in `docs/_constraints/pdlc-retirement-baseline.md` recording rationale,
      scope justification and the hit count measured at promotion time, so `PROP-SWEEP-3` is green
      too. A one-sided edit that greens one and reds the other does not satisfy this box. —
      `documentOracles.test.js` + `advisoryWaveGate.test.js`, **252 tests green**; both sweep
      properties are in that run.
- [x] **T-12 passes:** both `.claude/`-tracking oracles are green — `git ls-files .claude/` returns
      exactly `pdlc.config.example.json` and `settings.json` (set-equality, not a subset), and
      `git ls-files pdlc/workflows/coverage/` is empty. Checked with the working tree intact:
      `.claude/pdlc.config.json` must still exist on disk for T-01 to read. — both commands run at
      `2012e9b9`: the first prints exactly those two paths, the second prints nothing;
      `.claude/pdlc.config.json` is present and untracked.
- [ ] **The gate was script-owned for every wave** — positively observed, not inferred from silence:
      the Phase I report row's detail contains `script-owned gate`, **and** the run log carries no
      `Notice: the script-owned test gate is unavailable` line (round-1 F-02).
      *Left unticked: the Phase I run log is not a durable artifact on this branch, so the claim
      cannot be observed at review time. The mechanism it asserts is oracle-covered
      (`waveExecution.test.js` › `runs the configured command and commits each task's owned files on
      green`, and the self-report fallback's own case); what is missing is the record of the run,
      not the behaviour. Ticking it would be asserting something unobserved.*
- [x] All eleven TSPEC delta rows D-1 … D-11 are landed, each by the task §1.1 names. — D-1
      `waveResumeRepoState.test.js` › `D-1: no INTERIM wave-ledger commentary survives in shipped
      source` (absence **and** the positive replacement, over `orchestrate-dev.js` and
      `dist/pdlc-cli.mjs`); D-2 the closed announcement table; D-3 the report-row cases; D-4 the
      tolerated-`{}`-with-no-writer case; D-5 `waveResume.test.js`'s unit suite; D-6
      `waveExecution.test.js:2948` (AT-15 arm 2, EC-15a); D-7 `waveResumeRepoState.test.js`'s AT-14
      conjuncts; D-8 `waveResumeQueueParity.test.js`; D-9 the AT-17 ownership check; D-10 the
      `M-WVR-1`/`M-WVR-2` rows, pinned by their measured phrases; D-11 the three transcribed
      assertions. All green in the 205-test run.
- [ ] Each merged task (T-02, T-03, T-07) landed its test half in a commit **before** its code half,
      checkable with `git log -p` over the task's commits (§2.3).
      *Left unticked, and it is a real gap in the record rather than a formality: each merged task
      landed as a **single** wave commit (`196dab92` T-02, `42d0592a` T-03, `fa17fb78` T-07), so the
      red-before-green ordering §2.3 asks for is not observable from git history. The `[Fake first]`
      ordering inside each commit is visible; the two-commit split is not. Recorded as-is.*
- [ ] Each of §4.3's five mutations was applied, observed RED against its named oracle, reverted,
      and its failure output recorded in the owning task's report (round-1 F-04).
      *Left unticked: only **one** mutation run is recorded in the branch — `e6f9f776`'s message
      records the `recordedLastGreenWave`/`waveCount` field swap at `orchestrate-dev.js`, observed
      RED against the new `over-count` row and reverted, with `dist` rebuilt and `--check` in-sync.
      The five §4.3 mutations owned by T-02 and T-07 carry no such record in their commit messages.*
- [x] `classifyWaveLedger` is pure, total and never performs IO; the three catalogues are
      `Object.freeze`d exports. — `waveResume.test.js:31`, `:42`, `:72`, `:90`
      (`Object.isFrozen` over all **four** catalogues, the last two added for TE F-06), plus
      `PROP-LAW-03` › `classifyWaveLedger is total over ClassifyInput` at `numRuns: 500`.
- [x] The lazy-probe contract holds: **zero** `merge-base` calls on the feature-mismatch,
      plan-changed and no-`head` fixtures; **exactly one** on the ancestry fixture. — the per-row
      `expectedMergeBaseCalls` conjunct of `waveExecution.test.js`'s `%s is ignored with a notice,
      and every wave runs` `it.each` (`toEqual`, not containment) and the paired honoured-ledger
      case.
- [x] All eighteen FSPEC ATs have a passing owning test per §4.1, and the four laws P-1 … P-4 pass
      at `numRuns: 500`. — §4.1's map is intact and every owning test is in the 205-test green run;
      `waveResumeProperties.test.js:31` defines `RUNS = { numRuns: 500 }`, used by all four
      `PROP-LAW-0{1..4}` describes.
- [x] Exactly three shipped assertions changed, each named by TSPEC §2.4, each to a transcribed
      literal, with no matcher relaxed and no other assertion in the ledger `describe` touched; the
      wave-1 `✅` detail is byte-identical to the shipped string (the `N > 1` condition, F-08). —
      D-11's three assertions; `waveExecution.test.js` is byte-unchanged until `fa17fb78` (T-07,
      batch 3), so the change set is confined to the commits §2.4 names.
- [x] `waveExecution.test.js` was byte-unchanged across the whole of batch 2 (RT-2's regression-net
      invariant); T-02's two commits show the test half landing before the code half. — first
      clause observed: `git log --name-only b029e853..HEAD -- pdlc/workflows/__tests__/waveExecution.test.js`
      lists no batch-2 commit; its earliest touch is `fa17fb78` (T-07, batch 3). *Second clause is
      the unticked box above — T-02 landed as one commit; recorded there, not double-counted here.*
- [x] `M-WVR-1` and `M-WVR-2` are in `docs/_constraints/pdlc-wave-gate-baseline.md` under a new
      section, the `Version` is bumped, and `M-WG-6` is recorded as reviewed-and-left. —
      `waveResumeRepoState.test.js`'s D-10 block, which pins each row by the **measurement it
      carries** (`Replay cost`, `16 waves`, `7 tasks`) rather than by a path or a line number.
- [x] `.claude/pdlc-wave-state.json` appears in no owned-path set, no `postWavePathspecs` value and
      no commit; `git check-ignore -v` resolves it to the root-anchored rule. —
      `waveResumeRepoState.test.js`'s AT-14 three conjuncts and the AT-17 finite check over §3.3's
      manifest, green in the 205-test run.
- [x] `node pdlc/workflows/build-runtime.mjs --check` exits 0. — run at `2012e9b9`:
      `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`, exit **0**. *(The box's original second clause
      named `pdlc/hooks/scripts/sync-workflows.sh --check`. That script does not exist: the
      pdlc-plugin-retirement sweep deleted it at `35f444f6`, before this feature's base. The clause
      was stale on arrival and is removed rather than left as an uncheckable box — nothing in this
      feature relied on it.)*
- [x] `npm run test:coverage` was run from `pdlc/workflows` (`--per-file --branches 85`) and
      `orchestrate-dev.js`'s measured per-file branch number is `>= 85` and recorded —
      **88.90 %**, recorded in §4.5.1 (T-10, Phase CR round 1). The
      whole-command exit status is recorded alongside it but is not the gate — the fourth
      `c8.include` entry (`**/scripts/capture-learnings-baseline.mjs`) takes the same per-file floor
      and is outside this feature's reach (§2.1 T-10 oracle (i), TSPEC §5.8).
- [x] **§4.5.1's mapping table is complete and every row names a covering test**, and c8's uncovered
      line list for `orchestrate-dev.js` contains no line inside this feature's introduced ranges
      (round-1 F-05) — the table is filled and its completeness is itself checked by
      `waveResumeRepoState.test.js` › `PLAN §4.5.1's delta coverage map is complete`; the delta
      oracle `pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs` runs as the third step of
      `npm run test:coverage` and reports **0** uncovered lines inside the introduced ranges
      (T-10, Phase CR round 1; the gate's own exit paths are covered by
      `waveResumeDeltaGate.test.js`, Phase CR round 2).
- [x] No new `main()` parameter, no new runtime-adapter binding, no fifth `implementation.*` key
      (REQ C-3, TSPEC §3.4/§3.5). — the four `implementation.*` keys are unchanged in
      `.claude/pdlc.config.example.json`, and the ledger is reached through `makeLedgerArgs` inside
      `main()` rather than through a new parameter, which is why §2.1's T-10 row can call the
      announcement and report branches "reachable only through `makeLedgerArgs`".

**Three boxes remain unticked, all record-keeping rather than behaviour**, and none is a missing
capability: the Phase I run log, the per-task red/green commit split, and four of §4.3's five
mutation runs are all *evidence that was not durably captured while the work happened*. The durable
fix belongs upstream of this checklist — a mechanical Phase DOD check that every PLAN task id is
landed and every DoD claim is either observed or explicitly waived — and is raised as a process item
rather than retro-fitted here, since manufacturing the evidence now would be worse than recording
its absence.

#### 4.5.1 Delta-scoped coverage map (the oracle the 85% floor cannot be)

The whole-file floor is a regression guard for the module and is kept as-is. It cannot be this
feature's oracle: `orchestrate-dev.js` is 16,336 lines at `origin/main` with on the order of two
thousand branch points, and this feature adds roughly twenty — about **one percent of the
denominator**, so every new branch could be uncovered and `npm run test:coverage` would still exit 0
(round-1 F-05). T-10 therefore fills in and reports this table, and its completeness — not a
percentage — is the checkable thing. Column headings are deliberately not those of an ownership
manifest.

**Oracle (ii)'s lifetime, decided (Phase CR round 2, TE F-08 / Q-03).** The gate is **permanent**,
not a feature-duration control: it is `&&`-chained into `npm run test:coverage`
(`pdlc/workflows/package.json`), which the required check `Unit tests (ubuntu-latest, node 20)`
runs, so it outlives this branch whether or not anyone maintains it. Round 1's shape could not
survive that: it treated an empty introduced-range set as a hard failure, and once this feature is
on `main` the merge-base **contains** its lines, so the diff is empty on `main` and on every branch
cut from it that does not touch `orchestrate-dev.js` — a permanently red required check, with the
`--per-file --branches 85` step never reached because it is chained after. The empty set therefore
now reads as **success** ("no delta in range — nothing for this oracle to check"), distinguished
mechanically from the reading the guard was really reaching for: the subject **absent from the
checkout** still fails, as do a missing coverage artifact and a subject missing from the report.
`PINNED_BASE_SHA` stays as the deterministic fallback and its reachability from `HEAD` is asserted
(`waveResumeDeltaGate.test.js` › `the pinned fallback sha is a real ancestor of HEAD in this
repository`, TE Q-04), so a wrong pin reds in the suite rather than lying dormant on a path CI never
takes. All four exit paths plus the positive path are covered by `waveResumeDeltaGate.test.js`
(TE F-09), whose **first** case is the post-merge one — the falsifying test for the fix itself.

| Branch class this feature introduces | Count | Reached from | Covering test named by T-10 |
|---|---|---|---|
| `classifyWaveLedger` guard arms (TSPEC §3.2) | 8 | unit | `waveResume.test.js` › `classifyWaveLedger — the ordered guard table, all eight rows`: `guard 1 (IG-6): no record at all classifies full-run, silent, code null`; the guard-2 `it.each` (three IG-1 arms, one per parse sentence); `guard 3 (IG-2): a recorded feature mismatch …`; `guard 4 (IG-3): a recorded planHash mismatch …`; `guard 5 (IG-5): an unreachable head …`; `guard 6 (IG-4): lastGreenWave beyond this plan's wave count …`; `guard 7: lastGreenWave equal to the wave count classifies skip-phase`; `otherwise (row 8): a mid-plan lastGreenWave classifies resume, starting at lastGreenWave + 1` |
| `WAVE_IGNORE_REASONS` reason renderers | 7 | unit | `waveResume.test.js` › `WAVE_IGNORE_REASONS — one unit case per reason renderer`: one `it` per code — `unreadable-json …`, `not-an-object …`, `wrong-shape …`, `feature-mismatch names both the recorded feature and this run's feature`, `plan-changed renders the shipped sentence`, `head-unreachable names the recorded commit's short sha`, `over-count names the recorded and actual wave counts`. Wired to `main()` for `feature-mismatch` and `over-count` by the `%s is ignored with a notice, and every wave runs` `it.each` in `waveExecution.test.js`, which transcribes the whole notice |
| Lazy ancestry-probe short-circuit | 1 | unit + integration | `waveExecution.test.js` › `a complete ledger whose commit is NOT an ancestor of HEAD is ignored, and every wave runs` (filtered `merge-base` call list `toEqual` **exactly one** call — equality, not containment) and `the same ledger with the commit reachable from HEAD is honoured — the probe is a real input`; the negative half is the per-row `expectedMergeBaseCalls` conjunct of the `%s is ignored with a notice, and every wave runs` `it.each`, `[]` for guards 1–4's codes and one call for `over-count` (guard 6, *after* ancestry) |
| Announcement suffix branches in `main()` | 5 | integration only | `waveExecution.test.js` › `the announcement table is closed: exactly the five §2.4 provenance rows fire, each once` — set equality over the five rows, so a deleted announcement reds there rather than silently |
| Report-row branches (`✅` wave-1 vs `N > 1`, `⏭`) | 3 | integration only | `waveExecution.test.js`: wave-1 `✅` by `runs the configured command and commits each task's owned files on green` (script-owned gate) and `falls back to the legacy self-report gate when testCommand is absent, and says so once` (self-report gate); `N > 1` `✅` by `skips the waves before the pointer entirely — no dispatch, no gate, no commit` (`provenance: operator-set`), `records each committed wave, and the next invocation resumes at the failed one` (`provenance: automatic`) and `a ledger resume under the SELF-REPORT gate names that gate in the report row` (the gate-name ternary's second arm); `⏭` by `a complete ledger skips every wave without a single implementation dispatch — and Phase PT's V-wave and its gate still run` |

The last two classes are why T-10 owns `waveExecution.test.js` as well: they live inside `main()` and
are reachable only through `makeLedgerArgs`, so a unit arm in `waveResume.test.js` structurally
cannot enter them (round-1 F-03).

**Measured, T-10 (Phase CR round 1, PM F-01):** `npm run test:coverage` from `pdlc/workflows` reports
**88.90 %** branch coverage on `orchestrate-dev.js`'s **own row** against the `--per-file --branches
85` floor — oracle (i), asserted as the per-file number rather than the whole-command exit status,
for the reason §2.1's T-10 row gives. Read the file's row, not the table's `All files` line: that
aggregate is 88.88 % on the same run, and it is the aggregate that RT-7 says cannot see this
feature.

**Oracle (ii) is now executable, not narrative.**
`pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs` is the delta oracle: it derives this
feature's introduced line ranges in `orchestrate-dev.js` by `git diff -U0` against the **live**
merge-base with `origin/main`, falling back to a **transcribed** pre-feature merge-base sha when
neither `origin/main` nor `main` resolves (the precedent `learningsBaselineGuard.test.js` sets with
`EXPECTED_MERGE_BASE_SHA` — CI checks out with `fetch-depth: 0` but not necessarily a local `main`
ref). It reads c8's per-file uncovered line list from `coverage/coverage-final.json` and exits
non-zero when any uncovered line falls inside those ranges.

The live base is preferred over the pin on purpose: **Phase DOD rebases the feature branch**, which
moves the merge-base forward. A diff taken against a sha *behind* the new base would count lines
`main` contributed in that window as lines this feature introduced — and `orchestrate-dev.js` carries
836 uncovered lines outside this feature's reach (measured at `2012e9b9`), so the oracle would go red on work T-10 does not
own. The pin stays as the deterministic fallback and is a commit on `main`, so it never disappears;
the script prints which of the two it used, so a red is always attributable. It is wired as the third
step of `npm run test:coverage` — after `c8 report --reporter=json`, whose artifact it reads — and
ahead of the `--check-coverage --per-file` floor step, so the
`Unit tests (ubuntu-latest, node 20)` required check gates it. Ordered ahead of the floor on
purpose: `&&`-chained after it, a floor failure in an unrelated included module — the
`capture-learnings-baseline.mjs` case §2.1's T-10 row describes — would skip the delta oracle
entirely, and the one oracle scoped to this feature's own work is the one that must always run.
It reads the artifact the preceding `c8` step produced rather than re-running the suite, because a
test that re-ran the suite under coverage from inside the suite would not terminate — the constraint
`coverageInstrumentation.test.js` already records.

The oracle earned its keep on first run: it reported one uncovered line inside this feature's ranges
— the resume report row's `scriptGate ? "script-owned gate" : "self-report gate"` ternary, whose
self-report arm no resume fixture reached, since every one of them configures a `testCommand`. That
is precisely the single-arm gap a whole-file percentage over a 16,336-line module cannot see (RT-7).
`a ledger resume under the SELF-REPORT gate names that gate in the report row` closes it, and the
oracle now reports **0** uncovered lines inside the introduced ranges.

The table's completeness is itself checked, per §2.1's "a deleted case fails the set-equality of that
table": `waveResumeRepoState.test.js` › `PLAN §4.5.1's delta coverage map is complete` set-equality-
checks this table's branch-class rows against a transcribed literal set, asserts no cell is still a
`*(filled in by T-10…)*` placeholder, and asserts every backticked test title a cell names is present
in the file that cell names. Deleting a row, blanking a cell or renaming a covering test reds there.

**`coverageInstrumentation.test.js` is T-10's too (Phase CR round 1, TE F-04).** The round-1 review
found this file edited by the feature and owned by no task — it is now named in §3.3's manifest and in
§4.6's `parsePlanOwnership` transcription, alongside `package.json` and the delta script, because all
three are oracle (ii)'s wiring. The edit itself wraps the file's `c8 --check` driver in a five-attempt
retry gated on the stderr signature of a dist race (`STALE pdlc/workflows/dist/` or a missing
`pdlc-cli.mjs`), because `consolidationBuild.test.js` mutates and restores the real
`dist/pdlc-cli.mjs` in a parallel jest worker. The review's concern — that retry-until-green can hide
a genuine failure — is answered by bounding what the retry can absorb, and the bound is now asserted
rather than asserted-in-prose:

- any failure whose stderr is **not** the race signature breaks the loop on the first attempt, so a
  wrong `c8.include` list is still reported immediately;
- a genuine stale `dist/` is a property of the bytes on disk, not of timing, so it fails all five
  attempts;
- exhaustion is no longer indistinguishable from a generic non-zero exit: the test asserts
  `raceWindowNeverClosed: false` and prints the last `stderr`, so five consecutive race-signature
  failures read as "the dist is stale", not as "a worker was mid-write".

Making the suite hermetic instead — building against a temp copy rather than the tracked
`dist/pdlc-cli.mjs` — would change a file this feature does not otherwise touch and is cross-cutting
to `consolidationBuild.test.js`; it belongs in its own queue item (round-1 TE Q-02), not here.

### 4.6 Parse verification of this document (rule 6)

The task table is machine-parsed, so this document was parsed with the shipped parser **after the
v1.5 edit** (and, before it, after v1.3, the v1.2 erratum edit and the v1.1 merge), not merely
written to look parseable. The v1.5 re-run is what confirms that adding three paths to T-10's
manifest cell (TE F-04) moved nothing else: still nine tasks, still the same four batches, still zero
near misses, and `T-10` now parses as the six-path list transcribed below. Run against
`git show origin/main:pdlc/workflows/orchestrate-dev.js` — the shipped parser, byte-identical to
this tree's copy now that the OB-F1 rebase has landed (`git diff origin/main --
pdlc/workflows/orchestrate-dev.js` is empty at HEAD, §1.2):

| Check | Result |
|---|---|
| `parsePlanTasks(PLAN)` | 9 tasks, `warnings` undefined; ids `T-01, T-02, T-03, T-04, T-07, T-08, T-10, T-11, T-12`; `dependencies` exactly `[] / [T-01] / [T-01] / [T-01] / [T-02] / [T-02] / [T-07,T-08,T-03,T-04] / [] / []` — the edge set of §3.1, with `T-11` and `T-12` as isolated sources |
| `planBatch` per row vs. `max(dep batches) + 1` | agrees on every row: 1, 2, 2, 2, 3, 3, 4, 1, 1 |
| `computeTopologicalBatches(tasks)` | `[[T-01,T-11,T-12], [T-02,T-03,T-04], [T-07,T-08], [T-10]]` — identical to the `Batch` column, so the column is a contract that holds, not a caption |
| `parsePlanOwnership(PLAN)` | 9 rows, one per task, **zero near misses**; multi-path cells parse as lists (`T-02 → [waveResume.test.js, orchestrate-dev.js]`, `T-10 → [waveResume.test.js, waveExecution.test.js, waveResumeRepoState.test.js, check-wave-resume-delta-coverage.mjs, package.json, coverageInstrumentation.test.js, waveResumeDeltaGate.test.js]`, `T-11 → [documentOracles.test.js, pdlc-retirement-baseline.md]`), and `T-12` parses as the **empty** path list — measured, and the reason its cell carries no backticked span (§3.3) |
| `computeWaves(tasks, ownership)` | four ownership-disjoint waves, identical to the topological batches — no wave contains two tasks sharing a path; wave 1 is `[T-01, T-11, T-12]` and its three path sets are pairwise disjoint (one file, two files, none) |
| Retired ids | `T-05`, `T-06`, `T-09` appear in no `#` cell and no `Deps` cell; the parser sees **nine** tasks (seven before v1.2 added T-11 and T-12; re-measured v1.3) and no dangling dependency |
| Dependency cycles | none; the edge set is a DAG (Phase P refuses a PLAN whose dependencies contain a cycle) |
| Bare basenames in `Test File` / `Source File` | none — every path is subpackage-qualified (`pdlc/workflows/__tests__/…`, `pdlc/workflows/orchestrate-dev.js`, `docs/_constraints/…`) |
| Second near miss, found and fixed in v1.2 | T-12's manifest cell first read ``index-only `git rm --cached` ``; the parser reads **every** backticked span as a path, so the command string parsed as a file T-12 owned. The backticks are gone and the row now parses as zero paths. |
| Id spelling | identical in the `#` column and in every `Deps` cell — bare `T-NN`, never bolded in one and plain in the other |

One near miss was found and fixed while re-running this check: §2.3's merged-pair table originally
carried a `Files (…)` header, which normalises to the manifest's `files` cell and made the block a
files-side near miss. Its heading now reads `Paths touched, …`, and `nearMisses` is empty — the
parser finds exactly one manifest, §3.3.
