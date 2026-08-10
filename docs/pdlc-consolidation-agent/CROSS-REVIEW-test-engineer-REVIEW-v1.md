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

| ID | Question |
|----|---------|
| Q-01 | On F-03: which lever is meant to win — `forcePhases: "I"` or a complete wave ledger? Whichever the answer, it wants one test. If `forcePhases` should win, the `!explicitPointer` guard (`:10812`) needs a second disjunct; if the ledger should win, say so in the skip notice, which today names only the delete-the-file escape. |
| Q-02 | On F-02: is there a reason not to stamp the completion record with the HEAD sha? The record already carries `version`, `feature`, `planHash` and `lastGreenWave`; a fourth field would make the resume decision a function of the tree as well as of the PLAN, and would cost one `_git rev-parse` on a path that already has a git seam. |
| Q-03 | On F-05: were the two `orchestrate-dev.js` changes intended to ship on this feature's branch, or were they meant for a separate change? They are not in this feature's scope, and Phase PUB will carry them into the same PR — which is fine if it is a decision, and a surprise if it is not. |

## Positive Observations

- **Every High from the previous CR round is closed, and closed with a stronger oracle than the
  finding asked for.** Re-verified at HEAD, one by one:
  - *F-01 (AT-M9 absence-only)* — `155b8f46` and `2272d493`. AT-M9 now reaches step 13 on a JSON
    cluster reply, opens with a non-vacuity conjunct (`_agent.calls` has length 2 and the second
    prompt names the routed failure-mode id), then asserts all seven: exact status, empty reason
    set, the §8.3 table present, the consumed pair, the marker's own bytes matching
    `^RELEASED: {passId}`, the dispatch error verbatim, and `prUrl` null
    (`consolidationPass.test.js:634-660`). The marker conjunct reads the file the *next* pass reads
    rather than `result.markerHeld`, and says why in a comment.
  - *F-02 (production wrong, not the oracle)* — `36707bd7`. `openClone` now discriminates
    E-22 from E-23 on the clone's own stderr and returns the configured value verbatim
    (`consolidate-learnings.js:2242-2247`), and AT-N4 drives the real function in three legs, with a
    transport-failure control that keeps the two classes uncollapsed and a "no `remote get-url`
    happened" conjunct against a silent fallback (`consolidationReport.test.js:421-484`).
  - *F-03 (builder-not-wired config notices)* — `f2af78f7`. There is now one exported production
    builder, `configNotices` (`consolidate-learnings.js:1846-1863`), and `main()` is its only caller
    (`:529`). AT-N1…N3 read what production assembles.
  - *F-04 (AT-M5 exclusion-only)* — `0c966a46`. Both directions, plus a non-vacuity floor on the
    write set. F-04 above is a refinement of the expected side, not a reopening.
- **The Mediums and Lows were taken seriously too**, which is unusual and worth saying: AT-M11 now
  asserts the marker was *taken* (its bytes, its new passId) and pins `status === "no-op"` instead of
  `not.toBe("refused")` (`consolidationPass.test.js:426-443`); AT-M7 gained a `main()`-level
  assertion that the `ADVISORY_MODEL_FALLBACK:` line reaches `result.body` (`:492-511`); the dead
  `notImplemented` scaffold is gone; the seven "not yet landed" comments that pointed the reader in
  the wrong direction were corrected (`79e304af`).
- **F-08's durable guard landed and is genuinely durable.** `consolidationTraceability.test.js` now
  carries a third axis over PROPERTIES §12.2's property→file map (`:150-260`) beside the FSPEC §13 /
  TSPEC §12.3 set-equality, with a version pin so a moved register fails as "the register moved" and
  a non-vacuity floor so two empty parses cannot agree. This is the finding that will catch the
  successors of F-01 and F-04 mechanically.
- **CR F-11's fix is the right shape.** One `crossReviewPath` builder (`orchestrate-dev.js:6311-6325`)
  is now the single place a cross-review path is spelled, used by both the loop's read-back and the
  reviewer prompt, so the name a reviewer is told to write is by construction the name the window
  looks for. The tests assert the v1 path per role, the absence of an inferred `-IMPLEMENTATION-`
  path, and the read/write pair on iteration 2 (`reviewLoop.test.js:1302-1401`).
- **The new artifact was added to every existing axis rather than exempted from them.**
  `runtimeBundle.test.js`'s `BUNDLES`, `AT19_SEAM_NAMES` (`_envPresent`, `_makeTempDir`, with `_now`
  deliberately excluded and the reason recorded), `AWAIT_SCAN_SOURCES`, and the manifest-id
  set-equality all carry `consolidate-learnings`. The comment explaining why omission would be an
  exemption is the kind of thing that keeps an axis honest a year later.
- **Set-equality is the house style in the new suites, not an exception.** AT-Q7's three-domain
  containment-plus-obligation oracle, AT-L5's four-leg vocabulary equality including the one that
  reads the vocabularies document itself, and the CLAUDE.md ↔ manifest equality (minus the manifest
  itself) are all written to fail on a deletion, which is the property the phase asks for.
- **The gates are green and the tree is clean.** All five artifacts in sync, zero `describe.skip`
  left un-un-skipped in the consolidation suites, and the only red in the run is the documented
  untracked-file document-oracle red that CI does not see.

## Recommendation

_(pending)_
