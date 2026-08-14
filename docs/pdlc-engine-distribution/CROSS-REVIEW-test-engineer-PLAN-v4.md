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

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **DoD items 14 and 15 say AT-2.1, AT-2.4 and AT-2.5 have "no other observer" than T50's gated legs; the plan's own §2.1 says otherwise, and the overstatement is the kind a later editor "corrects" in the wrong direction.** §2.1 lists AT-2.1 as carried by T11, T14, T41, T46, T53, T34 **and** T50 (`:196`), AT-2.4 by T53, T34, T59 and T50 (`:199`), and AT-2.5 by T13, T25, T34, T45 and T50 (`:200`) — several of those are hermetic local-suite rows, and DoD item 9 states AT-2.5's behaviour as a local-suite observation in its own right. Only **AT-2.3** (`T50 (second leg)`) and **AT-2.6** (`T50`) are genuinely T50-only. Nothing about the gate is wrong — the fail-closed inventory and the empty-skip-set positive are correct and I would not weaken them — but the *justification* is stated too strongly, and a reader who checks it against §2.1 finds it false. The risk is asymmetric in the bad direction: someone reconciling the two passages may conclude the gate is over-built and relax item 14 rather than tighten the sentence. One-line fix that keeps the gate exactly as it is: say that **AT-2.3 and AT-2.6 have no observer outside T50's gated legs, and AT-2.1/2.4/2.5 lose their machine-level conjunct** (clean-machine install, byte-identical tree after a real upgrade, container floor) **while retaining hermetic carriers named in §2.1**. That is both true and still sufficient to make the check required. | §7 item 14, §7 item 15, §2.1 `:196`, `:199`, `:200` |
| F-02 | Low | Local | **T50's capability predicate does not distinguish "probe ran and reported the capability absent" from "probe could not run", and only the second is declared a failure — so the one state that produces a registered skip is the one state left unnamed.** The text says each gated leg "probes one named capability — `docker` (`docker version` exits 0) …" and then that "the predicate is **opt-out**: an unprobeable capability is a failure, not a skip". If `docker version` exits non-zero, is docker *absent* (→ registered skip, item 15's evidence obligation fires) or *unprobeable* (→ workflow failure)? Both readings are available and they route the same observable to opposite outcomes. This is not a hole in the gate — either route is safe, because a registered skip still costs an evidence document and a failure still reddens the check — but T59's comparator legs and T50's implementer need one answer, and the plan's stated design intent (an all-skipped run cannot be the default; on `ubuntu-latest` all three probes succeed and no leg skips) reads like the failure branch is meant for *both*. Suggested wording: name the probe's exit status as the discriminator — non-zero exit ⇒ capability absent ⇒ registered skip; probe unable to execute at all (spawn error) ⇒ failure — or, simpler and closer to the intent already expressed, declare that on the pinned `ubuntu-latest` image any probe outcome other than success is a failure, and registered skips exist only for non-CI runners. | §2 T50 clause (i) |

Neither finding blocks. Both are one-sentence edits to text that is otherwise correct, and
neither touches the graph, the traceability transpose or any floor.

## Questions

| ID | Question |
|----|---------|
| Q-01 | T59 (`[red]`, batch 2) is the failing test for a comparator T50 (`[green]`, batch 10) ships — eight batches apart, the longest red-to-green interval in the plan. The convention is fine and the edge is real (`T50` deps name `T59`), but a red suite standing for eight batches is a red suite everyone learns to read past, and the plan's own §5.4 reasoning about T33/T41 was that "the interval between them is a suite that fails for a reason unrelated to the change". Is T59's comparator half expected to be written `test.todo`/skipped-with-a-named-reason until T50 lands, or genuinely red for eight batches? Either answer is workable — I only want the implementer to know which, since a skipped-and-forgotten red is the failure mode the fixture-machine gate itself exists to prevent. |

## Positive Observations

- **The fix generalised past what the finding asked.** I asked for the `skipSink` precedent to
  be adopted as it behaves. The revision adopted it *and* carried the same lens into DoD item
  4 (the comparator's branches are reachable from T59's hermetic legs, so the coverage floor
  survives the new lines) and into §1.2 (the round-2 skippability argument for keeping AT-4.4
  out of T50 is now **withdrawn** as stale, rather than left standing next to a fact that
  contradicts it). Withdrawing your own earlier justification because a later change falsified
  it is rarer than fixing the thing that was flagged.
