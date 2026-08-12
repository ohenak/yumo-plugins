---
feature: pdlc-engine-write-scope-guard
ready: true
depends-on: [pdlc-headless-engine]
---

# REQ — pdlc-engine-write-scope-guard

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.8); `docs/pdlc-headless-engine/DECISIONS-headless-engine-obligations.md`; `docs/_constraints/pdlc-wave-gate-baseline.md` (v1.0, M-WG-3, M-WG-4); `docs/_constraints/DOMAIN-CONSTRAINTS.md` (DC-01, DC-08, DC-09) |
| This doc | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | — |
| LEARNINGS | `docs/pdlc-engine-write-scope-guard/LEARNINGS-pdlc-engine-write-scope-guard.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-12 |

## 1. Problem / Context

The pdlc pipeline runs Phase I implementation in **same-tree waves**. Each wave is a group of
tasks whose owned file sets do not overlap, taken from the file-ownership manifest the PLAN
carries; the agents run in parallel in one shared working tree, are told not to commit, and the
script owns the gate that runs afterwards. Only files a task owns are committed, pathspec-scoped
(`docs/_constraints/pdlc-wave-gate-baseline.md`, M-WG-4). Ownership is what makes parallelism
safe: two agents editing the same file at the same time is the failure the partitioning exists
to prevent.

**Ownership is declared but not enforced.** Today a dispatched agent is *told* which files it
owns, in its prompt. Nothing stops it writing any other file in the tree. The two mechanisms
that look like protection are not:

- **Pathspec-scoped commits** keep an out-of-scope write out of *history*. They do not keep it
  out of the *tree*, and the tree is live: the wave gate reads it, sibling agents in the same
  wave read it, and the next wave inherits it.
- **Repo permission settings** (a consumer's `.claude/settings.json` allow/deny rules) do not
  bind the agents the engine dispatches. There is no operator-side configuration that closes
  this today — an operator who wants ownership enforced has nothing to turn on.

So the gap is not "an agent might commit the wrong file". It is "an agent can change tree state
that other agents and the gate then read as if the run had authorised it".

### 1.1 The incident (2026-08-12)

A Phase I wave-5 run of `pdlc-headless-engine` halted at the wave gate. Three facts about that
run are observed, and they are the ones this REQ rests on:

1. `.claude/pdlc.config.json` was modified in the working tree during the wave. That file is
   owned by task **T17** in the PLAN's ownership manifest, and T17 was not a member of the
   halted wave's ready set.
2. Nothing committed the change — per-task commits are pathspec-scoped, so the modification sat
   uncommitted in the tree.
3. The wave gate reads that same file live to resolve the test command it runs
   (`docs/_constraints/pdlc-wave-gate-baseline.md`, M-WG-3). The gate therefore evaluated the
   wave against configuration the run had not authorised, and the wave halted.

Two consequences carry forward regardless of which agent performed the write — see A-1 in §7,
which labels the attribution this REQ deliberately does not depend on:

- an agent in a wave can write a file outside the wave's owned set, and nothing in the tree
  stops it;
- the resulting uncommitted state can decide a gate outcome, so "nothing was committed" is not
  the same as "nothing happened".

### 1.2 Whose problem this is

| Who | What they experience today |
|---|---|
| The operator running a pipeline | A wave halts, and the halt names a test failure, not the stray write that caused it. Diagnosis means reading a dirty tree and guessing which agent produced which change. |
| The operator diagnosing afterwards | An out-of-scope write leaves no record at all. It is not in history (never committed) and not in the run report (nothing observes it). The only evidence is a dirty tree, which is destroyed by the first `git checkout`. |
| The engineer authoring a PLAN | The ownership manifest is load-bearing for correctness but carries no feedback. A manifest row that is wrong or missing produces no signal until a wave behaves strangely. |
| A reviewer judging a wave that passed | A green wave is not evidence that agents stayed in scope. Passing and staying in scope are currently independent. |

### 1.3 Why prompt-level scoping is not enough

Scope stated in a prompt is an instruction to a model, and the pipeline already treats
model self-report as insufficient everywhere else it matters: the wave gate is script-owned
precisely because an agent's own "tests pass" claim is not trusted (M-WG-3), and documents are
gated on structural completeness rather than on an agent saying "done". Write scope is the one
load-bearing constraint in Phase I still enforced only by asking. This REQ closes that
asymmetry at the same level the rest of the phase already works at: a mechanical check that
does not consult a model and cannot be talked out of.

## 2. Goals

- **G-1** An out-of-scope file write attempted by a wave agent is **rejected before it reaches
  disk**, so the tree the gate and the sibling agents read only ever holds authorised state.
- **G-2** The rejection is **legible to the agent that attempted it**: it names the path that was
  refused and the files that task does own, so the agent can either correct course or stop.
- **G-3** Violations are **visible to the operator after the run**, with enough detail to name the
  task, the wave and the path — replacing today's evidence of record (a dirty tree).
- **G-4** In-scope work is **untouched**. A wave with no violations produces exactly what it
  produces today, and a violation costs the offending write, not the task and not the run.
- **G-5** The guard's **state is always reported**, so an operator can tell an enforced run from
  an unenforced one without inspecting anything else. Silence never means "enforced".
- **G-6** Where the guard cannot enforce — the fallback transport, a PLAN with no manifest, an
  operator switch turned off — the run behaves **exactly as it does today** and says so. This
  feature introduces no new way for a pipeline to fail.

### 2.1 User stories

| ID | Story |
|---|---|
| **US-01** | As an operator running Phase I, I want a wave agent's out-of-scope write rejected before it lands, so the wave gate decides on state my run authorised. |
| **US-02** | As an operator reading a finished run, I want every rejected attempt named — task, wave, path, owned set — so I can tell a clean wave from one that tried to escape its scope. |
| **US-03** | As an operator, I want a rejection to cost only the offending write, so a scoping mistake does not kill a task or halt a pipeline that would otherwise finish. |
| **US-04** | As an operator on the fallback transport, I want to be told the guard is not enforcing on this run, so I never assume protection I did not get. |
| **US-05** | As an operator whose PLAN predates the ownership manifest, I want the guard to stay out of the way entirely, so adopting the engine costs me no new failure mode. |
| **US-06** | As an engineer authoring a PLAN, I want a manifest gap to surface as a named rejection during the run, so an under-declared ownership row is a thing I can see and fix. |

## 3. Non-Goals

- **NG-1 — Writes performed by shell commands are not guarded.** The guarded surface is the
  agent's file-write tool surface (the write / edit / notebook-edit class of tool calls). An
  agent that writes a file by running a shell command instead is outside this feature. This is
  a deliberate boundary, not an oversight, and the containment that remains for that path is
  named and unchanged: **per-task commits stay pathspec-scoped**, so a shell-mediated write
  outside a task's owned set still never enters history (M-WG-4). Whether that containment is
  adequate is a judgement this REQ does not make alone — it is routed, with a named owner, in
  **O-1**.
- **NG-2 — Dispatches outside Phase I waves are not guarded.** Authoring and review dispatches
  in every other phase write exactly as they do today. Those roles have no ownership manifest to
  be measured against; inventing a scope vocabulary for them is a different feature.
- **NG-3 — This is not a security boundary.** The guard exists to stop accidental scope drift by
  a cooperative agent. It makes no claim against an agent actively trying to evade it, and no
  acceptance criterion here should be read as one.
- **NG-4 — Reads are not scoped.** Agents keep reading whatever they need; only writes are
  judged.
- **NG-5 — The ownership manifest itself does not change.** Its grammar, its authoring rules,
  how waves are partitioned from it, and what gets committed after a wave are all unchanged.
  This feature reads the manifest that already exists and adds nothing to it.
- **NG-6 — No enforcement on the `claude -p` fallback transport.** The guard fails open there by
  decision (C-3); the obligation that comes with that decision is to *say so* (AC-4.2), not to
  emulate enforcement.
- **NG-7 — No repair, rollback or cleanup.** The guard prevents a write; it never reverts one.
  Writes already in the tree when a run starts — from an earlier run, from a human, from a shell
  command — are not this feature's business.
- **NG-8 — The guard does not replace the wave gate.** A wave with zero violations can still
  fail its tests and halt, exactly as today. Staying in scope and passing are separate claims.
- **NG-9 — A task's owned set is never widened at run time.** There is no approval prompt, no
  escalation, no "allow this once". The manifest at dispatch time is the whole authorisation for
  the run; a task that needs a file it does not own is a PLAN defect, surfaced as a violation
  (US-06) and fixed in the PLAN.

## 4. Constraints

- **C-1 — The engine is the delivery vehicle.** Enforcement lives on the path by which the
  headless engine dispatches Phase I wave agents. That path is `pdlc-headless-engine`'s
  deliverable, so this feature cannot ship before it (BL-01). The workflow-runtime path this
  repo ships today is not a second implementation target.
- **C-2 — The PLAN's ownership manifest is the sole authorisation.** A task's owned set is
  exactly the manifest rows the wave partitioning already uses. The guard introduces no second
  scope vocabulary, no per-task override file and no additional annotation for a PLAN author to
  learn.
- **C-3 — Enforcement is required on the primary transport only.** The engine's primary
  dispatch transport (the Agent SDK) must enforce. On the `claude -p` fallback transport the
  guard degrades **fail-open**: the run proceeds unguarded rather than refusing to run, and the
  degradation is reported (AC-4.2). A transport that cannot enforce must never be reported as
  enforcing.
- **C-4 — Every non-enforcing posture is byte-identical to today.** With the guard disabled, or
  inert for lack of a manifest, or degraded by transport, the run's created-file set, commits,
  exit code and outcome are what the same run produces with this feature absent. The only
  admitted difference is the guard-state line in the run report. This is the inertness bar the
  advisory tier already meets in this repo, applied here.
- **C-5 — No model judgement in the decision.** Whether a write is in scope is decided by
  comparing the attempted path against the task's owned set. No agent is consulted, no network
  call is made, and the decision is the same on every run given the same inputs.
- **C-6 — Waves keep sharing one tree.** The guard must work with same-tree waves as they run
  today; "isolate each agent in a worktree" is not an available answer, since worktrees are the
  exception path Phase I deliberately moved off.
- **C-7 — Ownership semantics are the ones already in force.** A manifest row naming a directory
  covers everything beneath it, matching how ownership collisions are already computed when
  waves are partitioned. A row naming a file covers that file whether or not it exists yet, so
  creating an owned file is in scope. The guard's jurisdiction is paths **inside the repository
  working tree**; paths outside it (a system temp directory, the operator's home) are not judged
  and are not violations.
- **C-8 — Guard state is a closed, four-member vocabulary.** Every run reports exactly one of
  `enforcing`, `degraded-transport`, `inert-legacy`, `inert-disabled` (§4.1). The set is closed
  on the emitting side and total on the reading side, per DC-01; "unknown" is not a member and
  an absent value is a defect, not a fifth state.
- **C-9 — What gets committed does not change.** Per-task pathspec-scoped commits, the post-wave
  build-output commit and the gate's ordering are untouched. This feature changes what can reach
  the tree, never what reaches history.
- **C-10 — Reporting is additive.** Guard state and violation records join the run report the
  engine already produces on both its success and halt paths. No existing report field changes
  meaning, and no field is removed.

### 4.1 Declared thresholds

| Name | Default | Owner | Used by |
|---|---|---|---|
| `engine.writeScopeGuard.enabled` | `true` — the guard is on out of the box on the primary transport | engine config, in the consumer's `.claude/pdlc.config.json` under the reserved `engine.*` key | AC-1.1, AC-7.1 |
| `engine.writeScopeGuard.maxRecordedViolationsPerTask` | `20` violation records per task per run; further attempts are counted, not itemised | engine config, same file | AC-3.3 |
| Guard-state vocabulary | Exactly four members: `enforcing`, `degraded-transport`, `inert-legacy`, `inert-disabled` | this REQ (C-8) | AC-3.2, AC-4.2, AC-5.1, AC-7.1 |
| Guard jurisdiction | Paths inside the repository working tree only | this REQ (C-7) | AC-1.4 |
| Guarded tool surface | The file-write tool class (write / edit / notebook-edit) | this REQ (NG-1) | AC-1.1 |

The default for `enabled` is `true` because the failure it prevents is silent and its cost when
it fires is one refused write (G-4). An operator who wants today's behaviour sets it to `false`
and the run report says so (AC-7.1) — the escape hatch is one key, and taking it is visible.

`maxRecordedViolationsPerTask` exists so a looping agent cannot turn a run report into an
unreadable log. `20` is a legibility bound, not a tuning value: it is well above the number of
distinct paths a correct task touches and well below the point at which a human stops reading.
Exceeding it never changes enforcement — every attempt past the cap is still rejected, and the
count of suppressed records is reported (AC-3.3).

### 4.2 Hard prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-headless-engine` — the engine and its Phase I wave dispatch on the primary transport | Queue row 3 merged to the default branch | Must exist at HEAD before FSPEC authoring |
| BL-02 | The PLAN file-ownership manifest and the script-owned wave gate that reads the tree live | Shipped behaviour, measured once as M-WG-3 and M-WG-4 in `docs/_constraints/pdlc-wave-gate-baseline.md` (v1.0) | Must exist at HEAD before FSPEC authoring; re-verify the two facts against the base commit at that time |
| BL-03 | An engine configuration surface at `.claude/pdlc.config.json` under a reserved `engine.*` key, which §4.1's two keys extend | Decision recorded in `docs/pdlc-headless-engine/DECISIONS-headless-engine-obligations.md` (DEC-HE-02, which resolves O-3) | Must exist at HEAD before FSPEC authoring |

