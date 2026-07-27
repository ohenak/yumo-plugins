# Master plan — the engineering loop (PDLC Loop 5)

| Field | Value |
|---|---|
| Author | Claude (Opus 5) |
| Date | 2026-07-27 |
| Status | draft — operator review pending |
| Scope | `yumo-plugins/pdlc` — the pipeline that builds everything else |
| Sibling | `regime-ledger-research/docs/design/MASTER-PLAN-wheel-room-company.md` §Loop 5 |

---

## 0. The load-bearing observation

The Wheel Room master plan describes four business loops. All four are *built* by a fifth loop
that plan does not describe, because it lives in a different repository: the PDLC pipeline in
`yumo-plugins/pdlc`. Every REQ in the business queue will be delivered by
`/pdlc:orchestrate-queue` driving `/pdlc:orchestrate-dev`.

That fifth loop is currently **open in four places**. Each break has the same signature: the
pipeline reaches a point requiring judgment, stops, and waits for a human who is not there. The
work does not fail — it *idles*, which is worse, because idling is silent and produces no alert.

This plan closes it.

---

## 1. Where the loop is open today

### Break 1 — merge (the latency break)

`orchestrate-queue` sets a feature to `awaiting-merge` and stops. The SKILL is explicit that this
is deliberate: "The skill never sets `done` … Marking `done` is the human's acknowledgement that
the merge happened," because a dependent feature's readiness check looks for the dependency's code
*in the base branch*, and only a real merge puts it there.

The reasoning is correct. The conclusion — that a human must do it — is not. What the invariant
actually requires is that `done` is written *only after the code is genuinely in the base*. A
workflow phase that merges the PR and then writes `done` satisfies that invariant exactly as well
as a human does, and satisfies it in seconds rather than in days.

The cost of the break is not one merge. It is that **every dependent feature in the queue stays
blocked for the duration of the human's absence**, and the queue is a serial chain, so the delay
compounds down the whole chain.

### Break 2 — learning (the improvement break)

`consolidate-learnings` reads per-feature LEARNINGS and promotes patterns. When a learning says
*a skill prompt itself should change*, the skill writes
`docs/_decisions/CONSOLIDATION-PROPOSAL-{date}.md` — a markdown table — **in the consuming repo**.
The skills it proposes to change live in `yumo-plugins/pdlc/skills/`.

Nothing carries the proposal across that repository boundary. The proposal is a note to a human
who must read it, switch repos, and hand-apply the edit. In practice this means the pipeline
accumulates evidence about its own failure modes and then does nothing with it. The loop that is
supposed to make the pipeline better is the one loop that is entirely manual.

### Break 3 — distribution (the silent break)

`SKILL.md` files load live from the installed plugin — `CLAUDE.md` states this explicitly: "edit
them in interactive Claude Code sessions and the engine picks the change up automatically (no
copies to sync)."

**Workflow scripts do not.** Both `orchestrate-dev/SKILL.md` and `orchestrate-queue/SKILL.md`
record the same convention: the canonical source is `pdlc/workflows/*.js`, the runtime-loaded copy
is `.claude/workflows/*.js` in the consumer repo, and "until a formal `pdlc install` mechanism
exists, this copy is managed manually."

So a workflow improvement can land in `yumo-plugins`, be merged, be celebrated, and **never
execute anywhere**, because no consumer copied it. The two copies happen to be identical today
(verified 2026-07-27 against `regime-ledger-research`), which is luck, not a mechanism. This is
the most dangerous of the four breaks because it is the only one with no symptom: the loop *looks*
closed.

### Break 4 — advisory halts (the attention break)

Every judgment call in the pipeline is a full stop with no attempt at resolution:

| Seam | Today's behavior |
|---|---|
| Queue Phase-0 triage returns `needs-human` | skip the candidate, try the next |
| Stale-REQ re-grounding gate fires | `needs-human`, skip |
| DoD verify→remediate exhausts 3 iterations | pipeline halts |
| `ship-pr` rebase conflicts | pipeline halts, branch left unchanged |
| CI red on the raised PR | pipeline halts |

