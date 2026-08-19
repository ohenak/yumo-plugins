# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-19
**Iteration:** 1
**Scope:** Local (F-01, F-02, F-04, F-05, F-06), Cross-Feature (F-03)

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **Batch 2 reds a pre-existing test no task owns: `advisoryDisabled.test.js`'s five-row count.** `advisoryDisabled.test.js:622` asserts `expect(result.advisory.rows).toHaveLength(5)` (PROP-DIS-05, enabled-but-quiet). That row list is built by `ADVISORY_SEAMS.map(...)` at `pdlc/workflows/orchestrate-dev.js:2992`. Task `A6-05` (batch 2) adds `A6` to `ADVISORY_SEAMS`, so the assertion becomes `6 !== 5` and reds at batch 2's gate — which the PLAN's batch-gate table declares must be "the whole `pdlc/workflows` suite green under `implementation.testCommand`". `advisoryDisabled.test.js` has exactly one owning task, `A6-20`, at **batch 13**; under batch-safety rule 2 and the file-ownership manifest no batch-2 implementer may legally edit it. Phase I halts at batch 2. **Fix:** add a batch-1 sibling of `A6-03` owning `advisoryDisabled.test.js` and retargeting `:622` to six rows, and add the second ownership row to the manifest (the file then has two owners in different batches, exactly as `advisoryWaveGate.test.js` already does). | AC-1.4, AC-1.6-equivalent (AT-01-6); PLAN "Two notes about batching" note 1 |
| F-02 | High | Local | **A sixth transcription site is absent from the PLAN entirely: `advisoryQueueSeams.test.js`.** `pdlc/workflows/__tests__/advisoryQueueSeams.test.js:627` asserts `expect(report.advisory.rows).toHaveLength(5);` with the in-line comment `// ADVISORY_SEAMS drives the row list (S-1)`. The string `advisoryQueueSeams` appears **zero** times in PLAN, TSPEC, FSPEC and REQ (`grep -n advisoryQueueSeams docs/pdlc-advisory-wave-gate/*.md` returns nothing). Like F-01 it reds at batch 2 on `A6-05`, with no owning task and no manifest row at all — `validatePlanContract` cannot even flag it, because the file is invisible to the plan. **Fix:** name the file in the same batch-1 retarget task as F-01 and give it a file-ownership manifest row. | PLAN "Two notes about batching" note 1; TSPEC §1.3 |
| F-03 | High | Cross-Feature | **`A6-18`'s "duplicated tier gate" breaks a documented shipped invariant and PROP-DIS-06, at batch 12, again with no owning task.** `A6-18` (PLAN:90) says it implements "the duplicated tier gate (so AC-1.4's inertness covers the **snapshot**…)". `advisoryDisabled.test.js:634-658` (PROP-DIS-06) asserts the combined source of `orchestrate-dev.js` + `orchestrate-queue.js`, with `parseAdvisoryConfig`'s body excised, carries **exactly three** `/\.enabled\b/` matches. Today that is exactly three (`orchestrate-dev.js:3258`, `:13678`, `orchestrate-queue.js:1318`). A literal `config.enabled === false` inside `runWaveGateSeam` makes four and reds batch 12 — whose gate the PLAN also declares must be all-green. Worse, the shipped comment at `orchestrate-dev.js:13675-13677` states the design intent explicitly: "Read once, reused everywhere below … **so the tier's own master switch is inspected from source text exactly once here.**" A duplicated *read* contradicts that; a duplicated *gate* need not. **Fix:** state in `A6-18` that `runWaveGateSeam` receives the already-resolved `advisoryTierOn` boolean (`orchestrate-dev.js:13678`) as a parameter and performs **no new `.enabled` read**, so PROP-DIS-06's count stays three. If the author instead intends a fourth read, a batch-≤11 task must own the counter change in `advisoryDisabled.test.js` and the shipped comment must be revised in the same task. The reusable lesson — *exact-count and source-text oracles are transcription sites that member-literal greps do not find* — is why this is tagged Cross-Feature. | AC-1.4; TSPEC §3.2 step 2 |
| F-04 | High | Local | **`A6-15` mis-transcribes AT-01-5's fixture, so a P0 acceptance criterion's central observable is never exercised.** AC-1.5 (REQ:271, REQ-AWG-01, **P0**) scopes its cardinality oracle to the absence of **BL-03** (valid PLAN file-ownership manifest / wave mode) and **BL-04** (configured script-owned test command), and requires the single notice to name *every* absent prerequisite "in a run lacking manifest and script-owned gate alike". TSPEC:1376 transcribes this correctly: "no ownership manifest **and** no `testCommand`". `A6-15` instead writes: "one inapplicability statement over the whole notice surface on the both-absent fixture **(no `testCommand`, no `postWaveCommand`)**". `postWaveCommand` is not a prerequisite in AC-1.5, BL-03 or BL-04 — it appears in neither blocker. As written the fixture is BL-04-absent only; BL-03 absence is never exercised anywhere in the task table, and the "both" case AC-1.5 was re-litigated over in REQ v1.7 and v1.8 is not built. **Fix:** restate `A6-15`'s fixture as "no PLAN file-ownership manifest **and** no `testCommand`", matching TSPEC:1376. | AC-1.5, AT-01-5, BL-03, BL-04 |
| F-05 | Medium | Local | **AT-01-5's zero-count arm is unallocated.** AT-01-5 (FSPEC:329-331) requires the oracle to count "exactly **one** … **and zero** in a run where A6 applies". `A6-15` allocates only the one-count arm, and the traceability table maps AT-01-5 to `A6-15`/`A6-18` alone. Without the zero-count companion the oracle is satisfiable by a carrier that emits the inapplicability notice unconditionally — the notice would then be present on runs where A6 *does* apply, and nothing would catch it. This is the absence-only-oracle failure mode inverted: the positive is planned, the discriminator is not. **Fix:** name the zero-count run in `A6-15` (a run where A6 applies must carry zero inapplicability statements). TSPEC §5.5's allocation has the same omission — raised as an erratum. | AC-1.5, AT-01-5 |
| F-06 | Low | Local | **The one operator-facing affordance in the feature has no documentation carrier.** TSPEC:977 calls `waveBudgetPerRun: 0` "the **documented operator affordance** — keep the tier on, keep A6 off". The only task that touches an operator-facing surface is `A6-06`, which adds the key to `.claude/pdlc.config.example.json` — a comment-free JSON file that today carries no `advisory` section at all (verified: `grep advisory .claude/pdlc.config.example.json` is empty). Nothing in the plan tells an operator that `0` means "A6 off, tier on" rather than "misconfigured". No REQ AC demands documentation, so this is Low, not a gate. **Fix:** either have `A6-06` write the whole `advisory` section (including `enabled`) so the example is copy-able and self-explanatory, or drop the word "documented" upstream. | AC-1.4; TSPEC §4.4, E-33 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01/F-02 share a root cause: batch 1's enumeration found the five files carrying the **member** literal `["A1","A2","A3","A4","A5"]` (`advisoryEnvelope.test.js:317`, `advisoryHarvest.test.js:573`, `advisoryRecord.test.js:496`/`:544`, `consolidationProperties.test.js:250`, `helpers/advisoryDoubles.js:271` — all five verified exactly as the PLAN names them) but not the two files carrying a bare **count** (`advisoryDisabled.test.js:622`, `advisoryQueueSeams.test.js:627`). Was the enumeration built from a member-literal grep? If so, is it worth stating the sweep the plan actually ran, so the next seam's author can re-run it rather than re-derive it? |
| Q-02 | Is `waveBudgetPerRun: 0` reachable for an operator who has never opened the TSPEC? Related to F-06: the queue-level operator's mental model of "the tier is on but A6 is off" has no surface outside the spec chain. |
| Q-03 | AC-1.5's population is "a run that reaches Phase I **and evaluates wave mode**", which explicitly includes "taking the no-manifest legacy path". Does `A6-15` (or any task) build the legacy-path run at all, or does the whole AT-01-5 allocation sit on wave-mode runs? |

