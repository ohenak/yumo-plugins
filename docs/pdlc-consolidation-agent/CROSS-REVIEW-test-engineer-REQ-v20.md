# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md` (v2.4)
**Date:** 2026-08-10
**Iteration:** 20
**Scope:** Local (per-finding below)
**Delta base:** `c93f5032` (the tree I reviewed at v19) → HEAD

This is a delta re-review of the v2.4 round. The revision answers v19's F-64 and se's
F-01…F-04 and Q-01. The delta question is the usual pair: **did the claimed moves actually
land, and did the revision break anything previously approved?** Every anchor the delta
touches was re-measured at HEAD.

## What changed

Five commits (`546a7ee2`…`b2156952`), one document, 21 insertions / 14 deletions. Version
moves `2.3 · 2026-08-10` → `2.4 · 2026-08-10`. Three substantive edits:

1. **The anchor-epoch preamble gains a re-measurement cadence** (`:22-26`): "the role name is
   the durable locator; the number is the convenience… anchors are re-measured at review
   rounds, not on every commit, so a number that has shifted is a defect only where the named
   role no longer resolves." This is the answer to se Q-01 and it is the right shape — it
   converts an unbounded editorial obligation into a decidable one.
2. **The `orchestrate-dev.js` guard family and `build-runtime.mjs` are re-anchored with roles
   named** (`:307-311`, `:333`, `:401`) — the exact gap v19's F-64 named.
3. **§4b names a terminal status and a reason code for an all-unreadable corpus** (`:624-627`),
   and AC-1.4 carries it as a third cause (`:223-232`), with AC-5.3 (`:454`) and AC-5.5
   (`:479`) updated from "first cause" to "first or third cause".

I re-measured every anchor the delta moved. All eleven resolve, and each lands on the line
its named role claims:

| REQ claim (v2.4) | HEAD state | Correct |
|---|---|---|
| `effectiveGuardPaths` "the guard-path resolver" `:936` | `:936` `export function effectiveGuardPaths(configured)` | yes |
| `guardVerdict` `:959` | `:959` `export function guardVerdict(changed, guardPaths)` | yes |
| Phase MERGE's ladder, "`decideMerge`'s resolver/verdict call pair", `:1126-1127` | `:1126` `effectiveGuardPaths(config.guardPaths)`, `:1127` `guardVerdict(record.o5, …)` — adjacent, exactly a pair | yes |
| advisory-envelope check `:2370` | `:2370` `guardVerdict({ ok: true, files: paths }, …)` | yes |
| `mergeMode` default `:61` | `:61` `mergeMode: "off"` | yes |
| `decideMerge`'s guard-1 refusal `:1065`, reason string `:1070` | `:1065` `config.mergeMode === "off"`, `:1070` `reason: "mergeMode off"` | yes |
| the phase's early return `:1659` | `:1659` `if (config.mergeMode === "off") return skippedOutcome(2, "mergeMode off", …)` | yes |
| `gitWithLockRetry` "the lock-retry wrapper" `:9424` | `:9424` `export async function gitWithLockRetry(argv, { … })` | yes |
| `build-runtime.mjs` fourth artifact row, `pdlc-cli.mjs`, `:564-567` | `:564` `file: "pdlc-cli.mjs"`, `:567` `id: "pdlc-cli"` | yes |

I also re-derived the reachability claim rather than trusting it: `grep -n "guardVerdict("`
returns the declaration plus exactly two call sites (`:1127`, `:2370`), both about that run's
own PR. `effectiveGuardPaths` has a third caller at `:3443` (`guardPaths:
effectiveGuardPaths(undefined)`), which seeds the advisory context the `:2370` check reads —
it does not open a route to an inbound PR, so the sentence's "reachable only from" stays true
as written (it is scoped to `guardVerdict` over `effectiveGuardPaths`, not to the resolver
alone).

v19's F-64 is **resolved**, in full and in the manner F-64 asked for: coordinates fixed *and*
roles named, so the next round can re-find them without a grep.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
