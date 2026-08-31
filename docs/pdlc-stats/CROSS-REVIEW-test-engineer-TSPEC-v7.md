# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.5)
**Date:** 2026-08-31
**Iteration:** 7 (erratum round 5 — delta confirmation)
**Prior round:** `CROSS-REVIEW-test-engineer-TSPEC-v6.md` (Approved, v1.4 @ `c61ed537c`)

## Overview

The dispatched erratum item was that §2.1 and §8/RK-1 still listed **five** in-repo co-change sites
while `DEC-STATS-01`'s `K-1` derived more, and that `K-7`'s two sibling-feature document edits
appeared in no site list.

**The item is landed, and it was landed correctly.** I verified this against the body rather than
against the changelog's assertion of it. §2.1's table carries ten in-repo rows — `prepack.mjs`,
`publish-preflight.mjs`, `fixture-machine.mjs`, `_tspec-packed-set.mjs`, `package.json`,
`loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`,
`learningsPremises.test.js`, `README.md` — and two further rows (§2.1:215, :216) name the sibling
edits explicitly: `docs/completed/pdlc-engine-distribution/` TSPEC §5.4 `PK-26` and that feature's
FSPEC §5.2 per-class count five → six, both tagged `K-7`-owned and both placed **outside** the ten.
§1, §6.4, §7.3 and RK-1 all carry `ten`. `DECISIONS-pdlc-stats.md` is itself now at ten (`:33`,
`:249`, `:294`), so the dispatch's own premise that `K-1` "derives nine" is the stale number here —
the TSPEC agrees with the current DECISIONS, not with the dispatch's summary of it.

The four wording corrections (§1's "including" → "and", RK-1's matching mis-scoping, §6.4's
"script-side" → "the four enumerations `assertAdditiveOnly` reads", §2.1's verbatim P-1 title) are
scoping and citation only. I diffed them: no oracle, type, signature, exit code or fixture changed.

**But landing the item is necessary, not sufficient.** Both upstream documents moved under this
TSPEC since v1.4 was approved, and one of those moves reversed a disposition the TSPEC's oracles
depend on. That is F-01, and it is why this confirmation does not approve.

## Architecture

No structural change. The edit is confined to the changelog block, §1's cost sentence, §2.1's table
and surrounding prose, §6.4's subset naming and §7.3/RK-1's opening clause. Module boundaries, the
seam design, the injected-parser bundle and the `lib/stats.mjs` / `cmdStats` split are byte-identical
to the v1.4 bytes I approved at round 6.

The one architectural claim worth re-checking is the scoping move in §1 and RK-1 — sibling-feature
document edits now sit *outside* the ten rather than being folded into it with "including". That is
the correct direction: the ten is the in-repo co-change set a PLAN task can be given and a CI check
can red on, whereas the two sibling rows are amendments to a frozen completed feature's documents
with no mechanical falsifier on the existence half. Collapsing them into one number would have
handed PLAN a set whose members are discharged by different mechanisms. The correction restores the
partition `DEC-STATS-01`'s `K-1`/`K-9`/`K-7` already encode.

## Interfaces

Unchanged and unaffected. `deriveRoundWindow`, `parseResolvedMarker`, `computeReviewRounds`, the
`StatsIo` injection surface (`listDir` / `readFile` / `stat`) and the renderer signatures over
`StatsReport` are untouched by the delta. I re-read §3.3's signatures against the diff to confirm no
incidental edit reached them; none did.

The `readFile` contract comment — "only ever called on `POSTMORTEM-*` files" — still holds against
REQ v1.6, which did not add a read of any other body. The read-only stance (REQ-STATS-08, G-4) is
also unmoved upstream.

## Data Model

The types in §5 are unchanged by the delta, so the question is whether they still match upstream
after REQ moved v1.4 → v1.6. On the largest REQ change, they do — and by luck rather than by
re-grounding.

REQ v1.6 **withdrew** REQ-STATS-05's harvested halt state and restored a measured `0`, recording the
conflation of "never halted" with "post-mortems deleted" as an accepted residual in R-6 rather than
mitigating it. Had the TSPEC modelled halts with a `MetricState`, that withdrawal would have
invalidated the type. It does not: §5 declares

```
halts: HaltEntry[];              // possibly empty — BR-13, no state needed
```

`HaltEntry[]` carries no `state` discriminator, and an empty array is exactly the measured `0` REQ
v1.6 now mandates. `MetricState` is applied only to `reviewRounds`, `dodRounds` and `byteRatio` —
the three metrics REQ-STATS-03/04/06 still attach a harvested state to. So the data model survives
the REQ v1.6 reversal intact, and NG-6's narrowed scope ("the two families harvest removes") is
satisfied rather than contradicted.

I checked the JSON key-set literals for the same reason: `["schemaVersion","reviewRounds","dodRounds","halts","byteRatio"]`
still matches REQ-STATS-02's "printed metric set plus one schema-version field", whose v1.6 rewording
was compression, not a set change. The five-key count in §6.2's table is still right.

This is worth stating explicitly because it is the near-miss: the TSPEC was not re-grounded this
round, and on this axis it happened not to need it. On the axis below, it did.

## Test Strategy

_TBD_

## Open Questions

_TBD_

## Recommendation

_TBD_

## Delta-Confirmation Findings

_TBD_

## Verdict

_TBD_
