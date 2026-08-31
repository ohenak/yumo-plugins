# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.7, own bytes unchanged)
**Upstream at HEAD:** REQ `sha256:f75c348f…` (v1.7), FSPEC `sha256:c7d2c832…` (v1.7)
**Date:** 2026-08-31
**Iteration:** 10 (upstream-cascade confirmation)

## Overview

**Question answered:** does TSPEC v1.7 still hold against REQ v1.7 at HEAD? **Yes on every oracle,
no on four citations.** The REQ erratum settled the one dispute TSPEC was routing upstream, and it
settled it *in TSPEC's favour*: no type, signature, exit code, code sketch or expected test value
moves. What does not hold is TSPEC's own narration of that dispute. Four passages still quote REQ
text that has been withdrawn, and one of them sits in `§8.3 Open erratum items`, where a discharged
obligation reads as a live one.

**What the REQ edit did** (`e12b78fd8`, 12 insertions / 3 deletions, REQ v1.6 → v1.7). REQ-STATS-06
previously read "the predicate is set-membership over C-4's grammars, so a grammatical basename
outside the driver's document-type catalogue is **a survivor** even where REQ-STATS-03 reports it
malformed". That clause is withdrawn. REQ now reads: the predicate "is evaluated over exactly the
file set whose bytes the process side sums, so a basename the driver's document-type catalogue does
not recognise … contributes no process bytes and counts as no file of its family remaining: a
feature whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**"
(`REQ-pdlc-stats.md:208-213`). Nothing else in REQ changed; I diffed the commit rather than trusting
the message.

**Why this is the good outcome for the test surface.** §4.3 wrote its sketch against FSPEC BR-16, its
immediate upstream, and said so explicitly rather than guessing. BR-16 v1.7 classes that basename as
no file remaining and the directory as `harvested`; AT-17's fourth leg asserts `harvested`. REQ v1.7
now says the same thing in the same direction. The reconciliation therefore lands on the side TSPEC
already implements — the branch order, the disjunction and every fixture expectation are untouched,
and the one acceptance test whose expected value the dispute could have flipped keeps the value TSPEC
already carries. An implementer who reads only §4.3's sketch and §7's tables will build the right
thing today.

**Why that is still not "no findings".** DEC-ERR-03 asks whether the document remains a faithful
compression of upstream *as it now stands*, not whether the routed item landed. Four passages fail
that test: §4.3's contested paragraph and §8.3's E-item assert a live REQ-versus-FSPEC conflict that
no longer exists and quote REQ wording that no longer exists; §7.2's AT-17 narration offers a
"`measured` on REQ-STATS-06 v1.6's reading" alternative that has been withdrawn; and the v1.7
changelog's grounding pin cites `REQ sha256:5f3e8051…` where HEAD is `f75c348f…`. None of these
changes an oracle, so none is High. Two of them sit where downstream phases *route* work — an open
obligation and an acceptance-test expectation flagged as re-stampable — so neither is cosmetic.

