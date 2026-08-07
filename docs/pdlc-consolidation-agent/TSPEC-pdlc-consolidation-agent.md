# TSPEC — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer,product-manager}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-06 |

> **Scope in one line.** The mechanism for one consolidation pass: one new workflow module
> (`pdlc/workflows/consolidate-learnings.js`), the seam protocol it is injected with, the pure
> functions its behaviour decomposes into, the one edit it makes to shipped code
> (`resolveAdvisoryRung`'s optional `skill` parameter), and the test strategy that falsifies each.

## 1. Scope, inputs, and what this document decides

This TSPEC is written against `FSPEC-pdlc-consolidation-agent` v11.1 and `REQ-…` v2.0. It adds no
behaviour. Where the FSPEC names an observable, this document names the module, function, seam and
type that produce it, and the test level that falsifies it.

**Binding upstream references, cited by pinned `Version`, never restated:**

| File | Version | Taken from it |
|---|---|---|
| `docs/_constraints/pdlc-consolidation-vocabularies.md` | 1.4 | §1 vocabularies, §2 phase observable, §3 log grammar, §4 pass identity and trailers |
| `docs/_constraints/pdlc-advisory-corpus-baseline.md` | 1.0 | §1 surviving records, §2 absent at HEAD, §3 reuse the resolver, §4 the escalations-not-resolutions limit |
| `docs/_constraints/DOMAIN-CONSTRAINTS.md` | — | DC-01 (closed/total contracts), DC-04 (oracle is a pure function of an injected root), DC-05, DC-08 (cite-and-reuse the sibling), DC-09/DC-10 (altitude) |
| `docs/_decisions/DECISIONS-spec-layer-boundary.md` | — | DEC-LAYER-01: this layer pins the literals the FSPEC deferred (FSPEC §14.1 T-10) |
| `docs/_decisions/DECISIONS-test-oracle-mechanics.md` | — | the canonical seam-double rule reused in §11 |

### 1.1 The ten obligations the FSPEC handed here, and where each is discharged

| # | Obligation (FSPEC §14.1) | Discharged at |
|---|---|---|
| T-01 | Function names, seam signatures, module placement | §3, §4, §5 |
| T-02 | Build entry, `distribution-manifest.json` row, and **how the bundle reaches `resolveAdvisoryRung`** | §8.2, §8.3 |
| T-03 | How the §6.1 temporary clone is created, located, removed | §9.1 |
| T-04 | Injected seams for file IO, git, PR API, **and capture of the resolver's `_log` stream** | §5, §8.4 |
| T-05 | The `resolveAdvisoryRung` call site, `rungState` threading, and the shape of the signature widening | §8.1 |
| T-06 | The `ESCALATIONS.md` parse implementation | §7.7 |
| T-07 | The `.gitignore` pattern's exact text | §3.2 |
| T-08 | Shared code vs. two implementations for the corpus enumeration | §7.1 |
| T-09 | At least one property strategy per parameterisable component | §11.4 |
| T-10 | The spellings of the "unavailable" observables | §6.5 |

### 1.2 What this document deliberately does not decide

- **Fixture construction and set-equality domains** — PROPERTIES', per `DEC-LAYER-01`. The FSPEC's
  §14.5 register (LD-1 … LD-5) passes through this layer unchanged; §11.5 lists which test file each
  lands in, never the fixture itself.
- **Behaviour.** Every branch below is the FSPEC's. Where this document appears to add a rule it is
  naming a mechanism the FSPEC required and left open (a literal, a seam, a decomposition).
- **Coverage floors and mutation budgets** — PROPERTIES'.

### 1.3 Altitude self-check

Per DC-09/DC-10 this document carries mechanism, not requirements: no new status, reason code,
route, verdict or field name appears here. Every enumerated value used is a
`pdlc-consolidation-vocabularies.md` §1 row at `Version` 1.4, and every literal this document *does*
pin (§6.5) is a value §1 has no row for and the FSPEC explicitly deferred under DEC-LAYER-01.

## 2. Technology stack and new dependencies

**No new runtime dependency, and no new dev dependency.** The stack is exactly the shipped one:

| Layer | Choice | Why, and the shipped precedent |
|---|---|---|
| Language | ES module JavaScript with JSDoc types, Node ≥ 20 | `pdlc/workflows/*.js`; the workflow runtime loads only the built bundle, so the source stays a jest-importable ES module |
| Interfaces | JSDoc `@typedef` + injected seam parameters (structural typing), not TypeScript | the repo ships no TS toolchain; `orchestrate-dev.js` / `orchestrate-queue.js` express every service boundary as a defaulted injection parameter (`orchestrate-queue.js:1033-1046`). §5 states each boundary as a typed protocol in that form |
| Test runner | jest 29 (`pdlc/workflows/package.json` — its **only** devDependency) | unchanged |
| Property generation | `__tests__/helpers/driftGenerators.js`'s seeded xorshift32 (`seeded`, `resolveSeed`) | DC-08 cite-and-reuse: the repo deliberately ships **no** property-testing library. §11.4 draws from this module and adds none |
| Seam doubles | `__tests__/helpers/seams.js` (`fakeFs`, `fakeGit`, `fakeListFiles`), `mergeDoubles.js` (`fakeGit`, `fakeGhRun`, `passingGh`, `fakeSleep`, `fakeNow`), `advisoryDoubles.js` (`makeAgentDouble`, re-exports) | DC-08 again. §11.2 adds **no** new double for `_agent`, `_git`, `_ghRun`, `_readFile`, `_writeFile`, `_appendFile`, `_listFiles` — only the two seams that do not exist yet (§5.3) get a new factory, and it lands in `advisoryDoubles.js`'s sibling module rather than in a test file |
| Hash / time | none needed | `passId` is derived from the log (§7.2), not from a counter or a UUID |

**Node built-ins are unavailable in the runtime bundle** (`build-runtime.mjs` header: no `import`,
no `fs`, no `process`). Every capability the pass needs beyond pure computation is therefore a
seam (§5) — including the two the shipped adapter does not yet have (§5.3). This is the single
constraint that shapes §9's design more than any other: the pass cannot call `mkdtemp`, cannot read
`process.env`, and cannot spawn a subprocess.


## 3. Project structure — files created and modified

### 3.1 New files

| Path | Role | Notes |
|---|---|---|
| `pdlc/workflows/consolidate-learnings.js` | the pass — one ES module, `export default async function main({…})`, every IO through a defaulted injection parameter | mirrors `orchestrate-queue.js`'s shape (`:1033`), so `build-runtime.mjs` can strip and wrap it with the existing `stripModuleSyntax` / `wrapModule` pair (`build-runtime.mjs:44`, `:56`) with no new build machinery |
| `pdlc/workflows/dist/consolidate-learnings.bundle.js` | generated runtime artifact | §8.2 |
| `pdlc/workflows/__tests__/helpers/consolidationDoubles.js` | the **one** canonical double module for this feature's two new seams and its log/corpus fixtures | excluded from jest by the shipped `testPathIgnorePatterns` (`package.json`); re-exports rather than re-declares every double that already exists (§11.2) |
| `pdlc/workflows/__tests__/consolidation*.test.js` | the suites — one file per §11.1 group | §11.5 names the split |

The pass is **one module, not a package.** `orchestrate-dev.js` is ~10.7 kLoC in one file and
`orchestrate-queue.js` ~1.7 kLoC; the build inlines whole module bodies into an IIFE
(`wrapModule`), and a multi-file module would need a build change for no behavioural gain. The
decomposition is by **exported pure function** (§4), not by file.

### 3.2 Modified files

| Path | Change | Constrained by |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | `resolveAdvisoryRung` (`:1833`) gains an optional `skill` parameter defaulting to `ADVISORY_RUNG_SKILL` (`:1797`), threaded to `dispatchAt`'s `_agent` call (`:1841`) and therefore to both the memoised path (`:1844-1849`) and the two-rung path | §8.1; FSPEC §15.3, §14.1 T-05 |
| `pdlc/workflows/build-runtime.mjs` | one new `bundles` row (the array is `:448-471`), plus `consolidate-learnings.js` read alongside the other two sources (`:83-85`) and a `CONS_META` / `CONS_ENTRY` pair beside `QUEUE_META` (`:127`) / `QUEUE_ENTRY` (`:185`) | §8.2 |
| `pdlc/workflows/runtime-adapter.js` | two new adapter functions — `rtEnvPresent` and `rtMakeTempDir` — plus a `rtConsInjections()` bundle beside `rtDevInjections` (`:1086`) | §5.3, §9.1 |
| `pdlc/workflows/dist/orchestrate-dev.bundle.js`, `dist/orchestrate-queue.bundle.js`, `dist/pdlc-cli.mjs`, `dist/distribution-manifest.json` | rebuilt **in the same commit** as the two rows above | §8.3 |
| `pdlc/hooks/scripts/nudge-consolidation.sh` | `:28` glob widened to include `docs/completed/*/`; `:41` predicate scoped to the two §3.2 regions | §7.1 |
| `pdlc/skills/consolidate-learnings/SKILL.md` | `:35`'s `Date Completed` boundary replaced by the block/legacy predicate; `:41`'s `DECISIONS-{topic}.md` route gains `{topic} = failure-mode-id` | FSPEC §3.2, §5.2 |
| `pdlc/skills/harvest-learnings/SKILL.md` | a `Phases exercised` row in the metadata table (`:72-78`, after the `Harvested from` row at `:77`); a `failure-mode-id` line in the §5 Open Items convention, stated as a **verbatim copy from the handed open-promotion list** | FSPEC §8.3, §8.4 |
| `.gitignore` | **exact text** (T-07): a comment line `# pdlc consolidation in-progress marker — working tree only (AC-1.3)` followed by the single pattern `docs/_decisions/.consolidation-lock` | §3.3 |

`pdlc/.claude-plugin/plugin.json`'s `version` is bumped by the release step, not by this feature's
implementation tasks; the manifest's `pluginVersion` stamp follows it (§8.3).

### 3.3 The `.gitignore` pattern, decided (T-07)

`docs/_decisions/.consolidation-lock` — a repository-root-relative path **containing a separator**,
written without a leading slash and without `**/`. Per gitignore(5) a pattern with a non-trailing
separator is already anchored to the `.gitignore`'s own directory, which the shipped
`/.claude/workflows/` entry documents at length in its own comment block (verified at HEAD, that
comment is the last block of the file). A slash-free `\.consolidation-lock` or a `**/`-prefixed form
would match at every depth and would silently swallow a fixture of the same name under
`pdlc/workflows/__tests__/fixtures/` — which §11 does create.

### 3.4 Consumer-visible surface

The pass is invoked as `/pdlc:consolidate-learnings`. That name already resolves to the **skill**
of the same name; after this feature it also resolves to a workflow bundle, exactly the
`orchestrate-queue` shape REQ §5 names (a skill and a bundle sharing one name). Nothing in
`pdlc/hooks/hooks.json` changes: no hook can start a pass (FSPEC §2.1), and `nudge-consolidation.sh`
keeps its advisory-only role (`:47-48` print `additionalContext` and exit 0).

## 4. Module architecture — decomposition and dependency graph

### 4.1 The shape: one impure driver over a wall of pure functions

`main()` is the only function that touches a seam. Every decision the FSPEC states — the predicate,
the datum, the id derivation, the merge, the verdicts, the streaks, the routing, the suppression,
the counting, the row rendering — is a **pure function of already-read text**, exported for direct
unit test. This is not a style preference: FSPEC §8.3's "no model judgment, two runs over the same
inputs cannot disagree" and §14.1 T-09's property obligations are only assertable if the decision is
reachable without standing up a pass.

```
main({ …seams })                       ← the only impure function
 ├─ resolveConsolidationConfig         (pure)   §7.8
 ├─ enumerateCorpus            ←_listFiles      §7.1
 │   └─ unconsolidatedSet              (pure)   §7.1
 ├─ cadenceDatum / triggerFor          (pure)   §7.2
 ├─ mintPassId                         (pure)   §7.2
 ├─ takeMarker                 ←_readFile/_writeFile   §7.3
 ├─ renderConsumedPair                 (pure)   §7.1
 ├─ dispatchClustering         ←resolveAdvisoryRung    §8.1
 ├─ parseEscalations                   (pure)   §7.7
 │   └─ seamCandidates                 (pure)   §7.7
 ├─ parseLogRecords                    (pure)   §7.4
 │   ├─ effectivenessTable             (pure)   §7.5
 │   ├─ openPromotionList              (pure)   §7.5
 │   └─ suppressionVerdict             (pure)   §7.6
 ├─ deriveProposals                    (pure over the clustering reply)  §7.4
 │   ├─ failureModeId                  (pure)   §7.4
 │   ├─ mergeProposals                 (pure)   §7.4
 │   └─ remediationChoice              (pure)   §7.5
 ├─ routeProposal                      (pure)   §7.6
 │   ├─ consuming-repo write   ←_appendFile
 │   └─ PR route               ←_git/_ghRun/_envPresent/_makeTempDir  §9
 ├─ renderTerminalRow / renderReport   (pure)   §7.9
 └─ commitConsumingRepoPaths   ←_git             §9.4
```

**Dependency direction is one-way.** No pure function calls another module's impure helper, and no
pure function closes over `main`'s scope. `main` threads a single `PassState` (§6.1) through the
sequence, which is what makes FSPEC §2.2's "terminates = a jump to step 14" implementable as an
early `return finishPass(state, …)` rather than as an exception (§10.2).

### 4.2 Where each function lives

All of the above are exported from `pdlc/workflows/consolidate-learnings.js` **except** four
reused imports, which are not re-authored (DC-08):

| Reused symbol | Source at HEAD | Used for |
|---|---|---|
| `resolveAdvisoryRung` | `orchestrate-dev.js:1833` | every agent dispatch the pass makes (§8.1) |
| `MERGE_GUARD_DEFAULTS` | `orchestrate-dev.js:48-53` | §7.6's routing predicate — read, never copied |
| `mergeCommandFor` | `orchestrate-dev.js:319` | the sole place a literal `gh` command string is built (§9.2 extends its `switch` rather than adding a second builder) |
| `gitWithLockRetry` | `orchestrate-dev.js:8617` | the `index.lock` retry class on §9.4's commit |

`commitPaths` (`:8669`) is **not** reused: its commit is a plain `git commit -m` with no pathspec
(`:8690`), which FSPEC §5.4 forbids here. The reused shape is `commitQueueRow`'s two-call form
(`orchestrate-queue.js:1576`; add `:1577`, commit `:1580-1585`) and `commitAdvisoryRecord`'s
mirror (`:1615`), including their shared `NOTHING_TO_COMMIT_RE` treatment (`:1631-1635`).

### 4.3 How the imports reach the bundle

`consolidate-learnings.js` imports those four symbols from `./orchestrate-dev.js` as an ordinary ES
module import, exactly as `orchestrate-queue.js` does today. The **bundle** cannot import, so
`build-runtime.mjs` inlines the dev module and re-binds the names in the consolidation IIFE's
prelude — the mechanism `queueModule`'s prelude already uses (`build-runtime.mjs:113-123`, a
`const X = __dev.X;` line per symbol). §8.2 states the four lines this adds and the four names
`devModule`'s export list gains.


