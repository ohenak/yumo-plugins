---
feature: pdlc-workflow-distribution
ready: true
depends-on: []
---

# REQ — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `docs/design/MASTER-PLAN-engineering-loop.md` (Break 3, order 1) |
| Downstream | `FSPEC-pdlc-workflow-distribution.md`; features `pdlc-merge-phase`, `pdlc-consolidation-agent`, `pdlc-engineering-loop` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..13}.md` (26 files, this branch) |
| Post-mortem | `POSTMORTEM-R-pdlc-workflow-distribution.md` (v2.1, resolved) |
| Archived spec-grade record | REQ v13.0, git `9b66cdb` — superseded as a REQ, preserved as FSPEC/TSPEC input |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | **approved (product scope)** | Claude + operator | 15.0 | 2026-07-28 |

> **v15.0 — scope corrections from SE/TE round 13, no altitude change.** (1) SE F-01 (High): the
> A′→B publish edge now has an owner — **AC-6.6** requires the advertised `plugin.json` version to
> move whenever `dist/` bytes move, with an `npm test` oracle; §1 decomposes the edge into the step
> this REQ owns and the step D-DIST-05 owns. (2) SE F-02 (Medium): AC-6.4 gains a fifth pattern
> covering the two SKILLs' manual-copy phrasing (covered set re-measured: **7 files**), enumerates
> its generated-tree exemptions literally (TE F-02), asserts the exemption list, and is retitled to
> claim exactly what it computes; §1 now quotes both SKILL lines verbatim with file:line. (3) SE
> F-03: §0 fact 3 cites the nested-`__tests__/` packaging evidence. (4) SE F-04: O-7 made
> unconditional. (5) SE F-05: `pdlc/hooks/hooks.json` added to §6. (6) TE F-01: §4 states sync's
> exit is computed post-run, with O-14 carrying the wording. (7) TE F-03: O-13 must *create*
> `docs/_constraints/DOMAIN-CONSTRAINTS.md`. (8) TE F-04: NFR-2 restated as a reviewable design
> constraint plus a release-checklist observation.

> **v14.0 is a de-escalation revision, not a content revision.** Phase R hit the 5-iteration
> ceiling twice (v3–v8, v8–v13) without dual approval. The post-mortem's finding — accepted here —
> is that no blocking finding in twelve rounds contested product intent; all were
> specification-precision defects (oracles, fixtures, seams, cross-AC consistency) in material a
> REQ should not carry. v14 restates the product-level content of v13 (unchanged in substance
> since v4) at requirements altitude and **removes** the specification apparatus v5–v13 accreted:
> the `PDLC_TRACE_FILE` trace grammar, the `PDLC_FAULT` seam vocabulary, mandated jest tests and
> fixture construction, the branch-coverage floor, the property-axis tables, and the `printf`
> emitter internals. None of that is lost: it lives in v13.0 (`9b66cdb`) and its obligations are
> bound, item by item, in §10.
>
> **Stopping rule (binding on Phase R for this document, per POSTMORTEM-R R-1/R-5).** This REQ is
> accepted at product scope. A review finding of the form "this AC has no oracle / no fixture / no
> test seam" is answered by §10 — it is a downstream obligation, not a REQ revision. Only a
> finding that contests user need, scope, priority, phasing, or an AC's *observable behavior* may
> block this document.

## 0. Grounding

Grounded against `feat-pdlc-workflow-distribution` (v13 measured at `5630d58`, clean tree). Full
measured tables and per-fact verification commands: REQ v13.0 §0 (`9b66cdb`). The load-bearing
facts, each re-checkable in one command:

1. **The executing artifact is the bundle, not the ES module.** The runtime permits no `import`;
   `build-runtime.mjs` generates IIFE-wrapped bundles.
2. **The installed plugin ships no bundle at all today** — `~/.claude/plugins/cache/yumo-plugins/pdlc/<ver>/workflows/`
   holds ES modules only. There is nothing a consumer could copy.
3. **The plugin package root is `pdlc/`** (`.claude-plugin/marketplace.json` → `"source": "./pdlc"`).
   Nothing outside `pdlc/` can ship to a consumer. An artifact built at `pdlc/workflows/dist/X`
   installs at `${CLAUDE_PLUGIN_ROOT}/workflows/dist/X` — the `pdlc/` segment is dropped, the
   `dist/` segment survives. The first clause is measured (the cache holds `…/pdlc/0.10.0/workflows/`);
   the second is evidenced, not yet measured for a build-output directory — nothing under a nested
   build output has shipped. The available evidence: the installed cache does contain a nested
   subdirectory, `~/.claude/plugins/cache/yumo-plugins/pdlc/0.10.0/workflows/__tests__/`, so
   subdirectory structure under `workflows/` demonstrably survives packaging. BL-01's spike closes
   the remainder by also echoing a `workflows/dist/` path resolution.
4. **Live drift exists and is committed** — the consumer copies in `.claude/workflows/` lag the
   sources in `pdlc/workflows/`.
5. **Two artifacts claim each workflow name in `.claude/workflows/`** (`orchestrate-dev.js` and
   `orchestrate-dev.bundle.js`, both `meta.name: "orchestrate-dev"`; likewise queue). Which one
   the runtime resolves is undocumented (BL-05); the legacy `.js` copies must be retired, not
   ignored.
6. **`plugin.json` version does not identify workflow content** — the cached `0.9.0` and `0.10.0`
   ship byte-identical workflow files. Version is context, never a drift discriminator.
7. **Two plugin versions are cached concurrently.** "The installed plugin" must be resolved via
   `${CLAUDE_PLUGIN_ROOT}`, never globbed or version-sorted from the cache.
8. **`build-runtime.mjs` has exactly one output directory** and imports node builtins only; a
   future builder dependency must extend the bootstrap story (AC-6.5).
9. **Hooks are bash, not POSIX sh**, and the three shipped hook scripts share a Python-interpreter
   discovery loop — the JSON tool this feature reuses (NFR-5).
10. **There is no hosted CI** (`.github/` does not exist); `cd pdlc/workflows && npm test` is the
    only automated verification surface (D-DIST-06).
11. **All shipped hook scripts are index mode `100644`** while `hooks.json` invokes them by bare
    path (exit 126 risk). This feature ships its two scripts executable — index mode *and*
    working-tree mode — and fixes the three siblings in the same landing step.

## 1. Problem

`SKILL.md` files load live from the installed plugin — edit them in the repo and every consumer
picks up the change. Workflow scripts do not: the runtime loads a consumer-local copy that is,
today, manual — `pdlc/skills/orchestrate-dev/SKILL.md:98` ("copying the bundle into a consumer
repo **is manual**") and `pdlc/skills/orchestrate-queue/SKILL.md:183` ("Copying the bundle into a
consumer repo **remains manual**"). A workflow improvement can be
authored, reviewed, merged and archived in `yumo-plugins` and never run anywhere, because no
consumer copied it. There is no check, no warning, and no symptom — the pipeline keeps working, on
the old script.

The bundle work makes this strictly worse: there are now three nodes, and two of the links are
unmechanised.

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

**After this REQ** (note A′ moves — REQ-DIST-06):

```
A. repo  pdlc/workflows/*.js  --build-runtime.mjs-->  A′. pdlc/workflows/dist/*.bundle.js
                                                          + dist/distribution-manifest.json
                                                          |          [tracked; sole build output]
                             (plugin publish/update, version-pinned — the pin
                              must move whenever dist/ bytes move: AC-6.6)
                                                          v
                                    B. ${CLAUDE_PLUGIN_ROOT}/workflows/dist/*.bundle.js
                                                          + workflows/dist/distribution-manifest.json
                                                          |
                                               (sync-workflows.sh, explicit)
                                                          v
                                       C. consumer .claude/workflows/*.bundle.js  [untracked]
                                          (legacy consumer .js retired — AC-3.9)
```

In the **maintainer** repo the plugin root is substituted (`<repoRoot>/pdlc`, AC-0.3a), so the same
`sync-workflows.sh` run copies A′ → C directly with no published release in between; that is the
only maintainer/consumer difference.

This REQ closes A′→B (REQ-DIST-06: build to a shippable path, ship it, and **advertise it** —
AC-6.6 makes the version pin move whenever `dist/` bytes move) and B→C (drift detection + explicit
sync), and retires the legacy consumer `.js` copies. A→A′ is already closed by
`build-runtime.mjs --check` and `__tests__/runtimeBundle.test.js`.

The A′→B edge decomposes into two steps with different owners, and only the first is this REQ's:

| Step | Owner | Failure mode if unowned |
|---|---|---|
| `dist/` bytes change ⇒ the advertised `plugin.json` `version` changes | **This REQ, AC-6.6** | The marketplace advertises nothing new; the consumer's cache is never refreshed; its drift check compares against an unchanged installed plugin and reports every row `in-sync`, exit 0 — silent and green. §0 fact 6 shows this repo has already shipped two versions whose workflow bytes were identical, i.e. the same defect in the opposite direction |
| a bumped version reaches the consumer's plugin cache | Claude Code's plugin updater — **D-DIST-05** | Consumer runs an old cache; out of this REQ's control |

Refreshing B from the marketplace is therefore the updater's job (D-DIST-05); making B *worth*
refreshing is AC-6.6.

## 2. User stories

- **US-01** — As the operator, I want to be told at session start when a consumer repo is running
  a stale workflow artifact, so I never debug behavior that the source no longer describes.
- **US-02** — As the operator, I want a single command to bring a consumer repo's workflow copies
  up to date.
- **US-03** — As the operator, I want the drift check to tell me *which direction* the drift runs
  — a consumer copy edited locally is a different problem from a consumer copy left behind — and I
  want that answer deterministic, not an artifact of when files were checked out.
- **US-04** — As the consolidation agent, I want a merged workflow change to be published in the
  plugin package and to reach the consumers it was written for; otherwise my promotion is a no-op.

## 3. Requirements

### REQ-DIST-00 — Managed set and comparison baseline

- **AC-0.1** — Who: any drift check. Given the plugin ships a distribution manifest at
  `<pluginRoot>/workflows/dist/distribution-manifest.json` — `<pluginRoot>` is
  `${CLAUDE_PLUGIN_ROOT}` in a consumer, `<repoRoot>/pdlc` in the maintainer repo (AC-0.3a) —
  When the check enumerates the **managed set**, Then that manifest is the sole authority for it:
  one row per managed artifact, each `{ id, pluginPath, consumerPath, artifactVersion, pluginSha1,
  retires }`, `pluginPath` relative to `<pluginRoot>`, `consumerPath` relative to the consumer
  repo root, `retires` an array (possibly empty, never absent) of consumer-relative paths the row
  supersedes. Globbing a directory to discover managed rows is prohibited. Every member of the
  union namespace `{row ids} ∪ {basename(p) : p ∈ any retires}` matches
  `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` and the members are pairwise distinct (they share the
  backup-filename namespace, AC-3.4); a violation makes the manifest malformed (AC-1.0,
  `manifest-malformed`). No path appears in two rows' `retires`; no `retires` member equals any
  row's `consumerPath`. *(P0)*
- **AC-0.2** — Who: any drift check. Given the manifest, When read, Then it contains exactly the
  two runtime-loadable bundles at v1 —
  `workflows/dist/orchestrate-dev.bundle.js → .claude/workflows/orchestrate-dev.bundle.js` (id
  `orchestrate-dev`, `retires: [".claude/workflows/orchestrate-dev.js"]`) and the analogous
  `orchestrate-queue` row — and no ES module source, `runtime-adapter.js`, `build-runtime.mjs`,
  `package.json`, lockfile, tests or `node_modules/` entry: those are build inputs, never copied
  to a consumer. The top-level `retired` array is **defined as** the union of every row's
  `retires` — a convenience index, never an independent source of truth; a manifest where the two
  disagree is malformed. *(P0)*
- **AC-0.3** — Who: any drift check in a **consuming** repo. Given the comparison baseline, When
  `<pluginRoot>` is resolved, Then it is the installed plugin root via `${CLAUDE_PLUGIN_ROOT}` —
  the mechanism the three shipped hooks already use. A consumer machine generally has no
  `yumo-plugins` working tree; a checked-out source tree is never a consumer baseline. *(P0)*
- **AC-0.3a — Maintainer-repo substitution.** Who: any drift check in the maintainer repo. Given
  the resolved repo root contains `pdlc/workflows/build-runtime.mjs` (the maintainer marker), When
  `<pluginRoot>` is resolved, Then it is `<repoRoot>/pdlc` — the package root, one variable
  binding, with the same path joins as any consumer — and `${CLAUDE_PLUGIN_ROOT}` is not
  consulted (its being unset is not an error here, including for invoking
  `<pluginRoot>/hooks/scripts/sync-workflows.sh` itself). The maintainer green path is two
  commands: **build, then sync** — `build-runtime.mjs` writes only `dist/` (AC-6.1); the same sync
  script every consumer runs performs the copy. Rationale: the maintainer working tree is ahead of
  the last release by construction; treating it as an ordinary consumer would report every row
  stale-or-worse forever and block the queue on its own repo. *(P0)*
- **AC-0.3b — Pre-manifest consumer.** Who: a consumer whose installed plugin predates this
  feature — i.e. **every** consumer at first release. Given the manifest is absent from the
  installed plugin, When any drift computation runs, Then the baseline is `unresolved` with reason
  `manifest-absent` (AC-1.0), `rows` is `[]`, and `retiredPresent` is `[]` — meaning "not
  evaluated", never "none present". The hook warns and exits 0; `--check` exits 3; sync copies and
  retires nothing; the queue is `blocked`. The stated remediation is **update the plugin** — not
  `sync-workflows.sh` — on every surface. The `checkEnabled` escape (AC-4.3) remains reachable:
  write the config, then run the hook or `--check` so a shell writer records the resolved flag;
  the config alone does not unblock the queue. *(P0)*
- **AC-0.4** — Who: any drift check in a consuming repo. Given multiple plugin versions are
  cached, When the baseline is resolved, Then resolution uses `${CLAUDE_PLUGIN_ROOT}` verbatim and
  never enumerates, sorts, or version-compares cache directories. Unset or empty ⇒ baseline
  `unresolved`, reason `plugin-root-unset`; set but not traversable, or manifest bytes unreadable
  by the JSON tool ⇒ `plugin-root-unreadable` (remediation: environment/permissions, never
  reinstall). The manifest's reader is the JSON tool, never the hash utility — hash-tool absence
  is a row-level reason (AC-1.2) and never a baseline reason. Surfaces that print a remediation
  command print it `<pluginRoot>`-expanded, so it is runnable as shown. *(P0)*
- **AC-0.5** — Who: any drift check. Given the process starts in an arbitrary subdirectory, When
  the consumer repo root is resolved, Then, in order:
  1. If `git` (≥ 2.7.0, declared in §4) is on `PATH` and `git rev-parse --git-dir` succeeds: the
     root is the **main worktree's** work-tree path (first record of
     `git worktree list --porcelain`), accepted only if it is not bare, is traversable, and
     `git -C <path> rev-parse --show-toplevel` agrees. **If step 1 applies and any check fails,
     the result is step 3 — never the walk.** A wrong root is worse than a refusal.
  2. Only when step 1 does not apply (no usable `git` / not a git work tree): walk upward from
     `$PWD` to the nearest ancestor containing `.claude/`, stopping before `$HOME` and `/`.
  3. Otherwise: baseline `unresolved`, reason `repo-root-unresolved` — and nothing is created on
     disk in this state.

  A resolved root equal to `$HOME` or `/` is always rejected (reason `repo-root-unresolved`),
  whichever step produced it: `~/.claude/` exists on every machine running Claude Code, and no
  operation in this feature may ever write under `$HOME/.claude/`. All linked worktrees of one
  clone share one `.claude/workflows/`, one sync manifest, one drift state; per-worktree sync is
  deferred (D-DIST-07). *(P0)*
- **AC-0.6** — Who: any drift check producing a human-facing report. Given the consumer's
  `.claude/workflows/` directory, When the report (not the managed set) is produced, Then the
  directory is enumerated once to list files with no manifest row as `not-managed`, excluding
  every basename starting `.pdlc-`. `not-managed` appears only in human-facing output, never in
  the drift-state `rows` (AC-2.6) — no state file describes itself. This is the only operation
  that needs directory *read* permission; when enumeration fails the report says so and no row
  state changes. *(P0)*
- **AC-0.7 — Retirement is per-row.** Who: the maintainer. Given the `.js` → `.bundle.js`
  migration, When the manifest is authored, Then each superseding row carries the paths it retires
  in its own `retires` array (AC-0.1), which is what makes AC-3.9's "delete only after the
  superseding row is in place" guard computable per row. A retired path is not a managed row
  (never compared, never a state) and not `not-managed` (not left alone): it is quarantined by
  sync under AC-3.9. *(P0)*

**Comparison semantics.** Both sides of every comparison are the *same generated bundle*: node B
ships what `build-runtime.mjs` emitted at publish time; node C holds a copy. "In-sync" is plain
byte equality — never source-vs-generated, never a consumer-side rebuild (consumers have no build
tooling). The source→bundle relation stays where it lives today: `build-runtime.mjs --check` and
`__tests__/runtimeBundle.test.js`.

### REQ-DIST-01 — Drift detection

- **AC-1.0 — Baseline resolution precedes row classification.** Who: any drift check. Given any
  drift computation, When it runs, Then it first resolves the **baseline** —
  `baselineStatus ∈ {resolved, unresolved}` — and evaluates rows only when `resolved`; when
  `unresolved`, `rows` is `[]` and the reason is one of the closed set `plugin-root-unset`,
  `plugin-root-unreadable`, `repo-root-unresolved`, `manifest-absent`, `manifest-malformed`,
  `json-tool-absent`, `manifest-empty` (parsed but zero rows — a size-zero managed set satisfies
  any universal claim vacuously), `drift-state-invalidated` (written only by the drift-state
  writer when its own write failed — "nothing in this file measures this run"). When several
  conditions hold, the reported reason follows a single declared precedence (v13 AC-1.0; O-9).
  **Every green outcome** — hook silence (AC-2.2), `--check` exit 0 (AC-3.3), queue
  proceed-silently (AC-4.1) — requires `baselineStatus: resolved` **and** non-empty `rows`
  **and** empty `writeFailures`. Absence of evidence is never evidence of sync: this is what
  keeps a pre-manifest rollout (AC-0.3b) from going vacuously green. *(P0)*
- **AC-1.1** — Who: the operator. Given any manifest row (no existence qualifier — three of the
  six states are defined by absence), When the check runs against a resolved baseline, Then the
  row is in exactly one of six states: *(P0)*

  | State | Condition | Meaning |
  |---|---|---|
  | `in-sync` | consumer bytes == plugin bytes | nothing to do |
  | `stale` | differ; consumer hash == this row's `consumerHash` in the sync manifest | consumer is behind; safe to sync |
  | `local-edit` | differ; consumer hash != that `consumerHash` | consumer edited after sync; syncing destroys work |
  | `unverified` | differ; no sync-manifest entry for this row | never synced by this tool; direction unknown |
  | `missing` | `consumerPath` definitively absent (its first existing ancestor is traversable) | consumer has no copy |
  | `unknown` | this row could not be verified (AC-1.2) | nothing was verified for this row |

  `stale` vs `local-edit` is discriminated solely by
  `sha1(consumer bytes) == syncManifest[id].consumerHash`; `pluginHash` is reporting-only.
  `missing` requires a *definite* negative existence probe — it is the one non-`unknown` state
  sync overwrites without a backup; an absent path behind an untraversable existing ancestor is
  `unknown`, not `missing`. An absent ancestor establishes absence (the fresh-consumer bootstrap
  classifies `missing`, AC-3.8). `unknown` also covers: `pluginPath` absent or unreadable,
  `consumerPath` unreadable, no hash tool. `not-managed` is not in this table (AC-0.6): it is a
  property of files without a row, report-only.
- **AC-1.2** — Who: the operator. Given a row that cannot be verified against a resolved
  baseline, When the check runs, Then the row is `unknown` with a machine-readable reason from
  the closed set `plugin-artifact-missing` (remediation: update the plugin),
  `plugin-artifact-unreadable` (fix permissions on the plugin cache path),
  `consumer-artifact-unreadable` (fix permissions on `consumerPath` or the named ancestor),
  `hash-tool-absent` (install a hash utility) — the missing/unreadable split exists because the
  remediations differ. Row reasons and baseline reasons (AC-1.0) are disjoint sets; a row reason
  exists only under a resolved baseline. All four: never `in-sync`, not copied by sync, `--check`
  exit 3, queue `blocked`. *(P0)*
- **AC-1.3** — Who: the operator. Given a consumer bundle byte-identical to the plugin's, Then
  the state is `in-sync` regardless of timestamps. No state is decided by mtime; mtime is never
  read. *(P0)*
- **AC-1.4** — Who: the operator. Given multiple rows, Then each is reported independently; no
  row's state masks or suppresses another's. *(P0)*
- **AC-1.5** — Who: the operator. Given a file in `.claude/workflows/` with no manifest row and
  not in any `retires` (a workflow the consuming repo authored for itself), Then it is reported
  `not-managed` (AC-0.6) and never read for comparison, never overwritten, never deleted. *(P0)*
- **AC-1.6** — Who: `sync-workflows.sh` — the **only** writer of managed artifacts into
  `.claude/workflows/`, in every repo including the maintainer's. Given a managed artifact is
  written, When the write completes, Then the writer records
  `{ id, consumerHash, pluginHash, artifactVersion, pluginVersion, syncedAtUtc }` in the **sync
  manifest** `.claude/workflows/.pdlc-sync-manifest.json`. This file is the sole provenance
  source for the `stale`/`local-edit`/`unverified` discrimination, replacing mtime entirely. A
  sync manifest that is absent, unreadable, or malformed degrades fail-safe to `unverified` for
  every row whose bytes differ (equal bytes still classify `in-sync`), with a stderr notice in
  the unreadable/malformed cases; an unreadable sync manifest is deliberately not a baseline
  reason. *(P0)*
- **AC-1.7** — Who: the operator on a repo that has never synced. Given no sync-manifest entry
  for a row, When its bytes differ, Then the state is `unverified` — never `stale`, never
  `local-edit`. First adoption must be safe in both directions: no silent overwrite of a real
  local edit, no silent hiding of real staleness. Remediation is "diff, then sync"; sync requires
  `--force` (AC-3.2). *(P0)*
- **AC-1.8 — Classifier properties.** Who: the FSPEC/TSPEC authors. Given the classifier — domain
  one row of a resolved manifest, codomain the six states — Then, as requirements: **(i)
  totality** (every input combination maps to exactly one state, absurd combinations enumerated,
  no undefined fall-through); **(ii) mutual exclusivity** with fixed precedence
  `unknown` > `missing` > `in-sync` > `unverified` > `stale` > `local-edit`; **(iii)
  determinism** (same filesystem inputs ⇒ same state, across runs and processes, independent of
  clock, mtime, environment order, directory order); **(iv)** the same three properties for
  `rows[].reason` (AC-1.2's set, `null` on non-`unknown` states) and for `baselineReason`
  (AC-1.0's set). The property elaboration (generation axes, fixtures) is a downstream obligation
  (§10 O-9), not REQ content. *(P0)*

### REQ-DIST-02 — SessionStart warning
- **AC-2.1** — Who: the operator. Given a `SessionStart` hook and any managed row `stale` or
  `missing`, When the session starts, Then a warning names the row `id`, the state, and the exact
  remediation command. *(P0)*
- **AC-2.2** — Who: the operator. Given `baselineStatus: resolved`, a **non-empty** managed row
  set, every row `in-sync`, no retired path present, and `writeFailures` empty, When the session
  starts, Then the hook emits nothing. Silence means everything was verified — never "could not
  check". The warning ACs (2.1, 2.3, 2.5, 2.5a, 2.8, 2.9) are exhaustive over the conditions that
  break silence: there is no silent non-green state. *(P0)*
- **AC-2.3** — Who: the operator. Given state `local-edit`, When the warning is emitted, Then it
  is textually distinct from `stale` and does **not** recommend plain sync (which would discard
  the edit); it names `--force` and the backup location. *(P0)*
- **AC-2.4** — Who: the operator. Given the hook fails for any reason, When the session starts,
  Then the hook exits `0`, with the failure on stderr **and** in the drift state file (as
  `baselineStatus: unresolved` + reason, or as `unknown` rows + reason, per level). A broken
  drift check must never block a session from starting. The drift-state write happens on every
  failure path, with exactly two exceptions: **no write target** (`repo-root-unresolved` —
  nothing is created anywhere; `--check`/sync exit 3) and **write attempted and failed**
  (AC-2.9(2); `--check`/sync exit 4). Exiting 0 is about not blocking — never about staying
  quiet. *(P0)*
- **AC-2.5** — Who: the operator. Given state `unknown` or `unverified` on any row, When the
  session starts, Then the hook warns — never silent — and each of AC-1.2's four row reasons is
  individually distinguishable, with its own remediation (the `*-unreadable` reasons get a
  permissions fix — not a sync, not a plugin update). This is what makes AC-1.2 operative. *(P0)*
- **AC-2.5a — Unresolved baseline warns, without rows.** Who: the operator. Given
  `baselineStatus: unresolved` (including `manifest-empty`), When the session starts, Then the
  hook warns with the manifest-level reason verbatim — textually distinct from every row-level
  message — and a remediation that can actually fix it: plugin update for `manifest-*`; an
  environment fix for `plugin-root-unset`; a deliberately generic environment/permissions fix for
  `plugin-root-unreadable`; "create `.claude/` at the intended root, or run inside a git work
  tree" for `repo-root-unresolved`; install a Python interpreter for `json-tool-absent`. The hook
  still exits 0. Rationale: `manifest-absent` is universal at rollout — without this AC that
  state reaches the operator as silence. *(P0)*
- **AC-2.6** — Who: `orchestrate-queue` (as reader). Given any drift computation completes — the
  hook, `--check`, or a sync — When it exits, Then the **shared writer routine** (never the
  queue) has written the full result to `.claude/workflows/.pdlc-drift-state.json`:

  ```
  { schemaVersion: 1,
    generatedAtUtc,               // ISO-8601 Z; reporting only, never a queue input
    generatedBy,                  // "hook" | "check" | "sync"
    pluginVersion,                // context only (AC-5.4); null when unreadable
    checkEnabled,                 // resolved by the writer from .claude/pdlc.config.json (AC-4.3)
    baselineStatus, baselineReason,          // AC-1.0
    retiredPresent: [ { path, supersededBy, supersedingState } ],   // AC-2.8/AC-3.9
    writeFailures:  [ { path, operation } ],                        // AC-2.9(2)
    rows: [ { id, state, reason, pluginHash, consumerHash,
              pluginArtifactVersion, consumerArtifactVersion } ] }
  ```

  `rows` has exactly one entry per manifest row and nothing else; retired paths travel in
  `retiredPresent`, never in `rows`. When `unresolved`, `rows` and `retiredPresent` are `[]`
  meaning "not evaluated". All three arrays are always present. `supersedingState` is measured at
  write time (hook: at session start; check: current; sync: post-copy). Recorded states are those
  observed **before this run created anything** (AC-2.9(1)). This file is the queue's only input
  (AC-4.1). *(P0)*
- **AC-2.7 — Single writer, atomic.** Who: the operator remediating mid-session. Given the drift
  state file, Then there is exactly one writer routine, shared by the hook and
  `sync-workflows.sh` — the exhaustive writer list; `build-runtime.mjs` is not on it, and any
  future process gaining write access to this file must be added here in the same commit. The
  write is whole-file and atomic (sibling temp + `mv`); last complete write wins. Consequently a
  post-sync drift state is current within the same session and the queue unblocks without a
  restart. *(P0)*
- **AC-2.8 — Retired artifact present.** Who: the operator who has updated the plugin but not yet
  synced (retirement is manifest-derived, so it is not evaluated while the baseline is
  unresolved — that case is AC-2.5a's, end to end). Given a path in some row R's `retires` exists
  in the consumer, When the session starts, Then the hook warns with token `retired-present`
  (a message token — deliberately in neither reason set), independently of managed-row states
  (all-in-sync with a legacy `.js` on disk still warns), naming each retired path with R's `id`
  and state, and a remediation conditioned on R's state: `in-sync`/`stale`/`missing` → plain
  sync (`in-sync` is the primary, rollout-universal case); `local-edit`/`unverified` → `--force`,
  naming the backup dir and both backup filename **patterns** (R's bundle and the retired
  basename, each labelled — a directory plus a literal pattern, never a concrete filename);
  `unknown` → plugin update or environment fix, and sync is not named. Manual deletion is never
  recommended. *(P0)*
- **AC-2.9 — Directory creation and the write-failure contract.** Who: every writer surface
  (hook, `--check`, sync). *(P0)*
  1. **Classify first, create second.** Every writer creates `.claude/workflows/` on demand with
     `mkdir -p` (at most `.claude/` and `.claude/workflows/`, at process umask) — but only after
     the whole drift computation has run against the filesystem **as found**, never when the
     reason is `repo-root-unresolved`, and never under `$HOME` or `/`. First run on a fresh
     consumer therefore records `missing` rows in a directory the same run then creates. (Chosen
     over "skip the write when the directory is absent", which would leave the queue permanently
     blocked at rollout and the `checkEnabled` escape unreachable.) The ordering invariant needs
     a script-layer call-order oracle — downstream obligation §10 O-1.
  2. **Two failure classes.** (a) `mkdir` or the drift-state atomic replace fails: no drift state
     is written, the invalidation ladder (3 below) runs, stderr names path + operation; hook
     exits 0, `--check`/sync exit **4**. (b) A per-row write fails (`artifact-copy`, `backup`,
     `backup-verify`, `retire-delete`, `sync-manifest-update`): the run continues to the next row
     (rows independent), that row's sync-manifest entry is not written, the failure is appended
     to `writeFailures`, exit 4, queue blocks. `operation` is a closed nine-member set (§4).
     Exit 4 ("attempted and could not write") is distinct from exit 3 ("no write target").
     Write failure is a run-level outcome, deliberately not a fifth row reason.
  3. **Invalidation ladder.** When the drift-state write fails over a pre-existing file, stop at
     first success: (i) in-place overwrite with a schema-valid invalidation record —
     `baselineStatus: unresolved`, `baselineReason: "drift-state-invalidated"`, carrying this
     run's resolved `checkEnabled` and its collected `writeFailures`; this write must not depend
     on the JSON tool (fixed-literal `printf`, `pluginVersion` emitted as `null`
     unconditionally); (ii) `unlink` (in practice reachable only for `ENOSPC`/quota — immutable,
     append-only, directory-at-the-path and read-only mounts refuse `unlink` and fall through);
     (iii) print the residual and exit 4 (hook: 0). Record-first ordering is deliberate: an
     absent file blocks the queue at a row **above** `checkEnabled`, which would make the
     documented opt-out unreachable on a permanently-unwritable consumer — the record preserves
     `checkEnabled`. **Accepted, stated residual**: at rung (iii) the queue may proceed on stale
     contents; announced on stderr at every drift computation (NFR-6 exception ii).
  4. **No destroy before verified backup.** Any overwrite or delete this feature performs happens
     only after its backup is re-read and hash-compared equal to the source bytes; on mismatch or
     backup failure the original is untouched, the operation is reported skipped, `writeFailures`
     gains an entry, exit 4.
  5. **Test seams exist and are inert in production.** The scripts own two declared,
     test-only environment seams (§4): `PDLC_TRACE_FILE` (append-only call trace; unset ⇒ inert;
     a failure to open/append is ignored by the script) and `PDLC_FAULT` (closed token set). An
     unrecognised `PDLC_FAULT` token prints one stderr line, injects nothing, and uses the
     entrypoint's normal exit — 4 on `--check`/sync, **0 on the hook** (NFR-6 admits no third
     exception). Neither is a config surface; every other observable is identical with the seams
     on or off. Grammar, tokens, and mandated tests: §10 O-1/O-7/O-10.

### REQ-DIST-03 — Sync action

**Delivery vehicle.** Sync is a bash script (NFR-5) shipped at
`<pluginRoot>/hooks/scripts/sync-workflows.sh` and invoked directly by the operator — runnable in
the maintainer repo with no plugin installed (AC-0.3a). It is not an LLM prompt: an LLM-driven
file copy is neither deterministic (NFR-1) nor auditable. A thin discoverability `SKILL.md` may
exist, but its only permitted action is to run the script verbatim and relay output.

- **AC-3.1** — Who: the operator. Given `sync-workflows.sh` with no flags and a resolved
  baseline, When it runs, Then every row `stale` or `missing` is copied `pluginPath` →
  `consumerPath` (atomic per row: sibling temp + `mv`), each copy reported with both hashes, and
  the sync manifest updated per copied row. Rows `local-edit`, `unverified`, `unknown` (all four
  reasons) are not copied. A failed copy does not abort the loop: `writeFailures` entry, no
  sync-manifest entry for that row, continue, exit 4. When the baseline is unresolved: copy
  nothing, retire nothing, print the manifest-level reason + remediation, still rewrite the drift
  state (AC-2.7). Every row falls in exactly one of copy set / skip set. *(P0)*
- **AC-3.2** — Who: the operator. Given a row `local-edit` or `unverified`, When sync runs
  without `--force`, Then it is not overwritten, is reported with the reason, and the exit code
  reflects it; with `--force`, it is overwritten after a verified backup (AC-3.4, AC-2.9(4)).
  *(P0)*
- **AC-3.3** — Who: the operator, and the jest suite — the only automated surface (§0 fact 10).
  Given `--check`, When it runs, Then it reports drift, copies nothing, writes nothing except the
  drift state file (and, per AC-2.9(1), the directory containing it), and exits per this
  complete precedence table — highest applicable wins, never green while anything is unverified:
  *(P0)*

  | Condition (precedence order) | Exit |
  |---|---|
  | any mandated write was attempted and failed (AC-2.9(2)) | 4 |
  | `baselineStatus: unresolved` (any reason, incl. `manifest-empty`), or any row `unknown` | 3 |
  | any row `local-edit` or `unverified` | 2 |
  | any row `stale` or `missing`, or any retired path present | 1 |
  | `resolved`, non-empty rows, all `in-sync`, no retired path, `writeFailures` empty | 0 |

  4 outranks 3 because "could not repair the record" dominates "could not verify"; the 3/4
  boundary is *no write target* vs *attempted write*. Exit 0 asserts "every managed row was
  compared against a resolved baseline and matched" — the automated form can never go green
  having verified nothing (AC-1.0). **The `unverified` asymmetry** (`--check` exits 2, the queue
  proceeds) is deliberate: `--check` is an assertion surface, red whenever provenance is missing;
  the queue is a work surface, and blocking on "direction unknown" would strand every consumer at
  first adoption. The two seams optimise for opposite errors; tests must assert both.
- **AC-3.4** — Who: the operator recovering a mistake. Given a sync overwrites or deletes any
  existing file, When it happens, Then the pre-existing content is first written to
  `.claude/workflows/.pdlc-backups/{id}.{YYYYMMDDTHHMMSSZ}[-N].bak` (UTC, fixed width; `-2`, `-3`
  … on same-second collision; never overwritten) and verified (AC-2.9(4)) before the destroying
  operation. The id namespace is the union of row ids and retired basenames (AC-0.1) — so
  retirement backups share the retention rule. Retention: newest **5 per id**, selected by
  `LC_ALL=C` lexicographic descending filename sort (fixed-width stamp ⇒ lexicographic ==
  chronological), grouped by the id captured from the stamp-anchored filename pattern; pruning is
  never mtime-based and never touches a file not matching the pattern for a current id. Backup
  dir creation follows AC-2.9(1); its failure is the write-failed outcome. A recorded hash is not
  a substitute — a digest cannot restore content. *(P0)*
- **AC-3.5** — Who: the operator. Given `--force` overwrote a `local-edit` or `unverified` row,
  When the newest backup for that id is restored, Then the file is byte-identical to its pre-sync
  content. Restore is the one oracle for AC-3.4 that cannot be false-greened. *(P0)*
- **AC-3.6** — Who: the operator. Given a sync completes, When `--check` runs immediately after
  with no intervening edit, Then every copied row reports `in-sync` and every skipped row reports
  its prior state. *(P0)*
- **AC-3.7** — Who: the operator. Given a sync completes with no intervening change **from any
  source**, When sync runs again with the same flags, Then it copies nothing, writes no backup,
  leaves the sync manifest byte-identical, and exits 0. Version-control caveat: a checkout or
  stash-pop that resurrects a retired, still-tracked file *is* an intervening change — the next
  sync legitimately retires it again, with a second backup. *(P0)*
- **AC-3.8** — Who: the operator on a fresh consumer whose repo root resolves (AC-0.5). Given no
  `.claude/workflows/` exists, When `--check` runs, Then every row is `missing` (classified
  before this run's own `mkdir -p` — the observed axis is "parent absent"), the drift state is
  written into the directory the run itself created, exit 1; When sync runs, Then the directory
  is created — under the AC-0.5 root, never `$HOME` — and every row copied. A **non-git tree
  with no `.claude/` anywhere** does not resolve: `--check` exits 3, the hook warns the
  environment fix, nothing is created, the queue blocks; remediation is one `mkdir .claude` (or
  `git init`) at the intended root. *(P0)*
- **AC-3.9 — Legacy artifact retirement.** Who: the operator on a consumer predating this
  feature. Given a path `p ∈ R.retires` exists and the baseline is resolved, When sync runs (not
  `--check`), Then `p` is deleted **iff row R's post-copy state is `in-sync`**, and only after a
  verified backup of `p` under AC-3.4 (id = retired basename; a `mv` into the backup dir is an
  acceptable implementation). Any other R state (including every `unknown`) ⇒ `p` is left,
  `retire-skipped` reported naming R's state; a failed or mismatching backup ⇒ left,
  `retire-skipped`, `writeFailures`, exit 4. `--check` reports retired paths as
  `retired-present`, exit class 1 (sync-fixable, same as `stale`). Retirement is per path,
  idempotent, and never runs before its replacement is in place — the failure mode to avoid is
  deleting the loadable artifact and leaving nothing. Version control, two rules of different
  kind: (1) a one-time maintainer landing step in this repo `git rm`s the four tracked
  `.claude/workflows/*` paths and gitignores the directory's generated contents; (2) in any
  consumer, sync never runs a VCS command — it detects tracked-ness best-effort
  (`git ls-files --error-unmatch`; no usable git ⇒ treat as untracked) and prints a one-line
  manual action telling the operator to commit the removal; detection failure never blocks
  retirement. *(P0)*

### REQ-DIST-04 — Pipeline integration (defense-in-depth)

**Primary detector is the hook, not the queue.** The hook ships from the plugin and fires
regardless of what the consumer's workflow copies contain; the queue check lives *inside* the
artifact whose staleness it detects. A consumer whose queue bundle predates this feature will
never self-report via AC-4.1 — the first and worst instance is covered only by the hook.
First-adoption story: install/update plugin → hook fires next session → operator syncs → queue
check exists from then on. No AC here may be relied on for first adoption.

- **AC-4.1** — Who: `orchestrate-queue`. Given the queue begins an invocation, When it starts,
  Then it performs **one** injected read of `.claude/workflows/.pdlc-drift-state.json` — it never
  hashes, enumerates, classifies, or opens any other file — and maps what it finds per this
  precedence table: *(P0)*

  | Condition (precedence order) | Queue outcome |
  |---|---|
  | read absent, unparseable, `schemaVersion` != 1, or `baselineStatus` absent | `blocked` |
  | `checkEnabled` is `false` | proceed; skip noted in report (AC-4.3) |
  | `writeFailures` non-empty | `blocked`, naming each `{ path, operation }` (and naming `drift-state-invalidated` when `baselineReason` carries it) |
  | `baselineStatus: unresolved` (incl. `manifest-empty`, `drift-state-invalidated`) | `blocked`, naming `baselineReason` |
  | any row `unknown` | `blocked` |
  | any row `missing` or `stale` | `blocked` |
  | `retiredPresent` non-empty | `blocked` (sync-fixable — a retired path beside a fresh bundle is the one configuration where the runtime may load the stale artifact, BL-05) |
  | any row `local-edit` or `unverified` | proceed, rows named in the run report |
  | `resolved`, non-empty rows, all `in-sync`, `retiredPresent` [], `writeFailures` [] | proceed silently |

  Row 2 sits above the blocking rows deliberately — the operator's opt-out stays reachable. No
  freshness clause: AC-2.7 makes every writer refresh the file, so a stale snapshot cannot
  outlive the operation that invalidated it; "hook never ran" is row 1 (absent); a write
  attempted-and-failed is closed at the writer by AC-2.9(3)'s ladder, whose rung-3 residual
  (queue may proceed on stale contents) is accepted and stated, not asserted away.
  `generatedAtUtc` is human-report-only; the queue never compares timestamps (NFR-1).
- **AC-4.2** — Who: the operator. Given AC-4.1 blocks, When the report is written, Then it is
  split by level — Manifest / Row / Run — because the reason sets are disjoint: manifest
  `manifest-*` ⇒ plugin update; `plugin-root-*` / `repo-root-unresolved` / `json-tool-absent` ⇒
  environment fix; `drift-state-invalidated` ⇒ permissions/filesystem fix (never sync); row
  `plugin-artifact-missing` ⇒ plugin update; other row reasons ⇒ environment/permissions fix;
  `stale`/`missing` ⇒ sync; run level ⇒ one line per `writeFailures` entry naming path +
  operation. Multiple simultaneous row reasons print the one selected by the declared precedence
  (§4). `retiredPresent` entries carry R's id and state and the remediation AC-2.8's table names
  for that state. Every printed command is `<pluginRoot>`-expanded and runnable as shown. The
  operator's next turn is one command, not an investigation. *(P0)*
- **AC-4.3** — Who: the consuming-repo operator. Given `.claude/pdlc.config.json` with key
  `distribution.checkEnabled`, When any drift computation runs, Then the **shell writer**
  resolves the flag and records the boolean in the drift state file; the queue reads that field
  from the one file it already reads and, when `false`, skips state evaluation and notes the skip.
  Resolution is fail-closed to `true` in every degraded case: parsed-with-key ⇒ the boolean;
  key absent, file absent ⇒ `true`; malformed or unreadable ⇒ `true` plus one verbatim stderr
  notice. The queue never opens the config file (one-read rule, NFR-1). Scope: the flag gates the
  **queue** only — the hook still warns and `--check` still exits non-zero. The flag deliberately
  does not live in workflow source, because that source is what drifts. *(P0)*

### REQ-DIST-05 — Version stamping (reporting only)

Version stamping is **data the builder emits alongside the bundles** — not a `meta` field: the
runtime demands a pure first-statement literal, and grepping a 92 KB generated file from shell is
backwards (v3 SE F-02).

- **AC-5.1** — Who: `build-runtime.mjs`. Given a build, Then it also emits
  `pdlc/workflows/dist/distribution-manifest.json` — the sole manifest location — carrying per
  row `artifactVersion` (the plugin.json version at build time) and `pluginSha1` (sha1 of the
  emitted bundle). No module or bundle gains a version field; `meta` literals and the runtime's
  pure-literal constraint are untouched. *(P1)*
- **AC-5.2** — Who: the operator. Given hash and version stamp disagree, Then **content hash is
  authoritative**; versions are compared for equality only, never ordered — no semver comparator
  exists anywhere in this feature (§4). *(P1)*
- **AC-5.3** — Who: the operator reading a drift report. Given a row not `in-sync`, Then the
  report carries both `pluginArtifactVersion` (from the shipped manifest) and
  `consumerArtifactVersion` (from the sync manifest; absent ⇒ reported as unknown) — both lines
  **required** and both labelled "not a drift signal", because many distinct bundle contents
  legitimately share one `artifactVersion`; the two sha1 values are printed as the discriminating
  evidence. *(P2)*
- **AC-5.4** — Who: the operator. Given `plugin.json` versions demonstrably do not identify
  workflow content (§0 fact 6), Then `pluginVersion` in any report or state file is context only
  — never an input to any state decision; `null` when unreadable. *(P2)*

### REQ-DIST-06 — Publish the executable artifact in the plugin package

This is the requirement US-04 traces to and the precondition of every copy AC above: today there
is nothing in the plugin package to copy (§0 fact 2).

- **AC-6.1 — One canonical build output.** Who: the maintainer. Given
  `node pdlc/workflows/build-runtime.mjs`, When it runs, Then `pdlc/workflows/dist/` is the
  **sole** location it writes — `dist/*.bundle.js` + `dist/distribution-manifest.json`, tracked
  and committed — and it writes nothing else: no `.claude/workflows/` copy, no sync-manifest
  entry, no drift state. This repo's `.claude/workflows/*.bundle.js` become untracked,
  gitignored consumer copies (AC-3.9's landing step), produced by the same sync script every
  consumer runs. The maintainer loop is **build, then sync**. `build-runtime.mjs --check`
  compares `dist/` only; the builder keeps its single output directory and its
  node-builtins-only dependency footprint (§0 fact 8). *(P0)*
- **AC-6.2 — Packaging oracle, executable before release.** Who: the jest suite. Given the set
  of files the plugin would package (everything under `pdlc/` minus ignore rules), When
  `npm test` runs, Then a test asserts: (a) every `pluginPath` in the manifest resolves inside
  the packaged set; (b) each file's sha1, recomputed from disk bytes, equals its `pluginSha1`;
  (c) top-level `retired` equals the union of rows' `retires`; (d) the manifest itself sits at
  `pdlc/workflows/dist/distribution-manifest.json` inside that set. Build inputs in the package
  are tolerated, not asserted away. No test may write into this repository's
  `pdlc/workflows/dist/`. *(P0)*
- **AC-6.2a** — Who: the maintainer's release checklist (hosted automation is D-DIST-06). Given
  a published release is installed, Then `${CLAUDE_PLUGIN_ROOT}/workflows/dist/` contains the
  named bundles **plus the manifest itself**. *(P1)*
- **AC-6.3 — Freshness on the surface that exists.** Who: the jest suite. Given a commit changes
  any workflow source, Then `__tests__/runtimeBundle.test.js` fails unless the committed `dist/`
  bundles were rebuilt in the same commit — repointed at `dist/` per AC-6.1. There is no hosted
  CI (D-DIST-06); `npm test` is the surface. *(P0)*
- **AC-6.4 — No document states a superseded distribution convention.** Who: the maintainer.
  Given the `.js` → `.bundle.js` migration, When the feature lands, Then a test asserts
  `coveredViolations(repoRoot) == ∅`, where the covered set is computed, not hand-listed:
  `grep` of **five** literal qualifier-free patterns — the two
  `.claude/workflows/orchestrate-{dev,queue}.js` forms; `.claude/workflows/*.js`; the phrase
  `managed manually`; the phrase `opying the bundle into a consumer repo` (case-tolerant stem,
  matching both SKILL phrasings measured in §1) — minus a four-member path-rule exemption whose
  members are enumerated literally so the set is computable without judgement: (i) generated
  trees = `.claude/workflows/` and `pdlc/workflows/dist/`; (ii) per-feature `docs/<feature>/`
  artifact dirs; (iii) any `distribution-manifest.json`; (iv) any `__tests__/`. The test asserts
  the exemption list itself, so a silently widened exemption is red. The checker is a pure
  function of a root directory. A false positive is resolved by rephrasing the document —
  narrowing a pattern or widening an exemption requires changing this AC in the same commit.
  **Measured covered set today: 7 files** — `docs/_queue/QUEUE.md`,
  `docs/design/MASTER-PLAN-engineering-loop.md`, `docs/PLAN-pdlc-integration-boundary-gates.md`,
  `pdlc/workflows/orchestrate-{dev,queue}.js`, and
  `pdlc/skills/orchestrate-{dev,queue}/SKILL.md` (the two manual-copy statements §1 cites as the
  problem's own evidence). This criterion claims exactly what it computes — that no in-scope
  document states a superseded path or manual-copy convention — not that no document contradicts
  the manifest in any way. Because the SKILLs are inside the covered set rather than corrected
  once by hand, reintroducing the superseded convention into either one is red forever. *(P0)*
- **AC-6.5 — Fresh-clone bootstrap.** Who: the jest suite. Given a fresh clone of this repo with
  no plugin installed and `${CLAUDE_PLUGIN_ROOT}` unset, When the two documented commands run —
  `node pdlc/workflows/build-runtime.mjs`, then `pdlc/hooks/scripts/sync-workflows.sh` (bare
  path — the scripts ship executable, §0 fact 11) — Then bundles are present, every row is
  `in-sync`, `--check` exits 0, and the queue's AC-4.1 mapping over the resulting drift state is
  proceed-silently: **no published release, no installed plugin, no network**. Every row first
  classifies `missing` (AC-1.1's ancestor rule) and the sync run creates the directory
  (AC-2.9(1)). Both commands are documented in `CLAUDE.md` and `pdlc/README.md`. Fixture
  construction, mode-bit assertions, and the classify-before-create trace oracle are downstream
  obligations (§10 O-1, O-12). *(P0)*
- **AC-6.6 — A changed artifact is an advertised artifact.** Who: the jest suite (assertion) and
  the maintainer (the act). Given a commit that changes the bytes of any file under
  `pdlc/workflows/dist/`, When `npm test` runs, Then it fails unless
  `pdlc/.claude-plugin/plugin.json` `version` also changes in that same commit — i.e. the
  advertised version is never equal to the version advertised by the previous commit that
  touched `dist/`. Oracle: compare `plugin.json` `version` at `HEAD` against its value at the
  most recent earlier commit whose diff touched `pdlc/workflows/dist/`; equal ⇒ red. The
  comparison is over committed history, so the check is inert in a working tree with no such
  ancestor (fresh clone / initial landing commit) and states that as its skip reason rather than
  passing silently. Ordering is not asserted (no semver policy) — only that the pin moved.
  Rationale: without this, a merged workflow change is built, tracked and shipped into a package
  version the marketplace never re-advertises, and every consumer's drift check is green against
  a stale installed plugin (§1 A′→B table; §0 fact 6 is the measured precedent). Delivering the
  bumped version into an already-installed cache remains D-DIST-05. *(P0)*

## 4. Declared thresholds, flags and locations

Every constant this feature depends on, declared once. Elaborated table with per-row owner,
default, and absence behaviour: v13 §4 (`9b66cdb`) — normative here in summary:

| Item | Value |
|---|---|
| distribution manifest | `<pluginRoot>/workflows/dist/distribution-manifest.json`; absent on every pre-feature install (AC-0.3b) |
| `<pluginRoot>` | `${CLAUDE_PLUGIN_ROOT}` in a consumer; `<repoRoot>/pdlc` when `pdlc/workflows/build-runtime.mjs` is present (AC-0.3a) |
| managed row ids (v1) | `orchestrate-dev`, `orchestrate-queue` |
| sync manifest | `.claude/workflows/.pdlc-sync-manifest.json`; written by `sync-workflows.sh` only |
| drift state file | `.claude/workflows/.pdlc-drift-state.json`; single atomic writer (AC-2.7); invalidation ladder on failed write (AC-2.9(3)) |
| backup dir / retention / stamp | `.claude/workflows/.pdlc-backups/`; newest 5 per id, `LC_ALL=C` lexicographic; `YYYYMMDDTHHMMSSZ[-N]`; never mtime |
| id charset | `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` over the union namespace (AC-0.1) |
| `baselineReason` set (8, closed) | `plugin-root-unset`, `plugin-root-unreadable`, `repo-root-unresolved`, `manifest-absent`, `manifest-malformed`, `json-tool-absent`, `manifest-empty`, `drift-state-invalidated`; declared precedence in that reverse order — `drift-state-invalidated` highest (AC-1.0) |
| row `reason` set (4, closed) | `hash-tool-absent` > `plugin-artifact-missing` > `plugin-artifact-unreadable` > `consumer-artifact-unreadable` (declared precedence; `null` on non-`unknown` states) |
| `writeFailures.operation` set (9, closed) | `mkdir`, `drift-state-replace`, `drift-state-invalidate`, `drift-state-unlink` (stderr-only) · `artifact-copy`, `backup`, `backup-verify`, `retire-delete`, `sync-manifest-update` (recordable) |
| `sync-workflows.sh` exits | `0` verified green · `1` sync-fixable drift · `2` unverified provenance · `3` unverified/unresolved (incl. no write target) · `4` write attempted and failed. **The code is computed over the observed state at the end of the run** — pre-run state for `--check` (which changes nothing), post-run state for a sync run. So a sync that repaired a `stale` row exits `0`; a mixed run that copied a `stale` row and skipped an `unverified` one exits `2` (AC-3.3's precedence applied post-run). Per-entrypoint wording: §10 O-14 |
| content-hash utility | `shasum` \| `sha1sum`, probed; both absent ⇒ rows `unknown`/`hash-tool-absent` (row-level only, never a baseline reason) |
| JSON utility | Python interpreter via the sibling hooks' discovery loop; a dedicated four-outcome read (parsed `0` / unreadable `10` / absent `11` / malformed `12` — outside CPython's 1/2 and the script's 0–4); never a bare `except`; none found ⇒ `json-tool-absent`. One write is exempt: AC-2.9(3)'s `printf` invalidation record |
| `git` | third external tool, ≥ 2.7.0 (`worktree list --porcelain`); absent ⇒ AC-0.5 step 2 + everything treated untracked; present-but-unusable ⇒ `repo-root-unresolved`, never a silent demotion |
| `distribution.checkEnabled` | `.claude/pdlc.config.json`; fail-closed `true` on every degraded read (AC-4.3); gates the queue only |
| `PDLC_TRACE_FILE`, `PDLC_FAULT` | test-only env seams owned by the scripts; unset ⇒ inert; not config surfaces (AC-2.9(5)); vocabulary/grammar: §10 O-1/O-7 |
| latency budget | p95 ≤ 500 ms against ≤ 8 artifacts / ≤ 512 KB (≈4× headroom over the real 2-row set), warm cache, reference machine — observed, never test-gated (NFR-2) |
| shipped script modes | index `100755` **and** on-disk `[ -x ]` — independent objects, both required (§0 fact 11) |

All consumer-side state lives under `.claude/workflows/` with a `.pdlc-` basename prefix: no
manifest row, so sync can never copy, compare, or destroy it, and AC-0.6 keeps it out of
`not-managed` — no state file describes itself.

## 5. Non-functional requirements

- **NFR-1 — No LLM in the classification path.** Classification is content hashing plus JSON
  reads in bash. The queue performs one injected read of an already-computed file and makes no
  classification decision; no hashing, enumeration, or judgement happens in an LLM turn.
- **NFR-2 — Latency is a design constraint, not a measured property.** No test asserts wall-clock
  time — a timing assertion on a SessionStart hook is flaky by construction, and anyone tempted to
  write one should read this instead. §4's p95 budget is therefore discharged **structurally and
  reviewably at FSPEC**: no unbounded filesystem enumeration (the walk is bounded by the manifest's
  managed set plus one directory listing of `.claude/workflows/`), no process spawn per row beyond
  the three declared tools, and no network. Those are checkable by reading the spec. The wall-clock
  number itself is observed once, on the maintainer's release checklist (the AC-6.2a pattern), and
  is advisory: a miss opens a bug, it never fails a build.
- **NFR-3 — Never touch unmanaged files.** No file without a manifest row is read for
  comparison, modified, or deleted (AC-1.5, AC-0.1).
- **NFR-4 — Detection automatic, modification explicit.** Sync never runs implicitly: not from
  the hook, not from a SKILL.
- **NFR-5 — Bash, three declared external tools.** Both scripts are bash (`#!/usr/bin/env bash`,
  `set -uo pipefail` discipline), shipped executable in `pdlc/hooks/scripts/`. Beyond bash
  builtins and coreutils they depend on exactly three external tools — hash utility, JSON
  utility, `git` — each declared in §4 with absence behaviour. The two content-tool degradations
  are independent: hash-tool absence degrades rows to `unknown`; JSON-tool absence degrades the
  whole run to `unresolved`. `git`'s absence is not a correctness degradation (AC-0.5 step 2).
  Absence never crashes and never becomes `in-sync`. The `PDLC_*` seams are part of the scripts'
  contract (inert unset), and AC-2.9(3)'s `printf` record is the single sanctioned exemption
  from the JSON-tool dependency.
- **NFR-6 — Fail-open session seam, fail-closed queue seam.** The hook never prevents a session
  from starting (AC-2.4); the queue never runs the feature pipeline on an unverified state
  (AC-4.1). Fail-closed has exactly **two stated exceptions, both announced**: (i) the
  operator's explicit `distribution.checkEnabled: false`; (ii) AC-2.9(3)'s rung-3 residual —
  on a consumer where neither the drift state file nor its directory is writable, the queue may
  proceed on stale contents, announced on stderr at every drift computation. `PDLC_FAULT` is not
  a third exception (AC-2.9(5)). Fail-closed does not mean unescapable: the invalidation record
  preserves `checkEnabled` so the documented opt-out stays reachable.

## 6. Scope

**In scope:**
- `build-runtime.mjs`: retarget sole output to `pdlc/workflows/dist/`, emit the manifest
  (AC-5.1, AC-6.1). It gains **no** new write target — no consumer copies, no sync manifest, no
  drift state. `meta` literals untouched.
- `__tests__/runtimeBundle.test.js`: freshness repointed at `dist/` (AC-6.3); packaging oracle
  (AC-6.2); superseded-convention oracle (AC-6.4); fresh-clone bootstrap (AC-6.5);
  version-advertised oracle (AC-6.6).
- `pdlc/.claude-plugin/plugin.json`: `version` bumped in the landing commit (AC-6.6 — `dist/` is
  new bytes), and in every later commit that changes `dist/`.
- `pdlc/hooks/hooks.json`: register the SessionStart drift hook as a second `SessionStart` entry
  beside `nudge-consolidation.sh` (BL-03). Without this edit the hook never fires.
- Manifest-driven managed set; baseline-then-rows classification (AC-1.0); six-state drift
  detection with hash-based provenance; report-only `not-managed`.
- SessionStart warning hook; shared atomic drift-state writer; `sync-workflows.sh` with
  `--check` / `--force`; verified backups; per-row retirement (AC-3.9).
- Queue integration (AC-4.1–4.3), defense-in-depth only; version stamping, reporting only.
- Execute bits (index + worktree) on this feature's two scripts **and** the three existing
  sibling hook scripts (class fix, §0 fact 11). The three siblings are deliberately in scope: they
  work today only because `hooks.json` happens to invoke them by bare path, and this feature adds
  a fourth script under the same convention plus AC-6.5's bare-path bootstrap, so the latent
  exit-126 class is fixed once here rather than split into a follow-up.
- One-time landing step: `git rm` the four tracked `.claude/workflows/*` paths, gitignore the
  generated contents; document the bootstrap sequence in `CLAUDE.md` and `pdlc/README.md`.
- Document corrections: whatever `coveredViolations(repoRoot)` returns (7 files today, including
  both orchestrator SKILLs) plus `dist/` path updates to the already-correct normative documents. Archived per-feature
  spec history under other features' `docs/` dirs is not edited.

**Out of scope:** `pdlc install` (D-DIST-01); loading workflows from the plugin path with no copy
(D-DIST-02); auto-sync (D-DIST-03, violates NFR-4); multi-consumer fan-out (D-DIST-04); the
marketplace→cache link (D-DIST-05); hosted CI/release automation (D-DIST-06); per-worktree sync
(D-DIST-07).

## 7. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `${CLAUDE_PLUGIN_ROOT}` resolves to a readable plugin root in a consumer `SessionStart` | Executable spike: hook echoes the resolved path in a consumer session | Before FSPEC. The three shipped hooks already assume it; evidence, not proof |
| BL-02 | The plugin package contains an artifact to copy | AC-6.1 + AC-6.2 merged, `npm test` green (deliberately not gated on an installed release) | Before any REQ-DIST-03 implementation |
| BL-03 | `hooks.json` accepts a second `SessionStart` entry beside `nudge-consolidation.sh` | Both hooks observed firing in one session | Before FSPEC |
| BL-04 | The runtime's injected read can read the drift state file and distinguish absence | Discharged by citation (`orchestrate-queue.js` `_readFile` contract; adapter honours it) | Re-verify citations at FSPEC |
| BL-05 | Which artifact the runtime resolves when `X.js` and `X.bundle.js` both claim one `meta.name` | Runtime observation | AC-2.8's warning and AC-4.1's `retiredPresent` block are deliberately **not** contingent on the answer — they specify the safe default for the unfavourable case |
| BL-06 | Whether the runtime inside a **linked git worktree** loads `.claude/workflows/` from that worktree or the main one | Runtime observation | Before FSPEC. If per-worktree, AC-0.5's main-worktree resolution is insufficient and D-DIST-07 pulls into this feature |

## 8. Deferrals

| ID | Deferred | Why | Binds to |
|---|---|---|---|
| D-DIST-01 | Full `pdlc install` mechanism | Detection + explicit sync closes the loop; a package manager is a separate design | `docs/_queue/QUEUE.md` row 6 |
| D-DIST-02 | Loading workflows directly from the plugin path (no copy) | Depends on runtime behavior not under this repo's control | row 6 |
| D-DIST-03 | Auto-sync on detection | Violates NFR-4; revisit only if drift proves chronic | row 6 |
| D-DIST-04 | Multi-consumer fan-out | One consumer today | row 5 (`pdlc-engineering-loop`) |
| D-DIST-05 | Detecting a plugin cache stale behind the marketplace | Owned by Claude Code's updater; this REQ closes A′→B and B→C only | row 6 |
| D-DIST-06 | Hosted CI / release automation | `.github/` does not exist; every AC here is verifiable via `npm test` today | row 7 |
| D-DIST-07 | Per-worktree sync (each linked worktree its own consumer) | Gated on BL-06 | row 6 |

## 9. Traceability

| Story | Satisfied by |
|---|---|
| US-01 | REQ-DIST-00 (0.3a, 0.3b, 0.6), REQ-DIST-01 (1.0–1.8), REQ-DIST-02 (2.1, 2.2, 2.5, 2.5a, 2.6, 2.8) |
| US-02 | REQ-DIST-00 (0.4, 0.5), REQ-DIST-02 (2.7, 2.9), REQ-DIST-03 (3.1, 3.3, 3.6–3.9), REQ-DIST-06 (6.5) |
| US-03 | REQ-DIST-01 (1.1, 1.3, 1.6, 1.7), REQ-DIST-02 (2.3, 2.5), REQ-DIST-03 (3.2, 3.4, 3.5), REQ-DIST-05 (5.1–5.4) |
| US-04 | REQ-DIST-00 (0.1, 0.2, 0.7), REQ-DIST-04 (4.1–4.3), REQ-DIST-06 (6.1–6.6) — "published in the package" is 6.1–6.3, "advertised so it can reach consumers" is 6.6; final delivery into an installed cache is the updater's (D-DIST-05) |

## 10. Downstream specification obligations (binding FSPEC/TSPEC/PROPERTIES entry input)

This section is the carry-forward mandated by POSTMORTEM-R R-2. Each row is an **entry
obligation** for the named downstream document: its author must dispose of every row, and that
document's reviewers must verify the disposition. Source findings:
`CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v12.md`. The fully-elaborated (but defective
— see each finding) apparatus is in REQ v13.0 (`9b66cdb`).

| # | Source | Lands in | Obligation |
|---|---|---|---|
| O-1 | SE v12 F-01, TE v12 F-01 | TSPEC / PROPERTIES | The classify-before-create ordering invariant (AC-2.9(1)) needs a script-layer observable. v13's trace design failed three ways — repair by: scoping the assertion to a single classification invocation; giving the trace grammar row-id and phase fields; requiring a positive-presence conjunct so it cannot pass vacuously on an empty trace; making an unwritable trace a red **test** (while the script still ignores trace failures) |
| O-2 | SE v12 F-02, TE v12 F-02 | FSPEC | An unrecognised `PDLC_FAULT` token must never make the hook exit non-zero (v14 already states the outcome in AC-2.9(5)); FSPEC must specify the per-entrypoint behavior so NFR-6's "exactly two exceptions" stays true |
| O-3 | SE v12 F-03, TE v12 F-03 | TSPEC / PROPERTIES | AC-0.5 step 2 is only reachable on a **non-git** fixture (a git worktree routes step-1 failures to step 3); its oracle must assert observables that exist in the `repo-root-unresolved` state (stderr reason line, `--check` exit 3), not drift-state fields never written there; a traverse fault seam needs one token per guard (git vs walk) |
| O-4 | SE v12 F-04, TE v12 F-05 | FSPEC | The `printf` invalidation record: `pluginVersion` is an arbitrary string, emitted as `null` unconditionally (v14 AC-2.9(3) states this); FSPEC must carry the emitter contract and mandate a `json-tool-absent` ladder test asserting the record parses and reaches AC-4.1's `baselineStatus`-unresolved row |
| O-5 | TE v12 F-04 | FSPEC | Ladder rung-2 reachability: `unlink(2)` is refused on immutable, append-only and directory targets — only `ENOSPC`/quota reaches rung 2; the others are rung-3 residual, derived like the read-only-mount case |
| O-6 | SE v12 F-05 | FSPEC | A run that fails both an artifact copy and the drift-state write must tell the operator about the invalidated state, not only the failed copy (v14 AC-4.1 row 3 states the outcome; FSPEC specifies the message) |
| O-7 | SE v12 F-06, TE v12 F-06 | TSPEC | The trace seam's **existence is mandated** by AC-2.9(5) and §4 — it is not optional. TSPEC pins its delimiter and quoting and states whether non-row probes (manifest, sync manifest, `pdlc.config.json` reads) are traced. Only the grammar is downstream |
| O-8 | TE v12 F-07 | FSPEC | Degraded-provenance wording: rows whose bytes differ are reported `unverified`; an equal-bytes row is `in-sync` regardless of provenance (v14 AC-1.6 states this; FSPEC carries the verbatim lines) |
| O-9 | AC-1.8 / AC-1.0 (v13) | PROPERTIES | The classifier's totality / single-valuedness / determinism properties over states, row reasons, and baseline reasons, including the declared precedences. v13's generation-axis tables had 24 undefined cells (SE v11 F-03) — regenerate the axes downstream; do not import the tables |
| O-10 | AC-2.9 (v13) | TSPEC | The write-failure contract's test design: which failures are injectable, per-runner fixture requirements (uid-0 caveats), fail-open assertions per writer surface. v13's mandated tests (a)–(f) are the starting inventory |
| O-11 | AC-1.1a (v13) | TSPEC / PROPERTIES | Probe vocabulary and permission-fixture policy: uid-0 runners skip example-based permission fixtures with a printed reason and named unverified invariants — never silently pass; coverage floors live here, not in the REQ |
| O-12 | AC-6.5 (v13) | TSPEC | Bootstrap fixture construction (working-tree copy with mode bits, `git init` anchor, pinned `HOME`, `realpath` normalisation) and both mode-bit assertions (index and on-disk) |
| O-13 | POSTMORTEM R-5 | `docs/_constraints/` via consolidate-learnings | REQ-scope stopping rule: a round whose blocking findings are all implementability/oracle defects, none contesting need/scope/priority/phasing, signals the REQ met its bar — approve, move findings downstream. Two consecutive rounds of non-decreasing blocking count is a fixed point: escalate, don't iterate. **Neither `docs/_constraints/` nor `docs/_decisions/` exists on this branch** — `consolidate-learnings` must *create* `docs/_constraints/DOMAIN-CONSTRAINTS.md`, not merge into it; "no such file" does not discharge this row |
| O-14 | TE v13 F-01 | FSPEC | `sync-workflows.sh`'s own exit code: AC-3.3's precedence table applied to the **post-run** state (§4 states the rule; FSPEC carries the per-entrypoint wording and the mixed-run example — copied a `stale` row, skipped an `unverified` one ⇒ exit 2) |

## 11. Review history

Twelve review rounds (v1–v12, both reviewers) and their finding-by-finding dispositions are
archived in REQ v13.0 §10 (`9b66cdb`) and the `CROSS-REVIEW-*` files on this branch. Round 13
(`CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v13.md`, against REQ v14.0) is disposed in
the v15.0 note at the head of this document: SE 1H/1M/3L and TE 4L, all addressed; TE recommended
approval. Phase R
non-convergence, root cause, and the acceptance decision this version implements:
`POSTMORTEM-R-pdlc-workflow-distribution.md` (v2.1, resolved).
