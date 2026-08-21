# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation, FSPEC leg)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4
**Round type:** upstream-cascade confirmation — TSPEC bytes unchanged, FSPEC moved
**Scope:** TSPEC measured against its upstream at HEAD (REQ `sha256:17e83bfc…`, FSPEC `sha256:9a6be7b5…`)

## Overview

**The question this round answers.** I approved TSPEC at v3 against FSPEC
`sha256:1c05f51…`. FSPEC has since taken a Phase-T erratum round and now stands at
`sha256:9a6be7b5…` (v1.2). My approval was therefore taken against a version of FSPEC that no
longer exists. The single question here is whether TSPEC — whose own bytes are unchanged
(`sha256:3cd713c0…`, identical to the hash my v3 approval anchor pinned) — is still a faithful
compression of FSPEC as it now stands.

**Answer: yes on substance, with three bookkeeping defects the cascade created.** The erratum
did not change any behaviour FSPEC specifies. It added one clause stating behaviour that was
previously unspecified, corrected one characterisation of the REQ, and moved a version cell. On
the one substantive point — what an operator-pointed run records — FSPEC's new clause ratifies
*exactly* the behaviour TSPEC had already ratified and routed the erratum for. No acceptance
criterion is narrowed, reinterpreted, broadened or dropped; no scope moves in either direction.

**The delta, in full.** Four hunks, `git diff 47717a08..HEAD -- FSPEC`:

| # | Hunk | What it changes | Reaches TSPEC? |
|---|---|---|---|
| 1 | Header `Version` cell `1.1 → 1.2` | Bookkeeping | §6.3 item 1 (label only) |
| 2 | §1 "derives entirely from `REQ…` v1.5" → **v1.7** | Re-grounding; no content claim moves | §6.3 item 1 |
| 3 | §3.4, **new paragraph**: "An operator-pointed run records exactly as any other run does." | Specifies what was unspecified | §2.5, §6.3 item 3 — **the substantive leg** |
| 4 | §7 OB-F1's trailing clause: REQ §10 "records BL-04 as discharged at FSPEC authoring" → "now records BL-04 as open and unmet in §5 and §10 (v1.7)" | Corrects a false claim about the REQ | §6.2 OB-F1, §6.3 item 2 |
| 5 | §7 changelog: new "Erratum, v1.2 (Phase T)" note | Provenance record | — |

**What I did.** Re-read my v3 cross-review; diffed FSPEC across the erratum; re-read FSPEC §3.4
and §7 at HEAD in full; then re-read every TSPEC passage that leans on them — §2.5, §2.6, §3.2,
§3.3, §4.1, §4.4, §6.2, §6.3 — and checked each against the current upstream text rather than
against the item list. I did not re-derive the eighteen AT oracles or the requirement→component
map, which the delta does not reach; my v2/v3 approval of those stands and is not re-litigated.

**Per DEC-ERR-03,** my scope is this TSPEC against upstream at HEAD, not the erratum item list.
The three findings below are all of that second kind: things TSPEC cites that FSPEC no longer
says. All are Medium or Low. None is a design-fidelity defect, and none is gating.

## Architecture

**The substantive leg: FSPEC §3.4's new clause, against TSPEC §2.5.**

This is the hunk that could have broken the approval, so I read both sides in full rather than
diffing summaries. FSPEC now says, in §3.4 immediately below the high-water paragraph:

> **An operator-pointed run records exactly as any other run does.** Recording follows what the
> run committed, not how its start point was chosen: when an explicit operator pointer is in
> force (§3.3) the run still records completed waves as it goes, in the same high-water form
> counted from the plan's first wave. So a later automatic invocation can resume above waves
> whose completion only the operator asserted. That is bounded by BR-10 — the first executed
> wave's gate verifies the whole tree — and the assertion is attributable, because the run that
> made it announced provenance `operator-set` (BR-07). No record content distinguishes the two
> provenances.

TSPEC §2.5 ratified this behaviour before FSPEC specified it:

> The write site is outside the `!explicitPointer` guard, so a run started at wave N by an
> operator pointer records `lastGreenWave = N` for a wave the *operator*, not the pipeline,
> asserted the predecessors of. The damage is bounded exactly as FSPEC BR-10 bounds it — the
> first executed wave's gate verifies the whole tree … Ratified as-is.

These agree clause for clause, and I checked each conjunct rather than the gist:

