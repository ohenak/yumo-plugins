# Cross-Review: software-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4
**Scope:** upstream-cascade confirmation. FSPEC bytes unchanged since my v2 approval
(`REVIEWED-COMMIT: 1dc235e0`) and unchanged since my v3 confirmation
(`REVIEWED-COMMIT: c37b80df`). Upstream REQ moved from v1.6
(sha256:ad68cd05…) to v1.7 (sha256:17e83bfc…) across the Phase T erratum round
`1ec391c1..5753de27`. The single question answered here: does this FSPEC still hold as
approved against REQ as it now stands?

## Overview

**What moved upstream.** The Phase T erratum round is small and closed: `git diff 7660f1ed..HEAD`
over the REQ is 13 insertions and 4 deletions, and two of the four hunks are the version bump
(`| Version | 1.6 |` → `1.7`) and the changelog entry recording the round. The two substantive
edits are:

| REQ edit | Substance | Bearing on this FSPEC |
|---|---|---|
| §5, BL-04 row restated | The row's outcome column now reads "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)", where it previously read as a discharge ("Checked at FSPEC authoring: the resume mechanism and … must both be readable"). The *requirement* the row states is unchanged; only its recorded outcome moved. | **Convergent, and it completes a settlement.** REQ §10 already recorded BL-04 open and unmet at v1.6; §5's row was the last place upstream still read as discharged. FSPEC §1's grounding paragraph and §7's OB-F1 have said "not met" since v1, so the two documents now agree in both of the REQ's own sections. No behavioural claim in this FSPEC changes. It does, however, finish invalidating OB-F1's quotation of upstream — see Open Questions. |
| §9, OB-1's worktree evidence relabelled | The worktree conclusion **stands**; what changed is the evidentiary status of its support. Where OB-1 previously asserted "`.worktreeinclude` lists only `.claude/workflows/`" as a repo fact, it now says the include list "is consumer-local — untracked on the default branch, so a consumer fact and not a repo fact — leaving the ledger's consumer-local path absent there, so it fails open to a full run". | **None.** This FSPEC never transcribed that evidence. Its only worktree row, EC-17, is stated purely as an observable ("Phase I runs inside a worktree that does not carry consumer-local state" ⇒ "No record is visible: outcome (a), silent, as EC-01"), cites `REQ OB-3, D-DIST-07`, and names no include list, no `.worktreeinclude`, and no file path. `grep -n "\.worktreeinclude\|include list\|\.claude/workflows" FSPEC-pdlc-wave-resume.md` returns nothing. The relabelling weakens an upstream *premise*; EC-17's conclusion — which upstream explicitly says still stands — is what the FSPEC compressed, and it is unaffected. |

**Answer to the one question.** Yes. Every behavioural claim, outcome, rule, edge case and
acceptance oracle in this FSPEC remains a faithful compression of REQ v1.7. One edit moved the
REQ further *toward* this document; the other cost it nothing, because the FSPEC compressed
OB-1's conclusion at the altitude of an observable rather than transcribing the repo fact that
supported it. This is the second consecutive round in which citing upstream by id and outcome,
rather than by transcription, has made an upstream move free.

**What this round does not fix.** The three stale-provenance sentences I filed in v3 (F-01, F-02,
F-03) are still in the file — the FSPEC has not been edited since, which is expected, since all
three were non-gating. This round widens two of them rather than resolving them: the derivation
pin in §1 now names a version two behind upstream, and OB-F1's quotation is now contradicted by
**both** REQ §5 and REQ §10 rather than §10 alone. They are restated below at their widened
extent, tagged `inherited` — they were in the pre-round bytes and this round's edit did not touch
them, so they route back to the FSPEC's ordinary revision loop rather than gating this
confirmation. Severity is unchanged; no finding in this round is High.

## Linked Requirements

**No REQ acceptance criterion moved in this round.** The whole diff is four hunks: the header
version cell, the v1.7 changelog paragraph, §5's BL-04 outcome cell, and §9's OB-1 evidence
clause. `REQ-WVR-01` through `REQ-WVR-09`, §1/OF-1..OF-3, the risk table, the user stories and
§10's resolution text are byte-identical to the v1.6 bytes I confirmed this FSPEC against in v3.
So §2's traceability table — FSPEC-WVR-01..07 onto REQ-WVR-01..08 — is untouched by construction,
and I did not re-derive it. The per-row verification stands as written in
`CROSS-REVIEW-software-engineer-FSPEC-v3.md` §"Linked Requirements".

**What this FSPEC leans on from the two edited sections.** Both edits sit in material the FSPEC
cites, so neither is out of scope for this confirmation; I checked each lean at HEAD.

