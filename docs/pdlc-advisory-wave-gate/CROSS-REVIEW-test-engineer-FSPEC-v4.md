# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.6, bytes unchanged)
**Upstream under confirmation:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md` (sha256:f97f4f66…, v1.16)
**Date:** 2026-08-20
**Iteration:** 4 (upstream-cascade confirmation)

## Overview

**Upstream-cascade confirmation, not a re-review.** FSPEC v1.6 is byte-identical since its approval.
REQ moved to v1.16 in an erratum round (`30d8bf7b`, sha256:f97f4f66…) after that approval was
recorded, so the approval was taken against a REQ version that no longer exists. The single question
answered here: **is FSPEC v1.6 still a faithful compression of REQ as it now stands?**

**Method.** Re-read `CROSS-REVIEW-test-engineer-FSPEC-v3.md` (the previous cascade round, taken
against REQ v1.15); ran `git show 30d8bf7b -- …/REQ-pdlc-advisory-wave-gate.md` for the full
upstream delta; then re-read, at their current version, the REQ clauses this FSPEC leans on — the
whole of REQ-AWG-06, and AC-6.3 in particular — against the FSPEC sites that compress them (§3 step
10, BR-14, §5.5 E-30, AT-06-4, §7.1 O-1). Nothing settled in v1/v2/v3 is re-litigated.

**Answer: no — one clause of the new REQ text has no FSPEC compression at all.** The delta is small
and single-item, but it is not a no-op downstream: REQ v1.16's AC-6.3 gained a second operator-visible
obligation (the halt report must warn that re-running the feature overwrites the captured pre-A6 tree
state, DEC-A6-03) and FSPEC carries no rule, no edge-case row, and no acceptance test for it. F-01
below, High, tagged `delta`/`local` — the gap sits exactly in the section AC-6.3 maps to (BR-14 /
AT-06-4), so it is a bounded FSPEC edit, not a reopened decision.

## Linked Requirements

Citation fidelity, REQ → FSPEC, at REQ v1.16:

| REQ clause the FSPEC leans on | REQ v1.16 text | FSPEC compression site | Still faithful? |
|---|---|---|---|
| AC-6.3 sentence 1 (diagnosis + root-cause class on the halt path) | Unchanged by this erratum | §3 step 10, BR-14, AT-06-4 | Yes — verbatim in substance |
| **AC-6.3 sentence 2 (new)** — where the halt report points the operator at a captured pre-A6 tree state, it warns *in the same place* that re-running this feature overwrites that capture (DEC-A6-03) | Added by v1.16 | **None** — `grep -n "overwrit\|snapshot"` over FSPEC returns no hit; BR-14 stops at "diagnosis and its root-cause class" | **No — F-01** |
| AC-6.1 / AC-6.2 (record and escalation-log appends) | Unchanged | BR-13, AT-06-1, AT-06-3 | Yes |
| AC-6.4 + its honest limit | Unchanged | E-31, AT-06-5 | Yes |
| AC-5.1 / AC-5.2 / R-5 / AC-1.1 | Unchanged since v1.15 | BR-9, BR-10, E-23, E-34, §2 | Yes — as confirmed in v3 |
| O-1 (capture point and mechanism stay TSPEC's) | Unchanged; v1.16 changelog re-affirms it | §7.1 O-1 | Yes — and the new AC-6.3 clause respects it (outcome only, no ref name) |

**§2 version token.** FSPEC §2's preamble still pins `REQ-pdlc-advisory-wave-gate` **v1.13**; upstream
is now **v1.16**, two erratum rounds further on. Every individual trace still resolves, so this is a
stale token and not a broken citation — F-03, Low, `inherited`/`nonlocal` (v3's F-01, still open, now
one version staler).

## Behavioral Flow

The delta touches exactly one step of §3's ten-step flow: **step 10 (Halt, unchanged)**. Step 10
today reads: the pipeline halts with the same reason it emits today (M-WG-3), writes the same
`halted` queue row (M-WG-7), and "the halt report additionally carries the diagnosis and its
root-cause class". Under REQ v1.16 that enumeration is now **incomplete for the branch where a
capture exists**: the report must additionally warn, in the same place, that the ordinary next action
after a halt — re-running the feature — destroys the capture the report just pointed at.

Two flow-level consequences a test author would hit:

1. **No branch is written down.** AC-6.3 sentence 2 is conditional ("where the halt report points the
   operator at a captured pre-A6 tree state"), which makes it a *decision branch* in the halt step —
   and this lens requires every decision branch to be explicit so each can be a separate test. FSPEC
   step 10 has one arm today. It needs two: capture-exists (diagnosis + class + overwrite warning) and
   no-capture-exists / E-34 (diagnosis + class, nothing to warn about, because nothing was captured).
   Without the second arm stated, a fixture author cannot tell whether the warning is unconditional
   (and therefore a bug when E-34 fired) or conditional.
2. **The co-location requirement is the testable part.** "In the same place" is what makes the clause
   verifiable at all: the oracle is *one* artifact — the halt report — containing both the pointer and
   the warning. A design that emits the warning to a different channel (the run report's notice
   channel, say, as E-30 uses) would satisfy a loosely-worded FSPEC and violate REQ. Step 10 is where
   that co-location has to be pinned, or the AT cannot falsify the split-channel implementation.

Nothing else in §3 changes truth value under REQ v1.16. Steps 1–9, §3.1, §3.2 and the §3.3 table rows
are untouched by the delta and are not re-reviewed.

## Business Rules

**BR-14 is the rule site the delta lands on, and it does not yet carry the delta.** BR-14 —
"Escalation adds information and never changes control flow (AC-5.2, **AC-6.3**)" — names AC-6.3 as
one of its two upstream anchors, so it is the rule an implementer and a test author will both read
when asking "what must the halt report contain?". Its current last sentence stops at: *"The halt
report carries the diagnosis and its root-cause class, so the operator's turn starts with the
diagnosis on the halt path, not only in a file they must find."* REQ v1.16's AC-6.3 now says strictly
more than that, and BR-14 is the only place in FSPEC where the extra obligation could live without
inventing a new rule number.

Why this is High and not a citation nit:

- **A rule that does not state an obligation cannot be tested for it.** BR-14 as written is fully
  satisfied by a halt report with no overwrite warning. An implementation that ships the pre-A6
  capture pointer and no warning passes every FSPEC rule and every FSPEC AT while violating REQ
  AC-6.3 — the definition of a downstream compression gap, not a style issue.
- **The obligation is operator-visible, which is exactly the altitude FSPEC owns.** REQ deliberately
  states it as an outcome and leaves the capture's name and storage form to TSPEC O-1 (the v1.16
  changelog says so explicitly). So there is no altitude excuse for FSPEC to stay silent: the
  outcome-level clause is FSPEC's to compress, and O-1 continues to own the mechanism.
- **It is a positive-presence obligation.** The warning is a string that must be *present* in a named
  artifact — the cheapest kind of falsifiable oracle there is, and one BR-14 can state in a single
  clause.

**Suggested BR-14 amendment (one sentence, no decision reopened):** *"Where the halt report names a
captured pre-A6 tree state, the same report also states that re-running this feature overwrites that
capture; the pointer and the warning are carried by one artifact, not split across channels (AC-6.3,
DEC-A6-03). What the capture is called and how it is stored remain O-1's."*

**BR-9, BR-10, BR-13, BR-15, BR-16 unchanged in truth value.** The delta adds nothing about
restoration triggers, the observation point, or record-write semantics. v3's F-02 (BR-9 enumerates
two excluded record carriers where AC-5.1 names three, with E-23 covering the third) is untouched by
this edit and remains open — F-04 below, Low, `inherited`/`nonlocal`.

## Edge Cases and Error Scenarios

Three §5 rows sit in the delta's blast radius. None is falsified; one is left with an unnamed
companion branch.

**E-34 (the pre-A6 tree state cannot be captured at all).** This is the row that makes AC-6.3's new
clause *conditional* rather than universal: when capture fails, no repair is proposed, none is
applied, and there is no capture for the halt report to point at — so there is nothing to warn about
either. E-34 remains true under REQ v1.16, and it is the natural home for the negative arm: the halt
report in the E-34 branch carries the diagnosis and class and **no** overwrite warning, because it
names no capture. Stating that explicitly is what stops an implementer from emitting an unconditional
warning that lies (warning about a capture that was never taken). Folded into F-01; not a separate
finding.

**E-30 (the escalation log cannot be written).** E-30 already reasons carefully about *which carrier*
survives a write failure — "the halt report goes on carrying BR-14's diagnosis and root-cause class".
Once BR-14 grows the warning obligation, this sentence becomes an enumeration that needs to grow with
it, or E-30 silently narrows AC-6.3 on the degraded path. Cheap fix in the same edit: have E-30 refer
to "BR-14's halt-report contents" rather than re-listing two of three items. Recorded as F-02, Medium,
`delta`/`local` — a live desync between two spec sites that a test author reading E-30 alone would
implement to.

**E-22 (green re-gate, later post-gate check halts the wave anyway).** Untouched. This branch halts
with the wave's work uncommitted and no restoration trigger fired; whether a capture exists to warn
about here is a question the amended BR-14's conditional phrasing answers automatically ("where the
halt report names a captured pre-A6 tree state"), which is one more reason to state the obligation
conditionally rather than bolting it onto step 10's escalation arm only.

No new edge case is created by the delta, and no existing §5 row is made false by it.

## Acceptance Tests

## Open Questions

## Positive Observations

## Delta-Confirmation Findings

## Recommendation

## Verdict
