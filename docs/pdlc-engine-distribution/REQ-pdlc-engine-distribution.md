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
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-REQ-v1.md`, `…-v2.md`, `…-v3.md` |
| LEARNINGS | `docs/pdlc-engine-distribution/LEARNINGS-pdlc-engine-distribution.md` |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | Draft — in review (Phase R) | Claude | 0.9 | 2026-08-13 |

*0.9 (2026-08-13, review round 3): AC-6.2's distinguishing observation is the **load root**, not a
write root — no run writes `.claude/workflows/` — and the fact that no run-bound observation of it
exists on the bundle side is routed to **O-9** rather than read as already solved. AC-3.4 names its
carrier: local matrix expansion, offline; its expected check-name set is the FSPEC's, seeded from
M-ENG-10, which stays a measurement (T-7). O-5 cites the `REMEDY` symbol, not a line window.*

*0.8 (2026-08-13, review round 2): M-ENG-10 records **two** alphabets (authored `name:` vs
rendered) and AC-3.4/T-7 require equality in both; AC-1.3's oracle is the packed tarball; AC-4.5's
exception set is the run report's authored-file enumeration (O-9); AC-6.2 became a conjunction;
O-8 relabelled tool- vs decision-enforced, no ordering claimed; AC-2.3 split per leg; AC-2.1 names
one transcription source; AC-1.1 exempts `pdlc doctor`.*

*0.7 (2026-08-13, review round 1): §1.1 re-measured at `89babe8e`, code-level facts moved to
`docs/_constraints/pdlc-engine-baseline.md` as M-ENG-10…M-ENG-13 and cited by id. BL-03 resolved
by **O-7** (two versions of record; the tag is an engine tag). O-8 extended to three publish
blockers; T-7/AC-3.4 and AC-1.3 restated as set-equality; packaging↔anti-fork collision recorded
as **R-5**; new **O-9** (provenance carrier), **O-10** (packaging choice), **AC-5.6**;
absence-only oracles paired with positives. The false "prompt corpus is embedded in
`orchestrate-dev.js`" clause deleted from NG-1 and O-1 (erratum raised against
DECISIONS-plugin-distribution.md).*

*0.6 (2026-08-13): O-1 decided — public npm, scoped package, **DEC-DIST-05**; O-3 decided — both
queue-row dispositions written into `docs/_queue/QUEUE.md`. 0.5: O-2, O-4, O-5, O-6 answered
against shipped code; NG-1 records the public repo; T-3 names `pdlcPluginCompat`. 0.4: queue rows
referenced by feature name. 0.3 (operator decision): the engine package no longer snapshots
`pdlc/skills/**` — CLI + modules + adapter only, skills read from the installed plugin at dispatch
time, a declared compatible-version range replacing snapshot-integrity verification.*

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
| O-B | The PR gate is **five** required checks — unit tests, **engine tests**, generated-artifact freshness, fresh-clone bootstrap, shell-script parse/index-mode — on **ubuntu-latest × Node 20 only**. The check names Phase PUB polls are measured in **M-ENG-10**, in both alphabets it distinguishes (authored `name:` vs rendered); T-7's expected set is seeded from that measurement, and the words here are a gloss on both. | M-ENG-10 |
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

| Queue row (by feature) | Binds | Landed disposition (O-3) |
|---|---|---|
| `pdlc-install-mechanism` | D-DIST-01 (full `pdlc install`), D-DIST-02 (load workflows from the plugin path with no copy), D-DIST-03 (auto-sync), D-DIST-05 (plugin-cache detection) | **Closed as superseded.** All four improve the *copy*; `pdlc-headless-engine` removes the copy and this feature replaces the install story wholesale. |
| `pdlc-install-mechanism`, cont. | D-DIST-07 (per-worktree consumer state) | **Dissolved, not transferred** — it is a property of the `.claude/workflows/` copy; re-opens against `pdlc-engineering-loop` if `pdlc-plugin-retirement` does not land (O-3). |
| `pdlc-release-ci` | D-DIST-06 remainder — release automation on `yumo-plugins` (the PR-test half landed out of band in `3ef6ac7`) | **Kept and renarrowed** to the tag → build → publish pipeline of §5, REQ-EDIST-03, and made dependent on this feature. |

Both dispositions are recorded in `docs/_queue/QUEUE.md` (O-3, 2026-08-13). Rows are named here by
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
| BL-03 | Version-of-record settled (T-1a/T-1b) — which manifest each of the two version numbers at O-C is the record for, and which one a release tag names | **Resolved at O-7**, to be transcribed into `docs/_decisions/DECISIONS-plugin-distribution.md` before FSPEC authoring | Must exist before FSPEC authoring; provenance (REQ-EDIST-04) and publish gating (REQ-EDIST-03) both read it |
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
  therefore excludes no candidate channel as of today. Whether the repo stays public is an
  operator intent, not a fact this REQ can settle; NG-1 itself is unchanged and not weakened by
  this note (see O-1).
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
  if that declared range does not include the plugin version of record (T-1b) at the
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
  must not weaken, rename, or make conditional any check in T-7's set, because Phase
  PUB polls them by their literal rendered names.
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
| T-7 | Publish gate | **the FSPEC's expected required-check set, in both alphabets M-ENG-10 distinguishes (authored `name:` and rendered), seeded from M-ENG-10's measurement at authoring time** — an enumeration, not a count; every member green on the tagged commit. Adding, removing or re-rendering a member (including by matrix edit) is a change to that expected set first | FSPEC (set); `.github/workflows/` (repo) |

## 5. Acceptance Criteria

Six requirements. Each traces to at least one user story; each criterion is stated so a test
engineer can derive a failing test from it without asking a question.

### REQ-EDIST-01 — One engine artifact, one version, a declared plugin-compatibility range *(P0, Phase 1; US-01, US-02; G-1, C-1)*

The package is the unit of versioning for CLI, modules and adapter; skills are the plugin's
unit of versioning, and the two are joined only by the declared range (T-3), never by
copying bytes across the boundary.

- **AC-1.1** *Who:* the operator. *Given:* an installed engine package and no Claude Code
  plugin installed, or a plugin installed at a version outside the engine's declared range
  (T-3). *When:* they run any pipeline command. *Then:* it refuses before dispatch with a
  message naming the declared range and what — if anything — is installed; it never
  dispatches against a missing or out-of-range plugin. `pdlc doctor` sits **outside** the gate:
  the diagnostic that explains a refusal still runs and reports the same triple (AC-1.4).
- **AC-1.2** *Who:* the operator. *Given:* an installed engine and a plugin installed at a
  version inside the declared range. *When:* they run any pipeline command. *Then:* it
  dispatches using the `SKILL.md` prompts read from that installed plugin's `skills/` tree
  at dispatch time — never a copy bundled in the engine package, because the engine package
  ships none.
- **AC-1.3** *Who:* a verifier. *Given:* the built engine package. *When:* they enumerate **the
  contents of the packed tarball** — what a consumer actually receives, not a declared intent
  (`pdlc/engine/package.json` has no `files` field today, M-ENG-11, so a "declared list" oracle
  would pass vacuously). *Then:* that list **equals**, member for member, an expected set stated
  in the FSPEC — so an added file fails and a removed module fails, not merely a missing one. The
  expected set contains the CLI entry, the workflow modules and the engine adapter, and contains
  no `skills/` directory, no `SKILL*.md` file and no test corpus. Decidable offline, without
  publishing. (R-5 prices how the modules get inside the package at all; this AC states the
  outcome, not the mechanism.)
- **AC-1.4** *Who:* the operator. *Given:* an installed package. *When:* they ask the CLI
  for its version. *Then:* it reports the engine version (T-1a), the declared
  compatible-plugin range (T-3), and the version of the plugin it currently finds installed
  (or that none is installed) — the same triple the startup banner and every run report
  carry (REQ-EDIST-04).
- **AC-1.5** *Who:* a verifier. *Given:* a published engine release. *When:* they look for
  the plugin version(s) that release was paired with. *Then:* the pairing is documented
  per-release (O-6) and is not left to be reverse-engineered from the declared range alone.

### REQ-EDIST-02 — One-command install and upgrade *(P0, Phase 1; US-01, US-02; G-2, C-2)*

- **AC-2.1** *Who:* the operator on a clean machine with Node ≥ T-2 and nothing else pdlc
  installed. *Given:* the documented install command, transcribed verbatim from **one named
  place — `pdlc/README.md`'s `## Install in another repo` section, which documents the plugin
  install today (`pdlc/README.md:132`) and gains the engine install command under it**; no other
  file is a transcription source. *When:* they run it once. *Then:* the CLI is on `PATH`, it
  reports its version triple (AC-1.4), and a pipeline command reaches the compat handshake —
  where, with no plugin installed, it emits AC-1.1's refusal naming the declared range. That
  refusal **is** the pass condition on a plugin-free machine: install is proven by reaching
  the handshake, not by dispatching. No second command, manual step or repo clone is required.
- **AC-2.2** *Who:* the operator. *Given:* version N installed and two distinct consumer
  repos that have each completed a run at N. *When:* they run the documented upgrade command
  once, on the machine, and then invoke the pipeline in each repo. *Then:* both runs execute
  version N+1 — observable in each run's own output **and** in the artifacts it writes
  (REQ-EDIST-04) — with **no command executed inside either repo** other than the pipeline
  invocation itself.
- **AC-2.3** *Who:* a verifier. *Given:* a consumer repo with a clean working tree and index.
  *When:* an install and an upgrade are performed. *Then:* on that same run, **both** hold. The
  positive is stated per leg, because a clean-machine install has no before-value to differ from:
  the **install** leg asserts the CLI now resolves on `PATH`, at the expected version, from an
  install location that exists; the **upgrade** leg asserts the resolved version and install
  location differ from the values recorded before it ran (the positive that proves the upgrade
  was not a silent no-op). **And** the repo's working tree and index are unchanged — no file created, modified or deleted anywhere under the
  project (C-2), in particular nothing under `.claude/`.
- **AC-2.4** *Who:* the operator on a machine whose Node is below T-2. *Given:* an install
  attempt or a pipeline invocation. *When:* it runs. *Then:* it fails with a message naming
  the required floor and the version found — never a stack trace, never a partial run.
- **AC-2.5** *Who:* the operator. *Given:* the engine installed. *When:* the pdlc plugin is
  also installed and in use in interactive sessions. *Then:* on the same run, both paths still
  work positively — the engine reaches dispatch and an interactive plugin session invokes a
  skill — **and** neither install path modifies the other's files (C-4).

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
  workflow is re-run for the same version (re-pushed tag, manual re-run). *Then:* on either
  permitted branch — an explicit no-op statement or a loud failure naming the collision (C-7)
  — two things hold positively and are asserted on both: the published bytes for version N are
  byte-identical before and after the re-run, and the run's own output names version N.
- **AC-3.4** *Who:* a verifier. *Given:* the repo after this feature lands. *When:* they read the
  workflow files' authored `name:` strings **and expand the declared matrix axes locally** —
  decidable offline, without a PR, a network or credentials, as at AC-1.3; observing what GitHub
  reported on a live run is *not* the carrier, because that check cannot run inside the gate it
  asserts on. *Then:* **two** set-equalities hold against an expected set stated in the FSPEC,
  one per alphabet, because they are not the same set: the authored `name:` strings equal the
  expected authored column, **and** the locally expanded names equal the expected rendered column
  — the alphabet Phase PUB polls. The FSPEC's expected set is *seeded from* M-ENG-10's
  measurement and is thereafter the change-control point (T-7); M-ENG-10 stays a point-in-time
  observation, not a gate. A deletion, a rename, a matrix edit that changes only the rendered set,
  and any addition all fail; every member still runs on pull requests and still gates them; the
  publish workflow is a separate, additively-added trigger (C-5). "Any addition fails" is literal,
  not a judgement about review: a check this feature or REQ-EDIST-03 adds lands in the expected
  set first.
- **AC-3.5** *Who:* a verifier. *Given:* a published package. *When:* they inspect its
  contents and any log the publish produced. *Then:* no credential, token or secret value
  appears in either (C-8).
- **AC-3.6** *Who:* the operator. *Given:* a tag whose version disagrees with the **engine**
  version of record (T-1a) at that commit — the tag is an engine tag (T-4, O-7), and it is
  never compared against the plugin's number. *When:* the publish workflow runs. *Then:* it
  fails naming both values, rather than publishing under either.
- **AC-3.7** *Who:* the operator. *Given:* a tag at a commit whose engine package declares a
  compatible-plugin range (T-3) that does not include the plugin version of record (T-1b) at
  that commit. *When:* the publish workflow runs. *Then:* it fails naming the declared range
  and the plugin version found, and publishes nothing — a release is never cut with a range
  that already excludes the plugin it is paired with.

### REQ-EDIST-04 — Version provenance in the consumer's artifacts *(P0, Phase 1; US-04; G-4)*

O-F is the gap, and M-ENG-13 locates it precisely: the pair already exists in the CLI's own
returned report, and is absent from every artifact the run *commits*. This requirement is about
the committed artifacts.

- **AC-4.1** *Who:* a reader of a consumer repo. *Given:* a completed run. *When:* they read
  its final run report. *Then:* the report states both the engine version and the plugin
  version it dispatched against (the same pair reported by AC-1.4), on both the success and
  the halt path.
- **AC-4.2** *Who:* a reader. *Given:* a run that halted. *When:* they read, from the repo's
  history alone, the two artifacts the halt commits — the POSTMORTEM file and the rewritten
  `QUEUE.md` row. *Then:* the engine/plugin pair is present in the committed bytes of at least
  the POSTMORTEM, and a reader who never saw the machine can name both versions. **This does
  not hold by construction today** (M-ENG-13: the layer that writes those artifacts cannot see
  a version), so it requires a deliberate layering decision — owned by **O-9**, not assumed
  here.
- **AC-4.3** *Who:* a reader. *Given:* two runs of the same feature on different engine
  versions. *When:* they compare the artifacts. *Then:* the two versions are distinguishable
  from the artifacts alone — this is the regime-ledger scenario, and passing it is the point
  of the requirement.
- **AC-4.4** *Who:* a verifier. *Given:* the provenance values. *When:* they compare them
  with the installed engine and the installed plugin's own reported versions (AC-1.4).
  *Then:* both pairs agree for every run. The anti-echo half is stated as a change check, not
  as an adjective: with a **different** plugin version made current (a different plugin root
  selected, or the plugin manifest's version changed), the reported pair changes
  correspondingly on the next run, and reverting restores the original pair — so a hardcoded
  constant that happens to match once fails the second observation.
- **AC-4.5** *Who:* a verifier. *Given:* an existing consumer repo whose artifacts predate
  this feature. *When:* the engine runs there. *Then:* every file under `docs/{feature}/` that
  existed before the run hashes identically after it, **except files the run's own final report
  enumerates as authored by it** — that enumeration is the comparison set, so membership of the
  exception is decidable from the run's output rather than from judgement about "normal phase
  work". Files belonging to any other feature hash identically with no exception at all. If the
  report does not enumerate authored files today, making it do so is new work of the same kind as
  AC-4.2's, and is owned with it at **O-9**. No prior artifact is back-filled with provenance or
  invalidated; provenance appears from that run forward (NG-5).

### REQ-EDIST-05 — Explicit pinning and explicit dev-mode *(P1, Phase 2; US-05, US-06; G-5)*

- **AC-5.1** *Who:* the operator mid-feature. *Given:* a project pinned to version X (T-5)
  while version Y is the latest installed. *When:* they run the pipeline in that project.
  *Then:* version X executes, and the run announces the pin. The "a newer version exists"
  half is a **probe behind an injectable seam**, not an unconditional network call: when the
  probe is unavailable (offline, CI, registry down) the run states that it could not check and
  proceeds — never fails, never blocks — so the pin assertion is testable without a network
  and NG-3's "may notice, never fetches" boundary is testable by stubbing the seam.
- **AC-5.2** *Who:* the operator. *Given:* a project with no pin. *When:* they run the
  pipeline. *Then:* the latest installed version executes and the run says so; the absence
  of a pin is as visible as its presence.
- **AC-5.3** *Who:* the operator developing the pipeline. *Given:* a checkout of this repo
  and the explicit dev-mode selector (T-6). *When:* they run the pipeline against a consumer
  repo. *Then:* the checkout's prompts and modules execute, and the run's dev-mode mark appears
  in **exactly** this enumerated set of artifact kinds, checked by set-equality so an
  unmarked kind fails and a newly added kind forces the enumeration to be revisited: (1) the
  run report, (2) every POSTMORTEM the run writes, (3) the `QUEUE.md` row the run rewrites,
  (4) the commit message of every commit the run makes. Cross-review and CODE_REVIEW files are
  deliberately **out** of the set — they are authored by dispatched agents, not by the run
  harness. A dev-mode run is never mistakable for a released one in the consumer's history.
- **AC-5.4** *Who:* the operator. *Given:* a checkout present on the machine but no dev-mode
  selector passed. *When:* they run the pipeline. *Then:* the installed released version
  executes — dev-mode is never inferred (T-6).
- **AC-5.5** *Who:* the operator. *Given:* a pin naming a version that is not installed.
  *When:* they run the pipeline. *Then:* the run refuses with a message naming the pinned
  version and what is installed; it never silently falls back to latest.
- **AC-5.6** *Who:* the operator. *Given:* `PDLC_PLUGIN_ROOT` exported in the environment
  (the shipped override, honoured on presence alone today — O-5) and **no** per-invocation
  dev-mode declaration. *When:* they run the pipeline. *Then:* the run either refuses naming
  the exported variable, or executes the released version and states that the variable was
  ignored — it never silently switches skill source on env presence (T-6). Which of the two
  the engine does is the TSPEC's to fix; that it does one of them, loudly, is fixed here.

### REQ-EDIST-06 — Non-regression of the existing distribution path *(P0, Phase 1; US-02; G-6, C-4)*

- **AC-6.1** *Who:* a verifier. *Given:* the repo after this feature lands. *When:* the
  two documented bootstrap commands are executed in the documented order and the drift check
  is run. *Then:* `node pdlc/workflows/build-runtime.mjs` and the bare-path invocation of
  `pdlc/hooks/scripts/sync-workflows.sh` both exit 0, and `sync-workflows.sh --check` then
  exits 0 with every manifest row in sync — the literal transcription, not "as before".
- **AC-6.2** *Who:* a verifier. *Given:* a machine with both the plugin and the engine
  installed. *When:* a pipeline run is started through either. *Then:* the run's output
  identifies which channel and which version executed it (C-9). The bundle channel executes
  inside the Claude Code workflow runtime and cannot emit a provenance block of its own (C-4
  forbids touching that path to add one), so its identification is a **conjunction of observations
  bound to one run**, not an absence: (1) the run completed and emitted its own named output
  artifacts; (2) that output carries no engine provenance block. A run that crashed before emitting
  anything fails (1); an engine run fails (2). The fact that actually separates the two channels is
  the **load root** — the tree the executing modules were loaded from, the plugin's
  `.claude/workflows/` versus the engine's own install location, two disjoint enumerated paths (a
  *load* root, not a write root: no run writes `.claude/workflows/`; `sync-workflows.sh` and the
  SessionStart drift hook do, and the runtime's own contact with that tree is a read). **No
  run-bound observation of the load root exists on the bundle side today**: C-4 forbids teaching
  that path to self-report, and installing only one channel is the precondition of an experiment,
  not an observation the run makes, so it cannot discharge this oracle. Supplying one is new work
  of the same kind as AC-4.2's carrier, and is owned with it at **O-9**; until it lands, (1)+(2)
  distinguish the channels only on a machine whose installed channels are known independently.

## 6. Risks

- **R-1 — Channel-choice failure modes differ by kind.** A private registry channel fails on
  auth (expired token, misconfigured `.npmrc`) or availability (registry outage) — failures
  the operator does not control. A git-tag install channel fails differently: it needs a
  reachable git remote and a tool that can resolve a tag to a tarball, and it has no
  built-in yank/deprecate primitive, so a bad release is harder to un-publish (tension with
  C-7). Neither mode is eliminated by this REQ; O-1 picks which one the operator accepts, and a
  failed install/upgrade defeats G-2 outright. Mitigation direction: REQ-EDIST-02's
  failure-message ACs (AC-2.1, AC-2.4) are re-validated against the channel actually picked.
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
  design change explicitly *accepts and contains*, not eliminates. Mitigation direction: bumping
  the plugin's own version (T-1b) for any behaviour-affecting skill edit is the discipline this
  REQ assumes but does not enforce; a known residual risk, closed by no AC in §5.
- **R-4 — Two live distribution channels coexist through the whole transition window.**
  Until `pdlc-plugin-retirement` (NG-2) lands, the bundle/sync path
  (`pdlc/workflows/dist/` → `.claude/workflows/`) and the engine path both run in parallel,
  possibly on the same machine (C-9, AC-6.2). Two channels double the surface an operator
  must reason about when a run behaves unexpectedly — "which channel produced this?" is a
  question that did not exist before this feature, and a regression on one channel can be
  misdiagnosed against the other. Mitigation direction: C-9 and AC-6.2 require every run's output
  to name its channel and version; the risk retires only when `pdlc-plugin-retirement` removes the
  second channel, not by anything in this REQ.
- **R-5 — The package cannot contain the workflow modules as the repo is arranged, and the
  obvious fix breaks a shipped green test.** Per M-ENG-12 the modules sit above the engine
  package root and are reached by relative escape, so a package built from `pdlc/engine/`
  installs without them and fails at first dispatch — AC-1.3 and AC-2.1 both rest on an
  arrangement that does not exist yet. This is the largest unpriced cost in the feature.
  Three resolutions are visible, each with a consequence this REQ names rather than hides:
  (a) copy the modules into the package at build time — cheapest to publish, but turns
  `run.test.js`'s anti-fork assertions (M-ENG-12) red, so that oracle must be deliberately
  revised to distinguish "vendored in the repo" from "vendored in a build artefact", and a
  weakened anti-fork oracle is exactly the guard that stops a fork drifting; (b) publish from
  a workspace root that legitimately contains both trees — no test changes, but the published
  package's shape and the repo's layout become coupled; (c) relocate the modules under the
  package root — cleanest end state, largest blast radius, and it touches the plugin channel
  that C-4 and G-6 promise not to disturb. Mitigation direction: the choice is the TSPEC's
  (O-10), but AC-1.3's set-equality over the packed file list makes whichever is chosen
  falsifiable, and no option may be taken that leaves the anti-fork property unstated.

## 7. Obligations / Open Questions

Each obligation is cited from a BL, NG or T row above; this section is their single point of
resolution. Decisions are stated once — the earlier draft's "recommendation then decision"
duplication (which disagreed with itself at O-1) is collapsed here.

- **O-1 — Distribution channel choice.** Blocks FSPEC authoring (BL-02). *Owner:* operator.
  *Resolution form:* `docs/_decisions/DECISIONS-plugin-distribution.md`.
  **Decided 2026-08-13 — public npm, scoped package,** recorded as **DEC-DIST-05**, which carries
  the full comparison. In short: the repo is public (NG-1), so every candidate is
  privacy-equivalent, and among equivalents npm alone gives native immutability (C-7), a yank
  primitive, and a one-command install/upgrade. Git-tag install was rejected on C-7 (a bare tag is
  force-pushable); a private registry as cost without benefit. This unblocks BL-02; the publish
  preconditions it creates are O-8.
- **O-2 — Pin mechanism.** How a per-project pin (T-5) is expressed and read. Shapes
  AC-5.1–AC-5.5. *Owner:* operator, informed by TSPEC.
  **Answered 2026-08-13.** The pin lives under the `engine.*` namespace in the consumer-owned
  `.claude/pdlc.config.json`, read by the engine and never written by it — grounded in
  **DEC-HE-02** (`docs/completed/pdlc-headless-engine/DECISIONS-headless-engine-obligations.md`),
  which already reserves `engine.*` as the engine's only config surface. Reading an
  operator-authored file is not writing (NG-6 forbids only the latter). An env var was rejected:
  per-shell, not per-project. AC-5.1 requires the pinned version to *execute* while another is
  latest, so side-by-side version resolution — not just a pointer — is the TSPEC's to specify.
- **O-3 — Disposition of the `pdlc-install-mechanism` and `pdlc-release-ci` queue rows.**
  Required before this REQ is accepted (BL-04). *Owner:* operator. *Resolution form:*
  `docs/_queue/QUEUE.md`.
  **Decided 2026-08-13 and written into `QUEUE.md`**, per the dispositions tabled at §1.2:
  `pdlc-install-mechanism` closed as superseded, `pdlc-release-ci` kept, renarrowed to release
  automation for the package O-1 chose and made dependent on this feature. D-DIST-07 dissolves
  rather than transfers — it is a property of the `.claude/workflows/` copy that
  `pdlc-plugin-retirement` removes — and its re-open condition against `pdlc-engineering-loop` is
  recorded in the queue note so the deferral cannot vanish silently.
- **O-4 — Fate of `pdlc/workflows/dist/pdlc-cli.mjs`.** *Owner:* operator.
  **Closed 2026-08-13.** It stays a project-local artifact of the plugin build (NG-7's default) —
  a manifest row (`pdlc-cli`) emitted by `build-runtime.mjs` and synced by `sync-workflows.sh`,
  unaffected by this feature. The headless-engine and `pdlc-plugin-retirement` REQs say the same
  in their NG-2s; three REQs agree.
- **O-5 — Dev-mode design.** The selector's shape (T-6), how a dev-mode run is marked
  (AC-5.3), and what "the checkout's prompts" resolves to. *Owner:* this REQ's TSPEC.
  **Answered 2026-08-13, one tension routed.** The engine already ships the `PDLC_PLUGIN_ROOT`
  env var / `--plugin-root` flag — cited to the code, `pdlc/engine/lib/handshake.mjs:130-133`,
  where the compat-refusal remedy string names the variable (**not** to M-ENG-06, which holds
  neither string and is the upstream feature's per-AC table, whose `AC-*` ids collide with this
  REQ's own); TSPEC should **adopt it rather than invent a second selector**, with
  three riders: (1) dev-mode is the conjunction of running the checkout's engine *and* pointing
  the selector at the checkout's `pdlc/`; (2) AC-5.3's artifact-marking is genuinely new work —
  nothing marks such a run today (M-ENG-13); (3) the tension with T-6 (the env var is honoured
  on presence alone) is no longer left to the TSPEC to notice: **AC-5.6 now fixes the required
  observable behaviour**, and the TSPEC picks which of its two permitted branches to implement.
- **O-6 — Per-release pairing record.** Where the pairing a release actually shipped with is
  documented, read by AC-1.5. *Owner:* this REQ's TSPEC. The declaration half is settled: the
  range lives in `pdlcPluginCompat` (T-3, M-ENG-11) as a semver range — `^x.y.z`, `~x.y.z` or
  exact — checked at runtime by the handshake and at CI time by AC-3.7.
  **Open, and deliberately single-writer.** The publish workflow already computes both numbers
  for the AC-3.7 gate, so it writes the triple `{engine version, compat range, plugin version at
  tag}` **once**, inside the published package (mirroring O-D) — satisfying AC-1.5 without network
  archaeology. Any release-notes rendering is *derived from* that record by the same job, never
  independently authored: two writers are two drift surfaces.
- **O-7 — Version of record, resolving BL-03** (opened by review round 1). Two version numbers
  exist (O-C, M-ENG-11) and they are independent. **Decided:** they are **two records, not one
  contested record** — `pdlc/engine/package.json` is the engine version of record (T-1a) and
  `pdlc/.claude-plugin/plugin.json` is the plugin version of record (T-1b). A release tag names
  an engine version (T-4), and AC-3.6 compares the tag against T-1a only; the plugin's number is
  never a tag subject and enters only through the compat range (AC-3.7). Rebasing the engine's
  number onto the plugin's was rejected: it would re-couple the two release cadences this
  feature exists to separate. *Owner:* operator. *Resolution form:* transcribe into
  `docs/_decisions/DECISIONS-plugin-distribution.md` before FSPEC authoring — **the transcription
  is what discharges BL-03**, not this paragraph.
- **O-8 — Publish preconditions of the engine package** (opened by O-1, extended by review
  round 1). Three declared facts (M-ENG-11) block a first publish, and they are **not blocked by
  the same thing** — no failure ordering is claimed, because none is measured: (1) `"private":
  true` is **tool-enforced** — `npm publish` refuses outright, and this is the only one npm itself
  catches; (2) the package name `pdlc-engine` is **unscoped** while O-1/DEC-DIST-05 decided a
  scoped package — **decision-enforced**: npm would publish it happily under the wrong name, so
  nothing catches this but the operator; (3) `"license": "UNLICENSED"` is likewise
  **decision-enforced** — self-contradictory for public npm but not refused by it, with the
  `@anthropic-ai/claude-agent-sdk` dependency's own terms to be checked against whatever replaces
  it. An operator planning the first publish must not expect npm to catch (2) or (3). *Owner:* operator. *Blocking for:*
  first publish (AC-3.1), not for FSPEC authoring.
- **O-9 — Provenance carrier for the committed halt artifacts** (opened by review round 1).
  AC-4.2 requires the version pair in artifacts written by the layer that structurally cannot
  see a version (M-ENG-13). The requirement stands as a user-observable outcome; **how the pair
  crosses the engine↔module boundary is the TSPEC's to specify**, and it is a real design
  decision, not a wording fix. Until it is taken, AC-4.2 has no implementation. *Owner:* this
  REQ's TSPEC. *Blocking for:* Phase 1 delivery of REQ-EDIST-04.
- **O-10 — Package composition against the anti-fork oracle** (opened by review round 1).
  R-5's three resolutions for getting the workflow modules inside the package, and the
  consequence each has for the shipped assertions at M-ENG-12. AC-1.3 constrains the outcome;
  the choice and any revision of the anti-fork oracle belong to the TSPEC, and a resolution that
  silently drops the anti-fork property is not acceptable. *Owner:* this REQ's TSPEC.
  *Blocking for:* Phase 1 delivery of REQ-EDIST-01.
