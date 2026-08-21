# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md (v1.2)
**Upstream at HEAD:** docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md (v1.7, sha256:17e83bfc…8c79f)
**Date:** 2026-08-21
**Iteration:** 5 (delta confirmation, erratum round)
**Scope:** Delta confirmation only — the erratum edit `1dc235e0..HEAD`, plus this FSPEC's fidelity to the REQ at its current version (DEC-ERR-03). Not a full re-review.

## Overview

I previously approved this FSPEC (v4). A targeted erratum edit has landed (`8b818309`, `2290c121`,
`05901a9c` — diff `1dc235e0..HEAD`, +14/−3 lines). The question answered here is narrow: does the
delta resolve the routed items without breaking anything already approved, and is the document
still a faithful compression of the REQ **at HEAD**?

**Answer: yes.** All three routed items land, the edit is confined to the four places it claims
(`§1` version cell, `§3.4` new paragraph, `§7` OB-F1 row, `§7` erratum note), and nothing
previously approved is contradicted. Two non-gating findings are recorded: one testability gap
introduced by the delta itself (the new `§3.4` clause has no acceptance test that can falsify it),
and one inherited citation slip. No High findings.

**What the delta changed, verbatim scope:**

| Commit | Location | Change |
|---|---|---|
| `8b818309` | header table, §1 | `Version 1.1 → 1.2`; "derives entirely from REQ … v1.5" → "v1.7" |
| `2290c121` | §3.4 | new paragraph: "An operator-pointed run records exactly as any other run does" |
| `05901a9c` | §7 OB-F1 | "whose §10 records BL-04 as 'discharged at FSPEC authoring'" → "which now records BL-04 as open and unmet in §5 and §10 (v1.7)" |
| `05901a9c` | §7 | new "Erratum, v1.2 (Phase T)" note recording the three items |

Note on the dispatch brief: it names REQ **v1.6** as the upstream at HEAD, but the supplied
sha256 (`17e83bfc…`) is the file at HEAD and that file's header reads **v1.7** — a second Phase T
erratum (BL-04's row wording, OB-1's worktree-evidence labelling) landed after the brief was
written. I reviewed against the bytes, not the brief. The FSPEC's citation of **v1.7** is
therefore correct, not an overshoot; had it said v1.6 as the brief implied, that would itself
have been a finding.

## Linked Requirements

Re-grounding performed against the REQ at HEAD (v1.7), not against the version I reviewed at v4.
Every upstream claim this FSPEC now leans on was re-read at its current text:

| FSPEC claim | Upstream at HEAD | Verdict |
|---|---|---|
| §1: "derives entirely from `REQ-pdlc-wave-resume.md` v1.7" | REQ header `Version \| 1.7` | Accurate |
| §7 OB-F1: REQ "now records BL-04 as open and unmet in §5 and §10 (v1.7)" | REQ §5 BL-04 row: "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)"; REQ §10: "BL-04 is **open and unmet** — not discharged at FSPEC" | Accurate in both cited sections; the earlier contradiction is gone |
| §1: BL-04's prerequisite is unmet, branch 1,637 commits behind | REQ §1 branch-base note (SE F-01, F-02) states the same count and the same conclusion | Consistent |
| BR-11 / EC-20: outcome (c)'s no-commit claim is scoped to the **implementation wave loop**, Phase PT's V-wave excluded | REQ-WVR-08, v1.6 rescoping: "The claim is scoped to that loop: Phase PT's appended verification wave, OF-1's 17th wave, is outside the resume record's scope and continues to dispatch, gate and commit on every invocation (FSPEC §2, EC-20)" | Faithful — including the "17th wave" figure, which matches REQ §4 OF-1 (16 plan waves + the appended V-wave) |
| BR-01 / AT-13: the outcome catalogue is closed at three | REQ-WVR-08 closing paragraph, unchanged at v1.7 | Faithful |
| BR-10: skipping skips dispatch only; the first executed wave's gate verifies the whole tree | REQ-WVR-08 "How REQ-WVR-03 is discharged here" and REQ OB-1's shipped-contract paragraph | Faithful |
| BR-04/05, §3.3, AT-05/06/07: explicit-pointer precedence and the two boundaries | REQ-WVR-04 including the TE F-01 boundary paragraph, unchanged at v1.7 | Faithful |
| BR-08 / §3.4: completion means committed, never merely verified | REQ-WVR-09, unchanged | Faithful |

**The v1.7-only item that could have gone stale and did not.** v1.7's second change relabels
OB-1's worktree include-list evidence as *consumer-local and untracked on the default branch —
a consumer fact, not a repo fact*. This FSPEC's only worktree-touching row is EC-17, which asserts
a worktree "that does not carry consumer-local state" and calls the outcome "consistent with the
standing worktree deferral". That reading survives the relabelling intact — EC-17 never claimed
the include list as a repo fact — so no edit is owed there. Its *citation* is a separate, minor
matter; see F-02.

## Behavioral Flow

Item-by-item, against the diff.

