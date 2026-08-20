# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PLAN-pdlc-learnings-injection.md` (v0.1)
**Date:** 2026-08-20
**Iteration:** 1

## Findings

Verified against the repository at HEAD on `feat-pdlc-learnings-injection` (both suites actually
run; see §Positive Observations for what checked out).

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **AC-3.3's run-level locus has no owning green task.** TSPEC §D.2 puts the second BR-10 locus — `learningsInjection.ruleInputs.thresholds`, the `maxDocuments` / `maxBytesPerDocument` / `maxTotalBytes` in force, read once per run — on the report object, with its own set-equality completeness test, and FSPEC AT-22 states it as "plus the run's thresholds". The string `ruleInputs` does not occur anywhere in this PLAN, and no task row names the thresholds record: LI-19 builds `dispatches[]` only; LI-21 names the added `learningsInjection` parameter, the conditional spread and the `NTC-*` notices, but not this key. A row an operator needs to reproduce a selection by hand (AC-3.3) is therefore scheduled by nobody. **Fix:** name `ruleInputs.thresholds` explicitly in LI-21's row as built once per run from the parsed config, and say which suite closes it (see F-02). | REQ AC-3.3; FSPEC BR-10, AT-22; TSPEC §D.2 |
| F-02 | High | Local | **`learningsRecord.test.js` is attributed to a green task that cannot green it.** §Traceability's row `AT-17, AT-18, AT-19, AT-21 (L1/L2); AT-20, AT-22 (L3) → red LI-10 → green LI-19`, and LI-10's own text ("Both BR-10 completeness tests, one per locus"), require locus 2 — the run-level thresholds record — which does not exist until LI-21 (batch 13). LI-19 is batch 11, and §Verification's gate for batches 7–14 is full-suite green, so the batch-11 gate halts on a test that is correctly written and merely early. The PLAN already models exactly this split correctly one row down for `learningsDispatchSet.test.js` ("Greens `learningsDispatchSet.test.js` except its report-shape rows"; "LI-20, then LI-21 for the report-shape rows"). **Fix:** apply the same split — LI-19 greens AT-17…AT-21 and AT-22's per-dispatch locus, LI-21 greens AT-22's run-level locus — in both LI-10's row and the traceability table. | REQ AC-3.3; FSPEC AT-22 |
| F-03 | High | Local | **AT-15 carries a report clause that LI-16 cannot satisfy.** FSPEC AT-15 requires that, for a corpus whose only documents lie under `docs/discarded/{p}/`, "nothing is selected, **the report carries corpus-level `RSN-EMPTY`**, and no discarded document appears in any record". The PLAN assigns AT-15 to `learningsSelect.test.js` (LI-07) and lists its green task as LI-16 — "the pure selection core", batch 8 — which produces no report and no corpus outcome at all (`RSN-EMPTY` is the IO shell's/injector's, LI-18/LI-19). LI-07's row compounds this by scoping the suite to "eligibility/ordering/count rules only", which is an instruction to drop AT-15's second and third clauses. Under the batch-8 full-suite-green gate this is the same halt as F-02. AC-2.6 — the `docs/discarded/` and `docs/completed/` eligibility rule the operator was promised — is the criterion at risk of being tested only in half. **Fix:** either state the split green explicitly for AT-15 (eligibility half at LI-16, record half at LI-19/LI-21), or route the L1 assignment back to TSPEC §T.5; an ERRATUM for the latter accompanies this review. | REQ AC-2.6; FSPEC AT-15; TSPEC §T.5 |
| F-04 | High | Local | **The batch 7–14 gate contradicts the PLAN's own red-first schedule.** §Verification's gate table says batches 1, 4 and **7–14** require "Full suite green under the arrangement's `testCommand`, with the documented pre-existing exclusions **and no others**", and §Batches says "The full-suite-green gate applies from batch 7 on". But six suites are deliberately landed red in batches 2–6 and stay red until their green task: `learningsSelect` until LI-16 (batch 8), `learningsBlock` until LI-17 (9), `learningsCorpus` until LI-18 (10), `learningsRecord` until LI-19 (11), `learningsDispatchSet` until LI-20/LI-21 (12–13), `learningsConfig` until LI-21 (13). Read as written, every batch from 7 through 12 fails its own gate, and the "no exemption list grows" clause forbids the only repair a wave operator could improvise. **Fix:** restate the batch 7–13 gate as *"every suite whose green task has landed is green; every other new suite is still red for its specified reason; every pre-existing test unchanged from the measured baseline"*, and keep unconditional full-suite green for batch 14 only. | Team Principle 2; REQ AC-6.1 |
| F-05 | Medium | Local | **The fixture helper's stated surface does not cover the corpus shapes AC-2.6 needs.** LI-02 is the sole owner of `helpers/learningsFixtures.js` and its row enumerates what `buildLearningsCorpus(specs)` must synthesise — declared `Date Completed` rows, declared BR-6 sections, declared byte sizes, the two threshold fixtures, `DIVERGENT-CORPUS`, `RETRY-ITERATION`, the AT-29 contamination corpus — but never the *paths*. AT-15 needs a nested `docs/discarded/{p}/LEARNINGS-*.md` corpus **and** a direct `docs/discarded/LEARNINGS-x.md` one; AT-16 needs a corpus mixing `docs/{p}/` with `docs/completed/{p}/`. Since the row also forbids any suite defining an ad-hoc corpus builder, LI-07 has no sanctioned way to build them. **Fix:** add path shape to LI-02's declared spec surface and name the three AC-2.6 corpora. | REQ AC-2.6; FSPEC AT-15, AT-16 |
| F-06 | Low | Process | **Raw `file:line` anchors in a new feature document.** §Overview's change-surface table cites `MERGE_CONFIG_PATH` (`:48`), `parseAdvisoryConfig` (`:1964`), `reviewLoop` (`:7266`), `dispatchAndVerify` (`:8862`), `main` (`:12022`), `buildFinalReport` (`:15240`), `LS_FILES_ARGV` (`:1338`), `enumerateCorpus` (`:1349`), `fakeFs` (`:245`), `fakeGit` (`:413`), `consolidationDoubles.js` (`:35`). Every one resolves correctly today — I checked all eleven — and none is runtime-measured evidence where position is the claim, so `DEC-DOC-01` applies: the exported symbol name already carries the claim and the parenthetical is bookkeeping the next unrelated edit invalidates. **Fix:** drop the line parentheticals, keep the symbol names. | `docs/_decisions/DECISIONS-review-severity-bars.md` `DEC-DOC-01` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | LI-06 is the only task that both authors a suite and commits a fixture tree, and its guard is "authored green over the fresh capture" (§Traceability's TSPEC-local table has an em-dash in the Red column). If the capture is re-run for a legitimate reason later in the feature — H-4's "adds or replaces whole `{caseId}` directories while every retained digest is unchanged" — which task owns re-transcribing the hand-copied digest literals, and does the set-equality-over-`{caseId}` assertion get updated in the same commit as the fixture? A PM reading DoD item 4 wants to know that the byte-identity promise survives that operation. |
| Q-02 | DoD item 4 claims byte-identity against the committed pre-feature baseline for four states: disabled run, empty corpus, unlistable corpus, admits-nothing configuration. REQ only demands baseline byte-identity for AC-5.1a (disabled); AC-4.1, AC-4.2 and AC-4.4 demand "composed exactly as today" / enabled-with-empty-selection. Is the stronger four-state claim intended as a deliberate strengthening (in which case it is welcome and should say so), or as a restatement of REQ (in which case it over-reads AC-4.4, whose run carries the `learningsInjection` key)? |
| Q-03 | LI-01's pre-flight is the only defence against a moved premise, and its row says "Promote any absent premise to blocking work before batch 2 runs". Who decides, and against what bar, whether a moved premise is *this feature's* blocking work versus a halt to the operator? H-1 says halt; LI-01 says promote. The two readings differ for exactly the case that matters (H-5's seventh authoring phase, which REQ C-1/NG-5 make a product decision). |


## Positive Observations

- **Every measurement in this PLAN reproduces exactly.** I re-ran both suites at HEAD:
  `cd pdlc/workflows && npm test` gives `Test Suites: 1 failed, 98 passed, 99 total` /
  `Tests: 2 failed, 70 skipped, 3851 passed, 3923 total`, the two failures being
  `documentOracles.test.js`'s `AT-22 [red-until-L-06]` and `PROP-SWEEP-2(b)` — digit-for-digit what
  §Verification records; `cd pdlc/engine && npm test` gives `# pass 841 / # fail 3`, likewise exact.
  A plan whose baseline a reviewer can reproduce is a plan whose gates mean something.
- **The change-surface table is accurate line by line.** All eleven cited positions resolve at HEAD
  (`MERGE_CONFIG_PATH:48`, `parseAdvisoryConfig:1964`, `reviewLoop:7266`, `dispatchAndVerify:8862`,
  `main:12022`, `buildFinalReport:15240`, `LS_FILES_ARGV:1338`, `enumerateCorpus:1349`,
  `fakeFs:245`, `fakeGit:413`, `consolidationDoubles.js:35`); no `learnings*.test.js` exists under
  `pdlc/workflows/__tests__/`; the repository root has no `scripts/`; `git check-ignore -v
  .baseline-worktree` exits non-zero; `.gitignore` is 599 B and already root-anchors
  `/.claude/pdlc.config.json`, exactly the precedent LI-04 cites. The "new" declarations are honest.
- **The AT-22/AT-23 name collision is real and the `LI-` namespacing rule is the right answer.**
  `documentOracles.test.js` does carry `test("AT-22 [red-until-L-06]…")` and `test("AT-23: coveredViolations(fixture root)…")`
  from a prior feature. Catching that before the first test file is written saves a debugging session
  nobody would have budgeted.
- **§T.5's partition is transcribed faithfully.** 2 + 9 + 3 + 3 + 6 + 12 = 35, suite by suite,
  matching TSPEC §T.5 exactly, including the L3 re-classification of `learningsConfig.test.js` and
  the AT-11/AT-12 move to `learningsBlock.test.js`. And `LI-T-SUITEMAP` makes the arithmetic a test
  rather than a reader's promise — that is Team Principle 3 mechanised.
- **The oracle discipline this review is asked to demand is already in the rows.** AT-33's expected
  read set is "hand-transcribed from the fixture's scripted `ls-files` stdout minus the self paths —
  never derived from `gatherLearningsCorpus`" (no implementation echo, DC-14); LI-06's baseline guard
  and LI-11's composition-site check are stated as **set equality, never containment**, with the
  reason spelled out ("containment lets a silently deleted baseline case pass"); AC-5.2's write half
  is a porcelain **delta with no exemption list** paired with AT-33's positive read set, so the
  absence claim has a positive companion on the same instrument.
- **`runMirror` is correctly left unasserted.** LI-10 and LI-19 both say so and both cite REQ AC-3.2's
  deliberately unconstrained value. A test pinning it would red a conforming implementation, and PLANs
  usually discover that in review rather than before it.
- **The two live FSPEC errata are routed rather than silently resolved.** BR-1's missing
  `docType ∈ LEARNINGS_TARGET_DOCTYPES` conjunct and BR-15's enumeration-in-the-expected-set both
  still stand in FSPEC v0.10 — I checked both — and the PLAN writes the affected rows to TSPEC's
  reading and says so instead of quietly picking one. That is the correct handling of an upstream
  defect; I re-raise both as errata so they reach FSPEC's author.
- **`dist/` having no owning task is argued, not assumed**, and the argument is checkable: the
  arrangement's `testCommand`, `postWaveCommand: "node pdlc/workflows/build-runtime.mjs"` and
  `postWavePathspecs` are all present in `.claude/pdlc.config.example.json` as described, including
  the `'documentOracles'` ignore pattern that makes the measured baseline green under the gate.


## Recommendation

**Needs revision**

Four High findings, and they share one root: the PLAN's per-task green attribution is correct
wherever the report object is *not* involved and slips wherever it is. Concretely, what must change:

1. **F-01** — LI-21's row names `learningsInjection.ruleInputs.thresholds`, built once per run from
   the parsed config, as work it owns; AC-3.3's run-level locus stops being unscheduled.
2. **F-02** — LI-10's row and the §Traceability green column split `learningsRecord.test.js` the way
   `learningsDispatchSet.test.js` is already split: LI-19 for the per-dispatch locus, LI-21 for the
   run-level thresholds locus.
3. **F-03** — AT-15's report clause gets a green task that can satisfy it (or the L1 assignment goes
   back to TSPEC), and LI-07's "eligibility/ordering/count rules only" scoping stops reading as an
   instruction to drop it.
4. **F-04** — §Verification's batch 7–13 gate is restated so a deliberately-red suite awaiting its
   green task is not a batch failure; unconditional full-suite green stays at batch 14.

F-05 (LI-02's fixture spec should name AC-2.6's three corpus path shapes) and F-06 (DEC-DOC-01 line
anchors) are recorded, not gating.

None of this is a disagreement with the plan's shape. The serial source lane, the structural T-O-2
edge, the file-ownership manifest and the fail-open arm inventory are the right decomposition for
this feature, and the measurements underneath them hold up under re-execution.


## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 1, "low": 1}
