# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.12, commit `28dd256b`)
**Date:** 2026-08-20
**Iteration:** 3 (delta re-review over v1.11, commit `b3d877a1`)

## Delta Verification

**All four v2 findings are resolved, and the delta is clean where it lands.** The round is bounded:
`git diff --stat b3d877a1..HEAD` on the PLAN is **34 insertions, 13 deletions in one file** — no task
row, batch, wave, dependency edge or source-file cell moved beyond the four cells the findings named.
Every claim below was re-measured at HEAD rather than taken from the changelog.

| Check | Method | Result |
|---|---|---|
| Upstream bytes still match the lineage pins | `shasum -a 256` on all four upstream documents | 4/4 match (`f97f4f66…`, `d602c440…`, `1f6ea486…`, `dc7a8d65…`) |
| v2 `F-04` (TSPEC version label) | Lineage header vs TSPEC changelog head | Header now reads **TSPEC v1.15**; TSPEC line 12 `| pdlc | Draft | Claude | 1.15 |`, changelog head `**v1.15 (round 5 …)**` — **resolved** |
| v2 `F-01` (unowned production-path suite) | `comm -23` over TSPEC §5.1's file rows vs the PLAN's file-ownership manifest | **Empty** — the set difference that produced the High is now closed |
| v2 `F-01`, ownership cell | PLAN line 338 (`Test File` cell) and line 368 (manifest) | `pdlc/workflows/__tests__/advisoryWaveGateMain.test.js` present in both — **resolved** |
| v2 `F-02` (exact notice count) | A6-18 red step vs `advisoryEscalationLog.test.js:821` | Step names `toHaveLength(2)` → **`3`** with its reason — **resolved** |
| v2 `F-03` (un-skip overwrite notice owner) | A6-21 row + `AT-06-4` traceability row | A6-21 owns the push and its assertion; `AT-06-4` now names both arms and both owners — **resolved** |
| Manifest files exist at HEAD | 13 distinct `pdlc/workflows/__tests__/*.test.js` paths, `test -f` each | **13/13 exist** — the Overview's "thirteen … all thirteen of which exist at HEAD" is true as written |
| AT set-equality | `AT-\d\d-\d+[a-z]?` extracted from FSPEC and from the PLAN's AT table, `sort -u`, `comm` both ways | **48 = 48, set-equal in both directions**; `AT-06-4b` still present |
| Single writer per file per batch | Task table's file cells grouped by batch column | Holds: batch 1's only test-file overlap risk (`advisoryWaveGate.test.js` in A6-00 vs A6-05) does not exist — A6-05's list is the eight constant-surface suites, not that file |
| Task/wave graph unchanged | Diffed task, batch, wave and dependency rows | 11 tasks / 7 waves unchanged; A6-21 still depends on A6-18 (batch 7 after batch 6), so `renderSnapshotOverwriteNotice` exists before A6-21 pushes through it |

**The grounding of the two named oracles, checked in the code, not the document.**

- `pdlc/workflows/__tests__/advisoryWaveGateMain.test.js:373-378` is exactly the four-key
  `expect(result.haltAdvisory).toEqual({rootCause, diagnosis, repairApplied, repairPaths})` the
  finding described, and `result.haltReason` is asserted by `toContain` two lines above it — so the
  red step's "the containment assertion is deliberately not touched, that is AT-05-3's surviving
  oracle" is accurate about the file's actual shape, not just about §4.5.
- `pdlc/workflows/__tests__/advisoryEscalationLog.test.js:821` is `expect(failed.notices).toHaveLength(2)`,
  and it is the **only** whole-array notice count in the advisory suites that the fifth field
  disturbs. I swept for the sibling sites the same widening could redden: the other counts are either
  hand-built arrays in pure unit tests (`advisoryEscalationLog.test.js:497`) or `logs.filter(...)`
  subsets (`waveExecution.test.js:590`, `:749`, `:2648`), none of which sees the halt report's
  `notices`. The naming is complete, not merely representative.
- The shipped AT-05-4 fixture at `waveExecution.test.js:1250-1275` builds its `a6HaltFields` as a
  four-key literal and asserts `toEqual(a6HaltFields)` against the object the fake handed the loop —
  so it stays green through the widening, and A6-21's new arm correctly has to supply a non-`null`
  `snapshotRef` of its own to exercise the push at all. The PLAN says exactly that.


## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Process | **The single-writer walk grew a name but is still a containment check, not an enumeration over the owned set.** Batch-safety rule 2 (PLAN lines 405-414) says "Checked file by file", then enumerates only the files it believes have more than one writer, now including the sentence this round added (`advisoryWaveGateMain.test.js` and `advisoryEscalationLog.test.js` in batch 6 only). Six owned paths are never named there — `waveExecution.test.js`, `advisoryEnvelope.test.js`, `advisoryConfig.test.js`, `advisoryHarvest.test.js`, `consolidationProperties.test.js`, `documentOracles.test.js` — and neither is `helpers/advisoryDoubles.js` (rule 3 covers that one separately). I re-derived the (file, batch) pairs from the task table myself and the claim is **true at HEAD**, so this is not a correctness finding: it is that the walk's form cannot fail. This round is the second time in a row that a file entered the manifest and the walk had to be edited by hand to keep up (v1.11 the AT table, v1.12 this); the check that actually caught the v2 High was the mechanical `comm`, which the document has now promoted to a standing re-grounding step (v1.12 changelog). Fix, when this section is next touched: state rule 2 as a **set-equality over the manifest** — every owned path appears with its batch list, so an unenumerated file is a visible hole rather than a silent pass — the same discipline the AT table already carries. | `AC-6.3`, REQ-AWG-06 (batch safety is the mechanism that keeps A6-18's widening from reddening a sibling's suite) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The v2 round's Q-01 was answered in the strongest available form: the `comm` walk was run *before* the raised items were touched, it produced the round's own High, and it is now recorded as a standing step of the re-grounding protocol rather than a one-off. Is the same promotion warranted for the sibling check this round's `F-01` describes — the (file, batch) pair derivation — given that both the AT table and the manifest have now each cost a hand-edit to a prose walk that a two-line script would maintain? |
| Q-02 | Recorded for harvest, not as a finding, and now in its third consecutive round: this dispatch again supplied the **PLAN's** completeness headings (`Overview` / `Batches` / `Dependencies` / `Verification`) to a **cross-review** artifact, together with a skeleton-first pacing contract for a document type whose format is fixed by the reviewer SKILL. v1.9's changelog already records the dispatcher defect as routed to harvest (PM F-04 of that round); I mention it so the recurrence count is not lost, and I have written this file in the reviewer format regardless. |


## Questions

## Positive Observations

## Recommendation

## Verdict
