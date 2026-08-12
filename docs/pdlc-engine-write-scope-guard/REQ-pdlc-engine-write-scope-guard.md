---
feature: pdlc-engine-write-scope-guard
ready: true
depends-on: [pdlc-headless-engine]
---

# REQ — pdlc-engine-write-scope-guard

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.8); `docs/pdlc-headless-engine/DECISIONS-headless-engine-obligations.md`; `docs/_constraints/pdlc-wave-gate-baseline.md` (v1.0, M-WG-3, M-WG-4); `docs/_constraints/DOMAIN-CONSTRAINTS.md` (DC-01, DC-08, DC-09) |
| This doc | **REQ** |
| Downstream | FSPEC, TSPEC, PROPERTIES |
| Cross-Reviews | — |
| LEARNINGS | `docs/pdlc-engine-write-scope-guard/LEARNINGS-pdlc-engine-write-scope-guard.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft | Claude | 0.1 | 2026-08-12 |

## 1. Problem / Context

The pdlc pipeline runs Phase I implementation in **same-tree waves**. Each wave is a group of
tasks whose owned file sets do not overlap, taken from the file-ownership manifest the PLAN
carries; the agents run in parallel in one shared working tree, are told not to commit, and the
script owns the gate that runs afterwards. Only files a task owns are committed, pathspec-scoped
(`docs/_constraints/pdlc-wave-gate-baseline.md`, M-WG-4). Ownership is what makes parallelism
safe: two agents editing the same file at the same time is the failure the partitioning exists
to prevent.

**Ownership is declared but not enforced.** Today a dispatched agent is *told* which files it
owns, in its prompt. Nothing stops it writing any other file in the tree. The two mechanisms
that look like protection are not:

- **Pathspec-scoped commits** keep an out-of-scope write out of *history*. They do not keep it
  out of the *tree*, and the tree is live: the wave gate reads it, sibling agents in the same
  wave read it, and the next wave inherits it.
- **Repo permission settings** (a consumer's `.claude/settings.json` allow/deny rules) do not
  bind the agents the engine dispatches. There is no operator-side configuration that closes
  this today — an operator who wants ownership enforced has nothing to turn on.

So the gap is not "an agent might commit the wrong file". It is "an agent can change tree state
that other agents and the gate then read as if the run had authorised it".

### 1.1 The incident (2026-08-12)

A Phase I wave-5 run of `pdlc-headless-engine` halted at the wave gate. Three facts about that
run are observed, and they are the ones this REQ rests on:

1. `.claude/pdlc.config.json` was modified in the working tree during the wave. That file is
   owned by task **T17** in the PLAN's ownership manifest, and T17 was not a member of the
   halted wave's ready set.
2. Nothing committed the change — per-task commits are pathspec-scoped, so the modification sat
   uncommitted in the tree.
3. The wave gate reads that same file live to resolve the test command it runs
   (`docs/_constraints/pdlc-wave-gate-baseline.md`, M-WG-3). The gate therefore evaluated the
   wave against configuration the run had not authorised, and the wave halted.

Two consequences carry forward regardless of which agent performed the write — see A-1 in §7,
which labels the attribution this REQ deliberately does not depend on:

- an agent in a wave can write a file outside the wave's owned set, and nothing in the tree
  stops it;
- the resulting uncommitted state can decide a gate outcome, so "nothing was committed" is not
  the same as "nothing happened".

### 1.2 Whose problem this is

| Who | What they experience today |
|---|---|
| The operator running a pipeline | A wave halts, and the halt names a test failure, not the stray write that caused it. Diagnosis means reading a dirty tree and guessing which agent produced which change. |
| The operator diagnosing afterwards | An out-of-scope write leaves no record at all. It is not in history (never committed) and not in the run report (nothing observes it). The only evidence is a dirty tree, which is destroyed by the first `git checkout`. |
| The engineer authoring a PLAN | The ownership manifest is load-bearing for correctness but carries no feedback. A manifest row that is wrong or missing produces no signal until a wave behaves strangely. |
| A reviewer judging a wave that passed | A green wave is not evidence that agents stayed in scope. Passing and staying in scope are currently independent. |

### 1.3 Why prompt-level scoping is not enough

Scope stated in a prompt is an instruction to a model, and the pipeline already treats
model self-report as insufficient everywhere else it matters: the wave gate is script-owned
precisely because an agent's own "tests pass" claim is not trusted (M-WG-3), and documents are
gated on structural completeness rather than on an agent saying "done". Write scope is the one
load-bearing constraint in Phase I still enforced only by asking. This REQ closes that
asymmetry at the same level the rest of the phase already works at: a mechanical check that
does not consult a model and cannot be talked out of.

## 2. Goals

## 3. Non-Goals

## 4. Constraints

## 5. Acceptance Criteria

## 6. Risks

## 7. Obligations / Open Questions
