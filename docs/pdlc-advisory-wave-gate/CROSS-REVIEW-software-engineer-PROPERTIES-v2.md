# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-19
**Iteration:** 2
**Scope:** Delta re-review of PROPERTIES v1.0 → v1.1. Verified resolution of my five v1 findings
against HEAD, and scanned only the sections the revision touched (PROP-SEAM-02, PROP-ENV-10,
PROP-GATE-02, PROP-REC-07, PROP-CFG-03, §Fixtures example-config row, §G-1 row 7, §G-2, §C-3 task
rows A6-02 / A6-17). Unchanged sections approved in v1 were not re-litigated.

## Delta basis

`git diff e3d47a2d..HEAD -- docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md`
(six authoring commits, `2f70809e`…`7f8dcda6`). Every changed cell was re-grounded in HEAD source
rather than read as prose.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **PROP-REC-07's `unknown` negative control needs a seam the *catalogue* rejects but the *log path* still serves.** The property asserts the `unknown`/`unknown` arm "on a fixture whose seam is absent from the table". That is reachable — `orchestrate-dev.js:3338`'s `ADVISORY_SEAM_PHASES[seam]` lookup is an unguarded index and `:3344`–`:3345` fall back per field — but after A6-05 (batch 2) every member of `ADVISORY_SEAMS` also has a phase row, so the fixture seam must be a synthetic non-catalogue id (`"A9"`-style). Worth one clause saying so: a reader who picks a real seam finds the negative control unreachable, and a reader who worries the fixture violates PROP-SEAM-01's set-equality should be told the two oracles range over different surfaces. | §F, PROP-REC-07 |
| F-02 | Low | Cross-Feature | **§G-2's new bullet is correct today and will silently become wrong if the live config is realigned.** Verified: `.claude/pdlc.config.json`'s `testCommand` is `cd pdlc/workflows && npm test …` with no engine leg, so A6-04 is indeed invisible to the wave gate. But `.claude/pdlc.config.example.json` *does* carry `(cd pdlc/engine && npm test) && cd pdlc/workflows && npm test …`, and `pdlc/engine/__tests__/ci-arrangement.test.js:806`–`:819` asserts exactly that pair on the example file. The live config and the asserted example config have drifted apart, and the drift is what makes §G-2's claim true. One parenthetical naming the divergence would keep the bullet honest if the live config is ever brought into line — at which point A6-04 becomes wave-gate-visible and the "known-soft" classification lapses. | §G-2, first bullet |

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-CFG-03 now cites `ci-arrangement.test.js:799`–`:819`; PLAN A6-04 cites `:799`–`:825` for the same test. Both land inside the block (the test opens at `:799`, the second `assert.match` closes at `:819`, the test body closes just below), so neither is wrong — but two documents naming different end anchors for one block invites a later "which is right" round. Worth reconciling to one span in whichever document is edited next. |

## Positive Observations

- **F-01 (v1) is resolved in the strongest available way, not the cheapest.** Rather than exporting
  `ADVISORY_SEAM_PHASES` or forcing a TSPEC round, PROP-REC-07 was re-homed to
  `advisoryEscalationLog.test.js` (A6-17) and re-expressed over the **written entry**. I verified
  the mechanism the new oracle rests on: `orchestrate-dev.js:3338` reads
  `ADVISORY_SEAM_PHASES[seam]`, and `:3344`–`:3345` emit `phase: placement ? placement.id :
  "unknown"` and `phaseOutcome: placement ? placement.outcome : "unknown"`. The `unknown`/`unknown`
  claim is exact, per-field, and quoted from HEAD rather than paraphrased. The re-home also fixes
  the redness question I raised: at batch 11 no A6 escalation entry can be produced at all
  (`runWaveGateSeam` lands in A6-18, batch 12), so the property is legitimately RED where it now
  sits, which it would not have been as a constant assertion behind A6-05's batch-2 GREEN.
- **The constant remains module-private and the document now says so out loud.** `const
  ADVISORY_SEAM_PHASES = Object.freeze({…})` at `orchestrate-dev.js:3108` carries A1–A5 only, with
  no export — exactly as v1 found. The revision did not quietly assume an export; it names the
  privacy as the reason for the oracle choice.
