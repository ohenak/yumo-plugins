# Cross-Review: software-engineer — Implementation (DoD adjudication of CODE_REVIEW-pdlc-stats-v3)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-stats/CODE_REVIEW-pdlc-stats-v3.md (remaining finding adjudication)
**Date:** 2026-08-31
**Iteration:** 3
**Scope:** Adjudicate each finding remaining open in CODE_REVIEW-pdlc-stats-v3 as real-defect / mis-scoped-criterion / deferral-candidate, with evidence; name a successor for any deferral-candidate. Exactly one finding remains (v3 §1 #1).

## Adjudication

### v3 §1 #1 — remediation delta not committed → **REAL DEFECT** (must land before DoD passes)

**Classification evidence:**

- **The state the finding describes still holds at review time.** `git log --oneline -3` shows branch tip `0e881c53d` ("dod: code review v3 for pdlc-stats") atop `926cdb42b`; no remediation commit exists. `git status --porcelain` lists exactly the v3-described delta: 9 modified test files (engine: `stats-cli.test.js`, `stats-cli-structure.test.js`, `stats-vendoring.test.js`; workflows: `statsAntiDrift`, `statsArgv`, `statsDiscovery`, `statsMetrics`, `statsOutcome`, `statsRender`) plus untracked `pdlc/engine/__tests__/stats-narrative-drift.test.js`.
- **Why real-defect, not mis-scoped-criterion:** the DoD criterion legitimately requires remediation to be *on the branch*, not merely in a working tree. Every Phase PUB gate — `Unit tests (ubuntu-latest, node 20)`, `Engine tests (ubuntu-latest)`, `Shell scripts parse`, `Fixture machine` — runs against the pushed tip; an uncommitted fix is invisible to all four, and the new 29-oracle `stats-narrative-drift.test.js` gates nothing until tracked. The two prior remediation rounds set the precedent by landing as commits (`c11c1e863`, `e10acc4a2`); this round is the outlier, not the criterion.
- **Why not deferral-candidate:** the fix is a single stage-commit-push of content v3 already verified in full (comment-only tracked delta — re-confirmed here: `git diff -U0` filtered to non-comment changed lines returns **zero** lines; mutation-verified oracle file; engine 957/955-pass, workflows 5121-pass at this exact tree state). Cost to land ≈ zero, code risk zero; deferring would strand a finished, mutation-verified defect-class oracle off-branch with no offsetting saving. No successor REQ is warranted or named.

**Required action (unchanged from v3's remediator note):** `git add` the 9 modified files plus `pdlc/engine/__tests__/stats-narrative-drift.test.js`, commit, push. `git status --porcelain` empty afterwards; `git log --oneline -1` no longer `926cdb42b`/`0e881c53d`-only history for the remediation content. No code or assertion change.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | High | Process | v3 §1 #1 confirmed as a real defect: the entire round-3 remediation (9 modified files, +65/−80 comment-only, plus untracked 29-oracle `stats-narrative-drift.test.js`) exists only in the working tree; branch tip carries no remediation commit, so no CI gate can see it. Land it verbatim — stage, commit, push; zero content change required. | CODE_REVIEW-pdlc-stats-v3 §1 #1 |
| F-02 | Low | Local | v3 states the untracked oracle file is 176 lines; `wc -l` measures 178 (`pdlc/engine/__tests__/stats-narrative-drift.test.js:178`). Trivial count drift in the review prose only; the tree is otherwise byte-identical to the state v3 verified (status/diff match exactly, file runs 29-pass standalone). No action beyond noting. | CODE_REVIEW-pdlc-stats-v3, Scope preamble |

## Questions

| ID | Question |
|----|----------|
| — | None. |

## Positive Observations

- The remediation content itself is the strongest of the three rounds: cited findings fixed, seven uncited sibling files swept unprompted, and the defect class converted into a mutation-verified 29-oracle family that cannot silently regrow. Nothing about the *content* blocks DoD — only its absence from branch history.
- Re-verification here was cheap and conclusive because v3 recorded exact tree state (commit hash, file list, +65/−80, test counts), making "unchanged since review" mechanically checkable.

## Recommendation

**Needs revision**

The single remaining finding is a real defect with a one-action fix: land the already-verified remediation delta (9 tracked files + 1 untracked oracle file) as a commit and push. No code, assertion, or comment change is needed. Once `git status --porcelain` is empty and the commit is pushed, this finding closes and — per v3's own verification of the content — nothing else in the round remains open.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
