# Baseline — what a Phase I implementation-wave failure does today

| Field | Value |
|---|---|
| Kind | **Project-level shared reference.** Read-only measured input; **not** a pipeline artifact, not reviewed, not queue-eligible. |
| Cited by | `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (§1, §4, §5, §8) |
| Version | 1.0 · 2026-08-09 |
| Verified at | default-branch commit `c8aa22a4` |

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