## 5. Acceptance Criteria

| ID | Title | Priority | Phase | Source stories | Depends on |
|---|---|---|---|---|---|
| **REQ-WSG-01** | An out-of-scope write never reaches disk | P0 | 1 | US-01 | BL-01, BL-02 |
| **REQ-WSG-02** | In-scope work is unaffected, and a rejection costs only the write | P0 | 1 | US-01, US-03 | REQ-WSG-01 |
| **REQ-WSG-03** | Violations are recorded in the run report | P0 | 1 | US-02, US-06 | REQ-WSG-01 |
| **REQ-WSG-04** | Transport posture is enforced and reported honestly | P0 | 1 | US-04 | BL-01 |
| **REQ-WSG-05** | A PLAN with no ownership manifest is unaffected | P0 | 1 | US-05 | BL-02 |
| **REQ-WSG-06** | Only Phase I wave dispatches are guarded | P1 | 1 | US-01 | REQ-WSG-01 |
| **REQ-WSG-07** | The operator can turn the guard off, visibly | P1 | 1 | US-03, US-04 | BL-03 |

Throughout, *the guarded posture* means: the primary transport, a PLAN whose ownership manifest
parses, `engine.writeScopeGuard.enabled` at its `true` default, and a Phase I wave in flight.

### REQ-WSG-01 — An out-of-scope write never reaches disk

