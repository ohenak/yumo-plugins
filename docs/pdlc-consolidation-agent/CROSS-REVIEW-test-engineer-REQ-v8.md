# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 8
**Scope:** Local (Scope tags per finding below)
**Delta base:** `5c00a31` (the tree v7 reviewed) → HEAD `980fde0`

Delta re-review. v7's findings F-42…F-44 are dispositioned in §Prior findings; new findings are
numbered F-45 onward so ids never collide across rounds. Only the nine commits that touched the REQ
since `5c00a31` were read for new issues; unchanged sections approved in v1–v7 were not revisited.

## Prior findings

All three v7 findings are dispositioned below. Each was checked against the code or the measurement
the revision cites, not against its prose.

| v7 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-42 | Low | **Resolved, on the stronger of the two options** | AC-5.1 narrows the keying input rather than downgrading the claim: `artifact` is now "**exactly one canonical repository path, never a glob and never a directory**: the single file the edit touches, path-normalised (repository-root-relative, no `./`, no symlink alias)" (`:369-370`). The justifying paragraph is rewritten to argue the direction I said it did not cover — "The glob form is forbidden for the same reason in the other direction: passes free to name `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/*.js` or `pdlc/workflows/` for one mode would slug three ways and NFR-4 would miss. One canonical path closes the **split** direction as `phase` closes the **merge** direction" (`:377-379`), which is my finding's text taken as the argument rather than paraphrased around. The overclaim at the old `:371-372` is now earned: with the input normalised, "a later pass re-deriving the same failure mode yields the same id" is a property a test can falsify by feeding two passes different spellings of one path and asserting one id. The accepted residual (two modes in one phase touching one file merge) is stated *and* given a deferral row, D-CONS-08 (`:683`), so the cost is tracked rather than absorbed. |
| F-43 | Low | **Resolved** | AC-3.4 replaces "written back into" with the append-shaped reading and names which one: the URL "is **not** an in-place edit of an earlier record — that shape is forbidden (AC-1.3): it is the `pr:` field of the pass's single terminal row, appended once (AC-7.2). 'Exactly one report' there counts reports, and the log gains exactly one row per pass on this path" (`:355-357`). Both halves of the ambiguity are closed — the record count is decidable (one) and AC-7.2's counting unit is stated. AC-7.2 was tightened in the same revision beyond what I asked: the `pr:` field is now a scoped biconditional ("the URL of a PR **this pass opened**, when and only when this pass opened one", `:507-509`) with the all-suppressed `no-op` case routed to a distinct `suppressed-by:` field, and §4b gained a row for each (`:605-606`). That makes a fixture that suppresses one duplicate and opens no PR assertable on both fields instead of on one overloaded one. |
| F-44 | Low/Process | **Regressed — the ceiling is now breached; refiled as F-46 at Medium** | The margin I recorded at v7 (37 lines / 69 bytes) was spent and overspent. At HEAD the REQ is **683 lines / 65,492 bytes** against `LINE_LIMIT=700` / `BYTE_LIMIT=61440` (`pdlc/hooks/scripts/check-req-size.sh:41-42`) — 4,052 bytes **over** the hard ceiling, not near it. This is no longer the trend finding I carried for two rounds as `Process` signal; it is a measurable violation of a shipped, mechanical limit, so it is refiled at Medium in §Findings rather than renewed at Low. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
