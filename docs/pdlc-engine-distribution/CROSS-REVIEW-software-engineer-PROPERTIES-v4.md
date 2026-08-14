# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-14
**Iteration:** 4
**Scope:** Delta re-review of the v0.5 → v0.6 edit (commits `c8ae346d`, `1418429a`, `d71e3986`,
`a4b12eb7`) against my v3 review at `06e74162`. Two of my open findings (F-01 Medium, F-02 Low)
checked for resolution; only the changed regions scanned for new issues. Not a whole-document
re-review.

## 1. Prior findings — resolution

Both of my round-2 findings, carried forward unaddressed through the round-3 erratum round,
are now closed. I checked the diff, not the changelog.

| Prior finding | Severity | Edit made | Verified |
|---|---|---|---|
| **F-01** — PROP-LAUNCH-1 traced `AC-5.5` while asserting `store.empty`, whereas AC-5.5's message id is `version.pin-missing` and is already carried by PROP-VER-5; §4's no-`AT-`-row paragraph compounded it by naming AT-5.5's and AT-1.3's legs as the observation site | Medium | (a) `:86`'s `Traces` cell now reads `TSPEC §6.2` alone and the row states it is a resolver-shape property with no acceptance criterion of its own, quoting AC-5.5's *Given* and naming PROP-VER-5 as its carrier; (b) `:316-323`'s paragraph now points at PROP-LAUNCH-4's resolution state (b) and says explicitly that neither AT-5.5's fixture nor AT-1.3's refusal states is the observation site | **Resolved, both legs.** The quoted *Given* — *"a pin naming a version that is not installed"* — is verbatim from `REQ:427`, and the cited span `REQ:427-429` is exactly AC-5.5's three lines. `version.pin-missing` is PROP-VER-5's id at `:194`. No other row now claims AC-5.5 while asserting `store.empty`: the remaining AC-5.5 tracers (`:194`, `:195`, `:198`, `:200`) are all pin/config-branch properties. §5's REQ-EDIST-01 row (`:348`) already spoke of the "engine-store/launcher half" rather than of AC-5.5, so nothing there went stale |
| **F-02** — PROP-LAUNCH-9's two structural negatives (dispatch count `=== 0`, byte-identical tree) had no §3 catalogue row, against §3's own "every negative appears here" claim | Low | §3 gains **PROP-NEG-18** (`:269`) | **Resolved.** The row is written to §3's own form — negative stated with the positive conjunct that falsifies it — and both conjuncts are transcribed from PROP-LAUNCH-9, not paraphrased into something weaker. The non-empty pre-state qualifier survives the move, which is the clause that stops an empty fixture passing the byte-identity check |

## 2. New-issue scan over the changed regions

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
