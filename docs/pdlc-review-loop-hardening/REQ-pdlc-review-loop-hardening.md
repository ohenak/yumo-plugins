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
| Targets | `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`, `pdlc/skills/orchestrate-dev/SKILL.md`, `pdlc/skills/orchestrate-queue/SKILL.md`, the three author SKILLs (`pm-author`, `se-author`, `te-author`) **including their Git Workflow sections**, the three review SKILLs (`pm-review`, `se-review`, `te-review`) — the latter for the persisted-verdict field required by AC-4.2 — and `pdlc/skills/harvest-learnings/SKILL.md`, for the harvest-surviving approval record required by AC-4.2b *(v1.2, SE-v2 F-01)*; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v{1,2,3}.md`, `CROSS-REVIEW-test-engineer-REQ-v{1,2,3}.md` (all dispositioned — v1 in v1.1, v2 in v1.2, v3 in v1.3; see §9 Traceability) |
| LEARNINGS | `docs/pdlc-review-loop-hardening/LEARNINGS-pdlc-review-loop-hardening.md` |
| Citation baseline | All `file:line` references in this document were taken at HEAD **`9220a20`** and re-verified at v1.1 and v1.2. In §H-1–§H-4, §4a and AC-5 — the sections a maintainer edits from — every citation also names the enclosing symbol and a distinctive literal, so a line drift does not invalidate it (per CROSS-REVIEW-software-engineer-REQ-v1 F-05). Elsewhere, short in-line references may give `file:line` alone; they were verified at the same HEAD but are not drift-proof. *(v1.2, SE-v2 F-05 — the earlier blanket "every citation" claim was not met by the document that made it; O-16's stricter bar continues to bind the FSPEC.)* |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.3 | 2026-07-29 |

**v1.3 (2026-07-29)** — addresses all High/Medium findings of
`CROSS-REVIEW-test-engineer-REQ-v3.md` (F-01 High; F-02, F-03 Medium; F-04, F-05 Low) and
`CROSS-REVIEW-software-engineer-REQ-v3.md` (F-01–F-03 Medium; F-04, F-05 Low), and answers SE-v3
Q-01/Q-02 and TE-v3 Q-01/Q-02 in the document. Substantive changes: **AC-3.5** now states its own
**scope** — which dispatches the dispatch-and-verify wrapper wraps — and AC-3.5a splits the progress
predicate into a **greenfield** limb (strict increase in AC-3.4-satisfying sections, or creation of
the skeleton) and a **revision** limb (byte-level mutation of the artifact since the pre-dispatch
measurement), so an edit-shaped dispatch on an already-complete document can score progress at all
(TE-v3 F-01); `MAX_AUTHORING_DISPATCHES` is **re-scoped to one dispatch-and-verify episode** and
shown consistent with AC-1.6's round budget, its reset scope stated, and its per-dispatch arithmetic
corrected (TE-v3 F-02, SE-v3 F-03/F-04); new **AC-3.5f** classifies budget exhaustion as a halt that
writes **no** POSTMORTEM, so re-invocation resumes from committed progress; new **§4a A-9** records
AC-3.1/AC-3.1a as agent-directed and script-unverifiable, with the per-section commit diff named as
the one observable proxy and AC-3.5's counters as the compensating measurable control (TE-v3 F-03);
AC-3.5b gains its success and continuation conditions (TE-v3 F-04); AC-3.1a corrects a
replace-shaped edit's emitted bytes to *match + replacement* (SE-v3 F-05); **AC-4.2b's approval
record gains a temporal anchor** (approval-time content hash of the reviewed document, plus the
approving commit sha) so AC-4.4 is evaluable from tier 2 (SE-v3 F-01); AC-2.3b worked example B
names AC-2.4 as its **sole** route, removing the contradiction with AC-4.6a (SE-v3 F-02).

**v1.2 (2026-07-29)** — addresses all High/Medium findings of
`CROSS-REVIEW-software-engineer-REQ-v2.md` (F-01 High; F-02, F-03 Medium; F-04–F-06 Low) and
`CROSS-REVIEW-test-engineer-REQ-v2.md` (F-01–F-03 Medium; F-04, F-05 Low), and answers SE-v2
Q-01…Q-03 and TE-v2 Q-01…Q-02 in the document. Substantive changes: **AC-4.2b** adds a
harvest-surviving carrier of approval (Phase H deletes every `CROSS-REVIEW-*`, so AC-4's evidence
source did not survive its own pipeline — SE-v2 F-01), with `harvest-learnings` added to `Targets`,
the AC-2.3b worked example corrected, and R-6/R-8 updated; AC-3.1's bound restated over **bytes
emitted per call** with the required tool-call shape named and the `≈150 lines` co-bound deleted;
AC-3.5's progress predicate restated as a **strict increase in AC-3.4-satisfying sections**, with an
explicit counting rule and a new total-dispatch bound (`MAX_AUTHORING_DISPATCHES`); new **AC-3.5e**
for a dispatch that does not return normally; AC-3.1's derivation arithmetic corrected against
re-measured HEAD values; AC-4.6 sequenced against AC-2.3; AC-3.2a's rebase cost stated honestly.

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
(`REQ-pdlc-workflow-distribution.md` is 1,017 lines / 89,069 bytes at HEAD `9220a20`, `wc -lc`; it
was ~970 lines / ~84,671 bytes at the moment of the failing write — *v1.2, SE-v2 F-04 / TE-v2 F-04:
the earlier figure was the write-time size mislabelled as the baseline size*), and generating that as one tool
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
  - **AC-1.4a** *(v1.2, SE-v2 Q-02 — reachability stated.)* Because AC-1.1 always derives `max + 1`,
    the only states that reach AC-1.4's error are (i) AC-1.1a's malformed duplicate of index 1,
    (ii) a file appearing between index derivation and dispatch — a concurrent run, or an agent
    writing a path it was not instructed to, which is H-1's observed behavior — and (iii) a
    non-conforming filename that AC-1.1's parse skipped but that collides with the derived path.
    Those three are the *complete* set, and (ii) is the case that matters: it is the guard that
    keeps H-1 from silently destroying history again. O-11 must construct at least one of them for
    real rather than asserting the check in isolation, so the AC is not satisfied vacuously.
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
  the pipeline was entered via `orchestrate-queue` or invoked directly on a REQ path. *(v1.3, SE-v3
  F-03: the same commit-the-`halted`-row obligation applies to an AC-3.5f authoring-budget halt,
  which writes no POSTMORTEM — durability of a halt does not depend on a POSTMORTEM existing.)*
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
  behalf).

  *(v1.2, SE-v2 F-01 — the v1.1 worked example was falsified and is replaced by the two cases that
  are actually reachable.)*

  - **Worked example A — pre-harvest feature, skip fires.** A feature whose Phase R converged and
    whose pipeline has **not** yet reached Phase H still holds its `CROSS-REVIEW-{role}-REQ-v{N}.md`
    pair on the branch. If that pair carries same-round approving verdict fields (AC-4.1a, AC-4.2)
    and an unresolved `POSTMORTEM-R-{feature}.md` is also present, **Phase R is skipped, the run
    continues to Phase F, and the report names both the approval and the still-open POSTMORTEM.**
    This is the state run 4 of `feat-pdlc-workflow-distribution` was in on 2026-07-28, and it is the
    state any re-entry after a Phase-F failure is in.
  - **Worked example B — harvested feature, skip does not fire.** `pdlc-workflow-distribution` as it
    stands at HEAD holds `POSTMORTEM-R-pdlc-workflow-distribution.md` and a REQ at v17.1, but
    **zero `CROSS-REVIEW-*` files** — Phase H deleted all 62 of them (§4a A-7), and its
    `LEARNINGS-pdlc-workflow-distribution.md` predates AC-4.2b's approval record. So the verdict is
    unreadable, AC-4.2a fails closed, Phase R **would run**, and AC-2.3 therefore **refuses and
    halts**, reproducing the POSTMORTEM's Recommendation. That is the correct outcome, not a defect.
    **The operator's sole route forward is AC-2.4** — resolve the POSTMORTEM in the artifact, then
    re-enter. *(v1.3, SE-v3 F-02: v1.2 also offered "or AC-4.6 (force the phase)" here. That was
    wrong twice over. AC-4.6a makes AC-2.4 the **exclusive** route through an unresolved-POSTMORTEM
    state, so a force-run in this state is refused; and AC-4.6 overrides recorded **approval**, of
    which there is none readable in this example, so forcing would be a no-op even if it were
    permitted. The offer is withdrawn; AC-4.6a is the governing clause and needs no escape hatch,
    because AC-2.4's resolution act is itself the cheap, operator-visible bypass.)* AC-4.2b prevents
    future features from landing in this state.

  When approval is absent or stale (AC-4.4), the phase would run and AC-2.3 refuses.
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
  edit call may emit more than `MAX_AUTHORING_WRITE_BYTES`** (see the threshold declaration below); a
  section larger than the budget is split across successive calls at sub-heading boundaries.
  *(v1.1, TE F-03 — the bound replaces "well inside" and "expected to".)*
- **AC-3.1a** *(v1.2, SE-v2 F-02 — the bound's referent and the required call shape.)* The bound is
  over the bytes **the call itself emits**, not over how much of the document is newly authored. This
  distinction is behavioral, because the two tools differ:
  - A whole-file **write** emits the entire document every time, so appending a 3 KB section to a
    40 KB draft emits ~43 KB and violates the bound even though only 3 KB is new. Six such calls,
    each with a modest amount of new content, reproduce §H-3's failure incrementally — which is
    exactly what the v1.1 wording permitted.
  - An **append-shaped** call emits only the new text, so its emitted bytes equal its new content.
  - A **replace-shaped edit** emits **both the text it matches on and the replacement text**, so its
    emitted bytes are `match + replacement`. *(v1.3, SE-v3 F-05 — v1.2 stated the append-only
    equality for all edits, understating a replacement by roughly 2×: replacing a 7 KB section emits
    ~14 KB and breaches a 12,000-byte budget while adding nothing net.)* Authors and the AC-3.6
    population — which edits existing sections rather than appending new ones, and is therefore the
    population this correction most affects — must therefore prefer append-shaped calls, or scope a
    replacement narrowly enough (a sub-heading, a table row, a paragraph) that match plus
    replacement together stay well under the budget. Replacing a whole large section in one call is
    a budget violation even when the replacement alone would fit.

  Therefore: the **first** write (the skeleton) may be a whole-file write, since a headings-only
  skeleton is far under the budget. **Every subsequent section must be added by an edit- or
  append-shaped call**; once a document exceeds `MAX_AUTHORING_WRITE_BYTES` in total, a whole-file
  rewrite of it is forbidden outright, and a document that must be restructured wholesale is
  restructured section-by-section. This obligation is stated in each author SKILL's authoring-pacing
  section and applies identically under AC-3.6.

  **Enforceability.** *(v1.3, TE-v3 F-03.)* AC-3.1 and AC-3.1a are **agent-directed obligations that
  the script cannot verify**, and this REQ says so rather than implying an enforcement it does not
  have. Emitted bytes per tool call are not observable from any seam this repo has (C-1, §4a A-1/A-2,
  and §4a **A-9**, which records the measurement): the wrapper's only evidence is the artifact on
  disk after a dispatch, from which the number and shape of the calls that produced it cannot be
  recovered. AC-1.4's "prompt text alone does not satisfy this AC" bar is deliberately **not** met
  here, and the reason is that AC-1.4's obligation is decidable from a file check whereas this one is
  not. Two compensations are required instead, and they are what a reviewer and a test author should
  hold this AC to:
  - **One observable proxy.** Under AC-3.2a's one-commit-per-section cadence, the commit series *is*
    on-disk evidence of write granularity. A per-section commit whose diff exceeds
    `MAX_AUTHORING_WRITE_BYTES` is a **detectable violation** of the pacing contract and must be
    reported as such (O-20 owns the check). It is a proxy, not the bound: it catches coarse pacing,
    and cannot catch a compliant commit assembled from one oversized call.
  - **The compensating measurable control.** AC-3.5's script-owned dispatch-and-verify counters are
    the mechanism that actually bounds the cost of a pacing failure, and they are fully measurable.
    A pacing violation therefore degrades to a stall-killed dispatch that AC-3.5 counts, reports and
    terminates — the outcome §H-3 lacked — rather than to an undetected breach.

  **Threshold declaration — `MAX_AUTHORING_WRITE_BYTES`**

  | Field | Value |
  |---|---|
  | Name | `MAX_AUTHORING_WRITE_BYTES` — a **byte** bound only. *(v1.2, TE-v2 F-03: the `≈150 lines, whichever is hit first` co-bound is **deleted**. It was approximate, therefore undecidable, and it was unmeasured — the surviving witnesses are 48 and 88 lines and the failing one ~1,000, so nothing measured supported 150. The byte bound alone is decidable and sufficient.)* |
  | Default | **12,000 bytes** emitted per single write/edit call (AC-3.1a) |
  | Owner | pdlc plugin maintainer; declared in the authoring-pacing section of each of the three author SKILLs. *(v1.3, TE-v3 F-03: v1.2 also claimed it was "asserted by the dispatch-and-verify wrapper's review checklist". The wrapper cannot assert it — see AC-3.1a **Enforceability** and §4a A-9. The only script-checkable surface is the per-section commit-diff proxy of AC-3.2a/O-20; the bound itself is agent-directed.)* |
  | Derivation (measured floor, `wc -lc` at HEAD `9220a20`) | *(v1.2 — re-measured; SE-v2 F-04 / TE-v2 F-04 corrected two numbers and one false claim.)* Smallest **observed failing** single write: `REQ-pdlc-workflow-distribution.md` at **1,017 lines / 89,069 bytes**, killed 6/6 times (§H-3). *(v1.1 cited 970 / 84,671 — that was the file's size at the moment of the failing write, not its size at the declared baseline; the provenance line was wrong, so the baseline figure is now used.)* Largest **observed surviving** single writes on this branch: `CROSS-REVIEW-test-engineer-REQ-v1.md` **12,767 bytes** / 88 lines and `CROSS-REVIEW-software-engineer-REQ-v1.md` **11,933 bytes** / 48 lines, neither of which ever stalled. The default is the round number **inside the band bracketed by the two surviving witnesses** — 67 bytes above the smaller (11,933) and at **0.94× the larger** (12,767) — and **7.42× below the failing floor** (89,069 ÷ 12,000). *(v1.1's "the smaller of the two surviving witnesses, rounded down" was simply false: 12,000 is above 11,933, not rounded down from it. The band conclusion is unchanged.)* So the default sits inside the demonstrated-safe band rather than interpolated into the untested gap between 12,767 and 89,069. It is deliberately conservative: this REQ itself survived as a larger artifact, but never demonstrably as a single call, so it is not used as a witness. |
  | Revision rule | Raising the default requires a new surviving-write measurement at the higher value, recorded here with the command that produced it; it is not raised by argument. |

- **AC-3.2** Partial progress is durable. A document killed mid-authoring leaves the sections
  written so far on disk **and committed**, not an empty file and not a truncated one that reads as
  complete.
- **AC-3.2a** *(v1.1, SE Q-03 / TE Q-03 — commit cadence is part of the contract.)* The cadence is
  **one commit per section write**. A single commit at the end of an attempt does not satisfy
  AC-3.2, because it is exactly the state a stall-kill destroys. This makes the author SKILLs' Git
  Workflow sections part of `Targets` (they currently say "After completing: write all artifacts to
  disk, stage, commit" — `pdlc/skills/pm-author/SKILL.md:29`). Section-granular commits on a feature
  branch are accepted as the cost. *(v1.2, SE-v2 F-06 — the cost is restated honestly.)* They are
  squash-invariant, so the merged history is unchanged; but a rebase **replays each commit in turn**,
  so N per-section commits are N replay steps and N potential conflict points, and Phase DOD Step 0
  halts the pipeline on conflict (`ship-pr`). The v1.1 claim that Phase DOD's rebase is "unaffected"
  was wrong. The cadence is still the right call — a single end-of-attempt commit is precisely what a
  stall-kill destroys — and the honest trade-off is *more replay steps against a moved base*, which
  argues for **coarse top-level sections** rather than fine-grained ones, and for keeping conflict
  surface in mind when choosing the split points of AC-3.1.
- **AC-3.2b** *(v1.2, TE-v2 Q-02 — cadence scope.)* The one-commit-per-section cadence binds **every
  agent bound by AC-3.6**, not only the three author SKILLs: a review agent's partially written
  cross-review, or a remediation agent's partially applied edit, is lost to a stall-kill in exactly
  the same way. Where a review artifact is produced in a single sub-budget write, the cadence is
  satisfied trivially by the one commit that follows it.
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
- **AC-3.5** *(v1.1, restated for SE F-02 / TE F-02 — the counted quantity is script-owned; v1.2,
  restated again for TE-v2 F-01 / F-02 and SE-v2 F-03; v1.3, scoped and split for TE-v3 F-01 /
  F-02 / F-04 and SE-v3 F-03.)* An authoring dispatch is wrapped by the script in a
  **dispatch-and-verify** step: after each dispatch, the script re-measures the artifact from disk
  and compares it with the measurement taken before that dispatch.
  - **AC-3.5 scope — which dispatches are wrapped, and in which mode.** *(v1.3, TE-v3 F-01.)* The
    wrapper wraps **every** dispatch that is expected to write the phase's artifact — the initial
    authoring dispatch, every feedback-addressing revision dispatch of a later round, and every
    AC-3.6 review or remediation dispatch. It does **not** wrap a dispatch that is not expected to
    write the artifact at all (e.g. a reviewer producing only its own cross-review file, which is
    that file's own artifact and is wrapped as such). Because a revision dispatch begins from a
    structurally complete document, the wrapper runs in one of **two modes**, selected by the
    pre-dispatch measurement and by nothing else:

    | Mode | Selected when | Progress predicate (AC-3.5a) |
    |---|---|---|
    | **Greenfield** | the artifact is absent, or present and **not** structurally complete (AC-3.4) | limb (i) or (ii) of AC-3.5a |
    | **Revision** | the artifact is present and **already structurally complete** | limb (iii) of AC-3.5a |

    Mode selection is identical to the resume/first-attempt determination of AC-3.3 and is taken from
    the same single pre-dispatch measurement, so the two can never disagree. In **revision** mode the
    resume prompt of AC-3.3 is **not** used — there is no "first unwritten section" — and the
    re-dispatch of AC-3.5b carries the original feedback-addressing prompt instead.
  - **AC-3.5a — what "progress" means.** *(v1.2, TE-v2 F-01; v1.3, restated as a disjunction for
    TE-v3 F-01 / F-05.)* A dispatch made progress if **any** of the following holds:
    1. the count of top-level sections satisfying the AC-3.4 completeness criterion — i.e. sections
       that have acquired their content — **strictly increased**; or
    2. no artifact existed before the dispatch and one exists after it (the **skeleton write**: this
       is limb 2, not an exception to limb 1, and after it the consecutive no-progress counter of
       AC-3.5c is **zero**); or
    3. *(revision mode only)* the artifact's **bytes on disk changed** — any difference in content
       between the pre-dispatch and post-dispatch measurement counts, whether or not the section
       count moved.

    Limbs 1 and 2 apply in greenfield mode; limb 3 applies in revision mode. Two false positives are
    thereby excluded, and both were live defects of earlier drafts. *(v1.2 excluded the first:)* a
    heading-presence predicate is constant from write 1 onwards, because AC-3.1 requires the first
    write to lay down all top-level headings, so it would score every healthy filling dispatch as
    "no progress". *(v1.3 excludes the second, TE-v3 F-01:)* a section-count predicate is **saturated
    from above** on a revision dispatch — the document is already complete, so the count is already
    at its maximum and cannot strictly increase no matter how correct the edit — so limbs 1 and 2
    alone would score **every** feedback-addressing dispatch as no progress and halt every phase at
    AC-3.5c's third round. Limb 3 gives that population a predicate that can actually change. It is
    deliberately weak (any byte change counts): a revision dispatch that runs to completion always
    writes something, and a stall-killed one that wrote nothing is exactly the state the counter
    exists to catch.
  - **AC-3.5b — no progress, progress, and completion.** *(v1.3, TE-v3 F-04 — the loop's success and
    continuation conditions are stated, not left inferable.)* After each dispatch the wrapper takes
    exactly one of three actions:
    - **No progress** ⇒ the dispatch counts as one failed *script-owned* attempt (AC-3.5c), and the
      script re-dispatches — with the resume prompt of AC-3.3 in greenfield mode, with the original
      prompt in revision mode — unless a budget is exhausted, in which case AC-3.5d/AC-3.5f apply.
    - **Progress, artifact not yet terminal** ⇒ the consecutive counter resets to zero (AC-3.5c) and
      the script re-dispatches to continue, subject to the cumulative budget.
    - **Terminal** ⇒ the wrapper **stops and reports success**, and the phase proceeds. "Terminal" is
      structural completeness (AC-3.4) in greenfield mode, and, in revision mode, the completion of
      the dispatched revision — the artifact is structurally complete and the dispatch returned
      normally having made progress. A wrapper that made progress on the terminal dispatch never
      re-dispatches, so a converged phase costs no extra dispatch.
  - **AC-3.5c — the counting rules and their scopes.** *(v1.2, TE-v2 F-02; v1.3 re-scoped for TE-v3
    F-02 and SE-v3 F-03.)* Two bounds, both terminal — whichever is reached first ends the phase:
    - `MAX_AUTHORING_ATTEMPTS` bounds **consecutive** no-progress dispatches and is **reset to zero
      by any dispatch that makes progress**. A legitimately advancing 12-section document therefore
      never halts on it.
    - `MAX_AUTHORING_DISPATCHES` bounds the **total** dispatches, progress or not, within **one
      dispatch-and-verify episode** — i.e. one artifact, one phase, **one review round, one
      invocation**. *(v1.3: v1.2 scoped it "per artifact per phase", which was wrong in two ways.
      (a) TE-v3 F-02: AC-1.6 grants a five-round budget and every round after the first needs an
      authoring dispatch for the same artifact in the same phase, so 1 + 5 = 6 dispatches is a
      **healthy** five-round convergence and it hit the cap exactly — a legitimately converging phase
      would halt. (b) SE-v3 F-03: a per-phase-lifetime count would also persist across invocations
      and trip a re-entered phase on entry, the same defect AC-1.6a fixed for the round budget.)*

    **Reset scope, stated explicitly** *(answers SE-v3 Q-01 and TE-v3 Q-02)*: both counters are
    **per episode**. They start at zero at the beginning of every dispatch-and-verify episode, and
    therefore reset on each new review round *and* on each fresh invocation of the phase. A phase
    re-entered by an operator continues from the committed partial progress of AC-3.2/AC-3.3 with a
    full dispatch budget; neither counter is persisted to disk or carried across invocations. (Only
    the POSTMORTEM state of AC-2.3 persists, and AC-3.5f establishes that budget exhaustion does not
    write one.)

    **Consistency with AC-1.6, shown.** The two constants now bound the same loop at different
    granularities, so the worst-case dispatch count for one artifact in one phase in one invocation
    is `MAX_ROUNDS × MAX_AUTHORING_DISPATCHES` = 5 × 6 = **30** dispatches, and the worst-case
    consecutive-stall run inside any one episode is `MAX_AUTHORING_ATTEMPTS` = 3. A healthy five-round
    convergence uses at most one or two dispatches per episode and never approaches either bound.
  - **AC-3.5f — how budget exhaustion is classified.** *(v1.3, SE-v3 F-03.)* An exhaustion of either
    budget halts the phase with the report of AC-3.5d, and it **does not write a
    `POSTMORTEM-{phase}-{feature}.md`**. A POSTMORTEM records a *reviewer disagreement* that a fresh
    round budget cannot resolve (H-2, AC-2.3); an authoring-budget exhaustion records a *mechanical*
    failure to produce bytes, on which the correct operator response is to re-invoke — the artifact's
    committed partial progress is on disk (AC-3.2) and the next invocation resumes from it (AC-3.3)
    with the fresh per-episode budget of AC-3.5c. Writing a POSTMORTEM here would make AC-2.3 refuse
    re-entry to the phase and, under AC-4.6a, make AC-2.4's human resolution act the **exclusive**
    route out — so a merely large document could lock the pipeline into a human-only recovery. That
    is the wrong classification and is forbidden. The halt is still terminal for the invocation, and
    it still sets and **commits** the feature's queue row to `halted` on the same terms as AC-2.1 —
    AC-2.1's obligation is extended to this halt, so durability does not depend on a POSTMORTEM
    existing — so the halt is durable and legible without being self-refusing.
  - **AC-3.5d — the report.** When either budget is exhausted the operator-facing report names the
    phase, the artifact, **which budget was exhausted**, and the actual counts — "no progress across
    N consecutive attempts" for `MAX_AUTHORING_ATTEMPTS`, or "M dispatches without reaching
    structural completeness" for `MAX_AUTHORING_DISPATCHES` — together with the count of
    AC-3.4-satisfying sections reached. N and M are always the **script's own** counts. The runtime's
    internal retry count is explicitly **not** claimed, reported, or depended upon (§4a A-2/A-3);
    observing it is deferred as **D-RLH-04**.
  - **AC-3.5e — a dispatch that does not return normally.** *(v1.2, SE-v2 F-03 — the failure path of
    the mechanism's own motivating scenario.)* §H-3's dispatches were killed, and §4a A-8 records
    that how an exhausted runtime retry surfaces to the caller is **not measured**: it may return a
    value, return nothing, or throw/reject. The wrapper therefore treats **all** of those identically
    to a dispatch that returned without progress: the script catches the fault, re-measures
    completeness from disk (which is authoritative either way, AC-3.3), applies AC-3.5a–AC-3.5c, and
    re-dispatches or halts accordingly. A dispatch fault must **not** propagate as an unhandled halt
    that bypasses the attempt count, because that is the exact path on which §H-3 produced no
    operator-facing explanation at all. Whether the fault was observed is reported alongside the
    counts of AC-3.5d.

  | Field | Value |
  |---|---|
  | Name | `MAX_AUTHORING_ATTEMPTS` (**consecutive** script-owned no-progress dispatches within one dispatch-and-verify episode, reset by any progress; distinct from the runtime's own retries) |
  | Default | **3** |
  | Owner | pdlc plugin maintainer; a named constant in `pdlc/workflows/orchestrate-dev.js`, following the `DOD_MAX_ITERATIONS` convention (`:25`) |
  | Rationale | Three identical no-progress dispatches against unchanged on-disk state is sufficient evidence of a stuck artifact: each dispatch after the first already begins from committed partial progress (AC-3.2), so a fourth adds no new information. |
  | Revision rule | Raising it requires an observed case where a fourth consecutive no-progress dispatch made progress. |

  | Field | Value |
  |---|---|
  | Name | `MAX_AUTHORING_DISPATCHES` (**cumulative** dispatches per **dispatch-and-verify episode** — one artifact, one phase, one review round, one invocation; progress or not). *(v1.3, TE-v3 F-02 / SE-v3 F-03: v1.2's "per artifact per phase" scope is **replaced**. See AC-3.5c for why per-phase-lifetime was both inconsistent with AC-1.6's round budget and non-resetting across invocations.)* |
  | Default | **6** |
  | Owner | pdlc plugin maintainer; a named constant alongside `MAX_AUTHORING_ATTEMPTS` in `pdlc/workflows/orchestrate-dev.js` |
  | Derivation (measured, §H-3) | *(v1.3 — arithmetic corrected and re-derived at the new scope.)* §H-3's six killed attempts cost **~71 min and ~1.34 M subagent tokens** for zero output — **~11.8 min** and ~223 K tokens per dispatch (71 ÷ 6 = 11.83; 1.34 M ÷ 6 ≈ 223 K). *(v1.2 stated ~5.3 min per dispatch, which does not divide — SE-v3 F-04. The conclusion is unchanged: the per-dispatch cost is the thing being bounded, and it is larger, not smaller, than v1.2 claimed.)* Capping one **episode** at **6** bounds a single stuck episode at exactly the already-observed ceiling (~71 min) and never worse, while AC-3.5c's consecutive rule terminates most stuck cases at 3 (~35 min). At the episode scope the bound no longer competes with AC-1.6's five rounds: a healthy episode needs one or two dispatches (greenfield: skeleton + filling; revision: one edit pass), so 6 leaves headroom of several stall-killed dispatches per round before the phase gives up, and the whole-phase worst case is the product shown in AC-3.5c (5 × 6 = 30 dispatches), which is a deliberate cost ceiling rather than a false-positive halt path. |
  | Revision rule | Raising it requires a measured case where a 7th dispatch **within one episode** reached structural completeness that 6 did not, recorded with the command or transcript that measured it; it is not raised by argument. Lowering it is always permitted, since it only tightens the cost bound. Changing its **scope** requires re-showing consistency with `MAX_ROUNDS` (AC-3.5c), because the two bound the same loop. |

- **AC-3.6** Applies uniformly to `pm-author`, `se-author` and `te-author`. A review or remediation
  agent editing an existing document is bound by the **same** `MAX_AUTHORING_WRITE_BYTES` budget per
  call — *(v1.1, TE F-03: "comparable size" is replaced by the one numeric bound; there is no second,
  looser threshold for edits.)* An edit that would exceed the budget is split at sub-heading
  boundaries, exactly as in AC-3.1, and is measured over **bytes emitted** per AC-3.1a — so a review
  or remediation agent may not rewrite a whole document to change part of it. The commit cadence of
  AC-3.2b binds these agents too.

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
- **AC-4.2b** *(v1.2, SE-v2 F-01 — approval must survive the pipeline that records it.)* **Phase H
  deletes every `CROSS-REVIEW-*` file** for the feature after LEARNINGS is committed (§4a A-7). So an
  approval carried *only* in the cross-review artifact is destroyed by the same pipeline run that
  earned it, and AC-4 as written in v1.1 was inert for every feature that has actually shipped — the
  whole population re-entry targets. Approval must therefore have **two tiers of evidence**, checked
  in order:

  | Tier | Carrier | Available |
  |---|---|---|
  | 1 (primary) | The persisted verdict field in `CROSS-REVIEW-{role}-{doc-type}-v{N}.md` (AC-4.2) | Before Phase H |
  | 2 (durable) | A machine-readable **approval record** in `LEARNINGS-{feature}.md`, written by `harvest-learnings` as it deletes the artifacts it harvested | After Phase H, permanently |

  The approval record carries, per approving round: the **document type**, the **round index**, each
  **role** and its **verdict value** from the same closed catalogue of AC-4.3, and — *(v1.3, SE-v3
  F-01: the anchor v1.2 omitted)* — the **content hash of the reviewed document as it stood at that
  approving round**, plus the **commit sha** the approving cross-review files were last present at.
  The content hash is the load-bearing field and the commit sha is corroborating context only:
  AC-4.4 asks whether the document changed after its approval, and a hash of the approved bytes
  answers that by comparing the document at HEAD against the recorded hash — which is **rebase-proof**,
  where a timestamp or a sha is not (Phase DOD rebases the branch and rewrites both — O-8's own
  caveat). Without those fields the four v1.2 columns date nothing, `LEARNINGS-{feature}.md`'s own
  commit is always later than the approvals it records and so cannot substitute, and tier 2 would be
  forced to choose between never granting a skip (reinstating the exact inertness AC-4.2b exists to
  remove) and treating unevaluable staleness as not-stale (fail-open, laundering post-approval edits,
  which R-1 and AC-4.2a forbid). With them, **AC-4.1a's same-round test and AC-4.4's staleness test
  are both evaluable from tier 2 alone**, and that sufficiency claim is now met rather than asserted.
  If the record is present but its hash field is absent or unparseable, that is AC-4.2a's
  unparseable case: the phase runs.

  `harvest-learnings` is added to `Targets` accordingly: it already lists the harvested filenames in
  its `Harvested from` row, but filenames are not verdicts, so the row is not sufficient evidence and
  this is an additive change to that SKILL's output contract. **The record must be derived by
  measurement, not narration** — harvest computes the hash from the document it is harvesting beside
  and reads each verdict from the file it is about to delete. This is not a hypothetical hazard:
  `pdlc-workflow-distribution`'s existing `Harvested from` row asserts its `POSTMORTEM-R-*` was "all
  now deleted" while that file is present at HEAD and `harvest-learnings/SKILL.md` never instructs its
  deletion (§4a A-7), so harvest already mis-records what it did in the very row this record sits
  beside. O-21 must therefore specify the derivation, not merely the columns.

  Tier 2 is consulted **only** when tier 1 is absent — meaning **no** `CROSS-REVIEW-*` file for that
  (feature, document type) is present on the branch at all. *(v1.3, answers SE-v3 Q-02:)* a tier 1
  that is present but **incomplete** — one role's file for the approving round present, the other's
  missing (the role-asymmetric branch of O-18) — is **not** "absent". Tier 1 governs, the missing
  role is not approving (fail-closed, AC-4.2a and O-18), and the pair does **not** get completed
  across tiers: mixed provenance is never used to assemble an approval. When both tiers exist for the
  same (document type, round) and disagree, that is AC-4.2a's unparseable case and the phase runs.
- **AC-4.2c** *(v1.2)* **Legacy features have no tier-2 record either**, since their LEARNINGS
  predates AC-4.2b. They therefore fail closed under AC-4.2a and their phases run — see AC-2.3b
  worked example B. This is accepted rather than backfilled: reconstructing verdicts for deleted
  artifacts from git history is out of scope (a backfill would be an operator act, and an operator who
  wants the skip has AC-4.6).
  - *(v1.3, answers TE-v3 Q-01 — the record is **best-effort**, and `guard-harvest-before-delete` is
    **not** tightened.)* The guard's existing precondition stays as it is: it blocks deleting a
    `CROSS-REVIEW-*` unless `LEARNINGS-{feature}.md` exists, and it does not additionally require the
    approval record to be present. A LEARNINGS that exists without the record therefore passes the
    guard, the cross-reviews are deleted, and the feature falls into this clause's fail-closed case —
    its phases run. Rationale: the guard protects *harvest of content*, which is the irreversible
    loss; a missing approval record costs one re-review, which AC-4.2a already treats as the safe
    direction, and making an optimisation's record a precondition of the pipeline's normal cleanup
    step would let a record-writing bug halt harvest. O-21 therefore needs **no** falsifying test that
    the guard rejects a record-less LEARNINGS; it needs the opposite — a test that a record-less
    LEARNINGS is accepted by the guard and then fails closed at AC-4.2a.
- **AC-4.3** Both approving verdict forms count: *Approved* and *Approved with minor changes*. This
  matches the existing convergence gate; the skip must not be stricter than the gate that produced
  the approval, nor looser — the catalogue is closed to exactly the three values the review SKILLs
  emit (`Approved`, `Approved with minor changes`, `Needs revision`).
- **AC-4.4** If the document has been modified after the approving reviews, the phase is **not**
  skipped — the skip must not launder an unreviewed edit. *(v1.3, SE-v3 F-01 — the referent per
  tier.)* Under **tier 1** the comparison is against the approving cross-review artifacts' own
  position in history (O-8 owns the measure and its rebase behavior). Under **tier 2** the comparison
  is against the **approval-time content hash** recorded in AC-4.2b's approval record: the phase is
  skipped only if the document at HEAD hashes to the recorded value, and any difference is a
  modification. Tier 2 therefore has a definite, rebase-proof referent and is neither inert nor
  fail-open. If no referent is available in the tier being used, the AC is unevaluable and the phase
  **runs** (fail closed, AC-4.2a).
- **AC-4.5** The skip is observable in the final report: skipped phases are listed with their reason
  and are visibly distinct from phases that ran and from phases that failed.
- **AC-4.6** An operator can force a phase to run despite recorded approval.
- **AC-4.6a** *(v1.2, TE-v2 F-05 — force-run sequenced against AC-2.3.)* A forced phase is still
  subject to AC-2.3. Forcing overrides **recorded approval only**; it does not override an unresolved
  POSTMORTEM, so on the state that motivates both — approval recorded *and* an unresolved
  `POSTMORTEM-{phase}-{feature}.md` — the force-run is **refused** by AC-2.3, with the POSTMORTEM's
  Recommendation reproduced. AC-2.4's resolve-then-run is the **exclusive** route through that state.
  Rationale: AC-2.3's refusal exists because a phase re-entered against an unresolved disagreement
  wastes a whole budget on it (H-2), and that is just as true when the re-entry was requested
  deliberately; whereas the POSTMORTEM resolution act is cheap, is already required to be
  operator-visible, and leaves a record of *why* the disputed review was re-opened. The refusal
  message names AC-2.4 as the next step, so a forcing operator is never left guessing.
- **AC-4.7** *(v1.1, SE Q-04 — which phases the skip applies to.)* The skip applies **only** to
  phases whose convergence is established by a reviewer-pair cross-review artifact for a named
  document: R, F, T, P and D. Phase CR (final codebase review) and Phase DOD are **out of scope** for
  AC-4 — they review the tree rather than a document, produce no
  `CROSS-REVIEW-{role}-{doc-type}` pair in AC-1.1's sense, and are cheap relative to the risk of
  skipping a verification phase. They continue to run unconditionally, subject to their existing
  flags.
- **AC-4.7a** *(v1.2, SE-v2 Q-03 — `dod-verify`'s artifacts.)* **No.** The persisted-verdict field of
  AC-4.2 and the approval record of AC-4.2b apply to `CROSS-REVIEW-{role}-{doc-type}` artifacts only.
  `CODE_REVIEW-{feature}-v{N}.md` is **not** amended: Phase DOD is out of AC-4's scope per AC-4.7, so
  a persisted verdict on it would have no reader, and adding an unread field is the kind of
  speculative contract this REQ declines. `harvest-learnings` continues to delete `CODE_REVIEW-*`
  unchanged, and the approval record of AC-4.2b carries no DOD rows. One grammar still holds where it
  matters: the *catalogue* of verdict values (AC-4.3) is shared, so if a future row brings Phase DOD
  into scope it reuses the same values rather than inventing new ones.

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
  reach.)* *(v1.2 — the unobservability extends to how a killed dispatch **surfaces** to its caller
  (§4a A-8), so AC-3.5e is written over all three possible surfacings rather than over a measurement
  this repo cannot take.)* *(v1.3 — the unobservability also extends to **emitted bytes per tool
  call** (§4a A-9), so AC-3.1/AC-3.1a are recorded as agent-directed obligations with a commit-diff
  proxy and AC-3.5's counters as the compensating measurable control, rather than as script-enforced
  bounds.)*
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
recorded. None is inferred from naming or documentation. Added at v1.1 for SE F-02 / TE F-02;
A-7 and A-8 added at v1.2 for SE-v2 F-01 / F-03; A-9 added at v1.3 for TE-v3 F-03.

| # | Assumption | How it was measured | Consequence |
|---|---|---|---|
| A-1 | **The workflow runtime exposes exactly eleven host globals**: `agent`, `parallel`, `pipeline`, `phase`, `log`, `workflow`, `args`, `budget`, `console`, `setTimeout`, `clearTimeout`. There is no `fs`, no `process`, no `import`/`import()`, no `fetch`. | The probe of 2026-07-27 recorded in `pdlc/workflows/runtime-adapter.js` header comment (`:13-16`, "probed 2026-07-27 … the only host globals are"). Re-read at HEAD `9220a20`. | Any file inspection AC-1.1, AC-2.3, AC-3.4 and AC-4.2 need must come through an injected seam implemented as an `agent()` call (C-2). |
| A-2 | **None of those globals conveys stall/retry state.** The runtime's 180,000 ms no-progress kill and its six-attempt retry are not readable, settable or countable from a workflow script, and no constant naming them exists in this repo. | `grep -rnE "180000\|no.progress\|\bstall\b\|attemptCount\|maxAttempts" pdlc/ .claude/` → no match in any workflow source (the only `attempt` hits are unrelated: `orchestrate-dev.js:314`'s trailer-recovery comment, `orchestrate-queue.js:364`, and drift tests). Cross-checked against A-1's global list. | AC-3.3 and AC-3.5 may **not** be defined over the runtime's attempt counter. They are defined over script-observable state instead (artifact state on disk, and a script-owned dispatch-and-verify attempt count). Runtime-attempt observability is deferred as **D-RLH-04**. |
| A-3 | **It is not established whether the runtime's retry re-enters the workflow script** or replays the `agent()` call opaquely beneath it. The 2026-07-28 transcript is consistent with either (six attempts, each opening with a fresh preamble). | Transcript inspection only; A-1's global list offers no primitive that would tell a script apart. No measurement in this repo can settle it, so it is recorded as unknown rather than assumed. *(Answers SE Q-01: it is not a design choice, and this REQ does not depend on the answer.)* | Every AC-3 obligation is written to hold under **both** readings. Nothing in AC-3 requires code to run between two runtime attempts. |
| A-4 | **The machine-readable verdict is a response contract, not an artifact field.** All three review SKILLs place the `VERDICT:` + JSON trailer in the agent's *response* ("append the following two lines as the last content of your response", `pdlc/skills/se-review/SKILL.md:199`), and `reviewLoop` parses it off the `_agent()` return value via `parseVerdict` (`orchestrate-dev.js:322`, used at `:594-595`, `:624`, `:633`) — never off disk. The cross-review *file* template ends at a free-text `## Recommendation` (`se-review/SKILL.md:143` ff.). | Read both SKILLs and `parseVerdict`; then checked this branch's own artifacts: `CROSS-REVIEW-software-engineer-REQ-v1.md` happens to carry the trailer, `CROSS-REVIEW-test-engineer-REQ-v1.md` does **not**. One of two — the field is not reliably persisted today. | AC-4.2 cannot read approval off today's artifacts. This REQ therefore takes the scope of making the verdict a persisted, closed-catalogue field (see `Targets`, AC-4.2, O-17). |
| A-5 | **A pure, root-parameterised file-listing oracle already exists in this repo**, but only on the jest side: `pdlc/workflows/lib/document-oracles.mjs` (`listAllFiles(root)` at `:81`, skipping `.git`/`node_modules` via `WALK_SKIP_DIRS` at `:77`). Being `.mjs` and using `fs`, it is unreachable from a runtime bundle. | Read the module; cross-checked against A-1. | The runtime needs its own injected listing seam regardless (C-2), so O-1 must dispose of reuse-vs-duplicate explicitly and pin one shared error contract (DC-04, DC-11). |
| A-6 | **The tracked generated tier is `pdlc/workflows/dist/`; `.claude/workflows/` is untracked by decision.** | `DEC-DIST-02` (`docs/_decisions/DECISIONS-plugin-distribution.md`, three-tier table: source `pdlc/workflows/*.js` tracked; built `pdlc/workflows/dist/` tracked, never hand-edited; consumer `.claude/workflows/` **not** tracked, never hand-edited) plus CLAUDE.md §"Workflow scripts and the runtime build". | AC-5.5 is stated against `dist/` and `sync-workflows.sh --check`, never against the consumer copy (SE F-01). |
| A-7 *(v1.2, SE-v2 F-01)* | **Phase H deletes every `CROSS-REVIEW-*` and `CODE_REVIEW-*` file for the feature**, so no cross-review artifact survives a completed pipeline run. `POSTMORTEM-*` files are read by harvest but **not** deleted, so they do survive — which is why an unresolved POSTMORTEM outlives the approval that would have skipped past it. | `pdlc/skills/harvest-learnings/SKILL.md` states it four times — the description line (`:3`, "then deletes the now-redundant process artifacts"), §Scope (`:10`, "then remove the harvested `CROSS-REVIEW-*` and `CODE_REVIEW-*` files"), the Git Workflow step (`:27`, "delete … in a second commit"), and the checklist (`:100`) — and the `guard-harvest-before-delete` hook exists to sequence that deletion. Verified against the tree: `docs/pdlc-workflow-distribution/` holds `LEARNINGS-…`, a REQ at v17.1 and `POSTMORTEM-R-…`, and **zero `CROSS-REVIEW-*` files**; its LEARNINGS `Harvested` row records 62 deleted cross-reviews plus 3 `CODE_REVIEW-*`, listing **filenames only, no verdicts**. | AC-4.2's evidence source is destroyed by the pipeline that creates it. AC-4.2b therefore adds a harvest-surviving tier (an approval record in LEARNINGS) and puts `harvest-learnings` in `Targets`; AC-2.3b's worked example is corrected accordingly. |
| A-8 *(v1.2, SE-v2 F-03)* | **How an exhausted runtime retry surfaces to the caller is not measured** — whether the `agent()` call returns a value, returns nothing, or throws/rejects after the runtime's final kill is unknown. | The 2026-07-28 transcript shows only the six `INTERRUPTED` records of §H-3 and no caller-side outcome; A-1's global list offers no primitive that would report one, and A-2 found no stall/retry constant anywhere in the repo. As with A-3, no measurement available in this repo settles it, so it is recorded as unknown rather than assumed. | AC-3.5e is written to hold under **all three** outcomes: the wrapper catches faults, and completeness is re-measured from disk in every case, so the attempt count and the operator-facing report exist on every path. Nothing in AC-3 depends on which outcome is real. |
| A-9 *(v1.3, TE-v3 F-03)* | **Emitted bytes per tool call are not observable from any seam a workflow script has.** Neither the number of tool calls an agent made, nor their shape (whole-file write vs. edit vs. append), nor the bytes each emitted, is recoverable by the script. The only post-dispatch evidence is the artifact's content on disk, which is identical whether it was produced by one 43 KB write or by fourteen 3 KB appends. | A-1's eleven host globals contain no telemetry primitive, and the `agent()` bridge in `pdlc/workflows/runtime-adapter.js` conveys only the agent's response text — no tool-call log. The injected file seams the pipeline uses (`_readFile`, `_writeFile`, `_checkFile`) observe file *content and existence*, never a call record. Cross-checked against A-2's grep, which found no stall/retry/attempt telemetry of any kind in `pdlc/` or `.claude/`. | AC-3.1/AC-3.1a are recorded as **agent-directed and script-unverifiable** (see AC-3.1a **Enforceability**), rather than claiming an enforcement the seams cannot deliver. The one observable proxy is the per-section commit diff of AC-3.2a (owned by O-20); the compensating *measurable* control is AC-3.5's script-owned dispatch-and-verify counters, which bound the cost of any pacing failure. This is why AC-3.1 is held to a weaker standard than AC-1.4, and the reason is stated rather than left as an inconsistency. |

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
| R-6 *(v1.1, SE F-04; scope corrected v1.2, SE-v2 F-01)* | **Per-phase refusal scope letting stale upstream trouble through** — AC-2.3a means an unresolved `POSTMORTEM-R` does not block Phase F, so a feature can progress downstream while an R-phase disagreement is still formally open. | Accepted deliberately: what gates Phase F is the REQ's approval state (AC-4, AC-4.2a fails closed), and the alternative — a feature-wide refusal — converts R-2's deadlock from recoverable to total. AC-2.3b keeps the open POSTMORTEM named in every skip report, so it never becomes invisible. *(v1.2: this acceptance no longer rests on the falsified v1.1 worked example. It applies to the pre-harvest state of worked example A; for a harvested feature the skip does not fire at all, AC-2.3 refuses, and the risk does not arise. The narrower exposure strengthens the acceptance rather than weakening it.)* |
| R-8 *(v1.2, SE-v2 F-01)* | **Widening scope to `harvest-learnings`** — AC-4.2b makes the harvest step responsible for persisting the approval record, a fourth SKILL family this REQ did not originally target, and it puts a machine-read contract into a document (`LEARNINGS-{feature}.md`) that has so far been purely for human and consolidation reading. | The change is additive: the record is a new table alongside the existing `Harvested from` row, no existing LEARNINGS content changes, nothing else parses LEARNINGS, and C-4 holds. AC-4.2a fails closed on every LEARNINGS predating the record (AC-4.2c), so no legacy feature silently skips a phase. The alternative considered and rejected was to keep the record out of LEARNINGS in a separate durable file — rejected because a second file harvest must also write is one more thing to forget, whereas LEARNINGS is already the artifact harvest exists to produce and is guarded by `guard-harvest-before-delete`. |
| R-9 *(v1.3, TE-v3 F-01)* | **AC-3.5a limb 3 is a weak predicate** — in revision mode any byte change counts as progress, so a dispatch that edits one character resets `MAX_AUTHORING_ATTEMPTS` and the consecutive rule can never fire against a pathologically unproductive but non-silent agent. | Accepted, and deliberately traded. The alternative — a semantic progress predicate for edits — is not measurable from the seams this repo has (§4a A-9), and getting it wrong reinstates TE-v3 F-01's halt-every-revision-round defect, which is the far worse failure. The cost is bounded by the *other* counter: `MAX_AUTHORING_DISPATCHES` caps the episode at 6 dispatches regardless of progress (AC-3.5c), so the worst case is a bounded cost and a legible AC-3.5d report, not an unbounded loop. AC-3.5a's weakness is therefore covered by the cumulative bound rather than left open. |
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
| O-7 | FSPEC | The structural-completeness criterion for each document type (AC-3.4) — the **terminal** criterion, per document type. *(v1.2, TE-v2 F-01: the **delta** predicate is not O-7's to choose; AC-3.5a fixes it at REQ altitude as a strict increase in the count of sections satisfying this criterion. O-7 supplies what "satisfying" means per document type; it may not redefine progress as heading presence.)* *(v1.3, TE-v3 F-01: AC-3.5a now fixes the delta predicate in **three limbs** — section-count increase, skeleton creation, and byte-level mutation in revision mode. O-7 supplies the per-document-type completeness criterion that limbs 1 and 2 count over, and the terminal criterion AC-3.5b stops on; it owns neither the mode selection nor limb 3.)* |
| O-8 *(extended v1.3)* | FSPEC | The staleness comparison for AC-4.4 — what "modified after the approving reviews" is measured against, and its behavior under rebase (Phase DOD rebases the branch, rewriting commit timestamps). **(v1.3, SE-v3 F-01)** Two referents, not one: the **tier-1** comparison (against the approving cross-review artifacts' position in history) is O-8's to design and must state its rebase behavior; the **tier-2** comparison is fixed by AC-4.2b/AC-4.4 as an equality check against the recorded approval-time content hash, and O-8 must not redefine it — it is chosen precisely because it is rebase-invariant where a timestamp is not. O-8 must also state the behavior when the two tiers are both available and disagree (AC-4.2a's unparseable case) and when the tier in use has no referent (phase runs). |
| O-9 | FSPEC | The operator override surface for AC-4.6 and its precedence relative to the recorded approval. |
| O-10 | TSPEC / PROPERTIES | Oracles for AC-1.1 across the fixture matrix: no artifacts, un-suffixed v1 only, contiguous v1..vN, **non-contiguous** (gaps), mixed document types in one directory, mixed roles, and a non-conforming filename. |
| O-11 | TSPEC / PROPERTIES | Oracles for AC-1.4's refusal — how "would overwrite" is detected and asserted without a real overwrite occurring in the test. |
| O-12 | TSPEC / PROPERTIES | Oracles for AC-2.3's refusal and for AC-2.2's two distinct halt reasons, including the `postmortemFailed` path (`orchestrate-dev.js:586-588`) that currently only logs and is not carried in the `:598` return object — so the return shape changes too. Add the AC-2.3b precedence case (approved **and** unresolved POSTMORTEM ⇒ skip, POSTMORTEM still named) and the AC-2.3a scope case (R-postmortem does not refuse Phase F). |
| O-13 | TSPEC / PROPERTIES | Oracles for AC-3.2/AC-3.3 resumption. Simulating a mid-write kill needs a seam; specify it, and specify that an unrecognised fault token must not change production behavior. |
| O-14 *(extended v1.3)* | TSPEC / PROPERTIES | Oracles for AC-4.1/AC-4.4 — including the negative case (stale approval ⇒ phase runs), which is the one that protects R-1. **(v1.3, SE-v3 F-01/Q-02)** Must cover the staleness negative case **in both tiers** — tier 2 with a document whose bytes no longer match the recorded hash ⇒ phase runs; tier 2 with a matching hash ⇒ phase skipped — plus a rebase fixture showing the tier-2 hash comparison is unaffected by rewritten commits, and the mixed-provenance case (tier 1 present for one role only ⇒ tier 2 is not consulted, the pair does not complete across tiers, phase runs). |
| O-15 | TSPEC | Which of these behaviors are unit-testable against the injected seams in `pdlc/workflows/__tests__/` and which require a bundle-level assertion; `runtimeBundle.test.js` already asserts freshness and the runtime's structural constraints (AC-5.5). |
| O-16 | FSPEC | Disposition of AC-5.1/AC-5.2 as concrete edits, so the reviewers can verify them without re-deriving the line references. **(v1.1, SE F-05)** The FSPEC cites by **enclosing symbol + distinctive literal**, and records the HEAD sha its references were taken at, exactly as this REQ's `Citation baseline` row now does. A bare `file:line` citation is a defect in that document. |
| O-17 *(v1.1, TE F-01 / SE F-07)* | FSPEC | The **persisted-verdict grammar** required by AC-4.2: where in the cross-review file the verdict field lives, its exact syntax, the closed catalogue of values, how the three review SKILLs are amended to emit it, and how it is extracted. Must specify the fail-closed behavior of AC-4.2a for absent / duplicated / unparseable fields, and the treatment of legacy artifacts that predate the field. |
| O-18 *(v1.1, TE F-04; extended v1.2, TE-v2 Q-01)* | FSPEC | How the "same round index" of AC-4.1a is established from artifacts — pairing each role's file for a round and requiring both to be approving — including the case where one role's file for that round is missing. **(v1.2)** Must state the **role-asymmetric branch** explicitly: AC-1.1 computes the index per (feature, document type) *across roles*, so a branch where SE reached v13 while TE wrote only v1 gives TE a next index of v14 and no TE file at all for v2–v13. A role's absent `-vN` is treated as **not approving** for that round (fail-closed, consistent with AC-4.2a), so a gap can never pair into an approval; the FSPEC must say so rather than leave it to be inferred. |
| O-19 *(v1.1, AC-3.1/AC-3.5; extended v1.2 and v1.3)* | FSPEC / TSPEC | Where `MAX_AUTHORING_WRITE_BYTES`, `MAX_AUTHORING_ATTEMPTS` and `MAX_AUTHORING_DISPATCHES` live (SKILL prose vs. workflow constant), and the oracles for AC-3.5d's two distinct exhaustion reports against the script-owned counters — never against a runtime counter (§4a A-2). **(v1.2)** Must include the negative case TE-v2 F-01 named: an artifact that acquires one AC-3.4-satisfying section per dispatch **must not** halt, and the positive case for AC-3.5c's reset (no-progress, no-progress, progress, no-progress ⇒ still running). Both counting rules must be exercised: consecutive-with-reset, and the cumulative cap. **(v1.3)** Three further obligations. (a) *TE-v3 F-03:* the phrase "how the pacing bound of AC-3.1a is checked in review" is **withdrawn** — §4a A-9 measured that it cannot be checked from the script. What the FSPEC/TSPEC must specify instead is the **commit-diff proxy** (a per-section commit whose diff exceeds `MAX_AUTHORING_WRITE_BYTES` is a reported violation; O-20 owns the check) and an explicit statement that no oracle for emitted bytes exists. (b) *TE-v3 F-01:* oracles for **mode selection** (AC-3.5's two-mode table) and for the revision-mode negative case — a feedback-addressing dispatch on an already-complete artifact that edits it **must not** score no-progress, and three consecutive such dispatches **must not** halt the phase. (c) *TE-v3 F-02 / SE-v3 F-03:* oracles for the **episode scope** — a five-round convergence with one dispatch per round must not trip `MAX_AUTHORING_DISPATCHES`, both counters must read zero at the start of each new round and of each fresh invocation, and an AC-3.5f exhaustion must be asserted to write **no** POSTMORTEM while still committing the `halted` row. |
| O-20 *(v1.1, AC-3.2a; extended v1.3)* | FSPEC | The per-section commit contract: the message form, staging scope, and the behavior when a commit fails mid-document (which must not leave the artifact looking structurally complete, AC-3.4). **(v1.3, TE-v3 F-03)** Additionally owns the **commit-diff proxy** for AC-3.1a: how a per-section commit's diff size is measured, the threshold it is compared against (`MAX_AUTHORING_WRITE_BYTES`), where the violation is reported, and — explicitly — that the proxy is advisory evidence of coarse pacing and is **not** an oracle for emitted bytes (§4a A-9), so it must not halt a run on its own. |
| O-21 *(v1.2, AC-4.2b; extended v1.3)* | FSPEC | The **approval-record grammar** in `LEARNINGS-{feature}.md`: where the table sits, its columns, how `harvest-learnings` derives it from the artifacts it is about to delete, the tier-1/tier-2 precedence of AC-4.2b, and the behavior when LEARNINGS exists without the record (AC-4.2c) or with a record that disagrees with a surviving cross-review. Must share the closed catalogue of AC-4.3 with O-17's persisted field — one catalogue, two carriers. **(v1.3, SE-v3 F-01)** The column set is no longer O-21's to discover: AC-4.2b now fixes it at REQ altitude as document type, round index, role, verdict value, **approval-time content hash of the reviewed document**, and **approving commit sha**. O-21 specifies the hash **algorithm and canonicalisation** (what bytes are hashed — the document file as committed, byte-for-byte, is the expected answer), the field syntax, and the **derivation procedure**: harvest must compute the hash from the document on disk and read each verdict from the file it is about to delete, never narrate either from memory (§4a A-7 records harvest already mis-stating what it deleted in the adjacent row). Must also specify the unparseable-hash case (AC-4.2a, phase runs) and the guard ordering fixed by AC-4.2c — the record is best-effort, `guard-harvest-before-delete` is not tightened, so the falsifying test is that a record-less LEARNINGS **passes** the guard and then fails closed. |
| O-22 *(v1.2, AC-3.5e / §4a A-8)* | TSPEC / PROPERTIES | Oracles for the abnormal-termination path: a dispatch seam that can be made to throw, to return nothing, and to return normally without advancing, with the assertion that all three produce the same attempt accounting and the same operator-facing report shape. This is the path §H-3 actually took, so it is not an optional fixture. |

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
| CROSS-REVIEW-software-engineer-REQ-v2 F-01 (Phase H deletes AC-4.2's evidence) | §4a A-7, AC-4.2b, AC-4.2c, AC-2.3b worked examples A/B, `Targets` (`harvest-learnings`), R-6, R-8, O-21 |
| CROSS-REVIEW-software-engineer-REQ-v2 F-02 (bound's referent: authored vs emitted bytes) | AC-3.1, AC-3.1a |
| CROSS-REVIEW-software-engineer-REQ-v2 F-03 (dispatch that does not return normally) | AC-3.5e, §4a A-8, O-22 |
| CROSS-REVIEW-software-engineer-REQ-v2 F-04 + test-engineer-REQ-v2 F-04 (derivation does not reproduce) | AC-3.1 Derivation row |
| CROSS-REVIEW-software-engineer-REQ-v2 F-05 (Citation baseline overstated) | Header `Citation baseline` row |
| CROSS-REVIEW-software-engineer-REQ-v2 F-06 (rebase cost understated) | AC-3.2a |
| CROSS-REVIEW-test-engineer-REQ-v2 F-01 (progress predicate saturated by the skeleton) | AC-3.5a, O-7, O-19 |
| CROSS-REVIEW-test-engineer-REQ-v2 F-02 (no counting rule, no total bound) | AC-3.5c, `MAX_AUTHORING_DISPATCHES` declaration, AC-3.5d, O-19 |
| CROSS-REVIEW-test-engineer-REQ-v2 F-03 (approximate line co-bound) | AC-3.1 threshold declaration (co-bound deleted) |
| CROSS-REVIEW-test-engineer-REQ-v2 F-05 (force-run vs AC-2.3) | AC-4.6a |
| SE-v2 Q-01 / Q-02 / Q-03, TE-v2 Q-01 / Q-02 | AC-4.2b (durable carrier), AC-1.4a, AC-4.7a, O-18 (role-asymmetric gap), AC-3.2b |
| CROSS-REVIEW-test-engineer-REQ-v3 F-01 (progress predicate saturated from above on revision dispatches) | AC-3.5 scope + two-mode table, AC-3.5a limbs 1–3, AC-3.5b, O-7, O-19(b), R-9 |
| CROSS-REVIEW-test-engineer-REQ-v3 F-02 + software-engineer-REQ-v3 F-03 (`MAX_AUTHORING_DISPATCHES` scope, reset, and halt classification) | AC-3.5c (episode scope, reset scope, AC-1.6 consistency), AC-3.5f, `MAX_AUTHORING_DISPATCHES` declaration, AC-2.1, O-19(c) |
| CROSS-REVIEW-test-engineer-REQ-v3 F-03 (AC-3.1a has no oracle) | AC-3.1a **Enforceability**, §4a A-9, C-1, `MAX_AUTHORING_WRITE_BYTES` Owner row, O-19(a), O-20 |
| CROSS-REVIEW-test-engineer-REQ-v3 F-04 (no success/continuation condition) | AC-3.5b |
| CROSS-REVIEW-test-engineer-REQ-v3 F-05 (skeleton carve-out contradicts its predicate) | AC-3.5a limb 2 |
| CROSS-REVIEW-software-engineer-REQ-v3 F-01 (tier-2 record has no temporal anchor) | AC-4.2b (content hash + commit sha, derivation-by-measurement), AC-4.4, O-8, O-14, O-21 |
| CROSS-REVIEW-software-engineer-REQ-v3 F-02 (example B offers a forbidden, inert route) | AC-2.3b worked example B |
| CROSS-REVIEW-software-engineer-REQ-v3 F-04 (per-dispatch arithmetic does not divide) | `MAX_AUTHORING_DISPATCHES` Derivation row |
| CROSS-REVIEW-software-engineer-REQ-v3 F-05 (replace-shaped edit emits match + replacement) | AC-3.1a |
| SE-v3 Q-01 / Q-02, TE-v3 Q-01 / Q-02 | AC-3.5c (reset scope), AC-4.2b (mixed provenance fails closed), AC-4.2c (guard not tightened), AC-3.5c (re-entry reset) |
