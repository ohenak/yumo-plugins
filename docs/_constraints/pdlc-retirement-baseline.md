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
| M-8 | Candidate dedicated test modules (`bootstrap`, `drift*` ×16, `queueDriftGate`, `runtimeBundle`, `worktreeInclude`, `hookCompatibility`) **plus the six helper files that exist only to serve them**: `helpers/drift{Fixtures,Harness,Probe}.js` and `helpers/bin/{backup-grammar,lib-probe,percent-encode-driver}.sh` | 21 `*.test.js` / 15,109 lines, of 119 `*.test.js` in `pdlc/workflows/__tests__/`; **+ 6 helper files / 2,024 lines** — measured total **27 files / 17,133 lines**. Every importer of the three helper modules, and both referents of `helpers/bin/`, are inside M-8's own 21 (`driftFault`, `driftOrdering` for the shell probes). `helpers/driftGenerators.js` is deliberately **not** in M-8: seven surviving modules (`approvalHash`, `completeness`, `forcePhases`, `pacingWrapper`, `roundDerivation`, `scanLines`, `consolidationPreflight`) import its `seeded`/`resolveSeed`/`shrink` primitives | delete or re-home per REQ R-8; `driftGenerators.js` is **reduced, not deleted** — see M-11p |
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
| M-11h | The wave-gate keys, whose retirement is a **config-value change, not a mechanism deletion**. Retired *values*: `.claude/pdlc.config.example.json`'s `implementation.postWaveCommand` (`node pdlc/workflows/build-runtime.mjs`) and `implementation.postWavePathspecs` (`["pdlc/workflows/dist/"]`), documented in CLAUDE.md; and the same two literals asserted at `pdlc/workflows/__tests__/consolidationPreflight.test.js:205`–`:208`. Surviving *mechanism*: a generic "stage these pathspecs after the post-wave command" facility, implemented in `pdlc/workflows/orchestrate-dev.js` — default `Object.freeze([])` (`:168`), generic parse/validate (`:218`–`:245`), single consumer (`:14416`) — and pinned by `pdlc/workflows/__tests__/waveExecution.test.js` (`:182`, `:208`–`:216`, `:260`–`:277`, and the `postWaveCommand and postWavePathspecs` block at `:813`). Neither is deleted: `orchestrate-dev.js` is the source vendored into `@kaneho/pdlc-engine` and survives, and the mechanism keeps a caller after the sweep because the reduced build step that emits M-9 still runs under O-3. So this class edits **which pathspec is configured**; the parser and its tests stay green unchanged apart from the retired literal. For the partition, `orchestrate-dev.js` is owned by **M-11o** (its whole-file disposition) and named here only as the mechanism's location, so no path has two owners |
| M-11i | Queue drift gate and its `distribution.checkEnabled` key in `orchestrate-queue.js`; the `SessionStart` drift-reporter entry in `pdlc/hooks/hooks.json` |
| M-11j | `.worktreeinclude` (single row `.claude/workflows/`); `.gitignore`'s `/.claude/workflows/` row **and its 20-line rationale comment above it** |
| M-11k | `pdlc/RELEASE-CHECKLIST.md` (≥4 sections), both READMEs, CLAUDE.md's bootstrap/sync/drift/worktree/distribution-channel prose and its `### Continuous integration` section, header prose in the workflow modules |
| M-11l | `pdlc/OPERATIONS.md` — tracked instructional deep-dive created at `a9b3e78a`. Headings quoted verbatim as they read at HEAD, so a "those sections are gone" check keys on literals and fails on a rename rather than passing vacuously: `## Workflow scripts and the runtime build` (`:5`), `## Continuous integration` (`:57`, whose prose describes the required-check set and its two workflow files), `## When sync skips a row: \`unverified\` and \`--force\`` (`:72`), `## Worktrees` (`:85`, self-created-worktree caveat), `## Distribution scripts` (`:128`, names M-1, M-2, M-3 and their roles). `## The engine channel (\`pdlc/engine\`)` (`:136`) is deliberately **not** in the retired set — it describes the surviving path |
| M-11m | `pdlc/engine/__tests__/fs-observation.test.js` — builds an `orchestrate-dev.bundle.js` path under the consumer workflows dir, and exercises the `distribution.checkEnabled: false` opt-out |
| M-11n | The three tracked `pdlc/skills/*/SKILL.md` files that name retired machinery (added at the 2026-08-17 re-measurement, not allow-listed — each is edited by the sweep). `orchestrate-queue/SKILL.md`: the drift-gate section (`:142`, `:161`, `:165` — `check-workflow-drift`, `sync-workflows.sh`/`--force`, `distribution.checkEnabled: false`) and the artifact list (`:230`, `:231`, `:240`, `:241`). `orchestrate-dev/SKILL.md`: the artifact line (`:93`) and the build/sync paragraph (`:97`). `consolidate-learnings/SKILL.md`: the bundle reference at `:11` — this skill survives NG-1 and keeps running, so the reference is **rewritten** to name the surviving execution path, not allow-listed and not deleted with the skill |
| M-11o | **Header prose inside the surviving workflow source modules.** `pdlc/workflows/orchestrate-dev.js:5`–`:6` and `pdlc/workflows/consolidate-learnings.js:5`–`:6` each carry a two-line `Built artifact: … .bundle.js` / `Consumer runtime copy: installed from dist/ by … sync-workflows.sh` banner. These modules are the engine channel's vendored source of truth and **survive**; only the banner lines are rewritten. Split out of M-11k's "header prose in the workflow modules" so the paths are named rather than inferred — they are code files, and AC-1.2's required-empty search reds on a *surviving* module if they are missed. `orchestrate-queue.js` carries the same banner and is already named by M-11i |
| M-11p | **Assertions about the retired `dist/` artifacts held in test modules that M-8's regex does not reach.** Delete with their subject: `runtimeProvenanceWiring.test.js` (all four cases assert the provenance 8th argument in freshly-built and checked-in `orchestrate-{dev,queue}.bundle.js`; nothing else). Edited, module survives: `advisoryBundle.test.js` (`:179` `SHIPPED_BUNDLES`, `:203` comment, `:210`–`:211` "manifest carries exactly four rows"), `consolidationBuild.test.js` (the `T32`/`T33` blocks at `:41`, `:165`–`:179`, `:290`–`:308` over the consolidation bundle and manifest), `advisoryDisabled.test.js:659` (test title and rationale), `consolidationIdentity.test.js:218` (scope-boundary comment), `orchestrateDevSkill.test.js:93` (asserts `orchestrate-dev/SKILL.md` contains `.claude/workflows/orchestrate-dev.bundle.js` — moves in the same commit as M-11n's `orchestrate-dev/SKILL.md:93`), `helpers/driftGenerators.js` (reduced: `C1_PATH` at `:64` and `readFaultTokens` at `:477`–`:526`, whose only consumer is M-8's `driftFault.test.js`, are removed; the `seeded`/`resolveSeed`/`shrink` primitives seven surviving modules import stay). `consolidationPreflight.test.js` is listed under M-11h, not here — its hit is a retired config *value* |

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
| `docs/_queue/QUEUE.md` | queue prose, governed instead by the REQ's AC-2.3 | `QUEUE.md` |
| `docs/pdlc-plugin-retirement/**` | this feature's own artifacts | 9 files at `0e86f11a` (the REQ and eight cross-reviews; 7 before round 4's two landed) |
| `docs/PLAN-*.md`, `docs/design/**`, `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` | planning documents of already-shipped features; the third entry is that one file's literal path, deliberately not a `docs/*/PLAN-*.md` wildcard, which would also exempt a future feature's PLAN that re-introduces a retired name | `docs/PLAN-pdlc-integration-boundary-gates.md`, `docs/design/MASTER-PLAN-engineering-loop.md`, `docs/design/PROMPT-dev-orchestrate-dev-optimization.md`, `docs/pdlc-halt-hardening/PLAN-pdlc-halt-hardening.md` |

