---
feature: pdlc-engineering-loop
ready: true
depends-on: [pdlc-workflow-distribution, pdlc-merge-phase, pdlc-advisory-tier, pdlc-consolidation-agent, pdlc-advisory-wave-gate]
---

# REQ — pdlc-engineering-loop

| Field | Value |
|---|---|
| Upstream | `docs/design/MASTER-PLAN-engineering-loop.md` (§2, §6, order 5) |
| Downstream | — |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ[-v{N}].md` in this directory |
| LEARNINGS | `docs/pdlc-engineering-loop/LEARNINGS-pdlc-engineering-loop.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.9 | 2026-08-25 |

> **Scope in one line.** The `/loop` driver, its per-repo prompt, and the single escalation file
> that makes the residual operator surface reviewable — turning four separately-closed breaks into
> one loop that runs from a `ready: true` REQ to a merged PR to an improved pipeline without a
> human turn in between.

## 1. Problem

Orders 1–4 close each break individually. None of them makes the loop *run*.

Today `/loop run /pdlc:orchestrate-queue` is documented in the `orchestrate-queue` SKILL and works,
but it only ever completes one useful iteration before stalling: iteration 1 delivers a PR and sets
`awaiting-merge`, and every subsequent iteration finds nothing to pick up until a human merges. The
loop spins without progressing.

