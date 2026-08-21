# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.11)
**Date:** 2026-08-20
**Iteration:** 1 (delta confirmation on a previously approved TSPEC)
**Round type:** erratum delta confirmation — every routed item reported ABSORBED against upstream HEAD
**Upstream measured against (verified at dispatch):**
REQ v1.15 `sha256:c62cfc35…` · FSPEC v1.6 `sha256:91ef2557…` — both hashes recomputed on disk and matched.

## Overview

**The question this round answers.** I previously approved this TSPEC. A targeted erratum edit
(v1.11, commits `ef569269`…`95d8d2e4`) has landed. The dispatch reports every routed item ABSORBED
against upstream HEAD — nothing left to confirm on the item list — so the whole of my scope is the
second question DEC-ERR-03 puts: measured against REQ v1.15 and FSPEC v1.6 **as they now stand**, is
this TSPEC still a faithful compression of its upstream? Anything it cites that upstream no longer
says, or no longer says the same way, is a finding of this confirmation whether or not it was routed.

**What the delta is.** 67 insertions, 26 deletions, one file, and it is almost entirely a
*re-grounding* rather than a design change. REQ moved v1.9 → v1.15 and FSPEC v1.4 → v1.6 underneath
this document. In that interval upstream **decided** the one boundary this TSPEC had been holding
open: whether BR-9's restoration oracle ranges over `.gitignore`d paths. It decided it in this
document's favour. The edit's work is therefore to stop describing §2.5's mechanism as a TSPEC
narrowing pending upstream and restate it as the transcription of a settled rule — at §2.5, §3.3's
`apply` row, §5.2 (case 4, plus a new case 5), §5.5's ignored-path-only row, §5.6's AT-05-1 row, and
§6's OQ-1 / OQ-7 / OQ-9 / OQ-11. No mechanism moves.

**How I checked it.** I did not re-read the document. I diffed the erratum, then went to upstream at
HEAD and read the cited text verbatim — FSPEC BR-9, AT-05-1, AT-05-2, E-23, E-33, AT-07-2b; REQ
AC-5.1, AC-5.2, and the v1.14/v1.15 changelog entries — and compared each against the sentence in the
TSPEC that leans on it. I also recomputed both upstream hashes on disk against the ones in the
dispatch; they match, so the text I read is the text I was asked to measure against.

**The headline.** The re-grounding is sound and, unusually for a round of this kind, it is *honest in
the direction that costs the author something*: the changelog records the retired flags, records that
the reserved fallback design (a scoped ignored-path capture) is now **not built**, and records the one
routed item it declines to edit for — with the reason — rather than performing an edit to look
responsive. Every quotation I spot-checked is verbatim and in context. One Low citation-precision nit
is all I found, and it is a version pin, not a claim. Nothing is gating.

**Scope note.** Product lens only: requirements traceability, scope compliance, acceptance-criterion
fidelity. Mechanism quality, test construction and code shape belong to my SE and TE colleagues, and
I have left them there.

## Architecture

§2.5 is where the delta does its real work, and it is the section I read hardest, because it is the
one that used to contain a self-declared narrowing of an acceptance criterion.

**The old posture, and why it was right at the time.** Before this round, §2.5 said, in effect: *the
mechanism runs `clean -fd`, not `-fdx`, so ignored paths are outside it; but FSPEC BR-9 and REQ AC-5.1
state the oracle with no ignored-path carve-out, so the mechanism is narrower than the criterion, and
this TSPEC will not narrow AC-5.1 by design choice — the carve-out is raised as an erratum and this
section transcribes whatever comes back.* That was exactly the right handling of an
engineering-vs-requirement gap: name it, refuse to resolve it in the engineering layer, route it up.

**The new posture, verified against HEAD.** Upstream came back, and it came back agreeing. I read
both sources:

- **FSPEC BR-9 at v1.6** now states two boundaries "rather than left to the fixture author."
  **Domain:** "`.gitignore`d paths are outside restoration's reach — A6 never deletes or rewrites
  one, so `node_modules/`, tool caches, `.env` and the run's own untracked wave ledger are outside the
  map in both directions, and an ignored path the re-gate mutated is not a restoration defect." The
  map itself is "over tracked files and **non-ignored** untracked files".
- **REQ AC-5.1 at v1.15** excludes "paths ignored by `.gitignore`, which are operator files A6 never
  wrote and never restores over."

§2.5's rewritten bullet quotes both of these clauses verbatim and in context. Its claim — "**This is
no longer a TSPEC narrowing of AC-5.1; it is the transcription of the decided boundary**" — is true:
the mechanism did not move, the criterion moved to meet it, and the document now says so. This is the
correct resolution of the gap I would have wanted, arrived at through the routing path rather than
around it.

**The retired fallback is retired explicitly.** The old bullet held a conditional design in reserve:
if upstream had instead held ignored generated outputs *inside* the oracle, the mechanism would grow a
scoped ignored-path capture over the post-wave pathspecs only. The new bullet closes it in one
sentence — "is not built: the decision that would have required it did not come back." I want to name
this as a positive: an author under erratum pressure could have quietly deleted the reserved branch
and left a reader of v1.10 wondering where it went. Recording its death is the more useful act.

**The new observation-point bullet is new material, and it is grounded.** The edit adds a second
bullet pinning *when* the map is taken. Checked against both sources:

- **BR-9 at v1.6:** "the map is taken immediately after restoration completes and **before** the
  record and escalation writes BR-13 requires; both carriers are files inside the tree, so an
  observation taken after them differs by exactly the bytes BR-13 mandates (AT-05-1, AT-06-1)."
- **REQ AC-5.1 at v1.15:** "The observation point is the moment restoration completes: the record
  carriers the run still owes afterwards — AC-6.1's record append, AC-6.2's escalation-log append, and
  AC-5.2's queue-row write (M-WG-7) — are excluded from the comparison."

The TSPEC bullet names all three carriers, in AC-5.1's own terms, and draws the design consequence
that follows from them: the `restore:` sequence is complete at `git reset --mixed {head}`, and the
driver's record/escalation writes at §3.2 step 7 fall *after* it, "outside the comparison, never
interleaved with it." That is a faithful reading, and it is also the reading FSPEC E-23 independently
requires — "'Restored' is BR-9's observation point, not the last byte written: the halt path still
appends the record and escalation entries BR-13 requires." The TSPEC, BR-9, AC-5.1 and E-23 all agree.

**One carrier-list nuance, and it is the source of my only finding.** AC-6.2's escalation-log append
entered AC-5.1's excluded-carrier list only at **REQ v1.15** (v1.15 changelog: "AC-5.1's
excluded-carrier list adds AC-6.2's escalation-log append (TE F-01, High)"); the ignored-path
exclusion and the observation point landed one revision earlier, at v1.14 (commit `c58fd61d`). §2.5's
bullet pins the ignored-path clause to "REQ AC-5.1 at v1.14" — accurate, that clause is v1.14's — and
its observation-point bullet correctly carries the full **v1.15** three-carrier list without a version
pin. So §2.5 itself is consistent. §6's OQ-7 row is where the two get conflated; see **Open
Questions** and F-01. It is a citation-precision nit, not a fidelity break: the substance transcribed
is HEAD's.

**Scope compliance.** No product decision is being made in this section. The one place the document
could have made one — choosing the ignored-path boundary itself — is precisely the place it declined
to, twice: it refused in v1.10 by routing the erratum, and in v1.11 it takes the answer from upstream
rather than from its own convenience, even though its own convenience happened to win.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
