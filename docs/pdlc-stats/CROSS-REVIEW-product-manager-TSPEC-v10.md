# Cross-Review: product-manager — TSPEC (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.7, bytes unchanged since v9 approval)
**Date:** 2026-08-31
**Iteration:** 10
**Round type:** Upstream-cascade confirmation (REQ moved; TSPEC did not)

## Overview

**What moved.** Exactly one upstream commit since my v9 approval anchored `REQ sha256:5f3e8051…`:
`e12b78fd8` *"REQ v1.7 erratum — decide REQ-STATS-06 out-of-catalogue basename as harvested"*,
+12/-3 lines in two places — REQ §0's changelog (version 1.6 → 1.7 plus a five-line erratum note)
and REQ-STATS-06's closing predicate paragraph. FSPEC did not move: HEAD measures
`c7d2c832dee586c8e371ec843c0809b167b65dbbeced4dd140934fe68d0ec63d`, byte-identical to the
`UPSTREAM-STATE` pin my v9 carried. REQ at HEAD measures
`f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862`, matching the dispatch attestation.

**The substantive change, in one line.** REQ-STATS-06's clause *"the predicate is set-membership over
C-4's grammars, so a grammatical basename outside the driver's document-type catalogue is **a
survivor** even where REQ-STATS-03 reports it malformed"* is **withdrawn**. In its place REQ now says
the predicate is evaluated over exactly the file set the process side sums, so an out-of-catalogue
basename *"contributes no process bytes and counts as no file of its family remaining: a feature
whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**"*. The clause was
decided, not reconciled — withdrawn as dissenting from REQ-STATS-06's own rationale, REQ-STATS-03's
malformed classification of the same basename, and C-5.

**What that means for this TSPEC, product lens.** TSPEC §4.3 already implements the harvested reading
(it follows FSPEC BR-16 v1.7, its immediate upstream). So the *behaviour* this document specifies is
now, at HEAD, exactly what REQ requires: no type, signature, exit code, oracle or code sketch is
wrong. The problem is elsewhere and it is real: **TSPEC's live text says this question is contested
upstream, and quotes REQ verbatim for a clause REQ no longer contains.** The dispute TSPEC routes to
the owning phase has been settled — in favour of the side TSPEC already implements. A document that
tells its downstream a P0 acceptance criterion's expected value is provisional, when upstream has
decided it, is no longer a faithful compression of upstream (DEC-ERR-03). That is F-01 below, and it
is mechanical: TSPEC itself names the exact sites that re-stamp.

I re-read my v9 cross-review, diffed `e12b78fd8` in full, re-read REQ-STATS-06 and FSPEC BR-16 at
HEAD, and re-read only the TSPEC regions those clauses bear on (§0 changelog, §4.3's ratio passage,
§8.3). Nothing else was read or re-litigated.

## Architecture

**Does the design still trace to REQ as REQ now stands?** Yes — and on the settled question it now
traces more cleanly than it did.

TSPEC §4.3's harvested test is asked over BR-14's grammars: `crossReviews` is grammatical membership
(`parseReviewFilename(...).ok`), so the disjunct asks whether any grammar-passing cross-review
remains, not whether any basename starting `CROSS-REVIEW-` remains. Separately, §4.3 states that a
`CROSS-REVIEW-{role}-REVIEW-v{N}.md` file "contributes **neither** side" of the byte ratio. Put those
together and the design says: an out-of-catalogue basename adds no process bytes and leaves no file
of its family remaining. That is REQ-STATS-06 v1.7's new sentence, clause for clause. The predicate
REQ now mandates and the predicate §4.3 implements are the same predicate.

So the erratum lands *no* new obligation on this layer. Nothing in §4 must be redesigned, no branch
order changes (harvested still precedes the zero-denominator test, BR-16's stated precedence), and
the `if (harvested && (crossReviews.length === 0 || dodReviews.length === 0))` sketch is untouched by
the decision.

**What the erratum does invalidate is TSPEC's account of its own upstream.** Three passages describe a
live REQ-versus-FSPEC conflict:

- §0's v1.6 changelog entry (b) — `TSPEC:51-55` — "**REQ-STATS-06 v1.6** now calls a grammatical
  basename outside the driver's catalogue **a survivor**, which contradicts BR-16's 'reports
  `harvested`' … §8.3 carries it as the second open erratum (routed, not repaired)."
- §4.3's paragraph "**What the shape itself yields is contested upstream and is not decided here**" —
  `TSPEC:790-799` — which quotes the withdrawn clause verbatim and concludes "Both cannot hold."
- §8.3's second erratum bullet — `TSPEC:1308-1321` — "**REQ-STATS-06 (v1.6) and FSPEC BR-16 (v1.7)
  now disagree** …", again quoting the withdrawn text.

All three are, at HEAD, false statements about REQ. The quoted sentence does not exist in
`REQ-pdlc-stats.md`; REQ v1.7 states the opposite. This is the finding.

**§8.3's own rule decides how to handle it.** That section's preamble already removed three erratum
bullets on exactly this ground: "an erratum bullet whose upstream answer has landed re-routes a
settled question, which is `DEC-ERR-01`'s anti-pattern, and costs a round on something upstream has
already decided." The second bullet is now such a bullet. TSPEC's own policy says to close it and
restate §4.3's behaviour as the specified behaviour it is.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
