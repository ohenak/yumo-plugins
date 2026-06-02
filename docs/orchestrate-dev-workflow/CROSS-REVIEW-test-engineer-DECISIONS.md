---
Scope: docs/orchestrate-dev-workflow/DECISIONS-orchestrate-dev-workflow.md
---

# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/DECISIONS-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 1

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | High | Local | **DEC-ODW-01 re-evaluation trigger is not observable by an automated test or monitor.** The trigger is "if post-ship feedback shows that users frequently need to modify or reject the computed batch plan before implementation begins." There is no observable condition — no threshold, no log event, no metric. "Frequently" is undefined. A test or monitoring rule cannot detect this condition. Contrast with DEC-ODW-03, whose trigger is a concrete runtime API addition (`readFile()` / `fileExists()`), which is observable by inspecting the runtime changelog or checking whether the API call compiles. To become testable, the trigger should specify an observable proxy: e.g., "if more than N% of pipeline runs in a given period produce a post-hoc PLAN amendment commit before Phase I completes" or "if a POSTMORTEM cites batch-plan ordering as the pattern of disagreement in more than M% of non-converging PLAN review phases." As stated, no test, monitor, or acceptance criterion can operationalize "user frequently needs to modify." | DEC-ODW-01 Re-evaluation triggers |
| F-02 | Medium | Local | **DEC-ODW-03 guard-agent approach introduces test-double complexity that is not acknowledged.** The guard agent is the sole existence-check mechanism for both the initial REQ path check (TSPEC-ENTRY-03) and the `reviewLoop` pre-entry check (TSPEC-LOOP-02). This means every unit test that exercises the existence-check code path must stub or fake the `agent()` call. The document notes reversibility ("easy in the future direction") but does not acknowledge that all tests for entry validation and reviewLoop pre-entry guard will require agent call doubles that return structured JSON (`{ "ok": false, "reason": "file_not_found" }` etc.). If the test double protocol for the guard agent diverges from what the real agent returns, tests can pass while the production code silently mis-branches. The missing acknowledgement is: (a) the guard agent return protocol (`{ "ok": true }` / `{ "ok": false, "reason": "..." }`) is a test contract that must be stable and specified; (b) the PROPERTIES document or PLAN should designate a canonical test double for the guard agent to prevent per-test ad-hoc stubbing. The absence of this acknowledgement means the PLAN author and PROPERTIES author may omit a test-double definition, creating brittle, siloed stubs. | DEC-ODW-03 Decision, Alternatives considered |
| F-03 | Medium | Local | **No decision recorded for the DECISIONS_WARRANTED trailer injection mechanism.** DEC-ODW-02 records the VERDICT trailer as a permanent SKILL.md addition. The parallel decision — that `DECISIONS_WARRANTED:` is injected by the workflow script at invocation time (not baked into `se-author`'s SKILL.md) — is a distinct architectural choice with its own testing implications. Specifically: any test that exercises the `DECISIONS_WARRANTED` parsing path (AT-DECISIONS-01 through AT-DECISIONS-05 in the FSPEC) must inject the trailer instruction in the prompt, meaning the test couples to the invocation-time injection mechanism. If a future refactor moves the trailer to the SKILL.md (making the injection symmetric with DEC-ODW-02), all those tests' setup would change without any decision record signaling the risk. The testability dimension that should be captured: "the `DECISIONS_WARRANTED` contract is caller-side only; no PROPERTIES test can verify it without constructing the exact post-PASS prompt that injects the instruction." | FSPEC §3.1, DEC-ODW-02 (contrast) |
| F-04 | Low | Local | **DEC-ODW-02 re-evaluation trigger is not fully observable.** The trigger is "if a future caller requires suppression of the VERDICT trailer." "Requires suppression" is a demand that arises in the caller and has no in-system observable signal — there is no log event, no metric, and no automated check that can fire before the caller discovers the problem at runtime. A more testable formulation: "if a consumer integration test begins failing because the VERDICT trailer lines appear in surfaced output (i.e., a test asserts on final-message content and the trailing lines break the assertion), then consider a suppression mechanism." This re-evaluation trigger would be actionable by an integration test failure, which is observable. The current phrasing is close but depends on user perception ("finds confusing") rather than a detectable system condition. | DEC-ODW-02 Re-evaluation triggers |
| F-05 | Low | Cross-Feature | **No decision recorded for the PHASE_H_ENABLED compile-time flag.** FSPEC §5.1 and TSPEC-HARVEST-01 define `PHASE_H_ENABLED = true` as a compile-time gate with explicit skip behavior, log messages, and a final-report representation. This is a load-bearing architectural choice — it is the primary mechanism for disabling an entire pipeline phase — yet no DECISIONS entry records why a compile-time boolean flag was chosen over alternatives (e.g., a runtime configuration parameter, a SKILL.md conditional, or a feature flag in `meta`). The absence matters for testability: any test for the Phase H skip path must compile against a specific value of `PHASE_H_ENABLED`. If the mechanism changes (e.g., to a `meta.flags` field), the test-harness setup changes with it and there is no decision record to explain why the original choice was made or what would justify changing it. | FSPEC §5.1, TSPEC-HARVEST-01 |
| F-06 | Low | Process | **The DECISIONS document omits a "Testability" subsection for each decision.** The PDLC template captures `Reversibility` and `Re-evaluation triggers` but not `Testability implications.` For decisions that foreclose or constrain a testing approach (DEC-ODW-03 forecloses `fs.existsSync` mock-based tests; DEC-ODW-02 requires the VERDICT trailer to be parseable end-to-end in reviewer skill integration tests), the PROPERTIES author has no structured place to look when designing test doubles and integration boundaries. Adding a `Testability:` field to the DECISIONS document template — even a single sentence — would provide the TE author a decision-scoped anchor. This is a process gap applicable to all future DECISIONS documents, not just this one. | DEC-ODW-01, DEC-ODW-02, DEC-ODW-03 (all decisions) |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | For DEC-ODW-03: is the guard agent's return protocol (`{ "ok": true }` / `{ "ok": false, "reason": "file_not_found" \| "file_empty" \| "path_invalid" }`) considered a formal data contract that the PROPERTIES document will define a canonical test double for, or is each call-site test expected to define its own stub? This determines whether F-02 is addressed in PROPERTIES authoring or in PLAN. |
| Q-02 | For DEC-ODW-01: is there an existing observability mechanism (e.g., a POSTMORTEM's "Pattern of Disagreement" section mentioning batch-plan ordering) that could serve as a proxy signal for the re-evaluation trigger? If so, the trigger could be made concrete: "if any POSTMORTEM for a PLAN phase cites batch-plan ordering as the root cause, re-evaluate DEC-ODW-01." |
| Q-03 | FSPEC §5.1 and TSPEC-HARVEST-01 define the `PHASE_H_ENABLED` flag but it does not appear in the DECISIONS document. Is the omission intentional (i.e., it was considered a trivial implementation detail rather than a load-bearing alternative)? If so, the DECISIONS document should note this explicitly so reviewers do not infer a gap. |

---

## Positive Observations

- DEC-ODW-03 is an exemplar of a well-documented testability consequence: the document explicitly identifies the runtime constraint (no `fs` access), names the alternative that was rejected, states exactly where the rejected alternative appeared (TSPEC v1.0 draft), and identifies how the rejection was discovered (TE cross-review Iteration 2, F-03). A future engineer reviewing a test that stubs `agent()` for existence-checking will immediately understand why.
- DEC-ODW-02's rejection rationale for Option B (script-side injection) directly identifies the silent-failure mode: "a caller that forgets the injection would receive unstructured output and cause a silent `parseVerdict` fallback to 'Needs revision.'" Naming the silent-failure mode is directly useful for test design — the corresponding test for "reviewer skill without VERDICT trailer injected" now has a specified expected outcome.
- Recording all three decisions as a standalone DECISIONS document (rather than dispersing them across TSPEC prose) keeps the PLAN and PROPERTIES authors from having to re-derive why `fs.existsSync` is absent from the script and why `DECISIONS_WARRANTED` is caller-injected. The document delivers its primary value for those downstream roles.

---

## Recommendation

**Needs revision**

Two Medium findings and one High finding must be addressed before PROPERTIES authoring begins:

- **F-01 (High):** The DEC-ODW-01 re-evaluation trigger must be replaced with an observable, operationalizable condition. A suggested formulation: "if any POSTMORTEM artifact for a PLAN review phase cites batch-plan ordering as the pattern of disagreement, re-evaluate the two-workflow split." This is detectable by inspecting POSTMORTEM artifacts — no continuous monitoring infrastructure is required.

- **F-02 (Medium):** DEC-ODW-03 must acknowledge the test-double complexity introduced by the agent-call gate. Add a sentence to the Decision or Alternatives section stating: (a) the guard agent return protocol is a test contract; (b) a canonical test double for the guard agent should be defined once (in PLAN or PROPERTIES) rather than per-test; (c) divergence between the test double and the real agent constitutes a contract violation that produces false-passing tests.

- **F-03 (Medium):** Add a fourth decision, DEC-ODW-04, recording the `DECISIONS_WARRANTED` trailer as a script-side injection (not a SKILL.md addition). Include: the constraint that forced this shape (this trailer is workflow-invocation-specific; baking it into `se-author` SKILL.md would emit it on every `se-author` call regardless of caller), the testability implication (every DECISIONS-path test must construct the exact post-PASS prompt to exercise the parsing path), and the re-evaluation trigger (if VERDICT and `DECISIONS_WARRANTED` are ever unified into a single SKILL.md contract, this decision is superseded by DEC-ODW-02).

Low findings (F-04, F-05, F-06) may be addressed in the same editorial pass or deferred to PLAN authoring. F-05 should be communicated to the PROPERTIES author before Phase H skip-path test design begins.

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 3}
