---
feature: pdlc-plugin-retirement
ready: true
depends-on: [pdlc-headless-engine, pdlc-engine-distribution]
---

# REQ — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | `pdlc-headless-engine`, `pdlc-engine-distribution`; adoption evidence per C-1 |
| Downstream | — (terminal REQ of the family) |
| Cross-Reviews | — |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | approved — ready | Claude | 0.4 | 2026-08-10 |

*0.4 (2026-08-10): queue-row references repointed to feature names (stale Order numbers from a
pre-renumbering table draft); ready flipped by operator review 2026-08-10.*

*0.3 (2026-08-08): operator decision — the plugin is retained permanently, not slimmed to
optional, as the engine's skills carrier and a hard runtime dependency behind a version
handshake; only the workflow-execution machinery retires.*

> **Scope in one line.** Once the headless engine is the proven execution path, retire the
> machinery that existed only to serve the workflow-runtime host — the runtime bundles, the
> sync/drift apparatus, and the queue drift gate — while the plugin stays installed
> permanently as the skills carrier and a hard runtime dependency of the engine, which reads
> skills from it behind a version handshake, and whose orchestration skills delegate to the
> engine.

## 1. Problem / Context

After `pdlc-engine-distribution` lands, the repo carries two parallel execution paths for the
same pipeline. Keeping both is not free, and the cost is not hypothetical: an entire
sub-system exists **only** because the Claude Code workflow runtime loads workflow code from
the consumer project directory. Remove that host and every part of the sub-system becomes
dead weight that still has to be built, tested, documented, released and reasoned about on
every future pipeline change.

Keeping both paths alive indefinitely also re-creates the two-versions problem this family
set out to kill (`pdlc-engine-distribution` R-3: two installable channels, two possible
pipeline versions on one machine) and it keeps the drift *detection* apparatus alive after
the drift *cause* is gone — patching a symptom whose wound has healed.

### 1.1 User stories

| ID | Story |
|---|---|
| US-01 | As the operator, I want one execution path to reason about, so that a pipeline change is made and verified once rather than in two hosts with different capabilities. |
| US-02 | As the operator, I want the sync/drift apparatus gone once nothing can drift, so that I stop paying its maintenance, CI and release-checklist cost for a failure mode that no longer exists. |
| US-03 | As a consumer repo owner, I want a documented one-time cleanup, so that a repo that once hosted the runtime copy does not keep stale generated state forever. |
| US-04 | As a human working inside a Claude Code session, I want the interactive pdlc skills and their SessionStart nudges to keep working, so that retirement of the unattended host does not cost me the mid-session tools. |

### 1.2 Measured retirement surface (HEAD, 2026-08-08)

These are the artifacts that exist *only* to serve the workflow-runtime host. Sizes were
measured at HEAD on 2026-08-08 and are the basis of the "cost of keeping" claim above; they
are re-measured at execution time per C-6, because a stale inventory is how a deletion sweep
misses a file.

| ID | Artifact | Measured |
|---|---|---|
| M-1 | `pdlc/hooks/scripts/sync-workflows.sh` | 33 KB |
| M-2 | `pdlc/hooks/scripts/lib/pdlc-drift.sh` (sourced library, non-executable by design) | 76 KB |
| M-3 | `pdlc/hooks/scripts/check-workflow-drift.sh` | 19 KB |
| M-4 | `pdlc/workflows/dist/orchestrate-dev.bundle.js` | 304 KB |
| M-5 | `pdlc/workflows/dist/orchestrate-queue.bundle.js` | 303 KB |
| M-6 | `pdlc/workflows/dist/distribution-manifest.json` | 1.1 KB |
| M-7 | `pdlc/workflows/build-runtime.mjs` | 572 lines / 22.6 KB — emits M-4, M-5, M-6 **and** `dist/pdlc-cli.mjs` (see M-9) |
| M-8 | Tests dedicated to the above (drift classification/backups/baseline/ladder/messages/ordering/record-shape/relpath/repo-root/sync/write-failure/fault/hook/helpers, bootstrap, worktree-include, queue drift gate, bundle freshness, hook compatibility) plus their helper modules | ≈17,800 lines, out of 83 test files in the suite |
| M-9 | `pdlc/workflows/dist/pdlc-cli.mjs` — the document-state probe CLI | 476 KB — **survives** (NG-2), but is emitted by M-7 and travels through the same manifest/sync channel today |

