# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.7, erratum round 7)
**Date:** 2026-08-31
**Iteration:** 9
**Round type:** Delta confirmation (erratum)

## Overview

**Scope.** Three commits since the anchored v8 approval (`604efad86..HEAD`: `e1315dcdb`,
`fd4b7b3ab`, `bf496d9aa`), +23/-3 lines in three places — §0's new v1.7 changelog entry, the v1.3
changelog row's neutralised `six → seven` narration, and §2.1's `coverageInstrumentation.test.js`
row. I re-read my v8 cross-review, diffed the document over that range, measured the cited code at
HEAD myself rather than trusting the row, and re-grounded on REQ / FSPEC at HEAD per `DEC-ERR-03`.
No other section was read or re-litigated.

**Both dispatched items land, and they land on measurement rather than on assertion.** The two
routed items are the same defect seen from two angles: `pm-review`/`se-author` reported that the
row's *direction* (six → seven) disagreed with HEAD, and `te-review` added that the *shipped title's
printed word* is itself stale, so the honest statement is a title moving six → eight while the set
moves seven → eight. The v1.7 edit states both halves — it separates the measured set size from the
printed word instead of picking one — and it neutralises the superseded v1.3 narration in place so a
historical changelog row cannot be read as a live count. That is the correct resolution of the
sharper `te-review` framing, not just the coarser one.

**Product lens, stated plainly.** This row is a co-change-site entry: it tells the implementer what
must move when `lib/stats.mjs` joins the vendored class. Its product obligation is that the co-change
checklist be *complete and executable* — an implementer following a wrong count either edits the
wrong number or, worse, "corrects" a title to a value that reds the shipped `toEqual`. Nothing in
REQ or FSPEC constrains the c8 include set (measured: zero occurrences of `c8` or `include set` in
either upstream document), so this edit compresses no upstream text and carries no fidelity risk to
any acceptance criterion. It is a faithfulness-to-HEAD correction, and it is now correct.

## Delta verification — each edit against HEAD

## Upstream re-grounding (DEC-ERR-03)

## Delta-Confirmation Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
