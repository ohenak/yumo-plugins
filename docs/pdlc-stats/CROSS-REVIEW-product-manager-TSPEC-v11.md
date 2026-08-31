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
