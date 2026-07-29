# PDLC Queue — yumo-plugins

Serial, dependency-respecting feature queue driven by `/pdlc:orchestrate-queue`.
The driver picks the next **ready** entry (lowest `Order` first) whose dependencies are
merged into the base, sets it `in-progress`, runs `orchestrate-dev`, then leaves it
`awaiting-merge`. A human sets `done` after merging the PR. `ready: true` in the REQ
frontmatter is the pickup gate; the `Status` cell tracks lifecycle.

> **This queue is the pipeline's own queue.** Every feature here modifies the pipeline that
> executes it. See §Bootstrapping below — this queue has one constraint no consumer queue has.

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 1 | awaiting-merge | pdlc-workflow-distribution | docs/pdlc-workflow-distribution/REQ-pdlc-workflow-distribution.md | — |
| 2 | pending | pdlc-merge-phase | docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md | pdlc-workflow-distribution |
| 3 | pending | pdlc-advisory-tier | docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md | pdlc-merge-phase |
| 4 | pending | pdlc-consolidation-agent | docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md | pdlc-workflow-distribution, pdlc-advisory-tier |
| 5 | pending | pdlc-engineering-loop | docs/pdlc-engineering-loop/REQ-pdlc-engineering-loop.md | pdlc-workflow-distribution, pdlc-merge-phase, pdlc-advisory-tier, pdlc-consolidation-agent |
| 6 | blocked | pdlc-install-mechanism | docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md | pdlc-workflow-distribution |
| 7 | blocked | pdlc-release-ci | docs/pdlc-release-ci/REQ-pdlc-release-ci.md | pdlc-workflow-distribution |
| 8 | blocked | pdlc-review-loop-hardening | docs/pdlc-review-loop-hardening/REQ-pdlc-review-loop-hardening.md | pdlc-workflow-distribution |

Row 6 is the successor binding for `pdlc-workflow-distribution` deferrals D-DIST-01, D-DIST-02,
D-DIST-03 and D-DIST-05 (full `pdlc install`, loading workflows from the plugin path with no copy,
auto-sync, and detecting a plugin cache behind the marketplace). It is `blocked` — its REQ is not
authored yet, so `orchestrate-queue` never picks it up — but it exists so those deferrals are bound
to a queue row rather than to prose intent.

Row 7 is the successor binding for `pdlc-workflow-distribution` deferral D-DIST-06: hosted CI and
release automation on `yumo-plugins`. Same convention as row 6 — `blocked`, REQ not yet authored,
present so the deferral is bound.

**Updated 2026-07-29 (Phase DOD, DOD-14).** The parenthetical here previously read "`.github/`
does not exist today, so `cd pdlc/workflows && npm test` is the only automated verification
surface". That is no longer true: `.github/workflows/pr-tests.yml` landed out-of-band in `3ef6ac7`
with four PR-level jobs (unit tests on ubuntu + macos, generated-artifact freshness, fresh-clone
bootstrap, shell-script syntax and index modes). Two consequences for whoever picks this row up:

- **D-DIST-06 is partially discharged, not closed.** The *test* half now exists; the **release
  automation** half does not (no tag/publish workflow, no marketplace step). Row 7 stays
  `blocked` for that remainder — but scope its REQ to release automation, and treat the PR-test
  gate as existing infrastructure to build on rather than something to author from scratch.
- **The jobs are proven as of 2026-07-29, but only after two Linux-only fixes.** The note above
  originally read "the jobs are unproven … the Linux half of the matrix in particular has never
  run". PR #19 was the workflow's first-ever execution, and the Linux leg went **red on that first
  run** — 18 failures, none reproducible on macOS, both causes fixed in `a8ac055`:
  - `sync-workflows.sh` used `${#ARR[@]:-0}`, which is not a defaulting expansion. Bash 3.2 (macOS)
    tolerates it silently; bash 5 (Linux) rejects it as `bad substitution` and aborts the script
    mid-run, dropping the exit code from FSPEC §5.8's 4 to 2/1 on every write-failure case
    (17 of the 18). `check-workflow-drift.sh` already documented this exact lesson at two sites —
    this was a missed occurrence, not a new discovery. Grep now confirms zero remaining.
  - `driftLadder.test.js` used a bare inode-number comparison as the unlink-vs-in-place oracle.
    APFS allocates inode numbers monotonically, so the test passed there; ext4/overlayfs hands a
    freed number straight back to the next allocation, so rung (ii) landed and the number was
    unchanged. Fixed by hard-linking the file first, which prevents the inode from being freed at
    all and makes the comparison sound on every filesystem.
  Take the general lesson, not just the two fixes: **macOS-green says nothing about Linux** for
  this codebase, because the shell dialect and the filesystem both differ. Reproduce Linux locally
  in a `node:20` container (non-root — running as root bypasses the permission-bit fixtures and
  skews the result) rather than iterating through PR pushes.

