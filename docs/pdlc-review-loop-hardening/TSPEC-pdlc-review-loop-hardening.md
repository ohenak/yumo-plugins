# TSPEC — pdlc-review-loop-hardening

**Version:** 1.0
**Status:** Draft (awaiting se-review / te-review)

| Field | Value |
|---|---|
| Upstream | `REQ → FSPEC → **TSPEC**` |
| Downstream | `DECISIONS, PLAN, PROPERTIES, IMPL` |
| Cross-Reviews | `docs/pdlc-review-loop-hardening/CROSS-REVIEW-{software-engineer,test-engineer}-TSPEC-v{N}.md` (link list while active; harvested into `LEARNINGS-pdlc-review-loop-hardening.md` after Phase H) |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` |

---

## 1. Overview

### 1.1 What this document is

The FSPEC (v1.5, 66 acceptance tests `AT-01`…`AT-66`, 71 edge cases `E-01`…`E-71`, 21 obligations
`O-1`…`O-21`) fixes **behaviour**. This TSPEC fixes **code**: module layout, exact function
signatures, injected-seam definitions and their Node defaults, data shapes, control flow, constant
placement, and the file each change lands in. It does not re-narrate the FSPEC. Every behavioural
claim here is a pointer — `AC-*`, `E-*`, `AT-*`, `O-*`, `DC-*` — and the reader is expected to
resolve it in REQ v1.5 / FSPEC v1.5 / `docs/_constraints/DOMAIN-CONSTRAINTS.md`.

Where the FSPEC deliberately left a decision to implementation, §10 records the resolution taken
here. Where it left something genuinely open at REQ altitude, §10 carries it forward unresolved
rather than inventing an answer.

### 1.2 The four defects

| Id | Observed harness defect | Root cause in code | Landing section |
|---|---|---|---|
| **H-1** | Review iteration index derived as `1` on every entry, so round-2+ cross-reviews overwrite round-1 files and history is destroyed | `reviewLoop`'s `iteration = 1` default parameter is never overridden — all seven call sites in `orchestrate-dev.js` omit it | §5.2 (round derivation), §3.2 (`_listFiles`) |
| **H-2** | A phase that cannot converge exits non-terminally: the loop reports failure but the run continues, and no POSTMORTEM is actually written | `checkConverged` builds a `postmortemPath` template it never uses, and its halt text claims "POSTMORTEM written" | §6.3, §12-equivalent (§6.4 POSTMORTEM gate) |
| **H-3** | The 180 s stall watchdog kills a monolithic document write; six consecutive kills produced zero output | No pacing contract exists between the orchestrator and an authoring agent — one dispatch, one unbounded write | §5.6 (`dispatchAndVerify`) |
| **H-4** | An already-approved phase is re-run from scratch on re-entry, discarding a converged artifact | No persisted approval record exists to consult; convergence lives only in the in-process loop | §5.4 (approval), §5.5 (staleness) |

The four are not independent. H-1 supplies the round index that H-4's approval search keys on; H-3's
pacing wrapper is the unit H-2's terminal-exit rule wraps; H-2's POSTMORTEM gate is what makes H-4's
"skip an approved phase" safe to trust.

### 1.3 Change surface

Five tracked paths change. Nothing outside them does.

| Path | Nature of change |
|---|---|
| `pdlc/workflows/orchestrate-dev.js` | Bulk of the work: six new seams on `main()`, the round/approval/pacing machinery, the terminal-exit fix, new module constants |
| `pdlc/workflows/orchestrate-queue.js` | Queue-row commit via `_git`; export of the previously-private status rewriter |
| `pdlc/workflows/runtime-adapter.js` | Adapter implementations for the new seams, wired through `rtDevInjections` |
| `pdlc/workflows/build-runtime.mjs` | Four load-bearing edits (§7.2) so the new exports and the queue's `_git` reach the bundles |
| `pdlc/workflows/__tests__/` | New and extended jest suites (§8) |

Two SKILL prompts are amended in the same change (`pdlc/skills/{se,pm,te}-review/SKILL.md` for the
persisted-verdict field, and the three author SKILLs for the `REVISION-COMPLETE:` trailer) — these
are prompt text, specified in FSPEC §6.5 and §8.4, and are reproduced here only as a checklist row
in §7.4.

`pdlc/workflows/dist/` is **generated**. It is rebuilt by `node pdlc/workflows/build-runtime.mjs`
in the same commit as any source change above, per `CLAUDE.md` § "Workflow scripts and the runtime
build". It is never hand-edited and never authored by this TSPEC.

### 1.4 Binding constraints

These are not preferences. Each one has killed a working implementation in this repo before.

**C-2 — the runtime is a constrained execution environment** (`DEC-DIST-01`,
`docs/_decisions/DECISIONS-plugin-distribution.md`). A bundle may declare `export const meta` as its
first statement and as a pure literal; it may declare no other `export`; it has no `import`, no
`import()`, no `process`, no `fs`, no `fetch`, no `crypto`, no `TextEncoder`. Exactly eleven host
globals exist: `agent`, `parallel`, `pipeline`, `phase`, `log`, `workflow`, `args`, `budget`,
`console`, `setTimeout`, `clearTimeout`.

*Consequence.* Every new capability that touches the outside world arrives as an **injected seam** —
a named parameter on `main()`'s destructured options object, defaulted to a Node implementation so
jest can exercise the module directly, and supplied by `runtime-adapter.js` in the bundle. No new
capability is obtained any other way. §3 defines the six.

**Await discipline.** The adapter's seam implementations are `async`; the jest test doubles are
synchronous. A missing `await` on an injected call therefore **passes every unit test and fails only
in the runtime**. Every call to an injected seam in this design is `await`ed, without exception,
including calls whose result is discarded. AT-19 (§8.5) is the mechanical guard.

**C-5 — no agent in a decision loop a script can make.** Every parser, comparison, counter and gate
specified here is pure JavaScript running in the workflow process. An `agent()` call appears only
where the work is genuinely generative (authoring, reviewing) or where the runtime offers no
primitive (file IO, `git`, `gh`) — and in the latter case behind a seam, never inline in a loop.

**No `crypto`.** The content digest (§5.3) is therefore an inlined, pure-JS SHA-256 over a
hand-rolled UTF-8 encoding. It is synchronous and deterministic, so — unlike file IO — it is **not**
a seam and takes no injection. §3.7 states why.

**DC-01 (closed and total).** Every string crossing a component boundary is a closed catalogue on
the emit side and a **total** function on the receive side. Six parsers are specified in §5; each is
total, each has an explicit disposition for absent, malformed and truncated input. `ListFailure`
(§4.2) and `TrailerFailure` (§4.3) are the two new closed catalogues.

**DC-02 (measured, not inferred).** Every assertion this document makes about existing code was
checked against the working tree at HEAD `af6f335` on `feat-pdlc-review-loop-hardening`. Code is
cited as **enclosing symbol plus a distinctive literal** — never as a bare `file:line`, which drifts
(FSPEC §1.1, O-16).

### 1.5 Reuse of shipped precedent

Per the `se-author` "cite-and-reuse the sibling" rule, three existing mechanisms are reused rather
than reinvented:

- **The injection idiom itself.** `main()` in `orchestrate-dev.js` already destructures sixteen
  injections (`_agent`, `_parallel`, `_log`, `_checkFile`, `_readFile`, `_phase`, `_pipeline`,
  `_mergeWorktree`, `_rebaseOntoDefault`, `_dodVerifyLoop`, `_raisePrAndVerifyCi`, `_checkCi`,
  `_phaseDodEnabled`, `_phasePubEnabled`, `_now`, `_sleep`). The six new seams extend that list in
  place; no new injection mechanism is introduced.
- **`parseVerdict(result, skillName)`** in `orchestrate-dev.js` — its `VALID_VERDICTS` array, its
  reverse-scan (`const reversed = lines.slice().reverse()`), and its `malformed: true` fallback are
  reused verbatim for the persisted verdict record (§5.1). One grammar family, three carriers
  (FSPEC §2.3).
- **`reviewerRoleSlug(skill)`'s `MAP`** — `{"se-review": "software-engineer", "pm-review":
  "product-manager", "te-review": "test-engineer"}` — is the single source of the role-slug
  catalogue G-2 (§5.2). The filename grammar derives its role alternation from that map, so a new
  reviewer role cannot desynchronise the two.

Deliberately **not** reused: `listAllFiles(root)` / `WALK_SKIP_DIRS` from `document-oracles.mjs`.
FSPEC §3.4 states the reason (it is a Node-only recursive walker with no seam and a skip-list tuned
for a different job). The two listing paths instead share one error contract — the `ListFailure`
catalogue of §4.2 — so a "cannot judge" failure means the same thing on both sides (DC-11).

## 2. Architecture

### 2.1 Technology stack — nothing new

No new runtime dependency, no new package, no new build step. The change is confined to the existing
ES-module sources under `pdlc/workflows/`, their existing jest suite (`cd pdlc/workflows && npm
test`), and the existing generator `build-runtime.mjs`. This is deliberate: C-2 forbids `import` in
the bundle, so a new dependency could not reach the runtime at all — anything a bundle needs must be
either inlined pure JS or an injected seam.

### 2.2 Module layout — one file, not a new package

Every new pure function specified in §5 lands **in `pdlc/workflows/orchestrate-dev.js`**, as a
module-level `export function` beside the existing `parseVerdict` / `checkFileNonEmpty` /
`parseDecisionsWarranted` family. No new source file is created under `pdlc/workflows/`.

The reason is structural, not stylistic. `build-runtime.mjs`'s `wrapModule(varName, body,
exportedNames, prelude)` inlines **whole files**: the dev bundle is composed from a fixed array
`[DEV_META, BANNER, adapter, devModule, DEV_ENTRY]`, where `devModule` is
`wrapModule("__dev", stripModuleSyntax(devSource), […])`. A new source file would require a new
`wrapModule` invocation, a new entry in both bundle composition arrays, a new `exportedNames` list,
and a new cross-module reference idiom (`__helpers.foo`) that nothing in the tree uses today. The
cost of a fifth module is paid on every future build edit; the benefit — file-length hygiene — is
not one this design needs to buy.

Two exceptions, both forced:

- **`runtime-adapter.js`** gains `rtListFiles`, `rtAppendFile`, `rtGit` and their `rtDevInjections`
  wiring. That file is the adapter; a seam implementation cannot live anywhere else.
- **`orchestrate-queue.js`** gains the `_git` thread-through and the export of its status rewriter
  (§3.6). That is where the queue row is written.

### 2.3 Dependency graph

```
                        ┌──────────────────────────┐
   runtime globals ───► │  runtime-adapter.js      │  (inlined verbatim by the build,
   (agent, parallel,    │  rtAgent … rtGit         │   never imported)
    pipeline, phase,    │  rtDevInjections()       │
    log, setTimeout)    └───────────┬──────────────┘
                                    │ supplies seams
                                    ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  orchestrate-dev.js                                            │
   │                                                                │
   │   main({ reqPath, forcePhases, _listFiles, _writeFile,         │
   │          _appendFile, _git, _recordHalt, …16 existing })       │
   │            │                                                   │
   │            ├─► phase gate       ─► §5.4 approval / §5.5 stale  │
   │            ├─► reviewLoop(…, startIndex)  ─► §5.2 rounds       │
   │            │       └─► dispatchAndVerify  ─► §5.6 pacing       │
   │            └─► checkConverged   ─► §6.3 terminal exit          │
   │                                                                │
   │   pure, seam-free:  sha256Hex, canonicalise, scanLines,        │
   │                     parseReviewFilename, parseVerdict,         │
   │                     parseApprovalHash, parseRevisionComplete,  │
   │                     parseForcePhases, isStale, isComplete      │
   └───────────────────────────┬────────────────────────────────────┘
                               │ __dev.main / row helpers
                               ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  orchestrate-queue.js   updateQueueStatus, rewriteStatus(_git) │
   └────────────────────────────────────────────────────────────────┘
