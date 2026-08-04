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

| ID | Question |
|----|---------|
| Q-01 | §6.4.1's Reachability paragraph says "Queue-side unit tests inject a `_commitPaths` double rather than relying on the free identifier (§13.3)", but §13.3's table names the class generically ("queue-side free identifiers — `_runAdvisorySeam` etc."). I read `_commitPaths` as covered by that row and filed no finding; confirm that reading is intended rather than a missing table row. |

## Positive Observations

- **E-5 is the edit that mattered most for testability.** A commit-pinned-but-scenario-unpinned fixture is exactly the shape that goes false-red under harmless drift and vacuously green under a narrowed scenario — the classic unfalsifiable-oracle failure mode. The fix does the right thing twice over: it makes the two runs comparable *by construction* (same `reqPath`, `forcePhases`, `agentDoubles`, `config`) rather than by assertion, and it gives the staleness condition its own distinct failure mode instead of letting it masquerade as a created-file diff. A reader of a red build now learns which of the two things broke.
- **E-2 was fixed at the mechanism level, not the wording level.** The document could have satisfied the erratum by naming a different mechanism; instead it exported the one symbol actually needed, said so in both §2.3 and §6.4.1, and explicitly reasoned about why `gitWithLockRetry` does *not* need exporting. That reasoning is checkable and correct — `commitPaths` closes over it in the same module scope, which survives `stripModuleSyntax`.
- **E-1's correction is narrower than the erratum demanded, and correctly so.** The `runtimeBundle.test.js` half of the claim was true and was kept; only the manifest half was dropped, with the per-artifact rule and its line cite stated positively so a future reader cannot re-introduce the error.
- **E-3/E-4 removed a real test hazard, not just a mis-attribution.** "Deliberate deviation from C-2" would have produced tests pinned to a deviation that does not exist, i.e. tests asserting divergence from FSPEC. Restating it as conformance means the tests now pin `FSPEC:145` itself, which is the durable oracle.
- The §18 changelog enumerates all five edits with their cites, so the next reviewer can verify this round without re-deriving the diff.

## Recommendation

**Approved**

The delta resolves every erratum item routed to this document, each cite lands on the code or FSPEC line it names, and nothing previously approved is weakened. F-01 is a Low documentation-placement note that does not gate implementation.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:1bfae603bb947d36fc8bda73a5d94e310643413075bdf59ad06885c1bbe260a0
REVIEWED-COMMIT: b198f1aa8b5a08b6e4eae6adcbe8bd749da7b2ae
