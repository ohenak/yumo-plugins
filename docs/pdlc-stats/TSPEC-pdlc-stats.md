---
feature: pdlc-stats
---

# TSPEC — pdlc-stats

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` (`docs/pdlc-stats/REQ-pdlc-stats.md`, `docs/pdlc-stats/FSPEC-pdlc-stats.md`) |
| Downstream | DECISIONS, PLAN, PROPERTIES, IMPL |
| Cross-Reviews | `CROSS-REVIEW-{role}-TSPEC[-v{N}].md` |
| LEARNINGS | `docs/pdlc-stats/LEARNINGS-pdlc-stats.md` |

| Status | Author | Version | Date |
|---|---|---|---|
| Draft | se-author | 1.1 | 2026-08-31 |

**v1.1** addresses cross-review round 1 (`CROSS-REVIEW-product-manager-TSPEC-v1.md`,
`CROSS-REVIEW-test-engineer-TSPEC-v1.md`): the JSON document's key sets and `schemaVersion` are now
a stated contract (§4.2) with a literal-transcription oracle (§6.3); the doc-type catalogue and
vendoring oracles are repaired and a fifth exclusion-set oracle added (§6.4); the read-only
snapshot's isolation, the determinism property and the halt matcher's phase capture are pinned
(§6.5, §6.6, §4.3).

## 1. Overview

`pdlc stats` is a read-only reporting command over artifacts the pipeline has already written. It
adds no instrumentation and no persisted state: it lists one directory, sizes the files in it, and
prints four metrics — review rounds per document type, DoD rounds, halts with resolution state, and
the process-to-spec byte ratio (FSPEC §1).

**The one technical constraint that shapes everything below is REQ C-5.** Every artifact
classification this command makes must be the classification the pipeline driver already makes over
the same bytes. That is not a coding-style preference here: the driver's classifiers are shipped,
exported functions, and this design reaches them by **importing and calling them**, never by
re-implementing their grammars. The four it needs all exist today in
`pdlc/workflows/orchestrate-dev.js` and are all `export`ed:

| Driver export | What it decides | Verified shape |
|---|---|---|
| `parseReviewFilename(basename)` | cross-review basename grammar: role, doc type, round, and the rejection reason | returns `{ok: true, role, docType, round, suffixed}` or `{ok: false, reason}`; `reason` is `not_cross_review` when the `CROSS-REVIEW-` prefix is absent, and `bad_role` / `bad_doc_type` / `bad_round` / `trailing_junk` otherwise |
| `deriveRoundWindow(basenames, docType)` | per-doc-type round history from one listing | returns `{ok: true, startIndex, endIndex, present, skipped}` or `{ok: false, reason: "malformed_round_one_duplicate", role}` |
| `deriveDodRoundIndex(basenames, feature)` | `CODE_REVIEW-{feature}-v{N}.md` grammar, feature name escaped before matching | returns the **next** index: `max(existing) + 1`, `1` when nothing matches |
| `parseResolvedMarker(fileText)` | a POSTMORTEM's `RESOLVED:` marker, fenced regions excluded | returns `{ok: true, resolved}` or `{ok: false, reason}` for absent/duplicated/unparseable |

Three consequences follow directly from those signatures, and they are the whole arithmetic of two
of the four metrics:

- **BR-05's "highest round present" is `startIndex - 1`.** `deriveRoundWindow` computes
  `startIndex = max(indices) + 1`, and `1` when the doc type has no files at all. Subtracting one
  therefore yields the highest index present, and `0` for a never-reviewed type — exactly BR-05's
  stated near-miss, discharged by construction rather than by a re-derivation.
- **BR-10's "highest version" is `deriveDodRoundIndex(...) - 1`.** The driver answers "which DoD
  round runs next"; BR-10 asks which one last happened. One subtraction, at one call site.
- **BR-07's `unmeasurable` is `deriveRoundWindow`'s `ok: false` branch.** Its `reason`
  (`malformed_round_one_duplicate`) and its `role` field are precisely the state and the colliding
  role BR-07 asks the report to name.

**Where the code lives.** The pure computation lands in a new workflow-tree module,
`pdlc/workflows/lib/stats.mjs`, alongside the existing `lib/loop-session.mjs` and
`lib/escalation-view.mjs`. The operator surface lands as a new `stats` case in
`pdlc/engine/bin/cli.mjs`, which reaches the new module through the same
`resolveWorkflowRoot()`-then-dynamic-`import()` arrangement its `loopSessionModule()` and
`escalationViewModule()` helpers already use. §2 argues that placement and §8 records the
alternatives; the cost it carries — a co-change across four vendoring enumerations and a carve-out
against a completed sibling feature's frozen packed-set table — is named here rather than
discovered during implementation.

**What this document decides.** Module boundaries and the seam design; the injected-parser bundle
and the wiring oracle that keeps it honest; the filesystem seams and the `lstat`-not-`stat` choice;
the discovery predicate for fleet mode; the render functions and their purity; the test strategy.
FSPEC §7.2's four TSPEC-owned open items (O-1 reuse-vs-reimplement, O-2 subcommand-vs-standalone,
O-3 how bytes are obtained, O-4 sequential-vs-concurrent) are all answered, each at its own section
and each cross-referenced in §8.

**What this document does not decide.** No observable behavior. Every token spelling, key set, exit
code, row order and edge-case outcome is fixed by FSPEC §4 and §5, and this document restates none
of them as rules of its own — it names the function that produces each and the test that pins it.

## 2. Architecture

### 2.1 Module placement, and the enumeration co-change it costs

Three placements were available. The choice is `pdlc/workflows/lib/stats.mjs` + a thin `cmdStats`
in `pdlc/engine/bin/cli.mjs`.

| Option | Where the pure logic lives | Enumeration co-change | Coverage gate | Verdict |
|---|---|---|---|---|
| A (**chosen**) | `pdlc/workflows/lib/stats.mjs` | vendored class grows 5 → 6 | `pdlc/workflows` c8 block, per-file branches ≥ 85 | chosen |
| B | `pdlc/engine/lib/stats.mjs` | `lib/` class grows 15 → 16 | engine suite (`node __tests__/_run-suite.mjs`), no per-file branch floor | rejected |
| C | inline in `pdlc/engine/bin/cli.mjs` | none | none — `bin/cli.mjs` is in no c8 include set | rejected |

**Why A.** The metric logic's correctness is entirely a question of whether it agrees with four
driver classifiers that live in `pdlc/workflows/orchestrate-dev.js`. Putting the consumer in the
same tree as the producer means the two are vendored, versioned and tested as one unit, and it puts
the new module inside the c8 block in `pdlc/workflows/package.json`, whose `test:coverage` script
runs a second `--per-file --branches 85` pass precisely so a small module cannot hide under
`orchestrate-dev.js`'s aggregate. Option C has no coverage gate at all and would add several hundred
lines of pure logic to a 57 KB CLI; option B keeps the enumeration cost without the coverage
benefit and still has to load the vendored driver across the same seam.

**The cost, stated once.** `pdlc/workflows/lib/` members are vendored into the published engine at
pack time, and the member list is enumerated at four sites plus a fifth that counts it. Adding
`lib/stats.mjs` is a single co-change set:

| Site | Symbol | Edit |
|---|---|---|
| `pdlc/engine/scripts/prepack.mjs` | `MODULE_NAMES` | add `lib/stats.mjs` |
| `pdlc/engine/scripts/publish-preflight.mjs` | `WORKFLOW_MEMBERS` | add `vendor/workflows/lib/stats.mjs` |
| `pdlc/engine/scripts/fixture-machine.mjs` | `WORKFLOW_MODULE_NAMES` | add `lib/stats.mjs` |
| `pdlc/engine/__tests__/_tspec-packed-set.mjs` | `WORKFLOW_MEMBERS`, `tspecPackedCount` | add the member; vendored class size `5` → `6` |
| `pdlc/workflows/package.json` | `c8.include` | add `**/pdlc/workflows/lib/stats.mjs` |

`_tspec-packed-set.mjs` states its own co-change obligation in its header: a member is "a SPEC change
first", co-changed with `docs/completed/pdlc-engine-distribution/`'s TSPEC §5.4 `PK-*` table and
FSPEC §5.2's per-class counts, "never this file alone". That sibling feature is completed and its
enumerations are approved and frozen; this feature therefore needs an explicit carve-out amending
them, exactly the coupling `pdlc-engineering-loop`'s LEARNINGS records as a repo-wide pattern. The
growth path is precedented: that same class already grew from three members to five when
`lib/loop-session.mjs` and `lib/escalation-view.mjs` were added (`PK-24`/`PK-25` in the packed-set
helper's own comments). **The carve-out is stated once, here, and cited by reference everywhere
else** — no downstream document restates its text (`pdlc-engineering-loop` LEARNINGS: verbatim
restatement across sites is a defect generator).

`resolveWorkflowRoot()` needs no change: it probes for `orchestrate-dev.js` and
`orchestrate-queue.js` to decide which root resolves, and returns the root path; `lib/stats.mjs` is
loaded from that root the same way `loopSessionModule()` loads `lib/loop-session.mjs`.

### 2.2 Layering

```
pdlc/engine/bin/cli.mjs
  cmdStats(argv)                     ── impure edge: argv, cwd, process.stdout/stderr, exitCode
    ├─ parseStatsArgv(argv)          ── pure (in stats.mjs)
    ├─ statsIo({cwd})                ── the four fs seams, built here, real node:fs
    ├─ statsParsers()                ── awaits the vendored orchestrate-dev.js, bundles its 4 exports
    └─ runStats({argv, io, parsers}) ── pure orchestration (in stats.mjs), returns a StatsOutcome
         ├─ discoverFeatures(...)    ── fleet only
         ├─ computeFeatureStats(...) ── the four metrics, one feature
         ├─ renderHuman(outcome)     ── pure string
         └─ renderJson(outcome)      ── pure object → JSON.stringify
