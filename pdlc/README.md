# pdlc — Product Development Lifecycle Plugin

A Claude Code plugin that runs a full spec-driven development pipeline with multi-role
cross-reviews and parallel TDD implementation. It is the **canonical source of truth** for
the PDLC skills: this repo installs it for interactive use, and the **Ptah engine**
(`apps/orchestrator/ptah`) references the same skill files via its `skill_path` config — so
there is one set of prompts, not three drifting copies.

## Skills

Invoked as `/pdlc:<skill>`:

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

## Hooks

| Hook | Trigger | Script | Purpose |
|---|---|---|---|
| `guard-harvest-before-delete` | PreToolUse: Bash | `hooks/scripts/guard-harvest-before-delete.sh` | Blocks deletion of a `CROSS-REVIEW-*` or `CODE_REVIEW-*` file unless a `LEARNINGS-{feature}.md` exists on the branch |
| `check-scope-field` | PostToolUse: Write\|Edit | `hooks/scripts/check-scope-field.sh` | Warns if a `CROSS-REVIEW-*` / `CODE_REVIEW-*` doc is missing the `Scope:` field |
| `check-req-size` | PostToolUse: Write\|Edit | `hooks/scripts/check-req-size.sh` | Warns if a `REQ-*.md` doc exceeds the pdlc REQ size budget (700 lines or 60 KB) |
| `check-finding-grammar` | PostToolUse: Write\|Edit | `hooks/scripts/check-finding-grammar.sh` | Warns if an erratum-round `CROSS-REVIEW-*` doc has findings not expressed as line-leading `FINDING:` lines (the only form the engine's fail-closed gate reads) |
| `nudge-consolidation` | SessionStart | `hooks/scripts/nudge-consolidation.sh` | Reminds to run consolidate-learnings if stale LEARNINGS files are detected |

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

## Prior-feature learnings injection

Authoring dispatches (REQ, FSPEC, TSPEC, PLAN, DECISIONS, PROPERTIES) are suffixed with a
bounded, delimited digest of prior features' `LEARNINGS-*.md` files, so each new feature
starts from what the last ones learned. Non-authoring dispatches are unchanged, byte for byte.

It is **on by default**. Configure — or disable — it under `learningsInjection` in
`.claude/pdlc.config.json`:

```jsonc
{
  "learningsInjection": {
    "enabled": true,          // set false to turn the feature off entirely
    "maxDocuments": 5,        // documents per dispatch
    "maxBytesPerDocument": 6000,
    "maxTotalBytes": 20000    // per dispatch, across all documents
  }
}
```

Every failure mode fails open: an unreadable corpus, an unparseable document, a malformed
section or a wrong-typed key injects less, never halts, and never silently disables. Keys and
notice ids are documented in `pdlc/OPERATIONS.md`.

## Loop economics: pin-cascade and derivative-stop (opt-in)

Two review-loop economies ship **off by default**. Each is gated by its own key in
`.claude/pdlc.config.json` (same per-key fail-open parsing as `learningsInjection`: a
missing or wrong-typed key falls back to its default and never disturbs the rest of the
block); with a key off, the dispatch stream is byte-identical to a run without the feature.

```jsonc
{
  "cascade": {
    "pinCheck": {
      "enabled": true          // default false — M2, pin-cascade confirmation round
    }
  },
  "review": {
    "derivativeStop": {
      "enabled": true,         // default false — M3, derivative-stop convergence
      "rounds": 2              // consecutive flat rounds required; positive integer
    }
  }
}
```

- **`cascade.pinCheck` (M2).** In the post-erratum staleness walk, an approved downstream
  document whose own bytes have not changed — only its upstream pin moved — is routed into
  one batched pin-check dispatch (`PIN-CHECK: {DOCTYPE}: PASS | FAIL` per document) instead
  of a full re-review. `PASS` re-stamps the anchor's `UPSTREAM-STATE` rows in place, engine-
  side, consuming no review-round budget; `FAIL` — or any malformed reply — falls back to
  the ordinary full re-confirmation, so fail-open always means *more* review, never less.
- **`review.derivativeStop` (M3).** A document converges as `converged-by-derivative-stop`
  after `rounds` consecutive flat rounds (no *new* finding at severity ≥ Medium; new Lows
  don't block; an open High always does). **Enabling this also tightens the loop's ordinary
  bar:** the high-only convergence shortcut (the 2026-08-08 relaxation) is suspended for
  that loop, so a round converges only on a literal approving verdict or the derivative
  stop. A document that today converges leniently with an open Medium may run more rounds —
  that is the intended trade (DEC-TERM-01). Lifetime caps and POSTMORTEM behavior are
  unchanged.

Grammar, eligibility rules, and notice ids are documented in `pdlc/OPERATIONS.md`
(§Review loop mechanics); defaults are mirrored in `.claude/pdlc.config.example.json`.

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

## Operator surface

**Steady-state — once a repo is set up and a loop session is running — needs a human for
exactly four things:**

1. Flipping `ready: true` on a REQ.
2. Approving any PR that touches a guarded path.
3. Resolving open escalations.
4. Product- and business-judgment calls outside the pipeline's scope.

**One-time setup — before steady state — is a separate list, not part of the four above:**

- Install the engine — the canonical command is in the "Headless engine (npm)" section
  below (or `npm i -g ./pdlc/engine` from a checkout — see `pdlc/engine/README.md`).
- Create `docs/_queue/QUEUE.md` from the shipped template (`pdlc/templates/QUEUE.md`).
- Install the loop prompt — copy `pdlc/templates/loop.md` into the consuming repo's
  `.claude/commands/` (or the equivalent slash-command location) so `/loop run
  /pdlc:orchestrate-queue` is available.

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

> The registry only ever holds versions cut from a tag. `@latest` now resolves to `0.2.3` —
> the bytes published from `engine-v0.2.3` (2026-08-22), which include this feature's pin
> ladder, doctor routing and launcher hop. To exercise HEAD instead, install from the local
> checkout: `npm i -g ./pdlc/engine`.

## pdlc CLI

Once installed, the pipeline runs only through the installed engine CLI (`pdlc/engine/bin/cli.mjs`):

- `pdlc dev <docs/{feature}/REQ-{feature}.md>` — run the full pipeline for one feature
- `pdlc queue` — run the next ready row from `docs/_queue/QUEUE.md`
- `pdlc doctor` — startup/environment checks only; dispatches nothing
- `pdlc decide --entry <entryId> --outcome <resolved|rejected> --by <who> [--rationale <text>]` — record a decision-entry outcome
- `pdlc stats [feature] [--json] [--cwd <path>]` — read-only report over `docs/`

Flags: `--loop [--max-iterations <n>]` and `--loop-state <path>` (queue-only), `--dry-run` (inspection surface, no dispatch), the `forcePhases` override `<R,F,T,P,D,PR|all>` (dev-only), and the common `--plugin-root <path>`, `--cwd <path>`, `--allow-api-key-billing`.

The CLI resolves versions from a local store at `~/.pdlc/versions` (override with `PDLC_HOME`). The five workflow modules it dispatches (`orchestrate-dev.js`, `orchestrate-queue.js`, `lib/loop-session.mjs`, `lib/escalation-view.mjs`, `lib/stats.mjs`) are vendored into the package at pack time, falling back to this repo's `pdlc/workflows/` in a dev checkout. Full flag semantics live in `pdlc/OPERATIONS.md`.

## Ptah engine integration

The engine reads skill prompts by filesystem path (`ptah.config.json` → `agents[].skill_path`).
Point each entry at this plugin's `skills/<name>/SKILL.md`; no engine code change is required.