| FSPEC §3.4 conjunct | TSPEC position | Agrees? |
|---|---|---|
| Records "exactly as any other run does" | §2.5 item 1: the write is guarded by the **transport**, not by how `startWave` was chosen; the write site is outside `!explicitPointer` | Yes |
| "in the same high-water form counted from the plan's first wave" | §2.5 item 5: each write carries `lastGreenWave = waveNum`, the **plan-absolute** wave number | Yes |
| "a later automatic invocation can resume above waves whose completion only the operator asserted" | §2.5's ratification sentence states this consequence in the same terms | Yes |
| "bounded by BR-10 — the first executed wave's gate verifies the whole tree" | §2.5 cites BR-10 with the identical bound; §4.4 reasons from it again | Yes, verbatim bound |
| "attributable, because the run … announced provenance `operator-set` (BR-07)" | §2.4/§3.3: provenance is announced content in every announcing outcome; `RESUME_PROVENANCE` closed at two | Yes |
| "**No record content distinguishes the two provenances.**" | §2.5's closing paragraph: "the record carries no provenance of its own … the record's shape stays exactly the four-or-five fields of §4.1" | Yes — and this is the strongest agreement of the five |

That last row is the one worth naming. TSPEC did not merely happen to be compatible with the new
clause; it had pre-emptively argued, under PM Q-02, that the erratum it was raising must not be
read as asking for a persisted `provenance` field, on the grounds that a reader treating
operator-asserted completion differently from pipeline-observed completion is a distinction the
BR-10 safety argument deliberately does not need. FSPEC's new clause closes with precisely that
sentence. The erratum channel returned the clause TSPEC asked for, in the shape TSPEC asked for
it, and the design needs no change.

**One architectural consequence for the reader, not a change.** Because FSPEC now specifies this,
the behaviour has moved from "ratified downstream, unspecified upstream" to "specified upstream
and ratified downstream". Nothing in TSPEC's mechanism moves. What does become false is TSPEC's
*statement about* that status, in two places (§2.5's hand-off sentence and §6.3 item 3) — F-01
below. Per DEC-ERR-01 that is scored on what it costs downstream, and here it costs nothing on
the losing side: both documents ratify the same behaviour, so no PLAN or PROPERTIES task can be
authored against a decision that lost. It is a stale hand-off statement, not a design defect.

## Interfaces

**The errata channel is where this cascade lands.** TSPEC §6.3 is the hand-off interface between
this document and the phases downstream of it — it is read by the PLAN author and by harvest, and
it declares itself to be a list of things still wrong upstream. This round's edit closes three of
its four items, and the section says nothing about that, because TSPEC's bytes have not moved.

Item by item, against FSPEC and REQ at HEAD:

| §6.3 item | What it asserts | Status at HEAD | Disposition |
|---|---|---|---|
| 1 | "FSPEC states it derives from REQ v1.5; the REQ at HEAD is **v1.6**" | Both halves stale: FSPEC §1 now says **v1.7**, and REQ is **v1.7** (REQ:13). The item's own content note — that the version cell was stale rather than the content — was correct and is now moot | **Landed.** F-03 (Low) |
| 2 | "FSPEC OB-F1 says the REQ's §10 records BL-04 as 'discharged at FSPEC authoring'. REQ v1.6 §10 says the opposite" | FSPEC OB-F1 now reads "…which now records BL-04 as **open and unmet** in §5 and §10 (v1.7)". The quoted string no longer appears in FSPEC | **Landed.** F-02 (Medium) |
| 3 | "FSPEC has no clause stating what a run **writes** when an explicit operator pointer is in force" | False at HEAD: FSPEC §3.4 now carries exactly that clause | **Landed.** F-01 (Medium) |
| 4 | REQ OB-1's worktree conclusion rests on `.worktreeinclude` | Landed in REQ v1.7; already raised as v3 F-01 and still open in unchanged bytes | Carried, F-04 (Medium, inherited) |

So all four items of §6.3 are now closed upstream while the section still presents all four as
open. That is the whole cascade cost of this round, and it is the same defect class my v3 raised
against item 4 — which is itself the signal in Q-01 below: a hand-off section whose entries have
no disposition column goes stale silently, and only the owning document can clear it.

**§6.2 OB-F1's justification clause moves with item 2.** OB-F1's disposition ends "Re-raised as an
erratum below, because the REQ's §10 and the FSPEC's OB-F1 characterise it inconsistently." That
inconsistency is now closed on both sides — REQ v1.7 §5 and §10 record BL-04 open and unmet, and
FSPEC OB-F1 now says so too. The *substance* of OB-F1 is untouched and remains correct: BL-04 is
still unmet, the branch is still behind, AT-14 is still red in this tree, and the PLAN sequencing
precondition still binds. Only the stated reason for re-raising is spent. I fold this into F-02
rather than raising it separately, because it is one sentence with one fix.

**Nothing else in TSPEC's interface surface is reached.** I checked the three places a
recording-behaviour clause could in principle have moved a contract:

- **§2.6 requirement → component map.** Ten rows, each mapping a REQ criterion through FSPEC BRs
  to a named component. The edit adds no BR, retires none, and renumbers none. The map is
  unchanged and still complete against FSPEC §4.
- **§3.1's three closed catalogues** (`RESUME_OUTCOMES`, `RESUME_PROVENANCE`,
  `WAVE_IGNORE_REASONS`). FSPEC's new clause names `operator-set` and BR-07 but adds no member to
  any of them and closes no new set. Set-equality oracles at AT-02/AT-08/AT-13 still discharge
  OB-F5 as written.
