# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md` (v0.4)
**Date:** 2026-08-19
**Iteration:** 4

Delta re-review against `CROSS-REVIEW-software-engineer-FSPEC-v3.md`, over
`git diff 2e4408d1..HEAD` on the FSPEC (40 insertions, 26 deletions, v0.3 → v0.4).
Only changed sections were re-read for new defects. Every measured claim the round touched was
re-measured against HEAD.

## Prior findings disposition

| Prior | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | High | **Resolved** | BR-5's qualifier now reads "matching BR-6's five names in the `## N. Title` form the corpus writes" (FSPEC:360-361), which is what BR-6 states (FSPEC:391-397) and what the corpus ships: all 9 local corpus documents write every priority section with a numeric prefix, `## 1. Non-Convergences` … `## 6. Approval Record`, and no document writes a bare title. Re-measured at HEAD with BR-6's table titles under ordinal-tolerant matching: max **41,175 bytes** at `docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md`, against the quoted 41,180 — the basis now reproduces the number the paragraph carries, where v0.3's "strict title matching" basis selected zero bytes in every document. The clause TSPEC reads for F-O-1's heading-form pin no longer licenses a predicate that injects nothing. |
| F-02 | Medium | **Resolved** | BR-3 now routes the divergence explicitly: "REQ AC-3.2's catalogue lists `RSN-TRUNCATED` and omits `RSN-NO-MATERIAL`; BR-9 differs on both — `ERRATUM: REQ` rides" (FSPEC:298-299). Verified upstream: `REQ-…md:314-317` lists `RSN-TRUNCATED` and carries no `RSN-NO-MATERIAL`. |
| F-03 | Medium | **Resolved** | BR-9 is now "three closed catalogues" with a notice catalogue of `NTC-MALFORMED` and `NTC-KEYTYPE` (FSPEC:474, 499-506), the ids are used at every site the notices appear — flow step 3, D-1, BR-14 rows 3-4, E-23, E-34 — and AT-32 carries "a **completeness test asserts set equality** over `NTC-MALFORMED` and `NTC-KEYTYPE`" (FSPEC:871-872), so REQ C-9's registration-with-a-test closure now has an enumeration to close over. The disjointness rule was generalised to three catalogues rather than left binding two. |
| F-04 | Low | **Resolved** | AT-12's bound is now "a fixture literal, recomputed by hand on change, never derived in the test" (FSPEC:783-784) and AT-13 gained "Its dropped set and byte counts are fixture literals, never derived" (FSPEC:791-792). The whole byte-accounting group is now pinned to transcription rather than computation. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The five priority-section names are written two ways in one document, and the two forms select different material at HEAD.** BR-6's table names them in full — `Rejected Proposals (with rationale)`, `Open Items for Consolidation` (FSPEC:384-390) — while O-4's discharge line names them abbreviated: "Cross-Feature Patterns, Non-Convergences, Rejected Proposals, Process Learnings, Open Items" (FSPEC:908). At HEAD the corpus writes only the full forms (`docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md:52,182`; the same two headings appear in all 9 corpus documents). Measured over the 9 local documents under ordinal-tolerant equality: BR-6's full titles give avg 25,430 / max 41,175 bytes, O-4's abbreviated titles give avg 17,525 / max 26,084 — two of five priority sections match nothing, ~31% of injectable material silently lost. Silently is the operative word: E-19 makes an absent priority section a non-event, so a TSPEC author who pins F-O-1's predicate off O-4's list ships a feature that drops `Rejected Proposals` and `Open Items` from every document with no report line, no reason id, and a green suite. BR-5's measurement only reproduces under BR-6's full titles, so BR-6 is the intended form — make O-4 quote it, or add one clause saying the names are section-title *prefixes* and let BR-6 say so once. | BR-6 table (FSPEC:384-390), O-4 (FSPEC:908), BR-5 (FSPEC:358-363) |
| F-02 | Medium | Local | **BR-9's third catalogue diverges from REQ AC-3.2's fixed test count, and this one divergence is not routed.** AC-3.2 legislates "Two set-equality tests, one per catalogue" (`REQ-…md:320-321`); BR-9 now requires three (FSPEC:474, 501-508), and AT-32 adds the third test. This is exactly the class the round just fixed for `RSN-TRUNCATED` at BR-3:298 — BR-3's erratum covers per-document *membership*, not the *count* of catalogues and tests, so the arithmetic in AC-3.2's closing sentence is left silently false. The FSPEC routes four REQ divergences explicitly (BR-2:271, BR-3:298, BR-5:368, BR-14:606); this fifth one of the same kind stands mute. One clause on BR-9's "Rules binding the three catalogues" preamble — REQ AC-3.2 fixes the count at two, `ERRATUM: REQ` rides — closes it and rides this review. | BR-9 (FSPEC:474, 501-508), REQ AC-3.2 (`REQ-…md:320-321`), AT-32 |
| F-03 | Medium | Local | **E-35 and E-07 describe the same fixture and demand opposite outcomes, and both are pinned on AT-15.** E-07 is "Corpus contains only documents under `docs/discarded/`" → corpus-level `RSN-EMPTY`, no discarded document in any record (FSPEC:665). E-35, new this round, is "A document directly at `docs/discarded/LEARNINGS-x.md`" → corpus member, eligible and selectable (FSPEC:666). A one-file fixture at `docs/discarded/LEARNINGS-x.md` satisfies E-07's description literally, and AT-15 now asks a single test to assert both readings: clause 1 "a fixture whose only LEARNINGS documents lie under `docs/discarded/`" → nothing selected, clause 2 the same path → selected (FSPEC:799-803). BR-2 disambiguates — the excluded class is `docs/discarded/{feature}/`, one directory deeper than the glob reaches (FSPEC:264-266) — so the fix is mechanical: qualify E-07 and AT-15's first clause as `docs/discarded/{feature}/`. Left as written, whichever fixture the test author builds first decides which clause is unreachable, and the unreachable one passes vacuously. | E-07/E-35 (FSPEC:665-666), AT-15 (FSPEC:799-803), BR-2 (FSPEC:264-271) |
| F-04 | Low | Local | **BR-5's quoted max is 5 bytes off the re-measured value.** The paragraph carries "max 41,180" (FSPEC:360); measuring at HEAD with BR-6's titles under ordinal-tolerant matching gives 41,175 for `docs/completed/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md`. The gap is a section-boundary or trailing-newline accounting convention, not a disagreement about which sections are material, and it changes nothing the paragraph concludes. Worth one line naming the convention (heading line inclusive, trailing blank line exclusive, or whichever it is), since a TSPEC fixture that reproduces the measurement will otherwise be 5 bytes off and its author will not know which of the two is wrong. | BR-5 (FSPEC:358-363) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | BR-5's per-document average of 13,278 bytes is unverifiable from this repository: 80 of the 89 documents live in `regime-ledger`, and the 9 local ones average 25,430 under the basis BR-5 now names. The max (41,175 here vs 41,180 quoted) is clearly local, so the 89-document average implies ~11,900 for the `regime-ledger` 80 — plausible for smaller, more numerous features, but nothing in this repo can confirm it. Was the average taken with the same extraction as the max, and is the ledger-side figure recoverable if a TSPEC fixture needs to reproduce it? |
| Q-02 | E-33's "(measured: occurs at HEAD)" still stands unchanged (FSPEC:682): no local corpus document carries zero BR-6 material — all 9 carry between 9,223 and 41,175 bytes. If the observation is a `regime-ledger` one, saying so in the parenthetical would make `RSN-NO-MATERIAL` a branch a reader can go and look at, the way BR-4's table does for its own counts. |

