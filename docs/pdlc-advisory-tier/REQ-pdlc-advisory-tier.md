---
feature: pdlc-advisory-tier
ready: true
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
| pdlc | draft | Claude | 1.1 | 2026-07-27 |

> **Scope in one line.** A third model rung — the Fable 5 advisory tier (Opus as declared
> fallback) — that takes the five
> judgment seams where the pipeline currently halts and either resolves them inside a declared
> envelope or escalates them with the analysis already done, never converting a blocking verdict
> into a passing one.

## 1. Problem

Every judgment call in the pipeline is a full stop with no attempt at resolution:

| Seam | Location | Today |
|---|---|---|
| A1 | `orchestrate-queue` Phase-0 triage returns `needs-human` | skip the candidate, try next |
| A2 | Stale-REQ re-grounding obligation inside that same triage prompt | `needs-human`, skip — today indistinguishable from A1 |
| A3 | Phase DOD verify→remediate exhausts 3 iterations | pipeline halts |
| A4 | `ship-pr` rebase produces conflicts | pipeline halts, branch unchanged |
| A5 | Phase PUB CI is red, or no check ever registers | red halts; no-checks passes silently |

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

- **AC-1.1** — Given the workflow configuration, Then a single constant `MODEL_ADVISORY` names the
  advisory rung — the **Fable 5** rung, resolvable by the runtime — alongside the existing
  `MODEL_DEFAULT`, `MODEL_IMPLEMENTATION` and `MODEL_QUEUE`. Fable is the intended rung because
  every seam is judgment-under-evidence rather than code production. The literal alias string is
  pinned by TSPEC once BL-01 resolves, not by this REQ.
- **AC-1.2** — Given a constant `MODEL_ADVISORY_FALLBACK` naming the Opus rung, Then it is used
  **only** when `MODEL_ADVISORY` does not resolve, and using it is a declared, first-class outcome
  — never an implicit downgrade. **Non-resolution is observable as** a dispatch on `MODEL_ADVISORY`
  that the runtime rejects with a model/alias error before the agent produces output; any other
  dispatch failure is not non-resolution.
- **AC-1.3** — Given the fallback is taken, Then the pipeline (a) emits an explicit
  `ADVISORY_MODEL_FALLBACK` warning naming the unresolvable value and the substitute, (b) records
  the substitution in the advisory record (REQ-ADV-09) and in the final report's advisory summary,
  and (c) proceeds. A run on the fallback rung is therefore always distinguishable from a run on
  the intended rung, which is what AC-1.2's "never implicit" is protecting.
- **AC-1.4** — Given **neither** rung resolves, Then no advisory agent ever runs on an unresolved
  model, and the run fails loudly with a model-resolution error. There is no third fallback and no
  silent revert to `MODEL_DEFAULT`. The detection point is TSPEC's to choose.
- **AC-1.5** — Given the model values, Then each is one constant referenced by every advisory
  dispatch site in **both** the dev and the queue module (seams A1/A2 live in the queue module), so
  changing the rung is a one-line change rather than a search.
- **AC-1.6** — Given `advisory.enabled` is false, Then every seam reverts exactly to today's
  behavior — skip or halt — no advisory agent is dispatched and no model resolution is attempted
  (so a missing Fable alias cannot break a run with the tier off). Observably: the run completes
  with the same phase outcomes, the report carries no advisory summary, and no `ADVISORY-*` file
  and no `ESCALATIONS.md` entry is created.
- **AC-1.7** — Given the advisory knobs, Then all of them are declared in one `advisory` section of
  `.claude/pdlc.config.json` — the per-repo config home Phase MERGE and the distribution gate
  already use — owned by the repo operator:

  | Threshold | Default | Meaning |
  |---|---|---|
  | `advisory.enabled` | `false` | master switch (AC-1.6) |
  | `advisory.attemptBudget` | `3` | advisory attempts per seam invocation (AC-2.4); A5's fix→re-poll cycles (AC-8.2) draw on this same budget |
  | `advisory.seamBudgetMinutes` | `10` | wall-clock per seam invocation (NFR-4); an overrun escalates |
  | `advisory.envelope` | the AC-3.3 allow-list | the per-seam allow-list (AC-3.1) |

### REQ-ADV-02 — The advisory contract

