---
feature: pdlc-advisory-tier
ready: false
depends-on: [pdlc-merge-phase]
---

# REQ — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | `docs/design/MASTER-PLAN-engineering-loop.md` (Break 4, §3, order 3) |
| Downstream | `pdlc-consolidation-agent`, `pdlc-engineering-loop` |
| Cross-Reviews | — |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-07-27 |

> **Scope in one line.** A third model rung — the Fable 5 advisory tier — that takes the five
> judgment seams where the pipeline currently halts and either resolves them inside a declared
> envelope or escalates them with the analysis already done, never converting a blocking verdict
> into a passing one.

## 1. Problem

Every judgment call in the pipeline is a full stop with no attempt at resolution:

| Seam | Location | Today |
|---|---|---|
| A1 | `orchestrate-queue` Phase-0 triage returns `needs-human` | skip the candidate, try next |
| A2 | Stale-REQ re-grounding gate fires | `needs-human`, skip |
| A3 | Phase DOD verify→remediate exhausts 3 iterations | pipeline halts |
| A4 | `ship-pr` rebase produces conflicts | pipeline halts, branch unchanged |
| A5 | Phase PUB CI is red | pipeline halts |

In each case the operator arrives at an unexplained stop and reconstructs the situation from
scratch: which check failed, why, whether it is the feature's fault, what the minimal fix is. The
expensive part is not the decision — it is the **investigation preceding** it, and that
investigation is exactly the work a capable model can do unattended.

The naive fix — let a model decide — is wrong and would be worse than the halt, because the model
would be deciding the very gates that exist to catch it. The right fix separates two things the
halt currently conflates: *diagnosing* the problem, and *authorizing* the resolution.

## 2. User stories

- **US-01** — As the operator, I want the routine halts resolved without me, so an unattended loop
  survives its first bad CI run.
- **US-02** — As the operator, when something genuinely needs me, I want the analysis already done
  so my turn is approve-or-reject rather than an investigation.
- **US-03** — As the operator, I want a hard, declared boundary on what the advisory tier may do
  unattended, and I want that boundary to be un-widenable by the agent.
- **US-04** — As the operator, I want every advisory action recorded, so I can audit months later
  what the pipeline decided on its own.
- **US-05** — As the operator, I want the advisory tier to be unable to declare a gate passed
  under any circumstance.

## 3. Requirements

### REQ-ADV-01 — Model rung and configuration

- **AC-1.1** — Given the workflow configuration, Then a constant `MODEL_ADVISORY` selects the
  advisory model, alongside the existing `MODEL_DEFAULT`, `MODEL_IMPLEMENTATION` and `MODEL_QUEUE`.
- **AC-1.2** — Given `MODEL_ADVISORY` is set to a value the runtime cannot resolve, Then the
  pipeline **fails at startup** with an explicit model-resolution error. It does **not** silently
  fall back to another model: a silent fallback makes the tiering untestable and makes a
  misconfigured run indistinguishable from a correct one.
- **AC-1.3** — Given the model value, Then it is a single configuration constant referenced by
  every advisory dispatch site, so changing it is a one-line change rather than a search.
- **AC-1.4** — Given `ADVISORY_ENABLED = false`, Then every seam reverts exactly to today's
  behavior — skip or halt — and no advisory agent is dispatched.

### REQ-ADV-02 — The advisory contract

- **AC-2.1** — Given any advisory invocation, Then it returns an `AdvisoryVerdict` carrying
  `seam`, `diagnosis`, `proposedAction`, `confidence` ∈ {`high`, `medium`, `low`},
  `withinEnvelope: bool`, and `evidence` (the concrete file/line/log citations the diagnosis rests
  on).
- **AC-2.2** — Given `withinEnvelope == false` **or** `confidence != high`, Then the action is not
  taken and the verdict is escalated. Both conditions are required for autonomous action.
- **AC-2.3** — Given an advisory agent returns a malformed or unparseable verdict, Then it is
  treated as an escalation, not as a pass.
- **AC-2.4** — Given an advisory invocation exceeds its configured attempt budget, Then it
  escalates rather than retrying indefinitely.

### REQ-ADV-03 — The envelope (what may be resolved unattended)

- **AC-3.1** — Given the envelope, Then it is declared in configuration as an explicit per-seam
  allow-list, and is **not** inferable, extendable, or negotiable by any agent at runtime.
- **AC-3.2** — Given an advisory agent proposes an action not in the envelope, Then the action is
  refused by the workflow script — enforcement is in code, not in the agent's prompt.
- **AC-3.3** — Given the shipped default envelope, Then it permits: re-running a flaky check (A5);
  fixing a lint, format, or type error introduced by the feature branch (A5); resolving a rebase
  conflict confined to files the feature branch itself created (A4); re-grounding a stale REQ's
  `file:line` citations where the cited symbol still exists at a new location (A2).
