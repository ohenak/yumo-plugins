# Baseline — what a Phase I implementation-wave failure does today

| Field | Value |
|---|---|
| Kind | **Project-level shared reference.** Read-only measured input; **not** a pipeline artifact, not reviewed, not queue-eligible. |
| Cited by | `docs/completed/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (§1, §4, §5, §8) |
| Version | 1.3 · 2026-08-23 |
| Verified at | §1–§2 at default-branch commit `c8aa22a4`; §3 at `1efb9a3b`; §4 at `11420461`; §5 checked against `Version 1.2 · 2026-08-20` |

**Why this file exists.** `REQ-pdlc-advisory-wave-gate` states requirements over behaviour that
already ships. Under the pm-author altitude rule a REQ may not carry file/line-cited internals, and
under DC-02 a stated runtime fact must be measured rather than reasoned. Both are satisfied by
measuring the facts once, here, with the command that measured them, and citing them downstream by
id. A consumer cites this file **at its `Version`**; a content change unaccompanied by a version
bump is itself a defect.

**Change control.** `REQ-pdlc-advisory-wave-gate` owns §1–§2 entire. A successor feature's facts
belong in a new section of this file or in a file of its own, never interleaved into §1–§2.

**Re-verification.** Every fact below was read at `c8aa22a4`. A later default-branch commit is a
fresh check, not an inherited one — re-run the commands in the right-hand column before relying on
a fact at a newer base.

## 1. The failure ladder inside one wave

A wave runs in one shared tree. Its members are dispatched in parallel, told not to commit, and
three separate conditions can end the wave before anything is committed. They are ordered, and the
first one that fires ends the run:

| # | Fact | Measured by |
|---|---|---|
| M-WG-1 | **A dispatch-level failure ends the run first** — a wave member returning an empty result, or self-reporting a non-zero exit, halts before any command runs. | `grep -n "evaluateWaveDispatch" pdlc/workflows/orchestrate-dev.js` → declared `:8283`, called `:10299` |
| M-WG-2 | **The post-wave command runs before the test gate, and its failure halts the run.** It runs first deliberately: a wave that edits workflow sources leaves generated artifacts stale, and the suite asserts their freshness, so gating first would red every source-editing wave for its own unbuilt outputs. | `sed -n '10301,10319p' pdlc/workflows/orchestrate-dev.js` |
| M-WG-3 | **The test gate is the script's own, not the agent's self-report**, wherever a test command is configured and a command transport is injected; its failure halts the run with the command line and a tail of the output. Absent either, the wave degrades to the legacy self-report gate, announced once per run. | `sed -n '10249,10259p;10321,10332p' pdlc/workflows/orchestrate-dev.js` |
| M-WG-4 | **Nothing is committed until the gate has passed.** Per-task commits are pathspec-scoped to the task's owned paths from the PLAN's ownership manifest, and the build-output commit is scoped to the configured post-wave pathspecs. On any of M-WG-1..3 the wave's agent-authored work therefore survives **uncommitted in the working tree**. | `sed -n '10334,10364p' pdlc/workflows/orchestrate-dev.js` |

The same three conditions, in the same order, govern the final V-wave that carries the PROPERTIES
tests (`sed -n '10398,10428p'`).

## 2. What a wave halt leaves behind

| # | Fact | Measured by |
|---|---|---|
| M-WG-5 | **A wave halt writes no POSTMORTEM**, unlike a review-loop or erratum-protocol halt. The halt carries no post-mortem disposition, and the run-report fallback probes for a `POSTMORTEM-I-{feature}.md` that nothing writes, so the reported status is `none`. Phase I therefore acquires no refusal marker and no `RESOLVED:` lifecycle. | `sed -n '10770,10800p' pdlc/workflows/orchestrate-dev.js`; `grep -n "haltWithPostmortem\|erratumPostmortemHalt" pdlc/workflows/orchestrate-dev.js` returns no Phase I caller |
| M-WG-6 | **Phase I has no recorded-approval skip.** No phase-skip path names `I`; the forcible-phase catalogue is `R, F, T, P, D, PR`. Combined with M-WG-5, a re-invocation after a wave halt re-enters Phase I at wave 1 and re-dispatches every wave, including those whose commits already landed. | `grep -n "FORCE_PHASE_TOKENS" pdlc/workflows/orchestrate-dev.js` → `:4585`, a frozen six-member list carrying no `I` |
| M-WG-7 | **The halt is recorded in the queue.** The top-level halt path rewrites the feature's queue row to `halted` and commits that one file pathspec-scoped. | `grep -n 'status: "halted"' pdlc/workflows/orchestrate-dev.js` → `:10805` |
| M-WG-8 | **The advisory seam catalogue is closed at five and transcribed.** `ADVISORY_SEAMS` is a frozen five-member list, and at least one test asserts set-equality against a transcribed literal, so a sixth member is a deliberate, test-visible change rather than an additive one. | `grep -n "ADVISORY_SEAMS = " pdlc/workflows/orchestrate-dev.js` → `:1669`; `grep -n 'toEqual(\["A1"' pdlc/workflows/__tests__/advisoryEnvelope.test.js` → `:317` |

The advisory tier's own measured facts — that it ships disabled, that `ESCALATIONS.md` is the one
durable per-seam record, and that the model-rung ladder is a reusable resolver rather than a pair of
literals — are **not restated here**. They are measured in
`docs/_constraints/pdlc-advisory-corpus-baseline.md` §1–§3 and cited from there.

## 3. Facts added for the v1 cross-review round (measured 2026-08-18)

Measured at `origin/main` `1efb9a3b`. The §1–§2 line references were measured at `c8aa22a4` and have
since drifted; the grep recipes still resolve, and the recipes below are deliberately symbol-based
rather than positional for that reason.

| # | Fact | Measured by |
|---|---|---|
| M-WG-9 | **Three transcribed set-equality surfaces gate a catalogue change, not one.** `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS` and the `ADVISORY_DEFAULTS` key set are each compared against a literal transcribed into a test, and two further catalogue-driven surfaces — the gate-exclusivity registry key set and the per-seam report-row list — are compared against `ADVISORY_SEAMS` itself. Adding a seam, an envelope member or a config key therefore reds a known, enumerable set of assertions. | `grep -rn "ADVISORY_SEAMS\|ENVELOPE_DEFAULTS\|ADVISORY_DEFAULTS" pdlc/workflows/__tests__/` — set-equality sites in `advisoryEnvelope.test.js` (`ENVELOPE_DEFAULTS` and `ADVISORY_SEAMS`), `advisoryConfig.test.js` (`ADVISORY_DEFAULTS` key set), `advisoryDriver.test.js` (PROP-GATE-06 registry key set), `advisoryRung.test.js` (report rows), plus the catalogue transcriptions in `advisoryHarvest.test.js`, `advisoryRecord.test.js` and `consolidationProperties.test.js` |
| M-WG-10 | **The self-modification guard paths are inside every advisory seam's exclusion set, not only Phase MERGE's.** Exclusion `X-e` evaluates the shipped guard-path defaults — `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` — through the same matcher Phase MERGE uses, and the seam context supplies those defaults unconditionally rather than from merge configuration. A proposal touching a guard path is refused `out-of-envelope`. | `grep -n "ADVISORY_EXCLUSIONS = \|guardPaths: effectiveGuardPaths" pdlc/workflows/orchestrate-dev.js`; `MERGE_GUARD_DEFAULTS` for the path list |
| M-WG-11 | **An escalation with no refusal reason is already representable.** The escalation-log entry renders its refusal-reason field as `n/a` when the disposition carries none, so a seam that diagnoses without proposing an action needs no ninth refusal reason to be logged. | `grep -n "Refusal reason" pdlc/workflows/orchestrate-dev.js` |
| M-WG-12 | **The wave commit loop commits only paths owned by tasks in that wave.** It iterates the wave's own tasks and commits each task's manifest-owned paths pathspec-scoped, then — only if the post-wave command ran — the configured post-wave pathspecs. A changed path owned by a task in a *later* wave is committed by nothing in this wave and survives as an uncommitted working-tree change. | `grep -n "for (const task of wave)" pdlc/workflows/orchestrate-dev.js`, and the `commitPaths` calls that follow it |

## 4. The catalogue after `pdlc-advisory-wave-gate` shipped (measured 2026-08-20)

Measured at `origin/main` `11420461`. `pdlc-advisory-wave-gate` merged as PR #66 (`bb4d36fb`), which
makes M-WG-8's five-member reading a **pre-change** fact: true at `c8aa22a4`, false at this base.
M-WG-8 is left as measured rather than rewritten, because the criteria that cite it (the REQ's AC-1.1
and R-5) argue from the pre-change state; M-WG-13 is the post-change reading a reader at today's
default branch needs. Recipes are symbol-based.

| # | Fact | Measured by |
|---|---|---|
| M-WG-13 | **The advisory seam catalogue is now closed at six, and every transcribed set-equality reads six.** `ADVISORY_SEAMS` is a frozen six-member list `A1…A6`, and the transcribing assertions moved with it, which is the test-visible, non-additive change M-WG-8 predicted a sixth member would be. | `grep -n "ADVISORY_SEAMS = " pdlc/workflows/orchestrate-dev.js`; `grep -rn 'toEqual(\["A1"' pdlc/workflows/__tests__/` → `advisoryEnvelope.test.js`, `advisoryHarvest.test.js`, `advisoryRecord.test.js`, each six members |
| M-WG-14 | **The default envelope is now closed at six members.** `ENVELOPE_DEFAULTS` is a frozen `E-1…E-6`, and its set-equality transcription reads the same six. | `grep -n "ENVELOPE_DEFAULTS = " pdlc/workflows/orchestrate-dev.js`; `grep -rn 'toEqual(\["E-1"' pdlc/workflows/__tests__/` → `advisoryEnvelope.test.js` |

## 5. Facts added for `pdlc-wave-resume` (OB-F4, promoting REQ OF-1/OF-2)

Checked against `Version | 1.2 · 2026-08-20`, sections through `## 4` and ids through `M-WG-14` —
the state found at promotion time, per the *Re-verification* note above. **`M-WG-6` was reviewed
against this promotion, not missed:** it records that Phase I has no recorded-approval skip and
that a re-invocation after a wave halt re-dispatches every wave, including those whose commits
already landed; the shipped wave-ledger record (`pdlc-wave-resume`'s own subject matter) partly
supersedes that re-dispatch behaviour going forward, but `M-WG-6` itself is a `c8aa22a4`-era
mechanism fact and is left as measured, unchanged, for the same reason `M-WG-8` was left after
`pdlc-advisory-wave-gate` shipped (§4): criteria that cite it argue from the pre-change state.

| # | Fact | Measured by |
|---|---|---|
| M-WVR-1 | **Replay cost of a wave re-entry is the task count of every wave below the halted one, and it is not uniform per halt.** On the `pdlc-consolidation-agent` run of 2026-08-09, the plan derives 16 waves (17 counting Phase PT's appended V-wave); waves 1–3 hold 7 tasks, so re-entry after the wave-4 halt paid seven no-op dispatches, while re-entry after the wave-2 halt replayed wave 1 only (a single task). | `parsePlanTasks` + `parsePlanOwnership` + `computeWaves` from `pdlc/workflows/orchestrate-dev.js`, run over `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md` → 34 tasks, 16 waves, W1 = `[T00]`, W2 = `[T01..T05]`, W3 = `[T06]` |
| M-WVR-2 | **A completed task may legitimately produce no commit; stray agent-authored commits were also observed in the same run.** On the same `pdlc-consolidation-agent` run, wave 1's only task finished with "nothing staged — no changes to commit". Commit presence is therefore not usable as completion evidence in either direction. | The wave-1 task list above (one task) against that run's log; the nothing-to-commit path is reachable at HEAD for any wave whose owned paths are unchanged |
