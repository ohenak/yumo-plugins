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
| 4 | usage error (unknown flag, unreadable target, `rm` failure) | nothing removed beyond what a partial `rm` already did, reported | stderr: diagnostic | `4` |
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

This TSPEC adds no member to FSPEC L-2's seven terms and removes none. Nothing it decides
introduces a new retired identifier: the cleanup script's name
(`cleanup-consumer-workflows.sh`) deliberately contains none of the seven, so the script's own
source cannot red AT-1.2.

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

### 4.4 Suite-size and re-home literals (FSPEC L-5, L-6; REQ AC-1.3, R-8)

**Suite size.** `pdlc/workflows/__tests__/*.test.js` counts **119** at `2cd0d6b1` (measured).
Two decisions here move the FSPEC's currently-pinned post-sweep literal of 97:

- §2.6 retains `hookCompatibility.test.js`, so the sweep deletes **21** modules — M-8's twenty
  drift/bundle-dedicated modules plus `runtimeProvenanceWiring.test.js` — not 22;
- §5.2 adds **one** new module, `consumerCleanup.test.js`, for the step §3.2 introduces.

Post-sweep count: 119 − 21 + 1 = **99**. Per ASM-2's veto path this is corrected in the FSPEC at
C-6 re-measurement time, transcribed from the tree rather than from this arithmetic; it is never
satisfied by a test that counts loosely.

**L-6 row 1 — queue-triage assertions.** Resolves to **no re-homed assertion**, by measurement.
`queueDriftGate.test.js` imports exactly four symbols from `orchestrate-queue.js` —
`validateDriftRecord`, `mapDriftState`, `readDriftStateSafely`,
`parseDistributionCheckEnabledOptOut` — and every one of them is deleted with the gate (class 3);
its `main()` cases assert the gate's placement and its interaction with the four queue
dispositions. The surviving half of that interaction — that the queue returns a report for each
disposition — is already asserted in `orchestrateQueue.test.js`, in four assertions covering
`no-queue` (`:366`), `ran` (`:379`), `idle` (`:457`) and `halted` (`:496`). R-8's control is
therefore discharged by measurement rather than by a move, and the FSPEC's L-6 row 1 is
transcribed as empty with those four titles cited as the covering evidence.

**L-6 row 2 — hook-manifest / hook-behaviour assertions.** Host module:
`pdlc/workflows/__tests__/hookCompatibility.test.js`, retained in place (§2.6). It keeps
`PROP-COMPAT-04` (`check-scope-field.sh`), `PROP-COMPAT-05` (`guard-harvest-before-delete.sh`)
and `PROP-COMPAT-06` (`check-req-size.sh`), and loses only its `C7` block, whose subject is the
drift hook's `SessionStart` registration — which L-4's set-equality now asserts in full, so it is
dropped rather than re-homed twice. Verbatim assertion titles are transcribed into the FSPEC at
re-measurement time; the placement decision is this row.

### 4.5 The run-report comparison model (FSPEC AT-5.2, REQ AC-5.2)

The report compared is the engine-stamped report: the workflow module's own final report plus the
`engine` block that `stampReport(report, engine)` adds
(`pdlc/engine/lib/report.mjs`). `buildEngineBlock()` guarantees every field of that block is
**present** — an unknown scalar is `null`, an unknown collection `[]` — so a missing key is
always a real difference and never an "unknown value".

The comparison has two halves, and the excluded set is exhaustive: anything not listed is
value-compared.

1. **Field sets.** Enumerate every key path of both reports (recursively; array members are
   compared as the array's path, not per index) and require set-equality. An added *or* removed
   path fails. This is the clause that discharges "no field, phase or gate disappeared with the
   deleted machinery".
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

Under the handshake's leftmost-non-zero caret semantics (`pdlc/engine/lib/handshake.mjs`,
`satisfiesRange`), `^0.23.0` admits `0.23.x` and not `0.24.0`. Pinning the post-sweep version at
`0.23.2` therefore makes BL-07 satisfiable **without** a widened range having to land first — the
sweep is not gated on a release it does not need — while leaving the operator free to publish one.
A `0.24.0` bump is out of scope here precisely because it would turn C-10's handshake into an
outage on the retirement commit (E-19).

