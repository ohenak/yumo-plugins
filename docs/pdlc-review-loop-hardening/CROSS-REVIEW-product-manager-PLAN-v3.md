# Cross-Review: product-manager — PLAN (round 3, delta)

**Reviewer:** product-manager
**Documents reviewed:**
- `docs/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md` (v1.2, 128,930 B)
- `docs/pdlc-review-loop-hardening/TSPEC-pdlc-review-loop-hardening.md` (v1.6, 183,483 B) — **the
  single-item post-approval amendment only** (§0's v1.6 entry and §8.5's ruling table); the rest of the
  TSPEC is approved and was not reopened.

**Scope:** Delta review. Verification of my eleven round-2 findings (1 High, 3 Medium, 7 Low); a distinct
verdict on the TSPEC v1.6 amendment; a scan of the sections v1.2 changed — §1 header, §2.1, §2.3, §4
intro, §4's `RLH-22`/`RLH-26`/`RLH-27` rows, §4.1, §4.2, §5.2, §6.3, §7's `RLH-22` row, §7.2, §7.3
rows 1 and `AT-15/16/18`, §7.5, §8.1, §8.2, §9.2, §9.3, §11.4 `H-q`, §11.5, §12.1, §12.2, §12.3, §13.1,
§14.1, §14.2 — a spot-check of the §14.1 audit, and a judgement on executability at 129 KB. Not
reviewed: REQ v1.6, FSPEC v1.8, unchanged TSPEC sections, unchanged PLAN text I passed at v1.0/v1.1,
technical design choices, test-strategy adequacy as engineering.
**Date:** 2026-07-30
**Iteration:** 3
**Diff base:** `1019a3d` (PLAN v1.1, TSPEC v1.5) → `f1e16fc` (HEAD, `feat-pdlc-review-loop-hardening`).
**Measured, not inferred (DC-02):** every claim below was checked against the tree at HEAD. Commands run:
`npx jest __tests__/parseVerdict.test.js` and `npm test -- __tests__/parseVerdict.test.js` with exit codes
captured separately from the pipeline; an alias-aware scan of both bundle sources for non-`await`ed calls
of FSPEC AT-19's thirteen-name set; direct reads of `orchestrate-dev.js:496`, `:532`, `:605–620`,
`:1544–1572`, `:1860–1872`, `orchestrate-queue.js:512–528`, `runtime-adapter.js:58–75`.
**R-6 respected:** no citation or `file:line` drift is filed at any severity. Where a line number appears
below it is evidence for a *count* or a *classification*, which is the assertion, not the citation.

---

## 1. Verification of round-2 findings

