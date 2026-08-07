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
`:56`; `ADVISORY_SEAMS` `:1669`) and is what lets §11.3's oracle range over the module's own
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

## 8. Reuse of the advisory rung ladder, and the bundle wiring

## 9. The pull-request route — clone, commit, credential

## 10. Error handling

## 11. Test strategy

## 12. Traceability

## 13. Risks and open items handed downstream
