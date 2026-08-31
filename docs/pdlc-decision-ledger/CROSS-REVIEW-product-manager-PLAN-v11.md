# Cross-Review: product-manager — PLAN (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.9, re-grounded on DECISIONS v1.5)
**Date:** 2026-08-30
**Iteration:** 11 (erratum delta confirmation, not a re-review)
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Overview

**Answer to the one question asked: yes.** The delta is two lines. It moves the header's `DECISIONS`
pin from `sha256:13aba061…4fb89a` to HEAD **v1.5** `sha256:52580962…584ca0` and extends the v0.9
revision-history entry with the re-grounding paragraph that pin obliges. Nothing else in the document
moved, and I confirmed that mechanically rather than accepting the entry's own claim: `git diff
64666b25..HEAD` over this file reports exactly `1 file changed, 2 insertions(+), 2 deletions(-)` —
line 7 (the header row) and line 19 (the v0.9 entry).

**All four upstream pins re-measured at HEAD.** I re-derived each with `shasum -a 256` rather than
reading the entry's assertion that it had been done:

| Upstream | Header-row pin | Measured at HEAD | Verdict |
|---|---|---|---|
| REQ v1.9 | `ce6b133f…3c7b7c` | `ce6b133f0c1d…0d3c7b7c` | match — unmoved, as claimed |
| FSPEC v1.3 | `2bd5c3ef…5aed39` | `2bd5c3ef055f…1735aed39` | match — unmoved, as claimed |
| TSPEC **v1.2** | `fc57bc56…d4c27504` | `fc57bc56e0b5…8fdd4c27504` | match — unmoved since v10 |
| DECISIONS **v1.5** | `52580962…584ca0` | `52580962706938…375584ca0` | match — **advanced this round, pin correctly moved** |

The version label is right as well as the hash: `DECISIONS-pdlc-decision-ledger.md`'s frontmatter
reads `Version: 1.5`. Baseline is pinned by version only (**v1.2**), and the baseline file's own
`Version` field reads `1.2 · 2026-08-28` — unmoved, as claimed.

**The chronology the entry asserts holds.** The entry says DECISIONS advanced *after* both reviewers
wrote. `git log` confirms the ordering: the PM and TE PLAN v10 cross-reviews and their approval
anchors (`c85482d4`, `cc493f72`) precede the DECISIONS v1.5 commits (`29cd33a6` → `420edb64`), which
precede this PLAN edit (`78981215`). And `13aba061…4fb89a` is indeed the DECISIONS pin my own v10
`UPSTREAM-STATE` line re-measured and passed, so "the pin both reviews re-measured and passed" is a
true description of what moved out from under this document.

## Batches

**No task row moved, and no batch content moved.** The two-line diff is confined to the header pin
row and the revision-history paragraph. I did not take that on the entry's word: the diff touches
lines 7 and 19 only, and every task row in the document lives below line 150. The entry's closing
sentence — "No batch, dependency, ownership, task-id or count assignment changes in this round" — is
therefore exactly true, and it is the same sentence the v0.9 entry already carried at v10.

**What the new paragraph actually asserts is a self-conformance sweep, so I re-ran it.** DECISIONS
v1.5 restates `DEC-DECLEDGER-16`'s provenance rule *directionally*: a ceiling may enter a claim only
where substituting the true, smaller drafted value preserves it, binding assertions, pinned expected
values, and prose stating a figure as a standing fact. The PLAN claims it was swept against that
corrected predicate and is conformant **without an edit**. That is a checkable claim about this
document's own bytes, and it is the only new load-bearing claim in the delta. Checking it:

| Claim in the new paragraph | What the bytes show | Verdict |
|---|---|---|
| No addition form asserted anywhere | `10,859 + 1,200` appears nowhere; both bound assertions in T-09 (line 159) are the subtraction form `≤ maxBytes − 1200` | true |
| `12,059` never asserted as an equality | Two occurrences only: line 19 (the sweep claim itself) and line 159, which reads "the 12,059-byte block total is deliberately **not** asserted as an equality (`DEC-DECLEDGER-16`)" | true |
| `441` appears only as a worst-case figure | Three occurrences: line 19, line 159's parenthetical gloss on `≤ 11,300`, and line 276's "`M-6b`'s 441-byte margin shrink one-for-one with any raise" | true — both substantive sites are the labelled worst case DEC-16 puts out of scope |
| Conformant without an edit | No site requires a change under the directional predicate | true |

So the conclusion is sound: the PLAN did not need an edit to conform, and did not take one. One
enumeration inside that sentence is incomplete — T-09 carries a **second** bound assertion,
`6,305 ≤ maxBytes − 1200`, alongside the `10,859` one the sentence names as "the only bound
assertion it carries". Both are the same admitted subtraction form, so the conformance verdict is
unaffected and no assertion in the document is wrong; only the sweep's own count of its sites is.
Under a frozen round that is wording, not a defect the delta introduced into the contract, and I
record it below as `DEFERRED` rather than as a gating finding.

**Product-fidelity check on the sweep.** A self-conformance sweep is exactly where a document can
quietly narrow an acceptance criterion by "correcting" an assertion into a weaker one. Nothing was
corrected here — the sweep concluded *no edit*, so no assertion changed strength. T-09's AT-01,
AT-02, AT-18 and `DEC-DECLEDGER-13` shipped-default conjuncts stand byte-identical to the set I
approved at v10, including the hand-transcription discipline (`6,305`, `10,859`, the 41 and 63 id
sets transcribed from the fixture, never captured from the renderer) that keeps them free of
implementation echoes.

## Dependencies

**Unchanged, and structurally unreachable by this delta.** Batch numbers, task ids, ownership
columns and dependency lists all live below line 150; the diff touches lines 7 and 19. I re-confirmed
the two edges the census contract rests on are still as I approved them at v10: T-11 is committed
skipped in batch 2 and un-skipped by T-18 in batch 8 (the ordinary red-before-green edge), and T-18
still writes **no** census constant — its `orchestrate-dev.js` row is the wiring run and the
loop/prompt parameters only, with `decisionLedgerCensus.test.js` still named in the file-ownership
manifest as the sole home of all three frozen census lists.

**Phasing still tracks product priority.** The question a PM owns here — does P0 work precede P1
work, and does every P0/P1 requirement own a task — is untouched by a header pin and a changelog
paragraph. It was settled in the rounds that approved the batch structure and I do not re-litigate
it. The one ordering property worth restating because the delta's paragraph brushes against it:
T-09's `DEC-DECLEDGER-13` shipped-default assertions sit in batch 2 and depend on T-01 and T-03,
and it is those assertions the DEC-16 sweep ranged over. The sweep concluding "no edit" is precisely
what leaves that dependency untouched.

**Upstream faithfulness beyond the item list (DEC-ERR-03).** DECISIONS moved from `…4fb89a` to v1.5,
so I read what moved rather than only what the entry says moved. Two entries landed:

- **v1.4** — "TSPEC's propagation has landed, and nothing else." It re-grounds **three** passages on
  TSPEC's landed propagation. The PLAN's summary says "v1.4 re-grounds three passages on TSPEC's
  landed propagation" — a faithful compression: DECISIONS names exactly three (the Context
  measurement rule's live exception, `DEC-DECLEDGER-10/-12`'s discharge list, and
  `DEC-DECLEDGER-03/-13`'s reading of §7.3 with §7.3's own corrected rationale).
- **v1.5** — `DEC-DECLEDGER-16`'s predicate, and nothing else. The PLAN's one-clause statement of the
  corrected rule — "a ceiling may enter only where substituting the true, smaller drafted value
  preserves the claim" — is a verbatim-in-substance transcription of DECISIONS' `## Decision` row,
  and the PLAN's statement of its scope ("assertions, pinned expected values and prose stating a
  figure as a standing fact") matches DECISIONS' scope predicate clause for clause.

