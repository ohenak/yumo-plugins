# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation, round 4)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md
**Date:** 2026-08-21
**Iteration:** 4
**Scope:** upstream-cascade confirmation. The FSPEC's own bytes are unchanged; REQ was edited by a
Phase T erratum round after this FSPEC's approval was recorded. One question is answered: does the
FSPEC still hold as approved against REQ **at its current version**
(sha256:17e83bfcd332f8f8f0482e2ebee7bbe78a3f434193dd3f9c3589723e39e8c79f)?

## Overview

**What this round is.** Not a re-review of the FSPEC. Its bytes are byte-identical to the version
approved in `CROSS-REVIEW-test-engineer-FSPEC-v3.md` (verdict: *Approved with minor changes*,
`{"high": 0, "medium": 1, "low": 3}`, `REVIEWED-COMMIT: c37b80df`) — verified by
`git diff c37b80df..HEAD -- docs/pdlc-wave-resume/FSPEC-pdlc-wave-resume.md`, which is empty. What
moved is upstream: REQ went v1.6 → v1.7 under a **Phase T** erratum round, so the approval on record
was taken against a REQ that no longer exists.

**Delta base, pinned both ends.** The REQ state the v3 confirmation approved against is
`c37b80df:docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md` (sha256:ad68cd05…, pinned in that file's
`UPSTREAM-STATE:` anchor). REQ at HEAD is sha256:17e83bfc…. Both verified locally with
`shasum -a 256`; the HEAD sha matches the one in this dispatch exactly. The diff read is:

```
git diff c37b80df..HEAD -- docs/pdlc-wave-resume/REQ-pdlc-wave-resume.md
```

Three commits, three hunks, 13 insertions and 4 deletions. No acceptance criterion was added,
renamed, deleted, re-numbered, or re-prioritised.

**The three upstream hunks.**

| # | REQ section | What the erratum changed |
|---|---|---|
| E-1 | Header + §1 revision log | Version 1.6 → **1.7**; a v1.7 erratum note naming the round's two items |
| E-2 | §5 (Blockers), BL-04 row | The row now states the check's outcome as **unmet** — "Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)" — instead of reading as discharged at FSPEC authoring |
| E-3 | §11, OB-1 | The worktree conclusion **stands**; its evidence is re-labelled: the include list that carries `.claude/workflows/` into a worktree is **consumer-local, untracked on the default branch — a consumer fact, not a repo fact** — so the ledger's consumer-local path is absent there and the run fails open to a full run |

