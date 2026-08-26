---
name: orchestrate-queue
description: Serial PDLC queue driver. Delegates to `pdlc queue`, the published `@kaneho/pdlc-engine` CLI, which picks the next ready REQ from a human-curated queue and runs the full pipeline for it. Designed to be driven by /loop for unattended, dependency-respecting feature delivery.
---

# orchestrate-queue — Pointer/Contract

This skill delegates to `@kaneho/pdlc-engine`. It does not run the pipeline itself.

It wraps `orchestrate-dev`: where that skill runs the pipeline for **one** REQ you
name, this one picks the **next ready** REQ from a queue and runs the pipeline for
it. Manual single-REQ runs via `/pdlc:orchestrate-dev` remain fully supported.

---

## Invocation Contract

```
/pdlc:orchestrate-queue [docs/_queue/QUEUE.md]
```

- Input: optional path to the queue file. Defaults to `docs/_queue/QUEUE.md`.
- Delegates to: `pdlc queue`.
- Behavior: processes **at most one** ready REQ per invocation, then returns.
- Returns: the CLI's `QueueReport`, relayed verbatim.

---

## Driving it with /loop

The intended use is a self-paced Claude loop. While a session is open:

```
/loop run /pdlc:orchestrate-queue
```

Each iteration picks up the next ready REQ, runs the pipeline to a PR, and returns.
Between iterations a human reviews and merges PRs — which is what unblocks dependent
features. Claude widens the interval when the queue goes quiet and ends the loop when
nothing remains. `Esc` stops it; the loop also expires after 7 days (session-scoped).

---

## Directive protocol (session side)

Each `/loop` iteration is exactly one `pdlc queue` invocation, and the session is the
waiting agent — the CLI's decision logic is pure, only the wait is agent-performed:

1. **Iteration 1** invokes `pdlc queue --loop-state new`. The reserved literal `new`
   means "start a session": it runs preflight once and keeps every non-loop invocation
   of `pdlc queue` byte-identical.
2. The CLI's response carries a `loop` block naming a directive:
   - `stop` — a reason drawn from the closed ten-member stop-reason enumeration. The
     session ends here and prints the summary. Do not re-invoke.
   - `continue` — a `waitMinutes` value and a `nextState` token.
3. On `continue`: the session performs the wait (`waitMinutes`, `0` meaning re-invoke
   immediately with no interval), then **echoes `nextState` back unmodified** as the
   next iteration's `--loop-state` value: `pdlc queue --loop-state <nextState>`. It also
   reports the wait it just took — `--wait-requested <the directive's waitMinutes>` and
   `--wait-actual <minutes actually waited>` — because the session is the waiting party and
   the engine cannot observe the interval itself. A host that woke early, late or not at all
   is never an error; the pair is reported and the iteration proceeds.
4. On `stop`: the session halts the loop. It never invents its own state token and
   never durably persists `nextState` — losing the transcript loses the token, which is
   indistinguishable from a fresh session by design.

`--loop-state` is an internal protocol detail this skill supplies on every iteration; an
operator running `/loop run /pdlc:orchestrate-queue` never types the flag.

---

## Resolving an escalation

Open escalations live in `docs/_queue/ESCALATIONS.md`, and each open item in the loop's
rendered operator view carries its own `entryId`. To resolve or reject one:

```
pdlc decide --entry <entryId> --outcome <resolved|rejected> --by <who> [--rationale <text>]
```

The command appends a decision block naming the entry it decides; it never rewrites the
decided entry's own block, and it changes no seam's escalation counts. The view derives
closure from the decision at read time, so the record is retained rather than deleted.

---

## The two control surfaces

Ordering is declared in **two complementary places** — a high-level queue you scan at a
glance (`docs/_queue/QUEUE.md`, a markdown table with `Order`/`Status`/`Feature`/
`REQ Path`/`Depends-On` columns), and per-REQ frontmatter (`ready: true` plus
`depends-on:`) you set while reviewing that specific REQ. The effective dependency set
is the **union** of both. A ready-to-copy starter queue lives at
`pdlc/templates/QUEUE.md`.

---

## Status lifecycle

The CLI transitions a feature's `Status` cell automatically:
`pending → in-progress → awaiting-merge → done`, with `halted` reachable from
`in-progress` on a pipeline stop. Every status write is committed to git immediately —
`git commit -m "chore(queue): {feature} → {status}" -- docs/_queue/QUEUE.md` — so a halt
or a crash leaves a visible, durable marker rather than living only in an unsaved
working tree.

---

## Artifact Conventions

- Queue file: `docs/_queue/QUEUE.md` (human-curated).
- Per-feature artifacts under `docs/{feature}/` — see CLAUDE.md §pdlc specifics.
- This skill creates no new per-feature artifacts of its own; everything downstream is
  produced by `orchestrate-dev` and its sub-skills.

---

## Resolution Ladder

The invocation resolves `pdlc queue` through:

1. A globally installed `pdlc` binary, if present on `PATH`.
2. `npm install -g @kaneho/pdlc-engine`, then re-invoke `pdlc queue`.
3. `npx --no-install pdlc queue`, if a local install already exists.

If none resolves, this skill refuses and reports the exact command it could not run: `npm install -g @kaneho/pdlc-engine`. It does not fall back to hand-running any workflow module.

---

## Launch-failure detection (E-20(b))

The engine binary can fail in two distinguishable ways, and this skill's session side
is the only place the second one is ever observed:

- **`invocation-threw` (E-04).** A *running* engine process starts, then throws or
  exits with a readable, parseable failure report. `pdlc queue` itself catches this
  in-process and emits `stop` with reason `invocation-threw`.
- **E-20(b): launch failure — the engine binary is absent.** No process ever starts, so
  nothing in-process ever runs to catch anything. This skill detects the condition
  session-side, from the invocation attempt itself, by one of:
  - `command not found`
  - a non-zero exit code of exactly `127`
  - a spawn error naming `ENOENT`
  - any other case where the invocation exits without producing a parseable `loop`
    block or report

  None of these shapes is a run failure the engine reported; they are a **launch**
  failure the session observed. On any of them, this skill stops the session with
  reason `preflight-refused` under **both** `loop.preflight` policies (`"strict"` and
  `"off"` alike — `"off"` cannot resurrect a process that never started), and prints
  the following install remediation as a literal, fixed sentence — not the engine's own
  `STARTUP_REMEDIATION` (which addresses a present-but-misconfigured engine, E-20(a)):

  > `pdlc` was not found or failed to launch. Install it with
  > `npm install -g @kaneho/pdlc-engine` and re-run `/pdlc:orchestrate-queue`.

This keeps the two failure families textually distinguishable in every transcript:
`invocation-threw` always names a report the engine produced; the E-20(b) launch-failure
message never does, because none exists to name.
