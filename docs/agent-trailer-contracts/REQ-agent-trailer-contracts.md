---
Status: Draft
Author: pm-author
Version: 1.0
Feature: agent-trailer-contracts
ready: true
depends-on: []
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | (pending) |
| LEARNINGS | docs/agent-trailer-contracts/LEARNINGS-agent-trailer-contracts.md |

# REQ — agent-trailer-contracts

Give every pdlc agent a machine-readable completion contract and make the orchestrator's parsers robust. Today only reviewer skills emit a trailer (`VERDICT:` + counts). Authors and `se-implement` return prose, so the orchestrator infers success by scanning for Jest-specific strings (`Tests: N failed`) and the substring "non-zero exit" — false negatives on pytest/vitest output, false positives when an agent merely mentions the phrase. `parseVerdict` treats any format deviation as "Needs revision" with a misleading warning, and nothing cross-checks a verdict against its finding counts.

---

## Background

Gap review findings (2026-07-01), all in `pdlc/workflows/orchestrate-dev.js` and role SKILL.md files:

- `evaluateBatchGate` (:959) and `evaluateSingleAgentGate` (:996) gate on `Tests: \d+ failed` regex and "non-zero exit" substring — framework-specific and spoofable.
- se-implement / pm-author / se-author / te-author emit no completion trailer (role SKILL.md files).
- Phase I PLAN DAG parse does raw `JSON.parse` on the agent's whole reply (:1403) — any code fence or prose ⇒ halt.
- `parseVerdict` (:144): `Approved` + `{"high":1}` passes the gate; malformed counts JSON logs "returned no VERDICT" (wrong diagnosis).
- "Approved with minor changes" passes the gate and its Low findings are silently dropped — no record survives to the final report.

---

## Scope

### In Scope

- Trailer contracts (spec + SKILL.md edits) for: se-implement, pm-author, se-author, te-author
- Parser hardening in `orchestrate-dev.js`: fence-tolerant JSON extraction, verdict/count cross-check, accurate warnings, one bounded retry for the DAG parse
- Gate rewiring: batch/single-agent gates consume the new trailer, string-scan retained only as fallback
- Minor-findings ledger: "Approved with minor changes" counts surfaced in the final report

### Out of Scope

- Reviewer VERDICT trailer format changes (already deployed; only cross-validation added)
- DoD/ship-pr trailer changes (DOD_STATUS, PR_URL, CI_STATUS formats stay; dod-loop-hardening consumes them)
- Retry policies beyond the single DAG-parse retry

### Assumptions

- Trailer-last-line convention (parsers scan bottom-up) stays the cross-skill protocol
- Adding a trailer to author skills is backward-compatible: humans reading transcripts ignore it

---

## User Stories

| ID | Story |
|---|---|
| US-01 | As the orchestrator, I want every dispatched agent to end with a structured `RESULT:` trailer, so that pass/fail decisions do not depend on guessing from prose. |
| US-02 | As the orchestrator, I want test outcomes reported as counts in the trailer regardless of test framework, so that pytest/vitest/jest features gate identically. |
| US-03 | As the orchestrator, I want JSON payloads extracted tolerantly (code fences, surrounding prose) with one retry on failure, so that a formatting slip does not halt a 40-agent pipeline. |
| US-04 | As a pdlc user, I want a reviewer's verdict cross-checked against its finding counts, so that "Approved" with open High findings is caught instead of passed. |
| US-05 | As a pdlc user, I want Low findings from "Approved with minor changes" verdicts recorded in the final report, so that accepted debt is visible rather than silently dropped. |

---

## Requirements

### Domain: TRAIL — Completion Trailers

#### REQ-TRAIL-01
**Title:** RESULT trailer for implementation agents

**Description:** `se-implement` SHALL end its final message with exactly:
```
RESULT: ok | failed
{"tests_passed": N, "tests_failed": N, "files_changed": N, "committed": true|false}
```
`RESULT: ok` requires all tests passing AND work committed. The tech-lead skills' dispatch prompts SHALL carry the same instruction.

