# Cross-Review: test-engineer — TSPEC (delta confirmation, erratum round)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md (v1.1)
**Date:** 2026-08-03
**Iteration:** 5
**Scope:** Delta confirmation only — the Phase-D erratum edit (`e067f5e..HEAD`, commits `5105ff5`, `9d9ae61`, `5042d5c`, `f38ad2e`, `b198f1a`). Sections untouched by that diff were approved at v4 and are not re-litigated.

## Erratum items — disposition

Each row was checked against the cited code/FSPEC line at HEAD, not against the TSPEC's own account of it.

| # | Erratum item (raiser) | Disposition | Evidence |
|---|---|---|---|
| E-1 | §2.2/§16.1 claim a fourth build source changes what `distribution-manifest.json` is written against (pm-review, te-review, se-author) | **Resolved** | Both sites now scope the claim to `runtimeBundle.test.js` and state explicitly that manifest rows are per *artifact* from the three-entry `bundles` array, so a fourth source inlined into the same artifacts adds no row and moves only `pluginSha1`. Verified: `pdlc/workflows/build-runtime.mjs:277` `const bundles = [` with exactly three entries (`orchestrate-queue.bundle.js`, `orchestrate-dev.bundle.js`, `pdlc-cli.mjs`) through `:296`. The cite is accurate. |
| E-2 | §6.4.1's A2 `verifyGate` reuses `commitPaths`, which is module-private and absent from §2.3's export list and queue prelude (pm-review, te-review, se-author) | **Resolved** | §2.3 adds `"commitPaths"` to the dev export array and `const commitPaths = __dev.commitPaths;` to the queue prelude, plus a paragraph stating `orchestrate-dev.js` gains one `export` keyword on it and that `gitWithLockRetry` stays private (reached through shared module scope inside the bundle). §6.4.1 gains a matching **Reachability** paragraph. Verified at HEAD: `orchestrate-dev.js:6905` `async function commitPaths(` and `:6862` `async function gitWithLockRetry(` — neither carries `export`, so the erratum was correct and the fix is the minimum one. The addition is additive to the dev export array only (not `CLI_DEV_EXPORTS`), which is the array the queue prelude reads from. |
| E-3 | §11.3's "§3.2's deliberate C-2 deviation" is stale; §3.2 conforms to C-2 (te-review, se-author, pm-review) | **Resolved** | §3.2's heading text is now "Where C-2's reporting half applies — conformance, not deviation", quoting `FSPEC-pdlc-advisory-tier.md:145` verbatim; §11.3's `enabled`-malformed row now reads "§3.2's emit gate — C-2's own report-only-when-enabled clause (`FSPEC:145`)". Verified: FSPEC C-2 at `:145` does contain "**only when the resolved configuration leaves the tier enabled**" and the disabled-run carve-out. No "deviation" wording survives anywhere in the TSPEC. |
| E-4 | §16.4 raises two FSPEC defects that FSPEC v1.3 already settled (pm-review) | **Resolved** | §16.4 is retitled "Two settled FSPEC rules, and the TSPEC mechanism that expresses each", states plainly that neither is an upstream defect and that **no erratum is outstanding against FSPEC from this document**, and restates each as a settled rule + a TSPEC-side mechanism choice. §4.4, §6.4.1's subheading and §16.3 were restated in step. Verified: `FSPEC:232-237` does state that at both A2 and A5 "steps 5 and 7 complete **before** that durable git operation", `FSPEC:635` (A5-8) and `FSPEC:690` (R-2) corroborate. All three cites land. |
| E-5 | §11.2 pins the D-6 fixture to commit `26c3f1c` but not to a run scenario (te-review, se-author) | **Resolved — and this is the strongest edit in the round** | §11.2 gains an eight-field `scenario` object (`baselineCommit`, `reqPath`, `forcePhases`, `agentDoubles`, `config`, `phasesReached`, `seamsInstrumented`, `command`/`date`) that the test **re-asserts before comparing**, with a mismatch failing as a *fixture-staleness* failure distinct from a created-file diff, and states the disabled run is constructed from the same `reqPath`/`forcePhases`/`agentDoubles`/`config`. See F-01 for the testing note this raises. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | §11.2's new `scenario` re-assertion is a second, independently-falsifiable oracle on the D-6 test (fixture staleness vs. created-file diff), but §13.4's five suite obligations still describe only obligation 4, "the disabled-run created-file set is transcribed as a literal … never re-derived". Adding "…and the scenario object is asserted field-by-field before the set comparison, failing distinctly" to that row would keep §13.4 the single place an implementer reads for the D-6 suite shape. Not blocking: §11.2 already states the obligation in a form an implementer can execute. | §11.2, §13.4 obligation 4 |

Nothing previously approved is broken by this delta. Specifically re-checked, because the edit touched them: §3.2's emit-gate code block and its `invalidKeys` contract are unchanged (only the surrounding rationale was restated), §4.4/§6.4.1's `apply`/`verifyGate` split and step order are unchanged (only the justification moved from "resolves an FSPEC gap" to "expresses a settled FSPEC rule"), §11.3's five-row table keeps all five rows with unchanged behaviour cells, and §16.1/§16.3's rejections stand with the same conclusions. The only behavioural additions in the round are the `commitPaths` export (E-2) and the fixture `scenario` object (E-5) — both strictly additive.

## Questions

## Positive Observations

## Recommendation

## Verdict
