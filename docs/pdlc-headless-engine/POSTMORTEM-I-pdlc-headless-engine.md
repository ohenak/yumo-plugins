# POSTMORTEM-I-pdlc-headless-engine

Written after the fact by the operator session on 2026-08-12. The halting run itself (headless
engine v0.1.0, direct `orchestrate-dev` invocation, started 2026-08-12T04:22Z) wrote **no**
POSTMORTEM and **no** `halted` queue row — see §Observations. This document records the halt,
the root-cause analysis, the repairs applied, and the resolution evidence.

## What happened

Phase I halted at **Wave 3 of 17**. The post-wave build (`node pdlc/workflows/build-runtime.mjs`)
passed; the wave test gate failed:

```
cd pdlc/workflows && npm test -- --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles'
→ Test Suites: 2 failed, 81 passed; Tests: 14 failed, 3471 passed
```

Because the gate runs before per-task commits, all Wave 3 work except commit `363146e7` (which
landed via a prior wave's flow) was left uncommitted/untracked.

## Root causes

Both causes were introduced by Wave 3's own tasks; the gate behaved correctly.

**RC-1 — TSPEC §7.6's `testCommand` flip applied mid-implementation (1 of 14 failures).**
The CI-arrangement task (`363146e7`, which added `pdlc/engine/__tests__/ci-arrangement.test.js`
and the `engine-tests` job in `pr-tests.yml`) also edited `.claude/pdlc.config.json`, extending
`implementation.testCommand` with `&& cd - >/dev/null && cd pdlc/engine && npm test`. Two
consequences:

1. The pre-existing pin test `pdlc/workflows/__tests__/advisoryPreflight.test.js` ("§2.4 —
   implementation.testCommand pre-flight pin") parses the command with
   `--testPathIgnorePatterns(?:=(\S+)|\s+(.+))$` — everything to end-of-line — and asserts the
   token set equals exactly the four ignore patterns. The appended shell tokens (`&&`, `cd`,
   `-`, `>/dev/null`, `pdlc/engine`, `npm`, `test`) leaked into the set and failed the equality.
2. Latent and worse: `pdlc/engine`'s suite is deliberately red mid-TDD (red tests are authored
   waves ahead of their greens — 14 failing at halt time). Had a later gate picked up the
   chained command, **every subsequent wave gate would have failed by design**.

**RC-2 — a red TDD test landed inside the gated suite (13 of 14 failures).**
A Wave 3 task authored `pdlc/workflows/__tests__/dispatchableSkills.test.js` red — asserting
`DISPATCHABLE_SKILLS` exports that existed in neither `orchestrate-dev.js` nor
`orchestrate-queue.js` — with the green implementation scheduled for a later wave (the test's
own comments attribute the constant-wiring to T16). Earlier waves' red tests were safe because
they live in `pdlc/engine/__tests__/`, which the wave gate does not run. The wave gate runs the
full `pdlc/workflows` suite after **every** wave, so red-before-green cannot span a wave
boundary there. This is a PLAN sequencing defect, not an agent error.

## Repairs applied (2026-08-12)

1. **RC-1:** `.claude/pdlc.config.json`'s `testCommand` reverted to the workflows-only form
   (untracked consumer state, not committed). `advisoryPreflight.test.js` green again (27
   passed). `ci-arrangement.test.js`'s config assertion is now honestly red inside the
   *ungated* engine suite — correct TDD state until a late wave flips the command (see
   Recommendation R-1).
2. **RC-2:** `DISPATCHABLE_SKILLS` implemented in both modules to the test's exact contract
   (union derivation, frozen arrays, 48-direct/11-indirect site census, zero unresolvable
   sites), dist rebuilt, committed as `c3b68b5a`
   (`feat(pdlc-headless-engine): T14 — DISPATCHABLE_SKILLS in workflow modules`). Notably,
   `ADVISORY_RUNG_SKILL` was promoted to `export const` — this also cleared the census's one
   otherwise-unresolvable dispatch site.

**Resolution evidence (independently re-verified by the operator session, 2026-08-12):** the
exact wave-gate command now passes — 83 suites, 3485 passed, 0 failed (70 skipped) — and
`build-runtime.mjs --check` reports all four dist artifacts in-sync.

## Recommendation

- **R-1 — sequence the `testCommand` flip last.** The §7.6 edit to
  `.claude/pdlc.config.json` must be the final act of Phase I (or at minimum land only once
  `pdlc/engine`'s suite is green), and it must keep the `--testPathIgnorePatterns` arguments
  terminal on the line (engine segment first) so the §2.4 pin regex still parses cleanly —
  the two committed assertions (`ci-arrangement` and the §2.4 pin) are jointly satisfiable
  only in that ordering.
- **R-2 — red tests destined for the gated `pdlc/workflows` suite must land in the same wave
  as their green.** When re-planning or re-dispatching, pair test-authoring and implementation
  for any file under `pdlc/workflows/__tests__/`; `pdlc/engine/__tests__/` remains the safe
  home for cross-wave reds while the engine suite stays out of the gate.
- **R-3 — engine v0.1.0 halt-path gaps.** On this halt the engine neither wrote the `halted`
  queue row (report `queueRow: "none"`, contra the direct-run-records-own-halt rule) nor a
  POSTMORTEM. Worth fixing in the engine before it is relied on unattended.

## Observations (non-blocking)

- `pdlc/engine/__tests__/auth.test.js` remains untracked — an uncommitted Wave 3 task output;
  the re-run will re-dispatch its task. Left in place deliberately.
- `pdlc/.claude-plugin/plugin.json` stays at 0.22.0; the `advertisedVersionViolation` oracle
  will nudge for a version bump on the next release-facing dist change (release decision,
  out of scope here).
- Recovery state: row 3 in `docs/_queue/QUEUE.md` is `pending` (the run never set it
  `halted`); a dated note there records this incident.

RESOLVED: yes
