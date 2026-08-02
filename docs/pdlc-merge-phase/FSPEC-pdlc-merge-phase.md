# FSPEC — pdlc-merge-phase

| Field | Value |
|---|---|
| Upstream | REQ → **FSPEC** |
| Downstream | TSPEC, PLAN, PROPERTIES |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `-v2.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md`, `-v2.md` |
| LEARNINGS | `docs/pdlc-merge-phase/LEARNINGS-pdlc-merge-phase.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude | 1.1 | 2026-08-02 |

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
  phase resolves at §2.2 row 3 (`deferred`).

### 2.2 The evaluation order is the control flow (N-01)

AC-1.6's ordered table **is** the phase's control flow, refined here into the single sequence the
TSPEC implements. It is evaluated top to bottom and the first row that resolves is the answer; no
later row is evaluated once one resolves. **`O1` is observed exactly once, at row 4**, and every
later row that needs PR state reuses that one observation — so no input can resolve at two rows.

| # | Evaluated | Resolves to | Nothing later runs, including |
|---|---|---|---|
| 1 | `PHASE_MERGE_ENABLED` is false | `skipped` | config read, `prUrl` check, `O1`, guard, every observation |
| 2 | `mergeMode` resolves to `off` | `skipped` | `prUrl` check, `O1`, guard, every observation |
| 3 | `prUrl` from Phase PUB is absent or empty | `deferred` — "no PR URL from Phase PUB" | `O1`, guard, every observation. Hoisted here because every later row addresses the PR *by* `prUrl` |
| 4 | `O1` is observed once. Its `state` is unparseable or unrecognised (§3.2) | `refused` — "PR state could not be determined"; **no escalation** | guard, remaining preconditions, merge attempt |
| 5 | that same `O1.state` is `MERGED` | `merged` (§9.1 for `mergeSha` / `mergeMethod`) | guard, remaining preconditions, merge attempt — but **not** the queue write-back (§7.4), which still runs |
| 6 | self-modification guard fires | `refused` | remaining preconditions, merge attempt |
| 7 | a remaining precondition fails (§2.3) | `refused` or `deferred` | merge attempt |
| 8 | merge attempted | `merged` or `deferred` | — |

Rows 3–5 are hoisted above the guard deliberately, and the consequence is stated rather than left to
be discovered: **a run whose `O1` is unparseable resolves at row 4 even when its diff matches a guard
path.** Both readings refuse, so nothing is merged and no safety property turns on the choice; what
turns on it is which `MERGE ESCALATION: ` line a test may assert, and row 4 emits none. The guard's
own fail-closed input (`O5`, the changed-file list) is unaffected — §4.4 still fires the guard when
that list is unretrievable, because the guard is reached in that scenario.

**N-01 is resolved by this table, not by re-reading AC-3.1.** A PR that touches a guard path in a
repo with `mergeMode: "off"` reports **`skipped`**, because row 2 resolves before row 6 is reached.
AC-3.1's "regardless of CI status, merge mode, or any other configuration" is scoped to the
situation in which the guard is *evaluated at all* — rows 6 through 8. Neither reading merges
anything, so no safety property depends on the choice; determinacy of the reported value does, and
this table is the single answer.

Row 1 is evaluated before the configuration file is read at all, so a disabled phase cannot fail on
a malformed config.

### 2.3 Order within row 7 (N-02, Q-01)

Row 7's preconditions are evaluated in **the AC-1.2 table's own top-to-bottom order**, and the
**first** failure in that order is the one reported. `prUrl` presence and `O1`'s parseability are
*not* here — they are rows 3 and 4, above the guard.

| Order | Precondition | Observation | Failure resolves to |
|---|---|---|---|
| 7a | PR open | row 4's `O1.state` (re-used, not re-read) | `deferred` — "PR is CLOSED" |
| 7b | CI evidence | `O2` (§5) | `refused` |
| 7c | Mergeable | row 4's `O1` + bounded re-read (§3.3) | `deferred` |
| 7d | No unresolved review threads | `O3` | `deferred` — "N unresolved review thread(s)" |
| 7e | Merge-method capability retrievable | `O4` | `refused` on unretrievable/unparseable (AC-2.5a); `deferred` when retrieved and no permitted method remains (AC-2.5b) |

**The tie-break is positional, not class-based.** A run holding both `CI pending` (7b, `refused`) and
`mergeable: CONFLICTING` (7c, `deferred`) reports **`refused`** — because 7b precedes 7c, not because
`refused` outranks `deferred`. A run holding both `PR CLOSED` (7a, `deferred`) and `CI failed` (7b,
`refused`) reports **`deferred`**. This is deliberate and is Q-01's answer: a class-based re-sort
would require every observation to be taken before any can be reported, which contradicts the
short-circuit AC-1.6 already fixes, and it would report a CI failure on a PR nobody can merge anyway.
No safety is lost: the failure of *any* precondition means no merge, and that is invariant under the
ordering.

**Evaluation short-circuits within row 7 too:** once a precondition fails, later ones are not
observed. NFR-2 is satisfied because the merge attempt (row 8) is the only state-mutating call and is
reached only when every precondition resolved *pass* — NFR-2 constrains mutation, not observation.

### 2.4 Enable/skip resolution

`PHASE_MERGE_ENABLED` is a pipeline-level flag, defaulting **true**, evaluated first (row 1).
`mergeMode` is read from the consuming repo's configuration (§10), defaults **`off`**, and any
absent, unreadable, malformed or unrecognised value resolves to `off` (AC-7.3). Both produce
`mergeStatus: skipped` and neither evaluates the guard, so a skipped run has exactly one reported
answer.

### 2.5 Idempotent re-entry (NFR-5)

Row 5 is what makes a re-invocation safe. Against an already-merged PR the phase attempts **zero**
merges, evaluates **no** guard, reports `merged` with `mergeMethod: unknown` and `mergeSha` resolved
from the same `O1` observation (§9.1), and re-attempts only the queue write-back idempotently (§7.4).
A PR merged by a human counts. This is the recovery path for AC-5.2's "merged, queue not updated".

**Which statuses row 5 writes (SE Q-02).** The write-back applies `done` when the row's current
status is `in-progress`, `awaiting-merge` or already `done`. Any other status — `pending`, `blocked`,
`halted` — is left untouched and reported as a plain note naming the status found, because a row in
one of those states describes work this run did not drive to completion and overwriting it would
destroy the operator's own record.

## 3. FSPEC-MERGE-02 — GitHub observations

**Links:** REQ-MERGE-01 (AC-1.2, AC-1.2a, AC-1.2b), AC-2.5, AC-3.4, NFR-1, NFR-4.

### 3.1 One substitutable observation point per surface

Phase MERGE reads six external surfaces. Each is an **observation point** — a single place where the
external command is issued and its output turned into one of a closed set of values. Each must be
independently substitutable, so a test can drive the phase with a constructed answer for one surface
while leaving the others alone; that is what makes §11's table testable without a live repository.

Every observation runs through the runtime's existing mechanical transport (the shipped runtime
reaches `gh` and `git` through IO agents). NFR-1/NFR-4 hold because that transport carries **raw
output only**: every decision below is taken by parsing it against the stated value sets, no agent is
asked to judge or summarise anything, and no new reasoning dispatch is added.

| ID | Surface | Command | Fields consumed |
|---|---|---|---|
| `O1` | PR state | `gh pr view {prUrl} --json state,mergeable,mergeStateStatus,number,mergeCommit` | `state`, `mergeable`, `mergeStateStatus`, `number`, `mergeCommit.oid` |
| `O2` | CI rollup | `gh pr view {prUrl} --json statusCheckRollup` | `statusCheckRollup` |
| `O3` | Review threads | `gh api graphql` query returning each review thread's `isResolved` for the PR | `isResolved` per thread |
| `O4` | Repo merge capabilities | `gh repo view --json rebaseMergeAllowed,mergeCommitAllowed,squashMergeAllowed,deleteBranchOnMerge` | the four booleans |
| `O5` | Changed files | `gh pr view {prUrl} --json files` (`files[].path`), falling back to `gh api repos/{owner}/{repo}/pulls/{number}/files` when the list is paginated or the field is absent | `files[].path` (and `previous_filename` where the API supplies it) |
| `O6` | Merge execution | `gh pr merge {prUrl} --rebase` / `gh pr merge {prUrl} --merge`, plus `gh pr view {prUrl} --json mergeCommit,state` to read back the result | `mergeCommit.oid`, `state` |

`O2` is the same rollup classification Phase PUB already uses, reused rather than re-derived, so
`passed` / `pending` / `failed` / `none` / `unknown` mean exactly what they mean there. Reuse is a
requirement, not an optimisation: two classifications of the same rollup that disagree is the defect
AC-4.0 exists to prevent.

`O1`'s `mergeCommit.oid` is populated by GitHub only for a merged PR; it is absent, and that absence
is not a parse failure, for every open PR (§9.1 defines what it is used for). `O3` is the one
observation that cannot be addressed by PR URL — its query needs owner, repo and PR number, all three
of which are derived from `prUrl` (with the number cross-checked against `O1.number`); a derivation
that fails makes `O3` `unknown` under §3.2.

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

Two notes the TSPEC must carry: a literal `mergeable: UNKNOWN` is a *recognised* value handled by
§3.3 and must not be swallowed by the general rule; and `O5` returning an empty list is a **valid**
observation (a PR with no changed files) that passes the guard, distinct from an unretrievable one.

### 3.3 Bounded re-read of `mergeable: UNKNOWN` (AC-1.2a)

GitHub computes mergeability asynchronously, and the window right after Phase DOD's push and Phase
PUB is when `UNKNOWN` is most likely. On `UNKNOWN`, `O1` is re-observed up to `mergeableRetries`
additional times (default 3), each after waiting `mergeableRetryDelay` (default 10 s). The first
re-read yielding `MERGEABLE` or `CONFLICTING` ends the loop and is the answer. Still `UNKNOWN` after
the last re-read is a **deferral**, never a merge and never a `refused`.

**The counts are pinned.** With `mergeableRetries: R`, the total number of `O1` observations in a run
that exhausts the loop is `1 + R` — the row-4 observation plus `R` re-reads — so the default is
**4 observations, 3 re-reads, 3 waits**. The reason line is
`mergeability still UNKNOWN after {1+R} observations`, counting **observations, not re-reads**, so a
suite asserting it never has to guess which number it is reading. `mergeableRetries: 0` is a legal
value meaning "observe once, never re-read", and its reason line reads `after 1 observations` —
ungrammatical and deliberately unspecial-cased, because a format that changes shape at one value is a
format tests get wrong.

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
`pdlc/workflows/` or `pdlc/skills/`, so Phase MERGE here is expected to report `refused` permanently;
the `merged` path is evidenced through tests that drive the observation points directly.

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

The `no-checks` refusal escalates (AC-4.2, line in §9.3). `pending`, `failed` and `unknown` are
reported as `refused` with a reason line (§9.2) and do not escalate — they are ordinary,
self-explanatory states an operator can read off the PR.

## 6. FSPEC-MERGE-05 — Merge execution and method policy

**Links:** REQ-MERGE-02, US-02, BL-02.

### 6.1 Candidate chain

The chain is built **before** any attempt, from `O4` and the configuration, and is filtered — never
attempted-and-failed — for methods the repository forbids (AC-2.5):

| Order | Method | Command | Included when |
|---|---|---|---|
| 1 | rebase | `gh pr merge {prUrl} --rebase` | `rebaseMergeAllowed` is `true` |
| 2 | merge commit | `gh pr merge {prUrl} --merge` | `mergeCommitAllowed` is `true` |
| — | squash | never issued | never — see below |

**Squash is not in the chain.** `allowSquashMerge` ships `false` and is not part of any fallback:
`se-implement` produces a TDD commit sequence, Phase DOD produces versioned remediation commits, and
harvest and any post-mortem read that history. Squash destroys it. Setting `allowSquashMerge: true`
appends squash as a third and last candidate, gated additionally on `squashMergeAllowed`; nothing
else changes.

If `O4` is `unknown`, no chain is built and the phase is `refused` (AC-2.5a). If the chain is empty —
every method this phase may use is forbidden by the repository, e.g. a squash-only repo with
`allowSquashMerge` false — no attempt is made and the phase is `deferred` with the reason **"no
permitted merge method"**, which is a different reason line from §6.3's exhaustion (AC-2.5b). The
value is the same; the reason is what tells the operator whether to change a repository setting or
investigate a failure.

### 6.2 A successful attempt

The first candidate that succeeds ends the chain. Success is confirmed by reading back `O6`: `state`
is `MERGED` and `mergeCommit.oid` is present. The phase records `mergeStatus: merged`, `mergeSha` =
the merge commit SHA (the **full** oid), and `mergeMethod` = the candidate that succeeded (`rebase`
or `merge`). **`shortSha`, used only in the Evidence cell (§7.2), is the first 7 characters of that
full oid** — a fixed-width truncation, not `git`'s variable-length abbreviation, so the written cell
is a pure function of the observed value and an assertion on it cannot flake on repository size.

A command that exits zero but whose read-back does not confirm `MERGED` is treated as a **failed**
attempt and the chain continues — the phase never reports a merge it did not observe.

### 6.3 Exhaustion (AC-2.3)

Each attempt records its method and its failure detail. When every candidate has been attempted and
failed, the phase **stops attempting merge methods**. It does *not* halt: outcome `success`,
`mergeStatus: deferred`, reason naming each attempted method and its failure, queue status left
`awaiting-merge`, no queue commit. "Stops attempting methods" and "the pipeline halts" are different
events; only the former happens here.

### 6.4 Branch handling after a successful merge (AC-2.6, AC-2.6a)

| Setting | Behaviour |
|---|---|
| `deleteBranchOnPdlcMerge: true` (default) | the **remote** feature branch is deleted after the merge is confirmed |
| `deleteBranchOnPdlcMerge: false` | the phase deletes nothing; GitHub's own repository setting `deleteBranchOnMerge` may still act, and that is not this phase's concern |

The **local** branch is left alone in both cases — deleting the branch the working tree may be
standing on is a foot-gun for zero benefit. A deletion failure does **not** downgrade the outcome:
`mergeStatus` stays `merged` and the failure is reported as a plain note, never a
`MERGE ESCALATION: ` line. The merge is the outcome that matters; a leftover branch is harmless.

`deleteBranchOnPdlcMerge` is pdlc's own setting, named to avoid collision with GitHub's repository
setting `deleteBranchOnMerge`, which `O4` reads only so the phase can report it, never so it can act
on it.

## 7. FSPEC-MERGE-06 — Queue write-back

**Links:** REQ-MERGE-05, US-01, US-05.

### 7.1 When it runs

The write-back runs **only** when `mergeStatus` is `merged` — i.e. §2.2 row 6 succeeded, or row 3
found the PR already merged. Every other resolution (`skipped`, `refused`, `deferred`) writes
nothing to the queue and makes no queue commit: the feature's row is left exactly as the driver left
it, `awaiting-merge` or `in-progress` (AC-1.3).

### 7.2 The row transformation

The target feature's `Status` cell becomes the single token `done` — nothing else, no decoration.
Every reader that selects pending work or checks a dependency compares the lowercased status cell by
exact string, so an evidence-decorated cell such as `done (abc1234)` would block every dependent
permanently, which is exactly the outcome US-05 exists to prevent.

The merge evidence goes in a sixth **`Evidence`** cell on the same row, in one of exactly two forms:

| When | Cell content | Example |
|---|---|---|
| a merge SHA is known — this run merged (§6.2), or §2.2 row 5 read `O1.mergeCommit.oid` | `{shortSha} #{prNumber}` | `abc1234 #42` |
| the PR was already merged and `mergeCommit.oid` is absent or unparseable | `merged #{prNumber}` | `merged #42` |

