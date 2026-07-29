# CODE REVIEW — pdlc-workflow-distribution (v3)

Scope: Local + Cross-Feature + Process — a **delta re-verification** of v2's three findings
(DOD-11, DOD-12, DOD-13) at source, plus a fresh scan of every commit on the branch since v2.
Surfaces touched since v2: `pdlc/workflows/__tests__/skipSinkTransport.test.js` (new, 404 lines),
`pdlc/skills/orchestrate-queue/SKILL.md`, `PLAN-pdlc-workflow-distribution.md`,
`CODE_REVIEW-…-v2.md` (commit `0d79f51`), and — **landed after v2's remediation, outside the
pipeline** — `.github/workflows/pr-tests.yml` (new, 206 lines, commit `3ef6ac7`).

| Field | Detail |
|---|---|
| Feature | pdlc-workflow-distribution |
| Branch | feat-pdlc-workflow-distribution |
| Branch tip measured | **`3ef6ac7`** — the orchestrator's prompt named `0d79f51`; HEAD advanced to `3ef6ac7` at 15:30 **during** this verification (see DOD-15) |
| Review version | 3 |
| Date | 2026-07-29 |
| Verdict | **Findings** (0 high / 1 medium / 1 low) |
| Branch coverage (lowest new module) | **39.13%** (`build-runtime.mjs` — the knowingly-unmet, now-recorded floor); `skipSink.js` **91.42%**, up from 74.28% |
| Requirements traced | 30/30 (unchanged from v2; no AC was touched since) |

## Measurements taken (run, not read)

| Command / probe | Result |
|---|---|
| `cd pdlc/workflows && npm test -- --coverage` | **36/36 suites, 1039 passed, 70 skipped, 0 failed**, 214 s, **exit 0**, `globalTeardown` clean (no post-summary error) |
| `npm test -- __tests__/skipSinkTransport.test.js` | 17/17 pass, DOD-11(a)…(q) |
| branch coverage, `helpers/skipSink.js` | **95.45% stmt / 91.42% branch** (was 62.12/74.28) — uncovered now only `128-129,139`, all inside `validateSkipRecords`' C3 label fallbacks. **Above the 85% floor.** The commit message's figures are exact. |
| branch coverage, `build-runtime.mjs` | 76.78 / **39.13**, uncovered `203-208,241-246,252-253` — byte-identical to v2's measurement |
| capability skips this run | **zero** — `grep -c "SKIPPED" ` over the full log is **0**, so no `describeOrSkip`/`itOrSkip` gate fired anywhere; `guardMatrix.test.js` alone reports **70 skipped**, accounting for all 70 |
| `node pdlc/workflows/build-runtime.mjs --check` | exit **0**, 3 rows `in-sync` |
| `pdlc/hooks/scripts/sync-workflows.sh --check` | exit **0**, silent |
| `coveredViolations` / `packagingViolations` / `advertisedVersionViolation` at LIVE_ROOT | `[]` / `[]` / `{skipped: "AC-6.6 inert: … no change under pdlc/workflows/dist/ …"}` (≠ `"red"`) |
| `EXEMPTIONS` | length **4**, `Object.isFrozen` **true** (TE F-10 respected); `COVERED_PATTERNS` not exported — patterns untouched, so R-10 is respected |
| `plugin.json` / `dist/distribution-manifest.json` | both **0.12.0**; `3ef6ac7` touched no `dist/` byte, so no bump was owed |
| index / on-disk modes | `100755` for all five hook scripts + `X_OK` on disk; `100644` for `lib/pdlc-drift.sh` |
| `git ls-files .claude/` | **0 files** — the consumer copy is still fully untracked; the four `.claude/workflows/*` rows in `git diff main...HEAD` are `D` (the intended untracking) |
| `bash -n` over `git ls-files '*.sh'` | 9 scripts, all parse (the new CI `script-syntax` gate would pass locally) |
| `.github/workflows/pr-tests.yml` | valid YAML, 4 jobs; `pdlc/workflows/package-lock.json` is tracked, so `npm ci` has a lockfile |
| `git status --porcelain` | **empty** at end of review |

