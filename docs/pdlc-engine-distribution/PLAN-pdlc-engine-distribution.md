# PLAN — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → TSPEC → DECISIONS → **PLAN**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10), `FSPEC-pdlc-engine-distribution.md` (v0.2), `TSPEC-pdlc-engine-distribution.md` (v0.11), `DECISIONS-pdlc-engine-distribution.md` (v0.3) |
| Downstream | PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{product-manager,test-engineer}-PLAN-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft — in review (Phase P) | Claude | 0.1 | 2026-08-13 |

**Changelog**

| Version | Change |
|---|---|
| 0.1 | Initial draft |

## 1. Summary

### 1.1 What gets built

Five streams of work, each traceable to a TSPEC section, landing in one branch:

| Stream | What lands | TSPEC |
|---|---|---|
| A — Version resolution | `lib/store.mjs`, `lib/resolve-version.mjs`, the three-way `readEngineConfig`, the two-root workflow-module resolver, the inert `UpdateProbe`, and the twelve catalogue ids they emit | §6, §10.1, §10.3 |
| B — Launcher | The E-4b split (`bin/pdlc.mjs` becomes a dependency-free Node-floor guard; the body moves to `bin/cli.mjs` with an exported `main(argv, deps)` and an exported five-key `deps` seam), then the resolution entry, the `spawnSync` hop, and the `--version`/`doctor` resolve-but-never-refuse exemption | §6.2, §9.3 |
| C — Packaging & publish | Manifest edits, `prepack` vendoring plus `.gitignore`/`.npmignore`, `postinstall` store population, the restated anti-fork oracle (AF-1…AF-3), the packed-set equality (PF-4), the two READMEs, and `.github/workflows/publish.yml` with PF-1…PF-5 | §5, §8, §9.1, §9.2 |
| D — Provenance carriers | `lib/provenance.mjs`, the `_provenance` seam on **both** workflow modules, AC-5.3's four kinds across five commit helpers and five `rewriteStatus` routes, §7.4's `artifactPaths` classes 7–11, the `devInjection`/`queueInjection` wiring, and the regenerated `dist/` bundles | §7, §12.1 |
| E — Fixture machine & manual | The install/upgrade legs, the launcher pass-through and signalled-child legs, AT-2.5 on a below-floor image, and the two `[manual]` recorded observations | §12.1, §12.3 |

### 1.2 What is deliberately **not** built here

Per TSPEC §14.3: AC-6.2's bundle-side load root (N-1), BL-03's transcription (N-3), the
range-widening cadence (N-4) and M-ENG-10's change-control tail (N-5). Two operator
obligations *are* scheduled, as gate tasks rather than code tasks: the npm scope (N-6, T02)
and the licence (N-2, T05).

### 1.3 Three properties this plan is arranged around

1. **The catalogue is a shared serialisation point.** `pdlc/engine/lib/catalogue.mjs` is
   written by six tasks (T28, T32, T37, T41, T43, T45). The suite-wide equality
   (`__tests__/_assert-suite-wide.mjs:196-210`, verified at HEAD) fails on a **registered but
   never emitted** id, so TSPEC §10.3 forbids `[Fake first]` registration ahead of emitters.
   Each of the six therefore registers its ids **and** ships their emitter, and the six sit in
   six consecutive batches (3, 4, 5, 6, 7, 8) so no batch has two writers of that file.
2. **The two workflow modules are the other serialisation point.** `orchestrate-dev.js` has
   four writers (T29, T35, T38, T42) and `orchestrate-queue.js` three (T30, T36, T39); each set
   is spread across distinct batches with real `Deps` edges, never prose.
3. **Wiring is asserted at the level that introduces it.** The three engine-side levels TSPEC
   §12.1 names — module-side, production-path and process-entry — are separate tasks with
   separate red rows, because a green module-side suite is exactly what a `builder-not-wired`
   defect looks like (§7.2).

### 1.4 Status key

⬚ Not Started | 🔴 Red | 🟢 Green | 🔵 Refactored | ✅ Done

## 2. Task list

One table, machine-parsed. `#` ids are bare (never bold) and are spelled identically in the
`Deps` column. `Batch` is derived mechanically as `max(batch of deps) + 1`, sources at batch 1.
Test-only rows carry `—` in `Source File`; gate and `[manual]` rows carry `—` in `Test File`.
`[Fake first]` marks test-double creation. `[red]` marks a failing-test task; every `[green]`
row names its `[red]` row in `Deps`.

