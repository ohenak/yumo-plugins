# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 12 (upstream-cascade confirmation — PROPERTIES bytes unchanged; PLAN moved v0.8 → v0.9)

**UPSTREAM-STATE at review:** REQ `sha256:ff605dd3…` (v0.9) · FSPEC `sha256:ae75fa62…` (v0.13) · TSPEC `sha256:22dee8ce…` (v0.9) · DECISIONS `sha256:56617f5a…` · PLAN `sha256:eaddd392…` (**v0.9**, erratum `ba120270`). PROPERTIES at HEAD is `sha256:e9de08bc…` — byte-identical to the bytes I approved at v11.

## Overview

**The one question this round asks.** PROPERTIES has not moved — its bytes hash to the same
`sha256:e9de08bc…` recorded on my v11 approval anchor. PLAN moved beneath it: erratum `ba120270`
took PLAN from v0.8 to v0.9 with two targeted corrections and no structural change. The question is
whether this PROPERTIES is still a faithful compression of PLAN **as it now stands**, not merely
whether the two named items landed.

**What the PLAN erratum actually changed.** `git show ba120270` is three hunks:

| Hunk | PLAN passage | Change |
|---|---|---|
| 1 | Version cell, line 18 | `0.8` → `0.9` |
| 2 | P-A-7 lead-in, line 487 | *"in the two cases that can arise"* → *"in the three cases that can arise (A, B and C below)"* |
| 3 | LI-08's amendment note, line 147 | *"`ordinal`, `gloss` and a free-form `body`, all three unexercised by any landed suite"* → `ordinal` and `gloss` unexercised, `body` **already exercised** (`learningsBlock.test.js` on all six section specs, `learningsSelect.test.js` on the non-BR-6 section); conclusion *"adds callers, not knobs"* unchanged |
| — | Changelog | New v0.9 row recording both, and asserting the A/B/C table's own text is untouched |

**The answer: PROPERTIES still holds, and hunk 2 moves upstream toward this document, not away from
it.** PROPERTIES §C.4 has read the table as **three**-case since v0.7 (line 1110: *"of PLAN's
**three**-case table at v0.8, **case C is the live case**"*; line 1155: *"in **any of the three
cases**"*). PLAN's stale *"two cases"* lead-in was the one place upstream still contradicted that
reading — the table body already had three rows. v0.9 removes the contradiction. A compression that
was faithful to the table and ahead of the prose is now faithful to both.

**Hunk 3 does not reach this document at all.** I grepped PROPERTIES for `renderSection`, `knob`,
`caller`, `unexercised`, `ordinal`, `gloss`: the only hit touching LI-08's amendment note is the
header cell's *"relocated LI-08's amendment note"* (a fact about PLAN v0.7's edit, still true), and
the only `body` hits are property text about section **body markers** (line 274, PROP-BOUND-05's
*"five presence conjuncts on each section's **body** marker rather than its heading"*), which is a
claim about rendered corpus documents, not about `renderSection`'s parameter list. PROPERTIES never
restated the false *"all three unexercised"* claim, so it did not inherit it and does not now need
correcting for it. The premise it **does** lean on — additivity — sits in PLAN's paragraph **below**
the case table (*"the landed helper already renders an optional ordinal and an optional gloss, and
existing callers that declare neither keep byte-identical output"*), which hunk 3 did not touch and
which hunk 3's correction strengthens rather than weakens: `body` being already-exercised is one
fewer knob whose first caller could perturb output.

**Every load-bearing quotation re-verified against PLAN at HEAD.** I re-grepped PROPERTIES' verbatim
citations into PLAN with fixed-string matching, at `sha256:eaddd392…`: *"after batch 13, the case
that is live at HEAD"*, *"under case C they owe no ledger row, and they owe green"*, *"batch 9
through batch 12"*, *"no** row of their own in"* and *"**this** heading-form follow-up commit, not a
standing exemption"* each match exactly once. No quotation rotted.

**One thing did go stale, and it is the header pin.** PROPERTIES line 11 pins PLAN at **v0.8** and
line 1155 attributes the exemption ruling to *"PLAN v0.8"*; PLAN is v0.9. The substance behind every
such reference is unchanged, so this is a pin-freshness finding, not a fidelity one — recorded Low
below, non-gating, exactly as the equivalent pin lag was handled in v11.

## Properties

## Oracles

## Fixtures

## Recommendation

## Delta-Confirmation Findings

## Verdict