Row 1 is `awaiting-merge` as of 2026-07-29: the pipeline ran to the end of Phase PUB and raised
https://github.com/ohenak/yumo-plugins/pull/19, whose five PR checks are green at `a8ac055`.
`awaiting-merge → done` is a human step — this PR trips the self-modification convention in
§Bootstrapping (it touches `pdlc/workflows/**` and `pdlc/skills/**`) and is never auto-merged.
One item is left for human disposition rather than resolved: **DoD-15** — the 206 lines of
`.github/workflows/pr-tests.yml` landed out-of-band in `3ef6ac7` and passed no pdlc phase, so the
CI gate itself is unspecified and unreviewed even though it now demonstrably works.

Row 1 was previously `halted` twice, for two different reasons — both now resolved history, not the
current state:

The first halt was Phase R hitting the 5-iteration ceiling twice (REQ v3–v13, 24 cross-reviews)
without dual approval (`POSTMORTEM-R-pdlc-workflow-distribution.md` v2.1, R-0). On 2026-07-28 the
REQ was rewritten as v14.0 at requirements altitude — product scope accepted per R-1,
specification-grade material moved to §10 downstream obligations per R-2. The de-escalation worked:
the next run converged in four rounds (v14→v17) with blocking findings descending 1H/1M → 1H/1M →
1H/1M → **0H/0M**, against the flat 8–10 band of the preceding ten rounds. **REQ v17.0 carries dual
approval** — SE `e1a627f`, TE `a82365e`, both *Approved with minor changes*.

The second halt was Phase F, and it was infrastructure, not content: six `pm-author` attempts were
each killed by the runtime stall watchdog mid-`Write`, producing no FSPEC (row 8, H-3). Re-entering
at the time would also have re-run all four approved Phase-R rounds (row 8, H-4). Row 8's harness
fixes remain the recommended precondition for further Phase F attempts on this row, whether or not
it has already resumed.

Row 8 binds four harness defects — the two from post-mortem R-3/R-4 plus two found during the
2026-07-28 run. Its REQ **is authored** (v1.0, `ready: true`); the row stays `blocked` until a human
sets it `pending`, which is the only thing standing between it and pickup.

- **H-1 (R-3)** — the review loop dispatched a wrong iteration index eleven consecutive rounds. It
  must derive the index from the highest `CROSS-REVIEW-{role}-{doc}-v{N}` on the branch and refuse
  to overwrite an existing review file. Today `reviewLoop` always starts at 1 and does no directory
  listing at all, so the review record survived only because reviewer agents overrode the
  instruction.
- **H-2 (R-4)** — the non-convergence exit is not terminal. On writing a POSTMORTEM the pipeline
  must set the queue row `halted` **and commit it** (neither orchestrator does any git today), and
  must refuse to re-enter a phase whose unresolved POSTMORTEM exists on the branch, surfacing its
  Recommendation section at phase entry.
- **H-3 (new)** — monolithic document authoring is unsurvivable under the runtime's 180 s
  no-progress stall watchdog. Phase F of the 2026-07-28 run spent ~71 minutes and ~1.34 M subagent
  tokens on six identical `pm-author` attempts, each killed mid-`Write`, producing zero bytes. The
  watchdog is runtime-side and not configurable from this repo, so authoring must become
  incremental and resumable, and a no-progress exhaustion must be reported as such.
