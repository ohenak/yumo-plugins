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
| `ship-pr` | `skills/ship-pr/SKILL.md` | Rebases the feature branch (Phase DOD) and raises/reuses the feature PR (Phase PUB); the workflow script reads GHA check status directly via `gh` (script owns poll timing) |
| `tech-lead` | `skills/tech-lead/SKILL.md` | Parses PLAN, dispatches parallel se-implement agents (TypeScript) |
| `tech-lead-python` | `skills/tech-lead-python/SKILL.md` | Same as tech-lead for Python repos |
| `harvest-learnings` | `skills/harvest-learnings/SKILL.md` | Distils cross-reviews + post-mortems → LEARNINGS, then deletes harvested files |
| `consolidate-learnings` | `skills/consolidate-learnings/SKILL.md` | Merges LEARNINGS across features into project-level knowledge; `/pdlc:consolidate-learnings` now resolves to a skill and a runtime bundle sharing one name, the same shape `orchestrate-queue` already has |


### Workflow scripts and the runtime build

`pdlc/workflows/*.js` are ES modules with jest coverage (`cd pdlc/workflows && npm test`). The Claude Code workflow runtime cannot load them directly, so `node pdlc/workflows/build-runtime.mjs` generates the runnable artifact into `pdlc/workflows/dist/`, which holds exactly `pdlc-cli.mjs`. This is tracked and generated — **never edit it**, and rebuild `pdlc/workflows/dist/` in the same commit as any workflow-source change. Every injected IO call must be `await`ed: the adapter's implementations are async, the test doubles are sync.

These modules are vendored into the published npm package (`pdlc/engine`, `@kaneho/pdlc-engine`) at pack time, falling back to this repo's `pdlc/workflows/` in a dev checkout — that engine channel is the only way the pipeline runs. `pdlc`'s SKILL.md files no longer load a workflow bundle directly; each delegates to the installed engine CLI (`pdlc dev <req-path>` / `pdlc queue`).

`build-runtime.mjs --check` exits non-zero on drift.

The wave gate's `postWaveCommand` (`node pdlc/workflows/build-runtime.mjs`) and `postWavePathspecs` (`["pdlc/workflows/dist/"]`), configured in `.claude/pdlc.config.example.json`, survive the pdlc-plugin-retirement sweep unchanged: `pdlc/workflows/dist/` still holds the regenerated `pdlc-cli.mjs`, so this rebuild-and-stage step stays load-bearing after every wave that touches `pdlc/workflows/*.js` (DEC-08).

Debugging note: `coveredViolations` (`pdlc/workflows/lib/document-oracles.mjs`) walks the **entire** tree under `root`, skipping only `.git/` and `node_modules/`, so an untracked local file (tool cache, editor backup, database) can fail a document oracle. If a document oracle is red locally but green in CI, check for untracked files before you touch code.

### Continuous integration

The gate Phase PUB polls spans **two** PR-triggered workflow files — `.github/workflows/pr-tests.yml` and `.github/workflows/fixture-machine.yml`. Membership is decided by the file's `on:` trigger, not its name: `publish.yml` is excluded because it is tag-triggered and gates no pull request. **Four checks** must pass:

| Check | What it asserts |
|---|---|
| `Unit tests (ubuntu-latest, node 20)` | `npm run test:coverage` — the workflows suite under c8 on Linux CI |
| `Engine tests (ubuntu-latest)` | `npm ci` + `npm test` in `pdlc/engine` |
| `Shell scripts parse` | `bash -n` over every tracked `*.sh` |
| `Fixture machine (install/upgrade, launcher, container, two-repo)` | `fixture-machine.yml` — install/upgrade, launcher, container and two-repo legs over `pdlc/engine/**` |

This table is the human-facing citation of FSPEC §5.1's required-check set, and it is oracle-covered: `pdlc/engine/__tests__/ci-arrangement.test.js` derives the rows and the count word from §5.1 itself, so a check added to the gate without being added here goes red. `pdlc/OPERATIONS.md` carries the per-check rationale and the determinism rule; `pdlc/RELEASE-CHECKLIST.md` carries the pre-release commitments CI cannot check mechanically.

### Hooks