## 5. Interfaces — the injected seam protocol

Every service boundary is a **defaulted injection parameter of `main()`**, the shape
`orchestrate-queue.js:1033-1046` establishes. Production wiring comes from
`runtime-adapter.js`'s new `rtConsInjections()`; tests pass doubles. The default value of every
seam is the module's own `default*` implementation where one is meaningful and `null` where the
capability must be *installed* (the `_runCommand` precedent: `NO_RUN_COMMAND = null`,
`orchestrate-dev.js:6699`, taken as the default at `:8921`).

### 5.1 The protocol (T-01, T-04)

```ts
interface ConsolidationSeams {
  // ── existing seams, contracts unchanged from runtime-adapter.js ──
  _agent(skill: string, prompt: string, opts?: {model?: string}): Promise<string>;
  _readFile(path: string): Promise<string | null>;          // null = absent OR unreadable
  _writeFile(path: string, contents: string): Promise<void>;
  _appendFile(path: string, text: string): Promise<void>;   // ONE whole record per call
  _listFiles(dirPath: string): Promise<string[]>;
  _git(argv: string[]): Promise<{ok: boolean; stdout: string; stderr: string}>;
  _ghRun(command: string): Promise<{ok: boolean; stdout: string; stderr: string}>;
  _log(message: string): void;
  _phase(label: string): void;
  _now(): number;                                           // injectable clock, default Date.now

  // ── the two seams this feature adds (§5.3) ──
  _envPresent(name: string): Promise<boolean>;              // NEVER returns the value
  _makeTempDir(passId: string): Promise<string | null>;     // absolute path, or null on failure
}
```

