# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (v1.12)
**Date:** 2026-08-20
**Iteration:** 2

## Delta Basis

Delta re-review against `5f2a88e7` (the commit at which v1 was written; REQ at v1.11). `git diff`
over `REQ-pdlc-advisory-wave-gate.md` reports **28 insertions, 17 deletions across 7 hunks** — the
frontmatter `ready` flag, the v1.12 changelog block, two baseline-version citations (v1.1 → v1.2),
§1's drift paragraph, AC-1.2's anchor, AC-2.4's zero-budget conjunct, AC-3.5, AC-4.1 and O-4. Only
those sections were scanned; sections unchanged since v1 were approved there and are not
re-litigated.

Every existing-behaviour claim inside the changed sections was re-measured at the working tree, not
read out of the document:

| Delta claim | Site verified | Result |
|---|---|---|
| Frontmatter `ready: true`; PR #66 merged at `bb4d36fb`; QUEUE row 19 `done` | `gh pr view 66` (`state: MERGED`, `mergeCommit.oid` `bb4d36fb50d4…`); QUEUE row `\| 19 \| done \| pdlc-advisory-wave-gate \|` | Holds on all three |
| Baseline cited at v1.2 (two sites) | `docs/_constraints/pdlc-wave-gate-baseline.md`'s `Version` field reads `1.2 · 2026-08-20` | Holds; the version-pinned-citation rule that file states is satisfied |
| §1 — `build-runtime.mjs --check` reports the tracked artifact in-sync, exit `0` | `node pdlc/workflows/build-runtime.mjs --check` prints `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`, exit `0` | Holds exactly, including the exit code |
| §1 — the gitignored consumer copy under `.claude/workflows/` differs from it | `.gitignore:40` carries `/.claude/workflows/`; `cmp` of `.claude/workflows/pdlc-cli.mjs` against `pdlc/workflows/dist/pdlc-cli.mjs` reports a difference, and the two `*.bundle.js` files there have no `dist/` counterpart at all | Holds, and is the *weaker* claim — v1.11's "three rows stale and one missing" is correctly withdrawn |
| AC-1.2 — post-wave runs once; failure halts immediately (symbol anchor) | `runWaveGateSequence`'s single `runCommandFn(implConfig.postWaveCommand)` call and its `return { failed: "post-wave", … }`; the wave loop's `throw haltError` naming `implConfig.postWaveCommand` | Holds, and the anchor now resolves — F-02 closed |
| AC-2.4 — `waveBudgetPerRun` admits any integer ≥ 0 | the advisory validator binds `waveBudgetPerRun: nonNegativeInt("waveBudgetPerRun")`, sibling to `positiveInt`; `advisoryConfig.test.js`'s PROP-CFG-02 pins `0` surviving as configured and not reported invalid | Holds |
| AC-2.4 — at `0` with the tier on, every red wave escalates with no dispatch | the wave-budget escape returns `{ __preDispatch: { outcome: "escalated", reason: "budget-exhausted" } }` when `waveBudget.resolved >= advisoryConfig.waveBudgetPerRun`, and the driver's `__preDispatch` branch terminates with no agent call; `advisoryWaveGate.test.js`'s PROP-CTR-13 asserts `agent.calls` is empty | Holds |
| AC-2.4 — under `advisory.enabled: false` there is no advisory section | the report builds `advisory: advisoryTierOn ? advisorySummaryRows(…) : undefined` on both the success and halt paths, and the tier-disabled A6 return carries `disposition: null` so nothing is pushed | Holds |
| AC-2.4 — at `0` the per-seam A6 row "reads zero" | `advisorySummaryRows` counts `forSeam.length` as `invocations`, and the budget-exhausted disposition carries `seam: "A6"` and is pushed by the wave loop's `if (a6.disposition) advisoryDispositions.push(a6.disposition)` | **Does not hold** — see F-01 |
| C-5 — REQ inside the size budget | 647 lines / 52,156 bytes against `check-req-size.sh`'s `LINE_LIMIT=700` / `BYTE_LIMIT=61440` | Holds, with 53 lines of headroom |

## Prior-Finding Disposition

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
