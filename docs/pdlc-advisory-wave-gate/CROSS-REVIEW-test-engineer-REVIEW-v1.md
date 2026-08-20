# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/` (REQ v1.9, FSPEC, TSPEC v1.10, PLAN v1.8, PROPERTIES v1.2) against the branch's implementation at `a0fa1bca`
**Date:** 2026-08-20
**Iteration:** 1

## Evidence Base

Everything below was measured on this checkout at `a0fa1bca`, not read off a document.

| What | How measured | Result |
|---|---|---|
| Suite state | `npm test` in `pdlc/workflows` | 100 suites, 4048 tests: **2 failed**, 3975 passed, 70 skipped, 1 todo |
| The two reds | `documentOracles.test.js` `AT-22` and `PROP-SWEEP-2(b)` | Both are the residuals PLAN v1.7/v1.8 declares inherited and unreachable on this branch — **not** new breakage |
| Advisory suites | `npm test -- __tests__/advisory*.test.js __tests__/waveExecution.test.js` | 8 suites, 398 passed, 1 todo (`PROP-REST-03`, OQ-7's pending boundary — correctly `test.todo`, never `test.skip`) |
| Branch coverage | `npx c8@10 --include=orchestrate-dev.js --check-coverage --branches 85 … npm test` | **88.07 %** branch, 97.32 % lines on `orchestrate-dev.js` — the DC-09 floor is met |
| Branch freshness | `git rev-list --left-right --count HEAD...origin/feat-pdlc-advisory-wave-gate` | `1016 / 298` — diverged, local HEAD newer (see F-12) |

The suite is green where the PLAN says it will be green, and the coverage floor holds. The findings
below are **not** about a red suite; they are about behaviour the REQ requires that the shipped code
does not perform, and about ACs whose only proof is a test that cannot fail.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | E-6's three script-checked conjuncts are not implemented — `PROMOTES`/`PROMOTES-TASK` exist only inside the prompt string, and the envelope admits every later-wave-owned path with no symbol check | AC-3.1 E-6, NFR-1, TSPEC §3.4, PROP-ENV-08 |
| F-02 | High | Local | AC-3.3's prohibitions (f) and (g) are unenforced; `A6_PROHIBITIONS` is dead config with no production reader, and none of PROP-ENV-10's eleven per-operation tests exists | AC-3.3, AC-4.3, PROP-ENV-10 |
| F-03 | High | Local | The advisory record entry carries no wave number, no root-cause class and no repair paths — the captured class flows only to the halt fields | AC-6.1, AC-4.6, PROP-REC-01 |
| F-04 | High | Local | The escalation-log entry carries no root-cause class, so `plan-ordering-defect` is not countable from `ESCALATIONS.md`; `advisoryEscalationLog.test.js` contains zero A6 references | AC-6.2, AC-6.4, PROP-REC-03/04/06/07 |
| F-05 | High | Local | AC-1.5's widened inapplicability notice is branch-new production code with **zero** tests anywhere — none of PROP-SEAM-07's four arms and none of PROP-SEAM-08 | AC-1.5, PROP-SEAM-07, PROP-SEAM-08 |
| F-06 | High | Cross-Feature | Production-path gap (DC-07): every wave-loop A6 test fakes `_runWaveGateSeam`, every seam test calls the export directly — no enabled-tier run reaches the real seam from `main()` | AC-6.3, AC-5.3, PROP-REC-05, DC-07 |
| F-07 | Medium | Local | NFR-4's structural exclusion of gate-command run time has no falsifying test — PROP-CTR-10's slow-gate companion is absent and the one budget test is a pre-existing A2 fixture | NFR-4, AC-2.4, PROP-CTR-10 |
| F-08 | Medium | Local | The envelope-refusal integration arms (test-file touch, guard path, partial proposal, out-of-set action) have no A6 fixture — the refusal-reason literals appear nowhere in `advisoryWaveGate.test.js` | AC-3.2, AC-3.5, PROP-ENV-04/05/09/12 |
| F-09 | Medium | Process | Property ids are largely not cited in the tests that are supposed to carry them, so PROPERTIES' `Home` column cannot be checked mechanically — 34 of 79 ids appear in no test file | PROPERTIES §Overview |
| F-10 | Low | Local | The declared coverage gate `npm run test:coverage` does not run in this checkout — `c8` is a listed devDependency but is not installed | DC-09, `package.json` |
| F-11 | Low | Local | `verifyGate` pushes its ledger token *after* the command returns while `runWaveGateSequence` pushes *before*, so a throwing re-gate transport silently truncates AC-4.4's sequence oracle | AC-4.4, TSPEC §2.4 |
| F-12 | Low | Process | The local branch has diverged from `origin/feat-pdlc-advisory-wave-gate` (ahead 1016, behind 298); this review is of local HEAD `a0fa1bca` | Git workflow |

### F-01 (High) — E-6 is enforced only in the prompt

`buildA6SeamOps` computes `declaredScope` as `E-5 ∪ laterOwnedPaths(waves, waveIndex)`
(`pdlc/workflows/orchestrate-dev.js:3021-3026`) — the union of **every** later wave's owned paths —
and hands that to the shipped `classifyEnvelope` X-d clause, whose test is exact string membership.
The only occurrence of `PROMOTES` in production code is the literal inside the prompt text
(`orchestrate-dev.js:3054`); `grep -n "PROMOTES" orchestrate-dev.js` returns that one line.

TSPEC §3.4 is explicit that this is not the contract: *"E-6's symbol half is script-checked, in
three conjuncts … `apply` proceeds only if all three hold"* — `taskId` names a strictly-later task,
`symbol` occurs in that task's PLAN row text, `symbol` occurs in the captured gate output — *"Any
conjunct failing refuses `out-of-envelope`."* REQ AC-3.1's E-6 row says the same, and NFR-1 says
every REQ-AWG-03 boundary is *"enforced in the workflow script, never only in an agent prompt."*
As shipped, a verdict that names no symbol at all, or names one no later task undertakes to
produce, is admitted as long as its produced paths land anywhere in the later-wave union.

There is also no test: `PROMOTES` appears in `__tests__/` only in `helpers/advisoryDoubles.js`
(the reply builder), never in an assertion, and `PROP-ENV-08` — which states all three conjuncts
plus the X-d companion — appears in no test file.

**What must change:** implement the three conjuncts in `buildA6SeamOps.apply` (or in the wrapper in
`runWaveGateSeam`), narrowing `declaredScope` to the *named* later task's owned set on an E-6
proposal, and add PROP-ENV-08's four tests — one per failing conjunct, each asserting
`reason === "out-of-envelope"` **and** the paired positive that a three-conjunct-satisfying
proposal is admitted on the same fixture.

### F-02 (High) — AC-3.3's prohibitions are a catalogue nobody reads

`A6_PROHIBITIONS = ["f","g","h","i"]` is exported at `orchestrate-dev.js:1964` and read by exactly
one thing: the set-equality assertion in `__tests__/advisoryEnvelope.test.js:344-348`. `grep -n
"A6_PROHIBITIONS" orchestrate-dev.js` returns the declaration and nothing else. This is dead config
in the DC-08 sense — a catalogue whose behaviour is untested in production because no production
path executes it.

The letters are not decorative. (f) forbids any change to the PLAN, its task table or its ownership
manifest; (g) forbids any change to the implementation configuration. Neither is checked anywhere:
`MERGE_CONFIG_PATH` and `planPath` are absent from `buildA6SeamOps` and from `runWaveGateSeam`, so
a wave whose manifest legitimately assigns it `docs/{feature}/PLAN-{feature}.md` or
`.claude/pdlc.config.json` puts those paths **inside** `declaredScope` and A6 may rewrite them.
That is exactly the class AC-3.3 closes and AC-4.3 restates.

PROP-ENV-10 asks for eleven named per-operation tests — PLAN prose edit, task-table edit,
manifest edit, `testCommand` change, post-wave-command change, post-wave-pathspec change, commit,
push, tag, wholly-outside path, partly-outside path — *"each carrying a paired positive assertion
on the same run."* The shipped suite has the constant's set-equality and the two generic
`classifyEnvelope` X-d cases (`advisoryEnvelope.test.js:355-375`); none of the eleven exists.

**What must change:** add an explicit prohibition check that subtracts the PLAN path and the
implementation-config path from `declaredScope` regardless of manifest ownership, wire
`A6_PROHIBITIONS` into it so the catalogue has a production reader, and add the eleven tests with
their paired positives.

### F-03 (High) — the advisory record names neither the wave nor the class

AC-6.1 requires the entry to name *"the wave, the root-cause class, the envelope determination, the
action taken or refused, and the gate-output citation."* `renderAdvisoryEntry`
(`orchestrate-dev.js:3415-3446`) emits exactly five table fields — Seam, Confidence, Envelope,
Disposition, Model — plus **Diagnosis.** and **Evidence.** prose. There is no wave number and no
root-cause class. `capturedRootCause` is written in the `classifyReply` wrapper
(`orchestrate-dev.js:3332`) and read in exactly one place, the returned `haltFields`
(`orchestrate-dev.js:3376`); it never reaches `appendAdvisoryEntry`.

AC-4.6 compounds this: *"The repair's paths and the later PLAN task that owns them are named in the
advisory record (AC-6.1)."* `groupPromotedPaths` produces exactly that pairing at the call site
(`orchestrate-dev.js:15166-15170`), and it is used only to build commits — nothing writes it to the
record.

PROP-REC-01 asks for the entry's **field set** compared by set-equality against a transcribed
literal *"never by containment, so that a dropped field fails."* `advisoryRecord.test.js` mentions
`A6` twice, both in catalogue lists (`:496`, `:544`); no A6 record-content assertion exists.

**What must change:** carry `waveNum` and the root-cause class (and, on a resolved E-6, the
promotion's paths and owning task id) into the disposition the record renders, and add PROP-REC-01's
set-equality test over the A6 entry's field set.

### F-04 (High) — the escalation log cannot answer AC-6.4's question

`renderEscalationEntry` (`orchestrate-dev.js:3536-3569`) emits Feature, Seam, Refusal reason,
Diagnosis, Proposed action, Evidence, Pipeline state. AC-6.2 requires the entry to carry *"the
root-cause class alongside the fields the tier already requires"*; it does not. AC-6.4 then requires
`plan-ordering-defect` to be *"countable per feature from the durable escalation log without reading
run logs"* — with the class absent from every field, the only place it could appear is the
agent-authored Diagnosis prose, which is not a countable field and is not script-enforced (NFR-1).

The capture-failure path (`orchestrate-dev.js:3261-3272`) writes its own escalation entry and
likewise carries no class.

`grep -n "A6\|rootCause\|root-cause" __tests__/advisoryEscalationLog.test.js` returns **nothing** —
PROP-REC-03, PROP-REC-04, PROP-REC-06 and PROP-REC-07 (which explicitly asserts A6's *Pipeline
state* reads `I` / `halted`, with an `unknown` negative control) have no test at all, even though
`ADVISORY_SEAM_PHASES.A6` is registered at `orchestrate-dev.js:3606`.

**What must change:** add a `Root cause` field to the escalation entry, thread `capturedRootCause`
into both writers, and add PROP-REC-03/-04/-06/-07's tests — including PROP-REC-06's counting
oracle over a multi-escalation `ESCALATIONS.md` and its specified paired negative.

## Questions

## Positive Observations

## Recommendation

## Verdict