**Every seam call is `await`ed without exception.** The adapter's implementations are async and the
test doubles are sync (`__tests__/helpers/seams.js` header states the asymmetry and names it the
central hazard); a missing `await` therefore passes every unit test and fails only in production.
§11.3 states the compensating control.

### 5.2 Seam semantics this pass depends on, verified at HEAD

| Seam | Property relied on | Where verified |
|---|---|---|
| `_readFile` | maps a missing **or unreadable** file to `null` rather than throwing | `runtime-adapter.js:493`; `orchestrate-queue.js:1056-1063`'s comment states the same for the drift gate |
| `_appendFile` | appends the given text, no read-modify-write | `runtime-adapter.js:863` — this is what makes vocabularies §3's write-granularity rule implementable at all |
| `_git` | argv form, so `["-C", dir, …]` reaches a **different tree** without any shell quoting concern; returns `{ok, stdout, stderr}` and never throws | `runtime-adapter.js:945-957`, parse at `:967` |
| `_ghRun` | takes a fully built command **string**; the prompt carries an "issue AT MOST ONCE" clause because some `gh` commands mutate | `runtime-adapter.js:995-1006` |
| `_log` | plain sink; the resolver writes `ADVISORY_MODEL_FALLBACK:` through it (`orchestrate-dev.js:1858-1860`) and nowhere else | §8.4 depends on this |

`_git`'s `-C` capability is the single fact that makes FSPEC §6.5's **git-seam-split-by-tree**
implementable without a second seam: a call is classified into the invoking-tree domain or the clone
domain by whether its argv begins `["-C", cloneDir]`. §9.3 states the classifier; §11.3 states the
spy that reads it.

### 5.3 The two new seams, and why each must exist

The runtime has no `process` and no `fs` (`build-runtime.mjs` header), so neither capability can be
obtained in-module.

**`_envPresent(name) => Promise<boolean>`.** FSPEC §7.2 resolves the credential from the environment
variable named by `consolidation.credentialEnv`, and NFR-2 / §7.4 forbid that value from reaching any
log, artifact, PR body or report. A seam returning the **value** would put the secret inside the JS
process and inside the agent transcript that transported it — the transcript being a surface neither
the FSPEC nor the REQ can redact. The seam therefore returns a **boolean only**, and the adapter's
prompt is built so the value is never emitted:

```
rtEnvPresent(name):
  agent: run exactly:  [ -n "${<name>:-}" ] && echo PRESENT || echo ABSENT
         reply with that one word and nothing else.
  → true iff the reply is exactly "PRESENT"; any other reply, including an
    unparseable one, is false (fail-closed onto AC-4.3's degradation, never onto
    a claimed credential).
```

The credential's **value** reaches `git` and `gh` by shell expansion inside the transported command
(§9.2), so it is never a JS string and never an argv element the pass logs.

**`_makeTempDir(passId) => Promise<string|null>`.** FSPEC §6.1 requires the guard-set edit to be
made in a separate clone under a temporary directory. The pass cannot call `mkdtemp`. The adapter
creates it and returns the path:

```
rtMakeTempDir(passId):
  agent: run exactly:  mktemp -d -t pdlc-consolidation-<passId>
         reply with the created path and nothing else.
  → the trimmed reply when it is a single absolute POSIX path; otherwise null.
```

`null` is a §6.3 `api-failure`-class degradation input, not a halt (§10.3 row 7). The `mktemp -d -t`
form is chosen over a hand-built `/tmp/…` literal deliberately: `/tmp` is world-writable, and a
predictable path derived from `passId` is a symlink-attack surface and collides across two users on
one host. `-t` is honoured on both supported platforms (macOS bash 3.2 and Linux bash 5), the same
matrix `.github/workflows/pr-tests.yml` already runs.

### 5.4 The one seam that is deliberately *not* added

There is no `_runCommand`. Everything the pass does through a shell is either a `git` argv (`_git`)
or a `gh` command string (`_ghRun`), and both are transported by adapters whose replies are already
a closed `{ok, stdout, stderr}` contract. `rtRunCommand` (`runtime-adapter.js:1034`) returns a
trailer plus an output tail, which is the wrong shape for a call whose stdout the pass must parse
(a PR URL, a `gh pr list --json` payload).

### 5.5 Seam defaults, and what an unwired seam does

| Seam | Module default | Behaviour when the default stands |
|---|---|---|
| `_agent`, `_readFile`, `_writeFile`, `_appendFile`, `_listFiles`, `_git`, `_log`, `_phase` | the module's own `default*` (the `orchestrate-queue.js:1034-1046` pattern) | ordinary operation |
| `_now` | `Date.now` | ordinary operation |
| `_ghRun` | `null` | the PR route degrades with `api-failure` before any call is attempted; the proposal file still carries the diff (§10.3) |
| `_envPresent` | `null` | treated as "no credential variable observable" ⇒ §7.2 falls through to the `local-gh` probe, then to `absent` |
| `_makeTempDir` | `null` | the PR route degrades with `api-failure`; the pass never falls back to working in the invoking tree, which AC-3.8 forbids outright |

Each `null` default is the FSPEC's fail-safe direction, not a new branch: an uninstalled capability
degrades the PR route and never touches the invoking tree, never halts the pass, and never reads as
a credential the pass does not have.

## 6. Data model — types

JSDoc `@typedef`s in `consolidate-learnings.js`, stated here in TS notation. Every enumerated union
below is transcribed from `pdlc-consolidation-vocabularies.md` §1 at `Version` 1.4 — **transcribed,
never widened**: §11.3's AT-L5 harness compares the module's frozen catalogue arrays against that
table in both directions.

### 6.1 Pass state and configuration

```ts
type TerminalStatus = "promoted" | "promoted-degraded" | "no-op"
                    | "skipped-cadence" | "refused" | "failed";
type ReasonCode = "consolidation-in-progress" | "reclaimed-stale-lock"
                | "advisory-model-unresolved" | "no-cadence-datum" | "writes-uncommitted"
                | "credential-unavailable" | "repository-unresolved" | "api-failure"
                | "branch-exists" | "duplicate-suppressed"
                | "no-advisory-corpus" | "advisory-corpus-empty";
type Trigger    = "cadence" | "volume" | "manual";
type Route      = "constraints" | "decisions" | "PR" | "degraded";
type Action     = "promote" | "revise" | "retire";
type Verdict    = "prevented" | "recurred" | "insufficient-evidence";
type PromoState = "ineffective" | "unmeasurable";
type Credential = "present (redacted)" | "absent" | "local-gh";
type Phase = "R"|"F"|"T"|"D"|"P"|"PR"|"I"|"PT"|"CR"|"DOD"|"H"|"PUB"|"MERGE";

interface ConsolidationConfig {          // §7.8 — per-key independent fallback
  cadenceHours: number;                  // 168
  volumeThreshold: number;               // 5
  staleLockMinutes: number;              // 60
  pluginRepository: string | null;       // null ⇒ the current repository
  credentialEnv: string;                 // "PDLC_PLUGIN_REPO_TOKEN"
  unmeasurablePasses: number;            // 3
}
interface ConfigParse {                  // the parseAdvisoryConfig-shaped return
  config: ConsolidationConfig;
  sectionMalformed: boolean;
  invalidKeys: string[];
}

interface PassState {
  passId: string | null;                 // null until step 5
  trigger: Trigger | null;
  status: TerminalStatus | null;
  reasons: Set<ReasonCode>;              // a row may carry several (§10.1)
  rung: string | null;                   // the model id the pass actually ran on
  credential: Credential;                // "absent" until §7.2's resolution runs
  consumed: string[];                    // basenames, frozen at step 2
  proposals: Proposal[];
  records: FailureModeRecord[];          // appended one-per-proposal as each routes
  effectiveness: EffectivenessRow[] | null;   // null ⇒ step 11 never ran
  suppressions: Suppression[];
  notices: ParseNotice[];
  prUrl: string | null;                  // this pass's own PR only
  branch: string | null;
  markerHeld: boolean;
}
```