- **§5 / BL-04 → FSPEC §1 "Grounding, and one prerequisite that is not met".** The FSPEC's
  grounding paragraph makes two claims about upstream: that "REQ BL-04 requires the resume
  mechanism and `docs/_constraints/pdlc-wave-gate-baseline.md` to be readable in the authoring
  tree at FSPEC authoring time", and that the prerequisite is "**not**" met. The first is a
  restatement of BL-04's requirement, and the edited row still carries it verbatim in its outcome
  cell ("the resume mechanism and `docs/_constraints/pdlc-wave-gate-baseline.md` must both be
  readable in the authoring tree, or R-4's 'new code alongside' outcome is unavoidable"). The
  second is now upstream's own recorded outcome. Both leans hold, and the second is stronger than
  it was: the FSPEC no longer contradicts its upstream on this point in either direction.
- **§5 / BL-03 → FSPEC §1 "ratifies or revises the shipped interim contract rather than inventing
  one (REQ BL-03)".** BL-03's row is untouched by this round and still reads "Checked at FSPEC
  authoring: the deliverable formalizes or replaces it, never duplicates it alongside". Holds.
- **§9 / OB-1 → FSPEC §1 "those are implementation contracts owned by the TSPEC (REQ OB-1)".**
  The FSPEC cites OB-1 for *ownership* — record location, encoding, field names, matching
  procedure, write mechanics belong to the TSPEC — not for any of OB-1's evidence. OB-1's owner
  line (`owner: TSPEC`) and its ownership scope are untouched; only the worktree sub-clause's
  evidence label moved. The lean holds.
- **§9 / OB-3 → FSPEC EC-16, EC-17.** Both rows cite `REQ OB-3`. OB-3 is untouched in this round.
  EC-17 additionally leans on the worktree conclusion inside OB-1, which upstream explicitly
  preserves ("which stands"); see Edge Cases below.

**One residue, carried and widened.** §1's opening sentence still pins the derivation to
"`REQ-pdlc-wave-resume.md` **v1.5**". Upstream's header now reads `| Version | 1.7 |`. This was
already a finding at v1.6 (v3 F-02); the round widens the gap to two versions without changing its
character. The fix remains one token plus a clause naming the rounds this FSPEC has since been
confirmed against — not a re-derivation, since (per this confirmation and v3) no derived content
is wrong. Restated as F-02 below.

## Behavioral Flow

§3 is untouched upstream in every respect, and I did not re-review it, per the delta protocol.
Stating the reasoning rather than the conclusion, since "no change" is a claim this round has to
earn:

- **§3.1 (the decision), §3.2 (consulting the record), §3.3 (operator override), §3.4 (high-water
  completion), §3.5 (queue parity)** trace to REQ-WVR-01..08 and §3's scope statement. None of
  those criteria appears in the diff. The three-outcome catalogue, D-1..D-5, the six disregard
  questions and their evaluation order — ancestry before over-count — are measured against
  upstream text that did not move this round.
- The **evaluation-order settlement** I recorded in v3 is unaffected: REQ-WVR-02's "IG labels name
  causes, not precedence … which is FSPEC's to state (§3.2 there evaluates ancestry before
  over-count)" landed in v1.6 and is byte-identical at v1.7. §3.2's paragraph "The order above is
  deliberately not REQ-WVR-02's IG numbering" remains upstream-ratified.
- I did **not** re-verify the shipped chain (`feature` → `planHash` → `headCorroborated` →
  `lastGreenWave > waves.length` in the resume-decision block of
  `pdlc/workflows/orchestrate-dev.js` on `origin/main`) a third time. It was verified at v2 and
  re-verified at v3 against the same HEAD, and no upstream sentence describing it moved. Re-running
  a codebase verification that no edit could have invalidated is the re-litigation the erratum
  protocol exists to avoid.

**One flow-adjacent check the §9 edit did make necessary.** OB-1's relabelled clause reasons about
what a Claude-created worktree does *at runtime* — "leaving the ledger's consumer-local path absent
there, so it fails open to a full run". That is a behavioural sentence in an upstream obligation,
and if this FSPEC's flow contradicted it, that would be a finding of this round regardless of the
item list. It does not: §3.1's outcome (a) is exactly "no record visible ⇒ start at wave 1,
silently", EC-01 is its silent-full-run row, and EC-17 routes the worktree case to precisely that
pair. Upstream's "fails open to a full run" and the FSPEC's outcome (a) are the same behaviour
under two names, and the FSPEC's is the normative one. No finding.

## Business Rules

No business rule traces to either edited section, and none needs an edit.

