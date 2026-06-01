# Plan — Rewrite `orchestrate-dev` as a Dynamic Workflow

**Status:** Proposal for review
**Author:** generated for the `orchestrator-dynamic-workflow` branch
**Concerns:** `pdlc/skills/orchestrate-dev/SKILL.md`
**Reference:** [Dynamic workflows](https://code.claude.com/docs/en/workflows), [Subagents in the SDK](https://code.claude.com/docs/en/agent-sdk/subagents)

---

## 1. Why this is worth doing

`orchestrate-dev` today is a **skill** — a prompt that the *interactive Claude* follows turn by turn. Claude is the orchestrator: it decides what to spawn next, every cross-review file it reads lands in its context, and every loop iteration burns main-conversation tokens. The pipeline runs ~7 phases, most with a 1–5 iteration evaluator-optimizer loop and 2 parallel reviewers per iteration — easily **30–60 subagent invocations** for one feature, all coordinated from a single conversation that grows monotonically.

That is precisely the shape dynamic workflows exist for. Per the docs, a workflow is *"a JavaScript script that orchestrates subagents at scale… the runtime executes it in the background while your session stays responsive."* The plan (loops, branching, gate decisions) moves **into code**, intermediate results live in **script variables** instead of Claude's context, and the orchestration itself becomes **repeatable and resumable**.

| Dimension | Skill (today) | Workflow (proposed) |
|---|---|---|
| Who decides next step | Claude, turn by turn | The script |
| Where cross-reviews live | Main context window | Script variables / agent return values |
| Repeatable unit | The prose instructions | The orchestration itself |
| Scale ceiling | A few agents per turn before context bloat | Up to 16 concurrent, 1,000 per run |
| Interruption | Restarts the turn | Resumable within the session |

The orchestrator is also the *cleanest* candidate in the repo to convert, because its own `Scope` already says it **does no direct authoring itself** — it only reads docs, judges approval, and dispatches agents. The "read docs / judge approval" part is the only piece that needs rethinking under workflow constraints (see §3); everything else maps almost one-to-one onto script control flow.

---

## 2. The target model in one picture

```
/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md   ← user types this; REQ is already user-approved
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│  workflows/orchestrate-dev.<ext>  (the script the runtime runs)│
│                                                                │
│  state = { feature, branch, artifacts:{}, postmortems:[] }     │
│                                                                │
│  reviewLoop(REQ,  reviewers:[se,te], optimizer:pm)             │
│  create+reviewLoop(FSPEC, ...)                                 │
│  create+reviewLoop(TSPEC, ...)                                 │
│  if (decisionsWarranted) create+reviewLoop(DECISIONS, ...)     │
│  create+reviewLoop(PLAN, ...)                                  │
│  create+reviewLoop(PROPERTIES, ...)                            │
│  implement(PLAN)            ← was tech-lead; now the script    │
│  implementPropertiesTests()                                    │
│  reviewLoop(IMPLEMENTATION, reviewers:[pm,te], optimizer:se)   │
│  harvest()                                                     │
│                                                                │
│  return finalReport(state)  ← only this lands in context       │
└──────────────────────────────────────────────────────────────┘
```

The worker skills (`pm-author`, `se-review`, `te-author`, `se-implement`, `harvest-learnings`, …) **stay exactly as they are** and remain the single source of truth. Each workflow agent is spawned with a prompt that says *"Invoke `/pdlc:<skill>` to …"* (and/or preloads the skill via the agent definition's `skills` field). We are rewriting the **conductor**, not the **players**.

---

## 3. The hard constraints — and what each one forces

The workflow runtime imposes four constraints (from the docs' *Behavior and limits* table). Three are free wins; two force real design changes. **These are the crux of the migration — read this section before the rest.**

### 3.1 No direct filesystem or shell access *from the script*
> *"Agents read, write, and run commands. The script coordinates the agents."*

**Impact — the gate redesign.** Today the orchestrator's gate check *reads the `CROSS-REVIEW-*.md` files itself* and greps the `Recommendation:` line (SKILL.md §2b, Loop Mechanics → Approval Rules). A workflow script **cannot read files**. So the verdict must come back as the **agent's return value**, not be scraped from disk afterward.

Fix: every reviewer agent's prompt gets a mandatory trailer:

> *Write your full cross-review to `docs/{feature}/CROSS-REVIEW-…md` as today, **then** end your final message with exactly one line: `VERDICT: Approved | Approved with minor changes | Needs revision` followed by a JSON block of `{high:N, medium:N, low:N}` finding counts.*

The script branches on that returned line. The on-disk cross-review file is still written (harvest needs it), but the **gate decision flows through the return channel**, which is the only parent↔agent channel a workflow has. This is a small, backward-compatible addition to the four `*-review` skills (`se-review`, `te-review`, `pm-review`) — their existing `## Recommendation` section already produces exactly this verdict; we just also echo it as the final line.

### 3.2 No mid-run user input
> *"Only agent permission prompts can pause a run. For sign-off between stages, run each stage as its own workflow."*

**Impact — two human gates in today's pipeline disappear inside a run:**

1. **REQ approval.** Already fine: the REQ is *user-approved before* `/pdlc:orchestrate-dev` is invoked — it's a precondition, not a mid-run gate.
2. **tech-lead's batch-plan approval.** Today `tech-lead` *"presents the batch execution plan to the user… execution never begins without explicit `approve`"* (tech-lead SKILL §5). A workflow **cannot stop to ask.** Resolution options, in preference order:
   - **(Recommended) Auto-approve the computed batch plan inside the run**, and emit it to the progress view for observability. The dependency graph → topological batching is deterministic; the human approval was a safety checkpoint, not a creative one. Losing the interactive *"modify Batch 3"* affordance is the real cost.
   - **Split the pipeline at the implementation boundary** into two workflows: `orchestrate-spec` (REQ→PROPERTIES, ends with the approved PLAN) and `orchestrate-impl` (implementation→harvest). The user reviews the PLAN between them. This honors the docs' explicit guidance (*"run each stage as its own workflow"*) and preserves a genuine human gate, at the cost of one manual hand-off.

   → **Decision needed from the reviewer.** Default in this plan: one workflow with auto-approved batching, because the headline win is unattended end-to-end execution. The two-workflow split is documented as the fallback if the batch-approval gate must stay human.

### 3.3 Subagents cannot spawn subagents
> *"Subagents cannot spawn their own subagents."* (Subagents SDK doc)

**Impact — `tech-lead` collapses into the script.** Today the orchestrator invokes `tech-lead`, and `tech-lead` *itself* dispatches parallel `se-implement` agents. In a workflow that nesting is illegal: the workflow script is the only orchestrator, and the agents it spawns are leaves. So **the script absorbs tech-lead's logic** — parse PLAN, build the DAG, topologically batch, dispatch `se-implement` leaf agents per batch, gate on tests. `tech-lead`'s *prose* becomes the spec for a block of script (`implement()` in §5), not a skill the workflow calls. The `tech-lead` / `tech-lead-python` skills remain in the repo for standalone/interactive use; the workflow just doesn't route through them.

This is arguably a *simplification*: the two-level orchestrator→tech-lead→implementer tree flattens to script→implementer, removing a whole layer of agent-prompt plumbing.

### 3.4 Scale limits (free wins)
16 concurrent agents, 1,000 per run. The pipeline's max fan-out is 2 reviewers per loop + ≤5 implementation phases per batch — comfortably under 16. Total invocations for a feature (~30–60) is far under 1,000. The existing *"max 5 phases per sub-batch"* cap in tech-lead stays as-is and sits inside the runtime's 16-wide ceiling. **No change needed.**

---

## 4. Phase-by-phase mapping

Each pipeline phase maps to a script construct. `reviewLoop` is one reusable function; the per-phase rows below are just its parameters.

| Phase (SKILL.md step) | Workflow construct | Parallelism | Loop / branch |
|---|---|---|---|
| Parse inputs (Step 1) | Sync code: derive `feature` from path. *Cannot stat the file* (no FS) — first agent confirms REQ exists & is non-empty, returns `ok`/`halt`. | — | guard: halt run if not ok |
| R — REQ review (Step 2) | `reviewLoop(doc=REQ, reviewers=[se-review,te-review], optimizer=pm-author)` | 2 reviewers via `Promise.all` | `while` until both pass, cap 5 |
| F — FSPEC (Step 3) | `create(pm-author, FSPEC)` then `reviewLoop(FSPEC, [se,te], pm-author)` | 2 | cap 5 |
| T — TSPEC (Step 4) | `create(se-author, TSPEC)` then `reviewLoop(TSPEC, [pm,te], se-author)` | 2 | cap 5 |
| D — DECISIONS (Step 4.5) | `if (decisionsWarranted(state))` → create+reviewLoop; `else` push skip-note to `state` | 2 (only if taken) | conditional branch |
| P — PLAN (Step 5) | `create(se-author, PLAN)` then `reviewLoop(PLAN, [pm,te], se-author)` | 2 | cap 5 |
| PR — PROPERTIES (Step 6) | `create(te-author, PROPERTIES)` then `reviewLoop(PROPERTIES, [pm,se], te-author)` | 2 | cap 5 |
| I — Implementation (Step 7) | `implement(PLAN)` — **absorbed tech-lead**: parse → DAG → topo-batch → dispatch `se-implement` leaves per batch → merge → test gate | ≤5 per batch via `Promise.all` | per-batch test gate; halt on fail |
| PT — PROPERTIES tests (Step 8) | single `se-implement` agent: implement every property test, full suite green | — | halt on test fail |
| CR — Final code review (Step 9) | `reviewLoop(IMPLEMENTATION, [pm,te], optimizer=se-implement)` | 2 | cap 5 |
| H — Harvest (Step 9.5) | `harvest()` agent: write LEARNINGS, then delete `CROSS-REVIEW-*` | — | guard hook still enforces order (§6) |
| Done (Step 10) | `return finalReport(state)` — the only thing that re-enters Claude's context | — | — |

### The `reviewLoop` primitive (the heart of the rewrite)

```
async function reviewLoop({ doc, reviewers, optimizer, feature }) {
  for (let n = 1; n <= 5; n++) {
    const suffix = n === 1 ? "" : `-v${n}`;
    // §3.1: verdict comes back in the RETURN VALUE, not from reading files
    const results = await Promise.all(reviewers.map(r =>
      runAgent({
        skill: r.skill,                    // e.g. "se-review"
        prompt: reviewPrompt(r, doc, feature, suffix),
      })                                   // resolves to { verdict, high, medium }
    ));
    if (results.every(passing))            // Approved | Approved w/ minor → pass
      return { converged: true, iterations: n };
    await runAgent({                       // optimizer addresses ALL versions' feedback
      skill: optimizer,
      prompt: optimizerPrompt(doc, feature),
    });
  }
  // §7: non-convergence → write postmortem (via an agent), then signal halt
  await runAgent({ skill: optimizer, prompt: postmortemPrompt(doc, feature) });
  return { converged: false };
}
```

This single function replaces the hand-rolled "2a parallel review / 2b gate check / 2c optimizer / loop back" prose that is currently **copy-pasted across six phases** of SKILL.md. That de-duplication is itself a quality win — six chances for the loop logic to drift become one.

---

## 5. What stays, what moves, what's new

**Unchanged (no edits):**
- `pm-author`, `se-author`, `te-author`, `se-implement` (+ language supplements), `harvest-learnings`, `consolidate-learnings` — invoked as today.
- All hooks (`guard-harvest-before-delete`, `check-scope-field`, `nudge-consolidation`). Hooks fire on **agent** tool calls, and the workflow's agents run in `acceptEdits` and inherit the tool allowlist — so the harvest guard and scope-field nudge keep working unchanged (§6).
- The `docs/{feature}/…` artifact convention and file-naming (`CROSS-REVIEW-{role}-{doc}[-v{N}].md`, `POSTMORTEM-*`, `LEARNINGS-*`).

**Small, backward-compatible edits (the verdict trailer, §3.1):**
- `se-review`, `te-review`, `pm-review`: add the *"end your final message with `VERDICT: …` + finding-count JSON"* instruction. The verdict they already compute is unchanged; we just also surface it on the return channel.

**Moved into the script:**
- `tech-lead`'s DAG parse / topological batching / parallel dispatch / merge / test gate (§3.3). The `tech-lead` skill file stays for interactive use but is off the workflow path.
- All gate decisions and loop control (was prose in `orchestrate-dev/SKILL.md`).

**New files:**
- `workflows/orchestrate-dev.<ext>` — the workflow script (saved via `/workflows` → `s`, or hand-authored into `.claude/workflows/`).
- `orchestrate-dev/SKILL.md` is **rewritten** from a step-by-step runbook into a short *"this pipeline is implemented as the `orchestrate-dev` workflow; here is its contract, inputs, and the human-gate trade-off"* pointer doc, so interactive users and the Ptah engine still have a readable spec.

---

## 6. Persistence, worktrees, and the harvest guard

Three correctness concerns the rewrite must not regress:

1. **Artifact persistence across worktrees.** Today reviewers/implementers run in `isolation: "worktree"` and their output must merge onto `feat-{feature}` before later phases (esp. harvest) read it. SKILL.md §9.5 already flags this as a **gating prerequisite** ("artifacts written in a worktree must survive merge before harvest reads them"). Under a workflow, the *script* never reads those files — but the **harvest agent** does, and so do later reviewer agents reading prior `CROSS-REVIEW-*` versions. **The migration must pin down the branch/worktree model:** either (a) agents commit directly to `feat-{feature}` (simplest, since file edits auto-approve and there's no interactive merge step to lose), or (b) the script sequences a merge agent between phases. **Recommendation: option (a)** — drop per-agent worktree isolation for the doc-authoring/review phases (they edit disjoint `docs/` files), and keep isolation only for the parallel `se-implement` code phases where concurrent edits to source can collide, with a merge agent after each batch. This must be settled before Phase H is enabled (matching the existing caveat in SKILL.md §9.5).

2. **The harvest-before-delete guard still fires.** It's a `PreToolUse: Bash` hook keyed on `rm` of `CROSS-REVIEW-*`. Workflow agents run Bash through the same hook pipeline, so the guard *"blocks deletion until `LEARNINGS-{feature}.md` exists"* keeps protecting us for free. The `harvest()` agent's prompt keeps the existing ordering: **write+push LEARNINGS first, then delete.**

3. **`Scope:` field nudge.** The `check-scope-field` `PostToolUse: Write|Edit` hook likewise fires on agent writes. No change.

---

## 7. Error handling & non-convergence under the new model

| Scenario (SKILL.md error table) | Workflow handling |
|---|---|
| REQ missing/empty | First guard agent returns `halt`; script returns an error report and stops. (Script can't `stat` — §3.1.) |
| Reviewer/optimizer agent fails | The runtime surfaces the failed agent; the loop function checks for a failure result and aborts the run with a report. (Use the progress view's per-agent error.) |
| Loop limit (5) reached | Script calls the optimizer to **write the `POSTMORTEM-{phase}-{feature}.md`** (an agent does the file write), then returns non-converged → run halts with the unresolved findings in the final report. Same semantics as today. |
| tech-lead halt → now: a batch fails | `implement()`'s per-batch test gate returns failure → **no partial merge**, run halts, failing tests in the report. (Inherits tech-lead §6–7 rules.) |
| Merge conflict | Merge agent reports conflict → abort, halt. |

Note one semantic shift: today a human watches each phase's progress block and can `Ctrl-C`. In a workflow the human watches the **`/workflows` progress view** (phases, agent counts, tokens) and can pause/stop/restart agents with `p`/`x`/`r`, but cannot inject corrections mid-phase. The progress-reporting prose in SKILL.md §"Progress Reporting" is replaced by the runtime's built-in view; the final report (Step 10) is the in-context deliverable.

---

## 8. Proposed repository layout

```
pdlc/
  workflows/
    orchestrate-dev.<ext>          # NEW — the workflow script (the rewrite)
  skills/
    orchestrate-dev/
      SKILL.md                     # REWRITTEN — short pointer/contract doc
      WORKFLOW-MIGRATION-PLAN.md   # this file
    se-review/SKILL.md             # + VERDICT trailer
    te-review/SKILL.md             # + VERDICT trailer
    pm-review/SKILL.md             # + VERDICT trailer
    tech-lead*/SKILL.md            # unchanged; off the workflow path
    (all other skills unchanged)
```

> **Open item — script language & exact runtime API.** Dynamic workflows are in *research preview*; the public docs describe the *model* (a JS script the runtime runs, agents spawned with `AgentDefinition`-shaped config, `Promise.all` for parallelism, script-held loops/branches/state) but **do not yet publish the exact in-script primitives** (the global/import surface for `runAgent`/phase declaration). The `Workflow` tool's input/output schema is referenced as living in the TS SDK reference but is not yet filled in there. **Therefore the skeletons in §4 are illustrative pseudocode.** The concrete script should be produced the supported way — describe the task to Claude Code with the word *"workflow"* (or `/effort ultracode`), let it author the script against the live runtime, verify the run, then **save it via `/workflows` → `s` into `.claude/workflows/`** (project scope, shared on clone). This plan defines *what the script must do and the contracts it must honor*; the final API binding is confirmed at authoring time against the installed Claude Code version (≥ v2.1.154).

---

## 9. Migration strategy (incremental, low-risk)

1. **Land the verdict trailer** in the three `*-review` skills (§3.1). Backward-compatible — interactive `orchestrate-dev` ignores the extra line; no behavior change today. *Ship this first; it's independently safe.*
2. **Settle the two open decisions** (reviewer sign-off): (a) one workflow w/ auto-approved batching **vs** two-stage split at the PLAN boundary (§3.2); (b) worktree model — direct-commit docs vs. merge-agent (§6).
3. **Author the workflow script** for the spec phases only (R→PROPERTIES) via the `workflow` keyword; verify on a throwaway feature; save to `.claude/workflows/`.
4. **Extend with `implement()` + PROPERTIES tests + final review + harvest** (the tech-lead absorption, §3.3), gated on the §6 worktree decision and the existing Phase-H prerequisite.
5. **Rewrite `orchestrate-dev/SKILL.md`** into the pointer/contract doc and update the repo `CLAUDE.md` tables (skills table note + a new "Workflows" row) and `pdlc/README.md`.
6. **Keep the old skill runbook** in git history; the workflow and the slimmed skill coexist (the skill explains the contract, the workflow executes it). The Ptah engine integration (`ptah.config.json → skill_path`) is unaffected for the worker skills; decide separately whether Ptah should invoke the workflow or keep its own orchestration.

Steps 1–2 are reviewable now and unblock everything else. Nothing in steps 3–6 deletes a working capability before its replacement is verified.

---

## 10. Acceptance criteria for the finished rewrite

- A single `/orchestrate-dev docs/{f}/REQ-{f}.md` invocation runs the full pipeline as a background workflow; the session stays responsive; only the final report enters context.
- Each review phase converges via the in-script `reviewLoop` with the 5-iteration cap and writes a `POSTMORTEM` on non-convergence — **behavior-identical** to today's gate/loop semantics.
- All `CROSS-REVIEW-*`, `POSTMORTEM-*`, `DECISIONS-*`, `LEARNINGS-*` artifacts land in `docs/{feature}/` with today's naming.
- The harvest guard and scope-field hooks still fire on agent actions; LEARNINGS is written before any cross-review deletion.
- Worker skills are unchanged except the additive verdict trailer; the workflow routes through them via `/pdlc:<skill>` prompts (single source of truth preserved).
- The fan-out never exceeds 16 concurrent agents; a full feature stays well under the 1,000-agent cap.
- The two lost human gates are explicitly accounted for (auto-approved-with-observability, or split-workflow), and the choice is documented in the rewritten `SKILL.md`.

---

## 11. Decisions requested from the reviewer

1. **Implementation-batch sign-off (§3.2):** auto-approve the computed batch plan inside one workflow (default), or split into `orchestrate-spec` + `orchestrate-impl` to keep a human gate at the PLAN boundary?
2. **Worktree model (§6):** direct-commit to `feat-{feature}` for doc phases + isolation only for parallel code phases (default), or full per-agent worktree isolation with explicit merge agents throughout?
3. **Ptah engine (§9.6):** should the Ptah engine eventually call the workflow, or keep its existing orchestration and only consume the (unchanged) worker skills?
4. **Script location/scope:** `.claude/workflows/` in-repo (shared, recommended) confirmed as the home, mirrored under `pdlc/workflows/` for the plugin? (Plugins don't yet have a documented workflow-bundling path — flag for follow-up.)
