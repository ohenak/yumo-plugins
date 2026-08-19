# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.0, 2026-08-18)
**Date:** 2026-08-18
**Iteration:** 1
**Scope:** Full technical review — feasibility, implementability, oracle quality, and verification of
every existing-code claim the document rests on. Reviewed on `feat-pdlc-advisory-wave-gate`.

## Claims Verified Against HEAD

Every shipped-behaviour claim this FSPEC rests on was re-measured on this branch rather than taken
from the baseline's (known-drifted) line recipes.

| Claim | FSPEC site | Verified at HEAD |
|---|---|---|
| Post-wave command runs **before** the test gate; its failure halts immediately | §3.1, BR-1, BR-7 | `pdlc/workflows/orchestrate-dev.js:14347-14369` — post-wave `throw haltError` at `:14351`, gate at `:14360` |
| Dispatch failure ends the wave before either command | §3.1, BR-1 | `evaluateWaveDispatch(...)` at `pdlc/workflows/orchestrate-dev.js:14338` |
| Nothing commits until past a green gate; two writers only | BR-8, AT-04-3 | `pdlc/workflows/orchestrate-dev.js:14396-14426` — per-task `commitPaths` over `task.files`, then the conditional post-wave-pathspec commit |
| The wave commit loop covers only tasks **in that wave** (M-WG-12) | BR-12 | same loop, `for (const task of wave)` at `:14397` — a later task's paths have no writer |
| Envelope ships four members | BR-4, AT-03-1 | `ENVELOPE_DEFAULTS = ["E-1","E-2","E-3","E-4"]`, `orchestrate-dev.js:1938` |
| Seam catalogue ships five members | AT-01-1 | `ADVISORY_SEAMS = ["A1"…"A5"]`, `orchestrate-dev.js:1947` |
| Refusal-reason catalogue is a frozen ordered eight | BR-15, AT-03-7 | `ADVISORY_REFUSAL_REASONS`, `orchestrate-dev.js:2297-2306` |
| Exclusions precede permissions and are evaluated in order | BR-5 | `classifyEnvelope` iterates `ADVISORY_EXCLUSIONS` before returning `inside: true`, `orchestrate-dev.js:2411-2443` |
| Guard paths refuse `out-of-envelope` | E-15, AT-03-3 | X-e arm, `orchestrate-dev.js:2420-2424` |
| A partly-outside proposal is refused whole | E-16, AT-03-6 | X-d arm refuses on any non-member path, `orchestrate-dev.js:2425-2430` |
| Confidence gate is `!== "high"` ⇒ `low-confidence` | §3.2 step 5 | `orchestrate-dev.js:3512-3514` |
| A disabled tier's report omits the key entirely | E-01, AT-01-4 | conditional spread `...(advisory ? { advisory } : {})` in `buildFinalReport`; callers pass `undefined` at `:15002`, `:15035`. **The FSPEC's "absent, not present-and-undefined" is correct at HEAD** — the shipped `expect(result.advisory).toBeUndefined()` (`__tests__/advisoryDisabled.test.js:554`) is satisfied by absence, so AT-01-4 tightens the oracle without changing disabled-tier behaviour |
| Budget keys `attemptBudget` (3) and `seamBudgetMinutes` (10) already ship | BR-11 | `ADVISORY_DEFAULTS`, `orchestrate-dev.js:1940-1945` |
| `resolveAdvisoryRung` is exported and is the one ladder | AT-07-4 | corpus baseline §3; `MODEL_ADVISORY`/`MODEL_ADVISORY_FALLBACK` at `orchestrate-dev.js:1930-1931` |