The stall has **two distinct shapes**, and the code produces different outcomes for them
(`selectNextPending` and the driver's finish paths in `pdlc/workflows/orchestrate-queue.js`):

| Queue state | Outcome today | Governed by |
|---|---|---|
| An `in-progress` row exists | `blocked`, naming the active feature | AC-1.4 |
| No `pending` rows, but `awaiting-merge` rows exist | `idle`, with the reason "no pending entries (all done, awaiting-merge, blocked, or halted)" — the merge-blocked features are **not** named | AC-1.6 |

The post-PR stall this feature exists to fix is the second row — an `idle` stall, not a `blocked`
one. Backoff and termination (REQ-LOOP-02) would otherwise absorb it silently, which is why AC-1.6
requires it to be distinguished from an empty queue and to name what it is waiting on.

**The engine already ships an in-engine loop, and this feature is not it.**
`pdlc queue --loop [--max-iterations <n>]` iterates inside one CLI invocation (`runQueueLoop`,
`pdlc/engine/lib/run.mjs`; `loop` flag in `pdlc/engine/bin/cli.mjs`), re-reading the queue each pass
and stopping on one of four `LOOP_STOP_REASONS`. This feature builds the **session-level** driver
instead — one iteration is one plain `pdlc queue` invocation (AC-1.2) — because only a session-level
loop can wait wall-clock time between iterations, run a once-per-session preflight (REQ-LOOP-03) and
render the operator view (REQ-LOOP-04). The in-engine `--loop` path is left as shipped: this feature
neither uses nor retires it, and each divergence between the two is stated where it arises (AC-1.5,
REQ-LOOP-02 preamble).

With the merge phase in place that stall disappears, but three things are still missing before an
unattended loop is safe to leave running:

**No termination discipline.** A loop that reports `idle` forever burns tokens at a fixed
interval. It needs to widen and stop.

**No single place to look.** Escalations from the advisory seams (a catalogue that has already
grown once, and whose membership AC-4.1 therefore takes from the live catalogue rather than from a
count written here), halted pipelines, and refused merges each surface in a different report at a
different time. The operator's promised experience — "read escalations, approve or reject" —
requires one file, not report objects scattered across past loop iterations.

**No honest statement of what still needs a human.** A design that implies zero human involvement
is lying, and an operator who believes it will stop checking.

## 2. User stories

- **US-01** — As the operator, I want to start the loop and have it deliver multiple features
  without my intervention.
- **US-02** — As the operator, I want one file that tells me everything waiting on me, ordered by
  what blocks the most work.
- **US-03** — As the operator, I want the loop to stop cleanly when there is nothing to do, rather
  than poll forever.
- **US-04** — As the operator, I want to know exactly which four things still require me, so I can
  budget attention rather than supervise.
- **US-05** — As the operator, I want the loop to refuse to run when the pipeline itself is in an
  unsafe state.

## 3. Requirements

### REQ-LOOP-01 — Loop prompt and iteration contract

- **AC-1.1** — Given a consuming repo, Then a loop prompt template ships at `pdlc/templates/loop.md`
  and the documentation states how to install it as the repo's default loop behavior. Installing it
  is an operator convenience, not a precondition: an operator who runs
  `/loop run /pdlc:orchestrate-queue` explicitly gets every outcome REQ-LOOP-01 through REQ-LOOP-07
  requires, so no criterion depends on a default-prompt convention being honoured.
- **AC-1.2** — Given one iteration, Then it invokes the queue driver exactly once — through the
  `orchestrate-queue` skill, which delegates to the installed engine CLI (`pdlc queue`, without
  `--loop`; the engine's own iteration is §1's other layer) — and returns, preserving the existing
  one-feature-per-invocation contract. The queue invocation, not
  a phase inside it, is the unit an iteration is counted in.
- **AC-1.3** — Given an iteration reports feature A as merged, Then the next
  iteration may pick up a dependent feature with no human turn between them. This is the property
  the whole plan exists to produce. The observable is the pair of queue reports: the first carries
  `outcome: ran` for feature A together with a merged merge status, the second carries `outcome: ran`
  for feature B whose `Depends-On` names A, with no operator input recorded between them. Where in
  the report that merge status is observable is not asserted here — the queue report projects no
  top-level merge field today — and is deferred to O-1 along with the level and harness.
- **AC-1.4** — Given an iteration returns `blocked` — which the queue produces when a row is
  `in-progress` — Then the loop reports the blocking feature and reason and **stops**. A serial
  queue that is blocked will stay blocked until a human acts; polling it is waste.
- **AC-1.5** — Given an iteration returns `halted`, Then the loop stops and surfaces the halt. This
  diverges deliberately from the in-engine `--loop`, which continues past a halt because the queue
  row already records it: an unattended session-level loop runs for hours between operator glances,
  so it stops at the first halt rather than accumulating halts nobody is reading.
- **AC-1.6** — Given an iteration returns `idle` while the queue holds at least one
  `awaiting-merge` row, Then the loop names those features and what they wait on, and **stops** —
  it does not enter backoff. The names come from `docs/_queue/QUEUE.md`, which the driver already
  reads for REQ-LOOP-04's view; the `idle` report itself carries no feature names (NFR-2). This outcome is distinguishable in the session report from an `idle`
  over a queue with no `awaiting-merge` rows, which does enter backoff under REQ-LOOP-02.

### REQ-LOOP-02 — Backoff and termination

Every threshold this REQ calls "configured" is declared below. Config home: a `loop` section in
`.claude/pdlc.config.json` — the per-repo, section-per-feature file whose reader already accepts
`merge`, `advisory`, `implementation` and `learningsInjection` (the shipped
`.claude/pdlc.config.example.json` illustrates all but `merge`). Owner: the consuming repo's
operator, who edits that file; the pdlc plugin owns the defaults and ships them in the example file,
adding both the `loop` and the missing `merge` section there in the same change.

These thresholds govern the **session-level** loop only. They deliberately do not reuse the engine
loop's bounds (`--max-iterations` / `maxPasses`, and its `idle` ⇒ `exhausted` stop), because that
loop has no wall clock: it cannot wait for a merge, so stopping at the first `idle` is right for it
and wrong here. `loop.backoffSchedule` and `loop.idleStopAfter` are session-level, and this feature
changes nothing about the in-engine bounds.

| Threshold | Default | Meaning |
|---|---|---|
| `loop.backoffSchedule` | `[5, 15, 30, 60]` (minutes) | Interval before iteration *n+1* after the *n*th consecutive `idle`; the last value repeats |
| `loop.idleStopAfter` | `4` | Consecutive `idle` outcomes after which the loop ends |
| `loop.preflight` | `"strict"` ∈ {`strict`, `off`} | Whether REQ-LOOP-03's gate refuses (`strict`) or only warns (`off`) |
| `loop.dirtyTreePolicy` | `"tracked"` ∈ {`tracked`, `any`} | Which changes AC-3.2 counts (see AC-3.2) |

- **AC-2.1** — Given consecutive `idle` outcomes, Then the interval before the next iteration widens
  along `loop.backoffSchedule` rather than polling at a fixed rate.
- **AC-2.2** — Given `loop.idleStopAfter` consecutive `idle` outcomes, Then the loop ends and says
  why in one line.
- **AC-2.3** — Given the loop ends for any reason, Then it reports what it delivered in the
  session. **AC-7.2 states the authoritative field set for that end-of-session summary**; this
  criterion adds no fields of its own.
- **AC-2.4** — Given `no-queue`, Then the loop ends immediately.
- **AC-2.5** — Given any of these four configuration states — (a) the `loop` section absent,
  (b) the section present and explicitly set to the defaults, (c) the section present but
  malformed, (d) the configuration file itself absent or unreadable/unparseable — Then every
  default above applies unchanged and the loop runs — a first-adoption repo with no configuration
  file at all is state (d), a supported and tested state — and the session report names which of
  the four applied, so all four are distinguishable from one another. **This partition is the
  authoritative one**, and it is the partition FSPEC BR-02 states. The sibling section reader this
  config file already ships (`readEngineConfig`) distinguishes three of these states — it reports
  an absent file, an unreadable one and a present one distinctly, collapsing a parse failure onto
  unreadable — so the fourth distinction *extends* that precedent rather than following it, and no
  divergence from any sibling reader is required to obtain it. FSPEC Q-03's premise (that the loop
  reader must diverge from `parseAdvisoryConfig`, so the divergence needs a decision) and BR-02's
  sentence "AC-2.5 names three states" are both false under this criterion; both are routed to the
  FSPEC's owning phase for retirement.

