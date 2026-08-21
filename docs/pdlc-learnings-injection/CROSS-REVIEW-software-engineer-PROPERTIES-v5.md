# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-20
**Iteration:** 5 (delta re-review of v0.3 against my v4 findings; base `0fb3380e` → HEAD)

## Overview

**Scope of this round.** My v4 did not approve: one High (F-01 — PROP-BOUND-03's `> 0` precondition and
§O.9's `maxBytes >= 1` generator domain took the route TSPEC v0.9 §T.5's T-O-6 row rejects in terms),
one Medium (F-02 — PROP-CONFIG-09 missing from §O.5's L3 table), and two Lows (F-03 PROP-BOUND-05's
catalogue-vs-intersection oracle, F-04 §C.4's eight-ids-against-seven-rows enumeration). The delta
`git diff 0fb3380e..HEAD` over PROPERTIES is +59/−31 across seven commits (`64a9940b`, `3f928d59`,
`e18fa70a`, `6cc87648`, `4c65a10f`, `a02e0e9d`, `48fd5ba5`) and lands in exactly six places: the version
row (0.2 → 0.3), PROP-BOUND-03, PROP-BOUND-05's oracle sentence, §O.5's table, §O.9's T-O-6 paragraph,
§C.4's landed-files paragraph, §G.1's T-O-6 row, and §G.2.1/§G.3. I re-read only those.

**All four of my v4 findings are resolved, and I verified each against the repository rather than
against the document's own account.**

- **F-01 (High) — resolved, and resolved in the direction upstream asked for.** PROP-BOUND-03 is now
  *stated over every non-negative `maxBytesPerDocument`, zero included*, with the carve-out written as a
  **positive four-field return** rather than an exclusion. I diffed the transcription against TSPEC
  §I.3's JSDoc at `TSPEC-pdlc-learnings-injection.md:579–581` — "`maxBytes <= 0` short-circuits BEFORE
  the cut and returns `{material: "", bounded: false, bytes: 0, sections: []}` for every `text` — no cut
  occurs, so `bounded` is false, and the caller drops the document `RSN-NO-MATERIAL` (E-36, §D.5)" — and
  the property's four conjuncts are byte-faithful to it, including the reason `bounded` is false (nothing
  was taken, so "bounded exactly when cut" holds rather than being excepted). §O.9's generator domain is
  restored to "every non-negative `maxBytes`, `0` included" and quotes TSPEC §T.5's instruction verbatim
  (`TSPEC:1511`: "State the zero conjunct, keep `0` in the domain"). §G.1's T-O-6 row is rewritten as a
  partition **by observable, not by input**, which is the honest form: the unit owns the return value
  across the whole domain, PROP-CONFIG-09 owns the reason id and the unconsumed slot. `AC-4.4`
  (`REQ:371`) and `E-36` (`FSPEC:775`) both exist as newly cited and both say what the property says they
  say.
- **F-02 (Medium) — resolved.** §O.5 reads "**Six** claims are placed at L3" and the table carries a
  `PROP-CONFIG-09` row; I counted the rows: DISPATCH-01/02/03, CONFIG-04/05, CONFIG-09, RECORD-07/10,
  FOOTPRINT-01…04, ISOLATE-01 = six. The row states the honest split my v4 asked for — only the
  run-level half is L3, the unit-level return is L1 and belongs to PROP-BOUND-03.
- **F-03 (Low) — resolved.** PROP-BOUND-05's oracle now asserts the **priority-ordered intersection** of
  `BR6_SECTION_NAMES` with the headings the fixture carries, "hand-transcribed for the fixture at hand
  rather than derived at runtime" — set-equality discipline preserved, implementation echo avoided.
