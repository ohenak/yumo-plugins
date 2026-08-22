# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PLAN-pdlc-wave-resume.md` (Version 1.1, `b8ddcc56`)
**Date:** 2026-08-21
**Iteration:** 2
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Review Basis

**There is no `CROSS-REVIEW-product-manager-PLAN-v1.md`.** The only round-1 PLAN review on this
branch is `CROSS-REVIEW-test-engineer-PLAN-v1.md`, and the PLAN's own `Cross-Reviews` metadata field
names exactly that one file. The delta protocol therefore has no product-lens baseline to diff
against: I have no prior findings of my own to check for resolution. This round is consequently a
**full first product pass** over PLAN v1.1, written to the v2 filename the dispatch pins so this
phase's round history stays keyed correctly.

Every claim below is grounded in the repository, not in the document. What I ran:

| PLAN claim | Verification | Result |
|---|---|---|
| §1.2 branch is 1,637 commits behind | `git rev-list --count HEAD..origin/main` | `1637` — exact |
| §1.2 mechanism absent here | `grep -c WAVE_STATE_PATH pdlc/workflows/orchestrate-dev.js` | `0` — exact |
| §1.2 baseline file absent here, tracked at main | `ls docs/_constraints/`; `git ls-tree origin/main docs/_constraints/` | absent here; `pdlc-wave-gate-baseline.md` tracked at `origin/main` |
| §1.2 `test:coverage`/`c8`/`fast-check` absent here, present at main | `pdlc/workflows/package.json` in both trees | here: only `test`, `test:watch`. At main: `test:coverage` with `--per-file --branches 85`, `c8@^10.1.3`, `fast-check@^4.9.0` |
| §1.2 ignore rule verbatim, same block as `/.claude/workflows/` | `git show origin/main:.gitignore` | line 40 `/.claude/workflows/`, line 41 `/.claude/pdlc-wave-state.json` — exact |
| §1.2 new exports resolve nowhere | `classifyWaveLedger`, `RESUME_OUTCOMES` in `git show origin/main:pdlc/workflows/orchestrate-dev.js` | `0` occurrences each — exact |
| §2.1 harness occurrence counts 18 / 7 / 9 / 29 | `makeLedgerArgs`, `ledgerWrites`, `PLAN_THREE_WAVES`, `CONFIG_WITH_TEST_COMMAND` at main | 18, 7, 9, 29 — exact |
| §2.2 a red script-owned gate is a **halt** | `orchestrate-dev.js:15432` `if (scriptGate)` → `:15436` message → `throw haltError(testGateMessage, …)`; the in-source comment at `:15498` reads "halts the wave with its work uncommitted" | confirmed, including `M-WG-4`'s uncommitted-work consequence |
| §3.4 `implementation.testCommand` literal | `cat .claude/pdlc.config.json` | string-identical to §3.4's transcription, character for character |
| §3.4 / RK-2 config surface closed at four keys | `Object.keys(IMPLEMENTATION_DEFAULTS)` at main | `["testCommand","postWaveCommand","postWavePathspecs","startWave"]` — one *global* `postWaveCommand`, so RK-2's premise holds |
| §4.1 suite layout: one of six files exists | `git ls-tree origin/main pdlc/workflows/__tests__/`; `ls pdlc/workflows/__tests__/` | only `waveExecution.test.js` exists (2,761 lines at main); the other five match nothing in either tree, and every task row naming one declares it *(new)* |
| §4.3 / RK-3 module size 734,711 B, §4.5.1 16,336 lines | `git show origin/main:pdlc/workflows/orchestrate-dev.js \| wc -lc` | `16336  734711` — both exact |
| T-08's `numRuns: 500` precedent | `advisoryHelperProperties.test.js:260-261` at main | `describe("PROP-CTR-05 (generative): …")` with `const runs = { numRuns: 500 }` — exact |
| T-03's promotion target state | `git show origin/main:docs/_constraints/pdlc-wave-gate-baseline.md` | `Version 1.2 · 2026-08-20`, sections through `## 4`, ids through `M-WG-14` — exactly what §2.1 predicts, so `## 5` / `1.3` / `M-WVR-1..2` is right |

