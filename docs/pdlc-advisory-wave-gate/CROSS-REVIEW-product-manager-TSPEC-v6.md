# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md` (v1.15)
**Date:** 2026-08-20
**Iteration:** 6 (delta re-review)
**Delta reviewed:** `6f00074c..HEAD` (5 commits, 76 insertions / 13 deletions)

## Scope

A delta re-review, not a re-read. v5 closed **Approved with minor changes** — zero High, two Low
(F-01: §4.5 cited `TEST_GATE_MESSAGE` as a production symbol that does not exist; F-02: §5.2's
stale "six positive assertions" numeral). This round landed five commits — `5824d064`, `aac5dc9e`,
`f41e280f`, `c450e6cb`, `ffbc2b18` — touching only §4.5 (the push site, the gate-message anchor,
the un-skip row), §5.1 (the shipped four-key oracles named as edits, a new row for
`advisoryWaveGateMain.test.js`), §5.2 (five-key equality *replaces* four-key, numeral dropped),
§5.6 (AT-06-4's quantifier coverage of the un-skip arm) and the lineage header / changelog.

I read only those sections, plus every production and test symbol the new prose names. Sections
approved in earlier rounds and untouched by this delta are not re-litigated. Every claim below was
checked against `pdlc/workflows` at HEAD, not against the TSPEC's own account of it.

## Prior findings disposition

Both v5 Lows are resolved on the merits, not reworded away.

| Prior | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| v5 F-01 | Low | **Resolved** | §4.5's survival paragraph now names the real thing: "the per-wave template `Error: Wave ${waveNum} test gate failed — …` built at the call site, *not* a module constant", and states explicitly that `TEST_GATE_MESSAGE` is §2.3 pseudocode shorthand with "no such symbol exists in `pdlc/workflows`" (TSPEC `:1470-1477`). Confirmed: `grep -rn TEST_GATE_MESSAGE pdlc/` returns nothing; the literal is `orchestrate-dev.js:15359`, thrown at `:15399`. The round went further than the finding asked and corrected the *oracle form* too — AT-05-3 ships as **containment**, not equality: `advisoryWaveGateMain.test.js:368` `expect(result.haltReason).toContain("Wave 1 test gate failed")` and `waveExecution.test.js:571` / `:1092` `.toContain("Error: Wave 1 test gate failed")`. Both transcriptions are exact. |
| v5 F-02 | Low | **Resolved** | The numeral is gone; the claim it carried is kept: "Every item in this inventory is a positive assertion on one fixture, not an absence check" (TSPEC `:1642-1647`), with a one-clause note on why the count went stale. This is the right repair — the count was never the point. |

## New findings in changed sections

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
