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
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.1 | 2026-08-05 |

> **Scope in one line.** Run consolidation on a cadence with the advisory model, and carry
> pipeline-level promotions across the repository boundary as pull requests against
> `yumo-plugins` — with every promotion recording the failure mode it targets and the next pass
> reporting whether that failure mode recurred.

## 1. Problem

`consolidate-learnings` reads per-feature LEARNINGS and promotes recurring patterns into
project-level `DOMAIN-CONSTRAINTS` and `DECISIONS`. That part works and stays.

Two things do not.

**The cross-repo dead end.** When a learning says *a skill prompt itself should change*, the skill
writes `docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md` — a four-column markdown table,
`| Source LEARNINGS | Target skill | Proposed change | Rationale |`
(`pdlc/skills/consolidate-learnings/SKILL.md:54`) — **in the consuming repo**. The skills it names
live in `yumo-plugins/pdlc/skills/`. Nothing carries the proposal across that boundary: no
`gh pr create` and no cross-repo push exists outside Phase PUB's own-repo `ship-pr`. It is a note to
a human who must read it, switch repositories, and hand-apply each row.

**Today's only consumer is `yumo-plugins` itself.** `docs/_queue/QUEUE.md:11` states that this queue
is the pipeline's own queue, and `:279` that every PR in it trips the self-modification guard. So the
"consuming repo" and the "plugin repo" are, in the shipping configuration, one repository. This REQ
therefore specifies the same-repo case as the primary configuration (AC-3.8) rather than assuming a
two-repo topology that does not yet exist.

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

**Trigger surface, named.** The pass ships as a workflow script invoked as
`/pdlc:consolidate-learnings`. Its cadence vehicle at HEAD is the same one the queue already uses —
a session-resident `/loop run /pdlc:consolidate-learnings` (CLAUDE.md, "Entry (queue, multi-feature)"),
where the operator starts the loop once and each tick runs a pass with no per-pass invocation.
Nothing in `pdlc/hooks/hooks.json` can start a pass: it registers only `PreToolUse`, `PostToolUse`
and `SessionStart` entries (`:3`, `:14`, `:29`), and `nudge-consolidation.sh` only prints
`hookSpecificOutput.additionalContext` and exits 0 (`:47`, header `:4`). The hook's role is
**unchanged by this feature** — it advises, it does not trigger. Truly session-free execution (no
Claude Code session at all) is D-CONS-04, bound to `pdlc-engineering-loop`.

**One predicate for "un-consolidated", named.** Two definitions exist at HEAD and disagree: the
hook's basename test (`pending = [p for p in learnings if os.path.basename(p) not in logtext]`,
`pdlc/hooks/scripts/nudge-consolidation.sh:41`, against `docs/_decisions/.consolidation-log.md`,
`:32`) and the skill's date boundary (`Date Completed` after the last logged pass,
`pdlc/skills/consolidate-learnings/SKILL.md:35`). **This feature adopts the basename test as the
single predicate** — it is durable against LEARNINGS date edits and is already the shipped
mechanism — and updates `consolidate-learnings/SKILL.md:35` to match. Every AC below that says
"un-consolidated" or "accumulated since the last pass" means exactly this predicate.

- **AC-1.1** — Given a `/loop` tick and `consolidation.cadenceHours` elapsed since the last logged
  pass, Then a consolidation pass runs with no per-pass operator invocation; given the interval has
  not elapsed, Then the tick exits `skipped-cadence` without reading LEARNINGS. Given a direct
  `/pdlc:consolidate-learnings` invocation, Then the pass runs regardless of the interval — the
  manual entry point is never gated by cadence.
- **AC-1.2** — Given the count of un-consolidated LEARNINGS (the AC-1.1 predicate) is at least
  `consolidation.volumeThreshold` (default 5, the value at `nudge-consolidation.sh:25`), Then the
  pass runs on this tick even if `consolidation.cadenceHours` has not elapsed, so consolidation
  fires on whichever of cadence or volume arrives first. The threshold is evaluated **by the pass
  itself**, not by the hook.
