# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 11 (delta re-review under DECISION FREEZE — v0.6 → v0.7, the PLAN v0.8 cascade absorption)

## Overview

**What this round is.** A delta re-review under DECISION FREEZE of the revision that answers my v10
confirmation. My v10 was an upstream-cascade confirmation that did **not** approve: PLAN had moved
v0.7 → v0.8 (two-case P-A-7 table → three cases, new **case C** live at HEAD) and PROPERTIES still
asserted case B was live, still listed the two case-B gaps as open, and still pinned PLAN v0.7. This
revision is exactly that absorption and nothing else.

**Scope of the delta.** `git diff 23adb5e5..HEAD` on the document is **67 insertions / 32 deletions**
across three commits — `33c93eb6` (header pin), `b49143a9` (§C.4), `a469ef4b` (§G.3) — touching
three regions only: the header's Upstream row and version cell (line 11, line 18: `0.6` → `0.7`),
§C.4's re-red paragraph plus two new paragraphs, and §G.3's routed-errata list. No property
statement, level, owning task, AT partition, bound, enum, oracle, fixture row or count is inside any
hunk. Per the delta protocol I re-verified my five prior findings and scanned only these regions.

**Answer: all five of my v10 findings are resolved, and the revision breaks nothing.** F-01 (High)
is resolved substantively, not cosmetically: §C.4 now re-derives the obligation under case C, carries
the green-at-landing rule, the empty ledger and the fix-before-batch-14 gate consequence, and
extends the same rule to the Group D `learningsSelect.test.js` amendments. F-02 and F-03 (Medium)
are resolved — §G.3 reads "**Still open — one item**" with both case-B items struck into *Also
answered — by PLAN v0.6/v0.7/v0.8*, and the header pins **v0.8** with the three-case structure.
F-04 (Low) is resolved by a new paragraph that names PROP-BOUND-03's zero case as the one arm not
obviously green and cites case C's fix rule as its cover. F-05 (Low) is resolved incidentally, as
predicted, by the strike of the bullet that carried the paraphrase.

**Verification method — repository, not documents.** `git diff 23adb5e5..HEAD` on PROPERTIES;
exact-substring comparison of every quotation the revision adds against `PLAN-…md` at HEAD
(`:492`, `:493`, `:495–:506`, `:594`, `:610`); `git diff f73046ad..HEAD` on PLAN filtered for
`P-A-6` (0 hits — the "byte-unchanged at v0.8" claim is measured, not asserted);
`git show 21edb7c5:pdlc/workflows/__tests__/learningsBlock.test.js` grepped for
`extractInjectableMaterial(` and `sections).toEqual`; `git log -1` on each of `1544fdbd`,
`d462ddd8`, `2cbacada`, `92b7ea0c`; `shasum -a 256` over all five upstream documents;
`ls pdlc/workflows/__tests__/learnings*.test.js`.

**Upstream pins at HEAD, all five verified this round.** REQ `ff605dd3…`, FSPEC `ae75fa62…`,
TSPEC `22dee8ce…`, DECISIONS `56617f5a…` — byte-identical to what v9/v10 recorded, so no second
cascade is open. PLAN is `sha256:281c60c0…`, version cell `| pdlc | Draft | Claude | 0.8 |`
(`PLAN-…md:18`), which is exactly what the revised header now pins. PROPERTIES itself is
`sha256:e9de08bc…` at `a469ef4b`.

**Freeze discipline.** I record two wording observations as `DEFERRED` lines rather than findings:
neither is a defect this delta introduced nor a contradiction with HEAD, and neither would block.

## Properties

**No property statement moved, and I measured that rather than trusting the commit messages.** The
three hunks of `git diff 23adb5e5..HEAD` are the header (lines 8–18), §C.4 (`:1107`–`:1173`) and
§G.3 (`:1290`–`:1337`). §C.1's 35-of-35 table, §C.2, §C.3's 23-of-23 task reconciliation, and all
seventy `PROP-` statements with their levels and owning tasks lie outside every hunk, so the trace I
approved at v9 stands untouched: every task PLAN's table lists still has PROPERTIES coverage, and
every property still names an owning task and a test file that exists or is planned. I re-listed the
suite directory to confirm the file half at HEAD — all twelve `learnings*.test.js` files §C.4 and
§F.1 name exist (`learningsArmInventory`, `learningsBaselineGuard`, `learningsBlock`,
`learningsCaptureScript`, `learningsConfig`, `learningsCorpus`, `learningsDispatchSet`,
`learningsPredicatePin`, `learningsPremises`, `learningsRecord`, `learningsSelect`,
`learningsSuiteMap`), and none of the properties this revision discusses names a file the PLAN does
not create.

