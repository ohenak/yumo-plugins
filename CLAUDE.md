# yumo-plugins — CLAUDE.md

This repo is a monorepo of Claude Code plugins authored by Kane Ho. Each top-level directory is one plugin.

## Plugin structure

Every plugin follows this layout:

```
{plugin-name}/
  .claude-plugin/
    plugin.json          # name, displayName, version, description, author
  skills/
    {skill-name}/
      SKILL.md           # the full prompt loaded when /plugin:skill is invoked
  hooks/
    hooks.json           # PreToolUse / PostToolUse / SessionStart wiring
    scripts/             # shell scripts called by hooks (bash, POSIX-compatible)
  README.md
```

`plugin.json` is the manifest. `SKILL.md` files are the authoritative prompts — edit them here and both interactive Claude Code sessions and the Ptah engine pick up the change automatically (no copies to sync).

## Plugins in this repo

| Plugin | Path | Purpose |
|---|---|---|
| pdlc | `pdlc/` | Product Development Lifecycle pipeline — REQ → FSPEC → TSPEC → PLAN → PROPERTIES → Implementation |

## pdlc specifics

### Skills (invoked as `/pdlc:<skill>`)

| Skill | File | Role |
|---|---|---|
| `orchestrate-queue` | `skills/orchestrate-queue/SKILL.md` | Serial queue driver — picks next ready REQ from `docs/_queue/QUEUE.md`, runs `orchestrate-dev` for it; built to be driven by `/loop` |
| `orchestrate-dev` | `skills/orchestrate-dev/SKILL.md` | Top-level pipeline orchestrator |
| `pm-author` | `skills/pm-author/SKILL.md` | Authors REQ, FSPEC; addresses feedback |
| `pm-review` | `skills/pm-review/SKILL.md` | Reviews from product lens |
| `se-author` | `skills/se-author/SKILL.md` | Authors TSPEC, PLAN, DECISIONS; addresses feedback |
| `se-review` | `skills/se-review/SKILL.md` | Reviews from technical lens |
| `se-implement` | `skills/se-implement/SKILL.md` | TDD implementation (supplements: SKILL-typescript.md, SKILL-python.md) |
| `te-author` | `skills/te-author/SKILL.md` | Authors PROPERTIES; addresses feedback |
| `te-review` | `skills/te-review/SKILL.md` | Reviews from testing lens |
| `dod-verify` | `skills/dod-verify/SKILL.md` | Definition of Done verifier — scans production code for stubs, unwired integrations, mock data, and coverage gaps and documents findings in a versioned `CODE_REVIEW-{feature}-v{N}.md` (does NOT fix); orchestrate-dev Phase DOD dispatches se-implement to remediate, then re-verifies |
| `ship-pr` | `skills/ship-pr/SKILL.md` | Raises/reuses the feature PR and reports GHA check status; driven by orchestrate-dev Phase PUB (script owns poll timing) |
| `tech-lead` | `skills/tech-lead/SKILL.md` | Parses PLAN, dispatches parallel se-implement agents (TypeScript) |
| `tech-lead-python` | `skills/tech-lead-python/SKILL.md` | Same as tech-lead for Python repos |
| `harvest-learnings` | `skills/harvest-learnings/SKILL.md` | Distils cross-reviews + post-mortems → LEARNINGS, then deletes harvested files |
| `consolidate-learnings` | `skills/consolidate-learnings/SKILL.md` | Merges LEARNINGS across features into project-level knowledge |

### Model selection

The workflow scripts pin a model per phase via the runtime `agent()` `model` option:

- `orchestrate-dev`: **Phase I (Implementation) batches run on Sonnet**; every other phase (spec authoring/reviews, PROPERTIES tests, final codebase review, DoD, Harvest, PR/CI) runs on **Opus**. Constants: `MODEL_DEFAULT = "opus"`, `MODEL_IMPLEMENTATION = "sonnet"` at the top of `pdlc/workflows/orchestrate-dev.js`; agent calls default to Opus, the Phase I dispatch overrides to Sonnet.
- `orchestrate-queue`: the **Phase-0 readiness triage runs on Sonnet** (`MODEL_QUEUE`); the delegated `orchestrate-dev` pipeline is invoked without an agent override, so it applies its own pinning above (i.e. **Opus** except its Phase I).

