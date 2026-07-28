---
feature: pdlc-consolidation-agent
ready: true
depends-on: [pdlc-workflow-distribution, pdlc-advisory-tier]
---

# REQ — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | `docs/design/MASTER-PLAN-engineering-loop.md` (Break 2, DEC-E4/E5, order 4) |
| Downstream | `pdlc-engineering-loop` |
| Cross-Reviews | — |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-07-27 |

> **Scope in one line.** Run consolidation on a cadence with the advisory model, and carry
> pipeline-level promotions across the repository boundary as pull requests against
> `yumo-plugins` — with every promotion recording the failure mode it targets and the next pass
> reporting whether that failure mode recurred.

## 1. Problem

`consolidate-learnings` reads per-feature LEARNINGS and promotes recurring patterns into
project-level `DOMAIN-CONSTRAINTS` and `DECISIONS`. That part works and stays.

Two things do not.

**The cross-repo dead end.** When a learning says *a skill prompt itself should change*, the skill
writes `docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md` — a markdown table with columns
"Target skill / Proposed change / Rationale" — **in the consuming repo**. The skills it names live
in `yumo-plugins/pdlc/skills/`. Nothing carries the proposal across that boundary. It is a note to
a human who must read it, switch repositories, and hand-apply each row.

The result is that the pipeline accumulates precise evidence about its own failure modes and then
does nothing with it. The one loop meant to make the pipeline better is the only fully manual one.
The propose-only rule that produces this is itself correct — "agents proposing changes to the
prompts that govern agents must pass through human judgment" — but *propose-only* and
*hand-transcribed* are different requirements, and the skill currently enforces the second while
only intending the first.

**Unfalsifiability.** Nothing checks whether a promotion worked. A consolidation pass promotes a
constraint or a skill edit and never revisits it. Over enough passes this drifts toward ceremony:
prompts grow, nobody can say which growth helped, and no promotion is ever retired. An improvement
process that cannot be wrong cannot be trusted to be right.

## 2. User stories

- **US-01** — As the operator, I want a proposed skill change to arrive as a reviewable pull
  request with the actual diff, not as a table I must transcribe.
- **US-02** — As the operator, I want to approve every pipeline change, and I want no automated
  identity to hold the ability to merge one.
- **US-03** — As the operator, I want consolidation to run on a cadence without my starting it.
- **US-04** — As the operator, I want each pass to tell me whether the *previous* pass's
  promotions actually prevented the failures they targeted.
- **US-05** — As the operator, I want to see which promotions are dead weight, so prompts can be
  pruned rather than only grown.

## 3. Requirements

### REQ-CONS-01 — Cadence and trigger

- **AC-1.1** — Given a configured cadence, Then a consolidation pass runs without operator
  invocation, and `/pdlc:consolidate-learnings` continues to work as a manual trigger.
- **AC-1.2** — Given the existing `nudge-consolidation` SessionStart hook's threshold (≥5
  un-consolidated LEARNINGS), Then that threshold also triggers a pass, so consolidation fires on
  whichever of cadence or volume arrives first.
- **AC-1.3** — Given a pass begins while another is in progress, Then the second is refused —
  consolidation is serial, for the same reason the queue is.
- **AC-1.4** — Given no LEARNINGS accumulated since the last logged pass, Then the pass records
  `no-op` and exits successfully without opening anything.
- **AC-1.5** — Given a pass runs, Then it runs on the advisory model rung (`MODEL_ADVISORY`).

### REQ-CONS-02 — Promotion routing (unchanged behavior preserved)

- **AC-2.1** — Given a promoted domain invariant, Then it appends to
  `docs/_constraints/DOMAIN-CONSTRAINTS.md` in the consuming repo, as today.
- **AC-2.2** — Given a promoted architectural decision, Then it writes to
  `docs/_decisions/DECISIONS-{topic}.md` in the consuming repo, as today.
- **AC-2.3** — Given the pattern-vs-coincidence bar (recurs across ≥2 unrelated features, or a
  single occurrence stating a standing invariant), Then it is unchanged and still governs every
  promotion.
- **AC-2.4** — Given the pass completes, Then `.consolidation-log.md` records date, consumed
  files, promoted items, and deferred items, as today.

### REQ-CONS-03 — Cross-repo promotion as a pull request

- **AC-3.1** — Given a promotion targets `pdlc/skills/**` or `pdlc/workflows/**`, Then the agent
  opens a pull request against the configured plugin repository containing the **concrete edit**, not a
  description of it.
- **AC-3.2** — Given such a PR, Then its body cites the source LEARNINGS files by feature name, the
  failure mode the edit targets, and the pattern evidence that cleared AC-2.3.
- **AC-3.3** — Given multiple promotions in one pass, Then they may share one PR, but each edit is
  a separate commit so any single edit can be reverted independently.
- **AC-3.4** — Given the PR is opened, Then its URL is written back into
  `.consolidation-log.md` and into `CONSOLIDATION-PROPOSAL-{date}.md`, so a later reader can tell
  which promotions actually landed and which are still open.
- **AC-3.5** — Given the PR cannot be opened for any reason, Then the pass **still** writes
  `CONSOLIDATION-PROPOSAL-{date}.md` with the full proposed diff inline, so the fallback is
  today's behavior rather than a lost promotion.
- **AC-3.6** — Given any cross-repo promotion, Then it is **never** pushed directly to the default
  branch. Pull request only.
- **AC-3.7** — Given the PR touches `pdlc/skills/**` or `pdlc/workflows/**`, Then it inherits
  `pdlc-merge-phase` REQ-MERGE-03's self-modification guard and is never auto-merged, regardless
  of CI or configuration.

### REQ-CONS-04 — Credential scope

