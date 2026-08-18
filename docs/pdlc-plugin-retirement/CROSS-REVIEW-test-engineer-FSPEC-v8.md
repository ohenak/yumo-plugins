# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.6, 2026-08-18)
**Date:** 2026-08-17
**Iteration:** 8
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-FSPEC-v7.md`. Delta scanned with
`git diff b6f0516b..HEAD -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
(20 insertions, 4 deletions) in one commit, `9f2e5107` ("accept TSPEC erratum 9 into FSPEC v0.6").
Three hunks: the header version row (`0.5` → `0.6`), BR-SWEEP-6 (:283–290), AT-1.3 (:619–624) and
the new §7.3 "Downstream errata — accepted" (:829–838). Unchanged sections already approved were
not re-litigated.

## Resolution of round-7 findings

| Prev | Status | Evidence |
|---|---|---|
| F-01 (Medium) — AT-5.2 clause 2 / E-21 say the eight exempt collections are compared "by presence and shape" where REQ AC-5.2 says "by presence, not content", and `loop` legitimately differs between runs | **Not addressed** | Delta touches neither §6.5 nor §5's E-21. Text at :781 and :581 is byte-identical to the v7-reviewed bytes. Carried forward as F-03 below, still non-gating. |
| F-02 (Low) — header Cross-Reviews field stops at v4 | **Not addressed** | :11 still enumerates SE v1/v3/v4 and TE v1–v4; TE v5, v6, v7 and SE v5/v7 exist on disk. Carried forward as F-04, still non-gating. |

Neither was gating in round 7 and neither is gating now. The blocking findings below are new and
arise from the delta itself.
