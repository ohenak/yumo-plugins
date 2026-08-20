# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 6 (delta re-review, DECISION FREEZE in force)

## Overview

**Scope of this round.** Delta re-review under DECISION FREEZE. Per protocol I read my own
v5 cross-review first, then diffed the document under review against the commit I last
reviewed (`0c0475a7`, recorded as `REVIEWED-COMMIT:` in v5).

**The delta is empty.** `git diff 0c0475a7..HEAD -- docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md`
produces no output, and `git log 0c0475a7..HEAD` over that path lists no commits; the last
commit touching the file is still `0c0475a7` ("PROPERTIES v1.2 lineage and round-4 erratum
changelog"). `git status --porcelain` is clean, so there is no unstaged revision either. The
bytes in front of me are byte-identical to the bytes I approved in round 5
(sha256 `c2ebe8c8…`).

**Upstream is unmoved.** I re-hashed all five upstream documents in the working tree against
the `UPSTREAM-STATE:` anchors recorded in v5; every one matches: REQ `817b6745…`,
FSPEC `82f74a2d…`, TSPEC `1531143c…`, DECISIONS `84deee10…`, PLAN `e97acf66…`. So neither the
document nor anything it compresses has moved since the approved round — there is no drift
underneath this round and no new derivation to re-check.

Consequently the two questions this round exists to answer both resolve trivially:
(i) *did this revision break anything previously approved?* — there was no revision, so no;
(ii) *does any load-bearing claim now contradict the repository at HEAD or an upstream
document?* — I re-verified the claims most exposed to code drift below, and they hold.

Under the freeze, that leaves exactly the disposition I recorded in v5: one inherited Low
DEC-DOC-01 citation-drift finding, non-gating, to be swept at the next erratum opportunity.

## Properties

No property row changed, so per the delta protocol I did not re-read the unchanged property
catalogue. What I did re-check is the subset of property text whose truth depends on *code*
rather than on the document — those claims can go stale without an edit, which is the only
way this round could have produced a new High finding.

**Seam cardinality (PROP-SEAM-02 and the row-count sites).** The document's HEAD-state
sentence says every transcription surface already reads six members *except*
`advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality, and that the production array is
still frozen at five. Both halves still hold at HEAD:
`pdlc/workflows/orchestrate-dev.js:1951` reads
`export const ADVISORY_SEAMS = Object.freeze(["A1", "A2", "A3", "A4", "A5"]);` — the production
half is unmoved, so the red-wave baseline PROPERTIES describes (six on the test side, five in
production, wave opens red) is still the baseline a Phase I author would meet. This matches
TSPEC §1.3's *State surfaces at HEAD* table, so document and upstream still say the same thing
in the same direction.

**Seam-phase placement (PROP-REC-07).** `ADVISORY_SEAM_PHASES` is still declared at
`pdlc/workflows/orchestrate-dev.js:3112` and the `ADVISORY_SEAM_PHASES[seam]` lookup on the
`escalated` path is still at `:3342`. The *behaviour* the property asserts is therefore intact;
only the raw line pins in the document (`:3108`, `:3338`) remain four lines short — the
inherited Low carried forward from v5, unchanged in kind and in magnitude.

**Named test files.** Both files the Overview records as `new` are on disk and non-empty:
`pdlc/workflows/__tests__/advisoryWaveGate.test.js` (1.8K) and
`pdlc/engine/__tests__/advisory-config-example.test.js` (2.5K). The v4 High finding that this
paragraph resolved stays resolved.

Requirement traces, PLAN task homes, categories, and test-level assignments are byte-identical
to the approved round; nothing to re-litigate.

## Oracles

Oracle forms are byte-identical to the round-5 bytes I approved, so the three standing bars
carry forward unchanged and I re-state their disposition rather than re-deriving them:

- **No implementation echoes.** No oracle imports or derives its expected value from the code
  under test; expected values remain literal transcriptions from the spec. The one place this
  could have regressed silently is the seam list, where a lazy fix would swap a literal for
  `devModule.ADVISORY_SEAMS`. The document still describes the intended end state as literal
  six-member transcriptions plus the one remaining `["A1" … "A5"]` literal in
  `advisoryRecord.test.js` — not as a derivation from production. Intact.
- **No absence-only oracles.** Every negative assertion still carries its paired positive
  conjunct on the same path (PROP-REC-07 and PROP-SEAM-05 were the two I checked closely in
  round 5; their text is unchanged).
- **Completeness by set-equality.** The enumerated contracts still pin set-equality over the
  full enumeration rather than containment: the `GATE_EXCLUSIVITY_REGISTRY` set-equality,
  `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality, `advisoryHarvest.test.js`'s
  `seamNames` equality, and the `SEAMS` literal in `helpers/advisoryDoubles.js`. A deleted case
  still fails.

The two enumerations these oracles range over are also unmoved in production, which is what
keeps the set-equality bar meaningful: `ADVISORY_REFUSAL_REASONS` is still an eight-member
frozen array at `pdlc/workflows/orchestrate-dev.js:2301`–`:2310`, and `ADVISORY_EXCLUSIONS` is
still `["X-a", "X-e", "X-d", "X-b", "X-c"]` at `:2315`. The document's counts (eight refusal
reasons, five exclusion ids) are therefore still factually correct; only its line pins are
short by four, which is the inherited Low.

## Fixtures

Unchanged from the approved round; no fixture row, generator, or verbatim-string obligation was
edited. The fixture-side claims that depend on code rather than on the document still hold:

- The `SEAMS` literal in `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` remains the
  test-double enumeration the fixtures section anchors, re-anchored in round 4 off a raw line
  pin and still anchored by symbol rather than by `file:line` — so it cannot drift the way the
  residual `orchestrate-dev.js` pins have.
- The example-config fixture row is still anchored on the `const configPath` /
  `implementation.testCommand` test in `pdlc/engine/__tests__/ci-arrangement.test.js` and
  spells its two regexes inline; those regexes remain byte-identical to the ones in
  PROP-CFG-03, so there is no duplication drift between property and fixture.
- The verbatim-string discipline paragraph below the fixtures table is unchanged and still
  governs; exact user-facing strings remain owned by the lowest layer that pins them.

No fixture is newly required by this round, because this round introduced no delta.

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_