### REQ-LOOP-03 — Preflight safety gate

Preflight runs **once per session, before the first iteration** — not per iteration. Both conditions
below are properties of the machine and the working tree at session start, and the loop stops on
anything that changes them mid-session (AC-1.5, AC-1.6), so a per-iteration re-check buys nothing.

- **AC-3.1** — Given a session begins, Then the loop first verifies that the pdlc engine the
  iteration will dispatch through is installed and passes its own startup checks, and refuses to
  run when it does not. The engine ships this check as `pdlc doctor` (`cmdDoctor`,
  `pdlc/engine/bin/cli.mjs`): it prints one `PASS`/`FAIL`/`SKIP` line per startup rung with its
  detail and, when the startup result is not ok, the reason plus its remediation, and sets a
  non-zero exit. Its version-reporting preamble is separately exempt and always reports rather than
  refuses (`runVersionDoctor`), so the outcome preflight consumes is the startup result, not the
  version report. Preflight consumes that outcome rather than restating the engine's checks; O-4
  owns the exact fields and exit-code contract. *(The earlier draft gated on managed-workflow-script staleness from
  `pdlc-workflow-distribution` REQ-DIST-04. That apparatus was deliberately removed, not bypassed,
  by `pdlc-plugin-retirement` C-3 — the engine channel is now the only channel the pipeline runs
  through, so the engine's own readiness is what a preflight can observe.)*
- **AC-3.2** — Given the working tree of the consuming repo has uncommitted changes to **tracked**
  files at session start, Then the loop refuses to start and says so. The pipeline authors specs
  against the working tree; running it over uncommitted work produces specs grounded in something
  not in any commit. Untracked and ignored files do **not** count under the default
  `loop.dirtyTreePolicy: "tracked"` — a normally-configured consumer has both, so counting them
  would refuse every real repo. `"any"` counts untracked files too; ignored files never count. The
  check is on whichever branch the session starts on — the hazard is uncommitted work, not the
  branch's name.
- **AC-3.3** — Given the preflight refuses, Then it names the condition and the remediation, and
  the refusal is distinguishable from `idle`; `QUEUE.md` is byte-identical before and after a
  refusal.
- **AC-3.4** — Given `loop.preflight: "off"`, Then both AC-3.1's and AC-3.2's conditions are still
  evaluated and each that holds is warned about, naming the same condition and remediation AC-3.3
  requires. `"off"` suppresses the loop's own refusal, never the check. Under AC-3.2's condition the
  session then proceeds to iteration 1; under AC-3.1's it does not, because the engine refuses to
  dispatch on a not-ok startup result and says so (`cmdQueue`, `pdlc/engine/bin/cli.mjs`). No value
  of `loop.preflight` makes an unready engine run an iteration, so the observable outcome there is
  the warning followed by the engine's own refusal.

### REQ-LOOP-04 — The escalation file

**The log stays append-only.** `pdlc-advisory-tier` AC-10.4 guarantees `docs/_queue/ESCALATIONS.md`
is append-only, newest-last, precisely so this feature can consume it, and the consolidation agent
counts one escalation per entry block on disk. This REQ does **not** supersede that guarantee: no
criterion below rewrites, reorders or deletes a block already written. AC-4.3 and AC-4.5 are
properties of the **operator view** the loop renders from the log, not of the file's bytes. The file
is the authoritative record and the sole input to the view; the per-run report notices that also
mention an escalation are transient session output and are never read back, so a re-run cannot
produce a second view item from them.

- **AC-4.1** — Given `docs/_queue/ESCALATIONS.md`, Then every advisory escalation
  (`pdlc-advisory-tier` REQ-ADV-10), every refused merge (`pdlc-merge-phase` REQ-MERGE-03/04),
  and every pipeline halt appends an entry there. Only the advisory sources append at HEAD;
  making the other two append is new work, not shipped behaviour (O-5). The advisory sources are exactly the members of
  the live advisory seam catalogue — set-equality against that catalogue, whatever its current
  membership, never a count or a list restated here. The catalogue's single literal home is the
  advisory tier's own frozen enumeration, so deleting a member from it reds that feature's own
  oracle; nothing here re-enumerates it.
- **AC-4.1a** — Given a non-advisory escalation (a pipeline halt or a refused merge), Then its
  entry declares a source drawn from a namespace disjoint from the advisory seam catalogue, so that
  the two are distinguishable by any reader of the file alone; and every quantity the consolidation
  agent's advisory over-escalation calibration derives from the log — not only its per-seam totals,
  but also the entry count, the corpus state it reports when the log holds no advisory entries, and
  any candidate ranking derived from those — is identical to what it would be if non-advisory
  entries had never been written. Non-advisory
  entries are nonetheless visible in the operator view (AC-4.3) and are never silently discarded.
- **AC-4.2** — Given an entry, Then it carries: what the operator must decide (one sentence,
  first), feature, source (seam or phase), the diagnosis and its evidence, the proposed action if
  any, and timestamp. An entry's status ∈ {`open`, `resolved`, `rejected`} is a property of the
  view, derived from the entry and any later decision record for it (AC-4.4); the appended block
  itself is never rewritten to change status.
- **AC-4.3** — Given the operator view over the log, Then open entries are ordered by **how many
  queued features they block**, so the operator's first entry is the one unblocking the most work.
  The count for an entry is the number of features in `docs/_queue/QUEUE.md` that are not yet
  `done` and that reach the entry's feature through the transitive closure of each feature's
  **effective** dependencies — the union of its `QUEUE.md` `Depends-On` column and its REQ
  frontmatter's own `depends-on`, which is the union the queue itself resolves against
  (`orchestrate-queue.js`, the `dependsOn` union feeding `precheckDependencies`; stated in the
  shipped `pdlc/templates/QUEUE.md`) — excluding the entry's own feature. A queue-column-only count
  would under-count every feature that declares dependencies in frontmatter alone, which is a
  supported declaration form. An entry whose feature has no queue row counts 0. Ties break by
  oldest timestamp first, then by feature name ascending — so one expected sequence is assertable.
  The view is recomputed from `QUEUE.md` and the log on each render; it holds no state between
  iterations.
- **AC-4.4** — Given an entry is resolved or rejected, Then the decision — the outcome, who decided
  and when, and which entry it decides — is recorded durably and is retained rather than deleted,
  because the decision record is the input to `pdlc-consolidation-agent`'s confidence calibration.
  The decided entry's own block is not rewritten, and recording a decision does not change any
  seam's escalation counts.
- **AC-4.5** — Given the same condition recurs for the same feature, Then the operator view shows
  one item carrying an occurrence count rather than one item per recurrence, and the number of
  entry blocks on disk is unchanged by the collapsing — each recurrence is still its own appended
  block, so the escalation-frequency signal the calibration reads is neither deflated nor inflated.
- **AC-4.6** — Given the file is absent, Then it is created on first escalation.
- **AC-4.7** — Given a block in the log that cannot be parsed — a missing or duplicated field, or
  any shape the reader does not recognise — Then the view skips that block, reports it as a named
  parse notice with enough detail to find it, and renders the rest; a malformed corpus never
  refuses the loop and never aborts the render. Given an append fails, Then the failure is surfaced
  in the session report and the escalating phase's own outcome is unchanged by it.

### REQ-LOOP-05 — The declared operator surface

- **AC-5.1** — Given the shipped documentation, Then it states the complete set of things requiring
  a human **in steady-state operation** — that is, once the repo is set up and a loop session is
  running — and that set is exactly: (1) flipping `ready: true` on a REQ; (2) approving any PR that
  touches a guarded path; (3) resolving open escalations; (4) product- and business-judgment calls
  outside the pipeline's scope.
- **AC-5.1a** — Given item (2), Then the guarded paths the documentation states are set-equal to the
  merge phase's **effective** guard-path set for the repo it documents — the shipped defaults plus
  that repo's configured extras, which is the set the merge gate actually matches a PR against, so
  the documented set and the enforced set are the same object. The set is taken from that set at
  render time, not restated as a literal list here, because a list written here goes stale the first
  time the set widens. The engine's own source tree (`pdlc/engine/`) is not in the shipped defaults;
  this feature therefore adds it to *this* repo's configured extras, so that a change to the
  pipeline's runtime is operator-approved on whichever channel carries it. Widening the shipped
  defaults for every consumer belongs to `pdlc-merge-phase`, not here (§5).
- **AC-5.2** — Given one-time setup, Then the documentation separately lists the operator turns
  the loop needs **before** steady state — at minimum: installing the engine, creating
  `docs/_queue/QUEUE.md` from the shipped template, and installing the loop prompt (AC-1.1). These
  are outside AC-5.1's set by construction, and stating them is what keeps that set-equality true.
- **AC-5.3** — Given item (1), Then a queue row with `ready: false` is skipped under a named
  not-ready reason that the session report shows against that feature — not a distinct iteration
  outcome; the iteration's outcome stays one of the queue driver's existing closed set, and a queue
  holding only not-ready rows is `idle`. No configuration key makes `ready: true` settable by any
  agent, and the row's bytes are unchanged by the iteration that skipped it. The draft-protection
  latch is permanent.

### REQ-LOOP-06 — Durability

- **AC-6.1** — Given the documentation, Then it records `/loop`'s scope and lifetime — that it is
  session-scoped, fires only while a session is open and idle, and expires — as literals
  transcribed from the runtime's own `/loop` documentation, with that source and the runtime
  version cited beside them. Figures are not restated here: this REQ's requirement is that the
  documentation transcribe a citable authority rather than repeat folklore, which is also what
  makes the claim checkable when the runtime changes.
- **AC-6.2** — Given a cadence needs to outlive that, Then the documentation gives the promotion
  path: a Desktop scheduled task (local files, machine must be on) for pipeline work, or a Routine
  (cloud, fresh clone) for consolidation.
- **AC-6.3** — Given a Routine, Then the documentation states plainly that `orchestrate-dev` is a
  poor fit for one — the pipeline authors specs against the working tree, and a Routine has none.

### REQ-LOOP-07 — Session reporting

- **AC-7.1** — Given the loop runs, Then each iteration emits one line: outcome, feature, and
  merge status.
- **AC-7.2** — Given the loop ends, Then a summary reports features merged with their PR URLs,
  open escalation count, and the next actionable item. **This is the authoritative field set for the
  end-of-session summary** (AC-2.3); no other criterion states a different one.

## 4. Non-functional requirements

- **NFR-1** — The loop introduces no new authority. Every gate, guard and prohibition from orders
  1–4, and from the completed `pdlc-engine-distribution`, holds unchanged inside it — with the
  single exception §5's carve-out grants, which widens `pdlc-engine-distribution`'s file
  enumerations without changing what any gate asserts; the loop only decides *when* to invoke the
  queue.
- **NFR-2** — The loop driver never writes queue rows. The row write belongs to the queue
  invocation, which writes and commits the row itself before returning; the driver reads only —
  the returned report, and `QUEUE.md` for the names AC-1.6 and AC-4.3 need. Observable: across a
  loop session, every commit touching `docs/_queue/QUEUE.md` is attributable to a queue invocation
  and none to the driver — the commit count is not one per invocation, since a row-writing
  invocation commits the file more than once — and a session that runs zero iterations (preflight
  refusal, AC-3.3) leaves the file byte-identical.
- **NFR-3** — The loop never sets `ready: true` (AC-5.3), under any configuration: a `ready: false`
  row is reported under AC-5.3's named not-ready skip reason and its bytes are unchanged.
- **NFR-6** — A condition that arises, requires a human, and is not in AC-5.1's steady-state set or
  AC-5.2's setup list is a defect in this feature, not an expected mode — an unlisted stop means
  the surface was understated. This is deliberately strong: enumerating the operator surface is
  worth doing only if surprises are treated as bugs rather than absorbed as normal. It is a
  standing policy, not a criterion checkable at delivery, which is why it sits here.
- **NFR-4** — Stopping is always cheap and always safe: `Esc` at any point leaves a consistent
  state, because every iteration is a complete queue invocation.
- **NFR-5** — Escalation entries carry no credential or secret that the redaction check
  recognises. Material the check does not recognise is a documented residual, not a denial: an
  unconditional "no entry ever contains a secret" is not assertable by any check, so it is not
  asserted here.

## 5. Scope

**In scope:** the loop prompt and template, iteration contract, backoff and termination, preflight
gate, `ESCALATIONS.md` format and ordering, the declared operator surface, durability
documentation, session reporting, tests.

**Out of scope:** parallel execution of disjoint features (still deliberately unsupported — it
needs a subsystem-disjointness proof first); driving multiple consuming repos; changing what any
gate delivered by orders 1–4 asserts.

**Carve-out (in scope).** This feature ships files that the completed `pdlc-engine-distribution`
feature's distribution and release gates enumerate. Widening those enumerations — and the approved
`pdlc-engine-distribution` tables they must keep agreeing with — so that they cover this feature's
shipped files is in scope; that is the only permitted change to any gate this feature inherits, and
it may not alter what those gates assert about anything else.

## 6. Dependencies

- **BL-01** — Every feature this REQ's `depends-on` names — the four earlier orders plus
  `pdlc-advisory-wave-gate`, whose seam this feature's escalation log must carry — delivered. This
  feature is their integration and has no value before them; in particular AC-1.3 is false without
  `pdlc-merge-phase`.
- **BL-02** — `/loop` available in the runtime with session-scoped semantics, and runtime
  documentation citable for AC-6.1's literals.
- **BL-03** — `docs/_queue/ESCALATIONS.md` format is defined by `pdlc-advisory-tier` BL-04 and
  extended here.

## 7. Obligations

| ID | Obligation | Owner |
|---|---|---|
| O-1 | Name the level and harness that assert AC-1.3's two-report sequence, and whether it runs in CI | TSPEC |
| O-2 | Specify how a non-advisory entry (AC-4.1a) is written and read so the consolidation agent's advisory counts are unchanged by it, and how the operator view distinguishes it | TSPEC |
| O-3 | Specify where the AC-4.3 view's collapsing (AC-4.5) and ordering are computed, given the log stays append-only | TSPEC |
| O-4 | Name the engine readiness command and exit-code contract AC-3.1's preflight consumes | TSPEC |
| O-5 | Own making a refused merge and a pipeline halt append to `docs/_queue/ESCALATIONS.md` (AC-4.1), neither of which appends at HEAD | TSPEC |
| O-6 | **Discharged at v1.6.** Owned deciding whether AC-2.5's state distinction diverges from the sibling config readers' precedent, or that precedent moves. AC-2.5 now decides it directly — the distinction extends the precedent and needs no divergence — so the row is retained as a citable record and downstream citations of O-6 re-point to AC-2.5 | — (discharged) |

## 8. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-LOOP-01 | Parallel execution of disjoint features | Requires a subsystem-disjointness check; without it two pipelines author conflicting changes to the same files. Documented as a future extension since the original `orchestrate-queue` design | Bound — `docs/_queue/QUEUE.md` row 26, `pdlc-loop-automation-followups` (blocked on this feature) |
| D-LOOP-02 | REQ-readiness watcher that proposes queue rows | Backlog idea 3; propose-only by construction, and it touches the `ready: true` latch, so it needs its own design | Bound — `docs/_queue/QUEUE.md` row 26, `pdlc-loop-automation-followups` (blocked on this feature) |
| D-LOOP-03 | Desktop scheduled task / Routine packaging | Documented as a path (AC-6.2); packaging it is separate work | Bound — `docs/_queue/QUEUE.md` row 26, `pdlc-loop-automation-followups` (blocked on this feature) |
| D-LOOP-04 | Multi-repo loop driving | One real consumer today | Bound — `docs/_queue/QUEUE.md` row 26, `pdlc-loop-automation-followups` (blocked on this feature) |
| D-LOOP-05 | Monitor-tool build/test watching inside phases | Backlog idea 6; applies inside `se-implement`, not at loop level | Bound — `docs/_queue/QUEUE.md` row 26, `pdlc-loop-automation-followups` (blocked on this feature) |
