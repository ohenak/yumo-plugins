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

_pending_

## Edge Cases and Error Scenarios

_pending_

## Acceptance Tests

_pending_

## Open Questions

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
