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
  - `driftReport`: present whenever the drift gate (below) had something to say —
    always on `blocked`, and on some proceeding outcomes too — describing what the gate saw

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

## Drift gate (runs before the queue is even read)

Every invocation opens with a check of the recorded workflow-drift state — the same record
the plugin's `check-workflow-drift` SessionStart hook writes. This runs **before** `QUEUE.md`
is loaded, so a stale or unverified consumer copy of the workflow scripts can stop the whole
pass without any REQ being selected, dispatched, or even considered.

- **Blocking.** Seven of the ten precedence rows block; rows 2, 8 and 9 proceed (see FSPEC
  AC-4.1's precedence table; rows are evaluated in order and the first match wins):
  - **row 1** — the drift record is missing, unreadable, or not shape-valid;
  - **row 3** — a recorded write failure;
  - **row 4** — a baseline that is not `resolved` (degraded or unresolved);
  - **row 5** — any managed row still `unknown`;
  - **row 6** — any managed row still `missing` or `stale`;
  - **row 7** — a retired artifact still present in the consumer copy. This one blocks **even
    when every managed row is `in-sync`**, so an otherwise-clean tree can still be stopped here;
  - **row 10** — the terminal floor: a shape-valid record matching none of rows 1-9. It exists so
    an unforeseen state fails closed rather than falling through as clean.

  On any of these the invocation returns immediately with
  `outcome: "blocked", reason: "Drift gate row N: …"` and runs no pipeline. The reason names
  which precedence row fired. **Operator action:** bring the consumer copy back in sync —
  `pdlc/hooks/scripts/sync-workflows.sh` (or `--force` when the reason names a hand-edited or
  unverified row) — then re-invoke `/pdlc:orchestrate-queue`. The gate does not modify
  `docs/_queue/QUEUE.md`; nothing there needs to change to unblock it.
- **Opt-out.** A repo can disable the gate via `.claude/pdlc.config.json` →
  `distribution.checkEnabled: false`. With that set, the gate does not block on drift; it
  still surfaces that it skipped evaluation (per AC-4.3) rather than proceeding silently, and
  selection continues as normal below. Use this only when you've deliberately decided the
  drift check shouldn't gate this repo's queue — not as a routine way past a `blocked` result.
- **Otherwise-proceeding drift.** A drift state that only shows an editor-touched or
  no-provenance consumer file (not `missing`/`stale`) does not block the gate; the queue
  proceeds to selection, and the returned report still names what it saw rather than treating
  it as clean.

---

## Selection algorithm (per invocation)

0. Run the drift gate above. `blocked` → return immediately; opt-out or a non-blocking drift
   state → continue.
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

## Model Selection

The queue driver's own agent work — the **Phase-0 readiness triage** — runs on **Sonnet** (`MODEL_QUEUE` in `pdlc/workflows/orchestrate-queue.js`). It is a bounded lookup against git history and the working tree, not deep reasoning.

The delegated pipeline is invoked via `orchestrate-dev`'s `main()` **without** overriding its agent, so it applies its **own** per-phase model pinning — **Opus for every phase except its Phase I implementation batches** (which run on Sonnet). See `orchestrate-dev`'s SKILL.md § Model Selection. In short: queue triage = Sonnet; the triggered `orchestrate-dev` pipeline = Opus (minus its own Phase I).

---

## Concurrency

Serial by design — one pipeline per invocation, and the `in-progress` guard prevents a
second pickup. Parallel execution of independent (disjoint-subsystem) features is a
deliberate future extension; it is **not** supported here. Do not add it without a
subsystem-disjointness check, or two pipelines may author conflicting changes to the
same files.

---

## Workflow Script Path

- Canonical plugin source (ES module, unit-tested): `pdlc/workflows/orchestrate-queue.js`
- Built artifact (tracked, shipped): `pdlc/workflows/dist/orchestrate-queue.bundle.js`
- Consumer runtime copy (untracked, installed by `sync-workflows.sh`): `.claude/workflows/orchestrate-queue.bundle.js`

The bundle is **generated** by `node pdlc/workflows/build-runtime.mjs` — do not edit it.
It inlines both the queue module and `orchestrate-dev` (the queue calls it in-process),
plus the runtime adapter. Rebuild after any workflow source change; `--check` exits
non-zero when stale. See `orchestrate-dev`'s SKILL.md § Workflow Script Path for why the
build step exists (workflow-runtime sandbox restrictions) and how injection works.

Distribution follows the same mechanism as `orchestrate-dev`: `build-runtime.mjs` writes
`pdlc/workflows/dist/` (artifacts plus `distribution-manifest.json`), and
`pdlc/hooks/scripts/sync-workflows.sh` installs the consumer's untracked runtime copy.

---

## Artifact Conventions

- Queue file: `docs/_queue/QUEUE.md` (human-curated).
- Per-feature artifacts under `docs/{feature}/` — see CLAUDE.md §pdlc specifics.
- This skill creates no new per-feature artifacts of its own; everything downstream is
  produced by `orchestrate-dev` and its sub-skills.
