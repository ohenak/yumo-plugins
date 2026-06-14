# Loop / scheduled-automation ideas (backlog)

Status: **ideas only — not built.** Captured for later pickup.

These are candidate automations layered on Claude Code's scheduled-task primitives
(`/loop`, `CronCreate`, the Monitor tool, Routines, Desktop scheduled tasks). The
first one — a serial queue driver — has shipped as the `orchestrate-queue` skill;
everything below is unbuilt.

Reference: https://code.claude.com/docs/en/scheduled-tasks

Key constraints to keep in mind for all of these:
- `/loop` and `CronCreate` tasks are **session-scoped**: they fire only while a
  Claude Code session is open and idle, and expire after 7 days. For durability,
  promote to a **Desktop scheduled task** (local files, machine must be on) or a
  **Routine** (cloud, no local working tree — runs on a fresh clone).
- The PDLC pipeline is **not stateless** — specs are authored against the codebase
  at fire time — so any automation that fires pipelines must respect ordering and
  serial execution (this is why `orchestrate-queue` exists).

---

## 1. ✅ Serial queue driver (SHIPPED as `orchestrate-queue`)

Picks the next ready REQ from `docs/_queue/QUEUE.md` in dependency order and runs
`orchestrate-dev` for it, one feature per `/loop` iteration. Listed here only to
anchor the ideas below against what already exists.

---

## 2. Post-PR maintenance loop ("babysit the branch")

**Idea.** After a feature's pipeline lands a PR, a loop tends that PR until it's
mergeable: pull failing CI logs and push minimal fixes, address new review comments
and resolve threads, surface merge conflicts.

**Sketch.**
```
/loop check the feat-{feature} PR; if CI is red pull the failing job log, diagnose,
and push a minimal fix; if new review comments arrived, address each and resolve the
thread; if green and quiet, say so in one line.
```

**Notes / open questions.**
- Strong fit for a project-level `.claude/loop.md` so a bare `/loop` does the right
  thing in the consuming repo.
- Interaction with `orchestrate-queue`: the queue sets a feature to `awaiting-merge`
  and waits for a human to set `done`. This loop could *help* a human get to
  mergeable faster, but it must NOT auto-merge or auto-set `done` — merge remains the
  human signal that unblocks dependents.
- Scope guard: only push fixes that continue work the transcript already authorized.

---

## 3. REQ-readiness watcher → enqueue (the "front door")

**Idea.** Instead of humans hand-editing `docs/_queue/QUEUE.md`, a loop watches for
new/edited `REQ-*.md` files. When a REQ flips to `ready: true` and has no queue row,
it proposes a queue entry (with a dependency guess for human confirmation).

**Notes / open questions.**
- Keep it **propose-only** — a human approves the queue insertion and the declared
  deps. Auto-inserting risks running pipelines in the wrong order.
- Dependency inference is lossy; treat the agent's suggestion as a draft, not truth.
- Could be folded into `orchestrate-queue` as an optional "scan & propose" pre-phase
  rather than a separate loop.

---

## 4. Scheduled consolidate-learnings ritual

**Idea.** `consolidate-learnings` is currently manual + periodic. A low-frequency
scheduled task (e.g. weekly) could detect stale `LEARNINGS-*.md` files and run the
consolidation pass — still propose-only, with a human approving every promotion.

**Sketch.**
```
CronCreate: "0 9 * * 1" (Mondays 9am) → run /pdlc:consolidate-learnings in propose mode
```

**Notes / open questions.**
- The existing `nudge-consolidation` SessionStart hook already reminds; this would
  *act* on the reminder on a cadence instead of waiting for a human.
- Durability matters here (weekly cadence > 7-day session expiry) → favors a Routine
  or Desktop scheduled task over `/loop`.
- Must never auto-commit promotions — preserve the human-approval invariant.

---

## 5. Parallel execution of disjoint features

**Idea.** `orchestrate-queue` is deliberately serial. Features that touch fully
disjoint subsystems could run concurrently to cut wall-clock time.

**Notes / open questions.**
- Requires a **subsystem-disjointness check** before dispatch — either explicit
  per-feature `subsystem:` tags in the queue, or an agent that proves two features'
  file footprints don't overlap. Without it, two pipelines can author conflicting
  changes to the same files.
- Concurrency ceiling: respect the runtime agent cap; `orchestrate-dev` already
  fans out up to ~7 agents per feature, so parallel features multiply that.
- This is the documented "future extension" already flagged in
  `skills/orchestrate-queue/SKILL.md` — promote it here when picked up.

---

## 6. Monitor-tool build/test watcher (polling-free)

**Idea.** For long-running builds or test suites inside a pipeline phase, use the
**Monitor tool** (streams a background script's output line-by-line) instead of
re-running a polling prompt on an interval. More token-efficient and more responsive.

**Notes / open questions.**
- Best applied inside `se-implement` / the test-gate phases rather than as a
  top-level loop.
- Monitor is not restored on session resume — fine for in-session use, not for
  durable scheduling.

---

## 7. One-shot scheduled pipeline kickoff

**Idea.** Natural-language one-shot scheduling to fire a pipeline at a known time,
e.g. once a REQ is expected to be finalized.

**Sketch.**
```
at 3pm, run /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md
```

**Notes / open questions.**
- Trivial to use today; documented here mainly so it's not forgotten as an option.
- Pick a fire minute that isn't `:00`/`:30` to dodge scheduler jitter if exact
  timing matters.

---

## Picking one up

When promoting an idea to real work, route it through the normal PDLC flow: write a
`REQ-{feature}.md` under `docs/{feature}/`, then either run `/pdlc:orchestrate-dev`
directly or add it to `docs/_queue/QUEUE.md`. Update this file to mark the idea
shipped (as item 1 shows).
