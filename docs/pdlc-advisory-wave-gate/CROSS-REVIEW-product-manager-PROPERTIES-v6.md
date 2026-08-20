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

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
