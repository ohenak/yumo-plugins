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

## Options Considered

Under freeze the only options open to me are dispositions of this round, not of the document.

| Option | Shape | Why not / why |
|---|---|---|
| Approve on "no diff, nothing to check" | Treat an empty document delta as a null round | **Rejected.** Upstream moved three documents; a frozen compression can be falsified by its sources moving underneath it without a byte of it changing. DEC-ERR-03 asks the confirmation to measure the document against HEAD, not against the item list |
| Re-open TSPEC's §4.3 / REQ-STATS-06 dispute here | Take a side on the out-of-catalogue basename | **Rejected.** It is a REQ-versus-FSPEC reconciliation TSPEC §8.3 already routes to the owning phase, and it reaches no decision, type or oracle this document owns. Opening it here would be a new decision in a frozen round |
| Block on the stale grounding attestation | Read v1.6's "upstream did not move" as false at HEAD | **Rejected as blocking, recorded as Medium.** The sentence was true when written and is version-scoped; I verified independently that no upstream decision is owed absorption, so no load-bearing claim of this document is false. It is a freshness defect a future round could trip over, not a falsified claim |
| Approve with the residual findings recorded | Confirm faithfulness, file what is stale, route what is upstream | **Chosen** |

I also re-derived the repository claims themselves rather than trusting either document, because
"cheaper / simpler" and "N sites" claims are exactly the kind that rot silently when a branch
advances. Every measurement below is a fresh run at HEAD.

**Sweep totals (both probes, both documents):**

| Query | Measured at HEAD | Document claiming it |
|---|---|---|
| `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` | **25** | DECISIONS (25 − 15 = 10) |
| `git grep -l "lib/loop-session.mjs" -- . ':!docs/'` | **24** | TSPEC §2.1/§7.3 (24 − 14 = 10) |
| `grep -rln "escalation-view"` (dist/docs/node_modules excluded) | **23** | DECISIONS' NUL-byte caveat |

All three reproduce exactly. **This withdraws my own v8 F-02**, which read TSPEC §7.3's "24
candidates / 14 pure consumers" as stale by one against a measured 25: the 25 is *this document's*
probe, the 24 is TSPEC's (`TSPEC:211-222` states the `lib/loop-session.mjs` probe and the 24 − 14 = 10
arithmetic explicitly), and DECISIONS' own probe-invariance table already reconciles them. The error
was mine — comparing one document's total under the other's query, the exact thing this document
warns is "not defensible". Nothing is owed to TSPEC on that count.
