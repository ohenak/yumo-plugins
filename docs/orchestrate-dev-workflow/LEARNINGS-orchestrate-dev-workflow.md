# LEARNINGS — orchestrate-dev-workflow

| Field | Detail |
|---|---|
| Feature | orchestrate-dev-workflow |
| REQ | docs/orchestrate-dev-workflow/REQ-orchestrate-dev-workflow.md |
| Date Completed | 2026-06-02 |
| Total Iterations | REQ: 2, FSPEC: 5, TSPEC: 3, DECISIONS: 2, PLAN: 2, PROPERTIES: 2, IMPL: 2 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | CROSS-REVIEW-software-engineer-REQ.md, CROSS-REVIEW-software-engineer-REQ-v2.md, CROSS-REVIEW-test-engineer-REQ.md, CROSS-REVIEW-test-engineer-REQ-v2.md, CROSS-REVIEW-software-engineer-FSPEC.md, CROSS-REVIEW-software-engineer-FSPEC-v2.md, CROSS-REVIEW-software-engineer-FSPEC-v3.md, CROSS-REVIEW-software-engineer-FSPEC-v4.md, CROSS-REVIEW-software-engineer-FSPEC-v5.md, CROSS-REVIEW-test-engineer-FSPEC.md, CROSS-REVIEW-test-engineer-FSPEC-v2.md, CROSS-REVIEW-test-engineer-FSPEC-v3.md, CROSS-REVIEW-test-engineer-FSPEC-v4.md, CROSS-REVIEW-test-engineer-FSPEC-v5.md, CROSS-REVIEW-product-manager-TSPEC.md, CROSS-REVIEW-product-manager-TSPEC-v2.md, CROSS-REVIEW-product-manager-TSPEC-v3.md, CROSS-REVIEW-test-engineer-TSPEC.md, CROSS-REVIEW-test-engineer-TSPEC-v2.md, CROSS-REVIEW-test-engineer-TSPEC-v3.md, CROSS-REVIEW-product-manager-DECISIONS.md, CROSS-REVIEW-product-manager-DECISIONS-v2.md, CROSS-REVIEW-test-engineer-DECISIONS.md, CROSS-REVIEW-test-engineer-DECISIONS-v2.md, CROSS-REVIEW-product-manager-PLAN.md, CROSS-REVIEW-product-manager-PLAN-v2.md, CROSS-REVIEW-test-engineer-PLAN.md, CROSS-REVIEW-test-engineer-PLAN-v2.md, CROSS-REVIEW-product-manager-PROPERTIES.md, CROSS-REVIEW-product-manager-PROPERTIES-v2.md, CROSS-REVIEW-software-engineer-PROPERTIES.md, CROSS-REVIEW-software-engineer-PROPERTIES-v2.md, CROSS-REVIEW-product-manager-IMPLEMENTATION.md, CROSS-REVIEW-product-manager-IMPLEMENTATION-v2.md, CROSS-REVIEW-test-engineer-IMPLEMENTATION.md, CROSS-REVIEW-test-engineer-IMPLEMENTATION-v2.md |

---

## 1. Non-Convergences

No phases reached the 5-iteration limit and no POSTMORTEMs were written. All phases converged before the cap. The FSPEC phase took 5 iterations but ended with "Approved" at the cap boundary, not "Needs revision" — this is the closest the feature came to triggering POSTMORTEM procedures.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| FSPEC | SE + TE | High findings cascaded across iterations: SE found 3 Highs in v1; TE found 3 independent Highs in v1 (different specific gaps); FSPEC v1.1 addressed SE Highs fully but introduced a new High in v1.2 that blocked v3 approval. | Each iteration introduced minor new issues while resolving prior ones. Most were targeted AT additions or parsing-algorithm clarifications. Converged at v1.4 with no High/Medium remaining. | 5 |
| TSPEC | TE | A behavioral contradiction between TSPEC-LOOP-03 (4 optimizer calls before cap) and FSPEC §1.8 (5 optimizer calls) was found in v2 — a High that required a targeted pseudocode rewrite. | Iteration-cap pseudocode rewritten to place cap check at loop-top with counter increment after optimizer. | 3 |

---

## 2. Cross-Feature Patterns

