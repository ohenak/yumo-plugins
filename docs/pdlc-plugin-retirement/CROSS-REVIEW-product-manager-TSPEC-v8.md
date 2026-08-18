# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.8)
**Date:** 2026-08-17
**Iteration:** 8
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## v7 findings disposition

Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v7.md`. `git diff 7c863b9f..HEAD` on the
TSPEC (134 insertions / 26 deletions, one file, five commits `ef36c40b`…`34215001`); only changed
sections were scanned for new issues. Unchanged, already-approved sections were not re-litigated.

| v7 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §2.9's class table now carries the three obligations §5.5 grew. The class-3 row names the `driftCapabilities.js` entry, the `skipSink.js` `WHAT IS NOT ENFORCED, AND WHY` paragraph, and the new fixture `__tests__/fixtures/skipJoinFalsifier.js` (TSPEC:296); the class-6 row names the ten `(hasBash ? it : it.skip)` conversions and the ten `"bash"` `SKIP_INVENTORY` rows they add, plus the serialisation constraint that both commits touch one file (TSPEC:299). A PLAN transcribing §2.9 no longer omits work AT-1.3 requires. |
| F-02 | Medium | **Resolved** | §5.5 now dispositions the helper doc explicitly: the header's rule is restated as spec-derived rows ∪ registered capability gaps a named TSPEC section owns, while keeping C2-not-closure and the "no named owner" prohibition (TSPEC:1011–1026). Quoted text verified verbatim at `pdlc/workflows/__tests__/helpers/skipSink.js:37`–`:46`. |
| F-03 | Medium | **Resolved** | §5.5's swept-surface enumeration is replaced by a four-member table with per-member reasons (TSPEC:815–822); `orchestrateQueue.test.js` is explicitly out with §4.4's L-6 row 1 resolution cited (TSPEC:824–830); the over-wide "four hosts of R-8 re-homes" reading is retracted in the document's own words (TSPEC:829–830); and the FSPEC domain gap is routed as §6.1 erratum 10 rather than decided silently (TSPEC:1204–1216). FSPEC's limb quoted accurately — `FSPEC:285`–`:287`. |
| F-04 | Low | **Resolved** | The child now overrides the inherited config: `--testPathIgnorePatterns=/node_modules/`, dropping the `helpers/` and `fixtures/` exclusions for the child only (TSPEC:955–961). Verified the three inherited patterns at `pdlc/workflows/package.json` (`jest.testPathIgnorePatterns`: `/node_modules/`, `/__tests__/helpers/`, `/__tests__/fixtures/`), and that no `testMatch` override exists, so the TSPEC's claim that jest's default `testMatch` collects any `.js` under `__tests__/` holds. |

All four v7 findings are closed. The findings below are new, and all of them sit inside the
sections this round changed.

## Findings

## Delta tags

## Questions

## Positive Observations

## Recommendation

