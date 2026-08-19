# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-18
**Iteration:** 2
**Scope:** REQ (phase R), testing lens only. Delta re-review against
`CROSS-REVIEW-test-engineer-REQ-v1.md`, over `git diff 7b2c3879..HEAD` on the REQ
(207 insertions, 47 deletions). Unchanged sections not re-litigated.

## Delta Verification — v1 findings

Verified at HEAD `8ac7374b` on `feat-pdlc-advisory-wave-gate`. Every new shipped-behaviour claim
the revision leans on was re-measured in code, not taken from the baseline file's prose.

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-3.2 now states the guard paths bind A6 unchanged and names the consequence (the 2026-08-09 incident would today escalate `out-of-envelope`). Grounded: the advisory gate context is built once, for every seam, with `guardPaths: effectiveGuardPaths(undefined)` (`pdlc/workflows/orchestrate-dev.js:3500`), and exclusion `X-e` runs that set through Phase MERGE's own matcher (`:2421`, `guardVerdict` `:959-963`, `MERGE_GUARD_DEFAULTS` `:48`). `pdlc/workflows/consolidate-learnings.js` matches by prefix. One oracle now, not two. |
| F-02 | High | **Resolved** | AC-2.2 adds the receiving-side rule: a classification absent or outside the set reads as `unclassified`, which authorises nothing, escalates, and consumes no attempt (an attempt being one repair→re-gate cycle). Total and testable. See F-03 below for the one residual reading. |
| F-04 | High | **Resolved** | BL-06 and R-5 now enumerate three transcribed surfaces, not one — `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS`, `ADVISORY_DEFAULTS` — and name the disabled-tier fixtures explicitly. Confirmed the fixture case is real: `advisoryDisabled.test.js:620` asserts `rows` `toHaveLength(5)`, which a sixth seam reds. |
| F-03 | Medium | **Resolved** | AC-2.4 now says only resolutions consume wave budget, and states both oracles a test must separate (two escalated waves leave budget untouched; one resolved wave exhausts the shipped default `1`). C-2's default moved `2` → `1` consistently in C-2, R-3 and Q-1. |
| F-05 | Medium | **Resolved** | NFR-2 now carries the positive conjunct: the advisory summary key is **absent/undefined**, not a six-row all-zero summary. Matches shipped behaviour — `expect(result.advisory).toBeUndefined()` when disabled vs. five zero rows when enabled-but-quiet (`advisoryDisabled.test.js:603`, `:620`). |
| F-06 | Medium | **Resolved** | AC-1.5 now specifies a cardinality on a named surface — exactly one inapplicability notice per run, naming which of BL-03/BL-04 was absent, and none in a run where A6 applies (negative paired with positive). The BL-04 half is grounded: the shipped degradation notice is emitted once per run, naming the missing halves (`orchestrate-dev.js:14144-14152`). |
| F-07 | Medium | **Partly resolved** | AC-4.4 now defines the re-gate as the wave's whole gate sequence in shipped order, and adds a runtime observation. Order claim verified: post-wave command at `orchestrate-dev.js:14347-14357` runs before the test gate at `:14361`. The oracle itself is still weaker than the clause — see F-01 below. |
| F-08 | Low | **Resolved** | AC-5.1 now routes the restoration mechanism to O-1. |
| F-09 | Low | **Resolved** | AC-2.3 now distinguishes the full captured gate output A6 receives from the truncated tail the halt message shows a human, so the criterion is satisfiable on a long suite. |

Also re-measured for the new material: AC-3.4's "no ninth refusal reason" holds — the shipped
escalation entry renders `| Refusal reason | ${reason ?? "n/a"} |` (`orchestrate-dev.js:3044-3070`),
so a diagnosis-only outcome needs no new member. AC-4.6/O-8's premise holds — the per-wave commit
loop commits `task.files` for tasks **in that wave** only (`:14400-14415`), so a repair inside a
later wave's owned paths would indeed be left uncommitted. Every cited path exists:
`docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (AC-1.6, AC-2.3 present),
`docs/completed/pdlc-consolidation-agent/`, `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md`.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
