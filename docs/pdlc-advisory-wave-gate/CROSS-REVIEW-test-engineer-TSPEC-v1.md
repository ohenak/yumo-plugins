# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.11)
**Date:** 2026-08-20
**Iteration:** 1 (delta confirmation, erratum round)
**Delta under confirmation:** `b6eab7f1..HEAD` (6 commits, +67/-26)
**Upstream at dispatch:** REQ v1.15 `sha256:c62cfc35…`, FSPEC v1.6 `sha256:91ef2557…` — both re-hashed on disk and matching.

## Overview

The routed item list arrived empty — every item was reported ABSORBED against upstream HEAD — so
this confirmation is governed entirely by DEC-ERR-03: the question is not whether a list landed but
whether this TSPEC is still a faithful compression of REQ v1.15 and FSPEC v1.6 as they now read.

I re-hashed both upstream documents on disk before reading anything else. They match the dispatch
digests exactly, so the text I checked against is the text the orchestrator pinned.

The delta is a re-grounding round, and its shape is unusual in a way that matters for this lens:
nothing in the mechanism moved. Every edit converts a *conditional* into a *decided* statement.
Before this round, §2.5, §3.3, §5.2, §5.5, §5.6 and three OQ rows described the ignored-path
boundary as a TSPEC narrowing pending an upstream erratum, and instructed PLAN to mint red-test
tasks with expected values marked pending. Upstream has since decided that boundary — in this
document's favour — so the erratum flags are retired and the expected values are transcribed.

That is exactly the right disposition for the testing lens, and it is the one thing this round had
to get right: a test task whose expected value is "pending" is not yet a test. Six sections'
worth of pending markers becoming concrete assertions is a net gain in testability, and the one
genuinely new assertion the round adds (§5.2 case 5, the observation-point ordering oracle) closes
a gap that nothing in this document previously asserted at all.

## Architecture

**§2.5's restoration boundary — verified against BR-9 at HEAD, verbatim.**

The rewritten `clean -fd` bullet now claims the boundary is upstream's and decided. I read FSPEC
BR-9 at HEAD rather than trusting the claim. BR-9 states its **Domain** as "the path-to-content-hash
map over tracked files and **non-ignored** untracked files, generated outputs included", and spells
out the both-directions exclusion: "`.gitignore`d paths are outside restoration's reach … and an
ignored path the re-gate mutated is not a restoration defect." REQ AC-5.1 at HEAD excludes them for
the reason the TSPEC quotes — "operator files A6 never wrote and never restores over". Both quoted
fragments are verbatim, not paraphrase. The transcription is faithful.

The bullet also states what is *not* built — the scoped ignored-path capture the earlier draft held
in reserve — and says why: the decision that would have required it did not come back. Naming the
abandoned branch rather than silently dropping it is what lets a later reader tell a closed option
from an overlooked one.

**The new observation-point bullet is the load-bearing addition.**