The second form exists because `O1.mergeCommit` is the only SHA source on the already-merged path and
GitHub does not always populate it. `merged` is a literal token, never a SHA-shaped placeholder, so a
reader can never mistake it for a truncated commit. A cell already holding the first form is **not**
downgraded to the second by a later re-entry that cannot resolve the oid: an existing non-empty
`Evidence` cell is left byte-identical whenever the new value would be the `merged #{prNumber}` form.

`Evidence` is safe as a column name against the queue's header lookup, which resolves columns by
*substring* over `order`/`#`, `status`, `feature`, `req path`/`req`/`path`, and
`depends`/`depends-on`/`deps`. `evidence` contains none of those tokens, and columns the lookup does
not recognise are ignored — so an added sixth cell round-trips through parse and rewrite unchanged.

Only the target feature's row changes. No other data row's Status, Feature, REQ Path or Depends-On
cell may change, and no prose section of `QUEUE.md` may change.

### 7.3 The `Evidence` column migration (Q-02)

The queue table ships with five columns. The migration to six is performed **by the first `done`
write**, in the same write, so a repository never needs a manual edit and no operator step stands
between a merge and an advanced queue. Exactly three structural changes are permitted, and only
these:

1. `| Evidence |` appended to the header row;
2. one cell appended to the header **separator** row, so the rendered table stays well-formed;
3. one **empty** cell appended to every other data row, so cell counts stay uniform.

