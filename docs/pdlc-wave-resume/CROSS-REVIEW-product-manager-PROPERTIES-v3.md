# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md`
**Date:** 2026-08-23
**Iteration:** 3
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## Grounding

**Tree and base.** `git rev-parse --abbrev-ref HEAD` prints `feat-pdlc-wave-resume`. `git fetch
origin feat-pdlc-wave-resume` then `git rev-list --left-right --count` reports 465 / 3430 — a
divergence that looks alarming and is not: it is the OB-F1 rebase, which rewrote every commit id.
The check that actually matters is content, and `git diff --stat origin/feat-pdlc-wave-resume HEAD
-- docs/pdlc-wave-resume/` reports exactly one changed file, `PROPERTIES-pdlc-wave-resume.md`, at
+95/−25 — the delta I am here to review. The local tree is content-ahead of the remote, not stale,
so I reviewed it rather than reporting a mismatch.

**Prior findings, both closed or correctly parked.**

| v2 finding | Status at HEAD |
|---|---|
| **F-02 (Low, Local)** — no revision-history block despite a version bump, while `TSPEC:13` and `PLAN:13` both carry one | **Resolved.** `PROPERTIES:12–19` now carries `**Revision history.**` with a `1.0` / `1.1` / `1.2` row, in the sibling documents' shape. The `1.1` row records exactly what I described the 1.1 delta as doing; the `1.2` row enumerates all six changes in this delta and attributes each to its raising finding. Committed as `ac8e776b`. |
| **F-01 (Medium, Process)** — round 1's cross-review shipped with an empty findings table and no parseable verdict | **Not actionable by this document's author and correctly not addressed here.** It survives in `CROSS-REVIEW-product-manager-PROPERTIES-v2.md`, which harvest reads, so the process signal is preserved without my re-filing it and inflating this round's counts. |

No High finding was open from round 2, so the gating half of the delta protocol is satisfied before
I start. This round is therefore scoped to the second half — *did the revision break anything* — plus
verification of the delta's own factual claims, which is where nearly all of my effort went, because
this delta makes an unusual number of load-bearing assertions about shipped code.

**The delta.** `git diff 69ada660 HEAD -- PROPERTIES` is 95 insertions / 25 deletions across eight
hunks, all traceable to `CROSS-REVIEW-software-engineer-PROPERTIES-v2.md` findings F-01…F-05 and
Q-03, plus my own F-02:

| Hunk | Change | Raised by |
|---|---|---|
| lineage header + revision history | `Version` 1.1 → 1.2, three cross-reviews listed, history block added | PM F-02 |
| PROP-SKIP-04 (`:147`) and its oracle (`:296`) | pathspec-equality oracle and the "V-wave's own commit" premise replaced by a flattened empty-`add`-list assertion plus two positive conjuncts | SE F-01 |
| PROP-COV-01 (`:216`, `:330`) + new § 11 baseline block | scoped to the one edited module; floor now `≥ 85 and ≥ 88.75` against a dated measurement | SE F-04 |
| PROP-PRE-02 oracle (`:276`) | contributor cost of the absent-config arm stated | SE Q-03 |
| PROP-SAFETY-01 (`:309`), PROP-RECORD-03 (`:322`), H-1 (`:377`) | H-1 restated as a *wrapper* over caller-supplied doubles; both consumers gain a both-axes-present precondition | SE F-02, F-03 |
| § Fixtures queue block (`:418–441`) | three-fixture set corrected to two; the `distribution.checkEnabled` rationale retracted and routed | SE F-02 |
| § Gaps G-4 (`:620`), new G-5 (`:634`), PROP-REPO-02 anchor (`:311`) | tracked-artifact state recorded; the dangling `G-3` anchor repointed at the new G-5 | SE F-05 |
| routed-findings table (`:680–681`) | two new upstream errata added | SE F-01, F-02 |

No property was deleted. The property set at HEAD is the same set I saw at `69ada660`; the AT / BR /
EC / REQ traceability matrices are byte-unchanged apart from nothing at all — I diffed them and they
are untouched. That matters for one finding below, because a matrix that stays still while the
property under it changes meaning is exactly how a coverage claim goes stale.

### The delta's factual claims, re-checked against shipped code

This delta's substance is a set of claims about what `origin/main` does. Every one of them is a
claim I can falsify by reading code, so I did, rather than accepting the document's word:

| Claim | Check | Result |
|---|---|---|
| The V-wave issues no `git add` — its commit is made by the dispatched agent | read the V-wave block at `origin/main:pdlc/workflows/orchestrate-dev.js:16470–16500` | **Holds.** The block dispatches `agentFn("se-implement", propertiesTestPrompt(featureName), { model: MODEL_IMPLEMENTATION })`, calls `evaluateWaveDispatch`, then `runCommandFn(implConfig.testCommand)`. No `commitPaths`, no `_git(["add", …])`. |
| The enclosing comment says so "in as many words" | same block | **Holds, verbatim.** `:16474–16475` reads "So the V-wave is the one wave-mode dispatch that / still commits its OWN work". The document quotes it accurately. |
| Every run issues `["rev-parse","--abbrev-ref","HEAD"]` through `ensureFeatureBranch`'s `readHeadBranch` | `orchestrate-dev.js:5254` (`readHeadBranch`), `:5305` (`ensureFeatureBranch`), `:15596` (`main()`'s call) | **Holds.** `readHeadBranch` issues exactly `await git(["rev-parse", "--abbrev-ref", "HEAD"])`, and `main()` calls `ensureFeatureBranch({ feature: featureName, _git: gitFn, _log: emit })` on every run. The `toContainEqual` matcher the document specifies is the right one, since `readHeadBranch` is reachable from three call sites and may retry. |
| The `distribution.checkEnabled` drift gate has been retired from `orchestrate-queue.js` | `git grep parseDistributionCheckEnabledOptOut origin/main`; `git grep "distribution\|DRIFT_STATE" origin/main -- pdlc/workflows/orchestrate-queue.js` | **Holds.** Both return empty. The symbol survives only under `docs/completed/**`, exactly as stated. |
| `orchestrateQueue.test.js` asserts the module's source carries neither string | `grep -n "distribution\|DRIFT_STATE" pdlc/workflows/__tests__/orchestrateQueue.test.js` | **Holds.** `:919–920` are `expect(source).not.toContain("distribution" + ".checkEnabled")` and `expect(source).not.toContain("DRIFT_STATE" + "_PATH")`. |
| An `in-progress` row short-circuits `selectNextPending` to `{ kind: "blocked-active" }` | `orchestrate-queue.js:825–832`, `:1294–1296` | **Holds.** `selectNextPending` returns `{ kind: "blocked-active", entry: active }` and `runQueue`'s selection block branches on it before triage. |
| The triage verdict is read with `/^TRIAGE:\s*(ready\|blocked\|needs-human)\b/` | `orchestrate-queue.js:354` | **Holds** — the shipped regex is that, with a trailing capture and the `i` flag. |
| `makeLedgerArgs` owns no doubles; `git` has no default, `runCommand` defaults to a green stub; `makeArgs` spreads `...(git ? { _git: git } : {})` | `waveExecution.test.js:2204–2212`, `:192` | **Holds, line for line.** This is the fact that makes H-1's "wraps, not owns" restatement correct rather than cosmetic. |
| `documentOracles.test.js` carries a `` `.claude/` machine-local state is untracked and stays untracked (CODE_REVIEW v1 §1-1) `` block | `:448` | **Holds, exact title.** |
| `.claude/pdlc-wave-state.json`, `.claude/pdlc.config.json` and `pdlc/workflows/coverage/**` are tracked in this tree and absent at `origin/main` | `git ls-files` vs `git ls-tree -r origin/main` | **Holds in both directions.** All three are tracked here; `origin/main` carries only `.claude/pdlc.config.example.json` and `.claude/settings.json`, and no `coverage/`. G-4's account of this tree is accurate. |
| `c8.include` is **four** modules, and `test:coverage` is two stages with the quoted flags | `pdlc/workflows/package.json` | **Holds.** The include set is the four named modules; `test:coverage` is `c8 npm test -- --runInBand && c8 report --check-coverage --per-file --branches 85 --lines 0 --functions 0 --statements 0`. The aggregate floors are `branches 85 / lines 90 / functions 90 / statements 90` as stated. |
| G-3 is the absent-E2E-tier gap, so PROP-REPO-02's old anchor was genuinely wrong and G-5 is the right target | `PROPERTIES:613` (G-3), `:634` (G-5) | **Holds.** G-3 is "No E2E tier"; G-5 is the per-feature-scope gap PROP-REPO-02's falsifiability note is actually about. The re-anchor is correct. |
| The two new routed errata name real text in their targets | `TSPEC:755` (AT-12), `TSPEC:759` (AT-16), `PLAN:118` (T-04) | **Holds.** AT-12's fourth conjunct does assert "its commit is the only Phase-I-adjacent commit"; AT-16 and PLAN T-04 both do name `distribution.checkEnabled: false` as required "so the drift gate does not refuse the invocation", and both say "without all three the queue returns `outcome: "blocked"`". Both errata are well-founded. |
| TSPEC §5.7 still leaves the run count at fast-check's default | `grep -n "numRuns\|default run count" TSPEC` | **Still open.** One hit, `TSPEC:830`, "at fast-check's default run count". The v2-era erratum has not been actioned; I re-emit it. |

Thirteen claims, thirteen holds. I want to record that plainly, because the previous round's SE
review found five real defects in this document and the author's response was not to patch the prose
but to go read the code and re-anchor each claim on a citation. That is the response I would want.

**PLAN task coverage, re-checked for set equality.** `grep -oE "^\| T-[0-9]+" PLAN | sort -u` yields
`T-01, T-02, T-03, T-04, T-07, T-08, T-10` — seven ids. The PROPERTIES "PLAN task → properties"
table carries exactly those seven, no more and no fewer. Set equality holds in both directions,
unchanged by this delta. Every test file named in that table is either present in the tree
(`waveExecution.test.js`) or declared **new** with exactly one owning task
(`waveResume.test.js` T-02, `waveResumeRepoState.test.js` T-03, `waveResumeQueueParity.test.js`
T-04, `waveResumeProperties.test.js` T-08, `waveResumePreflight.test.js` T-01) — I re-confirmed none
of the five exists in this tree or at `origin/main`. No file is named that no task creates.

## Delta Reviewed

## Findings

## Questions

## Positive Observations

## Recommendation

