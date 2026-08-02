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

It is written against an approved REQ (v1.1). Per the REQ's §8 stopping rule, four non-blocking
round-2 findings were routed here as **named entry obligations**; each is resolved below.

| Finding | Obligation | Resolved in |
|---|---|---|
| TE **N-01** | AC-3.1's "regardless of … merge mode" vs AC-1.6 rows 1–2 | §2.2 — the ordered evaluation is the sole authority; `skipped` wins because the guard is never reached |
| TE **N-02** | Precedence among simultaneous precondition failures | §2.3 — the AC-1.2 table's own top-to-bottom order is *the* evaluation order, one failure reported |
| SE **F-13** | Name the superseded criterion and the test to re-express | §7.5 — AC-5.6 supersedes `pdlc-rcv-budget-stop` AC-2.7a for the `merged` case only |
| SE **F-14** | Order of AC-5.7's checkout vs the queue write-and-commit | §8.2 — the checkout happens first; both queue writes land on the default branch |

**Altitude.** This document states *observable behaviour*: which external surface each fact is read
from, what values are recognised, which decision follows, and what the operator sees. Where a
behaviour needs an internal substitution point so a test can drive it, this FSPEC requires **one
substitutable observation point per external surface** and names it by behavioural role (`O1`…`O6`,
§3); names, signatures and injection are TSPEC-owned (§13). Commands and JSON field names *are*
stated: they are the contract with GitHub, not an internal one, and the REQ names them (AC-1.2).

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
  reported value (§9); a throw would take the halt path and write a `halted` queue row over a feature
  whose only fault is that its PR was not ready, contradicting AC-1.3.
- It records a phase row: `MERGE`, title `Merge PR`, one status glyph (`✅` merged, `⏭` skipped,
  `⚠️` deferred or refused) and a one-line detail naming the resolving condition.
- It reads `prUrl` from Phase PUB's result; absent or empty resolves at §2.2 row 3 (`deferred`).

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
own fail-closed input (`O5`) is unaffected — §4.4 still fires the guard when the changed-file list is
unretrievable, because the guard *is* reached in that scenario.

**N-01 is resolved by this table, not by re-reading AC-3.1.** A PR touching a guard path in a repo
with `mergeMode: "off"` reports **`skipped`**: row 2 resolves before row 6 is reached, and AC-3.1's
"regardless of CI status, merge mode, or any other configuration" is scoped to the situation in which
the guard is *evaluated at all* — rows 6 through 8. Neither reading merges anything, so only
determinacy turns on the choice, and this table is the single answer. Row 1 is evaluated before the
configuration file is read, so a disabled phase cannot fail on a malformed config.

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
`refused`) reports **`deferred`**. This is Q-01's answer: a class-based re-sort would require every
observation to be taken before any can be reported, contradicting the short-circuit AC-1.6 fixes, and
would report a CI failure on a PR nobody can merge anyway. No safety is lost — the failure of *any*
precondition means no merge, invariant under the ordering.

**Evaluation short-circuits within row 7 too:** once a precondition fails, later ones are not
observed. NFR-2 is satisfied because the merge attempt (row 8) is the only state-mutating call and is
reached only when every precondition resolved *pass* — NFR-2 constrains mutation, not observation.

### 2.4 Enable/skip resolution

`PHASE_MERGE_ENABLED` is a pipeline-level flag defaulting **true**, evaluated first (row 1).
`mergeMode` comes from the consuming repo's configuration (§10), defaults **`off`**, and any absent,
unreadable, malformed or unrecognised value resolves to `off` (AC-7.3). Both produce
`mergeStatus: skipped` and neither evaluates the guard, so a skipped run has one reported answer.

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

Phase MERGE reads six external surfaces. Each is an **observation point** — one place where the
command is issued and its output turned into one of a closed set of values — and each must be
independently substitutable, so a test can drive the phase with a constructed answer for one surface
while leaving the others alone. That is what makes §11's table testable without a live repository.

Every observation runs through the runtime's existing mechanical transport. NFR-1/NFR-4 hold because
that transport carries **raw output only**: every decision below is taken by parsing it against the
stated value sets, no agent judges or summarises anything, and no reasoning dispatch is added.

