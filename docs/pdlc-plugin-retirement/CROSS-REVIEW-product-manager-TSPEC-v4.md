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

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§5.5's new orphan-freedom assertion is false as written for two surviving helpers, so the oracle that closes erratum 8's gap cannot be coded to.** The paragraph specifies: "after the sweep, **every** file under `pdlc/workflows/__tests__/helpers/` is imported by at least one surviving module (re-derived by grepping the surviving `__tests__` tree, not from a transcribed list)". Measured at HEAD, two files under that directory survive the sweep and are imported by **no** test module at all — they are wired through the jest configuration instead: `pdlc/workflows/package.json:37` sets `"globalSetup": "<rootDir>/__tests__/helpers/skipSinkSetup.js"` and `:38` sets `"globalTeardown": "<rootDir>/__tests__/helpers/skipSinkTeardown.js"`. Grepping the suite confirms it: `skipSinkSetup.js` has zero importers among `__tests__/*.test.js` today, and `skipSinkTeardown.js`'s only importer is `driftHelpers.test.js`, which is an M-8 member the sweep deletes (`FSPEC-pdlc-plugin-retirement.md:371` lists `driftHelpers` in M-8). Neither file is proposed for deletion anywhere in §2.6 — they must survive, since the suite's skip-sink transport depends on them. The stated grep is also scoped to "the surviving `__tests__` tree", which cannot see `package.json` one directory up, so the re-derivation as specified will not find the two references even if an implementer looks for them. The product consequence is that TSPEC's own remedy for the gap erratum 8 names — a helper deleted with no upstream row owning it and AC-1.3 blind to it — does not hold: an implementer coding the sentence literally gets a red on two files the sweep is required to keep, and the predictable repair is to weaken the universal (to a curated list, or to "helpers that are imported"), which silently reopens the orphan hole. Fix: state the universal over both wiring channels — every surviving file under `helpers/` is imported by at least one surviving module **or referenced by the jest configuration in `pdlc/workflows/package.json`** — and widen the re-derivation to grep the surviving `__tests__` tree *plus* `package.json`, so the assertion stays set-derived rather than becoming a transcribed exception list. | REQ AC-1.3; TSPEC §6.1 erratum 8 |
| F-02 | Low | Local | **§5.5 claims the new assertion makes the deletion direction checkable; the assertion as specified only covers the survival direction.** The closing sentence says this is "what makes '`driftOrdering.js` is deleted because it ends consumer-less' and '`driftCapabilities.js` / `skipSink.js` survive because they do not' checkable rather than prose". Only the second half follows. A universal quantified over files that exist *after* the sweep says nothing about `driftOrdering.js`, which by then is gone — no post-sweep predicate can distinguish "correctly deleted because consumer-less" from "deleted by mistake". The survival half does hold and is verifiable at HEAD: `driftCapabilities.js` keeps `documentOracles.test.js`, `queueDriftGate.test.js` and `skipSinkTransport.test.js`; `skipSink.js` keeps `skipSinkTransport.test.js`; `driftOrdering.js`'s importers are `bootstrap.test.js` and ten `drift*.test.js` modules, all of which the sweep deletes. The deletion rationale is therefore a *pre-sweep* measurement, not something the post-sweep oracle can re-check — which is fine, but the sentence should say so rather than claim coverage the assertion does not give. This matters only for how the next reader sizes the erratum-8 remedy, hence Low. | REQ AC-1.3; TSPEC §2.6, §6.1 erratum 8 |

FINDING: High | delta | local | §5.5 orphan-freedom paragraph | universal "every file under `helpers/` is imported by at least one surviving module" is false post-sweep for `skipSinkSetup.js` and `skipSinkTeardown.js`, both jest-config-wired (`pdlc/workflows/package.json:37`–`:38`) and both required to survive; the specified grep scope (surviving `__tests__` tree) cannot see the references either, so erratum 8's remedy reds or gets weakened
FINDING: Low | delta | local | §5.5 closing sentence | claims the post-sweep universal makes "`driftOrdering.js` is deleted because it ends consumer-less" checkable; a universal over post-sweep survivors cannot check a pre-sweep deletion rationale

## Questions

## Positive Observations

## Recommendation

## Verdict