```

Everything below `cmdStats` is a pure function of its inputs plus four injected seams. `cmdStats`
itself does exactly three impure things: it builds the seams, it writes the returned `stdout` and
`stderr` strings to the real streams, and it sets `process.exitCode`. That split is what makes
FSPEC's read-only invariant (§3.4, BR-28) checkable: `runStats` is handed a seam bundle with **no
write operation in it at all**, so there is no capability to write, not merely a convention not to.

### 2.3 The seam bundle

`StatsIo` has exactly four members, all read-only, and no fifth is admitted:

| Seam | Signature | Node implementation | Why this one |
|---|---|---|---|
| `listDir` | `(absDir) => Array<{name, isDirectory, isFile, isSymbolicLink}>` | `fs.readdirSync(dir, {withFileTypes: true})` mapped to plain records | BR-03 (directory itself, not subtree) and BR-25 (directories only) both need the entry **kind**, and asking for it in the listing avoids a second syscall per entry |
| `fileSize` | `(absPath) => number` | `fs.lstatSync(path).size` | see §2.4 |
| `readFile` | `(absPath) => string` | `fs.readFileSync(path, "utf8")` | only ever called on `POSTMORTEM-*` files, for `parseResolvedMarker` |
| `exists` | `(absPath) => boolean` | `fs.existsSync(path)` | BR-02's live-before-archive preference, and the `docs/` root probe (EC-09) |

Each seam is **total in the caller's eyes**: `runStats` wraps every call in a `try`/`catch` and maps
a throw onto the FSPEC-decided outcome for that call site (§5). The seams themselves are the plain
synchronous `node:fs` calls, deliberately — the whole command is one directory listing and a few
dozen `lstat`s, and a promise-based seam would buy nothing while making every test double async.

Synchronous also settles **FSPEC §7.2 O-4**: fleet-mode per-feature computation is **sequential**.
BR-18's lexicographic ordering and §3.4's read-only invariant hold either way, so there is no
correctness argument for concurrency; a sequential loop over a few dozen directories on local disk
has no measurable cost, and it keeps every failure attributable to the feature being computed
(EC-21's per-feature catch-all degrades one row without touching another's state, because there is
no shared state to touch).

### 2.4 `lstat`, not `stat` — and why the choice is load-bearing

`fileSize` uses `lstatSync`, so a symbolic link contributes **the size of the link itself**, not the
size of its target. That is EC-19's decided behavior and AT-15's symbolic-link leg. It is also the
safer default for the read-only stance: `stat` on a link pointing outside the repository would make
a byte total depend on a file the command was never asked to read, and a link pointing at a
directory or at a missing target would turn a byte sum into an exception. `lstat` never follows, so
neither happens.

The same call answers **FSPEC §7.2 O-3** ("how are byte totals obtained"): file sizes come from the
directory entry's `lstat`, from the working tree as it stands. No `git show`, no `git cat-file`, no
history read of any kind — REQ R-3's exact risk, closed by the seam bundle carrying no `git`
capability at all.

### 2.5 The parser bundle, and the oracle that keeps it honest

`computeFeatureStats` takes its four classifiers as an injected `StatsParsers` bundle rather than
importing `orchestrate-dev.js` itself. Two reasons: the driver module is ~816 KB and a read-only
report should not pay to load it in a unit test, and injection lets a test drive a classifier's
`ok: false` branch directly instead of having to construct a filename that provokes it.

Injection creates one risk, and it is the risk REQ C-5 exists to prevent: a test suite that passes
hand-written parsers would stay green while production diverged. The mitigation is a **wiring
oracle**, not a convention. `statsParsers()` in `bin/cli.mjs` is the only production construction
site, and one test asserts that the bundle it returns carries function references that are
`===`-identical to `orchestrate-dev.js`'s own exports — identity, not behavioral equivalence, so a
re-implementation that happens to agree on today's corpus still fails. §6.4 specifies it.

## 3. Interfaces

Every service boundary is a named contract. TypeScript-interface syntax is used for precision; the
implementation is ESM JavaScript with JSDoc, matching `pdlc/workflows/lib/loop-session.mjs` and
`lib/escalation-view.mjs`.

### 3.1 The injected seams

```ts
interface DirEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
  isSymbolicLink: boolean;
}