**Item 1 — the stale version cell (§1 and header).** Landed. Both the header table's `Version`
row (now `1.2`, the FSPEC's own version) and §1's derivation sentence (now `v1.7`) were edited.
The distinction matters and the edit gets it right: the header cell is *this* document's version,
the §1 sentence is the *upstream's*, and only the latter was the stale citation. §1's body already
described v1.6-and-later behaviour, so no substantive rewrite was needed — the brief said as much,
and the diff confirms nothing but the numeral moved. **Resolved.**

**Item 2 — OB-F1's misreading of REQ §10 (§7).** Landed. The old row asserted that the REQ's §10
"records BL-04 as 'discharged at FSPEC authoring'"; the new row asserts the REQ "now records BL-04
as open and unmet in §5 and §10 (v1.7)". I verified both cited sections rather than trusting the
row: REQ §5's BL-04 row and REQ §10 both now say unmet/not-discharged, and they agree with each
other. The obligation's *substance* is untouched — OB-F1 still says the prerequisite is unmet, still
names the same owner and the same discharge condition — so the edit corrects the FSPEC's reading of
upstream without weakening the obligation it carries. That is the right shape for an erratum.
**Resolved.**

**Item 3 — the unspecified operator-pointer write (§3.4).** Landed, and correctly reasoned. The
gap was real: `§3.3`/BR-04 state that when an explicit pointer is in force the record is *not
consulted*, and every prior §3.4 sentence spoke about the record from the automatic path's point of
view — so the document said nothing about what such a run **writes**, while the shipped write site
sits outside the `!explicitPointer` guard. The new paragraph closes exactly that:

- it states the rule positively — recording follows *what the run committed*, not *how the start
  point was chosen*;
- it names the consequence honestly rather than hiding it — "a later automatic invocation can
  resume above waves whose completion only the operator asserted";
- it bounds the consequence with the two things that actually bound it: **BR-10** (the first
  executed wave's gate verifies the whole tree before this run commits anything, so no unverified
  work is skipped past) and **BR-07** (the run that made the assertion announced provenance
  `operator-set`, so the assertion is attributable);
- it closes the design question it raises — "No record content distinguishes the two provenances"
  — which pre-empts a TSPEC inventing a provenance field the REQ never asked for. This matches the
  brief's own framing that announcement-only provenance is sufficient.

I checked the safety claim rather than accepting it: BR-10 does say the first executed wave's gate
runs over the whole tree before any commit of that run lands, and REQ-WVR-08 grounds it. So the
"resume above operator-asserted waves" path cannot land a commit over unverified work; the worst
case is wasted work being skipped, which is the operator's own instruction. The clause is
consistent with the safety envelope, not an erosion of it. **Resolved** — with one testability
consequence recorded under *Acceptance Tests* (F-01).

**Item 4 — the erratum note (§7).** The new "Erratum, v1.2 (Phase T)" paragraph records all three
items and sits above the pre-existing "Round 1 revision note", preserving the append-only,
newest-first revision history the document already used. The older note's sentence that two
upstream defects were "routed rather than fixed in place" remains accurate as history — it
describes what that round did — and the new note above it records that the REQ-side erratum has
since landed, so a reader cannot come away believing the routing is still outstanding. No finding.

## Business Rules

The delta adds normative content to §3.4 but adds no BR row. I checked the new paragraph against
every rule it could contradict, since a §3.4 clause that fought a BR would be a High:

| Rule | Interaction with the new §3.4 paragraph | Verdict |
|---|---|---|
| BR-04 — "the record is not consulted when [an explicit pointer] is in force" | The new clause governs the **write**, not the read. Consulting and recording are separate operations and the paragraph says so explicitly ("Recording follows what the run committed, not how its start point was chosen"). No contradiction — but see F-01: this is precisely the distinction a reader can lose, which is why it wants an oracle. | Consistent |
| BR-07 — provenance announcement | Cited by the new clause as the attributability mechanism; BR-07 already requires `operator-set` on an operator-pointed start, so the clause leans on a rule that exists rather than inventing one. | Consistent |
| BR-08 — completion means committed; high-water; monotonic while the record is honoured | The new clause is a strict specialisation of BR-08 ("in the same high-water form counted from the plan's first wave"). It does not carve out an exception; it denies that one exists. | Consistent |
| BR-10 — skipping skips dispatch only | Cited as the safety bound, correctly (verified against REQ-WVR-08's discharge paragraph). | Consistent |
| BR-12 — no record state may make the pipeline refuse to run | Untouched; the clause adds no refusal path. | Consistent |
| BR-14 — the record never becomes tracked content | Untouched; the clause adds a write, not a staged file. | Consistent |
| BR-15 — best-effort, per-wave writes | The paragraph sits immediately above the best-effort paragraph and inherits it — an operator-pointed run's writes are best-effort like any other. Reading order carries this correctly. | Consistent |

**One observation, not a finding.** BR-08 could have absorbed the new clause as a clause of its own
("…and independently of how the run's start point was chosen"), which would have given the rule an
id and pulled it into the BR-traced test surface for free. Leaving it as prose in §3.4 is a
legitimate authoring choice — the erratum contract asks for a *targeted* edit, and editing BR-08
would widen the blast radius of an erratum round. I am not asking for it here. It is, however, why
the missing oracle (F-01) is worth recording rather than waving through: prose that no rule id and
no AT reaches is prose that PROPERTIES can silently fail to pick up.

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Delta-Confirmation Findings

## Verdict