**§4.6's parse verification reproduced independently.** I ran the shipped parsers from
`git show origin/main:pdlc/workflows/orchestrate-dev.js` over this PLAN's bytes rather than trusting
the table:

- `parsePlanTasks` → 7 tasks, `warnings: undefined`, dependencies `[] / [T-01] / [T-01] / [T-01] / [T-02] / [T-02] / [T-07,T-08,T-03,T-04]`
- `computeTopologicalBatches` → `[[T-01],[T-02,T-03,T-04],[T-07,T-08],[T-10]]`
- `parsePlanOwnership` → 7 rows, one per task, **`nearMisses: []`**
- `computeWaves` → `[[T-01],[T-02,T-03,T-04],[T-07,T-08],[T-10]]`, ownership-disjoint

Every one matches §4.6 exactly. Phase P's converged-PLAN self-parse will pass.

**Set-equality checks over the enumerated contracts this PLAN claims to close:**

- FSPEC acceptance tests are exactly `AT-01 … AT-18` (18). §4.1 names all eighteen plus `P-1 … P-4`; the sets are equal, with no extra and no omission.
- TSPEC §1.2 delta rows are exactly `D-1 … D-11`. §1.1's table names all eleven with an owning task; the sets are equal.
- FSPEC §2 traces `FSPEC-WVR-01 … -07` onto `REQ-WVR-01 … -10`, all ten covered. Since §4.1 covers every AT, every P0 and P1 requirement — `REQ-WVR-01/02/03/04/09` (P0) and `-05/06/08/10` (P1) — has an owning task. `REQ-WVR-07` (P2) is owned by T-04. **No P0 or P1 requirement is silently dropped.**

## Findings