### 4.7 `helpers/driftGenerators.js`'s surviving export set

```
seeded, resolveSeed, shrink
```

Measured at `2cd0d6b1`: eighteen `*.test.js` modules import the helper. Seven are deleted by the
sweep (`driftBackups`, `driftBaseline`, `driftFault`, `driftHook`, `driftOrdering`,
`driftRepoRoot`, `queueDriftGate`) and eleven survive (`advisoryConfig`, `advisoryEnvelope`,
`advisoryEscalationLog`, `approvalHash`, `completeness`, `consolidationPreflight`,
`consolidationProperties`, `forcePhases`, `pacingWrapper`, `roundDerivation`, `scanLines`), as
does `helpers/mergeDoubles.js` (`seeded`, `resolveSeed`). `consolidationPreflight.test.js`
additionally asserts that `seeded` and `resolveSeed` are exported. The set
above is what those consumers name. The implementation re-derives it by a fresh consumer scan at
sweep time rather than trusting this transcription, because the baseline's removal list is
explicitly non-exhaustive.

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
surviving primitives (§4.7) — the repo's one seeded-PRNG library — rather than declaring a second
one.

### 5.2 New tests, by criterion

| AT | New test | Where |
|---|---|---|
| AT-4.1 | full-set cleanup: build a target holding all nine L-11 entries with a non-empty `.pdlc-backups/`, run once, assert directory gone, tracked files unchanged (`git status --porcelain` empty), exit `0` | new `pdlc/workflows/__tests__/consumerCleanup.test.js` |
| AT-4.2 | second run over the cleaned tree: exit `0`, says nothing to clean, changes nothing | same |
| AT-4.3 | two constructions — an operator-named file, and a `.pdlc-tmp.<pid>.<rand>` residue — each asserting all four clauses: every expected entry present **and byte-identical** (content compared before/after), the unexpected entry byte-identical, its path on **stderr**, exit **exactly `3`** | same |
| AT-4.4 | leftovers-present engine run reaches its configured final phase; the written report is compared against the no-leftovers report by AT-5.2's field-set rule; neither output nor report names a leftover path | engine-run evidence + report diff |
| AT-3.1 | delegation: tool-invocation sequence of length 1, non-empty dispatch record in the report, relayed fields intact; plus the static half — neither delegator file contains selection/readiness/dispatch/verdict/queue-write text | transcript evidence + a source-text assertion beside the surviving skill oracles |
| AT-3.3 clause 2 | the three surviving hooks emit `hookSpecificOutput.additionalContext` on **stdout as a JSON object** and exit **0** | retained `hookCompatibility.test.js` (§2.6) |
| AT-1.8 | replay harness output | committed transcript under `docs/pdlc-plugin-retirement/` |

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

The pre-sweep green start is not assumed: BL-08's transcript must record the suites' counts (tests
run, passed, failed), because a suite that executed zero tests also exits 0 (E-23).

### 5.5 Deleted, never skipped

No `skip`, no pending marker, no assertion left vacuously true over an empty directory (C-8,
BR-SWEEP-6). AT-1.3 asserts this repo-wide, not only over M-8's modules: a skip introduced in a
*surviving* module during the sweep is the same defect.

## 6. Open Questions

### 6.1 Upstream errata raised (not folded in here)

Three claims in the upstream documents do not survive a check against the tree at `2cd0d6b1`.
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

### 6.4 Risks this design carries

- **The class-1 commit is large and cannot be split** (BR-SWEEP-3). Its blast radius is three
  workflow files, one engine oracle and two documents' count words. Control: it lands first, so
  every later commit replays against a known-good CI arrangement.
- **The retained `hookCompatibility.test.js` (§2.6) is a deviation from M-8's stated membership.**
  If the re-measurement finds an assertion in it that *does* depend on the drift hook beyond the
  `C7` block, the retention becomes a partial deletion instead. Control: the module is 300 lines
  and self-contained; the disposition is re-checked at re-measurement.
- **The cleanup script's name-only predicate cannot protect a hand-modified expected entry**
  (BR-CLN-3a, C-9). Accepted upstream; stated here so no implementer adds a hash check that would
  need a manifest the sweep deletes.
