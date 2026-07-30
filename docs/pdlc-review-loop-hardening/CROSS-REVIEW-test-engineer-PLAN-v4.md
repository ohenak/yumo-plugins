# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` (v1.3) and
`docs/pdlc-review-loop-hardening/TSPEC-pdlc-review-loop-hardening.md` (v1.7, §8.5 + changelog only)
**Date:** 2026-07-30
**Iteration:** 4 (delta re-review)
**Scope:** Delta review of PLAN v1.2 → v1.3 (`f1e16fc` → `83a5c1e`, fifteen commits) and of TSPEC v1.6 →
v1.7's §8.5 amendment. Verification of my seven round-3 findings and two questions. Independent
re-implementation of §9.2 item 3's scan mechanism in two masking variants and re-derivation of the site
set; independent re-measurement of the baseline; falsifiability audit of the two new assertions
(`RLH-SCAN-01`, `RLH-LOOP-03`) including their preconditions at HEAD; re-derivation of the `RLH-LOOP-01`
ledger move and of the batch DAG around it; re-count of §7.5's non-AT assertion set.
Not reviewed: unchanged PLAN sections approved in rounds 1–3; the task/batch/DAG/`Deps`/ownership
arithmetic (re-derived clean in rounds 2 and 3, and no task, batch, edge or file-ownership row moved in
this diff — confirmed against the diff); REQ v1.6, FSPEC v1.8, and every TSPEC section other than §8.5.
Round-2 `F-10`/round-3 `F-07`'s decline stands and is not reopened. Product framing and architecture are
out of lens. Byte count is not filed as a finding per the phase brief. `file:line` drift is not filed
per R-6.

---

## Measurements taken for this review (DC-02 — measured, not inferred)

