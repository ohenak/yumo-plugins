# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.9)
**Date:** 2026-08-19
**Iteration:** 10
**Scope:** Delta re-review of the v1.9 erratum round against `CROSS-REVIEW-test-engineer-TSPEC-v9.md`
(reviewed commit `a349767b`), plus grounding of the round's claims on repository HEAD.
Not a full re-review.

## Delta Under Review

`git diff a349767b..HEAD` on the TSPEC is +66/-24 across six commits (`12f506bd`, `0465145e`,
`6f39716d`, `5b06808c`, `a14cdfda`, `3f5a65f9`). Three routed items:

| v9 finding | Edit | Verified at HEAD |
|---|---|---|
| TE v9 F-01 (Medium) — §5.1's stated set-equality with §1.3 false on disk | §5.1 restated as **§5.1 ⊇ §1.3** and gains the missing `advisoryQueueSeams.test.js` row | Direction claim is now the true one; the added row's *content* is stale — see F-01 |
| TE v9 F-03 (Low) — §3.2 step 2's design-intent citation pointed at a comment range not carrying the quoted sentence | Every `orchestrate-dev.js` / `orchestrate-queue.js` pin in §1.3 and §3.2 re-anchored to symbols per DEC-DOC-01 | **Resolved and verified** (below) |
| PM v8 F-01 (Medium) — §4.4's example-teaches-the-affordance overclaim | Withdrawn in all four places; `0` re-homed onto behaviour + AT-07-2b | **Resolved**; FSPEC `:456` does carry AT-07-2b's "`0` in yields `0` back, and the key is absent from the invalid-key report" |

Symbol re-anchoring re-derived at HEAD — all three `.enabled` sites are where the delta says:

- `runAdvisorySeam`'s disabled-tier early return, `orchestrate-dev.js:3262` (`if (!config || config.enabled === false)`)
- the run-level `const advisoryTierOn = advisoryConfigResult.config.enabled;`, `orchestrate-dev.js:13682`
- `orchestrate-queue.js:1265`, inside the `finish` closure (`advisoryConfig.config.enabled ? advisorySummaryRows(advisoryDispositions) : undefined`)

The design-intent comment ("Read once, reused everywhere below … the tier's own master switch is
inspected from source text exactly once here") does sit directly above the `:13682` assignment, so
§3.2 step 2's "the comment sitting directly above that assignment" now cites content, not a range.
The old numeric pins (`:3258`, `:13678`, `:1318`) had indeed drifted, exactly as the changelog says.
PROP-DIS-06's counting oracle at `advisoryDisabled.test.js:634`–`:663` still requires `toHaveLength(3)`
and the three sites above are the only `/\.enabled\b/` matches outside `parseAdvisoryConfig`. The v9
changelog-provenance finding (F-02) is resolved: v1.9 names the **v8** cross-reviews and disposes
PM F-01, TE F-01 and TE F-02 by name.