### Mutations applied (all reverted; `shasum` before == after; `git status --porcelain` empty)

| # | Subject | Mutation | Red observed |
|---|---|---|---|
| M1 | `helpers/skipSink.js:74` | drop the `appendFileSync` (`void record;`) — the sink writes nothing but still returns `true` | `skipSinkTransport.test.js` **11 red** — DOD-11(d)(e)(f)(j)(k)(l)(m)(n)(o)(p)(q) |
| M2 | `helpers/skipSink.js:74` | `{ flag: "a" }` → `{ flag: "w" }` (truncate instead of append) | **3 red** — DOD-11(e)(f)(o); (f) is the two-child-process case |
| M3 | `helpers/skipSink.js:92` | `malformedLines.push(line)` → `void line` | **1 red** — DOD-11(i) |
| M4 | `helpers/driftCapabilities.js:185` | `probeUidNonroot` → `return true` (uid-0 unreachable even under the spoof) | **2 red** — DOD-11(p)(q); the live-registration path is bound, not self-fulfilling |
| M5 | `build-runtime.mjs:204,242` | both `stale = true` → `stale = false` | `runtimeBundle.test.js` **4 red** — re-confirms at this HEAD the binding PLAN §9's DOD-13 note claims |

Restored hashes: `helpers/skipSink.js` `cf8b6a12…`, `helpers/driftCapabilities.js` `64e07515…`,
`build-runtime.mjs` `a03c5dad…` — each byte-identical to its pre-mutation `shasum`.

## §1 Re-verification of the v2 findings

| v2 # | Sev | Verdict | Evidence |
|---|---|---|---|
| **DOD-11** | medium | **Fixed — mutation-verified** | `__tests__/skipSinkTransport.test.js` (17 cases) covers the transport in five layers: `skipSinkPath()`'s unset/empty branch, the append→read round trip, append-only accumulation **across two real child processes** (the `O_APPEND` claim the `flag: "a"` comment rests on — untestable in-process), the read-side blank/malformed handling, the two error-swallowing branches asserted rather than assumed, C1/C2 driven over sink-transported records, and the live `itOrSkip → registerSkip → appendSkipRecord → sink → readSkipRecords → validateSkipRecords` route. M1 reds 11 of 17, M2 reds the append-only claim specifically, M3 reds the malformed-line clause, M4 reds the live path — so **no clause of the new suite passes vacuously**. Measured coverage 95.45/91.42, above the floor. **Judgement on the `getuid` spoof: faithful, not self-fulfilling.** `probeUidNonroot` *is* `process.getuid() !== 0`, so spoofing the syscall reader exercises the identical branch real root would, and M4 proves the test observes that branch rather than asserting on its own stub. What the spoof does **not** exercise — that at uid 0 permission bits are actually bypassed, i.e. the reason the gated fixtures are unconstructible — is out of the comparator's scope and is recorded as a caveat in PLAN §9 rather than glossed. **No leak, measured two ways:** (i) the full 36-suite run emitted **zero** `pdlc-test: SKIPPED` lines, so no other suite's capability probe saw uid 0 (jest's per-file module registry holds); (ii) `PDLC_SKIP_SINK` is redirected per test and restored in `afterEach`, and the run-wide sink received nothing, so `globalTeardown`'s comparator was unaffected. |
| **DOD-12** | low | **Fixed — verified at source, line by line** | `orchestrate-queue/SKILL.md`'s Blocking bullet now enumerates rows **1, 3, 4, 5, 6, 7, 10** and states "Seven of the ten precedence rows block; rows 2, 8 and 9 proceed". Checked against `mapDriftState` (`orchestrate-queue.js:1042-1128`): blocking `gate("blocked", …)` at rows 1, 3, 4, 5, 6, 7, 10 and `gate("proceed", …)` at rows 2, 8, 9 — **exact match, and the count of 7 is right**. Each row's wording matches the code's condition (row 5 `unknown`; row 6 `missing`/`stale`; row 7 `retiredPresent` non-empty, correctly flagged as blocking even when every row is `in-sync`; row 10 the totality floor). It also matches FSPEC §6.2's table verbatim in intent. One wording nit, **not** a finding: row 4 is rendered "a baseline that is not `resolved` (degraded or unresolved)" while the code tests `baselineStatus === "unresolved"` — harmless because D4 closes `baselineStatus` to exactly `resolved` \| `unresolved`, so "not resolved" ≡ "unresolved", and a degraded shell-side read is precisely what materialises as `unresolved`. |
| **DOD-13** | low | **Fixed — the PLAN §9 entry is accurate, not an excuse** | PLAN §9 now records the floor as knowingly unmet, names the mechanism, and cites the mutation evidence. Both halves check out at source: `runtimeBundle.test.js:86,148,155` invoke the builder through `execFileSync("node", [build-runtime.mjs, …])` — a **child process**, which istanbul cannot attribute to the parent's counters; and the uncovered ranges `203-208 / 241-246 / 252-253` are exactly the bundle-staleness branch, the manifest-staleness branch, and the `if (stale) process.exit(1)` tail — i.e. only code that runs in that child. M5 re-confirms at this HEAD that those branches are falsifiable (4 red). The entry also correctly warns against "fixing" the number by deleting the subprocess harness. The measured 39.13% is therefore a recorded, explained residual this round rather than a §1 finding. |