- **AC-1.3** — Given a pass begins while the in-progress marker is present and younger than
  `consolidation.staleLockMinutes`, Then the second pass exits with status `refused` and reason
  code `consolidation-in-progress`, naming the marker's timestamp and pass id; the refused pass is
  **dropped, not queued** — the next tick re-evaluates from scratch. The marker is a single
  `IN-PROGRESS: {passId} {ISO-8601}` line in `docs/_decisions/.consolidation-log.md`, written before
  any other pass work and removed by the pass itself on every terminal outcome (success, `no-op`,
  or failure). Given the marker is older than `consolidation.staleLockMinutes` (default 60), Then
  the pass reclaims it, records `reclaimed-stale-lock` with the abandoned pass id in its report,
  and proceeds — so a pass that dies mid-flight cannot wedge the cadence permanently. An operator
  may also clear it by deleting the line.
- **AC-1.4** — Given no un-consolidated LEARNINGS under the AC-1.1 predicate, Then the pass records
  `no-op` in `docs/_decisions/.consolidation-log.md` and exits successfully without opening a PR or
  writing a proposal file. A `no-op` pass still emits the AC-5.2 effectiveness table (it can observe
  that a prior promotion has aged into `unmeasurable` per AC-5.5) and still releases the AC-1.3
  marker.
- **AC-1.5** — Given a pass runs, Then it runs on the advisory model rung and records the rung it
  actually ran on in its report and in the log row. The rung ladder is the one
  `pdlc-advisory-tier` ships: `MODEL_ADVISORY` (`pdlc/workflows/orchestrate-dev.js:1652`) first,
  `MODEL_ADVISORY_FALLBACK` (`:1653`) on non-resolution. Both constants are module-private to
  `orchestrate-dev.js` and are not imported by `orchestrate-queue.js` (which carries its own
  `MODEL_QUEUE`), so this feature **restates the two-rung ladder for itself** rather than importing
  it; keeping the two in step is a named risk, not an inherited guarantee.
- **AC-1.6** — Given the primary rung does not resolve, Then the pass runs on the fallback rung and
  reports the downgrade explicitly (mirroring `ADVISORY_MODEL_FALLBACK:`,
  `pdlc/workflows/orchestrate-dev.js:1859`) — never a silent downgrade. Given **neither** rung
  resolves, Then the pass makes no promotion, releases the AC-1.3 marker, and exits with status
  `failed` and reason code `advisory-model-unresolved`; it does not fall through to a default model.

### REQ-CONS-02 — Promotion routing (unchanged behavior preserved)

- **AC-2.1** — Given a promoted domain invariant, Then it appends to
  `docs/_constraints/DOMAIN-CONSTRAINTS.md` in the consuming repo, as today.
- **AC-2.2** — Given a promoted architectural decision, Then it writes to
  `docs/_decisions/DECISIONS-{topic}.md` in the consuming repo, as today.
- **AC-2.3** — Given the pattern-vs-coincidence bar (recurs across ≥2 unrelated features, or a
  single occurrence stating a standing invariant), Then it is unchanged and still governs every
  promotion.
- **AC-2.4** — Given the pass completes, Then `docs/_decisions/.consolidation-log.md` records date,
  consumed files (by basename, exactly the set the AC-1.1 predicate selected), promoted items, and
  deferred items, as today (`pdlc/skills/consolidate-learnings/SKILL.md:43`).

### REQ-CONS-03 — Cross-repo promotion as a pull request

**Pass identity and artifact naming.** Every pass has a `passId` of the form `{YYYY-MM-DD}-{n}`,
where `n` is the 1-based ordinal of that pass on that calendar date — so the two same-day passes
AC-1.2 makes an expected case never collide. The proposal artifact is
`docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` (superseding today's `{date}`-only name at
`pdlc/skills/consolidate-learnings/SKILL.md:49`), the promotion branch is
`consolidation/{passId}`, and the PR body carries two trailers:
`PDLC-CONSOLIDATION-PASS: {passId}` and `PDLC-CONSOLIDATION-SOURCES: {sorted consumed basenames}`.
These are the identity keys NFR-4 is stated against.