/** Read-only by construction: no member writes, creates, deletes or spawns. */
interface StatsIo {
  listDir(absDir: string): DirEntry[];   // throws on unreadable — caller catches
  fileSize(absPath: string): number;     // lstat().size — never follows a link (§2.4)
  readFile(absPath: string): string;     // utf8; POSTMORTEM bodies only
  exists(absPath: string): boolean;      // total: never throws
}
```

### 3.2 The driver-parser bundle (REQ C-5's seam)

```ts
type ReviewParse =
  | { ok: true; role: string; docType: string; round: number; suffixed: boolean }
  | { ok: false; reason: "not_cross_review" | "bad_role" | "bad_doc_type"
                       | "bad_round" | "trailing_junk" };

type RoundWindow =
  | { ok: true; startIndex: number; endIndex: number;
      present: Map<string, number[]>; skipped: Array<{ basename: string; reason: string }> }
  | { ok: false; reason: "malformed_round_one_duplicate"; role: string };

type ResolvedMarker = { ok: true; resolved: boolean } | { ok: false; reason: string };

/** Exactly the four `orchestrate-dev.js` exports, by reference (§2.5). */
interface StatsParsers {
  parseReviewFilename(basename: string): ReviewParse;
  deriveRoundWindow(basenames: string[], docType: string): RoundWindow;
  deriveDodRoundIndex(basenames: unknown, feature: string): number;
  parseResolvedMarker(fileText: string): ResolvedMarker;
}
```

These four shapes are transcribed from the exports as they stand in
`pdlc/workflows/orchestrate-dev.js`, not invented here. Two details of those shapes are load-bearing
and are called out so an implementer does not have to rediscover them:

1. **`deriveRoundWindow` returns early on a collision, before it has finished the listing.** Its
   `ok: false` branch carries no `skipped` array. So the malformed list (BR-06) **must not** be
   taken from `deriveRoundWindow`'s `skipped`: a feature whose TSPEC row is `unmeasurable` would
   silently lose its malformed basenames. `computeReviewRounds` therefore derives the malformed list
   from a **separate, direct pass** of `parseReviewFilename` over the listing (§4.3). That is still
   the driver's classification of each basename — no new grammar — just a call site that survives
   the collision branch.
2. **`parseReviewFilename`'s `not_cross_review` reason is BR-06's "not a cross-review at all"
   bucket.** Malformed means `reason !== "not_cross_review"`. A `LEARNINGS-*.md`, a
   `HANDOFF-PROMPT.md` or the feature's own `REQ-*.md` returns `not_cross_review` and is filtered
   out before the malformed list is built — which is exactly what BR-06 requires and what AT-09
   asserts.

### 3.3 The stats module's public surface

`pdlc/workflows/lib/stats.mjs` exports six functions and two frozen constants. All six are pure:
same inputs, same outputs, no ambient reads.

```ts
/** BR-01's closed surface. Total; never throws. */
export function parseStatsArgv(argv: string[]):
  | { ok: true; feature: string | null; json: boolean; cwd: string | null }
  | { ok: false; message: string };

/** BR-25/BR-26. Returns discovered features (BR-02 preference already applied) and unclassified names. */
export function discoverFeatures(io: StatsIo, docsRoot: string):
  { features: Array<{ name: string; dir: string }>; unclassified: string[] };

/** The four metrics for one feature directory. Pure given `io` + `parsers`. */
export function computeFeatureStats(
  io: StatsIo, parsers: StatsParsers, feature: string, dir: string
): FeatureStats;

/** Pure orchestration: argv → outcome. The only function `cmdStats` calls. */
export function runStats(
  args: { argv: string[]; io: StatsIo; parsers: StatsParsers; cwd: string }
): StatsOutcome;

export function renderHuman(outcome: StatsOutcome): string;
export function renderJson(outcome: StatsOutcome): object;   // caller JSON.stringify's

export const REVIEW_DOC_TYPE_ROWS: readonly string[];  // BR-09's six, in order
export const NON_FEATURE_DIRS: readonly string[];      // BR-25's eight, fixed
```

`REVIEW_DOC_TYPE_ROWS` is `["REQ","FSPEC","TSPEC","PLAN","PROPERTIES","DECISIONS"]`. It is a
**local** constant, not an import of the driver's `REVIEW_DOC_TYPES` — that one is module-private in
`orchestrate-dev.js` (declared `const`, not `export const`) and FSPEC §7.4 A-3 and D-4 make the row
set and its ordering an **observable** of this command, fixed by FSPEC rather than inherited. §6.4
specifies a drift oracle that fails if the driver's catalogue and this row set stop agreeing, so
"local constant" does not mean "free to diverge silently".

### 3.4 The CLI surface

Four edits to `pdlc/engine/bin/cli.mjs`, all additive:

| Site | Edit |
|---|---|
| `FLAGS_BY_COMMAND` | add row `stats: ["json", "cwd"]` |
| `main()`'s `switch (cmd)` | add `case "stats": if (checkFlags(rest, "stats")) await cmdStats(rest); break;` |
| `USAGE` | add the `pdlc stats [feature] [--json] [--cwd <path>]` line |
| module surface | add `cmdStats` and **`export async function statsParsers()`** — the single production construction site of the `StatsParsers` bundle (§2.5), exported so §6.4's identity oracle has a real referent rather than a module-private one it cannot reach |

Four existing mechanisms are **reused unchanged**, and BR-01's "the closed-flag *mechanism* existing
commands use, not their flag *lists*" is satisfied by exactly this reuse:

- `validateFlags(argv, command)` rejects any flag outside the row and any value flag missing its
  value. Because the row is `["json","cwd"]` and nothing else, `--dev`, `--plugin-root`,
  `--allow-api-key-billing` and `--dry-run` are all refused here even where a neighbouring command
  accepts them — AT-24's exact assertion, and the reason it names `--dev` and `--plugin-root`
  specifically.
- `checkFlags` writes `USAGE` and the error to **stderr** and sets `process.exitCode = 1`, writing
  nothing to stdout. That is BR-20's single exception and EC-08, inherited rather than re-coded.
- `cwd` is already a member of `VALUE_FLAGS`, so `--cwd` consumes its value token and `--cwd` with
  no value is already a usage error. `json` is deliberately **not** added to `VALUE_FLAGS`: it is a
  boolean flag.
- `launch()` opens with `if (cmd !== "dev" && cmd !== "queue") return runMain(argv)`, so `stats`
  passes straight through the version-resolution ladder with no store read and no re-exec — the same
  passthrough `doctor`, `decide` and `--version` take. A reporting command must not be able to
  refuse for a reason about the version store.

`cmdStats` is ~25 lines and contains no metric logic:

```js
export async function cmdStats(argv) {
  const cwd = path.resolve(readFlag(argv, "cwd") || process.cwd());
  try {
    const outcome = runStats({ args: argv, io: statsIo(), parsers: await statsParsers(), cwd });
    if (outcome.stdout) process.stdout.write(outcome.stdout);
    if (outcome.stderr) process.stderr.write(outcome.stderr);
    process.exitCode = outcome.exitCode;
  } catch (err) {
    // §5's last row: an unexpected throw anywhere — including the dynamic
    // import in `statsParsers()` — is a stderr message and exit 1, never a
    // stack trace on stdout, and never a truncated JSON document.
    process.stderr.write(`pdlc stats: ${err && err.message ? err.message : String(err)}\n`);
    process.exitCode = 1;
  }
}
```

The `try`/`catch` is the wrapper §5's last row names; it is written here rather than described so
that the sketch and the error table cannot disagree, and the test that drives an injected throw
through `statsParsers()` asserts against **this** function, not against `runStats`. The property
argument is `runStats`'s: it returns `{stdout, stderr, exitCode}` and never throws for a decided
scenario, so this catch is reached only by a genuinely unexpected fault. Note the parameter name:
`runStats` takes `args` (§3.3), and the `argv` local is passed into it under that key — the two
spellings name one value.

`statsParsers()` mirrors the existing `loopSessionModule()` / `escalationViewModule()` /
`devWorkflowModule()` helpers: `resolveWorkflowRoot()` for the root, then a dynamic
`import(pathToFileURL(...).href)`. It pulls the four exports from `orchestrate-dev.js` **by
reference** and returns them frozen (§2.5's identity oracle depends on nothing wrapping them).

### 3.5 Exit codes

`outcome.exitCode` is `0` or `1` and never anything else. Exit `2` is reserved by this CLI for a
recorded pipeline halt (`bin/cli.mjs`'s exit-code header: "2 the pipeline HALTED (a normal, recorded
pdlc outcome)"), and a reporting command has no halt to signal — BR-29, discharged by the return
type rather than by discipline. Nothing in the `stats` path calls `emitReport`, which is the only
function in the file that produces a `2`.

## 4. Data Model

### 4.1 The metric types

One discriminated union per metric, `state` as the discriminant, matching BR-22's rule that a state
rides **inside** its metric's value:

```ts
type MetricState = "measured" | "harvested" | "unmeasurable" | "unavailable";

