# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 4
**Round type:** upstream-cascade confirmation (REQ erratum). Document bytes unchanged.

## Overview

This round is a cascade re-confirmation, not a review. PROPERTIES' own bytes did not change: the
file hashes `sha256:7baf9b33…` at HEAD, byte-identical to the `APPROVAL-HASH` recorded in
`CROSS-REVIEW-product-manager-PROPERTIES-v3.md`. What moved is REQ, and only REQ.

Measured upstream state at HEAD against the `UPSTREAM-STATE` anchors v3 recorded:

| Upstream | Pinned in v3 | At HEAD | Moved? |
|---|---|---|---|
| REQ | `5f3e8051…` | `f75c348f…` | **yes** |
| FSPEC | `c7d2c832…` | `c7d2c832…` | no |
| TSPEC | `f2261510…` | (not re-pinned this round) | — |
| DECISIONS | `48522bf9…` | (not re-pinned this round) | — |
| PLAN | `87b439ea…` | (not re-pinned this round) | — |

The pinned REQ `5f3e8051…` is commit `1847dd9c0` (REQ v1.6). The single commit since is `e12b78fd8`,
REQ v1.7 — a one-clause erratum, +12/−3 lines, touching the metadata block and REQ-STATS-06 only.

**What the erratum decided.** REQ v1.6's REQ-STATS-06 said a grammatical basename outside the
driver's document-type catalogue was a **survivor** of its family — so a feature carrying only such
`CROSS-REVIEW-` files would report a *measured* ratio. v1.7 withdraws that: because the predicate is
"evaluated over exactly the file set whose bytes the process side sums", a basename the catalogue
does not recognise "contributes no process bytes and counts as no file of its family remaining", so
such a feature reports **harvested**. The erratum note states the withdrawn clause "contradicted its
own preceding rationale and C-5's fidelity rule, and dissented from a downstream file."

The single question this round answers: **does PROPERTIES still hold against REQ-STATS-06 as it now
stands?** It does — and more pointedly than a bare "no contradiction". PROPERTIES was the downstream
file that dissented. The erratum resolved the disagreement *in PROPERTIES' favour*, so the document
did not need to move to stay faithful; it was already asserting the reading REQ has now adopted.

## Properties

_pending_

## Oracles

_pending_

## Fixtures

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_
