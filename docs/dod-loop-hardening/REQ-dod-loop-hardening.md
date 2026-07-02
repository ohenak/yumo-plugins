---
Status: Draft
Author: pm-author
Version: 1.0
Feature: dod-loop-hardening
ready: true
depends-on: [agent-trailer-contracts]
---

| Field | Value |
|---|---|
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | (pending) |
| LEARNINGS | docs/dod-loop-hardening/LEARNINGS-dod-loop-hardening.md |

# REQ — dod-loop-hardening

Make the Definition-of-Done loop spend its budget on remediation, tell the truth in telemetry, and stop over-polling CI. Today `DOD_MAX_ITERATIONS = 3` buys only 2 remediation attempts (each iteration is a verify); the remediation agent's result is never checked, so a failed `se-implement` run silently burns an attempt; an `unknown` DOD_STATUS dispatches remediation against a `CODE_REVIEW-v{N}.md` that may not exist; a pass fabricates `branch_coverage_pct: 100`; the full test suite is never explicitly re-run after the Phase-DOD rebase; and Phase PUB polls CI by spawning a full ship-pr agent every 30 s — up to 60 invocations per wait.

---

## Background

Gap review findings (2026-07-01), `pdlc/workflows/orchestrate-dev.js`:

- `dodVerifyLoop` (:808-851): verify consumes an iteration; remediation result unchecked (:846); `unknown` → remediate possibly-missing review file (:829, :771).
- `parseDodStatus` (:688): pass ⇒ `branch_coverage_pct: 100` fabricated.
- Post-rebase (:1507), no explicit full-suite run; a semantically conflicting but cleanly-rebasing default-branch change can slip through if the DoD coverage scan doesn't exercise it.
- `raisePrAndVerifyCi` (:870-934): fixed 30 s cadence, each poll a full agent dispatch.

## § Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | agent-trailer-contracts merged (REQ-TRAIL-01 RESULT trailer on se-implement) | PR merged into default branch | Remediation gating consumes the RESULT trailer |

---

## Scope

### In Scope

- Iteration semantics: budget counted in remediation attempts
- Remediation result gating via RESULT trailer
- Missing-review handling for `unknown` verifier status
- Real coverage percentage propagated on pass
- Post-rebase full-suite gate
- CI poll backoff schedule

### Out of Scope

- dod-verify's five scan criteria (unchanged)
- Phase ordering (harvest-after-pub feature)
- Rebase conflict resolution automation

### Assumptions

- dod-verify can report the measured coverage percentage in the passed-status trailer JSON without changing its pass/fail rule (85% floor unchanged, owner: dod-verify SKILL.md)

---

## User Stories

| ID | Story |
|---|---|
| US-01 | As a pdlc user, I want the DoD budget expressed as N remediation attempts, so that "3 iterations" cannot mean "the loop gave up after 2 fixes". |
| US-02 | As the orchestrator, I want a failed remediation dispatch detected immediately, so that the loop halts with the real cause instead of re-verifying unchanged code. |
| US-03 | As a pdlc user, I want DoD telemetry (coverage %) to be measured values, so that reports are trustworthy. |
| US-04 | As a pdlc user, I want the full test suite re-run after the rebase onto the default branch, so that semantic conflicts are caught before the PR is raised. |
| US-05 | As a pdlc user, I want CI polling to back off exponentially, so that a 30-minute CI run does not cost 60 agent dispatches. |

---

## Requirements

### Domain: DODH — Loop Semantics

#### REQ-DODH-01
**Title:** Remediation-attempt budget

**Description:** The DoD loop SHALL run verify → (remediate → verify)×N where N is the remediation budget. Threshold declaration: **DOD_MAX_REMEDIATIONS** = 3 (constant in orchestrate-dev.js, replacing DOD_MAX_ITERATIONS' ambiguous meaning). The final report SHALL state attempts used vs budget.

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** findings persist through all attempts / **When:** halt / **Then:** message reads "failed after 3 remediation attempts (4 verifications)".

**Priority:** P0 · **Phase:** 1 · **Stories:** US-01

#### REQ-DODH-02
**Title:** Gate remediation dispatch

**Description:** The loop SHALL parse the remediation agent's RESULT trailer (REQ-TRAIL-01). `RESULT: failed`, a missing trailer with legacy failure markers, or an empty result SHALL halt the loop immediately with the remediation failure as the cause — not proceed to re-verify.

**Acceptance criteria:**
- **Who:** orchestrator / **Given:** se-implement returns `RESULT: failed` with 2 failing tests / **When:** loop evaluates / **Then:** halt names remediation failure and counts; no further verify dispatched.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

#### REQ-DODH-03
**Title:** Unknown-status and missing-review handling

**Description:** When the verifier returns no parseable DOD_STATUS, the loop SHALL check (via guard channel) that `CODE_REVIEW-{feature}-v{N}.md` exists before any remediation dispatch. Missing file ⇒ re-dispatch the verifier once for the same version; a second failure ⇒ halt "verifier failed twice at v{N}". Existing file ⇒ treat as failed status and remediate as normal.

**Acceptance criteria:**
- **Who:** orchestrator / **Given:** dod-verify crashed before writing v2 / **When:** status unknown / **Then:** verifier re-dispatched for v2; remediation never pointed at a nonexistent file.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-02

### Domain: DODH — Telemetry

#### REQ-DODH-04
**Title:** Measured coverage on pass

**Description:** dod-verify's passed trailer SHALL include measured `branch_coverage_pct`; `parseDodStatus` SHALL propagate it and SHALL NOT fabricate 100. Absent measurement ⇒ `branch_coverage_pct: null`, never a made-up number.

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** suite passes with 91% branch coverage / **When:** DoD passes / **Then:** report carries 91, not 100.

**Priority:** P1 · **Phase:** 1 · **Stories:** US-03

### Domain: DODH — Rebase Safety

#### REQ-DODH-05
**Title:** Post-rebase full-suite gate

**Description:** After a clean rebase (before the first verify), the loop SHALL dispatch a test-run agent to execute the full suite; any failure halts Phase DOD with "post-rebase test failure" and the failing summary. This gate runs once per rebase, not per verify iteration.

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** default branch changed an API the feature calls; rebase clean; tests now fail / **When:** post-rebase gate runs / **Then:** halt identifies post-rebase failure before any CODE_REVIEW is written.

**Priority:** P0 · **Phase:** 1 · **Stories:** US-04

### Domain: DODH — CI Polling

#### REQ-DODH-06
**Title:** Exponential poll backoff

**Description:** Phase PUB polling SHALL back off exponentially. Threshold declaration: **CI_POLL_SCHEDULE** — initial 30 s, factor 2, cap 4 min (constants in orchestrate-dev.js; timeouts CI_NO_CHECKS_TIMEOUT_MS / CI_COMPLETION_TIMEOUT_MS unchanged).

**Acceptance criteria:**
- **Who:** pdlc user / **Given:** CI takes 30 min / **When:** PUB waits / **Then:** ≤ 12 poll dispatches (vs ~60 today).

**Priority:** P1 · **Phase:** 1 · **Stories:** US-05

---

## Open Questions

None.
