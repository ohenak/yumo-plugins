# PDLC Queue — yumo-plugins

Serial, dependency-respecting feature queue driven by `/pdlc:orchestrate-queue`.
The driver picks the next **ready** entry (lowest `Order` first) whose dependencies are
merged into the base, sets it `in-progress`, runs `orchestrate-dev`, then leaves it
`awaiting-merge`. A human sets `done` after merging the PR. `ready: true` in the REQ
frontmatter is the pickup gate; the `Status` cell tracks lifecycle.

> **This queue is the pipeline's own queue.** Every feature here modifies the pipeline that
> executes it. See §Bootstrapping below — this queue has one constraint no consumer queue has.

> **Rows 0 (`pdlc-review-loop-hardening`) and 1 (`pdlc-workflow-distribution`) were removed
> from this table on 2026-07-30.** Both merged — row 1 as `1fb6cbe` (#19/#21, 2026-07-29), row 0
> as `7bc559a` (#23, 2026-07-30) — and their per-feature docs moved to
> `docs/completed/pdlc-workflow-distribution/` and `docs/completed/pdlc-review-loop-hardening/`.
> Their detailed queue history (halts, harness defects H-1–H-4, the original `row 8 → 0`
> reprioritisation) moved with them to `docs/completed/QUEUE-HISTORY-rows-0-1.md`. `Order` values
> are allocated, never reused — with one deliberate exception, immediately below: `Order 0` is
> reused for `pdlc-review-convergence`. It is safe because the table's own prior "row 0" / "row 1"
> terminology moved to that archive along with the rows themselves, so no live document still uses
> "row 0" to mean the retired feature. `Order` is the pickup key, not a stable identity — the
> feature name is.

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 0 | halted | pdlc-review-convergence | docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md | pdlc-review-loop-hardening |
| 2 | pending | pdlc-merge-phase | docs/pdlc-merge-phase/REQ-pdlc-merge-phase.md | pdlc-workflow-distribution |
| 3 | pending | pdlc-advisory-tier | docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md | pdlc-merge-phase |
| 4 | pending | pdlc-consolidation-agent | docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md | pdlc-workflow-distribution, pdlc-advisory-tier |
| 5 | pending | pdlc-engineering-loop | docs/pdlc-engineering-loop/REQ-pdlc-engineering-loop.md | pdlc-workflow-distribution, pdlc-merge-phase, pdlc-advisory-tier, pdlc-consolidation-agent |
| 6 | blocked | pdlc-install-mechanism | docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md | pdlc-workflow-distribution |
| 7 | blocked | pdlc-release-ci | docs/pdlc-release-ci/REQ-pdlc-release-ci.md | pdlc-workflow-distribution |
| 9 | blocked | pdlc-authoring-contract | docs/pdlc-authoring-contract/REQ-pdlc-authoring-contract.md | pdlc-review-loop-hardening |

**Order 0 — `pdlc-review-convergence` — added 2026-07-30, ahead of orders 2-9.** Same
self-referential argument that put the previous `Order 0` (`pdlc-review-loop-hardening`) ahead of
everything: this feature further hardens the review-loop machinery every other row runs through —
round-budget cap, enforced fixed-point stop, verifier-round topology, revision-size bound,
measurement-required routing, mechanised citation checking (see its REQ §1, §5). Landing it before
rows 2-9 means they run through a harness that already carries these fixes; landing it after means
every one of them pays whatever cost these changes are measuring against. `ready: true`, depends on
`pdlc-review-loop-hardening` (merged, `7bc559a`).

Row 6 is the successor binding for `pdlc-workflow-distribution` deferrals D-DIST-01, D-DIST-02,
D-DIST-03 and D-DIST-05 (full `pdlc install`, loading workflows from the plugin path with no copy,
auto-sync, and detecting a plugin cache behind the marketplace). It is `blocked` — its REQ is not
authored yet, so `orchestrate-queue` never picks it up — but it exists so those deferrals are bound
to a queue row rather than to prose intent.

Row 7 is the successor binding for `pdlc-workflow-distribution` deferral D-DIST-06: hosted CI and
release automation on `yumo-plugins`. Same convention as row 6 — `blocked`, REQ not yet authored,
present so the deferral is bound.

Row 9 (**added 2026-07-30**) is the successor binding for three deferrals `pdlc-review-loop-hardening`
carries out of its TSPEC review. **`Order 9`, not 8**: `Order 8` was `pdlc-review-loop-hardening`'s
number before its 2026-07-29 reprioritisation to `Order 0` (see
`docs/completed/QUEUE-HISTORY-rows-0-1.md`), so reusing 8 here would make existing cross-document
references resolve to the wrong feature — the exact drift DC-07 and DC-12 were promoted about.
`Order` values are allocated, never reused (the one documented exception is `Order 0` above). Same
convention as rows 6 and 7 (`blocked`, REQ not yet authored, present so the deferrals are bound to a
row rather than to prose owners, per `DC-08`). All three are the *same* underlying gap: **the six
author/review SKILLs are the authoring interface, and they declare nothing machine-readable about
what they produce**, so the workflow script re-states their contract from the outside and the two
can drift.

- **Q-09 — the acute one, and the reason this row exists at all.** `orchestrate-dev.js` §5.9 holds
  per-class top-level heading lists used to score a document structurally complete; the templates
  authors actually follow live in the SKILLs. Drift between them scores a correct document
  incomplete, which under `pdlc-review-loop-hardening`'s mechanism is a **false halt** — a live
  failure risk, not a tidiness item. That feature mitigates but does not close it: its
  `completeness.test.js` fixtures are copied from the SKILL templates verbatim, so a drift reds the
  suite rather than a run. Closing it means the SKILLs declaring the heading template themselves.
- **T-Q-03** — `MAX_AUTHORING_WRITE_BYTES` has no oracle; the per-write byte cap is enforced only by
  agent compliance, with `pdlc-review-loop-hardening`'s commit-diff proxy advisory. Same shape: a
  contract the script states and the SKILL does not. Revisit with measured non-compliance data.
- **Q-05** — whether `harvest-learnings`' approval-record heading is pinned by name or renumbers if
  a sixth prose section is added. `pdlc-review-loop-hardening` tolerates either (its matcher
  normalises numeric prefixes), so there is no product exposure today; the question is the SKILL's
  contract.

Scope this row's REQ to *declaring* those contracts in the SKILLs, not to re-implementing
`pdlc-review-loop-hardening`'s mechanism — the mechanism is correct, it is the interface that is
undeclared. It depends on `pdlc-review-loop-hardening` because all three items are stated against
machinery that feature introduces.

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

## Priority rationale (2026-07-27 — closing the engineering loop)

Master plan: `docs/design/MASTER-PLAN-engineering-loop.md` (four breaks, DEC-E1..E5, the
residual operator surface, OQ-E1..E4).

This rationale was written when the queue held five rows (1-5) and predates the two
`Order 0` review-hardening features described above; the ordering argument among the rows below —
now `pdlc-merge-phase` (2) through `pdlc-engineering-loop` (5), `pdlc-workflow-distribution` having
since merged and been archived — is otherwise unchanged.

**Order 1 (`pdlc-workflow-distribution`) before order 2, despite order 2 being the more valuable
feature.** `pdlc-merge-phase` is the largest single latency win — it is what lets an unattended
`/loop` deliver more than one feature. But it is a *workflow script* change, and workflow scripts
reach consumers through a runtime copy that, when this queue was written, had to be refreshed by
hand — both orchestrator SKILLs recorded that as the standing convention. Shipping the merge phase
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

**Pickup state.** Rows 2 through 5 (the four remaining REQs from the original 2026-07-27 batch)
and the newly added `pdlc-review-convergence` are all `ready: true`. Ordering is enforced by the
`Depends-On` column plus each REQ's `depends-on` and the Phase-0 readiness triage — a dependent is
skipped until its dependency is merged and a human has set that row `done`.

## Bootstrapping

Every feature in this queue modifies the pipeline that builds them. Two consequences:

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
