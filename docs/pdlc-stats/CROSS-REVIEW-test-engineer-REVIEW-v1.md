# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/` implementation — `pdlc/workflows/lib/stats.mjs`, `pdlc/engine/bin/cli.mjs` (`cmdStats`/`statsParsers`/`statsIo`), and the twelve test files added on `feat-pdlc-stats`
**Date:** 2026-08-31
**Iteration:** 1

## Scope

Testing lens only: testability, oracle falsifiability, property coverage, production-path
wiring, and the branch-coverage floor. Product framing, architecture choice and code style
are out of scope and are left to the PM and SE reviews.

## Verification Performed

Every claim below was re-derived from the working tree at `feat-pdlc-stats`, not from the
specification documents.

| # | Check | Result |
|---|-------|--------|
| 1 | `git rev-parse --abbrev-ref HEAD` | `feat-pdlc-stats` — confirmed before any commit |
| 2 | Full workflows suite (`cd pdlc/workflows && npm test`) | 163 suites, 5116 passed, 70 skipped — green |
| 3 | Gate command (`npm run test:coverage`) | exit 0 — the per-file `--branches 85` floor holds |
| 4 | Targeted c8 over `lib/stats.mjs` (`--include '**/pdlc/workflows/lib/stats.mjs' --allow-external`) | **95.62% branch**, 99.33% stmt, 100% func — above the 85% floor; uncovered lines `422-423`, `503-504` |
| 5 | `lib/stats.mjs` is in the gate's `c8.include` list | `pdlc/workflows/package.json` — confirmed present, so the floor is genuinely enforced on this module, not merely inherited from a source list |
| 6 | Production path traced | `main()` `case "stats"` (`pdlc/engine/bin/cli.mjs:1361`) → `cmdStats` → `statsParsers()`/`statsIo()` → `runStats` — no builder-only coverage |

**Coverage-gate provenance (DC-09 discipline).** The floor is not asserted from a source-list
membership claim: `pdlc/workflows/package.json`'s `c8.include` names
`**/pdlc/workflows/lib/stats.mjs` explicitly, `test:coverage` runs
`c8 report --check-coverage --per-file --branches 85`, and I re-ran that gate to exit 0 rather
than trusting the number in the PLAN.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | AT-27's human-mode legs assert no positive condition clause; the absent-vs-unreadable distinction rests on a bare byte-inequality, so swapping the two messages survives the whole suite | `statsOutcome.test.js:334-335,341-360`; FSPEC AT-27 (`FSPEC:867-869`); PROP-ERR-03 |
| F-02 | High | Local | The single-feature human `malformed:` row (BR-17, EC-05) has zero test coverage — c8 reports `stats.mjs:503-504` uncovered, and no test renders a single-feature human report with a non-empty malformed list | `stats.mjs:502-504`; FSPEC:415, EC-05 (`FSPEC:575`) |
| F-03 | Medium | Local | The fleet malformed-count oracle is `stringContaining("2")`, which the halts cell `"2 (1 resolved)"` already satisfies on the same string — the malformed conjunct cannot fail independently | `statsRender.test.js:396` |
| F-04 | Medium | Process | PROP-PBT-04 re-derives the expected ratio with the implementation's own formula, from the byte totals reported by the object under test — an implementation echo over circular inputs | `statsProperties.test.js:262-264` vs `stats.mjs:210-212` |
| F-05 | Low | Local | `renderHaltsBlock` pads the phase column to 4 while the review block pads to 12; no test pins a phase name at or beyond that width, so column alignment for a longer phase token is unspecified and unproven | `stats.mjs:510`; `statsRender.test.js` |

### F-01 (High) — AT-27's human legs have no positive condition conjunct

FSPEC AT-27 is unusually explicit about what it wants, and the wording is the reason this is
gating rather than a nit (`docs/pdlc-stats/FSPEC-pdlc-stats.md:866-869`):

> over the eight root-failure runs … every run exits 1 and **every conjunct is positive**: each
> stderr message names the root; **each carries the clause matching its own condition** (absent
> in the absent runs, unreadable in the unreadable runs, so the two messages are **not**
> byte-identical)

PROP-ERR-03 repeats the same requirement (`PROPERTIES-pdlc-stats.md:252`). The spec authors
anticipated exactly the failure mode below and wrote the byte-inequality as a *consequence* of the
positive clause, not as a substitute for it.

What shipped inverts that. In the eight-run matrix, the human legs assert only:

```js
expect(outcome.stdout).toBe("");
expect(outcome.stderr).toEqual(expect.stringContaining("/repo/docs"));
```

— `statsOutcome.test.js:334-335`. That is the "names the root" conjunct alone. The condition
clause is then carried by a separate, purely negative test
(`statsOutcome.test.js:341-360`):

```js
expect(absentOutcome.stderr).not.toBe(unreadableOutcome.stderr);
```

Neither message's content is ever asserted anywhere in the repository — I grepped for the literals
`docs root not found` and `docs root unreadable` across all twelve stats test files and both
strings appear only in `stats.mjs:390,396`, never in a test.

The concrete false-green: swap the two branch bodies in `docsRootStatus`
(`stats.mjs:388-398`) so the absent path emits `docs root unreadable: …` and the unreadable path
emits `docs root not found: …`. Every assertion still passes — both messages still name the root,
they are still not byte-identical, and the JSON legs still see `reason: "no_docs_root"` because the
reason is set at the call site (`stats.mjs:406`), not by the message. The operator is told the
opposite of the truth on the first invocation a new caller mis-runs, and the suite is green.

