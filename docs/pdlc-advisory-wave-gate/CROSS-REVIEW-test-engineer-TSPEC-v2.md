# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md
**Round type:** upstream-cascade confirmation (TSPEC bytes unchanged; REQ moved v1.15 → v1.16)
**Upstream at this dispatch:** REQ sha256:f97f4f66…, FSPEC sha256:91ef2557…
**Prior round:** CROSS-REVIEW-test-engineer-TSPEC-v1.md (Approved with minor changes; REVIEWED-COMMIT 95d8d2e4; UPSTREAM-STATE REQ sha256:c62cfc35…, FSPEC sha256:91ef2557…)
**Date:** 2026-08-20
**Iteration:** 2

## Overview

This is a cascade confirmation, not a re-review. The TSPEC's own bytes are unchanged since
REVIEWED-COMMIT `95d8d2e4`, which my v1 round approved. What moved is REQ: an erratum round took it
from v1.15 to v1.16 after my approval was recorded, so the question here is the narrow one — is this
TSPEC still a faithful compression of REQ **as REQ now stands**?

**The delta.** `git diff e69cdecc..HEAD -- REQ` is 12 lines across two hunks: the status-table
version bump plus a v1.16 changelog paragraph, and four new lines inside **AC-6.3**. The substantive
edit is the AC-6.3 addendum, which lands DEC-A6-03's operator-facing halt-message obligation that had
been routed since round 5 and never landed:

> Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the
> same place, that re-running this feature overwrites that capture — so an operator who intends to
> inspect it preserves it first, rather than losing it to the ordinary next action after a halt
> (DEC-A6-03).

FSPEC is byte-identical to the version my v1 round recorded in UPSTREAM-STATE
(`sha256:91ef2557…`), so every TSPEC↔FSPEC binding I approved stands untouched and is not re-opened
here.

**The answer is no, and narrowly so.** AC-6.3 now carries a *new operator-visible conjunct* — a
warning sentence on the halt report — and this TSPEC has no design home and no oracle for it. The
overwrite hazard itself is thoroughly analysed in the document (§2.5, §6 OQ-2), but analysed as an
**accepted, record-only cost**, which is precisely the disposition REQ v1.16 supersedes. That is one
High, scoped to one paragraph of §4.5 and one row of §5.6; everything else in the document re-reads
clean against REQ v1.16.

## Architecture

**§2.5 "Restoration: the whole tree, one snapshot per wave" — the section the delta lands on.**
This is where the TSPEC reasons about the capture, its ref, and what an overwrite costs. Re-read
against REQ v1.16, its factual content is still correct and its mechanism is untouched by the
erratum: the ref stays `refs/pdlc/a6-snapshot-{waveNum}`, wave-scoped, dangling, unpushed, one per
wave. The delta does not contest any of that — it does not ask for a run discriminator, and it
explicitly leaves "the capture's name and storage form … TSPEC's (O-1)". O-1's obligation row (§2.4,
§3.5) therefore still discharges correctly.

What has changed underneath the section is the **status of its remedy sentence**. §2.5 ends the
overwrite paragraph with:

> An operator who wants a snapshot to survive the next run should copy the ref before re-running; a
> run-scoped discriminator in the name is recorded as the remedy if that ever proves too sharp an
> edge (§6 OQ-2, PM F-02).

At REQ v1.15 that was a complete disposition: the cost was accepted, and the remedy lived in the
design record. At REQ v1.16 it is no longer complete — the remedy is now required to reach the
operator **at halt time, in the halt report**, not only in a document the operator does not read
while staring at a red wave. DEC-A6-03's own "Known gap in the remedy's reach (PM F-05)" says this in
as many words, and closes on "This entry carries the gap until it lands." It has now landed in REQ.
The gap therefore stops being carried by DECISIONS and becomes a design obligation this TSPEC owes.

**Where the halt actually points at the capture.** The obligation's antecedent is satisfied here —
this is not a vacuous conditional. §2.5 states that "E-28's halt names the ref for the halting wave,
which is the difference between 'A6 left a tree it could neither repair nor restore' and 'A6 left a
tree, and here is the object name that has the original in it'", and DEC-A6-03's constraint
paragraph is blunter still: "The halt message must print the ref name". So the halt report *does*
point the operator at a captured pre-A6 tree state, AC-6.3's `Where…` clause fires, and the warning
conjunct is owed on that same message.

