# Cross-Review: test-engineer — REVIEW (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/` — the feature's implementation on `feat-pdlc-consolidation-agent`
**Date:** 2026-08-10
**Iteration:** 1
**Scope:** Final Codebase Review through the testing lens only (oracle falsifiability, production-path coverage, property/AT traceability, gate honesty)

## Method

Filed under the doc type this phase's round window actually derives (`REVIEW`), per the CR F-11 fix
that landed at `202f92e1`. A `CROSS-REVIEW-test-engineer-REVIEW-v2.md` already exists on the branch
from the pre-fix round bookkeeping; this file is the `v1` slot the window looks for first, and the
history it keys is the one described here, not a fresh review of a tree nobody has read.

1. **Diffed the branch.** `git diff --stat main...HEAD` — 68 files, ~28.4k insertions; sixteen new
   `consolidation*.test.js` suites, `pdlc/workflows/consolidate-learnings.js` (2,373 lines), its
   built bundle, and two `orchestrate-dev.js` changes that landed *during* this phase
   (`202f92e1` — CR F-11's reviewer-prompt path fix; `98b7429e` — the complete-wave-ledger Phase I
   skip).
2. **Ran the gates.** `npm test` in `pdlc/workflows`: 3,864 passed, 1 failed, 70 skipped, 100 suites.
   The single red is `documentOracles.test.js` AT-22, and its received value is three **untracked**
   local tool-cache paths (`.serena/cache/…pkl` ×2, `.tokensave/tokensave.db`) — the local-only
   document-oracle red CLAUDE.md documents, not a branch defect. `node pdlc/workflows/build-runtime.mjs
   --check` reports all five artifacts in sync.
3. **Re-verified every finding the previous CR round left open**, against HEAD rather than against
   the earlier file's citations. All four Highs (`F-01` … `F-04`) and every Medium/Low are closed —
   see *Positive Observations*, which names the commit and the new oracle for each.
4. **Reviewed the two mid-phase `orchestrate-dev.js` changes on their own merits**, since they ship
   on this branch and no earlier round saw them. That is where this round's blocking finding is.
5. **Spot-checked oracle quality across the new suites** for the three failure shapes this phase is
   asked to hunt: implementation echoes, absence-only oracles, and containment standing in for
   set-equality.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The complete-ledger Phase I skip is guarded by an absence-only oracle; its one safety claim is asserted in a comment, never in a test.** `98b7429e` makes a matching complete ledger skip Phase I whole (`orchestrate-dev.js:10836-10847`, `:10883`) — zero implementation dispatches, zero wave gates. The property that makes that safe is that Phase PT's V-wave *and its script-owned gate* still run afterwards (`:11056-11078`), and in HEAD they do. But the test that covers the skip asserts only `expect(waveDispatches).toEqual([])` after filtering the PROPERTIES dispatch **out** of the record — the safety claim survives only as the comment "Phase PT's V-wave verification is its own phase and still runs". Mutate `break` (`:10883`) into an early return past the V-wave, or let a future refactor move the skip above `phaseFn("Phase PT…")`, and every test in the file stays green while the pipeline ships an invocation that runs no test command at all. Needs the positive conjunct on the same path: on the skip run, the V-wave dispatch **did** go out and `_runCommand(implConfig.testCommand)` **was** called. | `__tests__/waveExecution.test.js:1621-1645`, `:1757-1779`; `orchestrate-dev.js:10883, 11015-11078` |
| F-02 | Medium | Local | **A complete ledger is honoured with no tree-side corroboration, and the "record complete but the tree isn't" case has no test.** Staleness is guarded by `feature` and `planHash` only (`orchestrate-dev.js:10826-10834`) — both functions of the PLAN document, neither a function of the tree. `.claude/pdlc-wave-state.json` is untracked local state, so a `git reset --hard`, a dropped rebase, or a re-cut `feat-{feature}` branch leaves a record claiming N green waves over a tree that carries none of the commits, and Phase I is skipped over it. The cheap oracle is available: record the HEAD sha alongside `lastGreenWave` and compare on resume (or, weaker, emit the recorded sha in the skip notice so the operator can see what is being trusted). Either way this wants a case — complete record, mismatched tree — that is red today. | `orchestrate-dev.js:10812-10847`; `__tests__/waveExecution.test.js:1621-1645` |
| F-03 | Medium | Local | **`forcePhases` cannot force a wave re-run once the ledger is complete, and nothing pins that interaction.** The ledger consult is gated on `!explicitPointer` (`orchestrate-dev.js:10812`), which is the `implementation.startWave` config pointer — `forcePhases: "I"` does not reach it. `forcePhases` is the documented lever for overriding recorded state, so an operator forcing Phase I after a complete ledger now gets `⏭ Skipped`. The behaviour may well be intended (the skip notice does name `Delete {WAVE_STATE_PATH} to force a full run`), but "intended" and "asserted" are different things: no case in `forcePhases.test.js` or `waveExecution.test.js` states which of the two levers wins. One test either way turns a surprise into a contract. | `orchestrate-dev.js:10812`; `__tests__/forcePhases.test.js`; `__tests__/waveExecution.test.js:1621` |
| F-04 | Medium | Local | **AT-M5's set-equality compares production against production — an implementation echo on the expected side.** The remediation (`0c966a46`) correctly replaced the exclusion-only body with a both-directions set comparison, and that is a real improvement. But the expected side is `new Set(result.writeSet)` — a value the pass under test computed and returned (`consolidate-learnings.js:511, 736, 859, 1058`). A defect that drops a path from *both* the commit pathspec and `state.writeSet` keeps the two sides equal and the row green. FSPEC §5.4 enumerates the write set; on this fixture (one-file corpus, nothing-found reply) the enumeration collapses to `[LOG_PATH]`, which is a literal transcription the test can carry. Keep the coherence conjunct, add the spec-anchored one beside it. | `__tests__/consolidationPass.test.js:450-478`; `consolidate-learnings.js:511, 1058`; FSPEC §5.4 |
| F-05 | Medium | Process | **Two behaviour changes to the pipeline landed inside Phase CR with no requirement, no property, and no traceability row.** `98b7429e` (Phase I skip) changes when implementation runs at all; `202f92e1` (reviewer-prompt path) changes what every reviewer in every phase is told to write. Neither appears in this feature's REQ, FSPEC, TSPEC, PLAN or PROPERTIES — `consolidationTraceability.test.js`'s register set-equality covers `AT-…` ids only, so neither change is reachable from any traceability guard. The tests they carry are decent (that is why this is not a High), but they are self-contained: nothing downstream notices if a later feature deletes them. The durable fix is a PROPERTIES row for the wave-ledger resume contract, filed against `pdlc/workflows/` rather than against this feature. | `98b7429e`, `202f92e1`; `__tests__/consolidationTraceability.test.js:225-260` |
| F-06 | Low | Local | **The consolidation bundle's generated banner names the wrong sources, and no test pins provenance per bundle.** `BANNER` is one fixed literal (`build-runtime.mjs:34-43`) listing `orchestrate-dev.js`, `orchestrate-queue.js`, `runtime-adapter.js`, and it is stamped onto `dist/consolidate-learnings.bundle.js:1-13`, whose actual source is `consolidate-learnings.js`. The banner's own instruction — "Edit those, then rebuild" — points a maintainer at three files, none of which is the one to edit. `runtimeBundle.test.js`'s `BUNDLES` axis now covers the artifact for every structural constraint but asserts nothing about the banner. | `build-runtime.mjs:34-43, 85`; `dist/consolidate-learnings.bundle.js:1-7` |

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_