**All three v2 findings confirmed fixed; all three by mutation or by line-by-line source
comparison rather than by reading the commit message.**

## §2 New findings since v2

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| **DOD-14** | 6(a) adjacent-surface falsification / stale-disclosure family sweep | **medium** | `.github/workflows/pr-tests.yml` (all of it, commit `3ef6ac7`) vs. **11 sites in 5 documents** | Commit `3ef6ac7` adds hosted CI to this branch. The feature's own specs state, in the present tense and as *measured and binding*, that hosted CI does not exist — and every one of those statements is now false: **REQ** `:148` ("**There is no hosted CI** (`.github/` does not exist); `npm test` is the only automated verification surface"), `:59`, `:788` ("Because there is no hosted CI (D-DIST-06) nothing would force a later audit run anyway" — the rationale for AC-6.6's **accepted residual** that a *landed* `dist/` violation is never re-detected; the new `artifact-freshness` job re-detects it on every PR, so the residual as written is now over-stated), `:798`, `:905-906`, `:936` (D-DIST-06's justification column, verbatim "`.github/` does not exist"); **TSPEC** `:138` ("REQ §0 fact 10 is measured and binding: `.github/` does not exist, so **`npm test` is the only automated verification surface**") and `:148` ("**There is no CI gate.**" — the stated premise of the runner-capability policy §1.3 and the fault seam §5); **FSPEC** `:2708` (§7.7 "enforced by **maintainer discipline plus `npm test`** until D-DIST-06 lands hosted CI"; AC-6.3/6.4/6.5 are now additionally enforced at PR time); **PLAN** `:178`; and — the only operator-facing one, long-lived and not harvested — **`docs/_queue/QUEUE.md:29-32`**, whose row-7 note reads "hosted CI and release automation on `yumo-plugins` (`.github/` does not exist **today** …)". Every falsification cuts in the safe direction (enforcement got stronger), so nothing is broken; what is wrong is that five specs and the queue now describe a repo that no longer exists, and part of deferral **D-DIST-06** has landed while its successor row 7 (`pdlc-release-ci`) is still `blocked` with a justification that is no longer true. | Documentation only — no code change. Reconcile all 11 sites: restate REQ §0 fact 10, TSPEC §1.1's premise and consequence 2, FSPEC §7.7 and PLAN's verification-surface paragraph as "a PR-level CI gate now exists (`.github/workflows/pr-tests.yml`), covering `npm test`, artifact freshness, the fresh-clone bootstrap and script syntax; release automation remains D-DIST-06"; narrow AC-6.6's and §7.7's residual wording to what the new gate does **not** cover; and update `QUEUE.md` row 7's note to record that the PR-test half of D-DIST-06 has landed, leaving release automation as the row's remaining scope. Do not delete the CI workflow to make the docs true again. | Cross-Feature |
| **DOD-15** | Process / review coverage | low | commit `3ef6ac7`, branch `feat-pdlc-workflow-distribution` | The 206-line CI workflow was authored and committed **outside the pdlc pipeline**: it landed at 15:30, five minutes after the round-2 remediation commit (`0d79f51`, 15:25) and **while this round-3 verification was running** — the tree was `?? .github/` at the start of my scan and `3ef6ac7` by the end. Consequence: no phase of this feature ever reviewed it. It missed Phase CR, it missed the DOD round-2 remediation review, and it entered the branch after the version DOD round 2 was verified against, so v2's "working tree clean" statement and its `Branch (ded17d8)` header no longer describe what will ship in the PR. Two concrete risks. (a) The commit message itself records "**The Linux half of the matrix is unverified — CI has never run, so the first PR run is its first measurement**". Phase PUB polls `gh pr view --json statusCheckRollup` and **halts the pipeline if any check fails**; before `3ef6ac7` the repo had no checks and Phase PUB passed by the 10-minute no-checks route. The feature's PR is now gated on four never-executed jobs, two of which run on a second OS. (b) The `unit-tests` job runs the same 1109-test suite whose `globalTeardown` comparator fails *after* jest's summary; that is handled correctly in the workflow (judged by npm's exit code), but it has never been observed to work in GHA. | Decide and record whether `3ef6ac7` belongs to this feature or to queue row 7 (`pdlc-release-ci`). If it stays on this branch: fix DOD-14's docs, and treat the first PR run as the acceptance measurement for the workflow — do not let a red matrix job be read as a defect in this feature. If it does not: move it to row 7's branch. Either way note in the PR body that CI is running for the first time. | Process |

