# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md
**Date:** 2026-08-29
**Iteration:** 4 (delta confirmation)

## Overview

**Confirmation question:** does the erratum delta resolve the routed item without breaking what
v3 approved?

**Answer: no — the routed item did not land.**

The round I approved was `REVIEWED-COMMIT: 665eb44a827b16c42f8eff822915608631be3b3a`
(`CROSS-REVIEW-test-engineer-PLAN-v3.md`). Four commits have landed on the PLAN since:

| Commit | Subject |
|---|---|
| `19e148f69` | PLAN v0.4 header — re-ground on TSPEC v0.8 |
| `538747659` | PLAN T-11 drops decisionLedger census token (TSPEC v0.8) |
| `86cd12216` | PLAN T-05/T-06 cite P-REC and P-LINE with O-8 mutation discipline |
| `36cd34d4d` | PLAN DoD — P-REC/P-LINE mutations and six-token census |

None of them touches `T-00a` or `T-12a`. Mechanically verified: both rows are **byte-identical**
to the version I approved at `665eb44a8` —

```
$ diff <(grep "^| T-00a |" <approved>) <(grep "^| T-00a |" <HEAD>)   # no output
$ diff <(grep "^| T-12a |" <approved>) <(grep "^| T-12a |" <HEAD>)   # no output
```

So this delta is a **TSPEC-v0.8 re-grounding erratum**, not the T-00a/T-12a erratum that was
routed. What it *did* land is faithful (see `## Dependencies`); what it was dispatched to land is
absent. The routed item is therefore an unlanded `delta` finding, and it is High: the ownership of
the terminal `102` assertion is still nowhere in the document.

This is the "necessary, not sufficient" split working in the operator's favour — the landed work is
good, and it is simply not the work the round was asked for.

## Batches

### The routed item, restated against HEAD bytes

The `102` literal in `documentOracles.test.js` has **three** candidate owners in this PLAN and,
after this delta, still **zero** actual ones.

**T-00a (batch 1)** — HEAD text:

> Acceptance is two-sided: the exclusion lands **and** the filtered count is still `102` after this
> PLAN's twelve new modules exist.

T-00a lands in batch 1. At batch 1 exactly three `decisionLedger*` modules exist (T-00, T-02, T-03
per the file-ownership manifest); the remaining nine arrive in batch 2. The second conjunct is
quantified over a state of the world — "after this PLAN's twelve new modules exist" — that does not
obtain when the task is executed or when its wave gate runs. **An acceptance conjunct that cannot be
evaluated when the task is accepted is not an acceptance conjunct.** It is either vacuously true (an
implementer reads it as "the filter I just wrote does not disturb the complement", which is the
*first* conjunct restated) or unevaluable. Either way it proves nothing, and a two-sided acceptance
that is really one-sided is exactly the "test that can only pass" shape.

**T-00a's own disclaimer** then hands the obligation away:

> ... the namespace's own census — the **terminal** obligation — lives in T-12a ...

**T-12a (batch 2, un-skipped batch 9)** then declines it:

> one conjunct asserting the set of `pdlc/workflows/__tests__/decisionLedger*.test.js` module names
> is **set-equal** to the twelve names hand-transcribed from this PLAN's file-ownership manifest.
> **It is a set, not a count** ...

A set-equality over the *`decisionLedger*` namespace* and a count over the *whole `*.test.js`
directory* are different oracles with different falsifying inputs. T-12a's set census reds when a
`decisionLedger*` module is dropped or renamed. It is structurally blind to a **non-`decisionLedger`
module** being added or deleted — precisely the drift the `102` literal exists to catch. So the
`102` pin, which T-00a's own text calls "saturated" and load-bearing, is left unowned across the
whole feature: T-00a asserts it at a moment when it cannot mean what it says, and T-12a says it is
not doing counts.

### What the revision must state

Name the task that carries the terminal `102` assertion, and make its batch consistent with its
evaluability. Two coherent shapes, either acceptable:

1. **Give it to T-12a.** T-12a is already un-skipped at batch 9, which is the first moment all
   twelve modules exist. Add a second conjunct to T-12a: the filtered `*.test.js` count is `102`
   *with* the `decisionLedger` exclusion active. Then delete T-00a's second conjunct and change its
   hand-off sentence to name this conjunct explicitly, rather than gesturing at "the namespace's own
   census". T-12a's "it is a set, not a count" sentence must be narrowed to the *namespace* census
   so it no longer disclaims the count it now also carries.
2. **Keep T-00a one-sided and say so.** Make T-00a's acceptance the complement pin only — "the
   filtered count is `102` against the three batch-1 modules, proving the exclusion prefix is not
   over-broad" — and route the twelve-module terminal count to a named batch-9 task.

Shape (1) is the smaller edit and keeps one terminal document-oracle owner. Either way the PLAN must
name **one** task id for the terminal `102`, and that task's batch must be ≥ the batch in which the
twelfth module lands (batch 2 at the earliest, batch 9 given the un-skip discipline).