- **AC-1.1** *Who:* the operator. *Given* the guarded posture, *when* a wave agent attempts a
  file-write-class tool call whose target is inside the repository working tree and is not in its
  task's owned set, *then* the target is unchanged on disk — an existing file's bytes are the
  bytes it had before the attempt, and a path that did not exist does not come into existence —
  and the agent receives a rejection naming the refused path and that task's owned set.
- **AC-1.2** *Given* the guarded posture, *when* the attempted write would **create** a new file
  outside the owned set, *then* it is rejected on the same terms as AC-1.1. Creation is not a
  weaker case than modification: an unowned file that appears mid-wave is exactly the state the
  gate and the sibling agents must not read.
- **AC-1.3** *Given* the guarded posture and two tasks in the same wave, *when* one attempts to
  write a path owned by the *other* task in that same wave, *then* it is rejected. Membership of
  the same wave grants no shared authority; each task's owned set is its own.
- **AC-1.4** *Given* the guarded posture, *when* an agent writes a path outside the repository
  working tree, *then* the write proceeds and no violation is recorded (C-7). The guard's claim
  is about the tree the run reads, not about the machine.
- **AC-1.5** *Given* the guarded posture and any number of rejected attempts, *when* the wave's
  commits are inspected afterwards, *then* they are pathspec-scoped to each task's owned files
  exactly as before (C-9) — the guard adds no commit, removes none, and changes no pathspec.

