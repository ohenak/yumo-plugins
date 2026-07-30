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

## 5. FSPEC-ROUND-01 — Same-round dual approval and the role-asymmetric branch

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