Beyond the files themselves, the same machinery is referenced by: the queue's drift gate and
its `distribution.checkEnabled` config key; two CI jobs (`Generated artifacts are in sync`,
`Fresh-clone bootstrap works`) plus index-mode assertions inside a third (`Shell scripts
parse`) that name the two sync/drift entrypoints and the sourced library; the plugin's
`SessionStart` drift-reporter hook entry; the repo-root `.worktreeinclude` (whose **only**
row is `.claude/workflows/`); the `.gitignore` row that ignores the consumer copy; the
document oracles that police `pdlc/workflows/dist/` (packaging completeness and the
advertised-version check, plus the document-drift scan's exemptions for the two generated
trees); four `pdlc/RELEASE-CHECKLIST.md` sections; both READMEs; CLAUDE.md's bootstrap,
sync, drift and worktree sections; and header prose in the workflow modules themselves.
R-2 and O-5 carry the consequences of that breadth.

Retirement is gated on evidence, not on the engine merely existing (C-1). Until this REQ
completes, CLAUDE.md's documented paths (build, sync, drift gate, bootstrap) remain
authoritative and untouched.

## 2. Prerequisites

Every row is a **hard** gate, checkable at Phase R time. The operator flipped this REQ to
`ready: true` on 2026-08-10; what holds pickup until BL-01/BL-02 are satisfied is its queue
row's `Depends-On` edge (`pdlc-headless-engine`, `pdlc-engine-distribution`). No work starts
until every row below reads satisfied.

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-headless-engine` delivered (queue row `done`) | Merged PR + queue row status | Must hold at HEAD before FSPEC authoring |
| BL-02 | `pdlc-engine-distribution` delivered (queue row `done`) — the engine is installable and versioned | Merged PR + queue row status | Must hold at HEAD before FSPEC authoring |
| BL-03 | Adoption evidence per C-1 (≥2 features end-to-end, ≥1 outside `yumo-plugins`, reports showing subscription auth and headroom routing) | Run reports cited by path/commit in this feature's FSPEC | Must hold before **any** deletion commit |
| BL-04 | Guard parity on the engine path (`pdlc-headless-engine` C-5 / AC-5.1 demonstrated) | Passing engine test + one observed unattended run | Must hold before the plugin's hook wiring is treated as optional (C-2) |
| BL-05 | Operator decision on the `pdlc-install-mechanism` and `pdlc-release-ci` queue rows, recorded per `pdlc-engine-distribution` O-3 | Queue prose + row status change | Must hold before AC-1.2 can be true — both rows describe the retired copy channel |
| BL-06 | `docs/_decisions/DECISIONS-plugin-distribution.md` reviewed for decisions that mandate the sync channel | Superseding entry in the same decision file | Must hold before AC-1.2 — a live decision doc outranks a deleted script |

## 3. Goals

- **G-1 — Single execution path.** The headless engine is the only way the pipeline runs
  unattended. The workflow-runtime bundles (M-4, M-5), their manifest (M-6), the bundle
  emission in the build script (M-7), and the sync/drift apparatus (M-1, M-2, M-3) are
  deleted, along with the tests that exist solely to cover them (M-8) and the CI jobs that
  gate them.
- **G-2 — Plugin sheds workflow machinery, keeps every skill, gains the delegator role.**
  The plugin is not slimmed to an optional convenience: it keeps **all** its skills
  permanently — human-invoked (`/pdlc:pm-author`, `/pdlc:dod-verify`, …) and orchestration
  (`orchestrate-dev`, `orchestrate-queue`) alike — plus the human-facing hooks (US-04). It
  sheds only the workflow-execution machinery (G-1). The orchestration skills become thin
  delegators: run the engine, relay its report, preserving the `/loop run
  /pdlc:orchestrate-queue` habit with no plugin-resident pipeline logic and no
  plugin-resident copy of the workflow code. The engine, in turn, reads every skill from the
  installed plugin at dispatch time behind a version handshake (C-10) — the plugin is a hard
  runtime dependency of the engine, not an optional front-door.
- **G-3 — Docs and CI tell one story.** CLAUDE.md, both READMEs, `pdlc/RELEASE-CHECKLIST.md`
  and the CI workflow describe only the surviving path. Retired concepts — drift states,
  `--force`, `unverified`, the two-command bootstrap and its ordering, the worktree caveat —
  are **removed**, not deprecated in place. A reader who never saw the old path must not be
  able to find instructions for it in a tracked file.
- **G-4 — Consumer cleanup is guided and conservative.** Each consumer repo's leftover
  `.claude/workflows/` copy and its drift-state record are removed by a documented one-time
  operator step, idempotent, that refuses anything it did not expect rather than deleting
  broadly.
- **G-5 — The probe CLI survives the demolition intact.** `dist/pdlc-cli.mjs` (M-9) is
  emitted by the same build script that emits the retired bundles, so retirement must leave
  it available, generated (not hand-maintained) and unchanged in behaviour — the one
  artifact in `dist/` that outlives the directory's purpose.

## 4. Non-Goals

- **NG-1 — Removing the pdlc plugin, or any of its skills.** Firmly out of scope, more so
  than before: the plugin is a **hard runtime dependency** of the engine, not an optional
  convenience. All skills — interactive and orchestration alike — and the human-facing
  hooks stay installed permanently. The engine reads `SKILL.md` sources from the installed
  plugin at dispatch time (not a snapshot), so one source of truth is preserved (CLAUDE.md's
  Ptah integration note, and C-4).
- **NG-2 — Retiring `pdlc-cli.mjs`.** The document-state probes stay project-local and
  behaviourally unchanged (`pdlc-headless-engine` NG-4; `pdlc-engine-distribution` O-4
  defaults to leaving it local). Only its *packaging channel* is in scope here (G-5).
- **NG-3 — Any pipeline-semantics change.** Nothing in this feature may alter phase
  behaviour, document grammar, completeness criteria, review bars, verdict parsing, erratum
  routing or queue lifecycle. Deletions here are provably inert on the engine path.
- **NG-4 — Rewriting history.** Completed-feature docs under `docs/completed/`, harvested
  LEARNINGS, post-mortems and queue prose that describe the retired machinery are historical
  records; they are not edited or erased. G-3's "one story" obligation covers *instructional*
  documents only.
- **NG-5 — Changing the engine.** Any capability the plugin needs from the engine is
  an engine-side change owned by `pdlc-headless-engine`'s successors, not authored here.
- **NG-6 — Consumer-side automation of the cleanup.** G-4's step is operator-invoked; no
  hook, session-start action or engine startup path deletes consumer files on its own.

## 5. Constraints

- **C-1 — Evidence gate (threshold declaration).** Retirement work starts only after the
  engine has met all four thresholds below. Owner: the operator, who judges sufficiency; the
  pipeline never decides this. Evidence is cited by report path and commit in this feature's
  FSPEC (BL-03).

  | Threshold | Default | Owner |
  |---|---|---|
  | Features run end-to-end on the engine | ≥ 2 | operator |
  | …of which run in a repo other than `yumo-plugins` | ≥ 1 | operator |
  | Run reports showing subscription auth as the auth source | all of them | operator |
  | Run reports showing traffic routed through the local headroom proxy | all of them | operator |

- **C-2 — Guard parity precedes any reliance on hook removal.** The
  `guard-harvest-before-delete` invariant must be enforced on the engine path (BL-04) before
  the plugin's hooks stop being the thing that enforces it for unattended runs. Interactive
  sessions keep the plugin's `PreToolUse` and `PostToolUse` hooks per NG-1; only the
  `SessionStart` drift reporter is removed, because the condition it reports ceases to exist.
- **C-3 — The queue drift gate is removed, not bypassed.** The gate and its
  `distribution.checkEnabled` config key leave the workflow modules and their tests together.
  No dead flag, no permanently-true branch, and no config key that a consumer can set with no
  effect. A consumer config still carrying the key is ignored silently — it is not an error.
- **C-4 — Ptah keeps working.** `ptah.config.json` consumers read `SKILL.md` files by
  filesystem path. Skill file locations must not move; if a location does move, every known
  consumer config is updated in the same change.
- **C-5 — Deletion order is reversible per step.** Each removal — bundle emission + `dist/`
  bundles, sync script, drift library, drift hook + its wiring, queue gate, CI jobs,
  `.worktreeinclude`, `.gitignore` row, document oracles, docs — lands as its own commit, so
  a regression bisects to one artifact class. A single "delete everything" commit is
  disallowed even if the tree is green.
- **C-6 — The inventory is re-measured, not trusted.** §1.2's table is a 2026-08-08
  measurement. Before the first deletion commit the inventory is re-derived from the tree at
  that time and any artifact that appeared since is added to the plan — deletion sweeps fail
  by omission, not by excess.
- **C-7 — Repo CI stays green at every commit**, not only at the end of the sweep. A commit
  that deletes a script and leaves a CI job asserting its existence is a broken commit even
  if the next commit fixes it (this is what makes C-5's bisectability real).
- **C-8 — The engine path is the only path under test after the sweep.** Tests deleted with
  their subject (M-8) are removed, never skipped, marked pending, or left asserting a
  vacuous truth against an empty directory.
- **C-9 — No consumer file is deleted without operator invocation** (NG-6), and the cleanup
  step's refusal behaviour is at least as conservative as the retired sync tooling was toward
  a hand-edited or unattributable file.
- **C-10 — The plugin/engine version handshake is a hard gate, not a convenience.** The
  engine declares a compatible plugin version range and, before dispatching any skill,
  checks the installed plugin's version against it. A mismatch is a loud refusal — the run
  does not start — never a silent skew. Both the engine's version and the resolved plugin's
  version appear in the engine's startup banner and in every run report, whether the run
  succeeds, halts, or is refused at the handshake.

## 6. Acceptance Criteria

Every criterion is stated Who / Given / When / Then, and every one is checkable from the tree
or from an observed run — none depends on an agent reporting success.

### 6.1 The retirement surface is gone (P0)

- **AC-1.1** *Who:* maintainer. *Given* the sweep is complete at HEAD, *when* the tree is
  listed, *then* M-1, M-2, M-3, M-4, M-5 and M-6 do not exist as tracked files, and
  `pdlc/workflows/dist/` contains M-9 alone or is itself gone with M-9 relocated (G-5).
- **AC-1.2** *Who:* maintainer. *Given* HEAD, *when* the repo is searched for the retired
  machinery's names (the three scripts, the two bundles, the manifest, the drift-state
  record, the `distribution.checkEnabled` key), *then* the only surviving matches are
  historical records permitted by NG-4 — no instructional document, script, workflow, config
  schema, test or module comment references them.
- **AC-1.3** *Who:* maintainer. *Given* HEAD, *when* the workflow test suite runs, *then* it
  is green, contains no skipped or pending test belonging to M-8, and its file count has
  dropped by the number of dedicated test modules removed (C-8).
- **AC-1.4** *Who:* maintainer. *Given* HEAD, *when* CI runs on a pull request, *then* the
  `Generated artifacts are in sync` and `Fresh-clone bootstrap works` jobs no longer exist,
  the surviving shell-script job asserts only surviving scripts (no assertion naming a
  deleted entrypoint or the deleted sourced library), and every remaining job is green.
- **AC-1.5** *Who:* maintainer. *Given* HEAD, *when* `.worktreeinclude` and `.gitignore` are
  inspected, *then* neither carries a row whose only purpose was the consumer runtime copy;
  a file left with no remaining rows is deleted rather than left empty.
- **AC-1.6** *Who:* maintainer. *Given* HEAD, *when* the document-oracle suite runs, *then*
  the packaging and advertised-version checks that exist to police the deleted `dist/`
  bundles are gone with their tests, the document-drift scan carries no exemption for a tree
  that no longer exists, and the remaining oracles pass on this repo.
- **AC-1.7** *Who:* maintainer. *Given* HEAD, *when* the plugin's hook manifest is read,
  *then* it registers no drift-reporting `SessionStart` entry, and it still registers the
  harvest guard and both authoring-warning hooks (C-2, NG-1).
- **AC-1.8** *Who:* maintainer. *Given* the history of the sweep, *when* the commits are
  listed, *then* each artifact class of C-5 is its own commit and each of those commits is
  independently green in CI (C-7).

### 6.2 Documentation tells one story (P0)

- **AC-2.1** *Who:* a reader new to the repo. *Given* HEAD, *when* they read CLAUDE.md, both
  READMEs and `pdlc/RELEASE-CHECKLIST.md`, *then* they find no instruction to build runtime
  bundles, sync, force-sync, check drift, bootstrap a fresh clone's runtime artifacts, or
  work around the self-created-worktree gap — and they find exactly one described way to run
  the pipeline unattended.
- **AC-2.2** *Who:* the operator. *Given* HEAD, *when* `pdlc/RELEASE-CHECKLIST.md` is read,
  *then* every row whose subject was the retired machinery (package-carries-`dist/`,
  `dist/`-changed-without-version-bump, the drift/sync performance capture, and the
  manual-verification step that presumes a synced consumer copy) has been removed or
  rewritten against the engine's release artifact — no row instructs a check that cannot be
  performed.
- **AC-2.3** *Who:* the operator. *Given* HEAD, *when* `docs/_decisions/` and
  `docs/_queue/QUEUE.md` are read, *then* no live decision or open queue row still mandates
  the retired copy channel (BL-05, BL-06); superseded decisions carry an explicit superseding
  entry rather than silent contradiction.

### 6.3 The plugin still serves humans, and the engine cannot run without it (P0)

- **AC-3.1** *Who:* the operator in a consumer repo with the plugin installed and the
  engine installed. *Given* a ready queue row, *when* they invoke the queue orchestration
  skill, *then* the engine executes the feature and the skill's response relays the engine's
  run report, with no pipeline decision made inside the plugin.
- **AC-3.2** *Who:* the operator in a consumer repo with the plugin **not** installed.
  *Given* a ready queue row, *when* they invoke the engine directly from a terminal, *then*
  the engine refuses to dispatch any skill-driven phase and names the missing plugin as the
  cause — the plugin is demonstrably a hard runtime dependency, not optional (C-10, NG-1).
- **AC-3.3** *Who:* a human in a Claude Code session. *Given* the plugin, *when* they invoke
  each interactive skill, *then* each loads and runs, and the surviving hooks still fire
  (harvest guard refuses a premature review-file deletion; the scope-field and REQ-size
  warnings still emit).
- **AC-3.4** *Who:* a Ptah-configured consumer. *Given* HEAD, *when* it resolves every
  configured skill path, *then* each path exists (C-4).
- **AC-3.5** *Who:* the operator. *Given* an engine release and the plugin at a version
  inside the engine's declared compatible range, *when* the engine dispatches a skill,
  *then* it reads that skill from the installed plugin and the run report carries both the
  engine's and the plugin's version — there is no separate engine-side snapshot that can
  skew against the plugin (C-10, R-3).
- **AC-3.6** *Who:* the operator. *Given* the plugin installed at a version outside the
  engine's declared compatible range, *when* they invoke the engine, *then* it refuses
  before dispatching any skill, names both versions and the expected range in its refusal,
  and performs no pipeline action (C-10).

### 6.4 Consumer cleanup (P1)

- **AC-4.1** *Who:* the operator in a repo that previously hosted the runtime copy. *Given*
  a `.claude/workflows/` copy and a drift-state record present, *when* they run the
  documented cleanup step once, *then* both are gone and the repo's tracked files are
  unchanged.
- **AC-4.2** *Who:* the same operator. *Given* the cleanup has already run, *when* it is run
  again, *then* it succeeds, changes nothing, and says so (idempotence).
- **AC-4.3** *Who:* the same operator. *Given* an unexpected or hand-modified file inside the
  target directory, *when* the cleanup runs, *then* it refuses that file, leaves it in place,
  names it in its output, and exits in a way that makes the refusal visible (C-9).
- **AC-4.4** *Who:* a consumer repo owner who never adopts the cleanup. *Given* they do
  nothing, *when* they run a feature through the engine, *then* the leftover files are inert
  — nothing reads them and no warning about them is emitted.

### 6.5 Nothing deleted was load-bearing (P0)

- **AC-5.1** *Who:* the operator. *Given* every deletion of 6.1 is merged, *when* a real
  feature is run end-to-end through the engine in this repo, *then* it completes through its
  configured final phase and produces the same artifact classes as before the sweep (spec
  files, cross-reviews with verdicts and anchors, queue-row writes, a final report).
- **AC-5.2** *Who:* the operator. *Given* the same run, *when* the run report is compared
  against a pre-sweep run report of the engine path, *then* the fields differ only in
  feature-specific content — no field, phase or gate disappeared with the deleted machinery
  (NG-3).
- **AC-5.3** *Who:* the operator. *Given* HEAD after the sweep, *when* the probe CLI is
  invoked in a consumer repo, *then* it answers exactly as it did before, and it is still
  produced by a build step rather than maintained by hand (G-5).

## 7. Risks

- **R-1 — Premature retirement.** The strongest failure mode is deleting the old path before
  the engine has absorbed a semantics-heavy release cycle, leaving no working host if the
  engine turns out to have a gap. *Control:* C-1's evidence gate, judged by the operator, and
  C-5's per-step commits, which make a revert cheap and targeted.
- **R-2 — Hidden dependents.** The retired machinery is referenced far outside its own
  files: CI jobs, index-mode assertions, the release checklist, the document oracles (whose
  packaging and advertised-version checks take `pdlc/workflows/dist/` as their subject and
  whose drift scan *exempts* the generated trees), `.gitignore`, `.worktreeinclude`, hook
  wiring, both READMEs, CLAUDE.md, and header prose inside the workflow modules themselves.
  A partial sweep leaves a red oracle or a job asserting a deleted file. *Control:* C-6's
  re-measurement, AC-1.2's repo-wide search, and a per-artifact reference sweep recorded in
  the PLAN.
- **R-3 — Version skew between the plugin and the engine.** There is no engine-side snapshot
  of skill text to drift against — the engine reads every skill from the installed plugin at
  dispatch time — so the hazard is narrower than it once looked: an installed plugin version
  the engine does not declare compatible. *Control:* C-10's handshake refuses the run loudly
  and names both versions rather than letting a mismatched pair execute; AC-3.5 and AC-3.6
  make the refusal and the matched-version path both checkable. `pdlc-engine-distribution`
  R-2 tracks the companion hazard (declaring a range that is wrong) from the engine side.
- **R-4 — Deleting the drift scan's exemptions changes what the oracle sees.** The
  document-drift scan walks the whole tree and exempts the two generated directories.
  Removing those exemptions along with the directories is correct, but if any generated
  content survives elsewhere the oracle will start failing on it. *Control:* AC-1.6 requires
  the oracle suite green on this repo after the change, not merely compiled.
- **R-5 — The probe CLI's build orphaned.** M-9 is produced by the same script whose other
  outputs are being deleted. A sweep that removes the script wholesale silently turns a
  generated 476 KB artifact into an unmaintained checked-in file. *Control:* G-5 and AC-5.3
  make its continued generation a criterion.
- **R-6 — Consumer repos left with stale generated state forever.** Cleanup (G-4) is
  operator-invoked by design (NG-6), so repos the operator forgets keep dead files.
  *Accepted*, bounded by AC-4.4: the leftovers must be provably inert.
- **R-7 — Documentation retirement is the step most likely to be half-done**, because it is
  the least mechanical: prose about bootstrap ordering, `--force`, `unverified` rows and the
  worktree caveat lives in several documents at once. *Control:* AC-2.1's reader test states
  the bar as "cannot find instructions for the old path", which is falsifiable by search.
- **R-8 — Test-corpus loss hides a regression.** ≈17,800 test lines leave the suite (M-8).
  Some of those tests incidentally covered surviving behaviour (queue triage around the gate,
  hook-manifest compatibility). *Control:* C-8's no-skip rule plus an explicit PLAN step to
  re-home any assertion about surviving behaviour before its host file is deleted.

## 8. Obligations / Open Questions

Each row names where it is resolved. An obligation with no resolution owner is a blocking
gap, not a note.

- **O-1 — Which hooks survive.** Default: keep the harvest guard and both authoring-warning
  hooks (they serve interactive authoring, US-04); remove only the drift reporter. Resolved
  in this feature's FSPEC; the outcome is asserted by AC-1.7 and AC-3.3.
- **O-2 — How the delegator skills are authored.** Settled, not open: `orchestrate-dev` and
  `orchestrate-queue` stay as thin delegators (G-2), preserving the `/loop` habit — the
  plugin's hard-dependency role (C-10, NG-1) removes the "move the habit wholly to the
  terminal" alternative from consideration. What remains open is the delegator's exact
  shape (e.g. how it surfaces a C-10 refusal to the human session). Resolved in this
  feature's FSPEC before authoring the delegators; AC-3.1 assumes delegation and does not
  depend on this row.
- **O-3 — Where the probe CLI's build lives after `dist/` retires** (G-5, R-5): keep a
  reduced build step emitting it into a surviving directory, or move it to the engine as a
  subcommand (`pdlc-engine-distribution` O-4 defaults to leaving it local, which this REQ
  follows per NG-2). Resolved in this feature's TSPEC; AC-5.3 holds either way.
- **O-4 — Self-modification guard paths.** Phase MERGE's guard list names
  `pdlc/workflows/` and `.claude/workflows/`. When those directories change meaning or cease
  to exist, the list must still cover whatever holds engine-adjacent code, or the guard
  silently stops guarding. Resolved in this feature's TSPEC; if the resolution requires
  engine-side changes it is bound to a successor REQ under NG-5 rather than authored here.
- **O-5 — Documentation sweep inventory.** The retired concepts appear in CLAUDE.md, both
  READMEs, `pdlc/RELEASE-CHECKLIST.md` (four sections), decision docs and queue prose. The
  PLAN carries the enumerated list, derived at execution time per C-6, so AC-2.1's reader
  test has a checkable basis rather than a judgement call.
- **O-6 — Stale operator notes.** Stored operator notes describe the workflow-launcher
  registry cache and sync behaviours that stop existing at retirement. Correcting them is
  part of this feature's Phase H documentation step, not a follow-on — stale guidance about
  a deleted mechanism is worse than none.
- **O-7 — Queue rows 6 and 7.** Both describe the retired copy channel and both are
  `blocked`. Their disposition is decided upstream (`pdlc-engine-distribution` O-3, tracked
  here as BL-05); this REQ does not decide it, but AC-2.3 refuses to pass while an open row
  still mandates the retired channel.
