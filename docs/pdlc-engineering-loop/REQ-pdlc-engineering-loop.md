---
feature: pdlc-engineering-loop
ready: false
depends-on: [pdlc-workflow-distribution, pdlc-merge-phase, pdlc-advisory-tier, pdlc-consolidation-agent]
---

# REQ — pdlc-engineering-loop

| Field | Value |
|---|---|
| Upstream | `docs/design/MASTER-PLAN-engineering-loop.md` (§2, §6, order 5) |
| Downstream | — |
| Cross-Reviews | — |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-07-27 |

> **Scope in one line.** The `/loop` driver, its per-repo prompt, and the single escalation file
> that makes the residual operator surface reviewable — turning four separately-closed breaks into
> one loop that runs from a `ready: true` REQ to a merged PR to an improved pipeline without a
> human turn in between.

## 1. Problem

Orders 1–4 close each break individually. None of them makes the loop *run*.

Today `/loop run /pdlc:orchestrate-queue` is documented in the `orchestrate-queue` SKILL and works,
but it only ever completes one useful iteration before stalling: iteration 1 delivers a PR and sets
`awaiting-merge`; iteration 2 sees an `in-progress`/`awaiting-merge` row, reports `blocked`, and
every subsequent iteration does the same until a human merges. The loop spins without progressing.

With the merge phase in place that stall disappears, but three things are still missing before an
unattended loop is safe to leave running:

**No termination discipline.** A loop that reports `idle` forever burns tokens at a fixed
interval. It needs to widen and stop.

**No single place to look.** Escalations from five advisory seams, halted pipelines, and refused
merges each surface in a different report at a different time. The operator's promised experience
— "read escalations, approve or reject" — requires one file, not five report objects scattered
across past loop iterations.

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

- **AC-1.1** — Given a consuming repo, Then `.claude/loop.md` defines the default loop behavior so
  a bare `/loop` does the right thing, and a template ships at `pdlc/templates/loop.md`.
- **AC-1.2** — Given one iteration, Then it runs `/pdlc:orchestrate-queue` exactly once and
  returns, preserving the existing one-feature-per-invocation contract.
- **AC-1.3** — Given an iteration returns `ran` with `mergeStatus: merged`, Then the next
  iteration may pick up a dependent feature with no human turn between them. This is the property
  the whole plan exists to produce, and it is asserted end-to-end by test.
- **AC-1.4** — Given an iteration returns `blocked`, Then the loop reports the blocking feature
  and reason and **stops**. A serial queue that is blocked will stay blocked until a human acts;
  polling it is waste.
- **AC-1.5** — Given an iteration returns `halted`, Then the loop stops and surfaces the halt.

### REQ-LOOP-02 — Backoff and termination

- **AC-2.1** — Given consecutive `idle` outcomes, Then the interval widens on a configured
  schedule rather than polling at a fixed rate.
- **AC-2.2** — Given a configured number of consecutive `idle` outcomes, Then the loop ends and
  says why in one line.
- **AC-2.3** — Given the loop ends for any reason, Then it reports what it delivered in the
  session: features merged, features halted, escalations raised.
- **AC-2.4** — Given `no-queue`, Then the loop ends immediately.

### REQ-LOOP-03 — Preflight safety gate

- **AC-3.1** — Given an iteration begins, Then it first verifies that no managed workflow script is
  `stale` or `missing` (`pdlc-workflow-distribution` REQ-DIST-04), and refuses to run when one is.
- **AC-3.2** — Given the working tree of the consuming repo has uncommitted changes on the default
  branch, Then the loop refuses to start and says so. The pipeline authors specs against the
  working tree; running it over uncommitted work produces specs grounded in something not in any
  commit.
- **AC-3.3** — Given the preflight refuses, Then it names the condition and the remediation, and
  the refusal is distinguishable from `idle`.

AC-3.2 is not hypothetical for the current consumer: a consuming repo accumulating uncommitted
planning or scratch work on its default branch is the normal state between working sessions, and
it is exactly the state in which an unattended loop would start.

### REQ-LOOP-04 — The escalation file

- **AC-4.1** — Given `docs/_queue/ESCALATIONS.md`, Then every advisory escalation
  (`pdlc-advisory-tier` REQ-ADV-10), every refused merge (`pdlc-merge-phase` REQ-MERGE-03/04),
  and every pipeline halt appends an entry there.
- **AC-4.2** — Given an entry, Then it carries: what the operator must decide (one sentence,
  first), feature, source (seam or phase), the diagnosis and its evidence, the proposed action if
  any, timestamp, and status ∈ {`open`, `resolved`, `rejected`}.
