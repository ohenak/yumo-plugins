# CODE REVIEW — pdlc-engine-distribution (v2)

| Field | Detail |
|---|---|
| Feature | pdlc-engine-distribution |
| Branch | feat-pdlc-engine-distribution |
| Review version | 2 |
| Date | 2026-08-16 |
| Verdict | Findings |
| Branch coverage (lowest new module) | 86.52% (`pdlc/workflows/build-runtime.mjs`) |
| Requirements traced | 28/30 |

**Scope: delta re-verification.** This round does **not** re-scan the code v1 already
verified. It re-verifies v1's seven findings against the four remediation commits since
`0a771e4d` — `06181c07`, `b583f92a`, `7d9add88`, `89105eba` (14 files, +948/−50) — and
scans **only that diff** for new stubs, mock data, unwired integrations and
integration-boundary gaps. §2 is carried forward from v1 with only the rows remediation
touched updated.

Suites executed this round: `pdlc/engine` **819 pass, 0 fail, 2 skipped** (the two
`PDLC_LIVE=1` opt-ins); `pdlc/workflows` **4521 pass, 1 fail, 70 skipped**. The one
workflows failure is `documentOracles.test.js:246`, and it is the same
local-environment false positive v1 named: `coveredViolations` walks the whole tree, and
its 27 hits are all untracked local paths — `.claude/worktrees/*` (two Claude-created
agent worktrees), `.serena/cache/*.pkl`, `.tokensave/tokensave.db`. Zero tracked files
and zero `coverage/` paths appear. Not a defect.

---

## §1 Code Quality Findings

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Coverage | low | `pdlc/workflows/package.json` (`c8` block) | The new coverage gate is **global-aggregate, not per-file**, so the floors it declares are not the floors it enforces. `npx c8 report --check-coverage` exits 0; the same command with `--per-file` exits 1 with `Coverage for functions (77.46%) does not meet threshold (90%) for orchestrate-queue.js`. Because `orchestrate-dev.js` is ~15k lines and dominates the aggregate, a small module could fall well below the declared 85% branch floor without the gate noticing — which is the "declared but inert" shape v1 §1-2 was about, one level down. The measured per-module branch numbers do all clear 85% today (see below), so the DoD bar is met on the numbers; it is the *gate* that is weaker than the bar. | Add `"per-file": true` to the `c8` block (and, if the 90% functions floor is not intended per-module, set the per-file floors to the numbers actually intended). | Local |

Criteria 1–3 clean **on the remediation diff**. The diff adds no `TODO`/`FIXME`/
`NotImplementedError`/"not implemented" marker, no `mock*`/`fake*`/`dummy*` identifier
and no hardcoded sample data to any production file. Its only production-code changes
are `pdlc/.claude-plugin/plugin.json`'s version (`0.23.0` → `0.23.1`) and the regenerated
`pdlc/workflows/dist/distribution-manifest.json`; everything else is CI YAML, tests,
package metadata and prose. No unwired integration: `c8@10.1.3` is in `package-lock.json`
(lockfileVersion 3) and resolves, both `npm ci` steps precede the coverage step, and
`node pdlc/workflows/build-runtime.mjs --check` exits 0 with all five rows in sync, so
the bumped manifest is a real rebuild and not a hand edit.

---

## §1a Disposition of v1's findings

