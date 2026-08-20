# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.4)
**Date:** 2026-08-20
**Iteration:** 4
**Base of the delta:** `24c17263` (the commit at which v3 was written) → HEAD

## Overview

**Scope of this round.** Delta re-review of the eight commits between `24c17263` and HEAD
(+30 / −8 lines on the PLAN, all of it inside four task rows, two gate/ledger rows, the naming
section, three new open-question answers and one new DoD clause). I read my v3 file, diffed the
document against the commit I reviewed, verified each of my four prior findings against the revised
text **and against the repository**, and scanned only the changed material for new issues. Sections
I approved in v3 and that the diff did not touch — the batch DAG, the 23 task rows' `Deps`/`Batch`
cells, the file-ownership manifest, the expected-red ledger's arithmetic, the measured coverage
baseline, DoD 1–12 — were not re-litigated.

**Disposition of the four v3 findings. All four are resolved.** Each landed as a changed clause in
the artifact the implementer transcribes from, not as a note about the clause.

| v3 | Sev | What v0.4 does | Resolved |
|---|---|---|---|
| F-01 | Med | LI-10's row now names the delegated positive assertion by value and by fixture row: "**including the healthy value**: `dispatches[i].corpusOutcome === null` asserted on dispatches 1, 2 and 4, which is the positive half LI-23's non-`null` scoping delegates here", with the falsification argument attached (`undefined`/`""`/omitted key would otherwise be green everywhere). LI-23 points back at it by name | ✅ |
| F-02 | Med→ | A new paragraph in §Test-name namespacing states the rule universally — "Only the six AT-bearing suites carry `LI-AT-` titles; every other test this feature adds is named `LI-T-*`, and `LI-T-SUITEMAP` enforces that" — declares it "a gate input, not a style preference", and names the two rows that do not enumerate their tests (LI-01, LI-06). This is the one-sentence fix that covers all six at once | ✅ |
| F-03 | Low | §Verification's green-terminal gate row and §T.5's green column both adopt the batch ladder's directory-wide phrasing: "statically parsing the `learnings*.test.js` directory, whose six AT-bearing suites all exist at the end of batch 5 and whose other six matching files register `LI-T-` titles only, so the closure is already equal to six at authoring" | ✅ |
| F-04 | Low | P-A-3's universe is now "the **twelve** `learnings*.test.js` suites", with the two non-suite manifest rows named and the reason they cannot carry a status stated, and "fourteen is the count of manifest test rows, not of ledger-eligible suites" | ✅ |

**One change this round was not mine, and it is the one I spent the most measurement on.** PM F-09
re-keyed LI-01's P-2a set equality from *(enclosing function, argument position)* to *(enclosing
named function, prompt-source symbol)*, because the old key was **not injective** over the four
authoring call sites. I re-measured that at HEAD and PM F-09 is correct: `erratumAuthorPrompt`'s
dispatch (`pdlc/workflows/orchestrate-dev.js:12861`) and the land-proof retry (`:12955`) are both
`wrappedDispatch({…})` object-literal calls inside `erratumRound` (`:12790`), and the PLAN's
supporting claim is exact — `const missingAgainst = async () => {…}` opens at `:12919` and closes
at `:12928`, before the retry, which is nested only in the `if (stillMissing.length > 0)` block at
`:12931`. The old key really would have yielded three members for four sites and reddened batch 1
on a correct tree.

**Verdict of this round: Approved with minor changes.** No High findings, and none open from any
prior round. One Medium and two Lows, all three on the re-key itself — the new key is injective at
HEAD, but it is a *keyed* set equality, and neither its cardinality conjunct nor its derivation
rule at two of the four sites is stated.

## Batches

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