- **AC-3.4** — Given the shipped default envelope, Then it **excludes**: any change to a test
  assertion (A3, A5); any change to a DoD criterion or threshold; any rebase conflict touching a
  file the feature branch did not create; any change outside the feature's declared scope; and
  anything under REQ-MERGE-03's self-modification paths.
- **AC-3.5** — Given the envelope excludes a change to a test assertion, Then this is asserted by
  a test. The single most dangerous failure mode of an autonomous pipeline is fixing a red test by
  editing the test, and it must be structurally impossible rather than discouraged.

### REQ-ADV-04 — What the advisory tier may never do

- **AC-4.1** — Given any seam, Then the advisory tier may never mark a Definition-of-Done
  criterion satisfied, weaken a criterion, or reduce the DoD iteration requirement.
- **AC-4.2** — Given any seam, Then it may never set `ready: true` on a REQ.
- **AC-4.3** — Given any seam, Then it may never declare CI passed, and may never cause
  `ciStatus` to be derived from anything but the actual GitHub Actions rollup.
- **AC-4.4** — Given any seam, Then it may never merge a PR, and may never alter a queue `Status`
  cell.
- **AC-4.5** — Given a resolution is applied, Then the original deterministic gate **re-runs** and
  reaches its own verdict. The advisory tier fixes causes; gates decide outcomes.
- **AC-4.6** — Given AC-4.1 through AC-4.5, Then each has a failing test proving the prohibition
  holds.

### REQ-ADV-05 — Seam A1/A2: queue triage and re-grounding

- **AC-5.1** — Given Phase-0 triage returns `needs-human`, Then an advisory agent reviews the
  triage evidence and returns a verdict of `ready`, `blocked`, or `escalate` — it may not return
  `ready` for a REQ whose declared dependency is genuinely absent from base, which remains a
  deterministic check.
- **AC-5.2** — Given the stale-REQ re-grounding gate fires, Then the advisory agent re-diffs the
  REQ's load-bearing citations against HEAD and produces a **re-grounding proposal** listing each
  drifted citation with its corrected location.
- **AC-5.3** — Given a re-grounding proposal contains only citation-location corrections where the
  cited symbol still exists, Then it is within the envelope and may be applied. Given it contains
  any citation whose symbol no longer exists, or any change to a REQ's requirements, Then it
  escalates — a REQ whose premise has evaporated needs a human, not a patch.
- **AC-5.4** — Given the queue driver, Then `needs-human` candidates are adjudicated in queue
  order and at most one is picked per invocation, preserving the serial guarantee.

### REQ-ADV-06 — Seam A3: DoD exhaustion

- **AC-6.1** — Given Phase DOD exhausts its 3 verify→remediate iterations with findings
  remaining, Then an advisory agent classifies each remaining finding as `real-defect`,
  `mis-scoped-criterion`, or `deferral-candidate`, with evidence.
- **AC-6.2** — Given every remaining finding classifies as `deferral-candidate`, Then the advisory
  agent proposes deferral rows bound to a named successor and **escalates** — it never enacts a
  deferral, because a deferral is a scope decision.
- **AC-6.3** — Given any finding classifies as `real-defect`, Then the pipeline halts as it does
  today, with the classification attached so the operator's turn starts from a diagnosis.
- **AC-6.4** — Given a classification of `mis-scoped-criterion`, Then it escalates; the advisory
  tier may not adjust a criterion (AC-4.1).

### REQ-ADV-07 — Seam A4: rebase conflict

- **AC-7.1** — Given `ship-pr` reports `REBASE_STATUS: conflict`, Then an advisory agent inspects
  the conflicting files and determines whether every conflict is confined to files the feature
  branch created.
- **AC-7.2** — Given every conflict is so confined and confidence is `high`, Then the conflict is
  resolved, the rebase completed, and the resolution recorded file-by-file.
- **AC-7.3** — Given any conflict touches a file the feature branch did not create, Then it
  escalates with the conflicting hunks summarized — a conflict in shared code means two features
  disagreed about it, which is a design question.
- **AC-7.4** — Given a resolution is applied, Then the branch's tests re-run and a failure reverts
  the resolution and escalates.

### REQ-ADV-08 — Seam A5: CI failure

- **AC-8.1** — Given Phase PUB observes a failing check, Then an advisory agent retrieves the
  failing job's log and produces a diagnosis naming the failing step and the cause.
- **AC-8.2** — Given the cause is within the envelope (AC-3.3), Then a minimal fix is committed
  and pushed, CI is re-polled, and the cycle repeats up to a configured maximum of 3 attempts
  before escalating.
- **AC-8.3** — Given a fix is pushed after Phase DOD already passed, Then Phase DOD **re-verifies**
  the branch rather than inheriting its earlier pass. A branch that changed after the gate has not
  been through the gate.
