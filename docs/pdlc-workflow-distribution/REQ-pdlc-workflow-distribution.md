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
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..6}.md` — twelve files, all on `feat-pdlc-workflow-distribution` |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 7.0 | 2026-07-27 |

> **v7.0 is a content revision** addressing the v6 SE review (1H/2M/5L) and v6 TE review (1H/3M/3L);
> see §10 for the finding-by-finding disposition. The five blocking answers this revision settles,
> stated once here so no reader has to reconstruct them from the ACs:
>
> 1. **AC-6.4's RED fixture has a legal home, stated two ways so neither door is closed.** The
>    mandated fixture root is a **non-git temp tree** under `os.tmpdir()` (the house pattern —
>    `pdlc/workflows/__tests__/fixtures/tmpGitFixture.js` already builds fixtures that way), so the
>    directory-walk discovery branch is the one exercised and no fixture is ever tracked; and
>    `**/__tests__/**` is added as a **fourth exemption rule** so that any in-repo test fixture or
>    golden-output datum quoting the superseded convention cannot make
>    `coveredViolations(repoRoot) == ∅` permanently red. Without both, the only implementation green
>    on both mandated assertions is the one whose RED case cannot fire (SE F-01, TE F-01).
> 2. **Repo-root resolution derives the *work tree*, never the parent of a git directory**
>    (AC-0.5 step 1, rewritten to `git worktree list --porcelain`). The v6 rule silently resolved a
>    submodule or `--separate-git-dir` consumer to `<super>/.git/modules` — a readable directory that
>    is neither `$HOME` nor `/`, so every declared guard passed on a bogus root. Inside a git work
>    tree, a failed derivation now goes **straight to `repo-root-unresolved`**, never to the upward
>    walk: a wrong root is worse than a refusal (SE F-02, TE F-04).
> 3. **`git` is declared as the third external tool in §4**, with a minimum version (2.7.0, for
>    `git worktree list --porcelain`) and a stated behaviour when it is absent, older, or the
>    repository is bare. NFR-5's "exactly two external tools" is corrected (TE F-04).
> 4. **A present-but-unreadable `consumerPath` has a state and a reason.** AC-1.2's closed row-reason
>    set gains `consumer-artifact-unreadable`, AC-1.1's `missing` is narrowed to *absent with a
>    readable parent*, and AC-1.8(i)'s two byte-presence axes become three-valued
>    (`absent` / `present-unreadable` / `present-readable`). Previously the only reachable answer was
>    `missing`, which sync copies over with no backup (SE F-03, TE F-05).
> 5. **The `retiredPresent` remediation is conditioned on the superseding row's state.** AC-3.9's
>    guard means a plain sync provably cannot clear `retiredPresent` when the superseding row is
>    `local-edit`/`unverified`; AC-2.8(iv) and AC-4.2 now name the remediation that can actually fix
>    each case, so the golden-output oracle for that state has one correct answer (TE F-02).
>
> **New in v7**: AC-6.5 names its verification surface, its isolation and its queue observable
> (TE F-03).
>
> Rules adopted in v4 and still in force: **the version row is bumped only when the body changed**,
> and the review iteration index is derived from the highest cross-review file on the branch.

> **Scope in one line.** Ship the executable workflow artifact inside the plugin package, detect
> drift between it and the runtime-loaded consumer copy, and give the operator one explicit
> command to repair it — so a merged workflow improvement actually executes.

## 0. Grounding

This REQ is grounded against commit **`5630d58`** on `feat-pdlc-workflow-distribution`, with a
**clean working tree** — every hash and enumeration below is of committed content, re-measured for
v7.0 (the tree is unchanged from `3dab335` apart from committed cross-review documents, so every
v5.0 hash still holds; fact 14's enumeration was re-derived from scratch at `5630d58`, and its
output grew by two paths purely because two more cross-review documents were committed — all of
which AC-6.4's exemption rule removes, so the covered-violation set is unchanged). v1 of this REQ was grounded against `cb5e5f7` and modelled the ES
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
7. **Live, *committed* drift exists in this repo today.** Node C (`b8815b28…`) differs from node A
   (`2cfc66c1…`). The working tree is clean at `3dab335`, so this is not an uncommitted edit
   someone forgot to sync — it is drift that has been merged and archived, which is the stronger
   form of the argument: an uncommitted edit would be dismissible as work-in-progress. The v1 claim
   that a spot-checked consumer was "byte-identical, last synced five days earlier" was not
   reproducible and is withdrawn; the table above replaces it.
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
    `cd pdlc/workflows && npm test` (jest; `pdlc/workflows/__tests__/` holds **15** `*.test.js`
    files plus `fixtures/` and `helpers/`, including `__tests__/runtimeBundle.test.js` which
    already asserts bundle freshness against `.claude/workflows/` at `:22-25` and `:77-79`). Every
    AC in this REQ addresses that surface; standing up hosted CI is deferred and bound (D-DIST-06).
11. **The sibling hooks are bash, not POSIX `sh`, and already solve JSON parsing.** All three of
    `pdlc/hooks/scripts/*.sh` start `#!/usr/bin/env bash` and each carries the same
    Python-interpreter discovery loop (probe `python3`, `python`, `py` by executing them; never
    block if none is found). This feature parses and writes four JSON files, so it reuses that
    mechanism rather than reinventing one (NFR-5, §4).
12. **The plugin package root is `pdlc/`.** `.claude-plugin/marketplace.json` declares
    `"source": "./pdlc"`. Nothing outside `pdlc/` can ship to a consumer — which is why the built
    bundles cannot be shipped from `.claude/workflows/` and REQ-DIST-06 moves the build output to
    `pdlc/workflows/dist/`. Combined with fact 4, an artifact built to `pdlc/workflows/dist/X`
    installs at `${CLAUDE_PLUGIN_ROOT}/workflows/dist/X` — the `pdlc/` segment is dropped, the
    `dist/` segment is **not**.
13. **`build-runtime.mjs` has exactly one output directory today.**
    `pdlc/workflows/build-runtime.mjs:29` declares a single
    `OUT_DIR = resolve(REPO_ROOT, ".claude", "workflows")`; `:170` is `mkdirSync(OUT_DIR, …)` and
    the **only content write is `writeFileSync(path, contents, "utf8")` at `:184`**, inside the
    `for (const { file, contents } of bundles)` loop at `:172-186`. AC-6.1 **retargets** that
    constant; it does not add a second one. The builder is not, and does not become, a writer of
    `.claude/workflows/`, of the sync manifest, or of the drift state file.
14. **The superseded distribution convention is stated in exactly five files that are neither
    generated nor archived spec history.** This is measured with the **same command AC-6.4's test
    runs** — a union of four literal patterns, no prose qualifier — at `5630d58`:

    ```
    git grep -l -E '\.claude/workflows/(orchestrate-dev|orchestrate-queue|\*)\.js|managed manually'
    ```

    Verbatim output, pasted unaltered — 27 lines, in the order `git grep -l` emits them (SE v6
    F-04; v6 collapsed the cross-reviews into brace expressions and moved
    `docs/PLAN-pdlc-integration-boundary-gates.md` out of position while calling the result
    "verbatim", so a reader who pasted the command got a diff on the one fact whose purpose is
    mechanical re-derivability):

    ```
    .claude/workflows/orchestrate-dev.bundle.js
    .claude/workflows/orchestrate-dev.js
    .claude/workflows/orchestrate-queue.bundle.js
    .claude/workflows/orchestrate-queue.js
    docs/PLAN-pdlc-integration-boundary-gates.md
    docs/_queue/QUEUE.md
    docs/design/MASTER-PLAN-engineering-loop.md
    docs/orchestrate-dev-workflow/DECISIONS-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/FSPEC-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/PLAN-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/PROPERTIES-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/REQ-orchestrate-dev-workflow.md
    docs/orchestrate-dev-workflow/TSPEC-orchestrate-dev-workflow.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v1.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v2.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v3.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v4.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v5.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-software-engineer-REQ-v6.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-test-engineer-REQ-v1.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-test-engineer-REQ-v4.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-test-engineer-REQ-v5.md
    docs/pdlc-workflow-distribution/CROSS-REVIEW-test-engineer-REQ-v6.md
    docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md
    pdlc/workflows/orchestrate-dev.js
    pdlc/workflows/orchestrate-queue.js
    ```

    **This output is not stable and is not required to be.** Every cross-review round adds one or
    two `docs/pdlc-workflow-distribution/CROSS-REVIEW-*` lines (25 at `1075e7d`, 27 here) — all of
    which the exemption rule removes. What is stable, and what AC-6.4 asserts, is the difference.

    Subtracting AC-6.4's exemption **rule** (generated trees `.claude/workflows/**` and
    `pdlc/workflows/dist/**`; per-feature artifact directories — any `docs/<dir>/` containing a
    `REQ-*.md`, which is exactly `docs/orchestrate-dev-workflow/` and
    `docs/pdlc-workflow-distribution/` today; test trees `**/__tests__/**`, which contribute no hits
    today) leaves the **covered violations**, five files:

    | Covered file | Superseded text at | Correction |
    |---|---|---|
    | `docs/_queue/QUEUE.md` | `:41-42` (`.claude/workflows/*.js`, "managed manually") | name `.claude/workflows/*.bundle.js`, synced by `sync-workflows.sh` |
    | `docs/design/MASTER-PLAN-engineering-loop.md` | `:82-83` (same two forms) | same |
    | `docs/PLAN-pdlc-integration-boundary-gates.md` | `:134`, `:184` | same |
    | `pdlc/workflows/orchestrate-dev.js` | `:5` header comment | same |
    | `pdlc/workflows/orchestrate-queue.js` | `:5` header comment | same |

    Three further normative files already name `.bundle.js` and therefore **do not appear in the
    grep output at all** — `CLAUDE.md:58-59`, `pdlc/skills/orchestrate-dev/SKILL.md:90`,
    `pdlc/skills/orchestrate-queue/SKILL.md:175`. They are not part of AC-6.4's oracle; they need
    the `dist/` path update, which §6 carries as an ordinary in-scope edit. v5's fact 14 listed them
    inside a table framed as the grep's output, which is what made the table sum to more rows than
    the command returns (SE v5 F-06, TE v5 F-03).

    v2–v5 each maintained this list by hand and each was wrong. AC-6.4 is restated so that no list
    is maintained at all: the covered set **is** `grep(patterns) − exemptionRule(path)`, both halves
    machine-computable.

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
                                                          + dist/distribution-manifest.json
                                                          |          [tracked; sole build output]
                                          (plugin publish/update, version-pinned)
                                                          v
                                    B. ${CLAUDE_PLUGIN_ROOT}/workflows/dist/*.bundle.js
                                                          + workflows/dist/distribution-manifest.json
                                                          |
                                               (sync-workflows.sh, explicit)
                                                          v
                                       C. consumer .claude/workflows/*.bundle.js  [untracked]
                                          (legacy consumer .js retired — AC-3.9)
```

In the **maintainer** repo the plugin root is substituted (`<repoRoot>/pdlc`, AC-0.3a) so the same
`sync-workflows.sh` run copies A′ → C directly, without a published release in between. That is the
only difference between the maintainer repo and any other consumer; the path joins are identical.

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
  **`<pluginRoot>/workflows/dist/distribution-manifest.json`** — where `<pluginRoot>` is
  `${CLAUDE_PLUGIN_ROOT}` in a consuming repo (AC-0.3) and `<repoRoot>/pdlc` in the maintainer repo
  (AC-0.3a) — When the check enumerates **the managed set**, Then that manifest is the sole
  authority for it: one row per managed artifact,
  each row `{ id, pluginPath, consumerPath, artifactVersion, pluginSha1, retires }`, with
  `pluginPath` relative to **`<pluginRoot>`** and `consumerPath` and every member of `retires`
  relative to the consumer repo root.

  `retires` is an array (possibly empty, never absent) of the consumer-relative paths this row
  **supersedes** — the data that makes AC-3.9's delete guard computable. At v1,
  `orchestrate-dev.bundle.js` carries `retires: [".claude/workflows/orchestrate-dev.js"]` and
  `orchestrate-queue.bundle.js` carries `retires: [".claude/workflows/orchestrate-queue.js"]`. No
  path may appear in two rows' `retires`, no `retires` member may equal any row's
  `consumerPath`, and **no two `retires` members anywhere in the manifest may share a basename**;
  violation ⇒ the manifest is malformed — `baselineStatus` `unresolved` with reason
  `manifest-malformed`, which is **AC-1.0's** closed manifest-level set (AC-2.4 is only the hook's
  exit behaviour for it; SE v6 F-06). The basename rule exists because AC-3.4 groups backup
  retention by the captured `id`, and a retirement backup's `id` **is** the retired path's basename:
  without it, `.claude/workflows/x.js` and `.claude/legacy/x.js` collapse into one retention group
  and one backup namespace, and the newest-5-per-`id` property test has no well-defined grouping key
  (TE v6 F-06). The `id` values at v1 are
  literally **`orchestrate-dev`** and **`orchestrate-queue`** (TE v5 F-08) — golden-output and
  backup-filename fixtures pin those strings.

  There is exactly one manifest location and it is written the same way in AC-0.2, AC-0.3a, AC-5.1,
  AC-6.1, AC-6.2, AC-6.2a and §4: built at `pdlc/workflows/dist/distribution-manifest.json`,
  installed at `${CLAUDE_PLUGIN_ROOT}/workflows/dist/distribution-manifest.json` (§0 facts 4 + 12 —
  the `pdlc/` segment is dropped on install, the `dist/` segment survives), read in the maintainer
  repo at `<repoRoot>/pdlc/workflows/dist/distribution-manifest.json`. All three are the same
  `<pluginRoot>`-relative path `workflows/dist/distribution-manifest.json`. Any AC, table row or
  fixture that writes it without the `dist/` segment is wrong.

  Globbing a directory to *discover managed rows* is prohibited. `id` matches
  `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` — no `/`, no `..`, no leading dot — because AC-3.4
  interpolates it into a backup filename; a row failing this is rejected and the manifest is
  treated as malformed (AC-1.0, reason `manifest-malformed`). *(P0)*
- **AC-0.2** — Who: any drift check. Given the manifest, When it is read, Then it contains exactly
  the two runtime-loadable bundles at v1 —
  `workflows/dist/orchestrate-dev.bundle.js → .claude/workflows/orchestrate-dev.bundle.js` and
  `workflows/dist/orchestrate-queue.bundle.js → .claude/workflows/orchestrate-queue.bundle.js` —
  and **no** ES module source, `runtime-adapter.js`, `build-runtime.mjs`, `package.json`,
  `package-lock.json`, `.gitignore`, `__tests__/` or `node_modules/` entry. Those are build
  inputs or tooling and must never be copied into a consumer. The manifest additionally carries a
  top-level `retired` array, **defined as the union of every row's `retires`** (AC-0.7).
  A manifest whose top-level `retired` is not exactly that union is malformed — `baselineStatus`
  `unresolved`, reason `manifest-malformed` (**AC-1.0**; AC-2.4 governs only the hook's exit code
  for that condition, SE v6 F-06) — it is a
  convenience index, never an independent source of truth. *(P0)*
- **AC-0.3** — Who: any drift check in a **consuming** repo. Given the comparison baseline, When
  `<pluginRoot>` is resolved, Then it is **node B**, the installed plugin root addressed via
  `${CLAUDE_PLUGIN_ROOT}` — the same mechanism all three shipped hooks in `pdlc/hooks/hooks.json`
  already use. A consumer machine generally has no `yumo-plugins` working tree, so a checked-out
  source tree is never a baseline for a consuming repo. *(P0)*
- **AC-0.3a — Maintainer-repo plugin-root substitution.** Who: any drift check in the **maintainer**
  repo. Given the resolved repo root contains `pdlc/workflows/build-runtime.mjs` (the unambiguous
  maintainer-repo marker), When `<pluginRoot>` is resolved, Then

  > **`<pluginRoot>` := `<repoRoot>/pdlc`** — the *package root* (§0 fact 12), not
  > `${CLAUDE_PLUGIN_ROOT}` and not `pdlc/workflows/dist/`.

  and **everything downstream joins onto it unchanged**: the manifest is read from
  `<pluginRoot>/workflows/dist/distribution-manifest.json`, and each row's `pluginPath` (AC-0.2:
  `workflows/dist/orchestrate-dev.bundle.js`) resolves to
  `<repoRoot>/pdlc/workflows/dist/orchestrate-dev.bundle.js`. This is the whole substitution: one
  variable, one binding, no second path-composition rule to get wrong. v4 phrased this as "the
  baseline is `pdlc/workflows/dist/`", which double-nests the join into
  `pdlc/workflows/dist/workflows/dist/…` and therefore resolved every maintainer-repo row to
  `unknown` / `plugin-artifact-missing` — the exact failure the AC exists to remove (TE v4 F-02).

  Rationale, and this is a correctness requirement not a convenience: the maintainer repo's tree is
  ahead of the last published release **by construction** (§0 facts 5–7), so treating it as an
  ordinary consumer of the released cache would (i) report every row `missing`/`unverified`
  forever, (ii) block the queue on its own repo, and (iii) on the first release that ships bundles,
  overwrite freshly built bundles with stale released ones. With this AC the maintainer repo's
  green path is **build → sync → everything `in-sync`** (see AC-6.1: the builder writes `dist/`
  only; `sync-workflows.sh` is what populates `.claude/workflows/`), which is what makes AC-3.3
  exit 0 and AC-2.2 silence reachable on real inputs and therefore testable at all. *(P0)*
- **AC-0.3b — The pre-manifest consumer.** Who: a consumer whose installed plugin predates this
  feature — at first release, that is **every** consumer, since no cached version ships a manifest
  today (§0 fact 3). Given `<pluginRoot>/workflows/dist/distribution-manifest.json` does not exist,
  When any surface runs, Then **`baselineStatus` is `unresolved` with reason `manifest-absent`
  (AC-1.0), `rows` is `[]`, and `retiredPresent` is `[]` meaning *not evaluated*** — and every
  surface reacts to the manifest-level status, not to the (empty) row set: the SessionStart hook
  warns (AC-2.5a) and exits `0` (AC-2.4), `--check` exits `3` (AC-3.3 row 1), sync copies nothing
  and retires nothing (AC-3.1, AC-3.9), and the queue reports `blocked` (AC-4.1 row 2). This is
  correct, not a bug — nothing has been verified, so nothing may be claimed.

  **`retiredPresent: []` here means "not evaluated", not "none present".** Retirement is
  manifest-derived (AC-0.7), so with no manifest the retired set is unknowable — and §0 fact 8 shows
  the paths really are present in this very repo. A reader must never treat `[]` as evidence of
  absence; `baselineStatus` is what carries the meaning, and it is `unresolved` (TE v5 F-04).

  **The single documented escape is to update the plugin** to a release that ships the manifest;
  AC-2.5a's warning and AC-4.2's report must therefore name plugin update as the remediation
  whenever the reason is `manifest-absent`, not `sync-workflows.sh` (which cannot help).

  **The interim escape is two-step, and the test must assert both steps.** Setting
  `distribution.checkEnabled: false` in `.claude/pdlc.config.json` does not by itself unblock the
  queue: AC-4.1 row 1 (drift state file absent/unparseable) is evaluated *above* the `checkEnabled`
  row, and the queue never opens the config file (AC-4.3). The flag reaches the queue only through
  the drift state file, so the sequence is **write the config → run the hook or `--check` (the shell
  writer resolves the flag and records it) → the queue proceeds**. A one-step fixture that writes
  the config and runs the queue blocks, correctly (TE v5 F-09).

  This state is expected to be transient and universal at rollout; the test suite asserts it as a
  first-class path rather than treating it as an error case. *(P0)*
- **AC-0.4** — Who: any drift check. Given multiple plugin versions are cached (today `0.9.0` and
  `0.10.0`), When `<pluginRoot>` is resolved in a consuming repo, Then resolution uses
  `${CLAUDE_PLUGIN_ROOT}` verbatim and never enumerates, sorts, or version-compares cache
  directories. Given `${CLAUDE_PLUGIN_ROOT}` is unset or does not resolve to a readable directory,
  Then `baselineStatus` is `unresolved` with reason `plugin-root-unset` (AC-1.0) and no cache
  directory is guessed. This AC applies only when AC-0.3a's maintainer-repo marker is absent; when
  it is present, `${CLAUDE_PLUGIN_ROOT}` is not consulted at all and its being unset is not an
  error — **including for the invocation path of the sync script itself**, which is
  `<pluginRoot>/hooks/scripts/sync-workflows.sh` under the same binding (REQ-DIST-03 preamble,
  AC-6.5), i.e. `pdlc/hooks/scripts/sync-workflows.sh` in the maintainer repo. Every surface that is
  required to print "the exact remediation command" (AC-2.1, AC-2.5, AC-2.5a, AC-2.8, AC-4.2)
  prints that expansion of `<pluginRoot>`, so the command is always runnable in the repo the reader
  is standing in. *(P0)*
- **AC-0.5** — Who: any drift check. Given the process starts in an arbitrary subdirectory, When
  the consumer repo root is resolved, Then resolution is, in this order:
  1. **`git` is on `PATH` and `git rev-parse --git-dir` succeeds** (i.e. we are inside *some* git
     repository or its git directory). Then the root is the **main worktree's work-tree path**,
     read as the `worktree` value of the **first** record of

     ```
     git worktree list --porcelain
     ```

     `git worktree list` always emits the main worktree first and always prints absolute paths, and
     it returns the main worktree even when the process is inside a linked worktree or inside the
     `.git` directory itself (verified at `5630d58`: from `/Volumes/T9/workspace/yumo-plugins/.git`
     it still prints `worktree /Volumes/T9/workspace/yumo-plugins`). The result is accepted only if
     **(a)** the first record carries no `bare` line, **(b)** the printed path is a readable
     directory, and **(c)** `git -C <path> rev-parse --show-toplevel` returns that same path.
     If step 1 applies but any of (a)–(c) fails, resolution goes **straight to step 3** — never to
     step 2.
  2. Only when step 1 does **not** apply — `git` is absent from `PATH`, or `git rev-parse --git-dir`
     fails because this is not a git repository at all — walk upward from `$PWD` to the nearest
     ancestor containing `.claude/`, **stopping before** `$HOME` and before `/`.
  3. Otherwise `baselineStatus` is `unresolved` with reason `repo-root-unresolved` (AC-1.0).

  **Why the work tree and not the parent of the git directory (SE v6 F-02, TE v6 F-04).** v6 read
  `git rev-parse --path-format=absolute --git-common-dir` and took its **parent**. That is correct
  only for the ordinary `<root>/.git` layout. For a **submodule** the same command returns
  `<super>/.git/modules/<name>`, whose parent is `<super>/.git/modules`; for a clone made with
  `--separate-git-dir` it returns the external git directory. In both cases the parent is a readable
  directory that is neither `$HOME` nor `/`, so **every guard this AC declares passes on a bogus
  root** and AC-3.8 then *creates* `.claude/workflows/` inside a git directory — the same failure
  class the `$HOME` rejection exists to prevent, one layer along. `git worktree list --porcelain`
  returns a *work tree* by construction, and check (c) re-derives it independently, so a path that
  is not a work-tree root cannot be accepted.

  **Why a failure inside a git repo refuses instead of walking (TE v6 F-04).** Step 2's bounded
  `.claude/` walk can terminate at a subdirectory that happens to contain a stray `.claude/`,
  silently producing the wrong consumer root with every downstream state computed against it. A
  wrong root is strictly worse than a refusal — that is the same argument that makes `$HOME` a
  rejection rather than a fallback — so once we know we are inside a git repository, the only two
  outcomes are the verified work-tree root or `repo-root-unresolved`. The walk exists solely for the
  genuinely non-git consumer.

  **Minimum git version and absence.** `git worktree list --porcelain` has existed since **git
  2.7.0** (2016), which §4 declares as the minimum; v6's `--path-format` required 2.31 and had no
  declared minimum, no owner and no default. On git older than 2.7.0 the sub-command fails, which is
  a step-1 (a)–(c) failure ⇒ `repo-root-unresolved`, never a silent demotion to the walk. `git`
  absent from `PATH` entirely is *not* a failure of step 1 — step 1 never applies — so a non-git
  consumer machine still resolves via step 2, exactly as before. All three cases (`git` absent,
  `git` present but older than 2.7.0, present but the repository is bare) have a stated answer and
  are required fixtures.

  **A linked git worktree is not a distinct consumer.** `pdlc/workflows/orchestrate-dev.js:1869`
  dispatches every Phase-I implementation agent with `{ isolation: "worktree" }` and `:1882` merges
  the `feat-{feature}-{task}-worktree` branch back, so linked worktrees are created routinely by
  this pipeline. A bare `git rev-parse --show-toplevel` (v5's step 1) returns the *linked worktree's* path,
  which — after AC-3.9's landing step untracks and gitignores `.claude/workflows/` — is a directory
  where the managed artifacts do not and should not exist: every row would be `missing`, the hook
  would warn on every implementation-agent session, `--check` would exit 1 and the queue would block
  (SE v5 F-05). Resolving the **main** worktree instead means all worktrees of one clone share one
  `.claude/workflows/`, one sync manifest and one drift state file, which is also the only reading
  under which AC-2.7's "the drift state on disk reflects post-sync truth" holds across a Phase-I
  batch. If a future runtime is shown to load workflow artifacts per-worktree, per-worktree sync is
  D-DIST-07 — it is not in this feature.

  A resolved root equal to `$HOME` or to `/` is **always** rejected as `unresolved` **with reason
  `repo-root-unresolved`**, regardless
  of which step produced it — including when step 1 succeeded. Rationale: `~/.claude/` exists on every machine running Claude Code (it
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
- **AC-0.7 — Retirement is per-row, not global.** Who: the maintainer. Given the migration from
  `.js` consumer copies to `.bundle.js` consumer copies, When the manifest is authored, Then each
  superseding row carries its predecessors in its own `retires` array (AC-0.1) —
  `orchestrate-dev` → `[".claude/workflows/orchestrate-dev.js"]`,
  `orchestrate-queue` → `[".claude/workflows/orchestrate-queue.js"]` — and the top-level `retired`
  array is exactly their union.

  **Why per-row rather than a flat list (TE v5 F-02).** AC-3.9's delete guard is "delete a retired
  path only after the row that supersedes it is in place". A flat array carries no key back to a
  row, and basename matching cannot recover one (`orchestrate-dev.js` and
  `orchestrate-dev.bundle.js` share no basename; a "strip `.bundle`" rule is an unauthorised
  inference that breaks on the third managed artifact). With `retires` the guard is a per-row
  relation a fixture can state and a test can falsify: *row A `unknown`/`plugin-artifact-missing`,
  A's `retires` path present, sync runs ⇒ that path still exists afterwards.*

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

- **AC-1.0 — Baseline resolution is a precondition, evaluated before any row quantifier.** Who:
  every surface in this feature. Given a drift computation begins, When it runs, Then it first
  produces a **manifest-level** outcome

  > `baselineStatus ∈ { resolved, unresolved }`, and when `unresolved`, a `reason` from the closed
  > set `plugin-root-unset`, `plugin-root-unreadable`, `repo-root-unresolved`, `manifest-absent`,
  > `manifest-malformed`, `json-tool-absent`, `manifest-empty`

  and only when it is `resolved` does it evaluate rows at all. `manifest-empty` is the case "the
  manifest parsed but declares zero managed rows"; it is `unresolved` because a managed set of size
  zero can satisfy any universally quantified claim without verifying anything.

  **Every green outcome in this feature is guarded by `baselineStatus == resolved` AND a non-empty
  row set**, and each of the three seams states it explicitly: hook silence (AC-2.2), `--check`
  exit `0` (AC-3.3 row 1), queue proceed-silently (AC-4.1 row 2). Conversely each seam has a
  dedicated non-green outcome for `unresolved`: the hook warns (AC-2.5a), `--check` exits `3`, the
  queue blocks.

  This AC exists because v5 expressed all six manifest-level failures as *per-row reasons* while the
  conditions they name are precisely what prevents rows from existing. Under v5's wording the
  manifest-absent state — which AC-0.3b says is **every** consumer at first release — made
  "every managed row is `in-sync`" vacuously true, so a conforming implementation was silent at the
  hook, exited `0` from `--check` and proceeded in the queue, having verified nothing. That is the
  exact false green this feature exists to eliminate, reachable on the universal rollout state
  (TE v5 F-01). `baselineStatus` and its `reason` are top-level fields of the drift state file
  (AC-2.6), and `rows` is `[]` whenever `baselineStatus` is `unresolved`. *(P0)*
- **AC-1.1** — Who: the operator. Given **a manifest row** — any row, with no precondition on
  either side existing — When the check runs, Then it reports exactly one of the six states in the
  table below, using content hashes and the sync manifest (AC-1.6) where both sides are readable.
  The Given carries no existence qualifier deliberately: three of the six states (`missing`,
  `unknown`, and `unverified` on a never-synced repo) are *defined by* something being absent, so
  a Given that presupposed presence would contradict its own Then (TE v4 F-06). *(P0)*

  | State | Condition | Meaning |
  |---|---|---|
  | `in-sync` | consumer bytes == plugin bytes | nothing to do |
  | `stale` | differ; consumer hash == this row's `consumerHash` in the sync manifest | consumer is behind; safe to sync |
  | `local-edit` | differ; consumer hash != this row's `consumerHash` in the sync manifest | consumer was edited after sync; syncing destroys work |
  | `unverified` | differ; no sync-manifest entry for this row | never synced by this tool; direction unknown |
  | `missing` | `consumerPath` absent **and its parent directory readable** | consumer has no copy |
  | `unknown` | this row's `pluginPath` is missing/unreadable, this row's `consumerPath` is present but unreadable (or its parent directory is unreadable, so absence cannot be established), or no hash tool (AC-1.2) | nothing was verified for this row |

  Six states, one per manifest row. `not-managed` (AC-0.6) is deliberately **not** in this table:
  it is a property of files that have no manifest row, is report-only, and is never a row state.

  **`missing` is narrowed deliberately (SE v6 F-03, TE v6 F-05).** `missing` is the one non-`unknown`
  state that sync *copies over*, with no backup (AC-3.1, AC-3.4). If it also absorbed
  "present but unreadable", a consumer file that exists — possibly a real local edit behind a
  permission bit, a dangling symlink, an unreadable mount — would be silently overwritten and
  unrecoverable. Absence must therefore be *established*, not merely inferred from a failed read,
  which is why the readable-parent clause is part of the condition rather than an implementation
  note.

  `stale` and `local-edit` are discriminated by the single comparison
  `sha1(consumerPath bytes) == syncManifest[id].consumerHash`. `pluginHash` (AC-1.6) is recorded
  for reporting and for detecting a re-published plugin; it is never the discriminator. The two are
  equal only immediately after a sync.

- **AC-1.2** — Who: the operator. Given `baselineStatus` is `resolved` (AC-1.0) but an individual
  row cannot be evaluated — **the row's `pluginPath` does not exist / is unreadable inside an
  otherwise-resolvable plugin root**, **the row's `consumerPath` is present but unreadable, or its
  parent directory is unreadable so its absence cannot be established**, or no content-hash utility
  is available — When the check runs,
  Then that row is `unknown` and carries a machine-readable `reason` from this closed set:
  `plugin-artifact-missing`, `consumer-artifact-unreadable`, `hash-tool-absent`. It is
  never reported `in-sync` — absence of evidence is not evidence of sync.

  **`consumer-artifact-unreadable` mirrors the plugin side, and it is not cosmetic (SE v6 F-03).**
  v6 covered unreadability on the plugin side only ("does not exist / is unreadable") while
  AC-1.1's `missing` was defined as bare absence, so a present-but-unreadable consumer artifact had
  either no state at all — violating AC-1.8(i)'s "no undefined fall-through" — or was classified
  `missing`, the one state AC-3.1 copies over without a backup. The closed reason set could not
  express the correct answer, so it gains the member rather than widening an existing one. A row
  with this reason is `unknown`: not copied (AC-3.1), exit `3` (AC-3.3), queue `blocked` (AC-4.1),
  remediation "fix the permissions on `consumerPath`" (AC-2.5, AC-4.2).

  **Row reasons and manifest reasons are disjoint sets.** The six conditions v5 listed here as row
  reasons — plugin root unset/unreadable, repo root unresolved, manifest absent/malformed, JSON tool
  absent — are *manifest-level* and live in AC-1.0's `baselineStatus.reason`, because each of them
  is what prevents rows from existing at all and none of them is assignable to a row (TE v5 F-01).
  A row `reason` is only ever one of the three above. The
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
- **AC-1.6** — Who: `sync-workflows.sh` — **the only writer of *managed artifacts* into
  `.claude/workflows/`, in every repo including the maintainer's** (AC-6.1). The qualifier is
  load-bearing: the SessionStart hook also writes into that directory (the drift state file,
  AC-2.6) and sync writes `.pdlc-backups/` (AC-3.4), so an unqualified "only writer of
  `.claude/workflows/`" contradicts AC-2.6 and would make a conforming implementation fail a test
  written against the literal claim (SE v5 F-02). Given a managed
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
- **AC-1.8** — Who: the test author. Given the classifier, whose domain is **one manifest row of a
  manifest whose `baselineStatus` is already `resolved`** (AC-1.0 — the classifier is never invoked
  otherwise, which is why "baseline resolvable" is no longer an axis) and
  whose codomain is the **six** states of AC-1.1, Then it satisfies, as requirements and not as
  test detail:
  - **(i) totality** — every combination of the axes {hash tool present/absent} ×
    {`pluginPath`: **absent / present-unreadable / present-readable**} ×
    {`consumerPath`: **absent / present-unreadable / present-readable**} × {bytes equal /
    unequal} × {sync-manifest entry: absent / `consumerHash` matches / `consumerHash` differs}
    maps to exactly one of the six states, with no undefined fall-through. Combinations that cannot
    co-occur (e.g. "equal" with one side absent) are enumerated and mapped explicitly, not left
    implicit.

    **Both presence axes are three-valued deliberately (SE v6 F-03, TE v6 F-05.)** v6 wrote them as
    two-valued `present/absent` while AC-1.2's condition already read "does not exist **/ is
    unreadable**". A property test generating over a two-valued axis satisfies totality without ever
    generating the unreadable case — so the half of `plugin-artifact-missing` that is *unreadable*,
    and the whole of `consumer-artifact-unreadable`, would never be exercised. The `absent` value of
    the `consumerPath` axis additionally presupposes a **readable parent directory** (AC-1.1); an
    unreadable parent is generated as `present-unreadable`, because absence cannot be established
    through it.
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
- **AC-2.2** — Who: the operator. Given **`baselineStatus` is `resolved` (AC-1.0)**, **the managed
  row set is non-empty**, every managed row is `in-sync`, no retired path is present (AC-3.9,
  AC-2.8), and any `not-managed` files are ignored, When the session starts, Then
  the hook emits nothing. Silence means a resolved baseline declaring at least one row, every one of
  them verified in-sync, **and no retired artifact remaining** — it never means "some rows could not
  be checked" and it can never mean "there were no rows" (AC-1.0; TE v5 F-01). The warning ACs below
  are exhaustive over the conditions that break silence: AC-2.1 (`stale`/`missing`), AC-2.3
  (`local-edit`), AC-2.5 (`unknown`/`unverified`), AC-2.5a (`baselineStatus` `unresolved`, which
  includes the empty managed set), AC-2.8 (retired path present). There is no
  silent non-silent state. *(P0)*