The separator row is named explicitly because AC-5.3 lists only the header and the data rows: it is
neither a data row nor prose, and a six-column header over a five-column separator is a broken table.
Appending an empty cell there is safe — the separator is recognised by every cell being a dash run
**or empty**.

A queue already carrying an `Evidence` column is not migrated again; the write sets the target row's
sixth cell and leaves every other row byte-identical.

### 7.4 Recording channel, idempotence, and the missing cases

The write-back reaches `QUEUE.md` through **the one recording channel that records the `halted` row
today**, extended — not duplicated. One channel is not an optimisation: AC-5.6 requires a direct
`orchestrate-dev` invocation and a queue-driven one to leave the same durable result, and a second
path is how the two would silently diverge.

**This is a change, and the FSPEC states it as one.** The shipped channel already carries the status,
but it carries *only* the status: there is no evidence argument, and its row transform replaces a
single `Status` cell and can neither append a sixth cell nor perform §7.3's header/separator/all-rows
migration. So the extension touches four places — the two entrypoint closures that bind the channel,
the channel's default implementation, its per-run seam, and the shared row transform — and that last
one is also used by the halt path and by the driver's `in-progress` / `awaiting-merge` / `halted`
writes. Those writes must be unaffected: a call carrying no evidence must produce exactly today's
bytes. §13 O-M2 carries the enumeration; the invariance is a required property, not an assumption.

