---
feature: pdlc-review-loop-hardening
---

# FSPEC — pdlc-review-loop-hardening

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-review-loop-hardening.md` (v1.5, converged — SE-v5 and TE-v5 dispositioned) → **FSPEC** |
| Downstream | `TSPEC-pdlc-review-loop-hardening.md`, `PLAN-…`, `PROPERTIES-…` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC[-v{N}].md` (none yet at authoring time) |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` |
| Citation baseline | **HEAD `0655387`.** Every code citation in this document was re-measured at that sha and names its **enclosing symbol plus a distinctive literal**, per O-16 and the REQ's own `Citation baseline` convention. A bare `file:line` citation is a defect in this document. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-07-29 |

## 1. Scope, conventions, and citation baseline

### 1.1 What this document is for

The REQ fixes **observable behaviour** for four harness defects (§H-1 wrong iteration index, §H-2
non-terminal non-convergence, §H-3 unsurvivable monolithic authoring, §H-4 no approved-phase skip).
It also hands this document an enumerated set of downstream obligations in its §8 table. This FSPEC
discharges **every row of REQ §8 whose "Lands in" column names FSPEC**: O-1, O-2, O-3, O-4, O-5,
O-6, O-7, O-8, O-9, O-16, O-17, O-18, O-19 (the placement half; the oracle half is TSPEC's), O-20,
O-21.

It specifies **behaviour, grammar, decision branches and error paths**. It does not choose data
structures, function signatures, file layout inside `pdlc/workflows/`, or test mechanics — those are
TSPEC's. Where the REQ already fixed something at REQ altitude, this document **carries it through
and cites the clause** rather than re-deciding it.

### 1.2 Reading rules this document binds itself to

1. **No re-litigation.** A clause marked in the REQ as fixed at REQ altitude is reproduced with its
   AC reference and is not widened. Where the REQ *retracted* an earlier rule (there are 20+ such
   markers, each written `*(v1.N, … retracted / withdrawn …)*`), this document specifies the
   **surviving** rule only, and names the retraction where a reader might otherwise expect the old
   one. §21 lists every retraction this document depends on.
2. **Deferrals are out of scope.** D-RLH-01 (cross-phase resume), D-RLH-02 (adaptive round budget),
   D-RLH-03 (progress heartbeats), D-RLH-04 (observing the runtime's own retry count) and D-RLH-05
   (bounding a stall-killed *code* dispatch) are named where they bound a gap and are **not**
   specified.
3. **Closed catalogues, total parsers (DC-01).** Every string this feature adds that crosses the
   script ↔ skill or script ↔ operator boundary is specified as a closed catalogue on the emit side
   and a total function on the receive side — absent, duplicated, malformed and truncated inputs all
   have a stated outcome and a stated log signal.
4. **Fail closed, uniformly.** Wherever a machine-readable field cannot be read, the behaviour is
   *more* work, never less: the phase runs, the episode does not reach terminal, the approval is not
   granted. AC-4.2a is the governing clause and the direction never varies.

### 1.3 Constraints carried down from REQ §4

| # | Constraint | How this FSPEC respects it |
|---|---|---|
| C-1 | The 180,000 ms stall kill and the runtime's six retries are neither ours nor observable | Nothing here reads a runtime attempt counter. Every count is script-owned (§15), every "is this a retry" question is answered from disk (§15.3), and the pacing bound is stated as agent-directed with the commit-diff proxy as its only observable evidence (§15.6). |
| C-2 | Bundles allow `export const meta` first and a pure literal, no other `export`, no `import` / `process` / `fs` / `fetch` | Every new capability arrives through an **injected seam** on `main()`'s parameter list, defaulted to a Node implementation for jest and supplied by `pdlc/workflows/runtime-adapter.js` in the bundle. Every injected call is `await`ed (§3.5). The digest is **inlined pure JS** with no host primitive (§7.2). |
| C-3 | Self-modification — pipeline changes ship between queue iterations | No FSPEC clause requires the pipeline to be running to land the change; `cd pdlc/workflows && npm test` is the gate. |
| C-4 | Backwards compatibility on a clean branch | §18 row E-01 states the clean-branch behaviour explicitly for each mechanism: empty listing ⇒ index 1; no POSTMORTEM ⇒ no refusal; no verdict field ⇒ no skip. Observable behaviour on a fresh branch is unchanged. |
| C-5 | No agent in a decision loop a script can make | Index derivation, filename parsing, verdict parsing, hash computation, hash comparison, POSTMORTEM detection and completeness measurement are all script-computed. Two things are *not* script-decidable and the REQ says so: "does any finding remain unreflected" (§8, agent-emitted trailer, §4a A-9) and "is this document's prose complete" beyond its structural criterion. Byte **transport** is an `agent()` call because in this runtime every read is (§4a A-1/A-11); that is transport, not a decision. |

### 1.4 The four seams this feature adds

Everything specified below reaches the runtime through exactly four new injected parameters on
`orchestrate-dev.js`'s `main()`, joining the nine that exist today (`_agent`, `_parallel`, `_log`,
`_checkFile`, `_readFile`, `_phase`, `_pipeline`, `_mergeWorktree`, `_checkCi` — the parameter list
of `export default async function main({ reqPath, _agent: rawAgentFn = agent, … })`).

| Seam | Contract | Node default (jest) | Adapter implementation (bundle) |
|---|---|---|---|
| `_listFiles(dirPath)` | `Promise<{ ok: true, files: string[] } \| { ok: false, reason: ListFailure }>` — see §3.2 | `fs.readdirSync` wrapper | `rtListFiles`, an `agent()` with Bash (§3.5) |
| `_writeFile(path, contents)` | `Promise<void>`; throws on failure | `fs.writeFileSync` wrapper | `rtWriteFile` — **already exists** in the adapter (`async function rtWriteFile(path, contents)`, whose prompt literal is `` `replacing the file's current contents exactly` ``) but is **not** in `rtDevInjections`; it is only wired into the queue bundle's entrypoint (`build-runtime.mjs`, `QUEUE_ENTRY`, the `_writeFile: rtWriteFile,` line). Adding it to `rtDevInjections(devModule)` is the whole change. |
| `_appendFile(path, text)` | `Promise<void>`; append-shaped, never a whole-file rewrite (§7.4) | `fs.appendFileSync` wrapper | `rtAppendFile`, an `agent()` instructed to append and nothing else |
| `_git(argv)` | `Promise<{ ok: boolean, stdout: string, stderr: string }>` — no throw; the caller branches on `ok` | `child_process` wrapper | `rtGit`, an `agent()` with Bash, following the existing `rtMergeWorktree` pattern (its prompt literal `` `Run: git merge --no-ff ${worktreeBranch}` `` and its `{"ok":true}` / `{"ok":false,…}` JSON return contract) |