**Baseline** — `cd pdlc/workflows && npm test` at HEAD (`83a5c1e`), background per §2.3:

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
Time:        191.558 s
```

`1038 / 1 / 70`, 1109 total, 36 suites — **seventh independent reproduction**. The single red is
`documentOracles.test.js › coveredViolations (§10, §10.1) › AT-22 [red-until-L-06]`, identity confirmed
from the failure output (`expect(coveredViolations(LIVE_ROOT)).toEqual([])`, `documentOracles.test.js:246`),
not inferred from the count. §2.1, §2.2 and §12.2's "no new failures" framing hold.

**Wall time, seventh point:** jest `Time: 191.558 s` — above §2.3's 190–200 s projection band's floor and
the highest of the seven. §2.3's treatment (advisory, background mandatory, halt at 300 s, do not shorten
the suite) is corroborated again; any tolerance tight enough to be meaningful would have failed this run.

**Bare `npx jest`, re-measured:** `Test Suites: 36 failed, 36 total`, `Tests: 0 total`,
`SyntaxError: Cannot use import statement outside a module`. §4.1 row 3 and §12.1 step 1 hold.

**`build-runtime.mjs --check`** exits **0**. `pdlc/workflows/package.json` declares
`devDependencies: {"jest":"^29.7.0"}` and **no `dependencies`** — §9.2 item 3's "no new dependency /
`H-n`" premise is measured, not asserted.

### I re-implemented §9.2 item 3's scan mechanism, and it reproduces

This is the load-bearing measurement of this review. I wrote the masked bracket-depth scan from §9.2
item 3's prescription alone, in **two masking variants** — variant A treating every `/` as a regex opener,
variant B disambiguating regex-from-division on the preceding significant character; variant A masking
template literals to the next backtick, variant B tracking `${…}` nesting. Both build the scan set as
step (b) prescribes (thirteen names + `main()`-destructured aliases + named wrappers to a fixed point) and
award a site "awaited" iff the joined source before it matches `\bawait\s*$`.

| Variant | `orchestrate-dev.js` | `orchestrate-queue.js` | Total | Non-awaited |
|---|---|---|---|---|
| A (naive mask) | 27 | 8 | **35** | `_agent`@615, `_agent`@616, `rawAgentFn`@1569, `agentFn`@1867, `rawAgentFn`@queue:524 |
| B (disambiguated mask) | 27 | 8 | **35** | identical |

**Both variants reproduce §4.1's advisory row exactly — 35 sites, five non-awaited, and
`orchestrate-queue.js` has one.** The resolved scan sets are also identical (`…, rawAgentFn, parallelFn,
checkFileFn, readFileFn, mergeWorktreeFn, checkCiFn, agentFn` in the dev file; `…, rawAgentFn,
readFileFn, writeFileFn, agentFn` in the queue file). That is the answer to the question the brief asked:
**an independent implementer working from §9.2 item 3 does write the same scanner, and gets the same
answer, and is not sensitive to the two masking choices the section leaves open.** F-03 is closed on its
merits, not on the author's assurance.

Note this only works because of TSPEC **v1.7**'s alias-row reconciliation. Under v1.6's "the local name,
**not** the `_`-prefixed one", `:615`/`:616` — called under `_agent` itself — fall outside the scan set
and the derivation returns three. The v1.7 clause is load-bearing for the mechanism, not editorial.

### Preconditions of the two new assertions, measured

| Check | Result |
|---|---|
| `MAX_REVIEW_ROUNDS` occurrences in `orchestrate-dev.js` at HEAD | **zero** — `RLH-LOOP-03` genuinely reds at HEAD; it is a real red-then-green, not a green-on-arrival tautology |
| `checkConverged` declaration / first column-0 `}` | `:496` → `:515` — span rule correct |
| `reviewLoop` declaration / first column-0 `}` | `:532` (`export async function reviewLoop({`) → **`:542`, which is `}) {`** — the *parameter destructuring close*, not the body end. The body ends at `:669`. **§11.5's span rule is wrong for the one function it most needs to be right about.** See **F-02** |
| `Promise.race` / `Promise.any` / `Promise.allSettled` in either bundle source | **zero** each — TSPEC v1.7's withdrawal reclassifies nothing shipped, as it claims |
| Real division present in `orchestrate-dev.js` | yes — `noChecksTimeoutMs / 60000` at `:1340`, i.e. *before* two of the five sites |
| Nested template literal | yes — `` `${r.id}: unknown${r.reason ? ` (${r.reason})` : ""}` `` at `orchestrate-queue.js:1086` |

The last two are the shapes the brief asked me to probe for the masking spec. They exist, but both masking
variants produced identical results over them, so the under-specification is **not reachable at HEAD**.
Routed to Harvest as non-blocking rather than filed.

---

## Verdict on TSPEC v1.7

**Approved. All three clauses narrow, none widens, and I verified each against the source.**

- **Item 1 — the combinator set becomes the property.** This is the correct remedy and the correct shape:
  the discriminant is now *"a promise combinator that awaits every element of the array"*, with
  `_parallel`/`parallel`/`Promise.all`/`Promise.allSettled` named as **instances**, and `race`/`any`
  withdrawn *and named as excluded* with the timeout shape spelled out. Naming them only to exclude them
  is better than deleting them, because the deletion would have been re-litigated. Measured: zero
  occurrences of all three names, so the reclassification is empty over shipped source, exactly as the
  changelog states. The v1.6 item-1 row was **annotated in place** rather than rewritten — the same
  discipline §14.1 was audited into.
- **Item 2 — the alias row.** This is the clause that makes the mechanism reproducible (above). v1.6's
  "not the `_`-prefixed one" genuinely contradicted the same edit's widened catch-all, and the row's real
  prohibition (scanning the `_` spelling *alone*, which passes vacuously) is preserved verbatim.
- **Item 3 — the anonymous arrow.** My round-3 F-06, and it landed in the owning section with the shipped
  instance named (`batch.map((task) => agentFn(…))` at `:1867`) and the scope pinned: *"the exemption is
  unconditional on naming; only the inheritance depends on it."* The third-clause overrun beyond the
  brief's two is disclosed in §14.3's `F-06` row with its reason, and the reason is right — answering it
  in the PLAN would have reinstated exactly the restatement `N-01`/`F-01` deleted.

The deliberate omission of the *mechanism* from the TSPEC, recorded in §0 so a later reader does not read
it as a gap, is the right division: §8.5 owns the predicate, PLAN §9.2 owns how it is evaluated.

---

## Verification of round-3 findings

| Prior | Sev | Disposition | Evidence |
|---|---|---|---|
| **F-01** | High | **Closed.** The count can no longer halt the plan or green a defect | §4.1's blocking row is now a predicate — *"every such site that is not lexically preceded by `await` is classified by one of TSPEC §8.5's three rulings. That total classification is the whole of the blocking assertion … a site that is correctly exempt never fails this gate, whatever the total is."* The count moved to a separate **advisory** row that explicitly blocks nothing (*"a drift is a report rather than a halt"*). I checked every consumer: §7.3 row 1 cites §8.5 for the rule and §4.1 for the set and restates neither; §9.2 item 1 cites §4.1 and says the set lives *"in §4.1's advisory row and nowhere else in this document"*; §12.3's `RLH-AT-19` row says *"This row asserts the classification, not a count … a correctly-exempt site that did not exist at authoring time does not fail this row."* §14.3's "five of 35" is a derivation record, not a gate. **Per the brief I did not verify the number — I verified the property, and then re-derived the number anyway as a by-product: five, twice, independently.** §9.2 item 2's inverted instruction (*"a fourth site is blocking work"*) is withdrawn in words and replaced with *"an unclassified site is blocking work; a correctly exempt one never is"* |
| **F-02** | Medium | **Closed** | TSPEC v1.7 item 1; see the TSPEC verdict above. Stated as the property the set stood for, so the set is self-limiting |
| **F-03** | Medium | **Closed on its merits** — the mechanism is decided, owned, dependency-clean, and **reproducible**, which is the standard I asked for | §9.2 gains item 3: a masked bracket-depth walk, file-local and unexported in `runtimeBundle.test.js`, owned by `RLH-31` (whose §4 row now carries it and `RLH-SCAN-01`), with the no-parser argument measured (`package.json` declares `jest` alone; `H-n`). I implemented it from the prescription in two masking variants and got the same 35/5 both times. My Q-02 is answered on record with a negative finding recorded so the next author does not re-search. **Two defects in the *new* mechanism are filed below as F-01 — that is a remediation review of the fix, not a reopening of F-03** |
| **F-04** | Medium | **Closed at the gate that operates.** A skip can no longer ride through | §12.2 step 2 is now `1038 passed / 1 failed / **skipped exactly 70**` — *"an equality, not 'or better'"* — plus *"every in-window assertion must be **present** and either red-as-expected or green: `RLH-*` and `RLH-AT-*` are all executed, none is skipped, and a skip is not a green."* §12.2's immunity paragraph names **three** erosions with the reachability argument (the 70 skips are the skip-sink harness's, so any 71st is new). §12.3 gains the matching DoD row (*"No `RLH-*` or `RLH-AT-*` assertion is skipped, and the suite reports exactly 70 skipped"*). §12.1's RED criterion independently requires the named assertions to **fail**, which a skip does not. Residual: §2.2 still states the criterion without the clause — **F-04 (Low)** below |
| **F-05** | Medium | **Closed in principle — the invariant now has a falsifying assertion, and I accept keeping it over deleting it.** But the assertion's stated computation is wrong at HEAD; see **F-02** | `RLH-LOOP-03` is registered in §7.5 (fifteen), §7.3 (written by `RLH-22` batch 3, green from 8, permitted red 3–7, greened by `RLH-26`), §4's `RLH-22` and `RLH-26` rows, §11.4 `H-q` and §12.3. **On whether it truly falsifies:** the *count* conjunct does. `MAX_REVIEW_ROUNDS` occurs **zero** times at HEAD, so it reds; and the innocent violation the author names — an implementer who follows TSPEC §7.1 edit 3's anchor *and* §11.5's relocation and writes the arithmetic twice — produces two occurrences and a red. That is a genuine falsification of the named violation, not an approximation of it, and `H-q` has earned its halt. The *span* conjunct is the one that discriminates **where** a single occurrence lives, and it is the broken half |
| **F-06** | Low | **Closed** | TSPEC §8.5's returned-promise row (v1.7 item 3). §9.2's citation now resolves, and §14.1's `Q-02` entry is annotated to record that it pointed at nothing for one version |
| **F-07** | Low | **Closed by deletion of three of the four copies**, which is the stronger of the two remedies I offered | §4.1 is the sole owner and says so; the other three cite. I checked all four sites for residual copies and found none |
| **Q-01** | — | **Answered, and the answer is right** | §11.5: the relocation of edit 3's arithmetic is a PLAN decision the TSPEC tolerates, because §7.1's Edit cell names *two* things and only the comparison is anchored to `reviewLoop` by the enclosing-symbol rule; §3.9/§10.3 `T-Q-02`/§13.1 `P-Q-02` leave the channel to implementation. Edit 3 splits explicitly across `RLH-26` (derivation, batch 8) and `RLH-27` (comparison, batch 9), so `RLH-27`'s "all five §7.1 edits" no longer silently means four-and-a-half. No TSPEC §7.1 change taken, and none needed |
| **Q-02** | — | **Answered with a checked negative** | §9.2 item 3 enumerates `__tests__/helpers/` and records that none reads JS source structurally; the nearest precedent is `runtimeBundle.test.js`'s own regex assertions over bundle text, which is why the walk lives there and stays file-local. Recording the negative finding so it is not re-searched is the right treatment |

**Summary: all seven round-3 findings closed; both questions answered.** The two Mediums below are
defects in content written *in this round*, not survivals.

### The `RLH-LOOP-01` move and the DAG — re-derived

`RLH-LOOP-01` moves from `green from 7 / permitted red 3–6 / RLH-23` to **`green from 9 / permitted red
3–8 / RLH-27`**, and this is correct: `reviewLoop`'s destructuring of `startIndex`/`endIndex` and its
`if (iteration > endIndex)` gate are `RLH-27`'s work (§11.5's ownership table), and an oracle for a gate
cannot green before the gate exists. Under the old row, batches 7 and 8 would have read `RLH-LOOP-01` as
an out-of-window red — a §11.3 regression halt caused by bookkeeping. §11.5's Oracles paragraph, which
contradicted the table, is corrected to agree with it; the table is named as owner.

**No batch moved, so nothing else re-derives.** `RLH-22` is batch 3, `RLH-26` batch 8, `RLH-27` batch 9 —
all unchanged in the diff; 31 tasks, 13 batches, and no `Deps` edge or file-ownership row altered. The two
new assertion rows are consistent with those batches: `RLH-LOOP-03` (`RLH-22` writes at 3, `RLH-26` greens
at 8) and `RLH-SCAN-01` (`RLH-31` writes at 2, green on arrival, no permitted red — the same treatment
`RLH-AT-19`/`-20` already carry in that row, and consistent with batch 2 being RED-terminal for the *other*
assertions in the file).

**The rejected batch-7 alternative is recorded correctly.** Folding `reviewLoop`'s destructuring into
`RLH-23` would leave the gate evaluating `iteration > undefined` — always false, i.e. a live loop with no
termination gate — for a whole batch while twenty-plus assertions sit green. The accepted one-batch
interim (batch 8 passes arguments a batch-9 signature does not yet destructure) is inert: extra properties
on an options object are ignored and `reviewLoop` keeps `if (iteration > 5)` until batch 9. I verified
that shape at HEAD (`reviewLoop` takes a single destructured object at `:532`). The comparison is honest
and the choice is right.

### §7.5's count — re-verified

`RLH-WIRE-01` (1) + `RLH-LOOP-01`/`-02`/`-03` (3) + `RLH-REPORT-01` (1) + `RLH-SCAN-01` (1) +
`RLH-SKILL-01…-09` (9) = **fifteen**, and 1 + 3 + 1 + 1 + 9 adds. §12.3's checklist row says fifteen and
enumerates the same fifteen names. Both prior moves are recorded rather than overwritten (v1.1 "fourteen",
mis-added; v1.2 "thirteen", correct; v1.3 fifteen *by addition*, and the row says so). §7.4's
one-owner-per-assertion property holds for both new ids via §5.3's file ownership —
`runtimeBundle.test.js` is `RLH-31`'s alone, `reviewLoop.test.js` is `RLH-22`'s alone.

---

## The bracket-depth walk — specification and failure modes

This was the highest-risk new content and it is mostly very good. It is decided, owned, dependency-clean,
tested by its own oracle, and — the thing that matters most — **reproducible**: I built it from the
prescription and got the author's answer twice, under two different resolutions of the ambiguities the
section leaves open. An implementer will write the scanner I would write.

**Where it is under-specified but harmlessly so** (routed to Harvest, not filed): the masking step (a)
says *"mask string literals, template literals, regex literals and comments"* and says nothing about
regex-versus-division, nested templates, or `//` inside a string. All three shapes exist or nearly exist in
these two files — a real division at `orchestrate-dev.js:1340` *before* two of the five sites, and a nested
template at `orchestrate-queue.js:1086`. I measured both masking resolutions and they agree, so this is
latitude the implementer can exercise safely at HEAD.

**Where the degrade-to-unclassified claim does *not* hold.** §9.2 item 3 claims the walk *"stays honest
about its own limits — a shape it cannot decide is an unclassified site, which fails loudly, never a
silent pass."* That claim is defensible for shapes the walk **cannot decide**. It does not cover shapes the
walk decides **confidently and wrongly**, and step (c) contains one, plus the scan as a whole has no guard
against deciding nothing at all. Both are **F-01**.

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The walk's returned-promise test is strictly weaker than the ruling it implements, so it silently exempts calls TSPEC §8.5 does not exempt — and nothing anywhere asserts the scan found any call sites at all, so a scanner that goes blind passes every gate in the plan.** Two clauses of §9.2 item 3, one edit. **(a) Over-exemption.** §8.5 exempts a call that is *"the entire body of an arrow function, or the operand of a `return`"*. §9.2 item 3(c) implements that as *"the nearest non-whitespace token before the call is `=>` or `return`"* — a **backward-only** proxy that never checks the call is the *whole* expression. `const f = () => _agent(a) && other;` and `return _checkFile(p) \|\| fallback;` both satisfy the proxy and neither satisfies §8.5: in the `&&` case the promise is discarded outright and its rejection is unhandled, which is precisely the C-2 defect `RLH-AT-19` is *"the only thing standing between this design and this repo's most repeated defect class"* (§9.2's own words). The mechanism therefore contradicts the contract it cites, in the fail-open direction, and it does so **silently** — an over-exempted site is never reported, so `H-h` never fires and no round of §11 sees it. Neither `RLH-SCAN-01`'s prescribed fixtures (*"one per ruling, plus a masked-delimiter case, plus a shape matching no ruling"*) nor `RLH-AT-19` probes it: the natural returned-promise fixture is `() => agentFn(x)`, which the proxy handles correctly. **(b) No non-vacuity conjunct.** `RLH-AT-19`'s await half now asserts *total classification* over the reported set (§4.1 blocking row, §12.3), and the count that used to be the premise is advisory *"and blocks nothing"*. Total classification over the **empty set is vacuously true**. So a scanner whose alias regex, mask or call-site match silently returns zero sites passes §4.1's blocking gate, passes §12.3's DoD row, and passes `RLH-AT-19` — while `RLH-SCAN-01` stays green, because it runs over inline fixtures and never over the real bundle sources (see F-03). TSPEC §8.5 names this exact outcome — *"finds zero call sites and passes vacuously — **the worst possible failure for this test**"* — and v1.3 removed the only thing that was standing in its way. This is not hypothetical carelessness: the scan set is built by regex over a destructuring pattern and the sites by regex over masked text, both of which return the empty set on a bad edit rather than throwing. **Fix, both clauses inside §9.2 item 3 (and one line of §12.3):** (a) add the forward half of the ruling — *"and the call's matching `)` is followed, at the same depth and modulo whitespace, by `;`, `,`, `)`, `}` or end of line, so the call is the entire body/operand and not one operand of a larger expression"*; (b) add a **lower-bound** conjunct to the blocking assertion, which does not reintroduce the enumeration `F-01`/`N-01` deleted because a lower bound never drifts upward: *"the scan resolves at least the thirteen names plus at least one alias per bundle, and reports **at least one** call site in `orchestrate-dev.js` and **at least one** in `orchestrate-queue.js`; a scan reporting none in either file fails the gate."* Both are predicates, both are one clause, neither can be broken by a future correct wrapper. | §9.2 item 3(c); §4.1 blocking row; §12.3 `RLH-AT-19` row; TSPEC §8.5 returned-promise row |
| F-02 | Medium | Local | **`RLH-LOOP-03`'s span rule is wrong at HEAD for `reviewLoop` — the one function it exists to exclude — so its discriminating conjunct is satisfied by an occurrence sitting inside `reviewLoop`'s body.** §11.5 defines the span as *"the function's declaration line to the next `}` in column 0; every top-level function in this file is unindented, so the span is decidable without the depth walk of §9.2 item 3."* Measured: `checkConverged` is declared at `orchestrate-dev.js:496` and the next column-0 `}` is `:515` — correct. **`reviewLoop` is declared `export async function reviewLoop({` at `:532`, and the next column-0 `}` is `:542`, which is `}) {` — the close of its destructured parameter list, not its body.** Its body ends at `:669`. So the rule computes `reviewLoop`'s span as ten lines of parameter names, and *"the occurrence lies outside the source spans of `reviewLoop` and `checkConverged`"* is **true** for an `endIndex` derivation written anywhere in `reviewLoop:543–669` — which is the entire region the rule exists to forbid, and exactly where TSPEC §7.1 edit 3 anchors the arithmetic an implementer is reading in parallel. The assertion is not useless — its *count* conjunct still reds on the double-write, which is the violation §11.5 argues is likeliest, and that is why F-05 is closed in principle — but the conjunct that decides *placement* is inert against the placement it names. This matters more than one broken predicate because §11.4 now claims *"every clause of this row has a named oracle"*, and this is the clause whose oracle was added to make that claim true. **Fix (one clause, §11.5):** define the span end as the first line matching **`^}\s*$`** rather than `^}` — measured, that yields `:669` for `reviewLoop` and `:515` for `checkConverged`, both correct — or state the span as *"declaration line to the first column-0 line that is a lone `}`"*, and note that a column-0 `}` followed by other tokens (`}) {`, `} = {}) {`) is a parameter-list close, not a body end. §12.3's matching grep row inherits the same wording. | §11.5 (`RLH-LOOP-03` definition), §12.3 `endIndex` row, §11.4 `H-q` |
| F-03 | Low | Local | **`RLH-SCAN-01` is prescribed differently in §9.2 item 3 and in §14.3, and the difference is the one that decides whether F-01(b) is reachable.** §9.2 — the owning section, and the one `RLH-31`'s §4 row points at (*"its shape is decided in §9.2 item 3, which this task implements rather than re-invents"*) — says it *"drives the walk over **inline literal source fixtures** — one per ruling, plus a masked-delimiter case, plus a shape matching no ruling."* §14.3's `F-03` disposition says it *"asserts the walk classifies **each of the five derived sites** under the expected ruling and reports an injected non-awaited, non-exempt site as unclassified."* Those are different tests over different inputs: the second runs the walk against the two real bundle sources and would red on the vacuous-zero scanner of F-01(b); the first would not. An owning section beats a disposition row, so an implementer builds the weaker one. **Fix:** adopt §14.3's stronger sentence into §9.2 item 3 (fixtures **and** the two real sources, with the five sites' expected rulings asserted), and let §14.3 keep describing it. That also discharges F-01(b) at no extra cost, since a real-source run that finds nothing cannot classify the five sites. | §9.2 item 3, §14.3 `F-03` row |
| F-04 | Low | Local | **§12.2 and §12.3 now carry the skip rule; §2.2 — the section that says it states the exit criterion "once", and that every task cites — still does not.** §12.2's own paragraph diagnoses this precisely (*"§2.2's 'no new failures' is silent on it too, so the two statements of the exit criterion were not equivalent for a skipped test"*), and then fixes §12.2 and §12.3 while leaving §2.2 unamended, so the two statements are still not equivalent. The operating gate does enforce it, and §12.1's RED criterion independently requires the named assertions to *fail* (which a skip does not), so nothing is currently reachable through this — it is a rot risk in the section flagged as the single source. **Fix:** one clause under §2.2's block quote — *"and no `RLH-*` or `RLH-AT-*` assertion is skipped; skips stay at the baseline's 70. A skip is neither a failure nor a pass (§12.2 step 2)."* | §2.2, §12.2 step 2 |

