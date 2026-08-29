# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md` (v0.1, se-author)
**Date:** 2026-08-28
**Iteration:** 1
**Scope:** Local

## Findings

Verified at HEAD on `feat-pdlc-decision-ledger`. Every file the task table names was checked for
existence; every coverage claim was checked against the current suite layout.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **T-03's cited verification command cannot run.** The row reads "count verified: `git ls-tree -r --name-only 8c673a09f` under the four `DECISION_CORPUS_ARGV` globs yields 25". `git ls-tree` rejects `:(glob)` pathspec magic — running it verbatim returns `fatal: :(glob)docs/_decisions/DECISIONS-*.md: pathspec magic not supported by this command: 'glob'`. The **number is right** (25 at `8c673a09f`, 26 live, both re-derived here by another route), so this is an evidence/reproducibility defect, not an arithmetic one. It matters because the frozen-fixture provenance is the whole anti-drift argument for REQ-DECLEDGER-01's expected value, and the implementer of T-03 will hit a fatal error on the first command the PLAN hands them. **Fix:** cite a command that actually runs at that commit (e.g. `git ls-tree -r --name-only 8c673a09f \| grep -E '...DECISIONS-[^/]*\.md$'`), or state the enumeration is `git ls-files`-only and the historical count was taken by a documented equivalent. | REQ-DECLEDGER-01 (frozen-corpus expected value); REQ §7 O-6 |
| F-02 | Medium | Local | **T-20's version bump names no target and omits the constraint that binds it.** The row says bump `pdlc/.claude-plugin/plugin.json` `version` "from `0.23.6`" — no destination value. The bump is not free: `pdlc/engine/package.json` declares `"pdlcPluginCompat": "^0.23.0"` (line 18), and `pdlc/workflows/__tests__/documentOracles.test.js`'s post-sweep AT-1.6 / DEC-09 handshake check asserts the plugin version satisfies that range (the older `advertisedVersionViolation` oracle it replaced is retired — the file's own header records this). A `0.24.0` bump therefore reds batch 10 and halts the wave at the last task, after all six serialised production batches have landed. **Fix:** name the target explicitly (`0.23.7`) and cite the `^0.23.0` range plus the handshake check as the reason, so the constraint travels with the task. | Repo release convention (`CLAUDE.md` runtime-build rule, `pdlc/RELEASE-CHECKLIST.md`); no REQ AC |
| F-03 | Medium | Local | **T-19's three documentation deliverables have no test owner, and the test file it names carries no assertion about them.** T-19 ships four artefacts: the `.claude/pdlc.config.example.json` block (covered — T-12's engine disclosure test un-skips here) and prose in `pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md` (**uncovered**). The row lists `pdlc/workflows/__tests__/documentOracles.test.js` as a test file and the ownership manifest assigns it to T-19, but the Red-before-green table pairs T-12→T-19 on the *engine* test only, and no task adds a `decisionLedger` assertion to `documentOracles.test.js`. That file's live oracle families are the D-1/D-3 doc-correction checks, the advisory-tier disclosure family (explicitly *confined* to OPERATIONS.md by its own test at ~:625) and the DEC-09 handshake — none of which moves when the decision-ledger prose is absent. So the only thing standing behind three of T-19's four deliverables is a manual DoD checkbox, which is an absence-only guarantee. This is precisely the `pdlc-loop-economics` F-6 stale-catalogue lesson the row itself cites as its motivation. **Fix:** either give T-19 a real red predecessor that adds a positive oracle (each of the three docs names `decisionLedger` and its three keys), or delete `documentOracles.test.js` from T-19's Test File column and the ownership manifest and state plainly that the prose is operator-verified. | FSPEC Q-3 (disclosure precedent); REQ NG-6 |
| F-04 | Low | Local | **The Overview's scope statement understates what ships outside `orchestrate-dev.js`.** "Two files outside it change: the tracked `.claude/pdlc.config.example.json` disclosure … and a new `pdlc/engine/__tests__/decision-ledger-config-example.test.js`." The task table — which is correct and complete — also ships `pdlc/OPERATIONS.md`, `pdlc/README.md`, `CLAUDE.md` (T-19), `pdlc/workflows/dist/pdlc-cli.mjs` and `pdlc/.claude-plugin/plugin.json` (T-20), plus fourteen new test/fixture paths. The Overview is where a PM reads the blast radius; it should agree with the manifest. **Fix:** say "two *production-adjacent config/test* files, plus T-19's three documentation files and T-20's two generated/manifest files", or drop the count. | Scope statement vs. §Batches / ownership manifest |
| F-05 | Low | Local | **"greens land in batches 3–8" is contradicted by the task table.** §Overview's "Two RED-terminal batches" paragraph says the greens land in batches 3–8, but T-19 is tagged `[green]` and sits in batch 9. The intended claim is that the six greens *writing `orchestrate-dev.js`* land in 3–8, which is true and is what the ownership manifest states. **Fix:** qualify the sentence with "the six production-file greens". | §Overview vs. §Batches T-19 |

