# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 3

## Scope of this round

Delta re-review under decision freeze. Baseline: `aa7e06626` (the commit reviewed at v2).

**The document under review did not change.** `git diff aa7e06626..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` is empty. The delta this round is entirely **upstream**: REQ v1.4 → v1.6, FSPEC v1.5 → v1.7, TSPEC v1.4 → v1.7, PLAN v1.1 → v1.2, plus the first implementation waves landing (`statsPreflight`, `statsArgv`, `statsMetrics`, `statsDiscovery`, `statsRender`, `statsOutcome`, `statsAntiDrift`, `helpers/statsDoubles.js`, and the three `pdlc/engine/__tests__/stats-*` suites).

So the only question this round can answer is the one it should: **does anything PROPERTIES pins become false now that its upstream moved?** I re-derived every claim the upstream delta could have invalidated against HEAD rather than against the v2 record. Sections untouched by the upstream delta are not re-litigated.

The four upstream moves that could reach PROPERTIES, and what each did to it:

| Upstream move | Reaches PROPERTIES at | Verdict |
|---|---|---|
| **REQ v1.6** withdraws REQ-STATS-05's harvested halt state, restores a measured `0`; NG-6 rescoped to the two families harvest removes; R-6 records the `0` conflation as an accepted residual | PROP-HALT-07, PROP-NEG-04 | **Survives unchanged.** PROP-HALT-07 already required an empty halt set / `[]` / the `none` line and exit `0` for a feature with no post-mortem — exactly what REQ now mandates; it never asserted a harvested halt state. PROP-NEG-04's "no measured `0` for a harvested document type, DoD metric or ratio" names three metrics and **not** halts, so REQ's new accepted-`0` residual does not contradict it. No edit owed. |
| **FSPEC v1.7** corrects BR-16's citation of `docs/completed/pdlc-advisory-wave-gate/` from two to **four** out-of-catalogue cross-reviews, and re-scopes it to the malformed *basename shape* only — that directory reports a **measured** ratio | PROP-RR-05, PROP-RATIO-08, §Fixtures real-path table | **Survives, and was already right.** PROP-RR-05 and the fixture table both already said "exactly **four**" and both scope the directory to the malformed-basename claim; neither ever attributed a `harvested` verdict to it. Re-measured at HEAD: 62 `CROSS-REVIEW-*`, of which 4 are `-REVIEW-v{1,2}.md` — FSPEC's corrected count and TSPEC §4.3's 62/4/58 both check out. |
| **FSPEC v1.7** adds a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file to AT-15's neither-list and routes **BR-16 → AT-15, AT-17** in §8 | PROP-RATIO-03 (AT-15's owner), §Traceability AT-15 / BR-16 rows | **Substance covered, mapping stale.** See F-01. The behaviour is pinned by PROP-RATIO-06; the AT-15 fixture transcription and the two matrix rows do not show it. |
| **REQ v1.6** calls a grammatical-but-out-of-catalogue basename **a survivor**, contradicting BR-16 on the same file | PROP-RATIO-08 leg 4 | **PROPERTIES chose correctly; it just doesn't say so.** See F-02 and the erratum below. |

Claims re-derived at HEAD this round (not carried over from v2):

| Claim | Checked at HEAD | Verdict |
|---|---|---|
| `docs/` root holds twenty-one directories | `git ls-tree -d --name-only HEAD docs/` → 21 | ✅ still 21 — this round added ~29 files under `docs/pdlc-stats/` but no directory |
| `docs/completed/pdlc-advisory-wave-gate/` carries exactly four `-REVIEW-v{1,2}.md` basenames | `git ls-tree … \| grep -c -- "-REVIEW-v"` → 4; total `CROSS-REVIEW-*` → 62 | ✅ PROP-RR-05, PROP-RATIO-06's shape, FSPEC v1.7's corrected count and TSPEC's 62/4/58 all agree |
| PLAN still names `statsRealPaths.test.js` as a new file owned by T-18 | `PLAN:110` (T-18 row), `PLAN:179` (File Ownership Manifest, wave 9, "new") | ✅ PROPERTIES' T-18 trace row and level table resolve; the suite is legitimately absent from HEAD because wave 9 has not run |
| Every test file PROPERTIES names is either shipped or planned-new | T-01…T-11's suites exist at HEAD; T-18's is manifest-declared for wave 9 | ✅ no property traces to an unplanned file |
| PLAN's task ids PROPERTIES traces (T-04, T-05, T-06, T-07, T-10, T-18, T-26) survived the v1.2 renumber | PLAN v1.2 changed row *contents*, not ids | ✅ no trace dangles |

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | nonlocal | AT-15's neither-list gained a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` member at FSPEC v1.7, and §8 now routes BR-16 → AT-15. The behaviour is pinned (PROP-RATIO-06), but PROP-RATIO-03 — the AT-15 fixture transcription — still lists the old three plus `HANDOFF-PROMPT.md`, and the §Traceability AT-15 and BR-16 rows do not name PROP-RATIO-06. Coverage is real; the map to it is stale. | §Properties → PROP-RATIO-03, PROP-RATIO-06; §Traceability → AT-15, BR-16 |
| F-02 | Medium | delta | nonlocal | REQ-STATS-06 v1.6 now calls a grammatical-but-out-of-catalogue basename **a survivor**, which contradicts FSPEC BR-16 v1.7 on the same file and inverts PROP-RATIO-08's fourth leg. PROPERTIES asserts the BR-16 reading — the correct choice, matching TSPEC §4.3 — but records the dispute nowhere, and PROP-RATIO-08's Traces column still cites `REQ-STATS-06` as authority for the leg REQ-STATS-06 now contradicts. | §Properties → PROP-RATIO-08; §Gaps |

Both are Medium and neither gates. Provenance is `delta` because the upstream edits of this round left these items unlanded in PROPERTIES; locality is `nonlocal` because PROPERTIES itself has no changed sections this round.

## Findings

## Questions

## Positive Observations

## Recommendation