### Hooks

| Hook | Trigger | Script | What it does |
|---|---|---|---|
| `guard-harvest-before-delete` | PreToolUse: Bash | `hooks/scripts/guard-harvest-before-delete.sh` | Blocks deletion of any `CROSS-REVIEW-*` or `CODE_REVIEW-*` file unless `LEARNINGS-{feature}.md` exists on the branch |
| `check-scope-field` | PostToolUse: Write\|Edit | `hooks/scripts/check-scope-field.sh` | Warns if a `CROSS-REVIEW-*` / `CODE_REVIEW-*` doc is missing the `Scope:` field |
| `nudge-consolidation` | SessionStart | `hooks/scripts/nudge-consolidation.sh` | Reminds to run consolidate-learnings if stale LEARNINGS files are detected |

### Artifact convention (for consuming repos)

pdlc expects:
- Feature artifacts under `docs/{feature-name}/` — `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS` (conditional), `LEARNINGS`
- Cross-review files: `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`
- DoD code reviews (Phase DOD): `CODE_REVIEW-{feature-name}-v{N}.md` — the `dod-verify` verifier's versioned, Scope-tagged findings. Tracked and harvested like cross-reviews; one version per DoD verify→remediate round.
- Post-mortems (non-convergence): `POSTMORTEM-{phase}-{feature-name}.md`
- Project-level context: `docs/_constraints/`, `docs/_decisions/`
- Serial work queue (for `orchestrate-queue`): `docs/_queue/QUEUE.md` — a markdown table of `Order | Status | Feature | REQ Path | Depends-On`. REQs opt in to auto-pickup via `ready: true` in their frontmatter; effective deps are the union of the queue's Depends-On column and the REQ's `depends-on`. Status lifecycle: `pending → in-progress → awaiting-merge → done` (human sets `done` after merge) | `halted` | `blocked`.
- Entry (single feature): `feat-{feature-name}` branch, start with `/pdlc:orchestrate-dev docs/{feature-name}/REQ-{feature-name}.md`
- Entry (queue, multi-feature): `/loop run /pdlc:orchestrate-queue` — one ready feature per iteration, dependency-ordered
- Definition of Done (Phase DOD): runs after the Final Codebase Review, before Harvest. Step 0 rebases `feat-{feature}` onto the latest default branch via `ship-pr` (halts on conflict). Then an evaluator→optimizer loop: `dod-verify` documents findings in `CODE_REVIEW-{feature}-v{N}.md` (does not fix), and `orchestrate-dev` dispatches `se-implement` to remediate them via TDD, re-verifying up to 3 rounds before halting. Set `PHASE_DOD_ENABLED = false` to skip.
- Auto-PR (Phase PUB): after Harvest, `orchestrate-dev` raises (or reuses) the feature PR via the `ship-pr` skill and verifies GHA checks. The branch was already rebased in Phase DOD, so `ship-pr` does not rebase here. The script polls the PR; if no checks appear within 10 minutes it assumes the repo has no PR checks and passes the phase. Once checks appear, all must pass or the pipeline halts. The final report carries `prUrl` and `ciStatus`. The PR is never auto-merged — `awaiting-merge` → `done` remains a human step.

### Ptah engine integration

The Ptah engine (`apps/orchestrator/ptah`) reads SKILL.md files by filesystem path via `ptah.config.json` → `agents[].skill_path`. Point each entry at this plugin's `skills/<name>/SKILL.md`. Editing a SKILL.md here updates both interactive and engine behavior — there is one source of truth.

## Adding a new plugin

1. Create `{plugin-name}/.claude-plugin/plugin.json` with name, displayName, version, description, author.
2. Add `skills/{skill-name}/SKILL.md` for each skill with frontmatter (`name`, `description`).
3. Add `hooks/hooks.json` if the plugin needs hooks (can be `{"hooks": {}}`).
4. Add a `README.md`.
5. Update the `## Plugins in this repo` table in this file.