interface DocTypeRounds {
  state: "measured" | "harvested" | "unmeasurable";
  rounds: number | null;          // null in every non-measured state
  collidingRole: string | null;   // null outside "unmeasurable"
}

interface ReviewRounds {
  byDocType: Record<string, DocTypeRounds>;  // always all six, in BR-09 order
  malformed: string[];                       // basenames, listing order, deduped
}

interface DodRounds  { state: "measured" | "harvested"; rounds: number | null; }
interface HaltEntry  { phase: string; resolution: "resolved" | "open"; }
interface ByteRatio  {
  state: "measured" | "harvested" | "unavailable";
  ratio: number | null;            // 2dp, BR-15
  processBytes: number;            // reported even when state is "unavailable"
  specBytes: number;
}

interface FeatureStats {
  feature: string;
  dir: string;                     // the directory actually read (BR-02, BR-17 header)
  reviewRounds: ReviewRounds;
  dodRounds: DodRounds;
  halts: HaltEntry[];              // possibly empty — BR-13, no state needed
  byteRatio: ByteRatio;
}

type FeatureResult = FeatureStats | { feature: string; gap: string };  // BR-23's discriminant
```

`FeatureResult`'s discriminant is **key presence** — a `gap` key or a metric object — never a
sentinel inside a metric. That is BR-23 stated as a type rather than as a convention. `byDocType` is
built by iterating `REVIEW_DOC_TYPE_ROWS` and assigning in order, so JSON key order and human row
order are the same array; BR-09's "two runs over an unchanged tree produce byte-identical output"
needs nothing further, because no set iteration ever reaches the output.

### 4.2 The outcome type

```ts
type StatsOutcome = {
  stdout: string;   // "" only on the usage-error path (BR-20's single exception)
  stderr: string;
  exitCode: 0 | 1;
};
```

`runStats` returns strings, not side effects. Both renderers are pure functions of one
`StatsReport`, the internal value `runStats` builds before rendering:

```ts
type StatsReport =
  | { kind: "single"; result: FeatureStats }
  | { kind: "fleet";  results: FeatureResult[]; unclassified: string[] }
  | { kind: "error";  reason: "not_found" | "no_docs_root" | "unreadable_feature";
      feature: string | null; message: string };
```

`kind: "error"` carries exactly the three `reason` values BR-30 enumerates and no fourth. `feature`
is `null` only on a fleet-mode root failure — D-9's carve-out, and AT-27's eight-run leg asserts the
name is present in every single-feature run rather than hardcoded `null`.

**One report value, two renderers.** `renderHuman` and `renderJson` are both total over
`StatsReport` and neither recomputes anything. That is what makes AT-06's "the two modes agree
metric for metric" a structural property rather than a coincidence: a metric can only reach one mode
by way of the value the other mode also reads. It is also what makes REQ-STATS-02's set-equality
checkable — §6.3 specifies the oracle that derives the human table's metric set and the JSON key set
from the same `StatsReport` and asserts they correspond.

#### 4.2.1 The emitted JSON key sets (BR-21, BR-23, BR-24, BR-30)

`StatsReport` is an internal value, not the wire format. `renderJson` is a **projection**, not a
serialisation of the report: `FeatureStats.feature` and `FeatureStats.dir` exist for the human
header (BR-17) and for BR-02's live-versus-archived preference, and neither reaches the document.
BR-21 says so explicitly ("the feature name is not echoed as a top-level key"), and BR-23's fleet
entry is "BR-21's document minus its hoisted `schemaVersion`", so `dir` is excluded there too.
Serialising `FeatureStats` directly would therefore break REQ-STATS-02's set-equality on day one;
this contract exists so that no implementer reaches for `JSON.stringify(report.result)`.

```ts
const SCHEMA_VERSION = 1;                     // BR-24: an integer, 1 at first release

type MetricObject = {                         // shared by both success shapes
  reviewRounds: ReviewRounds; dodRounds: DodRounds;
  halts: HaltEntry[];        byteRatio: ByteRatio;
};

/** BR-21 — exactly five top-level keys, set-equal and no longer. */
type SingleDocument = { schemaVersion: number } & MetricObject;

/** BR-23 — exactly three. A `features` value is a MetricObject or `{gap}`. */
type FleetDocument = {
  schemaVersion: number;
  features: Record<string, MetricObject | { gap: string }>;
  unclassified: string[];                     // BR-26's entries; [] when there are none
};

