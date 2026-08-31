# Cross-Review: test-engineer — DECISIONS (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, unchanged bytes)
**Date:** 2026-08-31
**Iteration:** 9

## Context

This is a **delta confirmation under DECISION FREEZE**, and the delta is empty on this document's
side: `git diff 7adc9666..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md` is empty, and the file's
sha256 is `48522bf9…`, byte-identical to the `APPROVAL-HASH` my v8 recorded. Nothing in the document
changed, so nothing in the document can have been broken by an edit to it.

What *did* move is upstream, and that is the whole question this round answers. Measured on
`feat-pdlc-stats` at HEAD (`5ec3e593e`):

| Upstream | v8's `UPSTREAM-STATE` pin | HEAD sha256 | Version at HEAD |
|---|---|---|---|
| REQ | `60a516fb…` | `5f3e8051…` | v1.6 (was v1.4) |
| FSPEC | `25af3c47…` | `c7d2c832…` | v1.7 (was v1.5) |
| TSPEC | `512a9fcf…` (phantom) | `37422160…` | v1.6 (was v1.4) |

So the question is DEC-ERR-03's, not the ordinary one: **is a frozen DECISIONS still a faithful
compression of upstream after upstream moved three times?** I answered it by diffing each upstream
document across the same range and by re-measuring, at HEAD, every repository claim this document
makes — not by re-reading the document.

The upstream deltas, and what each one asks of this document:

- **REQ v1.5–v1.6** withdraws REQ-STATS-05's harvested halt state and restores a measured `0`,
  rescopes NG-6 to the two families harvest removes, and rewords REQ-STATS-06's predicate so a
  grammatical basename outside the driver's catalogue is a *survivor*. All four are metric-semantics
  changes. This document decides module placement, `schemaVersion`'s home and the parser seam; it
  contains no reference to REQ-STATS-05, to halts-as-harvested, or to the harvested predicate at all
  (grep over the file returns no hit for `REQ-STATS-05`, `harvested`, or `POSTMORTEM`). Nothing owed.
- **FSPEC v1.6–v1.7** rewrites BR-16's `docs/completed/pdlc-advisory-wave-gate/` citation to a
  basename *shape*, corrects two → four, adds AT-15 to BR-16's trace row and re-points §7.3's E-5
  row to AT-20/AT-26. This document cites FSPEC only for §4/§5's fixed key sets and §5.2's per-class
  count (K-7) — neither touched.
- **TSPEC v1.5–v1.6** scopes the two sibling-feature document edits **outside** the ten (§1, RK-1),
  renames §6.4's "four script-side enumerations" to "the four enumerations `assertAdditiveOnly`
  reads" with the same four members, quotes P-1's title verbatim in §2.1, rewrites §4.3 to the
  shape-only BR-16 reading, and opens a second §8.3 erratum (REQ-STATS-06 v1.6 versus BR-16 v1.7).
  Every one of these is either agreed with this document already or outside its scope; §4.3's
  contested scoping touches no decision, oracle, type or count this document owns.