| ID | Surface | Command | Fields consumed |
|---|---|---|---|
| `O1` | PR state | `gh pr view {prUrl} --json state,mergeable,mergeStateStatus,number,mergeCommit` | `state`, `mergeable`, `mergeStateStatus`, `number`, `mergeCommit.oid` |
| `O2` | CI rollup | `gh pr view {prUrl} --json statusCheckRollup` | `statusCheckRollup` |
| `O3` | Review threads | `gh api graphql` query returning each review thread's `isResolved` for the PR | `isResolved` per thread |
| `O4` | Repo merge capabilities | `gh repo view --json rebaseMergeAllowed,mergeCommitAllowed,squashMergeAllowed,deleteBranchOnMerge` | the four booleans |
| `O5` | Changed files | `gh pr view {prUrl} --json files` (`files[].path`), falling back to `gh api repos/{owner}/{repo}/pulls/{number}/files` when the list is paginated or the field is absent | `files[].path` (and `previous_filename` where the API supplies it) |
| `O6` | Merge execution | `gh pr merge {prUrl} --rebase` / `gh pr merge {prUrl} --merge`, plus `gh pr view {prUrl} --json mergeCommit,state` to read back the result | `mergeCommit.oid`, `state` |

`O2` reuses Phase PUB's rollup classification rather than re-deriving it, so
`passed` / `pending` / `failed` / `none` / `unknown` mean exactly what they mean there. Reuse is a
requirement: two classifications of the same rollup that disagree is the defect AC-4.0 prevents.

`O1`'s `mergeCommit.oid` is populated by GitHub only for a merged PR; it is absent, and that absence
is not a parse failure, for every open PR (§9.1 defines what it is used for). `O3` is the one
observation that cannot be addressed by PR URL — its query needs owner, repo and PR number, all three
of which are derived from `prUrl` (with the number cross-checked against `O1.number`); a derivation
that fails makes `O3` `unknown` under §3.2.

### 3.2 Fail-closed parse rule — one rule, applied per surface

For every observation: **if the command cannot be run, its output cannot be parsed as JSON, the
expected field is absent, or its value is not in that row's recognised set, the observation yields
`unknown`, and `unknown` is a failed precondition.** That is AC-1.2b and it is the only rule — no
surface has a permissive variant.

| ID | Recognised values | Passes when | `unknown` resolves to |
|---|---|---|---|
| `O1` `state` | `OPEN`, `CLOSED`, `MERGED` | `OPEN` (`MERGED` resolves at §2.2 row 5) | `refused` at §2.2 row 4 (AC-1.2b) |
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

**The counts are pinned.** With `mergeableRetries: R`, a run that exhausts the loop makes `1 + R`
`O1` observations — the row-4 observation plus `R` re-reads — so the default is **4 observations,
3 re-reads, 3 waits**. The reason line is `mergeability still UNKNOWN after {1+R} observations`,
counting **observations, not re-reads**, so a suite asserting it never has to guess which number it
reads. `mergeableRetries: 0` is legal ("observe once, never re-read") and yields `after 1
observations` — ungrammatical and deliberately unspecial-cased, because a format that changes shape
at one value is a format tests get wrong.

A re-read that fails to parse follows §3.2 and ends the loop with `refused` — a transport failure is
not a retry-worthy `UNKNOWN`.

## 4. FSPEC-MERGE-03 — Self-modification guard

**Links:** REQ-MERGE-03, US-03, NFR-3.

### 4.1 Decision

The guard is evaluated at §2.2 row 6 — after the two off switches, the `prUrl` check and the `O1`
read, before every other precondition. It takes `O5`'s changed-file list and the effective guard path
set (§4.3), and fires when **any** reported path matches **any** guard path, resolving the phase to
`refused` with an escalation (§4.5). It has no override of any kind — no configuration value, no
environment variable, no argument, no force flag (NFR-3).

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

Every path the list reports is matched, including **deletions** and, for a rename, **both** the old
and the new path where the surface supplies both; where it reports only the new path, that is the
list as observed and the phase synthesises nothing.

Falsifiability (AC-3.5): the decision is a pure function of (changed-file list, guard path set), so
two lists differing only in one guard path produce opposite outcomes — AT-M3 asserts both arms.

### 4.3 Additive configuration (AC-3.3)

Shipped defaults, which cannot be removed: `pdlc/workflows/`, `pdlc/skills/`, `pdlc/hooks/`,
`.claude/workflows/`.

The effective set is `defaults ∪ configured`. A configuration listing fewer paths, none, or one that
attempts to remove a default is **silently unioned** with the defaults — no warning, no error, no
report line. A value that is absent, not a list, or whose members are not strings contributes nothing
(§10.3). Configured paths not ending in `/` gain one, so `src/pipeline` and `src/pipeline/` behave
identically and neither matches `src/pipeline-notes/`.

The four defaults are this repo's own layout; a consuming repo adds the paths carrying its own
pipeline-affecting code, and `.claude/workflows/` is a default because it exists in every consumer
(AC-3.7).

### 4.4 Fail closed on an unretrievable list (AC-3.4)

If `O5` yields `unknown` under §3.2 — command failure, unparseable output, absent `files` field, a
truncated or paginated list the phase cannot complete — the guard **fires**: an unknown diff is
pipeline-affecting. The escalation names the retrieval failure rather than a matched path, so the
operator can tell "the pipeline touched itself" from "I could not find out".

