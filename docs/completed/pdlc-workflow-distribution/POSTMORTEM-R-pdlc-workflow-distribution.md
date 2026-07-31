# POSTMORTEM — Phase R (REQ review loop) — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-workflow-distribution.md` (v13.0, `9b66cdb`) → **POSTMORTEM-R** |
| Downstream | `LEARNINGS-pdlc-workflow-distribution.md`, `docs/_queue/QUEUE.md` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..12}.md` — twenty-four files, all on `feat-pdlc-workflow-distribution` |
| LEARNINGS | `docs/completed/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` |
| Author | pm-author (Claude) |
| Date | 2026-07-28 |
| Version | 2.1 — Resolution appended 2026-07-28; otherwise 2.0 — supersedes the 2026-07-27 edition, which covered the **first** five-round run (REQ v3–v8). This edition covers the **second** five-round run (REQ v8–v13) and the whole phase. |
| Scope | Non-convergence of the REQ cross-review loop. Not a product-decision record; not a technical design record. |

---

## Phase

**Phase R — REQ authoring and cross-review**, feature `pdlc-workflow-distribution`.

The phase ran the standard author → dual cross-review → address → re-review cycle. It has now hit the
five-iteration ceiling **twice**, without either run ending in a dual **Approved**. No REQ has been
accepted; FSPEC has never been entered. The pipeline halts here.

The 2026-07-27 edition of this post-mortem recommended (R-1) accepting REQ v8.0 with narrowed scope
and moving the residual findings to FSPEC. **That recommendation was not acted on.** The queue row
was left `pending` rather than `halted`, the pipeline re-entered Phase R on the same REQ, and the loop
ran a second five-round cycle producing v9.0–v13.0. This is the single most important fact in this
document: the second run is not new evidence about the REQ, it is evidence that the escalation path
out of a non-converging loop does not work.

---

## Iterations (5 — limit reached)

This run's counter ran 1..5, reviewing REQ v8.0 through v12.0 and producing v9.0 through v13.0. Both
reviewers continued to file under the true next index (`-v8`..`-v12`) rather than the index the
orchestrator dispatched — see Pattern item 4.

| Loop iteration | REQ version reviewed | SE review | TE review | SE verdict | TE verdict | REQ revision produced |
|---|---|---|---|---|---|---|
| 1 | v8.0 (`ee3ec4c`) | `-v8` (2H/3M/2L) | `-v8` (1H/4M/2L) | Needs revision | Needs revision | v9.0 (`bbe2c1c`) |
| 2 | v9.0 | `-v9` (2H/3M/2L) | `-v9` (2H/3M/3L) | Needs revision | Needs revision | v10.0 (`f438860`) |
| 3 | v10.0 | `-v10` (2H/2M/4L) | `-v10` (1H/3M/3L) | Needs revision | Needs revision | v11.0 (`9166825`) |
| 4 | v11.0 | `-v11` (1H/2M/4L) | `-v11` (2H/4M/2L) | Needs revision | Needs revision | v12.0 (`dde3a5f`) |
| 5 | v12.0 | `-v12` (1H/3M/3L) | `-v12` (2H/3M/2L) | Needs revision | Needs revision | v13.0 (`9b66cdb`) — **never reviewed; limit reached** |

Trajectory of blocking findings (High + Medium), summed across both reviewers, across the **whole**
phase:

| REQ version reviewed | v2 | v3 | v4 | v5 | v6 | v7 | v8 | v9 | v10 | v11 | v12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| H+M (SE+TE) | 9+ | 12+ | 11 | 12 | 7 | 7 | 10 | 10 | 8 | 9 | 9 |

The first run decayed 12 → 7 and then flattened. The second run **re-rose to 10 and stayed in the
8–10 band for all five rounds** — it did not decay at all. Meanwhile the document grew from
1,907 lines / ~180 KB (v8.0) to **3,642 lines / ~384 KB** (v13.0): the REQ roughly doubled in size
while its blocking-finding count went up.

That combination — monotonically growing document, non-decreasing blocking-finding count over ten
rounds — is the definitive signature of a fixed point. A sixth round of this run would not have been
different from the fifth, for the same reason the sixth round of the first run was not.

---

## Reviewers

| Role | Skill | Lens | Findings filed (this run, `-v8`..`-v12`) |
|---|---|---|---|
| Software Engineer | `pdlc:se-review` | Technical feasibility, implementability, fidelity of every existing-code claim (each re-verified against the working tree in a single pass per round) | 8H / 13M / 15L |
| Test Engineer | `pdlc:te-review` | Testability, edge-case completeness, oracle falsifiability | 8H / 17M / 12L |
| Product Manager | `pdlc:pm-author` | Authored v9.0–v13.0; addressed every H and M each round, disposed findings in REQ §10 | — |

Reviewer discipline remained high through all ten rounds and is not a contributing cause. Both
reviewers delta-scoped every re-review to the actual `git diff` between REQ revisions, opened with an
explicit prior-finding disposition table, verified every code claim they made against the tree at
`HEAD` (SE re-ran fact 14's four-pattern grep, measured `git ls-files -s` modes, measured POSIX
traverse-vs-read permission semantics, measured `git update-index --chmod=+x` worktree behaviour,
measured `git ls-files` exit codes on untracked paths), recorded positive observations, and declined
to relitigate settled points. Every round they converged on the *same* small set of defects
independently — v12's SE and TE reviews name the same five, in the same order of severity.

Author responsiveness was likewise not a cause: every High and Medium was addressed in the following
revision, with a §10 disposition table both reviewers verified as accurate each round. v12 answered
all eight TE v11 findings and all seven SE v11 findings; v13 answers all of v12's.

---

## Pattern of Disagreement

The four patterns identified in the first run all persisted. Two of them intensified.

### 1. Fix-begets-finding, now the sole source of blocking findings

In the first run this was the dominant pattern; in the second run it is essentially the *only*
pattern. Every reviewer preamble in `-v8`..`-v12` states some variant of "the defects below are in
newly written or newly load-bearing text, not re-litigation." No blocking finding in this run was
raised against REQ content that predates the loop.

The clearest chain runs through the ordering oracle for the P0 "classify before create" constraint:

| Round | The fix | The finding it created |
|---|---|---|
| v9→v10 | AC-6.5 assertion (a) mandated to prove fixture provenance | SE `-v10` F-04: `git ls-files -s` on an untracked path prints nothing and exits `0`, so the assertion is **red**, not vacuous, in the RED phase the fixture source exists to support |
| v10→v11 | The state-file assertion disclaimed as the ordering oracle | SE `-v11` F-01: there is now **no** oracle at all for the P0 ordering — zero `mkdir` seams in the JS layer, the classifier is bash, so the ordering has no observable |
| v11→v12 | AC-2.9(4) introduces two test-only bash seams, `PDLC_TRACE_FILE` and `PDLC_FAULT`, to supply that observable | SE `-v12` F-01 / TE `-v12` F-01: the trace-ordering assertion's computable form is **red against a correct implementation** of AC-6.5's own mandated `sync` + `--check` block, its intended form is not recoverable from the `probe <kind> <path>` grammar, and both forms pass **vacuously** on an empty trace. SE `-v12` F-02: the same new seam's unknown-token rule makes the SessionStart hook exit `4`, creating a third, unannounced exception to NFR-6's "exactly two exceptions" and contradicting AC-2.4's absolute P0 "exits `0` for any reason" |

Four consecutive rounds spent on one oracle, each round's answer generating the next round's defect,
ending with the newly added test seam breaking a P0 fail-open invariant in a different section of the
document. The `pluginVersion` chain is a second instance: AC-2.9(2a)'s `printf` fallback was added to
guarantee the queue always gets parseable JSON, and its own justification ("four closed-domain
scalars, nothing to escape") is false — `pluginVersion` is an arbitrary string read from the
consumer's plugin cache (`pdlc/.claude-plugin/plugin.json:4` is `"0.10.0"`), so the one write path
whose purpose is to never emit malformed JSON can emit malformed JSON (SE `-v12` F-04, TE `-v12`
F-05).

### 2. The disagreement is still about specification *precision*, never product intent

Across **twelve** rounds there is still no disagreement about what the feature should do. Nobody has
disputed the distribution model, the manifest concept, the retirement mechanism, the hook's warning
role, the priority ordering, or the phasing. Every blocking finding in this run is one of:

- an acceptance criterion that admits two readings with opposite P0 outcomes (SE `-v8` F-01: who
  `mkdir`s `.claude/workflows/`);
- an oracle that is red, vacuous, or unimplementable against a correct implementation (SE `-v10`
  F-04, SE `-v11` F-01, SE `-v12` F-01, SE `-v12` F-03, TE `-v12` F-01);
- a cross-AC contradiction between two normative statements added in different rounds (SE `-v12`
  F-02 vs NFR-6; SE `-v9` F-01, AC-2.9 vs AC-4.1's "no freshness clause");
- a measured platform fact contradicting a stated predicate (SE `-v8` F-03 traverse vs read
  permission; SE `-v9` F-02 index mode vs worktree execute bit; TE `-v12` F-04 `unlink` refusal
  classes).

Not one of these is a product question. All four classes are FSPEC (behavioural flows, decision
branches, error scenarios) or TSPEC/PROPERTIES (oracles, fixtures, seams, isolation) subject matter.

### 3. Ratcheting scope: the REQ is now specifying its own test harness

The ratchet identified in the first run continued past the point of absurdity. The v11→v13 revisions
add, to a *requirements* document: a tab-separated trace-file grammar with `run` / `phase` /
`probe` / `create` line types; a `PDLC_FAULT` fault-injection environment seam with a token
vocabulary and a stated non-interference proof obligation ("no AC's outcome depends on them"); an
85% branch-coverage floor with per-branch reachability arguments; a mandated jest fixture
construction strategy with `realpath` normalisation; a `printf`-based JSON emitter with an escaping
analysis; and a 96-cell property-generation axis table (of which SE `-v11` F-03 found 24 cells
undefined and unsatisfiable).

These are TSPEC artifacts. The REQ is authoring them because the loop's convergence test rewards
adding them — every "this has no oracle" finding is closable only by writing an oracle, and every
oracle written into a REQ is new prose that the next round reviews. The document's internal
consistency obligation is now combinatorial across ~40 interlocking ACs and cannot be preserved
by hand across a revision; that is exactly why the blocking count stopped falling.

### 4. Loop-harness defect: wrong iteration index dispatched for eleven consecutive rounds — still unfixed

Independent of content, and worse than in the first run. This run's dispatches were **"iteration 1"**
(round 1, against REQ v8.0 with fourteen reviews already committed) and **"iteration 5"** for
subsequent rounds, each instructing the reviewer to read `-v4` and write `-v5`. Both reviewers
detected the skew every time and refused; SE `-v12` F-07 records it as the **eleventh consecutive**
wrong index. Had any reviewer complied, committed review history would have been destroyed.

The first edition of this post-mortem raised this as R-3 (P0, separate queue item), and the reviewers
had already routed it to `pdlc/skills/orchestrate-dev/SKILL.md` and `pdlc/workflows/orchestrate-dev.js`
in SE `-v4` F-11. `git log` on those paths still shows no commit since `9f1e0e3`. **Eleven rounds of
correct routing plus one explicit post-mortem recommendation have produced no code change.** The
routing target is not being read by anything that can act on it.

### 5. New this run: the escalation path itself is a no-op

The 2026-07-27 post-mortem's R-1 (accept v8.0, narrow scope), R-2 (carry eight named findings to
FSPEC), R-3 (fix the harness), R-4 (add a stopping rule), and R-5 (set the queue row to `halted`)
were all P0 or P1 and none were executed. `docs/_queue/QUEUE.md` line 14 still reads `pending`. The
pipeline's response to "this loop cannot converge, escalate" was to re-run the identical loop on the
identical document. A post-mortem that no agent or human consumes is not an escape hatch; it is
another artifact the loop writes on its way around again.

---

## Best-Guess Root Cause

**Two causes, of which the second is now the more important.**

### Cause A — the REQ is being held to a specification bar that belongs to FSPEC and TSPEC

Unchanged from the first edition, and further confirmed by five more rounds of evidence:

1. **Nothing in dispute is a product question.** Zero findings across twelve rounds contest user
   need, scope, priority, or delivery phasing.
2. **The document has TSPEC shape now, not merely FSPEC shape.** 3,642 lines containing a trace-file
   grammar, a fault-injection seam vocabulary, a branch-coverage floor, fixture construction
   mandates, and a property-axis generation table. The pm-author REQ checklist bar (traceable,
   prioritized, Who/Given/When/Then, thresholds declared, deferrals bound to queue rows 6 and 7) was
   met around v4 and has been comfortably met ever since.
3. **The residual findings are cross-AC consistency defects; fixes are local, invariants are global.**
   Each local fix has roughly even odds of opening a symmetric hole elsewhere in the same invariant —
   demonstrated four rounds running on the classify-before-create oracle. Ten rounds without the
   count decaying to zero, and five rounds of this run without it decaying at all, is a fixed point.

### Cause B — the pipeline has no working non-convergence exit

The first run reached the correct diagnosis and wrote the correct recommendation. The pipeline then
discarded it and re-entered the loop, burning five more rounds, ~1,700 more lines of REQ, and ten
more cross-reviews to arrive at the same conclusion. Three mechanisms failed simultaneously:

- The **queue status was never set to `halted`**, so `orchestrate-queue` saw a `pending` row with a
  `ready: true` REQ and picked it up again.
- The **post-mortem is not an input to anything**. No skill reads `POSTMORTEM-{phase}-{feature}.md`
  at phase entry, so its R-1..R-5 were invisible to the run that followed it.
- The **harness's own iteration bookkeeping is broken** (Pattern 4), so the loop cannot even tell how
  many rounds it has run — it dispatched round 1 of the second run as "iteration 1" while twelve
  rounds of history sat on the branch.

Cause A explains why one run of five rounds did not converge. Cause B explains why the phase has now
consumed **ten** rounds and twenty-four review documents, and why it would consume ten more if nothing
outside the loop changes.

Rejected alternative causes, re-tested against this run's evidence: reviewer over-strictness (both
reviewers recorded genuine progress each round, verified their own claims by measurement, and
converged independently on the same five defects in v12); author non-responsiveness (every H and M
addressed every round, §10 disposition verified by both reviewers); genuine technical disagreement
(none — the two reviewers agree with each other and with the author on every substantive point).

---

## Recommendation

**Do not run an eleventh REQ round. Freeze the REQ, stop the queue, fix the loop, then re-enter at
FSPEC.** Recommendations are ordered; R-0 must happen before anything else re-runs.

### R-0 — Stop the queue from re-picking this feature (P0, do first)

Set the `pdlc-workflow-distribution` row in `docs/_queue/QUEUE.md` (line 14) to **`halted`** and add a
Notes reference to this file. Until this lands, any `/loop run /pdlc:orchestrate-queue` will start an
eleventh round. This was R-5 of the previous edition and was not done; it is now R-0.

### R-1 — Accept REQ v13.0 as the product-level requirement, scope-narrowed (P0, human decision)

The product-level content — problem, user stories, requirements, priorities, phasing, prerequisites,
deferral bindings to queue rows 6 and 7 — has been uncontested since v4 and is unchanged in v13.
Mark it **Approved (product scope only)** and record in the REQ that acceptance does not certify the
specification-grade material (oracles, seams, fixtures, coverage floors), which moves downstream.

Accepting v13 rather than v8 costs nothing: v13 is a strict superset and its extra material is the
input to R-2. It should **not** be revised further as a REQ.

### R-2 — Carry the open v12 findings forward as FSPEC/TSPEC entry input (P0)

| Source finding | Carry to | Item |
|---|---|---|
| SE `-v12` F-01, TE `-v12` F-01 | TSPEC / PROPERTIES | Scope the classify-before-create ordering assertion to a single classification invocation; give the trace grammar a row-id and phase field (`probe <kind> <row-id\|-> <path>`); require a positive-presence conjunct so the property cannot pass vacuously on an empty trace; make an unwritable trace a red test |
| SE `-v12` F-02, TE `-v12` F-02 | FSPEC | An unrecognised `PDLC_FAULT` token must not make the SessionStart hook exit non-zero — print the line and exit `0` on the hook, `4` on `--check`/sync. Restore NFR-6's "exactly two exceptions" as true |
| SE `-v12` F-03, TE `-v12` F-03 | TSPEC / PROPERTIES | AC-0.5 step 2's oracle must assert observables that exist in the `repo-root-unresolved` state (AC-2.5a's stderr reason line, `--check` exit `3`) — not drift-state fields that are never written; and its fixture must be a **non-git** tree, since a git work tree routes a failed step 1(b) straight to step 3 and never executes step 2's guard |
| SE `-v12` F-04, TE `-v12` F-05 | FSPEC | Render `pluginVersion` as JSON string-or-`null` in the `printf` fallback (or emit `null` unconditionally, since AC-5.4 makes it context-only), and correct the "four closed-domain scalars, nothing to escape" justification. Add a `json-tool-absent` ladder test asserting the emitted record parses and lands on AC-4.1 row 4 |
| TE `-v12` F-04 | FSPEC | Correct step 2's non-permission enumeration: `unlink` is refused on immutable, append-only and directory targets, so only `ENOSPC`/quota reaches step 2; the other two belong to step 3's residual |
| SE `-v12` F-05 | FSPEC | AC-4.1 row 3's operator message must name the case where `artifact-copy` succeeded but the drift-state write failed, so the operator is not told the copy failed |
| SE `-v12` F-06 | TSPEC | Pin the trace grammar's delimiter and quoting (one field per line, or `%q`); state whether non-row probes (`readBytes_json` on the manifest, sync manifest, `pdlc.config.json`) are traced |
| TE `-v12` F-06, F-07 | FSPEC | Fold in with the above; non-gating |

### R-3 — Fix the loop harness (P0, separate queue item, blocks all pipeline runs)

Eleven rounds of correct routing and one prior post-mortem produced no change. Raise this as its own
queue row with its own REQ rather than as a cross-review finding:

- Derive the review iteration index as `1 + max(N)` over `CROSS-REVIEW-{role}-{doc}-v{N}.md` present
  on the branch, not from a loop counter.
- Derive the reviewer's "delta against `-v{N-1}`" baseline from the same computation.
- Refuse to write a cross-review path that already exists (hard error, not a warning).

Owner: `pdlc` maintainer. Target: `pdlc/skills/orchestrate-dev/SKILL.md` and the review loop in
`pdlc/workflows/orchestrate-dev.js`, bundles rebuilt in the same commit.

### R-4 — Make the non-convergence exit actually terminal (P0, same queue item as R-3)

The gap this run exposed. On writing `POSTMORTEM-{phase}-{feature}.md`, `orchestrate-dev` must:

1. Set the feature's queue row to `halted` itself, in the same commit as the post-mortem.
2. Refuse to re-enter the same phase for the same feature while a post-mortem for that
   phase exists on the branch, unless the post-mortem is explicitly marked resolved.
3. Read any existing `POSTMORTEM-{phase}-{feature}.md` at phase entry and surface its Recommendation
   section to the phase's agents, so a second run cannot silently repeat the first.

### R-5 — Add a REQ-scope stopping rule to the pdlc method (P1)

Propose for `docs/_constraints/DOMAIN-CONSTRAINTS.md` via `consolidate-learnings`, strengthened by
this run's evidence:

> A REQ review round whose blocking findings are **all** implementability or oracle-falsifiability
> defects — none contesting user need, scope, priority, or phasing — signals the REQ has met its bar.
> Approve it and move the findings to FSPEC.
>
> Two consecutive rounds with a non-decreasing blocking-finding count is a fixed point, not slow
> convergence: escalate rather than iterate. A round in which the document grows while the blocking
> count does not fall is stronger evidence of the same.
>
> A reviewer finding of the form "this AC has no oracle" must be resolvable by **deferring** the
> oracle to TSPEC, not only by writing one into the REQ. A REQ that specifies trace grammars, fault
> injection seams, fixture construction or coverage floors has left its layer.

---

## Resolution (2026-07-28)

Acted on by the operator (Kane Ho) with Claude, outside the loop — which is what the
Recommendation section required.

| Rec | Action taken |
|---|---|
| R-0 | `docs/_queue/QUEUE.md` row 1 set `halted`, with a note referencing this file. |
| R-1 | REQ v14.0 authored: the product-level content of v13.0 (unchanged since v4) restated at requirements altitude and marked **Approved (product scope)**. v13.0 (`9b66cdb`) remains in git history as the archived specification-grade record. The REQ is not to be revised further at REQ level; findings of specification precision are answered by §10 of the REQ (downstream obligations), not by REQ revision. |
| R-2 | The open v12 findings (SE F-01..F-07, TE F-01..F-07) are bound as FSPEC/TSPEC/PROPERTIES entry obligations in REQ v14 §10, per the carry-forward table in this file's R-2. |
| R-3 / R-4 | Raised as queue row 8, `pdlc-review-loop-hardening` (`blocked` until its REQ is authored). To be landed before row 1 is un-halted. |
| R-5 | Deferred to the next `consolidate-learnings` run; the stopping rule is quoted in REQ v14 §10 so it is visible to the next reviewer regardless. |

This post-mortem is **resolved**. A future run that finds this file may treat Phase R for this
feature as closed: the REQ is accepted at product scope and the pipeline re-enters at FSPEC.