**Nothing rises to High.** Every P0 and P1 acceptance criterion has a named owning task, and both
coverage tables are complete against the live upstreams (verified below).

## Verification performed

Product-lens traceability is only as good as the facts under it, so each claim below was executed
against the working tree rather than read out of an upstream document.

**Requirement coverage — complete.** FSPEC §2's Linked Requirements table maps all eight
`REQ-DECLEDGER-01…08` onto `AT-01…AT-18`. The FSPEC enumerates exactly eighteen ATs; the PLAN's
§Verification "Acceptance-test coverage" table names an owning task for all eighteen, with no
extras and no gaps. TSPEC §6.1's failure table carries exactly fourteen rows `F-1…F-14`; the
PLAN's failure-row table names an owner for all fourteen. Both P0-heavy chains are intact:
REQ-DECLEDGER-02's disabled path lands on T-02 (AT-04) and T-10 (AT-05, AT-14), and
REQ-DECLEDGER-08's replay lands on T-10 (AT-16, AT-17).

**Every named file exists, or is declared `[new]`.** Confirmed present at HEAD:
`pdlc/workflows/orchestrate-dev.js` (all eleven symbols the Overview and T-00 name resolve in it,
including `parseLearningsConfig`, `readLearningsConfigSafely`, `parsePinCheckConfig`,
`parseDerivativeStopConfig`, `LEARNINGS_CORPUS_ARGV`, `gatherLearningsCorpus`,
`renderLearningsBlock`, `reviewLoop`, `reviewerPrompt`); `scripts/capture-learnings-baseline.mjs`
at the repo root, exporting `runCaptureScript` and tracked by git;
`pdlc/workflows/__tests__/{loopEconomicsBaselineGuard,loopEconomicsAnchorGuard,advisoryDisabled,documentOracles}.test.js`;
`pdlc/engine/__tests__/loop-config-example.test.js`; `.claude/pdlc.config.example.json`;
`pdlc/.claude-plugin/plugin.json`; `pdlc/workflows/dist/pdlc-cli.mjs`. Every remaining path in the
task table carries `[new]`. **No task names a file that exists under a different path** — the
Overview's own claim, and it holds.

**Suite-layout claims — all true.** `pdlc/workflows/package.json`'s `testPathIgnorePatterns` is
exactly `["/node_modules/", "/__tests__/helpers/", "/__tests__/fixtures/"]`, so T-01's helper and
T-02/T-03's fixtures (including `scenarios.mjs`) are genuinely uncollected.
`pdlc/workflows/__tests__/fixtures/` already holds `learnings-baseline/` and
`loop-economics-baseline/`, so T-02 and T-03 add two more of a shipped kind.
`pdlc/engine/__tests__/` holds 73 files. `.claude/pdlc.config.example.json` carries exactly the
eight top-level blocks the Overview lists, in that order, so T-19 adding a ninth under a
**containment** assertion is the right shape.

**Corpus numbers — reproduced.** The live enumeration under the four `DECISION_CORPUS_ARGV` globs
returns **26** files; the same set at `8c673a09f` returns **25** (F-01 is about the *command*, not
the count). `8c673a09f` resolves to `docs(pdlc-decision-ledger): Phase R post-mortem`. T-09's
line counts reconcile against the Baseline via TSPEC §7's measurement table: 41 project-level + 4
for `pdlc-advisory-wave-gate` = **45**, and 41 + 7 for `pdlc-engineering-loop` = **48**; the
141-record total is 41 + `M-2e`'s 100.

**Gate-wording precedent — real.** The RED-terminal gate the PLAN adopts is the one
`pdlc/engine/__tests__/loop-config-example.test.js` already followed: its header records that every
block was committed `test.skip`, titled `"P8-02: …"`, after being run un-skipped once and observed
red. The PLAN's "titled with the id of the `[green]` task that un-skips it" is that precedent
restated, and every `[red]` row names its title id consistently with the Red-before-green table.

**One-file constraint — sound.** `pdlc/engine/scripts/prepack.mjs` declares `MODULE_NAMES` at
line 20 listing exactly `orchestrate-dev.js`, `orchestrate-queue.js`, `lib/loop-session.mjs`,
`lib/escalation-view.mjs`. A new `pdlc/workflows/lib/` module would not be vendored, and REQ NG-6
forbids editing it — so the serialisation of the six production greens is a forced consequence,
not an authoring preference. The batch re-derivation `batch == max(deps) + 1` checks out for all
twenty-one tasks.

**Every `DEC-DECLEDGER-*` id the PLAN cites exists** in
`DECISIONS-pdlc-decision-ledger.md` (the PLAN cites 04, 05, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16;
the document defines 01–16).

## Questions