- **AC-3.1** — Given a promotion targets any path under the guard set — **exactly**
  `MERGE_GUARD_DEFAULTS` (`pdlc/workflows/orchestrate-dev.js:48-53`): `pdlc/workflows/`,
  `pdlc/skills/`, `pdlc/hooks/`, `.claude/workflows/` — Then the agent opens a pull request against
  the repository named by `consolidation.pluginRepository` containing the **concrete edit**, not a
  description of it. The routing predicate is set-equal to that constant, not a restatement of part
  of it: a promotion editing `pdlc/hooks/scripts/nudge-consolidation.sh` (which is where AC-1.2's
  threshold lives, `:25`) routes here like any other.
- **AC-3.2** — Given such a PR, Then its body cites the source LEARNINGS files by feature name, the
  failure mode the edit targets, and the pattern evidence that cleared AC-2.3.
- **AC-3.3** — Given multiple promotions in one pass, Then they may share one PR, but each edit is
  a separate commit carrying the trailer `PDLC-PROMOTION-ID: {id}` naming exactly the promotion it
  enacts, so any single edit can be reverted independently and a reader can map commit → promotion
  without counting. A retirement (AC-5.4) may share a PR with additive promotions; it carries its
  own `PDLC-PROMOTION-ID` and its own commit.
- **AC-3.4** — Given the PR is opened, Then its URL is written back into
  `docs/_decisions/.consolidation-log.md` and into
  `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md`, so a later reader can tell which promotions
  actually landed and which are still open.
- **AC-3.5** — Given the PR cannot be opened, Then the pass **still** writes
  `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` with the full proposed diff inline, so the
  fallback is today's behavior rather than a lost promotion. The failure classes are enumerated and
  each is recorded by name in the log row and the proposal file:

  | Class | Reason code | Fallback fires? | Recorded |
  |---|---|---|---|
  | Credential absent or invalid | `credential-unavailable` | yes | class + `credential: absent (redacted)` (AC-4.3) |
  | `consolidation.pluginRepository` unset, not found, or renamed | `repository-unresolved` | yes | class + the configured value |
  | Network / API failure, including rate limiting | `api-failure` | yes | class + the API's status text |
  | Head branch `consolidation/{passId}` already exists remotely | `branch-exists` | yes | class + the existing branch and any PR found for it |
  | An open PR already carries this pass's `PDLC-CONSOLIDATION-SOURCES` trailer | `duplicate-suppressed` | **no** | class + the existing PR URL (NFR-4) |

- **AC-3.6** — Given any promotion, Then it is **never** pushed directly to the default branch.
  Pull request only, from branch `consolidation/{passId}`. The branch is never reused across passes
  (the `passId` makes it unique) and is **not** deleted by the pass — deletion follows the operator's
  merge or close of the PR, so the residue of a half-failed pass stays inspectable.
- **AC-3.7** — Given a promotion PR, Then **this feature's own controls** make auto-merge
  impossible, and the pass asserts them as its own observables rather than inheriting a mechanism:
  (a) the credential grants no merge rights (AC-4.1); (b) the pass never calls a merge or
  enable-auto-merge API on any PR — including its own; (c) the PR body carries the
  `PDLC-CONSOLIDATION-PASS` trailer of AC-3.1, so a repo-side control can recognise it.

  This restates, and does not repeat, `pdlc-merge-phase` REQ-MERGE-03. That guard is `guardVerdict`
  (`pdlc/workflows/orchestrate-dev.js:732`) over `effectiveGuardPaths` (`:709`), reachable only
  from Phase MERGE's ladder (`:899-900`) and the advisory-envelope check (`:2143`) — both inside an
  `orchestrate-dev` run deciding about **that run's own** PR — and Phase MERGE ships
  `mergeMode: "off"` (`:61`, refusal `:838`). No code path in this repository evaluates an inbound
  PR raised by another process, so claiming inheritance would assert a control that nothing
  enforces. Repository-side enforcement (branch protection / required review on the plugin repo) is
  an operator responsibility, tracked as BL-05.
- **AC-3.8** — Given `consolidation.pluginRepository` resolves to the same repository as the
  consuming repo — the shipping configuration today (§1) — Then the pass performs the promotion in
  a **separate clone under a temporary directory**, cut from the fetched default branch. It never
  checks out, stashes, or otherwise disturbs the working tree it was invoked from, which may be
  mid-pipeline on a `feat-*` branch. Everything else in REQ-CONS-03 and REQ-CONS-04 applies
  unchanged; AC-4.4's local `gh` authentication is the supported credential in this configuration.

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