**Why `_git` and not more `agent()` prose.** `orchestrate-dev.js` performs **zero** git operations
today, and `orchestrate-queue.js` performs zero as well — its status writes go through
`rewriteStatus(queuePath, feature, status, readFileFn, writeFileFn)`, which only re-reads and
re-writes the file (`const current = (await readFileFn(queuePath)) ?? "";`). O-4 needs a *commit*,
so a git capability must exist. Making it a narrow, JSON-returning seam rather than free prose in a
skill prompt is what keeps the decision (did the commit succeed? is the tree dirty?) inside the
script, per C-5.

**Await discipline (C-2).** All four seams are async in the adapter and sync in the jest doubles, so
**every call site awaits**. This is the single most repeated defect class in this repo's workflow
history; §19 AT-19 asserts it at bundle level.

## 2. FSPEC catalogue and obligation map

### 2.1 Catalogue

| FSPEC ID | Section | Behaviour specified | Linked REQ ACs | REQ §8 rows discharged |
|---|---|---|---|---|
| `FSPEC-DISC-01` | §3 | Listing the feature directory to discover review artifacts | AC-1.1, AC-1.1a, AC-2.3, AC-4.2 | O-1 |
| `FSPEC-NAME-01` | §4 | Cross-review filename grammar; round-index derivation; overwrite refusal | AC-1.1, AC-1.1a, AC-1.2–AC-1.6c | O-2 |
| `FSPEC-ROUND-01` | §5 | Pairing two roles at one round index; the role-asymmetric branch | AC-4.1, AC-4.1a | O-18 |
| `FSPEC-VERDICT-01` | §6 | The persisted verdict field in the cross-review file, and the review-SKILL amendment | AC-4.2, AC-4.2a, AC-4.3 | O-17 (verdict half) |
| `FSPEC-DIGEST-01` | §7 | The inlined digest, canonicalisation, capture point, and hash/sha append ordering | AC-4.2d, §4a A-11 | O-17 (hash half) |
| `FSPEC-TRAILER-01` | §8 | The revision-completion trailer grammar and the author-SKILL amendment | AC-3.5b, AC-3.5g clause 4, AC-3.5e | O-17 (trailer half) |
| `FSPEC-APPROVAL-01` | §9 | The tier-2 approval record in `LEARNINGS-{feature}.md` and harvest's copy-not-recompute derivation | AC-4.2b, AC-4.2c, AC-4.2d | O-21 |
| `FSPEC-STALE-01` | §10 | The one staleness comparison used at both tiers | AC-4.4, AC-4.2d | O-8 |
| `FSPEC-FORCE-01` | §11 | The operator force-run surface and its precedence | AC-4.5, AC-4.6, AC-4.6a | O-9 |
| `FSPEC-PMORT-01` | §12 | The POSTMORTEM resolution marker and Recommendation extraction | AC-2.2–AC-2.5 | O-3 |
| `FSPEC-QUEUE-01` | §13 | Setting **and committing** the `halted` row | AC-2.1, AC-2.6, AC-3.5f | O-4 |
| `FSPEC-ROWLOC-01` | §14 | How a direct `orchestrate-dev` invocation locates its queue row | AC-2.1, AC-2.6a, AC-2.7a | O-5 |
| `FSPEC-PACE-01` | §15 | Incremental authoring, the resume prompt, the dispatch-and-verify wrapper, constant placement, commit cadence and the commit-diff proxy | AC-3.1–AC-3.6 | O-6, O-19 (placement), O-20 |
| `FSPEC-COMPLETE-01` | §16 | Structural completeness per wrapped artifact class | AC-3.4, AC-3.5 scope (c) | O-7 |
| `FSPEC-CONST-01` | §17 | AC-5.1/AC-5.2 as concrete, symbol-anchored edits; the SKILL doc edits | AC-5.1–AC-5.5 | O-16 |

### 2.2 Obligation map — every REQ §8 FSPEC row, and where it is discharged

