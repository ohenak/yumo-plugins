---
feature: pdlc-review-loop-hardening
ready: true
depends-on: []
---

# REQ — pdlc-review-loop-hardening

| Field | Value |
|---|---|
| Upstream | `docs/pdlc-workflow-distribution/POSTMORTEM-R-pdlc-workflow-distribution.md` (v2.1) findings R-3, R-4; operator observation of the 2026-07-28 Phase F run |
| Downstream | `FSPEC-pdlc-review-loop-hardening.md`; de-risks every remaining `docs/_queue/QUEUE.md` row (this row is `Order 0`, called row 8 before 2026-07-29) |
| Queue row | 8 (`blocked` — a human sets it `pending` to admit it to the pipeline) |
| Targets | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`, `pdlc/skills/orchestrate-dev/SKILL.md`, `pdlc/skills/orchestrate-queue/SKILL.md`, the three author SKILLs; runtime bundles rebuilt in the same commit |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-07-28 |

> **Stopping rule (binding on Phase R for this document).** This REQ is written at requirements
> altitude, per the lesson recorded in POSTMORTEM-R R-5 and applied in
> `REQ-pdlc-workflow-distribution` v14. A review finding of the form "this AC has no oracle / no
> fixture / no seam" is answered by §8 — it is a downstream obligation, not a REQ revision. Only a
> finding that contests user need, scope, priority, phasing, or an AC's *observable behavior* may
> block this document. Two consecutive rounds of non-decreasing blocking-finding count is a fixed
> point: escalate to the operator, do not iterate.

## 1. Problem

The PDLC harness is now the dominant failure mode of the PDLC pipeline. Across the four full runs
in the history of branch `feat-pdlc-workflow-distribution`, **three died to harness defects rather
than to the substance of the work**:

| Run | Phase | Outcome | Cause |
|---|---|---|---|
| 1 | R | Non-convergence at the 5-iteration ceiling (REQ v3–v8) | Content — REQ altitude (addressed by v14) |
| 2 | R | Non-convergence at the 5-iteration ceiling (REQ v8–v13) | Content — same, plus **H-1** corrupting the review record |
| 3 | R | Halted; row set `halted`; POSTMORTEM written | **H-2** — the halt was not terminal in any enforced sense |
| 4 | R converged (v14→v17, 4 rounds); **F produced nothing** | Halted after 6 identical dead attempts | **H-3** — monolithic document write vs. the runtime stall watchdog |

Run 4 is the clearest statement of the problem. Phase R converged for the first time — SE and TE
both returned *Approved with minor changes* on v17 (`e1a627f`, `a82365e`), with blocking findings
descending 1H/1M → 1H/1M → 1H/1M → 0H/0M against the flat 8–10 band of the preceding ten rounds.
The pipeline then spent **~71 minutes and ~1.34 M subagent tokens producing zero bytes of FSPEC**,
because each of six `pm-author` attempts was killed mid-generation of a single large `Write`:

```
15:45:49 → 15:51:20  INTERRUPTED  "Now writing the FSPEC."
15:51:20 → 15:55:59  INTERRUPTED  "I'll start by invoking the pm-author skill."
15:56:00 → 16:00:53  INTERRUPTED  "I'll start by invoking the pm-author skill."
16:00:53 → 16:06:02  INTERRUPTED  "Now I'll author the FSPEC."
16:06:02 → 16:12:29  INTERRUPTED  "Now I'll write the FSPEC."
16:12:29 → 16:17:43  INTERRUPTED  "Now I'll write the FSPEC."
```

The kill lands ~180 s after the last emitted progress event, which in every case was the sentence
announcing the write. The retry then re-ran a byte-identical prompt that could not succeed.

Four distinct defects are in scope. Each is stated below as an observable behavior, not as an
implementation.

### H-1 — the review loop dispatches an iteration index that ignores the branch

`reviewLoop` derives every `v{N}` suffix from an in-memory counter that always starts at 1
(`pdlc/workflows/orchestrate-dev.js:537`; no call site passes `iteration` — verified at all seven
sites, `:1648, :1674, :1700, :1741, :1770, :1796, :1912`). The module performs **no directory
listing at all** — there is no `readdirSync` and no glob anywhere in the file — so existing
`CROSS-REVIEW-{role}-{doc}-v{N}.md` files on the branch are invisible to it. The prompts carry the
counter verbatim: `` `This is iteration ${iteration}.` `` (`:702`) and `` `Write your new
cross-review as v${iteration} …` `` (`:720`); the reviewer SKILL is the party that turns that
number into a filename (`pdlc/skills/se-review/SKILL.md:69,72,143`).

Consequence, observed for **eleven consecutive rounds** on this branch: the harness instructed
reviewers to write `v1`, `v2`, … over a branch that already held `v1`–`v13`. The review record
survived only because the reviewer agents noticed and overrode the instruction — e.g. *"the task
said 'write as v2', but `CROSS-REVIEW-software-engineer-REQ-v1.md` through `-v13.md` already exist
on this branch"*. The harness's correctness currently depends on agent disobedience.

Two further symptoms of the same root: the prompts emit the literal placeholder `{DOC-TYPE}`, never
substituted by the script (`:707-709`, `:731-733`), and the back-reference to the previous round
points at `v${iteration - 1}` — a file that, after a resume, is not the previous round's file.

### H-2 — the non-convergence exit is not terminal

On hitting the ceiling, `reviewLoop` asks the phase optimizer to write
`docs/{feature}/POSTMORTEM-{phase}-{feature}.md` with six mandated sections — *Phase, Iterations,
Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation*
(`orchestrate-dev.js:560-589`) — then returns non-converged, and `checkConverged` (`:494-514`)
halts. Nothing else happens. Specifically:

- **The queue row is set `halted` but never committed.** `orchestrate-dev.js` does not read or
  write `docs/_queue/QUEUE.md` at all (its single mention, `:1137`, is prose inside a DoD prompt).
  The status write lives one layer up in `orchestrate-queue.js` (`:676`, `:680-682`, `:691-693`)
  and the driver performs **zero git operations** — the edit is left in the working tree. A run
  invoked as `orchestrate-dev` directly touches no queue row whatsoever.
- **Nothing ever reads a POSTMORTEM at phase entry.** Repo-wide, the only read is the Phase-H
  harvest prompt (`:818`), which is unreachable on a halted run. `reviewLoop`'s sole entry
  precondition is a non-empty check on the document under review (`:541-549`).
- **A re-entered phase restarts at iteration 1 with a fresh five-round budget**, against the same
  unresolved disagreement that exhausted the previous one, with no operator-visible statement of
  what the last attempt concluded.
- **The halt message asserts `POSTMORTEM written.` unconditionally** (`:511-513`) even though the
  write path sets `postmortemFailed` and merely logs a warning on failure (`:586-588`).

### H-3 — monolithic document authoring is unsurvivable under the runtime stall watchdog

The workflow runtime kills an agent that emits no progress event for 180,000 ms and retries up to
six times. **This is runtime-side and not configurable from this repo** — grep establishes that no
`180000`, `stall`, `no progress`, retry-count or attempt-count constant exists anywhere under
`pdlc/` or `.claude/`. It must therefore be treated as an immutable environmental constraint, and
the fix must be on the authoring side.

The author SKILLs today instruct a single terminal write — *"After completing: write all artifacts
to disk, stage, commit"* (`pdlc/skills/pm-author/SKILL.md:29`), and the numbered procedures end at
*"Commit and push"* (`:88`, `:109`, `:121`). A PDLC spec document is routinely 700–1000 lines
(`REQ-pdlc-workflow-distribution.md` is 970 lines / 84,671 bytes), and generating that as one tool
call exceeds the window with no intervening progress event. The failure is **deterministic**, so
the six retries are not merely wasted — they are structurally incapable of succeeding, and the
run's entire budget is spent discovering that.

### H-4 — there is no way to skip a phase whose document is already approved

`main()` has exactly three conditional phase skips: `decisionsWarranted(...)` for Phase D
(`:1726`) and the compile-time flags `PHASE_DOD_ENABLED` (`:21`), `PHASE_H_ENABLED` (`:18`),
`PHASE_PUB_ENABLED` (`:27`). Phase R runs `reviewLoop` unconditionally (`:1648`); the only gate is
an existence check that cannot distinguish an approved REQ from a draft.

So the immediate operational consequence of run 4: `REQ-pdlc-workflow-distribution` v17 carries
dual approval, and re-entering the pipeline to reach Phase F would re-run all four Phase-R rounds
first — re-reviewing an approved document at Opus rates, with a non-trivial chance of a *needs
revision* verdict reopening a settled question.

## 2. Users and value

| User | Today | After |
|---|---|---|
| **Operator running `/loop run /pdlc:orchestrate-queue`** | An overnight loop can burn its whole budget on retries of an impossible write, or on re-reviewing an approved document, and reports a halt whose recovery procedure is undocumented. | A stall-killed authoring attempt resumes from the last committed section; an approved phase is skipped with a logged reason; a halted row states what to do next. |
| **Operator diagnosing a halt** | Must reconstruct the cause from raw transcripts; the POSTMORTEM exists but nothing surfaces it, and the queue edit is uncommitted. | The halt report and the next phase entry both surface the POSTMORTEM's Recommendation; the queue row's `halted` state is committed and durable. |
| **Reviewer / author agents** | Instructed to write review files at indices that would destroy existing history; correctness depends on the agent noticing. | Instructed with an index derived from the branch, and refused if it would overwrite. |
| **Downstream queue features (rows 1–7)** | Every one of them runs through this harness and inherits all four defects. | Run on a harness whose failure modes are terminal, resumable, and legible. |

**Priority.** *Restated 2026-07-29 — the original premise was falsified, and the conclusion held.* This
paragraph read "land before row 1 is un-halted … running it again on the current harness is the
experiment that has now failed three times". Row 1 (`pdlc-workflow-distribution`) was in fact run again
on the unfixed harness and **completed** — merged as `1fb6cbe` — so it is no longer the motivating case.
That run is corroboration, not refutation: it cost 16 REQ rounds against a 5-round policy, ~10 of them
producing no product-level change, and its harvest re-derived H-1 and H-2 independently from the
evidence (`LEARNINGS-pdlc-workflow-distribution.md` §1a–§1b). The priority is therefore **higher**, not
lower, and now rests on rows 2–7 rather than on row 1: every one of them runs through this harness and
inherits all four defects. This row was set `pending` and moved to `Order 0` on 2026-07-29, ahead of
`pdlc-merge-phase`.

## 3. Acceptance criteria

### AC-1 — Iteration index derived from the branch (H-1)

- **AC-1.1** Before dispatching reviewers for a phase, the pipeline determines the round index from
  the review artifacts present on the branch for that feature and document type: the next index is
  one greater than the highest existing `CROSS-REVIEW-{role}-{doc-type}-v{N}.md`, or 1 when none
  exist. A fresh phase is therefore unchanged in behavior.
- **AC-1.2** The index is computed once per round and is the same for every reviewer in that round,
  and for the author prompt that follows it.
- **AC-1.3** Reviewer and author prompts name **concrete file paths** — feature, role and document
  type all substituted. No unsubstituted placeholder (e.g. a literal `{DOC-TYPE}`) reaches an
  agent's prompt.
- **AC-1.4** An author or reviewer agent is instructed never to overwrite an existing
  `CROSS-REVIEW-*` file. If the file it was told to write already exists, that is a pipeline-level
  error surfaced to the operator, not a silent overwrite and not a silent skip.
- **AC-1.5** When a round's index is greater than 1, the back-reference to the previous round names
  the file that actually holds the previous round's review for that role and document type.
- **AC-1.6** The five-round budget is counted from the round the *current invocation* starts at, and
  both the starting index and the budget are stated in the run log at phase entry.

### AC-2 — Terminal, legible non-convergence (H-2)

- **AC-2.1** When a phase writes a POSTMORTEM, the feature's queue row is set `halted` **and that
  change is committed** in the same operation, so the halt survives the process. This holds whether
  the pipeline was entered via `orchestrate-queue` or invoked directly on a REQ path.
- **AC-2.2** If the POSTMORTEM artifact was not in fact written, the halt does not claim it was; the
  operator-facing reason distinguishes "non-convergence, post-mortem written at `{path}`" from
  "non-convergence, post-mortem write failed".
- **AC-2.3** At phase entry, the pipeline checks for an unresolved POSTMORTEM for that phase and
  feature on the branch. If one exists, the phase is **refused** — the pipeline halts with the
  POSTMORTEM's *Recommendation* section reproduced in the operator-facing report, rather than
  re-entering the loop.
- **AC-2.4** A POSTMORTEM is marked resolved by an explicit, operator-visible act recorded in the
  artifact itself. Once resolved, the phase may be re-entered normally. Nothing in the pipeline
  resolves a POSTMORTEM on its own behalf.
- **AC-2.5** The halt report identifies the phase and the POSTMORTEM path as structured fields, not
  only inside a free-text reason string.
- **AC-2.6** Attempting to write a queue status for a feature that has no matching queue row is an
  error surfaced to the operator, not a silent no-op.
- **AC-2.7** The documented status lifecycle states how a `halted` row is recovered — what a human
  must do, and what the pipeline will refuse until they do it.

### AC-3 — Resumable, incremental document authoring (H-3)

- **AC-3.1** An authoring agent producing a specification document (REQ, FSPEC, TSPEC, PLAN,
  PROPERTIES, DECISIONS) writes it incrementally: a skeleton first, then section-by-section, such
  that the interval between successive tool calls stays well inside the runtime's no-progress
  window. No single write is expected to carry a whole document.
- **AC-3.2** Partial progress is durable. A document killed mid-authoring leaves the sections
  written so far on disk and committed, not an empty file and not a truncated one that reads as
  complete.
- **AC-3.3** A retried authoring attempt **resumes**: it detects the partial document, and continues
  from the first unwritten section rather than restarting from an empty file. The prompt for a
  retry differs from the prompt for a first attempt.
- **AC-3.4** A document is only treated as complete when it is structurally complete — the presence
  of a non-empty file is not sufficient evidence that authoring finished.
- **AC-3.5** When an agent dispatch is killed and retried without the run making progress, the
  operator-facing report says so, naming the phase, the artifact and the attempt count. A run that
  exhausts its retries reports "no progress across N attempts" rather than a generic halt.
- **AC-3.6** Applies uniformly to `pm-author`, `se-author` and `te-author`; a review or remediation
  agent editing an existing document inherits AC-3.1's pacing obligation for edits of comparable
  size.

### AC-4 — Approved-phase skip (H-4)

- **AC-4.1** A phase whose document already carries dual reviewer approval on the branch is skipped
  on re-entry, with a logged reason naming the document, the approving reviews and the round at
  which approval was reached.
- **AC-4.2** Approval is established from artifacts on the branch — the reviewers' recorded verdicts
  — not from a hand-edited status field alone.
- **AC-4.3** Both approving verdict forms count: *Approved* and *Approved with minor changes*. This
  matches the existing convergence gate; the skip must not be stricter than the gate that produced
  the approval.
- **AC-4.4** If the document has been modified after the approving reviews, the phase is **not**
  skipped — the skip must not launder an unreviewed edit.
- **AC-4.5** The skip is observable in the final report: skipped phases are listed with their reason
  and are visibly distinct from phases that ran and from phases that failed.
- **AC-4.6** An operator can force a phase to run despite recorded approval.

### AC-5 — Consistency of the harness itself

- **AC-5.1** The iteration cap, currently the bare literal `5` repeated at four sites
  (`orchestrate-dev.js:561, :566, :597`, and `:509`/`:512`), is a single named constant, matching
  the convention already set by `DOD_MAX_ITERATIONS` (`:24`).
- **AC-5.2** The dead POSTMORTEM path template at `:508` — which carries literal, uninterpolated
  `{feature}` braces — is removed or made correct; no un-substituted template reaches a report.
- **AC-5.3** `pdlc/skills/orchestrate-dev/SKILL.md` documents the review-loop iteration cap, the
  non-convergence exit, the POSTMORTEM's mandated sections and the approved-phase skip. Today its
  only POSTMORTEM mention is a naming-convention aside (`:83`) and the only documented cap is the
  unrelated DoD one (`:57`).
- **AC-5.4** `pdlc/skills/orchestrate-queue/SKILL.md` documents the `halted` recovery procedure. Its
  lifecycle diagram (`:102-109`) currently shows `halted` as a terminal leaf with no way out.
- **AC-5.5** The runtime bundles (`.claude/workflows/*.bundle.js`) are rebuilt in the same commit as
  any change to their sources, and `build-runtime.mjs --check` passes.

## 4. Constraints

- **C-1 — The stall watchdog is not ours.** The 180,000 ms no-progress kill and the six-attempt
  retry are properties of the Claude Code workflow runtime. No requirement here may be satisfied by
  changing, extending or disabling them. AC-3 is an authoring-side accommodation.
- **C-2 — Runtime authoring constraints.** Workflow sources compile to bundles under the runtime's
  restrictions (`export const meta` first and a pure literal, no other `export`, no `import` /
  `process` / `fs` / `fetch`). Any new capability that needs the filesystem — reading the branch's
  review artifacts for AC-1.1 and AC-2.3 — must reach the runtime through the dependency-injection
  seams in `runtime-adapter.js`, and **every injected IO call must be `await`ed** (adapter
  implementations are async; test doubles are sync).
- **C-3 — Self-modification.** This feature modifies the pipeline that would execute it. Per
  `docs/_queue/QUEUE.md` §Bootstrapping, pipeline changes ship *between* queue iterations, never
  during one, and this PR is operator-merged.
- **C-4 — Backwards compatibility on a clean branch.** On a branch with no prior review artifacts
  and no POSTMORTEM, observable pipeline behavior is unchanged.
- **C-5 — No agent in a decision loop that a script can make.** Index derivation, approval
  detection and POSTMORTEM detection are deterministic file inspections; they must not cost a
  model call, consistent with the existing design that took the agent out of the CI poll loop.

## 5. Non-goals

- Changing the five-round cap's *value*, or the convergence criterion itself.
- Changing what reviewers assess, or the verdict trailer grammar.
- Redesigning the queue schema, adding new statuses, or automating `awaiting-merge → done`.
- Automatic resolution of a POSTMORTEM, or any automatic un-halting of a queue row. Both remain
  human acts (AC-2.4, AC-2.7).
- Automatic PR merge, or any change to Phase PUB.

## 6. Deferrals

| # | Deferred | Rationale | Successor |
|---|---|---|---|
| D-RLH-01 | Cross-phase resume — re-entering a pipeline mid-run and continuing from the phase that failed, rather than from the top with per-phase skips. | AC-4's skip achieves the practical effect for approved phases at far lower risk. A general resume needs durable run state, which does not exist. | New queue row when needed. |
| D-RLH-02 | Adaptive round budget (e.g. escalate on two consecutive rounds of non-decreasing blocking count, per POSTMORTEM R-5). | Genuinely valuable, but it is a change to the convergence *policy*; this feature is about the harness executing the existing policy correctly. Keeping them separate keeps this REQ approvable. | New queue row. |
| D-RLH-03 | Progress heartbeats emitted from within a long agent turn. | Would address H-3 at its root rather than by pacing, but depends on runtime capabilities this repo does not control (C-1). | Revisit if the runtime exposes one. |

## 7. Risks

| # | Risk | Response |
|---|---|---|
| R-1 | **The skip laundering an unreviewed edit** — AC-4 skipping a phase whose document changed after approval. | AC-4.4 makes staleness a first-class condition; AC-4.6 gives the operator an override in the direction of *more* review. |
| R-2 | **AC-2.3's refusal deadlocking the operator** — an unresolved POSTMORTEM blocking every re-entry with an unclear escape. | AC-2.4 and AC-2.7 require the resolution act and its documentation to ship together with the refusal. |
| R-3 | **Incremental authoring degrading document coherence** — section-at-a-time writing producing a document that does not hang together. | AC-3.1 mandates a skeleton first, so the structure is decided before the prose. AC-3.4 keeps a partial document from being mistaken for a finished one. |
| R-4 | **Bootstrapping** — a defect in this change disables the pipeline that would fix it. | C-3; plus `cd pdlc/workflows && npm test` is a real, local gate that runs without the pipeline. |
| R-5 | **This REQ hitting the very loop it fixes.** | The §preamble stopping rule, and the escalation clause within it. |

## 8. Downstream specification obligations

Binding entry input for FSPEC/TSPEC/PROPERTIES. The authoring agent must dispose of every row; the
reviewers of that document must verify the disposition. These are **not** REQ revisions — a review
finding that one of these is unspecified here is answered by this table.

| # | Lands in | Obligation |
|---|---|---|
| O-1 | FSPEC | The mechanism for discovering review artifacts on the branch (AC-1.1, AC-4.2). `orchestrate-dev.js` has no directory-listing capability today; specify the injected seam, its adapter implementation, and its behavior when the feature directory does not exist. |
| O-2 | FSPEC | The filename grammar for `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, including the un-suffixed first-round form, the role slugs (`orchestrate-dev.js:680-687`), and the document-type token — enough to parse `N` unambiguously and to reject a non-conforming name. |
| O-3 | FSPEC | How "unresolved POSTMORTEM" is represented (AC-2.3, AC-2.4) — the marker's location and grammar, and how the *Recommendation* section is extracted for the report. |
| O-4 | FSPEC | The queue-status commit (AC-2.1): who performs the git operation given that neither orchestrator does any git today, what the message is, and the behavior when the working tree is dirty or the commit fails. |
| O-5 | FSPEC | The direct-invocation path for AC-2.1 — `orchestrate-dev` does not know about the queue at all; specify how it locates the row, and what it does when the feature has no row. |
| O-6 | FSPEC | The retry-aware prompt contract (AC-3.3): how an author agent is told it is a retry, and how it determines the first unwritten section. |
| O-7 | FSPEC | The structural-completeness criterion for each document type (AC-3.4). |
| O-8 | FSPEC | The staleness comparison for AC-4.4 — what "modified after the approving reviews" is measured against, and its behavior under rebase (Phase DOD rebases the branch, rewriting commit timestamps). |
| O-9 | FSPEC | The operator override surface for AC-4.6 and its precedence relative to the recorded approval. |
| O-10 | TSPEC / PROPERTIES | Oracles for AC-1.1 across the fixture matrix: no artifacts, un-suffixed v1 only, contiguous v1..vN, **non-contiguous** (gaps), mixed document types in one directory, mixed roles, and a non-conforming filename. |
| O-11 | TSPEC / PROPERTIES | Oracles for AC-1.4's refusal — how "would overwrite" is detected and asserted without a real overwrite occurring in the test. |
| O-12 | TSPEC / PROPERTIES | Oracles for AC-2.3's refusal and for AC-2.2's two distinct halt reasons, including the `postmortemFailed` path (`orchestrate-dev.js:586-588`) that currently only logs. |
| O-13 | TSPEC / PROPERTIES | Oracles for AC-3.2/AC-3.3 resumption. Simulating a mid-write kill needs a seam; specify it, and specify that an unrecognised fault token must not change production behavior. |
| O-14 | TSPEC / PROPERTIES | Oracles for AC-4.1/AC-4.4 — including the negative case (stale approval ⇒ phase runs), which is the one that protects R-1. |
| O-15 | TSPEC | Which of these behaviors are unit-testable against the injected seams in `pdlc/workflows/__tests__/` and which require a bundle-level assertion; `runtimeBundle.test.js` already asserts freshness and the runtime's structural constraints (AC-5.5). |
| O-16 | FSPEC | Disposition of AC-5.1/AC-5.2 as concrete edits, so the reviewers can verify them without re-deriving the line references. |

## 9. Traceability

| Source | Lands in |
|---|---|
| POSTMORTEM-R (v2.1) R-3 — wrong iteration index, eleven consecutive rounds | H-1 → AC-1.1–AC-1.6 |
| POSTMORTEM-R (v2.1) R-4 — non-terminal exit | H-2 → AC-2.1–AC-2.7 |
| Operator observation, 2026-07-28 Phase F — six stall-killed `pm-author` attempts, ~71 min, ~1.34 M tokens, zero output | H-3 → AC-3.1–AC-3.6 |
| Operator observation, 2026-07-28 — approved REQ v17 would be re-reviewed from round 1 on re-entry | H-4 → AC-4.1–AC-4.6 |
| POSTMORTEM-R (v2.1) R-5 — REQ-scope stopping rule | §preamble stopping rule; D-RLH-02 |
| `docs/_queue/QUEUE.md` §Bootstrapping | C-3 |
