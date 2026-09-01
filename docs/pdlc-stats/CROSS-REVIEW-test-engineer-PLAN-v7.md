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

## Dependencies

Upstream re-grounded against current bytes before reading the delta, per `DEC-ERR-03`. Measured at
HEAD:

| Upstream | HEAD `sha256` | Dispatch pin | Verdict |
|---|---|---|---|
| REQ | `f75c348f…` | `f75c348f…` | same bytes |
| FSPEC | `a493133f…` | (unpinned) | v1.8, matches the PLAN's own re-grounding note |
| TSPEC | `f32d9cb5…` | (unpinned) | v1.8 |
| DECISIONS | `ca3f7219…` | (unpinned) | unmoved |

TSPEC moved v1.7 → v1.8 since the round-4 revision. I diffed `bf496d9aa..HEAD` over
`TSPEC-pdlc-stats.md`: the move is confined to the changelog, §4.3's contested paragraph, BR-16's
version pin and §8.3. **None of the sections T-10 leans on moved** — §2.4 (`lstat`, not `stat`),
§2.5 (the parser bundle and its wiring oracle) and §6.4's seven-oracle table are byte-identical
across the move, so the delta's justification is measured against live upstream text.

Two second-order checks on the move, because the PLAN carries claims about it:

- **§8.3's count word.** TSPEC §8.3 at HEAD opens "**One remains open** — BR-26/EC-10's
  unclassified predicate". The PLAN's residual-risk row calls BR-26/EC-10 "the **only** erratum
  TSPEC §8.3 still carries open" and its companion row marks the REQ-STATS-06-versus-BR-16
  disagreement discharged, sourced to "§8.3 (second bullet at TSPEC v1.7, removed at v1.8)". Both
  agree with upstream's current bytes, including the version at which the bullet went away.
- **T-04's AT-17 fourth leg.** TSPEC §4.3 now states the settled BR-16 reading — an unrecognised
  basename contributes no process bytes and counts as no file of its family remaining. T-04 names
  that leg, records it discharged at REQ v1.7 / absorbed at FSPEC v1.8 in BR-16's favour, and says
  no expected value moves. Faithful; no re-stamp owed and none claimed.

The `lstat`-not-`stat` conjunct's own upstream anchor, TSPEC §3.1's
`fileSize(absPath: string): number; // lstat().size — never follows a link (§2.4)`, is present at
HEAD verbatim, so T-10's parenthetical citation still resolves.

No ordering edge, integration point or prior-phase baseline in §Dependencies was touched by the
delta.
