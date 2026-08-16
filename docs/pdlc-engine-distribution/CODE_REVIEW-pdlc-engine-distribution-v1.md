# CODE REVIEW — pdlc-engine-distribution (v1)

| Field | Detail |
|---|---|
| Feature | pdlc-engine-distribution |
| Branch | feat-pdlc-engine-distribution |
| Review version | 1 |
| Date | 2026-08-16 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 66.66% (`pdlc/engine/bin/pdlc.mjs`) |
| Requirements traced | 27/30 |

## Method

Specs read first (REQ v0.11, FSPEC v0.7, PROPERTIES v0.6, PLAN v0.8, TSPEC v0.12), then
the implementation diff (`git diff --name-only main...HEAD`, 184 files, 577 commits).
Suites executed: `pdlc/engine` — **748 tests, 0 fail, 2 skipped** (both `PDLC_LIVE=1`
opt-ins); `pdlc/workflows` — 4516 pass, 1 fail. The single workflows failure is
`documentOracles.test.js:246` reporting untracked `.serena/` and `.tokensave/` paths; those
are local tool caches (`git ls-files --others` confirms `.serena/` is untracked and
`git ls-files` shows neither path tracked), so it is the known local-environment false
positive named in `CLAUDE.md`, **not** a feature defect. Branch coverage measured with `c8`
over `lib/`, `bin/`, `scripts/`. Packed set measured with a real `npm pack --dry-run`.
The published artifact was verified live via `npm view @kaneho/pdlc-engine pdlcPairing`.

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Coverage | medium | `pdlc/engine/bin/pdlc.mjs:32-34,44-45` | Branch coverage **66.66%**, below the 85% bar. The uncovered branches are the below-floor refusal itself and the dynamic-import `.catch`. `provenance-path.test.js:111` asserts the guard only by **source regex** (it says so: "executing it would take the guard against *this* runtime"), and the only behavioural exercise is the `node:18-alpine` leg in `fixture-machine.yml`, which is `docker`-capability-gated and never runs under `cd pdlc/engine && npm test`. AC-2.4's refusal therefore has no locally-executable behavioural oracle. | Add a subprocess leg that spawns `bin/pdlc.mjs` with a stubbed `process.versions.node` (or an injected floor) so the refusal text, exit code and absence of a stack trace are asserted by execution, not by regex. | Local |
| 2 | Coverage | medium | `pdlc/workflows/package.json` (`jest` block) | The workflows package declares **no coverage configuration at all** — no `collectCoverageFrom`, no `coverageThreshold`. Under `--experimental-vm-modules` the modules this feature edited (`orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`) report **0% / 0 branches** when coverage is requested. The ≥85% branch bar cannot be positively established for the workflows half of the feature (the provenance seam, `artifactPaths` classes 7–11, the `QUEUE.md` `Engine` column migration). | Instrument the workflows suite (c8 over the ESM entrypoints, as the engine package already does) and record the measured branch figure for the three modified modules. | Process |

