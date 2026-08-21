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

The testability question for a cascade round: does any AT become unwritable or silently false-green
under REQ v1.16, and does every REQ clause still land on at least one AT?

| AT | Leans on | Under REQ v1.16 |
|---|---|---|
| **AT-06-4** | BR-14, AC-6.3 | **Under-specified.** *Then* reads "the report carries the diagnosis and the root-cause class" — full stop. AC-6.3 now has two obligations and this AT asserts one. A run that omits the overwrite warning is GREEN here. This is the concrete false-green the delta opens. |
| AT-06-1 / -06-2 / -06-3 / -06-5 / -06-6 | AC-6.1, AC-6.2, AC-6.4, E-29, E-30 | Unaffected in oracle content; AT-06-6 inherits E-30's narrowed enumeration (F-02) as a spec-side ambiguity, not a broken assertion. |
| AT-05-1 / -05-2 / -05-3 / -05-4 | AC-5.1, BR-9, BR-10 | Unchanged; confirmed in v3 against REQ v1.15, untouched by v1.16. |
| AT-01-x, AT-02-x, AT-03-x, AT-04-x, AT-07-x | AC-1.x … AC-4.x, NFR-1 | Untouched by the delta; not re-reviewed. |

**The AT the delta requires, stated so it can be written today.** *Who:* an operator reading a halt
report. *Given* a halt following an A6 escalation in which a pre-A6 tree state **was** captured.
*When* the halt report is produced. *Then* three positive conjuncts on that one report: (1) it carries
the diagnosis and root-cause class; (2) it names the captured pre-A6 tree state; (3) **the same
report** states that re-running this feature overwrites that capture. Plus the negative companion, on
the E-34 fixture (capture failed): the report carries diagnosis and class and names no capture and no
overwrite warning — which is what makes conjunct (3) falsifiable rather than a string that could be
printed unconditionally.

Two oracle notes for whoever writes it:

- **Assert on the artifact, not the channel.** The oracle must read the halt report itself. Asserting
  "the warning was emitted somewhere in run output" would pass a split-channel implementation and
  defeat AC-6.3's "in the same place".
- **Do not pin the capture's name in the FSPEC-level AT.** The ref name is O-1/TSPEC's (DEC-A6-03 owns
  `refs/pdlc/a6-snapshot-{waveNum}`). The FSPEC-level oracle asserts co-location and the presence of
  the overwrite statement; the TSPEC-level test may pin the literal.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | Does the overwrite warning belong in the halt report **only**, or also in the advisory record entry BR-13 mandates? REQ AC-6.3 binds the halt report and says nothing about the record; I read that as deliberate (the record is read after the fact, the warning is actionable before the next run). Confirming it in BR-14's amendment stops a later reviewer re-raising it. |
| Q-02 | Is the warning expected on **every** halt that names a capture, or only on halts following an A6 *escalation*? AC-6.3's opening clause is "given the pipeline halts after an A6 escalation", but E-22's post-gate-halt branch can also end a run with a capture in existence. Whichever answer, state it in BR-14 so the E-22 fixture knows what to assert. |
| Q-03 | §7.1 O-1 currently owns "the point at which the pre-A6 tree state is captured" and its failure modes. Should O-1's "This FSPEC states" column gain the report-side obligation, so the TSPEC author sees the outcome the mechanism must make expressible (a capture with a printable identity)? Non-gating either way; F-01's edit is sufficient without it. |

## Positive Observations

- **The upstream erratum is well-shaped and stays at requirements altitude.** AC-6.3's new sentence
  states an operator-visible outcome and explicitly leaves the capture's name and storage form to O-1.
  That is exactly the split that makes a black-box AT writable at FSPEC level and a literal-pinning
  test writable at TSPEC level — no obligation moved, and the FSPEC edit it implies is one sentence
  plus one AT.
- **BR-14 already names AC-6.3 as an anchor**, so the gap is a missing clause inside an existing rule,
  not a missing rule. There is no new rule number, no renumbering, and no knock-on to BR-9/BR-10.
- **E-34 already exists and is precisely the negative arm** the new AT needs. The falsifying companion
  fixture is available in the spec today; it only needs to be pointed at.
