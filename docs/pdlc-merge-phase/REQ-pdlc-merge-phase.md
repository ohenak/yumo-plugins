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
| Cross-Reviews | — |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-07-27 |

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
- **AC-1.2** — Given Phase MERGE begins, Then it merges only when **all** hold: Phase PUB returned
  a `prUrl`; `ciStatus == "passed"`; the PR reports mergeable with no conflicts; the PR has no
  unresolved review threads; and the self-modification guard (REQ-MERGE-03) does not fire.
- **AC-1.3** — Given any precondition fails, Then no merge is attempted, the phase records the
  failed precondition by name, the feature's queue status remains `awaiting-merge`, and the
  pipeline outcome is `success` with a merge-deferred note — a merge that did not happen is not a
  pipeline failure.
- **AC-1.4** — Given `PHASE_MERGE_ENABLED = false`, Then the phase is skipped and behavior is
  identical to today. The flag exists so the change is reversible without a revert.
- **AC-1.5** — Given the merge mode configuration `mergeMode` ∈ {`off`, `gated`, `on`}, Then `off`
  never merges, `gated` merges only when every precondition in AC-1.2 holds, and `on` behaves as
  `gated` — there is deliberately **no mode that bypasses the preconditions**. The distinction
  between `gated` and `on` is reserved for future relaxation and today they are equivalent.

AC-1.5 is written this way on purpose: a three-valued flag where one value means "skip the safety
checks" is the flag that eventually gets set in a hurry.

### REQ-MERGE-02 — Merge method policy

- **AC-2.1** — Given a merge is authorized, Then it is attempted with `gh pr merge --rebase`.
- **AC-2.2** — Given rebase-merge fails and the repository permits merge commits, Then a merge
  commit is attempted as the single fallback.
- **AC-2.3** — Given both fail, Then the phase halts merging, records both failures, and leaves
  the queue status `awaiting-merge`.
- **AC-2.4** — Given the configuration, Then **squash is never attempted** unless
  `allowSquashMerge: true` is explicitly set; it ships `false` and is not part of any fallback
  chain.
- **AC-2.5** — Given the repository's allowed merge methods (queryable via `gh repo view`), Then a
  method the repository forbids is skipped rather than attempted and failed.
- **AC-2.6** — Given a successful merge, Then the remote feature branch is deleted when
  `deleteBranchOnMerge` is configured true, and the local branch is left alone.

Rationale for AC-2.4, recorded here because it will otherwise read as arbitrary: `se-implement`
produces a TDD commit sequence, Phase DOD produces versioned remediation commits, and
`harvest-learnings` and any future post-mortem read that history. Squash destroys it.

### REQ-MERGE-03 — Self-modification guard

- **AC-3.1** — Given the PR's changed-file list includes any path under `pdlc/workflows/` or
  `pdlc/skills/`, Then the merge is **refused** and escalated to the operator, regardless of CI
  status, merge mode, or any other configuration.
- **AC-3.2** — Given AC-3.1 fires, Then the escalation names every pipeline-affecting path in the
  diff and links the PR, so the operator's review has its scope already delimited.
- **AC-3.3** — Given the guard's path patterns, Then they live in configuration and are additive;
  a repo may add paths but the two defaults cannot be removed by configuration.
- **AC-3.4** — Given the changed-file list cannot be retrieved, Then the guard **fires** — an
  unknown diff is treated as pipeline-affecting. The guard fails closed.
- **AC-3.5** — Given the guard fires, Then this is asserted by a test that would fail if the guard
  were removed, so the guard cannot be silently deleted.

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