- **§3.2's evaluation order.** The new clause is about writing, not about disregarding; it names
  no disregard cause and touches no arm of the `else if` chain. Order table unchanged.

## Data Model

The record's product-visible shape is specified in TSPEC §4.1 and deliberately left unspecified by
FSPEC (REQ OB-1). This round's edit is the first FSPEC change that talks about *what gets
recorded*, so it is the one that could have reached the data model. It does not — but the check is
worth writing out, because "records exactly as any other run does" is a sentence a careless reader
could take as asking for a new field.

- **No new field is asked for, and TSPEC says so pre-emptively.** FSPEC's closing sentence is "No
  record content distinguishes the two provenances." TSPEC §4.1's shape — `version`, `feature`,
  `planHash`, `lastGreenWave`, plus optional `head` — carries no provenance member, and §2.5's
  final paragraph argues explicitly that the erratum's clause is an *announcement* clause, not a
  record field. The clause as landed is announcement-only. Shape unchanged, and now upstream says
  the same thing rather than saying nothing.
- **`lastGreenWave`'s semantics are re-stated upstream, not changed.** FSPEC now says an
  operator-pointed run records "in the same high-water form counted from the plan's first wave".
  That is TSPEC §2.5 item 5's plan-absolute rule and §4.1's field definition, unchanged. The
  high-water property FSPEC BR-08 requires and AT-18 discriminates on is untouched — I re-read
  FSPEC §3.4's preceding paragraph, which the edit did not modify, and it is byte-identical to the
  version I approved against.
- **`head`'s role is untouched.** FSPEC's new clause leans on BR-10 (the gate verifies the tree),
  not on commit corroboration. §4.1's `head` row — optional, absent means honoured on the other
  fields alone (EC-21), present-and-unreachable means IG-5 — and §4.4's "`head` exists only to
  *falsify* the record" reasoning both stand. Nothing in the edit gives `head` a second job.
- **The `{}` cleared shape (DEC-WVR-04) is not reopened.** FSPEC OB-F3's row is byte-identical at
  HEAD; the edit did not touch §7's obligation table except for OB-F1's trailing clause. DEC-WVR-04
  still discharges exactly what FSPEC leaves open, and §6.2 reports it discharged.
- **The four recognised `implementation.*` config keys (V-13) are unchanged.** The new clause
  mentions the operator pointer by reference to §3.3 and adds no configuration surface. `startWave`
  remains a resume-point *selector*, `1` indistinguishable from unset (AT-06), past-the-end a full
  run (AT-07) — §5.6/V-12 unchanged, and AT-08's set-equality over the key set still holds.

One thing genuinely improved for the data model's reader, worth recording because it is the
product outcome of the erratum: the persisted record's *silence* about provenance is now a
specified property rather than an accident of where the write site sits. Before this round, an
implementer reading §2.5 could have concluded the absence of a provenance field was an unratified
implementation detail and "helpfully" added one. FSPEC now forecloses that, on the same reasoning
TSPEC gave. That is the erratum doing what errata are for.

## Test Strategy

Product lens only: has any acceptance criterion's oracle changed meaning now that FSPEC reads as
it does? For the eighteen ATs, **no** — the edit adds no AT, retires none, and rewords none. I
re-read FSPEC §5's AT table at HEAD and diffed it against the version my v2 approval pinned: it is
byte-identical. TSPEC §5.4's AT-by-AT oracle table is therefore still complete and still
set-equal to the upstream catalogue it discharges. That half of my approval stands unexamined and
I say so plainly rather than implying I re-derived it.

**But the edit specifies a behaviour and gives it no oracle, and TSPEC's §5 inherits that gap.**
This is the one finding of this round that is not pure bookkeeping. FSPEC §3.4 now states, as
specified behaviour, that an operator-pointed run records completed waves in plan-absolute
high-water form. I traced that claim to a test and could not land on one:

- **AT-05** (operator override wins) asserts the resume point and the provenance token on the
  operator banner, and asserts the record was never *consulted*. It says nothing about what the
  run *writes*.
- **AT-07** (pointer past the end) asserts the notice, the dispatch count and no consultation.
  Again, nothing about the write.