## Positive Observations

- **The AT ledger is set-equal, and I checked it mechanically.** FSPEC §6 declares 47 ATs; the PLAN's traceability table carries 47; the two identifier sets are identical, including the awkward members `AT-04-1a`, `AT-04-1b` and `AT-07-2b`. Set-equality, not containment, is exactly the bar the plan claims for itself, and it holds.
- **Every line citation in the document verifies.** `orchestrate-dev.js:14360` is the `if (scriptGate)` block and `:14364` the halt literal; `:1938`/`:1940`/`:1947` are `ENVELOPE_DEFAULTS`/`ADVISORY_DEFAULTS`/`ADVISORY_SEAMS`; `:1960` is `parseAdvisoryConfig`; `:10805` is the sub-batch cap comment; `:3499`/`:3503` are the SeamOps shallow copies; `:4449` is `parsePlanOwnership`; `:14143` is `scriptGate`; `advisoryDoubles.js:271`, `advisoryDriver.test.js:221`/`:846`, `advisoryDodSeams.test.js:371` all land where claimed. That is unusually careful for a plan of this size, and it is why F-01…F-03 read as a single enumeration blind spot rather than as looseness.
- **The batch arithmetic is genuinely derived, not narrated.** Recomputing `batch = max(batch of deps) + 1` over all 22 tasks reproduces the stated 14 batches exactly, batch 1 lands on the five-task cap the plan predicts from `:10805`, and no two tasks in the same batch share a file in the ownership manifest (checked all 14 batches). Every task appears in exactly one manifest row and every manifest row names a task in the table.
- **The eleven prohibition tests transcribe TSPEC §5.5 exactly.** 3 (`(f)` PLAN prose / task table / manifest) + 3 (`(g)` `testCommand` / `postWaveCommand` / `postWavePathspecs`) + 3 (`(h)` commit / push / tag) + 2 (`(i)` wholly outside / partly inside) = 11, each with a paired positive per AC-4.5. Under the "no absence-only oracles" bar this is the model the rest of the plan should be measured against — and F-05 is only visible because this row sets the standard so clearly.
- **The verification commands are transcribed verbatim from the repo, including the one people get wrong.** `implementation.testCommand`, `postWaveCommand` and `postWavePathspecs` match `.claude/pdlc.config.json` character for character, and the coverage row correctly says `npm run test:coverage`, not `npm test:coverage`.
- **Every P0 and P1 requirement group has planned tasks.** REQ-AWG-01…05 and 07 (P0) and REQ-AWG-06 (P1) each map to ATs that map to red/green task pairs; no requirement group is silently dropped, and the P1 record/escalation work is not deferred behind the P0 work in a way that would strand it.

