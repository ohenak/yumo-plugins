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
> **Rows 1 (`pdlc-advisory-tier`), 2 (`pdlc-consolidation-agent`) and 3
> (`pdlc-headless-engine`) were removed from the table on 2026-08-12.** All three merged — row 1
> as `bb99f890` (#38, 2026-08-05), row 2 as `87d9c6ad` (#50, 2026-08-10), row 3 as `39787a82`
> (#56, 2026-08-12) — and the per-feature docs moved to `docs/completed/pdlc-advisory-tier/`,
> `docs/completed/pdlc-consolidation-agent/` and `docs/completed/pdlc-headless-engine/`,
> LEARNINGS included. `Order` values stay allocated and are never reused; 1, 2 and 3 are retired.
> The rows that still name these features in `Depends-On` (4, 5, 6, 19, 20) resolve them through
> Phase-0 readiness triage — a dependency absent from the table is checked against the base
> branch, exactly as rows 6/7/15/16 already do for `pdlc-workflow-distribution`. Prose below that
> says "row 1", "row 2" or "row 3" is historical record and keeps its meaning: the feature name,
> not the row, is the identity.

> **Row 7 (`pdlc-install-mechanism`) removed from the table on 2026-08-13 — closed as superseded,
> not delivered.** Its deferrals D-DIST-01/02/03/05 are absorbed by `pdlc-engine-distribution`'s
> renarrowed REQ-EDIST-03: once the engine is installed as a package, the per-project copy
> mechanism they wanted to improve no longer exists to improve. D-DIST-07 (per-worktree consumer
> state) dissolves for the same reason — it is a property of the `.claude/workflows/` consumer copy,
> which row 5 `pdlc-plugin-retirement` removes. **Conditional, recorded so it cannot vanish
> silently:** if plugin retirement does not land, D-DIST-07 re-opens against row 6
> `pdlc-engineering-loop`. No REQ was ever authored at the row's `REQ Path` — the row was a
> placeholder holding the deferrals, so closing it deletes no document and nothing moves to
> `docs/completed/`. `Order` value 7 is retired and is not reused. Decision:
> `pdlc-engine-distribution` REQ v0.6, O-3.
>
> **Row 8 (`pdlc-release-ci`) kept, renarrowed on 2026-08-13.** Its PR-test half was discharged out
> of band in `3ef6ac7`; what remains is release automation for the public npm package chosen in
> DEC-DIST-05 — tag, publish, and the rendered version lines. It therefore now depends on
> `pdlc-engine-distribution` as well, and stays `blocked` until that feature's FSPEC settles the
> package name and pin mechanism. Its `REQ Path` is likewise still a placeholder: no REQ exists at
> that path yet, and one must be authored before the row can be picked up. Decision: same, O-3.

> **Row 4 (`pdlc-engine-distribution`) removed from this table on 2026-08-16.** Merged as
> `a9885dc8` (#63, 2026-08-16) — per-feature docs moved to
> `docs/completed/pdlc-engine-distribution/`, LEARNINGS included. `Order` value 4 stays
> allocated, never reused. Rows still naming the feature in `Depends-On` (5, 8, 23) resolve
> through Phase-0 readiness triage — the dependency is absent from the table but checked
> against the base branch, exactly as the existing notes above describe for other retired
> features. Row 23's `REQ Path` cell was updated to the new
> `docs/completed/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md` path; row 23's
> prose note below still names the old REQ/TSPEC paths for historical context.

> **Rows 5 (`pdlc-plugin-retirement`), 19 (`pdlc-advisory-wave-gate`) and 23
> (`pdlc-engine-v0.2.0-release`) were removed from this table on 2026-08-21.** All three merged or
> shipped — row 5 as `6b12b6e8` (#65, 2026-08-18), row 19 as `bb4d36fb` (#66, 2026-08-20) with a
> follow-up landing as `d24f2d7e` (#68, 2026-08-21), and row 23 as engine v0.2.0's release, already
> `done` since 2026-08-16 (see the row-23 notes below) — and the per-feature docs moved to
> `docs/completed/pdlc-plugin-retirement/` and `docs/completed/pdlc-advisory-wave-gate/`,
> LEARNINGS included. Row 23 had no folder of its own — its `REQ Path` already pointed at
> `docs/completed/pdlc-engine-distribution/`, per the 2026-08-16 note above — so no document moved
> for it. `Order` values stay allocated and are never reused; 5, 19 and 23 are retired. The rows
> that still name these features in `Depends-On` (6, 20, 24, 25) resolve them through Phase-0
> readiness triage — a dependency absent from the table is checked against the base branch, exactly
> as rows 6/7/15/16 already do for `pdlc-workflow-distribution`. Prose below that says "row 5", "row
> 19" or "row 23" is historical record and keeps its meaning: the feature name, not the row, is the
> identity.

> **Row 21 (`pdlc-learnings-injection`) removed from this table on 2026-08-22.** Merged as
> `8880f5d5` (#70, 2026-08-22) and the per-feature docs moved to
> `docs/completed/pdlc-learnings-injection/`, LEARNINGS included;
> `learningsErratumBinding.test.js`'s FSPEC/REQ path pins were repointed to the
> `docs/completed/` paths in the same change. The feature shipped on the engine channel the
> same day as `@kaneho/pdlc-engine@0.2.3` (tag cut at the #71 merge commit `4d11b9c9`, which
> also advertised plugin `0.23.4`; evidence convention:
> `docs/completed/pdlc-engine-distribution/EVIDENCE-ENGINE-V0.2.2.md` records the predecessor).
> `Order` value 21 stays allocated, never reused. No live row names the feature in
> `Depends-On`, so nothing else in the table moves. Prose below that says "row 21" is
> historical record and keeps its meaning: the feature name, not the row, is the identity.

> **Row 20 (`pdlc-wave-resume`) removed from this table on 2026-08-26.** Merged as `928a74d9`
> (#72, 2026-08-26) and the per-feature docs moved to `docs/completed/pdlc-wave-resume/`,
> LEARNINGS and MUTATION-EVIDENCE included; `waveResumeRepoState.test.js`'s PLAN and
> mutation-evidence path pins were repointed to the `docs/completed/` paths in the same change.
> The retirement baseline's `docs/pdlc-wave-resume/**` exemption glob stays as written, matching
> the precedent of every prior archived feature: the moved files fall under the already-exempt
> `docs/completed/**`, and A-1's glob list is frozen. `Order` value 20 stays allocated, never
> reused. No live row names the feature in `Depends-On`, so nothing else in the table moves.
> Prose below that says "row 20" is historical record and keeps its meaning: the feature name,
> not the row, is the identity.

> **Row 6 (`pdlc-engineering-loop`) removed from this table on 2026-08-26.** Merged as
> `a3781491` (#73, 2026-08-26) and the per-feature docs moved to
> `docs/completed/pdlc-engineering-loop/`, LEARNINGS and both post-mortems included;
> `loopDeferralBinding.test.js`'s REQ path pin was repointed to the `docs/completed/` path and
> its queue-vacuity anchor moved to the successor row in the same change. Row 26
> (`pdlc-loop-automation-followups`) names the feature in `Depends-On`: per the standing
> convention above, that dependency now resolves against the base branch during Phase-0
> readiness triage, so row 26 does not move. The feature's six deferrals (REQ §8's
> D-LOOP-01…05 and DECISIONS' DEC-LOOP-07) stay bound to rows 26 and 8 as recorded below.
> `Order` value 6 stays allocated, never reused. Prose below that says "row 6" is historical
> record and keeps its meaning: the feature name, not the row, is the identity.


| Order | Status | Feature | REQ Path | Depends-On | Engine |
|-------|--------|---------|----------|------------| --- |
| 8 | blocked | pdlc-release-ci | docs/pdlc-release-ci/REQ-pdlc-release-ci.md | pdlc-workflow-distribution, pdlc-engine-distribution |  |
| 9 | blocked | pdlc-authoring-contract | docs/pdlc-authoring-contract/REQ-pdlc-authoring-contract.md | pdlc-review-loop-hardening |  |
| 22 | blocked | pdlc-halt-hardening-followups | docs/pdlc-halt-hardening-followups/REQ-pdlc-halt-hardening-followups.md | — |  |
| 24 | pending | pdlc-consolidation-rehost | docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md | pdlc-plugin-retirement, pdlc-headless-engine |  |
| 25 | blocked | pdlc-retirement-operator-verification | docs/pdlc-retirement-operator-verification/REQ-pdlc-retirement-operator-verification.md | pdlc-plugin-retirement |  |
| 26 | blocked | pdlc-loop-automation-followups | docs/pdlc-loop-automation-followups/REQ-pdlc-loop-automation-followups.md | pdlc-engineering-loop |  |
| 27 | done | pdlc-stats | docs/pdlc-stats/REQ-pdlc-stats.md | — | PR #81 merged ee38bde4a 2026-09-01 |
| 28 | blocked | pdlc-review-tightenings | docs/pdlc-review-tightenings/REQ-pdlc-review-tightenings.md | pdlc-stats |  |
| 29 | blocked | pdlc-queue-autoresolve | docs/pdlc-queue-autoresolve/REQ-pdlc-queue-autoresolve.md | pdlc-stats |  |
| 30 | blocked | pdlc-phase-g | docs/pdlc-phase-g/REQ-pdlc-phase-g.md | pdlc-decision-ledger, pdlc-stats |  |
| 31 | blocked | pdlc-size-tiers | docs/pdlc-size-tiers/REQ-pdlc-size-tiers.md | pdlc-phase-g |  |
| 32 | blocked | pdlc-two-axis-dod | docs/pdlc-two-axis-dod/REQ-pdlc-two-axis-dod.md | pdlc-size-tiers |  |
| 33 | pending | pdlc-init | docs/pdlc-init/REQ-pdlc-init.md | — |  |
| 34 | blocked | pdlc-erratum-delivery-gate | docs/pdlc-erratum-delivery-gate/REQ-pdlc-erratum-delivery-gate.md | pdlc-review-tightenings |  |

**Rows 27–33 added 2026-08-30 from `docs/design/DESIGN-pdlc-minimal-loop-2026-08-30.md` (§8
rollout order).** They sequence the minimal-loop redesign: measurement first (27), then the
always-on review tightenings (28), unattended halt resolution (29), the Phase G experiment (30),
size tiers (31), the two-axis DoD collapse (32), and repo scaffolding (33). Row 30's dependency
on `pdlc-decision-ledger` (M4 — developed as a direct single-feature run, no queue row) resolves
against the base branch during Phase-0 readiness triage once its PR merges, per the convention
above. Row 32 additionally carries `ready: false` in its REQ: it contradicts a standing operator
decision (see the REQ's gating precondition) and must not be picked up until that re-decision is
recorded. Row 33 is independent of the rest and may run whenever picked.

**Row 34 (`pdlc-erratum-delivery-gate`) added 2026-09-01 to bind the engine-side debts
`pdlc-decision-ledger` surfaced** (`POSTMORTEM-PR` recommendations 4–6 and the advisory tier's
four zero-signal escalations). Blocked on row 28: both features change what the review-round
dispatch path admits as a completed round, so running them in parallel would put two REQs into a
rework loop over the same clauses.

**Row 26 (`pdlc-loop-automation-followups`) added 2026-08-25 to bind `pdlc-engineering-loop`'s
prose-only deferrals (CODE_REVIEW-pdlc-engineering-loop-v2 §4(b), B-03…B-08).** REQ §8 defers five
loop extensions and DECISIONS defers one CI leg, and before this row every one of them was bound by
prose alone — the shape the Definition-of-Done criterion exists to catch, because prose-only
deferrals never ship. Each line below names the deferral and the row that now owns it:

- D-LOOP-01 (parallel execution of disjoint features) → `pdlc-loop-automation-followups`, whose REQ
  must first settle the subsystem-disjointness check without which two pipelines author conflicting
  changes to the same files.
- D-LOOP-02 (REQ-readiness watcher proposing queue rows) → `pdlc-loop-automation-followups`;
  propose-only by construction, and it touches this queue's `ready: true` latch, so it needs its own
  design before it is picked up.
- D-LOOP-03 (desktop scheduled task / Routine packaging) → `pdlc-loop-automation-followups`; REQ
  AC-6.2 documents the path, packaging it is separate work.
- D-LOOP-04 (multi-repo loop driving) → `pdlc-loop-automation-followups`, deferred while there is
  one real consumer repo; the row is where a second consumer re-opens it.
- D-LOOP-05 (Monitor-tool build/test watching inside phases) → `pdlc-loop-automation-followups`;
  it applies inside `se-implement`, not at loop level, so it is scoped with the other loop
  follow-ups rather than against row 6.
- DEC-LOOP-07 → row 8 `pdlc-release-ci`. The decision descopes AT-52's installed-engine leg and
  accepts the residual risk that no CI check exercises the packed-and-installed binary; row 8
  already owns release automation for the published npm package, so that leg belongs there.
  Recorded here so the descope cannot vanish silently: row 8's REQ, when authored, must either
  land that leg or re-state the accepted risk.

`Order` 26 is next free after 25. No REQ exists at row 26's `REQ Path` yet — the row is a
placeholder holding these deferrals, exactly as rows 7, 8 and 22 were before it, and one must be
authored before the row can be picked up. The row stays `blocked` until `pdlc-engineering-loop`
merges.

**Row 25 (`pdlc-retirement-operator-verification`) added 2026-08-18 to bind
`pdlc-plugin-retirement`'s nine `PENDING-OPERATOR` acceptance criteria to a successor.**
CODE_REVIEW-pdlc-plugin-retirement-v1.md §3 finding 6(b) found that AC-3.1 (transcript
half), AC-3.2, AC-3.4, AC-3.5, AC-3.6, AC-4.4, AC-5.3, and the two P0 criteria AC-5.1 and
AC-5.2 were bound only to prose in two ledger documents
(`docs/completed/pdlc-plugin-retirement/POSTSWEEP-RUN-*.md`,
`docs/completed/pdlc-plugin-retirement/OPERATOR-OBSERVATIONS-*.md`) — not to a queue row or successor
REQ, so a runbook step or bare prose mention was not a successor per the same criterion's own
rule. This row and its (not yet authored) REQ own the operator-acceptance run that discharges
AC-5.1, AC-5.2, and AC-4.4, and the AT-3.1/AT-3.2/AT-3.4/AT-3.5/AT-3.6/AT-5.3 live-dispatch
observations that back them; the two ledger documents remain the evidence template the run
fills in, not the successor itself. `Order` 25 is next free after 24; the row stays `blocked`
until `pdlc-plugin-retirement`'s sweep lands and an operator run is scheduled.

**Row 24 (`pdlc-consolidation-rehost`) added 2026-08-18 to bind `pdlc-plugin-retirement`
REQ O-8's successor obligation.** O-8 records the operator's choice of option (a) —
accept the in-session loss of the unattended, machinery-backed consolidation pass, and
bind its re-hosting under `@kaneho/pdlc-engine` to a queue row plus a named successor
REQ, both raised before that feature's first deletion commit. This row and
`docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md` are that binding. The
REQ carries `ready: false` pending operator review, per this queue's draft rule (§ intro);
nothing executes against it until the operator flips that flag, preserving the veto O-8
describes. `Order` 24 is next free after 23.

**Row 23 (`pdlc-engine-v0.2.0-release`) added 2026-08-16 to bind an unbound successor-tag deferral
(CODE_REVIEW v5 §3-1, `pdlc-engine-distribution`).** `pdlc/README.md`, `REQ-pdlc-engine-distribution.md`,
and `TSPEC-pdlc-engine-distribution.md` all disclose that until a successor tag is cut, `npm i -g
@kaneho/pdlc-engine@latest` keeps resolving the pre-feature `0.1.0` bytes published from `engine-v0.1.0`
— but named that successor tag nowhere binding (no queue row, no successor REQ; a `grep` for
`engine-v0.2.0` across `docs/`, `pdlc/`, and `.github/` returned zero hits before this row). Evidence
that discharges this row: post-merge, cut the `engine-v0.2.0` tag on the merge commit and verify
`.github/workflows/publish.yml` runs green and `npm view @kaneho/pdlc-engine version` resolves to
`0.2.0` — this is the act that discharges REQ AC-2.1/AC-2.2 (CODE_REVIEW v5 §2 rows 1–2), which stay
narrowed-YES until the tag is cut. Status `blocked`, `Depends-On pdlc-engine-distribution`: the tag
cannot be cut before that feature's branch merges. `REQ Path` reuses the feature's own REQ (the
successor-tag cut is a release act on an already-approved REQ, not a new feature requiring its own
REQ). Mechanically guarded by `pdlc/engine/__tests__/deferral-binding.test.js`, which reds if this row
or the `pdlc/RELEASE-CHECKLIST.md` §7 engine-channel section is removed while the README/REQ/TSPEC
successor-tag caveat is still present.

**Row 23 set to `done` on 2026-08-16.** The `engine-v0.2.0` tag was cut at the merge commit
`a9885dc86bc52b3ac5e55e1aa5d32da3046e2c3e` (PR #63) and published: `.github/workflows/publish.yml`
ran green, `npm view @kaneho/pdlc-engine version` resolves to `0.2.0`, and `pdlcPairing` reports
the matching `engine-v0.2.0` / `a9885dc8` pairing. Evidence:
`docs/completed/pdlc-engine-distribution/EVIDENCE-ENGINE-V0.2.0.md`. This discharges REQ
AC-2.1/AC-2.2 (CODE_REVIEW v5 §2 rows 1–2) and the README's successor-tag caveat, which was
removed from `pdlc/README.md` in the same change — `deferral-binding.test.js`'s row-23 binding
assertion is conditioned on that caveat text and now no-ops once it is gone.

**Row 22 (`pdlc-halt-hardening-followups`) added 2026-08-16 to bind an unbound deferral
(CODE_REVIEW v4 §3-3, `pdlc-engine-distribution`).** `docs/ideas/halt-hardening-followups.md`
landed on `feat-pdlc-engine-distribution` (commit `75782278`) as self-declared "ideas only — not
built" field findings from live 0.23.0 consumer runs: (1) an inverted/mislabeled qualifying
ownership table poisoning `parsePlanOwnership`'s manifest union, and (2) the second item that
file records. A prose backlog file is not a successor, so those two items were deferred work with
no owner. This row is that owner, and the file is its input. `Order 22` because values are
allocated and never reused and 21 is the highest ever issued. Status `blocked`, `Depends-On —`:
nothing gates it but the REQ itself, whose `REQ Path` above is still a placeholder — no REQ exists
at that path yet, and one must be authored before the row can be picked up (row 8's precedent).
Mechanically guarded by `pdlc/engine/__tests__/deferral-binding.test.js`, which reds on any
tracked `docs/ideas/*.md` file that no queue row and no REQ names.

**Row 21 (`pdlc-learnings-injection`) added 2026-08-10 from consumer-run feedback.** The
`regime-ledger` consumer completed a full end-to-end run of `wheel-paper-portfolio` (~40 review
rounds, 49 implementation tasks, 3 DoD rounds, PR #261 green) while executing a stale 0.21.0
workflow copy against a 0.22.x plugin, and the operator relayed its pain points on 2026-08-10.
Checked against `pdlc/workflows/orchestrate-dev.js` at HEAD, almost all of them are already
answered by the 0.22.x modules — the verdict vocabulary, verdict-trailer recovery, per-phase
model routing and wave-mode's script-owned pathspec-scoped commits behind a foreground test
gate — so the staleness itself is the story, and it belongs to the headless-engine family (rows
3–5, whose REQ now records the incident as corroborating evidence at v0.5). **One genuine gap
survived that check:** no mechanism injects a sibling feature's harvested LEARNINGS into an
authoring dispatch, so a lesson the pipeline paid a feature to learn does not reach the next
feature's authors in-run. Row 21 is that gap and only that gap. `Order` values are allocated and
never reused; 21 is the next free after 20. Its `Depends-On` is `—`: it composes with
`pdlc-consolidation-agent` (row 2) but consumes nothing the consolidation pass produces — the
distinction is stated in the REQ's §1.3 and §4.2 BL-03 — and it needs no other row to land
first. `ready: false` until the operator reviews the draft, so the queue does not pick it up as
drafted.

**Row 19 — the sixth advisory seam — added 2026-08-09 (draft REQ, `ready: false`, operator review
pending).** Motivated by a live Phase I failure on `pdlc-consolidation-agent` the same day: a wave-2
task imported a symbol whose promotion the PLAN scheduled for a wave-4 task, the module graph failed
to link, and the wave gate correctly refused to commit — but the pipeline had no way to attempt the
one-keyword repair, so an unattended run became an operator turn. Seam **A6** gives a red wave gate
one bounded, reversible, gate-verified remediation attempt inside the wave's own declared file
ownership before the halt. **Operator direction 2026-08-09:** taken up *after* `pdlc-consolidation-agent`
lands, which is why that feature is in the `Depends-On` column rather than only in the REQ's prose.
`Order 19` because values are allocated and never reused and 18 is the highest ever issued; the row
carries `ready: false` so the driver cannot pick it up as drafted. Its five deferrals (D-AWG-01…05)
all bind to row 6, which is why row 6 gains a `Depends-On` edge on it below — the engineering loop is
the integration row that would inherit them. **Update 2026-08-11:** a second live instance, from
consumer repo `regime-ledger` (`iv-snapshot-store-postgres`, direct `pdlc dev` run), corroborates the
seam: a wave-2 task delivered its owned NEW test file but never touched its owned MOD implementation
file, and the gate died at pytest collection (ImportError, zero tests run) — the first live
`wave-internal-defect` instance, repairable under E-5 alone. REQ revised to v1.1 with the incident,
two new operator questions (Q-4 per-task ownership-delivery check, Q-5 collection-error evidence
signal) and a sixth deferral D-AWG-06 (mode-aware Phase I halt reporting), which binds to row 6 like
the other five. **Update 2026-08-20 (DoD code review v1, finding 8):** the feature's TSPEC §6 **OQ-7**
— whether A6's whole-tree restore is bounded by `git clean -fd` or `-fdx`, i.e. whether a
`.gitignore`d file the wave itself added survives the restore — is bound to **row 6** on the same
terms as D-AWG-01…06. It was previously carried only as an erratum raised on FSPEC BR-9 / AT-05-1 and
REQ AC-5.1, which is prose and owns nothing; the corresponding `test.todo` in
`pdlc/workflows/__tests__/advisoryWaveGate.test.js` (PROP-REST-03) now names this row as its
successor. Row 6 already carries a `Depends-On` edge on `pdlc-advisory-wave-gate`, so nothing else in
the table moves. Until row 6 decides it, A6 ships the `-fd` behaviour and PROP-REST-01's
round trip observes it — the deferral is the *decision*, not the behaviour.

**Rows 3-5 — the headless-engine family — added 2026-08-08 (draft REQs, operator review
pending).** Motivated by the regime-ledger staleness incident (consumer ran 0.21.0 engine
bytes against a 0.22.0 plugin; the versions differ in review-gate semantics): the per-project
workflow copy is replaced by a standalone CLI that executes `pdlc/workflows/*.js` unmodified
in plain Node and dispatches agents under subscription auth. The Phase-0 spike
(`SPIKE-agent-sdk-auth.md`, 2026-08-08) verified the **Claude Agent SDK** runs under
subscription auth on the operator's machine (`apiKeySource: "none"`), so the SDK is the
**primary dispatch transport with headless `claude -p` as the declared fallback** — both
behind the unchanged `_agent` seam and a fail-closed `apiKeySource` check, with
`ANTHROPIC_BASE_URL` passthrough keeping the headroom proxy in the path on either transport.
All three REQs carried `ready: false` until the operator reviewed them — the queue must not
pick up drafts. **Update 2026-08-10:** the operator reviewed all three and flipped them
`ready: true`; the same review repointed stale queue-row references (19/20/21, left over from
a pre-renumbering table draft) to feature names in the two downstream REQs. Sequencing:
`pdlc-headless-engine` (engine) → `pdlc-engine-distribution` (packaging/publish) →
`pdlc-plugin-retirement` (retire bundles + sync/drift machinery). **Operator direction
2026-08-08:** the plugin remains the delivery vehicle for the skills — users keep `/pdlc:*`
standalone, and the CLI reads SKILL.md from the installed plugin behind a version handshake —
so retirement slims the plugin's *workflow* machinery only, never its skills.
**Pending operator decisions recorded in the REQs:** `pdlc-install-mechanism`'s deferrals
D-DIST-01/02/03/05 are proposed **superseded** by this family (they improve the copy
mechanism; the family removes the copy) and D-DIST-07 closes by construction;
`pdlc-release-ci`'s D-DIST-06 release-automation remainder is proposed absorbed or renarrowed
by `pdlc-engine-distribution` (its §Obligations). Those two rows are left untouched until the
decision is recorded here.

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

| REQ | Before | After | Remedy |  |
|---|---|---|---|
| `pdlc-rcv-budget-stop` | 581 lines / 83 KB | 410 lines / 47 KB | split at the REQ-RCV-01 / REQ-RCV-02 seam → **row 17** `pdlc-rcv-fixed-point-stop` (424 lines / 41 KB), plus the shared-context extraction below |  |
| `pdlc-rcv-panel-topology` | 489 lines / 64 KB | 491 lines / 59 KB | **no split** — 4% over, and its two requirements must ship together. Shared-context extraction plus removal of one duplicated narrative |  |

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
