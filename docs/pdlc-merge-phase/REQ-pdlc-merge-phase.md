---
feature: pdlc-merge-phase
ready: true
depends-on: [pdlc-workflow-distribution]
---

# REQ — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | `docs/design/MASTER-PLAN-engineering-loop.md` (Break 1, DEC-E1/E2/E3, order 2) |
| Downstream | `pdlc-advisory-tier`, `pdlc-engineering-loop` |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md` |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.1 | 2026-08-02 |

> **Scope in one line.** A Phase MERGE after Phase PUB that rebase-merges the green PR, deletes
> the branch, and writes the queue row to `done` — closing the dependency gate that currently
> waits on a human, under a self-modification guard that never auto-merges the pipeline itself.

## 1. Problem

`orchestrate-queue`'s status lifecycle ends at `awaiting-merge`:

```
pending ──pick──▶ in-progress ──pipeline success──▶ awaiting-merge ──(human merges PR)──▶ done
```

The SKILL justifies the stop precisely: "the dependent's readiness check looks for the
dependency's code in base, and only a real merge puts it there. Marking `done` is the human's
acknowledgement that the merge happened."

The invariant is right. The inference that a *human* must satisfy it is not. What the invariant
requires is that `done` is written only after the code is genuinely in the base branch. A workflow
phase that merges the PR and then writes `done` satisfies that identically — and does it in
seconds.

The cost of not doing so is not one delayed merge. The queue is a **serial chain**: while a
feature sits in `awaiting-merge`, `orchestrate-queue` reports `blocked` and refuses to pick up any
new work at all. A pipeline that produces a mergeable PR in an hour then idles until the operator
next sits down. On a long backlog that is the dominant term in delivery time, and it is pure
waiting.

There is a second, subtler cost. `awaiting-merge` also requires the human to *edit QUEUE.md* after
merging. A merge that happens without the edit leaves the queue permanently `blocked` on a feature
that is already in base — a stall with a misleading cause.

## 2. User stories

- **US-01** — As the operator, I want a green PR merged and the queue advanced without my
  presence, so an unattended loop makes real progress rather than one feature of progress.
- **US-02** — As the operator, I want merges to use rebase, never squash, so the TDD and
  remediation commit history survives.
- **US-03** — As the operator, I want it to be structurally impossible for the pipeline to merge a
  change to itself without my approval.
- **US-04** — As the operator, I want auto-merge to require positive CI evidence, not merely the
  absence of a failure signal.
- **US-05** — As the operator, I want the queue row and the merge to agree always, so the queue is
  never blocked on a feature that already landed.

## 3. Requirements

### REQ-MERGE-01 — Phase MERGE placement and preconditions

- **AC-1.1** — Given Phase PUB completed, Then Phase MERGE runs after it and is the last phase of
  the pipeline.
- **AC-1.2** — Given Phase MERGE begins, Then it merges only when **all** of these observations hold,
  each read from the named GitHub surface at merge time:

  | Precondition | Observed from | Merges when | Fails when |
  |---|---|---|---|
  | PR exists | Phase PUB's `prUrl` | present and non-empty | absent |
  | PR open | `gh pr view --json state` | `OPEN` | `CLOSED` (`MERGED` is handled by AC-1.6) |
  | CI evidence | re-read at merge time per REQ-MERGE-04 | per AC-4.1/AC-4.3 | per AC-4.2/AC-4.4 |
  | Mergeable | `gh pr view --json mergeable,mergeStateStatus` | `MERGEABLE` and `mergeStateStatus` not `DIRTY`/`BLOCKED` | `CONFLICTING`, `DIRTY`, `BLOCKED` |
  | No unresolved review threads | the PR's review threads and their resolved flag (a GraphQL-only field; `reviewDecision` is **not** an accepted substitute) | every thread resolved, or none exist | any thread unresolved |
  | Self-modification guard | REQ-MERGE-03 | guard does not fire | guard fires |

- **AC-1.2a** — Given `mergeable` reads `UNKNOWN` (GitHub computes mergeability asynchronously, and
  the window after Phase DOD's push and Phase PUB is exactly when it is most likely), Then the phase
  re-reads it a bounded number of times (`mergeableRetries`, default 3, spaced `mergeableRetryDelay`,
  default 10 s) before treating it as failed. A still-`UNKNOWN` answer after the last read is a
  **deferral**, not a merge.
- **AC-1.2b** — Given the evidence for **any** precondition in AC-1.2 cannot be retrieved, or is
  retrieved in a form the phase cannot parse into one of that row's stated values, Then that
  precondition is treated as failed. This generalises AC-3.4 to the whole precondition set: unknown
  is never merged on.
- **AC-1.3** — Given any precondition fails, Then no merge is attempted and three facts hold together:
  the phase names the failed precondition; the **pipeline outcome is `success`** with a
  merge-deferred note (a merge that did not happen is not a pipeline failure, so the halt path and
  its `halted` queue commit are not taken); and the feature's queue status is left `awaiting-merge`
  with no queue commit made by Phase MERGE. This holds identically for a guard refusal (AC-3.1) and
  for method exhaustion (AC-2.3) — every non-merge shares one outcome shape and differs only in the
  `mergeStatus` value assigned by the table in AC-6.1a.
- **AC-1.4** — Given `PHASE_MERGE_ENABLED = false`, Then the phase is skipped and behavior is
  identical to today **except** that the final report carries `mergeStatus: skipped`; no merge is
  attempted, no queue cell is written, and no guard evaluation occurs. The flag exists so the change
  is reversible without a revert.
- **AC-1.5** — Given the merge mode configuration `mergeMode` ∈ {`off`, `gated`, `on`}, Then `off`
  never merges, `gated` merges only when every precondition in AC-1.2 holds, and `on` behaves as
  `gated` — there is deliberately **no mode that bypasses the preconditions**. The distinction
  between `gated` and `on` is reserved for future relaxation and today they are equivalent.

- **AC-1.6** — Given Phase MERGE runs, Then its decisions are taken in this order, and the first one
  that resolves is the answer:

  | # | Evaluated | Resolves to |
  |---|---|---|
  | 1 | `PHASE_MERGE_ENABLED = false` | `skipped` |
  | 2 | `mergeMode: "off"` | `skipped` |
  | 3 | PR state is already `MERGED` | `merged` — no merge attempted, no guard evaluation, and the queue write-back of REQ-MERGE-05 **is still performed** (idempotently) |
  | 4 | self-modification guard (REQ-MERGE-03) | `refused` |
  | 5 | remaining preconditions (AC-1.2) | `deferred` on the first failure |
  | 6 | merge attempted (REQ-MERGE-02) | `merged` or `deferred` |

  Rows 1 and 2 fix the precedence between the two independent off switches: the compile-time flag is
  evaluated first, and both produce the same reported value, so no run can report two answers. Row 3
  fixes NFR-5 against AC-1.2 and AC-3.1: the guard governs a merge *this run would perform*, and a
  merge that already happened is not one — refusing it would neither un-merge anything nor unblock
  the queue. Row 3 is the only place `merged` is reported without this run having merged.

AC-1.5 is written this way on purpose: a three-valued flag where one value means "skip the safety
checks" is the flag that eventually gets set in a hurry.

### REQ-MERGE-02 — Merge method policy

- **AC-2.1** — Given a merge is authorized, Then it is attempted with `gh pr merge --rebase`.
- **AC-2.2** — Given rebase-merge fails and the repository permits merge commits, Then a merge
  commit is attempted as the single fallback.
- **AC-2.3** — Given every permitted method has been attempted and failed, Then the phase **stops
  attempting merge methods** — it does not halt the pipeline — records each attempt and its failure,
  and takes AC-1.3's outcome shape: pipeline `success`, `mergeStatus: deferred`, queue status left
  `awaiting-merge`, no queue commit. "Stops attempting methods" and "the pipeline halts" are
  different events; only the former happens here.
- **AC-2.4** — Given the configuration, Then **squash is never attempted** unless
  `allowSquashMerge: true` is explicitly set; it ships `false` and is not part of any fallback
  chain.
- **AC-2.5** — Given the repository's allowed merge methods (queryable via `gh repo view`), Then a
  method the repository forbids is skipped rather than attempted and failed.
- **AC-2.5a** — Given the repository capability query cannot be retrieved or parsed, Then it is a
  failed precondition (AC-1.2b) and no merge is attempted — the phase never assumes a method is
  permitted.
- **AC-2.5b** — Given the repository permits none of the methods this phase may use (e.g. a
  squash-only repository, with `allowSquashMerge` false), Then no method is attempted and the reason
  reported is "no permitted merge method", distinct from AC-2.3's "attempted and failed". The
  reported value is `deferred` in both cases; the distinction is in the reason line, which is what
  tells the operator whether to change a repository setting or investigate a failure.
- **AC-2.6** — Given a successful merge, Then the remote feature branch is deleted when
  `deleteBranchOnPdlcMerge` is configured true, and the local branch is left alone. The setting is
  pdlc's own, named to avoid collision with GitHub's repository setting `deleteBranchOnMerge`; when
  the pdlc setting is false the phase deletes nothing and GitHub's own setting may still act.
- **AC-2.6a** — Given the merge succeeded and the branch deletion failed, Then `mergeStatus` is
  `merged` (the merge is the outcome that matters; a leftover branch is harmless) and the failure is
  reported as a named note. It is not an escalation and never downgrades the merge.

Rationale for AC-2.4, recorded here because it will otherwise read as arbitrary: `se-implement`
produces a TDD commit sequence, Phase DOD produces versioned remediation commits, and
`harvest-learnings` and any future post-mortem read that history. Squash destroys it.

### REQ-MERGE-03 — Self-modification guard

The guard's subject is any path whose **contents participate in the pipeline's own execution** —
workflow sources, skill prompts, hook scripts, and the consumer's runtime copy of the workflows.

- **AC-3.1** — Given the PR's changed-file list includes any path matching a guard path, Then the
  merge is **refused** and escalated to the operator, regardless of CI status, merge mode, or any
  other configuration. The shipped default set is `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`
  and `.claude/workflows/`.
- **AC-3.2** — Given AC-3.1 fires, Then the escalation (REQ-MERGE-06) names every matched path in the
  diff and links the PR, so the operator's review has its scope already delimited.
- **AC-3.3** — Given the guard's path patterns, Then they live in configuration and are additive; a
  repo may add paths but the four defaults cannot be removed by configuration. A configuration that
  attempts to remove one is silently unioned with the defaults — no warning, no error; the defaults
  simply hold.
- **AC-3.4** — Given the changed-file list cannot be retrieved, Then the guard **fires** — an
  unknown diff is treated as pipeline-affecting. The guard fails closed.
- **AC-3.5** — Given the guard, Then its decision is falsifiable by construction: two changed-file
  lists differing only in whether they contain a guard path produce opposite guard outcomes, so a
  guard that has been weakened or removed is observably different from one that has not.
- **AC-3.6** — Given path matching, Then it is **case-sensitive**, applied to repo-relative paths, and
  matches on `/`-delimited **directory prefixes**: `pdlc/workflows/` matches `pdlc/workflows/x.js` and
  `pdlc/workflows/dist/y.js`, and does **not** match `pdlc/workflows-notes/x`, `docs/pdlc/skills/x.md`,
  or `PDLC/Workflows/x.js`. Matching applies to every path the changed-file list reports, including
  deletions and both the old and new path of a rename.
- **AC-3.7** — Given the four defaults are this **pipeline-authoring** repo's own layout, Then a
  consuming repo — where the pipeline arrives as an installed plugin — is expected to add the paths
  that carry its own pipeline-affecting code via the additive configuration of AC-3.3;
  `.claude/workflows/` is a default precisely because it is the one such path that exists in every
  consumer. The consequence in `yumo-plugins` itself is accepted and stated in §6: every PR this
  repo's own queue raises touches `pdlc/workflows/` or `pdlc/skills/`, so Phase MERGE here is
  expected to report `refused` permanently, and `merged` is evidenced through tests rather than
  through a live merge in this repo.

### REQ-MERGE-04 — CI evidence requirement

- **AC-4.1** — Given `ciStatus == "passed"`, Then the CI precondition is satisfied.
- **AC-4.2** — Given `ciStatus == "no-checks"` and `mergeRequiresCi` is true (the default), Then
  the merge is refused and escalated. Phase PUB legitimately treats `no-checks` as a pass for
  *raising* a PR; it is not a pass for *merging* one.
- **AC-4.3** — Given `mergeRequiresCi: false`, Then `no-checks` satisfies the CI precondition. A
  repository genuinely without CI can opt in deliberately.
- **AC-4.4** — Given CI status is any other value, Then the merge is refused.

### REQ-MERGE-05 — Queue status write-back

- **AC-5.1** — Given a merge succeeds, Then the feature's `Status` cell in `docs/_queue/QUEUE.md`
  is written from `awaiting-merge` (or `in-progress`) to `done`.
- **AC-5.2** — Given the merge succeeded but the queue write fails, Then an escalation is raised
  naming both facts explicitly — "merged, queue not updated" — because this state blocks the
  entire serial queue and its cause is not visible from the queue file.
- **AC-5.3** — Given the queue write, Then only the target feature's row is modified; no other row
  and no prose section changes.
- **AC-5.4** — Given the queue file does not exist (a direct `orchestrate-dev` invocation rather
  than a queue-driven one), Then the merge still proceeds and the write-back is skipped without
  error.
- **AC-5.5** — Given the row is written to `done`, Then the merge commit SHA and PR URL are
  recorded alongside it, so `done` carries its evidence.

### REQ-MERGE-06 — Reporting

- **AC-6.1** — Given the pipeline completes, Then the final report carries `mergeStatus` ∈
  {`merged`, `deferred`, `refused`, `skipped`}, and for `merged` also the merge SHA and method used.
- **AC-6.2** — Given `deferred` or `refused`, Then the report names the precondition or guard that
  produced it, in one line.
- **AC-6.3** — Given `orchestrate-queue` receives a pipeline report with `mergeStatus: merged`,
  Then it reports the feature as complete and the next invocation may pick up a dependent feature
  without a human turn.

## 4. Non-functional requirements

- **NFR-1** — Every precondition is evaluated deterministically from `gh` output. No LLM
  participates in the decision to merge.
- **NFR-2** — Merging is irreversible in practice. Every refusal path must be cheaper than every
  merge path: when in doubt, the phase refuses.
- **NFR-3** — The self-modification guard has no override flag of any kind. Not a config value,
  not an environment variable, not a CLI argument.
- **NFR-4** — Phase MERGE adds no new agent dispatch; it is workflow-script logic calling `gh`.
- **NFR-5** — The phase is idempotent: invoked against an already-merged PR it reports `merged`
  and performs no action.

## 5. Scope

**In scope:** Phase MERGE, merge-method policy, self-modification guard, CI evidence rule, queue
write-back, reporting, configuration flags, tests.

**Out of scope:** resolving CI failures or rebase conflicts (`pdlc-advisory-tier`); the loop driver
(`pdlc-engineering-loop`); merging PRs the pipeline did not raise.

## 6. Dependencies

- **BL-01** — `pdlc-workflow-distribution` delivered. This feature is a workflow-script change and
  must not ship into a distribution channel known to be manual.
- **BL-02** — `gh` authenticated with merge rights in the consuming repo, and that repo permitting
  rebase merges. Both are queryable up front (`gh repo view --json rebaseMergeAllowed,
  mergeCommitAllowed,squashMergeAllowed`) and AC-2.5 requires the phase to read them rather than
  assume them; a repo that forbids rebase merges is a supported configuration, not a failure.
- **BL-03** — Existing `ship-pr` skill unchanged. This phase calls `gh` directly rather than adding
  a third job to `ship-pr`, keeping that skill's "one discrete action per invocation, never merges"
  contract intact.

## 7. Deferrals

| ID | Deferred | Rationale | Binds to |
|---|---|---|---|
| D-MERGE-01 | Resolving a merge blocked by conflicts | Conflict resolution is advisory work | `pdlc-advisory-tier` |
| D-MERGE-02 | Auto-responding to review threads | Requires judgment on the comment's substance | `pdlc-advisory-tier` |
| D-MERGE-03 | Merge queues / batched merges | Serial queue makes a merge queue unnecessary at current scale | — |
| D-MERGE-04 | Relaxing `gated` vs `on` (AC-1.5) | Requires operational evidence that the preconditions are over-strict | `pdlc-engineering-loop` |
| D-MERGE-05 | Auto-revert on post-merge base breakage | Detecting it needs cross-run base health monitoring | `pdlc-engineering-loop` |