```

The arrow from `orchestrate-queue.js` back up is new. Today the dev bundle does **not** include
`queueModule` at all — `contents: [DEV_META, BANNER, adapter, devModule, DEV_ENTRY]`. §7.2's fourth
build edit adds it, which is what makes `_recordHalt` (§3.5) able to close over the queue's row
helpers rather than reimplementing queue-row parsing inside `orchestrate-dev.js`.

### 2.4 The layering rule

Three strata, and the rule that keeps them honest:

| Stratum | Contents | May call |
|---|---|---|
| **Pure** | every parser, the digest, the scanner, `isStale`, `isComplete`, `updateQueueStatus` | only other pure functions |
| **Seam** | `_listFiles`, `_readFile`, `_writeFile`, `_appendFile`, `_git`, `_recordHalt`, `_agent`, … | the host, via the adapter |
| **Orchestration** | `main`, `reviewLoop`, `dispatchAndVerify`, `checkConverged`, phase gate | both strata above |

**A pure function never performs IO, and an orchestration function never parses.** This is what
makes §8's test strategy cheap: the pure stratum is tested with string inputs and no doubles at all,
the orchestration stratum with sync doubles for every seam. It is also what satisfies C-5 — the
decision logic is entirely in the pure stratum, where no `agent()` call is reachable.

### 2.5 Control flow of one phase entry

The following is the new shape of a `PHASE_DISPATCH` entry's execution, for phases in the
force/skip-eligible set. Steps 1–4 are new; step 5 is today's `reviewLoop` with a corrected starting
index; steps 6–7 are the corrected terminal exit.

```
1.  forcePhases gate           §5.7   phase named in forcePhases?
                                      ├─ yes ─► skip steps 2–4, run from step 5
                                      └─ no  ─► continue
