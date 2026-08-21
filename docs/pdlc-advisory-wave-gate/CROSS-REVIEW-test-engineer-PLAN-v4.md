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

**One subsection changed — batch-safety rule 2 — and the change is a completeness upgrade, not an
ordering change.** Rule 2's file-by-file walk is now declared as a projection of the file-ownership
manifest to `(file, batch)` pairs, with the previously unenumerated single-owner paths named
explicitly (PLAN lines 405–425). The stated property is the right one for this class of defect: "a
path added to the manifest without a clause is a visible hole, not a silent pass" — that is
set-equality over the enumeration rather than containment, and it is exactly the discipline I ask
of AT tables and row catalogues. A walk that samples cannot fail when the manifest grows; this one
can.

**I checked the claim by doing the projection myself rather than reading the list.** Projecting the
manifest (PLAN lines 359–370) to distinct paths gives fifteen, and every one is now accounted for in
rule 2:

- multi-batch, enumerated in the original walk: `orchestrate-dev.js` (batches 1–7, once each),
  `advisoryWaveGate.test.js` (1, 2, 3, 5, 6), `advisoryDriver.test.js` (1, 4),
  `advisoryRecord.test.js` (1, 6), `advisoryDisabled.test.js` (1, 7);
- batch-6-only: `advisoryWaveGateMain.test.js`, `advisoryEscalationLog.test.js`;
- batch-1-only: `advisoryQueueSeams.test.js`;
- newly named this round: `advisoryEnvelope.test.js`, `advisoryConfig.test.js`,
  `advisoryHarvest.test.js`, `consolidationProperties.test.js` (A6-05, batch 1),
  `documentOracles.test.js` and `.gitignore` (A6-00, batch 1),
  `pdlc/engine/__tests__/advisory-config-example.test.js` (A6-04, batch 1),
  `.claude/pdlc.config.example.json` (A6-06, batch 2), `waveExecution.test.js` (A6-21, batch 7),
  `helpers/advisoryDoubles.js` (A6-01, batch 1, under rule 3).

Fifteen listed, fifteen owned, empty difference in both directions. **No file has two writers in one
batch**, in either the source or the test column — I re-derived that from the manifest's
`(task, file)` pairs joined to the `Batch` column, not from the narration. The one sentence I would
have flagged had it been missing is present: "That accounts for every path in the manifest."

**The edges themselves are untouched.** `git diff 28dd256b..HEAD` shows no change to any task row's
`Batch` or `Dependencies` cell, and the re-derivation in **Batches** above confirms the DAG
independently. So the ordering story I approved at v1.11 and re-confirmed at v1.12 stands unchanged:
A6-04 → A6-06 for the example-config edit, A6-00 + A6-05 → A6-08 for the helpers, and the linear
A6-08 → A6-10 → A6-12 → A6-14 → A6-18 → A6-21 spine that keeps every wave boundary green under a
script-owned gate with no expected-red channel.

**The A6-18 → A6-21 edge still carries the weight my v3 pass put on it.** AT-06-4's two arms land in
two batches — seam arm in 6, un-skip arm in 7 — and that is only sound because A6-21's production
push at the un-skip halt site reads a `snapshotRef` field A6-18's green step introduces one batch
earlier. The edge is declared (`A6-21 | … | 7 | A6-18`) and the file columns do not cross: A6-21's
`waveExecution.test.js` is written by nobody in batch 6, and A6-18's four test files by nobody in
batch 7. This round's correction to A6-18's *value* does not disturb that — if anything it
strengthens it, since the un-skip arm's non-`null` ref and the main suite's non-`null` ref now tell
the same story about when the capture succeeds.

**No upstream dependency of this plan is open.** The subsection's wording is unchanged this round
and the evidence behind it is unchanged: OQ-7 remains closed-answered-no, DEC-A6-01's scoped
ignored-path arm remains explicitly not built. The one upstream defect I still see is TSPEC §5.6's
stale AT-02-1 row (`TSPEC-pdlc-advisory-wave-gate.md:1910`), which no task row here reads; it is
re-routed as an erratum below rather than folded into this verdict.

## Verification

**Two DoD legs changed; both of my v3 findings close here, and both close as falsifiable
conditions rather than as restated outcomes.**

### F-02 (v3, Low) is resolved — the un-skip arm now carries its paired negative