### 4.5 Escalation notice format (AC-3.2, AC-6.2a)

The guard's escalation is emitted onto the final report's existing operator-facing notices channel,
one line per notice, each beginning with the stable prefix `MERGE ESCALATION: `. The prefix is the
whole contract — an escalation is something a reader or a test finds by string.

```
MERGE ESCALATION: self-modification guard fired for {prUrl} — matched paths: {path}, {path}, …
MERGE ESCALATION: self-modification guard fired for {prUrl} — changed-file list could not be retrieved
```

Every matched path appears, so the operator's review has its scope delimited before they open the PR.
An escalation never implies a halt: outcome stays `success` (AC-1.3). **Consequence accepted here
(AC-3.7, BL-04):** every PR this repo's queue raises touches `pdlc/workflows/` or `pdlc/skills/`, so
Phase MERGE reports `refused` permanently in `yumo-plugins`, and the `merged` path is evidenced
through tests that drive the observation points directly.

## 5. FSPEC-MERGE-04 — CI evidence rule

**Links:** REQ-MERGE-04, US-04.

CI evidence is established **at merge time** by re-reading the rollup through `O2` (AC-4.0). Phase
PUB's `ciStatus` is a snapshot taken before Phase DOD remediation and before any base movement; it is
carried in the report but is **not** the merge evidence. Re-reading gives `pending` and `failed` a
reachable domain — checks re-run when the base moves, and a check green at Phase PUB can fail then.

| `O2` re-read | `mergeRequiresCi: true` (default) | `mergeRequiresCi: false` |
|---|---|---|
| `passed` | precondition satisfied | precondition satisfied |
| `none` (no checks) | **refused** + escalation (AC-4.2) | precondition satisfied (AC-4.3) |
| `pending` | **refused** | **refused** |
| `failed` | **refused** | **refused** |
| `unknown` (unretrievable/unparseable) | **refused** | **refused** |

`mergeRequiresCi` relaxes exactly one cell. It does not make `pending`, `failed` or `unknown`
acceptable: a repository with no CI is a supported configuration, one whose CI is red is not. Phase
PUB legitimately treats `no-checks` as a pass for *raising* a PR; that is not a pass for *merging*.

Only the `no-checks` refusal escalates (AC-4.2, line in §9.3). `pending`, `failed` and `unknown` are
`refused` with a reason line (§9.2) — ordinary states an operator reads off the PR.

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

**Squash is not in the chain.** `allowSquashMerge` ships `false` and is in no fallback:
`se-implement` produces a TDD commit sequence, Phase DOD produces versioned remediation commits, and
harvest and any post-mortem read that history — squash destroys it. `allowSquashMerge: true` appends
squash as a third and last candidate, gated additionally on `squashMergeAllowed`; nothing else
changes.

If `O4` is `unknown`, no chain is built and the phase is `refused` (AC-2.5a). If the chain is empty —
every method this phase may use is forbidden, e.g. a squash-only repo with `allowSquashMerge` false —
nothing is attempted and the phase is `deferred` with the reason **"no permitted merge method"**, a
different reason line from §6.3's exhaustion (AC-2.5b). Same value; the reason is what tells the
operator whether to change a repository setting or investigate a failure.

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

Each attempt records its method and failure detail. When every candidate has been attempted and
failed, the phase **stops attempting merge methods** — it does *not* halt: outcome `success`,
`mergeStatus: deferred`, reason naming each attempted method and its failure, queue status unchanged,
no queue commit. "Stops attempting methods" and "the pipeline halts" are different events.

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

The write-back runs **only** when `mergeStatus` is `merged` — §2.2 row 8 succeeded, or row 5 found the
PR already merged. Every other resolution (`skipped`, `refused`, `deferred`) writes nothing to the
queue and makes no queue commit; the feature's row is left exactly as it was (AC-1.3).

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
GitHub does not always populate it. `merged` is a literal token, never a SHA-shaped placeholder. A
cell already holding the first form is **not** downgraded to the second by a later re-entry that
cannot resolve the oid: an existing non-empty `Evidence` cell is left byte-identical whenever the new
value would be the `merged #{prNumber}` form.

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
**or empty**. A queue already carrying an `Evidence` column is not migrated again.

### 7.4 Recording channel, idempotence, and the missing cases

The write-back reaches `QUEUE.md` through **the one recording channel that records the `halted` row
today**, extended — not duplicated. One channel is not an optimisation: AC-5.6 requires a direct
`orchestrate-dev` invocation and a queue-driven one to leave the same durable result, and a second
path is how the two would silently diverge.