- **PROP-SEAM-02's four new anchors are exact to the line.** `advisoryRecord.test.js:496`
  (`expect(rows.map((r) => r.seam)).toEqual(["A1"…"A5"])`), `:544` (`test.each(["A1"…"A5"])`),
  `advisoryHarvest.test.js:573` (`expect(seamNames).toEqual([…])`), and
  `consolidationProperties.test.js:250` (`rng.pick(["A1"…"A5"])`) all match HEAD character for
  character. Combined with v1's already-verified `advisoryDriver.test.js:221`/`:846` and
  `helpers/advisoryDoubles.js:271`, the transcription surface is now fully enumerated rather than
  described, which is what makes A6-03's edit auditable.
- **F-03 (v1) resolved with the blast radius made assertable, not merely acknowledged.** PROP-CFG-03
  now cites `ci-arrangement.test.js:39`'s `configPath` resolution and turns the precedent into a
  paired conjunct: the `testCommand` regex pair must still match *after* the advisory key is added.
  That converts a hazard note into an oracle, and it correctly leaves `ci-arrangement.test.js`
  unowned by PLAN. The §Fixtures row absorbed the same fact, so a reader arriving from either
  direction learns it.
- **F-02 (v1) resolved with the executor named and the consequence spelled out.** §G-2's new bullet
  says plainly that neither A6-04's RED nor its GREEN is observable in a wave gate or the V-wave,
  and routes the reader to CI's `Engine tests (ubuntu-latest)` job. I confirmed the premise against
  the live `.claude/pdlc.config.json`. "A batch reported green by the wave gate therefore carries no
  evidence about PROP-CFG-03 either way" is the sentence a future debugger needs.
- **F-04 (v1) resolved without discarding the structural content.** PROP-GATE-02 now leads with
  three observable runs — apply-then-green resolves; pre-A6 red tokens alone do not resolve;
  no-apply does not resolve — and explicitly demotes the carrier design to "TSPEC's to mandate".
  Arm (ii) is the one that earns its keep: it proves the segment *origin* is the apply, which is the
  behaviour the `{value: -1}` mechanics existed to produce. This is the right altitude correction.
- **F-05 (v1) resolved by set, not by spot-fix.** `E-17` and `E-18` joined PROP-ENV-10's Traces
  (alongside `BR-8`, which I verified exists at `FSPEC:190`, "A6 never commits (AC-4.2)"), and
  `E-13` became §G-1 row 7 with FSPEC:270's own reasoning quoted. A future set-equality sweep over
  FSPEC's E table now reads all three as decided rather than missed, which was the point.
- **The changelog is honest about provenance.** Version 1.1's row attributes each edit to the
  specific finding that prompted it (SE F-01…F-05, PM F-01), and the Cross-Reviews row was updated
  from "(none yet)" to name both round-1 files. Lineage is reconstructible without git.

## Recommendation

**Approved with minor changes**

My one blocking finding from v1 (F-01, PROP-REC-07's undeclarable level home) is fully resolved, and
resolved by re-expressing the property over an observable rather than by weakening it. F-02 through
F-05 were each absorbed in the same revision with claims I re-verified against HEAD line by line —
no citation in the changed text is stale or approximate. The revision introduced no new High or
Medium issues: the two Low findings above are clarity hardening for future readers, and the question
is a two-document anchor reconciliation. Nothing here needs another round before Phase I.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:7a88c5f01e4850d4e0c11e1865b4bbc7ed08f952cfa8b6ed0f68afc331ab502d
APPROVAL-HASH-NORMALIZED: sha256:b5f27734c8c3ee8d054961df670e9c08c6abf333fa720898b6298c9485490082
REVIEWED-COMMIT: 7f8dcda6aa0898030c78ea68dadf87cec17c054f
UPSTREAM-STATE: REQ sha256:a10396e88a52c1905b0d2cdfe0bbb2174b8f100888b7a7b2d69b0e0bd5ed9645
UPSTREAM-STATE: FSPEC sha256:82f74a2da52df5be64bf266d61341a0879df8bdafe69adf2f85f5ba9db961c3e
UPSTREAM-STATE: TSPEC sha256:c0ee14a4e69efd994c5d1d4d0c1d0b32c9f0e31e948a6f37127a209b1e20585a
UPSTREAM-STATE: DECISIONS sha256:5145d90af8ed14261979b0c46fa60791c11ac9fd672950f1fab634f7e6c5ccc3
UPSTREAM-STATE: PLAN sha256:bfb7dc37498abd7aef4a55d54d5adba7537d7cac345d20530afbcf0e664bb37f