| O-row | Discharged in | One-line disposition |
|---|---|---|
| O-1 | §3 (all) | New `_listFiles` seam; `document-oracles.mjs`'s `listAllFiles(root)` is **not** reused (§3.4 states why); one shared `ListFailure` catalogue pins the error contract across both (§3.3, DC-11). |
| O-2 | §4.1–§4.3 | Full grammar with the un-suffixed form as index 1; role slugs taken from `reviewerRoleSlug`'s `MAP`; document-type token enumerated; a total reject rule. |
| O-3 | §12 | `Resolution:` marker in the POSTMORTEM's own front block; `## Recommendation` heading-to-next-heading extraction. |
| O-4 | §13 | `orchestrate-dev` owns the write via `_writeFile` + `_git`; message form fixed; dirty-tree and commit-failure branches specified. |
| O-5 | §14 | `orchestrate-dev` reads `docs/_queue/QUEUE.md` through `_readFile`, matches the Feature column; absent row ⇒ `queueRow: "none"`, no write attempted. |
| O-6 | §15.3 | Resume prompt contract: how retry-ness is derived from disk, and how the first unwritten section is named. |
| O-7 | §16 | Terminal completeness criteria for the six spec document types plus the three review/learnings classes; the two REQ-fixed ones carried through; the LEARNINGS exclusion stated. |
| O-8 | §10 | One hash-equality comparison at both tiers; **no history walk designed at either tier**; read-at-comparison-time rule, both-tiers-disagree, no-parseable-hash, and the rebase-invariance argument. |
| O-9 | §11 | `forcePhases` in the workflow's `args` object plus `meta.inputs`; precedence stated against AC-2.3 and AC-4. |
| O-16 | §17 | Six concrete edits, each cited by enclosing symbol + distinctive literal at HEAD `0655387`. |
| O-17 | §6, §7, §8 | Verdict field grammar and SKILL amendment (§6); digest mechanism, canonicalisation, single-implementation rule, write ordering, failed-append behaviour, reviewed document's commit sha (§7); revision-completion trailer grammar and author-SKILL amendment (§8). One grammar family, three carriers. |
| O-18 | §5 | Round pairing from the parsed listing; a role's absent `-vN` is not approving; no cross-tier completion. |
| O-19 | §15.7 | Placement decision for all three constants, plus the commit-diff proxy statement and the explicit "no oracle for emitted bytes exists" claim. Oracles are TSPEC's. |
| O-20 | §15.5, §15.6 | Commit message form, staging scope, mid-document commit failure, and the advisory commit-diff proxy. |
| O-21 | §9 | Table placement in LEARNINGS, syntax, copy-not-recompute derivation, canonicalisation over AC-4.2d's bytes only, unavailable-hash marker, and the guard-ordering falsifier. |

### 2.3 Grammar family — one catalogue, three carriers

O-17 requires one grammar family. This document fixes it as: **a single-line, uppercase,
colon-delimited key with a value drawn from a closed catalogue, optionally followed by exactly one
line of JSON.** Three carriers use it, and no fourth is introduced.

| Carrier | Key | Value catalogue | Where it lives | Written by | §|
|---|---|---|---|---|---|
| Persisted verdict | `VERDICT:` | `Approved` \| `Approved with minor changes` \| `Needs revision` | in the `CROSS-REVIEW-*` file body | the reviewer agent | §6 |
| Approval anchor | `APPROVAL-HASH:` and `REVIEWED-COMMIT:` | a 40-hex digest / a 40-hex sha or `unavailable` | appended to the `CROSS-REVIEW-*` file | the **script** | §7 |
| Revision completion | `REVISION-COMPLETE:` | `yes` \| `no` | last line of the **author agent's response** | the author agent | §8 |

The catalogue for `VERDICT:` is the same closed set `parseVerdict`'s `VALID_VERDICTS` array already
holds (`const VALID_VERDICTS = ["Approved", "Approved with minor changes", "Needs revision"];`), so
AC-4.3's "closed to exactly the three values the review SKILLs emit" is satisfied by construction and
by reuse, not by a second list. The three parsers share one shape and one failure direction: **absent,
duplicated, or non-catalogue ⇒ the fail-closed outcome for that carrier** (phase runs / no approval /
not terminal).

## 3. FSPEC-DISC-01 — Review-artifact discovery seam

**Linked requirements:** AC-1.1, AC-1.1a, AC-1.4a, AC-2.3, AC-4.2, AC-4.2b, C-2, C-5. **Discharges
O-1.**

### 3.1 The problem, restated at HEAD

`orchestrate-dev.js` has **no directory-listing capability of any kind**. Verified at HEAD
`0655387`: the module's only filesystem entry points are `checkFileNonEmpty(path, { fsMod = fs })`
(existence + non-empty) and `defaultReadFile(path)` (whose body is `return fs.readFileSync(path,
"utf8");` inside a try/catch returning `null`), and the injected surface `main()` exposes is
`_checkFile` / `_readFile`. There is no `readdir`, no glob, and the runtime supplies no `fs` at all
(§4a A-1). So every clause that needs to know *which* review artifacts exist — AC-1.1's index
derivation, AC-1.1a's un-suffixed detection, AC-1.4a's collision guard, AC-2.3's POSTMORTEM
detection, AC-4.2/AC-4.2b's tier selection, AC-3.5 scope (d) rule 2's "which round still owes an
authoring pass" — is unimplementable until a listing seam exists.

### 3.2 Behavioural contract of `_listFiles`

`_listFiles(dirPath)` is a **single-directory, non-recursive** listing of regular files.

```
_listFiles(dirPath: string)
  → { ok: true,  files: string[] }              // basenames only, no path prefix, no directories
  → { ok: false, reason: ListFailure }          // total; never throws, never returns partial data
```

