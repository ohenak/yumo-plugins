# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 12 (upstream-cascade confirmation — PLAN v0.8 → v0.9; PROPERTIES bytes unchanged)

## Overview

**What this round is.** An upstream-cascade confirmation, not a re-review. PROPERTIES' own bytes are
unchanged since my v11 approval (`sha256:e9de08bc…`, `REVIEWED-COMMIT: a469ef4b`); PLAN moved from
v0.8 to v0.9 under `ba120270` after that approval was recorded. The single question I answer is
whether PROPERTIES is still a faithful compression of PLAN as PLAN now stands.

**The delta, measured.** `git show ba120270 -- …/PLAN-…md` is 4 insertions / 3 deletions across three
hunks and nothing else:

1. **Version cell** (`PLAN-…md:18`): `| pdlc | Draft | Claude | 0.8 | 2026-08-21 |` → `0.9`.
2. **P-A-7 lead-in**: *"named here, ahead of the run they govern, in the two cases that can arise:"* →
   *"…in the three cases that can arise (A, B and C below):"*. A wording correction only — the table
   below it grew to three rows at v0.8 and the lead-in had not followed; the case A/B/C rows are
   byte-identical.
3. **LI-08's amendment note**: the claim that `renderSection`'s `ordinal`, `gloss` and `body` are
   *"all three unexercised by any landed suite"* was false for `body` and is restated as two
   unexercised knobs plus one already-exercised one, with the counter-evidence named inline
   (`learningsBlock.test.js` on all six section specs, `learningsSelect.test.js` on the non-BR-6
   section). The conclusion — the amendment adds **callers**, not knobs — is unchanged.

Plus a v0.9 changelog row recording both. No task moved batch, no `Deps` edge changed, no AT
partition, fixture or manifest row moved, and the batches 7–13 ledger is untouched.

**Verification method — repository, not documents.** `shasum -a 256` over all six feature documents;
`git log --oneline` on PLAN to confirm `ba120270` is the tip and no later PLAN commit exists;
`git show ba120270` for the full delta; `grep -cF` of every PLAN quotation PROPERTIES carries against
PLAN at HEAD; `git grep -c "body:"` at `21edb7c5` and at HEAD across the two landed suites to
independently check PLAN's *corrected* claim rather than take it on authority.

**Upstream pins.** REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…` all
match the dispatched hashes byte-for-byte and are byte-identical to what I verified at v10/v11 — this
cascade has exactly one moving part. PLAN measures `sha256:eaddd392…`, matching the dispatched hash,
with version cell `0.9`.

**PLAN's corrected claim is true at HEAD.** `git grep -c "body:"` returns 6 in
`learningsBlock.test.js` and 1 in `learningsSelect.test.js` (7 total, same count at `21edb7c5`), which
is exactly what v0.9's restatement asserts. The erratum fixed a real defect and fixed it correctly.

**Conclusion up front.** PROPERTIES holds. Both corrections move PLAN *toward* what PROPERTIES already
said, not away from it: PROPERTIES has described the P-A-7 table as three-case since v0.10 and never
carried the `body`-unexercised claim. One bookkeeping consequence follows — PROPERTIES' PLAN version
pins now read `v0.8` where PLAN reads `v0.9` — filed Low below.

## Properties

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