**Direction of travel.** All three hunks move REQ *toward* this FSPEC, and two of them land items the
FSPEC itself routed. E-2 completes the correction the FSPEC asked for in OB-F1 (§10 was fixed in the
Phase F erratum round; §5's row was the last place REQ still read as discharged, and it now agrees).
E-3 downgrades an evidence claim from repo fact to consumer fact — a *weakening* of upstream's
warrant, which is the direction that can silently break a downstream compression if the downstream
had leaned on the strong form. It did not: the FSPEC never cites `.worktreeinclude`, never asserts a
repo-level worktree fact, and EC-17 traces to REQ **OB-3** and D-DIST-07, not to OB-1
(`grep -n "worktree" FSPEC` returns EC-17 alone). E-1 is bookkeeping.

**Net.** No clause of this FSPEC is contradicted by the new upstream text. What the round leaves is
the same small class of **stale quotations** already on record from v3 — three places where the FSPEC
quotes or characterises REQ text that REQ no longer carries. Two of the three are now stale in a
second place as well, which changes their evidence, not their severity.

## Linked Requirements

The FSPEC's §2 traceability maps every FSPEC clause to REQ-WVR-01..08. This erratum touched **no
criterion at all** — not a body, not an id, not a priority, not a phase. E-2 and E-3 landed in §5
(Blockers) and §11 (Obligations); E-1 in the header and revision log. So the traceability table
resolves exactly as it did at approval time: every clause cites a criterion that exists at HEAD, and
no criterion at HEAD is left uncovered.

| REQ id at HEAD | Touched by this erratum? | What the FSPEC leans on | Still faithful? |
|---|---|---|---|
| REQ-WVR-01 | no | FSPEC-WVR-01 (§3.1, D-1..D-3) | yes |
| REQ-WVR-02 | no (E-3 of the *previous* round; unchanged here) | §3.2 questions, BR-03, AT-02 | yes |
| REQ-WVR-03 | no | BR-11, EC-09, EC-20, AT-12 | yes |
| REQ-WVR-04 | no | §3.3, EC-10 | yes |
| REQ-WVR-05 | no | announcements, OB-F5 | yes |
| REQ-WVR-06 | no | §3.2 question 5 carve-out, EC-14 | yes |
| REQ-WVR-07 | no | BR-16, AT-16 | yes |
| REQ-WVR-08 | no (scoped in the previous round; untouched here) | BR-11, EC-09, EC-20, AT-12 | yes |
| REQ-WVR-09 | no | EC-13 | yes |

**Non-criterion upstream anchors, re-checked individually.** DEC-ERR-03 scope is not the item list,
so I re-read every place the FSPEC cites REQ material *outside* the criteria, since that is where
this round's bytes actually landed:

| FSPEC site | Cites | REQ at HEAD | Verdict |
|---|---|---|---|
| §1, line 17 | "derives entirely from `REQ-pdlc-wave-resume.md` **v1.5**" | Version **1.7** | **stale** — F-01 |
| §1, "one prerequisite that is not met" | REQ BL-04, and states it is **not met** | §5 BL-04 now says "found **unmet** — this row is not discharged (§10)" | **agrees, newly verbatim** |
| §1, "TSPEC owns implementation contracts (REQ OB-1)" | OB-1 | OB-1's TSPEC-ownership conclusion untouched by E-3 | holds |
| EC-16, EC-17, EC-19, OB-F6 | REQ OB-3, D-DIST-07, REQ §3 | untouched | hold |
| OB-F1 closing clause | REQ "§10 records BL-04 as 'discharged at FSPEC authoring'" | §10 says the opposite; §5 now says the opposite too | **stale** — F-02 |
| §7 round-1 revision note | "REQ's discharge of BL-04" as an open routed defect | withdrawn in §10 (prior round) and in §5 (this round) | **stale** — F-03 |

**Re-derived, not assumed: the uncovered-AC check.** The three closed catalogues OB-F5 pins as
set-equality targets — disregard causes IG-1..6 (AT-02), the three outcomes (AT-13), the recognised
`implementation.*` config keys (AT-08) — are all defined inside REQ criteria this round did not
touch. I re-counted each at HEAD: still six, still three, still the same key set. A cardinality
change in any of the three would have been a High finding here; there is none.

## Behavioral Flow

**No flow is implicated.** The erratum's three hunks land in REQ's header/revision log (E-1),
Blockers table (E-2) and Obligations (E-3). §3.1's decision D-1..D-3, §3.2's six-question record
consultation, and §3.3's explicit-pointer precedence and range clamp all compress REQ criteria that
this round did not open. Under the delta protocol I did not re-read them, and I re-litigate nothing
settled in v2 or v3.

One flow-adjacent check was worth running anyway, because E-3 weakens an upstream evidence claim and
a weakening is the failure mode a cascade round exists to catch. E-3's subject is the **worktree**
case, and exactly one behavioural site in this FSPEC turns on worktrees:

> EC-17 — *"Phase I runs inside a worktree that does not carry consumer-local state. No record is
> visible: outcome (a), silent, as EC-01. Consistent with the standing worktree deferral; the run is
> correct, merely not cheap."* (source: REQ OB-3, D-DIST-07)

REQ at HEAD now reads: *"a Claude-created worktree has no ledger, because the worktree include list
that carries `.claude/workflows/` into a worktree is consumer-local — untracked on the default
branch, so a consumer fact and not a repo fact — leaving the ledger's consumer-local path absent
there, so it fails open to a full run."*

Same conclusion, weaker warrant. EC-17's compressed claim — *no record visible ⇒ outcome (a) ⇒ silent
full run* — is entailed by the new text as fully as by the old. Critically, EC-17 states the
worktree condition **hypothetically** ("a worktree that does not carry consumer-local state"), not
as a repo-level assertion about what `.worktreeinclude` contains. Had the FSPEC transcribed the old
strong form — "`.worktreeinclude` lists only `.claude/workflows/`" — as a repo fact, E-3 would have
falsified it and that would be a `delta` finding here. `grep -n "worktreeinclude"` over the FSPEC
returns nothing; `grep -n "worktree"` returns EC-17 alone. The compression survives the weakening
because it never depended on the strong form. That is the authoring decision paying off, and I
record it as a positive rather than a finding.

**Testability consequence, stated so it is checkable downstream.** EC-17's oracle is now cheaper than
it looked: because the *mechanism* by which a worktree lacks the ledger is consumer-local
configuration and not a repo invariant, a PROPERTIES test must not assert EC-17 by inspecting a
tracked file (there is nothing tracked to inspect — such a test would false-green on any consumer).
The falsifiable form is a state-shaped one: given a tree in which the record's consumer-local path is
absent, the run announces outcome (a) and executes wave 1. That is exactly how EC-01 is already
tested, so EC-17 costs one fixture, not one new mechanism. No finding — the FSPEC already routes
this correctly through EC-01's shape — but te-author should not read E-3 as inviting a
`.worktreeinclude` oracle.

## Business Rules

No rule is reached by this round's bytes. BR-01, BR-03, BR-06, BR-10, BR-11, BR-13, BR-15, BR-16 and
BR-17 each compress a REQ criterion or an OF-* observation, and this erratum edited neither. In
particular:

- **BR-11** (outcome (c) scoped to the implementation wave loop) was reconciled with REQ-WVR-08 in
  the *previous* round's E-4 and confirmed in v3. REQ-WVR-08's bytes are unchanged here, so that
  confirmation stands unretested.
- **BR-10 / BR-13** (a bad record costs at most a full run; the gate verifies the whole tree) rest on
  REQ-WVR-03 and R-2/G-2, untouched.
- **BR-15** (per-wave recording, write failure is a notice not a halt) was verified in v2 against the
  shipped write site; no hunk touches it.

**One rule interacts with E-2, and is strengthened, not broken.** The FSPEC's §1 grounding preamble
carries the load-bearing statement that *"REQ BL-04 requires the resume mechanism and
`docs/_constraints/pdlc-wave-gate-baseline.md` to be readable in the authoring tree at FSPEC
authoring time. It is **not**"*, and derives from that the rule governing every positional claim in
the document: each shipped-behaviour claim is verified against `origin/main`, and every claim names a
symbol or file, per DEC-DOC-01. Before E-2, this statement stood in direct contradiction to REQ §5,
whose BL-04 row read as discharged at FSPEC authoring — the FSPEC asserted a prerequisite unmet that
its own upstream's blocker table recorded as satisfied. E-2 removes that contradiction: §5 now reads
*"Checked at FSPEC authoring and found **unmet** — this row is not discharged (§10)"*, which is the
same proposition the FSPEC states, in the same direction, citing the same section the FSPEC's OB-F1
cites. Two documents that disagreed now agree.

**What E-2 does not do, and must not be read as doing.** It changes what REQ *records*; it does not
rebase the branch. The tree is still 1,637 commits behind the default branch, the resume mechanism
and `docs/_constraints/pdlc-wave-gate-baseline.md` are still absent from it, every shipped-behaviour
claim in §1 is still verified against `origin/main` rather than in-tree, and the FSPEC's positional
citations are still not re-verifiable here. OB-F1's discharge condition — *"the branch is rebased and
the mechanism is readable in the tree"* — remains unmet, **OB-F4 stays blocked on it**, and AT-14's
branch precondition (the `.gitignore` rule is absent in this tree, so the test is RED until the
rebase) is unaffected and must not be softened into an "observed quiet" oracle. Removing a
documentary contradiction adds no capability. That distinction is the whole substance of F-02 below:
the erratum succeeded, and the FSPEC's *description of the erratum* is what is now stale.

## Edge Cases and Error Scenarios

Two edge cases sit near this round's bytes; both are confirmed.

**EC-17 — confirmed, and its warrant is now correctly labelled upstream.** Analysed in full under
*Behavioral Flow*. EC-17 cites REQ **OB-3** and D-DIST-07, not OB-1, so E-3 does not even touch its
citation; and the claim it compresses is entailed by OB-1's weakened evidence as fully as by the
strong form. No change.

**EC-16 — confirmed, and worth one sentence because E-3 brushes the same vocabulary.** EC-16 asserts
that no advisory remediation envelope of this run can authorise touching the record, because *"this
feature's PLAN claims it in no wave's owned-path set"*, and routes the general form (no PLAN may
claim consumer-local state as owned) to Phase P via OB-F6. E-3 relabels a *different* consumer-local
artifact (the worktree include list) and says nothing about ownership manifests. EC-16's per-feature
arm remains a PLAN-shaped assertion, falsifiable against this feature's PLAN once it exists, and
OB-F6's split between the per-feature test and the Phase P gate question is untouched.

