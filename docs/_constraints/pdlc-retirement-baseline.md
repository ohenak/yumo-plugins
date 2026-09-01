# Measured baseline — pdlc-plugin-retirement surface

Measured at commit `5a7904ca`, 2026-08-17, on `feat-pdlc-plugin-retirement`. Cited by id from
`REQ-pdlc-plugin-retirement.md` (§1.2) and re-derived, not trusted, before the first deletion
commit (that REQ's C-6). Every row is re-derivable with the command in **How to re-measure**.

Corrections re-measured at commit `63166245`, 2026-08-17: M-8's file count (21, not 22 — the
enumeration in its own cell lists 21), M-11k's documentation surface (CLAUDE.md's deep-dive prose
moved to `pdlc/OPERATIONS.md` at `a9b3e78a`; its `### Continuous integration` section restored at
`63166245`), plus new rows M-11l and M-11m. All other rows still re-derive exactly at that commit.

Further corrections re-measured at commit `aaa84e3b`, 2026-08-17: new row **M-11n** (the three
`pdlc/skills/*/SKILL.md` files carrying retired names), M-11l's headings re-quoted verbatim with
`## Continuous integration` added, and A-1's "Files it covers today" column re-derived (it read
"—" for two globs that in fact cover 39 archived documents).

**Partition closed at commit `0e86f11a`, 2026-08-17.** The REQ's C-6 exhaustive-partition clause
was executed for the first time and came back **red on 24 paths**. Those 24 are now classified,
per file, by the new rows **M-11o** and **M-11p**, by the restated **M-8**, **M-11e** and
**M-11h**, and by A-1's new fixture-corpus glob. The result is recorded in **Partition** below:
133 swept paths, 133 classified, remainder empty. Two of the 24 were live code
(`pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/__tests__/waveExecution.test.js`), and
classifying them changed what the M-11h commit class costs — see that row.

**Round-5 corrections re-measured at commit `b73fb4de`, 2026-08-17** (SE F-29/F-30, TE F-02/F-04):
M-11i now carries the edit obligation for `orchestrate-queue.js`'s header banner, the third of
three identical banners, and M-11k's superseded "header prose in the workflow modules" phrase is
dropped; `driftGenerators.js` has **eight** surviving importers, not seven, its consumer-less
exports are enumerated non-exhaustively, and it now sits in **exactly one** class (M-11p) instead
of the two the disposition table read; the partition re-derives 136/136/0/0 at this commit; and
the sweep recipe's relationship to AC-1.2's search term is stated explicitly in its own section
below.

**Erratum correction, 2026-08-18 (REQ v0.13, Phase D erratum 5; SE FSPEC-v11 F-01).** M-11h is a
**prose-and-assertion** edit class, not a value retirement: the configured `postWaveCommand` and
`postWavePathspecs` values survive the sweep, because the reduced build step (M-7) still emits M-9
into `pdlc/workflows/dist/` and still runs under O-3. The M-11h row, the two `waveExecution` /
`consolidationPreflight` disposition rows and the closing sentence of the sweep-recipe section are
corrected accordingly. No path, count or partition total changes — every M-11h path keeps the same
owning class, and 136/136/0/0 still re-derives at `b73fb4de`.

**Erratum correction, 2026-08-18 (REQ v0.14, Phase D erratum 3; SE FSPEC-v11 F-03, TE FSPEC-v11
F-01/F-02).** M-11n's `consolidate-learnings/SKILL.md` obligation is restated: the retired-bundle
reference is **deleted**, not rewritten — no surviving host loads the consolidation module — and
the row now also carries the skill's delegation prose, which the same commit falsifies. The
disposition of that prose is the REQ's O-8 operator decision. Path counts are unchanged: both
obligations sit on the one already-owned path.

## M-rows — artifacts that exist only to serve the workflow-runtime host