| # | Stream | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| T01 | — | P1-00 pre-flight gate: assert the BL-PREREQ symbols this feature extends are importable/present at HEAD — `devInjection`, `queueInjection`, `readEngineConfig`, `WORKFLOW_MODULE_URLS`, `resolvePluginRoot`, `runStartupChecks`, `runDev`/`runQueue`/`runQueueLoop`, and the workflow modules' `rewriteStatus`, `updateQueueStatus`, `ensureEvidenceColumn`, `commitPaths`, `buildA5SeamOps`, `reviewLoop`, `appendApprovalAnchors`. Existence only, never shape | `pdlc/engine/__tests__/preflight-baseline.test.js` | — | 1 | — | ⬚ |
| T02 | C | [gate] Operator records the npm scope (N-6, O-8 blocker 2) as a decision entry. Unblocks PF-3, §5.1's `name` and §9.1's README literal | — | `docs/_decisions/DECISIONS-plugin-distribution.md` | 1 | — | ⬚ |
| T03 | — | [Fake first] Shared engine-side doubles module: S-1 store listings, S-2 config results (`absent`/`no-pin`/`unreadable`), S-3 launcher descriptor recorder, S-4 probe doubles (inert/failing/succeeding), S-5 publish-channel stub, S-6 `NO_PROVENANCE` + populated frozen `Provenance`, and the five `deps` recorders with TSPEC §9.3's named return shapes | `pdlc/engine/__tests__/_doubles.mjs` | — | 1 | — | ⬚ |
| T04 | — | [Fake first] Shared module-side doubles: populated frozen `Provenance`, recording `_git`/`_appendFile`/`_readFile` seams, `QUEUE.md` table fixtures (no-columns, `Evidence`-only, both-columns) | `pdlc/workflows/__tests__/helpers/provenanceDoubles.js` | — | 1 | — | ⬚ |
| T05 | C | [gate] Operator records the licence (N-2, O-8 blocker 3) as a decision entry. Flips PK-3 into the expected packed set; blocks the first real publish, no code task | — | `docs/_decisions/DECISIONS-plugin-distribution.md` | 2 | T02 | ⬚ |
| T06 | A | [red] Store enumeration over an injected listing: sorted `Version[]` via `handshake.compare`, unparseable directory name skipped **and reported**, `rootFor(version)` mapping (AT-5.5) | `pdlc/engine/__tests__/store.test.js` | — | 2 | T01, T03 | ⬚ |
| T07 | A | [red] Resolution-ladder totality over branches 0–7 including both corrupt-config cases of §6.4's table, and the announcement-never-empty property (AT-5.1, AT-5.2, AT-5.4, AT-5.5) | `pdlc/engine/__tests__/resolve-version.test.js` | — | 2 | T01, T03 | ⬚ |
| T08 | D | [red] `Provenance` construction and rendering: frozen, plain-data, no fs/env/clock; `line` and `block` rendered by the single writer (AT-4.1, AT-4.3) | `pdlc/engine/__tests__/provenance.test.js` | — | 2 | T03 | ⬚ |
| T09 | A | [red] AC-5.6 path-level oracle over `resolvePluginRoot`'s four rows: honour direction (root `===` env value, `source` unchanged, `notices` empty), ignore direction (discovered root + `notices` carrying `env.plugin-root-ignored` by id **and** rendered text), both unset rows empty (AT-5.6) | `pdlc/engine/__tests__/plugin-root-notice.test.js` | — | 2 | T01, T03 | ⬚ |
| T10 | A | [red] Three-way `readEngineConfig`: `absent` / `no-pin` / `unreadable`, `notices` kept for `dispatch` tunables whenever the file parses (AT-5.1, AT-5.5) | `pdlc/engine/__tests__/engine-config.test.js` | — | 2 | T01, T03 | ⬚ |
| T11 | A | [red] Two-root workflow-module resolution: vendor root wins, checkout root is the fallback, neither resolves ⇒ refusal naming both paths tried, load root announced when both exist (AT-6.1) | `pdlc/engine/__tests__/workflow-roots.test.js` | — | 2 | T01, T03 | ⬚ |
| T12 | A | [red] Inert `UpdateProbe`: default never called, `{unavailable, reason}` returned, `update.unavailable` stated on every run, exit code unaffected (AT-5.1) | `pdlc/engine/__tests__/update-probe.test.js` | — | 2 | T03 | ⬚ |
| T13 | B | [red] Guard-entry structural oracle, three clauses over `bin/pdlc.mjs`'s source: zero static `import` declarations; exactly three non-comment top-level statements; zero `await` tokens in the comment-stripped source (AT-2.4) | `pdlc/engine/__tests__/bin-guard-structure.test.js` | — | 2 | T01 | ⬚ |
| T14 | B | [red] Launcher hop: S-3 descriptor assertions (path, argv, env marker) without spawning; real-spawn pass-through leg (non-zero status verbatim, stdout/stderr unmixed); signalled-child leg asserting the exact `128 + signum` (AT-2.1, AT-1.1) | `pdlc/engine/__tests__/launcher.test.js` | — | 2 | T03 | ⬚ |
| T15 | B | [red] `--version`/`doctor` resolve-but-never-refuse: (a) pinned repo reports the **resolved** triple with `mode: "pin"`, (b) empty store reports the launcher's own triple with `mode: "unresolved"` and the refusal text as a notice, (c) corrupt config under `doctor` prints branch 0's text and exits 0. Exit 0 in all three (AT-1.4, AT-1.1) | `pdlc/engine/__tests__/version-doctor.test.js` | — | 2 | T03 | ⬚ |
| T16 | C | [red] Packaging oracles: PF-4's both-directions packed-set equality against §5.4's literal `PK-*` table, run over a **real `npm pack` into a temp dir**, with the failure message naming TSPEC §5.4 as the expected set's source; AF-2's `prepack`-into-temp precondition, `modules` set-equality, SHA-256 equality against the canonical sources, and the one-byte mutation falsifier (AT-3.8a, AT-3.8b) | `pdlc/engine/__tests__/packaging.test.js` | — | 2 | T01, T03 | ⬚ |
| T17 | C | [red] CI arrangement extension: FSPEC §5.1's two set-equalities over `pr-tests.yml`'s job-level `name:` keys with **per-job** matrix expansion; non-matrix name expression ⇒ `unexpandable`; job-level `uses:` ⇒ `unexpandable`; `publish.yml`/`pr-tests.yml` gate-command set-equality; absorbs V-19's older overlapping matrix assertions; mutations run against fixture copies (AT-3.4) | `pdlc/engine/__tests__/ci-arrangement.test.js` | — | 2 | T03 | ⬚ |
| T18 | C | [red] AT-2.2 uniqueness: each engine install/upgrade/pairing command, keyed on `@{scope}/pdlc-engine`, appears exactly once in the tree; the plugin's three `claude plugin install` occurrences are outside the set | `pdlc/engine/__tests__/docs-uniqueness.test.js` | — | 2 | T03 | ⬚ |
| T19 | D | [green] Standing guard, green at authoring time and verified so at HEAD (`orchestrate-dev.js:2839` inside `buildA5SeamOps`, `:6736` inside `appendApprovalAnchors`, `:10429` inside `commitPaths`; `orchestrate-queue.js:1603` `commitQueueRow`, `:1645` `commitAdvisoryRecord`). Commit-site set-equality over both workflow modules' sources: the set of **enclosing named functions** containing a `git commit` invocation equals `{commitPaths, appendApprovalAnchors, commitQueueRow, commitAdvisoryRecord, buildA5SeamOps}`, stated unconditionally (AT-5.3) | `pdlc/engine/__tests__/commit-sites.test.js` | — | 2 | T01 | ⬚ |
| T20 | D | [red] `_provenance` inertness (P-1: absent seam ⇒ byte-identical artifacts) plus kinds 1 and 2 in `orchestrate-dev.js` — report field, and `block` appended by `_appendFile` **after** `_checkFile` confirms the POSTMORTEM, skipped entirely when `block` is empty (AT-4.1, AT-4.2, AT-5.3) | `pdlc/workflows/__tests__/provenanceSeam.test.js` | — | 2 | T04 | ⬚ |
| T21 | D | [red] Kind 3: mark applied **inside `rewriteStatus`** so all five routes R-1…R-5 inherit it; `Engine` cell written on **both** `updateQueueStatus` row-write paths; `ensureEngineColumn` round trip asserting the **header literal**; the two-migration case (table lacking both `Evidence` and `Engine`) (AT-5.3, AT-5.3b) | `pdlc/workflows/__tests__/provenanceQueueRow.test.js` | — | 2 | T04 | ⬚ |
| T22 | D | [red] Kind 4: each of C-a…C-e composes `provenance.line` **internally**; C-e still stages nothing of its own and keeps its `advisory(A5):` prefix; the queue module's own `main()` seam reaches C-d (AT-5.3) | `pdlc/workflows/__tests__/provenanceCommits.test.js` | — | 2 | T04 | ⬚ |
| T23 | D | [red] §7.4's `artifactPaths` set-equality over document classes 1–11, restricted to the classes the run produced; anchor-appended `CROSS-REVIEW-*` enumerated; `QUEUE.md` and `docs/_decisions/` outside scope (AT-4.5) | `pdlc/workflows/__tests__/artifactPaths.test.js` | — | 2 | T04 | ⬚ |
| T24 | D | [red] §12.3 oracle 2: produced-kind set-equality with **positives** — halted queue-driven fixture produces four kinds; green queue-driven fixture marks R-3's `in-progress` and R-5's `awaiting-merge`; green **direct** fixture runs with `mergeMode: "on"` plus the guard-ladder preconditions (`prUrl`, O1, O5, O2, O3 with `unresolved: 0`, O4) and asserts a non-empty produced-kind set; cross-review and `CODE_REVIEW-*` **contents** unmarked while the harness commit message is marked (AT-5.3, AT-4.2) | `pdlc/workflows/__tests__/devModeKinds.test.js` | — | 2 | T04 | ⬚ |
| T53 | C | [red] `postinstall` places the installed tree at `$PDLC_HOME/versions/<version>/` over an injected fs, adds rather than replaces entries, and reads/writes no consumer path (AT-2.1, AT-2.3) | `pdlc/engine/__tests__/postinstall.test.js` | — | 2 | T03 | ⬚ |
| T54 | A | [red] Startup surfaces the resolver's `notices` without re-deriving or re-rendering them, and carries §6.3's resolution announcement into the banner for every branch including 1, 3 and 6 (AT-5.2, AT-5.6) | `pdlc/engine/__tests__/startup-announce.test.js` | — | 2 | T03 | ⬚ |
| T55 | D | [red] Both generated closures in `build-runtime.mjs` (`:274` and `:307`) pass `provenance` as `rewriteStatus`'s 8th argument, and the built `dist/` artifacts carry it (AT-5.3) | `pdlc/workflows/__tests__/runtimeProvenanceWiring.test.js` | — | 2 | T04 | ⬚ |
| T25 | C | [green] Manifest edits: remove `"private": true` (O-8 blocker 1, discharged here), add `engines.node: ">=20"`, the `files` allow-list `["bin/", "lib/", "vendor/workflows/", "scripts/postinstall.mjs"]`, `scripts.prepack`, `scripts.postinstall`, and the scoped `name` from T02's record (AT-3.8a, AT-2.4) | `pdlc/engine/__tests__/packaging.test.js` | `pdlc/engine/package.json` | 3 | T02, T16 | ⬚ |
| T26 | A | [green] `lib/store.mjs` — `listVersions`/`rootFor` over injected fs, skip-and-report on unparseable entries (AT-5.5) | `pdlc/engine/__tests__/store.test.js` | `pdlc/engine/lib/store.mjs` | 3 | T06 | ⬚ |
| T27 | D | [green] `lib/provenance.mjs` — the single construction site; frozen value plus `line`/`block` renderers, pure (AT-4.1, AT-4.3) | `pdlc/engine/__tests__/provenance.test.js` | `pdlc/engine/lib/provenance.mjs` | 3 | T08 | ⬚ |
| T28 | A | [green] `readEngineConfig` gains §6.4's three-way `engine` discriminant, `notices` kept for tunables; registers **and emits** `config.unreadable` (AT-5.5) | `pdlc/engine/__tests__/engine-config.test.js` | `pdlc/engine/lib/run.mjs`, `pdlc/engine/lib/catalogue.mjs` | 3 | T10 | ⬚ |
| T29 | D | [green] `orchestrate-dev.js` gains the default-inert `_provenance` keyword parameter and `NO_PROVENANCE`, plus kind 1 (report field) and kind 2 (script-owned `_appendFile` after `_checkFile`) (AT-4.1, AT-4.2) | `pdlc/workflows/__tests__/provenanceSeam.test.js` | `pdlc/workflows/orchestrate-dev.js` | 3 | T20 | ⬚ |
| T30 | D | [green] `orchestrate-queue.js` gains its own `_provenance` keyword parameter and `NO_PROVENANCE`, and passes it to `commitAdvisoryRecord` (C-d) as a fifth argument (AT-5.3) | `pdlc/workflows/__tests__/provenanceCommits.test.js` | `pdlc/workflows/orchestrate-queue.js` | 3 | T22 | ⬚ |
| T31 | C | [green] `pdlc/README.md` gains install / upgrade / `npm view … pdlcPairing` beneath `## Install in another repo`; `pdlc/engine/README.md` is authored as PK-2 and **links** rather than repeating the three commands (AT-2.2, AT-1.5) | `pdlc/engine/__tests__/docs-uniqueness.test.js` | `pdlc/README.md`, `pdlc/engine/README.md` | 3 | T02, T18 | ⬚ |
| T32 | A | [green] `resolvePluginRoot` gains `devDeclared` and one `notices` key on its **extended** return; the ignore branch decides and renders; `REMEDY` updated to `--dev PDLC_PLUGIN_ROOT=…`; registers and emits `env.plugin-root-ignored` (AT-5.6) | `pdlc/engine/__tests__/plugin-root-notice.test.js` | `pdlc/engine/lib/skills.mjs`, `pdlc/engine/lib/handshake.mjs`, `pdlc/engine/lib/catalogue.mjs` | 4 | T09, T28 | ⬚ |
| T33 | C | [green] `scripts/prepack.mjs` (recreate `vendor/workflows/`, byte-for-byte copy, `VENDOR-MANIFEST.json`), `.gitignore` gains `vendor/`, `.npmignore` created with the single line `!vendor/workflows/` — **authored in this same task** — and the anti-fork oracle restated in place: V-05's walk replaced by AF-1's `git ls-files` tracked-ness test, `PROP-FORK-1` extended to AF-3 (AT-3.8b, AT-6.1) | `pdlc/engine/__tests__/packaging.test.js`, `pdlc/engine/__tests__/run.test.js` | `pdlc/engine/scripts/prepack.mjs`, `pdlc/engine/.gitignore`, `pdlc/engine/.npmignore`, `pdlc/engine/__tests__/run.test.js` | 4 | T16, T25 | ⬚ |
| T34 | C | [green] `scripts/postinstall.mjs` — populate `$PDLC_HOME/versions/<version>/`, additive, never touching a consumer project (AT-2.1, AT-2.3, AT-2.5) | `pdlc/engine/__tests__/postinstall.test.js` | `pdlc/engine/scripts/postinstall.mjs` | 4 | T53, T25, T26 | ⬚ |
| T35 | D | [green] Kind 4, dev side: `commitPaths` (C-a) gains `provenance = NO_PROVENANCE` and `main()` passes it; `appendApprovalAnchors` (C-b) gains `provenance` in its destructured object, threaded from **both** call sites `:6516` and `:11336`; `buildA5SeamOps` (C-e) marked in place at its single call site `:11718` (AT-5.3) | `pdlc/workflows/__tests__/provenanceCommits.test.js` | `pdlc/workflows/orchestrate-dev.js` | 4 | T22, T29 | ⬚ |
| T36 | D | [green] `ensureEngineColumn` mirroring `ensureEvidenceColumn`, and the `Engine` cell written on **both** `updateQueueStatus` row-write paths — the `evidence == null` quick path and `writeEvidenceCarryingRow` (AT-5.3, AT-5.3b) | `pdlc/workflows/__tests__/provenanceQueueRow.test.js` | `pdlc/workflows/orchestrate-queue.js` | 4 | T21, T30 | ⬚ |
| T37 | A | [green] `lib/resolve-version.mjs` — the pure, total ladder over branches 0–7 with an announcement on every branch; registers and emits `store.empty`, `version.pin-missing`, `version.pin-malformed`, `version.dev-incomplete`, `version.announce-pin`, `version.announce-latest`, `version.announce-dev` (AT-5.1, AT-5.2, AT-5.4, AT-5.5) | `pdlc/engine/__tests__/resolve-version.test.js` | `pdlc/engine/lib/resolve-version.mjs`, `pdlc/engine/lib/catalogue.mjs` | 5 | T07, T26, T28, T32 | ⬚ |
| T38 | D | [green] §7.4 classes 7–11: `appendApprovalAnchors` returns `{appended, paths}`; `reviewLoop` surfaces them in its returned record and both `main()`-scope callers push; the erratum-confirmation site pushes directly through its closure; LEARNINGS, `CODE_REVIEW-*`, POSTMORTEM and `ADVISORY-*` pushed onto `artifactPaths` (AT-4.5) | `pdlc/workflows/__tests__/artifactPaths.test.js` | `pdlc/workflows/orchestrate-dev.js` | 5 | T23, T35 | ⬚ |
| T39 | D | [green] `rewriteStatus` gains an 8th positional `provenance = NO_PROVENANCE` and hands `line` to `commitQueueRow` and to the row writer; the queue driver's own callers R-3…R-5 pass the queue run's provenance (AT-5.3) | `pdlc/workflows/__tests__/provenanceQueueRow.test.js` | `pdlc/workflows/orchestrate-queue.js` | 5 | T21, T36 | ⬚ |
| T40 | A | [green] `runStartupChecks` surfaces the resolver's `notices` through the `resolveFn` seam and carries the resolution announcement into the banner (AT-5.2, AT-5.6) | `pdlc/engine/__tests__/startup-announce.test.js` | `pdlc/engine/lib/startup.mjs` | 5 | T54, T32 | ⬚ |
| T49 | C | [green] `.github/workflows/publish.yml` on `push: tags: ['engine-v*']` — `gate` (the five PR-gate job bodies duplicated, never `uses:`), `preflight` (PF-1…PF-5, in parallel), `publish` (pairing record written by the same job, then `prepack`, then **PF-4 and PF-5 re-asserted against the packed tarball**, then the `PublishChannel`); `NODE_AUTH_TOKEN` consumed only by the publish step; loud failure on an existing version (AT-3.1…AT-3.7) | `pdlc/engine/__tests__/ci-arrangement.test.js`, `pdlc/engine/__tests__/packaging.test.js` | `.github/workflows/publish.yml`, `pdlc/engine/scripts/publish-preflight.mjs` | 5 | T17, T25, T33, T34 | ⬚ |
| T41 | A | [green] `WORKFLOW_MODULE_URLS` becomes the two-root resolver (vendor root first, checkout root second, refuse naming both when neither resolves, announce the load root when both exist); registers and emits `modules.not-found` (AT-6.1, AT-4.3) | `pdlc/engine/__tests__/workflow-roots.test.js` | `pdlc/engine/lib/run.mjs`, `pdlc/engine/lib/catalogue.mjs` | 6 | T11, T28, T37 | ⬚ |
| T42 | D | [green] `main()`'s `_recordQueueRow` call object gains `provenance` beside `{feature, status, evidence}` (AT-5.3) | `pdlc/workflows/__tests__/devModeKinds.test.js` | `pdlc/workflows/orchestrate-dev.js` | 6 | T24, T38, T39 | ⬚ |
| T43 | A | [green] `UpdateProbe` S-4 with an inert default that still returns `{unavailable, reason}`; registers and emits `update.unavailable` on every run, blocking nothing (AT-5.1) | `pdlc/engine/__tests__/update-probe.test.js` | `pdlc/engine/lib/store.mjs`, `pdlc/engine/lib/catalogue.mjs` | 7 | T12, T26, T41 | ⬚ |
| T44 | D | [green] Both generated closures in `build-runtime.mjs` (`:274` and `:307`) widen to pass `provenance` as the 8th argument; `dist/` rebuilt via `node pdlc/workflows/build-runtime.mjs` and the consumer copy refreshed via `pdlc/hooks/scripts/sync-workflows.sh`, so `--check` exits 0 both ways (AT-5.3, AT-6.1) | `pdlc/workflows/__tests__/runtimeProvenanceWiring.test.js` | `pdlc/workflows/build-runtime.mjs`, `pdlc/workflows/dist/` | 7 | T55, T39, T42 | ⬚ |
| T45 | B | [green] E-4b split: `bin/pdlc.mjs` becomes the dependency-free guard (floor comparison, refusal, promise-chained `import("./cli.mjs")`, header comment stating the Node-12.17 subset **and** its reason); `bin/cli.mjs` created carrying the body verbatim except the exported `main(argv = process.argv, deps)` behind an entry guard and the exported five-key `deps`; registers the below-floor message per §10.3 **subject to the erratum raised against TSPEC §10.3/§9.3**; creates `provenance-path.test.js` red-first with the inert-import and exported-`main`/`deps` assertions (AT-2.4) | `pdlc/engine/__tests__/bin-guard-structure.test.js`, `pdlc/engine/__tests__/provenance-path.test.js` | `pdlc/engine/bin/pdlc.mjs`, `pdlc/engine/bin/cli.mjs`, `pdlc/engine/__tests__/provenance-path.test.js`, `pdlc/engine/lib/catalogue.mjs` | 8 | T13, T43 | ⬚ |
| T46 | B | [green] `bin/cli.mjs` gains the resolution entry, the `spawnSync` hop with `stdio: "inherit"`, verbatim re-raise of a numeric `status` and `128 + signum` on a signalled child, and the `--version`/`doctor` resolve-but-never-refuse exemption reporting the resolved triple or falling back with `mode: "unresolved"` (AT-1.4, AT-1.1, AT-2.1) | `pdlc/engine/__tests__/launcher.test.js`, `pdlc/engine/__tests__/version-doctor.test.js` | `pdlc/engine/bin/cli.mjs` | 9 | T14, T15, T37, T45 | ⬚ |
| T47 | D | [red] Extend `provenance-path.test.js` with the two legs: process-entry (capture counts asserted first — `=== 1` where reached, `=== 0` where not; `captured[i].provenance`; the exported `deps` key set-equality and five `===` value pins; `process.exitCode`/`stderr` captured and restored) and injection-level (real `runQueueLoop({maxPasses: 2, …})` over a recording module returning `{outcome: "ran"}`, `startup: null`, `_agent`-carrying adapter; `captured.length === 2` and `stopReason === "bound-reached"` asserted **before** the `captured[i]._provenance === p` identity comparison) (AT-5.3, AT-4.2) | `pdlc/engine/__tests__/provenance-path.test.js` | — | 9 | T45 | ⬚ |
| T48 | D | [green] Production carrier wired: `devInjection` gains an 8th key and `queueInjection` a 6th, both `_provenance`; `runDev`/`runQueue`/`runQueueLoop` take a `provenance` argument; `bin/cli.mjs`'s three command-body call sites pass it (including the `--loop` site); `PROP-PARITY-12`'s constants at `seam-contract.test.js:47-63` edited **in this same task**, with `:79-90`'s exclusion list and `UNOVERRIDDEN_IO_SEAMS` left unchanged (AT-5.3, AT-4.2) | `pdlc/engine/__tests__/provenance-path.test.js` | `pdlc/engine/lib/run.mjs`, `pdlc/engine/__tests__/seam-contract.test.js`, `pdlc/engine/bin/cli.mjs` | 10 | T47, T46, T41, T27, T29, T30 | ⬚ |
| T50 | E | [green] Fixture-machine legs in a **new, additive** workflow file (not `pr-tests.yml`, whose five rendered names are BR-7.5's contract — **subject to the erratum raised against TSPEC §12.1**): `npm pack` into a temp prefix with `PATH` scoped to it, install and upgrade legs recording `{resolvedVersion, resolvedStoreEntry}` and asserting inequality on both, the launcher pass-through and signalled-child spawns, AT-2.5 on `node:18-alpine`, and AT-2.6's plugin-tree hash pairing (AT-2.1, AT-2.3, AT-2.4, AT-2.5, AT-2.6) | `pdlc/engine/__tests__/launcher.test.js` | `.github/workflows/fixture-machine.yml`, `pdlc/engine/scripts/fixture-machine.mjs` | 10 | T34, T46, T49 | ⬚ |
| T51 | E | [manual] AT-6.2 observation with recorded, dated evidence: the bundle-side conjunction (run completed and emitted named artifacts; output carries no engine provenance block), **with the limit stated in the evidence document itself** — the conjunction discriminates only on a machine whose installed channels are known independently (AT-6.2) | — | `docs/pdlc-engine-distribution/EVIDENCE-AT-6.2.md` | 11 | T50 | ⬚ |
| T52 | E | [manual] BR-3.9's one-time real-channel publish, recorded and dated: tag pushed, gate and preflight green, pairing record readable via `npm view … pdlcPairing` (AT-3.1, AT-1.5) | — | `docs/pdlc-engine-distribution/EVIDENCE-BR-3.9.md` | 11 | T05, T49, T50 | ⬚ |

## 3. File-ownership manifest

One row per task in §2, and no row without a task — the bijection `validatePlanContract` enforces. `Files` is the union of the task's `Test File` and `Source File` cells: every path a task writes, including test files it creates or edits. Paths are repo-root-relative and subpackage-qualified (`pdlc/engine/…` and `pdlc/workflows/…` are different suites; see §6). A task that writes nothing on disk does not exist — the two `[gate]` tasks own the decision document they append to, and the two `[manual]` tasks own the evidence document they record into.

| Task | Files |
|---|---|
| T01 | `pdlc/engine/__tests__/preflight-baseline.test.js` |
| T02 | `docs/_decisions/DECISIONS-plugin-distribution.md` |
| T03 | `pdlc/engine/__tests__/_doubles.mjs` |
| T04 | `pdlc/workflows/__tests__/helpers/provenanceDoubles.js` |
| T05 | `docs/_decisions/DECISIONS-plugin-distribution.md` |
| T06 | `pdlc/engine/__tests__/store.test.js` |
| T07 | `pdlc/engine/__tests__/resolve-version.test.js` |
| T08 | `pdlc/engine/__tests__/provenance.test.js` |
| T09 | `pdlc/engine/__tests__/plugin-root-notice.test.js` |
| T10 | `pdlc/engine/__tests__/engine-config.test.js` |
| T11 | `pdlc/engine/__tests__/workflow-roots.test.js` |
| T12 | `pdlc/engine/__tests__/update-probe.test.js` |
| T13 | `pdlc/engine/__tests__/bin-guard-structure.test.js` |
| T14 | `pdlc/engine/__tests__/launcher.test.js` |
| T15 | `pdlc/engine/__tests__/version-doctor.test.js` |
| T16 | `pdlc/engine/__tests__/packaging.test.js` |
| T17 | `pdlc/engine/__tests__/ci-arrangement.test.js` |
| T18 | `pdlc/engine/__tests__/docs-uniqueness.test.js` |
| T19 | `pdlc/engine/__tests__/commit-sites.test.js` |
| T20 | `pdlc/workflows/__tests__/provenanceSeam.test.js` |
| T21 | `pdlc/workflows/__tests__/provenanceQueueRow.test.js` |
| T22 | `pdlc/workflows/__tests__/provenanceCommits.test.js` |
| T23 | `pdlc/workflows/__tests__/artifactPaths.test.js` |
| T24 | `pdlc/workflows/__tests__/devModeKinds.test.js` |
| T25 | `pdlc/engine/__tests__/packaging.test.js`, `pdlc/engine/package.json` |
| T26 | `pdlc/engine/__tests__/store.test.js`, `pdlc/engine/lib/store.mjs` |
| T27 | `pdlc/engine/__tests__/provenance.test.js`, `pdlc/engine/lib/provenance.mjs` |
| T28 | `pdlc/engine/__tests__/engine-config.test.js`, `pdlc/engine/lib/run.mjs`, `pdlc/engine/lib/catalogue.mjs` |
| T29 | `pdlc/workflows/__tests__/provenanceSeam.test.js`, `pdlc/workflows/orchestrate-dev.js` |
| T30 | `pdlc/workflows/__tests__/provenanceCommits.test.js`, `pdlc/workflows/orchestrate-queue.js` |
| T31 | `pdlc/engine/__tests__/docs-uniqueness.test.js`, `pdlc/README.md`, `pdlc/engine/README.md` |
| T32 | `pdlc/engine/__tests__/plugin-root-notice.test.js`, `pdlc/engine/lib/skills.mjs`, `pdlc/engine/lib/handshake.mjs`, `pdlc/engine/lib/catalogue.mjs` |
| T33 | `pdlc/engine/__tests__/packaging.test.js`, `pdlc/engine/__tests__/run.test.js`, `pdlc/engine/scripts/prepack.mjs`, `pdlc/engine/.gitignore`, `pdlc/engine/.npmignore` |
| T34 | `pdlc/engine/__tests__/postinstall.test.js`, `pdlc/engine/scripts/postinstall.mjs` |
| T35 | `pdlc/workflows/__tests__/provenanceCommits.test.js`, `pdlc/workflows/orchestrate-dev.js` |
| T36 | `pdlc/workflows/__tests__/provenanceQueueRow.test.js`, `pdlc/workflows/orchestrate-queue.js` |
| T37 | `pdlc/engine/__tests__/resolve-version.test.js`, `pdlc/engine/lib/resolve-version.mjs`, `pdlc/engine/lib/catalogue.mjs` |
| T38 | `pdlc/workflows/__tests__/artifactPaths.test.js`, `pdlc/workflows/orchestrate-dev.js` |
| T39 | `pdlc/workflows/__tests__/provenanceQueueRow.test.js`, `pdlc/workflows/orchestrate-queue.js` |
| T40 | `pdlc/engine/__tests__/startup-announce.test.js`, `pdlc/engine/lib/startup.mjs` |
| T41 | `pdlc/engine/__tests__/workflow-roots.test.js`, `pdlc/engine/lib/run.mjs`, `pdlc/engine/lib/catalogue.mjs` |
| T42 | `pdlc/workflows/__tests__/devModeKinds.test.js`, `pdlc/workflows/orchestrate-dev.js` |
| T43 | `pdlc/engine/__tests__/update-probe.test.js`, `pdlc/engine/lib/store.mjs`, `pdlc/engine/lib/catalogue.mjs` |
| T44 | `pdlc/workflows/__tests__/runtimeProvenanceWiring.test.js`, `pdlc/workflows/build-runtime.mjs`, `pdlc/workflows/dist/` |
| T45 | `pdlc/engine/__tests__/bin-guard-structure.test.js`, `pdlc/engine/__tests__/provenance-path.test.js`, `pdlc/engine/bin/pdlc.mjs`, `pdlc/engine/bin/cli.mjs`, `pdlc/engine/lib/catalogue.mjs` |
| T46 | `pdlc/engine/__tests__/launcher.test.js`, `pdlc/engine/__tests__/version-doctor.test.js`, `pdlc/engine/bin/cli.mjs` |
| T47 | `pdlc/engine/__tests__/provenance-path.test.js` |
| T48 | `pdlc/engine/__tests__/provenance-path.test.js`, `pdlc/engine/__tests__/seam-contract.test.js`, `pdlc/engine/lib/run.mjs`, `pdlc/engine/bin/cli.mjs` |
| T49 | `pdlc/engine/__tests__/ci-arrangement.test.js`, `pdlc/engine/__tests__/packaging.test.js`, `.github/workflows/publish.yml`, `pdlc/engine/scripts/publish-preflight.mjs` |
| T50 | `pdlc/engine/__tests__/launcher.test.js`, `.github/workflows/fixture-machine.yml`, `pdlc/engine/scripts/fixture-machine.mjs` |
| T51 | `docs/pdlc-engine-distribution/EVIDENCE-AT-6.2.md` |
| T52 | `docs/pdlc-engine-distribution/EVIDENCE-BR-3.9.md` |
| T53 | `pdlc/engine/__tests__/postinstall.test.js` |
| T54 | `pdlc/engine/__tests__/startup-announce.test.js` |
| T55 | `pdlc/workflows/__tests__/runtimeProvenanceWiring.test.js` |

`pdlc/workflows/dist/` is a **directory** entry, owned whole by T44: a directory entry collides with everything beneath it, so no other task may write any generated artifact under it. That is the intent — the directory is regenerated as one unit by `node pdlc/workflows/build-runtime.mjs`, and the consumer copy under `.claude/workflows/` is untracked and therefore owned by no task at all.

## 4. Task dependency notes

## 5. Integration points

## 6. Batch-safety rules honoured

## 7. Definition of Done