- **AC-2.3** — Who: the operator. Given state `local-edit`, When the warning is emitted, Then it
  is textually distinct from `stale` and explicitly does **not** recommend the plain sync command,
  because syncing would discard the local edit; it names `--force` and the backup location instead.
  *(P0)*
- **AC-2.4** — Who: the operator. Given the hook fails for any reason (missing manifest, unreadable
  plugin root, malformed JSON, hashing tool absent), When the session starts, Then the hook exits
  `0` with the failure written to stderr **and** to the drift state file (AC-2.6) — as
  `baselineStatus: "unresolved"` with `baselineReason` when the failure is manifest-level (AC-1.0),
  or as `unknown` rows with their row `reason` when it is per-row (AC-1.2). It exits `0` **while
  still warning** (AC-2.5a): exiting 0 is about not blocking the session, never about staying quiet.
  A broken drift check must never block a session from starting. *(P0)*
- **AC-2.5** — Who: the operator. Given state `unknown` or `unverified` on any managed row, When
  the session starts, Then the hook **warns** — it is never silent — the message carries the
  resolution-failure reason (`unknown`) or the "no sync provenance" reason (`unverified`), and each
  is distinguishable in the output from `stale`, from `local-edit`, and from each other. All three
  members of AC-1.2's closed reason set are distinguishable in the output — including
  `consumer-artifact-unreadable`, whose remediation is a permissions fix and **not** a sync. This is
  what makes AC-1.2 operative rather than decorative. *(P0)*