| ID | Artifact | Measured (2026-08-17) | Disposition |
|---|---|---|---|
| M-1 | `pdlc/hooks/scripts/sync-workflows.sh` | 32,939 B / 725 lines | delete |
| M-2 | `pdlc/hooks/scripts/lib/pdlc-drift.sh` (sourced library, non-executable by design) | 75,617 B / 1,955 lines | delete |
| M-3 | `pdlc/hooks/scripts/check-workflow-drift.sh` | 19,240 B / 381 lines | delete |
| M-4 | `pdlc/workflows/dist/orchestrate-dev.bundle.js` | 401,716 B | delete |
| M-5 | `pdlc/workflows/dist/orchestrate-queue.bundle.js` | 401,020 B | delete |
| M-6 | `pdlc/workflows/dist/distribution-manifest.json` | 1,464 B / 46 lines | delete |
| M-7 | `pdlc/workflows/build-runtime.mjs` | 831 lines / 33,664 B | reduced — keeps emitting M-9 only |
| M-8 | Candidate dedicated test modules (`bootstrap`, `drift*` ×16, `queueDriftGate`, `runtimeBundle`, `worktreeInclude`, `hookCompatibility`) **plus the six helper files that exist only to serve them**: `helpers/drift{Fixtures,Harness,Probe}.js` and `helpers/bin/{backup-grammar,lib-probe,percent-encode-driver}.sh` | 21 `*.test.js` / 15,109 lines, of 119 `*.test.js` in `pdlc/workflows/__tests__/`; **+ 6 helper files / 2,024 lines** — measured total **27 files / 17,133 lines**. Every importer of the three helper modules, and both referents of `helpers/bin/`, are inside M-8's own 21 (`driftFault`, `driftOrdering` for the shell probes). `helpers/driftGenerators.js` is deliberately **not** in M-8 and is **not** one of the six: **eight** surviving modules import its `seeded`/`resolveSeed`/`shrink` primitives — `approvalHash`, `completeness`, `consolidationPreflight`, `forcePhases`, `pacingWrapper`, `roundDerivation`, `scanLines` and `helpers/mergeDoubles.js:14`. The eighth was missed at the first count because it is a helper rather than a `*.test.js` module; re-derive with `grep -rn 'driftGenerators' pdlc/workflows/__tests__ \| grep import`. Its sole owning class is **M-11p** | delete or re-home per REQ R-8; `driftGenerators.js` is **reduced, not deleted**, and is owned by M-11p, not by M-8 |
| M-9 | `pdlc/workflows/dist/pdlc-cli.mjs` — the document-state probe CLI | 679,956 B | **survives** (REQ NG-2, G-5) |
| M-10 | `pdlc/workflows/dist/consolidate-learnings.bundle.js` | 417,952 B | delete — a workflow-runtime bundle like M-4/M-5 |

`pdlc/workflows/dist/` holds exactly these five files at the measured commit: M-4, M-5, M-6, M-9,
M-10. That set-equality is what the REQ's AC-1.1 asserts against.

## M-11 — named dependents outside the artifacts themselves