In each case the operator arrives to an unexplained stop and must reconstruct the situation from
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
   │        └─▶ CONSOLIDATION (Fable 5, on cadence)                   ← NEW
   │                ├─ project-level: DOMAIN-CONSTRAINTS / DECISIONS in the consuming repo
   │                └─ pipeline-level: PR against yumo-plugins        ← NEW (cross-repo)
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

## 3. What Fable 5 is for

Fable 5 becomes the **advisory tier**: a third model rung alongside the existing
`MODEL_DEFAULT = "opus"` (reasoning phases) and `MODEL_IMPLEMENTATION = "sonnet"` (Phase I
batches), plus `MODEL_QUEUE = "sonnet"` in the queue driver.

Its job is precisely the work at Break 4 — the judgment calls that currently halt. It is
**not** there to make the pipeline faster or cheaper. It is there to convert *stops* into either
resolutions or **pre-analyzed escalations**.

The distinction that makes this safe:

> Fable does not remove the operator from the loop. It removes the **investigation** from the
> operator's turn. The operator's involvement becomes approve-or-reject on a decision that has
> already been reasoned through, with its evidence attached — not "why did this stop?"

Three invariants govern every advisory seam:

1. **The advisory tier may never widen its own envelope.** What it is allowed to resolve
   unattended is declared in configuration and is not inferable, negotiable, or extendable by the
   agent at runtime.
2. **The advisory tier may never convert a blocking verdict into a passing one.** It cannot mark
   DoD passed, cannot weaken a criterion, cannot set `ready: true` on a REQ, cannot declare CI
   green. It may only *fix the underlying cause* and let the existing deterministic gate re-run
   and reach its own verdict.
3. **Every advisory action is recorded.** Seam, inputs, verdict, confidence, action taken or
   escalated — appended to `docs/{feature}/ADVISORY-{feature}.md`. An unrecorded advisory action
   is a defect.

Invariant 2 is the same shape as the discipline the business plan applies to LLMs throughout:
verdicts are computed deterministically, and the model works on prose and diagnosis, never on the
verdict itself.

---

## 4. Decisions

### DEC-E1 — Rebase, never squash

The merge phase uses `gh pr merge --rebase`. The fallback order on failure is
**rebase → merge commit → halt**. Squash is **never used by default** and requires an explicit
configuration opt-in that ships off.

Rationale beyond preference: `se-implement` produces a TDD commit sequence (failing test, then
implementation), `dod-verify` produces versioned `CODE_REVIEW-{feature}-v{N}` remediation commits,
and `harvest-learnings` reads that history. Squashing destroys the per-commit record that the
harvest and any future post-mortem depend on. The preference is load-bearing, not cosmetic.

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

The consolidation agent opens a PR against `ohenak/yumo-plugins` with the concrete edit, instead
of writing a table that a human must transcribe. Never a direct push. The credential is
fine-grained: `contents:write` + `pull_requests:write` on `yumo-plugins` only, **no merge
rights** — merge is DEC-E2's operator gate and no automated identity holds it.

