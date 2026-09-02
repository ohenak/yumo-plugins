# MUTATION-EVIDENCE-pdlc-stats

**Task:** T-26. **Runs (authors no test file):** `pdlc/workflows/__tests__/statsMetrics.test.js`
(T-04/T-13), `pdlc/workflows/__tests__/statsRealPaths.test.js` (T-18). **Depends on:** T-18, T-19,
T-21 — mutants are measured against the post-co-change tree (T-21's `prepack.mjs` vendoring entry,
`learningsPremises.test.js`, `pdlc/README.md`), not a pre-co-change snapshot.

Method: for each of TSPEC §6.6's four named mutants, the mutant was applied by hand to
`pdlc/workflows/lib/stats.mjs`, the relevant suite was run, the killing test was confirmed red for
the predicted reason, and the mutant was reverted before moving to the next. A `git diff` on
`pdlc/workflows/lib/stats.mjs` and `pdlc/workflows/orchestrate-dev.js` was confirmed empty after
each revert and again after all four mutants, so this document's own commit carries no production
diff. All four mutants were killed — no surviving mutant, no blocking remediation required.

## Result table

| # | Mutant (TSPEC §6.6) | Site | Named killing test | Suite | Result |
|---|---|---|---|---|---|
| 1 | Drop `- 1` from `deriveDodRoundIndex(...) - 1` | `computeDodRounds`, `lib/stats.mjs` | AT-11: `docs/completed/pdlc-loop-economics/` — DoD rounds is 2, the highest version minus one, not a count | `statsRealPaths.test.js` | Killed |
| 2 | Drop `- 1` from `deriveRoundWindow(...).startIndex - 1` | `computeReviewRounds`, `lib/stats.mjs` | AT-09 (`pdlc-advisory-wave-gate`, round 6) **and** AT-10 (`pdlc-headless-engine`, round 13) | `statsRealPaths.test.js` | Killed |
| 3 | Swap `unmeasurable` before/after `harvested` | `computeReviewRounds`, `lib/stats.mjs` | "dedicated fixture: a round-1 collision plus a LEARNINGS sibling stays unmeasurable, never harvested" | `statsMetrics.test.js` | Killed |
| 4 | Swap BR-16's harvested test before/after BR-15's zero-denominator test | `computeByteRatio`, `lib/stats.mjs` | "AT-17 (directory 3 of 4): LEARNINGS with neither family present reads harvested, not unavailable (also TSPEC §6.6's harvested/zero-denominator order mutant fixture)" | `statsMetrics.test.js` | Killed |

## Per-mutant detail

### 1 — `deriveDodRoundIndex(...) - 1`

Mutated `computeDodRounds` to read `parsers.deriveDodRoundIndex(basenames, feature)` directly
(dropping the `- 1`). Ran `statsRealPaths.test.js` filtered to `AT-11`:

```
Expected: {"rounds": 2, "state": "measured"}
Received: {"rounds": 3, "state": "measured"}
```

Off-by-one in the predicted direction (`2` → `3`), against the real
`docs/completed/pdlc-loop-economics/` archive. AT-11 is the row TSPEC §6.6 names for this mutant.
No other test in either suite went red. Reverted; `git diff` empty.

### 2 — `deriveRoundWindow(...).startIndex - 1`

Mutated `computeReviewRounds` to read `rounds: w.startIndex` (dropping the `- 1`). Ran
`statsRealPaths.test.js` filtered to `AT-09|AT-10`:

```
AT-09 (pdlc-advisory-wave-gate): Expected rounds 6, Received rounds 7
AT-10 (pdlc-headless-engine):    Expected rounds 13, Received rounds 14
```

Both real-path fixtures TSPEC §6.6 names for this mutant went red for the predicted off-by-one.
Reverted; `git diff` empty.

### 3 — swap `unmeasurable`/`harvested` order

`computeReviewRounds`'s branch chain is:

```js
if (!w.ok) { … "unmeasurable" … }
else if (w.startIndex !== 1) { … "measured" … }
else if (harvested) { … "harvested" … }
else { … "measured", rounds: 0 … }
```

The minimal branch-order swap that disagrees with the original **only** on the configuration TSPEC
names — a round-1 collision (`!w.ok`) co-occurring with the feature-level `harvested` flag — adds a
`harvested && !w.ok` arm ahead of the `!w.ok` arm:

```js
if (harvested && !w.ok) { … "harvested" … }   // MUTANT
else if (!w.ok) { … "unmeasurable" … }
else if (w.startIndex !== 1) { … "measured" … }
else if (harvested) { … "harvested" … }
else { … "measured", rounds: 0 … }
```

(An earlier, coarser attempt that hoisted a bare `if (harvested)` to the top of the chain also
killed the mutant, but over-killed: it additionally reordered `harvested` ahead of the
`startIndex !== 1` ("measured", multi-round) branch, turning AT-09's fixture leg red too — a
disagreement TSPEC §6.6 does not claim exists. The `harvested && !w.ok` form above is the swap
TSPEC actually describes: it changes outcomes on exactly the collision-plus-`harvested`
configuration and nothing else.)

Ran `statsMetrics.test.js` in full: exactly one test failed —
"dedicated fixture: a round-1 collision plus a LEARNINGS sibling stays unmeasurable, never
harvested" — with the predicted flip (`state: "unmeasurable"` expected, `"harvested"` received,
`collidingRole: "software-engineer"` expected, `null` received). AT-25 (round-1 collision alone, no
`LEARNINGS` sibling) and AT-09 (harvested alone, no collision) both stayed green, confirming this
fixture is the only one on which the two orders disagree, per TSPEC §6.6's own claim. Reverted;
`git diff` empty.

### 4 — swap BR-16's harvested test / BR-15's zero-denominator test

`computeByteRatio` originally checks `harvested` (BR-16) before `specBytes === 0` (BR-15). Mutated
to check `specBytes === 0` first:

```js
if (specBytes === 0) { … "unavailable" … }        // MUTANT: moved ahead
if (harvested && (crossReviews.length === 0 || dodReviews.length === 0)) { … "harvested" … }
```

Ran `statsMetrics.test.js` in full: all four AT-17 legs went red (directories 1–4 of 4), each
expecting `state: "harvested"` but receiving `state: "unavailable"` (zero spec bytes in every
AT-17 fixture). TSPEC §6.6 names "AT-17's third" leg specifically — directory 3 of 4,
`LEARNINGS-{feature}.md` only, no cross-review or DoD family present — and that test's own title
carries the citation: "AT-17 (directory 3 of 4): LEARNINGS with neither family present reads
harvested, not unavailable (also TSPEC §6.6's harvested/zero-denominator order mutant fixture)".
Reverted; `git diff` empty.

## Verification

- `git diff pdlc/workflows/lib/stats.mjs pdlc/workflows/orchestrate-dev.js` — empty, confirmed
  after each individual revert and once more after all four mutants.
- `statsMetrics.test.js` and `statsRealPaths.test.js` run directly at baseline (no mutant applied):
  28/28 passing, 0 failed, 0 skipped, both suites exit 0.
- No mutant survived; no remediation dispatch to T-04 or T-18 was required.
