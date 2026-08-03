# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (v1.3)
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** delta re-review of REQ-pdlc-advisory-tier v1.2 → v1.3. Closure of the v2 findings (F-14…F-20), plus a testability scan of the changed sections only. Unchanged sections already approved in v1/v2 are not re-litigated. Not product strategy, not architecture.
**Diff reviewed:** `b8ce721..b81d7d4` on `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (+53 / −25)

## Correction to v2

**My v2 finding F-15 was wrong on its central factual claim, and I am withdrawing that half of it.**
I reported that `main` contained "no `REBASE_STATUS` token anywhere; no `ship-pr` dispatch anywhere"
in `pdlc/workflows/orchestrate-dev.js`. Re-checked at the pinned base `26c3f1c`, both are present:

- `REBASE_STATUS: conflict` in the rebase prompt (`26c3f1c:pdlc/workflows/orchestrate-dev.js:5792`)
  and its parser `parseRebaseStatus` (`:5913`, `:5925-5927`)
- the dispatch `await _agent("ship-pr", rebasePrompt(feature))` in `rebaseOntoDefault` (`:6141`)
- the halt the §1 A4 row describes: `if (rebaseStatus === "conflict") { … throw haltError(…) }`
  (`:8160-8172`)

My earlier grep was run against the wrong ref and I did not cross-check the negative before filing —
a "X never happens at HEAD" claim of my own that I failed to hold to my own standard (the REQ/FSPEC
verification check requires a mechanism citation plus a cross-check; I had neither). The author's
v1.3 response was to re-verify row by row and pin the base to a sha, which is the correct response
and is also what makes my error cheap to catch. The stale-base half of F-15 was real and is what the
pin now addresses.

## Prior-Finding Closure

All seven v2 findings are closed — the two Highs and the two Mediums included. Each row names the
change that closes it and the evidence I checked it against.

| v2 ID | Sev | Closed by | Status |
|---|---|---|---|
| F-14 | High | **AC-4.5's A1 row** now names "the queue's dependency pre-check only" with the state-to-reach "the pre-check returns not-blocked (AC-5.1)", and **AC-5.1** states the one-sidedness explicitly ("it establishes only that no declared dependency has a not-`done` queue row, never that a dependency is present in base") and routes the unsettled case to `escalate`. That is resolution option (i) from F-14, taken verbatim. The A1 row now names an oracle a test can call — `precheckDependencies(dependsOn, entries) → {blocked:false}` (`26c3f1c:pdlc/workflows/orchestrate-queue.js:630-649`). The word "deterministic" is gone from AC-5.1. | Closed (see F-21 for the residual: the gate it now names cannot fail) |
| F-15 | High | **BL-02** pins the base to default-branch commit `26c3f1c` and states the re-verification was done "row by row … A4's `REBASE_STATUS: conflict` → halt included", plus "a later default-branch commit is a fresh check, not an inherited one". Re-verified independently: the A4 mechanism is present at the pinned sha (see the Verification Log and the correction above). The moving-base problem F-15 raised is solved the way I asked — a sha the next reviewer can re-run against. | Closed |
| F-16 | Medium | **E-2** now reads "*introduced* = the same check passes at **both** the merge-base commit and the default-branch tip, and fails at the branch head; AC-8.4's default-branch comparison is evaluated first", and **AC-8.4** carries the mirrored clause "this comparison being evaluated before E-2's *introduced* test". One baseline pair, one stated precedence, both directions written down. The check that regressed on the default branch after the merge-base now fails E-2's conjunction and escalates — a fixture defeating the earlier branch is constructible. | Closed |
| F-17 | Medium | **AC-9.3** names the deletion point as an ordering constraint plus one terminal observable: distil-and-delete happens "after the last phase that can append to it, which is Phase PUB", and "`ADVISORY-{feature}.md` is absent at end of run and its content is in LEARNINGS". The two incompatible oracles collapse to one. The guard extension gains its positive observable: "a delete attempted with no sibling `LEARNINGS-{feature}.md` is refused with the guard's refusal message and the file survives" — a refusal assertion, not an absence assertion. | Closed (see F-23 for the halted-run qualifier) |
| F-18 | Low | **AC-10.5** no longer claims the bare token: it says today's notices are Phase MERGE's only, "under its own frozen, merge-specific prefix", that the catalogue is "left exactly as it is, not widened", that advisory notices take "a distinct advisory prefix of its own (the literal is TSPEC's)", and that "both prefixes carry the shared `ESCALATION:` token, so one grep over the report still finds every notice of either kind". Verified: the literal is `MERGE ESCALATION:` (`26c3f1c:pdlc/workflows/orchestrate-dev.js:908`, `:920`, `:950`, `:1322`, `:1324`) and it does contain the substring `ESCALATION:`, so the one-grep property holds. The literal is correctly deferred to TSPEC. | Closed |
| F-19 | Low | **AC-3.6** replaces the unordered set with an eight-row **ordered** table plus "the first matching trigger wins, so a refusal satisfying two triggers still has one reason" and "the enumeration is asserted by set-equality, so a deleted or invented reason fails the suite". Both of my worked examples now resolve: out-of-envelope + low confidence → `out-of-envelope` (row 3 before row 7); malformed on the last attempt → `malformed-verdict` (row 6 before row 8). The new row 4 also closes a hole I had not filed — before this revision, an in-envelope action whose AC-4.5 gate then failed had no reason at all. | Closed (see F-22 for one remaining under-determined cell) |
| F-20 | Low | **AC-3.4(d)** now reads "the files the branch had already touched as of its head at the seam's dispatch (at A4, the pre-rebase head)" — a named ref, and the right one for the conflicted-rebase case. | Closed |

## Verification Log

Every existing-behavior claim **new or changed in v1.3**, checked against the base the REQ now pins:
default-branch commit **`26c3f1c`** (`feat(pdlc): Slice C — converge() primitive…`). Line numbers
below are at that sha.

| REQ claim (new/changed in v1.3) | Verified at | Result |
|---|---|---|
| BL-02: the base is pinned at `26c3f1c` and that sha is on the default branch | `git rev-parse main` → `26c3f1c5d68f9d6aa0fa98fb36c7b116aa1e6456` | Confirmed — the pin is live, not aspirational |
| BL-02 / §1 A4 / AC-7.1: `ship-pr` reports `REBASE_STATUS: conflict` and the pipeline reads it and halts | `26c3f1c:pdlc/workflows/orchestrate-dev.js:5791-5792` (both trailer values in the rebase prompt), `:5913-5927` (`parseRebaseStatus`), `:6141` (`await _agent("ship-pr", rebasePrompt(feature))`), `:8160-8172` (`if (rebaseStatus === "conflict") … throw haltError`) | **Confirmed** — reverses my v2 F-15 claim; see the correction above |
| AC-4.5 A1 / AC-5.1: the queue's dependency pre-check is one-sided and establishes only "no not-`done` queue row" | `26c3f1c:pdlc/workflows/orchestrate-queue.js:630-649` — returns `{blocked:true}` only for `match && match.status !== "done"`; the abstain comment at `:645` reads *"Dependency done, or not in the queue at all → inconclusive here; defer to triage"*; docstring `:621-624` | Confirmed — the REQ's restatement now matches the function exactly |
| AC-5.1: "that pre-check runs before any advisory agent" | `26c3f1c:pdlc/workflows/orchestrate-queue.js:890-898` — `precheckDependencies` is called, and a blocked result `continue`s **before** the `agentFn("se-author", triagePrompt(…))` dispatch at `:900-903` | Confirmed — and strictly stronger than the AC needs; see F-21 |
| AC-10.5: today's notices are Phase MERGE's only, under a merge-specific prefix, and that prefix carries the token `ESCALATION:` | `26c3f1c:pdlc/workflows/orchestrate-dev.js:908`, `:920`, `:950`, `:1322`, `:1324` — every occurrence is the literal `MERGE ESCALATION:`; 7 occurrences of `ESCALATION:` in the file, all merge-scoped | Confirmed, including the substring property the one-grep claim rests on |
| BL-05: reading the **default branch's own** check history is a different surface from the PR-rollup read the pipeline performs today | `26c3f1c:pdlc/workflows/orchestrate-dev.js:323` (`gh pr view ${prUrl} --json statusCheckRollup`), `:5818`, `:5833` — the only CI read is PR-scoped | Confirmed |
| BL-06: `gh` re-running a workflow run is a **write** against Actions, unlike every CI surface the pipeline uses today, "all of which are reads" | `26c3f1c` — no `gh run rerun` / `gh run view` / `gh workflow` anywhere under `pdlc/workflows/`; the CI surfaces are `gh pr view … statusCheckRollup` (`:323`), `gh api --paginate --slurp …/files` (`:329`), `gh api graphql … reviewThreads` (`:342`) — all reads | Confirmed. The one existing `gh` **write**, `gh pr merge` (`:331`, `:1112`), is a merge surface, not a CI surface, so it does not falsify the claim as scoped |
| AC-9.3: harvest-then-delete is what Phase H does today, and the guard is the LEARNINGS precondition | `26c3f1c:pdlc/hooks/scripts/guard-harvest-before-delete.sh` (token regex still `(?:CROSS-REVIEW\|CODE_REVIEW)-[\w.\-]*`) — unchanged from v2's check | Confirmed — the `ADVISORY-*` extension is genuinely new work, not already present |
| AC-9.3: "no seam fires at Phase MERGE" | §1's seam table declares A1–A5 only; Phase MERGE has no advisory seam in this REQ | Confirmed as internally consistent |

## Findings

Three findings, all Low, all inside sections v1.3 changed, all closable with one sentence each.
Numbering continues from v2.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-21 | Low | Local | **AC-4.5's A1 gate, as now written, is a gate that cannot fail — so its acceptance test can only pass.** This is the residual of my own F-14 resolution (i), so it is a Low, not a re-opening: the wording is what I asked for and it is honest about the pre-check. But trace the path. `precheckDependencies` runs at `26c3f1c:pdlc/workflows/orchestrate-queue.js:890`; a blocked result `continue`s before any agent (`:891-898`), so the A1 seam — which fires on a `needs-human` triage verdict, i.e. *after* triage, i.e. after the pre-check already returned not-blocked — can only ever exist for a candidate the pre-check has already cleared. The A1 advisory action (adjudicating an abstention) writes nothing to `QUEUE.md` (AC-4.4 forbids it), so the pre-check's inputs are unchanged and the post-action re-run returns not-blocked for the same reason it did the first time. A test for "A1's gate catches a bad `run-candidate`" is therefore unwritable: the only oracle available is one that structurally cannot go red. **Resolution:** say so, rather than implying verification that is not there — e.g. "A1 has no independent post-action gate: the pre-check already ran before the seam fired and the advisory action cannot change its inputs, so the A1 row records *no state change*, and A1's safety rests on AC-5.1's `escalate`-when-unsettled rule rather than on a re-run." One sentence, and it tells the test author to assert AC-5.1's routing rather than a tautology. | AC-4.5 (A1 row), AC-5.1 |
| F-22 | Low | Local | **AC-3.6's ordered table does not say what the triggers are evaluated *against*, and on A5's main path two rows both match with opposite expected values.** Ordering fixed the coincidence cases from F-19 — that part works. What is still open is whether a trigger matches the **terminating condition** of the invocation or **anything that happened during** it. Take the flagship A5 path: AC-8.2's fix→push→re-poll cycle repeats "up to `advisory.attemptBudget` attempts before escalating". At escalation, row 4 (`post-action-verification-failed` — "an in-envelope action was applied and the AC-4.5 gate … then failed") has matched on every attempt, and row 8 (`budget-exhausted` — AC-2.4/NFR-4) matches the condition that actually ended the loop. First-match-wins over the history gives row 4; over the terminating condition it gives row 8 — and AC-2.4 plus NFR-4 both clearly intend `budget-exhausted` for exactly this case. The expected value in the reason cell of the most-exercised A5 test is therefore under-determined, which is the same precedence-chain false-green shape F-16 fixed for E-2/AC-8.4. **Resolution:** one sentence above the table — "a trigger is matched against the condition on which the invocation terminates, not against conditions encountered earlier in it" — and, if it helps the reader, the worked case: an A5 cycle that exhausts its attempts reports `budget-exhausted`; a single-attempt seam whose post-action gate failed reports `post-action-verification-failed`. | AC-3.6 (rows 4 and 8), AC-8.2, AC-2.4 |
| F-23 | Low | Local | **AC-9.3's terminal observable is stated unconditionally but is false on the halt path — the path this feature exists for.** "Observably, `ADVISORY-{feature}.md` is absent at end of run and its content is in LEARNINGS" is right for a run that completes. A run that escalates halts at A3/A4/A5 (AC-3.6's third conjunct: the pre-advisory halt "proceeds unchanged"), so it never reaches Phase H, never writes LEARNINGS, and — correctly, per the guard sentence in the same AC — never deletes the record. The mechanism is self-consistent; only the sentence is over-general, and a test author writing the escalation-path acceptance test from it would assert absence and get a red for the right behavior. The durable escalation evidence is `ESCALATIONS.md` (AC-10.5), so retaining the record on a halt is a free choice, not a conflict. **Resolution:** qualify the observable — "at the end of a run that reaches completion; a run that halts leaves the record in place, which the extended guard enforces anyway since no `LEARNINGS-{feature}.md` exists yet." | AC-9.3 |

## Questions

Q-06…Q-09 from v2 remain open but are all TSPEC-answerable and none blocks a REQ-level acceptance
test; I am not re-filing them. One new question, also non-blocking.

| ID | Question |
|----|---------|
| Q-10 | BL-06 makes E-1 (re-running a flaky check) depend on an Actions **write** scope, and says that where the capability is unavailable "E-1 is out of envelope and the seam escalates". Is capability availability probed **per run** (so the same repo can have E-1 in envelope on Monday and out on Tuesday, and the envelope set-equality test must be parameterised by capability), or resolved **once at configuration time** (so the test asserts a fixed four-entry envelope)? AC-3.1 says the envelope is "declared in configuration as an explicit per-seam allow-list", which reads like the second; BL-05/BL-06's "given that capability is unavailable" reads like the first. The answer decides whether AC-3.3's enumeration test is a fixed set-equality or a capability-conditioned one. |

## Positive Observations

- **Every v2 finding is closed, and F-14 in particular is closed by choosing the honest option.** The
  revision could have closed F-14 by promising a strengthened pre-check; instead it restated the A1
  row against what `precheckDependencies` can actually decide and added the `escalate`-when-unsettled
  rule. That is the harder and better answer: it shrinks the claim to the evidence rather than
  growing the scope to fit the claim.
- **BL-02's pin is the durable fix, not just the local one.** "Pinned for re-verification at
  default-branch commit `26c3f1c` … a later default-branch commit is a fresh check, not an inherited
  one" makes the whole §1 "Today" table re-verifiable by anyone, mechanically, at any later date.
  Given that the base grew 2139 → 8527 lines mid-review, this is the sentence that keeps the next
  round's verification cheap. It is also what let me find my own error in one command.
- **AC-3.6's ordered table is a genuine upgrade over what F-19 asked for.** I asked for a precedence
  list; the revision supplied one *and* discovered a missing reason while writing it — row 4,
  `post-action-verification-failed`, covers the in-envelope-action-then-gate-failed case that had no
  reason at all in v1.2. Ordering the set turned an under-specified oracle into a total function from
  refusal condition to reason cell, which is exactly the property a set-equality test needs.
- **AC-9.3 now yields one oracle where it yielded two contradictory ones**, and the guard extension
  gets a positive refusal assertion ("refused with the guard's refusal message and the file
  survives") rather than the absence-shaped "the file still exists". That is the paired-positive
  discipline applied without being asked twice.
- **E-2's fix mirrors E-3's discipline, in both directions.** Requiring *both* baselines and stating
  the precedence in *both* AC-3.3 and AC-8.4 means a reader arriving from either end gets the same
  ordering — the failure mode where a precedence is stated once, in the section nobody reads, is
  avoided.
- **The document verifies cleanly at its pinned base.** Nine of nine new or changed existing-behavior
  claims checked out line-for-line at `26c3f1c`, including the two subtle ones: that
  `precheckDependencies` runs strictly before the triage dispatch, and that `MERGE ESCALATION:`
  contains the `ESCALATION:` substring the one-grep claim depends on.

## Recommendation

**Approved with minor changes**

All seven v2 findings are closed — both Highs and both Mediums — and I verified each closure against
code at the base the REQ now pins, not against the document's own account of itself. No High or
Medium finding remains open, old or new, so the bar is met.

Three Lows remain, each one sentence:

1. **F-21** — say that A1 has no independent post-action gate, rather than naming a re-run that
   cannot fail. (Residual of the resolution I myself prescribed.)
2. **F-22** — say that AC-3.6's triggers match the invocation's *terminating* condition, so an
   exhausted A5 cycle reports `budget-exhausted` rather than `post-action-verification-failed`.
3. **F-23** — qualify AC-9.3's "absent at end of run" to a run that reaches completion.

None of the three blocks writing the acceptance suite: a test author who hits F-22 or F-23 will
notice the ambiguity at the moment of writing the expected value, and the answer is derivable from
the surrounding ACs in both cases. They should close in the same pass as any SE findings, and they
are the kind of detail TSPEC would otherwise have to invent.

This REQ is now testable end to end. The seam table, the four-entry envelope with decidable rules,
the closed test-tamper enumeration, the ordered refusal-reason table, the per-seam re-run matrix and
the config table together give it a mechanical acceptance matrix — enumerations that fail on
deletion, negatives paired with positives, and every existing-behavior claim anchored to a pinned
sha. That is a stronger foundation than most REQs carry into TSPEC.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 3}
APPROVAL-HASH: sha256:5b5fa9e2bfc7ef52bccba2b33ef789bbeb9375fa35149a712e5a564cba6de053
REVIEWED-COMMIT: b81d7d4c7bad4b5c2ef24754cdc6c63bce642487