- **H-4 (new)** — there is no approved-phase skip. `REQ-pdlc-workflow-distribution` v17 carries dual
  approval, yet re-entering the pipeline to reach Phase F would re-run all four Phase-R rounds
  first, at Opus rates, risking a `needs revision` verdict on a settled document.

Targets: `pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/orchestrate-queue.js`, both
orchestrator SKILLs and the three author SKILLs; bundles rebuilt in the same commit. **This row
should be landed before row 1's next Phase F attempt** — three of the four full runs on this branch
died to harness defects rather than to the work.

## Priority rationale (2026-07-27 — closing the engineering loop)

Master plan: `docs/design/MASTER-PLAN-engineering-loop.md` (four breaks, DEC-E1..E5, the
residual operator surface, OQ-E1..E4).

**Order 1 before order 2, despite order 2 being the more valuable feature.**
`pdlc-merge-phase` is the largest single latency win — it is what lets an unattended `/loop`
deliver more than one feature. But it is a *workflow script* change, and workflow scripts reach
consumers through a runtime copy that, when this queue was written, had to be refreshed by hand —
both orchestrator SKILLs recorded that as the standing convention. Shipping the merge phase
into that channel is how a fix gets merged, archived, and never runs. Distribution first:
`pdlc-workflow-distribution` replaces the hand refresh with `build-runtime.mjs` emitting into
`pdlc/workflows/dist/` and `sync-workflows.sh` installing the consumer's runtime copy.

**Order 3 after order 2** because the advisory tier's most valuable seam (A5, CI failure
triage-and-fix) and the merge phase's preconditions interact directly: the fix-and-re-poll loop
feeds the merge gate.

**Order 4 after 1 and 3** because a cross-repo promotion that cannot be distributed is not a
promotion (BL-02), and because the consolidation agent runs on the advisory model rung and
consumes the advisory record that order 3 produces.

**Order 5 last** — it is the integration of 1–4 and has no standalone value; its central
acceptance criterion (AC-1.3, a dependent feature picked up with no human turn) is simply false
without order 2.

**Pickup state.** All five REQs are `ready: true`. Ordering is enforced by the `Depends-On`
column plus each REQ's `depends-on` and the Phase-0 readiness triage — a dependent is skipped
until its dependency is merged and a human has set that row `done`.

## Bootstrapping

These five features modify the pipeline that builds them. Two consequences:

1. **Ship pipeline changes between queue iterations, never during one.** The consumer copy of a
   workflow script is loaded at invocation, so an in-flight run uses the pre-change script; the
   risk window is a run *started* during the edit.
2. **Every PR in this queue trips `pdlc-merge-phase` REQ-MERGE-03's self-modification guard** once
   that feature exists — every one of them touches `pdlc/workflows/**` or `pdlc/skills/**`. That
   is correct and intended: this queue is permanently operator-merged. The guard is not a
   temporary state to be relaxed later; it is the reason the loop can be trusted with everything
   else.

## Blocked / evidence-gated

- **Order 3 (`pdlc-advisory-tier`) carries one unverified premise.** The Fable 5 model alias for
  the workflow runtime's `agent()` `model` option is unconfirmed (master plan OQ-E1); existing
  constants use bare aliases (`"opus"`, `"sonnet"`, `"haiku"`) and no `fable` reference exists
  anywhere in this repo as of 2026-07-27. REQ-ADV AC-1.2/AC-1.3 handle this by construction —
  Fable is the intended and recommended rung, Opus is a *declared* fallback whose use is warned,
  recorded and reported (never a silent downgrade), and AC-1.4 keeps a wholly unresolvable
  configuration a startup failure. Confirming the alias is still the first task of implementation,
  not a discovery to be made at the end.

## Ideas backlog

`docs/ideas/loop-automation-ideas.md` holds unbuilt scheduled-automation ideas. Three of its
items are absorbed by this queue and should be marked shipped when the corresponding feature
lands: idea 2 (post-PR maintenance loop) by `pdlc-advisory-tier` seam A5 plus `pdlc-merge-phase`;
idea 4 (scheduled consolidate-learnings) by `pdlc-consolidation-agent`. Ideas 3, 5, 6 and 7 remain
unbuilt and are bound as deferrals in `pdlc-engineering-loop` §7.