| Situation | Disposition | Behaviour | §11 row | Escalates |
|---|---|---|---|---|
| No `QUEUE.md` at all (direct invocation) | `none` | no write, no git; the merge proceeds and the write-back is skipped **without error** (AC-5.4) | 18 | no |
| `QUEUE.md` present, no row for this feature | `error` | nothing written, git untouched; detail names the missing row | 20 | **yes** |
| Row present, written and committed | `recorded` | `git add -- {queuePath}` then `git commit -m "chore(queue): {feature} → done" -- {queuePath}` — pathspec-scoped, never `-a`, never pushed | 18 | no |
| Row present, already `done` with the same evidence | `recorded` | no semantic change; `git` reports nothing to commit, which is **not** a fault — no warning, no notice (AC-5.8) | 18 | no |
| Row present, written; `git` refuses (hook, missing identity, index lock) | `recorded (uncommitted)` | the row is correct on disk; detail tells the operator to commit it manually | 19 | no — a plain note |
| Row present in a status §2.5 does not overwrite | `recorded` | file unchanged; plain note naming the status found | 18 | no |

**Why a git refusal does not escalate.** AC-5.2's escalation exists because "merged, queue not
updated" *blocks the serial queue*. An uncommitted row is correct on disk, and the next queue pass
reads the file, not the commit — so nothing is blocked, and it takes the same shape as §6.4's branch
deletion: a real remaining action, reported as a note, never downgrading `merged`. A missing row
(`error`) does block, and escalates.