**Two allow-listed files must survive still carrying the retired names**:
`docs/_decisions/DECISIONS-plugin-distribution.md` (its superseding entry, required by the
REQ's BL-06 and AC-2.3, necessarily names the channel it supersedes) and this file (the REQ's
C-6 re-measurement and AC-1.3 depend on it). Without the allow-list those two obligations and
the required-empty search could not both be satisfied.

## Partition — the sweep's whole output, classified (run at `0e86f11a`, 2026-08-17)

The REQ's C-6 requires every path the dependent sweep returns to fall in exactly one of three
classes — an M-row, an M-11 row, or A-1 — with the unclassified remainder **empty**. Executed at
`0e86f11a` the sweep returns **133** tracked paths and the remainder is now **0**:

| Class | Paths | Notes |
|---|---|---|
| M-1 … M-7, M-9, M-10 | 9 | one file each |
| M-8 | **25** = 18 `*.test.js` + 7 helper files | 3 of M-8's 21 `*.test.js` (`driftHelpers`, `driftMessageSplit`, `worktreeInclude`) carry **no** retired name and so never appear in the sweep; they are still deleted with their class. The 7 helper files are M-8's 6 dedicated ones plus `driftGenerators.js`, which is reduced rather than deleted |
| M-11a … M-11n | **30** | M-11c is **0** — `ci-arrangement.test.js` names the job ids, not the retired artifacts, so it is a real dependent the sweep does not reach; M-11j is **1** (`.worktreeinclude` likewise names `.claude/workflows/`, not a swept term). M-11e is **10** (6 + 4, at the re-measured tree-root extents) |
| M-11o | 2 | `orchestrate-dev.js`, `consolidate-learnings.js` |
| M-11p | 6 | `runtimeProvenanceWiring`, `advisoryBundle`, `advisoryDisabled`, `consolidationBuild`, `consolidationIdentity`, `orchestrateDevSkill` |
| A-1 | **61** | 39 `docs/completed/**`, 9 this feature's, 4 planning, 3 discarded, 3 fixture corpora, 1 decision, 1 `QUEUE.md`, this file |
| **Total** | **9 + 25 + 30 + 2 + 6 + 61 = 133** | equals the sweep |
| **unclassified** | **0** | — |

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
| `__tests__/waveExecution.test.js` | M-11h | survives; the parser's tests keep running — a retired *value*, not a retired mechanism |
| `__tests__/consolidationPreflight.test.js` (`:205`–`:208`) | M-11h | edited: asserts the retired `postWavePathspecs` value |
| `__tests__/runtimeProvenanceWiring.test.js` | M-11p | deleted with M-4/M-5 |
| `__tests__/{advisoryBundle,advisoryDisabled,consolidationBuild,consolidationIdentity,orchestrateDevSkill}.test.js` | M-11p | edited; modules survive |
| `__tests__/helpers/drift{Fixtures,Harness,Probe}.js`, `helpers/bin/{backup-grammar,lib-probe,percent-encode-driver}.sh` | M-8 | deleted with M-8 (no surviving importer) |
| `__tests__/helpers/driftGenerators.js` | M-8 / M-11p | **reduced**, not deleted — 7 surviving modules import it |
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

At `0e86f11a` the first and third commands print nothing and the sweep totals 133.
