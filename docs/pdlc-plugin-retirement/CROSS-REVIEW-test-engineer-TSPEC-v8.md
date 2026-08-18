# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.8)
**Date:** 2026-08-17
**Iteration:** 8
**Scope:** delta re-review. v7's six findings checked for resolution; only `5b9410a4`..HEAD
(`34215001`) scanned for new issues — §2.9's class-3/class-6 rows, §5.5's swept-surface table,
recursion-guard and falsifiability paragraphs, §6.1 erratum 10. Unchanged sections not re-litigated.

## v7 findings disposition

| v7 ID | Disposition | Evidence |
|---|---|---|
| F-01 (High) — domain enumeration contradicted §4.4's own re-home resolutions | **Resolved in the direction I asked, and correctly** | §5.5 now carries an explicit swept-surface table with a stated membership rule (*creates, deletes, reduces in place, or adds assertions to*, plus R-8 re-home hosts). `orchestrateQueue.test.js` is dropped with the right reason: §4.4's L-6 row 1 does resolve to "no re-homed assertion", and its four protected titles are pre-existing assertions discharged by measurement. `consolidationBuild.test.js` is re-justified as *edited* (TT-5) rather than as a re-home host, and §4.4's L-6 row 2 ("host module retained, no move") is now consistent with `hookCompatibility.test.js` being in-surface as a class-6 **reduction**. Erratum 10 routes the widening upstream instead of deciding it silently. The rule is right; F-01 below is that the enumeration under it is not. |
| F-02 (High) — nested run collects the module that spawns it | **Resolved** | §5.5's three-part guard: explicit file list minus the host, an asserted spawn-argument comparison, a `PDLC_SKIP_JOIN_NESTED` sentinel that **throws** rather than skips, and a compensating source-level check over the host's own file. The throw-not-skip choice is the right one and is justified against Q-02 exactly as asked — a skipped child copy would need its own `SKIP_INVENTORY` row for a mechanical guard. `isInsideRunningTest()` really does gate only the two helpers and would not see this (`helpers/driftCapabilities.js:292`, `:315`, `:330`). |
| F-03 (Medium) — falsifying fixture placed where the child cannot collect it | **Resolved** | The child now carries `--testPathIgnorePatterns=/node_modules/`, dropping the `helpers/` and `fixtures/` exclusions for the child only. The claim is checked: `pdlc/workflows/package.json`'s `jest.testPathIgnorePatterns` is exactly `["/node_modules/", "/__tests__/helpers/", "/__tests__/fixtures/"]`, and it is config-level, so it does filter explicitly-passed paths. The outer run's config is untouched. |
| F-04 (Medium) — ten `"bash"` rows contradict `skipSink.js`'s stated derivation rule | **Resolved** | §5.5 now names the `WHAT IS NOT ENFORCED, AND WHY` edit, restates the rule as spec-derived rows **∪ registered gaps a named TSPEC section owns**, keeps the C2-not-closure sentence load-bearing, and files the edit as **class 3** (surviving helper with live consumers) in §2.9's class-3 row. The quoted "spec-derived — exactly TSPEC §1.3's table plus PROPERTIES §11.1's two leaves" and the "spec change, not a test change" sentence are verbatim in `helpers/skipSink.js`'s header today. §2.9's class-6 row now also states the serialisation against `driftCapabilities.js`. |
| F-05 (Low) — `itOrSkip` argument order transcribed backwards | **Resolved** | §5.5 now reads `itOrSkip(<leaf title>, "bash", <invariants>, fn)`, matching the exported signature `itOrSkip(name, capability, unverifiedInvariants, body)` (`helpers/driftCapabilities.js:324`). |
| F-06 (Low) — fixture name could perturb L-5's count literal | **Resolved** | Fixture pinned as `__tests__/fixtures/skipJoinFalsifier.js`, deliberately not `*.test.js`, with the reasoning stated in both readings of AT-1.3's glob. The Jest-default claim is right: no `testMatch` is configured in `pdlc/workflows/package.json`, so the default `**/__tests__/**/*.[jt]s?(x)` collects the fixture in the child regardless of suffix. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