**BR-11 (outcome (c) scope) — settled at v1.6, unmoved at v1.7.** This was the rule under the
previous round's shadow. REQ-WVR-08's wave-loop scoping and the V-wave exclusion are byte-identical
between v1.6 and v1.7, so the agreement I recorded in v3 — same scope, same discharge argument,
same exclusion, matching violation clauses — stands untouched. Nothing to re-examine.

**BR-15 (write failures are notices, never halts) — the one rule adjacent to this round's
subject matter.** OB-1's relabelled clause reasons about an *absent* record path in a worktree,
which is a read-side miss (outcome (a)), not a write-side failure. BR-15 governs the write side
and is unaffected. I checked the pair explicitly because "the ledger's consumer-local path absent
there" could be misread as a write-failure case; it is not, and neither BR-15 nor EC-15/EC-15a is
implicated.

**BR-10 (the record is an optimisation; a bad record costs a replay, never correctness) — the rule
that makes this round cheap.** It is worth naming why the OB-1 relabelling could not have cost this
FSPEC anything, rather than only observing that it did not. BR-10 means every worktree-shaped
question resolves to *how much is replayed*, never to *whether the result is right*. So an upstream
edit that downgrades the evidence for "a worktree carries no ledger" can only move a cost estimate,
and this FSPEC states no cost estimate for the worktree case — EC-17 says "the run is correct,
merely not cheap", which holds whether the ledger is absent by repo fact or by consumer-local
happenstance. A downstream document that had transcribed the include-list mechanism as its
*reason* would now be carrying a demoted fact; this one carries the outcome.

**BR-01..BR-09, BR-12, BR-13, BR-14 and the remainder.** Trace to REQ criteria this round did not
touch; not re-reviewed, per the delta protocol.

## Edge Cases and Error Scenarios

One row cites the material this round edited, and it is the row the round could plausibly have
broken.

**EC-17 — Phase I inside a worktree (cites REQ OB-3, D-DIST-07). Holds; no finding.** The row
reads: "Phase I runs inside a worktree that does not carry consumer-local state" ⇒ "No record is
visible: outcome (a), silent, as EC-01. Consistent with the standing worktree deferral; the run is
correct, merely not cheap." Three properties make it survive the relabelling intact:

1. **Its antecedent is a condition, not a claim.** The row does not assert *that* a Claude-created
   worktree lacks the record — it specifies behaviour *given* a worktree that does not carry
   consumer-local state. Upstream's demoted evidence bears on how often that antecedent is true in
   a given consumer's tree, not on what the run must do when it is.
2. **It cites the deferral, not the mechanism.** `D-DIST-07` and `REQ OB-3` are both id citations
   to standing decisions, and neither moved. The FSPEC nowhere names `.worktreeinclude`, an
   include list, or `.claude/workflows/` — verified by grep, which returns no hit in the file.
3. **Upstream preserved the conclusion explicitly.** The v1.7 changelog says OB-1's "worktree
   conclusion, which stands", and OB-1's own sentence still ends at "fails open to a full run —
   consistent with the D-DIST-07 deferral". EC-17 compresses that conclusion, so it is compressing
   text that upstream deliberately left in place.

This is the well-behaved case of the class DEC-ERR-03 asks about: upstream weakened a *premise*
while keeping the conclusion, and the downstream document had only ever leaned on the conclusion.

**EC-16 (advisory remediation on a halted wave; cites REQ OB-3).** Untouched upstream. I re-read
it only far enough to confirm its citation target did not move, which it did not.

**EC-20 — the V-wave replays.** The behaviour, the oracle detail and the wave-loop scoping all
match REQ v1.7 unchanged from v1.6. Its one stale sentence — "Whether the V-wave should be
recordable … is an upstream question, **raised as an erratum against REQ-WVR-08**" — describes a
question that v1.6 settled, and v1.7 does not disturb the settlement. Carried unchanged as the
first half of F-03; not widened by this round.

**EC-12 (wave-1 halt, cites REQ §1/OF-1).** OF-1 is byte-identical at v1.7. The v3 analysis stands:
the row compressed OF-1's shape, not its arithmetic, so neither the v1.6 restatement nor this
round's silence costs it anything.

**EC-01..EC-11, EC-13..EC-15a, EC-18, EC-19, EC-21.** Trace to untouched criteria; not
re-reviewed. My open non-gating finding against EC-15a's unconstrained failed-write notice
(v2 F-01, v3 F-04) is unaffected by this round and is carried below as F-04, `inherited`.

## Acceptance Tests

## Open Questions

## Recommendation

## Delta-Confirmation Findings

## Verdict
