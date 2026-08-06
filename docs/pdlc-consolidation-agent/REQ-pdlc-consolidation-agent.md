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
- **AC-4.2** — Given the credential, Then it is read at runtime from the environment variable named
  by `consolidation.credentialEnv` (default `PDLC_PLUGIN_REPO_TOKEN`) and is never logged, never
  written into a PR body, and never persisted into any artifact. **Positive conjunct on the same
  path:** the log row for every pass carries exactly one `credential:` field whose value is drawn
  from the closed set `present (redacted)` / `absent` / `local-gh` — so the absence assertion is
  made on a path that demonstrably ran, not on a path that may never have executed.
- **AC-4.3** — Given the credential is absent or invalid, Then the pass degrades to AC-3.5's
  proposal-file fallback with reason code `credential-unavailable`, records
  `credential: absent` per AC-4.2, and surfaces the affected promotion in the AC-7.1 report under a
  `degraded` route with its reason code. It does not halt the whole pass, and it does not silently
  skip the promotion.
- **AC-4.4** — Given the pass runs locally under the operator's own `gh` authentication, Then that
  is a supported configuration; the scoped credential is required only for unattended execution.

AC-4.1 states a general principle rather than a local convenience: an automated identity that
proposes changes to the rules governing it must not also be able to enact them. Separating
propose-rights from merge-rights at the credential level makes that structural rather than
procedural — the agent cannot merge its own proposal even if every other control failed.

### REQ-CONS-05 — Falsifiability

- **AC-5.1** — Given any promotion, Then it records the failure mode it targets as a **structured
  record with four named fields**, not prose: `failure-mode-id` (a stable slug, unique within the
  log), `phase` (a member of the pipeline's phase catalogue), `symptom` (one line), and
  `artifact` (a path or glob the symptom appears in). The record is written into
  `docs/_decisions/.consolidation-log.md` alongside the promotion, and the same
  `failure-mode-id` is carried by the `PDLC-PROMOTION-ID` trailer of AC-3.3.
- **AC-5.2** — Given a consolidation pass, Then it reports, for **every** promotion recorded in
  prior passes, a verdict over the closed set `prevented` / `recurred` / `insufficient-evidence`,
  decided by a deterministic rule with no model judgment — so two runs over the same inputs cannot
  disagree, which is what makes NFR-4 true:
  - `recurred` — at least one LEARNINGS in the consumed set names this `failure-mode-id`.
  - `prevented` — no consumed LEARNINGS names the id, **and** at least one consumed LEARNINGS comes
    from a feature that exercised the promotion's recorded `phase` (the population where the failure
    could have appeared is non-empty).
  - `insufficient-evidence` — otherwise: no consumed LEARNINGS exercised that phase.

  The table is under a **set-equality** obligation: it carries exactly one row per prior promotion
  in the log — no missing rows and no rows for promotions that were never made. A dropped row is a
  failure, not a smaller table.

  To make the id observable in the consumed corpus, this feature adds a `failure-mode-id` line to
  the LEARNINGS §5 Open Items convention; a LEARNINGS predating the convention names no id and is
  therefore evidence only for the `phase` population test, never for `recurred`.
- **AC-5.3** — Given a promotion whose verdict was `recurred` on two consecutive **counted** passes,
  Then it is flagged `ineffective` and the pass proposes either a revision or a retirement — an
  edit that did not work is not left in place indefinitely. The streak is counted **in passes, not
  elapsed time**, and only passes that returned `prevented` or `recurred` for that promotion are
  counted: an `insufficient-evidence` verdict and an AC-1.4 `no-op` pass are skipped entirely —
  they neither advance nor reset the streak. Quiet weeks therefore cannot silently reset it.
- **AC-5.4** — Given a promotion flagged `ineffective`, Then retiring it follows the same
  propose-only path as making it. A promotion that landed under the AC-3.1 guard set is retired by a
  PR (AC-3.1, AC-3.6). A promotion that landed in the **consuming repo** — `DOMAIN-CONSTRAINTS.md`
  (AC-2.1) or `DECISIONS-{topic}.md` (AC-2.2) — is not a cross-repo edit; its retirement is written
  into `docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md` for operator approval and is **never**
  applied by the pass. Removal is as reviewable as addition on both routes.
