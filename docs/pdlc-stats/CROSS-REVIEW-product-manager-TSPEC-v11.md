# Cross-Review: product-manager — TSPEC (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.8)
**Date:** 2026-08-31
**Iteration:** 11
**Round type:** Delta re-review of the v1.8 erratum re-stamp (frozen round)

## Overview

**Verdict up front: both of my v10 findings are closed, and the revision introduced nothing.**

**What moved.** Three commits touched the document since `bf496d9aa`, the v1.7 state I reviewed —
`bc456b415` (§4.3 re-stamp), `1d3976d70` (§8.3 erratum close), `0d72080f3` (§0 re-grounding).
Together +52/−44 lines across exactly four regions: §0's changelog, §0's v1.6 entry (b), §4.3's
ratio passage, and §8.3's ledger preamble plus its second bullet. That is precisely the remediation
list my v10 Recommendation enumerated, and nothing outside it. I diffed the full range, re-read the
four changed regions against REQ and FSPEC at HEAD, and read no unchanged section.

**F-01 (High) — closed.** The three sites that asserted a live REQ-versus-FSPEC dispute and quoted
REQ's withdrawn "a survivor" clause as current now state the settled rule:

- §4.3's paragraph is retitled "**What the shape itself yields is settled upstream, in BR-16's
  favour**" and quotes REQ-STATS-06 **v1.7**. I checked the quotation character by character against
  `REQ-pdlc-stats.md:211-214` — it is verbatim, including the C-5 cross-reference and the bolded
  `harvested`. No paraphrase, no drift.
- §4.3's AT-17 annotation drops the `measured` alternative and now reads "pinned, not provisional —
  the reconciliation landed on this side, so no alternative expectation stands behind it."
- §8.3's second bullet is removed; the ledger now carries one bullet, BR-26/EC-10.
- §0's v1.6 entry (b) is not deleted but marked in place: "*Superseded — this row is history, not a
  live claim*". This is Q-01's preferred treatment.

**F-02 (Medium) — closed.** §0's v1.8 entry re-grounds explicitly and states the pin move rather than
asserting stasis: REQ `sha256:f75c348f…` (**v1.7**, commit `e12b78fd8`) against v1.7's grounding on
`5f3e8051…`, and FSPEC `sha256:a493133f…` (**v1.8**) against `c7d2c832…`. I measured both files at
HEAD: REQ is `f75c348f299ebff8…` and FSPEC is `a493133f67150b27…`. Both pins are true, and the entry
now says "One upstream decision is absorbed" where v1.7 said none was.

One point of care worth recording: the phrase "no upstream decision is absorbed this round" still
appears at `TSPEC:37`, and the "survivor" vocabulary at `TSPEC:56`, `TSPEC:69-72`. I checked each —
all sit inside the v1.7 and v1.6 **historical** changelog entries, describing their own rounds, and
v1.6's is now explicitly flagged superseded. A changelog entry that correctly describes the round it
names is not a stale live claim. There is no remaining sentence in the document that asserts the
question is open.

## Architecture

**No design moved, and that is the correct outcome for this round.** The whole point of my v10
finding was that TSPEC's *behaviour* was already right — it implemented BR-16, the side REQ v1.7
then chose — and only its account of its own upstream was false. The revision changed prose and
pins. I re-verified that claim mechanically rather than trusting it: across the +52/−44 diff, no
type, no signature, no exit code, no branch, no code sketch and no expected value is touched. The
`if (harvested && (crossReviews.length === 0 || dodReviews.length === 0))` sketch is byte-identical,
and harvested still precedes the zero-denominator test, which is BR-16's stated precedence.

**Does the design trace to REQ as REQ now stands?** Yes, and the trace is now stated rather than
hedged. REQ-STATS-06 v1.7 requires that the predicate be "evaluated over exactly the file set whose
bytes the process side sums". §4.3 derives both the harvested test and the numerator from BR-14's
grammars — `crossReviews` is grammatical membership via `parseReviewFilename(...).ok`, and the
out-of-catalogue file "contributes **neither** side" of the ratio. One file set, both halves. That
is REQ's new binding satisfied structurally, not coincidentally.

**The v1.8 changelog's characterisation of REQ's reasoning is accurate.** §4.3 says REQ "withdrew
that clause as contradicting its own preceding rationale and C-5's fidelity rule". REQ's own erratum
note at `REQ-pdlc-stats.md:20-24` reads: the clause "contradicted its own preceding rationale and
C-5's fidelity rule, and dissented from every downstream reading of the same file." The TSPEC does
not overstate REQ's grounds or invent a rationale REQ did not give.

**The FSPEC-side claim checks out too.** §4.3 now pins "BR-16 at v1.8 (unchanged since v1.7)" and
says "FSPEC v1.8 absorbed the same decision with no rule changed." FSPEC's v1.8 changelog
(`FSPEC-pdlc-stats.md:18-22`) confirms both halves: "re-grounded on REQ v1.7; **no rule changed**",
and the item is "**absorbed**, not open: BR-16, BR-14 and REQ-STATS-06 now [read one file set]".
The pin moved for the right reason — the document version advanced while the rule it cites did not —
and the parenthetical says exactly that, which is the honest form of a version bump.

**The re-stamp matched its own pre-declaration.** §4.3 has said since v1.6 that when the dispute
settled, "exactly three things here re-stamp — this paragraph, BR-16's version pin above, and AT-17's
fourth-leg expectation." All three moved, and the §8.3 bullet it also named closed. I found no fourth
site: I grepped the document for every occurrence of `survivor`, `contested`, `REQ v1.6` and
`re-stamp if`, and every hit falls in a historical changelog entry or the deliberate in-place record.
A document that predicts its own blast radius and then holds to it is cheap to re-review, and this
one did for the second round running.
