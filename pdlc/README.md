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
| `orchestrate-dev` | Pipeline orchestrator (REQ → FSPEC → TSPEC → PLAN → PROPERTIES → IMPL) |
| `pm-author` / `pm-review` | Product Manager — authors REQ/FSPEC; reviews from product lens |
| `se-author` / `se-review` | Senior Engineer — authors TSPEC/PLAN; reviews from technical lens |
| `se-implement` | Implements a PLAN phase via strict TDD (loads TS/Python supplement) |
| `te-author` / `te-review` | Test Engineer — authors PROPERTIES; reviews from testing lens |
| `tech-lead` / `tech-lead-python` | Parses PLAN, dispatches parallel se-implement agents |

## Convention contract (what installing pdlc expects of a repo)

- Artifacts live under `docs/{feature}/`: `REQ → FSPEC → TSPEC → PLAN → PROPERTIES`
  (later: `DECISIONS`, `LEARNINGS`).
- Project-level context lives under `docs/_constraints/` and `docs/_decisions/`.
- A run starts from `/pdlc:orchestrate-dev docs/{feature}/REQ-{feature}.md` on branch
  `feat-{feature}`.

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
