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

**For this round.** The confirmation approves. FSPEC v0.13 re-founded BR-6's byte accounting on
material only, decided the third zero threshold, and gave BR-6's heading rule an owner in F-O-1 —
and re-decided nothing DECISIONS owns. Five findings stand, all inherited citation- and
framing-currency defects, none blocking: PLAN and PROPERTIES may proceed against DECISIONS as it
stands alongside REQ/FSPEC/TSPEC at HEAD.

**What the next edit to DECISIONS should carry** — unchanged from v5, items 1–5, with item 3's pin
now widened by one more FSPEC minor:

1. Restate the AC-3.3 locus row as **settled**, not open: it describes AC-3.3's record locus as an
   open question routed to REQ via TSPEC `ERR-6`, but FSPEC `BR-10` settled the two loci and TSPEC
   records `ERR-6` **CLOSED** from v0.6 onward. (F-01)
2. Close `DEC-LI-07`'s divergence framing and mark obligation **`D-O-9` discharged**, naming the
   landing version: `DEC-ERR-01`'s ask landed in **TSPEC v0.6** (`ERR-4` CLOSED, `OQ.2` closed, §I.3
   gating on `config.enabled` alone, `LEARNINGS_DEFAULTS` aligned). (F-02)
3. Repin: the header `Upstream` row, the **Upstream version note**, and `DEC-LI-07`'s "FSPEC v0.7
   `BR-14`" all read **FSPEC v0.7** against **v0.13** at HEAD, and TSPEC **v0.5** against **v0.7**.
   The cited `BR-14` text is unchanged, so this is a pin edit only. (F-03)
4. Align `DEC-LI-03`'s re-evaluation trigger with `A-2` as reworded: the excluded-by-construction
   default now covers a dispatch failing **either** conjunct, and an authoring-classified non-C-1
   target is named against `BR-1` itself. One clause. (F-04)
5. Rewrite or delete the **Upstream version note**'s premise. It exists to explain why DECISIONS and
   TSPEC disagreed about upstream; TSPEC v0.7 is now pinned to the same REQ v0.9 the document is
   grounded on, so the asymmetry it explains no longer exists. If kept, it should record *history*
   ("TSPEC v0.5 lagged; re-grounded at v0.7") rather than assert a live gap. (F-05)

**For the pipeline.** This is the **fourth** consecutive confirmation whose findings are stale
sentences about sibling documents and whose count is flat-to-rising (2 → 4 → 5 → 5) purely because
DECISIONS' bytes cannot move between confirmation rounds while its siblings keep moving. Three
`Process` candidates, now demonstrated a fourth time:

- **Version pins in a downstream document go stale silently.** `DEC-LI-03`'s and `DEC-LI-10`'s
  *content* citations are re-checkable against a named id, but the header pins are not falsified by
  anything — F-03 has now widened across three separate upstream rounds without a single test or gate
  noticing.
- **An erratum that discharges an obligation should close the obligation row in the document that
  raised it.** `D-O-9` was satisfied by TSPEC v0.6 and has been carried as outstanding through three
  confirmations since, because the discharge happened in the *target* document and nothing routes
  back to the *raising* one.
- **A "current upstream" framing sentence is a dated claim wearing a timeless voice.** F-05's
  paragraph was true when written and false one round later, with no id, quote or number in it for a
  re-reader to check against.

**On the confirmation itself.** This round's routed item list is FSPEC's three v0.13 decisions —
none names DECISIONS, and all three land in DECISIONS' favour. Confirming on the item list alone
would have returned a clean approval over five stale sentences, all already outstanding. Re-reading
the upstream text this document leans on, at HEAD, across the whole span since the recorded
`UPSTREAM-STATE`, is what keeps them on the page — and is also what let me clear Readings A, B and C
rather than file them.

## Positive Observations

- **`DEC-LI-08` was written at the right altitude, and this delta proved it.** The entry decides
  *which* quantities bound the injection and refuses to decide *what they measure* or *what values
  they take* — so an erratum that re-founded the measurement basis from "framing plus material" to
  "material only" passed straight through it without touching a word. An entry written one level
  lower ("contributed bytes include the identification line and delimiters") would have gone false
  this round. Restraint about which layer owns a claim is what made this confirmation cheap.
- **The non-decision table sent the question to the right owner.** DECISIONS placed "the section
  subset" with FSPEC `BR-6` and declined to re-decide it. `BR-6` is exactly where the accounting
  basis, the zero-bound behaviour and the heading-rule delegation all landed. Naming the sibling that
  owns a question, rather than leaving it dangling, is what let me verify the whole reading in one
  hop.
- **`DEC-LI-05`'s structural guarantee absorbed a brand-new empty-selection path at zero cost.**
  `maxBytesPerDocument: 0` is a way of reaching an empty selection that did not exist when the entry
  was written, and it needs no new argument, because byte-identity was made a property of
  concatenation rather than a property tested per path. A decision that converts a testable
  invariant into a construction is the kind that survives upstream churn.
- **`DEC-LI-06`'s cost story got stronger without being touched.** The entry stakes its
  re-evaluation trigger on read cost dominating injected-byte cost; the erratum shrank injected bytes
  further by freeing framing from every threshold. The asymmetry it flagged to REQ O-1 is now wider
  than when it was written.

## Recommendation

**Approved with minor changes** — DECISIONS still holds as approved against FSPEC as it now stands.