### REQ-WSG-02 — In-scope work is unaffected, and a rejection costs only the write

- **AC-2.1** *Given* the guarded posture, *when* a wave agent writes a path inside its own owned
  set — including a file that row names but that does not exist yet (C-7) — *then* the write
  succeeds unmodified and no violation is recorded.
- **AC-2.2** *Given* the guarded posture and a wave in which no agent attempts an out-of-scope
  write, *when* the wave completes, *then* the files it created and committed are byte-identical
  to those from the same wave run with `engine.writeScopeGuard.enabled: false`.
- **AC-2.3** *Given* a wave agent whose write was rejected, *when* the dispatch continues, *then*
  the task is not terminated by the guard: the agent may keep working, may write other paths it
  owns, and may complete. Whether it *does* is the agent's decision, not the guard's.
- **AC-2.4** *Given* a run in which one or more violations were recorded, *when* the run ends,
  *then* it reaches the same terminal phase and the same outcome it would have reached with the
  guard disabled, given the same gate results. Nothing about a violation halts a wave, halts the
  pipeline, writes a POSTMORTEM or changes an exit code.

### REQ-WSG-03 — Violations are recorded in the run report

- **AC-3.1** *Who:* the operator reading a finished run. *Given* a run in which at least one
  out-of-scope write was rejected, *when* the run report is read, *then* it carries one record
  per rejected attempt, and each record names: the task, the wave the task ran in, the refused
  path relative to the repository root, and that task's owned set. Records appear in a
  deterministic order, so two readings of one run report agree.
