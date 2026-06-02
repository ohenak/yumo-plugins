# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
**Date:** 2026-06-01
**Iteration:** 3

| Field | Value |
|---|---|
| Scope | FSPEC v1.2 iteration review — resolution check for F-NV-01 through F-NV-04 from v2 cross-review; new issues introduced by v1.2 changes; status of carried Low findings |

---

## Resolution Assessment: F-NV-01 through F-NV-04

| Prior ID | Severity | Resolution Status | Notes |
|----------|----------|------------------|-------|
| F-NV-01 | High | **Not resolved** | AT-VERDICT-06 was added for `VERDICT: Needs revision` as last line — this addresses F-NV-05 (the silent Needs revision asymmetry), not F-NV-01. F-NV-01 required an AT for the "VERDICT line followed only by empty lines" sub-case (e.g., `VERDICT: Approved\n\n\n`). AT-VERDICT-05 and AT-VERDICT-06 both cover only the "no line follows" (last-line) sub-case. The second sub-case specified in §2.2 step 6 and §2.3 — "all lines after the VERDICT line are empty" — remains without an AT. A parser that checks `index === lines.length - 1` (last-line check) satisfies both existing ATs while failing this sub-case. |
| F-NV-02 | High | **Resolved** | AT-LOOP-08 added. Covers both reviewers throwing exceptions in the same iteration; asserts two individual warning log lines (one per skill identifier), gate FAIL, optimizer invoked exactly once, iteration counter increments by 1, pipeline does not halt. Matches §7.3 exception paragraph precisely. |
| F-NV-03 | Medium | **Resolved** | §1.7 behavioral contract was revised: fresh run now emits `"Starting iteration 1"` (not `"Resuming from iteration 1"`). AT-RESUME-02 added, asserting the fresh-run log message is `"Starting iteration 1"` and not `"Resuming from iteration 1"`. The behavioral change and the new AT together resolve the gap. (A new secondary gap introduced by this revision is documented as F-V3-02 below.) |
| F-NV-04 | Medium | **Resolved** | AT-IMPL-04 added. Covers the all-agents-pass positive path: no failure marker in any agent result → batch treated as passed → `log("Batch N complete — all tests passing")` emitted → next batch dispatched. The Given clause mirrors §4.6's normative failure-marker definition, making this AT directly assertable as a unit test predicate. |

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-V3-01 | High | Local | **F-NV-01 remains unresolved: no AT for the "VERDICT line followed only by empty lines" truncated-output sub-case.** §2.2 step 6 and §2.3 specify two equivalent sub-cases for truncated output: (a) VERDICT line is the last line of output, and (b) all lines after the VERDICT line are empty. AT-VERDICT-05 and AT-VERDICT-06 cover only sub-case (a). Sub-case (b) — e.g., agent result is `"VERDICT: Approved\n\n\n"` (VERDICT line followed by two empty lines) — has no AT. A parser that checks `index === lines.length - 1` (last-line check) satisfies both existing ATs while failing sub-case (b): it would scan forward, find empty lines, exhaust the array, and then either crash or apply the non-truncated fallback path (treating the result as `Needs revision` with a warning), violating the normative contract. These are distinct parse-path conditions — the VERDICT line index relative to `lines.length - 1` differs between them — requiring separate tests. | §2.2 step 6, §2.3 Truncated-output special case, AT-VERDICT-05, AT-VERDICT-06 |
| F-V3-02 | Medium | Local | **No AT covers the log message at the start of a fresh-run iteration N ≥ 2.** §1.7 states: "All other iterations (N ≥ 2, or any iteration in a resumed run): `log('Resuming from iteration N')`." This means on a fresh run where iteration 1 fails and iteration 2 begins, the log message at the start of iteration 2 is `"Resuming from iteration 2"` — even though no interruption occurred. AT-RESUME-01 covers the interrupted-then-resumed case (iteration 3). AT-RESUME-02 covers fresh run iteration 1 (`"Starting iteration 1"`). AT-LOOP-02 covers the scenario where one reviewer fails and the counter becomes 2 — but its "Then" clause asserts only gate FAIL, optimizer invoked, counter becomes 2; it does not assert the log message at the start of iteration 2. Without this assertion, an implementation that emits `"Starting iteration N"` for all fresh-run iterations beyond iteration 1 (rather than `"Resuming from iteration N"`) would not be caught by any current AT. This is a direct consequence of the §1.7 behavioral change introduced in v1.2. | §1.7, AT-LOOP-02, AT-RESUME-01, AT-RESUME-02 |
| F-V3-03 | Medium | Local | **`"Starting iteration 1"` log has no parent requirement — it is an FSPEC-introduced observable with no REQ traceability.** §1.7 now specifies two distinct log messages: `"Starting iteration 1"` for fresh runs and `"Resuming from iteration N"` for resumes or N ≥ 2. REQ-PIPELINE-03's acceptance criterion only covers the resume case. The `"Starting iteration 1"` message is a new observable behavior introduced in the FSPEC without a parent requirement. The §1.7 "Reconciliation with REQ-PIPELINE-03" note acknowledges this is a FSPEC-level refinement but does not cite a parent REQ. The PROPERTIES document will need to classify the AT-RESUME-02 property; without a REQ linkage, the property is orphaned. Either add a REQ traceability note to §1.7 (e.g., citing REQ-OBS-01 as the loop-iteration log event parent) or add a new REQ entry before TSPEC authoring. | §1.7, AT-RESUME-02, REQ-PIPELINE-03, REQ-OBS-01 |
| F-V3-04 | Medium | Local | **No AT covers case-insensitive variants of `DECISIONS_WARRANTED` value.** §3.1 specifies case-insensitive comparison: "`true`, `True`, `TRUE` → `true`; `false`, `False`, `FALSE` → `false`." AT-DECISIONS-01 tests only exact lowercase `false`. AT-DECISIONS-02 tests the absent-field path. AT-DECISIONS-03 tests exact lowercase `true`. No AT tests a non-lowercase variant such as `DECISIONS_WARRANTED: False` (skip path) or `DECISIONS_WARRANTED: TRUE` (full path). An implementation using case-sensitive comparison would silently treat `False` as missing-field (defaulting to true with a warning), causing an incorrect full-DECISIONS path instead of the correct skip path — and no existing AT would detect this failure. The case-insensitive property is normatively stated and directly testable as two parser unit tests. | §3.1, AT-DECISIONS-01, AT-DECISIONS-03 |
| F-V3-05 | Low | Local | **AT-IMPL-01 "Who" field still reads "Developer observing `/workflows`" (F-NV-08 from v2 unresolved).** The "Then" clause contains a unit-level behavioral assertion ("verifiable by inspecting the script's sequential statement order") that is contradicted by a "Who" framing that anchors the test to UI observation. The v2 recommendation to update the "Who" to "Workflow script (call-order assertion)" was not applied across two review iterations. A PROPERTIES author classifying this AT's test level will still find the "Who" and "Then" contradictory. | AT-IMPL-01 |
| F-V3-06 | Low | Local | **AT-HARVEST-01 remains E2E-framed (F-NV-07 from v2, F-14 from v1 unresolved).** "LEARNINGS commit appears before any deletion commit in git log" requires inspecting an actual git repository after Phase H execution — an integration/E2E-level test. The recommended lower-level assertion — the harvest agent emits a LEARNINGS commit confirmation log before any delete Bash call is issued — has not been adopted across three review iterations. This AT will require E2E infrastructure to validate where a unit-level behavioral assertion could suffice. | §5.2, AT-HARVEST-01 |
| F-V3-07 | Low | Local | **Low findings F-10, F-11, F-12, F-13, and F-16 from Iteration 1 remain unaddressed after three review iterations.** Specifically: F-10 (multiple VERDICT lines — last-occurrence rule untested), F-11 (negative values in JSON findings count — named §2.3 fallback condition with no AT), F-12 (extra JSON keys — named §2.3 fallback condition with no AT), F-13 (empty REQ file — §6.1 step 4 validation path with no AT), F-16 (sub-batch splitting for >5 tasks — §4.3 concurrency cap with no AT). F-11, F-12, and F-16 in particular need ATs before PROPERTIES authoring, as those behavioral branches will require PROPERTIES classification. Persistent carry of these findings across three iterations is a signal that the AT-authoring pass is not sweeping the full §2.3 and §4.3 surface area. | §2.2, §2.3, §4.3, §6.1 |
| F-V3-08 | Low | Local | **`PHASE_H_ENABLED` flag in §5.1 leaves AT-HARVEST-01 and AT-HARVEST-02 unvalidatable while the flag is `false`, with no precondition stated in the ATs.** §5.1 introduces the flag with an inline comment `// Set to false until feature-branch-consistency fix lands`, implying the flag may be `false` at initial ship. Neither AT-HARVEST-01 nor AT-HARVEST-02 includes a precondition stating `PHASE_H_ENABLED = true`. If Phase H is skipped at initial ship, these ATs cannot be validated in the first release, yet there is no PROPERTIES-classification note deferring them. The ATs should include a precondition ("Given: `PHASE_H_ENABLED` is `true`") or a deferral note, so PROPERTIES authoring can correctly classify them as conditional-on-flag. | §5.1, AT-HARVEST-01, AT-HARVEST-02 |
| F-V3-09 | Low | Cross-Feature | **F-NV-09 from v2 (additive trailer convention undocumented as a reusable pattern) remains unresolved after two iterations.** The `DECISIONS_WARRANTED:` workflow-invocation-scoped trailer — a structured return value injected at agent-call time without modifying the skill globally — is a durable cross-feature pattern not documented in `docs/_decisions/` or as a SKILL.md annotation. Future workflow authors will reinvent this pattern ad hoc without that documentation. | §3.1 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from prior iterations: Does the workflow runtime's `resumeFromRunId` parameter name match what is assumed in REQ-PIPELINE-03? AT-RESUME-01 and AT-RESUME-02 now assert specific log content and behavior, but the mechanism triggering the resume is still unspecified. The TSPEC will need this resolved before it can specify the resume interface. |
| Q-02 | §1.7 specifies that on a fresh run, iteration N ≥ 2 emits `"Resuming from iteration N"`. Is "Resuming" intentional for a non-interrupted run? This is semantically confusing — "Resuming" implies a prior interruption. If the intent is to distinguish "this is not the first attempt at this phase," a clearer log message (e.g., `"Continuing to iteration N"`) would avoid ambiguity in production debugging. If "Resuming" is intentional, the TSPEC should document the rationale. |
| Q-03 | Carried from v2: §2.3 specifies that `VERDICT: Needs revision` with no subsequent non-empty line is accepted silently — no warning emitted. Is this intended? A reviewer whose output is truncated but happens to emit the VERDICT line will cause a silent gate-FAIL indistinguishable from a valid failing vote. Should truncated `Needs revision` outputs emit a different log entry to aid debugging? |
| Q-04 | Carried from prior iterations: REQ-NFR-01's worst-case formula uses "7 phases" but §6.2 lists 8 review phases. OQ-04 has been in the open-questions table across all three iterations without resolution. Does this require a REQ amendment before TSPEC authoring to avoid a traceability mismatch in the PROPERTIES document? |

