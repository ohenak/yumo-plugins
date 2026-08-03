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

## Findings

## Questions

## Positive Observations

## Recommendation
