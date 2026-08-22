# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md`
**Date:** 2026-08-21
**Iteration:** 1
**Scope:** Testing lens — testability, TDD ordering, batch-DAG mechanics, oracle falsifiability, coverage instrumentation.

## Grounding

Every claim below was checked against the repository, not against the document. What I ran, and
what it returned:

| Check | Command | Result |
|---|---|---|
| PLAN §4.6 `parsePlanTasks` | shipped parser from `git show origin/main:pdlc/workflows/orchestrate-dev.js` (`export function parsePlanTasks`) run over the PLAN | 10 tasks, `warnings` null, ids `T-01…T-10` — **matches** |
| PLAN §4.6 batch column | `planBatch` column vs. re-derived `max(dep batch)+1` | both `1,2,2,2,3,3,4,4,5,6` — **no desync** |
| PLAN §4.6 topological batches | `computeTopologicalBatches` | `[[T-01],[T-02,T-03,T-04],[T-05,T-06],[T-07,T-08],[T-09],[T-10]]` — identical to the column |
| PLAN §4.6 ownership manifest | `parsePlanOwnership` | 10 rows, one per task, `nearMisses: []` — **exactly one manifest, as claimed** |
| PLAN §4.6 waves | `computeWaves(tasks, ownership)` | six ownership-disjoint waves, identical to the topological batches — **no same-batch same-file collision** |
| PLAN §1.2 tree facts | `git rev-list --count HEAD..origin/main`; `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js`; `ls docs/_constraints/`; `grep -n '.claude' .gitignore`; `cat pdlc/workflows/package.json` | `1637`; `0`; no `pdlc-wave-gate-baseline.md`; only `/.claude/workflows/` at line 29; only `test`/`test:watch`, no `c8`/`fast-check` — **all five verified true** |
| PLAN §1.2 / §3.2 `origin/main` facts | symbol counts in `git show origin/main:pdlc/workflows/orchestrate-dev.js` | `WAVE_STATE_PATH` 10, `parseWaveLedger` 2, `computePlanHash` 2, `formatWaveLedger` 3, `writeWaveLedger` 2, `headCorroborated` 2, `IMPLEMENTATION_DEFAULTS` 8; `classifyWaveLedger`/`RESUME_OUTCOMES`/`RESUME_PROVENANCE`/`WAVE_IGNORE_REASONS`/`ANCESTRY_INDEPENDENT_CODES` all **0** — the new/existing split is exactly as stated |
| PLAN §2 harness reuse | occurrence counts in `git show origin/main:pdlc/workflows/__tests__/waveExecution.test.js` | `makeLedgerArgs` 18, `ledgerWrites` 7, `PLAN_THREE_WAVES` 9, `CONFIG_WITH_TEST_COMMAND` 29 — **matches the PLAN's four counts exactly**; file is 2,761 lines as claimed |
| PLAN §4.1 suite layout | `git ls-tree --name-only origin/main pdlc/workflows/__tests__/` | `waveExecution.test.js` present; `waveResume`, `waveResumeProperties`, `waveResumeQueueParity`, `waveResumeRepoState`, `waveResumePreflight` — **none exist**, and every task row declaring one declares it new. Claim holds. |
| PLAN §4.1 AT set-equality | FSPEC `**AT-NN` headings | exactly `AT-01…AT-18`; §4.1 maps all eighteen plus `P-1…P-4`. **No AT unowned, none invented.** |
| PLAN T-06 promotion target | `git show origin/main:docs/_constraints/pdlc-wave-gate-baseline.md` | `Version 1.2 · 2026-08-20`, sections through `## 4`, ids through `M-WG-14` — the PLAN's `⇒ ## 5, 1.3` derivation is **correct** |
| PLAN §2.2 red-gate premise | `orchestrate-dev.js:15436` (`origin/main`) | `Error: Wave ${waveNum} test gate failed — …` is a halt path under `scriptGate` — RK-1's premise is real, not hypothetical |
| PLAN §3.4 gate-command sensitivity | `wc -l` and branch-token count over `origin/main:pdlc/workflows/orchestrate-dev.js` | 16,336 lines, ~2,054 branch points by token proxy — see F-05 |
| PLAN T-08 precedent | `git show origin/main:pdlc/workflows/__tests__/advisoryHelperProperties.test.js` | 27 `fc.assert` sites, and `const runs = { numRuns: 500 }` at `:261` — see F-06 |

