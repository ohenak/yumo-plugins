# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/PLAN-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 2
**Scope:** Local (two TSPEC errata re-emitted, unchanged in substance from the PLAN's own §9.1)

## Method

Delta re-review. `git diff 9cd44a8a..HEAD` over the PLAN (128 insertions, 54 deletions) was read in
full; every prior finding was re-measured against HEAD rather than against the PLAN's account of it;
only changed sections were scanned for new issues.

## Disposition of v1 findings

Every one re-measured at HEAD, not read off the revision.

| v1 | Severity | Status | Evidence re-measured this round |
|----|----------|--------|--------------------------------|
| F-01 | High | **Resolved** | T05 no longer transcribes a count. The row now reads the register, pins `FSPEC 11.3` / `TSPEC 1.7`, carries a non-vacuity floor (parsed register non-empty, size in the failure message), and states the one precondition that could red it — TSPEC §12.3 at 96 — with the halt-and-name-the-ids behaviour rather than a degradation to containment. My own enumeration of `AT-…` tokens over `FSPEC:2041-2191`, de-duplicated, returns **99**, matching the PLAN's measurement of record exactly. The residual red is now a *routed upstream defect* (§9.1 erratum 4/5), not a PLAN defect; I re-emit it as an ERRATUM below so the channel carries it |
| F-02 | High | **Resolved** | `AT-M11`, `AT-Q13`, `AT-R7` now appear **3 times each** in the PLAN (grep) against 0 at v1. AT-M11 lands in T20 in **both** halves — `markerVerdict` returns `free` on both register fixtures, and the pass-level half sits beside AT-M3 in the same block, which is the pairing `FSPEC:2084` explicitly asks for ("without the pair, an implementation recording `reclaimed-stale-lock` on every take passes this row"). Both halves in one file, so T05's one-file-per-id contract is undisturbed — the PLAN says so itself. AT-Q13 and AT-R7 move to T21 and the two stale **(no FSPEC AT)** labels are gone; I read `FSPEC:2126` and `:2106` and the PLAN's transcription of both *Given* sets and both *Then* sets is faithful, including AT-Q13's fixture (b) (single-occurrence, AC-2.3 standing-invariant) as the arm that defeats an unconditional recurrence list, and AT-R7's fixture (c) as the positive control against (a)/(b) |
| F-03 | Medium | **Resolved** | `parsePlanTasks` over the current file returns `T25.dependencies = ["T09","T13","T14","T19"]`. §6.1 records the edge and its reasoning, and separately records the T31 → T06/T20/T21/T22/T24 closure so the same re-derivation is not repeated. Batch numbers unchanged (T19 batch 3, T25 batch 4) |
| F-04 | Medium | **Resolved** | §1 now fixes a single `dist/` vocabulary — "third bundle", "five `dist/` files", "four manifest rows" — anchored to `runtimeBundle.test.js:26` (`BUNDLES`) and `:1584` (`ARTIFACTS = [...BUNDLES, "pdlc-cli.mjs"]`), both read at HEAD. §8.3's row now names the five files and the four manifest rows. Measured at HEAD: `git ls-files pdlc/workflows/dist/` returns four paths and the manifest carries three `id` rows, so three-bundles/five-files/four-rows after T32 is arithmetically right |
| F-05 | Medium | **Resolved** | (a) `git ls-files 'pdlc/workflows/__tests__/*.test.js' \| wc -l` = **83**, `ls … \| grep -c '^consolidation'` = **0** — both now stated with the command that produced them, and the PLAN correctly names the zero as the load-bearing half. (b) **34** tasks, **9** shipped-file editors (T07-T13, T32, T33), 34 − 9 = 25, which is what §1 now says. (c) **Sixteen** suites, and §8.1 now shows the arithmetic (5 + 5 + 3 + 1 + 1 + `consolidationReport`); §8.3's grep row and §10's risk row both say sixteen |
| F-06 | Medium | **Resolved** | The byte-identity claim is gone from §6.3(2) and §8.3, replaced by T04's two-arm block. Arm (a) is above-threshold and compares the `additionalContext` **text** against HEAD's hook *and* against the message transcribed from the shipped template; arm (b) requires the two hooks to **differ** and pins the edited hook's text to the transcribed message at the **new** `n`. The two arms sit in one block, so neither can pass vacuously. I re-read the hook: `THRESHOLD = 5` at `:25`, glob `:28`, early exit `:29-30`, predicate `:41`, `n >= THRESHOLD` `:43`, template `:44-46`, print `:47-48` — every citation in the new text is exact, including the `:44-46` the PLAN newly introduces |
| F-07 | Low | **Resolved** | The `mergeDoubles.js` row now carries six names and six lines in name order; `fakeSleep` is at `:258` (`export const fakeSleep = async () => {};`), between `FIXED_NOW_MS:256` and `fakeNow:259` |
| F-08 | Low | **Resolved** | T32 now says **three** of the four names are new to `devModule`'s export list. Verified: the list opens at `build-runtime.mjs:87`, carries `"resolveAdvisoryRung"` at `:101`, and carries none of `MERGE_GUARD_DEFAULTS` / `mergeCommandFor` / `gitWithLockRetry`; the queue prelude re-binds `resolveAdvisoryRung` at `:119`. §9.1 erratum 3 now states the `CLAUDE.md:62` error as **already false at HEAD**, which `git ls-files pdlc/workflows/dist/` confirms |
| F-09 | Low | **Resolved** | One count everywhere: §2 "**eight** tasks write (T02, then T25 … T31)", §4.2 "eight writers in total — T02's skeleton in §4.1 and the **seven** below". `grep 'nine tasks write'` returns nothing |

## Findings

One Low, new this round, in changed text. Nothing High or Medium remains open.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **T05's headline label still says the opposite of T05's own precondition.** The cell opens `🟢 **Traceability set-equality (green at authoring, no skip)**` and later states, correctly, that "this case is red until that erratum lands" and that a wave reaching it with TSPEC §12.3 at 96 must halt and name the three ids. Both statements are in the same cell. The body is the one a reader should act on, but the label is what a dispatcher's task summary and a skim both read first, and "green at authoring" is exactly the claim v1.0 was faulted for. Restate the label conditionally — e.g. `🟢 **… (no skip; green once §9.1 erratum 4 lands)**` — so the row's first six words and its precondition agree. Nothing else changes. | §4.1 T05 |

**Mechanical re-derivation, run rather than asserted.** Importing the four gate exports from
`pdlc/workflows/orchestrate-dev.js` and applying them to the current file: `parsePlanTasks` = **34**
tasks, `parsePlanOwnership` = **34** rows, `validatePlanContract` = `{"ok":true}`,
`computeTopologicalBatches` = **15** ready-sets, batch-column mismatches against
`max(batch of Deps) + 1` = **0** across all 34 rows, and same-batch file collisions across the §5
manifest = **0**. The T25 → T19 edge is present in the parsed graph. §6.1's newly added run block
reports precisely these numbers, so its figures are reproducible and not transcribed.

## Questions

| ID | Question |
|----|---------|
| Q-01 | v1's Q-02 is answered — §8.3's grep row now scopes itself to `consolidation*.test.js` and to the token `describe.skip(`, and carves out T04's `PY_BIN`-gated `test.skip` by name. One residue: the carve-out says the runtime skip's "non-vacuity is the counter row below", but the counter row asserts `executed ∈ {TABLE.length, 0}`, so a CI leg with no interpreter satisfies it at 0 and the whole L4 level can be green-because-nothing-ran on both legs at once without any row failing. Should the DoD carry a one-line record of which CI leg actually executed the differential rows (the `console.warn` is already emitted), so "0 on both legs" is visible rather than silent? |
| Q-02 | v1's Q-03 is unanswered — T00 still branches on `.claude/pdlc.config.json` presence, and CI's fresh clone always takes the absent arm, so the arm asserting `postWavePathspecs` / `postWaveCommand` never runs on either matrix leg. §2's whole "the `dist/` rebuild is a wave concern, not a task concern" rule rests on those two settings. Is a tracked fixture config, parsed through the same shipped parser at an injected root, not the stronger form? Not raised as a finding because the branch is a pre-flight existence gate rather than a behavioural oracle, but the asymmetry is worth a sentence in the row. |
| Q-03 | T04's fixture (a) is the *positive-identity* arm: ≥ 5 pending under `docs/*/` only, edited hook's `additionalContext` byte-equal to HEAD's. Edit (2) also rescopes the pending predicate to the two §3.2 regions, so identity holds only if the fixture's `.consolidation-log.md` is written so the rescoping does not move `n`. That is constructible and the PLAN's intent is unambiguous, but the constraint is implicit. Worth one clause in the row ("the log fixture is written so edit (2) does not move `n` on (a) — the divergence that arm (b) owns"), so an implementer does not build a fixture on which correct code fails (a). |

## Positive Observations

- The two High findings were repaired at the **root**, not at the symptom. Rather than re-transcribing
  99 in place of 96, T05 was rebuilt to *read* the register, with a version pin (`FSPEC 11.3`,
  `TSPEC 1.7`) and a non-vacuity floor beside it — and the actual defect was pushed upstream as
  §9.1 errata 4 and 5 with the measurement that produced each. That is the correct direction of travel:
  the PLAN now fails legibly ("the register moved") instead of failing arbitrarily, and the upstream
  table gets fixed once instead of being worked around in every derived document.
- AT-M11's assignment is better than the minimum I asked for. I asked for an owning task; the revision
  split it into a pure half (`markerVerdict` returns `free` on **both** register fixtures, the older
  one being what defeats an implementation routing every non-`IN-PROGRESS:` file through the reclaim
  arm) and a pass-level half placed **in the same block as AT-M3**, which is the pairing `FSPEC:2084`
  names as the reason AT-M11 exists at all. The PLAN then notices, unprompted, that two halves in one
  file keeps T05's one-file-per-id contract intact.
- The `dist/` vocabulary section is the right shape for this class of defect. Instead of correcting the
  four wrong sentences, §1 declares one vocabulary ("third bundle", "five `dist/` files", "four
  manifest rows"), grounds it in the shipped distinction `runtimeBundle.test.js` already makes between
  `BUNDLES:26` and `ARTIFACTS:1584`, and says those are the only forms used below. The subsequent
  edits to §4.2, §6.2, §8.3, §9.1 and §10 are then mechanical, and a future reader can check the whole
  document against one definition rather than against arithmetic done five times.
- §6.1's new run block converts §6's numbers from assertions into a reproducible measurement, and
  volunteers the parser fact that produced this round's own regression — a raw `|` in a description
  cell shifts every column to its right, turning the `Deps` cell into the `Batch` cell and reporting a
  phantom cycle. Recording the failure mode beside the numbers is worth more than the numbers.
- The `_listFiles` hazard was restated rather than re-cited. Rather than swapping one DC id for
  another, the revision states the hazard in full — `fakeListFiles` returns whatever the fixture hands
  it while shipped `rtListFiles` pipes `ls -p -A` through `grep -v '/$'` (`:915`) and rejects any line
  with a separator (`:929-931`), so a directory walk greens under the double and finds zero feature
  subdirectories in production — and explains why no id is cited (this repo's DC-07 at
  `DOMAIN-CONSTRAINTS.md:184` is unrelated; the header caveat at `:11-16` records the cross-repo
  numbering collision). A constraint the reader can check beats a pointer they cannot.
- The hook no-regression repair is a textbook conversion of an absence-only oracle: the vacuous arm is
  kept (identity) but forced above threshold and paired with a transcribed expected value, and a second
  arm requires the widening to actually change `n`. Both arms in one block, with the failure mode of
  each named — "an implementation that widened nothing fails (b), and one that broke the message fails
  (a)".

## Recommendation

**Approved with minor changes**

All nine v1 findings are resolved, each verified by re-measurement at HEAD rather than by reading the
revision's account of itself. The two Highs are closed at the root: T05 reads the register instead of
transcribing a count and carries a version pin plus a non-vacuity floor, and the three orphaned
register ids are assigned with their FSPEC *Given*/*Then* transcribed faithfully. The gate functions
re-run clean (34 / 34 / `{ok:true}` / 15 batches / 0 batch mismatches / 0 same-batch file collisions),
so the T25 → T19 edge cost nothing.

The single Low is a label that contradicts its own cell (F-01) and needs one clause. It does not gate
approval.

**Two upstream defects remain open and are re-emitted as errata**, not folded into this verdict —
they are the PLAN's own §9.1 errata 4 and 5, and they are the reason T05 is red on an unrepaired
TSPEC. The PLAN's handling of them is correct (raise, cover locally, refuse to weaken the oracle to
containment); routing is the orchestrator's.

## Verdict

VERDICT: Approved with minor changes

APPROVAL-HASH: sha256:6f58b4ede3bcb91d4ece30763feea5f27864206107aede499f7d1e653ed7a997
REVIEWED-COMMIT: 1682227ba623a9c01c0842a79b985b223c5c1d67
