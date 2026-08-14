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

| ID | Severity | Status | Evidence |
|----|----------|--------|----------|
| F-01 | High | **Resolved** | The skip channel is now fail-closed end to end, in exactly the four parts the finding asked for, and one it did not. (a) T50 ships a `SKIP_INVENTORY`-shaped frozen table in `scripts/fixture-machine.mjs`, one `{name, capability, unverifiedInvariants}` entry per gated leg, naming the `AT-` ids that leg alone observes (container leg → AT-2.5, two-repo leg → AT-2.3). (b) A pure comparator over `(recorded skips, inventory)` runs at end of run and **fails** the workflow on an unregistered skip, an unknown capability key, a duplicate name or an empty invariant list — so an unregistered skip is a red check, never a green one. (c) DoD item 14 makes the observation **positive**: on `ubuntu-latest` the recorded skip set is **empty** and the DoD cites that run's URL, which is a falsifiable assertion about what ran, not the absence-shaped "no failure reported". (d) A non-empty set must be a subset of the inventory and item 15's new skip-coverage obligation demands a dated evidence document covering **every** `AT-` id in each entry's unverified list. The capability predicate the finding said was missing is now stated and **opt-out** — `docker` (`docker version` exits 0), `real-spawn`, `npm-pack`, with an unprobeable capability a failure rather than a skip — so an all-skipped run cannot be the default. Item 14 says in as many words that a green check now means "ran", not "passed **or** never ran". |
| F-02 | Low | **Resolved** | §2.1's rule now holds unqualified. T31's AT-3.8a pointer moved out of the trailing citation list into body prose, and the rule gained the general form behind the fix: "a trailing list is a claim, body prose is a pointer." Re-derived the transpose independently — **zero** rows disagree, so the sanctioned-hit list the finding wanted removed is not merely documented away, it is unnecessary. |
| Q-01 | — | Answered | T59 names both seams explicitly: the recorder takes its spawn function as a parameter and the comparator takes its records and inventory as arguments. DoD item 4 records the consequence — the comparator's five branches are all reachable from T59's hermetic legs, so adding it to `fixture-machine.mjs` raises the covered surface rather than adding uncoverable lines beneath the 85% floor. |
| Q-02 | — | Answered | §1.2 names the durable home: `LEARNINGS-pdlc-engine-distribution.md` at Phase H, from which `consolidate-learnings` promotes a recurring item into `docs/_decisions/`. It also says plainly that no queue row exists today and this plan does not create one, which is the honest form of the answer. |

Both round-3 findings are resolved and both were re-verified by re-running the mechanical
check that produced them, not by reading the revision's prose. Nothing approved in rounds 1–3
was broken by this round's edits: the graph is byte-for-byte the same shape, the transpose is
still set-equal, and the three floors measured in round 2 are unchanged while two more were
added and measured.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
