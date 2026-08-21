# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md (v1.13, HEAD `c6b96b1b`)
**Date:** 2026-08-20
**Iteration:** 4 (delta re-review of v1.12 → v1.13)

## Scope

Delta re-review, not a re-read. At v3 I recommended **Needs revision** on one High (F-01, A6-18's
`advisoryWaveGateMain.test.js` widening prescribing `snapshotRef: null` on a fixture whose git double
makes the capture succeed) and one Low (F-02, the AT-06-4 DoD leg naming a paired negative for the
seam arm but not the un-skip arm). Round 13 landed four commits over the PLAN — `d143a1ab`
(Batches), `30b64d5c` (Verification), `2903af9c` (Dependencies), `c6b96b1b` (lineage and changelog).

I read my v3 file, diffed `28dd256b..HEAD` over the PLAN (**25 insertions, 6 deletions** across four
hunks — the cross-review header cell, the v1.13 changelog row, A6-18's task row, batch-safety rule 2,
and two DoD legs), and scanned only those surfaces plus the mechanical invariants the changelog
claims it did not move.

**The round is small and it is aimed exactly at the three raised items.** No task row other than
A6-18's changed; the `Batch` and `Dependencies` columns are byte-identical to `28dd256b`; the
file-ownership manifest is byte-identical. Both of my findings are closed, and closed at the value
level rather than by restating the outcome. I found no new High or Medium on the changed surface —
one Low, recorded below, about a variable the corrected clause names that does not exist in the file
it names.

**Upstream re-grounding first (DEC-ERR-03).** The changelog claims all four lineage digests
re-computed unchanged. I did not take that on the document's word: TSPEC §5.6's AT-02-1 row still
reads what my v3 Q-02 said it read (`TSPEC-pdlc-advisory-wave-gate.md:1910`), which is consistent
with an unchanged TSPEC, and no task row in this PLAN reads that row. It stays an upstream erratum,
re-routed below, not folded into this verdict.

## Batches

**One task row changed — A6-18's — and the change closes my v3 High at the value level.**

### F-01 (v3, High) is resolved, and I re-verified the corrected value from the fixture, not the prose

The row now reads: "**The fifth value on this fixture is the ref, not `null` (TE v3 F-01).**" It
gives the reasoning chain, the concrete value, and the anti-echo rule. I checked each link against
the file rather than the document.

- **The fixture drives a refusal, not a capture failure.** `proposedAction: "E-2"` at
  `pdlc/workflows/__tests__/advisoryWaveGateMain.test.js:358`, against the harness default
  `proposedAction = "E-5"` at `:49` — so this run is the deliberate out-of-envelope arm, exactly as
  the row now says.
- **The git double succeeds at every capture verb.** `advisoryWaveGateMain.test.js:109-137`:
  `add` → `{ok: true}` (`:111`), `rev-parse`/`write-tree`/`commit-tree` → `{ok: true, stdout:
  "abc1234…"}` (`:123`), and the fallthrough `return { ok: true, stdout: "" }` at `:137`, which is
  where `update-ref` lands. Per A6-10's green step and TSPEC §3.5 (`TSPEC:1207`) the capture returns
  `null` only on `ok !== true`, so it returns a ref here.
- **The wave number is 1, and the row cites the right oracle for it.** `:368`
  `expect(result.haltReason).toContain("Wave 1 test gate failed")` — an assertion the row explicitly
  leaves untouched as AT-05-3's surviving oracle. So the fifth key reads `refs/pdlc/a6-snapshot-1`,
  which is what the row now prescribes.
- **The four-key oracle it widens is still verbatim where the row says it is.** `:373-378`,
  `expect(result.haltAdvisory).toEqual({rootCause, diagnosis, repairApplied, repairPaths})`.

The row keeps the anti-echo rule on the corrected value ("write that value as the spec-side literal
… never as a constant read back from the module under test"), which is the discipline that matters
most here: a hand-written `snapshotRef` expectation is precisely where an implementation echo is
tempting. That is the right instinct and it is stated in the right place.

### The consequence clause is correct, and I swept the suite for collateral rather than trusting it

The row now carries: "a non-`null` ref makes BR-14's overwrite notice **due** on this halt report
too … and that costs this suite nothing — every notice oracle in it is a *filtered* count over
`inapplicabilityStatements(logs)` … never a whole-array `toHaveLength`." I re-ran the sweep over the
whole file. Every notice-shaped oracle is filtered through the local helper defined at
`advisoryWaveGateMain.test.js:182`: `:210`, `:227`, `:246`, `:247`, `:257`, `:273`, `:285`, `:297` —
the two `toEqual` forms (`:246`, `:273`, `:297`) are equally filtered, so an extra element passes
through them as well. The only unfiltered `toHaveLength` calls in the file count *dispatches*, not
notices (`:226`, `:335`), and both shape oracles beside the halt (`:339`, `:380`) are
`toMatchObject` over `a6Row`'s three counters. No collateral red — the claim holds under a
whole-file sweep, not just the sites the row names.

### One Low: the anti-echo literal names a variable that is not in that file's scope

The corrected clause tells the implementer to write the value "spec-side as
`"refs/pdlc/a6-snapshot-" + waveNum`". In `advisoryWaveGateMain.test.js` there is no `waveNum`
binding — `grep -n waveNum` over the file returns nothing; the wave number lives only inside the
`haltReason` string literal at `:368`. The intent is unambiguous (compose the ref test-side, do not
import a module constant) and the row also states the concrete value `refs/pdlc/a6-snapshot-1`, so
an implementer cannot get the *value* wrong — but they will have to invent the binding, and the
clause reads as though it were transcribing an existing one. That is F-01 below, Low: say
`"refs/pdlc/a6-snapshot-" + 1` or "a wave-number local the test introduces", and the clause matches
the file it is about. The identical phrasing is correct where it originated — AT-06-4's seam arm on
§5.2's two-red-wave fixture, which genuinely distinguishes waves 1 and 2 — so this is a
transplant nit, not a design gap.

### Nothing else in the row moved, and the invariants re-derive clean

The rest of A6-18 is byte-identical: the capture-failure fixture keeps `snapshotRef: null` (a
*different* fixture, in `advisoryWaveGate.test.js`, where the double genuinely fails a verb — no
contradiction with the corrected clause), the escalation-log literal keeps its `3` with the
real-temp-repo reason, AT-06-4b keeps its whole-array negative, and the un-skip ownership split with
A6-21 is untouched.

Re-derived from the shipped parser at HEAD (`parsePlanTasks` → `computeWaves` →
`validatePlanContract`, `pdlc/workflows/orchestrate-dev.js`): **11 tasks, 7 waves**
(`A6-00+A6-01+A6-04+A6-05 | A6-06+A6-08 | A6-10 | A6-12 | A6-14 | A6-18 | A6-21`), every `planBatch`
equal to `max(dep batch) + 1`, ids unique, every dependency resolving, graph acyclic, and
`validatePlanContract(tasks, ownership)` returns **`{"ok": true}`**. TDD order unchanged — every
task keeps its red steps ahead of its green step and A6-01 keeps `[Fake first]` in batch 1. This
round adds no new file, so there is no same-batch same-new-file collision to check.

**Every file the task table and manifest name exists at HEAD.** I stat'd all eighteen distinct
paths — the sixteen `pdlc/` sources and test files, `.gitignore`, and
`.claude/pdlc.config.example.json` — all present.

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
