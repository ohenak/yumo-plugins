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
`orchestrate-dev.js`'s `main()`, joining the **sixteen** that exist today. Corrected at v1.1 (SE-v1
F-05): v1.0 said "the nine that exist today" and listed `_agent`, `_parallel`, `_log`, `_checkFile`,
`_readFile`, `_phase`, `_pipeline`, `_mergeWorktree`, `_checkCi` — that is the count of
`rtDevInjections`'s entries, not of `main()`'s destructured list, which at `0655387` also carries
`_rebaseOntoDefault`, `_dodVerifyLoop`, `_raisePrAndVerifyCi`, `_phaseDodEnabled`, `_phasePubEnabled`,
`_now` and `_sleep` (the list of
`export default async function main({ reqPath, _agent: rawAgentFn = agent, … })`). The subordinate claim
that the list carries **no** `_writeFile` is correct and unchanged.

| Seam | Contract | Node default (jest) | Adapter implementation (bundle) |
|---|---|---|---|
| `_listFiles(dirPath)` | `Promise<{ ok: true, files: string[] } \| { ok: false, reason: ListFailure }>` — see §3.2 | `fs.readdirSync` wrapper | `rtListFiles`, an `agent()` with Bash (§3.5) |
| `_writeFile(path, contents)` | `Promise<void>`; throws on failure | `fs.writeFileSync` wrapper | `rtWriteFile` — **already exists** in the adapter (`async function rtWriteFile(path, contents)`, whose prompt literal is `` `replacing the file's current contents exactly` ``) but is **not** in `rtDevInjections`; it is only wired into the queue bundle's entrypoint (`build-runtime.mjs`, `QUEUE_ENTRY`, the `_writeFile: rtWriteFile,` line). Adding it to `rtDevInjections(devModule)` is the whole change. |
| `_appendFile(path, text)` | `Promise<void>`; append-shaped, never a whole-file rewrite (§7.4) | `fs.appendFileSync` wrapper | `rtAppendFile`, an `agent()` instructed to append and nothing else |
| `_git(argv)` | `Promise<{ ok: boolean, stdout: string, stderr: string }>` — no throw; the caller branches on `ok` | `child_process` wrapper | `rtGit`, an `agent()` with Bash, following the existing `rtMergeWorktree` pattern (its prompt literal `` `Run: git merge --no-ff ${worktreeBranch}` `` and its `{"ok":true}` / `{"ok":false,…}` JSON return contract) |

**Correction (SE-v1 F-03).** v1.0 claimed `orchestrate-dev.js` "performs **zero** git operations today".
That is false at `0655387` and is withdrawn: `export async function mergeWorktree(repoPath,
worktreeBranch, targetBranch, { execFn } = {})` resolves `child_process`'s `execSync` and runs
`git merge --no-ff` followed by `git diff --name-only --diff-filter=U`, and
`export async function rebaseOntoDefault({ feature, … })` dispatches `ship-pr` to rebase. Both are
injected on `main()` (`_mergeWorktree`, `_rebaseOntoDefault`) and `_mergeWorktree` is already in
`rtDevInjections`. The module therefore has a git capability and the adapter already ships a git relay
(`rtMergeWorktree`). `orchestrate-queue.js` does perform zero — its status writes go through
`rewriteStatus(queuePath, feature, status, readFileFn, writeFileFn)`, which only re-reads and re-writes
the file (`const current = (await readFileFn(queuePath)) ?? "";`) — and that is the half of the claim
O-4 actually rests on.

**Disposition of the existing git precedent — `_mergeWorktree` is not folded into `_git`.** The
reinvention check requires this stated, in the shape §3.4 gives `listAllFiles`:

1. **The contracts are different in kind.** `_mergeWorktree` is a **task** seam: one named operation
   (`merge --no-ff`, then enumerate conflicting files) returning a domain-shaped record
   (`{ ok, conflictingFiles }`). `_git(argv)` is a **transport** seam: an arbitrary argv returning
   `{ ok, stdout, stderr }` with every interpretation left to the script. Re-expressing the merge
   through `_git` would push conflict-file parsing from the adapter into `orchestrate-dev.js` and give
   the caller a second, looser way to invoke a merge.
2. **It is C-4-protected.** `mergeWorktree` is exported, unit-tested with an injected `execFn`, and
   already wired into `rtDevInjections`; rewriting it buys nothing this feature needs and risks the one
   git path the pipeline already depends on.
3. **Two seams, one boundary.** What DC-11 objects to is two *error contracts* for one question. There
   is no shared question here: nothing asks "did the merge succeed?" through `_git`, and nothing asks
   "what is HEAD?" through `_mergeWorktree`. The end state is deliberate — a task seam for the one
   pre-existing composite operation, a transport seam for O-4's commit and §7.5's `git log`.

Making `_git` a narrow, JSON-returning seam rather than free prose in a skill prompt is what keeps the
decision (did the commit succeed? is the tree dirty?) inside the script, per C-5.

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
| O-3 | §12 | `RESOLVED: yes|no` marker, positionally unconstrained within the POSTMORTEM, human-written only; `## Recommendation` heading-to-next-heading extraction. |
| O-4 | §13 | `orchestrate-dev` owns the write via `_writeFile` + `_git`; message form fixed; dirty-tree and commit-failure branches specified. |
| O-5 | §14 | `orchestrate-dev` reads `docs/_queue/QUEUE.md` through `_readFile`, matches the Feature column; absent row ⇒ `queueRow: "none"`, no write attempted. |
| O-6 | §15.5 | Resume prompt contract: how retry-ness is derived from disk, and how the first unwritten section is named (by the script, with three definite cases); plus the revision-mode continuation prompt. |
| O-7 | §16 | Terminal completeness criteria for the six spec document types plus the three review/learnings classes; the two REQ-fixed ones carried through; the LEARNINGS exclusion stated. |
| O-8 | §10 | One hash-equality comparison at both tiers; **no history walk designed at either tier**; read-at-comparison-time rule, both-tiers-disagree, no-parseable-hash, and the rebase-invariance argument. |
| O-9 | §11 | `forcePhases` in the workflow's `args` object plus `meta.inputs`; precedence stated against AC-2.3 and AC-4. |
| O-16 | §17 | Six concrete edits, each cited by enclosing symbol + distinctive literal at HEAD `0655387`. |
| O-17 | §6, §7, §8 | Verdict field grammar and SKILL amendment (§6); digest mechanism, canonicalisation, single-implementation rule, write ordering, failed-append behaviour, reviewed document's commit sha (§7); revision-completion trailer grammar and author-SKILL amendment (§8). One grammar family, three carriers. |
| O-18 | §5 | Round pairing from the parsed listing; a role's absent `-vN` is not approving; no cross-tier completion. |
| O-19 | §15.7 | Placement decision for all three constants, plus the commit-diff proxy statement and the explicit "no oracle for emitted bytes exists" claim. Oracles are TSPEC's. |
| O-20 | §15.8 | Commit cadence and message form, the honest rebase cost, the advisory commit-diff proxy (reports, never halts), and the no-git-may-discard-uncommitted-content rule (§15.3). |
| O-21 | §9 | Table placement in LEARNINGS, syntax, copy-not-recompute derivation, canonicalisation over AC-4.2d's bytes only, unavailable-hash marker, and the guard-ordering falsifier. |

### 2.3 Grammar family — one catalogue, three carriers

O-17 requires one grammar family. This document fixes it as: **a single-line, uppercase,
colon-delimited key with a value drawn from a closed catalogue, optionally followed by exactly one
line of JSON.** Three carriers use it, and no fourth is introduced.

| Carrier | Key | Value catalogue | Where it lives | Written by | §|
|---|---|---|---|---|---|
| Persisted verdict | `VERDICT:` | `Approved` \| `Approved with minor changes` \| `Needs revision` | in the `CROSS-REVIEW-*` file body | the reviewer agent | §6 |
| Approval anchor | `APPROVAL-HASH:` and `REVIEWED-COMMIT:` | `sha256:` + 64 lowercase hex / a commit sha or `unavailable` | appended to the `CROSS-REVIEW-*` file | the **script** | §7 |
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

Before each **review episode's first** dispatch for a round, and after the round's paths have been
computed, the script performs a **deterministic existence check on the exact path it is about to
instruct**, via
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

**Scope: the episode's first dispatch, not its re-dispatches (TE-v1 F-02).** v1.0 said "before **each**
reviewer dispatch of a round"; that is withdrawn as written, because it deadlocks the continuation
§16.3/E-57 mandates. A review episode whose first dispatch is stall-killed after writing a **partial**
cross-review is re-dispatched by §15.4 onto that same path; a guard firing there would raise an operator
error on the wrapper's own required behaviour. So:

