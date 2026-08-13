# TSPEC — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10), `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.2, `FSPEC-EDIST-01`), `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-05), `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-10…M-ENG-13) |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft — in review (Phase T) | Claude | 0.1 | 2026-08-13 |

## 1. Scope and altitude

This TSPEC specifies **how** the FSPEC's seven flows are built: package layout, the
version store and launcher, the manifest fields, the provenance carrier across the
engine↔module seam, the publish workflow's jobs, and the test doubles each oracle needs.

It **takes** the four design decisions the FSPEC parked — O-10 (package composition),
O-9 (provenance carriers), the pin mechanism's execution half (O-2), and Q-4's branch of
AC-5.6 — and records the load-bearing ones in `DECISIONS-pdlc-engine-distribution.md`.

**Not owned here.** Anything the REQ already fixed (T-1a…T-7), the FSPEC's three expected
sets (§5.1 required checks, §5.2 packed contents, §5.3 dev-mode kinds — this document
implements them, it does not restate them as a second authority), test *names* and
per-property assertions (PROPERTIES), and task order (PLAN).

**Language and idiom.** The engine is plain Node ESM with JSDoc typedefs, not TypeScript:
`pdlc/engine/package.json:5` declares `"type": "module"` and every shipped module is
`.mjs` with JSDoc `@param`/`@returns` blocks (`pdlc/engine/lib/report.mjs:26-27`,
`pdlc/engine/lib/startup.mjs:302-318`). This TSPEC therefore expresses protocols as JSDoc
typedefs and frozen catalogues, which is the shipped precedent, rather than introducing a
TypeScript toolchain the repo does not have.

## 2. Verified baseline at HEAD

Every row below was read in the working tree on `feat-pdlc-engine-distribution` while
authoring this document, not copied from the REQ's or FSPEC's prose. Line numbers drift;
the symbol is the identity (DC-02).

