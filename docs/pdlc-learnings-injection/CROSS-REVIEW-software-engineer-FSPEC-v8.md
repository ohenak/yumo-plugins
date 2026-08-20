# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md (v0.7)
**Date:** 2026-08-19
**Iteration:** 8 (delta confirmation of the v0.7 erratum follow-up)

## Overview

Scope is the delta `4857352e..fa229bde` only — twelve inserted lines across four passages
(version row, v0.7 erratum note, AC-6.2 traceability row, E-13 provenance, AT-32 body) — plus
re-verification of the code and corpus facts those passages assert. Previously approved
sections were not reopened.

Both v7 findings are resolved, and resolved against facts I re-measured rather than against
the finding text. The edit also carries one change that was not routed — AT-32's
positive-presence conjunct — and that change is an improvement, not a regression.

| v7 finding | Landed | Correct against repository state |
|---|---|---|
| F-01 (High) — E-13 measured provenance | Yes | Yes — re-measured; counts are exact (see below) |
| F-02 (Medium) — AC-6.2 traceability row | Yes | Yes — row now reads `AT-31, AT-32` (`:134`) |
| *(unrouted)* AT-32 non-vacuous equality | Yes | Yes — positive conjunct pairs the equality oracle |

**F-01 re-measured at HEAD, not taken on trust.** E-13 now reads `(measured: 2 of 89 at HEAD,
both in regime-ledger; none in yumo-plugins)` (`:684`). Every number in that parenthetical
checks out against BR-4's declared two-repository corpus (`:326`):

- `regime-ledger` corpus is `docs/completed/**/LEARNINGS-*.md` = **80** documents, matching
  BR-4's table. Exactly **two** carry free text after the date:
  `docs/completed/02-macro-prediction/LEARNINGS-macro-prediction.md:7`
  (`2026-06-09 (Phase H harvest; partial close-out)`) and
  `docs/completed/78-structure-options-scoring/LEARNINGS-structure-options-scoring.md:7`
  (`2026-07-22 (merged PR #214)`). No third occurrence exists — I enumerated all 80 values and
  filtered for anything not matching a bare ISO date.
- `yumo-plugins` holds 11 `LEARNINGS-*.md` files, of which **9** are corpus members, matching
  BR-4's table. The two non-members sit under `docs/discarded/{feature}/`, excluded by corpus
  shape per the glossary (`:73`) and BR-2 (`:279-284`). Both non-members *do* carry free text
  after the date (`docs/discarded/pdlc-review-convergence/LEARNINGS-pdlc-review-convergence.md:7`,
  `docs/discarded/pdlc-rcv-budget-stop/LEARNINGS-pdlc-rcv-budget-stop.md:7`) — so "none in
  yumo-plugins" is true precisely because the corpus excludes discarded documents, and false
  of the raw file glob. The FSPEC's own corpus definition is what makes the claim correct, and
  that definition is stated in the same document. The claim stands as written.
- `2 of 89` is a corpus-wide rate over BR-4's 89-document total. It is not `2 of 87`
  (documents carrying a `Date Completed` row at all); both readings are defensible and the
  chosen denominator is the one BR-4's table bolds, so there is no ambiguity to resolve.

**AT-32's new conjunct closes a real vacuity hole.** The three default-enabled states now
assert that their composition equals the enabled-run composition **and** that the comparison
target itself carries the C-4-delimited advisory material per AC-1.1 (`:884-887`). Without
that conjunct the equality would pass if injection produced nothing in both arms — the exact
failure mode where a config-reading bug and an empty-selection bug cancel. C-4 is a real REQ
constraint requiring delimited, source-identified material (`REQ:176-180`), and AC-1.1 is the
criterion that makes the block's presence obligatory (`REQ:250`), so both citations resolve.
This was not a routed item; it is the author noticing an adjacent defect while in the passage.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | `delta` `local` — the AC-6.2 row now lists acceptance tests in the **FSPEC rule** column: `\| AC-6.2 \| §Acceptance-test preamble, AT-31, AT-32 \| AT-31, AT-32 \|` (`:134`). Every other row in that table keeps rules on the left and tests on the right, and the neighbouring AC-6.1 row cites only a section (`§Acceptance Tests preamble`) without repeating its tests. The v7 fix was to the third column, which is now correct; the ATs leaking into the second column appear to be collateral from the same edit. Harmless to a human reader, but a mechanical rule-coverage check over column 2 would now see two AT ids where it expects rule or section references. Also note the two rows spell the same heading differently — `§Acceptance Tests preamble` (`:133`) vs `§Acceptance-test preamble` (`:134`); the actual heading is `## Acceptance Tests` (`:730`). **Fix:** column 2 reads `§Acceptance Tests preamble` alone, matching AC-6.1. Not worth a round on its own — fold into the next edit that touches the file. | §Traceability (`:134`) |

## Questions

None. Q-01 from v7 is answered by the edit itself: BR-4's measurement stays two-repository,
and E-13's provenance was restored to match it rather than BR-4 being narrowed to this repo.

## Positive Observations

- **The regression was reverted without over-correcting.** The v7 finding said the original
  `(measured: occurs at HEAD)` wording was right; the edit did not simply restore that string
  but replaced it with a stronger one carrying the counts and their repository split. A future
  reader who doubts the claim now has the arithmetic in front of them instead of a bare
  assertion, and the claim is falsifiable in one grep. Restoring a reverted fact in a stronger
  form than it had before is the right response to having broken it once.
- **The erratum note documents the round rather than hiding it.** The v0.7 header block
  (`:27-31`) names all three changes and attributes them to the v7 delta-confirmation findings.
  The v0.6 note directly above it is preserved rather than overwritten, so the document carries
  its own correction history in order — including the round where a routed item made the text
  worse. That is what makes the DEC-ERR-03 confirmation round auditable after the fact.
- **AT-32's fix generalises the v7 lesson instead of just applying it.** The routed items were
  about provenance and an index row; the author additionally hardened an equality oracle that
  neither finding mentioned. Pairing an equality assertion with a positive-presence assertion
  on the comparison target is the anti-vacuity discipline the acceptance-test bar asks for, and
  applying it unprompted in the passage being edited is cheaper than discovering the vacuous
  green in PROPERTIES review.
- **Nothing previously approved moved.** The delta is twelve inserted and four deleted lines,
  all inside the four passages the routed items named. BR-4's evidence table, the notice
  catalogue, Group 1–4 tests and the edge-case table are byte-identical to the approved v0.6.

## Recommendation

**Approved with minor changes**

Both v7 findings are resolved and independently verified: E-13's provenance is measured and
its counts are exact against both repositories, and the AC-6.2 traceability row again reports
AT-31, AT-32. The unrouted AT-32 conjunct removes a vacuous-green risk without changing any
behaviour the document specifies. No High finding is open, so nothing blocks this phase.

The single Low finding — acceptance-test ids sitting in the traceability table's rule column
(`:134`) — is a cosmetic index defect. It does not change coverage, does not mislead a human
reader, and should be folded into whatever edit next touches the file rather than earning a
round of its own.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