## Positive Observations

- The v3 High was fixed by correcting the sentence rather than the numbers, which was the right
  direction: the measurement was always taken ordinal-tolerantly, and the round re-measured its way
  to that conclusion instead of re-stating the numbers to match a wrong basis. Re-running the
  measurement here reproduces 41,175 against the quoted 41,180, so the clause TSPEC will read for
  F-O-1 now points at a predicate that selects real material in every corpus document at HEAD.
- Introducing `NTC-MALFORMED` and `NTC-KEYTYPE` did more than name two notices: it turned BR-14's
  five-state table into something a completeness test can close over, and AT-32's oracle moved from
  "the notice text mentions the key" — a containment check — to set equality over the catalogue plus
  a fixture-literal selection and a named default (`maxDocuments` at 5, matching `REQ-…md:221`).
  That is the C-9 closure discipline applied to the notice surface, not just asserted about it.
- AT-32's wrong-typed clause is now a full positive oracle: enabled run, `maxDocuments` at its §4.1
  default while the other two thresholds keep their configured values, selection equal to a literal,
  and the notice naming the key. Nothing in it can pass by absence, which is what the sibling
  precedent (`parseAdvisoryConfig`'s `invalidKeys` fallback, `pdlc/workflows/orchestrate-dev.js:1986-2031`)
  actually does.
- The `docs/discarded/` residual class was answered with a stated outcome (E-35) rather than left as
  a note that a case exists — the E-07 collision in F-03 is a wording overlap, not a retreat from
  the decision.

## Recommendation

**Approved with minor changes**

The round's only High is fully discharged and no new High stands. Three Mediums and one Low are
one-clause edits that need no re-measurement: quote BR-6's full section titles in O-4 (or say once
that the names are prefixes), add the `ERRATUM: REQ` line beside BR-9's three-catalogue rule for
AC-3.2's "two set-equality tests", qualify E-07 and AT-15's first clause as `docs/discarded/{feature}/`
so E-35 stops contradicting them, and name BR-5's byte-accounting convention. None of them change a
behaviour the document specifies, and none blocks TSPEC authoring — F-03 is the one worth landing
before a fixture gets built off AT-15.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}

APPROVAL-HASH: sha256:0ae549da7d496c284d4d64301aa71c9c6837564ff502414ec4f9ed577301d687
APPROVAL-HASH-NORMALIZED: sha256:0ae549da7d496c284d4d64301aa71c9c6837564ff502414ec4f9ed577301d687
REVIEWED-COMMIT: f005e6ed64688904c5f747c989cfb5d1696f0569
UPSTREAM-STATE: REQ sha256:0110298fd9f864a67213a3aa816da70c6295de63d93e68915dfed89ab832cedb