| # | Verified fact | Citation |
|---|---|---|
| V-01 | The engine package declares `"private": true`, the unscoped name `pdlc-engine`, `"license": "UNLICENSED"`, and `"pdlcPluginCompat": "^0.22.0"`. All three O-8 blockers stand. | `pdlc/engine/package.json:2,3,4,10,11` |
| V-02 | The plugin manifest version is `0.22.7` — **inside** the engine's declared `^0.22.0`. The handshake passes at HEAD; the compat machinery is exercised green, not merely present. | `pdlc/.claude-plugin/plugin.json:4` |
| V-03 | The engine's `lib/` holds **exactly twelve** `.mjs` modules — the FSPEC §5.2 seed is accurate: `adapter, auth, catalogue, guard-measurement, handshake, outcome, report, run, skills, startup, transport-cli, transport`. | `pdlc/engine/lib/` |
| V-04 | The workflow modules are reached by **relative escape above the package root**: `new URL("../../workflows/orchestrate-dev.js", import.meta.url)`. A tarball rooted at `pdlc/engine/` installs without them. R-5 is real. | `pdlc/engine/lib/run.mjs:52-55` (`WORKFLOW_MODULE_URLS`) |
| V-05 | The anti-fork oracle is **two** assertions, and the first is a filesystem walk over the whole engine root that fails on *any* file named `orchestrate-{dev,queue}.js`. A build-time vendor directory under `pdlc/engine/` turns it red — exactly as R-5 predicts. | `pdlc/engine/__tests__/run.test.js:51-65` (`walk`, `offenders`), `:67-79` (`PROP-FORK-1`, `fileURLToPath(url)` equality) |
| V-06 | `pdlc/engine/.gitignore` contains only `node_modules/`. There is no ignore rule a build-time vendor directory could hide behind today; adding one is part of this feature's work. | `pdlc/engine/.gitignore` |
| V-07 | The CLI already resolves the version triple's engine half and the compat range from its **own** manifest and passes both into startup: `engineVersion: pkg.version`, `engineCompat: pkg.pdlcPluginCompat`. | `pdlc/engine/bin/pdlc.mjs:139-146` (`startupFor`) |
| V-08 | `runStartupChecks` resolves the plugin root and version, runs `checkCompat`, and returns `versions: {engine, plugin}` plus a rendered banner. The **triple already exists in one place**; AC-1.4 is a surfacing job, not a new resolution. | `pdlc/engine/lib/startup.mjs:319` (`runStartupChecks`), `:453` (`versions`), `:457-462` (`buildBanner`) |
| V-09 | `readPluginVersion` distinguishes *absent* from *unreadable*, and `checkCompat` renders distinct texts for "not found" and out-of-range. BR-1.2/BR-1.3 are **already satisfied**, not new work. | `pdlc/engine/lib/handshake.mjs:45` (`readPluginVersion`), `:144` (`checkCompat`), `:164` (not-found text), `:170-177` (range verdict text) |
| V-10 | `REMEDY` names `PDLC_PLUGIN_ROOT` verbatim in the refusal text, so BR-1.4's "operator can compute their own remedy" holds today. O-5's citation is accurate. | `pdlc/engine/lib/handshake.mjs:131-134` |
| V-11 | `resolvePluginRoot` honours `PDLC_PLUGIN_ROOT` **on presence alone**, ahead of every discovery candidate, and labels its source `explicit override (PDLC_PLUGIN_ROOT)`. This is the T-6 tension AC-5.6 exists to resolve. | `pdlc/engine/lib/skills.mjs:54` (`PLUGIN_ROOT_ENV`), `:204-231` (`resolvePluginRoot`, `explicit` branch) |
| V-12 | `pdlc doctor` is a distinct `switch` arm that runs startup checks and dispatches nothing. AC-1.1's "doctor sits outside the gate" has a carrier. | `pdlc/engine/bin/pdlc.mjs:208` (`cmdDoctor`), `:489-491` |
| V-13 | Provenance stamping **already exists on the engine side**: `buildEngineBlock` carries `engineVersion`/`pluginVersion` and `stampReport` returns a new report with an `engine` block, never mutating. O-F's gap is downstream of this, not here. | `pdlc/engine/lib/report.mjs:54` (`buildEngineBlock`), `:110` (`stampReport`); wired at `pdlc/engine/bin/pdlc.mjs:323-325` (`emitReport`) |
| V-14 | **The workflow module's final report already enumerates the files it authored**, as `artifactPaths` — seeded with `reqPath` and pushed per authored document. | `pdlc/workflows/orchestrate-dev.js:11659` (seed), `:11507` (`artifactPaths.push(docPath)`), `:13088` (returned field) |
| V-15 | `main()` is a large keyword-argument seam list whose optional capabilities default to inert module constants (`NO_PROBE`, `NO_RUN_COMMAND`). Adding one more optional, default-inert parameter is the shipped extension idiom, not a new pattern. | `pdlc/workflows/orchestrate-dev.js:10619-10665` |
| V-16 | The halt path writes the POSTMORTEM through an **agent prompt**, then confirms it with `_checkFile` rather than trusting the agent's claim, and throws `haltError` carrying `haltPhase`/`postmortemPath`/`postmortemStatus`. A provenance line placed in the prompt alone would be agent-dependent; the confirmed-write point is script-owned. | `pdlc/workflows/orchestrate-dev.js:11077-11110` (`erratumPostmortemHalt`) |
| V-17 | The halted queue row is written by `_recordQueueRow` from within `main()`, pathspec-scoped and committed by the module. | `pdlc/workflows/orchestrate-dev.js:12913` (`recordQueueRowFn({feature, status: "halted"})`), `:10650` (seam default) |
| V-18 | `.github/workflows/` holds exactly one workflow, and its five job-level `name:` strings match FSPEC §5.1's authored column verbatim, on an `os: [ubuntu-latest]` / `node: ['20']` matrix. | `.github/workflows/pr-tests.yml:28,78,112,138,196`; matrix `:40-41`, `:87` |
| V-19 | `ci-arrangement.test.js` already regex-asserts the `unit-tests` and `engine-tests` job blocks and their matrices against the live `pr-tests.yml`. FSPEC BR-7.6's "older overlapping assertions removed" has a concrete target. | `pdlc/engine/__tests__/ci-arrangement.test.js:42-64` |
| V-20 | The consumer config path the engine already reads is `.claude/pdlc.config.json`, exported as a module constant. The pin has an existing file and an existing reader to live in. | `pdlc/engine/lib/run.mjs:160` (`ENGINE_CONFIG_PATH`), `pdlc/engine/bin/pdlc.mjs:256` |
| V-21 | `DECISIONS-plugin-distribution.md` carries DEC-DIST-01…05 and no version-of-record entry. FSPEC Q-6 is accurate: BL-03's transcription is still undone. | `docs/_decisions/DECISIONS-plugin-distribution.md` (`## DEC-DIST-05:` is the last decision heading) |

**The two facts that reshape the plan.** V-13 and V-14 together mean O-9 is **not** three
pieces of new work. The version pair exists in the engine (V-13) and the authored-file
enumeration exists in the module (V-14). What is missing is a *carrier across the seam* for
the first, and *nothing at all* for the second. See §7 and the erratum raised against the
FSPEC.