2.  round derivation           §5.2   await _listFiles(`docs/${feature}`)
                                      ├─ ListFailure(dir_missing)  ─► [] ⇒ startIndex 1
                                      ├─ ListFailure(other)        ─► halt "cannot judge"
                                      └─ ok ─► parseReviewFilename over every entry
                                               startIndex = max(presentIndices) + 1  (or 1)
                                               endIndex   = startIndex + MAX_REVIEW_ROUNDS - 1
3.  approval search            §5.4   candidate = highest round index present (single, no walk)
                                      tier 1: the candidate round's per-role CROSS-REVIEW files
                                      tier 2: `## 6. Approval Record` in LEARNINGS-{feature}.md
                                      (tiers are exclusive; at most 2 _readFile per phase entry)
4.  staleness                  §5.5   isStale(recordedHash, await _readFile(docPath))
                                      ├─ FRESH       ─► record "⏭" skip, phase done
                                      ├─ STALE       ─► fall through to step 5
                                      └─ UNEVALUABLE ─► fall through to step 5, note in report
5.  reviewLoop(…, iteration = startIndex)
                                      each round: dispatchAndVerify per author/reviewer episode §5.6
                                      gatePass = isPass(v1) && isPass(v2)   (unchanged)
                                      on pass: append APPROVAL-HASH / REVIEWED-COMMIT   §5.3