Neither entry moves a standing decision, and the PLAN does not claim either does. No requirement was
dropped, no out-of-scope behaviour appeared, and no acceptance criterion was narrowed, broadened or
re-triggered by this edit.

## Verification

Everything below was re-derived at HEAD (`78981215`), not read off the document.

| Check | Method | Result |
|---|---|---|
| Delta is only the pin and the entry | `git diff 64666b25..HEAD -- PLAN-*.md` | `1 file changed, 2 insertions(+), 2 deletions(-)`; lines 7 and 19 |
| Four upstream hashes | `shasum -a 256` on each upstream file | all four match the header pins |
| DECISIONS version label | frontmatter of `DECISIONS-pdlc-decision-ledger.md` | `Version: 1.5` — the label and the hash agree |
| Baseline version | `Version` field of `pdlc-decision-corpus-baseline.md` | `1.2` — unmoved, as claimed |
| Chronology of the re-grounding | `git log` ordering of v10 anchors vs DECISIONS v1.5 commits vs this edit | DECISIONS advanced after both reviews, before this edit |
| No addition form in PLAN | `grep` for `10,859 + 1,200` and every occurrence of `12,059` | zero addition forms; `12,059` twice, both explicit non-assertions |
| `441` usage | all three occurrences read in context | worst-case/labelled-margin usage only |
| DEC-16 predicate transcription | read DECISIONS `## Decision` row and `## Consequences` PROPERTIES row | PLAN's clause matches in substance and in scope |
| Task rows unmoved | diff line numbers vs row line numbers | every row below line 150; untouched |

**Requirement traceability, re-checked at the two sites the delta could have disturbed.**
`REQ-DECLEDGER-02` (P0, byte-identical dispatch stream) is proved by T-10a's flag-off arm, whose
conjunct 3 I confirmed at v10 and which this delta does not touch. `DEC-DECLEDGER-13`'s shipped
defaults are proved by T-09's four transcribed literals, which the sweep ranged over and left
unchanged. Both criteria survive the round as written.

