# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 3 (upstream-cascade confirmation — REQ moved after approval)

## Overview

**Question answered.** PROPERTIES' own bytes have not changed since my v2 approval
(`REVIEWED-COMMIT: 32a459ef`). REQ has: erratum commit `30d8bf7b` moved it v1.15 → **v1.16**
(`sha256:c62cfc35…` → `sha256:f97f4f66…`). The single question is whether this PROPERTIES is still a
faithful compression of REQ as it now stands. **It is not, on one point.** REQ v1.16 lands a new
operator-facing conjunct in **AC-6.3** and no property in this document asserts it, so a P1
acceptance criterion is now partly uncovered by the artifact whose whole job is AC → property
traceability.

**Re-grounding first (DEC-ERR-03).** I re-hashed all five upstream documents on disk against the
hashes this dispatch names. FSPEC (`91ef2557…`), TSPEC (`3fa21acf…`) and PLAN (`f7de7fcb…`) are byte
for byte what I approved against in v2. REQ is the named delta. **DECISIONS also moved** since my v2
anchor (`84deee10…` → `ef59893d…`, dispatch-named) — outside this dispatch's stated delta, so I read
DEC-A6-03 at HEAD directly rather than trusting my v2 reading; its §"What follows from DEC-A6-03"
still says what the v2 round relied on (run-scoped promise, overwrite costs inspectability not
content, documented remedy is *copy the ref before re-running*). Nothing PROP-REST-07 or
PROP-REST-08 leans on moved underneath them.

**The delta measured.** `git show 30d8bf7b` on REQ: **12 insertions, 2 deletions**, at exactly two
sites — the status row / v1.16 changelog block, and **AC-6.3** in §6 (REQ-AWG-06, **P1**). The AC's
existing sentence (halt report carries the diagnosis and the root-cause class) is untouched. Appended
to it, verbatim:

> Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the
> same place, that re-running this feature overwrites that capture — so an operator who intends to
> inspect it preserves it first, rather than losing it to the ordinary next action after a halt
> (DEC-A6-03).

That is a new operator-visible outcome, not a restatement: before v1.16, DEC-A6-03's overwrite hazard
lived only in DECISIONS as a "documented operator remedy" with no requirement obliging any artifact
to show it to the operator at the moment it matters. REQ now obliges the halt report to carry it.

**What this confirmation therefore checks.** Two things, and only two: (1) does any property assert
the new conjunct, and does C-1's AC-6.3 row still discharge that AC; (2) does anything else this
document cites into REQ still read the way it quotes it. On (2) the answer is clean — I re-read
AC-5.1, AC-5.2, AC-6.1, AC-6.2 and AC-6.4 at v1.16 and every clause PROP-REST-01, -03, -06, -08, -10
and PROP-REC-01…-07 transcribes is unchanged byte for byte. On (1) it is not; see §Properties.

## Properties

## Oracles

## Fixtures

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