**This is a change, and the FSPEC states it as one.** The shipped channel carries the status and
*only* the status: there is no evidence argument, and its row transform replaces a single `Status`
cell and can neither append a sixth cell nor perform §7.3's migration. The extension therefore
touches four places — the two entrypoint closures that bind the channel, its default implementation,
its per-run seam, and the shared row transform — and that last one also serves the halt path and the
driver's `in-progress` / `awaiting-merge` / `halted` writes. Those must be unaffected: a call
carrying no evidence produces exactly today's bytes. That invariance is a required property, not an
assumption; §13 O-M2 carries the enumeration.

| Situation | Disposition | Behaviour | §11 row | Escalates |
|---|---|---|---|---|
| No `QUEUE.md` at all (direct invocation) | `none` | no write, no git; the merge proceeds and the write-back is skipped **without error** (AC-5.4) | 18 | no |
| `QUEUE.md` present, no row for this feature | `error` | nothing written, git untouched; detail names the missing row | 20 | **yes** |
| Row present, written and committed | `recorded` | `git add -- {queuePath}` then `git commit -m "chore(queue): {feature} → done" -- {queuePath}` — pathspec-scoped, never `-a`, never pushed | 18 | no |
| Row present, already `done` with the same evidence | `recorded` | no semantic change; `git` reports nothing to commit, which is **not** a fault — no warning, no notice (AC-5.8) | 18 | no |
| Row present, written; `git` refuses (hook, missing identity, index lock) | `recorded (uncommitted)` | the row is correct on disk; detail tells the operator to commit it manually | 21 | no — a plain note |
| Row present in a status §2.5 does not overwrite | `recorded` | file unchanged; plain note naming the status found | 18 | no |

**Why a git refusal does not escalate.** AC-5.2's escalation exists because "merged, queue not
updated" *blocks the serial queue*. An uncommitted row is correct on disk and the next queue pass
reads the file, not the commit — so nothing is blocked, and it takes §6.4's shape: a real remaining
action, reported as a note, never downgrading `merged`. A missing row (`error`) does block, so it
escalates.

**Row-disposition vocabulary (required change).** The shipped catalogue is
`"halted" | "halted (uncommitted)" | "none" | "error"` — a *disposition* named after the only status
it ever wrote, so a `done` write would report as `halted`. It becomes
**`"recorded" | "recorded (uncommitted)" | "none" | "error"`**: same four members, same meanings, the
two status-bearing ones renamed status-neutral, so one vocabulary describes a halt row and a done row
alike. Readers comparing against `halted` change with it; §13 O-M1 carries the enumeration.

**Idempotence caveat.** "Byte-identical" holds for rows already in the canonical `| a | b |` form,
which is what the row transform emits and what this repo's `QUEUE.md` uses. A consumer queue with
column-aligned padding is re-emitted canonically on the first write to that row, producing a real
commit. The guarantee is therefore **no semantic change**; only already-canonical rows are
byte-identical.

### 7.5 The driver's post-pipeline write, and F-13

Today the queue driver, after the pipeline returns, computes its own status from the pipeline outcome
alone — `awaiting-merge` on success, `halted` otherwise — writes it unconditionally, then emits
"…complete — status set to awaiting-merge. Merge the PR, then set it to done to unblock dependents."
That write happens **after** Phase MERGE's, so unchanged it silently un-does every `done` this feature
writes, on exactly the path the feature exists for.

Required behaviour (AC-5.6):

| Pipeline report | Driver's post-pipeline status | Operator message |
|---|---|---|
| `outcome: success`, `mergeStatus: merged` | `done` | the "merge the PR, then set it to done" message is **not** emitted; the driver reports the feature complete and merged, naming the merge SHA |
| `outcome: success`, any other `mergeStatus` | `awaiting-merge` (unchanged) | unchanged |
| `outcome: halted` or the pipeline threw | `halted` (unchanged) | unchanged |

The driver still always writes *something*; what changes is that its value derives from `mergeStatus`
as well as `outcome`. Writing `done` over a `done` is idempotent and produces no commit. This write
is step M5 of §8.2 and therefore lands on the **default branch**, the same branch Phase MERGE's own
write landed on at M4 — the two agree by construction rather than by coincidence.

**F-13 — the superseded criterion, named.** `pdlc-rcv-budget-stop`'s AC-2.7a states that
`orchestrate-dev` owns no status write but the halt one, and `RLH-AT-32-orch` pins it positively: a
successful direct run's recorded statuses must not contain `done`. AC-5.6 requires precisely that
write. Recorded here as a decision rather than a red test resolved by deleting an assertion:
**AC-5.6 supersedes AC-2.7a for the `merged` case only** — the halt path is unchanged and a
successful run that did *not* merge still writes no status. `RLH-AT-32-orch` is **re-expressed, not
removed**: its assertion becomes "a successful direct run that did not merge records no status", with
a sibling case for "a successful direct run reporting `mergeStatus: merged` records `done`". Deleting
it would lose an invariant that still holds on the majority path.