| Finding | Suggested Promotion Target |
|---|---|
| **Shared data-contract gap pattern**: Any time a reviewer agent's output is machine-parsed by a workflow script, the exact format (casing, line placement, presence/absence rules, fallback behavior) must be specified at REQ level as a normative contract — not derived later in the FSPEC. This feature invested 2+ REQ iterations primarily to nail down the VERDICT trailer format (line structure, malformed-output fallback) and the `decisionsWarranted` boolean format. The same effort will recur in any future workflow that parses structured agent output. | `docs/_constraints/DOMAIN-CONSTRAINTS.md`: add constraint "Any structured return-value convention between workflow scripts and skills must define: (a) exact format spec, (b) fallback on malformed/absent, (c) whether baked into SKILL.md or injected at call time — before FSPEC authoring." |
| **Plugin-to-consumer-repo workflow-sync mechanism**: `pdlc/workflows/orchestrate-dev.js` (canonical plugin source) vs `.claude/workflows/orchestrate-dev.js` (runtime-loaded copy) was an open question across all 5 FSPEC iterations without resolution. This exact problem will recur for every future workflow-bearing plugin in this repo. | `docs/_decisions/DECISIONS-plugin-distribution.md`: record the provisional decision (manual copy) and the unresolved distribution mechanism as a named open question for the plugin ecosystem. |
| **Additive caller-scoped trailer convention**: The `DECISIONS_WARRANTED:` trailer — a workflow-script-injected structured return value that does not modify the skill globally — is a reusable pattern for future workflow authors who need structured output from worker skills without changing them for all callers. Not documented anywhere as a named pattern. | `docs/_decisions/DECISIONS-workflow-trailer-convention.md`: document the pattern with DEC-ODW-02 and DEC-ODW-04 as the canonical examples; include the testability implication (every path exercising the trailer must reconstruct the invocation-time injection). |
| **`VERDICT:` parser negative requirements**: The requirement that the script must handle missing, malformed, or truncated VERDICT output was not present at REQ v1.0 — it required a Cross-Feature finding from TE (REQ v1 F-04) to prompt REQ-GATE-05. Any workflow that parses agent output needs a negative-path requirement from the start. | `docs/_constraints/DOMAIN-CONSTRAINTS.md`: add constraint "Workflow scripts that parse agent output MUST include a REQ-level requirement for the absent/malformed/truncated case, with exact fallback behavior and an observable log signal." |

---

## 3. Rejected Proposals (with rationale)

| Proposal | Rejected By | Rationale | Reusable for future features? |
|---|---|---|---|
| Two-workflow split (`orchestrate-spec` + `orchestrate-impl`) as the architecture | pm-author + REQ scope boundary | Reintroduces manual coordination between runs; the runtime lacks a mid-run pause/resume-for-input primitive. Explicitly declared out of scope in REQ Scope section. Documented as the known alternative in SKILL.md rewrite (REQ-SKILL-01 requirement). | Yes — any future workflow that considers splitting at a natural handoff point should evaluate the same forcing function (unattended vs. attended execution model). |
| Script-side injection of VERDICT trailer (not baked into SKILL.md) | SE author | VERDICT is a shared data contract consumed by all callers (Ptah engine, interactive, workflow). Baking it into SKILL.md ensures all callers receive a stable parse target without per-caller coordination. Injecting from the script would cause silent `parseVerdict` fallback for non-workflow callers. | Yes — universality of benefit is the right criterion for deciding whether a trailer is SKILL.md-native vs. caller-injected. `DECISIONS_WARRANTED` was rejected from SKILL.md precisely because the inverse holds. |
| `fs.existsSync` for REQ-path and reviewLoop precondition checks | TE review (caught TSPEC v1.0 contradiction), SE review | The dynamic workflow runtime does not expose `fs` to the script. This was a TSPEC v1.0 specification error, not a viable alternative. DEC-ODW-03 records it explicitly as a draft error. | Yes — serves as a reminder to verify runtime API surface before writing file-access logic in workflow scripts. |
| Per-test ad-hoc stubbing of the guard agent | TE review (DEC-ODW-03 mandate) | Ad-hoc stubs create silent divergence from the real agent's return protocol, producing false-passing tests. DEC-ODW-03 mandates a single canonical `createGuardAgentDouble` at a named path, imported by every test site. | Yes — any workflow entity that acts as a gate (returning a structured ok/error response) should have a canonical test double defined in PLAN and enforced by a PROPERTIES contract property. |

---

## 4. Process Learnings

### 4a. The FSPEC acceptance-test gap is the highest-leverage review debt in this pipeline

The TE FSPEC reviews across 5 iterations were dominated by a single pattern: FSPEC behavioral branches that had no corresponding acceptance test. High findings were raised for missing ATs in iterations 1–4, with Low-severity carries persisting to iteration 5 (5 branches still missing ATs at final approval). Every missing AT at the FSPEC stage became either a Properties gap (requiring a process-note about derivation from prose) or a test-coverage gap in the implementation.

**Signal for skill prompts:** The `te-review` skill's FSPEC review checklist should include: "For every named behavioral branch in §7 (error flows) and every explicitly conditional path (PASS/FAIL, skip/full, crash/non-crash), verify an acceptance test exists in §8. A branch with no AT is a High finding." Currently the skill checks for AT presence only generally.

### 4b. TSPEC pseudocode must show counter placement explicitly

The TSPEC-LOOP-03 / FSPEC §1.8 contradiction (4 vs 5 optimizer calls before cap) arose because the TSPEC pseudocode did not show the counter increment and cap-check positions explicitly — they were implied by narrative prose. This exact class of defect (off-by-one in loop boundary conditions) is the most common pseudocode ambiguity in iterative algorithms.

**Signal for skill prompts:** The `se-author` TSPEC skill should require: "For any loop with a cap, the pseudocode MUST show (a) where the counter increments, (b) where the cap check fires, and (c) a counter-value-to-action table. These must be consistent with each other."

