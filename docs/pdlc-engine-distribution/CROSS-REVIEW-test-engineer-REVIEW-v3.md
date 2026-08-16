# Cross-Review: test-engineer — Codebase Review (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/` and the implementation on `feat-pdlc-engine-distribution` (delta `ef881565..659f8ed2`)
**Date:** 2026-08-16
**Iteration:** 3
**Scope:** Local

## Method

Delta re-review. The scope is the 12 commits in `ef881565..659f8ed2`; nothing already
settled in rounds 1–2 is re-litigated. Every claim below is an observation made at
`659f8ed2`, not a reading of a document.

1. **Suite execution.** `cd pdlc/engine && npm test` → `1..747`, `# pass 806`, `# fail 0`,
   `# skipped 2` (the two `PDLC_LIVE=1`-gated legs, pre-existing). `cd pdlc/workflows &&
   npm test` → 4516 passed, 1 failed, 70 skipped (the same `documentOracles.test.js:246`
   red over untracked local trees, unchanged — F-06 below).
2. **Mutation probes, each run twice and each read by the name of the test that
   caught it.** Five probes for the five fixes this round claims, plus three probes
   against `bin/pdlc.mjs`'s Node-floor guard. Results are tabulated below and in F-02.
   `git status --porcelain` over `pdlc/engine` was clean before and after every probe.
3. **Repeat-run flake experiment.** Five consecutive `npm test` runs on an unmodified
   tree, which is how F-01 was found: run 5 was red with no code change.
4. **Coverage re-measurement.** `npm test -- --experimental-test-coverage`, per-module
   branch column, against `PROP-REGR-6`'s eight-module enumeration
   (`PROPERTIES-pdlc-engine-distribution.md:242`).

## Round-2 findings: disposition

| Round-2 | Severity | Status | Evidence (mutation → the test that caught it) |
|---|---|---|---|
| F-01 the production entry's `launch()` call pinned by nothing | High | **Resolved**, mutation-proven | `bin/pdlc.mjs:42` → `mod.main()` reddens twice out of two: `not ok 150 - AC-5.5: the real bin/pdlc.mjs refuses a pinned-but-uninstalled version — the launcher, not main()` (`cli.test.js:250`). The leg spawns the real binary, and it is hermetic by construction — the pin-missing arm refuses before any `exec`, `PDLC_HOME` is an empty temp store, and `PDLC_RESOLVED_ENGINE: ""` is correctly neutral because `readResolvedMarker` (`bin/cli.mjs:218`) tests `!raw`, not presence |
| F-02 `redactSecret` proven as a function, unproven as a control | Medium | **Resolved**, mutation-proven | Bare `` `::error::${message}` `` at `publish-preflight.mjs:349` reddens twice: `not ok 444 - T58: reportFailure redacts the live token at the PRODUCTION call site`. The injected default is pinned too: `env = process.env` → `env = {}` also reddens, so the seam did not become the thing that is tested |
| F-03 PF-4's oracle derived its expectation from the code under test | Medium | **Resolved**, mutation-proven | Dropping `"scripts/postinstall.mjs"` from `expectedPackedSet` (`publish-preflight.mjs:240`) reddens twice: `not ok 439 - PF-4: checkPackedSet's expectation IS TSPEC §5.4's PK-* set, member for member`. The transcription at `publish-channel.test.js:687-716` matches §5.4's `PK-1…PK-23` rows (TSPEC:347-359) member for member, including PK-3's conditionality and PK-4b |
| F-04 fixture-machine functions half-unreached | Medium | Carried, unchanged | 57.71 % line / 88.57 % branch / **40.74 % funcs** at HEAD — identical to round 2. Still a decision to record, not a defect to fix; see F-05 below and Q-01 |
| F-05 T49's two parsers scanned wider than the contract | Low | **Resolved**, mutation-proven | Both parsers are now region-scoped (`publish-channel.test.js:281-330`), and the discriminating power survived the narrowing: renaming `case "verify-packed":` reddens twice, `not ok 425 - T49: the subcommand tokens publish.yml invokes are set-equal to the cases main() implements` |
| F-06 `pdlc/workflows` not locally green | Low | Carried, unchanged | Same single red, same untracked-tree cause. Not this feature's code |
| PM F-01/F-02 empty-store arm announced as a refusal | (PM) | Resolved, mutation-proven | Reverting the `store.empty-in-place` selection at `bin/cli.mjs:316-325` reddens twice: `not ok 313 - PM F-02: the resolution hop is on the path pdlc dev takes`. The two new legs assert the arm by count (`runMain` 1, `exec` 0), the marker's `mode: "unresolved"`, the announcement's three positives and the refusal wording's absence — a negative correctly paired |

All five findings the round set out to close are closed, and every one of them is closed
by a named oracle that dies when the fix is reverted. That is the strongest disposition
table this feature has produced. The two Highs below were not raised in round 2; both
were found by measurement this round, and one of them is what makes the table above
harder to trust than it should be.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
