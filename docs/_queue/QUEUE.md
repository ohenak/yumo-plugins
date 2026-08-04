# PDLC Queue — yumo-plugins

Serial, dependency-respecting feature queue driven by `/pdlc:orchestrate-queue`.
The driver picks the next **ready** entry (lowest `Order` first) whose dependencies are
merged into the base, sets it `in-progress`, and runs `orchestrate-dev`, which now ends in
Phase MERGE: if it merges the PR the row goes straight to `done`, otherwise it leaves the row
`awaiting-merge` for a human to set `done` after merging (this queue's rows always take the
human path — see §Bootstrapping). `ready: true` in the REQ frontmatter is the pickup gate; the
`Status` cell tracks lifecycle.

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

> **Row 13 (`pdlc-merge-phase`) was removed from this table on 2026-08-02.** Merged as
> `b5d68c2` (#30, 2026-08-02) and its per-feature docs moved to
> `docs/completed/pdlc-merge-phase/`, LEARNINGS included. This is the feature that added Phase
> MERGE itself. Its dependents (rows 14 and 16) resolve through the readiness triage — a
> dependency absent from the table is checked against the base branch, exactly as rows 6/7/15/16
> already do for `pdlc-workflow-distribution`. Prose below that says "rows 13, 14 and 16" is
> historical record and keeps its meaning: the feature name, not the row, is the identity.

| Order | Status | Feature | REQ Path | Depends-On |
|-------|--------|---------|----------|------------|
| 14 | pending | pdlc-advisory-tier | docs/pdlc-advisory-tier/REQ-pdlc-advisory-tier.md | pdlc-merge-phase |
| 15 | pending | pdlc-consolidation-agent | docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md | pdlc-workflow-distribution, pdlc-advisory-tier |
| 16 | pending | pdlc-engineering-loop | docs/pdlc-engineering-loop/REQ-pdlc-engineering-loop.md | pdlc-workflow-distribution, pdlc-merge-phase, pdlc-advisory-tier, pdlc-consolidation-agent |
| 6 | blocked | pdlc-install-mechanism | docs/pdlc-install-mechanism/REQ-pdlc-install-mechanism.md | pdlc-workflow-distribution |
| 7 | blocked | pdlc-release-ci | docs/pdlc-release-ci/REQ-pdlc-release-ci.md | pdlc-workflow-distribution |
| 9 | blocked | pdlc-authoring-contract | docs/pdlc-authoring-contract/REQ-pdlc-authoring-contract.md | pdlc-review-loop-hardening |

**Rows 0, 10, 11, 12, 17 and 18 removed 2026-08-02 by operator direction.** The `pdlc-rcv` family
(rows 10–12, 17, 18 — the five-way split of the superseded row 0, `pdlc-review-convergence`) is
**abandoned**, not shipped: its process cost proved disproportionate to its code delta (see
`docs/discarded/pdlc-rcv-budget-stop/LEARNINGS-pdlc-rcv-budget-stop.md` §4). `pdlc-rcv-budget-stop`
was harvested and its surviving artifacts moved to `docs/discarded/pdlc-rcv-budget-stop/`; the
other family dirs (`pdlc-rcv-finding-quality`, `pdlc-rcv-fixed-point-stop`,
`pdlc-rcv-panel-topology`, `pdlc-rcv-reset-region`) and `pdlc-runtime-measurement-spike` moved to
`docs/discarded/` unharvested on the same date. The
family's *intent* — bounded review rounds, a deterministic stop, an operator clearance — is to be
absorbed by the `orchestrate-dev` closed-loop rewrite carried by rows 13, 14 and 16
(`pdlc-merge-phase`, `pdlc-advisory-tier`, `pdlc-engineering-loop`). `Order` values stay
allocated-never-reused; the prose notes below this line describing the removed rows are historical
record.

**Row 18 — the altitude split of row 10 — added 2026-08-01 to resolve a non-convergent Phase R.**
Row 10's Phase R ran the five-round ceiling without a dual approval and wrote
`docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md`. Its root causes 1 and 3 are that
`REQ-RCV-01` converged as a *requirements* artifact by round 2 and then spent three rounds failing to
converge as an *implementation* one: **AC-1.5(4) was the only clause to generate a blocking finding
after round 2**, because its correctness is decided by shipped control flow a REQ cannot restate. Per
the postmortem's own R-3/R-4, that clause's validation algorithm, refusal semantics, repair taxonomy,
byte-confirmation and render rows were relocated into a new REQ — `REQ-RCV-07`,
`pdlc-rcv-reset-region` — and `REQ-pdlc-rcv-budget-stop` was reissued at **v2.0** (486 lines / 61,101
bytes → 477 / 52,052) stating *the region validates* as a named predicate with its fail-closed
outcome. The new REQ is 505 lines / 52,627 bytes. Both now sit under the **90 % soft threshold**
(630 lines / 55,296 bytes), not against the hard ceiling. No requirement id, AC id or `S-*` id changed
meaning, and the catalogue stays closed at seventeen, so existing cross-references resolve.

**Row 10's Status is left `halted`,** deliberately: the split addresses the postmortem's findings but
does not clear it. An operator or an agent that has verified the findings addressed writes
`RESOLVED: yes` into the POSTMORTEM (per CLAUDE.md's post-mortem lifecycle; the workflow scripts
never do), and the phase stays refused until one does. (Historical note: this row's marker was
operator-set on 2026-08-01, when the rule was still human-only.)

**Why `Order 18`, and why no existing row's `Depends-On` changed.** `Order` values are allocated and
never reused; 18 is the next free. Row 18 depends on row 10 alone — its criteria are stated over that
REQ's region, counts and clearance gate. **Rows 11, 12 and 17 were checked against the moved material
and none gains an edge:** `pdlc-rcv-fixed-point-stop` (17) and `pdlc-rcv-panel-topology` (11) *cite*
row B and the phase-refusal shape — as a schema note and as a contrast respectively — but **consume**
only `W`, the reset region, the halt path and `MAX_REVIEW_ROUNDS`, every one of which stays in
`REQ-RCV-01`; `pdlc-rcv-finding-quality` (12) touches none of it. Their citations were repointed at
`REQ-RCV-07` where a clause moved, which is a reference fix, not a dependency. Net pickup order:
**10 → 12 → 18 → 17 → 11**, with 18 ahead of 17 by `Order` and both free of each other.

**Reprioritisation 2026-08-01 — rows 10–12 moved to the head of the queue.** The pickup key is
the numeric `Order` (lowest `pending` first), and values `0`/`1` are retired, so the split rows
could not take a lower number without reusing one. Instead the four rows behind them were
renumbered to fresh, never-used values — `pdlc-merge-phase` 2→13, `pdlc-advisory-tier` 3→14,
`pdlc-consolidation-agent` 4→15, `pdlc-engineering-loop` 5→16 — preserving their relative order.
No value was reused; prose elsewhere that says "orders 2–5" refers to these four features under
their old numbers. Rationale: same self-referential argument as the previous `Order 0` entries —
rows 10–12 harden the review loop every other row runs through, so they go first.

**Row 17 — the second `pdlc-rcv` split — added 2026-08-01 by a REQ size audit.** Rows 10–12 were
authored the same day by splitting the 2,629-line `pdlc-review-convergence` REQ. An audit of every
REQ in this table against the pm-author **REQ Size Budget** (target 300–500 lines; hard ceiling 700
lines **or 60 KB**) then found two of them still over the ceiling on the *byte* half, which the
line count had hidden:

| REQ | Before | After | Remedy |
|---|---|---|---|
| `pdlc-rcv-budget-stop` | 581 lines / 83 KB | 410 lines / 47 KB | split at the REQ-RCV-01 / REQ-RCV-02 seam → **row 17** `pdlc-rcv-fixed-point-stop` (424 lines / 41 KB), plus the shared-context extraction below |
| `pdlc-rcv-panel-topology` | 489 lines / 64 KB | 491 lines / 59 KB | **no split** — 4% over, and its two requirements must ship together. Shared-context extraction plus removal of one duplicated narrative |

The extraction is the skill's step 4: the family vocabulary, the closed catalogue `S-1 … S-17` and
the run-report row schema now live once in `docs/_constraints/pdlc-rcv-catalogue.md`, and every
child REQ cites ids rather than restating grammar that can then drift. No requirement id, AC id or
`S-*` id changed in either remedy, so existing cross-references resolve.

**Why `Order 17` and not a number between 10 and 11.** `Order` values are allocated and never
reused, and every integer below 13 is spent (0–1 retired, 2–5 renumbered to 13–16, 6–9 allocated,
10–12 in use), so the new row could not take a lower number without reusing one. It does **not**
need one: `Order` only breaks ties among rows whose dependencies are already satisfied, and the
`Depends-On` column plus the REQ's own `depends-on` is what enforces sequence. Row 11 now depends
on **both** stop REQs, so the Phase-0 readiness triage skips it until row 17 is `done`; row 17
depends on row 10 and is otherwise free. Row 12 is unchanged — `pdlc-rcv-finding-quality` depends
on row 10 only, for the shared definitions, and can land before or after row 17. The net pickup
order is therefore **10 → 12 → 17 → 11**, dependency-correct, with no renumbering of rows 13–16.

**Rows 10–12 — the `pdlc-review-convergence` split — added 2026-08-01, and row 0 set `superseded`.**
`docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` reached **2,629 lines / 311 KB at v1.8**
and ran **nine review rounds without convergence** — every round closed every prior finding and filed
new ones in the text that answered them, which is the very failure mode (P-1) the document analyses.
It was too large for the review loop to converge on, so it has been **split into three phased REQs
plus one shared read-only reference**, `docs/_constraints/pdlc-rcv-baseline.md`. The six requirement
ids are carried forward **unchanged** (`REQ-RCV-01`…`06`), each appearing in exactly one successor:
`pdlc-rcv-budget-stop` carries 01, `pdlc-rcv-fixed-point-stop` carries 02 (see the 2026-08-01
size-audit note below — 01 and 02 were one row until that audit), `pdlc-rcv-panel-topology` carries
03–04 (verifier topology, revision-size bound), `pdlc-rcv-finding-quality` carries 05–06
(measurement routing, mechanised citation checking).

Ordering: **10 before 11**, because the panel and growth rules are stated over the window origin `W`,
the reset region and the report schema that row 10 defines — shipping 11 first would leave them
stated over a window nothing defines. **12 is independent of 11** and depends on 10 only so the three
documents share one definition of *unavailable* / *malformed* and one report surface. Row 0's REQ is
now `ready: false` and carries a `SUPERSEDED` banner naming these three; its `CROSS-REVIEW-*` files
stay in place as the record of the nine rounds. **`superseded` is not one of the driver's recognised
statuses** (`QUEUE_STATUSES` in `pdlc/workflows/orchestrate-queue.js`) and does not need to be:
`selectNextPending` picks only `pending` and treats only `in-progress` as an active-run marker, so an
unrecognised value is simply skipped, never halted on and never misparsed. The dependency pre-check
reads any non-`done` status as "blocked", which is the correct reading for a superseded row and
affects nothing here — no live row depends on `pdlc-review-convergence`. It is preferred to `blocked`
because it says *why* the row will never run.

**One consequence an operator should decide on.** `Order` values are allocated and never reused, so the
successors take 10, 11 and 12 — *behind* rows 2–5 in pickup order, where the retired row 0 sat *ahead*
of them. The original priority argument (below) still applies: these features harden the review loop
every other row runs through, so landing them first means rows 2–5 run through a harness that already
carries the fixes. Rows 2–5 are dependency-blocked today (`pdlc-workflow-distribution` /
`pdlc-merge-phase` are not `done`), so the queue will reach 10 first in practice — but if that changes,
reprioritise deliberately rather than by accident, and record the move here as the earlier
`row 8 → 0` reprioritisation was recorded.

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
