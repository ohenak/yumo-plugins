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
| A — Version resolution | `lib/store.mjs`, `lib/resolve-version.mjs`, the three-way `readEngineConfig`, the two-root workflow-module resolver, the inert `UpdateProbe`, and the **eleven** catalogue ids they emit (T28 1, T32 1, T37 7, T41 1, T43 1; the twelfth, `node.below-floor`, is stream B's T45) | §6, §10.1, §10.3 |
| B — Launcher | The E-4b split (`bin/pdlc.mjs` becomes a dependency-free Node-floor guard; the body moves to `bin/cli.mjs` with an exported `main(argv, deps)` and an exported five-key `deps` seam), then the resolution entry, the `spawnSync` hop, the `--version`/`doctor` resolve-but-never-refuse exemption, and the twelfth catalogue id (`node.below-floor`) | §6.2, §9.3 |
| C — Packaging & publish | Manifest edits, the licence discharge, `prepack` vendoring plus `.gitignore`/`.npmignore`, `postinstall` store population, the restated anti-fork oracle (AF-1…AF-3), the packed-set equality (PF-4), the stub-channel publish legs (AT-3.2, AT-3.3, AT-3.5, AT-3.6, AT-3.7), the two READMEs, and `.github/workflows/publish.yml` with PF-1…PF-5 | §5, §8, §9.1, §9.2 |
| D — Provenance carriers | `lib/provenance.mjs`, the `_provenance` seam on **both** workflow modules, AC-5.3's four kinds across five commit helpers and five `rewriteStatus` routes, §7.4's `artifactPaths` classes 7–11, the `devInjection`/`queueInjection` wiring, and the regenerated `dist/` bundles | §7, §12.1 |
| E — Fixture machine & manual | The install/upgrade legs (single-machine AT-2.4 **and** two-repo AT-2.3), the launcher pass-through and signalled-child legs, AT-2.5 on a below-floor image, and the three `[manual]` recorded observations (AT-6.2, AT-4.4, BR-3.9) | §12.1, §12.3 |

### 1.2 What is deliberately **not** built here

Per TSPEC §14.3: AC-6.2's bundle-side load root (N-1), BL-03's transcription (N-3), the
range-widening cadence (N-4) and M-ENG-10's change-control tail (N-5). Two operator
obligations *are* scheduled: the npm scope (N-6) as a pure gate task (T02), and the licence
(N-2) as T05, which is **not** a pure gate — it records the decision **and** authors
`pdlc/engine/LICENSE` and `package.json`'s `license` field in the same task, because recording
N-2 flips PK-3 into TSPEC §5.4's expected packed set and a flip without the member leaves PF-4
red (see §4 kind 3).

**REQ-EDIST-06 is delivered in two halves, and only one of them is complete here** (PM round-1
Q-01). AC-6.1 lands fully and mechanically: T44 rebuilds `dist/`, refreshes the consumer copy
and asserts both `--check` exits under AT-6.1's fresh-clone precondition. AC-6.2 lands as a
**limited manual observation** (T51) and not as a discriminating test: with N-1 unbuilt there is
no run-bound load-root observation on the bundle side, so the recorded evidence asserts only
FSPEC AT-6.2's conjunction and states that limit in the evidence document itself. Read as a
product statement: REQ-EDIST-06 is fully delivered for AC-6.1 and **partially** delivered for
AC-6.2 in Phase 1, with the remainder carried by N-1.

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

## 2. Tasks and batches

One table, machine-parsed. `#` ids are bare (never bold) and are spelled identically in the
`Deps` column. `Batch` is derived mechanically as `max(batch of deps) + 1`, sources at batch 1.
Test-only rows carry `—` in `Source File`; gate and `[manual]` rows carry `—` in `Test File`.
`[Fake first]` marks test-double creation. `[red]` marks a failing-test task; every `[green]`
row names its `[red]` row in `Deps` — **with one carved-out exception: T19 and T57 are standing
guards**, green at authoring time because they assert a property HEAD already satisfies and this
feature must not break. A standing guard has no `[red]` predecessor by construction; it is
marked `[green] [standing guard]` and carries its own falsifier instead (§4 kind 1).

**Acceptance-test ids are FSPEC's `AT-` namespace, never REQ's `AC-` numbering** (PM round-1
F-01). The two are offset: FSPEC `AT-2.4` is *(AC-2.3)*, `AT-2.5` is *(AC-2.4)*, `AT-1.5` is
*(AC-1.2)*, `AT-1.6` is *(AC-1.4)*, `AT-6.1` is *(AC-6.1)* the bootstrap-commands test. Every
citation in §2 and §7 resolves in FSPEC §8's enumeration; where a row traces to a REQ criterion
that FSPEC does not carry as a named test, it is written `AC-n.m` explicitly. §2.1 is the
resulting `AT-id → task` traceability table, and it is a set-equality against FSPEC §8, not a
sample.

| # | Stream | Task | Test File | Source File | Batch | Deps | Status |
|---|---|---|---|---|---|---|---|
| T01 | — | P1-00 pre-flight gate over the BL-PREREQ symbols this feature extends, in **two halves with two different oracles** — existence only, never shape. (a) **Exported half, asserted by real `import` + `typeof === "function"`**: `devInjection`, `queueInjection`, `readEngineConfig` (`lib/run.mjs:80`/`:114`/`:177`), `WORKFLOW_MODULE_URLS`, `runDev`/`runQueue`/`runQueueLoop` (`:381`/`:422`/`:478`), `resolvePluginRoot` (`lib/skills.mjs:204`), `runStartupChecks` (`lib/startup.mjs:319`), and the workflow modules' `rewriteStatus` (`orchestrate-queue.js:1522`), `updateQueueStatus` (`:415`), `ensureEvidenceColumn` (`:559`), `commitPaths` (`orchestrate-dev.js:10408`), `buildA5SeamOps` (`:2743`), `reviewLoop` (`:6183`). (b) **Module-internal half, asserted by source-anchored presence and stated as such** — these are *not* exported at HEAD and a literal import assertion over them is red forever (TE round-1 F-06): `appendApprovalAnchors` (`orchestrate-dev.js:6660`), `commitQueueRow` (`orchestrate-queue.js:1598`), `commitAdvisoryRecord` (`:1637`), `writeEvidenceCarryingRow` (`:491`) | `pdlc/engine/__tests__/preflight-baseline.test.js` | — | 1 | — | ⬚ |
| T02 | C | [gate] Operator records the npm scope (N-6, O-8 blocker 2) as a decision entry. Unblocks PF-3, §5.1's `name` and §9.1's README literal | — | `docs/_decisions/DECISIONS-plugin-distribution.md` | 1 | — | ⬚ |
| T03 | — | [Fake first] Shared engine-side doubles module: S-1 store listings, S-2 config results (`absent`/`no-pin`/`unreadable`), S-3 launcher descriptor recorder, S-4 probe doubles (inert/failing/succeeding), S-5 publish-channel stub (consumed by T58 and T49 — see §4 kind 2), S-6 `NO_PROVENANCE` + populated frozen `Provenance`, the five `deps` recorders with TSPEC §9.3's named return shapes, and **S-7, the seeded generators** the generated-input rows draw from: `genVersionString()` (well-formed, prerelease, empty, non-semver, path-traversing), `genConfigShape()` over §6.4's branch space, and `genQueueTable()` (ragged rows, trailing pipes, CRLF, absent/present `Evidence`/`Engine` columns). Each generator takes an explicit seed and the failing case prints it (TE round-1 F-12) | `pdlc/engine/__tests__/_doubles.mjs` | — | 1 | — | ⬚ |
| T04 | — | [Fake first] Shared module-side doubles: populated frozen `Provenance`, recording `_git`/`_appendFile`/`_readFile` seams, `QUEUE.md` table fixtures (no-columns, `Evidence`-only, both-columns) | `pdlc/workflows/__tests__/helpers/provenanceDoubles.js` | — | 1 | — | ⬚ |
| T05 | C | [gate+green] Licence discharge (N-2, O-8 blocker 3) as **one atomic task**: the operator records the licence decision, **and the same task** authors `pdlc/engine/LICENSE` with that licence's text and sets `package.json`'s `license` field to the matching SPDX id (replacing `"UNLICENSED"`, `package.json:11`). Recording N-2 is what flips PK-3 into TSPEC §5.4's expected packed set (`TSPEC:380-382`), so the flip and its member must land together or PF-4 is red for every batch in between (TE round-1 F-02); ordered after T25's manifest edits so `package.json` has one writer per batch. No test file of its own: T16's PF-4 is the assertion, and TSPEC's design is deliberate — PK-3's boolean is read from the decision record, never inferred from the tree under audit, so landing the licence needs no oracle edit | — | `docs/_decisions/DECISIONS-plugin-distribution.md`, `pdlc/engine/LICENSE`, `pdlc/engine/package.json` | 4 | T02, T16, T25 | ⬚ |
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

## 4. Task dependencies — notes on the edges

Every edge in §2's `Deps` column is one of five kinds. This section names the kind for the edges that are not self-evident, so a reviewer can check the graph rather than re-derive it.

**Kind 1 — red-before-green.** A `[red]` test task always precedes the `[green]` task that satisfies it, as an explicit `Deps` edge (never merely a lower batch number). The eleven pairs:

| Red | Green | What goes from failing to passing |
|---|---|---|
| T06 | T26 | `lib/store.mjs` exists and lists `$PDLC_HOME/versions/` |
| T07 | T37 | the seven-branch resolution ladder |
| T08 | T27 | `lib/provenance.mjs` and the frozen `Provenance`/`NO_PROVENANCE` values |
| T09 | T32 | `resolvePluginRoot`'s `devDeclared` + `notices` extension |
| T10 | T28 | `readEngineConfig`'s unreadable branch and its message id |
| T11 | T41 | the two-root workflow-module resolver |
| T12 | T43 | `UpdateProbe` and its inert default |
| T13 | T45 | the `bin/pdlc.mjs` / `bin/cli.mjs` split and the Node floor |
| T14 | T46 | the `spawnSync` launcher hop and its exit-code arithmetic |
| T15 | T46 | `--version` / `doctor` resolving without ever refusing |
| T16 | T25, T33 | `package.json`'s `files` allow-list (T25), then `prepack` + `.npmignore` (T33) |
| T17 | T49 | `publish.yml`'s job arrangement |
| T18 | T31 | the READMEs' single-source-of-truth split |
| T53 | T34 | `scripts/postinstall.mjs` populating the version store |
| T54 | T40 | `runStartupChecks` surfacing notices and the resolution announcement |
| T20 | T29 | the workflow modules' `_provenance` seam, kinds 1–2 |
| T21 | T36, T39 | the `Engine` queue column (T36 writes it, T39 threads it) |
| T22 | T30, T35 | provenance reaching the commit helpers, queue side then dev side |
| T23 | T38 | `artifactPaths` classes 7–11 |
| T24 | T42 | `_recordQueueRow`'s `provenance` key |
| T55 | T44 | `build-runtime.mjs`'s two generated closures widening to 8 arguments |

T16 and T21–T24 each fan out to more than one green task because the red test states a conjunction that no single ownership-disjoint edit can satisfy; the edges make the ordering explicit rather than leaving it to batch arithmetic.

**Kind 2 — shared prerequisite.** T01 (pre-flight gate) and T03 / T04 (the two doubles modules) are batch-1 tasks that many later tasks read but none re-write. Every engine-side test task depends on T03 and, where it asserts against a HEAD symbol, on T01; every module-side test task depends on T04. This is the "shared prerequisites owned by exactly one batch-1 task" rule: `_doubles.mjs` has one author (T03) and `provenanceDoubles.js` has one author (T04), for the whole plan.

**Kind 3 — decision gate.** T02 (npm scope) and T05 (licence) write no code. T02 unblocks anything that must spell the package name: T25's `name` field, T31's README literals, and — transitively, through T25 — T49's preflight. T05 gates only the first *real* publish (T52), because PK-3's expected packed set contains the licence file; nothing in the fixture machine needs it, which is why T50 does not depend on T05.

**Kind 4 — serialisation on a shared file.** Where several tasks edit one file, the edges force a total order rather than a partial one, because two tasks in the same batch may not both write it. Three chains carry most of this:

- `pdlc/engine/lib/catalogue.mjs`: T28 → T32 → T37 → T41 → T43 → T45, one message-registering task per batch across batches 3–8. The file is touched by six tasks and never by two in the same batch.
- `pdlc/workflows/orchestrate-dev.js`: T29 → T35 → T38 → T42, batches 3, 4, 5, 6.
- `pdlc/workflows/orchestrate-queue.js`: T30 → T36 → T39, batches 3, 4, 5.

Two shorter chains: `lib/run.mjs` is written by T28 (b3), T41 (b6) and T48 (b10); `bin/cli.mjs` by T45 (b8), T46 (b9) and T48 (b10). The `provenance-path.test.js` file is created by T45 (b8), extended by T47 (b9), and read-and-extended by T48 (b10) — three batches, three writers, never concurrent.

**Kind 5 — real ordering, not file contention.** A few edges exist because the later task's *subject matter* does not exist yet, even though the files are disjoint:

- T37 → T41 and T41 → T43: the resolver, the module roots and the update probe are independent files, but each later message id is registered against the catalogue shape the previous one left, and §10.3's suite-wide oracle fails on a registered-but-unemitted id (`pdlc/engine/__tests__/_assert-suite-wide.mjs:195-213`). Batching them apart is what keeps that oracle green at every batch boundary rather than only at the end.
- T43 → T45: the below-floor id is the last one registered, and T45 is where `bin/cli.mjs` first exists to emit it.
- T33 → T49 and T34 → T49: `publish.yml` re-asserts PF-4 and PF-5 against a tarball that only `prepack` (T33) can produce, and its `publish` job's shape mirrors what `postinstall` (T34) will do on the consumer side.
- T46 → T50 and T49 → T50: the fixture machine spawns the real launcher and installs a real pack, so both must be finished code before it can observe anything.
- T50 → T51 and T50 → T52: the two `[manual]` observations record evidence *from* the fixture machine's runs; they cannot precede it.
- T47 → T48: T47's process-entry leg asserts the exported `deps` key set on `bin/cli.mjs` before T48 adds the `_provenance` keys to `devInjection`/`queueInjection`; running them in one batch would let the key-set assertion pass for the wrong reason.

**No cycles.** The graph is a DAG: every edge points from a lower batch to a strictly higher one, which `computeTopologicalBatches` re-derives independently in Phase P. Any edge added later that violates `Batch = max(batch of deps) + 1` will be rejected there, not discovered in Phase I.

## 5. Integration points

Seven places where this feature's tasks meet machinery that already exists at HEAD. Each names the file and line an implementer will actually open.

**1. The engine test suite collects new files automatically.** `pdlc/engine/__tests__/_run-suite.mjs` mints a run id, empties the run directory, and spawns `node --test … __tests__/`, so any new `*.test.js` under `pdlc/engine/__tests__/` is picked up with no registration step; leading-underscore modules (`_doubles.mjs`, `_bootstrap.mjs`, `_assert-suite-wide.mjs`) are not collected. `suite-spine.test.js` reads the directory listing dynamically, so the eighteen new test files in §2 do not require editing it. Consequence for §2: the plan never contains a "register the new test" task, because there is nothing to register.

**2. The suite-wide message oracle fails in both directions.** `pdlc/engine/__tests__/_assert-suite-wide.mjs:195-213` (`checkMessageCatalogue`) compares the ids `messageIds()` registers against the ids the run actually emitted, and pushes a failure for *either* an emitted-but-unregistered id or a registered-but-never-emitted one. This is the single strongest constraint on the shape of §2: a task may not register a message id in one batch and emit it in a later one. Every catalogue-touching task (T28, T32, T37, T41, T43, T45) therefore registers *and* emits within itself. The erratum raised against TSPEC §10.3 concerns exactly this: `node.below-floor` is registered in `lib/catalogue.mjs` but the guard that would emit it (`bin/pdlc.mjs`, three static top-level statements) cannot import the catalogue.

**3. `seam-contract.test.js`'s constants are a hand-maintained mirror.** `pdlc/engine/__tests__/seam-contract.test.js:47` (`TSPEC_3_1_DEV_SEAMS`) and `:57` (`TSPEC_3_1_QUEUE_SEAMS`) are literal key lists compared by `deepEqual` at `:67` and `:72` against the real injection objects. Adding `_provenance` to `devInjection` (`pdlc/engine/lib/run.mjs:80`) or `queueInjection` (`:114`) reddens those two assertions immediately. T48 owns the widening and the mirror in the same task for that reason; `:79-90`'s exclusion list and `UNOVERRIDDEN_IO_SEAMS` (`:223`) are left alone, and PROP-PARITY-15 (`:277-280`) is unaffected.

**4. The anti-fork oracle currently walks the tree; vendoring replaces it.** `pdlc/engine/__tests__/run.test.js:45-79` asserts that the engine vendors no copy of the workflow modules (C-4) by walking `pdlc/engine/` for matching filenames. Build-time vendoring (DEC-EDIST-01) makes that walk false by construction the moment `prepack` runs locally. T33 replaces the walk with AF-1's *tracked-ness* test — `git ls-files` must list no vendored copy — and extends `PROP-FORK-1` to AF-3's exact-path form. The two edits are one task because the interval between them is a suite that fails for a reason unrelated to the change.

**5. `build-runtime.mjs` generates the closures that call `rewriteStatus`.** `pdlc/workflows/build-runtime.mjs:274` and `:307` emit the queue-driven and in-module call sites of `__queue.rewriteStatus(...)`. Widening `rewriteStatus` to an 8th positional argument (T39) without widening both generated closures leaves the bundles calling the old arity. T44 therefore owns `build-runtime.mjs` **and** the regenerated `pdlc/workflows/dist/`, and its Definition of Done is that `node pdlc/workflows/build-runtime.mjs --check` exits 0 and `pdlc/hooks/scripts/sync-workflows.sh --check` exits 0. Note the ordering the repo documents: build first, sync second.

**6. `pr-tests.yml`'s job names are a frozen contract.** FSPEC §5.1 asserts set-equality over the five rendered job names in `.github/workflows/pr-tests.yml`, and C-5 / BR-7.5 make that set closed. No task in §2 adds a job to that file. T49's `publish.yml` is tag-triggered (`push: tags: ['engine-v*']`) and duplicates the five gate job *bodies* rather than reusing them, precisely so the PR-gate file is untouched. T50's fixture-machine legs go into a new, additive workflow file for the same reason — and that is what the erratum raised against TSPEC §12.1 is about: those legs currently have no stated home that both runs on PRs and leaves the frozen set intact.

**7. The queue table gains a column, additively.** `pdlc/workflows/orchestrate-queue.js` already carries `ensureEvidenceColumn` and two row-write paths inside `updateQueueStatus` — the `evidence == null` quick path and `writeEvidenceCarryingRow`. T36 mirrors that helper as `ensureEngineColumn` and writes the `Engine` cell on **both** paths; a table with neither column, with `Evidence` only, or with both is exercised by T04's fixtures. Existing `QUEUE.md` files without the column keep parsing, which is why this is an integration point and not a migration.

## 6. Batch-safety rules honoured

Stated as claims a reviewer can check against §2 and §3 mechanically.

**Rule 1 — `Batch = max(batch of deps) + 1`.** Holds for all 55 rows. The tasks that make it non-obvious, spelled out: T44 (deps T55 b2, T39 b5, T42 b6 → 7); T43 (T12 b2, T26 b3, T41 b6 → 7); T45 (T13 b2, T43 b7 → 8); T46 and T47 (T45 b8 → 9); T48 (T47 b9, T46 b9 → 10); T50 (T34 b4, T46 b9, T49 b5 → 10); T49 (T17 b2, T25 b3, T33 b4, T34 b4 → 5); T41 (T11 b2, T28 b3, T37 b5 → 6); T42 (T24 b2, T38 b5, T39 b5 → 6); T51 (T50 b10 → 11); T52 (T05 b2, T49 b5, T50 b10 → 11). Batch 1 holds only the four dependency-free tasks (T01–T04).

**Rule 2 — single writer per file per batch.** No file in §3 appears in two rows sharing a batch. The files with the most writers are the ones to check: `lib/catalogue.mjs` (T28 b3, T32 b4, T37 b5, T41 b6, T43 b7, T45 b8 — six writers, six consecutive batches); `orchestrate-dev.js` (T29 b3, T35 b4, T38 b5, T42 b6); `orchestrate-queue.js` (T30 b3, T36 b4, T39 b5); `lib/run.mjs` (T28 b3, T41 b6, T48 b10); `bin/cli.mjs` (T45 b8, T46 b9, T48 b10); `packaging.test.js` (T16 b2, T25 b3, T33 b4, T49 b5); `provenance-path.test.js` (T45 b8, T47 b9, T48 b10); `store.test.js` (T06 b2, T26 b3); `launcher.test.js` (T14 b2, T46 b9, T50 b10). `docs/_decisions/DECISIONS-plugin-distribution.md` has two writers, T02 (b1) and T05 (b2).

**Rule 3 — red-before-green is an explicit `Deps` edge.** Every `[red]` task in §2 is named in the `Deps` cell of the `[green]` task that satisfies it; §4's kind-1 table is the full list. No pair relies on batch ordering alone.

**Rule 4 — shared prerequisites owned by exactly one batch-1 task.** `pdlc/engine/__tests__/_doubles.mjs` is written only by T03; `pdlc/workflows/__tests__/helpers/provenanceDoubles.js` only by T04. Both are batch 1. Later tasks read them and, where a new double is needed, the double is added by the task that needs it *inside its own test file* rather than by re-opening the shared module — which is why neither module reappears in §3 after batch 1.

**Rule 5 — subpackage-qualified paths.** Every path in §2 and §3 is repo-root-relative. `pdlc/engine/` and `pdlc/workflows/` are separate test suites with separate runners (`pdlc/engine/__tests__/_run-suite.mjs` under `node --test`; `pdlc/workflows` under jest), so a bare `run.test.js` or `store.test.js` would be ambiguous between them. No bare basename appears in either table.

**Rule 6 — directory entries own everything beneath them.** `pdlc/workflows/dist/` (T44) is the only directory entry in §3, and no other row names a path under it.

**Rule 7 — the manifest and the task table are in bijection.** 55 tasks in §2, 55 rows in §3, same identifiers, no row without a task and no task without a row — the condition `validatePlanContract` checks after `parsePlanTasks` and `parsePlanOwnership` in Phase P.

## 7. Definition of Done — verification

The plan is done when all of the following hold on `feat-pdlc-engine-distribution`. Each is an observation someone else can repeat, not a judgement.

**Suites.**

1. `cd pdlc/engine && npm test` is green, including the suite-wide oracles: `checkMessageCatalogue` reports no emitted-but-unregistered and no registered-but-unemitted id (`pdlc/engine/__tests__/_assert-suite-wide.mjs:195-213`), and `seam-contract.test.js`'s two `deepEqual`s pass against the widened injections.
2. `cd pdlc/workflows && npm test` is green, with the six new `__tests__/provenance*|artifactPaths|devModeKinds|runtimeProvenanceWiring` files collected by jest and no existing test edited except where §3 names it.
3. `node pdlc/workflows/build-runtime.mjs --check` exits 0, and `pdlc/hooks/scripts/sync-workflows.sh --check` exits 0 — in that order, on a tree with no untracked strays (the document oracles skip only `.git/` and `node_modules/`, so a stray editor backup reddens them for a reason unrelated to this feature).

**Behaviour, at the level the acceptance tests state it.**

4. AT-1.1, AT-1.4: the launcher `exec`s the resolved version, re-raises a numeric child `status` verbatim, and exits `128 + signum` for a signalled child.
5. AT-5.1, AT-5.2, AT-5.4, AT-5.5, AT-5.6: every one of the resolver's branches 0–7 announces, including the inert `update.unavailable` probe and the `PDLC_PLUGIN_ROOT`-ignored notice with its `--dev PDLC_PLUGIN_ROOT=…` remedy.
6. AT-5.3, AT-5.3b, AT-4.2: `_provenance` reaches every commit site and both `QUEUE.md` row-write paths; `provenance-path.test.js` asserts its capture counts *before* its identity comparisons on both legs.
7. AT-2.4: `bin/pdlc.mjs` holds only its dependency-free floor guard and the dynamic `import("./cli.mjs")`; `bin/cli.mjs` exports `main(argv, deps)` and the five-key `deps`, and importing it runs nothing.
8. AT-3.8b, AT-6.1: `git ls-files` lists no vendored copy of the workflow modules, `prepack` produces one, and the two-root resolver loads from the vendor root when it exists and the checkout root otherwise.
9. AT-2.1, AT-2.3, AT-2.5, AT-2.6: the fixture machine installs, upgrades, records two distinct `{resolvedVersion, resolvedStoreEntry}` pairs, passes on `node:18-alpine`, and reproduces the plugin-tree hash pairing.

**Artefacts and evidence.**

10. `.github/workflows/pr-tests.yml` is byte-unchanged: its five rendered job names still satisfy FSPEC §5.1's set-equality (C-5, BR-7.5).
11. `docs/pdlc-engine-distribution/EVIDENCE-AT-6.2.md` and `EVIDENCE-BR-3.9.md` exist, dated, each naming what was observed and — for AT-6.2 — the stated limit of the conjunction as a discriminator.
12. `docs/_decisions/DECISIONS-plugin-distribution.md` carries the npm scope (T02) and the licence (T05); no file in the tree still contains a placeholder for either.

**Not in scope of this plan's done-ness.** N-1, N-3, N-4 and N-5 remain unbuilt by design (§1.2). N-6 and N-2 are discharged as decisions by T02 and T05, not as code. The three errata raised against TSPEC in this phase must be resolved upstream before Phase I begins. Two are against TSPEC and change what T45 and T50 are allowed to write: §10.3's below-floor emission (`node.below-floor` is registered in `lib/catalogue.mjs`, but §9.3's guard admits zero static imports and exactly three top-level statements, so nothing can emit it and `checkMessageCatalogue` fails on the registered-but-unemitted arm — `pdlc/engine/__tests__/_assert-suite-wide.mjs:195-213`), and §12.1's fixture-machine home (the legs are specified to run on PRs, but `pr-tests.yml`'s five rendered job names are closed by C-5 / BR-7.5 and §8's `publish.yml` is tag-triggered, so no stated file runs them). The third is against **FSPEC**, not TSPEC: AT-3.8a still states the packed set equals §5.2's writable classes "member-for-member — the manifest, `bin/pdlc.mjs`, the twelve named `lib/*.mjs` modules" (`FSPEC` §5.2's CLI-entry row calls that "one entry, not a directory of scripts"), which the E-4b split's `bin/cli.mjs` and §3.1's three new `lib` modules both falsify. TSPEC reconciles this in V-03 and §5.4's PK table, and T16 is written against that table — but the acceptance test an implementer reads still names the wrong expected set.
