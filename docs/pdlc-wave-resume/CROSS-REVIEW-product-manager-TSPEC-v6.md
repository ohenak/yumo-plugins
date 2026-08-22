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

**The re-assignment is correct and it is the assignment PLAN already carries.** The product
question I have to answer is not "is a task better than a config key" — that is an engineering
call — but "does the floor still bind, at the same threshold, at a point where the product is
protected?" It does, and more tightly than before:

| Property | v1.2 (as I approved it) | v1.3 (after the erratum) |
|---|---|---|
| Threshold | 85% per-file branch | 85% per-file branch — **unchanged** |
| Where it binds | "last implementation wave's `postWaveCommand`" | last implementation **task**, PLAN T-10 |
| Phase it closes in | Phase I | Phase I — **unchanged** |
| Backstop if too slow | §5.3 per-arm unit coverage + §5.7 generative suite; degrades to a PUB-time finding | identical wording, now conditioned on "T-10's run" |
| RT-7 risk statement | unchanged | unchanged |

The risk RT-7 exists to retire — "new branches green through Phase I, red at Phase PUB, after
Phase DOD" — is retired by the new wording exactly as it was by the old, because the closing
point is the same: inside Phase I, before DOD. No acceptance criterion moved, no threshold was
softened, and the backstop clause survives verbatim. This is a **fidelity correction, not a
scope change**, and the revision-history row says so in those words ("The floor itself, its
threshold and its backstop are unchanged").

**It now agrees with the downstream document that owns the obligation.** PLAN `§3.4` carries the
row `| Coverage floor | **T-10**, not `postWaveCommand` |`, and PLAN RK-2 records the same
reasoning and flags the divergence as the erratum this round is discharging. Before this edit,
TSPEC §5.8 and PLAN §3.4 disagreed about who owns the floor; a downstream implementer reading
both would have had to pick one. They now say the same thing, and TSPEC names T-10 and RK-2
explicitly so the trace is followable in one hop. That is the outcome I asked for.

**No product decision was taken in an engineering artifact.** The edit reassigns a mechanism, not
a requirement. Neither REQ v1.7 nor FSPEC v1.2 mentions coverage at all (`grep -c 'coverage'`
over both → 0), so the floor was never an upstream acceptance criterion this TSPEC could narrow
or drop — it is a project test-depth standard the TSPEC volunteers and PLAN executes. Nothing in
the delta touches a `REQ-WVR-*` outcome, a `BR-*`, an `EC-*`, or an `AT-*`.

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
