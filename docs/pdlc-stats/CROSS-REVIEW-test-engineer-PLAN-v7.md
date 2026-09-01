# Cross-Review: test-engineer — PLAN (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.4, `sha256:64d8f1c5…`)
**Date:** 2026-08-31
**Iteration:** 7 (delta confirmation, erratum round 5)

## Overview

Scope of this round: the targeted erratum edit `e6f18c5a1..HEAD` on `PLAN-pdlc-stats.md`
(7 insertions, 2 deletions) and whether it resolves the routed item without breaking anything
previously approved — plus the standing `DEC-ERR-03` obligation to re-measure every upstream
claim this PLAN leans on against upstream's **current** bytes, whether or not it appears in the
routed list.

One item was routed to this round:

- T-10's premise "HEAD's `bin/cli.mjs` contains neither `statSync` nor `lstatSync` anywhere" was
  false at HEAD (`lstatSync` at the `fileSize` call site, a bare `statSync` in the doc comment
  above it), so the whole-file zero-match assertion needed its falsifiability restated on the
  matcher's own anchors — or comment/string masking stated normatively.

**Resolved.** The row no longer rests on the expired baseline property. It records the token's two
present occurrences at HEAD, then grounds the zero-match result on the matcher's two anchors:
`(?<![A-Za-z])` rejects the `lstatSync` call site, `\s*\(` rejects the comment occurrence, which is
not a call. The raw `:262` line anchor — a `DEC-DOC-01` misuse in its own right, and off by five at
HEAD — is gone. See §Verification for the re-measurement.

A second edit landed alongside it, not from the routed list: the `Status` column is declared a
planning-time ledger, explicitly not maintained during implementation, with the branch's
`feat(pdlc-stats): T-NN` commits named as the authoritative record. I checked it for collateral
damage rather than re-litigating it — see §Dependencies.

Two findings, both non-gating: one Medium (inherited, nonlocal) and one Low (delta, local).
No open High, so the confirmation approves.

## Batches

The edit touches exactly one row, `T-10`, and the section preamble above the task table. Nothing
else in §Batches moved, so the batch DAG, the `[Fake first]` ordering, the red-before-green
predecessors and the same-new-file authoring guard are all untouched and stay as approved at v6.
Re-derived nothing beyond confirming the diff is confined to prose inside T-10's `Task` cell: the
`Batch` (`2`), `Deps` (`T-01, T-02`), `Test File` and `Source File` cells are byte-identical.

**T-10's conjunct is unchanged, and that is the right call.** The assertion is still whole-file,
still carries no "in the `stats` seam" qualifier (the undelimited qualifier removed at v1.2 for
te F-02 has not crept back into the row), and still names the boundary-anchored matcher. What
changed is only the *justification*: from a baseline property of the file ("contains neither token
anywhere") to a property of the matcher itself. That is the stronger of the two groundings — a
baseline property expires the moment a task in this very PLAN edits the file, which is exactly what
T-17 did, whereas the anchors hold for any source that calls `lstatSync` and mentions `statSync` in
prose. The row now also says masking is not owed and says *why*, so an implementer reading it has a
decision rather than an unstated assumption.

**Falsifiability survives.** The conjunct can still go red for the reason it exists: a
`statSync(` call anywhere in the file's source matches both anchors. The one residual is a
false-**red** — prose writing `statSync(` with the paren inside a comment would match — which is
the safe direction for a guard oracle and is not worth an edit.

**The `Status` column declaration.** T-01, T-08 and T-16 carry `✅`; the row count matches the
"three `✅` ticks" the new paragraph claims. Nothing in this document derives a gate, a batch edge
or a Definition-of-Done checkbox from that column — I grepped §Definition of Done, §Batch gates and
§Verification for a `Status` dependency and there is none — so declaring it unmaintained removes an
authority claim without removing an obligation. Given T-02…T-20 have landed on this branch while
most rows still read `⬚`, the declaration makes the document honest rather than making it weaker.
