# FSPEC — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `-v2.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md`, `-v2.md` |
| LEARNINGS | `docs/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.0 | 2026-08-02 |

## 1. Scope and entry obligations

This FSPEC specifies the behaviour of **Phase MERGE**, the last phase of the `orchestrate-dev`
pipeline, plus the two adjacent behaviours REQ §5 scopes in: the queue driver's post-pipeline status
transition (AC-5.6) and the post-merge working-tree state (AC-5.7).

It is written against an approved REQ (v1.1, both cross-reviews `APPROVED`). Per the REQ's §8
stopping rule, four non-blocking round-2 findings were routed here as **named entry obligations**.
Each is resolved below; this table is the record.

| Finding | Obligation | Resolved in |
|---|---|---|
| TE **N-01** | AC-3.1's "regardless of … merge mode" vs AC-1.6 rows 1–2 | §2.2 — the ordered evaluation of §2.1 is the sole authority; `skipped` wins over `refused` because the guard is never reached. AC-3.1's "regardless" is read as scoped to rows 4–6 |
| TE **N-02** | Precedence among simultaneous precondition failures | §2.3 — the AC-1.2 table's own top-to-bottom row order is *the* evaluation order, one failure reported, no `refused`-beats-`deferred` re-sort |
| SE **F-13** | Name the superseded criterion and the test to re-express | §7.5 — AC-5.6 supersedes `pdlc-rcv-budget-stop` AC-2.7a for the `merged` case only; `RLH-AT-32-orch` is re-expressed, not deleted |
| SE **F-14** | Order of AC-5.7's checkout vs the queue write-and-commit | §8.2 — the queue write-and-commit happens **first**, on the feature branch; the default-branch checkout follows |

Two round-2 questions are also answered here: TE **Q-01** (the N-02 tie-break — §2.3) and TE **Q-02**
(when the `Evidence` column migration happens — §7.3).

**Altitude.** This document states *observable behaviour*: which external surface each fact is read
from, what values are recognised, which decision follows, and what the operator sees. Where a
behaviour requires an internal substitution point so a test can drive it, this FSPEC states that a
**single substitutable observation point per external surface is required** and names it by its
behavioural role (`O1`…`O6`, §3). The seam's actual name, signature and injection mechanics are
TSPEC-owned (§13). Commands and JSON field names *are* stated: they are the contract with GitHub, not
an internal contract, and the REQ already names them (AC-1.2, BL-02).

**Out of scope**, unchanged from REQ §5: resolving CI failures or rebase conflicts, the loop driver,
and merging PRs the pipeline did not raise.

## 2. FSPEC-MERGE-01 — Phase MERGE placement and control flow

**Links:** REQ-MERGE-01, NFR-2, NFR-5.

### 2.1 Placement

Phase MERGE runs **inside the pipeline body, immediately after Phase PUB**, and is the last phase.
Consequences that follow from the existing pipeline shape and are therefore requirements on this
phase:

- It runs inside the same guarded body as every other phase, so anything it throws is caught by the
  pipeline's halt path. **Phase MERGE never throws.** Every failure it can observe resolves to a
  reported value (§9); AC-1.3 requires the pipeline outcome to stay `success` for every non-merge,
  and a throw here would take the halt path and write a `halted` queue row over a feature whose only
  fault is that its PR was not ready.
- It records a phase row like every other phase: `MERGE`, title `Merge PR`, one status glyph
  (`✅` merged, `⏭` skipped, `⚠️` deferred or refused) and a one-line detail naming the resolving
  condition.
- It reads `prUrl` from Phase PUB's result. When Phase PUB is disabled or produced no `prUrl`, the
  phase resolves at §2.1 row for "no PR" (`deferred`).

### 2.2 The evaluation order is the control flow (N-01)

AC-1.6's ordered table **is** the phase's control flow. It is evaluated top to bottom and the first
row that resolves is the answer; no later row is evaluated once one resolves.

| # | Evaluated | Resolves to | Nothing later runs, including |
|---|---|---|---|
| 1 | `PHASE_MERGE_ENABLED` is false | `skipped` | config read, guard, every observation |
| 2 | `mergeMode` resolves to `off` | `skipped` | guard, every observation |
| 3 | PR state is already `MERGED` | `merged` (method `unknown`) | guard, remaining preconditions, merge attempt — but **not** the queue write-back (§7.4), which still runs |
| 4 | self-modification guard fires | `refused` | remaining preconditions, merge attempt |
| 5 | a remaining precondition fails (§2.3) | `refused` or `deferred` | merge attempt |
| 6 | merge attempted | `merged` or `deferred` | — |

**N-01 is resolved by this table, not by re-reading AC-3.1.** A PR that touches a guard path in a
repo with `mergeMode: "off"` reports **`skipped`**, because row 2 resolves before row 4 is reached.
AC-3.1's "regardless of CI status, merge mode, or any other configuration" is scoped to the
situation in which the guard is *evaluated at all* — rows 4 through 6. Neither reading merges
anything, so no safety property depends on the choice; determinacy of the reported value does, and
this table is the single answer.

Row 1 is evaluated before the configuration file is read at all, so a disabled phase cannot fail on
a malformed config.

### 2.3 Order within row 5 (N-02, Q-01)

Row 5's preconditions are evaluated in **the AC-1.2 table's own top-to-bottom order**, and the
**first** failure in that order is the one reported:

| Order | Precondition | Observation | Failure resolves to |
|---|---|---|---|
| 5a | PR exists | Phase PUB's `prUrl` | `deferred` — "no PR URL from Phase PUB" |
| 5b | PR open | `O1` (§3) | `deferred` — "PR is CLOSED" |
| 5c | CI evidence | `O2` (§5) | `refused` |
| 5d | Mergeable | `O1` + bounded re-read (§3.3) | `deferred` |
| 5e | No unresolved review threads | `O3` | `deferred` — "N unresolved review thread(s)" |
| 5f | Merge-method capability retrievable | `O4` | `refused` on unretrievable/unparseable (AC-2.5a); `deferred` when retrieved and no permitted method remains (AC-2.5b) |

**The tie-break is positional, not class-based.** A run holding both `CI pending` (5c, `refused`) and
`mergeable: CONFLICTING` (5d, `deferred`) reports **`refused`** — because 5c precedes 5d, not because
`refused` outranks `deferred`. A run holding both `PR CLOSED` (5b, `deferred`) and `CI failed` (5c,
`refused`) reports **`deferred`**. This is deliberate and is Q-01's answer: a class-based re-sort
would require every observation to be taken before any can be reported, which contradicts the
short-circuit AC-1.6 already fixes, and it would report a CI failure on a PR nobody can merge anyway.
No safety is lost: the failure of *any* precondition means no merge, and that is invariant under the
ordering.

**Evaluation is short-circuit within row 5 as well.** Once a precondition fails, later ones are not
observed. NFR-2's "no state-mutating call is issued before every precondition has been evaluated" is
satisfied because the merge attempt (row 6) is the only state-mutating call and it is reached only
when every precondition has resolved *pass* — NFR-2 constrains mutation, not observation.

### 2.4 Enable/skip resolution

`PHASE_MERGE_ENABLED` is a pipeline-level flag, defaulting **true**, evaluated first (row 1).
`mergeMode` is read from the consuming repo's configuration (§10), defaults **`off`**, and any
absent, unreadable, malformed or unrecognised value resolves to `off` (AC-7.3). Both produce
`mergeStatus: skipped` and neither evaluates the guard, so a skipped run has exactly one reported
answer.

### 2.5 Idempotent re-entry (NFR-5)

Row 3 is what makes a re-invocation safe. Against an already-merged PR the phase attempts **zero**
merges, evaluates **no** guard, reports `merged` with `mergeMethod: unknown` and no `mergeSha` it did
not observe, and re-attempts only the queue write-back idempotently (§7.4). A PR merged by a human
counts. This is the recovery path for AC-5.2's "merged, queue not updated".

## 3. FSPEC-MERGE-02 — GitHub observations

**Links:** REQ-MERGE-01 (AC-1.2, AC-1.2a, AC-1.2b), AC-2.5, AC-3.4, NFR-1, NFR-4.

### 3.1 One substitutable observation point per surface

Phase MERGE reads six external surfaces. Each is an **observation point** — a single place where the
external command is issued and its output turned into one of a closed set of values. Each must be
independently substitutable, so a test can drive the phase with a constructed answer for one surface
while leaving the others alone; that is what makes §11's table testable without a live repository.

Every observation runs through the runtime's existing mechanical transport (the shipped runtime
reaches `gh` and `git` through IO agents). NFR-1/NFR-4 hold because the transport carries **raw
output only** and every decision below is taken by parsing that output against the stated value sets —
no agent is asked to judge, summarise, or decide, and no new reasoning dispatch is added.

| ID | Surface | Command | Fields consumed |
|---|---|---|---|
| `O1` | PR state | `gh pr view {prUrl} --json state,mergeable,mergeStateStatus,number` | `state`, `mergeable`, `mergeStateStatus`, `number` |
| `O2` | CI rollup | `gh pr view {prUrl} --json statusCheckRollup` | `statusCheckRollup` |
| `O3` | Review threads | `gh api graphql` query returning each review thread's `isResolved` for the PR | `isResolved` per thread |
| `O4` | Repo merge capabilities | `gh repo view --json rebaseMergeAllowed,mergeCommitAllowed,squashMergeAllowed,deleteBranchOnMerge` | the four booleans |
| `O5` | Changed files | `gh pr view {prUrl} --json files` (`files[].path`), falling back to `gh api repos/{owner}/{repo}/pulls/{number}/files` when the list is paginated or the field is absent | `files[].path` (and `previous_filename` where the API supplies it) |
| `O6` | Merge execution | `gh pr merge {prUrl} --rebase` / `gh pr merge {prUrl} --merge`, plus `gh pr view {prUrl} --json mergeCommit,state` to read back the result | `mergeCommit.oid`, `state` |

`O2` is the same rollup classification Phase PUB already uses, reused rather than re-derived, so
`passed` / `pending` / `failed` / `none` / `unknown` mean exactly what they mean there. Reuse is a
requirement, not an optimisation: two classifications of the same rollup that disagree is the defect
AC-4.0 exists to prevent.

### 3.2 Fail-closed parse rule — one rule, applied per surface

For every observation: **if the command cannot be run, its output cannot be parsed as JSON, the
expected field is absent, or the field's value is not a member of that row's recognised set, the
observation yields `unknown`, and `unknown` is a failed precondition.** This is AC-1.2b, and it is
the only rule; no surface has a permissive variant.

| ID | Recognised values | Passes when | `unknown` resolves to |
|---|---|---|---|
| `O1` `state` | `OPEN`, `CLOSED`, `MERGED` | `OPEN` (`MERGED` resolves at §2.2 row 3) | `refused` (AC-1.2b) |
| `O1` `mergeable` | `MERGEABLE`, `CONFLICTING`, `UNKNOWN` | `MERGEABLE` | `refused` — except the literal `UNKNOWN`, which is a recognised value handled by §3.3 |
| `O1` `mergeStateStatus` | `CLEAN`, `UNSTABLE`, `BEHIND`, `BLOCKED`, `DIRTY`, `DRAFT`, `HAS_HOOKS`, `UNKNOWN` | any value other than `DIRTY` and `BLOCKED` | `refused` |
| `O2` | `passed`, `pending`, `failed`, `none`, `unknown` | per §5 | `refused` |
| `O3` | a list of booleans | every thread `isResolved: true`, or the list is empty | `refused` |
| `O4` | four booleans | all four parse as booleans | `refused` (AC-2.5a — never assume a method is permitted) |
| `O5` | a list of repo-relative path strings | the list parses and is complete | `refused` (AC-3.4 — the guard fires) |
| `O6` | see §6 | see §6 | the attempt counts as failed (§6.3) |

Two notes the TSPEC must carry: a `mergeable` of literal `UNKNOWN` is a *recognised* value, so §3.3
handles it and it must not be swallowed by the general rule; and `O5` returning an empty list is a
**valid** observation (a PR with no changed files) that passes the guard, distinct from an
unretrievable list.

### 3.3 Bounded re-read of `mergeable: UNKNOWN` (AC-1.2a)

GitHub computes mergeability asynchronously, and the window right after Phase DOD's push and Phase
PUB is when `UNKNOWN` is most likely. On `UNKNOWN`, `O1` is re-observed up to `mergeableRetries`
additional times (default 3), each after waiting `mergeableRetryDelay` (default 10 s). The first
re-read yielding `MERGEABLE` or `CONFLICTING` ends the loop and is the answer. Still `UNKNOWN` after
the last re-read is a **deferral** (`mergeStatus: deferred`, reason "mergeability still UNKNOWN after
N re-reads"), never a merge and never a `refused`.

A re-read that fails to parse follows §3.2 and ends the loop with `refused` — a transport failure is
not a retry-worthy `UNKNOWN`.

## 4. FSPEC-MERGE-03 — Self-modification guard

**Links:** REQ-MERGE-03, US-03, NFR-3.

### 4.1 Decision

The guard is evaluated at §2.2 row 4 — after the two off switches and after the already-`MERGED`
check, before every other precondition. It takes `O5`'s changed-file list and the effective guard
path set (§4.3), and fires when **any** reported path matches **any** guard path. Firing resolves the
phase to `refused` and produces an escalation (§4.5). The guard has no override of any kind — no
configuration value, no environment variable, no argument, no force flag (NFR-3).

### 4.2 Prefix-match semantics (AC-3.6)

Matching is a **case-sensitive, `/`-delimited directory-prefix** test on repo-relative paths. A path
`p` matches guard path `g` (which always ends in `/`) when `p` begins with the exact characters of
`g`. No globbing, no normalisation, no case folding, no substring search.

| Changed path | vs `pdlc/workflows/` | Why |
|---|---|---|
| `pdlc/workflows/x.js` | **match** | exact prefix |
| `pdlc/workflows/dist/y.js` | **match** | prefix, any depth |
| `pdlc/workflows-notes/x` | no match | `-` is not `/`; the prefix `pdlc/workflows/` is absent |
| `docs/pdlc/workflows/x.md` | no match | prefix must start at position 0 |
| `PDLC/Workflows/x.js` | no match | case-sensitive |

Every path the changed-file list reports is matched, including **deletions** and, for a rename,
**both** the old and the new path. Where the surface reports a rename with a previous path, both are
tested; where it reports only the new path, that is the list as observed and the phase does not
synthesise the other.

Falsifiability (AC-3.5): the guard's decision is a pure function of (changed-file list, guard path
set), so two lists differing only in the presence of one guard path produce opposite outcomes. A
weakened or removed guard is observably different from an intact one.

### 4.3 Additive configuration (AC-3.3)

Shipped defaults, which cannot be removed:

```
pdlc/workflows/   pdlc/skills/   pdlc/hooks/   .claude/workflows/
```

The effective set is `defaults ∪ configured`. A configuration listing fewer paths, listing none, or
explicitly attempting to remove a default is **silently unioned** with the defaults — no warning, no
error, no report line; the defaults simply hold. A configuration value that is absent, not a list, or
whose members are not strings contributes nothing and the defaults hold (§10.3). Configured paths not
ending in `/` are treated as directory prefixes with a `/` appended, so `src/pipeline` and
`src/pipeline/` behave identically and neither matches `src/pipeline-notes/`.

The four defaults are this repo's own layout. A consuming repo where pdlc arrives as an installed
plugin is expected to add the paths carrying its own pipeline-affecting code; `.claude/workflows/` is
a default because it is the one such path that exists in every consumer (AC-3.7).

### 4.4 Fail closed on an unretrievable list (AC-3.4)

If `O5` yields `unknown` under §3.2 — command failure, unparseable output, absent `files` field, a
truncated or paginated list the phase cannot complete — the guard **fires**. An unknown diff is
treated as pipeline-affecting. The escalation names the retrieval failure rather than a matched path,
so the operator can tell "the pipeline touched itself" from "I could not find out".

### 4.5 Escalation notice format (AC-3.2, AC-6.2a)

The guard's escalation is emitted onto the final report's existing operator-facing notices channel,
one line per notice, each beginning with the stable prefix `MERGE ESCALATION: `. The prefix is the
whole contract — an escalation is something a reader or a test finds by string.

```
MERGE ESCALATION: self-modification guard fired for {prUrl} — matched paths: {path}, {path}, …
MERGE ESCALATION: self-modification guard fired for {prUrl} — changed-file list could not be retrieved
```

Every matched path appears, so the operator's review has its scope delimited before they open the PR.
An escalation never implies a halt: outcome stays `success` (AC-1.3).

**Consequence accepted in this repo (AC-3.7, BL-04).** Every PR this repo's own queue raises touches
`pdlc/workflows/` or `pdlc/skills/`, so Phase MERGE here is expected to report `refused`
permanently. The `merged` path is evidenced through tests that drive the observation points
directly, not through a live merge here.

## 5. FSPEC-MERGE-04 — CI evidence rule

**Links:** REQ-MERGE-04, US-04.

CI evidence is established **at merge time** by re-reading the rollup through `O2` (AC-4.0). Phase
PUB's `ciStatus` is a snapshot taken before Phase DOD remediation and before any base movement; it is
carried in the report but is **not** the merge evidence. Re-reading is what gives `pending` and
`failed` a reachable domain at merge time — checks re-run when the base moves, and a check green at
Phase PUB can fail on a re-run.

| `O2` re-read | `mergeRequiresCi: true` (default) | `mergeRequiresCi: false` |
|---|---|---|
| `passed` | precondition satisfied | precondition satisfied |
| `none` (no checks) | **refused** + escalation (AC-4.2) | precondition satisfied (AC-4.3) |
| `pending` | **refused** | **refused** |
| `failed` | **refused** | **refused** |
| `unknown` (unretrievable/unparseable) | **refused** | **refused** |

`mergeRequiresCi` relaxes exactly one cell. It does not make `pending`, `failed` or `unknown`
acceptable: a repository with no CI is a supported configuration, a repository whose CI is red is not.
Phase PUB legitimately treats `no-checks` as a pass for *raising* a PR; that is not a pass for
*merging* one.

The `no-checks` refusal escalates (AC-4.2):

```
MERGE ESCALATION: CI evidence absent for {prUrl} — no checks reported and mergeRequiresCi is true
```

`pending`, `failed` and `unknown` are reported as `refused` with a reason line (§9.2) and do not
escalate — they are ordinary, self-explanatory states an operator can read off the PR.

## 6. FSPEC-MERGE-05 — Merge execution and method policy

## 7. FSPEC-MERGE-06 — Queue write-back

## 8. FSPEC-MERGE-07 — Post-merge working tree and branch handling

## 9. FSPEC-MERGE-08 — Reporting contract

## 10. FSPEC-MERGE-09 — Configuration

## 11. Observable outcomes per scenario

## 12. Acceptance tests

## 13. Obligations and open questions

## 14. Traceability
