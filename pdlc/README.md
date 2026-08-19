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
| `dod-verify` | Definition-of-Done verifier — documents stubs, unwired integrations, mock data and coverage gaps in `CODE_REVIEW-{feature}-v{N}.md`; **does not fix** |
| `ship-pr` | Rebases the feature branch (Phase DOD) and raises or reuses the feature PR (Phase PUB) |
| `harvest-learnings` | Distils cross-reviews + post-mortems → LEARNINGS, then deletes the harvested files |
| `consolidate-learnings` | Merges LEARNINGS across features into project-level knowledge |

## Review loop mechanics

- **Round indices are derived, not assumed.** `deriveRoundWindow` computes the round window
  from the `CROSS-REVIEW-{role}-{doc}-v{N}` files actually on disk — synchronous, total, no
  clock, no seam. The loop refuses to overwrite an existing review file, so review history is
  append-only. Five rounds maximum; exhausting them writes a POSTMORTEM and halts.
- **Completeness is structural.** `isComplete` scores each artifact class (`spec`,
  `cross-review`, `code-review`, `LEARNINGS`) and re-dispatches a document that is missing a
  required section, rather than trusting an agent's claim that it finished.
- **A halted phase stays halted until a human clears it.** A POSTMORTEM refuses its phase until
  the file carries `RESOLVED: yes` outside any fenced block. That marker is **human-written
  only** — no agent and no script ever writes it.
- **Authoring is incremental by necessity.** The runtime kills any dispatch that makes no
  progress for 180 s, which a monolithic write of a large spec reliably trips. Authoring
  dispatches carry a pacing contract: skeleton first, one top-level section per edit, every
  write under 12,000 bytes, commit after each section. Follow the same pacing when authoring
  these artifacts by hand.

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
  `skills/orchestrate-queue/SKILL.md` for the queue format and the status lifecycle.

## Operator conventions

Changes that touch an **entry point, a repo-default config, or a shared artifact writer**
go through the queue (or, minimally, a standalone `dod-verify` pass) — not an ad-hoc
`feat(...)` commit. The two worst gaps in the post-mortem that motivated the
integration-boundary criterion shipped exactly that way: in ad-hoc commits with no
REQ/PLAN/DoD, so nothing ever challenged the adjacent surfaces they silently falsified.

## Local development

```bash
claude --plugin-dir ./pdlc           # load for one session (dev)
claude plugin validate ./pdlc --strict
```

`pdlc/workflows/*.js` are the ES module sources; `node pdlc/workflows/build-runtime.mjs`
compiles them into the runnable artifact under `pdlc/workflows/dist/`, which holds exactly
`pdlc-cli.mjs`. That artifact is tracked and generated — never hand-edit it, and rebuild
`pdlc/workflows/dist/` in the same commit as any workflow-source change.
`build-runtime.mjs --check` exits non-zero on drift.

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

### Headless engine (npm)

The pipeline also ships as a standalone CLI, independent of the Claude Code plugin above —
see `pdlc/engine/README.md` for what the package is.

```bash
npm i -g @kaneho/pdlc-engine@latest      # install fresh, or upgrade in place — same command
npm view @kaneho/pdlc-engine pdlcPairing # read the {engine, compat range, plugin} pairing this build was published against
```

> The registry only ever holds versions cut from a tag. `@latest` now resolves to `0.2.0` —
> the bytes published from `engine-v0.2.0` (2026-08-16), which include this feature's pin
> ladder, doctor routing and launcher hop. To exercise HEAD instead, install from the local
> checkout: `npm i -g ./pdlc/engine`.

## Ptah engine integration

The engine reads skill prompts by filesystem path (`ptah.config.json` → `agents[].skill_path`).
Point each entry at this plugin's `skills/<name>/SKILL.md`; no engine code change is required.