- **The cascade caught a real, testable defect rather than a version-token nit.** Everything the two
  prior erratum rounds added (AC-5.1's observation point, ignored-path exclusion, failed-capture
  outcome, the `c8aa22a4`/`11420461` base pins) was already present in FSPEC v1.6. This round is the
  first where the compression is genuinely behind its source — which is the case this confirmation
  protocol exists for.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | REQ v1.16's AC-6.3 gained a second obligation — where the halt report points at a captured pre-A6 tree state, the same report warns that re-running the feature overwrites it (DEC-A6-03). FSPEC compresses none of it: BR-14 stops at "diagnosis and its root-cause class", §3 step 10 lists two report contents, and AT-06-4's *Then* asserts only those two, so an implementation shipping the pointer without the warning is green at FSPEC level while violating REQ. Fix: one clause on BR-14 (pointer and warning co-located in one artifact; capture's name stays O-1's), the conditional arm named on E-34, and AT-06-4 extended to three positive conjuncts with the E-34 no-capture negative companion. | §4 BR-14 / §3 step 10 / §6.6 AT-06-4 |
| F-02 | Medium | delta | local | E-30 re-lists BR-14's halt-report contents as "the diagnosis and root-cause class". Once BR-14 carries the overwrite warning, this row silently narrows AC-6.3 on the escalation-log-write-failure path, and AT-06-6 is written from it. Fix in the same edit: refer to "BR-14's halt-report contents" instead of re-enumerating. | §5.5 E-30 (and AT-06-6) |
| F-03 | Low | inherited | nonlocal | §2's preamble still pins upstream as `REQ-pdlc-advisory-wave-gate` v1.13; REQ is now v1.16. Individual traces still resolve — a stale version token, not a broken citation. Carried from v3 F-01, now one version staler. | §2 Linked Requirements, preamble |
| F-04 | Low | inherited | nonlocal | BR-9 excludes "the record and escalation writes … both carriers"; AC-5.1 names three excluded carriers (AC-6.1's record append, AC-6.2's escalation-log append, AC-5.2's M-WG-7 queue-row write). E-23 covers the third, so this is an enumerative gap at the rule site AT-05-1 cites, not a coverage hole. Carried from v3 F-02. | §4 BR-9, observation point |

FINDING: High | delta | local | §4 BR-14 / §3 step 10 / §6.6 AT-06-4 | REQ v1.16 AC-6.3 now requires the halt report to warn, in the same place it names a captured pre-A6 tree state, that re-running the feature overwrites that capture (DEC-A6-03); FSPEC states no such rule, no edge-case arm, and no AT, so AT-06-4 green-lights an implementation that omits the warning — bounded fix: one BR-14 clause, the E-34 negative arm, and a three-conjunct AT-06-4 with its no-capture companion
FINDING: Medium | delta | local | §5.5 E-30 | E-30 re-enumerates the halt report as carrying "BR-14's diagnosis and root-cause class", which narrows the amended AC-6.3 obligation on the degraded-carrier path and is the text AT-06-6 is written from; refer to BR-14's contents rather than re-listing them
FINDING: Low | inherited | nonlocal | §2 Linked Requirements, preamble | FSPEC pins upstream REQ v1.13 while REQ is now v1.16; traces still resolve, version token stale
FINDING: Low | inherited | nonlocal | §4 BR-9, observation point | BR-9 names two excluded record carriers ("both") where AC-5.1 names three (record append, escalation-log append, M-WG-7 queue-row write); E-23 covers the third, so the gap is enumerative rather than a coverage hole

## Recommendation

**Needs revision.** FSPEC v1.6 no longer holds as approved against REQ v1.16. One High finding, and
it is the finding this confirmation exists to catch: the erratum landed a new operator-visible
obligation in AC-6.3 and FSPEC compresses no part of it — no rule, no branch, no assertion. The
concrete failure mode is a false green: a halt report that names the captured pre-A6 tree state and
never warns the operator that the ordinary next action destroys it passes every FSPEC rule and
AT-06-4 as written.

The revision is bounded and reopens nothing:

1. **BR-14** — add the one-sentence obligation (pointer and warning co-located in one artifact;
   capture's name and storage form remain O-1's).
2. **§3 step 10** — state the two arms so the branch is testable: capture-exists (diagnosis + class +
   overwrite warning) and no-capture / E-34 (diagnosis + class, no warning).
3. **E-34** — name the negative arm explicitly; **E-30** — stop re-enumerating BR-14's contents (F-02).
4. **AT-06-4** — three positive conjuncts, plus the E-34 no-capture negative companion that makes the
   third conjunct falsifiable.

The two Low findings (F-03, F-04) are inherited, non-gating, and can ride along in the same edit or
wait for the next authoring round. v2's open Mediums and Low remain inherited and non-gating.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 2}