Two claims did **not** check out as the FSPEC frames them; they are F-01 and F-02 below.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **E-04 and AT-01-5 invert the REQ's notice oracle, and the inverted form counts zero rather than one.** REQ AC-1.5 states the inapplicability is *added to* the shipped carriers and therefore "the oracle scans the whole surface **rather than** filtering for A6-authored notices". E-04 reproduces the carrier sentence verbatim and then says the count stays one "under an oracle that scans the whole surface **filtering for** A6-authored notices"; AT-01-5 makes that the test ("filtering for A6-authored inapplicability notices counts exactly **one**"). The two halves cannot both hold: if the statement rides inside BL-03's shipped legacy-path notice (`orchestrate-dev.js:14041-14045`), that notice is not A6-authored and an A6-authored filter counts **zero**. As written AT-01-5 is red against the very implementation E-04 specifies. Fix: restore the REQ's wording — the oracle counts inapplicability *statements* on the whole notice surface, whoever authored the carrier. | §5.1 E-04, §6.1 AT-01-5 |
| F-02 | High | Local | **AT-04-3 and AT-04-5 are jointly unsatisfiable as stated, and the FSPEC is stricter than its own REQ.** AT-04-3 asserts "the set of committing writers for the wave is unchanged from the pre-A6 baseline"; AT-04-5 asserts an E-6 repair is in the branch's committed state once the wave's commit step completes. At HEAD the only writers are the per-task loop over `task.files` for tasks **in this wave** and the post-wave-pathspec commit (`orchestrate-dev.js:14396-14426`); an E-6 repair touches a *later* task's paths by construction (BR-4's own rule), so neither writer's pathspec covers it. Satisfying AT-04-5 requires either a third writer or a widened pathspec on an existing one — and AT-04-3 as phrased forbids the first while saying nothing about the second. REQ AC-4.2 is more careful ("only the paths a later task owns remain the gap AC-4.6 and O-8 close"); the FSPEC lost that precision when it compressed the criterion into a set-equality. Fix: state the invariant that actually holds — writer **identity** and the green-gate precondition unchanged, pathspec **scope** widened under an E-6 resolution only — and phrase AT-04-3 over that invariant so a TSPEC author knows which degree of freedom O-8 may spend. | §6.4 AT-04-3/AT-04-5, BR-8, BR-12 |
| F-03 | Medium | Local | **§3.3's step-4 row contradicts BR-2, E-08 and AT-02-2 on attempt consumption.** The table collapses "verdict well formed" and "classification present" into one decision whose red branch reads "escalate, one attempt consumed". BR-2 and E-08 say an absent or out-of-set classification reads as `unclassified` and escalates **without** consuming an attempt, and AT-02-2 pins that. An implementer working from the table — which §3.3 presents as the flow in one place — consumes an attempt where the tests demand none. The document's own promise is "there is no case in which the answer is 'either'". Fix: split step 4 into two rows, or drop the "one attempt consumed" clause and defer to BR-2/E-07/E-09. | §3.3, BR-2, §5.2 E-08 |
| F-04 | Medium | Local | **§3.2 has no step at which `attemptBudget` is evaluated, so the loop as drawn is unbounded.** Step 3 is explicitly the *wave* budget only ("Attempt and time budgets are checked inside the invocation, not here"), and step 8b sends a red re-gate "back to step 3's budget check for a further attempt if one remains" — but no step owns the "if one remains" test, and §3.3's row 7 repeats the same routing. Nothing in the lifecycle enumerates where the attempt counter is read, so the only bounding statement lives in BR-11's prose. For a document whose §3 is meant to give "the single lifecycle end to end", the one loop it contains has no visible exit. Fix: give the attempt-budget check its own numbered step at the top of the retry arm, and route 8b to that step rather than to step 3. | §3.2 steps 3/8b, §3.3, BR-11 |
| F-05 | Medium | Local | **"A single invocation" is never defined, and the NFR-4 carve-out is vacuous under the reading the REQ gives.** BR-11 and E-25 bound `advisory.seamBudgetMinutes` by "working time on a single invocation … excluding time spent running the gate command", while REQ NFR-4 measures "from dispatch to verdict less the time spent running the gate command". Under a dispatch-to-verdict window the gate command runs *after* the verdict, so there is nothing to carve out and the exclusion cannot be the thing that stops `attemptBudget` from being starved — the stated rationale. The carve-out only does work if an invocation is the whole per-wave A6 episode spanning up to `attemptBudget` dispatch/repair/re-gate cycles, which is what §3.2's loop actually describes. AT-02-7's two oracles ("slow working time escalates, slow gate command does not") cannot be built until this is settled, because they differ only in which window is being measured. Fix: define the invocation window once in §4 — episode, not dispatch — and say so where AT-02-7 rests on it. Raised upstream as an erratum too, since NFR-4 carries the same ambiguity. | BR-11, §5.4 E-25, §6.2 AT-02-7 |
| F-06 | Medium | Local | **AT-01-5's population is not scoped to runs that execute Phase I, so the criterion reds on legitimate runs.** The Given is "a run in which BL-03, BL-04, or both are absent"; the Then is "exactly one" notice. Both carrier notices are emitted from inside the Phase I body (`orchestrate-dev.js:14041-14045` for BL-03; the script-gate notices in the `else` arm), so a run that halts in an earlier phase, or one where Phase I is skipped outright by the wave ledger (`Skipping Phase I (wave ledger …)`, `orchestrate-dev.js:14276-14283`), satisfies the Given and emits **zero**. This is the SE round-3 finding F-18 against REQ AC-1.5, which the round-4 review flagged as "worth landing before FSPEC transcribes the cardinality" — the FSPEC has now transcribed it unchanged. Fix here (scope the population to runs that execute Phase I) and upstream, where the criterion originates. | §5.1 E-04, §6.1 AT-01-5 |
| F-07 | Medium | Local | **E-04 says "the shipped once-per-run notices are the carriers", but in the both-absent run only one of them is reachable.** The BL-03 carrier sits inside `if (!waveMode) {` (`orchestrate-dev.js:14041`) and every BL-04 script-gate notice sits in that branch's `else` arm. In a run lacking both a manifest and a script-owned gate — E-04's own condition — the BL-04 carrier never executes, so "naming every absent prerequisite" must be discharged by the BL-03 carrier alone. Read as written, an implementer adds the text to both carriers and ships one string that is unreachable in exactly the run E-04 is about. This is REQ-round-3 F-19, likewise unresolved upstream. Fix: one clause recording that the carriers are mutually exclusive and that the BL-03 carrier is the sole one in the both-absent case. | §5.1 E-04 |
| F-08 | Medium | Local | **No edge case covers the new config key being malformed, zero, or absent, though §5 covers every other input class.** C-2 introduces `advisory.waveBudgetPerRun` with default `1`, and the tier's parser falls back per key independently and reports `invalidKeys` (`parseAdvisoryConfig`, `orchestrate-dev.js:1955+`). The FSPEC never states what `waveBudgetPerRun: 0` means (tier enabled, A6 never dispatches — a legitimate operator wish, or a misconfiguration?), nor that a malformed value falls back to `1` rather than disabling the seam or the tier. §5 is otherwise exhaustive about absent and malformed inputs, so the omission reads as an oversight rather than an inheritance. Fix: one row in §5.4. | §5.4, BR-11, REQ C-2 |
| F-09 | Medium | Local | **BR-10's post-gate halt is the one terminal state where reversibility does not hold, and nothing tells the operator so.** A green re-gate followed by a post-gate halt leaves the A6 repair in the tree, uncommitted, with no restoration (E-22: "the tree is whatever that path left"). The concrete instance exists today: the un-skip guard runs after the gate and before the commits and halts with the wave's work uncommitted (`orchestrate-dev.js:14372-14392`). The operator's next act is to re-invoke over a tree carrying an unreviewed machine-authored edit they were never told is still present — the exact property G-3 and AC-5.1 otherwise buy. AT-05-4 also cannot be built without naming a post-gate check, since "a post-gate check that halts the wave" is not constructible from the FSPEC alone. Fix: require the advisory record and the halt report to state that an applied repair remains in the tree on this path, and name the post-gate check class in E-22 so AT-05-4 has a fixture. | BR-10, §5.4 E-22, §6.5 AT-05-4 |
| F-10 | Medium | Local | **E-5 and E-6 are scope predicates joined to a set whose other four members are act kinds, and E-5's rule duplicates an exclusion that already ships.** `E-1`…`E-4` name what may be *done* (re-run a check, fix a lint error, resolve a rebase conflict, re-ground citations) and are enforced by X-c's `permitted.includes(action)` (`orchestrate-dev.js:2435-2439`); path scope is enforced separately by X-d's declared-scope arm (`:2425-2430`). E-5 as written ("a repair confined to the failing wave's own owned paths") names no act at all, and its decidable rule — every changed path inside a declared set — *is* X-d's rule. BR-4's single set-equality over `E-1`…`E-6` therefore closes a set whose members no longer mean one thing, and AT-03-4's E-6 companion case ("changing a path outside that later task's owned set is refused") cannot say whether the refusal is E-6's or X-d's. Fix: state explicitly that A6 widens the envelope's semantics from act kinds to act-plus-scope, and say which act kinds E-5 admits — otherwise E-5 licenses arbitrary content change inside owned paths, which is R-1 at full width rather than the bounded version §7.3 A-3 says is accepted. | BR-4, §6.3 AT-03-4 |
| F-11 | Low | Local | **AT-03-2 does not pin the refusal reason, and the reason is what distinguishes the outcome it is testing.** A test-artifact refusal returns `revert-on-test-touch` (`orchestrate-dev.js:2416-2418`), not `out-of-envelope` as AT-03-3's guard-path case does. "Refused on the test-artifact exclusion, not permitted under E-5" is only observable if the reason is asserted; without it the test cannot tell an X-a refusal from an X-d one. One clause naming the reason closes it. | §6.3 AT-03-2 |
| F-12 | Low | Local | **AT-07-1's "each boundary in §4" is not mechanically enumerable.** §4 carries sixteen BRs, several of which are not agent-proposable (BR-14 is a control-flow property, BR-16 is the meta-rule that the test is asserting, BR-9's triggers are engine-side). "Given each boundary in §4, when an agent is prompted to violate it" therefore has no derivable case list, and a suite author will silently pick a subset. Fix: name the boundaries this AT ranges over, or state the rule that selects them (agent-proposable prohibitions: BR-5, BR-6, BR-7, BR-8). | §6.7 AT-07-1 |
| F-13 | Low | Local | **AT-07-3's "no measurable wall-clock cost was added" is not a decidable oracle in the workflows suite.** The rest of the AT is fine and falsifiable ("no advisory agent was dispatched"); the wall-clock half is a timing assertion no deterministic unit test should carry, and CI has one Linux job whose timings are not stable enough to falsify it. Fix: drop the clause, or restate it as the reachability property the sentence's own second half already states. | §6.7 AT-07-3 |

