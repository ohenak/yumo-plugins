# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.1)
**Upstream read:** `REQ-pdlc-advisory-wave-gate.md` v1.8, `FSPEC-pdlc-advisory-wave-gate.md` v1.3
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v1.md` (iteration 1)
**Date:** 2026-08-20
**Iteration:** 2
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding note

Delta review per protocol: prior cross-review re-read, `git diff a2c2ed8d..HEAD` taken over the
TSPEC (465 insertions, 78 deletions across §2.5, §2.6, §3.2–§3.6, §4.4, §4.5, §5.1–§5.6, §6), and
only changed sections scanned for new issues. Every behavioural claim in the changed sections was
checked against shipped source rather than the document's prose. Verified this round:
`ADVISORY_REFUSAL_REASONS` is a frozen eight-member catalogue (`pdlc/workflows/orchestrate-dev.js:2297`);
the `__preDispatch` escape terminates with no `_agent` call and passes `reason` straight through
(`orchestrate-dev.js:3401-3410`); `buildA3SeamOps` uses `conditionHolds: async () => true`
(`orchestrate-dev.js:2585`); `pathsCollide`'s directory rule is written on the trailing slash
(`orchestrate-dev.js:4726-4731`); the un-skip halt is a one-argument
`haltError(formatUnskipViolations(...))` (`orchestrate-dev.js:14386`); `commitPaths` destructures a
required `message` (`orchestrate-dev.js:11755-11763`); §5.4's two-stage coverage description matches
`pdlc/workflows/package.json`'s `test:coverage` script and `c8` block exactly; and
`advisoryRecord.test.js`, `advisoryEscalationLog.test.js`, `advisoryHarvest.test.js` and
`consolidationProperties.test.js` all exist. Every one of these held as written.

## Prior findings — disposition

| Prior | Severity | Disposition | Evidence |
|---|---|---|---|
| F-01 `.gitignore`d paths narrow AC-5.1 | High | **Resolved** | §2.5 no longer decides the boundary; it is raised as an erratum on FSPEC BR-9 / AT-05-1 and REQ AC-5.1, §6 OQ-7 carries it as the one upstream-blocking question, and §5.2's round-trip case plus §5.5's ignored-path-only repair test are flagged upstream-pending rather than pinning a TSPEC preference |
| F-02 capture-failure path writes nothing | High | **Resolved in substance** | §2.5 gives capture failure a named terminal disposition with a seven-row field table, §3.2 step 4 and §3.5 are restated to it, §4.5's halt-fields row is widened to it, and §5.2 pins six *positive* assertions on one fixture. See new F-01 and F-02 below for two residues of the mechanism chosen |
| F-03 §5 gave three P0 obligations no home | High | **Resolved** | §5.5 allocates one test per prohibition `(f)`…`(i)` with a paired positive on each row, states AC-4.5's rule as the subsection's governing rule, and names AC-4.1's conjunct-(iii) mutation fixture. §5.6 is new and is **set-equal** to FSPEC's AT set — I diffed the 45 AT ids in the FSPEC against the 45 in §5.6 and the sets are identical |
| F-04 first-match precedence not script-decidable | Medium | **Resolved** | §3.3 qualifies BR-16's blanket claim rather than defending it, names precedence as the one prompt-only rule, and states the residual against AC-6.4's countability explicitly |
| F-05 disabled tier unanswered for §2.6 notices | Medium | **Resolved** | §2.6 states the hoist is unconditional by design and §5.2's disabled-tier bullet is extended to pin the notice surface as identical |
| F-06 E-6 commit interpretation not routed | Medium | **Resolved** | §3.6 routes it to DECISIONS with a re-evaluation trigger; §6 OQ-8 carries it as one of the two entries warranting the DECISIONS document |
| F-07 two deviations claimed as recorded | Low | **Resolved** | §6 OQ-5 (staged index) and OQ-6 (cross-run promotion asymmetry) exist and the two cross-references repoint to them |
| F-08 no test home for AC-6.x record/log | Low | **Resolved** | §5.1 gains `advisoryRecord.test.js` and `advisoryEscalationLog.test.js` rows carrying AT-06-1…AT-06-6, with a stated reason for putting them beside the shipped seams' assertions |
| Q-03 `waveBudgetPerRun: 0` | — | **Answered** | §4.4 and §6's closing paragraph name it a documented operator affordance and state how it differs observably from `advisory.enabled: false` (AT-01-4 vs AT-01-6) |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
