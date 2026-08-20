# Cross-Review: product-manager — PLAN (delta confirmation, erratum round 4)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (v1.4)
**Date:** 2026-08-19
**Iteration:** 6
**Scope:** Delta confirmation. Routed items are the A6-00/A6-03/A6-04/A6-05 batch-column re-derivation
after `e3b9d5a3`. Per DEC-ERR-03 the measure is the PLAN against **upstream at HEAD**, not the item
list, and two upstream documents moved since v5 — REQ v1.8 → v1.9 and TSPEC v1.8 → v1.10.

## Routed items — disposition

| Routed item | Landed? | Evidence |
|---|---|---|
| Re-derive the `Batch` column for A6-00/A6-03/A6-04/A6-05 after `e3b9d5a3` | **Yes** | Overview's new *HEAD drift, and the remedy this plan takes* note (`:88`–`:113`) re-derives on measured HEAD state and concludes the column is unchanged from v1.3 — with the derivation shown, not asserted: every HEAD failure is production-side and every one is supplied by A6-05's green step, so no failure reaches for a later wave's production arm. A re-derivation that lands on the same answer is still a re-derivation when the work is shown. |
| Choose revert-and-redo-in-order **or** keep-and-re-batch | **Yes — keep and re-derive** | Stated once, unambiguously (`:90`), with three measured reasons rather than a preference. The strongest is the middle one: seven of eight surfaces already read six, the sole residue is `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality, so reverting would discard correct work in order to re-type it. That is a product-legible trade (throughput vs. process purity) resolved on the throughput side with the cost named. |
| Restate whether A6-00's pre-flight gate still discriminates baseline drift from drift inside its own baseline | **Yes** | A6-00 is restated as a *discharged verification* — the file landed in `e3b9d5a3` and is green at HEAD, so the task becomes "re-run, confirm green, confirm the export list still matches, proceed" while keeping its zero-dependency wave-1 slot. The discrimination is stated in the terms the item asked for: a red A6-00 would mean the **baseline rotted**, which is a different and worse problem than the seam-cardinality drift the Overview note resolves. |

Two consequences the round adds that were not routed and are the better half of the edit: batch 1's
gate wording now carries the **inherited-red** rule (A6-05's red steps open on an already-red suite,
so "observe the red" means *confirming the named failures are the listed ones*, not producing them),
and A6-05 gains a step to **rename the stale test names** `e3b9d5a3` left behind (`… report still
five seams` over an assertion that now reads six). Both are exactly the kind of thing that becomes a
mid-wave mystery if left unwritten.

So the routed items are discharged. The rest of this review is DEC-ERR-03 work: what TSPEC v1.9/v1.10
and REQ v1.9 now say, and whether the PLAN is still a faithful compression of it.

## Findings

Two High, both on the same defect in two rows, both about the **shipped example config's values**
rather than about anything the erratum was routed to fix. TSPEC withdrew a claim in v1.9/v1.10 that
the PLAN still makes — and in A6-04's case, that this round's edit *newly introduced*.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **A6-04's new rationale asserts a fact TSPEC withdrew in the same erratum window.** `04a09ca0` landed the fix I asked for in v4/v5 F-01 — A6-04 now asserts **both** `enabled` and `waveBudgetPerRun` — but justifies it with: "A6-06 ships the block with `enabled: true` alongside `waveBudgetPerRun: 0` precisely because that pairing is E-33's 'tier on, A6 off' affordance, and with no `pdlc/README.md` row in scope the example block is that affordance's **only teaching site and this test its only guard**." TSPEC v1.9 withdrew that claim in all four places it appeared and v1.10 restates the withdrawal: the example literal "is the **shipped-default pairing and nothing more**", it "does **not** teach E-33's `waveBudgetPerRun: 0`-with-`enabled: true` affordance", and the `0` affordance "has **no documentation carrier in this feature at all**" — it is carried by behaviour and its test, the `nonNegativeInt` validator plus AT-07-2b. The asserted key set is right; the reason given for it is now false upstream, and it is the reason an implementer will act on. **Fix:** keep the both-keys assertion, replace the rationale with TSPEC v1.10's — the example carries the shipped defaults `false`/`1`, `enabled` travels with the budget because the section ships as a unit and the reader needs the tier's ship state beside it, and an expectation naming only `waveBudgetPerRun` would stay green if a later edit dropped `enabled`. That last clause is already in A6-04 and is the only justification it needs. | E-33; AC-1.4; TSPEC §4.4, §5.1, §6 |
| F-02 | High | Local | **A6-06 directs the implementer to ship the tracked example config with the advisory tier switched on.** A6-06 reads: the section is added "so ... an operator reading only this file can tell that `waveBudgetPerRun: 0` with `enabled: true` is TSPEC §4.4/E-33's documented 'keep the tier on, keep A6 off' affordance", and A6-04 states outright that A6-06 "ships the block with `enabled: true` alongside `waveBudgetPerRun: 0`". TSPEC §5.1's file-map row and §4.4 both require the **whole** section as `{"enabled": false, "waveBudgetPerRun": 1}` — shipped defaults, tier off. `.claude/pdlc.config.example.json` carries no `advisory` key at HEAD (verified), so whatever A6-06 writes is what every repo copying the example inherits. Taken literally, A6-06 turns the advisory tier **on by default** for those repos: a user-visible default-behaviour change no REQ requirement asks for, against a tier whose own shipped default is `false`. This is prose-only to fix but it is the single row that decides the shipped bytes, so the ambiguity cannot stand. **Fix:** state the literal A6-06 commits — `{"enabled": false, "waveBudgetPerRun": 1}` — and drop the "an operator can tell ... `enabled: true`" reasoning with it, per TSPEC §4.4's corrected disposition close. | E-33; AC-1.4; TSPEC §4.4, §5.1 |
| F-03 | Medium | Local | **Every line pin the PLAN inherited from TSPEC §1.3 is stale at HEAD, and TSPEC re-anchored exactly these in v1.10 per DEC-DOC-01.** The four bare row-count pins appear in three places — Overview (`:63`, `:65`, `:73`–`:74`), batch 1's gate wording, and the DoD checklist — as `advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`, `advisoryHarvest.test.js:571`, `:726`. Measured at HEAD they are `:629`, `:634`, `:578`, `:733`, and all four already read `toHaveLength(6)`. A6-18 likewise pins `orchestrate-dev.js:13678` for the resolved `advisoryTierOn` (now `:13682`) and `advisoryDisabled.test.js:634`–`:658` for PROP-DIS-06 (now `:637`/`:641`). TSPEC v1.10 re-anchored every one of these to stable content — the `PROP-DIS-06 — exactly three \`.enabled\` reads outside parseAdvisoryConfig` block, the `ADVISORY_SEAMS drives the row list (S-1)` assertion, `const advisoryTierOn = advisoryConfigResult.config.enabled` — noting they "had drifted with `e3b9d5a3`". The PLAN is now the only document in the set still carrying the drifted numbers, and it carries them in the DoD checklist, where an implementer checks them off. **Fix:** adopt TSPEC v1.10's symbol and block-title anchors verbatim at all six sites. | DEC-DOC-01; TSPEC §1.3, §3.2 |
| F-04 | Medium | Local | **The Overview contradicts itself on the row-count surfaces within thirty lines.** `:63`–`:65` still present two of them in the present tense as `expect(result.advisory.rows).toHaveLength(5)` and `expect(report.advisory.rows).toHaveLength(5)`, and `:71`–`:74` says re-running the grep "at HEAD returns **four** bare row-count sites" listing all four as `toHaveLength(5)` — while `:104`–`:105`, in the drift note, states "no `toHaveLength(5)` remains anywhere in the advisory suites". HEAD agrees with the drift note. The first passage is v1.3 text describing the pre-`e3b9d5a3` repository and the second is v1.4 text describing HEAD, and nothing marks the change of tense. A reader who stops at `:74` — a plausible stopping point, since that paragraph is where the four-site enumeration lives — takes away the wrong baseline. **Fix:** mark `:56`–`:74` as the pre-drift description it now is (the paragraph at `:52`–`:56` already does this for the eight-surface list; extend the same framing to the four-site enumeration), or fold the enumeration into the drift note. | TSPEC §1.3 |
| F-05 | Low | Local | **A6-04's closing sentence announces an erratum that has already landed.** It reads "TSPEC §5.1's file map names `ci-arrangement.test.js` here and is corrected by erratum." TSPEC v1.10 §5.1 now carries `pdlc/engine/__tests__/advisory-config-example.test.js` as a **new file** row and records the correction in the row itself ("earlier drafts of this map named `ci-arrangement.test.js`, corrected by erratum"). The PLAN's sentence is a stale forward reference to a resolved condition. **Fix:** restate as agreement with TSPEC §5.1 rather than a pending correction to it. | TSPEC §5.1 |
| F-06 | Low | Local | **Two merged-away task ids are used in positions that read as task ids, not step ids.** The Overview says the four row-count sites are "owned by **A6-03** in batch 1", and *Not in scope here* says "task **`A6-09`** mints the ignored-path round-trip case". Since v1.3 both are red *steps* inside A6-05 and A6-10; the PLAN's own convention paragraph (`:127`–`:128`) permits citing step ids in prose but not attaching a task-level attribute like a batch, and "task `A6-09`" contradicts the convention outright. Cosmetic, but these are the two sentences most likely to be read in isolation by an implementer looking up ownership. **Fix:** "owned by A6-05's former-A6-03 red step, in batch 1"; "A6-10's former-A6-09 red step". | — |
| F-07 | Low | Process | **The completeness gate for this review is checking PLAN headings, third round running.** The invocation again supplies `## Overview` / `## Batches` / `## Dependencies` / `## Verification` as the accepted top-level section set. Those are the PLAN's headings; a cross-review's are `## Findings` / `## Questions` / `## Positive Observations` / `## Recommendation` / `## Verdict`, which is what the role defines and what this file is written in. v5 flagged this as a one-off observation; at three consecutive rounds it is a wiring defect worth routing to harvest rather than absorbing again. | — |

