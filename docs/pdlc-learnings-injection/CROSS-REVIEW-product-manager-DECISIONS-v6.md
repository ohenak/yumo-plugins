# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 6 (upstream-cascade confirmation; DECISIONS' own bytes unchanged)
**Scope:** Local

## Context

At v5 I confirmed DECISIONS against a **TSPEC** cascade and recorded `Approved with minor changes`
(0 High / 2 Medium / 3 Low), `REVIEWED-COMMIT: 40dffb86`, `APPROVAL-HASH: sha256:85888c03…`, with
`UPSTREAM-STATE: REQ sha256:ff605dd3… / FSPEC sha256:fb18dbda… / TSPEC sha256:f629d29d…`.

At this dispatch: REQ is byte-identical (`sha256:ff605dd3…`, v0.9) and TSPEC is byte-identical
(`sha256:f629d29d…`, v0.7) to the versions v5 recorded. **FSPEC** has moved — `fb18dbda…` (v0.12,
commit `c1d7218e`) → `ae75fa62…` (v0.13, commit `cfb3d4d6`). DECISIONS' own bytes have not moved
since `d140fbee`: `sha256:85888c03…`, unchanged across the v3, v4, v5 and now v6 rounds.

Per DEC-ERR-03 I re-read the **whole span** `c1d7218e..cfb3d4d6`, not the last commit, because my
approval was recorded against the older blob. Six commits, one erratum:

| FSPEC commit | What moved |
|---|---|
| `eeafa236` | BR-6's **byte-accounting basis** re-founded: a document's *contributed bytes* are now its **material only** — the section headings and bodies taken — and framing (identification line, per-document delimiters, source-path label, block preamble) is charged to no threshold. Grounded on REQ AC-2.3's "the material taken". |
| `402185b3` | `RSN-NO-MATERIAL`'s reason-catalogue gloss widened: "carries none of BR-6's priority sections, **or the per-document bound is zero and admits none**". D-12 restated from "carry any priority section" to "yield any material". |
| `c33bec50` | `maxBytesPerDocument: 0` decided: every document yields nothing, carries `RSN-NO-MATERIAL`, consumes no slot; the run is BR-14's **enabled, empty-selection** run. Recorded as **E-36**, exercised by **AT-30** beside the other two zeros; §Traceability's row range extended to E-36. |
| `5dcd00e0` | **F-O-1** widened to own **both** heading-recognition rules — BR-3's document-shape predicate *and* the rule by which a heading counts as one of BR-6's named sections — so BR-6's delegation names a real owner. Both still bounded by "consults only the document's bytes" and "decidable without a model call". |
| `0884fe45` | BR-6 prose adopts the contributed-bytes vocabulary; zero-bound paragraph added to "How the per-document bound binds". |
| `cfb3d4d6` | v0.13 erratum note added to the changelog; version row 0.12 → **0.13**. |

Nothing in the span touched `BR-1`, `BR-3`, `BR-7`'s own definition, `BR-14`, `BR-15`, `E-32`, or
`A-2` — the six upstream anchors DECISIONS actually leans on hardest. The confirmation question is
therefore the narrow DEC-ERR-03 one: does anything DECISIONS *says about* FSPEC now fail to match
what FSPEC says, or fail to say it the same way?

## Options Considered

Three readings of this cascade looked live before I traced the text.

**Reading A — the delta redefines what `maxBytesPerDocument` measures, so `DEC-LI-08`'s
"bound the addition with REQ §4.1's static thresholds only" is now describing a different
mechanism and needs re-grounding.** Superficially strong: `maxBytesPerDocument` is named by
`DEC-LI-08` and by the non-decision row that places threshold *values* with REQ §4.1, and the
erratum genuinely changed what bytes that threshold counts.

**Rejected on the text.** `DEC-LI-08` is written one level above the accounting basis. Its
decision is *which quantities bound the addition* — "per-document bytes, total bytes, document
count — applied unconditionally" — and its rejected alternative is a **dynamic** budget that
measures the rest of the prompt. Whether the per-document quantity counts framing or only
material does not touch either half: a static bound stays static under both bases, and the
dynamic-budget rejection turned on *authority* ("nothing in `orchestrate-dev.js` knows a prompt
ceiling"), not on arithmetic. The non-decision row is narrower still — it places the threshold
**values** with REQ §4.1 and says explicitly that "DEC-LI-08 depends on their existence, not on
their values". The erratum decided neither a value nor a mechanism DECISIONS owns; it decided a
*measurement basis*, which is FSPEC behaviour and which DECISIONS declines to re-decide by its
own grounding pin ("no behaviour rule (FSPEC `BR-1` … `BR-16`) is re-decided here").

**Reading B — `maxBytesPerDocument: 0` is a new empty-selection state, so `DEC-LI-07`'s
five-state configuration table is now incomplete and `DEC-LI-05`'s empty-block reasoning has an
untested new path.** Worth checking, because `DEC-LI-07`'s table is the one place DECISIONS
transcribes an upstream table verbatim, and I have said in prior rounds that a `BR-14` change
reds that transcription.

**Rejected — the table is BR-14's, and BR-14 did not move.** `DEC-LI-07`'s fifth row reads
"enabled, thresholds admitting nothing | enabled, empty selection | `BR-8` rows, present and
empty". That row is quantified over *thresholds*, not over an enumerated list of which threshold
is zero, so a third zero lands inside it as written. FSPEC agrees in terms: E-36 says the
`maxBytesPerDocument: 0` run "is the enabled, empty-selection run BR-14 describes", and AT-30 now
asserts all three zeros against the same expectation. Likewise `DEC-LI-05`: an empty selection
composes `block = ""`, and byte-identity holds *by construction* under concatenation — the
guarantee is structural, so a new way of reaching an empty selection adds no path to it. Both
entries are **reinforced** by the delta, not strained by it.

**Reading C — F-O-1's widening hands TSPEC a second heading rule, so DECISIONS' `DEC-LI-01`
re-evaluation trigger ("a rule that depends on file mtime rather than a document's own bytes —
which would itself be an FSPEC change, since `BR-3` fixes that the predicate consults only the
document's bytes") is now stale.** **Rejected.** The trigger cites `BR-3`, and `BR-3` is
byte-identical at HEAD. F-O-1's new sentence restates the same bound over *both* rules — "each
consults only the document's bytes, and each is decidable without a model call" — so the fact the
trigger leans on got wider coverage, not different content. The trigger fires on the same
observable.

I also weighed whether to re-tag F-03 (the stale version pins) as `delta`, since this round is
precisely what widened the gap from FSPEC v0.12 to v0.13 against DECISIONS' pinned "FSPEC v0.7".
**Rejected for tag stability**, on the same reasoning as v4 and v5: the defect sits in pre-round
bytes that this edit did not touch, so `inherited` is the honest provenance; the widening is
recorded in the finding text instead. Flipping a tag round-to-round on an unchanged defect is
exactly what the tag-selection discipline asks reviewers not to do.

## Decision

## Consequences

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
