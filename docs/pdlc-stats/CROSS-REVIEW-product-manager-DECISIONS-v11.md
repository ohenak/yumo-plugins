# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, bytes unchanged)
**Base reviewed v10:** `10963e85dcf2d62fb869f704f02d9d2c76484ba7`
**Upstream at this round:** REQ `f75c348f…` (v1.7) · FSPEC `c7d2c832…` (v1.7) · TSPEC blob `a06a6032…` (v1.7)
**REQ reviewed v10:** `5f3e8051…` (v1.6)
**Date:** 2026-08-31
**Iteration:** 11 (upstream-cascade confirmation — REQ erratum round)

## Context

**No document bytes moved: upstream only.** `git diff 10963e85..HEAD -- docs/pdlc-stats/DECISIONS-pdlc-stats.md`
is empty. DECISIONS is unchanged at v1.6 — the same bytes approved at v8 and re-confirmed at v9 and
v10 (`sha256:48522bf9…`).

**What moved is REQ.** `docs/pdlc-stats/REQ-pdlc-stats.md` advanced `5f3e8051…` (v1.6) →
`f75c348f…` (v1.7) in one commit, `e12b78fd8` — a targeted erratum, +12/−3, two hunks: the
changelog row, and one paragraph of REQ-STATS-06. My v10 approval was taken against REQ v1.6, which
no longer exists; this round answers the single question **is DECISIONS still a faithful compression
of REQ as it now stands**.

**FSPEC and TSPEC did not move this round.** The dispatch's FSPEC pin (`c7d2c832…`) and REQ pin
(`f75c348f…`) both reconcile exactly against the files on the branch. The TSPEC pin (`f2261510…`)
again does not resolve to the branch blob (`a06a6032…`, v1.7) — the fourth consecutive round with
that mismatch. It does not impede this round: TSPEC's own bytes are byte-identical to what I
measured at v10, so the version it names is unambiguous and nothing about TSPEC is re-opened here.
Recorded as a pipeline observation, not a finding against DECISIONS, exactly as at v10.

**The REQ erratum, precisely.** REQ-STATS-06 previously read: *"The predicate is set-membership over
C-4's grammars, so a grammatical basename outside the driver's document-type catalogue is a survivor
even where REQ-STATS-03 reports it malformed."* v1.7 withdraws that clause. It now reads that the
predicate is evaluated over exactly the file set whose bytes the process side sums, so a basename the
driver's catalogue does not recognise — the same one REQ-STATS-03 reports malformed (C-5) —
contributes no process bytes and **counts as no file of its family remaining**: a feature whose only
`CROSS-REVIEW-` basenames are of that shape reports **harvested**, not a measured ratio. The
changelog states the scope itself: *"one clause decided, no rule added… No other change."*

**Why this is the erratum I flagged as possible at v10, and why it lands outside DECISIONS.** At v10
I recorded that TSPEC §8.3's REQ-STATS-06-versus-BR-16 conflict was open upstream and outside what
DECISIONS decides, with one conditional: *"if reconciliation ever reaches the parser-catalogue seam,
`DEC-STATS-03`'s bundle-identity oracle is where to re-check."* That reconciliation has now landed,
and it does reach the catalogue — so this round is not a formality. I re-opened the seam and tested
it rather than asserting the carve-out held.

## Options Considered

_(pending)_

## Decision

_(pending)_

## Consequences

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
