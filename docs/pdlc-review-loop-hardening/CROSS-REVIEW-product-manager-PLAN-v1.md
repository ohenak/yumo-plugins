# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` (v1.0)
**Scope:** Product lens over the PLAN — coverage of every REQ acceptance criterion and FSPEC obligation
by an owning task, scope discipline in both directions, whether the end-to-end operator outcome (H-1…H-4
removed, nothing left unwired) is actually delivered, and whether the four deferred questions
(`P-Q-01`…`P-Q-04`) are implementation details or design decisions being smuggled into Phase I. Not
reviewed: technical design choices, test-strategy adequacy, batch-scheduling mechanics as engineering.
**Date:** 2026-07-30
**Iteration:** 1
**Sources verified against:** REQ v1.6, FSPEC v1.8, TSPEC v1.5, and the tree at HEAD on
`feat-pdlc-review-loop-hardening`.

Phase D was assessed and deliberately skipped; the absence of a DECISIONS document is by design and is
not raised.

---

## Coverage audit — the headline

**No acceptance criterion and no FSPEC obligation is left without an owning task.** Verified
mechanically, not impressionistically:

- **ATs.** FSPEC v1.8 carries `AT-01` … `AT-66` with no gaps (confirmed by enumeration). Every one of
  the 66 appears in §7's task→AT table with both an *authoring* task (the RED suite that specifies it)
  and a *greening* task. I walked the whole range looking for an orphan and found none.
- **Obligations.** §8.1's O-rows are exactly TSPEC §9.1's — `O-1`…`O-9`, `O-16`…`O-21`, with
  `O-10`…`O-15` correctly absent as retracted during FSPEC review. Each carries at least one building
  task, and the two narrow discharges (`O-19`'s missing oracle, `O-8`'s v1.5-narrowed form) are carried
  forward with the narrowing stated rather than quietly widened.
- **REQ ACs.** The PLAN traces through FSPEC obligations and ATs rather than to the 57 `AC-*` ids
  directly. Given both of those sets are complete and the FSPEC's approved §2.1 catalogue maps AC ranges
  onto them, transitive coverage holds. I do **not** ask for a fourth traceability table.
- **Baseline and exit criterion (concern 4) — confirmed correct.** §2.2 states the gate as
  "**1038 passing / 1 failing / 70 skipped or better**, the one failure still `documentOracles.test.js`
  `AT-22 [red-until-L-06]` and no other," never "green". This matches TSPEC §8.3 verbatim in substance.
  `AT-22 [red-until-L-06]` is correctly identified as the preceding feature's deliberate marker — I
  confirmed the literal test name at `pdlc/workflows/__tests__/documentOracles.test.js:245`, and
  confirmed 36 suites exist. `§11.2 H-k` and `§13.2 P-Q-08` protect its identity. `§1.3`'s `RLH-AT-{N}`
  namespace is a genuine, measured collision fix.
- **Spot-checks of the `RLH-01` pre-flight premises all held** at HEAD: `main()` carries exactly sixteen
  `_`-prefixed parameters (`_agent`…`_sleep`, and `_writeFile` is **not** among them); `reviewLoop` and
  `checkConverged` have seven call sites each; `rewriteStatus` is defined but not exported from
  `orchestrate-queue.js`. No pre-flight row was asserted into existence.

**Scope discipline is good in both directions.** §11.4's four halt rows (`H-m`…`H-p`) fence off exactly
TSPEC §2.2's and §2.6's exclusions, §6.3's "explicitly not reused" table blocks the five reinventions the
TSPEC named, and no task builds anything the approved documents did not ask for. §5.5 is explicit that
`.claude/workflows/` is written by no task.

**The unwired-composition-root defect class is addressed end to end**, which is the single most important
thing I checked. The chain is complete: `RLH-18` adds the seams to `main()`, `RLH-32` adds the adapter
implementations *and* all four `build-runtime.mjs` edits (including edit 2b, which the TSPEC says
conflating "leaves the production path unwired behind a green suite"), `RLH-31` writes `RLH-AT-64` as a
*derived* wired-or-exempt guard against the production composition root with no injection, `RLH-33`
rebuilds after the version bump, and §12.3's checklist re-verifies both bundles and the untracked consumer
copy. The one thing I would have flagged as fatal — a seam wired in the module and never reaching the
bundle — is closed by design here.

---

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | **High** | Local | **`P-Q-04` presents an already-settled interface contract as an open question, and hands it to the wrong task.** TSPEC §3.7 pins the shape outright: `export function parseForcePhases(raw) → { ok: true, phases: Set<string> } \| { ok: false, badTokens: string[] }`. TSPEC §3.1 separately pins `main()`'s `forcePhases = null` as a **raw operator string, unparsed**. So on either reading of "arrives", there is nothing under-specified: the parameter is a string and the parsed result is a `Set`. §13.1 nevertheless files it as "genuinely under-specified", tells Phase I to "fix it in `RLH-30`", and thereby licenses an `Array` — a divergence from an approved §3.7 interface, decided by an agent rather than by a spec revision. Compounding it, `RLH-30` is "GREEN the report surface" in **batch 13**: it neither produces nor consumes `forcePhases`, and it runs *after* `RLH-15` (batch 6) writes `parseForcePhases`, `RLH-18` (batch 8) declares the parameter, and `RLH-26` (batch 11) performs the membership tests. The nominated decider is three consumers too late. **Remedy: delete `P-Q-04` and cite TSPEC §3.7 in `RLH-15`'s row.** | AC-4.5, AC-4.6, AC-4.6a (O-9); TSPEC §3.1, §3.7 |
| F-02 | **Medium** | Local | **`P-Q-03` is also not open, and is also assigned to a task that writes none of the code in question.** TSPEC §5.6.1's `refreshReviewState` pseudocode fixes the layer the PLAN calls unfixed — the `ListFailure` branch (`dir_missing ─► r.files ← []`, otherwise halt `Cannot enumerate {dirPath}: {reason}`) sits **inside** the helper, above the `deriveRoundWindow` call. The PLAN's own guidance ("choose the callee") happens to land on the right answer, which is why this is Medium and not High — but it is filed as a gap the TSPEC left, and it is closed by **`RLH-15`** (batch 6, the five pure record parsers), which builds no listing code at all; `refreshReviewState` is `RLH-23`, batch 10. The stated safety evidence is wrong too: "asserted by `RLH-AT-30`-family tests either way" — TSPEC §8.3 assigns `AT-30`…`AT-34` to *queue-row commit and commit-failure branches*, not to the listing disposition, which is `AT-05` and `AT-43a`(b). **Remedy: delete `P-Q-03`; cite TSPEC §5.6.1 in `RLH-23`'s row.** | AC-1.1, AC-1.1a (O-1); TSPEC §4.2, §5.6.1, §6.2 rows 1/2/17 |
| F-03 | **Medium** | Local | **The one mitigation carrying TSPEC Q-09's *acute* false-halt risk is owned twice, inconsistently, and the assertion the DoD demands is owned by nobody.** §10.2 says the mitigation "lives in one task": `RLH-12` copies `completeness.test.js`'s heading fixtures verbatim from the SKILL templates. §13.3 says something different — "`RLH-31` asserts byte-identity so the drift is caught rather than removed". `RLH-31` owns `runtimeBundle.test.js` (bundle structure and freshness) and is in no position to assert anything about SKILL templates. §12.3 then makes it a Definition-of-Done row ("`completeness.test.js`'s heading fixtures are byte-identical to the SKILL templates"), so a checklist row exists that no task in §4 or §5 produces the evidence for. Two statements of one rule that disagree is precisely `§11.1 H-b`, in the document that names that failure class as its organising principle. It matters because the failure mode Q-09 guards is *a correct document scored incomplete* — a false halt, i.e. the exact harm this feature exists to remove. **Remedy: pick one owner, delete the other statement, and if the §12.3 row stays, name the task that writes the assertion.** | AC-3.4, AC-3.5 (O-7); TSPEC §10.2 Q-09 |
| F-04 | **Medium** | Process | **§1.2's and §14's "no behaviour restated — every rule is cited" claim does not hold, and the exceptions are all closed catalogues.** Verified by sampling against the sources: §9.1 reproduces TSPEC §1.4's C-2 sentence and its eleven-host-global list very nearly word for word; §9.2 reproduces the **closed thirteen-name** seam list verbatim (FSPEC AT-19 / TSPEC §8.5); §9.3 reproduces §8.5's twenty-one/thirteen counts; §4's `RLH-14` row reproduces the operator-facing literal `Valid: R, F, T, P, D, PR, all.`; §12.3 reproduces the halt string `Cannot enumerate {dirPath}: {reason}`. Every copy is **accurate today** — I diffed them — which is exactly what made the six copies of the `ListFailure` contract survive four TSPEC rounds before drifting. §1.2 argues that a PLAN which re-describes a rule "becomes the seventh copy and is wrong within a round"; §9 is that seventh copy. I explicitly **exempt** §12.3's one-line checklist rows that merely name an invariant to be checked, and §2.1/§2.2's baseline figures, which are process facts the PLAN owns. **Remedy is deletion, not reconciliation: strike the enumerations from §9.1/§9.2/§9.3 and the literal from `RLH-14`, keep the citation.** This also recovers most of the byte overage, so it resolves the size question in the same edit. | TSPEC §1.4, §8.5; PLAN §1.2 |
| F-05 | Low | Local | **§4.2's batch-3 count is wrong.** It states batch 3 is one of the two "widest batches — **nine** tasks" and enumerates `RLH-05, 07, 08, 09, 19, 21, 22, 24, 25`. `RLH-28` also carries `Batch 3`, so batch 3 has **ten** tasks and the enumeration is short one. No correctness consequence (the dispatcher re-derives the column from `Deps`, which I checked arithmetically for all 34 rows and found consistent; `RLH-28` owns a distinct new file so the single-writer premise still holds), but §4.2 and §5 are both presented as *mechanical* audits. | PLAN §4.2 |
| F-06 | Low | Local | **§4's `Greened by` column under-reports one file's greening tasks, which loosens §2.2's gate for four batches.** `RLH-06` (owner of `approvalHash.test.js`) lists `Greened by: RLH-10, RLH-26`. But §7 has `RLH-16` greening "`AT-15`, `AT-16`, `AT-18`'s staleness half" in that same file, and `RLH-16`'s own `Test File` column includes `approvalHash.test.js`. Since §2.2 derives the permitted-red set *mechanically from this column*, those three tests stay permitted-red from batch 7 through batch 11 when a failure after batch 7 is already a regression. Add `RLH-16` to the cell. | PLAN §2.2, §4, §7 |
| F-07 | Low | Local | **`RLH-18`'s row says "the six seams"; there are five.** The row then lists exactly five Node defaults (`defaultListFiles`, `defaultWriteFile`, `defaultAppendFile`, `defaultGit`, `defaultRecordHalt`), §9.3 says "sixteen today plus **five** seams", and TSPEC §3.1 states outright that "`forcePhases` is data, not a seam: it carries no default implementation and is never called". `RLH-17`'s "six new `main()` parameters" is the correct count of *parameters*. As written, an agent could go looking for a sixth Node default and a sixth adapter entry. Say "five seams and the `forcePhases` data parameter". | TSPEC §3.1; PLAN §4, §9.3 |
| F-08 | Low | Local | **`RLH-24` must write a RED suite in batch 3 for a function `P-Q-01` says is not named until batch 11.** §11.5 `N-b` and §13.1 `P-Q-01` both say "name it once, in `RLH-26`", and keep it non-exported "unless `approvalSearch.test.js` needs the seam" — but `approvalSearch.test.js` is authored eight batches earlier by `RLH-24`, and §5.3's single-owner rule forbids `RLH-26` from appending to it. Either the test drives the search through the module's exported surface (in which case say so, since it decides the export question, not `RLH-26`), or the naming decision actually lands in `RLH-24`. | PLAN §5.3, §11.5 N-b, §13.1 P-Q-01 |
| F-09 | Low | Local | **TSPEC §5.1's file-verdict extraction is named in no §4 task row.** §5.1 is a three-step procedure with its own observable rule — the duplicate-`VERDICT:`-line **pre-count** that fails closed, which is `AT-11`'s oracle — and it is not `parseVerdict` (which TSPEC §3.9 keeps unchanged). Its only trace in the PLAN is §8.1's `O-17` row (`RLH-10, RLH-15, RLH-26`); no task row mentions §5.1, and `RLH-26`'s row cites the *other* pre-count (§5.3's anchor count-and-compare). It is reachable in practice, because §5.4's pseudocode says `verdict ← §5.1 over text`, so this is a traceability gap rather than a hole — but §5.3's "`parseVerdict.test.js` needs no change" plus a §4 that never mentions §5.1 is how an unbuilt step survives. Add §5.1 to `RLH-26`'s row. | AC-4.2, AC-4.3 (O-17); TSPEC §5.1 |

---

## Judgements requested

### Batching granularity — acceptable, mildly over-fragmented, not a defect

I accept §3.2's premise: TSPEC §7.3's same-commit rebuild rule makes `pdlc/workflows/dist/` a shared
write surface, so one source-writing task per batch follows, and the rejected alternative (defer all
rebuilds to one end task) really would leave thirteen intermediate commits shippable-looking with a
stale bundle. The `[dist]` labelling of serialisation edges is a good touch — it tells a reader which
edges are correctness and which are wall-clock.

But 34 tasks is finer than the constraint requires, and the PLAN half-admits it: §4.2 says "nothing
shortens [the critical path] except merging source tasks", then declines to merge only `RLH-23`, `26`
and `27` — for good reasons I agree with. The unexamined case is the **pure-function segment**:
`RLH-05`, `10`, `13`, `15`, `16` occupy batches 3–7, one per batch, and they are five mutually
independent leaves — the constants/catalogues/`scanLines`, the digest family, the filename grammar and
round window, the five record parsers, the two judgements. Every one of their RED suites already exists
by batch 2; none of them consumes another's output except through the `[dist]` serialisation edge (the
sole exceptions are real and local: `RLH-15`/`16` genuinely follow `scanLines` and the digest).
Collapsing them into two tasks would remove **three batches — roughly a fifth of the schedule** —
without touching §3.2, because the rule bounds *tasks per batch* and merging tasks is the sanctioned way
to satisfy it. The counter-argument (five commits give five reviewable units, and a red in batch 5 names
one small subject) is legitimate, which is why this is a judgement and not a finding.

So: the batch count is *earned* by the constraint at the top and the bottom of the lane, and merely
*chosen* in the middle. I would take the merge. I do not block on it, and I would not accept merging
`RLH-23`/`26`/`27`, where all four defects actually get fixed.

### The 180 s watchdog — procedure is sufficient, and the framing understates the hazard

Sufficient, on three grounds. First, the escape is real and not merely hopeful: §2.3's inner loop is a
single-file `npx jest`, which is seconds, and the batch gate is explicitly "in the background … or with
an explicit timeout above 300 s. **Never in a blocking foreground call**" — a directive, not advice.
Second, §2.3 forbids the harmful mitigation in as many words ("Do **not** shorten the suite to fit the
watchdog. … The gate is the whole suite against §2.2 or it is not the gate"), which is the failure mode
I would actually have blocked on: a feature that exists to remove false halts must not buy its own gate
by deleting coverage. Third, §13.3 records the residual risk knowingly and asks for wall time in each
batch commit so the trend is visible.

One correction to the framing rather than the plan: "179.175 s … one second of headroom" reads as though
today's suite just fits. It does not — a default-timeout foreground tool call is killed well before
179 s, so the suite is *already* past the point where a foreground run works, and every test this
feature adds only widens a gap that is already negative. The mitigation is unchanged; only the "one
second" reassurance is wrong, and I would delete that clause and keep the directive. Filed here rather
than as a finding because it makes §2.3 *more* obligatory, not less.

### Size — 77,280 B, itemised, and I would not raise it *if* the no-restatement claim held

It mostly holds. §4's 34 rows, §5's ownership manifest, §7/§8's two traceability tables, §11's halt
conditions and §12's DoD are process content the PLAN legitimately owns and no upstream document
carries — I sampled them against REQ/FSPEC/TSPEC looking for restatement and largely did not find it.
The author's structural argument is honest and the compression offer (bare `§`-citations, folding §6
into §4's `Deps`) is real.

The exception is §9, and that is F-04. §9 is ~7 KB of which the load-bearing part — which task greens
`AT-19`/`AT-64`, and what an agent must not do to get there — is a fraction; the rest re-specifies C-2
and the two guards. Delete the duplicated catalogues and the overage and the drift surface go away
together. **A stated, itemised overage is not a product defect; a duplicated closed catalogue is.**

### Rulings on the four deferred questions

| # | Ruling | Reasoning |
|---|---|---|
| **P-Q-01** — the approval search's name | **Safe to defer. Genuinely an implementation detail.** | This is the one I was asked to look hardest at, and it survives. TSPEC §5.4 specifies the behaviour completely — full pseudocode, both non-approving exits, all four load-bearing properties (single-highest-round candidate, absent role is not approving, exclusive tier selection, no cross-tier completion), the bounded two-`_readFile` fan-out, and the G-INV routing of every exit. Its absence from every §3 interface table is **structural, not an oversight**: §3.7's table is by its own heading "synchronous, total, and takes no seam", and the search `await`s `_readFile`, so it cannot belong there; §3.2–§3.6 are seams and §3.8–§3.10 are other surfaces. Nothing observable turns on the identifier — no report line, no halt message, no persisted record, no AT. Deferring a name is not deferring a decision. Caveat at F-08: the *export* question is decided by whoever writes `approvalSearch.test.js` in batch 3, not by `RLH-26` in batch 11. |
| **P-Q-02** — how `startIndex`/`endIndex` are threaded | **Safe to defer, and correctly handled.** | This is TSPEC §10.3 `T-Q-02` verbatim, explicitly left to implementation by the approved TSPEC with "both shapes satisfy every AT". The PLAN improves on the deferral rather than merely inheriting it: it identifies the real hazard (four tasks must agree, which is the §1.2 drift class) and names a single decision point, `RLH-13`, cited by `RLH-23`/`26`/`27`. `RLH-13` is in batch 5, ahead of all three citers. Correct altitude, correct owner, correct order. |
| **P-Q-03** — where `refreshReviewState`'s `ListFailure` disposition is applied | **Not open, and mis-assigned. See F-02.** | TSPEC §5.6.1's pseudocode places it inside the helper. Delete the question. |
| **P-Q-04** — `forcePhases` as array or Set | **Not open, mis-assigned, and as written it authorises contradicting an approved interface. See F-01.** | TSPEC §3.7 pins `Set<string>`; §3.1 pins the `main()` parameter as a raw string. Delete the question. |

Read together, `P-Q-03` and `P-Q-04` are the same mistake twice: a question filed as "the TSPEC stops
here" when the TSPEC does not stop there, closed by a task that owns neither the code nor a batch early
enough to bind its consumers. Neither is smuggled *design* — the substantive answers were already made
upstream — but both invite an agent to re-decide a settled contract, and one of them (`P-Q-04`) would
diverge from §3.7 if the agent chose the other branch. §13.2's four *accepted* incompletenesses, by
contrast, are all correctly disposed and correctly fenced.

---

## Questions

| ID | Question |
|----|---------|
| Q-01 | §10.2's mitigation is that a SKILL-template change "reds the suite rather than a run". A one-time verbatim copy into `completeness.test.js`'s fixtures does not have that property on its own — if a SKILL template later changes and the fixture does not, both the fixture and §5.9's list are unchanged and nothing reds. The property requires a test that reads the *current* SKILL text and compares. TSPEC §10.2 makes the same claim, so the weakness is upstream and approved and I am not reopening it — but F-03 is where the PLAN can still decide whether §12.3's byte-identity row is a real assertion with an owner or should be softened to "copied verbatim at authoring time". Which is intended? |
| Q-02 | §5.3 excuses exactly two existing suites (`documentOracles.test.js`, `parseVerdict.test.js`) from the ownership manifest. TSPEC §8.3's closing paragraph lists `parseVerdict.test.js` among suites needing "mechanical updates", with the parenthetical "(unchanged behaviour; new file-path callers)". I read the two as compatible, but the manifest is silent on the ~20 *other* pre-existing suites (`orchestrate-dev.test.js`, `guardMatrix`, `queueDriftGate`, …). I spot-checked `orchestrate-dev.test.js` and it asserts `meta.inputs` by `find(i => i.name === "reqPath")`, so `RLH-18`'s added entry will not red it. Is "everything not listed in §5.3 needs no change" the intended reading? Stating it would close the gap between a manifest described as complete and one that enumerates only the touched files. |
| Q-03 | §4.2 recommends against merging `RLH-23`/`26`/`27` and gives split guidance for `RLH-26` "along step boundaries of TSPEC §2.5 … and re-read G-INV first". If `RLH-26` is split in flight, each piece lands in its own batch and the critical path grows. Is there a wall-time ceiling at which the PLAN would prefer to accept the coarser task, or is G-INV integrity unconditionally the tiebreak? (I assume the latter and agree with it; asking so the answer is recorded rather than re-litigated by an agent under time pressure.) |

---

## Positive Observations

- **The traceability tables survive verification, which is the thing I most expected to fail.** I checked
  §7 and §8 rather than trusting them: all 66 FSPEC ATs are present with an authoring *and* a greening
  task, and §8.1's O-rows match TSPEC §9.1 exactly, including the deliberate absence of the retracted
  `O-10`…`O-15` and the explicit note that `MAX_AUTHORING_WRITE_BYTES` has no oracle "and no task
  pretends otherwise". A table that admits what it cannot cover is worth more than a complete-looking one.
- **§8.2 closes the loop from defect to task**, and does the one thing a work breakdown usually omits:
  it names the *prompt-side* task alongside the code-side one for H-2 and H-3, and says plainly that
  `RLH-07`/`08`/`09` are load-bearing "even though they change no code". The persisted records of TSPEC
  §4.4 exist only if the agents write them; a plan that fixed only the script would have shipped a
  mechanism with nothing to read.
- **§10 is unusually honest about the limit of prompt verification** — "no test can assert that an Opus
  agent reading an amended SKILL will in fact emit the trailer … saying so plainly is better than
  implying a stronger guarantee." The three-layer table (instruction present / parser accepts what the
  SKILL asks for / runtime) is the right decomposition, and the L2 column's insistence that fixtures be
  parsed *through the production parser* is what stops the amendment being cosmetic.
- **§11's halt conditions are the correct product instinct at the correct altitude.** `H-b` (two TSPEC
  statements disagree → report both citations, do not reconcile), `H-h` (a red `RLH-AT-19` is a halt, not
  an invitation to widen the regex) and `H-j` (do not "fix" a drift-detecting fixture) all convert the
  exact failure modes this feature's own review history produced into blocking behaviour. `§12.4`'s rule
  that `RLH-34` may not fix what it finds preserves the only independent signal in the plan.
- **§2.2's `Greened by` mechanism is a genuinely good invention.** Making the permitted-red set
  derivable per batch, and declaring batches 2–3 RED-terminal by construction, is what lets a
  test-first plan of this size have a gate at all. F-06 is a single missing cell in an otherwise sound
  device.
- **§3.3 and §3.4 get the two orderings right for the right reasons** — `devModule` before `queueModule`
  because the queue prelude is `const realMain = __dev.main;` (a reversal throws at load and "no unit
  test of a source module can see" it), and the version bump *after* the build edits because the manifest
  records the version the bytes were built at. Both are verified against HEAD rather than asserted.

---

## Recommendation

**Needs revision**

What must change:

1. **Delete `P-Q-04`** (F-01) and cite TSPEC §3.7's `phases: Set<string>` in `RLH-15`'s row. As written
   the PLAN authorises Phase I to contradict an approved interface, in a task that runs three consumers
   too late to bind them.
2. **Delete `P-Q-03`** (F-02) and cite TSPEC §5.6.1 in `RLH-23`'s row; drop the incorrect
   "`RLH-AT-30`-family" evidence claim.
3. **Reconcile the Q-09 mitigation ownership by deletion** (F-03): §10.2 says `RLH-12`, §13.3 says
   `RLH-31`. Keep one. If §12.3's byte-identity DoD row stays, name the task that writes the assertion.
4. **Strike the duplicated closed catalogues from §9.1/§9.2/§9.3 and the operator-message literal from
   `RLH-14`** (F-04), keeping the citations, so §1.2's stated rule and the document agree. This also
   answers the size question.

F-05 … F-09 are Low and do not block, though F-06's missing `Greened by` cell and F-07's "six seams"
are both one-word edits worth taking in the same pass.

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 5}