Two things I want to say plainly before the findings: the §4.6 parse-verification table is the
first PLAN I have reviewed in this repo where **every mechanical claim reproduced exactly** when I
re-ran the shipped parser myself, and the §1.2 precondition table is likewise true in both
directions. The findings below are all about the *execution model* of the batches, not about the
task graph, which is sound.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | Batches 2 and 4 are declared RED-terminal, but RK-1's escape (a) requires `implementation.startWave`, which §3.4 forbids for this feature — so the two RED batches have no executable green path and the run does not terminate. | §2.2, §3.4, §4.4 RK-1 |
| F-02 | High | Cross-Feature | Nothing in the PLAN verifies that the run is actually script-gated. If `implementation.testCommand` is unset the runtime degrades to the legacy self-report gate and every "full suite green" gate wording in §2.2 becomes an agent's claim about itself. | §2.2, §3.4, §4.5 |
| F-03 | High | Local | T-10 is assigned to close the coverage gaps in "the announcement/report branches", but is restricted to unit arms in the one file it owns — those branches live in `main()` and are only reachable through `waveExecution.test.js`, which T-07 owns. The last batch's gate cannot be discharged as written. | §2.1 T-10, §3.3 |
| F-04 | Medium | Local | §4.3's four mutations have no owning task, no execution step and no DoD checkbox — they are asserted "killed by", never observed RED. T-04 already sets the correct precedent in the same document. | §4.3, §4.5 |
| F-05 | Medium | Cross-Feature | A per-file 85% branch floor over a 16,336-line module is arithmetically insensitive to this feature's ~20 new branches; `npm run test:coverage` exiting 0 is therefore not evidence that T-10 closed anything. | §2.1 T-10, §4.5 |
| F-06 | Medium | Local | T-08 specifies "fast-check's default run count, no pinned seed", but the precedent file it cites runs `numRuns: 500` (`advisoryHelperProperties.test.js:261`). The PLAN weakens the repo's own property-test depth by 5× while citing that file as its model. | §2.1 T-08 |
| F-07 | Medium | Local | `implementation.testCommand` is given as prose ("the `pdlc/workflows` jest suite") rather than transcribed as the literal command string. It is the oracle every batch gate rests on; it must be a literal, not a description. | §3.4 |
| F-08 | Low | Local | T-09's row says "extend the executed Phase I `✅` row's detail with resume point and provenance" without the condition (`N > 1`) that keeps the shipped-assertion count at three. Unconditional appending breaks two shipped assertions outside the named three. | §2.1 T-09, §4.5 |
| F-09 | Low | Local | T-01 has no stated lifecycle: it ships permanently, becomes tautological the moment the rebase lands, and restates T-03's AT-14 conjunct in the weakened `includes`-shaped form T-03 explicitly forbids. | §2.1 T-01, §3.2 |
| F-10 | Low | Process | §1.2 cites bare line anchors (`.gitignore` line 29, `.gitignore` line 41, `package.json` line 9) where the verbatim content is already quoted; per DEC-DOC-01 these are findings, and here they will additionally rot at the rebase. | §1.2 |

### F-01 (High) — the RED-terminal batches have no executable green path

The PLAN is honest that batches 2 and 4 end red (§2.2) and records the tension as RK-1. What RK-1
does not survive is its own §3.4.

Grounded facts:

- A red script-owned wave gate is a halt: `orchestrate-dev.js:15436` at `origin/main` throws
  ``Error: Wave ${waveNum} test gate failed — `${implConfig.testCommand}` did not pass`` inside the
  `if (scriptGate)` branch of the wave loop. This is not a soft signal.
- RK-1 option (a) is "accepting the halt and re-invoking with `implementation.startWave` pointing at
  the green wave".
- §3.4 states `implementation.startWave` is **unset**, and gives the reason: "Setting it would
  suppress record consultation entirely (FSPEC BR-04) — on the very feature whose behaviour is
  under test."

So option (a) is the one action §3.4 forbids. And without it the run cannot advance: after the
wave-2 halt, a re-invocation consults the wave ledger, which records waves 1 green and resumes at
wave 2 — which is red-terminal again, by construction, forever. The feature's own resume mechanism
guarantees the loop rather than breaking it.

Option (b), "run Phase I for batches 2→3 and 4→5 as paired dispatches", names no runtime affordance.
Phase I dispatches waves as `computeWaves` returns them; there is no documented input that fuses two
topological batches into one wave. If such an affordance exists, the PLAN must cite it `file:symbol`;
if it does not, (b) is not an option, and RK-1 has zero mitigations rather than two.