No High finding. No decision is contradicted by FSPEC v0.13; no binding transcription has gone wrong
(`DEC-LI-07`'s `BR-14` five-state table and `DEC-LI-05`'s byte-identity construction both still check
out against byte-identical upstream rules); and the round's three substantive moves — material-only
accounting, `maxBytesPerDocument: 0` as BR-14's enabled empty-selection run, F-O-1 owning both
heading rules — each reinforce an entry DECISIONS already carries rather than undermining one.

Five findings are recorded, all `inherited`, all single-passage edits for the next pass on this
document, none gating: F-01 and F-02 assert upstream questions are open that TSPEC closed at v0.6
(F-02 additionally leaves a discharged obligation, `D-O-9`, standing as an open ask), F-03's stale
version pins are now two TSPEC minors and **six** FSPEC minors behind HEAD, F-04 paraphrases FSPEC
`A-2` in its pre-erratum wording, and F-05's upstream-version note asserts a TSPEC/DECISIONS
grounding gap that TSPEC v0.7 closed. PLAN and PROPERTIES may proceed.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | The AC-3.3 locus row describes AC-3.3's record locus as an open question routed to REQ via TSPEC `ERR-6`, and says "TSPEC keeps the run-level record (last-write-wins)". FSPEC `BR-10` (v0.9 onward) settled the two loci — per dispatch, plus one run-level completeness assertion — and TSPEC records `ERR-6` **CLOSED** from v0.6. Raised at v3, v4 and v5; DECISIONS' bytes unchanged since. | `## Decisions deliberately NOT taken here`, AC-3.3 locus row |
| F-02 | Medium | inherited | nonlocal | `DEC-LI-07`'s "the divergence from TSPEC is recorded as an erratum" framing, its summary-table row calling the `present` gate "TSPEC's provisional reading", and obligation `D-O-9` all assert an outstanding ask on TSPEC (close `OQ.2`, retire `ERR-4`, drop `present`/`sectionMalformed` from §I.3, align `LEARNINGS_DEFAULTS`). All of it landed in **TSPEC v0.6** and remains landed at v0.7. `D-O-9` is discharged and should be marked closed with its landing version. Raised at v3, v4 and v5; unchanged. | `## DEC-LI-07`, divergence framing and summary row; obligation `D-O-9` |
| F-03 | Low | inherited | nonlocal | Stale upstream pins, widened again by this round: the header `Upstream` row and the **Upstream version note** read TSPEC v0.5 / FSPEC v0.7, and `DEC-LI-07` cites "FSPEC v0.7 `BR-14`". At HEAD TSPEC is **v0.7** and FSPEC is **v0.13** (REQ v0.9 is correct). The cited `BR-14` text is unchanged, so this is a pin defect only. | Header `Upstream` row; **Upstream version note**; `DEC-LI-07` |
| F-04 | Low | inherited | nonlocal | `DEC-LI-03`'s review-time re-evaluation trigger paraphrases FSPEC `A-2` as "authoring in spirit but not classified". `A-2` at HEAD reads "satisfies **neither** conjunct yet is authoring in spirit", and names `BR-1`'s conjuncts directly. One clause. Raised at v4; unchanged. | `## DEC-LI-03`, "Re-evaluation triggers" |
| F-05 | Low | inherited | nonlocal | The **Upstream version note** asserts a live grounding gap — "TSPEC v0.5 was authored against FSPEC v0.5 / REQ v0.7 … this document is grounded on the **current** upstream, so `DEC-LI-07` decides what TSPEC still carries provisionally; the divergence is raised as a TSPEC erratum rather than resolved silently." TSPEC v0.7 re-grounded its own header on FSPEC v0.12 / REQ v0.9, so both documents now stand on the same upstream and the asymmetry the note exists to explain is gone. Rewrite as history or delete. Raised at v5; unchanged. | **Upstream version note** (§Scope, grounding pin, and how to read this document) |

FINDING: Medium | inherited | nonlocal | Decisions deliberately NOT taken here — AC-3.3 locus row | Describes AC-3.3's record locus as open and routed to REQ via TSPEC ERR-6, and says TSPEC keeps the run-level record (last-write-wins); FSPEC BR-10 settled the two loci plus one completeness assertion, and TSPEC records ERR-6 CLOSED from v0.6. Raised at v3/v4/v5, bytes unchanged.
FINDING: Medium | inherited | nonlocal | DEC-LI-07 — divergence-from-TSPEC framing, summary row, obligation D-O-9 | Asserts TSPEC still builds on present && config.enabled && !sectionMalformed with OQ.2/ERR-4 open and DEC-ERR-01 outstanding; all of it landed in TSPEC v0.6 and D-O-9 is discharged. Raised at v3/v4/v5, unchanged.
FINDING: Low | inherited | nonlocal | Header Upstream row; Upstream version note; DEC-LI-07 | Pins TSPEC v0.5 / FSPEC v0.7 against HEAD TSPEC v0.7 / FSPEC v0.13; the cited BR-14 text is unchanged, so this is a pin defect only, widened again by this round's FSPEC version bump.
FINDING: Low | inherited | nonlocal | DEC-LI-03 — Re-evaluation triggers | Paraphrases FSPEC A-2 as "authoring in spirit but not classified"; A-2 at HEAD reads "satisfies neither conjunct yet is authoring in spirit" and names BR-1's conjuncts directly.
FINDING: Low | inherited | nonlocal | Upstream version note (Scope, grounding pin, how to read) | Asserts a live TSPEC/DECISIONS upstream asymmetry and an unresolved TSPEC divergence; TSPEC v0.7 re-grounded its header on FSPEC v0.12 / REQ v0.9, so the gap the note explains no longer exists.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 3}