---

## Positive Observations

- AT-LOOP-08 is the most precisely specified new AT in v1.2. The "Given" pins the condition exactly (both agents throw exceptions before returning any output, no VERDICT line present in either result), the "Then" asserts two warning log lines with correct per-reviewer attribution (one for each skill identifier), and the negative assertion "optimizer invoked exactly once (not twice)" guards against a plausible over-invocation bug. This is the correct level of specificity for a dual-crash test.
- AT-VERDICT-06 adds coverage for the `VERDICT: Needs revision` truncated case and resolves F-NV-05 from v2. The explicit assertion "gate state is FAIL (the `Needs revision` verdict is acted on, not the zero count)" correctly separates the verdict-acting signal from the findings-count signal — a non-obvious distinction that a parser implementation could get wrong.
- AT-IMPL-04's "Given" clause directly mirrors §4.6's normative failure-marker definition ("no agent result contains a line matching `Tests: N failed`... and no agent result contains `non-zero exit`"), making the test condition copy-derivable from the spec. This alignment between spec language and test language eliminates interpretive gaps between the FSPEC and the test implementer.
- AT-RESUME-02's negative assertion ("not `'Resuming from iteration 1'`") guards against the most likely misimplementation: an unconditional `"Resuming from iteration N"` log that ignores the fresh-vs-resumed distinction. The negative assertion is correctly placed and earns its place.
- The §1.7 "Reconciliation with REQ-PIPELINE-03" note transparently documents the FSPEC-REQ behavioral divergence in place. This is good practice even though the traceability gap for the new `"Starting iteration 1"` log remains for PROPERTIES authoring to resolve.