## Positive Observations

## Recommendation

**Needs revision**

Four High findings. This is a strong plan — the batch derivation, the ownership manifest, the AT
set-equality and every one of its line citations hold up under mechanical checking — and three of
the four Highs are one repairable blind spot rather than four separate defects.

Exactly what to change:

1. **Add a batch-1 task** (a sibling of `A6-03`) owning `pdlc/workflows/__tests__/advisoryDisabled.test.js`
   and `pdlc/workflows/__tests__/advisoryQueueSeams.test.js`, retargeting the bare five-row counts at
   `advisoryDisabled.test.js:622` and `advisoryQueueSeams.test.js:627` to six. Add both files to the
   file-ownership manifest. Without this, Phase I halts at batch 2's own gate. (F-01, F-02)
2. **Restate `A6-18`'s tier gate** as receiving the already-resolved `advisoryTierOn` boolean
   (`orchestrate-dev.js:13678`), performing no new `.enabled` read, so PROP-DIS-06's exact count of
   three and the shipped invariant at `orchestrate-dev.js:13675-13677` both survive. If a fourth read
   is genuinely intended, a batch-≤11 task must own the counter change instead. (F-03)
3. **Correct `A6-15`'s AT-01-5 fixture** from "(no `testCommand`, no `postWaveCommand`)" to
   "no PLAN file-ownership manifest **and** no `testCommand`", per AC-1.5's BL-03/BL-04 and
   TSPEC:1376. (F-04)
4. **Add AT-01-5's zero-count arm** to `A6-15`: a run where A6 applies carries zero inapplicability
   statements. (F-05)
5. *(Low, non-gating)* Have `A6-06` write the whole `advisory` section so the example config is
   copy-able, or drop "documented" from TSPEC §4.4's description of `waveBudgetPerRun: 0`. (F-06)

## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 1, "low": 1}