- **AC-3.2** *Given* a run in which no write was rejected, *when* the run report is read, *then*
  it still states the guard's state as one of C-8's four members. An operator can therefore
  distinguish "nothing was attempted" from "nothing was watching" without inspecting anything
  else (G-5).
- **AC-3.3** *Given* a task that attempts more out-of-scope writes than
  `engine.writeScopeGuard.maxRecordedViolationsPerTask` (§4.1), *when* the run report is read,
  *then* it carries that many records for the task plus a count of the attempts it suppressed,
  and every suppressed attempt was still rejected on disk per AC-1.1.
- **AC-3.4** *Given* a run that halts for any reason after a violation was recorded, *when* the
  halt report is read, *then* the violation records are present in it. A halt is when this
  evidence matters most, so it is not carried only on the success path.
- **AC-3.5** *Given* a wave in which a task recorded at least one violation and the wave's gate
  passed, *when* the run report is read, *then* the task is distinguishable from a task that
  recorded none. A wave that went green having refused writes is not reported as clean.

### REQ-WSG-04 — Transport posture is enforced and reported honestly

- **AC-4.1** *Given* a Phase I wave dispatched on the primary transport with a parseable manifest
  and the guard enabled, *when* the run report is read, *then* the guard state is `enforcing`,
  and REQ-WSG-01 holds for that run.
- **AC-4.2** *Given* a Phase I wave dispatched on the `claude -p` fallback transport, *when* the
  run report is read, *then* the guard state is `degraded-transport`, the report names the
  transport as the reason, and the run proceeded to completion unguarded rather than refusing to
  start (C-3). No run reports `enforcing` while nothing was enforced.
- **AC-4.3** *Given* the fallback transport, *when* the run's created-file set, commits and
  outcome are compared with the same run with this feature absent, *then* they are identical
  apart from the guard-state line (C-4).

### REQ-WSG-05 — A PLAN with no ownership manifest is unaffected

- **AC-5.1** *Given* a PLAN with no parseable file-ownership manifest — the condition that
  already routes Phase I away from same-tree waves — *when* the phase runs, *then* the guard is
  inert, the run report states `inert-legacy` with that as the reason, and the run's created-file
  set, commits, exit code and outcome are what the same run produces with this feature absent.
- **AC-5.2** *Given* the same condition, *when* the run report is read, *then* the notice is a
  statement of posture, not a warning about a defect: a manifest-less PLAN is a supported input,
  and this feature adds no reason to fail it.

### REQ-WSG-06 — Only Phase I wave dispatches are guarded

- **AC-6.1** *Given* the guarded posture, *when* any dispatch outside a Phase I wave runs — an
  author, a reviewer, the DoD verifier, the harvest step — *then* its writes are unrestricted and
  it produces no guard record. Those roles have no owned set to be measured against (NG-2).
- **AC-6.2** *Given* the guarded posture, *when* the script's own work runs between waves — the
  gate command, the per-task commits, the post-wave build-output commit — *then* it is not
  subject to the guard and produces no records. The guard judges dispatched agents, not the
  engine.

### REQ-WSG-07 — The operator can turn the guard off, visibly

