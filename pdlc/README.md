# pdlc — Product Development Lifecycle Plugin

A Claude Code plugin that runs a full spec-driven development pipeline with multi-role
cross-reviews and parallel TDD implementation. It is the **canonical source of truth** for
the PDLC skills: this repo installs it for interactive use, and the **Ptah engine**
(`apps/orchestrator/ptah`) references the same skill files via its `skill_path` config — so
there is one set of prompts, not three drifting copies.

## Skills

Invoked as `/pdlc:<skill>`:

| Skill | Role |
|---|---|
| `orchestrate-queue` | Serial queue driver — picks the next ready REQ and runs `orchestrate-dev` for it (drives the whole queue via `/loop`) |
| `orchestrate-dev` | Pipeline orchestrator (REQ → FSPEC → TSPEC → PLAN → PROPERTIES → IMPL) |
| `pm-author` / `pm-review` | Product Manager — authors REQ/FSPEC; reviews from product lens |
| `se-author` / `se-review` | Senior Engineer — authors TSPEC/PLAN; reviews from technical lens |
| `se-implement` | Implements a PLAN phase via strict TDD (loads TS/Python supplement) |
| `te-author` / `te-review` | Test Engineer — authors PROPERTIES; reviews from testing lens |
| `tech-lead` / `tech-lead-python` | Parses PLAN, dispatches parallel se-implement agents |

## Model selection

The workflows pin a model per phase (passed to the runtime via the `agent()` `model` option):

| Work | Model | Why |
|---|---|---|
| `orchestrate-dev` Phase I implementation batches (`se-implement`) | **Sonnet** | High-throughput, well-specified TDD work — the PLAN/PROPERTIES already constrain it |
| `orchestrate-dev` — every other phase (reviews, spec authoring, DoD, harvest, PR/CI) | **Opus** | Reasoning-heavy authoring and evaluation |
| `orchestrate-queue` Phase-0 readiness triage | **Sonnet** | Bounded lookup against git/working-tree state |
| `orchestrate-queue` → `orchestrate-dev` delegation | **Opus** (dev pins its own) | The delegated pipeline applies its own per-phase pinning above |

Both workflows default their agent calls to the phase model and let an explicit call-site `model` win, so downstream helpers inherit the default. Constants live at the top of `workflows/orchestrate-dev.js` (`MODEL_DEFAULT` / `MODEL_IMPLEMENTATION`) and `workflows/orchestrate-queue.js` (`MODEL_QUEUE`).

## Convention contract (what installing pdlc expects of a repo)

- Artifacts live under `docs/{feature}/`: `REQ → FSPEC → TSPEC → PLAN → PROPERTIES`
  (later: `DECISIONS`, `LEARNINGS`).
- Project-level context lives under `docs/_constraints/` and `docs/_decisions/`.
- A run starts from `/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md` on branch
  `feat-{feature}`.
- For unattended, multi-feature delivery, copy `templates/QUEUE.md` to
  `docs/_queue/QUEUE.md`, then run `/loop run /pdlc:orchestrate-queue` — it picks the next
  ready REQ in dependency order, one feature per iteration. See
  `skills/orchestrate-queue/SKILL.md` for the queue format and status lifecycle.

## Operator conventions

Changes that touch an **entry point, a repo-default config, or a shared artifact writer**
go through the queue (or, minimally, a standalone `dod-verify` pass) — not an ad-hoc
`feat(...)` commit. The two worst gaps in the post-mortem that motivated the
integration-boundary criterion shipped exactly that way: in ad-hoc commits with no
REQ/PLAN/DoD, so nothing ever challenged the adjacent surfaces they silently falsified.

## Fresh-clone bootstrap

The runtime artifacts are generated, so a fresh clone of this repo has none. Two commands, **in this
order**, bring one to a working state — no published release, no installed plugin, no
`${CLAUDE_PLUGIN_ROOT}`, no network:

```bash
node pdlc/workflows/build-runtime.mjs     # generates pdlc/workflows/dist/ and distribution-manifest.json
pdlc/hooks/scripts/sync-workflows.sh      # copies those artifacts into the consumer's .claude/workflows/
```

The order is not interchangeable: the sync step copies what the build step produced, so running it
first has nothing to copy. The second command is invoked by **bare path** — no `bash` or `sh`
prefix; the shipped hook scripts carry their execute bit so that it works. Confirm the result with
`pdlc/hooks/scripts/sync-workflows.sh --check`, which exits 0 once every row is in sync.

### Worktrees

A worktree Claude Code creates for you is a supported consumer: the repo-root `.worktreeinclude`
lists `.claude/workflows/`, so the generated artifacts come across with the worktree.

A worktree created by hand with `git worktree add` is **not** a supported consumer. Its
`.claude/workflows/` is empty, so workflow invocations there fail with "workflow not found", while
the drift tooling resolves the main worktree and reports that tree as in sync — a green report that
does not describe the tree the runtime reads. Per-worktree consumer state is deferred to D-DIST-07
(queue row 6); until it lands, work from the main worktree or from a Claude-created one.

## Local development

```bash
claude --plugin-dir ./pdlc           # load for one session (dev)
claude plugin validate ./pdlc --strict
```

## Install in another repo

`pdlc` is catalogued in the **`ptah`** marketplace at the repo root
(`.claude-plugin/marketplace.json`). From any repo:

```bash
claude plugin marketplace add ohenak/yumo   # GitHub shorthand; clones + caches the catalog
claude plugin install pdlc@ptah             # install the plugin from the ptah marketplace
# then, inside that repo: /pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md
```

> The catalog and plugin must be on the branch the marketplace resolves (default: `main`).
> Until this work merges, install from the local checkout instead:
> `claude plugin marketplace add /path/to/yumo && claude plugin install pdlc@ptah`.
> When `pdlc` is later extracted to its own repo, only the marketplace `source` changes.

## Ptah engine integration

The engine reads skill prompts by filesystem path (`ptah.config.json` → `agents[].skill_path`).
Point each entry at this plugin's `skills/<name>/SKILL.md`; no engine code change is required.
