---
feature: pdlc-workflow-distribution
ready: true
depends-on: []
---

# REQ — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `docs/design/MASTER-PLAN-engineering-loop.md` (Break 3, order 1) |
| Downstream | `pdlc-merge-phase`, `pdlc-consolidation-agent`, `pdlc-engineering-loop` |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md` |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 2.0 | 2026-07-27 |

> **Scope in one line.** Ship the executable workflow artifact inside the plugin package, detect
> drift between it and the runtime-loaded consumer copy, and give the operator one explicit
> command to repair it — so a merged workflow improvement actually executes.

## 0. Grounding

This REQ is grounded against commit **`e4b5dbc`** on `feat-pdlc-workflow-distribution`, with the
working tree in the state below. v1 of this REQ was grounded against `cb5e5f7` and modelled the ES
module as the distribution unit; the concurrent bundle work (untracked at v1) has superseded that.
All hashes below are `sha1`, measured 2026-07-27 in `/Volumes/T9/workspace/yumo-plugins`:

| Node | Path | `orchestrate-dev` | `orchestrate-queue` |
|---|---|---|---|
| A. Repo source (ES module) | `pdlc/workflows/{name}.js` | `2cfc66c1…` | *(unmodified at HEAD)* |
| A′. Repo generated bundle | `.claude/workflows/{name}.bundle.js` | `ae2e586f…` | `b2dd0f74…` |
| B. Installed plugin cache | `~/.claude/plugins/cache/yumo-plugins/pdlc/0.10.0/workflows/{name}.js` | `b8815b28…` | `192974cd…` |
| C. Consumer runtime copy | `.claude/workflows/{name}.js` | `b8815b28…` | `192974cd…` |

Facts this REQ must respect, each verified above:

1. **The executing artifact is the bundle, not the module.** `CLAUDE.md` and
   `pdlc/workflows/build-runtime.mjs` both state the runtime allows no `import`, no second
   `export`, no `fs`/`process`. `pdlc/workflows/orchestrate-dev.js` imports `fs`; it is not
   loadable. `.claude/workflows/orchestrate-dev.bundle.js` is.
2. **The bundle is a transform of its sources, never byte-equal to them.** Module syntax is
   stripped, bodies are IIFE-wrapped, `runtime-adapter.js` is inlined. Node A and node A′ hashes
   above differ by construction, so "byte-identical to the plugin source" is only a meaningful
   oracle when both sides are the *same kind* of artifact.
3. **The installed plugin package contains no bundle.** `…/pdlc/0.10.0/workflows/` holds
   `orchestrate-dev.js`, `orchestrate-queue.js`, `package.json`, `package-lock.json`, `__tests__/`
   — no `*.bundle.js`, no `build-runtime.mjs`, no `runtime-adapter.js`. A consumer holding only
   the installed plugin can neither copy nor regenerate the executing artifact. This is the
   premise BL-01 must prove, and REQ-DIST-06 is what makes it true.
4. **The installed layout has no `pdlc/` segment.** It is `${CLAUDE_PLUGIN_ROOT}/workflows/…`.
   The `pdlc/workflows/…` form is the *repo* layout only.
5. **The plugin version does not identify workflow content.** Cached `0.9.0` and `0.10.0` ship
   byte-identical `orchestrate-dev.js` (`b8815b28…` both). Any drift signal keyed on plugin
   version would assert a difference that does not exist.
6. **Two plugin versions are cached concurrently** (`0.9.0`, `0.10.0`). "The installed plugin" is
   not singular on disk and must be resolved, never globbed.
7. **Live drift exists in this repo today.** Node C (`b8815b28…`) differs from node A
   (`2cfc66c1…`) because `pdlc/workflows/orchestrate-dev.js` is modified in the working tree. The
   v1 claim that a spot-checked consumer was "byte-identical, last synced five days earlier" was
   not reproducible and is withdrawn; the table above replaces it.

## 1. Problem

`SKILL.md` files load live from the installed plugin — `CLAUDE.md` states it: "edit them here
and both interactive Claude Code sessions and the Ptah engine pick up the change automatically
(no copies to sync)." Workflow scripts do not. Both orchestrator SKILLs record the same
convention:

> Canonical plugin source: `pdlc/workflows/orchestrate-dev.js`
> Runtime-loaded consumer copy: `.claude/workflows/orchestrate-dev.js`
> … Until a formal `pdlc install` mechanism exists, this copy is managed manually.

"Managed manually" means: a workflow improvement can be authored, reviewed, merged and archived
in `yumo-plugins`, and never run anywhere, because no consumer copied it. There is no check, no
warning, and no symptom. The pipeline keeps working — on the old script.

The bundle work makes this strictly worse. There are now **three** nodes in the chain, not two:

```
A. repo  pdlc/workflows/*.js  --build-runtime.mjs-->  A′. pdlc/workflows/dist/*.bundle.js
                                                          |
                                          (plugin publish/update, version-pinned)
                                                          v
                                    B. ${CLAUDE_PLUGIN_ROOT}/workflows/dist/*.bundle.js
                                                          |
                                                  (manual copy today)
                                                          v
                                       C. consumer .claude/workflows/*.bundle.js
```

Today node A′ is untracked, node B does not exist at all, and node C is maintained by a human's
memory. Every later feature in the engineering-loop plan ends with "and then the improved pipeline
runs" — which is false while any of those three links is unmechanised.

This REQ closes A′→B (REQ-DIST-06: ship the built bundle in the package) and B→C (detection +
explicit sync). Node A→A′ is already closed by `build-runtime.mjs --check` and
`__tests__/runtimeBundle.test.js`. Refreshing node B from the marketplace is Claude Code's own
plugin-update mechanism and is out of scope (D-DIST-05).

## 2. User stories

- **US-01** — As the operator, I want to be told at session start when a consumer repo is running
  a stale workflow artifact, so I never debug behavior that the source no longer describes.
- **US-02** — As the operator, I want a single command to bring a consumer repo's workflow copies
  up to date.
- **US-03** — As the operator, I want the drift check to tell me *which direction* the drift runs,
  because a consumer copy edited locally is a different problem from a consumer copy left behind,
  and I want that answer to be deterministic rather than an artifact of when files were checked out.
- **US-04** — As the consolidation agent, I want a merged workflow change to be published in the
  plugin package and to reach the consumers it was written for, otherwise my promotion is a no-op.

## 3. Requirements

### REQ-DIST-00 — Managed set and comparison baseline

- **AC-0.1** — Who: any drift check. Given the plugin ships a distribution manifest at
  `${CLAUDE_PLUGIN_ROOT}/workflows/distribution-manifest.json`, When the check enumerates what to
  compare, Then that manifest is the **sole** enumeration authority: one row per managed artifact,
  each row `{ id, pluginPath, consumerPath }` relative to `${CLAUDE_PLUGIN_ROOT}` and the consumer
  repo root respectively. Directory globbing of `workflows/` is prohibited. *(P0)*
- **AC-0.2** — Who: any drift check. Given the manifest, When it is read, Then it contains exactly
  the two runtime-loadable bundles at v1 —
  `workflows/dist/orchestrate-dev.bundle.js → .claude/workflows/orchestrate-dev.bundle.js` and
  `workflows/dist/orchestrate-queue.bundle.js → .claude/workflows/orchestrate-queue.bundle.js` —
  and **no** ES module source, `runtime-adapter.js`, `build-runtime.mjs`, `package.json`,
  `package-lock.json`, `.gitignore`, `__tests__/` or `node_modules/` entry. Those are build
  inputs or tooling and must never be copied into a consumer. *(P0)*
- **AC-0.3** — Who: any drift check. Given the comparison baseline, When "the plugin source" is
  resolved, Then it is **node B**, the installed plugin root addressed via `${CLAUDE_PLUGIN_ROOT}`
  — the same mechanism all three shipped hooks in `pdlc/hooks/hooks.json` already use. The
  checked-out `yumo-plugins` working tree is never a baseline: a consumer machine generally does
  not have one, and this repo's own `.claude/workflows/` is treated as an ordinary consumer of the
  installed plugin (dogfooding). *(P0)*
- **AC-0.4** — Who: any drift check. Given multiple plugin versions are cached (today `0.9.0` and
  `0.10.0`), When the baseline is resolved, Then resolution uses `${CLAUDE_PLUGIN_ROOT}` verbatim
  and never enumerates, sorts, or version-compares cache directories. Given `${CLAUDE_PLUGIN_ROOT}`
  is unset or does not resolve to a readable directory, Then every managed artifact is reported
  `unknown` (AC-1.2) and no cache directory is guessed. *(P0)*
- **AC-0.5** — Who: any drift check. Given the consumer repo root, When the session or command
  starts in a subdirectory, Then the repo root is resolved by walking upward to the nearest
  directory containing `.claude/`, falling back to `git rev-parse --show-toplevel`; if neither
  resolves, the result is `unknown` with that reason. *(P0)*

**Comparison semantics for a generated artifact (resolves the "in-sync means what?" question).**
Both sides of the comparison are the *same* generated bundle: node B ships the bundle that
`build-runtime.mjs` emitted at publish time, and node C holds a copy of it. "In-sync" is therefore
plain byte equality of two bundles — not source-vs-generated, and not a consumer-side rebuild
(consumers have neither `build-runtime.mjs` nor `runtime-adapter.js`, and this REQ does not add
them). The source→bundle relation stays where it already lives: `build-runtime.mjs --check` and
`__tests__/runtimeBundle.test.js` in this repo's CI.

### REQ-DIST-01 — Drift detection

- **AC-1.1** — Who: the operator. Given a manifest row whose `pluginPath` resolves under
  `${CLAUDE_PLUGIN_ROOT}` and whose `consumerPath` exists, When the check runs, Then it compares
  the two by content hash and the sync manifest (AC-1.6) and reports exactly one of the seven
  states in the table below. *(P0)*

  | State | Condition | Meaning |
  |---|---|---|
  | `in-sync` | consumer bytes == plugin bytes | nothing to do |
  | `stale` | differ; consumer hash == hash recorded by the last sync | consumer is behind; safe to sync |
  | `local-edit` | differ; consumer hash != hash recorded by the last sync | consumer was edited after sync; syncing destroys work |
  | `unverified` | differ; no sync-manifest entry for this row | never synced by this tool; direction unknown |
  | `missing` | consumerPath absent | consumer has no copy |
  | `not-managed` | a file in `.claude/workflows/` with no manifest row | repo-local workflow; never touched |
  | `unknown` | plugin baseline unresolvable / unreadable (AC-0.4, AC-0.5) | nothing was verified |

- **AC-1.2** — Who: the operator. Given the plugin baseline is unreachable (plugin not installed,
  `${CLAUDE_PLUGIN_ROOT}` unset, path unreadable), When the check runs, Then it reports `unknown`
  with the reason and does **not** report `in-sync`. Absence of evidence is not evidence of sync.
  *(P0)*
- **AC-1.3** — Who: the operator. Given a consumer bundle byte-identical to the plugin's shipped
  bundle, When the check runs, Then the result is `in-sync` regardless of file timestamps. No
  state in AC-1.1 is decided by mtime; mtime is never read. *(P0)*
- **AC-1.4** — Who: the operator. Given multiple manifest rows, When the check runs, Then each is
  reported independently; one `stale` row does not mask a second `stale` row, and one `unknown`
  row does not suppress the states of the others. *(P0)*
- **AC-1.5** — Who: the operator. Given a file in `.claude/workflows/` with no manifest row (a
  workflow the consuming repo authored for its own domain), When any operation in this feature
  runs, Then it is reported `not-managed` and is never read for comparison, never overwritten, and
  never deleted. *(P0)*
- **AC-1.6** — Who: the sync command and the check. Given a sync writes a managed artifact, When
  it completes, Then it records `{ id, consumerHash, pluginHash, pluginVersion, syncedAtUtc }` for
  that row in the **sync manifest** at `.claude/workflows/.pdlc-sync-manifest.json` in the
  consumer repo. This file is the sole provenance source for the `stale` / `local-edit` /
  `unverified` discrimination in AC-1.1, replacing mtime entirely. *(P0)*
- **AC-1.7** — Who: the operator on a repo that has never synced. Given no sync manifest exists,
  or it exists with no entry for a row, When that row's bytes differ, Then the state is
  `unverified` — never `stale` and never `local-edit`. `unverified` is always surfaced (AC-2.5),
  its remediation is "diff, then sync", and sync requires `--force` (AC-3.2). This is the common
  first-run case and it must be safe in both directions: it must not silently overwrite a real
  local edit, and it must not silently hide a real staleness. *(P0)*
- **AC-1.8** — Who: the test author. Given the classifier, Then it satisfies, as requirements and
  not as test detail: **(i) totality** — every combination of {plugin bytes present/absent,
  consumer bytes present/absent, equal/unequal, manifest entry present/absent/mismatched, baseline
  resolvable/not} maps to exactly one of the seven states, with no undefined fall-through;
  **(ii) mutual exclusivity** — the seven states are disjoint, no input yields two;
  **(iii) determinism** — the same filesystem inputs yield the same state on repeated runs within
  and across processes, with no dependence on clock, mtime, environment ordering or directory
  iteration order. *(P0)*

### REQ-DIST-02 — SessionStart warning

- **AC-2.1** — Who: the operator. Given a `SessionStart` hook and any managed row in state `stale`
  or `missing`, When the session starts, Then a warning names the row `id`, the state, and the
  exact remediation command. *(P0)*
- **AC-2.2** — Who: the operator. Given **every** managed row is `in-sync` (and any `not-managed`
  files are ignored), When the session starts, Then the hook emits nothing. Silence means every
  managed row was verified in-sync — it never means "some rows could not be checked". *(P0)*
- **AC-2.3** — Who: the operator. Given state `local-edit`, When the warning is emitted, Then it
  is textually distinct from `stale` and explicitly does **not** recommend the plain sync command,
  because syncing would discard the local edit; it names `--force` and the backup location instead.
  *(P0)*
- **AC-2.4** — Who: the operator. Given the hook fails for any reason (missing manifest, unreadable
  plugin root, malformed JSON, hashing tool absent), When the session starts, Then the hook exits
  `0` with the failure written to stderr and to the drift state file (AC-2.6) as `unknown` with the
  reason. A broken drift check must never block a session from starting. *(P0)*
- **AC-2.5** — Who: the operator. Given state `unknown` or `unverified` on any managed row, When
  the session starts, Then the hook **warns** — it is never silent — the message carries the
  resolution-failure reason (`unknown`) or the "no sync provenance" reason (`unverified`), and each
  is distinguishable in the output from `stale`, from `local-edit`, and from each other. This is
  what makes AC-1.2 operative rather than decorative. *(P0)*
- **AC-2.6** — Who: `orchestrate-queue`. Given the hook completes (successfully or not), When it
  exits, Then it has written the full per-row result to `.claude/workflows/.pdlc-drift-state.json`
  as `{ schemaVersion, generatedAtUtc, pluginVersion, rows: [{ id, state, reason, pluginHash,
  consumerHash, pluginArtifactVersion, consumerArtifactVersion }] }`. This file is the queue's
  input (AC-4.1) and is what keeps classification out of the workflow runtime. *(P0)*

### REQ-DIST-03 — Sync action

**Delivery vehicle.** Sync is a POSIX shell script shipped in the plugin at
`${CLAUDE_PLUGIN_ROOT}/hooks/scripts/sync-workflows.sh`, invoked directly by the operator. It is
**not** an LLM prompt: every `/pdlc:*` surface today is a `SKILL.md`, and an LLM-driven file copy
is neither deterministic (NFR-1) nor auditable. A thin `skills/sync-workflows/SKILL.md` may exist
as a discoverability affordance, but its only permitted action is to run that script verbatim and
relay its output; it makes no classification or copy decisions of its own.

- **AC-3.1** — Who: the operator. Given `sync-workflows.sh` with no flags, When it runs, Then every
  managed row in state `stale` or `missing` is copied from `pluginPath` to `consumerPath`, each
  copy is reported with both hashes, and the sync manifest (AC-1.6) is updated for each copied row.
  Rows in `local-edit`, `unverified`, `not-managed` or `unknown` are not copied. *(P0)*
- **AC-3.2** — Who: the operator. Given a row in state `local-edit` or `unverified`, When sync runs
  without `--force`, Then it is **not** overwritten, it is reported with the reason, and the
  command's exit code reflects it (AC-3.3). Given `--force`, Then it is overwritten after a backup
  (AC-3.4). *(P0)*
- **AC-3.3** — Who: CI. Given `--check`, When it runs, Then it reports drift, copies nothing,
  writes nothing except the drift state file, and exits per this complete table — highest
  applicable code wins, so the exit code is never green while anything is unverified: *(P0)*

  | Condition (evaluated in this precedence order) | Exit |
  |---|---|
  | any row `unknown` | 3 |
  | any row `local-edit` or `unverified` | 2 |
  | any row `stale` or `missing` | 1 |
  | all managed rows `in-sync` (`not-managed` files present or not) | 0 |

  Exit `0` therefore asserts "every managed row was compared against a resolved baseline and
  matched" — the CI form can never go green having verified nothing, which is AC-1.2 enforced at
  the exit code.
- **AC-3.4** — Who: the operator recovering a mistake. Given a sync overwrites any existing file,
  When the copy happens, Then the pre-sync **content** is first written to
  `.claude/workflows/.pdlc-backups/{id}.{UTC-ISO8601-compact}.bak`. Backups are never overwritten
  (the timestamp makes each unique), the newest 5 per `id` are retained and older ones pruned, and
  the backup directory is created if absent. A recorded hash is **not** an acceptable substitute —
  a digest is one-way and cannot restore content. *(P0)*
- **AC-3.5** — Who: the operator. Given `--force` overwrote a `local-edit` or `unverified` row,
  When the newest backup for that `id` is restored to `consumerPath`, Then the file is
  byte-identical to its pre-sync content. Restore is the only oracle for AC-3.4 that cannot be
  false-greened. *(P0)*
- **AC-3.6** — Who: the operator. Given a sync completes, When `--check` is run immediately after
  with no intervening edit, Then every row the sync copied reports `in-sync`, and every row the
  sync skipped reports the same state it held before the sync. *(P0)*
- **AC-3.7** — Who: the operator. Given a sync completes, When sync is run a second time with the
  same flags and no intervening edit, Then it copies nothing, writes no new backup, leaves the
  sync manifest byte-identical, and exits `0`. Sync is idempotent. *(P0)*
- **AC-3.8** — Who: the operator on a fresh consumer. Given the consumer repo has no
  `.claude/workflows/` directory at all, When `--check` runs, Then every managed row is `missing`
  (this is not a distinct state) and exit is `1`; When sync runs, Then the directory is created and
  every row is copied. *(P0)*

### REQ-DIST-04 — Pipeline integration (defense-in-depth)

**Primary detector is the hook, not the queue.** The SessionStart hook (REQ-DIST-02) ships from the
plugin and executes regardless of what the consumer's workflow copies contain; the queue check
lives *inside* the artifact whose staleness it is detecting. A consumer whose `orchestrate-queue`
bundle predates this feature contains no queue check and will never report itself stale via
AC-4.1 — the first and worst instance of the problem is covered only by the hook. REQ-DIST-04 is
therefore explicitly secondary, and the first-adoption story is: **install/update the plugin → the
hook ships with it and fires on the next session start → the operator runs sync → the queue check
exists from that point onward.** No AC in REQ-DIST-04 may be relied on for first adoption.

- **AC-4.1** — Who: `orchestrate-queue`. Given the queue begins an invocation, When it starts,
  Then it performs **one** injected file read of `.claude/workflows/.pdlc-drift-state.json`
  (AC-2.6) — it does not hash, enumerate or classify anything itself — and maps the states it
  finds to an outcome per this complete table: *(P0)*

  | Highest-precedence state present | Queue outcome |
  |---|---|
  | any `unknown`, or the drift state file is absent / unparseable / older than the current session start | `blocked` |
  | any `missing` | `blocked` |
  | any `stale` | `blocked` |
  | any `local-edit` or `unverified` | proceed, with the rows named in the run report |
  | all `in-sync` (plus any `not-managed`) | proceed silently |

  `local-edit` and `unverified` proceed because they represent a deliberate or unknown operator
  divergence that blocking would strand; `unknown` blocks because AC-1.2's rule applies at the
  queue seam too.
- **AC-4.2** — Who: the operator. Given AC-4.1 blocks, When the report is written, Then it names
  each blocking row `id`, its state, its reason, and the exact remediation command, so the
  operator's next turn is one command rather than an investigation. *(P0)*
- **AC-4.3** — Who: the consuming-repo operator. Given the consumer file
  `.claude/pdlc.config.json` with key `distribution.checkEnabled` set to `false`, When the queue
  starts, Then AC-4.1 is skipped entirely and the skip is noted in the report. Given the file is
  absent, unparseable, or the key is absent, Then the value defaults to `true`. See the threshold
  table in §4 for owner and rationale — in particular, this flag deliberately does **not** live in
  the workflow source, because a flag inside the drifting artifact would make an operator's toggle
  a `local-edit`. *(P1)*

### REQ-DIST-05 — Version stamping (reporting only)

- **AC-5.1** — Who: the operator reading a drift report. Given each canonical module declares its
  artifact version as `meta.version` (`export const meta` is already the mandatory first statement
  and only export), and `build-runtime.mjs` propagates that value into the emitted bundle's `meta`
  literal, When a row is not `in-sync`, Then the report includes both the plugin-side and
  consumer-side `meta.version` so the report says *how far behind*, not merely *that it differs*.
  Versions are semver and ordered by semver comparison. *(P1)*
- **AC-5.2** — Who: the operator. Given the content hash and the version stamp disagree (a
  hand-edited stamp, a rebuilt bundle with an unbumped version), When the state is decided, Then
  the **content hash is authoritative and the version is reporting-only**. No state in AC-1.1 is
  ever decided by a version comparison. *(P0)*
- **AC-5.3** — Who: the operator on a pre-feature artifact. Given a bundle carrying no
  `meta.version` — which is every artifact at HEAD, i.e. the entire first-run population — When
  the report is produced, Then the version renders as `unknown` and no state, exit code or queue
  outcome changes as a result. Absence of a stamp is never an error. *(P1)*
- **AC-5.4** — Who: the operator. Given the plugin's `plugin.json` version, When the report is
  produced, Then it is included as **context only**, explicitly labelled as not a drift signal:
  cached `0.9.0` and `0.10.0` ship byte-identical workflow files (§0 fact 5), so plugin version
  demonstrably does not identify workflow content. *(P2)*

### REQ-DIST-06 — Publish the executable artifact in the plugin package

This is the requirement US-04 traces to, and the precondition for every copy AC above: today there
is nothing in the plugin package to copy (§0 fact 3).

- **AC-6.1** — Who: the release. Given `node pdlc/workflows/build-runtime.mjs`, When it runs, Then
  it emits the bundles to a tracked, shipped location `pdlc/workflows/dist/*.bundle.js` (in
  addition to keeping this repo's own `.claude/workflows/` consumer copies working), and those
  files are committed — not untracked as at §0. *(P0)*
- **AC-6.2** — Who: a consumer. Given a plugin installed from the marketplace at version *V*, When
  `${CLAUDE_PLUGIN_ROOT}/workflows/dist/` is listed, Then it contains exactly the bundles named in
  the distribution manifest, byte-identical to those built from that release's sources. *(P0)*
- **AC-6.3** — Who: CI on `yumo-plugins`. Given a commit changes any of `orchestrate-dev.js`,
  `orchestrate-queue.js` or `runtime-adapter.js`, When CI runs, Then `build-runtime.mjs --check`
  fails unless the committed `dist/` bundles were rebuilt in the same commit, so node A→A′ can
  never drift. *(P0)*
- **AC-6.4** — Who: the maintainer. Given the migration from `.js` copies to `.bundle.js` copies,
  When this feature lands, Then all five places that state the superseded two-node convention are
  updated consistently in the same change: `CLAUDE.md`, `docs/_queue/QUEUE.md`,
  `pdlc/skills/orchestrate-dev/SKILL.md`, `pdlc/skills/orchestrate-queue/SKILL.md`, and the module
  header comment in `pdlc/workflows/orchestrate-dev.js`. *(P1)*

## 4. Declared thresholds, flags and locations

Every configured value this REQ's ACs depend on, with default and owner. No AC may cite a value
absent from this table.

| Name | Location | Default | Owner | Notes |
|---|---|---|---|---|
| `distribution.checkEnabled` | `.claude/pdlc.config.json` (consumer repo; new file, absent ⇒ defaults) | `true` | consuming-repo operator | AC-4.3. Deliberately outside any distributed artifact. |
| distribution manifest | `${CLAUDE_PLUGIN_ROOT}/workflows/distribution-manifest.json` (shipped) | 2 rows (AC-0.2) | pdlc maintainer | Sole enumeration authority. |
| sync manifest | `.claude/workflows/.pdlc-sync-manifest.json` (consumer) | absent ⇒ all rows `unverified` | written by sync only | AC-1.6, AC-1.7. |
| drift state file | `.claude/workflows/.pdlc-drift-state.json` (consumer) | absent ⇒ queue `blocked` | written by hook only | AC-2.6, AC-4.1. |
| backup dir | `.claude/workflows/.pdlc-backups/` (consumer) | created on demand | sync script | AC-3.4. |
| backup retention | same | newest **5** per `id` | pdlc maintainer | AC-3.4. |
| drift-check latency budget | NFR-2 fixture | p95 ≤ 500 ms | pdlc maintainer | Observation, not a gate — see NFR-2. |
| plugin-root resolution | `${CLAUDE_PLUGIN_ROOT}` | set by the harness | Claude Code | Unset ⇒ `unknown` (AC-0.4). |

All four consumer-side state files live under `.claude/workflows/` and are `not-managed` by
definition (no manifest row), so they can never be copied, compared, or destroyed by sync.

## 5. Non-functional requirements

- **NFR-1 — No LLM in the classification path.** Classification is content hashing plus JSON
  reads, executed by the POSIX shell script. Scoped per surface:
  - *Hook and `sync-workflows.sh`*: fully deterministic, no agent involvement whatsoever.
  - *Queue (AC-4.1)*: the workflow runtime has no `fs`/`process`; all IO reaches it through
    `runtime-adapter.js` as `agent()` calls. The queue therefore performs **one** injected read of
    an already-computed, deterministic JSON file and makes no classification decision. No hashing,
    enumeration or judgement happens in an LLM turn. This is the concrete mechanism that keeps
    NFR-1 true at a surface that cannot touch the filesystem directly.
- **NFR-2 — Latency, observed not gated.** Against a fixture of ≤ 8 managed artifacts totalling
  ≤ 512 KB, warm page cache, on the reference CI runner, the check should complete at p95
  ≤ 500 ms. This is a **non-gated observation**: no test asserts wall-clock time, because an
  unqualified timing assertion on shared CI is a coin flip. Exceeding it is a maintainer-owned
  performance bug, not a build failure. Anyone tempted to write a timing test should read this
  clause instead.
- **NFR-3 — Never touch unmanaged files.** The check and sync never read for comparison, modify,
  or delete any file without a distribution-manifest row (AC-1.5, AC-0.1).
- **NFR-4 — Detection automatic, modification explicit.** The sync operation never runs implicitly:
  not from the hook, not from the queue, not from a SKILL. Detection is automatic everywhere;
  modification is always an explicit operator command.
- **NFR-5 — POSIX shell.** The SessionStart hook and `sync-workflows.sh` are POSIX-shell
  compatible, matching the existing scripts in `pdlc/hooks/scripts/`, and depend only on tools
  already assumed by those scripts plus a content-hash utility (`shasum`/`sha1sum`, with the
  absence of both handled as `unknown` per AC-2.4).
- **NFR-6 — Fail-open at the session seam, fail-closed at the queue seam.** The hook must never
  prevent a session from starting (AC-2.4); the queue must never run a feature on an unverified
  pipeline (AC-4.1). These opposite defaults are deliberate.

## 6. Scope

**In scope:** publishing built bundles in the plugin package (REQ-DIST-06); a
distribution-manifest-driven managed set; seven-state drift detection with hash-based provenance;
the SessionStart warning hook and its drift state file; `sync-workflows.sh` with
`--check` / `--force`, backups and restore; queue integration as defense-in-depth; version stamping
as reporting-only; classifier invariant tests; updating the five documents in AC-6.4.

**Out of scope:** a full `pdlc install` package manager; distributing `SKILL.md` files (they
already load live); distributing `build-runtime.mjs` / `runtime-adapter.js` or rebuilding bundles
consumer-side; auto-syncing without operator action; syncing repo-local workflows; detecting that
the *installed plugin cache itself* is behind the marketplace (that is Claude Code's plugin
updater — D-DIST-05).

## 7. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `${CLAUDE_PLUGIN_ROOT}` resolves to a readable plugin root from a consumer repo, for `SessionStart` specifically | Executable proof: a spike hook that echoes the resolved path, run in a consumer session | Must be demonstrated at HEAD before FSPEC authoring. All three shipped hooks in `pdlc/hooks/hooks.json` already assume it for `PreToolUse`/`PostToolUse`/`SessionStart`, which is strong evidence but not proof for the value being non-empty. |
| BL-02 | The plugin package contains the artifact to copy | REQ-DIST-06 AC-6.1/AC-6.2 merged; `${CLAUDE_PLUGIN_ROOT}/workflows/dist/*.bundle.js` present in an installed plugin | Must exist before any AC in REQ-DIST-03 can be implemented. This is the premise §0 fact 3 shows is currently false. |
| BL-03 | `pdlc/hooks/hooks.json` accepts a second `SessionStart` entry alongside `nudge-consolidation.sh` | Both hooks observed firing in one session | Must be demonstrated before FSPEC authoring. |
| BL-04 | The workflow runtime's injected read (`_readFile` via `runtime-adapter.js`) can read `.claude/workflows/.pdlc-drift-state.json` and returns absence distinguishably from empty | Existing `_readFile` / `_checkFile` injection points in `pdlc/workflows/orchestrate-queue.js` | Must be confirmed before AC-4.1 is specified further in FSPEC. |

## 8. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-DIST-01 | Full `pdlc install` mechanism | Drift detection plus an explicit sync closes the loop; a package manager is a larger, separate design | `docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md` (queue row 6, `blocked`) |
| D-DIST-02 | Loading workflows directly from the plugin path (no copy at all) | Would remove the problem entirely, but depends on runtime behavior not under this repo's control | `docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md` (queue row 6, `blocked`) |
| D-DIST-03 | Auto-sync on detection | Violates NFR-4; revisit only if drift proves chronic in practice | `docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md` (queue row 6, `blocked`) |
| D-DIST-04 | Multi-consumer fan-out (sync all known consuming repos at once) | One consumer today | `pdlc-engineering-loop` (queue row 5) |
| D-DIST-05 | Detecting that the installed plugin cache (node B) is behind the marketplace | Owned by Claude Code's plugin updater, not by pdlc; this REQ closes A′→B and B→C only | `docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md` (queue row 6, `blocked`) |

## 9. Traceability

| User story | Requirements |
|---|---|
| US-01 | REQ-DIST-01 (AC-1.1–1.8), REQ-DIST-02 (AC-2.1, 2.2, 2.5) |
| US-02 | REQ-DIST-03 (AC-3.1, 3.3, 3.6–3.8) |
| US-03 | REQ-DIST-01 (AC-1.1, 1.3, 1.6, 1.7), REQ-DIST-02 (AC-2.3, 2.5), REQ-DIST-03 (AC-3.2, 3.4, 3.5) |
| US-04 | REQ-DIST-06 (AC-6.1–6.4), REQ-DIST-04 (AC-4.1, 4.2) |
