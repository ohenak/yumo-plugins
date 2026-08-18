---
feature: pdlc-plugin-retirement
ready: true
depends-on: [pdlc-headless-engine, pdlc-engine-distribution]
---

# REQ — pdlc-plugin-retirement

| Field | Value |
|---|---|
| Upstream | `pdlc-headless-engine`, `pdlc-engine-distribution`; adoption evidence per C-1; measured surface in `docs/_constraints/pdlc-retirement-baseline.md` |
| Downstream | — (terminal REQ of the family) |
| Cross-Reviews | — |
| LEARNINGS | — |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | approved — ready | Claude | 0.14 | 2026-08-18 |

*0.14 (2026-08-18) — upstream erratum round, one correction (Phase D erratum 3; SE FSPEC-v11 F-03, TE FSPEC-v11 F-01/F-02): §A-1 said the sweep **rewrites** `consolidate-learnings/SKILL.md`'s bundle reference "to name the surviving execution path"; no surviving host loads the consolidation module, so the reference is **deleted**, not rewritten, and the same is true of the skill's delegation prose. The capability that goes with it — the unattended, machinery-backed pass — is an operator decision this REQ cannot make alone, recorded as new O-8 with an unbound deferral flagged as a blocking gap. Baseline M-11n corrected with it.*

*0.13 (2026-08-18) — upstream erratum round, one correction (Phase D erratum 5; SE FSPEC-v11 F-01): the wave-gate pair is **not** retired. C-5's commit-class entry and AC-1.2's term-set rationale said the configured `postWaveCommand`/`postWavePathspecs` values retire; they survive, because the reduced build step still emits M-9 into `pdlc/workflows/dist/` under O-3. M-11h is a prose-and-assertion edit class, and the measured baseline's M-11h row is corrected with it.*

*0.12 (2026-08-18) — erratum round, one correction: C-7 now dispositions the held-branch interim state (SE erratum) — AC-1.1's unsatisfied set-equality while classes 7–12 are held is an incomplete feature on an unmerged branch, not a C-7 red and not a registered expected failure; ordering, never registration, is the resolution where a check would otherwise run red before its class lands.*

*0.11 (2026-08-17) — erratum round, three corrections: AC-5.2's allowed-difference set is now the exhaustive eight run-variable collections, counted correctly; C-9 drops the hand-edited-file clause that contradicted AC-4.3 (decided in AC-4.3's favour, not reconciled); AC-4.3 states the post-refusal directory state.*

*0.10 (2026-08-17) — erratum round. Three targeted corrections, nothing else: O-3 no longer leaves the manifest’s survival open — it does not survive, so AC-1.1’s set-equality with `{M-9}` stands unopposed (SE erratum 1); AC-5.2’s allowed-difference set now names the provenance version fields and the run-variable dispatch/outcome collections, which differ between two correct runs (SE erratum 2); AC-4.3 drops the hand-modified case, which no post-sweep artifact can detect, and keeps the unexpected-entry case (SE erratum 3).*

*0.9 (2026-08-17): the revision prescribed by `POSTMORTEM-R-pdlc-plugin-retirement.md`
§Recommendation (RESOLVED). AC-1.2 drops the survivor terms `build-runtime.mjs` and
`pdlc/workflows/dist/` and states the term set as a **set-equality** the FSPEC transcribes
literally with its expected-empty command (TE F-01 High, F-02, F-03); baseline round-5
corrections carried through (SE F-29, F-30; TE F-04); the partition's pinned expectation is the
empty remainder, not a total.*

*0.8 (2026-08-17): round 4. C-6's exhaustive partition executed for the first time and closed in
the baseline — 133 swept paths, 133 classified, remainder empty (SE F-27, TE F-01); M-11h scoped
as a config-**value** change, so the generic `postWavePathspecs` parser in `orchestrate-dev.js`
and its `waveExecution` coverage are named as survivors rather than deletions (SE F-27); AC-1.2's
search term defined as retired **artifact names and paths**, never a surviving identifier;
M-8/M-11e re-derived at their true extents and new rows M-11o/M-11p added (SE F-28, TE F-02);
AC-1.4 extended to `OPERATIONS.md`'s count word and named workflow files (TE F-03); O-3's
document-of-record wording corrected (TE F-04); C-6's "exactly one" scoped so A-1's overlapping
globs do not falsify it (TE F-05).*

*0.7 (2026-08-17): REQ cross-review round 3. The three `pdlc/skills/*/SKILL.md` files brought
into the inventory as baseline M-11n, with `consolidate-learnings`' disposition stated
(SE F-22); C-6 re-measurement made exhaustive — every swept path classified, remainder empty
(SE F-23); AC-1.1's branch pinned to the TSPEC only (SE F-24); AC-1.7/AC-3.3 pinned to the
sweep's base commit at C-6 time (TE F-02); AC-1.4 gains the instructional-doc check-set
equality (TE F-01); BL-08 extended to C-7's green transcript (SE F-25).*

*0.6 (2026-08-17): round 2. AC-1.2's allow-list completed and the two must-survive files named;
`pdlc/OPERATIONS.md` added to the documentation surface (M-11l); AC-1.7 restated as hook-set
equality; C-7/AC-1.4c anchored to a measured green pre-sweep baseline; AC-1.1's branch and
AC-1.2's wave-gate term pinned per C-6/O-3.*

*0.5 (2026-08-17): round 1. Measured surface relocated to
`docs/_constraints/pdlc-retirement-baseline.md` and re-measured (adds M-10, the M-11 set);
NG-5 carved out for the engine's compat declaration and its tests/fixtures; BL-01/02/05/07/08
re-derived or added; §6 restated as set-equalities and literal counts. 0.4 (2026-08-10):
queue-row references repointed to feature names; ready flipped by operator review. 0.3
(2026-08-08): operator decision — the plugin is retained permanently as the engine's skills
carrier and a hard runtime dependency behind a version handshake; only the workflow-execution
machinery retires.*

