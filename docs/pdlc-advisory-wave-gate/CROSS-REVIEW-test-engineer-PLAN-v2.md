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

*F-04 (Low — the no-open-dependency claim overreached its evidence) is resolved, and resolved the
right way: by measurement rather than by softening.* The subsection now reads "**No upstream
dependency of this plan is open — checked across all four upstream documents at HEAD, not three**",
and it *records the overreach* instead of erasing it: "The v1.10 round asserted this while DECISIONS
still sat at `sha256:84deee10…`, where DEC-A6-01's option-D row … were still routing the ignored-path
boundary as 'upstream's open question (TSPEC §6 OQ-7)' … so the claim overreached its evidence when
it was made (TE v1 F-04)."

I re-grounded the new claim against DECISIONS at HEAD rather than accepting the account. The option-D
row now reads "OQ-7 is **closed, answered no** at TSPEC v1.11; FSPEC BR-9 v1.6 and REQ AC-5.1 put
ignored paths outside the map in both directions, so mechanism and oracle agree by decision rather
than by coincidence", and the consequences section states the scoped ignored-path arm "is explicitly
**not built**", with a *reversal* of BR-9's exclusion as the only re-evaluation trigger that would
grow it. The PLAN's summary of both is faithful, and its closing sentence — "No task in this plan
reads that arm, and none needs to" — is true against the task table: no task row mentions a scoped
capture arm.

The dependency edges themselves are untouched this round (see the column-wise diff in **Batches**),
so the ordering story I approved at v1.10 stands: A6-04 → A6-06 for the example-config edit, A6-00 +
A6-05 → A6-08 for the helpers, and the linear A6-08 → A6-10 → A6-12 → A6-14 → A6-18 → A6-21 spine
that keeps every wave boundary green under a script-owned gate with no expected-red channel.

## Verification

**The AT table's set-equality claim is now true at forty-eight, and I checked it mechanically rather
than by count.** The caption changed from "Forty-seven ATs in FSPEC §6, forty-seven rows here" to
"**Forty-eight** ATs in FSPEC §6 at v1.7, forty-eight rows here — the forty-eighth is `AT-06-4b`".
Extracting the AT ids from the PLAN's traceability table and from FSPEC and diffing the two sorted
sets gives **48 vs 48 with an empty diff** — set-equal in both directions, so a deleted case fails
and an invented one fails too. This is the completeness-by-set-equality shape, not containment.

Three traceability rows gained oracle detail, all verified against TSPEC §5.6:

- **AT-02-1** now names both halves and both owning steps ("A6-02, A6-07" red → "A6-05, A6-08"
  green), with the vocabulary's ordered-sequence oracle in `advisoryEnvelope.test.js` and E-08b's
  two-class arm in `advisoryWaveGate.test.js`. Correct: the ordering oracle and the arm that makes it
  load-bearing now have named, distinct homes.
- **AT-06-4** names the two-red-wave fixture, all three AC-6.3 conjuncts on one run, co-location
  within one `notices` element and the anti-echo rule — a compressed but accurate transcription of
  TSPEC §5.6's AT-06-4 row.
- **AT-06-4b** names the E-34 capture-failure fixture (`snapshotRef: null`) and its positive/negative
  split. TSPEC §5.6 puts AT-06-4b on that same fixture ("this fixture is where AT-06-4b itself
  lives"), so the home assignment agrees with the spec.

**Three DoD legs changed and all three are falsifiable as written**: the forty-eight-AT set-equality
leg ("checked both directions"); a new leg requiring `ADVISORY_ROOT_CAUSES`, `ADVISORY_REFUSAL_REASONS`
and `ADVISORY_EXCLUSIONS` to be asserted by ordered-sequence equality, "never set equality or
`toContain`", **and** E-08b's arm to be present, with the reason stated ("without it the root-cause
order has no behavioural consequence in the suite"); and a new leg pinning AT-06-4's co-location plus
spec-side literals plus AT-06-4b's absence arm. Each names a condition a verifier can fail on.

One gap remains, and it is the one place this round's improvement did not reach the DoD (F-01 below):
the A6-10 leg still reads "the ignored-path case is asserted live (no `test.todo`) and fails an
implementation that restores an ignored path" — the *outcome*, without naming the conjunct that
delivers it. That was the exact confusion my v1 F-01 flagged in the task row, and the row was fixed
while the leg was not. Low, because the task row is now unambiguous and the implementer reads that
row; but the DoD verifier reads this leg, and could tick it from a hash-map assertion alone.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | The DoD leg for A6-10 states the ignored-path *outcome* ("fails an implementation that restores an ignored path") without naming the conjunct that delivers it — TSPEC §5.2 case 4's positive-presence assertion (`.gitignore`d file **still present** after restore, pinning `clean -fd` over `-fdx`), paired with case 3's absent untracked file — nor case 5's ordering assertion. The task row (line 329) now names both; the leg a DoD verifier reads does not, so the leg can be ticked from a hash-map assertion that structurally cannot falsify the implementation it claims to reject. Restate the leg on the two conjuncts, the way the sibling AT-06-4 and ordered-vocabulary legs name theirs. Same wording gap in the AT-05-1 traceability row (line 529), which reads "ignored-path case live (OQ-7 closed), restoring one fails". | Verification → DoD, A6-10 leg |

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC §5.6's AT-02-1 row still reads "`ADVISORY_ROOT_CAUSES` set-equal to the four-member literal", which contradicts FSPEC v1.7 BR-2/AT-02-1 ("ordered-sequence equality over class ids, never set equality"), TSPEC's own §3.5 ("`ADVISORY_ROOT_CAUSES` is ordered and closed, and the order is the first-match rule") and this PLAN's A6-05 row. The PLAN follows FSPEC and is right to; the stale row is upstream's, and I have routed it as an erratum rather than folding it into this verdict. Confirming: is there any reading on which §5.6's row is deliberate rather than residue from before the ordered oracle landed? |

## Positive Observations

- **Every one of my four v1 findings is closed on upstream's own words, not on paraphrase.** I spot
  checked each transcription against TSPEC §5.2's five round-trip cases, FSPEC BR-2/BR-5/BR-9/BR-15
  and TSPEC §3.1's frozen literal; all match. Nothing was closed by softening the claim.
- **F-04 was closed by measurement and the overreach was recorded rather than erased.** The
  Dependencies subsection says plainly that the earlier claim outran its evidence at the reviewed
  hash, then re-states it on the four hashes it actually checked. That is the honest form, and it
  leaves the trail a later reader needs.
- **The round's strongest test-side move is A6-08's E-08b arm.** An ordered-sequence oracle with no
  behavioural consequence is a coverage ornament; the two-class arm — classed `plan-ordering-defect`,
  carrying **exactly one** class — is what makes a reordering change an observable outcome. Naming it
  in the row *and* in the DoD leg means it cannot quietly drop out.
- **The AT-06-4 / AT-06-4b pair is built as a falsifiable pair, not two independent assertions.**
  Co-location within one `notices` element (rather than two `toContain`s that a split would pass),
  spec-side literals rather than an imported constant, and a negative arm that carries its own
  positives — an implementation emitting the warning unconditionally passes the first and reddens on
  the second. This is exactly the anti-echo and absence-only discipline this lens asks for, written
  into the plan before a line of test code exists.
- **The graph-invariance claim is stated in falsifiable form and reproduces.** "11 tasks, 7 waves,
  no cell moved" re-derived from the shipped parser at HEAD, and the column-wise diff against
  `1972402c` is byte-identical. A claim I can re-run is worth more than a claim I must trust.

## Recommendation

**Approved with minor changes**

No High findings, old or new. All four v1 findings (one Medium, three Low) are resolved, verified
against upstream text and repository state rather than against the changelog's account of them. The
new material — ordered-sequence vocabularies, E-08b's two-class arm, BR-14's co-located overwrite
warning and its negative arm — strengthens the plan's oracles and introduces no testability
regression. The single remaining Low (F-01) is a DoD-leg wording gap that does not block: fold it
into the next edit of the Verification section, or carry it into implementation review where the
leg's oracle will be checked against the test file anyway.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
