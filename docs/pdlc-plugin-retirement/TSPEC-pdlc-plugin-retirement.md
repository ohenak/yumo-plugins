# TSPEC — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-plugin-retirement.md` (v0.11) → `FSPEC-pdlc-plugin-retirement.md` (v0.5) → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | — |
| LEARNINGS | `docs/pdlc-plugin-retirement/LEARNINGS-pdlc-plugin-retirement.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-17 |

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
`pdlc/hooks/hooks.json`, `pdlc/.claude-plugin/plugin.json`. Three claims the upstream documents
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

The surviving `bundles` array becomes a single row (`file: "pdlc-cli.mjs"`), so the emission loop
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
3. **Reduce** `helpers/driftGenerators.js` to the primitives surviving modules import. Measured
   at `2cd0d6b1`: eleven `*.test.js` modules import it, of which seven survive the sweep, and the
   surviving import set is exactly `seeded`, `resolveSeed`, `shrink` (plus
   `consolidationPreflight.test.js:172`, which asserts `seeded`/`resolveSeed` are exported, and
   `helpers/mergeDoubles.js:14`, which imports `seeded`/`resolveSeed`). The named symbols the
   baseline lists for removal (`C1_PATH`, `MANIFEST_CHAIN_VECTORS`, `readFaultTokens`,
   `enumerateLeaves`, `enumerateEvidenceVectors`, `genId`, `genStamp`) all lose their last
   consumer with `driftFault`, `driftBaseline`, `driftBackups` and `queueDriftGate`. The
   reduction is derived by a **fresh consumer scan at implementation time**, not by transcribing
   that list (baseline M-11p states it is non-exhaustive).

Queue-triage re-homing is §4.4's L-6 row 1; hook re-homing collapses to operation 2 above, so
L-6's row 2 names a module that is not newly created.

### 2.7 Phase MERGE's guard paths (FSPEC O-D, REQ O-4)

`MERGE_GUARD_DEFAULTS` (`pdlc/workflows/orchestrate-dev.js:48`–`:53`) is
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
| 6 | 20 `*.test.js` deletions + `runtimeProvenanceWiring.test.js` + 6 helpers + `hookCompatibility.test.js` reduction + `orchestrateQueue.test.js` re-home + `driftGenerators.js` reduction |
| 7 | `build-runtime.mjs` reduction (§2.3), 3 bundles + manifest deleted, `pipelineWiring.test.js` / `consolidationPreflight.test.js` corrections (§2.8) |
| 8 | `.worktreeinclude` (file deleted — single row), `.gitignore` row + ~20-line comment block |
| 9 | `lib/document-oracles.mjs` packaging/advertised-version checks + exemptions, `documentOracles.test.js` D-1/D-2, `fixtures/covered-violations/` re-fixturing, CLAUDE.md prose those oracles guard |
| 10 | `.claude/pdlc.config.example.json` two values, CLAUDE.md wave-gate prose, `consolidationPreflight.test.js:205`–`:208` |
| 11 | two delegator rewrites (§2.4), `consolidate-learnings/SKILL.md:11`, three module banners, `orchestrateDevSkill.test.js:93` |
| 12 | CLAUDE.md, `pdlc/OPERATIONS.md`, both READMEs, `pdlc/RELEASE-CHECKLIST.md`, `DECISIONS-plugin-distribution.md`, `QUEUE.md`, stored operator notes |
| 13 | `cleanup-consumer-workflows.sh` + its documentation and tests (§3.2) |

## 3. Interfaces

## 4. Data Model

## 5. Test Strategy

## 6. Open Questions