---

## Explicitly non-blocking — route to Harvest

None of the following is a finding. Each is durable signal, and none should hold up implementation.

- **`Process` — the defect that took four rounds was structural, and the fix that worked was deletion.**
  The same High recurred in rounds 2, 3 and 4 not because anyone miscounted but because a *derived* set was
  restated normatively in four sections with no owner, so every round repaired copies instead of the cause.
  v1.3 deleted three copies and demoted the fourth to advisory, and the finding closed immediately. The
  general rule worth promoting: **a value derived from source by a prescribed procedure is stated in
  exactly one place, marked advisory, and gates are written as predicates over the procedure, never as
  equalities over its output.** TSPEC §8.5's *"enumerations drift, invariants do not"* is the same lesson
  from the contract side; this is its PLAN-side twin.
- **`Cross-Feature` — reviewers verified a number instead of re-deriving it, three rounds running.** Both
  reviewers and the author each confirmed a wrong count by checking the other's arithmetic. The behaviour
  that broke the cycle was writing the *method* down first and running it (§14.3's derivation, and this
  review's re-implementation). Worth a review-checklist line: when a finding is about a derived quantity,
  re-derive from the stated procedure and report the procedure, not the quantity.
- **Masking is under-specified but not reachable at HEAD** (nested templates, regex-vs-division, `//`
  inside a string). Measured: two different resolutions of all three give identical results over both
  bundle sources. Worth one sentence in `RLH-31`'s implementation notes so the next editor of these files
  knows the latitude exists.
- **`RLH-LOOP-03`'s literal match is spacing-sensitive.** `startIndex + (MAX_REVIEW_ROUNDS - 1)` is caught;
  `MAX_REVIEW_ROUNDS-1` and `startIndex + 5 - 1` are not. TSPEC §7.1 edit 3 pins the exact literal, so an
  implementer copying the anchor produces the matched text — acceptable, and the same latitude the
  `selectMode` precedent carries.
- **`RLH-31` writes the scanner and the scanner's own test in one task**, so there is no red-before-green
  ordering *within* `RLH-SCAN-01`. Acceptable: the scanner is a file-local test helper, not production
  code, and §12.1's per-task gate covers the file. Noted only because the PLAN is otherwise strict.
- **§12.3's `selectMode` row is a construction pattern, not a shipped instance.** `selectMode` does not
  exist at HEAD (this feature creates it), so "the same construction as §12.3's `selectMode` row" cites a
  sibling new row rather than a precedent in the tree. The construction is sound either way; the wording
  overstates its pedigree slightly.
- **Byte count not filed**, per the brief. For the record: §14.3 is the growth and it is doing real work
  (the derivation-before-the-dispositions section is what makes this round auditable). The two rules I was
  asked to check — a rule whose only clear statement lives in a §14 row, and an assertion stated twice with
  divergence — produced exactly one hit, F-03, and it is a Low.

---

## Positive Observations

- **Stating the derivation method before the number, and adopting no number from any review, is the
  correct response to a defect that survived three rounds** — and it worked. §14.3's method paragraph is
  the reason I could re-implement the scan and check the author's answer rather than agree with it, and it
  is also the reason the author caught their own line-local first pass returning four. Recording that
  wrong intermediate result in the document is the single best thing in this revision.
- **The count is now genuinely inert.** I traced every consumer and there is no gate, halt, DoD row or
  window whose outcome depends on the number five, or on 35, or on `orchestrate-queue.js` having one
  rather than none. A future correct wrapper adds a line to an advisory row and nothing else. That was
  the whole of my F-01 and it is fully discharged.
- **The scan mechanism is reproducible by an independent implementer**, which is the standard I asked for
  in F-03 and a higher one than "specified". Two masking variants, same scan sets, same 35, same five.
- **TSPEC v1.7 removes an exemption and grants none**, and says so in those words. A round that narrows a
  guard it widened one version earlier, names the withdrawn members so the exclusion is not re-litigated,
  and annotates the superseded changelog row in place rather than rewriting it, is behaving the way a
  load-bearing contract should.
- **The skip erosion is closed in the section that operates the gate, as an equality, with the
  reachability argument attached** (70 skips are the harness's, so any 71st is new). The added clause —
  *"every in-window assertion must be present and either red-as-expected or green; a skip is not a
  green"* — closes the three-valued hole rather than patching the count, which is the more durable of the
  two fixes available.
- **`RLH-LOOP-01`'s ledger move was resolved toward the owning table with the rejected alternative
  recorded and costed.** `iteration > undefined` for a batch is a genuinely worse outcome than an inert
  one-batch interim, and stating that comparison rather than asserting the conclusion is what let me check
  it in one pass.
- **`H-q` now claims every clause has a named oracle, and that claim is nearly true** — three of four
  clauses are cleanly oracled, and the fourth's oracle exists and reds on the violation §11.5 names. My
  F-02 is a defect in one conjunct of one of them, not in the principle. Deciding to keep the invariant
  *with* a check rather than take the deletion I offered was the better call, and the argument given
  (TSPEC §7.1 anchors the arithmetic where §11.5 forbids it, so the innocent double-write is likely) is
  the argument that decides it.
- **Both of my questions were answered with checked negatives rather than assurances**, and the negative
  finding for Q-02 was written into §9.2 so it is not re-searched.

---

## Recommendation

**Needs revision**

Zero High. Two Medium, two Low. **Every round-3 finding is closed and both questions are answered** — the
count is inert, the combinator set is a property, the mechanism is decided and reproducible, the skip
erosion is closed at the gate, the single-computation rule has an oracle, and the anonymous-arrow clause
is in its owning section. This is the strongest revision of the four and the document is close.

What remains are two defects in content written **this round**, both measured, both one clause:

1. **F-01** — §9.2 item 3's returned-promise test is a backward-only proxy that over-exempts
   `() => _agent(a) && other`, silently and in the fail-open direction; and total classification over an
   empty reported set is vacuously true, so a scanner that reports nothing passes every gate. Add the
   forward half of the ruling, and a **lower-bound** non-vacuity conjunct (not a count).
2. **F-02** — `RLH-LOOP-03`'s span rule resolves `reviewLoop`'s span to `:532–542` at HEAD, because the
   next column-0 `}` is its parameter-list close `}) {`. Its placement conjunct is therefore inert against
   the placement it forbids. Use `^}\s*$`.
3. **F-03, F-04** (Low) — pull §14.3's stronger statement of `RLH-SCAN-01` into §9.2, which also discharges
   F-01(b); add the skip clause to §2.2 so the two statements of the exit criterion agree.

**On whether the count can still halt the plan or green a defect:** it cannot halt the plan — I traced
every consumer and no gate, window, halt condition or DoD row reads it. It cannot green a defect *by being
wrong*, but the mechanism that replaced it can green a defect *by finding nothing*, which is F-01(b) and is
a different failure than the one that was fixed.

**On whether §7.3 protects this feature's own guards:** yes, and better than at round 3. The ledger is per
assertion with minimal windows, all rows re-derived clean; `RLH-LOOP-01`'s window is corrected to match its
owner; the skipped-assertion class is closed at §12.2 and §12.3. The one remaining class that passes as
permitted is a guard that runs and reports nothing — F-01(b) — and it is confined to `RLH-AT-19`'s await
half.

**On whether the exit criterion is "no new failures" rather than absolute green:** yes, at §2.2, §12.2 and
§12.3 alike, and the skip fix sharpens what counts as a non-failure without regressing to green.

**On TDD-readiness, including `RLH-31`:** **yes — every task is now TDD-ready, `RLH-31` included.** That
was the one blocked task at round 3 and it is unblocked: the mechanism is decided in §9.2 item 3, owned by
`RLH-31`, carries its own oracle `RLH-SCAN-01`, needs no dependency, and I confirmed by building it that an
implementer can write it and get the prescribed answer. Every implementation task still has a preceding
red-test task naming the same file and named assertions; every `[Fake first]` task precedes its consumers;
one owner per test file and per assertion, including the two new ids; 31 tasks and 13 batches re-derive
unchanged; both §11.5 interface shapes are decided before batch 1 with oracles written in batch 3 by a
single owner, and all four `H-q` clauses now have one. F-01 and F-02 do not stop any red test being
written — they are corrections to what two of those tests must assert, and both are single clauses in the
sections that already own them. Nothing here requires reopening the REQ, the FSPEC, or any TSPEC section
other than the §8.5 returned-promise row F-01(a) touches — and even that is optional, since the mechanism
lives in the PLAN and it is the PLAN's proxy that is wrong.

VERDICT: Needs revision
{"high": 0, "medium": 2, "low": 2}
