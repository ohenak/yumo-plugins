# TSPEC — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10), `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.2, `FSPEC-EDIST-01`), `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-05), `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-10…M-ENG-13) |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft — in review (Phase T) | Claude | 0.9 | 2026-08-13 |

**Changelog**

| Version | Change |
|---|---|
| 0.1 | Initial draft |
| 0.2 | Round-1 cross-review revisions (PM + TE). Packed set reconciled with FSPEC §5.2 and `postinstall` given a packed home (§5.1, §5.4); AF-2 given a `prepack` precondition, set-equality and falsifier (§5.3); `--version`/`doctor` exempted from the launcher's resolution gate (§6.2, §11); config read made three-way with a new ladder branch 0 (§6.3, §6.4); provenance placements corrected from three to four with kind 4 composed in one marked commit helper (§7.2); §7.4's `artifactPaths` grounding corrected — the push is conditional and `converge()`-only, so four document classes are missing and a literal set-equality replaces the prose (§7.4, V-14); the reusable-workflow gate extraction **rejected** in favour of duplicated job bodies, with a `uses:`-is-unexpandable rule making the rejection mechanical (§8.2, §8.5); Node-floor guard moved to a dependency-free entry with a named below-floor runner (§9.3); inert update probe made to still emit "could not check" (§10.1); S-2 corrected to the shipped signature; catalogue registration scheduled with emitters and paired with rendered-text assertions (§10.3, §12.4); npm scope routed to the operator as N-6. Three errata raised upstream (FSPEC §5.2, FSPEC's AT-4.5 blocking, REQ AC-5.3 kind 4) |
| 0.3 | Round-2 cross-review revisions (PM F-01…F-05, TE F-14…F-21). `bin/` enumerated once and identically: the guard keeps the name `bin/pdlc.mjs`, the body moves to the new `bin/cli.mjs` (E-4b), §3.1 reconciled (§3.1, §5.4, §9.3); E-3's `LICENSE` expectation re-sourced from N-2's **recorded decision** instead of from the tree under test (§5.4); `--version`/`doctor` now **resolve for reporting** and report the resolved triple under a pin, falling back to the launcher's own with `mode: unresolved` only when resolution fails (§6.2, §11, §13); ladder branch 0's no-pin consequence stated and given its own ladder case (§6.4, §11); §7.2's false "one helper" claim replaced by the measured closed set of **four** commit helpers (C-a…C-d) plus a source-level set-equality, and kind 3 given a named route to the queue-side writer (`_recordQueueRow` → `rewriteStatus`'s 8th parameter → `build-runtime.mjs`'s closure) and a named carrier (a new `Engine` column, not `Evidence`) (§7.2); §7.4 gains class 11, the anchor-appended `CROSS-REVIEW-*`, with `QUEUE.md` scoped out of AC-4.5 explicitly (§7.4, §13); guard-entry **structural oracle** paired with the below-floor container (§9.3, §12.1); §12.1's module-side row split per module; K-3 repriced honestly (§14.1); the REQ AC-5.3 kind-4 erratum reduced to a wording confirmation against FSPEC BR-9.3 (§7.2, §14.4) |
| 0.4 | Round-3 cross-review revisions (PM F-01…F-04, TE F-22…F-27). §5.4's expected packed set gains the three `lib/*.mjs` this feature creates as literal members (E-17…E-19, vendor rows renumbered E-20…E-22, `postinstall` E-23) and the totals are restated **23 before N-2 / 24 after**; V-03 restated as "twelve at HEAD, fifteen after §3.1"; the FSPEC §5.2 erratum widened to **one** erratum naming all seven divergences (§5.4, V-03). Kind 3's mark moved **inside `rewriteStatus`**, whose five call routes (R-1…R-5) are enumerated — marking at the call sites left the two rows a green queue-driven run produces unmarked — and the `Engine` cell is written on **both** `updateQueueStatus` row-write paths (§7.2). The commit-helper set closed at **five**: C-e, the advisory A5 seam's `apply`, is marked in place rather than re-routed through `commitPaths`, and the source-level set-equality is now unconditional over five **enclosing named functions** (§7.2, §12.1). Each of the five helpers given a named route to `_provenance`, including C-b's two call sites and C-d's new queue-module seam (§7.2). §7.4's class 11 corrected from present tense to scheduled work, with the `artifactPaths` route named through `appendApprovalAnchors`'s return and three call sites (§7.4, §13). §9.3's guard respecified as a **promise chain** — top-level `await` is Node 14.8+ and would `SyntaxError` on the runtime the guard promises to refuse on — with an honest Node-12.17 floor and a **third structural-oracle clause** covering syntax level (§9.3, §12.1). §7.2's header-resolution claim corrected to containment-first-match with the round-trip test asserting the header literal (§7.2). Oracle 2 gains a green-path kind-3 positive (§12.3); K-3 repriced again (§14.1) |
| 0.5 | Round-4 cross-review revisions (PM F-01…F-03, TE F-28…F-31). §5.4's FSPEC-§5.2 unblocking note corrected: AT-3.8b's workflow-module members are the **vendored** rows, not the three new `lib/` modules, which round 3's renumbering had moved off those ids (§5.4). The packed set's ids renamed **`E-nn` → `PK-nn`** to end the collision with the FSPEC error catalogue that caused it, with §11/§8.5's `E-nn` citations left as error ids (§5.4, V-03, §9.1, §9.3). **The provenance seam's production carrier named**: `devInjection` and `queueInjection` (`run.mjs:80-91`, `:114-123`) are the only two objects the engine hands the modules, each gains a `_provenance` key, `runQueue`'s `_runPipeline` wrapper inherits the dev key, and `PROP-PARITY-12`'s pinned constants (`seam-contract.test.js:47-63`, `:79-82`) are edited **in the same task** — with a new **production-path test level** and an oracle-2 leg that go red if either injection forgets it (§3.1, §7.2, §10.1 S-6, §12.1, §12.3, §12.4, §13, §14.1). §12.3's green-direct-run leg given its missing precondition — `mergeMode` ships `off`, so the leg asserted nothing on default config — now `mergeMode: "on"` plus a non-empty produced-kind guard (§12.3). §9.3's structural clause 3 narrowed from an unmechanised "parses under an ES-2020 parser" to a parser-free **zero-`await`** source scan, with the rejected `acorn` devDependency and the surviving documented constraint both stated (§9.3, §12.1). §12.1's module-side split restated as kinds 1–2 dev / kinds 3–4 **both** modules (two of kind 4's helpers are queue-side); R-2's status cell corrected to `halted` **or** `done`; PF-4's failure message told to name §5.4 as the expected set's source (§5.4, §7.2, §12.1) |
| 0.6 | Round-5 cross-review revisions (PM F-01…F-03, TE F-32…F-35). **The provenance carrier chain closed at process entry**: §7.2 gains a *hand-off* row naming the **three** `bin/cli.mjs` call sites that must pass `provenance` — `runDev` (`bin/pdlc.mjs:385`), `runQueueLoop` (`:434`) and `runQueue` (`:457`) — since `runQueueLoop` forwards `...args` (`run.mjs:478`, `:491`) and so carries provenance only if `cli.mjs` put it there, making `pdlc queue --loop` the one mode a green suite would hide; §12.1's production-path level, §12.3's oracle 2, §11's S-6 and §12.4's one-task rule extended to match, with `bin/cli.mjs` joining that task, plus the answer to TE Q-15 (one frozen `Provenance` per **run**, shared by every loop pass, never re-derived) (§7.2, §11, §12.1, §12.3, §12.4). §9.3's clause 3 scoped to the **non-comment** source — a raw-text scan went red against the header comment the same section mandates, whose stated reason contains the forbidden token — with the comment-stripping filter stated and its dependence on clause 2 made explicit (§9.3, §12.1). `PROP-PARITY-12`'s edit scope corrected: `:47-63`'s constants are the only required edit, the leak case at `:79-90` is an exclusion list and stays unchanged, and `PROP-PARITY-15` (`:268-282`) named as the third reader (§7.2, §12.1, §12.4). §12.1's "no test spans the two suites" corrected to the two **runners**, citing `PROP-PARITY-10`'s real-module import (`seam-contract.test.js:299`) as sanctioned precedent. §9.3's stale closing claim and its `node --test` citation fixed (`package.json:13` → `_run-suite.mjs:50`); PM Q-01 answered with a named risk R-E for the documented-not-tested subset claim (§14.2) |
| 0.7 | Round-6 cross-review revisions (PM F-01…F-02, TE F-36…F-38). **The process-entry leg gets an executable mechanism.** At HEAD the command bodies carry no `export` (`bin/pdlc.mjs:352`, `:396`), the file self-invokes (`:505`) and the runners are static bindings (`:30`), so "import the bodies directly" was unwritable against the `cli.mjs` this TSPEC specified. `bin/cli.mjs` now moves with **two named, priced shape changes** — an exported `main(argv, deps)` self-invoking only under an entry guard, and a default-valued `{runDev, runQueue, runQueueLoop}` seam in the shape `run.mjs` already uses for `importWorkflow` (`run.mjs:387`, `:427`) — with the rejected alternatives (export-only; subprocess-plus-artifact) recorded, and §9.3's "moves unchanged" bullet, §5.4's import sentence, §12.1, §12.3 and K-3 reconciled to it (§3.1, §5.4, §9.3, §12.1, §12.3, §14.1). `bin/cli.mjs`'s **two owners ordered**: the E-4b split task creates it, the wiring task edits it in a later batch with an explicit dependency edge, and the production-path leg lands with the wiring task (§12.4). The `:385`/`:434`/`:457` addresses marked **HEAD-relative**, resolvable by name after the split (§7.2). PM Q-01 answered — one identity assertion evaluated per pass, not two bars — and TE Q-18's **≥2-pass** (`maxPasses: 2`) fixture made part of the leg (§7.2, §12.1). TE Q-17 answered: `cli.mjs` gets **no** fourth structural clause; the import-based tests are the pin (§9.3). The merge-leg fixture's remaining preconditions enumerated from the guard ladder instead of left to the PLAN author (`orchestrate-dev.js:1076`…`:1283`) (§12.3, PM F-02). R-E given a mechanical expiry trigger tied to clause 2 (§14.2, PM Q-02) |
| 0.8 | Round-7 cross-review revisions (PM F-01…F-02 and Q-01, TE F-39…F-42 and Q-19…Q-20). **The per-pass identity assertion moves off the process-entry leg, which cannot run a loop.** Recorders in `deps` mean the real `runQueueLoop` never executes, so `captured` holds one entry and `maxPasses: 2` was inert there; the ≥2-pass identity check now sits on the **injection-level** leg, which drives the real `runQueueLoop({maxPasses: 2, …})` (`run.mjs:478`) over the recording workflow module, with the recorder's `{outcome: "ran"}` return, `startup: null` and an `_agent`-carrying adapter named so two passes actually happen (`run.mjs:319-323`, `:331-335`, `:486-509`) (§7.2, §12.1, TE F-39/Q-19). The process-entry leg keeps its primary claim (all three call sites handed `provenance`) and gains the **default-`deps` pin** — exported `deps`, three-key set-equality, values `===` `run.mjs`'s exports (`:381`, `:422`, `:478`) — since no shipped test observes the real runners being reached (§9.3, §12.1, TE F-41). The **split task becomes red-first**: it creates `__tests__/provenance-path.test.js` asserting the import is inert and `main`/`deps` are exported, both red against HEAD's bare `main().catch(…)` (`bin/pdlc.mjs:505`) and zero exports, instead of shipping the shape change untested until the next batch (§9.3, §12.4, TE F-40). `argv`'s shape stated: `main(argv = process.argv, …)` keeps HEAD's `[, , cmd, ...rest]` two-element skip (`bin/pdlc.mjs:479`), so the leg passes a process-argv-shaped array (§9.3, §12.1, PM F-02). §12.3's merge-ladder addresses corrected — guards 17–18 are `:1232-1255`, not `:1152-1175`; guard 4 `:1092`; guards 19–21 `:1256-1284`; guard 11 `:1169` (PM F-01, TE F-42). PM Q-01 answered: the `deps` seam is justified by the **declared floor** `>=20`, not the maintainer's runtime, so a newer admitted runtime does not make it optional (§9.3). TE Q-20 answered: both tasks write one named file, `pdlc/engine/__tests__/provenance-path.test.js`, in different batches (§12.1, §12.4) |
| 0.9 | Round-8 cross-review revisions (PM F-01…F-02 and Q-01, TE F-43…F-44 and Q-21…Q-22). **The `deps` seam widens from three keys to five, because two gates stand between `main()` and any runner.** `startupFor` runs first in both command bodies and returns on refusal with no runner called (`bin/pdlc.mjs:397`, `:362`, `:407`, `:373`), and `liveAdapter` builds a real transport before the loop call site (`:279-298`, `:417`); with a three-key seam the process-entry leg's outcome was decided by `process.cwd()`, `PATH`, the plugin tree and `ANTHROPIC_API_KEY` (auth row 5 refuses, `lib/auth.mjs:88-95`), and an env-driven refusal leaves `captured` **empty**, on which every loop-shaped assertion passes — the silent-zero shape of TE F-39, one level out. `deps` is now `{runDev, runQueue, runQueueLoop, startupFor, liveAdapter}`, all five exported and pinned (three values `===` `run.mjs`'s exports, two `===` `cli.mjs`'s own), each recorder's **return shape named** because the bodies keep running into `emitReport`, and the argv-plus-env alternative recorded as weighed and rejected (§3.1, §5.4, §9.3, §12.1, §12.2, §12.3, §14.1, TE F-43 / Q-21, PM F-02). **Capture counts asserted before capture contents** on every runner leg (`=== 1` where it should be reached, `=== 0` where it should not). The **two legs' assertion keys split into a table**: `captured[i].provenance` for the runner-argument object at process entry, `captured[i]._provenance` for the seam object at injection level, since copying one onto the other yields `undefined === p` and invites a repair that `PROP-PARITY-12` then reddens (§7.2, PM F-01). The injection-level leg's ≥2-pass **premise becomes two assertions** — `captured.length === 2` and `stopReason === "bound-reached"` against `LOOP_STOP_REASONS` (`run.mjs:317`, `:486-509`) — so a changed recorder return decays loudly instead of silently (§7.2, §12.1, TE F-44). PM Q-01 answered: `process.exitCode` and `stderr` are per-process, so every leg captures and restores both around its `main()` call and the inert-import test uses a dynamic `await import()` inside that window — registration order is not load-bearing (§9.3, §12.1). TE Q-22 answered: one file stays the answer despite the two legs' asymmetric setups; the asymmetry buys the capture/restore rule, not a second path in the ownership manifest (§12.1) |

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
| V-03 | The engine's `lib/` holds **exactly twelve** `.mjs` modules **at HEAD**, and **fifteen after §3.1 lands**: `adapter, auth, catalogue, guard-measurement, handshake, outcome, report, run, skills, startup, transport-cli, transport` today, plus §3.1's `resolve-version`, `store` and `provenance`. The FSPEC §5.2 seed is accurate as a HEAD measurement and is *not* the post-feature set — §5.4's expected packed set (PK-5…PK-19) carries the fifteen. | `pdlc/engine/lib/` |
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
| V-14 | **The workflow module's final report enumerates authored files as `artifactPaths`, but not all of them.** Seeded with `reqPath`; the single push site is **conditional** (`if (pushArtifact)`, defaulted `true`) and reachable **only from `converge()`** — so FSPEC/TSPEC/DECISIONS/PLAN/PROPERTIES reach it and LEARNINGS, `CODE_REVIEW-*`, POSTMORTEM and `ADVISORY-*` do not. §7.4 depends on this corrected reading. | `pdlc/workflows/orchestrate-dev.js:11659` (seed), `:11498` (`pushArtifact = true` default), `:11507` (`if (pushArtifact) artifactPaths.push(docPath)` — the only push site), `:12690-12704` (LEARNINGS authored outside it), `:13088` (returned field) |
| V-15 | `main()` is a large keyword-argument seam list whose optional capabilities default to inert module constants (`NO_PROBE`, `NO_RUN_COMMAND`). Adding one more optional, default-inert parameter is the shipped extension idiom, not a new pattern. | `pdlc/workflows/orchestrate-dev.js:10619-10665` |
| V-16 | The halt path writes the POSTMORTEM through an **agent prompt**, then confirms it with `_checkFile` rather than trusting the agent's claim, and throws `haltError` carrying `haltPhase`/`postmortemPath`/`postmortemStatus`. A provenance line placed in the prompt alone would be agent-dependent; the confirmed-write point is script-owned. | `pdlc/workflows/orchestrate-dev.js:11077-11110` (`erratumPostmortemHalt`) |
| V-17 | The halted queue row is written through the `_recordQueueRow` **seam**, called from `main()`. The dev-side default is a **no-op stub** returning `{queueRow: "none"}`; the real writer is supplied by `build-runtime.mjs`'s entry closure and lives queue-side, where the row text and its commit are composed. §7.2's kind-3 carrier is therefore queue-side, not `orchestrate-dev.js:12913` (which is only the call site). | call site `pdlc/workflows/orchestrate-dev.js:12913`, seam default `:10650`, stub `:10490` (`defaultRecordQueueRow`); real writer `pdlc/workflows/orchestrate-queue.js:1572` (`rewriteStatus`) → `:1598` (`commitQueueRow`); wiring `pdlc/workflows/build-runtime.mjs:273-274` |
| V-18 | `.github/workflows/` holds exactly one workflow, and its five job-level `name:` strings match FSPEC §5.1's authored column verbatim. The five jobs do **not** share one matrix, and §8.5's expander is per-job for that reason: `unit-tests` declares `os` **and** `node`; `engine-tests` declares `os` only; `artifact-freshness`, `fresh-clone-bootstrap` and `script-syntax` declare no matrix at all. | `.github/workflows/pr-tests.yml:28,78,112,138,196`; axes `:40-41` (`os`, `node`), `:86-87` (`os`) |
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
| Node-floor guard entry | `pdlc/engine/bin/pdlc.mjs` | extended | The `bin` entry, and **only** the floor comparison plus a promise-chained `import("./cli.mjs").then(…)` — no top-level `await`, which would not parse below Node 14.8 (§9.3). Keeps its name so the manifest's `bin` field, `AC-2.1`'s `PATH` entry and the shipped `cli.test.js`'s invocation target are all unchanged |
| Launcher body | `pdlc/engine/bin/cli.mjs` | **new** | Everything `bin/pdlc.mjs` does at HEAD: argument parse, version-resolution entry, `exec` into the resolved engine (§6.3), or run in-process when it *is* the resolved engine. New file only because the guard must import nothing statically (§9.3). **Two deliberate shape changes, not a byte-identical move** (PM v6 F-01, TE v6 F-36), because the process-entry test leg of §12.1 cannot otherwise be written: the file **exports `main(argv, deps)`** and self-invokes only under an entry guard (`import.meta.url === pathToFileURL(process.argv[1]).href`) instead of HEAD's bare `main().catch(…)` (`bin/pdlc.mjs:505`), and the runners **and the two gates that precede them** reach the command bodies through a **default-valued `deps` object** — `{runDev, runQueue, runQueueLoop, startupFor, liveAdapter}`, the runners defaulting to the static imports at `bin/pdlc.mjs:30` and the gates to the file's own functions (`:139-146`, `:279-298`), and **itself exported** so §12.1 can pin those defaults (§9.3, TE v7 F-41, TE v8 F-43) — the way `run.mjs` already takes `importWorkflow` (`run.mjs:387`, `:427`). The two gate keys exist because `startupFor` and `liveAdapter` run *before* every runner call (`:397`, `:362`) and a refusal returns with no runner called at all, which would make the leg env-dependent and silently vacuous. `main`'s `argv` parameter defaults to `process.argv` and keeps HEAD's `[, , cmd, ...rest]` skip (`bin/pdlc.mjs:479`, §9.3). Command logic itself moves unchanged (§9.3, §5.4) |
| Version resolver | `pdlc/engine/lib/resolve-version.mjs` | **new** | Total ordered decision `dev-mode ≻ pin ≻ latest installed` (BR-4.1); pure over an injected store listing + config object |
| Version store reader | `pdlc/engine/lib/store.mjs` | **new** | Enumerates installed engine versions and maps a version to its install root; the only module that knows the store's on-disk shape |
| Provenance | `pdlc/engine/lib/provenance.mjs` | **new** | Builds the frozen `Provenance` value and its rendered block; the single writer of provenance text (BR-1.5, BR-5.1) |
| Report stamping | `pdlc/engine/lib/report.mjs` | extended | `buildEngineBlock` gains `channel`, `mode`, `pin`, `loadRoot`; `stampReport` unchanged (V-13) |
| Handshake / startup | `pdlc/engine/lib/handshake.mjs`, `lib/startup.mjs` | extended | Unchanged decision logic (V-09); startup gains the resolution announcement (BR-4.1) and the ignored-env notice (§6.5) |
| Plugin-root resolution | `pdlc/engine/lib/skills.mjs` | extended | `resolvePluginRoot` gains a `devDeclared` input so the env var stops being honoured on presence alone (V-11, §6.5) |
| Workflow modules | `pdlc/workflows/orchestrate-dev.js`, `orchestrate-queue.js` | extended | One optional, default-inert `_provenance` seam (§7.2), following V-15's idiom. **No behaviour change when absent** |
| Seam injections (the production carrier) | `pdlc/engine/lib/run.mjs` (`devInjection` `:80-91`, `queueInjection` `:114-123`) | extended | The **only** two objects the engine hands the workflow modules. `devInjection` gains an 8th key and `queueInjection` a 6th, both `_provenance`; `runQueue`'s `_runPipeline` wrapper (`:450-451`) inherits the dev key by spreading `devInjection`'s result. Both key sets are pinned by `PROP-PARITY-12` (`__tests__/seam-contract.test.js:47-63`), whose constants are edited in the **same task** (§7.2, §12.4) |
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

Five decisions the FSPEC parked. Each is load-bearing, each had a real alternative, and
each is recorded with its rejected alternatives in
`docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md`.

