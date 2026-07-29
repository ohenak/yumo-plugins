# Master plan — closing the PDLC engineering loop

| Field | Value |
|---|---|
| Author | Claude (Opus 5) |
| Date | 2026-07-27 |
| Status | draft — operator review pending |
| Scope | `pdlc` — the delivery pipeline itself |

---

## 0. The load-bearing observation

The PDLC pipeline delivers features for whatever repository consumes it: a queue of `ready`
REQs goes in, reviewed and tested pull requests come out. That is a loop, and it is meant to
run unattended — `orchestrate-queue`'s stated design is to be driven by `/loop` for
"unattended, dependency-respecting feature delivery."

It does not currently close. It is **open in four places**, and each break has the same
signature: the pipeline reaches a point requiring judgment, stops, and waits for a human who is
not there. The work does not fail — it *idles*, which is worse, because idling is silent and
produces no alert.

The consequence is that "unattended" is true only for the span of a single feature. Beyond
that, the pipeline's throughput is bounded by how often its operator sits down, and its quality
is bounded by improvements that get proposed and never applied.

This plan closes the loop. Nothing in it is specific to any consuming repository; the design
holds for any repo that installs this plugin.

---

## 1. Where the loop is open today

### Break 1 — merge (the latency break)

`orchestrate-queue` sets a feature to `awaiting-merge` and stops. The SKILL is explicit that
this is deliberate: "The skill never sets `done` … Marking `done` is the human's acknowledgement
that the merge happened," because a dependent feature's readiness check looks for the
dependency's code *in the base branch*, and only a real merge puts it there.

The reasoning is correct. The conclusion — that a human must do it — is not. What the invariant
actually requires is that `done` is written *only after the code is genuinely in the base*. A
workflow phase that merges the PR and then writes `done` satisfies that invariant exactly as
well as a human does, and satisfies it in seconds rather than in days.

The cost of the break is not one merge. The queue is **serial by design**, so while any entry
sits in `awaiting-merge` the driver reports `blocked` and refuses to pick up new work at all.
**Every dependent feature stays blocked for the duration of the human's absence**, and because
the queue is a chain, the delay compounds down its whole length. On a long backlog this is the
dominant term in time-to-delivery, and it is pure waiting.

There is a second, subtler cost. `awaiting-merge` also requires the human to *edit the queue
file* after merging. A merge that happens without the edit leaves the queue permanently
`blocked` on a feature that is already in base — a stall with a misleading cause.

### Break 2 — learning (the improvement break)

`consolidate-learnings` reads per-feature LEARNINGS and promotes recurring patterns into
project-level `DOMAIN-CONSTRAINTS` and `DECISIONS`. When a learning says *a skill prompt itself
should change*, the skill writes `docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md` — a markdown
table — **in the consuming repo**. The skills it proposes to change live in *this* repo.

Nothing carries the proposal across that repository boundary. It is a note to a human who must
read it, switch repos, and hand-apply each edit. In practice the pipeline accumulates precise
evidence about its own failure modes and then does nothing with it. The one loop meant to make
the pipeline better is the only fully manual one.

The propose-only rule that produces this is itself correct — "agents proposing changes to the
prompts that govern agents must pass through human judgment." But *propose-only* and
*hand-transcribed* are different requirements, and the skill currently enforces the second while
intending only the first.

### Break 3 — distribution (the silent break)

`SKILL.md` files load live from the installed plugin — `CLAUDE.md` states it: "edit them here
and both interactive Claude Code sessions and the Ptah engine pick up the change automatically
(no copies to sync)."

