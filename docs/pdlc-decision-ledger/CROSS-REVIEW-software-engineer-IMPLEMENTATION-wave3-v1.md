# Cross-Review: software-engineer — Implementation (Wave 3 gate diagnosis)

**Reviewer:** software-engineer
**Document reviewed:** Wave 3 working-tree diff (uncommitted), feature pdlc-decision-ledger
**Date:** 2026-08-31
**Iteration:** 1
**Scope:** Wave 3 red gate — `__tests__/consumerCleanup.test.js` orphan-freedom failure

## Diagnosis

The gate is red on exactly one test: `consumerCleanup.test.js` › "skip-join orphan-freedom
oracle (TSPEC §5.5) › every pending assertion across the swept surface is a registered
capability skip" (`consumerCleanup.test.js:443`). It expected `orphans` to equal `[]` and
received the five `T-19: …` titles.

**Mechanism.** The oracle spawns a nested jest run over `SWEPT_SURFACE_MODULES`
(`consumerCleanup.test.js:373-381`), collects every `pending` assertion title from the JSON
report, and requires each title to appear in the run-scoped skip sink. The sink is only ever
written through `describeOrSkip`/`itOrSkip` → `registerSkip` → `appendSkipRecord`
(`helpers/driftCapabilities.js:395,439,454`; `helpers/skipSink.js:70-80`). A bare
`test.skip` never reaches the sink — `helpers/skipSink.js:17-21` states this domain
explicitly.

**Trigger.** Wave 3's task **T-12a** added an uncommitted block to
`pdlc/workflows/__tests__/documentOracles.test.js` (diff hunk at 639+): the describe
"pdlc/OPERATIONS.md decisionLedger disclosure family constants (PLAN T-12a / T-19)" with
**five bare `test.skip("T-19: …")` conjuncts** (`documentOracles.test.js:676,683,690,697,716`).
`documentOracles.test.js` is a member of `SWEPT_SURFACE_MODULES`
(`consumerCleanup.test.js:377`), so those five pending titles enter the sweep, match no sink
record, and become the orphans the oracle reports. The failure is deterministic and caused by
this wave's own diff — not by the known local-red traps (untracked-file `coveredViolations`
reds `documentOracles` itself, which this oracle deliberately does not gate on, per its own
comment at `consumerCleanup.test.js:429-433`; the `implementation.testCommand` notices in the
log come from test doubles inside passing suites, not the live run).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | T-12a's five committed `test.skip("T-19: …")` conjuncts live in a swept-surface module, and there is **no sanctioned registration path** that could make them green there: the skip sink accepts only capability-gated skips over `KNOWN_CAPABILITY_KEYS` (`bash,git,hash,python,uid-nonroot` — `helpers/skipSink.js:57`), and "planned work deferred to T-19" is not a capability. As designed, T-12a cannot satisfy TSPEC §5.5. Fix: host the T-12a disclosure block in a non-swept module — a `decisionLedger*.test.js` file already inside T-19's twelve-module manifest (the untracked `decisionLedgerConfig.test.js` is a natural owner for the constants-vs-OPERATIONS.md checks) — keeping the titles and un-skip obligations byte-identical so T-19's batch-9 un-skip still finds them. Do NOT fake-register them through `itOrSkip` with a real capability key (misstates the skip's reason and collides with C2 inventory agreement), and do NOT make them vacuously green via an existence-guard in the body (vacuous-green is a documented prior failure mode). | `documentOracles.test.js:676-716`; `consumerCleanup.test.js:443` |
| F-02 | Medium | Process | Blast-radius enumeration gap: PLAN T-12a instructs "shape mirrors the advisory-tier disclosure family above", i.e. placement inside `documentOracles.test.js`, without checking that file against TSPEC §5.5's swept surface. The obligation "committed `test.skip` in a swept module must be sink-registered" was never enumerated as a constraint on T-12a. Route to PLAN/TSPEC: either amend T-12a's file-ownership to a non-swept module (preferred, no spec change), or — if planned-work skips in swept modules are ever wanted — extend TSPEC §5.5 with a registered planned-work channel (spec change, not a test change). | PLAN T-12a; TSPEC §5.5 |
| F-03 | Low | Process | The failing suite took 118.8 s and the jest worker "failed to exit gracefully and was force exited" — the nested-jest child spawn leaks handles under load. Noise, not gating; worth an `.unref()`/teardown pass when someone next touches `runSkipJoinChild`. | `consumerCleanup.test.js:392-416` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does T-19's batch-9 un-skip step reference the skips by title or by file+title? If by file, relocating the block per F-01 needs the T-19 task text updated in the same change. |

## Positive Observations

- The orphan-freedom oracle worked exactly as specified: it caught an unregistered deferred
  skip on the wave that introduced it, with a falsifiability companion test proving the
  detector is live.
- T-12a's assertions themselves are well built — derived from production constants via dynamic
  import, true set-equality, no hand transcription. Only the hosting location is wrong.
- The oracle's decision not to gate on child exit status (insulating itself from the known
  `coveredViolations` untracked-file trap) prevented a misdiagnosis here.

## Recovery notes for the orchestrator

Per the standing partial-wave recipe: the four untracked `decisionLedgerBounds/Config/
Recognise/Render.test.js` files are verified-but-uncommitted wave outputs ("no git transport
injected" run) — commit completed tasks, do **not** bump the wave ledger, remediate T-12a per
F-01, then re-run wave 3. This review file is left uncommitted deliberately: the shared tree
holds mixed uncommitted wave work and prior incidents (2026-08-27) established that review
agents must not commit/push without explicit authorization.

## Recommendation

**Needs revision**

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
