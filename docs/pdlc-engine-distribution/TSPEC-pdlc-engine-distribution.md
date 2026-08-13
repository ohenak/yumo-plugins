# TSPEC — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` — `docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` (v0.10), `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.2, `FSPEC-EDIST-01`), `docs/_decisions/DECISIONS-plugin-distribution.md` (DEC-DIST-05), `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-10…M-ENG-13) |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft — in review (Phase T) | Claude | 0.2 | 2026-08-13 |

**Changelog**

| Version | Change |
|---|---|
| 0.1 | Initial draft |
| 0.2 | Round-1 cross-review revisions (PM + TE). Packed set reconciled with FSPEC §5.2 and `postinstall` given a packed home (§5.1, §5.4); AF-2 given a `prepack` precondition, set-equality and falsifier (§5.3); `--version`/`doctor` exempted from the launcher's resolution gate (§6.2, §11); config read made three-way with a new ladder branch 0 (§6.3, §6.4); provenance placements corrected from three to four with kind 4 composed in one marked commit helper (§7.2); §7.4's `artifactPaths` grounding corrected — the push is conditional and `converge()`-only, so four document classes are missing and a literal set-equality replaces the prose (§7.4, V-14); the reusable-workflow gate extraction **rejected** in favour of duplicated job bodies, with a `uses:`-is-unexpandable rule making the rejection mechanical (§8.2, §8.5); Node-floor guard moved to a dependency-free entry with a named below-floor runner (§9.3); inert update probe made to still emit "could not check" (§10.1); S-2 corrected to the shipped signature; catalogue registration scheduled with emitters and paired with rendered-text assertions (§10.3, §12.4); npm scope routed to the operator as N-6. Three errata raised upstream (FSPEC §5.2, FSPEC's AT-4.5 blocking, REQ AC-5.3 kind 4) |

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
| Node-floor guard entry | `pdlc/engine/bin/pdlc.mjs` | extended | The `bin` entry, and **only** the floor comparison plus `await import("./cli.mjs")` (§9.3). Keeps its name so the manifest's `bin` field, `AC-2.1`'s `PATH` entry and the shipped `cli.test.js`'s invocation target are all unchanged |
| Launcher body | `pdlc/engine/bin/cli.mjs` | **new** | Everything `bin/pdlc.mjs` does at HEAD, moved unchanged: argument parse, version-resolution entry, `exec` into the resolved engine (§6.3), or run in-process when it *is* the resolved engine. New file only because the guard must import nothing statically (§9.3); no behaviour moves with it |
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

Five decisions the FSPEC parked. Each is load-bearing, each had a real alternative, and
each is recorded with its rejected alternatives in
`docs/pdlc-engine-distribution/DECISIONS-pdlc-engine-distribution.md`.

| # | Question | Decision | Recorded as |
|---|---|---|---|
| D-1 | O-10 / R-5 — how the workflow modules get inside the package | **Build-time vendoring into the packed tarball only** (R-5 option a), with a two-root resolver and a *restated*, not weakened, anti-fork oracle | DEC-EDIST-01 |
| D-2 | O-9 — the provenance carrier | **One optional, default-inert `_provenance` seam** on `main()`, carrying a frozen pre-rendered value. Closes AC-4.2 and AC-4.1; AC-4.5 needs **no carrier at all** (V-14); AC-6.2's load root is closed **engine-side only** and stays open bundle-side | DEC-EDIST-02 |
| D-3 | O-2 — how a pin *executes*, not just resolves | **Version store plus thin launcher**: many versions installed side by side under one store root, one launcher on `PATH` that `exec`s the resolved one | DEC-EDIST-03 |
| D-4 | Q-4 — which AC-5.6 branch | **Ignore-with-notice.** `PDLC_PLUGIN_ROOT` without an explicit per-invocation dev declaration is ignored, the released version runs, and the run states the variable was ignored | DEC-EDIST-04 |
| D-5 | Q-5 — how `__tests__/` is kept out of the tarball | **A `files` allow-list**, not an `.npmignore` deny-list | DEC-EDIST-05 |

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

**The literal expected packed set** (the right-hand side of PF-4 and AT-3.8a):

| # | Member | Why it is packed |
|---|---|---|
| E-1 | `package.json` | npm, unconditionally |
| E-2 | `README.md` | npm, unconditionally; authored by this feature (§5.1) |
| E-3 | `LICENSE` | npm, unconditionally — **present only once N-2's operator licence decision lands.** The member's presence in the *expected* set is read from **N-2's recorded decision in `DECISIONS-plugin-distribution.md`** — has a licence been recorded — exactly as PF-3 reads the scope, and **never** from whether `pdlc/engine/LICENSE` exists. See the note below |
| E-4 | `bin/pdlc.mjs` | `files` entry `bin/` — the Node-floor guard entry (§9.3) |
| E-4b | `bin/cli.mjs` | `files` entry `bin/` — the launcher body the guard dynamically imports (§9.3, §3.1) |
| E-5…E-16 | the twelve `lib/*.mjs` (V-03) | `files` entry `lib/` |
| E-17 | `vendor/workflows/orchestrate-dev.js` | `files` entry `vendor/workflows/` |
| E-18 | `vendor/workflows/orchestrate-queue.js` | same |
| E-19 | `vendor/workflows/VENDOR-MANIFEST.json` | same |
| E-20 | `scripts/postinstall.mjs` | explicit `files` entry; §9.2 depends on it existing in the installed tree |

**Why E-3's boolean comes from the decision record and not from the tree.** An expected set
that reads the artifact under test is not an expectation. If E-3 were "expected iff
`pdlc/engine/LICENSE` exists", a `LICENSE` lost to a bad merge after N-2 lands would shrink
*both* sides of the equality together, PF-4 would stay green, and the package would publish
unlicensed — the deletion-tolerant hole a both-directions equality exists to close. Sourced
from the decision record instead, the two states are:

| N-2 recorded? | Expected set | A missing `pdlc/engine/LICENSE` |
|---|---|---|
| no | E-1, E-2, E-4, E-4b, E-5…E-20 (no `LICENSE` member) | consistent — nothing to ship yet |
| yes | the above **plus** E-3 | **red**, which is the point |

The flip is therefore a visible edit to one record (the same record PF-3 already reads), not
an inference the oracle makes from the tree it is auditing. The expected set is 20 members
before N-2 and 21 after.

**The `bin/` contents are enumerated once, here, and §9.3 does not create a member this set
lacks.** The guard keeps the name `bin/pdlc.mjs` (E-4) and the body moves to `bin/cli.mjs`
(E-4b), so the manifest's `bin` field (`pdlc/engine/package.json:6-8`, `"pdlc":
"bin/pdlc.mjs"`) is untouched, AC-2.1's `PATH` entry is untouched, and the shipped
`cli.test.js` keeps invoking the same path — now exercising the guard plus the dynamic import,
which is the end-to-end behaviour it was always proving (PM Q-01, TE Q-06). Unit coverage of
the body may import `bin/cli.mjs` directly; the existing end-to-end oracles do not move. The
`files` entry `bin/` packs both without change.

**This disagrees with FSPEC §5.2 as written, and the disagreement is raised, not papered
over.** FSPEC §5.2 enumerates the manifest, `bin/pdlc.mjs`, the twelve `lib/*.mjs` and the
workflow modules, and explicitly excludes "repo-level documentation" — so E-2, E-3, E-4b and
E-20 are members this TSPEC's design requires and the FSPEC's expected set does not contain. An
erratum is raised against FSPEC §5.2 rather than leaving the two documents disagreeing while
a both-directions equality gates on them.

**Note for the FSPEC's §5.2 workflow-module row.** That row is marked *"[blocked on O-10],
not enumerable yet"*. This section unblocks it: the members are exactly E-17, E-18 and E-19.
AT-3.8b is therefore writable, and the PLAN schedules it in Phase 1 rather than deferring it.

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

Because pass-through is a claim about a real process, it gets a real oracle rather than
resting on S-3's descriptor double: **one test spawns through the launcher against a trivial
fake target** and asserts a non-zero exit code is propagated verbatim, that stdout and stderr
each arrive unchanged, and that they are not interleaved into one stream. S-3's descriptor
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
is a catalogue entry (§10.3), not an inline string, so `lib/catalogue.mjs`'s shipped
registered-message set-equality (`pdlc/engine/lib/catalogue.mjs`,
`__tests__/catalogue.test.js`) covers it for free.

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
| 3 — the `QUEUE.md` row the run rewrites | **both** the row's own text (a new `Engine` cell) **and** the commit message that lands it | `rewriteStatus` (`orchestrate-queue.js:1522`, writes the row at `:1571`); `commitQueueRow` (`:1598`) composes the message |
| 4 — every commit the run makes | `line` composed into the message inside each of **four** marked helpers, never at a call site | the closed set below |

Three things this pins down that the earlier draft left loose:

- **Kind 3 has two artifacts, not one.** The `QUEUE.md` row *text* and the commit message
  that lands it are separate bytes on disk; marking only the message leaves the row itself
  unmarked, and AC-5.3 asks about the row. Both get the mark.

- **Kind 4's marked sites are a closed enumeration, not a single helper — the earlier draft's
  "every script-owned commit funnels through `commitPaths`" is false at HEAD.** Measured by
  grepping every `git commit` invocation in both modules, there are **four** script-owned
  commit sites and only one of them is `commitPaths`:

  | # | Site | What it commits | Reached from |
  |---|---|---|---|
  | C-a | `commitPaths` (`orchestrate-dev.js:10408`, `git commit -m message` at `:10429`) | every pathspec-scoped artifact commit, including the Phase I wave commits (`:12390`, `:12401`, `:12801`) | `orchestrate-dev.js` |
  | C-b | `appendApprovalAnchors` (`orchestrate-dev.js:6660`; `_git(["commit", "-m", "chore(pdlc): record approval anchors …"])` at `:6736`) | the `APPROVAL-HASH:`/`REVIEWED-COMMIT:` lines appended at `:6716-6721` | `orchestrate-dev.js`, **not** via `commitPaths` |
  | C-c | `commitQueueRow` (`orchestrate-queue.js:1598`, `git commit` at `:1603`) | the `QUEUE.md` row (kind 3's own commit) | `orchestrate-queue.js`, a different module — it issues its own `git add`/`git commit` through `gitFn` and never touches `commitPaths` |
  | C-d | `commitAdvisoryRecord` (`orchestrate-queue.js:1637`, `git commit` at `:1645`) | `ADVISORY-{feature}.md` | `orchestrate-queue.js` |

  (`orchestrate-dev.js:2839` is the advisory A5 seam's `apply`, which commits through the same
  injected `_git`; it is covered by C-a's rule below only if routed through `commitPaths`, and
  the PLAN carries that routing as part of the same task. It is named here so the set stays
  closed rather than approximately closed.)

  All four compose `line` internally, so no call site carries the responsibility. The
  structural claim is then the honest one — **"no script-owned `git commit` exists outside
  these four helpers"** — and it is *assertable*, not merely asserted: a source-level oracle in
  the arrangement suite greps both workflow modules for `git commit` invocations and asserts
  the set of enclosing function names equals `{commitPaths, appendApprovalAnchors,
  commitQueueRow, commitAdvisoryRecord}`. A new commit site added anywhere else turns that row
  red, which is the property "a new site inherits the mark by construction" was reaching for
  and did not have. Without this correction AT-5.3's "none is unmarked" would go red against a
  correct implementation of the earlier design — the same failure mode §7.4 was corrected for.

- **Kind 3's mark reaches the queue-side writer by one named parameter, and lands in one named
  cell.** The carriers are queue-side while `_provenance` is a parameter of `orchestrate-dev`'s
  `main()`, and the two are joined by a **generated** closure whose argument list is fixed
  (`build-runtime.mjs:273-274`: `__queue.rewriteStatus(__queuePath, feature, status, rtReadFile,
  rtWriteFile, rtGit, evidence)` — verified at HEAD). The route is therefore specified, not left
  to the test author to invent:

  1. `main()`'s `_recordQueueRow` call object gains `provenance` beside the existing
     `{feature, status, evidence}` (`orchestrate-dev.js:12913` is the call site).
  2. `rewriteStatus` gains an **8th positional parameter** `provenance = NO_PROVENANCE`,
     defaulted so every existing caller and every existing test is unchanged.
  3. `build-runtime.mjs`'s closure passes it through as the 8th argument, and
     `dist/` is rebuilt — the change crosses a generated artifact, so `build-runtime.mjs
     --check` and `sync-workflows.sh` are part of the task, not an afterthought (K-3).
  4. `rewriteStatus` hands `provenance.line` to `commitQueueRow` for the message, and to the
     row writer for the cell.

  **The cell is a new `Engine` column, not the existing `Evidence` one** (PM Q-03). `Evidence`
  carries merge semantics of its own — `mergeEvidenceCell`'s no-downgrade rule and the
  evidence-free identity property PROP-M-12 (`orchestrate-queue.js:621`, `:559`) — and writing
  a provenance string through it would corrupt both. The `Engine` column is added by an
  `ensureEngineColumn` helper mirroring `ensureEvidenceColumn` exactly (`:559`): append once,
  never twice, header + separator + one cell per data row. The round trip is safe because both
  `parseQueue` (`:132`) and `updateQueueStatus` (`:415`) resolve columns **by header name**,
  not by position, and a trailing column they do not name is ignored; `Engine` collides with
  none of the names they match on (`order`/`#`, `status`, `feature`, `req`/`path`,
  `depends`/`deps`, `evidence`). A hand-edited queue table that lacks the column gets it on the
  next write, and one that has it keeps it.

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
**every commit the run *harness* makes**, i.e. the closed set C-a…C-d above, and the erratum
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
fails against correct code unless the anchor path enumerates the file it touched. It does:
`appendApprovalAnchors` pushes the cross-review path onto `artifactPaths` at the point the
append succeeds (`appended = true`), which is script-owned and cannot be forgotten by an agent.
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
The engine README exists to make E-2 an intentional member rather than an accidental one and to
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
  top-level statements are the version comparison and, on success, `await import("./cli.mjs")`
  — the dynamic import is what defers the rest of the graph until after the check. Keeping the
  name is what leaves the manifest's `bin` field, AC-2.1's `PATH` entry and `cli.test.js`'s
  invocation target untouched (§5.4, TE Q-06).
- That file is written in the syntax subset valid on the **oldest Node that could plausibly run
  it**, not on the floor version. It parses on Node 12 so that it can refuse on Node 12.
- Everything currently in `bin/pdlc.mjs` moves **unchanged** into the new `bin/cli.mjs`
  (E-4b), behind that dynamic import; the guard file imports nothing statically, so there is no
  graph to evaluate early. No behaviour moves with the code — the split exists only to satisfy
  the evaluation-order constraint above.

**The container leg cannot falsify the hazard on its own, so it is paired with a structural
oracle.** AT-2.5's runner is Node 18 (below the `>=20` floor, see below), but Node 18 parses
every modern construct in `lib/` happily. A regressed implementation — the guard restored to the
top of a statically-importing `bin/pdlc.mjs` — would pass AT-2.5 on `node:18-alpine` with the
right message and the right exit code, while still emitting the stack trace AC-2.4 forbids on
the runtimes where it actually matters. The falsifier for the *structure* therefore runs in the
unit suite, in-process, needing no old runtime: parse `bin/pdlc.mjs`'s source and assert

1. it contains **zero** static `import` declarations, and
2. its only non-comment top-level statements are the floor comparison, the refusal, and the
   single dynamic `import("./cli.mjs")`.

That goes red on exactly the regression the container leg cannot see, and the two together
cover the claim: the container proves the *refusal* works below the floor, the structural
oracle proves the *guard still runs first*.

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
| S-6 | `_provenance` — frozen `Provenance` (§7.1) | workflow modules | `NO_PROVENANCE` | the engine's `run.mjs` |

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
| Unit, in-process | `pdlc/engine/__tests__/`, the shipped `node --test` suite | Resolution ladder, store enumeration, provenance rendering, catalogue closure, config read discipline, handshake/env-var branch. All pure over injected seams — no temp dirs, no network, no spawn |
| Arrangement / oracle | same suite | FSPEC §5.1's two set-equalities over fixture YAML, §5.4's packed-set equality over a **real `npm pack` into a temp dir** (PF-4), the `publish.yml`/`pr-tests.yml` command equality, AF-1…AF-3, §9.3's **guard-entry structural oracle** (zero static imports, dynamic import only) and §7.2's **commit-site set-equality** over both workflow modules' sources |
| Module-side | `pdlc/workflows/__tests__/` | `_provenance` inertness and the four placements — **kinds 1, 2 and 4 against `orchestrate-dev.js`, kind 3 against `orchestrate-queue.js`** (including the `rewriteStatus` 8th-parameter pass-through and the `ensureEngineColumn` round trip), same suite, two module targets |
| Fixture-machine | CI job, container | Install/upgrade legs, `npm pack` into a temp prefix with `PATH` scoped to it; the launcher pass-through spawn test (§6.2); **AT-2.5 on a below-floor image (`node:18-alpine`)**, since the PR gate is `node: ['20']` only — paired with the structural oracle above, which is what makes AT-2.5 non-vacuous (§9.3) |
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
   kind in either fails. Cross-review and `CODE_REVIEW-*` file **contents** are asserted
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
test file. Four sequencing constraints the PLAN must honour:

- §5.3's oracle restatement (AF-1…AF-3) lands **in the same task** as the vendoring change.
  Vendoring first turns V-05 red for a real reason; restating first removes a guard while
  nothing replaces it. Neither ordering is acceptable, so they are one task.
- §8.5's `uses:`-unexpandable rule and the `publish.yml`/`pr-tests.yml` command equality land
  **before** `publish.yml` itself, so the arrangement gate exists before the arrangement it
  governs. (The earlier draft sequenced a *gate extraction* here; §8.2 no longer performs one,
  and the constraint that replaces it is this.)
- `_provenance`'s inertness test (P-1) lands **before** any placement, so byte-identity of
  the disabled path is proven before the enabled path exists.
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
| AC-4.5 | `artifactPaths` ships but is `converge()`-only (V-14 corrected); five missing classes added, including the anchor-appended `CROSS-REVIEW-*`, + literal set-equality | §7.4 |
| AC-5.1 | Ladder branch 3 + inert-by-default `UpdateProbe` | §6.3, §10.1 |
| AC-5.2 | Ladder branch 6's announcement | §6.3 |
| AC-5.3 | `Provenance.line`/`block` in exactly four kinds, kind 4 composed inside one marked commit helper; kind-4 scope raised as an erratum | §7.2, §12.3 |
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
| K-3 | **Touching the workflow modules at all** (§7.2) is a change to the file this repo is most careful about, and it must stay loadable in the Claude Code workflow runtime | AC-4.2 is unsatisfiable otherwise (V-16, V-17). Bounded, but **not as small as the earlier draft priced it**: one default-inert `main()` parameter, four placements, `line` composed inside **four** commit helpers across **two** modules, an 8th `rewriteStatus` parameter, a widened closure in the **generated** `build-runtime.mjs` (`:273-274`) with the `dist/` rebuild and `sync-workflows.sh` run that implies, and one new `QUEUE.md` column (§7.2). Every part is additive and default-inert; the honest cost is the module count and the generated-artifact hop, not the parameter |
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
  re-asserted.
- No oracle is deleted without a strictly stronger replacement named in the same table, and
  no oracle is left satisfiable by absence without a positive pairing named in §12.3.
- Where this design's needs disagree with an upstream document, the disagreement is raised as
  an erratum rather than resolved silently in this layer: FSPEC §5.2's expected packed set,
  FSPEC's `[blocked on O-9]` marking of AT-4.5, and REQ AC-5.3's kind-4 scope.