Nothing else in `## Batches` moved in this delta. T-05, T-06 and T-11 changed and are reviewed in
`## Dependencies` (their changes are upstream-citation changes). Batch columns, dependency edges and
`[red]`/`[green]` pairings are untouched by this delta and were re-derived clean in v3 — I do not
re-litigate them here.

## Dependencies

Per DEC-ERR-03 my scope is this PLAN against upstream **at HEAD**, not the routed item list. The
delta re-grounds the PLAN on TSPEC v0.8, so the upstream check is the substantive half of this
round.

### Upstream pins

| Doc | Dispatch sha256 | On disk | PLAN header pin | Verdict |
|---|---|---|---|---|
| REQ v1.9 | `ce6b133f…3c7b7c` | matches | `sha256:ce6b133f…3c7b7c` | ✅ |
| FSPEC v1.3 | `2bd5c3ef…5aed39` | matches | `sha256:2bd5c3ef…5aed39` | ✅ |
| TSPEC **v0.8** | `28d25518…32cb49` | matches | `sha256:28d25518…32cb49` | ✅ |
| DECISIONS | `13aba061…4fb89a` | matches | `sha256:13aba061…4bb89f` | ❌ **wrong tail** |

The DECISIONS digest on disk is
`13aba06127b4d392bdf71f93066dd7ed6cb626dadbc4dda54029ab80bb4fb89a` — last six characters `4fb89a`.
The header pin transcribes `4bb89f`, a transposition. The other three pins were transcribed
correctly in the same edit, so this is an isolated slip, but a staleness anchor that does not match
the artifact it names is a broken anchor: the next re-grounding round comparing pins will see a
mismatch it cannot attribute. Fix the tail to `4fb89a`. (F-03, Medium.)

Version claims verified against upstream front-matter: REQ line 22 declares `v1.9`, FSPEC line 19
declares `v1.3`, TSPEC line 19 declares `v0.8`. All three match the header. ✅

### T-05 / T-06 against TSPEC §7.5

TSPEC §7.5 (lines 1345–1427) now promotes `P-REC` and `P-LINE` from example to property. Checked
conjunct by conjunct:

- **T-05 / `P-REC`** — PLAN claims "**four** named falsifying mutations". TSPEC §7.5 names exactly
  four: admit an out-of-depth heading; admit an empty-statement heading; normalise/trim the
  statement instead of slicing verbatim; resolve duplicates first-wins instead of last-wins. The
  PLAN row reproduces all four in the same order. ✅
- **T-06 / `P-LINE`** — PLAN claims "**three**". TSPEC names exactly three: render a statement
  containing `\n` unescaped; join two records onto one line; emit the set in an order other than
  §3.6's. Reproduced faithfully. ✅
- **O-8 discipline** — both rows say the expectation is computed by an **independent model, never
  the production recogniser/renderer**. TSPEC §7.5's closing paragraph says exactly that ("an
  independent model, never the production renderer or recogniser, and a recorded observed red per
  named mutation"). ✅ This is the mutation-testing bar this project asks for, stated at the right
  altitude and with observed-red transcription required. Good work.

### T-11 against TSPEC §7.3 — one misattributed citation

The **six-member** `DECISION_LEDGER_CENSUS_TOKENS` set in T-11 set-equals TSPEC's operand table
(TSPEC line 1234): `selectDecisions`, `recogniseDecisionRecords`, `renderDecisionLedgerBlock`,
`gatherDecisionCorpus`, `DECISION_LEDGER_OMIT_REASONS`, `DECISION_LEDGER_CORPUS_OUTCOMES`. ✅ The
rationale T-11 gives for dropping `decisionLedger` — the report field is threaded through
`buildFinalReport` at sites far outside `main()`'s sentinel-bounded region, so the bare name is in
the scanned remainder by construction and the census would red on conforming code — is a faithful
compression of TSPEC lines 1248–1258, including the rejected alternative (carving `buildFinalReport`
out blinds a larger surface) and the "not an exported symbol, so set-equality stays exact" point. ✅

**But the section id is wrong.** T-11 and the Definition of Done both cite this as
"TSPEC v0.8 **§5.5**". That material is in **§7.3** ("The frozen fixture copy, and why it is not the
live repository", lines 1091–1260); the adjacent discipline it leans on is cited by TSPEC itself as
**§5.4**. TSPEC §5.5 is "The one thing the driver never holds" — a different claim entirely
(`DecisionRecord.id` is never a driver-side input). An implementer following §5.5 to check why
`decisionLedger` is exempt finds nothing about the census and cannot verify the exemption. Two
sites to fix: the T-11 row and the DoD bullet. (F-02, Medium.)

I am not raising this as a High: the PLAN row restates the full rationale inline, so no implementer
is blocked, and the drop itself is correct against upstream.

## Verification

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
