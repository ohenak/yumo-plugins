# Cross-Review: test-engineer — REQ (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/REQ-pdlc-stats.md (v1.6, 2026-08-31)
**Date:** 2026-08-31
**Iteration:** 8

## 1. Scope of this round

Delta re-review. Base of comparison: `af78b8c4e` (the commit carrying v1.5, which I reviewed in
`CROSS-REVIEW-test-engineer-REQ-v7.md`). One commit touches the REQ since —
`1847dd9c0` "REQ v1.6 — withdraw harvested halt state, restore `0`" — 22 insertions, 17 deletions
across five sites: the changelog line, §3 NG-6, §4 REQ-STATS-02's harvested enumeration,
§5 REQ-STATS-05, and §6 R-6.

Per the delta protocol I re-read only those five sites plus the surfaces they cross-reference
(REQ-STATS-03, REQ-STATS-04, REQ-STATS-06, O-1), and I re-verified every existing-behavior claim the
edit makes against HEAD rather than against the previous round's text.

## 2. Prior finding — status

**F-01 (Medium, v7) — resolved, by withdrawal rather than by the clause I suggested.**

My v7 finding was that REQ-STATS-05's *harvested* halt state was satisfied by "no post-mortem was
ever written" as readily as by "harvest deleted them", and that two real archives
(`docs/completed/pdlc-merge-phase/`, `docs/completed/pdlc-loop-economics/`) sit in the second case
and would have been relabelled `harvested` while being genuine zeros. I asked for one acknowledging
clause. The author went further and removed the state.

v1.6's REQ-STATS-05 (`REQ-pdlc-stats.md:189-194`) now reads: "Where no
`POSTMORTEM-{phase}-{feature}.md` file is present, halts report `0`. No harvested state is drawn
here… A `0` therefore means only that no halt evidence is on disk, and deliberately does not
distinguish a feature that never halted from one whose post-mortem files are gone; R-6 records that
accepted residual."

Judged against my own bar, this resolves the finding on all three counts I raised it for:

- **The oracle is a measured value again, and it is falsifiable in both directions.** A fixture with
  one `POSTMORTEM-T-{feature}.md` must report one entry for phase T; delete the file and the same
  fixture must report `0`. There is no discriminator input (LEARNINGS presence) feeding the halts
  metric any more, so the test needs exactly one file-system fact and the expected value is a literal
  transcription of the AC. Under v1.5 the same test needed a two-input truth table whose second input
  did not causally determine the answer.
- **No archive is now reported as something its own LEARNINGS contradicts.** I re-checked the two
  I named: `docs/completed/pdlc-merge-phase/` (`LEARNINGS-pdlc-merge-phase.md:12`, `:16` — "no
  POSTMORTEM was written") and `docs/completed/pdlc-loop-economics/`
  (`LEARNINGS-pdlc-loop-economics.md:16`). Both report `0`; both LEARNINGS say `0` is the truth.
  The pair that motivated v1.5 (`docs/completed/pdlc-advisory-tier/`,
  `docs/completed/pdlc-consolidation-agent/`) now report `0` where their LEARNINGS names deleted
  post-mortems — but the REQ no longer claims otherwise, and R-6 (`:263-267`) states the union
  out loud: "REQ-STATS-05 reports `0`, which unions 'never halted' with 'post-mortem files no longer
  on disk'. A consumer baselining halts over `docs/completed/` must not read `0` as evidence a
  feature ran clean." A named, documented residual is a testable contract; a silent one is not.
- **The propagation is complete.** I re-derived it mechanically rather than trusting the changelog:
  `grep -n "03/04/05/06" docs/pdlc-stats/REQ-pdlc-stats.md` returns nothing, and every surviving
  enumeration reads `REQ-STATS-03/04/06` — REQ-STATS-02 (`:146`) and R-6 (`:262`). O-1 (`:270-272`)
  still says "every metric's not-available / harvested tokens", which stays correct because three
  metrics still carry the token. No site was left behind.

## 3. What the delta changed, checked

## Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
