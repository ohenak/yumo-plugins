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
        ▼  Phase H  — Harvest (cross-reviews → LEARNINGS, then deleted)
        │
   Ready for PR
```

Each review loop runs reviewers **in parallel** as evaluators and the document owner as optimizer, repeating until all reviewers approve (max 5 iterations; non-convergence writes a POSTMORTEM).

### Skills

Invoked as `/pdlc:<skill>`:

| Skill | Role |
|---|---|
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
| `harvest-learnings` | Distils cross-reviews + post-mortems → LEARNINGS, deletes harvested files |
| `consolidate-learnings` | Merges LEARNINGS across features into project-level knowledge |

### Convention contract

pdlc expects consuming repos to follow this layout:

```
docs/
  _constraints/          # project-wide constraints (tech stack, non-negotiables)
  _decisions/            # project-wide architectural decisions
  {feature-name}/
    REQ-{feature-name}.md
    FSPEC-{feature-name}.md
    TSPEC-{feature-name}.md
    DECISIONS-{feature-name}.md   (conditional)
    PLAN-{feature-name}.md
    PROPERTIES-{feature-name}.md
    LEARNINGS-{feature-name}.md   (written by harvest-learnings)
```

Start each run on a `feat-{feature-name}` branch with a user-approved REQ doc already present.

### Usage

```bash
# Dev / one-session load
claude --plugin-dir ./pdlc

# Validate
claude plugin validate ./pdlc --strict

# Install in another repo from the marketplace
claude plugin marketplace add ohenak/yumo
claude plugin install pdlc@ptah

# Run the pipeline
/pdlc:orchestrate-dev docs/{feature-name}/REQ-{feature-name}.md
```

### Hooks

| Hook | When | Effect |
|---|---|---|
| `guard-harvest-before-delete` | Before any `rm`/`del` Bash call | Blocks deletion of `CROSS-REVIEW-*` files unless `LEARNINGS-{feature}.md` exists on the branch |
| `check-scope-field` | After Write or Edit | Warns if a skill output doc is missing the `Scope:` field |
| `nudge-consolidation` | Session start | Reminds to run `consolidate-learnings` when stale LEARNINGS files are detected |

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
