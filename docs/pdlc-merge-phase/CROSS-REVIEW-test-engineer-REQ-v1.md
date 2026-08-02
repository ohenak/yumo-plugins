# Cross-Review: test-engineer — REQ (pdlc-merge-phase)

Scope: docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md @ b97a006

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md` (v1.0, draft)
**Date:** 2026-08-02
**Iteration:** 1
**Lens:** testability only — every finding asks for an *observable outcome* precise enough to write a
black-box acceptance test from. No finding below asks for seam design, fixture construction, or test
placement; that detail belongs to TSPEC/PROPERTIES and is correctly absent here.

## 1. Summary of findings

| ID | Severity | Tag | Scope | Finding | Section ref |
|----|----------|-----|-------|---------|-------------|
| F-01 | High | [blocking] | Local | `deferred` vs `refused` are not disjointly assigned — no test can predict `mergeStatus` for a CI or precondition failure | AC-1.3, AC-4.2, AC-4.4, AC-6.1 |
| F-02 | High | [blocking] | Local | Refusal/defer paths never state the **pipeline outcome**, so the queue-row side effect (`awaiting-merge` vs the existing halt→`halted` commit) is untestable and self-contradictory | AC-1.3, AC-2.3, AC-3.1 |
| F-03 | High | [blocking] | Local | "Escalated to the operator" has no named observable sink — there is no oracle to assert against | AC-3.1, AC-3.2, AC-4.2, AC-5.2 |
| F-04 | High | [blocking] | Local | AC-5.5 (record SHA + PR URL "alongside" the row) contradicts AC-5.3 (only the target row changes) and names no location | AC-5.3, AC-5.5 |
| F-05 | High | [blocking] | Local | `PHASE_MERGE_ENABLED = false` promises "behavior identical to today" while AC-6.1 promises a `skipped` value — a disabled-run test cannot decide which to assert | AC-1.4, AC-1.5, AC-6.1 |
| F-06 | High | [blocking] | Local | AC-1.2's "mergeable, no conflicts" and "no unresolved review threads" have no stated source and no *unknown* branch; AC-3.4's fail-closed rule covers only the changed-file list | AC-1.2, AC-3.4, NFR-1 |
| F-07 | Medium | [blocking] | Local | Guard path-matching semantics unstated (segment prefix vs substring), so the near-miss negative case — the test that would actually falsify a sloppy guard — cannot be written | AC-3.1, AC-3.5 |
| F-08 | Medium | [blocking] | Cross-Feature | The two default guard paths are authoring-repo paths; in a consuming repo the pipeline lives under `.claude/workflows/` and the guard would never fire | AC-3.1, AC-3.3 |
| F-09 | Medium | [blocking] | Local | NFR-5 idempotency under-specifies the re-entry: source of "already merged", whether write-back is re-attempted, and whether a human-merged PR counts | NFR-5, AC-5.2 |
| F-10 | Medium | [blocking] | Local | No configuration inventory: defaults for `mergeMode`, `mergeRequiresCi`, `deleteBranchOnMerge`, `allowSquashMerge`, `PHASE_MERGE_ENABLED` and their location are not all stated | AC-1.4, AC-1.5, AC-2.4, AC-2.6, AC-4.2 |
| F-11 | Medium | [blocking] | Local | AC-2.5's capability query has no failure branch, and "all permitted methods exhausted" has no stated outcome distinct from AC-2.3 | AC-2.5, AC-2.2, AC-2.3 |
| F-12 | Medium | [blocking] | Local | AC-2.6 has no failure branch: merge succeeded, branch deletion failed is an unstated outcome | AC-2.6, AC-5.2 |
| F-13 | Medium | [blocking] | Local | AC-6.3 is permissive ("**may** pick up"), so its test can only pass — an unfalsifiable oracle | AC-6.3 |
| F-14 | Low | [advisory] | Local | NFR-2's "cheaper" is not measurable; restate as an ordering invariant | NFR-2 |
| F-15 | Low | [advisory] | Process | AC-3.5 is a test-suite mandate rather than a system outcome — right instinct, wrong altitude | AC-3.5 |
| F-16 | Low | [advisory] | Local | AC-3.3's "cannot be removed by configuration" does not say whether an attempted removal is ignored or reported | AC-3.3 |
| F-17 | Low | [advisory] | Local | The happy path cannot be demonstrated in this repo (every PR here trips the guard) and the REQ does not say how `merged` is evidenced | AC-3.1, §6 |

## 2. Blocking findings in detail

### F-01 — `deferred` and `refused` overlap (AC-1.3 / AC-4.2 / AC-4.4 / AC-6.1) [blocking, High]

AC-1.2 makes `ciStatus == "passed"` a *precondition*. AC-1.3 then says **any** failed precondition
produces "a merge-deferred note" — which AC-6.1 renders as `mergeStatus: deferred`. But AC-4.2 and
AC-4.4 say a CI shortfall means the merge is "**refused**". The same input (`ciStatus: "no-checks"`,
`mergeRequiresCi: true`) therefore has two documented outcomes, and the most obvious test in the
whole feature —

> given `{prUrl, ciStatus: "no-checks"}`, assert `report.mergeStatus === ???`

— cannot be written. Same collision for AC-2.3 (both methods fail) and AC-1.2's mergeable/threads
clauses.

**Resolves it:** state the partition explicitly, e.g. *`refused` = a policy rule said no (guard,
CI-evidence rule, squash-only repo); `deferred` = a transient state that a later re-invocation could
satisfy (checks still pending, mergeable unknown, PR not yet raised)* — then map every named failure
in REQ-MERGE-01/02/04 to exactly one of the four values. A one-column table (`condition →
mergeStatus`) is enough and becomes the parameterised test table verbatim.

### F-02 — pipeline outcome and queue side effect on a refusal (AC-1.3 / AC-2.3 / AC-3.1) [blocking, High]

AC-1.3 is precise for the precondition case: outcome `success`, queue stays `awaiting-merge`. Nothing
says the same for the **guard refusal** (AC-3.1) or the **both-methods-failed** case (AC-2.3, "the
phase halts merging" — "halts merging" is not the same word as the pipeline `halted` outcome used
everywhere else in this codebase).

This is not a wording nit, because a *halt* in `orchestrate-dev` has a documented, committed side
effect: it rewrites the feature's `QUEUE.md` row to `halted` and git-commits that file
(`rewriteStatus` / `commitQueueRow` in `pdlc/workflows/orchestrate-queue.js`). So "halts" and "queue
status remains `awaiting-merge`" (AC-2.3's own second clause) are mutually exclusive as written. A
test asserting the queue file after a guard refusal has no defensible expectation.

**Resolves it:** for each of `refused` / `deferred`, state (a) the pipeline outcome token, (b) the
resulting `QUEUE.md` status cell, (c) whether a queue commit occurs. Three observable facts, three
assertions.

### F-03 — "escalated to the operator" has no oracle (AC-3.1/3.2, AC-4.2, AC-5.2) [blocking, High]

"Escalated" appears four times and is never given an artifact. NFR-4 rules out an agent dispatch, so
escalation is presumably a field or notice in the final report — but the REQ does not say, and a
black-box test needs to read *something*. AC-3.2's content requirement ("names every
pipeline-affecting path in the diff and links the PR") is otherwise well-formed and would give a
sharp assertion the moment its sink is named.

**Resolves it:** name the observable, e.g. *the final report carries an `escalation` string; for a
guard refusal it contains the PR URL and every matched path, one per line*. Then AC-3.2 becomes a
direct string-containment test, and AC-5.2's "merged, queue not updated" becomes an exact-phrase
test.

### F-04 — AC-5.5 contradicts AC-5.3 and names no location [blocking, High]

`QUEUE.md` has five fixed columns (`Order | Status | Feature | REQ Path | Depends-On`) and the
existing writer replaces the `Status` cell only. "The merge commit SHA and PR URL are recorded
alongside it" therefore has no defined destination — a new column changes the **header row** too,
which AC-5.3 forbids ("no other row … changes"); an appended prose line changes a prose section,
which AC-5.3 also forbids.

**Resolves it:** pick one and state it as an observable: a new `Evidence` column (and amend AC-5.3 to
permit the header change), a `done (sha, pr)` composite status cell, or drop the evidence from
`QUEUE.md` and put it in the final report only (AC-6.1 already carries the SHA). Any of the three is
testable; the current text is not.

### F-05 — disabled-phase reporting is doubly specified (AC-1.4 / AC-1.5 / AC-6.1) [blocking, High]

AC-1.4 says a disabled phase means "behavior identical to today" — today there is no `mergeStatus`
field at all. AC-6.1 says the report carries `mergeStatus ∈ {…, skipped}`. `expect(report.mergeStatus)`
has two documented answers (`undefined` and `"skipped"`).

Related and equally untestable: `PHASE_MERGE_ENABLED = false` and `mergeMode: "off"` are two
independent off switches with no stated precedence, and it is unstated whether a self-modifying PR
under a disabled phase reports `skipped` (AC-1.4) or `refused` (AC-3.1's "regardless of … any other
configuration").

**Resolves it:** state that a disabled phase reports `skipped` (and accept that this is a
report-shape change from today), and give the flag precedence order — e.g. *`PHASE_MERGE_ENABLED`
is evaluated first; `mergeMode: "off"` is evaluated next; the guard is evaluated only on a run that
reaches the precondition set*.

### F-06 — AC-1.2's non-CI preconditions have no source and no *unknown* branch [blocking, High]

NFR-1 requires every precondition to be "evaluated deterministically from `gh` output", but:

- **mergeable / conflicts** — GitHub computes mergeability asynchronously and reports a third state
  (unknown/computing), routinely seen right after a push. AC-1.2 admits only "mergeable with no
  conflicts"; the unknown state has no stated outcome, and it is the single most likely state at the
  moment Phase MERGE runs (Phase PUB just finished).
- **unresolved review threads** — thread *resolution* state is not among `gh pr view --json`'s
  fields; it is a GraphQL `reviewThreads.isResolved` query. As written the AC may not be satisfiable
  from the stated tool surface at all. If the intended proxy is `reviewDecision != CHANGES_REQUESTED`,
  say so — it is a different, weaker property and the test differs accordingly.

AC-3.4 shows the right pattern (unretrievable → fail closed) but is scoped to the changed-file list
only.

**Resolves it:** for each precondition in AC-1.2, name the observable field and state the outcome for
*retrievable-and-false*, *retrievable-and-true*, and *not retrievable*. Generalising AC-3.4 to "any
precondition whose evidence cannot be retrieved is treated as failed" would cover all of them in one
sentence and gives a clean parameterised negative suite.

## 3. Medium findings in detail

### F-07 — guard matching semantics (AC-3.1, AC-3.5) [blocking, Medium]

"Any path under `pdlc/workflows/` or `pdlc/skills/`" does not say whether matching is by path
**segment prefix** or by substring, which decides the outcome for the cases that matter most to a
falsification suite:

- `pdlc/workflows-notes/README.md` — must **not** match under segment-prefix matching; **does** match
  under naive `startsWith`/`includes`.
- `PDLC/Workflows/x.js` (case), `docs/pdlc/skills/x.md` (mid-path occurrence), a **deleted** or
  **renamed** file (the diff carries the old path), a directory-only or empty diff.

AC-3.5 asks for a mutation-grade test ("would fail if the guard were removed"), and the only tests
that satisfy that spirit are the near-miss pairs above — a guard tested solely with an obvious
positive still passes after being weakened. Without the matching rule stated the negative half of the
pair has no expected value.

**Resolves it:** one sentence — *matching is case-sensitive, on `/`-delimited path segments, against
every path in the PR's changed-file list including deletions and both sides of a rename*.

### F-08 — default guard paths do not exist in a consuming repo (AC-3.1, AC-3.3) [blocking, Medium, Cross-Feature]

`pdlc/workflows/` and `pdlc/skills/` are **this authoring repo's** layout. In a consuming repo the
pipeline arrives as an installed plugin and its runtime copy lives under `.claude/workflows/`; no PR
there will ever touch `pdlc/workflows/`. So in every repo except this one the guard is a no-op that
still reports as present — the worst failure mode for a safety control, and one no test in the
authoring repo would catch.

**Resolves it:** either add `.claude/workflows/` (and, if relevant, `.claude/pdlc.config.json`) to
the undeletable defaults, or state explicitly that the defaults are authoring-repo paths and that a
consuming repo *must* configure its own — in which case AC-3.3's "additive, defaults undeletable"
guarantee protects nothing there and the REQ should say what protects it instead.

### F-09 — NFR-5 idempotency under-specified [blocking, Medium]

"Invoked against an already-merged PR it reports `merged` and performs no action" leaves three
things a test must know:

1. **Where "already merged" is read from** — presumably the PR state; name it, since the observable
   determines the fake.
2. **Whether the queue write-back is re-attempted.** "Performs no action" reads as *no*, but AC-5.2's
   failure state (merged, queue not updated) is then permanently unrecoverable by re-invocation,
   which contradicts US-05. The re-entry almost certainly *should* re-attempt an idempotent write to
   `done`; state which.
3. **Whether a PR merged by a human counts** — same observable, different provenance; AC-6.1's
   `merged` also promises "the merge SHA and method used", which a pipeline that did not merge cannot
   report for `method`.

**Resolves it:** state the re-entry outcome as a tuple — `mergeStatus: merged`, zero merge attempts,
queue write-back re-attempted idempotently, `method` reported as unknown when the pipeline did not
perform the merge.

### F-10 — configuration inventory and defaults [blocking, Medium]

Six configuration knobs are introduced (`PHASE_MERGE_ENABLED`, `mergeMode`, `mergeRequiresCi`,
`allowSquashMerge`, `deleteBranchOnMerge`, guard path patterns) and only two ship-defaults are
stated (`mergeRequiresCi: true`, `allowSquashMerge: false`). A "ships safe by default" test — the
one that catches a future careless default flip — needs the default of `mergeMode`,
`deleteBranchOnMerge` and `PHASE_MERGE_ENABLED`, and needs to know where they are read from (the
repo's convention is `.claude/pdlc.config.json`, cf. `distribution.checkEnabled`). Defaults are
requirements-altitude, not implementation detail.

**Resolves it:** a six-row table of `knob | default | location`.

### F-11 — capability-query failure and method exhaustion (AC-2.5, AC-2.2/2.3) [blocking, Medium]

AC-2.5 makes `gh repo view` capability data a decision input but gives it no failure branch — if the
query fails, does the phase assume rebase is allowed (unsafe, contradicts NFR-2), or refuse
(consistent with AC-3.4)? Related: a repo permitting **only** squash reaches AC-2.3's "both fail"
outcome without either method ever being *attempted*, so AC-2.3's "records both failures" has nothing
to record. Both are branches a test must have an expectation for.

**Resolves it:** state that an unavailable capability query is a failed precondition, and that "no
permitted method remains" is its own reported reason distinct from "attempted and failed".

### F-12 — branch deletion failure (AC-2.6) [blocking, Medium]

AC-2.6 states the success path only. Merge succeeded + delete failed is a real, observable outcome
(protected branch, permissions) and its `mergeStatus` is undecidable as written — `merged` with a
note, or an escalation like AC-5.2's? A leftover branch is harmless, so the natural answer is
`merged` plus a named note; say so, so the test can assert it rather than guess.

### F-13 — AC-6.3 is unfalsifiable as written [blocking, Medium]

"The next invocation **may** pick up a dependent feature without a human turn" cannot fail: an
invocation that picks up nothing still satisfies "may". This is exactly the "a test that can only
pass is not yet a test" case.

**Resolves it:** restate as a determinate outcome — *given a `QUEUE.md` whose only unblocked
dependent lists this feature as its sole dependency and whose row is now `done`, the next
`orchestrate-queue` invocation selects that dependent* (and, for the negative half, does **not**
select it when the row is still `awaiting-merge`). Two assertions, both falsifiable.

## 4. Advisory findings

- **F-14 (NFR-2)** — "every refusal path must be cheaper than every merge path" is a design maxim, not
  a measurable property. The testable restatement is an *ordering* invariant: no state-mutating `gh`
  call is issued before every precondition has been evaluated, and no merge is attempted while any
  precondition is unknown. That version can be asserted from a recorded command sequence.
- **F-15 (AC-3.5)** — this is a requirement about the *test suite*, not about the system, so strictly
  it sits above the REQ altitude (its natural home is PROPERTIES, and the project already carries the
  general rule as DOMAIN-CONSTRAINTS DC-03/DC-06 mutation falsification). No objection to keeping it —
  the intent is exactly right and it is cheap insurance — but consider phrasing it as an observable
  property of the guard ("the guard's decision is falsifiable: at least one input differing only in
  its changed-file list produces the opposite outcome") so it reads as a requirement rather than a
  test-plan entry, and let PROPERTIES own the mutation check.
- **F-16 (AC-3.3)** — "the two defaults cannot be removed by configuration" does not say whether a
  configuration that tries is silently unioned or reported. Silent is fine and simpler; state which,
  so the test knows whether to assert a warning.
- **F-17 (AC-3.1, §6)** — by construction every PR in this repo's own queue touches `pdlc/workflows/`
  or `pdlc/skills/` (`docs/_queue/QUEUE.md` §Bootstrapping says so explicitly), so the `merged`
  happy path can never be exercised end-to-end here. Worth one line in §6 or §7 acknowledging that
  `merged` is evidenced only through injected-seam tests in this repo, so a future reader does not
  mistake "never observed merging" for "broken".

## 5. Questions

| ID | Question |
|----|----------|
| Q-01 | Is `deferred` intended to mean "retry later could succeed" and `refused` "policy said no"? If so, which bucket holds `ciStatus: "pending"` at phase entry — is that even reachable given Phase PUB's poll? |
| Q-02 | Does a `refused` Phase MERGE leave the pipeline outcome `success`? If it can halt, the existing halt→`QUEUE.md: halted` commit fires and the row no longer says `awaiting-merge`. |
| Q-03 | Is "no unresolved review threads" meant literally (GraphQL `reviewThreads.isResolved`) or as `reviewDecision != CHANGES_REQUESTED`? They are different properties with different tests. |
| Q-04 | On re-entry against an already-merged PR, should the queue write-back be re-attempted? Without it, AC-5.2's "merged, queue not updated" state is unrecoverable except by hand. |
| Q-05 | Should `.claude/workflows/` join the undeletable default guard paths, given that is where the pipeline lives in a consuming repo? |

## 6. Positive observations

- **AC-1.5's deliberate absence of a bypass mode** is excellent, and it is *testable as written*:
  `gated` and `on` must produce identical outcomes across the whole precondition matrix, which is a
  single parameterised suite run twice — a genuine equivalence property rather than an example.
- **AC-3.4 (fail closed on an unretrievable diff)** is a model AC: precise trigger, precise outcome,
  and it inverts the usual default. It is the pattern the rest of REQ-MERGE-01's preconditions should
  copy (F-06).
- **NFR-4 gives NFR-1 an oracle.** "No new agent dispatch" is directly assertable — run the phase with
  an agent seam that throws on any call and require the phase to complete — which turns the otherwise
  unverifiable "no LLM participates in the decision to merge" into a real test.
- **AC-5.3's negative framing** ("no other row and no prose section changes") is exactly the kind of
  must-not-happen AC this lens asks for, and it is cheap to assert by whole-file comparison. AC-5.4
  (queue file absent → proceed, skip write-back) likewise names the branch instead of leaving it
  implied.
- **AC-2.4's squash prohibition with its rationale recorded inline** means a future reader cannot
  "simplify" it away by accident, and the AC states both the default and the absence from the
  fallback chain — two separate assertions, both available.

## 7. Recommendation

**Needs revision.** The feature's shape is right and its safety instincts are well placed; what
blocks approval is that several of the load-bearing outcomes — `mergeStatus` assignment (F-01), the
pipeline/queue side effect of a refusal (F-02), the escalation artifact (F-03), the evidence location
(F-04), the disabled-phase report (F-05), and the non-CI preconditions' unknown branch (F-06) — do
not yet have a single determinate observable, so their acceptance tests cannot be written from the
document. Every one of them resolves with a sentence or a small table; none requires a design change.

## Verdict

VERDICT: REVISE
{"high": 6, "medium": 7, "low": 4}
