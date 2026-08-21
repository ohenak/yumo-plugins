# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 2
**Round type:** upstream-cascade confirmation (TSPEC bytes unchanged; REQ moved v1.15 → v1.16)
**Scope:** TSPEC measured against upstream at HEAD

## Overview

I approved this TSPEC at v1 (`REVIEWED-COMMIT: 95d8d2e4`) with one Low finding and no gating
findings. Its own bytes have not changed since. What moved is REQ, in exactly one commit —
`30d8bf7b`, v1.15 → v1.16, 12 insertions / 2 deletions — and my approval was recorded against
REQ `sha256:c62cfc35…`, a version that no longer exists. FSPEC is byte-identical to the version I
approved against (`sha256:91ef2557…`, matching my v1 `UPSTREAM-STATE` line), so the whole cascade
surface is the REQ delta.

**The one question:** does this TSPEC still hold as approved against REQ as it now stands?

**Answer: no.** REQ v1.16 landed a new operator-facing conjunct on **AC-6.3**, and TSPEC compresses
it nowhere. The condition that triggers the new obligation is live in this TSPEC's own design, not
hypothetical, which is what makes the gap a real one rather than a bookkeeping mismatch.

The REQ delta, in full — two sentences appended to AC-6.3:

> *"Where the halt report points the operator at a captured pre-A6 tree state, it also warns, in the
> same place, that re-running this feature overwrites that capture — so an operator who intends to
> inspect it preserves it first, rather than losing it to the ordinary next action after a halt
> (DEC-A6-03). The capture's name and storage form stay TSPEC's (O-1)."*

The v1.16 changelog states the round's intent plainly: it lands DEC-A6-03's operator-facing
halt-message obligation, "routed since round 5 and previously unlanded," raised this round by SE, PM
and TE alike. Nothing else in REQ changed; no decision was reopened.

**What I am not doing here.** I am not re-reviewing the TSPEC, and I am not reopening settled
matters — the wave-scoped ref name with no run discriminator (§2.5, §6 OQ-2, PM F-02/F-03 of round
5) is a settled design decision and I am not relitigating it. The finding below is not "the
overwrite should not happen"; the overwrite is accepted. It is "REQ now requires the operator to be
**told** about it at the halt, and this TSPEC does not say where that telling lives."

## Architecture

### The new obligation's condition is live in this TSPEC, not vacuous

AC-6.3's new conjunct is conditional: it binds *where* the halt report points the operator at a
captured pre-A6 tree state. A conditional obligation over a condition that never fires would be a
non-finding. Here the condition fires, and it is this TSPEC that makes it fire. §2.5:

> *"E-28's halt names the ref for the halting wave, which is the difference between 'A6 left a tree
> it could neither repair nor restore' and 'A6 left a tree, and here is the object name that has the
> original in it'."*

That is precisely "the halt report points the operator at a captured pre-A6 tree state." So on
TSPEC's own design, AC-6.3's antecedent is satisfied on the E-28 path, and its consequent — the
same-place warning — is required.

### The TSPEC knows the hazard, and answers it at the wrong altitude

This is not a design that overlooked the overwrite. §2.5 states it more precisely than REQ does:

> *"The name is derived from the wave number alone, so a re-run of a halted feature — the ordinary
> next step after a halt — reaches wave 1, captures, and overwrites `refs/pdlc/a6-snapshot-1`, the
> very ref the operator was told to keep."*

and it names the remedy:

> *"An operator who wants a snapshot to survive the next run should copy the ref before re-running."*

The analysis is right and the remedy is right. The gap is **where the remedy is delivered.** As
written, it is delivered to the reader of the TSPEC — a design-document sentence addressed to
engineers. REQ v1.16 requires it delivered to the operator, *in the halt report, in the same place*
the ref is named. Those are different artifacts with different audiences. An operator reading a halt
message is not reading §2.5. The whole point of DEC-A6-03's routing, and of the "in the same place"
clause REQ chose, is that the warning must reach the person at the moment they are deciding what to
do next — which is exactly the moment they are about to re-run.

`grep -c overwrit` over the TSPEC returns matches only in §2.5's design prose and §6 OQ-2's
disposition. Neither is a contract on the halt report's content.

### Why this is High rather than Medium

REQ AC-6.3 is an acceptance criterion on US-02, and this conjunct exists to prevent a concrete,
irreversible user loss: an operator halts, is handed a ref, does the ordinary next thing (re-run),
and the ref they were told to keep is gone. TSPEC §2.5 itself concedes the cost is "the operator's,
not the pipeline's" — which is the argument for *telling the operator*, not for leaving it
undocumented at the halt. A design that does not carry a P0-path acceptance criterion has dropped
it, and no downstream author (PLAN, PROPERTIES, implementation) would mint work for it.

## Interfaces

### There is no seam in this TSPEC that could carry the warning

I traced every surface that could deliver an operator-visible sentence at a halt, to check whether
the obligation lands somewhere already and I simply missed it. It does not.

