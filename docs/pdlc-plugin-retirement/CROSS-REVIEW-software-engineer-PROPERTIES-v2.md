# Cross-Review: software-engineer — PROPERTIES (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-plugin-retirement/PROPERTIES-pdlc-plugin-retirement.md (v0.2)
**Date:** 2026-08-18
**Iteration:** 2

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|

None. This is a delta re-review against commit `094ad7f5` (`docs(pdlc-plugin-retirement): PROPERTIES v0.2 — round-1 findings: exhaustive carrier-cell audit, §7 recount`). All three round-1 findings are verified resolved by re-checking the underlying facts, not just re-reading prose:

- **F-01 (High — PROP-COMMIT carrier cells vs. PLAN §3).** PROP-COMMIT-2, -3, -5 now carry `T01/T13 → preflight-baseline.test.js` (`PROPERTIES-pdlc-plugin-retirement.md:255-258`); PROP-COMMIT-4 now carries `T11/T12 → hookCompatibility.test.js` (`:257`); PROP-COMMIT-6 now carries `T13 → preflight-baseline.test.js` (`:259`). Verified each cell against PLAN §3's ownership manifest directly: T01 owns `preflight-baseline.test.js` (`PLAN-pdlc-plugin-retirement.md:223`), T13 owns the same file (`PLAN-pdlc-plugin-retirement.md:235`), and T11/T12 own `hookCompatibility.test.js` (`PLAN-pdlc-plugin-retirement.md:232-234`). All six carrier cells now resolve to a task that actually owns the named file. Resolved.
- **F-02 (High — §7 test-level table arithmetic).** Re-derived the level breakdown by parsing every `PROP-` row's Level column in §2 (lines 84-260) directly from the file rather than trusting the printed table: 49 rows read `Unit` under naive pipe-splitting, plus one row (PROP-HOOK-1, `:154`) whose Property cell contains an escaped `\|` that defeats naive column splitting but whose Level cell is confirmed `Unit` on inspection — giving 50 Unit. 16 Integration and 8 Manual matched on direct count, and PROP-BUILD-5 is the one `Manual + Unit` row. 50 + 16 + 8 + 1 = 75, and `grep -c "^| PROP-"` over §2's line range independently confirms 75 property rows. §7 (`:376-381`) now states exactly these figures. Resolved.
- **F-03 (Medium — PROP-BUILD-5 "Manual + Unit" vs. Rule 5).** §1 Rule 5 (`:50-58`) now explicitly names PROP-BUILD-5 as the sole documented `Manual + Unit` exception, explains the split (Unit-tested build-parity conjunct + Manual field-comparison conjunct), and states a second occurrence would need its own documented exception rather than a silent copy. PROP-BUILD-5's row (`:182`) carries `T17/T19 → consolidationBuild.test.js; T33 [manual] → OPERATOR-OBSERVATIONS-*.md`, consistent with the rule's description. Resolved.

The changelog (`:19`) also records an additional PROP-CLEAN-6 carrier-cell fix (`helpers/driftCapabilities.js` attributed to T16, not T07/T30) found during the mechanical audit the round-1 review prompted; spot-verified against PLAN T16's ownership row (`PLAN-pdlc-plugin-retirement.md:146, 238`) — correct. §4's AT-1.8 task list was updated to `T01, T13` (`:299`) to stay consistent with the PROP-COMMIT carrier fix — correct.

No new issues surfaced in the changed sections (§0 changelog, §1 Rule 5, §2.12 PROP-COMMIT rows, §2.4 PROP-HOOK/PROP-CLEAN-6 carrier cell, §4 AT-1.8, §7).

## Questions

None.

## Observations

Re-verification was done by cross-checking PLAN §3's ownership manifest and by independently re-deriving the §7 count from the raw property table rather than re-reading the document's own summary — both now agree with the printed claims.

## Recommendation

**Approved**

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:1ac369f6cbdb43d74e2a07ec25178f330568c1b854efc0b8bbd1f04385f38725
APPROVAL-HASH-NORMALIZED: sha256:1ac369f6cbdb43d74e2a07ec25178f330568c1b854efc0b8bbd1f04385f38725
REVIEWED-COMMIT: 094ad7f5e2ecc4bc8972347b7b7197048e1d5eb7
UPSTREAM-STATE: REQ sha256:94daa2de05511e08c305a4fb73a046965dd3b31c37e2be42a466dda357f6f38c
UPSTREAM-STATE: FSPEC sha256:5cd899dac04a05b6d7b002a0f0056d7fd5508525cb1399d1dc1f069347e1de23
UPSTREAM-STATE: TSPEC sha256:1554c7d0349ef5d4337c4e5e705bc0c4b867bd3cb46b5191f315d560b87c23b8
UPSTREAM-STATE: DECISIONS sha256:579292fe88bbb0b3860ab609b228a9d5d3e7db20b8158b158e0b5de48a4a35bd
UPSTREAM-STATE: PLAN sha256:266eb457bbc2895b0b05122d7bab9564648d0258fb0f452332f958f14987a983
