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

## 3. Interfaces

## 4. Data Model

## 5. Algorithms

## 6. Error Handling

## 7. Build and Distribution

## 8. Test Strategy

## 9. Traceability

## 10. Open Questions