---

## Recommendation

**Needs revision**

One High finding and three Medium findings require resolution before PROPERTIES authoring can proceed:

1. **F-V3-01 (High):** Add an AT for the "VERDICT line followed only by empty lines" sub-case. Suggested given: agent result is `"VERDICT: Approved\n\n\n"` (VERDICT line followed by two empty lines). Then: verdict `Approved` is accepted; findings count defaults to `{"high": 0, "medium": 0, "low": 0}`; no fallback warning is emitted.

2. **F-V3-02 (Medium):** Add an assertion to AT-LOOP-02 (or a new AT) that the log message at the start of iteration 2 on a fresh run is `"Resuming from iteration 2"` — not `"Starting iteration 2"`. This closes the §1.7 behavioral gap introduced by the v1.2 revision.

3. **F-V3-03 (Medium):** Add REQ traceability for the `"Starting iteration 1"` log behavior. Either add a traceability note in §1.7 citing a parent requirement (e.g., REQ-OBS-01) or add a new REQ entry before TSPEC authoring, so AT-RESUME-02 has a traceable parent for PROPERTIES classification.

4. **F-V3-04 (Medium):** Add two ATs for case-insensitive `DECISIONS_WARRANTED` parsing: one testing `DECISIONS_WARRANTED: False` → skip path entered (no absent-field warning), one testing `DECISIONS_WARRANTED: TRUE` → full DECISIONS path entered (no absent-field warning).

The Low findings (F-V3-05 through F-V3-09) and the carried Iteration 1 Low findings (F-10, F-11, F-12, F-13, F-16) should be resolved in the same pass. F-V3-07 items F-11, F-12, and F-16 are specifically recommended before PROPERTIES authoring, as those behavioral branches will require PROPERTIES classification.