- **AC-2.5a — Unresolved baseline warns, without any row.** Who: the operator. Given
  `baselineStatus` is `unresolved` (AC-1.0) — including `manifest-empty` — When the session starts,
  Then the hook **warns**, the message carries the manifest-level `reason` verbatim, and it is
  textually distinct from every row-level message (AC-2.1, AC-2.3, AC-2.5) and from AC-2.8's. The
  warning names the remediation that can actually fix the reason: **plugin update** for
  `manifest-absent` / `manifest-malformed` / `manifest-empty` (AC-0.3b), the environment fix for
  `plugin-root-unset` / `plugin-root-unreadable` / `repo-root-unresolved`, and installing a Python
  interpreter for `json-tool-absent` (§4). The hook still exits `0` (AC-2.4). This AC is the hook's
  half of AC-1.0: without it, the manifest-absent state — universal at rollout — reaches the
  operator as silence, because every row-quantified warning has no rows to quantify over. *(P0)*
- **AC-2.6** — Who: **the shared drift-state writer routine** (AC-2.7) — i.e. the SessionStart hook
  or `sync-workflows.sh`; never `orchestrate-queue`, which only ever reads this file (AC-4.1).
  Given **any** drift computation completes — the
  SessionStart hook, `sync-workflows.sh --check`, or a `sync-workflows.sh` run that copied files —
  When it exits, Then it has written the full per-row result to
  `.claude/workflows/.pdlc-drift-state.json` as:

  ```
  { schemaVersion: 1,
    generatedAtUtc,               // ISO-8601 Z; reporting only, never a queue input
    generatedBy,                  // "hook" | "check" | "sync"
    baselineStatus,               // "resolved" | "unresolved"   (AC-1.0) — evaluated before rows
    baselineReason,               // null when resolved; else one of AC-1.0's closed reason set
    pluginVersion,                // context only (AC-5.4)
    checkEnabled,                 // resolved by the writer from .claude/pdlc.config.json (AC-4.3)
    retiredPresent,               // array of { path, supersededBy, supersedingState } — the
                                  //   consumer-relative retired paths found present, each carrying
                                  //   the `id` of the row R whose `retires` contains it and R's
                                  //   state, because AC-2.8/AC-4.2's remediation is conditioned on
                                  //   that state (TE v6 F-02). Emptiness is still the signal
                                  //   AC-4.1 row 7 tests.
    rows: [ { id, state, reason, pluginHash, consumerHash,
              pluginArtifactVersion, consumerArtifactVersion } ] }
  ```

  When `baselineStatus` is `unresolved`, **`rows` is `[]` and `retiredPresent` is `[]` meaning *not
  evaluated*** (AC-0.3b) — `baselineStatus` is what carries the meaning, and no reader may infer
  "nothing is stale" or "nothing is retired" from the empty arrays (TE v5 F-01, F-04). When it is
  `resolved`, `rows` contains exactly one entry per manifest row and nothing else (no `not-managed`
  entries — AC-0.6, no retired paths — AC-0.7), and `retiredPresent` is the subset of the manifest's
  `retired` union (AC-0.7) that exists in the consumer — one entry per such path, carrying
`supersededBy` and `supersedingState` — with `[]` meaning genuinely none present.
  Retired paths are carried in the **separate top-level
  `retiredPresent` array**, because a retired path is not a manifest row and forcing it into `rows`
  would break AC-2.6's one-entry-per-row invariant and AC-1.8's codomain. Both arrays are
  written by the same routine in the same atomic write, and are never absent, so a reader never has
  to distinguish "empty" from "this writer predates the field". This file is the queue's only input
  (AC-4.1) and is what keeps classification out of the workflow runtime. *(P0)*
- **AC-2.7 — Single writer contract.** Who: the operator remediating mid-session. Given
  `.claude/workflows/.pdlc-drift-state.json`, Then there is exactly **one** writer routine, shared
  by the hook and `sync-workflows.sh`, and it is invoked at the end of **every** drift computation
  in either surface. The write is whole-file and atomic (write to a sibling temp file in the same
  directory, then `mv`), so a reader never observes a partial file and there is no merge rule to
  specify: last complete write wins. Consequently, after `sync-workflows.sh` copies a stale row,
  the drift state on disk reflects the post-sync truth **within the same session**, and the queue
  (AC-4.1) stops blocking without a session restart. Without this AC the operator's remediation
  loop is closed only by restarting the session, which is the defect v3 SE F-05 / TE F-18 filed.

  **The writer list is exhaustive and `build-runtime.mjs` is not on it.** The maintainer's
  remediation loop is "queue blocks on a `stale` row → rebuild → **run `sync-workflows.sh`** → the
  queue unblocks", and the sync run is what refreshes this file. Because the builder never writes
  `.claude/workflows/` at all (AC-6.1, §0 fact 13), it cannot leave the drift state describing a
  filesystem that has since changed underneath it. Any future change that gives a third process
  write access to **the drift state file** must add it to this list in the same commit. The forward
  rule is scoped to that file deliberately: `.claude/workflows/` as a *directory* already has more
  than two writers by design — sync writes managed artifacts (AC-1.6) and `.pdlc-backups/`
  (AC-3.4), the hook writes the drift state — so a rule counting writers of the directory would be
  miscounted from the start, and an implementer reading it as "the hook must not write under
  `.claude/workflows/`" would break AC-2.6 (SE v5 F-02). *(P0)*
- **AC-2.8 — Retired artifact present.** Who: the operator on a consumer that **has updated the
  plugin to a manifest-shipping release but has not yet synced** — retirement is manifest-derived,
  so it is not evaluated at all while `baselineStatus` is `unresolved` (AC-1.0, AC-0.3b), and v5's
  "a consumer that predates this feature" named a population for which this warning can never fire
  (TE v5 F-04). Given `baselineStatus` is `resolved` and at least one path in the manifest's
  `retired` union (AC-0.7) exists in the
  consumer, When the session starts, Then the hook **warns**, and the warning: (i) carries the
  reason token `retired-present` — a *hook-message* token, deliberately **not** a member of
  AC-1.2's closed `reason` set nor of AC-1.0's, since neither a manifest row nor the baseline is
  involved; (ii) is textually distinct from the `stale`, `local-edit`,
  `unknown` and `unverified` messages; (iii) names each retired path individually **together with
  the `id` and state of the row R that supersedes it**; and (iv) names, **per path, the remediation
  conditioned on R's state** per the table below.

  **The remediation must be conditioned on R, because a plain sync provably cannot clear every case
  (TE v6 F-02).** AC-3.9's guard removes `p ∈ R.retires` **iff** R's post-copy state is `in-sync`.
  So for R in `local-edit` — the operator edited the consumer bundle — a plain `sync-workflows.sh`
  re-runs the same guard, retires nothing, reports `retire-skipped` again, and AC-4.1 row 7 blocks
  the queue again: a non-converging loop whose named remedy cannot clear it. v6 named the plain
  command unconditionally here and in AC-4.2, which also left a test author writing the AC-4.2
  golden output for the `retire-skipped` + `local-edit` fixture with two mutually exclusive correct
  answers.

  | R's state | Remediation named for `p ∈ R.retires` |
  |---|---|
  | `stale`, `missing` | `sync-workflows.sh` (no flags) — the copy makes R `in-sync`, the guard then passes |
  | `local-edit`, `unverified` | `sync-workflows.sh --force`, **naming the backup path** `.claude/workflows/.pdlc-backups/{id}.{stamp}.bak` (AC-3.4) and stating that the local edit is preserved there and restorable (AC-3.5). This is the only sanctioned automatic escape; a manual delete of `p` is *not* recommended, because it leaves R still diverged |
  | `unknown` (any reason), or `baselineStatus` `unresolved` | **plugin update** (AC-0.3b) for `plugin-artifact-missing` / manifest reasons; the environment fix for `hash-tool-absent` / `consumer-artifact-unreadable`. Sync cannot help, and must not be named |
  | `in-sync` | not reachable — the guard passed, so `p` was retired and is not present |

  This holds independently of the managed rows' states — a consumer whose
  every managed row is `in-sync` but which still holds `.claude/workflows/orchestrate-dev.js` is
  warned, because §0 fact 8 makes that the exact configuration in which the runtime may execute the
  stale artifact. Without this AC, AC-2.2's silence precondition would be observable only as the
  absence of an assertion and the natural implementation — an `else` branch emitting nothing —
  would satisfy every warning AC while violating AC-2.2 (TE v4 F-03). *(P0)*