**Row-disposition vocabulary (required change).** The shipped catalogue is
`"halted" | "halted (uncommitted)" | "none" | "error"` — the write's *disposition* named after the
only status it ever wrote. A `done` write reported as `halted` is actively misleading in the final
report. The catalogue becomes **`"recorded" | "recorded (uncommitted)" | "none" | "error"`**: same
four members, same meanings, the two status-bearing ones renamed status-neutral, so one vocabulary
describes a halt row and a done row alike. Existing readers that compare against `halted` change with
it; §13 O-M1 carries the enumeration.

**Idempotence caveat (F-07).** "Byte-identical" holds for rows already in the canonical
`| a | b |` form, which is what the row transform emits and what this repo's `QUEUE.md` uses. A
consumer queue with column-aligned padding is re-emitted canonically on the first write to that row,
producing a real commit. The guarantee is therefore stated as **no semantic change**, and only rows
already canonical are byte-identical.

### 7.5 The driver's post-pipeline write, and F-13

Today the queue driver, after the pipeline returns, computes its own status from the pipeline outcome
alone — `awaiting-merge` on success, `halted` otherwise — and writes it unconditionally, then emits
"…complete — status set to awaiting-merge. Merge the PR, then set it to done to unblock dependents."
That write happens **after** Phase MERGE's, so without a change it silently un-does every `done` this
feature writes, on exactly the path the feature exists for.

Required behaviour (AC-5.6):

| Pipeline report | Driver's post-pipeline status | Operator message |
|---|---|---|
| `outcome: success`, `mergeStatus: merged` | `done` | the "merge the PR, then set it to done" message is **not** emitted; the driver reports the feature complete and merged, naming the merge SHA |
| `outcome: success`, any other `mergeStatus` | `awaiting-merge` (unchanged) | unchanged |
| `outcome: halted` or the pipeline threw | `halted` (unchanged) | unchanged |

The driver still always writes *something*; what changes is that its value derives from `mergeStatus`
as well as `outcome`. Writing `done` over a `done` is idempotent and produces no commit.

**F-13 — the superseded criterion, named.** `pdlc-rcv-budget-stop`'s AC-2.7a states that
`orchestrate-dev` owns no status write but the halt one, and the shipped success path hard-codes its
reported row disposition accordingly. `RLH-AT-32-orch` pins it positively: a successful direct run's
recorded statuses must not contain `done`. AC-5.6 requires precisely that write.

The disposition is recorded here so it is a decision, not a red test resolved by deleting an
assertion: **AC-5.6 supersedes AC-2.7a for the `merged` case only.** The halt path is unchanged, and a
successful run that did *not* merge still writes no status. `RLH-AT-32-orch` is **re-expressed, not
removed**: its assertion becomes "a successful direct run that did not merge records no status", with
a sibling case for the new fact — "a successful direct run reporting `mergeStatus: merged` records
`done`". Deleting it would lose an invariant that still holds on the majority path.

## 8. FSPEC-MERGE-07 — Post-merge working tree and branch handling

**Links:** AC-5.7, AC-2.6/2.6a, SE F-14.

### 8.1 Why the tree must move

Once the human stops merging, nobody restores the working tree. The next queue pass cuts its branch
and runs its dependency triage against whatever the tree is on, so after a merge the tree must be on
the repository's **default branch, updated to contain the merge**. Otherwise the following feature is
cut from a base that does not contain its dependency — the exact stall this feature exists to remove.

### 8.2 Order relative to the queue write (F-14)

**The queue write-and-commit of §7 happens first, while the tree is still on `feat-{feature}`. The
default-branch checkout and update follow.** This order is normative.

The recording channel commits the queue row against whatever branch `HEAD` is on, pathspec-scoped and
unpushed. If the checkout happened first, the `done` commit would land on the **local default
branch** — which in this repo cannot be pushed, so the next pass's fast-forward pull fails and the
following feature is cut from a diverged local base. That is the same class of failure AC-5.7 exists
to prevent, arriving through AC-5.7's own fix.

