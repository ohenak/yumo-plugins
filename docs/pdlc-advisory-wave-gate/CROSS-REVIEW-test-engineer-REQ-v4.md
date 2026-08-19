# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-18
**Iteration:** 4
**Scope:** REQ (phase R), testing lens only. Delta re-review against `CROSS-REVIEW-test-engineer-REQ-v3.md`, over `git diff afa55439..HEAD` on the REQ (78 insertions, 67 deletions). Unchanged sections are not re-litigated.

## Delta Verification against v3

Verified at HEAD `6565080a` on `feat-pdlc-advisory-wave-gate`. Every shipped-behaviour claim the revision touched was re-measured in code rather than read from the changelog.

| v3 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | The "BL-03's case has no equivalent today" claim is gone. AC-1.5 now names both shipped notices as the carriers and says the inapplicability is *added to* them, never emitted beside them (`REQ:258-263`). Re-measured: BL-03's carrier is `orchestrate-dev.js:14043-14045`, emitted once at the top of the no-manifest branch; BL-04's is `:14150-14153`, emitted once before the wave loop. The two branches are mutually exclusive (`if (!waveMode) { … } else { … }`, `:14041`/`:14119`), so the surface carries exactly one carrier in every reachable run — the cardinality the AC asserts now holds mechanically instead of by author intent. Residual, non-blocking: F-02 below. |
| F-02 | Medium | **Resolved** | AC-4.4's oracle is now sequence equality, stated as such and with set-equality explicitly rejected by name and by reason ("it collapses the duplicates and admits a resolution declared on one invocation", `REQ:387-390`). The expected values are literal transcriptions — `[post-wave, test, post-wave, test]`, `[post-wave, test, post-wave]`, `[test, test]` — not derived from anything under test. The false green v2 F-01 closed cannot re-enter through this door. |
| F-03 | Medium | **Resolved** | AC-4.4 now says a green re-gate carries the wave **past the gate**, and that a later post-gate halt is neither a red re-gate nor a restore trigger, with AC-5.1's trigger set restated as exactly three members (`REQ:378-381`). That matches the shipped order: gate at `:14361-14368`, un-skip guard at `:14377-14393`, commits only at `:14396`. One consequence landed in AC-4.4 but not in AC-5.3 — F-01 below. |
| F-04 | Medium | **Resolved** | BL-06's obligation is now universally quantified over the drifted recipes rather than enumerating three rows: "every positional line-range recipe in §1–§2, the M-WG-1…M-WG-8 rows and §1's V-wave trailer sentence alike, is drifted until re-run" (`REQ:551-553`), and the row itself carries both enumerations plus the BL-03 notice measurement (`REQ:543`). The under-inclusive enumeration I flagged is no longer expressible as complete-when-it-is-not. Residual on cached grep *results* rather than recipes: F-04 below. |

Also re-measured on the revision's own material, since each is a shipped-behaviour claim the round newly asserts:

- AC-4.2's new conditional — "where a post-wave command ran and post-wave pathspecs are configured" and "otherwise those artifacts are uncommitted too" — reads true at `orchestrate-dev.js:14416`: the build-output commit is guarded by `postWaveRan && implConfig.postWavePathspecs.length > 0`, so an empty pathspec list leaves the artifacts uncommitted exactly as the AC now says.
- AC-4.4's "a post-wave command failing on the re-gate … the immediate halt it would be on the first pass" reads true at `:14347-14357`: a first-pass post-wave failure throws `haltError` before the test command is ever reached, which is also why a truncated *first* pass implies a run with no attempts and therefore no A6.
- AC-4.4's pass arithmetic is consistent with the budgets it cites: `advisory.attemptBudget` `3` per wave and `advisory.waveBudgetPerRun` `1` (`REQ:204`, `:207`), so "passes = 1 + attempts" ranges over a bounded, enumerable set rather than an open one.

## Findings

## Questions

## Positive Observations

## Recommendation

