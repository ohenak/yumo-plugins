# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.4)
**Date:** 2026-08-13
**Iteration:** 4
**Scope:** Delta re-review. Testing lens only. Round-3 F-01, F-02 and Q-01, Q-02 checked
for resolution; only changed sections scanned for new defects. Sections approved in
rounds 1–3 are not re-reviewed.

## Method

`git diff` from the commit I reviewed at v3 (`c91c0a4e`) to HEAD: nine commits touching the
PLAN — DoD items 14/15, T50, T59, T58, §5.1 and DoD item 2's floors, §2.1's `iff` rule, §4's
T05 note, §1.2's withdrawn skippability argument, and the v0.4 changelog. Every claim below
was re-measured at HEAD, not read off the document.

- **The `skipSink` precedent T50 now cites as fail-closed.** Re-verified all four cited
  anchors: `skipSinkTeardown.js:18` calls `validateSkipRecords(records, SKIP_INVENTORY)` and
  `:29-33` **throws** on any violation; `validateSkipRecords` is at `skipSink.js:120` and is a
  pure `(records, inventory)` function; `KNOWN_CAPABILITY_KEYS` is the closed four-key set at
  `skipSink.js:55` (`bash`, `git`, `hash`, `uid-nonroot`); `SKIP_INVENTORY` is the frozen
  `{name, capability, unverifiedInvariants}` array at `driftCapabilities.js:93`. The plan's
  description of the precedent now matches the precedent.
- **The comparator's testability precedent.** `driftHelpers.test.js:120-183` already unit-tests
  `validateSkipRecords` as a pure function over hand-built records — the shape T59 says it
  copies (well-formed inventory, off-inventory record, unregistered name, unknown capability,
  duplicate, empty invariant list). T59's clause is a transcription of an existing pattern, not
  an invention.
- **The two new floors.** Ran the runner myself: `node --test __tests__/ci-arrangement.test.js`
  → `# tests 6`, `# pass 6`; `node --test __tests__/seam-contract.test.js` → `# tests 12`,
  `# pass 12`. Both match §5.1 and DoD item 2 exactly. All five extended-file floors are now
  present and all five are the runner's own numbers.
- **DoD item 4's coverage seam.** `pdlc/engine/__tests__/_run-suite.mjs:13-17` documents in the
  file's own header that unrecognised argv is forwarded in node-option position, so
  `npm test -- --experimental-test-coverage` is a hermetic coverage run — the claim item 4
  leans on holds at HEAD.
- **Batch arithmetic** (`Batch = max(batch of deps) + 1`) re-derived over all 59 rows: **zero
  mismatches**, no cycle, no duplicate id, histogram 1:4, 2:25, 3:7, 4:6, 5:5, 6:2, 7:2, 8:1,
  9:2, 10:2, 11:3 = 59 — identical to rounds 2 and 3. §6 Rule 1's spelled-out cases all check.
- **Same-batch same-file collisions:** none over 61 distinct paths in §3 (the only repeats are
  a task listing one file in both its `Test File` and `Source File` cells).
- **§2 ↔ §2.1 transpose:** re-derived the transpose of §2's trailing citation lists and diffed
  against §2.1's 35 rows. **Zero disagreements**, exactly as §2.1 now claims — the only
  residues are the two `AC-` tokens §2.1 documents as deliberate (`AC-1.5` on T31/T52) and a
  parenthetical qualifier in one cell (`T50 (second leg)`), neither of which is an `AT-` id.
  Round 3's T31/AT-3.8a asymmetry is gone.
- **Erratum re-check:** `AT-7.2` still occurs exactly once in FSPEC, at `FSPEC:289`, and §8
  still does not enumerate it.

## Round-3 findings

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