This mirrors `ops-calibration-keeper` in the business plan exactly (NFR-5: "PR-creation
credentials grant no merge rights and the keeper has no write access to the default branch"). Same
problem — an agent proposing changes to the thresholds that govern it — so the same shape of
answer.

### DEC-E5 — Consolidation must be falsifiable

Every promoted change records the **failure mode it targets**, and the next consolidation pass
reports whether that failure mode recurred in the intervening features. A consolidation ritual
that never checks whether its own promotions worked is unfalsifiable, and an unfalsifiable
improvement process drifts toward ceremony. This is the difference between "continuously
enhancing" and "continuously editing."

---

## 5. Feature roadmap

| Order | Feature | Why here |
|---|---|---|
| 1 | `pdlc-workflow-distribution` | First, because every later improvement is invisible without it (Break 3). It is also the smallest. |
| 2 | `pdlc-merge-phase` | The largest single latency win, and the enabler for an unattended `/loop` (Break 1). |
| 3 | `pdlc-advisory-tier` | Converts the five halt seams into resolutions or pre-analyzed escalations (Break 4). Depends on 2 for the merge-time advisory seam. |
| 4 | `pdlc-consolidation-agent` | Cross-repo learning promotion (Break 2). Depends on 3 for the advisory model rung and on 1, since a promotion that cannot be distributed is not a promotion. |
| 5 | `pdlc-engineering-loop` | The `/loop` driver, `.claude/loop.md`, and the escalation queue that makes the residual operator surface a single reviewable file. Last, because it is the integration of 1–4. |

Order 1 before order 2 is deliberate and slightly counter-intuitive: the merge phase is the more
valuable feature, but it is a *workflow script change*, and shipping a workflow script change into
a distribution channel known to be manual is how a fix gets merged and never runs.

---

## 6. The residual operator surface

The loop is not intended to reach zero human involvement, and a design claiming it did would be
lying. After all five features, the operator's engineering-loop involvement is exactly four
things:

1. **Flip `ready: true` on a REQ.** This is the draft-protection latch and it stays human
   permanently. It is the one signal that says "I have read this and I intend it to be built."
   Automating it would mean an unfinished thought gets implemented.
2. **Approve any PR that changes the pipeline itself** (DEC-E2). Unconditional.
3. **Resolve escalations that fell outside the advisory envelope** — read
   `docs/_queue/ESCALATIONS.md`, each entry carrying the advisory analysis, and approve or reject.
4. **Business-judgment calls** — the `OQ-*` class in the Wheel Room plan. These are not
   engineering decisions and no amount of pipeline automation touches them.

Items 1 and 4 are inputs to the loop; items 2 and 3 are its only stopping points. Everything
between a `ready: true` REQ and a merged PR runs unattended.

---

## 7. Known constraints

- **`/loop` is session-scoped.** It fires only while a session is open and idle, and expires after
  7 days. For continuity beyond that, promote to a Desktop scheduled task (local files, machine
  must be on) or a Routine (cloud, fresh clone, no local working tree — note the PDLC pipeline
  authors specs against the working tree, so a Routine is a poor fit for `orchestrate-dev` and a
  reasonable one for the consolidation cadence).
- **The pipeline is not stateless.** Specs are authored against the codebase as it exists at fire
  time. This is why the queue is serial and why the merge phase matters so much: it is what makes
  the *next* feature's specs correct.
- **Bootstrapping.** These five features modify the pipeline that builds them. Order 1 and 2 in
  particular change `orchestrate-dev.js` while `orchestrate-dev` is running it. The consumer copy
  is loaded at invocation, so an in-flight run uses the pre-change script; the risk is a run
  started *during* the edit window. Ship pipeline changes between queue iterations, never during
  one.

---

## 8. Open questions

- **OQ-E1** — Is `fable` a valid model alias for the workflow runtime's `agent()` `model` option?
  The existing constants use bare aliases (`"opus"`, `"sonnet"`, `"haiku"`). The alias for Fable 5
  is unverified. `pdlc-advisory-tier` BL-01 makes this a startup-validated configuration value
  rather than a hardcoded string in twenty dispatch sites, so a wrong guess fails loudly at
  startup instead of silently downgrading.
- **OQ-E2** — Should the advisory tier's CI-fix seam (A5) be allowed to push commits to a feature
  branch after DoD passed? It fixes the branch *after* the Definition of Done gate has already
  cleared it. Current design: yes, but the fix triggers a DoD re-verify rather than inheriting the
  earlier pass.
- **OQ-E3** — Cadence for the consolidation agent. The existing `nudge-consolidation` hook fires
  at ≥5 un-consolidated LEARNINGS. Weekly, threshold-driven, or both?
- **OQ-E4** — Should `pdlc-engineering-loop` drive more than one consuming repo? Today
  `regime-ledger-research` is the only real consumer, but the escalation queue and loop prompt are
  per-repo by construction.