**Erratum candidates raised upstream.** F-05, F-06 and F-07 each originate in REQ text this FSPEC
transcribed faithfully; they are emitted as `ERRATUM: REQ` lines alongside this review so the REQ's
author and approvers see them, and are recorded here because the FSPEC must be corrected in the same
pass whichever way the REQ resolves.

## Questions

| ID | Question |
|----|---------|
| Q-01 | On a green re-gate, an E-5 repair lands inside some wave task's owned paths and is therefore committed by that task's own `commitPaths` call (`orchestrate-dev.js:14397-14414`) under a message attributing the work to the task's agent. The advisory record names the repair (BR-13), but the commit does not. Is git-visible provenance for a machine-authored repair worth a clause, or is the record the intended single home? Not gating. |
| Q-02 | A wave A6 resolves is committed and then recorded green in the wave ledger, so a later re-invocation skips it (`orchestrate-dev.js:14276-14290`). That is the right behaviour for a genuinely-fixed wave and cements the repair for a wrongly-fixed one, which is R-1's residual by another route. Should §7.3 A-3 name the ledger as part of the residual's surface? Not gating. |
| Q-03 | BR-9 promises restoration "of the whole tree" while preserving "the wave agents' own uncommitted work" — coherent only as a snapshot-and-restore, not as a `git checkout -- .`-style revert. O-1 owns the mechanism, but does the FSPEC want to state the observable for files that are neither the wave's nor A6's — an operator's unrelated untracked file present before A6 acted? The document oracle in this repo is sensitive to exactly those. Not gating; O-1 can answer it. |
| Q-04 | E-6 commits into a later task's owned paths, which is the one place this feature perturbs the batch-safety invariant that makes same-tree waves ownership-disjoint. Is a run in which that later task sits in the *same* wave as the failing one in scope, or is E-6 strictly cross-wave? BR-12's "later PLAN task" and M-WG-12's "later wave" are not the same set. |

