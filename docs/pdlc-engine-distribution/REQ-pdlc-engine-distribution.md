---
feature: pdlc-engine-distribution
ready: true
depends-on: [pdlc-headless-engine]
---

# REQ — pdlc-engine-distribution

| Field | Value |
|---|---|
| Upstream | `pdlc-headless-engine`; proposes superseding the `pdlc-install-mechanism` deferrals D-DIST-01/02/03/05; proposes absorbing/renarrowing `pdlc-release-ci` (D-DIST-06 release remainder) |
| Downstream | `pdlc-plugin-retirement` |
| Cross-Reviews | `CROSS-REVIEW-software-engineer-REQ-v1.md`, `CROSS-REVIEW-test-engineer-REQ-v1.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft — in review (Phase R) | Claude | 0.7 | 2026-08-13 |

*0.7 (2026-08-13, review round 1): §1.1 re-measured at `89babe8e` and its code-level facts moved
to `docs/_constraints/pdlc-engine-baseline.md` as M-ENG-10…M-ENG-13, cited by id. BL-03 resolved
by new **O-7** (two versions of record; the tag is an engine tag), so T-1, AC-1.4 and AC-3.6 name
which value they read. O-8 extended to all three publish blockers (licence, `private`, unscoped
name). T-7/AC-3.4 restated as set-equality over M-ENG-10's literal check names. Packaging↔anti-fork
collision recorded as **R-5** and AC-1.3 restated as set-equality over the packed file list. New
**O-9** owns the provenance carrier AC-4.2 needs. Absence-only oracles paired with positives
(AC-2.3, AC-2.5, AC-3.3, AC-4.4, AC-6.1, AC-6.2); new **AC-5.6** for the `PDLC_PLUGIN_ROOT`
tension. The false "prompt corpus is embedded in `orchestrate-dev.js`" clause deleted from NG-1
and O-1 (raised as an erratum against DECISIONS-plugin-distribution.md).*

*0.6 (2026-08-13): O-1 and O-3 decided (operator delegated adjudication). O-1 — public npm,
scoped package, recorded as DEC-DIST-05 in `docs/_decisions/DECISIONS-plugin-distribution.md`;
the licence field must stop saying `UNLICENSED` before first publish (new O-8). O-3 —
`pdlc-install-mechanism` closed as superseded, `pdlc-release-ci` kept and renarrowed to release
automation for that package; both dispositions written into `docs/_queue/QUEUE.md`.*

*0.5 (2026-08-13): §7 obligations corrected against already-shipped/adjudicated fact — O-2, O-4,
O-5 and O-6 answered and closed against citations in the headless-engine and plugin-retirement
REQs and the shipped engine code; O-1 and O-3 left open at v0.5 and decided at v0.6; NG-1 records
that the repo is public today, so its disqualifier currently excludes no channel; T-3 gets a
parenthetical naming the shipped `pdlcPluginCompat` field; O-5's TSPEC note flags a real tension
between T-6 (dev-mode never inferred) and the already-shipped `PDLC_PLUGIN_ROOT` env override.*

*0.4 (2026-08-10): queue-row references repointed to feature names (stale Order numbers from a
pre-renumbering table draft); ready flipped by operator review 2026-08-10.*

> **v0.3 change (2026-08-08, operator decision).** The engine package no longer snapshots
> `pdlc/skills/**`; it ships CLI + modules + adapter only and reads skills from the installed
> plugin at dispatch time. A declared engine↔plugin compatible-version range replaces
> snapshot-integrity verification. See §6 and §7 for the risks and obligations this narrows
> or adds.

> **Scope in one line.** Package the headless engine — CLI entry, the unmodified workflow
> modules, and the engine adapter, **no skills snapshot** — as **one versioned artifact**
> with a one-command install/upgrade, cut by CI from a git tag and paired with a declared
> compatible-plugin-version range, so every consumer project runs a known engine version
> against a known, compatible plugin version (the pdlc Claude Code plugin remains the sole
> delivery vehicle for every `SKILL.md` prompt, read from the installed plugin at dispatch
> time), and every run report says which pair that was.

## 1. Problem / Context

`pdlc-headless-engine` removes the per-project workflow copy: the engine
executes the canonical modules from its own install location. It deliberately says nothing
about **how the engine reaches a machine** — its NG-2 hands packaging, publishing, version
channels and install UX to this REQ. Without this feature, the engine exists only as a
checkout the operator runs by path, which reproduces the failure this family exists to kill
one level up: two machines, two checkouts, two versions, and nothing in any artifact that
says which one ran.

### 1.1 What is true at HEAD (re-measured 2026-08-13 at `89babe8e`)

Every claim this REQ rests on was re-checked against the repo at review round 1. These are
observations, not contracts — the contracts are the TSPEC's. Code-level facts live once, in
`docs/_constraints/pdlc-engine-baseline.md`, and are cited here by id so a later drift is a
one-file correction rather than a stale snapshot inside this REQ.

| # | Observation | Where |
|---|---|---|
| O-A | There is **no release automation of any kind**. `.github/workflows/` contains exactly one file, the PR-test gate. No tag trigger, no publish step, no marketplace step. | `.github/workflows/pr-tests.yml` |
| O-B | The PR gate is **five** required checks — unit tests, **engine tests**, generated-artifact freshness, fresh-clone bootstrap, shell-script parse/index-mode — on **ubuntu-latest × Node 20 only**. The literal check names Phase PUB and T-7 match on are enumerated in **M-ENG-10**, which is the authoritative list; the words here are a gloss, not the names. | M-ENG-10 |
| O-C | **Two** version numbers exist: the plugin manifest's, which the build stamps into the distribution manifest, and the engine package's own, independent of it. Neither reads the other. Which one is "the version of record" for which purpose is settled at O-7. | M-ENG-11; `pdlc/workflows/build-runtime.mjs` |
| O-D | The distribution manifest already establishes the packaging discipline this REQ inherits: a schema version, the version the bytes were built at, and one row per artifact carrying a path pair and a content hash, plus a retired-predecessor list. | `pdlc/workflows/dist/distribution-manifest.json` |
| O-E | The prompt corpus is **15 `SKILL.md` files plus two `se-implement` language supplements**. (The design brief and the upstream REQ both say "14"; that count is stale.) | `pdlc/skills/**` |
| O-F | **Provenance exists on one side of the seam only.** The engine-side report already carries the engine/plugin pair; the workflow layer that writes the committed halt artifacts carries no version and cannot obtain one. So "which semantics ran?" is answerable from the CLI's printed report but *not* from a consumer repo's committed artifacts — which is the gap REQ-EDIST-04 closes. | M-ENG-13 |
| O-G | There are **two** npm projects: the workflow test package and the engine package. Neither is publishable as declared (M-ENG-11). | `pdlc/workflows/package.json`, `pdlc/engine/package.json` |
| O-H | The engine package **cannot contain the workflow modules as arranged**: they are resolved by relative escape above its root, and two shipped tests fail if a copy is vendored under `pdlc/engine/`. This is the packaging constraint R-5 prices. | M-ENG-12 |

The incident that motivates the family is the same one: on 2026-08-08 the consumer
`regime-ledger` ran engine bytes built at plugin 0.21.0 against a 0.22.0 plugin — versions
that differ in review-gate semantics — and the mismatch was only discoverable by hashing
files, never from the run's own output. O-F is why.

### 1.2 The queue rows this REQ touches

| Queue row (by feature) | Binds | This REQ proposes |
|---|---|---|
| `pdlc-install-mechanism` (blocked, REQ never authored) | D-DIST-01 (full `pdlc install`), D-DIST-02 (load workflows from the plugin path with no copy), D-DIST-03 (auto-sync), D-DIST-05 (plugin-cache detection) | **Close as superseded.** All four improve the *copy*; `pdlc-headless-engine` removes the copy and this row replaces the install story wholesale. Operator decision — O-3. |
| `pdlc-install-mechanism`, cont. | D-DIST-07 (per-worktree consumer state) | **Closes by construction** once `pdlc-headless-engine` ships: the engine reads no worktree-local `.claude/workflows/`. Recording that closure is part of O-3. |
| `pdlc-release-ci` (blocked, REQ never authored) | D-DIST-06 remainder — release automation on `yumo-plugins` (the PR-test half landed out of band in `3ef6ac7`) | **Absorb or renarrow.** The tag → build → publish pipeline this REQ needs (§5, REQ-EDIST-03) *is* that remainder. Operator decision — O-3. |

Both dispositions have since been recorded in `docs/_queue/QUEUE.md` (O-3, 2026-08-13):
`pdlc-install-mechanism` is closed as superseded and `pdlc-release-ci` is kept, renarrowed to
release automation for this package and made dependent on this feature. Rows are named here by
**feature name, not queue Order** — Order numbers renumber, the feature name is the identity.

### 1.3 User stories

| ID | Story |
|---|---|
| US-01 | As the operator, I install the pipeline on a new machine with one command, so a fresh laptop is productive without a checkout ritual. |
| US-02 | As the operator, I upgrade once and every project I own runs the new pipeline immediately, so I never chase per-project sync again. |
| US-03 | As the operator, I cut a release by pushing a tag and trust CI to refuse a red one, so no release is ever hand-assembled. |
| US-04 | As a reader of a consumer repo months later, I can tell from the artifacts alone which pipeline version gated which feature. |
| US-05 | As the operator mid-feature, I pin one project to the version it started on and see that pin announced on every run, so a pin is never silently in effect and never silently absent. |
| US-06 | As the operator hacking on the pipeline, I run a checkout deliberately instead of the released bytes, and every artifact that run produces says so. |

### 1.4 Prerequisites (hard)

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| BL-01 | `pdlc-headless-engine` delivered: a CLI entry that executes the canonical modules and dispatches via headless Claude Code | PR merged to the default branch, queue row `done` | Must hold at HEAD before FSPEC authoring — there is no engine to package otherwise |
| BL-02 | Distribution channel chosen (O-1), against the privacy posture in NG-1 | Decision recorded in `docs/_decisions/DECISIONS-plugin-distribution.md` | Must exist before FSPEC authoring; every install/upgrade criterion in §5 is stated over "the chosen channel" |
| BL-03 | Version-of-record settled (T-1) — which manifest each of the two version numbers at O-C is the record for, and which one a release tag names | **Resolved at O-7**, to be transcribed into `docs/_decisions/DECISIONS-plugin-distribution.md` before FSPEC authoring | Must exist before FSPEC authoring; provenance (REQ-EDIST-04) and publish gating (REQ-EDIST-03) both read it |
| BL-04 | Operator decision on the `pdlc-install-mechanism` and `pdlc-release-ci` queue rows (O-3) | Prose recorded in `docs/_queue/QUEUE.md` per its conventions | **Met 2026-08-13** — both dispositions are in `QUEUE.md`; without them this REQ silently duplicates two bound deferrals |

## 2. Goals

- **G-1 — One engine artifact, one version, paired with a declared plugin range.** A single
  installable package carries the CLI entry, the unmodified workflow modules, and the
  engine adapter — never a skills snapshot (O-E stays the plugin's corpus, not the engine's
  cargo). The engine declares a compatible plugin-version range; a release pairs an engine
  version with the plugin version(s) it targets, and the engine refuses to dispatch against
  an installed plugin outside that range. Logic and skills remain two axes that can skew,
  but the handshake makes the skew loud — refused — rather than silent. *(US-01, US-02)*
- **G-2 — One-command install, one-command upgrade.** Both are documented, both work on a
  clean machine with only Node present, and neither requires a checkout of this repo.
  After an upgrade, every consumer project runs the new version with **zero per-project
  action** — no sync, no copy, no drift check. *(US-01, US-02)*
- **G-3 — Publish is automated and gated.** A release is cut by pushing a tag; CI runs the
  full existing gate (O-B), builds the artifact, verifies its declared compatible-plugin
  range includes the repo's plugin version at that commit (C-1), and publishes. A red gate,
  or a range that already excludes its own paired plugin, publishes nothing. No
  hand-assembled release, ever. *(US-03)*
- **G-4 — Version provenance survives in the consumer repo.** Every run report, every halt
  record, and the queue row a halt or merge writes carry **both** the engine version and the
  plugin version that produced them (the pair from the T-3 handshake), so the regime-ledger
  question ("which semantics ran?") is answerable from the artifacts alone on both axes —
  logic and skills — not just one (O-F is today's answer: it is not). *(US-04)*
- **G-5 — Pinning and dev-mode are explicit, announced, and never inferred.** Default
  posture is "latest installed, everywhere". An operator can pin a project to a version, or
  run from a checkout, but only deliberately — and a run under either is visibly labelled in
  its own output and in its artifacts. *(US-05, US-06)*
- **G-6 — The transition is non-destructive.** Installing the engine changes nothing about
  the plugin, the bundles, the sync scripts or the existing PR gate; both paths work side by
  side until `pdlc-plugin-retirement` ends the state. *(US-02)*

## 3. Non-Goals

- **NG-1 — Public distribution is not a goal, and privacy is a real constraint.** The
  audience is the operator's own machines and projects. The prompt corpus is the product;
  a channel that can only work by publishing it publicly is disqualified unless the operator
  chooses otherwise in O-1. **Fact recorded 2026-08-13:** the repo is public today
  (`gh repo view ohenak/yumo-plugins` reports `visibility: PUBLIC`), so the whole prompt
  corpus — `pdlc/skills/**` — is already world-readable in the tree; this disqualifier
  therefore excludes no candidate channel as of today. (An earlier draft added that the corpus
  is also "embedded in `pdlc/workflows/orchestrate-dev.js`". That is false — the module
  references skills by path and embeds no prompt text — and is deleted here; the public-repo
  fact alone carries the conclusion.) Whether the repo stays public is an operator intent, not a fact this
  REQ can settle; NG-1 itself is unchanged and not weakened by this note (see O-1).
- **NG-2 — Retiring the plugin, the bundles, or the sync/drift machinery.** That is
  `pdlc-plugin-retirement` (its own queue row), and only after the engine is proven in a real
  consumer repo. Bound deferral, not prose intent.
- **NG-3 — In-engine auto-update.** Upgrading is an operator action. The engine may
  *notice* that a newer version exists and say so, but never fetches or applies one. This is
  **declined, not deferred**: reversing it needs a new REQ, not a follow-on task.
- **NG-4 — Multi-user or team distribution** (seat auth, token distribution, per-user
  channels). Single-operator scope, per the family's premise. Also declined, not deferred.
- **NG-5 — Changing any pipeline semantics.** Phase graph, review bars, completeness
  criteria, queue lifecycle, report shape (beyond *adding* the provenance fields of
  REQ-EDIST-04) are untouched. This feature moves bytes, not behaviour.
- **NG-6 — Consumer-side generated state.** Nothing installs, syncs, writes or version-checks
  a file inside a consumer project. Consumer-owned config (`.claude/pdlc.config.json`)
  stays consumer-owned and is neither read nor written by install or upgrade.
- **NG-7 — Absorbing the state-probe CLI** (`pdlc/workflows/dist/pdlc-cli.mjs`). It stays a
  project-local artifact of the plugin build unless O-4 decides otherwise; the default is
  to leave it where it is.

## 4. Constraints

- **C-1 — The compatible-plugin range is declared and verified at publish, not just at
  runtime.** The engine package's manifest states a semver range of compatible plugin
  versions (O-6). The publish workflow fails the build — producing no publishable artifact —
  if that declared range does not include the repo's `plugin.json` version (T-1) at the
  tagged commit: a release is never cut already excluding the plugin it is meant to pair
  with. The package's manifest carries the range and the engine's own content hashes,
  following the discipline already established at O-D; it carries no skills-file hashes,
  because it carries no skills files.
- **C-2 — Install and upgrade write nothing into any consumer project** (NG-6). This is
  checkable: a consumer repo's working tree and index are unchanged by an install or an
  upgrade.
- **C-3 — Node floor is declared and CI-tested.** The floor is **Node 20** (T-2), matching
  the only matrix the repo tests today (O-B). The engine host is the operator's machine, so
  the floor is a support statement, not a sandbox assumption; the package declares it and
  refuses to run below it with a message naming the floor.
- **C-4 — The plugin path keeps working, untouched, throughout** (G-6, C-9). Nothing in
  packaging may modify, shadow, or depend on the plugin, the bundles under
  `pdlc/workflows/dist/`, or the sync/drift scripts.
- **C-5 — The existing PR gate stays green and stays required.** The publish workflow is
  **additive**: a new workflow file with its own trigger. It may reuse the gate's jobs but
  must not weaken, rename, or make conditional any check in M-ENG-10's set, because Phase
  PUB polls them by their literal names.
- **C-6 — Publishing is gated on the same evidence a PR is.** A tag whose commit does not
  pass the full gate publishes nothing, and the failure is visible as a failed workflow run
  — never a silent no-op.
- **C-7 — Releases are immutable and re-runnable.** Re-running the publish workflow for an
  already-published version must not overwrite it; it either no-ops or fails loudly. A
  version number identifies exactly one set of bytes, forever.
- **C-8 — Secrets stay in CI.** Whatever credential the chosen channel needs (O-1) exists
  only as a repository secret consumed by the publish workflow. No **distribution-channel**
  credential is required to run the engine (the engine still needs the operator's own Claude
  credential to dispatch), and none is written into the package or into any artifact.
- **C-9 — Two channels may coexist on one machine but must be distinguishable.** While the
  plugin is still installed (C-4), any run must make plain which channel and version
  executed it, so the transition period cannot reproduce the ambiguity of O-F.
- **C-10 — Size and altitude.** This REQ states outcomes; the package layout, manifest
  schema, flag names, field names and workflow YAML are the TSPEC's to specify.

### 4.1 Declared thresholds and named values

Every criterion in §5 that cites a configured value reads it from this table. Each has a
default and an owner; none is left to be invented downstream.

| ID | Value | Default | Owner |
|---|---|---|---|
| T-1a | **Engine version of record** — the number a release tag names, the published package carries, and the `engineVersion` half of every provenance pair reads | `pdlc/engine/package.json`'s `version` (M-ENG-11) | Operator (decision doc), per O-7 |
| T-1b | **Plugin version of record** — the number the compat range (T-3) is checked against and the `pluginVersion` half of every provenance pair reads | `pdlc/.claude-plugin/plugin.json`'s `version` (M-ENG-11) | Operator (decision doc), per O-7 |
| T-2 | Minimum supported Node | 20 | Repo CI matrix (O-B); raising it is a CI change first |
| T-3 | Compatible-plugin-range declaration — where the engine's semver constraint on plugin versions lives and what it constrains | the engine package manifest's `pdlcPluginCompat` field (M-ENG-11), read by the CLI startup banner, every run report, and the publish workflow (T-7) | This REQ; range syntax fixed in TSPEC |
| T-4 | Release trigger | a pushed git tag naming an **engine** version (T-1a), matching the repo's version-tag convention | Operator; fixed in FSPEC |
| T-5 | Pin scope and precedence | per-consumer-project pin; an explicit pin beats the installed latest; no pin means latest installed | This REQ (AC-5.1); mechanism in O-2 |
| T-6 | Dev-mode selector | explicit and opt-in; never inferred from cwd, env presence, or the existence of a checkout | This REQ (AC-5.3); flag shape in O-5 |
| T-7 | Publish gate | **the set of literal required-check names enumerated at M-ENG-10 — that enumeration is the authoritative list, not a count** — every member green on the tagged commit. Adding or removing a member is a change to M-ENG-10 first | `.github/workflows/` (repo) |

## 5. Acceptance Criteria

Six requirements. Each traces to at least one user story; each acceptance criterion is
stated so a test engineer can derive a failing test from it without asking a question.

### REQ-EDIST-01 — One engine artifact, one version, a declared plugin-compatibility range *(P0, Phase 1; US-01, US-02; G-1, C-1)*

The package is the unit of versioning for CLI, modules and adapter; skills are the plugin's
unit of versioning, and the two are joined only by the declared range (T-3), never by
copying bytes across the boundary.

- **AC-1.1** *Who:* the operator. *Given:* an installed engine package and no Claude Code
  plugin installed, or a plugin installed at a version outside the engine's declared range
  (T-3). *When:* they run any pipeline command. *Then:* it refuses before dispatch with a
  message naming the declared range and what — if anything — is installed; it never
  dispatches against a missing or out-of-range plugin.
- **AC-1.2** *Who:* the operator. *Given:* an installed engine and a plugin installed at a
  version inside the declared range. *When:* they run any pipeline command. *Then:* it
  dispatches using the `SKILL.md` prompts read from that installed plugin's `skills/` tree
  at dispatch time — never a copy bundled in the engine package, because the engine package
  ships none.
- **AC-1.3** *Who:* a verifier. *Given:* the built engine package. *When:* they inspect its
  contents. *Then:* it contains the CLI entry, the workflow modules, and the engine
  adapter, and no `skills/` directory or prompt file of any kind — decidable from the
  package's own contents without network access.
- **AC-1.4** *Who:* the operator. *Given:* an installed package. *When:* they ask the CLI
  for its version. *Then:* it reports the engine version (T-1), the declared
  compatible-plugin range (T-3), and the version of the plugin it currently finds installed
  (or that none is installed) — the same triple the startup banner and every run report
  carry (REQ-EDIST-04).
- **AC-1.5** *Who:* a verifier. *Given:* a published engine release. *When:* they look for
  the plugin version(s) that release was paired with. *Then:* the pairing is documented
  per-release (O-6) and is not left to be reverse-engineered from the declared range alone.

### REQ-EDIST-02 — One-command install and upgrade *(P0, Phase 1; US-01, US-02; G-2, C-2)*

- **AC-2.1** *Who:* the operator on a clean machine with Node ≥ T-2 and nothing else pdlc
  installed. *Given:* the documented install command, copied verbatim from the README.
  *When:* they run it once. *Then:* the CLI is on `PATH` and a pipeline command runs to the
  point of dispatch; no second command, no manual step, no repo clone is required.
- **AC-2.2** *Who:* the operator. *Given:* version N installed and two distinct consumer
  repos that have each completed a run at N. *When:* they run the documented upgrade command
  once, on the machine, and then invoke the pipeline in each repo. *Then:* both runs execute
  version N+1 — observable in each run's own output **and** in the artifacts it writes
  (REQ-EDIST-04) — with **no command executed inside either repo** other than the pipeline
  invocation itself.
- **AC-2.3** *Who:* a verifier. *Given:* a consumer repo with a clean working tree and index.
  *When:* an install and an upgrade are performed. *Then:* the repo's working tree and index
  are unchanged — no file created, modified or deleted anywhere under the project (C-2), and
  in particular nothing under `.claude/`.
- **AC-2.4** *Who:* the operator on a machine whose Node is below T-2. *Given:* an install
  attempt or a pipeline invocation. *When:* it runs. *Then:* it fails with a message naming
  the required floor and the version found — never a stack trace, never a partial run.
- **AC-2.5** *Who:* the operator. *Given:* the engine installed. *When:* the pdlc plugin is
  also installed and in use in interactive sessions. *Then:* both continue to work, and
  neither install path modifies the other's files (C-4).

### REQ-EDIST-03 — Tag-driven, gated publish *(P0, Phase 1; US-03; G-3, C-5–C-8)*

This requirement is the D-DIST-06 release-automation remainder in its new form (§1.2).

- **AC-3.1** *Who:* the operator. *Given:* a commit on the default branch whose full gate
  (T-7) is green. *When:* they push a version tag (T-4) at that commit. *Then:* CI builds
  the package, verifies its declared compatible-plugin range (T-3) includes the repo's
  `plugin.json` version at that commit, and publishes it to the chosen channel (BL-02) —
  with no further human action.
- **AC-3.2** *Who:* the operator. *Given:* a commit on which any required check of T-7
  fails. *When:* a version tag is pushed at that commit. *Then:* nothing is published, and
  the publish workflow run is **failed** — a skipped or green-but-inert run is a defect,
  because it is indistinguishable from success.
- **AC-3.3** *Who:* the operator. *Given:* version N already published. *When:* the publish
  workflow is re-run for the same version (re-pushed tag, manual re-run). *Then:* the
  already-published bytes are not replaced; the run either no-ops with an explicit statement
  or fails naming the collision (C-7).
- **AC-3.4** *Who:* a verifier. *Given:* the repo after this feature lands. *When:* they
  inspect the PR gate. *Then:* every check named at O-B still exists under the same name,
  still runs on pull requests, and still gates them — the publish workflow is a separate,
  additively-added trigger (C-5).
- **AC-3.5** *Who:* a verifier. *Given:* a published package. *When:* they inspect its
  contents and any log the publish produced. *Then:* no credential, token or secret value
  appears in either (C-8).
- **AC-3.6** *Who:* the operator. *Given:* a tag whose version disagrees with the version of
  record (T-1) at that commit. *When:* the publish workflow runs. *Then:* it fails naming
  both values, rather than publishing under either.
- **AC-3.7** *Who:* the operator. *Given:* a tag at a commit whose engine package declares a
  compatible-plugin range (T-3) that does not include the repo's `plugin.json` version at
  that commit. *When:* the publish workflow runs. *Then:* it fails naming the declared range
  and the plugin version found, and publishes nothing — a release is never cut with a range
  that already excludes the plugin it is paired with.

### REQ-EDIST-04 — Version provenance in the consumer's artifacts *(P0, Phase 1; US-04; G-4)*

O-F is the gap: today a consumer repo's history records what the pipeline decided but not
which pipeline decided it.

- **AC-4.1** *Who:* a reader of a consumer repo. *Given:* a completed run. *When:* they read
  its final run report. *Then:* the report states both the engine version and the plugin
  version it dispatched against (the same pair reported by AC-1.4), on both the success and
  the halt path.
- **AC-4.2** *Who:* a reader. *Given:* a run that halted. *When:* they read the halt's
  record — the halt report and the queue row the halt writes and commits. *Then:* the engine
  version is recoverable from the repo's own history without consulting the machine that ran
  it.
- **AC-4.3** *Who:* a reader. *Given:* two runs of the same feature on different engine
  versions. *When:* they compare the artifacts. *Then:* the two versions are distinguishable
  from the artifacts alone — this is the regime-ledger scenario, and passing it is the point
  of the requirement.
- **AC-4.4** *Who:* a verifier. *Given:* the provenance values. *When:* they compare them
  with the installed engine and the installed plugin's own reported versions (AC-1.4).
  *Then:* both pairs agree for every run — each value is observed live from the running
  engine and the plugin it dispatched against, never a constant restated in the report.
- **AC-4.5** *Who:* a verifier. *Given:* an existing consumer repo whose artifacts predate
  this feature. *When:* the engine runs there. *Then:* no prior artifact is rewritten,
  back-filled, or invalidated; provenance appears from that run forward (NG-5).

### REQ-EDIST-05 — Explicit pinning and explicit dev-mode *(P1, Phase 2; US-05, US-06; G-5)*

- **AC-5.1** *Who:* the operator mid-feature. *Given:* a project pinned to version X (T-5)
  while version Y is the latest installed. *When:* they run the pipeline in that project.
  *Then:* version X executes, and the run announces both the pin and that a newer version
  exists — a pin in effect is never silent.
- **AC-5.2** *Who:* the operator. *Given:* a project with no pin. *When:* they run the
  pipeline. *Then:* the latest installed version executes and the run says so; the absence
  of a pin is as visible as its presence.
- **AC-5.3** *Who:* the operator developing the pipeline. *Given:* a checkout of this repo
  and the explicit dev-mode selector (T-6). *When:* they run the pipeline against a consumer
  repo. *Then:* the checkout's prompts and modules execute, and **every artifact that run
  writes is marked as a dev-mode run** — a dev-mode run is never mistakable for a released
  one in the consumer's history.
- **AC-5.4** *Who:* the operator. *Given:* a checkout present on the machine but no dev-mode
  selector passed. *When:* they run the pipeline. *Then:* the installed released version
  executes — dev-mode is never inferred (T-6).
- **AC-5.5** *Who:* the operator. *Given:* a pin naming a version that is not installed.
  *When:* they run the pipeline. *Then:* the run refuses with a message naming the pinned
  version and what is installed; it never silently falls back to latest.

### REQ-EDIST-06 — Non-regression of the existing distribution path *(P0, Phase 1; US-02; G-6, C-4)*

- **AC-6.1** *Who:* a verifier. *Given:* the repo after this feature lands. *When:* the
  documented fresh-clone bootstrap is executed as written and the drift check is run.
  *Then:* both succeed exactly as before — this feature adds a channel, it does not disturb
  the bundle/sync channel.
- **AC-6.2** *Who:* a verifier. *Given:* a machine with both the plugin and the engine
  installed. *When:* a pipeline run is started through either. *Then:* the run's output
  identifies which channel and which version executed it (C-9), and the two installs share
  no mutable state.

## 6. Risks

- **R-1 — Channel-choice failure modes differ by kind.** A private registry channel fails on
  auth (expired token, misconfigured `.npmrc`) or availability (registry outage) — failures
  the operator does not control. A git-tag install channel fails differently: it needs a
  reachable git remote and a tool that can resolve a tag to a tarball, and it has no
  built-in yank/deprecate primitive, so a bad release is harder to un-publish (tension with
  C-7). Neither mode is eliminated by this REQ; O-1 picks which one the operator accepts. A
  failed install/upgrade defeats G-2 outright, and the two channels fail in ways an operator
  diagnoses differently under time pressure — mitigation direction: O-1 records the choice
  against NG-1's privacy constraint, and REQ-EDIST-02's failure-message ACs (AC-2.1, AC-2.4)
  must be re-validated against whichever channel is actually picked.
- **R-2 — Two-artifact release coordination is a new, recurring operator burden.** Every
  release now means deciding an engine version *and* a compatible-plugin range *and*
  confirming the repo's `plugin.json` sits inside it (C-1, AC-3.7) — three judgment calls
  instead of one version bump. The handshake (T-3) turns a *silent* skew into a *loud*
  refusal (AC-1.1), strictly better than today's O-F gap, but a range declared too loosely
  reintroduces the silent-skew risk it was built to close, and a range declared too tightly
  turns every plugin patch release into a forced engine republish — friction that invites
  widening the range carelessly just to make the friction stop, defeating the handshake's
  intent while satisfying its letter. Mitigation direction: AC-3.7 makes the range check a
  hard publish gate, not advisory; O-6 requires the pairing documented per release so a
  too-loose range is visible at review time, not only at incident time.
- **R-3 — Skills edited between releases skew against the installed plugin's copy, not a
  snapshot.** Because the engine reads skills from the installed plugin at dispatch time
  (never a snapshot), a `SKILL.md` edit landing on the plugin's default branch changes
  pipeline behaviour for every engine within range immediately, with no engine-side version
  bump and no new engine provenance event marking it. Two runs reporting the identical
  engine+plugin version pair (AC-4.3) can still have executed different skill prompt text if
  the plugin version itself was not bumped for the edit. This is the skew axis the operator's
  design change explicitly *accepts and contains*, not eliminates — stated honestly rather
  than implied away by the handshake's existence. Mitigation direction: bumping the plugin's
  own version (T-1) for any behaviour-affecting skill edit is the discipline this REQ assumes
  but does not enforce; recorded here as a known residual risk, not closed by any AC in §5.
- **R-4 — Two live distribution channels coexist through the whole transition window.**
  Until `pdlc-plugin-retirement` (NG-2) lands, the bundle/sync path
  (`pdlc/workflows/dist/` → `.claude/workflows/`) and the engine path both run in parallel,
  possibly on the same machine (C-9, AC-6.2). Two channels double the surface an operator
  must reason about when a run behaves unexpectedly — "which channel produced this?" is a
  question that did not exist before this feature, and a regression on one channel can be
  misdiagnosed against the other if a run's output does not make its channel unambiguous.
  Mitigation direction: C-9 and AC-6.2 already require every run's output to name its
  channel and version; the risk itself is retired only when `pdlc-plugin-retirement`
  removes the second channel, not by anything in this REQ.

## 7. Obligations / Open Questions

Each of O-1 through O-5 is already cited from a BL row, NG row, or T row above; this section
is their single point of resolution, plus O-6, new for the compat-range handshake.

- **O-1 — Distribution channel choice.** Private npm registry, public npm, or git-tag
  install — chosen against the privacy posture at NG-1. Blocks FSPEC authoring (BL-02).
  *Owner:* operator. *Resolution form:* `docs/_decisions/DECISIONS-plugin-distribution.md`.
  **Decided 2026-08-13 — public npm, scoped package.** Load-bearing fact this REQ did not previously state: the repo
  is already public (`gh repo view ohenak/yumo-plugins` reports `visibility: PUBLIC`), and
  the whole prompt corpus — `pdlc/skills/**`, also embedded in
  `pdlc/workflows/orchestrate-dev.js` — is already world-readable, so NG-1's disqualifier
  excludes no candidate channel today: every option is privacy-equivalent to the status quo.
  That reduces this to one question for the operator — does the repo stay public? If yes,
  public npm (scoped) wins on the non-privacy axis: one-command install/upgrade, native
  immutability via republish-refusal on an existing version (satisfying C-7), and `npm
  deprecate` as a yank primitive that a git-tag install lacks (a GitHub release asset or a
  bare tag is force-pushable/replaceable, in tension with C-7); publish is a plain `npm
  publish` CI step. The package's `pdlc/engine/package.json` should carry `"license":
  "UNLICENSED"` and declare `@anthropic-ai/claude-agent-sdk` as its dependency regardless of
  which channel is chosen.

  **Decision: public npm, scoped package.** The repo stays public, so NG-1's privacy disqualifier
  excludes nothing, and among privacy-equivalent options npm wins on the axes that matter here:
  one-command install and upgrade, native immutability (a republish of an existing version is
  refused, which is what C-7 asks for), a real yank primitive in `npm deprecate`, and a publish step
  that is one `npm publish` in CI. Git-tag install was rejected on C-7 alone — a bare tag is
  force-pushable, so the version pointer is not immutable. A private registry was rejected as cost
  without benefit against an already-public corpus. The scope name is a publish-time detail for
  FSPEC; the working assumption is a scope the operator owns. Recorded at project level as
  **DEC-DIST-05** in `docs/_decisions/DECISIONS-plugin-distribution.md`. This unblocks BL-02 and
  therefore FSPEC authoring.

  One precondition it creates, tracked as **O-8**: `pdlc/engine/package.json` declares
  `"license": "UNLICENSED"`. Publishing an UNLICENSED package to public npm is self-contradictory,
  so the licence must be settled — by the operator, not by FSPEC — before the first publish, and the
  `@anthropic-ai/claude-agent-sdk` dependency's own terms checked against whatever is chosen.
  Blocking for publish, not for FSPEC.
- **O-2 — Pin mechanism.** How a per-project pin (T-5) is expressed and read — a file in the
  consumer repo (which NG-6 forbids the engine from *writing*, but reading an
  operator-authored one is not writing), an environment variable, or a CLI flag supplied at
  invocation. Shapes AC-5.1–AC-5.5. *Owner:* operator, informed by TSPEC. *Resolution form:*
  `docs/_decisions/DECISIONS-plugin-distribution.md` or the TSPEC directly.
  **Answered 2026-08-13.** Pin key lives under the `engine.*` namespace (e.g. `engine.pin`)
  in the consumer-owned `.claude/pdlc.config.json`, read by the engine at startup; the engine
  never writes it. Grounded in **DEC-HE-02**
  (`docs/completed/pdlc-headless-engine/DECISIONS-headless-engine-obligations.md`), which
  already reserves `engine.*` as the engine's only config surface and closes the "second pin
  file vs. env var" ambiguity this REQ raised — reading an operator-authored file is not
  writing (NG-6 forbids only the latter). An env var was considered and rejected: it is
  per-shell, not per-project, failing T-5's scoped-pin requirement and AC-5.1's "never
  silent" bar (a forgotten env var is silent by definition). Note the coupling to O-1: AC-5.1
  requires the pinned version to *execute* while another is latest — side-by-side version
  resolution, not just a pointer, is needed once a real registry channel is chosen; that
  mechanism is the TSPEC's to specify.
- **O-3 — Disposition of the `pdlc-install-mechanism` and `pdlc-release-ci` queue rows.**
  Whether `pdlc-install-mechanism` (D-DIST-01/02/03/05/07) is closed as superseded and
  `pdlc-release-ci` (D-DIST-06 remainder) is absorbed or renarrowed into REQ-EDIST-03, per §1.2. Required before this REQ
  is accepted (BL-04), so it does not silently duplicate two bound deferrals. *Owner:*
  operator. *Resolution form:* prose recorded in `docs/_queue/QUEUE.md` per its conventions.
  **Decided 2026-08-13.** Recommendation for
  record: `pdlc-install-mechanism` (queue Order 7) closes **superseded** —
  D-DIST-01/02/03/05 are all improvements to the per-project copy mechanism this family
  deletes outright, and D-DIST-07 (per-worktree consumer state) closes **by construction**
  since the engine reads no worktree-local `.claude/workflows/`. `pdlc-release-ci` (queue
  Order 8) should be **renarrowed, not absorbed wholesale**: D-DIST-06's PR-test half is
  already discharged out of band in `3ef6ac7`, so only its release-automation remainder maps
  onto REQ-EDIST-03 here.

  **Decision, 2026-08-13, written into `docs/_queue/QUEUE.md`.** Queue row 7
  `pdlc-install-mechanism` is **closed as superseded**: D-DIST-01/02/03/05 are absorbed by the
  renarrowed REQ-EDIST-03 (§1.2), and D-DIST-07 (per-worktree consumer state) dissolves rather than
  transfers — it is a property of the `.claude/workflows/` consumer copy, which
  `pdlc-plugin-retirement` (row 5) removes. If retirement does not land, D-DIST-07 re-opens against
  `pdlc-engineering-loop` (row 6); that conditional is recorded in the queue note so the deferral
  cannot vanish silently. Queue row 8 `pdlc-release-ci` is **kept and renarrowed**: its PR-test half
  already landed in `3ef6ac7`, and what remains is release automation for the package O-1 just chose
  — tag, publish, and the rendered version lines. It gains a dependency on this feature. Neither row
  is left silently deferred, which is what BL-04 required.
- **O-4 — Fate of `pdlc/workflows/dist/pdlc-cli.mjs`.** Whether the existing state-probe CLI
  is absorbed into the engine package or stays a project-local artifact of the plugin build
  (NG-7's default). *Owner:* operator. *Resolution form:* decision doc, or silence — the
  default holds if nothing is recorded.
  **Closed 2026-08-13.** `pdlc/workflows/dist/pdlc-cli.mjs` stays a project-local artifact of
  the plugin build, per NG-7's default; this is not overridden. It is also confirmed as the
  headless-engine REQ's own **NG-2** (non-goal) and named as **G-5**'s kept CLI machinery in
  `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md`'s **NG-2** non-goal — three
  independent REQs now agree the artifact stays. It remains a manifest row (id `pdlc-cli`) in
  `pdlc/workflows/dist/distribution-manifest.json`, emitted by `build-runtime.mjs` and synced
  by `sync-workflows.sh`; its document oracles resolve against `process.cwd()` by design,
  project-local, and are unaffected by this feature.
- **O-5 — Dev-mode design.** The explicit selector's shape (flag, env var, or both — T-6),
  how a dev-mode run is marked in its artifacts (AC-5.3), and what "the checkout's prompts"
  resolves to when run in dev-mode (presumably `pdlc/skills/**` at the checkout's working
  tree, standing in for "the installed plugin" for that one run — TSPEC to state this
  explicitly, since dev-mode is the one path where the engine *does* read skills from a
  location other than an installed plugin). *Owner:* this REQ's TSPEC. *Resolution form:*
  TSPEC section, surfaced in the FSPEC-level behaviour already fixed by AC-5.3/AC-5.4.
  **Answered 2026-08-13, one tension left for the TSPEC to resolve.** The engine already
  ships a dev-mode override: the `PDLC_PLUGIN_ROOT` env var / `--plugin-root` flag
  (`pdlc/engine/lib/skills.mjs:40-54`, exported as `PLUGIN_ROOT_ENV` at `:54`; wired in
  `pdlc/engine/bin/pdlc.mjs`), documented in-code as how the repo's own checkout is used, and
  named at `pdlc/engine/lib/handshake.mjs:134` as the compat-refusal remedy. TSPEC should
  **adopt this selector rather than invent a second one**, with three riders: (1) dev-mode is
  the conjunction of running the checkout's engine *and* pointing `--plugin-root` at the
  checkout's `pdlc/`; (2) AC-5.3's artifact-marking is genuinely new work — nothing marks a
  `--plugin-root` run today, `lib/report.mjs` carries `engineVersion`/`pluginVersion` but no
  dev/channel field; (3) there is a **real tension with T-6**: T-6 requires the selector never
  be inferred from env presence, but the shipped `PDLC_PLUGIN_ROOT` env var *is* honored on
  presence alone today, so an exported-and-forgotten env var would silently switch skill
  source for every subsequent run. TSPEC must resolve this tension explicitly — e.g. by
  restricting dev-mode to the per-invocation flag, with the env var honored only when a
  companion flag or marker forces the run to declare and label itself — not paper over it.
- **O-6 — Compatible-plugin-range declaration and per-release pairing record.** Where the
  engine's declared range lives (T-3's manifest field), what range syntax it uses (a semver
  range expression is assumed; TSPEC fixes the grammar), and where the pairing a release
  actually shipped with is documented — a release-notes convention, a field in the
  distribution manifest discipline already established at O-D, or both. Read by the CLI
  startup banner, every run report (REQ-EDIST-04), and the publish workflow's hard gate
  (AC-3.7). *Owner:* this REQ's TSPEC. *Resolution form:* TSPEC section; the publish
  workflow's YAML is where the gate becomes real (C-10 keeps that detail out of this REQ).
  **Answered 2026-08-13** for the declaration half; per-release pairing record stays open,
  genuinely a third question this text already anticipates, not closed by prior work.
  Declaration syntax: `pdlc/engine/package.json`'s `pdlcPluginCompat` field (M-ENG-06,
  `docs/_constraints/pdlc-engine-baseline.md`; headless-engine REQ's C-10, T-3; TSPEC at
  `pdlc/engine/lib/handshake.mjs:93`), a semver range — `^x.y.z`, `~x.y.z`, or exact `x.y.z`
  — checked at runtime by the handshake and at CI time by TSPEC's AC-3.7 skew gate.
  Per-release pairing record resolves the existing manifest discipline (O-D): the publish
  workflow already computes plugin version and tagged commit for the AC-3.7 gate, so it
  should (a) write `{engineVersion, pdlcPluginCompat, pluginVersionAtTag}` into a manifest
  file inside the published package, mirroring `distribution-manifest.json`'s per-artifact
  discipline, satisfying AC-1.5's "decidable per-release" without network archaeology, and
  (b) emit the same triple into the GitHub Release notes, making R-2's too-loose-range risk
  reviewable at release time rather than only at incident time.
- **O-8 — Licence and publishability of the engine package** (opened by O-1's decision,
  2026-08-13). `pdlc/engine/package.json` declares `"license": "UNLICENSED"`, which contradicts
  publishing to public npm. The operator must settle the licence, and check the
  `@anthropic-ai/claude-agent-sdk` dependency's terms against the choice, before the first publish.
  *Owner:* operator. *Blocking for:* first publish (AC-6.x release path), not for FSPEC authoring.
