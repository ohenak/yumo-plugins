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