So the `done` commit is expected to land on the feature branch, and to reach the default branch by
the ordinary route: it is already part of the merged PR's branch, and where it is not (the commit is
made after the merge), it rides the next PR. The queue row on disk is correct either way, which is
what the next pass reads.

### 8.3 The update, and its failure

After the queue write: fetch the default branch, check it out, and fast-forward it to the remote tip
so it contains the merge. The step is complete when the tree is on the default branch and the merge
commit is an ancestor of `HEAD`.

If any part cannot be completed — a dirty tree, a non-fast-forward, a fetch failure — the step
escalates (§9.3) and `mergeStatus` **remains `merged`**. The merge is real; re-reporting it as
anything else would be false. The local feature branch is not deleted (§6.4), so the operator can
inspect it after the escalation.

## 9. FSPEC-MERGE-08 — Reporting contract

**Links:** REQ-MERGE-06.

### 9.1 Report fields

The pipeline's final report gains three fields, present on **every** report — halt reports included,
where they describe a phase that never ran:

| Field | Value |
|---|---|
| `mergeStatus` | exactly one of `merged`, `deferred`, `refused`, `skipped` |
| `mergeSha` | the merge commit SHA when this run merged; `null` otherwise, including when the PR was already merged on entry |
| `mergeMethod` | `rebase` or `merge` when this run merged; `unknown` when the PR was already merged on entry (a pipeline that did not merge cannot know how someone else did); `null` otherwise |

A run that halts before Phase MERGE reports `mergeStatus: skipped` — the phase did not run, and
`skipped` is the value that means "no merge was considered".

`prUrl` and `ciStatus` continue to carry Phase PUB's results and are unchanged. `ciStatus` is Phase
PUB's snapshot; the merge-time CI evidence is not re-reported as `ciStatus` (§5).

### 9.2 The reason line

`deferred` and `refused` each carry, in **one line**, the condition from §11's table that produced
them — the condition, singular, per §2.3's ordering. It rides the Phase MERGE row's detail and is
what an operator reads without opening the report object. Every non-merge keeps the pipeline outcome
`success` (AC-1.3): a merge that did not happen is not a pipeline failure, so the halt path and its
`halted` queue commit are not taken.

### 9.3 Escalations

Escalations are lines on the report's existing operator-facing notices channel, each beginning
`MERGE ESCALATION: `. The four escalating conditions and their lines:

| Condition | Line |
|---|---|
| Guard fired (§4.5) | `MERGE ESCALATION: self-modification guard fired for {prUrl} — matched paths: …` / `— changed-file list could not be retrieved` |
| CI absent with `mergeRequiresCi` (§5) | `MERGE ESCALATION: CI evidence absent for {prUrl} — no checks reported and mergeRequiresCi is true` |
| Merged, queue not updated (AC-5.2) | `MERGE ESCALATION: merged {prUrl} ({shortSha}) but the queue row for {feature} was not updated — {detail}` |
| Merged, tree not updated (§8.3) | `MERGE ESCALATION: working tree not updated after merging {prUrl} — {reason}; tree is on {branch}` |

The queue-write escalation names **both** facts explicitly — merged, and queue not updated — because
that state blocks the entire serial queue and its cause is invisible from the queue file. It does not
halt: halting would misreport the run and write a `halted` row over a feature that has landed. The
recovery path is the escalation plus the idempotent re-attempt of §7.4.

**No escalation implies a halt.** Every escalating condition above keeps outcome `success`.

### 9.4 The merge-deferred note

Every `deferred` and `refused` run also emits one plain (non-escalation) note recording that the
merge did not happen and the queue row was therefore left as it was, so a reader of the run report
sees the queue's state without inferring it:

```
Merge deferred for {feature}: {reason}. Queue row left at awaiting-merge; merge the PR to advance it.
```

### 9.5 Queue-driver pass-through (AC-6.3)

`orchestrate-queue` carries the pipeline report through to its own run report unchanged, so
`mergeStatus`, `mergeSha`, `mergeMethod` and every `MERGE ESCALATION: ` notice are visible from the
queue run without opening the pipeline's report. The driver adds only its own status transition
(§7.5).

The end-to-end effect AC-6.3 asserts, in both halves: given a queue whose only unblocked dependent
lists this feature as its sole dependency, after a run reporting `mergeStatus: merged` that
dependent's row is selected by the **next** `orchestrate-queue` invocation with no human turn; and
given the same queue with this feature's row left `awaiting-merge`, that dependent is **not**
selected. The first asserts the gate opens; the second asserts it was this gate holding it shut.

## 10. FSPEC-MERGE-09 — Configuration

**Links:** REQ-MERGE-07.