| v1 finding | Severity | Commit | Verified remediated? | Evidence |
|---|---|---|---|---|
| §1-1 — `bin/pdlc.mjs` at 66.66% branch; AC-2.4's refusal never executed locally | medium | `b583f92a` | **Yes** | `provenance-path.test.js` gains three legs that `spawnSync` the **real** guard with `process.versions.node` shadowed: below-floor (exit 1, names floor and found version, asserts no `/\n\s+at\s/` stack frame, empty stdout), unparseable (`Number.isNaN` fail-closed half), and an at-floor **positive control** at `20.0.0` — without which both refusals would pass against a guard that refused unconditionally. Re-measured: `bin/pdlc.mjs` branch coverage is now **100%** (up from 66.66%). |
| §1-2 — workflows package declares no coverage at all; ≥85% not positively establishable | medium | `7d9add88` | **Yes**, with §1-1 above as a residual | `c8@10.1.3` added as devDependency + lockfile; `test:coverage` script; `check-coverage` block over the three modules the feature edits. Measured: branch **88.46%** overall — `build-runtime.mjs` 86.52%, `orchestrate-dev.js` 88.19%, `orchestrate-queue.js` 91.21%, all ≥85%. Gate proven live, not decorative: `npx c8 report --check-coverage --branches 99` exits **1** with `Coverage for branches (88.46%) does not meet global threshold (99%)`, while the declared floors exit **0**. Both `pr-tests.yml`'s `unit-tests` and `publish.yml`'s `gate` now run `npm run test:coverage`. |
| §3-1 — `fixture-machine.yml` is a sixth PR check invisible to every §5.1 oracle | high | `06181c07` | **Yes** | FSPEC §5.1 gains a `PR-gate file` column and row 6; BR-7.1 now derives file scope from each file's `on:` trigger rather than listing it; BR-7.5 is amended so the exclusion reason is the trigger, not the filename. Mechanically enforced, and I falsified it: dropping a new `on: pull_request` workflow into `.github/workflows/` turns test 5 (`§5.1's file scope equals the PR-triggered workflow files`) **RED**. New cross-file legs assert fixture-machine's job set, authored and rendered names, the union alphabet across all PR-gate files, and a job-rename mutation falsifier. |
| §3-2 — `publish.yml`'s gate re-runs only `pr-tests.yml`, so the tag is gated on weaker evidence than the PR (C-6) | high | `06181c07` | **Yes** | 37 lines added **inside the `gate` job** (`publish.yml:158-190`, before `preflight:` at `:192`; `publish` still `needs: [gate, preflight]`), carrying the launcher real-spawn legs and `fixture-machine.mjs` with the same skip sink. BR-7.7 written to state the rule. Falsified: deleting the `Fixture-machine legs` step turns test 7 (`publish.yml/PR-gate gate-command set-equality`) **RED**. |
| §3-3 — plugin bytes changed under an unchanged version number (`pluginVersionAtTag: 0.23.0`) | medium | `89105eba` | **Yes** | `plugin.json` 0.23.0 → 0.23.1, `distribution-manifest.json` regenerated to match (`--check` exits 0), and REQ §NG-5 gains a dated, reasoned exception record naming the `se-implement` SKILL.md edit and the bump. 0.23.1 satisfies the engine's declared `pdlcPluginCompat` `^0.23.0`, so the pairing range still holds. The already-published `engine-v0.1.0` pairing is immutable and correctly records what that tag was cut against; the skew is closed going forward. No test hardcodes the plugin version (the three `0.23.0` hits in `__tests__/` are semver-comparator fixtures and a `launch-wiring` stub, not couplings). |
| §3-4 — `CLAUDE.md` never mentions the engine channel | low | `89105eba` | **Yes** (see §3-2 below for an adjacent surface it left) | New `### The engine channel (pdlc/engine)` section with an eight-row fact/where table, and the load-root sentence is now split per channel. Doc-only finding, doc-only fix, as the finding's own required fix specified. |
| §3-5 — `QUEUE.md` row 4 still `pending` | low | `89105eba` | **Yes** | Row 4 → `in-progress`, which is the correct lifecycle state at Phase DOD (`awaiting-merge` is Phase PUB's write). |

Every v1 finding is remediated, and the two `high` ones are guarded by oracles I
mutation-tested rather than read: each goes red under the exact regression it exists to
catch. None of the remediation rests on an assertion-free or stub-backed test.

---

## §2 Requirements Traceability

Carried forward from v1 unchanged except rows 14, 21 and 30, which are the only rows the
remediation touched. The other 27 rows are not re-scanned this round.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 14 | REQ AC-3.4 | Check-name set-equality; red if any member is renamed, added or removed | `.github/workflows/pr-tests.yml`, `fixture-machine.yml`; FSPEC §5.1 rows 1–6 | `ci-arrangement.test.js` (file-scope derivation, per-file job sets, union alphabet, rename falsifiers) | **No** (was YES in v1) | — | — |
| 21 | REQ AC-4.4 | Anti-echo: the oracle fails on changes **and on reverts** | `lib/handshake.mjs`'s `readPluginVersion` | `version-doctor.test.js:359` covers the *change* half only; the **revert** half rests on `EVIDENCE-AT-4.4.md`, a one-time observation with no regression guard | **YES** | medium | Local |
| 30 | REQ AC-6.2 | Workflow-root resolution, both halves | `lib/provenance.mjs`, `lib/run.mjs` | `run.test.js`, `workflow-roots.test.js`; the bundle-side half is run-bound in `EVIDENCE-AT-6.2.md` | **YES** | medium | Local |

Rows 21 and 30 are unchanged from v1 and remain **spec-acknowledged** limits, not
surprises: PLAN §2 marks AT-4.4 "one-time observation, no regression guard", and TSPEC
§7.3 states plainly that AC-6.2's bundle half is not closable under C-4. They are
recorded gaps whose evidence is dated markdown that cannot fail when an implementation
breaks, so the standard criterion applies — but no remediation was dispatched for them
and none was expected. Traced: 28/30 (was 27/30).

---

## §3 Integration-Boundary Findings (criterion 6, scanned over the remediation diff only)

| # | Kind | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Adjacent-surface falsification | medium | `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md:151` (PROP-PUB-1) | `06181c07` widened FSPEC §5.1 from five rows to six but did not carry the change into the sibling spec that cites it. PROP-PUB-1 still reads "With **every** member of FSPEC §5.1's **five-row** required-check set green…". The set now has six rows, so the property's premise names a set that no longer exists. This is the same defect class as v1 §3-1 — a widened set with an un-swept citation — reproduced by v1 §3-1's own fix. It is invisible to CI because PROP-PUB-1's carrier (`publish-channel.test.js`) drives a stub that configures its own gate members rather than reading §5.1. | Update PROP-PUB-1's wording to §5.1's current row count (or, better, drop the count and cite the set by name so the row cannot go stale again on the next widening). | Local |
| 2 | Sibling omission | medium | `CLAUDE.md:106-113` (Continuous integration) | `89105eba` edited `CLAUDE.md` for v1 §3-4 but left the CI section two rows short of the gate it describes. It states "`pr-tests.yml` is the gate Phase PUB polls. **Four checks** must pass" over a four-row table. The gate is six checks across two files. One row (`Engine tests (ubuntu-latest)`) was already missing at the merge base `f5ce04dc` and is pre-existing, but **`Fixture machine (install/upgrade, launcher, container, two-repo)` is this feature's own addition**, and the sentence "`pr-tests.yml` is the gate" is now false as a whole-gate claim because a second PR-gating file exists. FSPEC §5.1's entire doctrine is that a PR-gating check this feature adds must land in the expected set first; §5.1's derived oracle now enforces that for the spec, but the repo's human-facing description of the same gate went unswept. | Update the count word, add the `Engine tests` and `Fixture machine` rows, and qualify "the gate" as spanning `pr-tests.yml` and `fixture-machine.yml`. | Cross-Feature |
| 3 | Stale disclosure | low | `pdlc/engine/__tests__/publish-channel.test.js:52`; `pdlc/engine/__tests__/ci-arrangement.test.js:250` | Two comments/assertion messages still describe §5.1 as five members after the widening: `gateConclusion "success" \| "failure" — the five §5.1 gate jobs' combined result`, and `"pr-tests.yml's job set must equal FSPEC §5.1's five gate jobs"`. The second is on a live assertion message, so a future failure of that test reports a set size the spec no longer uses. Both assertions are correct; only their prose is stale. | Reword to "§5.1's five rows **that belong to this file**" / "the §5.1 gate jobs", matching the phrasing `06181c07` already used at `ci-arrangement.test.js:278`. | Local |

**Deferral binding: clean, unchanged.** The remediation introduces no new deferral. The
one deferral it *touches* — `.gitignore`'s new `coverage/` entry — is not a deferral but
a required companion to the c8 output, and I confirmed it works as intended: after a full
`test:coverage` run, `coverage/` (99 MB, including `lcov-report`'s rendered sources) adds
**zero** entries to `coveredViolations`, so the new instrumentation does not itself become
the untracked-file false positive that already troubles this repo. v1's three bound
deferrals (N-1 → `pdlc-plugin-retirement` queue row 5; D-DIST-06 → `pdlc-release-ci` row
8; D-DIST-07 → `pdlc-engineering-loop` row 6) are untouched and still bound.

---

## Notes for the remediator

- **All three §3 findings are one sweep, not three.** Each is a citation of "§5.1 has
  five members" that `06181c07` did not follow. `grep -rn "five" docs/pdlc-engine-distribution/
  pdlc/engine/__tests__/ CLAUDE.md` scoped to §5.1 references finds all of them; fixing
  them individually risks leaving a fourth. Consider whether §5.1's row count should be
  cited by name rather than by number anywhere at all — the count is exactly the thing
  that changes.
- **§3-1 is the higher-value fix.** PROPERTIES is an approved upstream document; editing
  it is an erratum-shaped change, and its approval anchors' `UPSTREAM-STATE` for FSPEC
  will already be stale from `06181c07`'s FSPEC edit regardless of whether this row is
  fixed. Fixing it in the same pass costs nothing extra.
- **§1-1 is a one-line config change** (`"per-file": true`), but check the intended
  floors before adding it: at HEAD it makes the gate red on `orchestrate-queue.js`'s
  77.46% functions against the declared 90. The branch floor — the one DoD criterion 4
  actually names — passes per-file today on all three modules.
- **Do not "fix" the `documentOracles.test.js:246` failure in code.** It is the
  documented local false positive. Remove the untracked `.serena/`, `.tokensave/` and
  `.claude/worktrees/` trees, or read it in CI, where it is green.
- Nothing in this round contradicts v1's assessment of rows 21 and 30. They are spec-
  acknowledged and no fix is expected of you.
