# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md (v1.11, HEAD `b3d877a1`)
**Date:** 2026-08-20
**Iteration:** 2 (delta re-review of v1.10 → v1.11)

## Scope

Delta re-review, not a re-read. I approved v1.10 as a delta confirmation with one Medium (F-01) and
three Low (F-02, F-03, F-04) findings. Round 11 landed four commits over the PLAN — `e9a8943e`
(Batches), `f3a06478` (Dependencies), `c5afb4d0` (Verification), `b3d877a1` (lineage header and
changelog). I read my v1 file, diffed `1972402c..HEAD` over the PLAN (36 hunks, all confined to the
Overview lineage block, four task-description cells, the Dependencies closure paragraph and the AT
table / DoD legs), and scanned only those surfaces plus the mechanical invariants the round claims it
did not move.

**Upstream re-grounding first (DEC-ERR-03).** All four hashes the new lineage header pins were
re-computed locally rather than taken from the document: REQ `sha256:f97f4f66…`, FSPEC
`sha256:d602c440…`, TSPEC `sha256:1f6ea486…`, DECISIONS `sha256:dc7a8d65…` — all four match the
header byte for byte. So the round's grounding claim is measured, not asserted.

## Batches

**All four of my v1 findings are resolved in A6-10's row (line 329), on upstream's own words.**

- *F-01 (Medium — positive-presence conjunct).* The row now says outright that "**the oracle that
  falsifies that implementation is a positive-presence conjunct, not the hash map**", explains why
  (the map's domain excludes ignored paths on both sides, so a restore that deleted one leaves the
  maps equal), and asserts on the same run that "a `.gitignore`d file the wave added is **still
  present** after restore — TSPEC §5.2 case 4, the assertion that pins `git clean -fd` over `-fdx`",
  paired with case 3's untracked-but-non-ignored file asserted **absent**. That pairing is what
  discriminates the ignore boundary from a blanket keep or a blanket delete — exactly the shape the
  finding asked for. Transcription verified against TSPEC §5.2 cases 3 and 4
  (`TSPEC-pdlc-advisory-wave-gate.md`, the `an untracked file the wave added is absent after restore`
  and `a .gitignore'd file the wave added is still present after restore` bullets): faithful.
- *F-02 (Low — ordering conjunct).* The row now carries "**The case asserts the *ordering*, not only
  the content**", naming AC-6.1's record append, AC-6.2's escalation-log append and AC-5.2's
  queue-row write (M-WG-7) as separately asserted to happen *afterwards*, "so an implementation that
  interleaved them fails here rather than passing on a map that happens to match". That is TSPEC
  §5.2 case 5's second half verbatim in substance. Resolved.
- *F-03 (Low — missing `non-ignored` qualifier).* The row's first clause now reads "over tracked
  files and **non-ignored** untracked files alike, generated outputs included — BR-9 v1.6's decided
  domain", so it no longer disagrees with its own later sentence or with the AT-05-1 traceability
  row (line 529). Resolved.

**New material in this round, scanned on its own merits.** Three task-description cells changed
besides A6-10, all in the direction of stronger oracles:

- **A6-05** moves `ADVISORY_ROOT_CAUSES` from set equality to **ordered-sequence** equality against
  the transcribed literal `["plan-ordering-defect", "wave-internal-defect", "environmental",
  "unclassified"]`. I checked the literal against TSPEC §3.1's `export const ADVISORY_ROOT_CAUSES =
  Object.freeze([...])` block — identical, in that order — and the *reason* against FSPEC BR-2
  ("Its oracle is therefore ordered-sequence equality over class ids, never set equality: a
  reordering silently changes which class a two-way failure receives"). The caption is now split by
  surface (`ADVISORY_ROOT_CAUSES` per BR-2, `ADVISORY_REFUSAL_REASONS` per BR-15,
  `ADVISORY_EXCLUSIONS` per BR-5 ordered; the rest set-equal; `toContain` forbidden on all of them).
  The refusal-reason claim "eight members, unchanged — capture failure adds no ninth" checks out
  against the shipped `export const ADVISORY_REFUSAL_REASONS = Object.freeze([...])` in
  `pdlc/workflows/orchestrate-dev.js`: eight members, in FSPEC BR-15's transcribed order.
- **A6-08** adds AT-02-1's second arm (`E-08b`) to the `parseA6RootCause` step: a gate output
  matching class 1 *and* class 2 is classed `plan-ordering-defect` and carries **exactly one** class.
  This is the change that matters most from my lens — it is what gives the ordered oracle a
  behavioural consequence, and the row says so ("without it A6-05's ordered-sequence oracle has no
  behavioural consequence anywhere in the suite"). The exactly-one-class conjunct is a positive
  assertion, not an absence-only "never both".
- **A6-18** takes BR-14 / AC-6.3's overwrite warning. Two properties I looked for and found: (1)
  conjunct (3)'s oracle is **co-location within one `notices` element** — "pick the single `notices`
  element matching the ref pattern and assert the overwrite predicate on that same element, because
  two independent `toContain` assertions over separate strings cannot falsify a split"; (2) an
  explicit **anti-echo rule** — both halves matched by spec-side literals written in the test
  (`toMatch(/overwrit/i)`, `toContain("refs/pdlc/a6-snapshot-" + waveNum)`), "never by a warning
  constant imported from the module under test". And AT-06-4b is not an absence-only oracle: the
  negative arm carries the diagnosis and the root-cause class as positives on the same run, with the
  absence quantified over the whole `notices` array "so a notice pushed elsewhere cannot hide".
  Together AT-06-4 / AT-06-4b are a falsifiable pair — an unconditional emitter passes the first and
  fails the second.

**Mechanical invariants re-derived, not trusted.** The changelog claims no task row, batch, wave,
dependency edge or file-ownership cell moved. I checked it two ways. First, column-wise: extracting
the id / test-file / source-file / batch / dependency cells from `1972402c` and from HEAD gives
byte-identical output — only description cells changed. Second, by re-running the shipped parser,
importing `pdlc/workflows/orchestrate-dev.js` at HEAD: `parsePlanTasks` returns 11 tasks,
`computeWaves` returns 7 waves (`A6-00+A6-01+A6-04+A6-05 | A6-06+A6-08 | A6-10 | A6-12 | A6-14 |
A6-18 | A6-21`), and every `planBatch` equals `max(dep batch) + 1` (A6-00/01/04/05 → 1, A6-06/A6-08
→ 2, A6-10 → 3, A6-12 → 4, A6-14 → 5, A6-18 → 6, A6-21 → 7), ids unique, every dependency resolves,
graph acyclic. No same-batch same-new-file collision: batch 1's four tasks own four disjoint files,
batch 2's two split `.claude/pdlc.config.example.json` (A6-06) and `advisoryWaveGate.test.js`
(A6-08), and this round introduces no new file at all. TDD order is unchanged — every merged task
keeps its named red steps ahead of its green step in one task, and A6-01 keeps its `[Fake first]`
label in batch 1 ahead of every production task.

**Every file the task table names exists at HEAD.** I stat'd all seventeen: the twelve workflow
suites (`advisoryWaveGate`, `advisoryEnvelope`, `advisoryConfig`, `advisoryDriver`, `advisoryRecord`,
`advisoryHarvest`, `consolidationProperties`, `advisoryDisabled`, `advisoryQueueSeams`,
`advisoryEscalationLog`, `waveExecution`, `documentOracles` — all under
`pdlc/workflows/__tests__/`), `pdlc/workflows/__tests__/helpers/advisoryDoubles.js`,
`pdlc/engine/__tests__/advisory-config-example.test.js`, `.gitignore`,
`.claude/pdlc.config.example.json` and `pdlc/workflows/orchestrate-dev.js`. No task names a file it
does not either own or declare pre-existing, and no row promises a file that is not there.

## Dependencies

## Verification

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