### 10.1 Inventory

| Setting | Home | Default | Owner |
|---|---|---|---|
| `PHASE_MERGE_ENABLED` | pipeline-level flag, alongside the existing phase-enable flags | `true` | pdlc maintainer; changed by editing the pipeline |
| `mergeMode` | `.claude/pdlc.config.json` → `merge` | `off` | consuming repo's operator |
| `mergeRequiresCi` | same | `true` | consuming repo's operator |
| `allowSquashMerge` | same | `false` | consuming repo's operator |
| `deleteBranchOnPdlcMerge` | same | `true` | consuming repo's operator |
| guard paths (additive, §4.3) | same | the four of §4.3 | consuming repo's operator, additive only |
| `mergeableRetries` / `mergeableRetryDelay` | same | `3` / `10 s` | consuming repo's operator |

`mergeMode` ∈ {`off`, `gated`, `on`}. `off` never merges; `gated` merges only when every precondition
holds; `on` behaves identically to `gated` today — there is deliberately **no mode that bypasses the
preconditions**, and the `gated`/`on` distinction is reserved for a future relaxation. A three-valued
flag where one value means "skip the safety checks" is the flag that eventually gets set in a hurry.
It ships `off` so installing this feature does not begin auto-merging anyone's repository: that
decision stays the operator's, and dated.

### 10.2 Where the configuration comes from

`.claude/pdlc.config.json` is the documented home of pdlc's per-repo settings, but **no workflow
script reads it today** — the one existing consumer of that file is the shell distribution tooling,
which passes its single key through a separate record. Phase MERGE therefore introduces the first
script-side read of this file. The `merge` section is new and independent of the existing
`distribution` section; reading one must not disturb the other.

### 10.3 Degraded reads (AC-7.3)

| Situation | Behaviour |
|---|---|
| File absent, unreadable, or not valid JSON | every setting takes its default; `mergeMode` is therefore `off` and nothing merges |
| `merge` section absent or not an object | as above |
| One key absent | that key takes its default; the others are honoured |
| One key holds an unrecognised value or wrong type | that key takes its default; the others are honoured |
| Guard-path list absent, not a list, or containing non-strings | contributes nothing; the four defaults hold (§4.3) |

A malformed configuration **never enables merging**, and a degraded read is never an error that
halts: it resolves to the safe default and the run continues. No warning is required, with one
exception worth stating: a `merge` section present but unparseable is reported as a plain note, so an
operator who *intended* to enable merging is not left wondering why nothing merged.

## 11. Observable outcomes per scenario

REQ AC-6.1a's condition table, refined to spec level: each row now names the resolving step, the
reason line's subject, whether the queue is written, and whether an escalation is emitted. It is
exhaustive and exclusive — exactly one row applies to any run — and it is the parameterised suite the
TSPEC and tests pin. Every row's pipeline outcome is `success`.

| # | Condition | Resolves at | `mergeStatus` | Queue written | Escalation |
|---|---|---|---|---|---|
| 1 | `PHASE_MERGE_ENABLED` false | §2.2 r1 | `skipped` | no | no |
| 2 | `mergeMode` resolves `off` (incl. malformed config) | §2.2 r2 | `skipped` | no | no |
| 3 | PR already `MERGED` on entry | §2.2 r3 | `merged` (method `unknown`, no `mergeSha`) | **yes**, idempotent | no |
| 4 | Guard fired — a changed path matched | §4.1 | `refused` | no | **yes** |
| 5 | Guard fired — changed-file list unretrievable | §4.4 | `refused` | no | **yes** |
| 6 | No `prUrl` from Phase PUB | §2.3 5a | `deferred` | no | no |
| 7 | PR state `CLOSED` | §2.3 5b | `deferred` | no | no |
| 8 | PR state unparseable/unrecognised | §3.2 | `refused` | no | no |
| 9 | CI `no-checks` and `mergeRequiresCi` true | §5 | `refused` | no | **yes** |
| 10 | CI `pending` or `failed` | §5 | `refused` | no | no |
| 11 | CI rollup unretrievable/unparseable | §5 | `refused` | no | no |
| 12 | `mergeable` `CONFLICTING`, or `mergeStateStatus` `DIRTY`/`BLOCKED` | §2.3 5d | `deferred` | no | no |
| 13 | `mergeable` still `UNKNOWN` after the bounded re-reads | §3.3 | `deferred` | no | no |
| 14 | One or more unresolved review threads | §2.3 5e | `deferred` | no | no |
| 15 | Capability query unretrievable/unparseable | §2.3 5f | `refused` | no | no |
| 16 | No permitted merge method remains | §6.1 | `deferred` (reason "no permitted merge method") | no | no |
| 17 | Every permitted method attempted and failed | §6.3 | `deferred` (reason names each attempt) | no | no |
| 18 | Merge performed and succeeded | §6.2 | `merged` + `mergeSha` + `mergeMethod` | **yes** | no |
| 19 | Merged, remote branch deletion failed | §6.4 | `merged` | **yes** | no — a plain note |
| 20 | Merged, queue write failed | §7.4 | `merged` | attempted, failed | **yes** |
| 21 | Merged, working tree not updated | §8.3 | `merged` | **yes** | **yes** |

