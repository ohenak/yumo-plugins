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

### F-05 (High) — AC-1.5's notice is new production code with no test

The legacy-path notice was widened on this branch. `git diff main...HEAD --
pdlc/workflows/orchestrate-dev.js` shows the single-cause literal replaced by a `causes` array
(`orchestrate-dev.js:14765-14780`), and TSPEC §2.6's hoist moved the config read above the
`!waveMode` branch so a no-manifest run can name the missing gate half too.

No test exercises it. `grep -rn "worktree exception path\|no valid file-ownership manifest"
__tests__/*.js` returns two comments and no assertion. The only notice assertions in the suite are
the two pre-existing BL-04 ones (`waveExecution.test.js:552-578`), which filter for the literal
`"Notice: the script-owned test gate is unavailable"` — a **containment** check on one carrier, not
PROP-SEAM-07's count of inapplicability *statements* over the whole notice surface.

That leaves all four arms the PLAN's own DoD checklist names (`PLAN` line 534: *"AC-1.5's
inapplicability notice is checked on all four arms"*) unproven:

- (i) BL-03 absent alone — no test touches the widened legacy notice at all;
- (ii) BL-04 absent alone — covered only by the pre-existing containment check, not by a count;
- (iii) both absent — **PROP-SEAM-08**, which TSPEC §5.5 calls *"the only configuration where the
  hoist could regress AT-01-5"*, has no test; nothing proves one `emit` rather than two;
- (iv) the zero-count discriminator — absent, and it is the arm that makes (i)–(iii) falsifiable.
  Without it a carrier that emitted the notice unconditionally would satisfy every other arm.

`PROP-SEAM-07` and `PROP-SEAM-08` appear in no file under `__tests__/`.

**What must change:** add the four arms as PLAN A6-18 specifies, each counting statements over the
whole `emit` surface with no authorship filter, and each asserting the cause text it expects — arm
(iii) asserting a count of exactly one **and** that the single statement names both causes.

### F-06 (High) — the seam is never reached from `main()` on a run where it fires

Every test of the wave-loop call site injects a fake seam: `makeA6Fake`
(`waveExecution.test.js:927-934`) is passed as `extra: { _runWaveGateSeam: a6.fn }` in all eight A6
tests in that block (`:935`, `:957`, `:978`, `:1010`, `:1043`, `:1069`, `:1084`, `:1114`, `:1128`).
Every test of the seam itself calls the exported `runWaveGateSeam` (or `runAdvisorySeam`) directly
— `advisoryWaveGate.test.js` never imports `main`.

The consequence is the DC-07 pattern precisely: the outer interface is faked, so the proof
traverses neither the real seam nor the real wiring. `result.haltAdvisory` is asserted equal to
`haltFields` (`waveExecution.test.js:1066`, `:1111`) — but `haltFields` is the object the fixture
itself handed the loop, so the assertion is an identity, not an oracle on A6's output. AC-6.3's
claim ("the halt report carries the diagnosis and the root-cause class") is therefore proven only
against hand-written values; PROP-REC-05, whose home is `advisoryWaveGate.test.js`, appears in no
test file.

The one main()-driven test that reaches the real `runWaveGateSeam` is the **disabled-tier** case
(`advisoryDisabled.test.js:646-701`), which is well built — real transports, positive
`se-implement` dispatch count, `write-tree` absence, both report keys undefined. It proves the
early-return branch at `orchestrate-dev.js:3224-3226` and nothing past it.

**What must change:** one enabled-tier integration test driven through `mainDev` with **no**
`_runWaveGateSeam` injection, a red `_runCommand` on the first pass and a green one on the re-gate,
asserting on the real seam's outputs: the run's `haltAdvisory` (or its absence on a resolution), the
`ADVISORY-{feature}.md` bytes written through the real `_appendFile`, and a call-count oracle that
the agent double was dispatched ≥1 on the served flow. A second such run with a persistently red
re-gate gives the escalation half.

### F-07 (Medium) — NFR-4's window has no falsifying test

The implementation is right: the deadline is constructed fresh per attempt and only after
`dispatched` (`orchestrate-dev.js:3889-3897`), and `verifyGate` runs after the race settles, so
gate-command time is structurally outside the measured span, exactly as NFR-4 claims.