| Dispatch | Guard |
|---|---|
| The episode's **first** dispatch for `(role, doc-type, round)` | Guard applies — the table above |
| A **re-dispatch inside the same episode** onto the same path (§15.4's progress / no-progress branches) | Guard is **not** re-evaluated. The wrapper knows it owns that path: it instructed it, in this episode, and the episode's terminal test (§16.3) is the check that governs. The continuation prompt of §16.3/E-57 applies — continue the partial file, never rewrite it. |

The property that made the per-dispatch phrasing attractive — catching a file that appeared *after* the
phase-entry listing (case (ii) below) — is preserved, because the appearance can only precede the
episode's first dispatch. A file appearing mid-episode is one the episode itself wrote.

**Reachability (AC-1.4a), and why the check is not vacuous.** Because §4.4 always derives `max + 1`,
only three states reach the error, and they are the complete set of states in which the guard is
evaluated (the intra-episode re-dispatch above is not one, because the guard does not run there):

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
3. Take the SINGLE HIGHEST round index present in any group — the candidate round. No lower
   round index is ever examined.
     a. Require BOTH expected roles for this phase to be present in that group.
     b. Read each present file's persisted verdict field (§6.3).
     c. If both parse as exactly one catalogue value AND both are approving (AC-4.3) ⇒
        this is the approving round.
4. If the candidate round fails any of (a)–(c) ⇒ no approval. The phase runs.
```

**"Both expected roles for this phase"** is read from `PHASE_DISPATCH`, which already declares the
pair per phase (Phase R's entry carries `reviewers: ["se-review", "te-review"]`, and each phase's
entry carries its own pair). The expected pair is therefore never guessed and never hard-coded here —
a phase reviewed by `pm-review` + `se-review` pairs those two.

**The highest round only, and why — retraction in place (TE-v1 F-01, SE-v1 F-06).** v1.0 searched
"for each round index, descending from the highest present … otherwise continue to the next lower round
index", justified by "a resumed history can legitimately hold a non-approving round *above* an approving
one only in one situation — a reviewer re-reviewed after approval, which AC-4.4's staleness test then
governs." **Both sentences are withdrawn.** The justification is false: a round that produced findings
but whose authoring pass never ran leaves the document's bytes *untouched*, so the hash of the lower
approving round still matches and §10 returns `FRESH` — the descending search then skipped the phase and
discarded the completed round's findings silently. That is exactly the loss R-1 and AC-3.5 scope (d)
exist to prevent, arriving through the skip path.

The surviving rule is a **single candidate**: only the highest present round index can grant an
approval. Any higher round — approving, non-approving, half-present or unparseable — denies the skip by
construction, because it *is* the candidate and fails (a)–(c). The two questions stay separate exactly
as before (§5 answers *did the latest round approve*, §10 answers *has the document changed since*), and
the read fan-out is now bounded at **two** `_readFile` calls per phase entry — one per expected role of
one round — independent of branch history length. There is no descent, no read budget to exhaust, and no
history-length term in the phase-entry cost (SE-v1 F-06).

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

All rows below are evaluated on the **candidate** round — the highest present index (§5.1). A round below
it is never examined, so "no approval" is the outcome whenever the candidate fails.

| Situation at the candidate round `N` for this doc-type | Classification | Effect |
|---|---|---|
| Both expected roles present, both approving, both parseable | **Approving round** | §10's staleness test runs; if it passes, the phase is skipped |
| Both present, at least one non-approving | Not approving | **No approval; the phase runs** |
| Both present, at least one verdict absent / duplicated / non-catalogue | Not approving — AC-4.2a's unparseable case | No approval; the phase runs and the report names the artifact whose verdict could not be read |
| **One role's file for round `N` is missing** | Not approving — the absent role is treated as **not approving** for that round | No approval; the phase runs. A gap can never pair into an approval. |
| A lower round `M < N` is dual-approving | **Irrelevant** | Not consulted. A completed round `N` — including one whose findings were never authored into the document — always denies the skip. |

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

**Linked requirements:** AC-4.2, AC-4.2a, AC-4.3, AC-4.7a, R-7. **Discharges the verdict half of
O-17.**

### 6.1 Why the field must exist (§4a A-4, carried through)

Measured at HEAD `0655387`: the machine-readable verdict is a **response** contract, not an artifact
field. All three review SKILLs place the trailer in the agent's response — `se-review/SKILL.md`'s
§VERDICT Trailer instructs appending the two lines "as the last content of your response" — and
`reviewLoop` parses it off the `_agent()` return value through `parseVerdict(result, skillName)`, used
at its `const lastResults = [ { skill: reviewers[0], ...parseVerdict(result1, reviewers[0]) }, … ]`
and at `let verdict1 = parseVerdict(result1, reviewers[0]);`. It is never read off disk. The
cross-review *file* template in each SKILL ends at a free-text `## Recommendation` section whose body
is the prose line `**Approved** / **Approved with minor changes** / **Needs revision**`.

Free-text `## Recommendation` is not parseable as a closed catalogue: it is a template line a reviewer
edits, and this branch's own artifacts prove the response trailer is not reliably persisted either
(§4a A-4 measured one of two v1 files carrying it and one not). AC-4.2 therefore claims the scope of
making the verdict a **persisted, machine-readable field of the artifact**.

### 6.2 Grammar and placement

**Placement: a `## Verdict` section appended as the file's last section, after `## Recommendation`.**

```markdown
## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
```

| Aspect | Specification | Rationale |
|---|---|---|
| Key | The literal `VERDICT: ` at the start of a line, after trimming | Byte-identical to what `parseVerdict` already scans for (its `if (trimmed.startsWith("VERDICT: "))` test), so **one** parser serves both carriers. |
| Value | Exactly one of `Approved`, `Approved with minor changes`, `Needs revision`, case-sensitive | The same closed catalogue as `parseVerdict`'s `VALID_VERDICTS` array. AC-4.3, AC-4.7a. |
| JSON line | The immediately following non-empty line is a JSON object with exactly the keys `high`, `medium`, `low`, all non-negative integers | Identical to `parseVerdict`'s structural validation (`keys.length !== 3 \|\| keys[0] !== "high" \|\| keys[1] !== "low" \|\| keys[2] !== "medium"` and its `Number.isInteger(...) && … >= 0` checks). |
| Position | **Last section of the file**, and written last | AC-3.5 scope (c) makes the field the cross-review class's structural-completeness marker precisely because it is written last; a mid-file field would make a truncated write look complete. §16.3. |
| Scan scope | The **trailing `## Verdict` section only** — from the file's last `## Verdict` heading to EOF. Nothing above that heading is read as a verdict. | TE-v1 F-08. v1.0's "exactly one `VERDICT: ` line **in the file**" is withdrawn: it misclassifies any cross-review that *quotes* the grammar — including a review of this very FSPEC's §6.2, whose fenced block contains `VERDICT: Approved with minor changes` — so the mechanism defeated itself on the reviews of its own feature. §6.2 already fixes placement, so scoping the scan to that section costs nothing and removes the false positive. |
| Uniqueness | Exactly one `VERDICT: ` line **within that section** | Duplication is AC-4.2a's fail-closed case (§6.3). |

**Decision: reuse `parseVerdict` rather than write a second parser.** The function is already total
over `null`, empty, missing-trailer, non-catalogue value, absent JSON (its truncated-output branch
`if (nextNonEmpty === null) return { verdict: rawVerdict, high: 0, medium: 0, low: 0 };`), unparseable
JSON, wrong-keys JSON and negative counts — and it already signals unparseability distinguishably via
`malformed: true`. Feeding it file contents instead of a response string requires **no change to it**.
Two carriers, one parser, one catalogue: this is what O-17's "one grammar family" means in practice,
and it is why the field's syntax is the trailer's syntax rather than a tidier YAML-ish alternative.

### 6.3 Reading it, and the fail-closed branches (AC-4.2a)

The reader is `parseVerdict(section, roleSlug)` — where `section` is the **trailing `## Verdict` section**
of §6.2, not the whole file — plus one additional pre-check the response path does not need. Both the
pre-count and `parseVerdict`'s input are restricted to that section (TE-v1 F-08); a file with **no**
`## Verdict` heading yields an empty section and lands on the "no `VERDICT: ` line" row below.

| Input state | Detection | Outcome |
|---|---|---|
| Exactly one `VERDICT: ` line, catalogue value, valid JSON | `parseVerdict` returns without `malformed` | Verdict available to §5's pairing |
| Exactly one `VERDICT: ` line, catalogue value, **no** following non-empty line | `parseVerdict`'s truncated-output branch | Verdict available; counts read as zero. Accepted: AC-4.3 keys approval on the verdict value, not the counts. |
| **No** `VERDICT: ` line | `parseVerdict` returns the fallback with `malformed: true` | **Not approving.** The phase runs; the report names the artifact. |
| Value not in the catalogue | same | **Not approving.** Phase runs; artifact named. |
| JSON present but malformed / wrong keys / negative | same | **Not approving.** Phase runs; artifact named. |
| **Two or more** `VERDICT: ` lines **inside the trailing `## Verdict` section** | A count of `VERDICT: `-prefixed lines in that section, performed before `parseVerdict` | **Not approving.** Phase runs; artifact named. This pre-check is required because `parseVerdict` scans **from the end** (`const reversed = lines.slice().reverse();`) and would silently take the last one — a silent choice between two verdicts is exactly what AC-4.2a forbids. |

**No verdict-recovery agent on this path.** `reviewLoop`'s response path makes one cheap Haiku
recovery attempt when a trailer is malformed (`recoverVerdict({ reviewer, rawResult, _agent })`, whose
prompt opens `Your previous review response did not end with a machine-readable VERDICT trailer.`).
That recovery is **not** reused here. Recovery re-asks an agent to re-state a verdict it just formed;
asking an agent to re-state a verdict from a file written in some earlier run is asking it to *decide*
one, which is a C-5 violation and a fail-open one. An unparseable persisted field is simply not
approving.

**Legacy artifacts (AC-4.2a, R-7, DC-07).** Every cross-review written before this change lacks the
field, so it lands in the "no `VERDICT: ` line" row: extra review, never a skipped review. No backfill
is specified, and none may be — reconstructing verdicts for artifacts from git history is out of scope
(AC-4.2c).

### 6.4 Tier selection (AC-4.2b, carried through)

| Predicate, evaluated in order | Tier used |
|---|---|
| At least one conforming `CROSS-REVIEW-*` file for this (feature, doc-type) is present in the listing | **Tier 1.** §5's pairing runs over the files; §10 compares the hash from the tier-1 record. Tier 2 is **not** consulted, even when tier 1 is incomplete or unparseable. |
| **No** conforming `CROSS-REVIEW-*` file for this (feature, doc-type) is present, and `LEARNINGS-{feature}.md` is present and holds a parseable approval record (§9) | **Tier 2.** §5's pairing runs over the record's rows; §10 compares the hash from the record. |
| Neither | **No approval.** The phase runs. |

The predicate for "tier 1 absent" is deliberately **presence of any conforming file for that doc-type**,
not "presence of an approving pair". That is what makes §5.3's no-cross-tier-completion rule
mechanical rather than a special case.

### 6.5 Amendment to the three review SKILLs (R-7)

The change is **additive** to each of `pm-review`, `se-review` and `te-review`:

| Edit | Content |
|---|---|
| §Cross-Review File Format — the fenced template | Append a final `## Verdict` section carrying the `VERDICT: <verdict-value>` line and the counts JSON line, in the exact grammar of §6.2, with a note that it is the **last** content of the file and is written after everything else. |
| §VERDICT Trailer — the response contract | Unchanged in substance, and explicitly stated to be **still required**: the reviewer emits the trailer in its response *and* the field in the file. One extra sentence naming the file field, so a reviewer cannot read the section as an either/or. |
| §Approval Rules | Unchanged. The mapping from finding severity to recommendation is not touched (REQ §5 non-goal: "Changing what reviewers assess, or the verdict trailer grammar"). |

**Why both carriers stay.** The response trailer feeds the live convergence gate inside one
invocation; the file field feeds the *next* invocation's skip decision. Removing either breaks a
different mechanism, so C-4 holds and `parseVerdict`'s existing call sites are untouched — which is
R-7's whole containment argument.

**AC-4.7a, carried through unchanged.** `CODE_REVIEW-{feature}-v{N}.md` gets **no** verdict field.
Phase DOD is out of AC-4's scope per AC-4.7, so a persisted verdict on it would have no reader.
`harvest-learnings` continues to delete `CODE_REVIEW-*` unchanged, and §9's approval record carries no
DOD rows. The *catalogue* is shared should a future row bring Phase DOD into scope.

## 7. FSPEC-DIGEST-01 — Content digest, hash capture, and write ordering

**Linked requirements:** AC-4.2d (all five bullets), AC-4.2b (the two anchor columns), AC-4.4, §4a
A-11, C-2, C-5. **Discharges the hash half of O-17.**

### 7.1 The one referent for "the bytes" (AC-4.2d, carried through unchanged)

There is exactly **one** referent, fixed at REQ altitude, and this document does not add a second:

> **the exact bytes of the reviewed document read from the working tree immediately before the review
> dispatch.**

Three consequences the REQ already fixed, restated here because every clause below depends on them:

1. The read is **new** and is **not shared** with any AC-3.5 measurement. AC-4.2d retracted the v1.4
   "same single pre-dispatch read the round already performs" wording as naming the wrong seam: the
   *authoring* episode's pre-episode measurement is taken **before** that round's authoring pass (for a
   greenfield round 1 the document does not yet exist; for a revision round it holds the *previous*
   round's bytes), and the *review* episode's pre-episode measurement is over the reviewer's own
   `CROSS-REVIEW-*` file, not the reviewed document at all. An implementation that reuses an AC-3.5
   measurement is a **defect**, not an optimisation.
2. The referent is the **working tree**, the same rule as AC-3.5c. The read is taken *after* the round's
   authoring commits, so under AC-3.2a's cadence the working tree and HEAD coincide; where a later
   uncommitted edit makes them diverge, the recorded hash will not match and the skip is denied — the
   fail-closed direction R-1 requires.
3. §9's canonicalisation and §10's comparison are over **these** bytes and no others. The withdrawn
   "the document file as committed, byte-for-byte" reading of O-21 v1.3 would have been a third
   referent and is not specified anywhere in this document.

### 7.2 The digest mechanism — an inlined pure-JS function (§4a A-11)

**Chosen: a pure-JS digest function inlined into the workflow bundle, computed over bytes the script
already holds from the injected read seam.**

§4a A-11 measured that the runtime has no digest primitive — no `crypto` among the eleven host globals,
and C-2 forbids the `import` that would supply one — and that the repo's two sha1 producers are both
unreachable from a bundle: `build-runtime.mjs` (`import { createHash } from "crypto"`, and its manifest
row builder's `createHash("sha1").update(contents, "utf8").digest("hex")`) is Node-side, and
`pdlc/hooks/scripts/lib/pdlc-drift.sh`'s `pdlc_probe_hash_tool` (resolving `shasum` / `sha1sum` on
`PATH` into `PDLC_HASH_BIN`) is shell-side.

**Rejected: an agent-relayed `shasum` through the adapter's Bash seam.** It is how `git` and `gh`
reach the runtime today (`runtime-adapter.js`'s header line "`gh` and `git` invocations → an agent with
Bash"), so it would have been the path of least resistance. It is rejected because it puts the
**load-bearing value** behind a model relaying text — the narration risk AC-4.2b and §4a A-7 already
document, where harvest's own `Harvested from` row mis-states what it deleted — and it would make a
deterministic comparison depend on a response the script cannot verify.

| Aspect | Specification |
|---|---|
| Algorithm | **SHA-256**, implemented as pure JavaScript over the canonicalised byte sequence of §7.3, emitting **64 lowercase hex characters**. |
| Why SHA-256 and not sha1 | The repo's existing sha1 uses are *drift detection over files the repo itself generated*; this hash is an **approval anchor** an operator may audit months later, and a collision here silently grants a skip over unreviewed bytes (R-1). A wider digest costs nothing at these sizes, and there is no interop requirement pulling toward sha1 — nothing compares this value against `distribution-manifest.json`'s sha1s. |
| Purity | No host global beyond arithmetic and typed arrays. No `crypto`, no `import`, no `process`, no `fetch` (C-2). It must survive `runtimeBundle.test.js`'s structural assertions. |
| Where it lives | A named function in `pdlc/workflows/orchestrate-dev.js`, exported for jest, stripped to a plain declaration by the build's `stripModuleSyntax` (its `.replace(/^export (const\|let\|var\|function\|async function\|class) /gm, "$1 ")` rule) — the same treatment `parseVerdict` already receives. It is therefore **inlined by the existing build**, with no new build step. |
| Synchronous | The digest takes bytes and returns a string. It performs no IO, so it is **not** an injected seam and **not** awaited. Only the read that supplies its input is awaited. |

**The single-implementation requirement (O-17(a), AC-4.2d).** **One** function serves the write path
and **every** read path. Concretely: the pre-review capture (§7.4), the tier-1 comparison (§10.2), the
tier-2 comparison (§10.3), and any diagnostic that prints a hash all call the same named function with
the same canonicalisation applied by that function itself — the canonicalisation is **inside** the
digest function, not at its call sites, so a call site cannot forget it. "A hash that two call sites
compute differently is worse than no hash": AC-4.2d states the requirement, and putting
canonicalisation inside the function is how this document makes it unforgettable rather than merely
required. The TSPEC owes the fixture (O-14(iii)).

**The C-5 boundary, stated precisely so it is not overread.** The **digest and the comparison** are
computed by the script from bytes it holds. The **transport** of those bytes is `_readFile`, which in
this runtime is implemented as an `agent()` call (`rtReadFile`, whose prompt instructs "Return ONLY its
exact, complete contents as your final message" and returns `null` on the `__PDLC_FILE_MISSING__`
sentinel) — because in this runtime *every* read is an agent call. **No agent is ever asked to compute,
compare, or report a hash.**

### 7.3 Canonicalisation

The digest is taken over the bytes as read, with exactly two normalisations and no others:

| # | Normalisation | Why |
|---|---|---|
| N-1 | Line endings normalised to `\n` (a `\r\n` or lone `\r` becomes `\n`) | The transport is a text round-trip through an agent response; a line-ending change is not a content change, and letting it deny every skip would make AC-4 inert for a reason unrelated to review. |
| N-2 | Exactly one trailing `\n`; other trailing whitespace-only content at end-of-file is removed | `rtReadFile`'s prompt explicitly forbids added blank lines ("no leading or trailing blank lines you add yourself"), but a trailing-newline discrepancy is the single most likely transport artefact and is never a content change. |

**Explicitly not normalised:** internal whitespace, indentation, blank lines between sections, heading
capitalisation, table alignment, character case, or Unicode form. Any of those changing **is** a
content change and must deny the skip. Normalising further would launder edits, which R-1 forbids.

The two normalisations are applied **inside** the digest function (§7.2), so tier 1, tier 2 and the
capture path cannot disagree about them.

### 7.4 Capture point, write ordering, and the failed-append branch

**Who captures, and from what (AC-4.2d).** The **script**, from a read taken for this purpose. For
each round it dispatches, the script performs a **new** `_readFile` of the reviewed document
immediately before sending it for review, digests those bytes, and holds the value for the duration of
the round.

**Ordering (AC-4.2d's fifth bullet, answering TE-v5 Q-01):**

```
t0  script reads the reviewed document           → bytes B          (§7.1's referent)
t1  hash  ← digest(B)                            (pure, no IO)
t2  sha   ← the commit sha the reviewed document is at              (§7.5)
t3  reviewer dispatch(es) for this round         (the AC-3.5-wrapped review episode)
t4  the review episode reaches TERMINAL on each cross-review file   (§16.3)
t5  script APPENDS the two anchor lines to each of that round's cross-review files
t6  script commits the append                    (§7.6)
```

**The append's shape.** Append-only, never a rewrite:

```markdown

APPROVAL-HASH: sha256:{64 lowercase hex}
REVIEWED-COMMIT: {40 lowercase hex | unavailable}
```

appended to the end of the file, after the `## Verdict` section of §6.2, via `_appendFile`. Two REQ
clauses force this shape: AC-1.4 forbids overwriting a cross-review file, and AC-3.1a forbids a
whole-file rewrite of a document over `MAX_AUTHORING_WRITE_BYTES` — and a replace-shaped edit would
emit match + replacement, roughly double. An append emits only the two lines.

**Three consequences the REQ fixed, and their implementation:**

| REQ clause | Implementation |
|---|---|
| "The append is the **script's own** write, not a dispatch, so it is not a member of any AC-3.5 measurement and cannot disturb the terminal decision that preceded it." | The append happens strictly after t4. The wrapper's terminal measurement on that file is **final** before the append happens; the wrapper is not re-entered afterwards. §16.3's completeness criterion is the `VERDICT:` field, which the append does not touch. |
| "The append therefore lands *after* the reviewer's commit. That window is irrelevant, because neither tier's staleness test measures a position in history." | §10 designs **no** history walk at either tier. There is no history referent for the append's own commit to move. This is what dissolves SE-v5 Q-01 rather than answering it. |
| "A **failed append** is an error surfaced to the operator, not a silent degradation." | On `_appendFile` rejecting, or on the post-append verification read failing to find exactly one `APPROVAL-HASH:` line: the script emits an operator-facing error naming the file and the failure, and **that round yields no approval**. §10.5's no-parseable-hash branch then governs on any later re-entry: the phase runs. **Recording the approval without the hash is forbidden.** The append failure does **not** halt the current run — the round's review verdict is already known from the response trailer and the pipeline continues normally; what is lost is only the future skip. |

**Idempotence on re-entry (O-17(b)).** Before appending, the script counts `APPROVAL-HASH:`-prefixed
lines in the file. Zero ⇒ append. One ⇒ **skip the append** and verify the existing value equals the
value just computed; if it differs, that is an operator-surfaced error and the round yields no
approval (two different anchors for one round is unresolvable, and choosing either is fail-open). Two
or more ⇒ operator-surfaced error, round yields no approval (§6.3's duplication direction). This makes
a re-entered round that re-dispatches its reviewers safe: the anchor is written once and never
silently changed.

**Reachability of these branches (TE-v1 F-10).** They are **defensive**, and no reachable pipeline path is
claimed for them: §4.4 always derives `startIndex = max + 1` and §15.2 rule 2 sends a resumed
invocation's *reviewer* dispatch to a new index, so the script does not re-append to a round it already
anchored. What can put a second value there is an out-of-band act — a hand-edit, a cherry-pick, a
concurrent run — and the pre-count is what keeps those from silently changing a load-bearing value.
Consequently TSPEC asserts E-14 and E-15 at **unit level on the append helper**, not through a
constructed end-to-end fixture; the reachable read-side counterparts are §10.1's E-63/E-64.

### 7.5 The reviewed document's commit sha (AC-4.2b, TE-v5 F-03 carried through)

The second anchor column is **the commit sha the reviewed document was at when it was sent for
review** — obtained at `t2` via `_git` (`git log -1 --format=%H -- {docPath}`, or equivalently the
current `HEAD` given AC-3.2a's cadence puts the round's authoring commits behind it).

**What was retracted, and why the FSPEC must not reinstate it.** v1.2–v1.4 specified this column as
"the commit sha that round's approving cross-review files were committed at". TE-v5 F-03 retracted it
as **unimplementable at tier 1**: AC-4.2d has the script write the field *into* those cross-review
files, and the sha of the commit that contains a file cannot be a field of that file — the value did
not exist at the instant it was required. The reviewed document's own commit is knowable at `t2`, is
not self-referential, and names the commit of the very bytes the hash covers.

**It is corroborating context only.** The hash is the load-bearing field. Nothing in AC-4 may be
defined over the sha (O-8), nothing resolves `git show {sha}:{path}` at read time, and its
unresolvability after a squash merge or a rebase costs nothing. When `_git` cannot produce a sha (a
document not yet committed, a `_git` failure), the column is written as the literal `unavailable` —
which is **not** the fail-closed trigger, because the sha is not load-bearing. Only a missing or
unparseable `APPROVAL-HASH:` denies approval (§10.5).

### 7.6 Committing the anchor lines

The append is committed by the script through `_git`, using the same commit mechanics §13.2 specifies
for the queue row (staging scope limited to the named paths, one commit, no `-A`), with the message:

```
chore(pdlc): record approval anchor for {feature} {docType} round {N}
```

If the commit fails while the append succeeded, the anchor is on disk in the working tree and §7.1's
working-tree referent means the *next* read of the cross-review file still finds it. The failure is
reported (§13.4's catalogue) but does not deny the approval, because the value is present at the
referent the comparison uses. This is the one place a git failure is non-fatal, and it is because the
comparison was deliberately defined over the working tree rather than over history.

## 8. FSPEC-TRAILER-01 — The revision-completion trailer

**Linked requirements:** AC-3.5g clause 4, AC-3.5b (terminal-first), AC-3.5e, R-12. **Discharges the
trailer half of O-17 (O-17(d)).**

### 8.1 What it is and why it exists

In **revision** mode the wrapper cannot decide terminal from disk state alone. §4a A-9 measured that
the script sees an artifact's content but never the calls that produced it, so "does any finding of this
round remain unreflected in the document?" is a semantic judgement over content the script cannot make.
AC-3.5g clause 4 therefore makes the author agent emit a **positive, closed-form declaration**, and the
script's whole role is to parse one catalogue token.

Two readings the REQ **retracted**, which this document must not reinstate:

| Retracted | Why it was defective |
|---|---|
| "the dispatch returned normally" as the terminal test (v1.4, retracted at v1.5 / TE-v5 F-01) | §4a A-8 measured that how an exhausted runtime retry surfaces to the caller is **unmeasured** — it may return a value, return nothing, or throw. Read strictly, the script can never establish "returned normally", so every revision episode would re-dispatch to `MAX_AUTHORING_DISPATCHES` and a healthy converging round would halt the phase. Read as "no exception was caught", a dispatch killed after applying three of five findings scores terminal and the wrapper **reports success on a partly-unaddressed round**. |
| requiring **progress** on the terminal dispatch (v1.4, retracted at v1.5 / TE-v5 F-02) | AC-3.5g makes "write nothing" the **correct** output of a continuation dispatch whose round is already fully applied. Under v1.4 that compliant no-op scored no-progress, the script re-dispatched, the agent correctly did nothing again, and three consecutive no-ops exhausted `MAX_AUTHORING_ATTEMPTS`, **halting a phase whose round had fully converged** — with the only escape being the gratuitous write AC-3.5g calls an error. |

### 8.2 Grammar

The trailer is the **last content of the author agent's response** — the same carrier position the
verdict trailer occupies, deliberately, so authors and reviewers follow one convention:

```
REVISION-COMPLETE: yes
```

| Aspect | Specification |
|---|---|
| Key | The literal `REVISION-COMPLETE: ` at the start of a line, after trimming |
| Value catalogue | Exactly two values, case-sensitive: `yes` (no finding of this round remains unreflected in the document) and `no` (work remains) |
| Position | The **final** non-empty line of the response, emitted after all edits are written **and committed** — so its presence is evidence the dispatch ran to the end of its work (AC-3.5g clause 4, bullet 1) |
| Uniqueness | Exactly one such line in the response |
| Scan direction | From the end, like `parseVerdict`'s `const reversed = lines.slice().reverse();` — but with a **pre-count** of `REVISION-COMPLETE:`-prefixed lines, for the same reason §6.3 pre-counts `VERDICT:` lines: scanning from the end would silently prefer the last of two, and a silent choice between two contradictory declarations is exactly the fail-open shape being designed out. |
| No JSON line | Unlike `VERDICT:`, the trailer carries no counts. Counts would be a semantic claim the script could not check and would invite an agent to narrate. |

**Why `yes`/`no` rather than a single presence marker.** A presence-only marker conflates "I finished"
with "my response was truncated before the marker". An explicit `no` lets an agent that legitimately
ran out of budget mid-round say so, which turns a stall into a *reported continuation* rather than an
ambiguity — and it keeps the parser total in the DC-01 sense.

### 8.3 The parser and its total behaviour

`parseRevisionComplete(response)` → `{ complete: true } | { complete: false, reason: TrailerFailure }`.

| Input state | Result | Terminal? |
|---|---|---|
| Exactly one line, value `yes` | `{ complete: true }` | **Terminal** (subject to structural completeness, §8.4) |
| Exactly one line, value `no` | `{ complete: false, reason: "declared_incomplete" }` | Not terminal |
| **No** such line | `{ complete: false, reason: "absent" }` | Not terminal |
| Two or more such lines | `{ complete: false, reason: "duplicated" }` | Not terminal |
| One line, value not in the catalogue | `{ complete: false, reason: "unparseable" }` | Not terminal |
| `response` is `null`, `undefined` or empty | `{ complete: false, reason: "absent" }` | Not terminal |
| The dispatch **threw** | the wrapper catches it and treats it as `{ complete: false, reason: "absent" }` | Not terminal |

**Absence is never terminal, and the wrapper never inspects the fault.** This is the design property
AC-3.5e requires: on all three of §4a A-8's surfacings — returns a value, returns nothing, throws —
there is no parseable trailer, so a faulting dispatch is **never** terminal in revision mode, and the
wrapper reaches that conclusion *by the absence of a positive marker* rather than by classifying the
fault. Whether the artifact happens to be structurally complete on disk is therefore not sufficient to
end a revision episode, which is exactly the fail-open reading v1.4 permitted. A dispatch fault must
**not** propagate as an unhandled halt that bypasses the attempt count — that is the path §H-3 took,
producing no operator-facing explanation at all. §15.4's report names whether a fault was observed,
alongside the counts.

**C-5 is not breached.** The script parses **one closed-catalogue token** and never interprets prose —
the same thing `parseVerdict` already does off an agent response. The judgement is the agent's because
§4a A-9 proves the script cannot substitute its own.

### 8.4 Interaction with the terminal test (AC-3.5b, carried through)

After each dispatch the wrapper evaluates **terminal first, then progress**:

| Mode | Terminal condition |
|---|---|
| **Greenfield** | every required member of the artifact set is structurally complete (§16). Positive, script-decidable, unchanged from v1.3. No trailer is required or expected — AC-3.5 scope (d) rule 3 puts every non-authoring wrapped dispatch (review, `dod-verify`, `harvest-learnings`) in greenfield by construction, so those episodes need no trailer. |
| **Revision** | every required member is structurally complete **and** `parseRevisionComplete` returned `{ complete: true }`. **Progress on the terminal dispatch is not required**: a dispatch that writes nothing and emits `REVISION-COMPLETE: yes` **is** terminal. |

**The distinguishing property.** Evaluating the trailer before the progress predicate is what converts
a fully-converged round from a false halt into a one-dispatch terminal — and it is also what keeps a
genuine stall counted: a stall-killed dispatch emits **no** trailer, so *no progress without a trailer*
still counts against `MAX_AUTHORING_ATTEMPTS` exactly as before. The two populations are separated by
the presence of a positive marker, not by anything the script infers.

### 8.5 Amendment to the three author SKILLs (O-17(d))

Additive edits to `pm-author`, `se-author` and `te-author` — the same three files AC-3.2a already puts
in `Targets` for their Git Workflow sections (§15.5):

| Edit | Content |
|---|---|
| New §Revision-Completion Trailer section | States the grammar of §8.2 verbatim; states that it is emitted **only** when the dispatch was a revision/feedback-addressing dispatch; states that it is the **last** content of the response, after edits are written and committed; states that `yes` means *no finding of this round remains unreflected in the document as it stands*, and that emitting `yes` while a finding remains is an error, not an optimisation. |
| Same section, the no-op case | States explicitly that the trailer is emitted **even when the dispatch wrote nothing**, and that this is its most important case: it is the correct and complete output of a continuation dispatch whose round is already fully applied. Writing something gratuitously in order to "show progress" is an error. |
| §Process Feedback | Cross-reference to the new section, and the not-already-reflected instruction of §15.4's continuation prompt, so an author reading only that capability finds both. |

**Residual risk, priced not eliminated (R-12).** An agent may emit `yes` while findings remain, ending
the episode early. This is accepted as the least-bad of three options — the two alternatives were
measured, not argued (§8.1) — and it is bounded: the round's findings are still on the branch until
Phase H (§4a A-7), so the **next** round's reviewers see the unaddressed finding and re-raise it. The
failure costs one review round rather than losing one, which is the opposite direction from the silent
loss AC-3.5 scope (d) exists to prevent. It is also not new trust: the pipeline already ends a review
round on an agent-emitted trailer parsed by `parseVerdict`. O-19(h4) owns the negative fixture.

## 9. FSPEC-APPROVAL-01 — The tier-2 approval record in LEARNINGS

**Linked requirements:** AC-4.2b, AC-4.2c, AC-4.3, AC-4.2a, AC-4.2d. **Discharges O-21.**

### 9.1 Why a second carrier exists at all

§4a A-7 measures that `harvest-learnings` **deletes** every `CROSS-REVIEW-*` on the branch
(`harvest-learnings/SKILL.md` instructs deletion of the harvested cross-review and code-review files,
and its LEARNINGS template carries the `| Harvested from | {list …, now deleted} |` row). Tier 1 —
§6's persisted verdict field — therefore ceases to exist at Phase H. Without a durable carrier the
approved-phase skip of AC-4.1 would be permanently inert for every feature that has been harvested,
which is every finished feature. Tier 2 is that carrier.

### 9.2 Placement in `LEARNINGS-{feature}.md`

`harvest-learnings/SKILL.md`'s output format is a metadata table (including `| Harvested from | … |`)
followed by five numbered sections. The approval record is added as a **new, final top-level section**
of that document:

```markdown
## 6. Approval Record

| Document Type | Round | Role | Verdict | Approval Hash | Reviewed Commit |
|---|---|---|---|---|---|
| FSPEC | 2 | product-manager | Approved | sha256:1f3a…9c | 4b21e07 |
| FSPEC | 2 | software-engineer | Approved with minor changes | sha256:1f3a…9c | 4b21e07 |
```

| Aspect | Specification |
|---|---|
| Heading | Exactly `## 6. Approval Record` — a new section appended after §5, so the five existing sections keep their numbers and any consumer that reads them by number is unaffected |
| Shape | One markdown table, one row per (document type, round, role). A round approved by two roles contributes **two** rows. |
| Ordering | Document type in pipeline order (REQ, FSPEC, TSPEC, PLAN, PROPERTIES, DECISIONS), then round index ascending, then role slug ascending — a total order, so the section is byte-stable across re-derivations |
| Absent case | A feature with no approving round emits the heading and the table header with **no data rows**, never omits the section. An empty table is evidence that harvest looked; a missing section is indistinguishable from a harvest that predates this mechanism. |
| Why a section, not a metadata row | The record is multi-row and grows with rounds; the metadata table is one-value-per-row. Placing it beside `Harvested from` would also invite the narration failure §9.4 exists to prevent. |

### 9.3 The columns (fixed at REQ altitude — carried through unchanged)

AC-4.2b fixes the column set; O-21 owns only syntax. All six, verbatim in substance:

| Column | Value | Syntax |
|---|---|---|
| Document Type | The document that was reviewed | One member of §4's doc-type catalogue, upper case: `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES`, `DECISIONS` |
| Round | The approving round index | A positive decimal integer, branch-absolute per §4 — the same index that appears in the cross-review's `-v{N}` suffix |
| Role | The approving reviewer | One member of §4's role-slug catalogue: `product-manager`, `software-engineer`, `test-engineer` |
| Verdict | That role's verdict | One member of **AC-4.3's closed catalogue**, which is `parseVerdict`'s own `VALID_VERDICTS` — `Approved`, `Approved with minor changes`, `Needs revision`. One catalogue, three carriers (§2.3). |
| Approval Hash | The approval-time content hash of the reviewed document | §7's grammar exactly: `sha256:` + 64 lowercase hex, **or** the literal `unavailable` |
| Reviewed Commit | The commit the reviewed document was at when sent for review | An abbreviated or full lowercase hex sha, **or** the literal `unavailable` |

**Two REQ-altitude decisions carried through, not re-litigated.**

1. The **Reviewed Commit** column is the *reviewed document's* commit, not the cross-review files' own
   commit. AC-4.2b retracted the latter at v1.5 (TE-v5 F-03) as unimplementable: §7 has the script
   write these fields **into** the cross-review file, and the sha of the commit containing a file
   cannot be a field of that file, so the value did not exist at the instant it was needed. §7 already
   fixes the same rule for tier 1; tier 2 copies it.
2. The **Approval Hash** is load-bearing and the **Reviewed Commit** is corroborating context only
   (AC-4.2b, AC-4.2d). §10's comparison never reads the sha. This is what makes the mechanism
   rebase-proof where a timestamp or a sha would not be — Phase DOD rebases `feat-{feature}` and
   rewrites both.

### 9.4 Derivation: copy, never recompute, never narrate

`harvest-learnings` builds each row **by measurement of the files it is about to delete**:

| Field | Source | Rule |
|---|---|---|
| Document Type, Round, Role | The cross-review **filename**, parsed by §4's grammar | Derived from the basename, not from the file's prose |
| Verdict | The `## Verdict` section of that cross-review file (§6), read with §6's parser including its duplicate pre-count | Read from the file, never recalled from the harvest agent's own summary of it |
| Approval Hash, Reviewed Commit | **Copied verbatim** from the `APPROVAL-HASH:` / `REVIEWED-COMMIT:` lines that §7 appended to that same tier-1 record | Copied as bytes. Harvest **may not** recompute the hash and **may not** substitute a harvest-time hash. |

**Why recomputation is forbidden (AC-4.2b's v1.4 retraction, carried through).** v1.3 had harvest
compute the hash from the document it was harvesting beside. That is retracted, and reinstating it
would reintroduce the exact fail-open this feature exists to close: Phase H runs *after* the approving
round, *after* the Final Codebase Review, and *after* Phase DOD's remediation rounds, so a harvest-time
hash records whatever the document is at that moment. Any edit landing between approval and harvest
would then be certified as approved — §10's comparison would find HEAD equal to the recorded hash and
skip a phase over bytes no reviewer saw. That is R-1's laundering outcome. The hash must originate at
the approving round (§7) and travel here unchanged.

**Why narration is forbidden.** §4a A-7 records that harvest *already* mis-states what it deleted in
the adjacent row: `pdlc-workflow-distribution`'s `Harvested from` row asserts its `POSTMORTEM-R-*` was
"all now deleted" while that file is present at HEAD and `harvest-learnings/SKILL.md` never instructs
its deletion. The row immediately beside this one is therefore known-unreliable when produced from
memory. Every field above is copied or parsed.

**Unavailable-hash marker.** When the tier-1 record for an approving round carries no parseable
`APPROVAL-HASH:` line, harvest writes the literal `unavailable` in that column (and, independently, in
`Reviewed Commit` when that line is missing). It does **not** omit the row and does **not** fill the
gap. §10 treats an `unavailable` hash as no parseable hash: the approval is not usable and the phase
runs (AC-4.2a). Recording the round with a marker rather than dropping it preserves the audit trail —
an operator can see that a round was approved and *why* its skip is not available.

### 9.5 Canonicalisation and the single byte referent

The hash is not computed here, so no canonicalisation happens here. The statement O-21 owes is about
the **referent**, and it is one line: the bytes the hash covers are AC-4.2d's single referent — the
reviewed document as read from the **working tree immediately before the review dispatch** (§7's t2) —
canonicalised by §7's N-1/N-2 inside the digest function itself.

v1.3's phrasing "the document file as committed, byte-for-byte" is **withdrawn** (SE-v5 F-06): it
would have given this mechanism a third referent alongside AC-3.5c's working tree and AC-4.4's
comparison read. O-21 canonicalises those bytes and no others — and in practice canonicalises nothing,
because it copies a digest §7 already produced with the one shared function.

### 9.6 Tier precedence and the disagreement case (AC-4.2b, carried through)

| Situation | Governing tier | Outcome |
|---|---|---|
| **No** `CROSS-REVIEW-*` file for that (feature, document type) present on the branch | Tier 2 | The approval record is consulted |
| Any conforming `CROSS-REVIEW-*` for that doc-type present — **even one** | Tier 1 | Tier 2 is **not** consulted (§6.4's tier-selection predicate) |
| Tier 1 present but role-asymmetric — one role's file for the approving round present, the other's missing | **Tier 1** | Tier 1 is *not* "absent". The missing role is **not approving** (§5's role-asymmetric table). The pair is **never** completed across tiers: mixed provenance never assembles an approval. Phase runs. |
| Both tiers present for the same (document type, round) and **disagree** | Neither | AC-4.2a's unparseable case: the phase **runs** |

### 9.7 Legacy features and the guard (AC-4.2c, carried through)

A feature harvested before this mechanism shipped has neither tier: its cross-reviews are gone and its
LEARNINGS has no `## 6. Approval Record`. It fails closed under AC-4.2a and its phases run. This is
**accepted, not backfilled** — reconstructing verdicts for deleted artifacts from git history is out of
scope, and an operator who wants the skip has §11's force surface.

`guard-harvest-before-delete` is **not tightened**. Its precondition remains exactly what
`hooks/scripts/guard-harvest-before-delete.sh` implements today — block deleting a `CROSS-REVIEW-*` or
`CODE_REVIEW-*` unless `LEARNINGS-{feature}.md` exists on the branch — and it does **not** additionally
require the approval record. Rationale, carried through from AC-4.2c: the guard protects harvest of
*content*, which is the irreversible loss; a missing approval record costs one re-review, which
AC-4.2a already treats as the safe direction. Making an optimisation's record a precondition of the
pipeline's normal cleanup step would let a record-writing bug halt harvest.

**The falsifier is therefore the opposite of the obvious one.** O-14 must *not* assert that the guard
rejects a record-less LEARNINGS. It must assert that a record-less LEARNINGS **passes** the guard, the
cross-reviews are deleted, and the feature then **fails closed** at AC-4.2a with its phases running. A
test that shows the guard rejecting it would be testing a tightening this document forbids.

## 10. FSPEC-STALE-01 — The staleness comparison

**Linked requirements:** AC-4.4, AC-4.2a, AC-4.2d, AC-4.7. **Discharges O-8 (as narrowed at v1.5).**

### 10.1 The comparison, in full

```
isStale(recordedHash, documentBytes) :=
    parseApprovalHash(recordedHash) is absent        ⇒ UNEVALUABLE
    parseApprovalHash(recordedHash) ≠ digest(documentBytes) ⇒ STALE
    otherwise                                        ⇒ FRESH
```

**Where `recordedHash` comes from at tier 1 (SE-v1 F-02).** The candidate round of §5.1 has exactly
**two** cross-review files, because step 3(a) requires both expected roles. Each may carry an
`APPROVAL-HASH:` line. Selection is a **unanimity** rule with no tie-break:

| Anchor state across the candidate round's two files | `recordedHash` |
|---|---|
| Present on both, grammatical, and **equal** | that value |
| Present on one role's file, **absent** on the other's | **none ⇒ `UNEVALUABLE` ⇒ the phase runs** |
| Present on both but **unequal** | **none ⇒ `UNEVALUABLE` ⇒ the phase runs**, and the report names both files and both values |
| Absent on both, or ungrammatical on either | **none ⇒ `UNEVALUABLE` ⇒ the phase runs** (§10.5) |

An anchor is **never** assembled across roles and no role's file is ever preferred over the other's. The
partial state is reachable — §7.4's failed-append branch has SE's append succeed and TE's fail — and
§4.4's `max + 1` derivation means that round is not re-dispatched, so the asymmetry persists on the
branch. Preferring either value would grant a skip from a half-written record; the unanimity rule is the
fail-closed reading AC-4.2a requires, and it costs one re-review.

That is the whole mechanism: **one hash-equality test, identical at both tiers.** `digest` is §7's
single inlined function — the same function on the write path and every read path (A-11, AC-4.2d) — so
canonicalisation N-1/N-2 is applied here automatically and cannot be forgotten by a call site.

| Result | Effect on the phase |
|---|---|
| `FRESH` | The approval is usable. Combined with §5's same-round pair test, the phase is **skipped** (AC-4.1, reported per AC-4.5). |
| `STALE` | The document changed after its approval. The phase **runs**. |
| `UNEVALUABLE` | No parseable referent in the tier in use. The phase **runs** (fail closed, AC-4.2a). |

Only two of the three outcomes are distinguishable in effect, deliberately: `STALE` and `UNEVALUABLE`
both run the phase. They are distinguished only in the report line, so an operator can tell "your edit
invalidated the approval" from "there is no anchor to compare against".

### 10.2 No history walk at either tier (v1.5 narrowing, carried through)

v1.3–v1.4 gave tier 1 a **different** measure: the approving cross-review artifacts' own *position in
history*, compared against the document's. That is **withdrawn**, and this document specifies **no
history walk at either tier**. Three consequences the REQ fixed and this section carries:

1. **Redundancy.** Once §7 puts the hash into the tier-1 record, the walk answers a question the hash
   already answers, and answers it worse.
2. **The two tiers can no longer disagree** about a document they both certified, because they are
   evaluating the identical predicate over the identical referent. §9.6's disagreement case survives
   only for a genuinely contradictory *verdict*, not for staleness.
3. **SE-v5 Q-01 dissolves rather than being answered.** The question "which commit is a cross-review
   file *at* — the reviewer's write, or the script's later `APPROVAL-HASH:` append?" had no good answer
   and is now not asked: no part of this comparison reads a commit.

**The recorded commit sha is not load-bearing, and this document may not make it so.** `Reviewed
Commit` (§9.3) and `REVIEWED-COMMIT:` (§7) exist as corroborating context for a human reading the
record. The comparison never reads either. Any implementation that consults them to decide staleness is
non-conforming.

### 10.3 Reading the document at comparison time

The one remaining degree of freedom O-8 owns. The rule is AC-4.2d's single-referent rule applied at the
read side:

| Aspect | Specification |
|---|---|
| Source | The reviewed document read from the **working tree**, via `_readFile(docPath)` — awaited (C-2) |
| Not | Not `git show HEAD:{docPath}`, not the index, not a cached copy from an earlier phase |
| When | **At comparison time**, inside the skip evaluation for that phase — a fresh read, not a value carried from a previous phase's evaluation |
| Missing document | `_readFile` returns `null` (`defaultReadFile` swallows the error and returns `null`). No bytes ⇒ nothing to compare ⇒ `UNEVALUABLE` ⇒ the phase runs. A missing document is exactly the case where the phase must run. |
| Empty document | Zero bytes is a legitimate input to `digest`; it will not equal any recorded hash of a non-empty document, so this lands on `STALE`. No special case. |
| Canonicalisation | Inside `digest` (§7), so the working-tree read needs no pre-processing here |

**Why the working tree and not HEAD.** AC-3.5c already measures the working tree, §7 hashes the working
tree, and §9.5 canonicalises those same bytes. Reading HEAD here would be the *third* referent SE-v5
F-06 identified and the REQ eliminated. It would also be wrong in practice: an uncommitted edit to a
spec is precisely the unreviewed change AC-4.4 must catch, and a HEAD read would not see it.

### 10.4 Both tiers available and disagreeing

Per §9.6, the tier-selection predicate is exclusive — tier 2 is consulted **only** when no conforming
`CROSS-REVIEW-*` for that doc-type is present on the branch — so the two tiers are not normally both
read. The case survives only for a malformed branch state (a LEARNINGS approval record *and* a
surviving cross-review for the same doc-type and round). Behaviour:

| State | Outcome |
|---|---|
| Tier 1 present ⇒ tier 1 governs, tier 2 not read | Per §9.6. No disagreement is possible because only one tier was consulted. |
| Both read despite the predicate (implementation fault) and they carry **different** hashes for the same (doc type, round) | AC-4.2a's unparseable case: the phase **runs**, and the report names the disagreement |

There is no reconciliation rule and no "most recent wins" rule. A contradiction about what was approved
is treated as an absence of approval, which is the only direction that cannot launder an edit.

### 10.5 No parseable hash in the tier in use

The **legacy population lands here.** Five reachable shapes, one outcome:

| Shape | Result |
|---|---|
| Tier-1 record present, verdict parseable, **no** `APPROVAL-HASH:` line on **either** of the candidate round's files (cross-reviews written before this feature shipped) | `UNEVALUABLE` ⇒ no approval ⇒ phase runs |
| `APPROVAL-HASH:` present on **one** role's file for the candidate round and **absent** on the other's (§7.4's failed-append branch, or a kill between the two appends) | `UNEVALUABLE` ⇒ phase runs. Neither value is adopted — §10.1's unanimity rule. |
| `APPROVAL-HASH:` present on **both** but the two values are **unequal** | `UNEVALUABLE` ⇒ phase runs; the report names both files and both values. There is no tie-break and no "most recent file wins". |
| Tier-1 `APPROVAL-HASH:` line present but the value does not match §7's grammar (`sha256:` + 64 lowercase hex) on either file | `UNEVALUABLE` ⇒ phase runs |
| Tier-2 row present with the literal `unavailable` in `Approval Hash` (§9.4's marker), or with an ungrammatical value | `UNEVALUABLE` ⇒ phase runs |

An approval with a verdict but no anchor is **never** treated as fresh. Substituting any other value —
a recomputed hash, a timestamp, "assume unchanged" — is forbidden, because each converts a missing
anchor into a fail-open skip (AC-4.2d).

### 10.6 Why the comparison is rebase-invariant

The statement O-8 owes explicitly. Phase DOD Step 0 rebases `feat-{feature}` onto the latest default
branch before Harvest — this is not hypothetical, it is a standing step of every pipeline run. A rebase:

| What it rewrites | Would the withdrawn referent survive? | Does the hash survive? |
|---|---|---|
| Every commit sha on the branch | **No** — a recorded sha or a "position in history" names commits that no longer exist | **Yes** — no sha is read |
| Committer/author timestamps | **No** — a timestamp comparison flips arbitrarily | **Yes** — no timestamp is read |
| Ancestry / topological order | **No** — "is the document's commit after the cross-review's commit?" is answered over a rewritten graph | **Yes** — no ancestry is walked |
| The **bytes** of a file the rebase did not conflict on | — | Unchanged, so the digest is unchanged and the approval survives |
| The bytes of a file the rebase **did** change (a conflict resolution touching the spec) | — | Changed, so the digest differs ⇒ `STALE` ⇒ the phase runs — which is **correct**: those bytes were not reviewed |

The invariance is therefore not an accident of the algorithm; it is the reason the referent was moved
to content. A hash is a function of bytes alone, and a rebase that preserves a file's bytes preserves
its approval while a rebase that alters them revokes it — exactly the semantics AC-4.4 asks for.

### 10.7 Scope

The comparison is evaluated only for the phases AC-4.7 admits — **R, F, T, P and D**. Phase CR and
Phase DOD produce no `CROSS-REVIEW-{role}-{doc-type}` pair for a named document, so there is no
recorded hash and no document to compare; they are out of scope for AC-4 entirely and this comparison is
never reached for them.

## 11. FSPEC-FORCE-01 — The operator force-run surface

**Linked requirements:** AC-4.6, AC-4.6a, AC-2.3, AC-2.4, AC-4.5, AC-4.7. **Discharges O-9.**

### 11.1 The surface

A single optional workflow input, `forcePhases`.

| Aspect | Specification |
|---|---|
| Name | `forcePhases` |
| Type | `string` — a comma-separated list of phase ids, or the literal `all` |
| Required | No. Absent ⇒ no phase is forced (today's behaviour exactly) |
| Catalogue | Members of AC-4.7's in-scope set only: `R`, `F`, `T`, `P`, `D`. Plus the literal `all`, meaning all five. |
| Parsing | Split on `,`, trim each token, drop empty tokens, upper-case. Total function: an unrecognised token is **rejected**, not ignored (§11.3). |
| Invocation | `/pdlc:orchestrate-dev` with an args object: `{ reqPath: "docs/{feature}/REQ-{feature}.md", forcePhases: "F,T" }` |

**Why an args field and not an env var, a marker file, or a config key.** `build-runtime.mjs`'s
`DEV_ENTRY` already establishes that `args` may be a string **or** an object — it reads
`typeof args === "string" ? args.trim() : args && typeof args === "object" && args.reqPath` — so an
object-valued second key is the surface the runtime already supports, with no new capability. The three
alternatives are unavailable or worse: there is no `process` in the runtime (C-2, §4a A-1) so an env var
cannot be read; a marker file would require a new read seam and would persist past the run that wanted
it (a forced phase that stays forced is a footgun); and `.claude/pdlc.config.json` is repo-level
persistent state, wrong altitude for a one-shot operator act.

### 11.2 The three edits this input requires

Grounded at HEAD `0655387`. `forcePhases` must be threaded through, and the thread has exactly three
links because `meta` cannot be shared between source and bundle:

| Target | Edit | Anchor |
|---|---|---|
| `pdlc/workflows/orchestrate-dev.js` | Add a second entry to `meta.inputs` — `{ name: "forcePhases", description: …, type: "string", required: false }` — after the existing `reqPath` entry (`name: "reqPath"`, `required: true`) | `export const meta` |
| `pdlc/workflows/orchestrate-dev.js` | Add `forcePhases` to `main()`'s destructured parameter list, defaulting to `null` | `export default async function main({ reqPath, _agent: rawAgentFn = agent, … })` |
| `pdlc/workflows/build-runtime.mjs` | Extend `DEV_ENTRY` to read `args.forcePhases` when `args` is an object, and pass it to `__dev.main({ reqPath: __reqPath, forcePhases: __forcePhases, …rtDevInjections(__dev) })` | `const DEV_ENTRY = ` / `return await __dev.main({ reqPath: __reqPath, ...rtDevInjections(__dev) });` |

**`DEV_META` is deliberately not edited.** The hand-written `DEV_META` literal in `build-runtime.mjs`
is not a copy of the module's `meta` — it carries `name`, `description`, `whenToUse` and `phases`, and
carries **no** `inputs` array at all. Adding one would be a new, second declaration to keep in sync for
no benefit, since the bundle's entrypoint reads `args` directly. The comment already above `QUEUE_META`
records why the two `meta`s diverge (`meta` must be a pure literal and the first statement, so each
bundle carries its own hand-written copy rather than re-exporting the module's). The `meta.inputs` edit
to the module is what documents the input for a reader of the canonical source; discoverability at the
bundle is out of scope for this feature.

`orchestrate-queue` gets **no** force surface. The queue is the unattended driver; forcing is an
attended operator act, and O-5's direct-invocation path (§14) is where it belongs.

### 11.3 Rejection of a bad token

`parseForcePhases(raw)` → `{ ok: true, phases: Set<string> } | { ok: false, badTokens: string[] }`.

| Input | Result |
|---|---|
| absent / `null` / `""` / whitespace | `{ ok: true, phases: ∅ }` — not an error |
| `all` (any case) | `{ ok: true, phases: {R,F,T,P,D} }` |
| `F,T` | `{ ok: true, phases: {F,T} }` |
| `f, t ,` | `{ ok: true, phases: {F,T} }` — trimmed, upper-cased, empty tokens dropped |
| `CR` or `DOD` | `{ ok: false, badTokens: ["CR"] }` — **rejected**, because AC-4.7 puts them out of AC-4's scope; silently ignoring them would let an operator believe a forced CR was honoured |
| `Q` / `all,F` / any unknown token | `{ ok: false, badTokens: [...] }` |

A rejection **halts before any phase runs**, with one halt shape:

```
Unrecognised forcePhases token(s): {badTokens joined}. Valid: R, F, T, P, D, all.
```

Halting rather than warning is the fail-closed direction here: the operator's stated intent was not
achieved, and running the pipeline anyway would silently substitute a different plan. `all,F` is
rejected rather than coerced for the same reason — the request is ambiguous about intent, and DC-01's
total-function requirement is satisfied by a definite rejection, not by a guess.

### 11.4 Precedence: forcing overrides recorded approval only

The skip decision for an in-scope phase becomes:

```
skip(phase) := phase ∉ forcePhases
            ∧ approvingPairForSomeRound(phase)   (§5)
            ∧ isStale(...) = FRESH               (§10)
```

`forcePhases` is a **veto on the skip**, evaluated first and short-circuiting. It changes nothing else:

| Not overridden by forcing | Why |
|---|---|
| **AC-2.3's POSTMORTEM refusal** | §11.5 — the whole point of AC-4.6a |
| The round index (§4) | Forcing re-runs the phase at the *next* round index, appending `-v{N+1}` cross-reviews. It does not re-use or overwrite an existing round (AC-1.4 forbids overwriting a cross-review file, §4's per-dispatch guard enforces it). |
| The approval record | Forcing does **not** delete, edit, or invalidate the tier-1 or tier-2 record. The prior approval stays on the branch as history; the new round produces its own record. |
| Phases not named | Every in-scope phase not in `forcePhases` evaluates the skip normally in the same run. Forcing `F` does not force `T`. |
| AC-4.7's out-of-scope phases | CR and DOD always run; there is nothing to force. |

**Reporting (AC-4.5).** A forced phase is reported as having **run**, with its reason naming the force:
`Ran (forced by operator — recorded approval overridden)`. It is visibly distinct from the `⏭` skip
marker the existing code already uses for a phase that was skipped (the `"⏭"` status passed to
`recordPhase` for Phase D's "Skipped — no load-bearing alternatives") and from a failed phase's `❌`.
An operator must be able to read the report and see that the force took effect; a forced phase that
reported identically to an ordinary run would leave the override unverifiable.

### 11.5 Refusal against an unresolved POSTMORTEM (AC-4.6a, carried through)

On the state that motivates both mechanisms — a recorded approval **and** an unresolved
`POSTMORTEM-{phase}-{feature}.md` — a force-run is **refused**.

| Step | Behaviour |
|---|---|
| 1 | **§12.4 owns the ordering and this section does not restate it.** The force veto removes the skip (§11.4), so the phase "would otherwise run", and *that* is what reaches §12.4 step 2's `checkPostmortem` |
| 2 | An unresolved POSTMORTEM for that phase ⇒ halt, with §12's halt reason and the POSTMORTEM's **Recommendation** section reproduced |
| 3 | The halt reason names **AC-2.4** as the next step, so a forcing operator is never left guessing |

**Retraction in place (SE-v1 F-01).** v1.0's step 1 read "The POSTMORTEM gate of §12 is evaluated
**before** the skip decision, so it is reached whether or not the phase was forced." That is wrong and
is withdrawn: it contradicts §12.4, AC-2.3b and E-26/AT-26, under which an *unforced* phase with an
approving fresh pair is skipped and the POSTMORTEM is only **named** in the report, never halted on.
The gate is reached because forcing removed the skip — not because it precedes it. §12.4 is the single
site that states the order.

**The rationale, carried through unchanged.** AC-2.3's refusal exists because a phase re-entered against
an unresolved disagreement wastes a whole budget on it (H-2) — and that is just as true when the
re-entry was requested deliberately. The resolution act is cheap, is already required to be
operator-visible, and leaves a record of *why* the disputed review was re-opened.

**AC-2.4 is the exclusive route, and this document adds no escape hatch.** An earlier draft offered a
force flag that could also clear a POSTMORTEM; the REQ withdrew it (AC-4.6a is the governing clause and
needs none, because AC-2.4's resolution act is itself the cheap, operator-visible bypass). A
`forcePostmortem`-style input is therefore **not** specified, and specifying one would be
non-conforming — it would be wrong twice over: it would re-open the H-2 budget waste and it would erase
the operator-visible record of the decision. Nothing in the pipeline resolves a POSTMORTEM on its own;
only a human editing the artifact does.

## 12. FSPEC-PMORT-01 — POSTMORTEM resolution marker and Recommendation extraction

**Linked requirements:** AC-2.2, AC-2.3, AC-2.3a, AC-2.3b, AC-2.4, AC-2.5. **Discharges O-3.**

### 12.1 The artifact and its current defect

`reviewLoop` in `orchestrate-dev.js` writes the POSTMORTEM by dispatching an agent whose prompt fixes
the section list: `Include the required sections: Phase, Iterations (5 — limit reached), Reviewers,
Pattern of Disagreement, Best-Guess Root Cause, Recommendation.` The path is
`docs/{feature}/POSTMORTEM-{phase}-{feature}.md`.

Two measured defects this section closes:

1. **Nothing ever reads it back.** There is no re-entry check anywhere in the module, which is H-2: a
   re-entered phase gets a fresh 5-iteration budget against the same unresolved disagreement.
2. **The halt claims a write that may not have happened.** `reviewLoop`'s `postmortemFailed` branch logs
   `WARNING: POSTMORTEM agent failed — artifact not written for phase ${phase}` and then
   `return { converged: false, iterations: 5, lastResults };` — the failure flag is **not in the return
   shape**, so the caller cannot distinguish the two cases. Separately, `checkConverged` builds
   `const postmortemPath = \`docs/{feature}/POSTMORTEM-${phaseId}-{feature}.md\`;` with the literal
   `{feature}` placeholder never substituted, and then never uses the variable — a dead template whose
   halt message asserts "POSTMORTEM written." unconditionally.

### 12.2 The resolution marker (AC-2.4)

A POSTMORTEM is resolved by an explicit, operator-visible act **recorded in the artifact itself**. The
marker is a line in the document:

```
RESOLVED: yes
```

| Aspect | Specification |
|---|---|
| Grammar | The literal `RESOLVED: ` at line start after trimming, followed by `yes` or `no`. Same grammar family as §6 and §8 (§2.3) — one shape, learned once. |
| Location | Anywhere in the document. Not position-constrained, because a human writes it by hand and a position rule would make a correct resolution fail on a formatting slip. |
| Uniqueness | Exactly one such line. Zero ⇒ unresolved. Two or more ⇒ **unresolved** (§12.3). |
| Default | Absent ⇒ unresolved. The POSTMORTEM the pipeline writes contains **no** `RESOLVED:` line, so a freshly written POSTMORTEM is unresolved by construction — no separate initialisation step to forget. |
| Who writes it | **Only a human.** Nothing in the pipeline writes, edits, or removes a `RESOLVED:` line. This is AC-2.4 verbatim: nothing in the pipeline resolves a POSTMORTEM on its own behalf. |
| Recommended companion | The POSTMORTEM template gains a `## Resolution` section for the operator to record *what* they changed. Its **prose is not parsed** — only the `RESOLVED:` line is. Requiring parseable prose would be a C-5 violation and would make a good-faith resolution fail on wording. |

**Why a marker in the artifact rather than deleting the file.** Deletion is indistinguishable from an
accident, destroys the record of the disagreement, and is un-reviewable in a diff. A marker keeps the
Pattern of Disagreement and Root Cause on the branch, where the next reviewer of that phase can read
them, and shows up in `git diff` as an affirmative operator act.

### 12.3 The gate: `checkPostmortem({ phase, feature })`

Evaluated at **phase entry**, before the phase's authoring or review dispatches.

| Disk state | Result | Effect |
|---|---|---|
| No `POSTMORTEM-{phase}-{feature}.md` | `{ present: false }` | Phase proceeds |
| Present, exactly one `RESOLVED: yes` | `{ present: true, resolved: true }` | Phase proceeds. The report notes the resolved POSTMORTEM was seen. |
| Present, no `RESOLVED:` line | `{ present: true, resolved: false, reason: "absent" }` | **Refusal** (§12.4) |
| Present, exactly one `RESOLVED: no` | `{ present: true, resolved: false, reason: "declared_unresolved" }` | Refusal |
| Present, two or more `RESOLVED:` lines | `{ present: true, resolved: false, reason: "duplicated" }` | Refusal — a contradictory document is not a resolution |
| Present, one line with a value outside `{yes, no}` | `{ present: true, resolved: false, reason: "unparseable" }` | Refusal |
| Present but unreadable — `_readFile` returns `null` | `{ present: true, resolved: false, reason: "unreadable" }` | Refusal. A POSTMORTEM whose existence is known but whose content cannot be read is treated as unresolved: the fail-closed direction. |

Presence is established by `await _checkFile(path)`; content by `await _readFile(path)` — both awaited
(C-2). `file_empty` from `_checkFile` counts as present-and-unreadable.

**Scope is the pair (phase, feature) — AC-2.3a, carried through.** An unresolved
`POSTMORTEM-R-{feature}.md` refuses re-entry to **Phase R only**. It does not refuse F, T, P, D or any
later phase. What gates a downstream phase is the approval state of its upstream document (§5, §10, and
the existing per-phase document gate), not the history of how that approval was reached. Making an
R-postmortem block every later phase would convert R-2's deadlock risk from a recoverable state into a
total stop; the trade-off is accepted and recorded as R-6.

### 12.4 Precedence against the skip (AC-2.3b, carried through)

**The AC-4 skip is evaluated first.** Ordering at phase entry:

| Step | Test | Outcome |
|---|---|---|
| 1 | §5 + §10: is there a same-round approving pair whose hash is `FRESH`, and is the phase not in `forcePhases` (§11)? | If **yes** ⇒ the phase is **skipped** |
| 2 | `checkPostmortem` | Only reached when the phase **would otherwise run** |

Because AC-2.3's refusal is conditioned on "the phase would otherwise run", a skipped phase gives it
nothing to refuse and the run proceeds. But the skip does **not** resolve anything:

- **The skip report must name any unresolved POSTMORTEM for that (phase, feature).** So
  `checkPostmortem` is still *evaluated* on the skip path — for reporting only, never to change the
  outcome. Its result appears in the skip line as `; unresolved POSTMORTEM at {path}`.
- Forcing (§11) removes the skip, which means step 2 is reached, which means a forced phase in this
  state is **refused**. That is AC-4.6a, and §11.5 owns it.

**The two reachable worked examples, carried through unchanged.**

| Case | State | Outcome |
|---|---|---|
| **A — pre-harvest, skip fires** | Phase R converged, pipeline has not reached Phase H, so the `CROSS-REVIEW-{role}-REQ-v{N}.md` pair is still on the branch with same-round approving verdict fields; an unresolved `POSTMORTEM-R-{feature}.md` is also present | **Phase R is skipped**, the run continues to Phase F, and the report names **both** the approval and the still-open POSTMORTEM |
| **B — harvested, skip does not fire** | `pdlc-workflow-distribution` at HEAD: `POSTMORTEM-R-pdlc-workflow-distribution.md` present, **zero** `CROSS-REVIEW-*` files (Phase H deleted all 62 — §4a A-7), and its LEARNINGS predates §9's approval record | The verdict is unreadable, AC-4.2a fails closed, Phase R **would run**, so AC-2.3 **refuses and halts**, reproducing the Recommendation. This is the correct outcome, not a defect. The operator's **sole** route is AC-2.4. |

Case B is also why §11's force surface is not an escape here: forcing overrides recorded **approval**,
of which there is none readable, so it would be a no-op even if AC-4.6a permitted it.

### 12.5 Recommendation extraction

The refusal reproduces the POSTMORTEM's `Recommendation` section verbatim.

| Aspect | Specification |
|---|---|
| Anchor | The first heading at any level whose text, trimmed and case-insensitively compared, equals `Recommendation` (permitting a numeric prefix such as `## 6. Recommendation`) |
| Extent | From the line after that heading to the line before the next heading **at the same or shallower depth**, or end of file |
| Transform | Trailing and leading blank lines stripped. Otherwise verbatim — no summarisation, no re-wrapping, no agent in the path (C-5) |
| Truncation | If the extracted text exceeds 4,000 bytes, the first 4,000 bytes are reproduced followed by `… [truncated; read {path}]`. A halt report is a report, not a document viewer, and an unbounded paste would bury the halt reason. |
| Heading absent | The field is the literal `(no Recommendation section found in {path})`. **Still a refusal** — a malformed POSTMORTEM does not become resolvable by being malformed. |
| Document unreadable | The field is `(POSTMORTEM unreadable at {path})`, and the refusal stands per §12.3 |

The section name is not new: it is already one of the six sections `reviewLoop`'s POSTMORTEM prompt
requires, so a POSTMORTEM the pipeline wrote will have it.

### 12.6 Halt shapes and structured fields (AC-2.2, AC-2.5)

`buildFinalReport({ feature, outcome, phases, artifactPaths, testSummary, harvestStatus, prUrl,
ciStatus, haltReason })` gains three fields, so a consumer never has to parse the reason string:

| Field | Value |
|---|---|
| `haltPhase` | The phase id, e.g. `"R"` |
| `postmortemPath` | The resolved path with `{feature}` **substituted** — e.g. `docs/foo/POSTMORTEM-R-foo.md` — or `null` when no POSTMORTEM exists |
| `postmortemStatus` | `"written"` \| `"write_failed"` \| `"unresolved"` \| `"none"` |
| `queueRow` | §13/§14's field: `"halted"` \| `"none"` \| `"error"` |

**AC-2.2's two write-time reasons must be distinguishable.** `reviewLoop`'s return shape is extended
from `{ converged: false, iterations: 5, lastResults }` to carry `postmortemWritten: boolean` — the
information the existing `postmortemFailed` local already holds but discards. The two halt reasons are
then:

| Condition | Reason string | `postmortemStatus` |
|---|---|---|
| POSTMORTEM agent succeeded and `_checkFile` confirms a non-empty file at the path | `Phase {P} did not converge after {MAX_REVIEW_ROUNDS} rounds{reviewerDetail}. Post-mortem written at {path}. Recover: resolve it per AC-2.4, then set the queue row back to pending.` | `"written"` |
| POSTMORTEM agent threw, **or** `_checkFile` reports the file missing/empty | `Phase {P} did not converge after {MAX_REVIEW_ROUNDS} rounds{reviewerDetail}. Post-mortem write FAILED — no artifact at {path}.` | `"write_failed"` |

Confirming with `_checkFile` rather than trusting the agent's return is deliberate: a write relayed
through an `agent()` call (`rtWriteFile` replies `"ok"` when written) is exactly the narration §4a A-7
shows to be unreliable, and AC-2.2's whole point is that the halt must not claim a write that did not
happen.

The **refusal** halt (§12.4) is a third, distinct shape:

```
Phase {P} refused: unresolved POSTMORTEM at {path} ({reason}).
Recommendation:
{extracted text}
Next step (AC-2.4): record an explicit resolution in the artifact — add a line `RESOLVED: yes` and
describe the resolution — then re-enter. If the queue row reads `halted`, set it back to `pending`
and commit (AC-2.7a).
```

Both halt reports name the recovery act, so an operator reading only the report knows the route
(AC-2.5, AC-2.7a).

### 12.7 The dead `postmortemPath` template

`checkConverged`'s `const postmortemPath = ...` never substitutes `{feature}` and is never read. It is
replaced by a substituted, used value feeding `postmortemPath` in §12.6's report fields. §17 carries the
anchored edit.

## 13. FSPEC-QUEUE-01 — Committing the halted queue row

**Linked requirements:** AC-2.1, AC-2.6, AC-2.7a, AC-3.5f. **Discharges O-4.**

### 13.1 The gap

`orchestrate-queue.js` already writes the row: `runPicked` calls
`await rewriteStatus(queuePath, entry.feature, "halted", ...)` when the delegated pipeline throws, and
`const newStatus = succeeded ? "awaiting-merge" : "halted";` afterwards. But `rewriteStatus(queuePath,
feature, status, readFileFn, writeFileFn)` **performs zero git operations** — it reads, rewrites and
writes the file, leaving the change uncommitted in the working tree. Neither orchestrator has any git
capability today: `main()`'s injection list in `orchestrate-dev.js` carries no `_git`, and
`rtDevInjections` supplies none.

So a halt today survives only as long as the working tree does. AC-2.1 requires it to survive the
process.

### 13.2 Who performs it, and how

A new injected seam, `_git(argv) → { ok, stdout, stderr }`, declared in §1.4. It **never throws**: a
non-zero exit is reported as `{ ok: false, stderr }`, because a git failure is a condition this section
must branch on, not an exception that would unwind the halt path and lose the reason.

| Aspect | Specification |
|---|---|
| Adapter implementation | `rtGit(argv)` — one `agent()` at `RT_IO_MODEL` with Bash, prompted to run exactly `git {argv joined}` from the repository root and return only a JSON object `{"ok":true,"stdout":"…"}` or `{"ok":false,"stderr":"…"}`. The same shape and the same defensive `JSON.parse`-in-`try` as `rtMergeWorktree` already uses, whose prompt likewise fixes an exact command and an exact JSON reply. |
| Argument form | An **array** of arguments, never an interpolated command string, so a feature name can never be read as a flag or a shell metacharacter |
| Injection | Added to `rtDevInjections`'s returned object alongside `_agent`, `_readFile`, `_checkFile`, … and to `QUEUE_ENTRY`'s injection list in `build-runtime.mjs` (which already passes `_writeFile: rtWriteFile`) |
| Await | Every call awaited (C-2) |
| C-5 | The agent runs one fixed command and relays an exit status. Every decision about what to do with that status is the script's. This is the same boundary `rtMergeWorktree` and `rtCheckCi` already sit on. |

**Who calls it.** The commit is performed by `rewriteStatus` in `orchestrate-queue.js` — the one function
that already owns every status write — so no call site can write a row without committing it. Making it
the caller's responsibility would guarantee the omission this section exists to fix, since there are
three call sites (`"in-progress"`, `"halted"`, and the terminal `newStatus`) and only two of them matter
for durability today.

### 13.3 The commit

Exactly two git invocations, in order:

```
git add -- docs/_queue/QUEUE.md
git commit -m "chore(queue): {feature} → {status}" -- docs/_queue/QUEUE.md
```

| Aspect | Specification |
|---|---|
| Message | `chore(queue): {feature} → {status}` — e.g. `chore(queue): pdlc-review-loop-hardening → halted`. Matches the repo's existing convention (`chore(queue): row 1 pdlc-workflow-distribution awaiting-merge → done`) so the history stays greppable. |
| Pathspec | The queue path only, passed after `--`. A bare `git commit -a` would sweep unrelated working-tree changes into a queue-status commit; the `-- {path}` form commits **only** that file even when the tree is dirty. |
| Scope | Applied to **every** status write, not only `halted`. `in-progress` and `awaiting-merge` become durable too, which is a strict improvement and avoids a second, divergent code path. |
| Push | **Not** performed. The halt must survive the *process*, which a local commit achieves; pushing is a network act with its own failure modes and is not what AC-2.1 asks for. |
| Which halt classes | Both. AC-2.1's obligation is not conditional on a POSTMORTEM existing — an AC-3.5f authoring-budget halt writes no POSTMORTEM (§15.6) and still commits the `halted` row. |

**Dirty working tree.** Explicitly **not** an error and explicitly **not** cleaned. A halted pipeline
very often leaves a partially written document in the tree — that is the committed-partial-progress
AC-2.7a relies on for resumption — so stashing, resetting or refusing would destroy the state the
recovery path needs. The pathspec form makes the dirty tree irrelevant: only `QUEUE.md` is staged, and
`git add -- {path}` stages that file's current content regardless of what else is modified.

**One edge case with a definite answer.** If `QUEUE.md` is already staged with *other* changes to the
same file (an operator mid-edit), the commit captures those too. This is accepted rather than guarded:
detecting it requires a diff-vs-index comparison whose only available action would be to refuse, and
refusing would lose the halt. The commit message names the status change, so the extra content is
visible in review.

### 13.4 Failure catalogue

| Failure | Detection | Behaviour |
|---|---|---|
| The row write itself failed (`_writeFile` error) | `_writeFile` rejects or `_git add` reports the path unchanged | **Surfaced**: the halt report carries `queueRow: "error"` and the reason gains `; queue row write FAILED`. The pipeline still halts with its original reason — the halt is not replaced by the bookkeeping failure. |
| `git add` fails | `{ ok: false }` | As above |
| `git commit` fails — pre-commit hook rejection, no identity configured, index lock | `{ ok: false, stderr }` | **Non-fatal but surfaced.** `queueRow: "halted (uncommitted)"`, and the reason gains `; queue row set to halted but the commit FAILED: {stderr first line} — commit docs/_queue/QUEUE.md manually before re-running the queue.` The row is correct on disk; only its durability is lost, and the operator is told exactly what to do. |
| `git commit` fails with "nothing to commit" | `{ ok: false }` whose stderr/stdout matches `nothing to commit` | **Success.** The row already read the target status and was already committed — the common case on a re-entry. Treated as `queueRow: "halted"`, no warning. Idempotence, not an error. |
| No git repository at all | `{ ok: false }` | Same as commit-failure: surfaced, non-fatal |

**Why a commit failure does not escalate.** The original halt reason is the operator-actionable
information; replacing it with a git error would hide *why* the pipeline stopped in order to report a
bookkeeping problem. Both are reported, the halt reason first.

### 13.5 Absent row (AC-2.6) — no longer a silent no-op

`updateQueueStatus(markdown, feature, newStatus)` ends `return markdown; // feature row not found` — the
measured H-2 defect: a status write against a feature with no row silently succeeds and returns the
document unchanged.

| Change | Specification |
|---|---|
| Return shape | `updateQueueStatus` returns `{ markdown, matched: boolean }` instead of a bare string. A caller cannot ignore the outcome by accident, and the existing "not found" comment becomes a value. |
| `rewriteStatus` behaviour on `matched: false` | Writes nothing, performs no git operation, and returns an error result |
| Surfacing | The run's outcome carries `queueRow: "error"`, and the reason gains `Queue row for feature {feature} not found in {queuePath} — status "{status}" was not recorded.` |
| Scope of the error | **Only when a write was attempted because a row was expected** — i.e. the `orchestrate-queue` path, which selected the entry from that very file, so an absent row means the file changed under the run |
| Not an error | A **direct** invocation, which never attempts the write at all — §14 |

The distinction matters because it is what keeps a direct invocation from being a double failure: the
error is reserved for a row that was expected and is missing, not for a feature that legitimately has no
row.

## 14. FSPEC-ROWLOC-01 — Locating the queue row on a direct invocation

**Linked requirements:** AC-2.1, AC-2.6, AC-2.6a, AC-2.7a. **Discharges O-5.**

### 14.1 The gap

AC-2.1 binds **both** entry paths: the `halted` row must be written and committed "whether the pipeline
was entered via `orchestrate-queue` or invoked directly on a REQ path". But `orchestrate-dev` knows
nothing about the queue. Its `main()` takes `reqPath` and a bag of injections; `QUEUE.md`, its parser,
`updateQueueStatus` and `rewriteStatus` all live in `orchestrate-queue.js`, and the dependency runs the
other way — the queue imports the pipeline (`import realMain from "./orchestrate-dev.js"`), and the
bundle wires the same direction (`_runPipeline: ({ reqPath }) => __dev.main({ reqPath,
...__devInjections })`).

So on the direct path there is no code that knows a row might exist.

### 14.2 Locating the row

The pipeline already derives the feature name from `reqPath`. Row location adds three steps, all on the
halt path only:

| Step | Action |
|---|---|
| 1 | Resolve the queue path: the default `docs/_queue/QUEUE.md` (`orchestrate-queue.js`'s `DEFAULT_QUEUE_PATH`). No new input — a direct invocation that wanted a different queue would be using the queue driver. |
| 2 | `await _readFile(queuePath)`. `null` (absent or unreadable) ⇒ **no queue**, go to §14.3's no-row case. |
| 3 | Locate the row by exact match on the `Feature` column against the derived feature name — the same match `updateQueueStatus` performs. Not found ⇒ §14.3's no-row case. |

**Direction of the dependency.** The row-locating and row-writing logic stays in
`orchestrate-queue.js`, and `orchestrate-dev` reaches it through a **new injected seam**,
`_recordHalt({ feature, status })`, defaulting to a no-op that reports `{ queueRow: "none" }`:

| Caller | What `_recordHalt` is |
|---|---|
| `orchestrate-queue`'s `_runPipeline` | A closure over the queue path and its own `rewriteStatus`, so a halt on the delegated run writes and commits the row through the one function that owns status writes (§13.2) |
| The bundle's `DEV_ENTRY` (direct invocation) | A closure the bundle builds over `__queue`'s row-locating helpers — the `orchestrate-queue.bundle.js` already inlines both modules, and the dev bundle inlines the queue module's row helpers for this purpose |
| A unit test / an absent queue | The default no-op |

This preserves the existing dependency direction: `orchestrate-dev` declares a capability it needs and
never imports the queue. Inverting it — having the pipeline `import` the queue module — would be a
circular import in the canonical sources (the queue imports the pipeline) and is not available.

### 14.3 No row for this feature (AC-2.6a, carried through)

A pipeline invoked directly on a REQ path for a feature with **no** queue row **does not attempt a status
write at all**. Therefore:

| Property | Value |
|---|---|
| Is AC-2.6's error raised? | **No.** AC-2.6 is reserved for a write *attempted* against an absent row — i.e. a row was expected. Nothing was expected here. |
| Does the run proceed? | Yes, normally |
| What does a halt report? | The structured field `queueRow: "none"`, meaning **"halt not recorded in a queue"** |
| Is it a failure? | No. A direct invocation is **never** a double failure — the halt reason stands alone, unaccompanied by a bookkeeping error about a row that was never supposed to exist. |

The three reachable direct-invocation states, all distinguishable in the report:

| Disk state | `queueRow` |
|---|---|
| No `QUEUE.md`, or `QUEUE.md` with no row for this feature | `"none"` |
| Row present ⇒ written and committed per §13 | `"halted"` |
| Row present, write or commit failed | `"error"` / `"halted (uncommitted)"` per §13.4 |

### 14.4 A bypass run is not the recovery act (AC-2.7a, carried through)

The recovery act for a `halted` row is stated once, in AC-2.7a: **a human edits the feature's row in
`docs/_queue/QUEUE.md` from `halted` back to `pending` and commits it.** No new status is introduced and
nothing in the pipeline performs this edit. It is the **only** act that recovers the queue.

An earlier draft offered a bypass as an equivalent — "an operator may bypass the queue for one run by
invoking `orchestrate-dev` directly on the REQ path, which touches no row (AC-2.6a)". That sentence is
**retracted** (v1.5, SE-v5 F-04), and this document states the surviving rule. It was wrong on two
counts, both measurable:

1. **It mis-cited AC-2.6a.** AC-2.6a is scoped to a feature with **no** queue row. This case is the
   opposite by construction: the row exists and reads `halted`, because §13 just wrote it. So §14.3's
   no-row clause does not apply, and the direct path here *does* find a row — meaning a bypass run that
   **halts again does write the row** (AC-2.1 binds the direct path explicitly).
2. **It does not recover.** A bypass run that **succeeds** writes nothing: `awaiting-merge` is set by the
   queue driver, not by `orchestrate-dev` (`runPicked`'s post-run write, `const newStatus = succeeded ?
   "awaiting-merge" : "halted";`). The row therefore stays `halted`, `selectNextPending` still finds no
   `pending` entry — its no-candidate reason is `"no pending entries (all done, awaiting-merge, blocked,
   or halted)"`, and `QUEUE_STATUSES`' header comment states that only `pending` entries are eligible for
   pickup — so **every other feature in the queue stays idle** until the row is edited (§4a A-10).

**The surviving rule.** A bypass resumes **this feature only**, and leaves the queue in exactly the state
that made the recovery act necessary. It is a legitimate way to make progress on one feature out of
band; it is **not** a way to avoid the row edit, and the row edit is still required before the queue runs
again.

**What the pipeline refuses until then.**

| Halt class | Under `orchestrate-queue` | After the row is `pending` again |
|---|---|---|
| **POSTMORTEM** halt | The feature is not picked up and the run reports `idle`, not an error | Re-entry to the halted phase is **still refused** by §12 until AC-2.4's resolution act is performed in the artifact |
| **AC-3.5f** authoring-budget halt | Same: not picked up, run reports `idle` | Returning the row to `pending` is **sufficient** — no POSTMORTEM is written (§15.6), so the phase resumes from committed partial progress |

Both halt reports name this act as the next step (§12.6, §15.4), so an operator reading only the report
knows the route.

## 15. FSPEC-PACE-01 — Authoring pacing, resume prompt, and commit cadence

**Linked requirements:** AC-3.1, AC-3.1a, AC-3.2, AC-3.2a, AC-3.2b, AC-3.3, AC-3.5 (scope a–d),
AC-3.5a–AC-3.5g, AC-3.6. **Discharges O-6, O-19 (placement half) and O-20.**

### 15.1 The wrapper and the episode

`dispatchAndVerify({ episode, prompt })` wraps one dispatch loop. An **episode** is the tuple fixed by
AC-3.5c:

```
episode = artifact set × phase × round index × mode × invocation
```

Four of the coordinates were each corrected against a measured defect: dropping *round* makes a healthy
five-round convergence hit a six-dispatch cap (1 + 5 = 6); dropping *invocation* makes a re-entered phase
trip on entry; treating the two documents of a TSPEC+DECISIONS dispatch as separate episodes makes a
dispatch correctly advancing one score no-progress on the other.

**`mode` is the fifth coordinate, added at v1.1 (TE-v1 F-04).** AC-3.5c's four-coordinate tuple does not
separate round 1's *greenfield* authoring episode from round 1's *revision* episode: within one invocation
of Phase F they share artifact set, phase, round index and invocation, yet §15.2 rule 2 has the revision
pass re-enter "the same round". Under the four-coordinate reading a greenfield pass that legitimately used
4 dispatches on a large FSPEC would leave the round-1 revision pass 2, and a normal 3-dispatch revision
pass would halt the phase on `MAX_AUTHORING_DISPATCHES`. Adding `mode` makes the tuple agree with this
section's own opening sentence — **one `dispatchAndVerify` call is one episode** — which is the reading the
arithmetic requires. This is a refinement of AC-3.5c's key, not a change to either counter's value or to
what they bound.

**The wrapped population (AC-3.5 scope (a)), carried through by name:**

| Dispatch | Wrapped | Artifact set |
|---|---|---|
| `pm-author` / `se-author` / `te-author` on a spec document | **Yes** | that document; plus a conditionally required second document written by the same dispatch (TSPEC + DECISIONS) as **one set** |
| `pm-review` / `se-review` / `te-review` | **Yes** | its own `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` |
| `dod-verify` | **Yes** | `CODE_REVIEW-{feature}-v{N}.md` |
| `harvest-learnings` | **Yes** | `LEARNINGS-{feature}.md` |
| Phase I batches (`tech-lead` → `se-implement`) | **No** — bounded by the PLAN's batch structure and existing Phase I accounting | — |
| Phase DOD remediation (`se-implement` on `CODE_REVIEW-*`) | **No** — bounded by `DOD_MAX_ITERATIONS` (declared as `const DOD_MAX_ITERATIONS = 3;`), each round of which re-runs the wrapped `dod-verify` | — |
| `ship-pr`, the CI poll loop, anything writing no artifact | **No** — their own existing bounds | — |

Code-writing dispatches are excluded **deliberately**: they edit an open-ended set of source and test
files, so "the artifact", its structural completeness and the byte-change comparison are all undefined
for them. Bounding a stall-killed *code* dispatch is a real gap and is **D-RLH-05** — out of scope here
and not half-specified. AC-3.6's per-call byte budget and AC-3.2b's commit cadence still bind those
agents, because those are agent-directed obligations needing no pre/post measurement.

**Membership of the set.** Terminal requires every member the phase *actually requires*. A DECISIONS
the phase's own warrant check does not require is **not a member** — that check's result is bound to the
local `decisionsWarranted` alongside `parseDecisionsWarranted`. (v1.4 cited a
`decisionsWarranted(...)` function; no function of that name exists at HEAD `0655387` — the mechanism is
real, the name was not.)

### 15.2 Mode selection (AC-3.5 scope (d))

Selected **once, at episode entry**, from **what the phase is dispatching an author to do** — never from
the artifact's completeness:

| Mode | Selected when | Prompt every dispatch carries |
|---|---|---|
| **Revision** | the phase is dispatching an author to address the findings of a review round that exists on the branch for this (feature, doc type) — decided from the review artifacts §4 already enumerates, **regardless of the artifact's structural state** | §15.5's continuation prompt |
| **Greenfield** | **no** findings-bearing round exists — the phase's first authoring dispatch | §15.5's resume/first-attempt prompt |

Four rules, carried through:

1. **The revision test is evaluated first.** Completeness is consulted only when no findings-bearing
   round exists, so completeness can never move an episode out of revision mode.
2. **Which round.** The highest round index §4 finds for that (feature, doc type) whose review artifacts
   do **not** carry same-round dual approval — the round still owed an authoring pass. A resuming
   invocation therefore re-enters the **same** round and re-derives its findings from the surviving
   `CROSS-REVIEW-*` files. §4's `max + 1` derivation governs the **next reviewer** dispatch, which
   happens only after this episode reaches terminal.
3. **Non-authoring wrapped dispatches are always greenfield.** A review, `dod-verify` or
   `harvest-learnings` episode is never dispatched to address findings in its own artifact — each writes
   a new file — so the revision test cannot match. Such episodes need **no** completion trailer and
   their terminal test is structural completeness alone.
4. **Fail toward revision.** If review artifacts for that round exist but their verdict fields are
   unreadable (§6's fail-closed case), the episode is a **revision** episode. The directions are not
   symmetric: mis-entering greenfield silently drops a whole review round, while mis-entering revision
   costs at most a continuation prompt naming findings already reflected — priced as R-10, and
   terminated in one dispatch by §8's trailer.

Stickiness is a **consequence**, not the mechanism: the selection is made once and does not change for
the life of the episode, whatever later measurements observe. Episode entry is the same instant the
counters start at zero, so mode, prompt kind and counters share one scope.

**The retracted derivation, stated so it is not reinstated.** v1.3 selected mode from the pre-dispatch
measurement on **every** dispatch; v1.4 made it sticky **within** an episode but still derived it from
the artifact's structural state at entry. Both are withdrawn. v1.4's own recovery path walks straight
through its stickiness: a revision dispatch killed after breaking structural completeness → the episode
exhausts `MAX_AUTHORING_DISPATCHES` → the phase halts and commits `halted` → the operator resets the row
→ the resuming invocation is a **new** episode, re-selects from disk, finds an incomplete document, and
enters **greenfield**. Every re-dispatch then carries a resume prompt naming **no findings**, greenfield
terminal fires on structural completeness, and the wrapper reports success on a round whose findings were
never addressed. The halt path is not even required — any kill of the top-level invocation mid-revision
reaches the same state. The information to classify it correctly was on disk and simply unread: the
round's `CROSS-REVIEW-*` files survive until Phase H (§4a A-7) and §4 already reads them.

### 15.3 The one progress predicate (AC-3.5a)

```
progress := bytes(any member of the artifact set) changed between the pre-dispatch and
            post-dispatch measurement — including a member coming into existence
```

**One predicate, mode-independent.** Any difference in content counts. The referent of both
measurements is the **working tree** (AC-3.5c), read through `await _readFile(...)`.

Two named sub-cases are retained **for reporting only**, never as separate tests: a
**section-completion** (the count of top-level sections satisfying §16's criterion strictly increased —
the count §15.4 reports) and a **skeleton creation** (no artifact existed before, one exists after).
Both are strictly subsumed by the byte-change predicate.

**Why the mode-specific limbs are retracted (v1.5 TE-v5 F-05).** v1.4 restricted the byte test to
revision mode and gave greenfield only section-completion and skeleton creation. But AC-3.1 mandates
that a section larger than `MAX_AUTHORING_WRITE_BYTES` is **split across successive calls**, so a
greenfield dispatch killed part-way through an over-budget section has produced bytes and completed
**no** satisfying section: the predicate said no-progress while AC-3.5c's referent clause said progress.
Three such kills on one large section — exactly §H-3's shape — exhausted `MAX_AUTHORING_ATTEMPTS`
against a visibly growing artifact. Extending the byte test to both modes removes the contradiction and
the false halt at once, and leaves mode governing only what it should: prompt kind and terminal test.

**Why the working tree and not HEAD.** Scoring uncommitted bytes as no-progress would count a successful
write against the stall budget and would make the counters disagree with §15.5's resume determination,
which reads the same working tree. Under the one-commit-per-section cadence the two states normally
coincide; where they diverge, the working tree governs and the uncommitted remainder is committed by the
continuation dispatch. **No `git` operation performed by the pipeline may discard uncommitted artifact
content** (O-20) — no `checkout --`, no `reset --hard`, no `stash` on an artifact path.

**Two false positives permanently excluded.** A **heading-presence** predicate is constant from write 1
onwards, because AC-3.1 requires the first write to lay down all top-level headings, so it would score
every healthy filling dispatch as no-progress. A **section-count** predicate is saturated from above on a
revision dispatch — the document is already complete, so the count cannot strictly increase however
correct the edit — so section-counting alone would score every feedback-addressing dispatch as
no-progress and halt every phase at the third round.

**What the weak predicate costs.** A pathologically unproductive but non-silent agent never trips the
consecutive counter. That cost is bounded by `MAX_AUTHORING_DISPATCHES` and accepted as **R-9**. What it
buys is that the only dispatch scored no-progress is one that produced **no bytes at all** — precisely
the stall-killed state the counter exists to catch.

### 15.4 The three actions, the counters, and the report

**Evaluated terminal first, then progress** (§8.4 owns the terminal test). Exactly one action per
dispatch:

| Evaluation | Action |
|---|---|
| **Terminal** | Stop, report success, the phase proceeds |
| **Progress, not terminal** | Reset the consecutive counter to zero; re-dispatch with the **mode-fixed** prompt (§15.5), subject to the cumulative budget |
| **No progress, not terminal** | Count one failed **script-owned** attempt; re-dispatch with the same mode-fixed prompt, unless a budget is exhausted |

**No branch re-issues an unmodified original prompt.** This is the branch a mid-edit kill lands on, and
re-issuing the round's original feedback prompt verbatim would instruct work already done.

**The two counters (AC-3.5c), both terminal, whichever is reached first:**

| Constant | Bounds | Default | Reset |
|---|---|---|---|
| `MAX_AUTHORING_ATTEMPTS` | **consecutive** no-progress dispatches within one episode | **3** | to zero by **any** dispatch that makes progress |
| `MAX_AUTHORING_DISPATCHES` | **total** dispatches, progress or not, within one episode | **6** | per episode |

**Reset scope, explicitly:** both counters are **per episode**. They start at zero at the beginning of
every episode, and therefore reset on each new review round, on each **change of mode within a round**
(the greenfield→revision transition of §15.1), and on each fresh invocation of the
phase. Neither is persisted to disk or carried across invocations — a phase re-entered by an operator
continues from committed partial progress with a **full** dispatch budget. Only the POSTMORTEM state of
§12 persists, and §15.6 establishes that budget exhaustion writes none.

**Consistency with the round budget, shown.** The two constants bound the same loop at different
granularities: worst-case dispatches for one artifact in one phase in one invocation is
`MAX_REVIEW_ROUNDS × MAX_AUTHORING_DISPATCHES` = 5 × 6 = **30**, and the worst-case consecutive-stall run
inside any one episode is 3. A healthy five-round convergence uses one or two dispatches per episode and
approaches neither bound.

**The exhaustion report (AC-3.5d).** Names the phase, the artifact, **which** budget was exhausted, and
the actual counts:

| Budget | Report text |
|---|---|
| `MAX_AUTHORING_ATTEMPTS` | `Phase {P}: no progress across {N} consecutive attempts on {artifact} ({S} of {T} sections complete).` |
| `MAX_AUTHORING_DISPATCHES` | `Phase {P}: {M} dispatches without reaching structural completeness on {artifact} ({S} of {T} sections complete).` |

Plus, in both cases: `No POSTMORTEM was written.` and the recovery act — `Recover: set the {feature} row
in docs/_queue/QUEUE.md back to pending and commit (AC-2.7a); the phase resumes from committed partial
progress.` It does **not** offer a direct `orchestrate-dev` invocation as an *alternative* to that act;
if it mentions the bypass at all it must say what §14.4 says — the bypass resumes this feature only and
leaves every other queue feature idle.

`N` and `M` are always the **script's own** counts. The runtime's internal retry count is explicitly
**not** claimed, reported, or depended upon (§4a A-2/A-3); observing it is **D-RLH-04**.

**The fault-observed boolean, defined over the observable evidence (TE-v1 F-06).** v1.0 said only that
"whether a dispatch **fault** was observed is reported … as a boolean, without classifying which of §4a
A-8's three surfacings occurred", which left the boolean's *value* undecidable for two of the three
surfacings — nothing distinguishes a killed dispatch that returned no trailer from a healthy agent that
merely omitted one. The definition is therefore narrowed to what the wrapper can actually see:

> `faultObserved` is **true** iff the wrapper **caught a throw** from the dispatch, and **false**
> otherwise. The report states the definition alongside the value, so the field is never read as "a fault
> occurred" when it can only mean "a throw was caught".

This preserves AC-3.5e's substance — the three surfacings still reach the *same* non-terminal conclusion,
and the wrapper still never classifies a fault to decide anything — while making the reported field
decidable. The two non-throw surfacings are covered instead by the trailer reason below, which is the
honest surface for them.

**The trailer reason is echoed in the report (TE-v1 F-07).** §8.3's four reasons —
`declared_incomplete`, `absent`, `duplicated`, `unparseable` — are reported per dispatch, verbatim,
alongside the counts. That is their consumer, and it is what makes them falsifiable: an implementation
returning a constant `absent` for all four inputs now fails an acceptance test. The reason changes **no**
control flow — §8.3 already gives all four the same non-terminal outcome — so this is a reporting
obligation only. A `declared_incomplete` dispatch is thereby visible in the report as a *reported
continuation* rather than as an unexplained re-dispatch, which is the property §8.2 claimed for the
two-value catalogue and did not previously deliver.

**One further report obligation (AC-3.5 scope (c)).** When the wrapper reaches terminal on a
`LEARNINGS-{feature}.md` that carries **no** approval record, the run report names it — so §9.7's
fail-closed consequence is operator-visible at the moment it is incurred rather than discovered at the
next re-entry.

### 15.5 The two prompt kinds (O-6, AC-3.3, AC-3.5g)

**Greenfield — the resume-aware prompt.** "Retry" is determined **from artifact state on disk before
dispatch**, never from a runtime attempt counter (§4a A-2/A-3):

| Pre-dispatch disk state | Prompt form |
|---|---|
| No artifact, or an artifact with no top-level headings | **First attempt.** "Write the skeleton first: all top-level section headings, no prose. One whole-file write is acceptable for the skeleton only." |
| A partial artifact with headings present and at least one section not satisfying §16's criterion | **Resume.** Carries the resume clause below. |
| Structurally complete | Terminal — not dispatched |

The resume clause names the section, so the agent does not have to re-derive it:

```
This is a RESUMED attempt. The document already exists on disk with {S} of {T} top-level sections
written. The first unwritten section is "{heading text}". Read the file, then continue from that
section. Do NOT restart from an empty file and do NOT rewrite sections already written.
```

**How the first unwritten section is determined — by the script, not the agent.** Walk the artifact's
top-level headings in document order and return the **first** whose body does not satisfy §16's criterion
for that artifact class. Definite in every case:

| State | Result |
|---|---|
| Some heading has an unsatisfying body | that heading — the common case |
| **Every** heading satisfies the criterion but the artifact is not terminal (a required member of the set is absent) | the field is `(this document is complete; the outstanding artifact is {other member})` |
| Headings cannot be parsed at all | the field is `(unknown — read the file and continue from the first section lacking prose)`, and the dispatch still proceeds. A degraded prompt is better than a refusal: the agent can read the file. |

Determining it in the script rather than asking the agent is deliberate — it is a mechanical scan over
disk state, so C-5 requires the script to own it, and it means a stall-killed agent that never got to
read the file still receives the answer.

**Per-class mapping (TE-v1 F-05).** The heading walk above is stated over §16.2's per-heading criterion,
which only the six **spec** classes have. §16.3–§16.5 are whole-file criteria, so for the other three
wrapped classes — which are the numerically dominant population, §16.6 — the `{heading text}` field is
defined directly rather than by walking:

| Wrapped class | `{heading text}` for the resume clause |
|---|---|
| Spec documents (§16.2) | the heading walk above |
| Cross-review (§16.3) | `(the trailing "## Verdict" section)` — the one thing its criterion requires, and the thing a partial cross-review is by definition missing |
| Code-review (§16.4) | the first of its two required markers that is absent — `(the "Scope:" field)` or `(the findings section)` |
| LEARNINGS (§16.5) | §16.2's body rule already applies to its five numbered sections, so the heading walk runs over those; when all five are satisfied, `(the metadata table's "Harvested from" row)` if that is what is missing |

In every case the field is a definite string, so the resume prompt is never emitted with an undefined
field. The degraded `(unknown — …)` form of the third row above remains the fallback for an artifact whose
structure cannot be parsed at all.

**Scope, narrowed at v1.5 (SE-v5 F-01).** This determination is a **within-greenfield** question only: it
chooses between the resume and first-attempt forms of a *greenfield* prompt. It does **not** select the
episode's mode (§15.2 does). A structurally incomplete document can therefore no longer pull a revision
episode onto this path and hand it a prompt naming no findings.

**Revision — the continuation prompt.** In revision mode there is no "first unwritten section", and
re-issuing the round's original feedback prompt verbatim is not acceptable either: the artifact may
already carry some of that round's edits, so re-issuing instructs work already done and can double-apply
it, once per remaining dispatch, with the byte-change predicate resetting the consecutive counter each
time. **Every** revision dispatch — the episode's first as well as every re-dispatch — carries a
continuation prompt with four clauses:

| # | Clause |
|---|---|
| 1 | Names the **same round's findings** the episode was entered with, by cross-review path and finding id. The findings are never dropped or narrowed between dispatches of one episode. |
| 2 | States that the document has been **partially edited by an interrupted earlier attempt of this same round**, and instructs the agent to address only findings **not already reflected** in the document as it stands. The prompt is idempotent by construction; re-application is an **error**, not a no-op. |
| 3 | Requires the agent to determine what is already reflected from the **document on disk**, not from the prompt — the script cannot know which findings were applied (§4a A-9: it sees content, never the calls that produced it). |
| 4 | Requires the **revision-completion trailer** of §8, emitted last. |

**This one *is* script-decidable, unlike the byte budget.** It is a prompt-contract obligation on the
script, checkable by inspecting the prompt the script emits: a revision-mode dispatch whose prompt lacks
the continuation clause or the trailer requirement is a defect, and an oracle can assert it directly.
Residual risks: an agent mis-judging what is already reflected is **R-10**; an agent emitting the trailer
prematurely is **R-12**.

### 15.6 Budget exhaustion writes no POSTMORTEM (AC-3.5f)

An exhaustion of either budget **halts the phase** with §15.4's report and **does not write
`POSTMORTEM-{phase}-{feature}.md`**.

| | POSTMORTEM records | Authoring-budget exhaustion records |
|---|---|---|
| Nature | a **reviewer disagreement** a fresh round budget cannot resolve (H-2) | a **mechanical** failure to produce bytes |
| Recovery acts needed | **two** — the queue-row reset **plus** §12.2's resolution act inside the artifact, because §12 refuses the phase until then and §11.5 makes that the exclusive route (a force-run is refused too) | **one** — the queue-row reset (AC-2.7a) — after which the phase runs |
| Lasting effect | permanently marks the feature with an unresolved disagreement that every later skip report must name (§12.4) | none at the phase level |

So writing a POSTMORTEM for a mechanical byte-production failure would attach the heavier,
artifact-level recovery — and the standing §12 refusal — to a merely large document. That is the wrong
classification and is **forbidden**.

**Two retracted rationales, replaced by the surviving ground.** v1.3 justified the split as "re-invoke
versus human-only recovery"; that is false as written and retracted, because the same clause commits the
row `halted`, and `halted` is outside `orchestrate-queue`'s pickup set (§4a A-10), so under the documented
entry point a bare re-invocation reports `idle` — **both** halt classes need a human act. v1.4 then added
that a bypassing operator "needs none"; that is true of the **phase** and false of the **queue**, and is
retracted (§14.4). The classification stands on **how many acts and where**, and on the fact that after an
authoring-budget halt the phase itself is *willing to run* while after a POSTMORTEM halt it *refuses*.

The halt is still terminal for the invocation, and it still sets and **commits** the queue row to
`halted` on §13's terms — AC-2.1's obligation is extended to this halt, so durability does not depend on
a POSTMORTEM existing. The halt is durable and legible without being self-refusing.

### 15.7 Constant placement (O-19, placement half) — and the missing oracle

Three constants, all declared as named constants at the top of `pdlc/workflows/orchestrate-dev.js`,
following the existing convention set by `const DOD_MAX_ITERATIONS = 3;`:

| Constant | Value | Placement |
|---|---|---|
| `MAX_AUTHORING_ATTEMPTS` | `3` | `orchestrate-dev.js`, beside `MAX_REVIEW_ROUNDS` (§17) |
| `MAX_AUTHORING_DISPATCHES` | `6` | same block |
| `MAX_AUTHORING_WRITE_BYTES` | `12000` | **Both** — as a constant in `orchestrate-dev.js` (so §15.8's proxy check has one referent) **and** stated numerically in the authoring-pacing section of each of the three author SKILLs (so the agent bound by it can read it). The SKILL text cites the constant by name so the two cannot silently diverge. |

`MAX_AUTHORING_ATTEMPTS` and `MAX_AUTHORING_DISPATCHES` are **script-owned counters**, never the
runtime's. `MAX_AUTHORING_WRITE_BYTES` is **agent-directed only**.

**The statement O-19(a) requires, stated plainly: there is no oracle for emitted bytes, and this
document does not pretend otherwise.** Emitted bytes per tool call are not observable from any seam this
repo has (C-1, §4a A-1/A-2, and §4a **A-9**, which is the measurement): the wrapper's only evidence is the
artifact on disk after a dispatch, from which the number and shape of the calls that produced it cannot
be recovered. AC-1.4's "prompt text alone does not satisfy this AC" bar is deliberately **not** met for
AC-3.1/AC-3.1a, and the reason is asymmetric in a way that matters: AC-1.4's obligation is decidable
from a file check, this one is not. An earlier draft's phrase "how the pacing bound is checked in review"
was **withdrawn** (TE-v3 F-03) precisely because no such check exists. TSPEC and PROPERTIES may not
assert a byte-level oracle; the two compensations of §15.8 are what a reviewer holds this bound to.

### 15.8 Commit cadence and the commit-diff proxy (O-20)

**The cadence is one commit per section write** (AC-3.2a). A single commit at the end of an attempt does
not satisfy AC-3.2, because it is exactly the state a stall-kill destroys.

| Aspect | Specification |
|---|---|
| Who is bound | **Every** agent bound by AC-3.6 — the three author SKILLs, the three review SKILLs, `dod-verify`, `harvest-learnings`, and the code-writing dispatches of Phase I and Phase DOD (AC-3.2b). Where an artifact is produced in a single sub-budget write, the cadence is satisfied trivially by the one commit that follows it. |
| Message form | `docs({artifact-kind}): §{N} {section title} — {one-line substance}` for spec sections; existing conventions elsewhere |
| Cost, stated honestly | Section-granular commits are **squash-invariant**, so the merged history is unchanged. But a rebase **replays each commit in turn**, so N per-section commits are N replay steps and N potential conflict points, and Phase DOD Step 0 halts the pipeline on conflict (`ship-pr`). v1.1's claim that the rebase is "unaffected" was wrong. The cadence is still right — a single end-of-attempt commit is what a stall-kill destroys — and the honest trade-off argues for **coarse top-level sections** rather than fine-grained ones, and for keeping conflict surface in mind when choosing AC-3.1's split points. |

**The proxy check.** Under this cadence the commit series *is* on-disk evidence of write granularity:

| Aspect | Specification |
|---|---|
| Measurement | For each commit the episode produced touching an artifact path, the size of its diff — added plus removed bytes on artifact paths only, via `_git(["diff", "--numstat", ...])`-class inspection, awaited |
| Threshold | `MAX_AUTHORING_WRITE_BYTES` |
| On exceed | **Reported** as a pacing-contract violation in the run report: `Pacing proxy: commit {sha} changed {B} bytes of {path} (> MAX_AUTHORING_WRITE_BYTES = 12000) — likely an over-budget write.` |
| Effect on the run | **None.** It is advisory evidence of coarse pacing and **must not halt the run on its own.** |
| Honest limits, stated | It is a **proxy, not the bound**. It catches coarse pacing, and **cannot** catch a compliant-sized commit assembled from one oversized call — the case the bound actually forbids. It can also false-positive on a legitimate multi-call section committed once. |

**The compensating measurable control.** §15.4's script-owned counters are what actually bounds the cost
of a pacing failure, and they are fully measurable. A pacing violation therefore degrades to a
stall-killed dispatch that the wrapper counts, reports and terminates — the outcome §H-3 lacked — rather
than to an undetected breach. That is the honest claim this feature makes: not that the byte budget is
enforced, but that violating it is now **bounded and legible** instead of silent and unbounded.

**Amendment to the SKILL Git Workflow sections (AC-3.2a).** `pm-author/SKILL.md`'s
`2. **After completing:** write all artifacts to disk, stage, commit with descriptive messages, and push
to the remote branch.` and its three later `Commit and push.` lines instruct exactly the end-of-attempt
cadence AC-3.2 forbids. §17 carries the anchored edits for all three author SKILLs plus the three review
SKILLs, `dod-verify` and `harvest-learnings`.

## 16. FSPEC-COMPLETE-01 — Structural completeness per wrapped artifact class

**Linked requirements:** AC-3.4, AC-3.5 scope (c), AC-3.5b, AC-3.5d, AC-4.7a. **Discharges O-7.**

### 16.1 What this criterion is and is not

**Is:** the **terminal** test of §15.4 (with §8.4's trailer clause in revision mode), and the source of
the section count `{S} of {T}` that §15.4's report prints.

**Is not:** the progress predicate. §15.3 is a single mode-independent byte-change test and this section
may not redefine it (v1.5, TE-v5 F-05). In particular this criterion **can no longer make a partial write
score as no-progress** — the defect that halted a visibly growing artifact. Nothing here is counted for
progress purposes; the two named reporting sub-cases of §15.3 refer to this criterion, but the predicate
does not.

**The term.** AC-3.5 scope (c) names the unit **wrapped artifact class**, because "document type" was
already taken for the *reviewed* doc type of §4 and §9. There are four classes, and the six spec documents
are six of them.

### 16.2 Spec documents (six classes)

Common shape for all six: an artifact is structurally complete when **every** top-level `##` heading
declared in its skeleton has a **non-empty body** — at least one non-blank, non-heading line between it
and the next `##` heading (or EOF) — **and** the class-specific required headings below are all present.

| Class | Required top-level headings (by normalised title, numeric prefixes permitted) |
|---|---|
| **REQ** | Problem / Context, Goals, Non-Goals *(or Scope)*, Constraints, Acceptance Criteria, Risks, Obligations *(or Open Questions)* |
| **FSPEC** | Overview *(or Scope)*, Linked Requirements, Behavioral Flow, Business Rules, Edge Cases and Error Scenarios, Acceptance Tests, Open Questions |
| **TSPEC** | Overview, Architecture *(or Design)*, Interfaces, Data Model *(or State)*, Test Strategy, Open Questions |
| **PLAN** | Overview, Batches *(or Tasks)*, Dependencies, Verification |
| **PROPERTIES** | Overview, Properties, Oracles, Fixtures |
| **DECISIONS** | Context, Options Considered, Decision, Consequences |

| Rule | Specification |
|---|---|
| Heading matching | Case-insensitive, whitespace-normalised, a leading `N.` / `N)` numeric prefix ignored, and the parenthesised alternatives above are accepted as equivalent |
| Extra headings | Permitted and counted in `T`. A document richer than the minimum is not incomplete. |
| Order | **Not** required. Enforcing order would fail a legitimate reordering and adds nothing to the terminal question. |
| Missing required heading | Not complete, however much prose the rest carries |
| Artifact absent / empty | Not complete. Presence of a non-empty file is **never** sufficient (AC-3.4). |
| `T` and `S` for the report | `T` = count of top-level headings present; `S` = count with non-empty bodies. `T` is measured, not fixed, so a skeleton with extra sections reports honestly. |
| Placeholder bodies | A body consisting only of `TBD`, `TODO`, `_TBD_`, or an HTML comment counts as **empty**. Otherwise a skeleton written with placeholders would score complete on write 1. |

**Why heading-plus-non-empty-body and not something semantic.** The criterion has to be script-decidable
(C-5) over the only evidence available — the artifact on disk (§4a A-9). Anything richer would need an
agent in the terminal decision, which is the loop this feature exists to bound. The criterion is
deliberately shallow; §15.4's counters, not this test, are what bound a badly behaved episode.

### 16.3 Cross-review files (one class) — fixed at REQ altitude

A `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` is structurally complete when its trailing `## Verdict`
section (§6.2) carries **at least one `VERDICT: ` line whose value is in the catalogue**. This document
**implements** AC-3.5 scope (c)'s criterion; it does not choose a new one.

**Terminal and approving are two questions, not one (TE-v1 F-03).** v1.0 stated the criterion as "§6's
persisted verdict field, **parseable as exactly one** catalogue value", which made a *duplicated* verdict
field permanently non-terminal: the wrapper would re-dispatch to `MAX_AUTHORING_DISPATCHES` and then halt
the phase over a review the reviewer genuinely finished. That is the same false-halt class E-44 exists to
remove, so the "exactly one" clause is **withdrawn from the terminal test** and retained only in §6.3's
approval test:

| Trailing `## Verdict` section | Terminal (§15.4) | Approving (§5, §6.3) |
|---|---|---|
| One `VERDICT: ` line, catalogue value | **Yes** | per its value |
| **Two or more** `VERDICT: ` lines, at least one catalogue value | **Yes** — the reviewer reached the end of the file | **No** — §6.3's fail-closed branch; the phase runs |
| No `VERDICT: ` line, or no catalogue value among them | **No** — the episode continues | No |

No remediation prompt and no duplicate-deleting edit is specified: terminal-but-non-approving already
costs exactly one re-review, which is the same price every other unreadable-verdict state pays, and it
needs no new mechanism.

| Property | Consequence |
|---|---|
| The verdict field is written **last** (§6.2 puts `## Verdict` as the file's final section) | It is a sound terminal marker: its presence means the reviewer got to the end |
| It is the same check §6 already performs for approval | One parser, one meaning of "this review is finished" |
| A cross-review is written in one sub-budget call (AC-3.2b) | The write itself is progress under §15.3, terminal is decidable, and the wrapper does **not** re-dispatch a reviewer over a finished file |
| A re-dispatch onto a **partial** cross-review must **continue** it, not rewrite it | AC-3.1a — a whole-file rewrite of a document past the budget is forbidden outright |
| A re-dispatch nonetheless producing a **duplicated** verdict field | **Terminal** (the table above), and §6's fail-closed branch governs the approval: the phase runs. A duplicated verdict can **never** produce a skip, and can **never** halt the phase either. |

The `APPROVAL-HASH:` / `REVIEWED-COMMIT:` lines §7 appends are **not** part of this criterion. They are
written by the script *after* the review episode reaches terminal, so requiring them would make the
terminal test depend on a write that has not happened yet.

### 16.4 Code-review files (one class) — fixed at REQ altitude

A `CODE_REVIEW-{feature}-v{N}.md` is structurally complete when it carries:

1. the **`Scope:` field** — the same field `hooks/scripts/check-scope-field.sh` already warns about when
   absent, so this criterion and the existing hook agree on one marker; and
2. the **findings section** its skill mandates.

**AC-4.7a is unchanged and this document adds nothing: no verdict field is added to `CODE_REVIEW-*`.**
Phase DOD is out of AC-4's scope entirely (§10.7) — it reviews the tree, not a named document, and
produces no reviewer-pair cross-review — so a verdict field on it would carry no meaning and would invite
a skip the AC forbids.

### 16.5 LEARNINGS (one class) — and the exclusion

`LEARNINGS-{feature}.md` is structurally complete when it carries the harvest content
`harvest-learnings/SKILL.md` mandates: the metadata table including its `Harvested from` row, and its five
numbered sections each with a non-empty body (§16.2's body rule applies).

**The approval record of §9 is deliberately excluded from this criterion.** This is the answer AC-3.5
scope (c) gives to TE-v5 Q-02, and it aligns this section with AC-4.2c's standing decision that the
record is **best-effort**. Both clauses now point the same way rather than opposite ways.

**The accepted consequence, stated plainly.** A harvest killed after writing its prose but before writing
the record **reaches terminal, reports success**, and the feature lands permanently in §9.7's fail-closed
case — its phases run, at the cost of one re-review.

**The rejected alternative, and why.** Making the record part of the criterion would let a
record-writing bug re-dispatch harvest up to `MAX_AUTHORING_DISPATCHES` times and then **halt the phase**
over an optimisation's bookkeeping — the same objection AC-4.2c already sustained against tightening
`guard-harvest-before-delete` (§9.7).

**One addition so the outcome is not silent.** When the wrapper reaches terminal on a LEARNINGS carrying
no approval record, the run report names it (§15.4's final obligation), so the fail-closed consequence is
operator-visible at the moment it is incurred rather than discovered at the next re-entry.

### 16.6 Summary — the four classes and where each criterion comes from

| Class | Criterion | Origin |
|---|---|---|
| Spec documents (6) | §16.2 — required headings present, every heading non-empty | This document (O-7's own work) |
| Cross-review | §16.3 — one parseable verdict field | Fixed by AC-3.5 scope (c); implemented here |
| Code-review | §16.4 — `Scope:` + findings section | Fixed by AC-3.5 scope (c); implemented here |
| LEARNINGS | §16.5 — harvest content, **excluding** the approval record | Fixed by AC-3.5 scope (c) / AC-4.2c; implemented here |

An enumeration omitting the review artifacts would leave mode selection and the terminal test unevaluable
for **most** wrapped dispatches — the review artifacts are the numerically dominant wrapped population
(§4a A-7 counts 62 cross-reviews on one feature). All four classes are therefore covered above.

## 17. FSPEC-CONST-01 — Constant placement and the AC-5.1 / AC-5.2 edits

**Linked requirements:** AC-5.1, AC-5.2, AC-5.3, AC-5.4, AC-5.5, AC-1.6a. **Discharges O-16.**

**Citation baseline for this section: HEAD `0655387`.** Every edit below is anchored by **enclosing
symbol + distinctive literal**, never by line number, so it stays verifiable as the file moves. A bare
`file:line` citation is a defect in this document.

### 17.1 AC-5.1 — `MAX_REVIEW_ROUNDS`

The iteration cap is the bare literal `5` at **five** sites in `pdlc/workflows/orchestrate-dev.js`. It
becomes one named constant declared beside the existing flags, following the convention set by
`const DOD_MAX_ITERATIONS = 3;`:

```js
// TSPEC-ROUNDS-01: per-invocation review-round budget (AC-1.6a). Not an absolute
// round index — the gate and the reported counts derive from this plus the
// branch-derived starting index.
const MAX_REVIEW_ROUNDS = 5;
```

| # | Enclosing symbol | Distinctive literal at `0655387` | Edit |
|---|---|---|---|
| 1 | `checkConverged` | `recordPhase(phaseId, phaseLabel, "❌", \`Non-convergence after 5 iterations${reviewerDetail}\`, 5)` | The message names `rounds ${startIndex}..${endIndex}`; the trailing count argument becomes `MAX_REVIEW_ROUNDS` |
| 2 | `checkConverged` | `throw haltError(\`Phase ${phaseId} did not converge after 5 iterations${reviewerDetail}. POSTMORTEM written.\`)` | `after ${MAX_REVIEW_ROUNDS} rounds`, and the unconditional `POSTMORTEM written.` is replaced by §12.6's two conditional shapes |
| 3 | `reviewLoop` | `if (iteration > 5)` | `if (iteration > endIndex)` where `endIndex = startIndex + MAX_REVIEW_ROUNDS - 1` (§4) |
| 4 | `reviewLoop` | `Include the required sections: Phase, Iterations (5 — limit reached), …` | `Iterations (${MAX_REVIEW_ROUNDS} — limit reached)` |
| 5 | `reviewLoop` | `return { converged: false, iterations: 5, lastResults };` | `iterations: MAX_REVIEW_ROUNDS`, and the shape gains `postmortemWritten` (§12.6) |

**Why the gate is not simply `iteration > MAX_REVIEW_ROUNDS`.** AC-1.6a makes the constant a
**per-invocation budget**, not an absolute round index. On a branch whose highest existing round is 3, a
re-entered phase starts at round 4 and must get five rounds — 4 through 8 — not two. Sites 1 and 3
therefore derive from the constant **and** the starting index; only sites 4 and 5, which report a *count*
rather than an *index*, use the constant alone. Substituting the constant naively at all five sites is the
defect this clause exists to prevent, and it is the same class of defect as H-1.

### 17.2 AC-5.2 — the dead POSTMORTEM path template

In `checkConverged`, the declaration
`` const postmortemPath = `docs/{feature}/POSTMORTEM-${phaseId}-{feature}.md`; `` interpolates `phaseId`
but carries **literal, uninterpolated `{feature}` braces**, and the variable is never read.

**Disposition: made correct and made used.** The feature name is in scope at the call sites, so the
template becomes a real path — `docs/${feature}/POSTMORTEM-${phaseId}-${feature}.md` — and feeds §12.6's
structured `postmortemPath` report field and its two conditional halt reasons.

**The general rule this establishes: no un-substituted template reaches a report.** Any string built for
operator output whose `{`…`}` placeholders are not all substituted is a defect — the same rule §4 applies
to `reviewerPrompt`'s and `optimizerPrompt`'s `{DOC-TYPE}` literals. Deleting the variable would satisfy
AC-5.2's letter, but §12.6 needs the path as a structured field, so making it correct discharges both.

### 17.3 The whole change surface in `orchestrate-dev.js` and its siblings

Collected so a reviewer sees it in one place. Anchors at `0655387`:

| Enclosing symbol | Distinctive literal | Edit | Owner |
|---|---|---|---|
| module top | `const MODEL_DEFAULT = "opus";` | new constants block after it: `MAX_REVIEW_ROUNDS`, `MAX_AUTHORING_ATTEMPTS`, `MAX_AUTHORING_DISPATCHES`, `MAX_AUTHORING_WRITE_BYTES` | §15.7, §17.1 |
| `export const meta` | `name: "reqPath"` | second `inputs` entry, `forcePhases` | §11.2 |
| `export default async function main({ reqPath, _agent: rawAgentFn = agent, … })` | the destructured injection list, which today has **no** `_writeFile` | add `forcePhases`, `_writeFile`, `_appendFile`, `_listFiles`, `_git`, `_recordHalt` | §1.4, §11.2, §13.2, §14.2 |
| `export async function reviewLoop({ doc, phase, reviewers, optimizer, feature, iteration = 1, … })` | `iteration = 1` | callers pass the branch-derived `startIndex`; the seven existing call sites pass none | §4 |
| `reviewLoop` | `const gatePass = isPass(verdict1.verdict) && isPass(verdict2.verdict);` | logic unchanged; §5's approval search **reuses** `isPass` so the skip is neither stricter nor looser than the gate that produced the approval (AC-4.3) | §5 |
| `export function parseVerdict(result, skillName)` | `const VALID_VERDICTS = [...]` | unchanged; reused as-is on the file path, with §6.3's duplicate pre-count in front of it | §6 |
| `export async function recoverVerdict({ reviewer, rawResult, _agent = agent })` | the whole function | **not** reused on the approval path — an agent in that decision would breach C-5 and fail open | §6 |
| `function checkConverged(...)` | the `postmortemPath` template | §17.2 | §12 |
| `function buildFinalReport({ feature, outcome, phases, … haltReason })` | the destructured field list | add `haltPhase`, `postmortemPath`, `postmortemStatus`, `queueRow`; plus the skip / force / pacing-proxy report lines | §11.4, §12.6, §15.4, §15.8 |
| `function reviewerRoleSlug(skill)` | `const MAP = { "se-review": "software-engineer", … }` | add a reverse accessor; the slug catalogue stays derived from this one map | §4 |
| `function reviewerPrompt(...)`, `function optimizerPrompt(...)` | the two `{DOC-TYPE}` literals and `` `docs/${feature}/CROSS-REVIEW-${role}-{DOC-TYPE}-v${iteration}.md` `` | substitute the real doc type | §4 |
| `recordPhase("D", PHASE_DISPATCH.D.label, "⏭", "Skipped — no load-bearing alternatives")` | the `"⏭"` status | reused as the skip marker, so an AC-4 skip is visibly distinct from a run and from a `❌` failure (AC-4.5) | §11.4 |

**`orchestrate-queue.js`:** `export function updateQueueStatus(markdown, feature, newStatus)` (return
shape, replacing `return markdown; // feature row not found`), `async function rewriteStatus(...)` (the
commit), and `async function runPicked({...})`'s three status writes — `await writeFileFn(queuePath,
updateQueueStatus(queueText, entry.feature, "in-progress"))`, the `"halted"` rewrite, and
`const newStatus = succeeded ? "awaiting-merge" : "halted";`. All §13.

**`runtime-adapter.js`:** new `rtListFiles`, `rtAppendFile`, `rtGit`, and their addition to
`function rtDevInjections(devModule)` — which today returns `_agent, _parallel, _pipeline, _phase, _log,
_checkFile, _readFile, _checkCi, _mergeWorktree` and **no** `_writeFile`, even though `rtWriteFile` is
defined directly above it (§1.4).

**`build-runtime.mjs`:** `DEV_ENTRY` (read `args.forcePhases`, which its existing
`args && typeof args === "object" && args.reqPath` test already establishes as a supported shape) and
`QUEUE_ENTRY` (pass the new seams alongside its existing `_writeFile: rtWriteFile`). `stripModuleSyntax`
is unmodified and is what inlines §7's digest function without an `import`.

### 17.4 AC-5.3 — `pdlc/skills/orchestrate-dev/SKILL.md`

Today its **only** POSTMORTEM mention is the naming-convention aside in §Artifact Conventions (the
`CROSS-REVIEW-*`, `POSTMORTEM-*` list), and the only documented cap is the unrelated DoD one. Four
additive subsections:

| Subsection | Content |
|---|---|
| Review-round budget | `MAX_REVIEW_ROUNDS` = 5 as a **per-invocation budget**, the branch-derived starting index, and §4's `rounds {startIndex}..{endIndex}` log line |
| Non-convergence exit | That it is terminal, that it commits the `halted` queue row, and §12.6's two halt shapes including the write-failed one |
| POSTMORTEM | The six mandated sections, the `RESOLVED:` marker and who may write it, the (phase, feature) refusal scope, and that §15.6's authoring-budget halt writes none |
| Approved-phase skip | The two tiers, the same-round rule, the hash-equality staleness test, the `forcePhases` surface, and that CR and DOD are out of scope (AC-4.7) |

### 17.5 AC-5.4 — `pdlc/skills/orchestrate-queue/SKILL.md`

Its §Status lifecycle diagram shows `halted` as a **terminal leaf with no way out** — the branch
`└──pipeline halts / throws──▶ halted`. Edits:

| Edit | Content |
|---|---|
| Diagram | Add the return edge `halted ──human edits row to pending + commits──▶ pending`, so the leaf is no longer a dead end |
| New §Recovering a halted row | AC-2.7a's act verbatim — a human edits the row from `halted` to `pending` and commits; nothing in the pipeline performs this edit; it is the **only** act that recovers the queue. Plus what the pipeline refuses until then, per halt class (§14.4's table). |
| Same section | The bypass paragraph, stating the **surviving** rule of §14.4: a direct `orchestrate-dev` invocation resumes **this feature only** and leaves every other queue feature idle, because `awaiting-merge` is the queue driver's write and `selectNextPending`'s no-candidate reason is `"no pending entries (all done, awaiting-merge, blocked, or halted)"`. It is **not** a substitute for the row edit. |

No new status is introduced; `export const QUEUE_STATUSES = [...]` is unchanged.

### 17.6 AC-5.5 — the generated-artifact obligation

| Tier | Obligation |
|---|---|
| `pdlc/workflows/dist/` — **tracked** | Rebuilt with `node pdlc/workflows/build-runtime.mjs` and **committed in the same commit** as any change to `orchestrate-dev.js`, `orchestrate-queue.js` or `runtime-adapter.js`. `node pdlc/workflows/build-runtime.mjs --check` must pass. |
| `.claude/workflows/` — **untracked by decision** (DEC-DIST-02, §4a A-6) | **Never committed.** Its correctness is asserted separately, by `pdlc/hooks/scripts/sync-workflows.sh --check` exiting 0. |

The earlier wording required committing an untracked-by-decision path and would have landed a
`.gitignore` regression; the corrected two-tier statement above is the one that binds.

Because this feature touches all three bundle sources, **every** implementation commit that changes a
workflow source carries its rebuilt `dist/` artifacts. This is also why §15.8's per-section commit cadence
does not apply to `dist/`: generated artifacts are not authored sections.

## 18. Edge cases and error scenarios

Every row has a definite, specified outcome — DC-01's total-function requirement applied to the whole
feature. "Halt" means the run stops with an operator-facing reason; "phase runs" means the fail-closed
direction; "reported" means it appears in the run report without changing the outcome.

### 18.1 Discovery and round derivation (§3, §4)

| # | Condition | Outcome | Section |
|---|---|---|---|
| E-01 | **Clean branch — `docs/{feature}/` does not exist** (C-4: the feature's very first invocation) | `dir_missing` is **benign**: treated as an empty listing. Round index 1, greenfield mode, no approval, no skip. **No halt, no warning.** This is the common case, not an error. | §3 |
| E-02 | `docs/{feature}/` exists but is a file, is unreadable, or the seam is called with a bad argument | "Cannot judge" ⇒ one halt shape: `Cannot enumerate {dirPath}: {reason}` | §3 |
| E-03 | Directory contains a cross-review-shaped basename that does not conform to the grammar | **Skipped and reported** in the phase-entry log line (`skipped non-conforming: {names}`), not a halt | §4 |
| E-04 | Directory contains unrelated files (REQ, LEARNINGS, images) | Silently ignored | §4 |
| E-05 | Two conforming files for the same (role, doc type, round) — impossible by filename uniqueness, but a malformed *duplicate role segment* is not | Per-role malformed-duplicate **halt** at derivation step 5 | §4 |
| E-06 | Highest existing round is 3 on a re-entered phase | Rounds 4..8 — five fresh rounds, not two. The H-1 defect. | §4, §17.1 |
| E-07 | Role slug in a filename is not in the catalogue | Non-conforming ⇒ skipped and reported; the placeholder substitution degrades to a doc-type glob | §4 |

### 18.2 Verdict, approval and staleness (§5, §6, §7, §9, §10)

| # | Condition | Outcome | Section |
|---|---|---|---|
| E-08 | Cross-review has **no** `## Verdict` section | No verdict ⇒ not approving ⇒ **phase runs** | §6 |
| E-09 | Cross-review has **two** `VERDICT:` lines | Pre-count detects it ⇒ unparseable ⇒ **phase runs**. Never silently resolved by `parseVerdict`'s scan-from-end. | §6.3 |
| E-10 | Verdict value outside the three-member catalogue | Unparseable ⇒ phase runs | §6 |
| E-11 | Round N: SE approved / TE needs revision; round N+1: TE approved / SE finds more | **Phase runs.** Approvals from different rounds never combine. | §5 |
| E-12 | Round N: SE's `-vN` present and approving; TE's `-vN` **absent** | The absent role is **not approving** ⇒ phase runs. Tier 2 is **not** consulted to complete the pair. | §5, §9.6 |
| E-13 | `APPROVAL-HASH:` append fails after a successful review episode | Operator-surfaced error; the round yields **no approval**; the **current run continues** (it does not halt) | §7 |
| E-14 | Re-entry finds one `APPROVAL-HASH:` line already present and equal | Idempotent no-op | §7 |
| E-15 | Re-entry finds one present and **unequal**, or two or more present | Error surfaced; no approval from that round | §7 |
| E-16 | Anchor **commit** fails though the append succeeded | Non-fatal: the referent is the working tree, so the approval is intact. Reported. | §7 |
| E-17 | Document changed between approval and Phase H (a DOD remediation touching a spec) | Recorded hash is the round-N hash; the working tree differs ⇒ `STALE` ⇒ **phase runs**. The case a harvest-time hash would have laundered. | §9.4, §10 |
| E-18 | Reviewed document missing at comparison time | `_readFile` → `null` ⇒ `UNEVALUABLE` ⇒ phase runs | §10.3 |
| E-19 | Branch was rebased by Phase DOD Step 0, spec bytes unchanged | Approval **survives** — no sha, timestamp or ancestry is read | §10.6 |
| E-20 | Rebase conflict resolution altered the spec's bytes | `STALE` ⇒ phase runs. Correct: those bytes were not reviewed. | §10.6 |
| E-21 | Legacy feature: cross-reviews deleted, LEARNINGS predates the approval record | Neither tier ⇒ fail closed ⇒ phase runs. Accepted, **not** backfilled. | §9.7 |
| E-22 | LEARNINGS exists **without** the approval record | **Passes** `guard-harvest-before-delete` (not tightened), then fails closed. The falsifier is this direction, not the guard rejecting it. | §9.7 |
| E-23 | Tier-1 record present but its `APPROVAL-HASH:` is `unavailable` or ungrammatical | `UNEVALUABLE` ⇒ phase runs. No substitute value may be computed. | §10.5 |
| E-24 | Both tiers present for the same (doc type, round) and disagreeing | Unparseable ⇒ phase runs. No "most recent wins" rule. | §10.4 |
| E-63 | Candidate round: `APPROVAL-HASH:` present on the SE file, **absent** on the TE file (§7.4's failed append, or a kill between the two appends) | `UNEVALUABLE` ⇒ phase runs. Neither value is adopted; no anchor is assembled across roles. | §10.1, §10.5 |
| E-64 | Candidate round: `APPROVAL-HASH:` present on both files but the two values **differ** | `UNEVALUABLE` ⇒ phase runs; the report names both files and both values. No tie-break exists. | §10.1, §10.5 |
| E-65 | Round 2 dual-approving; a forced run produced round 3 whose two cross-reviews are **non-approving**, and the invocation ended before any authoring edit, so the document's bytes still hash to round 2's anchor | Round 3 is the **candidate**; it is non-approving ⇒ **no approval ⇒ phase runs**. Round 2 is never consulted. Without the highest-round-only rule this skipped the phase and discarded round 3's findings. | §5.1, §5.3 |

### 18.3 POSTMORTEM, force and queue (§11, §12, §13, §14)

| # | Condition | Outcome | Section |
|---|---|---|---|
| E-25 | Unresolved POSTMORTEM for phase R, and Phase R **would run** | **Halt**, Recommendation reproduced, next step names AC-2.4 | §12.4 (case B) |
| E-26 | Unresolved POSTMORTEM for phase R, and Phase R is **skipped** under §5/§10 | Phase **skipped**, run continues, report names **both** the approval and the open POSTMORTEM. The skip does not resolve it. | §12.4 (case A) |
| E-27 | Unresolved `POSTMORTEM-R-*` present, pipeline at Phase F | Phase F **unaffected** — refusal is keyed on (phase, feature) | §12.3 |
| E-28 | POSTMORTEM present with two `RESOLVED:` lines, or a non-catalogue value | **Unresolved** ⇒ refusal | §12.3 |
| E-29 | POSTMORTEM present but unreadable | Unresolved ⇒ refusal (fail closed) | §12.3 |
| E-30 | POSTMORTEM present, no `## Recommendation` heading | Refusal stands; the field reads `(no Recommendation section found in {path})` | §12.5 |
| E-31 | Recommendation exceeds 4,000 bytes | Truncated with `… [truncated; read {path}]` | §12.5 |
| E-32 | POSTMORTEM agent threw, or `_checkFile` finds nothing at the path | Halt reason says **write FAILED**, `postmortemStatus: "write_failed"`. The halt never claims a write that did not happen. | §12.6 |
| E-33 | `forcePhases` contains `CR` or `DOD` | **Rejected** before any phase runs, with the valid catalogue listed | §11.3 |
| E-34 | `forcePhases: "all,F"` | Rejected as ambiguous rather than coerced | §11.3 |
| E-35 | Forced phase whose POSTMORTEM is unresolved | **Refused** — forcing overrides recorded approval only | §11.5 |
| E-36 | Forced phase with a valid approval | Runs at the **next** round index; the prior approval record is left intact | §11.4 |
| E-37 | Working tree dirty when the `halted` row is committed | Not an error, not cleaned. The `-- {path}` pathspec commits only `QUEUE.md`. | §13.3 |
| E-38 | `git commit` fails (hook rejection, no identity, index lock) | Non-fatal, surfaced: `queueRow: "halted (uncommitted)"` plus manual-commit instruction. The **original halt reason comes first.** | §13.4 |
| E-39 | `git commit` fails with "nothing to commit" | **Success** — idempotent re-entry, no warning | §13.4 |
| E-40 | Queue-driven run whose feature row vanished mid-run | AC-2.6 **error** surfaced: `queueRow: "error"` — no longer a silent no-op | §13.5 |
| E-41 | Direct invocation, feature has **no** queue row | `queueRow: "none"`. No write attempted, **no error**. Never a double failure. | §14.3 |
| E-42 | Direct invocation on a feature whose row reads `halted`, run **succeeds** | Row stays `halted` — `awaiting-merge` is the queue driver's write — so **every other queue feature stays idle** until the row is edited | §14.4 |
| E-43 | Direct invocation on a `halted` row, run **halts again** | The row **is** written (AC-2.1 binds the direct path) | §14.4 |

### 18.4 Pacing wrapper (§8, §15, §16)

| # | Condition | Outcome | Section |
|---|---|---|---|
| E-44 | Revision dispatch writes nothing and emits `REVISION-COMPLETE: yes` | **Terminal.** The phase must **not** halt. The fully-converged round v1.4 falsely halted. | §8.4, §15.4 |
| E-45 | Revision dispatch killed after applying 3 of 5 findings; artifact structurally complete | **No trailer ⇒ not terminal.** Episode continues. | §8.3 |
| E-46 | Dispatch returns a value / returns nothing / throws | All three ⇒ same non-terminal conclusion, reached by **absence of a positive marker**, without classifying the fault. Fault observation is reported as a boolean. | §8.3, §15.4 |
| E-47 | Agent emits `REVISION-COMPLETE: yes` while a finding remains | **R-12**, accepted and bounded: the finding is still on the branch until Phase H, so the next round's reviewers re-raise it. Costs one round rather than losing one. | §8.5 |
| E-48 | Greenfield dispatch killed part-way through an over-budget section — bytes written, **no** section completed | **Progress** (byte-change predicate), counter resets. The v1.4 contradiction that halted a visibly growing artifact. | §15.3 |
| E-49 | Healthy 12-section document, one section per dispatch | Never halts: every dispatch is progress, so the consecutive counter never reaches 3 | §15.4 |
| E-50 | no-progress, no-progress, progress, no-progress | **Still running** — reset on progress | §15.4 |
| E-51 | Healthy five-round convergence, one dispatch per round | Never trips `MAX_AUTHORING_DISPATCHES`: counters are **per episode**, and a new round is a new episode | §15.1, §15.4 |
| E-52 | Phase re-entered by an operator after an authoring-budget halt, mid-revision | **Re-enters revision mode on the same round**, with the continuation prompt and that round's findings. Must **not** report terminal success on structural completeness alone. | §15.2 |
| E-53 | `se-author` dispatch advances TSPEC but not the conditional DECISIONS | **Progress** — progress in any member of the set. Terminal requires every **required** member. | §15.1 |
| E-54 | DECISIONS not warranted by the phase's own check | **Not a member** of the artifact set; its absence does not block terminal | §15.1 |
| E-55 | Pathologically unproductive agent that writes a byte each dispatch | Never trips the consecutive counter; bounded by `MAX_AUTHORING_DISPATCHES` = 6. **R-9**, accepted. | §15.3 |
| E-56 | Authoring budget exhausted | Halt, **no POSTMORTEM**, `halted` row committed, report names the queue-row reset as the single recovery act | §15.6, §15.4 |
| E-57 | Review episode re-dispatched onto a partial cross-review | Must **continue** it, never rewrite it (a whole-file rewrite past budget is forbidden). §4.5's no-overwrite guard is **not** re-evaluated on an intra-episode re-dispatch, so the continuation is reachable. | §16.3, §4.5 |
| E-58 | Re-dispatch produces a **duplicated** verdict field | **Terminal** (the reviewer reached the end), and fail closed on approval: phase runs. Never a skip, and never a halt. | §16.3, §6.3 |
| E-66 | A cross-review **quotes** the verdict grammar in prose or a fenced block (e.g. a review of §6.2), so the file contains two `VERDICT: ` lines but its trailing `## Verdict` section contains one | **Conforming.** The pre-count and `parseVerdict` read the trailing section only, so the quoted line is invisible and the verdict is used normally. | §6.2, §6.3 |
| E-67 | Revision dispatch emits `REVISION-COMPLETE: no` | **Not terminal**; the episode continues with the same continuation prompt, and the report echoes `declared_incomplete` — a reported continuation, not an unexplained re-dispatch | §8.3, §15.4 |
| E-68 | Revision dispatch emits **two** `REVISION-COMPLETE:` lines | Pre-count detects it ⇒ **not terminal**, reason `duplicated`, echoed in the report. Never silently resolved by scanning from the end. | §8.2, §8.3, §15.4 |
| E-59 | Harvest killed after prose, before the approval record | **Terminal, reports success**; the feature lands in the fail-closed case; the report **names** the missing record | §16.5 |
| E-60 | Skeleton written with `TBD` placeholder bodies | Counts as **empty** ⇒ not complete. Otherwise write 1 would score terminal. | §16.2 |
| E-61 | Per-section commit whose diff exceeds `MAX_AUTHORING_WRITE_BYTES` | **Reported** as a pacing-proxy violation; **does not halt** the run | §15.8 |
| E-62 | A compliant-sized commit assembled from one oversized call | **Undetectable.** Stated openly: there is no oracle for emitted bytes. | §15.7, §15.8 |

## 19. Acceptance tests

Who / Given / When / Then. Every test is executable against `pdlc/workflows/__tests__/` with injected
seams — no runtime, no network. Oracle construction is TSPEC's and PROPERTIES' work (O-14, O-19); these
are the behavioural gates.

**AT-01 — Round index is derived from the branch, not from 1 (H-1)**
*Who:* the pipeline. *Given* `docs/foo/` holds `CROSS-REVIEW-software-engineer-FSPEC-v3.md` and
`CROSS-REVIEW-test-engineer-FSPEC-v3.md`, none approving. *When* Phase F is entered. *Then* the first
reviewer dispatch is round **4**, the round span logged is `rounds 4..8`, and no write targets a `-v1`,
`-v2` or `-v3` path.

**AT-02 — Un-suffixed first round is index 1**
*Given* `docs/foo/CROSS-REVIEW-software-engineer-FSPEC.md` with no `-vN`. *When* the round index is
derived. *Then* it is treated as round **1** and the next round is **2**.

**AT-03 — Clean branch is benign (C-4, E-01)**
*Given* `docs/foo/` does not exist. *When* Phase F is entered. *Then* the listing yields `dir_missing`,
the round index is 1, mode is greenfield, and **no** warning or halt is emitted.

**AT-04 — Unenumerable directory halts once**
*Given* the listing seam reports `not_a_directory`. *Then* the run halts with exactly
`Cannot enumerate docs/foo: not_a_directory` and no phase work is dispatched.

**AT-05 — Non-conforming basenames are skipped and reported**
*Given* `CROSS-REVIEW-se-FSPEC-v2.md` (unknown slug) alongside a conforming pair. *Then* the conforming
pair is used, and the phase-entry line contains `skipped non-conforming: CROSS-REVIEW-se-FSPEC-v2.md`.
No halt.

**AT-06 — One listing per phase entry (AC-1.2)**
*Given* an instrumented `_listFiles`. *When* one phase entry runs its discovery, round derivation and
approval search. *Then* `_listFiles` was called **once** for that directory; the only additional listing
in the phase is the per-dispatch overwrite check.

**AT-07 — Overwrite guard refuses to clobber a cross-review (AC-1.4)**
*Given* `CROSS-REVIEW-software-engineer-FSPEC-v4.md` already exists non-empty. *When* the round-4 reviewer
dispatch is prepared. *Then* the guard reports the operator error and the file's bytes are unchanged.

**AT-08 — Same-round dual approval skips the phase (AC-4.1, AC-4.1a)**
*Given* round 2's two cross-reviews each carry `VERDICT: Approved` and matching `APPROVAL-HASH:` lines,
and the FSPEC's working-tree bytes hash to that value. *Then* Phase F is **skipped**, the report carries
the `⏭` marker, and names the document, both approving reviews and round **2**.

**AT-09 — Cross-round approvals never combine (E-11)**
*Given* round 2 = SE `Approved` / TE `Needs revision`; round 3 = TE `Approved` / SE `Needs revision`.
*Then* the phase **runs**.

**AT-10 — Absent role file is not approving (E-12)**
*Given* round 2 has only the SE file, approving, and a LEARNINGS approval record exists for round 2.
*Then* tier 1 governs, tier 2 is **not** read, and the phase runs.

**AT-11 — Duplicated verdict field fails closed (E-09)**
*Given* a cross-review with two `VERDICT: Approved` lines. *Then* the pre-count reports unparseable, the
phase runs, and `parseVerdict`'s scan-from-end result is **not** used.

**AT-12 — Round-1 approval produces a usable hash (O-14(i))**
*Given* a greenfield round 1: document authored, then reviewed and approved. *Then* the recorded
`APPROVAL-HASH:` equals the digest of the bytes read immediately **before** the review dispatch, and
re-entry skips the phase. *(Fails if the hash is sourced from a pre-episode pacing measurement — under
that implementation every round-1 approval falls to the missing-hash branch.)*

**AT-13 — One digest function on write and read paths (A-11)**
*Given* identical bytes. *Then* the write-path hash and every read-path hash are equal, and both carry the
`sha256:` prefix with 64 lowercase hex characters.

**AT-14 — Canonicalisation is inside the digest**
*Given* two byte sequences differing only in CRLF vs LF and in trailing-newline count. *Then* their
digests are equal, with no call-site pre-processing.

**AT-15 — Pre-harvest edit invalidates the approval (AC-4.4, E-17)**
*Given* a document approved at round 2, then edited (a DOD remediation shape), then harvested. *Then* the
tier-2 hash is the round-2 hash, the working tree does not match, and the phase **runs**. *(A test that
passes only because the hash was recomputed at harvest is the falsifying case and must fail.)*

**AT-16 — Rebase does not disturb the comparison (E-19)**
*Given* an approved document and a rebase that rewrites every commit sha and timestamp but not the
document's bytes. *Then* the phase is still skipped, and no sha, timestamp or ancestry was read.

**AT-17 — Failed hash append yields no approval and does not halt (E-13, TE-v5 Q-01)**
*Given* `_appendFile` fails after the review episode reaches terminal. *Then* an error is surfaced, the
round records **no** approval, and the current run **continues**. Never a silently record-less approval.

**AT-18 — Record-less LEARNINGS passes the guard and then fails closed (E-22)**
*Given* `LEARNINGS-foo.md` exists without `## 6. Approval Record`. *When* harvest deletes the
cross-reviews. *Then* `guard-harvest-before-delete` **permits** the deletion, and the next Phase F
invocation **runs**.

**AT-19 — Every injected IO call is awaited (C-2)**
*Who:* the bundle test. *Given* the built `pdlc/workflows/dist/*.bundle.js`. *When* the sources are
scanned for calls to the injected async seams — `_agent`, `_readFile`, `_writeFile`, `_appendFile`,
`_checkFile`, `_listFiles`, `_git`, `_checkCi`, `_mergeWorktree`, `_recordHalt`, `_rebaseOntoDefault`,
`_dodVerifyLoop`, `_raisePrAndVerifyCi` — *then* every call site is `await`ed, and **no bundle statement
introduces** a module or host capability the runtime lacks: no `import` **line**, no `export` past `meta`,
and no reference to `process` or `fetch`. *(The adapter's implementations are async while the test doubles
are sync, so a missing `await` passes unit tests and fails only in the runtime — this is the test that
catches it.)*

*Restated at v1.1 (SE-v1 F-05).* v1.0 asserted "no bundle contains `import`, `export` past `meta`,
`process`, `fs` or `fetch`" — a **bare substring** test that is red on a correct artifact:
`orchestrate-dev.bundle.js` contains `return fs.readFileSync(path, "utf8");`, the residue
`stripModuleSyntax` leaves after removing `defaultReadFile`'s `import` line. That statement is dead in the
runtime because the adapter supplies `_readFile`, and the existing
`__tests__/runtimeBundle.test.js` already asserts the correct, line-anchored form
(`not.toMatch(/^import\s/m)`). The last three seams above were also missing from v1.0's scan list despite
being async injected seams in the same hazard class. This AT is the existing test extended, not a second,
stricter gate.

**AT-20 — `dist/` is fresh**
*Given* any change to a workflow source. *Then* `node pdlc/workflows/build-runtime.mjs --check` exits 0 in
the same commit, and `sync-workflows.sh --check` exits 0 for the consumer copy, which is never committed.

**AT-21 — Non-convergence commits the `halted` row (AC-2.1)**
*Given* a phase that exhausts its round budget under `orchestrate-queue`. *Then* the row reads `halted`
**and** a commit `chore(queue): foo → halted` exists touching only `docs/_queue/QUEUE.md`.

**AT-22 — Halt does not claim an unwritten POSTMORTEM (AC-2.2, E-32)**
*Given* the POSTMORTEM agent throws. *Then* the reason says **write FAILED**, `postmortemStatus` is
`"write_failed"`, and no reason string contains `POSTMORTEM written`.

**AT-23 — Structured halt fields (AC-2.5)**
*Then* the report carries `haltPhase`, `postmortemPath` (fully substituted — no literal `{feature}`),
`postmortemStatus` and `queueRow` as fields, not only inside the reason string.

**AT-24 — Unresolved POSTMORTEM refuses re-entry (AC-2.3, E-25)**
*Given* `POSTMORTEM-R-foo.md` with no `RESOLVED:` line and no readable approval. *Then* Phase R halts, the
Recommendation text is reproduced verbatim, and the next step names AC-2.4.

**AT-25 — Resolved POSTMORTEM permits re-entry (AC-2.4)**
*Given* the same file with one `RESOLVED: yes`. *Then* Phase R runs.

**AT-26 — Skip reports the open POSTMORTEM without resolving it (E-26)**
*Given* an approving round-2 pair, a fresh hash, and an unresolved `POSTMORTEM-R-foo.md`. *Then* Phase R
is **skipped**, the run continues to Phase F, the report names both, and the POSTMORTEM is unchanged on
disk.

**AT-27 — Refusal is keyed on (phase, feature) (AC-2.3a, E-27)**
*Given* an unresolved `POSTMORTEM-R-foo.md`. *Then* Phase F, T, P and D are unaffected.

**AT-28 — Force overrides approval only (AC-4.6, AC-4.6a)**
*Given* `forcePhases: "F"` and an approving, fresh round-2 pair. *Then* Phase F **runs** at round 3, is
reported as forced, and the round-2 approval record is unchanged. *Given additionally* an unresolved
`POSTMORTEM-F-foo.md`, *then* the forced run is **refused**.

**AT-29 — Bad force token is rejected (E-33, E-34)**
*Given* `forcePhases: "CR"` or `"all,F"`. *Then* the run halts before any phase, listing the valid
catalogue. No phase executed.

**AT-30 — Absent queue row is an error when a write was expected (AC-2.6, E-40)**
*Given* a queue-driven run whose row was removed mid-run. *Then* `queueRow: "error"` and the reason names
the feature and the queue path. `updateQueueStatus` does not silently return the document unchanged.

**AT-31 — Direct invocation with no row is not an error (AC-2.6a, E-41)**
*Given* no `QUEUE.md`. *When* a direct invocation halts. *Then* `queueRow: "none"` and the report carries
exactly one failure — the halt reason.

**AT-32 — Bypass does not recover the queue (AC-2.7a, E-42)**
*Given* a `halted` row and a **successful** direct invocation. *Then* the row still reads `halted`,
`selectNextPending` reports no pending entries, and the next `/loop` iteration is `idle`.

**AT-33 — Commit failure is non-fatal and surfaced (E-38)**
*Given* `_git` reports a commit failure. *Then* the row is correct on disk, `queueRow` is
`"halted (uncommitted)"`, the manual-commit instruction appears, and the **original halt reason is
reported first**.

**AT-34 — Nothing-to-commit is success (E-39)**
*Given* the row already reads `halted` and is committed. *Then* the status write is a silent no-op with no
warning.

**AT-35 — No-op-with-trailer is terminal (AC-3.5b, E-44)**
*Given* a revision episode whose round is fully applied. *When* the dispatch writes nothing and emits
`REVISION-COMPLETE: yes`. *Then* the episode is **terminal in one dispatch**, the phase does not halt, and
the wrapper does not re-dispatch.

**AT-36 — No trailer is not terminal even when complete (E-45)**
*Given* a revision dispatch killed after applying 3 of 5 findings, leaving the artifact structurally
complete. *Then* the episode is **not** terminal and continues.

**AT-37 — All three fault surfacings behave identically (AC-3.5e, E-46, TE-v1 F-06)**
*Given* three fixtures: dispatch returns a value with no trailer, returns nothing, throws. *Then* all three
reach the **same** non-terminal conclusion, asserted without distinguishing them. *And* the
`faultObserved` boolean reads **true** for the throwing fixture and **false** for the other two, per
§15.4's definition. *(Fails for an implementation that sets the boolean whenever the trailer reason is
`absent` — which cannot distinguish a kill from an omission.)*

**AT-38 — Premature trailer is visible, not silent (R-12, O-19(h4))**
*Given* an agent emitting the trailer while a finding is demonstrably unreflected. *Then* the round's
report records the terminal-on-trailer decision, so the loss is attributable rather than silent.

**AT-39 — Partial over-budget section counts as progress (E-48)**
*Given* a greenfield dispatch killed mid-way through a section larger than
`MAX_AUTHORING_WRITE_BYTES`, having written bytes but completed no section. *Then* the dispatch scores
**progress**, the consecutive counter resets, and three such kills do **not** halt the phase.

**AT-40 — Revision dispatch on a complete artifact is not no-progress (O-19(b))**
*Given* a feedback-addressing dispatch that edits an already-complete document. *Then* it scores progress,
and three consecutive such dispatches do **not** halt the phase.

**AT-41 — Counter reset with interleaving (E-50)**
*Given* dispatches scoring no-progress, no-progress, progress, no-progress. *Then* the episode is still
running.

**AT-42 — Counters are per episode (O-19(c), E-51, TE-v1 F-04)**
*Given* a five-round convergence with one dispatch per round. *Then* `MAX_AUTHORING_DISPATCHES` is never
reached, and at the start of each new round **and** each fresh invocation both counters read zero.
*Given additionally* round 1 inside **one** invocation where the greenfield authoring episode consumes **4**
dispatches and the round-1 revision episode then consumes **3**. *Then* both counters read zero at the
greenfield→revision transition and the phase does **not** halt. *(Fails under the four-coordinate episode
key, which totals 7 against `MAX_AUTHORING_DISPATCHES` = 6.)*

**AT-43 — Mode survives the invocation seam (O-19(i), E-52)**
*Given* a revision episode killed mid-edit, halted under the authoring budget, the row reset, and the phase
**re-invoked**. *Then* the new episode re-enters **revision** mode on the **same** round, carries the
continuation prompt with that round's findings, and does **not** report terminal success on structural
completeness alone.

**AT-44 — Artifact-set semantics (O-19(g), E-53, E-54)**
*Given* an `se-author` dispatch advancing TSPEC only. *Then* it scores progress; terminal requires every
required member; a DECISIONS the warrant check does not require is not a member.

**AT-45 — Working-tree measurement (O-19(g))**
*Given* a write not yet committed. *Then* it counts as progress.

**AT-46 — Authoring-budget exhaustion writes no POSTMORTEM (AC-3.5f, E-56)**
*Then* the phase halts, **no** `POSTMORTEM-{phase}-{feature}.md` is written, the `halted` row **is**
committed, and the report names the queue-row reset as the single recovery act and states that no
POSTMORTEM was written.

**AT-47 — Two distinct exhaustion reports (AC-3.5d)**
*Then* the consecutive exhaustion reports `no progress across 3 consecutive attempts` and the cumulative
one reports `6 dispatches without reaching structural completeness`, each with the section count, and
neither claims any runtime retry count.

**AT-48 — Continuation prompt contract is inspectable (AC-3.5g)**
*Given* any revision-mode dispatch. *Then* its prompt names the round's findings, states the
partially-edited condition and the not-already-reflected instruction, directs the agent to the document on
disk, and requires the trailer. A prompt lacking any clause fails the test.

**AT-49 — Resume prompt names the first unwritten section (AC-3.3, O-6, TE-v1 F-05)**
*Given* a partial FSPEC with sections 1–7 filled and 8–21 empty. *Then* the dispatch is a resume, the
prompt names section 8's heading, and the section index was computed by the **script**. *Given instead* a
partial **cross-review** whose headings all carry prose but which has no trailing `## Verdict` section, and
*given instead* a partial **LEARNINGS** missing its fifth numbered section. *Then* in both cases the resume
prompt's `{heading text}` field is the per-class value of §15.5's mapping and is never empty or undefined.

**AT-50 — Wrapped review dispatch is terminal on its verdict field (O-19(f), §16.3)**
*Given* a `se-review` dispatch producing a cross-review with one parseable verdict. *Then* the episode is
terminal and the reviewer is not re-dispatched. *And* a Phase-DOD remediation `se-implement` dispatch is
demonstrably **not** wrapped.

**AT-51 — Harvest terminal without the approval record (E-59)**
*Given* a harvest killed after prose, before the record. *Then* the episode is terminal, the run reports
success, **and** the report names the missing approval record.

**AT-52 — Pacing proxy reports but does not halt (O-20, E-61)**
*Given* a per-section commit whose diff exceeds `MAX_AUTHORING_WRITE_BYTES`. *Then* the run report names
the violation and the run **continues** to completion.

**AT-53 — No git operation discards uncommitted artifact content (O-20)**
*Then* no code path invokes `checkout --`, `reset --hard`, or `stash` on an artifact path.

**AT-54 — Constant substitution respects the budget semantics (AC-5.1, E-06)**
*Given* a branch whose highest FSPEC round is 3. *Then* the gate admits rounds 4 through 8, and the
exhaustion message names `rounds 4..8` — not `after 5 iterations` against an absolute index.

**AT-55 — No un-substituted template reaches a report (AC-5.2)**
*Then* no report string produced by any halt path contains a literal `{feature}` or `{DOC-TYPE}`.

**AT-56 — A partial or disagreeing anchor pair yields no approval (E-63, E-64, SE-v1 F-02)**
*Given* the candidate round's two cross-reviews both `Approved`, with (a) `APPROVAL-HASH:` on the SE file
only, and (b) different `APPROVAL-HASH:` values on the two files. *Then* in both cases the result is
`UNEVALUABLE`, Phase F **runs**, and the report names the offending files. *(Fails if either file's value
is adopted as `recordedHash`.)*

**AT-57 — A higher non-approving round denies an earlier approval (E-65, TE-v1 F-01)**
*Given* round 2's two cross-reviews are `Approved` with an `APPROVAL-HASH:` matching the document's
current bytes, **and** round 3's two cross-reviews are `Needs revision` with the document unedited since.
*Then* Phase F **runs**, the report names round **3** as the candidate, and round 2 is not read.
*(Fails if the search descends past round 3 — the fail-open skip that discards a completed round.)*

**AT-58 — Intra-episode re-dispatch onto the episode's own partial file is permitted (E-57, TE-v1 F-02)**
*Given* a review episode whose first dispatch was stall-killed after writing a non-empty partial
`CROSS-REVIEW-software-engineer-FSPEC-v4.md`. *When* §15.4 re-dispatches inside the same episode. *Then*
the no-overwrite guard is **not** evaluated, no operator error is raised, the dispatch proceeds with the
continue-do-not-rewrite instruction, and the partial file's existing bytes are still present afterwards.
*(Fails if the guard fires — the deadlock of the mandated continuation.)*

**AT-59 — A duplicated verdict field is terminal but not approving (E-58, TE-v1 F-03)**
*Given* a cross-review whose trailing `## Verdict` section carries two `VERDICT: Approved` lines. *Then*
the review episode is **terminal** on the first dispatch, the reviewer is **not** re-dispatched, the phase
does **not** halt, and the phase **runs** because the verdict is not approving. *(Fails if the episode
re-dispatches to `MAX_AUTHORING_DISPATCHES` — the false halt of a finished review.)*

**AT-60 — Quoted verdict grammar does not make a file unparseable (E-66, TE-v1 F-08)**
*Given* a cross-review whose body quotes `VERDICT: Approved with minor changes` inside a fenced block and
whose trailing `## Verdict` section carries exactly one `VERDICT: Approved`. *Then* the file is
conforming, the verdict reads `Approved`, and the whole-file count of two is never consulted.

**AT-61 — Each trailer reason is distinguishable in the report (E-67, E-68, TE-v1 F-07)**
*Given* four revision-dispatch fixtures emitting: `REVISION-COMPLETE: no`; no trailer; two
`REVISION-COMPLETE:` lines; `REVISION-COMPLETE: maybe`. *Then* all four are non-terminal **and** the report
echoes `declared_incomplete`, `absent`, `duplicated` and `unparseable` respectively. *(Fails for a parser
returning a constant reason for every non-`yes` input.)*

**AT-62 — A placeholder skeleton is not structurally complete (E-60, TE-v1 F-09a)**
*Given* a greenfield dispatch that writes all of a spec's top-level headings with bodies consisting only of
`TBD`, `TODO`, `_TBD_` and an HTML comment. *Then* the artifact scores **not complete**, `S` is **0**, the
episode is **not** terminal, and a second dispatch is issued. *(Fails for a body test of "any non-blank
line", under which write 1 scores complete.)*

**AT-63 — Per-role malformed duplicate halts; two roles at index 1 do not (E-05, TE-v1 F-09b)**
*Given* `CROSS-REVIEW-software-engineer-FSPEC.md` **and** `CROSS-REVIEW-software-engineer-FSPEC-v1.md` both
present. *Then* derivation **halts** at step 5 with an operator error naming **both** paths, before any
dispatch. *Given instead* `CROSS-REVIEW-software-engineer-FSPEC.md` and
`CROSS-REVIEW-test-engineer-FSPEC-v1.md`. *Then* there is **no** halt: this is two roles at index 1, a
normal pairable round, and derivation yields `startIndex` 2.

## 20. Open questions

Genuinely open at FSPEC altitude — each names who resolves it and where. Nothing here is a REQ decision
being re-litigated, and nothing here is a deferral (D-RLH-01..05 are out of scope, not open).

| # | Question | Owner | Why it is not settled here |
|---|---|---|---|
| Q-01 | Should `rtListFiles` be implemented as a single `ls -1A`-class Bash agent call, or as a `find`-class call scoped to `docs/{feature}/` with a depth of 1? §3 fixes the **contract** (one non-recursive listing of basenames, four `reason` values) and leaves the command form open. | TSPEC | Both satisfy the contract; the choice turns on which produces the more reliably parseable single-line-per-entry output through an agent relay, which is an implementation measurement. |
| Q-02 | Which SHA-256 implementation is inlined? §7 fixes the algorithm, the output form (`sha256:` + 64 lowercase hex), the canonicalisation and the single-function requirement, but not the code. | TSPEC | A pure-JS SHA-256 is ~80 lines; whether to write it inline in `orchestrate-dev.js` or in a small sibling module that `stripModuleSyntax` inlines is a build-shape question with a measurable answer (bundle size, test isolation). |
| Q-03 | Does the digest need to be byte-accurate over non-ASCII content, i.e. must the implementation encode to UTF-8 before hashing rather than hashing UTF-16 code units? | TSPEC / PROPERTIES | The answer is almost certainly "yes, UTF-8", but the **falsifier** needs a fixture with a multi-byte character in a spec document, and whether such content occurs in practice affects test priority, not correctness. |
| Q-04 | Should the pacing proxy of §15.8 run once per episode or once per phase? §15.8 fixes what it measures and that it cannot halt the run. | TSPEC | Per-episode gives sharper attribution; per-phase costs fewer `_git` calls. Both are advisory, so the trade-off is cost, not behaviour. |
| Q-05 | For `## 6. Approval Record` (§9.2): if a future `harvest-learnings` revision adds a sixth prose section, does the approval record renumber to `## 7`, or is it pinned to a name-only heading? | Whoever revises `harvest-learnings/SKILL.md` | §9.2 pins the current numbering because that is what is true today. The forward-compatibility rule is a maintenance convention, not a behaviour of this feature. |
| Q-06 | Should the `RESOLVED:` marker also record **who** resolved it and when? §12.2 deliberately parses only the token. | Operator convention / a later feature | Adding parsed fields would put prose in a script's path (C-5). A `## Resolution` section already carries the narrative unparsed; whether to make any of it structured is a separate decision. |
| Q-07 | Is `forcePhases` worth surfacing in `DEV_META` for bundle-level discoverability? §11.2 deliberately does not edit `DEV_META`. | A later distribution change | The hand-written bundle `meta` has no `inputs` array at all today, so adding one is a change to that file's shape, with its own sync obligation. Out of proportion to the benefit here. |
| Q-08 | Does the `_recordHalt` seam (§14.2) belong in `runtime-adapter.js` or in the bundle entrypoints? §14.2 specifies the contract and the three callers, not the file. | TSPEC | The queue bundle inlines both modules, so either placement works; the dev bundle needs the queue's row helpers inlined, which is a build-shape question like Q-02. |

**Explicitly not open** — recorded here because each was asked and answered at REQ altitude, and a reviewer
should not reopen them: whether the staleness test walks history (**no**, §10.2); whether harvest may
recompute the hash (**no**, §9.4); whether a force can clear a POSTMORTEM (**no**, §11.5); whether a
bypass recovers the queue (**no**, §14.4); whether the guard is tightened (**no**, §9.7); whether a
verdict field is added to `CODE_REVIEW-*` (**no**, §16.4); whether the approval record is part of LEARNINGS
completeness (**no**, §16.5); whether progress varies by mode (**no**, §15.3); whether terminal requires
progress (**no**, §8.4).

## 21. Obligation discharge and traceability

### 21.1 REQ §8 obligation rows landing in FSPEC

| Row | Substance | Discharged in | Complete? |
|---|---|---|---|
| **O-1** | Review-artifact discovery: injected listing seam, adapter implementation, absent-directory behaviour; disposition of `listAllFiles`/`WALK_SKIP_DIRS` precedent; **one shared "cannot judge" error contract** across both listing paths (DC-11) | §1.4, §3 | Yes — `listAllFilesSafe` shares the one four-value `ListFailure` catalogue; two implementations, one error contract |
| **O-2** | Filename grammar including the un-suffixed round-1 form, role slugs from `reviewerRoleSlug`'s `MAP`, doc-type token, unambiguous `N`, rejection of non-conforming names | §4 | Yes |
| **O-3** | Representation of "unresolved POSTMORTEM" — marker location and grammar — and Recommendation extraction | §12.2, §12.3, §12.5 | Yes |
| **O-4** | The queue-status commit: who performs the git operation, the message, dirty-tree and commit-failure behaviour | §13 | Yes |
| **O-5** | The direct-invocation path: how the row is located, and what happens when there is none | §14 | Yes |
| **O-6** | Retry-aware prompt contract: how an author is told it is a retry, and how the first unwritten section is determined | §15.5 | Yes — determined by the **script**, with three definite cases |
| **O-7** | Structural completeness per **wrapped artifact class** — six spec documents plus cross-review, code-review and LEARNINGS; implements (not re-chooses) the two REQ-fixed criteria; **excludes** the approval record from LEARNINGS; does **not** redefine progress | §16 | Yes |
| **O-8** | The staleness comparison, as **narrowed at v1.5**: one hash-equality test at both tiers, **no history walk at either**, sha not load-bearing, read-at-comparison-time rule, both-tiers-disagree, no-parseable-hash, rebase-invariance argument | §10 | Yes |
| **O-9** | The operator override surface and its precedence relative to recorded approval | §11 | Yes |
| **O-16** | AC-5.1/AC-5.2 as concrete edits, cited by **enclosing symbol + distinctive literal**, with the HEAD sha recorded | §17 (baseline `0655387`) | Yes — no bare `file:line` citation anywhere in this document |
| **O-17** | Persisted-verdict grammar and extraction; the script-written **hash + reviewed-commit** fields, their syntax, algorithm, canonicalisation, single-implementation requirement, write ordering, append shape and idempotence; the **revision-completion trailer** grammar and the author-SKILL amendment | §6 (verdict), §7 (hash), §8 (trailer) | Yes — one grammar family, three carriers (§2.3) |
| **O-18** | Role-asymmetric handling in the approval search | §5 | Yes |
| **O-19** | Constant **placement** for `MAX_AUTHORING_WRITE_BYTES`, `MAX_AUTHORING_ATTEMPTS`, `MAX_AUTHORING_DISPATCHES`, plus the explicit statement that **no oracle for emitted bytes exists** | §15.7 | **Placement half only** — the oracle half (a)–(j) is PROPERTIES/TSPEC work; §19's AT-35..AT-53 are the behavioural gates those oracles must satisfy |
| **O-20** | Per-section commit cadence and the **commit-diff proxy**: what is measured, the threshold, that a violation is reported, and that the proxy is advisory and may not halt the run | §15.8 | Yes |
| **O-21** | Approval-record grammar in LEARNINGS: placement, the six REQ-fixed columns, **copy-not-recompute** derivation, tier precedence, unavailable marker, canonicalisation referent, guard-not-tightened falsifier | §9 | Yes |

**Rows not landing in FSPEC** and therefore not discharged here: O-10..O-15 (TSPEC / PROPERTIES /
SKILL-text owners), and the oracle half of O-19. **Deferrals D-RLH-01..05 are out of scope** and are
specified nowhere in this document; §15.1 names D-RLH-05 only to record *why* code-writing dispatches are
excluded from the wrapper, and §15.4 names D-RLH-04 only to record that the runtime retry count is not
claimed.

### 21.2 AC group → FSPEC section map

| AC group | Sections |
|---|---|
| AC-1 (iteration index, discovery) | §3, §4, §5, §17.1 |
| AC-2 (terminal, legible non-convergence) | §12, §13, §14 |
| AC-3 (resumable authoring) | §8, §15, §16 |
| AC-4 (approved-phase skip) | §5, §6, §7, §9, §10, §11 |
| AC-5 (harness consistency) | §17 |

### 21.3 REQ retractions this document depends on

Every one is a rule an earlier REQ version stated and later **withdrew**. This document specifies the
**surviving** rule in each case, and lists them here so a reviewer can check that none was silently
reinstated.

| Retracted | Superseded by | Where the surviving rule is stated |
|---|---|---|
| Tier-1 staleness measured by "the approving cross-review artifacts' own position in history" (v1.3–v1.4) | AC-4.4 v1.5 — one hash-equality test at both tiers | §10.1, §10.2 |
| The recorded **commit sha** as a staleness referent | AC-4.2b/AC-4.2d — corroborating context only | §10.2 |
| "The commit sha that round's approving cross-review files were committed at" (v1.2–v1.4) | AC-4.2b v1.5 (TE-v5 F-03) — the **reviewed document's** commit | §7, §9.3 |
| Harvest **computes** the hash from the document it harvests beside (v1.3) | AC-4.2b v1.4 — harvest **copies** it from the tier-1 record | §9.4 |
| Canonicalisation over "the document file as committed, byte-for-byte" (v1.3) | AC-4.2d/SE-v5 F-06 — the working-tree bytes read immediately before the review dispatch | §9.5, §10.3 |
| "The same single pre-dispatch read" shared with the pacing measurement | AC-4.2d v1.5 (SE-v5 F-02) — a **new** pre-review read | §7 |
| Force-run offered as an alternative route through an unresolved POSTMORTEM (v1.2) | AC-4.6a / SE-v3 F-02 — AC-2.4 is the **exclusive** route | §11.5, §12.4 |
| "Or AC-4.6 (force the phase)" in worked example B | same | §12.4 |
| Terminal = "the dispatch returned normally" (v1.4) | AC-3.5b v1.5 (TE-v5 F-01) — the revision-completion trailer | §8.1, §8.4 |
| Terminal requires **progress** on the terminal dispatch (v1.4) | AC-3.5b v1.5 (TE-v5 F-02) — a no-op with a trailer is terminal | §8.1, §8.4 |
| Mode-specific progress limbs; byte-change restricted to revision mode (v1.4) | AC-3.5a v1.5 (TE-v5 F-05) — one mode-independent predicate | §15.3 |
| Mode derived from the artifact's structural state, sticky only **within** an episode (v1.3, v1.4) | AC-3.5 scope (d) v1.5 (SE-v5 F-01) — derived from the kind of prompt the phase dispatches | §15.2 |
| `MAX_AUTHORING_DISPATCHES` scoped "per artifact per phase" (v1.2) | AC-3.5c v1.3 — per **episode** (set × phase × round × invocation) | §15.1, §15.4 |
| "The correct operator response is to re-invoke" (v1.3 rationale for AC-3.5f) | AC-3.5f v1.4 — both halt classes need a human act | §15.6 |
| "An operator bypassing the queue needs **none**" (v1.4) | AC-3.5f/AC-2.7a v1.5 (SE-v5 F-04) — true of the phase, false of the queue | §14.4, §15.6 |
| Bypass offered as **equivalent** to the queue-row reset (v1.4) | AC-2.7a v1.5 (SE-v5 F-04) — the row edit is the only act that recovers the queue | §14.4 |
| The `≈150 lines` co-bound on the write budget (v1.1) | AC-3.1a v1.2 (TE-v2 F-03) — a byte bound only | §15.7 |
| Append-only byte equality applied to **all** edits (v1.2) | AC-3.1a v1.3 (SE-v3 F-05) — a replace-shaped edit emits match **plus** replacement | §15.8 |
| "How the pacing bound is checked in review" (v1.2) | AC-3.1a v1.3 (TE-v3 F-03) — not script-decidable; the proxy plus the counters | §15.7, §15.8 |
| Committing the `.claude/workflows/` consumer copy (v1.0) | AC-5.5 v1.1 (SE F-01) — untracked by decision (DEC-DIST-02) | §17.6 |
| `decisionsWarranted(...)` cited in function-call form (v1.4) | v1.5 (TE-v5 F-06) — the mechanism is `parseDecisionsWarranted` bound to a local | §15.1 |

### 21.4 Constraint compliance

| Constraint | How this document complies |
|---|---|
| **C-2** (runtime restrictions) | Every new capability reaches the runtime through a DI seam declared in §1.4 and implemented in `runtime-adapter.js`; §7's digest is inlined pure JS with **no** seam and no `crypto`; every injected IO call is specified as `await`ed, and AT-19 asserts it at bundle level |
| **C-4** (clean-branch behaviour) | E-01 / AT-03 — an absent feature directory is benign, with no warning and no halt |
| **C-5** (no agent in a decision a script can make) | The script owns every decision: round derivation, grammar parsing, verdict extraction, hash computation and comparison, section counting, first-unwritten-section, force parsing, POSTMORTEM gating, Recommendation extraction. Agents supply only **closed-catalogue tokens** (§6, §8) and byte transport. §6 explicitly declines to reuse `recoverVerdict` on the approval path for this reason. |
| **DC-01** (closed catalogue, total function) | Every parser in §3, §4, §6, §8, §11.3, §12.3 is specified over its whole input domain with a named failure value |
| **DC-02** (measured platform facts) | Every platform claim cites the file and its distinctive literal at HEAD `0655387`; §4a A-1/A-2/A-7/A-8/A-9/A-10/A-11 are the measured basis |
| **DC-04** (oracle = pure function of injected root) | `listAllFilesSafe(root)` keeps the oracle side root-parameterised and pure |
| **DC-11** (sibling oracles share one error contract) | §3's single `ListFailure` catalogue, defined once and used by both listing paths |
| Generated artifacts | §17.6 — `dist/` rebuilt and committed with its sources; `.claude/workflows/` never committed |