## Positive Observations

- **The oracle discipline is the strongest part of the document.** AT-04-2's sequence equality with
  its three enumerated literals, AT-02-6's two-oracle wave-budget case, AT-02-7's companion case that
  makes the NFR-4 carve-out falsifiable rather than decorative, and AT-05-2's generated-output case
  that a per-path restore fails — each of these is a test a reader can build without inventing an
  expected value, and each names the wrong alternative and why it is wrong. AT-04-4 in particular
  pairs the negative assertions of AT-04-1 and AT-04-3 with positive ones on the same path, which is
  the discipline AC-4.5 asks for and the thing most specs skip.
- **BR-5's second consequence is the finding I expected to have to raise.** Naming that a wave owning
  `pdlc/workflows/` escalates `out-of-envelope`, and that the 2026-08-09 motivating incident would
  therefore be diagnosed rather than repaired *in this repository*, is an honest statement that the
  feature does not fix its own motivating case here. It matches HEAD (`orchestrate-dev.js:2420-2424`).
  Specs that quietly leave that inference to the reader ship a disappointed operator.
- **§7.2 routes every deferral to a queue row that exists**, and §7.3's four assumptions are the kind
  a TSPEC author actually needs — A-2's "the baseline's line recipes have drifted, so cite by id" is
  precisely why this review re-measured every claim rather than trusting the recipe, and A-4's
  honesty about `waveBudgetPerRun` bounding drift only within an invocation is worth more than a
  reassuring sentence would have been.
