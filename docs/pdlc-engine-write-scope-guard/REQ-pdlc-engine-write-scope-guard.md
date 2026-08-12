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

## 6. Risks

## 7. Obligations / Open Questions