### 4c. DECISIONS documents omitted testability implications for 3 of 4 decisions

The TE DECISIONS review identified that none of the four decisions included a "Testability" field. Three decisions had non-obvious testing consequences: DEC-ODW-03 (all guard-agent code paths require a canonical test double — not acknowledged), DEC-ODW-04 (every DECISIONS-path test must construct the post-PASS injection prompt — not acknowledged until v2 Low finding), and `PHASE_H_ENABLED` (Phase H skip-path tests must compile against the flag value — no DECISIONS entry at all). These absences cascaded into PLAN and PROPERTIES authoring gaps.

**Signal for skill prompts:** The DECISIONS document template should include a `Testability:` field for each decision, even if one sentence. The `se-author` skill prompt should call this out explicitly. The `te-review` skill for DECISIONS should flag any decision that forecloses or constrains a testing approach without a corresponding testability note as a Medium finding.

### 4d. PROPERTIES reviews consistently found test-infrastructure gaps that PLAN should have specified

Both PROPERTIES review iterations surfaced gaps where a test was specified but the required infrastructure was not: `tmpGitFixture.js` (PROP-IMPL-08 integration test), `runtimeCacheMock` (PROP-LOOP-13 resume semantics), canonical `guardAgentDouble.js` (several properties). All three were PLAN-level obligations that were either incompletely specified (guardian double had the path but not an enforcement AC) or missing entirely (runtimeCacheMock). The test-infrastructure specification belongs in the PLAN, not the PROPERTIES.

**Signal for skill prompts:** The `se-author` PLAN skill should include a checklist item: "For every Integration-level property in PROPERTIES, the PLAN must name the test fixture or harness that makes it runnable. For every canonical test double mandated by a DECISIONS document, the PLAN must name the file path, export signature, and carry a PROPERTIES-referenced AC that prohibits per-test ad-hoc equivalents."

### 4e. Implementation phase skipped 3 High-severity test infrastructure items

The Iteration 1 implementation was missing `hookCompatibility.test.js` entirely, had `mergeWorktree()` as an empty stub with no fixture, and PROP-LOOP-10 was untested. All three were PROPERTIES-specified, PLAN-tasked items. The likely cause: the 5-phase PLAN structure dispersed these items across multiple tasks (P3-05, P4 phase, P2-06), and the se-implement agent for each phase may not have had the full PROPERTIES document in context when writing tests.

**Signal for skill prompts / orchestrate-dev:** When dispatching se-implement agents, ensure the PROPERTIES document and the canonical test double path (if any) are in the agent's context, not only the PLAN task table.

### 4f. Recurring "Low finding carry" pattern signals scope of "approved with minor changes"

Multiple Low findings persisted across 3–5 iterations without being addressed: AT-IMPL-01 "Who" field (5 iterations), AT-HARVEST-01 E2E framing (5 iterations), TSPEC-NFR-02 formula inconsistency (3 iterations), `OQ-05` plugin sync mechanism (5 iterations). Each was individually Low-severity and correctly did not block approval. But the cumulative effect is that "Approved with minor changes" routinely ships with 3–5 known deficiencies that accumulate across the pipeline.

**Process signal:** Consider a "Low carry threshold" rule: if a Low finding survives 3 or more iterations without resolution, it should be escalated to a named open issue in `docs/_constraints/` or a follow-on feature requirement. This prevents Low findings from becoming permanently acknowledged but never resolved.

---

## 5. Open Items for Consolidation

The following are candidates for `consolidate-learnings` to promote. They are flagged here; no promotion has been performed.

| Item | Candidate target |
|---|---|
| Constraint: structured agent output contracts must be REQ-level normative specs with fallback behavior before FSPEC | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| Constraint: workflow scripts must not use `fs.*` or any API not in the confirmed runtime primitive list; the list must be verified and stated in the REQ Assumptions before FSPEC | `docs/_constraints/DOMAIN-CONSTRAINTS.md` |
| Decision: plugin workflow distribution mechanism (manual copy vs. registry vs. install script) for `pdlc/workflows/` → `.claude/workflows/` | `docs/_decisions/DECISIONS-plugin-distribution.md` |
| Convention: additive caller-scoped trailer pattern (DEC-ODW-02 + DEC-ODW-04 template) for future workflow-to-skill structured output | `docs/_decisions/DECISIONS-workflow-trailer-convention.md` |
| Skill update: `te-review` FSPEC checklist — every named behavioral branch must have an AT in §8, or the finding is High | `pdlc/skills/te-review/SKILL.md` |
| Skill update: `se-author` TSPEC — loops with caps must show counter placement + cap check position + counter-value-to-action table explicitly | `pdlc/skills/se-author/SKILL.md` |
| Skill update: DECISIONS document template — add `Testability:` field; `te-review` DECISIONS skill — flag missing testability notes as Medium | `pdlc/skills/se-author/SKILL.md`, `pdlc/skills/te-review/SKILL.md` |
| Skill update: `se-author` PLAN — require named test fixture file paths and enforcement ACs for every Integration-level property and every canonical test double mandated by DECISIONS | `pdlc/skills/se-author/SKILL.md` |