- **E-16's whole-proposal refusal matches shipped behaviour exactly** — X-d refuses the candidate
  entire on any non-member path (`orchestrate-dev.js:2425-2430`), so "no part of it survives the seam"
  is inherited rather than newly built, and AT-03-6 will pass on the tier's existing code path.
- **The document knows what it is not.** §1's "what this document deliberately does not state" and
  §2's "where a requirement is deliberately not specified here" meant I could review this at FSPEC
  altitude without arguing about seam signatures. No finding in this review is a request for TSPEC
  material, because the document never invited one.

## Recommendation

**Needs revision**

Two High findings, both in the acceptance tests rather than in the behaviour. F-01 is a single
inverted phrase: E-04 and AT-01-5 ask an oracle to filter for A6-authored notices while specifying
that A6 authors no notice of its own, so the test as written counts zero against the implementation
the same paragraph describes. The REQ has the correct wording; restoring it fixes both sites.

F-02 is the one worth the round. AT-04-3 ("committing writers unchanged") and AT-04-5 ("the E-6
repair is committed") cannot both hold at HEAD, where the only writers are the per-task loop over
this wave's `task.files` and the post-wave-pathspec commit (`orchestrate-dev.js:14396-14426`). The
REQ's AC-4.2 names the gap precisely; the FSPEC lost that precision compressing it into a
set-equality. Say which degree of freedom O-8 may spend — writer identity fixed, pathspec scope
widened under an E-6 resolution — and both tests become buildable and the TSPEC author inherits a
decided question instead of a contradiction.

The nine Medium findings are individually one clause each. F-04, F-05 and F-08 are gaps a
reader hits while trying to implement the loop: no step reads the attempt budget, "invocation" is
undefined where the time budget depends on it, and the feature's own new config key has no
malformed-input row. F-06 and F-07 are the round-3 REQ findings F-18 and F-19 arriving in the
acceptance tests exactly as the round-4 review predicted; they are emitted upstream as errata as well
as recorded here. F-09 and F-10 are the two I would fix even if nothing else changed — the post-gate
halt is the single terminal state where the reversibility promise does not hold and the operator is
not told, and E-5 as written admits arbitrary content change inside owned paths, which is a wider
envelope than §7.3's accepted-risk paragraph describes.

Nothing here contests the design. The lifecycle, the precedence rules, and the sequence-equality
oracles are sound, and the document is unusually good at naming the alternative it rejected. Fix the
two Highs and the document is implementable.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 9, "low": 3}