| Sub-id | Dependent |
|---|---|
| M-11a | `.github/workflows/pr-tests.yml` jobs `artifact-freshness`, `fresh-clone-bootstrap`, and the index-mode assertions inside `script-syntax` |
| M-11b | `.github/workflows/publish.yml`'s tag-triggered `gate` job — `build-runtime.mjs --check`, the rebuild-diff, the two-command bootstrap, `sync-workflows.sh --check`, and the executable-bit assertions naming all three scripts |
| M-11c | `pdlc/engine/__tests__/ci-arrangement.test.js` — `GATE_JOB_IDS` (job-id set), the CLAUDE.md CI-table set-equality, its prose **count word**, and the `publish.yml`-gate command set-equality |
| M-11d | `pdlc/engine/__tests__/smoke.test.js` — drift-gate blocking case and the `distribution.checkEnabled: false` clearances |
| M-11e | Tracked fixture trees, scoped to the **fixture root**, not the `.claude/workflows/` subtree — the fixtures are repo-shaped, so retired names occur outside it. `pdlc/engine/__tests__/fixtures/consumer-ac12/`: **6** sweep hits — the 5 files of `.claude/workflows/` (`.pdlc-drift-state.json`, `distribution-manifest.json`, `orchestrate-{dev,queue}.bundle.js`, `pdlc-cli.mjs`) **plus `README.md`** (`sync-workflows.sh` at `:7`, the bundle/manifest/drift-state names at `:12`–`:14`). Its only consumer is `fs-observation.test.js` (M-11m), so tree and consumer move in one commit; disposition **deleted with its consumer's retired cases**. `pdlc/workflows/__tests__/fixtures/covered-violations/`: **4** sweep hits — `.claude/workflows/orchestrate-dev.bundle.js`, `docs/design/distribution-manifest.json`, `pdlc/workflows/dist/distribution-manifest.json`, `pdlc/workflows/dist/orchestrate-queue.bundle.js`. This tree serves the **surviving** `coveredViolations` oracle (`documentOracles.test.js`, M-11f), so disposition is **re-fixtured, not deleted** — and re-fixturing is 4 files, not 1 |
| M-11f | `pdlc/workflows/__tests__/documentOracles.test.js` D-2 — asserts `CLAUDE.md` *contains* `check-workflow-drift.sh` and `sync-workflows.sh` |
| M-11g | `lib/document-oracles.mjs` — packaging and advertised-version checks over `pdlc/workflows/dist/`, and the drift scan's generated-tree exemptions |
| M-11h | The wave-gate keys, whose retirement is a **prose-and-assertion edit, not a value retirement and not a mechanism deletion** (corrected at the 2026-08-18 erratum re-measurement; this row previously read "config-value change" and listed the two values as retired). Surviving *values*: `.claude/pdlc.config.example.json`'s `implementation.postWaveCommand` (`node pdlc/workflows/build-runtime.mjs`) and `implementation.postWavePathspecs` (`["pdlc/workflows/dist/"]`), documented in CLAUDE.md, both keep naming live outputs after the sweep — the reduced build step (M-7) still emits M-9 into `pdlc/workflows/dist/` and still runs under O-3, so neither literal names a deleted artifact. What this class edits is the prose around the pair and the two literals asserted at `pdlc/workflows/__tests__/consolidationPreflight.test.js:205`–`:208`, which are re-pinned to whatever surviving path O-3 settles rather than dropped. Surviving *mechanism*: a generic "stage these pathspecs after the post-wave command" facility, implemented in `pdlc/workflows/orchestrate-dev.js` — default `Object.freeze([])` (`:168`), generic parse/validate (`:218`–`:245`), single consumer (`:14416`) — and pinned by `pdlc/workflows/__tests__/waveExecution.test.js` (`:182`, `:208`–`:216`, `:260`–`:277`, and the `postWaveCommand and postWavePathspecs` block at `:813`). Neither is deleted: `orchestrate-dev.js` is the source vendored into `@kaneho/pdlc-engine` and survives, and the mechanism keeps a caller after the sweep because the reduced build step that emits M-9 still runs under O-3. So this class edits **prose and assertions about the pair**, not the pair itself; the parser and its tests stay green unchanged. For the partition, `orchestrate-dev.js` is owned by **M-11o** (its whole-file disposition) and named here only as the mechanism's location, so no path has two owners |
| M-11i | `pdlc/workflows/orchestrate-queue.js`, whose retirement work is **two obligations, not one**: (a) the queue drift gate and its `distribution.checkEnabled` key, and (b) the header banner at `:5`–`:6` — `Built artifact: pdlc/workflows/dist/orchestrate-queue.bundle.js` / `Consumer runtime copy: installed from dist/ by pdlc/hooks/scripts/sync-workflows.sh`, byte-identical in shape to the two banners of M-11o. The module survives (engine-channel vendored source); the banner lines are rewritten exactly as M-11o's are. The banner is named here rather than in M-11o so this path keeps a single owning class per the partition rule. Also: the `SessionStart` drift-reporter entry in `pdlc/hooks/hooks.json` |
| M-11j | `.worktreeinclude` (single row `.claude/workflows/`); `.gitignore`'s `/.claude/workflows/` row **and its 20-line rationale comment above it** |
| M-11k | `pdlc/RELEASE-CHECKLIST.md` (≥4 sections), both READMEs, CLAUDE.md's bootstrap/sync/drift/worktree/distribution-channel prose and its `### Continuous integration` section. Its four swept paths are `CLAUDE.md`, `README.md`, `pdlc/README.md` and `pdlc/RELEASE-CHECKLIST.md`; header prose in the workflow modules was split out to M-11o (and, for `orchestrate-queue.js`, to M-11i) and is no longer claimed here |
| M-11l | `pdlc/OPERATIONS.md` — tracked instructional deep-dive created at `a9b3e78a`. Headings quoted verbatim as they read at HEAD, so a "those sections are gone" check keys on literals and fails on a rename rather than passing vacuously: `## Workflow scripts and the runtime build` (`:5`), `## Continuous integration` (`:57`, whose prose describes the required-check set and its two workflow files), `## When sync skips a row: \`unverified\` and \`--force\`` (`:72`), `## Worktrees` (`:85`, self-created-worktree caveat), `## Distribution scripts` (`:128`, names M-1, M-2, M-3 and their roles). `## The engine channel (\`pdlc/engine\`)` (`:136`) is deliberately **not** in the retired set — it describes the surviving path |
| M-11m | `pdlc/engine/__tests__/fs-observation.test.js` — builds an `orchestrate-dev.bundle.js` path under the consumer workflows dir, and exercises the `distribution.checkEnabled: false` opt-out |
| M-11n | The three tracked `pdlc/skills/*/SKILL.md` files that name retired machinery (added at the 2026-08-17 re-measurement, not allow-listed — each is edited by the sweep). `orchestrate-queue/SKILL.md`: the drift-gate section (`:142`, `:161`, `:165` — `check-workflow-drift`, `sync-workflows.sh`/`--force`, `distribution.checkEnabled: false`) and the artifact list (`:230`, `:231`, `:240`, `:241`). `orchestrate-dev/SKILL.md`: the artifact line (`:93`) and the build/sync paragraph (`:97`). `consolidate-learnings/SKILL.md`: **two obligations, not one** (restated at the 2026-08-18 erratum re-measurement; this row previously scoped the edit to the bundle reference alone and called it a rewrite). (a) The bundle reference is **deleted**, not rewritten: M-10 goes, and no surviving host loads `pdlc/workflows/consolidate-learnings.js` — the engine vendors only `orchestrate-dev.js` and `orchestrate-queue.js` (`pdlc/engine/scripts/publish-preflight.mjs:221`–`:222`) — so there is no surviving execution path for the reference to name. (b) The delegation contract at `:8`–`:18` says the skill delegates the pass to that workflow script and that hand-running it bypasses the `.consolidation-log.md` boundary, deterministic failure-mode-id derivation, duplicate suppression, the guard-set PR route and the in-progress marker; that prose stops being true at the same commit and is edited too. Whether (b) is rewritten as a human-performed in-session pass or held for re-hosting is the REQ's **O-8** operator decision, not a measurement. The file is edited, not allow-listed and not deleted with the skill; both obligations sit on one path, so the partition is unchanged |
| M-11o | **Header prose inside the surviving workflow source modules.** `pdlc/workflows/orchestrate-dev.js:5`–`:6` and `pdlc/workflows/consolidate-learnings.js:5`–`:6` each carry a two-line `Built artifact: … .bundle.js` / `Consumer runtime copy: installed from dist/ by … sync-workflows.sh` banner. These modules are the engine channel's vendored source of truth and **survive**; only the banner lines are rewritten. Split out of M-11k's "header prose in the workflow modules" so the paths are named rather than inferred — they are code files, and AC-1.2's required-empty search reds on a *surviving* module if they are missed. `orchestrate-queue.js` carries a third, identical banner; the file is owned by M-11i, and M-11i's obligation text now names that banner explicitly, so all three banners carry an edit obligation while every path keeps one owning class |
| M-11p | **Assertions about the retired `dist/` artifacts held in test modules that M-8's regex does not reach.** Delete with their subject: `runtimeProvenanceWiring.test.js` (all four cases assert the provenance 8th argument in freshly-built and checked-in `orchestrate-{dev,queue}.bundle.js`; nothing else). Edited, module survives: `advisoryBundle.test.js` (`:179` `SHIPPED_BUNDLES`, `:203` comment, `:210`–`:211` "manifest carries exactly four rows"), `consolidationBuild.test.js` (the `T32`/`T33` blocks at `:41`, `:165`–`:179`, `:290`–`:308` over the consolidation bundle and manifest), `advisoryDisabled.test.js:659` (test title and rationale), `consolidationIdentity.test.js:218` (scope-boundary comment), `orchestrateDevSkill.test.js:93` (asserts `orchestrate-dev/SKILL.md` contains `.claude/workflows/orchestrate-dev.bundle.js` — moves in the same commit as M-11n's `orchestrate-dev/SKILL.md:93`), `helpers/driftGenerators.js` — **owned by M-11p alone** (M-8 names it only to say it is not an M-8 member), reduced rather than deleted. The removed surface is **at least** `C1_PATH` (`:64`), `MANIFEST_CHAIN_VECTORS` (`:268`), `readFaultTokens` (`:495`), `enumerateLeaves` (`:158`), `enumerateEvidenceVectors` (`:305`), `genId` (`:351`) and `genStamp` (`:391`) — every one of whose consumers is inside M-8's deleted set (`driftFault`, `driftBaseline`, `driftBackups`, `queueDriftGate`). That list is **explicitly non-exhaustive**: the TSPEC derives the reduction from a fresh consumer scan at re-measurement time rather than transcribing these names, so an export that loses its last consumer between now and the sweep is still removed. What stays is what the eight surviving importers use: `seeded`, `resolveSeed`, `shrink`. `consolidationPreflight.test.js` is listed under M-11h, not here — its hit is a retired config *value* |

