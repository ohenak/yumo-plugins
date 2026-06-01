# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/REQ-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 1

| Field | Value |
|---|---|
| Scope | REQ review — testability, edge case completeness, precision, error/boundary conditions |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | High | Local | **REQ-GATE-01 is untestable as written.** The criterion states the gate decision is determined "solely from the return values of the reviewer agents (not from reading files on disk)" but provides no observable means to verify this. There is no way to write a test that distinguishes "decision came from return value" vs. "decision came from a disk read" without an architectural constraint surfaced in the TSPEC. The acceptance criterion must state what the script inspects (e.g., "the `result` field of the completed agent call object") so a unit test can assert the correct data path. | REQ-GATE-01 |
| F-02 | High | Local | **REQ-PIPELINE-03 (resumability) acceptance criteria are untestable.** The criterion says "already-completed agent calls do not re-execute" but names no observable evidence of this — no log entry, no counter, no API call record. Without a verifiable signal (e.g., a specific `log()` message, a count of agent invocations, or an API-level cache-hit indicator), there is no way to write a test that distinguishes resumed execution from a fresh re-run that happens to produce the same results. | REQ-PIPELINE-03 |
| F-03 | High | Local | **REQ-COMPAT-01 verdict format is partially underspecified.** The requirement says the final message ends with `VERDICT: <Approved \| Approved with minor changes \| Needs revision>` followed by a JSON object `{"high": N, "medium": N, "low": N}`. It does not specify: (a) whether the VERDICT line and JSON are on the same line or separate lines; (b) whether any text may appear between the VERDICT line and the JSON; (c) what the script does when the JSON is malformed or absent. Without exact format rules, the parsing logic cannot be deterministically tested — a test that passes with one whitespace convention may fail with another. | REQ-COMPAT-01 |
| F-04 | High | Cross-Feature | **No negative test requirement for the VERDICT parser.** REQ-GATE-01 and REQ-COMPAT-01 together imply that the script parses a `VERDICT:` line from agent return values. There is no requirement covering what happens when a reviewer agent returns output that does not contain the `VERDICT:` line (e.g., agent crashes mid-output, returns truncated text, or an older un-patched skill is invoked). This failure mode propagates silently through the gate and could cause the loop to stall or mis-branch. A negative requirement must be added. This is Cross-Feature because it applies to any future consumer of the verdict trailer pattern. | REQ-GATE-01, REQ-COMPAT-01 |
| F-05 | Medium | Local | **REQ-GATE-02 does not specify behavior when one reviewer agent fails mid-iteration.** If one reviewer agent fails (crashes, times out), does the second continue? Does the iteration count still increment? Does the loop treat a crashed reviewer as "Needs revision" or halt the pipeline? The acceptance criterion covers the happy path and the convergence case but is silent on partial-iteration failure, making the error branch untestable. | REQ-GATE-02 |
| F-06 | Medium | Local | **REQ-GATE-04 acceptance criterion does not specify required POSTMORTEM content.** Criterion (1) says the agent writes a POSTMORTEM "with the pattern-of-disagreement analysis" but does not list required sections or fields. The SKILL.md has a detailed template (Phase, Iterations, Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation). If the REQ does not enumerate required sections, there is no basis for a test to assert content completeness — only path existence can be asserted. Either enumerate required sections here or explicitly defer to the SKILL.md template by reference. | REQ-GATE-04 |
| F-07 | Medium | Local | **REQ-ARTIFACTS-02 has an ambiguous halt condition.** Criterion (2) says "if the guard hook blocks a deletion, the run halts with an error rather than silently skipping the delete." There is no specification of what constitutes an observable "error halt" — no exit code contract, no report message format, no distinction between a guard-triggered halt and any other halt. Without a precise observable, a test cannot distinguish "halted because guard fired" from "halted for another reason." | REQ-ARTIFACTS-02 |
| F-08 | Medium | Local | **REQ-NFR-01 acceptance criterion weakens the stated requirement with an undefined "typical feature."** The description says "well under the 1,000-agent-per-run cap" but the acceptance criterion only tests "total agents for a typical feature remain under 100." "Typical feature" is undefined and untestable — a test cannot instantiate a "typical feature." The criterion should either define a concrete upper bound for a maximum-complexity feature (all 7 review phases each hitting 5 iterations + max 5 impl agents) or state that the bound is enforced structurally (e.g., the script's topology prevents exceeding N agents). | REQ-NFR-01 |
| F-09 | Medium | Local | **REQ-NFR-02 acceptance criterion is not mechanically verifiable.** "No individual CROSS-REVIEW document content... [is] visible in the main conversation" cannot be asserted by an automated test against the workflow script itself — it describes a runtime memory property of the Claude Code session. The requirement should be reframed in terms of something the script can guarantee structurally (e.g., "agent result objects are stored in script-local variables and are never passed as arguments to a `log()` call that surfaces in the main context") so a code review or static analysis can verify it. | REQ-NFR-02 |
| F-10 | Medium | Cross-Feature | **DECISIONS phase conditional trigger has no testable criterion.** REQ-PIPELINE-02 lists DECISIONS as a phase that must execute when warranted, and the SKILL.md describes a heuristic ("were real alternatives weighed and rejected?"). But the REQ contains no requirement specifying what condition causes the DECISIONS phase to be included or skipped. This makes it impossible to write a test that verifies the conditional gate fires correctly. The condition needs to be stated as a verifiable predicate (e.g., "the TSPEC cross-review contains at least one finding referencing a rejected alternative" or "the script exposes an `includeDecisions` parameter"). | REQ-PIPELINE-02 |
| F-11 | Low | Local | **REQ-OBS-01 does not define the format for loop iteration numbers.** The acceptance criterion says loop iteration numbers are shown for review phases but does not specify format or location (phase label, agent label, or a separate log call). This is implementable in multiple incompatible ways; a test cannot assert the correct format without a tighter specification. | REQ-OBS-01 |
| F-12 | Low | Local | **REQ-OBS-02 uses emoji characters (✅/❌) as status indicators without specifying whether these are required or illustrative.** A test validating report format cannot know whether to assert for these specific characters or any non-empty status string. | REQ-OBS-02 |
| F-13 | Low | Local | **REQ-PIPELINE-02 acceptance criterion relies on an external reference for phase sequence.** The criterion says "all phases have executed in the defined sequence" but the defined sequence lives only in SKILL.md, not in the REQ itself. A test asserting sequential phase execution needs a canonical ordered list in the REQ to assert against — relying on SKILL.md creates a moving-target dependency. | REQ-PIPELINE-02 |
| F-14 | Low | Process | **No requirement covers unparseable REQ file path.** There is no requirement covering the behavior when the REQ file path cannot be parsed to extract a feature name (e.g., a path that does not follow `docs/{feature}/REQ-{feature}.md`). The SKILL.md Step 1 describes parse-and-extract logic but it is not captured in the REQ as a testable requirement. This edge case should be stated explicitly so downstream error handling can be verified. | REQ-PIPELINE-01 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ-PIPELINE-03 references `resumeFromRunId` — is this a specific API parameter of the dynamic workflow runtime? If so, the requirement should cite the exact field name so a test can verify the correct invocation signature. If it is illustrative, the requirement should say "using the runtime's resume mechanism" and defer the exact API to the TSPEC. |
| Q-02 | REQ-GATE-02 says "a single reusable `reviewLoop` construct SHALL serve all review phases." Is `reviewLoop` a named function in the workflow script or a workflow-level construct (e.g., a `phase()` with a loop wrapper)? The distinction affects how it can be unit-tested in isolation. |
| Q-03 | REQ-COMPAT-02 says hooks fire "identically in the workflow context as they do in interactive use." The `nudge-consolidation` hook fires on `SessionStart`. Does the workflow runtime trigger `SessionStart` for each agent sub-session, or only for the top-level session? This determines whether the hook fires at all in the workflow context and should be clarified to avoid a silent gap. |
| Q-04 | REQ-GATE-03 says the batch plan is "logged to the /workflows progress view via `log()`." Is there a verifiable assertion that `log()` was called with the batch plan before any `se-implement` agent is dispatched — e.g., ordering enforced by the script structure — or is this a best-effort observability guarantee? |
| Q-05 | Is there a requirement covering what happens if the workflow script is invoked with a REQ path that points to a file in a non-standard location (outside `docs/{feature}/`)? The current REQ only covers the missing-file case. |

---

## Positive Observations

- The `VERDICT:` trailer pattern in REQ-COMPAT-01 is well-designed for script-owned gate logic: a structured return value is far more testable than a file-read approach.
- REQ-GATE-02's requirement for a single reusable `reviewLoop` construct is an excellent testability choice — it concentrates loop logic into one unit that can be tested in isolation across all phases.
- REQ-GATE-04 correctly mandates POSTMORTEM *before* halt, ensuring test infrastructure can assert that the artifact exists on the branch at the point the workflow terminates.
- REQ-ARTIFACTS-02's layered enforcement model (prompt ordering + guard hook) creates two independently testable safety layers for harvest ordering.
- The traceability matrix is complete and all requirements trace to at least one user story.
- Risks R1 and R2 are clearly analyzed with explicit acceptance decisions, reducing the chance of implicit assumptions slipping through to test design.

---

## Recommendation

**Needs revision**

The four High findings must be resolved before this REQ can serve as a test-design basis:

- **F-01:** REQ-GATE-01 must specify the observable data path used for gate decisions so a unit test can assert the correct data source.
- **F-02:** REQ-PIPELINE-03 must identify a verifiable signal that resumed agents did not re-execute.
- **F-03:** REQ-COMPAT-01 must precisely specify the VERDICT output format (line structure, separator, error handling for malformed output) to enable a deterministic parser test.
- **F-04:** A new negative requirement must cover the behavior when a reviewer agent returns output without a `VERDICT:` line.

The Medium findings F-05, F-06, F-07, F-08, F-09, and F-10 should also be resolved in the same revision pass as they each block test-case definition for important error paths and boundary conditions.
