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

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
