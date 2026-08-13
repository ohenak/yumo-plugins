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
| `name` | `pdlc-engine` | `@kaneho/pdlc-engine` | DEC-DIST-05 chose scoped-public; O-8 blocker (2) is decision-enforced only |
| `private` | `true` | *removed* | O-8 blocker (1), the one npm itself refuses |
| `license` | `UNLICENSED` | operator-set SPDX id | O-8 blocker (3). **Operator obligation, not this TSPEC's to invent** — the PLAN carries it as a gate task, not a code task |
| `version` | `0.1.0` | unchanged by this feature | T-1a; bumped per release, not here |
| `engines.node` | absent | `">=20"` | C-3 / T-2 declared, so `npm` warns and §11's runtime check has a declaration to name |
| `files` | absent | `["bin/", "lib/", "vendor/workflows/", "README.md"]` | D-5; §5.4 |
| `pdlcPluginCompat` | `^0.22.0` | unchanged shape | T-3, already shipped (V-07) |
| `pdlcPairing` | absent | written **by the publish job**, §8.4 | O-6's single-writer record |
| `scripts.prepack` | absent | `node scripts/prepack.mjs` | §5.2 |

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
| AF-2 | For every entry in `VENDOR-MANIFEST.json`, the vendored bytes hash equal to the canonical `pdlc/workflows/` source at the same commit. A vendored copy that has drifted by one byte fails. | **New.** This is the property the walk was a proxy for, now asserted directly |
| AF-3 | `PROP-FORK-1`'s exact-path equality is kept for the checkout root, and extended: in an installed package the resolved module path must equal the vendor root's path exactly, not merely start with it. | Extends `run.test.js:67-79` |

The distinction BR-8.2 demands — "vendored in the repo" versus "vendored in a build
artefact" — is carried by AF-1's tracked-ness test, and the property is not merely
preserved but made checkable at the byte level by AF-2. **No assertion is deleted without a
strictly stronger replacement named in this table.**

### 5.4 The `files` allow-list (D-5, Q-5)

An allow-list is chosen over `.npmignore` because the failure modes are asymmetric: a
deny-list that forgets an entry ships something it should not — which is exactly AC-1.3's
"an added file fails" scenario, and exactly how a skills copy or the `__tests__/` corpus
would leak in. An allow-list that forgets an entry ships too little and fails AT-3.8a
loudly at build time. **We prefer the failure that is caught offline over the one that is
caught by a consumer.**

The list is `["bin/", "lib/", "vendor/workflows/", "README.md"]`, which yields exactly
FSPEC §5.2's expected members: the manifest (npm always includes it), `bin/pdlc.mjs`, the
twelve `lib/*.mjs` (V-03), and the vendored workflow modules — and excludes `__tests__/`,
`package-lock.json`, `.gitignore` and `scripts/` without naming any of them. Q-5 is
answered: the exclusion is a deliberate packaging mechanism, not an omission.

**Note for the FSPEC's §5.2 workflow-module row.** That row is marked *"[blocked on O-10],
not enumerable yet"*. This section unblocks it: the members are exactly
`vendor/workflows/orchestrate-dev.js`, `vendor/workflows/orchestrate-queue.js` and
`vendor/workflows/VENDOR-MANIFEST.json`. AT-3.8b is therefore writable, and the PLAN
schedules it in Phase 1 rather than deferring it.

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

`exec` (process replacement via `child_process.spawnSync` with `stdio: "inherit"`, exit
code propagated) rather than dynamic `import` of the target version, because the two
versions may declare different `@anthropic-ai/claude-agent-sdk` ranges and must not share
one module registry. Exit code, stdout and stderr pass through unchanged, so every
existing CLI oracle keeps working.

### 6.3 The resolution ladder (BR-4.1)

`resolveVersion()` is **pure**: it takes a listing, a config object, argv-derived flags and
an env snapshot, and returns a decision. No fs, no exec, no clock. Total and ordered:

| Order | Branch | Condition | Result |
|---|---|---|---|
| 1 | `dev` | `--dev` present **and** the running engine is a checkout **and** the resolved plugin root is that checkout's `pdlc/` (O-5 rider 1) | run the checkout in place; `mode: "dev"` |
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

## 8. Publish pipeline (F-5)

## 9. Install and upgrade (F-2, F-3)

## 10. Types and protocols

## 11. Error handling

## 12. Test strategy

## 13. Requirements traceability

## 14. Costs, risks, and what is deliberately not closed here