## A-1 — retired-name allow-list (measured 2026-08-17 at `63166245`, extended at `0e86f11a`)

The dependent sweep below (last command in **How to re-measure**) returns, besides the
machinery's own files, the two fixture trees of M-11e, the three skill files of M-11n, this
feature's own artifacts and the
delivered-feature archive and `docs/_queue/QUEUE.md`, exactly nine other tracked documents. They are historical or
superseding records, not instructions, so they are excluded from the REQ's AC-1.2
required-empty search by these path globs.

The globs **may overlap** — `**/LEARNINGS-*.md` and `**/POSTMORTEM-*.md` cover four files that
`docs/completed/**` already covers. A-1 membership is therefore "matched by at least one glob",
not "matched by exactly one"; the partition's exactly-one obligation is over the three *classes*
(M-row, M-11 row, A-1), not over the globs inside A-1.

| Glob | Why excluded | Files it covers today |
|---|---|---|
| `docs/completed/**` | delivered-feature archive | 39 files at 2026-08-17 |
| `docs/discarded/**` | abandoned drafts, kept as record | 3 files |
| `docs/_decisions/**` | decision record; a superseded decision must name what it supersedes | `DECISIONS-plugin-distribution.md` |
| `docs/_constraints/pdlc-retirement-baseline.md` | this file — the measured inventory itself | this file |
| `**/LEARNINGS-*.md`, `**/POSTMORTEM-*.md` | post-mortem record of work already done | 4 sweep hits, all inside `docs/completed/**` and so doubly covered (see the overlap note above) — the glob is kept for harvests landing outside the archive |
| `pdlc/workflows/__tests__/fixtures/CODE_REVIEW-*.md`, `pdlc/workflows/__tests__/fixtures/planParse/**` | **Sample data transcribed from delivered features' documents**, not instructions: the surviving `artifactLint`/`dodPhase`/`planOwnership`/`planParse` suites parse them as *input corpora*, so editing them to drop a retired name changes what those parsers are proven against for a reason that is not this feature's. Deliberately narrow — it names two corpora, not `__tests__/fixtures/**`, which would wrongly exempt M-11e's `covered-violations/` tree that the sweep must re-fixture | `CODE_REVIEW-pdlc-consolidation-agent-v5.md` (`sync-workflows.sh --check` at `:211`), `CODE_REVIEW-pdlc-consolidation-agent-v6.md` (same at `:196`), `planParse/plan-workflow-distribution.excerpt.md` (7 hits; an excerpt of the shipped `PLAN-pdlc-workflow-distribution.md`) |
| `pdlc/workflows/__tests__/fixtures/decision-corpus/**` | **Sample data transcribed from delivered features' documents**, the same class as the two corpora above: pdlc-decision-ledger's T-03 fixture is a frozen, path-preserving copy of the 25 in-scope `DECISIONS-*.md` files at Baseline v1.2's `8c673a09f`, parsed by the `decisionLedger*` suites as an *input corpus*; its integrity guard (`decisionLedgerFixtureGuard.test.js`) pins per-file digests, so editing a copy to drop a retired name both changes what the parser is proven against and reds the guard. Every original is already allow-listed at its live path (`docs/_decisions/**`, `docs/completed/**`, `docs/discarded/**`, the feature directories). Scoped to the one corpus, not `__tests__/fixtures/**`, for the same reason as the row above; added 2026-08-31 when the fixture first sweep-hit | 6 files at 2026-08-31: the copies of `DECISIONS-plugin-distribution.md` and of the `pdlc-advisory-tier`, `pdlc-advisory-wave-gate`, `pdlc-consolidation-agent`, `pdlc-engine-distribution` and `pdlc-plugin-retirement` DECISIONS files — copies of paths the sweep already returns at their originals; grows only if a newly-hit original's copy is in the frozen 25 |
| `docs/_queue/QUEUE.md` | queue prose, governed instead by the REQ's AC-2.3 | `QUEUE.md` |
| `docs/pdlc-plugin-retirement/**` | this feature's own artifacts | 9 files at `0e86f11a` (the REQ and eight cross-reviews; 7 before round 4's two landed) |
| `docs/pdlc-advisory-wave-gate/**` | the advisory-wave-gate feature's own artifacts. Its subject matter *is* the wave gate's rebuild-and-stage discipline (DEC-08), so its REQ/FSPEC/TSPEC/PLAN/PROPERTIES/DECISIONS and cross-reviews necessarily quote `pdlc/workflows/dist/` bundle filenames and the drift-state path when they reason about what the gate stages and what A6 may not touch. Editing them to drop the names would falsify the specification of a shipped behaviour. Scoped to the one feature directory, deliberately not `docs/*/**`, which would exempt every future feature's docs wholesale | 19 tracked files at the CODE_REVIEW v1 re-measure: 17 hit on the bundle-filename term, 14 on the drift-state term, 2 on the sync-script term; no file hits the other four terms. Like `docs/pdlc-plugin-retirement/**` this set grows by one file per cross-review round, which is why the pinned expectation is an empty remainder, never a total |
| `docs/pdlc-learnings-injection/**` | that feature's TSPEC and cross-reviews name `.pdlc-drift-state.json` descriptively — as the untracked-file hazard for `coveredViolations`' tree walk — never as a surviving integration; added 2026-08-20 when its documents first sweep-hit | 4 files at 2026-08-20 (the TSPEC and three test-engineer cross-reviews); grows with that feature's reviews |
| `docs/pdlc-engineering-loop/**` | that feature's REQ cross-reviews quote `pdlc-drift-state`, `sync-workflows` and `distribution.checkEnabled` descriptively — arguing that its AC-3.1 was grounded in the retired distribution mechanism and must be restated against the surviving engine channel — never as a surviving integration; added 2026-08-24 when its documents first sweep-hit | 3 files at 2026-08-24 (`CROSS-REVIEW-software-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v2.md`); grows with that feature's reviews |
| `docs/PLAN-*.md`, `docs/design/**`, `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` | planning documents of already-shipped features; the third entry is that one file's literal path, deliberately not a `docs/*/PLAN-*.md` wildcard, which would also exempt a future feature's PLAN that re-introduces a retired name | `docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/design/MASTER-PLAN-engineering-loop.md`, `docs/design/PROMPT-dev-orchestrate-dev-optimization.md`, `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` |
| `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` | routed upstream, TSPEC §6.1 erratum 4 — the sweep's own removal tool; its expected-name set is the retired vocabulary by construction (BR-CLN-3a) | 1 file, landed at `f530a359` — M-11o's fragment-assembly (`:24`–`:34`) splits each retired name across concatenated string literals, so the source text no longer sweep-hits; re-measured absent from L-3's 118-path output |
| `pdlc/workflows/__tests__/consumerCleanup.test.js` | routed upstream, TSPEC §6.1 erratum 4 — the tool's oracle; its fixtures must reproduce the same nine names to be a test of it | 1 file, landed at `f530a359` — same fragment-assembly discipline applied (`:60`–`:65`), so the source text no longer sweep-hits; re-measured absent from L-3's 118-path output |
| `docs/pdlc-wave-resume/**` | this feature's own artifacts. Its subject matter *is* the retired sweep/gate mechanism, so its TSPEC, PLAN, PROPERTIES and cross-reviews necessarily quote `distribution.checkEnabled` and the other L-2 terms while documenting their retirement. Scoped to the one feature directory, deliberately not `docs/*/**`, which would exempt every future feature's docs wholesale. Like `docs/pdlc-plugin-retirement/**` and `docs/pdlc-advisory-wave-gate/**`, this set grows by one file per cross-review round, which is why the pinned expectation is an empty remainder, never a total | 15 files at re-measure: TSPEC, PLAN, PROPERTIES, POSTMORTEM, and eleven cross-reviews |