> **Scope in one line.** Once the headless engine is the proven execution path, retire the
> machinery that existed only to serve the workflow-runtime host, while the plugin stays
> installed permanently as the engine's skills carrier (G-1, G-2).

## 1. Problem / Context

After `pdlc-engine-distribution` lands, the repo carries two parallel execution paths for the
same pipeline, and the cost of keeping both is not hypothetical: an entire sub-system exists
**only** because the Claude Code workflow runtime loads workflow code from the consumer
project directory. Remove that host and every part of it becomes dead weight still built,
tested, documented, released and reasoned about on every future pipeline change.

Keeping both paths also re-creates the two-versions problem this family set out to kill
(`pdlc-engine-distribution` R-3), and keeps the drift *detection* apparatus alive after the
drift *cause* is gone.

### 1.1 User stories

| ID | Story |
|---|---|
| US-01 | As the operator, I want one execution path to reason about, so that a pipeline change is made and verified once rather than in two hosts with unlike capabilities. |
| US-02 | As the operator, I want the sync/drift apparatus gone once nothing can drift, so that I stop paying its maintenance, CI and release-checklist cost for a dead failure mode. |
| US-03 | As a consumer repo owner, I want a documented one-time cleanup, so that a repo that once hosted the runtime copy does not keep stale generated state forever. |
| US-04 | As a human in a Claude Code session, I want the interactive pdlc skills and their SessionStart nudges to keep working, so that retiring the unattended host does not cost me the mid-session tools. |

### 1.2 Measured retirement surface

