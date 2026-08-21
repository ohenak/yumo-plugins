# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md (v1.2)
**Date:** 2026-08-21
**Iteration:** 14 (delta confirmation — erratum round)

## Overview

**What this round is.** A delta confirmation, not a re-read. I approved this PLAN at v0.5/v0.6/v0.7
and confirmed v0.8, v0.9 and v1.1. Since the bytes I confirmed at round 13 (v1.1) the document has
moved to **v1.2** across three commits (`8105144a`, `a4a2516d`, `95098af5`), measured as **36
insertions / 5 deletions in one file**. I re-derived the scope from `git diff aa5f0378..HEAD`, not
from the changelog's account of itself: one new subsection (**§Post-batch remediation (CODE_REVIEW
v1)**), one sentence appended to §The arithmetic, P-A-7's case C cell, the version cell, two
changelog rows re-pinned and one row added.

**The four routed items, checked against HEAD rather than against the edit's own claims.**

1. **Case C's commit pins — resolved, and verified reachable.** `git merge-base --is-ancestor`
   confirms `e7fa8d87` (LI-21), `be2456c8` (LI-16) and `a4998e13` (LI-17) are all ancestors of HEAD
   and that `92b7ea0c`, `d462ddd8` and `2cbacada` resolve to nothing on this branch. The v0.8 and
   v1.1 changelog rows were re-pinned with the case C cell, which is the right call: those rows
   assert what is landed *at HEAD*, so an unresolvable pin falsifies the claim rather than dating it.
2. **Case C recorded as discharged — resolved, and I reproduced the measurement.**
   `npm test -- __tests__/learningsBlock.test.js __tests__/learningsSelect.test.js` in
   `pdlc/workflows` reports **2 suites passed, 26 passed / 26 total**, with no skipped count emitted
   (0 skips). The cell's "unexercised, not waived" framing for the failure limb is the right
   distinction and is what my lens wanted: it records an outcome without retiring the rule.
3. **The four unowned `2fc6fcd3` remediation files — recorded, but the enumeration behind them is
   wrong.** All four rows are present and correct. The claim they sit under — that `2fc6fcd3`
   "touched six test-side surfaces" — is not. See F-01.
4. **The two P-A-5 second-owner rows — recorded, and correctly attributed to LI-06 (batch 4).** The
   rows are right; they are two of the eight ladder-owned surfaces that commit rewrote. See F-01.

**The structural decision in the new subsection is sound, and I want to say so before the finding.**
Carrying a **landing commit** instead of an `Owner` cell, and keeping the two dispatcher-parsed
tables byte-unchanged, is the correct resolution of the tension between P-A-5's recording duty and
the dispatcher's parse of `Owner` as a task id. Scoping §The arithmetic to the two parsed tables
explicitly closes the count reconciliation the same way. Neither invents a new contract.

**Result: two High, two Low.** One High is this delta's own (`delta`/`local`) — the new subsection
records six of roughly seventeen surfaces `2fc6fcd3` touched and states the count as complete. One
is inherited and untouched by this edit (`inherited`/`nonlocal`) — the PLAN's coverage story for
`pdlc/workflows/package.json` was falsified at HEAD by that same commit and still reads as if it
were not. Neither is a reason to unwind anything this edit did.

## Batches

**No task row moved, and I measured that rather than accepted it.** The diff touches four hunks: the
version cell, the new §Post-batch remediation subsection plus the arithmetic sentence, P-A-7's case
C cell, and three changelog rows. Not one `|` cell inside either dispatcher-parsed task table is on
either side of the diff, so every `LI-*` row keeps its `Batch`, `Deps`, file-ownership and `Status`
cells byte-for-byte. The `[Fake first]` labelling on LI-02, LI-06 and LI-23 and the red-before-green
pairing are unchanged. The batch-DAG derivation cannot have been perturbed by an edit that touched
no dependency edge.

**The expected-red ledger — my lens's primary gate input — is byte-identical.** Batches 7–13 are
untouched: batch 7's seven whole-suite reds, batch 8's `learningsSelect` narrowed to `LI-AT-15`,
batch 9's `learningsBlock` dropped entire, batch 11's `learningsRecord` narrowed to `LI-AT-22`'s
locus-2 assertion, batch 12's `learningsDispatchSet` narrowed to `LI-AT-23`/`LI-AT-24`/`LI-AT-31`,
and batch 13's **nothing**. Case C's re-pinning changes which commits the prose names, not which
rows the ledger carries; the ledger stays empty at 13 and after, which is exactly what case C says.

**The single-writer premise: the argument is valid, the enumeration it runs over is not.** The
subsection's defence — `2fc6fcd3` is one serial commit landing after batch 13, no batch in flight,
no concurrent agent holding either file, so no batch ever holds two writers — is the right argument,
and it is *preserved rather than excepted*, as the text says. It also generalises: it holds for every
file that commit touched, not only the two named. That is precisely why recording only two of them
understates the amendment. `git show --name-status 2fc6fcd3` reports **thirteen** files under
`pdlc/workflows/__tests__/` (excluding the regenerated baseline `.txt` fixtures), of which **six are
ladder-owned suites given a second write** and recorded nowhere:

| File | Ladder owner | Batch | Recorded in §Post-batch remediation? |
|---|---|---|---|
| `__tests__/learningsCaptureScript.test.js` | LI-03 | 2 | no |
| `__tests__/learningsSelect.test.js` | LI-07 | 3 | no |
| `__tests__/learningsCorpus.test.js` | LI-09 | 3 | no |
| `__tests__/learningsDispatchSet.test.js` | LI-11 | 5 | no |
| `__tests__/learningsConfig.test.js` | LI-12 | 5 | no |
| `__tests__/learningsArmInventory.test.js` | LI-23 | 5 | no |
| `__tests__/learningsBaselineGuard.test.js` | LI-06 | 4 | **yes** |
| `__tests__/fixtures/learnings-baseline/**` | LI-06 | 4 | **yes** |

`__tests__/coverageInstrumentation.test.js` was also modified; it is a pre-existing repo suite that
no LI task owns, so it needs no manifest row, but it is a seventh test-side surface the count of
"six" does not admit. A fifth **new** unowned test file exists as well —
`pdlc/engine/__tests__/learnings-config-example.test.js`, added by the same commit — and it carries
no row in any table. It is also the file that makes the changelog's "eighteen `learnings*` files
tracked at `09c7c62f`" arithmetic come out: `pdlc/workflows/__tests__/` holds **seventeen**, and the
eighteenth is this engine-side file the manifest does not mention. The count is right only by
including a file the amendment omits. This is F-01.

On the production side the same commit modified `orchestrate-dev.js` (LI-15…LI-22), `.gitignore`
(LI-04), `scripts/capture-learnings-baseline.mjs` (LI-05) and `pdlc/workflows/package.json` — four
more ladder-owned or explicitly-disclaimed surfaces the "six test-side surfaces" framing leaves
outside its scope. The last of those is F-02.

## Dependencies

**Upstream re-read at the versions this dispatch pins (DEC-ERR-03), not at the versions the PLAN
names.** The dispatch pins REQ `32cb8b7d`, FSPEC `ef230199`, TSPEC `1ddfdbc3`, DECISIONS `87ec8ebc`;
on disk those are REQ **v0.10**, FSPEC **v0.14**, TSPEC v0.9, DECISIONS **v0.5**. This PLAN's header
still pins *"TSPEC (v0.9); FSPEC (v0.13); REQ (v0.9); DECISIONS (v0.3)"* — three of four stale. I
carried this as Low at round 13 and it is still Low, because I re-checked the substance the PLAN
actually leans on and none of it moved under the PLAN's feet:

- **REQ v0.10's AC-2.4 erratum** makes report attribution *cause-defined*: a document cut by AC-2.2's
  count bound is reported under that cause even when the total bound also binds. FSPEC v0.14 states
  the same at BR-6 (lines 521–527: documents past the window carry `RSN-COUNT` whatever the window's
  byte outcome). The PLAN's fail-open arm table maps *count bound ⇒ `RSN-COUNT`* to **AT-08, AT-13**
  and `COUNT-BINDING`, owned LI-07 / LI-16 — AT-13 is exactly the AT FSPEC v0.14 routes AC-2.4
  through, so the mapping is a faithful compression of the *new* text, not a survival of the old.
  Nothing to fix beyond the pin.
- **E-36 / AT-30's three zero-threshold cases** are unchanged at FSPEC v0.14 (AC-4.4 → BR-5, BR-14 →
  AT-30; E-36 still exercised by AT-30 beside the other two). LI-12's three-case row and its
  three-conjunct oracle — key present with empty BR-8 rows, `rejected[]` set-equal to every
  enumerated non-self path at `RSN-NO-MATERIAL`, **no** document carrying `RSN-COUNT` — still
  compresses it exactly, including the fixture precondition (corpus > `maxDocuments`) that keeps
  conjunct (iii) non-vacuous.
- **FSPEC F-O-1's two heading rules**, which case C's production-half argument rests on, are
  unchanged, and I confirmed the shipped `canonicalSectionName` behaviour the cell describes.
- **DECISIONS v0.5** re-pins itself on FSPEC v0.14 / REQ v0.10 and records that v0.14's window
  restatement and AC-2.4's attribution clause leave the byte-accounting basis, `E-36` and `AT-30`
  untouched — the same conclusion I reached independently above.

So the stale header pins are a pin refresh (F-03), not a cascade: no citation in this PLAN says
something upstream no longer says. The one place a version number is quoted **inside** prose —
LI-12's *"FSPEC v0.13's AT-30"* and the `RSN-NO-MATERIAL` row's *"BR-9/D-12 as FSPEC v0.13 restates
them"* — names a superseded revision for text that is substantively unchanged at v0.14, so it reads
as a dated citation rather than a false one; folded into F-03.