**Two allow-listed files must survive still carrying the retired names**:
`docs/_decisions/DECISIONS-plugin-distribution.md` (its superseding entry, required by the
REQ's BL-06 and AC-2.3, necessarily names the channel it supersedes) and this file (the REQ's
C-6 re-measurement and AC-1.3 depend on it). Without the allow-list those two obligations and
the required-empty search could not both be satisfied.

## Partition — the sweep's whole output, classified (run at `0e86f11a`, 2026-08-17)

The REQ's C-6 requires every path the dependent sweep returns to fall in exactly one of three
classes — an M-row, an M-11 row, or A-1 — with the unclassified remainder **empty**. Executed at
`0e86f11a` the sweep returned **133** tracked paths with remainder **0**; re-run at `b73fb4de` it returns **136** with remainder **0** and zero multi-owned paths. The three added paths are this feature's own round-5 cross-reviews and Phase-R post-mortem, all under A-1's `docs/pdlc-plugin-retirement/**` glob:

| Class | Paths | Notes |
|---|---|---|
| M-1 … M-7, M-9, M-10 | 9 | one file each |
| M-8 | **24** = 18 `*.test.js` + 6 helper files | 3 of M-8's 21 `*.test.js` (`driftHelpers`, `driftMessageSplit`, `worktreeInclude`) carry **no** retired name and so never appear in the sweep; they are still deleted with their class. The 6 helper files are M-8's dedicated ones only. `driftGenerators.js` was previously counted here **and** in M-11p, which C-6 forbids; it is now M-11p's alone |
| M-11a … M-11n | **30** | M-11c is **0** — `ci-arrangement.test.js` names the job ids, not the retired artifacts, so it is a real dependent the sweep does not reach; M-11j is **1** (`.worktreeinclude` likewise names `.claude/workflows/`, not a swept term). M-11e is **10** (6 + 4, at the re-measured tree-root extents). Per-row at `b73fb4de`: M-11a 1, M-11b 1, M-11c 0, M-11d 1, M-11e 10, M-11f 1, M-11g 1, M-11h 3, M-11i 2, M-11j 1, M-11k 4, M-11l 1, M-11m 1, M-11n 3 |
| M-11o | 2 | `orchestrate-dev.js`, `consolidate-learnings.js` |
| M-11p | **7** | `runtimeProvenanceWiring`, `advisoryBundle`, `advisoryDisabled`, `consolidationBuild`, `consolidationIdentity`, `orchestrateDevSkill`, plus `helpers/driftGenerators.js` (single owner, reduced not deleted) |
| A-1 | **61** at `0e86f11a`, **64** at `b73fb4de` | 39 `docs/completed/**`, 3 discarded, 3 fixture corpora, 1 decision, 1 `QUEUE.md`, this file, 4 planning, and this feature's own directory — 9 files at `0e86f11a`, 12 at `b73fb4de`. Only the feature-directory glob moved: it grows by one file per cross-review, which is why the pinned expectation is an **empty remainder**, never the total |
| **Total** | **9 + 24 + 30 + 2 + 7 + 61 = 133** at `0e86f11a`; **9 + 24 + 30 + 2 + 7 + 64 = 136** at `b73fb4de` | equals the sweep at each commit |
| **unclassified** | **0** | at both commits |

