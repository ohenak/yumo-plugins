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

Only three task rows changed (LI-01, LI-10, LI-23) and one §Overview paragraph was added above the
table. I read each against the requirement it serves and against the code it claims to measure.

**LI-01 (batch 1) — the re-key is correct against HEAD, and it is the fix I asked for.** The four
authoring dispatch sites in `pdlc/workflows/orchestrate-dev.js` at HEAD are:

| Site | Enclosing named function | Prompt source | Shape |
|---|---|---|---|
| `orchestrate-dev.js:7663` | `reviewLoop` (declared `orchestrate-dev.js:7266`) | `optimizerPrompt` | positional `"authoring"`, argument 4 of `runWrapped` |
| `orchestrate-dev.js:12861` | `erratumRound` (declared `orchestrate-dev.js:12790`) | `erratumAuthorPrompt` | object literal `dispatchKind: "authoring"` |
| `orchestrate-dev.js:12955` | `erratumRound` | inline land-proof-retry template literal | object literal `dispatchKind: "authoring"` |
| `orchestrate-dev.js:13657` | `converge` (declared `orchestrate-dev.js:13628`) | `creatorPrompt` | object literal `dispatchKind: "authoring"` |

Under the new key the four sites yield four distinct pairs, so the transcribed expected set of four
is the set an implementer observes at batch 1 and the suite is green by construction as the row
claims. I checked the structural claim the row leans on: `const missingAgainst = async () => {…}`
opens at `orchestrate-dev.js:12919` and closes before the retry dispatch at `:12955`, which sits
directly in `erratumRound` under plain `if` blocks — so "enclosing named function" resolves to
`erratumRound` for both erratum sites, exactly as the row states, and the prompt source is the only
thing separating them. The row's escape hatch ("Any injective structural key serves; what may not
survive is a key two of the four sites share") is the right level of prescription: it names the
property that matters rather than over-pinning an implementation detail. The `LI-T-` grep caveat
from TE F-12 ("a literal grep for `dispatchKind: \"authoring\"` returns 3, not 4") still reads
correctly against HEAD — `grep -n 'dispatchKind: "authoring"'` returns `:12861`, `:12955`, `:13657`.

**LI-10 (batch 5) — the healthy-`null` clause is a real oracle addition, not a restatement.** The
row now asserts `dispatches[i].corpusOutcome === null` on `DIVERGENT-CORPUS` dispatches 1, 2 and 4,
and gives the product reason: without it "an implementation recording `undefined`, `""` or omitting
the key entirely on healthy dispatches is green everywhere, since `null` is the value the field
carries on the overwhelming majority of runs". That is the positive half of the absence-only oracle
LI-23's non-`null` scoping would otherwise leave dangling, and it is asserted on a fixture that
already produces those dispatches — no fixture change, no new dependency. The expected value is a
literal transcription of TSPEC §D.2's `corpusOutcome: null, // | "RSN-UNLISTABLE" | "RSN-EMPTY"`,
not derived from the code under test.

