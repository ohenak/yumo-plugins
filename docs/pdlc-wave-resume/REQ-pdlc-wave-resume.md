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

Observed facts, each dated and reproducible from the cited run. On merge of the
`pdlc-advisory-wave-gate` REQ these should be promoted into
`docs/_constraints/pdlc-wave-gate-baseline.md` and cited from there by id (Obligation
OB-2, §9).

- **OF-1 (2026-08-09, pdlc-consolidation-agent run).** A 15-wave plan halted at wave 2
  and again at wave 4; each re-invocation re-entered wave 1 and re-dispatched seven
  implementation agents (waves 1–3) that individually concluded no-op. Replay cost
  recurs per halt and scales with plan depth.
- **OF-2 (2026-08-09, same run, wave 1).** A completed task may legitimately produce
  **no commit**: wave 1's only task finished with "nothing staged — no changes to
  commit". Commit presence is therefore not usable as completion evidence, in either
  direction (stray agent-authored commits were also observed in the same run).
- **OF-3 (2026-08-09, same run, wave 4).** A halted wave's own work is uncommitted at
  the halt — the gate refuses to commit red work. The correct resume point is therefore
  the earliest wave whose work is not yet committed, i.e. the failed wave itself, never
  the one after it.
- **C-1 — consumer-local state.** Whatever record supports automatic resume lives in
  consumer-local, untracked state (the drift-state record's precedent): per-wave
  bookkeeping must not generate tracked-file commit churn on the feature branch.
- **C-2 — fail open, never halt.** An unreadable, foreign, or out-of-range resume record
  degrades to a full run with an announced reason. No state of the record may make the
  pipeline refuse to run.
- **C-3 — no new runtime capabilities.** The determination and its bookkeeping operate
  within the workflow runtime's existing capability envelope (injected-seam IO, no new
  host dependencies); the contract's specifics are the TSPEC's to own (OB-1, §9).

## 5. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | Manual resume override (`implementation.startWave` config value, default 1, owner: repo operator via `.claude/pdlc.config.json`) exists at HEAD | `pdlc-consolidation-agent` PR merged | Must exist at HEAD before FSPEC authoring — REQ-WVR-04 specifies precedence over it |
| BL-02 | Wave-gate baseline measured-facts file (`docs/_constraints/pdlc-wave-gate-baseline.md`) available for citation | `pdlc-advisory-wave-gate` PR merged | Must exist at HEAD before FSPEC authoring — OF-1..3 promote into it (OB-2) |
| BL-03 | Interim auto-resume mechanism (marked INTERIM, 2026-08-09) present at HEAD | `pdlc-consolidation-agent` PR merged | Checked at FSPEC authoring: deliverable formalizes or replaces it, never duplicates alongside it |

## 6. User Stories

- **US-01.** As the operator of an unattended pdlc run, when Phase I halts at a wave gate
  and I re-invoke after addressing the cause, I want the run to resume at the wave that
  failed without my computing or setting anything, so that recovery costs one
  re-invocation instead of a replay of completed waves plus config arithmetic.
- **US-02.** As the operator, I want an explicitly set manual resume point to always win
  over the automatic one, and every resume to announce where it starts and why, so that
  I can force any starting point and audit any run's behaviour from its log.
- **US-03.** As the maintainer of the pipeline's integrity guarantees, I want the resume
  record to be unable to weaken verification — no new commit before the full suite passes
  over the whole tree — so that automatic resume adds no new trust surface.
- **US-04.** As the operator of the multi-feature queue, I want unattended queue
  iterations to recover from wave halts with the same zero-action resume, so that the
  no-halt direction of the loop does not depend on my attention.

## 7. Acceptance Criteria

### REQ-WVR-01 — automatic resume at the failed wave (P0, Phase 1)

**Who:** pipeline operator. **Given:** a Phase I run halted at a wave gate, the cause
since addressed, the same feature and an unchanged plan. **When:** the pipeline is
re-invoked with no resume-related configuration set. **Then:** implementation resumes at
the wave that failed (OF-3); each skipped wave is announced as skipped; the run log and
final report state the resume point and its provenance as automatic. *Source: US-01.*

### REQ-WVR-02 — fresh runs and foreign state are unaffected (P0, Phase 1)

**Who:** pipeline operator. **Given:** no prior halted Phase I for this feature — or a
resume record left by a different feature, a since-changed plan, or an out-of-range
state. **When:** the pipeline is invoked. **Then:** every wave runs from the first; an
ignored record is announced with the reason it was ignored; nothing about the record
makes the invocation refuse to run (C-2). *Source: US-01, US-02.*

### REQ-WVR-03 — verification independence (P0, Phase 1)