/** BR-30 — exactly three; `error` has exactly `reason` and `message`. */
type ErrorDocument = {
  schemaVersion: number;
  error: { reason: "not_found" | "no_docs_root" | "unreadable_feature"; message: string };
  feature: string | null;                     // null only on a fleet-mode root failure (D-9)
};
```

The emitted key sets, stated once here and asserted in §6.3 against a **literal transcription** of
the FSPEC's own words — never derived from the type under test, which would agree with a wrong
implementation:

| Document | Top-level keys | Count | Source |
|---|---|---|---|
| single-feature success | `schemaVersion`, `reviewRounds`, `dodRounds`, `halts`, `byteRatio` | 5 | BR-21, BR-24 |
| fleet success | `schemaVersion`, `features`, `unclassified` | 3 | BR-23, BR-24 |
| refusal, either mode | `schemaVersion`, `error`, `feature` | 3 | BR-30 |
| one fleet `features` entry | the four metric keys, **or** the single key `gap` | 4 or 1 | BR-23 |

`schemaVersion` is a `renderJson` obligation, not a `StatsReport` or `FeatureStats` field. Putting
it on the report would move a JSON-only concern into the value the human renderer also reads, and
would force §6.3's "both modes carry the same metric set" oracle to carry a permanent exception for
it. It is hoisted identically in all three documents (BR-30: "hoisted exactly as BR-21 hoists it"),
so a consumer reads the version before it branches on shape. Its value is the module constant
`SCHEMA_VERSION`; BR-24's increment rule — removing a released field or changing its meaning
increments it, adding a field inside a metric's value does not — is what REQ R-5's stability
guarantee rests on. Key order inside each document is this table's order, fixed by object-literal
construction rather than by iterating a set (BR-18, and PROP-3 in §6.6).

### 4.3 How each metric is computed

Given `listing = io.listDir(dir).filter(e => !e.isDirectory)` — one call, reused by all four
metrics, and the `isDirectory` filter is BR-03/EC-04 discharged at the source rather than per metric:

**Review rounds (BR-05…BR-09).** `basenames = listing.map(e => e.name)`.

```
harvested = basenames.includes(`LEARNINGS-${feature}.md`)
for docType of REVIEW_DOC_TYPE_ROWS:
    w = parsers.deriveRoundWindow(basenames, docType)
    if (!w.ok)                 -> { state: "unmeasurable", rounds: null, collidingRole: w.role }
    else if (w.startIndex > 1) -> { state: "measured", rounds: w.startIndex - 1, collidingRole: null }
    else if (harvested)        -> { state: "harvested", rounds: null, collidingRole: null }
    else                       -> { state: "measured", rounds: 0, collidingRole: null }
malformed = basenames.filter(b => { const r = parsers.parseReviewFilename(b);
                                    return !r.ok && r.reason !== "not_cross_review"; })
```

Three properties of that branch order are deliberate. `unmeasurable` is tested **first**, so a
collision is never masked by the harvested test (BR-07: `unmeasurable` is not `0`). `w.startIndex > 1`
is the "any file present for this type" test — `deriveRoundWindow` returns `startIndex = 1` exactly
when the type has no matching file — so `harvested` is only ever reached for a type with no
evidence, which is BR-08's per-doc-type discipline. And `malformed` comes from its own
`parseReviewFilename` pass, not from `w.skipped`, for the early-return reason in §3.2.

**DoD rounds (BR-10, BR-11).**

```
n = parsers.deriveDodRoundIndex(basenames, feature) - 1
if (n > 0)          -> { state: "measured",  rounds: n }
else if (harvested) -> { state: "harvested", rounds: null }
else                -> { state: "measured",  rounds: 0 }
```

`n > 0` is exactly BR-11's "no `CODE_REVIEW-{feature}-v{N}.md` file matching the version grammar
remains": the driver's matcher escapes the feature name before matching, so a foreign-feature
`CODE_REVIEW-` file contributes nothing, and `CODE_REVIEW-{feature}-draft.md` does not match at all
— EC-16/AT-28's "silent, not malformed", inherited rather than coded.

**Halts (BR-12, BR-13).** Match `^POSTMORTEM-(.+?)-{escapedFeature}\.md$` against each basename,
with `{feature}` escaped by the same `replace(/[.*+?^${}()|[\]\\]/g, "\\$&")` idiom
`deriveDodRoundIndex` uses, so a feature name is never misread as a pattern. The capture is the
phase, taken verbatim — no catalogue, no validation (BR-12: `POSTMORTEM-I-pdlc-headless-engine.md`
exists on disk although the driver's force-phase token list omits `I`). Resolution:

```
m = parsers.parseResolvedMarker(io.readFile(abs))
resolution = (m.ok && m.resolved) ? "resolved" : "open"     // fail-closed, incl. read failure
```

That single expression covers all three of EC-14's conditions — absent, duplicated, unparseable —
because `parseResolvedMarker` returns `ok: false` for each, and it matches the driver's own
`checkPostmortem` mapping of both `ok: false` and `resolved: false` onto unresolved. Entries are
sorted by `phase` with `Array.prototype.sort()`'s default (code-unit) collation, ascending; BR-13
names the collation because `PR` is two characters, and code-unit order puts `D, F, I, T` in exactly
AT-14b's asserted sequence.

**Byte ratio (BR-14…BR-16).** Two disjoint file sets, each summed with `io.fileSize`:

```
specFiles    = REVIEW_DOC_TYPE_ROWS.map(t => `${t}-${feature}.md`) ∩ basenames
crossReviews = basenames.filter(b => parsers.parseReviewFilename(b).ok)
postMortems  = the halt matcher's matches
dodReviews   = basenames matching `CODE_REVIEW-${escapedFeature}-v(\d+)\.md`
processFiles = crossReviews ∪ postMortems ∪ dodReviews
```

The spec side reuses `REVIEW_DOC_TYPE_ROWS` because REQ C-3's six document types and BR-09's six
row types are the same six names — one constant, not two lists that can drift. The process side's
cross-review membership is `parseReviewFilename(...).ok`, so a grammatically-failing basename
contributes to **neither** side: `CROSS-REVIEW-{role}-REVIEW-v{N}.md` is listed as malformed and
sized into nothing. That is BR-14's "matching the grammars" read literally, and it is stated here
because it is the one consequence of BR-06 that lands in a different metric. Then, in this order:

```
if (harvested && (crossReviews.length === 0 || dodReviews.length === 0))
                             -> { state: "harvested",   ratio: null, processBytes, specBytes }
