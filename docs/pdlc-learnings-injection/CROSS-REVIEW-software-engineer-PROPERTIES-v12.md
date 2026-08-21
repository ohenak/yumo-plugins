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

**No property statement is disturbed, and I measured that rather than inferring it from the delta's
size.** PROPERTIES' seventy `PROP-` statements, §C.1's 35-of-35 and §C.3's 23-of-23 enumerations, and
the AT/level/owning-task partitions all reconcile against a PLAN task table the erratum did not touch:
the only task row inside the delta is **LI-08**, and inside that row only the amendment note's prose
about which `renderSection` knobs are exercised changed. LI-08's ATs (`LI-AT-05`, `LI-AT-11`,
`LI-AT-12`), its file (`__tests__/learningsBlock.test.js`), its batch (3) and its `Deps` (LI-02) are
byte-identical.

**The one place PROPERTIES leans hardest on PLAN — §C.4 — leans on text the delta did not move.**
§C.4's argument is built out of six quotations from PLAN's P-A-7 material. I checked each with
`grep -cF` against PLAN at HEAD; all six still resolve, verbatim, count 1:

| Quotation carried in §C.4 / §G.3 | Present in PLAN at HEAD |
|---|---|
| *"under case C they owe no ledger row, and they owe green."* | yes |
| *"after batch 13, the case that is live at HEAD"* | yes |
| *"batch 9 through batch 12"* (case B's re-scope) | yes |
| *"any other amendment to a landed suite arriving from here on"* | yes |
| *"**this** heading-form follow-up commit, not a standing exemption for those files"* | yes |
| *"the first point the suite is green"* (P-A-6) | yes |
| *"has found a real defect, not staged a TDD red"* | yes |

So every load-bearing sentence §C.4 compresses is still upstream, still saying the same thing, in the
same words.

**The lead-in correction moves PLAN toward PROPERTIES, not away from it.** PROPERTIES has said since
v0.10 that PLAN carries a *"**three**-case table"* (`:1110`) and enumerated cases A, B and C. PLAN's
stale *"two cases"* lead-in was, at v0.8, a live inconsistency between PLAN's prose and PLAN's own
table — and PROPERTIES had already resolved it the way v0.9 now resolves it, by reading the table.
After this erratum the two documents agree at the wording level as well as the structural one. This is
the rare cascade where the upstream edit *retires* a discrepancy the downstream had been silently
absorbing.

**The `renderSection` correction touches nothing PROPERTIES asserts.** I grepped PROPERTIES for
`renderSection`, `body:`, "free-form" and "knob": zero hits. PROPERTIES never carried the retracted
"all three unexercised" claim, so there is nothing to retract downstream. What PROPERTIES *does* say
about the landed builder's rendering — §C.4:1121, *"the builder renders the canonical glossed
`\"Rejected Proposals (with rationale)\"`"* — is a claim about the **glossed title form**, not about
the `gloss` parameter's exercise, and it remains true at `21edb7c5`. PROPERTIES' §F.1 heading-form
discussion (`:876`, `:891`, `:893`: the ordinal is optional and carries no meaning; the trailing gloss
is optional; 9 of 9 corpus documents write the glossed form) is a statement about the **corpus**, not
about test-double call sites, and is orthogonal to which knobs a landed suite passes.

**Where PROPERTIES is now stale: the version pins.** PROPERTIES pins PLAN as `v0.8` in five places —
the header upstream row (`:11`), §C.4's *"of PLAN's **three**-case table at v0.8"* (`:1110`), *"a
ruling PLAN v0.8 scopes to…"* (`:1155`), *"**P-A-6** (byte-unchanged at v0.8)"* (`:1170`), and §G.3's
*"PLAN at HEAD (**v0.8**)"* (`:1299`, with three further `v0.8` attributions in the struck bullets).
PLAN at HEAD is **v0.9**. Two observations keep this Low rather than gating:

- Every *substantive* claim attached to those pins survives v0.9 unchanged. The table is still
  three-case; the case B re-scope and case C ruling are byte-identical; and **P-A-6 is still
  byte-unchanged** — I re-measured, and the erratum's three hunks are the version cell, the LI-08 row
  and the P-A-7 lead-in, none of which is P-A-6's row.
- The attributions in the struck §G.3 bullets (*"answered by PLAN **v0.8**'s new case C"*) are
  **historical provenance**, not HEAD claims: case C *was* introduced at v0.8, and that stays true
  forever. Those are correct as written and should not be rewritten to v0.9.

Only §G.3:1299's *"PLAN at HEAD (**v0.8**)"* and the header row's version pin are assertions about
HEAD, and only those two are now false. That is the finding below.

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