Every path falls in **exactly one** class: the run also reported zero multi-class paths, which
is what makes "exactly one of" in C-6 a checkable statement rather than a description. Two rows
carry a caveat worth reading before the sweep: M-11c and `.worktreeinclude` are dependents the
sweep **cannot** find, because they name job ids and a consumer directory rather than any retired
artifact name. The sweep is therefore a lower bound on the dependent set, not the definition of
it — its use is to prove no *unknown* path exists, and the inventory still has to carry the ones
no search term reaches.

The 24 paths that were unclassified before this closure, and where each now lands:

| Path(s) | Class | Disposition |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/consolidate-learnings.js` | M-11o | survive; header banner rewritten. `orchestrate-dev.js` additionally hosts M-11h's generic parser (`:168`, `:218`–`:245`, `:14416`), which is **not** removed |
| `__tests__/waveExecution.test.js` | M-11h | survives; the parser's tests keep running — neither the mechanism nor the configured value is retired |
| `__tests__/consolidationPreflight.test.js` (`:205`–`:208`) | M-11h | edited: re-pins the **surviving** `postWavePathspecs` value to the path O-3 settles |
| `__tests__/runtimeProvenanceWiring.test.js` | M-11p | deleted with M-4/M-5 |
| `__tests__/{advisoryBundle,advisoryDisabled,consolidationBuild,consolidationIdentity,orchestrateDevSkill}.test.js` | M-11p | edited; modules survive |
| `__tests__/helpers/drift{Fixtures,Harness,Probe}.js`, `helpers/bin/{backup-grammar,lib-probe,percent-encode-driver}.sh` | M-8 | deleted with M-8 (no surviving importer) |
| `__tests__/helpers/driftGenerators.js` | M-11p | **reduced**, not deleted — 8 surviving modules import it |
| `pdlc/engine/__tests__/fixtures/consumer-ac12/README.md` | M-11e | deleted with its fixture root |
| `covered-violations/{docs/design/distribution-manifest.json, pdlc/workflows/dist/distribution-manifest.json, pdlc/workflows/dist/orchestrate-queue.bundle.js}` | M-11e | re-fixtured with the tree |
| `__tests__/fixtures/CODE_REVIEW-pdlc-consolidation-agent-v{5,6}.md`, `__tests__/fixtures/planParse/plan-workflow-distribution.excerpt.md` | A-1 | allow-listed: input corpora of surviving parsers |

## How to re-measure

```sh
git rev-parse --short HEAD
wc -c pdlc/hooks/scripts/sync-workflows.sh pdlc/hooks/scripts/lib/pdlc-drift.sh \
      pdlc/hooks/scripts/check-workflow-drift.sh pdlc/workflows/dist/*
wc -l pdlc/workflows/build-runtime.mjs
ls pdlc/workflows/dist/                                   # M-row set-equality
ls pdlc/workflows/__tests__/*.test.js | wc -l              # suite size
git ls-files pdlc/workflows/__tests__ \
  | grep -E '/(bootstrap|drift[A-Za-z0-9]*|hookCompatibility|queueDriftGate|runtimeBundle|worktreeInclude)\.test\.js$' \
  | xargs wc -l                                            # M-8 file count and line total
grep -rln 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled\|postWavePathspecs' \
  $(git ls-files)                                          # dependent sweep
```

Then run the partition (REQ C-6). Write the sweep to `sweep.txt`, write one file per line the
**union** of every path claimed by an M-row, an M-11 row and A-1 to `claimed.txt`, and diff:

```sh
comm -23 <(sort -u sweep.txt) <(sort -u claimed.txt)   # unclassified remainder — must be empty
comm -13 <(sort -u sweep.txt) <(sort -u claimed.txt)   # claimed but unswept — expected: M-11c,
                                                       # .worktreeinclude, M-8's 3 clean modules
sort claimed.txt | uniq -d                             # multi-owned paths — must be empty
```

At `0e86f11a` the first and third commands print nothing and the sweep totals 133. Re-run at
`b73fb4de` the first and third commands print nothing and the sweep totals 136.

## The sweep recipe and AC-1.2's search term are two commands, and the delta is owned

They are not the same command, and the REQ no longer implies they are. The **sweep recipe**
above (the last command in **How to re-measure**) is the partition's control and carries eight
alternations. The REQ's **AC-1.2 search** is a required-empty gate and carries the same eight
**minus `postWavePathspecs`** — seven alternations:

```sh
grep -rln 'sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled' \
  $(git ls-files)                                          # AC-1.2 term set
```

The sweep recipe is therefore a **documented superset** of AC-1.2's term set, and the delta is
exactly the paths only `postWavePathspecs` reaches. Measured at `b73fb4de`: recipe **136**,
AC-1.2 term set **132**, delta **4** —

| Delta path | Owning class |
|---|---|
| `.claude/pdlc.config.example.json` | M-11h |
| `pdlc/workflows/__tests__/waveExecution.test.js` | M-11h (survives) |
| `pdlc/workflows/__tests__/consolidationPreflight.test.js` | M-11h (edited) |
| `pdlc/workflows/dist/consolidate-learnings.bundle.js` | M-10 |

All four are owned, so the wider recipe adds no unclassified path, and all 132 paths of the
AC-1.2 search are likewise owned with an empty remainder. The asymmetry is deliberate: the bare
key `postWavePathspecs` must stay **out** of AC-1.2's required-empty term, because
`orchestrate-dev.js:168` keeps the generic parser M-11h does not retire, so a required-empty
search carrying that key would be permanently red on a surviving engine-channel module. It stays
**in** the recipe, because the inventory control wants the widest reach it can get. The wave-gate
*values* are not retired at all (M-11h): the paths the key reaches are carried by M-11h's
inventory row and its per-file prose-and-assertion dispositions, not by a repo-wide search term.
Both commands are transcribed literally into the FSPEC at C-6
re-measurement time.