No finding is tagged `Cross-Feature`. `docs/_constraints/DOMAIN-CONSTRAINTS.md` and the promoted
`docs/_decisions/DECISIONS-*.md` were re-read; DEC-DOC-01 is the only one this round touches, and
F-03 is its ordinary application rather than a new constraint.

## Questions

| ID | Question |
|----|---------|
| Q-01 | With TSPEC v1.10 confirming the `0` affordance has **no** operator-facing carrier in this feature, is there anything left for the PLAN to own on it beyond A6-05's validator cases (`0` legal, `-1`/`1.5` invalid) and AT-07-2b? My reading is no — the affordance is fully carried by behaviour and its tests, and a prose carrier would need its own REQ requirement (TSPEC's own PM Q-01). Raising it only so that fixing F-01 and F-02 is understood as *deleting* a scope claim, not relocating one. |
| Q-02 | The drift note says A6-05's red steps "rename [the stale test names] in place". Renaming a test is an edit to a file A6-05 already owns, so no ownership moves — but it is also the kind of edit that silently changes which test a future reviewer greps for. Worth naming the two or three concrete names in A6-05 (`… report still five seams`, `… reports five zero rows`) rather than the pattern? Non-blocking; the pattern is unambiguous enough to act on. |
| Q-03 | Carried unchanged from v3–v5 and still non-blocking, though F-01/F-02 change its footing: the "keep the tier on, keep A6 off" configuration now ships with **no** discoverability at all, by upstream's explicit decision. That is a defensible scope call, but it is a decision worth a line in this feature's LEARNINGS so a future operator-documentation pass picks it up rather than rediscovering it. |

