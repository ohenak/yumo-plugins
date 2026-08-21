# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 8 (delta re-review of PROPERTIES v0.4 → v0.5; frozen round)

## Overview

**What I reviewed.** The delta `a12b20f9..HEAD` on
`PROPERTIES-pdlc-learnings-injection.md` (v0.4 → v0.5, four commits: `21edb7c5`, `91aeb6bb`,
`4cb84db5`, `7ac7fe8b`). Two changed places, and only two: the header's upstream row (PLAN pin
re-worded, version cell 0.4 → 0.5) and §C.4's *Reconciliation* block, which is rewritten wholesale —
the fourteen-row inventory, the "which task ids stand behind them" paragraph, the re-red paragraph,
the P-A-6 spend paragraph, and the closing "no property names a file the PLAN does not create"
paragraph. Nothing else in the document moved: `git diff --stat` shows the PROPERTIES file plus the
two v7 cross-reviews and nothing more. §G.3, all ten property groups, §O.1–§O.9, §F.1–§F.4 and
§C.1–§C.3 are byte-identical to the text I approved against.

**My two v7 findings.**

- **F-01 (High)** — §C.4's stale "seven of fourteen" measurement. **Resolved, and resolved the way
  Q-01 asked.** The table is now declared "a **snapshot, not a live claim**", pinned to commit
  `21edb7c5`, and each row carries the commit that added the file. I re-ran the measurement:
  `git ls-tree -r --name-only 21edb7c5 pdlc/workflows/__tests__` returns all twelve
  `learnings*.test.js` suites, `helpers/learningsFixtures.js` and the four files under
  `fixtures/learnings-baseline/` — fourteen of fourteen, as the table now says. All fourteen
  `Added by` shas check out against `git log --diff-filter=A -1 21edb7c5 -- <path>`: `1920f281`,
  `cdeb1509`, `688a5651`, `07af8f52`, `1544fdbd`, `5e522a52`, `b79b7859`, `4a6c1816`, `2fe07964`,
  `c3e723e5`, `eb32d7d2`, `100e3d9c`, `960c229c`, `4a6c1816` — every one exact, no transposition.
  The three dependent statements are all repaired: the `not yet created` cells are gone;
  `learningsConfig.test.js` is now cited as landed at `eb32d7d2` with its three LI-AT-30 cases at
  `:226`, `:242`, `:258` (verified — the third is the `maxBytesPerDocument: 0` case asserting
  `RSN-NO-MATERIAL` set-equality over non-self paths); and the ledger consequence is re-derived from
  **case B**, correctly, with case A explicitly declared unreachable.
- **F-02 (Low, Process)** — the "re-measured at HEAD" banner applied sentence-by-sentence. Resolved:
  the banner is replaced by a pinned-snapshot framing and the whole paragraph is re-run against one
  commit rather than patched in place.

**What the revision broke.** Nothing load-bearing. Every new factual claim in §C.4 that I could
check against the repository checks out, with three exceptions, all inside the delta and none of them
High: one bookkeeping inconsistency between §C.4 and §G.3 (F-01, Medium) and two overstatements in
the "none of the four is present in the landed suite" enumeration (F-02, F-03, Low) that do not
change the conclusion they support.

**Verification method.** `git diff a12b20f9..HEAD` on the document and `--stat` over `docs/`;
`git ls-tree -r 21edb7c5` and per-file `git log --diff-filter=A`; `git log | grep -oE 'LI-[0-9]+'`
for the task-id universe; `git log -S'/.baseline-worktree/' -- .gitignore` and `sed -n 13p
.gitignore`; direct read of `learningsBlock.test.js` (147 lines, 7,739 bytes) and
`learningsConfig.test.js:220–275`; `grep -n 'P-A-6\|P-A-7'` and the 0.6/0.7 changelog rows of PLAN.

## Properties

No property's **claim** text changed in this delta — Groups A–J are byte-identical. What changed is
§C.4's account of *where in the run* four of them stand, so what I checked is whether each of those
four is still genuinely owed at HEAD and whether the new scheduling story is true.

- **Still owed, all four, verified against the landed suite.** `learningsBlock.test.js` at HEAD is
  147 lines / 7,739 bytes (PROP-BOUND-03's "landed, 7.6 K" is right) and carries a single
  `describe("LI-17: block/material suite (LI-AT-05, LI-AT-11, LI-AT-12)")` at `:38` — exactly as
  §C.4 now quotes. Checking each owed case rather than trusting the paragraph:
  - **PROP-BOUND-03's zero case** — no `extractInjectableMaterial(text, 0)` call exists; the three
    calls are at `:87` (bound `100000`), `:113` (bound `40`) and `:133` (bound `66`). Owed. ✔
  - **PROP-BOUND-05** — the property requires the section list be recovered from
    `renderLearningsBlock`'s **output** via `SECTION_HEADING_RE` with `sections[]` demoted to a
    supporting equality. The landed suite asserts `expect(result.sections).toEqual([…])` (`:118`,
    `:139`) — the producer's own report only; `SECTION_HEADING_RE` appears nowhere in the file. Owed. ✔
  - **PROP-BOUND-07** — the property's teeth are the *framing* literal stated beside the material
    literal so the two are proved to differ (mutation M-5). The file mentions framing only in a
    comment (`:10`, `:56`); no framing byte literal is asserted. Owed. ✔
  - **PROP-BOUND-08** — the real-corpus arm needs a live `LEARNINGS_CORPUS_ARGV` / `git ls-files`
    read. Neither symbol occurs in the file. Owed. ✔
- **The scheduling story is true.** LI-08 landed at `5e522a52`, LI-16 at `d462ddd8`, LI-17 at
  `2cbacada`, LI-21 at `92b7ea0c` — all four subjects confirmed by `git log -1`. So the suite is
  landed *and greened*, case A ("before batch 7") is unreachable and case B is live, exactly as §C.4
  now says. P-A-6's window is likewise correctly described as **spent**: PLAN:590 reads "commit at
  the first point the suite is green, which in practice is after LI-21 (batch 13)", and LI-21 is
  behind us. The two mechanisms are still kept distinct (P-A-7 case B governs the amendment against
  the landed implementation suite, P-A-6 governs this document's own suite), which was the v6 F-03
  distinction — it survives the rewrite intact.
- **Task-id universe.** "`LI-01…LI-21 and LI-23`, `LI-22` the only id with no commit" is exact:
  `git log --format=%s | grep -oE 'LI-[0-9]+' | sort -u` returns precisely that set. LI-22's row is
  the 🔵 REFACTOR-and-close task whose artifact is a full-suite green run plus the human cross-check
  of LI-23's arm inventory and which creates no file (PLAN:162) — the document's characterisation is
  verbatim-faithful. LI-04's `.gitignore` claim also holds: `git log -S'/.baseline-worktree/' --
  .gitignore` names `ae2af1da` as the adding commit and `.gitignore:13` is `/.baseline-worktree/`
  today.
- **Counts unmoved.** `grep -o 'PROP-[A-Z]*-[0-9]*' | sort -u | wc -l` → **70**, matching the header
  and §C.4's summary table; §C.1 (35/35), §C.2 and §C.3 (23/23 tasks) are untouched by the delta and
  still reconcile.

One supporting sentence of the new text overstates the absence it claims — see F-02 — but it does not
reach any property's status: all four remain owed on grounds I verified independently above.

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
