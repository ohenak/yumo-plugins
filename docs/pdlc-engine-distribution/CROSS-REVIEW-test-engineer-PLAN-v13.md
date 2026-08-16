# Cross-Review: test-engineer — PLAN (delta re-review, round 13)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.18)
**Date:** 2026-08-16
**Iteration:** 13

**Scope:** Delta re-review, v0.17 → v0.18. Decision freeze in force: a finding blocks only if the delta broke something that worked, or if a load-bearing claim is false against the repository at HEAD. Not a whole-document re-review.

## 1. What changed

Last reviewed at `9fb555dd` (v0.17). Four commits since; `git diff -U1 9fb555dd..HEAD -- {plan}` reports **seven hunks**, in five regions:

| Hunk | Change | Class |
|---|---|---|
| `:12` | version cell 0.17 → 0.18 | header |
| `:26` (v0.9 row) | edited-cell list restored to four cells, both commits named per-commit | changelog |
| `:30` (v0.13 row) | `4 516 pass` date-stamped in place, re-measured total quoted | changelog |
| `:34` (v0.17 row) | records its own re-correction as reverted | changelog |
| `:35` | new v0.18 row | changelog |
| `:502` (DoD 2) | absolute total demoted from oracle to date-stamped context | DoD |
| `:506`, `:508` (DoD 4) | both residue lists labelled coalesced, omitted ranges named | DoD |
| `:530` (DoD 17) | `§5.1` gloss narrowed to the DoD section | DoD |

**No task-table cell of any kind is edited** — verified: every hunk lies outside the §2 task-table span (`:176`–`:408`), outside §2.1 and outside §3's ownership manifest. The v0.18 row's own byte-unchanged claim is therefore true as stated, and no batch, dependency edge, `Test File`/`Source File` cell or ownership row moved. The batch-DAG and same-new-file checks I ran in earlier rounds stand undisturbed.

## 2. Prior findings (v12) at HEAD

| ID | Finding | Status |
|---|---|---|
| F-01 (High) | v0.17 narrowed v0.9's correct four-cell scope list into a false three-cell one | **Resolved** — see §3(a) |
| F-02 (Low) | DoD item 4's `publish-preflight.mjs` residue list read as a full enumeration but was a coalesced subset | **Resolved** — see §3(d) |

Both PM/TE round-12 deferrals that the round chose to discharge (the `4 516 pass` date-stamp, the `§5.1` gloss) are also landed and verified below. No prior finding is re-opened by the delta.

## 3. Delta claims re-derived at HEAD

**(a) The v0.9 scope restoration is exactly what git shows — v12 F-01 discharged.** `git log --oneline 59ccddb5..b754075f -- {plan}` lists eight commits, and `b2d160d1` ("docs(plan): attribute AT-3.8a literal removal to FSPEC v0.3 in all three places (PM round-6 F-04)") sits inside that window and edits T16's Description, as v0.9's own item (f) says. T16 carries `b2d160d1`'s text at HEAD: `PLAN:191` reads "**FSPEC v0.3's erratum round removed the stale literal**", matching `b2d160d1:{plan}`'s T16 row and not its predecessor's. The v0.9 row now names four cells (T16's, T59's and T50's Descriptions, T01's Status) with both editing commits attributed to their windows, and the v0.17 row records its re-correction as reverted rather than leaving a silent third state. The load-bearing property is restored: a reader who trusts the scope clause in order to skip diffing §2 is now trusting a complete list.

**(b) DoD item 2's re-measured figures reproduce digit-for-digit.** `cd pdlc/workflows && npm test` at HEAD: `Test Suites: 1 failed, 118 passed, 119 total` / `Tests: 1 failed, 70 skipped, 4524 passed, 4595 total`, the single failure being `documentOracles.test.js:246` (`expect(coveredViolations(LIVE_ROOT)).toEqual([])`, reddened by this checkout's untracked trees). Every element of the item's new sentence checks out — the count of suites, the pass/fail/skip triple, the date stamp, and the named failing anchor. More importantly the item now states the *conclusion* as the oracle ("exactly one test fails, no other suite is red, the failing path names an untracked file") and demotes the absolute total to date-stamped context. That is the right shape: the total moves as legs land, which is precisely how `4 516` went stale, whereas the conclusion is stable under added legs and is what a re-runner can actually falsify.

**(c) DoD item 17's `§5.1` narrowing is true in both directions.** Inside the DoD section the only other `§5.1` citation is item 14's (`:524`, "still FSPEC §5.1's set-equality"), so "every other `§5.1` citation in this DoD section means FSPEC §5.1" holds. Outside it the counter-example the gloss now admits is real: T02 at `:177` cites "§5.1's `name`", and TSPEC `:201` is `### 5.1 Manifest changes` — a TSPEC reference, not FSPEC. The over-generalised wording is gone and what replaced it is checkable.

**(d) DoD item 4's figures and labelling — v12 F-02 discharged.** `cd pdlc/engine && npm test -- --experimental-test-coverage` at HEAD reproduces all eight branch figures unchanged: `bin/cli.mjs` 85.98, `lib/provenance.mjs` 100, `lib/resolve-version.mjs` 97.14, `lib/store.mjs` 94.44, `scripts/postinstall.mjs` 100, `scripts/prepack.mjs` 91.67, `scripts/publish-preflight.mjs` 88.61, `scripts/fixture-machine.mjs` 88.57 — so "every branch figure was re-checked and none moved" is accurate. Function coverage likewise: `fixture-machine` 40.74, `publish-preflight` 63.33, and the remaining six at 88.24 (cli) to 100, which is what "both measures" rests on. Both residue lists are now labelled as principal/coalesced rather than presented as full enumerations, which was the whole of my v12 F-02.

