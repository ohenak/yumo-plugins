# PLAN — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | se-author |
| Version | 1.0 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → **PLAN** |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | *(none yet — round 1 pending)* |
| LEARNINGS | `docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md` |

**Revision history.**

| Version | Change |
|---|---|
| 1.0 | Initial authoring. |

## 1. Overview

### 1.1 What is being built

TSPEC §1.2 scopes this feature to **eleven delta rows (D-1 … D-11)** against a mechanism that
already ships on the default branch. Nothing here designs a second resume mechanism; the work is
(a) one behaviour-preserving extraction, (b) two announcement changes, (c) one comment
replacement, (d) one constraints-file promotion, and (e) the test suites that make the ratified
contract falsifiable.

| Delta | Landed by |
|---|---|
| D-1 remove the INTERIM commentary, cite the TSPEC | T-05 |
| D-2 provenance token on every announcing outcome | T-09 |
| D-3 resume point + provenance on the executed Phase I report row | T-09 |
| D-4 keep the `{}` read tolerance, add no writer (DEC-WVR-04) | T-02 (asserted; no code change) |
| D-5 extract the decision as a pure classifier; add the set-equality suites | T-05 (code), T-02 (suites) |
| D-6 EC-15a discriminating test (early write succeeds, later write fails) | T-07 |
| D-7 the ignore-rule assertion | T-03 |
| D-8 queue/direct parity | T-04 |
| D-9 this PLAN claims the record in no wave's owned-path set | T-03 (§3.3 is the subject) |
| D-10 `M-WVR-1..2` in `docs/_constraints/pdlc-wave-gate-baseline.md` | T-06 |
| D-11 the three shipped whole-string assertions | T-07 |

### 1.2 The one precondition this PLAN is built around

REQ BL-04 / FSPEC OB-F1 / TSPEC §6.2 are **not met in this tree**, and that is verified rather
than assumed:

| Fact | Command run in this tree | Result |
|---|---|---|
| The branch is behind the default branch | `git rev-list --count HEAD..origin/main` | `1637` |
| The shipped mechanism is absent here | `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` | `0` |
| The wave-gate baseline is absent here | `ls docs/_constraints/` | no `pdlc-wave-gate-baseline.md` |
| The ignore rule is absent here | `grep -n 'wave-state' .gitignore` | no match (only `/.claude/workflows/`, line 29) |
| `fast-check` / `c8` / `test:coverage` are absent here | `grep -nE '"test\|fast-check\|c8' pdlc/workflows/package.json` | only `test` and `test:watch` |

All five are present at `origin/main` (`345ae358`), verified by name:
`WAVE_STATE_PATH`, `parseWaveLedger`, `computePlanHash`, `formatWaveLedger`, `writeWaveLedger`,
`headCorroborated` and `IMPLEMENTATION_DEFAULTS` all resolve in
`git show origin/main:pdlc/workflows/orchestrate-dev.js`; `classifyWaveLedger` and
`RESUME_OUTCOMES` resolve **nowhere** (they are this feature's new exports);
`docs/_constraints/pdlc-wave-gate-baseline.md` is tracked; `.gitignore` line 41 is
`/.claude/pdlc-wave-state.json`; and `pdlc/workflows/package.json` line 9 defines
`test:coverage` with `--per-file --branches 85` alongside the `c8` and `fast-check` devDependencies.

**Consequence for this PLAN, and it is structural, not a caveat.** TSPEC §5.4 AT-14 and §6.2 OB-F1
state that in wave mode a red gate halts the wave *and every wave after it*, so the wave carrying
AT-14 must not be dispatched before the rebase. This PLAN discharges that mechanically rather than
in prose: **T-01 is the first task, it is a pre-flight gate over exactly those baseline facts, and
every other task depends on it** (directly or transitively). A pre-rebase run therefore fails at
T-01 — the cheapest possible wave — instead of at T-03's ignore-rule assertion three waves in.

### 1.3 Scope boundaries this PLAN inherits

- The extraction is **behaviour-preserving** and lands alone, before any announcement change
  (TSPEC RT-2). T-05 leaves `pdlc/workflows/__tests__/waveExecution.test.js` byte-unchanged; that
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
they exercise are marked `[Fake first]`; each such row precedes every implementation row for the
same component through a real `Deps` edge, never through id order.

### 2.1 Task table

| # | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|
| T-01 | **Pre-flight gate (BL-PREREQ).** Assert, at HEAD, the *existence* of every baseline symbol and file this feature extends: `WAVE_STATE_PATH`, `parseWaveLedger`, `computePlanHash`, `formatWaveLedger`, `IMPLEMENTATION_DEFAULTS` exported from `orchestrate-dev.js`; `docs/_constraints/pdlc-wave-gate-baseline.md` tracked; `.gitignore` carrying a `/.claude/pdlc-wave-state.json` line; `pdlc/workflows/package.json` carrying `test:coverage`, `c8` and `fast-check`. Existence only — never the new shape T-05 creates. Absent symbol ⇒ blocking work (the rebase OB-F1 owes), promoted before any dependent task runs. | `pdlc/workflows/__tests__/waveResumePreflight.test.js` *(new)* | — *(gate only, no production source)* | 1 | — | ⬚ |
| T-02 | `[Fake first]` **RED — pure-unit suite.** `classifyWaveLedger` over all eight rows of TSPEC §3.2's guard table; transcribed set-equality over `RESUME_OUTCOMES`, `RESUME_PROVENANCE`, `Object.keys(WAVE_IGNORE_REASONS)` (seven codes) and `Object.keys(IMPLEMENTATION_DEFAULTS)` (four keys); `parseWaveLedger`'s three arms with their exact shipped sentences, including the three no-record literals `null`, `""`, `"{}"` each returning exactly `{state: null, reason: null}` (D-4, IG-6's closure home); `formatWaveLedger`'s two shapes; one unit case per reason renderer from a transcribed `ReasonContext` literal. Every expectation transcribed from TSPEC §3.1/§3.2 — never read back out of the module (§4.2). **ATs:** AT-02 (unit half), AT-03 (unit half), AT-08 (iii), AT-13 (unit half). | `pdlc/workflows/__tests__/waveResume.test.js` *(new)* | — | 2 | T-01 | ⬚ |
| T-03 | `[Fake first]` **RED — repo-state suite.** AT-14's three conjuncts: a line **equal** to `/.claude/pdlc-wave-state.json` in `.gitignore`; the leading `/` asserted on that matched line (root-anchored, per the rationale the sibling `/.claude/workflows/` rule records in the same block); `git check-ignore -v .claude/pdlc-wave-state.json` resolving to **that** line, not a broader pattern. Plus AT-17's finite check over **this PLAN**: no row of §3.3's ownership manifest and no `implementation.postWavePathspecs` value names `WAVE_STATE_PATH` (D-9, OB-F6). Plus the `M-WVR-1` / `M-WVR-2` presence assertion over `docs/_constraints/pdlc-wave-gate-baseline.md` — **red until T-06**. Forbidden weakenings, named so a reviewer can check them: no `some(line => line.includes(...))`, no "no churn observed". **ATs:** AT-14, AT-17 (repo-state half). | `pdlc/workflows/__tests__/waveResumeRepoState.test.js` *(new)* | — | 2 | T-01 | ⬚ |
| T-04 | **Queue-parity suite (characterisation).** AT-16 exactly as DEC-WVR-07 scopes it: (i) `orchestrate-queue`'s `_runPipeline` is left at its default and that fact is asserted; (ii) the delegation payload's key set is asserted `toEqual(["reqPath"])` against a spy; (iii) the direct run's `_readFile` call list, filtered to the ledger path, compared for string equality against `WAVE_STATE_PATH`. Fixtures named by TSPEC AT-16 and all three required: a `QUEUE.md` with one `pending` row for this feature, a `.claude/pdlc.config.json` carrying `distribution.checkEnabled: false` (without it the queue returns `outcome: "blocked"` and asserts nothing), and a Phase-0 readiness-triage `_agent` double. Green on write against shipped `orchestrate-queue.js` — it is a **regression net over a boundary this feature must not move**, and the falsification arm (forward any additional key ⇒ (ii) reds while AT-01..05 still pass) is executed and recorded in the task's report. **ATs:** AT-16. | `pdlc/workflows/__tests__/waveResumeQueueParity.test.js` *(new)* | — | 2 | T-01 | ⬚ |
| T-05 | **GREEN — the extraction (D-5, D-1).** In `orchestrate-dev.js`: add the three frozen catalogues (`RESUME_OUTCOMES`, `RESUME_PROVENANCE`, `WAVE_IGNORE_REASONS`) and `ANCESTRY_INDEPENDENT_CODES`; add `classifyWaveLedger` implementing §3.2's ordered guard table; rewire `main()`'s inline chain to the optimistic-then-reclassify lazy-probe protocol of §2.2. **No announcement or report text changes in this task.** Replace the INTERIM commentary with the formalised contract citing this TSPEC (D-1) — comment-only, folded here because it has no independent oracle and because this is the task that restructures the block it describes. **Regression-net invariant (RT-2): `waveExecution.test.js` is byte-unchanged by this task and green.** | `pdlc/workflows/__tests__/waveResume.test.js` | `pdlc/workflows/orchestrate-dev.js` | 3 | T-02 | ⬚ |
| T-06 | **GREEN — constraints promotion (D-10, OB-F4 / REQ OB-2).** Append a **new `## 5`** to `docs/_constraints/pdlc-wave-gate-baseline.md` at the next unoccupied number and next unoccupied ids, carrying `M-WVR-1` (replay cost: 7 no-op dispatches over waves 1–3 of a 16-wave plan) and `M-WVR-2` (a completed task may legitimately produce no commit; stray agent commits observed), each with a Measured-by command. Bump the file's `Version` to the next version **above whatever is found at promotion time** (found at `origin/main`: `1.2 · 2026-08-20`, sections through `## 4`, ids through `M-WG-14` ⇒ `## 5`, `1.3`). The new section states the version it was checked against and records that `M-WG-6` was **reviewed and left**, not missed. Docs-only; no code. **ATs:** the `M-WVR-*` presence arm of AT-14's file (T-03). | `pdlc/workflows/__tests__/waveResumeRepoState.test.js` | `docs/_constraints/pdlc-wave-gate-baseline.md` | 3 | T-03 | ⬚ |
| T-07 | `[Fake first]` **RED — the integration suite, sole owner of `waveExecution.test.js`.** Three parts, one task because TSPEC §5.3 requires this file to be owned by exactly one task: (a) harness extensions **H-1** (optional `events` array; both the `_runCommand` and `_git` doubles append `["runCommand", cmd]` / `["git", …argv]`; existing per-double logs unchanged) and **H-2** (optional `failWriteOn(path, callIndex)` predicate; default keeps the current always-capture behaviour) — both additive and default-off, so with neither supplied `makeLedgerArgs` returns exactly what it returns today; (b) the **three** whole-string assertion updates TSPEC §2.4 enumerates, each to the new string transcribed as a literal, **no matcher relaxed**, no other assertion in the ledger `describe` touched; (c) every new integration case of TSPEC §5.4 — AT-01, AT-02 (per-code runs incl. IG-6's positive conjunct), AT-03 (`merge-base` call lists `toEqual([])` / `toEqual([[…]])`), AT-04 (H-1 interleaving), AT-05, AT-06, AT-07, AT-08 (i)(ii), AT-09 + companion, AT-10, AT-11, AT-12 (four conjuncts), AT-13 announcement-table set equality, AT-15 arms 1 and 2 (H-2; D-6), AT-17 integration half, AT-18 — plus the one arm owed to the existing `describe("computePlanHash — the ledger's plan fingerprint")`: hashing the same PLAN **text** twice through `parsePlanTasks`/`computeWaves` (extended in place, never duplicated). | `pdlc/workflows/__tests__/waveExecution.test.js` *(existing, at `origin/main`)* | — | 4 | T-05 | ⬚ |
| T-08 | **Generative property suite.** `fast-check@^4.9.0` (already a devDependency at `origin/main`), split into its own file on the precedent of `pdlc/workflows/__tests__/advisoryHelperProperties.test.js`. P-1 round trip, P-2 reader totality, P-3 classifier totality, P-4 hash discrimination — with P-4's bounded-corpus caveat stated in the suite. `fc.assert(fc.property(…))` at fast-check's default run count, no pinned seed, one `describe` per subject, law named in the title (`TOTALITY:`, `ROUND-TRIP:`). **ATs:** none directly; this is the law-level net behind AT-02/AT-13 and TSPEC §5.7. | `pdlc/workflows/__tests__/waveResumeProperties.test.js` *(new)* | — | 4 | T-05 | ⬚ |
| T-09 | **GREEN — announcements and report row (D-2, D-3).** In `orchestrate-dev.js`: append ` (provenance: operator-set)` / ` (provenance: automatic)` to each of the five announcing rows of TSPEC §2.4 — **after the sentence's terminal punctuation and outside every existing parenthesis**, never interpolated — leaving the IG-6 row silent and leaving the config-validation `is not a valid value` notice untouched (the one excluded notice, named in §2.4). Extend the executed Phase I `✅` row's detail with resume point and provenance, and the `⏭` row's detail with ` (provenance: automatic)` outside the existing parenthesis so `toContain("recorded green (wave ledger)")` still passes. Per-wave skip lines and the operator banner's shipped sentence body unchanged. | `pdlc/workflows/__tests__/waveExecution.test.js` | `pdlc/workflows/orchestrate-dev.js` | 5 | T-07 | ⬚ |
| T-10 | **Coverage floor (RT-7, TSPEC §5.8).** Run `npm run test:coverage` from `pdlc/workflows` (`--per-file --branches 85`) and close every gap this feature opened — the eight classifier arms, the seven renderer closures, the lazy-probe short-circuit, and the announcement/report branches — by adding **unit** arms only, in the file this task owns. Report the measured per-file branch number for `orchestrate-dev.js` in the task's output, so the floor is an observed number rather than a claim. | `pdlc/workflows/__tests__/waveResume.test.js` | — | 6 | T-09, T-08, T-06, T-04 | ⬚ |

### 2.2 Batch composition and gate wording

Batches re-derive mechanically as `batch == max(batch of dependencies) + 1`; sources are batch 1.
The derivation is shown so a reviewer checks arithmetic, not intent.

| Batch | Tasks | Files written this batch (pairwise disjoint) | Gate wording |
|---|---|---|---|
| 1 | T-01 | `__tests__/waveResumePreflight.test.js` | Full `pdlc/workflows` suite green, **including** T-01. A red T-01 is the rebase (OB-F1) missing; it is blocking work, not a flaky gate. |
| 2 | T-02, T-03, T-04 | `__tests__/waveResume.test.js`; `__tests__/waveResumeRepoState.test.js`; `__tests__/waveResumeQueueParity.test.js` | **RED-terminal.** *New tests fail for exactly two specified reasons — `classifyWaveLedger` and the three catalogues are not yet exported (T-02), and `M-WVR-1`/`M-WVR-2` are not yet in the baseline file (T-03) — and every pre-existing test is green.* T-04 and T-03's AT-14 arms are green in this batch. |
| 3 | T-05, T-06 | `orchestrate-dev.js`; `docs/_constraints/pdlc-wave-gate-baseline.md` | Full suite green, **and** `waveExecution.test.js` byte-unchanged versus batch 2 (`git diff --stat` over that path is empty for T-05's commit — RT-2's regression-net invariant, mechanically checkable). |
| 4 | T-07, T-08 | `__tests__/waveExecution.test.js`; `__tests__/waveResumeProperties.test.js` | **RED-terminal.** *New integration tests and exactly the three enumerated assertion updates fail because the provenance clause and the resume-aware report detail do not exist yet; every other pre-existing test — including all four prefix matchers and both `startsWith` negatives TSPEC §2.4 names — is green.* T-08 is green in this batch. |
| 5 | T-09 | `orchestrate-dev.js` | Full suite green, including every assertion batch 4 left red. Nothing else in the ledger `describe` changed. |
| 6 | T-10 | `__tests__/waveResume.test.js` | Full suite green **and** `npm run test:coverage` from `pdlc/workflows` exits 0 (`--per-file --branches 85`). |

**Why batches 2 and 4 are RED-terminal, and what that costs.** Rule 3 of the batch-safety contract
makes red-before-green a dependency edge: a green implementation task lists its red-test task in
`Deps`, so the red tests are necessarily in an earlier batch than the code that satisfies them. A
blanket "full suite green after every batch" is therefore unsatisfiable here, which is exactly the
case the rule's split gate wording exists for. The cost is recorded honestly as RK-1 in §4.4 —
under a script-owned gate the runtime evaluates a wave's gate mechanically and has no notion of a
declared RED-terminal wording — together with the two ways to run it.

**Why `waveExecution.test.js` is one task and not four.** TSPEC §5.3 makes it a design obligation
on this PLAN: the file is large, heavily shared, and `makeLedgerArgs` is shared by the whole ledger
`describe`, so H-1/H-2 cannot be split from the cases that use them without two tasks appending to
one physical file. Rule 2 is unenforceable-by-prose for precisely this shape — the green gate
cannot detect last-writer-wins between concurrent agents — so the file has exactly one owner
(T-07) in exactly one batch, and every other file this feature touches is new and single-owned for
the same reason.

**Why T-05 and T-09 are two tasks and not one.** They both write `orchestrate-dev.js`, so rule 2
alone would force them apart, but the binding reason is RT-2: an extraction that ships in the same
diff as an announcement change has no regression net, because the net is the very assertion set the
announcement change edits. T-05 is measured against the shipped `describe` block unchanged; only
then does T-07 edit it.

## 3. Dependencies

### 3.1 Dependency edges, and why each exists

Every edge below is a real ordering constraint, not id order. Task ids are written identically in
the `#` column and in `Deps` cells — bare `T-NN`, never bolded in one and plain in the other.

| Edge | Why |
|---|---|
| T-02, T-03, T-04 → T-01 | §1.2: no task may run before the baseline is proven present. T-03 in particular carries AT-14, which is red pre-rebase, and a red gate in wave mode halts the wave and every wave after it. |
| T-05 → T-02 | Red-before-green. T-02 is the failing unit suite for `classifyWaveLedger` and the three catalogues; T-05 is what turns it green. |
| T-06 → T-03 | Red-before-green. T-03 carries the `M-WVR-1`/`M-WVR-2` presence assertion; T-06 appends the section. |
| T-07 → T-05 | The integration cases assert on the classifier's resolved outcomes and on the lazy-probe call counts, which do not exist until T-05. It is also rule 2: T-07 must not append to `waveExecution.test.js` in the batch that proves T-05 left it unchanged. |
| T-08 → T-05 | P-3 quantifies over `ClassifyInput` and asserts `outcome ∈ RESUME_OUTCOMES`; both symbols are T-05's. |
| T-09 → T-07 | Red-before-green, and TSPEC §2.4's "never a later fix-the-suite task": the three assertion updates are in T-09's immediate red predecessor, not in a task after it. |
| T-10 → T-09 | The announcement and report branches are the last branches added; the floor is measured over the complete diff. |
| T-10 → T-08, T-06, T-04 | The floor is measured over the whole suite as it will merge; a suite still missing the property or repo-state files would measure a different number. |

**No cycle.** The edge set is `T-01 → {T-02,T-03,T-04}`, `T-02 → T-05`, `T-03 → T-06`,
`T-05 → {T-07,T-08}`, `T-07 → T-09`, `{T-09,T-08,T-06,T-04} → T-10`: a DAG whose topological order
is exactly the batch numbering of §2.2.

### 3.2 Prior-phase baseline pre-flight (T-01)

`BL-PREREQ` symbols and files, asserted **present** at HEAD and nothing more — never the shape T-05
creates:

| Subject | Assertion form | Where it lives at `origin/main` |
|---|---|---|
| `WAVE_STATE_PATH`, `parseWaveLedger`, `computePlanHash`, `formatWaveLedger`, `IMPLEMENTATION_DEFAULTS` | importable / present on the module's exports | `pdlc/workflows/orchestrate-dev.js` |
| `docs/_constraints/pdlc-wave-gate-baseline.md` | file exists and is tracked | tracked at `origin/main`; **absent in this tree** |
| `/.claude/pdlc-wave-state.json` | a line exists in `.gitignore` | `.gitignore` at `origin/main`; **absent in this tree** |
| `test:coverage`, `c8`, `fast-check` | keys present in the manifest | `pdlc/workflows/package.json` at `origin/main`; **absent in this tree** |
| `makeLedgerArgs`, `ledgerWrites`, `PLAN_THREE_WAVES`, `CONFIG_WITH_TEST_COMMAND` | referenced in the ledger harness | `pdlc/workflows/__tests__/waveExecution.test.js` at `origin/main` |

`classifyWaveLedger`, `RESUME_OUTCOMES`, `RESUME_PROVENANCE`, `WAVE_IGNORE_REASONS` and
`ANCESTRY_INDEPENDENT_CODES` are **deliberately not** in this table: they do not exist at
`origin/main` either (verified: zero occurrences), and asserting them here would make the pre-flight
gate assert the new shape a dependent task creates, which the gate's contract forbids.

`pdlc/workflows/__tests__/waveResumePreflight.test.js` is a fifth new test file beyond the four
TSPEC §5.3 names. It is declared new here and is a PLAN-level artifact — the pre-flight gate — not
a TSPEC test category. It is kept out of `waveResumeRepoState.test.js` on purpose: that file is
T-03's, and the gate must run in an earlier batch than any file whose assertions the gate protects.

### 3.3 File-ownership manifest (per batch, mechanically auditable)

Every physical file any task creates or appends to, with its single owning task. Two tasks in the
same batch never share a row's file.

| File | New? | Owning task | Batch |
|---|---|---|---|
| `pdlc/workflows/__tests__/waveResumePreflight.test.js` | new | T-01 | 1 |
| `pdlc/workflows/__tests__/waveResume.test.js` | new | T-02, then T-10 | 2, then 6 |
| `pdlc/workflows/__tests__/waveResumeRepoState.test.js` | new | T-03 | 2 |
| `pdlc/workflows/__tests__/waveResumeQueueParity.test.js` | new | T-04 | 2 |
| `pdlc/workflows/orchestrate-dev.js` | existing (tracked at `origin/main`) | T-05, then T-09 | 3, then 5 |
| `docs/_constraints/pdlc-wave-gate-baseline.md` | existing (tracked at `origin/main`; absent in this tree until the rebase) | T-06 | 3 |
| `pdlc/workflows/__tests__/waveExecution.test.js` | existing (tracked at `origin/main`) | T-07 | 4 |
| `pdlc/workflows/__tests__/waveResumeProperties.test.js` | new | T-08 | 4 |

Two files carry two owners **in different batches**, which rule 2 permits and rule 4 constrains:
`waveResume.test.js` (T-02 → T-10) and `orchestrate-dev.js` (T-05 → T-09). In both cases the later
task is strictly downstream of the earlier one through the `Deps` chain
(`T-10 → T-09 → T-07 → T-05 → T-02`), so neither is a shared-prerequisite race.

**Files not in this manifest, and why (D-9, FSPEC OB-F6, TSPEC AT-17):**

- **`.claude/pdlc-wave-state.json` is owned by no task and named by no row.** It is
  consumer-local, untracked, and excluded by a root-anchored ignore rule. This absence is the
  subject of T-03's finite check — the assertion reads this manifest, so the claim is falsifiable
  rather than editorial.
- **`pdlc/workflows/dist/*` is owned by no task.** It is generated by
  `node pdlc/workflows/build-runtime.mjs`; §3.4 carries it per wave through
  `implementation.postWavePathspecs`. A task that hand-edited it would be editing a build output.
- **`.claude/workflows/*` is owned by no task.** It is the untracked consumer copy, produced by
  `pdlc/hooks/scripts/sync-workflows.sh`, never committed.
- **`.claude/pdlc.config.json` is owned by no task.** It is untracked run configuration (§3.4).

### 3.4 Integration points and run configuration

| Point | Value | Why |
|---|---|---|
| `implementation.testCommand` | the `pdlc/workflows` jest suite | The script-owned wave gate. Present ⇒ the gate is script-owned; absent ⇒ the run degrades to the legacy self-report gate, which would make every gate wording in §2.2 unenforceable. |
| `implementation.postWaveCommand` | `node pdlc/workflows/build-runtime.mjs` | RT-5: editing `orchestrate-dev.js` leaves `pdlc/workflows/dist/` stale, and the suite itself reds on stale artifacts. The post-wave command runs **before** the gate (`pdlc-wave-gate-baseline.md` `M-WG-2`), which is what makes this ordering work. |
| `implementation.postWavePathspecs` | `pdlc/workflows/dist/` | The regenerated artifacts are committed per wave as a chore commit. This value names **no** consumer-local path, and in particular not `WAVE_STATE_PATH` — asserted by T-03. |
| `implementation.startWave` | **unset** | Leaving it unset is what lets this feature's own resume mechanism govern a re-invocation. Setting it would suppress record consultation entirely (FSPEC BR-04) — on the very feature whose behaviour is under test. |
| Coverage floor | **T-10**, not `postWaveCommand` | See RK-2 in §4.4 and the erratum this dispatch raises: `implementation.postWaveCommand` is a single global key (TSPEC V-13 closes the config surface at four keys), so "the last implementation wave's `postWaveCommand`" is not expressible; setting it globally would run `test:coverage` after **every** wave, including waves 2 and 4, where new branches are deliberately not yet covered. |
| Upstream branch | `feat-pdlc-wave-resume`, rebased onto the default branch | OB-F1. T-01 is the gate that proves it landed. |

## 4. Verification
