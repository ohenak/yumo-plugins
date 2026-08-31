# Cross-Review: test-engineer — PLAN (round-2 delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 4 (delta re-review of PLAN v1.2, which addresses `CROSS-REVIEW-test-engineer-PLAN-v2.md` F-01…F-05)

## Overview

**What this round is.** My v3 was an upstream-cascade confirmation over byte-unchanged PLAN
content. This round is a real delta: `8ed55ead..HEAD` moves 58 insertions / 47 deletions across six
commits, five of them named for my v2 findings (te F-01…F-05) and one a version-header/changelog
commit. Frozen round, so the only question I answer is whether the revision broke something that
worked before, or asserts something the repository at HEAD contradicts. Improvements I would make
differently are recorded as `DEFERRED:`, not as findings.

**What changed.** Header `1.1 → 1.2` plus a v1.2 changelog paragraph; the Overview's standing-cost
premise sentence; T-08's status cell (`⬚ → ✅`); T-09's row (new symbolic-link leg); T-10's row
(boundary-anchored matcher, qualifier dropped); T-21's worked-exclusion clause; T-23's and T-24's
quoted strings; the File Ownership Manifest (new `Batch(es)` column plus a reading note); and two
rows of the anti-drift coverage table.

**Every claim the delta introduces is true at HEAD.** I re-measured all five rather than reading
them off the PLAN or the TSPEC:

| Delta claim | Measurement | Result |
|---|---|---|
| `bin/cli.mjs` contains neither `statSync` nor `lstatSync`; its only `fs` predicate is `fs.existsSync`, `pdlc/engine/bin/cli.mjs:262` | `grep -c 'statSync' pdlc/engine/bin/cli.mjs`; `grep -n 'fs\.[a-zA-Z]*'` | **0** `statSync` occurrences; exactly one `fs.` call site — `fs.existsSync(path.join(dir, ".git"))` at **`:262`**. Both halves exact |
| The naive substring matcher is unfalsifiable; the boundary-anchored one is not | `node -e` over the real file and over a `lstatSync(p)` sample | naive `includes("statSync")` is **true** on `lstatSync(p)`; `/(?<![A-Za-z])statSync\s*\(/` is **false** on it and matches HEAD's `cli.mjs` **zero** times. The matcher does what the row says it does |
| `document-oracles.mjs` is imported only by `documentOracles.test.js`; `advisoryWaveGate.test.js` merely names it in a comment, `:140` | `grep -rn document-oracles pdlc/ --include=*.js --include=*.mjs` | one `import` — `documentOracles.test.js:27`. `advisoryWaveGate.test.js:140` is a **comment** (`// same self-reference reason \`documentOracles.test.js\` and …`). `:140` is exact |
| `assertAdditiveOnly`'s message, transcribed verbatim | `grep -n 'delta over baseline'` | source reads `` `${label}: delta over baseline must be exactly the two new members, got ${JSON.stringify(actual)}` `` — the PLAN's quote is **character-exact** up to its `…` elision |
| P9-02's second test title, transcribed verbatim, `coverageInstrumentation.test.js:278` | `grep -n 'resolves the two new'` | `:278` — `test("P9-02: the shipped c8 config resolves the two new lib/ modules too (F4)"` — **exact**, and the line number is right |

The v2 round's diagnosis was that the prior transcription dropped the leading `the`. It is back.

**The one delta claim that is a genuine strengthening, not a correction.** te F-02's fix does more
than swap a matcher: the row now states *why* the matcher is normative ("a naive
`source.includes("statSync")` matches the *correct* `lstatSync` and so can never red — the conjunct
would be unfalsifiable"). That is the sentence an implementer needs, because the naive form is the
one a hurried hand writes and it passes forever. Adding the reason to the PLAN, not only the regex,
is what makes the fix survive a re-write. Same for the dropped `in the \`stats\` seam` qualifier —
the PLAN now justifies the whole-file scope from a measurement (`cli.mjs` has neither spelling at
HEAD), so the assertion needs no seam boundary anybody could argue about.

## Batches

## Dependencies

## Verification

## Delta-Confirmation Findings

## Verdict
