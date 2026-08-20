# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.6)
**Upstream re-read:** `docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md` (v0.8)
**Date:** 2026-08-19
**Iteration:** 7 (delta confirmation on an approved FSPEC)

## Scope

Delta confirmation only. I read the erratum commit `4857352e` against the approved v0.5
bytes, re-read the upstream REQ v0.8 text the changed passages lean on, and scanned the
unchanged sections those passages now contradict or depend on. I did not re-review
sections untouched by the edit and unrelated to it.

## Routed-item disposition

| Item | Disposition |
|------|-------------|
| G-1 vs AC-5.1a default-state contradiction | **Landed** |
| E-13 provenance ("measured: occurs at HEAD") | **Landed, but overshot** — see F-01 |
| BR-14's `parseAdvisoryConfig` contrast vs `ADVISORY_DEFAULTS.enabled` | **Landed** |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|-------------|
| F-01 | Medium | Local | E-13's new annotation `(declared; not seen at HEAD)` overshoots the routed correction and now contradicts BR-4 in the same document. BR-4's measured-basis paragraph still states, of the 89-document corpus REQ C-3 defines, that "some values carry free text after the date — for example `2026-06-09 (Phase H harvest; partial close-out)`", and calls the tiebreak "exercised by real documents on day one". The routed item's premise ("no corpus document carries free text after the date") holds for the 9 `yumo-plugins` documents only; TSPEC §D.4 scoped its own claim correctly as "not measured **in this repository**", and E-13 dropped that qualifier. E-12 one row above frames HEAD as the same 89-document corpus ("measured: 2 of 89 at HEAD"), so the two adjacent rows now read HEAD differently. A fixture author reading E-13 literally concludes the annotated shape occurs nowhere at HEAD and that no fixture may cite HEAD provenance for it, when BR-4 offers a real `regime-ledger` citation. Fix by scoping, not by re-inflating: `(measured in `regime-ledger`; not present in `yumo-plugins`' 9 documents)`. | E-13, BR-4 measured-basis table |
| F-02 | Medium | Local | AT-32's oracle for the default-enabled states is equality against a live sibling branch with no positive-presence conjunct, so it can pass vacuously. "each of the three injects on §4.1's declared defaults, its composition equals the enabled-run composition" is satisfied when the enabled comparand itself carries nothing — a regression that silently empties injection in every branch leaves both sides equal and AT-32 green. AT-31 deliberately refuses exactly this shape upstream ("that committed pre-feature fixture, not a second branch of this run", AC-5.1a). Add one positive conjunct to AT-32: each of the three compositions **contains** the delimited advisory block identified by its source document path (C-4, AC-1.1) and its selection equals the same fixture literal AT-32's `NTC-KEYTYPE` leg already names. This was not an issue in v0.5, where AT-32 asserted byte-for-byte against AT-31's disabled baseline. | AT-32 |

## Questions

| ID | Question |
|----|----------|
| Q-01 | REQ AC-5.1b justifies fail-open as "the same response the sibling reader ships, which keeps running on its declared defaults and reports". The sibling's declared defaults leave `enabled` at `false`, so the shared property is "runs on declared defaults and reports", not "keeps running enabled". FSPEC BR-14 now says this correctly; is the REQ sentence worth tightening on its next erratum, or is the FSPEC gloss sufficient? Not gating either way. |

## Positive Observations

- The default-enabled state is now stated identically in all six places the pipeline reads it — Step 0 of the flow, D-1, BR-14's five-state table, BR-14's three load-bearing points, E-21/E-23/E-34, and AT-31/AT-32. I checked each for a surviving "baseline-identical" reading of the absent state and found none; `grep` for `absent` turns up only the injection-summary-key sense at lines 626 and 868, which is the correct and different sense.
- Splitting AT-31 (explicit `enabled: false` → byte-identical to the recorded pre-feature baseline) from AT-32 (absent / file-absent / misspelt → default-enabled) is the right test decomposition, and re-pointing AC-6.2 at AT-31 alone is consistent: AT-31 is now the only test whose comparand is the committed baseline fixture.
- BR-14's `parseAdvisoryConfig` bullet is now a verified contrast rather than an inverted one. `ADVISORY_DEFAULTS.enabled` is `false` at `pdlc/workflows/orchestrate-dev.js:1945`, and the bullet cites the divergence as deliberate with REQ §4.1 as its authority — which §4.1 does declare (`learningsInjection.enabled`, default `true`).
- AT-32's completeness leg retains set equality over the notice catalogue (exactly `NTC-MALFORMED` and `NTC-KEYTYPE`), so the added default-enabled cases did not weaken the notice oracle into an absence-only one.

## Recommendation

**Approved with minor changes**

The three routed items all landed and none of them broke a previously approved section. Two
Medium findings remain: one is the routed E-13 correction overshooting into a claim BR-4
contradicts (F-01), the other a vacuous-green shape in the new AT-32 oracle (F-02). Neither
is High, so neither gates. Both are cheap edits and should ride the next erratum.

## Delta-Confirmation Findings

FINDING: Medium | delta | local | E-13 (Edge Cases and Error Scenarios) | Corrected provenance overshoots into "not seen at HEAD", contradicting BR-4's measured 89-document basis which cites a real free-text `Date Completed` value in `regime-ledger`; scope the annotation per repository instead.
FINDING: Medium | delta | local | AT-32 (Acceptance Tests, Group 5) | New default-enabled oracle compares against a live enabled sibling branch with no positive-presence conjunct, so it passes vacuously if injection is empty on both sides.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}
