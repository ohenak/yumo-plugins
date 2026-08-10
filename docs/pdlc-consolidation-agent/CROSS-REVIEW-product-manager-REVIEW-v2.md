# Cross-Review: product-manager — REVIEW (Phase CR, Final Codebase Review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/` — the feature's implementation on `feat-pdlc-consolidation-agent`
**Date:** 2026-08-10
**Iteration:** 2
**Scope:** Product lens only — requirements traceability (REQ-CONS-01…07, AC-1.1…AC-7.2), scope compliance, acceptance-criteria fidelity. Technical design, test strategy and code quality belong to the SE and TE lenses.

## Method

Delta re-review. I read my own v1 (`CROSS-REVIEW-product-manager-REVIEW-v1.md`), diffed the branch from the commit I reviewed there (`5cb7efc2..HEAD`, HEAD `d779a2ed`), and asked two questions only: is each of my blocking findings closed on the **production** path, and did the revision break anything. I did not re-open sections v1 approved.

Every claim below is cited at `file:line` on HEAD, read on HEAD rather than copied from v1. Where a fix is claimed, I traced **AC → production caller → operator-visible artifact** and read the test that drives that caller.

Suite state: `npm test` in `pdlc/workflows` is 3888 passed / 1 failed. The one failure is `documentOracles.test.js` AT-22, whose received set is entirely untracked local files (`.serena/cache/typescript/document_symbols.pkl`, `.tokensave/tokensave.db`) — the documented false-red in `CLAUDE.md` ("an untracked local file … therefore fails the document oracle for reasons nothing to do with the diff"). Not a branch defect, not a finding. `build-runtime.mjs --check` is green (all five `dist/` rows in sync), so the fixes below are in the shipped artifacts, not only in source.

## Delta: prior findings

| v1 ID | Severity | Status on HEAD | Evidence |
|---|---|---|---|
| F-01 — `deferred:` never carried the deferred | High | **Closed** | Both operator channels render from `state.deferred` (set at `consolidate-learnings.js:928`) through one `renderDeferredEntry` (`:2153-2162`): the terminal row at `:2284-2286`, report item 8 at `:2347-2354`, which also points at the proposal file. `none` is now reserved for the empty case. Driven through `main()` at `consolidationOperatorChannels.test.js:129` with an empty-case control at `:159`. |
| F-02 — AC-6.2/6.3 unreachable, `seamCandidates` unwired | High | **Closed** | `main` step 10 now calls it: `state.seamCandidates = seamCandidates(escalations)` (`:659`), rendered by `renderAdvisoryItem` (`:2178-2210`) into report item 7 (`:2343`) with the corpus state, the candidate or the tie, the widenings, and AC-6.3's consumer-local operator action. Three rows drive `main()` — candidate, tie, absent corpus (`consolidationOperatorChannels.test.js:174`, `:198`, `:212`) — so the candidate row cannot pass by printing one unconditionally. |
| F-03 — no streak could ever reach threshold | High | **Closed** | `parseConsumedBlocks` (`:1300-1330`) reconstructs one entry per prior pass from the log's `<!-- pdlc:consumed -->` blocks; `main` re-reads each pass's corpus through the same listing and folds `[...priorPasses, currentPass]` (`:681-696`). Read at `:540`, **before** the current pass's own block is appended at `:591`, so this pass is not double-counted. `remediationChoice` now has a production caller for exactly the `ineffective` rows, with `headExists` from a real `cat-file -e` probe (`:724-736`). The probe is pinned as a real input by the HEAD-present / HEAD-absent pair at `consolidationOperatorChannels.test.js:417`/`:448`, with a one-counted-pass control at `:478`. I also checked the reachability worry behind Q-01: no seam in this protocol can unlink a file (`:1453`), so a prior pass's corpus is still readable, and a member deleted since contributes no text rather than a false `unmeasurable` streak (`:1727` skips an empty consumed set). |
| F-04 — AC-2.3's bar unstated and unenforced | High | **Closed, with a consequence — see G-01** | The bar and the exact evidence shape are now in the clustering prompt (`:618-630`), and enforced on the production path by `clearsPatternBar` (`:1006-1019`) before any routing (`:791-798`); `renderEvidenceLine` (`:1028-1037`) always emits the AC-3.2(iii) line, `(unmet)` rather than dropped. Both arms and the unrecognised shape are driven through `main()` (`consolidationOperatorChannels.test.js:227`, `:241`, `:258`, `:272`). |
| F-05 — every promotion cited every LEARNINGS | Medium | **Closed, with a precision caveat — see G-03** | `promotionSources` (`:1049-1059`) narrows each section's `source:` to the features its own evidence names, called at `:2390`. Oracle is a discrimination, not a containment (`consolidationOperatorChannels.test.js:301`). |
| F-06 — CR round missed four unwired ACs | Medium (Process) | **Closed** | The sweep is now CR grounding in both lenses' prompts: "name the production caller that assembles it and the test that drives THAT caller, or file a finding. A builder covered only through its own unit tests is not wired" (`orchestrate-dev.js`, commit `a2446b8f`). |
| F-07 — docblock still called the file a SKELETON | Low | **Closed** | `consolidate-learnings.js:21-25` now states the pass is implemented end to end and names the DC-07 rule. |

## Findings

<!-- filled next -->

## Questions

<!-- filled next -->

## Positive Observations

<!-- filled next -->

## Recommendation

<!-- filled next -->

## Verdict

<!-- filled last -->
