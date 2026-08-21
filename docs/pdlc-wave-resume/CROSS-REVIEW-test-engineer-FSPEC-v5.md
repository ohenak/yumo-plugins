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

Regression sweep over the edge-case table — did the delta invalidate any row I previously approved?
The edit touched no EC row, so this is a semantic check, not a diff check.

- **EC-06 (history rewritten → record disregarded), EC-15 (partial write cost), EC-19
  (concurrency)** — unaffected: none of them reasons about how a run's start point was chosen.
- **EC-10 (stale operator pointer)** — the one row where the new clause could have bitten. EC-10
  mitigates a stale pointer by *announcement*, per assumption A-2. The new clause's consequence
  ("a later automatic invocation can resume above waves whose completion only the operator
  asserted") is the downstream tail of exactly that scenario, and the clause resolves it the same
  way EC-10 does — attribution, not expiry. Consistent, and arguably it strengthens EC-10 by making
  the tail explicit instead of leaving a reader to discover it.
- **EC-12 (halt at wave 1 records nothing)** — unaffected; still governed by "completion means
  committed".
- **EC-16 / EC-17 (advisory remediation; worktree without consumer-local state)** — unaffected by
  the delta. EC-17 is where F-02 sits: it attributes the worktree/`D-DIST-07` deferral to **REQ
  OB-3**, but at HEAD that material is OB-1's (OB-1's shipped-contract paragraph carries the
  include-list-is-consumer-local reasoning and the `D-DIST-07` reference); **OB-3** is the advisory
  wave-gate ordering obligation, which EC-16 cites correctly. A reader following the EC-17 citation
  lands on the wrong obligation. Inherited (present before this round, untouched by it), Low, and
  a one-token fix whenever this document is next opened — not worth its own erratum round.
- **EC-20 (V-wave replays under outcome (c))** — re-verified against REQ-WVR-08 at v1.7 because
  this is the row the v1.6 rescoping created. It still matches upstream word for word in substance,
  including the "17th wave" figure and the "not this FSPEC's to decide" routing note. The routing
  note reads slightly historically now — the erratum it announces has landed — but it is a
  statement about ownership ("whether the V-wave should be recordable is an upstream question"),
  which remains true, so it is not stale. No finding.

**No previously-approved edge case is broken by the delta.**

## Acceptance Tests

This is the one place the delta leaves work, and it is my lens's finding rather than an item from
the list (DEC-ERR-03 applies in the other direction too: the items landing is necessary, not
sufficient).

**F-01 — the new §3.4 clause has no falsifying oracle.** The paragraph is normative and
cross-invocation: *an operator-pointed run still records completed waves, in high-water form, so a
later automatic invocation resumes above them.* I applied the "write the test right now" check and
then the mutation check:

- **Which existing AT fails if the behaviour is absent?** None. I walked AT-01..AT-18:
  - AT-05/06/07 are the operator-pointer tests, and all three assert only on the **resume point,
    provenance, and disregard announcement of the pointed run itself**. None reads the record the
    pointed run leaves behind.
  - AT-18 is the only high-water/accumulation test, and its *Given* says explicitly "no
    resume-related configuration set" — i.e. it is scoped to the automatic path by construction,
    which is correct for what it discriminates (BR-08) but means it cannot cover this.
  - AT-01, AT-09, AT-10, AT-15 all concern what a wave's own completion means, not the pointer.
- **The mutation.** Move the record write inside the `!explicitPointer` guard — the exact
  implementation error this clause exists to forbid, and the shipped code's guard boundary is what
  made the clause necessary in the first place. Every AT in §6 still passes GREEN. A clause whose
  negation passes the whole acceptance suite is not yet specified in a way downstream can build on.
- **The test that would close it, at black-box altitude** (no seam, no spy — a two-invocation
  observable): *Given* a multi-wave plan and an explicit operator pointer at wave 3, a run that
  commits waves 3–4 and halts at wave 5; *When* the pipeline is re-invoked **with the pointer
  cleared**; *Then* the announced resume point is wave 5 with provenance `automatic`, and waves
  1–4 are announced as skipped — including waves 1–2, whose completion only the operator asserted.
  *Discriminating value:* an implementation that suppressed the write under an explicit pointer
  announces a full run from wave 1 instead, failing this and only this test.

Severity **Medium**, not High: the behaviour is *stated* and stated testably — the gap is coverage,
not testability, the FSPEC's AT table has never claimed to be exhaustive over §3, and PROPERTIES
(te-author) can derive the oracle from §3.4's prose as written. Provenance **delta** (this round's
edit introduced the clause), locality **local** (§3.4 is a section this edit changed). It is
recorded, not gating, and is properly discharged either by an AT-19 in a later FSPEC round or by
PROPERTIES carrying it directly — the latter is sufficient and is where I would put it.

**Everything else in §6 is untouched and still holds.** I re-checked the three set-equality ATs
(AT-02 disregard causes, AT-08 config keys, AT-13 outcome catalogue) against the REQ at v1.7: the
catalogues are unchanged upstream, so the set-equality oracles I approved at v4 remain correctly
sized. AT-12's outcome-(c) oracle still matches REQ-WVR-08's rescoped no-commit claim.

## Open Questions

## Delta-Confirmation Findings

## Verdict
