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

_pending_

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