**Verdict shape:** Approved with minor changes. Two Medium, two Low, no High. TSPEC does not need to
be re-opened for a decision; it needs a re-stamp of the three sites it itself nominated (§4.3's
paragraph, its pin, AT-17's leg) plus the §8.3 closure, exactly as it promised it would when the
dispute settled.

## Architecture

**Re-grounding, measured not assumed.** My v9 approval recorded `UPSTREAM-STATE: REQ
sha256:5f3e8051…`. HEAD is `f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862`
(`sha256sum docs/pdlc-stats/REQ-pdlc-stats.md`), so the approval was taken against a REQ that no
longer exists — the premise of this dispatch, confirmed. FSPEC is `c7d2c832…`, byte-identical to the
version v9 approved, so BR-16, AT-15 and AT-17 are exactly the text TSPEC compressed.

**The one absorbed decision.** Re-reading the current REQ-STATS-06 (`REQ:200-215`) against §4.3
(`TSPEC:764-799`):

| Upstream claim at HEAD | TSPEC §4.3 says | Faithful? |
|---|---|---|
| Predicate evaluated over "exactly the file set whose bytes the process side sums" | "The process side's cross-review membership is `parseReviewFilename(...).ok`, so a grammatically-failing basename contributes to **neither** side" | ✅ same rule, same set |
| Out-of-catalogue basename "contributes no process bytes and counts as no file of its family remaining" | "on BR-16's own reading a basename that fails contributes no bytes and counts as no file remaining" | ✅ verbatim in substance |
| "a feature whose only `CROSS-REVIEW-` basenames are of that shape reports **harvested**" | AT-17 leg 4 carried as `harvested` (`TSPEC:802-806`) | ✅ expectation matches |
| Harvest predicate is a disjunction over the two review families; "how much of the numerator harvest removes is not asserted" | `if (harvested && (crossReviews.length === 0 \|\| dodReviews.length === 0))` | ✅ unchanged, and REQ did not touch this |
| `docs/completed/pdlc-advisory-wave-gate/` = 62 `CROSS-REVIEW-*`, 4 out-of-catalogue, 58 grammatical → **measured** | §4.3's shape-not-verdict paragraph; §6.1 baselines; §7.2 AT-09 | ✅ REQ v1.7 does not disturb it; the shape-only reading is now the only reading |

The absorbed decision therefore *removes* a contradiction rather than introducing an obligation. I
checked specifically for the failure mode this pipeline has hit before — an erratum that lands the
item but flips a downstream expected value — and it does not occur here: the value AT-17 leg 4
asserts before the REQ edit and after it is the same token, `harvested`.

**What is now unfaithful.** The compression is correct; the *commentary about the compression* is
not. §4.3's closing paragraph (`TSPEC:790-799`) opens "What the shape itself yields is contested
upstream and is not decided here" and then quotes REQ-STATS-06 "at **v1.6**" for the survivor
clause, concluding "Both cannot hold". At HEAD both *do* hold, because one of them was withdrawn.
The paragraph is a live, load-bearing statement about the current upstream, not a changelog entry,
and it is now false in its premise, its quotation and its conclusion. §8.3's second bullet
(`TSPEC:1307-1321`) repeats the same claim in the section that enumerates what is still open.

**The document nominated its own remedy.** §4.3 states: "When it settles, exactly three things here
re-stamp — this paragraph, BR-16's version pin above, and AT-17's fourth-leg expectation named
next." It has settled. Of those three: BR-16's pin stays at v1.7 (FSPEC did not move) and AT-17's
expectation stays `harvested` (already correct); only the paragraph's text, plus the §8.3 bullet the
paragraph routes to, actually need to change. That is a narrow, mechanical edit — which is why this
is a Medium and not a re-opened review.

## Interfaces

**Did the upstream move break anything previously approved?** No. I re-read every TSPEC seam that
cites REQ-STATS-06 or the harvest predicate and checked each against REQ v1.7's bytes.

| Seam | Cites | Status under REQ v1.7 |
|---|---|---|
| `computeProcessSpecRatio` branch order (`TSPEC:817-822`) | BR-16 precedence, BR-15 zero-denominator | Unchanged. Harvested-before-zero is BR-16's precedence and REQ says nothing about ordering. |
| `crossReviews = basenames.filter(b => parsers.parseReviewFilename(b).ok)` (`TSPEC:756`) | REQ C-4, C-5 | Now *more* strongly supported: REQ v1.7's "the same one REQ-STATS-03 reports malformed (C-5)" ties the two ACs to one parser, which is exactly the no-independent-parsing-rule seam TSPEC chose. |
| `dodReviews` regex, `processFiles` union (`TSPEC:757-759`) | REQ-STATS-04, C-4 | Untouched by the edit. |
| `specFiles` via `REVIEW_DOC_TYPE_ROWS` (`TSPEC:755`) | REQ C-3 / BR-09's six rows | Untouched; the "one constant, not two lists that can drift" argument survives. |
| `fakeStatsIo` seam used for AT-12 leg 3 and AT-17 leg 4 (`TSPEC:952-957`) | FSPEC-owned fixtures | Untouched. These are the two constructed fixtures deliberately kept out of the real-path baseline table; the REQ edit does not turn either into an archive measurement. |

**The seam that matters most, re-checked positively.** The harvest disposition is reachable in
production only through `computeProcessSpecRatio`'s disjunction, and the disjunct that the
out-of-catalogue case must fire is `crossReviews.length === 0`. TSPEC's AT-17 leg-4 fixture keeps
`CODE_REVIEW` files **intact** precisely so the *other* disjunct cannot mask it (`TSPEC:807-813`).
That construction is what makes the leg a falsifiable oracle for REQ-STATS-06's new sentence rather
than an accidental pass through the DoD disjunct — and it was designed before the REQ edit landed.
It still discriminates correctly, and it is now the direct production-path proof of REQ v1.7's
"reports **harvested**, not a measured ratio that would silently undercount".

**The one interface-adjacent narration that is now wrong.** `TSPEC:802-806` describes AT-17 leg 4 as
"expected `harvested` on BR-16's reading, and `measured` on REQ-STATS-06 v1.6's" and calls it "the
row to re-stamp if the reconciliation lands the other way". There is no other way left to land. The
asserted value is right, so no test is at risk; but a reader of §7 who is deciding how firmly to
pin that expectation is told it is provisional when it is now settled. Low, because the assertion
itself is correct and unambiguous — the surrounding sentence is the defect, not the oracle.

No interface, protocol, injected IO surface or function signature in §4.2 or §5 depends on the
withdrawn clause. I re-checked `lib/stats.mjs`'s exported surface for any name or return shape that
encoded "survivor": there is none — the metric states are `measured | harvested | unmeasurable |
unavailable` (`TSPEC:543`) and the withdrawn reading would have changed which state a fixture
*reaches*, never the state catalogue itself.

## Data Model

_pending_

## Test Strategy

_pending_

## Open Questions

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
