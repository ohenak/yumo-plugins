# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md
**Date:** 2026-08-10
**Iteration:** 21 (delta re-review, v2.5)
**Scope:** Delta only — the single commit `cdd187fe` that produced v2.5 from v2.4 (version bump, v2.5 erratum note replacing v2.1–v2.4, AC-1.4 third-cause parenthetical, §4b's terminal sentence). Untouched sections are not re-reviewed. No code changed on the branch since the v20 review base (`git diff e65c8503 HEAD -- ':!docs'` is empty), so the v2.4 anchor epoch stands as verified in round 20.

## What I examined

`git diff e65c8503..HEAD -- REQ-…md`: 10 insertions, 9 deletions, all in three places — the header version cell (2.4 → 2.5), the erratum block, AC-1.4's third-cause parenthetical, and §4b's closing sentence. Then, against HEAD: a repo-wide grep for the retired value, the vocabulary file's `Version` and §1 row count, the shipped `REASON_CODES` freeze, AC-7.1's reported-field list, and the tick-order/`trigger` grammar that the new distinguishability claim leans on.

## Prior findings (v20) disposition

| v20 | Status | Evidence at HEAD |
|---|---|---|
| F-01 High — `corpus-unreadable` was a thirteenth reason code with no row in the vocabulary file or the shipped catalogue, breaching §4b's own symmetric set-equality oracle | **Resolved** | The value is gone from the whole tracked tree: `grep -rn "corpus-unreadable" docs/ pdlc/` (excluding review/postmortem/learnings files) returns nothing, exit 1. `docs/_constraints/pdlc-consolidation-vocabularies.md:7` still reads `Version 1.4`, §1 still enumerates the same twelve reason codes (`:47-58`), and `pdlc/workflows/consolidate-learnings.js:95-107` still freezes the same twelve. The REQ took exit (b) exactly as recommended — no pin moved, no catalogue entry moved, `consolidationReport.test.js`'s four-leg set-equality is untouched |
| F-02 Medium — §4b contradicted itself: REQ:618 said the case needs "no new field, no new reason code and no vocabulary row" while the paragraph's last sentence minted one | **Resolved** | The two sentences now agree. REQ:618 stands unchanged and §4b:626-628 closes with "**and no reason code is added either**". AC-1.4 (REQ:227) likewise drops the parenthetical code, leaving the bare `(§4b)` cross-reference |
| F-03 Low Process — the enumerated-value diff (REQ values vs §1 vs `REASON_CODES`) wasn't mechanised the way the anchor grep was | **Open, not re-raised** | Still a process suggestion for the harvest phase, not a document defect; the value it would have caught is gone. Carried as a Process note, not re-filed as a finding |
| Q-01 — is the all-unreadable pass paired with AC-3.5/AC-1.6, or does it stand alone? | **Answered by construction** | With no reason code minted there is no pairing to decide: §4b's join is unchanged and the row carries `no-op` with whatever reason code the ordinary composition rule already permits |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
