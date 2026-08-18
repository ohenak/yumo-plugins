# TSPEC — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-plugin-retirement.md` (v0.11) → `FSPEC-pdlc-plugin-retirement.md` (v0.5) → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-product-manager-TSPEC-v1.md`, `CROSS-REVIEW-test-engineer-TSPEC-v1.md` (addressed in v0.2); `CROSS-REVIEW-product-manager-TSPEC-v2.md`, `CROSS-REVIEW-test-engineer-TSPEC-v2.md` (addressed in v0.3); `CROSS-REVIEW-product-manager-TSPEC-v3.md`, `CROSS-REVIEW-test-engineer-TSPEC-v3.md` (addressed in v0.4) |
| LEARNINGS | `docs/pdlc-plugin-retirement/LEARNINGS-pdlc-plugin-retirement.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.4 | 2026-08-17 |

*Measured at `2cd0d6b1` (2026-08-17, `feat-pdlc-plugin-retirement`). Every file/symbol claim below
was verified against the tree at that commit; the FSPEC's own base commit is `b3f24fc6` and its
literals are re-transcribed at C-6 re-measurement time, not here.*

## 1. Overview

This TSPEC is the implementation contract for the retirement sweep the FSPEC specifies
behaviourally. It **decides only what the FSPEC routed here** and grounds every decision in the
tree at `2cd0d6b1`; it invents no requirement and changes no pipeline semantics (REQ NG-3).

### 1.1 What this document settles

| Routed item | Decision | Section |
|---|---|---|
| FSPEC O-C / REQ O-3 — which surviving directory holds the probe CLI's build | `pdlc/workflows/dist/` survives holding exactly one entry, `pdlc-cli.mjs`; AC-1.1's **first** branch is pinned | §2.2 |
| FSPEC O-D / REQ O-4 — Phase MERGE's self-modification guard paths | `MERGE_GUARD_DEFAULTS` is **not edited by this sweep**; the `pdlc/engine/` coverage gap is bound to a successor REQ under NG-5 | §2.7 |
| FSPEC O-E — which surviving modules host the re-homed assertions | Hook compatibility: `hookCompatibility.test.js` is **retained**, minus its drift-registration block. Queue triage: `orchestrateQueue.test.js` | §2.6, §4.4 |
| FSPEC ASM-3 — where the consumer-cleanup step lives | `pdlc/hooks/scripts/cleanup-consumer-workflows.sh`, operator-invoked, exit statuses `0` / `3` / `4` | §3.2 |
| FSPEC ASM-4 — how the delegator skills reach the engine | The installed `pdlc` binary (`pdlc dev` / `pdlc queue`), resolved PATH-first with a named refusal | §3.3 |
| FSPEC AT-5.2 — the stable field subset the report comparison values | An **excluded key-path list** over the stamped report, complement value-compared | §4.5 |
| FSPEC BR-VER-1 — the post-sweep plugin version | `0.23.2` (stays inside the published engine's `^0.23.0` window) | §4.6 |

### 1.2 What this document does not settle

- Engine runtime capability (REQ NG-5): the engine's declared compatible-plugin range and its
  own tests over retired artifacts are edited by the sweep; nothing else engine-side is.
- Operator-owned gates: BL-03's adoption evidence and BL-08's pre-sweep report/transcript
  (FSPEC §7 O-A, O-B) are captured by the operator before the first deletion commit.
- The FSPEC's pinned literals. Where a decision here moves one — L-5's post-sweep suite count
  (§4.4) — the correction is made in the FSPEC at C-6 re-measurement time (FSPEC §3.0 step 3,
  ASM-2's veto path), never loosened into an inequality here.

### 1.3 Evidence grounding

Every claim below cites the symbol or file it rests on, verified at `2cd0d6b1`:
`pdlc/workflows/build-runtime.mjs` (`bundles`, `cliArtifact`, `DEV_META`, `QUEUE_META`,
`CONS_META`, `manifestRows`), `pdlc/workflows/runtime-adapter.js` (`rtConsInjections`,
`RT_CLI_PATH`), `pdlc/workflows/orchestrate-dev.js` (`MERGE_GUARD_DEFAULTS`,
`MERGE_CONFIG_PATH`), `pdlc/engine/lib/report.mjs` (`buildEngineBlock`, `stampReport`),
`pdlc/engine/lib/startup.mjs` (`OPERATOR_ONLY_SKILLS`), `pdlc/engine/bin/cli.mjs`
(`FLAGS_BY_COMMAND`), `pdlc/engine/scripts/prepack.mjs` (`MODULE_NAMES`),
`pdlc/hooks/hooks.json`, `pdlc/.claude-plugin/plugin.json`. Seven claims the upstream documents
make do **not** survive that check; they are raised as errata rather than absorbed (§6.1).

## 2. Architecture

### 2.1 The shape of the change

The sweep is a deletion, not a build. Nothing new is designed except two small artifacts — the
consumer-cleanup script (§3.2) and the two delegator skill bodies (§3.3) — and one reduction (the
build step, §2.3). The architecture question this document answers is therefore *what the tree
looks like on the far side*, per module:

| Path | Post-sweep state | Evidence at `2cd0d6b1` |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js`, `orchestrate-queue.js` | survive unchanged except banner lines and the queue's gate removal | vendored by `pdlc/engine/scripts/prepack.mjs`'s `MODULE_NAMES` |
| `pdlc/workflows/consolidate-learnings.js` | survives as a module; **loses its only execution host** (§6.1 erratum 3) | imported by 6 surviving `consolidation*.test.js` modules |
| `pdlc/workflows/runtime-adapter.js` | orphaned by the sweep; disposition routed as erratum (§6.1 erratum 2) | its only consumer is `build-runtime.mjs:97` (`const adapter = readFileSync(... "runtime-adapter.js")`) |
| `pdlc/workflows/cli.mjs` | survives — the probe CLI's hand-written source | read at `build-runtime.mjs:513` |
| `pdlc/workflows/build-runtime.mjs` | reduced to the probe-CLI emitter (§2.3) | |
| `pdlc/workflows/dist/` | survives holding exactly `pdlc-cli.mjs` (§2.2) | five tracked entries today (`git ls-files pdlc/workflows/dist/`) |
| `pdlc/hooks/scripts/` | loses `sync-workflows.sh`, `check-workflow-drift.sh`, `lib/pdlc-drift.sh`; gains `cleanup-consumer-workflows.sh` | |
| `pdlc/skills/**` | all 15 skill directories survive; three files edited (M-11n) | `pdlc/skills/*/SKILL.md` |
| `pdlc/engine/**` | edited only inside REQ NG-5's two carve-outs | |

### 2.2 The probe CLI's home (FSPEC O-C, REQ O-3, G-5, AC-1.1)

**Decision: the probe CLI stays at `pdlc/workflows/dist/pdlc-cli.mjs`.** `pdlc/workflows/dist/`
survives as a directory whose tracked entry set set-equals `{pdlc-cli.mjs}` — AC-1.1's **first**
branch, so AT-1.1 asserts the entry set, not a relocation.

Why this branch rather than a move:

1. **No criterion asks for a move.** `pdlc/workflows/dist/` is explicitly *not* an AC-1.2 search
   term (FSPEC L-2's "no surviving identifier is a member"), so keeping the path can never red
   AT-1.2. A move buys nothing a criterion measures.
2. **The build step's output contract is already this path.** `build-runtime.mjs:32`
   (`const OUT_DIR = resolve(HERE, "dist")`) and its per-row logging (`wrote
   pdlc/workflows/dist/${file}`) are unchanged by the reduction, so the M-7 diff stays a
   deletion diff. A move would add a rename to the same commit that deletes three bundles — a
   larger blast radius on the class C-5 already forbids splitting further.
3. **`git mv` costs downstream churn for no gain.** The path appears in CLAUDE.md, in
   `pdlc/OPERATIONS.md` and in the operator's muscle memory; leaving it fixed keeps the class-12
   documentation edit to *removals* (BR-DOC-2) rather than removals plus a rewrite of the one
   surviving instruction.
4. **The `dist/` name no longer over-promises.** With the manifest and the three bundles gone,
   nothing in the tree describes `dist/` as a distribution channel: the only prose that did is
   deleted by classes 9 and 12.

Alternative considered and rejected: relocate to `pdlc/workflows/bin/pdlc-cli.mjs`. Rejected —
it renames an artifact operators already invoke by path (AC-5.3 asks it to "answer exactly as
before"), and AC-1.1's second branch then needs a TSPEC-named path that no test previously used,
trading a measured set-equality for a fresh literal.

Consequence for `.gitignore`: the `/.claude/workflows/` row and its rationale block go (M-11j),
and no new ignore row is needed — `pdlc/workflows/dist/pdlc-cli.mjs` stays **tracked**, exactly
as it is today.

**Consequence for the wave gate (class 10).** `.claude/pdlc.config.example.json` today carries
`implementation.postWaveCommand = "node pdlc/workflows/build-runtime.mjs"` and
`implementation.postWavePathspecs = ["pdlc/workflows/dist/"]` (verified at `2cd0d6b1`). Both
values **survive the sweep unchanged**, and that is a decision, not an omission: `dist/` survives
with `pdlc-cli.mjs` in it (above), the builder survives reduced (§2.3), and the regeneration step
stays load-bearing. `consolidationBuild.test.js`'s T32 block asserts `build-runtime.mjs --check`
is clean and stays in the surviving workflow suite (§5.3), so any later wave that edits
`pdlc/workflows/cli.mjs` or `pdlc/workflows/orchestrate-dev.js` — the two `CLI_SOURCES` inputs —
leaves the tracked artifact stale and reds that assertion unless something regenerates it.
`postWaveCommand` is that something. Retiring the two values would degrade AC-5.3's "still
produced by a build step rather than maintained by hand" into hand-maintenance in practice.

Class 10 therefore edits the wave-gate **prose** (CLAUDE.md's distribution paragraphs and
`consolidationPreflight.test.js:205`–`:208`'s source-text expectations, where they name retired
bundles) and leaves the two config-example values as they stand. If FSPEC M-11h or REQ C-5
assumed those rows retire with `dist/`, the assumption is corrected upstream (§6.1 erratum 5),
not silently here.

### 2.3 The reduced build step (M-7)

`build-runtime.mjs` is 831 lines today and emits four artifacts plus a manifest. The reduction
keeps exactly the path that produces `pdlc-cli.mjs` and deletes the rest. Verified symbol by
symbol at `2cd0d6b1`:

**Kept** (each is on the CLI path): `banner()` (`:45`), `stripModuleSyntax()` (`:56`),
`wrapModule()` (`:66`), `moduleImportLines()` (`:87`), `devSource` (`:94`), `CLI_DEV_EXPORTS`
(`:499`), `cliSource`/`CLI_IMPORT_MARK`/`cliBody` (`:513`–`:527`), `CLI_SOURCES` (`:530`),
`cliArtifact` (`:532`), `OUT_DIR`, the `--check` staleness comparison and its non-zero exit.

**Deleted**: `adapter` (`:97`) and the three `*_META` / `*_ENTRY` template literals and module
wrappers (`devModule`, `queueModule`, `consModule`, `QUEUE_META`, `CONS_META`, `DEV_META`,
`QUEUE_ENTRY`, `DEV_ENTRY`, `CONS_ENTRY`); the import-wiring auditors
(`maskStringsAndCommentsForAudit`, `sliceBalancedCallForAudit`, `importedNamesFromOrchestrateDev`,
`assertDevImportsAreWired`); the comment stripper (`REGEX_PREFIX_WORDS`, `stripJsComments`,
`neutralizeDynamicImports`, `stripCommentsForRuntime`) and the `import(`-survival gate that
guards only `.bundle.js` rows; the three bundle rows of `bundles`; and the whole manifest tail
(`pluginManifest`/`pluginVersion`, `RETIRED_DIR`, `RETIRES_BY_ID`, `manifestRows`, `manifest`,
`manifestContents`, the manifest write and its `--check` arm).

The surviving `bundles` array becomes a single row, `{ file: "pdlc-cli.mjs", contents: cliArtifact }`
— the `id: "pdlc-cli"` key goes with the manifest tail, since `id` is read only by
`manifestRows` (`build-runtime.mjs:773`); leaving dead data behind in the one file this class
rewrites would invite an implementer to keep it. The emission loop
and `--check` semantics are unchanged in shape — one row in, one `in-sync`/`wrote`/`STALE` line
out. This keeps AC-5.3's "still produced by a build step" true by construction and keeps
`build-runtime.mjs --check` a usable staleness gate for the one surviving artifact.

Two surviving suites read this file's source text and will red on the reduction unless their
assertions move in the same commit — `pipelineWiring.test.js`'s `devMeta()` reader and
`consolidationPreflight.test.js`'s `T00 — BL-PREREQ: build-runtime.mjs source-text presence`
block. Neither is in the FSPEC's M-11p set; both are raised as erratum 1 (§6.1) and dispositioned
in §2.8.

### 2.4 The delegator skills (REQ G-2, O-2; FSPEC §3.4, BR-DEL-1…4)

`orchestrate-dev/SKILL.md` (97 lines) and `orchestrate-queue/SKILL.md` (250 lines) are rewritten
as thin delegators. Structurally each becomes: frontmatter (unchanged `name`/`description`
contract, so Ptah's `skill_path` resolution and the engine's catalogue are untouched — REQ C-4),
a one-paragraph statement that the pass runs in the engine, the invocation contract (§3.3), the
relay rule, and the refusal rule. Everything that is pipeline logic — the queue's drift-gate
section (`orchestrate-queue/SKILL.md:138`–`:168`), row selection, readiness evaluation, phase
dispatch, verdict parsing and queue-row writeback — is deleted, not moved: the engine already
owns each of them (`pdlc/engine/lib/run.mjs`, `loadDispatchableSkills()` at `:223`).

The skills are **prompts, not programs**: the delegator's "resolution" is an instruction to the
session to run one command and relay its output (§3.3), which is why BR-DEL-1's static half is
checkable by reading the two files.

### 2.5 The consumer-cleanup step (REQ G-4, C-9, NG-6)

A single POSIX shell script, `pdlc/hooks/scripts/cleanup-consumer-workflows.sh`, following the
retired sync tooling's own conventions so operators meet no new idiom. It lives beside the other
operator-invoked script the plugin shipped (`sync-workflows.sh` was invoked by hand and by CI,
never by a hook), and it is registered in **no** hook event — NG-6 is discharged structurally, by
the absence of a `hooks.json` entry, not by a runtime check.

Design (interface in §3.2): read the target directory, classify every entry **by name only**
against the frozen expected-name set (FSPEC L-11, transcribed into the script as a literal list —
BR-CLN-3a), then act in one of three ways: nothing to do (exit `0`), all expected (delete, then
remove the emptied directory, exit `0`), any unexpected (delete nothing at all, name the path on
stderr, exit `3`). The all-or-nothing shape is what makes AT-4.3's "every expected entry still
byte-identical" checkable without reading the implementation: the script performs **no** deletion
before its classification pass has finished over the whole directory.

### 2.6 Test-corpus surgery (M-8, R-8)

Three distinct operations, deliberately separated because they carry different risk:

1. **Delete** the drift/bundle-dedicated modules and the six helpers that serve only them.
2. **Retain-and-reduce** `hookCompatibility.test.js`: its `C7` block (`:251`–`:294`, asserting
   `hooks.json` registers `check-workflow-drift.sh` as a second `SessionStart` entry) is deleted
   with the hook; `PROP-COMPAT-04` (`:62`), `PROP-COMPAT-05` (`:156`) and `PROP-COMPAT-06`
   (`:295`) stay where they are. Retention rather than extraction is the safer form of R-8's
   re-homing: the module is self-contained (it imports no helper — `runHookScript()` is local at
   `:46`), so moving its bodies would be a pure-churn copy that risks dropping an assertion, and
   these three blocks are the **only** workflow-suite coverage of the three surviving hooks and
   therefore AT-3.3 clause 2's oracle.
3. **Reduce** `helpers/driftGenerators.js` to the primitives surviving modules import. Re-measured
   at `2cd0d6b1` by `grep -rn "driftGenerators" pdlc/workflows/__tests__` (import sites only,
   comment mentions discarded): **twelve** `*.test.js` modules import it statically, of which
   **six** are deleted by the sweep (`driftBackups:46`, `driftBaseline:56`, `driftFault:37`,
   `driftHook:69`, `driftOrdering:36`, `queueDriftGate:60`) and **six** survive
   (`approvalHash:39`, `completeness:55`, `forcePhases:30`, `pacingWrapper:60`,
   `roundDerivation:36`, `scanLines:28`); the surviving import set is exactly `seeded`,
   `resolveSeed`, `shrink` (plus
   `consolidationPreflight.test.js:172`, which asserts `seeded`/`resolveSeed` are exported, and
   `helpers/mergeDoubles.js:14`, which imports `seeded`/`resolveSeed`). The named symbols the
   baseline lists for removal (`C1_PATH`, `MANIFEST_CHAIN_VECTORS`, `readFaultTokens`,
   `enumerateLeaves`, `enumerateEvidenceVectors`, `genId`, `genStamp`) all lose their last
   consumer with `driftFault`, `driftBaseline`, `driftBackups` and `queueDriftGate`. The
   reduction is derived by a **fresh consumer scan at implementation time**, not by transcribing
   that list (baseline M-11p states it is non-exhaustive).

Queue-triage re-homing is §4.4's L-6 row 1; hook re-homing collapses to operation 2 above, so
L-6's row 2 names a module that is not newly created.

**Helper survivorship, stated rather than left implicit.** M-8 deletes three helpers
(`helpers/drift{Fixtures,Harness,Probe}.js`); the sweep also deletes every `drift*.test.js`
module, which changes the consumer count of helpers M-8 does *not* name. Measured at the base
commit: `helpers/driftCapabilities.js` keeps `documentOracles.test.js` and
`skipSinkTransport.test.js`, and `helpers/skipSink.js` keeps `skipSinkTransport.test.js`, so both
survive with live consumers. `helpers/freshClone.js` loses its only consumer
(`bootstrap.test.js`) and **regains one** in TT-3's fresh-clone half (§5.2) — it must not be swept
as collateral. `helpers/driftOrdering.js` is consumed only by `bootstrap.test.js` and
`drift*.test.js` modules, so it ends the sweep consumer-less; it is deleted with them under class
3 rather than left as dead code. **The AT-1.3 citation for this is withdrawn:** AC-1.3 has no
no-orphan reading — it asserts suite green, no skipped or pending test belonging to M-8, a
`*.test.js` count equal to the FSPEC literal, and that every module named *retained* is present
and passing (REQ AC-1.3). A helper is not a `*.test.js` file, so the count clause cannot see it,
and nothing else upstream asserts orphan-freedom. The deletion is also unowned upstream: the
baseline's M-8 names exactly six helper files (`helpers/drift{Fixtures,Harness,Probe}.js` and
`helpers/bin/*.sh`) and `driftOrdering.js` is not among them. Two consequences, stated rather than
assumed: the membership gap is routed upstream (§6.1 erratum 8), and §5.5 gives the disposition a
real TSPEC-side oracle covering both directions — no importer-less file left under `helpers/`, and
`freshClone.js` still imported.

### 2.7 Phase MERGE's guard paths (FSPEC O-D, REQ O-4)

`MERGE_GUARD_DEFAULTS` (`pdlc/workflows/orchestrate-dev.js`, the frozen array declared by `export const MERGE_GUARD_DEFAULTS = Object.freeze([` — at `:48`, not `:47`; `:47` is the "no path may mutate the shipped default" comment line) is
`["pdlc/workflows/", "pdlc/skills/", "pdlc/hooks/", ".claude/workflows/"]`.

**Decision: the sweep does not edit it.** Two grounds:

- *Editing it is an engine behaviour change.* `orchestrate-dev.js` is the module
  `pdlc/engine/scripts/prepack.mjs` vendors verbatim (`MODULE_NAMES`), so a changed default set
  changes what a published engine refuses to merge. REQ NG-5 places that outside this feature.
- *Leaving it is inert.* No L-2 term matches the string `.claude/workflows/`, so AT-1.2 stays
  green; and a guard entry for a path that no post-sweep diff can contain denies nothing. The
  guard's job — refuse a self-modifying merge — is unchanged for the three surviving prefixes.

The real gap O-4 names is not the stale entry but the **uncovered** one: engine-adjacent code now
lives at `pdlc/engine/`, which no guard prefix covers today (verified: the frozen array has four
members, none of them `pdlc/engine/`). Adding it changes engine runtime behaviour, so it is bound
to a successor REQ under NG-5 (§6.2, SUCC-1) rather than smuggled into a deletion sweep.

### 2.8 Dependents discovered by this TSPEC, and where they land

Per BR-SWEEP-5 the inventory is a lower bound; three dependents were found by reading, not by the
sweep command. They are raised upstream as errata (§6.1) and, pending that routing, carry these
dispositions so the PLAN can size them:

| Discovery | Reds which commit | Disposition |
|---|---|---|
| `pipelineWiring.test.js`'s `devMeta()` (`:543`–`:560`) and its `RLH-CR-F1`/`RLH-CR-F7` assertions read `DEV_META` from `build-runtime.mjs` | class 7 (build-step reduction) | The two `meta.inputs` copies stop existing as a pair when `DEV_META` goes; the module's own `meta.inputs` assertions stay, the `DEV_META` comparison is deleted **in the class-7 commit** (BR-SWEEP-4: a gate-read reference never lags its subject) |
| `consolidationPreflight.test.js`'s `T00 — BL-PREREQ: build-runtime.mjs source-text presence` (`:99`–`:109`) requires `QUEUE_META`, `QUEUE_ENTRY`, `bundles`; its sibling block (`:117`+) requires declarations *inside* `runtimeBundle.test.js` | class 7 and class 6 respectively | Both BL-PREREQ blocks are baseline-existence gates for a feature already delivered; each is deleted in the same commit as the symbol it gates (`bundles` survives, so only the retired rows go) |
| `pdlc/workflows/runtime-adapter.js` (+ `adapterProbe.test.js`, `helpers/adapterHarness.js`) has no consumer once `bundles` loses its three bundle rows | none — no gate reads it | Left **untouched** by this sweep and routed as erratum 2. Deleting it is defensible but unspecified upstream; deleting an unspecified 55 KB module inside a sweep whose whole control is set-equality is the failure mode C-6 exists to prevent |

### 2.9 Class-to-change map

FSPEC §3.1's thirteen classes are the commit boundary; this table adds the concrete edit each one
carries in this repo, so the PLAN's task sizes come from dispositions rather than row counts
(BR-SWEEP-7).

| Class | Concrete edits |
|---|---|
| 1 | `pr-tests.yml` (2 jobs + index-mode steps), `publish.yml` gate steps, `ci-arrangement.test.js`, CLAUDE.md `### Continuous integration`, `pdlc/OPERATIONS.md` `## Continuous integration` (count word + named files), the two workflow-file comment count words |
| 2 | `pdlc/engine/__tests__/smoke.test.js`, `fs-observation.test.js`, `fixtures/consumer-ac12/` (6 files) |
| 3 | `orchestrate-queue.js` gate + `distribution.checkEnabled` parse, its workflow-suite coverage |
| 4 | `check-workflow-drift.sh` + the second `SessionStart` entry in `hooks.json` |
| 5 | `lib/pdlc-drift.sh`, `sync-workflows.sh` |
| 6 | 20 of M-8's 21 `*.test.js` modules deleted (all but `hookCompatibility.test.js`, incl. `bootstrap.test.js`) + `runtimeProvenanceWiring.test.js` + 6 helpers + `hookCompatibility.test.js` reduction + `driftGenerators.js` reduction; **no assertion is re-homed out of `orchestrateQueue.test.js`** (§4.4) |
| 7 | `build-runtime.mjs` reduction (§2.3), 3 bundles + manifest deleted, `pipelineWiring.test.js` / `consolidationPreflight.test.js` corrections (§2.8) |
| 8 | `.worktreeinclude` (file deleted — single row), `.gitignore` row + ~20-line comment block |
| 9 | `lib/document-oracles.mjs` packaging/advertised-version checks + exemptions, `documentOracles.test.js` D-1/D-2, `fixtures/covered-violations/` re-fixturing, CLAUDE.md prose those oracles guard |
| 10 | CLAUDE.md wave-gate prose and `consolidationPreflight.test.js:205`–`:208`; `.claude/pdlc.config.example.json`'s two values are **unchanged** (§2.2) |
| 11 | two delegator rewrites (§2.4), `consolidate-learnings/SKILL.md:11`, three module banners, `orchestrateDevSkill.test.js:93` |
| 12 | CLAUDE.md, `pdlc/OPERATIONS.md`, both READMEs, `pdlc/RELEASE-CHECKLIST.md`, `DECISIONS-plugin-distribution.md`, `QUEUE.md`, stored operator notes |
| 13 | `cleanup-consumer-workflows.sh` + its documentation and tests (§3.2) |

## 3. Interfaces

Three seams change or appear. Each is stated as a contract a test can hold, not as prose.

### 3.1 The reduced build step

```
node pdlc/workflows/build-runtime.mjs            # emits pdlc/workflows/dist/pdlc-cli.mjs
node pdlc/workflows/build-runtime.mjs --check     # exit 0 in sync; exit 1 + "STALE" line if not
```

| Aspect | Contract | Unchanged from today? |
|---|---|---|
| Inputs | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/cli.mjs` (`CLI_SOURCES`) | yes |
| Output | exactly one file, `dist/pdlc-cli.mjs` | reduced from four + manifest |
| Stdout | one `in-sync` / `wrote` line per emitted file, same wording | yes |
| `--check` failure | `STALE    pdlc/workflows/dist/pdlc-cli.mjs` on stderr, exit 1 | yes (row wording preserved) |
| Dependencies | none — dependency-free plain Node, runnable before `npm install` | yes |

The dependency-free property is retained deliberately: it is what lets a fresh clone regenerate
the surviving artifact, and it costs nothing now that the comment stripper (the only reason the
file had hand-rolled machinery) is gone.

### 3.2 `cleanup-consumer-workflows.sh` (FSPEC ASM-3, BR-CLN-1…6)

```
pdlc/hooks/scripts/cleanup-consumer-workflows.sh [--dry-run] [<repo-root>]
```

Invoked by an operator, from anywhere; `<repo-root>` defaults to the current working directory.
The target is always `<repo-root>/.claude/workflows/`. Never registered as a hook (REQ NG-6).

**Contract**

| # | Condition | Effect | stdout / stderr | Exit |
|---|---|---|---|---|
| 1 | target directory absent, or present and empty | nothing removed | stdout: "nothing to clean" naming the path | `0` |
| 2 | every entry's **name** is in the expected set (§4.3) | each entry removed (`.pdlc-backups/` removed whole, with its contents); the emptied directory removed | stdout: one line per removed entry, then a summary count | `0` |
| 3 | any entry's name is outside the expected set | **nothing removed at all** — classification completes over the whole directory before the first `rm` | stderr: one line per unexpected entry, each naming its full path | `3` |
| 4a | **argument-parse error** — unknown flag, or a second positional argument | **nothing touched**: parsing completes before any filesystem access | stderr: one usage line | `4` |
| 4b | **runtime failure** — unreadable target, or an `rm` that fails partway | whatever the failing `rm` already removed stays removed; no further removal is attempted, and the partial state is reported | stderr: diagnostic naming the path that failed | `4` |
| 5 | `--dry-run` | nothing removed under any condition | the lines rows 1–3 would print | `0` (rows 1–2) / `3` (row 3) |

Exit `3` is fixed, not "non-zero", exactly as BR-CLN-4 requires: `127` (missing interpreter) and
`1` must not be able to green AT-4.3. `4` stays reserved for the tooling-usage class, mirroring
the retired `sync-workflows.sh`'s five-status convention so an operator's existing expectation
transfers.

**Classification is by name only.** The expected set is a literal list inside the script (§4.3),
not read from a manifest — the manifest is deleted in class 7, so no content-based predicate is
decidable post-sweep (BR-CLN-3a). Two consequences stated rather than left implicit: a
hand-modified file with an expected name is removed (REQ AC-4.3 scopes the criterion to
*unexpected entries*, and C-9 excludes hand-modification); and a channel-written temp residue
(`.pdlc-tmp.*`) refuses, because refusing on an unenumerable name is the conservative side of the
same predicate (E-16b).

**Rows 4a/4b and 5 are surface this TSPEC introduces, not upstream criteria.** REQ AC-4.1…AC-4.4 and
FSPEC BR-CLN-1…6 describe rows 1–3 only. The usage-error status is a convention transfer from
`sync-workflows.sh` and costs nothing; `--dry-run` (row 5) is kept because a destructive operator
tool without a preview is the worse default — but an untested safety flag is worse than no flag,
so both rows carry oracles (§5.2, rows TT-1, TT-1b and TT-2), and the surface is routed upstream for an
owning criterion (§6.1 erratum 7) rather than left as engineering-side scope.

The split of the old single row 4 matters for the oracle: only **4a** is constructible and
fully assertable in a test, so **TT-1 is scoped to 4a** — its "removes nothing, every entry
still present byte-identical" conjunct is true by construction there. Row **4b** shares the exit
status but explicitly denies that conjunct (a partial `rm` may already have removed entries), so
its stated expectation is the weaker one above — exit `4`, no further removal attempted, partial
state reported — and it is not asserted by TT-1. Its exit status is still asserted, by TT-1b over the
one constructible arm (unreadable target); only the partial-`rm` arm stays oracle-free, and §5.2
says why. Bundling the two under one row left the second
arm with neither an oracle nor an expectation an implementer could code to.

**Idempotence** is structural: after a successful row-2 run the directory is gone, so the next
run takes row 1.

### 3.3 The delegator invocation contract (FSPEC ASM-4, BR-DEL-1…4)

The delegator skills instruct the session to run the engine's installed CLI. The command surface
is the engine's, verified at `2cd0d6b1` in `pdlc/engine/bin/cli.mjs`'s `FLAGS_BY_COMMAND`
(`dev`, `queue`, `doctor`) and `pdlc/engine/package.json`'s `bin` entry (`pdlc` →
`bin/pdlc.mjs`):

| Skill | Command | Arguments |
|---|---|---|
| `/pdlc:orchestrate-dev` | `pdlc dev <req-path>` | the REQ path the human named; `--force-phases` only when the human asked for it |
| `/pdlc:orchestrate-queue` | `pdlc queue` | `--queue-path <path>` only when the human named a queue other than the default `docs/_queue/QUEUE.md` |

**Resolution order**, stated in the skill so the human sees the same ladder the engine does:

1. `pdlc` on `PATH` (the published global install, `npm install -g @kaneho/pdlc-engine`);
2. `npx --no-install pdlc` for a repo-local install;
3. otherwise **refuse**, naming the install command. The skill never falls back to an in-plugin
   execution path, because after the sweep there is none (BR-DEL-3).

**Relay rules** (BR-DEL-2, BR-DEL-3):

- The skill reproduces the engine's run-report fields as emitted — no dropping, renaming or
  recomputation — and may add exactly one session-facing disposition line of its own.
- On refusal the skill surfaces the engine's **startup banner and the refusal together**; the
  banner is where the engine/plugin version pair and the expected range live
  (`pdlc/engine/lib/handshake.mjs`, `satisfiesRange`; `pdlc/engine/lib/report.mjs`'s
  `engineVersion`/`pluginVersion`), so relaying the refusal line alone would hide the diagnosis.
- One `/pdlc:orchestrate-queue` invocation is one `pdlc queue` invocation, which processes at most
  one ready feature and returns — the `/loop run /pdlc:orchestrate-queue` habit is preserved
  because the loop stays outside, in the session, exactly as it is today (BR-DEL-4). `--loop` is
  the engine's own flag and is not used by the delegator.

**Static half of BR-DEL-1**: after the rewrite neither skill file contains queue selection,
readiness evaluation, phase dispatch, verdict parsing or queue-row writeback text. That is a
grep-checkable property of two files, which is why AT-3.1 can discharge "no pipeline decision
inside the plugin" without an unbounded negative claim.

### 3.4 Unchanged interfaces (stated so a reviewer can confirm nothing drifted)

- **Skill frontmatter and paths.** All 15 `pdlc/skills/*/SKILL.md` keep their directory names, so
  Ptah's `skill_path` and the engine's catalogue resolve unchanged (REQ C-4, AC-3.4).
- **Hook manifest shape.** `pdlc/hooks/hooks.json` keeps its `${CLAUDE_PLUGIN_ROOT}` command form
  for the four surviving entries; only the second `SessionStart` entry is removed.
- **Probe CLI CLI surface.** `pdlc-cli.mjs`'s commands and its `usage: pdlc-cli …` line
  (`pdlc/workflows/cli.mjs`) are untouched — AC-5.3 compares answers before and after.
- **Engine CLI.** No new engine command is introduced by this feature (see §6.2, SUCC-2).

## 4. Data Model

No runtime data structure is created by this feature. What follows is the *decided data* — the
sets and literals the sweep is measured against. Each states where it is authoritative, so no
downstream document has to re-derive it.

### 4.1 Post-sweep `pdlc/workflows/dist/` entry set

```
{ pdlc-cli.mjs }
```

Tracked entries, set-equality (FSPEC L-1, AC-1.1's first branch, pinned here per REQ O-3). Today
the same listing is five entries (`git ls-files pdlc/workflows/dist/` at `2cd0d6b1`): the three
`*.bundle.js` files, `distribution-manifest.json` and `pdlc-cli.mjs`. The manifest does **not**
survive for the probe CLI's row — it is an AC-1.2 term, so a surviving copy would red that
criterion permanently.

### 4.2 The retired-term set is closed to this document

This TSPEC adds no member to FSPEC L-2's seven terms and removes none. But two files this
document creates **do** contain L-2 terms in their source text, and AC-1.2's expected-empty
command (FSPEC L-3) searches `git ls-files`, not a term-owning subset:

| File | L-2 terms present | Why unavoidable |
|---|---|---|
| `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` | `\.bundle\.js` (three expected names of §4.3), `pdlc-drift-state` (`.pdlc-drift-state.json`) | the classifier matches **names**, and §4.3's expected-name set is transcribed literally so an operator can audit the refusal predicate without reading shell (BR-CLN-4) |
| `pdlc/workflows/__tests__/consumerCleanup.test.js` | the same names, as fixture constructions | AT-4.1/AT-4.3 build a target directory holding those exact entries |

The script's own *filename* contains none of the seven — the earlier claim — but a filename is
not what L-3 greps. Left unaddressed, the cleanup step this TSPEC introduces reds AT-1.2
permanently. Resolution is **not** to construct the names at runtime from fragments: that hides
the refusal predicate from the operator audit BR-CLN-4 asks for, and moves the same literals
into a less readable form. Resolution is an A-1 allow-list extension, routed upstream (§6.1
erratum 4) and pinned in §4.3 below.

### 4.3 The cleanup step's expected-name set

Transcribed into `cleanup-consumer-workflows.sh` as a literal list (FSPEC L-11, BR-CLN-3a) — nine
names, matched **as names**, never as content:

| Name | What wrote it |
|---|---|
| `consolidate-learnings.bundle.js` | retired sync channel |
| `orchestrate-dev.bundle.js` | retired sync channel |
| `orchestrate-queue.bundle.js` | retired sync channel |
| `pdlc-cli.mjs` | retired sync channel |
| `orchestrate-dev.js` | pre-bundle path the same channel installed and later superseded |
| `orchestrate-queue.js` | pre-bundle path, as above |
| `.pdlc-drift-state.json` | the retired drift library (`pdlc/hooks/scripts/lib/pdlc-drift.sh`, `pdlc_write_drift_state`) |
| `.pdlc-sync-manifest.json` | retired sync channel |
| `.pdlc-backups/` | retired sync channel — expected **as a whole directory**, removed with its contents; the timestamped `.bak` files inside are never classified individually |

Any member may be absent, and absence is never an error. `distribution-manifest.json` is
deliberately **not** a member: it is a repo-side build artifact the channel never installed
consumer-side, so a file of that name in the target directory is unexpected and refuses (E-16).

**A-1 allow-list extension (routed upstream, §6.1 erratum 4).** Because the nine names above are
transcribed literally into two tracked files, AC-1.2's allow-list A-1
(`docs/_constraints/pdlc-retirement-baseline.md`, §*A-1*) must gain exactly two rows, named
here so the upstream edit is mechanical:

| Path | Why allow-listed |
|---|---|
| `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` | the sweep's own removal tool; its expected-name set is the retired vocabulary by construction (BR-CLN-3a) |
| `pdlc/workflows/__tests__/consumerCleanup.test.js` | the tool's oracle; fixtures must reproduce the same names to be a test of it |

The extension is **two named paths, not a glob** over `pdlc/hooks/scripts/` or
`pdlc/workflows/__tests__/` — a glob would exempt files the sweep is supposed to empty. Until
the upstream edit lands, AC-1.2 is red by construction and class 13 (§2.9) must not be judged
against it; the obligation is tracked as T-4 (§6.3).

### 4.4 Suite-size and re-home literals (FSPEC L-5, L-6; REQ AC-1.3, R-8)

**Suite size.** `pdlc/workflows/__tests__/*.test.js` counts **119** at `2cd0d6b1` (measured).
Two decisions move FSPEC's currently-pinned post-sweep literal of 97:

- FSPEC L-5 defines M-8 as **21** `*.test.js` modules (`bootstrap`, `drift*` ×16,
  `queueDriftGate`, `runtimeBundle`, `worktreeInclude`, `hookCompatibility`), and L-5's own
  arithmetic is 119 − 22 = 97 (M-8's 21 plus `runtimeProvenanceWiring.test.js`).
- §2.6 **retains** `hookCompatibility.test.js` rather than deleting it, so the sweep deletes
  **20** of M-8's 21 modules — the 21 less `hookCompatibility` — plus
  `runtimeProvenanceWiring.test.js`: **21** deletions, not 22. `bootstrap.test.js` **is** among
  the 20 deleted (see the mode-bit disposition below); no M-8 member is left undispositioned.
- §5.2 adds **one** new module, `consumerCleanup.test.js`, for the step §3.2 introduces.

Post-sweep count: 119 − 21 + 1 = **99**. Per ASM-2's veto path this is corrected in FSPEC at
C-6 re-measurement time and transcribed from the tree, never satisfied by counting loosely.
The class of `hookCompatibility.test.js` moves with it: L-5 files it under M-8 (deletion,
class 6 as *deletion*); this TSPEC reduces it in place, so it is a class-6 **reduction**, not a
deletion. That membership correction is routed upstream alongside the count (§6.1 erratum 6),
not decided silently here.

**`bootstrap.test.js`'s mode-bit coverage (M-8 member, deleted).** It carries the §9.3
mode-bit block — `it.each(FIVE_SCRIPTS)("index mode … is 100755 in the live repo")`, its
on-disk-in-clone twin, plus the dedicated bare-path assertion
`it("dedicated: bare-path invocation of sync-workflows.sh (no interpreter) must not exit 126")`
(`bootstrap.test.js`, `describe("§9.3: mode-bit …")`). The partition of `FIVE_SCRIPTS`
(`bootstrap.test.js`, `const FIVE_SCRIPTS`) across this sweep is **2 deleted / 3 surviving**, not
4 + 1: `check-workflow-drift.sh` (class 4) and `sync-workflows.sh` (class 5) go; and
`check-scope-field.sh`, `guard-harvest-before-delete.sh` and `nudge-consolidation.sh` survive
unchanged — three of `FIVE_SCRIPTS`'s five members, **not** "the hooks AC-3.3 names". AC-3.3 names
four surviving behaviours (harvest guard, scope-field **and REQ-size** warnings, consolidation
nudge), and `FIVE_SCRIPTS` was never coextensive with that set: it omits `check-req-size.sh`,
which is tracked `100755` and registered at `pdlc/hooks/hooks.json` (second `PostToolUse`
command, alongside `check-scope-field.sh`). The re-home in §5.2's TT-3 is therefore a **widening**,
not a copy — the post-sweep enumeration is five scripts, `FIVE_SCRIPTS`'s three survivors plus
`check-req-size.sh` (which ships today with no mode-bit oracle at all) plus the new
`cleanup-consumer-workflows.sh`. Deleting the host module drops the mode-bit
oracle for **three still-shipped scripts**, not only for two retired ones — and
`bootstrap.test.js` is the sole module in the repo asserting that constraint (`grep -rn "100755"
pdlc/workflows/__tests__/*.test.js` returns it alone; the only other `126` reference,
`driftOrdering.test.js`, is itself deleted in class 3). A lost mode bit ships silently and the
hook simply stops firing, per CLAUDE.md's fresh-clone rule ("invoked by bare path, no
`bash`/`sh` prefix; 126 means the mode bit was lost") — a live project constraint. §5.2's TT-3
therefore re-homes the assertions over the **whole post-sweep shipped-script set** — the four
surviving hook scripts plus the new `cleanup-consumer-workflows.sh` — enumerated set-equally, so
that deleting `bootstrap.test.js` replaces the coverage rather than removing it, and so that the
one AC-3.3 hook that never had the oracle gains it.

**L-6 row 1 — queue-triage assertions.** Resolves to **no re-homed assertion**, but the
measurement is now pinned rather than asserted. `queueDriftGate.test.js` imports `main` plus
exactly four named symbols from `orchestrate-queue.js` (`:51`–`:56`) —
`validateDriftRecord`, `mapDriftState`, `readDriftStateSafely`,
`parseDistributionCheckEnabledOptOut` — every one of them owned by the deleted drift gate
(class 3); its `main()` assertions test the gate's placement and its interaction with the four
queue dispositions. The surviving half of that interaction — the queue's own report disposition
— is already asserted in `orchestrateQueue.test.js`, by four assertions whose titles are
transcribed here so FSPEC L-6 row 1 can carry a checkable covering citation and AT-1.3 reds if
one is renamed or deleted:

| Title | Site | Disposition covered |
|---|---|---|
| `returns no-queue when the queue file is missing` | `:366` | `no-queue` |
| `runs the pipeline for a ready entry and sets awaiting-merge` | `:379` | `ran` |
| `skips a blocked entry per triage and reports idle when none are ready` | `:457` | `idle` |
| `sets halted status when the pipeline halts` | `:496` | `halted` |

R-8's control is therefore discharged by measurement rather than by a move, and §5.3 lists the
four as protected: they are not edited in class 3, and if a later round does rename them, the
covering claim must be re-derived rather than restated.

**L-6 row 2 — hook-manifest / hook-behaviour assertions.** Host module:
`pdlc/workflows/__tests__/hookCompatibility.test.js`, retained in place (§2.6). It keeps
`PROP-COMPAT-04` (`check-scope-field.sh`), `PROP-COMPAT-05` (`guard-harvest-before-delete.sh`)
and `PROP-COMPAT-06` (`check-req-size.sh`), and loses only the `C7` block that asserts the
second `SessionStart` entry. L-4's set-equality over `hooks.json` is unaffected: **four**
entries survive (`pdlc/hooks/hooks.json:9,20,24,34`), one is deleted (`:42`). Nothing is
re-homed for this row; FSPEC's L-6 row 2 is transcribed as "host module retained, no move" at
C-6 re-measurement time.

### 4.5 The run-report comparison model (FSPEC AT-5.2, REQ AC-5.2)

The report compared is the engine-stamped report: the workflow module's own final report plus the
`engine` block that `stampReport(report, engine)` adds
(`pdlc/engine/lib/report.mjs`). `buildEngineBlock()` guarantees every field of that block is
**present** — an unknown scalar is `null`, an unknown collection `[]` — so a missing key is
always a real difference and never an "unknown value".

The comparison has two halves, and the excluded set is exhaustive: anything not listed is
value-compared.

1. **Field sets.** Enumerate every key path in both reports and require set-equality; an added
   or removed path fails. Two boundary rules keep the enumeration deterministic: (a) array
   members are compared by their own path, not per index; (b) **enumeration stops at the
   run-variable *key* level, not at the collection root.** Fixed-schema interiors are enumerated;
   only run-variable keys are stopped at. Concretely:

   | Path | Enumerated? | Why |
   |---|---|---|
   | `engine.dispatches.bySkill`, `engine.dispatches.byPhase` | yes | `buildEngineBlock()` seeds `dispatches` as `{ bySkill: {}, byPhase: {} }` — a fixed two-key schema (`pdlc/engine/lib/report.mjs`, `buildEngineBlock`) |
   | `engine.dispatches.bySkill.<skill-name>`, `engine.dispatches.byPhase.<phase>` | **no** | the keys are the skills/phases a given run happened to dispatch |
   | `engine.outcomes.{ran,halted,blocked,refused,"max-passes",idle}` | yes | seeded present-and-zero by `buildEngineBlock()`, whose contract is "zero-valued shape for `dispatches`/`outcomes`, never a missing key" |
   | `engine.authSources`, `engine.startup`, `engine.retries`, `engine.pauses`, `engine.denials` (array-valued) | members by path, interior stopped | list-valued, length and element content are run-variable (`Array.isArray(...) ? ….slice() : []`) |
   | `engine.loop` | yes at its own key | scalar-or-object, present by contract |

   Stopping at the collection *root* — the shape v0.2 stated — was too shallow: it let
   `engine.outcomes.blocked` or `engine.dispatches.byPhase` vanish in the sweep while clause 1
   passed on set-equality and clause 2 skipped the same paths as excluded, so AC-5.2's single
   behavioural-equivalence gate would no longer discharge "no field disappeared". At the
   run-variable key level, a lost outcome kind or dispatch axis reds clause 1, while a pre-sweep
   run that dispatched a different skill set still passes. AC-5.2's "compared for shape, never
   for content" binds both halves: the fixed schema down to and including the run-variable
   collection's own keys is set-compared, and the values beneath the run-variable keys are
   compared under neither clause. So clause 1 discharges "no field, no phase, no gate quietly
   disappeared with the deleted machinery".
2. **Values**, over the complement of this excluded list:

| Excluded key path | Why it differs between two correct runs |
|---|---|
| `engine.engineVersion`, `engine.pluginVersion` | version provenance — BR-VER-1 bumps the plugin, BL-07 ships an engine release |
| `engine.pluginRoot` | a path |
| `engine.startupAuth.catalogueId` | an id |
| `engine.authSources`, `engine.startup`, `engine.dispatches`, `engine.retries`, `engine.pauses`, `engine.denials`, `engine.loop`, `engine.outcomes` | REQ AC-5.2's eight run-variable collections — compared for **presence and shape**, never content |
| `engine.startedAt`, `engine.finishedAt` | timestamps |
| module-report feature name, any ISO-8601 timestamp field, any id field, any repo-relative path field | REQ AC-5.2's first four allowed classes |

**Value-compared, explicitly**: `engine.transport`, `engine.baseUrl`, `engine.tunables`,
`engine.permissionMode`, `engine.startupAuth.row`, and every module-report field outside the four
allowed classes above (phase list and per-phase disposition, outcome, queue-row disposition,
artifact lists, gate results). `engine.startupAuth.row` is value-compared on purpose: it is the
auth-source row C-1's evidence gate is about, and it must not change under a deletion sweep.

### 4.6 Version data (FSPEC BR-VER-1, REQ BL-07, C-10)

| Fact | Value at `2cd0d6b1` | Post-sweep |
|---|---|---|
| Plugin version (`pdlc/.claude-plugin/plugin.json`) | `0.23.1` | **`0.23.2`** |
| Repo engine's declared range (`pdlc/engine/package.json`, `pdlcPluginCompat`) | `^0.23.0` | unchanged by this feature |
| Published engine | `@kaneho/pdlc-engine@0.2.0`, declaring `pluginCompat: ^0.23.0` | BL-07's release may widen it; not required by `0.23.2` |
| Repo engine version (`pdlc/engine/package.json`, `version`) | `0.2.1` — **unpublished**; the newest tag is `engine-v0.2.0` | unchanged by this feature |

Under the handshake's leftmost-non-zero caret semantics (`pdlc/engine/lib/handshake.mjs`,
`satisfiesRange`), `^0.23.0` admits `0.23.x` and not `0.24.0`. Pinning the post-sweep version at
`0.23.2` therefore makes BL-07 satisfiable **without** a widened range having to land first — the
sweep is not gated on a release it does not need — while leaving the operator free to publish one.
A `0.24.0` bump is out of scope here precisely because it would turn C-10's handshake into an
outage on the retirement commit (E-19).

The published/repo split matters when the table is read at release time: BL-07's gate is
satisfied by the **published** `@kaneho/pdlc-engine@0.2.0`'s `pluginCompat: ^0.23.0`, which
admits `0.23.2`, so no release is on this sweep's critical path. The tree nonetheless carries an
unreleased `0.2.1` in `pdlc/engine/package.json`; whoever cuts `engine-v0.2.1` ships the same
`^0.23.0` range, so the gate reading is unchanged either way. Naming both versions keeps the
"published range" citation unambiguous.

### 4.7 `helpers/driftGenerators.js`'s surviving export set

```
seeded, resolveSeed, shrink
```

Re-measured at `2cd0d6b1` (`grep -rn "driftGenerators" pdlc/workflows/__tests__`, import sites
only — comment mentions in `driftRepoRoot.test.js:417`/`:486`, `forcePhases.test.js:160`,
`pacingWrapper.test.js:52`, `roundDerivation.test.js:24`, `completeness.test.js:22`,
`scanLines.test.js:17` and `helpers/seams.js:24` are **not** consumers):

| Consumer | Site | Post-sweep |
|---|---|---|
| `driftBackups.test.js` | `:46` (`seeded`, `resolveSeed`, `genId`, `genStamp`) | deleted |
| `driftBaseline.test.js` | `:56` (`enumerateEvidenceVectors`) | deleted |
| `driftFault.test.js` | `:37` (`readFaultTokens`, `seeded`, `resolveSeed`, `genId`) | deleted |
| `driftHook.test.js` | `:69` (`seeded`, `resolveSeed`) | deleted |
| `driftOrdering.test.js` | `:36` (`seeded`, `resolveSeed`) | deleted |
| `queueDriftGate.test.js` | `:60` (`enumerateLeaves`) | deleted |
| `approvalHash.test.js` | `:39` (`resolveSeed`, `seeded`, `shrink`) | survives |
| `completeness.test.js` | `:55` (`seeded`, `resolveSeed`, `shrink`) | survives |
| `forcePhases.test.js` | `:30` (`resolveSeed`, `seeded`) | survives |
| `pacingWrapper.test.js` | `:60` (`resolveSeed`, `seeded`, `shrink`) | survives |
| `roundDerivation.test.js` | `:36` (`seeded`, `resolveSeed`, `shrink`) | survives |
| `scanLines.test.js` | `:28` (`seeded`, `resolveSeed`, `shrink`) | survives |
| `helpers/mergeDoubles.js` | `:14` (`seeded`, `resolveSeed`) | survives |
| `consolidationPreflight.test.js` | `:173`, dynamic `await import(...)`, asserts `seeded`/`resolveSeed` exported | survives |

Twelve static `*.test.js` importers, six deleted and six surviving; plus the helper
`mergeDoubles.js` and one dynamic import site. **Eight surviving consumers**, which is exactly
the count and membership `docs/_constraints/pdlc-retirement-baseline.md` records for
`driftGenerators.js` — the earlier "eighteen modules / seven deleted / eleven survive"
statement was wrong in both directions (`driftRepoRoot` mentions the helper only in comments;
`advisoryConfig`, `advisoryEnvelope`, `advisoryEscalationLog` and `consolidationProperties` do
not consume it at all) and is withdrawn. §2.6 operation 3 now carries the same numbers.

The **surviving export set is unchanged** by the correction: `seeded`, `resolveSeed`, `shrink`
is the union of what the eight surviving consumers name. Implementation still re-derives the
consumer set by a fresh scan at sweep time rather than trusting this transcription, and the
baseline's removal list stays explicitly non-exhaustive (T-2, §6.3).

## 5. Test Strategy

The sweep's tests are mostly *existing* tests that must stay green; the new test surface is small
and concentrated on the two things this feature builds (the cleanup script, the delegators) and
on the replay that proves per-commit greenness.

### 5.1 Levels and doubles

| Level | Subject | Doubles |
|---|---|---|
| Shell integration | `cleanup-consumer-workflows.sh` | real temp directories built by the test (`mkdtempSync`), no mocks — the script's whole contract is filesystem-observable. Pattern reused from `hookCompatibility.test.js`'s `runHookScript()` (`spawnSync("bash", …)`, `:46`) rather than a new harness |
| Static/document | delegator skill files, docs, CI workflow files, `hooks.json` | source-text reads, the pattern the surviving oracles already use (`documentOracles.test.js`, `pdlc/engine/__tests__/ci-arrangement.test.js`) |
| Node unit | reduced `build-runtime.mjs` | `execFileSync("node", [build-runtime.mjs, "--check"])` over a temp copy — the pattern `consolidationBuild.test.js` already uses (`:156`–`:159`) |
| End-to-end | AC-5.1/AC-5.2 post-sweep run; AC-3.1 delegation; AC-3.2/3.5/3.6 handshake guards | a real engine run in this repo; the report artifact is the evidence, not an agent's summary |
| Replay | AC-1.8 | a scripted loop over the sweep's commit range running FSPEC L-9's three commands at each commit, output pasted |

No new test double library is introduced. Property-based tests reuse `driftGenerators.js`'s
surviving primitives (§4.7) — the repo's one seeded-PRNG library — rather than adding a second,
and the feature's one parameterisable component gets a property rather than three fixed
constructions: the cleanup script's classifier is a pure predicate over entry **names** (§3.2),
so §5.2's row TT-4 draws random subsets of §4.3's nine expected names, with and without an
unexpected name, and asserts the all-or-nothing behaviour §2.5 claims. Shrinking uses the
shipped `shrink`; the seed is reported on failure per the repo's existing `PDLC_PROP_SEED`
convention (`roundDerivation.test.js:231`).

**Handshake guards at end-to-end level (AC-3.6).** AC-3.6 needs a plugin version *outside* the
engine's declared range, and the post-sweep pair is inside it by construction (`0.23.2` against
`^0.23.0`, §4.6). The test constructs the out-of-range case without publishing anything: copy
the plugin root to a temp fixture, edit the copy's `.claude-plugin/plugin.json` `version` to
`0.24.0`, and point the engine run at that fixture root. Nothing in the real tree is mutated and
no release sits on the critical path.

### 5.2 New tests, by criterion

| AT | New test | Where |
|---|---|---|
| AT-4.1 | full-set cleanup: build a target holding all nine L-11 entries with a non-empty `.pdlc-backups/`, run once, assert directory gone, tracked files unchanged (`git status --porcelain` empty), exit `0` | new `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| AT-4.2 | second run over the cleaned tree: exit `0`, says nothing to clean, changes nothing | same |
| AT-4.3 | two constructions — an operator-named file, and a `.pdlc-tmp.<pid>.<rand>` residue — each asserting all four clauses: every expected entry present **and byte-identical** (content compared before/after), the unexpected entry byte-identical, its path on **stderr**, exit **exactly `3`** | same |
| TT-1 (contract row 4a) | usage error: an unknown flag (`--nope`) or a second positional argument exits **exactly `4`**, prints the usage line on stderr, and removes nothing — every entry of a fully-populated target still present and byte-identical | same |
| TT-1b (contract row 4b) | runtime failure: a target directory made unreadable (`chmod 000`, skipped when the test runs as root) exits **exactly `4`** and prints a diagnostic naming the failing path on stderr. Only these two conjuncts are asserted — the partial-`rm` arm of row 4b is deliberately unasserted, because failing one `rm` mid-loop is not constructible deterministically without faking the removal primitive, which the script does not inject; row 4b's "partial state reported" clause is therefore contract text an implementer codes to, not an oracle. The unreadable-target arm is asserted because it is cheap and would otherwise leave row 4b's **exit status** — shared with 4a but reached by a different path — with no coverage at all | same |
| TT-2 (contract row 5) | `--dry-run`, two constructions: over the full expected set it prints the same per-entry lines as a live run, exits `0`, and **every entry is still present and byte-identical afterwards** (positive conjunct, not merely "no error"); over a tree holding one unexpected entry it prints the refusing path on stderr, exits **exactly `3`**, and again removes nothing | same |
| TT-3 (bare-path invocation and mode bits) | Two halves. **(a) Bare path, new script only:** `cleanup-consumer-workflows.sh` is spawned **by path with no interpreter** (`spawnSync(scriptPath, […])`, not `spawnSync("bash", [scriptPath])`); status is one of `0`/`3`/`4` and **never `126`**. **(b) Mode bits, over the whole post-sweep shipped-script set:** an `it.each` over the set-equal enumeration `{ pdlc/hooks/scripts/cleanup-consumer-workflows.sh, check-req-size.sh, check-scope-field.sh, guard-harvest-before-delete.sh, nudge-consolidation.sh }` — **five** members post-sweep — asserts index mode `100755` and an executable on-disk file in a fresh clone, and a companion assertion requires the enumeration to **set-equal** the executable scripts actually tracked under `pdlc/hooks/scripts/` (re-derived inline from `git ls-files -s`), so a script added later without a mode bit fails rather than passes unlisted. `check-req-size.sh` is in the enumeration because it is tracked `100755` today, is registered in `pdlc/hooks/hooks.json` as the second `PostToolUse` command, and is one of the behaviours AC-3.3 names (REQ-size warnings) — it was never a `FIVE_SCRIPTS` member, so the re-home widens the set rather than copying it (§4.4). No `lib/` carve-out is stated: `lib/pdlc-drift.sh` is the only file there and M-2 deletes it, so post-sweep the directory is gone and an exclusion would read as a live constraint over an empty set. The companion assertion is deliberately **one-directional** — tracked-executable ⇒ enumerated — and says nothing about `hooks.json` registration: AC-1.7's own hook-set equality over the four surviving manifest entries owns that direction, and `cleanup-consumer-workflows.sh` is deliberately never registered (§3.2), so a converse clause here would either be redundant with AC-1.7 or would have to carve that script out again. Re-homes `bootstrap.test.js`'s §9.3 mode-bit block and its dedicated never-126 assertion, which the sweep deletes (§4.4). **Collaborators:** index mode is re-derived inline via `git ls-files -s` — `indexMode` lives in `helpers/driftHarness.js`, deleted by M-8 — while the fresh-clone half imports `makeFreshClone` from `helpers/freshClone.js`, which is **not** an M-8 member and survives; after the sweep `consumerCleanup.test.js` is that helper's sole consumer (today it is `bootstrap.test.js`'s), so the helper must not be swept as collateral | same |
| TT-4 (classifier property) | property over the name-only classifier, seeded from `helpers/driftGenerators.js`'s surviving `seeded`/`resolveSeed`/`shrink` (§4.7): for a random subset of §4.3's nine expected names **plus at least one unexpected name**, the run removes **nothing** and exits `3`; for a random subset of the expected names **alone**, it removes exactly that subset and exits `0`. This is what makes §2.5's all-or-nothing claim checkable over more than three fixed constructions | same |
| TT-5 (reduced builder emission) | run the reduced `build-runtime.mjs` against a clean temp `dist/`: the emitted file set **set-equals `{pdlc-cli.mjs}`** (a surviving bundle or a silently-emitted manifest fails), stdout carries exactly one `wrote`/`in-sync` row, and after mutating the artifact `--check` prints `STALE pdlc/workflows/dist/pdlc-cli.mjs` on stderr and exits `1`. §3.1's emission contract is otherwise asserted only by construction (§2.3), which is not an oracle | extends `consolidationBuild.test.js`'s T32 block |
| AT-4.4 | leftovers-present engine run reaches its configured final phase; the written report is compared against the no-leftovers report by AT-5.2's field-set rule; neither output nor report names a leftover path | engine-run evidence + report diff |
| AT-3.1 | delegation: tool-invocation sequence has length 1, a non-empty dispatch record in the report, relayed fields intact; static half is **conjunctive, not absence-only** — for each of the two delegator files assert (a) the invocation line is present verbatim (`pdlc dev <req-path>` / `pdlc queue`), (b) the three-step resolution ladder of §3.3 is present, (c) the refusal text names the install command, **and** (d) no selection / readiness / dispatch / verdict-parsing / queue-writeback text remains. An empty or truncated file fails (a)–(c) instead of passing (d) vacuously | transcript evidence + source-text assertions beside the surviving skill oracles |
| AT-3.3 clause 2 | The **four** surviving `hooks.json` entries still own their documented contract, asserted per hook rather than as one blanket shape: `nudge-consolidation.sh`, `check-scope-field.sh` and `check-req-size.sh` each emit a `hookSpecificOutput.additionalContext` JSON object on stdout **and** exit `0`; `guard-harvest-before-delete.sh` is a **PreToolUse blocker** whose observable message is on **stderr** with exit **2** on a blocked delete and `0` otherwise (`sys.stderr.write(…)`/`sys.exit(2)` in its embedded Python). Asserting `additionalContext`+`0` over the guard would be a false oracle | Two host modules, one per conjunct. `check-scope-field.sh`'s strengthening lands in the retained `hookCompatibility.test.js` (§2.6) in class 6's reduction commit: `PROP-COMPAT-04` already asserts the exit status (`expect(exitCode).toBe(0); // advisory hook never blocks`, `hookCompatibility.test.js`, the `PROP-COMPAT-04` block) but only `stdout` *containment* of the strings `hookSpecificOutput` and `Scope`, so what is missing is the parsed-JSON half alone — it is strengthened to `PROP-COMPAT-06`'s shape, `JSON.parse(stdout).hookSpecificOutput.additionalContext`, giving the clause equal strength per hook, and the exit assertion is **not** duplicated. `nudge-consolidation.sh`'s new assertion lands in `consolidationHookParity.test.js`, beside the parity corpus that already spawns it, because that hook has **no** exit-status oracle at all — `consolidationHookParity.test.js` asserts `additionalContextOf(…)` parity over a corpus, and its `expect(result.status).toBe(0)` is a `git ls-files` call, not the hook's exit — so a new stdout-JSON-plus-exit-`0` assertion for it is added there (v0.2's citation of that file as already covering the conjunct is withdrawn). `PROP-COMPAT-05` already carries the guard's stderr/non-zero form |
| AT-1.8 | replay harness output | committed transcript under `docs/pdlc-plugin-retirement/` |

AT-4.4 costs **one additional engine run**, not a reuse of BL-08's pre-sweep capture: both of its
reports are post-sweep runs in the same session — one over a tree still holding leftovers, one
over the cleaned tree — compared under §4.5's field-set rule. BL-08's pre-sweep report is
consumed by AT-5.2 (behavioural equivalence across the sweep) and cannot double as the
no-leftovers arm, because it predates the cleanup step entirely. §6.3's operator obligations
budget accordingly: BL-08's one pre-sweep run, one post-sweep AC-5.1/5.2 run, and AT-4.4's pair.

`consumerCleanup.test.js` is the one new `*.test.js` module the sweep adds, and it is already
counted in §4.4's post-sweep literal (**99**), so the suite-size criterion stays an equality
rather than a floor.

### 5.3 Tests that must keep passing, and how they are protected

- **`pdlc/engine/__tests__/ci-arrangement.test.js`** derives its rows from FSPEC §5.1's
  required-check set and asserts CLAUDE.md's CI table, its **count word** and `publish.yml`'s
  gate command set. It reds on class 1 unless the workflow files, both documents' count words and
  the oracle's own explanatory prose move in that one commit. This is the single largest
  correctness hazard in the sweep and the reason C-7 outranks C-5 for class 1 (BR-SWEEP-3).
- **`pipelineWiring.test.js`** and **`consolidationPreflight.test.js`** read
  `build-runtime.mjs`'s source text (§2.8) — corrected in the commit that deletes the symbols
  they name, never after.
- **`documentOracles.test.js`** D-1/D-2 assert CLAUDE.md *contains* retired script names; prose
  and oracle move together in class 9 (BR-SWEEP-4's prose exception).
- **`coveredViolations`** (`pdlc/workflows/lib/document-oracles.mjs`) walks the whole tree
  skipping only `.git/` and `node_modules/`, so an untracked local file can red it independently
  of the diff. AT-1.6 is judged on a **clean tracked-files-only checkout** (E-6); the replay
  harness therefore runs from `git worktree add` of each commit, not from the working tree.
- **`orchestrateQueue.test.js`**'s four disposition assertions are the covering evidence for
  L-6 row 1 (§4.4); they must not be edited by class 3, or the coverage claim that made the
  re-home unnecessary becomes false.

### 5.4 Per-commit gate and the replay

Every commit runs FSPEC L-9's three commands — `npm test` in `pdlc/workflows`, `npm ci && npm
test` in `pdlc/engine`, and `bash -n` over `git ls-files '*.sh'`. The replay is mechanical:

```sh
for c in $(git rev-list --reverse <base>..HEAD); do
  git worktree add -d "$WT" "$c" && ( cd "$WT" && <L-9 commands> ) || exit 1
done
```

Two properties this buys, both required rather than nice: red-and-repaired-next-commit is caught
(BR-SWEEP-2), and the class claim per commit is auditable hunk by hunk (AT-1.8 judges the
`(file, section)` pair, so a commit touching CLAUDE.md is checked against the sections its class
owns).

**The replay transcript is operator-read evidence, not a parsed artifact.** AT-1.8's oracle is
the harness's exit status — the loop above fails on the first red commit — plus the human-checked
`(file, section)` class claim. The committed transcript under `docs/pdlc-plugin-retirement/`
records per-commit exit statuses and each suite's counts (E-23) for a reader; **no implementer
builds a transcript parser**, and nothing downstream asserts its format.

The pre-sweep green start is not assumed: BL-08's transcript must record the suites' counts (tests
run, passed, failed), because a suite that executed zero tests also exits 0 (E-23).

### 5.5 Deleted, never skipped

No **unregistered** `skip`, no pending marker, no assertion left vacuously true over an empty
directory (C-8, BR-SWEEP-6). AT-1.3 asserts this repo-wide, not only over M-8's modules: a skip
introduced in a *surviving* module is the same defect as one left behind.

**"Unregistered" reconciles this rule with TT-1b.** §5.2's TT-1b constructs an unreadable target
(`chmod 000`), which cannot be constructed as root, so the row is root-conditional — and the module
that hosts it (`consumerCleanup.test.js`) is one the sweep *introduces*, so a bare `it.skip` there
would register exactly the marker AT-1.3 is written to catch. The repo already owns the mechanism
that settles this: `itOrSkip` (`pdlc/workflows/__tests__/helpers/driftCapabilities.js`, exported
alongside the frozen `SKIP_INVENTORY` ledger in the same module) is used this way by
`skipSinkTransport.test.js` and `documentOracles.test.js`. TT-1b takes its skip through that sink
with a `SKIP_INVENTORY` capability entry naming the root/`chmod 000` gap; the skip is then a
*declared* capability gap carried on the ledger, not a silent pending marker. AT-1.3's clause reads
"no skip absent from the skip sink's inventory", so a skip the sweep adds without a sink
registration still fails it. Pinning the gate runner to non-root is not the alternative taken:
capability, not the runner, decides, and a root CI runner must still report the gap rather than
silently pass.

**Deleted, nothing left orphaned.** AT-1.3's field set does not reach non-`*.test.js` files (REQ
AC-1.3 counts `*.test.js` modules and names retained ones), so §2.6's helper dispositions get their
own assertion, landing in `consumerCleanup.test.js` beside TT-3 in the class-3 commit: after the
sweep, **every** surviving `*.js` file directly under `pdlc/workflows/__tests__/helpers/` is either
(a) imported by at least one surviving test module or helper, **or** (b) referenced by Jest
configuration in `pdlc/workflows/package.json` — the `globalSetup` / `globalTeardown` keys, which
today name `__tests__/helpers/skipSinkSetup.js` and `__tests__/helpers/skipSinkTeardown.js`. Both
channels are real wiring: neither setup file has an importer under `__tests__/*.test.js` today
(`skipSinkTeardown.js`'s only mention is a comment in `driftHelpers.test.js`, a module M-8 deletes),
yet both are load-bearing for the skip sink and both survive the sweep. A single-channel universal
would therefore go red against green infrastructure.

Three scope rules keep the assertion set-derived rather than a transcribed exception list:

1. **Both channels are re-derived, not transcribed.** Channel (a) greps the *surviving* `__tests__`
   tree; channel (b) reads the `globalSetup` / `globalTeardown` values out of
   `pdlc/workflows/package.json` at assertion time. A future helper wired through either channel
   passes without an edit here; one wired through neither reds.
2. **Match import specifiers, not bare names.** Channel (a) matches the specifier forms actually
   used — `"./helpers/<name>.js"` in `import`/`require` position and `new URL("./helpers/<name>.js",
   …)` — not a bare-name grep, which a stale comment (exactly `driftHelpers.test.js`'s mention of
   `skipSinkTeardown.js`) would satisfy. Channel (b) compares resolved paths, not substrings.
3. **`*.js` directly under `helpers/`, not `helpers/bin/`.** M-8 deletes all three
   `helpers/bin/*.sh` drivers, leaving that directory empty post-sweep; shell drivers are *spawned*,
   not imported, so an import-graph oracle cannot judge them. Scoping the universal to `*.js` files
   at the top level of `helpers/` keeps a later re-added shell driver from reddening the oracle for
   a reason unrelated to orphan-freedom.

The assertion is written in the positive direction on purpose — `helpers/freshClone.js` must be
imported by name — so that a sweep taking collateral files with it reds instead of passing
vacuously. Its coverage is the **survival** direction: it makes "`driftCapabilities.js` and
`skipSink.js` survive and are still consumed" checkable rather than prose. The complementary claim
that "`driftOrdering.js` ends the sweep consumer-less" is a **pre-sweep** measurement recorded in
§2.6 (at the base commit its only importers are `bootstrap.test.js` and `drift*.test.js` modules,
all of which the sweep deletes); once the file is gone no post-sweep predicate can distinguish
"correctly deleted because consumer-less" from "deleted by mistake", so that half is justified by
the §2.6 measurement, not re-checked by this oracle.

## 6. Open Questions

### 6.1 Upstream errata raised (not folded in here)

Eight claims and open surfaces in the upstream documents do not survive a check against the tree at `2cd0d6b1`.
Each is raised for the owning document's targeted versioned edit; none is fixed by this TSPEC.

1. **FSPEC — M-11p's dependent set is missing two gate-read dependents of the build step.**
   `pipelineWiring.test.js`'s `devMeta()` reads the `DEV_META` template out of
   `build-runtime.mjs` and its `RLH-CR-F1` / `RLH-CR-F7` assertions compare the two
   hand-maintained `meta.inputs` copies; `consolidationPreflight.test.js`'s `T00 — BL-PREREQ:
   build-runtime.mjs source-text presence` block requires `QUEUE_META`, `QUEUE_ENTRY` and
   `bundles` to be declared there, and its sibling block requires two declarations *inside*
   `runtimeBundle.test.js`, which class 6 deletes. Both red the sweep (class 7 and class 6
   respectively) and neither is in M-11p or in the baseline's per-file dispositions.
   Disposition pending that edit: §2.8.

2. **FSPEC — `pdlc/workflows/runtime-adapter.js` is orphaned by the sweep and appears in no
   row.** Its only consumer is `build-runtime.mjs`'s bundle emission (`const adapter =
   readFileSync(… "runtime-adapter.js")`), which class 7 deletes; the engine does not port it
   (`pdlc/engine/lib/adapter.mjs` says so explicitly) and `prepack.mjs`'s `MODULE_NAMES` vendors
   only `orchestrate-dev.js` and `orchestrate-queue.js`. No L-2 term matches its name, so the
   sweep command cannot see it — a third instance of E-3's "dependent no search term reaches",
   beside the two the baseline names. Its test surface (`adapterProbe.test.js`,
   `helpers/adapterHarness.js`) is likewise unrowed. This TSPEC leaves it untouched (§2.8).

3. **FSPEC — `consolidate-learnings` has no surviving execution host, so M-11n's rewrite has
   nothing to name.** Class 7 deletes `consolidate-learnings.bundle.js` (M-10), the module's only
   host: it needs agent-backed seams (`rtConsInjections()` supplies `_agent`, `_readFile`,
   `_writeFile`, … in `runtime-adapter.js`), so it cannot be run as plain Node; and the engine's
   command surface is `dev`, `queue`, `doctor` only (`pdlc/engine/bin/cli.mjs`,
   `FLAGS_BY_COMMAND`), with `consolidate-learnings` listed in `OPERATOR_ONLY_SKILLS` as a skill
   *no workflow module dispatches*. FSPEC §3.1 class 11 and M-11n instruct rewriting
   `consolidate-learnings/SKILL.md:11`'s bundle reference "to name the surviving execution path";
   post-sweep there is none. This is a live capability the sweep would remove, which REQ NG-3
   does not contemplate.

4. **REQ/baseline — A-1's allow-list does not cover the two files this TSPEC creates.** The
   cleanup script (`pdlc/hooks/scripts/cleanup-consumer-workflows.sh`) and its oracle
   (`pdlc/workflows/__tests__/consumerCleanup.test.js`) must transcribe §4.3's nine expected
   names literally, and three of those names match L-2 terms verbatim (`\.bundle\.js` ×3,
   `pdlc-drift-state`). Both files are tracked, and L-3's expected-empty command greps
   `git ls-files`, so AC-1.2 reds permanently unless A-1 gains the two named rows. A-1 today
   covers `docs/completed/**`, `docs/discarded/**`, `docs/_decisions/**`, the baseline file,
   `**/LEARNINGS-*.md` / `**/POSTMORTEM-*.md`, two test-fixture corpora and `QUEUE.md` — nothing
   under `pdlc/hooks/scripts/`. Requested edit: two path rows, not a glob (§4.3). Owning
   documents: `docs/_constraints/pdlc-retirement-baseline.md` §A-1 and FSPEC L-3's transcription
   of it.

5. **REQ C-5 / FSPEC M-11h — the wave-gate config values do not retire with `dist/`.**
   `.claude/pdlc.config.example.json`'s `postWaveCommand` (`node pdlc/workflows/build-runtime.mjs`)
   and `postWavePathspecs` (`["pdlc/workflows/dist/"]`) both stay valid and load-bearing after
   the sweep (§2.2): `dist/pdlc-cli.mjs` remains tracked and `consolidationBuild.test.js`'s T32
   `--check` assertion survives, so without the post-wave regeneration a later wave that edits a
   `CLI_SOURCES` input leaves the artifact stale and reds the suite. If M-11h's per-file
   disposition assumed both values retire, it should be corrected to "prose only"; class 10
   (§2.9) is scoped accordingly.

6. **FSPEC L-5 — `hookCompatibility.test.js`'s M-8 membership is a reduction, not a deletion.**
   L-5 defines M-8 as 21 modules and derives 119 − 22 = 97 by deleting all of them;
   §2.6 retains `hookCompatibility.test.js` in place because its three `PROP-COMPAT-*` blocks are
   the only workflow-suite coverage of three surviving hooks. The module therefore moves out of
   M-8's deletion set into class 6's *reduction* set, and the post-sweep suite literal becomes 99
   (§4.4). Membership and count are one correction, not two: correcting the number while leaving
   the module inside M-8 would leave AC-1.3 asserting a deletion the sweep does not perform.


7. **REQ/FSPEC — the cleanup tool's usage-error and `--dry-run` rows have no owning criterion.**
   §3.2's contract has five rows; AC-4.1…AC-4.4 and BR-CLN-1…6 cover three. Rows 4 (`exit 4` on
   usage error) and 5 (`--dry-run` previews and removes nothing) are TSPEC-introduced operator
   surface. This TSPEC covers them with tests (§5.2, TT-1/TT-2) rather than dropping them, but
   product ownership of a new operator-facing flag belongs upstream: either an AC-4.5 pinning
   the preview contract, or a REQ decision to drop `--dry-run`, in which case §3.2 row 5 and
   TT-2 go with it.
   Amended in v0.3: the usage-error row is now **two** rows — 4a (argument-parse error: nothing
   touched, exit `4`) and 4b (runtime failure: partial removal possible, exit `4`) — because only 4a
   is assertable as "removes nothing". An upstream criterion should own the pair, not the merged row.


8. **FSPEC / baseline M-8 — `helpers/driftOrdering.js` is swept but belongs to no disposition.**
   M-8 names six helper files (`helpers/drift{Fixtures,Harness,Probe}.js`,
   `helpers/bin/{backup-grammar,lib-probe,percent-encode-driver}.sh`) and the baseline's own note
   asserts that every importer of the helper modules is inside M-8's 21. `helpers/driftOrdering.js`
   is a seventh: measured at the base commit its only importers are `bootstrap.test.js` and
   `drift*.test.js` modules, all of which the sweep deletes, so it ends the sweep consumer-less.
   §2.6 deletes it under class 3, but no upstream row owns that deletion and AC-1.3's field set
   cannot see it (a helper is not a `*.test.js` module). Either M-8 gains it as a seventh helper
   member, or AC-1.3 gains an orphan-freedom conjunct; §5.5 asserts the property either way, so
   this erratum is about ownership, not about coverage.


### 6.2 Successor work bound under REQ NG-5

| # | Item | Why it is not authored here |
|---|---|---|
| SUCC-1 | Phase MERGE's guard-path set does not cover `pdlc/engine/` (§2.7) | `MERGE_GUARD_DEFAULTS` lives in a module the engine vendors verbatim; changing it changes engine runtime behaviour |
| SUCC-2 | A host for the consolidation pass (erratum 3) — the natural shape is a `pdlc consolidate` command reusing the engine's existing adapter | new engine capability, squarely NG-5 |

### 6.3 Obligations carried into implementation

| # | Obligation | Owner |
|---|---|---|
| O-A (FSPEC) | BL-03's adoption evidence captured and cited by path + commit | operator, before the first deletion commit |
| O-B (FSPEC) | BL-08's pre-sweep report and gate transcript committed, with suite counts visible (E-23) | operator, before the first deletion commit |
| T-1 | Re-run C-6's partition at the sweep's base commit and re-transcribe every FSPEC literal, including §4.4's corrected suite size | implementer, §3.0 entry gate |
| T-2 | Re-derive `driftGenerators.js`'s surviving export set by a fresh consumer scan (§4.7) rather than trusting the transcription | implementer, class 6 |
| T-3 | Enumerate the instructional-document per-file list for class 12 at re-measurement time (REQ O-5) | implementer, PLAN |
| T-4 | **Blocking:** do not land class 13 (`cleanup-consumer-workflows.sh`) or its test module until erratum 4's A-1 allow-list rows are on the branch. Until then AC-1.2 is red by construction and the class-13 commit cannot pass the per-commit gate (§5.4) | implementer, before class 13 |
| T-5 | **Blocking:** do not land class 7 (bundle deletion) or class 11 (skill rewrites) until erratum 3 has an upstream disposition — either a named surviving execution host for `consolidate-learnings`, or an explicit REQ decision that the skill ships without one. Class 7 removes the only host and class 11 is instructed to *name* it; landing either first ships a skill that cannot run and hides the loss (REQ NG-1, NG-3) | implementer, before classes 7 and 11 |
| T-6 | Re-check `hookCompatibility.test.js`'s retention at re-measurement: if any assertion outside the `C7` block depends on the drift hook, the disposition flips from reduction back to deletion and erratum 6's correction changes with it | implementer, class 6 |

### 6.4 Risks this design carries

- **The class-1 commit is large and cannot be split** (BR-SWEEP-3). Its blast radius is three
  workflow files, one engine oracle and two documents' count words. Control: it lands first, so
  every later commit replays against a known-good CI arrangement.
- **The retained `hookCompatibility.test.js` (§2.6) is a deviation from M-8's stated membership.**
  If the re-measurement finds an assertion in it that *does* depend on the drift hook beyond the
  `C7` block, the retention becomes a partial deletion instead. Control: the module is 371 lines (`wc -l`)
  and self-contained; the disposition is re-checked at re-measurement.
- **The cleanup script's name-only predicate cannot protect a hand-modified expected entry**
  (BR-CLN-3a, C-9). Accepted upstream; stated here so no implementer adds a hash check that would
  need a manifest the sweep deletes.