Criteria 1-3 over everything since v2 are clean. `0d79f51` changed **no production and no helper
file** — one new test file plus three documents; `3ef6ac7` adds one CI workflow with no TODO /
FIXME / placeholder / stub / mock token in it (grepped), no hardcoded secrets, and no
`continue-on-error` that would neuter a gate. No new imports left uncalled; no dead config.

## §3 Requirements Traceability (carried forward from v2 — no row changed)

Rows 1-29 are unchanged from v2 and remain `Gap? No`; row 21 (AC-5.3 rendered version lines)
remains the declared residual R-12 routed in PLAN §7, not a gap. Two rows are re-stated because
this round's evidence strengthened them:

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 30 | PLAN §9 "zero unexpected skips" | Mechanical comparator over registered skips | `helpers/skipSink.js` + `skipSinkSetup.js` + `skipSinkTeardown.js` | `driftHelpers.test.js` (11 unit cases, C1-C3 over literals) **+ `skipSinkTransport.test.js` (17 cases over the real transport, incl. the live uid-0 route)** — mutation-verified M1-M4 | No | — | — |
| 23 | AC-6.2a / AC-6.3-6.5 | Published package really carries `workflows/dist/`; freshness and bootstrap enforced | `pdlc/RELEASE-CHECKLIST.md` §1 (manual gate) — **now additionally `.github/workflows/pr-tests.yml`** jobs `artifact-freshness` / `fresh-clone-bootstrap` | `documentOracles.test.js:752`; the CI jobs are **unexecuted** (see DOD-15) | No | — | — |