- **F-04 (Low) — resolved.** §C.4 now separates files from tasks and explains the arithmetic ("eight ids
  against seven rows, because LI-04 owns none of the fourteen"); LI-04's artifact is confirmed at
  `.gitignore:13` (`/.baseline-worktree/`), landed in `ae2af1da`.

**Nothing in the delta broke anything I had approved.** The property count is unchanged: `grep -o
'PROP-[A-Z]*-[0-9]*' | sort -u | wc -l` returns **70**, matching §C.4:1056 and the header at :22. No
property is retracted, no fixture changes, no PLAN task moves, no AT id is added.

**One new Medium, in a section the delta rewrote.** §C.4's "tasks committed so far" list and its
`scripts/` sentence are stale at HEAD: **LI-05 has landed** (`ced75955`, `git ls-files scripts/` →
`scripts/capture-learnings-baseline.mjs`), so the repository *does* have a root-level `scripts/`
directory today and LI-05 is missing from the enumeration this round rewrote. That is a measured-fact
error in the document's own measured-fact section — see **F-01** below. It gates nothing: no property
names that file, and none of the fourteen manifest rows is affected.

**Method.** Read my v4; diffed `0fb3380e..HEAD`; verified each resolution against TSPEC/FSPEC/REQ/PLAN at
HEAD by grep and line cite; re-ran the property count; re-ran `git ls-files pdlc/workflows/__tests__`
and `git ls-files scripts/`; confirmed `learningsBlock.test.js` exists at 7.6 K as PROP-BOUND-03 claims.

## Properties

Only the two properties the delta touched are assessed.

### PROP-BOUND-03 — the zero conjunct is stated correctly, and it is genuinely falsifiable

The property (PROPERTIES:235–252) now carries two regimes in one body: at a **positive** bound, the
cut-and-flag conjuncts (contribution ≤ bound, `bounded: true` decided at the cut, character-safe
longest prefix); at `maxBytesPerDocument <= 0`, the four-field return. Three things make this the right
shape rather than a re-worded version of the old one:

1. **The conjunct is positive, not an absence claim.** `material === ""`, `bounded === false`,
   `bytes === 0`, `sections.length === 0` are four asserted values on a returned object, each of which
   an implementation can get wrong in a distinguishable way (returning `bounded: true` on an empty cut,
   returning the uncut material, throwing). My v4's objection was precisely that the old text called
   this "absence-shaped"; the new text names why it is not, and the naming is correct against
   `TSPEC:578–581`.
2. **The universal quantifier is retained where it bites** — "for every `text`, including one carrying
   all five priority sections". Without that clause the conjunct would be satisfiable by an
   implementation that returns the empty shape only when the input has no sections, which is
   PROP-BOUND-06's first disjunct wearing a disguise.
3. **The cost is stated and checkable.** "one added case in
   `pdlc/workflows/__tests__/learningsBlock.test.js` (landed, 7.6 K) under the **existing** LI-08 red /
   LI-17 green tasks — no new fixture, no new PLAN task, no new AT id, no new property id." Verified:
   the file is tracked at that size (`git ls-files` + `ls -l`), and PLAN:147 assigns
   `learningsBlock.test.js` to LI-08 with the v0.5 amendment note that landed suites are amended by
   their existing owners. The coverage line's added ids resolve: AC-4.4 at `REQ:371`, E-36 at
   `FSPEC:775`, TSPEC §I.3 at `TSPEC:557` (heading) / `:579` (the contract sentence).

The partition claim is the part I checked hardest, because a partition asserted is not a partition
achieved. It holds: PROP-BOUND-03's observables are the return fields of `extractInjectableMaterial`;
PROP-CONFIG-09's are the report-level `RSN-NO-MATERIAL` reason id, the contributing count and the
unconsumed `maxDocuments` slot. No observable appears in both, and every input of TSPEC §D.5 —
including `maxBytes = 0`, which was the hole in v0.2 — is now claimed by one of them.

### PROP-BOUND-05 — the intersection oracle closes the over-generalisation

The amended sentence (PROPERTIES:264–275) asserts equality against "the **priority-ordered
intersection** of `BR6_SECTION_NAMES` with the headings the fixture document actually carries,
hand-transcribed for the fixture at hand rather than derived at runtime". This is right on both axes I
care about: it is still a **set equality over an ordered list** (a deleted or reordered section reds,
containment would not have caught it), and the expected value is a literal transcription rather than a
value recomputed from the code under test. The AT-11-specific note — that on the all-five fixture the
intersection *is* the full catalogue, "TSPEC states it that way for AT-11" — keeps the previously
approved AT-11 expectation intact while removing the false universal.

PROP-CONFIG-09, PROP-BOUND-06, PROP-BOUND-07 and PROP-BOUND-08 are untouched by this delta and were
approved in my v4 on verified grounds; I did not re-litigate them.

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