**Test-discipline checks I own on the assertions the sweep ranged over.** No implementation echoes:
T-09's expected values are hand transcriptions from the fixture, and T-07's property model carries
its own formatter transcribed from TSPEC §4.3 rather than the production renderer. No absence-only
oracles: T-09's AT-18 pairs the negative (the feature-level statement is absent from the block) with
the positive (the surviving line's statement, `sourcePath` and `origin` are the project-level
record's), and the `omitted[]`-empty conjunct on the `M-6b` slice is paired with a set equality on
the rendered ids. Completeness by set equality rather than containment: the rendered project-level
ids are asserted **set-equal** to the transcribed 41 and the `M-6b` ids **set-equal** to the
transcribed 63, so a deleted case fails. All three held at v10 and are byte-identical here.

## Delta-Confirmation Findings

No findings.

The delta lands the DECISIONS re-grounding it set out to land: the pin is re-measured and correct at
HEAD, the version label agrees with the hash, the summary of what v1.4 and v1.5 changed is a faithful
compression of those entries, and the self-conformance sweep against the corrected
`DEC-DECLEDGER-16` predicate reaches the right conclusion on this document's actual bytes. Nothing I
previously approved was broken, no task row moved, and nothing the document cites moved out from
under it.

For the record, the two items my v9 review opened and my v10 review closed (F-01 High, F-02 Low)
remain closed at HEAD — the delta does not touch T-10a, T-11 or the §Definition of Done bullets that
carried them.

Two non-gating observations, recorded rather than routed:

DEFERRED: The sweep sentence names `10,859 ≤ maxBytes − 1200` as "the only bound assertion it carries", but T-09 also carries `6,305 ≤ maxBytes − 1200` — the same admitted subtraction form, so the conformance conclusion is unaffected; the enumeration, not the contract, is incomplete.

DEFERRED: `PROPERTIES-pdlc-decision-ledger.md`'s header still pins `PLAN` v0.7 and `TSPEC` v1.0, both now stale; that is a downstream re-grounding for the PROPERTIES phase to make, not a defect in the document under review.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The v0.9 entry now covers two byte states of "v0.9" — the one my v10 review approved and this re-grounded one — because an erratum bookkeeping tail landed without a version bump. That is normal for this pipeline's erratum channel (the approval anchors carry the byte identity, not the label), and the baseline's "a content change without a version bump is itself a defect" rule is scoped by its own text to the baseline file. So this is not a finding. It is worth knowing whether the round history keyed on version labels will read two distinct approvals of "v0.9" cleanly at harvest. Not a change I would hold the phase for. |

## Positive Observations

- **The re-grounding was done before the entry was closed, not after.** DECISIONS moved after both
  reviewers wrote, and the entry says so, re-derives against v1.5, and re-measures the pin
  mechanically. This is the fourth consecutive round where DEC-ERR-03 was executed in the right
  order on this feature; it now reads as habit rather than as a reaction to being caught.
- **The sweep concluded "no edit" and then made no edit.** The tempting failure here is to
  demonstrate diligence by touching an assertion — which is exactly how a P0's expected value gets
  quietly weakened under cover of a conformance pass. The round resisted that: it states the
  predicate, states the evidence, and stops.
- **The evidence given for conformance is the falsifiable kind.** "No addition form is asserted
  anywhere" and "`12,059` is explicitly not asserted as an equality" are claims a reviewer can check
  with `grep` in under a minute, and I did. Compare a sweep that says only "reviewed and conformant".
- **The pin bump carries its version label, not just its hash.** `**v1.5**` alongside
  `sha256:52580962…584ca0` means a future reader who finds the hash stale can still tell which
  edition this document was compressed from. Several stale-pin incidents in this project's learnings
  were hash-only pins.

## Recommendation

**Approved**

The delta is a two-line re-grounding that lands correctly: four pins re-measured at HEAD, a faithful
summary of DECISIONS v1.4/v1.5, and a self-conformance sweep whose conclusion holds against this
document's bytes. No batch, dependency, ownership, task-id or count assignment moved; no requirement
was lost and no acceptance criterion was narrowed. Zero findings, and nothing is required of the
author before batches 3–8 proceed. The two `DEFERRED` items above can ride along with any later
touch of those sections — neither warrants opening this document again on its own.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:87d4023774dbd9eec7f988a0d40c56c461b2acfab22dab442a6bb2d967341e63
APPROVAL-HASH-NORMALIZED: sha256:87d4023774dbd9eec7f988a0d40c56c461b2acfab22dab442a6bb2d967341e63
REVIEWED-COMMIT: 789812155c2a28fb553cac52227f074f24970bd4
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:2bd5c3ef055fd39d2645482a97219c2d096b534a6bed0c55b99306d1735aed39
UPSTREAM-STATE: TSPEC sha256:fc57bc56e0b53ba00402555bcf4a71575ddf820796586607137fdd8ad4c27504
UPSTREAM-STATE: DECISIONS sha256:5258096270693873ffc1a24cd4bfa542f540c143c4c16cd0aa5e512375584ca0