| Rule | Behaviour | Rationale |
|---|---|---|
| Non-recursive | Only the immediate children of `dirPath` | Every consumer wants exactly `docs/{feature}/`. A recursive walk would pull in nothing the callers use and would make the adapter's agent prompt open-ended. |
| Basenames only | `files` holds `"CROSS-REVIEW-se…-v3.md"`, not `"docs/f/CROSS-REVIEW-…"` | The filename grammar of §4 is defined over basenames; prefixing would force every parse site to strip it, and a stripped-prefix bug is exactly H-1's class of defect. |
| Files only | Directories, symlinks-to-directories and anything not a regular file are omitted | A subdirectory can never be a review artifact; including it would make the §4.3 reject rule fire on legitimate structure. |
| Sorted, deterministic | `files` is returned in ascending byte order | So every derived report (§4.4's log line, §18's error text) is stable across runs, which is a precondition for the TSPEC's oracles. |
| Total | No throw on any input, including `null`, `""` and a path that is a file rather than a directory | DC-01's receive-side rule. Callers branch on `ok`, never on an exception. |

### 3.3 `ListFailure` — the one shared error catalogue (DC-11)

O-1 requires that the two listing paths in this repo cannot diverge in their error contract. This
FSPEC pins **one** closed catalogue, and both paths use it.

| `reason` | Meaning | Caller behaviour |
|---|---|---|
| `"dir_missing"` | `dirPath` does not exist | Treated as **an empty directory** by every caller. This is the clean-branch case (C-4): a feature whose `docs/{feature}/` has not been created yet yields index 1, no POSTMORTEM, no tier-1 approval. It is **not** an error surfaced to the operator. |
| `"not_a_directory"` | The path exists but is not a directory | **Cannot judge.** The caller halts with an operator-facing error naming the path. Silently treating it as empty would grant AC-4's skip and AC-1.1's index 1 over a tree the script could not see, which is fail-open in the one direction AC-4.2a forbids. |
| `"unreadable"` | The path exists, is a directory, and could not be enumerated (permissions, IO error, adapter could not produce a parseable answer) | **Cannot judge.** Same halt as above. |
| `"bad_argument"` | `dirPath` is absent, empty, or not a string | **Cannot judge.** Halt; this is a programming error in the caller, and masking it as "empty" would hide it. |

The asymmetry between `dir_missing` (⇒ empty, benign) and the other three (⇒ halt) is the whole
substance of the contract, and it is the answer to O-1's "behaviour when the feature directory does
not exist". It is deliberate and it is the fail-closed direction in both senses: a *missing* directory
genuinely contains no approving artifact, so treating it as empty denies every skip and starts every
index at 1; an *unreadable* directory might contain one, so guessing either way is unsafe and the run
stops instead.

**"Cannot judge" is one halt, with one shape.** Every one of the three judging failures produces the
same operator-facing halt reason shape — `Cannot enumerate {dirPath}: {reason}` — plus the structured
fields of §12.4. No caller invents its own wording, so the catalogue stays closed on the emit side
(DC-01).

### 3.4 Disposition of the existing precedent — `listAllFiles` is **not** reused

O-1 requires an explicit disposition of `pdlc/workflows/lib/document-oracles.mjs`. Measured at HEAD
`0655387`: that module defines `function listAllFiles(root)` — a recursive `readdirSync(dir, {
withFileTypes: true })` walk that skips the entries of `const WALK_SKIP_DIRS = new Set([".git",
"node_modules"]);` and returns POSIX-style paths relative to `root` via `relative(root,
abs).split(sep).join("/")`. It is a pure, root-parameterised oracle of exactly the shape DC-04
mandates.

**Decision: the runtime seam is separate, and `listAllFiles` is left untouched.** Three reasons, in
order of weight:

1. **It is unreachable, not merely inconvenient.** The file is an `.mjs` ES module importing `fs`
   (`readdirSync`) and `path` (`join`, `relative`, `sep`). C-2 forbids `import` in a bundle and §4a
   A-1 measured that no `fs` exists there. Nothing short of rewriting it as injected-IO code makes it
   loadable, and rewriting it that way would break its current consumers, which call it
   synchronously inside pure oracles (`coveredViolations(root)`, `packagingViolations(root)`).
2. **The contracts are genuinely different, not accidentally different.** `listAllFiles` is
   **recursive** and returns **paths relative to a root**; `_listFiles` is **single-directory** and
   returns **basenames**. Forcing one signature to serve both would make each caller do work the
   other does not need, and the direction that loses is the runtime one — the adapter prompt for a
   recursive walk is materially harder to make reliable than one `ls`.
3. **The oracle side has no need of the runtime side.** `listAllFiles` exists to let jest-side
   oracles walk the repo. The pipeline never needs a repo-wide walk.

**What is shared, and it is the part that matters.** DC-11's objection is not to two
implementations; it is to two implementations with **different error contracts**, so a checklist that
calls both cannot report one verdict. That is pinned as follows: `listAllFiles` today has **no**
error contract — a `readdirSync` failure propagates as a thrown `Error`, so a caller cannot tell
"missing" from "unreadable". This FSPEC requires `document-oracles.mjs` to be amended to expose the
**same `ListFailure` catalogue** as its failure vocabulary — a sibling `listAllFilesSafe(root)`
returning `{ ok, files } | { ok: false, reason }` over the same four `reason` values, with
`listAllFiles` retained as the throwing convenience wrapper so existing callers are untouched (C-4).
The four `reason` strings are then defined **once**, in one place, and both paths quote it. Two
implementations, one catalogue, one "cannot judge" verdict — which is exactly what DC-11 asks for and
what the rejected outcome ("two independent implementations with different error contracts") is not.

### 3.5 Adapter implementation