**Residual carried forward, unchanged and still true:** the run-wide comparator's clauses C1 and
C2 still evaluate over an **empty** record set on a non-root runner — measured this round (zero
`SKIPPED` lines in 1039 tests), because no capability gate fires at uid 501. DOD-11's fix removes
the *broken-oracle* half of that risk (a sink that silently stopped working now reds 11 tests) but
not the dormancy itself. That is inherent to a uid-0 inventory on a non-root runner and is
correctly documented in `skipSink.js`'s header and PLAN §9; it is **not** re-raised as a finding.

## §4 Integration-Boundary Notes (criterion 6)

**Adjacent surfaces.** v2's DOD-12 is corrected and re-checked against `mapDriftState` at source.
One new falsification: **DOD-14**, an 11-site disclosure family across REQ/FSPEC/TSPEC/PLAN and
the operator-facing `QUEUE.md`. Counted as a single family finding: `boundary_gaps = 1`.
`CLAUDE.md` and `pdlc/README.md` were swept for the same claim and carry none — neither is
falsified.

**Version-bump sweep — clean.** `3ef6ac7` touches nothing under `pdlc/workflows/dist/`, so
`advertisedVersionViolation` is correctly inert and no `plugin.json` bump was owed; both
`plugin.json` and every manifest row still read `0.12.0`.

**Deferral binding — one deferral partially discharged out of band.** D-DIST-01/02/03/05/07 →
`QUEUE.md` row 6; **D-DIST-06 → row 7, still `blocked`, while `3ef6ac7` has landed the PR-test
half of it** (DOD-14). The row still exists, so 6(b)'s "successor must be a queue row" test is
satisfied; what is now wrong is the row's description, not its existence.

**Re-measured derivations.** `build-runtime.mjs --check` exit 0 and `sync-workflows.sh --check`
exit 0 at this branch tip; coverage percentages, the 70-skip attribution, the `EXEMPTIONS`
cardinality and the `0.12.0` pair were all re-derived mechanically this round, not read.

## Notes for the remediator

- **Nothing in v2 needs re-doing.** DOD-11, DOD-12 and DOD-13 are genuinely closed; the new
  `skipSinkTransport.test.js` is a good suite and survives four independent mutations. Do not
  weaken it in the course of fixing DOD-14.
- **DOD-14 is a documentation edit at 11 known sites** (listed with line numbers above). The
  highest-value one is `docs/_queue/QUEUE.md:29-32`, because unlike the spec documents it is
  long-lived, operator-facing, and not deleted in Phase H.
- **DOD-15 needs a decision, not a code change.** The only action that must not be taken is
  deleting `.github/workflows/pr-tests.yml` to restore the specs' truth: the workflow is a real
  gate over this feature's own invariants (freshness, bootstrap, exec bits, bash 3.2 vs 5).
- One **informational** note, no fix required: `skipSinkTransport.test.js` §5's spoof leaves
  `driftCapabilities.js`'s module-level `probeCache` holding `uid-nonroot → false` for the rest of
  the file. Harmless today (§5 is last and nothing after it gates on a capability), but a
  capability-gated test appended to this file later would silently skip. A one-line cache eviction
  after `asRoot` would remove the trap.
- Also informational: several **test-harness** helpers sit well below the 85% branch floor
  (`guardFixtures.js` 53.6%, `driftGenerators.js` 45.58%, `driftCapabilities.js` 68.57%,
  `driftHarness.js` 72.9%, `driftOrdering.js` 74.71%). These are fixture-construction error paths,
  were at these levels in v1 and v2, and are unchanged by the diff — recorded so the numbers are
  not mistaken for a regression, not raised as findings.
- Unchanged prohibitions: do not touch `EXEMPTIONS` (frozen four, TE F-10), the covered-violation
  patterns (R-10), or anything under `pdlc/workflows/dist/`.

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": true, "branch_coverage_pct": 39, "req_gaps": 0, "boundary_gaps": 1}
