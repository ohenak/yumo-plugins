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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The new distinguishability claim is sound, but only one of its two conjuncts is a reported field — under a cadence trigger the row alone does not carry it.** §4b:626-628 now argues the all-unreadable pass needs no code because "AC-7.1's *LEARNINGS consumed by basename* is empty while the un-consolidated set is non-empty, whereas a quiet week has both empty". The first conjunct is a report field (AC-7.1, REQ:517). The second is not: AC-7.1's enumeration of what a pass reports — terminal status and reason code, rung, consumed basenames, promotions by route, the AC-5.2 table, deferrals — contains no un-consolidated-set field, and §4b:619 itself locates that set in what "both the hook and the next tick compute", i.e. outside the row. The claim is still true for a *reader with the tree*, and it is row-local whenever the pass was volume-triggered: `|un-consolidated| >= volumeThreshold` (REQ:150-151, AC-1.2 REQ:179) can never hold for a quiet week, and the row does carry `trigger` (`pdlc-consolidation-vocabularies.md:60` — trigger is written on "any status that writes a row"; `:154` lists "status, trigger, …" as row fields). The residual gap is narrow: a **cadence**-triggered pass over 1–4 unreadable files writes a row byte-identical to a quiet week's. Cheapest close is one clause naming the trigger as the row-local half — "…is empty while the un-consolidated set is non-empty (a `volume`-triggered row carries this on its face; under `cadence` the set is recomputed by the next tick, which retries the basenames)". No new field, no vocabulary row; it just stops a future TSPEC round from re-deriving the gap as a defect. | §4b (REQ:626-628) vs AC-7.1 (REQ:517-518), REQ:619 |
| F-02 | Low | Process | **The v2.5 erratum note retires the v2.4 anchor sweep by reference while the preamble still dates the epoch at v2.4 — correct today, fragile at the next sweep.** REQ:17-19 reads "measured at the v2.4 sweep"; the erratum block (REQ:26-30) says the v2.1–v2.4 notes are retired, "including the v2.4 anchor sweep". Both are accurate at HEAD — I confirmed no code moved since the round-20 verification, so every anchor still resolves — but the epoch label and the erratum version have now diverged by one, and the next round that bumps to 2.6 without re-measuring inherits a preamble pointing two versions back. Worth pinning the epoch to the sweep that last *moved* an anchor and saying so explicitly, rather than letting the reader infer it from the version cell. | Preamble (REQ:17-19), erratum (REQ:26-30) |

## Questions

## Positive Observations

## Recommendation

## Verdict