6.  checkConverged                    converged ─► done
                                      not      ─► step 7
7.  terminal exit              §6.3   write docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md
                                      await _recordHalt({ feature, status: "halted" })
                                      throw haltError(one of §6.4's two conditional shapes)
```

A POSTMORTEM already on disk is consulted **before** step 1 by `checkPostmortem({ phase, feature })`
(§5.8): an unresolved POSTMORTEM refuses the run for that phase, and refuses it *even under
`forcePhases`* — a force is an override of a recorded approval, not of a recorded failure.

### 2.6 What is deliberately not built

- **No history walk, at either approval tier** (O-8, narrowed at FSPEC v1.5). Approval is one
  hash-equality test against the single highest round present. No descending scan of earlier rounds,
  no `git log` of the document, no reconstruction of past bytes.
- **No agent on the approval path.** `recoverVerdict({ reviewer, rawResult, _agent })` exists and is
  reused nowhere in this design: an agent adjudicating whether a phase may be skipped breaches C-5
  and, worse, fails **open** — a hallucinated "Approved" silently discards a phase.
- **No per-worktree consumer state.** Out of scope; deferred to D-DIST-07 (queue row 6).
- **No caching layer over `_listFiles`.** The read fan-out is already bounded (one `_listFiles` and
  at most two `_readFile` per phase entry, §5.4); a cache would add an invalidation problem in
  exchange for nothing measurable.

## 3. Interfaces

Signatures are normative. A jest double must satisfy the stated shape; the adapter implementation
must satisfy it asynchronously.

### 3.1 `main()` — the composition root

`orchestrate-dev.js`, at the anchor
`export default async function main({ reqPath, _agent: rawAgentFn = agent, … })`. Six parameters are
added to the sixteen that exist today. Nothing existing is renamed or reordered.

```js
export default async function main({
  reqPath,
  forcePhases = null,                          // §5.7 — raw operator string, unparsed
  // …the sixteen existing injections, unchanged…
  _listFiles: listFilesFn = defaultListFiles,  // §3.2
  _writeFile: writeFileFn = defaultWriteFile,  // §3.3
  _appendFile: appendFileFn = defaultAppendFile, // §3.3
  _git: gitFn = defaultGit,                    // §3.4
  _recordHalt: recordHaltFn = defaultRecordHalt, // §3.5
} = {}) {
```

`forcePhases` is data, not a seam: it carries no default implementation and is never called. It
defaults to `null`, which `parseForcePhases` (§5.7) maps to the empty set — absent and empty are the
same thing, so the runtime need not distinguish "not supplied" from "supplied empty".

`export const meta` gains a second `inputs` entry beside the existing `{ name: "reqPath", …,
required: true }`:

```js
{ name: "forcePhases", description: "…", type: "string", required: false }
```

`DEV_META` in `build-runtime.mjs` is **not** edited — it is a separate hand-written literal that
carries `name`, `description`, `whenToUse`, `phases` and no `inputs` array at all. Adding one would
create a second declaration to keep in sync for no benefit; the bundle entrypoint reads `args`
directly (FSPEC §11.2).

### 3.2 `_listFiles(dirPath)` — the listing seam

```js
/**
 * @param {string} dirPath  repo-relative directory path
 * @returns {Promise<{ ok: true, files: string[] } | { ok: false, reason: ListFailure }>}
 *          files: basenames only, not paths; order unspecified; directories excluded
 */
```

- **Never throws.** Every failure is a `{ ok: false, reason }` with `reason` drawn from the closed
  `ListFailure` catalogue of §4.2 (DC-01 receive side, DC-11 one error contract).
- **Basenames, not paths.** `parseReviewFilename` (§5.2) consumes basenames; returning paths would
  force every caller to re-derive the basename and would make the grammar's `^`/`$` anchors wrong.
- **Non-recursive.** The only directory ever listed is `docs/${feature}`; cross-review files are
  flat there. A recursive walk would be a different contract with different failure modes.

**Node default** (jest, and any direct `node` invocation):

```js
export function defaultListFiles(dirPath, { fsMod = fs } = {}) { /* readdirSync withFileTypes */ }
```

It maps `ENOENT` → `{ ok: false, reason: "dir_missing" }`, `ENOTDIR` → `"not_a_directory"`,
`EACCES`/`EPERM` → `"unreadable"`, a non-string or empty `dirPath` → `"bad_argument"`, and any other
error → `"unreadable"`. The `{ fsMod = fs }` second-argument idiom is copied verbatim from the
shipped `export function checkFileNonEmpty(path, { fsMod = fs } = {})` so the two file-touching Node
defaults are tested the same way.

**Adapter implementation:** `rtListFiles`, an `agent()` with Bash, following `rtCheckFile`'s
constrained-output discipline (its prompt literal is
`` `Return ONLY one word: OK, EMPTY, or MISSING.` ``) and `rtMergeWorktree`'s JSON return discipline
(`{"ok":true}` / `{"ok":false,…}`). It returns the same union; the four `ListFailure` values are the
only `reason` strings the prompt permits, and an unrecognised agent response maps to
`{ ok: false, reason: "unreadable" }` rather than throwing.

### 3.3 `_writeFile(path, contents)` and `_appendFile(path, text)`

```js
/** @returns {Promise<void>}  throws on failure */
export function defaultWriteFile(path, contents, { fsMod = fs } = {})
export function defaultAppendFile(path, text, { fsMod = fs } = {})
```

These two are the exception to §3.2's never-throw rule, and deliberately so: a failed write is not a
condition any caller can meaningfully continue past, and the existing `defaultReadFile` /
`checkFileNonEmpty` pair already establishes throw-on-IO-failure as this module's idiom. Callers
wrap them where FSPEC prescribes a specific halt (§6.2).

`_appendFile` is **append-shaped and never a whole-file rewrite** (FSPEC §7.4). This matters for the
approval-hash record: a read-modify-write would re-emit the reviewer's prose, and any divergence
between what was read and what was written would silently rewrite a cross-review file. The Node
default uses `appendFileSync`, and the adapter's `rtAppendFile` prompt instructs the agent to append
and nothing else — it must not be implemented as `rtWriteFile(path, existing + text)`.

**`_writeFile`'s adapter implementation already exists.** `runtime-adapter.js` defines
`async function rtWriteFile(path, contents)` (prompt literal
`` `replacing the file's current contents exactly` ``) but `rtDevInjections(devModule)` does not
include it — today it returns exactly `_agent, _parallel, _pipeline, _phase, _log, _checkFile,
_readFile, _checkCi, _mergeWorktree`. Adding `_writeFile: rtWriteFile` to that object is the entire
adapter change for this seam. `rtAppendFile` is new.

### 3.4 `_git(argv)` — the transport seam

```js
/**
 * @param {string[]} argv  git arguments, NOT including the leading "git"
 * @returns {Promise<{ ok: boolean, stdout: string, stderr: string }>}   never throws
 */
export function defaultGit(argv, { execFn } = {})
```

The caller branches on `ok`; the seam interprets nothing. The `{ execFn }` injection point mirrors
the shipped `export async function mergeWorktree(repoPath, worktreeBranch, targetBranch, { execFn }
= {})`, which resolves `child_process`'s `execSync` the same way.

**Argv, not a string.** A single command string would require quoting rules at the seam boundary and
would make a feature name containing a space a shell-injection surface. `argv` has no quoting rules.

**`_mergeWorktree` is not folded into `_git`, and `_git` does not replace it.** FSPEC §1.4 states the
disposition in full; the operative distinction is that `_mergeWorktree` is a **task** seam (one named
operation returning a domain record `{ ok, conflictingFiles }`) and `_git` is a **transport** seam
(arbitrary argv, all interpretation in the script). Re-expressing the merge through `_git` would move
conflict parsing out of the adapter and into `orchestrate-dev.js`, and would give callers a second,
looser way to invoke a merge. The two do not answer a shared question, so DC-11's one-contract rule is
not engaged.

**Adapter implementation:** `rtGit`, an `agent()` with Bash returning the `{ ok, stdout, stderr }`
JSON, modelled on `rtMergeWorktree` (prompt literal `` `Run: git merge --no-ff ${worktreeBranch}` ``).

### 3.5 `_recordHalt({ feature, status })` — the queue-row seam

```js
/**
 * @param {{ feature: string, status: string }} arg
 * @returns {Promise<{ queueRow: "written" | "none" | "failed", detail?: string }>}
 */
export async function defaultRecordHalt(/* { feature, status } */) {
  return { queueRow: "none" };
}
```

The default is a **no-op that reports `"none"`** — a unit test, or a direct invocation in a repo with
no queue, has no row to write and must not fail for it.

This seam exists to preserve the dependency direction. Row location and row writing stay in
`orchestrate-queue.js`; `orchestrate-dev.js` never learns the queue's table grammar. Three callers
supply it:

| Caller | What it supplies |
|---|---|
| `orchestrate-queue`'s `_runPipeline` | a closure over the queue path and its own `rewriteStatus`, so a halt in the delegated run is written and committed by the one function that owns status writes (§6.5) |
| the dev bundle's `DEV_ENTRY` (direct invocation) | a closure the bundle builds over `__queue`'s row helpers — reachable only after §7.2's four `build-runtime.mjs` edits |
| jest, or a repo with no queue | the default no-op |

Row location on the halt path is three steps: resolve `DEFAULT_QUEUE_PATH`
(`"docs/_queue/QUEUE.md"`, already exported from `orchestrate-queue.js`); `await _readFile(queuePath)`
— `null` ⇒ the no-row case; exact match on the `Feature` column, the same match `updateQueueStatus`
performs — not found ⇒ the no-row case. No new input is added for the queue path: a direct invocation
wanting a different queue would be using the queue driver.

### 3.6 `orchestrate-queue.js` changes

| Symbol | Change |
|---|---|
| `export function updateQueueStatus(markdown, feature, newStatus)` | return shape becomes `{ markdown, matched }` (§4.6), replacing today's `return markdown; // feature row not found` — the caller can no longer confuse "row updated" with "no such row" |
| `async function rewriteStatus(queuePath, feature, status, readFileFn, writeFileFn)` | **exported**, gains a `_git` parameter, and gains the commit of §6.5 after the write |
| `export default async function main({ … })` | parameter list gains `_git` so the seam threads down to `rewriteStatus` |
| `async function runPicked({ … })` | its three status writes — the `"in-progress"` write, the `"halted"` rewrite, and the `const newStatus = succeeded ? "awaiting-merge" : "halted";` rewrite — all route through the committing `rewriteStatus` |

`rewriteStatus` is non-exported today; the bundle cannot publish what the module does not export
(`stripModuleSyntax` rewrites `export function` to `function` and `wrapModule` re-publishes only the
names in its `exportedNames` list). Exporting it is therefore load-bearing, not cosmetic.

### 3.7 Pure functions — new, all in `orchestrate-dev.js`, all exported

Every one is synchronous, total, and takes no seam. Algorithms are in §5; this is the contract.

```js
// ── scanning ────────────────────────────────────────────────────────────────
export function scanLines(text, visit)
//   The one fenced-region-aware line scanner (§5.0). `visit(line, index)` is
//   called only for lines OUTSIDE a fenced code region. Returns undefined.
//   Callers: parseVerdict-on-file, parseApprovalHash, parseRevisionComplete,
//            parseResolvedMarker, isComplete's heading scan.

// ── digest (§5.3) ───────────────────────────────────────────────────────────
export function canonicaliseForDigest(text)   // N-1 line endings, N-2 one trailing \n
export function utf8Bytes(text)               // hand-rolled, no TextEncoder
export function sha256Hex(text)               // 64 lowercase hex; canonicalises internally
export function approvalHashOf(text)          // `sha256:${sha256Hex(text)}`

// ── parsers (§5.1, §5.2, §5.4, §5.7, §5.8) ──────────────────────────────────
export function parseReviewFilename(basename)
//   → { ok: true, role, docType, round } | { ok: false, reason: FilenameFailure }
export function parseApprovalHash(fileText)
//   → { ok: true, hash, reviewedCommit } | { ok: false, reason: HashFailure }
export function parseRevisionComplete(response)
//   → { complete: true } | { complete: false, reason: TrailerFailure }
export function parseForcePhases(raw)
//   → { ok: true, phases: Set<string> } | { ok: false, badTokens: string[] }
export function parseResolvedMarker(fileText)
//   → { ok: true, resolved: boolean } | { ok: false, reason }
export function extractRecommendation(fileText)   // §5.8; 4000-byte truncation

// ── judgements (§5.5, §5.9) ─────────────────────────────────────────────────
export function isStale(recordedHash, documentBytes)
//   → "UNEVALUABLE" | "STALE" | "FRESH"
export function isComplete(artifactClass, docType, fileText)
//   → { complete: true } | { complete: false, missing: string[] }

// ── round derivation (§5.2) ─────────────────────────────────────────────────
export function deriveRoundWindow(basenames, docType)
//   → { ok: true, startIndex, endIndex, present: Map<role, number[]> }
//   | { ok: false, reason: "malformed_round_one_duplicate", role }
```

`sha256Hex` is **not a seam**, and this is a deliberate design decision rather than an oversight. A
seam exists to reach a capability the runtime lacks; a seam's cost is an async boundary, an adapter
implementation, a jest double, and an `await` that can be forgotten. A SHA-256 over an in-memory
string needs none of those — it is deterministic, synchronous and dependency-free once written in
pure JS, which C-2 forces anyway because there is no `crypto`. Making it a seam would introduce an
awaitable call on the hot path of every approval comparison for no capability gained, and would let a
test double return a hash the production code never computes.

### 3.8 `dispatchAndVerify({ episode, prompt })` — the pacing wrapper

```js
/**
 * @param {{ episode: EpisodeKey, prompt: string, model?: string }} arg
 * @returns {Promise<{ ok: true, response: string }
 *                  | { ok: false, reason: "no_progress" | "dispatch_budget"
 *                                       | "trailer" , detail: string }>}
 */
async function dispatchAndVerify({ episode, prompt, model = MODEL_DEFAULT })
```

Non-exported at module level but reachable from `reviewLoop`'s and the phase gate's scope; it closes
over `_agent`, `_readFile`, `_checkFile` and the counters. `EpisodeKey` is §4.5's five-coordinate
record. It implements FSPEC §15's **terminal-first-then-progress** ordering: the trailer verdict is
evaluated before the progress predicate, so an author that declared completion is never re-dispatched
merely because its last write produced no byte change.

### 3.9 Changed existing signatures

| Symbol | Change |
|---|---|
| `export async function reviewLoop({ doc, phase, reviewers, optimizer, feature, iteration = 1, _agent, _parallel, _checkFile })` | the `iteration = 1` default stays (it is the correct value for a virgin branch), but **all seven existing call sites now pass the branch-derived `startIndex`**; the gate `if (iteration > 5)` becomes `if (iteration > endIndex)`; the return shape gains `postmortemWritten` |
| `function checkConverged(loopResult, phaseId, phaseLabel, recordPhase)` | gains `feature` so its `postmortemPath` template can interpolate; the dead `` const postmortemPath = `docs/{feature}/POSTMORTEM-${phaseId}-{feature}.md` `` becomes `` `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md` `` and is **read**; the literal `5`s become `MAX_REVIEW_ROUNDS` / `startIndex..endIndex` per §7.1; the unconditional `POSTMORTEM written.` becomes §6.4's two conditional shapes |
| `function buildFinalReport({ feature, outcome, phases, artifactPaths, testSummary, harvestStatus, prUrl, ciStatus, haltReason })` | gains `haltPhase`, `postmortemPath`, `postmortemStatus`, `queueRow`, plus the skip / force / pacing-proxy report lines |
| `function reviewerRoleSlug(skill)` | unchanged, but gains a **reverse accessor** `function reviewerSkillForSlug(slug)` over the same `MAP`, so the filename grammar's role alternation and the dispatch table cannot desynchronise |
| `function reviewerPrompt(doc, phase, feature, iteration, reviewer)` and `function optimizerPrompt(doc, phase, feature, iteration, reviewers = [])` | the `{DOC-TYPE}` literals — including inside `` `docs/${feature}/CROSS-REVIEW-${role}-{DOC-TYPE}-v${iteration}.md` `` — are substituted with the real document type, so the prompt names the concrete path the script will later parse |
| `export function parseVerdict(result, skillName)` | **unchanged**, reused as-is against file text, with §5.1's duplicate pre-count in front of it |
| `export async function recoverVerdict({ reviewer, rawResult, _agent = agent })` | **unchanged and not reused** on the approval path (C-5; it would fail open) |

### 3.10 Adapter wiring — `rtDevInjections`

The post-change return object, in the order the existing one uses:

```js
function rtDevInjections(devModule) {
  return {
    _agent: rtAgent, _parallel: rtParallel, _pipeline: rtPipeline,
    _phase: rtPhase, _log: rtLog, _checkFile: rtCheckFile,
    _readFile: rtReadFile, _checkCi: rtMakeCheckCi(devModule),
    _mergeWorktree: rtMergeWorktree,
    _writeFile: rtWriteFile,     // existed; was never wired
    _appendFile: rtAppendFile,   // new
    _listFiles: rtListFiles,     // new
    _git: rtGit,                 // new
  };
}
```

`_recordHalt` is **not** in `rtDevInjections`. It is supplied per entrypoint — `QUEUE_ENTRY` closes
over the queue's own `rewriteStatus`, `DEV_ENTRY` closes over `__queue`'s row helpers — because its
implementation differs by caller, which is exactly what `rtDevInjections`, a caller-independent
bundle of adapters, cannot express. AT-64 (§8.5) derives its expected seam set from `main()`'s
parameter list rather than a hand-written list, and must therefore account for `_recordHalt`'s
per-entrypoint supply rather than asserting it appears in `rtDevInjections`.

## 4. Data Model

## 5. Algorithms

## 6. Error Handling

## 7. Build and Distribution

## 8. Test Strategy

## 9. Traceability

## 10. Open Questions
