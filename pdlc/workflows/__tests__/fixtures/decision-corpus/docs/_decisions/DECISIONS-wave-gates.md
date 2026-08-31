# DECISIONS — wave gates

Project-level decisions about the script-owned Phase I wave gate: what it runs, what it proves, and
who may change it. Promoted 2026-08-19 by `/pdlc:consolidate-learnings` from LEARNINGS
`pdlc-headless-engine`, `pdlc-advisory-tier`, `pdlc-consolidation-agent`, `pdlc-engine-distribution`
and `pdlc-plugin-retirement`.

The PLAN-authoring invariants that follow from these decisions are stated as `DC-19` in
`docs/_constraints/DOMAIN-CONSTRAINTS.md`. This file records the mechanism.

---

## DEC-WAVE-01: `implementation.testCommand` is repo-wide state, and editing it is the terminal act of a phase

**Decision.** `.claude/pdlc.config.json`'s `implementation.testCommand` is the gate every feature's
waves run against. A feature that must change it:

1. edits it as the **terminal act of a phase**, never mid-implementation;
2. transcribes the surviving command **token-for-token from the reviewed HEAD**, never from memory
   or from a paraphrase in a spec;
3. keeps `--testPathIgnorePatterns` arguments **line-terminal**, with any appended segment placed
   before them (engine segment first), because the shipped pin parses those arguments to
   end-of-line.

**Rationale.** In `pdlc-headless-engine`, three separate halts and blocking findings trace to this
one key. PLAN v6/v7 findings `F-01`/`F-02` caught a rewrite that claimed to preserve the ignore set
"verbatim" while dropping `'documentOracles'` — silently re-enabling CWD- and untracked-file-sensitive
oracles inside *another feature's* wave gate. The Phase-I halt's root cause `RC-1` was the same key,
flipped mid-implementation, appending `&& cd pdlc/engine && npm test` past a pin that parses
`--testPathIgnorePatterns` to end of line: 14 test failures across 17 tasks.

**Consequences.** A PLAN that touches this key names the before and after values in full, and the
reviewer re-derives both from HEAD (DC-20). A wave gate whose command changed mid-run has no
comparable green.

**Testability.** Assert the shipped command string against the pin, and assert that the ignore-set
membership is a set-equality against a frozen catalogue rather than a substring check.

---

## DEC-WAVE-02: The gate proves the suite ran, and the un-skip check is per-file

**Decision.** The wave gate's predicate is "the suite ran and reported no failures", not "the suite
did not report a failure". `checkWaveUnskips` is the shipped mechanism and it is checked **per
file**: a wave that un-skips one file while a sibling stays skipped has not un-skipped.

**Rationale.** `pdlc-consolidation-agent` §4.6 is the most expensive failure mode in the whole
corpus and it was invisible: roughly 133 skipped tests at peak sat inside `describe.skip` blocks
while fifteen waves reported complete; recovery cost ~40 dispatches. `pdlc-engine-distribution`
recorded the per-file gap as DoD item 17. `pdlc-plugin-retirement` found the third face of it in its
own replay harness, which judged legs with `grep -qE "Test Suites:.*0 failed"` — Jest omits the
`failed` token when zero suites fail, so a green run was classified FAIL. A verdict predicate that is
never itself run is the same defect class as an oracle that can never fail.

**Consequences.** Every gate predicate over harness output is exercised against real output in both
directions before it is trusted (DC-03, DC-14). A "0 failed" grep is not a gate.

**Testability.** Mutation: skip one file in a passing wave and assert the gate reds naming that file.

---

## DEC-WAVE-03: A red and its green land in the same wave, or the red lives outside the gated suite

**Decision.** The `🔴 failing tests` / `🟢 implement` pair for one TDD unit is scheduled into a
single wave, **or** the red task authors its cases `describe.skip`-ped and the green task un-skips
them with the un-skip sweep itself asserted. A red that must survive across waves lives in a suite
the gate does not run (`pdlc/engine/__tests__/`).

**Rationale.** The gate runs the whole configured suite after every wave and `haltError`s on
failure; there is no per-wave scoping seam. `pdlc-advisory-tier` recorded that a PLAN batching
🔴 and 🟢 into separate waves therefore halts the pipeline at the first red batch — an
unsatisfiable PLAN, not an agent error. `pdlc-headless-engine` §4.7 states the positive half: this
is a PLAN sequencing property, and the PLAN did not encode it.

**Consequences.** The choice of shape is a PLAN decision recorded in the PLAN, because Phase I
cannot recover from it. Where the skip-then-un-skip shape is chosen, the un-skip sweep is itself a
gated deliverable, otherwise `DEC-WAVE-02`'s failure mode reappears one layer up.

**Testability.** Run the PLAN's own batching through `computeTopologicalBatches` at authoring time
and assert no wave's terminal state is red (`pdlc-merge-phase` §4 — running the parser over the
document is cheap and it found a real hazard).