There is a further mechanical wrinkle that makes (a) worse than it reads: on a gate failure the
wave's agent-authored work survives **uncommitted** (`pdlc-wave-gate-baseline.md` `M-WG-4`, promoted
at `origin/main`). So the RED tests batch 2 was supposed to produce are not committed when the halt
fires; the operator must hand-commit them before re-invoking. That is manual surgery inside a phase
whose whole point is being script-owned.

**What must change.** Adjudicate the RED/GREEN split inside this document rather than deferring it to
an operator at wave 2. The straightforward resolution, and the one the ownership manifest already
permits: **merge each RED/GREEN pair into one task**, because in all three pairs the two tasks own
*different* files and therefore do not collide —

| Pair | Files | Legal to merge? |
|---|---|---|
| T-02 + T-05 | `waveResume.test.js` / `orchestrate-dev.js` | yes — disjoint; and neither touches `waveExecution.test.js`, so RT-2's byte-unchanged invariant is preserved intact |
| T-03 + T-06 | `waveResumeRepoState.test.js` / `pdlc-wave-gate-baseline.md` | yes — disjoint |
| T-07 + T-09 | `waveExecution.test.js` / `orchestrate-dev.js` | yes — disjoint |

Merging makes every wave green-terminal, which is what the runtime can actually evaluate. The cost
is that "the red was observed first" becomes a task-report claim rather than a batch gate — and this
document already accepts exactly that trade for T-04, whose falsification arm "is executed and
recorded in the task's report". Make the same trade explicitly here, or keep the split and cite the
runtime affordance that makes (b) real. Either is fine; leaving the choice to the operator is not,
because the operator's only documented option contradicts §3.4.

### F-02 (High) — no task proves the gate is script-owned

§3.4 states the consequence precisely — "Present ⇒ the gate is script-owned; absent ⇒ the run
degrades to the legacy self-report gate, which would make every gate wording in §2.2 unenforceable"
— and then assigns nobody to check it.

This is the "a test that can only pass" pattern lifted to the plan level. `.claude/pdlc.config.json`
is untracked (§3.3 says so itself), so nothing in the repository pins it; if the key is missing or
misspelled, the runtime announces the degradation once and then lets each wave's agent self-report
green. Every one of the six gate wordings in §2.2, and the DoD's test-passage criteria, silently
become claims the implementer makes about their own work. Nothing in the PLAN would red.

T-01 already exists and is already exactly this shape — a repo-state pre-flight over run
preconditions. It is the right home.

**What must change.** Add to T-01 (i) an assertion that the resolved `implementation.testCommand`
equals the literal command string F-07 asks §3.4 to transcribe, and (ii) a DoD checkbox that the
run report for Phase I shows **no** gate-degradation notice and each wave row names the script-owned
gate. The positive conjunct matters: "no degradation notice" alone is an absence-only oracle, so
pair it with the positive observation that the gate command was invoked — `M-WG-3` records the
observable, and §2.2's own batch-3 wording already relies on `script-owned gate` appearing verbatim
in the Phase I detail (`orchestrate-dev.js:15628` builds it).

### F-03 (High) — T-10 cannot reach the branches it is assigned to cover

T-10's row assigns it four gap classes and one instrument, and the instrument does not reach two of
the classes:

> "close every gap this feature opened — the eight classifier arms, the seven renderer closures, the
> lazy-probe short-circuit, and the announcement/report branches — by adding **unit** arms only, in
> the file this task owns."

