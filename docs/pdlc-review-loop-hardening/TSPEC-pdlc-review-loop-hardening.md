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

## 4. Data Model

## 5. Algorithms

## 6. Error Handling

## 7. Build and Distribution

## 8. Test Strategy

## 9. Traceability

## 10. Open Questions
