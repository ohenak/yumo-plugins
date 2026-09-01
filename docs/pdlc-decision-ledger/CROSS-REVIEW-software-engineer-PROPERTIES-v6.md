# Cross-Review: software-engineer — PROPERTIES (upstream-cascade delta re-confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md`
**Date:** 2026-09-01
**Iteration:** 6 (upstream-cascade confirmation — the document's own bytes are unchanged)
**Scope:** Do the PROPERTIES still hold against `PLAN` HEAD v1.1?

## Overview

Confirmation, not re-review. `PROPERTIES` is byte-unchanged since the v5 approval
(`sha256:2bab7d10…9141ef`, re-measured this round with `shasum -a 256`). One upstream pin moved:
`PLAN` v0.9 (`sha256:d1af8e47…4765a7`) → HEAD **v1.1** (`sha256:4d40cfb2…5fd8e3`). I re-derived the
round from the delta itself rather than the changelog, and spot-checked the two claims the delta
turns on against shipped reality in `pdlc/workflows/__tests__/`.

**Answer: yes — every property still holds, and no property is left without an owner.** The v1.1
delta is a re-grounding and alignment pass: all four upstream pins re-measured and unmoved, task
Status cells swept to `✅`, the T-00a census figure re-based (`154` → `166` pre-exclusion, the
load-bearing `102` unchanged), changelog hygiene, and one substantive re-point — T-12a's host module
moves from `documentOracles.test.js` to `pdlc/workflows/__tests__/decisionLedgerConfig.test.js`,
carrying a new `Deps` edge on T-13 and a batch move **2 → 4**.

I verified the re-point against HEAD rather than taking the delta's word for it. The `T-19: …`
blocks — the three OPERATIONS.md derived-set assertions, the README/CLAUDE referent conjunct and the
twelve-module namespace census — are in `decisionLedgerConfig.test.js` (`:395`, `:402`, `:409`,
`:416`, `:435`); `documentOracles.test.js` retains the census exclusion and the terminal
`expect(count).toBe(102)` (`:398`–`:426`) and nothing else of this feature's. Twelve
`decisionLedger*.test.js` modules exist, matching the manifest PROP-DISC-05's `:435` conjunct
set-equals.

**No property's content is touched by the delta.** No `BR-`/`E-`/`AC-` id, vocabulary row, measured
value, oracle design or acceptance condition moves. What the delta does move is *ownership
bookkeeping* the `PROPERTIES` file mirrors — and that mirror is now stale in three places (F-01).
Three prior-round findings remain unapplied and are carried as inherited, non-gating.

## Properties

| Property | `PLAN` v1.1 says | Still faithful? |
|---|---|---|
| **PROP-DISC-05** (`PROPERTIES`:453) | Documentation disclosure oracle, expectations **derived** from `DECISION_LEDGER_OMIT_REASONS` / `_NOTICES` / `_DEFAULTS`; T-12a → T-19, now hosted in `decisionLedgerConfig.test.js` | **Yes.** The property text names no host module — it states the assertion and its derivation discipline, both unchanged. Only the manifest rows that *do* name a host went stale (F-01). Verified green at HEAD. |
| **PROP-DISC-07** (`:455`) | T-00a keeps the batch-1 exclusion in `documentOracles.test.js`; the terminal `102` re-check stays there and is T-19's at batch 9 | **Yes**, and more exactly than before: v1.1 states outright that the `102` positive control does **not** move with T-12a. The literal, the four-prefix filter and the `decisionLedger` exclusion are all as cited. |
| **PROP-DISC-01…04, -06** (`:449`–`:454`) | T-12/T-19 engine leg, `.claude/pdlc.config.example.json`, own engine test file | **Yes**, untouched by the delta. |
| **PROP-DISC-08…10** (`:456`–`:458`) | T-20 landing (`0.23.6` → `0.23.7`, `--check` clean), T-00 preflight, T-03 fixture guard | **Yes.** v1.1 records T-20 as landed at `c49527fd4` with `plugin.json` reading `0.23.7` — the constrained target the property names, satisfied, not changed. |
| **PROP-INV-06…11** (`:407`–`:412`) | T-11's census, fourteen-member owned list, three census constants declared in `decisionLedgerCensus.test.js` | **Yes.** The v0.9 resolution the v5 round confirmed is unreversed; v1.1 touches no operand, no count and no slicing rule. |
| **PROP-WIRE-01…12, PROP-OFF-01** (`:335`–`:362`) | T-10a's three arms, symmetric-difference and set-equal-empty conjuncts | **Yes**, byte-identical across the delta. |
| **Module manifest set-equality** (`:871`–`:891`) | v1.1's file-ownership manifest re-points T-12a's row and re-labels `documentOracles.test.js`'s owners | **Set-equality survives** — the module *set* is unchanged in both directions, so "none orphaned" still holds. The owning-task and batch **cells** are stale (F-01). |

Nothing in the changed `PLAN` regions falsifies a property, and no property is orphaned: T-12a still
owns PROP-DISC-05's red half and T-19 still un-skips it — only the file it sits in changed.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | **The module manifest still homes T-12a in `documentOracles.test.js` at batch 2.** Three sites mirror `PLAN`'s file-ownership bookkeeping and are now wrong at HEAD: the manifest row (`PROPERTIES`:890) reads `documentOracles.test.js` … `T-00a (1) and T-12a (2) → T-19 (9)` … `PROP-DISC-05, PROP-DISC-07`; the §DISC owners paragraph (`:441`–`:442`) pairs T-12a → T-19 without naming its host, which is fine, but the §Coverage Matrix DISC row (`:853`) lists `documentOracles.test.js` as a DISC module. At `PLAN` v1.1 and at shipped HEAD, PROP-DISC-05's assertions live in `decisionLedgerConfig.test.js` (`:395`, `:402`, `:409`, `:416`, `:435`), T-12a is batch **4** with a `Deps` edge on T-13, and `documentOracles.test.js` carries PROP-DISC-07 only. The manifest's own claimed check — set-equal to `PLAN`'s manifest in both directions — still passes on the module set, so this is not a falsified property; but the row that a DoD or harvest pass would use to locate PROP-DISC-05 points at the wrong file. Fix: split `:890` into `documentOracles.test.js` — T-00a (1), T-19 (9 re-check) — PROP-DISC-07, add PROP-DISC-05 and T-12a (4) → T-19 (9) to the `decisionLedgerConfig.test.js` row (`:881`), and update the DISC module list at `:853`. | §Coverage Matrix `:853`; module manifest `:890`, `:881` |
| F-02 | Medium | inherited | nonlocal | **v5 F-02 is unapplied and now two `PLAN` versions stale.** §Coverage Matrix (`:907`–`:909`) and §Gaps (`:980`–`:995`) still assert that `PLAN` v0.7 **at HEAD** states the opposite census home in five places with a fifteen-member owned list, and still carry a live routed `ERRATUM: PLAN`. `PLAN` v0.9 discharged that divergence in the document's favour and v1.1 has moved two versions past it. Leaving the routed item live risks minting a follow-up round against an upstream that converged. Restated, not re-litigated: this is the same fix v5 asked for. | §Coverage Matrix `:907`–`:909`; §Gaps `:980`–`:995` |
| F-03 | Low | inherited | nonlocal | **The upstream pin row and in-body version labels are unapplied from v5 F-03 and have drifted further.** `PROPERTIES`:5 still pins `TSPEC` v1.0 / `PLAN` v0.7; HEAD is `TSPEC` **v1.3** `sha256:2c84d525…1be49b` and `PLAN` **v1.1** `sha256:4d40cfb2…5fd8e3`. In-body labels at `:407`, `:412`, `:902` still read *`TSPEC` v1.0*. Re-measure the pin row and drop the in-body labels in favour of the pin alone, the discipline `PLAN` adopted for exactly this failure mode. | Header `:5`; `:407`, `:412`, `:902` |
| F-04 | Low | inherited | nonlocal | **PROP-DISC-07's line anchor stops short of the assertion it cites.** `:455` cites `documentOracles.test.js:398–420` as the site that "filters on the `learnings`, `waveResume`, `loop` and `escalationView` prefixes and asserts `expect(count).toBe(102)`". At HEAD the `describe`/`test` opens at `:394`/`:398`, the filter runs to `:424` and the assertion is at `:426` — outside the cited range. Widen to `:394`–`:426`, or cite the test title per DEC-DOC-01's content-anchor form, which cannot drift. | PROP-DISC-07 `:455` |

FINDING: Medium | delta | local | Module manifest `:890` and §Coverage Matrix `:853` still home T-12a / PROP-DISC-05 in `documentOracles.test.js` at batch 2; `PLAN` v1.1 and shipped HEAD put those assertions in `decisionLedgerConfig.test.js` at batch 4 with a `Deps` edge on T-13, leaving `documentOracles.test.js` owning PROP-DISC-07 alone.
FINDING: Medium | inherited | nonlocal | §Coverage Matrix `:907`–`:909` and §Gaps `:980`–`:995` still assert a live `PLAN` v0.7 divergence and a routed `ERRATUM: PLAN` that `PLAN` v0.9 discharged and v1.1 has moved two versions past (v5 F-02, unapplied).
FINDING: Low | inherited | nonlocal | Upstream pin row `:5` and in-body labels `:407`, `:412`, `:902` still read `TSPEC` v1.0 / `PLAN` v0.7 against HEAD `TSPEC` v1.3 / `PLAN` v1.1 (v5 F-03, unapplied).
FINDING: Low | inherited | nonlocal | PROP-DISC-07's anchor `documentOracles.test.js:398–420` excludes the `expect(count).toBe(102)` line it names, which sits at `:426`.

## Recommendation

**Approved with minor changes**

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

APPROVAL-HASH: sha256:2bab7d107a9231846871d17bf7a81e68648cde73a7375f2a02578dd0779141ef
APPROVAL-HASH-NORMALIZED: sha256:331c0ae9a79eb82ed54af8a6e48a174accebc836535641c250f86ba043de91c6
REVIEWED-COMMIT: 287f7f1c96482c78f9811329d27a9594e06e4fb1
UPSTREAM-STATE: REQ sha256:9bc8bc32d69845b0f221c77ba48f919b8b0f6266a98f7c6eab73d1b5cc05f10d
UPSTREAM-STATE: FSPEC sha256:48691453921c28407a5265cfadaef8e58483fbf26ef629962f0929999da11256
UPSTREAM-STATE: TSPEC sha256:b8dcac11a521bc199d223a0547d3bd7d672640f5f6598d5b6103b2031246db6d
UPSTREAM-STATE: DECISIONS sha256:48e73a411481811f0decc792d6756829be66e1a105fbf024432fa1d5b9880240
UPSTREAM-STATE: PLAN sha256:285bf1800e81c75c57ad06e32caa1df78b8f268c488262a6ceae2498fed56841