## 3. Architecture

### 3.1 Component map

Three trees, one new, two extended.

| Component | Path | New / extended | Role |
|---|---|---|---|
| Launcher | `pdlc/engine/bin/pdlc.mjs` | extended | Argument parse, version-resolution entry, `exec` into the resolved engine (§6.3), or run in-process when it *is* the resolved engine |
| Version resolver | `pdlc/engine/lib/resolve-version.mjs` | **new** | Total ordered decision `dev-mode ≻ pin ≻ latest installed` (BR-4.1); pure over an injected store listing + config object |
| Version store reader | `pdlc/engine/lib/store.mjs` | **new** | Enumerates installed engine versions and maps a version to its install root; the only module that knows the store's on-disk shape |
| Provenance | `pdlc/engine/lib/provenance.mjs` | **new** | Builds the frozen `Provenance` value and its rendered block; the single writer of provenance text (BR-1.5, BR-5.1) |
| Report stamping | `pdlc/engine/lib/report.mjs` | extended | `buildEngineBlock` gains `channel`, `mode`, `pin`, `loadRoot`; `stampReport` unchanged (V-13) |
| Handshake / startup | `pdlc/engine/lib/handshake.mjs`, `lib/startup.mjs` | extended | Unchanged decision logic (V-09); startup gains the resolution announcement (BR-4.1) and the ignored-env notice (§6.5) |
| Plugin-root resolution | `pdlc/engine/lib/skills.mjs` | extended | `resolvePluginRoot` gains a `devDeclared` input so the env var stops being honoured on presence alone (V-11, §6.5) |
| Workflow modules | `pdlc/workflows/orchestrate-dev.js`, `orchestrate-queue.js` | extended | One optional, default-inert `_provenance` seam (§7.2), following V-15's idiom. **No behaviour change when absent** |
| Packaging | `pdlc/engine/scripts/prepack.mjs`, `pdlc/engine/package.json` | **new / extended** | Build-time vendoring of the workflow modules and the `files` allow-list (§5) |
| Publish CI | `.github/workflows/publish.yml` | **new** | Tag-triggered, additive; reuses the PR gate's jobs, adds none to it (C-5, BR-7.5) |
| Expected-set carrier | `pdlc/engine/__tests__/ci-arrangement.test.js` | extended | Owns FSPEC §5.1's two set-equalities; absorbs its own older overlapping matrix assertions (V-19, BR-7.6) |

### 3.2 Dependency direction

```
bin/pdlc.mjs
  ├─ lib/resolve-version.mjs ─ lib/store.mjs        (pure over injected fs + config)
  ├─ lib/startup.mjs ─ lib/handshake.mjs
  │                  └─ lib/skills.mjs
  ├─ lib/provenance.mjs                              (pure; no fs, no env)
  └─ lib/run.mjs ─→ workflow modules (vendored or repo-relative, §5.2)
                      └─ receives `_provenance` (opaque to the engine's callees)
```

Two rules hold this shape:

1. **`lib/provenance.mjs` is pure.** It takes a resolved startup result and returns a
   frozen value plus rendered text. It reads no file, no env, no clock. This is what makes
   BR-1.5 ("resolved once per run, every emitter reads that one resolution") mechanically
   checkable rather than a convention — there is exactly one construction site.
2. **The workflow modules never import anything of the engine's.** The provenance seam
   crosses as a plain frozen object with pre-rendered strings, never a function to call and
   never a module to load. This is what keeps the modules loadable inside the Claude Code
   workflow runtime, where `import` does not exist (CLAUDE.md, runtime constraints).

### 3.3 New dependencies

**None.** No new runtime dependency is added to `pdlc/engine/package.json`. The single
existing dependency (`@anthropic-ai/claude-agent-sdk`) is untouched. Semver range checking
already ships hand-rolled in `handshake.mjs` (`parseVersion`, `compare`, `satisfiesRange`,
`pdlc/engine/lib/handshake.mjs:20,33,93`) and is reused for the pin and the publish-time
range check rather than pulling in `semver` — one range grammar in the product, not two.

## 4. Decisions this TSPEC takes

## 5. Package composition and the anti-fork oracle (O-10)

## 6. Version resolution: store, launcher, pin, dev-mode (F-4)

## 7. Provenance carriers (F-6, O-9)

## 8. Publish pipeline (F-5)

## 9. Install and upgrade (F-2, F-3)

## 10. Types and protocols

## 11. Error handling

## 12. Test strategy

## 13. Requirements traceability

## 14. Costs, risks, and what is deliberately not closed here