The artifacts that exist *only* to serve the workflow-runtime host are measured once, into
`docs/_constraints/pdlc-retirement-baseline.md`, and cited from here by id: **M-1**…**M-10**
are the artifacts (M-9, the probe CLI, is the one survivor; M-10 is the third runtime bundle,
`dist/consolidate-learnings.bundle.js`), and **M-11a**…**M-11p** are the dependents that name
them from outside their own files (M-11l is the tracked deep-dive `pdlc/OPERATIONS.md`,
M-11m the engine-side observation tests, M-11n the three `pdlc/skills/*/SKILL.md` files that
instruct the retired path, M-11o two of the three surviving workflow modules' header banners
(the third, `orchestrate-queue.js`'s, sits under M-11i), M-11p the
retired-artifact assertions held in test modules M-8's regex does not reach; all were added at
the 2026-08-17 re-measurements).
That file carries each row's derivation command, its measured size and A-1, the allow-list
AC-1.2 excludes, so C-6's re-measurement is reproducible.

The dependent set (M-11) is what makes this a sweep rather than a delete: it reaches both CI
workflow files, the engine's suite and fixtures, a surviving oracle test, config, hooks,
ignore files, the release checklist, the skills, two live workflow modules and the instructional
docs. R-2 names the ones easiest to miss; O-5 carries the documentation share; C-5 turns each
class into its own commit.

**The M-11 rows are the inventory, and the sweep is the control on it — neither substitutes for
the other.** C-6's partition closed at `0e86f11a` (133/133) and again at `b73fb4de` (136/136),
each with an empty remainder and no path owned twice. The pinned expectation is that **empty
remainder**, never the total: A-1's feature-directory glob grows by one file per cross-review, so
the total moves while closure does not. Two facts from those runs bind the work downstream.
First, the sweep
is a **lower bound** on the dependent set, not its definition: M-11c (`ci-arrangement.test.js`)
and `.worktreeinclude` are real dependents that return **zero** sweep hits, because they name job
ids and a consumer directory rather than any retired artifact name — so an inventory row is still
required for anything no search term reaches. Second, the PLAN sizes the sweep from the
**partition's per-file dispositions**, not from M-11's row count: the row count is 16 and the
classified path count is in the low hundreds, and the rows the partition corrected (M-8, M-11e,
M-11h, M-11i, M-11p) each changed what their commit class costs.

Retirement is gated on evidence, not on the engine merely existing (C-1).

## 2. Prerequisites

Every row is a **hard** gate, checkable at Phase R time. The operator flipped this REQ to
`ready: true` on 2026-08-10; BL-01 and BL-02 are satisfied at HEAD in the form stated below.
No work starts until every row below reads satisfied.

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-headless-engine` delivered | `docs/completed/pdlc-headless-engine/` present, plus `QUEUE.md`'s removal note for that feature, cited by commit — this repo *removes* a delivered row rather than marking it `done` | Must hold at HEAD before FSPEC authoring |
| BL-02 | `pdlc-engine-distribution` delivered — the engine is installable and versioned | Same form as BL-01 (`docs/completed/pdlc-engine-distribution/` + removal note, cited by commit) | Must hold at HEAD before FSPEC authoring |
| BL-03 | Adoption evidence per C-1 (≥2 features end-to-end, ≥1 outside `yumo-plugins`, reports showing subscription auth and headroom routing) | Run reports cited by path/commit in this feature's FSPEC | Must hold before **any** deletion commit |
| BL-04 | Guard parity on the engine path (`pdlc-headless-engine` C-5 / AC-5.1 demonstrated) | Passing engine test + one observed unattended run | Must hold before the plugin's hook wiring is treated as optional (C-2) |
| BL-05 | Operator decision on the `pdlc-release-ci` queue row (the one live row still describing the retired copy channel), recorded per `pdlc-engine-distribution` O-3. `pdlc-install-mechanism` is already discharged — removed from the table 2026-08-13, closed as superseded, not delivered | Queue prose + row status change | Must hold before AC-1.2 can be true |
| BL-06 | `docs/_decisions/DECISIONS-plugin-distribution.md` reviewed for decisions that mandate the sync channel | Superseding entry in the same decision file | Must hold before AC-1.2 — a live decision doc outranks a deleted script |
| BL-07 | An engine release is **published** whose declared compatible-plugin range admits the plugin version this sweep ships (the sweep moves the plugin's version, which can leave the installed engine's declared window, and C-10's handshake would then refuse every run). Widening that declaration is in scope per NG-5; cutting the release is the operator's step | Published engine version + its declared range, cited by version and tag | Must hold before the **first** deletion commit is merged |
| BL-08 | A pre-sweep engine-path run report **and** the transcript of C-7's green gate-command run, captured and committed at fixed paths in this feature's directory, cited by path + commit. The transcript records each suite's summary counts (tests run, passed, failed), because a run that executed zero tests and exited 0 is not a green start | Committed report + transcript files | Must hold before the first deletion commit — AC-5.2's comparison and C-7's green start are both uncapturable afterwards |

## 3. Goals

- **G-1 — Single execution path.** The headless engine is the only way the pipeline runs
  unattended. The three workflow-runtime bundles (M-4, M-5, M-10), their manifest (M-6), the
  bundle emission in the build script (M-7) and the sync/drift apparatus (M-1, M-2, M-3) are
  deleted, with the tests that exist solely to cover them (M-8) and the CI jobs that gate
  them.
- **G-2 — Plugin sheds workflow machinery, keeps every skill, gains the delegator role.**
  The plugin is not slimmed to an optional convenience: it keeps **all** its skills
  permanently — human-invoked (`/pdlc:pm-author`, `/pdlc:dod-verify`, …) and orchestration
  (`orchestrate-dev`, `orchestrate-queue`) alike — plus the human-facing hooks (US-04). It
  sheds only the workflow-execution machinery (G-1). The orchestration skills become thin
  delegators: run the engine, relay its report, preserving the `/loop run
  /pdlc:orchestrate-queue` habit with no plugin-resident pipeline logic and no copy of the
  workflow code. The engine reads every skill from the installed plugin at dispatch time
  behind a version handshake (C-10).
- **G-3 — Docs and CI tell one story.** CLAUDE.md, `pdlc/OPERATIONS.md`, both READMEs,
  `pdlc/RELEASE-CHECKLIST.md` and the CI workflow describe only the surviving path. Retired
  concepts — drift states, `--force`, `unverified`, the two-command bootstrap and its
  ordering, the worktree caveat — are **removed**, not deprecated in place. A reader who never saw the old path must not be
  able to find instructions for it in a tracked file.
- **G-4 — Consumer cleanup is guided and conservative.** Each consumer repo's leftover
  `.claude/workflows/` copy and its drift-state record are removed by a documented, idempotent
  one-time operator step that refuses anything it did not expect rather than deleting
  broadly.
- **G-5 — The probe CLI survives the demolition intact.** `dist/pdlc-cli.mjs` (M-9) is
  emitted by the same build script that emits the retired bundles, so retirement must leave it
  available, generated (not hand-maintained) and unchanged in behaviour.

## 4. Non-Goals

- **NG-1 — Removing the pdlc plugin, or any of its skills.** The plugin
  is a **hard runtime dependency** of the engine, not an optional convenience. All skills —
  interactive and orchestration alike — and the human-facing hooks stay installed
  permanently. The engine reads `SKILL.md` sources from the installed plugin at dispatch time
  (not a snapshot), so one source of truth is preserved (CLAUDE.md's Ptah note, and C-4).
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
- **NG-5 — Changing the engine's *runtime capability*.** Any new or altered engine behaviour
  the plugin needs is owned by `pdlc-headless-engine`'s successors, not authored here.
  Explicitly **carved out and in scope**, because the sweep cannot leave the engine's own
  required check green otherwise: the engine's declared compatible-plugin range (BL-07), and
  the engine-side tests and fixture trees whose subject is a retired artifact (M-11c, M-11d,
  M-11e, M-11m). Editing those changes no engine behaviour; leaving them unedited reds a
  required check on the commit that deletes their subject, which C-7 forbids.
- **NG-6 — Consumer-side automation of the cleanup.** G-4's step is operator-invoked; no
  hook, session-start action or engine startup path deletes consumer files on its own.

## 5. Constraints

- **C-1 — Evidence gate (threshold declaration).** Retirement work starts only after the
  engine has met all four thresholds below. Owner: the operator, who judges sufficiency; the
  pipeline never decides this. Evidence is cited by report path and commit in the FSPEC
  (BL-03).

  | Threshold | Default | Owner |
  |---|---|---|
  | Features run end-to-end on the engine | ≥ 2 | operator |
  | …of which run in a repo other than `yumo-plugins` | ≥ 1 | operator |
  | Run reports showing subscription auth as the auth source | all of them | operator |
  | Run reports showing traffic routed through the local headroom proxy | all of them | operator |

- **C-2 — Guard parity precedes any reliance on hook removal.** The
  `guard-harvest-before-delete` invariant must be enforced on the engine path (BL-04) before
  the plugin's hooks stop enforcing it for unattended runs. Interactive sessions keep the
  plugin's `PreToolUse` and `PostToolUse` hooks per NG-1; of the two `SessionStart` entries
  only the drift reporter is removed, because the condition it reports ceases to exist.
- **C-3 — The queue drift gate is removed, not bypassed.** The gate and its
  `distribution.checkEnabled` key leave the workflow modules with **all** their coverage —
  including the engine-side share (M-11d, M-11m), which NG-5's carve-out puts in scope.
  No dead flag, no permanently-true branch, and no config key a consumer can set with no
  effect. A consumer config still carrying the key is ignored silently, not an error.
- **C-4 — Ptah keeps working.** `ptah.config.json` consumers read `SKILL.md` files by
  filesystem path. Skill file locations must not move; if a location does move, every known
  consumer config is updated in the same change.
- **C-5 — Deletion order is reversible per step.** Each removal — bundle emission + the three
  `dist/` bundles, sync script, drift library, drift hook + its wiring, queue gate (with its
  engine-side coverage), CI jobs **in both `pr-tests.yml` and `publish.yml`'s tag gate**, the
  wave-gate class (M-11h — a prose-and-assertion edit, not a value retirement: the configured
  post-wave command and pathspec both survive, because the reduced build step still emits M-9
  into `pdlc/workflows/dist/` under O-3), `.worktreeinclude`, the `.gitignore` row, document
  oracles, the skill files (M-11n), the three workflow modules' header banners (M-11o, M-11i), the
  retired-artifact assertions inside surviving test modules (M-11p), docs — lands as its own commit, so a regression bisects to one artifact class. A single
  "delete everything" commit is disallowed even if the tree is green. Where C-7 and this
  constraint conflict — a class whose dependents span channels, such as the CI jobs bound to
  `publish.yml`'s gate by a set-equality assertion — **C-7 wins**: the commit covers the whole
  class rather than splitting into a red intermediate state.
- **C-6 — The inventory is re-measured, not trusted.** The baseline cited in §1.2 is a
  2026-08-17 measurement. Before the first deletion commit the inventory is re-derived with
  that file's stated commands, the file is updated, and any artifact or dependent that
  appeared since is added to the plan — sweeps fail by omission, not excess. The same
  re-measurement transcribes the literal expected values of AC-1.3, AC-1.7 and AC-3.3, each
  pinned to the sweep's base commit — "pre-sweep" means that commit, not whatever HEAD is
  mid-sweep. It is also **exhaustive, not curated**: every path the dependent sweep returns is
  classified into exactly one of the three **classes** — an M-row, an M-11 row or A-1 — with the
  unclassified remainder empty and no path owned twice. Exactly one *class*, not exactly one
  glob: A-1's globs deliberately overlap (`**/LEARNINGS-*.md` and `**/POSTMORTEM-*.md` cover four
  files `docs/completed/**` already covers), which is why the criterion is stated over classes.
  Three review rounds each found a file the curated inventory had missed (M-10,
  `pdlc/OPERATIONS.md`, `pdlc/skills/**`), and the partition's own first execution found 24 more;
  a set-equality over the sweep's whole output fails on the next one instead of shipping it. The
  partition is **already closed once**, at `0e86f11a`, in the baseline's **Partition** section —
  the re-measurement re-runs it against the sweep's base commit and closes it again, it does not
  discover it for the first time mid-sweep. Because the sweep is a lower bound (§1.2), an empty
  remainder proves no *unknown* path exists; it does not prove the inventory is complete, and a
  dependent no search term reaches is added by reading, not by re-running the command.
- **C-7 — Repo CI stays green at every commit**, not only at the end of the sweep. A commit
  that deletes a script and leaves a CI job asserting its existence is a broken commit even
  if the next commit fixes it (this is what makes C-5's bisectability real). "Stays green"
  presupposes a green start: the engine suite is green at pre-sweep HEAD as of 2026-08-17
  (measured; the transcript is captured under BL-08, since a suite that runs zero files also
  exits 0). Any inherited red is repaired
  before the first deletion commit, so the first red the sweep sees is its own.

  **Held classes and the interim state.** C-7 governs the repo's own CI checks at each commit.
  It does not govern this REQ's completion criteria, which are evaluated when the sweep is
  complete (AC-1.1's *given* says so). So while a deletion class is held pending an upstream
  disposition, AC-1.1 being unsatisfied is simply an incomplete feature on an unmerged branch —
  it is **not** a C-7 red, it is **not** registered anywhere as an expected or tolerated failure,
  and it does not forbid the ungated classes from landing as their own commits. There is no
  skip-list, no expected-failure inventory and no tolerated-red register in this feature: C-8
  already forbids that shape, and a criterion that is allowed to be red by registration stops
  being a criterion. Where a check that observes a held class would otherwise run red in repo CI
  before that class lands, the resolution is ordering — the check becomes live with the class it
  covers — never registration. The branch does not merge on a green subset: completion is all
  criteria satisfied at HEAD, held classes included.
- **C-8 — The engine path is the only path under test after the sweep.** Tests deleted with
  their subject (M-8) are removed, never skipped, marked pending or left asserting a vacuous
  truth against an empty directory.
- **C-9 — No consumer file is deleted without operator invocation** (NG-6), and an entry the
  cleanup's expected set does not name is refused rather than removed (AC-4.3). Conservatism
  toward a *hand-modified expected* entry is deliberately outside the constraint: no post-sweep
  artifact records the hashes that would let anything tell a modified copy from an original.
- **C-10 — The plugin/engine version handshake is a hard gate, not a convenience.** The
  engine declares a compatible plugin version range and, before dispatching any skill, checks
  the installed plugin's version against it. A mismatch is a loud refusal — the run does not
  start — never a silent skew. Both versions appear in the engine's startup banner and in
  every run report, whether the run succeeds, halts or is refused.

## 6. Acceptance Criteria

Every criterion is stated Who / Given / When / Then and is checkable from the tree or an
observed run — none depends on an agent reporting success.

### 6.1 The retirement surface is gone (P0)

- **AC-1.1** *Who:* maintainer. *Given* the sweep is complete at HEAD, *when* the tree is
  listed, *then* M-1, M-2, M-3, M-4, M-5, M-6 and M-10 do not exist as tracked files, and the
  entry set of `pdlc/workflows/dist/` **set-equals** `{M-9}` — or the directory is gone with
  M-9 relocated to a single named surviving path (G-5). Set-equality, not containment: an
  artifact added to `dist/` between now and the sweep fails this criterion rather than
  slipping through. Which branch applies, and the surviving path if it is the second, is
  pinned in this feature's **TSPEC**, where O-3 resolves it (AC-1.3's literal count stays
  FSPEC-pinned) — a test author never chooses the branch.
- **AC-1.2** *Who:* maintainer. *Given* HEAD, *when* the repo's tracked files are searched
  for the retired machinery's names **excluding** the measured
  path-glob allow-list **A-1** of `docs/_constraints/pdlc-retirement-baseline.md`, *then* the
  result is **empty**.

  The term set is a **set-equality, not an upper bound**: it **is exactly** the names of the
  retired artifacts and the records that hold them — the three retired scripts, the three retired
  bundles, `distribution-manifest`, the drift-state record, and the `distribution.checkEnabled`
  key. Adding a term fails this criterion and removing one fails it too, so it can be neither
  widened into a survivor nor quietly narrowed by an implementer arguing a term away to green a
  red search. The FSPEC transcribes at C-6 re-measurement time both the literal term list and the
  literal expected-empty command carrying it, as AC-1.3's literal count already is. No surviving
  identifier is a member: `build-runtime.mjs` and
  `pdlc/workflows/dist/` are **not** terms (M-7 is reduced, not deleted, and AC-1.1 requires M-9
  to survive, so either would red permanently on files this REQ keeps), and neither is the bare
  key `postWavePathspecs` (M-11h retires neither the key nor its configured value: the reduced
  build step still emits M-9 into `pdlc/workflows/dist/` under O-3, so the configured post-wave
  command and pathspec keep naming live outputs, `orchestrate-dev.js` keeps the generic parser
  and `waveExecution.test.js` keeps its coverage). M-11h's per-file dispositions are therefore
  prose-and-assertion edits about that pair, not removals of it. The baseline's sweep recipe is a documented
  **superset** of this set, its delta and that delta's owners named there.

  A-1 is complete over the tracked files carrying these names at the
  partition's measurement (`0e86f11a`), and its closing paragraph names the two that **must survive carrying
  them**, so AC-1.2 and AC-2.3 are co-satisfiable, not mutually exclusive. The two tracked fixture trees (M-11e) are
  **not** allow-listed: `consumer-ac12/` (6 hits, tree-wide) is deleted with its only consumer,
  and `covered-violations/` (4 hits, tree-wide) is re-fixtured because the `coveredViolations`
  oracle it serves survives. Neither are the three
  skill files (M-11n): the sweep edits all three — the two orchestration skills as G-2's
  delegators, and `consolidate-learnings/SKILL.md`, a human-invoked skill NG-1 keeps, whose
  retired-bundle reference is **deleted, not rewritten**: no surviving host loads the
  consolidation module after the sweep, so there is no execution path for the reference to name.
  That skill's delegation prose is edited on the same grounds, and what the pass then is —
  human-performed in session, or re-hosted under the engine — is O-8, not a sweep decision.
  A-1 **does** allow-list
  three fixture *corpora* documents (the two `CODE_REVIEW-pdlc-consolidation-agent-v{5,6}.md`
  and `planParse/plan-workflow-distribution.excerpt.md`): they are sample data parsed as input
  by surviving suites, and editing them would change what those parsers are proven against for a
  reason that is not this feature's. That glob names the two corpora explicitly rather than
  `__tests__/fixtures/**`, which would wrongly exempt `covered-violations/`. So this is a
  search with an exclude list and a required-empty result, not a judgement call.
- **AC-1.3** *Who:* maintainer. *Given* HEAD, *when* the workflow test suite runs, *then* it
  is green; it contains no skipped or pending test belonging to M-8; its `*.test.js` file
  count equals the **literal** number transcribed into the FSPEC at C-6 re-measurement time;
  and every module named *retained* in that same FSPEC list — including the re-homed
  assertions R-8 requires (queue triage, hook-manifest compatibility) — is present and
  passing.
- **AC-1.4** *Who:* maintainer. *Given* HEAD, *when* CI runs on a pull request, *then* the
  `Generated artifacts are in sync` and `Fresh-clone bootstrap works` jobs no longer exist,
  the surviving shell-script job asserts only surviving scripts (none naming a deleted
  entrypoint or the deleted sourced library), and every remaining job is green; and the check
  rows described in the tracked instructional docs — CLAUDE.md's `### Continuous integration`
  section and `pdlc/OPERATIONS.md`'s `## Continuous integration` rationale (M-11l) —
  **set-equal** the post-sweep required-check set, so a doc left describing a deleted job fails
  here rather than surviving a name-based search. The set-equality is not the whole conjunct:
  `pdlc/OPERATIONS.md:59` opens that section with a **count word** ("six checks") and names the
  **two workflow files** the checks live in, and neither is covered by any oracle — a sweep that
  drops a job and updates the bullets can leave "six" and a stale file name standing. So AC-1.4
  also requires that section's count word to equal the surviving check count and its named
  workflow files to set-equal the files those checks are defined in — the same three-part
  assertion M-11c already makes over CLAUDE.md, extended to the document that has no test.
- **AC-1.4b** *Who:* maintainer. *Given* HEAD, *when* `.github/workflows/publish.yml` is read
  and its tag-triggered gate is exercised (or statically asserted against the surviving job
  set), *then* no step invokes a deleted artifact — no build-and-check of the retired bundles,
  no two-command bootstrap, no sync invocation, no executable-bit assertion naming a deleted
  script — and the release path still gates on the surviving checks. A failure here surfaces
  only at the next release tag, so it is asserted before the sweep closes.
- **AC-1.4c** *Who:* maintainer. *Given* each commit of the sweep, *then* the **engine** test
  suite is green when run — including the arrangement oracle over the CI job set and
  CLAUDE.md's `### Continuous integration` section, its table and its prose count word
  (M-11c), the drift-gate smoke cases (M-11d) and the observation tests (M-11m). The baseline
  this preserves is a measured green, not an assumption: the suite is green at pre-sweep HEAD
  per C-7.
- **AC-1.5** *Who:* maintainer. *Given* HEAD, *when* `.worktreeinclude` and `.gitignore` are
  inspected, *then* neither carries a row whose only purpose was the consumer runtime copy,
  each deleted row's explanatory comment block goes with it, and a file left with no remaining
  rows is deleted rather than left empty. The `.gitignore` row's stated second effect —
  keeping a nested fixture tree addable — is discharged by that fixture's own disposition
  under AC-1.2, not left implicit.
- **AC-1.6** *Who:* maintainer. *Given* HEAD, *when* the document-oracle suite runs **against
  a clean tracked-files-only checkout** (untracked caches and editor backups change this
  oracle's result independently of the diff), *then* the packaging and advertised-version
  checks policing the deleted `dist/` bundles are gone with their tests, the document-drift
  scan carries no exemption for a tree that no longer exists, the surviving assertion
  requiring CLAUDE.md to *contain* the two retired script names (M-11f) is gone with the prose
  it guarded, and the remaining oracles pass.
- **AC-1.7** *Who:* maintainer. *Given* HEAD, *when* the plugin's hook manifest is read,
  *then* its registered hook-entry set **set-equals** the listing transcribed at C-6
  re-measurement time from the sweep's base commit (each entry by event and script name), minus
  exactly one entry, the drift reporter (C-2, NG-1). Set-equality, not absence plus a partial positive:
  a second `SessionStart` entry — the consolidation nudge — survives, so deleting the whole
  `SessionStart` event, or any other entry, fails instead of passing an absence check.
- **AC-1.8** *Who:* maintainer. *Given* the history of the sweep, *when* the commits are
  listed, *then* each artifact class of C-5 is its own commit; and *when* the sweep range is
  replayed commit-by-commit with the gate command set run at each one — named, because hosted
  CI runs on the PR head and never on intermediate commits — *then* every commit passes. The
  FSPEC enumerates that command set (workflow suite, engine suite, shell-syntax sweep); the
  criterion is satisfied by pasted output of that replay, not by inspection (C-7).

### 6.2 Documentation tells one story (P0)

- **AC-2.1** *Who:* a reader new to the repo. *Given* HEAD, *when* they read the tracked
  instructional set — CLAUDE.md, `pdlc/OPERATIONS.md` (M-11l), both
  READMEs, `pdlc/RELEASE-CHECKLIST.md` and the three `pdlc/skills/*/SKILL.md` files of M-11n
  (skills are instructions a human reads, so G-3's bar binds them) — *then* they find no instruction to build runtime
  bundles, sync, force-sync, check drift, bootstrap a fresh clone's runtime artifacts, or work
  around the self-created-worktree gap; those sections are removed, not left behind a pointer
  (G-3); and they find exactly one described way to run the pipeline unattended.
- **AC-2.2** *Who:* the operator. *Given* HEAD, *when* `pdlc/RELEASE-CHECKLIST.md` is read,
  *then* every row whose subject was the retired machinery (package-carries-`dist/`,
  `dist/`-changed-without-version-bump, the drift/sync performance capture, and the
  manual-verification step presuming a synced consumer copy) is removed or rewritten against
  the engine's release artifact — no row instructs a check that cannot be performed.
- **AC-2.3** *Who:* the operator. *Given* HEAD, *when* `docs/_decisions/` and
  `docs/_queue/QUEUE.md` are read, *then* no live decision or open queue row still mandates
  the retired copy channel (BL-05, BL-06); superseded decisions carry an explicit superseding
  entry rather than silent contradiction.

### 6.3 The plugin still serves humans, and the engine cannot run without it (P0)

- **AC-3.1** *Who:* the operator in a consumer repo with plugin and engine installed. *Given*
  a ready queue row, *when* they invoke the queue orchestration skill, *then* the engine
  executes the feature and the skill's response relays its run report, with no pipeline
  decision made inside the plugin.
- **AC-3.2** *(pre-satisfied at HEAD — regression guard; C-10's handshake ships today in the
  engine's handshake module, verified 2026-08-17)* *Who:* the operator in a
  consumer repo with the plugin **not** installed. *Given* a ready queue row, *when* they
  invoke the engine directly from a terminal, *then* the engine refuses to dispatch any
  skill-driven phase and names the missing plugin as the cause — asserted **after** the
  sweep, so the refusal is shown to survive the removal of the plugin's workflow machinery
  (C-10, NG-1).
- **AC-3.3** *Who:* a human in a Claude Code session. *Given* the plugin, *when* the set of
  `pdlc/skills/*/SKILL.md` at HEAD is compared against the skill-directory listing transcribed
  at C-6 re-measurement time from the sweep's base commit, *then* the two
  **set-equal** (no skill lost to the sweep — NG-1), each skill in that set loads and runs
  when invoked, and every hook in AC-1.7's surviving set still fires (harvest guard refuses a
  premature review-file deletion; the scope-field and REQ-size warnings emit; the
  consolidation nudge reaches the human session).
- **AC-3.4** *Who:* a Ptah-configured consumer. *Given* HEAD, *when* it resolves each
  configured skill path, *then* the path exists (C-4).
- **AC-3.5** *(pre-satisfied at HEAD — regression guard, verified 2026-08-17)* *Who:* the
  operator. *Given* the published engine of BL-07 and the post-sweep plugin version inside
  its declared compatible range, *when* the engine dispatches a skill, *then* it reads that
  skill from the installed plugin and the run report carries both versions — there is no
  separate engine-side snapshot that can skew against the plugin (C-10, R-3). The post-sweep
  version pair is what makes this more than a re-assertion.
- **AC-3.6** *(pre-satisfied at HEAD — regression guard, verified 2026-08-17)* *Who:* the
  operator. *Given* the plugin installed at a version outside the engine's declared
  compatible range, *when* they invoke the engine, *then* it refuses before dispatching any
  skill and performs no pipeline action, and the **terminal output of that invocation** —
  banner plus refusal together, not the refusal line alone — carries the engine's version, the
  plugin's version and the expected range; the run report carries the same three (C-10).
  Stated as the observable block rather than one string, because the refusal message's own
  wording is engine-side and out of scope under NG-5.

### 6.4 Consumer cleanup (P1)

- **AC-4.1** *Who:* the operator in a repo that previously hosted the runtime copy. *Given* a
  `.claude/workflows/` copy and a drift-state record present, *when* they run the documented
  cleanup step once, *then* both are gone and the repo's tracked files are unchanged.
- **AC-4.2** *Who:* the same operator. *Given* the cleanup has already run, *when* it runs
  again, *then* it succeeds, changes nothing and says so (idempotence).
- **AC-4.3** *Who:* the same operator. *Given* an **unexpected entry** inside the target
  directory — an entry the cleanup's own expected set does not name — *when* the cleanup runs,
  *then* it leaves that entry **byte-identical**, names its path on stderr and exits
  **non-zero**, so the refusal is checkable without reading the implementation (C-9). The
  refusal deletes nothing at all: every expected entry the directory held before the run is
  still present and byte-identical after it, so the post-refusal directory state is checkable
  as a whole and not only for the unexpected entry. Hand-modification of an expected entry is
  **not** covered (C-9).
- **AC-4.4** *Who:* a consumer repo owner who never adopts the cleanup. *Given* they do
  nothing, *when* they run a feature through the engine, *then* the run reaches its configured
  final phase and its report set-equals that of the same run in a repo with no leftovers, and
  neither the output nor the report mentions the leftover paths — a positive outcome plus the
  absences, so an unrelated failure cannot satisfy it.

### 6.5 Nothing deleted was load-bearing (P0)

- **AC-5.1** *Who:* the operator. *Given* every deletion of 6.1 is merged, *when* a real
  feature is run end-to-end through the engine in this repo, *then* it completes through its
  configured final phase and produces the same artifact classes as before (spec files,
  cross-reviews with verdicts and anchors, queue-row writes, a final report).
- **AC-5.2** *Who:* the operator. *Given* the same run, *when* its report is compared against
  the pre-sweep baseline report committed under BL-08 (cited by path and commit), *then* the
  two reports' **field sets are equal** — an added *or* removed field fails — and values differ
  only within the enumerated allowed set, which is exhaustive — any field outside it must match
  exactly. The set is: feature name, timestamps, ids, paths, the recorded engine-version and
  plugin-version provenance values, and the report's eight run-variable collections — the
  per-dispatch auth-source rows (`authSources`), the startup ladder (`startup`), the dispatch
  counts (`dispatches`), the retry, pause and denial logs (`retries`, `pauses`, `denials`), the
  loop record (`loop`) and the outcome counts (`outcomes`). Each of those eight varies between
  two *correct* runs, so a criterion demanding its equality would fail on a good sweep; each is
  compared for presence, not for content. No field, phase or gate disappeared with the deleted machinery (NG-3).
- **AC-5.3** *Who:* the operator. *Given* HEAD after the sweep, *when* they invoke the probe
  CLI **at its surviving repo path, directly, in a checkout of the consuming project** — the
  post-sweep delivery path settled under O-3 — *then* it answers exactly as before, and is still
  produced by a build step rather than maintained by hand (G-5).

## 7. Risks

- **R-1 — Premature retirement.** Deleting the old path before the engine has absorbed a
  semantics-heavy release cycle leaves no working host if the engine has a gap. *Control:*
  C-1's evidence gate, judged by the operator, and C-5's per-step commits, which make a
  revert cheap and targeted.
- **R-2 — Hidden dependents.** The retired machinery is referenced far outside its own files:
  the whole M-11 set, of which these are the hardest to miss correctly, each redding a required
  check on the commit that ignores it — `publish.yml`'s tag-triggered gate (M-11b), the
  engine-side oracles
  over CLAUDE.md's CI section, its table **and its prose count word**, the drift gate and a
  bundle path (M-11c, M-11d, M-11m), a *surviving* oracle test requiring CLAUDE.md to keep
  naming the two deleted scripts, so prose and test move together (M-11f), the wave-gate
  config values this feature's own implementation phase runs under (M-11h), the skill files
  (M-11n), the banners inside three live workflow modules (M-11o and M-11i), and the surviving
  test modules asserting over the deleted `dist/` artifacts (M-11p). A partial sweep leaves a red
  oracle or a job asserting a deleted file. The residual hazard is now shaped, not open: the
  partition ran twice and closed both times, so what remains hidden is only what **no search term can
  reach** — M-11c and `.worktreeinclude` are the two measured instances, and both are in the
  inventory. *Control:*
  C-6's **exhaustive** re-measurement over the sweep, plus inventory rows for the dependents the
  sweep cannot see; AC-1.2's search with an enumerated allow-list,
  AC-1.4b/AC-1.4c, and a per-artifact reference sweep in the PLAN. **The PLAN sizes its tasks
  from the partition's per-file dispositions, not from the M-11 row count** — the corrected M-8
  (27 files / 17,133 lines), M-11e (10 fixture files, two dispositions) and M-11p (7 paths,
  including the reduced `driftGenerators.js` it now solely owns) are each larger than their row
  suggests.
- **R-3 — Version skew between the plugin and the engine.** There is no engine-side snapshot
  of skill text to drift against — the engine reads every skill from the installed plugin at
  dispatch time — so the hazard is narrow: an installed plugin version the engine does not
  declare compatible. *Control:* C-10's handshake refuses the run loudly and names both
  versions; AC-3.5 and AC-3.6 make the refusal and the matched-version path both checkable.
  The sharp form is this feature's own: the sweep moves the plugin's version, which can land
  it outside the installed engine's declared window and turn the handshake into an outage on
  the retirement commit. *Control:* BL-07 gates the first deletion on a published engine whose range admits
  the post-sweep plugin version. `pdlc-engine-distribution` R-2 tracks the companion hazard
  (declaring a range that is wrong) from the engine side.
- **R-4 — Deleting the drift scan's exemptions changes what the oracle sees.** The
  document-drift scan walks the whole tree, exempting the two generated directories.
  Removing those exemptions with the directories is correct, but any generated content
  surviving elsewhere then reds the oracle. *Control:* AC-1.6 requires
  the oracle suite green on this repo after the change, not merely compiled.
- **R-5 — The probe CLI's build orphaned.** M-9 is produced by the same script whose other
  outputs are being deleted; removing that script wholesale turns the largest generated
  artifact in the tree into an unmaintained checked-in file. *Control:* G-5 and AC-5.3 make
  its continued generation a criterion.
- **R-6 — Consumer repos left with stale generated state forever.** Cleanup (G-4) is
  operator-invoked by design (NG-6), so repos the operator forgets keep dead files.
  *Accepted*, bounded by AC-4.4: leftovers must be provably inert.
- **R-7 — Documentation retirement is the step most likely to be half-done**, because it is
  the least mechanical: prose about bootstrap ordering, `--force`, `unverified` rows and the
  worktree caveat lives in CLAUDE.md and `pdlc/OPERATIONS.md` at once. *Control:* AC-2.1's
  reader test states
  the bar as "cannot find instructions for the old path", which is falsifiable by search.
- **R-8 — Test-corpus loss hides a regression.** M-8's ~17,100 lines across 27 files leave the
  suite (21 `*.test.js` plus the six helpers that serve only them),
  and with them some incidentally covered surviving behaviour (queue triage around the gate,
  hook-manifest compatibility). The re-derived figure matters: the earlier ~15,000/21-file
  reading omitted the helper set, which no surviving module imports. One helper is the
  exception and must not be deleted with the class — `helpers/driftGenerators.js`, whose
  `seeded`/`resolveSeed`/`shrink` primitives eight surviving modules import; it is
  reduced to those primitives instead, by a fresh consumer scan. *Control:* C-8's no-skip rule plus an explicit PLAN step to
  re-home any assertion about surviving behaviour before its host file is deleted.

## 8. Obligations / Open Questions

Each row names where it is resolved. An obligation with no resolution owner is a blocking gap,
not a note.

- **O-1 — Which hooks survive.** Default: keep the harvest guard, both authoring-warning
  hooks and the consolidation nudge (they serve interactive authoring, US-04); remove only the
  drift reporter. Resolved in this feature's FSPEC; asserted by AC-1.7 and AC-3.3.
- **O-2 — How the delegator skills are authored.** Settled, not open: `orchestrate-dev` and
  `orchestrate-queue` stay as thin delegators (G-2), preserving the `/loop` habit. Open only is the delegator's exact shape (e.g. how it surfaces a C-10 refusal to
  the human session). Resolved in this feature's FSPEC before authoring the delegators;
  AC-3.1 assumes delegation and does not depend on this row.
- **O-3 — Where the probe CLI's build lives after `dist/` retires, and how it reaches its
  caller** (G-5, R-5). Settled in principle: the retired sync channel was its only installer
  and the retired runtime adapter its only caller, so post-sweep it is a repo-local artifact
  the operator invokes directly at its generated path (AC-5.3), kept generated by a reduced
  build step — `pdlc-engine-distribution` O-4 closed it as project-local, which NG-2 follows.
  The manifest does **not** survive for that one row: it is a retired term of AC-1.2, so a
  surviving copy would red that criterion permanently, and AC-1.1's set-equality of the
  `dist/` entry set with `{M-9}` holds without exception. Open only is *which* surviving
  directory holds the probe CLI's build. Resolved in this feature's TSPEC, where AC-1.1's
  branch is then pinned; AC-1.3's literals stay in the FSPEC.
- **O-4 — Self-modification guard paths.** Phase MERGE's guard list names `pdlc/workflows/`
  and `.claude/workflows/`. When those directories change meaning or cease to exist, the list
  must still cover whatever holds engine-adjacent code, or the guard silently stops guarding.
  Resolved in this feature's TSPEC; if the resolution requires engine-side changes it is bound
  to a successor REQ under NG-5 rather than authored here.
- **O-5 — Documentation sweep inventory.** The retired concepts appear in CLAUDE.md (asserted
  by M-11c and M-11f — prose and assertions move in
  one commit), `pdlc/OPERATIONS.md` (M-11l, whose CI section's count word and named workflow
  files AC-1.4 now binds), the three skill files (M-11n), the three workflow modules' header
  banners (M-11o and M-11i), both READMEs,
  `pdlc/RELEASE-CHECKLIST.md` (≥4 sections), decision docs and queue prose. The PLAN carries the enumerated list, derived at execution time per C-6, so
  AC-2.1's reader test has a checkable basis rather than a judgement call.
- **O-6 — Stale operator notes.** Stored operator notes describe the workflow-launcher
  registry cache and sync behaviours that stop existing at retirement. Correcting them is
  part of this feature's Phase H documentation step, not a follow-on.
- **O-7 — The one live queue row that still describes the retired copy channel.** Re-derived
  from `QUEUE.md` at HEAD by feature name: it is `pdlc-release-ci` (status `blocked`,
  renarrowed 2026-08-13). `pdlc-install-mechanism` is discharged — removed from the table
  2026-08-13, closed as superseded. `pdlc-release-ci`'s disposition is decided upstream
  (`pdlc-engine-distribution` O-3, tracked here as BL-05); this REQ does not decide it, but
  AC-2.3 refuses to pass while it still mandates the retired channel.
- **O-8 — What the consolidation pass is after the sweep (operator decision, blocking).** The
  `consolidate-learnings` skill survives under NG-1 and stays invocable, but the sweep leaves no
  host that loads the consolidation module, so the *unattended, machinery-backed* pass — the one
  the skill's own text says it delegates rather than performs, warning that hand-running it
  bypasses the log boundary, duplicate suppression and the in-progress marker — stops being
  available. This REQ cannot settle that alone and the FSPEC must not: it is a user-visible
  capability change, so the operator decides between (a) **accepted loss** — the in-session pass
  is human-performed, the skill's delegation prose is rewritten to say so honestly, and the
  machinery-backed pass is bound to a successor: a queue row plus a named successor REQ file for
  re-hosting under the engine, both raised **before the first deletion commit** (NG-5 carves the
  engine-side work out of this feature, not out of the obligation to bind it); or (b) **blocking
  predecessor** — re-hosting ships first and this feature gains a BL row for it. Until the
  operator answers, (a) is the assumption of record and is vetoable; the deferral is **not yet
  bound**, which is the one open blocking gap this REQ carries. AC-3.3's "loads and runs when
  invoked" conjunct is read as the skill loading and running, never as the retired module being
  invoked.