Rows 1–2 and 4–5 are the two pairs a reader is most likely to conflate. Rows 1–2 both report
`skipped` and neither evaluates the guard (§2.2). Rows 4–5 both report `refused` and differ only in
the escalation's text, which is the operator's whole signal about which happened.

`refused` means a safety rule said no; `deferred` means an ordinary not-ready condition a later
re-invocation could satisfy. Rows 16 and 17 share a value and differ in the reason line, because that
line is what tells the operator whether to change a repository setting or investigate a failure.

## 12. Acceptance tests

§11's table is itself the primary acceptance suite: one case per row, asserting the four columns plus
the reason line. These five cover behaviour the table does not express.

| ID | Who / Given / When / Then |
|---|---|
| AT-M1 | **Operator.** Given a five-column `QUEUE.md` with three data rows and a merged PR for row 2, When Phase MERGE writes back, Then the header gains `Evidence`, the separator and the other two data rows each gain one empty cell, row 2's Status cell reads exactly `done`, its Evidence cell reads `{shortSha} #{prNumber}`, and no other cell in the file changes |
| AT-M2 | **Operator.** Given the same queue already carrying an `Evidence` column and row 2 already `done` with the same evidence, When Phase MERGE re-runs against the already-merged PR, Then the file is byte-identical, no commit is produced, and no notice is emitted |
| AT-M3 | **Operator.** Given two changed-file lists identical except that one contains `pdlc/skills/x.md`, When the guard evaluates each, Then the outcomes are opposite — `refused` with that path named, and not-refused — and the near-miss paths `pdlc/skills-notes/x.md`, `docs/pdlc/skills/x.md` and `PDLC/Skills/x.md` all fall on the not-refused side |
| AT-M4 | **Operator.** Given a queue-driven run whose pipeline report carries `mergeStatus: merged`, When the driver takes its post-pipeline transition, Then it records `done` (not `awaiting-merge`) and does not emit the "merge the PR, then set it to done" message |
| AT-M5 | **Operator.** Given a queue whose only unblocked dependent depends solely on this feature, When a run reports `mergeStatus: merged`, Then the next queue invocation selects that dependent with no human turn; and given the same queue with this feature left `awaiting-merge`, that dependent is not selected |

## 13. Obligations and open questions

| ID | Owner | Obligation |
|---|---|---|
| O-M1 | TSPEC | The row-disposition vocabulary of §7.4 must stop reporting a `done` write as `halted`. Name the members and the migration for existing readers |
| O-M2 | TSPEC | Names, signatures and injection mechanics for the six observation points of §3.1 and for the queue-recording channel of §7.4 |
| O-M3 | TSPEC | The `O3` review-thread GraphQL query text and its pagination behaviour. `reviewDecision` is **not** an accepted substitute (REQ AC-1.2) |
| O-M4 | TSPEC | `O5`'s pagination completeness rule: how the phase knows a changed-file list is complete, since an incomplete list must fail closed (§4.4) rather than silently pass the guard |
| O-M5 | TSPEC | Where `.claude/pdlc.config.json`'s `merge` section is read and cached within a run, given §2.2 row 1 must resolve before any read occurs |
| O-M6 | PLAN | Re-expression of `RLH-AT-32-orch` per §7.5, plus its new sibling case — as a task, so the change is reviewed rather than discovered as a red test |

No open questions remain for the requester. Both round-2 questions (TE Q-01, Q-02) are answered in
§2.3 and §7.3.

## 14. Traceability

| FSPEC | REQ | User stories |
|---|---|---|
| §2 FSPEC-MERGE-01 | REQ-MERGE-01, NFR-2, NFR-5 | US-01 |
| §3 FSPEC-MERGE-02 | AC-1.2, AC-1.2a, AC-1.2b, NFR-1, NFR-4 | US-04 |
| §4 FSPEC-MERGE-03 | REQ-MERGE-03, NFR-3 | US-03 |
| §5 FSPEC-MERGE-04 | REQ-MERGE-04 | US-04 |
| §6 FSPEC-MERGE-05 | REQ-MERGE-02 | US-02 |
| §7 FSPEC-MERGE-06 | REQ-MERGE-05 | US-01, US-05 |
| §8 FSPEC-MERGE-07 | AC-5.7, AC-2.6, AC-2.6a | US-01 |
| §9 FSPEC-MERGE-08 | REQ-MERGE-06 | US-01, US-05 |
| §10 FSPEC-MERGE-09 | REQ-MERGE-07 | US-03, US-04 |