- **AC-4.3** — Given entries, Then open entries are ordered by **how many queued features they
  block**, so the operator's first entry is the one unblocking the most work.
- **AC-4.4** — Given an entry is resolved or rejected, Then it records who decided and when, and
  is retained rather than deleted — the decision record is the input to
  `pdlc-consolidation-agent`'s confidence calibration.
- **AC-4.5** — Given the same condition recurs for the same feature, Then it updates the existing
  entry with an occurrence count rather than appending a duplicate.
- **AC-4.6** — Given the file is absent, Then it is created on first escalation.

### REQ-LOOP-05 — The declared operator surface

- **AC-5.1** — Given the shipped documentation, Then it states the complete set of things
  requiring a human, and that set is exactly: (1) flipping `ready: true` on a REQ; (2) approving
  any PR that changes `pdlc/skills/**` or `pdlc/workflows/**`; (3) resolving open escalations;
  (4) product- and business-judgment calls outside the pipeline's scope.
- **AC-5.2** — Given a condition arises that requires a human and is **not** in that set, Then it
  is a defect in this feature, not an expected mode — an unlisted stop means the surface was
  understated.
- **AC-5.3** — Given item (1), Then no configuration makes `ready: true` settable by any agent.
  The draft-protection latch is permanent.

AC-5.2 is deliberately strong. The purpose of enumerating the operator surface is so that
surprises are treated as bugs rather than absorbed as normal.

### REQ-LOOP-06 — Durability

- **AC-6.1** — Given the documentation, Then it records that `/loop` is session-scoped, fires only
  while a session is open and idle, and expires after 7 days.
- **AC-6.2** — Given a cadence needs to outlive that, Then the documentation gives the promotion
  path: a Desktop scheduled task (local files, machine must be on) for pipeline work, or a Routine
  (cloud, fresh clone) for consolidation.
- **AC-6.3** — Given a Routine, Then the documentation states plainly that `orchestrate-dev` is a
  poor fit for one — the pipeline authors specs against the working tree, and a Routine has none.

### REQ-LOOP-07 — Session reporting

- **AC-7.1** — Given the loop runs, Then each iteration emits one line: outcome, feature, and
  merge status.
- **AC-7.2** — Given the loop ends, Then a summary reports features merged with their PR URLs,
  open escalation count, and the next actionable item.

## 4. Non-functional requirements

- **NFR-1** — The loop introduces no new authority. Every gate, guard and prohibition from orders
  1–4 holds unchanged inside it; the loop only decides *when* to invoke the queue.
- **NFR-2** — The loop never edits `docs/_queue/QUEUE.md` itself; only Phase MERGE writes status.
- **NFR-3** — The loop never sets `ready: true` (AC-5.3), under any configuration.
- **NFR-4** — Stopping is always cheap and always safe: `Esc` at any point leaves a consistent
  state, because every iteration is a complete queue invocation.
- **NFR-5** — Escalation entries never contain credentials or secrets.

## 5. Scope

**In scope:** the loop prompt and template, iteration contract, backoff and termination, preflight
gate, `ESCALATIONS.md` format and ordering, the declared operator surface, durability
documentation, session reporting, tests.

**Out of scope:** parallel execution of disjoint features (still deliberately unsupported — it
needs a subsystem-disjointness proof first); driving multiple consuming repos; changing any gate
delivered by orders 1–4.

## 6. Dependencies

- **BL-01** — Orders 1–4 delivered. This feature is their integration and has no value before
  them; in particular AC-1.3 is false without `pdlc-merge-phase`.
- **BL-02** — `/loop` available in the runtime with the documented session-scoped semantics.
- **BL-03** — `docs/_queue/ESCALATIONS.md` format is defined by `pdlc-advisory-tier` BL-04 and
  extended here.

## 7. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-LOOP-01 | Parallel execution of disjoint features | Requires a subsystem-disjointness check; without it two pipelines author conflicting changes to the same files. Documented as a future extension since the original `orchestrate-queue` design | — |
| D-LOOP-02 | REQ-readiness watcher that proposes queue rows | Backlog idea 3; propose-only by construction, and it touches the `ready: true` latch, so it needs its own design | — |
| D-LOOP-03 | Desktop scheduled task / Routine packaging | Documented as a path (AC-6.2); packaging it is separate work | — |
| D-LOOP-04 | Multi-repo loop driving | One real consumer today | — |
| D-LOOP-05 | Monitor-tool build/test watching inside phases | Backlog idea 6; applies inside `se-implement`, not at loop level | — |
