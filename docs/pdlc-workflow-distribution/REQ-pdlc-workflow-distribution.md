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
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1,2,3}.md` — six files, all on `feat-pdlc-workflow-distribution` |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 4.0 | 2026-07-27 |

> **v4.0 is a content revision.** v3.0 was a version-header bump with a byte-identical body — a
> process failure both v3 reviewers filed (SE F-01, TE F-23). Every open High and Medium from the
> v3 SE and TE reviews is addressed here; see §10 for the finding-by-finding disposition. Rule
> adopted going forward: **the version row is bumped only when the body changed.**

> **Scope in one line.** Ship the executable workflow artifact inside the plugin package, detect
> drift between it and the runtime-loaded consumer copy, and give the operator one explicit
> command to repair it — so a merged workflow improvement actually executes.

## 0. Grounding

This REQ is grounded against commit **`7534d11`** on `feat-pdlc-workflow-distribution`, with the
working tree in the state below. v1 of this REQ was grounded against `cb5e5f7` and modelled the ES
module as the distribution unit; the concurrent bundle work (untracked at v1, landed in `3991b4d`)
has superseded that. All hashes below are `sha1`, measured 2026-07-27 in
`/Volumes/T9/workspace/yumo-plugins`:

| Node | Path | `orchestrate-dev` | `orchestrate-queue` |
|---|---|---|---|
| A. Repo source (ES module) | `pdlc/workflows/{name}.js` | `2cfc66c1…` | *(unmodified at HEAD)* |
| A′. Repo generated bundle (tracked) | `.claude/workflows/{name}.bundle.js` | `ae2e586f…` | `b2dd0f74…` |
| A″. Legacy repo copy (tracked, superseded) | `.claude/workflows/{name}.js` | `b8815b28…` | `192974cd…` |
| B. Installed plugin cache | `~/.claude/plugins/cache/yumo-plugins/pdlc/0.10.0/workflows/{name}.js` | `b8815b28…` | `192974cd…` |
| C. Consumer runtime copy | `.claude/workflows/{name}.js` | `b8815b28…` | `192974cd…` |

In this repo A″ and C are the same files (this repo is also a consumer). `git ls-files .claude/`
returns all four paths — **both** the bundles and the legacy `.js` copies are tracked today.

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
8. **Two artifacts claim the same workflow name in one directory.** `.claude/workflows/` currently
   holds `orchestrate-dev.js` **and** `orchestrate-dev.bundle.js` (likewise for the queue). Both
   declare `meta.name: "orchestrate-dev"`. Which one the workflow runtime resolves is not
   documented anywhere in this repo and is not assumed by this REQ — it is **BL-05**. Whatever the
   answer, shipping a stale `.js` beside a fresh `.bundle.js` is the exact failure mode this
   feature exists to prevent, so the legacy copies must be retired, not merely ignored (AC-0.7,
   AC-3.9).
9. **`build-runtime.mjs` hand-writes each bundle's `meta`; it does not propagate the module's.**
   `pdlc/workflows/build-runtime.mjs:84-85` says so explicitly — "`meta` must be a pure literal and
   the first statement, so each bundle carries its own hand-written copy rather than re-exporting
   the module's" — and `DEV_META` / `QUEUE_META` are string constants inside the builder. Neither
   literal has a `version` key. Correspondingly, `export const meta` is **not** the first statement
   or only export of the *modules*: in `orchestrate-dev.js` it is at line 43, preceded by
   `import * as fs from "fs"` (line 15), and is one of 20 `export`s. The first-statement/only-export
   rule constrains the emitted **bundle**, never the source module. v3's AC-5.1 asserted the
   opposite; §REQ-DIST-05 is rewritten accordingly.
10. **There is no CI on this repo.** `.github/` does not exist and no other CI configuration is
    present. The only automated verification surface that exists today is
    `cd pdlc/workflows && npm test` (jest, 16 suites, including `__tests__/runtimeBundle.test.js`
    which already asserts bundle freshness). Every AC in this REQ addresses that surface; standing
    up hosted CI is deferred and bound (D-DIST-06).
11. **The sibling hooks are bash, not POSIX `sh`, and already solve JSON parsing.** All three of
    `pdlc/hooks/scripts/*.sh` start `#!/usr/bin/env bash` and each carries the same
    Python-interpreter discovery loop (probe `python3`, `python`, `py` by executing them; never
    block if none is found). This feature parses and writes four JSON files, so it reuses that
    mechanism rather than reinventing one (NFR-5, §4).
12. **The plugin package root is `pdlc/`.** `.claude-plugin/marketplace.json` declares
    `"source": "./pdlc"`. Nothing outside `pdlc/` can ship to a consumer — which is why the built
    bundles cannot be shipped from `.claude/workflows/` and REQ-DIST-06 moves the build output to
    `pdlc/workflows/dist/`.

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

**Today** (measured, §0):

```
A. repo  pdlc/workflows/*.js  --build-runtime.mjs-->  A′. .claude/workflows/*.bundle.js   [tracked]
                                                          |
                                                     (no channel)
                                                          X
                                    B. ${CLAUDE_PLUGIN_ROOT}/workflows/   ships *.js only,
                                                                          no bundle at all
                                                          |
                                                  (manual copy today)
                                                          v
                                       C. consumer .claude/workflows/*.js  [legacy, stale]
```

**After this REQ** (the change REQ-DIST-06 makes — note A′ moves):

```
A. repo  pdlc/workflows/*.js  --build-runtime.mjs-->  A′. pdlc/workflows/dist/*.bundle.js
                                                          |
                                          (plugin publish/update, version-pinned)
                                                          v
                                    B. ${CLAUDE_PLUGIN_ROOT}/workflows/dist/*.bundle.js
                                                          |
                                               (sync-workflows.sh, explicit)
                                                          v
                                       C. consumer .claude/workflows/*.bundle.js
                                          (legacy consumer .js retired — AC-3.9)
```

Today node A′ sits at a path the plugin package cannot reach (§0 fact 12), node B ships no bundle
at all (§0 fact 3), and node C is maintained by a human's memory. Every later feature in the
engineering-loop plan ends with "and then the improved pipeline runs" — which is false while any of
those links is unmechanised.

This REQ closes A′→B (REQ-DIST-06: build to a shippable path and ship it) and B→C (detection +
explicit sync), and retires the A″/C legacy `.js` copies. Node A→A′ is already closed by
`build-runtime.mjs --check` and `__tests__/runtimeBundle.test.js`. Refreshing node B from the
marketplace is Claude Code's own plugin-update mechanism and is out of scope (D-DIST-05).

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
  `${CLAUDE_PLUGIN_ROOT}/workflows/distribution-manifest.json`, When the check enumerates **the
  managed set**, Then that manifest is the sole authority for it: one row per managed artifact,
  each row `{ id, pluginPath, consumerPath, artifactVersion, pluginSha1 }`, with `pluginPath`
  relative to `${CLAUDE_PLUGIN_ROOT}` and `consumerPath` relative to the consumer repo root.
  Globbing a directory to *discover managed rows* is prohibited. `id` matches
  `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` — no `/`, no `..`, no leading dot — because AC-3.4
  interpolates it into a backup filename; a row failing this is rejected and the manifest is
  treated as malformed (AC-2.4). *(P0)*
- **AC-0.2** — Who: any drift check. Given the manifest, When it is read, Then it contains exactly
  the two runtime-loadable bundles at v1 —
  `workflows/dist/orchestrate-dev.bundle.js → .claude/workflows/orchestrate-dev.bundle.js` and
  `workflows/dist/orchestrate-queue.bundle.js → .claude/workflows/orchestrate-queue.bundle.js` —
  and **no** ES module source, `runtime-adapter.js`, `build-runtime.mjs`, `package.json`,
  `package-lock.json`, `.gitignore`, `__tests__/` or `node_modules/` entry. Those are build
  inputs or tooling and must never be copied into a consumer. The manifest additionally carries a
  `retired` array of consumer-relative paths (AC-0.7). *(P0)*
- **AC-0.3** — Who: any drift check in a **consuming** repo. Given the comparison baseline, When
  "the plugin source" is resolved, Then it is **node B**, the installed plugin root addressed via
  `${CLAUDE_PLUGIN_ROOT}` — the same mechanism all three shipped hooks in `pdlc/hooks/hooks.json`
  already use. A consumer machine generally has no `yumo-plugins` working tree, so a checked-out
  source tree is never a baseline for a consuming repo. *(P0)*
- **AC-0.3a** — Who: any drift check in the **maintainer** repo. Given the resolved repo root
  contains `pdlc/workflows/build-runtime.mjs` (the unambiguous maintainer-repo marker), When the
  baseline is resolved, Then the baseline is the **local build output** `pdlc/workflows/dist/`,
  **not** `${CLAUDE_PLUGIN_ROOT}`, and `build-runtime.mjs` itself writes the sync manifest entry
  (AC-1.6) for every file it emits into `.claude/workflows/`. Rationale, and this is a correctness
  requirement not a convenience: the maintainer repo's working tree is ahead of the last published
  release **by construction** (§0 facts 5–7), so treating it as an ordinary consumer of the
  released cache would (i) report every row `missing`/`unverified` forever, (ii) block the queue on
  its own repo, and (iii) on the first release that ships bundles, overwrite freshly built,
  git-tracked bundles with stale released ones. With this AC, the maintainer repo's green path is
  "build, then everything is `in-sync`" — reachable on real inputs, which is what makes AC-3.3
  exit 0 and AC-2.2 silence testable at all. *(P0)*
- **AC-0.4** — Who: any drift check. Given multiple plugin versions are cached (today `0.9.0` and
  `0.10.0`), When the baseline is resolved, Then resolution uses `${CLAUDE_PLUGIN_ROOT}` verbatim
  and never enumerates, sorts, or version-compares cache directories. Given `${CLAUDE_PLUGIN_ROOT}`
  is unset or does not resolve to a readable directory, Then every managed artifact is reported
  `unknown` (AC-1.2) and no cache directory is guessed. *(P0)*
- **AC-0.5** — Who: any drift check. Given the process starts in an arbitrary subdirectory, When
  the consumer repo root is resolved, Then resolution is, in this order:
  1. `git rev-parse --show-toplevel`. If it succeeds, that is the repo root — full stop.
  2. If it fails (not a git work tree), walk upward from `$PWD` to the nearest ancestor containing
     `.claude/`, **stopping before** `$HOME` and before `/`.
  3. Otherwise the result is `unknown` with reason `repo-root-unresolved`.

  A resolved root equal to `$HOME` or to `/` is **always** rejected as `unknown`, regardless of
  which step produced it. Rationale: `~/.claude/` exists on every machine running Claude Code (it
  is where the plugin cache AC-0.3 depends on lives), so a naive upward walk from a non-`.claude`
  consumer terminates at `$HOME` and sync then creates `$HOME/.claude/workflows/`,
  `$HOME/.claude/workflows/.pdlc-sync-manifest.json` and `$HOME/.claude/workflows/.pdlc-backups/`,
  polluting global config. No operation in this feature ever writes under `$HOME/.claude/`. *(P0)*
- **AC-0.6** — Who: any drift check producing a human-facing report. Given the consumer's
  `.claude/workflows/` directory, When the **report** (not the managed set) is produced, Then the
  directory is enumerated once to list files with no manifest row as `not-managed`, excluding every
  entry whose basename begins with `.pdlc-` (which covers `.pdlc-sync-manifest.json`,
  `.pdlc-drift-state.json` and the `.pdlc-backups/` directory). `not-managed` appears **only** in
  human-facing output; it never appears in the `rows` array of `.pdlc-drift-state.json` (AC-2.6),
  so no state file describes itself and no golden-output oracle is self-referential. This
  enumeration is read-only: it stats names, never contents (NFR-3). *(P0)*
- **AC-0.7** — Who: the maintainer. Given the migration from `.js` consumer copies to `.bundle.js`
  consumer copies, When the manifest is authored, Then it carries
  `retired: [".claude/workflows/orchestrate-dev.js", ".claude/workflows/orchestrate-queue.js"]`.
  A retired path is **not** a managed row (it is never compared, never a state in AC-1.1) and is
  **not** `not-managed` (it is not left alone); it is a path sync quarantines under AC-3.9. This
  exists because §0 fact 7 — the only live drift this repo can demonstrate — is on exactly those
  two files, and under AC-1.5 alone they would be permanently untouchable. *(P0)*

**Comparison semantics for a generated artifact (resolves the "in-sync means what?" question).**
Both sides of the comparison are the *same* generated bundle: node B ships the bundle that
`build-runtime.mjs` emitted at publish time, and node C holds a copy of it. "In-sync" is therefore
plain byte equality of two bundles — not source-vs-generated, and not a consumer-side rebuild
(consumers have neither `build-runtime.mjs` nor `runtime-adapter.js`, and this REQ does not add
them). The source→bundle relation stays where it already lives: `build-runtime.mjs --check` and
`__tests__/runtimeBundle.test.js`, run by `cd pdlc/workflows && npm test` (§0 fact 10 — there is
no hosted CI on this repo today).

### REQ-DIST-01 — Drift detection

- **AC-1.1** — Who: the operator. Given a manifest row whose `pluginPath` resolves under
  `${CLAUDE_PLUGIN_ROOT}` and whose `consumerPath` exists, When the check runs, Then it compares
  the two by content hash and the sync manifest (AC-1.6) and reports exactly one of the six
  states in the table below. *(P0)*

  | State | Condition | Meaning |
  |---|---|---|
  | `in-sync` | consumer bytes == plugin bytes | nothing to do |
  | `stale` | differ; consumer hash == this row's `consumerHash` in the sync manifest | consumer is behind; safe to sync |
  | `local-edit` | differ; consumer hash != this row's `consumerHash` in the sync manifest | consumer was edited after sync; syncing destroys work |
  | `unverified` | differ; no sync-manifest entry for this row | never synced by this tool; direction unknown |
  | `missing` | `consumerPath` absent | consumer has no copy |
  | `unknown` | baseline for this row unresolvable / unreadable (AC-1.2) | nothing was verified for this row |

  Six states, one per manifest row. `not-managed` (AC-0.6) is deliberately **not** in this table:
  it is a property of files that have no manifest row, is report-only, and is never a row state.

  `stale` and `local-edit` are discriminated by the single comparison
  `sha1(consumerPath bytes) == syncManifest[id].consumerHash`. `pluginHash` (AC-1.6) is recorded
  for reporting and for detecting a re-published plugin; it is never the discriminator. The two are
  equal only immediately after a sync.

- **AC-1.2** — Who: the operator. Given the baseline for a row cannot be established — the plugin
  is not installed, `${CLAUDE_PLUGIN_ROOT}` is unset or unreadable (AC-0.4), the repo root did not
  resolve (AC-0.5), the manifest is absent or malformed (AC-2.4), **or the row's `pluginPath` does
  not exist / is unreadable inside an otherwise-resolvable plugin root** — When the check runs,
  Then that row is `unknown` and carries a machine-readable `reason` from this closed set:
  `plugin-root-unset`, `plugin-root-unreadable`, `repo-root-unresolved`, `manifest-absent`,
  `manifest-malformed`, `plugin-artifact-missing`, `hash-tool-absent`, `json-tool-absent`. It is
  never reported `in-sync` — absence of evidence is not evidence of sync. The
  `plugin-artifact-missing` reason is what covers "manifest row present, consumer bytes present,
  but nothing to compare them to"; that case has a defined state, a defined exit code (AC-3.3
  exit 3), a defined queue outcome (AC-4.1 `blocked`), and a defined copy-loop behaviour (AC-3.1:
  not copied). *(P0)*
- **AC-1.3** — Who: the operator. Given a consumer bundle byte-identical to the plugin's shipped
  bundle, When the check runs, Then the result is `in-sync` regardless of file timestamps. No
  state in AC-1.1 is decided by mtime; mtime is never read. *(P0)*
- **AC-1.4** — Who: the operator. Given multiple manifest rows, When the check runs, Then each is
  reported independently; one `stale` row does not mask a second `stale` row, and one `unknown`
  row does not suppress the states of the others. *(P0)*
- **AC-1.5** — Who: the operator. Given a file in `.claude/workflows/` that has no manifest row and
  is not in `retired` (a workflow the consuming repo authored for its own domain), When any
  operation in this feature runs, Then it is reported `not-managed` per AC-0.6 and is never read
  for comparison, never overwritten, and never deleted. *(P0)*
- **AC-1.6** — Who: the sync command, the check, and `build-runtime.mjs` (AC-0.3a). Given a managed
  artifact is written into `.claude/workflows/`, When the write completes, Then the writer records
  `{ id, consumerHash, pluginHash, artifactVersion, pluginVersion, syncedAtUtc }` for that row in
  the **sync manifest** at `.claude/workflows/.pdlc-sync-manifest.json` in the consumer repo.
  `consumerHash` and `pluginHash` are `sha1` of the bytes written and of the baseline respectively
  (equal at write time). This file is the sole provenance source for the `stale` / `local-edit` /
  `unverified` discrimination in AC-1.1, replacing mtime entirely. *(P0)*
- **AC-1.7** — Who: the operator on a repo that has never synced. Given no sync manifest exists,
  or it exists with no entry for a row, When that row's bytes differ, Then the state is
  `unverified` — never `stale` and never `local-edit`. `unverified` is always surfaced (AC-2.5),
  its remediation is "diff, then sync", and sync requires `--force` (AC-3.2). This is the common
  first-run case and it must be safe in both directions: it must not silently overwrite a real
  local edit, and it must not silently hide a real staleness. *(P0)*
- **AC-1.8** — Who: the test author. Given the classifier, whose domain is **one manifest row** and
  whose codomain is the **six** states of AC-1.1, Then it satisfies, as requirements and not as
  test detail:
  - **(i) totality** — every combination of the axes {baseline resolvable: yes/no} ×
    {`pluginPath` bytes present/absent} × {`consumerPath` bytes present/absent} × {bytes equal /
    unequal} × {sync-manifest entry: absent / `consumerHash` matches / `consumerHash` differs}
    maps to exactly one of the six states, with no undefined fall-through. Combinations that cannot
    co-occur (e.g. "equal" with one side absent) are enumerated and mapped explicitly, not left
    implicit.
  - **(ii) mutual exclusivity** — the six states are disjoint; no input yields two. Precedence when
    conditions could overlap is fixed and stated: `unknown` > `missing` > `in-sync` >
    `unverified` > `stale` > `local-edit`.
  - **(iii) determinism** — the same filesystem inputs yield the same state on repeated runs within
    and across processes, with no dependence on clock, mtime, environment ordering or directory
    iteration order.

  `not-managed` is outside this classifier's codomain by construction (AC-0.6), so the totality
  property is satisfiable as stated rather than requiring an unauthorised state. *(P0)*

### REQ-DIST-02 — SessionStart warning

- **AC-2.1** — Who: the operator. Given a `SessionStart` hook and any managed row in state `stale`
  or `missing`, When the session starts, Then a warning names the row `id`, the state, and the
  exact remediation command. *(P0)*
- **AC-2.2** — Who: the operator. Given **every** managed row is `in-sync`, no retired path is
  present (AC-3.9), and any `not-managed` files are ignored, When the session starts, Then the hook emits nothing. Silence means every
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
- **AC-2.6** — Who: `orchestrate-queue`. Given **any** drift computation completes — the
  SessionStart hook, `sync-workflows.sh --check`, or a `sync-workflows.sh` run that copied files —
  When it exits, Then it has written the full per-row result to
  `.claude/workflows/.pdlc-drift-state.json` as:

  ```
  { schemaVersion: 1,
    generatedAtUtc,               // ISO-8601 Z; reporting only, never a queue input
    generatedBy,                  // "hook" | "check" | "sync"
    pluginVersion,                // context only (AC-5.4)
    checkEnabled,                 // resolved by the writer from .claude/pdlc.config.json (AC-4.3)
    rows: [ { id, state, reason, pluginHash, consumerHash,
              pluginArtifactVersion, consumerArtifactVersion } ] }
  ```

  `rows` contains exactly one entry per manifest row and nothing else (no `not-managed` entries —
  AC-0.6). This file is the queue's only input (AC-4.1) and is what keeps classification out of the
  workflow runtime. *(P0)*
- **AC-2.7 — Single writer contract.** Who: the operator remediating mid-session. Given
  `.claude/workflows/.pdlc-drift-state.json`, Then there is exactly **one** writer routine, shared
  by the hook and `sync-workflows.sh`, and it is invoked at the end of **every** drift computation
  in either surface. The write is whole-file and atomic (write to a sibling temp file in the same
  directory, then `mv`), so a reader never observes a partial file and there is no merge rule to
  specify: last complete write wins. Consequently, after `sync-workflows.sh` copies a stale row,
  the drift state on disk reflects the post-sync truth **within the same session**, and the queue
  (AC-4.1) stops blocking without a session restart. Without this AC the operator's remediation
  loop is closed only by restarting the session, which is the defect v3 SE F-05 / TE F-18 filed.
  *(P0)*

### REQ-DIST-03 — Sync action

**Delivery vehicle.** Sync is a bash script (NFR-5) shipped in the plugin at
`${CLAUDE_PLUGIN_ROOT}/hooks/scripts/sync-workflows.sh`, invoked directly by the operator. It is
**not** an LLM prompt: every `/pdlc:*` surface today is a `SKILL.md`, and an LLM-driven file copy
is neither deterministic (NFR-1) nor auditable. A thin `skills/sync-workflows/SKILL.md` may exist
as a discoverability affordance, but its only permitted action is to run that script verbatim and
relay its output; it makes no classification or copy decisions of its own.

- **AC-3.1** — Who: the operator. Given `sync-workflows.sh` with no flags, When it runs, Then every
  managed row in state `stale` or `missing` is copied from `pluginPath` to `consumerPath`, each
  copy is reported with both hashes, and the sync manifest (AC-1.6) is updated for each copied row.
  Rows in `local-edit`, `unverified` or `unknown` are not copied — including `unknown` with reason
  `plugin-artifact-missing`, which has no bytes to copy. Every manifest row falls in exactly one of
  the copy set or the skip set; there is no undefined row. The drift state file is rewritten before
  exit (AC-2.7). *(P0)*
- **AC-3.2** — Who: the operator. Given a row in state `local-edit` or `unverified`, When sync runs
  without `--force`, Then it is **not** overwritten, it is reported with the reason, and the
  command's exit code reflects it (AC-3.3). Given `--force`, Then it is overwritten after a backup
  (AC-3.4). *(P0)*
- **AC-3.3** — Who: the operator, and the `pdlc/workflows` jest suite (`npm test`) — the only
  automated verification surface that exists (§0 fact 10). Given `--check`, When it runs, Then it
  reports drift, copies nothing, writes nothing except the drift state file (AC-2.7), and exits per
  this complete table — highest applicable code wins, so the exit code is never green while
  anything is unverified: *(P0)*

  | Condition (evaluated in this precedence order) | Exit |
  |---|---|
  | any row `unknown` | 3 |
  | any row `local-edit` or `unverified` | 2 |
  | any row `stale` or `missing`, or any retired path present (AC-3.9) | 1 |
  | all managed rows `in-sync` and no retired path present (`not-managed` files present or not) | 0 |

  Exit `0` therefore asserts "every managed row was compared against a resolved baseline and
  matched" — the automated form can never go green having verified nothing, which is AC-1.2
  enforced at the exit code.

  **On the `unverified` asymmetry** (`--check` exits 2, but AC-4.1 lets the queue proceed): it is
  deliberate. `--check` is an assertion surface — its job is to be red whenever provenance is
  missing. The queue is a *work* surface — blocking a feature run on "we cannot tell which
  direction the divergence runs" would strand every consumer that adopted this feature by copying
  files by hand, which is all of them at first adoption. The two seams optimise for opposite
  errors, and the test suite must assert both, not reconcile them.
- **AC-3.4** — Who: the operator recovering a mistake. Given a sync overwrites any existing file,
  When the copy happens, Then the pre-sync **content** is first written to
  `.claude/workflows/.pdlc-backups/{id}.{UTC-ISO8601-compact}.bak`, where the stamp is
  `YYYYMMDDTHHMMSSZ` — fixed width, zero-padded, UTC. `id` is filename-safe by AC-0.1.
  Backups are never overwritten: if that exact filename already exists (two syncs inside one
  second), `-2`, `-3`, … is appended before `.bak` until the name is free. The **newest 5 per
  `id`** are retained; selection for pruning is `LC_ALL=C` **lexicographic descending sort of the
  filenames**, keep the first 5, delete the rest. The fixed-width UTC stamp makes lexicographic
  order equal chronological order, and the `-N` suffix breaks ties deterministically. Pruning is
  **never** mtime-based — that would contradict AC-1.3 and NFR-2 — and never touches a file whose
  name does not match `{id}.{stamp}[-N].bak` for an `id` in the current manifest. The backup
  directory is created if absent. A recorded hash is **not** an acceptable substitute — a digest is
  one-way and cannot restore content. *(P0)*
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
  (this is not a distinct state) and exit is `1`; When sync runs, Then the directory is created —
  **under the repo root resolved by AC-0.5, which is never `$HOME`** — and every row is copied.
  *(P0)*
- **AC-3.9 — Legacy artifact retirement.** Who: the operator on a consumer that predates this
  feature. Given a path listed in the manifest's `retired` array (AC-0.7) exists in the consumer,
  When `sync-workflows.sh` runs (not `--check`), Then, **only after** the managed row that
  supersedes it has been written or confirmed `in-sync`, the retired file's content is backed up
  under AC-3.4's rules with `id` = the retired basename, and the file is then deleted. `--check`
  reports retired paths present as `retired-present` in the human-facing report and contributes
  exit code `1` (same class as `stale`: a real, sync-fixable divergence). Retirement is reported
  per path, is idempotent (a second run finds nothing to retire and writes no backup, satisfying
  AC-3.7), and never runs before its replacement is in place — the failure mode to avoid is
  deleting the loadable artifact and leaving nothing. Rationale: §0 facts 7–8; `.claude/workflows/`
  currently holds both `orchestrate-dev.js` and `orchestrate-dev.bundle.js`, both declaring
  `meta.name: "orchestrate-dev"`, and leaving the stale one in place is precisely the bug this
  feature exists to eliminate. *(P0)*

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

  | Condition, in this precedence order | Queue outcome |
  |---|---|
  | the read returns absent, or the content is unparseable JSON, or `schemaVersion` != 1 | `blocked` |
  | `checkEnabled` is `false` | proceed, skip noted in the report (AC-4.3) |
  | any row `unknown` | `blocked` |
  | any row `missing` | `blocked` |
  | any row `stale` | `blocked` |
  | any row `local-edit` or `unverified` | proceed, with the rows named in the run report |
  | all rows `in-sync` | proceed silently |

  `local-edit` and `unverified` proceed because they represent a deliberate or unknown operator
  divergence that blocking would strand; `unknown` blocks because AC-1.2's rule applies at the
  queue seam too.

  **No freshness clause.** v2/v3 required the file to be "not older than the current session
  start". That is deleted, not deferred: the queue runs in the restricted runtime with no `process`
  and no `fs`, its only seam is the injected `_readFile` (contents, not stat metadata), and nothing
  in this REQ produces a session-start instant the queue could read — so the clause had no input a
  test could vary, and would have shipped as dead code or an always-pass guard. What replaces it is
  strictly stronger and fully observable: AC-2.7 makes *every* writer refresh the file, so a stale
  snapshot cannot outlive the operation that invalidated it, and the "hook never ran" case is
  covered by row 1 (absent). `generatedAtUtc` remains in the schema for the human report only, and
  the queue never compares it to anything — comparing timestamps would be a classification
  decision, which NFR-1 forbids at this surface.
- **AC-4.2** — Who: the operator. Given AC-4.1 blocks, When the report is written, Then it names
  each blocking row `id`, its state, its reason, and the exact remediation command, so the
  operator's next turn is one command rather than an investigation. *(P0)*
- **AC-4.3** — Who: the consuming-repo operator. Given the consumer file
  `.claude/pdlc.config.json` with key `distribution.checkEnabled`, When a drift computation runs,
  Then **the shell writer** (hook, `--check`, or sync) resolves the flag and encodes the resolved
  boolean into the drift state file as `checkEnabled` (AC-2.6). The queue reads that field from the
  one file it already reads and, when it is `false`, skips the AC-4.1 state evaluation and notes
  the skip in its report. Given `.claude/pdlc.config.json` is absent, unparseable, or the key is
  absent, Then the resolved value is `true`. The queue **never** opens
  `.claude/pdlc.config.json` — that would be a second injected read, which AC-4.1's "one read" and
  NFR-1 both forbid. Scope of the flag: it gates the **queue** only. The SessionStart hook still
  warns and `--check` still exits non-zero, because those are the surfaces an operator can ignore
  at will; the queue is the one that halts work. The flag deliberately does **not** live in the
  workflow source, because a flag inside the drifting artifact would make an operator's toggle a
  `local-edit`. *(P1)*

### REQ-DIST-05 — Version stamping (reporting only)

**The version never lives inside the bundle.** v2/v3 required `meta.version` on each module,
propagated by `build-runtime.mjs` into the emitted bundle. §0 fact 9 shows that is the opposite of
how the builder works and of what the runtime permits: the builder hand-writes each bundle's `meta`
*because* the runtime demands a pure first-statement literal, and a shell script would then have to
extract a JS object field from a 92 KB generated file. Version stamping is therefore moved to
**data the builder emits alongside the bundles**, which is trivially readable by the same JSON tool
the rest of the feature already uses (§4).

- **AC-5.1** — Who: `build-runtime.mjs`. Given a build, When the bundles are emitted, Then the
  builder also emits `pdlc/workflows/dist/distribution-manifest.json` containing, for each row,
  `artifactVersion` (the plugin's `plugin.json` `version` at build time, e.g. `0.10.0`) and
  `pluginSha1` (the sha1 of the emitted bundle). No module and no bundle gains a `version` field;
  `meta` literals are untouched, so the runtime's pure-literal/first-statement constraint and
  `__tests__/runtimeBundle.test.js` are unaffected. *(P1)*
- **AC-5.2** — Who: the operator. Given the content hash and the version stamp disagree (a
  hand-edited manifest, a rebuilt bundle under an unbumped plugin version — which §0 fact 5 shows
  really happens), When the state is decided, Then the **content hash is authoritative and the
  version is reporting-only**. No state in AC-1.1 is ever decided by a version comparison, and
  versions are compared for **equality only** — never ordered. Nothing in this feature needs a
  semver comparator or `sort -V`, and none is declared in §4. *(P1)*
- **AC-5.3** — Who: the operator reading a drift report. Given a row is not `in-sync`, When the
  report is produced, Then `pluginArtifactVersion` is read from the shipped
  `distribution-manifest.json` and `consumerArtifactVersion` from the sync manifest's
  `artifactVersion` for that row (AC-1.6). Given either is absent — no sync-manifest entry, or a
  pre-feature plugin whose manifest lacks the field, which is the entire first-run population —
  Then it renders as `unknown` and no state, exit code or queue outcome changes as a result.
  Absence of a stamp is never an error. *(P1)*
- **AC-5.4** — Who: the operator. Given the plugin's `plugin.json` version, When the report is
  produced, Then it is included as **context only**, explicitly labelled as not a drift signal:
  cached `0.9.0` and `0.10.0` ship byte-identical workflow files (§0 fact 5), so plugin version
  demonstrably does not identify workflow content. *(P2)*

### REQ-DIST-06 — Publish the executable artifact in the plugin package

This is the requirement US-04 traces to, and the precondition for every copy AC above: today there
is nothing in the plugin package to copy (§0 fact 3).

- **AC-6.1 — One canonical build output.** Who: the maintainer. Given
  `node pdlc/workflows/build-runtime.mjs`, When it runs, Then `pdlc/workflows/dist/` is the
  **sole** location it emits bundles to (today it is `.claude/workflows/`, and only files under
  `pdlc/` can ship — §0 fact 12). `dist/*.bundle.js` and `dist/distribution-manifest.json` are
  tracked and committed. This repo's `.claude/workflows/*.bundle.js` cease to be a second tracked
  generated tree: they become **sync targets of `dist/`**, written by the builder in the same run
  under the maintainer-repo baseline of AC-0.3a, with a sync-manifest entry recorded (AC-1.6). One
  generated tree is authoritative, one is a consumer copy, and `build-runtime.mjs --check` compares
  `dist/` only — so there is no "which of the two is canonical / what if they diverge" question to
  answer. *(P0)*
- **AC-6.2 — Packaging oracle, executable before release.** Who: the `pdlc/workflows` jest suite.
  Given the set of files that would be packaged for the plugin (`.claude-plugin/marketplace.json`
  declares `source: ./pdlc`, so: everything under `pdlc/` minus the repo's ignore rules), When
  `npm test` runs on any commit, Then a test asserts that (a) every `pluginPath` in
  `dist/distribution-manifest.json` resolves to a file inside that packaged set, (b) each such file
  is byte-identical to the freshly built bundle, and (c) its `pluginSha1` matches. This is the
  pre-release surrogate: the failure §0 fact 3 documents — the artifact being excluded from the
  package — is caught on **every commit**, not first observed by a consumer after publication.
  *(P0)*
- **AC-6.2a** — Who: a consumer. Given a plugin installed from the marketplace at version *V*, When
  `${CLAUDE_PLUGIN_ROOT}/workflows/dist/` is listed, Then it contains exactly the bundles named in
  the distribution manifest. This is the post-install smoke check; it is verified by a manual
  release-checklist step until D-DIST-06 automates it, and AC-6.2 is what actually gates
  development. *(P1)*
- **AC-6.3 — A→A′ freshness, on the surface that exists.** Who: the `pdlc/workflows` jest suite.
  Given a commit changes any of `orchestrate-dev.js`, `orchestrate-queue.js` or
  `runtime-adapter.js`, When `cd pdlc/workflows && npm test` runs, Then
  `__tests__/runtimeBundle.test.js` fails unless the committed `dist/` bundles were rebuilt in the
  same commit, so node A→A′ can never drift. That suite already asserts bundle freshness against
  `.claude/workflows/`; this feature repoints it at `dist/` per AC-6.1. There is no CI on this repo
  today (§0 fact 10), so this AC is addressed to `npm test` and nothing in this REQ is verifiable
  only by a hosted runner. Standing up hosted CI to run `npm test` on every push is D-DIST-06.
  *(P0)*
- **AC-6.4 — No document contradicts the manifest.** Who: the maintainer. Given the migration from
  `.js` copies to `.bundle.js` copies, When this feature lands, Then **no file in the repository
  states a workflow-distribution convention contradicting the shipped distribution manifest**, and
  a test asserts it by grepping for the superseded form. Re-derived at `7534d11`, three of v2's
  five listed documents already state the bundle convention correctly
  (`CLAUDE.md:54-63`, `pdlc/skills/orchestrate-dev/SKILL.md:89-94`,
  `pdlc/skills/orchestrate-queue/SKILL.md:174-177`); the two that still state the superseded form
  are `docs/_queue/QUEUE.md:35` ("manual copy (`.claude/workflows/*.js`)") and the module header
  `pdlc/workflows/orchestrate-dev.js:4-5` ("Consumer runtime copy:
  `.claude/workflows/orchestrate-dev.js`"). All five must additionally be updated for AC-6.1's move
  of the build output to `dist/`. Stating the AC as an invariant rather than a fixed list is
  deliberate — the list went stale between v2 and v3. *(P1)*

## 4. Declared thresholds, flags and locations

Every configured value this REQ's ACs depend on, with default and owner. No AC may cite a value
absent from this table.

| Name | Location | Default | Owner | Notes |
|---|---|---|---|---|
| `distribution.checkEnabled` | `.claude/pdlc.config.json` (consumer repo; new file, absent ⇒ defaults) | `true` | consuming-repo operator | AC-4.3. Resolved by the shell writer, delivered to the queue via the drift state file. Gates the queue only, not the hook or `--check`. |
| distribution manifest | `${CLAUDE_PLUGIN_ROOT}/workflows/distribution-manifest.json` (shipped; built to `pdlc/workflows/dist/`) | 2 managed rows + 2 `retired` paths (AC-0.2, AC-0.7) | pdlc maintainer, emitted by `build-runtime.mjs` | Sole authority for the managed set. |
| sync manifest | `.claude/workflows/.pdlc-sync-manifest.json` (consumer) | absent ⇒ all rows `unverified` | written by `sync-workflows.sh` and, in the maintainer repo, by `build-runtime.mjs` (AC-0.3a) | AC-1.6, AC-1.7. |
| drift state file | `.claude/workflows/.pdlc-drift-state.json` (consumer) | absent ⇒ queue `blocked` | **one shared writer routine**, invoked by the hook, by `--check`, and by sync (AC-2.7); whole-file atomic replace, last complete write wins | AC-2.6, AC-2.7, AC-4.1. |
| backup dir | `.claude/workflows/.pdlc-backups/` (consumer) | created on demand | sync script | AC-3.4, AC-3.9. |
| backup retention | same | newest **5** per `id`, selected by `LC_ALL=C` lexicographic descending filename sort | pdlc maintainer | AC-3.4. Never mtime-based. |
| backup stamp format | backup filename | `YYYYMMDDTHHMMSSZ`, collisions suffixed `-2`, `-3`, … | pdlc maintainer | AC-3.4. Fixed width so lexicographic order == chronological order. |
| `id` charset | manifest row | `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` | pdlc maintainer | AC-0.1. Filename-safety for AC-3.4; violation ⇒ manifest malformed. |
| content-hash utility | `shasum` \| `sha1sum`, resolved by probing | first that runs | pdlc maintainer | Both absent ⇒ every row `unknown`, reason `hash-tool-absent` (AC-1.2, AC-2.4). |
| JSON read/write utility | Python interpreter, discovered by probing `python3`, `python`, `py` — **the identical loop already shipped in all three `pdlc/hooks/scripts/*.sh`**, reused verbatim, not reinvented | first candidate that executes `import sys` successfully | pdlc maintainer | Reads/writes all four JSON files and is what distinguishes *malformed* from *absent* (AC-2.4). None found ⇒ every row `unknown`, reason `json-tool-absent`, hook still exits 0 (NFR-6). |
| drift-check latency budget | NFR-2 fixture | p95 ≤ 500 ms | pdlc maintainer | Observation, not a gate — see NFR-2. |
| plugin-root resolution | `${CLAUDE_PLUGIN_ROOT}` | set by the harness | Claude Code | Unset ⇒ `unknown` (AC-0.4). Overridden by the local `dist/` baseline in the maintainer repo (AC-0.3a). |
| repo-root resolution | `git rev-parse --show-toplevel`, else bounded upward `.claude/` walk | — | pdlc maintainer | AC-0.5. `$HOME` and `/` are always rejected as `unknown`. |

No semver comparator and no `sort -V` appear in this table because no AC needs version *ordering* —
AC-5.2 compares versions for equality only.

All consumer-side state files and directories live under `.claude/workflows/` with a `.pdlc-`
basename prefix. They have no manifest row, so sync can never copy, compare or destroy them, and
AC-0.6's exclusion rule keeps them out of the `not-managed` report — including keeping the drift
state file from listing itself.

## 5. Non-functional requirements

- **NFR-1 — No LLM in the classification path.** Classification is content hashing plus JSON
  reads, executed by the bash scripts (NFR-5). Scoped per surface:
  - *Hook and `sync-workflows.sh`*: fully deterministic, no agent involvement whatsoever.
  - *Queue (AC-4.1)*: the workflow runtime has no `fs`/`process`; all IO reaches it through
    `runtime-adapter.js` as `agent()` calls. The queue therefore performs **one** injected read of
    an already-computed, deterministic JSON file and makes no classification decision. No hashing,
    enumeration or judgement happens in an LLM turn. This is the concrete mechanism that keeps
    NFR-1 true at a surface that cannot touch the filesystem directly.
- **NFR-2 — Latency, observed not gated.** Against a fixture of ≤ 8 managed artifacts totalling
  ≤ 512 KB, warm page cache, on the maintainer's reference machine, the check should complete at p95
  ≤ 500 ms. This is a **non-gated observation**: no test asserts wall-clock time, because an
  unqualified timing assertion on shared or unspecified hardware is a coin flip. Exceeding it is a maintainer-owned
  performance bug, not a build failure. Anyone tempted to write a timing test should read this
  clause instead.
- **NFR-3 — Never touch unmanaged files.** The check and sync never read for comparison, modify,
  or delete any file without a distribution-manifest row (AC-1.5, AC-0.1).
- **NFR-4 — Detection automatic, modification explicit.** The sync operation never runs implicitly:
  not from the hook, not from the queue, not from a SKILL. Detection is automatic everywhere;
  modification is always an explicit operator command.
- **NFR-5 — Bash, matching the shipped hooks.** The SessionStart hook and `sync-workflows.sh` are
  `#!/usr/bin/env bash` with `set -uo pipefail`, matching all three existing scripts in
  `pdlc/hooks/scripts/` (§0 fact 11) — v2/v3 said "POSIX `sh`", which described neither the
  siblings nor what this feature can be written in. Beyond bash builtins and coreutils they depend
  on exactly two external tools, both declared in §4 with location, default, owner and
  absence behaviour: a content-hash utility (`shasum`/`sha1sum`) and a JSON read/write utility.
  The JSON tool is **the Python interpreter discovered by the identical probe loop the three
  sibling hooks already ship** (try `python3`, `python`, `py`; accept the first that actually
  executes) — the mechanism is reused, not reinvented, because JSON handling is now cross-cutting
  across four files in this feature and hand-rolled shell JSON parsing cannot distinguish malformed
  from absent (AC-2.4 requires that distinction). Absence of either tool degrades to `unknown` with
  the corresponding reason code, never to a crash and never to `in-sync`.
- **NFR-6 — Fail-open at the session seam, fail-closed at the queue seam.** The hook must never
  prevent a session from starting (AC-2.4); the queue must never run a feature on an unverified
  pipeline (AC-4.1). These opposite defaults are deliberate.

## 6. Scope

**In scope:**

- **`build-runtime.mjs` changes** (AC-5.1, AC-6.1): move the emit target to `pdlc/workflows/dist/`,
  emit `dist/distribution-manifest.json` with `artifactVersion` and `pluginSha1` per row, and write
  this repo's `.claude/workflows/` consumer copies plus their sync-manifest entries (AC-0.3a).
  `meta` literals and the runtime's pure-literal constraint are **not** touched.
- **`__tests__/runtimeBundle.test.js` changes** (AC-6.2, AC-6.3): repoint freshness at `dist/`, add
  the packaging oracle, add the AC-6.4 no-contradicting-document grep.
- A distribution-manifest-driven managed set; six-state drift detection with hash-based provenance;
  report-only `not-managed` enumeration.
- The SessionStart warning hook, the shared drift-state writer routine, and the drift state file.
- `sync-workflows.sh` with `--check` / `--force`, backups, restore, and legacy retirement (AC-3.9).
- Queue integration as defense-in-depth; version stamping as reporting-only; classifier invariant
  tests; updating the documents in AC-6.4.

**Out of scope:** a full `pdlc install` package manager; distributing `SKILL.md` files (they
already load live); distributing `build-runtime.mjs` / `runtime-adapter.js` or rebuilding bundles
consumer-side; auto-syncing without operator action; syncing repo-local workflows; adding a
`version` field to any module's or bundle's `meta` literal (explicitly rejected — §REQ-DIST-05
preamble); standing up hosted CI (D-DIST-06); detecting that the *installed plugin cache itself* is
behind the marketplace (that is Claude Code's plugin updater — D-DIST-05).

## 7. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `${CLAUDE_PLUGIN_ROOT}` resolves to a readable plugin root from a consumer repo, for `SessionStart` specifically | Executable proof: a spike hook that echoes the resolved path, run in a consumer session | Must be demonstrated at HEAD before FSPEC authoring. All three shipped hooks in `pdlc/hooks/hooks.json` already assume it for `PreToolUse`/`PostToolUse`/`SessionStart`, which is strong evidence but not proof for the value being non-empty. |
| BL-02 | The plugin package contains the artifact to copy | **AC-6.1 + AC-6.2 merged and `npm test` green** — i.e. the in-repo packaging oracle passes. Deliberately *not* gated on AC-6.2a (an installed marketplace release), which cannot exist before the packaging decision it guards has shipped | Must exist before any AC in REQ-DIST-03 can be implemented. This is the premise §0 fact 3 shows is currently false; AC-6.2 is what makes it checkable on every commit rather than only post-publication. |
| BL-03 | `pdlc/hooks/hooks.json` accepts a second `SessionStart` entry alongside `nudge-consolidation.sh` | Both hooks observed firing in one session | Must be demonstrated before FSPEC authoring. |
| BL-04 | The workflow runtime's injected read (`_readFile` via `runtime-adapter.js`) can read `.claude/workflows/.pdlc-drift-state.json` and returns absence distinguishably from empty | **Discharged by citation, not a spike:** `pdlc/workflows/orchestrate-queue.js:483` documents `_readFile` as `async (path) → string\|null`, and `runtime-adapter.js`'s `rtReadFile` honours it | Re-verify the two citations at FSPEC authoring; no spike required. |
| BL-05 | Which artifact the workflow runtime resolves when `.claude/workflows/` holds both `orchestrate-dev.js` and `orchestrate-dev.bundle.js`, each declaring `meta.name: "orchestrate-dev"` (§0 fact 8) | Executable proof: place two distinguishable artifacts under both names, invoke the workflow, observe which ran | Must be answered before FSPEC authoring. If the legacy `.js` wins or the resolution is non-deterministic, AC-3.9's retirement is a **correctness fix and P0 blocking**; if the `.bundle.js` wins, AC-3.9 is cleanup and may be sequenced after AC-3.1. Either way the retirement ships in this feature; only its ordering depends on the answer. |

## 8. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-DIST-01 | Full `pdlc install` mechanism | Drift detection plus an explicit sync closes the loop; a package manager is a larger, separate design | `docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md` (queue row 6, `blocked`) |
| D-DIST-02 | Loading workflows directly from the plugin path (no copy at all) | Would remove the problem entirely, but depends on runtime behavior not under this repo's control | `docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md` (queue row 6, `blocked`) |
| D-DIST-03 | Auto-sync on detection | Violates NFR-4; revisit only if drift proves chronic in practice | `docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md` (queue row 6, `blocked`) |
| D-DIST-04 | Multi-consumer fan-out (sync all known consuming repos at once) | One consumer today | `pdlc-engineering-loop` (queue row 5) |
| D-DIST-05 | Detecting that the installed plugin cache (node B) is behind the marketplace | Owned by Claude Code's plugin updater, not by pdlc; this REQ closes A′→B and B→C only | `docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md` (queue row 6, `blocked`) |
| D-DIST-06 | Hosted CI and release automation on `yumo-plugins` (run `npm test` on every push; automate AC-6.2a's post-install smoke check) | `.github/` does not exist (§0 fact 10). Standing up a CI/release host is a distinct workstream with its own secrets, runner and marketplace-publish concerns; every AC in this REQ is deliberately addressed to `cd pdlc/workflows && npm test`, which exists today, so nothing here is blocked on it | `docs/pdlc-release-ci/REQ-pdlc-release-ci.md` — **queue row 7, `blocked` on `pdlc-workflow-distribution`** (draft row added by this revision) |

## 9. Traceability

| User story | Requirements |
|---|---|
| US-01 | REQ-DIST-00 (AC-0.3a, AC-0.6), REQ-DIST-01 (AC-1.1–1.8), REQ-DIST-02 (AC-2.1, 2.2, 2.5, 2.6) |
| US-02 | REQ-DIST-00 (AC-0.5), REQ-DIST-02 (AC-2.7), REQ-DIST-03 (AC-3.1, 3.3, 3.6–3.9) |
| US-03 | REQ-DIST-01 (AC-1.1, 1.3, 1.6, 1.7), REQ-DIST-02 (AC-2.3, 2.5), REQ-DIST-03 (AC-3.2, 3.4, 3.5), REQ-DIST-05 (AC-5.1–5.4) |
| US-04 | REQ-DIST-00 (AC-0.1, 0.2, 0.7), REQ-DIST-06 (AC-6.1–6.4), REQ-DIST-04 (AC-4.1–4.3) |

## 10. Disposition of v3 cross-review findings

Both v3 reviewers filed the same process defect first: v3.0 was v2.0 with a version bump and a
byte-identical body (SE F-01, TE F-23). This revision is the content change. Two guards adopted:
**the version row is bumped only when the body changed**, and the review iteration index is derived
from the highest `CROSS-REVIEW-{role}-{doc}-v{N}` on the branch rather than passed in (SE F-16,
TE F-23(ii)) — this iteration was dispatched as "iteration 1" while five review files already
existed, which would have defeated the delta protocol had both reviewers not caught it.

### Software-engineer v3

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | This document. §10 records the delta; the version-bump rule is stated in the header. |
| F-02 | High | REQ-DIST-05 rewritten. `meta.version` abandoned — §0 fact 9 records why the v3 mechanism was backwards. Version stamping moves to builder-emitted manifest data (AC-5.1), so nothing greps a 92 KB bundle and the runtime's pure-literal constraint is untouched. Now in scope explicitly (§6). |
| F-03 | High | AC-0.7 (`retired` array) + AC-3.9 (backup-then-delete, only after the replacement is in place) + BL-05 (which artifact the runtime resolves) + §0 fact 8. The legacy copies are retired, not made permanently `not-managed`. |
| F-04 | High | AC-0.5 inverted: git-toplevel first, upward walk bounded below `$HOME` and `/`, and `$HOME`/`/` rejected as `unknown` regardless of path taken. AC-3.8 restated. No operation writes under `$HOME/.claude/`. |
| F-05 | High | AC-2.7: one shared writer routine invoked by hook, `--check` **and** sync; whole-file atomic replace; last complete write wins. The in-session remediation loop now closes. §4 corrected ("written by hook only" was wrong). |
| F-06 | High | Freshness clause **deleted**, with the reasoning recorded in AC-4.1 so it is not reintroduced. AC-2.7 supersedes it; row 1 (absent/unparseable/schema-mismatch) covers "hook never ran". |
| F-07 | High | §0 fact 10 states there is no CI. AC-3.3, AC-6.2, AC-6.3 re-addressed to `cd pdlc/workflows && npm test`. AC-6.2 becomes a pre-release packaging oracle running on every commit; AC-6.2a is the post-install smoke check. Hosted CI deferred as D-DIST-06, bound to queue row 7. |
| F-08 | Medium | AC-6.1: `pdlc/workflows/dist/` is the sole build output; `.claude/workflows/*.bundle.js` become sync targets with sync-manifest entries. One authoritative generated tree, so "which is canonical / what if they diverge" no longer arises. |
| F-09 | Medium | AC-0.3a: the maintainer repo's baseline is local `dist/`, not the released cache, detected by the presence of `build-runtime.mjs`; the builder writes the sync manifest. Rationale spelled out in the AC. |
| F-10 | Medium | AC-4.3 rewritten: the shell writer resolves `checkEnabled` into the drift state file; the queue keeps exactly one injected read. NFR-1 intact. |
| F-11 | Medium | NFR-5 rewritten to bash (§0 fact 11). JSON tool added to §4 with location, default, owner and absence behaviour, mandating reuse of the sibling scripts' interpreter-discovery loop. |
| F-12 | Medium | Semver ordering removed — AC-5.2 compares versions for equality only, and §4 states no comparator is declared because none is needed. AC-3.4 pins the backup stamp format, the `LC_ALL=C` lexicographic prune rule, the collision suffix, and an explicit prohibition on mtime. |
| F-13 | Low | §1 now shows two diagrams — today's measured state (A′ at `.claude/workflows/`, tracked) and the post-REQ state (A′ at `dist/`). |
| F-14 | Low | AC-6.4 restated as the invariant "no document contradicts the manifest", grep-asserted, with the list re-derived at `7534d11`. |
| F-15 | Low | (i) `id` charset constrained in AC-0.1 and §4. (ii) AC-1.8 scoped to one manifest row over six states; `not-managed` moved out of the codomain (AC-0.6), so totality is satisfiable. |
| F-16 | Low | Iteration-index guard stated above. |

### Test-engineer v3

| ID | Sev | Resolution |
|---|---|---|
| F-14 | High | Absent/unreadable `pluginPath` now maps to `unknown` with reason `plugin-artifact-missing` (AC-1.2), with defined exit code, queue outcome and copy-loop behaviour (AC-3.1). AC-1.8(i)'s axes rewritten to match, and the state count corrected to six. |
| F-15 | High | Same as SE F-06 — clause deleted, replaced by AC-2.7's always-refresh contract and the absent/unparseable row. |
| F-16 | Medium | AC-0.1 narrowed to "sole authority for the **managed set**"; AC-0.6 makes the consumer directory enumerated for the human report only, excludes `.pdlc-*`, and bars `not-managed` from the drift state `rows` array — so no oracle is self-referential. |
| F-17 | Medium | AC-0.3a makes the maintainer repo's green path reachable on real inputs, which is what makes AC-3.3 exit 0 and AC-2.2 silence testable. |
| F-18 | Medium | AC-2.7 single writer contract; §4 corrected. `--force` sync refreshes drift state, so no false-block survives the operation that fixed it. |
| F-19 | Medium | AC-6.2 is the pre-release, in-`npm test` oracle over the packaged file set; BL-02 re-gated on it rather than on an installed release. |
| F-20 | Low | AC-1.1 names `consumerHash` explicitly in both rows, with a paragraph stating it is the single discriminator and `pluginHash` is reporting-only. |
| F-21 | Low | Obsolete under the AC-5.1 rewrite — nothing is extracted from a bundle. |
| F-22 | Low | §0/§1 aligned; §0 row A′ labelled with its tracked, pre-feature path. |
| F-23 | Medium | Version-bump and iteration-index guards stated above. |
| Q-04 | — | Answered inline under AC-3.3: the `unverified` asymmetry is deliberate and the reasoning is recorded. |
