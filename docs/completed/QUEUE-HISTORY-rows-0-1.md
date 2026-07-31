# Queue history — rows 0 and 1 (archived 2026-07-30)

This is the detailed queue history for the two rows removed from `docs/_queue/QUEUE.md` on
2026-07-30: `Order 0` (`pdlc-review-loop-hardening`) and `Order 1` (`pdlc-workflow-distribution`).
Both merged — row 1 as `1fb6cbe` (#19/#21, 2026-07-29), row 0 as `7bc559a`/PR #23 (2026-07-30) —
and their per-feature docs now live at `docs/completed/pdlc-workflow-distribution/` and
`docs/completed/pdlc-review-loop-hardening/`. The prose below is moved verbatim from the live
table's notes at the time of archival; it is historical record, not a live document, and its
"row 0" / "row 1" language is left as originally written.

---

> **Row 0 was row 8 until 2026-07-29.** `pdlc-review-loop-hardening` was reprioritised to the front of
> the queue and its `Order` changed `8 → 0`. The other rows were deliberately **not** renumbered:
> ~25 references to "queue row 6", "row 7" and "row 8" exist across `CLAUDE.md`, `pdlc/README.md`, the
> `orchestrate-queue` SKILL, `docs/_constraints/`, `docs/_decisions/` and six archived feature specs,
> and shifting every number to move one row is precisely the document-drift failure mode DC-07 and
> DC-12 were promoted about. **Documents written before 2026-07-29 call this row "row 8"** — that is the
> same row. `Order` is the pickup key, not a stable identity.

---

Row 1 is `done` as of 2026-07-29. The pipeline ran to the end of Phase PUB and raised
https://github.com/ohenak/yumo-plugins/pull/19, whose five PR checks were green at `a8ac055`; the
operator merged it as `1fb6cbe` (squash) and set this row `done`. Per §Bootstrapping that merge was
always going to be an operator action — the PR touches `pdlc/workflows/**` and `pdlc/skills/**`, so it
trips the self-modification convention and is never auto-merged.

Row 1's completion satisfied the only dependency of rows 0 and 2. Row 0 took that pickup and is now
`awaiting-merge` (see its notes below), so **row 2 `pdlc-merge-phase` is the next pickup** — it is the
only remaining `pending` row whose dependencies are all `done`. Note that row 2 becomes pickable on
row 1's merge alone; it does not wait on row 0's PR. Every other row stays unpickable for its own reason:
rows 4 and 5 have further unmet dependencies (`pdlc-advisory-tier`, and for row 5 all of 2–4); rows 6
and 7 are `blocked` with no REQ authored.

Two items were left open at close rather than resolved:

- **DoD-15** — the 206 lines of `.github/workflows/pr-tests.yml` landed out-of-band in `3ef6ac7` and
  passed no pdlc phase, so the CI gate itself is unspecified and unreviewed even though it now
  demonstrably works. This is the live instance of `docs/_constraints/DOMAIN-CONSTRAINTS.md` DC-07
  ("work that skips a pipeline phase inherits zero review coverage"), promoted 2026-07-29.
- **The eleven skill-prompt proposals** in `docs/_decisions/CONSOLIDATION-PROPOSAL-2026-07-29.md`,
  from this feature's harvest and the first consolidation pass. P-2/P-3/P-4 overlap row 0 and should
  be applied there rather than twice; P-1 is the one with the largest measured cost behind it.

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
each killed by the runtime stall watchdog mid-`Write`, producing no FSPEC (row 0, H-3). Re-entering
at the time would also have re-run all four approved Phase-R rounds (row 0, H-4). Those harness fixes
were the recommended precondition for further Phase F attempts here; row 1 in fact completed without
them, which is why row 0 now runs first — the next feature should not have to.

**Row 0 is `awaiting-merge` as of 2026-07-30.** The pipeline ran to the end of Phase PUB and raised
https://github.com/ohenak/yumo-plugins/pull/23, whose five PR checks were green at `7bc559a` (both
`Unit tests` matrix legs, `Generated artifacts are in sync`, `Fresh-clone bootstrap works`, `Shell
scripts parse`). As with row 1 the merge is an operator action — the PR touches `pdlc/workflows/**`
and `pdlc/skills/**`, so it trips the self-modification convention and is never auto-merged.

