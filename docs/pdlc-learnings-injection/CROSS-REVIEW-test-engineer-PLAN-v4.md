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

**Three task rows changed: LI-01, LI-10, LI-23.** No row was added or removed (still 23), and no
`Test File`, `Source File`, `Batch` or `Deps` cell moved — I diffed the row tails to confirm that
rather than assuming it (`LI-10 … | 5 | LI-02, LI-06 | ⬚ |`, `LI-23 … | 5 | LI-02, LI-06 | ⬚ |`,
`LI-01 … | 1 | — | ⬚ |`, all unchanged).

| Row | Claim checked | Result |
|---|---|---|
| LI-10 | The healthy `corpusOutcome === null` clause on `DIVERGENT-CORPUS` dispatches 1, 2 and 4 | ✅ — and the fixture supports it exactly as the row says: the row's own description of `DIVERGENT-CORPUS` is "five authoring dispatches; the scripted `_git` reply gains a path after dispatch 2 and fails at dispatch 5", so dispatches 1, 2 and 4 are healthy and observable. No new fixture, no new task, no batch change — which is what I asked for |
| LI-23 | The back-pointer to LI-10's clause | ✅ — "asserted by `learningsRecord.test.js`'s BR-9 per-dispatch rows over `DIVERGENT-CORPUS`'s **dispatches 1, 2 and 4** (LI-10 / LI-19), and LI-10's row carries that clause by name". The delegation is now legible from both ends, and the forbidden repair (`LEARNINGS_CORPUS_OUTCOMES ∪ {null}`) is still forbidden in the same sentence |
| LI-01 | The re-keyed P-2a set equality, `(enclosing named function, prompt-source symbol)`, with the four sites enumerated | ✅ for injectivity at HEAD; ⚠️ for cardinality and for derivability at two of the four sites — F-01 and F-02 below |

**The four enumerated key pairs are true of HEAD. I measured each.**

| PLAN's pair | Site | Enclosing named function | Prompt slot at the site |
|---|---|---|---|
| `(erratumRound, erratumAuthorPrompt)` | `orchestrate-dev.js:12861` | `erratumRound` (`:12790`) | `basePrompt: erratumAuthorPrompt({…})` — the symbol is at the slot |
| `(erratumRound, the land-proof-retry inline template)` | `:12955` | `erratumRound` (`:12790`) | `basePrompt:` a bare template literal (`ERRATUM ROUND … LAND-PROOF RETRY.`) — no symbol |
| `(converge, creatorPrompt)` | `:13657` | `converge` (`:13628`) | `basePrompt: creatorPromptExtra ? \`${basePrompt}…\` : basePrompt` — `creatorPrompt` is bound one line earlier, `const basePrompt = creatorPrompt(phaseId, …)` at `:13656` |
| `(reviewLoop, optimizerPrompt — positional argument 4 of runWrapped)` | `:7663` | `reviewLoop` (`:7266`) | `runWrapped(optimizer, optPrompt, doc, "authoring", …)` — `optimizerPrompt` is bound at `const optPrompt = optimizerPrompt(…)`, `:7660` |

The key is injective over these four, so batch 1 is green on authoring as the row promises. The two
rows in this table with a binding hop are why F-02 exists: at `converge` and `reviewLoop` the named
"prompt-source symbol" is *not* readable from the dispatch expression — a static parse of the call
site sees the identifiers `basePrompt` and `optPrompt`. Those are still distinct from each other and
from the other two slots, so any parse an implementer writes stays injective; but the key the row
names and the key the row's own mechanism can read are two different things, and the row does not
say which one the test transcribes.

**The exclusion side of the keying is unchanged and still exact.** The five non-call-site
`"authoring"` occurrences — `:6511` (a doc comment), `:6515` and `:8886` (reads:
`dispatchKind !== "authoring"`, `dispatchKind === "authoring"`), `:6517`/`:6535` (`mode:` literals)
and `:8982` (a message string) — are all correctly outside the keyed set under either keying, and
the row's "a literal grep for `dispatchKind: \"authoring\"` returns 3, not 4" is still true.

**TDD order, `[Fake first]` and same-batch same-new-file are all unchanged.** No test file changed
owner, no new file entered the manifest, and every implementation row still has a preceding red-test
row naming the same suite. LI-10's added clause lands in a suite LI-10 already owns and LI-19
already greens; LI-23's added clause is a cross-reference and asserts nothing new.

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
