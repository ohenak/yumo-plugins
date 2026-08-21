# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 13 (delta re-review under DECISION FREEZE — PROPERTIES v0.7 → v0.8)

## Overview

**What this round is.** A delta re-review, under decision freeze, of PROPERTIES v0.7 → **v0.8**. My
v12 was an upstream-cascade confirmation on byte-unchanged PROPERTIES; this round the document itself
moved, in six commits (`022e1c46`, `d173ff19`, `7cc189f5`, `085a4024`, `67233d19`, `c575cdc3`) that
land 245 changed lines. I judge only whether my own prior blocking findings are resolved and whether
this revision broke anything.

**The delta, measured.** `git diff -U0 72771ffa HEAD` on the document returns fifteen hunks, and every
one of them falls inside four regions:

| Region | Lines | What moved |
|---|---|---|
| Header / Overview | `:11`, `:18`, `:29` | version cell `0.7` → `0.8`; upstream row gains a v0.8 note; HEAD pin `(2026-08-20)` → `` (`09c7c62f`, 2026-08-21) `` |
| §C.4 Reconciliation | `:1064`–`:1207` | the whole re-pin and case-C reversal |
| §G.2 Known gaps | `:1274` | new gap **5**, old 5 renumbered to **6** |
| §G.3 Routed errata | `:1340`, `:1350`–`:1363` | two anchor re-pins, one newly routed item |

No hunk touches §Properties (Groups A–J), §Oracles (§O.1–§O.9), §Fixtures (§F.1–§F.4), §C.1, §C.2 or
§C.3. The header's own claim — *"No property, oracle, fixture, AT mapping or coverage row moves"* — is
therefore true by construction of the diff, not merely asserted, and I checked it that way.

**What the revision does.** Three things, and they are the right three:

1. **Re-pins every commit anchor.** PM v11 F-01 named the branch as rebased and every anchor as
   pre-rebase. All 21 anchors the revision writes resolve at HEAD (`b9074d1e`, `2f71b899`, `b6cbf930`,
   `2139fea8`, `aadd01bc`, `8eee671f`, `92cd9345`, `744311f7`, `2f0927f3`, `bb686ca3`, `d9b51a9a`,
   `ad58b052`, `6467afa6`, `2fc6fcd3`, `a4998e13`, `be2456c8`, `e7fa8d87`, `7a97f357`, `6e45e788`,
   `5b4c6663`, `0fa099a3`) — I ran `git log -1 --format=%s` on each and every subject matches the task
   the row attributes it to.
2. **Reverses seven absence claims into positive ones.** §C.4 previously reasoned forward from *"none
   of the four is present in the landed suite"*. That is now false at HEAD, and the revision says so
   in a claim-by-claim table rather than silently deleting the old text.
3. **Records what it found while re-measuring.** Four `learnings*` files exist that no `LI-*` task
   owns; they go into §G.2 as gap 5 and are routed to PLAN in §G.3 rather than absorbed.

**Verification method — repository, not documents.** `git ls-files pdlc/workflows/__tests__` filtered
to `learnings*`; `git log -1` on all 21 anchors; `git log --diff-filter=A -1` on the four unowned
files; `sed -n {N}p` on all seventeen `file:line` anchors the revision writes; `head -4` on the four
remediation files to check the header attributions; `git log --oneline main..HEAD` for LI-id coverage;
and `npm test -- __tests__/learningsBlock.test.js __tests__/learningsSelect.test.js` to check the
green claim by running it rather than reading it.

**Conclusion up front.** My v12 carried **no High and no Medium** — one Low (a stale PLAN version pin).
Nothing in this delta is broken: every re-pinned anchor resolves, every line anchor lands on the text
quoted, the green claim reproduces exactly, and the four-file gap is real. The v12 Low is **not**
resolved and has widened — PLAN reached **v1.1** on this branch *before* this revision was written,
and PROPERTIES still pins **v0.8**, which now costs one non-resolving verbatim quotation, one false
paraphrase of case A, and one fallback sentence PLAN v1.1 deliberately retired. That is Medium, and
under the freeze it does not block: no property, oracle, fixture or AT moves on it, and case C's
substantive ruling is byte-identical across v0.8 → v1.1.

## Properties

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
