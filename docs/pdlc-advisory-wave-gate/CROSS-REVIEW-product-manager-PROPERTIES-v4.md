# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-21
**Iteration:** 4 (delta re-review of v1.5 against my v3 findings)

## Overview

**Both my v3 findings are resolved, and I verified the fix against the repository rather than
against the document's own account of it.** The delta since my last-reviewed commit (`32a459ef`) is
**+128 / −29** across six commits (`53a36af6`…`d3f0bcf5`), landing PROPERTIES **v1.5**. F-01 (High)
is closed by four new properties, one new oracle, three new fixture rows, a fixture hazard, a §G-2
softness entry and a restated §G-4; F-02 (Low) is closed by a §Scope re-grounding that now names
versions **re-hashed on disk** rather than taken from the dispatch. Nothing I approved in v2 was
broken: I checked the two statements most exposed to this change — PROP-REST-09's byte-equality with
the pre-A6 halt literal and the shared Pre-A6 baseline fixture — and both are untouched, because the
upstream mechanism routes the notice through `notices` rather than through the halt reason string.

**Re-grounding first (DEC-ERR-03).** I re-hashed all five upstream documents on disk. REQ is
unchanged at `f97f4f66…` (**v1.16**) — the version my F-01 was measured against. The other four have
all moved since my v3 anchors, and moved *toward* this document: FSPEC `91ef2557…` → `d602c440…`
(**v1.7**), TSPEC `3fa21acf…` → `1f6ea486…`, DECISIONS `ef59893d…` → `dc7a8d65…`, PLAN `f7de7fcb…`
→ `c843cb4f…` (**v1.13**, confirmed at its changelog's last row). The document's §Scope names exactly
these five hashes, so its grounding claim is checkable and checks out.

**Q-01 from v3 is answered, and answered the way that costs least.** I asked whether PROPERTIES
should land the property now and route the FSPEC/TSPEC gap as a §G-3 erratum, or wait for an
FSPEC-first cascade. At HEAD the cascade has already landed upstream, so the question is moot and
§G-3 correctly records "nothing new routed, one cascade closed by absorption" rather than re-raising
it (which would have been DEC-ERR-01's anti-pattern). Verified on disk: FSPEC carries `AT-06-4b`
(`FSPEC-…md:479`) and its v1.7 changelog states BR-14's co-location clause and AT-06-4's third
conjunct (`:14`); TSPEC carries the `snapshotRef` field in the halt-fields type
(`TSPEC-…md:867`) and the `renderSnapshotOverwriteNotice(snapshotRef)` carrier row
(`TSPEC-…md:1428`); PLAN v1.13's A6-18 owns the seam-side arm, the `snapshotRef` field, the helper
and the `toHaveLength(2)` → `3` widening in its green step. Q-02 (DECISIONS moving outside the
stated delta) is likewise absorbed: I re-read DEC-A6-03 at HEAD and nothing PROP-REST-07 or
PROP-REST-08 leans on has moved.

**What I checked, and what I did not.** Per the delta protocol I scanned only the changed sections —
the changelog row, §Scope, "Where the tests live", PROP-REST-08, PROP-REC-05, the four new
PROP-REC-08…-11 rows, Oracle O-J, the falsifiability close, three fixture rows plus one new hazard
and the "one string deliberately not on that list" paragraph, C-1's AC-6.3 and AC-5.3 rows, C-2, C-3,
§G-2, §G-3 and §G-4. Settled properties, oracles and fixtures outside that set were not re-opened.
One new finding, Low, is in §Findings; it is a count that the round's own edit left behind.

## Properties

_pending_

## Oracles

_pending_

## Fixtures

_pending_

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_
