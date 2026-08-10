---
feature: pdlc-wave-resume
ready: false
depends-on: [pdlc-consolidation-agent, pdlc-advisory-wave-gate]
---

# REQ — pdlc-wave-resume: automatic Phase I wave resume

| Field | Value |
|---|---|
| Status | Draft |
| Author | pm-author (operator-directed session, 2026-08-09) |
| Version | 1.0 |
| Upstream | **REQ** |
| Downstream | FSPEC, TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | (none yet) |
| LEARNINGS | docs/pdlc-wave-resume/LEARNINGS-pdlc-wave-resume.md |

## 1. Problem / Context

Phase I (Implementation) runs a plan's tasks in topologically ordered, ownership-disjoint
waves in one shared tree. Each wave ends with a script-owned gate; a red gate halts the
pipeline with the halted wave's work deliberately uncommitted. This halt-and-refuse
contract is correct and is not in question here.

What the halt costs is the *re-entry*. A re-invocation of the pipeline re-enters Phase I
at wave 1 and re-dispatches implementation agents over every wave whose work is already
committed, each of which reads the plan, finds its task done, and reports a no-op.
Observed on the pdlc-consolidation-agent run of 2026-08-09 (OF-1, §4): a 15-wave plan
halted at wave 2 and again at wave 4, and each re-invocation paid seven no-op agent
dispatches (waves 1–3) before reaching the point of interest. Multi-halt runs pay this
replay tax once per halt, and it grows with the plan.

A manual resume pointer now exists (`implementation.startWave`, an operator-set
configuration value — BL-01, §5). It works, but it demands operator arithmetic with a
sharp edge: the correct resume point is the wave that *failed* — whose work is
uncommitted — not the wave after it, and an operator who forgets to clear the pointer
causes a later, unrelated run to silently skip waves. The pointer converts the replay tax
into an attention tax on exactly the unattended-operation path the pipeline exists to
serve.

This feature makes the resume point self-determining: a re-invocation after a Phase I
halt resumes at the correct wave with no operator action, while an explicit operator
override still wins and correctness never depends on the resume record being right.

At authoring time an **interim** mechanism for this already exists at HEAD of the
pdlc-consolidation-agent branch (added 2026-08-09 to unblock the live run, and marked
INTERIM in its comments). Per the activation-check discipline, this feature's deliverable
is therefore the *formalized, reviewed contract* — behavioural specification, property
tests, and operator-facing documentation — that supersedes or replaces the interim
mechanism, not necessarily new wiring.

## 2. Goals

- **G-1 — zero-action resume.** After a Phase I wave-gate halt, re-invoking the pipeline
  resumes implementation at the wave whose work is not yet committed, with no
  configuration edit, no arithmetic, and no clean-up step owed by the operator.
- **G-2 — correctness independent of the resume record.** The record that determines the
  resume point is an optimisation, never a trust anchor: whatever it says — stale,
  foreign, corrupt, or maliciously wrong — no new commit lands before the full test suite
  has verified the whole tree, and the worst outcome of a bad record is a full run or a
  gate halt, exactly as today.
- **G-3 — operator override wins.** An explicitly set manual resume point always takes
  precedence over the automatic determination, and every resume announces its provenance
  (automatic vs. operator-set) so a run's starting point is never a mystery.
- **G-4 — self-clearing lifecycle.** A completed Phase I leaves no resume state behind
  for a later fresh run to inherit; a changed plan or a different feature invalidates a
  leftover record rather than being warped by it.
- **G-5 — unattended parity.** The queue-driven, unattended invocation path benefits
  identically to a direct invocation, with no per-run configuration.

## 3. Non-Goals

- **Remediating the failure itself.** Diagnosing or repairing whatever made the wave gate
  red belongs to the advisory tier (the wave-gate remediation seam is
  `pdlc-advisory-wave-gate`'s scope). This feature only removes the replay tax from the
  re-entry after the cause is addressed.
- **Changing the halt contract.** The wave gate's refusal to commit red work, the absence
  of a POSTMORTEM on wave halts, and the halt's queue-row recording all stay exactly as
  they are.
- **Resuming across features or branches.** A resume record never carries from one
  feature, plan, or branch to another; cross-feature state is out of scope.
- **Commit-history archaeology.** Deriving wave completion from the presence of task
  commits is explicitly rejected (OF-2, §4), not deferred.
- **Skipping verification.** No form of "trust the record and skip the gate" is in scope
  at any priority.

## 4. Constraints

## 5. Prerequisites

## 6. User Stories

## 7. Acceptance Criteria

## 8. Risks

## 9. Obligations / Open Questions

## 10. Traceability
