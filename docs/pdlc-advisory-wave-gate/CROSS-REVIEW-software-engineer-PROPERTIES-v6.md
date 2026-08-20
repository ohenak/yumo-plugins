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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Process | Residual raw `orchestrate-dev.js:NNNN` pins are ~4 lines short of HEAD: `ADVISORY_SEAM_PHASES` cited `:3108`, actually `:3112`; the `ADVISORY_SEAM_PHASES[seam]` lookup cited `:3338`, actually `:3342`; the ledger note's `:3428`/`:3459` are stale (`:3428` is blank; the `ADVISORY ESCALATION:` notice lives elsewhere); refusal catalogue cited `:2297`–`:2306`, actually `:2301`–`:2310`; `ADVISORY_EXCLUSIONS` cited `:2311`, actually `:2315`. DEC-DOC-01 asks for symbol/heading anchors instead. Carried forward unresolved from v5 F-01; non-gating. | PROP-REC-07; PROP-GATE ledger note; Fixtures / Overview refusal-and-exclusion rows |

No High or Medium findings. F-01 is inherited from the pre-round bytes — this round introduced
no delta, so it cannot have introduced a defect, and no load-bearing claim contradicts HEAD or
an upstream document.

DEFERRED: sweep the residual raw `orchestrate-dev.js:NNNN` pins (F-01) onto symbol/block-title anchors per DEC-DOC-01 at the next erratum opportunity for this document.
DEFERRED: consider whether an empty-delta round should be recorded in the document's changelog at all, or left to the cross-review history alone — a process question, not a content one.

## Questions

| ID | Question |
|----|---------|
| Q-01 | This round was dispatched as iteration 6 but the document did not move since the round-5 approval (`0c0475a7`) and no upstream hash changed. Was a revision expected to land and fail to commit, or is this an intentional confirmation round? Nothing in the tree suggests lost work — `git status` is clean — but the orchestrator is better placed than I am to tell a deliberate re-dispatch from a dropped edit. |

## Positive Observations

- The document's round-5 state is genuinely stable: five upstream hashes and the document hash
  all reproduce exactly, which is what makes an empty-delta round cheap to adjudicate instead
  of forcing a full re-read.
- The round-4 re-anchoring work continues to pay off. Every claim I re-verified against code
  this round that was anchored by symbol or block title (`ADVISORY_SEAMS`, `SEAMS`,
  `const configPath` / `implementation.testCommand`) is still accurate; every claim that has
  drifted is one of the raw `file:line` pins DEC-DOC-01 warns about. The failure mode is
  behaving exactly as the decision predicted.
- The seam-cardinality narrative — six on the test side, five in production, wave opens red —
  still matches both HEAD (`orchestrate-dev.js:1951`) and TSPEC §1.3, so a Phase I author
  reading either document meets the same baseline.

## Recommendation

**Approved with minor changes.**

The delta under review is empty: the document is byte-identical to the round-5 bytes I
approved, and all five upstream documents hash to the anchors recorded in that approval. Under
the freeze, neither blocking category applies — there is no defect this revision introduced
(there was no revision) and no load-bearing claim that contradicts the repository at HEAD or an
upstream document (I re-verified the code-dependent claims: `ADVISORY_SEAMS` still five at
`orchestrate-dev.js:1951`, `ADVISORY_SEAM_PHASES` still declared and consumed as described, the
eight refusal reasons and five exclusion ids still present, both `new` test files on disk).

The single open item is the inherited Low DEC-DOC-01 citation drift carried forward from v5.
It is recorded, not gating, and should be swept at the next erratum opportunity rather than
held against Phase I.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:8a9fe1d7050e405cb095c52211bb0d189c17059da4493c220fb99d78d5f04258
APPROVAL-HASH-NORMALIZED: sha256:d1794a1a9c2058009bc83cbbae96c8013a06e47a8202b6bb63f82dad0768289d
REVIEWED-COMMIT: 99f136a5218bdf97a220677265aa7ee07ef6a4b9
UPSTREAM-STATE: REQ sha256:817b67455ae1d90589c336c88d72914eb3105a49c50a3d54eaa9083fc918a7a8
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:1531143c923857242241c61a35d43fc9677e152d6cca1162533778bb0c30c004
UPSTREAM-STATE: DECISIONS sha256:84deee10d5c5743a60ac0279bf3135f67e1430d4e9976176f6b2691adf5833dc
UPSTREAM-STATE: PLAN sha256:e97acf667401b6327ae7d92a5f083361038299bdb3a215801f9bfe5f18f39f48
