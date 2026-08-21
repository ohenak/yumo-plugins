# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 9 (delta re-review of PROPERTIES v0.5 → v0.6; frozen round)

## Overview

**What I reviewed.** The delta `7ac7fe8b..HEAD` on
`PROPERTIES-pdlc-learnings-injection.md` (v0.5 → v0.6, two commits: `2769ce86`, `23adb5e5`).
`git diff --stat 7ac7fe8b..HEAD` over `docs/` shows exactly three files — this document plus the two
v8 cross-reviews — and the document's own diff is **32 insertions / 10 deletions in five hunks**: the
version cell (0.5 → 0.6), one LI-04 citation reword, the §C.4 heading-form / `maxBytes` enumeration,
the §C.4 P-A-6 quote, the §C.4 LI-AT-30 citation reword, and §G.3's "Still open" list. Nothing else
moved: `## Overview`'s premise table, all ten property groups (§P.A–§P.J), §O.1–§O.9, §F.1–§F.4,
§C.1–§C.3 and §G.1–§G.2 are byte-identical to the text I approved at v8.

**My three v8 findings — all three resolved, each in the form I asked for.**

- **F-01 (Medium, Process)** — §C.4 asserted a routing §G.3 did not carry. **Resolved.** §G.3's
  header now reads `**Still open — three items:**` and carries both P-A-7 case-B items as bullets
  ahead of the AT-15 item, each closing "Whether … is PLAN's call; this document routes the gap and
  decides nothing" — the DEC-ERR-01-compliant framing. The AT-15 bullet gained a parenthetical
  distinguishing the re-routed item from the two new ones. The §C.4 assertion and §G.3's list now
  agree, so the routing reaches an author from this document rather than only from my dispatch.
- **F-02 (Low, Local)** — the overstated un-numbered-`## Cross-Feature Patterns` absence.
  **Resolved, and narrowed exactly as proposed.** The clause now says the suite carries "none of
  `LI-AT-11`'s **variant** heading-form arms", enumerates the three that are genuinely absent, and
  states affirmatively that the un-numbered spelling *does* appear "as LI-AT-05's material and as
  LI-AT-12's fixture text, with `expect(result.sections).toEqual(["Cross-Feature Patterns"])` proving
  the matcher accepts it — so what is owed there is the variant fixture as a whole, not that
  spelling". I re-verified every half: `## Cross-Feature Patterns` at `learningsBlock.test.js:42`
  (inside the LI-AT-05 test, `:39–:66`) and `:110` / `:130` (inside the two LI-AT-12 tests), with the
  `toEqual(["Cross-Feature Patterns"])` assertions at `:118` / `:139`; the glossed
  `"Rejected Proposals (with rationale)"` at `:81` and no un-glossed variant anywhere;
  `grep -n '###'` over the file returns nothing; `Process Findings` does not occur.
- **F-03 (Low, Local)** — the "only `maxBytes` literals" claim. **Resolved.** The sentence now says
  "only ***binding*** `maxBytes` literals", names them by their source form (`const maxBytes = 40`,
  `const maxBytes = 66`) and names the third call explicitly as "a deliberately non-binding `100000`
  under the comment 'Unbounded: large enough that maxBytes never binds'". Verified at
  `learningsBlock.test.js:111`, `:131`, `:86–:87`; the comment text is an exact prefix of `:86`.

**What the revision broke.** Nothing. Every claim in the delta re-verifies against the repository,
with one exception that is a quotation-fidelity slip inside a §G.3 bullet, not a false claim (F-01,
Low). No property, oracle, level, fixture, count or trace moved: `grep -o 'PROP-[A-Z]*-[0-9]*' |
sort -u | wc -l` still returns **70**, matching the header and §C.4's summary table.

**Verification method.** `git diff 7ac7fe8b..HEAD` on the document and `--stat` over `docs/`;
`grep -n 'describe(\|test('`, `grep -n 'maxBytes\|100000\|Hand-computed\|Unbounded\|Rejected
Proposals\|Process Findings\|Cross-Feature Patterns\|toEqual'` and a `###` grep over
`pdlc/workflows/__tests__/learningsBlock.test.js`; `grep -n 'LI-AT-30'` over
`learningsConfig.test.js`; `sed -n '13p' .gitignore`; exact-substring greps of PLAN's P-A-6 answer
row and P-A-7 case-B row; `git log -1` on `2cbacada`, `d462ddd8`, `92b7ea0c`.

## Properties

No property text changed in this delta. Groups A–J, their claims, levels, owning tasks and mutation
rows are byte-identical to v0.5. What the delta touches is §C.4's account of *what the landed suite
already contains* — which is the evidence that four Group-B/D properties are still owed — plus §G.3's
routing of the two gaps that account exposes. So what I re-checked is whether the narrowed
enumeration still supports "all four owed", and it does, on grounds I re-measured rather than
inherited.

- **PROP-BOUND-03 (zero bound) — still owed.** No `extractInjectableMaterial(text, 0)` call exists in
  `learningsBlock.test.js`; the three calls pass `100000` (`:87`), `maxBytes = 40` (`:111`, used at
  `:113`) and `maxBytes = 66` (`:131`, used at `:133`). The delta's new "only *binding* literals"
  phrasing does not weaken this — the load-bearing half is the absence of the zero call, and it is
  unchanged and true.
- **PROP-BOUND-05 (section list from the rendered block) — still owed.** The landed suite recovers
  sections only from the producer's own report: `expect(result.sections).toEqual(BR6_SECTION_NAMES)`
  (`:90`) and `toEqual(["Cross-Feature Patterns"])` (`:118`, `:139`). `SECTION_HEADING_RE` occurs
  nowhere in the file. The delta's concession that the un-numbered spelling *does* appear does not
  touch this — appearing as fixture input is not the same as being re-derived from output, and the
  revised sentence says exactly that ("what is owed there is the variant fixture as a whole").
- **PROP-BOUND-07 (framing vs material literal) — still owed.** No framing byte literal is asserted;
  framing is mentioned only in comments (`:10`, `:56`).
- **PROP-BOUND-08 (real-corpus arm) — still owed.** Neither `LEARNINGS_CORPUS_ARGV` nor `git ls-files`
  occurs in the file.
- **The suite's shape is quoted correctly.** `learningsBlock.test.js:38` is verbatim
  `describe("LI-17: block/material suite (LI-AT-05, LI-AT-11, LI-AT-12)", () => {` — one `describe`,
  three AT ids — and the file's four `test(` titles (`:39`, `:67`, `:103`, `:121`) confirm the
  AT-05/AT-11/AT-12 partition §C.4 describes. The `:42` and `:110`/`:130` occurrences the delta now
  concedes fall inside the AT-05 test and the two AT-12 tests respectively, exactly as the new
  sentence attributes them.
- **The scheduling premise is unchanged and still true.** `2cbacada` is LI-17 (GREEN the renderer),
  `d462ddd8` is LI-16 (GREEN the pure selection core), `92b7ea0c` is LI-21 — all three confirmed by
  `git log -1`. Case A remains unreachable, case B live, P-A-6's window spent. The P-A-6 quote hunk
  is a *fidelity improvement*: PLAN's row reads verbatim "commit at the first point the suite is
  green, which in practice is after LI-21 (batch 13)", and the delta corrects the document's earlier
  "the first point it is green" to match it exactly.
- **Counts unmoved.** 70 distinct `PROP-` ids, matching the header and §C.4's summary table; §C.1
  (35/35) and §C.2/§C.3 (23/23 tasks) are outside the delta and still reconcile.

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