`reasons` is a `Set` because FSPEC §10.3 admits more than one code per row and vocabularies §1's
composition rule makes the legal set a function of the recording point, not of insertion order;
rendering sorts it into the catalogue's declaration order so the row is byte-stable across runs
(§7.9).

### 6.2 Proposals and records

```ts
interface Proposal {                 // the pass's in-flight unit, before it routes
  failureModeId: string;             // §7.4's derivation
  phase: Phase;
  symptom: string;                   // one line, non-keying free text
  artifact: string;                  // SUBJECT — canonical repo-root-relative path
  kind: 1 | 2 | 3;                   // FSPEC §5.2: 1 constraint, 2 decision, 3 process learning
  target: string;                    // decided by kind; the ONLY field routing reads
  action: Action;
  diff: string | null;               // the concrete edit; PR/proposal-file routes require it
  elidedKinds: (1|2|3)[];            // §7.4's merge compensation, for report item 4
  elidedArtifacts: string[];         // §7.4's tie-break compensation, same item
}

interface FailureModeRecord {        // the eight fields, exactly (FSPEC §8.1)
  failureModeId: string; phase: Phase; symptom: string; artifact: string;
  target: string; passId: string; action: Action; route: Route;
}

interface EffectivenessRow {
  failureModeId: string;
  artifact: string | null;           // null ⇒ rendered as §6.5's unavailable literal
  verdict: Verdict;
  state: PromoState | null;
  remediation: "revision" | "retirement" | null;   // null ⇒ the field is ABSENT, not empty
}

interface Suppression { failureModeId: string; action: Action;
                        evidence: {kind: "pr"; url: string}
                                | {kind: "pass"; passId: string | null}; }

interface ParseNotice { subject: string; missingField: string; detail?: string; }
```

