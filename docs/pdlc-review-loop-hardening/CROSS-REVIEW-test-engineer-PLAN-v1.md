# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` (v1.0)
**Date:** 2026-07-30
**Iteration:** 1
**Scope:** Testability and verifiability of the work breakdown — per-task test surface, AT ownership
(zero/dual owners), TDD red-before-green order, batch-DAG arithmetic, permitted-red bookkeeping across
all 16 batches, and whether the C-2 await guard has a real oracle. Not reviewed: product framing,
architecture choices, behaviour (owned by REQ v1.6 / FSPEC v1.8 / TSPEC v1.5). Phase D was deliberately
skipped; the absence of a DECISIONS document is not raised.

---

## Measurements taken for this review (not trusted from the document)

**Baseline** — `cd pdlc/workflows && npm test` at HEAD on `feat-pdlc-review-loop-hardening`:

```
Test Suites: 1 failed, 35 passed, 36 total
Tests:       1 failed, 70 skipped, 1038 passed, 1109 total
Time:        179.924 s
npm test  113.42s user 170.59s system 157% cpu 3:00.56 total
```

§2.1's figures reproduce **exactly** (1038 / 1 / 70, 36 suites). The single failure is
`documentOracles.test.js › AT-22 [red-until-L-06]`, confirmed as the preceding feature's intentional
placeholder. §2.2's exit criterion is correctly stated as "no new failures", never "green". **§2.1, §2.2
and the identity of the permitted failure are accepted as measured.**

**Wall time** — jest's own `Time:` is **179.924 s**, but the command's true wall clock is
**180.56 s**, i.e. already **over** the 180 s watchdog before this feature adds a single test. See F-08.

**Reuse claims verified against the tree** (`__tests__/helpers/driftGenerators.js`): `seeded` exports
and returns `{ seed, int, pick, shuffle, bytes }` with `bytes(n)` returning a `Buffer`; `resolveSeed`
honours `PDLC_PROP_SEED` (`process.env.PDLC_PROP_SEED`, decimal-integer validated); `shrink` is
exported. No task in §4/§5 owns or modifies the file, §5.2 marks it read-only, and §6.3's "not reused"
table forbids a second generator library. **§RLH-02's reuse-not-reinvention claim holds.**

**Other HEAD claims spot-checked and confirmed:** `main()` carries sixteen `_`-prefixed parameters
(`_agent` … `_sleep`); `rtDevInjections` returns nine entries and `rtWriteFile` exists but is absent
from them; `reviewLoop` and `checkConverged` have seven call sites each; `iteration = 1` and
`if (iteration > 5)` both present; `rewriteStatus` is non-exported; `wrapModule("__queue", …)`'s
`exportedNames` is the three-name list; `QUEUE_ENTRY` carries both edit-2a and edit-2b anchors as
distinct literals; the dev bundle's `contents` array has no `queueModule`; `dist/` holds exactly the
three tracked artifacts. `checkConverged`'s `postmortemPath` at line 509 is literally
`docs/{feature}/POSTMORTEM-${phaseId}-{feature}.md` — so AT-55 genuinely reds at HEAD and RLH-28's test
can fail.

**Batch-DAG re-derived mechanically for all 34 tasks.** `batch == max(batch of Deps) + 1` holds for
every row; the graph is acyclic, ids are unique and every dependency resolves. Ids RLH-01…RLH-34 are all
present, none duplicated. No same-batch same-new-file collision exists in any batch (batches 2, 3 and 4
checked file by file). **The `Batch` column is correct.**

**AT coverage.** FSPEC carries exactly AT-01…AT-66. Every one has at least one owning red-test task —
**no AT has zero owners.** Two have two: see F-04.