else if (specBytes === 0)    -> { state: "unavailable", ratio: null, processBytes, specBytes }
else -> { state: "measured", ratio: round2(processBytes / specBytes), processBytes, specBytes }
```

Harvested before zero-denominator is BR-16's stated precedence, and AT-17's third fixture — harvested
with no spec documents either — is the leg that distinguishes the two orders. `round2` is
`Math.round(x * 100) / 100`; the human renderer prints `ratio.toFixed(2)` of the **same** rounded
number, so BR-15's "the two modes never disagree on a displayed value" holds by construction rather
than by two independent formatters agreeing.

### 4.4 Discovery (BR-25, BR-26)

`NON_FEATURE_DIRS` is the frozen eight BR-25 fixes: `_queue`, `_constraints`, `_decisions`,
`design`, `requirements`, `ideas`, `discarded`, `completed`. All eight are present at this
repository's `docs/` root today, and they are exactly the non-feature directories there.

```
liveDirs      = listDir(docs/).filter(isDirectory)
archivedDirs  = exists(docs/completed) ? listDir(docs/completed).filter(isDirectory) : []
unclassified  = liveDirs.filter(d => d.name.startsWith("_") && !NON_FEATURE_DIRS.includes(d.name))
liveFeatures  = liveDirs.filter(d => !NON_FEATURE_DIRS.includes(d.name) && !unclassified.includes(d))
features      = liveFeatures ∪ { archived whose name is not already a live feature }   // BR-02
```

The underscore test is this document's choice and is flagged: **FSPEC BR-26/EC-10 name an
"unclassified" outcome for a directory "in neither the exclusion set nor recognizable as a feature",
but state no positive recognition predicate**, and EC-03/AT-26 rule out the obvious candidate
(artifact presence) by making a readable-but-empty directory a normal measured row. The leading
underscore is the only discriminant the repository's own convention actually supplies —
`_queue`/`_constraints`/`_decisions` carry it and no feature directory does — and it satisfies
BR-26's purpose for the growth case that motivates it (a new `docs/_evidence/` surfaces rather than
joining the feature list with meaningless metrics). It does **not** cover a future bare-named
non-feature directory, which would be reported as a feature with zero-state metrics. That residue is
raised as an erratum against the FSPEC (§8) rather than resolved by inventing a richer rule here.

`docs/completed/` is traversed as a container and never reported as a feature, which is what stops
`docs/completed/REQ-completed.md` — a loose file, verified present — from ever mattering: the
`isDirectory` filter drops it before any name test runs, as it does
`docs/PLAN-pdlc-integration-boundary-gates.md` and `docs/completed/QUEUE-HISTORY-rows-0-1.md`, both
also verified present.

## 5. Error Handling

Every failure scenario, the code path that catches it, and the FSPEC-decided observable. No row's
behavior is "implementation's choice" — FSPEC §5 already decided all of them; this table names where
each is produced.

| Scenario | Caught at | Produced value | Observable | Exit |
|---|---|---|---|---|
| Unknown flag, or a value flag with no value | `checkFlags` in `main()`, before `cmdStats` runs | — | `USAGE` + message on **stderr**, stdout empty in both modes (EC-08, BR-01, BR-20's one exception) | 1 |
| Two or more positionals | `parseStatsArgv` → `{ok: false}` | — | same shape as above: message on stderr, stdout empty (BR-01) | 1 |
| `docs/` root absent or unreadable | `runStats`: `io.exists(docs)` false, or `io.listDir(docs)` throws | `{kind: "error", reason: "no_docs_root", feature}` | human: stderr message naming the root and *which* condition; JSON: BR-30's three-key object on stdout. `feature` is the supplied name in single-feature mode, `null` in fleet mode (D-9) | 1 |
| Feature names no directory under either root | `runStats`, after both `io.exists` probes fail | `{kind: "error", reason: "not_found", feature}` | reported by name; JSON `error.reason` is `not_found` (EC-01) | 1 |
| Single-feature directory exists but `io.listDir` throws | `try`/`catch` around the single-feature `computeFeatureStats` | `{kind: "error", reason: "unreadable_feature", feature}` | stderr message; JSON error object with the third `reason` (EC-11, D-10) — **not** empty stdout | 1 |
| Fleet: one feature's `io.listDir` throws | per-feature `try`/`catch` inside the discovery loop | `{feature, gap: reason}` | one gap row / one `{gap}` entry; every other feature still reported (BR-27) | 0 |
| Fleet: anything else throws while computing one feature | the **same** per-feature `try`/`catch` (catch-all, not a read-specific guard) | `{feature, gap: reason}` | EC-21. AT-20's second leg exists because a guard placed around the `listDir` call alone would pass the first leg and fail this one | 0 |
| `io.readFile` throws on a POSTMORTEM | `try`/`catch` at the halt call site | `resolution: "open"` | fail-closed, identical to an absent marker (BR-12, EC-14) | 0 |
| `io.fileSize` throws on one file (deleted between `listDir` and `lstat`) | `try`/`catch` at the sizing call site | contributes `0` bytes | the ratio is still produced; a race on a transient file never crashes a report | 0 |
| Zero spec bytes | no throw — a branch, not an error | `byteRatio.state = "unavailable"` | `n/a` / `state: "unavailable"`, both byte totals still printed (BR-15, EC-12) | 0 |
| Round-1 collision for one doc type | no throw — `deriveRoundWindow`'s `ok: false` branch | `state: "unmeasurable"` + `collidingRole` | that row only; the other five rows and the other three metrics are unaffected (BR-07, EC-06, AT-25) | 0 |
| Unexpected throw anywhere in single-feature mode | outermost `try`/`catch` in `cmdStats` | — | message on stderr, exit 1; never a stack trace on stdout in `--json` mode | 1 |

Two structural properties this table depends on:

**No error path writes anything.** Every row above is produced by returning a value, never by a
side effect, and the seam bundle (§2.3) carries no write capability, so BR-28's "on every path,
including error paths" is not a discipline the implementer must maintain — there is no API through
which a write could be attempted. AT-21/AT-22's snapshot pairs assert it empirically anyway,
including on the two failure paths.

**The read-only conjunct is paired with a liveness conjunct.** REQ-STATS-08 and FSPEC §3.4 both
insist that leaving the tree untouched never suffices alone: the same invocation must also have done
its job. Because `runStats` returns `{stdout, stderr, exitCode}` as one value, a run that produced no
output is a distinguishable outcome (`stdout === "" && stderr === ""`) rather than an
indistinguishable silence, and §6.5's oracle asserts both halves against one invocation.

## 6. Test Strategy

TDD, red-before-green, in `pdlc/workflows/__tests__/` under the existing jest + c8 arrangement
(`cd pdlc/workflows && npm test`; `npm run test:coverage` for the gated run). The new module joins
the c8 `include` list (§2.1), so its per-file branch floor is 85 %.

### 6.1 Test doubles

Two doubles, both hand-written, both in a shared `__tests__/helpers/` module owned by a single
batch-1 task:

| Double | Substitutes | Design |
|---|---|---|
| `fakeStatsIo(tree)` | `StatsIo` | `tree` is a plain object mapping absolute paths to `{dirs, files}` or to file contents. Every member is total except where a test asks for a throw: `fakeStatsIo(tree, {throwOn: {listDir: [path]}})` makes exactly one call site throw, which is how the unreadable-directory and per-feature-gap rows are driven without needing real permission bits. **The double has no write member**, so a production write attempt is a `TypeError`, not a silent success. |
| `recordingParsers(real)` | `StatsParsers` | wraps the **real** driver exports and records call arguments. Tests that need a specific classifier branch pass a narrow stub instead, but the default is the real thing — a stub is opt-in per assertion, never the ambient default. |

Real-path tests (AT-09, AT-10, AT-11, AT-13, AT-14b, AT-18) use the **real** `node:fs` `StatsIo`
against this repository's own `docs/completed/` archive, with literal expectations. Their literals
are measurements of the archive as it stands and are re-measured if the archive changes; a test that
replaced a literal with a derivation would agree with a wrong implementation (FSPEC §6's rule).
These paths are verified present at HEAD: `docs/completed/pdlc-advisory-wave-gate/` carries exactly
four `CROSS-REVIEW-{product-manager,test-engineer}-REVIEW-v{1,2}.md` files;
`docs/completed/pdlc-headless-engine/` carries `CROSS-REVIEW-software-engineer-TSPEC-v13.md`,
`LEARNINGS-pdlc-headless-engine.md` and `POSTMORTEM-{D,F,I,T}-pdlc-headless-engine.md`;
`docs/completed/pdlc-loop-economics/` carries `CODE_REVIEW-pdlc-loop-economics-v{1,2}.md`;
`docs/completed/pdlc-wave-resume/` carries `POSTMORTEM-PR-pdlc-wave-resume.md`.

### 6.2 Test levels

| Level | Subject | What it proves |
|---|---|---|
| Unit — pure | `parseStatsArgv`, `round2`, the halt matcher, `discoverFeatures` | grammar and predicate behavior with no fs at all |
| Unit — seamed | `computeFeatureStats` with `fakeStatsIo` + real parsers | every metric's branch table (§4.3), each state reachable |
| Unit — render | `renderHuman` / `renderJson` over hand-built `StatsReport` values | token spellings, row order, key sets, without recomputing metrics |
| Integration — in-process | `runStats` end-to-end with `fakeStatsIo` | flows A/B/C, exit codes, the error shapes |
| Integration — real fs | `runStats` with the real `StatsIo` over `docs/completed/` | the real-path ATs, and that the seams and the archive agree |
| Process | `main(["node","pdlc","stats",...])` in-process, stdout/stderr captured | flag closure, stdout emptiness on usage error, exit codes at the real edge |

Importing `bin/cli.mjs` is inert — the file states and its entry guard enforces that self-invocation
only happens when `import.meta.url` matches `process.argv[1]` — so the process level runs `main()`
directly with a process-argv-shaped array, exactly as `cli.test.js` already does, with no spawn.

### 6.3 The cross-mode oracle (AT-06)

One test parameterised over a corpus of `StatsReport` values that between them reach **every**
state of every metric. For each: build `renderHuman(report)` and `renderJson(report)`, extract the
metric set from each, and assert correspondence. In fleet mode the permitted differences are exactly
the two D-7 reductions (malformed list → count; per-phase halt entries → `{n} ({r} resolved)`) and
the test enumerates them as an allow-list, so a third reduction fails. This is the oracle that makes
REQ-STATS-02's set-equality and REQ R-5's stability guarantee checkable rather than asserted.

### 6.4 Anti-drift oracles

Four, each closing a way this design could silently stop being what it says it is:

| Oracle | Asserts | Fails when |
|---|---|---|
| **Parser identity** (§2.5) | `statsParsers()`'s four members are `===` the corresponding `orchestrate-dev.js` exports | someone re-implements a grammar locally, even one that agrees on today's corpus |
| **Doc-type catalogue agreement** (§3.3) | for every name in `REVIEW_DOC_TYPE_ROWS`, `parseReviewFilename("CROSS-REVIEW-se-review-{T}-v1.md")`-shaped input parses `ok`, **and** no seventh type the driver accepts is missing from the row set — probed by asserting a known-rejected type (`REVIEW`) stays rejected and the six stay accepted | the driver's private `REVIEW_DOC_TYPES` grows or shrinks without FSPEC §7.4 A-3's required FSPEC edit |
| **Vendoring co-change** (§2.1) | `lib/stats.mjs` appears in `prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`, `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES` and `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`, and that `tspecPackedCount`'s vendored class size equals that list's length | one of the five sites is edited and another is not — the exact failure `pdlc-engineering-loop`'s LEARNINGS names as "a co-change set enumerated in prose with no oracle is unsound by construction" |
| **No-write capability** (§2.3) | the `StatsIo` object literal `statsIo()` returns has exactly the four keys `listDir`, `fileSize`, `readFile`, `exists` | a fifth seam is added, which is how a write would first become possible |

The vendoring oracle **derives** the expected member from `MODULE_NAMES` rather than transcribing a
literal, so it cannot disagree with the list it checks — the `EXPECTED_TEST_COMMAND` lesson from
`pdlc-loop-economics`'s LEARNINGS F-4 applied before it recurs.

### 6.5 The read-only oracle (AT-21, AT-22)

Snapshot every path under the repository root except `.git/`, recording path and mtime; run the
command; snapshot again; assert **set-equality between the two snapshots of the same tree** — never
against a fixed literal. Comparing two snapshots taken around one invocation is what keeps an
untracked tool cache or editor backup from flaking the test, which is exactly the failure mode
`coveredViolations` in `pdlc/workflows/lib/document-oracles.mjs` produces when it walks the whole
tree. Untracked paths are deliberately **inside** the snapshot: BR-28 permits no write anywhere, so
an untracked path changing is a real violation.

Each leg asserts both conjuncts against one invocation — snapshot unchanged **and** the run did its
job (metric set on stdout with exit 0, or the refusal report with exit 1). The `git`/network half is
asserted structurally: the seam bundle has no `git` or network member, and §6.4's no-write-capability
oracle pins that it never grows one.

### 6.6 Property-based tests

`fast-check` is already a dev dependency of `pdlc/workflows`. Three properties, chosen because each
is a claim about *all* inputs rather than a worked example:

| Property | Statement |
|---|---|
| PROP-1 (partition) | For any generated basename list, every basename lands in exactly one of: counted for one doc type, malformed, or neither — never two. Falsifies a `not_cross_review` filter that leaks into the malformed list. |
| PROP-2 (state totality) | For any generated directory listing, every `DocTypeRounds`, `DodRounds` and `ByteRatio` produced carries a `state` from its declared union, `rounds`/`ratio` is `null` in exactly the non-`measured` states, and `collidingRole` is non-`null` in exactly `unmeasurable`. Falsifies a key-absent shape (BR-22's fixed-shape guarantee). |
| PROP-3 (determinism) | Two `runStats` calls over the same `fakeStatsIo` tree produce byte-identical `stdout`. Falsifies any set- or object-key iteration reaching the output (BR-09, BR-13, BR-18 ordering claims). |

Mutation testing targets the branch orders §4.3 fixes: swapping `unmeasurable` before/after
`harvested`, swapping BR-16's harvested test before/after BR-15's zero-denominator test, and
dropping the `- 1` from either of the two driver-index conversions. Each mutation must turn a test
red; a mutation that survives means the branch order is untested, not that it is safe.

## 7. Traceability

### 7.1 Business rule → technical component

| BR | Component | Where |
|---|---|---|
| BR-01 | `FLAGS_BY_COMMAND.stats` + `validateFlags` + `parseStatsArgv`'s positional check | §3.4 |
| BR-02 | `discoverFeatures`' live-before-archive preference; `FeatureStats.dir` | §4.4 |
| BR-03 | `listDir(...).filter(e => !e.isDirectory)`, once, at the source | §4.3 |
| BR-04 | exact `===` name match against directory names; no fuzzy matching anywhere | §4.4 |
| BR-05 | `deriveRoundWindow(...).startIndex - 1` | §4.3 |
| BR-06 | separate `parseReviewFilename` pass, `reason !== "not_cross_review"` | §3.2, §4.3 |
| BR-07 | `deriveRoundWindow`'s `ok: false` branch, tested first | §4.3 |
| BR-08 | per-doc-type `harvested` test gated on `startIndex === 1` | §4.3 |
| BR-09 | `REVIEW_DOC_TYPE_ROWS`, iterated in order for both renderers | §3.3, §4.1 |
| BR-10 | `deriveDodRoundIndex(...) - 1` | §4.3 |
| BR-11 | `n > 0` before the harvested test | §4.3 |
| BR-12 | halt matcher + `parseResolvedMarker`, fail-closed | §4.3 |
| BR-13 | empty array; default code-unit `sort()` on `phase` | §4.1, §4.3 |
| BR-14 | `specFiles` / `processFiles` sets, `io.fileSize` (`lstat`) | §2.4, §4.3 |
| BR-15 | `round2` once, `toFixed(2)` of the same number | §4.3 |
| BR-16 | harvested test before the zero-denominator test | §4.3 |
| BR-17, BR-18, BR-19 | `renderHuman` | §4.2, §6.3 |
| BR-20 | `StatsOutcome.stdout`; `checkFlags`'s stderr-only usage path | §3.4, §4.2 |
| BR-21, BR-22, BR-23, BR-24 | `renderJson` over `StatsReport`; `FeatureResult`'s key discriminant | §4.1, §4.2 |
| BR-25, BR-26 | `NON_FEATURE_DIRS`, `discoverFeatures`' underscore predicate | §4.4 |
| BR-27 | per-feature `try`/`catch` → `{gap}`; fleet exit stays 0 | §5 |
| BR-28 | seam bundle with no write member; no-write-capability oracle | §2.3, §6.4, §6.5 |
| BR-29 | `StatsOutcome.exitCode: 0 | 1`; no `emitReport` call | §3.5 |
| BR-30 | `StatsReport`'s `kind: "error"` with three `reason` values | §4.2, §5 |

### 7.2 FSPEC open item → decision

| FSPEC §7.2 | Question | Answered |
|---|---|---|
| O-1 | reuse the driver's parsing, or implement an own read path | reuse, by importing the four exports by reference, with an identity oracle (§2.5, §3.2, §6.4) |
| O-2 | subcommand of `pdlc`, or standalone | subcommand: a `stats` case in `bin/cli.mjs`, inheriting `validateFlags`, `checkFlags` and `launch()`'s passthrough (§3.4) |
| O-3 | how byte totals are obtained | `lstatSync().size` per directory entry, working tree only, no git read (§2.4) |
| O-4 | sequential or concurrent fleet computation | sequential (§2.3) |

### 7.3 Feasibility and cost

No requirement in this feature is infeasible with the current architecture, and none needs a new
platform capability. One cost is out of proportion to the code it enables and is surfaced rather
than absorbed: **adding one 300-line module to `pdlc/workflows/lib/` requires editing five
enumeration sites and amending a completed sibling feature's approved, frozen packed-set table**
(§2.1). That is roughly as much co-change surface as the feature's own logic. It is taken knowingly
because the alternatives trade it for no coverage gate (option C) or for the same cost plus no
coverage gate (option B), and because the vendored class has already grown once by this exact route.
The re-evaluation trigger belongs in DECISIONS: if a future feature makes `pdlc/workflows/lib/` a
routinely-growing directory, the enumerations should be derived from a directory listing at pack
time rather than transcribed at five sites.

## 8. Open Questions

### 8.1 Assumptions

- **A-1** Authored in an orchestrated, non-interactive dispatch. Every choice in §2–§6 is explicit
  and operator-vetoable, not a silent default.
- **A-2** `pdlc/workflows/lib/` is an established home for pure workflow-support modules, evidenced
  by `lib/loop-session.mjs` and `lib/escalation-view.mjs` both living there and both being vendored.
- **A-3** The four driver exports are stable API within this repository: they are `export`ed, called
  from `orchestrate-dev.js`'s own loops, and covered by the existing workflows suite. This design
  adds a second consumer and no new obligation on them.

### 8.2 Risks

| # | Risk | Mitigation |
|---|---|---|
| RK-1 | The five-site vendoring co-change is done partially; the packed engine ships without `lib/stats.mjs` and `pdlc stats` fails only for installed users, never in a checkout — where `resolveWorkflowRoot` falls back to the checkout tree and finds the module anyway. | §6.4's vendoring oracle, deriving from `MODULE_NAMES` rather than transcribing. The fixture machine's install leg exercises the packed tarball, so the failure surfaces in CI, not in the field. |
| RK-2 | The parser bundle is injected, so a suite of stubs could pass while production diverges from REQ C-5. | §6.4's identity oracle: `===` against the real exports, plus real-parser-by-default doubles (§6.1). |
| RK-3 | `REVIEW_DOC_TYPE_ROWS` is a local copy of a module-private driver catalogue. | §6.4's catalogue-agreement oracle; FSPEC §7.4 A-3 already makes a seventh driver type an FSPEC edit. |
| RK-4 | Real-path tests bind to the live `docs/completed/` archive; a future feature archiving or harvesting a directory turns them red for a reason unrelated to this code. | Literals are declared as measurements of the archive and re-measured when it changes (§6.1); the failure is loud and its cause is named in the test's own comment. This is the `doc-moves-break-pinned-tests` pattern, accepted because FSPEC §6 explicitly requires literal, non-derived expectations on real paths. |
| RK-5 | The underscore-prefix discovery predicate (§4.4) does not catch a future bare-named non-feature directory. | Erratum raised against FSPEC (§8.3); the residue is a directory reported as a feature with zero-state metrics, which is visible rather than silent. |

### 8.3 Upstream errata — not folded into this document's verdict

Raised against the upstream document that owns each, per the erratum channel; none is repaired here.

- **FSPEC BR-26/EC-10 name an "unclassified" outcome but state no positive feature-recognition
  predicate.** "In neither the exclusion set nor recognizable as a feature" is circular as written,
  and EC-03/AT-26 rule out artifact-presence as the predicate by making a readable-but-empty
  directory a normal measured row. AT-19's *Given* inherits the circularity. §4.4 adopts a
  leading-underscore discriminant as the only one the repository's convention supplies and flags the
  bare-named residue; the FSPEC should state the predicate it intends.
- **FSPEC BR-25 names `docs/completed/REQ-completed.md` as the loose file its directories-only rule
  excludes, but `docs/completed/QUEUE-HISTORY-rows-0-1.md` is also present at that root.** No
  behavior changes — the `isDirectory` filter drops both — but the illustration is incomplete, and
  a reader checking the claim against the tree finds a second file the rule does not mention.

### 8.4 Questions for DECISIONS

Two load-bearing alternatives were weighed and rejected and belong in `DECISIONS-pdlc-stats.md`:

1. **Module placement** (§2.1's three-option table): `pdlc/workflows/lib/stats.mjs` chosen over an
   engine-`lib/` module and over inlining in `bin/cli.mjs`. Constraint that forced the shape: the
   coverage gate lives in the workflows package, and REQ C-5 makes co-location with the driver's
   parsers the correctness-relevant property. Reversibility: hard — the vendoring enumerations and
   the sibling feature's frozen packed-set table would have to be amended a second time.
   Re-evaluation trigger: `pdlc/workflows/lib/` becoming a routinely-growing directory, at which
   point the five enumerations should be derived rather than transcribed.
2. **Parser injection with an identity oracle**, rejected in favour of neither a direct static
   import (which forces every unit test to load 816 KB and makes `ok: false` branches hard to reach)
   nor behavioral-equivalence testing (which passes for a re-implementation that agrees on today's
   corpus and so cannot enforce REQ C-5). Reversibility: easy. Re-evaluation trigger: the driver
   exports gaining state, at which point sharing references stops being sufficient.