## 4. Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **The "also reports" ranges added to item 4 are themselves coalesced, and three of them are not additional.** The runner emits, for `fixture-machine.mjs`: `53 290-293 297-304 387-393 395-397 399-401 403-405 437-456 467-508 510-512 524-545 553-595 598-631 641-655 677-732 735-746 748-818 824-825 829-830`. The item's parenthetical says the run "also reports `53`, `387-405`, `553-595`, `598-631`, `641-655`, `735-746`, `824-830`" — but `387-405` and `824-830` are coalescences of four and two finer ranges respectively, and `553-595`, `598-631` and `735-746` already sit *inside* the declared principal ranges `524-631` and `677-818`, so they are not additions to that list. Same shape for `publish-preflight.mjs`: `301-311` coalesces the runner's `301-303 305-307 309-311`. The preceding clause does say the lists are "coalesced from the runner's finer list rather than quoted in full", which covers this honestly, and no conclusion in the item depends on the boundaries — the driver-residue argument is unaffected. It is worth a pass only because this is the one item whose subject is stating an enumeration exactly. *Fix (optional):* either quote the runner's list verbatim, or drop the three ranges already subsumed by the principal ones and say "finer ranges within the above, plus `53`". | `PLAN:506`, `PLAN:508` (DoD item 4) |

No High. No Medium. Nothing the delta touched broke a claim that held at v0.17, and every load-bearing figure the delta introduced reproduces at HEAD.

## 5. Questions

None.

## 6. Positive Observations

- **The v0.9 correction was re-derived per-commit rather than re-argued.** The row now carries the method (`git log --oneline 59ccddb5..b754075f -- {plan}`), the deciding commit (`b2d160d1`), the reason it is in-window (it *is* v0.9's own item (f)), and the HEAD anchor that proves T16 still carries its text (`PLAN:191`). That is a claim a future reviewer can falsify in one command, which is exactly the property whose absence produced the round-10 slip in the first place.
- **The v0.17 row records its own reversal instead of being silently rewritten.** A changelog that quietly repairs a wrong entry teaches readers that its rows are not evidence. Keeping the wrong claim, marking it reverted, and naming the version that reverted it keeps the changelog readable forward — and this is the third round in a row where that discipline is what made the defect findable.
- **DoD item 2 now distinguishes oracle from context, which is the general fix, not the local one.** Replacing "confirm the count is otherwise `4 516 pass / 1 fail`" with "confirm exactly one test fails, no other suite is red, and the failing path names an untracked file" makes the item survive every future leg landing. The stale absolute is date-stamped rather than deleted, so the record of *why* it was wrong stays. Applying v0.14(a)'s precedent to the workflows half closes the asymmetry between the two halves.
- **The residue lists were re-measured, not re-asserted.** Eleven figures across two runs reproduce exactly, and the item states the labelling convention it uses. My v12 F-02 asked for one of two remedies and got the cheaper one applied consistently to both lists rather than to the one I named.

## 7. Deferred observations (recorded, not blocking)

DEFERRED: Quote item 4's coverage residue verbatim from the runner, or drop the ranges already subsumed by the principal list (this round's F-01).
DEFERRED: Reconcile v0.13's manifest check as "59 rows / 61 distinct paths" (v11 F-02, v12 §7).
DEFERRED: Date-stamp v0.14's `1..747` / `806 pass` engine-side pair, per the precedent v0.18(b) has now set for the workflows half.
DEFERRED: T09's ignore-direction notice text asserted against a re-derived `message(id, params)` call in `plugin-root-notice.test.js` (v10 F-02, implementation-side).
DEFERRED: No counter covers the deletion gap the skipped-block convention opens; item 17's per-file `# pass` floors name the instrument, and the follow-on stays unscheduled under the freeze (v9/v10/v11/v12, carried by v0.18 as PM F-04).
DEFERRED: The durable fix for `pdlc/workflows`' untracked-stray false red — one shared ignore list rather than per-oracle defences — remains a `pdlc/workflows` concern outside this feature.

## 8. Summary

The round closed my one High. The v0.9 scope clause is back to the four cells git shows, with both editing commits attributed to their own windows and the HEAD anchor that settles it, and v0.17's wrong narrowing is recorded as reverted rather than erased. My Low is closed too: both residue lists now say they are coalesced. The two carried PM deferrals landed with them — item 2 no longer quotes a stale absolute as its recipe, and item 17's `§5.1` gloss is scoped to the section where it is true, with the TSPEC counter-example outside it verified at `PLAN:177` / `TSPEC:201`.

Everything the delta asserts reproduces at HEAD: 4524 passed / 1 failed / 70 skipped across 119 suites with the failure at `documentOracles.test.js:246`, and all eight branch plus two function coverage figures digit-identical. No task-table cell, no batch, no dependency edge, no ownership row and no §2.1 set-equality moved, so the mechanical checks from prior rounds stand. One Low remains, on the boundaries of an enumeration whose conclusion does not depend on them.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
