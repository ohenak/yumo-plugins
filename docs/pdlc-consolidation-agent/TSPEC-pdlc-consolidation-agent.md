# TSPEC — pdlc-consolidation-agent

| Field | Value |
|---|---|
| Upstream | REQ → FSPEC → **TSPEC** |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer,product-manager}-TSPEC-v{N}.md` |
| LEARNINGS | `docs/pdlc-consolidation-agent/LEARNINGS-pdlc-consolidation-agent.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.4 | 2026-08-06 |

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
| T-08 | Shared code vs. two implementations for the corpus enumeration | §7.1; the decision itself is §13.1 row 6 (**two implementations**). The predicate half is held **equal** (AT-P7); the enumeration half is held by **two literal pins** (§7.1) with §10.4's two divergence classes as the accepted residue, and §13.3 raises the relaxation of REQ `:115-116` upstream |
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
route, verdict or field name appears here. Every enumerated value written to a log row, an artifact
or a record is a `pdlc-consolidation-vocabularies.md` §1 row at `Version` 1.4, and every literal
this document *does* pin (§6.5) is a value §1 has no row for and the FSPEC explicitly deferred under
DEC-LAYER-01.

Two in-module control values are **not** vocabulary and are never rendered: `routeOf`'s
`"proposal-file"` outcome (§7.6) and `enumerateCorpus`'s `{unlistable: true}` (§7.1). Each names a
branch the FSPEC states and §1 has no row for; each is recorded — the first as ER-6 in §12.4, the
second as §10.3 row 1a's no-reason-code disposition — and neither is minted into a catalogue,
because minting one would be the REQ §4b breach this check exists to catch.

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
| `pdlc/workflows/consolidate-learnings.js` | the pass — one ES module, `export default async function main({…})`, every IO through a defaulted injection parameter | mirrors `orchestrate-queue.js`'s shape (`:1033`), so `build-runtime.mjs` can strip and wrap it with the existing `stripModuleSyntax` / `wrapModule` pair (`build-runtime.mjs:45`, `:55` — the declarations, not their doc comments at `:44` / `:54`) with no new build machinery |
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
| `pdlc/workflows/runtime-adapter.js` | two new adapter functions — `rtEnvPresent` and `rtMakeTempDir` — plus a `rtConsInjections()` bundle beside `rtDevInjections` (`:1086`); **and** the absolute-path widening of `rtWriteFile` (`:802-811`) **alone**, whose prompt today says `relative to the repository root` (`:805`, the only occurrence of that string in the file). `rtReadFile` is **not** modified — see §5.6(a) | §5.3, §5.6, §9.1, §9.2 |
| `pdlc/workflows/dist/orchestrate-dev.bundle.js`, `dist/orchestrate-queue.bundle.js`, `dist/pdlc-cli.mjs`, `dist/distribution-manifest.json` | rebuilt **in the same commit** as the two rows above | §8.3 |
| `pdlc/hooks/scripts/nudge-consolidation.sh` | `:28`'s single `os.path.join` glob replaced by a named two-literal `CORPUS_GLOBS` tuple and a comprehension over it, widening the corpus to `docs/completed/*/` and giving §7.1's pin (b) a declaration to read; `:41` predicate scoped to the two §3.2 regions; `:29-30`'s early exit replaced by a `pending = []` fall-through; **and** one env-gated debug line that emits the pending **set** on stderr, without which AT-P7 has no oracle (§7.1). All four are **production** edits in one shipped file ⇒ one owning task | §7.1 |
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
would match at every depth, so any future file of that basename anywhere in the tree would be
ignored without anyone deciding it should be — which is what anchoring exists to prevent. The
gitignore(5) ground is the whole argument; no fixture is claimed here, because §11 creates none of
that name.

**T-07 is falsified by a test, not by a maintainer check.** `consolidationBuild.test.js` reads the
tracked `.gitignore` and asserts the comment line and the pattern line **verbatim and adjacent**, in
the shape `runtimeBundle.test.js` already uses for source-text assertions (`:1570-1584`). Text that
CI cannot read can be rewritten slash-free in one commit and nothing goes red; §12.2 names the test.

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
 ├─ enumerateCorpus            ←_git (ls-files) §7.1
 │   ├─ parseCorpusListing             (pure)   §7.1
 │   └─ classifyCorpus                 (pure)   §7.1
 ├─ cadenceDatum / triggerFor          (pure)   §7.2
 ├─ mintPassId                         (pure)   §7.2
 ├─ takeMarker         ←_checkFile/_readFile/_writeFile §7.3
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
 ├─ routeProposal                      (pure)   §7.6   ← the only caller of routeOf
 │   ├─ routeOf                        (pure)   §7.6
 │   ├─ consuming-repo write   ←_appendFile
 │   ├─ proposal file          ←_writeFile      §7.9  renderProposalFile
 │   └─ PR route               ←_git/_ghRun/_envPresent/_makeTempDir  §9  renderPrBody
 ├─ renderTerminalRow / renderReport   (pure)   §7.9
 └─ commitConsumingRepoPaths   ←_git             §9.4
```

**Dependency direction is one-way.** No pure function calls another module's impure helper, and no
pure function closes over `main`'s scope. `main` threads a single `PassState` (§6.1) through the
sequence, which is what makes FSPEC §2.2's "terminates = a jump to step 14" implementable as an
early `return await finishPass(state, …)` rather than as an exception (§10.1, §10.2).

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
  _checkFile(path: string): Promise<CheckReply>;            // existence/non-empty gate — §7.3
  _listFiles(dirPath: string): Promise<ListReply>;          // NOT string[] — see below
  _git(argv: string[]): Promise<{ok: boolean; stdout: string; stderr: string}>;
  _ghRun(command: string): Promise<{ok: boolean; stdout: string; stderr: string}>;
  _log(message: string): void;
  _phase(label: string): void;

  // ── the two seams this feature adds (§5.3) ──
  _envPresent(name: string): Promise<boolean>;              // NEVER returns the value
  _makeTempDir(passId: string): Promise<string | null>;     // absolute path, or null on failure
}

// The listing seam's real, closed contract at HEAD (runtime-adapter.js:905-931;
// the same four-member set is frozen for the doubles as LIST_FAILURE_VALUES,
// __tests__/helpers/seams.js:58-63).
// The presence probe's contract at HEAD (runtime-adapter.js:817-831). What §7.3 depends on
// is ONLY that BOTH `file_empty` and `file_missing` are treated as absent; nothing in this
// document reads WHICH reason came back, and no row asserts it. That is why the marker's
// `present` flag comes from here and not from _readFile. Do not build on the distinction
// between the two reasons: the two implementations disagree on where the boundary sits.
// `rtCheckFile` decides emptiness by BYTE SIZE (`test -s`, runtime-adapter.js:820), while
// `fakeFs.checkFile` decides it by TRIMMED CONTENT (`String(self.files[path]).trim() === ""`,
// __tests__/helpers/seams.js:298) — so a marker holding a single newline is {ok:true} in
// production and {ok:false, reason:"file_empty"} under the double. They agree on "" and on a
// missing file, which is the whole set of states this feature can produce (release writes "";
// §7.3), so the divergence is unreachable here — and is recorded so it stays that way.
type CheckReply = {ok: true} | {ok: false; reason: "file_missing" | "file_empty"};

type ListReply = {ok: true; files: string[]}
               | {ok: false; reason: "dir_missing" | "not_a_directory"
                                   | "unreadable" | "bad_argument"};

// NOT a seam. A module-level default, the shipped pattern (orchestrate-dev.js:1396,
// `_now = () => Date.now()`) — see §5.6.
_now(): number;
```

**`_listFiles` is transcribed, not simplified.** An earlier draft of this section declared it
`Promise<string[]>`, which is the shape the *doubles* have and not the shape the adapter has: an
implementation that reads `{ok:false,…}` as truthy and iterates it yields zero files with no error,
so the bug is silent and no absence-only assertion can see it. DC-01 obliges the closed/total form on
both sides. This pass does not in fact call `_listFiles` (§7.1 enumerates through `_git`), but the
seam stays in the protocol because `main()` threads the standard injection bundle, and a contract
stated wrongly in a protocol is a contract a future edit will code against.

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
| `_writeFile` | **repo-root-relative today, and that is a blocker this feature must clear** — `rtWriteFile`'s prompt reads "Write the following content to `"${path}"`, **relative to the repository root**" (`runtime-adapter.js:805`) | §5.6(a) states the widening |
| `_readFile` | **already absolute-safe; no change** — `rtReadFile` (`:493`) reaches disk through `rtReadProbe` (`:369`) and the chunk read, both of which transport a shell command (`[ ! -f "${path}" ]`, `wc -c < "${path}"`, `sed -n`) prefixed by a *cwd* instruction ("Run this exact command from the repository root", `:374`). A cwd instruction resolves an absolute `${path}` verbatim; there is no path-resolution clause to widen. `grep -n "relative to the repository root" pdlc/workflows/runtime-adapter.js` returns exactly one line, `:805`, inside `rtWriteFile` | §5.6(a) states why nothing changes |
| `_git` | `["-C", dir, …]` and `["ls-files", …]` are the only two forms this pass uses to reach a tree | §7.1, §9.3 |

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
| `_agent`, `_readFile`, `_writeFile`, `_appendFile`, `_checkFile`, `_listFiles`, `_git`, `_log`, `_phase` | the module's own `default*` (the `orchestrate-queue.js:1034-1046` pattern) | ordinary operation **under jest only** — in the runtime every one of them throws; see below |
| `_now` | `Date.now` — a **module-level default, not an adapter seam** (§5.6) | ordinary operation |
| `_ghRun` | `null` | the PR route degrades with `api-failure` before any call is attempted; the proposal file still carries the diff (§10.3) |
| `_envPresent` | `null` | treated as "no credential variable observable" ⇒ §7.2 falls through to the `local-gh` probe, then to `absent` |
| `_makeTempDir` | `null` | the PR route degrades with `api-failure`; the pass never falls back to working in the invoking tree, which AC-3.8 forbids outright |

Each `null` default is the FSPEC's fail-safe direction, not a new branch: an uninstalled capability
degrades the PR route and never touches the invoking tree, never halts the pass, and never reads as
a credential the pass does not have.

**"Ordinary operation" is a jest-only claim, and for `_checkFile` that matters.** The
`orchestrate-queue.js:1034-1046` pattern this row cites obtains `fs` through a dynamic import —
`defaultReadFile` is `const { readFileSync } = await import("fs")` (`orchestrate-queue.js:948-955`) —
and the workflow runtime has no `import()` and no `fs` (`build-runtime.mjs` header; the same
constraint §4.3 states). So in the bundle these defaults are **not** ordinary operation: they throw.
That is tolerable for the seams the pass drives on every path (`_readFile`, `_git`) because the pass
dies at step 1 and someone notices. `_checkFile` is the exception, and the difference is the whole of
§7.3's safety: its only consumer is a probe that is *supposed* to be negative on a healthy tree, so a
default that returned a legal `{ok:false, reason:"file_missing"}` on failure would be
indistinguishable from a quiet tree — `markerVerdict` would return `free` on every pass, AC-1.3's
mutual exclusion would be off in production, and every L2 fixture would stay green because the
`refused` path is exercised only through `fakeFs`. **`defaultCheckFile` therefore fails loudly**: it
throws on any I/O failure and never returns a `CheckReply`. It deliberately does **not** copy the
never-throw internal contract of the shipped `checkFileNonEmpty`, whose every catch returns
`{ok:false, reason:"file_missing"}` (`orchestrate-dev.js:3688-3692`) — that shape is right for a
caller deciding whether a *document* exists and wrong for one deciding whether a *lock* is held.

