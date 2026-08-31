# Cross-Review: product-manager — PLAN (delta re-review, frozen round)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.2)
**Previous review:** `docs/pdlc-stats/CROSS-REVIEW-product-manager-PLAN-v3.md` (`REVIEWED-COMMIT: 8ed55ead`)
**Date:** 2026-08-31
**Iteration:** 4

## Overview

**Scope of this round.** Frozen delta re-review. The PLAN moved v1.1 → v1.2 in
`8ed55ead..HEAD` (58 insertions, 47 deletions) to address `CROSS-REVIEW-test-engineer-PLAN-v2.md`
(te F-01…F-05). Per the freeze, I re-read only the changed regions and asked two questions of each:
did this edit break something that worked, and does any load-bearing claim it lands contradict the
repository at HEAD? I did not re-litigate approved sections, and I did not open new product
questions.

**Changed regions.** Five, all local to the edit: (1) the changelog gains a v1.2 row; (2) the
Overview's standing-cost premise narrows `document-oracles.mjs`'s consumer set to
`documentOracles.test.js` alone; (3) T-09 gains a symbolic-link leg on the shipped seam and T-10's
`lstat`-not-`stat` conjunct gains a boundary-anchored matcher; (4) T-21, T-23 and T-24 take verbatim
transcriptions and the same consumer narrowing; (5) the File Ownership Manifest gains a `Batch(es)`
column so every `File` cell is a bare path. One further cell moved outside the te routing: T-08's
Status flipped `⬚` → `✅`.

**Answer.** The revision holds. No acceptance criterion is narrowed, dropped or reinterpreted; the
one net-new coverage claim (T-09's EC-19 leg) *adds* product fidelity rather than trading it. Every
repository claim the edit lands is true at HEAD — I checked all six by measurement, including the
T-08 status flip, which is a truthful ledger update and not a premature tick. No High findings.

## Verification

Each claim below was measured at HEAD, not read from a document.

| Claim landed by the edit | Measured | Verdict |
|---|---|---|
| `document-oracles.mjs` is **imported** only by `documentOracles.test.js`; `advisoryWaveGate.test.js` merely names it in a comment at `:140` | `grep -n document-oracles pdlc/workflows/__tests__/advisoryWaveGate.test.js` → one hit, line 140, inside a `//` comment; no import statement | **True.** The narrowing is more accurate than v1.1's "consumed only by … and …". |
| `bin/cli.mjs` at HEAD contains neither `statSync` nor `lstatSync`; its only `fs` predicate is `fs.existsSync` (`pdlc/engine/bin/cli.mjs:262`) | `grep -o "fs\.[a-zA-Z]*" pdlc/engine/bin/cli.mjs \| sort -u` → `fs.existsSync` only; the sole `statSync`-family hit in the file is that same line 262 | **True**, line anchor exact. This is what licenses T-10's whole-file, unqualified assertion. |
| The naive `source.includes("statSync")` matcher is unfalsifiable because `lstatSync` contains `statSync` | Substring containment; `/(?<![A-Za-z])statSync\s*\(/` rejects `lstatSync(` and accepts `statSync(` | **True.** The matcher is correctly boundary-anchored on the left, and `\s*\(` pins it to a call. |
| `assertAdditiveOnly`'s message is verbatim `` `${label}: delta over baseline must be exactly the two new members, got ${JSON.stringify(actual)}` `` | `pdlc/engine/__tests__/loop-distribution.test.js`, message string at line **77**; the `assert.equal` statement spans **74–78**; the function opens at 66 | **Quoted text exact**; the cited range `73-77` is off by one at both ends (F-03). |
| The second P9-02 test is titled "P9-02: the shipped c8 config resolves the two new lib/ modules too (F4)" at `coverageInstrumentation.test.js:278` | Line 278 is exactly that `test(` call; the driver `import()`s `loop-session.mjs` and `escalation-view.mjs` as the PLAN says | **True**, anchor exact; the transcription adds backticks the source string does not carry (F-02). |
| T-08 is `✅` Done | `statsAntiDrift.test.js` is tracked and landed in `e6bf3d36b` ("T-08 — 🔴 Anti-drift reds"); the status key at `PLAN-pdlc-stats.md:86` reads `✅ Done` | **True.** Only T-01 and T-08 carry `✅`, and both have artifacts on the branch. Not a premature tick. |
| Manifest `Batch(es)` values | Compared cell-by-cell against the task table's `Batch` column for all 27 tasks | **Consistent**, including T-12…T-16 at 3/4/5/6/7 and the batch-9/10/11 tail. |
| v1.2's changelog: "`CROSS-REVIEW-product-manager-PLAN-v2.md` filed no findings — `VERDICT: Approved`" | v2 file: "No findings." plus `VERDICT: Approved` / `{"high": 0, "medium": 0, "low": 0}` | **True.** |
| T-09's new leg is faithful to EC-19 | `FSPEC-pdlc-stats.md:580` — EC-19 requires "the size of the **link itself**, not of its target"; `:923` maps EC-19 → AT-15 | **Faithful.** The leg asserts the link's own size on the production path; no reinterpretation. |

## Findings

## Questions

## Positive Observations

## Recommendation
