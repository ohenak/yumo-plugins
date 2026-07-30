# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` (v1.2) and
`docs/pdlc-review-loop-hardening/TSPEC-pdlc-review-loop-hardening.md` (v1.6, §8.5 amendment only)
**Date:** 2026-07-30
**Iteration:** 3 (delta re-review)
**Scope:** Delta review of PLAN v1.1 → v1.2 (`1019a3d` → `f1e16fc`) and of TSPEC v1.5 → v1.6's single
§8.5 amendment. Verification of my nine round-2 findings and three questions; independent re-measurement
of the await-discipline site set, the baseline, `build-runtime.mjs --check` and the single-file test
command; falsifiability of the new §11.5 `N-a` threading decision and its `RLH-LOOP-01`/`-02` oracles;
re-derivation of §7.3's withdrawn `-stale`/`-gate` split and §7.5's count; spot-check of the §14.1 audit.
Not reviewed: unchanged PLAN sections approved in rounds 1–2; ledger arithmetic and the batch DAG
(re-derived clean in round 2, unchanged in this diff — no window, `Deps` edge, batch or task count moved);
REQ v1.6, FSPEC v1.8, and every TSPEC section other than §8.5. Product framing and architecture are out of
lens. Byte count is not filed as a finding per the phase brief. `file:line` drift is not filed per R-6.

---

## Measurements taken for this review (DC-02 — measured, not inferred)

