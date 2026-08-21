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

**No existing oracle is falsified by the REQ delta, and none of the nine needs restating.** I walked
O-A…O-H against REQ v1.16 and every quantity they pin derives from clauses the erratum did not touch.
Two are worth naming because they sit closest to the changed AC:

- **O-C (preservation oracles).** Its two transcribed conjuncts — the map's *domain* (tracked plus
  non-ignored untracked, ignored excluded on both sides) and its *observation point* (immediately
  after restoration, before the AC-6.1 / AC-6.2 / AC-5.2 carriers) — are transcriptions of **AC-5.1**,
  which reads at v1.16 exactly as it read at v1.15. I diffed the AC's text, not just its id: the
  erratum's `@@` hunks are at the header block and AC-6.3 only. O-C stands as approved.
- **Oracle G's capture-failure `diagnosis` literal** (`snapshot capture failed
  (snapshot-unavailable); no repair proposed and none applied`) is TSPEC §4.5's, and TSPEC is
  unchanged. AC-6.3's new conjunct does **not** reach into it: on the capture-failure path there is no
  capture to point at, so no warning is owed. The literal stays a complete transcription, not a
  now-partial one. This is the distinction that keeps F-01 a *missing property* rather than a
  *falsified oracle*.

**What the missing property needs, oracle-side, and what would make it vacuous.** Since F-01 asks for
a new assertion, I state the oracle hazard here so the follow-up round does not have to rediscover it
— the same service §Oracles performs for the other nine:

- **The wrong unit is "the report object contains the substring `overwrite`".** A containment check
  over the whole report passes when the warning is emitted on a channel the operator never sees at
  halt, which is precisely what REQ's *"in the same place"* forbids. The unit is the **same
  halt-report surface that carries the capture pointer** — the field PROP-REC-05 already pins for the
  diagnosis and root-cause class.
- **The positive half must be paired with the conditional negative.** A halt whose run took no
  capture (PROP-REST-08's E-34 fixture, `captureTreeSnapshot` returning `null`) must assert the
  warning is **absent** — otherwise an implementation that warns unconditionally, on halts where
  there is nothing to preserve, passes. REQ's trigger is conditional; the oracle must discriminate
  both arms or it does not test the criterion as written.
- **Do not pin the remedy wording.** DECISIONS' *copy the ref before re-running a halted feature* is a
  documented remedy, not a REQ obligation, and the ref name is TSPEC's (O-1). An oracle transcribing
  either mints a red test against a spec-following implementation — the failure mode round v1.4 fixed
  in PROP-ENV-13 and hazard 1 warns about in §Fixtures.

## Fixtures

**The REQ delta obliges no new fixture, and invalidates none.** Both hazards stand exactly as
approved: hazard 1's mutation-fixture vocabulary warning derives from TSPEC §5.2 (unchanged), and
hazard 2's four-file real-repo composition derives from FSPEC BR-9 / AT-05-1 / AT-05-2 and REQ AC-5.1
— all four unchanged at v1.16. The `.gitignore`d file is still asserted **present, and only present**;
the non-ignored untracked file still **absent**; the generated output is still PROP-REST-02's
discriminator. Nothing in the erratum touches the restoration domain.

**The fixture F-01's missing property needs already exists — twice over, and neither needs editing.**
This matters for sizing the follow-up: the gap is one property row plus one matrix cell, not new test
infrastructure.

- The **recording `_git` double** already records `update-ref` targets, which is where the capture the
  warning refers to becomes observable — PROP-REST-07 and PROP-REST-08 both drive it today.
- The **capture-failure arm** (`captureTreeSnapshot` returning `null`) is already fixtured for
  PROP-REST-08, and is exactly the negative control the §Oracles note above asks for. The conditional
  arm is therefore free.
- The **Pre-A6 baseline** fixture already captures the shipped halt reason string, which is the
  surface the warning must travel on; PROP-SEAM-03/-04/-05, PROP-REST-09 and PROP-GATE-05 read it.

**One thing the follow-up must not do to §Fixtures.** Do not add a fixture row pinning the ref name
or the warning's phrasing as a verbatim string. The §"Verbatim-string discipline" list is scoped to
strings that appear in a *normative* document — the four class names, the eight refusal reasons, the
five exclusion ids, Oracle G's diagnosis sentence, the ref pattern. REQ v1.16 states an
operator-visible **outcome** and explicitly leaves the capture's name and storage form to TSPEC (O-1);
there is no normative wording to transcribe, so adding one would manufacture a literal the spec does
not own and put this document back in the position round v1.4 spent its budget escaping.

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ v1.16's AC-6.3 conjunct is unlanded in **every** downstream artifact, not only here: FSPEC BR-14 and AT-06-4 still stop at "diagnosis and root-cause class", and TSPEC §4.5's halt fields carry no operator-warning field. Should PROPERTIES land its property now, traced to `AC-6.3, DEC-A6-03` alone with the FSPEC/TSPEC gap routed as a §G-3 erratum item (the shape round v1.4 used for PROP-ENV-13's run-level conjuncts), or should the cascade be resolved FSPEC-first so the property can trace an AT? Sizing is the same either way; the ordering is the orchestrator's call. |
| Q-02 | DECISIONS moved from my v2 approval anchor (`84deee10…`) to the hash this dispatch names (`ef59893d…`), outside the delta this confirmation was scoped to. I re-read DEC-A6-03 at HEAD and found nothing PROP-REST-07 or PROP-REST-08 leans on changed, so I raise no finding — but was that move reviewed on its own cascade, or does it still owe one? |

## Positive Observations

- **Everything except the new conjunct still holds, and holds for checkable reasons.** I re-read every
  REQ clause this document transcribes — AC-5.1's domain and observation point, AC-5.2's unchanged
  halt, AC-6.1's record obligation, AC-6.2's escalation entry, AC-6.4's honest limit — against v1.16
  byte for byte. Not one moved. A document that cites upstream this precisely is one an erratum can be
  measured against in an afternoon rather than re-derived.
- **The one gap is a gap of addition, not of corruption.** No property became false, no oracle became
  vacuous, no fixture became wrong. That is the good case for a cascade: the delta added an
  obligation, and the document owes one row rather than a re-derivation.
- **PROP-REST-08's negative space is what makes the fix cheap.** Because the capture-failure arm was
  already property-covered and already fixtured, the conditional half of the new criterion — the case
  where no warning is owed — needs no new infrastructure at all. The v1.4 round's decision to give
  E-34 a real property home, rather than a matrix assertion, is paying off in a round nobody
  anticipated.
- **§G-3 is the right-shaped instrument, and it already exists.** This document has a standing,
  exercised convention for "the conjunct is real, the downstream home is not decided yet: keep the
  assertion, route the choice". That is precisely what Q-01 needs, so the follow-up round has a
  pattern to follow rather than a precedent to set.

## Recommendation

**Needs revision** — one High finding.

Exactly what must change, and nothing beyond it:

1. **Add one property** covering REQ v1.16 AC-6.3's second sentence: where the halt report points the
   operator at a captured pre-A6 tree state, the same halt-report surface also warns that re-running
   the feature overwrites that capture. Conditional trigger, paired with the E-34 negative arm.
   Traces `AC-6.3, DEC-A6-03` (see Q-01 on whether an FSPEC AT should exist first). Level and PLAN
   home: the halt-report surface is PROP-REC-05's, so `A6-15` is the natural home — se-author's call.
2. **Update C-1's AC-6.3 row** to name the new property alongside `PROP-REC-05, PROP-REST-08`.
3. **Bump §Scope's REQ citation** from v1.15 to v1.16 and record the cascade in the changelog.

Nothing else in the document is in scope for this round. I re-checked the rest against REQ at HEAD
and it is unchanged; do not re-open settled properties, oracles or fixtures.

## Delta-Confirmation Findings

## Verdict
