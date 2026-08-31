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

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