**Scope of the miss, stated honestly.** No mechanism in §2.5 is wrong, no ordering claim moved, and
the restoration oracle, the observation point and the one-snapshot-per-wave invariant — the parts of
this section my v1 round scrutinised hardest — are entirely unaffected. The miss is additive: a
sentence the halt must now carry, which the architecture section describes as an operator-side
convention rather than a machine-side requirement.

## Interfaces

**§3.5 `captureTreeSnapshot` / `restoreTreeSnapshot` (O-1) — unaffected.** The signatures, the
`refs/pdlc/a6-snapshot-{waveNum}` write, the `null`-on-`ok !== true` contract and the
`__isRevertFailure` tagging all sit below the level the erratum touches. REQ v1.16 states its new
requirement as an operator-visible outcome on the halt report and explicitly disclaims the storage
form, so nothing in §3.5 needs to move to satisfy it. I re-read this section only to confirm the
warning has no natural home here — it does not; the halt is raised at the call site and in the
driver's terminal catch, not inside the git helpers.

**§3.2 step 4 and the terminal halt path — where the sentence has to be produced.** The two halt
sites that can print the ref are (i) the restore-failure rethrow that reaches the Phase I halt
(§2.5, E-28, AT-05-5) and (ii) the A6-touched wave halt carrying §4.5's `fields`. The TSPEC is
precise about both call shapes — `throw haltError(formatUnskipViolations(...), { advisory: … })` for
the un-skip case, the driver's terminal catch rethrow for E-28 — which is what makes the gap
*implementable in a bounded edit* rather than a design reopening: one of these two sites already
prints the ref, and the addendum is a second sentence beside it.

**The message/field split is the constraint the fix has to respect.** §4.5's last row on the un-skip
halt pins it: "Message string | unchanged — `formatUnskipViolations`'s output is not rewritten. The
diagnosis travels in `fields`, never in the reason string, which is what lets AT-05-3's literal
comparison and AC-6.3 both hold." AT-05-3 asserts the halt reason string equals the **pre-A6
literal**, byte for byte. AC-6.3's new warning is operator-facing text, so a naïve fix that appends
it to the reason string reds AT-05-3 and breaks the byte-identity claim §2.3 and §5.2 both rest on.
The revision therefore has to say *which* slot carries the warning — a `fields` member, or the
E-28 restore-failure message which AT-05-5 asserts by naming rather than by literal equality — and
that choice determines which oracle can see it. This is a real interface question, not a wording
one, and it is the first thing the next TSPEC round should answer.

## Data Model

**§4.5 "What A6 writes, and where" — the primary site of the finding.** The halt-fields row reads:

> | Halt fields | `haltError`'s `fields` | `{rootCause, diagnosis, repairApplied, repairPaths}`, at the
> literal values named below | Every A6-touched halt: a non-resolved wave (AC-6.3), a
> capture-failure escalation (§2.5), **and** a post-gate un-skip halt on a wave A6 resolved |