- **AC-2.1** — Given any advisory invocation, Then it returns an `AdvisoryVerdict` carrying
  `seam`, `diagnosis`, `proposedAction`, `confidence` ∈ {`high`, `low`},
  `withinEnvelope: bool`, and `evidence` (the concrete file/line/log citations the diagnosis rests
  on). The enum is two-valued because nothing in this REQ reads any third value.
- **AC-2.2** — Given `withinEnvelope == false` **or** `confidence != high`, Then the action is not
  taken and the verdict is escalated. Both conditions are required for autonomous action. The
  envelope is the control; confidence only lets the agent decline within it.
- **AC-2.3** — Given an advisory agent returns a malformed or unparseable verdict, Then it is
  treated as an escalation, not as a pass, and it consumes one attempt.
- **AC-2.4** — Given an advisory invocation exceeds `advisory.attemptBudget` or
  `advisory.seamBudgetMinutes` (AC-1.7), Then it escalates rather than retrying indefinitely.

### REQ-ADV-03 — The envelope (what may be resolved unattended)

- **AC-3.1** — Given the envelope, Then it is declared in configuration as an explicit per-seam
  allow-list, and is **not** inferable, extendable, or negotiable by any agent at runtime.
- **AC-3.2** — Given an advisory agent proposes or produces a change outside the envelope, Then the
  workflow script refuses it — inspecting the produced diff and reverting it, since the dispatch
  seam offers no write sandbox — and the seam takes the AC-3.6 refusal path. Enforcement is in
  code, not in the agent's prompt.
- **AC-3.3** — Given the shipped default envelope, Then it permits exactly these four, each with a
  decidable rule:

  | # | Permitted | Decidable rule | Seam |
  |---|---|---|---|
  | E-1 | re-running a flaky check | *flaky* = the check failed and the re-run is on the identical commit sha with no push between them; capped by `advisory.attemptBudget` | A5 |
  | E-2 | fixing a lint, format or type error introduced by the branch | *introduced* = the same check passes at the merge-base commit and fails at the branch head | A5 |
  | E-3 | resolving a rebase conflict in branch-created files | *branch-created* = absent from the merge-base tree **and** absent from the default-branch tip | A4 |
  | E-4 | re-grounding a stale REQ's `file:line` citations | the cited symbol still exists, at a new location | A2 |

- **AC-3.4** — Given the shipped default envelope, Then it **excludes**, as a closed set: (a) any
  change to a test file or test configuration — editing an assertion, deleting a test file or case,
  renaming a test out of the collected set, adding a skip/xfail/only marker, narrowing a
  parametrised case list, or lowering a coverage or mutation threshold; (b) any change to a DoD
  criterion or threshold; (c) any rebase conflict outside E-3's branch-created files; (d) any change
  outside the feature's **declared scope** — the files named in the feature's PLAN plus the files
  the branch had already touched when the seam fired; (e) anything under REQ-MERGE-03's
  self-modification paths.
- **AC-3.5** — Given an advisory-produced diff touches anything in AC-3.4(a), Then the diff is
  reverted whole, the seam escalates, and no run in which that happened is reported as resolved —
  the AC-7.4 template applied to test tampering. Each operation enumerated in AC-3.4(a) is asserted
  by its own test: fixing a red test by editing the test is the pipeline's most dangerous failure
  mode, so a dropped case must fail the suite.
- **AC-3.6** — Given any refusal — out-of-envelope proposal, a REQ-ADV-04 prohibition, a reverted
  diff, low confidence, exhausted budget, or a malformed verdict — Then the observable outcome is
  the same triple: the seam's outcome is `escalated`; the advisory record (AC-9.1) and the
  escalation entry (AC-10.1) both carry a refusal reason from the closed set `out-of-envelope`,
  `prohibited-action`, `revert-on-test-touch`, `low-confidence`, `budget-exhausted`,
  `malformed-verdict`, `record-write-failed`; and the pipeline's pre-advisory behavior for that
  seam — skip at A1/A2, halt at A3/A4/A5 — proceeds unchanged.

### REQ-ADV-04 — What the advisory tier may never do

- **AC-4.1** — Given any seam, Then the advisory tier may never mark a Definition-of-Done
  criterion satisfied, weaken a criterion, or reduce the DoD iteration requirement.
- **AC-4.2** — Given any seam, Then it may never set the `ready: true` frontmatter flag on a REQ.
  (Distinct from the A1 adjudication verdicts of AC-5.1, which name no frontmatter flag.)
- **AC-4.3** — Given any seam, Then it may never declare CI passed, and may never cause
  `ciStatus` to be derived from anything but the actual GitHub Actions rollup.