**To resolve:** add the positive conjunct the spec asks for to the human legs of the matrix — carry
the expected clause on each `rootScenario` (e.g. `clause: /not found/` and `clause: /unreadable/`)
and assert `expect(outcome.stderr).toMatch(root.clause)` alongside the existing root-naming
conjunct. That makes the byte-inequality test redundant in the good way: it becomes a derived
property rather than the only thing standing between the suite and a swapped diagnostic. While
there, close the second half of PROP-ERR-03's "no message is EC-01's not-found message" clause for
human mode, which is presently asserted only through `doc.error.reason` in the JSON legs
(`statsOutcome.test.js:330`).

### F-02 (High) — the single-feature human `malformed:` row is never rendered by any test

BR-17's single-feature layout includes a malformed row, transcribed literally in the FSPEC
(`FSPEC-pdlc-stats.md:415`):

```
  malformed: CROSS-REVIEW-pm-REQ-v01.md
```

and EC-05 (`FSPEC-pdlc-stats.md:575`) requires the malformed basename be "listed as malformed under
the review-rounds metric, **naming the basename**", at exit 0.

The implementation has it (`stats.mjs:502-504`), but c8 reports those exact lines uncovered:

```
File       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
 stats.mjs |   99.33 |    95.62 |     100 |   99.33 | 422-423,503-504
```

Tracing why: `statsRender.test.js:121` supplies a non-empty malformed list but asserts only
`renderJson` output; `statsRender.test.js:384` supplies one but renders a **fleet** report, which
takes the count path (`stats.mjs:545`), not the row. So the one operator-visible surface EC-05
actually names — the basename appearing in human single-feature output — is proven nowhere.
Deleting `stats.mjs:503` entirely leaves the suite green.

Note this is not caught by the coverage gate either: 95.62% branch clears the 85% floor
comfortably, which is precisely why a floor is a floor and not an oracle.

**To resolve:** add one single-feature `renderHuman` case with a non-empty malformed list that
asserts the basename appears verbatim in the output, and asserts the row is absent when the list is
empty (the `>0` guard's other side). One test closes both uncovered lines and EC-05's naming clause.

### F-03 (Medium) — the fleet malformed-count conjunct cannot fail independently

`statsRender.test.js:395-398` proves D-7's two reductions:

```js
expect(human).not.toEqual(expect.stringContaining("CROSS-REVIEW-pm-REQ-v01.md"));
expect(human).toEqual(expect.stringContaining("2"));
expect(human).toEqual(expect.stringContaining("2 (1 resolved)"));
```

The fixture has two malformed basenames *and* two halts. The `stringContaining("2")` conjunct is
therefore already satisfied by the halts cell asserted on the very next line — mutate
`malformed=${entry.reviewRounds.malformed.length}` (`stats.mjs:545`) to `malformed=0`, or drop the
cell altogether, and the test still passes. Only the negative conjunct on line 395 is load-bearing,
and a negative alone does not establish that the count reduction happened.

**To resolve:** assert the rendered cell, not a loose substring — `expect(human).toEqual(
expect.stringContaining("malformed=2"))` — and choose a halt count that differs from the malformed
count so the two reductions can never alias again.

### F-04 (Medium, Process) — PROP-PBT-04's oracle echoes the implementation over its own outputs

`statsProperties.test.js:262-264`:

```js
const { specBytes, processBytes, ratio, state } = result.byteRatio;
...
expect(ratio).toBe(Math.round((processBytes / specBytes) * 100) / 100);
```

Two problems compound. First, `Math.round(x * 100) / 100` is a character-for-character
reproduction of `round2` (`stats.mjs:210-212`) — the expected value is derived by re-executing the
code under test rather than transcribed from BR-15's stated contract. Second, both operands come
out of `result.byteRatio`, the very object under test, so the assertion reduces to "the module's
rounding of the module's own totals equals the module's ratio". Any mutation to which basenames
land in the spec set versus the process set (`stats.mjs:278-290`) leaves this property green,
because numerator and denominator move together on both sides of the equals sign.

The property's stated purpose — a bounded generator keeps the quotient finite — is met by the
`Number.isFinite(ratio)` conjunct on line 263, which is fine. It is the added equality that is
circular.

**To resolve:** either drop the echo and keep the finiteness conjunct the property is named for, or
make it independent: compute the expected numerator and denominator from the *generated* `pairs`
(the sizes the test itself chose) rather than from `result.byteRatio`, and express the 2dp contract
as BR-15 states it rather than as `round2`'s body. This is tagged `Process` because
"expected value re-derived by re-running the implementation's formula" is a recurring shape worth
carrying into the review checklist, not a fact about this feature.

### F-05 (Low) — halt phase column width is unpinned

`stats.mjs:510` pads the phase to 4 characters while the review block pads to 12
(`stats.mjs:500`). Fixtures use `PR`, `D`, `F`, all within the pad, so no test distinguishes a
phase token at or beyond width 4 (`DOD`, `PUB` fit; a longer future phase name would not). The
layout contract for that case is neither specified nor asserted. Not gating — flagged so the
column width is a decision rather than an accident.

## Questions

## Positive Observations

## Recommendation

