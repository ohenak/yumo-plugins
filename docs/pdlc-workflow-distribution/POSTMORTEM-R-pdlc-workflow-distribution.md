# POSTMORTEM — Phase R (REQ review loop) — pdlc-workflow-distribution

| Field | Value |
|---|---|
| Upstream | `REQ-pdlc-workflow-distribution.md` (v8.0) → **POSTMORTEM-R** |
| Downstream | `LEARNINGS-pdlc-workflow-distribution.md`, `docs/_queue/QUEUE.md` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v{1..7}.md` — fourteen files, all on `feat-pdlc-workflow-distribution` |
| LEARNINGS | `docs/pdlc-workflow-distribution/LEARNINGS-pdlc-workflow-distribution.md` |
| Author | pm-author (Claude) |
| Date | 2026-07-27 |
| Scope | Non-convergence of the REQ cross-review loop. Not a product-decision record; not a technical design record. |

---

## Phase

**Phase R — REQ authoring and cross-review**, feature `pdlc-workflow-distribution`.

The phase ran the standard author → dual cross-review → address → re-review cycle. It reached the
iteration limit without both reviewers returning **Approved**. No REQ was accepted; FSPEC was never
entered. The pipeline halts here.

---

## Iterations (5 — limit reached)

The loop's iteration counter ran 1..5 and hit its ceiling. Because two SE/TE review pairs already
existed on the branch before the loop began (v1 and v2, from the initial authoring pass), the loop's
iteration *N* wrote review file *v(N+2)*. Both reviewers refused to overwrite committed reviews and
filed under the correct next index instead — this index skew is itself a recorded finding (see
Pattern, item 4).

| Loop iteration | REQ version reviewed | SE review | TE review | SE verdict | TE verdict | REQ revision produced |
|---|---|---|---|---|---|---|
| (pre-loop) | v1.0 | `-v1` | `-v1` | Needs revision | Needs revision | v2.0 (`67b45ae`) |
| (pre-loop) | v2.0 | `-v2` (4H/5M/4L) | `-v2` | Needs revision | Needs revision | v3.0 |
| 1 | v3.0 | `-v3` (7H/5M/4L) | `-v3` (no content delta; 9 findings still open) | Needs revision | Needs revision | v4.0 (`ef4d402`) |
| 2 | v4.0 | `-v4` (3H/3M/5L) | `-v4` (2H/3M/4L) | Needs revision | Needs revision | v5.0 (`05f2524`) |
| 3 | v5.0 | `-v5` (1H/4M/5L) | `-v5` (3H/4M/3L) | Needs revision | Needs revision | v6.0 (`14acd80`) |
| 4 | v6.0 | `-v6` (1H/2M/5L) | `-v6` (1H/3M/3L) | Needs revision | Needs revision | v7.0 (`527aadc`) |
| 5 | v7.0 | `-v7` (0H/4M/3L) | `-v7` (2H/1M/4L) | Needs revision | Needs revision | v8.0 (`ee3ec4c`) — **never reviewed; limit reached** |

Trajectory of blocking findings (High + Medium), summed across both reviewers:

| Round | v2 | v3 | v4 | v5 | v6 | v7 |
|---|---|---|---|---|---|---|
| H+M | 9+ | 12+ | 11 | 12 | 7 | 7 |

The count fell over the first four loop rounds and then **flattened at 7 for two consecutive rounds**
without reaching zero. The REQ grew from a normal-sized document to **1,907 lines / ~180 KB** over
eight versions. Every round retired findings *and* opened new ones on the text written to retire them.

---

## Reviewers

| Role | Skill | Lens | Findings filed (loop rounds 1–5) |
|---|---|---|---|
| Software Engineer | `pdlc:se-review` | Technical feasibility, implementability, fidelity of every existing-code claim (each verified against the working tree in a single pass per round) | 12H / 18M / 22L across `-v3`..`-v7` |
| Test Engineer | `pdlc:te-review` | Testability, edge-case completeness, oracle falsifiability | 8H / 11M / 14L across `-v3`..`-v7` |
| Product Manager | `pdlc:pm-author` | Authored v1.0–v8.0; addressed every H and M each round, disposed findings in REQ §10 | — |

Both reviewers behaved correctly throughout: delta-scoped re-reviews, verified citations, explicit
prior-finding disposition tables, and positive observations recording what genuinely converged. The
non-convergence is not a reviewer-discipline failure.

---

## Pattern of Disagreement

Four distinct patterns, in descending order of contribution to non-convergence.

### 1. Fix-begets-finding: each revision's new specification text is itself new review surface

This is the dominant pattern. In every loop round, a majority of the round's blocking findings were
raised against **text written in the previous round to close a prior finding** — not against
long-standing REQ content.

Worked examples:

- **Unreadable-artifact reason.** SE `-v6` F-03 asked for a distinct reason when `consumerPath`
  exists but is unreadable. v7 added `consumer-artifact-unreadable`. SE `-v7` F-01 then found the
  *identical* argument unapplied on the plugin side, where `plugin-artifact-missing` still folds in
  the unreadable case and routes the operator to the wrong remediation (plugin reinstall instead of
  a permissions fix). Net: one finding closed, one symmetric finding opened.
- **Backup-id namespace.** TE `-v6` F-06 asked for a rule preventing two retired paths from sharing
  a basename. v7 added the rule as three separate well-formedness clauses. SE `-v7` F-02 found the
  three clauses do not forbid `basename(retiredPath) == row.id`, reopening the exact collision the
  rule was added to close, plus a charset gap on retired basenames.
- **Test-fixture isolation.** SE `-v5` F-03/F-04 and TE `-v5` F-06 demanded an implementable oracle
  for AC-6.4. v6 and v7 answered with a fourth exemption rule plus a non-git `os.tmpdir()` fixture
  root — praised by both reviewers as the right answer. That answer immediately produced SE `-v7`
  F-03 (the new AC-6.5 fixture clones `HEAD`, so the mandated test verifies committed content rather
  than the code under test and cannot go RED→GREEN test-first) and F-05 (a now-overbroad absolute
  claim about `pdlc/workflows/dist/`).
- **Remediation table.** AC-2.8 was added to answer earlier "what does the operator do" findings.
  It arrived carrying two new defects of its own: a golden-output oracle that cannot be written
  because the printed backup path contains a `{stamp}` that does not exist at print time (SE `-v7`
  F-04), and an unreachable table row (SE `-v7` F-06 / TE `-v7` F-04).

Both reviewers explicitly noted the pattern. TE `-v7`: "first time in seven iterations [that an]
oracle in this REQ [has] been specified [on] both discovery branch [and] fixture lifetime". SE `-v7`:
"two fixes leave [a] symmetric half open, two new ACs introduce defects [of their] own."

### 2. The disagreement is about specification *precision*, never about product intent

Across seven rounds there is **no disagreement over what the feature should do**. Nobody disputed the
distribution model, the manifest concept, the retirement mechanism, the hook's warning role, or the
priority ordering. Every blocking finding is of the form: *this acceptance criterion admits two
readings, and a test author would have to pick one*. The loop was consuming iterations to drive an
already-agreed product to a level of formal completeness — closed reason sets, total classification
functions, falsifiable golden-output oracles, provable fixture isolation — that is design-level, not
requirements-level, work.

### 3. Ratcheting scope: acceptance bar rose faster than the document could satisfy it

Early rounds asked "is this claim true?" (fact 14's file enumeration was wrong for three consecutive
rounds; manifest path stated inconsistently in five places). Once those closed, later rounds asked
"is this classification total and every member distinguishable in output?" (AC-1.2's closed reason
set × AC-1.8(i)'s presence axes × AC-2.5's distinguishability × AC-4.2's remediation routing — a
four-way consistency obligation, where changing any one surface reopens the other three). The REQ
now carries a combinatorial internal-consistency invariant that a prose document maintained by hand
cannot reliably preserve across a revision. That is precisely why rounds 4 and 5 flattened at 7
blocking findings instead of decaying to zero.

### 4. Loop-harness defect: wrong iteration index dispatched for five consecutive rounds

Independent of content. The orchestrator dispatched every round as "iteration 5" (and earlier rounds
with similarly stale indices), instructing each reviewer to read `-v4` and write `-v5` while `-v1`
through `-v6` were already committed. Both reviewers detected the skew and refused — writing `-v5`
would have destroyed two committed reviews and delta'd against a three-revision-stale baseline.
Filed as SE `-v4` F-11, SE `-v6` F-08, SE `-v7` F-07, and noted again in TE `-v7`. The reviewers
correctly declined to fix it inside the REQ and routed it to
`pdlc/skills/orchestrate-dev/SKILL.md` / `pdlc/workflows/orchestrate-dev.js`. `git log` on that path
shows no commit since `9f1e0e3` — **five rounds of correct routing produced no landing**, meaning the
routing target is not being read. Had a reviewer complied with the dispatch, prior review history
would have been silently overwritten.

---

## Best-Guess Root Cause

**The REQ is being asked to carry FSPEC-and-TSPEC-grade specification detail, and the review loop's
convergence test is applied to a level of detail no requirements document can reach in five rounds.**

Supporting evidence:

1. **Nothing in dispute is a product question.** Zero findings across seven rounds contest user need,
   scope, priority, or delivery phasing. Every blocking finding is an implementability or oracle-
   falsifiability defect — the native subject matter of FSPEC (behavioral flows, decision branches,
   error scenarios) and TSPEC/PROPERTIES (test oracles, fixtures, isolation), not REQ.
2. **The document has FSPEC shape.** 1,907 lines, a closed reason enum with disjointness obligations,
   a per-path remediation routing table, POSIX-ERE backup-filename regexes, a mandated jest fixture
   construction strategy, and a minimum `git` version with three declared degradation fixtures. The
   pm-author quality checklist's REQ bar (traceable, prioritized, Who/Given/When/Then, thresholds
   declared, deferrals bound) was met by roughly v4; rounds 3–5 were spent on material downstream of
   that bar.
3. **The residual findings are cross-AC consistency defects, and their count is stable, not
   decaying.** Fixes are local; the invariants are global. Each local fix has a ~50% chance of
   opening a symmetric hole elsewhere in the same invariant. Two rounds at 7 blocking findings is the
   signature of a fixed point, not of slow convergence — round 6 would not have been meaningfully
   better than round 5.
4. **Contributing, not causal: the harness never advanced the iteration index**, so each round's
   dispatch pointed at a stale baseline. The reviewers compensated, so this did not cause the
   non-convergence — but it means the loop's own bookkeeping was unreliable throughout, and an
   uncompensating reviewer would have destroyed review history.

Rejected alternative causes: reviewer over-strictness (both reviewers approved genuine progress
explicitly, verified their own claims against the tree, and correctly declined to relitigate settled
points); author non-responsiveness (every H and M was addressed each round, with a §10 disposition
table both reviewers verified); and genuine technical disagreement (none exists — the reviewers agree
with each other and with the author on every substantive point).

---

## Recommendation

**Do not run a sixth REQ round. Accept the REQ at v8.0 with a narrowed scope, and move the residual
findings downstream.**

### R-1 — Accept REQ v8.0 as the product-level requirement (P0, human decision)

v8.0 already settles the six blocking answers from the v7 pair (see its own preamble). Its
product-level content — problem, user stories, requirements, priorities, phasing, prerequisites,
deferral bindings — is uncontested and has been stable since v4. Mark it **Approved (scope-narrowed)**
and record in the REQ that acceptance covers product intent only.

### R-2 — Split the specification-grade material into FSPEC and carry the open findings there (P0)

The residual SE `-v7` and TE `-v7` findings are FSPEC/TSPEC work items, not REQ defects. Carry them
forward explicitly as FSPEC entry input rather than discarding them:

| Source finding | Carry to | Item |
|---|---|---|
| SE `-v7` F-01 | FSPEC | Apply the unreadable-artifact argument symmetrically: add `plugin-artifact-unreadable` to the closed reason set, routed to a permissions fix, not a plugin update |
| SE `-v7` F-02 | FSPEC | State the backup-id namespace rule once and completely: `{row ids} ∪ {retired basenames}` pairwise distinct **and** every member matching the `id` charset; violation ⇒ `manifest-malformed` |
| SE `-v7` F-03 / TE `-v7` F-03 | TSPEC / PROPERTIES | Build the bootstrap fixture from the working tree's tracked files (`git ls-files -z` → temp dir), not a `HEAD` clone; normalize `realpath` for macOS `/var` → `/private/var` |
| SE `-v7` F-04 | FSPEC | Decide: the remediation message prints the backup **directory** plus a filename **pattern**, not a concrete path containing an unrealized `{stamp}` |
| SE `-v7` F-05, F-06 / TE `-v7` F-04 | FSPEC | Qualify AC-6.2's `dist/` claim to this repository; delete or mark defensive the unreachable `baselineStatus: unresolved` remediation row |
| TE `-v7` F-01 | FSPEC | Give AC-2.8's `in-sync` row a real remediation (plain `sync-workflows.sh`) or scope it out with a stated reason |
| TE `-v7` F-02 | FSPEC | Define "parent directory does not exist" and add it to AC-1.8(i)'s presence axis (v8.0 claims to settle this — confirm at FSPEC entry) |
| TE `-v7` F-06, F-07 | FSPEC | Split AC-4.2's remediation list by level (manifest-level vs row-level); state when `supersedingState` is measured, per surface |

### R-3 — Fix the loop harness before any further pipeline run (P0, separate queue item)

Five rounds of correct routing produced no code change. Raise this as a direct queue item rather than
relying on cross-review routing:

- Derive the review iteration index as `1 + max(N)` over `CROSS-REVIEW-{role}-{doc}-v{N}.md` present
  on the branch, instead of from a loop counter.
- Make the reviewer dispatch's "read `-v{N-1}`" baseline derive from the same computation.
- Add a guard that refuses to write a cross-review path that already exists.

Owner: `pdlc` maintainer. Target: `pdlc/skills/orchestrate-dev/SKILL.md` and the review loop in
`pdlc/workflows/orchestrate-dev.js` (bundles rebuilt in the same commit).

### R-4 — Add a REQ-scope stopping rule to the pdlc method (P1)

The generalizable lesson. Propose for `docs/_constraints/DOMAIN-CONSTRAINTS.md` via
`consolidate-learnings`:

> A REQ review round whose blocking findings are **all** implementability or oracle-falsifiability
> defects — none contesting user need, scope, priority, or phasing — signals the REQ has met its bar.
> Approve it and move the findings to FSPEC. Two consecutive rounds with a non-decreasing blocking-
> finding count is a fixed point, not slow convergence; escalate rather than iterate.

### R-5 — Queue status

Set the `pdlc-workflow-distribution` row in `docs/_queue/QUEUE.md` to **`halted`** pending the human
decision on R-1. On approval it resumes at Phase F (FSPEC) with R-2's carry-forward table as input.
