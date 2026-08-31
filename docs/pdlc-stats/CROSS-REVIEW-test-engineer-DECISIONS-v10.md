# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, unchanged bytes)
**Date:** 2026-08-31
**Iteration:** 10

## Context

**Upstream-cascade confirmation.** The document's own bytes have not moved: its sha256 is
`48522bf9…`, byte-identical to the `APPROVAL-HASH` recorded at v8 and re-confirmed at v9, and
`git diff` over `docs/pdlc-stats/DECISIONS-pdlc-stats.md` across this round's range is empty. What
moved is one upstream. Measured on `feat-pdlc-stats` HEAD (`b9173c875`):

| Upstream | v9's `UPSTREAM-STATE` pin | HEAD sha256 | Moved? |
|---|---|---|---|
| REQ | `5f3e8051…` | `5f3e8051…` | no — v1.6, identical |
| FSPEC | `c7d2c832…` | `c7d2c832…` | no — v1.7, identical |
| TSPEC | `235fd3dd…` (phantom) | `a06a6032…` | **yes** — v1.6 → v1.7 |

So this is a single-upstream cascade, and a narrow one. REQ and FSPEC are byte-identical to the
versions I confirmed against at v9; only TSPEC moved, and the question is whether this frozen
DECISIONS is still a faithful compression of TSPEC v1.7.

**A note on my own v9 pin.** v9's `UPSTREAM-STATE` trailer recorded TSPEC at `235fd3dd…`, a hash
that appears nowhere in this branch's history for that path. v9's *body*, by contrast, measured
TSPEC HEAD as `37422160…` (commit `4943a8777`, TSPEC v1.6) and reviewed against it. The trailer
hash is a phantom — the same defect v9 recorded against v8's `512a9fcf…` pin, so this is now the
second consecutive round whose trailer pin does not resolve. I diffed from `4943a8777`, the version
v9 actually read, because a pin that resolves to nothing cannot be a baseline. Recorded as F-04,
`Process`-flavoured and non-gating, because it degrades the cascade mechanism rather than this
document.

**The delta (`4943a8777..HEAD`, +23/−3, three commits).** TSPEC v1.7 is an erratum round that lands
exactly one measured correction — **the one v9 routed from this document**:

- §2.1's `coverageInstrumentation.test.js` row no longer narrates P9-02's title as moving *six →
  seven*. It now states that the title and comment are **already stale at HEAD**, that HEAD's
  literal is `REQUIRED_INCLUDES` (four) + `CAPTURE_SCRIPT_INCLUDE` (one) + two `lib/` modules =
  **seven**, and that this feature moves the set **seven → eight** (printed `six` → `eight`), with
  the comment's arithmetic restated as four + one + three.
- The v1.3 changelog's stale "six → seven" is de-staled in place, with the number removed so the
  historical row cannot be read as a live claim.
- A v1.7 changelog entry attests re-grounding on REQ `5f3e8051…` / FSPEC `c7d2c832…` — the same
  documents v1.6 absorbed — and absorbs **no** upstream decision: no new `BR-`, `E-` or `AC-` row,
  no vocabulary rename.

I verified the corrected arithmetic against HEAD rather than trusting either document:
`REQUIRED_INCLUDES` holds four members (`orchestrate-dev.js`, `orchestrate-queue.js`,
`build-runtime.mjs`, `scripts/check-wave-resume-delta-coverage.mjs`), and
`pdlc/workflows/package.json`'s `c8.include` holds **seven** entries at HEAD. `4 + 1 + 2` = seven;
adding `lib/stats.mjs` makes eight. TSPEC v1.7 is now correct, and the shipped test title still
prints "six" while the adjacent comment still says "three entries" — both stale in the code, exactly
as both documents now say.

## Options Considered

The document is frozen, so the only options open to me are dispositions of this round.