**LI-23 (batch 5) — the delegation now names its counterpart.** The row previously said the healthy
`null` "is asserted by `learningsRecord.test.js`'s BR-9 per-dispatch rows"; it now says which
dispatches of which fixture (`DIVERGENT-CORPUS`'s dispatches 1, 2 and 4) and that "LI-10's row
carries that clause by name … rather than leaving the delegation to be inferred". The two rows are
now mutually anchored, so deleting the clause in one leaves a dangling reference in the other rather
than silently dropping the positive assertion. The rejected repair (`LEARNINGS_CORPUS_OUTCOMES ∪
{null}`) is still named and still refused on the correct ground.

**New §Overview paragraph (PLAN:93-99) — the `LI-T-*` naming rule as a gate input.** The paragraph
states that only the six AT-bearing suites carry `LI-AT-` titles, that `LI-T-SUITEMAP` enforces it
via set-equality-to-six over the `learnings*.test.js` directory, and that the rule covers the two
rows which do not enumerate their test names (`learningsPremises.test.js` at LI-01,
`learningsBaselineGuard.test.js` at LI-06). I checked the batch arithmetic this depends on: all
twelve suites exist by the end of batch 5 (LI-12 and LI-23 are the last two, both batch 5), so the
directory closure at batch 6 sees twelve files and six contributors, and a naming slip in a
green-terminal batch-1 or batch-4 suite does surface at batch 6 as claimed. One stale count in the
unchanged LI-14 row now disagrees with this paragraph — F-11 below, Low.

## Dependencies

No `Deps` cell changed in the delta, and none needed to. Two dependency-shaped questions the delta
does answer, both correctly:

- **P-A-6 (answers my Q-06) — Phase P's scheduling dependency on this wave is now recorded.** The
  answer separates authoring from committing, which is the distinction my question was probing:
  "Author whenever; commit at the first point the suite is green, which in practice is after LI-21
  (batch 13)." It states the product consequence plainly — the PROPERTIES **document** is prose and
  may land at any time, the PROPERTIES **suite** lands in one commit once green — and it says out
  loud that yes, Phase P has a scheduling dependency on this wave and no task row in this PLAN owns
  either artifact. That is the honest answer rather than the convenient one, and it leaves the
  operator a decision they can act on.
- **P-A-7 (answers TE Q-01) — the amendment locus is unified with P-A-5.** "A live table is amended
  by an edit to this PLAN, committed before the run it governs" now covers both the expected-red
  ledger and the §File-ownership manifest under one rule. From the product lens this matters because
  both tables are read by a dispatcher to decide whether a batch passed; an amendment recorded in a
  completion note is invisible to the thing that enforces it. The generalisation does not widen any
  gate — it names where an existing obligation is written down.

The dependency graph LI-14 sits on is unchanged and still consistent with the new §Overview
paragraph: LI-14's `Deps` are LI-07…LI-12 (the six AT-bearing suites), its batch is 6, and the two
suites the new paragraph adds to its enforcement surface (LI-01 batch 1, LI-06 batch 4) are already
transitively upstream, so the wider read needs no new edge — as the LI-14 row already argued for the
directory-wide closure ("a file that does not yet exist can only fail to *contribute* a member").

## Verification

Every claim in the delta that asserts something about code or about this repository's current state,
re-measured at HEAD of `feat-pdlc-learnings-injection`:

| Delta claim | Measured | Verdict |
|---|---|---|
| Four authoring dispatch sites, three object-literal and one positional | `orchestrate-dev.js:12861`, `:12955`, `:13657` carry `dispatchKind: "authoring"`; `orchestrate-dev.js:7663` passes `"authoring"` positionally to `runWrapped` | Holds |
| `erratumAuthorPrompt` dispatch and land-proof retry are both `wrappedDispatch({…})` calls inside `erratumRound` | `erratumRound` declared at `orchestrate-dev.js:12790`; both call sites (`:12861`, `:12955`) lie inside it | Holds — and this is precisely why the old key was not injective |
| `const missingAgainst = async () => {…}` closes before the retry | Opens `orchestrate-dev.js:12919`, returns at `:12927`, closes before the `if (stillMissing.length > 0)` block containing `:12955` | Holds |
| `(converge, creatorPrompt)` | `converge` declared `orchestrate-dev.js:13628`; `const basePrompt = creatorPrompt(phaseId, featureName, …)` at `:13651`, the `wrappedDispatch({…})` call opening at `:13652` with `dispatchKind: "authoring"` at `:13657` | Holds |
| `(reviewLoop, optimizerPrompt — positional argument 4 of runWrapped)` | `reviewLoop` exported at `orchestrate-dev.js:7266`; `const optPrompt = optimizerPrompt(doc, phase, feature, …)` at `:7656`, `runWrapped(optimizer, optPrompt, doc, "authoring", …)` at `:7659-7664` — `"authoring"` is argument 4 | Holds |
| Twelve `learnings*.test.js` suites in the manifest; the other two test rows are a helper and a fixture subtree (P-A-3) | Twelve distinct `learnings*.test.js` names appear across the document; the two non-suite rows are `__tests__/helpers/learningsFixtures.js` and `__tests__/fixtures/learnings-baseline/` | Holds |
| All twelve suites exist by end of batch 5, so batch 6's directory closure is well-defined | Latest-batch suites are LI-12 and LI-23, both batch 5 | Holds |
| Suite files are all new — no `learnings*` file exists under `pdlc/workflows/__tests__/` at HEAD | Re-measured: the directory still contains no file matching `learnings*` (case-insensitive) | Holds — the batch-1 pre-flight measurement DoD 13 now preserves is still true today |

**DoD 13 (answers my Q-07) — the two written records now have a clause that requires them.** The new
clause reads: "LI-01's completion note exists and carries both of its written records … the one-time
pre-flight measurement of the §Overview change-surface table's four absence claims at HEAD, and the
H-2 engine-failure triage citing the CI run that decides it." P-A-8 gives the reason in the same
terms I asked in: neither record is a test, the absence claims stop being checkable after batch 4 by
construction (that is exactly why F-07 moved them out of the standing suite), and without a DoD
clause the only thing preserving them is a batch-1 habit. This closes the loop F-07 opened — F-07
took the absence claims out of the suite, and DoD 13 is what keeps them from evaporating entirely.

**§Verification's batch-6 green-terminal row and §Traceability's §T.5 green column now use the batch
ladder's phrasing.** Both read as a static parse of the twelve matching `learnings*.test.js` files,
six AT-bearing, rather than "six suite files" — so the three places a reader can learn what
`LI-T-SUITEMAP` reads now agree on the number of files read and the number that contribute. The
green-terminal justification keeps its pre-existing-status conjunct.

**Expected-red ledger unchanged and still a set equality.** No ledger row moved in the delta, and
P-A-3's narrowing from fourteen to twelve does not add or remove a ledger member — it corrects the
description of the universe the set equality is taken over. The 35-member AT coverage baseline
(§Traceability) is untouched.

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
