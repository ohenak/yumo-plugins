# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` (v1.1)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Delta re-review: prior findings F-01…F-07 from `CROSS-REVIEW-product-manager-PLAN-v1.md`, plus new issues in changed sections only.

**Delta basis:** `git diff 386e97f3..HEAD -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md` (173 insertions, 55 deletions across §0 changelog, §3, §5, §6, §7, §8, §9, §10, §11). Unchanged sections not re-litigated.

## Prior findings — disposition

| v1 | Severity | Status | Evidence I checked |
|---|---|---|---|
| F-01 | High | **Resolved** | §9's AT column is now set-equal per row to FSPEC §14.1 (`FSPEC:1331-1360`) — I compared row by row, both directions, and the three widenings (`AT-ENG-51`, `AT-ENG-50`, `AT-ENG-44`, `AT-ENG-22`) are each marked "this plan's addition". AC-1.3's range is restored to `AT-ENG-52…AT-ENG-57`. The eight formerly unowned ATs (02, 05, 17, 18, 32, 40, 57, 66) have owning tasks in §9's second table and appear in the owning rows' cells (T47, T22, T21, T31, T32). Mechanically: expanding every range in both documents, the AT sets are equal at 69 members, no gaps and no extras |
| F-02 | High | **Partly resolved — see F-01 below** | The DoD item and §11 now require **both** suites and quote a literal post-T17 value, which is what I asked for. But the literal is not the HEAD value with the engine suite prepended: it drops one ignore pattern. Detail in F-01 |
| F-03 | Medium | **Resolved** | Same set-equality check as F-01. The five divergent rows (AC-1.4, AC-2.1, AC-3.1, AC-3.2, AC-3.5) now transcribe FSPEC exactly; AC-3.2's `AT-ENG-10` is corrected to `AT-ENG-12` |
| F-04 | Medium | **Resolved for the glyph and the gate, one residue** | T10 carries 🟢, sits in AC-1.5's green column with clauses (a)/(b) separated, and §5's batch-2 row exempts it explicitly ("A red T10 is the defect there"). The residue is the Red-task column still naming T10 — F-02 below |
| F-05 | Medium | **Resolved** | Re-read `.github/workflows/pr-tests.yml` at HEAD: `unit-tests` `:27`, `artifact-freshness` `:77`, `fresh-clone-bootstrap` `:103`, `script-syntax` `:161` (display name "Shell scripts parse"), `npm ci` `:68`, `npm test` `:75`, `working-directory: pdlc/workflows` `:67`/`:71`. All five corrections land. One stylistic residue in F-04 below |
| F-06 | Low | **Resolved** | T48 now pins v(a) as a malformed trailer (`VERDICT — Approve`, no colon) and v(b) as a task table whose header cell reads `Task`. Both are genuinely unparseable against the shipped grammar, so M-ENG-07 rows 6 and 7 are witnessed by fixture content rather than by hope |
| F-07 | Low | **Resolved** | §8's AC item now carves out AC-6.2 as operator-recorded, names the file (`docs/_constraints/pdlc-engine-baseline.md`, T53's) and states no §11 command observes it. §9's AC-6.2 row says the same |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