The first two classes are fine: `classifyWaveLedger` is pure (§3.2's own contract) and the
`WAVE_IGNORE_REASONS` closures are pure renderers, so both are unit-reachable from
`waveResume.test.js`. The announcement and report branches are not. T-09's own row places them
inside `main()` — "In `orchestrate-dev.js`: append ` (provenance: …)` to each of the five announcing
rows", "extend the executed Phase I `✅` row's detail" — and at `origin/main` those strings are built
in the Phase I wave loop (`orchestrate-dev.js:15620` for the `Skipped — all …` detail, `:15628` for
`All ${waves.length} waves complete (wave mode, …)`). The only harness that drives that path is
`makeLedgerArgs` in `waveExecution.test.js`, and §3.3 gives that file **exactly one owner, T-07**,
whose sole-ownership §2.2 defends at length.

So T-10, in batch 6, discovers uncovered announcement branches and has no legal file in which to
cover them. It cannot append to `waveExecution.test.js` (not its file), and a unit arm in
`waveResume.test.js` structurally cannot enter `main()`.

This is the same defect the role's builder-not-wired rule names, seen from the coverage side: the
production path and the unit path are different paths, and the task charged with the production
path has been handed only the unit path.

**What must change** — one of:

1. Give T-10 a second manifest row for `pdlc/workflows/__tests__/waveExecution.test.js`. This is
   **legal under rule 2**: T-07 is batch 4, T-10 is batch 6, and `T-10 → T-09 → T-07` is a real
   `Deps` chain, so it is exactly the same shape §3.3 already permits for `orchestrate-dev.js`
   (T-05 batch 3 → T-09 batch 5). Then drop the words "unit arms only" from T-10's row.
2. Or move the announcement/report coverage obligation into T-09 (which owns the production edit and
   whose predecessor owns the test file), and narrow T-10 to the pure-unit gaps it can actually
   reach.

Whichever is chosen, the DoD's coverage checkbox should name the task that owns each gap class, so
the assignment is checkable before the batch runs rather than after it halts.

### F-04 (Medium) — the four mutations in §4.3 are claimed, never run

§4.3 is a good table and it is the right analysis. But it is a table of *predictions*: "killed by",
"landed in". No task is instructed to perform any of the four mutations, no task reports the RED,
and §4.5 has no checkbox for it. Under this PLAN the four mutations are believed, not observed.

The fourth row is the one this matters most for, because it is the one that is invisible to
behaviour: "Resolve the ancestry probe eagerly … Killed by AT-03/AT-11 `merge-base` call counts,
`toEqual` only". TSPEC §5.5 makes the point sharper — the shipped ancestry test's `toContainEqual`
**passes** under that mutation. A matcher that load-bearing deserves to be demonstrated, not
asserted; if T-07's author writes `toContainEqual` by muscle memory, nothing in this PLAN notices.

The document already knows the right shape. T-04's row says its falsification arm "is executed and
recorded in the task's report". Apply that to §4.3.

**What must change.** Assign each of the four mutations to the task that owns the killing test
(rows 1–4 all land in T-07, except row 1's unit half in T-02), instruct that task to apply the
mutation, observe RED, revert, and record the observed failure in its task report; and add one DoD
checkbox: "each of §4.3's four mutations was applied and observed RED against its named oracle."

### F-05 (Medium) — the per-file 85% floor cannot detect this feature's uncovered branches

The floor is real and correctly located: `origin/main:pdlc/workflows/package.json:9` defines
`test:coverage` as `c8 npm test -- --runInBand && c8 report --check-coverage --per-file --branches
85 …`, the c8 `include` list carries `orchestrate-dev.js`, and `.github/workflows/pr-tests.yml`
runs `npm run test:coverage` in the Unit tests job. T-10 correctly runs the gate command rather
than claiming membership of the include list — that is the right instinct and I want to credit it.

The problem is sensitivity, and it is arithmetic. `orchestrate-dev.js` at `origin/main` is 16,336
lines with roughly 2,054 branch points by token proxy (`if (`, `?`, `??`, `&&`, `||`). This feature
adds on the order of twenty: eight classifier arms, seven renderer closures, one lazy-probe
short-circuit, and the announcement/report branches. Twenty branches out of ~2,000 is about **one
percent of the denominator**. Unless the module happens to sit within one point of 85%, every one
of this feature's new branches can be entirely uncovered and `npm run test:coverage` still exits 0.

So the DoD line "`npm run test:coverage` … exits 0" is not falsifiable with respect to *this
feature*. It is a regression guard for the module, which is worth keeping, but it is not the oracle
T-10's purpose statement ("close every gap this feature opened") requires.

**What must change.** Keep the whole-file floor as-is, and add a delta-scoped oracle that can
actually fail. The cheapest form that needs no new tooling: T-10 reports c8's per-file **uncovered
line list** for `orchestrate-dev.js` and asserts, in the task report, that no uncovered line falls
inside the ranges this feature introduced — plus a transcribed mapping table (each of the eight
classifier arms, seven renderers, the short-circuit, and each announcement/report branch → the named
test that covers it), so a deleted case fails the set rather than moving a percentage by 0.05.

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*

## Verdict

*(pending)*