| ID | Question |
|----|---------|
| Q-01 | T-20 bumps the plugin version but the feature ships **default-off**. Is a version bump the operator-visible signal you want here, or does the ledger need a paired engine release (per the `~/.pdlc/versions` store note in `CLAUDE.md`) before an operator can actually enable it? If the latter, the PLAN's Definition of Done is silent on the step that makes the feature reachable. |
| Q-02 | T-09(d) asserts the shipped-default behaviour at `maxEntries: 70` / `maxBytes: 12500` against a corpus frozen at `8c673a09f`, where the `M-6b` slice leaves a **441-byte margin**. REQ R-5 already flags that the corpus grows. Is there a product intent that an operator learns when the margin is exhausted — i.e. does `omitted[]` becoming non-empty for the project-level set surface anywhere an operator reads, or is it report-only? No task claims an operator-facing signal. |
| Q-03 | The dispatch that produced this review supplied a completeness gate naming `## Overview / ## Batches / ## Dependencies / ## Verification` — the **PLAN's** section contract, not a cross-review's. I have written this file in the `pm-review` SKILL's mandated cross-review format, since that is the parsed contract for the round history. Flagging in case the gate configuration for reviewer dispatches needs correcting. |

## Positive Observations

- **Complete, mechanical coverage tables.** Fourteen of fourteen TSPEC §6.1 failure rows and
  eighteen of eighteen FSPEC ATs carry a named owning task, with the red→green pair spelled out
  (`T-08 → T-17`, `T-04 → T-13`). This is the traceability artefact a PM needs and it is correct on
  re-derivation. Keep this table shape.
- **The coverage gate is disowned honestly.** §Verification states plainly that c8's
  `--per-file --branches 85` over an ~817 KB `orchestrate-dev.js` is *not* evidence for this
  feature, and discharges the obligation with the row-to-task map instead. Refusing a green number
  that would not move if fourteen failure rows were uncovered is exactly right.
- **Anti-echo commitments are named as commitments, with the failure mode attached.** "If T-09
  reddens, the correct response is **never** to trim the expected set to whatever the renderer
  emitted" pre-empts the specific way a corpus oracle gets false-greened. T-07's model carrying its
  **own** formatter transcribed from TSPEC §4.3, and T-02 asserting `mergeBaseSha` against a
  hand-transcribed literal rather than the manifest it checks, are the same discipline applied
  twice more.
- **Set-equality over enumerations, not containment, wherever a deletion could hide.** T-04 over
  C-3's three keys, T-12 over the `decisionLedger` key map, T-11 over
  `DECISION_LEDGER_CENSUS_TOKENS`, T-02 over the baseline case ids, T-09(d) over the 41 and 63 id
  sets. T-12's deliberate exception — containment at the example file's top level, set equality
  inside the block — is the right split and is justified in place.
- **Negative assertions are paired with positive ones.** T-09(c) does not stop at "exactly one line
  carries that id"; it asserts the surviving statement, `sourcePath` and `origin` are the
  project-level record's *and* that the feature-level statement is absent from the whole block,
  noting that cardinality alone passes under the rejected rule. AT-14's "no rule text standing
  alone above a missing index" is likewise pinned as byte-identity to the baseline, not as a
  bare absence.
- **T-11's non-empty-slice precondition.** Requiring every sliced region to be asserted non-empty
  before counting is the difference between a census and a vacuous green — a failure class this
  repo has actually hit.
- **The T-06 → T-15 budget edge is stated as a one-way ratchet.** "If the drafted text does not
  fit, the correct response is to shorten the text or re-open §3.6's arithmetic deliberately —
  **never** to raise the literal", with the 441-byte margin named as what a raise consumes. A
  budget an implementer cannot quietly widen is a budget.
- **Frozen fixture over live tree, with the reason.** The 25-vs-26 drift is not hypothetical — this
  feature's own `DECISIONS-*.md` caused it — and the PLAN ties it to the `coveredViolations`
  whole-tree-walk failure class already recorded in `CLAUDE.md`.
- **Scope discipline.** "What this PLAN deliberately does not touch" names `MAX_REVIEW_ROUNDS` and
  siblings (NG-5), all `SKILL.md` files (NG-6), the delta-confirmation prompt builders and
  `DEC-LOOPECON-06`'s identity triple — and BR-11 is not merely promised but pinned by T-11's
  census and T-10's replay. I found **no out-of-scope behaviour** in the task list.

## Recommendation

**Approved with minor changes**

Three Medium and two Low findings, no High. The product substance is right: every P0 and P1
acceptance criterion has an owning task, the coverage tables are complete and re-derive correctly,
and nothing out of scope is being built. F-01 through F-03 are accuracy and coverage repairs that
should land before implementation starts — F-02 in particular because it would surface as a
batch-10 wave-gate halt after all six serialised production batches have already landed. F-04 and
F-05 are Overview wording that should agree with the (correct) task table.

