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

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
