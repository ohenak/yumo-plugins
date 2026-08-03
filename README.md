# yumo-plugins

A monorepo of [Claude Code](https://claude.ai/code) plugins by Kane Ho.

## Plugins

| Plugin | Description |
|---|---|
| [pdlc](pdlc/) | Product Development Lifecycle pipeline — spec-driven development with multi-role cross-reviews, evaluator-optimizer feedback loops, and parallel TDD implementation |

---

## pdlc — Product Development Lifecycle

Runs a full pipeline from an approved requirements doc through to a reviewed, tested implementation. Each phase is gated on quality approval from parallel cross-reviewers before the next begins.

### Pipeline

```
[User-approved REQ]
        │
        ▼  Phase R  — REQ cross-review (se-review + te-review → pm-author)
        ▼  Phase F  — FSPEC creation + review (pm-author → se-review + te-review)
        ▼  Phase T  — TSPEC creation + review (se-author → pm-review + te-review)
        ▼  Phase D  — DECISIONS gate (conditional — se-author → pm-review + te-review)
        ▼  Phase P  — PLAN creation + review (se-author → pm-review + te-review)
        ▼  Phase PR — PROPERTIES creation + review (te-author → pm-review + se-review)
        ▼  Phase I  — Implementation (tech-lead dispatches parallel se-implement agents)
        ▼  Phase PT — PROPERTIES tests (se-implement, TDD, full suite)
        ▼  Phase CR — Final codebase review (pm-review + te-review → se-implement)
        ▼  Phase DOD— Definition of Done (rebase, then dod-verify ⇄ se-implement, max 3 rounds)
        ▼  Phase H  — Harvest (cross-reviews + code reviews → LEARNINGS, then deleted)
        ▼  Phase PUB— Raise/reuse the PR (ship-pr), then poll GitHub checks
        ▼  Phase MERGE— Merge & advance queue (guarded decision ladder, no agent)
        │
   PR open, checks green — merged if mergeMode opts in, else a human merges it
```

Each review loop runs reviewers **in parallel** as evaluators and the document owner as optimizer, repeating until all reviewers approve (max 5 iterations; non-convergence writes a POSTMORTEM).

Round indices are derived from the `CROSS-REVIEW-{role}-{doc}-v{N}` files actually on disk, and the loop refuses to overwrite one — review history is append-only. A POSTMORTEM refuses its phase on any later run until a human adds `RESOLVED: yes` to it; no agent ever writes that marker.

The PR can be merged by the pipeline itself in Phase MERGE, but `mergeMode` ships **`off`**, so today's default is still a human step: `awaiting-merge` → `done` after you merge it. A self-modification guard also means Phase MERGE never merges a PR that touches the pipeline's own workflow/skill surfaces, whatever `mergeMode` is set to (this repo's own queue rows are always in that category — see the Bootstrapping note in `docs/_queue/QUEUE.md`).

### Running a whole queue

For unattended, multi-feature delivery, list features in `docs/_queue/QUEUE.md` and run:

```
/loop run /pdlc:orchestrate-queue
```

Each iteration picks the next **ready** REQ in dependency order, runs the full pipeline for it, and stops. A REQ opts in with `ready: true` in its frontmatter, so an unfinished REQ can sit in the queue without being picked up. Between iterations a human reviews and merges PRs, which is what unblocks dependent features.

### Skills

Invoked as `/pdlc:<skill>`:

| Skill | Role |
|---|---|
| `orchestrate-queue` | Serial queue driver — picks the next ready REQ from `docs/_queue/QUEUE.md` and runs `orchestrate-dev` for it |
| `orchestrate-dev` | Runs the full pipeline end-to-end from a REQ path |
| `pm-author` | Authors REQ, FSPEC; addresses feedback on PM-owned docs |
| `pm-review` | Reviews from product lens (scope, value, acceptance criteria) |
| `se-author` | Authors TSPEC, PLAN, DECISIONS; addresses feedback on SE-owned docs |
| `se-review` | Reviews from technical lens (feasibility, architecture, edge cases) |
| `se-implement` | TDD implementation per PLAN phase (TypeScript and Python supplements) |
| `te-author` | Authors PROPERTIES; addresses feedback on TE-owned docs |
| `te-review` | Reviews from testing lens (testability, coverage, edge cases) |
| `tech-lead` | Parses PLAN, dispatches parallel `se-implement` agents (TypeScript) |
| `tech-lead-python` | Same as `tech-lead` for Python repos |
| `dod-verify` | Definition-of-Done verifier — documents stubs, unwired integrations, mock data and coverage gaps; does **not** fix them |
| `ship-pr` | Rebases the feature branch, then raises or reuses the feature PR |
| `harvest-learnings` | Distils cross-reviews + post-mortems → LEARNINGS, deletes harvested files |
| `consolidate-learnings` | Merges LEARNINGS across features into project-level knowledge |

### Convention contract

pdlc expects consuming repos to follow this layout:

```
docs/
  _constraints/          # project-wide constraints (tech stack, non-negotiables)
  _decisions/            # project-wide architectural decisions
  _queue/
    QUEUE.md             # serial work queue (only for orchestrate-queue)
  {feature-name}/
    REQ-{feature-name}.md
    FSPEC-{feature-name}.md
    TSPEC-{feature-name}.md
    DECISIONS-{feature-name}.md   (conditional)
    PLAN-{feature-name}.md
    PROPERTIES-{feature-name}.md
    CROSS-REVIEW-{role}-{doc}-v{N}.md   (deleted by harvest)
    CODE_REVIEW-{feature-name}-v{N}.md  (Phase DOD; deleted by harvest)
    POSTMORTEM-{phase}-{feature-name}.md (only on non-convergence)
    LEARNINGS-{feature-name}.md   (written by harvest-learnings)
```

Start each run on a `feat-{feature-name}` branch with a user-approved REQ doc already present.

Two of these are **parsed data contracts, not prose**. A cross-review must end with a trailing `## Verdict` section carrying exactly one `VERDICT: {value}` line — a second one is read fail-closed and the approval is not honoured. A LEARNINGS file must carry a `Harvested from` row in its metadata table and five numbered sections with non-empty bodies.

### Usage

```bash
# Dev / one-session load
claude --plugin-dir ./pdlc

# Validate
claude plugin validate ./pdlc --strict

# Install in another repo from the marketplace
claude plugin marketplace add ohenak/yumo-plugins
claude plugin install pdlc

# Run the pipeline for one feature
/pdlc:orchestrate-dev docs/{feature-name}/REQ-{feature-name}.md

# Or drive a whole queue, one ready feature per iteration
/loop run /pdlc:orchestrate-queue
```

Working **on this repo** rather than installing from it? The runtime artifacts are generated, so a fresh clone has none. See [pdlc/README.md](pdlc/README.md#fresh-clone-bootstrap) for the two-command bootstrap and the drift tooling.

### Hooks

| Hook | When | Effect |
|---|---|---|
| `guard-harvest-before-delete` | Before any `rm`/`del` Bash call | Blocks deletion of `CROSS-REVIEW-*` or `CODE_REVIEW-*` files unless `LEARNINGS-{feature}.md` exists on the branch |
| `check-scope-field` | After Write or Edit | Warns if a skill output doc is missing the `Scope:` field |
| `nudge-consolidation` | Session start | Reminds to run `consolidate-learnings` when stale LEARNINGS files are detected |
| `check-workflow-drift` | Session start | Reports when the consumer's runtime copy has drifted from the built artifacts, so a stale copy is announced rather than silently executed |

---

## Marketplace

This repo exposes a marketplace manifest at `.claude-plugin/marketplace.json`. It lists every plugin in the repo so Claude Code can discover and install them by source path.

When you add a new plugin, add an entry to `.claude-plugin/marketplace.json` alongside the plugin directory itself.

---

## Adding a plugin

```
{plugin-name}/
  .claude-plugin/plugin.json    # manifest (name, displayName, version, description, author)
  skills/{skill-name}/SKILL.md  # one file per skill, with name + description frontmatter
  hooks/hooks.json               # hook wiring (required; can be empty)
  README.md
```

See [pdlc/.claude-plugin/plugin.json](pdlc/.claude-plugin/plugin.json) for a reference manifest.
