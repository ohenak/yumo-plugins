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
| `consolidate-learnings` | `skills/consolidate-learnings/SKILL.md` | Merges LEARNINGS across features into project-level knowledge |

### Workflow scripts and the runtime build

`pdlc/workflows/*.js` are ES modules with jest coverage (`cd pdlc/workflows && npm test`). The Claude Code workflow runtime cannot load them directly: `export const meta` must be the first statement and a pure literal, no other `export` is permitted, and `import` / `import()` / `process` / `fs` / `fetch` do not exist there.

`node pdlc/workflows/build-runtime.mjs` therefore generates the runnable artifacts into `pdlc/workflows/dist/`:

- `pdlc/workflows/dist/orchestrate-dev.bundle.js`
- `pdlc/workflows/dist/orchestrate-queue.bundle.js` (inlines `orchestrate-dev` too — the queue calls it in-process)
- `pdlc/workflows/dist/distribution-manifest.json` — one row per artifact (id, plugin path, sha1, retired predecessors), plus the plugin version those bytes were built at

Those three are the tracked, shipped outputs. The copy the workflow runtime actually loads is a separate, **untracked** consumer copy under `.claude/workflows/`, produced from `pdlc/workflows/dist/` by `pdlc/hooks/scripts/sync-workflows.sh` — never hand-edited, never committed.

All are **generated — never edit them**. `build-runtime.mjs --check` exits non-zero when an artifact under `pdlc/workflows/dist/` is stale, `__tests__/runtimeBundle.test.js` asserts freshness plus the runtime's structural constraints, and `pdlc/hooks/scripts/sync-workflows.sh --check` exits non-zero when the consumer copy has drifted from the built artifacts.

`pdlc/workflows/runtime-adapter.js` is inlined by the build (never imported). It re-expresses Node capabilities — file read/write, existence checks, `gh pr view` CI polling, worktree merges — as `agent()` calls, and bridges the `agent` / `parallel` / `pipeline` signature differences between the module stubs and the runtime. It reaches the pipeline through the modules' existing dependency-injection parameters (`_agent`, `_readFile`, `_writeFile`, `_checkFile`, `_checkCi`, `_mergeWorktree`, …), so the modules remain the single tested source of truth.

