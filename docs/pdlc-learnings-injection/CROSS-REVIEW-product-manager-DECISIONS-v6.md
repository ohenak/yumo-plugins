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

**DECISIONS still holds as approved against FSPEC as it now stands.** No decision it takes is
contradicted by FSPEC v0.13; the round's three substantive moves (material-only accounting,
`maxBytesPerDocument: 0` as an empty-selection run, F-O-1 owning both heading rules) land on the
same side of every argument DECISIONS already made. No new finding is raised by this delta. Five
findings carry forward, all `inherited`, all citation- or framing-currency defects, none gating.

**Clause-by-clause re-verification against FSPEC at HEAD.**

| What DECISIONS says about FSPEC | FSPEC v0.13 at HEAD | Still holds? |
|---|---|---|
| `DEC-LI-08`: "Bound the addition with REQ §4.1's static thresholds only — per-document bytes, total bytes, document count — applied unconditionally" | §BR-6 keeps all three quantities and their unconditional application; only the *basis* they measure changed (material only) | Yes — the claim is over which quantities bound, not what they count |
| `DEC-LI-08` non-decision row: threshold **values** (`maxBytesPerDocument`, `maxTotalBytes`, count) are REQ §4.1's, per `DEC-LAYER-01`; "DEC-LI-08 depends on their existence, not on their values" | Erratum decides the *behaviour at* the value zero (E-36), not the value; §4.1 remains the values' owner | Yes |
| `DEC-LI-07` five-state table, row 5: "enabled, thresholds admitting nothing → enabled, empty selection → `BR-8` rows, present and empty" | E-36: `maxBytesPerDocument: 0` "is the enabled, empty-selection run BR-14 describes… BR-8 rows present and empty"; AT-30 now covers all three zeros | Yes — the delta instantiates the row rather than extending it |
| `DEC-LI-07`: "FSPEC v0.7 `BR-14` carries the same five states" | `BR-14` byte-identical across the span; §Decision-table D-1 and AC-5.1a/b/c traces unchanged | Substance yes; the **version pin** is stale — F-03 |
| `DEC-LI-05`: byte-identity holds by construction, `block = ""` on empty selection; "Emit a placeholder block when the selection is empty — rejected" | A zero per-document bound now produces an empty selection; the block is still `""`, so AC-4.1/AC-5.1a hold unchanged, and no placeholder is emitted for the zero case | Yes — reinforced |
| `DEC-LI-05` constraint: "FSPEC `BR-7`, which fixes what the block must convey but not where it sits" | BR-7's own rule unchanged; the delta only removes the preamble's byte charge, which is an accounting statement, not a placement or content one | Yes |
| `DEC-LI-01` re-evaluation trigger: "`BR-3` fixes that the predicate consults only the document's bytes" | `BR-3` byte-identical; F-O-1 restates the same bound over both heading rules ("each consults only the document's bytes") | Yes — widened coverage, same fact |
| Non-decision row: "The ordering key, the section subset, and the eligibility rule → FSPEC `BR-4`, `BR-6`, `BR-3`. These are behaviour, and this document does not re-decide behaviour" | BR-6 is exactly where the accounting basis was re-decided — i.e. the placement was correct and the erratum landed in the owner DECISIONS named | Yes — the placement was vindicated |
| `DEC-LI-06` constraints: FSPEC `E-32` (per-dispatch observation), REQ NG-4 and `BR-15` (no index/cache/state file), AC-5.2 | `E-32` and `BR-15` untouched; E-36 is an additive row above them | Yes |
| `DEC-LI-06`: "the read cost, not the injected-byte cost, is the term flagged to REQ O-1's live measurement (TSPEC `T-O-3`): the injection is bounded, the read is not" | The delta *narrows* injected bytes (framing now free) while leaving read cost untouched, so the asymmetry the entry rests on widens | Yes — reinforced |
| `DEC-LI-03`'s attachment-point argument and its `BR-1` exclusion-list citation | `BR-1` byte-identical; nothing in the span touches dispatch classification | Yes |
| Header `Upstream` row and **Upstream version note**: "FSPEC v0.7" | FSPEC **v0.13** | **No** — F-03 (inherited, widened again) |
| `DEC-LI-03` re-evaluation trigger's paraphrase of FSPEC `A-2` | `A-2` at HEAD names BR-1's conjuncts (changed in v0.12, before this round) | **No** — F-04 (inherited, from v4) |
| "Decisions deliberately NOT taken here", AC-3.3 locus row, and `DEC-LI-07`'s divergence framing / `D-O-9` | TSPEC unchanged this round; both were already settled in TSPEC v0.6 | **No** — F-01, F-02 (inherited, from v3) |
| **Upstream version note** premise: TSPEC "still carries provisionally", divergence unresolved | TSPEC v0.7's header re-grounded on FSPEC v0.12 / REQ v0.9 last round | **No** — F-05 (inherited, raised at v5) |

F-01 through F-04 were raised at v3/v4 and F-05 at v5; DECISIONS' bytes have not moved since, so all
five are recorded `inherited` — the round routes back to the owning phase rather than halting.

## Consequences

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
