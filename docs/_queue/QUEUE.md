# PDLC Queue — yumo-plugins

Serial, dependency-respecting feature queue driven by `/pdlc:orchestrate-queue`.
The driver picks the next **ready** entry (lowest `Order` first) whose dependencies are
merged into the base, sets it `in-progress`, runs `orchestrate-dev`, then leaves it
`awaiting-merge`. A human sets `done` after merging the PR. `ready: true` in the REQ
frontmatter is the pickup gate; the `Status` cell tracks lifecycle.

> **This queue is the pipeline's own queue.** Every feature here modifies the pipeline that
> executes it. See §Bootstrapping below — this queue has one constraint no consumer queue has.

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | pending | pdlc-workflow-distribution | docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md | — |
| 2 | pending | pdlc-merge-phase | docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md | pdlc-workflow-distribution |
| 3 | pending | pdlc-advisory-tier | docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md | pdlc-merge-phase |
| 4 | pending | pdlc-consolidation-agent | docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md | pdlc-workflow-distribution, pdlc-advisory-tier |
| 5 | pending | pdlc-engineering-loop | docs/pdlc-engineering-loop/REQ-pdlc-engineering-loop.md | pdlc-workflow-distribution, pdlc-merge-phase, pdlc-advisory-tier, pdlc-consolidation-agent |

## Priority rationale (2026-07-27 — closing the engineering loop)

Master plan: `docs/design/MASTER-PLAN-engineering-loop.md` (four breaks, DEC-E1..E5, the
residual operator surface, OQ-E1..E4).

**Order 1 before order 2, despite order 2 being the more valuable feature.**
`pdlc-merge-phase` is the largest single latency win — it is what lets an unattended `/loop`
deliver more than one feature. But it is a *workflow script* change, and workflow scripts reach
consumers through a manual copy (`.claude/workflows/*.js`), documented in both orchestrator
SKILLs as "managed manually" until a `pdlc install` mechanism exists. Shipping the merge phase
into that channel is how a fix gets merged, archived, and never runs. Distribution first.

**Order 3 after order 2** because the advisory tier's most valuable seam (A5, CI failure
triage-and-fix) and the merge phase's preconditions interact directly: the fix-and-re-poll loop
feeds the merge gate.

**Order 4 after 1 and 3** because a cross-repo promotion that cannot be distributed is not a
promotion (BL-02), and because the consolidation agent runs on the advisory model rung and
consumes the advisory record that order 3 produces.

**Order 5 last** — it is the integration of 1–4 and has no standalone value; its central
acceptance criterion (AC-1.3, a dependent feature picked up with no human turn) is simply false
without order 2.

**Pickup state.** All five REQs are `ready: true`. Ordering is enforced by the `Depends-On`
column plus each REQ's `depends-on` and the Phase-0 readiness triage — a dependent is skipped
until its dependency is merged and a human has set that row `done`.

## Bootstrapping

These five features modify the pipeline that builds them. Two consequences:

1. **Ship pipeline changes between queue iterations, never during one.** The consumer copy of a
   workflow script is loaded at invocation, so an in-flight run uses the pre-change script; the
   risk window is a run *started* during the edit.
2. **Every PR in this queue trips `pdlc-merge-phase` REQ-MERGE-03's self-modification guard** once
   that feature exists — every one of them touches `pdlc/workflows/**` or `pdlc/skills/**`. That
   is correct and intended: this queue is permanently operator-merged. The guard is not a
   temporary state to be relaxed later; it is the reason the loop can be trusted with everything
   else.

## Blocked / evidence-gated

- **Order 3 (`pdlc-advisory-tier`) carries one unverified premise.** The Fable 5 model alias for
  the workflow runtime's `agent()` `model` option is unconfirmed (master plan OQ-E1); existing
  constants use bare aliases (`"opus"`, `"sonnet"`, `"haiku"`) and no `fable` reference exists
  anywhere in this repo as of 2026-07-27. REQ-ADV AC-1.2/AC-1.3 handle this by construction —
  Fable is the intended and recommended rung, Opus is a *declared* fallback whose use is warned,
  recorded and reported (never a silent downgrade), and AC-1.4 keeps a wholly unresolvable
  configuration a startup failure. Confirming the alias is still the first task of implementation,
  not a discovery to be made at the end.

## Ideas backlog

`docs/ideas/loop-automation-ideas.md` holds unbuilt scheduled-automation ideas. Three of its
items are absorbed by this queue and should be marked shipped when the corresponding feature
lands: idea 2 (post-PR maintenance loop) by `pdlc-advisory-tier` seam A5 plus `pdlc-merge-phase`;
idea 4 (scheduled consolidate-learnings) by `pdlc-consolidation-agent`. Ideas 3, 5, 6 and 7 remain
unbuilt and are bound as deferrals in `pdlc-engineering-loop` §7.