- **AT-15 / AT-15a** (best-effort write, partial-failure arm) and **AT-18** (completion
  accumulates across invocations) are the write-side oracles, and both are automatic-provenance
  runs. AT-18 in particular is the plan-absolute discriminator — but its three runs are all
  record-driven, so a mutation that suppressed the write *only* under `explicitPointer` would
  leave AT-05, AT-07, AT-15 and AT-18 all green.

That mutation is exactly the behaviour FSPEC's new sentence forbids, and it is a plausible one:
"an operator-pointed run should not write, because the pipeline did not verify the predecessors"
is a reasonable-sounding implementation instinct, and it is the position §2.5 explicitly rejected
on the grounds that it "would make an operator-pointer run unable to record anything, losing
resume for the very recovery path the feature serves". Before this round that argument was
TSPEC's own ratification with no upstream clause to trace to, so an untested claim was
defensible. Now it is specified upstream and still untested. F-03 below asks for the one oracle
that closes it — an operator-pointed run's written record, asserted for `lastGreenWave` as a
plan-absolute number — most cheaply as a conjunct on AT-05 rather than a new AT.

**§5.5's mutation list is the other place this shows.** Item 3, "recording a run-relative wave
number", is killed only by AT-18. Adding the write assertion to AT-05 would also give the mutation
"suppress the write when `explicitPointer` is true" a killer, which nothing in §5.5 currently
names. I raise this as part of F-03 rather than separately; it is the same missing assertion seen
from the mutation side.

**Unreached by the edit, and not re-derived here:** the three set-equality suites (§5.4
AT-02/AT-08/AT-13), AT-03/AT-11's `merge-base` call-count equality that discharges REQ C-3,
AT-16's delegation-shape oracle and DEC-WVR-07's rejected alternatives, AT-14's ignore-rule
assertion and its PLAN sequencing precondition, and the generative suite of §5.7. All still carry
the oracles I approved at v2 and v3 against bytes that have not moved.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | **Raised at v3, and this round is the evidence for it.** §6.3 has no disposition column, so an entry that lands upstream stays indistinguishable from one still open. At v3 one of four items had landed; at v4 **all four** have, and the section still reads as four open defects. Should §6.3 gain a `Status` column (`open` / `landed in FSPEC v1.2` / `landed in REQ v1.7`) when TSPEC is next edited? I have no view on the format and this is not a finding about the design — but the errata channel is the one section whose entries go stale by being *successful*, and only the owning document can clear them. |
| Q-02 | Carried, unanswered, and unchanged because TSPEC's bytes have not moved: §6.2 OB-F4's "7 no-op dispatches over waves 1–3 of a 16-wave plan" is a measurement not re-derivable in this tree. Who re-measures it, and is a Measured-by command owed by PLAN or by the promotion task itself? |
| Q-03 | **New, and for the PLAN author rather than for se-author.** Now that all four §6.3 errata have landed upstream, is there anything left that PLAN must *act on* from that section, or is it now purely a harvest record? My reading is the latter — the substantive obligations live in §6.2 (OB-F1's rebase precondition, OB-F4's promotion task) and those are unchanged. I ask because a PLAN author who reads §6.3 as a live worklist will author tasks for problems that no longer exist. |

## Risks carried

- **A-1 (changed, and stated).** Unlike v3, this round's upstream did move: FSPEC is at
  `sha256:9a6be7b5…`, not the `sha256:1c05f51…` my v3 approval pinned. REQ is unmoved at
  `sha256:17e83bfc…`, identical to the hash v3 recorded, so exactly one leg of the cascade is in
  question this round and the REQ leg needs no re-reading. I verified both hashes against the
  working tree rather than trusting the dispatch.
- **R-1 (closed).** v3 recorded that TSPEC §6.3's routed FSPEC↔REQ inconsistency was wider than
  TSPEC stated, and that the phase owning FSPEC must not read "the REQ erratum landed" as "the
  inconsistency is closed", because only the REQ half was ever right. This round closes it
  properly: FSPEC's OB-F1 has been corrected on its own side, so both halves now say BL-04 is open
  and unmet. The risk is discharged, and F-02 is only the residue in TSPEC's own note.
- **R-2 (carried, unchanged).** The 85% branch floor is placed on the last implementation wave's
  `postWaveCommand`, which is a single per-run key; F-06 below. This remains the one open item I
  would most want closed during PLAN authoring, since se-author will otherwise write a PLAN
  obligation the shipped config surface cannot express.
- **R-3 (new, low).** With all four §6.3 items landed, harvest will read a hand-off section none
  of whose entries is live. If §6.3 is not given a disposition column (Q-01), the LEARNINGS pass
  should be told these four are closed, or it will promote four settled questions as durable
  signal. Recorded here so the harvest phase has it in writing.

## Positive Observations

_TBD_

## Recommendation

_TBD_

## Delta-Confirmation Findings

_TBD_