## 8. FSPEC-MERGE-07 — Post-merge working tree and branch handling

**Links:** AC-5.7, AC-2.6/2.6a, SE F-14.

### 8.1 Why the tree must move

Once the human stops merging, nobody restores the working tree. The next queue pass cuts its branch
and runs its dependency triage against whatever the tree is on, so after a merge the tree must be on
the **default branch, updated to contain the merge** — otherwise the following feature is cut from a
base without its dependency, the exact stall this feature exists to remove.

### 8.2 The ordering, pinned once (F-14, SE F-01)

**This is the single place the post-merge order is stated.** §7.5's driver transition and §8.3's
update are both defined against it and neither restates it.

| Step | Action | Branch it happens on |
|---|---|---|
| M1 | merge the PR (§6.2) | `feat-{feature}` |
| M2 | delete the **remote** feature branch, if configured (§6.4) | — |
| M3 | **check out the default branch and update it to contain the merge** (§8.3) | → default |
| M4 | queue write-back: `done` row + `Evidence` cell, then commit (§7) | default |
| M5 | pipeline returns; on the queue path the driver writes `done` (§7.5) | default |

**The checkout precedes the queue write, reversing v1.0.** v1.0 put M4 first, on the feature branch,
reasoning the commit would reach the default branch through the PR. It would not: by M2 that branch
is merged, its remote deleted and the PR closed, so a commit added afterwards has no route anywhere.
And M5 is outside this phase — it runs after the pipeline returns, hence after M3 — so under v1.0's
order M4 and M5 committed the same file on two different branches. One ordering for both is the only
internally consistent version.

**The consequence, stated and accepted.** M4 and M5 commit `QUEUE.md` on the **local** default branch,
which therefore sits ahead of its remote by one or two queue-row commits. pdlc never pushes them —
unchanged from the shipped halt-row behaviour, which likewise commits and never pushes. They reach
the remote by the ordinary route: the next feature's branch is cut from the local default branch, so
they ride that feature's PR. Two facts make this safe rather than merely tolerable: the row the next
pass reads is the **file on disk**, correct the moment M4 writes it and independent of any commit;
and §8.3's update reconciles the divergence rather than assuming it away.

It is named in the run report once per merged run: `Local {defaultBranch} is ahead of its remote by
the queue-row commit for {feature}; pdlc does not push it — it reaches the remote with the next
feature's PR.`

### 8.3 The update, and its failure

M3 is: fetch the remote default branch, check it out, and bring it to a state containing the merge.

- If the local default branch can fast-forward to the fetched tip, it does — the ordinary case on a
  fresh clone and on the first merged feature.
- If it cannot, because M4/M5 of an earlier run left local queue-row commits on top, those commits are
  **replayed onto the fetched tip**. Commits whose content is already upstream (having arrived via a
  later PR) drop out as empty; the rest survive. The result contains the merge and every queue row not
  yet upstream.

The step is complete when the tree is on the default branch and the merge commit is an ancestor of
`HEAD`. If any part cannot be completed — a dirty tree, a fetch failure, a replay that conflicts —
the step escalates (§9.3) and `mergeStatus` **remains `merged`**: the merge is real, and re-reporting
it as anything else would be false.

**A failed M3 does not cancel M4.** The queue write-back still runs, on whichever branch `HEAD` is
left on, so the `done` row is correct on disk even when the tree could not be moved — the escalation
tells the operator the tree needs attention, not that the queue is wrong. The local feature branch is
never deleted (§6.4), so it is still there to inspect.

## 9. FSPEC-MERGE-08 — Reporting contract

**Links:** REQ-MERGE-06.

### 9.1 Report fields

The pipeline's final report gains three fields, present on **every** report — halt reports included,
where they describe a phase that never ran:

| Field | Value |
|---|---|
| `mergeStatus` | exactly one of `merged`, `deferred`, `refused`, `skipped` |
| `mergeSha` | the full merge commit SHA when this run merged (§6.2). On §2.2 row 5 (already merged): `O1.mergeCommit.oid` when it is present and parseable, else `null` — never invented. `null` on every non-merge |
| `mergeMethod` | `rebase` or `merge` when this run merged; `unknown` when the PR was already merged on entry (a pipeline that did not merge cannot know how someone else did); `null` otherwise |

A run that halts before Phase MERGE reports `mergeStatus: skipped` — "no merge was considered". That
is §11 row 23, the one row of that table whose pipeline outcome is `halted`.