**Baseline** — `cd pdlc/workflows && { time npm test; }` at HEAD (`f1e16fc`), background per §2.3:

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
Time:        183.615 s
npm test  114.88s user 173.45s system 156% cpu 3:04.20 total
```

`1038 / 1 / 70`, 1109 total, 36 suites — **sixth independent reproduction**. The single red is
`documentOracles.test.js › coveredViolations (§10, §10.1) › AT-22 [red-until-L-06]`, unchanged in identity
(confirmed from the failure output, not inferred from the count). §2.1, §2.2 and §12.2's "no new failures"
framing hold.

**Wall time, sixth point:** jest `Time: 183.615 s`, wall `3:04.20` = **184.20 s**. Six measurements of the
same code span jest 179.2–184.8 s and wall 180.6–185.4 s. Every wall figure is over 180 s. §2.3's revised
treatment (advisory, not a gate, background mandatory, halt at 300 s, do not shorten the suite) is
corroborated again; my 184.20 s would have failed any tolerance tight enough to be meaningful.

**`build-runtime.mjs --check`** exits 0; all three `dist/` rows in-sync. `RLH-AT-20` green at HEAD.

**`RLH-AT-19`'s two anchored regexes** — `/\bprocess\s*\./`, `/\bfetch\s*\(/` — **zero** matches in both
bundles. That half of §7.3 row 1 holds.

**Single-file command (F-02/F-03):** `cd pdlc/workflows && npm test -- __tests__/parseVerdict.test.js` →
`Test Suites: 1 passed`, `Tests: 20 passed`, **exit 0**. The npm-script form does run a single file. The
bare form's exit-1 behaviour reproduces as v1.2 now states it.

### The await-discipline site set — re-measured, and it is **five**, not three

Scan implemented to §8.5's own prescription: FSPEC AT-19's closed thirteen-name set, **plus each name's
`main()`-destructured local alias** (§8.5's alias ruling: *"resolves the alias from `main()`'s destructuring
pattern and scans the local name, not the `_`-prefixed one"*), plus each named wrapper (§8.5's
returned-promise ruling: *"the wrapper's own name inherits the obligation … `agentFn` is then itself scanned
as an alias"*). Call sites not lexically preceded by `await`:

| Site | Scanned name → seam | §8.5 ruling that exempts it |
|---|---|---|
| `orchestrate-dev.js:615` | `_agent` | awaited combinator argument (new at v1.6) |
| `orchestrate-dev.js:616` | `_agent` | awaited combinator argument (new at v1.6) |
| **`orchestrate-dev.js:1569`** | **`rawAgentFn` → `_agent`** | **returned promise** (the whole body of `const agentFn = (skill, prompt, opts) => rawAgentFn(…)`) |
| `orchestrate-dev.js:1867` | `agentFn` → `_agent` (wrapper) | returned promise (a `batch.map` arrow body) |
| **`orchestrate-queue.js:524`** | **`rawAgentFn` → `_agent`** | **returned promise** (same wrapper shape, `MODEL_QUEUE`) |

**Five sites. `orchestrate-queue.js` has one, not zero.** Scan set derived mechanically:
`_agent: rawAgentFn = agent` at `orchestrate-dev.js:1545` and `orchestrate-queue.js:511` puts `rawAgentFn`
in the scan set by the alias ruling; the ruling then obliges the scan to visit `rawAgentFn(`, which is
non-awaited at both wrapper definitions. See **F-01**. I filed "three" in round 2 and was also wrong — the
author verified my number rather than re-deriving from the ruling, which is precisely the failure mode
`RLH-01` was added to remove.

**Combinator instances at HEAD:** `_parallel` / `parallelFn` only (`await _parallel([…])` at
`orchestrate-dev.js:614`; `await parallelFn(…)` at `:1865`), resolving to
`async function rtParallel(promises) { return await Promise.all(promises); }` in `runtime-adapter.js`.
**`Promise.race` and `Promise.any` appear nowhere** in `orchestrate-dev.js`, `orchestrate-queue.js` or
`runtime-adapter.js`. See **F-02**.

**Call-site arities re-derived:** `reviewLoop` has **seven** call sites (1649, 1675, 1701, 1742, 1771,
1797, 1913) and `checkConverged` **seven** (1659, 1685, 1711, 1752, 1781, 1807, 1923). §11.5's "all seven /
all seven" is correct. `checkConverged` is declared **non-exported** (`function checkConverged(...)`), and
its current arity is four — consistent with §11.5's "arity four to seven".

---

## Verdict on the TSPEC v1.6 §8.5 amendment

**Direction: correct. Reasoning: correct. Construction: correct in form, defective in two particulars.**

The author's conclusion — the source is right and the guard was under-specified — is **sound and I verified
the evidence myself.** `rtParallel` is `async function rtParallel(promises) { return await Promise.all(promises); }`;
the combinator receives already-started promises and awaits them collectively, so requiring `await` on each
array element would serialise the two-reviewer dispatch at `orchestrate-dev.js:614–617`. That is a behaviour
regression for no safety gain, and it is the same class as the parameter-list derivation §8.5 already
rejects. Placing the ruling in the TSPEC rather than the PLAN is right (an owning section beats a
restatement), and item 2's catch-all fix is a real defect caught: the closing rule genuinely reached only
*aliased* seams, so an unaliased `_agent(` fell through the whole section. Item 3's meta-clause — rulings are
predicates over position, citations are evidence, an unmatched site is blocking work — is the strongest thing
in the amendment and I endorse it without reservation.

**Is the ruling implementable as a test predicate? Not by the scan mechanism §8.5 prescribes, and no task
owns a mechanism that could.** §8.5 names exactly one mechanism: *"two anchored regexes over each bundle's
text"*, for `process`/`fetch`. The await-discipline half is called only *"an await-discipline assertion over
source"* — the mechanism is never stated, and `RLH-31`'s row says only *"the await-discipline scan over
source"*, deferring to *"TSPEC §8.5 verbatim"*. §8.5 then hands that unspecified mechanism a predicate that
is not regular:

- **The shape is not line-local.** At HEAD the array literal spans lines 614–617; line 615 is
  `_agent(reviewers[0], reviewerPrompt1),` with no `await`, no `[`, and no callee on it. A line-anchored
  regex cannot see the enclosing `await _parallel([`.
- **"Transitively an element of an array literal in the argument list of…" is a balanced-delimiter
  predicate.** Deciding it requires bracket/paren depth tracking to arbitrary nesting, which regular
  expressions cannot express. It is decidable by a hand-rolled depth scanner (the repo already has
  `scanLines`) or by an AST — but §8.5, §9.2 and `RLH-31` choose neither.
- **The mechanism determines the answer, which is how the count went wrong twice.** A line-local scan yields
  a different site set from a structural one, and a scan that skips alias resolution yields a third. `RLH-31`
  writes an assertion whose §7.3 window is **empty**, whose red is an `H-h`/`H-k` halt, and which must be
  green on arrival at batch 2. An implementer cannot write that red test without first inventing the
  mechanism, and two different reasonable inventions disagree on whether the gate passes.
- **No parser is available as a declared dependency.** `pdlc/workflows/package.json` declares `jest` only.
  `@babel/parser` and `esprima` exist under `node_modules` transitively; depending on either is an
  undeclared dependency, and no task or DoD row authorises adding one.

Filed as **F-03 (Medium)**. This is a specification gap, not a wrong claim — but it lands on the one
assertion in the feature that has no permitted-red slack.

**Do `Promise.race` and `Promise.any` open a false negative? Yes.** `await Promise.race([a, b])` settles on
the *first* member; the loser is never awaited and its rejection is unhandled. `Promise.any` is the same on
its success path. Including both in the closed combinator set therefore exempts a genuinely unawaited seam
call — a false negative introduced by the fix for a false positive. It is not hypothetical in this codebase:
`await Promise.race([ _agent(…), _sleep(MS) ])` is the natural JS spelling of a dispatch timeout, `_sleep` is
already an injected seam, and H-3's 180 s stall is this feature's own subject matter. Neither combinator has
a shipped instance at HEAD (measured: zero occurrences), so their inclusion also contradicts the meta-clause
added in the same edit — the citations exist *"so the predicate is known to be exercised rather than
hypothetical"*, and these two are exercised nowhere. Filed as **F-02 (Medium)**. The fix costs nothing: keep
`_parallel`, `parallel`, `Promise.all`, `Promise.allSettled` (all await-every-element), drop `race`/`any`,
and add either back with an instance if one ever ships.

**Does the ruling exempt exactly the three measured sites and nothing more?** The *combinator* ruling exempts
exactly `:615` and `:616` at HEAD and nothing else — I could not construct a wrongly-exempted call from the
`Promise.all`/`allSettled` members, because those genuinely await every element regardless of what the
element is. The over-exemption is entirely in the `race`/`any` members (F-02). Separately, the *count* the
PLAN attaches to the ruling set is wrong in the other direction — it undercounts by two (F-01) — so the
ruling table is not the problem there; the PLAN's arithmetic over it is.

**Anonymous arrows.** §9.2's v1.1 third ruling row — *"the obligation is inherited by nobody"* — was deleted
in favour of a citation, on the ground that §8.5's returned-promise ruling *"covers the anonymous-arrow case:
an arrow body is an arrow body whether the arrow is named or not"*. §8.5's row exempts the shape, so the
exemption survives; but that row's second half is written entirely in terms of a **name** inheriting
(*"the wrapper's own name inherits the obligation … `agentFn` is then itself scanned as an alias"*), which has
no referent for `batch.map((t) => agentFn(…))`. The answer to my round-2 Q-02 has been removed from the PLAN
and not added to the TSPEC. Filed as **F-06 (Low)**.

---

## Verification of round-2 findings

| Prior | Sev | Claim in §14.2 | Disposition | Evidence |
|---|---|---|---|---|
| **F-01** | High | fixed — TSPEC v1.6's fourth ruling, three sites, `RLH-01` checks the count and classification at batch 1 | **Partially fixed** — the mechanism is right, the ruling is right, the count is still wrong | §8.5 gains the combinator ruling, the catch-all now reads *"under its own `_`-prefixed name or under an alias"*, and the predicates/evidence meta-clause is added. §9.2 and §7.3 row 1 cite rather than restate. **But** the site set measured to §8.5's own alias and returned-promise rulings is **five**, not three, and `orchestrate-queue.js` has **one**, not none: `orchestrate-dev.js:1569` and `orchestrate-queue.js:524` are non-awaited calls of `rawAgentFn`, the `main()`-destructured alias of `_agent` the alias ruling puts in the scan set. Both are legitimately exempt (returned promise), so the *classification* claim holds for all five; the *count* and the queue-zero do not. §4.1 states the count as a **blocking** pre-flight assertion, so `H-e` halts the PLAN at batch 1 — the identical shape as round-2 F-03. See **F-01** below |
| **F-02** | High | fixed — §12.1 step 1 is `npm test -- <file>`, RED criterion restated at assertion level | **Fixed** | §12.1 step 1 reads `cd pdlc/workflows && npm test -- <file>`, cites §2.3 as owner, prohibits the bare form inline with the measured reason, and splits the criterion: GREEN = the file passes; RED = *"the suite runs, and exactly the named `RLH-AT-*` / `RLH-*` assertions §7 assigns to this task fail, each on its own oracle"*, with *"a suite that fails to run … is not a valid red"*. Verified the prescribed command runs a single file: 20 passed, exit 0. The distinction a RED task turns on is now observable |
| **F-03** | High | fixed — both sites restate the measured behaviour; `H-e` no longer fires on a false premise | **Fixed** | §2.3 records the correction as an explicit **withdrawal** (*"v1.1 asserted … 'exits 0 — a vacuous green'; that is false and is withdrawn"*) and states both directions of what the correction means. §4.1's row asserts suite-failed-to-run / `Tests: 0 total` / non-zero exit, plus the npm form's 20-passed/exit-0, and adds a rot guard (*"if the bare form ever starts executing tests, the row fails"*). Reproduced at HEAD. The withdrawal, rather than a silent edit, is the right treatment for a load-bearing changelog |
| **F-04** | Medium | fixed by dropping the split | **Fixed** | §7.3's row is now three tests, one per AT, one window each: written by `RLH-06` (2), green from **8**, permitted red **2–7**. Re-derived: `RLH-16` (6) supplies the staleness conjunct for AT-15/AT-16, `RLH-26` (8) the gate conjunct for all three, so the binding batch is 8 for all three and the window is author-batch…7. The row states the ground I gave (FSPEC AT-18 has no staleness conjunct, so the split prescribed an empty `-stale` test) and the cost (one batch of slack on AT-15/-16). No new ids, so §7.4's and §7.5's completeness claims are intact — the vacuous-lookup hazard is gone |
| **F-05** | Medium | fixed both halves | **Fixed** | §7.5 reads **thirteen** and shows the addition `1 + 2 + 1 + 9`; re-counted from the enumeration (`RLH-WIRE-01`; `RLH-LOOP-01`, `-02`; `RLH-REPORT-01`; `RLH-SKILL-01…-09`) — thirteen. §12.3 gains the row naming all thirteen under those exact jest names, with the reason stated (*"deliberately outside the AT-counting rows above, so this row is the only thing that requires them"*). §7.5's claim about §12.3 is now true |
| **F-06** | Medium | fixed — §12.2 cites §7.3's `Permitted red` and restates nothing | **Fixed** | §12.2 step 2 reads *"plus only those assertions whose §7.3 `Permitted red` window contains the current batch. Read that column; the rule is not restated here."* The retired `Greened by` vocabulary is gone from the operating gate, so the `RLH-AT-64` batches-2–3 discrepancy and the unresolvable "`Greened by` is nobody" case both disappear |
| **F-07** (round-1 F-10) | Low | declined-with-reason: per-file, file-local, unexported domain generators | **Accepted — the decline is sound on its merits** | See the judgement below the table |
| **F-08** | Low | fixed — "Batches 4–12", batch 13 has no source-lane task | **Fixed** | §4.2 reads "Batches 4–12" and states batch 13's sole member `RLH-34` writes no source and no test, reconciling explicitly with §5.1's `dist/` range and §13.3's ten commits |
| **F-09** | Low | fixed — §12.3's `ListFailure` row is a sentence | **Fixed** | The duplicated `halt` is gone; the row reads *"at both call sites the three non-benign values produce one and the same halt shape, the one TSPEC §6.2 row 2 fixes (cited, not restated: TSPEC §4.2, §6.2 rows 1/2/17)"* — grammatical, and `RLH-34` can read it |
| **Q-01** | — | answered: exempt, evidence `rtParallel`'s `await Promise.all` | **Answered, and I verified the evidence** | Read `runtime-adapter.js`'s `rtParallel` at HEAD. Exempt is the right answer and the reasoning (serialising a concurrent dispatch) is the right reason |
| **Q-02** | — | answered in §12.2's new paragraph | **Answered, and the answer is right as far as it goes — but the erosion list is incomplete.** See **F-04** | §12.2's paragraph correctly identifies the structural immunity: step 2 asserts absolute counts (a zero-test run fails it) and §7.3 keys on named assertions, never exit status. It names two erosions — `--passWithNoTests`, a suite leaving jest's match pattern. There is a third, and it is the one this repo makes reachable: **a skipped assertion is neither red nor green.** See F-04 |
| **Q-03** | — | answered: thirteen, §12.3 counts them | **Answered** | Re-counted: thirteen. §12.3's row exists |

**Summary: F-02, F-03, F-04, F-05, F-06, F-08, F-09 fixed (7 of 9). F-07 declined with reasons I accept.
F-01 partially fixed — the ruling is correct and the count over it is still wrong.**

### F-07 (round-1 F-10) — judging the decline on its merits

**The decline is sound and I accept it as a resolution, not a deferral.** Four reasons are given and three
of them are load-bearing:

- *No common shape.* Verified against the five domains named (`RLH-11` filenames, `RLH-03` fenced markdown,
  `RLH-06` multi-byte/surrogate strings, `RLH-12` heading sets, `RLH-14` force-phase tokens). They share
  only the primitives they already share. A module holding all five would be a namespace, and I would have
  had no reuse argument for it.
- *§5.3's single-writer rule has to be paid for.* This is the argument I did not make and it is correct: a
  shared module needs one owning batch-1/2 task plus five `Deps` edges, and it puts a batch-2 file on
  `RLH-12`'s (batch 4) path. Real schedule cost against no measured benefit.
- *Blast radius.* A drifting domain generator reds only its own property. That is the point that decides
  it — the shared-module argument buys against correlated false-greens from a shared *oracle*, and a
  generator is not an oracle.
- *A second primitive library stays forbidden.* This is the clause that makes the decision safe rather than
  permissive, and it is enforced at §6.3 and §12.3.

The promotion path (promote *that* generator to `__tests__/helpers/` as its own change with its own owner
when a sixth caller appears) is the right trigger and it is observable. Recording it in §7.2, §5.2 and §6.3
puts it in the owning sections rather than a changelog. **I am satisfied and will not re-file it.** The half
of my finding that mattered more — the false "fixed as filed" — is corrected and named as false.

---

## The changes driven by pm-review — verification

**`endIndex` ownership (`RLH-26`, batch 8; `H-q`).** Verified: `RLH-26`'s §4 row now owns the single
gate-side computation and the passing of both values at all seven `reviewLoop` and all seven
`checkConverged` call sites; `RLH-22`'s row describes `endIndex` as a *consumed parameter* with the
arithmetic attributed to `RLH-26`; `RLH-27` (batch 9) owns both consuming signatures; §11.5 carries an
explicit three-row ownership table; §11.4 gains `H-q`. Batch ordering re-derived: `RLH-26` (8) already
depends on `RLH-22`, and `RLH-27` (9) on `RLH-26`, so no new edge is needed and none is missing. The interim
state at batch 8 (call sites passing arguments a batch-9 signature does not yet destructure) is benign —
extra positional arguments are ignored and `reviewLoop` still carries `if (iteration > 5)` until edit 3
lands. **But the "computed exactly once" rule has no falsifying assertion. See F-05.**

**`RLH-LOOP-02` as the positional-swap oracle — the claim holds.** Rendering
`rounds ${startIndex}..${endIndex}` over a case with `startIndex ≠ 1 ≠ endIndex` produces a string that
differs under a swap, so the oracle genuinely distinguishes it (a case with `startIndex = endIndex` would
not, and §11.5 correctly specifies `startIndex ≠ endIndex`). It is also writable where it is assigned:
`checkConverged` is non-exported, so the assertion must observe it through `main()` — and TSPEC §8.4 places
`checkConverged` at **L2** with `reviewLoop.test.js` named among its homes and synchronous doubles supplied
through `main()`'s injection list, so no export is required and no §5.3 owner is displaced. The rendered text
reaches an observable surface twice (the `recordPhase` detail that lands in the returned phase table, and
the thrown `haltError` message).

**Transposition of *any* adjacent pair of the seven — re-derived, all six pairs are caught by a named
assertion:**

| Adjacent pair swapped | Consequence | Caught by |
|---|---|---|
| `loopResult` ↔ `phaseId` | `loopResult.converged` undefined → `!== false` → early return, no halt, no POSTMORTEM | `RLH-AT-22` (non-convergence writes a POSTMORTEM and halts) reds |
| `phaseId` ↔ `phaseLabel` | `postmortemPath` interpolates the human label; halt text names the wrong phase | `RLH-AT-22`'s path/existence oracle reds |
| `phaseLabel` ↔ `recordPhase` | a string is called as a function → TypeError | any test reaching the branch reds loudly |
| `recordPhase` ↔ `feature` | same — `recordPhase` bound to a string | as above |
| `feature` ↔ `startIndex` | `postmortemPath` becomes `docs/{int}/POSTMORTEM-{phase}-{int}.md` | `RLH-AT-22` reds |
| `startIndex` ↔ `endIndex` | `rounds {end}..{start}` | `RLH-LOOP-02` reds |

So the seven-positional call is adequately guarded against every adjacent transposition, not only the new
pair. That is a genuinely good result for a shape I would normally object to, and it is reached because
`feature` sits between the function argument and the two integers.

**§7.3's `-stale`/`-gate` withdrawal — three rows re-derived.** Correct; see F-04's disposition above.

---

## The §14.1 audit — spot-check

The audit is honest and it substantiates. Six claims are annotated as corrected and I checked each against
the tree:

| Audited claim | My check | Verdict on the audit |
|---|---|---|
| TE F-10 "fixed as filed" → **False** | Grepped for a generator module at v1.1's tree: none. Correct — and §14.1 now records "**F-10 was NOT fixed, and v1.1's 'fixed as filed' was false**" in those words | Sound |
| PM F-06 "greening at **batch 6**" → **False**, row says 8 | §7.3's row says green from 8; 6 is `RLH-16`'s batch, the staleness conjunct | Sound |
| PM F-07 "five seams" → **Overstated**, §6.3 said six | §6.3 now reads *"the **five** new seams — plus `forcePhases`, which is **data**, not a seam"* | Sound |
| TE F-01 "fixed" → **Overstated**, row 1's premise measurably false | Matches my round-2 finding exactly, and the correction is stated as *"partially fixed at v1.1, completed at v1.2"* rather than quietly rewritten | Sound in framing — but "completed at v1.2" is itself now overstated, because the corrected premise is still wrong (F-01). The audit's *method* is right; its newest claim needs the same treatment it just applied to the old one |
| Q-03 "fourteen" → **Thirteen** | Re-counted: 1+2+1+9 = 13 | Sound |
| TE F-07's entry described the wrong finding's remedy (found by the audit, not a reviewer) | v1.1's text said "fixed throughout §7.3, §8.1, §8.2", which is another finding's remedy; the entry now states the actual remedy (both questions were pinned TSPEC contracts, §13.1) | Sound, and finding this without a reviewer prompting is the right behaviour |

I also spot-checked three claims the audit lists as **substantiated**, to test whether the "did substantiate"
column was itself audited: PM `L-02`'s four letter corrections (§8.1 `O-2` → `(e)`, `O-3` → `(f)`, `O-17` →
`(d)`+`(f)`, §8.2 `H-1` → `(e)`) all resolve correctly against `RLH-05`'s six lettered groups — `(d)` is the
digest family, `(e)` is `parseReviewFilename`/`deriveRoundWindow`, `(f)` the five record parsers; `L-06`'s
retired-id narrowing holds (no task row, `Deps` edge, ledger row or traceability cell names `RLH-10/13/15`);
and §13.1 `P-Q-02` does record both threading channels. **The audit is trustworthy as a delta-review
instrument.** That matters more than any single row in it, and it is the right response to my F-07.

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The corrected await-site count is still wrong — it is five, not three, and `orchestrate-queue.js` has one, not none — and §4.1 now states it as a *blocking* pre-flight assertion, so the PLAN halts itself at batch 1 by `H-e`.** §4.1's new row: *"the await-discipline scan `RLH-31` will encode has exactly **three** non-`await`ed call sites … across `orchestrate-dev.js` and `orchestrate-queue.js`"*, evidenced as 615/616/1867 with *"`orchestrate-queue.js` has none"*. §7.3 row 1, §9.2 item 1 and §12.3's `RLH-AT-19` row repeat it. **Measured at HEAD, scanning to §8.5's own rulings: five.** The two missed sites are `orchestrate-dev.js:1569` and `orchestrate-queue.js:524`, both `rawAgentFn(skill, prompt, { model: …, ...opts });` — the whole body of `const agentFn = (skill, prompt, opts) => rawAgentFn(…)`. They are in the scan set because §8.5's **alias** ruling obliges the assertion to *"resolve the alias from `main()`'s destructuring pattern and scan the local name"*, and `_agent: rawAgentFn = agent` is exactly that destructuring (`orchestrate-dev.js:1545`, `orchestrate-queue.js:511`). Both are legitimately **exempt** under the returned-promise ruling, so nothing is wrong with TSPEC v1.6 or with the source — what is wrong is the arithmetic over it, in the same place and the same way as round 2. Consequences: (i) §11.2 `H-e` halts the whole PLAN at batch 1 when a blocking pre-flight assertion fails, and this one fails on both the count and the queue-zero; (ii) §9.2 item 2 declares *"a fourth site is blocking work, not an exemption"*, so an implementer who scans correctly finds sites four and five, both correctly exempt, and is told they are blocking work; (iii) `RLH-AT-19`'s window is **empty** and `H-h` forbids loosening, so there is again no legal resolution short of amending this document. **Root cause, and the reason this is the third round of the same defect: the count is an *enumeration*, and TSPEC §8.5's own new meta-clause says enumerations rot while predicates do not.** A gate keyed to "exactly three" breaks the moment anyone adds a correct arrow wrapper. **Fix:** (a) correct all four sites to **five**, with `:1569` and `:524` classified under the returned-promise ruling and `orchestrate-queue.js` recorded as having **one**; and (b) restate §4.1's row **as a predicate** — *"every non-`await`ed thirteen-list call site, resolved through `main()`'s aliases and wrappers, is classified by one of §8.5's three rulings"* — recording the observed count and site list as *evidence beside it*, advisory, not as the blocking equality. That way a fourth correctly-exempt wrapper does not halt the plan, while an unclassifiable site still does. | §4.1 row 4, §7.3 row 1, §9.2 item 1, §12.3, §11.2 `H-e` |
| F-02 | Medium | Cross-Feature | **TSPEC §8.5's new combinator set includes `Promise.race` and `Promise.any`, which do not await every element — the fix for a false positive has introduced a false negative, in a guard whose whole purpose is to have no fail-open.** The ruling exempts a thirteen-list call that is an array element in the argument list of an awaited call to *"`_parallel`, `parallel`, `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`"*. The first four await every member; **`race` and `any` do not.** `await Promise.race([a, b])` resolves on the first settlement — the loser is never awaited and its rejection is unhandled — and `Promise.any` is the same on its success path. So `await Promise.race([ _agent(…), _sleep(MS) ])` would be **exempt** while containing exactly the defect AT-19 exists to catch: an un-awaited agent dispatch whose failure is swallowed. This is not a hypothetical shape for this codebase — it is the idiomatic JS spelling of a dispatch timeout, `_sleep` is already an injected seam, and defect **H-3** (a 180 s stall killing a monolithic write) is this feature's own subject, so a timeout race is a plausible next edit to the very function `RLH-23` rewrites. Two further reasons the two members should not be there: **neither has a shipped instance** (measured: zero occurrences of `Promise.race` and `Promise.any` in `orchestrate-dev.js`, `orchestrate-queue.js` and `runtime-adapter.js`), which contradicts the meta-clause added in the same edit — the citations exist *"so the predicate is known to be exercised rather than hypothetical"*; and the ruling's own stated justification (*"the promises are awaited **collectively**, by the combinator"*) is **false** of `race`/`any`, so the two members are not covered by the reasoning that admits the other four. **Fix:** narrow the closed set to the await-every-element combinators — `_parallel`, `parallel`, `Promise.all`, `Promise.allSettled` — and state the discriminant as the reason (*a combinator is in the set iff it awaits every element*), so the set is itself a predicate rather than a list. If `race`/`any` are ever wanted, they arrive with an instance and their own ruling. Costs nothing at HEAD; the exemption set is unchanged over the shipped source. | TSPEC §8.5 (v1.6 rulings table, row 3); PLAN §9.2 |
| F-03 | Medium | Local | **The new ruling is a balanced-delimiter predicate handed to a scan whose only prescribed mechanism is an anchored regex, and no task owns the mechanism — so `RLH-31` cannot write its red test without inventing one, and different reasonable inventions disagree on whether the gate passes.** §8.5 prescribes *"two anchored regexes over each bundle's text"* for `process`/`fetch` and, for the await half, only *"an await-discipline assertion over source"*. `RLH-31`'s §4 row says *"the await-discipline scan over source"* and defers to *"Contract in TSPEC §8.5 verbatim"*. Neither states whether the scan is a regex, a bracket-depth scanner, or an AST walk. The predicate now requires structure a regex cannot express: (a) it is **not line-local** — at HEAD the array literal spans lines 614–617 and line 615 carries neither `await` nor `[` nor the callee; (b) *"**transitively** an element of an array literal in the argument list"* is balanced-delimiter matching to arbitrary depth; (c) the alias ruling already requires parsing `main()`'s destructuring pattern. No parser is available as a declared dependency — `pdlc/workflows/package.json` declares `jest` alone, and `@babel/parser` / `esprima` exist only transitively under `node_modules`, so relying on either is an undeclared dependency no task or DoD row authorises. **Why this is more than tidiness: the mechanism decides the answer.** A line-local scan, an alias-blind scan and a structural scan produce three different site sets — which is exactly how the count reached three in v1.1, three again in v1.2, and five under the ruling as written (F-01). And `RLH-AT-19` is the one assertion with an **empty** permitted-red window, a batch-2 green-on-arrival obligation, and `H-h` forbidding any loosening, so there is no batch in which an under-powered first attempt is legal. **Fix:** own the mechanism in one place. Either TSPEC §8.5 states it (a depth-tracking scanner over source lines, tracking `(`/`[` depth and the nearest enclosing awaited callee — no new dependency, and `scanLines` is already this feature's line primitive), or `RLH-31`'s row states it and §7.2/§5.2 give the scanner a home and an owner. An implementer must be able to write this red test from the documents without a design decision of their own. | TSPEC §8.5; PLAN §9.2, §4 `RLH-31`, §7.3 row 1 |
| F-04 | Medium | Cross-Feature | **§12.2's erosion list is incomplete, and the missing erosion lets a real regression pass every batch gate as permitted: a skipped assertion is neither red nor green, and nothing in the gate says so.** §12.2's new paragraph (answering my Q-02) is right that the gate is immune to a *non-executing* run, and names two erosions: `--passWithNoTests`, and a suite leaving jest's match pattern. **There is a third.** Step 2's criterion is *"1038 / 1 / 70 **or better**"* plus *"only those assertions whose §7.3 `Permitted red` window contains the current batch"*, and §2.2 — the owning section — states the criterion as *"no **new** failures"*. A `test.skip` / `describe.skip` / `it.todo` on an `RLH-AT-*` or `RLH-*` assertion satisfies **all three**: the pass count is unchanged or higher, no failure appears at all, and a skipped test is never consulted against §7.3's window because it is not red. Whether 71 skipped violates "70 **or better**" is undefined — the natural reading of "or better" is more passes and fewer failures, and a skip is neither — so the two statements of the exit criterion (§2.2's "no new failures" and §12.2's three counts) are **not equivalent for a skipped test**, which is this phase's recurring defect class in the section that operates the gate. **This is reachable, not theoretical, in this repo specifically:** the baseline already carries **70 skipped** tests and a `globalSetup`/`globalTeardown` skip-sink harness (`__tests__/helpers/skipSinkSetup.js`, `skipSinkTeardown.js`, measured in `package.json`), so skipping is an established local idiom rather than an exotic act. Consequence: an unimplemented or stubbornly-red assertion can be skipped at batch 3 and ride through twelve batch gates as permitted; §12.3's DoD rows catch it only at `RLH-34`, at the end, which is the fail-late shape §7.3's per-assertion regranulation exists to remove. **Fix:** name the third erosion in §12.2's paragraph, and make step 2's skip criterion an **equality**: *"skipped is exactly 70 — no `RLH-*` assertion is skipped, and a skip is not a green."* One clause, in the section that owns the gate. | §12.2 step 2, §2.2, §12.3 |
| F-05 | Medium | Local | **"`endIndex` is computed exactly once" is elevated to an `H-q` halt and given an owner, but it has no falsifying assertion — the one violation that matters is behaviourally indistinguishable, so no test in §7 can ever red on it.** §11.5 states the rule three times (*"computed exactly once, at the phase gate … never recomputed inside `reviewLoop` and never inside `checkConverged`"*), `RLH-26`'s row says *"No other site computes `endIndex`; a second derivation is an `H-q` halt"*, and `H-q` makes it a halt condition. But consider the actual violation: `reviewLoop` receives `startIndex` **and** `endIndex` and recomputes `endIndex = startIndex + MAX_REVIEW_ROUNDS - 1` from the `startIndex` it was handed. The recomputed value is **identical**, so `RLH-LOOP-01`'s gate assertion passes, `RLH-LOOP-02`'s rendered window text passes, and every AT passes. The rule is enforced only by an agent self-applying `H-q` and by eyeball — which is precisely the standard this feature exists to replace. It also matters more than a style rule, because TSPEC §7.1 **edit 3** anchors that arithmetic *inside `reviewLoop`* (`Enclosing symbol: reviewLoop`, `Edit: if (iteration > endIndex)`, `endIndex = startIndex + MAX_REVIEW_ROUNDS - 1`) while §11.5 relocates it to the gate and splits edit 3 across two tasks in two batches (`RLH-26` batch 8, `RLH-27` batch 9). An implementer reading TSPEC §7.1 alone will write the arithmetic where §7.1 anchors it and violate nothing any test can see. **The PLAN already has the right pattern for exactly this shape** — §12.3's *"`selectMode` is the **only** producer of `EpisodeKey.mode`; grep confirms no other assignment"* — and it is not applied here. **Fix:** give the single-computation rule a named, grep-shaped assertion (e.g. *"the literal `MAX_REVIEW_ROUNDS - 1` occurs exactly once in `orchestrate-dev.js`, inside the phase gate"*), register the id in §7.5's set and §7.3's ledger like every other assertion, and add the matching §12.3 row. Then `H-q` has an oracle rather than a request. | §11.5 `N-a`, §11.4 `H-q`, §4 `RLH-26`/`RLH-27`, §12.3, TSPEC §7.1 edit 3 |
| F-06 | Low | Local | **The answer to my round-2 Q-02 was deleted from §9.2 and not added to the section §9.2 now cites.** v1.1's §9.2 carried a third ruling row for the anonymous arrow: *"exempt, and the obligation is inherited by nobody"*. v1.2 deletes it, on the stated ground that §8.5's returned-promise ruling *"covers the anonymous-arrow case: an arrow body is an arrow body whether the arrow is named or not"*. The **exemption** does carry over — §8.5's row exempts *"the call is the entire body of an arrow function"* regardless of naming. What does not carry over is the second half of that row, which is written wholly in terms of a name: *"the wrapper's own **name** inherits the obligation. `agentFn` is then itself scanned as an alias"*. For `batch.map((t) => agentFn(t))` there is no name, so an implementer following §8.5 literally exempts the site and then has an inheritance instruction with no referent. Deleting a restatement in favour of an owning section is the right instinct and I endorse it generally — but it only works when the owning section says the thing. **Fix:** one clause in TSPEC §8.5's returned-promise row — *"an anonymous arrow has no name to inherit the obligation, and it is inherited by nobody; the awaiting is the consuming combinator's, which this assertion does not verify"* — after which §9.2's citation is complete. | §9.2, TSPEC §8.5 (returned-promise row) |
| F-07 | Low | Local | **The three-site set is now stated in four places with no owning section, which is why F-01 is a four-place fix.** §4.1's pre-flight row, §7.3 row 1's `Greened by` cell, §9.2 item 1 and §12.3's `RLH-AT-19` checklist row each carry the count, the site list and the per-site ruling. They do not diverge from each other at v1.2 — I checked all four — so this is not yet an inconsistency; it is the *condition* for one, and it is the condition that produced F-01 and round-2 F-01 and round-2 F-06. §8.5's own new meta-clause is the argument: enumerations rot. **Fix:** state the observed site set **once**, in §4.1's pre-flight row (the only place it is a measurement rather than a rule), and have §7.3 row 1, §9.2 and §12.3 cite §4.1 for the evidence and TSPEC §8.5 for the rule — the same precedence the document applies to everything else. | §4.1, §7.3 row 1, §9.2, §12.3 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-05: is the relocation of TSPEC §7.1 edit 3's arithmetic out of its anchored enclosing symbol (`reviewLoop`) and into `main()`'s phase gate a **PLAN** decision the TSPEC tolerates, or does it need a §7.1 amendment? §1.2 says the TSPEC wins on contradiction and §7.1's edits are anchored *by enclosing symbol plus distinctive literal* precisely so they can be located mechanically. If the gate is the right home — and I think it is, for the reason §11.5 gives — then edit 3's Edit cell should say so, and `RLH-27`'s "all five §7.1 edits, anchored by enclosing symbol" should not silently mean four-and-a-half. |
| Q-02 | On F-03: is there an existing precedent in this repo for a structural (non-regex) source scan in a test, which the scanner mechanism could reuse rather than invent? `scanLines` is this feature's line primitive and `driftGenerators.js` is its reuse precedent; if some drift suite already does depth-tracking over source, naming it in `RLH-31`'s row would close F-03 at the cost of one citation. |

---

## Positive Observations

- **The TSPEC amendment is the right instrument used the right way.** A measurement forced it; the ruling
  went into the section that owns the rule rather than the PLAN that consumes it; it is stated as a
  predicate over syntactic position; the shipped instance is cited as *evidence* rather than as the
  definition; and the meta-clause added alongside it (*"enumerations drift, invariants do not"*, an
  unmatched site is a failure the assertion names, never a line-number clause, never a narrowing of the
  thirteen-name set) is the most durable thing written in this feature so far. My F-01 and F-07 are
  applications of that clause, not objections to it.
- **The catch-all's aliased-only reach was a real, previously invisible defect,** and finding it while
  fixing something else is the behaviour I want from an author. It is also what makes the correct site set
  five rather than three — the fix widened the scan's reach exactly as it should have.
- **`npx jest`'s failure mode was corrected by explicit withdrawal, not by a silent edit.** *"v1.1 asserted
  … 'exits 0 — a vacuous green'; that is false and is withdrawn"* — and both directions of what the
  correction means are then stated, including that the corrected hazard is *smaller*. A changelog that
  records what it got wrong is worth more to a delta reviewer than one that reads clean.
- **The §14.1 audit is the right response to F-07 and it is trustworthy.** Six corrections, each annotated
  in place rather than rewritten; one found by the audit itself rather than by a reviewer; and the
  "substantiated" column survives spot-checking (I re-derived `L-02`'s four letters, `L-06`'s narrowing and
  §13.1's `P-Q-02`). A changelog is load-bearing for delta review and this one now behaves like it.
- **`checkConverged`'s seven-positional signature is adequately guarded — I could not construct an
  undetected adjacent transposition.** All six adjacent pairs red on a named assertion, and that holds
  because `feature` sits between the callback and the two integers. `RLH-LOOP-02`'s window-text oracle does
  distinguish the swap it claims to, TSPEC §8.4 already places `checkConverged` at L2 with
  `reviewLoop.test.js` as a home so no export is needed, and the oracle is written in batch 3 before either
  consuming task. This is a positional API I would normally file against, and the mitigation earns it.
- **Withdrawing the `-stale`/`-gate` split was the right one of the two options I offered.** Three tests,
  one window, every id the ledger names existing in the run, for one batch of slack on two assertions. The
  ground given (FSPEC AT-18 has no staleness conjunct) is the ground I gave, and the cost is stated rather
  than elided.
- **Declining F-10/F-07 with four reasons and a promotion path is a better outcome than complying would
  have been,** and the §5.3-cost argument is one I had not made.
- **§12.2's structural-immunity paragraph is correct as far as it goes,** and stating *why* a gate cannot be
  defeated — absolute counts, name-keyed ledger, never exit status — is more useful than asserting that it
  cannot. F-04 extends that reasoning rather than contradicting it.

---

## Recommendation

**Needs revision**

One High and four Medium findings are open. The document and the TSPEC amendment are both better than
round 2: seven of nine findings are fixed, the declined one is declined well, the changelog now audits
itself, and the single spec change was made for the right reason, in the right document, in the right
shape. What blocks it is that **the High is the same defect for the third consecutive round** — a count
asserted over a scan rather than derived from it — now installed as a *blocking* gate, and that the
amendment that fixed the false positive opened a false negative.

1. **F-01** — the site set is **five**, not three, and `orchestrate-queue.js` has **one**. Correct all four
   places, and restate §4.1's row as the predicate *"every non-awaited site is classified by one of §8.5's
   rulings"* with the count as advisory evidence. As written, `H-e` halts the plan at batch 1 and §9.2
   item 2 tells an implementer that two correctly-exempt wrappers are blocking work.
2. **F-02** — drop `Promise.race` and `Promise.any` from §8.5's combinator set. They do not await every
   element, they have no shipped instance, and the ruling's own justification is false of them.
3. **F-03** — own the scan mechanism. "Transitively an element of an array literal" is not decidable by the
   anchored regex §8.5 prescribes, and `RLH-31` has an empty permitted-red window in which to discover
   that.
4. **F-04** — name the third erosion and make the skip criterion an equality. A skipped `RLH-AT-*` currently
   passes every batch gate as permitted.
5. **F-05** — give the single-computation rule a grep-shaped oracle, as `selectMode` already has. `H-q`
   without a falsifying test is a request.
6. **F-06, F-07** (Low) — put the anonymous-arrow inheritance clause into §8.5 so §9.2's citation is
   complete; state the measured site set once and cite it from the other three places.

**On whether §7.3's ledger protects this feature's own guards, or a real regression can pass as
permitted:** the ledger itself is sound — per assertion, minimal windows, all 23 rows re-derived clean in
round 2 and untouched in this diff, and F-06's `Greened by` restatement is now gone from the operating
gate, which was round 2's one exception. **The new exception is not in the ledger, it is in the gate that
reads it:** a skipped assertion is consulted by nothing (F-04). One regression class — an assertion that
exists but is switched off — passes all twelve batch gates and is caught only by `RLH-34`.

**On whether the exit criterion is "no new failures" rather than absolute green:** yes, and correctly so,
at §2.2, §12.2 and §12.3 alike. F-04 is a gap in what counts as a *non*-failure, not a regression to
demanding green.

**On TDD-readiness:** structurally ready, operationally blocked on one task. Every implementation task has
a preceding red-test task naming the same file and named assertions; every `[Fake first]` task precedes its
consumers; one owner per test file and one per assertion; the batch column re-derives at 31 tasks and 13
batches; both §11.5 interface shapes are decided before batch 1, both have oracles written in batch 3 by a
single owner, both oracles are falsifiable, and `endIndex` now has exactly one owning task. An implementer
could write the red test first for every task **except `RLH-31`**, where the prescribed assertion is not
simultaneously faithful to §8.5 and consistent with §4.1's blocking count (F-01) and has no prescribed
mechanism able to decide the ruling (F-03) — and one invariant the plan treats as load-bearing has no red
test available at all (F-05). All six fixes are edits to this PLAN plus two clauses of TSPEC §8.5. Nothing
here requires reopening the REQ, the FSPEC, or any other section of the approved TSPEC.

VERDICT: Needs revision
{"high": 1, "medium": 4, "low": 2}