**Who:** pipeline maintainer. **Given:** any resume-record content whatsoever, including
corrupt or adversarial bytes. **When:** a resumed run reaches its first executed wave.
**Then:** the full test suite verifies the whole tree before any new commit lands, with
the same gate outcome semantics as an unresumed run; a record that cannot be read
degrades to a full run with an announced reason (C-2). *Source: US-03.*

### REQ-WVR-04 — operator override precedence (P0, Phase 1)

**Who:** pipeline operator. **Given:** both an explicit manual resume point (BL-01) and
an automatic resume determination available for the same invocation. **When:** the run
starts. **Then:** the manual point wins, the run announces provenance as operator-set,
and a documented, announced escape hatch exists to force a full run despite a valid
record. *Source: US-02.*

### REQ-WVR-05 — self-clearing lifecycle (P1, Phase 1)

**Who:** pipeline operator. **Given:** a Phase I that completes all waves. **When:** the
run finishes the phase. **Then:** no resume state survives for a later fresh run of any
feature to inherit; a subsequent invocation behaves as if no halted run ever existed.
*Source: US-01.*

### REQ-WVR-06 — completion evidence is never commit presence (P1, Phase 1)

**Who:** pipeline maintainer. **Given:** a plan containing tasks that complete without
producing a commit (OF-2). **When:** the resume point is determined. **Then:** the
determination does not consult commit presence or commit messages; a no-op-completing
task never causes its wave to be treated as incomplete. *Source: US-03.*

### REQ-WVR-07 — unattended queue parity (P2, Phase 2)

**Who:** queue operator. **Given:** a queue-driven iteration whose feature halted at a
wave gate in a previous iteration. **When:** the queue re-attempts the feature after the
halt is cleared. **Then:** the delegated run resumes exactly as a direct invocation
would under REQ-WVR-01..05, with no queue-specific configuration. *Source: US-04.*

## 8. Risks

- **R-1 — stale record after history rewrite.** An operator rebase/reset can invalidate
  what the record believes is committed. Mitigated structurally by REQ-WVR-03 (nothing
  commits before full-tree verification) and REQ-WVR-02 (changed plan invalidates the
  record); residual worst case is a gate halt, as today.
- **R-2 — resume-skip strands uncommitted work.** If a wave were recorded complete while
  its work is uncommitted, a resumed run would skip work that exists nowhere but the
  tree. REQ-WVR-01/OF-3's "resume at the earliest uncommitted wave" is the requirement
  that forbids this; the FSPEC must carry an explicit acceptance test for it.
- **R-3 — provenance confusion.** Two resume sources (manual, automatic) can leave an
  operator unsure why a run started where it did. Mitigated by REQ-WVR-01/-04's
  mandatory provenance announcements.
- **R-4 — interim/final divergence.** The interim HEAD mechanism (BL-03) and this
  feature's reviewed contract could drift apart if the feature lands as "new code
  alongside". BL-03's gating logic (formalize or replace, never duplicate) is the
  control; se-review should treat duplication as a blocking finding.

## 9. Obligations / Open Questions

- **OB-1 (owner: TSPEC).** The resume record's location, format, matching rules, and the
  determination procedure are implementation contracts owned by the TSPEC — this REQ
  deliberately states only their observable outcomes (REQ-WVR-01..06).
- **OB-2 (owner: this feature's se-author, at FSPEC/TSPEC authoring).** Promote OF-1..3
  into `docs/_constraints/pdlc-wave-gate-baseline.md` as measured `M-*` facts once BL-02
  resolves, and cite them by id from downstream artifacts.
- **OB-3 (owner: pm-author, at FSPEC authoring).** Confirm the interaction ordering with
  the advisory wave-gate remediation seam (`pdlc-advisory-wave-gate`): proposed default —
  remediation acts *within* the halted run, automatic resume acts at the *next*
  invocation, so the two compose without coordination. Carried as open until that REQ's
  FSPEC exists.
- **OQ-1.** Should the escape hatch of REQ-WVR-04 be a config value, a record-removal
  action, or both? Product requirement is only that one exists and is announced;
  form is the TSPEC's choice unless the operator states a preference at FSPEC review.

## 10. Traceability

| User story | Requirements |
|---|---|
| US-01 | REQ-WVR-01, REQ-WVR-02, REQ-WVR-05 |
| US-02 | REQ-WVR-02, REQ-WVR-04 |
| US-03 | REQ-WVR-03, REQ-WVR-06 |
| US-04 | REQ-WVR-07 |

Registered in `docs/_queue/QUEUE.md` as Order 20 (`ready: false` until prerequisites
BL-01..03 resolve); project matrix row in `docs/requirements/traceability-matrix.md`.