No High findings. Nothing in this PLAN drops, narrows or reinterprets a P0 or P1 acceptance
criterion, and nothing in it is out of the scope REQ and FSPEC approved.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The rebase this whole PLAN is built around has no named actor or step.** §1.2 correctly proves the precondition is unmet and correctly discharges it *mechanically* — T-01 reds in the cheapest possible wave. But nothing in the PLAN says **who** performs the rebase, or **when**. §3.4's `Upstream branch` row states the target state (`feat-pdlc-wave-resume`, rebased onto the default branch) and names T-01 as "the gate that proves it landed"; it names no actor. §4.5's first DoD box likewise asserts the end state, not the step. Verified consequence: this tree is 1,637 commits behind, so a Phase I dispatch *today* halts in batch 1 with `Error: Wave 1 test gate failed` (`orchestrate-dev.js:15436`), Phase I writes no POSTMORTEM (`pdlc-wave-gate-baseline.md` `M-WG-5`), and the queue row goes `halted` (`M-WG-7`) — a recoverable but entirely avoidable stop for the operator dispatching the phase. The product cost is a discovered hand-off rather than a documented one. **Fix:** extend §3.4's `Upstream branch` row (or add one line to §1.2) naming the actor and the moment — e.g. "the operator rebases the branch onto the default branch **before dispatching Phase I**; T-01 is the gate that proves it landed, not the task that performs it" — so the pre-dispatch obligation is legible without reading the halt. | REQ BL-04 / FSPEC OB-F1 |
| F-02 | Medium | Local | **AT-04's negative arm is a four-member enumerated fixture set, and no row of this PLAN names the four.** FSPEC AT-04 states it explicitly: "the same assertion holds for each of — a resume point at the plan's second wave, at its last wave, a record whose named commit is the tip, and one whose named commit is an earlier ancestor — and no member of that set produces a commit that precedes a whole-tree verification", adding "The set is finite and enumerated in PROPERTIES". §4.1 discharges AT-04 with "T-07 (via H-1's ordered event sink)" and §2.1's T-07 row lists only "AT-04 (H-1 interleaving)". The four fixtures appear nowhere in the PLAN, and §1.3 states "Phase PT's V-wave is outside this feature's scope … no task changes it" — so a reader of this PLAN alone cannot tell whether the enumeration lands here or in PROPERTIES. AT-04 discharges **REQ-WVR-03, a P0**, and the risk this PLAN otherwise guards against everywhere else — silent narrowing of an enumerated contract to one representative case — is exactly what an unnamed four-member set invites. Contrast the rows that do carry their structure: AT-12 "(four conjuncts)", AT-15 "arms 1 and 2", AT-08 "(i)(ii)" / "(iii)". **Fix:** either transcribe the four fixtures into T-07's AT-04 clause, or add one sentence to §4.1 recording that the enumeration is owned by PROPERTIES and that T-07 asserts the law over the set PROPERTIES enumerates — whichever is true, stated once. | REQ-WVR-03 (P0), FSPEC AT-04 |
| F-03 | Low | Local | **AT-10's negative-arm-with-positive-conjunct structure is not carried into the task rows.** FSPEC AT-10 specifies the conjunct precisely — "with a stray unrelated commit added to, or removed from, history, the announced resume point is **the same wave** as without it — the positive assertion is the announced next wave, not the absence of a change". §4.1 discharges AT-10 as a bare "T-07", and §2.1's T-07 row lists a bare "AT-10" among sixteen cases. §4.2 rule 2 restates the general no-absence-only-oracle rule, which is good, but AT-10 is the one AT whose oracle is *specifically* at risk of collapsing into "no change observed" — and it is also the AT whose real-world motivation (`M-WVR-2`: "a completed task may legitimately produce no commit; stray agent commits observed") T-03 is simultaneously promoting to the constraints file. **Fix:** annotate AT-10 in §4.1 as "T-07 (stray-commit pair; positive conjunct = the announced resume point)", matching the annotation discipline already used for AT-03, AT-08, AT-12 and AT-15. | REQ-WVR-06 (P1), FSPEC AT-10 |
| F-04 | Low | Local | **§2.2 presents the runtime halt string as a verbatim quote and drops its leading `Error: `.** The document writes ``Wave ${waveNum} test gate failed — `${implConfig.testCommand}` did not pass``; the shipped construction at `pdlc/workflows/orchestrate-dev.js:15436-15437` (at `origin/main`) is ``Error: Wave ${waveNum} test gate failed — \`${implConfig.testCommand}\` `` + ``did not pass. Output tail:\n…``. The claim the quote supports — that a red script-owned gate throws rather than degrading — is **correct**, and I confirmed the `throw haltError(testGateMessage, …)` two lines below. Only the transcription is imprecise. Flagged because this document's own §4.2 rule 1 holds every expectation to literal transcription, and because §2.2's quote is the evidence for the structural v1.0→v1.1 change; the standard the PLAN sets for its tests is the right standard for its own load-bearing quotes. **Fix:** restore the `Error: ` prefix, or mark the quote as elided. | §4.2 rule 1 (self-consistency) |

**Severity rationale.** F-01 and F-02 are Medium and not High because in both cases the obligation
*is* discharged somewhere — the rebase by T-01's gate, AT-04 by T-07 — and what is missing is the
legibility of who acts and over what set, not the coverage itself. Neither is a dropped requirement,
so neither meets this role's High bar; both are the kind of gap that costs an implementation wave if
left unstated, which is why they are not Low.

## Questions

| ID | Question |
|----|---------|
| Q-01 | §4.1 names six suite files, but TSPEC §5.3's catalogue names **four** new files (`waveResume.test.js`, `waveResumeProperties.test.js`, `waveResumeQueueParity.test.js`, `waveResumeRepoState.test.js`) plus the existing `waveExecution.test.js`. This PLAN adds a fifth new file, `waveResumePreflight.test.js`, and §3.2 declares it as such ("a fifth new test file beyond the four TSPEC §5.3 names, and it **ships permanently**"). I read that as an engineering-lens addition properly declared rather than scope creep — it introduces no product behaviour, discharges no AT, and the reason given (the gate must run in an earlier batch than any file whose assertions it protects) is sound. Confirming the read: is the intent that TSPEC §5.3's file catalogue be treated as the *AT-bearing* suites only, with the pre-flight gate outside it, or should §5.3 gain a fifth row so the two documents' file sets are equal? |
| Q-02 | REQ-WVR-07 (queue parity, P2) is discharged by T-04 as a **characterisation test of the delegation boundary** — `_runPipeline` left at default, payload key set `toEqual(["reqPath"])`, `_readFile` ledger-path string equality — rather than by observing that a queue-delegated run and a direct run resolve the same resume point and provenance, which is what FSPEC AT-16 literally asks for. I verified this is not the PLAN narrowing anything on its own authority: DEC-WVR-07 / O-9 ratifies exactly this substitution, having verified that `orchestrate-queue.js` calls `runPipelineFn({ reqPath: entry.reqPath })` with no seam, config or resume pointer crossing the boundary, and T-04 cites it by name. So the narrowing is approved upstream and I raise no finding. The product question that survives is a forward-looking one for harvest, not for this round: with the parity claim discharged structurally, is there any run-level evidence an operator will ever see that the queue path resumes correctly — or is the first such evidence a production queue iteration? |
| Q-03 | §4.5.1's mapping table ships with its "Covering test named by T-10" column as placeholders, to be filled in by T-10 during implementation. The DoD box requires the table be "complete and every row names a covering test". Is the intended review checkpoint for the filled-in table Phase I's own wave gate, or Phase DOD's `CODE_REVIEW`? The counts (8 / 7 / 1 / 5 / 3) are the falsifiable part and they are already pinned here, so this is a process question about where completeness is *checked*, not a gap in the table. |

## Positive Observations

- **The document verifies itself instead of asserting itself.** §4.6 is not a claim that the PLAN parses — it is a recorded run of the shipped `parsePlanTasks`, `computeTopologicalBatches`, `parsePlanOwnership` and `computeWaves` against this document's bytes, and I reproduced every line of it independently, including `nearMisses: []`. §1.2 does the same thing for the baseline precondition, with the command and its output in a table. Of the sixteen factual claims I re-ran, **sixteen were exact** — including two byte counts, a line count, four occurrence counts and a whole-string config literal. That is a rare standard for a PLAN and it is the single thing most worth keeping.
- **The precondition is discharged mechanically rather than in prose.** §1.2's structural move — make T-01 the first task, a pre-flight gate over exactly the baseline facts, with every other task depending on it — converts "remember to rebase first" into a wave-1 red. Given the verified halt semantics (a red script-owned gate throws and leaves the wave's work uncommitted, `M-WG-4`), failing at the cheapest possible wave is the right product trade, and F-01 asks only that the hand-off be named, not that the design change.
- **The v1.0→v1.1 restructuring is a real engagement with the runtime, not a formatting response.** Round-1 F-01 was answered by proving that a "declared RED-terminal batch" has no referent in the runtime, then moving the red/green split inside the task — and, crucially, §2.3 **states the trade rather than hiding it**: red-before-green is now a task-report claim, that is a genuine loss of mechanical enforcement, and it is bought back three partial ways, none of which is oversold as a promise. RK-1 repeats the same admission in the risk register. Honest accounting of what a revision costs is the behaviour worth reinforcing.
- **Every enumerated contract is closed by set equality, and the PLAN says so at the point of use.** AT-02 over announced reasons (not the six cause labels), AT-13 over three outcomes, AT-08 (iii) over the four `IMPLEMENTATION_DEFAULTS` keys, §4.5.1's mapping table over the branch classes. §4.2 rule 3's refusal to let `toContainEqual` substitute for `toEqual` on the `merge-base` call list is precisely right and is grounded in TSPEC §5.5's observation that the shipped matcher *passes* under the eager-probe mutation.
- **§4.5.1 is the best single addition in this revision.** Recognising that an 85% whole-file floor over ~2,000 branch points cannot see ~20 new ones — "about one percent of the denominator" — and replacing the percentage with a completeness-checked mapping table is exactly the move from a metric that can be satisfied to an oracle that can fail. Pairing it with the observation that five announcement branches and three report branches live in `main()` and are unreachable from a unit file, which is *why* T-10 must own `waveExecution.test.js` too, closes the loop properly.
- **§4.3 promotes four mutations from prediction to executed observation**, with mechanics cheap enough to actually happen (apply, run one file, paste the failure header, `git checkout --`), an owning task per row, and a DoD checkbox. The fourth row's rationale — that the eager-probe mutation is invisible to every behavioural assertion — is the strongest argument in the document for why the matcher discipline is load-bearing.
- **RK-2 refuses to silently deviate from an upstream instruction.** TSPEC §5.8 asks for the coverage floor as "the last implementation wave's `postWaveCommand`"; the PLAN establishes that this is not expressible (one global key — I confirmed `IMPLEMENTATION_DEFAULTS` has exactly the four keys), reassigns the floor to T-10 with a stated reason, and raises the divergence as an erratum instead of quietly re-specifying. That is the correct handling of an upstream defect and I have echoed the erratum in my trailer.
- **Retired ids are retired, not reused.** Keeping `T-05`, `T-06` and `T-09` out of both the `#` column and every `Deps` cell so that round-1 review references stay resolvable is a small, deliberate courtesy to the reviewers of the previous round, and the parser confirms no dangling dependency resulted.

## Recommendation

**Approved with minor changes**

No High findings. Every P0 and P1 requirement traces to an owning task through a complete
`REQ → FSPEC AT → task` chain that I checked by set equality, not containment; all eleven TSPEC
delta rows have owners; nothing out of scope is planned; and no acceptance criterion is narrowed,
broadened or re-triggered relative to the FSPEC text I read alongside it. The one substantive
scope *addition* — a fifth new test file — is declared as such and carries no product behaviour
(Q-01). The one substantive *deviation* from an upstream instruction is raised as an erratum rather
than taken unilaterally (RK-2), which is the correct route.

F-01 through F-04 are all recorded, none gating. Suggested disposition for the author, in priority
order:

1. **F-01** — one line in §3.4's `Upstream branch` row naming the actor and the moment of the
   rebase. Cheapest fix here, and the one that saves an operator an avoidable halt.
2. **F-02** — either transcribe AT-04's four fixtures into T-07's clause or state in §4.1 that
   PROPERTIES owns the enumeration. One sentence either way; pick whichever is true.
3. **F-03** — annotate AT-10 in §4.1 with its positive conjunct, matching the annotation
   discipline the neighbouring rows already use.
4. **F-04** — restore the `Error: ` prefix on §2.2's quoted halt string, or mark it elided.

None of these requires re-running §4.6's parse verification: none touches the task table, the
`Deps` cells or §3.3's ownership manifest, so the parser results I reproduced stay valid. If the
author does touch the task table for F-02, re-run §4.6 — the near miss found and fixed last round
came from exactly that kind of incidental table edit.

One item is routed upstream rather than folded into this verdict, and is emitted as an erratum in
my response trailer: TSPEC §5.8 specifies the coverage floor as an obligation of "the last
implementation wave's `postWaveCommand`", which is not expressible against a config surface TSPEC
V-13 itself closes at four keys with a single global `postWaveCommand` (verified:
`Object.keys(IMPLEMENTATION_DEFAULTS)` is exactly `["testCommand","postWaveCommand","postWavePathspecs","startWave"]`
at `origin/main`). The PLAN's RK-2 already identifies this and reassigns the floor to T-10 with a
stated reason; the defect is the TSPEC's, not this document's, and the PLAN's handling of it is
correct.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

APPROVAL-HASH: sha256:5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85
APPROVAL-HASH-NORMALIZED: sha256:5f5b50db3bd447e661daeceb63a450ef07c23507293e267adde6168b14df1c85
REVIEWED-COMMIT: b8ddcc56fb34713b5b8bd147f88798d2d712c03f
UPSTREAM-STATE: REQ sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f
UPSTREAM-STATE: FSPEC sha256:9a6be7b5a95e9b7f16c30e88154995fdd546a60093a3b3620af24e831552356e
UPSTREAM-STATE: TSPEC sha256:458e9ec676a9d47ea8ddc76ae573e55e510ba4f2572ca00da2dc8256210f85c1
UPSTREAM-STATE: DECISIONS sha256:37b3684d4a042b5dfb3be0b8e259f8db5f4cc8823f61c61ad69db22fb950fd46