| Hook | Trigger | Script | What it does |
|---|---|---|---|
| `guard-harvest-before-delete` | PreToolUse: Bash | `hooks/scripts/guard-harvest-before-delete.sh` | Blocks deletion of any `CROSS-REVIEW-*` or `CODE_REVIEW-*` file unless `LEARNINGS-{feature}.md` exists on the branch |
| `check-scope-field` | PostToolUse: Write\|Edit | `hooks/scripts/check-scope-field.sh` | Warns if a `CROSS-REVIEW-*` / `CODE_REVIEW-*` doc is missing the `Scope:` field |
| `check-req-size` | PostToolUse: Write\|Edit | `hooks/scripts/check-req-size.sh` | Warns if a `REQ-*.md` doc exceeds the pdlc REQ size budget (700 lines or 60 KB) |
| `check-finding-grammar` | PostToolUse: Write\|Edit | `hooks/scripts/check-finding-grammar.sh` | Warns if an erratum-round `CROSS-REVIEW-*` doc has findings not expressed as line-leading `FINDING:` lines (the only form the engine's fail-closed gate reads) |
| `nudge-consolidation` | SessionStart | `hooks/scripts/nudge-consolidation.sh` | Reminds to run consolidate-learnings if stale LEARNINGS files are detected |

The `SessionStart` entry is registered in `hooks/hooks.json`, invoked via `${CLAUDE_PLUGIN_ROOT}`.


### Artifact convention and entry points

Consuming repos keep feature artifacts under `docs/{feature-name}/` (`REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS` when warranted, `LEARNINGS`), cross-reviews as `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, DoD code reviews as `CODE_REVIEW-{feature-name}-v{N}.md`, post-mortems as `POSTMORTEM-{phase}-{feature-name}.md`, project-level context under `docs/_constraints/` and `docs/_decisions/`, and the serial work queue at `docs/_queue/QUEUE.md`.

Entry points:

- Single feature: branch `feat-{feature-name}`, then `/pdlc:orchestrate-dev docs/{feature-name}/REQ-{feature-name}.md`
- Queue (multi-feature): `/loop run /pdlc:orchestrate-queue` — one ready feature per iteration, dependency-ordered

The parsing contracts for these files — verdict grammar, approval anchors and `UPSTREAM-STATE` staleness, POSTMORTEM `RESOLVED:` lifecycle, queue drift gate and halt-row semantics, auto-merge — are in `pdlc/OPERATIONS.md`.

### Deep-dive reference

Authoring dispatches (REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES) carry a bounded suffix of prior features' `LEARNINGS-*.md` material. It ships **on**: `.claude/pdlc.config.json` → `learningsInjection` (`enabled: true`, `maxDocuments` 5, `maxBytesPerDocument` 6000, `maxTotalBytes` 20000), every failure mode fails open, and non-authoring prompts stay byte-identical to a pre-feature run. See `pdlc/OPERATIONS.md`.

Two review-loop economies ship **off**: `.claude/pdlc.config.json` → `cascade.pinCheck.enabled` (default false) batches a downstream document whose own bytes are unchanged — only its upstream pin moved — into one no-round-budget `PIN-CHECK: {DOCTYPE}: PASS | FAIL` dispatch; `PASS` re-stamps its `UPSTREAM-STATE` anchors engine-side, `FAIL`/malformed falls back to a full re-confirmation. `review.derivativeStop.enabled` (default false; `rounds` default 2) converges a document as `converged-by-derivative-stop` after that many consecutive flat rounds (no new High/Medium finding, no open High), and **suspends the high-only convergence shortcut** for that loop while enabled (DEC-LOOPECON-10). Both keys parse per-key fail-open, same as `learningsInjection`; off means byte-identical to today. See `pdlc/OPERATIONS.md` (§Review loop mechanics) and `pdlc/README.md`.

The optional `decisionLedger` reviewer-prompt block ships **off**: `.claude/pdlc.config.json` → `decisionLedger.enabled` (default false). See `pdlc/OPERATIONS.md` (§Review loop mechanics, "Decision ledger") for the recognition rule, bounds, omission reasons and notice ids.

`pdlc/OPERATIONS.md` carries the full operational detail split out of this file: review loop mechanics, the phase graph and erratum channel, implementation waves (including **the wave ledger**, Phase I's automatic resume pointer at `.claude/pdlc-wave-state.json` — its three outcomes, the announcements an operator sees, and the delete-the-file escape hatch, since `forcePhases` cannot name Phase I), the CI check table, worktrees, model selection, the advisory tier, the engine channel, and the artifact/queue parsing contracts. Read it before debugging pipeline behavior or editing workflow sources.

### Ptah engine integration

The Ptah engine (`apps/orchestrator/ptah`) reads SKILL.md files by filesystem path via `ptah.config.json` → `agents[].skill_path`. Point each entry at this plugin's `skills/<name>/SKILL.md`. Editing a SKILL.md here updates both interactive and engine behavior — there is one source of truth.

## Adding a new plugin

1. Create `{plugin-name}/.claude-plugin/plugin.json` with name, displayName, version, description, author.
2. Add `skills/{skill-name}/SKILL.md` for each skill with frontmatter (`name`, `description`).
3. Add `hooks/hooks.json` if the plugin needs hooks (can be `{"hooks": {}}`).
4. Add a `README.md`.
5. Update the `## Plugins in this repo` table in this file.
