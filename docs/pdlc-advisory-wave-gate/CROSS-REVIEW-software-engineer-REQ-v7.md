# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (header v1.8)
**Date:** 2026-08-19
**Iteration:** 7

**Scope:** Delta re-review against v6 (`REVIEWED-COMMIT: 2e262298`), decision freeze. Changed
sections only, plus verification of every changed claim against the repository at HEAD.

## Delta under review

`2e262298` is **not an ancestor of HEAD** — `git merge-base --is-ancestor 2e262298 HEAD` returns
false. The branch was rebased onto `origin/main` (`ddf6c2fe restore QUEUE.md and wave ledger to
origin/main versions after rebase`), so the v6 approval anchor points at a commit no longer on the
branch. The tree-to-tree diff `2e262298..HEAD` on the REQ is **4 insertions, 22 deletions**, and
every one of them is a *reversal of previously approved round-3 content*, not a forward edit:

| Site | v6-approved bytes | HEAD bytes |
|---|---|---|
| Header, Upstream (`:8`) | `docs/completed/pdlc-advisory-tier/REQ-…` | `docs/pdlc-advisory-tier/REQ-…` |
| §1, M-WG-6 row (`:99`) | corrected wording ("no phase-level skip") | pre-correction unconditional wording |
| §1 (`:141` ff.) | 12-line 2026-08-11 `iv-snapshot-store-postgres` incident | deleted |
| §5, C-2 (`:212`, `:214`) | default `1`, Q-1 decided, `2` superseded | default `2`, "a proposal, not confirmed" |
| §9, O-7 (`:529` ff.) | O-7 present, owner `pdlc-engineering-loop` | deleted |

The v1.8 and v1.7 changelogs still describe the round-3/round-4 state, and the four round-4 items I
confirmed in v6 (AC-1.5 population, per-attempt `seamBudgetMinutes`, AC-4.1 conjuncts, R-3 wording)
survive intact — I re-checked each and none regressed. So this is rebase content-loss, not an
authoring decision. Under the freeze rules the losses below block under criterion (ii): a
load-bearing claim in the document is false at HEAD or contradicts another site in the document.