---

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **`Greened by` is per-file, not per-AT, so §2.2's permitted-red set admits regressions of already-green guards — including the one guard this feature exists to protect.** §2.2 derives the permitted-red set from a column attached to the *task that owns the test file*, and every `RLH-AT-*` in that file is permitted to be red until the last-named greening task's batch completes. Verified at HEAD: `RLH-AT-19`'s two anchored regexes match **zero** times in both bundles (measured), and the await-discipline scan is clean over both `orchestrate-dev.js` and `orchestrate-queue.js` source under §9.2's alias and returned-promise rulings — the only non-awaited seam call, `agentFn(` inside `batch.map((task) => …)`, is the entire body of an arrow function and therefore exempt. So `RLH-AT-19` is **green on arrival**. Yet §4 gives RLH-31 `Greened by: RLH-32, RLH-33`, placing `RLH-AT-19` inside the permitted-red set for **batches 2 through 14** — a window that contains RLH-23 (batch 10), which §9.2 itself names "the highest-risk site in the feature for this defect" because `refreshReviewState` is new IO on a hot path. If RLH-23 drops an `await`, RLH-AT-19 reds and the batch-10 gate **classifies that red as permitted**. The one oracle standing between this design and this repo's most repeated defect class fails open at exactly the batch it exists to guard, and §11.3 H-h never fires because the agent is never told the test failed unexpectedly. The same defect applies to `approvalHash.test.js` (RLH-10 greens AT-12/13/14/17 at batch 4, but the column's last greener is RLH-26 at batch 11, so those four are permitted-red for seven batches after they should be green). **Fix:** make `Greened by` per-AT, not per-file — §7 already has the finer-grained data — and state `RLH-AT-19` and `RLH-AT-20` as *green from batch 2, red is a regression from batch 2 onwards*, with H-h/H-k wording that a red RLH-AT-19 is never permitted. | §2.2, §4 (`Greened by`), §7 (RLH-31/32/33), §9.2, §11.3 H-h |
| F-02 | High | Cross-Feature | **P-Q-01 and P-Q-02 are decided in tasks that run *after* the test files obliged to pin them, and §5.3 forbids a second task from appending to a test file — so neither has any oracle.** (a) **P-Q-02** (`startIndex`/`endIndex` threading shape) is "decided in RLH-13" (batch 5) and cited by RLH-23/26/27. But `reviewLoop`'s call signature is precisely what that shape changes, and `reviewLoop.test.js` is written whole by **RLH-22 at batch 3** — two batches earlier — with **no `Deps` edge on RLH-13**. §4's RLH-22 row already commits it to asserting "the three new parameters … `iteration` supplied at every call site", i.e. the signature. RLH-22 must therefore either pin a shape RLH-13 has not chosen (and cannot be amended, per §5.3's single-owner rule) or decline to pin it at all — in which case the four-task consistency point that §13.1 itself calls "precisely the drift class §1.2 names" is carried **only by a commit message** (§11.5 N-a). A commit message is not a falsifiable oracle. (b) **P-Q-01** (the approval search's name) has the same shape: it is closed by RLH-26 at batch 11, yet `approvalSearch.test.js` is written whole by RLH-24 at batch 3, and §13.1's own escape hatch ("keep it non-exported unless `approvalSearch.test.js` needs the seam") concedes the test may need the identifier. §13.1's instruction to "reference RLH-26's commit from any later task that calls it" does not help a task that runs eight batches *earlier*. **Fix:** either add `Deps` edges (RLH-22 → RLH-13, RLH-24 → a decision task) so the deciding task precedes the test author, or hoist both decisions into RLH-01/RLH-02 and record them in the PLAN, and name the test that reds if a later task uses a different shape. | §5.3, §11.5 N-a/N-b, §13.1 P-Q-01/P-Q-02, §4 rows RLH-22, RLH-24 |
| F-03 | High | Local | **§10.2's mitigation for the feature's one named false-halt risk cannot detect the drift it claims to detect, and the assertion is attributed to a task that does not own the file.** §10.2 states that because `RLH-12` copies `completeness.test.js`'s heading fixtures "verbatim from the SKILL templates", "a subsequent divergence between a SKILL template and §5.9's list then **reds the suite rather than a run**." A one-time manual copy taken at batch 4 detects nothing subsequent: edit a SKILL template afterwards and the copied fixture is simply stale, silently, and the suite stays green — the false-halt risk is fully restored. The mitigation only works if the fixture is **read from the SKILL file at test time** (an L2 test) or if a test asserts byte-identity between the two. Neither is assigned: §13.3 attributes byte-identity to **`RLH-31`**, which owns `runtimeBundle.test.js` and has no relationship to completeness fixtures; §12.3 lists "`completeness.test.js`'s heading fixtures are byte-identical to the SKILL templates" as a Definition-of-Done checklist row with **no owning task and no test**; and §11.3 **H-j** ("`completeness.test.js` reds because a SKILL template and §5.9's heading list diverge") presupposes a detector nobody builds. Three sections rely on an oracle that does not exist. **Fix:** give RLH-12 an explicit obligation to *derive* the fixtures from the SKILL files at test time (or add a named byte-identity assertion to a task that owns a file it can live in), and correct §13.3's task id. | §10.2, §12.3, §13.3, §11.3 H-j |
| F-04 | Medium | Local | **Two ATs have two owning tasks, with no statement of which conjunct each asserts.** (a) **AT-30…AT-34**: §4/§7 give RLH-19 "AT-30…AT-34's queue half" and RLH-25 "AT-21…AT-27, **AT-30…AT-34**" — unqualified. Both are in **batch 3**, in different files (`orchestrateQueue.test.js`, `haltAndQueue.test.js`), so it is not a write conflict, but nothing says which half is which, and two concurrent agents each writing "their half" as they read it can leave a conjunct of AT-32/33/34's commit-failure branches uncovered with both files green. It also produces two jest tests named `RLH-AT-30`…`RLH-AT-34` in one run — the exact report ambiguity §1.3 introduced the namespace to remove. (b) **AT-64**: RLH-17 adds "the derived-seam-set half of AT-64" to `pipelineWiring.test.js` while RLH-31 owns AT-64 in `runtimeBundle.test.js`; TSPEC §8.3 assigns AT-64 to `runtimeBundle.test.js` **only**, so the PLAN adds a second home for the id without saying so. **Fix:** split both ranges explicitly per file (e.g. "RLH-19 asserts the `updateQueueStatus`/`rewriteStatus` module-level half of AT-30…AT-34; RLH-25 asserts the orchestrator-level half"), and give RLH-17's assertion its own id rather than reusing AT-64's. | §4 rows RLH-19/RLH-25/RLH-17/RLH-31, §7, TSPEC §8.3 |
| F-05 | Medium | Local | **A concrete `Greened by` omission makes two batch gates report a false regression.** §7's RLH-30 row states "AT-55, **AT-61's report echo** go green | `reportTemplates.test.js`, **`pacingWrapper.test.js`**" — so `RLH-AT-61` cannot be green until RLH-30 at **batch 13** (TSPEC §8.3: AT-61 is "each trailer reason distinguishable **in the report**", and the report line is `buildFinalReport`'s, which RLH-30 builds). But §4's RLH-21 row names `Greened by: RLH-23` only, i.e. **batch 10**. Under §2.2's mechanical rule, a still-red `RLH-AT-61` at the batch-11 and batch-12 gates is "a second unexplained failure … a regression", halting the two heaviest source tasks in the plan (RLH-26, RLH-27) on a bookkeeping error. §7's RLH-23 row compounds it by also listing AT-61 as going green at batch 10. **Fix:** `Greened by: RLH-23, RLH-30` for RLH-21, and split AT-61 in §7 so exactly one task greens each conjunct. | §4 row RLH-21, §7 rows RLH-23/RLH-30, §2.2 |
| F-06 | Medium | Local | **A red test is specified with an obligation that can never be satisfied.** §7's RLH-18 row: "AT-64's derived seam set **includes the six new names**". AT-64's seam set is derived by filtering `main()`'s destructured parameters on `/^_/` (TSPEC §8.5, restated in §9.3 of this PLAN). Only **five** of the six new parameters carry `_`; §9.3 states this itself — "sixteen today plus **five** seams — `forcePhases` is data, not a seam, and carries no `_`" and expects twenty-one, not twenty-two. A `pipelineWiring.test.js` assertion written at batch 2 to expect six new names in the derived set therefore reds on correct source forever, and §11.3 H-i turns that into a halt. **Fix:** "five new seam names in the derived set; `forcePhases` is asserted separately as a non-seam parameter." | §7 row RLH-18, §9.3, §4 row RLH-18 |
| F-07 | Medium | Local | **Two of the four deferred questions name a closing task that cannot close them.** (a) **P-Q-04** (is `forcePhases` an array or a `Set`?) is assigned to **RLH-30, batch 13**. The type is first observable in `parseForcePhases`'s return, implemented by **RLH-15 at batch 6** and asserted by RLH-14's catalogue-closure property written at **batch 2**; it is then consumed by RLH-18 (batch 8), RLH-26's membership tests (batch 11) and RLH-32's adapter wiring (batch 14). Every one of those runs before or independently of the task nominated to decide it, so five tasks must each guess a return type — and §13.1's own rationale ("state it in the JSDoc so `RLH-32`'s adapter wiring matches") is unachievable when RLH-32 is batch 14 and RLH-30 is batch 13 only by luck. (b) **P-Q-03** (which layer applies `refreshReviewState`'s `ListFailure` disposition) is assigned to **RLH-15, batch 6**, which builds the five record parsers and does **not** build `refreshReviewState` — RLH-23 does, at batch 10. RLH-15 cannot decide the layering of a function it does not write. **Fix:** reassign P-Q-04 to RLH-15 (or fix it in the PLAN, since §4's four closed catalogues are already frozen there by RLH-05) and P-Q-03 to RLH-23. | §13.1 P-Q-03/P-Q-04 |
| F-08 | Medium | Cross-Feature | **The watchdog figure is understated, the "one second of headroom" premise is false, and the pre-flight gate asserts the number with no measurement method or tolerance.** Re-measured at HEAD: jest reports `Time: 179.924 s`, but the **wall clock of the command an agent actually issues is 180.56 s** (`npm test … 3:00.56 total`) — jest's figure excludes npm and node startup and teardown. So the suite does not sit "one second under the 180 s stall watchdog" (§2.3, §13.3); it is **already over it**, before this feature adds ~70 new tests across 15 new/extended files. Consequences for verifiability: (i) §4.1's pre-flight row asserts "179 s" without saying which of the two numbers is measured, or what deviation fails the gate — as written it is unfalsifiable and RLH-01 will pass on either reading; (ii) the PLAN carries no projected post-feature wall time and no threshold at which the procedural mitigation is declared insufficient, so §13.3's "record the wall time in the batch commit so the trend is visible" produces a trend nobody is obliged to act on; (iii) §2.2 mandates the *whole* suite at each of 16 batch gates, so the growing figure is on the critical path 16 times. §2.3's background-run / >300 s-timeout procedure is the right *tactical* answer and I do not ask for it to be replaced — but it is not a structural one. **Minimum fix:** correct the figure to the wall-clock measurement, give §4.1's row an explicit command and a stated tolerance, and add one measured, recorded projection (or a named late-batch gate that measures the post-feature wall time and halts above a stated ceiling). Sharding is a legitimate structural option but I am not requiring it. | §2.3, §4.1, §13.3 |
| F-09 | Low | Local | §4.2 states batch 3's width as "**nine** tasks (RLH-05, 07, 08, 09, 19, 21, 22, 24, 25)". **RLH-28 is also batch 3**, making ten. §4.2 is billed as the mechanical count and §5's manifest is billed as "the mechanical audit of the single-writer-per-batch premise", so a miscount there erodes the one place a reader checks the premise. (The batch column itself is correct; only the count is wrong. Related: the critical path is described as "fifteen links" over fifteen nodes, i.e. fourteen edges.) | §4.2 |
| F-10 | Low | Local | **RLH-02 canonicalises seam doubles but nothing canonicalises this feature's property-input generators.** `driftGenerators.js` supplies primitives only (`int`, `pick`, `shuffle`, `bytes`) — verified. The seven §8.2 properties need *domain* generators: conforming/non-conforming review filenames (RLH-11), fenced-markdown documents (RLH-03), multi-byte and surrogate-pair strings (RLH-06), heading sets (RLH-12), force-phase token strings (RLH-14). Five tasks in three different batches will each hand-roll their own, with no owner and no reuse edge — the duplication class §1.2 makes this PLAN's central argument about. Consider extending RLH-02's remit (it is already `[Fake first]` in batch 2, before every consumer) to own a `helpers/rlhGenerators.js` alongside `seams.js`, or state explicitly that per-file generators are accepted and why. | §4 row RLH-02, §6.3, §7.2 |

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | RLH-20 (batch 9) adds `_git` to `orchestrate-queue.js`'s `main()`, but `QUEUE_ENTRY` does not supply it until RLH-32's edit 2a at batch 14. Between those batches the queue bundle is fresh but has an unwired seam on the status-write path, and AT-64 is derived from **`orchestrate-dev`**'s `main()` (TSPEC §8.5), so nothing observes it. Is that intentional (unmerged branch, end-state is what ships), or should RLH-20 carry a Node default for `_git` so no intermediate bundle is unwired? Not filed as a finding because the branch is not shippable until RLH-34, but the PLAN's own §3.2 argument against deferred rebuilds is "leaves the branch shippable-looking … at thirteen points in its history". |
| Q-02 | §9.2's returned-promise ruling says the exempted wrapper's "own name inherits the obligation" and "the wrapper is then scanned as an alias". At HEAD the load-bearing instance is an **anonymous** arrow (`batch.map((task) => agentFn(…))`) which has no name to inherit anything. It is correctly exempt under the first clause, but the second clause is inapplicable there — should RLH-31's test state that an anonymous arrow is exempt with no inherited obligation, so an implementer does not read the clause as requiring a named wrapper and "fix" correct source? |
| Q-03 | §12.3's DoD says "All 66 FSPEC ATs … are implemented". RLH-04's SKILL-amendment assertions and RLH-22's/RLH-29's signature and field-list assertions carry no AT id at all. Should they get `RLH-`-namespaced ids so §12.3's checklist is mechanically checkable, or is "one assertion per row of TSPEC §7.4" sufficient as a countable obligation? |

---

## Positive Observations

- **The baseline discipline is exemplary and it verifies.** §2.1's figures reproduce byte-for-byte on
  re-measurement; §2.2 states the gate as "no new failures", never "green"; the one permitted failure is
  correctly identified as another feature's deferral marker; and §11.3 H-k plus §13.2 P-Q-08 make
  deleting or skipping it a halt. This is the correct pattern for a suite that is red at HEAD.
- **The `RLH-AT-{N}` namespace is applied consistently.** §1.3 states the rule with the measured
  collision, §7's header restates it, §12.3's DoD requires it, and **no bare `AT-{N}` is anywhere
  prescribed as a jest test name** — every bare id is explicitly the FSPEC's numbering. The three
  TSPEC-local ids carry the `a` suffix as specified. Concern 4 is fully discharged.
- **Reuse over reinvention holds under inspection.** `driftGenerators.js`'s claimed exports and
  `PDLC_PROP_SEED` override are real; no task owns, modifies or duplicates it; §6.3's "explicitly not
  reused" table gives a reason per row at the point of temptation, and RLH-02's single-owner seam module
  removes the ad-hoc-double class outright. Concern 2 is fully discharged.
- **The batch DAG is mechanically correct.** All 34 rows satisfy `batch == max(dep batch) + 1`; the graph
  is acyclic with unique ids and resolving edges; no batch contains two tasks creating or appending the
  same new file. §3.2's `dist/` serialisation argument is sound and the `[dist]` labelling lets a reader
  distinguish a wall-clock edge from a correctness edge — a genuinely useful convention.
- **Single-owner-per-test-file (§5.3) is the right call** and removes a whole conflict class. Its
  interaction with late-decided open questions is F-02, but the rule itself is correct.
- **The red-before-green order holds everywhere.** Every green task's `Deps` include the red task that
  owns its test file, and every `[Fake first]` task precedes its consumers. No implementation task lacks
  a preceding red-test row.
- **§9's traps are the right traps.** The AT-19-must-not-derive-from-the-parameter-list argument, the
  alias-scanning "passes vacuously — the worst possible failure" warning, and §11.3 H-h/H-i's refusal to
  widen a guard are exactly the disciplines that keep a load-bearing oracle load-bearing. F-01 is that
  the bookkeeping undercuts them, not that the reasoning is wrong.
- **§10.3 and §13.2 state what cannot be tested plainly** rather than implying a guarantee.
  `MAX_AUTHORING_WRITE_BYTES` having no oracle, and the advisory-only proxy being forbidden from
  halting, is honest and correct — an under-claimed oracle is worth more than an over-claimed one.
- **§12.4's prohibition on RLH-34 fixing its own findings** preserves the only independent signal in the
  plan.

---

## Recommendation

**Needs revision**

Three High and five Medium findings are open. Concretely, before Phase I starts:

1. **F-01** — make `Greened by` per-AT and remove `RLH-AT-19`/`RLH-AT-20` from the permitted-red set
   entirely (both are green at HEAD; measured). Until this changes, the await guard is fail-open across
   the batch that introduces the riskiest await site.
2. **F-02** — add `Deps` edges (or hoist the decisions) so P-Q-01 and P-Q-02 are fixed **before** the
   test files obliged to pin them are written, and name the test that reds on a divergent shape.
3. **F-03** — build the SKILL↔fixture byte-identity detector §10.2/§11.3 H-j/§12.3 all assume, and
   correct §13.3's task id.
4. **F-04 … F-07** — split the two dual-owned ATs; add RLH-30 to RLH-21's `Greened by`; change "six new
   names" to five in §7's RLH-18 row; reassign P-Q-03 to RLH-23 and P-Q-04 to RLH-15.
5. **F-08** — correct the wall-time figure to the measured **180.56 s**, give §4.1's row a command and a
   tolerance, and add one projection or a measuring gate.

**On TDD-readiness overall:** the PLAN is close, and closer than any PLAN I have reviewed on this
feature's document chain. Every task names its test file; every AT has an owner; the batch arithmetic is
correct; red precedes green throughout; and RLH-28's, RLH-17's and RLH-31's tests were checked to be
genuinely falsifiable at HEAD rather than trivially green. What blocks it is not coverage but
**bookkeeping and decision ordering**: the permitted-red ledger is one granularity too coarse to protect
the feature's own load-bearing guard (F-01), two open questions are decided after the tests that must
encode them (F-02), and one advertised oracle does not exist (F-03). All three are editorial fixes to
this document, not respecifications — none requires reopening the TSPEC.

VERDICT: Needs revision
{"high": 3, "medium": 5, "low": 2}
