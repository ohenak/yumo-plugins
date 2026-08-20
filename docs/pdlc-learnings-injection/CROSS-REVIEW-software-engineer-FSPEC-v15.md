# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md (v0.13)
**Date:** 2026-08-20
**Iteration:** 15 (delta confirmation of the v0.13 erratum)

## Overview

Delta confirmation of the v0.13 erratum (commits `eeafa236` … `cfb3d4d6`) against the v0.12 bytes
I approved at v14. Three decisions were asked for: BR-6's byte-accounting basis, the
`maxBytesPerDocument: 0` edge, and an owner for the section-heading recognition rule. All three
land, and each lands in the direction the routed items asked for.

Per DEC-ERR-03 I re-read the upstream this FSPEC now leans on at its current version. REQ at HEAD
is `sha256:ff605dd…` — matching the dispatch — and its version cell reads `0.9`, so the erratum
note's "re-grounded on REQ v0.9 at HEAD, unchanged — no upstream decision to absorb" is accurate,
and the header `Upstream` row's `(v0.9)` is not stale. The two upstream sentences the new text
leans on hold verbatim:

- REQ AC-2.3 (`:291-295`) bounds **"the material taken from it"** — not the rendered block — so
  BR-6's new material-only basis is a faithful compression, and the parenthetical
  `(REQ AC-2.3, which bounds "the material taken")` quotes upstream correctly.
- REQ AC-4.4 (`:371-374`) covers "zero documents **or zero bytes**" without naming which byte
  threshold, so deciding the third zero as an enabled, empty-selection run is inside AC-4.4's
  stated outcome rather than an FSPEC invention over it.

What the delta did not do is carry the zero decision back into the two places that restate BR-6 in
summary form — §Behavioral Flow step 15 and decision D-9. Those now describe a different outcome
for `maxBytesPerDocument: 0` than BR-6, E-36 and AT-30 do (F-01). That is a compression drift
inside one document, not an undecided outcome — BR-6 is the normative locus and it is unambiguous
— so it is Medium, not gating.

## Linked Requirements

Trace rows checked for the delta only.

| Row | State after the erratum | Verdict |
|---|---|---|
| `AC-2.3 → BR-6` | Unchanged; BR-6 still owns both byte bounds, now on a material-only basis | Accurate against REQ `:291-295` |
| `AC-4.4 → BR-5, BR-14 → AT-30` (`:178`) | The `maxDocuments: 0` and `maxTotalBytes: 0` zeros trace through BR-5/BR-14; the third zero is decided in **BR-6**, which the row does not name | Incomplete — F-03 (Low) |
| `E-36 → AT-30` (`:775`) | Present, and AT-30 now carries the third fixture | Resolved |
| Coverage sentence (`:988`) | Now reads `E-01 … E-36, less retired E-05` | Resolved — the new row is inside the counted range |
| `D-12 → AT-28` (`:993`) | D-12's question was reworded to "yields material"; the AT mapping is unchanged and AT-28 still exercises the no-priority-section branch, while AT-30 now exercises the zero-bound branch of the same decision | Serviceable; AT-30 is not listed against D-12, but D-12's outcome is reached by both — folded into F-01 rather than filed separately |

The header `Cross-Reviews` row still reads `…-FSPEC-v{N}.md — every round present on this branch,
not hand-enumerated`, so v15 does not stale it — the v14 fix holds.

## Behavioral Flow

## Business Rules

## Edge Cases and Error Scenarios

## Acceptance Tests

## Open Questions

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
