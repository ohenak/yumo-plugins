# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/` + the feature's full diff against `main`
**Date:** 2026-08-21
**Iteration:** 2

## Prior-Finding Disposition

Delta re-review of `ce01980e..HEAD` (12 commits; the base is the commit my v1 verdict landed on).
Only my own v1 findings and the sections those commits changed are in scope here.

| v1 ID | Sev (v1) | Status | Evidence |
|-------|----------|--------|----------|
| F-01 | High | **Resolved** | `edac08ed` rebuilt `pdlc/workflows/dist/pdlc-cli.mjs` (+56/−22). `node pdlc/workflows/build-runtime.mjs --check` now prints `in-sync pdlc/workflows/dist/pdlc-cli.mjs`, exit 0, and `consolidationBuild.test.js`'s T32 is green on the committed tree. The shipped artifact is again the artifact the docs describe. |
| F-02 | High | **Resolved** | `23ec96eb` rewrote LI-AT-29's `observe()` (`learningsDispatchSet.test.js:501-508`) off five keys `buildFinalReport` never emits and onto six it does — `phases`, `artifactPaths`, `notices`, `outcome`, `testSummary`, `harvestStatus` — and added four "the instrument fires" controls (`:517-524`), including that some phase row carries a numeric `iterations` and some `detail` matches `/Approved \(\d+ iterations?\)/`. The round-window/verdict arithmetic AC-4.3 protects is now actually inside the compared value. The same defect was found and fixed in LI-AT-35's twin `observe()` (`:1155-1162`), which I had not caught. |
| F-03 | High | **Resolved** | `16545fa6` added `learningsBaselineGuard.test.js:272-353`: the committed fixture bytes are read from disk (`baselineBytes()`) and asserted byte-equal to prompts composed by **branch code at HEAD**, for both capture cases, across all four non-injecting states PLAN §DoD item 4 names (DISABLED / EMPTY / UNLISTABLE / ADMITS-NOTHING). `expect(authoring[0]).toBe(baselineBytes("PHASE-F-AUTHORING-PROMPT", 0))` (`:341`) is the assertion that was missing. ADMITS-NOTHING is the arm that actually opens and parses a corpus document, so AC-6.2's named leak now has a path that can red. The commit message records the mutation proof (framing pair emitted on an empty selection reds EMPTY/UNLISTABLE/ADMITS-NOTHING and correctly leaves DISABLED green). |
| F-04 | Medium | **Resolved** | `23ec96eb` replaced the absence-only clause with a paired oracle (`learningsDispatchSet.test.js:569-596`): positive half asserts the source path IS named in BR-8's rows; negative half asserts it appears nowhere in the serialised report minus `learningsInjection` — all channels, not the one guessed key — plus a non-trivial-subject control. |
| F-05 | Medium | **Resolved** | `8fc59ce6` gave AC-5.2 a real boundary: reads logged at the seam on both arms, and the enabled-minus-disabled read difference asserted **set-equal** to the corpus set (`:1104-1108`), so BR-15's two directory clauses are now consequences of behaviour rather than of `isCorpusPath`'s own filter. Writes are recorded on both arms and compared with no exemption list. |
| F-06 | Medium | **Resolved (code); upstream item routed)** | `6b56cd3e` deleted the undocumented `propagateBytes` guard; overflow past the count window now carries `RSN-COUNT` unconditionally (`orchestrate-dev.js:2432-2434`), which is BR-5's stated rule. See F-03 (v2) below and the ERRATUM lines: the mixed case is still not stated upstream. |
| F-07 | Medium | **Resolved** | `82d18585` moved the composition site below `selectMode` and passes the episode's real mode: `_injectLearnings({ feature, docType, phaseId, mode: selection.mode })` (`orchestrate-dev.js:9518`). A production-path test drives `mainDev` and asserts `mode` is present on every record, set-equal to `{authoring, revision}`, and attributable per docType. |
| F-08 | Medium | **Resolved** | `55e6cf04` drives a real erratum round through `mainDev` and asserts every erratum-round authoring prompt carries the block, identified by source path (`learningsDispatchSet.test.js:385-393`). AC-1.1's third dispatch shape now has a runtime oracle. |
| F-09 | Medium | **Resolved** | `b3df48a7` + `6c11d5b0` execute `check-finding-grammar.sh` by bare path with the real PostToolUse envelope (`hookCompatibility.test.js:490+`), covering warn / no-warn / missing-tag cases with the nudge text and file name asserted. Shebang and executable bit are inside the subject. |
| F-10 | Medium | **Open (non-gating)** | No REQ/PLAN edit landed in `ce01980e..HEAD` (`git log --stat` shows doc changes only under `CROSS-REVIEW-test-engineer-REVIEW-v1.md`). Re-filed as F-01 (v2). |
| F-11 | Low | **Open (non-gating)** | `selectLearnings` still builds `orderKeys` from `ordered`, i.e. eligible documents only (`orchestrate-dev.js:2379-2380`); rejected documents get no entry. Re-filed as F-02 (v2). |

All three of my blocking findings are closed, and closed by the mechanism I asked for rather than by rewording the claim.