The load-bearing consequence is that an unwired seam must be caught by an assertion, not by a
default: §12.2's `rtConsInjections()` set-equality row is what makes "the composition root hands over
every §5.1 member" falsifiable. It exists because this repo has shipped the omission once already —
`runtime-adapter.js:1098-1100` carries the note in its own words ("`_writeFile`'s adapter existed
since the first bundle but was never in this object") — and the repair's precedent test
(`adapterProbe.test.js:253-258`, "wires all three into `rtDevInjections`") is the shape, widened from
per-name containment to set equality because §5.1 is an enumerated contract.

### 5.6 One adapter contract this feature changes, one it deliberately leaves alone, and the clock it does not

**(a) `_writeFile` gains absolute paths; `_readFile` needs nothing.** §9.2 writes the guard-set edit
and the PR body *inside the clone*, whose directory comes from `mktemp -d` (§5.3) and is therefore
**outside the repository**. `rtWriteFile`'s shipped prompt says the opposite of what that needs — it
instructs the agent to resolve the path "relative to the repository root"
(`runtime-adapter.js:805`) — so this is a real capability the feature must add, not a path the
shipped seam already serves.

The **read** side is a different case, and an earlier draft of this section got it wrong. There is no
read-side widening, because there is nothing to widen: `rtReadFile` (`:493`) never states a
path-resolution rule at all. It reaches disk through `rtReadProbe` (`:369`) and the chunked line
read, each of which transports a **shell command** — `if [ ! -f "${path}" ] || [ ! -r "${path}" ]`,
`wc -c < "${path}"`, `shasum -a 256 "${path}"` (`:374-378`) — under the *cwd* instruction "Run this
exact command from the repository root" (`:374`). A cwd instruction is not a path-resolution
instruction: every one of those shell forms resolves an absolute `${path}` verbatim today. The
measurement that settles it: `grep -n "relative to the repository root" pdlc/workflows/runtime-adapter.js`
returns **exactly one** line at HEAD, `:805`, inside `rtWriteFile`. This is recorded positively so
that a later reader does not "harmonise" the two prompts and add a clause with no behavioural motive.
It is also consistent with what §7 and §9 actually do inside the clone: the clone traffic is *writes*
(the guard-set edit, the `--body-file` body) plus `_git`; no `_readFile` call with an absolute path
appears anywhere in this document.

The widening is therefore **one clause in one prompt**, `rtWriteFile`'s:

> …to `"${path}"` — relative to the repository root when the path is relative, and **verbatim when
> the path is absolute** (a leading `/`). Do not resolve it against the repository root in that case.

Three properties keep the widening bounded: it is **additive** (every relative path behaves exactly
as it does today, which `runtimeBundle.test.js`'s shipped adapter assertions still pin); it is
**non-mutating of any tracked tree**, because the only absolute paths this pass ever forms come from
`_makeTempDir`'s reply and are never constructed in-module (§5.3); and it is **falsified**, not
reviewed — §11.3(e) states the adapter-source assertion that pins `rtWriteFile`'s widened clause
verbatim (one prompt, not two), and §11.6 no longer exempts it. Routing the clone's writes through `_git` instead was
rejected: git has no write-a-working-tree-file verb short of `hash-object -w` plus `update-index`,
which is three mutating calls in the clone domain to replace one path argument.

**(b) `_now` is a module-level default, not a seam.** `rtDevInjections` (`runtime-adapter.js:1086-1110`)
supplies no clock: its members are `_agent`, `_parallel`, `_pipeline`, `_phase`, `_log`, `_checkFile`,
`_readFile`, `_hashFile`, `_checkCi`, `_mergeWorktree`, `_writeFile`, `_appendFile`, `_listFiles`,
`_git`, `_ghRun`, `_runCommand` and the probe seams. The shipped pattern is the module-level default
`_now = () => Date.now()` (`orchestrate-dev.js:1396`), and this pass takes it.

The consequence is observable and is stated so a test author knows what to pin: `Date.now()` in the
bundle runs in the **workflow host process's** timezone, not in an operator-chosen one. §7.2's
`today` — the `{YYYY-MM-DD}` half of `passId` — and `cadenceDatum`'s day comparisons therefore both
read the host's local calendar, and a pass minted either side of host-local midnight lands on
different dates. Every `today` is passed *into* the pure functions, so no L1 test needs a clock; the
L2 suites pin `TZ` explicitly (`fakeNow` / `FIXED_NOW_MS`, `mergeDoubles.js`) rather than inheriting
the runner's.

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

`FailureModeRecord.route` is `Route`, the four-member union — so a promotion routed to the proposal
file records `"degraded"` until ER-6 lands (§7.6, §12.4). `FailureModeRecord` is a **closed
eight-field record on both sides** (DC-01): the writer emits all
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
enumerateCorpus(_git): Promise<{files: CorpusFile[]} | {unlistable: true, detail: string}>
parseCorpusListing(stdout: string): CorpusFile[]                          // pure, total
classifyCorpus(files: CorpusFile[], logText: string | null): Predicate     // pure
renderConsumedPair(passId: string, basenames: string[]): string           // pure
```

**Enumeration is one `_git` read, not a directory walk.** The seam a directory walk would need does
not exist. `rtListFiles` (`runtime-adapter.js:905`) transports `ls -p -A "${d}" | grep -v '/$'`
(`:915`) — `-p` appends `/` to directory names and the `grep -v` deletes every one of them — and its
reply validator then rejects any line carrying a separator at all (`:929-931`). So `_listFiles`
returns the regular *files* directly under a directory and can never return a subdirectory name, in
either direction; there is no other listing seam in the adapter (`rtDevInjections`, `:1086-1110`).
A design that walked `docs/*` would find zero feature subdirectories in production on every run,
while every unit test drove `fakeListFiles` (`__tests__/helpers/seams.js:132-166`), whose map form
returns whatever the spec supplies — a double more capable than the seam it doubles, which is the
DC-07 "production path ≠ unit path" failure exactly.

The pass therefore asks git, in one call:

```js
_git(["ls-files", "--cached", "--others", "--exclude-standard", "--",
      ":(glob)docs/*/LEARNINGS-*.md", ":(glob)docs/completed/*/LEARNINGS-*.md"])
```

Four properties of that call, each verified against this repository at HEAD:

1. **It returns repository-root-relative paths**, one per line, which is what `CorpusFile.path`
   needs anyway — the walk would have had to reassemble them from a directory and a basename.
2. **`:(glob)` magic is load-bearing, not decoration.** Without it git's default wildmatch lets `*`
   cross a `/`, and `docs/*/LEARNINGS-*.md` then matches `docs/discarded/{feature}/LEARNINGS-*.md`
   (measured: two hits at HEAD, under `docs/discarded/pdlc-rcv-budget-stop/` and
   `docs/discarded/pdlc-review-convergence/`). With `:(glob)` the same pathspec matches exactly the
   one-level-deep set and those two hits are zero. Exclusion of `docs/discarded/` is therefore still
   by *not enumerating* — the pathspec cannot name it — and not by a filter a later edit can drop.
3. **`--cached --others --exclude-standard`** is one set, not two calls: a LEARNINGS harvested but
   not yet committed is still corpus, and an ignored file never is.
4. **It is a read.** `ls-files` reads the index and the worktree and mutates nothing; §9.3 records it
   as the `read-index` verb in the invoking-tree domain.

`parseCorpusListing` is the pure half: split on newline, drop empty lines, and map each path to
`{path, basename}` by its last `/`. `enumerateCorpus` **never opens a file**.

**AT-P1's oracle is the argv, not the fixture.** AT-P1 (`FSPEC-…:2020`) is purely an enumeration
claim — a LEARNINGS under `docs/completed/{feature}/` is in corpus, one under
`docs/discarded/{feature}/` is not — and §12.3 runs it at **L1**, over the `_git` double. Run
naively that is an implementation echo: the `docs/discarded/` exclusion would be decided by whatever
lines the fixture author put in the double's scripted stdout, not by the pathspec, and it is the one
exclusion the REQ calls out by name ("abandoned work is not evidence about a delivered pipeline",
`REQ-…:113-114`). So the row's oracle is stated here and is **two conjuncts, one of them positive**:

1. **Literal argv.** The array `enumerateCorpus` hands `_git` is asserted element-by-element against
   the literal `["ls-files", "--cached", "--others", "--exclude-standard", "--",
   ":(glob)docs/*/LEARNINGS-*.md", ":(glob)docs/completed/*/LEARNINGS-*.md"]`, **both `:(glob)`
   prefixes included**, because point 2 above makes the magic prefix the thing that performs the
   exclusion. An edit that drops a prefix, drops `--exclude-standard`, or adds a third pathspec is
   red on this conjunct regardless of what any fixture contains.
2. **Positive membership over the parsed listing.** Given a scripted stdout carrying one
   `docs/completed/{f}/LEARNINGS-{f}.md` line, that basename is in the corpus — so the row is not
   an absence-only assertion about `docs/discarded/`.

The second conjunct is deliberately *not* "a `docs/discarded/` line is filtered out": nothing in the
module filters it, and a test asserting that would pin a filter that must never exist. The
`docs/discarded/` half of AT-P1 is discharged by conjunct 1 — the pathspec is the filter, and the
pathspec is what the test reads.

`{ok: false}` from the seam is **not** an empty corpus. `enumerateCorpus` returns
`{unlistable: true, detail: stderr}`, and `main` dispositions it through §10.2's **`failNoReason`**
— terminal status `failed`, **no** reason code, the pathspec and `stderr` pushed onto §8.4's
`dispatchLog` for the report body. No new reason code is minted for it: vocabularies §1 at
`Version` 1.4 has no row for a corpus read failure, and inventing one here would breach REQ §4b and
this document's own §1.3 altitude check. `{unlistable: true}` is an in-module control value, never a
rendered one — it appears in no log row, no artifact and no §6.4 catalogue.

This is the same fail-safe direction §7.7 takes for `ESCALATIONS.md` ("never as empty: the two codes
make different claims"), applied to the corpus rather than contradicted one section earlier: an
unlistable corpus must never terminate `no-op`, which would be indistinguishable from a genuinely
empty one and would advance the cadence datum on a pass that read nothing. §10.3 row 1a carries it.

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

**An enumerated file whose body cannot be read, decided.** §10.4 class (ii) (a staged-but-deleted
LEARNINGS) and AT-P8's IO-error case both produce an entry that is in the corpus but whose body
`_readFile` returns `null` for. Two questions had no answer here and now do:

1. **It counts toward `|un-consolidated|` for the AC-1.2 volume test.** The test is over the
   *enumeration*, and AC-1.1 forbids reading any LEARNINGS body at tick time, so the count cannot
   depend on readability without violating the tick contract.
2. **It appears in the consumed pair**, and its basename is named in the report body as an entry the
   pass could not read. This is the arm that matters: excluding it would leave it un-consolidated
   forever, tripping the threshold on every subsequent pass and being drawn and dropped again each
   time — the "nudged forever, never clearable" shape §10.4 already treats as the worst outcome.
   Including it makes the pass converge, and the report says exactly what it could not read.

No reason code is minted for it (REQ §4b; vocabularies §1 at `Version` 1.4 has no row), so the
evidence is the report body's named list and nothing else. This is distinct from `{unlistable: true}`
above, which is the *enumeration* failing and terminates `failed`; here the enumeration succeeded and
one member of it is unreadable.

**Answering the reviewer directly on the durability of that evidence.** The consequence was put
plainly: a LEARNINGS file can be permanently marked consumed while contributing zero evidence to any
promotion, and the only trace is one pass's transient report body. That is real, and this layer still
does **not** add an `unread:` field beside `consumed` in the log row — not because it would be
useless, but because the log record's field set is a `pdlc-consolidation-vocabularies.md` §3
contract, and minting a field here is the same REQ §4b breach as minting a reason code. The three
observables above are what this document decides; whether the durable record should carry the
unreadable basenames is a product question about the log's field set, and §13.3 hands it upstream
with the rest of the enumeration/corpus batch rather than settling it in a technical spec.

These three obligations are not left to inspection either: §12.2 carries a `(no FSPEC AT)` row for
them and §12.3 assigns it a file.

The two membership tests differ deliberately — substring in the legacy region, per-line in the block
— and that asymmetry is the point: a block must name **exactly** the consumed set (NFR-5), while the
legacy region must reproduce the shipped predicate over prose that names full paths.

**T-08 decided: two implementations, whose predicates are held equal by a differential test.** The pass is JavaScript in
a bundle that cannot import; the hook is a Python heredoc inside bash that no JS test can import
(`nudge-consolidation.sh:22-50`). Extracting a shared implementation would need a third artifact and
a language boundary neither side has today. The two are therefore written separately to one stated
algorithm and pinned by AT-P7's differential harness (see 11.3(f)), which runs both over one fixture table and
asserts set equality (§11.3). The hook's edit is minimal and mechanical: `:28`'s single
`os.path.join` glob becomes the two-literal `CORPUS_GLOBS` tuple and the comprehension over it given
below, and `:41`'s comprehension tests against the two regions computed by a short helper rather than
against `logtext` whole.

**Both enumerations are pinned literally, so a divergence larger than §10.4's two classes reds.**
AT-P7 feeds both sides one basename list and therefore holds the *predicate* half only (§11.3(f)).
That leaves the enumeration pair with no equality oracle — but it does not leave it unguarded, and
the guard is not "inspection". Two literal pins, **at two different levels and in two different
files**, because the two sides are observable by different means and pretending otherwise would
weaken the stronger of them:

| Pin | What it asserts | Level | File |
|---|---|---|---|
| (a) **JS side** | the argv `enumerateCorpus` **hands `_git`**, element-by-element, per AT-P1's conjunct 1 above | **L1**, over the `_git` double | `consolidationPredicate.test.js` (§12.3, where AT-P1 lives) |
| (b) **hook side** | the tracked `pdlc/hooks/scripts/nudge-consolidation.sh` declares **exactly two** corpus glob patterns and no third | **L3**, a source-text read | `consolidationHookParity.test.js` (the file that owns the two implementations' relationship) |

An earlier draft of this paragraph placed **both** in `consolidationHookParity.test.js` as L3
source-text reads. That was wrong and is withdrawn on both axes. On **level**: a source-text grep of
the JS module's own text cannot see a call site that builds a different array at runtime, where an
assertion on the array actually handed `_git` can — and this pair is the compensating falsifier a
REQ relaxation is being conceded against, so the weaker reading is not the one to ship. On **file**:
§12.3's table is the input to the PLAN's file-ownership manifest (batch-safety rule 2), so which file
owns an assertion is a PLAN-level fact, not prose. §11.1's level table, §12.2's T-08 row and §12.3's
file table all state the split above; this paragraph now agrees with them.

**Pin (b) needs a form the shipped script does not have, so this feature's edit gives it one.** At
HEAD `:28` reads `learnings = glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))` — the
pattern exists only as three `os.path.join` components, neither literal `docs/*/LEARNINGS-*.md` nor
`docs/completed/*/LEARNINGS-*.md` occurs anywhere in the file, and a pin written over a line index is
anyway invalidated by this feature's own edits to the same heredoc (a second glob, the relocated
early exit, the `PDLC_PENDING:` line all shift it). Both problems are closed by one edit: the two
patterns become **single string literals in one named module-level tuple**, and the enumeration
ranges over that tuple:

```python
CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")
learnings = [p for g in CORPUS_GLOBS for p in glob.glob(os.path.join(proj, *g.split("/")))]
```

The `*g.split("/")` keeps the shipped `os.path.join` portability (the separator is still the
platform's, never a hardcoded `/`) while making the pattern itself readable as one literal. Pin (b)
is then stated over the **declaration, never a line number**: locate the `CORPUS_GLOBS = (…)`
assignment by name, extract its string literals, and assert the set is **exactly**
`{"docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md"}` — plus one conjunct that
`glob.glob(` occurs in the file exactly once and inside the comprehension over `CORPUS_GLOBS`, so a
third pattern cannot be added through a second call site the set assertion would not see. "Exactly
two, no third" is the falsifier and it is unchanged; only the anchor and the literal form move.

Together they make the divergence set *derivable and closed*: the two enumerations differ only where
`git ls-files --cached --others --exclude-standard` over those two `:(glob)` pathspecs differs from
`glob.glob` over the same two patterns in `CORPUS_GLOBS`, which is exactly §10.4's two classes
(git-ignored, and staged-but-deleted) and nothing else. An implementation that widens either side —
a third pathspec, a dropped flag, a third `CORPUS_GLOBS` member, a `**` in one of them — is red on a
pin rather than silently admitting a third divergence class. That is the compensating falsifier for the half AT-P7 cannot reach; §12.2's T-08
row and §13.1 row 6 carry it, and §13.3 raises the relaxation itself upstream, because whether "one
enumeration" may be held by pins rather than by an equality is a REQ/FSPEC decision, not this
layer's.

**A third hook edit exists, and it is what makes AT-P7 an oracle at all.** The shipped hook cannot
emit a set: it prints one JSON object whose `additionalContext` is prose carrying a **count**
(`:44-48`), and it prints it only when `n >= THRESHOLD` with `THRESHOLD = 5` (`:25`, `:43`); below
five it prints nothing and exits 0 (`:49`). Every fixture that discriminates the two-region
predicate — the truncated block (E-04), the stray closer (E-05), the basename collision (E-09), the
legacy/block boundary — has fewer than five pending files, so an oracle reading that message is
blind on all of them, and a count-above-five comparison would pass unchanged if the hook's
two-region logic were deleted outright. The hook therefore gains, immediately before the threshold
test:

```python
if os.environ.get("PDLC_CONSOLIDATION_DEBUG") == "1":
    names = sorted(os.path.basename(p) for p in pending)
    sys.stderr.write("PDLC_PENDING:" + ",".join(names) + "\n")
```

Three constraints on it, each falsified rather than promised: it writes to **stderr**, so the
SessionStart stdout contract (a JSON object, or nothing) is byte-unchanged; it is **env-gated off**,
so an ordinary session sees nothing; and it fires **regardless of `THRESHOLD`**, which is the whole
point. The channel is itself tested — an AT runs the hook with the variable unset over a
five-file corpus and asserts that neither stream carries `PDLC_PENDING:`, and a second runs it with
the variable set over a one-file corpus and asserts the line is present — because a debug channel
nobody falsifies is the one that quietly starts emitting the operator's file list. Without this
line T-08's "held equal by a differential test" is not true, and the decision would have to be
re-argued on evidence a count-above-threshold oracle can actually supply; §13.1 row 6 records that
dependency.

**Placement: after `pending` is computed, but the early exit moves.** The shipped hook returns at
`:29-30` (`if not learnings: sys.exit(0)`) before `pending` exists, so a zero-corpus fixture would
emit no line at all and the harness would have to read `∅` from **silence** — an absence-only reading
of the one channel the whole differential rests on, indistinguishable from "the hook did not run".
The edit therefore replaces that early exit with a `pending = []` fall-through so the debug line is
reached on every path, and the `n >= THRESHOLD` test at `:43` (which is already false for `n == 0`)
carries the no-output behaviour unchanged. That keeps the shipped stdout contract byte-identical on a
zero corpus while making `PDLC_PENDING:` (with an empty value) a **positive** observation of `∅`.
§11.3(f)'s fixture table gains a zero-corpus row to exercise it.

**How the PLAN must route this edit: production code, not test scaffolding.** It ships in
`pdlc/hooks/scripts/nudge-consolidation.sh`, a consumer runs it on every `SessionStart`, and
`bash -n` in CI's `Shell scripts parse` job covers it — so it belongs to the hook's owning
implementation task with the `:28` glob and `:41` predicate edits (one file, one task, per
batch-safety rule 2), never to a test-helper task. The release note names it as a new,
default-off debug channel, alongside §8.3's drift-gate notice.

**One side effect of the relocated exit, named deliberately.** Removing `:29-30` means a zero-corpus
session now reaches the log read at `:32-39`, where today the hook exits first. That is a new read on
a `SessionStart` path in every repository that ships this plugin. It is safe — the read is already
guarded by `os.path.isfile` and wrapped in a `try` with `errors="ignore"` — and it is deliberate,
because the debug line must be reached on every path for `∅` to be observable. It is **in scope for
the release note**, which names both halves of this edit rather than only the visible one: a new
default-off `PDLC_PENDING:` stderr channel, and one additional guarded read of
`docs/_decisions/.consolidation-log.md` on zero-corpus sessions. Stdout is byte-unchanged either way
(`n >= THRESHOLD` at `:43` is already false for `n == 0`).

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
releaseMarker(state, seams): Promise<void>                                       // impure — step 16
```

`parseMarker` accepts exactly `IN-PROGRESS: {passId} {ISO-8601}` on one line; anything else — empty,
truncated, multi-line, unparseable timestamp — yields `null`. `markerVerdict` maps a **present but
unparseable** marker to `reclaim`, never to `refuse`: an unparseable marker carries no timestamp, so
it can never age out, and refusing on it would wedge the cadence permanently. The `present` flag is
what separates that case from an absent file (`free`), so the two `null`s are never conflated.

**What release does, and where `present` comes from — both decided, because the two answers must
agree or every steady-state pass reclaims a lock nobody holds.** There is no removal verb anywhere
in reach: §5.1's protocol declares none, and the adapter ships `rtWriteFile` (`runtime-adapter.js:802`),
`rtAppendFile` (`:863`), `rtListFiles` (`:905`), `rtGit` (`:945`) and no unlink of any kind; `git rm`
is outside §9.3's invoking-tree verb set and would not apply anyway, since the marker is untracked
and `.gitignore`d by §3.3. AC-1.3 also settles the shape upstream — taking and releasing it "are
in-place rewrites of a whole small file" (`REQ-…:155-156`). So:

1. **`releaseMarker` is `await _writeFile(markerPath, "")`** — one seam call, no git call, the file
   left **present and empty** on disk. It is the only write step 16 makes; §10.1's comment naming a
   `_git` alternative was wrong and is corrected there.
2. **`present` is `(await _checkFile(markerPath)).ok === true`**, and *only* that. `rtCheckFile`
   (`runtime-adapter.js:817-831`) returns `{ok:true}` for a file that exists and is non-empty, and
   `{ok:false, reason:"file_empty"}` / `{ok:false, reason:"file_missing"}` otherwise — so **`file_empty`
   is treated exactly as absent**. `takeMarker` therefore probes with `_checkFile` for `present` and
   reads with `_readFile` for the content `parseMarker` consumes; `present` is never derived from
   `_readFile(...) !== null`, which would read the empty released form as present-and-unparseable and
   send `markerVerdict` down the `reclaim` arm on a completely normal pass, recording
   `reclaimed-stale-lock` on every steady-state run after the first. `_checkFile` is in §5.1's
   protocol for this reason and is doubled by `fakeFs` already (§11.2).

The two decisions are one decision read from both ends: an empty file is what release leaves, and an
empty file is what the presence probe calls absent. The observable a test can hold is the **write
double's last recorded contents for the marker path** — the `IN-PROGRESS:` line during the pass, the
empty string after it — which is how §10.1 restates T-13's conjunct (ii).

**What that costs upstream, stated rather than absorbed: FSPEC §4.2's fourth row is not satisfiable
on its `empty` arm, and this layer says so instead of pretending otherwise.** That row enumerates
"Marker present, **unparseable or empty (truncated write)**" ⇒ "treated as **stale and reclaimed**,
recording `reclaimed-stale-lock` with the abandoned pass id reported as `unknown`"
(`FSPEC-…:442`), and the FSPEC binds it twice more — E-11 ("Marker file **truncated** or unparseable
⇒ reclaimed, not refused") and **AT-M3**, whose *Given* is "truncated or unparseable marker file"
(`FSPEC-…:2038`). Under the decisions above the **unparseable-but-non-empty** arm behaves exactly as
the FSPEC requires; the **empty** arm does not, and cannot: `present` is false for a zero-byte file,
so `markerVerdict` returns `free`, the pass proceeds, and **no `reclaimed-stale-lock` is recorded**.
The row is not narrowed or reinterpreted — that half of it is unreachable.

The collision is not a choice this layer made and is not one it can undo. An empty marker is
precisely what a *successful release* leaves on disk, because no declared seam removes a file
(§5.1's protocol has no unlink; the adapter ships none — verified above), so *released* and
*truncated mid-take* are the same observed state and no probe can separate them. Preserving the
FSPEC row would mean reclaiming — and recording `reclaimed-stale-lock` on — **every** steady-state
pass after the first, which is a louder, more frequent falsehood than the one it prevents.

So this layer ships the narrowing and **raises it upstream as an erratum against FSPEC §4.1/§4.2**
rather than settling it: the erratum names §4.1's lifetime row ("**Removed** at step 16", `FSPEC-…:415`,
which no declared seam can do), §4.2's fourth row, E-11 and AT-M3, and carries the product question
that decides them — *when a pass dies mid-take, must the durable log witness it?* Under the FSPEC as
written, the next pass records `reclaimed-stale-lock` and an operator can see that a pass died; under
this release form the next pass proceeds silently. That is a judgement about what the log must
witness, not about which write verb the adapter happens to ship, and it belongs to the REQ/FSPEC
author. This document's local disposition, pending that answer: §10.3 row 4 is corrected to the
unparseable-non-empty arm and row 4a records the empty arm's actual behaviour, and §12.3 states which
arm of AT-M3 is satisfiable here. It is the same disposition this document applies to the enumeration
relaxation and to the `unread:` log field — name the row, ship what is buildable, hand the decision to
its owner.

Two consequences worth stating once, because they will be asked again at DoD. (1) `parseMarker`
still returns `null` for empty text, but on an empty *file* that `null` is never the deciding input:
`present` is already false, and `markerVerdict`'s `free` arm is reached on the presence flag alone —
the two `null`s (absent file, unparseable content) are still never conflated, because only the
non-empty one can reach `reclaim`. (2) **The zero-byte marker is permanent**, one per consuming repo,
from the first pass onward. §3.3 `.gitignore`s it, so it never reaches a diff, a PR or a
fresh-clone bootstrap check; the only surface on which it appears is a literal `ls docs/_decisions/`,
where a zero-byte `.consolidation-lock` means *free*, not *stuck*. An operator deleting the file by
hand produces `file_missing` where a released pass produces `file_empty`, and §7.3 treats both as
absent — so the manual channel and the pass channel agree, and neither can wedge the cadence.

Take is `_checkFile`, then `_readFile`, then `_writeFile` — **observe-then-write, not atomic** — three seam calls on the
take path, not two, and §10.4 item 1's race window is the span across all three. The
probe is a third call, not a substitute for the read: `_checkFile` produces `present` and `_readFile`
produces the text `parseMarker` consumes, and decision 2 above forbids deriving either from the
other. FSPEC §4.5 / O-C3 prices
this race and asks whether the runtime offers an atomic create-exclusive primitive. **It does
not**: `_writeFile` is `rtWriteFile` (`runtime-adapter.js:802`), an agent-transported whole-file
write with no exclusive-create mode, and no adapter seam exposes one. This TSPEC takes the
read-then-write form and **records the decision** rather than inventing a lock: an
exclusive-create seam would be a new agent transport whose observation (whether the file already
existed) is exactly as racy as the read it replaces. §13 carries it.

**Take is check, read, write, then read back.** `rtWriteFile` (`runtime-adapter.js:802-811`) awaits an agent
dispatch, inspects no reply and returns `undefined`; the adapter's own comment at `:798-801` says
the cache entry is deliberately not repopulated from `contents` because "an agent-mediated write is
a request, not proof of the bytes on disk — the next read re-verifies against a probe, which is the
only evidence this adapter trusts". A take with no read-back therefore lets the pass proceed through
all sixteen steps believing it holds a lock it does not hold, which is precisely the guarantee
AC-1.3 rests on. `takeMarker` closes it with the re-read the adapter's comment names:

```
check → read → verdict → write → read back → parseMarker → confirm parsed.passId === state.passId
```

**That order is the spec of record, and it is testable text rather than prose.** `verdict` is
`markerVerdict(parsed, present, …)`, so `present` must already exist when it runs — which is why
`check` is first and why an earlier draft's `read → verdict → …` line was wrong: transcribed
literally it forces the `_readFile(...) !== null` derivation decision 2 forbids, and re-opens the
reclaim-on-every-steady-state-pass bug. It is withdrawn by name here rather than silently rewritten.
`fakeFs` accumulates an ordered `calls` array whose intended use its own header advertises
(`__tests__/helpers/seams.js:241` — `expect(fs.calls.map((c) => c.op)).toEqual([…])`), so a
call-order oracle over `takeMarker` is a natural L2 assertion, and the expected prefix it holds is
`["check", "read", "write", "read"]` — one expected value, not two.

A read-back that returns `null`, an unparseable marker, or **another pass's** `passId` is a failed
take. The pass terminates `refused` with `consolidation-in-progress` (the same disposition as an
observed fresh marker — from the pass's own vantage the lock is not its own either way), records no
consumed pair, and commits nothing, per §4.4. §10.3 row 5a carries it. The read-back costs one seam
call on the one path where a wrong answer is unrecoverable, and it is a *positive* post-condition —
the AT asserts the terminal status **and** the marker file's content on disk, never "no second pass
ran".

The read-back does **not** close the race of §10.4 item 1: two passes can both read free, both
write, and the later writer's read-back succeeds while the earlier writer's fails. That asymmetry is
an improvement (one of the two now knows), not a lock, and §10.4 states the residue unchanged.

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
`_git(["cat-file", "-e", "HEAD:" + artifact])` probe — a **read**, resolving to the `read-object`
verb §9.3 adds to the invoking-tree domain as a recorded widening, never a checkout and never a
filesystem stat the runtime cannot perform.

### 7.6 Routing and suppression (FSPEC §5.1, §6.4)

```ts
routeOf(target: string): RouteDecision                                // pure
routeProposal(proposal: Proposal): RouteDecision                      // pure — the ONLY caller of routeOf
enactedByLog(pair, records): {enacted: boolean, passId: string|null}  // pure
enactedByPr(pair, prStates): {enacted: boolean, url: string|null}     // pure

// The RANGE of both routing functions. Four members, exactly — this is the type a
// set-equality oracle asserts against. "degraded" is NOT in it: no conforming
// implementation of either function can return it (see below).
type RouteDecision = "PR" | "constraints" | "decisions" | "proposal-file";

// The RECORD field's domain, which is a different set: Route (§6.1) is the
// four-member vocabulary value written to FailureModeRecord.route, and "degraded"
// is one of its members. RouteDecision and Route overlap in three members and are
// neither a subset nor a superset of one another.
// Route = "constraints" | "decisions" | "PR" | "degraded"      (§6.1)
```

**Routing reads the action, not only the target — and the function that does so is named.** FSPEC
§8.6 makes a retirement or revision follow the same propose-only path as a promotion, "route decided
by the promotion's own `target` (§8.1), exactly as §5.1 decides any target", with one arm that is
*not* an application:

| Where the promotion landed | `action: promote` | `action: revise` / `retire` |
|---|---|---|
| a `MERGE_GUARD_DEFAULTS` path | PR | **PR**, in its own commit under that action (AC-3.3) |
| `DOMAIN-CONSTRAINTS.md` / `DECISIONS-{topic}.md` | append | **proposal file, never applied** (AC-5.4, FSPEC §8.6 row 2) |
| any other consuming-repo path | proposal file only | proposal file only (FSPEC §5.1 row 4) |

`routeProposal` is that table, and it is the **only** caller of `routeOf`:

```js
export function routeProposal(p) {
  const r = routeOf(p.target);                       // "PR" | "constraints" | "decisions" | "proposal-file"
  if (r === "PR") return "PR";                       // guard-set: every action goes through the PR
  if (p.action === "promote") return r;              // append, or the proposal file
  return "proposal-file";                            // AC-5.4: never applied by the pass
}
```

Making it a stated function rather than an implication is the point of the finding it answers: with
`routeOf` alone in the call graph, an implementer removes or rewrites a promoted constraint in the
consuming repo, which is exactly the "never applied by the pass" prohibition the whole propose-only
symmetry rests on. §4.1's graph names `routeProposal`, and `routeOf` is reachable from nowhere else.

**Two sets, and the reason they must be named separately.** `RouteDecision` is the routing
functions' **range** and has exactly four members; `Route` (§6.1) is the record field's vocabulary
and also has four, but a *different* four. The two differ in one member each way: `"proposal-file"`
is reachable from `routeProposal` and is not a `Route`; `"degraded"` is a legal `Route` and is
**unreachable** from either routing function — `routeProposal`'s three branches can return only
`"PR"`, `routeOf`'s answer (`constraints` / `decisions` / `proposal-file`), or `"proposal-file"`.
This is stated as two named types rather than one union because §6 makes every enumerated contract a
**set-equality** oracle over the full enumeration: an oracle written against a union that is wider
than the range would red on correct code, and the predictable repair — weakening it to containment —
would stop failing when a route is deleted, which is the failure the oracle exists to catch. So the
routing oracle asserts `range(routeProposal) = RouteDecision` (four members, both directions) and the
record oracle asserts the `route` field ∈ `Route`; neither type appears in the other's assertion.

**`routeOf` has an outcome the `Route` union cannot express.** `"proposal-file"` is
`routeOf`'s answer for FSPEC §5.1 row 4 and for every `revise`/`retire` diversion above, and
vocabularies §1 at `Version` 1.4 has no `Route` row for it (§6.1's four-member union is transcribed
correctly from `pdlc-consolidation-vocabularies.md:38-65`). That gap is **upstream**, recorded as
ER-6 in §12.4 and not patched here.

Until ER-6 lands, `FailureModeRecord.route` for a proposal-file promotion is written
**`"degraded"`** — the one legal value whose meaning is already "the promotion reached nothing but
`CONSOLIDATION-PROPOSAL-{passId}.md`", which is FSPEC AT-Q12's own gloss on it. The consequence is
correct rather than merely legal: §7.6's `enactedByLog` does not enact on a `degraded` record, so
the proposal is re-proposed on the next pass — which is what an item awaiting operator approval
should do, and is the direction AT-Q12 asserts. The loss ER-6 would recover is that a *routed*
propose-only item and a *degraded* PR attempt are indistinguishable in the record; the report body
(§7.9 item 4) names each promotion's route in full and is the discriminator meanwhile.

**And the discriminator is asserted, not merely stated.** A discriminator no test reads is not a
discriminator. `consolidationReport.test.js` carries the two-fixture control alongside its AT-L rows:
one pass whose promotion was *routed* propose-only (a `revise` on a `DOMAIN-CONSTRAINTS.md` target,
§7.6's table row 2) and one whose PR attempt *degraded* (`branch-exists`). Both write
`route: "degraded"` to the record — that is the ER-6 loss, and the test asserts it rather than hiding
it — while the report bodies differ: the degraded one names a reason code from vocabularies §1
(`branch-exists` / `api-failure` / `repository-unresolved`) and the routed one names none. The
assertion is that exact difference, in both directions. Without it the interim would be a claim; with
it, ER-6 landing is a *simplification* of a passing test rather than the repair of a silent
ambiguity.

`routeOf` normalises the target — repository-root-relative, no leading `./`, no `..` segment, `/`
separators — and returns `"PR"` when it is prefixed by **any member of `MERGE_GUARD_DEFAULTS`**
(imported from `orchestrate-dev.js:48-53`, never copied: a copy would silently survive a change to
the constant, and set-equality with it is AT-R1's whole point). Otherwise it returns `constraints`
for `docs/_constraints/DOMAIN-CONSTRAINTS.md`, `decisions` for `docs/_decisions/DECISIONS-*.md`, and
`"proposal-file"` for every other consuming-repo path. `guardVerdict` (`:732`) and
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

**The whole-file range is the FSPEC's, and PROPERTIES must fixture against it.** FSPEC §9.5 settled
that `seamCandidates` ranges over every entry with no filter on `Feature`, none on date and no
relation to the consumed set (BR-37a); the REQ's AC-6.3 text still reads "across the consumed
window". This layer transcribes the FSPEC, so it is not a defect here — but a PROPERTIES fixture
written from the REQ's wording would falsify a conforming implementation. §11.5 carries the note.

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
renderPrBody(state, enacted: Proposal[]): string        // the PR body file (AC-3.2, AC-3.7)
renderProposalFile(state, deferred: Proposal[]): string // CONSOLIDATION-PROPOSAL-{passId}.md (AC-3.5)
renderPromotionCommitMessage(proposal, passId): string  // PDLC-PROMOTION-ID trailer (AC-3.3)
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
dropped"). Item 4 names each promotion's route — including, for a `revise`/`retire` diversion, that
its record's `route` reads `degraded` under ER-6 (§7.6) — and, for a merged promotion, its
`elidedKinds` and `elidedArtifacts`; item 10 prints `openPromotionList(...).length` as a number.

**The two operator-facing artifacts are renderers like every other surface**, not prose an agent
composes. Both are pure functions of `PassState` plus a proposal list, so both are L1-testable
without standing up a pass, and both are written through a seam by `main` — never by a dispatched
agent (the id and the trailers are the pass's own data, and an LLM cannot be relied on to reproduce
a set-equality).

**`renderPrBody(state, enacted)`** produces the bytes `--body-file` reads (§9.2). Three obligations
land on it:

| Obligation | What the renderer emits |
|---|---|
| AC-3.2 | one section per enacted promotion naming (i) the **source LEARNINGS by feature name**, derived from `state.consumed`'s basenames rather than restated, (ii) the failure mode the edit targets — its `failureModeId` and one-line `symptom` — and (iii) the AC-2.3 pattern evidence that cleared the bar, carried verbatim from the clustering reply |
| AC-3.7(c), REQ-CONS-03 | the three vocabularies §4 trailers, last, in that section's order: `PDLC-CONSOLIDATION-PASS: {passId}`; `PDLC-CONSOLIDATION-SOURCES: {sorted consumed basenames}`; `PDLC-CONSOLIDATION-PROMOTIONS: {sorted `{failure-mode-id}:{action}` pairs}` |
| NFR-2 / §7.4 | nothing derived from the credential. The renderer takes no credential argument at all, which is why non-disclosure here is structural (§5.3) rather than reviewed |

`PDLC-CONSOLIDATION-PROMOTIONS` is the NFR-4 duplicate key and is **derived from `enacted`, not
assembled beside it**: the renderer computes the pair set from the same array it renders sections
from, so the trailer is set-equal to the proposals the PR enacts by construction rather than by
discipline. That closure matters because §7.6's `enactedByPr` *reads* this trailer — the pass's own
idempotence depends on this writer, so writer and reader are pinned to one another by AT-Q4's
round-trip (§12.2). Sorting is byte order over the pair strings, so the trailer is stable across
runs and a diff of two passes is readable. A revision or retirement sharing the PR (AC-3.3) joins
the set under the **retired promotion's own** `failure-mode-id` — no second id is minted (AC-5.1).

`renderPromotionCommitMessage` emits one commit's subject plus `PDLC-PROMOTION-ID: {id}:{action}`,
the per-commit trailer of vocabularies §4, so commit → proposal is readable without counting
(AC-3.3). It is a separate one-line function because §9.2's per-edit commit is the only caller and
its output is the one thing in the clone that must be exactly transcribable.

**`renderProposalFile(state, deferred)`** produces
`docs/_decisions/CONSOLIDATION-PROPOSAL-{passId}.md`, written **when and only when** the pass has
something to propose that it does not enact (FSPEC §5.3) — so a pass that enacts everything writes
no file, and one is never created empty. Per deferred item it emits: the `failureModeId`, the
`action`, the target, **the full proposed diff inline** (AC-3.5 — the `Proposal.diff` field, never a
summary of it), and the **failure class recorded by name** — the reason code (`credential-unavailable`,
`repository-unresolved`, `api-failure`, `branch-exists`) for a degraded PR attempt, or the
propose-only cause for an AC-5.4 diversion. When the pass also opened a PR, the file's header
carries `state.prUrl`, which is AC-3.4's second clause; when there is no proposal file, AC-3.4's
second clause is vacuous and the URL lives in the terminal row's `pr:` field alone (§12.2 row T-11
records that reading).

A deferred item whose `diff` is `null` renders the diff block as §6.5's `(unavailable)` and still
emits every other field: a proposal short of its edit is a worse artifact than one that says so, and
dropping the item would lose the promotion — the AC-3.5 failure this fallback exists to prevent.

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
4. **The function stays non-`async` and `.then`-chained.** Its doc comment (`:1820-1826` — the
   "Deliberately NOT `async`" block; `:1819` is the preceding blank comment line) states
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

**And it blocks the queue until the operator syncs — deliberately, and it must be written down.**
`orchestrate-queue`'s drift gate runs before `QUEUE.md` is even read and returns
`outcome: "blocked"` on a row that is still `missing`, so the first queue invocation after this
feature lands refuses until `sync-workflows.sh` has run. That is the gate working, not a regression:
a consumer whose `.claude/workflows/` lacks the new bundle cannot run the pass anyway, and the
alternative — a gate that ignores a missing row — is the silently-stale-copy failure the gate
exists to prevent. §13.3 hands the PLAN the obligation to say so where a queue operator will read
it: the feature's release note and `pdlc/RELEASE-CHECKLIST.md` both name the required
`sync-workflows.sh` run, and the repo's own bootstrap already documents the two-command order.

**No AC or FSPEC row owns it, and that is the correct place for it.** The interruption is not
behaviour this feature specifies: it is the *shipped* drift gate's existing contract
(`docs/_queue/QUEUE.md`'s gate, `distribution.checkEnabled`) meeting a new artifact row, and it fires
identically for any feature that adds a bundle. Inventing an AC for it would push a distribution
mechanic into a functional spec that decides pass behaviour. So its discharge **is** the §13.3
release-note obligation — stated here so the choice is visible rather than looking like an omission,
and stated in the two places an operator actually reads before running a queue.

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
   non-mutating read of the invoking tree, resolving to `read-object` in §9.3's verb table. Cloning
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

Writing a file **inside the clone** uses the `_writeFile` seam with an absolute path under `dir` —
and that **is** a new capability, granted by §5.6(a)'s prompt widening, not an existing one. The
shipped prompt says "relative to the repository root" (`runtime-adapter.js:805`) and `dir` is
outside the repository, so the earlier claim that "no new capability is needed" was wrong in the one
direction that matters: three things depend on this working — the guard-set edit committed in the
clone, the PR body file, and with it the whole `--body-file` mechanism. §5.6(a) states the widened
contract and §11.3(e) states the assertion that pins it; §11.6 no longer exempts it. Only the
**write** prompt changes: every path this pass hands `_readFile` is repo-root-relative (the corpus
files enumerated by `ls-files`, the log, the marker), and `rtReadFile`'s shell-command transport
resolves an absolute path verbatim anyway (§5.6(a)), so there is no read-side edit here and none is
needed.

NFR-1 is untouched: the only guard-set path the pass ever writes is inside the throwaway clone,
never in any tree the invoking repository checks out. The widening does not weaken that — an
absolute path is only ever one `_makeTempDir` returned, and the pass constructs none itself (§5.3).

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

The FSPEC froze these sets and made widening a **recorded TSPEC decision** under `DEC-LAYER-01`
("a widening is a recorded TSPEC decision against this set, never a silent reading of it"). This
layer records **exactly four widenings**, every one in a permitted-but-not-obliged column, every one
non-mutating, each marked ⊕ below. Every other cell is transcribed unchanged at FSPEC v11.1.

| Domain | How a call is classified | Obliged | Permitted, not obliged | Absent always |
|---|---|---|---|---|
| PR seam | every `_ghRun` call | `read-pr`, `create-pr` | ⊕ `read-auth` | `merge`, `enable-auto-merge`, `merge-pr`, `squash-merge`, `close-pr`, `update-pr` |
| git, invoking tree | `_git` whose argv does **not** begin `["-C", cloneDir]`, and is not the `clone` call | `add`, `commit` | `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index` | `checkout`, `switch`, `stash`, `reset`, `rebase`, every merge verb |
| git, clone | `_git` whose argv begins `["-C", cloneDir]`, plus the `clone` call itself | `clone`, `create-branch`, `add`, `commit`, `push` | `fetch`, `read-branch`, `read-status` | every merge verb |

**Widening 1 — `read-auth` on the PR seam.** AC-4.4 makes local `gh` authentication the *shipping*
credential for the same-repo case, and §9.2 observes it with `gh auth status`. That call touches no
pull request, so under FSPEC §6.5's domain definition ("every call that reads or mutates a pull
request in the target repository") it would fall into **no domain at all** and be invisible to
AT-Q7's oracle — the precise blindness §6.5 exists to remove. Binning it into the PR seam under its
own read verb keeps every `_ghRun` call classified, so the spy's containment assertion still ranges
over the whole seam. It is non-mutating and is no merge verb, so the assertion loses no strength.
An erratum against the FSPEC asks §6.5 to state the domain by transport (`_ghRun`) rather than by
subject (a pull request).

**Widenings 2–4 — three named reads in the invoking tree, each classified as what it reads.** The
pass makes three non-mutating git reads of the invoking tree that FSPEC §6.5's closed set has no
verb for, and each gets its **own** verb:

| Call | Verb | Why the pass makes it |
|---|---|---|
| `git cat-file -e HEAD:{path}` | ⊕ `read-object` | FSPEC §8.5 row 3's file-existence test at HEAD (§7.5), which the runtime cannot ask of a filesystem it does not have |
| `git remote get-url origin` | ⊕ `read-remote` | §9.1 step 2's clone source in the same-repo case |
| `git ls-files --cached --others --exclude-standard -- :(glob)…` | ⊕ `read-index` | §7.1's corpus enumeration |

An earlier draft folded `read-remote` into `read-object` "because a two-verb widening is easier for
a test author to transcribe exactly than a three-verb one". That is withdrawn, and it was wrong on
its own terms: reading remote configuration is not reading the object database, transcription cost
is the weakest possible ground for widening a set whose entire purpose is to make AT-Q7's
containment assertion mean something, and it did the very thing §13.1 row 9 records this layer as
having *rejected* — mis-classifying into an existing verb rather than naming a new one. The concrete
cost was that `resolveSeamVerb` became lossy at the boundary: an implementation that later reached
for `git remote add` would classify as the already-permitted `read-object` and pass containment.
With one verb per read, `remote add` resolves to a mutating remote verb that is in no permitted set
and reds. `read-status` would have been the same mis-classification for `cat-file`, and §6.5 forbids
reading a further verb into a closed set silently — which is why all three are recorded, not folded.

All four widenings are **permitted, never obliged**, so no Given asserts their presence and an
implementation that resolves the branch name, the file's existence, the remote or the corpus some
other way still conforms.

Classification is by **resolved operation**, not function name: the resolver maps an argv or a
command string to a verb, so `checkout -b` and `switch -c` in the clone both resolve to
`create-branch`, and a merge issued through any spelling of `_ghRun` resolves to `merge`. The
classifier has two exported pure halves, `resolveSeamDomain` and `resolveSeamVerb`, so the spy
in §11.3 reads the contract's own classification rather than re-implementing it — and a verb the
classifier cannot resolve returns `"unknown"`, which is in no permitted set and therefore fails the
containment assertion rather than passing silently.

**Both halves are the module's, not the spy's.**

```ts
resolveSeamDomain(seam: "_git"|"_ghRun", argvOrCommand, cloneDir: string|null)
  : "pr" | "git-invoking" | "git-clone"          // total — never null
resolveSeamVerb(domain, argvOrCommand): string   // "unknown" when unresolvable
```

`resolveSeamDomain` exists because an earlier draft left the **domain** half to the test: `domain`
is an *input* to `resolveSeamVerb`, so the module classified the verb and never the domain, and the
spy computed the domain itself from the clone directory — half the contract re-implemented in test
code, which is the exact failure this paragraph claims to avoid. It also did not cover the whole
set: the rule is "`_git` whose argv begins `["-C", cloneDir]`, plus the `clone` call itself", and
the clone call is `_git(["clone", "--depth", "1", "--single-branch", remote, dir])` (9.1 step 3),
which carries **no** `-C` prefix. A hand-written special case in the test for the one call that
*establishes* the domain is precisely where a mis-binned call hides: binned into the invoking-tree
domain, `clone` is in no permitted set and AT-Q7 reds for the wrong reason; binned nowhere, it
disappears from both assertions. `resolveSeamDomain` returns `"git-clone"` for it **by name**, and
`cloneDir === null` — no clone opened — makes every `_git` call `"git-invoking"`.

Because that function is total over the three domains, the spy carries a **fourth** assertion the
earlier three lacked: every observed call is classified into **exactly one** domain, and the union
of the three observed sets equals the set of all observed calls. Without it a call that falls out of
the partition is silently exempt from containment, which is AT-Q7's whole subject.

The branch name for `branch:` comes from `git rev-parse --abbrev-ref HEAD` (`read-branch`), the
shipped observation `readHeadBranch` (`orchestrate-dev.js:3520`) makes through `_git` at `:3524`.

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

Every failure scenario the FSPEC enumerates, with the mechanism that produces its stated behaviour.
The organising rule: **no seam failure throws out of `main`.** Seams return `{ok:false,…}` or `null`;
pure functions are total; the only exception `main` can see is the resolver's halt rejection, and it
is caught at exactly one site (§10.2).

### 10.1 Terminating branches are returns, not exceptions

FSPEC §2.2's "terminates = a jump to step 14" is implemented as an early `return await finishPass(state)`,
where `finishPass` performs steps 14–16: append the terminal row, run the 9.4 commit, release the
marker. There is one exit, so a terminated pass still returns exactly one report and no new
termination point can forget to write one.

**The three steps are guarded, not unconditional.** An earlier draft said "unconditionally … there
is only one exit" and carved out no status. That is wrong twice, and both errors are load-bearing:

| Guard | Terminal status it protects | Why |
|---|---|---|
| `state.status !== "skipped-cadence"` gates **all three** steps | `skipped-cadence` | FSPEC §2.2 names it as "the one terminal branch that is **not** a jump": step 4 took no marker and wrote no record, so there is nothing to append (§2.4, AC-7.2). AC-1.1 requires the tick to exit "having read no LEARNINGS body … and writes no log row"; AC-1.3's datum rule requires that "ticking cannot advance the datum" (REQ-CONS-01), which a row per `/loop` tick would falsify every tick — and the log would grow without bound |
| `state.status !== "refused"` gates the **commit** | `refused` | FSPEC §4.3's Commits column reads "**no** — it writes its AC-7.2 row and commits nothing", restated at §4.4 with the reason: a pathspec stages a **whole file**, so a refused commit would capture the winner's in-flight log at an arbitrary mid-pass instant |
| `state.markerHeld` gates the **release** | `refused` | already stated in §6.1 — the loser never unlocks the winner (FSPEC §4.3) |

So `finishPass` is:

```js
async function finishPass(state) {
  if (state.status === "skipped-cadence") return report(state);   // no row, no commit, no marker, no git call
  await appendTerminalRow(state);                                 // step 14 — _appendFile
  if (state.status !== "refused") await commitConsumingRepoPaths(...);  // step 15 — _git
  if (state.markerHeld) await releaseMarker(state);               // step 16 — _writeFile only (§7.3)
  return report(state);
}
```

**`finishPass` is `async`, and every one of its steps and every one of its call sites is `await`ed.**
This is normative, not incidental. All three steps reach a seam — `appendTerminalRow` is step 14's
`_appendFile`, `commitConsumingRepoPaths` is step 15's `_git`, `releaseMarker` is step 16's — so
§5.1's "every seam call is `await`ed without exception" reaches them transitively through the module
functions that wrap them. Correspondingly, `main()` writes `return await finishPass(state)` at
**every** terminating branch, including the two in §10.2.

The reason this is spelled out rather than left to the reader is that **nothing in §11 falsifies it
by construction**. §11.3(c)'s static audit scans call sites of *injected seam identifiers*;
`finishPass`, `appendTerminalRow`, `commitConsumingRepoPaths` and `releaseMarker` are module
functions, so a missing `await` on any of them is invisible to it. And every L2 test drives **sync**
doubles (`seams.js`'s header names this as the central hazard), under which an un-awaited promise
settles before the assertion runs — green suite, broken production, where `main()` resolves a report
claiming a terminal row that is still pending and a marker (AC-1.3) still held.

So the oracle is stated explicitly, because it is the only shape that distinguishes *written* from
*scheduled*: **an L2 assertion that reads the log double and the marker double after `main()`'s
promise resolves** — not inside the pass, not from the report — and finds (i) the terminal row
present in the log double's accumulated text and (ii) the marker **released**, stated against the
observable §7.3 decides: the write double's last recorded contents for
`docs/_decisions/.consolidation-lock` are the **released form — the empty string** — having been the
`IN-PROGRESS: {passId} …` line at an earlier point in the same double's recorded history. An earlier
draft said "gone"; that describes a state no declared seam produces, since §7.3's release is an
in-place `_writeFile` of empty content and the protocol has no removal verb. Conjunct (ii) carries
the take-side half because a bare "no marker" is equally true of a pass that never took one (a
`refused` or `skipped-cadence` fixture, or a take that did not land — §10.3 row 5a); asserting the
take and then the release is the positive-then-negative pair the §11.3 oracles already use, and it
is what makes this row cover AC-1.3 rather than merely coexist with it. `fakeFs` supports the
history half directly — it accumulates `writes`/`calls` rather than only a current-state map
(`__tests__/helpers/seams.js:243-251` declares `writes`/`calls`; `:281` pushes every write, and
`:292` is the `checkFile` half §7.3's `present` reads through).

Driven by the **macrotask-deferring** variants of the doubles (`consolidationDoubles.js`'s `asAsync`
wrapper; §11.2 states why a microtask deferral could not falsify anything), a missing `await` inside
`finishPass` fails both conjuncts while every other suite stays green. The defect this catches is
specifically the intra-`finishPass` one — `main()`'s own `return await finishPass(state)` call sites
are a stack/`try` improvement rather than a behavioural one, since an `async` function's `return p`
already adopts `p`. §12.2's T-13 row carries it, with the mutation check §11.2 requires.

`skipped-cadence` reaches that first line from **exactly one place**: `main()`'s step-4 branch, where
`triggerFor` (§7.2) returns `"skipped-cadence"` — before `mintPassId`, before `takeMarker`, before
any LEARNINGS body is read. Nothing downstream can produce the status, which is what makes the
carve-out a single early return rather than a condition threaded through the pass. The report body
it returns carries the status alone (FSPEC §10.1 row 3), which is AC-C3's positive conjunct — the
four absences alone would also be satisfied by a pass that never ran.

A `refused` pass likewise writes no consumed pair: the pair is step 7, downstream of the step-6
refusal, so its absence is structural rather than a fourth guard (AT-M1, AT-M6b).

`state.reasons` is a `Set`, so a composing code (`reclaimed-stale-lock`, `writes-uncommitted`,
`no-advisory-corpus`, `advisory-corpus-empty`, `no-cadence-datum`) is added where it is observed and
survives to the row regardless of which branch terminates the pass — subject only to §6.4's legality
check at render time.

### 10.2 The one caught exception

`resolveAdvisoryRung` **throws** (as a rejection) when neither rung resolves (`:1868`). Every call
site in the pass is therefore wrapped:

```js
let dispatched;
try { dispatched = await resolveAdvisoryRung({…}); }
catch (err) { return await finishPass(fail(state, "advisory-model-unresolved")); }
if (dispatched.kind === "dispatch-error") { … return await finishPass(failNoReason(state, err)); }
```

`failNoReason` is the FSPEC §2.6 row-4 shape: status `failed`, **no** reason code, the error's
message pushed onto §8.4's `dispatchLog` for the report body. It is a distinct helper from `fail`
precisely so that "no reason code" is a named intention in the source rather than an omission a
future edit repairs by inventing a code — which would breach REQ §4b until ER-2 lands.

### 10.3 The failure table

| # | Failure | Mechanism | Observable |
|---|---|---|---|
| 1 | Log absent / unreadable | `_readFile` ⇒ `null`; `classifyCorpus` treats it as empty text | every basename un-consolidated; empty datum ⇒ `no-cadence-datum` |
| 1a | **Corpus unlistable** — `_git(["ls-files", …])` returns `{ok:false}` (§7.1) | `enumerateCorpus` ⇒ `{unlistable: true, detail}`; `main` calls `failNoReason` | `failed`, **no** reason code (vocabularies §1 at 1.4 has no row for it, and §1.3 forbids minting one), the pathspec and `stderr` in the report body. Never `no-op`: an unlistable corpus and an empty one are different claims, and only the latter may advance the cadence datum |
| 2 | Log truncated mid-block | §7.1 step 3's open-span-to-EOF rule | consumption never lost |
| 3 | Unparseable log row | `mintPassId` / `cadenceDatum` skip it | derivation never aborts |
| 4 | Marker present and **non-empty**, unparseable | §7.3 `markerVerdict` ⇒ `reclaim` | `reclaimed-stale-lock`, abandoned id `unknown` |
| 4a | Marker present but **empty** (a released marker, or a write truncated mid-take — indistinguishable) | `_checkFile` ⇒ `{ok:false, reason:"file_empty"}` ⇒ `present === false` ⇒ §7.3 `markerVerdict` ⇒ `free` | the pass takes the marker and proceeds; **no** `reclaimed-stale-lock`. This is a **deliberate, recorded narrowing** of FSPEC §4.2's fourth row, whose `empty (truncated write)` arm it makes unreachable (`FSPEC-…:442`, E-11 `:2592`, AT-M3's truncated *Given* `:2038`) — §7.3 argues why no seam can separate the two states and raises the erratum; §13.3 carries it. Row 4 above is the arm that **is** satisfiable |
| 5 | Marker held and fresh | `refuse` | `refused` + `consolidation-in-progress`; no consumed pair, no commit |
| 5a | **Marker take did not land** — read-back absent, unparseable, or another pass's `passId` (§7.3) | `takeMarker`'s read-back conjunct; `rtWriteFile` (`runtime-adapter.js:802-811`) reports nothing, so the write alone is not evidence | `refused` + `consolidation-in-progress`; no consumed pair, no commit; the AT asserts the terminal status **and** the marker file's content on disk |
| 6 | Neither rung resolves | §10.2's `catch` | `failed` + `advisory-model-unresolved` |
| 7 | Dispatch error (any dispatch) | §10.2's `kind` check | `failed`, no reason code, message in the report body |
| 8 | `_makeTempDir` ⇒ `null` | §9.1 step 1 | `api-failure`, proposal-file fallback with the full diff |
| 9 | `origin`/`pluginRepository` unresolved | `_git`/`_ghRun` `{ok:false}` | `repository-unresolved` + the configured value verbatim |
| 10 | Push or PR-create fails | `{ok:false}` with `stderr` | `api-failure` + the API's status text; auth rejections classify as `credential-unavailable` by observation, per FSPEC §6.3 |
| 11 | Head branch exists remotely | `gh pr list` finds the head, or push is rejected non-fast-forward | `branch-exists` + the existing branch and any PR for it |
| 12 | No credential and no `gh` auth | §9.2's resolution order | `credential: absent` + `credential-unavailable` + degradation |
| 13 | Git refuses the §9.4 commit | after `gitWithLockRetry` | `writes-uncommitted`; status **unchanged**; writes correct on disk |
| 14 | Nothing staged | `NOTHING_TO_COMMIT_RE` | a return, not a warning |
| 15 | `ESCALATIONS.md` absent/unreadable | `_readFile` ⇒ `null` | `no-advisory-corpus`; **no** seam proposal of any kind |
| 16 | Escalation entry missing `Feature`/`Seam` | §7.7's per-entry skip | parse notice; no count under a guessed key; read continues |
| 17 | Failure-mode record short of a field | §7.4's partial record + per-reader arm | parse notice; the pass reaches its terminal status; the record's bytes are unchanged |
| 18 | Config absent / malformed / one bad key | §7.8 | per-key fallback, reported in the body; never a reason code, never a halt |
| 19 | Two files sharing a basename | §7.1's `basenameCollisions` | one set member; the collision **reported** |
| 20 | Corpus id matching no record | §7.5's verdict input | parse notice; counts toward no verdict; no promotion invented |

### 10.4 What is deliberately not handled

- **A second pass racing the marker.** §7.3's read-then-write cannot exclude it; the blast radius is
  bounded by append-only writes and by the PR-route carrier, and the residual consuming-repo
  duplicate is FSPEC §4.5's stated exposure. Nothing here claims to close it.
- **Recovering a corpus consumed by a pass that died at step 8** (O-C1). No vocabularies §1 field
  can express "re-consume these", and inventing a record type would breach REQ §4b.
- **Clone removal failure.** §9.1 issues no removal, so there is no failure to handle.
- **The two enumerations disagreeing on a git-visibility edge case.** §7.1 enumerates the pass's
  corpus with `git ls-files --cached --others --exclude-standard`; the hook keeps `glob.glob`
  (`nudge-consolidation.sh:28`, over §7.1's `CORPUS_GLOBS`), which does not consult git. The two therefore answer different
  questions about the same tree in exactly two classes, both accepted here rather than closed:
  (i) a LEARNINGS file matched by `.gitignore` is in the **hook's** set and not the pass's — the
  operator is nudged about a file no pass will consolidate, and no pass can clear the nudge;
  (ii) a LEARNINGS file **staged but deleted from the worktree** is in the **pass's** set (`--cached`
  lists it) and not the hook's — `_readFile` then returns `null` for its body, which
  `classifyCorpus` treats as an unreadable corpus entry (§7.1) and the pass reports rather than
  crashing on — counted in the volume test, carried in the consumed pair, and named in the report
  body, per §7.1's decision, so it cannot recur forever.

  **What closing each would actually cost, corrected.** An earlier draft of this bullet said that
  dropping `--exclude-standard` "re-admits the two `docs/discarded/` directories §7.1's `:(glob)`
  anchoring exists to exclude". That is **false, and it contradicted §7.1 point 2 of this same
  document**, which says correctly that the exclusion is performed by `:(glob)`. Measured at HEAD:
  `git ls-files --cached --others -- ':(glob)docs/*/LEARNINGS-*.md'
  ':(glob)docs/completed/*/LEARNINGS-*.md'` — the same call with `--exclude-standard` dropped —
  returns the **same five** paths and **zero** under `docs/discarded/`; it is dropping `:(glob)`
  that re-admits them (seven paths). The two flags are independent, and only one of them excludes
  `docs/discarded/`.

  So the real costs are asymmetric, and are stated rather than merged into one impossibility claim:

  - **Class (ii) is genuinely not closable at this layer.** Closing it means teaching the hook
    `git ls-files`, i.e. putting a git invocation on a `SessionStart` path that must also work in a
    non-repository and on a machine with no git on `PATH`. That is a shipped-hook robustness cost
    this feature declines to take.
  - **Class (i) is closable, at one stated price**: drop `--exclude-standard`, and a `.gitignore`d
    LEARNINGS file becomes corpus. `:(glob)` still excludes `docs/discarded/` either way, so the
    price is exactly §7.1 point 3's rule — "an ignored file never is [corpus]" — and nothing else.
    Note the asymmetry, because it decides which way the upstream question should be answered if
    convergence is the goal: the hook has **no** `--exclude-standard` to drop (`glob.glob` sees
    ignored files unconditionally), so dropping it on the JS side is the one edit that makes the two
    sides agree. §13.3 carries that to the REQ rather than presenting both directions as neutral.

  **The choice made here, and why it is provisional.** `--exclude-standard` is **kept**: a
  `.gitignore`d LEARNINGS file is a file its own repository has said is not part of its record, and
  consolidating it would promote evidence into `DOMAIN-CONSTRAINTS.md` from a source no reviewer
  will ever see in a diff. That is the safe direction for a pass that writes to shared project-level
  artifacts. But it is a **product** trade — "is an ignored LEARNINGS file corpus?" is a question
  about evidence, not about mechanism — so it is not settled here alone: §13.3 raises it upstream
  with the enumeration relaxation it belongs to, and if the REQ answers "yes, ignored files are
  corpus", the change is one flag and one line of §7.1, with AT-P1's literal-argv conjunct going red
  until it is updated deliberately.

  The residue accepted meanwhile, stated exactly: class (i) leaves an operator nudged about a file no
  pass will consolidate and no pass can clear; class (ii) leaves a corpus entry the pass reports as
  unreadable. Neither is a correctness divergence — the pass consumes only what its own enumeration
  returned — and no *third* class can arise silently, because §7.1's two literal pins make the
  divergence set derivable from the two enumerations' own text. This is why T-08 is narrowed to the
  **predicate** (§12.2) and why §13.1 row 6 says which half AT-P7 holds equal.

## 11. Test strategy

### 11.1 Levels

| Level | What it ranges over | Seams | Where |
|---|---|---|---|
| **L1 — pure function** | every §7 function, called directly on literal inputs | none | `consolidationPredicate.test.js`, `consolidationIdentity.test.js`, `consolidationEffectiveness.test.js`, `consolidationParse.test.js` |
| **L2 — orchestration** | `main()` end-to-end with doubles for every seam; the §12 acceptance tests live here | all doubled | `consolidationPass.test.js`, `consolidationRoute.test.js`, `consolidationCredential.test.js` |
| **L3 — build, artifact & source text** | the bundle is emitted, is in sync, carries no `import(`, and its `meta` is first and literal; plus the source-text oracles (§3.3's `.gitignore`, §11.3(e)'s adapter prompts, §12.3's AT set-equality) | none | the **await-audit and bundle** assertions extend the shipped `runtimeBundle.test.js` in place (they edit its own `AWAIT_SCAN_SOURCES` and `AT19_SEAM_NAMES` sets); the feature-scoped source-text oracles live in `consolidationBuild.test.js` and `consolidationTraceability.test.js`, so this feature adds no row to a shipped suite that is not a set member of one it already owns |
| **L4 — differential** | the JS predicate against the shipped `nudge-consolidation.sh` over one fixture table | a real `python3`/`bash` subprocess | `consolidationHookParity.test.js` (AT-P7). The same file also carries two non-AT cases: one **L3** source-text case — §7.1's pin (b), the hook-side enumeration pin over the `CORPUS_GLOBS` declaration — which runs whether or not the L4 rows degrade, since it shells out to nothing; and one **L4** pathspec-semantics case (below) |
| **L5 — property** | the four T-09 components | none | `consolidationProperties.test.js` |

L3 is a **set over two axes**: the sources scanned (`AWAIT_SCAN_SOURCES` gains
`consolidate-learnings.js`) and the seam names scanned for (`AT19_SEAM_NAMES` gains `_envPresent`
and `_makeTempDir`) — §11.3(c). L3 also carries §11.3(e)'s adapter-prompt assertion and §3.3's
`.gitignore` text assertion, both source-text checks in the shape `runtimeBundle.test.js` already
uses.

L4 is the only level that shells out. It never touches the repository's own `docs/` tree — the
differential harness writes its fixture
corpus into a temp directory and points the hook at it through `CLAUDE_PROJECT_DIR` (`:26`), which
is what makes the harness a pure function of an injected root (DC-04).

**One further L4 case, and why it is worth a subprocess.** Pin (a) asserts the argv the pass hands
`_git`; what makes *that particular* argv correct — that `:(glob)` stops `*` crossing a `/`, so
`docs/discarded/` is excluded by the pathspec and not by a filter — is measured in §10.4's prose and
otherwise asserted by nothing. A measurement in a document is not an oracle. So the file carries one
`(no FSPEC AT)` L4 case that runs **exactly the argv pin (a) pins** through a real `git`, and asserts
zero results under `docs/discarded/` and at least one under `docs/completed/`. It runs against a
**temp repository the case builds itself** (`git init`, three LEARNINGS files under
`docs/{f}/`, `docs/completed/{f}/`, `docs/discarded/{f}/`, `git add -A`), reached with `_git`'s
own `["-C", dir, …]` form — never against the repository under test, so DC-04 holds here exactly as
it does for the differential harness, and the assertion cannot drift as this repo's own `docs/` tree
grows. It is **outside** the differential fixture table and therefore outside the executed-row counter
below — its subject is git, not the hook, and folding it in would make `executed === TABLE.length`
false for a reason that has nothing to do with the interpreter probe.

**A skipped L4 is distinguishable from a passing one.** The hook's own `PY_BIN` probe (`:13-20`)
degrades to a silent `exit 0` when no usable interpreter is found, and a differential test that
inherits that degradation silently is the test that will be skipped on the platform where it
matters. So the suite uses jest's `test.skip` — which reports as **skipped**, not passed, in the run
summary — and emits a `console.warn` naming the probed candidates (`python3`, `python`, `py`) in the
branch where it finds none. Answering the reviewer's question directly: the notice is the jest
reporter's skip line plus that warning, and CI's `Unit tests` job surfaces both.

An earlier draft added a second assertion here — "the probe either found an interpreter **or**
recorded the notice" — and it is **withdrawn**: the harness itself emits that notice in the branch
where the probe found nothing, so the disjunction is a tautology over the harness's own control flow
and can only pass. It is replaced by the one thing in this area that is falsifiable: **the count of
executed differential rows is either the full fixture table's length or exactly zero**, asserted
unconditionally. All-or-nothing is the real invariant — a harness that silently ran *some* rows
(a mid-table interpreter failure, a fixture that threw and was swallowed) is red, where the
disjunction was green.

**Where that count comes from, since only one of the two answers is an oracle.** It is **not** read
from the fixture table's length — that is derivable from the table itself and would be
self-satisfying. The harness holds a counter that each row increments **as its last statement, after
its own assertions have passed**, and an `afterAll` asserts `executed === TABLE.length || executed === 0`.
So an interpreter that dies at row 4 of six leaves `executed === 3`, which is neither, and reds; a
row that throws and is swallowed never reaches its increment, and reds; a wholesale `test.skip` of
the suite leaves `executed === 0`, which passes, which is the one legitimate all-skip case.

**The degradation is decided once, before any row runs, and it skips every row — never a subset.**
The `PY_BIN` probe is performed once at module scope; if it finds no usable interpreter the file
declares each differential row through `test.skip` and emits the `console.warn` above. There is no
"degraded probe" path on which rows still execute against a weakened comparison, which is the only
way `executed === TABLE.length` could be reached with nothing real behind it: a row either runs the
real interpreter or is not declared as a running test at all. The `afterAll` counter assertion itself
is **not** skipped — it runs in both worlds, which is what makes `0` an asserted outcome rather than
an unobserved one.

### 11.2 Test doubles — reuse first (DC-08)

| Seam | Double | Source |
|---|---|---|
| `_agent` | `makeAgentDouble({script, throwOn})` | `__tests__/helpers/advisoryDoubles.js` — already built to drive `isModelResolutionError` from a scripted rejection *message*, which is exactly what FSPEC §2.6 rows 2–4 need |
| `_git` | `fakeGit(script)` | `mergeDoubles.js`, re-exported by `advisoryDoubles.js` as `makeGitDouble` |
| `_ghRun` | `fakeGhRun(script)` — **not** `passingGh` | same. `matchKey` (`mergeDoubles.js:45-60`) keys both new surfaces cleanly (`gh pr list --json url,state,body`; `gh pr create`), so `fakeGhRun` needs no change. `passingGh`'s defaults (`:93+`) answer only the six shipped Phase MERGE surfaces, so the consolidation suites build their **own** script map rather than widening it, and `GH_SURFACE_NAMES` (`:181` — `Object.keys(SURFACE_KEY_BY_NAME)`) does **not** grow: it is the set `passingGh` is obliged to answer, and this feature adds no obligation to that helper |
| `_readFile` / `_writeFile` / `_appendFile` / `_checkFile` | `fakeFs(initialContents, opts)` | `__tests__/helpers/seams.js` |
| `_listFiles` | `fakeListFiles(spec)` | same — wired for protocol completeness only. **No consolidation test drives it**: the corpus is enumerated through `_git` (§7.1), precisely because the double is more capable than the seam it doubles. A test that reached for it would be re-introducing the DC-07 hazard §7.1 removes |
| clock, sleep | `fakeNow`, `FIXED_NOW_MS`, `fakeSleep` | `mergeDoubles.js` |
| PRNG | `seeded`, `resolveSeed` | `driftGenerators.js` — the repo's one seeded-PRNG library |

**Two new factories only**, both in `__tests__/helpers/consolidationDoubles.js`, because the seams
they double do not exist yet: `fakeEnvPresent(presentNames: Set<string>)` and
`fakeMakeTempDir(path | null)`. That module also holds this feature's fixture builders (a log
builder, a corpus builder, an `ESCALATIONS.md` builder) so no test file constructs a log by string
concatenation — the same single-canonical-double rule `seams.js` and `advisoryDoubles.js` state in
their own headers.

**One wrapper, not a third factory: `asAsync(double)`.** `seams.js`'s doubles are **sync** — that is
stated in its own header as the central hazard, and it is what makes an un-awaited seam call
invisible to every L2 suite (§10.1). `asAsync` takes any of them and returns a function that
**defers both the recording and the resolution onto a macrotask** and returns the promise:

```js
const asAsync = (fn) => (...args) =>
  new Promise((resolve) => setTimeout(() => resolve(fn(...args)), 0));
```

**The deferral must be a macrotask, and specifying it as a microtask would have shipped a test that
can only pass.** A microtask deferral (`Promise.resolve().then(…)`, an `await` inside the wrapper)
cannot survive a caller that awaits at all, because awaiting is itself microtask-scheduled: on the
broken implementation the wrapper's continuation is queued *before* the test's `await main()`
continuation, so it runs first, the write lands, and the assertion is green. Timer callbacks run in
a later phase of the event loop than the whole microtask queue, so the discrimination becomes exact:

| Implementation | What the test's `await main()` continuation sees |
|---|---|
| correct (`await appendTerminalRow(state)`) | `finishPass` suspends until the timer fires and the double records; `main()` resolves **after** the write ⇒ terminal row **present** |
| broken (`appendTerminalRow(state)` un-awaited) | the pending promise is dropped, `main()` resolves on a microtask, the assertion runs **before** the timer fires ⇒ terminal row **absent** ⇒ RED |

Recording is deferred with resolution, not performed eagerly, for the same reason: `appendTerminalRow`
is a void write whose only observable *is* the double's accumulated text, so a wrapper that recorded
synchronously and deferred only its result would leave the missing `await` invisible by construction.

**Two hygiene constraints the wrapper's timers impose, since they change whether the suite is quiet
rather than whether it discriminates.** On the *broken* implementation the assertions run while a
`setTimeout` is still pending, so (i) every double instance is constructed **per case**, inside the
case body, never at module scope — a late timer must never be able to write into a double a later
case reads; and (ii) the case drains the loop before it returns (`await new Promise(r => setTimeout(r, 0))`
after its assertions), so jest sees no open handle and the failure it reports is the assertion, not a
teardown warning. Neither changes the discrimination in the table above; both are required of the
PLAN task that writes the row.

**The row owes its own mutation check.** `consolidationLifecycle.test.js` is the only oracle for an
invariant §10.1 states nothing else guards, so the PLAN task that writes it must demonstrate it
fails: delete one `await` inside `finishPass`, expect RED, restore. A test whose falsifier has never
been observed is a claim.

Scope: it exists for exactly one row — §12.2's T-13 await-discipline test, which drives
`asAsync(fakeAppendFile)` / `asAsync(fakeWriteFile)` / `asAsync(fakeGit)` and asserts **after**
`main()`'s promise resolves. No other suite uses it: the rest deliberately keep the sync doubles,
because their subject is the pass's logic, not its await discipline. (Only the *intra*-`finishPass`
`await`s are behaviourally observable this way — §10.2's two `return await finishPass(…)` call sites
are a stack/`try`-semantics improvement, since an `async` function's `return p` already adopts `p`.
T-13 is scoped to the observable defect and does not claim the other two.)

### 11.3 The oracles that need a mechanism, not just an assertion

Six assertions the FSPEC states cannot be written as a plain `expect` and are specified here.

**(a) The seam-verb spy (AT-Q7, AT-Q7b, AT-Q7c).** A recording wrapper around `_git` and `_ghRun`
that classifies each call with **both** of the module's own classifiers (§9.3) — `resolveSeamDomain`
for the bin and `resolveSeamVerb` for the verb — passing the clone directory the test's
`fakeMakeTempDir` returned as `cloneDir`. The spy computes neither half itself; that is the point of
exporting the domain function, and it is what puts the `clone` call (which carries no `-C` prefix)
in the clone domain by the contract's own rule rather than by a special case in test code.

The oracle is then **four** set assertions: **partition** — every observed call is classified into
exactly one domain, and the union of the three observed sets equals the set of all observed calls
(without this, a call that falls out of the partition is exempt from containment); **containment**
`observed ⊆ permitted` per domain, universally; **obligation** `obliged ⊆ observed` per domain, on
the Given that obliges it; and the two `∅` equalities of AT-Q7c. Comparison is over a `Set`, never a
multiset — AT-Q2's three commits are three occurrences of one verb. AT-Q7b's supplementary source
check greps the module's own source for a merge verb and is never the sole evidence.

**(b) The vocabulary set-equality (AT-L5).** The harness collects the enumerated-class values a
fixture set produced and compares them against a transcription of vocabularies §1 at `Version` 1.4
held in `consolidationDoubles.js` as a literal table. Both directions are asserted. The free-form
class is excluded **by name**, so narrowing the domain cannot silently drop a direction. Because
§6.4's frozen catalogues are the module's own source of those values, a third assertion is cheap and
included: catalogue array ⊆ §1 transcription and vice versa, which fails at build time rather than
after a fixture happens to exercise a branch.

**A fourth leg reads the authority file itself**, and without it the first three are two copies
compared with each other. The module's frozen arrays and the doubles' literal table are **both**
transcriptions; a future edit that widens the catalogue and updates the doubles' table in the same
commit — the natural thing to do when a test goes red — passes every assertion above while
`pdlc-consolidation-vocabularies.md`, which is the authority and is version-pinned and
change-controlled, is never consulted. §6's premise is "transcribed, never widened", and a test that
cannot observe the thing transcribed *from* cannot falsify it.

The harness therefore parses the authority file's §1 table — a markdown table with a stable grammar
— and asserts **three-way** set equality per catalogue: module catalogue ≡ doubles' transcription ≡
authority file, in both directions, plus a pin that the file's `Version` cell still reads `1.4`
(if it does not, the pinned transcription is stale by definition and the test must be re-read, not
re-greened). Per DC-04 the parser is a pure function of an injected `root`, so it can probe two
roots in one process. This shape is reusable: every feature that transcribes a project-level shared
reference has the same two-copies problem, which is why the finding behind it is `Cross-Feature`.

**(c) The `await` audit.** `seams.js`'s header names the sync-double/async-adapter asymmetry as the
central hazard: a missing `await` passes L1 and L2 and fails only in production. The compensating
control is the shipped one — the L3 suite's source scan, extended to
`consolidate-learnings.js`: every call to an injected seam identifier must be syntactically
`await`ed. This is a static check over the module's own text, not a runtime assertion, because a
sync double makes the runtime one unfalsifiable.

**The audit is a set over two axes, and both must grow.** Extending only the source set leaves the
scan green on exactly the seams this feature invents: what it scans *for* is a frozen name list,
`AT19_SEAM_NAMES` (`__tests__/runtimeBundle.test.js:215-223`), whose members are `_agent`,
`_readFile`, `_writeFile`, `_appendFile`, `_checkFile`, `_listFiles`, `_git`, `_checkCi`,
`_mergeWorktree`, `_recordQueueRow`, `_rebaseOntoDefault`, `_dodVerifyLoop`, `_raisePrAndVerifyCi`,
`_ghRun`, `_runCommand` — and neither `_envPresent` nor `_makeTempDir` is on it. So §5.1's "every
seam call is `await`ed without exception" would be enforced for every seam **except** the new ones,
and `RLH-SCAN-01` (`:626`) would report green over them. This feature therefore adds
`"consolidate-learnings.js"` to `AWAIT_SCAN_SOURCES` (`:1040`) **and** `_envPresent` /
`_makeTempDir` to `AT19_SEAM_NAMES`, in the same commit. `_now` is deliberately not added: it is
sync by contract (§5.6(b)) and awaiting a number is noise, not discipline.

**(d) The `parseAdvisoryConfig` parity test.** §7.8's duplication is pinned by a table-driven test
that runs both parsers over the same five observed states and asserts the same classification, so a
future change to one is a red test rather than a silent divergence.

**(e) The adapter-prompt assertion for the widened path contract (§5.6(a)).** `rtWriteFile` is an
agent prompt, so its behaviour cannot be executed in a unit test — but its **text** can be read, and
the repo already reads `runtime-adapter.js`'s source in a test (`runtimeBundle.test.js:1573-1580`
lists it in the C0-control-byte scan's `SOURCES`; that precedent establishes *reading the file*, not
matching prompt text, so the prompt-text match is a new shape — stated plainly rather than
borrowed). The assertion is scoped to **`rtWriteFile`'s prompt only**, and has two conjuncts:

1. the widened absolute-path clause of §5.6(a) appears verbatim inside `rtWriteFile`, so a future
   edit that reverts it to the bare "relative to the repository root" reds rather than silently
   breaking every clone write;
2. the string `"relative to the repository root"` occurs in `runtime-adapter.js` **exactly once** —
   the count is the falsifier for the opposite mistake, someone "harmonising" `rtReadFile` by adding
   the clause there (§5.6(a) records why that would be gratuitous).

There is deliberately **no** assertion over `rtReadFile`'s prompt text: it carries no
path-resolution clause today and gains none, so an assertion there could only pin text that does not
exist — which reds on a correct tree and gets "fixed" by deletion. This is the L3 counterpart of the `_envPresent` prompt review
in §11.6: a capability the feature *invents* is not in the same class as "the real `gh` accepts
these flags", so it does not get that section's exemption.

**(f) AT-P7, the differential predicate harness (T-08).** The harness writes one fixture corpus into
a temp directory, points both implementations at it (the hook through `CLAUDE_PROJECT_DIR`, `:26`;
the JS through `classifyCorpus` over the same enumerated basenames and log text), and compares the
**sets**. The hook's set is read from the `PDLC_PENDING:` stderr line §7.1 adds — the shipped hook
emits only a count, and only above `THRESHOLD = 5` (`:25`, `:43`), which is blind on every
discriminating fixture. Three conjuncts per fixture row, so the oracle is positive rather than
invariance-only: the JS set equals the hook set in both directions, **and** each equals the expected
set transcribed literally in the fixture table — without the third, two implementations that both
return `∅` agree perfectly. The table covers the truncated block (E-04), the stray closer (E-05),
the basename collision (E-09), the legacy/block boundary, one row above the threshold so the
shipped `additionalContext` count is also compared, and a **zero-corpus** row that asserts
`PDLC_PENDING:` is emitted with an empty value (§7.1's relocated early exit) — so `∅` is read
positively rather than inferred from silence. L4 degrades exactly as the hook does when no
usable Python interpreter is found (`PY_BIN`, `:13-20`); §11.1 states the recorded notice.

**What this harness does not falsify, stated rather than implied.** Feeding both sides the same
basename list holds the **predicate** equal and holds the **enumeration** equal by construction —
so the enumeration pair (`git ls-files --cached --others --exclude-standard` on the JS side,
`glob.glob` over `CORPUS_GLOBS` on the hook's) is outside AT-P7's reach entirely. That is deliberate, and it is
the reason the fixtures are fed rather than enumerated: the fixture temp directory is not a git
repository, so `enumerateCorpus` could not run there without a `git init` and a staged index, and
even with one the two enumerations are **not** equal in general — §10.4 records the two divergence
classes that make an equality assertion red on correct code. §12.2's T-08 row is narrowed to the
predicate to match, and §13.1 row 6 names which half is held. The residual exposure is an operator
nudge that disagrees with what a pass will consolidate; it is a reporting divergence, never a
correctness one, because the pass consumes only what its own enumeration returned.

**Out of *this harness's* reach is not out of every test's reach.** The enumeration half is held by
the two literal pins §7.1 specifies, and they are deliberately **not** both this file's: pin (a) is
AT-P1's **L1** argv conjunct on the JS side, and it lives with AT-P1 in
`consolidationPredicate.test.js`, because the thing asserted is the array `enumerateCorpus` hands
`_git` at runtime, which a source-text read could not see. Pin (b) is the **L3** source-text read of
the hook's `CORPUS_GLOBS` declaration, and that one is this file's, because its subject is the two
implementations' relationship. (An earlier draft of this paragraph claimed both — the correction is
argued in §7.1 and reflected in §11.1, §12.2's T-08 row and §12.3.) They
do not assert the two sets are equal (they are not, in general); they assert the two *questions* are
the ones §10.4 computed its divergence classes from, so a later edit to either side cannot introduce
a third class silently. "Held by inspection" would have been the wrong answer and is not the one
given: an equality this harness cannot run is replaced by two pins it can.

One consequence for the fixture table: `classifyCorpus` is driven directly, not through
`enumerateCorpus`, so **no fixture may be written that depends on git visibility** (an ignored file,
a staged-but-deleted file). Such a fixture would assert a divergence the harness cannot observe and
would read as coverage of the enumeration half.

**That rule lives in the code, not only here.** It is written into the header of
`consolidationDoubles.js`'s fixture builder — the same place `seams.js` and `advisoryDoubles.js`
state their own single-canonical-double rules — because a constraint a later contributor must not
violate is one they must be able to read where they are working. The TSPEC states the reason; the
header states the rule.

### 11.4 Property strategies (T-09)

One strategy per parameterisable component, all drawn from `driftGenerators.js`'s `seeded`/`resolveSeed`
— **no property-testing dependency is added**, matching the shipped decision recorded in that file's
header.

| Component | Generator | Invariant |
|---|---|---|
| §7.1 two-region predicate | random interleavings of openers, closers, stray basenames and prose, over a random enumerated corpus | every basename inside any block is consolidated; the predicate is total (never throws) and every enumerated file lands in **exactly one** of the two sets |
| §7.2 `passId` | a random multiset of rows, a random subset made unparseable | the minted id is strictly greater than every parseable `{today}` id; unparseable rows change nothing; the result is invariant under row permutation |
| §7.8 config parse | a random subset of keys corrupted by type | every uncorrupted key keeps its configured value; every corrupted key takes its documented default; `invalidKeys` is set-equal to the corrupted subset |
| §7.7 escalation count | a random entry sequence with a random subset missing `Feature` or `Seam` | the total attributed count equals the number of entries carrying both rows; no count is attributed to a key absent from the input |

Two further properties are added beyond T-09's four because they are the FSPEC's determinism claims
and an example cannot range over them. **Order-invariance alone is not an oracle** — a function
returning a constant, `[]` or `null` satisfies it — so each pairs the invariance with a positive
conjunct on the same path, the shape the four rows above already have:

| Component | Generator | Invariant **and** positive conjunct |
|---|---|---|
| §7.4 `mergeProposals` | a group of ≥2 proposals sharing `(failureModeId, action)`, in a random permutation. The shared id is **derived**, never assigned: the generator draws one random `(phase, artifact)` pair and computes `failureModeId(phase, artifact)` from it, so the property ranges over inputs a pass can actually construct. Assigning the id independently would admit `(id, phase, artifact)` triples no pass produces, and a counterexample there is not a defect | the fold is invariant under permutation, **and** for at least one ordering the folded proposal's `kind`, `artifact`, `target`, `elidedKinds` and `elidedArtifacts` equal values transcribed literally from §7.4's fold table |
| §7.5 `effectivenessTable` | two passes' records appended in a random order, dates unchanged | the table is invariant under that order, **and** the row count equals the number of distinct ids, **and** each row's `verdict` equals the arm §7.5 assigns it |

The subject of the first is `mergeProposals`, not `failureModeId`: §7.4's own invariance argument
("byte order is total over distinct strings, and a group's members are distinct by construction")
is about the **fold**, and `failureModeId(phase, artifact)` takes no proposals at all, so order
cannot be a variable of it. An earlier draft named the wrong function.

### 11.5 Where the FSPEC's deferrals land

FSPEC §14.5's register (LD-1 … LD-5) is PROPERTIES-owned per `DEC-LAYER-01` and passes through this
layer unchanged. This TSPEC states only **where** each will be written, so the PLAN can name a task:
LD-1 (three `artifact` arms), LD-4 (`passId` arm) and LD-5 (the four remaining short-record arms) all
range over `parseLogRecords`'s output and its readers, so they belong in
`consolidationParse.test.js` beside AT-F21; LD-2 (the `target`-follows clause) and LD-3
(two-action-one-subject) range over `mergeProposals` and belong in `consolidationIdentity.test.js`
beside AT-R6b. Nothing about their fixtures is decided here.

One standing caution passes through with them: no AT-A fixture may be written against the REQ's
AC-6.3 "across the consumed window" wording. FSPEC §9.5 / BR-37a is the settled contract —
`seamCandidates` ranges over **every** entry in `ESCALATIONS.md` (§7.7) — and a fixture taken from
the REQ text would red a conforming implementation.

### 11.6 What is not tested, and why

- **The producing side of the `failure-mode-id` convention** (a harvest agent copying an id). Its
  output is an LLM invocation with no reproducible result; the receive side is AT-F15/AT-F16 and the
  gap is FSPEC O-C6.
- **The real `gh` and the real network.** Every PR-route test drives `fakeGhRun`. The one thing that
  cannot be asserted this way — that a real `gh pr create` accepts the flags §9.2 builds — is
  covered the way the repo already covers `mergeCommandFor`: by an exact-string test over the
  builder's output, reviewed against the CLI's documented interface.
- **`_envPresent`'s adapter transport.** It is an agent prompt; the module-side contract (a boolean,
  fail-closed on anything unparseable) is tested with a double, and the prompt itself is reviewed,
  not executed — the same posture every other `runtime-adapter.js` transport takes.

**No longer on this list: the clone's writes.** An earlier draft exempted the whole PR route on the
"real `gh` and the real network" ground, which also swept up `_writeFile`'s behaviour on an absolute
path — a capability this feature *invents* (§5.6(a)), not a shipped one it merely drives. That is a
different class, and it left an AC-3.1/NFR-2 chain with no production-path evidence anywhere. The
prompt text is now pinned by §11.3(e), and the module-side path handling is exercised by the
`fakeMakeTempDir` route tests. The exemption that remains is narrow and stated: nothing here
executes a real agent, so the *transport* is still reviewed rather than run.

## 12. Traceability

### 12.1 FSPEC unit → TSPEC mechanism

Every `FSPEC-CONS-0N` unit appears exactly once; no row names a unit the FSPEC does not carry.

| FSPEC unit | § | Mechanism | § |
|---|---|---|---|
| CONS-01 Tick evaluation and pass lifecycle | §2 | `triggerFor`, `mintPassId`, the single-exit `finishPass` | §7.2, §10.1 |
| CONS-02 Consumed predicate and corpus | §3 | `enumerateCorpus`, `classifyCorpus`, `renderConsumedPair`; hook parity by differential test | §7.1 |
| CONS-03 The in-progress marker | §4 | `parseMarker`, `markerVerdict`, `takeMarker`, `releaseMarker`; `.gitignore` text | §7.3, §3.3 |
| CONS-04 Routing and consuming-repo writes | §5 | `routeOf` over the imported `MERGE_GUARD_DEFAULTS`; `commitConsumingRepoPaths` | §7.6, §9.4 |
| CONS-05 The pull-request route | §6 | `openClone`, `mergeCommandFor`'s two new surfaces, `resolveSeamVerb` | §9.1 – §9.3 |
| CONS-06 Credential handling | §7 | `_envPresent` (boolean-only seam), shell-expansion of the value, resolution order | §5.3, §9.2 |
| CONS-07 Falsifiability | §8 | `failureModeId`, `mergeProposals`, `effectivenessTable`, `openPromotionList`, `remediationChoice` | §7.4, §7.5 |
| CONS-08 Advisory-corpus input | §9 | `parseEscalations` (table rows, never the heading), `seamCandidates` | §7.7 |
| CONS-09 Reporting and the log grammar | §10 | four one-record appends, `renderTerminalRow`'s dropped-code return, `renderReportBody` | §7.9 |
| Configuration parse | §11 | `parseConsolidationConfig`, parity-tested against `parseAdvisoryConfig` | §7.8 |

### 12.2 FSPEC obligation → discharge → falsifying test

| # | Obligation | Discharged | Falsified by |
|---|---|---|---|
| T-01 | names, signatures, placement | §3.1, §4, §5.1 | the suites compile against the named exports; L3 asserts the module's shape |
| T-02 | build entry, manifest row, resolver reach | §8.2, §8.3 | L3: `build-runtime.mjs --check` clean, four rows stamped, no `import(` in the bundle |
| T-03 | the temporary clone | §9.1 | AT-Q1 (clone under a temp dir, invoking tree untouched) |
| T-04 | seams + `_log` capture | §5.1, §8.4 | AT-M7 (the `ADVISORY_MODEL_FALLBACK:` line verbatim), AT-M6/AT-M9 (the error message verbatim) |
| T-05 | the resolver widening | §8.1 | AT-M10 (default unchanged on every path) |
| T-06 | `ESCALATIONS.md` parse | §7.7 | AT-A7 (missing `Feature` row), the §11.4 count property |
| T-07 | the `.gitignore` text | §3.3 | `consolidationBuild.test.js` — a jest case reading the tracked `.gitignore` and asserting the comment line and the pattern line verbatim and adjacent. **Not** a maintainer check: a human step goes nothing-red when the pattern is later rewritten slash-free or `**/`-prefixed, which is the exact drift §3.3 argues against |
| T-08 | shared code vs. two implementations (FSPEC §14.1). **Decided**: two implementations (§13.1 row 6). The evidence is split by kind, not weakened by default: the two predicates are held **equal** by a differential; the two enumerations are held **pinned** (each side's question fixed literally) rather than equal, because they are not equal in general — §10.4's two divergence classes are the accepted residue, and §13.3 raises the relaxation of REQ `:115-116`'s "one enumeration" upstream as an erratum rather than settling it here | §7.1, §10.4, §13.1 row 6 | **Predicate half — AT-P7** (differential, L4): `classifyCorpus`'s two-region predicate against the hook's `:41` predicate, both fed the same basename list. **Enumeration half — two literal pins** (§7.1), not inspection: (a) **AT-P1**'s first conjunct asserts the argv handed `_git` element-by-element, both `:(glob)` prefixes included, so the `docs/discarded/` exclusion is decided by the pathspec and not by a fixture (its second conjunct is the positive membership case; §7.1 states why "a discarded line is filtered out" is deliberately *not* asserted); (b) an L3 source-text read in `consolidationHookParity.test.js` pins the hook's `CORPUS_GLOBS` declaration (located by name, never by line index — §7.1) to exactly two glob-pattern literals and no third, with the conjunct that `glob.glob(` occurs once and inside the comprehension over it. **The two pins sit at different levels and in different files deliberately** — (a) is L1 over the `_git` double because its subject is the array handed at runtime, (b) is L3 source text because the hook is a Python heredoc no JS test can call; §7.1 argues why the uniform-L3 reading an earlier draft carried was the weaker one. Together they make §10.4's divergence set derivable and closed: a widening on either side reds. AT-P7 itself does **not** falsify the enumeration pair, and this row says so rather than implying coverage it has not got |
| T-09 | a property per component | §11.4 | the four properties themselves; the PLAN carries them as tasks, not as prose |
| T-10 | the unavailable spellings | §6.5 | AT-Q10's literal-text conjunct; LD-1/LD-4's PROPERTIES fixtures |
| T-11 | **the PR body** — AC-3.2's three citations, AC-3.7(c)/REQ-CONS-03's three vocabularies §4 trailers, `PDLC-CONSOLIDATION-PROMOTIONS` set-equal to the proposals the PR enacts (the NFR-4 duplicate key) | §7.9 `renderPrBody`, `renderPromotionCommitMessage` | `consolidationRoute.test.js`, re-bound to the register's actual text (`FSPEC-…:2064-2077`): **AT-Q2** — three promotions in one pass, one PR ⇒ three commits each carrying a distinct `PDLC-PROMOTION-ID: {id}:{action}` **and** `PDLC-CONSOLIDATION-PROMOTIONS` **set-equal** to the three pairs. AT-Q2 carries *both* trailer obligations; an earlier draft split them across AT-Q5, which is about a merged `promote` not suppressing a `revise`/`retire`. **AT-Q3** and **AT-Q9** — the writer↔reader round-trip: each supplies a prior PR carrying the trailer `renderPrBody` writes and asserts `enactedByPr` reads it back (AT-Q3 on an open PR ⇒ `duplicate-suppressed`, `suppressed-by:` naming the pair, `pr:` empty; AT-Q9 on a PR whose branch was deleted unmerged ⇒ the trailer survives and still suppresses). **AC-3.2's three body citations have no AT in the register** — the FSPEC's own AC→AT map (`:2269`) binds AC-3.2 to AT-Q2, which asserts only the trailers. That gap is recorded here rather than papered over by naming a nearby id, and is raised upstream as an erratum. **The gap is also covered here meanwhile, not merely reported**: `consolidationRoute.test.js` carries a **(no FSPEC AT)** case — one pass over two source LEARNINGS, asserting that `renderPrBody`'s output contains, for each promotion, the source feature name, the failure mode's name, and the AC-2.3 evidence string. **Where those three expected values come from is the whole oracle, so it is stated without ambiguity: they are transcribed from the fixture LEARNINGS corpus the pass was handed, never from `state.promotions[i]` or any other field of the produced record.** The case runs at L2, where the record is produced by the pass under test; reading the expected strings off the record would green it even when the pass and the renderer drop the same field together — which is exactly the AC-3.2 failure an operator sees (a PR body citing nothing). Reading them from the input corpus makes it a relational oracle between input and output. It claims **no** register id, exactly as T-13's row and the dropped-code notice do, so §12.3's set equality is undisturbed and the erratum landing turns it into an id-bearing row rather than a duplicate |
| T-12 | **the proposal file** — AC-3.5's full inline diff plus the failure class recorded by name; AC-3.4's second clause | §7.9 `renderProposalFile` | `consolidationRoute.test.js`, re-bound: the two degradation classes in the register are **AT-Q6** (`branch-exists` — "fallback proposal file carries the full diff, the existing branch and any PR for it are named") and **AT-Q8** (`api-failure` — "the API's status text recorded verbatim; fallback proposal file carries the full diff; the pass does not halt"). AT-Q9 is **not** a degradation class (it is the deleted-branch trailer-survival case) and AT-Q11 is **not** about the file's existence condition (it is the two-run byte-identity of `DOMAIN-CONSTRAINTS.md`); both were mis-bound in an earlier draft. **FSPEC §5.3's "when, and only when" has no AT of its own**: the register carries the positive direction through AT-Q6/AT-Q8 but nothing asserts the *negative* — that a pass which enacts everything writes no proposal file. Recorded as a gap and raised upstream as an erratum rather than bound to an id that asserts something else — and covered here meanwhile by a second **(no FSPEC AT)** case in `consolidationRoute.test.js`: a pass whose every promotion is enacted (the PR merged, or every target written) writes **no** `CONSOLIDATION-PROPOSAL-{passId}.md` — asserted through the write double's recorded path set, with the positive control in the same case that a one-degraded-promotion fixture *does* write it, so the negative cannot pass on a fixture that wrote nothing at all. It claims no register id, so §12.3's set equality is undisturbed. **AC-3.4 answered explicitly:** the file carries `state.prUrl` when a PR was also opened; when the pass enacts everything there is no proposal file (FSPEC §5.3's "when, and only when") and AC-3.4's second clause is **vacuous** — the URL lives in the terminal row's `pr:` field alone |
| — | `renderTerminalRow`'s **dropped**-code arm (§6.4, §7.9) | §7.9 | `consolidationReport.test.js`, under **AT-L5** — its "no enumerated value without a §1 row" direction is exactly what the illegal fixture discharges, so this mints no new id and §12.3's set equality is undisturbed. The report-body **notice** naming the dropped code is a TSPEC-added observable with no register id, in the same class as T-13's row. Two fixtures over one code: one whose `(status, code)` pair is legal at `Version` 1.4 and appears in the row, one whose pair is illegal and is dropped — the drop is then *observed* against a control rather than assumed. The AT asserts the row's field set **and** the report body's notice naming the dropped code. `no-cadence-datum` is deliberately not that code: vocabularies §1 permits it with `refused`, and REQ-CONS-01 decides it at step 3/4 before the marker check, so the drop must never fire for it — which the same test asserts as its control |
| T-13 | **await discipline across `finishPass`** (§10.1) — the three terminal steps are seam writes reached through module functions, so neither §11.3(c)'s identifier scan nor any sync-double suite can see a missing `await` | §10.1 | `consolidationLifecycle.test.js`: one case driving `asAsync(fakeAppendFile)` / `asAsync(fakeWriteFile)` / `asAsync(fakeGit)` (§11.2) and asserting, **after `main()`'s promise resolves**, that (i) the terminal row is present in the log double's accumulated text and (ii) the marker is **released** — the write double's **last** recorded contents for `docs/_decisions/.consolidation-lock` are the empty released form §7.3 decides, having been the `IN-PROGRESS: {passId} …` line **earlier in the same double's recorded write history**. Conjunct (ii) is stated against that observable and not against "gone", because §7.3's release is an in-place `_writeFile` and no seam in this protocol removes a file. Its take-side precondition is load-bearing: a bare absence is equally true of a `refused` / `skipped-cadence` fixture or a take that never landed, so without it the AC-1.3 half passes vacuously. `asAsync` defers on a **macrotask** (§11.2): a microtask deferral is drained by the test's own `await main()` and would green both conjuncts on the broken implementation. Both conjuncts fail on a missing `await` inside `finishPass` and pass on an awaited one; this is the only row that distinguishes *written* from *scheduled*, so the PLAN task that writes it owes the mutation check §11.2 states (delete one `await`, expect RED) |
| — | **an enumerated file whose body cannot be read** (§7.1, §10.4 class (ii)) — the decision mints three observables (it counts toward `\|un-consolidated\|`, it appears in the consumed pair, its basename is named in the report body) and no register AT reaches any of them: AT-P8 is the unreadable **log** file, not an unreadable LEARNINGS body | §7.1, §10.4 | `consolidationPass.test.js`, **(no FSPEC AT)** — **one fixture carrying both an unreadable and a readable corpus member**, so every conjunct has its control in the same case: the corpus enumerates two basenames, `_readFile` returns `null` for one and a body for the other, and the case asserts (1) `\|un-consolidated\|` counts **both** (the volume trigger fires on the same count it would with two readable members — a count that silently drops the unreadable one makes the trigger fire late and nothing else reds); (2) the consumed pair rendered by `renderConsumedPair` contains **both** basenames (the convergence argument §7.1 rests on: an implementation that drops the unreadable one from the pair passes every other row in this table and re-offers the file on every subsequent pass forever); (3) the report body **names the unreadable basename** as an entry the pass could not read, and does **not** name the readable one in that list. Stated as a pair rather than as an absence throughout — the readable member is the control that keeps (1) and (3) from passing on a fixture where nothing was readable |
| — | **the ER-6 interim's discriminator** (§7.6, §12.4) — a *routed* propose-only promotion and a *degraded* PR attempt both write `route: "degraded"`, so the report body is the only thing that tells them apart until ER-6 lands | §7.6, §7.9 item 4 | `consolidationReport.test.js`, **(no FSPEC AT)** — the two-fixture control: a `revise` on a `DOMAIN-CONSTRAINTS.md` target (routed propose-only, §7.6 table row 2) and a `branch-exists` degradation. Asserts the *sameness* that is the ER-6 loss (`route: "degraded"` in both records, asserted rather than hidden) **and** the *difference* that stands in for it (the degraded body names a vocabularies §1 reason code, the routed body names none), in both directions. It claims no register id, in the same class as T-13's row and the dropped-code notice, so §12.3's set equality is undisturbed. Recorded here because §12.4 leans on it as a mechanism, and a mechanism that lives only in §7.6's prose is one a PLAN task will not know it owes |

**Why the Falsified-by column quotes rather than paraphrases.** Every AT named above is described in
the register's own words, taken from `FSPEC-…:2064-2077`, because §12.3's
`consolidationTraceability.test.js` asserts set equality over **ids** and is therefore structurally
blind to a row that binds a real id to the wrong subject — the one class of error in this table that
has no mechanical guard. Quoting is not a mechanism, and is not claimed as one; it is what makes the
mis-binding visible to the next reader in the row itself rather than only in the register. Where an
obligation has no AT (T-11's AC-3.2 citations, T-12's "when, and only when"), the cell says so: an
empty-but-named gap reads as a gap, where a nearby id reads as coverage.

**A named gap is not a licence to ship uncovered, and this table no longer treats it as one.** Both
register gaps above describe things an operator reads directly — the PR body an approver reviews, and
the absence of a proposal file when nothing needed proposing — so each now carries a **(no FSPEC AT)**
case in the file that owns its subject, in exactly the shape T-13 and the dropped-code notice
established. The erratum and the local case are complementary, not alternatives: the erratum asks the
FSPEC to decide whether the register should carry an id, and the local case makes the obligation
falsifiable in the meantime. Rows carrying no id contribute to neither side of §12.3's set equality,
so adding them cannot perturb it.

### 12.3 Acceptance test → level and file

**Enumerated, never ranged.** An earlier draft assigned ATs to files by range (`AT-C1 … AT-C8`,
`AT-M1 … AT-M6b`, …). Range notation cannot express the suffixed ids the FSPEC actually carries, and
it silently dropped three of them — **AT-C1b, AT-Q7b and AT-Q7c** — even though §11.3(a) names the
last two by hand. That is not a bookkeeping slip in the `DEC-SEV-02` sense: this table is a
**downstream observable**, since §13.3 hands the PLAN a manifest keyed on these files and this table
is what tells a PLAN task which ATs it owes. An AT with no file is an AT the PLAN will not name and
the implementation will not write, and nothing goes red.

The FSPEC's AT register carries **96** ids, measured at v11.1 by enumerating the register's own
`| AT-…` rows. Every one has exactly one file below:

| File | Level | ATs owned (exhaustive) |
|---|---|---|
| `consolidationPass.test.js` | L2 | AT-C1, **AT-C1b**, AT-C2, AT-C3, AT-C4, AT-C5, AT-C6, AT-C7, AT-C8, AT-M1, AT-M2, AT-M3, AT-M4, AT-M5, AT-M6, AT-M6b, AT-M9. Plus **(no FSPEC AT)** the unreadable-corpus-entry case §12.2 records — §7.1's three observables (counted, in the consumed pair, named in the report body) against a readable control. It lives here because its subject is the pass's own corpus handling end-to-end, which is this file's |
| `consolidationRung.test.js` | L2 | AT-M7, AT-M8, AT-M10 (AT-M10 is a regression over the shipped call site and lives beside the existing `advisoryRung.test.js` assertions) |
| `consolidationPredicate.test.js` | L1 | **AT-P1** — whose first conjunct *is* §7.1's pin (a), the literal-argv assertion over the `_git` double — AT-P2, AT-P3, AT-P4, AT-P5, AT-P6, AT-P8, AT-P9, AT-P10, AT-P11 |
| `consolidationHookParity.test.js` | L4 (+ L3) | AT-P7. Plus two **(no FSPEC AT)** cases: (1) §7.1's **pin (b)** — an L3 source-text read asserting the hook's `CORPUS_GLOBS` declaration carries exactly the two glob-pattern literals and no third (located by name, not by line index); (2) an L4 pathspec-semantics case running pin (a)'s exact argv through a real `git` in a temp repository the case builds (§11.1). Both live here because their subject is the two implementations' relationship, which is this file's. §7.1's **pin (a)** does **not** live here — it is AT-P1's L1 argv conjunct in `consolidationPredicate.test.js`, one row above |
| `consolidationIdentity.test.js` | L1 | AT-R6, AT-R6b, AT-F1, AT-F2, AT-F3, AT-F4, AT-F5 |
| `consolidationRoute.test.js` | L2 | AT-R1, AT-R2, AT-R3, AT-R4, AT-R5, AT-Q1, AT-Q2, AT-Q3, AT-Q4, AT-Q5, AT-Q6, AT-Q7, **AT-Q7b**, **AT-Q7c**, AT-Q8, AT-Q9, AT-Q10, AT-Q11, AT-Q12. Plus two **(no FSPEC AT)** cases covering the register gaps §12.2 records: AC-3.2's three PR-body citations (T-11) and FSPEC §5.3's "and only when" negative (T-12) |
| `consolidationCredential.test.js` | L2 | AT-K1, AT-K2, AT-K3, AT-K4, AT-K5, AT-K6, AT-K7 |
| `consolidationEffectiveness.test.js` | L1 | AT-F6, AT-F7, AT-F8, AT-F9, AT-F10, AT-F11, AT-F12, AT-F13, AT-F14, AT-F15, AT-F16, AT-F17, AT-F18 |
| `consolidationParse.test.js` | L1 | AT-F19, AT-F20, AT-F21 |
| `consolidationAdvisory.test.js` | L1 | AT-A1, AT-A2, AT-A3, AT-A4, AT-A5, AT-A6, AT-A7 |
| `consolidationReport.test.js` | L1 + L2 | AT-L1, AT-L2, AT-L3, AT-L4, AT-L5, AT-N1, AT-N2, AT-N3, AT-N4. Plus **(no FSPEC AT)** the ER-6 two-fixture discriminator control (§7.6, §12.2, §12.4) and the dropped-code report-body notice carried under AT-L5 |
| `consolidationBuild.test.js` | L3 | (no FSPEC AT) T-02's build assertions, §3.3's `.gitignore` text, §11.3(e)'s adapter-prompt text |
| `consolidationLifecycle.test.js` | L2 | (no FSPEC AT) T-13's await-discipline case (§10.1, §11.2's `asAsync`). It claims **no** register id, so `consolidationTraceability.test.js`'s set equality is unaffected: the equality is asserted over the ids this table's rows *carry*, and a row carrying none contributes nothing to either side |

**The enumeration is asserted, not maintained by hand.** `consolidationTraceability.test.js` (L3)
parses the FSPEC's AT register and this table's own rows and asserts **set equality in both
directions** — every register id has exactly one file, and no file claims an id the register does
not carry. Adding or deleting an AT upstream therefore reds this table rather than passing it,
which is what the range notation could never do. The parser takes an injected `root` (DC-04).

**How the parser reads a cell that also carries prose.** Several cells now append a `(no FSPEC AT)`
clause naming a TSPEC-added case beside their id list. The parser extracts ids by matching the
`AT-…` token grammar over the whole cell and de-duplicating, so prose contributes nothing unless it
names an id, and naming an id the row already owns (AT-L5, in the report row) is idempotent. The
invariant the equality asserts is unchanged: **every register id maps to exactly one file, and no
file names an id the register does not carry**. A TSPEC-added case is deliberately outside both
sides — it has no id to contribute, which is precisely why minting one would have been the wrong
repair.

**Nothing asserts the converse, and that is a decision rather than an oversight.** The question is
whether a cell *intending* to claim no id could accidentally name one in its prose — the report row
already does exactly that, on purpose, when it cites AT-L5. Because the parser de-duplicates, that
citation is idempotent and the equality is unperturbed either way, so an assertion here would have to
read intent, which no parser can: the only implementable form ("a `(no FSPEC AT)` clause may not
contain an `AT-` token") would red the report row that is deliberately correct. The exposure is
therefore bounded to one class — a TSPEC-added case silently *inheriting* coverage credit for an id
its owning row already claims — and the mitigation is the one §12.2 already applies: every such cell
states which id it claims and which it does not, in the row itself.

The split is by **subject, not by AT id range**: a file owns one group of §7 functions, which is
what keeps the single-writer-per-file rule satisfiable when the PLAN parallelises authoring.

### 12.4 Vocabulary conformance

Every value used in this document is a `pdlc-consolidation-vocabularies.md` §1 row at `Version` 1.4
**except the four recorded below**, each of which is an upstream gap, none of which is patched here.

**ER-6 (new, raised by this layer).** §7.6's routing functions have an outcome — `"proposal-file"`,
a member of `RouteDecision` — that the `Route` union cannot express: FSPEC §5.1 row 4 routes "any other consuming-repo path" to the proposal file, and AC-5.4
diverts every `revise`/`retire` of a consuming-repo promotion there too — but `Route` is
`"constraints" | "decisions" | "PR" | "degraded"` (`docs/_constraints/pdlc-consolidation-vocabularies.md:57`, inside §1's `:38-65` table, transcribed exactly),
so `FailureModeRecord.route` (§6.2, a closed eight-field record required on every kind) has no
value for it. An earlier draft of this section claimed full conformance while §7.6's own prose used
the value, and raised nothing — the claim, not the gap, was this layer's defect.

Until ER-6 lands the pass writes **`route: "degraded"`** for a proposal-file promotion. It is the
one legal value whose meaning already covers the case — FSPEC AT-Q12 glosses `degraded` as "the
promotion reached nothing but `CONSOLIDATION-PROPOSAL-{passId}.md`" — and it fails in the safe
direction: §7.6's `enactedByLog` does not enact on a `degraded` record, so the item is re-proposed
next pass, which is what an item awaiting operator approval should do. The residual loss is that a
*routed* propose-only item and a *degraded* PR attempt read alike in the record; the report body
(§7.9 item 4) names the route in full and is the discriminator meanwhile — and the discrimination is
**asserted**, by the two-fixture control §7.6 specifies in `consolidationReport.test.js` (routed
propose-only vs. `branch-exists`-degraded: identical `route: "degraded"` in the record, a reason code
present in one report body and absent in the other, both directions). That control carries a **§12.2
row of its own** — an unnumbered `(no FSPEC AT)` row, in the same class as T-13 — so the obligation
reaches a PLAN task through the traceability table rather than through §7.6's prose alone. So the
interim is falsifiable rather than merely argued, and ER-6 landing simplifies a passing test.

The other three gaps are the FSPEC's errata and are likewise **not** patched here: `rung:` has no §1 row
(ER-1) and stays free-form; FSPEC §2.6 row 4 has no reason code (ER-2) and `failNoReason` records
none; `suppressed-by:`'s value grammar is wider here than §1's (ER-5) and §7.9 writes the wider
grammar the REQ's own NFR-4 obliges. §6.4's legality check is what keeps ER-4's narrower
`May accompany status` column from producing an illegal row in the meantime.

## 13. Risks and open items handed downstream

### 13.1 Decisions recorded here, with alternatives rejected

| # | Decision | Rejected alternative | Why |
|---|---|---|---|
| 1 | The credential seam returns a **boolean**, and the value reaches `git`/`gh` by shell expansion | a `_readEnv(name) => string` seam | the value would enter the JS process **and** the agent transcript that transported it — a surface NFR-2 cannot redact. The boolean form makes non-disclosure structural |
| 2 | Reuse `resolveAdvisoryRung` by adding an optional `skill` parameter | restate the two rungs behind a drift observable (which corpus baseline §3 sanctions) | it would create the second copy of the ladder the resolver's own doc comment forbids (`:1800`) |
| 3 | Inline the dev module into a fourth bundle | a shared artifact holding the resolver | the runtime forbids `import` entirely; there is no third option |
| 4 | The clone is cut from `origin`'s URL, not from the working-tree path | `git clone {repoRoot} {dir}` | the working tree may be mid-pipeline on a `feat-*` branch; FSPEC §6.1 requires the **fetched default branch** |
| 5 | Take the marker read-then-write | an exclusive-create seam | no adapter transport offers `O_EXCL`, and an agent's report of prior existence is exactly as racy as the read |
| 6 | Two predicate implementations, whose **predicate** half is held **equal** by AT-P7 and whose **enumeration** half is held **pinned** — each side's question fixed literally — rather than equal | (a) one shared implementation; (b) an enumeration *equality* assertion; (c) leaving the enumeration half to inspection | (a) the hook is a Python heredoc inside bash; sharing needs a third artifact and a language boundary neither side has. (b) the two enumerations are **not** equal in general — §10.4's two classes make an equality red on correct code — and AT-P7 feeds both sides one basename list, so it cannot see the enumeration at all. (c) was an earlier draft's answer and is **withdrawn**: §7.1 now pins the JS argv (AT-P1's first conjunct at **L1**, both `:(glob)` prefixes literal, in `consolidationPredicate.test.js`) and the hook's two glob patterns (an **L3** source-text read of the `CORPUS_GLOBS` declaration, in `consolidationHookParity.test.js`) — two levels and two files, for the reasons §7.1 gives — which makes §10.4's divergence set derivable and closed — a third class cannot arise silently. Row 12's stderr channel is what makes even the predicate half observable. **This decision relaxes REQ `:115-116`'s "keeping one enumeration as well as one predicate", so it is not settled here**: §13.3 raises it as a REQ/FSPEC erratum, and this row records what this layer would ship if the relaxation is accepted |
| 7 | `parseConsolidationConfig` duplicates `parseAdvisoryConfig`'s shape | generalise the shipped parser | generalising edits a guard-set file for a second reason and risks a shipped advisory path for a cosmetic gain |
| 8 | Extend `mergeCommandFor` rather than add a second `gh` builder | a consolidation-local builder | two builders in one bundle falsify the audit property the shipped comment claims |
| 9 | Widen four §6.5 permitted sets — `read-auth` on the PR seam, and `read-object` / `read-remote` / `read-index` in the invoking tree — **one verb per read**, rather than mis-classify any of them into an existing verb | fold `gh auth status` into `read-pr`; fold `git cat-file -e` into `read-status`; fold `git remote get-url` into `read-object` (an earlier draft of §9.3 did the last of these, on transcription cost — withdrawn) | §6.5 forbids reading a further verb into a closed set silently; a mis-classified call is invisible to AT-Q7 at exactly the boundary it guards, and folding `remote` into `read-object` would have let a later `git remote add` pass containment (§9.3) |
| 10 | Enumerate the corpus with one `_git(["ls-files", …])` read, `:(glob)`-anchored | two `_listFiles` directory walks over `docs/*` and `docs/completed/*` | the seam structurally cannot return a subdirectory name (`runtime-adapter.js:915`, `:929-931`), so the walk finds an empty corpus in production while `fakeListFiles` hides it in every test — DC-07's "production path ≠ unit path". `ls-files` also returns the repo-root-relative paths `CorpusFile.path` needs (§7.1) |
| 11 | Widen **`rtWriteFile` alone** to accept an absolute path, and leave `rtReadFile` untouched | (a) route the clone's writes through `_git`; (b) widen both prompts "for symmetry", as an earlier draft of §5.6(a) proposed | (a) git has no write-a-working-tree-file verb short of `hash-object -w` plus `update-index` — three mutating calls in the clone domain to replace one path argument. (b) was withdrawn on measurement, not taste: `rtReadFile` carries **no** path-resolution clause to widen — the string "relative to the repository root" occurs exactly once in `runtime-adapter.js`, at `:805` inside `rtWriteFile` — and its shell-command transport already resolves an absolute path verbatim (§5.6(a)). Widening it would have been a prompt edit to a shipped seam every pipeline phase reads through, with no behavioural motive, purely so §11.3(e) had a second thing to match |
| 12 | Add an env-gated `PDLC_PENDING:` stderr line to the hook | keep the count-above-threshold message as AT-P7's oracle | the shipped hook emits a count and only above `THRESHOLD = 5`, which is blind on every fixture that discriminates the two-region predicate — so T-08's "held equal by a differential test" would not be true (§7.1). **Still worth the shipped-hook edit after row 6's narrowing**, and the question was asked directly: a predicate differential is not a consolation prize for the enumeration equality — the two-region predicate is where every edge case the FSPEC enumerates lives (E-04, E-05, E-09, the region boundary), and it is the half a maintainer will actually change. Extracting the predicate into a third shared artifact (row 6's rejected alternative (a)) remains more expensive than one env-gated stderr line in a script CI already `bash -n`s, and it would still leave the enumeration pair exactly where it is |

Rows 1, 2, 4, 5, 6 and 11 are load-bearing and reversible only at cost; §13.3 records that DECISIONS
is warranted for them. Row 6's decision is now **conditional on row 12**: without the hook's
observation channel there is no differential oracle, and two-implementations would have to be
re-argued on what a count-above-threshold comparison can supply.

### 13.2 Risks

| Risk | Exposure | Mitigation held here |
|---|---|---|
| The widened resolver's bytes live in **four** tracked artifacts | a commit that rebuilds three fails CI's sync job, and a partial rebuild is easy to make by hand | §8.3 states the count; the PLAN carries the rebuild as an explicit task with `pdlc/workflows/dist/` in its pathspec, per `implementation.postWavePathspecs` |
| `mktemp -d -t` behaviour differs subtly between macOS and GNU coreutils | a clone that lands somewhere unexpected | the seam returns the path the tool reported and the pass uses it verbatim; nothing constructs the path itself. The CI matrix already runs both platforms |
| The pass calls the resolver **bare**, so a hung dispatch is bounded only by the runtime watchdog | a wedged pass holds the marker | §7.3's stale-lock reclaim is the recovery, and `staleLockMinutes` is configurable |
| An agent-transported `gh pr list --search` may return a truncated page | a duplicate PR opened despite a matching open one | `--limit 100` and the trailer key are the FSPEC's mechanism; a miss re-opens a proposal, which is the safe direction (a second PR the operator can close), never a lost one |

### 13.3 Handed to the next layers

- **DECISIONS** — warranted. §13.1 rows 1 (credential seam shape), 2 (resolver reuse vs. restate),
  4 (clone source), 5 (non-atomic marker take), 6 (two predicate implementations, with the
  predicate/enumeration split named) and 11 (widening **`rtWriteFile` alone**, rather than routing
  clone writes through git or widening both prompts for symmetry) each weighed a real
  alternative with a different reversibility profile, and each will otherwise be reconsidered
  confidently by a future agent. Each needs a `Testability:` line per DC-10.
- **PLAN** — the file-ownership manifest must serialise the three writers of
  `pdlc/workflows/orchestrate-dev.js` (the resolver widening, the `gitWithLockRetry` export, the
  `mergeCommandFor` surfaces) into **one** task: they are one file, and FSPEC §5.2 rule 2 forbids two
  same-batch tasks appending to it. The four `dist/` artifacts are a per-wave chore commit, not a
  task's owned files.
- **PROPERTIES** — §11.4's six properties and FSPEC §14.5's LD-1 … LD-5, in the files §11.5 names.
  The two determinism properties carry a **positive conjunct each** (§11.4's second table); a
  fixture written against invariance alone would be satisfied by a constant function.
- **PLAN, additionally** — three obligations this revision creates. (i) The `runtime-adapter.js`
  writers are **one** task for the same reason `orchestrate-dev.js`'s three are: `rtEnvPresent`,
  `rtMakeTempDir`, `rtConsInjections` and §5.6(a)'s **one** prompt widening (`rtWriteFile`; `rtReadFile`
  is not edited) are one file. (ii) The
  `__tests__/runtimeBundle.test.js` edits — `AWAIT_SCAN_SOURCES` **and** `AT19_SEAM_NAMES`
  (§11.3(c)) — are one task in that one file. (iii) The release note and
  `pdlc/RELEASE-CHECKLIST.md` must state that the first queue invocation after this feature lands
  is blocked by the drift gate until `sync-workflows.sh` runs (§8.3). (iv) `consolidationLifecycle.test.js`
  (§12.2 T-13) and `consolidationDoubles.js`'s `asAsync` wrapper (§11.2) are two more owned files in
  the manifest; the wrapper is created by the doubles task and depended on by the lifecycle task, per
  batch-safety rule 4.
- **Upstream (REQ and FSPEC) — the enumeration relaxation, raised rather than absorbed.** REQ §3.1
  step 1 closes with "Widening makes `nudge-consolidation.sh:28` an in-scope edit (§5), keeping one
  enumeration as well as one predicate" (`REQ-…:115-116`), and FSPEC AT-P7's *When* is "**both the
  pass's enumeration** and `pdlc/hooks/scripts/nudge-consolidation.sh` are run over each case", its
  *Then* the two sets are set-equal (`FSPEC-…:2026`; BR-09 binds it at `:2489`). This layer cannot
  deliver that as written: §7.1's repair moved the JS enumeration to `git ls-files` (because the
  `_listFiles` seam structurally cannot walk directories — §13.1 row 10), and §10.4 measures two
  classes in which a git-based enumeration and `glob.glob` **must** disagree, so a set-equality
  assertion would be red on correct code. What this layer ships instead is stated above: predicates
  held equal by AT-P7, enumerations held by two literal pins with a derivable, closed divergence
  set. **Whether that satisfies "one enumeration" is a REQ/FSPEC decision, not this document's**, so
  it is raised as an erratum against both, together with the sub-question §10.4 isolates — is a
  `.gitignore`d LEARNINGS file corpus? (keeping `--exclude-standard` says no; dropping it closes
  divergence class (i) at exactly that price, and at no other). **The two directions are not
  symmetric, and the REQ reviewer should be told which is which**: the hook has no
  `--exclude-standard` to drop — `glob.glob` sees ignored files unconditionally — so an answer of
  "yes, an ignored LEARNINGS file is corpus" *closes* class (i) by making the two sides agree, while
  "no" keeps it open. One of the two answers strictly reduces the divergence set the relaxation is
  being requested for; the erratum says so rather than presenting them as neutral alternatives.
  A third question rides with the batch, raised by the same reviewer: §7.1 puts an unreadable corpus
  entry **in the consumed pair**, so a LEARNINGS file can be permanently marked consumed while
  contributing no evidence to any promotion, and the only trace is one pass's transient report body.
  Should the durable log row itself carry the unreadable basenames (an `unread:` field beside
  `consumed`)? That is a `pdlc-consolidation-vocabularies.md` §3 field-set change, so this layer
  declines to mint it (REQ §4b) and hands the question up with the rest. Accepted residue if the relaxation
  stands: one operator-visible nudge that no pass can clear (class (i)) and one corpus entry the
  pass reports as unreadable (class (ii)) — never a correctness divergence, since the pass consumes
  only what its own enumeration returned.
- **Upstream (FSPEC) — two register gaps recorded, not patched here** (and, unlike the relaxation
  above, **covered locally in the meantime** — §12.2's two `(no FSPEC AT)` cases in
  `consolidationRoute.test.js`). §12.2's re-binding surfaced two
  obligations with no acceptance test: AC-3.2's requirement that the PR body cite each source
  LEARNINGS by feature name, the failure mode and the AC-2.3 evidence (the AC→AT map binds AC-3.2 to
  AT-Q2, which asserts only the trailers), and FSPEC §5.3's "when, **and only when**" negative
  direction for the proposal file. Both are raised as errata against the FSPEC rather than bound to
  a nearby id; until they land, §12.2's cells name the gap explicitly.

