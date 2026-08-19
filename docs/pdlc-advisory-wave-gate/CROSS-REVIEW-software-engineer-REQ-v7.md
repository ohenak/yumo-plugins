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

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | High | Local | **`advisory.waveBudgetPerRun`'s default reverted to `2`, contradicting three sites inside this REQ, the decisions record, and three approved downstream artifacts.** C-2 (`REQ:212`) now ships `2`, and its gloss (`:214`) calls it "a proposal, not a confirmed operator decision — Q-1". But R-3 (`:499`) says "`advisory.waveBudgetPerRun` (default 1) … (Q-1, decided)", §9's Q-1 row (`:545`) says "**No.** `advisory.waveBudgetPerRun` ships `1` (C-2, AC-2.4). Revisitable to `2` once wave resume …", and the v1.3 changelog (`:61`) records the `1` decision. Upstream, `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md:36` reads "**Decision: default `1`**" and `:19` explicitly marks the `2` proposal superseded. Downstream, the implementable constant is pinned to `1` in TSPEC (`:523` `waveBudgetPerRun: 1`; `:1069` invalid values fall back to `1`), PLAN A6-05 (`:108` "`ADVISORY_DEFAULTS` gains `waveBudgetPerRun: 1`"), and PROPERTIES PROP-CFG-01/CTR-11. An implementer reading C-2 as the requirement authority ships the wrong constant into a set-equality-plus-value assertion. Repair: restore `1` and the superseded-proposal gloss. | §5 C-2 (`REQ:212`, `:214`) vs R-3 (`:499`), Q-1 (`:545`) |
| F-02 | High | Local | **O-7 deleted from §9 while three sites still cite it.** §9 now lists O-5, O-6, O-8 only (`REQ:529`–`:536`); no O-7. AC-1.2's prose (`:245`) says the build-breaking source-defect class is "permanently outside A6's reach — Q-2's decision, recorded as O-7", §9's Q-2 row (`:546`) says "recorded as O-7", and the v1.3 changelog (`:62`) says the class was "routed to O-7 (Q-2)". The accepted consequence of Q-2 therefore has no recorded home and no owner (`pdlc-engineering-loop`, queue row 6) at HEAD — the nonexistent-authority citation pattern this REQ has been bitten by before. Repair: restore O-7 verbatim. | §9 (`REQ:529`–`:536`), AC-1.2 (`:245`), Q-2 (`:546`) |
| F-03 | High | Local | **The Upstream row cites a path that does not exist at HEAD.** `REQ:11` cites `docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md`; `ls` shows no such directory. The tier REQ lives at `docs/completed/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md` (present). Every "the tier's existing X" claim in this REQ — closed refusal-reason set, envelope enumeration, seam/attempt semantics — traces through this row, so the traceability chain resolves to nothing, and the sibling cross-reviews that cite the tier already use the `docs/completed/` path. Repair: restore `docs/completed/`. | Header, Upstream (`REQ:11`) |
| F-04 | High | Local | **§1's M-WG-6 row now asserts verbatim the claim the paragraph two lines below it retracts.** The row (`REQ:99`) reads "a re-invocation re-enters at wave 1 and re-dispatches **every** wave, including those whose commits already landed"; the Correction directly beneath (`:102`–`:104`) says "The M-WG-6 row above *previously* claimed a re-invocation 're-enters at wave 1 and re-dispatches every wave, including those whose commits already landed.' The source no longer does this *unconditionally*". Verified at HEAD that the correction, not the row, is true: the interim wave ledger exists (`WAVE_STATE_PATH`, `orchestrate-dev.js:11322`; read/validate `:11372`–`:11412`; consume/skip `:14210`–`:14285`), so already-committed waves *can* be skipped. The uncorrected row also undercuts D-AWG-03b (`:585`), which defers wave resume precisely on the ground that the mechanism ships but its preconditions do not hold. Repair: restore the corrected row. | §1 (`REQ:99`, `:102`–`:104`), §10 D-AWG-03b (`:585`) |