- **AC-5.5** — Given a promotion that has returned `insufficient-evidence` for
  `consolidation.unmeasurablePasses` consecutive counted passes (default 3), Then it is reported as
  `unmeasurable`, so a promotion whose effect can never be observed is visible as such rather than
  accumulating silently.

### REQ-CONS-06 — Advisory-record input

**Why this requirement narrowed.** The structured per-seam counts do exist — `advisorySummaryRows`
(`pdlc/workflows/orchestrate-dev.js:2708`, driven by `ADVISORY_SEAMS`) — but only as an in-memory
field of one run's report (`:10663`, `:10695`), never persisted. The per-feature record
`ADVISORY-{feature}.md` has a strict schema (`renderAdvisoryEntry`, `:2642`) but is **deleted**
after Phase H2's distil (`:10499`), and that distil dispatch asks only for a prose summary with no
schema (`advisoryDistilPrompt`, `:7585-7594`). So LEARNINGS advisory text is not parseable and
cannot carry counts. `docs/_queue/ESCALATIONS.md` (`ESCALATIONS_PATH`, `:2750`; appended at `:2812`)
is the one durable per-seam record — append-only, non-feature-scoped, never distilled, never
deleted — and `renderEscalationEntry` (`:2763`) gives every entry named `Feature` and `Seam` fields.
REQ-CONS-06 therefore consumes **that**, and does not require a structured artifact that is
destroyed.

- **AC-6.1** — Given a consolidation pass, Then it reads `docs/_queue/ESCALATIONS.md` as its
  machine-readable per-seam input, counting escalations per `Seam` per `Feature` from the entry
  fields `renderEscalationEntry` emits. Advisory text folded into LEARNINGS is a **corroborating,
  non-numeric** input only: the pass may cite it as evidence but never derives a count from it.
- **AC-6.2** — Given a seam whose escalation count in `docs/_queue/ESCALATIONS.md` spans at least
  two distinct features and exceeds the other seams' counts (the AC-2.3 pattern bar applied to this
  corpus), Then the pass surfaces it as a candidate for envelope revision or upstream-phase repair,
  bound to the relevant deferral.
- **AC-6.3** — Given a seam with escalations from no feature across the consumed window, Then the
  pass may propose an envelope widening — never enacted. The proposal targets the **shipped
  defaults** in `pdlc/workflows/`, so it routes as a PR under AC-3.1. A consumer's
  `.claude/pdlc.config.json` is untracked and is not a PR-able surface; a widening a consumer must
  adopt locally is reported as an operator action in the AC-7.1 report, never as a PR.

REQ-CONS-06 is what makes the advisory envelope evidence-driven rather than frozen at whatever was
guessed on day one, while keeping every widening under operator approval. Note the honest limit:
`ESCALATIONS.md` records escalations, not resolutions, so "resolves autonomously at a high rate" is
observable here only as *absence of escalation*. A resolution-rate input requires the advisory
summary to be persisted, which is D-CONS-06.

### REQ-CONS-07 — Reporting

- **AC-7.1** — Given a pass completes, Then it reports: terminal status and reason code (the closed
  set `promoted` / `no-op` / `skipped-cadence` / `refused` / `failed`), the rung it ran on
  (AC-1.5/AC-1.6), LEARNINGS consumed by basename, promotions by route (constraints, decisions, PR,
  `degraded`), the AC-5.2 effectiveness table, and what it deferred for human judgment.
- **AC-7.2** — Given a pass completes on any path, Then exactly one report is emitted, on one
  channel: the pass's terminal report, written as the pass's row in
  `docs/_decisions/.consolidation-log.md` and returned as the invocation's report body (which is
  what a `/loop` tick prints). It carries the PR URL **when and only when** a PR was opened. No
  separate notification channel is introduced by this feature; a channel that survives with no
  session at all is bound to D-CONS-04.

## 4. Non-functional requirements

