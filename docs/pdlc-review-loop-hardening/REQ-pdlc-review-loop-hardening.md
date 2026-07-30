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
| Queue row | 0 (`in-progress`; was row 8 / `blocked` until the 2026-07-29 reprioritisation — `docs/_queue/QUEUE.md` row `pdlc-review-loop-hardening`) |
| Targets | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`, `pdlc/skills/orchestrate-dev/SKILL.md`, `pdlc/skills/orchestrate-queue/SKILL.md`, the three author SKILLs (`pm-author`, `se-author`, `te-author`) **including their Git Workflow sections**, and the three review SKILLs (`pm-review`, `se-review`, `te-review`) — the latter for the persisted-verdict field required by AC-4.2; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md` (both dispositioned in v1.1 — see §9 Traceability) |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` |
| Citation baseline | All `file:line` references in this document were taken at HEAD **`9220a20`** and re-verified at v1.1. Every citation also names the enclosing symbol and a distinctive literal, so a line drift does not invalidate it (per CROSS-REVIEW-software-engineer-REQ-v1 F-05). |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.1 | 2026-07-29 |

**v1.1 (2026-07-29)** — addresses all High/Medium findings of
`CROSS-REVIEW-software-engineer-REQ-v1.md` (F-01…F-07, plus F-08/F-09) and
`CROSS-REVIEW-test-engineer-REQ-v1.md` (F-01…F-04, plus F-05/F-06), and answers SE Q-01…Q-04 and
TE Q-01…Q-03 in the document. Substantive changes: new **§4a Assumptions** (measured runtime
primitive list, DC-02); AC-3.3/AC-3.5 restated over harness-observable state with the runtime's own
retry counter declared unobservable and deferred (D-RLH-04); AC-3.1 pacing bound quantified with its
measured-floor derivation; AC-4.2 re-based on a **persisted** verdict field, with the review SKILLs
added to `Targets`; dual approval defined as same-round; AC-2.3 / AC-4.1 precedence stated;
AC-5.5 re-pointed from the untracked consumer copy to `pdlc/workflows/dist/`; all citations
re-derived at HEAD `9220a20`.

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

`reviewLoop` derives every `v{N}` suffix from an in-memory counter defaulted in its own parameter
list — `iteration = 1` (`pdlc/workflows/orchestrate-dev.js`, `reviewLoop`, `:538`) — and **no call
site passes `iteration`**, verified at all seven `await reviewLoop({` sites (`:1649, :1675, :1701,
:1742, :1771, :1797, :1913`). The module performs **no directory listing at all** — there is no
`readdirSync` and no glob anywhere in the file — so existing `CROSS-REVIEW-{role}-{doc}-v{N}.md`
files on the branch are invisible to it. The prompts carry the counter verbatim (`reviewerPrompt` /
`optimizerPrompt`, the literals `` `docs/${feature}/CROSS-REVIEW-${role}-{DOC-TYPE}-v${prev}.md` ``
at `:709-710` and `` `…-v${iteration}.md` `` at `:733`); the reviewer SKILL is the party that turns
that number into a filename (`pdlc/skills/se-review/SKILL.md`, §Cross-Review File Format `:143` and
the resume instructions `:69, :72`).

Consequence, observed for **eleven consecutive rounds** on this branch: the harness instructed
reviewers to write `v1`, `v2`, … over a branch that already held `v1`–`v13`. The review record
survived only because the reviewer agents noticed and overrode the instruction — e.g. *"the task
said 'write as v2', but `CROSS-REVIEW-software-engineer-REQ-v1.md` through `-v13.md` already exist
on this branch"*. The harness's correctness currently depends on agent disobedience.

Two further symptoms of the same root: the prompts emit the literal placeholder `{DOC-TYPE}`, never
substituted by the script (the two literals cited above, `:709-710` and `:733`), and the
back-reference to the previous round points at `v${iteration - 1}` — a file that, after a resume, is
not the previous round's file.

### H-2 — the non-convergence exit is not terminal

On hitting the ceiling, `reviewLoop` asks the phase optimizer to write
`docs/{feature}/POSTMORTEM-{phase}-{feature}.md` with six mandated sections — *Phase, Iterations,
Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation* (`reviewLoop`'s
`iteration > 5` branch, the prompt literal `Include the required sections:` at `:567`) — then
returns `{ converged: false, iterations: 5 }` (`:598`), and `checkConverged` halts (the
`throw haltError(` at `:513`). Nothing else happens. Specifically:

- **The queue row is set `halted` but never committed.** `orchestrate-dev.js` does not read or
  write `docs/_queue/QUEUE.md` at all (its single mention is prose inside a DoD prompt). The status
  write lives one layer up in `orchestrate-queue.js` — `runPicked` writes `in-progress` before the
  run (the `updateQueueStatus(queueText, entry.feature, "in-progress")` call at `:733`) and
  `halted` / `awaiting-merge` after it (`:739`, `:749-750`), both through the `rewriteStatus`
  helper (`:771-773`) — and the driver performs **zero git operations**, so the edit is left in the
  working tree. A run invoked as `orchestrate-dev` directly touches no queue row whatsoever.
  *(Corroborated live: at review time the row's own `in-progress` edit was sitting uncommitted in
  the working tree — SE F-09.)*
- **Nothing ever reads a POSTMORTEM at phase entry.** Repo-wide, the only read is the Phase-H
  harvest prompt (the `Read all POSTMORTEM-*.md files` literal at `:819`), which is unreachable on
  a halted run. `reviewLoop`'s sole entry precondition is a non-empty check on the document under
  review (its `_checkFile` gate immediately after the parameter list).
- **A re-entered phase restarts at iteration 1 with a fresh five-round budget**, against the same
  unresolved disagreement that exhausted the previous one, with no operator-visible statement of
  what the last attempt concluded.
- **The halt message asserts `POSTMORTEM written.` unconditionally** (the `haltError` string at
  `:513`) even though the write path sets `postmortemFailed` and merely logs a warning on failure
  (`:572`, `:580`, `:583`, and the `WARNING: POSTMORTEM agent failed` log at `:586-588`).
  `postmortemFailed` is also **not** carried in the `:598` return object, so AC-2.2 requires a
  return-shape change as well as a message change (TE v1 preliminaries).
- **A status write for a feature with no queue row is a silent no-op.** `updateQueueStatus`
  (`orchestrate-queue.js:324`) returns its input `markdown` unchanged when no row matches — the
  `return markdown; // feature row not found` at `:358`. AC-2.6's premise is confirmed.

### H-3 — monolithic document authoring is unsurvivable under the runtime stall watchdog

The workflow runtime kills an agent that emits no progress event for 180,000 ms and retries up to
six times. **This is runtime-side, not configurable from this repo, and not observable from a
workflow script** — see §4a Assumptions A-1/A-2 for the measured basis and the commands that measured
it. It must therefore be treated as an immutable environmental constraint, and the fix must be on
the authoring side.

The author SKILLs today instruct a single terminal write — *"After completing: write all artifacts
to disk, stage, commit"* (`pdlc/skills/pm-author/SKILL.md:29`), and the numbered procedures end at
*"Commit and push"* (`:88`, `:109`, `:121`). A PDLC spec document is routinely 700–1000 lines
(`REQ-pdlc-workflow-distribution.md` is 970 lines / 84,671 bytes), and generating that as one tool
call exceeds the window with no intervening progress event. The failure is **deterministic**, so
the six retries are not merely wasted — they are structurally incapable of succeeding, and the
run's entire budget is spent discovering that.

### H-4 — there is no way to skip a phase whose document is already approved

`main()` has exactly three conditional phase skips: the `decisionsWarranted(...)` guard for Phase D,
and the compile-time flags `PHASE_H_ENABLED` (`:19`), `PHASE_DOD_ENABLED` (`:22`),
`PHASE_PUB_ENABLED` (`:28`). Phase R runs `reviewLoop` unconditionally (the `const rLoop = await
reviewLoop({` at `:1649`); the only gate is an existence check that cannot distinguish an approved
REQ from a draft.

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
  the review artifacts present on the branch for that feature and document type. The next index is
  one greater than the **highest index already present**, or 1 when no review artifact for that
  feature and document type is present. A fresh phase is therefore unchanged in behavior.
- **AC-1.1a** *(v1.1, SE F-03)* The **un-suffixed** form `CROSS-REVIEW-{role}-{doc-type}.md` — which
  the review SKILLs' file-format section permits, `[-v{N}]` being optional — **counts as index 1**
  for AC-1.1's maximum. So a branch holding only the un-suffixed file yields a next index of 2, and
  AC-1.4 does not fire. A branch holding both the un-suffixed file and `-v1.md` is a malformed
  duplicate of index 1: that is an error surfaced to the operator (AC-1.4's class), not a silent
  choice between them.
- **AC-1.2** The index is computed once per round and is the same for every reviewer in that round,
  and for the author prompt that follows it.
- **AC-1.3** Reviewer and author prompts name **concrete file paths** — feature, role and document
  type all substituted. No unsubstituted placeholder (e.g. a literal `{DOC-TYPE}`) reaches an
  agent's prompt.
- **AC-1.4** No existing `CROSS-REVIEW-*` file is overwritten. *(v1.1, TE F-05 — enforcement party
  named.)* The **script** is the enforcing party: before each reviewer dispatch it checks, by
  deterministic file inspection and without a model call (C-5), whether the path it is about to
  instruct already exists; if it does, that is a pipeline-level error surfaced to the operator, not
  a silent overwrite and not a silent skip. The corresponding agent instruction is retained as
  belt-and-braces only; prompt text alone does **not** satisfy this AC, because that is exactly
  H-1's root cause one level down.
- **AC-1.5** When a round's index is greater than 1, the back-reference to the previous round names
  the file that actually holds the previous round's review for that role and document type.
- **AC-1.6** The five-round budget is counted from the round the *current invocation* starts at, and
  both the starting index and the budget are stated in the run log at phase entry. *(v1.1, SE F-08 /
  TE F-06 — the two reporting surfaces and the H-2 reconciliation, made explicit:)*
  - **AC-1.6a** The named constant of AC-5.1 carries **one** meaning: the per-invocation round
    *budget* (a count, default 5). The loop's terminal condition is therefore expressed relative to
    the invocation's starting index, not against the absolute index — a resumed loop starting at
    index 14 must not trip the cap on entry.
  - **AC-1.6b** Every artifact that reports round counts reports the *actual* numbers for the
    invocation: the POSTMORTEM's mandated `Iterations` section names the starting index, the
    terminal index and the budget, rather than the literal `5` it emits today; the halt reason and
    the final report do the same.
  - **AC-1.6c** H-2 lists "a re-entered phase restarts at iteration 1 with a fresh five-round
    budget" as a defect; AC-1.6 grants a fresh budget under corrected numbering. These are
    consistent: the defect was the *silent* fresh budget against an unresolved disagreement, and
    AC-2.3 now refuses re-entry precisely when a POSTMORTEM records that disagreement. A phase
    halted for any other cause does get a fresh budget, stated in the log at entry (AC-1.6).

### AC-2 — Terminal, legible non-convergence (H-2)

- **AC-2.1** When a phase writes a POSTMORTEM, the feature's queue row is set `halted` **and that
  change is committed** in the same operation, so the halt survives the process. This holds whether
  the pipeline was entered via `orchestrate-queue` or invoked directly on a REQ path.
- **AC-2.2** If the POSTMORTEM artifact was not in fact written, the halt does not claim it was; the
  operator-facing reason distinguishes "non-convergence, post-mortem written at `{path}`" from
  "non-convergence, post-mortem write failed".
- **AC-2.3** At phase entry, the pipeline checks for an unresolved POSTMORTEM for that phase and
  feature on the branch. If one exists **and the phase would otherwise run**, the phase is
  **refused** — the pipeline halts with the POSTMORTEM's *Recommendation* section reproduced in the
  operator-facing report, rather than re-entering the loop.
- **AC-2.3a** *(v1.1, SE F-04 / TE Q-02 — scope of the refusal.)* The refusal is keyed on the pair
  **(phase, feature)**. An unresolved `POSTMORTEM-R-{feature}.md` refuses re-entry to Phase R only;
  it does not refuse Phase F, T, P or any later phase. Rationale: what gates a downstream phase is
  the *approval state of its upstream document* (AC-4 and the existing per-phase document gate), not
  the history of how that approval was reached; making an R-postmortem block every later phase would
  convert R-2's deadlock risk from a recoverable state into a total stop. The trade-off is accepted
  and recorded as R-6.
- **AC-2.3b** *(v1.1, SE F-04 — precedence against AC-4.1, the motivating case.)* AC-4.1's
  approved-phase skip is evaluated **first**. When a phase is skipped under AC-4, it does not run, so
  AC-2.3 has nothing to refuse and the run proceeds. The skip report must nevertheless name any
  unresolved POSTMORTEM for that (phase, feature), so it stays operator-visible; the skip does
  **not** resolve it (AC-2.4 is unchanged — nothing in the pipeline resolves a POSTMORTEM on its own
  behalf). Worked example, which is the next real operational use: `pdlc-workflow-distribution` holds
  both `POSTMORTEM-R-pdlc-workflow-distribution.md` and a dual-approved REQ v17 ⇒ **Phase R is
  skipped, the run continues to Phase F, and the report names both the approval and the still-open
  POSTMORTEM.** When approval is absent or stale (AC-4.4), the phase would run and AC-2.3 refuses.
- **AC-2.4** A POSTMORTEM is marked resolved by an explicit, operator-visible act recorded in the
  artifact itself. Once resolved, the phase may be re-entered normally. Nothing in the pipeline
  resolves a POSTMORTEM on its own behalf.
- **AC-2.5** The halt report identifies the phase and the POSTMORTEM path as structured fields, not
  only inside a free-text reason string.
- **AC-2.6** Attempting to write a queue status for a feature that has no matching queue row is an
  error surfaced to the operator, not a silent no-op (today it is: §H-2, `updateQueueStatus`
  `orchestrate-queue.js:358`).
- **AC-2.6a** *(v1.1, SE Q-02 — the direct-invocation path.)* A pipeline invoked directly on a REQ
  path for a feature with **no** queue row does not attempt a status write at all, so AC-2.6 does not
  fire: the run proceeds normally, and any halt reports the structured field `queueRow: "none"`
  alongside its halt reason, meaning "halt not recorded in a queue". AC-2.6's error is reserved for
  the case where a write was *attempted* against an absent row — i.e. a row was expected. A direct
  invocation is therefore never a double failure.
- **AC-2.7** The documented status lifecycle states how a `halted` row is recovered — what a human
  must do, and what the pipeline will refuse until they do it.

### AC-3 — Resumable, incremental document authoring (H-3)

- **AC-3.1** An authoring agent producing a specification document (REQ, FSPEC, TSPEC, PLAN,
  PROPERTIES, DECISIONS) writes it incrementally: a skeleton (all top-level section headings, no
  prose) in the first write, then one top-level section per subsequent write. **No single write or
  edit call may author more than `MAX_AUTHORING_WRITE_BYTES` of document content** (see the
  threshold declaration below); a section larger than the budget is split across successive calls at
  sub-heading boundaries. *(v1.1, TE F-03 — the bound replaces "well inside" and "expected to".)*

  **Threshold declaration — `MAX_AUTHORING_WRITE_BYTES`**

  | Field | Value |
  |---|---|
  | Name | `MAX_AUTHORING_WRITE_BYTES` (equivalently ≈150 lines, whichever is hit first) |
  | Default | **12,000 bytes** per single Write/Edit call |
  | Owner | pdlc plugin maintainer; declared in the authoring-pacing section of each of the three author SKILLs, and asserted by the dispatch-and-verify wrapper's review checklist |
  | Derivation (measured floor, at HEAD `9220a20`) | Smallest **observed failing** single write: `REQ-pdlc-workflow-distribution.md`, 970 lines / **84,671 bytes**, killed 6/6 times (§H-3). Largest **observed surviving** single writes on this branch: `CROSS-REVIEW-test-engineer-REQ-v1.md` **12,767 bytes** / 88 lines and `CROSS-REVIEW-software-engineer-REQ-v1.md` **11,933 bytes** / 48 lines, neither of which ever stalled (`wc -lc` on all three). The default sits at the smaller of the two surviving witnesses, rounded down — **7.1× below the failing floor and at 0.94× the largest never-stalled write** — so it is inside the demonstrated-safe band rather than interpolated into the untested gap. It is deliberately conservative: this REQ itself (25,920 bytes) survived as a larger artifact, but not demonstrably as a single call, so it is not used as a witness. |
  | Revision rule | Raising the default requires a new surviving-write measurement at the higher value; it is not raised by argument. |

- **AC-3.2** Partial progress is durable. A document killed mid-authoring leaves the sections
  written so far on disk **and committed**, not an empty file and not a truncated one that reads as
  complete.
- **AC-3.2a** *(v1.1, SE Q-03 / TE Q-03 — commit cadence is part of the contract.)* The cadence is
  **one commit per section write**. A single commit at the end of an attempt does not satisfy
  AC-3.2, because it is exactly the state a stall-kill destroys. This makes the author SKILLs' Git
  Workflow sections part of `Targets` (they currently say "After completing: write all artifacts to
  disk, stage, commit" — `pdlc/skills/pm-author/SKILL.md:29`). Section-granular commits on a feature
  branch are accepted as the cost; they are squash-invariant and Phase DOD's rebase is unaffected
  because it rebases the branch, not individual commits' content.
- **AC-3.3** A retried authoring attempt **resumes**: it continues from the first unwritten section
  rather than restarting from an empty file. *(v1.1, SE F-02 / TE F-02 — restated over
  script-observable state.)* "Retry" is determined **from artifact state on disk before dispatch**,
  never from a runtime attempt counter (§4a A-2, A-3): if a partial document for this phase exists
  and is not structurally complete (AC-3.4), the dispatch is a resume and carries the
  resume-flavoured prompt naming the first unwritten section; otherwise it is a first attempt. This
  holds whether the runtime replayed the previous attempt opaquely or the script re-dispatched it
  (A-3), because in both cases the on-disk state is the same.
- **AC-3.4** A document is only treated as complete when it is structurally complete — the presence
  of a non-empty file is not sufficient evidence that authoring finished.
- **AC-3.5** *(v1.1, restated for SE F-02 / TE F-02 — the counted quantity is script-owned.)* An
  authoring dispatch is wrapped by the script in a **dispatch-and-verify** step: after the dispatch
  returns, the script re-checks the artifact's structural completeness (AC-3.4). If completeness did
  not advance — no new section since the previous check — the script counts that as one failed
  *script-owned* attempt and re-dispatches with the resume prompt, up to a named budget. When that
  budget is exhausted the operator-facing report reads "no progress across N attempts", naming the
  phase, the artifact, and **N as the script's own attempt count**. The runtime's internal
  retry count is explicitly **not** claimed, reported, or depended upon (§4a A-2/A-3); observing it
  is deferred as **D-RLH-04**. The threshold below is declared per this REQ's threshold obligation.

  | Field | Value |
  |---|---|
  | Name | `MAX_AUTHORING_ATTEMPTS` (script-owned dispatch-and-verify attempts, distinct from the runtime's own retries) |
  | Default | **3** |
  | Owner | pdlc plugin maintainer; a named constant in `pdlc/workflows/orchestrate-dev.js`, following the `DOD_MAX_ITERATIONS` convention (`:25`) |
  | Rationale | Each attempt after the first begins from committed partial progress (AC-3.2), so attempts are cumulative rather than repetitive; 3 bounds the cost of a genuinely stuck artifact at ≈1 phase's budget instead of the ~71 min / ~1.34 M tokens of §H-3. |

- **AC-3.6** Applies uniformly to `pm-author`, `se-author` and `te-author`. A review or remediation
  agent editing an existing document is bound by the **same** `MAX_AUTHORING_WRITE_BYTES` budget per
  call — *(v1.1, TE F-03: "comparable size" is replaced by the one numeric bound; there is no second,
  looser threshold for edits.)* An edit that would exceed the budget is split at sub-heading
  boundaries, exactly as in AC-3.1.

### AC-4 — Approved-phase skip (H-4)

- **AC-4.1** A phase whose document already carries dual reviewer approval on the branch is skipped
  on re-entry, with a logged reason naming the document, the approving reviews and the round at
  which approval was reached.
- **AC-4.1a** *(v1.1, TE F-04 — dual approval is defined over rounds.)* "Dual reviewer approval"
  means **both reviewers approving in the same round index**, matching the existing convergence gate
  (`isPass(verdict1) && isPass(verdict2)` evaluated within one iteration,
  `orchestrate-dev.js:644`). Approving verdicts drawn from *different* rounds do **not** constitute
  approval: on the routine state "round N = SE approved / TE needs revision; round N+1 = TE approved
  / SE finds more", the phase **runs**. The logged round of AC-4.1 is that single approving round.
- **AC-4.2** *(v1.1, restated for TE F-01 / SE F-07 — the input is made to exist.)* Approval is
  established from a **persisted, machine-readable verdict field carried in the cross-review artifact
  itself** — not from the agent response (which is not durable, §4a A-4), and not from a hand-edited
  status field. This REQ therefore claims the scope of adding that field to the three review SKILLs'
  output contract: the `VERDICT:` value plus its finding-count JSON becomes a **required** part of the
  written cross-review file, drawn from the same closed catalogue the response trailer already uses.
  `Targets` is extended to `pm-review`, `se-review`, `te-review` accordingly *(answers TE Q-01: yes,
  the review SKILLs are in scope)*.
- **AC-4.2a** *(v1.1)* **Fail closed.** If the verdict field is absent, duplicated, or does not parse
  as exactly one catalogue value, the phase is **not** skipped — it runs — and the report names the
  artifact whose verdict could not be read. Legacy artifacts written before this change therefore
  cause extra review, never a skipped review (DC-07, R-1).
- **AC-4.3** Both approving verdict forms count: *Approved* and *Approved with minor changes*. This
  matches the existing convergence gate; the skip must not be stricter than the gate that produced
  the approval, nor looser — the catalogue is closed to exactly the three values the review SKILLs
  emit (`Approved`, `Approved with minor changes`, `Needs revision`).
- **AC-4.4** If the document has been modified after the approving reviews, the phase is **not**
  skipped — the skip must not launder an unreviewed edit.
- **AC-4.5** The skip is observable in the final report: skipped phases are listed with their reason
  and are visibly distinct from phases that ran and from phases that failed.
- **AC-4.6** An operator can force a phase to run despite recorded approval.
- **AC-4.7** *(v1.1, SE Q-04 — which phases the skip applies to.)* The skip applies **only** to
  phases whose convergence is established by a reviewer-pair cross-review artifact for a named
  document: R, F, T, P and D. Phase CR (final codebase review) and Phase DOD are **out of scope** for
  AC-4 — they review the tree rather than a document, produce no
  `CROSS-REVIEW-{role}-{doc-type}` pair in AC-1.1's sense, and are cheap relative to the risk of
  skipping a verification phase. They continue to run unconditionally, subject to their existing
  flags.

### AC-5 — Consistency of the harness itself

- **AC-5.1** The iteration cap, currently the bare literal `5` repeated at five sites in
  `orchestrate-dev.js` — `checkConverged`'s `recordPhase(… "Non-convergence after 5 iterations" …, 5)`
  (`:511`) and its `haltError("… did not converge after 5 iterations …")` (`:513`); `reviewLoop`'s
  gate `if (iteration > 5)` (`:562`), its prompt literal `Iterations (5 — limit reached)` (`:567`),
  and its return `{ converged: false, iterations: 5 }` (`:598`) — becomes a single named constant,
  matching the convention already set by `DOD_MAX_ITERATIONS` (`:25`). Per AC-1.6a that constant is
  the per-invocation **budget**; the gate and the reported counts are derived from it and the
  starting index, not from the constant alone.
- **AC-5.2** The dead POSTMORTEM path template in `checkConverged` — the
  `` const postmortemPath = `docs/{feature}/POSTMORTEM-${phaseId}-{feature}.md` `` at `:509`, which
  carries literal, uninterpolated `{feature}` braces and is never read — is removed or made correct;
  no un-substituted template reaches a report.
- **AC-5.3** `pdlc/skills/orchestrate-dev/SKILL.md` documents the review-loop iteration cap, the
  non-convergence exit, the POSTMORTEM's mandated sections and the approved-phase skip. Today its
  only POSTMORTEM mention is the naming-convention aside in §Artifacts (the "CROSS-REVIEW-\*,
  POSTMORTEM-\*" list, `:83`) and the only documented cap is the unrelated DoD one.
- **AC-5.4** `pdlc/skills/orchestrate-queue/SKILL.md` documents the `halted` recovery procedure. Its
  §Status lifecycle diagram (the `└──pipeline halts / throws──▶ halted` branch, `:111`) currently
  shows `halted` as a terminal leaf with no way out.
- **AC-5.5** *(v1.1, restated for SE F-01 — the artifact tier is corrected.)* The **tracked** generated
  artifacts under `pdlc/workflows/dist/` are rebuilt and committed in the same commit as any change
  to their sources, and `node pdlc/workflows/build-runtime.mjs --check` passes. The consumer copy
  under `.claude/workflows/` is **untracked by decision** (DEC-DIST-02, §4a A-6) and is never
  committed; its correctness is asserted separately by `pdlc/hooks/scripts/sync-workflows.sh --check`
  exiting 0. The prior wording required committing an untracked-by-decision path and would have
  landed a `.gitignore` regression.

## 4. Constraints

- **C-1 — The stall watchdog is not ours, and is not observable.** The 180,000 ms no-progress kill
  and the six-attempt retry are properties of the Claude Code workflow runtime. No requirement here
  may be satisfied by changing, extending or disabling them, **and none may be defined over reading
  them** (§4a A-2/A-3). Every AC-3 obligation is an authoring-side accommodation or a script-owned
  wrapper: AC-3.1/3.2/3.6 pace and persist the writing, AC-3.3 derives retry-ness from disk state,
  and AC-3.5 counts the script's own dispatch-and-verify attempts. *(v1.1 — this closes the gap SE
  F-02 / TE F-02 identified, where AC-3.3 and AC-3.5 presupposed a signal C-1 declares out of
  reach.)*
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

## 4a. Assumptions (measured — DC-02)

Every predicate below was measured against this tree at HEAD `9220a20`, with the measuring command
recorded. None is inferred from naming or documentation. Added at v1.1 for SE F-02 / TE F-02.

| # | Assumption | How it was measured | Consequence |
|---|---|---|---|
| A-1 | **The workflow runtime exposes exactly eleven host globals**: `agent`, `parallel`, `pipeline`, `phase`, `log`, `workflow`, `args`, `budget`, `console`, `setTimeout`, `clearTimeout`. There is no `fs`, no `process`, no `import`/`import()`, no `fetch`. | The probe of 2026-07-27 recorded in `pdlc/workflows/runtime-adapter.js` header comment (`:13-16`, "probed 2026-07-27 … the only host globals are"). Re-read at HEAD `9220a20`. | Any file inspection AC-1.1, AC-2.3, AC-3.4 and AC-4.2 need must come through an injected seam implemented as an `agent()` call (C-2). |
| A-2 | **None of those globals conveys stall/retry state.** The runtime's 180,000 ms no-progress kill and its six-attempt retry are not readable, settable or countable from a workflow script, and no constant naming them exists in this repo. | `grep -rnE "180000\|no.progress\|\bstall\b\|attemptCount\|maxAttempts" pdlc/ .claude/` → no match in any workflow source (the only `attempt` hits are unrelated: `orchestrate-dev.js:314`'s trailer-recovery comment, `orchestrate-queue.js:364`, and drift tests). Cross-checked against A-1's global list. | AC-3.3 and AC-3.5 may **not** be defined over the runtime's attempt counter. They are defined over script-observable state instead (artifact state on disk, and a script-owned dispatch-and-verify attempt count). Runtime-attempt observability is deferred as **D-RLH-04**. |
| A-3 | **It is not established whether the runtime's retry re-enters the workflow script** or replays the `agent()` call opaquely beneath it. The 2026-07-28 transcript is consistent with either (six attempts, each opening with a fresh preamble). | Transcript inspection only; A-1's global list offers no primitive that would tell a script apart. No measurement in this repo can settle it, so it is recorded as unknown rather than assumed. *(Answers SE Q-01: it is not a design choice, and this REQ does not depend on the answer.)* | Every AC-3 obligation is written to hold under **both** readings. Nothing in AC-3 requires code to run between two runtime attempts. |
| A-4 | **The machine-readable verdict is a response contract, not an artifact field.** All three review SKILLs place the `VERDICT:` + JSON trailer in the agent's *response* ("append the following two lines as the last content of your response", `pdlc/skills/se-review/SKILL.md:199`), and `reviewLoop` parses it off the `_agent()` return value via `parseVerdict` (`orchestrate-dev.js:322`, used at `:594-595`, `:624`, `:633`) — never off disk. The cross-review *file* template ends at a free-text `## Recommendation` (`se-review/SKILL.md:143` ff.). | Read both SKILLs and `parseVerdict`; then checked this branch's own artifacts: `CROSS-REVIEW-software-engineer-REQ-v1.md` happens to carry the trailer, `CROSS-REVIEW-test-engineer-REQ-v1.md` does **not**. One of two — the field is not reliably persisted today. | AC-4.2 cannot read approval off today's artifacts. This REQ therefore takes the scope of making the verdict a persisted, closed-catalogue field (see `Targets`, AC-4.2, O-17). |
| A-5 | **A pure, root-parameterised file-listing oracle already exists in this repo**, but only on the jest side: `pdlc/workflows/lib/document-oracles.mjs` (`listAllFiles(root)` at `:81`, skipping `.git`/`node_modules` via `WALK_SKIP_DIRS` at `:77`). Being `.mjs` and using `fs`, it is unreachable from a runtime bundle. | Read the module; cross-checked against A-1. | The runtime needs its own injected listing seam regardless (C-2), so O-1 must dispose of reuse-vs-duplicate explicitly and pin one shared error contract (DC-04, DC-11). |
| A-6 | **The tracked generated tier is `pdlc/workflows/dist/`; `.claude/workflows/` is untracked by decision.** | `DEC-DIST-02` (`docs/_decisions/DECISIONS-plugin-distribution.md`, three-tier table: source `pdlc/workflows/*.js` tracked; built `pdlc/workflows/dist/` tracked, never hand-edited; consumer `.claude/workflows/` **not** tracked, never hand-edited) plus CLAUDE.md §"Workflow scripts and the runtime build". | AC-5.5 is stated against `dist/` and `sync-workflows.sh --check`, never against the consumer copy (SE F-01). |

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
| D-RLH-03 | Progress heartbeats emitted from within a long agent turn. | Would address H-3 at its root rather than by pacing, but depends on runtime capabilities this repo does not control (C-1). | New queue row `pdlc-runtime-progress-signals`, drafted when the runtime exposes a heartbeat or attempt-metadata primitive; tracked with D-RLH-04 as one row. |
| D-RLH-04 *(v1.1, SE F-02 / TE F-02)* | Observing the **runtime's own** stall-kill and retry count from a workflow script — i.e. reporting "the runtime retried this dispatch k times" rather than the script-owned count of AC-3.5. | §4a A-2 measured that no such primitive exists among the eleven host globals, and A-3 records that even re-entrancy is unestablished. AC-3.5's script-owned count delivers the operator-visible outcome without it. | Same successor row as D-RLH-03 (`pdlc-runtime-progress-signals`), since both unblock on the same runtime capability; if the runtime exposes attempt metadata first, that row lands D-RLH-04 alone. |

## 7. Risks

| # | Risk | Response |
|---|---|---|
| R-1 | **The skip laundering an unreviewed edit** — AC-4 skipping a phase whose document changed after approval. | AC-4.4 makes staleness a first-class condition; AC-4.6 gives the operator an override in the direction of *more* review. |
| R-2 | **AC-2.3's refusal deadlocking the operator** — an unresolved POSTMORTEM blocking every re-entry with an unclear escape. | AC-2.4 and AC-2.7 require the resolution act and its documentation to ship together with the refusal. |
| R-3 | **Incremental authoring degrading document coherence** — section-at-a-time writing producing a document that does not hang together. | AC-3.1 mandates a skeleton first, so the structure is decided before the prose. AC-3.4 keeps a partial document from being mistaken for a finished one. |
| R-4 | **Bootstrapping** — a defect in this change disables the pipeline that would fix it. | C-3; plus `cd pdlc/workflows && npm test` is a real, local gate that runs without the pipeline. |
| R-5 | **This REQ hitting the very loop it fixes.** | The §preamble stopping rule, and the escalation clause within it. |
| R-6 *(v1.1, SE F-04)* | **Per-phase refusal scope letting stale upstream trouble through** — AC-2.3a means an unresolved `POSTMORTEM-R` does not block Phase F, so a feature can progress downstream while an R-phase disagreement is still formally open. | Accepted deliberately: what gates Phase F is the REQ's approval state (AC-4, AC-4.2a fails closed), and the alternative — a feature-wide refusal — converts R-2's deadlock from recoverable to total. AC-2.3b keeps the open POSTMORTEM named in every skip report, so it never becomes invisible. |
| R-7 *(v1.1, TE F-01)* | **Widening scope to the review SKILLs** — AC-4.2 changes the output contract of `pm-review` / `se-review` / `te-review`, three files this REQ did not originally target. | The change is additive (the verdict field is written into the artifact in addition to the response trailer the workflow already parses), so the existing `parseVerdict` path is untouched and C-4 holds. AC-4.2a fails closed on every artifact predating the change, so no legacy branch silently skips a phase. |

## 8. Downstream specification obligations

Binding entry input for FSPEC/TSPEC/PROPERTIES. The authoring agent must dispose of every row; the
reviewers of that document must verify the disposition. These are **not** REQ revisions — a review
finding that one of these is unspecified here is answered by this table.

| # | Lands in | Obligation |
|---|---|---|
| O-1 | FSPEC | The mechanism for discovering review artifacts on the branch (AC-1.1, AC-4.2). `orchestrate-dev.js` has no directory-listing capability today; specify the injected seam, its adapter implementation, and its behavior when the feature directory does not exist. **(v1.1, SE F-06)** The FSPEC must additionally *dispose of the existing precedent*: `pdlc/workflows/lib/document-oracles.mjs` already ships a pure, root-parameterised walker (`listAllFiles(root)`, `WALK_SKIP_DIRS`, §4a A-5) of exactly the shape DC-04 mandates, but is `.mjs`/`fs`-based and unreachable from a bundle (C-2). State either that it is reused/extended or why the runtime seam must be separate — and **pin one shared "cannot judge" error contract across both**, so the two listing paths cannot diverge (DC-11). Two independent implementations with different error contracts are a rejected outcome, not an implementation detail. |
| O-2 | FSPEC | The filename grammar for `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md`, including the un-suffixed first-round form (which AC-1.1a now fixes as index 1), the role slugs (the `reviewerSlug` mapping in `orchestrate-dev.js`, the `CROSS-REVIEW-{role}-{DOC-TYPE}[-v{N}].md` comment block at `:675`), and the document-type token — enough to parse `N` unambiguously and to reject a non-conforming name. |
| O-3 | FSPEC | How "unresolved POSTMORTEM" is represented (AC-2.3, AC-2.4) — the marker's location and grammar, and how the *Recommendation* section is extracted for the report. |
| O-4 | FSPEC | The queue-status commit (AC-2.1): who performs the git operation given that neither orchestrator does any git today, what the message is, and the behavior when the working tree is dirty or the commit fails. |
| O-5 | FSPEC | The direct-invocation path for AC-2.1 — `orchestrate-dev` does not know about the queue at all; specify how it locates the row, and what it does when the feature has no row. |
| O-6 | FSPEC | The retry-aware prompt contract (AC-3.3): how an author agent is told it is a retry, and how it determines the first unwritten section. |
| O-7 | FSPEC | The structural-completeness criterion for each document type (AC-3.4). |
| O-8 | FSPEC | The staleness comparison for AC-4.4 — what "modified after the approving reviews" is measured against, and its behavior under rebase (Phase DOD rebases the branch, rewriting commit timestamps). |
| O-9 | FSPEC | The operator override surface for AC-4.6 and its precedence relative to the recorded approval. |
| O-10 | TSPEC / PROPERTIES | Oracles for AC-1.1 across the fixture matrix: no artifacts, un-suffixed v1 only, contiguous v1..vN, **non-contiguous** (gaps), mixed document types in one directory, mixed roles, and a non-conforming filename. |
| O-11 | TSPEC / PROPERTIES | Oracles for AC-1.4's refusal — how "would overwrite" is detected and asserted without a real overwrite occurring in the test. |
| O-12 | TSPEC / PROPERTIES | Oracles for AC-2.3's refusal and for AC-2.2's two distinct halt reasons, including the `postmortemFailed` path (`orchestrate-dev.js:586-588`) that currently only logs and is not carried in the `:598` return object — so the return shape changes too. Add the AC-2.3b precedence case (approved **and** unresolved POSTMORTEM ⇒ skip, POSTMORTEM still named) and the AC-2.3a scope case (R-postmortem does not refuse Phase F). |
| O-13 | TSPEC / PROPERTIES | Oracles for AC-3.2/AC-3.3 resumption. Simulating a mid-write kill needs a seam; specify it, and specify that an unrecognised fault token must not change production behavior. |
| O-14 | TSPEC / PROPERTIES | Oracles for AC-4.1/AC-4.4 — including the negative case (stale approval ⇒ phase runs), which is the one that protects R-1. |
| O-15 | TSPEC | Which of these behaviors are unit-testable against the injected seams in `pdlc/workflows/__tests__/` and which require a bundle-level assertion; `runtimeBundle.test.js` already asserts freshness and the runtime's structural constraints (AC-5.5). |
| O-16 | FSPEC | Disposition of AC-5.1/AC-5.2 as concrete edits, so the reviewers can verify them without re-deriving the line references. **(v1.1, SE F-05)** The FSPEC cites by **enclosing symbol + distinctive literal**, and records the HEAD sha its references were taken at, exactly as this REQ's `Citation baseline` row now does. A bare `file:line` citation is a defect in that document. |
| O-17 *(v1.1, TE F-01 / SE F-07)* | FSPEC | The **persisted-verdict grammar** required by AC-4.2: where in the cross-review file the verdict field lives, its exact syntax, the closed catalogue of values, how the three review SKILLs are amended to emit it, and how it is extracted. Must specify the fail-closed behavior of AC-4.2a for absent / duplicated / unparseable fields, and the treatment of legacy artifacts that predate the field. |
| O-18 *(v1.1, TE F-04)* | FSPEC | How the "same round index" of AC-4.1a is established from artifacts — pairing each role's file for a round and requiring both to be approving — including the case where one role's file for that round is missing. |
| O-19 *(v1.1, AC-3.1/AC-3.5)* | FSPEC / TSPEC | Where `MAX_AUTHORING_WRITE_BYTES` and `MAX_AUTHORING_ATTEMPTS` live (SKILL prose vs. workflow constant), how the pacing bound is checked in review, and the oracle for AC-3.5's "no progress across N attempts" against the script-owned counter — never against a runtime counter (§4a A-2). |
| O-20 *(v1.1, AC-3.2a)* | FSPEC | The per-section commit contract: the message form, staging scope, and the behavior when a commit fails mid-document (which must not leave the artifact looking structurally complete, AC-3.4). |

## 9. Traceability

| Source | Lands in |
|---|---|
| POSTMORTEM-R (v2.1) R-3 — wrong iteration index, eleven consecutive rounds | H-1 → AC-1.1–AC-1.6 |
| POSTMORTEM-R (v2.1) R-4 — non-terminal exit | H-2 → AC-2.1–AC-2.7 |
| Operator observation, 2026-07-28 Phase F — six stall-killed `pm-author` attempts, ~71 min, ~1.34 M tokens, zero output | H-3 → AC-3.1–AC-3.6 |
| Operator observation, 2026-07-28 — approved REQ v17 would be re-reviewed from round 1 on re-entry | H-4 → AC-4.1–AC-4.6 |
| POSTMORTEM-R (v2.1) R-5 — REQ-scope stopping rule | §preamble stopping rule; D-RLH-02 |
| `docs/_queue/QUEUE.md` §Bootstrapping | C-3 |
| CROSS-REVIEW-software-engineer-REQ-v1 F-01 (wrong artifact tier) | AC-5.5, §4a A-6 |
| CROSS-REVIEW-software-engineer-REQ-v1 F-02 + test-engineer-REQ-v1 F-02 (unobtainable retry signal) | §4a A-1/A-2/A-3, C-1, AC-3.3, AC-3.5, D-RLH-04 |
| CROSS-REVIEW-software-engineer-REQ-v1 F-03 (un-suffixed v1) | AC-1.1, AC-1.1a |
| CROSS-REVIEW-software-engineer-REQ-v1 F-04 (refuse vs skip precedence) | AC-2.3, AC-2.3a, AC-2.3b, R-6 |
| CROSS-REVIEW-software-engineer-REQ-v1 F-05 (drifted citations) | `Citation baseline` header row, §H-1–§H-4, AC-5.1–AC-5.4, O-16 |
| CROSS-REVIEW-software-engineer-REQ-v1 F-06 (existing listing oracle) | §4a A-5, O-1 |
| CROSS-REVIEW-software-engineer-REQ-v1 F-07 + test-engineer-REQ-v1 F-01 (verdict not persisted) | §4a A-4, `Targets`, AC-4.2, AC-4.2a, O-17, R-7 |
| CROSS-REVIEW-software-engineer-REQ-v1 F-08 + test-engineer-REQ-v1 F-06 (constant semantics) | AC-1.6a, AC-1.6b, AC-1.6c, AC-5.1 |
| CROSS-REVIEW-software-engineer-REQ-v1 F-09 (header vs HEAD) | Header `Queue row` row |
| CROSS-REVIEW-test-engineer-REQ-v1 F-03 (unquantified pacing) | AC-3.1 threshold declaration, AC-3.6, O-19 |
| CROSS-REVIEW-test-engineer-REQ-v1 F-04 (dual approval over rounds) | AC-4.1a, O-18 |
| CROSS-REVIEW-test-engineer-REQ-v1 F-05 (who enforces no-overwrite) | AC-1.4 |
| SE Q-02 / Q-03 / Q-04, TE Q-01 / Q-02 / Q-03 | AC-2.6a, AC-3.2a + O-20, AC-4.7, AC-4.2 (`Targets`), AC-2.3a, AC-3.2a |
