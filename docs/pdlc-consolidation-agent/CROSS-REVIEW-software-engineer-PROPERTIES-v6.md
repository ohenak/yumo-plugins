# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.5)
**Date:** 2026-08-10
**Iteration:** 6
**Scope:** Delta re-review. Diffed `9a95324f..HEAD` (commit `01841250`, the only change to the
document since v1.4), re-read my own v5 cross-review first, and judged (a) whether F-01 is resolved
and (b) whether the revision broke anything it touched or anything downstream of it. Unchanged
sections are not re-litigated except where the delta's own claims now bear on them. Every upstream
citation the new text leans on was re-measured at HEAD.

## 1. F-01 disposition

**Resolved, and resolved at the right layer.** v5's High asked for one thing — the second fixture
TSPEC §12.2 specifies for the case `PROP-COR-09` already owns — plus two bookkeeping edits. All three
landed, and nothing else moved.

| v5 ask | Disposition at HEAD | Evidence |
|---|---|---|
| Add the all-unreadable fixture: status exactly `no-op`, pair empty, `\|un-consolidated\|` = 2, both basenames named | **Done, verbatim against the authority** | `PROPERTIES:418-425` carries all four observables and the "not `failed` … not `refused`" exclusion, transcribing `TSPEC:2850` rather than paraphrasing it |
| Carry §12.2's mutual-control sentence | **Done** | `:423-425` — the all-unreadable fixture keeps *"pair empty"* from passing on a pass that enumerated nothing, the mixed fixture keeps the status assertion from passing on an implementation that terminates every unreadable-touching pass `failed`. Both directions stated, matching `TSPEC:2850` |
| Widen the title past "entry" | **Done** | `:406-407` — *"An unreadable corpus entry — up to and including the **whole corpus** — is omitted …"* |
| §12.1's AC-1.4 row gains `PROP-COR-09` | **Done** | `:1668` names it *"the **third** cause — the all-unreadable corpus, and the only property asserting it"* |
| Trailer gains `AC-1.4` | **Done** | `:428-429` — `AC-1.1, AC-1.4, REQ §4b · (no FSPEC AT), TSPEC §12.2` |
| Answer Q-01 (deferred or missed?) | **Answered honestly** | changelog `:16-22` says **missed**, and gives the mechanism: the routed item list was cut against REQ v2.1 while the wave grew REQ v2.5's second arm afterwards. `POSTMORTEM-T` Episode 2's own commit-order table corroborates the timing independently (TSPEC v2.6 at 15:56–15:59, PROPERTIES erratum at 16:12) |

Three things I checked specifically, because a "just add the fixture" round is an easy place to
over-reach or to leave the surrounding text behind:

- **No collateral movement.** Distinct `PROP-*` ids at HEAD = **118**; symmetric difference against
  the v1.4 blob (`9a95324f`) is **empty**. No property added, removed, renumbered or re-homed, and
  the new fixture claims no register id — consistent with `TSPEC:2923`, which says both fixtures live
  in the one case and claim **no** register id, so `consolidationPass.test.js`'s assignment set and
  the set equality over it are undisturbed.
- **No new task, no re-homing.** The trailer still reads `L2 · consolidationPass.test.js · T20 →
  T31`. `PLAN:365` (T20, the RED block for `consolidationPass.test.js`) and `PLAN:388` (T31, the
  driver that greens it) both exist and both name that file (`PLAN:424`, `PLAN:435`), so the second
  fixture lands inside an already-planned case rather than implying an unplanned one.
- **Oracle quality of the added text.** The new fixture is not an absence-only oracle: *"pair empty"*
  travels with three positive assertions on the same path (status exactly `no-op`,
  `\|un-consolidated\|` = **2**, both basenames named as unread), and §12.2's mutual-control sentence
  is what stops each from passing vacuously. Expected values are literal transcriptions from spec
  (`no-op`, `2`), not derived from anything under test.

## 2. Independent re-measurement

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
