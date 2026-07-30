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

## 3. FSPEC-DISC-01 — Review-artifact discovery seam

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