`rtListFiles(dirPath)` follows the established adapter pattern for a capability that needs a shell:
an `agent()` with Bash, a single exact command, and a **closed** reply vocabulary the script parses —
the same shape as `rtCheckFile` (whose prompt literal is `` `Return ONLY one word: OK, EMPTY, or
MISSING.` ``) and `rtMergeWorktree` (which returns `{"ok":true}` / `{"ok":false,"conflictingFiles":…}`
JSON).

| Aspect | Specification |
|---|---|
| Command | One `ls`-class invocation scoped to `dirPath`, listing regular files only, one basename per line, with a distinct sentinel for each `ListFailure` other than `bad_argument` (which the adapter decides itself before calling out, exactly as `rtCheckFile` does for an empty path). |
| Reply vocabulary | Either the file list, or exactly one sentinel token. The adapter maps sentinel → `reason` and never interprets prose; an unrecognised reply maps to `"unreadable"`, i.e. to a halt, not to an empty list. |
| Model | The cheapest rung, matching `const RT_IO_MODEL = "haiku";` — this call does no reasoning. |
| C-5 posture | The agent **transports** the listing; the script decides everything from it (which names conform, what the maximum index is, whether a path would be overwritten). No agent is asked "what is the next round index?". |
| C-2 posture | `async`, so **every** call site awaits. The jest default (`fs.readdirSync` + `statSync`, mapping `ENOENT` → `"dir_missing"`, `ENOTDIR` → `"not_a_directory"`, anything else → `"unreadable"`) is sync-shaped but returns the same record, so the `await` is harmless there and mandatory in the bundle. |

