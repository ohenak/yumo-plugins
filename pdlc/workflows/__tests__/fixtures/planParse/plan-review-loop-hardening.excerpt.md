<!--
  Fixture excerpted verbatim (long table cells truncated to keep the file small —
  truncation touches description-style cells only, never an id, dependency or
  batch cell) from:
    docs/completed/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md
  The real task table, plus three tables that the pre-fix parser swallowed
  as extra "tasks" because it flattened every pipe row in the document.
-->

<!-- docs/completed/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md lines 271-303 — the real task table (31 tasks) -->

| # | Task | Test File | Source File | Batch | Deps | Status |
| --- | --- | --- | --- | --- | --- | --- |
| **RLH-01** |   Pre-flight gate.   Assert, at HEAD, every baseline fa … | — | — | 1 | — | ⬚ |
| **RLH-02** |   Fake first     The one canonical seam-double module … | `__tests__/helpers/seams.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-03** |   Fake first     RED  scanLines  suite + its three fenc … |    tests  /scanLines.test.js ,    tests  /fixtures/cros … | — | 2 | RLH-01 | ⬚ |
| **RLH-04** |   RED SKILL-amendment assertions.   Extend the existing … | `__tests__/skillFiles.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-06** |   Fake first     RED approval-hash / digest suite + kno … |    tests  /approvalHash.test.js ,    tests  /fixtures/d … | — | 2 | RLH-01 | ⬚ |
| **RLH-11** |   RED round-derivation suite.   AT-01…AT-07, AT-63, plu … | `__tests__/roundDerivation.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-14** |   RED force-phases suite.   AT-29 (bad-token rejection; … | { ok: false, badTokens: string[] }` | `__tests__/forcePhases.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-17** |   RED composition-root wiring update.   Extend for the … | `__tests__/pipelineWiring.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-29** |   RED phase-suite updates   for  buildFinalReport 's wi … |    tests  /{dodPhase,shipPhase,implPhase,harvestPhase}. … | — | 2 | RLH-01 | ⬚ |
| **RLH-31** |   RED bundle-guard extension.   RLH-AT-19 (the two anch … | `__tests__/runtimeBundle.test.js` | — | 2 | RLH-01 | ⬚ |
| **RLH-05** |   GREEN the whole pure-function leaf segment.   One tas … |    tests  /{scanLines,approvalHash,roundDerivation,forc … | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 3 | RLH-01, RLH-03, RLH-06, RLH-11, RLH-14 | ⬚ |
| **RLH-07** |   Amend the three review SKILLs   —  ## Verdict  as the … | `__tests__/skillFiles.test.js` | `pdlc/skills/{se,pm,te}-review/SKILL.md` | 3 | RLH-04 | ⬚ |
| **RLH-08** |   Amend the three author SKILLs   —  REVISION-COMPLETE: … | no  as the response's   last line  , and the pacing con … | `__tests__/skillFiles.test.js` | `pdlc/skills/{se,pm,te}-author/SKILL.md` | 3 | RLH-04 | ⬚ |
| **RLH-09** |   Amend the three orchestration/harvest SKILLs   —  har … | `__tests__/skillFiles.test.js` |  pdlc/skills/{harvest-learnings,orchestrate-dev,orchest … | 3 | RLH-04 | ⬚ |
| **RLH-19** |   RED queue-module suite extension.    updateQueueStatu … | `__tests__/orchestrateQueue.test.js` | — | 3 | RLH-01, RLH-02 | ⬚ |
| **RLH-21** |   RED pacing-wrapper suite.   AT-35…AT-54, AT-58;   AT- … | `__tests__/pacingWrapper.test.js` | — | 3 | RLH-02 | ⬚ |
| **RLH-22** |   RED review-loop suite update.   The three new paramet … | `__tests__/reviewLoop.test.js` | — | 3 | RLH-02 | ⬚ |
| **RLH-24** |   RED approval-search suite.   Drives the search   thro … | `__tests__/approvalSearch.test.js` | — | 3 | RLH-02 | ⬚ |
| **RLH-25** |   RED halt-and-queue suite.   AT-21…AT-27;   AT-30…AT-3 … | `__tests__/haltAndQueue.test.js` | — | 3 | RLH-02 | ⬚ |
| **RLH-28** |   RED report-template suite.   AT-55 — no un-substitute … | `__tests__/reportTemplates.test.js` | — | 3 | RLH-02 | ⬚ |
| **RLH-18** |   GREEN the five seams, their Node defaults, and the  f … | `__tests__/pipelineWiring.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 4 | RLH-05 `[dist]`, RLH-17, RLH-02 | ⬚ |
| **RLH-12** |   RED structural-completeness suite + heading fixtures. … |    tests  /completeness.test.js ,    tests  /fixtures/c … | — | 4 | RLH-01, RLH-08, RLH-09 | ⬚ |
| **RLH-20** |   GREEN the queue module.   The four changes of TSPEC § … | `__tests__/{orchestrateQueue,haltAndQueue}.test.js` | `pdlc/workflows/orchestrate-queue.js`, `dist/` | 5 | RLH-18 `[dist]`, RLH-19 | ⬚ |
| **RLH-16** |   GREEN the two judgements   —  isStale  per TSPEC §5.5 … | `__tests__/{approvalHash,completeness}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 6 | RLH-20 `[dist]`, RLH-12, RLH-05 | ⬚ |
| **RLH-23** |   GREEN the episode machinery   —  selectMode  (§5.6.1, … |    tests  /{pacingWrapper,reviewLoop,completeness}.test … | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 7 | RLH-16 `[dist]`, RLH-21, RLH-22, RLH-05 | ⬚ |
| **RLH-26** |   GREEN the phase gate.   TSPEC §2.5 steps 1–4 and step … |    tests  /{approvalSearch,approvalHash,forcePhases,hal … | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 8 | RLH-23   dist  , RLH-24, RLH-25, RLH-22, RLH-14, RLH-11 … | ⬚ |
| **RLH-27** |   GREEN the terminal exit.    checkConverged  gains   t … | `__tests__/{haltAndQueue,reviewLoop}.test.js` | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 9 | RLH-26 `[dist]`, RLH-25, RLH-22, RLH-05 | ⬚ |
| **RLH-30** |   GREEN the report surface.    buildFinalReport 's four … |    tests  /{reportTemplates,dodPhase,shipPhase,implPhas … | `pdlc/workflows/orchestrate-dev.js`, `dist/` | 10 | RLH-27 `[dist]`, RLH-28, RLH-29, RLH-21 | ⬚ |
| **RLH-32** |   GREEN the adapter and the build.    rtListFiles ,  rt … | `__tests__/{runtimeBundle,pipelineWiring}.test.js` |  pdlc/workflows/runtime-adapter.js ,  pdlc/workflows/bu … | 11 | RLH-30 `[dist]`, RLH-31, RLH-18, RLH-20 | ⬚ |
| **RLH-33** |   Version bump and final rebuild.   Bump  version  per … | `__tests__/runtimeBundle.test.js` | `pdlc/.claude-plugin/plugin.json`, `dist/` | 12 | RLH-32 `[dist]` | ⬚ |
| **RLH-34** |   Final verification.   Run §12's checklist end to end. … | — | — | 13 | RLH-33, and every task above | ⬚ |

<!-- docs/completed/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md lines 930-935 — §9.1 halt-condition table — not a task table -->

| # | Condition | Why guessing is worse than halting |
| --- | --- | --- |
| H-a | A behaviour is needed that no TSPEC §3/§4/§5/§6 section … | An invented observable becomes a de-facto contract that … |
| H-b | Two TSPEC statements about the same rule disagree | Reconciling them silently picks a winner.   Report both … |
| H-c | A closed catalogue ( LIST FAILURES ,  FILENAME FAILURES … | Adding a value to a closed catalogue changes a DC-01 co … |
| H-d | A halt-message or report string would contain an un-sub … | AT-55 forbids it, and this is precisely H-2's original … |

<!-- docs/completed/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md lines 947-953 — §9.3 halt-condition table — not a task table -->

| # | Condition | Action |
| --- | --- | --- |
| H-h | `RLH-AT-19` reds on source the agent believes correct |   Halt.   Do not widen the regex, do not add a name to … |
| H-i |  RLH-AT-64  names a parameter that falls in neither cla … | Halt. Either the parameter is a real seam that is unwir … |
| H-j | a  completeness.test.js  heading fixture no longer matc … |   Not a halt — and not a detected condition.   Nothing … |
| H-k | The suite's single permitted failure changes identity — … | Halt. Never delete or  skip  that placeholder to get gr … |
| H-l |  build-runtime.mjs --check  exits non-zero and a rebuil … | Halt. Something outside  dist/  is generating different … |

<!-- docs/completed/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md lines 957-963 — §9.4 halt-condition table — not a task table -->

| # | Condition | Action |
| --- | --- | --- |
| H-m | The work appears to require a   new source file   under … | Halt. TSPEC §2.2 rules this out with a stated cost argu … |
| H-n | The work appears to require a new runtime dependency, a … | Halt. C-2 forbids all four; §9.1 |
| H-o | The work appears to require touching  docs/ queue/QUEUE … | Halt. Those are out of scope for Phase I; a needed spec … |
| H-p | The work appears to require per-worktree consumer state … | Halt. All four are in TSPEC §2.6's "deliberately not bu … |
| H-q | A task implements either interface shape of   §11.5   d … | Halt. §11.5 decided both   before batch 1   precisely b … |

<!-- docs/completed/pdlc-review-loop-hardening/PLAN-pdlc-review-loop-hardening.md lines 1375-1388 — a cross-review disposition table — id column, no dependencies column -->

| Id | Sev | Disposition |
| --- | --- | --- |
| **F-01** | High |   Overstated — "fixed" was wrong on the count, and "com … |
| **F-02** | High |   Fixed.   §12.1 step 1 is  cd pdlc/workflows && npm te … |
| **F-03** | High |   Fixed.   §2.3 and §4.1 both restate the measured beha … |
| **F-04** | Medium |   Fixed by dropping the split   — the first of the two … |
| **F-05** | Medium |   Fixed both halves.   §7.5 reads   thirteen   (1+2+1+9 … |
| **F-06** | Medium |   Fixed.   §12.2 step 2 now cites §7.3's    Permitted r … |
| **F-07** (round-1 F-10) | Low |   Fixed as a stated decision, and the false changelog c … |
| **F-08** | Low |   Fixed.   §4.2 reads "Batches 4–12" and states that ba … |
| **F-09** | Low |   Fixed.   §12.3's  ListFailure  row is a sentence agai … |
| **Q-01** | — | Answered by the F-01 resolution:   exempt  , and the ev … |
| **Q-02** | — | Answered in §12.2, in one paragraph as suggested: the b … |
| **Q-03** | — | Answered:   thirteen  , and §12.3 now counts them (see … |
