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

## Verification

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
