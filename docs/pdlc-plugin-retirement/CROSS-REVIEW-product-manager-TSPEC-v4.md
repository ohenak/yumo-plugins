# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.4)
**Date:** 2026-08-17
**Iteration:** 4
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v3.md`. Prior findings verified against
the revised text; only the changed hunks (`git diff 85b1d754..HEAD`, 53 insertions / 11 deletions,
one file) scanned for new issues. Unchanged sections already approved are not re-litigated.

## Prior findings disposition

| v3 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §5.2's TT-3 half (b) now enumerates five members — `cleanup-consumer-workflows.sh`, `check-req-size.sh`, `check-scope-field.sh`, `guard-harvest-before-delete.sh`, `nudge-consolidation.sh` — and keeps the companion set-equality assertion against tracked executables under `pdlc/hooks/scripts/`. Measured at HEAD, `git ls-files -s pdlc/hooks/scripts/` returns six `100755` files; the sweep deletes exactly two of them (`check-workflow-drift.sh` class 4, `sync-workflows.sh` class 5), leaving four surviving plus the new script — five, matching the row. `lib/pdlc-drift.sh` is `100644` and the row now states the carve-out explicitly. Every AC-3.3 hook now has a mode-bit oracle. |
| F-02 | Low | **Resolved** | §4.4 no longer says "the three hooks AC-3.3 names". It now reads that three of `FIVE_SCRIPTS`'s five members survive, states plainly that `FIVE_SCRIPTS` was never coextensive with AC-3.3's set because it omits `check-req-size.sh`, and names the re-home as a **widening** rather than a copy. The miscitation cannot propagate into PLAN or PROPERTIES. |
| F-03 | Low | **Resolved** | §5.2's AT-3.3 clause 2 row now names a host module per hook and withdraws the overstated "neither covered today". It credits `PROP-COMPAT-04` with its existing `expect(exitCode).toBe(0)` and scopes the new work to a parsed-JSON strengthening; it homes the `nudge-consolidation.sh` assertion in `consolidationHookParity.test.js` beside the corpus that already spawns the hook. Verified: `hookCompatibility.test.js:100` asserts `expect(exitCode).toBe(0)` with containment-only stdout checks at `:102`–`:103`, and `PROP-COMPAT-06` does parse — `JSON.parse(stdout).hookSpecificOutput.additionalContext` at `hookCompatibility.test.js:332` — so the "strengthen 04 to 06's shape" instruction is codeable as written. |

All three v3 findings are closed against the tree, not merely against the prose. The round's new
material is §5.5's orphan-freedom paragraph, §6.1 erratum 8, §5.2's TT-1b row, and the §3.2 exit-status
sentence. Scanning those changed sections surfaces one new High finding (F-01 below) inside §5.5's
new assertion, plus one Low about what that assertion actually proves. Nothing in the round reopened
a previously approved section.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