**F-01 (High) — resolved, and resolved with the right premise.** §C.4 now reads "of PLAN's
**three**-case table at v0.8, **case C is the live case** and cases A and B are both behind us",
scopes case B to *"after LI-17 has greened the suite, with a greening batch still ahead (batch 9
through batch 12)"* and case C to *"after batch 13, the case that is live at HEAD"*. Both quotations
are verbatim against `PLAN-…md:492` and `:493`. It then carries the obligation my v10 said was
missing, in PLAN's own words: *"under case C they owe no ledger row, and they owe green"*
(`PLAN-…md:493`, exact match), plus the consequence — a red *"has found a real defect, not staged a
TDD red"*, the fix is owed **before batch 14 runs**, and a red surviving into batch 14 is a gate
failure. The sentence I flagged as carrying the wrong case name now reads "**P-A-7 case C** governs
the amendment commits against the landed *implementation* suites `learningsBlock.test.js` and
`learningsSelect.test.js` — empty ledger, green at landing — while **P-A-6** (byte-unchanged at
v0.8) governs this document's own PROPERTIES suite". The parenthetical is a checkable claim and it
checks: `git diff f73046ad..HEAD` on PLAN contains **zero** lines matching `P-A-6`, so the P-A-6 row
(`PLAN-…md:594`, "commit at the first point the suite is green, which in practice is after LI-21
(batch 13)") is byte-identical across the v0.7 → v0.8 move.

**F-04 (Low) — resolved by a new paragraph that is more than I asked for, and every claim in it is
measured.** "Which of the four is actually green at landing, and what covers the one that may not
be" splits the four correctly:

- **PROP-BOUND-05/07/08 assert shipped behaviour.** The paragraph quotes PLAN's premise
  (`canonicalSectionName` strips an optional ordinal via `SECTION_HEADING_RE`, strips a trailing
  gloss, compares case-sensitively against `BR6_SECTION_NAMES`, returns null for `###`) verbatim
  against `PLAN-…md:493`, and — importantly — does **not** stop at the quotation: it corroborates
  from this document's own landed-suite evidence, the un-numbered `## Cross-Feature Patterns`
  spelling already accepted with `expect(result.sections).toEqual(["Cross-Feature Patterns"])`. I
  re-measured that at the pinned commit: `git show 21edb7c5:pdlc/workflows/__tests__/learningsBlock.test.js`
  carries that exact assertion at line 118 (and again at 139), over the fixture
  `"## Cross-Feature Patterns\n\n" + "a".repeat(100)` at line 110. The claim is true at the pin.
- **PROP-BOUND-03's zero case is named as the arm that may red**, on the stated ground that no
  `extractInjectableMaterial(text, 0)` call exists in the landed suite. Also measured: at `21edb7c5`
  the only three call sites pass `100000` (`:87`), and the two `maxBytes` bindings (`:113`, `:133`),
  which §C.4 elsewhere pins as `40` and `66`. There is no zero call. The document's inference — the
  zero-bound production half (LI-16, `d462ddd8`, a real commit) has never been exercised through this
  seam — follows, and case C's fix-before-batch-14 rule is correctly named as its cover instead of a
  ledger row.

**The Group D extension is new text and it is faithful.** "PLAN's case C extends its ruling to *"any
other amendment to a landed suite arriving from here on"*" is verbatim at `PLAN-…md:493`, and that
sentence does name the Group D `learningsSelect.test.js` amendments alongside the four
`learningsBlock` cases. `LI-07, 1544fdbd` resolves to a real commit ("LI-07 — [red] RED selection
suite (L1, TSPEC §T.5)"). No property changed as a result — the extension moves scheduling, not
content, which is the conclusion §C.4 has held since v0.3 and still reaches.

## Oracles

## Fixtures

## Questions

## Positive Observations

## Recommendation

## Verdict