## Positive Observations

- **The remedy decision is measured, not argued.** TSPEC §6 routed a genuine fork here and the PLAN
  resolves it with numbers an implementer can re-derive: seven of eight surfaces already at six, one
  named residue, 19 failures in one cluster and 5 in another, every one of them production-side and
  every one supplied by A6-05's green step. "Reverting would discard correct work in order to
  re-type it" is the whole trade in one sentence. This is the strongest single passage the PLAN has
  added in six rounds.
- **A6-00 was restated in exactly the terms that make it still worth running.** The tempting move was
  to mark the pre-flight gate satisfied and move on. Instead it keeps its zero-dependency wave-1 slot
  and is re-scoped to *discharged verification*, with the discrimination spelled out: a red A6-00
  means baseline rot, which is not the drift the Overview note resolves. A gate that can still fail
  for a different reason than the one already investigated is a gate that still earns its slot.
- **The inherited-red rule is the finding I would have raised if it were absent.** "A6-05's red steps
  open on an already-red suite, so observing the red means confirming the named failures are the
  listed ones, not producing them" is the precise instruction an implementer needs to avoid reading
  a pre-existing failure as their own success. It was not in the routed item list; it was found.
- **The batch column was re-derived rather than reasserted.** The claim "the wave map and `Batch`
  column are unchanged from v1.3" is backed by the file-disjointness re-check, the `parsePlanTasks` /
  `computeWaves` run (11 tasks, 7 waves), and the per-file appearance list rewritten to the new wave
  numbering. An unchanged answer with the work shown is what the routed item asked for.
- **REQ v1.9's two substantive corrections cost the PLAN nothing, and I checked rather than assumed.**
  NFR-4's restatement ("the window closes at the attempt's verdict") is cited nowhere in the PLAN, and
  REQ §1's re-anchored ledger citations (`WAVE_STATE_PATH`, `parseWaveLedger`, the `scriptGate`
  definition) replace line pins the PLAN never borrowed. The PLAN's own `orchestrate-dev.js` pins in
  that neighbourhood — `:14360`, `:14364`, `:14398`–`:14406` — are its own, not inherited, and are the
  ones F-03 leaves alone.