`prUrl` and `ciStatus` continue to carry Phase PUB's results and are unchanged. `ciStatus` is Phase
PUB's snapshot; the merge-time CI evidence is not re-reported as `ciStatus` (§5).

### 9.2 The reason line

`deferred` and `refused` each carry, in **one line**, the condition from §11's table that produced
them — singular, per §2.3's ordering. It rides the Phase MERGE row's detail. Every non-merge keeps
the pipeline outcome `success` (AC-1.3): a merge that did not happen is not a pipeline failure, so
the halt path and its `halted` queue commit are not taken.

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

**Escalations accumulate, in table order.** One run can produce more than one — the queue write and
the tree update can both fail after the same merge. When several apply, every line is emitted in the
order of the table above. Only the guard and CI lines are mutually exclusive with the other two (a
run that refuses never merges).

**No escalation implies a halt.** Every escalating condition above keeps outcome `success`.

### 9.4 The merge-deferred note

Every `deferred` and `refused` run also emits one plain (non-escalation) note recording that the
merge did not happen and the queue row was therefore left as it was, so a reader of the run report
sees the queue's state without inferring it:

```
Merge deferred for {feature}: {reason}. The queue row is unchanged; merge the PR to advance it.
```

The note does not name a status. On the queue-driven path Phase MERGE runs *inside* the pipeline,
before the driver writes `awaiting-merge`, so the row is `in-progress` at that moment on exactly the
path this feature exists for — a note hard-coding `awaiting-merge` would pin a false statement. It is
emitted for `deferred` and `refused` only; `skipped` and `merged` runs do not emit it, including
§2.2 row 5, whose write-back did advance the row.

### 9.5 Queue-driver pass-through (AC-6.3)

`orchestrate-queue` carries the pipeline report through to its own run report unchanged, so
`mergeStatus`, `mergeSha`, `mergeMethod` and every `MERGE ESCALATION: ` notice are visible from the
queue run without opening the pipeline's report. The driver adds only its own status transition
(§7.5).

AC-6.3's end-to-end effect — the dependent selected after `merged`, not selected when the row is left
`awaiting-merge` — is stated as an acceptance test in §12 (AT-M5), with the drift-gate precondition
both halves need to be determinate.

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
holds; `on` is identical to `gated` today — there is deliberately **no mode that bypasses the
preconditions**, the `gated`/`on` distinction being reserved for a future relaxation, because a
three-valued flag where one value means "skip the safety checks" is the flag that gets set in a
hurry. It ships `off` so installing this feature does not begin auto-merging anyone's repository.

### 10.2 Where the configuration comes from

`.claude/pdlc.config.json` is the documented home of pdlc's per-repo settings, but **no workflow
script reads it today** — its one existing consumer is the shell distribution tooling, which passes
its single key through a separate record. Phase MERGE introduces the first script-side read. The
`merge` section is independent of the existing `distribution` section; reading one must not disturb
the other.

### 10.3 Degraded reads (AC-7.3)

| Situation | Behaviour |
|---|---|
| File absent, unreadable, or not valid JSON | every setting takes its default; `mergeMode` is therefore `off` and nothing merges |
| `merge` section absent or not an object | as above |
| One key absent | that key takes its default; the others are honoured |
| One key holds an unrecognised value or wrong type | that key takes its default; the others are honoured |
| Guard-path list absent, not a list, or containing non-strings | contributes nothing; the four defaults hold (§4.3) |

**Accepted domains.** `mergeMode` accepts the three literals of §10.1. `mergeRequiresCi`,
`allowSquashMerge` and `deleteBranchOnPdlcMerge` accept booleans only — the strings `"true"` and
`"false"` are *not* booleans and take the default, which for `mergeRequiresCi` means the safe `true`.
`mergeableRetries` accepts **integers ≥ 0**; `mergeableRetryDelay` accepts **integers ≥ 0, in
seconds**. Anything else — a negative, a non-integer, a numeric string — takes the default. `0` is
legal for both and is the value a deterministic suite sets for the delay; because `0` is honoured
rather than reset, such a suite is testing its own value and not the 10 s default.

A malformed configuration **never enables merging**, and a degraded read is never an error that
halts: it resolves to the safe default and the run continues. No warning is required, with one
exception: a `merge` section present but unparseable is reported as a plain note, so an operator who
*intended* to enable merging is not left wondering why nothing merged. That note is **suppressed when
§2.2 row 1 resolves**, because the configuration is never read on that path — a `PHASE_MERGE_ENABLED:
false` run emits nothing to the notices channel at all.

## 11. Observable outcomes per scenario

REQ AC-6.1a's condition table, refined to spec level and naming per row the resolving step, the
reason line's subject, whether the queue is written and whether an escalation is emitted. It is the
parameterised suite the TSPEC and tests pin.

