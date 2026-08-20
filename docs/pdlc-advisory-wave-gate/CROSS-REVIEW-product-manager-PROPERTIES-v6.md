# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 6
**Scope:** Delta re-review under DECISION FREEZE — verify nothing broke since the v5 approval at `0c0475a7`

## Overview

**The delta this round is empty.** My v5 review recorded `REVIEWED-COMMIT: 0c0475a7`. At HEAD,
`git merge-base --is-ancestor 0c0475a7 HEAD` succeeds and
`git diff 0c0475a7 HEAD -- docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md`
is empty; `git status --porcelain` is clean, so there is no unstaged revision either. The only
files changed under `docs/pdlc-advisory-wave-gate/` between that commit and HEAD are the two
round-5 cross-review files (`CROSS-REVIEW-product-manager-PROPERTIES-v5.md`,
`CROSS-REVIEW-software-engineer-PROPERTIES-v5.md`) — review artifacts, not the document.
The document under review is byte-identical (sha256 `c2ebe8c8…`, 489 lines) to the bytes I
approved in v5.

**The upstream base is also unmoved.** All five upstream digests measured at HEAD match the
`UPSTREAM-STATE` lines I recorded in v5 exactly:

| Document | sha256 at HEAD | Matches v5 UPSTREAM-STATE |
|---|---|---|
| REQ | `817b6745…a7a8` | Yes |
| FSPEC | `82f74a2d…1c3e` | Yes |
| TSPEC | `1531143c…0004` | Yes |
| DECISIONS | `84deee10…33dc` | Yes |
| PLAN | `e97acf66…9f48` | Yes |

So neither of the two things that can invalidate a prior approval has happened: the document did
not change, and nothing it compresses moved out from under it. Under the freeze the only
admissible blocking findings are (i) a defect this revision introduced and (ii) a factual
contradiction with the repository at HEAD. There is no revision, so (i) is vacuous; I re-measured
the load-bearing repository claims for (ii) and report them in the sections below.

**Round-5 disposition.** v5 carried exactly one open item — a Low/`Process` DEC-DOC-01 citation
finding on the verbatim-string-discipline paragraph — and zero High and zero Medium. That item is
still open, unchanged, and still non-gating (see F-01). Nothing else was owed.

## Properties

Product lens, re-measured at HEAD rather than taken from my own v5 notes. The property statements
are byte-identical, so the only way one can have become false is if the repository moved. It did
not; the four claims v5 called load-bearing all still hold:

| Claim in the document | Measured at HEAD | Still true? |
|---|---|---|
| PROP-SEAM-02: six cardinality-coupled surfaces read six "as one set" at HEAD **except** `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality, which still transcribes five | `advisoryRecord.test.js:496` reads `["A1", "A2", "A3", "A4", "A5"]`; `helpers/advisoryDoubles.js:354` `const SEAMS = ["A1" … "A6"]` | Yes — exactly the exception the property names |
| Derivation rule 1: four bare row-count sites already assert `toHaveLength(6)` | `advisoryDisabled.test.js:629`, `advisoryQueueSeams.test.js:634`, `advisoryHarvest.test.js:578`, `advisoryHarvest.test.js:733` all read `toHaveLength(6)` | Yes — all four, unchanged |
| PROP-CFG-03: example config carries `{"enabled": false, "waveBudgetPerRun": 1}`, asserted in the purpose-named engine file, never in `ci-arrangement.test.js` | `pdlc/engine/__tests__/advisory-config-example.test.js` exists at HEAD; `ci-arrangement.test.js` exists and remains unowned by this feature | Yes — matches REQ §5 C-2's default `1` and TSPEC §5.1's engine-channel row |
| PROP-CTR-13: tier enabled with `waveBudgetPerRun: 0` escalates `budget-exhausted` with zero `_agent` calls | `ADVISORY_REFUSAL_REASONS` at `pdlc/workflows/orchestrate-dev.js:2301` contains `"budget-exhausted"` as its eighth member | Yes |

**Traceability, re-checked mechanically rather than by eye.** §C-3's PLAN-task column and the PLAN's
own task ids are set-equal: extracting `A6-NN` ids from `PLAN-pdlc-advisory-wave-gate.md` and from
§C-3 yields 22 ids on each side with an empty `diff`. No PLAN task is unmapped, and §C-3 invents no
task the PLAN does not list — the completeness bar is met by set equality, not containment, so a
deleted PLAN row would surface here.

**Every named test file resolves on disk.** All thirteen distinct `*.test.js` files the document
names exist at HEAD: eleven under `pdlc/workflows/__tests__/` (`advisoryConfig`, `advisoryDisabled`,
`advisoryDodSeams`, `advisoryDriver`, `advisoryEnvelope`, `advisoryEscalationLog`,
`advisoryHarvest`, `advisoryQueueSeams`, `advisoryRecord`, `advisoryWaveGate`,
`consolidationProperties`, plus `waveExecution`) and two under `pdlc/engine/__tests__/`
(`advisory-config-example`, `ci-arrangement`). The v1.2 changelog's framing — `new` denotes TSPEC
§5.1's Status column, not absence from disk — remains the accurate reading, which is precisely what
round 4's F-01 fixed and round 5 confirmed.

**Scope compliance.** No revision landed, so no scope could have crept. The document still makes no
product decision that belongs upstream, and still explicitly defers the `e3b9d5a3`
revert-versus-re-derive disposition to PLAN's Phase I rather than settling it here.

## Oracles

The oracles section is byte-unchanged. I re-measured the repository facts it asserts, since those
are the only things that can have gone stale under a freeze round:

- **O-A's "`attempts` is consumed on paths that never reach `verifyGate`"** still holds:
  `orchestrate-dev.js:3425` increments `attempts` on the preemption path
  (`// the in-flight attempt counts as consumed by the preemption (T-02-5)`), with further
  increments at `:3432` and `:3463`. The two raw pins the paragraph carries (`:3428`, `:3459`) have
  drifted by a few lines and no longer land on the increments they name — the claim is true, the
  anchors are stale. Same DEC-DOC-01 class as F-01, Low, `Process`, non-gating.