| Surface | §  | Carries the ref? | Could carry the warning as specified? |
|---|---|---|---|
| `haltError(TEST_GATE_MESSAGE, { advisory })` | §2.3, §4.5 | no | **No** — §2.3 pins the reason string to the pre-A6 literal template, byte-compared by AT-05-3 |
| `haltError`'s `fields` object | §4.5 | no | **No** — closed four-field set, see Data Model below |
| `formatUnskipViolations` message | §4.5 | no | **No** — §4.5 states "Message string unchanged" as a contract |
| E-28 restore-failure halt | §2.5, §3.5 | **yes** | Unspecified — TSPEC says the halt "names the ref" but never transcribes the message |
| Report `notices` | §4.5 | no | Not evaluated as a carrier anywhere in the document |
| `restoreTreeSnapshot` / `captureTreeSnapshot` | §3.5 | writes the ref | Not a reporting surface |

The E-28 row is where the confirmation turns. §2.5 asserts, as a design property, that E-28's halt
names the ref — but no section of the TSPEC gives that message's content, template, or oracle the
way §2.3 and §4.5 do for the test-gate and un-skip halts. So the one halt that satisfies AC-6.3's
antecedent is the one halt whose message this document leaves unspecified. Before v1.16 that was
tolerable; the message content had no requirement bearing on it. At v1.16 it is the exact place a
requirement now bears, and the specification is silent.

**What would resolve this, at TSPEC altitude.** Give the E-28 halt the same treatment §4.5 already
gives the capture-failure halt: name its message, or name the field that carries the ref, and
attach the overwrite warning to it as a transcribable literal. REQ explicitly reserves the capture's
name and storage form to TSPEC (O-1), so TSPEC is the right owner of the sentence's exact wording —
what it may not do is leave the sentence unwritten.

### Blocking dependency: FSPEC is silent too

FSPEC has not changed and does not carry this obligation either — E-28 (`FSPEC:309`, quoted by id
not anchor) says only that "the wave halts," and AT-05-5 asserts only that the halt "names the
failed restoration." SE's FSPEC v4 cascade review raised its own High on exactly this. So the
correct sequencing is FSPEC first (the observable and its acceptance test), then TSPEC (the message
and the ref's form). I am flagging this so the TSPEC author is not asked to invent a product
observable that belongs one level up — the fix here is downstream of the FSPEC round, not
independent of it.

## Data Model

### §4.5's halt-field set is closed, and closed against the new conjunct

§4.5's "Halt fields" row specifies `haltError`'s `fields` as `{rootCause, diagnosis, repairApplied,
repairPaths}` — "at the literal values named below." Four fields, enumerated, with transcribed
values for the capture-failure path. None of them is a ref name and none is a warning. The set is
presented as exhaustive, and §4.5's capture-failure table reinforces that by fixing every one of the
four to a literal.

That closure is a deliberate and good property — it is what lets §5.5's fixture assert values rather
than compare against whatever the implementation emits. But it means the warning cannot arrive by
extension without an explicit decision to extend, and the document currently records no such
decision. AC-6.3's new conjunct therefore has no home in the data model.

### One claim in §4.5 has become an overclaim against REQ at HEAD

The un-skip halt row states:

> *"Message string — unchanged. `formatUnskipViolations`'s output is not rewritten. The diagnosis
> travels in `fields`, never in the reason string, which is what lets AT-05-3's literal comparison
> and AC-6.3 both hold."*

Read against REQ v1.15 that was true. Read against REQ v1.16 it is not: AC-6.3 now has two conjuncts
and this argument discharges only the first. Worse, the rule it establishes — nothing operator-facing
may enter the reason string — is the rule that forecloses the most natural carrier for the second
conjunct. The claim needs re-derivation, not deletion: the same reasoning may well still hold if the
warning travels in `fields` alongside the ref, but the document must show that rather than assert a
conclusion reached against superseded upstream.

Similarly §4.5's Snapshot-ref row says the ref is "never overwritten by a later wave (§2.5, PM
F-03)". That remains literally true and I am not flagging it as wrong — but a reader who stops at
§4.5 and never reaches §2.5's re-run paragraph takes away the opposite of what AC-6.3 now wants an
operator to know. Whatever wording lands, these two rows should not read as reassurance in one place
and a hazard in another.

### What has *not* drifted

I re-read the rest of the TSPEC's REQ citation surface against REQ v1.16, since the cascade rule is
"anything it cites that upstream no longer says." REQ's edit touched exactly two hunks — the version
row plus a new changelog paragraph, and AC-6.3's body. No other AC, business rule, edge case,
constraint or obligation moved. I re-verified the TSPEC's citations of AC-5.1, AC-5.2, AC-6.1,
AC-6.2, AC-6.4, AC-3.4, AC-4.1, O-1, O-2 and O-4 against HEAD: all still say what this TSPEC says
they say, in the same way. The cascade surface is AC-6.3 alone.

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