**EC-01, EC-09..EC-15a, EC-18..EC-21 — untouched upstream, not re-read** under the delta protocol.

**One inherited Medium remains open on the record and is not re-filed here.** v3's F-04 held that
EC-20 and AT-12's fourth conjunct describe the Phase PT V-wave as one that *"dispatches, gates and
commits on every invocation"*, where dispatch and gate are script-owned and mechanically checkable
(`phaseFn("Phase PT: PROPERTIES Tests (Phase I V-wave)")`; the gate's `runCommandFn` call) but the
**commit** is agent-instructed inside `propertiesTestPrompt` and never verified afterwards — so an
oracle asserting "the V-wave produces a commit" is flaky by construction, since under outcome (c) the
suite may already be green and the agent may correctly add nothing. That finding is unchanged by this
round: REQ-WVR-08 and FSPEC EC-20 both carry the same overstatement they carried at v3, and neither
was edited. Per the delta protocol I do not re-file a finding this round's edit did not touch; it
stands where v3 filed it, still owed to te-author at PROPERTIES authoring, and the counts below
reflect this round's table only, not the cumulative backlog.

## Acceptance Tests

The cascade question over §6 is narrow: does any AT's **oracle**, **fixture precondition**, or
**discriminating value** depend on REQ bytes this erratum rewrote? I checked each of the three hunks
against the AT set rather than sampling.

| Hunk | Could it move an oracle? | Finding |
|---|---|---|
| E-1 (version bump, revision-log note) | No AT cites a REQ version number | none |
| E-2 (§5 BL-04 states unmet) | BL-04 is a *blocker row*, not a criterion; no AT asserts over it | none — but see the precondition note below |
| E-3 (OB-1 worktree evidence consumer-local) | Only EC-17 is worktree-shaped, and it has no AT of its own; it is discharged through EC-01's shape | none |

**No AT changes.** In particular the three set-equality ATs that OB-F5 pins — AT-02 (disregard causes
IG-1..6 as *announced reasons*, IG-1's arms included), AT-13 (the outcome catalogue closed at three),
AT-08 (the recognised `implementation.*` key set) — target catalogues defined in REQ-WVR-02,
REQ-WVR-05/08 and the config criterion respectively, none of which this round edited. Their
cardinalities are unchanged at HEAD, so the set-equality oracles keep exactly the discriminating
power they were written with. AT-12's four conjuncts likewise rest on REQ-WVR-08's outcome-(c)
paragraph, untouched. AT-18's plan-absolute high-water-mark fixture rests on §1's OF-1 wave count,
untouched this round.

**One precondition note, not a finding.** E-2 makes REQ agree that BL-04 is unmet. Nothing in §6 may
be relaxed on the strength of that agreement. AT-14 in particular is preconditioned on a tree in
which the root-anchored `.gitignore` rule is readable; that rule is not in this branch's tree, so
AT-14 is expected **RED until the rebase**, and the correct response at PROPERTIES authoring is to
keep it red-and-pending, never to rewrite its oracle into an absence-only form ("no churn observed")
that would pass in a tree lacking the mechanism entirely. An absence-only reformulation would be a
High finding at PROPERTIES review; recording it here so the cascade does not tempt one. The same
caution applies to any AT that might be tempted to prove EC-17 by asserting a tracked include-list
fact — after E-3 there is no tracked fact to assert, and such an oracle would false-green on every
consumer.

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