Four fields, closed set, each with a transcribed literal value below. Measured against REQ v1.16's
AC-6.3 this row is now **incomplete**: the AC requires a fifth operator-visible element on the halt
report — the overwrite warning — and there is no field, no literal string, and no "and where" entry
for it. The section cites AC-6.3 twice (this row, and "AC-6.3 asks that an A6-touched halt carry a
diagnosis") and both citations are now partial readings of an AC that has grown a second clause.
This is the specific sense in which the document is no longer a faithful compression of its
upstream: it cites the AC and transcribes less than the AC says.

**The Snapshot ref row, read at REQ v1.16.** Its "When" cell says the ref is "one ref per wave,
**never overwritten by a later wave** (§2.5, PM F-03)". That claim is true as written and its
scope-limiting words are doing real work — but a reader of §4.5 alone, which is the section an
implementer transcribes from, sees a "never overwritten" promise with no adjacent note that the
*next run* does overwrite it. §2.5 carries the correction; §4.5 does not cross-reference it here.
Before the erratum that was a readability nit I did not raise. Now that the overwrite is the subject
of an operator-facing REQ obligation, the row is the place an implementer would look for the
warning's trigger condition and would not find it. Low, and it resolves with a clause.

**Nothing else in §4 moves.** §4.1's verdict trailer, §4.2's root-cause vocabulary, §4.3's per-run
state and §4.4's `nonNegativeInt` config are all untouched by the delta — I diffed the REQ hunk
against each and there is no contact. The capture-failure halt's four literal values (§4.5's inner
table) likewise stand: that path halts *before* a snapshot exists, so AC-6.3's `Where the halt report
points the operator at a captured pre-A6 tree state` antecedent is false there and the warning is
correctly absent. That the new obligation is conditional, and that the condition is already
mechanically distinguishable in this document, is what keeps the fix small.

## Test Strategy

This is my lens, and it is where the finding earns its severity: **at REQ v1.16 there is an
acceptance criterion no test in this TSPEC can fail.**

**§5.6's AT home table.** I walked every row that could plausibly host the warning:

| Row | Oracle as written | Can it see the warning? |
|---|---|---|
| AT-05-3 | halt reason string **equals** the pre-A6 literal, computed from the first pass's gate result | No — and it is actively hostile to a naïve fix: appending the warning to the reason string turns this equality oracle RED |
| AT-05-4 | green re-gate then un-skip halt: record entry **and halt report** state the retained repair and name its paths, via §4.5's new `fields` argument | No — its conjuncts are the repair's paths, not the capture's fate |
| AT-05-5 | restoration itself failing: `__isRevertFailure` rethrown, wave halts **naming the failed restoration**, no commit reached | No — "naming the failed restoration" is the E-28 conjunct; the ref name rides along in §2.5's prose but no conjunct asserts the overwrite warning |

So the AC's new clause has **zero** oracles. An implementation that never emits the warning passes
every test this TSPEC specifies — the definition of an unfalsifiable requirement, and exactly the
"write the test right now" failure: I cannot write the test, because the document does not say which
slot carries the string or what the string is.

**What the revision must supply for the AT to be writable.** Three things, all cheap:

1. **The slot.** A named `fields` member (e.g. `snapshotRef` plus a warning member) or a defined
   addition to the E-28 restore-failure message. §4.5's "diagnosis travels in `fields`, never in the
   reason string" rule points at `fields`, and `fields` is the choice that leaves AT-05-3's literal
   equality oracle untouched.
2. **The literal string.** §4.5's house style is transcribed literal values precisely so fixtures
   can assert them rather than compare against whatever the implementation emits (its own words, PM
   F-03 / TE F-18). The warning needs the same treatment — a fixed sentence, transcribed once.
3. **The AT conjunct.** One added positive conjunct on the A6-touched halt fixture that already runs
   in `advisoryWaveGate.test.js`: the halt report contains the ref name **and** the warning
   sentence. Both conjuncts positive — a `!= undefined` or "mentions the ref somewhere" oracle would
   be an absence-shaped proof of an operator-visible string and would false-green a truncated
   message.

**Falsifiability check on the proposed fix (Oracle-Falsifiability #5).** The new invariant needs its
own falsifying test in the same revision: delete the warning member from the halt fields and the
fixture must go RED. Stating the string as a literal is what makes that mutation check mechanical.

**Negative half worth pinning too.** The obligation is conditional, so the revision should also pin
the *absence* case that already exists: the capture-failure halt (§4.5's inner table) points at no
capture, so its four literal fields stay four — §5.5's capture-failure fixture already asserts them
by equality, and that equality assertion is the negative oracle for free, provided the revision does
not widen the field set unconditionally. If the warning member is added to *every* A6-touched halt
regardless of whether a snapshot exists, §5.5's transcribed fixture breaks and the AC is
over-implemented. Naming that boundary in §4.5 is part of the fix.

**Everything else in §5 re-reads clean.** §5.1's file map, §5.2's mechanical assertions (including
the two-red-wave set-equality `{a6-snapshot-1, a6-snapshot-2}` case and the ignored-path round-trip
whose ordering conjunct my v1 round praised), §5.3, §5.4's coverage floor and §5.5's prohibitions are
untouched by the REQ delta. I re-derived nothing there because nothing upstream moved under them.

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