**Exclusivity, stated precisely.** Rows 1–18 are **terminal**: exactly one of them applies to any run
that reaches the phase, and no two can apply together. Rows 19–22 are **composable post-merge
annotations** over §11 row 18 (or row 3): each is independently present or absent, any subset can
hold at once, all of them report `merged`, and their notices accumulate in §9.3's order. Row 23 is
the one run that never reaches the phase. Every row's pipeline outcome is `success` except row 23.

| # | Condition | Resolves at | `mergeStatus` | Queue written | Escalation |
|---|---|---|---|---|---|
| 1 | `PHASE_MERGE_ENABLED` false | §2.2 r1 | `skipped` | no | no |
| 2 | `mergeMode` resolves `off` (incl. malformed config) | §2.2 r2 | `skipped` | no | no |
| 3 | PR already `MERGED` on entry | §2.2 r5 | `merged`, method `unknown`, `mergeSha` per §9.1 | **yes**, idempotent | no |
| 4 | Guard fired — a changed path matched | §4.1 | `refused` | no | **yes** |
| 5 | Guard fired — changed-file list unretrievable | §4.4 | `refused` | no | **yes** |
| 6 | No `prUrl` from Phase PUB | §2.2 r3 | `deferred` | no | no |
| 7 | PR state `CLOSED` | §2.3 7a | `deferred` | no | no |
| 8 | PR state unparseable/unrecognised | §2.2 r4 | `refused` | no | no |
| 9 | CI `no-checks` and `mergeRequiresCi` true | §5 | `refused` | no | **yes** |
| 10 | CI `pending` or `failed` | §5 | `refused` | no | no |
| 11 | CI rollup unretrievable/unparseable | §5 | `refused` | no | no |
| 12 | `mergeable` `CONFLICTING`, or `mergeStateStatus` `DIRTY`/`BLOCKED` | §2.3 7c | `deferred` | no | no |
| 13 | `mergeable` still `UNKNOWN` after the bounded re-reads | §3.3 | `deferred` | no | no |
| 14 | One or more unresolved review threads | §2.3 7d | `deferred` | no | no |
| 15 | Capability query unretrievable/unparseable | §2.3 7e | `refused` | no | no |
| 16 | No permitted merge method remains | §6.1 | `deferred` (reason "no permitted merge method") | no | no |
| 17 | Every permitted method attempted and failed | §6.3 | `deferred` (reason names each attempt) | no | no |
| 18 | Merge performed and succeeded | §6.2 | `merged` + `mergeSha` + `mergeMethod` | **yes** | no |
| 19 | *(annotation)* remote branch deletion failed | §6.4 | `merged` | unaffected | no — a plain note |
| 20 | *(annotation)* queue row absent — disposition `error` | §7.4 | `merged` | attempted, not written | **yes** |
| 21 | *(annotation)* queue row written but not committed | §7.4 | `merged` | **yes**, on disk | no — a plain note |
| 22 | *(annotation)* working tree not updated | §8.3 | `merged` | **yes** | **yes** |
| 23 | Run halted before Phase MERGE | — | `skipped` | no (the halt path writes its own `halted` row) | no; the §9.4 note is **not** emitted |

Rows 1–2 both report `skipped` and neither evaluates the guard. Rows 4–5 both report `refused` and
differ only in the escalation's text, which is the operator's whole signal about which happened. Row
8 is the third member of that family and is deliberately **not** escalating: it resolves above the
guard, so a run that could not read PR state never reaches a guard verdict to report.

`refused` means a safety rule said no; `deferred` means an ordinary not-ready condition a later
re-invocation could satisfy. Rows 16 and 17 share a value and differ in the reason line, because that
line is what tells the operator whether to change a repository setting or investigate a failure.

## 12. Acceptance tests

§11's table is itself the primary acceptance suite: one case per row, asserting the four columns plus
the reason line. These seven cover behaviour the table does not express.