- **The gate is now stated as a positive, and I could falsify it if it were false.** "On
  `ubuntu-latest` the recorded skip set is empty and the DoD cites that run's URL" is checkable
  by opening the URL. Compare round 2's "records the skip, prints it, concludes success",
  which no observation could distinguish from a total non-run. The pair (empty set on CI,
  subset-plus-evidence elsewhere) covers both branches with no gap between them.
- **Every anchor the revision added is real.** I re-opened all four `skipSink` citations, and
  they say what the plan says they say — including the detail that `validateSkipRecords` is
  already unit-tested as a pure function at `driftHelpers.test.js:120-183` over precisely the
  five violation shapes T59 enumerates. The plan is copying a mechanism that exists and is
  tested, not describing one it hopes for.
- **The two new floors are the runner's own numbers.** `ci-arrangement.test.js` `# tests 6`
  and `seam-contract.test.js` `# tests 12`, measured here, match. With these five files the
  "must survive the deletion it guards" rule is stated *and* instantiated for every extended
  file — and §5.1 names why these two in particular needed it (T17 absorbs V-19's overlapping
  assertions, T48 rewrites the key lists at `:47,57`; an absorbing rewrite that drops
  assertions is exactly the case the floor exists to redden).
- **§2.1's rule became true rather than annotated.** The round-3 fix could have been "document
  the exception". Instead the exception was removed at its source and replaced by a general
  rule — trailing list is a claim, body prose is a pointer — which makes future rows decidable
  without a carve-out list. The transpose now returns zero rows for a mechanical checker.
- **The graph is untouched for a third consecutive round.** 59 rows, zero batch mismatches,
  same histogram, no cycle, no duplicate id, no same-batch same-file collision, and §6 Rule 1's
  spelled-out hard cases all re-derive. Four rounds of substantial edits with no structural
  regression is the property that makes this plan safe to dispatch.

## Recommendation

**Approved with minor changes**

Round 3's High (F-01, the fixture-machine check that could be green with no gated leg run) is
resolved, and resolved at the mechanism rather than in prose: a stated opt-out capability
predicate, a `SKIP_INVENTORY`-shaped table naming each gated leg's capability and the `AT-` ids
its skip would leave unverified, a pure comparator that **fails** the workflow on any
unregistered skip, a DoD that observes the skip set **positively** as empty on `ubuntu-latest`
with the run URL cited, and an evidence obligation covering every unverified id on any runner
where it is not. I re-opened all four cited `skipSink` anchors and the plan's description of
the precedent now matches the precedent's behaviour. Round 3's Low (F-02) is resolved by
removing the exception rather than documenting it, and both round-3 questions are answered
with content, not deferral.

Nothing approved in earlier rounds was broken. The graph re-derives exactly — 59 rows, zero
batch mismatches, unchanged histogram, no collisions — the §2 ↔ §2.1 transpose returns zero
disagreements, and the two floors added this round (`# tests 6`, `# tests 12`) are the
runner's own numbers, measured here.

Two Low findings remain and neither gates:

1. **F-01** — items 14/15 say AT-2.1, AT-2.4 and AT-2.5 have "no other observer" than T50;
   §2.1 names hermetic carriers for all three. Only AT-2.3 and AT-2.6 are T50-only. The gate
   is right, the justification is overstated, and the fix is one sentence that keeps the gate
   intact.
2. **F-02** — T50's capability predicate leaves "probe reports absent" and "probe cannot run"
   indistinguishable, and only the second is declared a failure. Either routing is safe; the
   implementer needs to be told which.

**One erratum against FSPEC remains open and is re-reported to the orchestrator**, not folded
into this verdict: FSPEC's F-7 prose (`FSPEC:289`) cites "§8's AT-7.2", but §8 enumerates no
AT-7.2 — the criterion it means is AT-6.2, the load-root discriminator. Re-grepped at HEAD:
`AT-7.2` occurs exactly once in the whole document, at `:289`. PLAN §2.1 and T51 carry AT-6.2
correctly, so the PLAN is right and the dangling id is upstream.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}
