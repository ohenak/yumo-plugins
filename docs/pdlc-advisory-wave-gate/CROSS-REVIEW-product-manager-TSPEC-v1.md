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

The delta touches exactly one seam row, §3.3's `apply`, and only its dispositional prose.

**What changed.** The row's behaviour is untouched: `apply` dispatches the repair edit and returns
`{ok:true}` **iff `producedPaths()` is non-empty**; an empty set is `{ok:false}` ⇒
`post-action-verification-failed`. What changed is the *justification* for the consequence that a
repair writing only `.gitignore`d paths reads as no change and is refused. Previously: "the right
disposition **while §2.5's boundary sits with upstream**", with a stated conditional — "if the erratum
widens BR-9's oracle to ignored generated outputs, the widened capture arrives with a widened
`producedPaths` and this row is unchanged." Now: "the right disposition under §2.5's **now-decided**
boundary … BR-9 at FSPEC v1.6 puts ignored paths outside the restoration map in both directions … the
widened-oracle branch this row previously held in reserve is closed — no widened `producedPaths` is
coming."

**Product assessment.** Three things matter to me here and all three hold.

1. **The disposition did not change, only its standing.** An ignored-path-only repair was refused
   before and is refused now, with the same reason code. No user-visible behaviour moved under cover
   of a citation update — which is the failure mode I look for hardest in an erratum round.
2. **The conditional was resolved in the direction that leaves the row untouched, and the row says
   so.** The old text was explicit that it was "unchanged in either direction". Upstream picked one
   direction; the row records which, and closes the branch. Nothing dangles.
3. **The refusal is still traceable to a requirement, not to engineering taste.** The stated reason —
   "the seam refuses to claim a repair it cannot see, cannot restore, and cannot prove was undone" —
   is a restatement of AC-5.1's guarantee (the tree is observably identical after a refusal) applied
   to a repair whose paths sit outside that guarantee's domain. Under BR-9 at HEAD, an ignored path
   the seam wrote is not something restoration will undo; so a seam that reported `{ok:true}` on it
   would be claiming a repair AC-5.1 cannot promise to reverse. Refusing is the faithful reading, and
   it is now the *only* reading upstream permits.

**Traceability check on the surrounding row.** The rest of the `apply` row is unchanged context —
the step-6 ledger anchor (`ledgerAnchor.value = invocations.length` written into the caller's
carrier), and the `producedPaths` / `revert` / `verifyGate` rows beneath it. I confirmed the diff does
not touch them. The `orchestrate-dev.js:3521` / `:3544` anchors in that row are raw `file:line`
citations into production source, which DEC-DOC-01 would discourage in new text — but they are
pre-existing bytes this edit does not touch, and DEC-DOC-01's own **Scope** clause says it "does not
require retrofitting citations already committed". Not a finding of this round, and I am recording
that judgement so a later reviewer does not re-litigate it.

**No interface is added, removed or reshaped by this delta.** `buildA6SeamOps` keeps its four-member
surface; no new seam, no new return shape, no new reason code. There is nothing here for the product
lens to object to, and nothing that reopens a scope question.

## Data Model

The delta does not edit §4. It does, however, make one claim *about* §4 in the changelog and one in
§6's OQ-1 row, and both are load-bearing for a contract-fidelity question I am obliged to check:
whether the engineering types still match the REQ/FSPEC definitions value-for-value.

**The claim.** OQ-1 previously read: `waveBudgetPerRun: 0` is "accepted as configured, per E-33; the
behaviour is coherent but **undocumented upstream**. See the FSPEC erratum on E-33." The delta closes
it: E-33 at v1.6 "states `0` is 'honoured as written', the summary row present and reading
`resolved: 0` with one `escalated` invocation per red wave classed `unclassified`, and pins the key as
a **non-negative** integer distinct from the shipped positive-integer validator; AT-07-2b tests
'`0` in yields `0` back'. §4.4's `nonNegativeInt` is the transcription."

**Verified against FSPEC E-33 at HEAD.** Every conjunct is there, verbatim:

| TSPEC claim | FSPEC E-33 / AT-07-2b at v1.6 | Match |
|---|---|---|
| `0` "honoured as written" | "An explicit `0` is **honoured as written**, not treated as misconfiguration" | yes |
| summary row present, `resolved: 0` | "the sixth summary row is **present** and reads `resolved: 0`" | yes |
| one `escalated` invocation per red wave | "carrying one `escalated` invocation per red wave" | yes |
| classed `unclassified` | "each classed `unclassified` because no reply was ever classified (BR-2)" | yes |
| key validates as **non-negative** integer, distinct from the shipped positive-integer validator | "The key therefore validates as a **non-negative** integer — a distinct variant from the shipped positive-integer validator, which rejects `0` and substitutes the default" | yes |
| AT-07-2b tests "`0` in yields `0` back" | AT-07-2b: "Companion: `0` in yields `0` back, key absent from the invalid-key report" | yes |

So the withdrawal of the "undocumented upstream" clause is correct: it *was* undocumented at FSPEC
v1.4 and it *is* documented at v1.6. The clause is stale and dropping it is the right edit.

**Contract-fidelity diff on the type itself.** §4.4's config row for `waveBudgetPerRun` reads
`integer ≥ 0`, default `1`, validator `nonNegativeInt` (`Number.isInteger(v) && v >= 0`, §3-side at
line 694). Against E-33's "non-negative integer … default `1` … rejects `0` and substitutes the
default" for the *shipped* validator that this key deliberately does **not** reuse: the range, the
default and the validator identity all match, and the divergence from the shipped validator is the
one upstream explicitly mandates rather than an unmarked internal variant. No enum value, numeric
range or return type in the delta diverges from its REQ/FSPEC definition. Nothing to flag.

**One thing I checked and want to record as clean rather than silent.** §4.4's row also carries a
product statement — that `0` is "the **intended operator configuration** … 'keep the tier on, keep A6
off'", with the note that this pairing "has no documentation carrier in scope, PM F-01" and that the
example config teaches only the shipped defaults. That is a scope boundary I set in an earlier round,
and this delta does not disturb it: E-33 at v1.6 documents the *behaviour* of `0` but says nothing
that would oblige an operator-facing doc, so no new documentation obligation arrives with the
re-grounding. The earlier disposition stands unamended and correctly so.

**No state or schema element is added, removed, widened or narrowed by this delta.**

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
