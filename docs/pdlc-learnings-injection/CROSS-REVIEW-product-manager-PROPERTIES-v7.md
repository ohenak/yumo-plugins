# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 7 (delta re-review under DECISION FREEZE — PROPERTIES v0.3 → v0.4)

**UPSTREAM-STATE at this review:** REQ `sha256:ff605dd373de…` · FSPEC `sha256:ae75fa6291f1…` (v0.13)
· TSPEC `sha256:22dee8ce1c9b…` (v0.9) · DECISIONS `sha256:56617f5ab31a…` · PLAN
`sha256:b9fbd3eacb1b…` (**v0.7**, was v0.6 `sha256:d028d972450c…` at my v6) · PROPERTIES under
review `sha256:599a97a029e5…` (**v0.4**, was v0.3 `sha256:6d74d3eb5a23…`), branch
`feat-pdlc-learnings-injection` at `a12b20f9`.

## Overview

**The question.** I approved PROPERTIES v0.3 at v5 and confirmed it against PLAN v0.6 at v6 with
three non-gating items (F-01 pin, F-02 routed-item-now-answered, F-03 which properties travel under
P-A-7's case A vs case B). This round measures v0.4 — 39 insertions / 17 deletions across five
hunks (`315bdc3c`, `353e1f26`, `d6f90732`, `a12b20f9`) — against my own findings and against the
repository at `a12b20f9`.

**All three of my v6 findings are resolved.** The pin reads PLAN v0.7, §C.4 restates the routed
ledger-naming item as answered and cites PLAN's two-case table, §G.3 gains the struck row that the
item was never carried on, and the four-not-three property count is now explicit. A fourth item the
delta fixed unprompted is real: three citations of `TSPEC §T.5, T-O-6` now read *TSPEC, Named
obligations carried forward* — the correct locator, since T-O-6 lives in
`TSPEC-pdlc-learnings-injection.md` under **Named obligations carried forward** (line 1511) while
§T.5 is the *Acceptance test → suite mapping* (line 1200).

**But the revision's central move — re-measuring §C.4 against HEAD — is half-done, and the half it
did not do is now false.** §C.4 announces its method in its own words: *"the count is restated
against `git ls-files pdlc/workflows/__tests__` at HEAD"* (line 1068). Running exactly that command
at `a12b20f9` returns **all fourteen** of the rows the table lists, including the seven the table
still marks *not yet created*. The delta re-measured `git ls-files scripts/` (correctly, LI-05 has
landed) and did not re-run the command §C.4 cites for its own table. Two High findings follow, both
in the freeze's category (ii) — a factual contradiction with the repository at HEAD that makes a
load-bearing claim in this document false — and both confined to §C.4's HEAD accounting. Nothing in
the property catalogue, the oracles or the fixtures moves.

## Properties

_pending_

## Oracles

_pending_

## Fixtures

_pending_

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