The proof is missing. PROP-CTR-10 asks for two runs — one dispatch exceeding the budget escalating
`budget-exhausted`, **and** *"a companion run whose gate command is slow but whose every
dispatch→verdict window stays inside budget must terminate `resolved` on a green re-gate."* The
companion is the only thing that can falsify "gate time is excluded"; without it, an implementation
that folded gate time into the window would pass every shipped test. The one budget test in the
named home (`advisoryDriver.test.js:541-553`) is a pre-existing `A2` fixture with a
never-resolving agent and no gate-command conjunct at all.

### F-08 (Medium) — the refusal arms have no A6 fixture

`grep -c` over `__tests__/advisoryWaveGate.test.js` returns **0** for each of
`revert-on-test-touch`, `out-of-envelope` and `prohibited-action`. So on an A6 fixture:

- **PROP-ENV-04** (AC-3.2) — a proposal confined to the wave's own owned paths where one is a test
  file must refuse with X-a's `revert-on-test-touch`, *not* X-d's reason and not a permit under
  E-5. The precedence claim is the whole point of AC-3.2, and nothing asserts it for A6.
- **PROP-ENV-05** (AC-3.2 clause (e)) — a wave owning `pdlc/workflows/` must refuse
  `out-of-envelope`. The wiring is right — `guardPaths: effectiveGuardPaths(undefined)` at
  `orchestrate-dev.js:4034` applies the shipped defaults to every seam — but this repo *is* the
  repo AC-3.2 names, so this is the arm most likely to be exercised in anger and it is unasserted.
- **PROP-ENV-09** (AC-3.5) — a partly-in, partly-out proposal must leave **no part** in the tree.
- **PROP-ENV-12** — an out-of-set `PROPOSED-ACTION:` must be refused by the shipped X-c clause.

The generic `classifyEnvelope` unit tests in `advisoryEnvelope.test.js` cover the clauses in
isolation; they do not cover A6's `permittedActions`/`declaredScope` reaching them, which is what
these four properties are about.

### F-09 (Medium) — PROPERTIES' `Home` column is not mechanically checkable

Grepping each of the 79 property ids in PROPERTIES against `pdlc/workflows/__tests__/` and
`pdlc/engine/__tests__/` finds no occurrence for 34 of them. Some of those are genuinely covered
under a different title (`PROP-CTR-02` by the `parseA6RootCause` totality block,
`PROP-CTR-05` by the `citesGateOutput` block, `PROP-REST-01`/`-02`/`-05` by the `A6-10`
snapshot/restore blocks) — but that is exactly the problem: a reviewer cannot tell "covered under
another name" from "not covered" without reading all 4 000 tests, and in this round the distinction
turned out to matter for at least ten ids (F-03, F-04, F-05, F-07, F-08 above).

Cite the property id in the `describe`/`test` title, as `advisoryWaveGate.test.js` already does for
`PROP-CTR-03`, `PROP-GATE-03` and friends. Tagged `Process` because the lesson is about how this
pipeline makes traceability auditable, not about this feature.

### F-10 (Low) — the declared coverage gate does not run

