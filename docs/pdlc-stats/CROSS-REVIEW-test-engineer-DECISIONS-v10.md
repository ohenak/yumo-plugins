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

## Consequences

## Delta-Confirmation Findings

## Verdict
