# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` (v1.1)
**Date:** 2026-07-30
**Iteration:** 2 (delta re-review)
**Scope:** Delta review of PLAN v1.0 → v1.1 (`8abe1aa` → `1019a3d`). Verification of my ten round-1
findings; re-derivation of the new §7.3 per-assertion permitted-red ledger and the re-shaped 31-task /
13-batch DAG; independent reproduction of §2.1's baseline, §2.3's wall time and §4.1's `npx jest`
claim; falsifiability of the assertions in the changed sections. Not reviewed: unchanged sections I
approved in round 1; product framing, architecture, behaviour (owned by the approved REQ v1.6 /
FSPEC v1.8 / TSPEC v1.5 — not reopened). Byte count is not filed as a finding per the phase brief.

---

## Measurements taken for this review (DC-02 — measured, not inferred)

**Baseline** — `cd pdlc/workflows && { time npm test; }` at HEAD (`1019a3d`) on
`feat-pdlc-review-loop-hardening`, run in the background per §2.3:

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
Time:        181.681 s, estimated 185 s
npm test  113.30s user 171.11s system 155% cpu 3:02.35 total
```

§2.1's three counts reproduce **exactly for the fourth independent time** (1038 / 1 / 70, 36 suites).
The single failure is `documentOracles.test.js › coveredViolations (§10, §10.1) › AT-22
[red-until-L-06]`, the foreign intentional red, unchanged in identity. §2.1, §2.2 and §12.2's
"no new failures" framing are accepted as measured.

**Wall time — the trend, which is what §2.3 asked to be watched:**

| Run | jest `Time:` | wall |
|---|---|---|
| v1.0 authoring | 179.175 s | not recorded |
| TE round 1 | 179.924 s | 180.56 s |
| v1.1 re-measurement | 184.752 s | 185.43 s |
| **TE round 2 (this run)** | **181.681 s** | **182.35 s** |

Four measurements of the same code now span jest 179.2–184.8 s and wall 180.6–185.4 s. **Every wall
measurement is over 180 s**, none is under, and no run is reproducible to better than ±3 s. §2.3's
revised statement — "already over it, and noisy upward", not a gate, background invocation mandatory,
halt at 300 s, do not shorten the suite — is **correct and now corroborated by a fourth point**. §4.1's
"advisory, recorded not asserted, no tolerance because it is not a gate" is the right treatment: my
182.35 s would have failed any tolerance tight enough to be meaningful. F-08 is fixed.

**`build-runtime.mjs --check`** exits 0; all three `dist/` artifacts in-sync. `RLH-AT-20` is green at
HEAD as §7.3 claims.

**`RLH-AT-19`'s two anchored regexes** — `/\bprocess\s*\./` and `/\bfetch\s*\(/` — match **zero** times
in both bundles (measured, `grep -c`). That half of §7.3 row 1 holds.

**The await-discipline half of `RLH-AT-19` does *not* hold as claimed. See F-01.** Scanning
`orchestrate-dev.js` and `orchestrate-queue.js` for calls to AT-19's closed thirteen-name list not
lexically preceded by `await` returns **three** sites, not one:

```
orchestrate-dev.js:615:      _agent(reviewers[0], reviewerPrompt1),
orchestrate-dev.js:616:      _agent(reviewers[1], reviewerPrompt2),
orchestrate-dev.js:1867:            agentFn(
```

**The `npx jest` claim does *not* reproduce. See F-03.** Measured at HEAD:

```
$ npx jest __tests__/parseVerdict.test.js ; echo $?
FAIL __tests__/parseVerdict.test.js
  ● Test suite failed to run — Jest encountered an unexpected token …
Test Suites: 1 failed, 1 total
Tests:       0 total
1                       ← exit code
$ npm test -- __tests__/parseVerdict.test.js ; echo $?
Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
0
```

`Tests: 0 total` reproduces; **`exits 0` does not** — it exits **1**, with `Test Suites: 1 failed`. It
is a loud red, not a vacuous green.

### Ledger arithmetic — re-derived, all 23 rows of §7.3

Rule applied: `Green from` must equal the batch of the **last** task listed in `Greened by`, and
`Permitted red` must equal *author-batch … (Green from − 1)*.

| Row | Written by (batch) | Greened by (max batch) | `Green from` | Expected window | Stated window | ✓ |
|---|---|---|---|---|---|---|
| `AT-19`, `AT-20` | RLH-31 (2) | nobody | 2 | ∅ | **none, ever** | ✓ |
| `AT-64` | RLH-31 (2) | RLH-32 (11), opened RLH-18 (4) | 2, then 11 | 4–10 | 4–10 | ✓ |
| `AT-65`, `-66`, prop | RLH-03 (2) | RLH-05 (3) | 3 | 2 | 2 | ✓ |
| `AT-12`,`-13`,`-14`,`-17`, 2 props | RLH-06 (2) | RLH-05 (3) | 3 | 2 | 2 | ✓ |
| `AT-15`,`-16`,`-18` | RLH-06 (2) | RLH-16 (6) / RLH-26 (8) | 8 | 2–7 | 2–7 | ✓ arith, **F-04** |
| `AT-01`…`-06`,`-63`, 2 props | RLH-11 (2) | RLH-05 (3) | 3 | 2 | 2 | ✓ |
| `AT-07` | RLH-11 (2) | RLH-26 (8) | 8 | 2–7 | 2–7 | ✓ |
| `AT-29`, prop | RLH-14 (2) | RLH-05 (3) | 3 | 2 | 2 | ✓ |
| `AT-28`, `AT-01a` | RLH-14 (2) | RLH-26 (8) | 8 | 2–7 | 2–7 | ✓ |
| `SKILL-01`…`-09` | RLH-04 (2) | RLH-07/08/09 (3) | 3 | 2 | 2 | ✓ |
| `WIRE-01` | RLH-17 (2) | RLH-18 (4) | 4 | 2–3 | 2–3 | ✓ |
| `REPORT-01` | RLH-29 (2) | RLH-30 (10) | 10 | 2–9 | 2–9 | ✓ |
| `AT-30-module`…`-34-module` | RLH-19 (3) | RLH-20 (5) | 5 | 3–4 | 3–4 | ✓ |
| `AT-35`…`-54`,`-58`,`-43a`,`-61-loop` | RLH-21 (3) | RLH-23 (7) | 7 | 3–6 | 3–6 | ✓ |
| `AT-61-report` | RLH-21 (3) | RLH-30 (10) | 10 | 3–9 | 3–9 | ✓ |
| `LOOP-01` | RLH-22 (3) | RLH-23 (7) | 7 | 3–6 | 3–6 | ✓ |
| `LOOP-02` | RLH-22 (3) | RLH-27 (9) | 9 | 3–8 | 3–8 | ✓ |
| `AT-08`…`-11`,`-56`,`-57` | RLH-24 (3) | RLH-26 (8) | 8 | 3–7 | 3–7 | ✓ |
| `AT-21`…`-27`,`-13a`,`-30-orch`…`-34-orch` | RLH-25 (3) | RLH-27 (9) | 9 | 3–8 | 3–8 | ✓ |
| `AT-55` | RLH-28 (3) | RLH-30 (10) | 10 | 3–9 | 3–9 | ✓ |
| `AT-60`,`-62`, prop | RLH-12 (4) | RLH-16 (6) | 6 | 4–5 | 4–5 | ✓ |
| `AT-59` | RLH-12 (4) | RLH-23 (7) | 7 | 4–6 | 4–6 | ✓ |

**Every row's arithmetic is correct.** `Green from` equals its last greener's batch in all 23 rows and
every window is exactly author-batch…green-batch−1 (with `AT-64`'s window correctly keyed to its
*opener*, RLH-18, rather than its author, and that deviation explained in the row itself).

**Completeness of the ledger, checked both directions:**

- Every assertion §7's authoring table gives a task appears in exactly one §7.3 row. No orphans.
- FSPEC `AT-01`…`AT-66` are **all** present across §7 and §7.3 — no AT has zero owners and, after the
  three splits of §7.4, **none has two**. I re-checked the two former dual owners individually.
- The three TSPEC-local ATs (`-01a`, `-13a`, `-43a`) each have exactly one owner and one ledger row.
- The seven §8.2 properties each have exactly one owner and one ledger row.

**The `approvalHash.test.js` case I raised in round-1 F-01 is now correctly bounded.** `RLH-AT-12/13/14`
(and `-17`) are permitted-red at **batch 2 only**, green from batch 3 — not through batch 11 as v1.0's
per-file column had them. `AT-15/16/18` are separated out with their own, longer, *justified* window
(2–7) because both genuinely need `RLH-26`'s gate to observe "the phase runs" / "the phase is skipped".
I read FSPEC AT-15, AT-16 and AT-18 to confirm the batch-8 binding is real and not bookkeeping slack:
it is. **The per-file → per-assertion regranulation is the right fix and it is executed correctly.**

### Batch-DAG — re-derived mechanically, all 31 tasks

`batch == max(batch of Deps) + 1` (sources batch 1) holds for **every one of the 31 rows**. The graph is
acyclic; ids are unique; every `Deps` reference resolves; `RLH-10`/`RLH-13`/`RLH-15` appear nowhere as
live references (the two mentions are explicitly historical, in §4's retirement note and §13.1's account
of what v1.0 got wrong).

| Batch | Tasks | Count | Source-lane member |
|---|---|---|---|
| 1 | 01 | 1 | — |
| 2 | 02, 03, 04, 06, 11, 14, 17, 29, 31 | **9** | — |
| 3 | 05, 07, 08, 09, 19, 21, 22, 24, 25, 28 | **10** | RLH-05 |
| 4 | 18, 12 | 2 | RLH-18 |
| 5–12 | 20 / 16 / 23 / 26 / 27 / 30 / 32 / 33 | 1 each | each |
| 13 | 34 | 1 | — |

- **31 tasks, 13 batches** — both counts correct; §4.2's widths (9 and 10) are correct, fixing round-1
  F-09.
- **Critical path** `01 → 03 → 05 → 18 → 20 → 16 → 23 → 26 → 27 → 30 → 32 → 33 → 34` — thirteen nodes,
  twelve edges, one per batch, spans the schedule. Correct as stated.
- **Source lane** `05 → 18 → 20 → 16 → 23 → 26 → 27 → 30 → 32 → 33` — ten members, batches 3–12,
  **exactly one per batch**. §3.2's serialisation invariant holds; §5.1's `dist/` row ("3–12, one per
  batch") and §13.3's "ten serialised source-lane commits" are both consistent with it.
- **No same-batch same-new-file collision** in any batch. Checked file by file for batches 2, 3 and 4
  (the only multi-task batches). Batch 2's nine tasks touch nine disjoint file sets; batch 3's ten touch
  ten disjoint sets; batch 4's two are disjoint.
- **The `skillFiles.test.js` triple in batch 3 is a greening reference, not a write collision** —
  verified: §5.3 names `RLH-04` (batch 2) sole owner and `extended`; `RLH-07`/`08`/`09`'s `Source File`
  columns are the SKILL prompts, and their SKILL sets are disjoint (`{se,pm,te}-review` /
  `{se,pm,te}-author` / `{harvest-learnings,orchestrate-dev,orchestrate-queue}` — nine files, no
  overlap, §5.4). The same holds for `RLH-05`'s four listed test files, all authored in batch 2.
- **Red-before-green holds everywhere.** Every green task's `Deps` include the task owning its test
  file; every `[Fake first]` task (RLH-02, 03, 06) precedes every consumer. No implementation task lacks
  a preceding red-test row.

The DAG is mechanically clean. The three-batch saving is real and the reasoning for **not** merging
`RLH-16` (blocked by `RLH-12` in batch 4) is correct — I re-derived it: folding `RLH-16` into `RLH-05`
would force `RLH-05` to batch 5, pushing the whole lane out one batch for no gain.

---

## Verification of round-1 findings

| Prior | Sev | Claim in §14.1 | Disposition | Evidence |
|---|---|---|---|---|
| **F-01** | High | fixed — per-assertion ledger, `AT-19`/`-20` empty window, `AT-64` bounded 4–10 | **Partially fixed** — the *mechanism* is right and its arithmetic is right (23/23 rows re-derived), but the row it exists to protect rests on an incomplete measurement | §4's `Greened by` column is gone; §7.3 is per assertion, declared the sole authority by §2.2, §7 and §7.3's own heading; all 23 windows re-derive correctly; the `approvalHash` case is bounded to batch 2. **But** §7.3 row 1's "the await scan is clean over both sources … the one non-awaited seam call … at `orchestrate-dev.js:1867`" is false — there are three (615, 616, 1867) and §9.2 classifies only one of them. With an **empty** window and `H-h` forbidding any loosening, that row is now a hard deadlock rather than a fail-open. See **F-01** below. §12.2 also still restates the gate in the retired vocabulary — see **F-06** |
| **F-02** | High | fixed — both shapes decided in §11.5, `RLH-LOOP-01` the oracle | **Fixed** | §11.5 decides `N-a` (two sibling fields on `reviewLoop`'s existing options object; `endIndex = startIndex + MAX_REVIEW_ROUNDS - 1` computed once at the gate, never recomputed) and `N-b` (non-exported, no test names it), with the rejected alternatives listed. Checked against TSPEC §3.9, which owns `reviewLoop`'s signature: §3.9 gives it **one destructured options object** carrying `iteration`, so sibling fields **extend** that object and contradict nothing — this is not a spec change. Ordering: both decisions now live in the PLAN, i.e. before batch 1, so they precede `RLH-22` (batch 3) and `RLH-24` (batch 3) and every task that encodes them; no `Deps` edge is needed and none is missing. **`N-b`'s "no test may name it" is enforceable, not honour-system**: `RLH-24` drives the search through `main()` with injected seams at L2, so the identifier is structurally unobservable to `approvalSearch.test.js` — a test that named it could not compile, and §11.5 makes picking the other shape a §11.4 scope halt. `RLH-LOOP-01` reds on every rejected `N-a` form (positional args, a new record type, a field on `EpisodeKey`), so it is genuinely falsifiable |
| **F-03** | High | fixed by withdrawing the claim | **Fixed** | Nothing presupposes a detector any more, checked at all four sites: §10.2 says "v1.1 builds no drift detector, and no task in §4 is asked to", binds the gap to `QUEUE.md` Order 9 beside TSPEC Q-09; §12.3's byte-identity row is **deleted** (grepped — no such row); `H-j` is rewritten to "**Not a halt — and not a detected condition**" and explicitly forbids bolting a comparison on; §13.3 states the `RLH-31` attribution is "withdrawn"; `RLH-12`'s §4 row and §5.2/§7 describe the fixtures as a point-in-time copy that "**detects no subsequent SKILL edit**". `H-j`'s "a half-built detector is worse than the recorded gap" is the right instruction. This is the correct resolution — an honest recorded gap beats an advertised oracle |
| **F-04** | Medium | fixed — `-module`/`-orch`, `AT-64` to RLH-31 alone, `RLH-WIRE-01` | **Fixed** | (a) `AT-30…34` split **per conjunct**, and the split partitions rather than drops: `RLH-19` owns the mechanism (row rewrite, `_git` two-invocation commit, **each** commit-failure branch, driven against the module); `RLH-25` owns reach (which halting exit arrives at the committing write, **and what the orchestrator reports when the commit fails**). Both halves name the commit-failure branch from their own side, so no conjunct falls between them. Jest names carry `-module` / `-orch`, so one run has ten distinct names, not five duplicated pairs. (b) `AT-64` is `RLH-31`'s alone, matching TSPEC §8.3; `RLH-17`'s assertion is `RLH-WIRE-01` and §7/§4/§7.4/§7.5 all use the new id consistently. (c) `AT-61` splits into `-loop` (green 7) and `-report` (green 10), both in `pacingWrapper.test.js` with `RLH-21` still sole owner — no new file owner, no §5.3 violation. **No jest name in §7/§7.3 now collides or duplicates**; I checked the full id set |
| **F-05** | Medium | fixed — one row per assertion, `AT-61` split | **Fixed** | The `AT-61` contradiction is gone: it was v1.0's `Greened by: RLH-23` versus §7's batch-13 row; §7.3 now gives `-loop` batch 7 (RLH-23) and `-report` batch 10 (RLH-30), and RLH-30 correctly writes no test |
| **F-06** | Medium | fixed — five names, not six | **Fixed** | §7's `RLH-17` row and §4's `RLH-17`/`RLH-18` rows all say **five** seams plus `forcePhases` as data; §9.3's after-count is TSPEC §8.5's twenty-one (16 + 5), cited not restated; `RLH-WIRE-01` is stated as "the five seams and `forcePhases`". The unsatisfiable "six new names in the derived set" obligation is gone |
| **F-07** | Medium | fixed — neither question was open | **Fixed, and better than I asked for** | Both are removed as questions and recorded as pinned TSPEC contracts in §13.1: `forcePhases` is a raw unparsed string on `main()` with `parseForcePhases` returning `{ ok, phases: Set }` / `{ ok:false, badTokens }` (TSPEC §3.1, §3.7 — no array exists anywhere, so P-Q-04 was a false question); the `ListFailure` disposition is inside `refreshReviewState` above the `deriveRoundWindow` call per TSPEC §5.6.1's pseudocode, and `RLH-23` carries it in §4 as "pinned, not a layering choice". Neither now depends on a task that could not decide it |
| **F-08** | Medium | fixed and re-measured | **Fixed** | §2.3 records all three prior runs in a table, states the figure "is not stable and is not a gate", attributes the wall clock to the longest suite plus contention with the `driftFault.test.js` 184.459 s / 184.752 s breakdown, projects 190–200 s, makes background invocation **mandatory** ("the first is not a recommendation"), adds the 300 s halt (also `H-…`/§11.3 and §12.2), and keeps "do not shorten the suite". §4.1 makes the wall clock **advisory, explicitly not a gate, with no tolerance** and gives the exact command — which is the correct answer to my "unfalsifiable tolerance" objection: my own re-measurement (182.35 s) confirms no tolerance would have been meaningful. Four points now support the claim |
| **F-09** | Low | fixed | **Fixed** | §4.2 states batch 3 as **ten** (RLH-05, 07, 08, 09, 19, 21, 22, 24, 25, 28) and §1.1 agrees; the critical path is "thirteen nodes, twelve edges" — both re-derive correctly |
| **F-10** | Low | "fixed as filed" | **Not addressed** — and the changelog claim is false | I grepped the whole document for `rlhGenerators`, "domain generator", "per-file generator" and equivalents: nothing. §5.2 still lists four helper/fixture files and no generator module; §6.3 still maps all seven properties onto `driftGenerators.js`'s primitives; §7.2 addresses only *seeds*, not domain generators. Neither of the two remedies I offered (own a shared module, **or** state that per-file generators are accepted and why) is present. Filed as **F-07** below at its original Low severity |
| **Q-01** | — | answered | **Answered honestly, and I accept it** | §7.3's closing note states the queue bundle carries a declared-but-unsupplied `_git` from batch 5 to batch 11 with nothing reding, names the reason (`RLH-AT-64` guards `orchestrate-dev`'s root only, TSPEC §8.5) and the mitigation (no interim `dist/` is shippable; only `RLH-34` certifies; `RLH-32` depends on `RLH-20` so the gap cannot outlive the feature), and forbids widening `RLH-AT-64`. **Accepting it is safe**: the module keeps its Node default so no L1/L2 path breaks; the exposure is confined to an unmerged branch; and widening the guard mid-feature would red batches 5–10 *by design*, converting a bounded latent gap into a certain ten-batch outage. The refusal to widen is the correct call and §11.3 `H-i` backs it |
| **Q-02** | — | answered | **Answered** | §9.2 adds a third ruling row: an anonymous arrow is exempt and "the obligation is inherited by nobody", the awaiting done by `parallel(...)`/`Promise.all` which `RLH-AT-19` "does not and must not try to verify", with `orchestrate-dev.js:1867` cited as the shipped shape. Only a *named* wrapper inherits (row 2). That is exactly the clarification I asked for — and it is what makes **F-01** visible, because the table now claims to be a complete classification |
| **Q-03** | — | answered | **Answered, with a counting error** | §7.5 names the non-AT ids (`RLH-WIRE-01`, `RLH-LOOP-01/02`, `RLH-REPORT-01`, `RLH-SKILL-01…09`) and §7.3 gives each a ledger row. But the count is thirteen, not "fourteen", and §12.3 does not in fact count them separately. Filed as **F-05** below |

**Summary: F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09 fixed (8 of 10). F-01 partially fixed
(mechanism correct, arithmetic correct, one load-bearing premise measurably false). F-10 not
addressed.**

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **§9.2's await classification is incomplete, so §7.3 row 1's "green on arrival / permitted red: none, ever" is asserted over an unmeasured call shape — and the empty window plus `H-h` turns that into a hard deadlock at batch 2.** §7.3 row 1 and §12.3's matching DoD row both state that the await scan is clean at HEAD and that "the one non-awaited seam call, `agentFn(` at `orchestrate-dev.js:1867`, is an entire `batch.map` arrow body and exempt". **Measured at HEAD: there are three, not one.** `orchestrate-dev.js:615` and `:616` are `_agent(reviewers[0], reviewerPrompt1),` and `_agent(reviewers[1], reviewerPrompt2),` — bare, unaliased calls to `_agent`, the **first name on FSPEC AT-19's closed thirteen-name list**, appearing as **elements of an array literal passed to `await _parallel([…])`** inside `reviewLoop`. Neither is `await`ed. They fall in **none** of §9.2's three rulings: not an *alias* (`reviewLoop` destructures `_agent` directly, no local rename), not a *returned promise* (an array element is neither an arrow body nor the operand of a `return`), not an *anonymous arrow* (there is no arrow — that ruling names `batch.map((t) => agentFn(t))`, a different construction at a different line). TSPEC §8.5's own closing rule — "Every other call site of an aliased thirteen-list seam must be lexically preceded by `await`" — does not reach an *unaliased* seam either, so the TSPEC does not silently supply the missing row. The consequence is worse than v1.0's fail-open, because v1.1 removed the slack: `RLH-AT-19` has an **empty** permitted-red window, so a red at the batch-2 gate is a regression by §2.2; §11.3 `H-h` says a red on source the agent believes correct is a **halt** and forbids widening the regex, adding an exemption name, or switching to a derived set; and §12.3's DoD repeats the same false premise, so `RLH-34` would certify it too. An implementer writing `RLH-AT-19` faithfully to §9.2 reds at batch 2 with no permitted resolution; one who quietly adds a fourth exemption to go green has done precisely what `H-h` exists to prevent — and lines 615–616 are inside `reviewLoop`, the function `RLH-22`/`RLH-23` rewrite, so this is not a distant corner. **Fix:** add the fourth ruling row §9.2 is missing — a seam call that is an element of an array literal passed to an awaited `_parallel(…)` / `Promise.all(…)` is exempt, the obligation discharged by the awaited consumer, obligation inherited by nobody — cite `orchestrate-dev.js:615–616` as the shipped instance the way row 3 cites 1867; correct §7.3 row 1 and §12.3's row to say **three** sites and how each is classified; and add the three measured sites to `RLH-01`'s pre-flight table so the "green on arrival" premise is *checked at batch 1* rather than asserted from an authoring-time scan. Do **not** resolve it by widening the scan or shrinking the name list. | §9.2, §7.3 row 1, §12.3, §11.3 `H-h`, §4.1 |
| F-02 | High | Local | **§12.1's per-task gate is the one command the PLAN elsewhere forbids, and it cannot express what §12.1 asks of a RED task.** §12.1 step 1: "Its own test file(s) pass under **`npx jest <file>`** — or, for a RED task, fail **only** for the stated reason (the subject does not exist yet)." §2.3 states in bold that a single file must be run "with `npm test --`, **never bare `npx jest <file>`**", and `RLH-01` is asked to prove why. Measured at HEAD: `npx jest __tests__/parseVerdict.test.js` never executes a test — `● Test suite failed to run — Jest encountered an unexpected token`, `Test Suites: 1 failed, 1 total`, `Tests: 0 total`, exit 1 — because the ESM loader flag lives only in the npm script. So (i) **no task in the plan can satisfy step 1 as written**, green or red; (ii) for a RED task the distinction step 1 turns on is destroyed — the suite fails with a module-parse error, not "the subject does not exist yet", so "fails **only** for the stated reason" is unverifiable and an implementer cannot tell a correctly-red new test from a broken one; (iii) it is a restated rule that contradicts its owning section, which is the exact defect class §1.2 makes this PLAN's central argument about, sitting in the gate every one of the 31 tasks runs 31 times. **The batch gate is not affected** and that is worth recording: §12.2 step 2 requires the absolute counts `1038 / 1 / 70 or better` plus the named permitted red, which a zero-test run cannot satisfy, and §7.3's ledger is stated in terms of named `RLH-AT-*` reds rather than exit status — so the silent-green mode cannot defeat the per-*batch* gate. The exposure is entirely §12.1's per-*task* gate. **Fix:** §12.1 step 1 becomes `cd pdlc/workflows && npm test -- <file>`, citing §2.3, and states the RED-task criterion as an assertion-level failure (the named `RLH-AT-*` tests fail on their oracle) rather than a suite-level one. | §12.1 step 1, §2.3, §4.1 |
| F-03 | High | Local | **`RLH-01`'s blocking pre-flight table asserts something measurably false about the repo's own tooling, so the PLAN halts itself at batch 1 by its own `H-e`.** §4.1 row 3: "bare `npx jest __tests__/parseVerdict.test.js` reports `Tests: 0 total` and **exits 0** … the other is a **vacuous green**", marked `confirmed; 0 vs 20 tests`; §2.3 repeats "reports `Tests: 0 total` and **exits 0** — a vacuous green". **Measured at HEAD: it exits 1**, with `Test Suites: 1 failed, 1 total` and `● Test suite failed to run`. `Tests: 0 total` is right; the exit status and therefore the *entire characterisation of the failure mode* are wrong. This matters three ways. (i) §11.2 `H-e` says "Any `RLH-01` pre-flight assertion fails → **Halt the whole PLAN at batch 1**" and §4.1's row is written as a blocking equality — so the PLAN as it stands stops at its own first gate on a claim it need not have made. (ii) The name is wrong in the direction that matters to this review: a **loud exit-1 red** is a fundamentally safer failure mode than a **silent green**, so no gate anywhere in this PLAN is defeatable by it — but the PLAN's mitigation reasoning ("so nobody discovers this at batch 7") is built on the unsafe model, and a reader who trusts §2.3 will believe any exit-0 they see from `npx jest` is meaningful. (iii) `npm test -- <file>` = 20 passed, exit 0 reproduces exactly, so the *recommendation* is right for the wrong reason. **Fix:** restate both sites as "reports `Test suite failed to run`, `Tests: 0 total`, and exits 1 — no test is executed", and make the `RLH-01` row assert that observation (suite-failed-to-run, zero tests, non-zero exit) rather than exit 0. Then reconcile with F-02. | §4.1 row 3, §2.3, §11.2 `H-e` |
| F-04 | Medium | Local | **The gate's sole authority offers an optional split it does not define, with ids that exist nowhere else, and the split is incoherent for one of the three ATs it covers.** §7.3's `RLH-AT-15/-16/-18` row: "**Write each as its own test**, `-stale` and `-gate`, and the windows separate to 2–5 and 2–7; written as one test the binding batch is 8." §7.3 opens with "**This table is the gate**", yet this row leaves the gate reading implementer-dependent: three ids, two suffixes, **no mapping from AT to suffix**, and two alternative window sets. If the implementer takes the split, the jest names in the run are `RLH-AT-15-stale`/`-gate` etc., and the ids the ledger itself names (`RLH-AT-15`, `-16`, `-18`) exist in no run — a batch gate looking them up finds nothing, which is the vacuous-lookup failure §1.3's namespace exists to remove. The split also appears in neither §7.4 (billed as the complete enumeration of every split id, with three rows) nor §7.5 (the complete list of non-AT ids), so two sections that claim completeness are incomplete under one of the two readings. And it does not decompose: reading the FSPEC, **AT-18** ("record-less LEARNINGS passes the guard and then the next Phase F **runs**") has no staleness conjunct at all — it is gate-only — so "write each as its own test, `-stale` and `-gate`" prescribes an empty `-stale` test for it. (AT-15 and AT-16 do genuinely carry both, which is why the unsplit batch-8 binding is correct and not slack — I verified that against FSPEC AT-15/16/18.) **Fix:** pick one. Either drop the split suggestion and keep the single row at `Green from` 8 — defensible, since the slack is one batch on three assertions — or decide it: `AT-15-stale`/`AT-15-gate`, `AT-16-stale`/`AT-16-gate`, `AT-18` unsplit, each with its own §7.3 row, and register the new ids in §7.4. | §7.3 row 5, §7.4, §7.5 |
| F-05 | Medium | Local | **§7.5 exists so §12.3's checklist can count the non-AT assertions mechanically; the count is wrong and §12.3 does not count them.** §7.5: "**Fourteen** assertions … §12.3 counts them separately." Enumerated: `RLH-WIRE-01` (1) + `RLH-LOOP-01`, `RLH-LOOP-02` (2) + `RLH-REPORT-01` (1) + `RLH-SKILL-01`…`-09` (9) = **thirteen**. §14.1 repeats "fourteen". More consequential than the arithmetic: §12.3 has **no row naming them at all**. Its two counting rows are "All 66 FSPEC ATs plus `RLH-AT-01a`, `RLH-AT-13a`, `RLH-AT-43a` are implemented" and "every AT in §7 is green" — and §7.5 states in bold that these thirteen are "**not** ATs" and "must not be renumbered into the FSPEC's range". So under a literal reading of the DoD checklist `RLH-34` runs, **none of `RLH-WIRE-01`, `RLH-LOOP-01/02`, `RLH-REPORT-01` or `RLH-SKILL-01…09` is required to exist or to be green** — including `RLH-LOOP-01`, which §11.5 designates the sole oracle for `N-a` and which F-02's fix depends on, and `RLH-SKILL-01…09`, the entire verification layer for the nine SKILL amendments. §7.5 asserts a §12.3 behaviour §12.3 does not have; that is the duplicated-statement inconsistency class again, and here the restatement is the one that is true while the owning section is silent. **Fix:** correct thirteen, and add the missing §12.3 row — "the thirteen non-AT assertions of §7.5 (`RLH-WIRE-01`, `RLH-LOOP-01/-02`, `RLH-REPORT-01`, `RLH-SKILL-01`…`-09`) all exist and are green" — so the claim in §7.5 becomes true. | §7.5, §12.3, §14.1 |
| F-06 | Medium | Local | **§12.2, the per-batch gate an implementer actually runs, restates the permitted-red rule in the vocabulary §4 retired, and the restatement disagrees with §7.3 for the one assertion with a non-contiguous window.** §4 states in bold "**There is no `Greened by` column**"; §2.2, §7 and §7.3 each declare §7.3's `Permitted red` the gate's only authority. §12.2 step 2 nevertheless reads: "plus only those `RLH-AT-*` tests whose **`Greened by` batch has not yet completed**." Two problems. (a) It names a retired column, so an implementer reading §12.2 first looks in §4 and finds nothing — and §7.3's `Greened by` cell is narrative prose ("nobody. Measured at HEAD…", "RLH-32. Also green on arrival…"), not a batch number a gate can read. (b) It is **not equivalent** to §7.3 where it matters: `RLH-AT-64`'s window is deliberately non-contiguous — green at batches 2–3, permitted red 4–10, green from 11 — because `RLH-18` *opens* the window at batch 4. Under §12.2's wording ("`Greened by` batch [RLH-32, 11] has not yet completed"), a red `RLH-AT-64` is excused at batches **2 and 3**, which §7.3 states outright is "a regression". `RLH-AT-19`/`-20`, whose `Greened by` is "nobody", have no batch for the wording to resolve against at all. This is the identical granularity/duplication failure F-01 raised against v1.0, surviving in the section that operates the gate. **Fix:** §12.2 step 2 cites §7.3's **`Permitted red`** column and only that — "…plus only those `RLH-AT-*` / `RLH-*` assertions whose §7.3 `Permitted red` window contains the current batch" — with no restatement of the rule. | §12.2 step 2, §4, §7.3 |
| F-07 | Low | Local | **Round-1 F-10 is not addressed, and §14.1 records it as "fixed as filed".** `driftGenerators.js` supplies primitives only (`int`, `pick`, `shuffle`, `bytes` — re-verified). The seven §8.2 properties need *domain* generators: conforming and non-conforming review filenames (RLH-11), fenced-markdown documents (RLH-03), multi-byte and surrogate-pair strings (RLH-06), heading sets (RLH-12), force-phase token strings (RLH-14). Five tasks across three batches will each hand-roll their own with no owner and no reuse edge. I offered two remedies and neither is present: grepped for `rlhGenerators`, "domain generator", "per-file generator" — nothing; §5.2 lists four helper/fixture files and no generator module; §6.3 maps all seven properties onto `driftGenerators.js`; §7.2 addresses seeds only. It stays Low — accepting per-file generators is a legitimate choice — but the choice has to be *stated*, and the changelog should not claim a fix that is absent. | §5.2, §6.3, §7.2, §14.1 |
| F-08 | Low | Local | §4.2: "Batches 4–13 | one or two tasks each, **always exactly one source-lane task**". **Batch 13 has none** — its only member is `RLH-34`, which §4 says "Writes no source and no test". §5.1's `dist/` row states the range correctly ("3–12, one per batch") and §13.3 says "ten serialised source-lane commits", also correct; only §4.2's range is overstated. §4.2 is billed as the mechanical count and §5's manifest as "the mechanical audit of the single-writer-per-batch premise", so an overstated range in the count table erodes the one place a reader checks the premise — the same reason F-09 was filed in round 1. Read "Batches 4–12". | §4.2 |
| F-09 | Low | Local | §12.3's first contract-integrity row is not a sentence: "…the three non-benign values produce **one** halt / halt shape at both — the one TSPEC §6.2 row 2 fixes, cited not restated…" — `halt` is duplicated across the line break and the clause does not close. It is the checklist row covering `ListFailure`'s single-halt-shape invariant, one of the "consistency checks this feature exists to earn", and `RLH-34` has to be able to read it. | §12.3 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01: is the `await _parallel([ _agent(…), _agent(…) ])` shape at `orchestrate-dev.js:615–616` intended to be exempt (my reading — the promises are collectively awaited by `_parallel`, so requiring `await` on each element would be a redundant await on a correct construction, exactly row 2's rationale), or does the TSPEC intend `RLH-AT-19` to require `await` there and treat the shipped source as the defect? The answer changes whether §9.2 needs a fourth *exemption* row or `RLH-AT-19` legitimately reds at batch 2 with `H-h` firing on its first gate — and it is a TSPEC §8.5 question, so if it is the latter this is the one finding in this review that is not editorial. |
| Q-02 | On F-03: given the failure mode is a loud exit-1 rather than a silent green, is anything in the PLAN's design actually protecting against a zero-test run, or is that protection incidental? My reading is that §12.2's absolute-count gate (`1038 / 1 / 70 or better`) makes the batch gate structurally immune and §7.3's name-based ledger never consults exit status, so nothing needs adding — but if `npm test` ever gains a `--passWithNoTests` path or a suite is renamed out of jest's match pattern, the count gate is the only thing that would notice. Worth one sentence in §12.2 saying so? |

---

## Positive Observations

- **The per-file → per-assertion regranulation of the ledger is the right fix, executed correctly.** All
  23 rows re-derive; the `approvalHash` seven-batch fail-open window I found in round 1 is now one batch;
  every AT has exactly one owner after the three §7.4 splits; and stating greening **once**, in §7.3,
  with §4 explicitly disclaiming a second copy, is the structural answer to this phase's recurring
  failure class rather than another restatement. F-06 is the tail of it, not a refutation.
- **Both interface shapes are genuinely decided, and `N-b` is genuinely enforceable.** "No test may name
  it" is not an honour-system rule here: `RLH-24` drives the search through `main()` with injected seams
  at L2, so the identifier is structurally unobservable to the test — a violating test would not compile.
  And `RLH-LOOP-01` reds on all three rejected `N-a` forms, so `RLH-22` needs no dependency on the
  implementing task. Checked against TSPEC §3.9: sibling fields on the existing options object extend
  the pinned signature rather than contradict it.
- **Choosing to withdraw the drift-detector claim rather than fake one is the correct call**, and it is
  executed completely — §10.2, §12.3, `H-j`, §13.3 and `RLH-12`'s own row all now say the same thing, and
  `H-j` goes further than I asked by forbidding a half-built detector under cover of this feature.
- **The re-shaped DAG is mechanically clean and the merge judgement is sound.** Three batches saved on a
  lane whose gate takes three minutes, with the one merge that costs nothing declined for a stated
  reason (`RLH-16` waits on batch-4 fixtures), and `RLH-23`/`26`/`27` correctly left separate. The
  `skillFiles.test.js` triple in batch 3 is a greening reference, not a collision — verified.
- **§2.3 and §4.1 are now the right shape for an unstable number.** Recording three runs, refusing to
  gate on the figure, making background invocation mandatory rather than advisory, adding a 300 s halt,
  and forbidding shortening the suite. My fourth measurement (182.35 s wall) would have failed any
  tolerance tight enough to mean anything, which is the argument for treating it as advisory.
- **Q-01's answer is honest and the refusal to widen `RLH-AT-64` is right.** Naming a real gap, bounding
  it, explaining why closing it mid-feature would red batches 5–10 by design, and forbidding the
  tempting fix is better engineering than a guard extended past its charter.
- **`RLH-01` remains the best idea in the plan** — and F-01/F-03 are arguments for putting *more* into
  it (the three await sites), not less.

---

## Recommendation

**Needs revision**

Three High and three Medium findings are open. The document has improved substantially: eight of ten
round-1 findings are fixed, the ledger regranulation is correct in mechanism and correct in all 23 rows
of arithmetic, and the DAG re-derives cleanly at its new shape. What blocks it is that **two of the
three Highs are the same defect as round 1 in a new place** — a measurement asserted rather than
re-verified, and a rule restated in a section that does not own it:

1. **F-01** — add §9.2's missing fourth ruling for the `await _parallel([ _agent(…) ])` shape and
   correct §7.3 row 1 / §12.3 to say **three** measured sites, not one. Until then the feature's
   load-bearing guard has an empty permitted-red window over source it reds on, and `H-h` gives the
   implementer no legal way out. Add the three sites to `RLH-01` so the premise is checked, not asserted.
2. **F-03** — `npx jest <file>` exits **1**, not 0. Correct §4.1 and §2.3, or `H-e` halts the plan at
   batch 1 on a false pre-flight assertion.
3. **F-02** — §12.1 step 1 must be `npm test -- <file>`; as written no task can pass its own gate and a
   RED task's "fails only for the stated reason" is unverifiable.
4. **F-04 … F-06** — decide or drop the `AT-15/16/18` split; fix "fourteen" → thirteen and give §12.3
   the row §7.5 claims it has; make §12.2 step 2 cite §7.3's `Permitted red` and stop restating it.
5. **F-07 … F-09** (Low) — state the per-file-generator decision (or own a shared module) and stop
   claiming F-10 fixed; read §4.2 as "batches 4–12"; repair §12.3's `ListFailure` row.

**On the specific question of whether a real regression can be waved through as permitted:** no longer,
with one exception. The ledger is per assertion, every window is minimal and correctly derived, and the
baseline criterion is "no new failures" against a named permitted red rather than absolute green — that
is right. The exception is §12.2's restatement (F-06), which excuses a red `RLH-AT-64` at batches 2–3
that §7.3 calls a regression. The zero-test silent-green mode cannot defeat any batch gate, because
§12.2 asserts absolute counts and §7.3 keys on test names rather than exit status; it defeats only
§12.1's per-task gate, which is F-02.

**On TDD-readiness:** the plan is TDD-ready in structure and not yet in operation. Every implementation
task has a preceding red-test task naming the same file and named assertions; every `[Fake first]` task
precedes its consumers; one owner per test file and one owner per assertion; the batch column is
mechanically correct at 31 tasks and 13 batches; and the decisions that shape the batch-3 test files now
precede batch 1. An implementer could write the red test first for every task **except `RLH-31`**, where
§9.2's classification is incomplete and the prescribed assertion is not simultaneously faithful and
green at HEAD (F-01) — and no task can currently run the per-task gate that proves its test is red for
the right reason (F-02, F-03). Those three are editorial fixes to this document plus, possibly, one
sentence of TSPEC §8.5 clarification if Q-01 resolves against exemption. Nothing here requires
reopening the REQ, FSPEC or the approved TSPEC's behaviour.

VERDICT: Needs revision
{"high": 3, "medium": 3, "low": 3}
