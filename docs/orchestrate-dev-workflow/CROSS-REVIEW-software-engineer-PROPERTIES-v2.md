# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/PROPERTIES-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 2

---

| Field | Value |
|---|---|
| Scope | Resolution check for F-01 through F-06 from Iteration 1; implementability, test-level appropriateness, test-file consistency with PLAN, guard-agent double enforcement |

---

## Prior Findings Resolution

| Prior ID | Severity | Resolution Status | Notes |
|----------|----------|-------------------|-------|
| F-01 | High | **Resolved** | `pipelineWiring.test.js` added to Section 13 Test File Index with full property list; PROP-OBS-02 formally added to Section 9; REQ-OBS-02 added to Coverage Matrix. |
| F-02 | High | **Resolved** | `tmp-git-fixture` helper specified in Section 11 with file path `pdlc/workflows/__tests__/fixtures/tmpGitFixture.js`, `runMergeBack` interface, and `beforeEach`/`afterEach` teardown. Section 14 Note 6 adds environment-aware skip guard when `git` is unavailable. |
| F-03 | High | **Resolved** | PROP-COMPAT-06 added to Section 7: asserts `guardAgentDouble.js` exists, exports `createGuardAgentDouble({ ok, reason })`, and is imported at every guard-agent test site (PROP-ENTRY-02/04/06 and PROP-LOOP-06). Verified by static import-path check in the dedicated `guardAgentDouble.test.js`. Section 11 and Section 13 updated consistently. |
| F-04 | Medium | **Resolved** | Section 2.1 preamble names the `runtimeCacheMock` helper and describes its injection contract (calls with index ≤ N return cached results; calls with index > N execute normally; injected as runtime context override). Section 11 Test Infrastructure table adds the helper with defined-in and description columns. |
| F-05 | Medium | **Resolved** | PROP-IMPL-01 now specifies call-order instrumentation explicitly: "wraps `log` and `agent` in recording proxies and asserts that the first `agent()` call for a batch occurs after the `log()` call for that batch's plan, verified by inspecting the call sequence recorded by the proxy." This is a standard unit-test pattern with a concrete assertion mechanism. |
| F-06 | Medium | **Resolved** | PROP-HARVEST-02 now specifies the extraction algorithm: search for sentinel, locate `[{dir}]` bracketed segment, use directory path as `{blocked-file-path}`, fall back to `"(path not parseable)"`. PROP-HARVEST-04 restates the same algorithm. Implementers have an unambiguous extraction spec. |
| F-07 | Low | **Partially resolved** | PROP-LOOP-12 text retains the same narrative description of the cap check. The phrase "cap check `iteration > 5` fires" and "the optimizer is invoked at iteration 5 before POSTMORTEM triggers" is present, but the property still lacks an explicit test assertion anchor (e.g., "assert POSTMORTEM branch fires when and only when `iteration === 6`"). Residual ambiguity is minor and non-blocking. |
| F-08 | Low | **Resolved** | PROP-HARVEST-03 FSPEC AT column now reads `— (TE-F06, PLAN TASK-P4-01)`, matching the annotation convention used in other rows. Section 14 Note 3 confirms the annotation. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | PROP-HARVEST-01 is labeled Integration level and asserts "The LEARNINGS commit must appear before any deletion commit in git log" — a property that requires inspecting real git history to verify. Unlike PROP-IMPL-08 (also Integration level), there is no test fixture or helper defined in Section 11 for the harvest-phase git-log check. The `tmp-git-fixture` helper is scoped to `PROP-IMPL-08` only. A se-implement agent authoring `harvestPhase.test.js` will need to decide independently whether to spin up a real git repository, use a git-log mock, or verify the ordering by inspecting the prompt passed to the harvest agent. The absence of a fixture spec creates an implementation gap comparable to the original F-02, though smaller in scope (the ordering is prompt-driven, so an argument exists for treating it as a unit test on the prompt string rather than an integration test on real git). Either (a) add a note to Section 11 explaining how PROP-HARVEST-01's Integration-level assertion is to be verified (e.g., "the harvest agent prompt ordering is asserted by inspecting the prompt string — PROP-HARVEST-01 is Integration in category but Unit in mechanism, similar to PROP-COMPAT-04/05"), or (b) reclassify to Unit and update the description accordingly. | PROP-HARVEST-01; Section 11 |
| F-02 | Low | Local | PROP-LOOP-12 still lacks an explicit, machine-readable assertion anchor for the cap boundary. The description states "cap check `iteration > 5` fires" and "the optimizer is invoked at iteration 5 before POSTMORTEM triggers, not skipped" but does not say "the test asserts the POSTMORTEM branch executes when the iteration counter equals 6 and the optimizer was called exactly 5 times." Without this, a test that fires POSTMORTEM at `iteration === 5` (skipping the final optimizer call) could be argued to satisfy the property's narrative. Adding the explicit assertion to the property description removes the ambiguity. | PROP-LOOP-12; TSPEC-LOOP-03, TSPEC-LOOP-07 |

---

## Questions

None. All questions from Iteration 1 (Q-01 through Q-04) are answered by the additions to Sections 2.1, 7, 11, and the updated property descriptions.

---

## Positive Observations

- All three High findings from Iteration 1 are cleanly resolved with concrete, machine-verifiable additions — no hand-waving or prose-only fixes.
- PROP-COMPAT-06's static import-path check mechanism (`guardAgentDouble.test.js`) is the right approach: it converts a convention requirement (DEC-ODW-03) into a property that fails at test time, not at code-review time.
- The `runtimeCacheMock` injection contract in Section 11 is precisely specified: call-index-based caching with a defined injection point. This eliminates the ad-hoc simulation risk identified in F-04.
- PROP-HARVEST-04's fallback to `"(path not parseable)"` is a good defensive spec addition — it gives implementers a defined behaviour for the malformed-message case instead of leaving it undefined.
- Section 14 Note 6 (PROP-IMPL-08 integration harness) is well-structured: the mixed unit/integration nature of `implPhase.test.js` is acknowledged, and the environment-aware skip guard prevents false failures in CI environments without git.
- The Coverage Matrix and Test File Index are now complete and consistent with the property set, resolving the traceability gap identified in F-01.

---

## Recommendation

**Approved with minor changes**

Both remaining findings are Low severity. The document is ready to gate implementation.

F-01 and F-02 above should be addressed before `harvestPhase.test.js` and `reviewLoop.test.js` are authored, but neither blocks the PROPERTIES document from serving as the implementation contract. The te-author may address them in a v1.2 pass or inline as notes in Section 11 and Section 14 respectively — neither requires structural change to the property set.