- **AC-8.4** — Given the failing check is a pre-existing failure also present on the default
  branch, Then the advisory agent identifies it as such and escalates without attempting a fix —
  the feature did not cause it and must not silently own it.
- **AC-8.5** — Given the log cannot be retrieved, Then it escalates.

AC-8.4 is drawn from a recorded real occurrence: `regime-ledger-research` carries a pre-existing
`wheel_rationale` failure unrelated to any in-flight feature. An advisory tier that "fixed" such a
failure inside a feature branch would attribute unrelated work to that feature and hide the real
defect.

### REQ-ADV-09 — Advisory record

- **AC-9.1** — Given any advisory invocation, Then a record is appended to
  `docs/{feature}/ADVISORY-{feature}.md` carrying timestamp, seam, diagnosis, confidence,
  envelope determination, action taken or escalated, and evidence citations.
- **AC-9.2** — Given an advisory action is taken without a record being written, Then this is a
  defect and is asserted against by test.
- **AC-9.3** — Given Phase H (harvest), Then `ADVISORY-{feature}.md` is a harvested process
  artifact — distilled into LEARNINGS and deleted — exactly like `CROSS-REVIEW-*` and
  `CODE_REVIEW-*`.
- **AC-9.4** — Given the final pipeline report, Then it carries an advisory summary: count of
  invocations, count resolved, count escalated, by seam.

AC-9.3 and AC-9.4 together are what make the advisory tier improvable: the consolidation agent
reads the harvested record and can see which seams escalate most, which is the signal for where
the envelope or the upstream phase needs work.

### REQ-ADV-10 — Escalation output

- **AC-10.1** — Given any escalation, Then an entry is appended to `docs/_queue/ESCALATIONS.md`
  carrying feature, seam, diagnosis, proposed action, evidence, and the pipeline state at the time.
- **AC-10.2** — Given an escalation entry, Then it states what the operator must decide, in one
  sentence, at the top.
- **AC-10.3** — Given an escalation, Then the pipeline's existing halt or skip behavior is
  unchanged. Escalation adds information; it never changes control flow.

## 4. Non-functional requirements

- **NFR-1** — The envelope is enforced in the workflow script, never only in an agent prompt. A
  prompt instruction is not a control.
- **NFR-2** — Every prohibition in REQ-ADV-04 has an explicit failing test proving it holds.
- **NFR-3** — The advisory tier is additive: with `ADVISORY_ENABLED = false` the pipeline's
  behavior is byte-identical to today's.
- **NFR-4** — No advisory seam may extend total pipeline wall-clock by more than its configured
  budget; exceeding it escalates.
- **NFR-5** — The advisory tier never has credentials beyond those the pipeline already holds, and
  never merges (REQ-MERGE-03 and AC-4.4 both hold).

## 5. Scope

**In scope:** the `MODEL_ADVISORY` rung with startup validation, the advisory verdict contract, the
configured envelope with in-code enforcement, the five seams A1–A5, the prohibitions, the advisory
record, escalation output, tests.

**Out of scope:** replacing any existing deterministic gate; the consolidation cadence
(`pdlc-consolidation-agent`); the loop driver (`pdlc-engineering-loop`); merging.

## 6. Dependencies

- **BL-01** — **The Fable 5 model alias for the workflow runtime's `agent()` `model` option is
  unverified** (master plan OQ-E1). Existing constants use bare aliases (`"opus"`, `"sonnet"`,
  `"haiku"`). AC-1.2 makes this a startup-validated configuration value precisely so an incorrect
  alias fails loudly rather than silently downgrading the tier. Confirming the alias is the first
  task of implementation.
- **BL-02** — `pdlc-merge-phase` delivered; seam A5's fix-and-re-poll loop and the merge phase's
  preconditions interact and must be built in that order.
- **BL-03** — `gh` can retrieve failing job logs (`gh run view --log-failed`) in the consuming repo.
- **BL-04** — `docs/_queue/ESCALATIONS.md` is a new artifact; its format is defined here and
  consumed by `pdlc-engineering-loop`.

## 7. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-ADV-01 | Widening the envelope beyond AC-3.3 | Requires operational evidence from the advisory record about which escalations were routinely rubber-stamped | `pdlc-consolidation-agent` |
| D-ADV-02 | Advisory participation in spec authoring phases | Those phases already run on Opus and do not halt; no seam exists | — |
| D-ADV-03 | Learned confidence calibration from escalation outcomes | Needs a corpus of escalations with recorded operator decisions | `pdlc-consolidation-agent` |
| D-ADV-04 | Advisory resolution of review-thread comments | Comment substance is a design conversation, not a mechanical seam | — |
| D-ADV-05 | Per-seam model selection (different rungs per seam) | One advisory rung until evidence shows a seam is over- or under-served | — |
