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

Five substantive changes, judged on the product question each raises: does the acceptance criterion
the property serves survive the edit intact?

### PROP-SKIP-04's re-expression (SE F-01) — the right call, verified against the shipped V-wave

The old oracle asserted equality of the `add` pathspec list against "the V-wave paths only" and
required the V-wave's commit to be "the only Phase-I-adjacent commit". SE F-01 says the premise is
false; I checked, and it is. `origin/main:pdlc/workflows/orchestrate-dev.js:16470–16500` shows the
V-wave dispatching `agentFn("se-implement", propertiesTestPrompt(featureName), …)` and running the
gate afterwards, with no `commitPaths` and no `_git(["add", …])` anywhere in the block; the commit is
made by the dispatched agent, and the `makeAgent(record)` double replaces the agent. The old oracle
could therefore never have gone green as written — it asserted the presence of paths the script never
stages.

The replacement is stronger, not weaker, and it is stronger in exactly the way REQ-WVR-08 cares
about. `expect(gitCalls.filter(a => a[0] === "add").flat()).toEqual([])` flattens rather than
indexing `a[2]`, so a multi-pathspec `add` cannot hide and an `add -A` cannot read as `undefined`;
that matches PROP-REPO-03's existing flattening, which is the consistency I would want. And the
empty-list claim is paired **in the same test** with two positive conjuncts, which is what keeps it
from being an absence-only oracle: the `["rev-parse","--abbrev-ref","HEAD"]` call proving the git
double was wired and live (I verified `readHeadBranch` issues exactly that argv at `:5254`, reached
from `main()`'s `ensureFeatureBranch` call at `:15596`), and a single-dispatch assertion pinning the
prompt to the V-wave's `propertiesTestPrompt`. The document's own note that the dispatch conjunct "is
what REQ-WVR-08 actually wants observed: no wave task's work ran, and the only thing that did run was
the V-wave" is the correct product reading. The acceptance criterion survives; only an unobservable
premise was dropped.

Two smaller things about the *presentation* of that drop are findings below (F-01, F-03). Neither
touches the behaviour asserted.

### The queue fixture correction (SE F-02) — a retraction stated as a retraction

The old § Fixtures block required three fixtures and gave `distribution.checkEnabled: false` as the
reason the set was complete. That gate no longer exists: `git grep
parseDistributionCheckEnabledOptOut origin/main` returns nothing outside `docs/completed/**`, no
`distribution` or `DRIFT_STATE` string survives in `orchestrate-queue.js`, and
`orchestrateQueue.test.js:919–920` positively asserts the module's source carries neither. The
revision replaces the rationale with the two dispositions that *do* still fire, and I checked both
against code: `selectNextPending` returns `{ kind: "blocked-active", entry: active }` at
`orchestrate-queue.js:832` and `runQueue` branches on it at `:1296` before any triage, and the
triage verdict is read with the regex at `:354`. Both preconditions are real.

Three things here are worth naming as product behaviour rather than test mechanics. First, the
document says in as many words that "earlier drafts of this section were wrong to say it was" — a
retraction written as a retraction, not quietly patched, which is what lets a reader of the next
revision know the premise changed rather than the requirement. Second, it distinguishes *inert* from
*harmful*: the surplus fixture may be supplied or omitted, "what it must not do is carry the reason
the fixture set is complete". That is the correct granularity — it does not force a fixture deletion
that would churn PLAN T-04 for no behavioural gain. Third, and most valuable, the closing paragraph
upgrades the queue oracles from `expect(result.outcome !== "blocked")` to
`expect(result.outcome).toBe(<the outcome the case expects>)`. The old form is a containment-shaped
assertion that an `idle` return would satisfy; the new one is equality against the expected value.
This is a real strengthening the finding did not ask for, and it is the sort of thing I would want
kept.

The inherited premise is routed as `ERRATUM: TSPEC` and `ERRATUM: PLAN` rather than corrected in the
parents from here, which is correct — I verified `TSPEC:759` (AT-16) and `PLAN:118` (T-04) both do
carry the false rationale verbatim, including "without all three the queue returns `outcome:
"blocked"` and asserts nothing".

### PROP-COV-01's scoping (SE F-04) — I checked this hardest, because scoping down a gate is how
acceptance criteria get narrowed

This is the one edit that *could* have been a scope reduction, so I read it against TSPEC §5.8 rather
than against the finding that prompted it. §5.8 (`TSPEC:833–854`) states the obligation as: `npm run
test:coverage` from `pdlc/workflows`, `--per-file --branches 85`, run by the last implementation task
(PLAN T-10, RK-2), which "reports the measured per-file branch number".

The revised PROP-COV-01 keeps **both** halves. It still requires the command to **exit 0** — and
because stage 2 is `--per-file --branches 85`, exit 0 is only reachable if every included module
clears the floor, so the full gate is intact and no module has been dropped from it. What is newly
scoped is which module's red counts as *this feature's* regression: `orchestrate-dev.js`, the one
included module the feature edits. The document is explicit that an inherited red elsewhere "is a
blocked task to be reported and routed, never a reason to weaken this property or the threshold."
That is the right posture and the opposite of a narrowing — it forecloses the move where a red in an
untouched module becomes an argument for lowering the bar. Product verdict: faithful to §5.8.

The mechanics check out too. `pdlc/workflows/package.json` defines `test:coverage` as the two-stage
command the document quotes, character for character, with the aggregate floors `branches 85 / lines
90 / functions 90 / statements 90` in the `c8` block and stage 2 passing `--lines 0 --functions 0
--statements 0`. The document's two caveats are also true and worth having been written down: no CI
check in this repo's `CLAUDE.md` table runs `test:coverage`, so the floor is held only by T-10
actually running it (this is RK-2/RT-7 restated at the point of use, which is where an implementer
will meet it); and this pre-rebase tree has an unrelated red in `documentOracles.test.js` from
tracked `.claude/` and `coverage/` artifacts.

The measured-baseline table underneath it is a separate matter and is F-02 below.

### The G-4 tracked-artifact record and the new G-5 (SE F-05)

G-4's expansion is accurate in every particular and is the kind of thing that saves an implementer an
afternoon. I verified all of it: `.claude/pdlc-wave-state.json` and `.claude/pdlc.config.json` are
tracked in this tree and absent from `origin/main`, `pdlc/workflows/coverage/**` likewise, and
`documentOracles.test.js:448` carries the block titled exactly `` `.claude/` machine-local state is
untracked and stays untracked (CODE_REVIEW v1 §1-1) ``. The framing — "they are reported to the
orchestrator rather than fixed from this document, and they are the reason a local `npm test` in this
tree is red in ways PROP-REPO-01 and PROP-COV-01 must not be softened to accommodate" — is precisely
the guard against the failure mode FSPEC OB-F1 exists to prevent. Naming the *reason* a local red is
expected is what stops an implementer from "fixing" it by weakening the assertion.

G-5 is a genuine gap honestly bounded: PROP-REPO-02 asserts the no-consumer-local-state rule for this
feature's PLAN only, the general rule is not falsifiable per-feature, and the compensating control is
named as Phase P review of each new PLAN. PROP-REPO-02's dangling anchor now points at G-5 instead of
G-3, and I confirmed G-3 is "No E2E tier" — a different obligation entirely, so the old anchor was
genuinely wrong and the new one is right.

### H-1 as a wrapper, and the both-axes preconditions (SE F-03)

`makeLedgerArgs` takes `git` and `runCommand` as caller-supplied parameters — `git` with no default
at all, `runCommand` defaulting to a green stub — and `makeArgs` spreads `...(git ? { _git: git } :
{})` at `waveExecution.test.js:192`. Every word of H-1's restatement is therefore accurate, and the
"wraps, not owns" distinction is load-bearing rather than pedantic: an H-1 that *owned* its doubles
would silently discard whatever the caller passed.

From the product lens the interesting half is the precondition added to PROP-SAFETY-01 and
PROP-RECORD-03. Both are ordering properties, and an ordering claim over an event sink that only ever
received one axis is vacuously true. REQ-WVR-09's requirement is that the gate precedes the commit and
the record follows it; a suite that passes because no `git` event ever arrived would report that
requirement as met while proving nothing about it. The both-axes-present assertion converts that
silent vacuity into a red. This is the delta's clearest example of a property getting *harder* to
pass, and it closes a hole through which a genuinely broken ordering could have shipped green.

### PROP-PRE-02's contributor cost (SE Q-03)

A question answered by stating the cost rather than by changing the property: a contributor whose
clone never carried a consumer-local `.claude/pdlc.config.json` gets a red pre-flight suite and must
author that config to green it. The document defends keeping it — the alternative, skipping the arm
when neither config nor CI is present, is the vacuous pass RK-6 names — and then adds the mitigation
that actually matters to the human on the other end: "the failure message must say so and must name
the file to create." That is the right product answer. The cost is real, it is accepted for a stated
reason, and the person who pays it is told what to do. I would not trade it for a skipped arm.

### Did the revision break anything?

No. Every change is additive or corrective. No property id was deleted, no oracle was weakened, and
the AT / BR / EC / REQ traceability matrices are untouched — which is itself the substance of F-01,
since AT-12's row should have moved when the property under it did. Two properties (PROP-SAFETY-01,
PROP-RECORD-03) got strictly harder; one (PROP-SKIP-04) was re-anchored from a false premise onto a
true one; one section of § Fixtures went from a containment assertion to an equality assertion. The
three standards hold across the delta: no implementation echoes (PROP-COV-01's `88.75` and
PROP-REPO-04's `1.2 · 2026-08-20` are transcribed literals, not values read back from the artifact
under test); no absence-only oracles (PROP-SKIP-04's `toEqual([])` is the one at risk and it is
paired with two positive conjuncts on live seams); and completeness by set-equality where the delta
touches an enumeration (the seven PLAN tasks, checked in both directions).

## Findings

## Questions

## Positive Observations

## Recommendation

