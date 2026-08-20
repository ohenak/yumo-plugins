# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.4)
**Date:** 2026-08-20
**Iteration:** 4
**Mode:** delta re-review — prior findings PM F-09, F-10 (v3, reviewed at `49f212ab`), and the v0.3→v0.4 changed sections only.

## Overview

Scope of this round: my two open v3 findings (**F-09** High — LI-01's P-2a set-equality key was not
injective over the four authoring call sites; **F-10** Low — P-A-3 quoted a fourteen-file ledger
universe where only twelve can carry red/green status), plus everything the v0.3→v0.4 delta touched.
The delta is small and surgical: nine hunks, 96 diff lines, no section reordered and no task row
added or removed. Changed loci are the version cell, a new test-name namespacing paragraph in
§Overview, LI-01's P-2a key, LI-10's healthy-`null` clause, LI-23's delegation pointer,
§Traceability's §T.5 green column, §Verification's batch-6 green-terminal gate row, DoD 13, P-A-3's
ledger universe, three new answers P-A-6…P-A-8, and the round-3 changelog row.

I re-verified every measured claim the delta rests on against HEAD of
`feat-pdlc-learnings-injection` rather than against the prior review, because the whole point of
F-09 was that a written key can be wrong about code that exists. Both prior findings are resolved.
I found one new **Low** finding — a stale count in an unchanged neighbour that the delta's own
recount now contradicts. No High finding is open.

**Both v3 findings resolved:**

| Prior | Severity | Status in v0.4 | Evidence |
|---|---|---|---|
| F-09 — LI-01's P-2a keyed by `(enclosing function, argument position)` yields three keys for four sites, so the declared "green by construction" suite reds batch 1 | High | **Resolved** | LI-01 (PLAN:140) now keys on **(enclosing named function, prompt-source symbol)** and enumerates the four pairs by name: `(erratumRound, erratumAuthorPrompt)`, `(erratumRound, the land-proof-retry inline template)`, `(converge, creatorPrompt)`, `(reviewLoop, optimizerPrompt — positional argument 4 of runWrapped)`. It also states the negative explicitly ("never keyed by enclosing function and **argument position**, which is not injective over these four sites") and records the structural reason — that `const missingAgainst = async () => {…}` closes before the retry, so the retry is nested only in plain `if` blocks inside `erratumRound`. I re-measured all four against HEAD; see §Verification |
| F-10 — P-A-3's ledger universe stated as "the fourteen `learnings*` files" when two of the fourteen manifest rows register no test | Low | **Resolved** | P-A-3 (PLAN:556) now reads "exactly the **twelve** `learnings*.test.js` suites the §File-ownership manifest owns", names the two excluded rows (`__tests__/helpers/learningsFixtures.js`, `__tests__/fixtures/learnings-baseline/`) as a helper module and a fixture subtree that "register no jest test and so can carry no red/green status", and keeps the reconciliation sentence a reader needs: "fourteen is the count of manifest test rows, not of ledger-eligible suites". The rest of P-A-3 — PROPERTIES outside the universe, committed green or after batch 14, else amended into the ledger by name — is unchanged and still correct |

## Batches

_pending_

## Dependencies

_pending_

## Verification

_pending_

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
