# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.3)
**Date:** 2026-08-19
**Iteration:** 2
**Scope:** delta re-review of the change since `25a6cf9f` (498 insertions, 110 deletions). Sections unchanged since v1 and already approved are not re-litigated.

## Resolution of v1 findings

| v1 | Verdict | Evidence in v0.3 |
|----|---------|------------------|
| F-01 High — `RSN-SELF` had no recording path | **Resolved** | `CorpusEntry` gains `excluded: null \| "RSN-SELF"` (§I.3), the shell's `entries` now carries self documents unopened (§I.4), and `rejected[]` is stated total over `entries` with `excluded` tested *before* `readOk`. AC-1.3's row and AT-04 are now producible from one fixture. |
| F-02 High — circular `maxBytesPerDocument` accounting | **Resolved** | §D.5's three disjoint pools; `maxBytesPerDocument` bounds material only, framing is charged to nobody, `bytesInjected == bytes`, and the consequence ("the realised block is larger than `totalBytesInjected` by a framing constant") is stated where a fixture author will read it. AT-11/AT-12's counts are now hand-computable. |
| F-03 High — run-level vs per-dispatch record underdetermined | **Resolved** | §A.5 states last-write-wins with reasons, keeps each dispatch's own `corpusOutcome`/`orderKeys`, adds `corpusDiverged`, and names the `DIVERGENT-CORPUS` fixture with determinate expected values (scalars equal dispatch 5's; diverged true on exactly 3 and 5). §D.2 mirrors it and states the new fields sit outside BR-8's row closure, so AT-17 is unaffected. |
| F-04 High — §T.3 baseline capture not executable | **Resolved** | The circularity is dissolved rather than papered over: `git worktree add` materialises the merge-base *subject*, the harness stays on the branch and imports `main` from the worktree path. I checked this runs: `orchestrate-dev.js` imports only node builtins (`fs`, `path`, …) so the worktree needs no `node_modules`, `package.json` carries `"type": "module"` at that commit, and `main` is the module's default export (`__tests__/advisoryDisabled.test.js:70` already imports it that way and drives it with seams). The legitimate-re-capture rule is now mechanical (retained digests unchanged), not exhortatory. |
| F-05 High — baseline's falsifying anchor lived in the capture script's own output | **Resolved** | Hand-transcribed digest literal per `{caseId}` in the guard test (DC-14), asserted against both recomputed digests and `MANIFEST.json`; the ancestry check is explicitly demoted to a weak second signal. |
| F-06 High — AT-29 vacuous | **Resolved in design** | The scripted `_agent` now echoes the final 200 bytes of the prompt into its response, the fixture corpus carries gate grammar, and two concrete mutations are named that red the test. That is a real falsifiability argument. One provenance sentence in the supporting text does not survive measurement — F-03 below, not gating. |
| F-07 Medium — `buildLearningsInjector` signature diverged | **Resolved** | §A.1 and §I.4 now agree (`{config, sink, _git, _readFile, _log}`), §A.2's diagram pushes notices onto `sink.notices`, and the reconciliation is stated in one parenthetical. |
| F-08 Medium — `bounded` unrecoverable from a bare string | **Resolved** | `extractInjectableMaterial` returns `{material, bounded, bytes, sections}`, and `sections` is named as AT-11's set-equality operand. |
| F-09 Medium — coverage gate over-claimed | **Resolved** | §T.7 retracts the claim in the document's own words and replaces it with a twelve-row fail-open arm → AT inventory. That is a better instrument than the percentage was. |
| F-10 Medium — AT-33's expected set sourced from code under test | **Resolved** | Expected set is now hand-transcribed from the fixture's scripted `ls-files` stdout minus hand-written self paths, with the DC-14 rationale stated. |
| F-11 Medium — third parameterisable function had no property | **Resolved** | T-O-6 routes `extractInjectableMaterial` to PROPERTIES with three concrete conjuncts (byte equality, ≤ bound, char-safe round-trip, `bounded` iff cut). |
| F-12 Medium — AT map unenumerable, AT-11/AT-12 double-assigned | **Resolved** | All 35 ATs listed once with per-suite counts. I re-derived the union: 2+9+3+3+6+12 = 35 and the ids are exactly AT-01 … AT-35 with no duplicate, matching FSPEC's inventory (35 ids). AT-11/AT-12 now sit only in `learningsBlock.test.js`. The *layer* of two of those assignments is a new problem — F-01 below. |
| F-13 Low — cache-headroom claim ignored contention | **Resolved** | §A.4 and P-9 now state the shared budget and eviction (`runtime-adapter.js:459-465`, verified) and say plainly that residency is not structural. |
| F-14 Low — "measured" date sample | **Resolved, and routed** | §D.4 now states the sample is FSPEC's and is *not* in this repository, and raises ERR-5. I re-measured: all 9 corpus documents carry a bare ISO `Date Completed`. |
| F-15 Low — T-O-2 rationale | **Resolved** | Rationale restated as *when*, with the rebase/merge-base-movement point handled by pinning digests to the recorded sha. |
| F-16 Medium — two incompatible `fakeGit`s | **Resolved** | §T.2 adds the `consolidationDoubles.js` row and scopes the "only source" rule to this feature's four `orchestrate-dev.js` suites; §I.1 says which double the pin test uses and why. Verified: `consolidationDoubles.js:23` re-exports `mergeDoubles.js`'s `fakeGit`, which is not `seams.js`'s. Q-03's three-way pin is also answered. |

All six blocking findings from v1 are discharged, and discharged by design changes rather than by wording. The findings below are new, and all but two come from sections this revision rewrote.

## Findings

## Questions

## Positive Observations

## Recommendation
