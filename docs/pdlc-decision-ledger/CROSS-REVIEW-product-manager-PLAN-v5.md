# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.5, se-author)
**Date:** 2026-08-29
**Iteration:** 5 (delta re-review)
**Scope:** Local

## Overview

Delta re-review of `PLAN-pdlc-decision-ledger.md` **v0.5** against my v4 delta confirmation
(`CROSS-REVIEW-product-manager-PLAN-v4.md`, verdict *Needs revision*, reviewed at `36cd34d4d`).

Two commits touched the document since:

| Commit | Time | What changed |
|---|---|---|
| `4950ea00c` | 08:10 | PLAN v0.5 operator pass — lands the erratum items my v4 found unlanded (`RESOLVED: yes`) |
| `a408375a6` | 08:51 | Names T-19's terminal `102` control in the per-phase file-ownership manifest |

Aggregate `git diff 36cd34d4d..HEAD`: **19 insertions / 12 deletions**, one file. Sections
changed: the header Upstream row, the revision-history block, rows **T-00a**, **T-11**, **T-12a**,
**T-19**, one row of §Per-phase file-ownership manifest, and two §Definition of Done bullets.
Everything else is byte-unchanged and is not re-litigated here.

**All three of my v4 findings are resolved** — the High (F-01, terminal `102` ownership), the
Medium (F-02, transposed `DECISIONS` pin) and the Low (F-03, T-11's orphaned second operand). The
landing is clean and I verified each mechanically; detail in §Batches and §Dependencies.

**What this round nonetheless cannot approve is not the edit — it is the ground under it.** The
approved upstream `TSPEC` advanced from **v0.8** to **v0.9** at 08:37–08:38, *after* the v0.5
operator pass at 08:10, and v0.9 rewrote §7.3 — the exact section this edit newly cites in T-11.
The PLAN's header still pins `TSPEC` **v0.8**, and T-11's census contract now contradicts approved
`TSPEC` v0.9 in two load-bearing ways. Both are pre-round bytes overtaken by upstream movement, so
both are tagged `inherited`: this is a re-grounding pass owed to the PLAN's ordinary revision loop,
not a defect the operator pass introduced, and not an erratum against `TSPEC` (the `TSPEC` is
right; the PLAN is stale). No `ERRATUM:` lines this round.

## Batches

**F-01 (High, v4) is resolved — the terminal `102` control now has exactly one named owner.** My
v4 High was that T-00a paired a batch-1 acceptance with a conjunct only evaluable at batch 9, and
pointed at T-12a, which explicitly disclaimed it — so the terminal count was homeless, and had
already misdirected PROPERTIES (PROP-DISC-07). The v0.5 edit closes it at **four** consistent
sites, and I checked all four on disk:

1. **T-00a (`PLAN`:117)** now reads "Acceptance is **one-sided and evaluable at batch 1**: the
   exclusion lands and the pre-existing suite is green at `102`", followed by a forward pointer —
   "the **terminal** re-check … is **owned by T-19** (batch 9, the first point at which it is
   evaluable)". The unevaluable conjunct is gone from the batch-1 obligation; the pointer names a
   task, not a vacancy.
2. **T-12a (`PLAN`:131)** replaces its bare disclaimer with an attributed one: "It is a set, not a
   count — the terminal `102` *count* assertion is **T-19's obligation**, not this task's". The v4
   contradiction (two rows disclaiming the same obligation) is gone.
3. **T-19 (`PLAN`:139)** carries the obligation as its own acceptance text: "**Terminal `102`
   positive control (T-00a's deferred conjunct, owned here):** with all twelve `decisionLedger*`
   modules on disk, `documentOracles.test.js`'s `*.test.js` census still counts `102`".
4. **§Per-phase file-ownership manifest (`PLAN`:205)** — the `documentOracles.test.js` row for
   T-19 now reads "9 (un-skip; also the terminal `102` positive control)", so the manifest and the
   task table agree, and **§Definition of Done (`PLAN`:450–454)** splits the checkbox into the two
   owners it always had: exclusion "landed by T-00a at batch 1", count "with all twelve modules on
   disk (the terminal positive control, owned by T-19)".

No double-counting and no orphan: exactly one task asserts the count, exactly one asserts the
exclusion, and T-12a's twelve-name **set** census is preserved as the distinct obligation it is.

**The underlying facts check out in code.** `pdlc/workflows/__tests__/documentOracles.test.js`:415–418
carries exactly the four exclusions T-00a names (`learnings`, `waveResume`, `loop`,
`escalationView`) and `:420` pins `expect(count).toBe(102)` — so both the literal and the
exclusion shape the tasks describe are real, not aspirational. The "twelve modules" the terminal
control and T-12a's set census both quantify over is exact: §Per-phase file-ownership manifest
(`PLAN`:162–226) names twelve distinct `decisionLedger*.test.js` modules and no more
(`decisionLedgerBaselineGuard`, `Bounds`, `Census`, `Config`, `Corpus`, `FixtureGuard`,
`Injector`, `Loop`, `Main`, `Preflight`, `Recognise`, `Render`). Every file the changed rows name
either exists at HEAD (`documentOracles.test.js`, `orchestrate-dev.js`,
`.claude/pdlc.config.example.json`, `pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md`) or is
tagged `[new]`.

**F-03 (Low, v4) is resolved.** T-11's second census operand is a full sentence again — "The
census's second operand: `orchestrate-dev.js`'s source **minus** four owned regions …" — no longer
a lowercase-`and` fragment stranded behind a full stop.

**Nothing I previously approved is broken.** T-00a keeps its saturation arithmetic (154 files, 102
after exclusions), its TE F-03 "what the positive control does and does not prove" paragraph and
its "not a re-pin of the literal" rationale; T-12a keeps every derived-not-transcribed and
set-equality conjunct and the ~:625 confinement discipline; T-19 keeps the whole re-pinning budget
paragraph, and its new sentence is strictly additive. The batch and dependency columns of all four
changed rows are untouched.

**What the changed T-11 row no longer matches is upstream** — see §Dependencies. That is the one
open item.

## Dependencies

## Verification

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
