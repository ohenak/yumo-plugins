# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.6)
**Date:** 2026-08-31
**Iteration:** 8 (erratum round 6 — delta confirmation)
**Prior round:** `CROSS-REVIEW-test-engineer-TSPEC-v7.md` (Needs revision, v1.5 @ `7747eb78f`)

## Overview

Round 7 raised two findings: **F-01** (High, `inherited`) — §4.3 cited `REQ-STATS-06` for a scoping
REQ v1.6 had reversed, contesting AT-17's fourth-leg expected value — and **F-02** (Medium, `delta`)
— the v1.5 changelog's false attestation that REQ and FSPEC "neither moved since v1.4's grounding".

Both are discharged, and discharged in the right way.

**F-02 is corrected accurately.** The v1.6 changelog now states the movement explicitly and
correctly: v1.4 grounded on FSPEC v1.5 / REQ v1.4, HEAD carries FSPEC v1.7 / REQ v1.6. I verified
the version rows rather than the changelog's account of them — `REQ-pdlc-stats.md:3` reads `1.6`,
`FSPEC-pdlc-stats.md:16` reads `1.7`. The enumerated moves are also right: FSPEC's v1.6 BR-16
basename-shape rewrite and v1.7 count correction two → four plus the AT-15 trace row
(`FSPEC:18`–`:26`), REQ's halt withdrawal and REQ-STATS-06 rewording. The entry goes further than a
correction and names *why* the check failed — "citing a current hash is not the same check as
diffing it against the previously grounded one" — which is the durable form of the lesson.

**F-01 is resolved at this layer, which is the only place it could be resolved.** F-01 was tagged
`inherited` because the contradiction is REQ-versus-FSPEC, not a TSPEC authoring error. A derived
document cannot fix that; it can only stop misreporting it. This revision does exactly that:

- §4.3's BR-16 pin moves from "at v1.4" to **v1.7**, and the false clause "REQ-STATS-06 at v1.4
  carries the same scoping" is gone.
- The `docs/completed/pdlc-advisory-wave-gate/` citation is re-scoped to a basename *shape* rather
  than a verdict — matching FSPEC BR-16 v1.7, which says the same thing in its own words
  (`FSPEC:373`–`:375`: the directory "carries four of them **alongside** grammar-matching
  cross-reviews and so reports a measured ratio itself; only the shape is borrowed, not the verdict").
- The REQ-versus-FSPEC conflict is stated in §4.3 and carried as the second open erratum in §8.3,
  routed rather than repaired, with the sites that re-stamp when it settles named.
- The stale "Nothing on this point is routed upstream (FSPEC §7.3 records it closed)" sentence is
  removed, and §8.3's count moves "One remains open" → "**Two** remain open". I counted the bullets:
  two.

The conflict itself is still live upstream — `REQ:205`–`:206` still calls the out-of-catalogue
basename a survivor, `FSPEC:371`–`:372` still says such a directory reports `harvested`. Per the
erratum channel I do not fold that into this document's verdict; it is re-raised as an `ERRATUM: REQ`
line, since the TSPEC in front of me now handles it correctly.

**No open High remains against this document.** Two new findings, both from this round's edit and
both non-gating: a blast-radius claim about AT-15 that does not hold (Medium), and a mis-cited
section anchor repeated twice (Low). Details in Test Strategy and Open Questions.

## Architecture

No structural change, and I confirmed that from the diff rather than from the changelog's assertion
of it. `git diff 7747eb78f HEAD -- docs/pdlc-stats/TSPEC-pdlc-stats.md` touches exactly three
regions: the §0 changelog block, §4.3's harvested-test discussion, and §8.3's open-errata list
(77 insertions, 13 deletions). Module boundaries, the `lib/stats.mjs` / `cmdStats` split, the
injected-parser bundle and the `StatsIo` seam are byte-identical to the v1.5 bytes.

The changelog's closing claim — "No type, signature, exit code, oracle, code sketch or count changed
this round" — holds on the first five. On "count" it needs a gloss: no *existing* count changed, but
the round **adds** three new measured counts to §4.3 (62 / 4 / 58). That is an addition rather than a
change, so the sentence is defensible, and the additions are correct (see Test Strategy). I mention
it only because a reader auditing the round by that sentence alone would not expect new numbers.

The re-scoping move itself is architecturally right. Treating the archive directory as a *shape*
citation rather than a *verdict* citation separates two things the earlier revision had fused: what
the basename form is, and what a directory containing it reports. Those are different questions with
different answers, and fusing them is what produced the false "harvested directory" reading in the
first place.

## Interfaces

Unchanged and unaffected. `deriveRoundWindow`, `parseResolvedMarker`, `computeReviewRounds`, the
`StatsIo` injection surface (`listDir` / `readFile` / `stat`) and the renderer signatures over
`StatsReport` are untouched by the delta; the diff does not reach §3. I re-read §3.3's signatures
against the diff to confirm no incidental edit landed there. None did.

One interface-adjacent detail is worth recording because the dispute touches it. §4.3's membership
predicate is `parseReviewFilename(...).ok` — cross-review membership is decided by the **driver's**
parser, which validates the doc-type token against its catalogue. That is the mechanism by which the
TSPEC implements BR-16, and it is also precisely the mechanism REQ v1.6 disputes. The seam is not
wrong; it simply inherits whichever answer the reconciliation lands. No signature changes either way,
which §4.3 correctly states ("No type, signature, exit code or other oracle depends on the outcome")
— with one qualification I take up under Test Strategy.

## Data Model

Unchanged by the delta. §5's declarations are outside the diff, so the live question is the same one
I asked at round 7: do they still match upstream after REQ moved to v1.6? They do, and the changelog's
item (c) now records why in the document itself rather than leaving it to a reviewer's note.

I re-verified the load-bearing part. `TSPEC:551` declares

```
halts: HaltEntry[];              // possibly empty — BR-13, no state needed
```

`HaltEntry[]` carries no `state` discriminator, so REQ v1.6's withdrawal of REQ-STATS-05's harvested
halt state and its restoration of a measured `0` is satisfied by an empty array rather than
contradicted by a type. `MetricState` remains applied only to `reviewRounds`, `dodRounds` and
`byteRatio`. The `StatsReport` shape at `:611` agrees.

The five-key JSON literal still matches REQ-STATS-02's printed metric set plus the schema-version
field, and the delta does not touch it. Recording this in the changelog is the right call: at round 7
this was a near-miss that happened to hold, and an unrecorded near-miss is indistinguishable from an
unchecked one on the next pass.