- **AC-4.1** — Given the cross-repo credential, Then it grants `contents:write` and
  `pull_requests:write` on the configured plugin repository only, and grants **no merge rights**.
- **AC-4.2** — Given the credential, Then it is read from a secret store at runtime and is never
  logged, never written into a PR body, and never persisted into any artifact.
- **AC-4.3** — Given the credential is absent or invalid, Then the pass degrades to AC-3.5's
  proposal-file fallback and records the credential failure. It does not halt the whole pass, and
  it does not silently skip the promotion.
- **AC-4.4** — Given the pass runs locally under the operator's own `gh` authentication, Then that
  is a supported configuration; the scoped credential is required only for unattended execution.

AC-4.1 states a general principle rather than a local convenience: an automated identity that
proposes changes to the rules governing it must not also be able to enact them. Separating
propose-rights from merge-rights at the credential level makes that structural rather than
procedural — the agent cannot merge its own proposal even if every other control failed.

### REQ-CONS-05 — Falsifiability

- **AC-5.1** — Given any promotion, Then it records the **failure mode it targets**, stated
  concretely enough to be observed: which phase, which symptom, which artifact it appears in.
- **AC-5.2** — Given a consolidation pass, Then it reports for every promotion made in prior
  passes whether its targeted failure mode **recurred** in the LEARNINGS consumed since, as
  `prevented`, `recurred`, or `insufficient-evidence`.
- **AC-5.3** — Given a promotion whose failure mode recurred across two consecutive passes, Then
  it is flagged as `ineffective` and the pass proposes either a revision or a retirement — an
  edit that did not work is not left in place indefinitely.
- **AC-5.4** — Given a promotion flagged `ineffective`, Then retiring it follows the same
  propose-only path as making it (AC-3.1, AC-3.6). Removal is as reviewable as addition.
- **AC-5.5** — Given `insufficient-evidence` for a promotion older than a configured number of
  passes, Then it is reported as unmeasurable, so a promotion whose effect can never be observed
  is visible as such rather than accumulating silently.

### REQ-CONS-06 — Advisory-record input

- **AC-6.1** — Given `pdlc-advisory-tier` harvests `ADVISORY-{feature}.md` into LEARNINGS, Then
  the consolidation pass reads the advisory summary — invocations, resolutions, escalations, by
  seam — as a first-class input.
- **AC-6.2** — Given a seam escalates disproportionately across features, Then the pass surfaces
  it as a candidate for envelope revision or upstream-phase repair, bound to the relevant deferral.
- **AC-6.3** — Given a seam resolves autonomously with a consistently high rate and no downstream
  defect, Then the pass may propose an envelope widening — as a PR under AC-3.1, never enacted.

REQ-CONS-06 is what makes the advisory envelope evidence-driven rather than frozen at whatever was
guessed on day one, while keeping every widening under operator approval.

### REQ-CONS-07 — Reporting

- **AC-7.1** — Given a pass completes, Then it reports: LEARNINGS consumed, promotions by route
  (constraints, decisions, cross-repo PR), the prior-promotion effectiveness table from AC-5.2,
  and what it deferred for human judgment.
- **AC-7.2** — Given the pass ran unattended, Then a single notification carries the report, with
  the cross-repo PR URL if one was opened.

## 4. Non-functional requirements

- **NFR-1** — No promotion is ever applied to a skill or workflow file by this agent. Pull request
  only, operator approves, always (DEC-E2).
- **NFR-2** — The credential never appears in a log, PR body, artifact, or notification.
- **NFR-3** — The pattern-vs-coincidence bar (AC-2.3) is unchanged; running on a cadence must not
  lower the promotion threshold, or cadence becomes a volume machine.
- **NFR-4** — A pass is idempotent with respect to its boundary: re-running it over the same
  LEARNINGS set produces no duplicate promotions and no duplicate PR.
- **NFR-5** — The pass never modifies a LEARNINGS file it consumed.

## 5. Scope

**In scope:** cadence trigger, advisory-model execution, cross-repo PR promotion with scoped
credential, the effectiveness/falsifiability loop, advisory-record consumption, reporting, tests.

**Out of scope:** merging any promotion PR; changing the promotion bar; consolidating across
multiple consuming repos; retiring the manual `/pdlc:consolidate-learnings` entry point.

## 6. Dependencies

- **BL-01** — `pdlc-advisory-tier` delivered — this pass runs on `MODEL_ADVISORY` and consumes the
  advisory record.
- **BL-02** — `pdlc-workflow-distribution` delivered. A promotion that lands in `yumo-plugins` and
  never reaches a consumer's `.claude/workflows/` is not a promotion; without distribution this
  feature's central claim is false.
- **BL-03** — **Operator decision required:** provisioning the fine-grained token per AC-4.1, and
  where it is stored. Local `gh` auth (AC-4.4) is sufficient to build and test this feature;
  the scoped token is needed only when the cadence runs unattended.
- **BL-04** — Cadence value is master plan OQ-E3 (weekly, threshold-driven, or both).

## 7. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-CONS-01 | Auto-merging any promotion PR | DEC-E2 is unconditional | — |
| D-CONS-02 | Consolidating across multiple consuming repos | One real consumer today | `pdlc-engineering-loop` |
| D-CONS-03 | Automatic prompt-size budgeting / pruning by age | Effectiveness-based retirement (AC-5.3) is the honest mechanism; age is a proxy | — |
| D-CONS-04 | Running the cadence as a cloud Routine | Routines run on a fresh clone with no working tree; viable for consolidation but needs its own design | `pdlc-engineering-loop` |
| D-CONS-05 | A/B measuring a promotion against a control | No control population exists in a serial single-pipeline setup | — |
