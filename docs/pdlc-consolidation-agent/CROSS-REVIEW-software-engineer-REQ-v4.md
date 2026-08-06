# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-05
**Iteration:** 4
**Scope:** Local (delta re-review — v3 findings + changed sections only)
**Baseline diffed:** `8c20b4e..HEAD` (8 revision commits, +252/−199; REQ v1.2 → v1.3, 693 lines)

## Prior-Finding Disposition

All seven v3 findings, checked against the revision. Nothing below is re-litigated.

| v3 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-3.8b now names `commitQueueRow` (`pdlc/workflows/orchestrate-queue.js:1576`, add `:1577`, commit `:1580-1585`) and the advisory-record commit that mirrors its two-call shape (`:1615`) as the precedent, requires **the pathspec on both git calls** in the AC text itself, and states explicitly that the mechanism is *not* `commitPaths` — with the reason (`orchestrate-dev.js:8690` is a plain `git commit -m`, which would sweep a staged index, and AC-3.8's shipping tree is precisely one that may carry one). The lock-retry claim is re-anchored to `gitWithLockRetry` at `:8670`, which is where `commitPaths` actually wraps its `add`. All four citations verified below; `:1615` is the better anchor than the `:1605` I suggested (that is the doc-comment head; `:1615` is `commitAdvisoryRecord` itself). |
| F-02 | High | **Resolved — and my premise was wrong** | I stated that `docs/_decisions/.consolidation-log.md` "is a single-line JSON array". That is false: the file at HEAD is a markdown pass log — `# Consolidation Log` (`:1`), `## Pass 1 — 2026-07-29` (`:8`), a two-column consumed table of **full paths** (`:14-17`), then prose promotion sections. The revision checked the file rather than taking my claim, corrected the description, and then answered the finding that survived the correction — the predicate is now stated over **two regions** (delimited block, or the legacy region preceding the file's first `<!-- pdlc:consumed` marker; a log with no block is legacy region entire), which is total over any log, needs no parse of Pass 1's prose, and re-uses the shipped substring test for exactly the pre-feature text. NFR-4 gains the stated limit (`failure-mode-id` cannot key a pre-convention LEARNINGS) with the legacy region named as what prevents the re-consumption rather than NFR-4 absorbing it. The concrete first-run assertion is exact on this repo — verified row-by-row below. The residue is v4 F-02, a new finding about *freezing* the boundary, not this one reopened. |
| F-03 | Medium | **Resolved** | All three ACs are now keyed on consumed-set emptiness, never on the `no-op` label, and each says so in those words. AC-1.4: "Which streaks it advances is decided by consumed-set emptiness, never by the `no-op` label", with both causes routed (empty ⇒ neither evaluated nor counted; duplicate-suppressed ⇒ counts in both populations). AC-5.3 and AC-5.5 carry the reciprocal sentence. The three now agree on the case AC-1.4 introduced. |
| F-04 | Medium | **Resolved as to the destination; one consequence is mis-generalised** | AC-3.8b's new "Where those commits go, stated" paragraph makes the invoking branch the accepted destination and says the uncomfortable part out loud — the promotions ride an unrelated feature's PR, pushed by Phase PUB — and AC-7.1 reports the branch. That is what I asked for. The abandonment half is answered by construction (promotions and the NFR-5 consumed block are one commit) and the answer is right *for the consuming-repo route*; it is stated as if it covered both routes, which is v4 F-01. |
| F-05 | Low | **Resolved** | §4b's `no-advisory-corpus` and `advisory-corpus-empty` rows now read `promoted`, `promoted-degraded`, `no-op`, `failed`, and the closing paragraph derives that by composition ("the corpus is read before AC-3.5's or AC-1.6's failure is decidable") rather than by listing. |
| F-06 | Low | **Resolved, all three** | (a) the doc-comment quote is now `:1800` and the export `:1833` — both exact; (b) the queue anchors are `:1243-1244` (comment) and `:1245-1256` (dispatch) — both exact; (c) `CODE_REVIEW-{feature}-v{N}.md` is now cited at `orchestrate-dev.js:10349`, which **is** the construction site (`` const codeReviewPath = `docs/${featureName}/CODE_REVIEW-${featureName}-v${dodResult.iterations}.md` ``), so all three rows of the AC-5.2 mapping table are construction sites. |
| F-07 | Low | **Resolved, and over-delivered** | PT is added to the undecidable set, and §4b gained a phase-catalogue row enumerating all thirteen ids with per-id anchors (`PHASE_DISPATCH` for R/F/T/D/P/PR/CR/DOD, `recordPhase` literals for I/PT/H/PUB/MERGE). Every anchor verified. The set is now enumerated in the document, which was the standard §4b sets for itself. |

Seven of seven resolved. The three findings below are **new** and all arise in text this revision
added.

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict
