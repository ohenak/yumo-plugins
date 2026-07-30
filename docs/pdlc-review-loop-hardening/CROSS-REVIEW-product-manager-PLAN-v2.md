# Cross-Review: product-manager — PLAN (round 2, delta)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` (v1.1)
**Scope:** Delta review. Verification of my nine round-1 findings, plus a fresh product read of the
sections v1.1 changed or created — §2.1/§2.2/§2.3 (baseline, gate, watchdog), §4 (rebatched, `Greened by`
removed), §4.1/§4.2, §5.1, §6.2, §7.3/§7.4/§7.5 (the new per-assertion ledger, splits and non-AT ids),
§8.1/§8.2's re-pointed task column, §9.1/§9.2/§9.3 (post-deletion), §10.2, §11.3 `H-j`, §11.5 (the two
decisions), §12.3, §13.1/§13.1a/§13.3, §14.1. Not reviewed: unchanged text I passed at v1.0; REQ v1.6,
FSPEC v1.8, TSPEC v1.5 (approved upstream, not reopened); technical design choices; test-strategy
adequacy as engineering.
**Date:** 2026-07-30
**Iteration:** 2
**Diff base:** `8abe1aa` (PLAN v1.0) → `1019a3d` (HEAD, `feat-pdlc-review-loop-hardening`).
**Measured, not inferred (DC-02):** all claims below were checked against the tree at HEAD. Two
commands were run: `npx jest __tests__/parseVerdict.test.js` and `npm test -- __tests__/parseVerdict.test.js`.

**Byte count is not filed.** The overage is stated, itemised and traded against rationale prose my own
round-1 review judged legitimate. My round-1 formulation stands: a stated, itemised overage is not a
product defect; a duplicated closed catalogue is — and the catalogues are gone.

---

## 1. Verification of round-1 findings

| # | Sev (v1) | Disposition | Evidence (measured at HEAD) |
|---|---|---|---|
| **F-01** | High | **Fixed** | `P-Q-04` is deleted; §13.1 row 1 records the pinned contract. Both citations hold: TSPEC §3.1's code block carries `forcePhases = null, // §5.7 — raw operator string, unparsed` and the prose "`forcePhases` is data, not a seam"; TSPEC §3.7 declares `parseForcePhases(raw) → { ok: true, phases: Set<string> } \| { ok: false, badTokens: string[] }`. No residual open treatment: §4's `RLH-14` row now pins the return shape with a §3.7 citation, `RLH-05` (f) states it returns "the `Set<string>` shape §3.7 pins", `RLH-26` cites "the `Set<string>` of §3.7". `RLH-30` is named only historically ("v1.0's nominated closer"), never as decider. The word "array" survives nowhere as a live option. |
| **F-02** | Medium | **Fixed** | `P-Q-03` is deleted; §13.1 row 2 cites TSPEC §5.6.1, and the citation holds verbatim — the pseudocode reads `r ← await _listFiles(…)` / `if r is a ListFailure:` / `dir_missing ─► r.files ← []` / `otherwise ─► halt …`, all **above** `w ← deriveRoundWindow(…)`, inside `refreshReviewState`. Now owned by `RLH-23` in §4, whose row states it is "pinned, not a layering choice". The false `AT-30…34` evidence claim is withdrawn and correctly re-attributed in the same row. |
| **F-03** | Medium | **Fixed by withdrawal** | Nothing presupposes a detector. §12.3's byte-identity row is gone (no "byte-identical" string survives in §12.3). `H-j` now reads "**Not a halt — and not a detected condition.** Nothing in this feature watches for it", and forbids bolting a comparison on "under cover of this feature". §13.3 explicitly withdraws the `RLH-31` attribution. `RLH-12`'s row and §5.2 redescribe the fixtures as a point-in-time snapshot that "detects **no subsequent SKILL edit**". The residual risk is **properly bound, not prose-owned**: `docs/_queue/QUEUE.md` carries `Order 9 / pdlc-authoring-contract`, `blocked`, depends-on row 0, with Q-09 enumerated as "the acute one, and the reason this row exists at all" and `DC-08` cited by name. That satisfies DC-08. See Q-01 for one residual *outside* this PLAN. |
| **F-04** | Medium | **Fixed**, one Low residual | Sampled every enumeration I named. §9.1: the C-2 sentence and eleven host globals are gone — "TSPEC §1.4 owns the constraint in full … It is cited, not restated." §9.2: no thirteen-name list — "restated once in TSPEC §8.5 and cited — never re-enumerated — from here." §9.3: counts now attributed to §8.5 (but see L-06). `RLH-14`: the literal `Valid: R, F, T, P, D, PR, all.` is gone, replaced by "the literal in **TSPEC §6.2 row 12** — copy it from there, do not retype it from here", which is *stronger* than the copy it replaced. §12.3: the `Cannot enumerate {dirPath}: {reason}` literal is gone (but see L-03). **No load-bearing rule was deleted with the catalogues** — I checked specifically, having warned about this at TSPEC v1.5: §9.2 keeps all three call-site rulings (alias / returned promise / anonymous arrow) and the "must not share a derivation" rule with its `_now` / `_phaseDodEnabled` justification; §9.3 keeps all three traps and both anti-rot clauses; §12.3 keeps the `ListFailure`-one-halt-shape row. My exemptions were honoured (§12.3's one-line rows, §2.1/§2.2's figures kept). |
| **F-05** | Low | **Fixed** | §4.2 now reads "batch 3 — **ten** tasks (RLH-05, 07, 08, 09, 19, 21, 22, 24, 25, **28**)"; §1.1 agrees ("Batch 3 carries ten tasks"). I re-derived every `Batch` cell from the `Deps` column for all 31 rows: every one is `max(dep batch) + 1`, batch 2 holds nine tasks, batch 3 ten, batches 4–13 one or two with exactly one source-lane member. The critical path is thirteen nodes as claimed. |
| **F-06** | Low | **Fixed structurally** | The per-file `Greened by` column is deleted and §4 says so explicitly. §7.3 is per assertion. The specific hole I found is closed twice over: `RLH-AT-15/-16/-18` have their own row (green from batch 8, permitted red 2–7) naming both the `RLH-16` and `RLH-26` conjuncts. I also verified the new ledger is *complete and monotone*: all 66 FSPEC ATs appear (enumerated 1–66, no gap), every non-AT id from §7's authoring table appears, and no row's `Green from` batch precedes the batch of its greening task. Residual: L-05. |
| **F-07** | Low | **Partially fixed** | `RLH-18`'s and `RLH-17`'s rows are now correct ("five are seams … the sixth, `forcePhases`, is **data** … five Node defaults … five adapter entries later, not six of either. Do not go looking for a sixth"), and §9.3's "sixteen today plus five seams" phrasing is gone. But §6.3's first integration row still reads "the **six new seams** extend it **in place**" — the exact wording F-07 was about. See L-01. |
| **F-08** | Low | **Fixed** | §11.5 `N-b` decides it: non-exported, no test names it. `RLH-24`'s row now states it "drives the search **through `main()` with injected seams** (L2, §7), so it needs no exported identifier" — which removes the batch-3-writes-what-batch-11-names inversion I raised, rather than papering over it. |
| **F-09** | Low | **Fixed** | `RLH-26`'s row now names "**§5.1's three-step file-verdict extraction**" and, load-bearingly, "the **duplicate-`VERDICT:` pre-count that fails closed** (`AT-11`'s oracle, and a *different* pre-count from §5.3's)" — the distinction I asked for, stated at the owning task. |

**Judgements I was asked to re-check:**

- **`RLH-16` deliberately not merged — reasoning verified.** `RLH-12`'s earliest batch is 4 (`Deps` are
  `RLH-08`/`RLH-09`, both batch 3 behind `RLH-04` in batch 2), so a merged `RLH-05+16` would sit in batch 5.
  Re-deriving the lane from there gives `18/20/23/26/27/30/32/33` in batches 6–13 and `RLH-34` at 14 —
  **one batch worse than v1.1's 13**. The author's reason holds arithmetically.
- **`P-Q-01` decided in the PLAN does not contradict an approved interface.** The search appears in no
  TSPEC §3 interface table; TSPEC §5.4 specifies behaviour only; `N-b` exports nothing and names nothing
  observable. Consistent with my round-1 ruling.
- **The AT splits are faithful to their sources.** TSPEC §8.3 assigns `AT-19, AT-20, AT-64` to
  `runtimeBundle.test.js` alone (so `RLH-31` sole owner and the `RLH-WIRE-01` rename are both right) and
  `AT-21 … AT-27, AT-30 … AT-34` to `haltAndQueue.test.js` **plus** `orchestrateQueue.test.js` (so the
  per-conjunct `-module` / `-orch` split is a faithful reading, not an invention). `AT-61` is assigned to
  `pacingWrapper.test.js` only, and FSPEC `AT-61` genuinely carries two conjuncts joined by "**and**"
  ("all four are non-terminal **and** the report echoes …"), so `-loop` / `-report` splits the FSPEC's own
  conjunction. No AT was narrowed or widened by any split.
- **`P-Q-03`'s ruling (G-INV as unconditional tiebreak)** is recorded at §4.2 and §14.1. Accepted.

---

## 2. New findings

Scanned surfaces: the sections listed under **Scope** above. Findings are ordered by severity.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| **N-01** | **High** | Local | **The new `npx jest` finding is measurably wrong on the half that carries its force, and it is wired to a gate that halts the whole PLAN.** §2.3 and §4.1 both assert that bare `npx jest __tests__/parseVerdict.test.js` "reports `Tests: 0 total` and **exits 0** — a vacuous green". Measured at HEAD, twice: it reports `Tests: 0 total` **and `Test Suites: 1 failed`**, prints `Test suite failed to run … SyntaxError: Cannot use import statement outside a module`, and **exits 1**. (`npm test -- …` → 20 passed, exit 0 — that half is confirmed.) So it is not a vacuous green; it is a loud failure. This matters twice over. First, §4.1's row is a **blocking** pre-flight assertion and §11.2 `H-e` says any failed `RLH-01` row means "**Halt the whole PLAN at batch 1**" — so as written, the gate halts the plan on a premise that is false, and the only ways forward are a halt on a non-issue or an agent quietly editing the gate. Second, the mischaracterisation is the stated *reason* for §2.3's mandate, so an implementer who runs the command and sees an explicit parse error may reasonably conclude the PLAN's account of the tooling is unreliable — on the one page whose whole job is to be verified premises. The mandate itself (`npm test --`) is correct and should stand. **Remedy: restate both sites as measured — "reports `Tests: 0 total`, fails the suite with `Cannot use import statement outside a module`, exits non-zero, and runs no assertion" — and delete "exits 0" and "a vacuous green".** | PLAN §2.3, §4.1, §11.2 `H-e`; `DC-02` |
| **N-02** | **Medium** | Local | **§12.1's per-task gate mandates the exact command §2.3 forbids, and it cannot pass for any file in this feature.** §12.1 step 1: "Its own test file(s) pass under `npx jest <file>` — or, for a RED task, fail **only** for the stated reason (the subject does not exist yet)." Every test file in `pdlc/workflows/__tests__/` is ESM and needs `node --experimental-vm-modules`, which only the npm script supplies (this is v1.1's own §2.3 finding). Measured: under bare `npx jest <file>` the suite fails to *run*. So (a) all 31 tasks' per-task gate is unsatisfiable as written, and (b) the RED-task clause is actively harmful — a RED task's file fails for a **parse error**, not "the stated reason", which destroys the one discrimination the RED gate exists to make. Two statements of one rule disagree, and this is the §11.1 `H-b` class in the document that names it as its organising principle. §2.3 is the owning section and wins; §12.1 is the defect. **Remedy: §12.1 step 1 becomes `npm test -- <file>`.** | PLAN §2.3, §12.1; §11.1 `H-b` |
| **N-03** | **Medium** | Local | **§11.5 `N-a` relocates TSPEC §7.1 edit 3's arithmetic to the phase gate, and no §4 task row owns the relocated work.** The decision reads: "`endIndex` is computed **once** at the phase gate as `startIndex + MAX_REVIEW_ROUNDS - 1` (TSPEC §7.1 edit 3) and passed down, **never recomputed in the loop**." But TSPEC §7.1's edit-3 row has **`reviewLoop`** as its enclosing symbol and its Edit cell is "`if (iteration > endIndex)`, `endIndex = startIndex + MAX_REVIEW_ROUNDS - 1`", and §7.1's closing line says "Sites 1 and 3 derive from the constant **and** `startIndex`". Under `N-a`, site 3 derives from neither — it reads a parameter. Follow the ownership through §4 and the work vanishes: `RLH-27` owns "§7.1's five `MAX_REVIEW_ROUNDS` edits, all five anchored by enclosing symbol + distinctive literal" (i.e. edit 3 inside `reviewLoop`, batch 9); `RLH-26` owns only "all seven `reviewLoop` call sites passing the branch-derived **`startIndex`**" (batch 8) — `endIndex` is not mentioned in any §4 row, and neither is any gate-side computation; and `RLH-22`'s row still restates the in-loop form, "`if (iteration > endIndex)` with `endIndex = startIndex + MAX_REVIEW_ROUNDS - 1` (TSPEC §7.1 edit 3)". So an implementer working from §4 alone builds exactly what §11.5 forbids, at batch 9, against an oracle (`RLH-LOOP-01`, batch 3) written to the other shape. Compounding it, §11.5's enforcement pointer is dangling: "Picking the other shape in Phase I is a **§11.4 scope halt**" — §11.4 is a closed four-row table (`H-m`…`H-p`) and none of the four is this condition. **Remedy: name the owner. Add `endIndex`'s computation and the passing of both fields to `RLH-26`'s row (it owns the seven call sites), delete the formula from `RLH-22`'s row or mark it as the loop's *consumed* input, and either add a §11.4 row or drop the §11.4 reference and rely on `RLH-LOOP-01`.** | AC-5.1 (O-16); TSPEC §7.1 edit 3, §3.9; PLAN §4 (`RLH-22`/`RLH-26`/`RLH-27`), §11.4, §11.5 |
| **N-04** | **Medium** | Local | **`N-a` decides a threading shape that one of its two named consumers cannot take, and the consumer that needs the values has no task supplying them.** §11.5: "`checkConverged` receives it the same way" — i.e. as sibling fields on a destructured options object. `checkConverged` has no options object. TSPEC §3.9 pins it positionally, `function checkConverged(loopResult, phaseId, phaseLabel, recordPhase)`, and says it "gains **`feature`**" — nothing else; verified at HEAD, `pdlc/workflows/orchestrate-dev.js:496`, four positional parameters and seven positional call sites. Meanwhile TSPEC §7.1 site 1 (also `checkConverged`) requires its message to name "`rounds ${startIndex}..${endIndex}`", so the function does need both values — and §4's `RLH-27` row says only "`checkConverged` gains `feature`". The result is that the PLAN's decision is either unimplementable as phrased or authorises converting an approved positional signature to an options object, and either way no task row hands `checkConverged` its two new values. That the TSPEC is itself thin here (§3.9 grants only `feature`, §7.1 site 1 needs two more) is precisely what the PLAN was supposed to notice — §11.1 `H-b`. **Remedy: state `checkConverged`'s shape separately and concretely (two additional positional arguments beside `feature`, or a stated `H-b` report if the author judges §3.9 and §7.1 to be in conflict), and name the values in `RLH-27`'s row.** | AC-5.1, AC-2.3 (O-16); TSPEC §3.9, §7.1 site 1; PLAN §11.5 `N-a`, §4 `RLH-27` |
| **L-01** | Low | Local | **F-07 residual: §6.3 still says "the six new seams".** The first integration row reads "`main()`'s existing sixteen-parameter destructured list | the **six new seams** extend it **in place**". §4's `RLH-18` row, which owns the count, now says five seams plus one data parameter, and TSPEC §3.1 says outright that `forcePhases` "is data, not a seam". One-word fix; the owning section is already right. | TSPEC §3.1; PLAN §4, §6.3 |
| **L-02** | Low | Local | **§8/§9's references into `RLH-05`'s new sub-groups point at the wrong letters.** The `(a)`…`(f)` labels are new in v1.1 (created by the four-task merge) and §4's `RLH-05` row is their owning definition: (a) constants, (b) catalogues, (c) `scanLines`, (d) digest, (e) `parseReviewFilename`/`deriveRoundWindow`, (f) the five record parsers. Against that: §8.1's `O-2` (TSPEC §5.2) cites "RLH-05 **(b)**" where §5.2 is group (e); `O-3` (§5.8) cites "RLH-05 **(a)** (`parseResolvedMarker`, `extractRecommendation`)" where those two parsers are (f); `O-17` (§5.1, §5.3, §4.3) cites "RLH-05 **(a)**" where §4.3's parsers are (f); §8.2's `H-1` row cites "RLH-05 **(b)** (derivation)" where the derivation is (e). §7.3's ledger and §9.1 use the letters correctly, so this is confined to the two traceability tables. Not a `file:line` drift and so not R-6-exempt: it is a coverage table pointing an implementer at the wrong half of a task. No consequence for the build (the letters live inside one task, one commit), which is why it is Low. | PLAN §4 `RLH-05`, §8.1, §8.2 |
| **L-03** | Low | Local | **F-04's deletion left a §12.3 checklist row garbled.** The `ListFailure` row now reads "… produce **one** halt / halt shape at both — the one TSPEC §6.2 row 2 fixes, cited not restated", with a duplicated word and a broken continuation indent that drops the line out of the list item. The *rule* survives intact with its citation (I checked), so this is cosmetic — but it is a row `RLH-34` is supposed to execute mechanically, and §12.3's rows were exempted from F-04 on the grounds that they are one-line invariant checks. | PLAN §12.3 |
| **L-04** | Low | Local | **§7.5 asserts a §12.3 behaviour that §12.3 does not have.** §7.5: the fourteen non-AT ids "are named and countable anyway, because §12.3's checklist has to be mechanically checkable … **and §12.3 counts them separately**." §12.3 counts "All 66 FSPEC ATs plus `RLH-AT-01a`, `RLH-AT-13a`, `RLH-AT-43a`" and then says "every **AT** in §7 is green" — and §7.5's own point is that these fourteen are **not** ATs. Four of them (`RLH-WIRE-01`, `RLH-LOOP-01`, `RLH-LOOP-02`, `RLH-REPORT-01`) appear in no §12.3 row at all; the nine `RLH-SKILL-*` are covered only obliquely by the SKILL-amendment row. The practical exposure is small because §12.2's per-batch gate reads §7.3's ledger, which does include them — so the harm is the false claim, not an uncaught red. **Remedy: add the one checklist row, or delete the clause.** | PLAN §7.5, §12.3 |
| **L-05** | Low | Local | **§12.2's gate names a column that no longer means what the sentence needs.** Step 2 excuses "only those `RLH-AT-*` tests whose **`Greened by`** batch has not yet completed" — but §4 now declares "**There is no `Greened by` column**", and §7.3's `Greened by` column holds *task ids*, not batches; the normative window columns are `Green from` and `Permitted red`. The gate's own wording should quote the gate's own columns. | PLAN §4, §7.3, §12.2 |
| **L-06** | Low | Local | **Two absolute claims are contradicted by their own neighbourhoods — prefer deleting the clause.** (i) §4: "Three ids are retired … They appear **nowhere below and nowhere else in this document**; a reference to one is a stale reference." They appear four more times — §4.2, §13.1, §14.1 (twice) — all legitimately, as history. The clause as written makes correct text into evidence of staleness. (ii) §9.3: "The after-feature counts are **TSPEC §8.5's** (`twenty-one` and `thirteen`, the same three exempt) and **are not restated here**" — restating both counts in the sentence that denies restating them. F-04's remedy was deletion; delete the parenthetical or the denial. | PLAN §4, §9.3 |
| **L-07** | Low | Local | **§7.3's window for `RLH-AT-15/-16/-18` depends on a choice the ledger leaves open, and the ids it recommends are absent from §7.4.** The row instructs "**Write each as its own test**, `-stale` and `-gate`, and the windows separate to 2–5 and 2–7; written as one test the binding batch is 8" — so the table that §2.2 calls "the gate's only authority" carries two answers for three assertions, resolved by an implementer decision made in batch 2. §7.4 was created in v1.1 precisely to enumerate every split id and lists three splits, not four; §7's authoring row still reads "AT-12 … AT-18". Either mandate the split and register the ids in §7.4, or state one window. | PLAN §2.2, §7, §7.3, §7.4 |

---

## 3. Questions

| ID | Question |
|----|---------|
| Q-01 | **The successor surface still carries the claim the PLAN withdrew.** `docs/_queue/QUEUE.md`'s Order 9 note says of row 0: "its `completeness.test.js` fixtures are copied from the SKILL templates verbatim, so **a drift reds the suite rather than a run**" — which is exactly the property §10.2 now denies ("detects **no subsequent SKILL edit** whatever"). I am not filing this against the PLAN: `QUEUE.md` is outside the change surface and §11.4 `H-o` correctly forbids a Phase-I task from touching it. But the binding is now only as honest as the row it points at. Should the correction be carried on the operator's `QUEUE.md` edit when this row moves to `awaiting-merge`, or recorded in LEARNINGS for Order 9's REQ author? |
| Q-02 | **`startIndex` becomes a name with two meanings inside `reviewLoop`.** `N-a` adds `startIndex` as a destructured parameter; TSPEC §5.6.1's episode-entry pseudocode independently declares `{ present, reviewFiles, startIndex } ← await refreshReviewState()` per episode, inside the same function. Behaviour is unaffected as far as I can tell — the gate compares `iteration`, and `endIndex` is fixed from the parameter at the phase gate — but §11.5 is the section that took ownership of this shape precisely because four tasks must agree on it, and it does not mention the collision. Is the intent that the block-scoped refresh result shadows the parameter, and is `RLH-LOOP-01` expected to pin which one `endIndex` derives from? |
| Q-03 | **Does `RLH-01` measure, or assert, the wall clock?** §4.1 row 2 is careful and correct ("Advisory, recorded not asserted … it does **not** fail on it"), and then adds "If it exceeds **300 s** at HEAD, halt". That is an assertion with a threshold on a figure the same row calls not-a-gate. I read the two as compatible (advisory below 300 s, blocking above) and am not filing it — confirming that reading is deliberate. |

---

## 4. Positive Observations

- **The per-assertion ledger survives mechanical verification, and it is a real improvement, not a
  reorganisation.** I re-derived it rather than trusting it: all 66 FSPEC ATs appear across §7.3's rows
  with no gap and no duplicate, every non-AT id from §7's authoring table has a row, and no row's
  `Green from` batch precedes the batch of the task in its `Greened by` cell. The three green-on-arrival
  assertions are handled with real precision — `RLH-AT-19`/`-20` with an empty window ("nobody" in the
  `Greened by` cell is the honest answer and it is written), `RLH-AT-64` with a bounded 4–10 window whose
  two ends are attributed to the tasks that open and close it. I confirmed the premise underneath row 1:
  both anchored regexes match **zero** times in both tracked bundles at HEAD. Replacing a per-file
  column that fails open with a per-assertion table that fails closed is the single best change in v1.1.
- **The two "not open" questions were closed the way I asked — by deletion and citation, not by
  annotation.** §13.1 is two rows and both are pure contract records; the v1.0 mis-assignments are named
  as history so nobody reconstructs them. §13 shrank while its authority grew.
- **§7.3's closing note volunteers a defect rather than hiding it.** The queue bundle carries a
  declared-but-unsupplied `_git` from batch 5 to batch 10 and "**nothing reds**" — stated plainly,
  attributed, mitigated by the `RLH-32`→`RLH-20` dep, and then fenced with an instruction *not* to widen
  `RLH-AT-64` to cover it because that would red batches 5–10 by design. A plan that names its own
  invisible interval and declines the tempting fix is doing the job §11 describes.
- **§10.2 is now the model for how a deferral should read.** It says what was removed, why the removed
  claims were false, what the fixtures actually buy, what a real detector would cost ("a feature with its
  own REQ"), and where it lives — and the row it names exists, is `blocked`, depends on this feature and
  enumerates Q-09 by name. Compare v1.0's two mutually inconsistent owners for the same mitigation.
- **§2.3's rewrite understates nothing.** "Not 179 s, just under the ceiling, but already over it, and
  noisy upward", with the per-suite attribution that explains *why* the wall clock is not the sum
  (`driftFault.test.js` at 184.459 s of 184.752 s), a mandatory background directive, a 300 s halt, and
  the "do not shorten the suite" prohibition retained. The one-second-of-headroom clause I objected to is
  gone. The only thing wrong on this page is the exit code (N-01).
- **The merge was taken where it pays and refused where it does not, and both are defended with
  arithmetic.** Three batches recovered from the pure-function lane; `RLH-16` held out with a reason I was
  able to re-derive independently; `RLH-23`/`26`/`27` left alone, with `RLH-26`'s split guidance still
  subordinated to G-INV. §4.2 now reads as a decision record rather than a defence.

---

## 5. Is the PLAN executable as written?

**Almost — and the gap is narrow and mechanical.** Coverage is not the problem: every FSPEC AT and every
TSPEC §9.1 obligation still has an owning task, the batch arithmetic re-derives cleanly for all 31 rows,
file ownership remains single-writer per batch, and the unwired-composition-root chain
(`RLH-18` → `RLH-32` → `RLH-31` → `RLH-33` → `RLH-34`) is intact. Nothing is out of scope and nothing
approved was dropped.

What blocks execution is four things, all local:

1. An implementer who runs `RLH-01` as written gets a failed blocking row on the first command of the
   first batch, on a claim that is false (N-01).
2. Every task's own gate names a command that cannot run any test in this repo (N-02).
3. The one interface the PLAN chose to decide for itself, rather than defer, is decided in a section that
   no task row implements — and the task rows still describe the rejected shape (N-03).
4. That same decision prescribes a shape one of its two named consumers cannot take, and leaves the
   values that consumer demonstrably needs unassigned (N-04).

None of these requires a spec change, a new task, or a re-batching. Fix the two commands, and give
`endIndex` an owner and `checkConverged` a concrete shape, and this PLAN is executable by an implementer
who has only it and the approved specs.

---

## 6. Recommendation

**Needs revision**

What must change:

1. **N-01 (High)** — restate the `npx jest` behaviour as measured in **both** §2.3 and §4.1; delete
   "exits 0" and "a vacuous green". As written, `RLH-01` + `H-e` halt the plan at batch 1.
2. **N-02 (Medium)** — §12.1 step 1: `npm test -- <file>`, not `npx jest <file>`.
3. **N-03 (Medium)** — give `endIndex`'s gate-side computation and the passing of both fields an owning
   task row (`RLH-26`), reconcile `RLH-22`'s and `RLH-27`'s rows with §11.5, and fix or drop the
   dangling "§11.4 scope halt" pointer.
4. **N-04 (Medium)** — state `checkConverged`'s shape concretely against TSPEC §3.9's positional
   signature, and name `startIndex`/`endIndex` in `RLH-27`'s row.

L-01 … L-07 are Low and do not block. L-01 (§6.3's "six new seams") and L-03 (§12.3's garbled row) are
one-line edits worth taking in the same pass; L-02's four wrong group letters are worth taking because
the letters are new and nothing upstream cross-checks them.

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 7}