It pins that the `restore:` sequence is complete at `git reset --mixed {head}`, with the driver's
record and escalation writes (§3.2 step 7) falling outside the comparison rather than interleaved
with it. This is the architectural claim the new §5.2 case 5 tests, and the two agree: the design
says the observation point is before the carriers, and the test asserts the ordering. Upstream
supports it — BR-9's **Observation point** clause and REQ AC-5.1's exclusion of the three record
carriers both say so, and BR-9 gives the falsification reason the TSPEC reproduces ("an observation
taken after them differs by exactly the bytes BR-13 mandates").

One imprecision, recorded as Low rather than passed over. §2.5's new bullet opens "**BR-9 and
AC-5.1** take the map immediately after restoration completes and before" a list of **three**
carriers — AC-6.1's record append, AC-6.2's escalation-log append, and AC-5.2's queue-row write
(M-WG-7). REQ AC-5.1 does name all three. FSPEC BR-9 names only two ("the record and escalation
writes BR-13 requires") and does not reach the queue-row write. The joint attribution therefore
over-reads BR-9 by one carrier. The *substance* is safe — the TSPEC excludes a superset, which is
the stricter reading and is what AC-5.1 independently requires, so no test is mis-specified — but
the attribution should name AC-5.1 for the third carrier. §5.6's AT-05-1 row gets this right,
citing BR-9 only for "immediately-after-restoration-before-the-record-writes".

## Interfaces

**§3.3's `apply` row.** The edit narrows one clause and closes one branch. The refusal of an
ignored-path-only repair — `producedPaths() === []` ⇒ `{ok:false}` ⇒ `post-action-verification-failed`
— is unchanged in behaviour; what changes is that it is now "the right disposition under §2.5's
now-decided boundary" rather than "the right disposition while §2.5's boundary sits with upstream",
and the conditional tail ("if the erratum widens BR-9's oracle, the widened capture arrives with a
widened `producedPaths` and this row is unchanged") is replaced by the statement that no widened
`producedPaths` is coming.

From the testing lens this is a strict improvement in falsifiability. The old row specified a seam
whose expected `producedPaths` domain depended on an undecided upstream question, which means the
seam's test could be written but its *fixture* could not be finalised. The row now names a single
domain, so §5.5's ignored-path-only row has final expected values.

The rest of the row is untouched and I re-read it to confirm the erratum did not disturb what I
previously approved. The step-6 anchor contract survives intact: `ledgerAnchor.value =
invocations.length` as `apply`'s first statement, written **into the caller's carrier** rather than
a local or a property on the returned SeamOps object, with the stated reason (neither would be
readable at step 6). The `orchestrate-dev.js:3521` / `:3544` ordering citations are unchanged. Those
two anchors are raw `file:line` citations, but they are runtime-position claims about call ordering
— the position is the claim — so DEC-DOC-01's carve-out applies and they are not findings.

`producedPaths`, `revert` and `verifyGate` rows are byte-identical in the delta. I re-read
`verifyGate`'s ledger-growth contract specifically, because §3.3's `apply` change moves the anchor
semantics' neighbourhood: the "growth since the last `apply`, not a suffix" rule and its two-attempt
justification are unaffected by the ignored-path decision, and the two mutation fixtures §5.5 owes
it are still allocated.

**§4.4's `nonNegativeInt` and the OQ-1 closure.** The delta withdraws OQ-1's "the behaviour is
coherent but undocumented upstream" clause. I checked whether upstream now documents it, since the
withdrawal is only correct if it does.

FSPEC E-33 at HEAD carries every conjunct the revised OQ-1 row claims for it, verbatim: an explicit
`0` is "**honoured as written**", not treated as misconfiguration; the sixth summary row is
"**present** and reads `resolved: 0`"; it carries "one `escalated` invocation per red wave, each
classed `unclassified` because no reply was ever classified (BR-2)"; and the key "validates as a
**non-negative** integer — a distinct variant from the shipped positive-integer validator, which
rejects `0` and substitutes the default". AT-07-2b at HEAD carries the companion the row cites:
"`0` in yields `0` back, key absent from the invalid-key report".

So the withdrawal is earned, and the `nonNegativeInt` type in §4.4 (`Number.isInteger(v) && v >= 0`)
is a faithful transcription of a documented upstream validator rather than a TSPEC invention. The
distinction matters for the test task: a validator the TSPEC invented would need its own
justification in PROPERTIES, whereas a transcribed one is tested by transcribing AT-07-2b.

§4.4's config table row for `waveBudgetPerRun` (`integer ≥ 0`, default `1`, validator
`nonNegativeInt`) is consistent with E-33 on every field — value domain, default, and the reason `0`
is a legal configured value rather than a misconfiguration. No enum, range or return-type divergence
against upstream in the delta.

## Data Model

## Test Strategy

## Open Questions

## Delta-Confirmation Findings

## Verdict