**Acceptance criteria:**
- **Who:** orchestrator / **Given:** se-implement finishes a task with 12 passing tests / **When:** result parsed / **Then:** `{status: "ok", tests_passed: 12, tests_failed: 0, committed: true}`.
- **Who:** orchestrator / **Given:** agent's suite has failures / **When:** parsed / **Then:** `RESULT: failed` and the batch gate halts with the counts in the message.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01, US-02

#### REQ-TRAIL-02
**Title:** RESULT trailer for authoring agents

**Description:** pm-author, se-author, te-author SHALL end feedback-processing and creation runs with:
```
RESULT: ok | failed
{"artifact": "docs/.../X.md", "committed": true|false}
```
The orchestrator's creator gates SHALL use this instead of the empty-string heuristic.

**Acceptance criteria:**
- **Who:** orchestrator / **Given:** pm-author writes FSPEC and commits / **When:** parsed / **Then:** status ok with artifact path; empty-result heuristic no longer the primary gate.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-01

### Domain: TRAIL — Parser Hardening

#### REQ-TRAIL-03
**Title:** Fence-tolerant JSON extraction with bounded retry

**Description:** All trailer/JSON parsers in `orchestrate-dev.js` SHALL extract JSON that is wrapped in Markdown code fences or surrounded by prose. The Phase I DAG parse SHALL, on extraction failure, re-dispatch the parse agent exactly once with an error-explaining prompt before halting.

Threshold declaration: **DAG parse retries** = 1 (constant `DAG_PARSE_MAX_RETRIES`, owner: orchestrate-dev.js).

**Acceptance criteria:**
- **Who:** orchestrator / **Given:** DAG agent replies with ```` ```json {...} ``` ```` inside prose / **When:** parsed / **Then:** tasks extracted, no halt.
- **Who:** orchestrator / **Given:** two consecutive malformed replies / **When:** retry exhausted / **Then:** halt with "PLAN parsing failed after retry".

**Priority:** P0 · **Phase:** 1 · **Stories:** US-03

#### REQ-TRAIL-04
**Title:** Verdict/count cross-validation

**Description:** `parseVerdict` SHALL enforce the severity rule: a verdict of `Approved` or `Approved with minor changes` accompanied by `high > 0` or `medium > 0` SHALL be downgraded to `Needs revision` and logged as a contract violation by the reviewer (named). Warning messages SHALL distinguish: missing trailer, invalid verdict value, malformed counts JSON.

**Acceptance criteria:**
- **Who:** orchestrator / **Given:** reviewer returns `VERDICT: Approved` + `{"high":1,"medium":0,"low":0}` / **When:** parsed / **Then:** effective verdict `Needs revision`, log names the reviewer and rule.
- **Who:** orchestrator / **Given:** counts JSON malformed / **When:** parsed / **Then:** warning says "malformed finding counts", not "returned no VERDICT".

**Priority:** P0 · **Phase:** 1 · **Stories:** US-04

#### REQ-TRAIL-05
**Title:** Minor-findings ledger

**Description:** When a phase converges with any reviewer at `Approved with minor changes`, the orchestrator SHALL record the reviewer, phase, and low-count in the final report (`minorFindings` array). The final report schema gains `minorFindings: [{phase, reviewer, low}]`.

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** Phase F converges with te-review at "Approved with minor changes" (low: 3) / **When:** pipeline completes / **Then:** final report lists `{phase: "F", reviewer: "te-review", low: 3}`.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-05

### Domain: NFR

#### REQ-TRAIL-NFR-01
**Title:** Backward compatibility of gates

**Description:** When a RESULT trailer is absent (legacy agent output), gates SHALL fall back to the current string-scan heuristics and log a deprecation warning, so mixed-version skill/workflow deployments do not hard-fail.

**Acceptance criteria:**
- **Who:** orchestrator / **Given:** se-implement output without trailer but with passing Jest summary / **When:** gated / **Then:** pass + warning "no RESULT trailer (legacy)".

**Priority:** P1 · **Phase:** 1 · **Stories:** US-01

---

## Open Questions

None.