- **O-C's real-repository fixture shape** resolves: `advisoryDodSeams.test.js:371` is
  `mkdtempSync(join(tmpdir(), "pdlc-a3-fixture-"))` inside
  `T-05-5 — A3's working tree is byte-identical to its pre-invocation state (real git repo)`. The
  document is describing a shape that ships, not one it hopes for.
- **G's two verbatim literals are exact transcriptions of TSPEC, not paraphrases.** The
  capture-failure sentence in TSPEC §4.5 (`TSPEC:1255`, `diagnosis` row) reads
  `snapshot capture failed (snapshot-unavailable); no repair was proposed and none was applied` —
  character-for-character what PROPERTIES quotes. The promotion commit message
  (`chore({feature}): wave {N} advisory promotion ({taskId})`) and its distinct emit label
  (`Wave N advisory promotion (task T)`) likewise match TSPEC §3.6 exactly, including the
  message/label split. This is the discipline the task brief asks for: expected values transcribed
  from the spec, never derived from the code under test.
- **E's shared-literal reasoning** holds at HEAD: `budget-exhausted` is a single member of the
  frozen catalogue at `orchestrate-dev.js:2301`, so the document is right that a reason string alone
  cannot distinguish the attempt-budget from the seam-budget arm, and right to demand the positive
  `resolved` disposition as the companion.

**Oracle-quality bars from the task brief, re-checked.** No absence-only oracles: O-B pairs each
absence conjunct with a recorded `ledgerAnchor.value` (`=== 2` / `=== 4`), O-C pairs the map equality
with a named negative control, and E forbids reading non-escalation from a shared reason literal.
No implementation echoes in the document's own oracles: O-C explicitly rejects an injected `_git`
double "which could only echo the fixture", and G quotes TSPEC rather than the implementation.
Completeness by set-equality is carried where an enumeration exists — PROP-ENV-06's ordered-sequence
equality over the catalogue, and PROP-SEAM-02's set equality over the seam list.

## Fixtures

Unchanged since v5, and every fixture claim I can measure still measures true:

| Fixture row | Claim | Measured at HEAD |
|---|---|---|
| Doubles home | All doubles live in `pdlc/workflows/__tests__/helpers/advisoryDoubles.js` (A6-01) | File exists; `const SEAMS` at `:354` carries the six-member form `["A1" … "A6"]` — the end state the row records |
| Real-repository fixture builder | Shape already ships as `advisoryDodSeams.test.js:371` | Resolves: `mkdtempSync(join(tmpdir(), "pdlc-a3-fixture-"))` |
| Config fixtures | `waveBudgetPerRun` ∈ {`1`, `0`, `-1`, `1.5`, `"x"`, `null`, absent}, plus tier-off and tier-on-A6-off arms | Unchanged; still matches REQ §5 C-2's default `1` and TSPEC §4.4's validator, both at the digests v5 recorded |
| Example-config fixture | Tracked `.claude/pdlc.config.example.json`; `ci-arrangement.test.js`'s module-scope `configPath` is the precedent, and the `implementation.testCommand` regexes are the pre-edit baseline | `pdlc/engine/__tests__/ci-arrangement.test.js` exists with that `configPath` symbol and that test title; anchored by symbol/title, not line pin |
| Verbatim-string discipline | Eight refusal reasons in shipped order (`orchestrate-dev.js:2297`–`:2306`), five exclusion ids (`:2311`) | **Both pins stale.** `ADVISORY_REFUSAL_REASONS` declares at `:2301` with members `:2302`–`:2309`; `ADVISORY_EXCLUSIONS` now declares at `:2315`. The *content* claims are exact — eight reasons in the order transcribed, five exclusion ids `["X-a", "X-e", "X-d", "X-b", "X-c"]` — only the anchors point at the wrong lines |

The verbatim-string row is the one item carried from v5 and it has, if anything, drifted further
(the exclusion-set pin `:2311` pointed at a comment when I measured it in round 5; the declaration
now sits at `:2315`). This is exactly the failure mode DEC-DOC-01 exists to prevent, and exactly why
the fix is to anchor on the symbol names rather than to re-pin the numbers. It is Low and `Process`,
not gating: no property, no oracle, and no acceptance criterion depends on the line number — the
transcribed literals themselves are correct against HEAD.

No fixture introduces behaviour the REQ does not ask for, and no fixture is dead: every one named
above is claimed by at least one property in §A–§H and by at least one PLAN task in §C-3.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
