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
| Draft | se-author | 1.0 | 2026-08-31 |

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

Three edits to `pdlc/engine/bin/cli.mjs`, all additive:

| Site | Edit |
|---|---|
| `FLAGS_BY_COMMAND` | add row `stats: ["json", "cwd"]` |
| `main()`'s `switch (cmd)` | add `case "stats": if (checkFlags(rest, "stats")) await cmdStats(rest); break;` |
| `USAGE` | add the `pdlc stats [feature] [--json] [--cwd <path>]` line |

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
async function cmdStats(argv) {
  const cwd = path.resolve(readFlag(argv, "cwd") || process.cwd());
  const outcome = runStats({ argv, io: statsIo(), parsers: await statsParsers(), cwd });
  if (outcome.stdout) process.stdout.write(outcome.stdout);
  if (outcome.stderr) process.stderr.write(outcome.stderr);
  process.exitCode = outcome.exitCode;
}
```

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

## 5. Error Handling

## 6. Test Strategy

## 7. Traceability

## 8. Open Questions