| ID | Who / Given / When / Then |
|---|---|
| AT-M1 | **Operator.** Given a five-column `QUEUE.md` with three data rows and a merged PR for row 2, When Phase MERGE writes back, Then the header gains `Evidence`, the separator and the other two data rows each gain one empty cell, row 2's Status cell reads exactly `done`, its Evidence cell reads `{shortSha} #{prNumber}` with `shortSha` the first 7 characters of the observed oid, and no other cell in the file changes |
| AT-M2 | **Operator.** Given the same queue already carrying an `Evidence` column and row 2 already `done` with the same evidence, When Phase MERGE re-runs against the already-merged PR whose `O1.mergeCommit.oid` is the same oid, Then the file is byte-identical, no commit is produced, and no notice is emitted |
| AT-M2a | **Operator.** Given that queue with row 2 still `awaiting-merge` and an already-merged PR, When Phase MERGE runs, Then row 2 becomes `done`; its Evidence cell reads `{shortSha} #{prNumber}` when `O1.mergeCommit.oid` is present and `merged #{prNumber}` when it is absent; `mergeMethod` is `unknown`; and the §9.4 merge-deferred note is not emitted. This is AC-5.2's recovery path and the one row-3 case that mutates the file |
| AT-M3 | **Operator.** Given a fixture that otherwise merges — every precondition passing — and a changed-file list **without** any guard-matching path, When Phase MERGE runs, Then it resolves at §11 **row 18** with `mergeStatus: merged` and **no** notice beginning `MERGE ESCALATION: `; and given the identical fixture with `pdlc/skills/x.md` added to the list and nothing else changed, Then it resolves at **row 4** with `mergeStatus: refused` and a notice reading `MERGE ESCALATION: self-modification guard fired for {prUrl} — matched paths: pdlc/skills/x.md`. Both arms assert a positive terminal value, so deleting the guard turns the second arm red. The near-miss paths `pdlc/skills-notes/x.md`, `docs/pdlc/skills/x.md` and `PDLC/Skills/x.md` each reproduce the **first** arm exactly — row 18, `merged`, no escalation |
| AT-M4 | **Operator.** Given a queue-driven run whose pipeline report carries `mergeStatus: merged`, When the driver takes its post-pipeline transition, Then it records `done` (not `awaiting-merge`) and does not emit the "merge the PR, then set it to done" message |
| AT-M5 | **Operator.** Given a queue whose only unblocked dependent depends solely on this feature, **and a distribution drift gate that passes** — a clean drift-state record, or `distribution.checkEnabled: false` — When a run reports `mergeStatus: merged`, Then the next queue invocation selects that dependent with no human turn; and given the same queue with this feature left `awaiting-merge`, that dependent is not selected. The gate precondition is stated because it runs before `QUEUE.md` is read at all and can return `blocked`, selecting nothing, for reasons unrelated to this feature |
| AT-M6 | **Operator.** Given a merged PR, a `QUEUE.md` whose row is absent, and a working tree that cannot be moved to the default branch, When Phase MERGE completes, Then `mergeStatus` is `merged`, §11 rows 20 and 22 both apply, and the notices channel carries both escalation lines in §9.3's order — the composability claim, asserted rather than assumed |

## 13. Obligations and open questions

| ID | Owner | Obligation |
|---|---|---|
| O-M1 | TSPEC | Migrate the row-disposition catalogue to §7.4's `recorded` / `recorded (uncommitted)` / `none` / `error`. The shipped members are produced by `rewriteStatus` and consumed through the `_recordHalt` seam and `defaultRecordHalt`; name every producer and reader, and say whether the seam itself is renamed |
| O-M2 | TSPEC | Names, signatures and injection mechanics for the six observation points of §3.1, and the evidence-carrying extension of the recording channel — its two entrypoint closures, its default implementation, its per-run seam, and the shared row transform — including the property that an evidence-free call still emits today's bytes for the `in-progress` / `awaiting-merge` / `halted` writes |
| O-M3 | TSPEC | The `O3` review-thread GraphQL query text, its pagination behaviour, and the derivation of owner/repo/number from `prUrl` that addresses it. `reviewDecision` is **not** an accepted substitute (REQ AC-1.2) |
| O-M4 | TSPEC | `O5`'s pagination completeness rule: how the phase knows a changed-file list is complete, since an incomplete list must fail closed (§4.4) rather than silently pass the guard |
| O-M5 | TSPEC | Where `.claude/pdlc.config.json`'s `merge` section is read and cached within a run, given §2.2 row 1 must resolve before any read occurs |
| O-M6 | PLAN | Re-expression of `RLH-AT-32-orch` per §7.5, plus its new sibling case — as a task, so the change is reviewed rather than discovered as a red test |
| O-M7 | TSPEC | §3.3's wait between re-reads. The pipeline's sleep seam is declared without a default and is not supplied by the runtime's injection bundle; the retry loop must inherit the same default-in-callee pattern the CI poll already uses rather than reading an undefined value |
| O-M8 | TSPEC | §8.3's replay of local queue-row commits onto the fetched default tip: the exact command sequence, how an already-upstream commit is detected as empty, and the failure detection that triggers the escalation |

No open questions remain for the requester. The REQ round-2 questions (TE Q-01, Q-02) are answered in
§2.3 and §7.3; the FSPEC round-1 questions are answered in §8.2 (SE Q-01), §2.5 (SE Q-02), §9.4
(TE Q-01) and §10.3 (TE Q-02).

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