| # | Sev (v2) | Disposition | Evidence (measured at HEAD) |
|---|---|---|---|
| **N-01** | High | **Fixed, and correctly as a withdrawal** | Re-measured with the exit code captured outside the pipeline: bare `npx jest __tests__/parseVerdict.test.js` → `SyntaxError: Cannot use import statement outside a module`, `Test Suites: 1 failed, 1 total`, `Tests: 0 total`, **exit 1**; `npm test -- __tests__/parseVerdict.test.js` → `20 passed`, exit 0. §2.3 now states exactly that and labels v1.1's "exits 0 — a vacuous green" **false and withdrawn**, in place, rather than deleting it. §4.1's row asserts the measured triple (suite-failed-to-run / `Tests: 0 total` / non-zero exit) plus the npm form's 20/exit 0, and adds the right forward guard ("if the bare form ever starts *executing* tests, the row fails"). `H-e` no longer fires on a false premise. The strings "exits 0" and "vacuous green" survive only inside the withdrawal text and §12.2's immunity paragraph, both correctly. |
| **N-02** | Medium | **Fixed** | §12.1 step 1 is `cd pdlc/workflows && npm test -- <file>`, citing §2.3 as owner, with bare `npx jest <file>` prohibited inline and the reason given. The RED criterion is now **assertion-level** — "the suite *runs*, and exactly the named assertions §7 assigns to this task fail, each on its own oracle; a suite that fails to *run* … is not a valid red" — which is a real improvement on what I asked for: it closes the parse-error-masquerading-as-a-red hole rather than just renaming the command. No prescriptive bare `npx jest <file>` invocation survives anywhere in the document. |
| **N-02b** *(the §12.2 half I did not file)* | — | **Volunteered and correct** | §12.2's new paragraph is true as written: step 2 asserts **absolute counts** ("1038 / 1 / 70 or better"), which a zero-test run fails, and §7.3 keys on named assertions, never exit status. The two named erosions (`--passWithNoTests`, a suite leaving jest's match pattern) are the right two. This is the correct scoping of my N-01/N-02 — the *batch* gate never depended on the mischaracterisation. |
| **N-03** | Medium | **Fixed** | `endIndex` has one owner. §11.5 carries an explicit three-row ownership table; `RLH-26` (batch 8) owns "compute `endIndex` once at the phase gate … pass `startIndex` **and** `endIndex` at all seven `reviewLoop` call sites **and** all seven `checkConverged` call sites", and §4's `RLH-26` row says the same with "No other site computes `endIndex`". `RLH-22`'s row no longer restates the arithmetic — it describes `endIndex` as a **consumed parameter** and attributes the arithmetic to `RLH-26`. **`H-q` exists**: §11.4 is now five rows (`H-m`…`H-q`) and `H-q` names all four §11.5 shapes, so the enforcement pointer resolves; the author added the row rather than deleting the pointer, which is the right choice because the condition is real. **"All seven sites" is the true count on both functions, measured:** `reviewLoop(` appears 8 times in `orchestrate-dev.js`, one of which is the `export async function reviewLoop({` definition at `:532` → **seven call sites**; `checkConverged` appears 8 times, one being `function checkConverged(loopResult, phaseId, phaseLabel, recordPhase)` at `:496` → **seven call sites**. See `N-02` below for a residual the reassignment created in §7.3. |
| **N-04** | Medium | **Fixed, and the author's reading of §3.9 is honest — not a stretch** | I checked §3.9's row verbatim at `TSPEC:781`. It grants `feature` **and**, in the same cell, "the literal `5`s become `MAX_REVIEW_ROUNDS` / `startIndex..endIndex` per §7.1" — so the approved row does contemplate the function reading both indices and is silent only on the channel. Stronger than the author claims: **TSPEC §10.3's `T-Q-02` explicitly leaves this to implementation** and names positional as one of the two contemplated shapes — "Passing them as two more positional arguments through three functions is ugly; a small per-phase record threaded once is cleaner but changes `reviewLoop`'s call signature at seven sites … **Left to implementation.** Both shapes satisfy every AT." So the PLAN is deciding a question the TSPEC handed it, in one of the two forms the TSPEC itself wrote down. No `H-b` report was owed and none was needed. **Is a seven-positional-argument call a defect in its own right?** Not a product defect, and I decline to file it: the TSPEC pre-accepted the ergonomic cost ("ugly"), the alternative would contradict §3.9's pinned shape, and the one real risk — two adjacent integers, silently swappable — is mitigated at the assertion level by `RLH-LOOP-02` driving `startIndex ≠ 1 ≠ endIndex` and asserting the rendered `rounds {startIndex}..{endIndex}`, written in batch 3, six batches before the consumer. Rejected alternatives are recorded with reasons. This is the model for how a PLAN should close a TSPEC-deferred choice. |
| **L-01** | Low | **Fixed** | §6.3's integration row reads "the **five** new seams — plus `forcePhases`, which is **data**, not a seam (TSPEC §3.1) — extend it **in place**". No "six new seams" survives. |
| **L-02** | Low | **Fixed, all four** | Re-derived against §4's `RLH-05` row, which is the owning definition of the letters — (a) constants, (b) the four frozen catalogues, (c) `scanLines`, (d) digest family, (e) `parseReviewFilename`/`deriveRoundWindow`/`reviewerSkillForSlug`, (f) the five record parsers. §8.1 `O-2` (§5.2) → **(e)** ✓; `O-3` (§5.8) → **(f)** ✓; `O-17` (§5.1/§5.3/§4.3) → **(d)** for the digest family + **(f)** for the record parsers + `RLH-26` for §5.1's extraction ✓ (better than a single letter — the row was carrying three sub-obligations); §8.2 `H-1` → **(e)** ✓. |
| **L-03** | Low | **Fixed** | §12.3's `ListFailure` row is one sentence again — "at both call sites the three non-benign values produce **one and the same halt shape**, the one TSPEC §6.2 row 2 fixes (cited, not restated …)" — duplicated word gone, indent repaired, citation intact. |
| **L-04** | Low | **Fixed, both halves** | §7.5 no longer claims a §12.3 behaviour §12.3 lacks; it now says why §12.3's AT-counting rows *cannot* reach the non-AT ids and that §12.3 therefore carries its own row. §12.3's new row exists and names all thirteen ids explicitly, with the reason ("this row is the only thing that requires them"). |
| **L-05** | Low | **Fixed** | §12.2 step 2 reads "only those assertions whose §7.3 **`Permitted red`** window contains the current batch. Read that column; the rule is not restated here." The dead `Greened by`-as-batch wording is gone. |
| **L-06** | Low | **Fixed by narrowing, which is what I asked for** | (i) §4 now says no task row, `Deps` edge, ledger row or traceability cell names a retired id, that §4.2/§13.1/§14's mentions are historical, and that a reference **as a live task** is stale — the absolute is gone and correct text is no longer evidence of staleness. (ii) §9.3's parenthetical restating the two counts is deleted; the reader is sent to TSPEC §8.5. |
| **L-07** | Low | **Fixed by withdrawal, and the reasoning is better than my finding** | §7.3's row is now "**Three tests, one per AT, no `-stale`/`-gate` split**", with the split explicitly withdrawn and a reason I did not have: FSPEC `AT-18` ("a record-less LEARNINGS passes the guard and the next Phase F **runs**") carries no staleness conjunct, so the split would have prescribed an empty `-stale` test. The ledger now carries one window for three assertions, and every id it names exists in the run. Cost (one batch of slack on `AT-15`/`-16`) is stated. |
| **Q-01** | — | **Disposed of correctly** | Routed to Harvest rather than actioned, with the right reason: `QUEUE.md` is outside the surface, `H-o` forbids a Phase-I task touching it, and the Order 9 REQ author is the reader who needs the correction. §10.2 remains the accurate account. Accepted. |
| **Q-02** | — | **Answered, and it produced a rule** | §11.5 now states that `reviewLoop`'s `startIndex` **parameter** is the loop-control value, that `refreshReviewState`'s per-episode field must be destructured under a distinct local name rather than shadowing it, and that `RLH-LOOP-01` pins which binding the gate reads by supplying a refresh returning a *different* index. That is more than I asked for and it is the right shape — a naming rule with an oracle, not a note. |
| **Q-03** | — | **Confirmed deliberate** | Unchanged, as I expected: advisory below 300 s, blocking above. |

