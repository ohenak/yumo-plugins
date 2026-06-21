---
name: orchestrate-queue
description: Serial PDLC queue driver. Picks the next ready REQ from a human-curated queue, runs a readiness check, and delegates the full pipeline to orchestrate-dev. Designed to be driven by /loop for unattended, dependency-respecting feature delivery.
---

# orchestrate-queue — Pointer/Contract

This skill delegates to a workflow script. It does not run the pipeline itself.

It wraps `orchestrate-dev`: where that skill runs the pipeline for **one** REQ you
name, this one picks the **next ready** REQ from a queue and runs `orchestrate-dev`
for it. Manual single-REQ runs via `/pdlc:orchestrate-dev` remain fully supported —
this wrapper drives that skill, it does not replace it.

---

## Why a queue is needed

The PDLC pipeline is **not stateless**: each FSPEC/TSPEC/PLAN is authored against the
codebase as it exists when the pipeline fires. Two REQs that touch the same subsystem
must therefore run **in a dependency-respecting order, one at a time** — otherwise the
second feature's specs are written against a base that is missing the first feature's
work. The queue encodes that order; this skill enforces serial, ready-gated pickup.

---

## Invocation Contract

```
/pdlc:orchestrate-queue [docs/_queue/QUEUE.md]
```

- Input: optional path to the queue file. Defaults to `docs/_queue/QUEUE.md`.
- Behavior: processes **at most one** ready REQ per invocation, then returns.
- Returns: a `QueueReport` object in main context:
  - `outcome`: `ran` | `halted` | `idle` | `blocked` | `no-queue`
  - `picked`: feature run this pass (if any)
  - `remaining`: pending entries left after this pass
  - `pipelineReport`: the `orchestrate-dev` FinalReport (when a pipeline ran)
  - `skipped`: candidates skipped this pass, with reasons

---

## Driving it with /loop

The intended use is a self-paced Claude loop. While a session is open:

```
/loop run /pdlc:orchestrate-queue
```

Each iteration picks up the next ready REQ, runs the pipeline to a PR, and returns.
Between iterations a human reviews and merges PRs — which is what unblocks dependent
features (see status lifecycle below). Claude widens the interval when the queue goes
quiet and ends the loop when nothing remains. `Esc` stops it; the loop also expires
after 7 days (session-scoped). For scheduling that survives session close, promote to
a Desktop scheduled task or a Routine — note Routines run on a fresh clone with no
local working tree.

---

## The two control surfaces

Ordering is declared in **two complementary places** — a high-level queue you scan at a
glance, and per-REQ frontmatter you set while reviewing that specific REQ. The effective
dependency set is the **union** of both.

### 1. `docs/_queue/QUEUE.md` — the high-level order

A markdown table. Columns are matched by header name (case-insensitive); extra columns
are ignored. A ready-to-copy starter lives at `pdlc/templates/QUEUE.md` — copy it to
`docs/_queue/QUEUE.md` in the consuming repo and replace the example rows.

```markdown
# PDLC Queue

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | done           | auth-refresh    | docs/auth-refresh/REQ-auth-refresh.md       | —              |
| 2 | pending        | notification-v2 | docs/notification-v2/REQ-notification-v2.md | auth-refresh   |
| 3 | pending        | mobile-push     | docs/mobile-push/REQ-mobile-push.md         | notification-v2 |
```

`Depends-On` is a comma/space list of feature names, or `—`/`-`/`none`/blank for none.

### 2. REQ frontmatter — local control + draft protection

```yaml
---
feature: notification-v2
ready: true                 # ← GATE. Absent or non-true ⇒ never auto-picked.
depends-on: [auth-refresh]  # union with the QUEUE Depends-On column
---
```

`ready: true` is the safety latch: an unfinished REQ can sit in the queue as `pending`
and the loop will **skip it** (logging "not marked ready") until you flip the flag while
reviewing it. This is what prevents an incomplete REQ from being picked up accidentally.

---

## Status lifecycle

The skill transitions a feature's `Status` cell automatically:

```
pending ──pick──▶ in-progress ──pipeline success──▶ awaiting-merge ──(human merges PR)──▶ done
                       │
                       └──pipeline halts / throws──▶ halted
```

- **`in-progress`** is written **before** the pipeline runs, so a crash leaves a visible
  marker. While any entry is `in-progress`, the skill refuses to pick up new work (serial
  guarantee) until a human resolves it.
- **`awaiting-merge`** — success, but the work is on a `feat-{feature}` branch / PR, **not
  yet in the base**. The skill never sets `done`.
- **`done`** is set by a **human** after merging the PR. This is deliberate: a dependent's
  readiness check looks for the dependency's code in the base, and only a real merge puts
  it there. Marking `done` is the human's acknowledgement that the merge happened.

---

## Selection algorithm (per invocation)

1. Load and parse the queue. If missing → `no-queue`.
2. If any entry is `in-progress` → `blocked` (don't start new work).
3. Take `pending` entries in queue order. For each, in order:
   a. Read the REQ. Missing file or `ready != true` → **skip** (logged), try next.
   b. Compute `dependsOn` = union(QUEUE Depends-On, REQ `depends-on`).
   c. Run **Phase-0 readiness triage** (an `se-author` agent that knows the current
      implementation): verify every declared dependency is actually present in the base.
      - `ready` → **pick this one**, run the pipeline, stop.
      - `blocked` → skip (a dependency isn't merged yet), try next.
      - `needs-human` (also the default when the verdict is missing) → skip, try next.
   d. **Re-grounding gate (stale-REQ check).** A queued REQ is authored against the
      codebase as it stood at authoring time; if any dependency merged *after* that, the
      REQ's grounding is presumed stale. When a declared dependency is present in the base
      (step c `ready`) **and** merged after the REQ's authoring date, the triage must
      re-diff the REQ against HEAD before the pipeline enters: every load-bearing
      `file:line` citation, **and** every claimed dependency surface — accessor names,
      return types, migration numbers, schema/serialization conventions, reuse-pattern
      targets. If any dependency-surface claim is stale, emit **`needs-human`** (not
      `ready`) with the specific stale claims, and skip. Rationale: three consecutive
      queue features entered the pipeline with stale REQ premises (a dependency's
      migration number, accessor signature, and reuse target all changed on merge) that
      were caught only at REQ review — burning a review iteration the readiness check
      should have pre-empted. (See `docs/_decisions/DECISIONS-pdlc-process.md` DEC-01 in
      the consuming repo.) Citations are drift-prone hints: re-confirm symbols against
      HEAD, do not trust line literals.
4. If no candidate became ready → `idle` with the list of skip reasons.

---

## Concurrency

Serial by design — one pipeline per invocation, and the `in-progress` guard prevents a
second pickup. Parallel execution of independent (disjoint-subsystem) features is a
deliberate future extension; it is **not** supported here. Do not add it without a
subsystem-disjointness check, or two pipelines may author conflicting changes to the
same files.

---

## Workflow Script Path

- Canonical plugin source: `pdlc/workflows/orchestrate-queue.js`
- Runtime-loaded consumer copy: `.claude/workflows/orchestrate-queue.js`

The consumer copy is a direct copy of the plugin source (no build step), managed
manually until a formal `pdlc install` mechanism exists — same convention as
`orchestrate-dev`.

---

## Artifact Conventions

- Queue file: `docs/_queue/QUEUE.md` (human-curated).
- Per-feature artifacts under `docs/{feature}/` — see CLAUDE.md §pdlc specifics.
- This skill creates no new per-feature artifacts of its own; everything downstream is
  produced by `orchestrate-dev` and its sub-skills.
