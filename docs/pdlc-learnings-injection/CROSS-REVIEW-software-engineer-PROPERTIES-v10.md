# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 10 (upstream-cascade confirmation — PROPERTIES bytes unchanged; PLAN moved v0.7 → v0.8)

## Overview

**What this round is.** An upstream-cascade confirmation, not a re-review. The bytes of
`PROPERTIES-pdlc-learnings-injection.md` have not moved since my v9 approval —
`shasum -a 256` still returns `3e9fdf8b…`, matching v9's `APPROVAL-HASH`, and
`git log -1 --format=%H` on the file is still `23adb5e5`, matching v9's `REVIEWED-COMMIT`.
What moved is **PLAN**. My v9 approval recorded `UPSTREAM-STATE: PLAN sha256:b9fbd3ea…`
(commit `f73046ad`, PLAN v0.7); PLAN at HEAD is `sha256:281c60c0…` (commit `be64a0c6`, **v0.8**).
The one question I answer: is this PROPERTIES still a faithful compression of PLAN as it now stands?

**Answer: no, in three places, one of them load-bearing.** The other four upstream pins
(REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…`) are byte-identical to
the ones v9 recorded, so REQ/FSPEC/TSPEC/DECISIONS fidelity is untouched and I did not re-open it.

**The delta.** `git diff f73046ad..be64a0c6` on PLAN is **10 insertions / 5 deletions**, all inside
*Amendment commits on landed suites (P-A-7)* plus the version cell and one changelog row:

1. The version cell: `0.7 / 2026-08-20` → **`0.8 / 2026-08-21`**.
2. **Case A** gains a derivation of its "before batch 7" window (batches 2–6 carry no ledger at all;
   their red reason is the earlier one). Its ruling — no row — is unchanged.
3. **Case B is re-scoped.** Its trigger column now reads "after LI-17 has greened the suite, **with a
   greening batch still ahead** (batch 9 through batch 12)", and its span is annotated "well-formed
   only while a greening batch remains ahead, which is why case C exists".
4. **New case C**, and it is the case PLAN says is live at HEAD: "after batch 13, the case that is
   live at HEAD … **None — and the amendment is expected to land green.**" It states in terms that
   *"Case B's span therefore has no terminus here and does not apply"*, replaces the span with batch
   14's unqualified gate, and closes by naming **this document's own routed re-reds** —
   "the PROPERTIES-driven re-reds §C.4 of PROPERTIES routes to this PLAN (PROP-BOUND-03's
   `maxBytesPerDocument <= 0` case, PROP-BOUND-05/07/08, and the Group D amendments to the landed
   `learningsSelect.test.js`): under case C they owe no ledger row, and **they owe green**".
5. The fixture-consumer paragraph scopes its "no row of their own" ruling to this follow-up commit
   and adds the case-C branch.
6. A v0.8 changelog row recording the erratum and stating it answers PM Q-02.

**Why that cascades here.** §C.4 and §G.3 of PROPERTIES do not merely mention P-A-7 — they lean on
its *shape*. §C.4 states, in the document's own words, that under "PLAN's two-case follow-up table …
**case B is the live case and case A is unreachable**", derives from case B's wording the two gaps it
routes, and never records a green-at-landing obligation. §G.3 carries both of those gaps under
**"Still open — three items"**. The header's upstream row pins PLAN "(v0.7 — … the *Amendment
commits on landed suites (P-A-7)* two-case table was added at **v0.6** and is unchanged at v0.7)".
Every one of those is a statement about upstream that upstream no longer makes: the table is not
two-case, case B is not live, and the two "still open" items are exactly what PLAN v0.8's changelog
records itself as answering. Under DEC-ERR-03 those are findings of this confirmation.

**Verification method.** `shasum -a 256` on PROPERTIES and on all five upstream documents;
`git rev-list` over PLAN's history with a per-commit `shasum` to locate the blob my v9 approval named
(`b9fbd3ea` → `f73046ad`); `git diff f73046ad..be64a0c6` on PLAN; exact-substring greps of PLAN's
case A/B/C rows and its v0.8 changelog row; `sed -n` over PROPERTIES §C.4 (`:1052–1167`) and §G.3
(`:1235–1305`) and its header row (`:11`); `git diff 23adb5e5..HEAD` over PROPERTIES (empty).
I re-verified no code claim this round: no code claim in the document is downstream of the PLAN edit.

## Properties

**No property statement is invalidated.** I re-read the ten groups' claim text against the PLAN
delta: nothing in the edit touches a level, an owning task, an AT partition, a bound, an enum, a
scale or a return type, and PLAN's own changelog says so explicitly ("no task moved batch, no `Deps`
edge changed, no AT partition, fixture or manifest row was touched, and the batches 7–13 ledger is
byte-identical"). I confirmed the second half independently: the diff's five hunks are the version
cell, the case A/B/C rows, the fixture-consumer paragraph and one changelog row — the batch ledger
tables are outside every hunk. So §C.1 (35/35), §C.2 and §C.3 (23/23 tasks) still reconcile against
the same PLAN task table, and the document's 70 `PROP-` ids still each have an owning task.

**What is invalidated is §C.4's account of *when and under what rule* four of them may land.**
Four properties — PROP-BOUND-03 (the `maxBytesPerDocument <= 0` case), PROP-BOUND-05, PROP-BOUND-07
and PROP-BOUND-08 — are, by §C.4's own measurement at `21edb7c5`, amendments to the **landed**
`learningsBlock.test.js`, and the Group D properties amend the landed `learningsSelect.test.js`.
That measurement is unchanged and still true. What changed is the rule that governs the commit
carrying them:

- **§C.4 says case B governs.** Verbatim: "under PLAN's two-case follow-up table … case B is the
  live case and case A is unreachable", and it derives the two gaps it routes from case B's wording
  ("the named row covers `LI-AT-11`'s heading-form cases only … its span ends at 'the batch that
  greens them', which no remaining batch is").
- **PLAN v0.8 says case B does not apply.** Case B's trigger is now bounded to "batch 9 through
  batch 12", and case C states of the post-batch-13 world: "Case B's span therefore has no terminus
  here and does not apply." HEAD is post-batch-13 — LI-21 is landed at `92b7ea0c`, which §C.4 itself
  measured and which case C names.
- **PLAN v0.8 places a new obligation on exactly these four properties, and the document does not
  carry it.** Case C names them by id and rules: "under case C they owe no ledger row, and **they owe
  green**." It goes further — "If such an amendment nonetheless lands **red**, it has found a real
  defect, not staged a TDD red: there is no later batch to name in a ledger row, so the fix commit is
  owed **before batch 14 runs**, and a red surviving into batch 14 is a gate failure."

That is a live, actionable scheduling instruction with a gate consequence, and PROPERTIES now states
its opposite premise. An author writing the PROPERTIES suite from this document would read §C.4 and
wait for PLAN to name ledger rows that PLAN has now ruled will never be written, or stage a red that
batch 14's unqualified gate fails. That is **F-01**, and it is the reason this confirmation does not
approve. The fix is a §C.4 rewrite of one paragraph — not a property change: re-attribute the four
to **case C**, state the green-at-landing obligation and the before-batch-14 fix rule, and keep the
conclusion §C.4 already reaches ("no property in this document changes either way"), which case C
independently confirms.

**Case C's green-at-landing premise is technically sound, and I checked it rather than inheriting
it.** PLAN grounds it on `canonicalSectionName` already shipping F-O-1's second rule. I re-measured
the same production surface I measured at v8/v9: `SECTION_HEADING_RE`'s `^##[ \t]+` anchor cannot
match a `###` line, `BR6_SECTION_NAMES` is compared case-sensitively, and the optional ordinal and
trailing gloss are stripped. So PROP-BOUND-05's and PROP-BOUND-07's heading-form arms should indeed
land green. **PROP-BOUND-03's zero case is the one I would not assume green** — §C.4's own
measurement is that no `extractInjectableMaterial(text, 0)` call exists in the landed suite, and
PLAN v0.7 named LI-16 the owner of TSPEC §D.5's zero-bound production half. Case C's rule handles
that cleanly (a red there is a real defect owed a fix before batch 14, not a ledger row), but the
document should say so rather than leave a reader to infer it — that is **F-04**, Low, and it is a
completeness point inside the same paragraph F-01 already reopens.

## Oracles

**No oracle moved, and none is downstream of the PLAN edit.** §O.1–§O.9, §G.1's obligation table and
§O.8's mutation ledger derive from FSPEC, TSPEC and DECISIONS — all four of those pins are
byte-identical to the ones my v9 approval recorded — so the oracle surface is untouched by this
cascade. I re-ran the three discipline checks anyway against the one thing the edit could plausibly
disturb, PLAN's ledger semantics, and all three hold:

- **No implementation echo.** PLAN's edit introduces no expected value and moves none. §G.2.2's
  hand-computed 40/66 derivation and the landed suite's "Hand-computed (never derived here)" label
  are outside the diff, and case C's premise sentence is a claim about production behaviour, not a
  value this document may assert.
- **No absence-only oracle is created.** Case C's ruling is "no ledger row", which is an *absence in
  PLAN's table*, not an absence-shaped assertion in a test. The one absence-shaped oracle nearby,
  PROP-BOUND-03's zero case, keeps its positive conjunct — the `{material: "", bounded: false,
  bytes: 0, sections: []}` return on the same path — unchanged.
- **Set-equality, not containment.** Untouched; the LI-AT-30 citations §C.4 carries are into
  `learningsConfig.test.js`, which the PLAN edit does not mention.

**I did verify case C's production-behaviour claim, because PROPERTIES will inherit it.** PLAN
asserts that F-O-1's second rule is already shipped, and the four owed heading-form arms therefore
assert shipped behaviour. At HEAD, `pdlc/workflows/orchestrate-dev.js:2242` is verbatim
`const SECTION_HEADING_RE = /^##[ \t]+(?:\d+\.[ \t]*)?(.*?)[ \t]*$/;` — `^##` followed by a required
`[ \t]+` cannot match a `###` line, since the third `#` is not whitespace, so the `###`-as-body case
is genuinely shipped. `canonicalSectionName` (`:2248–:2255`) tries an exact `BR6_SECTION_NAMES`
membership first (case-sensitive — `includes` on an array of strings, no folding anywhere), then
strips a trailing gloss from both sides via `GLOSS_RE` (`:2243`) and re-compares. So the un-numbered
and un-glossed spellings canonicalise and `## Process Findings` returns `null`. PLAN's premise is
correct as written, and the document may compress it without qualification.

**One oracle-adjacent consequence the rewrite must not lose.** §G.3's third "still open" item — the
TSPEC AT-15 suite-assignment mismatch — is **not** touched by the PLAN edit and remains genuinely
open: it is a TSPEC item, its subject is §T.5's suite table, and TSPEC's pin is unchanged. When
§G.3's header count drops from three to one, that bullet must survive verbatim. I flag this here
because the last time a bullet was struck from that list the surrounding sentence went untrue and had
to be re-labelled a round later — the document records that episode itself, in the same bullet.

## Fixtures

TBD

## Delta-Confirmation Findings

TBD

## Verdict

TBD
