# DECISIONS — plugin workflow distribution

Project-level decisions about how a plugin's workflow scripts reach the runtime that executes them.
Promoted by `/pdlc:consolidate-learnings` on 2026-07-29. Read by `se-author` before TSPEC/PLAN.

This topic is the clearest cross-feature promotion in the first consolidation pass:
`orchestrate-dev-workflow` **raised it as an open question and could not close it** — `OQ-05` survived
all 5 FSPEC iterations unresolved, and its LEARNINGS flagged it as "this exact problem will recur for
every future workflow-bearing plugin in this repo". `pdlc-workflow-distribution` **answered it**. What
follows is the answer, recorded at project level so the next workflow-bearing plugin inherits it
rather than rediscovering it.

---

## DEC-DIST-01: The workflow runtime is a constrained execution environment; treat its limits as binding

**Decision:** Workflow scripts run in the Claude Code workflow runtime, which is **not Node**. Binding
limits, verified by measurement:

- `export const meta` must be the **first statement** and a **pure literal**; no other `export` is
  permitted.
- `import`, dynamic `import()`, `process`, `fs`, and `fetch` **do not exist**.

**Consequence:** authored sources cannot be the artifacts the runtime loads. Do not write file access,
subprocess logic, or module imports into a workflow source on the assumption that a Node API is
available — verify the primitive list first and state it in the REQ Assumptions (DC-02).

**Origin:** `orchestrate-dev-workflow` (DEC-ODW-03 records `fs.existsSync` in TSPEC v1.0 as a draft
error, caught by TE review as a contradiction, not as a viable alternative);
`pdlc-workflow-distribution` (the constraint set that forced the build step).

**Testability:** Enforced by `__tests__/runtimeBundle.test.js`, which asserts the structural
constraints against every built artifact, so a source that violates them fails the suite rather than
failing at invocation time.

---

## DEC-DIST-02: Three tiers — tested source, built artifact, untracked consumer copy

**Decision:** Separate the three roles rather than copying one file between them.

| Tier | Location | Tracked? | Edited by hand? |
|---|---|---|---|
| **Source of truth** — ES modules with jest coverage | `pdlc/workflows/*.js` | yes | yes, this is what you edit |
| **Built artifact** — runtime-legal bundle | `pdlc/workflows/dist/` | yes | **never** — generated |
| **Consumer copy** — what the runtime actually loads | `.claude/workflows/` | **no** | **never** — synced |

`node pdlc/workflows/build-runtime.mjs` generates the middle tier;
`pdlc/hooks/scripts/sync-workflows.sh` installs the bottom tier from the middle one. The order is not
interchangeable. `runtime-adapter.js` is **inlined by the build, never imported**: it re-expresses
Node capabilities as `agent()` calls and reaches the pipeline through the modules' existing
dependency-injection parameters (`_agent`, `_readFile`, `_writeFile`, `_checkFile`, `_checkCi`,
`_mergeWorktree`, …), so the tested modules remain the single source of truth.

**Consequence for anyone editing a workflow source:** every injected IO call must be `await`ed (the
adapter's implementations are async; the test doubles are sync), and `pdlc/workflows/dist/` must be
rebuilt **in the same commit**.

**Origin:** `orchestrate-dev-workflow` (raised the two-copy problem — canonical plugin source vs.
runtime-loaded copy — as `OQ-05`, unresolved across 5 FSPEC iterations, with manual copy as the
provisional decision); `pdlc-workflow-distribution` (replaced the manual copy with this three-tier
mechanism).

**Testability:** `build-runtime.mjs --check` exits non-zero on a stale `dist/` artifact;
`sync-workflows.sh --check` exits non-zero when the consumer copy has drifted;
`__tests__/runtimeBundle.test.js` asserts freshness plus the structural constraints. **Note the
falsification history:** the freshness gate was itself a dead oracle until DoD-03 — it had only ever
been run on an already-fresh tree asserting exit 0, and neutralising both staleness assignments left
all 997 tests green (DC-03).

---

## DEC-DIST-03: A sync refuses to overwrite what it cannot prove it wrote

**Decision:** `sync-workflows.sh` classifies each consumer file and **skips rather than clobbers** two
states: `local-edit` (hand-edited since it was synced) and `unverified` (**no sync-manifest entry**, so
provenance is unknown). `--force` overwrites skipped rows, and every overwrite is backed up first.

**Rationale:** `unverified` is the state every pre-existing `.claude/workflows/` tree lands in the
first time the mechanism runs — the copies predate the manifest, so nothing records where they came
from. The state is deliberately safe in **both** directions: an unverified file is never assumed to be
a stale generated artifact, and never assumed to be precious. `--force` exists because the tool cannot
distinguish your edits from a stale copy; it is the operator's assertion, not a default.

**Consequence:** do not run `--force` reflexively, and read the warnings before forcing when `--check`
exits non-zero on a tree you did not expect to be dirty.

**Origin:** `pdlc-workflow-distribution`.

**Testability:** the drift-state classification, the invalidation ladder, and the backup-then-write
path are covered by the `drift*` suites under `pdlc/workflows/__tests__/`, exercised through a
`PDLC_FAULT` fault-injection grammar. **Known residual:** the run-wide skip comparator's C1/C2 clauses
evaluate over an empty record set on any non-root runner — a uid-0 inventory cannot be exercised at
uid 501. Recorded, not fixed.

---

## DEC-DIST-04: Drift is announced, and can gate the queue

**Decision:** A stale consumer copy is **reported, never silently executed**. The
`check-workflow-drift` `SessionStart` hook reports drift advisorily and **always exits 0**;
`orchestrate-queue` consults the recorded drift-state record **before `QUEUE.md` is even read** and can
refuse the whole invocation with `outcome: "blocked", reason: "Drift gate row N: …"`. A repo opts out
per `.claude/pdlc.config.json` → `distribution.checkEnabled: false`, and the queue then notes the skip
in its run report rather than ignoring it silently.

**Origin:** `pdlc-workflow-distribution`.

**Testability:** the hook's always-exit-0 guarantee is a P0 invariant. Note the falsification lesson
attached to it: the `trap 'exit 0' ERR EXIT` implementation was correct for the right reason and had
**no detector** — reverting the `EXIT` arm left all 8 tests of the suite added to close that finding
green (codebase G-02). A detector is constructible with a one-fixture addition and is booked as
follow-up work; until it lands, a P0-absolute guarantee rests on reasoning.

---

## Open at project level

| Item | Where it is bound |
|---|---|
| Full `pdlc install`; loading workflows from the plugin path with **no copy at all**; auto-sync; detecting a plugin cache behind the marketplace; **per-worktree consumer state** (a self-created `git worktree add` tree is not a supported consumer — its `.claude/workflows/` is empty while the drift tooling resolves the main worktree and reports green) | D-DIST-01/02/03/05/07 → queue row 6 `pdlc-install-mechanism` |
| Release automation on `yumo-plugins` (tag/publish workflow, marketplace step). **Partially discharged out of band:** the PR-test half landed in `3ef6ac7`; release automation has not | D-DIST-06 → queue row 7 `pdlc-release-ci` |
| Rendered version lines in the queue run report | R-12 → PLAN §7 follow-up REQ |