`FailureModeRecord` is a **closed eight-field record on both sides** (DC-01): the writer emits all
eight on every kind and on the `degraded` route (AT-F20), and the reader is total over any subset
(§7.4's `parseLogRecords` yields a partial record plus the notice list, never a filled default). The
two halves are separate typedefs so the reader's type cannot drift into the writer's.

### 6.3 Corpus and advisory types

```ts
interface CorpusFile { path: string; basename: string; }
interface Predicate  { consolidated: Set<string>; unconsolidated: string[];
                       basenameCollisions: string[][]; }   // §7.1's reported collision
interface EscalationCounts {          // §7.7
  bySeamFeature: Map<string, Map<string, number>>;
  totals: Map<string, number>;
  distinctFeatures: Map<string, number>;
  entryCount: number;
  corpusState: "absent" | "empty" | "present";
}
```

### 6.4 Frozen catalogues

Every union above is also a module-level `Object.freeze([...])` array —
`TERMINAL_STATUSES`, `REASON_CODES`, `TRIGGERS`, `ROUTES`, `ACTIONS`, `VERDICTS`, `PROMO_STATES`,
`CREDENTIAL_VALUES`, `PHASE_CATALOGUE` — plus `REASON_CODE_STATUSES`, a frozen map from reason code
to its permitted status set (vocabularies §1's third column, transcribed verbatim at `Version` 1.4).
Freezing is the shipped discipline (`MERGE_GUARD_DEFAULTS`, `orchestrate-dev.js:48`; `MERGE_MODES`
`:55`; `ADVISORY_SEAMS` `:1669`) and is what lets §11.3's oracle range over the module's own
constants rather than over strings scraped from a fixture.

`REASON_CODE_STATUSES` is **read, not enforced away**: the renderer checks that a code it is about
to write is legal with the row's status and, when it is not, drops the code and emits a notice
rather than writing an illegal row (§7.9). That is the mechanism behind FSPEC §7.3's "recorded
**when the pass's terminal status admits that code**" and behind ER-4's named loss — the code the
erratum would legalise is exactly the one this check drops today.

### 6.5 The "unavailable" literals, pinned (T-10)

The FSPEC fixes four observables and defers their spelling here. One literal serves all four, so a
reader learns it once:

```js
export const UNAVAILABLE = "(unavailable)";
```

| Site | Rendering |
|---|---|
| FSPEC §8.3's effectiveness row with no `artifact` | the path cell is `(unavailable)` — never blank, never a guessed path |
| FSPEC §10.3's `suppressed-by:` entry with a short `passId` | `{id}:{action} → pass:(unavailable)` — the `pass:` prefix is retained, so the carrier stays legible and `pass:undefined` is unproducible |
| FSPEC §8.1's §8.4 steps 2–3 harvest question with a missing half | the missing clause renders as `… on artifact (unavailable) …`, the question still asked |
| FSPEC §6.5's seam permitted-set widening | not a literal — a recorded TSPEC decision; §9.3 states the sets this layer inherits and the rule for changing one |

`(unavailable)` is deliberately parenthesised and lower-case: it can be neither a repository path
(no path in this repo is parenthesised), nor a `passId` (`{YYYY-MM-DD}-{n}`), nor a vocabularies §1
value, so no reader can mistake it for data. **It is never written into a failure-mode record** —
records are appended as written and never repaired (FSPEC §10.2); the literal is a *rendering* of a
missing field at the point of display, in the report body and in the terminal row only.

## 7. Algorithms

Each subsection names the exported function, its signature, its purity, and the FSPEC branch it
implements. Unless stated otherwise every function here is **pure, total and synchronous**.

### 7.1 The corpus and the two-region predicate (FSPEC §3.1, §3.2, §3.4)

```ts
enumerateCorpus(_listFiles): Promise<CorpusFile[]>
classifyCorpus(files: CorpusFile[], logText: string | null): Predicate     // pure
renderConsumedPair(passId: string, basenames: string[]): string           // pure
```

`enumerateCorpus` issues exactly two directory walks — `docs/*` and `docs/completed/*` — through
`_listFiles`, filters each child directory's entries by `/^LEARNINGS-.*\.md$/`, and **never opens a
file**. `docs/discarded/` is not walked at all: exclusion is by *not enumerating*, not by filtering
afterwards, so a widened glob cannot re-admit it by accident (the directory holds two LEARNINGS at
HEAD, under `docs/discarded/pdlc-rcv-budget-stop/` and `docs/discarded/pdlc-review-convergence/`).

`classifyCorpus` is the predicate. Its algorithm, in order:

1. `boundary = logText.indexOf("<!-- pdlc:consumed")`. `-1` (or `logText == null`) ⇒ the legacy
   region is the whole text and the block region is empty.
2. **Legacy region** = `logText.slice(0, boundary)`; membership is bare substring containment — the
   shipped test (`nudge-consolidation.sh:41`) applied to a bounded slice.
3. **Block region** = the concatenation of every span from an opening `<!-- pdlc:consumed {id} -->`
   to the next `<!-- /pdlc:consumed -->`, or to end-of-text when no closer follows (the truncated
   append of E-04); membership is per-line equality against a trimmed line.
4. A closer with no opener contributes nothing and moves no boundary (E-05) — it is simply never
   reached, because a span is opened only by an opener.
5. `unconsolidated` = enumerated basenames in neither region, de-duplicated as a **set of
   basenames**; `basenameCollisions` records every group of ≥2 distinct paths sharing a basename
   (E-09), reported by §7.9 and never repaired.

The two membership tests differ deliberately — substring in the legacy region, per-line in the block
— and that asymmetry is the point: a block must name **exactly** the consumed set (NFR-5), while the
legacy region must reproduce the shipped predicate over prose that names full paths.

**T-08 decided: two implementations, held equal by a differential test.** The pass is JavaScript in
a bundle that cannot import; the hook is a Python heredoc inside bash that no JS test can import
(`nudge-consolidation.sh:22-50`). Extracting a shared implementation would need a third artifact and
a language boundary neither side has today. The two are therefore written separately to one stated
algorithm and pinned by AT-P7's differential harness, which runs both over one fixture table and
asserts set equality (§11.3). The hook's edit is minimal and mechanical: `:28`'s glob gains a second
`glob.glob` over `docs/completed/*/LEARNINGS-*.md`, and `:41`'s comprehension tests against the two
regions computed by a short helper rather than against `logtext` whole.

### 7.2 Trigger, datum and `passId` (FSPEC §2.3, §2.5)

```ts
cadenceDatum(logRows: LogRow[]): number | null                    // pure
triggerFor({unconsolidated, datum, now, config, direct}): Trigger | "skipped-cadence"   // pure
mintPassId(logText: string | null, today: string): string         // pure
```

`cadenceDatum` scans **parsed rows**, not raw text, and returns the `date` of the most recent row
whose `status` is in `{promoted, promoted-degraded, no-op, failed}` — "most recent" by the row's own
`date`, not by file position (AT-C5's Given puts a later `refused` row last). `null` is the empty
datum set, which `triggerFor` counts as elapsed.

`triggerFor` evaluates volume, then cadence, then `skipped-cadence`, and returns `manual`
unconditionally when `direct` is set. `now` comes from `_now()` — no function here reads a clock.

`mintPassId` scans every row's `pass:` field for the literal `{today}-` prefix, parses the suffix as
a decimal integer, and returns `{today}-{1+max}`, or `{today}-1` when none parses. A row whose
`pass:` field is absent or unparseable contributes no candidate and never aborts the scan (E-10).
`today` is derived from `_now()` in the invoking environment's local calendar and passed in, so the
function stays pure and property-testable over an arbitrary multiset of rows (T-09 row 2).

### 7.3 The marker (FSPEC §4.1, §4.2)

```ts
parseMarker(text: string | null): {passId: string, at: number} | null            // pure
markerVerdict(parsed, present, nowMs, staleLockMinutes): "free"|"refuse"|"reclaim"  // pure
takeMarker(state, seams): Promise<…>                                             // impure
```

`parseMarker` accepts exactly `IN-PROGRESS: {passId} {ISO-8601}` on one line; anything else — empty,
truncated, multi-line, unparseable timestamp — yields `null`. `markerVerdict` maps a **present but
unparseable** marker to `reclaim`, never to `refuse`: an unparseable marker carries no timestamp, so
it can never age out, and refusing on it would wedge the cadence permanently. The `present` flag is
what separates that case from an absent file (`free`), so the two `null`s are never conflated.

Take is `_readFile` then `_writeFile` — **read-then-write, not atomic**. FSPEC §4.5 / O-C3 prices
this race and asks whether the runtime offers an atomic create-exclusive primitive. **It does
not**: `_writeFile` is `rtWriteFile` (`runtime-adapter.js:802`), an agent-transported whole-file
write with no exclusive-create mode, and no adapter seam exposes one. This TSPEC takes the
read-then-write form and **records the decision** rather than inventing a lock: an
exclusive-create seam would be a new agent transport whose observation (whether the file already
existed) is exactly as racy as the read it replaces. §13 carries it.

### 7.4 The id, proposals, and the intra-pass merge (FSPEC §8.1, §8.2, §5.2)

```ts
failureModeId(phase: Phase, artifact: string): string          // pure, total
targetFor(kind: 1|2|3, artifact: string, id: string): string   // pure
mergeProposals(proposals: Proposal[]): Proposal[]              // pure
parseLogRecords(logText: string|null): {records, notices}      // pure, total
```

**The derivation**, from FSPEC §8.1, as three ordered substitutions:

```js
const slug = artifact.replace(/[/.]/g, "-").toLowerCase()
                     .replace(/[^a-z0-9-]+/g, "-")
                     .replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
return `${phase.toLowerCase()}-${slug}`;
```

Order is fixed here because two orders disagree: collapsing runs **after** the separator
substitution is what makes `pdlc/skills/a-b.md`, `pdlc/skills/a/b.md` and `pdlc/skills/a.b.md` one
id — the collision FSPEC §8.1 prices and AT-R6b fixture 2 asserts. Collapsing first would leave
three ids and silently falsify that fixture.

`targetFor`: kind 1 ⇒ `docs/_constraints/DOMAIN-CONSTRAINTS.md`; kind 2 ⇒
`docs/_decisions/DECISIONS-{id}.md`; kind 3 ⇒ the subject `artifact` itself. The id is passed in
rather than recomputed, so kind 2's target can never be derived from a differently-normalised path
than the one that keyed it.

`mergeProposals` groups by `(failureModeId, action)` — never by kind, never by target — and folds
each group of ≥2 into one:

| Folded field | Rule | FSPEC |
|---|---|---|
| `kind` | the **numerically lowest** in the group (1 outranks 2 outranks 3) | §8.2 precedence |
| `artifact` | the **lexicographically first** candidate, byte order over the canonical paths **as written** | §8.2 tie-break |
| `target` | `targetFor(foldedKind, foldedArtifact, id)` — so `target` follows `artifact` exactly when the folded kind is 3 | §8.2's third note |
| `symptom` | the group's symptoms joined into **one line** with `; ` | §8.2 consequence 1 |
| `elidedKinds` | every distinct kind in the group other than the folded one | §10.4 item 4 |
| `elidedArtifacts` | every candidate path other than the survivor, in byte order | §10.4 item 4, subject axis |

Two properties fall out and are asserted rather than assumed: the fold emits **no** suppression and
**no** reason code (nothing was withheld — AT-R6b's negative half), and it is a pure function of the
group, never of proposal order (byte order is total over distinct strings, and a group's members are
distinct by construction, identical proposals being already one).

`parseLogRecords` is the receive side. It reads each failure-mode record block into a **partial**
record and, for each field the block does not carry, appends one
`ParseNotice{subject, missingField}`. It never fills a default, never rewrites the log, and never
throws. **Which contract skips a partial record is not this function's business** — it hands every
record and every notice to the readers, and each reader applies its own arm (§7.5, §7.6). That is
FSPEC §8.1's "per field, per reader" rule made structural rather than conventional.

### 7.5 Effectiveness, streaks, remediation, the open list (FSPEC §8.3 – §8.7)

```ts
phasesExercised(learningsText: string): Set<Phase>                          // pure
effectivenessTable(records, consumedTexts, config): EffectivenessRow[]      // pure
openPromotionList(records): string[]                                        // pure
remediationChoice(id, records, prStates, headExists): "revision"|"retirement"|null  // pure
```

`phasesExercised` prefers the LEARNINGS' own `Phases exercised` metadata row when present;
otherwise it applies vocabularies §2's mapping to that file's `Harvested from` row, **per file**: a
`CROSS-REVIEW-{role}-{docType}-v{N}` basename decides that docType's phase, `CODE_REVIEW-*` decides
`DOD`, and `POSTMORTEM-{phase}-*` decides that `{phase}` verbatim and takes precedence. Any phase
the mapping cannot decide counts as **not exercised** — the direction that routes to
`insufficient-evidence` and never to a guessed `prevented`.

`effectivenessTable` emits **one row per distinct id in `records`**, in first-seen order, evaluating
the three arms in FSPEC order. Two receive-side arms are structural rather than conditional: a
record with no `failureModeId` contributes **no** row (a row cannot be keyed on an absent id), and a
record with no `phase` contributes a row whose verdict falls to `insufficient-evidence`. Streak
state (`ineffective`, `unmeasurable`) is computed by folding the log's rows **in file order**,
counting only the populations FSPEC §8.5 and §8.7 name — which differ, and are therefore two
separate folds over one row sequence rather than one fold with a flag.

`openPromotionList` returns the ids for which **no** record carries `action: "retire"` with a
`route` other than `"degraded"`. A record short of `action` or `route` cannot close an id (it stays
open); a record short of `failureModeId` contributes **no member at all**. The list's length is what
§7.9's report item 10 prints.

`remediationChoice` evaluates FSPEC §8.5's four rows top-down. It returns `null` on row 1 (the
ladder has ended — the caller records `duplicate-suppressed` and reports the field as `retirement`)
and on the short-`artifact` arm (the file-existence test cannot run, so nothing is proposed).
Row 3's `headExists` is supplied by the caller from one
`_git(["cat-file", "-e", `HEAD:${artifact}`])` probe — a **read**, resolving to the `read-status`
verb of §9.3's invoking-tree domain, never a checkout and never a filesystem stat the runtime
cannot perform.

### 7.6 Routing and suppression (FSPEC §5.1, §6.4)

```ts
routeOf(target: string): Route                                        // pure
enactedByLog(pair, records): {enacted: boolean, passId: string|null}  // pure
enactedByPr(pair, prStates): {enacted: boolean, url: string|null}     // pure
```

`routeOf` normalises the target — repository-root-relative, no leading `./`, no `..` segment, `/`
separators — and returns `"PR"` when it is prefixed by **any member of `MERGE_GUARD_DEFAULTS`**
(imported from `orchestrate-dev.js:48-53`, never copied: a copy would silently survive a change to
the constant, and set-equality with it is AT-R1's whole point). Otherwise it returns `constraints`
for `docs/_constraints/DOMAIN-CONSTRAINTS.md`, `decisions` for `docs/_decisions/DECISIONS-*.md`, and
routes every other consuming-repo path to the proposal file. `guardVerdict` (`:732`) and
`effectiveGuardPaths` (`:709`) are **not** called: both are reachable only from Phase MERGE's ladder
and the advisory-envelope check and both decide about *that run's own* PR, so calling them would
claim an enforcement neither performs. The pass reads the constant and decides for itself.

**Suppression has one key and two carriers**, and each carrier is a separate pure function so
neither can accidentally consult the other's evidence:

- `enactedByLog` is a function of `(failureModeId, action)` **and** `route`, and of nothing else. A
  record whose `route` is `degraded` does not enact. A record short of `failureModeId`, `action` or
  `route` cannot be evaluated ⇒ `absent` ⇒ the promotion is re-proposed. A record short of only
  `passId` **still enacts** — the predicate does not read that field — and returns
  `{enacted: true, passId: null}`, which §7.9 renders with §6.5's literal. This is the one arm
  where the reader's general skip rule is inverted, and it is inverted *in the return type* rather
  than in a caller's conditional, so no caller can get it wrong.
- `enactedByPr` reads the `PDLC-CONSOLIDATION-PROMOTIONS` trailer of PRs observed `open` or
  `merged`. State is read at poll time with no memory: a reopened PR is `open`; a `closed`-unmerged
  PR is not in the key set. §9.2 states the one `gh` call that supplies `prStates`.

### 7.7 The advisory corpus (FSPEC §9.2, §9.3 — T-06)

```ts
parseEscalations(text: string | null): EscalationCounts      // pure, total
seamCandidates(counts): {over: string|null, tie: string[], under: string[]}   // pure
```

The parse target is the **metadata table row**, never the heading. `renderEscalationEntry`
(`orchestrate-dev.js:2763`) emits `| Feature | ${feature} |` at `:2782` and `| Seam | ${seam} |` at
`:2783`; the heading it emits at `:2776` carries the same two values joined by em dashes, which a
feature name containing an em dash makes ambiguous. `parseEscalations` therefore splits the text on
`/^## /m` into entries and, within each, matches
`/^\|\s*Feature\s*\|\s*(.+?)\s*\|\s*$/m` and the corresponding `Seam` row. An entry missing either
row is **skipped with a parse notice** and attributed to no key; the read never aborts (E-12).

`corpusState` is `absent` when `_readFile` returned `null` — which covers unreadable as well as
missing, and is the fail-safe direction the FSPEC fixes ("never as empty: the two codes make
different claims") — `empty` when the text parses to zero entries, and `present` otherwise.

`seamCandidates` ranges over **every entry in the file**: no filter on `Feature`, none on date, no
relation to the consumed set (BR-37a). Over-escalation requires both conjuncts — ≥2 distinct
features **and** a total strictly exceeding every other seam's; a tie returns `tie` and no
candidate. Under-exercise requires a non-empty corpus with ≥1 *other* seam escalating and this seam
at zero. Seam identity comes from `ADVISORY_SEAMS` (`orchestrate-dev.js:1669`), imported.

### 7.8 Configuration (FSPEC §11 — the `parseAdvisoryConfig` precedent)

```ts
parseConsolidationConfig(text: string | null): ConfigParse    // pure, total
```

Structurally identical to `parseAdvisoryConfig` (`orchestrate-dev.js:1682`), whose five observed
states are verified at HEAD (`:1689`, `:1693-1696`, `:1698`, `:1700-1701`, `:1705-1713`) and
reproduced key-for-key: absent file, unparseable JSON, missing section, non-object section
(`sectionMalformed: true`), and per-key type rejection that names the key in `invalidKeys` while
leaving every other configured key at its configured value.

It is a **separate function, not a generalised one.** Refactoring `parseAdvisoryConfig` into a
shared parameterised parser would edit a guard-set file for a second reason and put a shipped,
tested advisory path at risk for a cosmetic gain; the FSPEC's reuse obligation is over the *rung
ladder*, which is behaviour, not over a config parser, which is twelve lines of shape. The
duplication is bounded and is pinned by a test that asserts the two functions agree on all five
states (§11.3).

`pluginRepository` is the one key whose failure is not a parse fallback: a non-null value that does
not resolve is `repository-unresolved` and the §9 degradation, decided at the PR-route attempt, not
at parse time.

### 7.9 Rendering — the log records and the report body (FSPEC §10.2 – §10.4)

```ts
renderConsumedPair(passId, basenames): string          // §7.1, one whole record
renderFailureModeRecord(record): string                // one whole record
renderEffectivenessTable(rows): string                 // one whole record
renderTerminalRow(state): {text: string, dropped: ReasonCode[]}
renderReportBody(state): string
```

Four appends in a fixed order (consumed pair → failure-mode records → effectiveness table →
terminal row), **one `_appendFile` call per record**, never a batch. The granularity is the
contract, not an implementation detail: it is what makes a partially-routed pass readable from the
log (AT-M9's discriminating conjunct), and it is why the failure-mode record is appended **as each
proposal routes** rather than after the routing loop.

`renderTerminalRow` emits the FSPEC §10.3 field set, splitting exactly as that section does:
enumerated-class values are drawn from §6.4's frozen catalogues; free-form values (`pass:`, `date:`,
`consumed:`, `branch:`, `deferred:`, `pr:`, `suppressed-by:`, `rung:`) are data. It returns the
codes it **dropped** as illegal-with-this-status (§6.4), so the caller can put them in the report
body — the mechanism by which ER-4's named loss stays legible rather than silent.

`suppressed-by:` renders `{id}:{action} → {evidence}` with exactly two evidence spellings, chosen by
the suppression's own carrier and never by the writer: a PR URL, or `pass:{passId}` — degrading to
`pass:(unavailable)` (§6.5) when the enacting record carried no `passId`. The entry is never
dropped, and `pass:undefined` is unproducible because the renderer takes `passId: string | null`
and maps `null` to the literal.

`renderReportBody` emits the ten items of FSPEC §10.4 in order, each **present even when empty**
(DC-01 receive-side totality: a reader must be able to tell "no promotions" from "the section was
dropped"). Item 4 names each promotion's route and, for a merged promotion, its `elidedKinds` and
`elidedArtifacts`; item 10 prints `openPromotionList(...).length` as a number.

## 8. Reuse of the advisory rung ladder, and the bundle wiring

### 8.1 The signature widening, exactly (T-05)

`resolveAdvisoryRung`'s current signature is `({ _agent, _log, _state, prompt })`
(`orchestrate-dev.js:1833`) and its inner `dispatchAt` calls
`_agent(ADVISORY_RUNG_SKILL, prompt, { model })` at `:1841`. The edit is one destructured parameter
and one substitution:

```js
export function resolveAdvisoryRung({ _agent, _log, _state, prompt, skill = ADVISORY_RUNG_SKILL }) {
  …
  function dispatchAt(model) {
    return _agent(skill, prompt, { model });          // was: ADVISORY_RUNG_SKILL
  }
```

Four constraints on that edit, each of which the implementation must satisfy and a test must
falsify:

1. **Optional, defaulting to `ADVISORY_RUNG_SKILL` (`:1797`).** The shipped call site
   (`:3132`, inside `runAdvisorySeam`) passes no `skill` and is not edited. AT-M10 is the
   regression: the resolver called without `skill` dispatches `"se-review"` on the primary rung, on
   the fallback rung, and on the memoised path.
2. **Threaded to the one `_agent` call, therefore to every path.** `dispatchAt` is the sole
   dispatch site — it is declared at `:1840`, and the memoised path (`:1844-1849`) and the two
   ladder rungs (`:1851`, `:1861`) all
   go through it — so a pass cannot resolve on one skill and dispatch on another. This is why the
   parameter is threaded through `dispatchAt` rather than passed separately at each rung.
3. **Exactly one ladder remains.** No second constant, no second resolver, no per-caller model
   list. `MODEL_ADVISORY` (`:1652`) and `MODEL_ADVISORY_FALLBACK` (`:1653`) stay module-private and
   are not re-exported; the corpus baseline §3's "reuse the resolver, do not restate the ladder" is
   satisfied by import, so its drift-observable escape hatch is not taken.
4. **The function stays non-`async` and `.then`-chained.** Its doc comment (`:1819-1826`) states
   that the hop count is load-bearing: the shipped caller races the returned promise against a
   `_sleep`-built deadline, and an `async` body would add microtask hops and let the deadline win on
   hop count. Adding a defaulted parameter changes no hop; converting the body would break a caller
   this feature does not otherwise touch.

**The pass's own call is a new call site, not an instance of a shipped pattern.** The queue threads
`rungState` into `runAdvisorySeam` (`orchestrate-queue.js:1245-1256`), not into the resolver; the
resolver's only shipped call site is `orchestrate-dev.js:3132`. The pass therefore owns its own
`{ resolved: null }` state (the shape `orchestrate-queue.js:1120` initialises) and calls the
resolver **bare** — no deadline, no `_sleep`, no `{kind:"preempted"}` fifth shape. That shape is the
shipped call site's disposition (`:3130-3134`), not the resolver's, and the pass has no seam budget
to enforce; so FSPEC §2.6's four rows stay set-equal to the resolver's own return and throw set, and
a hung dispatch is bounded only by the runtime's no-progress watchdog — recoverable through §7.3's
stale-lock reclaim, which is why that reclaim is not merely a nicety.

Every dispatch the pass makes (step 8 clustering, step 12 remediation authoring, step 13 proposal
authoring) goes through the same resolver with the same `rungState`. Memoisation makes FSPEC §2.6
rows 2 and 3 unreachable after step 8 (`:1844-1849`: with `_state.resolved` set the cached rung is
used and no ladder is entered); row 4 remains reachable at every dispatch, which is exactly why
S-11c exists.

### 8.2 The bundle, and how it reaches the resolver (T-02)

**Decision: inline, as the two shipped bundles already do.** `build-runtime.mjs` reaches across
modules only by inlining a whole module body (`bundles`, `:448-471`); the queue bundle is
`[QUEUE_META, BANNER, adapter, devModule, queueModule, QUEUE_ENTRY]` (`:450-453`) and `pdlc-cli.mjs`
wraps the same dev body as `__dev` (`cliArtifact`, `:291`). The consolidation bundle takes the same
form:

```js
{
  file: "consolidate-learnings.bundle.js",
  contents: stripCommentsForRuntime(
    [CONS_META, BANNER, adapter, devModule, consModule, CONS_ENTRY].join("\n\n")
  ),
}
```

with `consModule = wrapModule("__cons", stripModuleSyntax(consSource), ["main", "meta"], prelude)`
and the prelude re-binding the four reused symbols the same way `queueModule`'s does
(`:113-122`):

```js
"const resolveAdvisoryRung = __dev.resolveAdvisoryRung;",
"const MERGE_GUARD_DEFAULTS = __dev.MERGE_GUARD_DEFAULTS;",
"const mergeCommandFor      = __dev.mergeCommandFor;",
"const gitWithLockRetry     = __dev.gitWithLockRetry;",
```

Two of those four are not on `devModule`'s current export list (`:86-105`), which publishes
`resolveAdvisoryRung` and `commitPaths` but not `MERGE_GUARD_DEFAULTS`, `mergeCommandFor` or
`gitWithLockRetry`. The list therefore gains three names. `gitWithLockRetry` is **not** exported
from `orchestrate-dev.js` today (it is a module-private `async function` at `:8617`); exporting it
is part of this feature's edit to that file, and it is a pure addition — no call site changes.

**What inlining decides, stated because T-02 asks.** The consolidation bundle inherits
`orchestrate-dev`'s module-level constants by value at build time, so a drift in the widened
resolver reaches **four** tracked artifacts, not three: `dist/orchestrate-dev.bundle.js`,
`dist/orchestrate-queue.bundle.js`, `dist/pdlc-cli.mjs` and the new
`dist/consolidate-learnings.bundle.js`. All four are rebuilt by one `build-runtime.mjs` run and all
four are diffed by CI's `Generated artifacts are in sync` job, so a commit that rebuilds three of
four fails it. The alternative — a fifth artifact holding only the resolver, imported by all — is
not available: the runtime forbids `import` entirely.

`CONS_ENTRY` mirrors `QUEUE_ENTRY` (`:185-213`): it reads `args` (a bare string or an object) into
the one optional input, spreads `rtConsInjections()`, and returns `await __cons.main({…})`.
`CONS_META` is a hand-written pure literal, first statement, carrying `name`, `description`,
`whenToUse`, one declared input (`{name: "direct", type: "boolean", required: false}` — the manual
entry point of FSPEC §2.1) and a `phases` list of the four operator-visible stages
(Enumerate / Trigger / Promote / Report). It is hand-written for the reason the file's own comment
gives at `:125-126`: `meta` must be a pure literal and the first statement, so each bundle carries
its own copy rather than re-exporting the module's.

### 8.3 The manifest and the release stamp

`distribution-manifest.json` carries one row per artifact with its own `sha1` (ids
`orchestrate-dev`, `orchestrate-queue`, `pdlc-cli` at HEAD). The rebuild adds a fourth row,
`consolidate-learnings`, **and re-stamps the three existing rows** whose bytes changed because the
dev module they inline changed. That is a property of the manifest, not a per-feature choice: it is
touched once per artifact the rebuild changes, not once per feature.

`sync-workflows.sh` needs no edit: it copies every row of the manifest, so the new bundle reaches
`.claude/workflows/` by the shipped mechanism. `--check` will report the new row as `missing` until
the first sync, which is the designed signal, not a regression.

### 8.4 Capturing the resolver's `_log` stream (T-04)

`ADVISORY_MODEL_FALLBACK:` is emitted through `_log` (`orchestrate-dev.js:1858-1860`, the template
literal at `:1859`) and never appears in the resolver's return value. FSPEC §10.4 item 2 and AT-M7
require that line **verbatim** in the report body, so the pass cannot pass its plain `_log` through.

**Mechanism: a tee.** `main` builds

```js
const dispatchLog = [];
const teeLog = (msg) => { dispatchLog.push(String(msg)); _log(msg); };
```

and passes `teeLog` as the resolver's `_log`. The operator still sees every line on the run log
(nothing is swallowed), and the pass holds the text it must render. The same buffer carries FSPEC
§2.6 row 4's error message: the resolver returns `{kind: "dispatch-error", err}` (`:1857`, `:1867`),
so `main` pushes `String(err?.message ?? err)` onto `dispatchLog` at the point it dispositions the
row — one capture serving both report-body obligations, which is what T-04 asks for.

The buffer is **report-body only**. It never reaches the log row (whose fields are closed, §7.9),
never reaches an artifact, and is not a vocabularies §1 value — so it cannot breach REQ §4b.

## 9. The pull-request route — clone, commit, credential

### 9.1 The temporary clone (T-03)

```ts
openClone(passId, config, seams): Promise<{dir: string} | {failure: ReasonCode, detail: string}>
```

Three steps, all through seams, none of them touching the invoking tree's refs:

1. `dir = await _makeTempDir(passId)` (§5.3). `null` ⇒ `{failure: "api-failure"}` — there is no
   fallback into the invoking tree, because AC-3.8 forbids one outright.
2. `remote` = the clone source. In the same-repo case (`pluginRepository == null`) it is the
   invoking repository's **origin URL**, read with `_git(["remote", "get-url", "origin"])` — a
   non-mutating read of the invoking tree, resolving to `read-status` in §9.3's verb table. Cloning
   the *working tree path* is deliberately not done: it would carry the tree's local branches and
   its possibly mid-pipeline HEAD, and FSPEC §6.1 requires the clone to be cut from the **fetched
   default branch**. In the two-repo case it is `https://github.com/{pluginRepository}.git`. An
   `origin` that does not resolve is `repository-unresolved`.
3. `_git(["clone", "--depth", "1", "--single-branch", remote, dir])`. `--depth 1` because the clone
   exists only to carry one commit per edit and be pushed; nothing here reads history. `git clone`
   checks out the remote's default branch, which is exactly the FSPEC's "cut from the fetched
   default branch" and needs no separate `fetch` — hence `fetch` sitting in §9.3's
   *permitted-but-not-obliged* column rather than in the obliged one.

Every subsequent call in the clone is `_git(["-C", dir, …])`. **Removal**: the pass issues no
removal. `mktemp -d` places the directory under the OS temp root, which the OS reclaims; a removal
step would be a mutating call in a domain whose verb set §9.3 closes, and a failed removal would
have to be dispositioned into a vocabulary that has no row for it. The directory is small (a
depth-1 clone) and its residue is inspectable, which matches AC-3.6's decision to leave the
`consolidation/{passId}` branch undeleted for the same reason.

### 9.2 Branch, commits, body, and the PR calls

| Step | Call | Verb (§9.3) |
|---|---|---|
| branch | `_git(["-C", dir, "checkout", "-b", "consolidation/" + passId])` | `create-branch` |
| per edit | write the file in the clone, then `_git(["-C", dir, "add", "--", path])` and `_git(["-C", dir, "commit", "-m", msg + trailer, "--", path])` | `add`, `commit` |
| push | `_git(["-C", dir, "push", "origin", "consolidation/" + passId])` | `push` |
| duplicate poll | `_ghRun(mergeCommandFor("consolidationPrs", {repo}))` | `read-pr` |
| open | `_ghRun(mergeCommandFor("consolidationCreate", {…}))` | `create-pr` |

Writing a file **inside the clone** uses the same `_writeFile` seam with a path under `dir`; the
seam is path-addressed, so no new capability is needed. NFR-1 is untouched: the only guard-set path
the pass ever writes is inside the throwaway clone, never in any tree the invoking repository
checks out.

`mergeCommandFor` (`orchestrate-dev.js:319`) is extended with two surfaces rather than a second
builder being written. Its doc comment (`:310-312`) states the rule in Phase MERGE's scope — "the
SOLE place every `gh` command string used by Phase MERGE is built, so a single audit of this
function's body accounts for every literal command the phase can run" — and this feature **widens
that scope rather than opening a second builder**: the audit property is worth more repo-wide than
scoped, and the alternative puts two `gh` string builders in one bundle. The comment is edited to
say so:

```
case "consolidationPrs":   // one call supplies §7.6's prStates
  return `gh pr list --repo ${params.repo} --state all --limit 100 --search "PDLC-CONSOLIDATION-PASS in:body" --json url,state,body`;
case "consolidationCreate":
  return `gh pr create --repo ${params.repo} --head ${params.head} --base ${params.base} --title ${params.title} --body-file ${params.bodyFile}`;
```

`--body-file` rather than `--body` is deliberate and load-bearing for NFR-2/§7.4: the body is
written to a file in the clone, so no part of it is ever an argv element in a command string the
adapter logs on failure. `--state all` with a `--json state` field is what lets §7.6 apply the FSPEC
state table (`open`/`merged` in the key set, `closed`-unmerged not) with **one** call.

**The credential never becomes a JS value.** When `_envPresent(credentialEnv)` is true, the pass
prefixes the transported command with the variable *by name*:
`GH_TOKEN="$PDLC_PLUGIN_REPO_TOKEN" gh pr create …` (the actual name coming from config). The shell
inside the transport expands it; the pass holds only the name. That is what makes FSPEC §7.4's
"never echoed back through a subprocess argument" structurally true rather than a review promise —
there is no code path on which the value exists in the module. The same prefix form carries the push
(`_git` takes argv, so the push uses `-c http.extraheader` only when a token is present; with
`local-gh` it uses the ambient credential helper and no prefix at all).

`credential:` resolution order is §7.2's: variable present ⇒ `present (redacted)`; else a working
`gh` auth probe (`_ghRun("gh auth status")`) ⇒ `local-gh`; else `absent` + `credential-unavailable`.
It runs **at the first PR-route attempt and at most once per pass**, so a pass with no guard-set
proposal never runs it and reports `absent` as its null.

### 9.3 The three seam domains and their verb sets (FSPEC §6.5, inherited)

The FSPEC froze these sets and made widening a **recorded TSPEC decision**. This layer records **no
widening**: the sets below are transcribed unchanged at FSPEC v11.1.

| Domain | How a call is classified | Obliged | Permitted, not obliged | Absent always |
|---|---|---|---|---|
| PR seam | every `_ghRun` call | `read-pr`, `create-pr` | — | `merge`, `enable-auto-merge`, `merge-pr`, `squash-merge`, `close-pr`, `update-pr` |
| git, invoking tree | `_git` whose argv does **not** begin `["-C", cloneDir]` | `add`, `commit` | `read-branch`, `read-status` | `checkout`, `switch`, `stash`, `reset`, `rebase`, every merge verb |
| git, clone | `_git` whose argv begins `["-C", cloneDir]`, plus the `clone` call itself | `clone`, `create-branch`, `add`, `commit`, `push` | `fetch`, `read-branch`, `read-status` | every merge verb |

Classification is by **resolved operation**, not function name: the resolver maps an argv or a
command string to a verb, so `checkout -b` and `switch -c` in the clone both resolve to
`create-branch`, and a merge issued through any spelling of `_ghRun` resolves to `merge`. The
classifier is a small exported pure function, `resolveSeamVerb(domain, argvOrCommand)`, so the spy
in §11.3 reads the contract's own classification rather than re-implementing it — and a verb the
classifier cannot resolve returns `"unknown"`, which is in no permitted set and therefore fails the
containment assertion rather than passing silently.

Two calls in §9.1 and §7.5 use the invoking tree's *permitted* reads: `git remote get-url origin`
and `git cat-file -e HEAD:{path}` both resolve to `read-status`; the branch name for `branch:` comes
from `git rev-parse --abbrev-ref HEAD` (`read-branch`), the shipped observation `readHeadBranch`
(`orchestrate-dev.js:3520`) makes through `_git` at `:3524`.

### 9.4 The consuming-repo commit (FSPEC §5.4)

```ts
commitConsumingRepoPaths(paths, message, seams): Promise<{committed: boolean, reason?: "writes-uncommitted"}>
```

Two calls, pathspec on **both**, mirroring `commitQueueRow` (`orchestrate-queue.js:1576`; add
`:1577`, commit `:1580-1585`) and `commitAdvisoryRecord` (`:1615`):

```
git add    -- {paths}
git commit -m {msg} -- {paths}
```

`paths` is exactly the §5.4 write set the pass actually wrote — `DOMAIN-CONSTRAINTS.md`,
`DECISIONS-{topic}.md`, `.consolidation-log.md`, `CONSOLIDATION-PROPOSAL-{passId}.md` — and
**never** `docs/_decisions/.consolidation-lock`, which appears in no pathspec of any pass. Never
`-a`, never pushed. `commitPaths` (`orchestrate-dev.js:8669`) is explicitly not used: its commit is
a plain `git commit -m` with no pathspec (`:8690`), which would sweep a mid-pipeline staged index
into the pass's commit.

Both calls go through `gitWithLockRetry` (`:8617`) for the `index.lock` class. A "nothing to commit"
result is a **return, not a warning** — the `NOTHING_TO_COMMIT_RE` treatment
`commitAdvisoryRecord` uses (`orchestrate-queue.js:1631-1635`) — so an empty stage records no
`writes-uncommitted`. Any other refusal records `writes-uncommitted`, leaves the writes correct on
disk, and **does not change the terminal status**.

## 10. Error handling

## 11. Test strategy

## 12. Traceability

## 13. Risks and open items handed downstream