Criteria 1–3 are clean. No `TODO`/`FIXME`/`NotImplementedError`/"not implemented" markers
exist in `pdlc/engine/lib`, `bin` or `scripts` outside prose comments; the `stub`/`fake`
identifiers found (`LADDER_STUB_PREFIX` in `scripts/fixture-machine.mjs`, the S-5
publish-channel stub, `auth.mjs`'s injected fake fs) are all fixture/CI machinery and none
of them is packed — the tarball's `files` allow-list is `bin/`, `lib/`, `vendor/workflows/`,
`scripts/postinstall.mjs`. No mock or seed data reaches production. No unwired integration:
`npm pack --dry-run` yields **24 members** (matching PROP-PACK-2's transcribed count), with
no `skills/` directory, no `SKILL*.md` and no test corpus, and `@kaneho/pdlc-engine@0.1.0`
resolves on the real registry carrying `pdlcPairing = {engineVersion 0.1.0, pluginCompat
^0.23.0, pluginVersionAtTag 0.23.0, tag engine-v0.1.0, commit 30773d0c}`.

## §2 Requirements Traceability

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-1.1 | Refuse before dispatch, naming range | `lib/handshake.mjs` `checkCompat` | `handshake.test.js:110-126`, `version-doctor.test.js` | No | — | — |
| 2 | REQ AC-1.2 | Prompts read from installed plugin | `lib/skills.mjs` `composePrompt` | `skills-composition.test.js` (two marker roots) | No | — | — |
| 3 | REQ AC-1.3 | Packed set equals expected, member-for-member | `package.json` `files`, `scripts/prepack.mjs` | `packaging.test.js` (real `npm pack`) | No | — | — |
| 4 | REQ AC-1.4 | Version triple reported | `bin/cli.mjs` `runVersionDoctor` | `version-doctor.test.js:259-359,392` | No | — | — |
| 5 | REQ AC-1.5 | Per-release pairing documented | `.github/workflows/publish.yml` | `publish-channel.test.js`; live `npm view` | No | — | — |
| 6 | REQ AC-2.1 | One-command install reaches handshake | `scripts/postinstall.mjs` | `postinstall.test.js`, `fixture-machine.test.js` | No | — | — |
| 7 | REQ AC-2.2 | Two repos, one upgrade, zero in-repo cmds | `scripts/fixture-machine.mjs` | `fixture-machine.yml` T50 second leg | No | — | — |
| 8 | REQ AC-2.3 | Consumer tree/index unchanged | `scripts/postinstall.mjs` | `postinstall.test.js` (positive control) | No | — | — |
| 9 | REQ AC-2.4 | Below-floor named failure, no stack trace | `bin/pdlc.mjs:31-34` | `provenance-path.test.js:111` (source only); `node:18-alpine` leg (docker-gated) | No | — | — |
| 10 | REQ AC-2.5 | Engine and plugin coexist | `scripts/fixture-machine.mjs` | T50 coexistence leg | No | — | — |
| 11 | REQ AC-3.1 | Tag ⇒ built, checked, published | `.github/workflows/publish.yml` | `publish-channel.test.js`; `EVIDENCE-BR-3.9.md` (live, verified) | No | — | — |
| 12 | REQ AC-3.2 | Red gate ⇒ failed run, nothing published | `publish.yml` `gate` needs | `publish-channel.test.js` | No | — | — |
| 13 | REQ AC-3.3 | Re-run for N: bytes unchanged, N named | `scripts/publish-preflight.mjs` | `publish-channel.test.js` (both branches) | No | — | — |
| 14 | REQ AC-3.4 | Check-name set-equality; **any addition fails** | `ci-arrangement.test.js` `EXPECTED_AUTHORED` / `EXPECTED_RENDERED_BY_JOB` | `ci-arrangement.test.js:203-244` — scoped to `pr-tests.yml` only | **YES** | high | Local |
| 15 | REQ AC-3.5 | No credential in artifact or log | `publish.yml`, `redactSecret` | `publish-channel.test.js` (+2 positives) | No | — | — |
| 16 | REQ AC-3.6 | Tag vs T-1a disagreement fails | `scripts/publish-preflight.mjs` (PF-1) | `publish-channel.test.js` | No | — | — |
| 17 | REQ AC-3.7 | Range excluding T-1b fails | `scripts/publish-preflight.mjs` (PF-2) | `publish-channel.test.js` | No | — | — |
| 18 | REQ AC-4.1 | Report states both versions | `lib/report.mjs` `buildEngineBlock`/`stampReport` | `provenanceSeam.test.js`, `report-engine.test.js` | No | — | — |
| 19 | REQ AC-4.2 | Pair in committed POSTMORTEM bytes | `orchestrate-dev.js:7460-7462`, `:12516` | `provenanceSeam.test.js` (PROP-PROV-4) | No | — | — |
| 20 | REQ AC-4.3 | Two engine versions distinguishable | `lib/provenance.mjs` | `provenance.test.js` | No | — | — |
| 21 | REQ AC-4.4 | Anti-echo: pair changes **and reverts** | `lib/handshake.mjs` `readPluginVersion` | `version-doctor.test.js:359` covers the *change* half only; the **revert** half is `EVIDENCE-AT-4.4.md`, a dated one-time observation with no regression guard (PLAN §2 says so) | **YES** | medium | Local |
| 22 | REQ AC-4.5 | Pre-existing files unchanged outside enumeration | `orchestrate-dev.js` `artifactPaths` → `buildFinalReport` | `artifactPaths.test.js` (11 classes, named-class falsifier) | No | — | — |
| 23 | REQ AC-5.1 | Pin executes, announced, probe seam | `lib/resolve-version.mjs`, `lib/store.mjs` | `launch-wiring.test.js`, `update-probe.test.js` | No | — | — |
| 24 | REQ AC-5.2 | No pin ⇒ latest, absence visible | `lib/resolve-version.mjs` | `launch-wiring.test.js` | No | — | — |
| 25 | REQ AC-5.3 | Dev-mode mark in exactly four kinds | `lib/provenance.mjs` `line` → commit sites | `devModeKinds.test.js`, `provenanceCommits.test.js`, `commit-sites.test.js` | No | — | — |
| 26 | REQ AC-5.4 | Dev-mode never inferred | `lib/resolve-version.mjs` | `launch-wiring.test.js` | No | — | — |
| 27 | REQ AC-5.5 | Uninstalled pin refuses, names both | `lib/catalogue.mjs` `version.pin-missing` | `cli.test.js`, `resolve-version.test.js` | No | — | — |
| 28 | REQ AC-5.6 | `PDLC_PLUGIN_ROOT` refused or ignored-with-notice | `lib/startup.mjs` `env.plugin-root-ignored` | `plugin-root-notice.test.js` | No | — | — |
| 29 | REQ AC-6.1 | Bootstrap + drift check all exit 0 | `build-runtime.mjs`, `sync-workflows.sh` | `pr-tests.yml:138`; re-verified here (both `--check` exit 0) | No | — | — |
| 30 | REQ AC-6.2 | Channel identified by load root | `lib/provenance.mjs` `loadRoot` (engine half) | `run.test.js`, `workflow-roots.test.js`; **bundle half has no run-bound oracle** — `EVIDENCE-AT-6.2.md` only | **YES** | medium | Local |

## §3 Integration-Boundary Findings (criterion 6)

| # | Kind | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Sibling omission | high | `.github/workflows/fixture-machine.yml:19-22`; `FSPEC §5.1`; `ci-arrangement.test.js:35,53,61` | This feature adds a **sixth PR check** — job `Fixture machine (install/upgrade, launcher, container, two-repo)`, triggered `on: pull_request`. FSPEC §5.1's expected set has five members, all from `pr-tests.yml`, and BR-7.1 scopes the oracle to "the PR-gate workflow file(s) — at HEAD exactly `pr-tests.yml`". BR-7.5 justifies excluding `publish.yml` because "its jobs are not PR checks" — **true of `publish.yml`, false of `fixture-machine.yml`**. REQ AC-3.4 is literal on this point: "a check this feature or REQ-EDIST-03 adds lands in the expected set first." It did not. A rename or deletion of the fixture-machine job is invisible to every oracle in the feature. | Either add the fixture-machine job to FSPEC §5.1's authored/rendered columns and widen `ci-arrangement.test.js`'s file scope, or amend BR-7.5 to declare PR-gating checks outside `pr-tests.yml` explicitly out of scope with a stated reason that is true of them. | Local |
| 2 | Adjacent-surface falsification | high | `.github/workflows/publish.yml:19-27` | C-6 states "Publishing is gated on the same evidence a PR is." `publish.yml`'s `gate` job re-runs only `pr-tests.yml`'s five job bodies (its own comment says so). The fixture-machine legs — the sole carriers of AT-2.3, AT-2.4, AT-2.5 and AT-2.6, i.e. **AC-2.2, AC-2.3, AC-2.4 and AC-2.5** — do not run at a tagged commit. A release is therefore cut on strictly *less* evidence than a PR receives, which C-6 forbids. | Add the fixture-machine legs to `publish.yml`'s gate (or make the publish job `needs:` a fixture-machine invocation), so the machine-level install/upgrade/coexistence evidence gates the tag as it gates the PR. | Local |
| 3 | Adjacent-surface falsification | medium | `pdlc/skills/se-implement/SKILL.md:70-77,229-233` | NG-5 declares "Changing any pipeline semantics… are untouched. This feature moves bytes, not behaviour." The diff edits `se-implement`'s Step-1 TDD procedure (new items 5–7 on `.skip` discipline) and its DoD checklist — a pipeline semantic change carried by no AC in §5. It also lands **without a `plugin.json` version bump** (the only change to that file on this branch is a unicode un-escape), so the published `pdlcPairing` records `pluginVersionAtTag: 0.23.0` against plugin bytes that have since changed under the same version number. This is R-3's skew axis, but here it is created by the feature's own diff rather than accepted from outside. | Either revert the SKILL.md edit onto its own REQ, or bump `pdlc/.claude-plugin/plugin.json`'s version and re-record the pairing, and note the NG-5 exception in the REQ. | Cross-Feature |
| 4 | Adjacent-surface staleness | low | `CLAUDE.md` (Ptah-engine and distribution sections) | Repo-root `CLAUDE.md` contains **zero** mentions of `pdlc/engine/`. It states unconditionally that "the copy the workflow runtime actually loads is a separate, untracked consumer copy under `.claude/workflows/`" — after this feature that describes one of two channels, and the engine loads from its own vendored root (`lib/run.mjs`'s two-root resolution). A reader following `CLAUDE.md` alone cannot learn the engine channel exists. | Add an engine-channel section to `CLAUDE.md` and qualify the load-root sentence per channel. | Cross-Feature |
| 5 | Adjacent-surface falsification | low | `docs/_queue/QUEUE.md:67` | Row 4 (`pdlc-engine-distribution`) still reads `pending` while the feature is at Phase DOD with 577 commits on its branch and a published `0.1.0`. The queue's own lifecycle (`pending → in-progress → awaiting-merge`) is falsified by the branch state. | Advance the row to the status the run's own lifecycle requires. | Process |

**Deferral binding — clean.** Every deferral this feature introduces names a successor
that exists: N-1 (AC-6.2's bundle-side load root, TSPEC §14 / DECISIONS:784) re-opens
against `pdlc-plugin-retirement`, **queue row 5**; D-DIST-06's release remainder is bound
to `pdlc-release-ci`, **queue row 8** (kept, renarrowed, `blocked`); D-DIST-07 is recorded
as *dissolved* with its re-open condition against `pdlc-engineering-loop` written into
`QUEUE.md:45-55`, so it cannot vanish silently. No unbound deferral found.

## Notes for the remediator

- Findings §3-1 and §3-2 are the same root cause seen from two sides: `fixture-machine.yml`
  was added as a genuinely new PR-gating surface but was never entered into either of the
  two registries that govern gating surfaces (FSPEC §5.1's expected set, `publish.yml`'s
  gate). Fixing §3-2 without §3-1 leaves the rename hole open; fixing §3-1 without §3-2
  leaves the release under-gated. Address them together.
- §2-21 (AC-4.4) and §2-30 (AC-6.2) are both **spec-acknowledged** limits, not surprises —
  PLAN §2 calls AT-4.4 "one-time observation, no regression guard", and TSPEC §7.3 states
  plainly that AC-6.2's bundle half is not closable under C-4. They are recorded as gaps
  because a dated markdown cannot fail when the implementation breaks, which is the
  standard this criterion applies; they are **not** evidence of careless work.
- §1-1's remedy is small and worth taking: AC-2.4 is the one operator-visible refusal whose
  behaviour no locally-runnable test exercises.
- The workflows suite failure seen during this review is environmental. Do not "fix" it in
  code — remove the untracked `.serena/` cache or re-run in CI.