### REQ-DIST-03 — Sync action

**Delivery vehicle.** Sync is a bash script (NFR-5) shipped in the plugin at
**`<pluginRoot>/hooks/scripts/sync-workflows.sh`** — the *same* `<pluginRoot>` binding as every
other path in this feature (AC-0.1, AC-0.3, AC-0.3a). It expands to
`${CLAUDE_PLUGIN_ROOT}/hooks/scripts/sync-workflows.sh` in a consuming repo and to
**`<repoRoot>/pdlc/hooks/scripts/sync-workflows.sh`** in the maintainer repo, i.e.
`pdlc/hooks/scripts/sync-workflows.sh` from the repo root — which is what makes the script runnable
in a fresh clone with no plugin installed (AC-6.5). v5 pinned the invocation to
`${CLAUDE_PLUGIN_ROOT}` while AC-0.4 stated that variable is not consulted in the maintainer repo,
leaving "the exact remediation command" with no expansion in the repo that develops the feature
(SE v5 F-01). It is invoked directly by the operator. It is
**not** an LLM prompt: every `/pdlc:*` surface today is a `SKILL.md`, and an LLM-driven file copy
is neither deterministic (NFR-1) nor auditable. A thin `skills/sync-workflows/SKILL.md` may exist
as a discoverability affordance, but its only permitted action is to run that script verbatim and
relay its output; it makes no classification or copy decisions of its own.