| Option | Shape | Why not / why |
|---|---|---|
| Approve as a null round ("only TSPEC moved, and it moved the way I asked") | Treat the erratum landing as sufficient | **Rejected.** DEC-ERR-03 is explicit that items landing is necessary, not sufficient. The interesting consequence of an erratum landing is not that the upstream defect is gone — it is that *this* document's record of that defect is now describing a version of TSPEC that no longer exists. Approving on the item list would have missed exactly the finding this round exists to catch. |
| Raise the stale divergence-record as **High** and halt | Treat "cites upstream text upstream no longer says" as gating on its face | **Rejected.** The gating test is whether a decision, oracle, falsifier, type or task sizing is falsified. Here the opposite happened: K-3's arithmetic (literal seven, feature makes eight, title and comment move with it) is *correct*, and TSPEC has now moved into agreement with it. An implementer following K-3 literally still lands the right edit. What is false is a meta-claim about a disagreement, not the engineering content. Halting a phase over a discharged erratum's residue would be severity inflation. |
| Re-open TSPEC §2.1 or re-route the erratum | File a fresh `ERRATUM: TSPEC` | **Rejected.** The erratum v9 routed is discharged, and I verified the repair against HEAD rather than against TSPEC's own account of it. Re-routing a satisfied item would burn a bounded round on work already done — the precise failure mode DEC-ERR-03's "necessary, not sufficient" framing warns about in the other direction. |
| Confirm faithfulness, record the stale record and the carried items as non-gating | Approve, leave the one-line repairs owed to the next DECISIONS touch | **Chosen** |

One thing I deliberately did **not** do: match this round's finding into a demand that DECISIONS
now delete its divergence clause *in this round*. DECISIONS is frozen with an approved PLAN
downstream of it, and the clause is inert — it misdescribes upstream without mis-sizing any task.
Editing it here would manufacture a downstream obligation to discharge a cosmetic staleness, which
is the same reasoning v1.5 used when it declined to edit TSPEC from a DECISIONS dispatch.

## Decision

**The document is unchanged and remains a faithful compression of REQ v1.6 / FSPEC v1.7 / TSPEC
v1.7 at HEAD. No decision, oracle, falsifier, type, count or task sizing is falsified by TSPEC
v1.7. No High finding, old or new.** Two Medium and two Low findings stand, none gating.

I re-read the upstream text this document leans on at its current version, rather than checking the
item list. Since REQ and FSPEC are byte-identical to v9's pins, the whole surface at risk is what
this document says about **TSPEC**.

### The one thing TSPEC v1.7 changed about this document's standing

K-3 carries a clause that is now a claim about a version of TSPEC that no longer exists:

> **Upstream divergence, owed to TSPEC and not resolved here (TE F-05).** TSPEC §2.1's row for this
> site describes P9-02's title count as moving *six → seven*, which reads the stale title as if it
> were the true HEAD state.

At HEAD, TSPEC §2.1's row says the opposite of what this clause attributes to it — it states the
title and comment are already stale, measures the literal at seven, and moves it seven → eight. The
same stale attribution appears twice more, in the v1.5 changelog's *"carried unresolved by design"*
paragraph and in the v1.6 changelog's *"records TSPEC §2.1's 'six → seven' as an erratum owed
upstream"* sentence.

This is a genuine DEC-ERR-03 finding — the document cites upstream text upstream no longer says —
and it is `delta`-provenanced: the pre-round bytes of TSPEC made the clause **true**, and this
round's edit is what falsified it. It is nonetheless **Medium**, because the direction of the
change is convergence, not divergence:

| What K-3 asserts | Status at HEAD |
|---|---|
| `REQUIRED_INCLUDES` holds **four** entries | holds — measured four |
| the literal is `4 + 1 + 2` = **seven** | holds — `c8.include` is seven at HEAD |
| this feature makes it **eight** | holds |
| the shipped title's `six` and the `three entries` comment are **already wrong at HEAD** | holds — both still stale in the code |
| the title and comment move with the include literal, as a clause not a row | holds — neither is load-bearing on a check |
| **TSPEC disagrees and owes an erratum** | **false at HEAD — TSPEC v1.7 agrees and the erratum is discharged** |

Every engineering conjunct survives. Only the disagreement bookkeeping rotted. An implementer
reading K-3 today is told the arithmetic correctly and is additionally told to distrust a TSPEC row
that is now trustworthy — which costs a reader one cross-check, not a mis-sized task. That is a
freshness defect, not a falsified compression.

### What I checked that did *not* move

- **No new upstream decision to absorb.** TSPEC v1.7's changelog attests no new `BR-`, `E-` or
  `AC-` row and no vocabulary rename, and I confirmed the delta touches only the changelog and the
  §2.1 row — §6.4's classifier-purity oracle, §7.3's probe totals and §4.3's BR-16 scoping are
  byte-unchanged in this range. Nothing owed to `DEC-STATS-01/02/03`.