`package.json`'s `test:coverage` script is `c8 npm test … && c8 report --check-coverage --per-file
--branches 85 …`, but `c8` is not installed in `pdlc/workflows/node_modules` — `npm run
test:coverage` exits with `sh: c8: command not found`. I measured the floor out-of-band with
`npx c8@10` and it passes (88.07 % branch on `orchestrate-dev.js`), so this is a gate-runnability
finding, not a coverage finding. Per DC-09 the claim must rest on the actual gate command; restore
the devDependency install (or pin the invocation to `npx c8`) so the declared gate is the gate.

### F-11 (Low) — the two ledger writers disagree about token ordering

`runWaveGateSequence` pushes its token **before** invoking the command
(`orchestrate-dev.js:3137`, `:3145`); `buildA6SeamOps.verifyGate` pushes it **after** the command
returns (`orchestrate-dev.js:3096`, `:3101`). On every path either transport takes today the
observable ledger is identical, so no shipped test can tell them apart — but a `_runCommand` that
*throws* on the re-gate loses its token, and AC-4.4's sequence oracle then reads a ledger
indistinguishable from one where that command was never configured. Since TSPEC §2.4 extracted
`runWaveGateSequence` precisely so *"a re-gate that skipped a configured command would require a
second code path"*, having the second writer push in the other order re-introduces a difference the
extraction was meant to remove. Make `verifyGate` push first, and add a throwing-transport case.

### F-12 (Low) — the local branch has diverged from its remote

`git rev-list --left-right --count HEAD...origin/feat-pdlc-advisory-wave-gate` reports `1016 / 298`.
Local HEAD (`a0fa1bca`, 2026-08-20) is newer than the remote tip (`e0d5525b`, 2026-08-19) and
carries the implementation, so reviewing local HEAD is the right call and I did not pull in the
shared tree per the parallel-fan-out rule. Recording it so the orchestrator can reconcile before the
next push — 298 remote-only commits is not a fast-forward.

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01: was the E-6 conjunct check consciously deferred (in which case it needs a DECISIONS entry and a narrowed AC-3.1), or did it fall out of A6-14's green step? The `PROMOTES`/`PROMOTES-TASK` prompt lines suggest the latter — the prompt asks for the fields nothing then reads. |
| Q-02 | F-03/F-04: the wrapper comment at `orchestrate-dev.js:3329-3331` says the class is captured *"so a terminal disposition … can name it on the record and in the halt fields, without widening `renderAdvisoryEntry`'s own seven-field contract."* If the contract may not widen, where was the class meant to land on the record — inside the Diagnosis prose? That would not satisfy AC-6.4's countability. |
| Q-03 | F-06: is there a reason `advisoryWaveGate.test.js` never imports `main`, beyond fixture cost? The disabled-tier test in `advisoryDisabled.test.js` shows the harness can drive `mainDev` with real transports through a red wave gate, so the enabled-tier twin looks cheap. |
| Q-04 | PLAN's A6 task rows all still read `⬚` in the Status column although the work has landed. Is the checkbox column considered non-load-bearing, or was the update missed? (Raised as an ERRATUM to PLAN rather than folded into this verdict.) |

## Positive Observations

- **The snapshot/restore oracle is exactly right.** `advisoryWaveGate.test.js:320-401` runs the
  round trip over a **real temporary git repo** and compares a path→content-hash map across tracked
  and untracked files, then adds the companion (`:380-401`) proving a `git status`-level comparison
  would pass where the hash map fails. That is a falsifiable oracle where a `_git` double could only
  have echoed the fixture, and the companion is the mutation check that makes the first test mean
  something.
- **AC-4.1 conjunct (iii) is genuinely mutation-tested.** The two fixtures at
  `advisoryWaveGate.test.js:1654-1795` replace only `verifyGate` on a **real** `buildA6SeamOps`
  result and each carries its positive half (`ledgerAnchor.value === 2`, then `=== 4` with the
  four-token ledger). An implementation writing no anchor fails on the recorded value rather than
  passing by absence. This is the pattern the rest of the suite should copy.
- **Sequence, not set.** `sameSequence` (`orchestrate-dev.js:3111-3115`) is exact length-and-order
  equality and the step-6 check slices from the anchor, not from the wave start
  (`orchestrate-dev.js:3364-3368`) — so a resolution declared on one invocation cannot pass. The
  six-token two-attempt run (`:1542-1589`) and the `["test","test"]` no-post-wave run (`:1591-1618`)
  pin both shapes.
- **`gateSequenceFor` reads `implConfig`,** never a hard-coded length, and PROP-GATE-06's test
  falsifies the alternative directly.
- **The disabled-tier inertness test is production-path.** `advisoryDisabled.test.js:646-701` drives
  `mainDev` with the real seam and asserts the *positive* half ("`se-implement` dispatched exactly
  once") alongside every absence, rather than absence alone.
- **The pending OQ-7 boundary is `test.todo`, not `test.skip`** — correct per PROP-REST-03, and it
  keeps the repo's own un-skip guard honest.
- **Totality is properly tested.** `parseA6RootCause`'s eight arms (`:168-211`) include non-string,
  wrong-case, duplicated-last-wins and empty-value, and `citesGateOutput` pins the 23/24-character
  floor on both sides (`:232-239`) rather than only the accepting side.
- **Coverage is real, not asserted.** 88.07 % branch on a 16 000-line module, measured on the shipped
  suite, with `dist/` and `__tests__/` correctly excluded as generated and as the instrument.

## Recommendation

## Verdict