- **NFR-1** — No promotion is ever applied to a skill or workflow file by this agent. Pull request
  only, operator approves, always (DEC-E2).
- **NFR-2** — The credential never appears in a log, PR body, artifact, or notification; and on the
  same path, the log row carries the AC-4.2 `credential:` field from its closed three-value set, so
  the absence is asserted on a run that demonstrably reached the credential.
- **NFR-3** — The pattern-vs-coincidence bar (AC-2.3) is unchanged; running on a cadence must not
  lower the promotion threshold, or cadence becomes a volume machine.
- **NFR-3a** — A cadence-triggered pass and a volume-triggered pass are distinguishable in the log:
  the pass's log row records its trigger over the closed set `cadence` / `volume` / `manual`, so
  NFR-3's "the bar held on both" is checkable rather than asserted.
- **NFR-4** — A pass is idempotent with respect to its boundary, keyed explicitly: re-running over
  the same consumed-LEARNINGS set produces no duplicate promotion (identity: `failure-mode-id`,
  AC-5.1) and no duplicate PR (identity: the `PDLC-CONSOLIDATION-SOURCES` trailer of AC-3.1). A pass
  that finds an **open** PR carrying an identical sources trailer opens nothing, records
  `duplicate-suppressed` with that PR's URL (AC-3.5), and never extends or supersedes it — an
  interrupted pass's partial PR is left for the operator to merge or close, not silently amended.
  Idempotence is well-defined precisely because AC-5.2's verdicts are deterministic.
- **NFR-5** — The pass never modifies a LEARNINGS file it consumed; and on the same path, it
  positively records consumption by appending the consumed basenames to
  `docs/_decisions/.consolidation-log.md` (AC-2.4) — which is exactly what makes those files
  "consolidated" for the AC-1.1 predicate (`pdlc/hooks/scripts/nudge-consolidation.sh:41`). The log
  must name **exactly** the consumed set: neither more nor fewer.

## 4a. Configuration

All keys live under `.claude/pdlc.config.json` → `consolidation`, following the contract shape
`parseAdvisoryConfig` establishes: **per-key independent fallback with a stated default**, so one
malformed key never retunes the rest, and an absent or malformed `consolidation` section leaves
every key at its default. **Config owner: the repo operator** (the human who owns
`.claude/pdlc.config.json`; the same owner as `implementation`, `advisory`, `distribution`, `merge`).

| Key | Default | Malformed / absent | Used by |
|---|---|---|---|
| `consolidation.cadenceHours` | `168` (weekly) | falls back to default, noted in report | AC-1.1 |
| `consolidation.volumeThreshold` | `5` (matches `nudge-consolidation.sh:25`) | falls back to default | AC-1.2 |
| `consolidation.staleLockMinutes` | `60` | falls back to default | AC-1.3 |
| `consolidation.pluginRepository` | `null` → the current repository (the same-repo case, AC-3.8) | treated as unresolved: `repository-unresolved`, AC-3.5 fallback | AC-3.1, AC-4.1 |
| `consolidation.credentialEnv` | `"PDLC_PLUGIN_REPO_TOKEN"` | falls back to default | AC-4.2 |
| `consolidation.unmeasurablePasses` | `3` | falls back to default | AC-5.5 |

`cadenceHours` resolves master-plan OQ-E3 for this feature: weekly **and** threshold-driven, whichever
arrives first (AC-1.2). BL-04 is thereby closed at the REQ layer.

## 5. Scope

**In scope:** the `/loop`-driven cadence trigger and the volume trigger evaluated by the pass; the
single un-consolidated predicate (including the matching edit to
`pdlc/skills/consolidate-learnings/SKILL.md:35`); two-rung advisory-model execution with reported
fallback; PR promotion with scoped credential, in both the same-repo (AC-3.8) and two-repo
configurations; the effectiveness/falsifiability loop, including the LEARNINGS `failure-mode-id`
convention; `ESCALATIONS.md` consumption; reporting; tests.