**Verdict on the round-2 backlog: eleven of eleven resolved**, none by silent deletion, two (N-02's RED
criterion, L-07's withdrawal) resolved better than filed. Nothing from rounds 1–2 remains open.

---

## 2. Verdict on the TSPEC v1.6 amendment

**Reviewed as an amendment to an approved document.** I applied the same bar I have applied to this TSPEC
five times: an approved spec may be reopened only for what the evidence forces, in the section that owns
the rule, once.

**The forcing evidence is real and I re-measured it.** `orchestrate-dev.js:615–616` are bare, unaliased
`_agent(…)` calls as elements of an array literal passed to `await _parallel([…])` inside `reviewLoop`
(read at `:605–620`). `_parallel` resolves to the adapter's
`async function rtParallel(promises) { return await Promise.all(promises); }` (`runtime-adapter.js:67`,
read at HEAD) — the combinator **is** the await. The module's own stub is
`async function parallel(promises) { return Promise.all(promises); }` (`orchestrate-dev.js:1500`), awaited
by its caller. So the author's conclusion is correct: **the source is right and the guard was
under-specified**, and requiring a per-element `await` would serialise a deliberately concurrent
two-reviewer dispatch — a behaviour change for zero safety gain, and a red on shipped correct source,
which is the defect class §8.5 already exists to prevent.

**On the three criteria I said I would apply:**

| Criterion | Verdict |
|---|---|
| **Minimal?** | **Yes.** One ruling row, a two-clause widening of the closing catch-all, and one meta-rule paragraph. Item 3's "Not changed" list is accurate and I checked it: the thirteen-name set, the two anchored regexes, AT-64's derived seam set, E-1/E-2/E-3 and both anti-rot clauses are byte-identical; the only other diff in the whole file is the §0 changelog entry and the version/status line. REQ and FSPEC untouched. |
| **Stated once, in its owning section, with citers citing?** | **Yes, and this is the best-executed part.** §8.5 owns it; PLAN §9.2 **deleted** its three-row restatement of the ruling table in favour of a citation, and §9.3 deleted its restated counts. The PLAN got *shorter* exactly where the TSPEC grew. That is the precedence rule applied in the right direction. |
| **Contradicts anything else in the TSPEC?** | **One residual, Low** — see `L-01`. The alias row still instructs the scan to read "**the local name, not the `_`-prefixed one**", which the widened catch-all now overrides ("under its own `_`-prefixed name **or** under an alias, the two being the same obligation"). `:615–616` are called under the `_` name, so the exclusive half of the alias row's phrasing now forbids what the catch-all requires. |
| **Widens only what the evidence requires?** | **No — one Medium.** The closed combinator set admits `Promise.race` and `Promise.any`, which do not await every element. See `N-03`. |

**The `race`/`any` question, answered directly: yes, including them exempts a genuinely unawaited call.**
`await Promise.race([_agent(a), _agent(b)])` settles on the first element; the loser's promise is never
awaited, its result is discarded and a rejection surfaces as an unhandled rejection — precisely the C-2
failure mode (async adapter implementations, sync test doubles) that AT-19 exists to catch, and it would
pass the guard because the *outer* call carries `await`. `Promise.any` is worse: it ignores rejections by
construction. `Promise.all` and `Promise.allSettled` do await every element, so those two are sound.
Neither `race` nor `any` appears anywhere in either bundle source (measured: zero occurrences of
`Promise.race`, `Promise.any`, `Promise.allSettled`), so neither is admitted on evidence — and the
amendment's own item-3 meta-rule says the citations exist so "the predicate is known to be **exercised**
rather than hypothetical". Two of its six members are hypothetical, and one of the two is unsound.

**Amendment verdict: sound in its core ruling and exemplary in its ownership discipline, but it must be
narrowed before approval** — one Medium (`N-03`) and one Low (`L-01`), both in §8.5, both resolved by
deleting or tightening text rather than adding any.

---

## 3. Spot-check of the §14.1 audit

I checked all six annotated corrections against the two round-1 and round-2 test-engineer reviews and the
tree, plus a sample of the claims the audit certified as substantiated.

| Audit claim | My check | Result |
|---|---|---|
| TE F-10 "fixed as filed" was **false** | TE round-2 review row `F-10`: "**Not addressed** — and the changelog claim is false. I grepped the whole document for `rlhGenerators`, 'domain generator', 'per-file generator' … nothing." | **Substantiated.** §14.1 now records it as not fixed at v1.1, fixed by decision at v1.2, and §7.2/§5.2/§6.3 carry the decision with four reasons and a promotion path. |
| PM F-06 "greening at batch 6" was **false** | v1.1's §7.3 row read `batch 8 / batches 2–7`; my own round-2 verification recorded "green from batch 8". 6 is `RLH-16`'s batch. | **Substantiated.** Corrected to batch 8 with the mis-transcription named. |
| PM F-07 "fixed" was **overstated** | §6.3 did still say "six new seams" at v1.1 — that is my `L-01`, filed and now fixed. | **Substantiated.** |
| TE F-01 "fixed" was **overstated** | TE round-2 row `F-01`: "**Partially fixed** — the *mechanism* is right and its arithmetic is right (23/23 rows re-derived), but the row it exists to protect rests on an incomplete measurement." | **Substantiated.** |
| Q-03 "fourteen ids" was **false** | 1 (`RLH-WIRE-01`) + 2 (`RLH-LOOP-01`, `-02`) + 1 (`RLH-REPORT-01`) + 9 (`RLH-SKILL-01…09`) = **13**; §7.3 carries thirteen matching rows; §12.3 had no row until v1.2 added one. | **Substantiated.** |
| §14.1's TE F-07 entry described the wrong finding's remedy | TE round-1 F-07 was the two-open-questions finding; TE round-2 verified it as "**Fixed, and better than I asked for** … recorded as pinned TSPEC contracts in §13.1". v1.1 wrote "fixed throughout §7.3, §8.1, §8.2", which is not that remedy. | **Substantiated**, and this one the audit found itself. |
| Certified-substantiated sample: TE F-05, F-06, F-09 | TE round-2 rows read "Fixed" for each, and F-09's new §14.1 detail ("batch 3 is ten, critical path thirteen nodes") matches TE's own verification text. | **Accurate.** |

**One undisclosed seventh edit** — §14.1's TE F-08 entry silently lost the word "three" ("three runs of
one HEAD" → "runs of one HEAD"), because §2.3 now records five. The resulting sentence is true, so this is
not a false claim; but the audit's stated method is that corrections are "annotated in place", and this
one was made by deletion. Filed as `L-03`, at the lowest severity, because it is the same class the audit
was written to close and the author's own standard for the `npx jest` claim was explicit withdrawal rather
than quiet removal.

**Conclusion: the audit is honest and it holds.** I found no surviving false or overstated claim in
§14.1 — which is the first time in three rounds I have been able to write that about a changelog in this
document. §14.2's own dispositions also check out against the tree on every row I sampled.

---

## 4. New findings

Scanned surfaces: the sections listed under **Scope**. Ordered by severity.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| **N-01** | **High** | Local | **The replacement blocking premise is also measurably wrong, and it is wrong in the same way for the same reason: a hand-counted enumeration restated in four places instead of a predicate measured once.** §4.1's new **blocking** row asserts "the await-discipline scan `RLH-31` will encode has exactly **three** non-`await`ed call sites of FSPEC AT-19's closed thirteen-name list across `orchestrate-dev.js` and `orchestrate-queue.js`", enumerated as `:615`, `:616`, `:1867`, and adds "`orchestrate-queue.js` has none" plus "A fourth site … fails the gate and is blocking work before batch 2". **Measured at HEAD with an alias-aware scan there are five, and one of them is in `orchestrate-queue.js`:** `orchestrate-dev.js:615`, `:616` (`_agent`, own `_` name, combinator ruling); `orchestrate-dev.js:1569` — `` const agentFn = (skill, prompt, opts) => rawAgentFn(skill, prompt, { model: MODEL_DEFAULT, ...opts }); `` where `rawAgentFn` is `_agent`'s destructured alias (`_agent: rawAgentFn = agent`, `:1546`), returned-promise ruling; `orchestrate-dev.js:1867` (`agentFn(` as a `batch.map` arrow body); and **`orchestrate-queue.js:524`** — the identical wrapper `` const agentFn = (skill, prompt, opts) => rawAgentFn(skill, prompt, { model: MODEL_QUEUE, ...opts }); `` over that file's own `_agent: rawAgentFn` alias. The two wrapper-definition sites are not a debatable inclusion: TSPEC §8.5's returned-promise row cites **that exact construction** as its worked example, so §8.5 classifies it as a call site (exempt, obligation inherited by the wrapper's name). Any rule that counts `:1867` — a call of the *inheriting* alias — necessarily counts `:1569` and `queue:524`, which are calls of the *direct* alias. Consequences: (a) `RLH-01`'s row is blocking and §11.2 `H-e` makes a failed `RLH-01` row "halt the whole PLAN at batch 1", so the gate halts on a false count exactly as N-01 did last round; (b) "a fourth site … is blocking work" converts two shipped, correctly-exempt sites into a spec-amendment demand; (c) the same enumeration with the same line numbers and rulings is restated **four times normatively** — §4.1, §7.3 row 1, §9.2 item 1, §12.3's checklist — so the correction has four places to go stale, in a document whose organising principle is state-once-and-cite, and in the same round the TSPEC added a meta-rule saying an unmatched site is "never resolved by a clause naming a line number". **Remedy (deletion, not reconciliation): make §4.1's row assert the *property* — every non-`await`ed call site of the thirteen-name set, under its own `_` name or any alias including an inheriting wrapper, is classified by one of §8.5's three rulings, and the count is **recorded** — and delete the count and the site list from §7.3 row 1, §9.2 item 1 and §12.3, which should cite §4.1 and §8.5.** If a count is kept anywhere it is five, with `orchestrate-queue.js:524` named. | AC-4.x (FSPEC AT-19, C-2); TSPEC §8.5; PLAN §4.1, §7.3, §9.2, §11.2 `H-e`, §12.3; `DC-02` |
| **N-02** | **Medium** | Local | **v1.2 moved `reviewLoop`'s window destructuring from batch 7 to batch 9 and did not move its ledger row, so §7.3 — "the gate's only authority" — now greens an oracle two batches before the task that satisfies it, and §11.5 contradicts itself on the same page.** §11.5's new ownership table assigns "`reviewLoop` destructures both fields; the gate becomes `if (iteration > endIndex)` reading the parameter" to **`RLH-27`, batch 9**, and §4's `RLH-27` row repeats it ("`reviewLoop` destructures the same two as sibling fields and its gate reads `endIndex`"). But §7.3 still reads `` `RLH-LOOP-01` \| RLH-22 (3) \| **batch 7** \| batches 3–6 \| **RLH-23** ``, and §11.5's own closing "Oracles" paragraph repeats it: "`RLH-LOOP-01` (`RLH-22`, green from batch 7 — §7.3) asserts `reviewLoop`'s field shape, `iteration` at every call site, and termination on `iteration > endIndex`". §4's `RLH-23` row (batch 7) grants `reviewLoop` only `docType`, `_listFiles`, `_readFile` and no seed maps — it does not touch `startIndex`/`endIndex`. So at the batch-7 and batch-8 gates `RLH-LOOP-01` is red **outside** its permitted-red window, which §2.2/§11.3 make a regression halt; and an implementer cannot tell whether `RLH-23`, `RLH-26` or `RLH-27` owns the destructuring, with `H-q` promising a halt for choosing wrong. This is the ledger-versus-ownership inconsistency class I filed as N-03 last round, reintroduced by the fix for it — v1.1's `batch 7 / RLH-23` was correct for v1.1's shape and was left behind. **Remedy: one decision, then one cell. Either fold `reviewLoop`'s destructuring + gate into `RLH-23` (batch 7) and correct §11.5's table and §4's `RLH-27` row, or keep it in `RLH-27` and correct §7.3's row to `Green from 9 / Permitted red 3–8 / Greened by RLH-27` and §11.5's "green from batch 7".** Note that the second option leaves `RLH-26` (batch 8) passing two fields a callee ignores for one batch, which is harmless for an options object and worth stating if chosen. | AC-5.1 (O-16); PLAN §2.2, §4 (`RLH-23`/`RLH-26`/`RLH-27`), §7.3, §11.3, §11.4 `H-q`, §11.5 |
| **N-03** | **Medium** | Local | **The TSPEC v1.6 amendment widens the exemption past its evidence, and two of the six combinators it admits do not have the property that makes the ruling sound.** §8.5's new row exempts a thirteen-list call that is an array-literal element in the argument list of an `await`ed call whose callee is in the closed set "`_parallel`, `parallel`, `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`". The ruling's stated justification is that "the promises are awaited *collectively*, by the combinator" — true of `_parallel`/`parallel`/`all`/`allSettled`, **false of `race` and `any`**, which settle on one element and never await the rest. `await Promise.race([_agent(a), _agent(b)])` therefore satisfies the predicate while leaving one seam call genuinely unawaited, its result discarded and its rejection unhandled — the exact C-2 failure AT-19 is the only guard against, and the risk CLAUDE.md records as this repo's most expensive class (sync doubles pass, async adapter fails at runtime). Neither name has a shipped instance: measured at HEAD, `Promise.race`, `Promise.any` and `Promise.allSettled` appear **zero** times in either bundle source, so `race`/`any` are admitted on speculation — against the amendment's own new meta-rule that the citations exist so the predicate is "known to be exercised rather than hypothetical". Per R-5 the fix is deletion, not a reconciling clause. **Remedy: delete `Promise.race` and `Promise.any` from the set. Better, and in the spirit of the item-3 clause the amendment itself adds: state the property rather than the membership — "a combinator that awaits **every** element", with `_parallel`/`parallel`/`Promise.all`/`Promise.allSettled` as the instances — so the ruling stays a predicate and a future `race` is an unmatched site, i.e. blocking work, which is what it should be.** | AC-4.x (FSPEC AT-19, C-2); TSPEC §8.5 (v1.6 amendment, item 1) |
| **L-01** | Low | Local | **§8.5's alias row now contradicts the catch-all the same amendment widened.** The alias row instructs the assertion to "scan **the local name**, not the `_`-prefixed one", justified by "scanning the `_` name alone finds zero call sites and passes vacuously". The widened catch-all says the obligation holds "under its own `_`-prefixed name **or** under an alias, the two being the same obligation" — and `:615–616`, the very sites the amendment exists for, are called under the `_` name. The alias row's *purpose* (resolve aliases, don't scan only the `_` spelling) is intact and right; its exclusive phrasing is now false and reads as forbidding half of what the catch-all requires. The catch-all is the owning statement of which spellings are scanned, so the row is the restatement and loses. **Remedy: delete ", not the `_`-prefixed one" and the second sentence's absolute, or restate as "in addition to the `_`-prefixed one".** | TSPEC §8.5 (alias row vs. closing rule) |
| **L-02** | Low | Local | **Nobody owns writing `feature` into `checkConverged`'s seven argument lists.** §4's `RLH-27` row (batch 9) owns the *parameter list* — "`checkConverged` gains **three** positional parameters after `recordPhase` — `feature`, `startIndex`, `endIndex`". §11.5's ownership table gives `RLH-26` (batch 8) "pass `startIndex` **and** `endIndex` at … all seven `checkConverged` call sites", and §4's `RLH-26` row says "positionally after `feature`" — which presupposes `feature` is already in those argument lists, but no row says who puts it there. TSPEC §7.1's prose notes only that "`feature` is added to `checkConverged`'s parameter list; it is in scope at every call site". In practice `RLH-26` cannot write arguments 6 and 7 without writing argument 5, so the work is implicitly its — which is why this is Low, not Medium. **Remedy: add "`feature`" to `RLH-26`'s call-site clause and to §11.5's table row 1, so the seven argument lists have one owner for all three values.** | AC-5.1, AC-2.3 (O-16); TSPEC §3.9, §7.1; PLAN §4 (`RLH-26`/`RLH-27`), §11.5 |
| **L-03** | Low | Local | **A seventh §14.1 edit was made by deletion rather than annotation, outside the audit's own method.** §14.1's TE F-08 entry read "three runs of one HEAD, **185.43 s** wall" at v1.1 and now reads "runs of one HEAD, **185.43 s** wall" — the count was dropped because §2.3 now records five. The result is true, so nothing false survives; but the audit paragraph states that every corrected claim "is annotated in place", lists five plus one, and the author's own standard for the `npx jest` claim was an explicit **withdrawal** rather than a silent deletion. Applying that standard unevenly inside the section whose subject is uneven changelog claims is worth one sentence. **Remedy: either annotate it ("three → five, corrected at v1.2") or add it to the audit table as a seventh row.** | PLAN §14.1 (TE F-08), §14.2 audit |

---

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | **Does the `RLH-01` await-scan row want to be blocking at all, given what it now guards?** With `N-01` fixed, the row's real content is "the classification is total over the shipped sources" — an invariant `RLH-AT-19` itself asserts from batch 2 with an empty permitted-red window. A blocking batch-1 duplicate of an assertion that is green on arrival buys the pre-flight *diagnosis* (you learn at batch 1, not batch 2) but doubles the number of places a count can be wrong, which is how both N-01s happened. Would the row be stronger as advisory-and-recorded, with `RLH-AT-19` remaining the only blocking authority? I am not filing this — the pre-flight instinct is right and §4.1 is the correct home — but the answer decides whether the site list belongs anywhere but §4.1. |
| Q-02 | **Should `H-q` also cover the `refreshReviewState` shadowing rule?** §11.5's Q-02 answer creates a genuine new naming obligation (destructure the per-episode `startIndex` under a distinct local name), and `RLH-LOOP-01` pins the binding the gate reads — but `H-q`'s four enumerated shapes do not include it, so a task that shadows has broken a §11.5 rule with no halt row naming it. It is caught as a red, which may be judged sufficient; I would like the omission to be deliberate rather than an artefact of the row being drafted before the Q-02 answer. |

---

## 6. Positive Observations

- **The TSPEC amendment is the right instrument used the right way, and the PLAN paid for it in the right
  currency.** A single ruling row in the owning section; the PLAN *deleting* its restatement of that
  table in §9.2 and its restated counts in §9.3 to make room. Two rounds ago §9.2 held its own copy of
  the rulings and §9.3 its own copy of the counts. The rule now lives in one place and the PLAN points at
  it. That is the precedence discipline working in the direction it is supposed to work.
- **The catch-all fix nobody filed is the more valuable half of v1.6.** "§8.5's catch-all reached only
  *aliased* seams, so an unaliased call fell through the whole section" is a structural hole, and it was
  found by asking why the measured shape matched nothing rather than by patching the shape. That is the
  difference between fixing a symptom and fixing a guard.
- **`N-04` was resolved by reading the approved spec more carefully instead of amending it.** I filed it
  believing §3.9 granted only `feature`; §3.9's row grants both indices in the same cell and §10.3's
  `T-Q-02` hands the channel to implementation and names positional as one of two acceptable shapes. The
  author found that and declined to reopen the TSPEC. Given that the same round *did* amend the TSPEC
  where evidence forced it, the restraint here is evidence of judgement, not reluctance.
- **`L-07` was resolved with an argument I did not have.** I offered two options; the author took the
  withdrawal and justified it from FSPEC `AT-18`'s text — a record-less LEARNINGS AT with no staleness
  conjunct, so the split would have prescribed an empty test. That is a reason to prefer one option, not
  a preference.
- **§14.1's audit is the first clean changelog in this document's history.** Five false-or-overstated
  claims found, one more found by the audit itself, each annotated where it was written rather than
  quietly rewritten, and every one of the six substantiated when I checked it against the reviews and the
  tree. The line "a round that corrects five false changelog claims cannot also be the round that shrinks
  the changelog" is the correct trade and I accept it.
- **§7.2's generator decision reads as a decision, not a concession.** Four reasons, a stated schedule
  cost for the rejected alternative (one owner plus five `Deps` edges, a batch-2 file on `RLH-12`'s path),
  an explicit statement of what remains forbidden (a second *primitive* library), and a promotion path if
  a sixth caller appears. This is the §10.2 standard, applied to a Low.

---

## 7. Executability at 129 KB — judged directly

**The growth is legitimate normative content, and the document is still navigable. I am not filing the
size, and this time I have checked rather than reasoned.** The +31,850 B decomposes as: §11.5's rewrite
(two separated interface shapes, the rejected-alternatives records, the ownership table, the Q-02 naming
rule) — normative, and it is what closed my N-03/N-04; §7.2's generator decision — normative, and it
closed a finding that had been falsely reported fixed; §12.2's immunity paragraph — rationale, but
load-bearing rationale, because it is the only thing that tells a reader why the `npx jest` correction
does not weaken the batch gate; §14.2 and §14.1's annotations — a changelog, which is the surface a delta
review runs against and which I have twice found to be the residual defect site. Against that, §9.2 and
§9.3 got *smaller* by citing. Nothing I read was padding.

**Can an implementer holding only this PLAN and the approved specs find the one authoritative statement of
each rule?** For almost everything, yes, and better than at v1.1: `endIndex` has one owner and an
ownership table rather than prose to infer it from; the window rule has one authority (§7.3) and §12.2 now
quotes its actual column; the non-AT ids have one count and one checklist row; the retired ids have a
narrowed claim that no longer indicts correct text; the `RLH-05` sub-group letters resolve to one
definition. I re-derived the batch arithmetic spot-wise where v1.2 touched it and found no change: 31
tasks, 13 batches, the thirteen-node critical path, seven `reviewLoop` and seven `checkConverged` call
sites all confirmed against the source.

**Two exceptions, and both are findings above rather than size problems.** First, one rule now has two
competing statements: `RLH-LOOP-01`'s greening batch (§7.3 and §11.5's Oracles paragraph say 7/`RLH-23`;
§11.5's ownership table and §4's `RLH-27` row say 9/`RLH-27`) — `N-02`. Second, one closed enumeration is
restated normatively in four places: the three-site await scan in §4.1, §7.3 row 1, §9.2 item 1 and
§12.3 — `N-01`, and it is *why* `N-01` exists. That second one is the size-shaped defect, and it is the
same pattern as the duplicated catalogues I filed as F-04 in round 1: a document this large cannot hold
four copies of a hand-counted list, because the round that corrects the count will correct three of them.
The remedy is the one that also shrinks the document — assert the predicate once in §4.1 and cite it.

So: **not too large to execute, but at the size where every new duplicated enumeration is a defect
waiting for its next round.** If v1.3 removes the four-place site list rather than repairing it in four
places, I will not raise size again.

---

## 8. Is the PLAN executable as written?

**No, on two counts, both narrow and both mechanical.** Coverage is intact — every FSPEC AT and every
TSPEC §9.1 obligation still has an owning task, the DAG and file ownership are unchanged and were
re-derived clean by both reviewers last round, nothing is out of scope, nothing approved was dropped, and
every deferral names a successor surface (§10.2 → `QUEUE.md` Order 9, DC-08 satisfied).

What blocks execution:

1. `RLH-01`'s new blocking row halts the whole PLAN at batch 1 on a count that is measurably wrong — five
   non-`await`ed sites, not three, one of them in the file the row says has none (`N-01`). This is the
   second consecutive round in which the first command of the first batch rests on a false measurement,
   and the reason is the same both times: a hand-counted enumeration written into a gate in four places.
2. The batch-7 and batch-8 gates see `RLH-LOOP-01` red outside its permitted window, because the ledger
   was not moved when the work was (`N-02`).

And the TSPEC amendment must be narrowed before it is approved: as written it exempts a genuinely
unawaited seam call from the feature's only await guard (`N-03`).

None of the three requires a new task, a re-batching, or a REQ/FSPEC change. `N-01` and `N-02` are
deletions and one table cell. `N-03` is deleting two words from a list — or, better, replacing the list
with the property it was standing in for.

---

## 9. Recommendation

**Needs revision**

What must change:

1. **N-01 (High)** — §4.1's await-scan row: assert the classification predicate and *record* the count;
   delete the count and site list from §7.3 row 1, §9.2 item 1 and §12.3, which cite §4.1 and TSPEC §8.5.
   If a count is retained anywhere it is **five**, and `orchestrate-queue.js:524` is one of them.
2. **N-02 (Medium)** — decide whether `reviewLoop`'s window destructuring is `RLH-23` (batch 7) or
   `RLH-27` (batch 9), then make §7.3's `RLH-LOOP-01` row, §11.5's ownership table, §11.5's Oracles
   paragraph and §4's rows all say the same thing.
3. **N-03 (Medium)** — TSPEC §8.5: delete `Promise.race` and `Promise.any` from the combinator set, or
   restate the set as the property "awaits every element" with the four sound instances named.

L-01 … L-03 are Low and do not block. L-01 (§8.5's alias row's exclusive phrasing) is worth taking in the
same pass as N-03 since both edit that table; L-02 (`feature` at `checkConverged`'s seven call sites) is
one word in two places.

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 3}