Consequence for anyone editing a workflow source: **every injected IO call must be `await`ed** (the adapter's implementations are async, the test doubles are sync), and `pdlc/workflows/dist/` must be rebuilt in the same commit.

`pdlc/workflows/lib/document-oracles.mjs` is ordinary Node production code, **not** part of the bundle — the runtime never loads it. Every export is a pure function of a `root` directory path (no `process.cwd()`, no ambient state), so tests, the release checklist and any future CLI can probe two roots in the same process. It provides `coveredViolations` (document-drift scan), `packagingViolations`, and `advertisedVersionViolation`.

One consequence worth knowing before you debug a mystery red: `coveredViolations` walks the **entire** tree under `root`, skipping only `.git/` and `node_modules/`. An untracked local file — a tool cache, an editor backup, a database — can therefore fail a document oracle for reasons that have nothing to do with your diff. If a document oracle is red locally but green in CI, check for untracked files before you touch the code.

### Review loop mechanics

Three behaviours of the review loop are load-bearing and easy to violate accidentally:

- **Round indices are derived, never assumed.** `deriveRoundWindow` (`orchestrate-dev.js:2151`) reads the directory listing and computes the round window from the `CROSS-REVIEW-{role}-{doc}-v{N}` basenames actually present. It is synchronous, total, takes no seam, and never consults a clock — the decision is purely content-addressed. The loop refuses to overwrite an existing review file, so review history is append-only. `MAX_REVIEW_ROUNDS = 5`; exhausting it writes a POSTMORTEM and halts.
- **Documents are gated on structural completeness, not on an agent saying "done".** `isComplete(artifactClass, docType, fileText)` (`:1310`) scores a document per artifact class — `spec`, `cross-review`, `code-review`, `LEARNINGS` — and returns `{complete, missing, T, S}`. **`spec`-class rows match required *concepts* by normalised, word-boundary CONTAINMENT against the canonical title or a curated alias (`REQUIRED_HEADINGS[docType][].alts`) — numbered/descriptive headings are honored**, so a concern-organized spec (`## 4. The advisory core — types, SeamOps protocol, …` ⇒ `Interfaces` + `Data Model`) passes without carrying canonical headings verbatim. Word-bounded on `[a-z0-9-]`, so `non-goals` never satisfies `Goals` and a plural `## Decisions` never satisfies `Decision`. `LEARNINGS` is scored **positionally**: sections `1.`…`5.` must exist with non-empty bodies, whatever they are titled, plus the `Harvested from` row. Section 6 (Approval Record) is deliberately excluded from the criterion.
- **Authoring is incremental because it has to be.** The workflow runtime kills any dispatch that makes no progress for **180 seconds**, which a whole-file write of a large spec reliably trips — losing everything not yet flushed. Every authoring dispatch therefore carries `PACING_CONTRACT_CLAUSE` (`:2279`): skeleton first, one top-level section per edit, every write under 12,000 bytes, commit after each section. `MAX_AUTHORING_ATTEMPTS = 3` consecutive no-progress dispatches per episode ends the attempt rather than looping forever. When that halt fires and the completeness probe still reports a non-empty `missing` set, the halt message **names the still-missing rows and flags a likely heading-naming mismatch** (not a content gap), so a stall on a substantively-complete document is legible without re-reading it. **Follow this pacing yourself when authoring these artifacts by hand** — the watchdog is runtime-side and not configurable from this repo.

Three further behaviours, added by the orchestrate-dev optimization (Slice A):

- **Rounds 2+ are delta-scoped and prompts are grounded.** A round-2+ reviewer re-reads its own prior cross-review, diffs the document, and judges only whether its blocking findings are resolved and whether the revision broke anything — convergence is the goal; the approval bar (any open High/Medium ⇒ Needs revision) is unchanged. The optimizer is addressed as the continuing author: settled decisions are not re-litigated. Every creator/reviewer/optimizer prompt carries the phase's grounding manifest (`PHASE_DISPATCH[*].grounding` — verify claims against code, cite `file:line`), and reviewer prompts carry the three oracle-quality clauses (no implementation echoes, no absence-only oracles, completeness by set-equality).
- **Sessions are a seam, not a capability.** `_sessionAgent` (default `null`) lets a runtime that can resume agents keep one author session and one session per reviewer per document; the shipped runtime cannot, so every dispatch falls back to a fresh, delta-scoped dispatch. Fail-open: a declined or throwing transport falls back to `_agent` for that one call.
- **A converged PLAN must self-parse.** After Phase P converges, the script runs `parsePlanTasks` + `computeTopologicalBatches` over the PLAN and halts the phase on an unparseable table or a dependency cycle — rejected at Phase P, not discovered at Phase I. The parser's header grammar is exact-cell (`#`/`ID`/`Task ID` and `Deps`/`Dependencies`/`Depends on`/`Prerequisites`), never substring, so data tables elsewhere in the PLAN cannot be swallowed as task tables. The same gate requires the PLAN's **file-ownership manifest** (a table with Task and Files columns, per se-author batch-safety rule 2), parsed by `parsePlanOwnership` and checked against the task table by `validatePlanContract` — every task needs a manifest row and vice versa.

### Phase graph and the erratum channel (Slice C)

- **One convergence primitive.** `main()` no longer carries five copied phase bodies; phases R, F, T, D, P, PR run through one `converge()` primitive (author → review → delta-verify → stop), parameterized by `PHASE_DISPATCH`. Phase CR keeps its own body; **CR and DOD remain separate gates** (operator decision, 2026-08-02 — never merge them).
- **T absorbs D; PT is I's V-wave.** DECISIONS, when warranted, is authored inside Phase T's section by the same author session and reviewed immediately — it keeps its own docType round window, cross-review files, POSTMORTEM lifecycle, forcePhases token, and report row (merging review windows would break `deriveRoundWindow`'s per-docType derivation, so the absorption is structural, not artifact-level). PROPERTIES tests run as Phase I's final V-wave under the script-owned gate in wave mode (the V-wave agent commits its own work; the script gate verifies after); the PT report row is unchanged.
- **Errata are a first-class signal.** A creator, optimizer, or reviewer that finds a defect in an *upstream* document emits `ERRATUM: {DOCTYPE}: {item}` lines (DOCTYPE ∈ REQ, FSPEC, TSPEC, DECISIONS, PLAN, PROPERTIES) instead of editing that document or mis-filing the finding. After the phase converges, the orchestrator routes each upstream doc's errata: a targeted versioned edit by that document's author (same author session), then a delta-confirmation by that document's own approvers written as the next append-only cross-review round, with approval anchors re-appended on PASS so the upstream approval never goes silently stale. **Bounded: one erratum round per upstream doc per phase** (shipped constant, not config); a failed confirmation or a second batch halts to the current phase's POSTMORTEM.

### Implementation waves (Phase I, Slice B)

With a valid ownership manifest, Phase I runs **same-tree waves instead of worktree batches**: waves = topological ready-sets partitioned into ownership-disjoint groups (`computeWaves`; a directory entry collides with everything under it), agents are dispatched without worktree isolation and told not to commit, and **the script owns the gate** — after each wave it runs `.claude/pdlc.config.json` → `implementation.testCommand` through the `_runCommand` seam, then (optionally) `implementation.postWaveCommand`, and only then commits each task's work itself, pathspec-scoped to the task's owned files (never `-a`), with an index.lock retry (5 × 5 s). `implementation.postWavePathspecs` names build outputs (e.g. `pdlc/workflows/dist/`) committed as a per-wave chore commit. Missing `testCommand` or an absent `_runCommand` seam degrades to the legacy self-report gate with a notice; a PLAN with no manifest (reachable only when Phase P was skipped on a recorded approval) degrades to the legacy worktree path. Worktrees are the exception path, not the default.

### Continuous integration

`.github/workflows/pr-tests.yml` is the gate Phase PUB polls. Five checks must pass:

| Check | What it asserts |
|---|---|
| `Unit tests (ubuntu-latest, node 20)` / `(macos-latest, node 20)` | `npm test` on both platforms — the matrix exists because the shipped bash scripts must work on both bash 3.2 (maintainer's macOS) and bash 5 (Linux CI) |
| `Generated artifacts are in sync` | `build-runtime.mjs --check`, then a rebuild that must produce no diff — an independent observer, since `--check` and the builder share code |
| `Fresh-clone bootstrap works` | executes the two documented bootstrap commands as written, by bare path, and fails loudly on exit 126 (lost execute bit) |
| `Shell scripts parse` | `bash -n` over every tracked `*.sh`, plus index-mode assertions (`100755` for the two entrypoints, `100644` for the sourced library) |

Keep every job deterministic: Phase PUB halts the pipeline on any failure, so a job that can fail for reasons unrelated to the diff blocks delivery.

`pdlc/RELEASE-CHECKLIST.md` carries the pre-release commitments that CI cannot check mechanically.

### Fresh-clone bootstrap

Runtime artifacts are generated, so a fresh clone has none. Two commands, **in this order**, bring a clone to a working state — no published release, no installed plugin, no `${CLAUDE_PLUGIN_ROOT}`, no network:

```bash
node pdlc/workflows/build-runtime.mjs     # generates pdlc/workflows/dist/ and distribution-manifest.json
pdlc/hooks/scripts/sync-workflows.sh      # copies those artifacts into the consumer's .claude/workflows/
```

The order is not interchangeable: the sync step copies what the build step produced, so running it first has nothing to copy.

The second command is invoked by **bare path** — no `bash` or `sh` prefix. The shipped hook scripts carry their execute bit precisely so this works; an invocation that exits 126 means the bit was lost. Verify afterwards with `pdlc/hooks/scripts/sync-workflows.sh --check`, which exits 0 once every row is in sync.

#### When sync skips a row: `unverified` and `--force`

A plain `sync-workflows.sh` **deliberately refuses to overwrite** two classes of consumer file, and reports rather than clobbers:

| State | Meaning | Plain sync |
|---|---|---|
| `local-edit` | the consumer copy was hand-edited since it was synced | skipped, warns |
| `unverified` | **no sync-manifest entry** — provenance unknown, so the file may be either | skipped, warns |

`unverified` is the state every pre-existing `.claude/workflows/` tree lands in the first time this mechanism runs: the copies predate the manifest, so nothing records where they came from. It is deliberately safe in **both** directions — an unverified file is never assumed to be a stale generated artifact, and never assumed to be precious.

The upgrade path is **`sync-workflows.sh --force`**, which overwrites skipped rows. It is safe to run when you have confirmed you have no hand-edits worth keeping under `.claude/workflows/` — and every overwrite is backed up first (`§5.7`'s backup-then-write), so the prior content is recoverable. Do **not** run `--force` reflexively: the tool demands it precisely because it cannot tell your edits from a stale copy. If `--check` exits non-zero on a tree you did not expect to be dirty, read the warnings before forcing.

### Worktrees

A worktree Claude Code creates for you is a supported consumer: the repo-root `.worktreeinclude` lists `.claude/workflows/`, so the generated artifacts come across with the worktree.

A worktree you create yourself with `git worktree add` is **not** a supported consumer. Its `.claude/workflows/` is empty, so workflow invocations there fail with "workflow not found", while the drift tooling resolves the main worktree and reports that tree as in sync — a green report that does not describe the tree the runtime reads. Per-worktree consumer state is deferred to D-DIST-07 (queue row 6). Until it lands, work from the main worktree or from a Claude-created one.

### Model selection

The workflow scripts pin a model per phase via the runtime `agent()` `model` option:

- `orchestrate-dev`: **Phase I (Implementation) waves run on Sonnet**; every other phase (spec authoring/reviews, PROPERTIES tests, final codebase review, DoD, Harvest, PR/CI) runs on **Opus**. Constants: `MODEL_DEFAULT = "opus"`, `MODEL_IMPLEMENTATION = "sonnet"` at the top of `pdlc/workflows/orchestrate-dev.js`; agent calls default to Opus, the Phase I dispatch overrides to Sonnet.
- `orchestrate-queue`: the **Phase-0 readiness triage runs on Sonnet** (`MODEL_QUEUE`); the delegated `orchestrate-dev` pipeline is invoked without an agent override, so it applies its own pinning above (i.e. **Opus** except its Phase I).

### Advisory tier (off by default)

An **advisory tier** lets the pipeline attempt one bounded, reversible remediation at five
named seams before escalating to a human. It ships **disabled**: `.claude/pdlc.config.json` →
`advisory.enabled` defaults to `false`, and with it false (or the section absent/malformed)
the tier is provably inert — no dispatch, no model resolution, and the created-file set of a
run is byte-identical to the pre-advisory baseline (`advisoryDisabled.test.js`, PROP-DIS-*).

- **Seams:** `A1` queue triage adjudication (needs-human; capability-free — it never edits),
  `A2` queue stale-REQ re-grounding (rewrites citation *location text only*, then commits
  REQ + record pathspec-scoped in its own `verifyGate`), `A3`/`A4` Phase DOD verify/remediate
  assists, `A5` Phase PUB CI-red diagnosis (acts only inside a decidable envelope; a
  non-`escalated` outcome re-polls, `escalated` falls through to the byte-identical halt).
- **Config keys** (`parseAdvisoryConfig` — per-key independent fallback, one bad key never
  retunes the rest): `enabled` (false), `attemptBudget` (3), `seamBudgetMinutes` (10),
  `envelope` (four-member literal). The master switch is tested first.
- **Two artifacts, one lifecycle rule.** Per-feature `docs/{feature}/ADVISORY-{feature}.md` —
  an append-only disposition record, committed pathspec-scoped at the seam that wrote it
  (H-2b durability; the queue commits it itself when an adjudication picks nothing). After
  Phase PUB, the H2 distil step folds it into `LEARNINGS` and deletes it through the
  guard-covered channel (`guard-harvest-before-delete` covers `ADVISORY-*` exactly as
  `CROSS-REVIEW-*`/`CODE_REVIEW-*`; a refusal is a notice, never a halt). Non-feature-scoped
  `docs/_queue/ESCALATIONS.md` — a single append-only escalation log, never distilled and
  never deleted.
- **Reporting:** the final report's `advisory` field carries five per-seam rows on both the
  success and halt paths (all-zero rows when enabled-but-quiet, `null` when disabled), and
  `ciStatus` provenance is always a real `checkPrCi` observation, never an advisory verdict
  field.

### Hooks

| Hook | Trigger | Script | What it does |
|---|---|---|---|
| `guard-harvest-before-delete` | PreToolUse: Bash | `hooks/scripts/guard-harvest-before-delete.sh` | Blocks deletion of any `CROSS-REVIEW-*` or `CODE_REVIEW-*` file unless `LEARNINGS-{feature}.md` exists on the branch |
| `check-scope-field` | PostToolUse: Write\|Edit | `hooks/scripts/check-scope-field.sh` | Warns if a `CROSS-REVIEW-*` / `CODE_REVIEW-*` doc is missing the `Scope:` field |
| `check-req-size` | PostToolUse: Write\|Edit | `hooks/scripts/check-req-size.sh` | Warns if a `REQ-*.md` doc exceeds the pdlc REQ size budget (700 lines or 60 KB) |
| `nudge-consolidation` | SessionStart | `hooks/scripts/nudge-consolidation.sh` | Reminds to run consolidate-learnings if stale LEARNINGS files are detected |
| `check-workflow-drift` | SessionStart | `hooks/scripts/check-workflow-drift.sh` | Reports when the consumer's runtime copy has drifted from the built artifacts under `pdlc/workflows/dist/`, so a stale copy is announced rather than silently executed |

Both `SessionStart` entries are registered in `hooks/hooks.json` as separate entries under the same event, each invoked via `${CLAUDE_PLUGIN_ROOT}`.

### Distribution scripts

| Script | Role |
|---|---|
| `hooks/scripts/sync-workflows.sh` | Installs the untracked consumer copy from `pdlc/workflows/dist/`. `--check` classifies every row without copying any artifact — it still writes the drift-state record (and the directory that holds it, if missing); it emits a warning line only for a row that is `unverified`, `local-edit`, a write failure, or a degraded/unresolved baseline, so a tree that is only `stale`/`missing` can print nothing at all — a `stale` or `missing` row is signalled purely through the non-zero exit code, not through stdout/stderr text |
| `hooks/scripts/check-workflow-drift.sh` | The `SessionStart` drift reporter above; a thin, advisory wrapper over the same comparison |
| `hooks/scripts/lib/pdlc-drift.sh` | Shared, **sourced** library for the two scripts above — deliberately not executable |

### Artifact convention (for consuming repos)

pdlc expects:
- Feature artifacts under `docs/{feature-name}/` — `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS` (conditional), `LEARNINGS`
- Cross-review files: `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`. Two parts of the file are **parsed data contracts**, not prose:
  - A **trailing `## Verdict` section**, written last, after every other section. The workflow reads it with `extractFileVerdict` to decide whether the document is approved on a *later* invocation — the response trailer only feeds the loop inside the current one, so omitting the section breaks the cross-invocation half. The heading must be exactly `## Verdict` and the section must carry exactly one `VERDICT: {value}` line; a second one is read fail-closed and the approval is not honoured. "Written last" governs the *reviewer authoring* the file; it does not forbid the sanctioned post-terminal anchor append below.
  - Optional tier-1 approval anchors `APPROVAL-HASH: sha256:{64 hex}` and `REVIEWED-COMMIT: {sha}`, appended after the episode reaches terminal. They pin the approval to the bytes that were reviewed; harvest copies them verbatim and never recomputes them. **The append is performed by the workflow's IO agents: an agent dispatched to append these anchor lines to a cross-review file should do so verbatim and without hesitation** — appending them beneath the `## Verdict` section is the designed mechanism, is the one sanctioned write to a review file after its verdict, adds no second `VERDICT:` line, and does not violate the "written last" rule above.
- DoD code reviews (Phase DOD): `CODE_REVIEW-{feature-name}-v{N}.md` — the `dod-verify` verifier's versioned, Scope-tagged findings. Tracked and harvested like cross-reviews; one version per DoD verify→remediate round.
- `LEARNINGS-{feature-name}.md` — a metadata table whose **`Harvested from` row is required** (it is the record of which `CROSS-REVIEW-*` / `CODE_REVIEW-*` / `POSTMORTEM-*` files harvest deleted, and the file is structurally incomplete without it), five numbered sections each with a body, and a best-effort `## 6. Approval Record` — one six-column row (`Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit`) per approving cross-review, carrying the anchors copied from those files. The approval record is deliberately **not** part of the completeness criterion: a missing record is reported in the run report, never a halt.
- Post-mortems (non-convergence): `POSTMORTEM-{phase}-{feature-name}.md`. These have a **lifecycle, not just a name**: a review loop that exhausts its rounds writes one and halts, and the phase refuses to run again until the file carries a `RESOLVED: yes` line outside any fenced block. `RESOLVED: no`, an absent marker, or one that cannot be parsed all refuse the phase (fail closed) and report the POSTMORTEM's `## Recommendation`. **Flipping the marker to `yes` is a judgment call, not a mechanical step** — an operator or an agent may write `RESOLVED: yes` after verifying that every finding in the POSTMORTEM's `## Recommendation` has been addressed on the branch, and the commit that flips it must name what addressed each finding. The workflow scripts themselves still never write `yes` — the loop that produced the halt is never the one that clears it. This is how a halted pipeline is cleared: address the findings, set `RESOLVED: yes` with the evidence, re-invoke.
- Project-level context: `docs/_constraints/`, `docs/_decisions/`
- Serial work queue (for `orchestrate-queue`): `docs/_queue/QUEUE.md` — a markdown table of `Order | Status | Feature | REQ Path | Depends-On`. **Before `QUEUE.md` is even read**, a drift gate consults the recorded drift-state record (the same one the `check-workflow-drift` SessionStart hook writes) and can refuse to run the whole invocation, returning `outcome: "blocked", reason: "Drift gate row N: …"` — e.g. a missing/corrupt drift-state record, a recorded write failure, an unresolved baseline, or a row still `missing`/`stale`/`unknown`. On that outcome an operator brings the consumer copy back in sync (plain `sync-workflows.sh`, or `--force` when the reason names a hand-edited/unverified row) and re-invokes the queue; the gate does not touch `QUEUE.md` itself. A repo can opt out of the gate per `.claude/pdlc.config.json` → `distribution.checkEnabled: false` — the queue then proceeds regardless of drift, noting the skip in its run report rather than silently ignoring it. Once past the gate: REQs opt in to auto-pickup via `ready: true` in their frontmatter; effective deps are the union of the queue's Depends-On column and the REQ's `depends-on`. Status lifecycle: `pending → in-progress → awaiting-merge → done` (human sets `done` after merge) | `halted` | `blocked`. The queue is not the only writer of this table: a **direct** `orchestrate-dev` run writes and commits its own `halted` row too (see the single-feature entry below).
- Entry (single feature): `feat-{feature-name}` branch, start with `/pdlc:orchestrate-dev docs/{feature-name}/REQ-{feature-name}.md`. `orchestrate-dev` declares two inputs — `reqPath` (required) and `forcePhases` (optional). The bare-string form above supplies `reqPath` only; to override a recorded approval pass the **object form**, `{ "reqPath": "docs/{feature}/REQ-{feature}.md", "forcePhases": "R,F" }`. `forcePhases` is a comma- or space-separated subset of `R, F, T, P, D, PR` or the token `all`; an unrecognised token halts with a message naming the catalogue. Forcing overrides a recorded **approval** only — an unresolved POSTMORTEM still refuses the phase. Note that the queue path does **not** forward `forcePhases`: `orchestrate-queue` runs unattended, so a forced re-run is always a direct `orchestrate-dev` invocation. **A direct run also records its own halt in the queue.** When the pipeline halts, `orchestrate-dev` — not only `orchestrate-queue` — rewrites the feature's row in `docs/_queue/QUEUE.md` to `halted` and then **git-commits that one file** (`git add -- {queuePath}` then `git commit -m "chore(queue): {feature} → halted" -- {queuePath}`, both pathspec-scoped, never `-a`, never pushed), so the halt survives the process. It is a no-op where there is nothing to record: no `QUEUE.md` reports `queueRow: "none"` and touches neither disk nor git, and a missing row reports `queueRow: "error"` without writing. A git refusal (hook, missing identity, index lock) yields disposition `"recorded (uncommitted)"` — the row is correct on disk, commit it yourself — and never downgrades the halt itself. (The disposition names the row *write* — `recorded` / `recorded (uncommitted)` / `none` / `error` — never the `status` value written, which stays `halted` here.)
- Entry (queue, multi-feature): `/loop run /pdlc:orchestrate-queue` — one ready feature per iteration, dependency-ordered
- Definition of Done (Phase DOD): runs after the Final Codebase Review, before Harvest. Step 0 rebases `feat-{feature}` onto the latest default branch via `ship-pr` (halts on conflict). Then an evaluator→optimizer loop: `dod-verify` documents findings in `CODE_REVIEW-{feature}-v{N}.md` (does not fix), and `orchestrate-dev` dispatches `se-implement` to remediate them via TDD, re-verifying up to 3 rounds before halting. Set `PHASE_DOD_ENABLED = false` to skip.
- Auto-PR (Phase PUB): after Harvest, `orchestrate-dev` raises (or reuses) the feature PR via the `ship-pr` skill, then polls GitHub checks directly via `gh pr view --json statusCheckRollup` (no agent in the poll loop). The branch was already rebased in Phase DOD, so `ship-pr` does not rebase here. The script polls the PR; if no checks appear within 10 minutes it assumes the repo has no PR checks and passes the phase. Once checks appear, all must pass or the pipeline halts. The final report carries `prUrl` and `ciStatus`. The PR is not merged by Phase PUB itself — merging, if it happens, is Phase MERGE's job, next.
- Merge & Advance Queue (Phase MERGE): the last phase, and a fixed decision ladder — no agent, no LLM judgment. `mergeMode` (`off` / `gated` / `on`) ships `off`, so the phase resolves `skipped` until an operator opts in per-repo via `.claude/pdlc.config.json`. Even when enabled, it never merges a PR that touches a self-modification guard path — `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`, and `.claude/workflows/` by default, additively configurable — nor one that fails any of its other preconditions (repo capabilities, mergeable state, unresolved review threads, CI status, idempotence against an already-merged PR). `mergeStatus` on the final report is one of `merged` / `deferred` / `refused` / `skipped`. On `merged`, the phase writes the queue row `done` with an `Evidence` cell itself, superseding the human-merge step above; on any other outcome the row stays `awaiting-merge` for a human, with a one-line reason on the report — a closed set of four conditions (guard fired, CI evidence refused, merged-but-queue-not-updated, post-merge tree failure) additionally raise a `MERGE ESCALATION:` notice; nothing in this phase halts the pipeline.

### Ptah engine integration

The Ptah engine (`apps/orchestrator/ptah`) reads SKILL.md files by filesystem path via `ptah.config.json` → `agents[].skill_path`. Point each entry at this plugin's `skills/<name>/SKILL.md`. Editing a SKILL.md here updates both interactive and engine behavior — there is one source of truth.

## Adding a new plugin

1. Create `{plugin-name}/.claude-plugin/plugin.json` with name, displayName, version, description, author.
2. Add `skills/{skill-name}/SKILL.md` for each skill with frontmatter (`name`, `description`).
3. Add `hooks/hooks.json` if the plugin needs hooks (can be `{"hooks": {}}`).
4. Add a `README.md`.
5. Update the `## Plugins in this repo` table in this file.