- **§7.3's 25-vs-24 probe reconciliation is untouched**, so v9's withdrawal of its own v8 F-02 still
  stands: the two totals are probe-variants over the same ten transcribers, and this document's
  probe-invariance table already reconciles them.
- **K-8's "seven → eight" assertion-edit headline is a different count from K-3's include-set
  count** and was not disturbed. The coincidence of the words is not a coupling — one counts
  assertion edits in `loop-distribution.test.js`, the other counts `c8.include` members. Neither
  moved.
- **K-1's four-way partition still covers all ten sites** without overlap, and site 10's "pinned by
  no oracle" residue is still stated in three places. TSPEC v1.7 added no site.
- **Option B's cost still prices correctly.** `pdlc/engine/package.json` still declares no `c8`
  block and no coverage dependency, so B still does not pay the include-set edit.

## Consequences

**The erratum channel worked, and that is worth recording.** v9 routed one `ERRATUM: TSPEC` for a
count this document refused to match because it was measurably wrong. TSPEC v1.7 landed exactly
that repair, and I confirmed it against HEAD code rather than against TSPEC's account of itself.
The refusal-to-match call made at v1.5 — carry the correct arithmetic, record the divergence, route
the repair upstream — is now vindicated end to end: had this document matched "six → seven" for
agreement's sake, two documents would have agreed on a number that HEAD contradicts, and PLAN would
have read a task mis-sized by two with nothing to red it.

**The cost of that call is the residue this round found.** A document that records a disagreement
takes on an obligation to notice when the disagreement ends. This one cannot, because it is frozen
— so the record outlives the defect it describes. That is not an argument against recording
divergences; it is an argument for phrasing them so they degrade safely. K-3's clause would have
aged better as *"TSPEC's row for this site is the authority; if it narrates the move from the
printed word rather than the measurement, that is the erratum"* — a conditional that becomes inert
rather than false. Worth carrying into the next feature that records a cross-document divergence
under freeze; tagged `Process` below.

**Three one-line repairs are owed to the next DECISIONS touch, none to this round.** They are
purely textual, touch no decision or falsifier, and I state them here so a later round does not
have to re-derive them:

1. K-3's *"Upstream divergence, owed to TSPEC and not resolved here (TE F-05)"* clause — the
   divergence is discharged as of TSPEC v1.7; the clause should be reduced to the arithmetic it
   protects, or dropped.
2. The v1.5 changelog's *"carried unresolved by design"* paragraph and the v1.6 changelog's
   *"records TSPEC §2.1's 'six → seven' as an erratum owed upstream"* sentence — both now
   historical rather than live; they should read as history, the way TSPEC v1.7 handled its own
   v1.3 changelog row by removing the number so it cannot be read as a live claim. That is the
   pattern to copy.
3. The v1.6 grounding attestation (F-02 below), which is now three versions stale.

**Nothing is owed upstream from this round.** No `ERRATUM:` line is routed. TSPEC v1.7 is correct
where this document is correct, and the two now agree on every conjunct of the include-set
arithmetic.

**The cascade mechanism itself has a defect worth more than this document.** Two consecutive rounds
have now written an `UPSTREAM-STATE` TSPEC pin that resolves to no version in history — v8's
`512a9fcf…` and v9's `235fd3dd…`. Both times the reviewing round recovered by falling back to the
hash measured in its own body, and both times that recovery was manual. A pin that does not resolve
silently converts a cascade confirmation into a guess about what the baseline was; the next
reviewer who does not think to cross-check the body against the trailer will diff from the wrong
base and confirm against a version nobody reviewed. Tagged `Process`, F-04.

### Positive observations

- **The probe-invariance table keeps earning its place.** It is why §7.3's 25-vs-24 totals needed no
  re-litigation this round: the reconciliation is written down, so an upstream edit elsewhere in
  §7.3 cannot reopen it by accident.
- **K-3's decision to re-measure rather than carry forward** is the reason this document was right
  and upstream was wrong, and the reason the erratum was actionable when it was raised. Re-measuring
  a count at HEAD instead of transcribing it from a sibling document is the habit that produced the
  only durable win in this document's review history.
- **TSPEC v1.7's repair is better than the one that was asked for.** It did not merely swap the
  numbers; it restated *why* the printed word and the measurement differ, so the row now survives
  the next `REQUIRED_INCLUDES` change without going stale again. That is the failure mode fixed at
  the root rather than at the symptom.

## Delta-Confirmation Findings

## Verdict
