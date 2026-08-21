# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-21
**Iteration:** 4 (delta re-review of PROPERTIES v1.5, against my v3 anchor `32a459ef`)

## Overview

**Scope of this round.** Delta re-review. My v3 anchor was `32a459ef`; six commits have landed on the
document since (`53a36af6`, `6cb64187`, `5719637f`, `b4627fa8`, `dd2e2e29`, `d3f0bcf5`), taking it to
**v1.5** — +128/−29 lines. I read the diff, not the document, and re-read only the sections it
touched: §Scope, §E (PROP-REST-08), §F (PROP-REC-05, plus new PROP-REC-08…-11), §Oracles (new O-J and
the falsifiability paragraph), §Fixtures (three new rows, one new hazard, the deliberately-unpinned
string), matrices C-1/C-2/C-3 and §§G-1/G-3/G-4.

**Where my three v3 findings stand.** All three are resolved, and the Medium was resolved *upstream*
rather than here, which is the right place for it.

| v3 finding | Status | Evidence I checked, not the document's word for it |
|---|---|---|
| F-01 (High) — AC-6.3's second conjunct had no property, oracle or fixture; C-1's row and §G-4's coverage claim were false at conjunct granularity | **Resolved** | Four properties added (`PROP-REC-08`, `-09`, `-10`, `-11`); C-1's AC-6.3 row is split by sentence; §G-4 restates the claim at conjunct granularity and names the gap it closed. The positive arm is homed on the **two-red-wave** run, *not* on E-34's `null`-capture run — the specific vacuous-pass mistake I named in advance |
| F-02 (Medium) — the warning's carrier was pinned by properties I had already approved; the slot decision was upstream's | **Resolved upstream, correctly absorbed** | FSPEC v1.7 adds AT-06-4's third conjunct and `AT-06-4b`; TSPEC v1.15 lands the fifth halt field `snapshotRef`, the exported helper `renderSnapshotOverwriteNotice`, and `notices` as the carrier; PLAN v1.12–v1.13 give both arms owners (A6-18 seam-side, A6-21 un-skip-side). The carrier is `notices`, so **PROP-REST-09's byte-equality with the pre-A6 literal is untouched** and the shared Pre-A6 baseline fixture is unaffected — the low-blast-radius resolution, taken deliberately |
| F-03 (Low) — grounding pins cited stale upstream HEAD | **Resolved** | I re-hashed all five on disk: REQ `f97f4f66…`, FSPEC `d602c440…`, TSPEC `1f6ea486…`, DECISIONS `dc7a8d65…`, PLAN `c843cb4f…`. Every one matches the version cell the document now claims |

**Did the revision break anything I approved?** No. I checked the two places where breakage would
have shown: `PROP-REST-09`'s reason-string **equality** is verbatim unchanged in the diff, and the
Pre-A6 baseline fixture row is unchanged. The only edit to an approved property is `PROP-REST-08`'s
four→**five** halt fields, which is the corollary of the upstream field addition and is required —
`toEqual` fails on an extra key exactly as on a missing one, so leaving it at four would have
reddened the very suite that owns it. `PROP-REC-05` gained a scoping sentence only; its assertion did
not move.

**Two Low findings, neither gating**: a stale suite count in §C-3 that the Overview's own edit
outran, and a lineage row that rolled backwards. No High, no Medium. **Approved with minor changes.**

## Properties

_(pending)_

## Oracles

_(pending)_

## Fixtures

_(pending)_

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_
