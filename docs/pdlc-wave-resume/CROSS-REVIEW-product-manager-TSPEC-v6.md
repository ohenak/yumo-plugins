# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (v1.3)
**Date:** 2026-08-21
**Iteration:** 6 (delta confirmation, erratum round 4 — Phase P)
**Scope:** Delta confirmation. Previously approved at v5; re-confirming the erratum edit against upstream REQ v1.7 / FSPEC v1.2 at HEAD (DEC-ERR-03).

## Scope

This is a **delta confirmation**, not a fresh review. I approved this TSPEC at round v5. One
targeted erratum edit has since landed (`91f93b8e`, `6ac1df9f`, `5d5bbd75`, diffed against the
last bytes I approved at `b4a628b8`), addressing two routed items that say the same thing from
two lenses:

| Routed item | Raised by | Landed? |
|---|---|---|
| §5.8 assigns the 85% per-file branch floor to "the last implementation wave's `postWaveCommand`", which is not expressible — V-13 closes the config surface at four keys with a single *global* `postWaveCommand`. Re-specify as a last-**task** obligation, as PLAN RK-2 does. | pm-review (me) | **Yes** |
| §5.8 / RT-7 make the same assignment; the floor belongs to a task, as PLAN RK-2 / §3.4 assign it. | te-review | **Yes** |

The edit is nine insertions over four lines and touches exactly three places: the version cell
(1.2 → 1.3), a new revision-history row, the §5.8 sentence, and the RT-7 mitigation cell in §6.4.
Nothing else in the 944-line document moved (`git diff b4a628b8..HEAD --stat` → `9 +, 4 -`).

**Beyond the item list (DEC-ERR-03).** The items landing is necessary, not sufficient. I re-read
the upstream this TSPEC leans on at the versions named in this dispatch and confirmed both
hashes match the tree byte-for-byte:

- REQ v1.7 — `sha256:17e83bfc…8c79f` ✓ matches dispatch
- FSPEC v1.2 — `sha256:9a6be7b5…56f` ✓ matches dispatch

Both upstream documents have themselves taken erratum edits since this TSPEC's §6 was written
(`05901a9c`, `2290c121`, `8b818309`). Three of the TSPEC's own upstream-facing claims no longer
match what upstream says. Those are the findings below — all **inherited**, all **non-gating**.

## Design

_pending_

## Interfaces

_pending_

## Data Model

_pending_

## Verification

_pending_

## Risks

_pending_

## Delta-Confirmation Findings

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