**Out of scope:** merging any promotion PR; changing the promotion bar; session-free (no Claude Code
session) execution; a new notification channel; consolidating across multiple consuming repos;
persisting the advisory per-seam summary; retiring the manual `/pdlc:consolidate-learnings` entry
point; repository-side branch protection (BL-05, operator).

## 5a. Stopping rule

This REQ is done when every acceptance criterion above names **what is observed and where** — a
status value, a reason code, a config key with a default, a path, or a named constant at
`file:line`. It is **not** this REQ's job to specify how any of that is tested, generated or
fixtured: property axes, fault-injection vocabularies, coverage floors, fixture construction and
oracle mechanics belong to FSPEC, TSPEC and PROPERTIES (DC-09,
`docs/_constraints/DOMAIN-CONSTRAINTS.md:245`).

Concretely, for the review loop:

- A round whose blocking findings are **all** of the form "this cannot be tested as written" or
  "this needs an oracle" — none contesting user need, scope, priority, phasing, or the truth of a
  claim about existing code — means this REQ has met its bar. **Approve, and route those findings
  downstream** to the document that owns them.
- Findings that *do* belong here, and must be fixed here: a false or under-stated claim about code
  at HEAD; an AC whose input is a configured value with no key, default and owner; a deferral with
  no bound successor; a topology or trigger the shipped architecture cannot provide.
- Re-opening a question settled in an earlier round is out of order unless new evidence at
  `file:line` contradicts the settlement.

## 6. Dependencies

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-advisory-tier` delivered — the two-rung advisory ladder (`MODEL_ADVISORY` / `MODEL_ADVISORY_FALLBACK`) and `docs/_queue/ESCALATIONS.md` exist | PR merged | **Met** — queue row 14 `done`, merged `bb99f89` (#38) |
| BL-02 | `pdlc-workflow-distribution` delivered. A promotion that lands in `yumo-plugins` and never reaches a consumer's `.claude/workflows/` is not a promotion | PR merged | **Met** — archived to `docs/completed/pdlc-workflow-distribution/` |
| BL-03 | Fine-grained token per AC-4.1 provisioned, and the env var of `consolidation.credentialEnv` populated | Operator action + config value | Required only for the two-repo configuration; the same-repo shipping configuration (AC-3.8) runs on local `gh` auth (AC-4.4), so this does **not** gate FSPEC |
| BL-04 | Cadence value (master plan OQ-E3) | Config default | **Closed** by §4a: `cadenceHours` default 168, plus the AC-1.2 volume trigger |
| BL-05 | Repository-side enforcement that no promotion PR is auto-merged — branch protection / required review on the plugin repo | Operator action on the GitHub repo | Not a code dependency and does not gate FSPEC; AC-3.7's controls hold without it, but the repo-side belt is the operator's |

## 7. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-CONS-01 | Auto-merging any promotion PR | DEC-E2 is unconditional | — |
| D-CONS-02 | Consolidating across multiple consuming repos | One real consumer today | `pdlc-engineering-loop` |
| D-CONS-03 | Automatic prompt-size budgeting / pruning by age | Effectiveness-based retirement (AC-5.3) is the honest mechanism; age is a proxy | — |
| D-CONS-04 | Running the cadence as a cloud Routine | Routines run on a fresh clone with no working tree; viable for consolidation but needs its own design | `pdlc-engineering-loop` |
| D-CONS-05 | A/B measuring a promotion against a control | No control population exists in a serial single-pipeline setup | — |
| D-CONS-06 | Persisting the advisory per-seam summary (`advisorySummaryRows`, `orchestrate-dev.js:2708`) in a defined LEARNINGS section, so resolution *rates* — not only escalations — are consumable | The rows exist only in memory and `ADVISORY-{feature}.md` is deleted after distil (`:10499`); adding a schema to `advisoryDistilPrompt` is an `orchestrate-dev` change, not a consolidation change. REQ-CONS-06 is narrowed to `ESCALATIONS.md` in the meantime | `pdlc-engineering-loop` |
| D-CONS-07 | Session-free execution and a notification channel that survives without a Claude Code session | Same vehicle as D-CONS-04; AC-7.2 names the in-session report until then | `pdlc-engineering-loop` |