- **AC-3.1** — Who: the operator. Given `sync-workflows.sh` with no flags **and `baselineStatus`
  `resolved`** (AC-1.0 — when it is `unresolved` sync copies nothing, retires nothing, prints the
  manifest-level reason and its remediation, and still rewrites the drift state file), When it runs,
  Then every
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
  | **`baselineStatus` is `unresolved` (AC-1.0), for any reason including `manifest-empty`** | **3** |
  | any row `unknown` | 3 |
  | any row `local-edit` or `unverified` | 2 |
  | any row `stale` or `missing`, or any retired path present (AC-3.9) | 1 |
  | `baselineStatus` `resolved`, the row set is non-empty, all rows `in-sync`, no retired path present (`not-managed` files present or not) | 0 |

  Exit `0` therefore asserts "the baseline resolved, it declared at least one managed row, and every
  one of them was compared against it and matched" — the automated form can never go green having
  verified nothing, which is AC-1.0 enforced at the exit code. Row 1 exists because rows 2–4 are all
  existential over `rows` and row 5 was universal over it: with no manifest, `rows` is `[]`, rows 2–4
  are unsatisfied and row 5 vacuously true, so v5's table returned `0` in precisely the state
  AC-0.3b says every consumer is in at rollout (TE v5 F-01).

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
  name does not match `{id}.{stamp}[-N].bak` for an `id` **in the manifest's `id` set**. That set is
  defined as the union of the managed rows' `id` values **and the basenames of the manifest's
  `retired` array** (AC-0.7), so retirement backups (AC-3.9) are inside the retention rule rather
  than accumulating unprunably outside it, and the newest-5-per-`id` invariant a property test
  asserts over `.pdlc-backups/` holds over every file the tool ever writes there.

  **Parsing a backup filename when the `id` contains dots.** At v1 that set is
  `{ orchestrate-dev, orchestrate-queue, orchestrate-dev.js, orchestrate-queue.js }` (AC-0.1's row
  `id`s plus AC-0.7's retired basenames), so `orchestrate-dev` is a proper prefix of
  `orchestrate-dev.js` and a naive split on the first `.` misattributes every retirement backup
  (TE v5 F-08). The rule is: match the **POSIX ERE**

  ```
  ^(.+)\.([0-9]{8}T[0-9]{6}Z)(-([0-9]+))?\.bak$
  ```

  with a **greedy** first group — the fixed-width stamp is what anchors the split, so the `id` may
  contain any number of dots — taking `id` from `BASH_REMATCH[1]` and the stamp from
  `BASH_REMATCH[2]`, and then require the captured `id` to be a member of the set. A filename whose
  captured `id` is not a member, or which does not match at all, is never touched. Retention is
  grouped by the captured `id`, so `orchestrate-dev` and `orchestrate-dev.js` keep five backups
  each, independently; AC-0.1's basename-uniqueness rule is what makes that grouping key
  well-defined across the whole manifest (TE v6 F-06).

  **Positional groups, not named ones (SE v6 F-05).** v6 pinned
  `^(?<id>.+)\.(?<stamp>…)(-(?<n>…))?\.bak$`. `(?<name>…)` is PCRE/JS syntax; NFR-5 mandates bash
  with `[[ =~ ]]`, `grep -E` and `sed -E`, all of which are POSIX ERE with positional groups only,
  and `grep -P` is unavailable on the BSD grep this feature is measured on. The semantics were
  right and are unchanged — only the notation was unimplementable in the shell the REQ requires.

  The backup directory is created if absent. A recorded hash is **not** an acceptable substitute — a digest is
  one-way and cannot restore content. *(P0)*
- **AC-3.5** — Who: the operator. Given `--force` overwrote a `local-edit` or `unverified` row,
  When the newest backup for that `id` is restored to `consumerPath`, Then the file is
  byte-identical to its pre-sync content. Restore is the only oracle for AC-3.4 that cannot be
  false-greened. *(P0)*
- **AC-3.6** — Who: the operator. Given a sync completes, When `--check` is run immediately after
  with no intervening edit, Then every row the sync copied reports `in-sync`, and every row the
  sync skipped reports the same state it held before the sync. *(P0)*
- **AC-3.7** — Who: the operator. Given a sync completes, When sync is run a second time with the
  same flags and **no intervening change to `.claude/workflows/` from any source**, Then it copies
  nothing, writes no new backup, leaves the sync manifest byte-identical, and exits `0`. Sync is
  idempotent.

  **Version-control caveat (AC-3.9).** "No intervening change" includes version-control operations:
  a `git checkout`, branch switch or `git stash pop` that **resurrects a retired, still-tracked
  file** is an intervening change, and the next sync will correctly retire it again, writing a
  second backup. That is the specified behaviour, not a violation of idempotence — but it means the
  idempotence test must run with the retired paths untracked, which AC-3.9's landing step
  guarantees for this repo. A test that asserts AC-3.7 while `git ls-files` still returns the
  retired paths is asserting a property of the git index, not of sync. *(P0)*
- **AC-3.8** — Who: the operator on a fresh consumer. Given the consumer repo has no
  `.claude/workflows/` directory at all, When `--check` runs, Then every managed row is `missing`
  (this is not a distinct state) and exit is `1`; When sync runs, Then the directory is created —
  **under the repo root resolved by AC-0.5, which is never `$HOME`** — and every row is copied.
  *(P0)*
- **AC-3.9 — Legacy artifact retirement.** Who: the operator on a consumer holding a superseded
  artifact. Given `baselineStatus` is `resolved` (AC-1.0 — retirement is manifest-derived and is
  **not evaluated at all** when the baseline is unresolved) and a path in some row R's `retires`
  array (AC-0.1, AC-0.7) exists in the consumer, When `sync-workflows.sh` runs (not `--check`),
  Then the retirement of that path is gated on **row R specifically**:

  > **Guard.** After the copy loop completes, a path `p ∈ R.retires` may be removed **if and only
  > if row R's post-copy state is `in-sync`.** If R is in any other state — including `local-edit`,
  > `unverified` and every `unknown`, the three classes AC-3.1 skips — `p` is left in place and the
  > run reports `retire-skipped` for `p` naming R's state.

  When the guard passes, the retired file's content is backed up under AC-3.4's rules with
  `id` = the retired basename, and the file is then deleted. `--check`
  reports retired paths present as `retired-present` in the human-facing report and contributes
  exit code `1` (same class as `stale`: a real, sync-fixable divergence). Retirement is reported
  per path, is idempotent (a second run finds nothing to retire and writes no backup, satisfying
  AC-3.7), and never runs before its replacement is in place — the failure mode to avoid is
  deleting the loadable artifact and leaving nothing.

  **Why the guard is per-row (TE v5 F-02).** v5 said "only after the managed row that supersedes it
  has been written or confirmed `in-sync`" over a *flat* `retired` array, which named a relation the
  schema could not express: no fixture could state which row supersedes which path, so the guard was
  unfalsifiable and the natural implementation — "delete all retired paths once the copy loop
  finishes" — was green on every authorised test while deleting the last loadable artifact whenever
  the corresponding copy was skipped. `retires` supplies the missing key, and the mandated falsifying
  test is: *`R.pluginPath` absent ⇒ R is `unknown`/`plugin-artifact-missing` ⇒ sync runs ⇒
  `R.retires` paths still exist and `retire-skipped` was reported.* Rationale: §0 facts 7–8; `.claude/workflows/`
  currently holds both `orchestrate-dev.js` and `orchestrate-dev.bundle.js`, both declaring
  `meta.name: "orchestrate-dev"`, and leaving the stale one in place is precisely the bug this
  feature exists to eliminate.

  **Version control.** `git ls-files .claude/` returns all four paths today (§0), so a naive delete
  leaves a dirty tree that any branch switch undoes. Two rules, and they are different in kind:

  1. **In this repo, once: a maintainer step, not a script step.** Landing this feature includes a
     commit that `git rm`s `.claude/workflows/orchestrate-{dev,queue}.js` and
     `.claude/workflows/orchestrate-{dev,queue}.bundle.js`, and adds `.claude/workflows/` (except
     `.gitignore`-worthy exclusions) to `.gitignore` — the bundles are no longer a tracked
     generated tree (AC-6.1 makes `pdlc/workflows/dist/` the tracked one) and the legacy `.js`
     copies are gone for good. This is in scope (§6) and is what makes AC-2.2's silence, AC-3.3's
     exit 0 and AC-3.7's idempotence stably reachable here.
  2. **In any consumer, always: sync reports, it does not commit.** `sync-workflows.sh` never runs
     a VCS command. When it retires a path that is tracked in the consumer's VCS (detected by a
     best-effort `git ls-files --error-unmatch`, treated as "untracked" if git is unavailable), it
     performs the backup and delete as specified and **additionally prints a one-line manual
     action** naming the path and telling the operator to commit the removal, because otherwise
     the next checkout resurrects it (AC-3.7's caveat). Detection failure never blocks retirement.
  *(P0)*

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
  | the read returns absent, or the content is unparseable JSON, or `schemaVersion` != 1, **or `baselineStatus` is absent** | `blocked` |
  | `checkEnabled` is `false` | proceed, skip noted in the report (AC-4.3) |
  | **`baselineStatus` is `unresolved`** (AC-1.0), for any reason including `manifest-empty` | `blocked`, naming `baselineReason` |
  | any row `unknown` | `blocked` |
  | any row `missing` | `blocked` |
  | any row `stale` | `blocked` |
  | `retiredPresent` is a non-empty array | `blocked` |
  | any row `local-edit` or `unverified` | proceed, with the rows named in the run report |
  | **`baselineStatus` `resolved`, `rows` non-empty**, all rows `in-sync`, `retiredPresent` `[]` | proceed silently |

  Row 3 (`baselineStatus` `unresolved`) sits immediately **below** `checkEnabled` so that AC-0.3b's
  interim escape still works, and **above** every row-quantified condition so that the
  manifest-absent state — universal at rollout — cannot fall through to the last row. With
  `rows: []`, every existential row is unsatisfied and the final universal row is true of nothing,
  so v5's table proceeded silently on a pipeline where nothing had been verified (TE v5 F-01).

  `local-edit` and `unverified` proceed because they represent a deliberate or unknown operator
  divergence that blocking would strand; `unknown` blocks because AC-1.2's rule applies at the
  queue seam too, and an `unresolved` baseline blocks because AC-1.0's does.

  **Why `retiredPresent` blocks, and why it is a top-level field rather than a row.** A retired
  path present beside a fresh bundle is the one configuration in which §0 fact 8 says the runtime
  may execute the **stale** artifact — and until BL-05 is answered we do not know that it does not.
  A queue that reported all-clear in that configuration would reintroduce, one layer up, the exact
  false green this feature exists to prevent (TE v4 F-05). It blocks in the same class as `stale`
  because it is sync-fixable by the same command (AC-3.9), matching `--check`'s exit `1` (AC-3.3).
  It cannot be a row in `rows`: AC-2.6 fixes `rows` at exactly one entry per manifest row, and a
  retired path is expressly not a manifest row (AC-0.7) — so the fact travels in its own field,
  which the queue reads from the same single file it already reads (no second read, NFR-1 intact).

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
  operator's next turn is one command rather than an investigation. When the block came from
  `baselineStatus`, it names `baselineReason` instead of rows, since there are none. The remediation
  named must actually be able to fix the reason: for `manifest-absent`, `manifest-malformed`,
  `manifest-empty` and `plugin-artifact-missing` it is a **plugin update**, not `sync-workflows.sh`
  (AC-0.3b); for `plugin-root-unset`/`-unreadable`, `repo-root-unresolved`, `json-tool-absent`,
  `hash-tool-absent` and `consumer-artifact-unreadable` it
  is the corresponding environment or permissions fix (§4, AC-1.2); for `stale`/`missing` it is
  `sync-workflows.sh`; and **for a non-empty `retiredPresent` it is whatever AC-2.8's per-path table
  names for the state of the row R that supersedes each path** — plain sync only when R is
  `stale`/`missing`, `--force` with the backup path named when R is `local-edit`/`unverified`,
  plugin update or an environment fix when R is `unknown`. v6 named the plain command
  unconditionally, which for an R in `local-edit` names a command that re-runs AC-3.9's guard,
  retires nothing and blocks the queue again (TE v6 F-02); the report must therefore carry R's
  `id` and state alongside each retired path, so the conditioning is visible in the output a golden
  test asserts. Every
  printed command is the `<pluginRoot>`-expanded path of AC-0.4, so it is runnable as printed in the
  repo the operator is standing in. *(P0)*
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
  builder also emits `pdlc/workflows/dist/distribution-manifest.json` (the sole manifest location —
  AC-0.1) containing, for each row,
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
  Absence of a stamp is never an error.

  **Both version lines are labelled "not a drift signal".** `artifactVersion` is the plugin version
  at build time, and AC-6.3 requires bundles to be rebuilt on every source change while the plugin
  version bumps only at release — so many distinct bundle contents legitimately share one
  `artifactVersion`, and a report showing `plugin 0.10.0 / consumer 0.10.0` beside a hash mismatch
  is correct, not contradictory. The report must therefore label the `artifactVersion` line the way
  AC-5.4 already labels `pluginVersion`, and print the two `sha1` values (AC-2.6 `pluginHash` /
  `consumerHash`) as the discriminating evidence.

  **Both version lines are required in the report, not optional.** v5 permitted an implementer to
  drop `artifactVersion`; that made every report oracle conditional — a golden-output test asserting
  the line fails on a conforming implementation that omitted it, and a test not asserting it cannot
  catch an accidental regression that drops it (TE v5 F-10). The report is a human-facing surface
  with golden-output tests, so the field is **present, labelled, and asserted**. *(P1)*
- **AC-5.4** — Who: the operator. Given the plugin's `plugin.json` version, When the report is
  produced, Then it is included as **context only**, explicitly labelled as not a drift signal:
  cached `0.9.0` and `0.10.0` ship byte-identical workflow files (§0 fact 5), so plugin version
  demonstrably does not identify workflow content. *(P2)*

### REQ-DIST-06 — Publish the executable artifact in the plugin package

This is the requirement US-04 traces to, and the precondition for every copy AC above: today there
is nothing in the plugin package to copy (§0 fact 3).

- **AC-6.1 — One canonical build output.** Who: the maintainer. Given
  `node pdlc/workflows/build-runtime.mjs`, When it runs, Then it writes
  **`pdlc/workflows/dist/` and nothing else**: it emits `dist/*.bundle.js` and
  `dist/distribution-manifest.json` there, both tracked and committed, and it writes **no** file
  under `.claude/workflows/` — no bundle, no sync-manifest entry, no drift state. Mechanically this
  is a retarget of the single `OUT_DIR` constant at `build-runtime.mjs:29`, whose only content write
  is at `:184` inside the `:172-186` loop (§0 fact 13), not the
  addition of a second output target. `build-runtime.mjs --check` compares `dist/` only.

  **`.claude/workflows/` is populated by `sync-workflows.sh`, in this repo exactly as in any other
  consumer.** The maintainer's loop is **build → sync**, two commands, and the second one is the
  same script every consumer runs, invoked at `<pluginRoot>/hooks/scripts/sync-workflows.sh` =
  `pdlc/hooks/scripts/sync-workflows.sh` here (REQ-DIST-03 preamble, AC-6.5), with AC-0.3a
  substituting `<pluginRoot>` so it finds `dist/` locally.
  Consequences, all of which were ambiguous in v4 (SE v4 F-04, F-05): there is exactly one writer
  of **managed artifacts** into `.claude/workflows/` (AC-1.6 — the hook and the backup writer also
  write into that directory, which is why the qualifier is not optional), exactly two writers of the
  drift state file (AC-2.7), and the
  maintainer-repo remediation loop closes in-session because the sync run that fixes the drift is
  the same run that rewrites the drift state. `.claude/workflows/*.bundle.js` cease to be a second
  *tracked* generated tree — they are gitignored, untracked consumer copies after AC-3.9's landing
  step. One generated tree is authoritative (`dist/`), one is a consumer copy, and no process
  writes both. *(P0)*
- **AC-6.2 — Packaging oracle, executable before release.** Who: the `pdlc/workflows` jest suite.
  Given the set of files that would be packaged for the plugin (`.claude-plugin/marketplace.json`
  declares `source: ./pdlc`, so: everything under `pdlc/` minus the repo's ignore rules), When
  `npm test` runs on any commit, Then a test asserts that (a) every `pluginPath` in
  `dist/distribution-manifest.json` resolves to a file inside that packaged set, (b) each such
  file's `sha1`, **recomputed from the bytes on disk**, equals that row's `pluginSha1`, (c) the
  manifest's top-level `retired` array equals the union of the rows' `retires` (AC-0.2), and (d) the
  manifest
  itself is at `pdlc/workflows/dist/distribution-manifest.json` inside that set — the packaged
  path, joined as `workflows/dist/distribution-manifest.json` under `<pluginRoot>`, is what AC-0.1
  reads, so a path regression is caught here and not by a consumer.

  **AC-6.2 does not rebuild; freshness is AC-6.3's job.** v5's clause (b) — "byte-identical to the
  freshly built bundle" — is a self-comparison unless the test invokes the builder, because the file
  it reads *is* the build output; the most likely implementation was therefore a tautology
  (TE v5 F-07). This AC is now membership + hash-integrity + manifest-shape only. The
  source→bundle freshness relation is asserted exactly once, by `__tests__/runtimeBundle.test.js`
  under AC-6.3, and **no test in this feature runs the builder in a way that writes into
  `pdlc/workflows/dist/`** — the suite never mutates its own tracked inputs.

  **Build inputs in the package are tolerated, not asserted away.** No ignore rule under `pdlc/`
  other than `node_modules/` applies (the repo-root `.gitignore` also ignores `.tokensave/`,
  `.claude/settings.local.json` and `.claude/.headroom_wrap_marker.json`, none of which touch the
  `pdlc/` subtree, and AC-3.9's landing step adds a fourth root rule for `.claude/workflows/`; state
  the claim as "no rule under `pdlc/` other than `node_modules/`" so it does not drift — SE v5 F-08).
  So the packaged set today also contains `pdlc/workflows/__tests__/`,
  `package.json`, `package-lock.json`, `build-runtime.mjs` and `runtime-adapter.js`. That is
  accepted: shipping them is harmless (nothing reads them consumer-side) and AC-0.2 already bars
  them from being *copied into a consumer repo*, which is the property that matters. AC-6.2
  therefore asserts no converse of the form "no build input is packaged" — such an assertion would
  be a packaging-hygiene requirement this REQ does not make, and writing it would immediately go
  red on the current tree.

  This is the pre-release surrogate: the failure §0 fact 3 documents — the artifact being excluded
  from the package — is caught on **every commit**, not first observed by a consumer after
  publication. *(P0)*
- **AC-6.2a** — Who: a consumer. Given a plugin installed from the marketplace at version *V*, When
  `${CLAUDE_PLUGIN_ROOT}/workflows/dist/` is listed, Then it contains exactly the bundles named in
  the distribution manifest **plus the manifest itself** — AC-0.1/AC-5.1/AC-6.1 place
  `distribution-manifest.json` in that same directory, so v5's unqualified "exactly the bundles" was
  falsified by its own manifest location (SE v5 F-09). This is the post-install smoke check; it is verified by a manual
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
- **AC-6.4 — No *normative* document contradicts the manifest.** Who: the maintainer, and the
  `pdlc/workflows` jest suite. Given the migration from `.js` copies to `.bundle.js` copies and
  AC-6.1's move of the build output to `dist/`, When this feature lands, Then no file in the
  **covered set** states a workflow-distribution convention contradicting the shipped distribution
  manifest, and a test asserts it.

  **The oracle is one expression, with nothing hand-listed:**

  > `coveredViolations(root) := grep(root, PATTERNS) − { p : exempt(p) }`, and the assertion is
  > `coveredViolations(repoRoot) == ∅`.

  **`PATTERNS` — four literal, qualifier-free alternatives**, exactly as the test runs them:

  | # | Pattern (POSIX ERE) |
  |---|---|
  | 1 | `\.claude/workflows/orchestrate-dev\.js` |
  | 2 | `\.claude/workflows/orchestrate-queue\.js` |
  | 3 | `\.claude/workflows/\*\.js` |
  | 4 | `managed manually` |

  v5 wrote pattern 4 as "the phrase *managed manually* **in a distribution context**". No grep can
  evaluate "in a distribution context", so an implementer had to either drop it (silently changing
  what the test matches) or hand-curate the hits — the hand-maintained list that was wrong in v2,
  v3, v4 and v5. The qualifier is **deleted**: measured at `5630d58`, every hit it was meant to
  exclude (`docs/orchestrate-dev-workflow/TSPEC-*.md`, this feature's own documents) is already
  excluded by `exempt`, so it separated nothing (SE v5 F-03, TE v5 F-03). Patterns 3 and 4 are also
  the *only* way `docs/_queue/QUEUE.md` and `docs/design/MASTER-PLAN-engineering-loop.md` — the two
  most live normative surfaces — enter the set at all; v5's §0 fact 14 measured with pattern 1|2
  alone and therefore printed a table the cited command does not produce.

  **`exempt(p)` — a rule over paths, not a list.** The covered set is *everything else*, so the two
  provably partition the tree and no file can be in neither (TE v5 F-05):

  | Rule | Matches today | Why |
  |---|---|---|
  | `p` is under a **generated tree**: `.claude/workflows/**`, `pdlc/workflows/dist/**`, any `node_modules/**` | the 4 tracked `.claude/workflows/*` artifacts; `dist/` once AC-6.1 lands | Generated, not documentation. `dist/*.bundle.js` inlines the module headers this AC corrects, so on the first commit after the correction and before a rebuild it still contains the superseded string — a covered-set reading would go RED on a file no human writes (SE v5 F-04). |
  | `p` is under a **per-feature artifact directory**: any `docs/<dir>/` containing a `REQ-*.md` | `docs/orchestrate-dev-workflow/`, `docs/pdlc-workflow-distribution/` | A shipped feature's REQ/FSPEC/TSPEC/PLAN/PROPERTIES record what was true when it shipped; rewriting them falsifies history. This feature's own documents quote the superseded form in order to retire it. The rule is computable — `docs/design/`, `docs/_queue/`, `docs/_constraints/`, `docs/_decisions/` and `docs/*.md` contain no `REQ-*.md` and are therefore covered. |
  | `p` is a `distribution-manifest.json`, for its `retired`/`retires` values | none tracked yet | AC-0.7 **requires** those to contain the superseded paths. Subsumed by rule 1 today (manifests live under `dist/`), stated separately so a future manifest location does not silently go RED. |
  | `p` is under a **test tree**: any `**/__tests__/**` | nothing today (no `__tests__` file matches `PATTERNS` at `5630d58`) | Fixtures and golden-output data are **inputs to the oracle, not instructions to a reader**. This AC corrects documents that *tell* a maintainer the wrong convention; a fixture that states the superseded convention exists precisely so the checker can be shown going RED, and a golden output naming `.claude/workflows/orchestrate-dev.js` exists because AC-2.8 requires each retired path to be named individually. Without this rule the two mandatory assertions below contradict each other — see the note. |

  Files in neither set do not exist by construction: `README.md`, `pdlc/README.md`,
  `pdlc/hooks/scripts/*.sh`, `docs/_constraints/**` and future `docs/design/*.md` are all **covered**,
  which is the intended answer — adding `docs/design/MASTER-PLAN-v2.md` stating the superseded
  convention must go RED.

  **Why rule 4 exists (SE v6 F-01).** v6's exemption set had exactly three members and declared "the
  covered set is *everything else*", which put `pdlc/workflows/__tests__/**` in the **covered** set.
  That made the AC's own two mandatory assertions unsatisfiable together: the mandated RED fixture,
  once committed, is itself a covered violation, so `coveredViolations(repoRoot) == ∅` is
  permanently red. The same collision hits every AC-3.4 backup-filename fixture
  (`orchestrate-dev.js.…bak`), every AC-0.7 `retires` fixture not literally named
  `distribution-manifest.json` (rule 3 is keyed on the filename), and every AC-2.8 golden output.
  The implementer's only escape was to narrow `PATTERNS` or drop the real-root assertion — precisely
  the degradation this AC exists to prevent.

  **On pattern 4's breadth (TE v6 F-07).** Pattern 4 is the unqualified English phrase
  `managed manually`, and the exemption set is purely path-based, so a future *covered* document
  using that phrase in an unrelated sense (a runbook saying a secret is "managed manually") goes RED
  with no exemption available. **The sanctioned resolution is to rephrase the document; narrowing
  the pattern is never sanctioned.** The qualifier-free pattern is the whole point — every attempt
  to qualify it (v2–v5) produced a hand-curated list that was wrong. If the phrase genuinely needs
  to survive in a covered document, the change is to `PATTERNS` **and to this AC**, in one commit,
  with the measurement re-derived.

  **The checker is a pure function of a root directory** — `coveredViolations(root)` takes the root
  (or an explicit file list) and returns the violating paths; it never reads `process.cwd()` and
  never hardcodes repository paths. This is what gives the mandated falsifying case an injection
  seam, and exactly **one** additional
  assertion binds the function to the real repository root. Without the seam, exercising RED would
  require writing into tracked normative directories during `npm test` — polluting the working tree,
  racing parallel suites, and leaving the repo dirty on a throw — so the falsifying case would be
  dropped as unimplementable and the assertion would degrade to the one-directional grep this AC
  exists to prevent (TE v5 F-06). File discovery inside `root` is `git ls-files` when `root` is a
  git work tree and a directory walk otherwise, so a fixture tree needs no git.

  **Where the fixture tree lives — the REQ picks one (TE v6 F-01, SE v6 F-01).** The fixture root is
  a **non-git temporary tree created by the test under `os.tmpdir()` and removed by the test**,
  matching the house pattern already in `pdlc/workflows/__tests__/fixtures/tmpGitFixture.js`
  (`mkdtempSync(join(tmpdir(), …))`). It is **never inside the repository work tree**. This is
  load-bearing in both directions:

  - *It makes the discovery branch deterministic.* Inside the repo work tree, discovery is
    `git ls-files` — tracked files only — so a fixture written at test time is **untracked**,
    `coveredViolations` returns `∅`, and the "RED" case passes while proving nothing. That is the
    assertion-that-cannot-fail this AC was written to prevent, one level down (TE v4 F-04,
    v5 F-06). A temp tree is not a git work tree, so the directory-walk branch runs and the fixture
    is always discovered.
  - *It keeps the repo-root assertion satisfiable.* Nothing the RED case writes is ever a tracked
    file at a covered path, so `coveredViolations(repoRoot) == ∅` stays independent of the fixtures.

  Exemption rule 4 (`**/__tests__/**`) is the belt to this braces: it exists so that *other* test
  data which must legitimately quote the superseded string — AC-3.4 backup-filename fixtures,
  AC-0.7 `retires` fixtures, AC-2.8 golden outputs, all of which are naturally committed — cannot
  make the repo-root assertion red either. Both mechanisms ship; neither alone is sufficient.

  **Falsifying case (mandatory, two-directional):** in the temp fixture tree, a file at a covered
  path stating the superseded convention ⇒ **RED**; the identical text under each of the four exempt
  rules ⇒ **GREEN**. Both
  directions ship, or the implementer facing a red grep will narrow the pattern until it passes and
  the assertion will prove nothing (TE v4 F-04).

  Measured at `5630d58` (§0 fact 14), `coveredViolations(repoRoot)` is exactly five files —
  `docs/_queue/QUEUE.md`, `docs/design/MASTER-PLAN-engineering-loop.md`,
  `docs/PLAN-pdlc-integration-boundary-gates.md`, `pdlc/workflows/orchestrate-dev.js`,
  `pdlc/workflows/orchestrate-queue.js` — and correcting them is what makes the assertion green.
  `CLAUDE.md`, `pdlc/skills/orchestrate-dev/SKILL.md` and `pdlc/skills/orchestrate-queue/SKILL.md`
  already name `.bundle.js` and do **not** appear in the grep output; their `dist/` path update is an
  ordinary in-scope edit (§6), not part of this oracle. This measurement is a *measurement*: the test
  recomputes it, and §6's in-scope item is "whatever `coveredViolations` returns", never a file list.
  *(P1)*
- **AC-6.5 — Fresh-clone bootstrap.** Who: **the `pdlc/workflows` jest suite (`npm test`)** — the
  only automated verification surface that exists (§0 fact 10) — standing in for a maintainer on a
  clean clone of
  `yumo-plugins` with **no pdlc plugin installed and `${CLAUDE_PLUGIN_ROOT}` unset**. Given
  AC-3.9's landing step has untracked and gitignored `.claude/workflows/`, so a fresh clone contains
  no runtime-loadable artifact at all, When the maintainer runs

  ```
  node pdlc/workflows/build-runtime.mjs      # writes pdlc/workflows/dist/ only (AC-6.1)
  pdlc/hooks/scripts/sync-workflows.sh       # <pluginRoot>/hooks/scripts/…, AC-0.3a substitution
  ```

  Then `.claude/workflows/*.bundle.js` exist, every managed row is `in-sync`, `--check` exits `0`
  and the queue proceeds — with no published release, no installed plugin and no network. Both
  commands are documented in `CLAUDE.md` and `pdlc/README.md` as the bootstrap sequence (in scope,
  §6).

  **Surface, isolation and observables (TE v6 F-03).** v6 named "a maintainer (or a CI runner)" and
  no surface at all, while every sibling AC states one (AC-6.2/6.3: the jest suite; AC-6.2a:
  explicitly a manual release-checklist step until D-DIST-06) — so a test author could not tell
  whether to write a jest test or a checklist line, and D-DIST-06 means "a CI runner" names a
  surface this feature does not have. This AC is **automated in the jest suite**, and the three
  things that decide whether it is writable at all are specified here rather than left to the
  implementer:

  | Concern | Requirement |
  |---|---|
  | Isolation | The test **clones** the repository at `HEAD` (`git clone --local --no-hardlinks <repoRoot> <tmp>`, no network) into a directory under `os.tmpdir()`, and runs both commands with the clone as cwd. It never runs in place: `sync-workflows.sh` in place would write the developer's real `.claude/workflows/`. The clone is removed in teardown. |
  | Child environment | `CLAUDE_PLUGIN_ROOT` **unset** (this is the AC's Given, and AC-0.3a's maintainer marker `pdlc/workflows/build-runtime.mjs` is what must supply `<pluginRoot>` instead), and `HOME` pinned to a *separate* temp directory that is not an ancestor of the clone, so AC-0.5's `$HOME` rejection is exercised as a non-event rather than accidentally triggered. |
  | Observable for "the queue proceeds" | The queue is runtime-loaded and jest cannot invoke it, so the asserted proxy is **AC-4.1's mapping applied to the drift state file the sync run wrote** into the clone: `baselineStatus == "resolved"`, `rows` non-empty, every row `in-sync`, `retiredPresent == []`, `checkEnabled` true ⇒ AC-4.1's last row, *proceed silently*. The other two claims are asserted directly: `.claude/workflows/*.bundle.js` exist in the clone, and `sync-workflows.sh --check` exits `0`. |

  This AC exists because v5 composed three changes into a bootstrap hole: it untracked
  `.claude/workflows/`, forbade the builder from writing there, and pinned the only remaining writer
  to `${CLAUDE_PLUGIN_ROOT}` — which AC-0.4 says is not consulted in this repo. The repo that
  develops the pipeline could then neither run it nor print a runnable remediation command
  (SE v5 F-01, and v1 F-05's bootstrap paradox one layer down). The fix is the `<pluginRoot>`
  substitution already in AC-0.3a, applied to the script's own path. *(P0)*

## 4. Declared thresholds, flags and locations

Every configured value this REQ's ACs depend on, with default and owner. No AC may cite a value
absent from this table.

| Name | Location | Default | Owner | Notes |
|---|---|---|---|---|
| `distribution.checkEnabled` | `.claude/pdlc.config.json` (consumer repo; new file, absent ⇒ defaults) | `true` | consuming-repo operator | AC-4.3. Resolved by the shell writer, delivered to the queue via the drift state file. Gates the queue only, not the hook or `--check`. |
| distribution manifest | **`<pluginRoot>/workflows/dist/distribution-manifest.json`** — one path, three bindings of `<pluginRoot>`: consumer `${CLAUDE_PLUGIN_ROOT}`, maintainer `<repoRoot>/pdlc`, build output `pdlc/workflows/dist/…` | 2 managed rows + 2 `retired` paths (AC-0.2, AC-0.7); **absent on every pre-feature install** ⇒ AC-0.3b | pdlc maintainer, emitted by `build-runtime.mjs` | AC-0.1. Sole authority for the managed set. The `dist/` segment is part of the path everywhere. |
| sync manifest | `.claude/workflows/.pdlc-sync-manifest.json` (consumer) | absent ⇒ all rows `unverified` | written by `sync-workflows.sh` only — **never** by `build-runtime.mjs` (AC-6.1) | AC-1.6, AC-1.7. |
| drift state file | `.claude/workflows/.pdlc-drift-state.json` (consumer) | absent ⇒ queue `blocked` | **one shared writer routine**, invoked by the hook, by `--check`, and by sync (AC-2.7); whole-file atomic replace, last complete write wins | AC-2.6, AC-2.7, AC-4.1. |
| backup dir | `.claude/workflows/.pdlc-backups/` (consumer) | created on demand | sync script | AC-3.4, AC-3.9. |
| backup retention | same | newest **5** per `id`, selected by `LC_ALL=C` lexicographic descending filename sort | pdlc maintainer | AC-3.4. Never mtime-based. |
| backup stamp format | backup filename | `YYYYMMDDTHHMMSSZ`, collisions suffixed `-2`, `-3`, … | pdlc maintainer | AC-3.4. Fixed width so lexicographic order == chronological order. |
| `id` charset | manifest row | `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$` | pdlc maintainer | AC-0.1. Filename-safety for AC-3.4; violation ⇒ manifest malformed. |
| content-hash utility | `shasum` \| `sha1sum`, resolved by probing | first that runs | pdlc maintainer | Both absent ⇒ every row `unknown`, reason `hash-tool-absent` (AC-1.2) — a **row-level** reason, since rows exist whenever the baseline resolved. |
| row `reason` set | drift state file, `rows[].reason` | `null` for any state other than `unknown` | pdlc maintainer | AC-1.2. Closed set: `plugin-artifact-missing`, `consumer-artifact-unreadable`, `hash-tool-absent`. Disjoint from AC-1.0's manifest-level set by construction. |
| JSON read/write utility | Python interpreter, discovered by probing `python3`, `python`, `py` — **the identical loop already shipped in all three `pdlc/hooks/scripts/*.sh`**, reused verbatim, not reinvented | first candidate that executes `import sys` successfully | pdlc maintainer | Reads/writes all four JSON files and is what distinguishes *malformed* from *absent* (AC-2.4). None found ⇒ `baselineStatus` `unresolved`, reason `json-tool-absent` (a **manifest-level** reason — with no JSON reader there are no rows), hook warns (AC-2.5a) and still exits 0 (NFR-6). |
| sync script invocation path | **`<pluginRoot>/hooks/scripts/sync-workflows.sh`** — consumer `${CLAUDE_PLUGIN_ROOT}/hooks/scripts/sync-workflows.sh`, maintainer `pdlc/hooks/scripts/sync-workflows.sh` | — | pdlc maintainer | REQ-DIST-03 preamble, AC-0.4, AC-6.5. This is the expansion every "exact remediation command" prints; it is runnable with no plugin installed. |
| `baselineStatus` / `baselineReason` | top-level fields of the drift state file | `resolved` / `null` only when the manifest resolved and declares ≥1 row | the shared drift-state writer (AC-2.7) | AC-1.0. Reason set: `plugin-root-unset`, `plugin-root-unreadable`, `repo-root-unresolved`, `manifest-absent`, `manifest-malformed`, `json-tool-absent`, `manifest-empty`. Evaluated before any row quantifier at all three seams. |
| drift-check latency budget | NFR-2 fixture | p95 ≤ 500 ms | pdlc maintainer | Observation, not a gate — see NFR-2. |
| `<pluginRoot>` resolution | `${CLAUDE_PLUGIN_ROOT}` in a consuming repo; **`<repoRoot>/pdlc`** when `pdlc/workflows/build-runtime.mjs` is present (AC-0.3a) | set by the harness | Claude Code / pdlc maintainer | AC-0.3, AC-0.3a, AC-0.4. Unset with no maintainer marker ⇒ `unknown`, reason `plugin-root-unset`. Every `pluginPath` joins onto `<pluginRoot>` unchanged. |
| repo-root resolution | first `worktree` record of `git worktree list --porcelain` (the **main** worktree's *work tree*, so a linked worktree is not a distinct consumer), validated non-bare / readable / `rev-parse --show-toplevel`-confirming; only when `git` does not apply at all, a bounded upward `.claude/` walk | — | pdlc maintainer | AC-0.5. Inside a git repo, a failed derivation goes straight to `repo-root-unresolved` and never to the walk. `$HOME` and `/` are always rejected, reason `repo-root-unresolved` (manifest-level, AC-1.0). |
| `git` (third external tool) | `PATH` | **minimum version 2.7.0** (`git worktree list --porcelain`, released 2016); measured on the maintainer machine at `2.50.1` | pdlc maintainer | AC-0.5 step 1, AC-3.9 rule 2, AC-6.5's clone. **Absent from `PATH`** ⇒ AC-0.5 step 1 does not apply, the bounded walk runs (a non-git consumer cannot be misled by it) and AC-3.9's tracked-path detection treats every path as untracked. **Present but older than 2.7.0, or the repository is bare** ⇒ step 1 applies and fails ⇒ `baselineStatus` `unresolved`, reason `repo-root-unresolved` — never a silent demotion to the walk, because a wrong root is worse than a refusal. All three cases are required fixtures (TE v6 F-04). |
| retired-path key | each manifest row's `retires` array; top-level `retired` is their union | `orchestrate-dev` → `[".claude/workflows/orchestrate-dev.js"]`, `orchestrate-queue` → `[".claude/workflows/orchestrate-queue.js"]` | pdlc maintainer | AC-0.1, AC-0.7, AC-3.9. The per-row key is what makes the delete guard computable. |
| managed row `id` values (v1) | manifest rows | `orchestrate-dev`, `orchestrate-queue` | pdlc maintainer | AC-0.1. Backup filenames are parsed by the stamp-anchored regex in AC-3.4, so `orchestrate-dev` and the retired basename `orchestrate-dev.js` never collide. |
| plugin version (`pluginVersion`) | `<pluginRoot>/.claude-plugin/plugin.json`, key `version` — i.e. `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` for a consumer, `<repoRoot>/pdlc/.claude-plugin/plugin.json` under AC-0.3a | `0.10.0` at `3dab335` | pdlc maintainer | AC-2.6, AC-5.4. File or key absent/unreadable ⇒ renders as `unknown` in the report and as `null` in the drift state file; it is context only, so no state, exit code or queue outcome depends on it. |
| retired paths | each row's `retires` array; the manifest's top-level `retired` is their union | 2 paths (AC-0.7) | pdlc maintainer | AC-0.7, AC-2.8, AC-3.9. Present-in-consumer set is reported as `retiredPresent` in the drift state file (AC-2.6) and blocks the queue (AC-4.1). |

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
- **NFR-2 — Latency, observed not gated.** Against a fixture of up to 8 managed artifacts totalling
  up to 512 KB — a **deliberate headroom margin**, roughly 4× the real managed set, which AC-0.2
  fixes at exactly 2 rows (~212 KB measured); the larger bound is an upper limit for future growth,
  not a second managed set — warm page cache, on the maintainer's reference machine, the check
  should complete at p95 ≤ 500 ms. This is a **non-gated observation**: no test asserts wall-clock time, because an
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
  on exactly **three** external tools, all declared in §4 with location, default/minimum version,
  owner and absence behaviour: a content-hash utility (`shasum`/`sha1sum`), a JSON read/write
  utility, and **`git`** (minimum 2.7.0). v6 said "exactly two" while AC-0.5 step 1 made `git` the
  *primary* repo-root resolver and AC-3.9 rule 2 used `git ls-files --error-unmatch`, so the
  degraded-environment fixtures for the third tool were undefined (TE v6 F-04). `git` is the one of
  the three whose absence is **not** a degradation of correctness: AC-0.5 step 1 simply does not
  apply, and AC-3.9's tracked-path detection is already specified as best-effort.
  The JSON tool is **the Python interpreter discovered by the identical probe loop the three
  sibling hooks already ship** (try `python3`, `python`, `py`; accept the first that actually
  executes) — the mechanism is reused, not reinvented, because JSON handling is now cross-cutting
  across four files in this feature and hand-rolled shell JSON parsing cannot distinguish malformed
  from absent (AC-2.4 requires that distinction). Absence of the hash utility degrades every row to
  `unknown`/`hash-tool-absent` (AC-1.2); absence of the JSON utility degrades the whole run to
  `baselineStatus: unresolved` / `json-tool-absent` (AC-1.0), since with no JSON reader there is no
  manifest and therefore no rows. Never a crash, and never `in-sync`.
- **NFR-6 — Fail-open at the session seam, fail-closed at the queue seam.** The hook must never
  prevent a session from starting (AC-2.4); the queue must never run a feature on an unverified
  pipeline (AC-4.1). These opposite defaults are deliberate.

## 6. Scope

**In scope:**

- **`build-runtime.mjs` changes** (AC-5.1, AC-6.1): retarget the single `OUT_DIR` constant
  (`:29`) to `pdlc/workflows/dist/` and emit `dist/distribution-manifest.json` with
  `artifactVersion` and `pluginSha1` per row. The builder gains **no** new write target: it does
  not write `.claude/workflows/`, the sync manifest or the drift state file. `meta` literals and
  the runtime's pure-literal constraint are **not** touched.
- **`__tests__/runtimeBundle.test.js` changes** (AC-6.2, AC-6.3): repoint freshness at `dist/`, add
  the packaging oracle, add the AC-6.4 covered-set/exempt-set grep with both a RED and a GREEN
  case — the RED/GREEN fixtures built in a **non-git `os.tmpdir()` tree** created and removed by the
  test, plus the single real-repo-root assertion (AC-6.4).
- **A jest test for the fresh-clone bootstrap** (AC-6.5): `git clone --local --no-hardlinks` into a
  temp directory, `CLAUDE_PLUGIN_ROOT` unset and `HOME` pinned outside the clone, `build` then
  `sync`, then assert the bundles exist, `--check` exits `0`, and AC-4.1's mapping over the written
  drift state file yields *proceed silently*.
- A distribution-manifest-driven managed set; six-state drift detection with hash-based provenance;
  report-only `not-managed` enumeration.
- The SessionStart warning hook, the shared drift-state writer routine, and the drift state file
  (including `retiredPresent`).
- `sync-workflows.sh` with `--check` / `--force`, backups, restore, and legacy retirement (AC-3.9).
- Queue integration as defense-in-depth; version stamping as reporting-only; classifier invariant
  tests.
- **Correcting whatever `coveredViolations(repoRoot)` returns** (AC-6.4) — five files at `5630d58`
  (§0 fact 14), plus the `dist/` path update to the three already-correct normative files
  (`CLAUDE.md`, the two orchestrator `SKILL.md`s), which are outside the oracle. Archived
  per-feature spec history under `docs/{other-feature}/` is explicitly **not** edited.
- **The fresh-clone bootstrap sequence** (AC-6.5): `pdlc/hooks/scripts/sync-workflows.sh` runnable
  with no plugin installed, documented in `CLAUDE.md` and `pdlc/README.md`.
- **A one-time version-control landing step** (AC-3.9): `git rm` the four tracked
  `.claude/workflows/*` paths and gitignore that directory's generated contents, so the tracked
  generated tree is `pdlc/workflows/dist/` alone and AC-3.7's idempotence is not coupled to the git
  index.

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
| BL-05 | Which artifact the workflow runtime resolves when `.claude/workflows/` holds both `orchestrate-dev.js` and `orchestrate-dev.bundle.js`, each declaring `meta.name: "orchestrate-dev"` (§0 fact 8) | Executable proof: place two distinguishable artifacts under both names, invoke the workflow, observe which ran | Must be answered before FSPEC authoring. If the legacy `.js` wins or the resolution is non-deterministic, AC-3.9's retirement is a **correctness fix and P0 blocking**; if the `.bundle.js` wins, AC-3.9 is cleanup and may be sequenced after AC-3.1. Either way the retirement ships in this feature; only its ordering depends on the answer. AC-2.8's warning and AC-4.1's `retiredPresent` block are **not** contingent on the answer — they are specified for the unfavourable case, which is the safe default while the question is open. |
| BL-06 | Whether the workflow runtime, executing inside a **linked git worktree**, loads `.claude/workflows/*` from that worktree or from the main worktree (AC-0.5 assumes the latter is sufficient; `pdlc/workflows/orchestrate-dev.js:1869` creates one worktree per Phase-I task) | Executable proof: run a workflow from a linked worktree with the artifact present only in the main worktree, observe whether it loads | Must be answered before FSPEC authoring. If it loads per-worktree, AC-0.5's main-worktree resolution is insufficient and D-DIST-07 is pulled forward into this feature; if it loads from the main worktree (or the pipeline only ever runs workflows from the main tree), AC-0.5 as written is correct. |

## 8. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-DIST-01 | Full `pdlc install` mechanism | Drift detection plus an explicit sync closes the loop; a package manager is a larger, separate design | **`docs/_queue/QUEUE.md` row 6** (`pdlc-install-mechanism`, `blocked`) — the queue row is the authority; its REQ is not authored yet |
| D-DIST-02 | Loading workflows directly from the plugin path (no copy at all) | Would remove the problem entirely, but depends on runtime behavior not under this repo's control | **`docs/_queue/QUEUE.md` row 6** (`pdlc-install-mechanism`, `blocked`) — the queue row is the authority; its REQ is not authored yet |
| D-DIST-03 | Auto-sync on detection | Violates NFR-4; revisit only if drift proves chronic in practice | **`docs/_queue/QUEUE.md` row 6** (`pdlc-install-mechanism`, `blocked`) — the queue row is the authority; its REQ is not authored yet |
| D-DIST-04 | Multi-consumer fan-out (sync all known consuming repos at once) | One consumer today | `pdlc-engineering-loop` (queue row 5) |
| D-DIST-05 | Detecting that the installed plugin cache (node B) is behind the marketplace | Owned by Claude Code's plugin updater, not by pdlc; this REQ closes A′→B and B→C only | **`docs/_queue/QUEUE.md` row 6** (`pdlc-install-mechanism`, `blocked`) — the queue row is the authority; its REQ is not authored yet |
| D-DIST-07 | Per-worktree sync (treating each linked git worktree as its own consumer) | AC-0.5 resolves the **main** worktree, so all worktrees of a clone share one `.claude/workflows/`. Only if the workflow runtime is shown to load artifacts relative to a linked worktree does this become a real gap; BL-06 is the check | **`docs/_queue/QUEUE.md` row 6** (`pdlc-install-mechanism`, `blocked`) — the queue row is the authority; its REQ is not authored yet |
| D-DIST-06 | Hosted CI and release automation on `yumo-plugins` (run `npm test` on every push; automate AC-6.2a's post-install smoke check) | `.github/` does not exist (§0 fact 10). Standing up a CI/release host is a distinct workstream with its own secrets, runner and marketplace-publish concerns; every AC in this REQ is deliberately addressed to `cd pdlc/workflows && npm test`, which exists today, so nothing here is blocked on it | **`docs/_queue/QUEUE.md` row 7** (`pdlc-release-ci`, `blocked` on `pdlc-workflow-distribution`) — the queue row is the authority; its REQ is not authored yet |

**On the "Binds to" column (SE v6 F-07).** Every row above binds to a **queue row**, verified
present in `docs/_queue/QUEUE.md` at `5630d58` (rows 6 and 7, both `blocked`, both with an explanatory
paragraph beneath the table naming which deferrals they receive). v6 wrote the *file path* of the
successor REQ — `docs/pdlc-install-mechanism/REQ-…md`, `docs/pdlc-release-ci/REQ-…md` — and neither
directory exists in the tree; citing a nonexistent file as the receiving authority is exactly the
pattern the SE checklist flags as having shipped repeatedly. The REQ paths remain in the queue's own
`REQ Path` column as the *intended* location once each is authored; they are not cited here as
though they were artifacts.

## 9. Traceability

| User story | Requirements |
|---|---|
| US-01 | REQ-DIST-00 (AC-0.3a, AC-0.3b, AC-0.6), REQ-DIST-01 (AC-1.0–1.8), REQ-DIST-02 (AC-2.1, 2.2, 2.5, 2.5a, 2.6, 2.8) |
| US-02 | REQ-DIST-00 (AC-0.4, AC-0.5), REQ-DIST-02 (AC-2.7), REQ-DIST-03 (AC-3.1, 3.3, 3.6–3.9), REQ-DIST-06 (AC-6.5) |
| US-03 | REQ-DIST-01 (AC-1.1, 1.3, 1.6, 1.7), REQ-DIST-02 (AC-2.3, 2.5), REQ-DIST-03 (AC-3.2, 3.4, 3.5), REQ-DIST-05 (AC-5.1–5.4) |
| US-04 | REQ-DIST-00 (AC-0.1, 0.2, 0.7), REQ-DIST-06 (AC-6.1–6.5), REQ-DIST-04 (AC-4.1–4.3) |

## 10. Disposition of cross-review findings

### Software-engineer v6 (1 High / 2 Medium / 5 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Exemption rule 4 added: `**/__tests__/**`.** v6's three-member exemption set put `pdlc/workflows/__tests__/**` in the *covered* set, so the mandated RED fixture — once committed — was itself a covered violation and `coveredViolations(repoRoot) == ∅` could never be green; the same collision hit AC-3.4 backup-filename fixtures, AC-0.7 `retires` fixtures and AC-2.8 golden outputs. Rule 4 is stated with its rationale (fixtures are *inputs to the oracle, not instructions to a reader*), and AC-6.4 additionally pins the RED/GREEN fixture root to a **non-git `os.tmpdir()` tree** so no fixture is ever tracked at all. Answers **Q-01**: yes, exempt — and the fixture also lives outside the work tree. |
| F-02 | Medium | **AC-0.5 step 1 rewritten to derive the *work tree*.** `git worktree list --porcelain`'s first record, validated non-bare, readable, and confirmed by `git -C <path> rev-parse --show-toplevel`. The parent-of-git-directory rule resolved a submodule to `<super>/.git/modules` and a `--separate-git-dir` clone to the external git dir, both passing every declared guard. A failure *inside* a git repository now goes straight to `repo-root-unresolved`, never to the bounded walk. Minimum git version **2.7.0** declared in §4 with the absent / too-old / bare behaviours, all three required fixtures. Answers **Q-02** and **Q-04**. |
| F-03 | Medium | **`consumer-artifact-unreadable` added to AC-1.2's closed set**, AC-1.1's `missing` narrowed to "`consumerPath` absent **and its parent directory readable**", and AC-1.8(i)'s two presence axes made three-valued. AC-2.5 and AC-4.2 name the permissions fix as its remediation. Answers **Q-03**. |
| F-04 | Low | §0 fact 14's listing re-run at `5630d58` and **pasted unaltered** — 27 lines, `git grep -l` order, no brace expressions, `docs/PLAN-pdlc-integration-boundary-gates.md` back in position 5. A note states the output is *expected* to grow by one or two lines per review round and that what AC-6.4 asserts is the difference, not the raw list. |
| F-05 | Low | AC-3.4's regex restated in **POSIX ERE with positional groups** — `^(.+)\.([0-9]{8}T[0-9]{6}Z)(-([0-9]+))?\.bak$`, `BASH_REMATCH[1]`/`[2]` — with the reason recorded (named groups are PCRE/JS; NFR-5 mandates bash, and `grep -P` is unavailable on BSD grep). Semantics unchanged. |
| F-06 | Low | AC-0.1 (twice) and AC-0.2 retargeted: `manifest-malformed` is **AC-1.0's** manifest-level reason; AC-2.4 is cited only for the hook's exit behaviour. |
| F-07 | Low | Every deferral's "Binds to" column now cites the **queue row** (`docs/_queue/QUEUE.md` rows 6–7), verified present, with a note explaining that the nonexistent REQ file paths were the citation defect. Applied to D-DIST-01/02/03/05/06/07, not only the new row. |
| F-08 | Low | **Not resolved here — correctly out of this REQ's scope.** The iteration-index defect is a defect of `pdlc/skills/orchestrate-dev/SKILL.md` (or `orchestrate-dev.js`'s review loop), not of this document; this REQ cannot fix it and has routed it since v4. Both v6 reviewers again filed the correct review as v6 rather than the dispatched v4, and this revision reads the v6 files. Recorded here so the routing survives harvest. |

### Test-engineer v6 (1 High / 3 Medium / 3 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Both doors opened, and the REQ picks the primary one.** The RED/GREEN fixture root is a **non-git temp tree** under `os.tmpdir()` created and removed by the test (matching `__tests__/fixtures/tmpGitFixture.js`), so the directory-walk discovery branch runs, no fixture is ever tracked, and neither the "committed fixture ⇒ permanently red" door nor the "untracked fixture ⇒ RED case is green" door is reachable. Exemption rule 4 (`**/__tests__/**`) ships as well, for the committed fixtures other ACs legitimately need. Answers **Q-01**. |
| F-02 | Medium | **AC-2.8 gains a per-path remediation table conditioned on the superseding row R's state**, and AC-4.2 defers to it: plain sync only when R is `stale`/`missing`; `--force` **with the backup path named** when R is `local-edit`/`unverified`; plugin update or an environment fix when R is `unknown`. AC-2.6's `retiredPresent` becomes `{ path, supersededBy, supersedingState }` so the conditioning is observable in the file a golden test asserts. Answers **Q-03**: `--force` is the sanctioned automatic escape; a manual delete is explicitly *not* recommended, since it leaves R diverged. |
| F-03 | Medium | **AC-6.5's surface, isolation and observables specified.** Surface: the `pdlc/workflows` jest suite. Isolation: `git clone --local --no-hardlinks` into `os.tmpdir()`, `CLAUDE_PLUGIN_ROOT` unset, `HOME` pinned to a temp dir that is not an ancestor of the clone. Queue observable: AC-4.1's mapping applied to the drift state file the sync run wrote (⇒ *proceed silently*). "a CI runner" removed from the Who, since D-DIST-06 means that surface does not exist. §6 carries the test as an in-scope item. Answers **Q-02**. |
| F-04 | Medium | **`git` declared as the third external tool** in §4 with minimum version 2.7.0 and the absent / too-old / bare behaviours; NFR-5's "exactly two external tools" corrected to three, with `git` distinguished as the one whose absence is not a correctness degradation. Per this finding's own recommendation, an unsupported-flag/too-old git **refuses** (`repo-root-unresolved`) rather than falling through to the walk. |
| F-05 | Low | Folded into SE F-03's fix: AC-1.8(i)'s `pluginPath` and `consumerPath` axes are now three-valued (`absent` / `present-unreadable` / `present-readable`), with a note that a two-valued axis satisfies totality without ever generating the unreadable case. |
| F-06 | Low | AC-0.1 gains "**no two `retires` members anywhere in the manifest may share a basename** ⇒ malformed", with the reason stated at both ends (AC-0.1 and AC-3.4): the retention grouping key for a retirement backup *is* the retired path's basename. |
| F-07 | Low | AC-6.4 states the intended resolution for a false positive on pattern 4: **rephrase the document; narrowing the pattern is never sanctioned**, and any change to `PATTERNS` is a change to this AC in the same commit with the measurement re-derived. |

### Software-engineer v5 (1 High / 4 Medium / 5 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **Bootstrap hole closed.** The sync script's own path is now bound by the same `<pluginRoot>` substitution as everything else: `<pluginRoot>/hooks/scripts/sync-workflows.sh`, i.e. `pdlc/hooks/scripts/sync-workflows.sh` in the maintainer repo. Stated in the REQ-DIST-03 delivery-vehicle paragraph, in AC-0.4 (which also fixes "the exact remediation command" to that expansion for AC-2.1/2.5/2.5a/2.8/4.2), in AC-6.1, and end to end in new **AC-6.5 — Fresh-clone bootstrap** (`build` then `sync`, no plugin, no network, documented in `CLAUDE.md` and `pdlc/README.md`; §6 in scope). Answers **Q-01**. |
| F-02 | Medium | AC-1.6 and AC-6.1 restated as "the only writer of **managed artifacts** into `.claude/workflows/`", with the reason the qualifier is load-bearing (the hook writes the drift state, sync writes `.pdlc-backups/`). AC-2.7's forward rule rescoped from "write access to `.claude/workflows/`" to "write access to **the drift state file**". |
| F-03 | Medium | The "in a distribution context" qualifier is **deleted**. AC-6.4 now pins four literal ERE alternatives in a table and states the oracle as `grep(PATTERNS) − exempt(p)`. Measured evidence that the qualifier separated nothing is in §0 fact 14. Answers **Q-04**. |
| F-04 | Medium | `pdlc/workflows/dist/**` is **exempt**, by the generated-tree rule, alongside `.claude/workflows/**` and `node_modules/**` — with the day-one reason recorded (the bundles inline the very module headers this AC corrects). Answers **Q-03**. |
| F-05 | Medium | AC-0.5 step 1 changed to `git rev-parse --path-format=absolute --git-common-dir` → parent, i.e. the **main** worktree; a linked worktree is explicitly **not** a distinct consumer, with `orchestrate-dev.js:1869`/`:1882` cited as why worktrees are routine here. New **BL-06** is the executable check, **D-DIST-07** the bound deferral if the answer is unfavourable. §4's repo-root row updated. Answers **Q-02**. |
| F-06 | Low | §0 fact 14 rebuilt: it now prints the exact four-pattern command AC-6.4's test runs, its **verbatim 25-path output**, the exemption rule applied to it, and the resulting five covered violations. `CLAUDE.md` and the two `SKILL.md`s are stated as **not appearing in the grep output** and as an ordinary in-scope edit rather than table rows. |
| F-07 | Low | §0 fact 13 and AC-6.1 now cite `:29` (`OUT_DIR`), `:170` (`mkdirSync`) and `:184` (the only `writeFileSync`, inside the `:172-186` loop). |
| F-08 | Low | AC-6.2 restated as "no ignore rule under `pdlc/` other than `node_modules/`", listing the three root rules that exist and noting AC-3.9 adds a fourth. |
| F-09 | Low | AC-6.2a restated as "exactly the bundles named in the manifest **plus the manifest itself**". |
| F-10 | Low | Still routed to `pdlc/skills/orchestrate-dev/SKILL.md` (v4 F-11's disposition); this REQ does not restate an orchestration rule in prose. This revision was again dispatched as "iteration 3" while v5 reviews are committed, so the reviewers' filed indices (v5 → this v6) are authoritative. |

### Test-engineer v5 (3 High / 4 Medium / 3 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | **New AC-1.0** makes baseline resolution a manifest-level precondition with its own closed reason set (including `manifest-empty`), evaluated before any row quantifier. Every green outcome is now guarded by `baselineStatus == resolved` **and** a non-empty row set: AC-2.2 (silence), AC-3.3 row 1 + row 5 (exit 0), AC-4.1 rows 1–3 + last row (proceed). New **AC-2.5a** gives the hook a warning that needs no rows. AC-1.2 keeps only the two genuinely row-level reasons (`plugin-artifact-missing`, `hash-tool-absent`); the other six moved to AC-1.0. AC-2.6 gains `baselineStatus`/`baselineReason` and fixes `rows: []` when unresolved. Answers **Q-01**: `rows` is `[]` **with** a manifest-level status field. |
| F-02 | High | Row schema gains **`retires: [consumer-relative paths]`** (AC-0.1); top-level `retired` is defined as their union and checked by AC-6.2(c). AC-3.9's guard is now per-row and computable: *`p ∈ R.retires` is deleted iff R's post-copy state is `in-sync`*, else `retire-skipped` naming R's state. The mandated falsifying fixture is written out. Answers **Q-03**: retirement is skipped for exactly the rows the copy loop skipped. |
| F-03 | High | §0 fact 14 re-derived with the **same four-pattern command the test runs**, verbatim output pasted, exemption rule applied mechanically ⇒ five covered violations. AC-6.4's covered set is `grep − exempt`; nothing is hand-listed. Answers **Q-02**: yes, the literal phrase, no qualifier. |
| F-04 | Medium | Retirement is stated as manifest-derived and **not evaluated** when `baselineStatus` is `unresolved` (AC-0.3b, AC-2.6, AC-3.9). AC-2.8's Who is now "a consumer that has updated the plugin but not yet synced". AC-0.3b enumerates `retiredPresent: []` with its meaning (*not evaluated*, never "none present"). |
| F-05 | Medium | The exemption set is expressed as a **rule** over paths (generated trees; `docs/<dir>/` containing a `REQ-*.md`; manifest `retired`/`retires` values) and the covered set is "everything else", so the two partition the tree. `README.md`, `pdlc/hooks/scripts/*.sh`, `docs/_constraints/**` and future `docs/design/*.md` are covered — stated explicitly, with the `MASTER-PLAN-v2.md` case named as must-be-RED. |
| F-06 | Medium | AC-6.4's checker is required to be a **pure function of a root directory** (or explicit file list), with discovery via `git ls-files` when the root is a work tree and a directory walk otherwise. RED and GREEN run against `__tests__/fixtures/` trees; one additional assertion binds it to the real repo root. |
| F-07 | Medium | AC-6.2(b) no longer says "byte-identical to the freshly built bundle". It recomputes `sha1` from the bytes on disk and compares to `pluginSha1`; freshness is discharged **once**, by AC-6.3, and no test in this feature runs the builder into `dist/`. |
| F-08 | Low | `id` values pinned literally (`orchestrate-dev`, `orchestrate-queue`) in AC-0.1 and §4, and AC-3.4 gains the stamp-anchored filename regex with a greedy `id` capture, so `orchestrate-dev` and the retired basename `orchestrate-dev.js` are parsed and retained independently. |
| F-09 | Low | AC-0.3b states the escape is **two-step** (write config → run hook/`--check` so the writer records the resolved flag → queue proceeds) and names the one-step fixture as correctly blocking. AC-4.1's `checkEnabled` row sits above the `baselineStatus` row precisely so the escape still works. |
| F-10 | Low | AC-5.3: `artifactVersion` is **required** in the report, labelled and asserted; the permission to drop it is withdrawn. |

### Software-engineer v4 (3 High / 3 Medium / 5 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | AC-6.4 rewritten. The enumeration is re-derived by repo-wide grep at `3dab335` and recorded in **§0 fact 14** as a classified table (20 paths: 5 normative-and-wrong, 3 normative-and-correct, 7 archived, 4 generated/own-docs). AC-6.4 now states a **normative covered set and a normative exemption set** — archived `docs/{other-feature}/**` spec history is exempt by rule, so no shipped feature's REQ/FSPEC is in this feature's blast radius — plus a required RED/GREEN falsifying case. §6 in-scope restated as "the covered set", not a file list. Answers **Q-05**: no, rewriting the seven `docs/orchestrate-dev-workflow/*` files is *not* in scope. |
| F-02 | High | **One manifest path: `<pluginRoot>/workflows/dist/distribution-manifest.json`.** Stated once in AC-0.1 with a paragraph declaring every other occurrence a restatement, and made consistent in AC-0.2, AC-0.3a, AC-5.1, AC-6.1, AC-6.2(d), AC-6.2a and §4. §0 fact 12 extended to state the install transform explicitly: `pdlc/` is dropped, `dist/` survives. Answers **Q-01**. |
| F-03 | High | AC-0.3a rewritten as a **plugin-root substitution** (`<pluginRoot> := <repoRoot>/pdlc`), which moves the manifest source along with the byte baseline — one binding, no second composition rule. New **AC-0.3b** specifies the pre-manifest consumer end to end (all rows `unknown`/`manifest-absent`, hook warns and exits 0, `--check` 3, queue `blocked`), names **plugin update** as the only real remediation and `checkEnabled: false` as the interim escape, and requires the test suite to treat it as a first-class path. AC-4.2 amended so the remediation named can actually fix the reason. Answers **Q-02**. |
| F-04 | Medium | AC-6.1 says it once: **the builder writes `dist/` and nothing else**; `.claude/workflows/` is populated by `sync-workflows.sh`, in the maintainer repo exactly as in any other consumer. Mechanically a retarget of the single `OUT_DIR` at `build-runtime.mjs:29` (§0 fact 13). The in-builder sync and the builder-written sync-manifest entry are **dropped** from AC-0.3a, AC-1.6 and §6. Answers **Q-03**. |
| F-05 | Medium | Follows from F-04: with the builder writing nothing under `.claude/workflows/`, AC-2.7's two-writer list is exhaustive and true. AC-2.7 now says so explicitly and states the maintainer loop (**build → sync → unblocked, in-session**) plus the rule that any future third writer joins the list in the same commit. |
| F-06 | Medium | AC-3.9 gains a two-rule version-control story: (1) a one-time maintainer `git rm` + gitignore of the four tracked `.claude/workflows/*` paths, in scope in §6; (2) sync never runs a VCS command — it backs up, deletes, and **prints a manual action** when the retired path is tracked. AC-3.7's idempotence is caveated accordingly, with the note that a test asserting it against tracked retired paths is testing the git index, not sync. Answers **Q-04**. |
| F-07 | Low | §0 fact 7 restated: the tree is clean at `3dab335`, so this is **committed** drift — the stronger form of the argument. §0 preamble regrounded to `3dab335` / clean tree. |
| F-08 | Low | §0 fact 10 corrected to **15** `*.test.js` files plus `fixtures/` and `helpers/`, with `runtimeBundle.test.js:22-25`/`:77-79` cited. |
| F-09 | Low | (i) AC-2.6's Who is now the shared writer routine, with "never `orchestrate-queue`, which only reads" stated. (ii) AC-0.5 names `repo-root-unresolved` as the reason for a `$HOME`/`/` root, closing AC-1.2's set. (iii) NFR-2 labels its fixture bound a deliberate ~4× headroom margin over AC-0.2's 2 rows. |
| F-10 | Low | AC-5.3 gains a paragraph labelling **both** version lines "not a drift signal", explains why identical `artifactVersion` beside a hash mismatch is correct rather than contradictory, requires the two `sha1`s to be printed as the discriminating evidence, and permits dropping `artifactVersion` from the report entirely. |
| F-11 | Low | Accepted and **routed out of this REQ**: a rule stated in a feature REQ cannot change orchestrator behaviour. Filed against `pdlc/skills/orchestrate-dev/SKILL.md`'s review-loop dispatch, where the index must be derived from the highest `CROSS-REVIEW-{role}-{doc}-v{N}` on the branch. This REQ records the defect (v4 was again dispatched as "iteration 2") but does not attempt to fix it in prose. |

### Test-engineer v4 (2 High / 3 Medium / 4 Low)

| ID | Sev | Resolution |
|---|---|---|
| F-01 | High | Same fix as SE F-02 — one manifest location, `dist/` included, identical in AC-0.1, AC-0.2, AC-0.3a, AC-5.1, AC-6.1, AC-6.2, AC-6.2a and §4. The `manifest-absent` / `manifest-malformed` fixture now has a pinnable path, so the AC-2.4 false-green is closed. Answers **Q-01** jointly with SE Q-01/Q-02. |
| F-02 | High | AC-0.3a restated as **root = `<repoRoot>/pdlc`, `pluginPath` joins unchanged**, with the double-nesting failure named explicitly so it is not re-derived. This is what makes AC-3.3 exit 0 and AC-2.2 silence reachable on real inputs, which was v3 F-17's ask. |
| F-03 | Medium | New **AC-2.8**: retired-present warns, carries the reason token `retired-present`, is textually distinct from all four other warning classes, names each path, and names `sync-workflows.sh` (not `--check`) as the remediation — independent of the managed rows' states. AC-2.2 now lists AC-2.1/2.3/2.5/2.8 as exhaustive over the conditions that break silence, so the "silent `else`" implementation is excluded. |
| F-04 | Medium | AC-6.4's exemption set is now normative and exhaustive — including **the manifest's own `retired` array**, which AC-0.7 requires to contain the superseded string — and the AC mandates a two-directional falsifying case (covered ⇒ RED, exempt ⇒ GREEN) so the test cannot be narrowed into vacuity. |
| F-05 | Medium | `retiredPresent: [paths]` added as a **top-level** field of the drift state file (AC-2.6) — not a `rows` entry, which would break the one-entry-per-manifest-row invariant — always `[]` rather than absent when empty, and AC-4.1 gains a precedence row making a non-empty `retiredPresent` **block**, in the same class as `stale` and matching `--check`'s exit 1. The reasoning (BL-05 unresolved ⇒ the runtime may execute the stale artifact) is recorded in the AC. Still one injected read, so NFR-1 holds. |
| F-06 | Low | AC-1.1's Given reduced to "a manifest row", with a sentence stating why the existence qualifier had to go (three of six states are defined by absence). |
| F-07 | Low | AC-3.4's `id` set is now explicitly the union of managed-row `id`s **and retired basenames**, so retirement backups are inside the retention rule and the newest-5-per-`id` property holds over every file the tool writes. |
| F-08 | Low | §4 gains a `pluginVersion` row: location per baseline, default, owner, and the absent rendering (`unknown` in the report, `null` in the drift state, no effect on any outcome). A `retired paths` row was added alongside it. |
| F-09 | Low | Covered by SE F-06's rule (1): the one-time `git rm` + gitignore is named as a landing step in AC-3.9 and §6, and AC-3.7's caveat makes the fixture's independence from the git index explicit. Answers **Q-02** (bundles become untracked). |
| Q-03 | — | Answered in AC-6.2: build inputs in the packaged set are **tolerated, not asserted away** — harmless consumer-side, already barred from being copied by AC-0.2 — and no "no build input is packaged" converse is required, since it would go red on the current tree and encode a hygiene requirement this REQ does not make. |

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
