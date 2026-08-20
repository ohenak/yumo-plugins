# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation, FSPEC)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.2, sha256:85888c03…, commit `d140fbee`)
**Upstream re-read:** FSPEC `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (sha256:ae75fa62…, v0.13)
**Date:** 2026-08-20
**Iteration:** 6 (upstream-cascade — FSPEC moved v0.12 → v0.13, DECISIONS did not)

## Context

DECISIONS' own bytes have not moved since v4 (`APPROVAL-HASH: sha256:85888c03…`, commit `d140fbee`).
What moved is **FSPEC**. My v5 confirmation recorded `UPSTREAM-STATE: FSPEC sha256:fb18dbda…`, which
is commit `c1d7218e`, FSPEC **v0.12**. HEAD is sha256:ae75fa62…, commit `cfb3d4d6`, FSPEC **v0.13**.
Six commits landed on that path in between, all one erratum round:

| Commits | Substance |
|---|---|
| `eeafa236`, `402185b3` | **BR-6's byte-accounting basis is re-decided: material only.** A document's *contributed bytes* are now "the section headings and bodies taken from it, and nothing else"; the identification line, the per-document delimiters and source-path label, and the block's preamble are "charged to no threshold". The pre-round text said the opposite — contributed bytes were "every byte the block carries on its account: its identification line, its delimiters and source-path label (BR-7), **and** the section headings and bodies taken". `RSN-NO-MATERIAL`'s catalogue gloss widens to cover the zero-bound case. |
| `c33bec50` | `maxBytesPerDocument: 0` is decided: no document yields material, each is dropped with `RSN-NO-MATERIAL` before the total bound, consumes no slot, and the run is BR-14's enabled empty-selection run. Recorded as **E-36**, exercised by **AT-30** (third zero, beside `maxDocuments: 0` and `maxTotalBytes: 0`). D-12's question restated from "carries any priority section" to "yields any material". |
| `5dcd00e0` | **F-O-1 widens**: TSPEC now owns *two* heading-recognition rules — the BR-3 document-shape predicate **and** the rule by which a heading counts as one of BR-6's named sections — both bounded by bytes-only and no-model-call. |
| `0884fe45`, `cfb3d4d6` | The v0.13 erratum block and the changelog row recording the three decisions. |

Per DEC-ERR-03 my scope is this DECISIONS measured against FSPEC **at HEAD**, not against the item
list: any claim this document leans on that FSPEC no longer says, or no longer says the same way, is
a finding of this round. So I re-read, at HEAD, every FSPEC section DECISIONS reaches into — BR-6's
byte-accounting paragraphs, BR-6's per-document-bound paragraph, BR-7, the reason catalogue, the
D-1…D-12 decision table, §Edge Cases E-25/E-36, AT-30, and the F-O-1…F-O-4 obligations table — and
then re-read DECISIONS' every byte-flavoured claim: `DEC-LI-05`'s composition and BR-7 citation,
`DEC-LI-06`'s read-cost framing, `DEC-LI-08` in full, `DEC-LI-10`'s catalogues, the §Decisions
deliberately NOT taken table, §Consequences, and obligations `D-O-1`…`D-O-9`.

The delta is narrower than v5's in reach but sharper in kind. v5's trigger (TSPEC v0.6 → v0.7) moved
upstream **toward** this document. This one moves a **quantity definition** underneath it: the same
three threshold names now bound a strictly smaller set of bytes than they bounded when `DEC-LI-08`
was written and approved. That is exactly the class of drift where a decision survives intact while
the sentence expressing it stops being true of the upstream it compresses, so it is where I spent
this round.

## Options Considered

**(a) The delta invalidates a decision — non-approving, a `delta/local` High.** The reading that
could have earned this is `DEC-LI-08`: it is the entry that *is* about bounding, and the round
redefined what the bounds bound. I checked it first, and the test I applied is whether any
`D-O` obligation loses falsifying power or any decision's chosen shape becomes wrong. Neither
happens. `DEC-LI-08`'s decision is **static caps only, no dynamic budget**, and its two rejections
(measure-the-prompt, fraction-of-prompt) turn on authority and determinism, not on which bytes the
caps count. Narrowing the counted set from framing-plus-material to material-only leaves both
rejections standing verbatim and leaves the caps applied unconditionally. Similarly `DEC-LI-05`'s
byte-identity-by-construction is untouched: an empty selection still concatenates `""`, and the
v0.13 zero-bound case reaches that same empty-selection path (E-36 explicitly routes to BR-14's
enabled empty-selection run), so `DEC-LI-05` gains a **new** empty-selection input rather than a
counterexample. Reading (a) has no support in the bytes.

**(b) Nothing to say — approve silently.** Wrong, and for a reason that is easy to under-weight
because the decisions themselves are fine. `DEC-LI-08` states that "the injection is bounded a
priori" and hands `D-O-4` downstream as the obligation that closes C-8's acknowledged gap: report
"realised prompt sizes **against REQ §4.1's caps**". Under material-only accounting those two
quantities are no longer the same quantity — a realised block is its material *plus* framing FSPEC
now charges to no threshold, so a conforming run routinely renders a block larger than
`maxTotalBytes`. An operator holding `D-O-4`'s report next to §4.1's caps, per the sentence this
document wrote, reads an overrun that is not one, or is told to move a cap that was never binding on
the thing that grew. The obligation is the closing condition for the one gap this document
deliberately left open; leaving it phrased against a superseded accounting basis is precisely the
citation-currency class DEC-ERR-03 asks a cascade round to catch.

**(c) Faithful-but-drifted — approve, with tagged non-gating findings.** This is what the bytes
support. No decision is invalidated; no `D-O` obligation is voided; the compression still holds
everywhere it makes a behavioural claim. What drifted is (i) two sentences whose **quantity
semantics** FSPEC changed underneath them (`DEC-LI-08`'s "bounded a priori" framing and `D-O-4`'s
caps comparison), and (ii) one obligation, `D-O-3`, whose `extractInjectableMaterial` property is
now stated over a bound domain that includes a value FSPEC has since given a **different** outcome
than the property's own clause predicts. Both land in the next revision of DECISIONS; neither
reopens a decision, and neither blocks the phase.

## Decision

_pending_

## Consequences

_pending_

## Delta-Confirmation Findings

_pending_

## Recommendation

_pending_

## Verdict

_pending_