**One listing per phase entry, reused.** A phase entry performs **one** `_listFiles` call for
`docs/{feature}/` and threads the result through every consumer of it in that phase: index
derivation (§4.4), the AC-1.4 collision guard (§4.5), POSTMORTEM detection (§12.2), tier selection
(§6.4), and mode selection (§15.4). This satisfies AC-1.2 ("computed once per round … the same for
every reviewer in that round, and for the author prompt that follows it") structurally rather than by
convention, and it bounds the cost at one cheap agent call per phase. The **only** deliberate
re-listing is the AC-1.4a case (ii) re-check immediately before each reviewer dispatch (§4.5), which
exists precisely to catch a file that appeared *after* the first listing.

## 4. FSPEC-NAME-01 — Cross-review filename grammar and round-index derivation

**Linked requirements:** AC-1.1, AC-1.1a, AC-1.2, AC-1.3, AC-1.4, AC-1.4a, AC-1.5, AC-1.6, AC-1.6a,
AC-1.6b, AC-1.6c. **Discharges O-2.**

### 4.1 The grammar

A conforming cross-review basename is exactly:

```
CROSS-REVIEW-{role}-{doc-type}.md          ⇒ round index 1   (the un-suffixed form)
CROSS-REVIEW-{role}-{doc-type}-v{N}.md     ⇒ round index N   (N a decimal integer ≥ 1)
```

as a total regular grammar over the **basename** returned by `_listFiles` (§3.2):

```
^CROSS-REVIEW-(?<role>[a-z]+(?:-[a-z]+)*)-(?<docType>[A-Z][A-Z_]*)(?:-v(?<n>[1-9][0-9]*))?\.md$
```

Four properties make it unambiguous, and each is a decision this document makes rather than inherits:

| # | Property | Why it is stated |
|---|---|---|
| G-1 | The **role** segment is lowercase-with-hyphens; the **doc-type** segment is uppercase | This is what disambiguates the two hyphen-bearing segments. Without a case rule, `CROSS-REVIEW-software-engineer-REQ.md` is ambiguous — a parser cannot tell where the role ends and the type begins, because both segments may contain hyphens. Every artifact this repo has ever written already obeys it (`software-engineer` / `REQ`), so the rule is descriptive, not new. |
| G-2 | The role must be a member of the **closed slug catalogue** of §4.2 | An unknown role is a non-conforming name (§4.3), not a fourth reviewer. |
| G-3 | `N` has **no leading zeros** and no `+`/whitespace | So `-v01.md` and `-v1.md` cannot both parse to 1 and silently collide. `-v01.md` is non-conforming. |
| G-4 | The suffix group is optional **and there is no other optional part** | `-v{N}` is the only permitted decoration. `CROSS-REVIEW-software-engineer-REQ-v3-final.md`, `…-v3.markdown` and `…-V3.md` are all non-conforming. |

### 4.2 The role slug catalogue

Measured at HEAD `0655387`: `function reviewerRoleSlug(skill)` holds the whole mapping as a literal
object —

```js
const MAP = {
  "se-review": "software-engineer",
  "pm-review": "product-manager",
  "te-review": "test-engineer",
};
```

— and its doc comment already names the filename shape it feeds
(`` `CROSS-REVIEW-{role}-{DOC-TYPE}[-v{N}].md` ``, with the "Returns null for unknown skills so
prompts degrade to the generic glob rather than an invented path" note). The three slugs are
corroborated on the emit side: each review SKILL hard-codes its own slug in its Cross-Review File
Format section — `se-review/SKILL.md` writes
`docs/{feature-name}/CROSS-REVIEW-software-engineer-{DOCUMENT-TYPE}[-v{N}].md`, `pm-review/SKILL.md`
writes `…-product-manager-…`, `te-review/SKILL.md` writes `…-test-engineer-…`.

**Decision: `reviewerRoleSlug` is the single source of truth, and the parser derives its catalogue
from the same map rather than repeating the three strings.** A second copy of the slug list is a
divergence waiting to happen, and a divergence here silently makes one role's artifacts invisible to
index derivation — H-1's failure mode with a new cause. `reviewerRoleSlug` must therefore also gain a
reverse accessor (slug → reviewer skill id) so §5's pairing can go from a filename back to a role
without a second literal.

**`null` is retained and is now load-bearing in a second place.** `reviewerRoleSlug` returning `null`
for an unknown skill is today a prompt-degradation path. It becomes, additionally, the definition of
G-2's rejection: a basename whose role segment has no reverse mapping is non-conforming.

### 4.3 The document-type token, and the total reject rule

The doc-type token is drawn from a closed catalogue: the six spec document types this pipeline
reviews, i.e. `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS`. There is no seventh, and
Phase CR is deliberately absent — AC-4.7 puts Phase CR and Phase DOD out of AC-4's scope, and AC-4.7a
confirms `CODE_REVIEW-{feature}-v{N}.md` is a different artifact family that this grammar does not
cover.

**Reject rule (total).** A basename in the listing is classified as exactly one of:

| Class | Definition | Effect on index derivation | Effect elsewhere |
|---|---|---|---|
| **Conforming** | Matches §4.1 with a catalogued role (G-2) and a catalogued doc-type | Contributes its `N` (or 1 for the un-suffixed form) to the maximum for its (role-agnostic) doc-type | Available to §5 pairing, §6 tier-1 verdict reading |
| **Non-conforming, cross-review-shaped** | Begins `CROSS-REVIEW-` but fails any rule of §4.1–§4.2 | **Skipped** — contributes nothing to the maximum | **Reported**, once, in the phase-entry log line of §4.4, naming the basename and which rule it failed. It is not a halt: a stray file must not be able to stop the pipeline. But it must not be silent either, because a skipped file is precisely what makes a derived index wrong. It also feeds AC-1.4a case (iii) (§4.5). |
| **Unrelated** | Anything else (`REQ-*.md`, `POSTMORTEM-*.md`, `CODE_REVIEW-*.md`, `LEARNINGS-*.md`, editor backups, …) | Skipped | Silently ignored by this mechanism; `POSTMORTEM-*` and `LEARNINGS-*` are consumed by §12 and §9 from the same listing |

The distinction between the second and third classes is what makes the skip observable without making
it noisy. `CROSS-REVIEW-` is a strong enough prefix that a file carrying it and *failing* the grammar
is far more likely to be a mistake than a deliberate unrelated file.

### 4.4 Round-index derivation (AC-1.1, AC-1.1a, AC-1.2, AC-1.6)

Inputs: the one `_listFiles(docs/{feature})` result of §3.5, the feature, and the doc-type for the
phase (from `PHASE_DISPATCH`, which already carries a `creatorOutputPath` per phase).

```
1. Partition the listing per §4.3.
2. Keep the conforming entries whose doc-type equals this phase's doc-type. Roles are NOT filtered:
   AC-1.1 derives the index per (feature, doc-type) ACROSS roles, and §5/O-18 depends on that.
3. presentIndices ← the multiset of their round indices (un-suffixed ⇒ 1).
4. If presentIndices is empty        ⇒ startIndex = 1.
   Else                             ⇒ startIndex = max(presentIndices) + 1.
5. Malformed-duplicate check (AC-1.1a): if, for any single role, BOTH the un-suffixed form and
   `-v1.md` are present for this doc-type ⇒ HALT with an operator-facing error naming both paths.
6. budget    ← MAX_REVIEW_ROUNDS (§17.1, default 5)
   endIndex  ← startIndex + budget - 1
7. Emit the phase-entry log line (below), then run the loop.
```

**Step 5 is a halt, and it is the one AC-1.1a case that is.** Two files claiming index 1 for one role
is an unresolvable ambiguity about which one holds round 1's findings — and §5's pairing, §6's verdict
read and §15.4's mode selection would each silently pick one. AC-1.1a calls it "a malformed duplicate
of index 1: that is an error surfaced to the operator (AC-1.4's class), not a silent choice between
them", and this is the implementation of that sentence. Note the check is **per role**: SE holding
the un-suffixed form while TE holds `-v1.md` is *not* a duplicate — it is two roles at index 1, which
is a normal, pairable round (§5).

**The phase-entry log line (AC-1.6, AC-1.6b).** One line, emitted before the first reviewer dispatch,
carrying the actual numbers for this invocation and nothing inferred:

```
Phase {phaseId}: rounds {startIndex}..{endIndex} (budget {budget}); {k} prior review artifact(s) found[; skipped non-conforming: {names}]
```

This is the surface AC-1.6 asks for ("both the starting index and the budget are stated in the run
log at phase entry") and it is where §4.3's skipped-name report lands.

**Loop terminal condition (AC-1.6a).** The cap is evaluated **relative to the invocation's starting
index**, not against the absolute index. Concretely, `reviewLoop`'s existing gate — `if (iteration >
5) {` at the top of its `while (true)` body — becomes a comparison against `endIndex`, i.e. against
`startIndex + MAX_REVIEW_ROUNDS - 1`. A resumed loop starting at index 14 therefore runs rounds
14–18 and does not trip the cap on entry. This is the behavioural half of AC-5.1's constant
extraction; §17.1 specifies the edit.

**Reported counts (AC-1.6b).** Three artifacts stop reporting the literal `5`:

| Artifact | Today at HEAD `0655387` | After |
|---|---|---|
| POSTMORTEM prompt's mandated section | the prompt literal `` `Include the required sections: Phase, Iterations (5 — limit reached), …` `` | names `startIndex`, `endIndex` (the terminal index actually reached) and `budget` |
| The non-convergence halt | `checkConverged`'s `` haltError(`Phase ${phaseId} did not converge after 5 iterations${reviewerDetail}. POSTMORTEM written.`) `` | names the same three numbers, and §12.3 replaces the unconditional `POSTMORTEM written.` claim |
| The recorded phase row | `recordPhase(phaseId, phaseLabel, "❌", `Non-convergence after 5 iterations${reviewerDetail}`, 5)` | detail and the `iterations` field both carry the real counts |

**AC-1.6c is a consistency statement, not a mechanism.** A fresh budget on re-entry is correct; what
H-2 called a defect was a *silent* fresh budget against an unresolved disagreement. The log line above
makes it non-silent, and §12 refuses re-entry exactly when a POSTMORTEM records that disagreement. No
additional gate is specified here.

### 4.5 The no-overwrite guard (AC-1.4, AC-1.4a) — the script is the enforcing party

Before **each** reviewer dispatch of a round, and after the round's paths have been computed, the
script performs a **deterministic existence check on the exact path it is about to instruct**, via
`_checkFile` (already injected; contract `{ ok: true } | { ok: false, reason: "file_missing" |
"file_empty" }`). No model call, per C-5.

| Check outcome | Meaning | Behaviour |
|---|---|---|
| `{ ok: false, reason: "file_missing" }` | the path is free | dispatch proceeds |
| `{ ok: false, reason: "file_empty" }` | a zero-byte file is squatting the path | **dispatch proceeds.** An empty file carries no review to destroy, and refusing here would let a stray `touch` wedge a phase. The reviewer's write fills it. |
| `{ ok: true }` | a non-empty file already holds this path | **Pipeline-level error surfaced to the operator.** Not a silent overwrite, and not a silent skip. |

AC-1.4's closing clause is respected literally: the agent-facing instruction not to overwrite is
**retained as belt-and-braces**, and prompt text alone does not satisfy the AC — "because that is
exactly H-1's root cause one level down."

**Reachability (AC-1.4a), and why the check is not vacuous.** Because §4.4 always derives `max + 1`,
only three states reach the error, and they are the complete set:

| Case | State | Which check catches it |
|---|---|---|
| (i) | AC-1.1a's malformed duplicate of index 1 | §4.4 step 5, at phase entry — before any dispatch |
| (ii) | A file appearing **between** index derivation and dispatch — a concurrent run, or an agent writing a path it was not instructed to (H-1's *observed* behaviour) | the per-dispatch `_checkFile` above. This is the case that matters and it is the reason the check is per-dispatch rather than once per phase. |
| (iii) | A non-conforming basename that §4.3 skipped but which collides with the derived path | the per-dispatch `_checkFile` above. §4.3's reported-skip line is what makes the collision diagnosable when it fires. |

O-11 (TSPEC) must construct at least one of these for real; case (ii) is the one to construct,
because it is the guard that keeps H-1 from destroying history again. This FSPEC's contribution is
that the guard is **detectable without a real overwrite occurring**: the assertion is over the
refusal record, and the file's bytes are unchanged, so a test can assert both.

### 4.6 Concrete paths in prompts (AC-1.3, AC-1.5)

Every `{DOC-TYPE}` placeholder is substituted by the script before the prompt leaves it. At HEAD
`0655387` three literals emit the placeholder verbatim, all inside prompt builders:

- `reviewerPrompt`'s `priorFile` — the role-known branch
  `` `docs/${feature}/CROSS-REVIEW-${role}-{DOC-TYPE}-v${prev}.md (your reviewer role is "${role}"; …)` ``
  and the role-unknown branch `` `…docs/${feature}/CROSS-REVIEW-{role}-{DOC-TYPE}-v${prev}.md — …` ``;
- `optimizerPrompt`'s per-role path map
  `` .map((role) => `docs/${feature}/CROSS-REVIEW-${role}-{DOC-TYPE}-v${iteration}.md`) ``.

After this change:

| Requirement | Behaviour |
|---|---|
| AC-1.3 | The doc-type token is passed into both prompt builders and substituted. **No unsubstituted placeholder may reach an agent's prompt** — including the role-unknown branch, which must not emit a `{role}` placeholder either: with an unknown reviewer skill it degrades to a *glob describing the doc-type* (`CROSS-REVIEW-*-REQ-v{prev}.md`) rather than to a template. |
| AC-1.5 | For a round index > 1, the back-reference names the file that **actually holds** the previous round for that role and doc-type — taken from the §3.5 listing, not computed as `iteration - 1`. On a resumed loop starting at 14, round 14's back-reference is the highest conforming index below 14 that exists **for that role**, which after a role-asymmetric history (§5.3) may be far below 13. When a role has no prior file at all, the back-reference is omitted and the prompt says so, rather than naming a file that does not exist. |
| AC-1.2 | Both reviewers of a round, and the author prompt that follows, receive the same round index — guaranteed structurally by the one-listing-per-phase-entry rule of §3.5. |

## 5. FSPEC-ROUND-01 — Same-round dual approval and the role-asymmetric branch

**Linked requirements:** AC-4.1, AC-4.1a, AC-4.2a, AC-4.2b (tier rules). **Discharges O-18.**

### 5.1 What "same round index" means operationally

AC-4.1a fixes dual approval at REQ altitude as **both reviewers approving in the same round index**,
matching the existing convergence gate. That gate at HEAD `0655387` is `reviewLoop`'s
`const gatePass = isPass(verdict1.verdict) && isPass(verdict2.verdict);`, evaluated inside one
iteration of the `while (true)` loop, where `function isPass(verdict)` returns
`verdict === "Approved" || verdict === "Approved with minor changes"`. AC-4.3 pins the skip to the
same two forms, "not stricter than the gate that produced the approval, nor looser".

The skip check therefore reconstructs, from artifacts, the same predicate the live gate evaluates from
responses. The reconstruction is:

```
1. From the phase-entry listing (§3.5), take the conforming entries for this doc-type (§4.3).
2. Group them by round index. Within a group, key by role slug (§4.2).
3. For each round index, descending from the highest present:
     a. Require BOTH expected roles for this phase to be present in the group.
     b. Read each present file's persisted verdict field (§6.3).
     c. If both parse as exactly one catalogue value AND both are approving (AC-4.3) ⇒
        this is the approving round. Stop.
     d. Otherwise continue to the next lower round index.
4. If no round satisfies (a)–(c) ⇒ no approval. The phase runs.
```

**"Both expected roles for this phase"** is read from `PHASE_DISPATCH`, which already declares the
pair per phase (Phase R's entry carries `reviewers: ["se-review", "te-review"]`, and each phase's
entry carries its own pair). The expected pair is therefore never guessed and never hard-coded here —
a phase reviewed by `pm-review` + `se-review` pairs those two.

**Descending search, and why.** The highest round is searched first because it is the round whose
findings are most recent; an approval at round N makes any earlier approval irrelevant. The loop
continues downward rather than stopping at the first non-approving round because a resumed history can
legitimately hold a non-approving round *above* an approving one only in one situation — a reviewer
re-reviewed after approval, which AC-4.4's staleness test then governs. Searching downward and letting
§10 deny a stale approval keeps the two questions separate: §5 answers *was there an approving round*,
§10 answers *has the document changed since*.

### 5.2 Non-approval by different rounds is explicit

AC-4.1a's motivating case is routine and must not pair: "round N = SE approved / TE needs revision;
round N+1 = TE approved / SE finds more" ⇒ **the phase runs**. The algorithm produces that outcome
because step 3(c) requires both approving verdicts inside *one* group; approving verdicts drawn from
different groups are never combined. There is no "carry forward an approval" rule, and none may be
added — that would be exactly the looser-than-the-gate reading AC-4.3 forbids.

The logged round of AC-4.1 is the single round index that satisfied step 3(c), and the log names the
two files it read, so an operator can check the derivation without re-deriving it:

```
Phase {phaseId}: skipped — {docType} approved at round {N} by {roleA} ({verdictA}) and {roleB} ({verdictB}); tier {1|2}; hash matched
```

### 5.3 The role-asymmetric branch (O-18's explicit obligation)

AC-1.1 derives the index per (feature, doc-type) **across roles**, which means the two roles' round
histories need not be dense or aligned. O-18 requires this FSPEC to say so rather than leave it
inferable. The concrete shape O-18 names: a branch where SE reached `-v13` while TE wrote only `-v1`
gives a next index of 14 and **no TE file at all for rounds 2–13**.

| Situation at round `N` for this doc-type | Classification | Effect |
|---|---|---|
| Both expected roles present, both approving, both parseable | **Approving round** | §10's staleness test runs; if it passes, the phase is skipped |
| Both present, at least one non-approving | Not approving | Search continues downward |
| Both present, at least one verdict absent / duplicated / non-catalogue | Not approving — AC-4.2a's unparseable case | Search continues downward; the report names the artifact whose verdict could not be read |
| **One role's file for round `N` is missing** | Not approving — the absent role is treated as **not approving** for that round | Search continues downward. A gap can never pair into an approval. |
| Neither role present at `N` (a gap in both) | Not a round at all | Skipped; not reported as an anomaly, since §4.4's derivation tolerates non-contiguous indices by design |

**Fail-closed, and consistent with AC-4.2a.** Treating an absent `-vN` as *not approving* is the same
direction as every other unreadable-evidence case in this feature: the phase runs, at the cost of one
re-review. The rejected alternative — treating an absent file as "no findings from that role, so
implicitly approving" — would grant a skip from the *absence* of evidence, which is the one direction
R-1 and AC-4.2a forbid.

**No cross-tier completion (AC-4.2b, carried through).** Tier 2 is consulted **only** when tier 1 is
absent, meaning **no** `CROSS-REVIEW-*` file for that (feature, doc-type) is present on the branch at
all. A tier 1 that is present but *incomplete* — one role's file for the approving round present, the
other's missing, i.e. exactly the row above — is **not** "absent". Tier 1 governs, the missing role is
not approving, and the pair is **not** completed across tiers. Mixed provenance is never used to
assemble an approval. §6.4 specifies the tier-selection predicate that implements this, and §10.4 the
both-tiers-disagree case.

## 6. FSPEC-VERDICT-01 — The persisted verdict record

## 7. FSPEC-DIGEST-01 — Content digest, hash capture, and write ordering

## 8. FSPEC-TRAILER-01 — The revision-completion trailer

## 9. FSPEC-APPROVAL-01 — The tier-2 approval record in LEARNINGS

## 10. FSPEC-STALE-01 — The staleness comparison

## 11. FSPEC-FORCE-01 — The operator force-run surface

## 12. FSPEC-PMORT-01 — POSTMORTEM resolution marker and Recommendation extraction

## 13. FSPEC-QUEUE-01 — Committing the halted queue row

## 14. FSPEC-ROWLOC-01 — Locating the queue row on a direct invocation

## 15. FSPEC-PACE-01 — Authoring pacing, resume prompt, and commit cadence

## 16. FSPEC-COMPLETE-01 — Structural completeness per wrapped artifact class

## 17. FSPEC-CONST-01 — Constant placement and the AC-5.1 / AC-5.2 edits

## 18. Edge cases and error scenarios

## 19. Acceptance tests

## 20. Open questions

## 21. Obligation discharge and traceability