- **AC-7.1** *Given* `engine.writeScopeGuard.enabled: false`, *when* Phase I runs, *then* the
  guard is inert, the run report states `inert-disabled`, and the run is byte-identical to one
  with this feature absent (C-4). The three non-enforcing states are distinguishable from each
  other: an operator can tell "I turned it off" from "this PLAN has no manifest" from "this
  transport cannot enforce" without reading configuration.
- **AC-7.2** *Given* a config file where the guard's section is absent, malformed, or carries an
  unreadable value for either key of §4.1, *when* Phase I runs, *then* each key independently
  falls back to its declared default and the run proceeds — one unreadable key never retunes the
  other and never fails the run.

### 5.1 Stopping rule for this REQ's review loop

Pasted here deliberately, per DC-09, because a stopping rule that lives only in a constraints
file does nothing:

- A review round whose blocking findings are **all** implementability, mechanism or
  oracle-precision defects — none contesting user need, scope, priority or phasing — means this
  REQ has met its bar. **Approve it and move those findings downstream** as named entry
  obligations for FSPEC or TSPEC.
- A finding of the form "this AC has no oracle" is closable by **deferring** the oracle to TSPEC
  or PROPERTIES. It does not require writing one into this document.
- **Two consecutive rounds with a non-decreasing blocking count is a fixed point, not slow
  convergence** — more so if the document grew while the count did not fall. Distinguish that
  from churn (all prior findings closed, new blockers introduced by the latest revision), and if
  it is churn, say so and pre-commit to escalating if the next round does not close them.
- Any finding whose minimal fix requires naming a mechanism — how a write is intercepted, what
  the guard is called at any layer, the shape of a report field — is **out of altitude for this
  document** and is routed to O-2 rather than answered here.

## 6. Risks

- **R-1 — An incomplete manifest turns into refused work.** A task that legitimately needs a file
  its manifest row does not name now hits a rejection where it previously wrote silently.
  *Mitigation:* the rejection names the owned set (AC-1.1) so the gap is legible to the agent,
  the violation record names it to the operator (AC-3.1), and nothing halts (AC-2.4), so the cost
  is a task's completeness rather than a run. *Residual:* a task can finish and report success
  having quietly skipped work it could not write. AC-3.5 makes such a task distinguishable in the
  report; it does not make the skipped work visible. This is the risk this feature most likely
  gets wrong in its first iteration, and the first weeks of violation records are the evidence
  for whether manifests or the guard need adjusting.
- **R-2 — Fail-open on the fallback transport means a whole run can be unguarded.** An operator
  who does not read the report gets exactly today's behaviour while believing otherwise.
  *Mitigation:* AC-4.2's explicit `degraded-transport` state, and C-8's rule that no run ever
  reports `enforcing` unless it enforced. *Residual:* reporting is not enforcement, and a run on
  the fallback transport is genuinely unprotected.
- **R-3 — The shell side-channel makes the guard incomplete by construction.** The honest claim
  after this feature ships is "the tool-mediated write path is closed", not "the tree is
  protected". *Mitigation:* NG-1 states the boundary rather than blurring it, and O-1 routes the
  adequacy judgement to a named reviewer. *Residual:* an agent that writes via a shell command
  reproduces the incident of §1.1 exactly.
- **R-4 — The guard is only as tight as the manifest.** A task owning a broad directory is
  authorised for everything beneath it (C-7), so a coarse manifest yields a weak guard while
  reporting `enforcing`. *Mitigation:* violation records give PLAN authors the first real
  feedback loop they have had on manifest quality (US-06). *Residual:* nothing here measures
  manifest tightness, and a PLAN can be made permissive to make rejections go away.
- **R-5 — Rejections change agent behaviour in ways nobody has observed yet.** An agent that
  meets a refusal may retry, work around it, or abandon its task early. *Mitigation:* AC-2.3
  keeps the guard out of the termination decision, and the rejection names the owned set so the
  most useful response — correct course, or stop and report — is the easiest one. *Residual:*
  this is a behavioural change to a live loop, and the first runs after it ships should be read
  for it.
- **R-6 — A new report surface can be read as a new failure surface.** Operators may treat any
  non-zero violation count as a run defect and start halting on it manually, re-introducing the
  brittleness NG-8 and AC-2.4 exist to avoid. *Mitigation:* AC-5.2's framing rule — posture
  statements are not warnings — applied to the violation records as well.

## 7. Obligations / Open Questions
