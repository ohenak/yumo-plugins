# Cross-Review: software-engineer — PROPERTIES (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 1 (delta confirmation, round v1)
**Round type:** delta confirmation — previously approved, erratum edit landed, re-measured against upstream HEAD (DEC-ERR-03)

## Overview

**Question answered.** The dispatch reports every routed item as ABSORBED against upstream HEAD, so
nothing was owed as an edit. My scope is therefore the whole of DEC-ERR-03: is this PROPERTIES still
a faithful compression of REQ/FSPEC/TSPEC/DECISIONS/PLAN *at the versions named in the dispatch*?

**Grounding verified.** All five upstream digests in the dispatch match the working tree byte for
byte (`shasum -a 256`): REQ `c62cfc35…`, FSPEC `91ef2557…`, TSPEC `3fa21acf…`, DECISIONS
`84deee10…`, PLAN `f7de7fcb…`. The document's Scope line now cites REQ v1.15, FSPEC v1.6
(E-01…E-34, AT-01-1…AT-07-5) and TSPEC v1.11; E-34 exists in FSPEC at HEAD, the AT ceiling is
AT-07-5, the AT count is forty-seven, and NFR-1…NFR-6 and AC-1.1…AC-6.4 are the live id ranges. The
changelog's *"raised item: absorbed, no edit owed"* claim about the lineage `Downstream` row is true
as stated: REQ line 12 reads `FSPEC, TSPEC, PLAN, PROPERTIES (all in this directory)`, this
document's own `Downstream` row reads `IMPL` and its tests, and the single `pdlc-engineering-loop`
mention here is §G-1's owner attribution, not a lineage row.

**Delta reviewed.** `git diff ca06395b..HEAD` on the document: +55/−20 across eight commits
(`fa5d48b1` … `1e297117`) touching the changelog, Scope, §C (PROP-ENV-13, new), §E (PROP-REST-01,
-03 restated; PROP-REST-10, new), Oracle O-C and its new paragraph, the falsifiability close,
Fixtures hazard 2, the coverage matrix, the AT table, the PLAN-task table, and §G-2.

**Bottom line.** The OQ-7 absorption is real, correctly directed, and correctly transcribed almost
everywhere: PROP-REST-01/-03/-10, O-C and Fixtures hazard 2 all read back cleanly against FSPEC BR-9
(v1.6), REQ AC-5.1 (v1.15) and TSPEC §5.2 cases 1–5. One conjunct in the newly minted PROP-ENV-13
contradicts both FSPEC §3.3's refusal row and the shipped driver, and it is a transcribed expected
value that will mint a red test — that is the one blocking item (F-01).

## Properties

_(pending)_

## Oracles

_(pending)_

## Fixtures

_(pending)_

## Recommendation

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