The AT-06-4 leg previously named two arms and two owners but named a negative only for the seam
side, so a verifier could have ticked it on a positive-only un-skip arm. It now reads "**each with
its paired negative** (TE v3 F-02): AT-06-4b on the seam side, and on the un-skip side a halt on a
wave where A6 did **not** fire — `a6.calls.length === 0` and the outcome and `haltReason` positively
asserted on the same run — where the `advisory` argument is omitted and no overwrite notice appears
anywhere in `notices`", and it closes with the falsifying sentence: "A positive-only un-skip arm does
not tick this leg: without the negative, an implementation pushing the notice unconditionally at the
un-skip site satisfies it."

That is the shape I asked for, and it is not an absence-only oracle. The negative ("no overwrite
notice anywhere in `notices`", "`advisory` argument omitted") is quantified over a run whose live
behaviour is positively pinned on the same pass — outcome, `haltReason`, and `a6.calls.length === 0`
— which matches the shipped companion this arm attaches to (`waveExecution.test.js:1299-1302`:
`outcome === "halted"`, `haltReason` containing `"Error: Wave 1 un-skip guard failed"`,
`a6.calls.length === 0`). Absence plus three positives on the same run: falsifiable in both
directions. The leg now says the same thing A6-21's task row says, so verifier and implementer read
one contract — the same convergence my v1.12 F-01 asked for on the A6-10 leg.

### The widening leg now carries the corrected value, so the two channels agree

The leg's main-suite half was value-agnostic at v1.12 ("reads **five** keys"), which is why my v3
High landed on the task row and not on this leg. It now reads: "five keys whose fifth is the
wave-scoped **ref** — that fixture's `_git` double succeeds at every capture verb, so the value is
`refs/pdlc/a6-snapshot-1`, written spec-side as `"refs/pdlc/a6-snapshot-" + waveNum` and never
`null` (TE v3 F-01)". It keeps `haltReason`'s containment assertion explicitly untouched (AT-05-3)
and keeps the escalation-log half at **3** with its real-temp-repo reason. Both halves are conditions
a verifier can fail on, and the value a verifier checks is now the value the implementer was told to
write — which is the property that was broken at v1.12. (F-01 below, the `waveNum` binding nit,
applies to this leg's phrasing as well as the task row's; it is the same transplanted literal in
both places and one edit fixes both.)

### The AT set is still set-equal to FSPEC §6's, and this round did not disturb it

I re-derived the comparison rather than counting: extracting AT ids from the PLAN's traceability
table and from FSPEC §6 and diffing the two sorted sets gives **48 vs 48 with an empty diff** —
equal in both directions, so a deleted case fails and an invented one fails too. This round mints no
witness id, which is right: TSPEC §5.6 says AT-06-4's predicates cover the un-skip arm "rather than
minting a witness id", and adding the arm's *negative* to the DoD leg is a strengthening of an
existing id's oracle, not a new case. The traceability table itself is byte-identical to
`28dd256b`.

### Anti-echo, absence-only and set-equality discipline across the changed Verification surface

- **No implementation echoes.** Both changed legs push spec-side literals: `/overwrit/i` and
  `"refs/pdlc/a6-snapshot-" + waveNum` for the overwrite predicates, `refs/pdlc/a6-snapshot-1` as
  the transcribed fifth value, `3` as the transcribed notice count. Neither leg permits a constant
  read back from the module under test, and the widening leg says so in as many words.
- **No absence-only oracles.** Every negative introduced or restated this round is paired with a
  positive on the same run: AT-06-4b (diagnosis and root-cause class present, no ref and no
  overwrite sentence anywhere in `notices`); the un-skip negative (outcome, `haltReason` and
  `a6.calls.length === 0` positive, `advisory` omitted and no notice); the widening leg's "never
  `null`" is itself stated as a positive value, not as a prohibition.
- **Completeness by set-equality, not containment.** Rule 2's manifest projection (see
  **Dependencies**), the 48-AT diff, A6-18's `A6_PROHIBITIONS` id-set comparison and its five-field
  set-equal transcription of §4.5's halt fields all compare full enumerations. The one place this
  round could have regressed — widening a `toEqual` to five keys — stays a `toEqual`, not a
  `toMatchObject`, so a dropped key still fails.

**The unchanged legs are unchanged.** The forty-eight-AT leg, the ordered-vocabulary leg, the A6-10
ignored-path leg (whose two falsifying conjuncts my v1.12 F-01 put there) and the commands block are
byte-identical to `28dd256b`; I did not re-litigate them.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