**P-A-6 → P-A-7 routing, and PROPERTIES §C.4.** Case C's cell now ends by naming PROPERTIES §C.4 as
recording the same discharge, and PROPERTIES v0.8's header confirms it: it re-pins every commit
anchor to `09c7c62f`, reverses its seven `learningsBlock.test.js` absence claims, and records P-A-7
case C **discharged green** rather than pending. The two documents agree at HEAD, which is what
round 13's F-03 routing needed. PROPERTIES' header also records the four unowned remediation files
as its **§G.2 gap 5** and routes them to this PLAN — the routing landed, but only partially, which is
F-01 again seen from the other end: PROPERTIES names four, the true set is five new files plus six
un-recorded second writes.

## Verification

Everything below is a measurement I ran, not a claim I read.

**1. Commit reachability (item 1).** `git merge-base --is-ancestor <sha> HEAD` for each pin:
`e7fa8d87` LI-21 **reachable**, `be2456c8` LI-16 **reachable**, `a4998e13` LI-17 **reachable**;
`92b7ea0c`, `d462ddd8`, `2cbacada` **resolve to nothing on this branch**. The re-pin is correct and
the pre-rebase triple is genuinely unresolvable, so removing it was owed, not cosmetic.

**2. Case C's green (item 4).** In `pdlc/workflows`,
`npm test -- __tests__/learningsBlock.test.js __tests__/learningsSelect.test.js` →
`Test Suites: 2 passed, 2 total` / `Tests: 26 passed, 26 total`, no skipped count emitted. The
cell's "26 passed, 26 total … `test.skip`/`describe.skip` count of 0" reproduces exactly. (Note for
anyone re-measuring: a bare `npx jest` fails both suites on `Cannot use import statement outside a
module` — the ESM flag lives in the package's `test` script, so the cell's `npm test -- …` form is
the one that measures anything. That is the PLAN's own form, correctly stated.)

**3. `2fc6fcd3`'s surfaces (items 2 and 3).** `git show --name-status 2fc6fcd3`: **13** files under
`pdlc/workflows/__tests__/` beyond the regenerated baseline `.txt` fixtures — 4 added, 9 modified —
plus `pdlc/engine/__tests__/learnings-config-example.test.js` added, plus production-side
`orchestrate-dev.js`, `.gitignore`, `package.json`, `scripts/capture-learnings-baseline.mjs` and
`dist/pdlc-cli.mjs`. The four new unowned files the amendment names are exactly right and the two
second-owner rows are correctly attributed to LI-06 at batch 4. "Six test-side surfaces" is not.
`git ls-tree -r --name-only 09c7c62f` confirms **seventeen** `learnings*` files under
`pdlc/workflows/__tests__/`, eighteen only if the engine-side file is counted. F-01.

**4. The coverage gate, re-run against the doc (F-02).** This is the check my lens owes on every
coverage claim: verify the **gate command**, never the prose. `pdlc/workflows/package.json` at HEAD
carries

```json
"include": ["**/pdlc/workflows/orchestrate-dev.js", "**/pdlc/workflows/orchestrate-queue.js",
            "**/pdlc/workflows/build-runtime.mjs", "**/scripts/capture-learnings-baseline.mjs"],
"allow-external": true,
"exclude": ["**/.tmp-capture-driver-*/**", "**/.baseline-worktree/**", "**/pdlc-capture-entrypoint-*/**"]
```

`git show 2fc6fcd3 -- pdlc/workflows/package.json` shows that block being written by the very commit
this erratum exists to record. The PLAN still says, in two places:

- §Overview change-surface table: *"`pdlc/workflows/package.json` | exists; `c8.include` is exactly
  `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs` | **no task** — the capture
  script's coverage disposition is an explicit exemption"*;
- §File-ownership manifest: *"`pdlc/workflows/package.json` — **not** modified: …deliberately left
  outside `c8.include`… The exemption, its justification and the two named oracles that stand in for
  a coverage floor are recorded in §Verification DoD 11"*.

Both limbs are false at HEAD. The file **was** modified, the include set is four `**/`-anchored
entries rather than three bare basenames, `allow-external: true` is now in force (which the shipped
`//c8` note itself records as having silently dropped the other three modules out of the report when
it was first added — a real false-green this branch already hit), and the capture script is now
**inside** the per-file floor the PLAN says it is exempt from. DoD 11's stage-2 table names three
modules; the shipped gate measures four. A DoD verifier reading this PLAN would check an exemption
that no longer exists and would not check the floor that now applies to LI-05's script.

This is `inherited` — the stale text predates this round's bytes and the erratum did not touch it —
and `nonlocal`, since it sits in §Overview / §Production and generated rather than in the new
subsection. It is High because it is a coverage-floor claim contradicted by the gate command, which
is the specific failure mode DC-09 exists to catch; it routes back to the owning phase rather than
halting this one.

**5. What did not move.** Batch ladder, `Deps` edges, AT partition, fixture list, expected-red ledger
for batches 7–13, `[Fake first]` labelling, DoD clauses 1–14: all byte-identical across
`aa5f0378..HEAD`. The changelog's v1.2 row claims exactly that and the claim holds against the diff.

## Recommendation

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