**Workflow scripts did not.** Both `orchestrate-dev/SKILL.md` and `orchestrate-queue/SKILL.md`
recorded the same convention: the canonical source is `pdlc/workflows/*.js`, and the
runtime-loaded copy in the consumer repo had to be refreshed by hand until a formal
`pdlc install` mechanism existed. (`pdlc-workflow-distribution` supplies the mechanism:
`build-runtime.mjs` emits into `pdlc/workflows/dist/`, and `sync-workflows.sh` installs the
consumer's untracked runtime copy.)

So a workflow improvement can land here, be reviewed, merged and archived, and **never execute
anywhere**, because no consumer copied it. Spot-checked 2026-07-27 against a live consuming
repo: the two copies were byte-identical, last synced five days earlier — a manual copy that
happened to be current, not a mechanism that keeps it current.

This is the most dangerous of the four breaks because it is the only one with no symptom: the
loop *looks* closed.

### Break 4 — advisory halts (the attention break)

Every judgment call in the pipeline is a full stop with no attempt at resolution:

| Seam | Today's behavior |
|---|---|
| Queue Phase-0 triage returns `needs-human` | skip the candidate, try the next |
| Stale-REQ re-grounding gate fires | `needs-human`, skip |
| DoD verify→remediate exhausts 3 iterations | pipeline halts |
| `ship-pr` rebase conflicts | pipeline halts, branch left unchanged |
| CI red on the raised PR | pipeline halts |

In each case the operator arrives at an unexplained stop and must reconstruct the situation from
scratch. The expensive thing is not the decision — it is the **investigation preceding** the
decision.

---

## 2. The closed loop

```
QUEUE.md (ready REQ)
   │
   ├─▶ Phase 0 triage ──(needs-human)──▶ ADVISORY ──┬─ resolve in envelope ─┐
   │                                                └─ escalate ──▶ ESCALATIONS.md
   ├─▶ orchestrate-dev pipeline (REQ→…→DoD→Harvest)
   ├─▶ Phase PUB: raise PR, verify CI ──(red)──▶ ADVISORY: triage + minimal fix
   ├─▶ Phase MERGE: rebase-merge, delete branch, write Status: done   ← NEW
   │
   ├─▶ LEARNINGS-{feature}.md
   │        │
   │        └─▶ CONSOLIDATION (advisory model, on cadence)            ← NEW
   │                ├─ project-level: DOMAIN-CONSTRAINTS / DECISIONS in the consuming repo
   │                └─ pipeline-level: PR against this plugin repo    ← NEW (cross-repo)
   │                        │
   │                        └─▶ operator approves (always — self-modification guard)
   │                                │
   │                                └─▶ merged ──▶ DISTRIBUTION check ← NEW
   │                                                    │
   └────────────────────────────────────────────────────┘
              next iteration runs on the improved pipeline
```

The loop is closed when — and only when — the last arrow exists. Everything before it is
throughput; that arrow is *learning*.

---

## 3. The advisory tier

A third model rung is added alongside the existing `MODEL_DEFAULT = "opus"` (reasoning phases),
`MODEL_IMPLEMENTATION = "sonnet"` (Phase I batches), and `MODEL_QUEUE = "sonnet"` (queue
triage): `MODEL_ADVISORY`, a high-capability rung for judgment work.

Its job is precisely the work at Break 4 — the calls that currently halt. It is **not** there to
make the pipeline faster or cheaper. It is there to convert *stops* into either resolutions or
**pre-analyzed escalations**.

The distinction that makes this safe:

> The advisory tier does not remove the operator from the loop. It removes the
> **investigation** from the operator's turn. The operator's involvement becomes
> approve-or-reject on a decision that has already been reasoned through, with its evidence
> attached — not "why did this stop?"

Three invariants govern every advisory seam:

1. **The advisory tier may never widen its own envelope.** What it is allowed to resolve
   unattended is declared in configuration and is not inferable, negotiable, or extendable by
   the agent at runtime.
2. **The advisory tier may never convert a blocking verdict into a passing one.** It cannot mark
   DoD passed, cannot weaken a criterion, cannot set `ready: true` on a REQ, cannot declare CI
   green. It may only *fix the underlying cause* and let the existing deterministic gate re-run
   and reach its own verdict.
3. **Every advisory action is recorded.** Seam, inputs, verdict, confidence, action taken or
   escalated — appended to `docs/{feature}/ADVISORY-{feature}.md`. An unrecorded advisory action
   is a defect.

Invariant 2 is the discipline the pipeline already applies elsewhere: gates compute verdicts,
agents do the work the verdict is about. An agent that can grade its own output is not gated.

---

## 4. Decisions

### DEC-E1 — Rebase, never squash

The merge phase uses `gh pr merge --rebase`. The fallback order on failure is
**rebase → merge commit → halt**. Squash is **never used by default** and requires an explicit
configuration opt-in that ships off.

Rationale beyond preference: `se-implement` produces a TDD commit sequence (failing test, then
implementation), `dod-verify` produces versioned `CODE_REVIEW-{feature}-v{N}` remediation
commits, and `harvest-learnings` reads that history. Squashing destroys the per-commit record
that the harvest and any future post-mortem depend on. The preference is load-bearing, not
cosmetic.

The branch is already rebased onto the latest default branch in Phase DOD step 0, so the
rebase-merge is normally a fast-forward-shaped operation with no surprise.

### DEC-E2 — The self-modification guard

**A PR whose diff touches `pdlc/workflows/**` or `pdlc/skills/**` is never auto-merged.** It is
always escalated to the operator, regardless of CI status, advisory confidence, or configuration
mode.

This is the keystone safety property of the whole design. The engineering loop is permitted to
*propose* changes to itself and to *reason* about them at any depth; it is not permitted to
*enact* them. Without this guard, a single bad consolidation could rewrite the gate that would
have caught it, and the failure would be self-concealing.

### DEC-E3 — Auto-merge requires positive CI evidence

Phase PUB currently treats `ciStatus: no-checks` as a pass — a repository with no configured
checks should not stall the pipeline forever. That is right for *raising* a PR and wrong for
*merging* one.

Merge requires `ciStatus: passed`. `no-checks` escalates by default, under a config flag
(`mergeRequiresCi`, default `true`) that a repo genuinely without CI can turn off deliberately.
"No one checked" and "the checks passed" must not be the same input to an irreversible action.

### DEC-E4 — Consolidation proposals cross the repo boundary as pull requests

The consolidation agent opens a PR against this plugin repository with the concrete edit,
instead of writing a table that a human must transcribe. Never a direct push. The credential is
fine-grained: `contents:write` + `pull_requests:write` on the plugin repository only, **no merge
rights** — merge is DEC-E2's operator gate and no automated identity holds it.

The general principle, which applies well beyond this pipeline: an automated identity that
proposes changes to the rules governing it must not also be able to enact them. Separating
propose-rights from merge-rights at the credential level makes that structural rather than
procedural.

### DEC-E5 — Consolidation must be falsifiable

Every promoted change records the **failure mode it targets**, and the next consolidation pass
reports whether that failure mode recurred in the intervening features. A consolidation ritual
that never checks whether its own promotions worked is unfalsifiable, and an unfalsifiable
improvement process drifts toward ceremony: prompts only grow, nobody can say which growth
helped, and no promotion is ever retired. This is the difference between "continuously
enhancing" and "continuously editing."

---

## 5. Feature roadmap

| Order | Feature | Why here |
|---|---|---|
| 1 | `pdlc-workflow-distribution` | First, because every later improvement is invisible without it (Break 3). It is also the smallest. |
| 2 | `pdlc-merge-phase` | The largest single latency win, and the enabler for an unattended `/loop` (Break 1). |
| 3 | `pdlc-advisory-tier` | Converts the five halt seams into resolutions or pre-analyzed escalations (Break 4). Depends on 2 for the merge-time advisory seam. |
| 4 | `pdlc-consolidation-agent` | Cross-repo learning promotion (Break 2). Depends on 3 for the advisory model rung and on 1, since a promotion that cannot be distributed is not a promotion. |
| 5 | `pdlc-engineering-loop` | The `/loop` driver, the loop prompt template, and the escalation queue that makes the residual operator surface a single reviewable file. Last, because it is the integration of 1–4. |

Order 1 before order 2 is deliberate and slightly counter-intuitive: the merge phase is the more
valuable feature, but it is a *workflow script change*, and shipping a workflow script change
into a distribution channel known to be manual is how a fix gets merged and never runs.

---

## 6. The residual operator surface

The loop is not intended to reach zero human involvement, and a design claiming it did would be
lying. After all five features, the operator's involvement is exactly four things:

1. **Flip `ready: true` on a REQ.** This is the draft-protection latch and it stays human
   permanently. It is the one signal that says "I have read this and I intend it to be built."
   Automating it would mean an unfinished thought gets implemented.
2. **Approve any PR that changes the pipeline itself** (DEC-E2). Unconditional.
3. **Resolve escalations that fell outside the advisory envelope** — read
   `docs/_queue/ESCALATIONS.md`, each entry carrying the advisory analysis, and approve or
   reject.
4. **Product- and business-judgment calls** — the open questions a REQ defers to its operator.
   These are not engineering decisions and no amount of pipeline automation touches them.

Items 1 and 4 are inputs to the loop; items 2 and 3 are its only stopping points. Everything
between a `ready: true` REQ and a merged PR runs unattended.

---

## 7. Known constraints

- **`/loop` is session-scoped.** It fires only while a session is open and idle, and expires
  after 7 days. For continuity beyond that, promote to a Desktop scheduled task (local files,
  machine must be on) or a Routine (cloud, fresh clone, no local working tree — note the PDLC
  pipeline authors specs against the working tree, so a Routine is a poor fit for
  `orchestrate-dev` and a reasonable one for the consolidation cadence).
- **The pipeline is not stateless.** Specs are authored against the codebase as it exists at fire
  time. This is why the queue is serial and why the merge phase matters so much: it is what makes
  the *next* feature's specs correct.
- **Bootstrapping.** These five features modify the pipeline that builds them. Orders 1 and 2 in
  particular change `orchestrate-dev.js` while `orchestrate-dev` is running it. The consumer copy
  is loaded at invocation, so an in-flight run uses the pre-change script; the risk is a run
  started *during* the edit window. Ship pipeline changes between queue iterations, never during
  one.

---

## 8. Open questions

- **OQ-E1** — Which model alias does the workflow runtime's `agent()` `model` option accept for
  the advisory rung? The existing constants use bare aliases (`"opus"`, `"sonnet"`, `"haiku"`).
  `pdlc-advisory-tier` BL-01 makes this a startup-validated configuration value rather than a
  hardcoded string in twenty dispatch sites, so a wrong value fails loudly at startup instead of
  silently downgrading the tier.
- **OQ-E2** — Should the advisory tier's CI-fix seam (A5) be allowed to push commits to a feature
  branch after DoD passed? It fixes the branch *after* the Definition of Done gate has already
  cleared it. Current design: yes, but the fix triggers a DoD re-verify rather than inheriting
  the earlier pass.
- **OQ-E3** — Cadence for the consolidation agent. The existing `nudge-consolidation` hook fires
  at ≥5 un-consolidated LEARNINGS. Weekly, threshold-driven, or both?
- **OQ-E4** — Should a single loop drive more than one consuming repo? The escalation queue and
  loop prompt are per-repo by construction, so multi-repo driving needs its own design rather
  than falling out of this one.