- **AC-4.4** — Given any seam, Then it may never merge a PR, and may never alter a queue `Status`
  cell.
- **AC-4.5** — Given a resolution is applied, Then a gate **re-runs** and reaches its own verdict —
  the advisory tier fixes causes; gates decide outcomes. Which gate, per seam:

  | Seam | Gate that re-runs | State it must reach |
  |---|---|---|
  | A1 | the deterministic dependency-presence pre-check only; Phase-0 triage is itself an agent verdict and is **not** re-run | every declared dependency present in base |
  | A2 | the same pre-check plus triage, on the re-grounded REQ, in the **next** queue invocation — applying a proposal does not pick a candidate, so AC-5.4's one-pick guarantee is preserved | triage reaches a verdict of its own |
  | A3 | Phase DOD's verify step | no findings remaining |
  | A4 | the rebase completes, then the branch's test command (AC-7.4) | rebase clean and tests green |
  | A5 | the GHA rollup read (AC-4.3) | all checks passed |

- **AC-4.6** — Given AC-4.1 through AC-4.5, Then each has a failing test proving the prohibition
  holds, and each such test asserts the AC-3.6 positive triple on the same path — a negative
  assertion alone is satisfied by accident.

### REQ-ADV-05 — Seam A1/A2: queue triage and re-grounding

- **AC-5.1** — Given a triage stop routed to A1, Then an advisory agent reviews the triage evidence
  and returns `run-candidate`, `hold`, or `escalate`. Only a `needs-human` **abstention** is
  adjudicable: the advisory verdict may never overturn a triage verdict of `blocked`, and may never
  return `run-candidate` for a REQ whose declared dependency is absent from base — that remains a
  deterministic check and it is the gate AC-4.5 re-runs.
- **AC-5.2** — Given the stale-REQ re-grounding gate fires, Then the advisory agent re-diffs the
  REQ's load-bearing citations against HEAD and produces a **re-grounding proposal** listing each
  drifted citation with its corrected location.
- **AC-5.3** — Given a re-grounding proposal contains only citation-location corrections where the
  cited symbol still exists, Then it is within the envelope and may be applied. Given it contains
  any citation whose symbol no longer exists, or any change to a REQ's requirements, Then it
  escalates — a REQ whose premise has evaporated needs a human, not a patch.
- **AC-5.4** — Given the queue driver, Then `needs-human` candidates are adjudicated in queue
  order and at most one is picked per invocation, preserving the serial guarantee.
- **AC-5.5** — Given a Phase-0 triage stop, Then its outcome names **which** gate produced it: the
  `needs-human` result carries a machine-readable seam token, and a `needs-human` result with no
  recognised token routes to the A1 adjudicator. Today the two stops are one free-text signal, so
  without this the workflow cannot route a stop to the right envelope (E-4 applies to A2 only) and
  AC-5.2/AC-5.3 have no testable precondition.

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

AC-8.4 is drawn from a recorded real occurrence: a consuming repo carried a long-standing test
failure on its default branch, unrelated to any in-flight feature. An advisory tier that "fixed" such a
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
  invocations, count resolved, count escalated, by seam, plus the **advisory model actually used**
  and whether it was the configured rung or the AC-1.2 fallback.

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

**In scope:** the `MODEL_ADVISORY` rung (Fable 5 default) with startup validation and the declared
`MODEL_ADVISORY_FALLBACK` (Opus) substitution path, the advisory verdict contract, the
configured envelope with in-code enforcement, the five seams A1–A5, the prohibitions, the advisory
record, escalation output, tests.

**Out of scope:** replacing any existing deterministic gate; the consolidation cadence
(`pdlc-consolidation-agent`); the loop driver (`pdlc-engineering-loop`); merging.

## 6. Dependencies

- **BL-01** — **The Fable 5 model alias for the workflow runtime's `agent()` `model` option is
  unverified** (master plan OQ-E1). Existing constants use bare aliases (`"opus"`, `"sonnet"`,
  `"haiku"`), so `MODEL_ADVISORY` may need `"fable"` rather than `"claude-fable-5"`. Confirming
  the alias is the first task of implementation. This blocker is **non-fatal by construction**:
  AC-1.2/AC-1.3 let the tier ship and run on the Opus fallback with the substitution declared,
  while AC-1.4 keeps a wholly unresolvable configuration a loud startup failure. Fable remains the
  intended rung; the fallback is a bridge, not the target state.
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