## Recommendation

**Needs revision** — on the strength of F-01 and F-02, not on the erratum.

The routed work is done and done well. All three items land, the batch-column re-derivation shows
its working, and two unrouted improvements (the inherited-red rule, the stale-name rename step) are
worth more than one of the routed ones. If the erratum were the whole measure this would be an
approval.

It is not the whole measure. TSPEC moved v1.8 → v1.10 in the same window and withdrew, in four
places, the claim that the example config teaches E-33's "keep the tier on, keep A6 off" pairing.
The PLAN still makes that claim in two rows — and A6-04's version of it was **introduced by this
round's edit**, written against TSPEC v1.8 while TSPEC v1.10 was retiring it. A6-06 is the row that
matters most: it is the only place in the pipeline that says what bytes land in the tracked
`.claude/pdlc.config.example.json`, and as written it reads as shipping `enabled: true`, which would
switch the advisory tier on by default for every repo that copies the example. TSPEC §4.4 and §5.1
both require `{"enabled": false, "waveBudgetPerRun": 1}`.

Exactly what to change:

1. **A6-04** — keep the both-keys assertion; replace the "only teaching site / only guard" rationale
   with TSPEC v1.10's (shipped-default pairing; `enabled` travels because the section ships as a unit;
   a budget-only expectation stays green if a later edit drops `enabled`). (F-01, High)
2. **A6-06** — name the committed literal `{"enabled": false, "waveBudgetPerRun": 1}` and drop the
   "an operator can tell ... `enabled: true`" reasoning. (F-02, High)
3. **Six line pins** — adopt TSPEC v1.10's symbol and block-title anchors: the four row-count sites in
   the Overview, batch 1's gate and the DoD, plus A6-18's `:13678` and `:634`–`:658`. (F-03, Medium)
4. **Overview `:56`–`:74`** — mark the pre-drift enumeration as pre-drift, so it stops contradicting
   the drift note thirty lines later. (F-04, Medium)
5. Two Lows: A6-04's already-resolved erratum forward reference (F-05), and the two merged-away task
   ids used as task ids (F-06).

None of these touches batching, ownership, dependencies, the wave map or the AT-coverage table. Items
1 and 2 are single-clause prose edits; 3 is mechanical transcription from TSPEC v1.10. The erratum's
own work stands as approved.

F-07 is `Process` and is not for the author to fix: the completeness gate has now supplied PLAN
headings to a cross-review invocation three rounds running, and should be routed to harvest.

## Verdict

FINDING: High | delta | local | A6-04 (Batches) | Rationale added this round asserts A6-06 ships `enabled: true` with `waveBudgetPerRun: 0` and that the example block is E-33's only teaching site and this test its only guard — TSPEC v1.9/v1.10 withdrew both claims in all four places; the `0` affordance has no documentation carrier in this feature at all
FINDING: High | inherited | nonlocal | A6-06 (Batches) | Directs the shipped `.claude/pdlc.config.example.json` to teach `enabled: true` with `waveBudgetPerRun: 0`; TSPEC §4.4/§5.1 require the shipped-default literal `{"enabled": false, "waveBudgetPerRun": 1}`, so as written the task would switch the advisory tier on by default for every repo copying the example
FINDING: Medium | inherited | nonlocal | Overview, Batch gates, Definition of Done, A6-18 | Six line pins stale at HEAD (`:622`→`:629`, `:627`→`:634`, `:571`→`:578`, `:726`→`:733`, `13678`→`13682`, `:634`–`:658`→`:637`/`:641`); TSPEC v1.10 re-anchored exactly these to stable content per DEC-DOC-01
FINDING: Medium | delta | local | Overview | Pre-drift enumeration at `:56`–`:74` still presents the four row-count sites as `toHaveLength(5)` in the present tense, contradicting the new drift note's "no `toHaveLength(5)` remains anywhere" thirty lines later
FINDING: Low | inherited | local | A6-04 (Batches) | Closing sentence announces a TSPEC §5.1 erratum that has already landed in v1.10
FINDING: Low | inherited | nonlocal | Overview, Not in scope here | Merged-away step ids `A6-03` and `A6-09` used in task-id positions ("owned by A6-03 in batch 1", "task `A6-09`")
FINDING: Low | inherited | nonlocal | Process | Completeness gate supplied PLAN headings to a cross-review invocation for the third consecutive round

VERDICT: Needs revision
{"high": 2, "medium": 2, "low": 3}