This row was `halted` from 2026-07-29 (`6247fa5`, Phase R non-convergence at the 5-iteration ceiling)
until this transition. The intervening resolution is the operator-directed convergence pass recorded
in `POSTMORTEM-R-pdlc-review-loop-hardening.md` §Resolution: v1.5 was verified finding-by-finding
against both round-5 cross-reviews rather than by a sixth review round, all nine blocking and four Low
findings resolved in the v1.5 text, and every citation re-verified byte-accurate at HEAD. The round-5
cross-review files keep their historical `Needs revision` verdicts against v1.4 — no reviewer approval
was fabricated. **One operator action is still outstanding**: that POSTMORTEM carries no machine-readable
`RESOLVED:` marker, so `parseResolvedMarker` reads it as `absent` and `checkPostmortem` fails closed. Any
future re-entry to Phase R for this feature will refuse until a person adds `RESOLVED: yes` on its own
line. The marker is human-written only by construction (`pdlc/workflows/orchestrate-dev.js:942-943`),
so no agent has written or will write it.

Two items are carried out of this row rather than resolved in it, bound to row 9
(`pdlc-authoring-contract`): CODEBASE F-4/F-5/F-6, and DoD F-2/F-3 — one defect from two angles, where
F-2 is entirely pre-existing and F-3 is partly net-new (four of six sites pre-date the branch, two are
`defaultGit` seams this feature added). Adding F-3's guard reds until F-2 is fixed, so they land
together or not at all.

Row 0 (**called row 8 in every document written before 2026-07-29**) binds four harness defects — the
two from post-mortem R-3/R-4 plus two found during the 2026-07-28 run. Its REQ **is authored** (v1.0,
`ready: true`), and on 2026-07-29 the operator set the row `pending` and moved it to `Order 0`, making
it the queue's next pickup ahead of `pdlc-merge-phase`.

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
orchestrator SKILLs and the three author SKILLs; bundles rebuilt in the same commit.

**Updated 2026-07-29 — why this row is now Order 0.** Its original recommendation was "land before row
1's next Phase F attempt", which stopped naming a real event when row 1 completed. The recommendation
was not merely moot, it was under-stated, and the operator acted on the stronger form: this row runs
**before row 2 and before everything else**. The case, in the order the evidence accumulated:

- **Three of the four full runs on row 1's branch died to harness defects rather than to the work.**
  Nothing about those defects was specific to row 1 — they are properties of `reviewLoop` and of the
  non-convergence exit, so every remaining row in this queue is exposed to them.
- **Row 1's harvest re-derived H-1 and H-2 independently**, from 16 REQ rounds of evidence, without
  reference to this row. H-1's cost is measured: the wrong iteration index was dispatched for **15
  consecutive rounds**, both reviewers detected the skew every round and refused, and had any complied,
  committed review history would have been destroyed. H-2's cost is five wasted rounds — a post-mortem
  was written, no skill read it, and the queue re-picked the feature because the row was never set
  `halted`.
- **`CONSOLIDATION-PROPOSAL-2026-07-29.md` P-2/P-3/P-4 overlap this row.** Apply them here rather than
  twice; P-4 (H-3/H-4) is the one that makes a long authoring phase survivable at all.
- The self-referential argument is the decisive one: this row fixes the machinery that runs every other
  row. Landing it first means rows 2–7 are executed by a harness whose iteration bookkeeping is correct
  and whose escalation path is not a no-op. Landing it later means paying H-1 through H-4 again on each
  of them, and this queue has already paid them four times.

---

**Row 0 before all of them (added 2026-07-29).** The rationale below was written when this queue held
five rows and the harness was assumed sound. It is not: row 1's run paid four separate harness defects,
and row 0 fixes the machinery every row below is executed by. Its case is made at the row 0 notes above;
the ordering argument among rows 1–5 is unchanged and follows.