| # | Question | Decision | Recorded as |
|---|---|---|---|
| D-1 | O-10 / R-5 — how the workflow modules get inside the package | **Build-time vendoring into the packed tarball only** (R-5 option a), with a two-root resolver and a *restated*, not weakened, anti-fork oracle | DEC-EDIST-01 |
| D-2 | O-9 — the provenance carrier | **One optional, default-inert `_provenance` seam** on `main()`, carrying a frozen pre-rendered value. Closes AC-4.2 and AC-4.1; AC-4.5 needs **no carrier at all** (V-14); AC-6.2's load root is closed **engine-side only** and stays open bundle-side | DEC-EDIST-02 |
| D-3 | O-2 — how a pin *executes*, not just resolves | **Version store plus thin launcher**: many versions installed side by side under one store root, one launcher on `PATH` that `exec`s the resolved one | DEC-EDIST-03 |
| D-4 | Q-4 — which AC-5.6 branch | **Ignore-with-notice.** `PDLC_PLUGIN_ROOT` without an explicit per-invocation dev declaration is ignored, the released version runs, and the run states the variable was ignored | DEC-EDIST-04 |
| D-5 | Q-5 — how `__tests__/` is kept out of the tarball | **A `files` allow-list decides the packed set**, rather than an `.npmignore` deny-list. A one-line `.npmignore` *is* shipped, carrying only `!vendor/workflows/` to negate the vendor git-ignore rule (§5.1, §5.2); it adds no deny-list entry, is never a packed member, and cannot widen the set (§5.4) | DEC-EDIST-05, DEC-EDIST-01 |

### 4.1 Why D-1, in one paragraph each

**Vendor at build time (chosen).** V-04 says a tarball rooted at `pdlc/engine/` cannot see
the modules; something must move. Vendoring at pack time moves the fewest things: the repo
layout is untouched, so C-4's promise to the plugin channel is kept literally, and
`pdlc/workflows/` stays the single edited source. Its cost is exactly the one R-5 names —
V-05's walk goes red — and §5.3 pays it by *restating* the oracle rather than deleting it.

**Publish from a workspace root (rejected).** No test changes, but the published package's
internal shape becomes the repo's directory shape: `pdlc/workflows/` and `pdlc/engine/`
both land inside the tarball, and every future repo reorganisation becomes a consumer-
visible breaking change. It also drags the plugin's own tree toward the package boundary
that C-4 says must not move.

**Relocate the modules under the package root (rejected).** The cleanest end state and the
right answer *after* `pdlc-plugin-retirement`. Today it moves the files the bundle build
(`pdlc/workflows/build-runtime.mjs`) and the sync script read, which is the plugin channel
C-4 and G-6 promise not to disturb — a Phase-1 blast radius bought for an end state that a
later, dedicated feature already owns.

### 4.2 Why D-3

AC-5.5 is the constraint that settles it: *"a pin naming a version that is not installed →
refuse, naming the pinned version and what is installed"*. A single-version global install
cannot say "what is installed" in the plural, and cannot execute version X while Y is
latest (AC-5.1) without fetching — which NG-3 forbids. Both criteria are only satisfiable
if **several versions can be resident at once**. That is a store. The alternative — one
global install plus `npx @scope/pdlc-engine@X` per pin — was rejected because `npx` fetches
on miss, which is precisely NG-3's "never fetches, never applies".

### 4.3 Why D-4

Refusing on a bare `PDLC_PLUGIN_ROOT` is the stricter branch and was seriously considered:
it makes T-6 unconditional. It was rejected because the variable is *shipped, documented in
the product's own refusal text* (V-10) and is today the operator's remedy for a compat
refusal. Turning the remedy the error message recommends into a second error is a poor
trade. Ignore-with-notice satisfies AC-5.6's letter — the run "executes the released
version and states that the variable was ignored" — while leaving the explicit
per-invocation selectors (`--dev`, `--plugin-root`) as the only ways to change the skill
source. The reversal cost is one branch in one function, so this is not a one-way door.

## 5. Package composition and the anti-fork oracle (O-10)

### 5.1 Manifest changes

`pdlc/engine/package.json`, in full, for the fields this feature touches:

| Field | HEAD (V-01) | After | Why |
|---|---|---|---|
| `name` | `pdlc-engine` | `@{scope}/pdlc-engine`, `{scope}` set by the operator | DEC-DIST-05 chose scoped-public and named **no scope**; the scope is an npm account the operator must own, so it is an O-8-class publish precondition (N-6), not a string this TSPEC invents. PF-3 asserts the manifest name against the **recorded** decision, not against a literal here |
| `private` | `true` | *removed* | O-8 blocker (1), the one npm itself refuses |
| `license` | `UNLICENSED` | operator-set SPDX id | O-8 blocker (3). **Operator obligation, not this TSPEC's to invent** — the PLAN carries it as a gate task, not a code task |
| `version` | `0.1.0` | unchanged by this feature | T-1a; bumped per release, not here |
| `engines.node` | absent | `">=20"` | C-3 / T-2 declared, so `npm` warns and §11's runtime check has a declaration to name |
| `files` | absent | `["bin/", "lib/", "vendor/workflows/", "scripts/postinstall.mjs"]` | D-5; §5.4. `README.md` is **not** listed — npm packs it unconditionally (§5.4) |
| `pdlcPluginCompat` | `^0.22.0` | unchanged shape | T-3, already shipped (V-07) |
| `pdlcPairing` | absent | written **by the publish job**, §8.4 | O-6's single-writer record |
| `scripts.prepack` | absent | `node scripts/prepack.mjs` | §5.2. Build-time only, and therefore **not packed** (§5.4) |
| `scripts.postinstall` | absent | `node scripts/postinstall.mjs` | §9.2's store population. The script is packed (`files` lists it explicitly), because a `postinstall` whose script file is absent from the tarball fails in the consumer's terminal at install time |
| `README.md` | absent at HEAD (verified: `ls pdlc/engine/` → `__tests__ bin lib node_modules package-lock.json package.json`) | **new file, created by this feature** | npm packs `package.json`, `README*` and `LICENSE*` regardless of `files`, so the packed set contains a README whether or not one is authored. Authoring one makes the member intentional rather than accidental, and gives the npm listing a page |
| `.npmignore` | absent at HEAD (same listing) | **new file, created by this feature**, one line: `!vendor/workflows/` | DEC-EDIST-01's decided mechanism, transcribed here rather than left implicit. `vendor/` is git-ignored (§5.2), and npm's precedence between a `files` entry and an ignore-file fallback *for paths inside a listed directory* has varied across npm majors; a shipped negation makes the inclusion explicit instead of inferred. It is **never a packed member** — npm always excludes `.npmignore` (and `.gitignore`) from the tarball — so PF-4's PK-* set is unchanged by it (§5.4) |

**O-8 blocker 1 is closed here, by this feature, not by an operator.** V-01 records three
blockers standing at HEAD. Blocker 1 is `"private": true` (`pdlc/engine/package.json:4`), and
the row above removes it as ordinary engineering work, with PF-3 asserting `private` is absent
at publish time (§8.3). Blockers 2 (npm scope, N-6) and 3 (`license`, N-2) remain
operator-owned and are the only two left. Downstream records citing "three blockers" should
cite this closure rather than repeat the HEAD count.

### 5.2 Build-time vendoring

`pdlc/engine/scripts/prepack.mjs` runs on `npm pack` / `npm publish` (npm's `prepack`
lifecycle) and does exactly three things:

1. Delete and recreate `pdlc/engine/vendor/workflows/`.
2. Copy `pdlc/workflows/orchestrate-dev.js` and `pdlc/workflows/orchestrate-queue.js`
   into it, **byte-for-byte**, no transform of any kind.
3. Write `pdlc/engine/vendor/workflows/VENDOR-MANIFEST.json`: for each copied file, its
   source path and its SHA-256, plus the engine version the copy was made for. This is the
   same discipline as the shipped distribution manifest (REQ O-D,
   `pdlc/workflows/dist/distribution-manifest.json`) and is what makes §5.3's byte-identity
   assertion decidable inside the tarball, offline.

`pdlc/engine/.gitignore` gains `vendor/` (V-06 confirms there is no such rule today). The
vendor directory is a **build artefact and never committed** — the same tier discipline
DEC-DIST-02 already established for `pdlc/workflows/dist/` versus `.claude/workflows/`.

That git-ignore rule is why this feature also creates **`pdlc/engine/.npmignore`**, listed in
§5.1's inventory, carrying the single negation `!vendor/workflows/` and nothing else. The two
files are authored in the same task: the rule that keeps the vendored bytes out of git is the
rule that could keep them out of the tarball, and DEC-EDIST-01 decides the inclusion
explicitly rather than depending on which precedence rule the installed npm implements. The
file is a packaging control, not a packed member (npm never packs `.npmignore`), and the
allow-list remains the thing that decides *what* ships (§5.4).

**Two-root resolution.** `lib/run.mjs`'s `WORKFLOW_MODULE_URLS` (V-04) becomes a function
over two candidate roots, tried in a fixed order with no fallback ambiguity:

| Order | Root | When it exists |
|---|---|---|
| 1 | `../vendor/workflows/` relative to `lib/` | Installed package (the vendor dir is packed) |
| 2 | `../../workflows/` relative to `lib/` | Repo checkout (today's V-04 arrangement) |

If **neither** resolves, the engine refuses at startup naming both paths tried — it never
proceeds to dispatch with no modules (§11, E-22's build-time analogue at runtime). If both
exist — a checkout that has been packed locally — root 1 wins and the run **announces the
load root** (§7.3), so the ambiguity is never silent (E-04's spirit).

### 5.3 The anti-fork oracle, restated not weakened (BR-8.2)

V-05's walk currently means "no file named like a workflow module exists anywhere under
`pdlc/engine/`". Vendoring makes that literally false in a *build* tree while the property
it protects — *the engine never executes a diverged copy* — is untouched. The oracle is
therefore restated as **three** assertions, which together are strictly stronger than the
one they replace:

| # | Assertion | Replaces / adds |
|---|---|---|
| AF-1 | No **git-tracked** file under `pdlc/engine/` is named `orchestrate-{dev,queue}.js`. Tracked-ness is read from `git ls-files`, not from a directory walk, so a build artefact cannot satisfy it and a committed fork cannot hide behind `.gitignore`. | Replaces V-05's walk. Strictly stronger against the failure that matters: a *committed* fork |
| AF-2 | **Run `prepack` into a temp directory first**, then: the manifest's `modules` array enumerates **exactly** `orchestrate-dev.js` and `orchestrate-queue.js` (set-equality, not `length > 0`); each entry's recorded SHA-256 equals the hash of the vendored bytes; and each equals the canonical `pdlc/workflows/` source at the same commit. Falsifier, asserted in the same test: mutating one byte of a vendored copy turns AF-2 red. | **New.** This is the property the walk was a proxy for, now asserted directly |
| AF-3 | `PROP-FORK-1`'s exact-path equality is kept for the checkout root, and extended: in an installed package the resolved module path must equal the vendor root's path exactly, not merely start with it. | Extends `run.test.js:67-79` |

The distinction BR-8.2 demands — "vendored in the repo" versus "vendored in a build
artefact" — is carried by AF-1's tracked-ness test, and the property is not merely
preserved but made checkable at the byte level by AF-2. **No assertion is deleted without a
strictly stronger replacement named in this table.**

**AF-2's precondition is load-bearing, not housekeeping.** §5.2 makes `vendor/` a git-ignored
build artefact, so in an ordinary checkout there is no `VENDOR-MANIFEST.json` at all — and
"for every entry in the manifest…" is then trivially true over the empty set. Without the
`prepack`-into-temp step, the replacement for a walk that ran on **every** checkout would be
an oracle that ran on **none** of them: satisfiable by absence, which is the failure mode
§12.3 exists to hunt. The set-equality (rather than a non-empty check) is what makes a
prepack that silently vendored nothing, or vendored a third file, fail rather than pass.

### 5.4 The `files` allow-list (D-5, Q-5)

An allow-list is chosen over `.npmignore` because the failure modes are asymmetric: a
deny-list that forgets an entry ships something it should not — which is exactly AC-1.3's
"an added file fails" scenario, and exactly how a skills copy or the `__tests__/` corpus
would leak in. An allow-list that forgets an entry ships too little and fails AT-3.8a
loudly at build time. **We prefer the failure that is caught offline over the one that is
caught by a consumer.**

The list is `["bin/", "lib/", "vendor/workflows/", "scripts/postinstall.mjs"]`. It excludes
`__tests__/`, `package-lock.json`, `.gitignore` and `scripts/prepack.mjs` without naming any
of them. Q-5 is answered: the exclusion is a deliberate packaging mechanism, not an omission.

**This does not mean the package ships no `.npmignore`.** §5.1 and §5.2 create one, and
D-5's shorthand — "an allow-list, not an `.npmignore` deny-list" — is about *who decides the
packed set*, not about whether the file exists. The shipped file carries one line,
`!vendor/workflows/`, and its only job is to negate the `vendor/` git-ignore rule inside a
directory `files` already lists (DEC-EDIST-01, DEC-EDIST-05's own "the inclusion is made
explicit rather than inferred"). No deny-list entry is ever added to it: the day it would
need one, the answer is a `files` edit. Two consequences worth stating so no reader has to
re-derive them:

- **It is never a packed member.** npm excludes `.npmignore` (and `.gitignore`) from every
  tarball regardless of `files`, so the `PK-*` table below and PF-4's both-directions
  equality are unaffected — no `PK-` row is added for it, and none should be.
- **It cannot widen the packed set.** A negation only readmits paths an ignore rule removed;
  what ships is still exactly what `files` lists, which is what keeps D-5's asymmetry
  argument true after the addition.

**`files` does not by itself determine the packed set, and the earlier draft's arithmetic was
wrong.** npm packs `package.json`, `README*` and `LICENSE*` **regardless of `files`**, and
ignores a `files` entry for a path that does not exist. The previous list carried `README.md`
while no `pdlc/engine/README.md` existed at HEAD — an entry that was simultaneously dead (no
such file) and redundant (npm would include it anyway). Since PF-4/AT-3.8a is a
**member-for-member equality in both directions** (BR-8.1), that mismatch was a red row by
construction, and the tempting repair — relaxing the check to a subset — is precisely the
defect AC-1.3 exists to catch. The fix is on both sides: the allow-list drops `README.md`
(§5.1 authors the file instead), and the expected set gains the manifest-adjacent members it
was always going to contain.

**The literal expected packed set** (the right-hand side of PF-4 and AT-3.8a).

**The members carry a `PK-` prefix, not `E-`, and the rename is deliberate** (PM v4 F-02).
The FSPEC's error catalogue uses `E-nn` too, and from `E-17` up the two series render
identically (below that, zero-padding distinguishes `E-01` from `E-1`) — so the literal string
`E-17` denoted a packed member here and a publish-collision error in §11, with nothing marking
the switch. That collision is not hypothetical: it is the likeliest cause of the stale
cross-reference PM v4 F-01 found in this very section. A PLAN or PROPERTIES author transcribing
a member id must not have to read two tables to learn which catalogue is meant, so the packed
set gets its own namespace. §11 and §8.5's `E-nn` citations are FSPEC error ids and are
unchanged; earlier changelog rows quote the old `E-nn` member ids as written at the time.

| # | Member | Why it is packed |
|---|---|---|
| PK-1 | `package.json` | npm, unconditionally |
| PK-2 | `README.md` | npm, unconditionally; authored by this feature (§5.1) |
| PK-3 | `LICENSE` | npm, unconditionally — **present only once N-2's operator licence decision lands.** The member's presence in the *expected* set is read from **N-2's recorded decision in `DECISIONS-plugin-distribution.md`** — has a licence been recorded — exactly as PF-3 reads the scope, and **never** from whether `pdlc/engine/LICENSE` exists. See the note below |
| PK-4 | `bin/pdlc.mjs` | `files` entry `bin/` — the Node-floor guard entry (§9.3) |
| PK-4b | `bin/cli.mjs` | `files` entry `bin/` — the launcher body the guard dynamically imports (§9.3, §3.1) |
| PK-5…PK-16 | the twelve `lib/*.mjs` present at HEAD (V-03) | `files` entry `lib/` |
| PK-17 | `lib/resolve-version.mjs` | `files` entry `lib/` — **created by this feature** (§3.1) |
| PK-18 | `lib/store.mjs` | `files` entry `lib/` — **created by this feature** (§3.1) |
| PK-19 | `lib/provenance.mjs` | `files` entry `lib/` — **created by this feature** (§3.1) |
| PK-20 | `vendor/workflows/orchestrate-dev.js` | `files` entry `vendor/workflows/` |
| PK-21 | `vendor/workflows/orchestrate-queue.js` | same |
| PK-22 | `vendor/workflows/VENDOR-MANIFEST.json` | same |
| PK-23 | `scripts/postinstall.mjs` | explicit `files` entry; §9.2 depends on it existing in the installed tree |

**PK-17…PK-19 are listed literally because `files` packs a directory, not a file list.** The
entry `lib/` packs whatever is in the tree at pack time, so the three modules §3.1 creates
become packed members the moment they land. An expected set naming only V-03's twelve would
therefore go red against a *correct* implementation once this feature ships — the same defect
as PK-4b's, one row down. The fix that must **not** be taken is globbing `lib/*.mjs` at test
time: that reads the tree under test and reintroduces exactly what PK-3's note below exists to
remove. New `lib/` modules are added to this table by hand, as a visible edit, or PF-4 is not
an expectation. **The failure message says so** (PM v4 Q-01): PF-4's inequality report names
this section as the expected set's source — "expected set is TSPEC §5.4's literal table; a new
`lib/` module needs a row there" — so an operator meeting a red PF-4 after adding `lib/foo.mjs`
is told the table is stale rather than left to read it as "the package is wrong". The PLAN
schedules that message text with the oracle, not after it.

**Why PK-3's boolean comes from the decision record and not from the tree.** An expected set
that reads the artifact under test is not an expectation. If PK-3 were "expected iff
`pdlc/engine/LICENSE` exists", a `LICENSE` lost to a bad merge after N-2 lands would shrink
*both* sides of the equality together, PF-4 would stay green, and the package would publish
unlicensed — the deletion-tolerant hole a both-directions equality exists to close. Sourced
from the decision record instead, the two states are:

| N-2 recorded? | Expected set | A missing `pdlc/engine/LICENSE` |
|---|---|---|
| no | PK-1, PK-2, PK-4, PK-4b, PK-5…PK-23 (no `LICENSE` member) | consistent — nothing to ship yet |
| yes | the above **plus** PK-3 | **red**, which is the point |

The flip is therefore a visible edit to one record (the same record PF-3 already reads), not
an inference the oracle makes from the tree it is auditing. The expected set is **23 members
before N-2 and 24 after**: four manifest-adjacent and `bin/` members (PK-1, PK-2, PK-4, PK-4b),
fifteen `lib/*.mjs` (PK-5…PK-19 — V-03's twelve plus §3.1's three), three vendored workflow
members (PK-20…PK-22) and `scripts/postinstall.mjs` (PK-23).

**The `bin/` contents are enumerated once, here, and §9.3 does not create a member this set
lacks.** The guard keeps the name `bin/pdlc.mjs` (PK-4) and the body moves to `bin/cli.mjs`
(PK-4b), so the manifest's `bin` field (`pdlc/engine/package.json:6-8`, `"pdlc":
"bin/pdlc.mjs"`) is untouched, AC-2.1's `PATH` entry is untouched, and the shipped
`cli.test.js` keeps invoking the same path — now exercising the guard plus the dynamic import,
which is the end-to-end behaviour it was always proving (PM Q-01, TE Q-06). Unit coverage of
the body may import `bin/cli.mjs` directly, **and §3.1's two shape changes are what make that
sentence true rather than aspirational**: at HEAD the bodies carry no `export`
(`async function cmdDev(argv)`, `bin/pdlc.mjs:352`; `cmdQueue`, `:396`) and the file self-invokes
at `:505`, so an import would run the CLI against the test runner's own `argv`. With the entry
guard and the exported `main(argv, deps)`, importing the module is inert and the three runners —
together with the `startupFor`/`liveAdapter` gates that precede them — are substitutable
(PM v6 F-01, TE v6 F-36, TE v8 F-43). The existing end-to-end oracles do not move — every
shipped CLI test keeps driving the bin as a subprocess (`__tests__/cli.test.js:22`,
`spawnSync(process.execPath, [BIN, …])`). The
`files` entry `bin/` packs both without change.

**This disagrees with FSPEC §5.2 as written, and the disagreement is raised, not papered
over.** FSPEC §5.2 enumerates the manifest, `bin/pdlc.mjs`, the twelve `lib/*.mjs` and the
workflow modules, and explicitly excludes "repo-level documentation" — so **seven** members
this TSPEC's design requires are absent from the FSPEC's expected set: `README.md` (PK-2),
`LICENSE` (PK-3), `bin/cli.mjs` (PK-4b), the three new `lib/*.mjs` (PK-17…PK-19) and
`scripts/postinstall.mjs` (PK-23). **One** erratum is raised against FSPEC §5.2 naming all
seven, rather than one per divergence: the members arrive from a single design decision
(§3.1's component map plus §5.1's authoring), and one erratum is cheaper to confirm than
several against the same row (TE Q-09). FSPEC §5.2's `lib/` line reads as a **HEAD seed**
that this TSPEC extends, not as a closed post-feature set — but the seed is stated in the
FSPEC as the packed set, so the disagreement is raised rather than left standing while a
both-directions equality gates on it.

**Note for the FSPEC's §5.2 workflow-module row.** That row is marked *"[blocked on O-10],
not enumerable yet"*. This section unblocks it: the **vendored workflow members** are exactly
**PK-20 (`vendor/workflows/orchestrate-dev.js`), PK-21 (`vendor/workflows/orchestrate-queue.js`)
and PK-22 (`vendor/workflows/VENDOR-MANIFEST.json`)** — the three rows under the `files` entry
`vendor/workflows/`, and nothing else. (Round 3's renumbering moved these off `E-17…E-19`,
which now denote the three new `lib/` modules; the stale reference is corrected here, PM v4
F-01. AT-3.8b's expected set is defined by *this* sentence, so it names the vendored three, not
the `lib/` three.) AT-3.8b is therefore writable, and the PLAN schedules it in Phase 1 rather
than deferring it.

## 6. Version resolution: store, launcher, pin, dev-mode (F-4)

### 6.1 The store

| Aspect | Specification |
|---|---|
| Root | `$PDLC_HOME/versions/`, default `~/.pdlc/versions/` |
| Entry | one directory per installed engine version, named by the exact version string: `~/.pdlc/versions/0.3.1/` containing an ordinary installed package tree (`bin/`, `lib/`, `vendor/`, `package.json`, `node_modules/`) |
| Enumeration | `store.listVersions(fs, root)` → sorted `Version[]`, using `handshake.mjs`'s `compare` (§3.3). A directory whose name does not parse as a version is **skipped and reported**, never guessed at |
| Writer | the install/upgrade command only (§9). The engine never writes the store during a run |
| Consumer projects | untouched. The store is machine-level state outside every consumer repo, which is what makes C-2/BR-2.1 true by construction rather than by discipline |

### 6.2 The launcher

The `PATH` entry is a thin launcher. Its whole job is: parse enough argv to know the
consumer cwd and the flags that affect resolution, resolve a version, then `exec` that
version's `bin/pdlc.mjs` with the original argv and an env marker saying it is the resolved
child. The child sees the marker and runs in-process without re-resolving — so resolution
happens **exactly once per invocation**, which is BR-1.5's structural precondition.

The hop is a **child process** (`child_process.spawnSync` with `stdio: "inherit"`, the
child's exit code re-raised as the launcher's own) rather than a dynamic `import` of the
target version, because the two versions may declare different
`@anthropic-ai/claude-agent-sdk` ranges and must not share one module registry. Node has no
`execve`, so this is deliberately *not* process replacement, and the earlier draft's phrase
"process replacement via `spawnSync`" is corrected here: the difference is observable in
signal handling, exit-code propagation and stdio buffering, and calling it replacement would
hide exactly the behaviours that need asserting.

**The signalled child is decided here, not merely named.** "Re-raise the child's exit code"
is undefined when the child is terminated by a signal: `spawnSync` returns
`{status: null, signal: "SIGINT"}` in that case, so a literal `process.exit(result.status)`
exits **0** on a Ctrl-C'd pipeline — a run that was interrupted reporting success, which
collides with AC-1.4's exit-code contract in the one case an operator is most likely to
produce by hand. Per DEC-EDIST-06: when `status` is `null` and `signal` is set, **the
launcher exits `128 + signum`** — the conventional shell encoding, non-zero for every
signal, not colliding with 1 or 2, and recoverable back to the signal number by the caller.
When `status` is a number it is re-raised verbatim, unchanged from the paragraph above.

Because pass-through is a claim about a real process, it gets a real oracle rather than
resting on S-3's descriptor double: **one test spawns through the launcher against a trivial
fake target** and asserts a non-zero exit code is propagated verbatim, that stdout and stderr
each arrive unchanged, and that they are not interleaved into one stream. **The signalled
case gets its own leg in the same test**, because the exit-code assertion above cannot reach
it: the fake target kills itself with a known signal, and the leg asserts the launcher's own
exit status **equals the exact decided number** (`128 + signum` — e.g. `130` for `SIGINT`),
a positive assertion on a literal rather than a `!== 0` that `null`-coerced-to-0 would also
have satisfied on the very defect this closes. Signal handling therefore stops being a
behaviour §6.2 names as needing assertion and becomes one it specifies an oracle for. S-3's descriptor
recorder (path, argv, env) stays for the resolution assertions, where not spawning a second
Node is the point; it cannot falsify pass-through, so it is not asked to. The claim that
"every existing CLI oracle keeps working" is load-bearing precisely because the shipped
`cli.test.js` exercises `bin/pdlc.mjs` directly rather than through the new hop.

**Two commands resolve but never refuse: `--version` and `doctor`.** AC-1.4 is unconditional
on an installed package ("when they ask the CLI for its version, then it reports the triple"),
and AC-1.1 puts `pdlc doctor` outside the compat gate precisely so the diagnostic that
explains a refusal still runs. Putting version resolution in the launcher ahead of everything
would otherwise make the new gate *structurally earlier* than that exemption — R-B's
`--ignore-scripts` scenario is the concrete case: the store is never populated, ladder branch
7 refuses, and the operator cannot run the one command that would explain why. So:

- **They resolve, and they never refuse.** The exemption AC-1.1 asks for is *never refuse*,
  not *never resolve*. Both commands run the ladder (§6.3) for **reporting only**: they never
  `exec` a resolved child, and a refusing branch is downgraded to a notice instead of an exit.
- **When resolution succeeds** — the pinned, latest or dev branch — they report **the resolved
  engine's** triple, read from the resolved store entry's own `package.json`, with the resolved
  `mode` and `pin`. This is what keeps AC-1.4's "the same triple the startup banner and the run
  report carry" true in the AC-5.1/AC-5.2 world this feature exists to create: in a repo pinned
  to a version other than the launcher's own, the run report carries the **resolved** version
  (§7.1), and a `--version` reporting the launcher's would disagree with it — the exact
  divergence AC-1.4 forbids, in front of the one operator who is debugging a pin.
- **When resolution fails** — no usable store entry, an unreadable config (ladder 0), a missing
  pin (ladder 4) — they fall back to the launcher's **own** engine version (from its own
  `package.json`), the plugin version resolved by the normal discovery path or `null` if none is
  found, and the declared `pdlcPluginCompat` range, with `mode` reported as `unresolved` and the
  refusing branch's text carried as a **notice** rather than as an exit. `doctor` additionally
  prints the store root, the enumerated versions (possibly none) and the install command, which
  is what makes it the diagnostic AC-1.1 says it is, and what keeps R-B's `--ignore-scripts`
  scenario explicable rather than mysterious.
- Exit code stays 0 for both in **both** states. A diagnostic that exits non-zero because the
  thing it is diagnosing is broken is not a diagnostic.
- Both states are asserted, because AC-1.4 has two and a design that answers one is only half
  testable: **(a)** pinned repo, store holds the pin → `--version`'s triple equals the run
  report's triple and equals the pinned version, `mode: "pin"`; **(b)** empty store →
  launcher's own version, `mode: "unresolved"`, the refusal text present as a notice, exit 0.

### 6.3 The resolution ladder (BR-4.1)

`resolveVersion()` is **pure**: it takes a listing, a **config read result**, argv-derived
flags, an env snapshot and a **`location`** record, and returns a decision. No fs, no exec,
no clock. Total and ordered.

The `location` input exists because branch 1's conjuncts are facts about *where the running
engine and the plugin are*, and the earlier draft named no input that carried them — leaving
AC-5.4 and O-5's rider 1 untestable without touching disk (TE Q-02). It is a plain record
computed by the caller and injected:

```js
/**
 * @typedef {object} EngineLocation
 * @property {string}  enginePath        Absolute dir of the running engine (its own `lib/`'s parent).
 * @property {boolean} isCheckout        True when `enginePath` sits inside a git checkout of this repo.
 * @property {string}  checkoutRoot      Absolute repo root when `isCheckout`, else "".
 * @property {string|null} pluginRoot    The resolved plugin root, or null when discovery found none.
 */
```

Branch 1's two conjuncts are then decidable in-memory: "the running engine is a checkout" is
`location.isCheckout`, and "the resolved plugin root is that checkout's `pdlc/`" is
`location.pluginRoot === join(location.checkoutRoot, "pdlc")`. Branch 2 can therefore name
*which* conjunct failed, as it promises to, from data alone.

| Order | Branch | Condition | Result |
|---|---|---|---|
| 0 | `config-unreadable` | the config **file** exists but could not be read or parsed (reader returned `unreadable`) | **refuse**, naming the file path and the parse error. Evaluated *before* every pin branch, because a corrupt file is not a statement about pinning |
| 1 | `dev` | `--dev` present **and** `location.isCheckout` **and** `location.pluginRoot === {checkoutRoot}/pdlc` (O-5 rider 1) | run the checkout in place; `mode: "dev"` |
| 2 | `dev-incomplete` | `--dev` present but either conjunct fails | **refuse**, naming which conjunct failed. Never a silent downgrade to pin or latest |
| 3 | `pin` | no `--dev`; consumer config has `engine.version` | that version from the store; `mode: "pin"` |
| 4 | `pin-missing` | pinned version absent from the store | **refuse** (AC-5.5), naming the pinned version *and* the enumerated installed versions. Never falls back |
| 5 | `pin-malformed` | `engine.version` present but unparseable | **refuse** (E-10), naming the offending value. Never read as "no pin" |
| 6 | `latest` | no `--dev`, no `engine.version` | highest version in the store; `mode: "latest"` |
| 7 | `empty-store` | no `--dev`, and the store is empty or missing | **refuse**, naming the store root and the install command |

Every branch, including 1, 3 and 6, produces an **announcement line** carried into the
startup banner and the run report (Q-3). Silence is not a permitted outcome (BR-4.4): "no
pin; latest installed 0.3.1" is an emitted statement, which is what makes AC-5.2's *absence
as visible as presence* mechanically testable.

### 6.4 The pin's location and read discipline (O-2)

Read from the consumer-owned `.claude/pdlc.config.json` under the `engine.*` namespace
already reserved by DEC-HE-02, at the path the engine already knows
(`ENGINE_CONFIG_PATH`, V-20):

```json
{ "engine": { "version": "0.3.1" } }
```

- **Read-only, always.** The engine never creates the file, never adds the section, never
  rewrites the value (BR-2.2, BR-4.7). An absent file and an absent `engine` section are
  both "no pin", announced as such, with nothing created (E-11).
- **A malformed `engine` section is not a missing one.** `engine` present but not an
  object, or `engine.version` present but unparseable, refuses per ladder branch 5. This
  mirrors V-09's shipped absent-versus-unreadable discipline in the handshake rather than
  inventing a second convention for the same distinction.
- **The reader must become three-way, because the shipped one degrades totally.**
  `readEngineConfig` today returns `{config: {}, notices: [...]}` on unreadable JSON
  (`pdlc/engine/lib/run.mjs:184-192`) and on a non-object section (`:197-203`) — it never
  refuses. Verified at HEAD. Composed with a ladder that reads "no `engine.version`" as "no
  pin", a **corrupt config file in a pinned repo silently runs latest**: exactly the AC-5.5
  failure mode, one layer up, with no ladder row covering it. Worse, because `resolveVersion()`
  is pure over its inputs, that case sits *outside* the function whose totality §6.3 tests —
  the ladder tests could be complete and this case still unreachable. So the extended reader
  returns a discriminated result, and the ladder is total over it:

  | Result | Meaning | Ladder |
  |---|---|---|
  | `{state: "absent"}` | no file, or file present with no `engine` section | "no pin" → branches 3–7 |
  | `{state: "no-pin", config}` | `engine` section present, no `version` key | "no pin" → branches 3–7 |
  | `{state: "unreadable", path, error}` | file exists but is not parseable JSON, or `engine` is not an object | branch 0 → **refuse** |

  The existing `notices` channel is **kept**, not replaced: the `dispatch` tunables keep their
  current degrade-with-notice behaviour **whenever the file parses**, which is correct for a
  tunable and wrong for a pin. Only the `engine` section gains the refusing read.

- **The behaviour change branch 0 introduces is stated, not implied: a corrupt config file is
  fatal even in a repo that never pinned anything.** Branch 0 fires on a **file-level** parse
  failure, which is not a statement about either section — and cannot be, because an
  unparseable file cannot say whether a pin was ever declared. A repo with a corrupt
  `.claude/pdlc.config.json` and no `engine` section runs today with a notice
  (`pdlc/engine/lib/run.mjs:184-192`, verified at HEAD) and **refuses** after this change.
  That is deliberate: the alternative — "unparseable, therefore assume no pin" — is the
  AC-5.5 failure mode the branch exists to remove, and it is indistinguishable from the
  benign case by construction. The trade is one loud refusal, naming the file and the parse
  error and remediable by fixing or deleting the file, in exchange for never silently running
  the wrong engine. Two consequences for the tests:

  | Case | Ladder | Note |
  |---|---|---|
  | file unparseable, `engine.version` **was** declared | 0 → refuse | the case the branch was written for |
  | file unparseable, **no pin ever declared** | 0 → refuse | the newly-refusing case; the totality tests carry it explicitly so the carve-out sentence above is not read as "this one degrades" |
  | file parses, `dispatch` tunable malformed | not branch 0 | degrades with a notice, exactly as at HEAD |

  Because the trigger is file-level, `readEngineConfig`'s `unreadable` state is what the
  ladder reads (§6.4's table), and the `notices` path never sees the unparseable file at all. This is an extension of the shipped
  function's contract, and §10.1's S-2 states the extended signature rather than the
  invented one.
- **Install and upgrade never touch it at all** — they run against the store, not against
  any consumer project (§6.1, §9.3).

### 6.5 `PDLC_PLUGIN_ROOT` (D-4, AC-5.6, E-13)

`resolvePluginRoot` (V-11) gains one input, `devDeclared: boolean`, and one branch:

| `devDeclared` | `PDLC_PLUGIN_ROOT` set | Behaviour |
|---|---|---|
| `true` | yes | honoured, exactly as today; source string unchanged |
| `true` | no | `--plugin-root` or discovery, as today |
| `false` | yes | **ignored**, discovery proceeds as if unset, and the run emits `notice: PDLC_PLUGIN_ROOT was set (<value>) and ignored — dev-mode was not declared; pass --dev to honour it` |
| `false` | no | unchanged |

The `--plugin-root` *flag* keeps its current precedence in all four rows: it is explicit and
per-invocation, which is exactly what T-6 asks for; the env var is neither. The notice text
is a catalogue entry (§10.3), not an inline string.

**Registering it is not the same as asserting it, and the earlier claim that the shipped
catalogue equality "covers it for free" was false at HEAD.** Two shipped oracles touch
message ids, and neither one covers this row:

- `__tests__/catalogue.test.js:71-74` compares `messageIds()` against
  `Object.keys(MESSAGES)` — the module against *itself*. Adding an entry moves both sides
  together, so the test stays green whether or not anything ever emits it. The file says so
  in its own header (`:4-6`): the emitted-ids equality is "a separate, cross-process concern"
  and explicitly out of scope there.
- The suite-wide step's row 1 (`__tests__/_assert-suite-wide.mjs:196-210`,
  `checkMessageCatalogue`) *does* run both directions over emitted records, but it is
  **path-blind**: it observes that some test somewhere emitted the id, never that the
  ignore branch emitted it. Its useful direction here is the reverse one — a registered id
  never emitted is a failure — which creates an *obligation* to emit the id from some test,
  not coverage of AC-5.6's trigger.

So AC-5.6 gets its own **path-level oracle**, named here rather than left to the PLAN: a
unit test over `resolvePluginRoot` drives the `devDeclared: false` × `PDLC_PLUGIN_ROOT` set
row, and asserts (a) discovery proceeded as if the variable were unset — the returned root
is the discovered one, not the env value — and (b) the run's notices contain the entry
**by catalogue id**, with its **rendered text** carrying the ignored value and the
`--dev` remedy. Both halves are asserted positively, on the branch itself; the three other
rows assert **no** such notice, so the branch cannot be satisfied by a notice that is always
emitted. The suite-wide equality then keeps its own job — no unregistered id, no unemitted
registration — as a backstop rather than as this row's coverage.

`REMEDY` (V-10) is updated in the same change to say `--dev PDLC_PLUGIN_ROOT=…` rather than
`PDLC_PLUGIN_ROOT=…` alone. Leaving it would make the product's own refusal text recommend
a remedy the product now ignores — the exact defect D-4's rationale turns on.

## 7. Provenance carriers (F-6, O-9)

This is O-9, and Q-1 asked the right question: *one decision or three?* The answer this
TSPEC gives is **three separate answers, and only one of them is new work** — which is
better than either option Q-1 offered.

| Carrier | AC | Status after §2's measurement | Work |
|---|---|---|---|
| Version pair in committed halt artifacts | AC-4.2 | Missing. The pair exists engine-side (V-13); the module that writes the artifacts cannot see it (V-16, V-17) | **New: §7.2's seam** |
| Authored-file enumeration in the run report | AC-4.5 | **Already shipped** as `artifactPaths` (V-14) | Verify completeness and document it as the oracle. **No carrier needed** |
| Load root, run-bound | AC-6.2 | Engine side: closable now (§7.3). Bundle side: **not closable**, C-4 forbids it | Engine half only; bundle half stays open, §14 |

### 7.1 The `Provenance` value

Built once per run, in `lib/provenance.mjs`, from the single startup resolution (V-08).
Frozen, plain-data, no functions:

```js
/**
 * @typedef {object} Provenance
 * @property {string}      engineVersion   T-1a, from the running package manifest.
 * @property {string|null} pluginVersion   T-1b, or null when none was found.
 * @property {string}      pluginCompat    T-3, the declared range.
 * @property {"engine"}    channel         C-9. Literal: the bundle channel builds no value.
 * @property {"latest"|"pin"|"dev"} mode    §6.3's resolved branch.
 * @property {string|null} pin             The pinned version when mode === "pin".
 * @property {string}      loadRoot        Absolute path the workflow modules loaded from.
 * @property {string}      line            One-line rendering, for commit messages and rows.
 * @property {string}      block           Multi-line markdown rendering, for documents.
 */
```

`line` and `block` are **pre-rendered by the engine**, not by the module. That is the whole
trick that makes the seam safe: the workflow module receives strings and places them; it
never formats, never branches on `mode`, and therefore cannot drift from the banner or the
report. One renderer, four placements — BR-5.1's "both halves travel together" becomes a
property of a single function rather than of three call sites.

### 7.2 The seam (`_provenance`)

`main()` in both workflow modules gains one keyword parameter, following V-15's shipped
idiom exactly:

```js
_provenance: provenance = NO_PROVENANCE,   // module-level frozen null-object
```

| Rule | Statement |
|---|---|
| P-1 | **Default-inert.** `NO_PROVENANCE` is a module-level constant with empty `line`/`block`. A runtime that supplies nothing produces byte-identical artifacts to today. This is the same guarantee the advisory tier ships with (`advisoryDisabled.test.js`, PROP-DIS-*), and it is what keeps NG-5 true |
| P-2 | **Data, never capability.** The seam is a frozen object of strings. The module calls nothing on it, imports nothing for it, and works unchanged inside the Claude Code workflow runtime where `import` does not exist |
| P-3 | **Four placements, one per AC-5.3 kind, all script-owned.** See the placement table below. The earlier draft named three and was short of kind 4; §13's "exactly four kinds" was right and §7.2 was wrong |
| P-4 | **Never agent-mediated.** Placement (b) is an `_appendFile` call *after* `_checkFile` confirms the POSTMORTEM exists (V-16), not a sentence in the agent prompt. An agent may paraphrase or omit a prompt instruction; an append cannot. AC-4.2 says the pair must be *in the committed bytes*, and only a script-owned write can promise that |
| P-5 | **Absent provenance never blocks.** If `block` is empty, the append is skipped entirely — no empty section, no marker, no diff. A halt still halts |

**The placement table (AC-5.3's four kinds, set-equal).** AC-5.3 fixes the marked kinds by
set-equality and says an unmarked kind fails, so each kind gets a named carrier and a named
call site verified at HEAD:

| Kind (AC-5.3 / FSPEC §5.3) | Carrier | Site |
|---|---|---|
| 1 — the run report | `provenance` field on the final report object | `buildFinalReport`'s returned record (`orchestrate-dev.js:13088` is the sibling `artifactPaths` field) |
| 2 — every POSTMORTEM | `block` appended by `_appendFile` after `_checkFile` confirms the file (P-4) | `orchestrate-dev.js:11077-11110` (V-16) |
| 3 — the `QUEUE.md` row the run rewrites | **both** the row's own text (a new `Engine` cell) **and** the commit message that lands it | `rewriteStatus` (`orchestrate-queue.js:1522`, writes the row at `:1571`); `commitQueueRow` (`:1598`) composes the message. The mark is applied **inside `rewriteStatus`**, so all five of its call routes inherit it — see below |
| 4 — every commit the run makes | `line` composed into the message inside each of **five** marked helpers, never at a call site | the closed set below |

Three things this pins down that the earlier draft left loose:

- **Kind 3 has two artifacts, not one.** The `QUEUE.md` row *text* and the commit message
  that lands it are separate bytes on disk; marking only the message leaves the row itself
  unmarked, and AC-5.3 asks about the row. Both get the mark.

- **Kind 4's marked sites are a closed enumeration, not a single helper — the earlier draft's
  "every script-owned commit funnels through `commitPaths`" is false at HEAD.** Measured by
  grepping every `git commit` invocation in both modules, there are **five** script-owned
  commit sites and only one of them is `commitPaths`:

  | # | Site | What it commits | Reached from |
  |---|---|---|---|
  | C-a | `commitPaths` (`orchestrate-dev.js:10408`, `git commit -m message` at `:10429`) | every pathspec-scoped artifact commit, including the Phase I wave commits (`:12390`, `:12401`, `:12801`) | `orchestrate-dev.js` |
  | C-b | `appendApprovalAnchors` (`orchestrate-dev.js:6660`; `_git(["commit", "-m", "chore(pdlc): record approval anchors …"])` at `:6736`) | the `APPROVAL-HASH:`/`REVIEWED-COMMIT:` lines appended at `:6716-6721` | `orchestrate-dev.js`, **not** via `commitPaths` |
  | C-c | `commitQueueRow` (`orchestrate-queue.js:1598`, `git commit` at `:1603`) | the `QUEUE.md` row (kind 3's own commit) | `orchestrate-queue.js`, a different module — it issues its own `git add`/`git commit` through `gitFn` and never touches `commitPaths` |
  | C-d | `commitAdvisoryRecord` (`orchestrate-queue.js:1637`, `git commit` at `:1645`) | `ADVISORY-{feature}.md` | `orchestrate-queue.js` |
  | C-e | the advisory **A5 seam's `apply`**, an arrow inside the exported factory `buildA5SeamOps` (`orchestrate-dev.js:2743`; bare `_git(["commit", "-m", "advisory(A5): … branch-introduced CI fix"])` at `:2837-2841`) | whatever is staged at that point — **no `git add`, no pathspec** | `main()`'s `buildA5SeamOps({…})` call (`:11718`) |

  **C-e is marked in place; it is not re-routed through `commitPaths`.** The earlier draft
  deferred it to a PLAN routing task, which made the expected set below conditional on a
  sibling task's merge order rather than on correctness (TE F-26). Routing is also not the free
  move that framing implied: `commitPaths` performs a pathspec-scoped `git add` and composes
  its own message, whereas C-e deliberately commits **whatever is already staged** with a
  message an advisory-tier assertion may pin — so re-routing would change both the committed
  content and the message. The cheap, shape-preserving fix is the one C-b already uses:
  compose `provenance.line` into the message string at the call to `_git`, leaving the staging
  behaviour and the `advisory(A5):` prefix exactly as they are. `buildA5SeamOps` therefore
  gains `provenance` in its destructured parameter object, defaulted to `NO_PROVENANCE`, and
  `main()` passes it at `:11718` alongside the seams it already passes.

  All five compose `line` internally, so no call site carries the responsibility. The
  structural claim is then the honest one — **"no script-owned `git commit` exists outside
  these five helpers"** — and it is *assertable*, not merely asserted: a source-level oracle in
  the arrangement suite greps both workflow modules for `git commit` invocations and asserts
  the set of **enclosing named functions** equals `{commitPaths, appendApprovalAnchors,
  commitQueueRow, commitAdvisoryRecord, buildA5SeamOps}`. "Enclosing *named* function" is the
  precise reading the oracle needs: C-e's commit sits in an anonymous `apply` arrow, so the
  oracle walks out to the nearest named function declaration, which is the exported
  `buildA5SeamOps`. The expected set is stated **unconditionally** — five members, no
  parenthetical, no dependence on another task landing — so the row is red or green on the
  code's shape and nothing else. A new commit site added anywhere else turns that row red,
  which is the property "a new site inherits the mark by construction" was reaching for and did
  not have. Without this correction AT-5.3's "none is unmarked" would go red against a correct
  implementation of the earlier design — the same failure mode §7.4 was corrected for.

- **Kind 3's mark is applied inside `rewriteStatus`, because `rewriteStatus` has five call
  routes and only one of them was named.** The earlier draft specified a single route
  (`main()`'s `_recordQueueRow` → the generated closure) and treated it as the way rows get
  written. Measured at HEAD, `rewriteStatus` is reached **five** ways:

  | R | Route | Status it writes |
  |---|---|---|
  | R-1 | `build-runtime.mjs:274`'s generated closure — the **queue-driven** run's `_recordQueueRow` | whatever `orchestrate-dev` records |
  | R-2 | `build-runtime.mjs:307`'s second generated closure — the **direct dev invocation**, whose own comment reads "a direct dev invocation still owns its queue row" | `halted` **or** `done` (evidence-carrying): the halt path writes `{status: "halted"}` (`orchestrate-dev.js:12913`) and Phase MERGE writes `{status: "done", evidence}` (`:1753`). The two are different statuses on different row-write paths, and §12.3's green-direct-run leg turns on the second (TE v4 F-31) |
  | R-3 | `orchestrate-queue.js:1426` — the queue driver marking a feature `in-progress` | `in-progress` |
  | R-4 | `orchestrate-queue.js:1439` — the queue driver's in-module write | per call |
  | R-5 | `orchestrate-queue.js:1464` — the queue driver's terminal write | `awaiting-merge` / `done` / `halted` |

  **Marking at the call sites would leave four of the five rows unmarked**, and the four
  include the two a *green* queue-driven run actually produces (R-3's `in-progress` and R-5's
  `awaiting-merge`) — so AC-5.3's kind 3 would be produced-and-unmarked on the default happy
  path and AT-5.3's "none is unmarked" would go red against a correct implementation. This is
  v2's F-01 in a different kind: kind 4's carrier set was closed by enumeration, and kind 3's
  was not. So the mark is placed in **one writer, not five callers**:

  1. `rewriteStatus` gains an **8th positional parameter** `provenance = NO_PROVENANCE`,
     defaulted so every existing caller and every existing test is unchanged (it takes seven
     parameters at HEAD, `orchestrate-queue.js:1522-1530`, so `provenance` is genuinely 8th).
  2. **`rewriteStatus` itself** hands `provenance.line` to `commitQueueRow` for the message and
     to the row writer for the cell. Every one of R-1…R-5 inherits the mark by construction;
     none of the five call sites has to remember anything. A route that passes nothing yields
     `NO_PROVENANCE` and today's exact bytes (P-1).
  3. The two routes that *can* carry a real provenance thread it explicitly: `main()`'s
     `_recordQueueRow` call object gains `provenance` beside `{feature, status, evidence}`
     (`orchestrate-dev.js:12913`), and **both** generated closures widen their argument list to
     pass it as the 8th argument — `build-runtime.mjs:274` **and** `:307`, not just the first.
     `dist/` is then rebuilt, so `build-runtime.mjs --check` and `sync-workflows.sh` are part of
     the task rather than an afterthought (K-3).
  4. The queue driver's own three callers (R-3…R-5) pass the queue run's provenance directly,
     since they are in the module that owns it.

  **One route needs a second look inside the writer.** `updateQueueStatus` — the row rewriter
  `rewriteStatus` calls — has **two** row-write paths, not one: an `evidence == null` quick
  path (`orchestrate-queue.js:445-450`, commented "exactly today's code path, byte for byte")
  and `writeEvidenceCarryingRow` (`:462`). The queue driver's three callers take the first and
  Phase MERGE's evidence-carrying write takes the second, so writing the `Engine` cell in only
  one of them reproduces the same gap in miniature. **Both paths write the cell.**

  **The cell is a new `Engine` column, not the existing `Evidence` one** (PM Q-03). `Evidence`
  carries merge semantics of its own — `mergeEvidenceCell`'s no-downgrade rule and the
  evidence-free identity property PROP-M-12 (`orchestrate-queue.js:621`, `:559`) — and writing
  a provenance string through it would corrupt both. The `Engine` column is added by an
  `ensureEngineColumn` helper mirroring `ensureEvidenceColumn` exactly (`:559`): append once,
  never twice, header + separator + one cell per data row.

  **The round trip is safe, but for a weaker reason than the earlier draft gave.** Both
  `parseQueue` (`:132`) and `updateQueueStatus` (`:415`) resolve columns by **lowercased
  substring containment, first matching column wins** — not by name equality
  (`colIndex`, `orchestrate-queue.js:154-160`: `names.some((n) => cols[i].includes(n))`, with
  the same logic re-implemented at `:427-433`) — and `parseQueue` falls back to **fixed
  positions** when no header row is found (`:169`). The conclusion still holds: `Engine`
  contains none of `order`/`#`/`status`/`feature`/`req`/`path`/`depends`/`deps`/`evidence`, so
  it collides with nothing and a trailing unnamed column is genuinely ignored. But it holds
  because of the literal string chosen, not because resolution is by name, so the guarantee a
  future column addition inherits is the weaker "no header cell **contains** a matcher token".
  The `ensureEngineColumn` round-trip test therefore **asserts the header literal**, so a later
  rename to something containing a matched substring goes red rather than silently shadowing a
  column. A hand-edited queue table that lacks the column gets it on the next write, and one
  that has it keeps it.

**Each of the five commit helpers gets a named route to `_provenance`, not just kind 3's.**
"All five compose `line` internally" is a statement about where the mark is written; it says
nothing about how `line` arrives, and three of the five are in scopes the kind-3 route does not
reach. Measured at HEAD, each route is:

| Helper | How `provenance` reaches it |
|---|---|
| C-a `commitPaths` | Same module as `main()`'s `_provenance`; `commitPaths` gains `provenance = NO_PROVENANCE` in its parameter object and `main()` passes it. Its wave callers (`:12390`, `:12401`, `:12801`) are all inside `main()`'s scope |
| C-b `appendApprovalAnchors` | **Module-scope** (`orchestrate-dev.js:6660`) and takes no provenance today: its destructured object is `{paths, hash, normalizedHash, commit, _readFile, _probeDoc, _appendFile, _git, emit}`. It gains `provenance` as one more member of that object, and **both** call sites thread it — `:6516` in the review-round body and `:11336` in the erratum-confirmation body. The second passes differently-named seams (`readFileFn`/`gitFn`), so the PLAN task names both sites explicitly rather than "the caller" |
| C-c `commitQueueRow` | Reached from `rewriteStatus`, which now holds the mark (kind 3's route above). No separate plumbing |
| C-d `commitAdvisoryRecord` | Signature is `(recordPath, feature, gitFn, emit)` (`orchestrate-queue.js:1637`), reached from the queue module's advisory path at `:1300` — **not** from `rewriteStatus`, so the 8th-parameter route carries nothing to it. `orchestrate-queue.js` has no `_provenance` seam of its own at HEAD (grepped: no match). The queue module's `main()` therefore gains the same `_provenance` keyword parameter `orchestrate-dev`'s does, and passes it to `commitAdvisoryRecord` as a fifth argument |
| C-e `buildA5SeamOps` | `provenance` joins its destructured parameter object; `main()` passes it at the single call site (`:11718`) |

Without this table AT-5.3's "none is unmarked" is unimplementable as specified for three of the
five members of the closed set, which is the same defect kind 3 had one level up.

**The production carrier: how a real `Provenance` reaches either module's `main()`.** Every
route above starts at a `main()` keyword parameter, and until now nothing named who supplies it
in production — the last unnamed hop, and the one that decides whether the whole chain is wired
or merely wireable (TE v4 F-28). The engine hands the workflow modules **exactly two frozen seam
objects**, and no others: `devInjection(adapter)` (`pdlc/engine/lib/run.mjs:80-91`, seven keys)
and `queueInjection(adapter, runPipeline)` (`:114-123`, five keys). Both are constructed in the
composition root — `runDev` at `:392`, `runQueue` at `:450-453` — and spread into the module's
`main()` call. So:

| Hop | Site | Change |
|---|---|---|
| Build | `lib/provenance.mjs` (§3.1, §7.1) | The single construction site. `bin/cli.mjs` builds the frozen `Provenance` **after** resolution, since the value needs the resolved version, `mode`, `pin` and `loadRoot` (BR-1.5's "resolved once per run") |
| Hand off (process entry) | `bin/cli.mjs`'s command bodies → `run*()` argument objects | **Three call sites, not two** (TE v5 F-32). **All line numbers in this row, in §11's S-6, in §12.1's production-path level and in §14.1's K-3 are HEAD's, in `bin/pdlc.mjs`; after the E-4b split (§9.3) these three statements live in `bin/cli.mjs` at different lines** — resolve them by name, not by address (TE v6 F-38). At HEAD they are `runDev({reqPath, forcePhases, cwd, adapter, startup})` (`pdlc/engine/bin/pdlc.mjs:385`), `runQueueLoop({queuePath, cwd, adapter, startup, maxPasses})` (`:434`, taken when `cmdQueue` runs in loop mode) and `runQueue({queuePath, cwd, adapter, startup})` (`:457`, the single-pass mode). **Each of the three gains `provenance`** in its argument object. Omitting `:434` is the live failure mode: `runQueueLoop` (`run.mjs:478`) forwards `{maxPasses = null, ...args}` into `runQueue` (`:491`), so it inherits provenance **iff `cli.mjs` put it in the object** — `pdlc queue --loop` would emit `NO_PROVENANCE` while every §12 oracle stayed green |
| Carry (dev) | `devInjection(adapter, provenance = NO_PROVENANCE)` (`run.mjs:80`) | Gains an **eighth key**, `_provenance`. `runDev` gains a `provenance` argument and passes it here |
| Carry (queue) | `queueInjection(adapter, runPipeline, provenance = NO_PROVENANCE)` (`:114`) | Gains a **sixth key**, `_provenance`, for `orchestrate-queue.js`'s own `main()` — the module that owns C-c, C-d and kind 3's R-3…R-5 rows. This answers TE Q-12: the queue takes it as an injected seam of its own, **not** through `_runPipeline`'s wrapper, because `commitAdvisoryRecord` (C-d) and `rewriteStatus` are reached by the queue's own `main()`, which `_runPipeline` never enters |
| Carry (delegated dev) | `runQueue`'s `runPipeline` wrapper (`:450-451`, `const devSeams = devInjection(adapter); (args) => devMain({...args, ...devSeams})`) | **No separate change.** The wrapper spreads `devInjection`'s result, so the dev pipeline a queue run delegates to inherits `_provenance` from the same key. This is the reason the queue key is additive rather than a re-route |

**One `Provenance` per run, not one per pass** (TE v5 Q-15). The value is built once in
`cli.mjs`'s command body, before `run*()` is called, and `runQueueLoop` passes the **same frozen
object** into every pass — its loop body calls `runQueue(args)` (`run.mjs:491`) with the very
`args` it received, and nothing in it rebuilds or re-resolves. That is BR-1.5's "resolved once
per run" read literally: a queue loop is one run, so all its passes carry identical provenance,
and a PLAN task must **not** re-derive the value inside the loop.

**One assertion, applied per pass — identity, not structural equality** (PM v6 Q-01). The
assertion form is a single one — `=== p` plus `Object.isFrozen` — evaluated for **every** pass
the fixture produces; there is no second, weaker structural assertion anywhere. "Same frozen
value" and "identity" name one bar, not two, and a task author transcribing this writes one
comparison inside a loop over the captured calls.

**The two legs capture two different objects, so the key name differs per leg** (PM v8 F-01).
The bar is one; the property path is not, and a task author copying one form onto the other leg
gets `undefined === p`:

| Leg | What the recorder captures | Assertion form |
|---|---|---|
| Process-entry (§12.1) | the **runner-argument object** `cli.mjs` builds — `runQueueLoop({queuePath, cwd, adapter, startup, maxPasses, provenance})` (`bin/pdlc.mjs:434`, forwarded as `...args` at `run.mjs:478`) | `captured[i].provenance === p` |
| Injection-level (§12.1) | the **seam object** the engine spreads into the workflow module's `main()` — `devInjection`/`queueInjection`'s result (`run.mjs:80-91`, `:114-123`), whose key this feature names `_provenance` (the carrier table above, §3.1, S-6) | `captured[i]._provenance === p` |

The plausible wrong repair — adding a second, `provenance`-named key to an injection so the
copied assertion goes green — is itself red at `PROP-PARITY-12`'s no-more-no-less seam-set
equality (`__tests__/seam-contract.test.js:47-63`, `:65-73`), so it costs two false starts on
the one leg that carries AC-5.3's loop claim. Hence the table rather than a single form.

**That per-pass assertion lives on the injection-level leg, not on the process-entry leg**
(TE v7 F-39). The two legs of §12.1 observe different things, and only one of them can see
more than one pass:

- The **process-entry** leg passes recorders for all five members of `cli.mjs`'s `deps` seam —
  `{runDev, runQueue, runQueueLoop, startupFor, liveAdapter}` (§9.3) — so the real
  `runQueueLoop` never runs and no loop is entered. Its recorder is therefore called **exactly
  once**, which that leg asserts rather than assumes (§12.1), and `captured` holds exactly one
  entry. A per-pass identity assertion there is true of every implementation — including one
  that rebuilds provenance on each pass — so it would be the precise vacuity TE v6 Q-18 asked
  to avoid, and `maxPasses: 2` would be decorative fixture data. What that leg owns, and all
  it owns, is the primary claim: the argument object `cli.mjs` hands `runQueueLoop` at
  `bin/pdlc.mjs:434` carries `provenance` at all — the defect that started this thread.
- The **injection-level** leg drives the **real** `runQueueLoop({maxPasses: 2, queuePath,
  cwd, adapter, provenance, importWorkflow})` (`run.mjs:478`) with the same recording
  workflow module that leg already substitutes through the shipped `importWorkflow` seam
  (`run.mjs:387`, `:427`). Two passes really execute, `runQueue(args)` is entered twice
  (`run.mjs:491`), and the recorder captures two seam objects. The identity comparison across
  those two captured objects is where a per-pass rebuild is actually falsifiable, so the
  `maxPasses: 2` bound is load-bearing there and nowhere else.

  For two passes to happen, the fixture must not trip the loop's own stop conditions
  (`run.mjs:486-509`), and the recorder's return shape is what decides that (TE v7 Q-19): the
  recording queue module's `main()` returns **`{outcome: "ran"}`** — the one BR-LOOP-4 row
  that falls through and continues (`run.mjs:509`) — while `blocked`, `idle` and `no-queue`
  each stop the loop on pass 1 (`:501-508`). The fixture also passes `startup: null`, so
  `refusalFor` yields `null` and no pass carries a refusal (`run.mjs:331-335`, `:495-498`),
  and an adapter stub carrying an `_agent` function, which `requireAdapter` demands before
  either import resolves (`run.mjs:319-323`). With those three, `maxPasses: 2` is reached as
  `stopReason: "bound-reached"`.

  **The premise is asserted, not merely arranged** (TE v8 F-44). Everything in the paragraph
  above is fixture *recipe*; nothing in an identity comparison over `captured` observes that the
  recipe still holds. A later edit to the recording module's return — `{outcome: "idle"}` for
  `{outcome: "ran"}`, one word — stops the loop on pass 1 with `stopReason: "exhausted"`
  (`run.mjs:505-508`), leaves `captured` holding one entry, and turns the per-pass comparison
  trivially true again: exactly the vacuity TE v7 F-39 removed, re-entering through the fixture
  instead of through the leg. So the leg carries **two first-class assertions before the identity
  comparison**, and they are assertions, not comments:

  1. `captured.length === 2` — the loop really ran twice, so "per pass" quantifies over more
     than one pass.
  2. the value `runQueueLoop` returns has `stopReason === "bound-reached"` — the bound, not a
     stop condition, is what ended the loop. `stopReason` is drawn from a closed four-member set
     (`LOOP_STOP_REASONS`, `run.mjs:317`), so this is a comparison against one named member, and
     any decayed fixture lands on a different member rather than on a missing field.

  With both, the "≥2 passes" premise cannot silently decay back into a one-pass fixture: it goes
  red at the assertion that names it, on the leg that depends on it.

Note also that no `argv`-driven fixture can set this bound by the same name: the CLI flag is
`--max-iterations` (`bin/pdlc.mjs:39`, `:425`, `__tests__/cli.test.js:150`), which `cmdQueue`
converts into `maxPasses` (`bin/pdlc.mjs:426`, `:439`). The bound is an injection-level
argument, which is a second reason the ≥2-pass leg belongs there.

**The seam sets are pinned by a shipped no-more-no-less equality, so the wiring task edits it in
the same task or turns a green test red.** `PROP-PARITY-12`
(`pdlc/engine/__tests__/seam-contract.test.js:65-73`) asserts
`Object.keys(devInjection(...)).sort()` equals `TSPEC_3_1_DEV_SEAMS` and the queue equivalent,
with the expected constants transcribed literally at `:47-63`. Adding `_provenance` to either
injection without editing those two constants is **red**; editing the constants without wiring
is red the other way. The PLAN therefore carries the **constant edit at `:47-63`** — adding
`"_provenance"` to `TSPEC_3_1_DEV_SEAMS` and `TSPEC_3_1_QUEUE_SEAMS` — **inside the same task**
as the injection change, not as a follow-up and not in a different batch, since the two files
are one atomic contract. Two adjacent readers of those constants need naming so a task author
does not edit the wrong one (PM v5 F-02):

- **`PROP-PARITY-12`'s third case (`:79-90`) needs no change.** It is an *exclusion* list — it
  asserts `devKeys.has("_runPipeline") === false` and, for each of `_parallel`/`_pipeline`/
  `_runCommand`, `queueKeys.has(…) === false`. `_provenance` goes onto **both** rows, so it
  belongs in neither exclusion, and its presence is already pinned no-more-no-less by the two
  `deepEqual`s at `:65-73`. Adding it here would assert the opposite of the wiring.
- **`PROP-PARITY-15` (`:268-282`) is the third reader of the same constant**, asserting every
  produced key is in `TSPEC_3_1_DEV_SEAMS` and not in `UNOVERRIDDEN_IO_SEAMS` (`:223-238`). It
  turns green on the `:47-63` edit alone, provided `_provenance` is kept **out** of the
  un-overridden list — where it does not belong, since it is an injected seam, not an
  `adapter` field the modules default for themselves (§2.5).

**Why this hop is the one that had to be named.** §12.1's module-side tests inject a populated
`Provenance` straight into `main()`, so kinds 1–4 all go green whether or not either injection
carries the key — while a real engine-driven run emits `NO_PROVENANCE` into every kind and
AC-5.3 fails in production with every stated oracle green. That is `builder-not-wired`, the same
false green §7.4 was corrected for, one level further out; §12.3's oracle 2 therefore gains a
**production-path leg** that reaches a module through the engine's injection rather than through
a hand-built parameter object (§12.3).

**Kind 4's literal scope needs an upstream decision, and it is raised rather than assumed.**
AC-5.3 says "the commit message of **every** commit the run makes". A run also produces
commits the script does not make: authoring agents commit their own spec sections, and in wave
mode the V-wave agent commits its own work. The script cannot promise those messages carry a
mark for exactly P-4's reason — an agent may paraphrase or omit a prompt instruction. So
either kind 4 means *every commit the script makes* (satisfiable, and what the helper above
delivers) or it means every commit including agent-made ones (not satisfiable by any
script-owned mechanism this design has). **Upstream has in fact already decided the principle,
and this TSPEC reads it rather than re-asking it.** FSPEC BR-9.3 puts cross-review and
`CODE_REVIEW-*` files outside the marked set on exactly this ground — "authored by dispatched
agents rather than by the run harness" — and REQ AC-5.3 repeats it. Kind 4 is therefore read as
**every commit the run *harness* makes**, i.e. the closed set C-a…C-e above, and the erratum
against REQ AC-5.3 is reduced to a **wording confirmation**: that "every commit the run makes"
be read with BR-9.3's harness/agent distinction, which the criterion's own text already relies
on for its file set. This keeps AT-5.3 ("every kind it produced carries the mark and none is
unmarked") satisfiable against a correct implementation instead of red by construction.

One consequence worth stating, because the two sets meet here: C-b **is** a harness commit, so
its *message* carries the mark, while the cross-review *file* it commits stays unmarked per
BR-9.3. Marked commit, unmarked file, no contradiction — §12.3's oracle 2 asserts both halves
(cross-review and `CODE_REVIEW-*` contents unmarked; every harness commit message marked).

### 7.3 The load root, and the half that stays open (AC-6.2, Q-2)

The engine can state its own load root truthfully: `lib/run.mjs` already computes the
absolute path of each module it loads (`workflowModulePath`,
`pdlc/engine/lib/run.mjs:58-62`), and §5.2 makes that path the discriminator between the
vendored and checkout roots. So `Provenance.loadRoot` is real, run-bound evidence on the
engine side, and it appears in the report and the banner.

**The bundle side gets nothing, deliberately.** C-4 forbids teaching
`.claude/workflows/`'s runtime to self-report, and the REQ's own AC-6.2 says so. This
TSPEC therefore **does not close AC-6.2's load-root half**, and says so plainly rather than
dressing the interim state as a solution:

- The engine-side positive is asserted: an engine run states a load root inside one of the
  two enumerated trees.
- The bundle-side conjunction stays FSPEC F-7 step 3's (1)+(2) — run completed and emitted
  named artifacts; output carries no engine provenance block.
- Per Q-2, **the limit is documented alongside the observation**. AT-6.2 is labelled
  `[manual]` in FSPEC §8 — an operator observation with recorded evidence, not a test file —
  so "the test itself" was the wrong carrier and §12.1's "One-time manual" row was right. The
  limit statement lives in **the recorded evidence document** for that observation: it states
  that the conjunction discriminates only on a machine whose installed channels are known
  independently. It is not dressed as a channel oracle.

This is the "settle the first two on one carrier but not the third, and say so" branch Q-1
explicitly permits — taken deliberately, to keep Phase 1 scoped, and re-opened by name in
§14 rather than dropped.

### 7.4 AC-4.5 needs no new carrier, but does need new enumeration (V-14, corrected)

The FSPEC marks AT-4.5 **[blocked]** on O-9 and says AC-4.5's authored-file enumeration is
"new work of the same kind as AC-4.2's". The carrier half of that is wrong — `artifactPaths`
ships, is returned on every report (`orchestrate-dev.js:13088`), and no new plumbing is
needed. But the earlier draft over-read the measurement, and the corrected reading changes the
work:

- `artifactPaths` is seeded with `reqPath` (`:11659`).
- **The only push site in the file** is `:11507`, and it is **conditional**:
  `if (pushArtifact) artifactPaths.push(docPath)`, with `pushArtifact = true` defaulted at
  `:11498`.
- That site is reachable **only from `converge()`** — i.e. FSPEC, TSPEC, DECISIONS, PLAN,
  PROPERTIES.
- LEARNINGS is authored **outside** it, through harvest's own `wrappedDispatch`
  (`:12690-12704`), and is never pushed.
- Phase DOD's `CODE_REVIEW-*` files and every POSTMORTEM are never enumerated at all.

So "every document the pipeline authors reaches `artifactPaths`" is **false at HEAD**, not
merely unverified: a correct run authors `LEARNINGS-{feature}.md`, which is absent from the
set. The earlier claim that the comparison set "already exists and is already emitted" does
not hold, and AT-4.5 would go red against correct code.

**The comparison set is therefore stated literally here**, because "every document" is not a
testable predicate and an oracle needs one. The document classes that must appear in a run's
`artifactPaths`, asserted as a **set-equality against the run's own report** (restricted to
the classes the run actually produced):

| # | Class | Reaches `artifactPaths` at HEAD? |
|---|---|---|
| 1 | `REQ-{feature}.md` | yes — seed (`:11659`) |
| 2 | `FSPEC-{feature}.md` | yes — `converge()` |
| 3 | `TSPEC-{feature}.md` | yes — `converge()` |
| 4 | `DECISIONS-{feature}.md` | yes — `converge()`, when authored |
| 5 | `PLAN-{feature}.md` | yes — `converge()` |
| 6 | `PROPERTIES-{feature}.md` | yes — `converge()` |
| 7 | `LEARNINGS-{feature}.md` | **no** — authored at `:12690-12704`, must be added |
| 8 | `CODE_REVIEW-{feature}-v{N}.md` | **no** — Phase DOD, must be added |
| 9 | `POSTMORTEM-{phase}-{feature}.md` | **no** — must be added |
| 10 | `ADVISORY-{feature}.md` | **no** — must be added when the advisory tier is enabled |
| 11 | `CROSS-REVIEW-{role}-{doc}-v{N}.md` | **no** — and these are *modified in place by the script*: `appendApprovalAnchors` appends `APPROVAL-HASH:`/`REVIEWED-COMMIT:` to an **already existing** file (`orchestrate-dev.js:6716-6721`) and commits it (`:6736`). Must be added |

**Why class 11 belongs here even though BR-9.3 excludes cross-reviews from AC-5.3's mark
set.** The two sets are different sets and the exclusion does not carry across. AC-4.5 asks
that every file under `docs/{feature}/` that existed before the run hash identically **except**
those the report enumerates. An anchor-appended cross-review is a pre-existing file whose hash
changes and which no `artifactPaths` push covers — so the set-equality this section builds
fails against correct code unless the anchor path enumerates the file it touched.

**It does not do this at HEAD, and the route it will take is named here rather than assumed.**
Verified: `appendApprovalAnchors` is a **module-scope** function (`orchestrate-dev.js:6660`)
whose destructured parameter object is `{paths, hash, normalizedHash, commit, _readFile,
_probeDoc, _appendFile, _git, emit}` — no collector. Its body sets `appended = true` (`:6721`)
and pushes nothing. `artifactPaths` is a `const` **local to `main()`** (`:11659`) and the only
push in the file is `:11507`, inside `main()`'s nested `runPhase`. So class 11's coverage is
**work this feature must build**, not behaviour to assert against today's code — it is in the
"must be added" column of the table above for exactly that reason, and the sentence that read
"It does" was wrong.

The route, stated to the same precision as §7.2's kind 3:

1. `appendApprovalAnchors` **returns the paths it actually appended** (`{appended, paths}`),
   which it can do with no new seam: it already tracks `appended` at `:6721`. Returning is
   preferred to taking a collector parameter because the two call sites sit in different
   scopes.
2. Call site **A**, `reviewLoop`'s PASS branch (`:6516`): `reviewLoop` is **module-scope**
   (`:6183`) and cannot see `artifactPaths`, so it surfaces the anchored paths in the record it
   already returns at `:6529`. Both of `reviewLoop`'s callers are inside `main()` — `:11532`
   (`runPhase`'s `const loop = await reviewLoop({…})`) and `:12532` (Phase CR's `crResult`) —
   and each pushes them onto `artifactPaths`.
3. Call site **B**, the erratum-confirmation body (`:11336`): this one is inside `erratumRound`
   (`:11123`), which is **nested within `main()`**, so it closes over `artifactPaths` and
   pushes directly. It passes differently-named seams (`_readFile: readFileFn`, `_git: gitFn`),
   so the PLAN task names this site separately rather than describing "the caller" once.
4. Both pushes are conditional on the append having succeeded, matching P-5's rule that a
   failed anchor append yields no approval and changes nothing else.

BR-9.3's exclusion still holds for AC-5.3 — the file's *contents* carry no provenance mark
(§7.2) — and the two facts coexist: enumerated as modified, unmarked in content.

**`QUEUE.md` is deliberately absent from this table.** It sits at `docs/_queue/QUEUE.md`,
outside `docs/{feature}/`, so it is outside AC-4.5's scope entirely — it is not an omission but
a boundary, and it is covered instead as AC-5.3's kind 3 (§7.2). The same goes for
`docs/_decisions/` and `docs/_constraints/`.

Stating the set as an equality rather than a subset is what makes it hold over time: a newly
authored document class forces this list to be revisited, because the test goes red until it
is. The PLAN carries the work as **fixing the five missing classes (7–11) plus the equality test**,
not as "verify the existing set" — which is a larger task than the earlier draft scheduled,
and is the honest size. AT-4.5 is unblocked and scheduled in Phase 1. The FSPEC's "[blocked on
O-9]" marking is still wrong (no O-9 carrier is needed), so the erratum against the FSPEC
stands, now with the corrected reason.

## 8. Publish pipeline (F-5)

### 8.1 Shape

A **new** file, `.github/workflows/publish.yml`, triggered on `push: tags: ['engine-v*']`.
It adds no job to `pr-tests.yml` and edits no `name:` in it (C-5, BR-7.5), so V-18's five
rendered check names are untouched and Phase PUB's literal polling keeps working.

**`engine-v*` is a new convention this TSPEC establishes, not an existing one it matches.**
T-4 refers to "the repo's version-tag convention"; the repository has **zero tags at HEAD**
(verified: `git tag | wc -l` → 0), so there is no convention to match and the phrase has no
referent. The `engine-` prefix is chosen deliberately over a bare `v*`: the plugin and the
engine version independently (T-1a/T-1b), and a bare prefix would make a future plugin tag
trigger an engine publish. This is called out so a reader does not go hunting for a
convention that does not exist.

| Job | Depends on | Does |
|---|---|---|
| `gate` | — | Re-runs the five PR-gate jobs' commands at the tagged commit (§8.2) |
| `preflight` | — | Offline manifest and version checks (§8.3). Runs in parallel with `gate`: it needs no network and no gate result |
| `publish` | `gate`, `preflight` | Writes the pairing record, packs, publishes through the channel seam (§8.4) |

`preflight` failing while `gate` is still running is a **failed workflow run** either way
(BR-3.2); no job is `continue-on-error`, and none is conditional on anything but its
dependencies' success.

### 8.2 How the gate is re-run (C-5, BR-3.1)

**`publish.yml` carries its own copy of the five gate jobs' bodies. `pr-tests.yml` is not
touched at all.** The reusable-workflow extraction the earlier draft made primary is
**rejected**, and the reason is mechanical rather than a matter of taste.

GitHub renders a job that `uses:` a reusable workflow as `{caller job name} / {called job
name}` (with matrix suffixes attached to the *called* job). Extracting the five bodies into
`gate.yml` therefore changes all five **rendered** check names — the names Phase PUB polls
literally — while leaving the caller's authored `name:` keys byte-identical. That combination
is the worst possible one: the break is invisible to the very oracle offered against it.
§8.5's expander reads job-level `name:` keys and expands **declared matrix axes only**; it
models no `uses:` nesting, and BR-7.3's "unexpandable name expression" guard does not fire
because there is no expression in the name. The oracle would stay **green** while the live
checks were renamed, and the blast radius is a consumer's Phase PUB poll, not a test. An
oracle that cannot detect the failure it is nominated against is not a mitigation.

Two further reasons the extraction was the wrong primary:

- **C-5 says the publish workflow is additive** — "a new workflow file with its own trigger".
  Rewriting `pr-tests.yml`'s five job bodies into `uses:` calls is not additive by any
  reading.
- The duplication's only cost is YAML that must be kept in step, and that cost is **paid by an
  oracle rather than by discipline**: §8.5's set-equality already compares `publish.yml`'s gate
  job commands against `pr-tests.yml`'s, so a command that drifts in one file and not the other
  fails the gate. Duplication with an equality check is safer than extraction with a blind one.

So the risk C-5 priced is not mitigated, it is **removed**: `pr-tests.yml` keeps its five job
bodies and its five `name:` keys, V-18's rendered names cannot change because nothing edits
them, and `publish.yml` re-runs the same commands at the tagged commit. §8.5 additionally makes
the rejected path *mechanically* unavailable rather than merely discouraged: a job carrying
`uses:` fails the arrangement gate as unexpandable, so a future attempt at extraction goes red
in CI instead of silently renaming a consumer's checks.

### 8.3 Preflight — everything decidable offline (BR-3.8, BR-3.9)

All five checks below are repo-local computations. No network, no credential, no version
number consumed. Each failure names the offending value and fails the run.

| # | Check | AC |
|---|---|---|
| PF-1 | Tag version equals `pdlc/engine/package.json`'s `version` at the tagged commit. Compared against T-1a **only**; the plugin's number is never a tag subject | AC-3.6, BR-3.4 |
| PF-2 | `pdlcPluginCompat` at that commit includes `pdlc/.claude-plugin/plugin.json`'s version at that commit, evaluated by `satisfiesRange` — the same function the runtime handshake uses, so CI and runtime cannot disagree about the range grammar | AC-3.7, C-1 |
| PF-3 | Manifest is publishable: `private` absent, `license` a real SPDX id, and `name` equals **the scope recorded in `DECISIONS-plugin-distribution.md`** (N-6) — asserted against the recorded decision, never against a literal authored in this TSPEC, so an operator who registers a different scope changes one record rather than chasing a string through the design | AC-3.1 precondition, O-8 |
| PF-4 | The packed file list equals §5.4's expected set member-for-member, in **both** directions. Run against a **real `npm pack` into a temp directory**, not `--dry-run`: the expected set includes `vendor/workflows/*`, which only exists once `prepack` has run, and `--dry-run`'s lifecycle behaviour varies by npm version. Excluding the vendor rows to make `--dry-run` work would make AT-3.8b vacuous, which is the opposite of the point (TE Q-01) | AC-1.3, BR-8.1 |
| PF-5 | Vendor manifest hashes equal the canonical sources at that commit (AF-2) | §5.3, BR-8.2 |

### 8.4 Publish, behind the channel seam (BR-3.9)

The publish step calls a `PublishChannel` (§10.2), not `npm publish` directly. The real
implementation shells out to `npm publish --access public`; the stub records the bytes and
the version it was asked to publish.

- **Pairing record (O-6, AC-1.5).** The `publish` job — the same job that computed PF-1 and
  PF-2 — writes `pdlcPairing: {engineVersion, pluginCompat, pluginVersionAtTag, tag,
  commit}` into `package.json` before packing. **Single writer** (BR-3.7): any
  release-notes rendering is generated from this object in the same job, never authored
  independently.
- **Ordering, so the equalities see what ships (PM Q-01).** The sequence is fixed:
  (1) `preflight` runs PF-1…PF-5 on the unmutated tree; (2) the `publish` job writes
  `pdlcPairing`; (3) `prepack` vendors and packs; (4) **PF-4 and PF-5 are re-asserted against
  the packed tarball** before the channel is called. Step 4 is what stops the mutation being
  a member no check ever saw. The mutation adds a *key to `package.json`*, not a file, so the
  packed **file list** is unchanged and PF-4 still holds — but that is asserted rather than
  argued, because "the manifest is a member of its own expected set" is exactly the kind of
  claim that silently stops being true.
- **Reader path for AC-1.5 (PM Q-02).** The record travels inside the packed manifest, so the
  operator-facing read is `npm view @{scope}/pdlc-engine pdlcPairing`, which hits the registry
  metadata and does **not** require downloading or installing the package. That command is
  named in `pdlc/README.md` alongside the install commands (§9.1); naming it is what makes the
  pairing "not left to be reverse-engineered" true for an operator rather than only for a test.
- **Immutability (C-7, AC-3.3).** The chosen branch is **loud failure**, not silent no-op:
  the channel is asked whether the version exists and the job fails naming the collision if
  it does. Public npm refuses a re-publish by design
  (`docs/_decisions/DECISIONS-plugin-distribution.md`, DEC-DIST-05's channel table), so the
  no-op branch is unreachable against the real registry — and rehearsing it there would
  burn a version number irreversibly. Both branches are therefore exercised **over the
  stub** (AT-3.3), which is where the byte-identity assertion lives.
- **Secrets (C-8, AC-3.5).** `NODE_AUTH_TOKEN` from repository secrets, consumed only by
  the publish step. The positive halves AC-3.5 requires: with the secret present the stub
  channel records an authenticated publish; with it absent or empty the job **fails at the
  publish step naming the missing secret**, publishing nothing. The absence half scans the
  packed tarball and the captured log for a known sentinel value.

### 8.5 What the expected-check-set oracle reads (BR-7.1, BR-7.3, BR-7.6)

The carrier is `pdlc/engine/__tests__/ci-arrangement.test.js`, extended, and it absorbs
that file's existing overlapping matrix assertions (V-19) so one arrangement change has one
failure and one remedy.

- Reads **job-level `name:` keys only**, from `.github/workflows/pr-tests.yml` only.
  Step-level names — the file carries roughly sixteen, e.g. `:46,53,66,70,92` — are not
  members, and neither are `publish.yml`'s jobs (BR-7.5).
- Separately from the rendered-name set, it asserts that **`publish.yml`'s gate jobs run the
  same commands as `pr-tests.yml`'s five**, as a set-equality over the run commands. This is
  what pays for §8.2's duplication: the two files are kept in step by a test, not by memory.
  It is not part of the rendered-check-set membership, which stays `pr-tests.yml`-only.
- Renders by expanding **declared matrix axes only**, and the axes are read **per job**, not
  once for the file. V-18's "same matrix" compression is corrected in §2: `unit-tests`
  declares `os` **and** `node` (`.github/workflows/pr-tests.yml:40-41`), `engine-tests`
  declares `os` only (`:86-87`), and `artifact-freshness`, `fresh-clone-bootstrap` and
  `script-syntax` declare none. A single file-wide axis set would render the wrong expected
  column for four of the five jobs.
- A `name:` containing any non-matrix expression (`github.*`, `inputs.*`) or an axis
  introduced by a matrix `include` entry is a **failure of the gate** reported as
  `unexpandable name expression` — never silently under-rendered and never skipped (BR-7.3,
  E-19).
- **A job carrying `uses:` is unexpandable and fails the gate**, symmetric with BR-7.3/E-19.
  A reusable-workflow call renders as `{caller job name} / {called job name}`, which this
  expander does not model and which no `name:`-key comparison can detect (§8.2). Rather than
  teach the expander a nesting rule whose correctness could only be confirmed against live
  GitHub rendering, the arrangement is declared out of bounds and fails loudly. This is what
  makes §8.2's duplication decision **mechanically enforced** rather than left to the
  judgement of whoever next edits the workflow.
- Mutations are exercised against **fixture copies** of the YAML, never the live file
  (BR-7.6).
- The rendered column's dated cross-check against GitHub's real reporting stays a
  **one-time, non-gating seed record** in the FSPEC (BR-7.4). This TSPEC adds no second gate
  over it.

## 9. Install and upgrade (F-2, F-3)

### 9.1 The two commands, and their single documented home (BR-2.3)

Both live in `pdlc/README.md`'s `## Install in another repo` section — the section that
documents the plugin install today at `pdlc/README.md:132` — added beneath it:

| Purpose | Command |
|---|---|
| Install | `npm i -g @{scope}/pdlc-engine` |
| Upgrade | `npm i -g @{scope}/pdlc-engine@latest` |
| Read the plugin pairing (AC-1.5) | `npm view @{scope}/pdlc-engine pdlcPairing` |

`{scope}` is the operator-owned npm scope of N-6/§5.1, resolved to a literal once that
decision is recorded; the README ships the resolved literal, not the placeholder.

**`pdlc/README.md` is the operator-facing page; `pdlc/engine/README.md` is not** (PM Q-02).
The engine README exists to make PK-2 an intentional member rather than an accidental one and to
give the npm listing a page (§5.1); it states what the package is and **links** to
`pdlc/README.md`'s install section. It must **not** repeat the three commands above — under
AT-2.2's uniqueness rule a second copy of either engine command anywhere in the tree is a
defect, and that rule is the reason this is a design constraint on the README's content rather
than a stylistic preference.

The uniqueness rule is keyed on the **engine's own** invocation — the distinguishable
package name `@{scope}/pdlc-engine` — so the plugin's three existing `claude plugin install`
occurrences (`README.md:115`, `pdlc/README.md:139,145`) are outside the set and AT-2.2 does
not trip on them. A second copy of either engine command anywhere else in the tree is a
defect the moment it exists.

### 9.2 How a global install populates the store (§6.1)

The published package's `postinstall` places the installed tree into
`$PDLC_HOME/versions/<version>/` and leaves the global `bin` shim pointing at the launcher.
Consequences, each of which an AC depends on:

- Installing a second version **adds** a store entry rather than replacing one, which is
  what makes AC-5.1 (execute X while Y is latest) and AC-5.5 (name what *is* installed)
  satisfiable without a network.
- Upgrading changes both the resolved version and the resolved install location, which is
  AC-2.3's upgrade-leg positive — a *change* against pre-recorded values, the observation that
  proves the upgrade was not a silent no-op. **The observed "install location" is named
  explicitly, because the obvious reading is the wrong one:** it is the **resolved store entry**
  `$PDLC_HOME/versions/<version>/`, *not* the launcher's own path on `PATH`. The launcher lives
  at the npm global prefix and stays exactly where it is across an upgrade — a test author who
  records that path as the pre-value will watch it not change and fail for the wrong reason. The
  store entry is the value that moves, and it is the one that makes the criterion meaningful:
  it is evidence that a different version tree is what now executes. Both legs record
  `{resolvedVersion, resolvedStoreEntry}` and assert inequality on both.
- Nothing in either path reads or writes a consumer project. C-2/BR-2.1 holds structurally,
  not by discipline: the code paths take a store root and a package tarball, and are given
  no consumer path at all.

### 9.3 Node floor (C-3, T-2, BR-2.4, AC-2.4)

Two enforcement points, because the criterion covers both an install attempt and a pipeline
invocation:

1. `engines.node: ">=20"` in the manifest (§5.1), so `npm` refuses or warns at install time
   with the floor in its own message.
2. A guard in the launcher comparing `process.versions.node` against the floor and exiting
   non-zero with `pdlc requires Node >= 20; found <v>`.

**"At the top of the file" does not achieve this, and the earlier draft's wording would not
have worked.** ESM static imports are resolved and evaluated **before** the importing module's
body runs, so a guard placed at the top of `bin/pdlc.mjs` still executes *after* everything it
imports. The shipped launcher carries six static imports at `pdlc/engine/bin/pdlc.mjs:22-30`
(`lib/skills.mjs`, `lib/startup.mjs`, `lib/adapter.mjs`, `lib/transport.mjs`, `lib/run.mjs`,
`lib/report.mjs`); a modern-syntax construct anywhere in that graph throws a parse error with a
stack trace before the guard's first statement — exactly what AC-2.4 forbids.

So the guard is **its own dependency-free entry point**:

- The `bin` entry **keeps the name `bin/pdlc.mjs`** and becomes that small module: its **only**
  top-level statements are the version comparison, the refusal, and — on success — a
  **promise-chained** `import("./cli.mjs").then(…)`. The dynamic import is what defers the rest
  of the graph until after the check. Keeping the name is what leaves the manifest's `bin`
  field, AC-2.1's `PATH` entry and `cli.test.js`'s invocation target untouched (§5.4, TE Q-06).
- **No top-level `await`.** The earlier draft specified `await import("./cli.mjs")`, which
  defeats the whole point of the section: top-level `await` is a **Node 14.8+ parse-level**
  feature, so on Node 12 the guard is a `SyntaxError` thrown before its first statement — a
  stack trace with no named floor, which is precisely the AC-2.4 failure this redesign exists to
  remove, merely relocated from `lib/` into the guard. The promise-chain form has no such
  requirement.
- That file is written in the syntax subset valid on the **oldest Node that could plausibly run
  it**, not on the floor version. The honest floor for the guard's own syntax is **Node
  12.17+**, where dynamic `import()` first parses in ESM; it parses there so that it can refuse
  there. Earlier 12.x patch releases are outside the claim, and stating the real number is
  worth more than a rounder one the file cannot back.
- Everything currently in `bin/pdlc.mjs` moves into the new `bin/cli.mjs` (PK-4b), behind that
  dynamic import; the guard file imports nothing statically, so there is no graph to evaluate
  early. The **command logic** moves unchanged — the split exists to satisfy the
  evaluation-order constraint above — but the move is **not byte-identical**, and the two
  exceptions are named here rather than discovered at build time (PM v6 F-01, TE v6 F-36):

  1. **Entry shape.** HEAD ends in a bare `main().catch(…)` (`bin/pdlc.mjs:505`), so *importing*
     the module runs the CLI against the importer's `process.argv`, prints `USAGE` and sets
     `process.exitCode = 1`. In `cli.mjs`, `main` is **exported** and self-invocation moves
     behind an entry guard — `if (process.argv[1] && import.meta.url ===
     pathToFileURL(process.argv[1]).href) main().catch(…)` — so `pdlc dev …` behaves exactly as
     at HEAD while an import is inert.

     **`argv` keeps HEAD's convention, and the parameter is defaulted to `process.argv`**
     (PM v7 F-02). HEAD's body opens `const [, , cmd, ...rest] = process.argv`
     (`bin/pdlc.mjs:479`), i.e. it destructures the **full** `process.argv` with execPath and
     script path included. The signature is therefore `main(argv = process.argv, deps = …)`
     and the first statement becomes `const [, , cmd, ...rest] = argv`: the two-element skip
     stays, unchanged, because the shipped subprocess entry still parses through it. A caller
     in a test passes a **process-argv-shaped** array — `["node", "pdlc", "queue", "--loop",
     "--max-iterations", "2"]` — not a sliced argument list. (`--loop` is what selects
     `cmdQueue`'s loop branch and so the `runQueueLoop` call site; `--max-iterations` is
     captured as `maxPasses` in the recorded argument object, `bin/pdlc.mjs:425-439`, and drives
     no passes here, because the recorder stands in for the loop — the ≥2-pass fixture is the
     injection-level leg's, §7.2.) The array deliberately carries **no `--plugin-root` and no
     `--cwd`**: those pin startup inputs, and the startup rung is injected through `deps`
     (exception 2), not reached for real — argv here selects a command and a branch, nothing
     more. Passing `["dev", "docs/…"]`
     instead lands in the `default:` branch (`bin/pdlc.mjs:498-501`), prints `USAGE`, sets
     `process.exitCode = 1` and leaves the recorder uncalled; the tempting "fix" — deleting
     the skip — changes what the real `pdlc` entry parses, which is why the shape is stated
     here rather than inferred at task-writing time.
  2. **Runner seam.** `runDev`, `runQueue` and `runQueueLoop` arrive as static ESM bindings
     (`bin/pdlc.mjs:30`) and cannot be substituted by an importer; `node:test`'s `mock.module`
     is experimental and absent from the pinned runner (`engines.node: ">=20"`, local Node
     v20.20.1). So `main(argv, deps)` and the command bodies take a **default-valued `deps`
     object**, the shape `run.mjs` already uses for `importWorkflow` (`run.mjs:387`, `:427`).
     Production behaviour is unchanged because the defaults *are* the module's own bindings;
     §12.1's process-entry leg passes recorders instead.

     **The seam covers five members, not three, because two gates stand between `main()` and
     any runner** (TE v8 F-43, PM v8 F-02, and the choice TE v8 Q-21 asked to be made here
     rather than by the PLAN author). A runner is unreachable at HEAD until two things happen
     first, and neither is a runner:

     - `const startup = startupFor(argv)` is `cmdQueue`'s **first** statement (`bin/pdlc.mjs:397`)
       and `cmdDev`'s statement after positional parsing (`:362`); both `return` on `!startup.ok`
       after printing a refusal (`:397-408`, `:362-374`), leaving every runner uncalled. Behind
       it is the real `runStartupChecks` (`:139-146`, `lib/startup.mjs:319-343`), whose ladder
       resolves a plugin root (rung 1), reads its manifest and compat range (rungs 2–3), loads
       dispatchable skills (rung 4), probes a guard interpreter on `PATH` (rung 4a) and resolves
       an auth posture from `process.env` plus login evidence under `os.homedir()` (rung 5,
       `lib/auth.mjs:113-123`). Note the one input argv cannot pin: `startupFor` passes **no
       `cwd`**, so rung 0's git-repo check reads `process.cwd()` (`lib/startup.mjs:328`, `:348`)
       — `--cwd` reaches `liveAdapter` only (`bin/pdlc.mjs:283`).
     - `liveAdapter(argv, startup)` (`:279-298`, called at `:382`/`:417`) then builds a **real**
       SDK transport and adapter before the runner call at `:434`.

     Three keys therefore leave the leg's outcome decided by the environment it happens to run
     in rather than by the code under test. Worse, the failure is *silent-zero*: on a machine
     that exports `ANTHROPIC_API_KEY` with no login evidence, auth row 5 refuses
     (`lib/auth.mjs:88-95`), `cmdQueue` returns at `:407`, and a leg that only loops over
     `captured` asserts nothing — the same shape TE v7 F-39 removed one level down. So `deps` is
     **`{runDev, runQueue, runQueueLoop, startupFor, liveAdapter}`**, each defaulting to the
     binding of that name in `cli.mjs`, and all five are exported so §12.1 can pin them.

     The alternative — keep three keys and pin the ladder through argv and env — was weighed and
     rejected. It is *writable*: `--plugin-root` and `--allow-api-key-billing` are both in
     `queue`'s and `dev`'s closed flag sets (`bin/pdlc.mjs:93-103`), and the opt-in flag widens
     `apiKeyPolicy` (`:144`) so no auth row refuses (`lib/auth.mjs:61-99` — row 5 is the only
     refusing row and it requires `allowApiKeyBilling !== true`). But it leaves four ambient
     preconditions load-bearing for a leg whose entire question is *what the command body put in
     the argument object*: a git-repo `process.cwd()`, a readable plugin tree, a guard
     interpreter on `PATH`, and a real transport constructed for a run that dispatches nothing.
     Two more seam keys buy a hermetic leg; the shipped subprocess tests (`__tests__/cli.test.js`)
     remain the place the real ladder and the real adapter are exercised, which is the division
     of labour those tests already have.

     **Which runtime "pinned" means, so the seam is not simplified away later** (PM v7 Q-01):
     the justification is the **declared floor**, `engines.node: ">=20"` — a field this feature
     adds (§5.1), so the citation is forward-looking rather than a HEAD reading. Any runtime the
     floor admits must be able to run this suite, and the floor admits Node 20, where
     `mock.module` does not exist. That a *newer* admitted runtime (22.3+) happens to offer it
     does not make the seam optional, because the seam must work on the whole admitted range,
     not on whichever runtime the maintainer's laptop has (currently v20.20.1). The seam is
     re-decidable only if the floor itself is raised above 22.3.

     **The defaults are pinned, or nothing observes the real runners** (TE v7 F-41). "Production
     behaviour is unchanged because the defaults *are* the static imports" is a claim, and it is
     exactly the claim a mis-wired default (`runQueueLoop: runQueue`) falsifies while every test
     stays green — the process-entry leg always supplies its own recorders, and the shipped
     subprocess tests never reach a real runner either (`cli.test.js` covers `--dry-run` returns
     at `:70`, `:78`, `--max-iterations` refusals *before* the loop starts at `:149-156`, and
     startup-rung refusals at `:86`, `:102`, `:114`). So `cli.mjs` **exports its default `deps`
     object**, and one assertion in the process-entry leg pins it two ways: its key set equals
     exactly `{runDev, runQueue, runQueueLoop, startupFor, liveAdapter}` by set-equality against
     a literal (a dropped or renamed key fails), and each value is `===` the binding it is meant
     to be — the three runners against `lib/run.mjs`'s correspondingly-named exports
     (`run.mjs:381`, `:422`, `:478`), the two gate constructors against `cli.mjs`'s own exports
     of the same names (which is why the split exports them: `startupFor: liveAdapter` is a
     swap set-equality alone cannot see). A swapped or aliased default is red at that one
     assertion, on the level that introduces it.

     **What the five recorders must return, since the command bodies keep running after the
     call.** The seam does not end the command body: `cmdQueue` destructures the loop result and
     reaches `emitReport` (`bin/pdlc.mjs:437-452`), which reads `startup.pluginVersion` /
     `startup.pluginRoot` and calls `adapter.getApiKeySource()` and `adapter.getPauseLog()`
     (`:323-342`), while `formatStartup(startup)` spreads `startup.banner` first
     (`lib/startup.mjs:485-486`). A recorder returning `undefined` throws inside the command body
     rather than failing an assertion, so the leg names its stubs: `startupFor` returns
     `{ok: true, banner: [], pluginVersion, pluginRoot, rungs: []}`; `liveAdapter` returns
     `{adapter: {getApiKeySource: () => null, getPauseLog: () => []}, cwd, tunables: null}`;
     `runDev`/`runQueue` return `{report: {outcome: "ran"}}`; `runQueueLoop` returns
     `{passes: [], outcome: "ran", stopReason: "bound-reached", exitCode: 0,
     loop: {iterations: 0, maxIterations: 2}}` (`:441-452`). None of this is fixture decoration
     — each field is read by a line the leg executes.

     **`process.exitCode` and `stderr` are per-process, so the leg restores them** (PM v8 Q-01).
     `emitReport`'s return is assigned to `process.exitCode` on every command path
     (`:393`/`:444`/`:459`), and a startup or usage refusal sets it to `1` and writes `USAGE` to
     `stderr`. Since §12.1 puts every engine-side leg in one file, that state outlives the test
     that produced it and would falsify the split task's inert-import assertions if they ran
     after it. The rule, stated once here rather than rediscovered: **each leg that calls
     `main()` captures `process.exitCode` and installs a `console.error` capture before the call
     and restores both in a `finally`** — the same discipline the inert-import test uses around
     its own `await import()` (below). Test *registration order* is then not load-bearing, which
     is the property worth having in a file two tasks in two batches write.

  Both exceptions are behaviour-visible only to a test, and both are priced in K-3 (§14.1) and
  owned by the wiring task (§12.4). The alternative shapes were weighed: exporting the bodies
  *without* the runner seam leaves the argument object unobservable, and a
  subprocess-plus-observable-artifact oracle (the pattern `cli.test.js:22` already uses) needs
  no change to `cli.mjs` but proves the `:434` loop hand-off only through a full `pdlc queue
  --loop` run in a throwaway repo — a fixture this feature does not otherwise need. The seam is
  the cheaper falsifier for the defect that started this thread.

- **`cli.mjs` gets no structural-oracle clause of its own; the import-based tests are the pin**
  (TE v6 Q-17). The three clauses below are scoped to `bin/pdlc.mjs`, where the hazard is
  *evaluation order on an old runtime*. `cli.mjs` has no such hazard, and a later edit that
  restored a bare `main()` call would break every process-entry test at once and loudly — the
  entry guard is pinned by the tests that depend on it, so no fourth clause is added.

- **But the pin must land in the split task's own batch, not one batch later** (TE v7 F-40).
  Both shape changes above ship in the split task (§12.4), while the process-entry leg lands
  with the *wiring* task in a later batch — so on the strength of the bullet above the split
  task would ship a behaviour change with no red test at all. It therefore carries its own
  two-assertion red test, small and permanent, in the same engine-side file the process-entry
  leg later extends (§12.1):

  1. **The import is inert, asserted positively.** Import `bin/cli.mjs` and assert
     `process.exitCode` is unchanged (`undefined`/`0`, captured before the import) and that
     nothing was written to `stderr` — specifically no `USAGE` text. "Nothing happened" stated
     as an absence would pass against a file that does not exist; these two are observations of
     a value and a captured stream. The import is a **dynamic `await import()`** inside the
     test, with the `process.exitCode` reading and the `console.error` capture installed
     immediately around it and restored in a `finally`, so the observation is of *this* import
     and not of whatever a neighbouring test in the same file left on the process (PM v8 Q-01;
     the same capture-and-restore rule the process-entry leg follows, exception 2 above). A
     module-level `import` would be hoisted out of the window it is supposed to be measured in.
  2. **`main` is exported and callable** — `typeof mod.main === "function"` — alongside the
     exported default `deps` object and its two pins from exception 2 above.

  Both assertions fail against HEAD's shape: HEAD has zero `^export` lines and ends in a bare
  `main().catch(…)` (`bin/pdlc.mjs:505`), so importing it today runs the CLI against the
  importer's `process.argv`, prints `USAGE` and sets `process.exitCode = 1`. The red is real,
  not a formality, and the split task's `[Fake first]` ordering has something to be first of.

**The container leg cannot falsify the hazard on its own, so it is paired with a structural
oracle.** AT-2.5's runner is Node 18 (below the `>=20` floor, see below), but Node 18 parses
every modern construct in `lib/` happily. A regressed implementation — the guard restored to the
top of a statically-importing `bin/pdlc.mjs` — would pass AT-2.5 on `node:18-alpine` with the
right message and the right exit code, while still emitting the stack trace AC-2.4 forbids on
the runtimes where it actually matters. The falsifier for the *structure* therefore runs in the
unit suite, in-process, needing no old runtime: parse `bin/pdlc.mjs`'s source and assert

1. it contains **zero** static `import` declarations,
2. its only non-comment top-level statements are the floor comparison, the refusal, and the
   single dynamic `import("./cli.mjs")`, and
3. its **non-comment** source contains **zero occurrences of the `await` keyword token** — not
   merely no *top-level* `await`. The qualifier is clause 2's own word, and it is load-bearing
   rather than shorthand: this same section requires a header comment stating the Node-12.17
   subset *and its reason*, and the reason **is** top-level `await` ("a Node 14.8+ parse-level
   feature", above). A scan over raw text would go red against the most faithful implementation
   of this section, pressuring the implementer to weaken the mandated comment (PM v5 F-01, TE
   v5 F-33). Comments are stripped before the scan; strings are not, and need not be — the file
   has three top-level statements and no string containing the token.

Clause 3 exists because clauses 1 and 2 count statements and imports, not syntax level: a guard
that satisfies both can still be unparseable on the runtime it promises to refuse on, and
nothing else in the test set can see that. AT-2.5's runner is `node:18-alpine`, which parses
top-level `await` happily, so the container leg is structurally blind to it.

**Clause 3 is deliberately narrower than "parses under an ES-2020 parser", because the engine
has no parser and this is not the feature that should add one** (TE v4 F-30). The engine ships
exactly one dependency (`@anthropic-ai/claude-agent-sdk`, `pdlc/engine/package.json:15-17`) and
runs on `node --test` — reached via the `test` script (`pdlc/engine/package.json:13`), which
runs `__tests__/_run-suite.mjs`, which spawns the `--test` runner itself
(`pdlc/engine/__tests__/_run-suite.mjs:50`); adding `acorn` as a `devDependency` to configure an
`ecmaVersion` would put a new dependency row into the very manifest §5.4's packed-set equality
and §5.1's dependency posture are under test in this same feature — a cost out of proportion to
the risk, and one that would have to be paid inside the packaging task. So the broader
"no construct outside the declared syntax subset" claim is **dropped from the oracle** rather
than left as an assertion the test author must invent a mechanism for. What replaces it:

- The **zero-`await`** form above is a plain source scan (a token match over the file's
  **non-comment** text, which contains no functions of its own beyond the `.then(…)` callback),
  needs no parser, and is *strictly stronger* than "no top-level `await`" — it cannot be
  satisfied by hiding an `await` inside the continuation. It is the exact falsifier for the
  regression that motivated this round: the promise chain silently rewritten back to
  `await import("./cli.mjs")`. Stripping comments needs no parser either, and the oracle must
  not acquire one here: drop `//`-to-end-of-line and `/* … */` spans from the text before
  matching. That filter is sufficient **because of clause 2** — the file is three top-level
  statements with no comment-like content inside a string — and the test states that
  dependency, so a later file that outgrows the assumption fails review rather than silently
  outrunning its own oracle.
- The Node-12.17 subset claim survives as a **documented constraint on the file, not a test**:
  a header comment in `bin/pdlc.mjs` states the subset and the reason, and the file is short
  enough (three top-level statements, clause 2) to read in full at review time. An unfalsifiable
  clause is worth less than an honest note about what is and is not mechanically checked.

With clause 3 in its narrowed form the one regression the container leg is blind to *is*
falsifiable in the unit suite, and the section makes no claim its own test set cannot back —
which is what its subject demands.

That goes red on exactly the regressions the container leg cannot see, and the legs together
cover the claim: the container proves the *refusal* works below the floor, the structural
oracle proves the *guard still runs first* and *carries no `await` anywhere in its executable
source*. It does **not** prove the file parses low enough to run at all — that broader claim was
dropped from the oracle above, and it lives only in the documented-constraint bullet, where the
revision deliberately put it (TE v5 F-34).

**AT-2.5 needs a named runner, and the PR gate is not one.** The gate is `node: ['20']` only
(`.github/workflows/pr-tests.yml:41`), so a below-floor runtime does not exist in CI. §12.1's
fixture-machine row is extended to name it: AT-2.5 runs in a **container image pinned to an
old Node major** (`node:18-alpine` — below the `>=20` floor, still trivially available),
invoked as a dedicated step in the fixture-machine leg. Without a named below-floor runtime,
AT-2.5 has nowhere to run and would be quietly skipped.

### 9.4 Non-interference and coexistence (AC-2.5, BR-2.6, C-4)

The engine install writes to the npm global prefix and `$PDLC_HOME`. The plugin install
writes under `~/.claude/`. The sets are disjoint, and AT-2.6 asserts it by hashing the
plugin's install tree before and after an engine install and upgrade, paired with the
positives: an engine run reaches dispatch **and** an interactive plugin session invokes a
skill, on the same run.

## 10. Types and protocols

Expressed as JSDoc typedefs and frozen catalogues, per §1's idiom note. Every seam below is
injectable, and every default is a named module constant so a composition-root oracle can
tell "needs no wiring" from "someone forgot to wire it" — the discipline already shipped for
`NO_PROBE` (`pdlc/workflows/orchestrate-dev.js:10655-10657`).

### 10.1 Service boundaries

| # | Protocol | Module | Default | Injected by |
|---|---|---|---|---|
| S-1 | `StoreReader` — `listVersions()`, `rootFor(version)` | `lib/store.mjs` | real `fs` over `$PDLC_HOME` | tests pass a fake listing; no temp dirs needed for resolution tests |
| S-2 | `ConfigReader` — `readEngineConfig({cwd})` → `{config, notices, engine}` where `engine` is §6.4's three-way `{state: "absent" \| "no-pin" \| "unreadable", …}` | `lib/run.mjs` (extended) | real `fs` at `ENGINE_CONFIG_PATH` (V-20) | tests pass a literal result object |
| S-3 | `Launcher` — `exec(binPath, argv, env)` → exit code | `bin/pdlc.mjs` | `spawnSync`, stdio inherited | tests assert the *descriptor* (path, argv, env) without spawning |
| S-4 | `UpdateProbe` — `latestPublished()` → `{version}` \| `{unavailable, reason}` | `lib/store.mjs` | **`NO_PROBE`-shaped inert default: never called unless injected** | AC-5.1's offline test needs no network and no stub-of-a-network |
| S-5 | `PublishChannel` — `exists(name, version)`, `publish(tarball, opts)` | publish job | real `npm` | CI passes the stub for every test; the real one runs only in the tagged job |
| S-6 | `_provenance` — frozen `Provenance` (§7.1) | workflow modules | `NO_PROVENANCE` | **`devInjection` (`run.mjs:80-91`) and `queueInjection` (`:114-123`)** — the two frozen seam objects the engine constructs at `runDev:392` / `runQueue:450-453`, and the only carriers a production run has (§7.2's production-carrier table). Named, not "the engine", because both key sets are pinned by `PROP-PARITY-12`. Upstream of them, the value reaches `runDev`/`runQueueLoop`/`runQueue` from `bin/cli.mjs`'s three command bodies (`bin/pdlc.mjs:385`, `:434`, `:457`) — the seam is only as wired as its least-wired call site |

**S-2's shape is the shipped function's, extended — not a new one.** The earlier draft declared
`readEngineConfig(cwd) → {version?} | null`, but the shipped signature is
`readEngineConfig({cwd}) → {config, notices}` (`pdlc/engine/lib/run.mjs:178`, verified at HEAD):
a positional argument where the real one takes an options object, and a `null` return where the
real one returns a record. A double built to the draft's shape would not drop into the
production composition root, so the ladder tests could be green against a fake no production
path could ever hand them. The signature above is the shipped one plus the `engine` discriminant
§6.4 requires, and the `notices` channel is **kept** rather than replaced — `null` collapsed
"absent" and "unreadable" into one value, which is precisely the distinction the corrupt-config
branch turns on.

**S-4 is the one that deserves attention.** AC-5.1 requires the "a newer version exists"
probe to be *absent-by-default*, not merely stubbable: an unconditional network call in the
run path would make every offline run slower and would put NG-3's boundary one bug away
from being crossed. Defaulting it to inert means the offline behaviour is the *shipped*
behaviour, and the probe is opt-in — the same reasoning the probe seams in
`orchestrate-dev.js` already embody ("a probe is an optimisation, never a correctness
dependency").

**Inert must not mean silent, and the earlier draft left that unsaid.** FSPEC Q-4 makes the
update notice an output of **every** run: "a newer version is available, **or** could not
check". If the shipped inert path emitted nothing, the visibility half of AC-5.1 would be
present only in tests and absent from every real operator run — the exact inverse of the
intent. So the inert default is **not** a no-op at the output boundary:

- `NO_PROBE` returns `{unavailable: true, reason: "no update probe is configured"}`.
- The run **states** it, via the `E-12` catalogue entry ("could not check for a newer
  version — …"), on every run, in the same block as the version announcement of §6.3.
- Nothing is fetched, nothing blocks, and the exit code is unaffected (§11's E-12 row).

This satisfies Q-4's disjunction with its second arm rather than by silence, and it keeps the
"absence as visible as presence" discipline that AC-5.2 asks of the pin announcement. The
distinction worth holding onto: the probe is inert **by default**, but the *statement about the
probe* is unconditional.

### 10.2 Key data types

```js
/** @typedef {{major:number, minor:number, patch:number, raw:string}} Version */

/**
 * @typedef {object} ResolutionDecision       // §6.3, total over seven branches
 * @property {"dev"|"pin"|"latest"|"refuse"} kind
 * @property {string|null} version            // resolved version, null on refuse
 * @property {string|null} root               // install root to exec, null on refuse/dev-in-place
 * @property {string} announcement            // Q-3; never empty, never omitted
 * @property {string|null} refusal            // catalogue id + rendered text on refuse
 */

/**
 * @typedef {object} PairingRecord            // O-6, written once by the publish job
 * @property {string} engineVersion
 * @property {string} pluginCompat
 * @property {string} pluginVersionAtTag
 * @property {string} tag
 * @property {string} commit
 */

/**
 * @typedef {object} VendorManifest           // §5.2, inside the tarball
 * @property {string} builtForEngineVersion
 * @property {Array<{source:string, packed:string, sha256:string}>} modules
 */
```

### 10.3 Message catalogue

Every operator-facing string this feature adds is registered in `lib/catalogue.mjs`, which
already carries a suite-wide set-equality in both directions — an emitted message with no
registered id fails, and a registered id no path emits fails
(`pdlc/engine/lib/catalogue.mjs`, `__tests__/catalogue.test.js:15-77`,
`__tests__/assert-suite-wide.test.js:145,163`). New ids:

`store.empty`, `version.pin-missing`, `version.pin-malformed`, `version.dev-incomplete`,
`version.announce-pin`, `version.announce-latest`, `version.announce-dev`,
`env.plugin-root-ignored`, `node.below-floor`, `modules.not-found`, plus two the earlier
draft's list was missing: `config.unreadable` (§6.4's branch-0 refusal) and
`update.unavailable` (FSPEC Q-4 / E-12's "could not check for a newer version", now an
unconditional output per §10.1's S-4 commentary).

Registering them buys the coverage for free rather than writing twelve bespoke text
assertions — the reuse-over-reinvention call this repo's DC-08 asks for. Two constraints come
with that reuse, and both are dispatcher-visible rather than stylistic:

- **Registration is scheduled with its emitter, never ahead of it.** The suite-wide equality
  runs in **both** directions over emitted ids versus `messageIds()`
  (`pdlc/engine/__tests__/_assert-suite-wide.mjs:195-205`), and the reverse half is real: a
  registered id that no path emits fails the step (`__tests__/assert-suite-wide.test.js:183`).
  Registering all twelve ids up front — the natural reading of §12.4's `[Fake first]` ordering —
  would therefore turn the **whole suite** red until the last emitter landed. The PLAN pairs
  each id with the task that emits it, in the same batch. `[Fake first]` still governs the
  *doubles*; it does not govern catalogue registration, and §12.4 says so.
- **Registration proves emission, never rendered content.** The equality is over ids. It cannot
  see whether the parameters were populated, so a message rendered from an empty template
  passes it. Three criteria need more than that and get their own text assertions on the
  **rendered** string: AC-5.5 (names the pinned version *and* what is installed), E-10 (names
  the offending value), AC-2.4 (names the floor *and* the found version). Each asserts the
  substituted values appear, so an unpopulated template goes red.

## 11. Error handling

One rule governs the table: **every failure exits non-zero, names the offending value and
the remedy, and writes nothing into the consumer project.** A stack trace reaching the
operator is a defect (AC-2.4), and so is a partial run.

| Scenario | FSPEC | Handling | Exit |
|---|---|---|---|
| Node below floor | E-06 | §9.3's dependency-free guard entry; message names floor and found version | non-zero |
| Store empty / missing | new (ladder 7) | Names the store root and the documented install command | non-zero |
| Config file present but unparseable | new (ladder 0) | Names the file path and the parse error. Never read as "no pin" — **and this holds whether or not a pin was ever declared**, because an unparseable file cannot say (§6.4). A run that degraded with a notice at HEAD refuses here; that is the branch's cost, stated | non-zero |
| `--version` / `doctor` with no resolvable version | AC-1.4, AC-1.1 | **Not an error.** The launcher reports its own triple with `mode: unresolved`, carries the refusing branch's text as a notice, and `doctor` adds the store root, the enumerated versions and the install command (§6.2) | 0 |
| `--version` / `doctor` **with** a resolvable version | AC-1.4 | **Not an error, and not the launcher's own triple.** Both resolve for reporting and report the **resolved** engine's triple with its `mode`/`pin`, which is what makes AC-1.4's "same triple the run report carries" hold under a pin (§6.2). Neither ever `exec`s a child | 0 |
| Pinned version not installed | E-08 | Names the pin **and** the enumerated installed versions. Never falls back | non-zero |
| `engine.version` malformed | E-10 | Names the offending value. Never read as "no pin" | non-zero |
| Config file absent / no `engine` section | E-11 | **Not an error.** Announced as "no pin", nothing created | 0 |
| `--dev` with a failing conjunct | new (ladder 2) | Names which conjunct failed. Never downgrades to pin or latest | non-zero |
| `PDLC_PLUGIN_ROOT` set, no `--dev` | E-13 | **Not an error.** Ignored with notice, released version runs (§6.5) | 0 |
| Workflow modules found at neither root | E-22 runtime analogue | Refuses at startup naming both paths tried; never dispatches module-less | non-zero |
| No plugin / out-of-range / unreadable plugin | E-01…E-03 | Unchanged — already shipped and distinct (V-09, V-10) | non-zero |
| Engine version unresolvable | E-05 | Refuses naming a corrupt install; never reports "unknown" and proceeds | non-zero |
| Update probe unavailable | E-12 | States it could not check and **proceeds**. Never fails, never blocks, never fetches | 0 |
| Any publish precondition fails | E-14…E-16, E-28 | Job fails naming the offending value; nothing published. Never skipped, never green-but-inert | job failure |
| Publish credential missing/empty | E-18 | Fails at the publish step naming the missing secret; no partial publish; no credential value in any log | job failure |
| Re-publish of an existing version | E-17 | Loud failure naming the collision; stored bytes unchanged; output names the version | job failure |

**The refusal path writes nothing.** BR-1.1's all-or-nothing property extends unchanged to
every new refusal above: version resolution happens in the launcher, before the resolved
engine is even executed, so a refusal cannot have started a dispatch, read a prompt, or
touched the consumer tree. The two exempt commands of §6.2 (`--version`, `doctor`) are not a
hole in this: they resolve nothing, execute no child, and also write nothing — they are the
one path that *reports* rather than refuses, which is what AC-1.1 asks for.

## 12. Test strategy

### 12.1 Levels and what is tested where

| Level | Runs | Covers |
|---|---|---|
| Unit, in-process | `pdlc/engine/__tests__/`, the shipped `node --test` suite | Resolution ladder, store enumeration, provenance rendering, catalogue closure, config read discipline, handshake/env-var branch, and **AC-5.6's path-level notice oracle** over `resolvePluginRoot`'s four rows — emission by catalogue id plus rendered text on the ignore branch, absence on the other three (§6.5; the shipped catalogue equalities do not cover this row). All pure over injected seams — no temp dirs, no network, no spawn |
| Arrangement / oracle | same suite | FSPEC §5.1's two set-equalities over fixture YAML, §5.4's packed-set equality over a **real `npm pack` into a temp dir** (PF-4), the `publish.yml`/`pr-tests.yml` command equality, AF-1…AF-3, §9.3's **guard-entry structural oracle** (three clauses: zero static imports, declared top-level statements only, and **zero occurrences of the `await` token in the file's non-comment source** — a parser-free scan over the text with `//` and `/* … */` spans dropped, so the mandated header comment cannot turn the oracle red, §9.3), the **seam-set equality** `PROP-PARITY-12` extended with `_provenance` on both rows (its expected constants at `__tests__/seam-contract.test.js:47-63`; the leak case at `:79-90` is an exclusion list and is **unchanged**, and `PROP-PARITY-15` at `:268-282` reads the same constant and turns green with it), and §7.2's **commit-site set-equality** over both workflow modules' sources (expected: the five enclosing named functions, unconditionally) |
| Module-side | `pdlc/workflows/__tests__/` | `_provenance` inertness and the four placements — **kinds 1 and 2 against `orchestrate-dev.js`; kinds 3 and 4 across both modules**, same suite, two module targets. The split is stated that way because two of kind 4's five helpers are queue-module members (C-c `commitQueueRow`, `orchestrate-queue.js:1598`, and C-d `commitAdvisoryRecord`, `:1637`), and an "orchestrate-dev only" reading of kind 4 would let a task author skip C-d — whose route (the queue module's new `_provenance` seam) is the newest of the five (PM v4 F-03). Kind 3 asserts the mark lands **inside `rewriteStatus`**, so a call through **each** of its five routes carries it (R-1…R-5, §7.2), and covers **both** `updateQueueStatus` row-write paths — the `evidence == null` quick path and `writeEvidenceCarryingRow` — plus the `ensureEngineColumn` round trip **asserting the header literal** (§7.2). The round trip covers the **two-migration** case explicitly (TE Q-14): a table lacking **both** the `Evidence` and `Engine` columns, written once through `writeEvidenceCarryingRow` (`orchestrate-queue.js:491`), which re-locates the row in the table `ensureEvidenceColumn` has already migrated — the interaction where a column-index off-by-one would live, and which neither one-column-at-a-time case reaches. Kind 4 asserts each of the five helpers composes `line`, including C-e, whose test also pins that A5 still stages nothing of its own and keeps its `advisory(A5):` message prefix |
| Production-path (composition root) | `pdlc/engine/__tests__/`, the `node --test` suite | The hop the module-side level cannot see: that a real `Provenance` **arrives** through the engine's own injections. No test runs under **both runners** — jest owns `pdlc/workflows/__tests__/`, `node --test` owns `pdlc/engine/__tests__/` — so this leg lives entirely on the engine side (TE Q-13). An engine-side test may still import a real workflow module, and one already does: `PROP-PARITY-10` imports `orchestrate-dev.js` directly (`__tests__/seam-contract.test.js:299`) and is green, so a real-module import is the sanctioned precedent, not a forbidden one, wherever it gives a stronger leg than a fake (PM v5 F-03). It uses the **shipped** `importWorkflow` seam (`run.mjs:387`, `:427`) to substitute a recording module whose `main()` captures its argument object, then drives `runDev`, `runQueue` and — for the per-pass claim — the real `runQueueLoop({maxPasses: 2, …})` with a populated `Provenance`, and asserts the captured object carries it — **the frozen value itself, asserted by identity and `Object.isFrozen`, not a structurally-equal copy** (TE v5 Q-16), the loop case comparing **both** captured seam objects — key `_provenance`, §7.2's per-leg table — against the one frozen value, after two assertions that the premise holds: `captured.length === 2` and the returned `stopReason === "bound-reached"`, so a recording module whose return shape later changes goes red at the premise instead of passing vacuously (the recording module's `main()` returns `{outcome: "ran"}` so two passes actually run, `run.mjs:486-509`, `:317`; §7.2, TE v7 F-39/Q-19, TE v8 F-44), since the carriers spread the *seam object* and must never rebuild the provenance inside it (§7.1) — plus the delegated leg, that `runQueue`'s `_runPipeline` wrapper (`:450-451`) hands the same value to the dev module. **And one leg above the injections**, closing the chain at process entry (TE v5 F-32), **with its mechanism named rather than left to the implementer** (PM v6 F-01, TE v6 F-36): it imports `cli.mjs` — inert on import because §9.3's entry guard replaces HEAD's bare `main()` call (`bin/pdlc.mjs:505`) — calls the exported `main(argv, deps)` once per command with a **process-argv-shaped** array (`["node", "pdlc", "queue", "--loop", "--max-iterations", "2"]`, where `--loop` selects the `runQueueLoop` call site and the bound is only recorded, not executed, §9.3; `argv` defaults to `process.argv` and keeps HEAD's `const [, , cmd, ...rest]` two-element skip, `bin/pdlc.mjs:479`, §9.3), and passes **recorders for all five members** of the default-valued `deps` seam — the three runners *and* the two gates, `startupFor` and `liveAdapter` (§9.3, §3.1) — since the HEAD bindings are static imports (`bin/pdlc.mjs:30`) and `node:test`'s `mock.module` is unavailable on the runtimes the declared floor admits. **The two gate recorders are what make the leg deterministic** (TE v8 F-43, PM v8 F-02): at HEAD no runner is reachable until `startupFor(argv)` passes (`bin/pdlc.mjs:397`, `:362`, with `!startup.ok` returning at `:407`/`:373`) and `liveAdapter(argv, startup)` has built a real transport (`:279-298`, `:382`, `:417`), so a three-key seam would leave the leg's outcome to the machine's `process.cwd()`, `PATH`, plugin tree and `ANTHROPIC_API_KEY` — and an env-driven refusal produces an *empty* `captured`, on which every loop-shaped assertion passes. Each recorder's return shape is named in §9.3, because the command body keeps running past the call and into `emitReport`. **So the leg asserts its capture counts positively and first**: each of the three runner recorders was called **exactly once** on the command that should reach it (`captured.length === 1`) and **zero times** on the commands that should not, before anything is asserted about the captured objects. It then asserts each of `runDev` (`bin/pdlc.mjs:385`), `runQueueLoop` (`:434`) and `runQueue` (`:457`) receives a `provenance` argument — the runner-argument key, spelled `provenance`, not the injections' `_provenance` (§7.2's per-leg table, PM v8 F-01) — line numbers are HEAD's; after E-4b these sites live in `cli.mjs` (§7.2) — and, in the same leg, that the **exported default `deps` object** has exactly the five keys `{runDev, runQueue, runQueueLoop, startupFor, liveAdapter}`, with the three runner values `===` `run.mjs`'s correspondingly-named exports (`run.mjs:381`, `:422`, `:478`) and the two gate values `===` `cli.mjs`'s own exports of those names — the only place anything observes that the shipped defaults reach the real runners and the real gates (§9.3, TE v7 F-41, TE v8 F-43). **What this leg does *not* assert is the per-pass identity claim**: its recorder is called once, so `captured` holds one entry and a per-pass comparison would be trivially true (TE v7 F-39). That claim sits one level down, on the injection-level leg above, which drives the **real** `runQueueLoop({maxPasses: 2, …})` over the recording workflow module and compares the two captured seam objects by identity (§7.2, TE v6 Q-18). Without the `:434` leg a `pdlc queue --loop` run emits `NO_PROVENANCE` with the whole suite green. Red if either injection *or* any of the three call sites forgets the key; the seam-set equality above is red if a key is added without editing its constants. **All of this level's engine-side legs live in one named file, `pdlc/engine/__tests__/provenance-path.test.js`** (TE v7 Q-20): the split task creates it with §9.3's inert-import and exported-`main`/`deps` assertions, and the wiring task extends the same file with the process-entry and injection-level legs one batch later. Naming the file here removes the PLAN author's choice and keeps the file-ownership manifest's rows unambiguous — one owner per batch, two batches, one path. **One file stays the answer even though the two legs' setups differ** (TE v8 Q-22): the process-entry leg builds five `deps` recorders and the injection-level leg builds an `_agent`-carrying adapter stub plus an `importWorkflow` substitute, and neither shares fixture code with the other — but they assert two halves of one claim (the value is put into the argument object, and the value survives into the seam object), and splitting them puts a third path into the file-ownership manifest for no mechanical gain. What the asymmetry does buy is the process-state discipline §9.3 states: because both legs and the split task's inert-import test share a process, each `main()` call captures and restores `process.exitCode` and `stderr`, so registration order is not load-bearing |
| Fixture-machine | CI job, container | Install/upgrade legs, `npm pack` into a temp prefix with `PATH` scoped to it; the launcher pass-through spawn test (§6.2), including its **signalled-child leg** asserting the launcher's exit status equals `128 + signum` exactly (DEC-EDIST-06, §6.2); **AT-2.5 on a below-floor image (`node:18-alpine`)**, since the PR gate is `node: ['20']` only — paired with the structural oracle above, which is what makes AT-2.5 non-vacuous (§9.3) |
| One-time manual | recorded, dated | Real-channel publish (BR-3.9), AT-6.2's channel observation (Q-2) |

### 12.2 Test doubles

| Double | Replaces | Why not the real thing |
|---|---|---|
| Literal store listing | S-1 | The ladder is pure; filesystem fixtures would test `fs`, not the decision |
| Literal config object | S-2 | Same. E-11's "file absent" is `null`, one value, not a temp tree |
| Launcher descriptor recorder | S-3 | Asserting the exec *descriptor* (path, argv, env) proves resolution without spawning a second Node |
| Inert probe (default) + failing probe + succeeding probe | S-4 | AC-5.1 needs offline behaviour, and offline is the default, not a stub |
| Stub channel holding versioned bytes | S-5 | AT-3.3's byte-identity across a re-run cannot be rehearsed against npm without burning a version irreversibly |
| Fixture YAML copies | live `pr-tests.yml` | BR-7.6: mutations must not be applied to the file that gates the PR making them |
| `NO_PROVENANCE` and a populated `Provenance` | S-6 | Proves P-1's byte-identical inert path and all four placements from the same test file |
| Runner recorders (`{runDev, runQueue, runQueueLoop}` capturing their argument objects), passed through `cli.mjs`'s `deps` seam | the real `run.mjs` runners, at the process-entry leg only | Driving the real runners would dispatch; the leg's whole question is *what the command body put in the argument object*, which only the caller's own seam can observe (§9.3, §12.1) |
| Gate stubs (`startupFor` → `{ok: true, banner: [], pluginVersion, pluginRoot, rungs: []}`; `liveAdapter` → an adapter with `getApiKeySource`/`getPauseLog`), same `deps` seam | the real startup ladder (`lib/startup.mjs:319`) and the live SDK transport (`bin/pdlc.mjs:279-298`), at the process-entry leg only | Both stand *before* every runner (`:397`/`:362`), so with the real ones the leg's outcome is decided by `process.cwd()`, `PATH`, the plugin tree and `ANTHROPIC_API_KEY` — and a refusal returns early with an empty capture, on which the leg's assertions pass vacuously (TE v8 F-43). The real ladder and adapter keep their coverage in the shipped subprocess tests (`__tests__/cli.test.js:86`, `:102`, `:114`) |

### 12.3 The four oracles that must not be satisfiable by absence

The FSPEC is explicit that absence-only oracles pass vacuously, and four here need
deliberate positive pairing:

1. **Packed-set equality (AC-1.3).** Member-for-member in both directions, with the
   expected side a **literal list** (§5.4), never derived from listing `pdlc/engine/lib/`.
   A derived expectation passes when a module is deleted, which is the defect the AC exists
   to catch. Falsifiers: an added `SKILL.md`, an added test file, a removed named module.
2. **Dev-mode kind equality (AC-5.3, §5.3).** Equality is over the kinds a run **actually
   produced** (BR-9.2), and each kind is paired with a positive: the halted, queue-driven
   fixture produces all four; the green single-feature fixture produces two, and an unmarked
   kind in either fails. **Kind 3 has a positive on a green path, not only on a halted one**
   (PM Q-01): a green *queue-driven* run rewrites two rows — `in-progress` (R-3) and
   `awaiting-merge` (R-5) — and both must carry the `Engine` cell and the marked commit
   message. This is the case that made marking at the call sites wrong, so it is asserted
   rather than inferred; the green *direct* run's only rewrite is Phase MERGE's, which takes
   `updateQueueStatus`'s evidence-carrying path and is the second row-write path §12.1 names.
   **That leg has a fixture precondition, and without it the leg asserts nothing** (TE v4 F-29,
   PM v4 Q-02): Phase MERGE returns `skipped` before it ever reaches its
   `{feature, status: "done", evidence}` row write (`orchestrate-dev.js:1753`) whenever
   `mergeMode === "off"` (`decideMerge`'s guard 1, `:1064-1070`), which is the **shipped
   default** (`MERGE_DEFAULTS.mergeMode: "off"`, `:61`). A green direct fixture on default
   config therefore produces **no kind 3 at all**, and since equality is over the kinds a run
   actually produced (BR-9.2), the leg would pass while asserting nothing — and
   `writeEvidenceCarryingRow` (`orchestrate-queue.js:491`), the second row-write path §12.1
   promises to cover, would never be entered. So the green-direct fixture **sets
   `mergeMode: "on"` in its `.claude/pdlc.config.json`**, and the leg additionally asserts the
   produced-kind set is **non-empty** and contains kind 3 — an emptiness guard, so the fixture
   cannot go quiet if the default or the guard ladder changes under it.
   **The fixture's remaining preconditions are enumerated here, not derived from `decideMerge`
   at task-writing time** (PM v5 Q-02, PM v6 F-02) — an expectation read off the code under test
   is not an expectation. Beyond `mergeMode: "on"`, reaching the row-1 act path and the `{feature,
   status: "done", evidence}` write needs, in the ladder's own order: a **`prUrl`** from Phase PUB
   (guard 2, `orchestrate-dev.js:1076`); an **O1** that is `ok` with `state: "OPEN"`,
   `mergeable: "MERGEABLE"` and a non-`DIRTY`/`BLOCKED` `mergeStateStatus` (guards 4, 12, 14, 15,
   `:1092`, `:1184-1226`); an **O5** changed-file list that retrieves and matches no guard path
   (guards 7–8, `:1128-1150`); **O2** CI evidence satisfying `ciRule` under `mergeRequiresCi`
   (guard 11, `:1169`); an **O3** that is `ok` with **`unresolved: 0`** (guards 17–18,
   `:1232-1255` — the case PM v5 Q-02 asked about; `:1152-1175`, cited in v0.7, is the
   CLOSED-PR/CI-rule span and was a transcription slip, PM v7 F-01 / TE v7 F-42); and an **O4**
   that is `ok` and yields at least one permitted merge method (guards 19–21, `:1256-1284`). Any one of these left at its
   empty/`null` default resolves the ladder earlier and produces no kind 3, which is what the
   non-empty guard above catches — but catching it in CI is worse than writing it down here.
   **One leg reaches the module through the engine, not through a hand-built parameter object**
   (TE v4 F-28): the production-path level of §12.1 drives `runDev`/`runQueue` with a populated
   `Provenance` and asserts the seam object the module actually receives carries it. Every other
   leg here injects into `main()` directly and is green whether or not `devInjection` /
   `queueInjection` carry the key, so without this one the whole oracle is satisfiable by a
   build that emits `NO_PROVENANCE` in production. **The same leg starts at process entry, not
   at `run*()`** (TE v5 F-32): it calls `cli.mjs`'s exported `main(argv, deps)` with recorders
   in `deps` for the three runners **and for the `startupFor`/`liveAdapter` gates that stand
   before them** (the mechanism is §9.3's entry guard plus the five-member seam, spelled out in
   §12.1), asserts each runner recorder's call count before its contents, and asserts all of
   `runDev` (`bin/pdlc.mjs:385`), `runQueueLoop` (`:434`) and
   `runQueue` (`:457`) are handed provenance. The loop site is the one a green suite would otherwise hide — `runQueueLoop`
   forwards `...args` (`run.mjs:478`, `:491`), so it carries provenance only if `cli.mjs` put
   it in the object, and `pdlc queue --loop` is a shipped mode.
   Cross-review and `CODE_REVIEW-*` file **contents** are asserted
   **unmarked** (BR-9.3), while the harness commit that lands an anchor append (§7.2's C-b)
   carries the mark in its **message** — the two halves are asserted separately, because they
   are the two sets BR-9.3 distinguishes and conflating them is how one of them goes untested.
3. **Install non-interference (AC-2.3, AC-2.5).** Hashing "nothing changed" is vacuous if
   nothing ran. Paired per leg with §9.2's positives — install: CLI resolves on `PATH` at
   the expected version from an existing location; upgrade: resolved version **and**
   resolved store entry (§9.2's named observable, *not* the launcher's `PATH` location)
   differ from pre-recorded values.
4. **Vendor-manifest hash equality (AF-2, §5.3).** True over the empty set in any ordinary
   checkout, where `vendor/` does not exist. Paired with the positive precondition that makes
   it non-vacuous: run `prepack` into a temp dir, assert the manifest enumerates **exactly**
   the two modules, and carry a one-byte mutation falsifier in the same test.

### 12.4 TDD order

`[Fake first]` throughout: every seam in §10.1 gets its double before the production module
that consumes it, and every implementation task depends on a red-test task naming the same
test file. Six sequencing constraints the PLAN must honour (the count grew with the rounds; it
is stated so a dropped bullet is visible):

- §5.3's oracle restatement (AF-1…AF-3) lands **in the same task** as the vendoring change.
  Vendoring first turns V-05 red for a real reason; restating first removes a guard while
  nothing replaces it. Neither ordering is acceptable, so they are one task.
- §8.5's `uses:`-unexpandable rule and the `publish.yml`/`pr-tests.yml` command equality land
  **before** `publish.yml` itself, so the arrangement gate exists before the arrangement it
  governs. (The earlier draft sequenced a *gate extraction* here; §8.2 no longer performs one,
  and the constraint that replaces it is this.)
- `_provenance`'s inertness test (P-1) lands **before** any placement, so byte-identity of
  the disabled path is proven before the enabled path exists.
- **The injection change and `PROP-PARITY-12`'s constants are one task, never two.**
  `devInjection`'s 8th key and `queueInjection`'s 6th (§7.2's production-carrier table) are
  pinned by a no-more-no-less equality whose expected constants sit in a different file
  (`pdlc/engine/__tests__/seam-contract.test.js:47-63`). That constant is the **only** required
  edit in the test file: the leak case at `:79-90` is an exclusion list and stays as it is
  (`_provenance` is on both rows, so it belongs in neither exclusion), and `PROP-PARITY-15`
  (`:268-282`), the third reader of the constant, turns green on the `:47-63` edit alone so
  long as `_provenance` is not added to `UNOVERRIDDEN_IO_SEAMS` (`:223-238`). Wiring without
  the constant edit turns a shipped green test red; editing the constant first turns it red the
  other way. Both files are therefore owned by a single PLAN task, and the file-ownership
  manifest lists `lib/run.mjs` and `seam-contract.test.js` under it. **`bin/cli.mjs` joins that
  task**, since its three `run*()` call sites (§7.2) are the other half of the same wiring, and
  the production-path leg (§12.1) — which asserts both halves happened at all — lands with
  them.
- **`bin/cli.mjs` is created by the E-4b split task and edited by the wiring task, in that
  order, in different batches** (TE v6 F-37). Two work items touch the path — §9.3/PK-4b
  *creates* it by moving the HEAD body, and the wiring task above *edits* its three call sites
  — and the file-ownership manifest admits exactly one owner per file per batch. So: the split
  task owns `bin/pdlc.mjs` and `bin/cli.mjs` and lands first (it also introduces the entry guard
  and the `deps` seam, §9.3); the wiring task **depends on** it, owns `bin/cli.mjs` in a later
  batch, and the process-entry leg of §12.1 lands with the wiring task — it can neither import
  nor spawn `cli.mjs` before the split exists. A PLAN that lists the path under both tasks in
  one batch is rejected by the manifest, which is the point of stating the edge here.
  **The split task is red-first on its own behaviour change** (TE v7 F-40): it also creates
  `pdlc/engine/__tests__/provenance-path.test.js` with §9.3's two assertions — the import is
  inert (`process.exitCode` unchanged, no `USAGE` on `stderr`, measured around a dynamic
  `await import()` with both restored afterwards, PM v8 Q-01) and `main` plus the default
  five-key `deps` object are exported and pinned — the gate keys `startupFor`/`liveAdapter`
  included, since the split task is what introduces them (§9.3, TE v8 F-43) — both of which are
  red against HEAD's bare
  `main().catch(…)` (`bin/pdlc.mjs:505`) and zero exports. Without them the split task would
  ship the entry guard and the `deps` seam with no test until the next batch. The wiring task
  then **extends the same file** with the process-entry and injection-level legs; the manifest
  lists that path under the split task in its batch and under the wiring task in the later one,
  which is one owner per batch and legal.
- **Catalogue ids are registered with their emitters, never before them** (§10.3). The
  suite-wide equality's reverse direction fails on a registered-but-unemitted id, so a
  fake-first reading that registers all twelve up front turns the whole suite red. This is the
  one place `[Fake first]` does **not** apply, and the PLAN pairs each id with its emitting
  task in the same batch.

## 13. Requirements traceability

Every acceptance criterion in REQ §5 maps to at least one component here. A criterion with
no row is a defect in this table.

| AC | Component | Section |
|---|---|---|
| AC-1.1 | `handshake.checkCompat` (shipped, V-09) + launcher refusal path | §11 |
| AC-1.2 | `skills.loadSkill` at dispatch time; `files` allow-list ships no skills | §5.4 |
| AC-1.3 | `files` allow-list; PF-4's real-`npm pack` equality against §5.4's literal expected set | §5.4, §8.3 |
| AC-1.4 | `runStartupChecks.versions` (shipped, V-08) surfaced by `pdlc --version`/`doctor`, which **resolve for reporting** but never refuse: the resolved engine's triple when resolution succeeds (so it equals the run report's under a pin), the launcher's own with `mode: unresolved` when it does not | §6.2, §11 |
| AC-1.5 | `PairingRecord` in the packed manifest, single writer | §8.4 |
| AC-2.1 | README section; launcher on `PATH`; handshake reached | §9.1, §9.2 |
| AC-2.2 | Store + launcher: upgrade changes the resolved version machine-wide | §9.2 |
| AC-2.3 | Store is outside every consumer repo; per-leg positives over `{resolvedVersion, resolvedStoreEntry}` | §9.2, §12.3 |
| AC-2.4 | `engines.node` + dependency-free guard entry that dynamic-imports the rest; rendered-text assertion names floor and found version | §9.3, §10.3 |
| AC-2.5 | Disjoint install locations | §9.4 |
| AC-3.1 | `publish.yml` gate → preflight → publish | §8.1 |
| AC-3.2 | No `continue-on-error`, no conditional jobs | §8.1 |
| AC-3.3 | `PublishChannel.exists` → loud failure; byte-identity over the stub | §8.4 |
| AC-3.4 | `ci-arrangement.test.js`'s set-equalities, per-job matrix expansion, and the `uses:`-unexpandable rule | §8.5 |
| AC-3.5 | Secret consumed only by the publish step; sentinel scan + two positives | §8.4 |
| AC-3.6 | PF-1 | §8.3 |
| AC-3.7 | PF-2, via the runtime's own `satisfiesRange` | §8.3 |
| AC-4.1 | `Provenance` in the run report, success and halt paths | §7.1, §7.2 |
| AC-4.2 | `_provenance` kind 2, script-owned append after `_checkFile` | §7.2 |
| AC-4.3 | Distinct `engineVersion` in committed artifacts | §7.2 |
| AC-4.4 | Single resolution (V-08) read by every emitter; change-check test | §7.1, §12.2 |
| AC-4.5 | `artifactPaths` ships but is `converge()`-only (V-14 corrected); five missing classes added, including the anchor-appended `CROSS-REVIEW-*` (class 11 — **work this feature builds**, via `appendApprovalAnchors` returning its appended paths and three call sites pushing them), + literal set-equality | §7.4 |
| AC-5.1 | Ladder branch 3 + inert-by-default `UpdateProbe` | §6.3, §10.1 |
| AC-5.2 | Ladder branch 6's announcement | §6.3 |
| AC-5.3 | `Provenance.line`/`block` in exactly four kinds; kind 4 composed inside a **closed set of five commit helpers** (C-a…C-e, including the A5 seam) with an unconditional source-level set-equality guarding it; kind 3 marked **inside `rewriteStatus`** so all five of its call routes inherit it, landing in an `Engine` cell written on both `updateQueueStatus` paths; kind-4 scope read via BR-9.3's harness/agent distinction, with the erratum reduced to a wording confirmation; the production carrier named — `devInjection`/`queueInjection` (`run.mjs:80-91`, `:114-123`) each gain a `_provenance` key with `PROP-PARITY-12`'s constants edited in the same task, asserted by §12.1's production-path leg | §3.1, §7.2, §12.1, §12.3 |
| AC-5.4 | `--dev` required; `location.isCheckout` is a *conjunct* of branch 1, never sufficient on its own, so a checkout with no declaration runs the released version | §6.3 |
| AC-5.5 | Ladder branch 4, enumerating installed versions | §6.3 |
| AC-5.6 | D-4's ignore-with-notice branch | §6.5 |
| AC-6.1 | Nothing here touches `build-runtime.mjs`, the bundles or the sync scripts | §3.1, §14 |
| AC-6.2 | Engine half closed via `loadRoot`; bundle half **open**, limit documented in AT-6.2's recorded evidence (it is `[manual]`) | §7.3, §14 |

## 14. Costs, risks, and what is deliberately not closed here

### 14.1 The expensive parts, named

| # | Cost | Why it is the price of the requirement, not gold-plating |
|---|---|---|
| K-1 | **Re-running the gate at the tagged commit (§8.2)** costs a duplicated copy of five job bodies in `publish.yml`, kept in step by a command set-equality. The reusable-workflow extraction that would have avoided the duplication is rejected: it renames the rendered checks a live consumer pipeline polls, and does so invisibly to the oracle offered against it | C-6 requires publishing to be gated on the same evidence a PR is. Re-running the gate is the requirement; duplication is the way that cannot rename a consumer's checks. The YAML-drift cost is paid by a test, not by care |
| K-2 | **The version store (§6.1)** is real new infrastructure — enumeration, a store root, a launcher `exec` hop — where "one global install" would have been a day's work | AC-5.1 and AC-5.5 are jointly unsatisfiable without side-by-side residency (§4.2). The store is the criteria, not an ambition |
| K-3 | **Touching the workflow modules at all** (§7.2) is a change to the file this repo is most careful about, and it must stay loadable in the Claude Code workflow runtime | AC-4.2 is unsatisfiable otherwise (V-16, V-17). Bounded, but **not as small as the earlier draft priced it, and repriced again this round**: one default-inert `main()` parameter **in each module** (`orchestrate-queue.js` has no `_provenance` seam at HEAD and gains one for C-d), four placements, `line` composed inside **five** commit helpers across **two** modules, an 8th `rewriteStatus` parameter, **two** widened closures in the **generated** `build-runtime.mjs` (`:274` and `:307`, not one) with the `dist/` rebuild and `sync-workflows.sh` run that implies, a return-shape change to `appendApprovalAnchors` threaded through three call sites for §7.4's class 11, and one new `QUEUE.md` column written on both `updateQueueStatus` paths (§7.2, §7.4). **The engine side is priced too**: both frozen seam injections gain a key (`devInjection` an 8th, `queueInjection` a 6th), `PROP-PARITY-12`'s two transcribed constants (`seam-contract.test.js:47-63`) are edited in the same task because the seam sets are pinned no-more-no-less, and **all three of `bin/cli.mjs`'s `run*()` call sites** (`bin/pdlc.mjs:385`, `:434`, `:457`) pass the value — the loop site included, or `pdlc queue --loop` ships unmarked (§7.2), **plus `cli.mjs`'s two shape
changes — the exported `main(argv, deps)` behind an entry guard and the default-valued runner
seam** — without which the process-entry leg that proves those three call sites cannot be
written at all (§9.3, §12.1; TE v6 F-36). That last item is small in bytes (an entry-guard
condition, four exported bindings — `main`, the default `deps` object whose export exists so the
leg can pin the defaults against `run.mjs`'s real exports, and the two gate functions
`startupFor`/`liveAdapter` the object's own values are pinned against, §9.3, TE v7 F-41, TE v8
F-43 — and one defaulted five-key parameter threaded to two command bodies, whose two gate keys
are read at the top of each body instead of calling the module-local functions directly) and
large in review attention, since it is the one place this feature changes behaviour in a file
§9.3 otherwise moves verbatim. So "one keyword parameter" costs a shipped contract test's expected values and every command body as well. Every part is additive and default-inert; the honest cost is the module count, the generated-artifact hop and the pinned seam contract, not the parameter |
| K-4 | **Vendoring (§5.2)** adds a build step, an ignore rule, a manifest and a two-root resolver, and forces §5.3's oracle restatement | R-5 says the package cannot contain the modules as arranged. Some cost is mandatory; this is the smallest one that leaves the repo layout alone |

### 14.2 Risks this design carries

- **R-A — The restated anti-fork oracle is weaker against one scenario the walk caught: an
  *untracked* fork sitting under `pdlc/engine/` in a working tree.** AF-1 reads tracked-ness,
  so an untracked stray copy no longer fails. This is deliberate — it is exactly what
  vendoring produces — and AF-2 covers the case that matters (a vendored copy that has
  drifted). The residual is a hand-placed untracked copy that is *also* byte-identical, which
  is harmless by definition. Stated so a reviewer can disagree with it explicitly.
- **R-B — `postinstall` is a fragile install mechanism.** Some environments disable install
  scripts (`--ignore-scripts`), in which case the store is never populated and the launcher
  refuses with ladder branch 7 rather than misbehaving. The failure is loud, but it is a
  failure, and it will surprise someone. Two mitigations, both now structural rather than
  directional: the refusal message names the store root and the remedy, and — because §6.2
  exempts them from the resolution gate — `pdlc --version` and `pdlc doctor` still run in this
  state, so the operator can reach the diagnostic that explains the refusal. `doctor` printing
  "store root X, versions installed: none" is what turns this from a mystery into an
  instruction. AC-2.1's "the CLI is on `PATH`" also survives: the global `bin` shim is placed
  by npm's own linking, not by the `postinstall`, so the launcher exists even when the store
  does not (PM Q-03).
- **R-E — The Node-12.17 syntax-subset claim is documented, not tested** (PM v5 Q-01). §9.3
  drops the "parses under an ES-2020 parser" clause rather than add `acorn` to the one manifest
  this feature's packed-set equality is auditing, and keeps the claim as a header comment. The
  consequence is worth stating where the risks are read, not only where the trade is argued: a
  future edit to `bin/pdlc.mjs` using a post-12.17 construct is caught **only at review**, and
  what it breaks is the user-visible half of AC-2.4 — an operator on an old Node sees a stack
  trace instead of a named floor. The mitigations are that the file is three top-level
  statements long, that clause 3 mechanically covers the specific regression that has already
  happened once (`await import(…)`), and that the comment states the constraint at the point of
  edit. Accepted knowingly; reversible by adding a parser if the file ever grows. **The reversal
  has a mechanical trigger, not a judgement call** (PM v6 Q-02): the mitigation rests on the
  file being short enough to read at review time, and structural clause 2 is the only thing that
  pins that — so *if `bin/pdlc.mjs` ever needs a top-level statement beyond the three clause 2
  admits (floor comparison, refusal, `import("./cli.mjs")`), the parser stops being optional* and
  this risk must be re-decided rather than re-accepted. Clause 2 goes red at exactly that moment,
  so the trigger fires in CI rather than waiting for a reviewer to notice.
- **R-C — Two Node processes per run** (launcher plus resolved engine). Startup cost is
  paid twice. Measured concern only; the dispatch path dominates.
- **R-D — R-2, R-3, R-4 from the REQ are unchanged by this design.** Nothing here narrows
  the range-widening pressure (R-2), the skills-skew window (R-3), or the two-channel
  transition (R-4). They remain the REQ's residual risks.

### 14.3 Deliberately not closed in Phase 1

| # | Item | Why, and who owns it |
|---|---|---|
| N-1 | **AC-6.2's load-root half on the bundle side** | C-4 forbids teaching that path to self-report. §7.3 closes the engine half only and documents the interim limit in AT-6.2's recorded evidence (Q-2). Re-opens against `pdlc-plugin-retirement`, which removes the second channel and dissolves the question |
| N-2 | **`license` (O-8 blocker 3)** | An operator decision with a dependency's terms to check, not an engineering choice. The PLAN carries it as a gate task blocking the first real publish, not as a code task |
| N-3 | **BL-03's transcription into `DECISIONS-plugin-distribution.md`** | Still undone at HEAD (V-21, FSPEC Q-6). This TSPEC is written on O-7's decided position; if the transcription lands saying something else, this document re-opens. Operator-owned |
| N-4 | **Q-3, range-widening cadence** | Operator-owned, shapes R-2's mitigation, blocks nothing here |
| N-5 | **Q-7, M-ENG-10's change-control tail** | One sentence in the constraints file, owned by the same pass that lands §5.1's carrier (§8.5). The deferral expires when that carrier lands |
| N-6 | **The npm scope in the published package name (O-8 blocker 2)** | DEC-DIST-05 chose "scoped public npm" and named no scope; the operator-facing repo is `ohenak/yumo-plugins`. A scope the operator does not own on npm blocks the first publish exactly like N-2's licence does, and the package name is the most consumer-visible string this feature ships — so it is a product/operator decision, recorded in `DECISIONS-plugin-distribution.md`, not a literal invented in this TSPEC. PF-3 asserts the manifest against the recorded value; §9.1's README ships the resolved literal. Operator-owned, blocks the first publish and nothing before it |

### 14.4 Definition of done for this TSPEC

- Every REQ acceptance criterion appears in §13 with a named component.
- Every FSPEC-parked obligation (O-9, O-10, O-2's execution half, Q-4, Q-5) is decided in
  §4 with its rejected alternatives, or explicitly listed in §14.3 with an owner.
- Every claim about existing behaviour in §2 carries a `file:line` citation verified in the
  working tree, **including the ones a review round corrected** — V-14's `converge()`-only
  scope, V-17's queue-side writer and V-18's per-job axes were each re-measured rather than
  re-asserted — as was round 2's correction of the commit-site claim, where the enumeration in
  §7.2 was produced by grepping every `git commit` invocation in both modules rather than by
  reasoning about which helper "should" own them.
- No oracle is deleted without a strictly stronger replacement named in the same table, and
  no oracle is left satisfiable by absence without a positive pairing named in §12.3.
- Where this design's needs disagree with an upstream document, the disagreement is raised as
  an erratum rather than resolved silently in this layer: FSPEC §5.2's expected packed set
  (now also missing `bin/cli.mjs`), FSPEC's `[blocked on O-9]` marking of AT-4.5, and REQ
  AC-5.3's kind-4 scope — the last reduced in round 2 to a wording confirmation, because
  FSPEC BR-9.3 already decided the harness/agent principle it turned on and re-asking a
  settled question is the anti-pattern DEC-ERR-01 names.
