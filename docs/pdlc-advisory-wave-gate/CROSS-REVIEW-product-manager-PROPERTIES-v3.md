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

### AC-6.3's new conjunct has no property (F-01)

C-1's row for AC-6.3 reads `PROP-REC-05, PROP-REST-08`. Measured against REQ v1.16, neither reaches
the new clause:

- **PROP-REC-05** asserts *"the halt report must carry the diagnosis and the root-cause class in its
  `advisory` fields — not only the advisory record file"*. That is AC-6.3's **first** sentence,
  exactly, and it remains correct. It says nothing about a captured pre-A6 tree state and nothing
  about re-running.
- **PROP-REST-08** is the capture-**failure** observable: `captureTreeSnapshot` returns `null`, so no
  capture exists. It is the one case in which AC-6.3's new conjunct is vacuous by construction — the
  halt report cannot point the operator at a capture that was never taken. It cannot discharge the
  conjunct; it is its negative space.
- **PROP-REST-07** is the closest neighbour and still not it: it asserts the *ref-naming* consequence
  of DEC-A6-03 (two red waves write `{refs/pdlc/a6-snapshot-1, refs/pdlc/a6-snapshot-2}`, two
  distinct targets). It pins what the implementation writes to git, never what the operator is told.

So the AC-6.3 row is now under-covered: half the criterion is asserted, half is not asserted
anywhere. A conforming implementation can emit a halt report that names `refs/pdlc/a6-snapshot-1`,
say nothing about the next run destroying it, and pass every property in this document. That is
precisely the operator loss REQ v1.16 was written to prevent (US-02: *my turn starts from a
diagnosis*), and it is a **P1** requirement — REQ-AWG-06 is P1 — so I file it High rather than
recording it as a nit. The gap is in this document's coverage, not in any property's correctness: no
existing statement became false, one statement is missing.

### What the missing property has to assert, and what it must not

Written from the product lens only — the mechanism is TSPEC's (REQ O-1), and the changelog for v1.16
is explicit that *"the capture's name and storage form remain TSPEC's"*:

- **Trigger condition, faithfully:** *where the halt report points the operator at a captured pre-A6
  tree state*. Conditional, not unconditional — a halt with no capture (PROP-REST-08's E-34) owes no
  warning, and a property that asserted the warning on every halt would over-assert REQ and mint a
  red test against a spec-following implementation. That is the same failure mode this document's own
  v1.4 round corrected in PROP-ENV-13's `attempts` conjunct; the fix should not re-introduce it.
- **Co-location, faithfully:** *in the same place*. REQ does not merely require the warning to exist
  somewhere; it requires it where the operator is already looking. An assertion satisfied by a
  sentence in the advisory record file, or in a `notes` channel the halt path does not print, is a
  narrowing of the criterion. The oracle should assert the warning travels on the same halt-report
  surface that carries the capture pointer — the surface PROP-REC-05 already pins.
- **Content, minimally:** that re-running this feature overwrites that capture. Not the remedy
  wording (DECISIONS' *copy the ref before re-running* is a documented remedy, not a REQ obligation),
  not the ref name, not a timestamp.

### One upstream consequence the fix cannot absorb (Q-01)

I checked whether the property could trace an existing FSPEC acceptance test. It cannot: **FSPEC is
unchanged at `91ef2557…`**, and its two relevant statements stop where REQ v1.15 stopped —
**BR-14** reads *"The halt report carries the diagnosis and its root-cause class"*, and **AT-06-4**'s
*Then* clause is *"it carries the diagnosis and its root-cause class"*, with no capture-pointer or
overwrite clause in either. TSPEC §4.5's halt fields likewise carry `rootCause`/`diagnosis`/
`repairApplied`/`repairPaths` and no operator-warning field. So REQ v1.16's obligation is currently
unlanded in **every** downstream artifact, PROPERTIES included. This document can still carry a
property traced to `AC-6.3, DEC-A6-03` alone and route the FSPEC/TSPEC gap as a §G-3 erratum item —
that is exactly what §G-3 exists for, and what round v1.4 did for PROP-ENV-13's run-level conjuncts
rather than narrowing them away. Whether the cascade should instead be resolved FSPEC-first is the
orchestrator's call, not mine; Q-01 records it.

## Oracles

## Fixtures

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
