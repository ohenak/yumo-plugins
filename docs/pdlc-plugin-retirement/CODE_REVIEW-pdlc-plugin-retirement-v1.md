# CODE REVIEW — pdlc-plugin-retirement — v1

Scope: Local + Cross-Feature
Role: dod-verify (Definition of Done verifier)
Feature: pdlc-plugin-retirement
Branch: feat-pdlc-plugin-retirement (verified via `git rev-parse --abbrev-ref HEAD`)
Base: main (`git diff main...HEAD` — 232 files, +17426 / −61195)
Tip reviewed: `cdccb443` ("Phase CR round 2 dual approval — final codebase review converged")
Date: 2026-08-18
PLAN coverage scanned: T01–T33 (PLAN v0.1)

## Summary

| Metric | Value |
|---|---|
| Verdict | **Findings** |
| Stubs in production code | 0 |
| Mock/fake data in production code | 0 |
| Unwired integrations | 0 |
| Branch coverage (lowest module) | 88.19% (`orchestrate-dev.js`) — aggregate 88.25%, floor 85% |
| Requirements traced | 24/27 acceptance criteria traced; 3 gaps |
| Integration-boundary findings | 3 |

Criteria 1–4 pass. Criteria 5 and 6 carry findings, all concentrated on **AC-1.2**
(the retired-name required-empty sweep) and its missing oracle.

### Verification environment note

Two suites fail in the maintainer's working tree and **both are host-dirty-tree
artifacts, not production defects**:

- `documentOracles.test.js` › `AT-22` — `coveredViolations(LIVE_ROOT)` reports
  `.serena/cache/**`, `.tokensave/tokensave.db`, `.claude/worktrees/**`. This is the
  documented hazard in `CLAUDE.md`; **AC-1.6 explicitly scopes this oracle to "a clean
  tracked-files-only checkout"**.
- `consumerCleanup.test.js` › `AT-4.1` — asserts `git status --porcelain` is `""`, but the
  host tree carries `M .claude/pdlc-wave-state.json` and `?? .claude/workflows/`.

Both were re-run in a clean `git worktree` at HEAD and **pass** (43/43). All results below
are measured in that clean checkout:

- `pdlc/workflows`: 99 suites, **3842 passed / 70 skipped / 0 failed**.
- `pdlc/engine`: **844 passed / 0 failed / 2 skipped** (AC-1.4c green).
- `node pdlc/workflows/build-runtime.mjs --check` → exit 0, `dist/pdlc-cli.mjs` in sync.
- `bash -n` over every `pdlc/hooks/scripts/*.sh` → clean.

---

## §1 Code Quality Findings (criteria 1–4)

| # | Criterion | Severity | File:Line | Problem | Required fix | Scope |
|---|---|---|---|---|---|---|
| 1 | Stubs | low | `pdlc/workflows/__tests__/consumerCleanup.test.js:151` | `AT-4.1` asserts `git status --porcelain === ""` against the **live host repo** rather than an isolated fixture, so ordinary local state (an untracked `.claude/workflows/` — precisely what this feature retires — or a modified wave-state file) reds a green build. `AC-1.6` grants exactly this scoping clause to the sibling oracle; `AC-4.1` has none. | Scope the tracked-files assertion to a temp clone/worktree, or add AC-1.6's clean-checkout clause to AC-4.1. Not a production defect. | Local |

No violations of criteria 1, 2, 3 in production code.

- **Criterion 1 (stubs):** every `stub` / `placeholder` / `TODO` hit in surviving
  production sources is either DI-seam prose (`orchestrate-dev.js:11441`,
  `orchestrate-queue.js:1128` — "Runtime API stubs, replaced by real runtime in
  production"), the Microsoft-Store-probe comment shared by four hook scripts, or the
  literal text of the **dod-verify prompt** that `orchestrate-dev.js` emits
  (`:10068`–`:10113`). `consolidate-learnings.js:1332` positively records that the T02
  throwing skeletons are **gone**. No hollow bodies found.
- **Criterion 2 (integrations wired):** `build-runtime.mjs --check` green;
  `cleanup-consumer-workflows.sh` shipped, executable (mode 100755 asserted in a fresh
  clone), and reachable bare-path (TT-3(a): never exit 126); `hooks/hooks.json` registers
  exactly four entries with `SessionStart` preserved (AC-1.7 ✓, oracle at
  `hookCompatibility.test.js:348`). No placeholder URLs, no dead config.
- **Criterion 3 (mock data):** none. The retired fixture trees
  (`engine/__tests__/fixtures/consumer-ac12/`, `covered-violations/.claude/workflows/
  orchestrate-dev.bundle.js`) are deleted or re-fixtured.
- **Criterion 4 (coverage):** per-file branch coverage `build-runtime.mjs` 88.23%,
  `orchestrate-dev.js` 88.19%, `orchestrate-queue.js` 88.75% — all above the 85% floor
  enforced by `c8 report --check-coverage --per-file --branches 85`. Property-based
  testing present and retained (`__tests__/helpers/driftGenerators.js` reduced to what
  surviving importers use, `driftCapabilities.js` retained). Note for the record:
  `orchestrate-queue.js` function coverage is 71.42%, but `test:coverage` deliberately
  overrides the functions/lines/statements thresholds to 0 and gates on branches only —
  in scope for criterion 4 as written, flagged here for visibility, not as a violation.

---

## §2 Requirements Traceability (criterion 5)

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 1 | REQ AC-1.1 | `dist/` set-equals `{pdlc-cli.mjs}` | `pdlc/workflows/dist/` (1 entry); `build-runtime.mjs` reduced emitter | `__tests__/consolidationBuild.test.js` TT-5 (`:185`–`:272`) | No | — | — |
| 2 | REQ AC-1.2 | Retired-name sweep minus A-1 is **empty** | Sweep incomplete — see Finding 2 | **Not found** — no oracle exists | **YES** | high | Local |
| 3 | REQ AC-1.3 | Workflow suite green; `*.test.js` count equals pinned literal; no M-8 skip | 99 files; suite green | `documentOracles.test.js:314` (asserts 99); skip-join scanner (TSPEC §5.5) green | No | — | — |
| 4 | REQ AC-1.4 | Two CI jobs gone; docs' check set is set-equal | `pr-tests.yml` (unit-tests, engine-tests, script-syntax), `fixture-machine.yml`; `pdlc/OPERATIONS.md:32` "four checks across two workflow files" | `engine/__tests__/ci-arrangement.test.js`; `documentOracles.test.js` AT-2.1 | No | — | — |
| 5 | REQ AC-1.4b | `publish.yml` tag-triggered gate | `.github/workflows/publish.yml` (`on: push: tags:`) | `ci-arrangement.test.js` | No | — | — |
| 6 | REQ AC-1.4c | Engine suite green post-sweep | `pdlc/engine/**` | 844 pass / 0 fail (measured) | No | — | — |
| 7 | REQ AC-1.5 | `.worktreeinclude` / `.gitignore` rows + rationale block gone | both files | `documentOracles.test.js:346` (T21/AT-1.5) | No | — | — |
| 8 | REQ AC-1.6 | Packaging/advertised-version oracles gone; no exemption for a vanished tree | `lib/document-oracles.mjs` (`packagingViolations` removed; `isGeneratedTree` narrowed to `pdlc/workflows/dist/`) | `documentOracles.test.js:49` (frozen 4-member `EXEMPTIONS`), AT-22/AT-23 | Partial — see Finding 5 | low | Local |
| 9 | REQ AC-1.7 | Hook-entry set set-equals four rows | `pdlc/hooks/hooks.json` | `hookCompatibility.test.js:348` | No | — | — |
| 10 | REQ AC-1.8 | Per-class commits; replayed gate set passes at each | 30 commits, class-partitioned | T31 replay, 30/30 PASS (commit `2962c138`) | No | — | — |
| 11 | REQ AC-2.1 | One documented story across instructional set | CLAUDE.md, `pdlc/OPERATIONS.md`, READMEs, 3 SKILL.md | `documentOracles.test.js:385` (AT-2.1) | No | — | — |
| 12 | REQ AC-2.2 | No RELEASE-CHECKLIST row for an unperformable check | `pdlc/RELEASE-CHECKLIST.md` | `documentOracles.test.js:416` (AT-2.2) | No | — | — |
| 13 | REQ AC-2.3 | No live decision/queue row mandates the retired channel | `docs/_decisions/`, `docs/_queue/QUEUE.md` | `documentOracles.test.js:428` (AT-2.3) | No | — | — |
| 14 | REQ AC-3.1 | Engine executes pipeline; skill relays only | Delegator SKILL.md files | Static half green (`skillFiles.test.js`); **transcript half PENDING-OPERATOR** | Pending | medium | Local |
| 15 | REQ AC-3.2 | Engine refuses dispatch with plugin absent (post-sweep re-assertion) | `pdlc/engine` handshake module | **PENDING-OPERATOR** | Pending | medium | Local |
| 16 | REQ AC-3.3 | Skill set set-equal to base; hooks still fire | 15 skills present, none lost | `skillFiles.test.js` | No | — | — |
| 17 | REQ AC-3.4 | Ptah `skill_path` resolves | `pdlc/skills/*/SKILL.md` all present | **PENDING-OPERATOR** (no Ptah consumer available) | Pending | medium | Local |
| 18 | REQ AC-3.5 | In-range version handshake carries both versions | `engine/lib` version doctor | **PENDING-OPERATOR** | Pending | medium | Local |
| 19 | REQ AC-3.6 | Out-of-range refusal names all three versions | `engine/__tests__/version-doctor.test.js` covers engine half | **PENDING-OPERATOR** (live terminal output) | Pending | medium | Local |
| 20 | REQ AC-4.1 | Full-set cleanup removes nine entries, exit 0 | `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` | `consumerCleanup.test.js` AT-4.1 (green in clean checkout) | No | — | — |
| 21 | REQ AC-4.2 | Idempotent second run | same | `consumerCleanup.test.js` AT-4.2 | No | — | — |
| 22 | REQ AC-4.3 | Unexpected entry ⇒ byte-identical, stderr path, exit 3 | same | `consumerCleanup.test.js` AT-4.3 (×2, incl. `.pdlc-tmp.<pid>.<rand>` arm) | No | — | — |
| 23 | REQ AC-4.4 | Run succeeds with leftovers present | — | **PENDING-OPERATOR** (live engine run) | Pending | medium | Local |
| 24 | REQ AC-5.1 | Post-sweep end-to-end run produces same artifact classes | Sweep landed | **PENDING-OPERATOR** (POSTSWEEP-RUN §4b) | Pending | medium | Local |
| 25 | REQ AC-5.2 | Report field sets equal vs. pre-sweep baseline | — | **PENDING-OPERATOR**; baseline itself is a RETROACTIVE-SUBSTITUTE (BL-08 breach) | Pending | medium | Local |
| 26 | REQ AC-5.3 | Probe CLI at surviving repo path in a consuming checkout | `pdlc/workflows/dist/pdlc-cli.mjs` | **PENDING-OPERATOR** | Pending | medium | Local |
| 27 | PROPERTIES PROP-SWEEP-2 / PROP-SWEEP-3 | L-3 command's three clauses; A-1 frozen against its own output | — | **Not found** — see Finding 3 | **YES** | high | Local |

### Finding 2 — AC-1.2's required-empty sweep is **not empty** at HEAD (high, Local)

REQ AC-1.2 / FSPEC L-2, L-3 require: the L-3 grep over `git ls-files` for the seven-term
alternation, **minus A-1's frozen path globs**, returns an **empty** result. Term set is
declared **set-equality, not upper bound** — narrowing a term to green a red search is
explicitly barred (E-12), and widening A-1 is barred by PROP-SWEEP-3.

Executed at HEAD in a clean tracked-files-only checkout, the L-3 command minus A-1's ten
globs returns **~30 tracked paths**, not zero. The most material of these are the four
**surviving production sources** — which is exactly the class that baseline row **M-11o**
was split out to prevent ("AC-1.2's required-empty search reds on a *surviving* module"):

| File:Line | Retired term still contiguous |
|---|---|
| `pdlc/workflows/orchestrate-dev.js:7` | `` `.bundle.js` `` — the M-11o banner rewrite retains the term while denying it ("no longer bundled into a `.bundle.js` artifact") |
| `pdlc/workflows/orchestrate-queue.js:7` | `` `.bundle.js` `` — same rewritten banner |
| `pdlc/workflows/consolidate-learnings.js:6` | `` `.bundle.js` `` — same rewritten banner |
| `pdlc/workflows/build-runtime.mjs:6-7` | `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `consolidate-learnings.bundle.js` |
| `pdlc/RELEASE-CHECKLIST.md:24` | `orchestrate-dev.bundle.js`, `orchestrate-queue.bundle.js`, `distribution-manifest.json` — **not** A-1 allow-listed |

Plus ~20 surviving test modules that name the terms contiguously in comments and `it()`
titles even where the *assertion values* were correctly fragment-assembled — e.g.
`orchestrateQueue.test.js:892` (comment) and `:904` (test title) both carry
`distribution.checkEnabled` verbatim while `:919` correctly uses
`"distribution" + ".checkEnabled"`. Also `advisoryDisabled.test.js:80`
(`pdlc-drift-state`), `skillFiles.test.js:254`, `documentOracles.test.js:19`,
`engine/__tests__/ci-arrangement.test.js:913` (`sync-workflows`),
`engine/__tests__/smoke.test.js:430`.

**Required fix (one of, chosen deliberately — not by convenience):**
(a) apply M-11o's fragment-assembly discipline to the five prose sites above and to the
surviving test modules' comments/titles; **or** (b) extend A-1 with a glob for
absence-assertion hosts *plus* the per-file dispositions PROP-SWEEP-3 demands; **or**
(c) land a REQ erratum narrowing AC-1.2's required-empty domain to non-oracle files.
Whichever is chosen, it must be pinned by the oracle in Finding 3 — the baseline's own
`remainder 0` partition check is a *different* property (every hit is **owned** by some
row) and does not imply the post-sweep search is empty.

### Finding 3 — PROP-SWEEP-2 and PROP-SWEEP-3 have no implementation (high, Local)

PROPERTIES rows PROP-SWEEP-2 (L-3's three conjuncts: unfiltered output non-empty and
containing the two allow-listed survivors; output minus A-1 empty; alternation set-equals
L-2's seven terms) and PROP-SWEEP-3 (A-1's glob set vs. the baseline's per-file
disposition set) both name `pdlc/workflows/__tests__/documentOracles.test.js` as their
delivery site, at PLAN **T29**. PLAN:159 marks T29 ✅ and PLAN:181 traces AT-1.2 to it.

`documentOracles.test.js` contains **no such test**. Its full describe/test inventory
covers `EXEMPTIONS`, `coveredViolations`, the compat handshake, D-1/D-3/DOD-08, AT-1.3's
count, AT-1.5 and AT-2.1/2.2/2.3 — nothing for AT-1.2. T29 delivered only the A-1 glob
extension in `docs/_constraints/pdlc-retirement-baseline.md`; the oracle half was never
written. AC-1.2 therefore ships with **zero** automated coverage, which is precisely why
Finding 2 landed undetected.

**Required fix:** implement PROP-SWEEP-2 and PROP-SWEEP-3 as executable assertions in
`documentOracles.test.js`, including PROP-SWEEP-2(a)'s positive control (an empty
unfiltered output must **fail**, so a word-split or non-zero grep cannot green it), and
correct PLAN T29's status.

---

## §3 Integration-Boundary Findings (criterion 6)

| # | Sub-criterion | Severity | File:Line | Falsified / unhandled / unbound item | Required fix | Scope |
|---|---|---|---|---|---|---|
| 4 | 6(a) adjacent-surface falsification | medium | `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md:406` | FSPEC **L-5** pins "Post-sweep expectation: **97**" and forbids reconciliation "by a test that counts loosely". The shipped oracle asserts **99** (`documentOracles.test.js:314`, citing TSPEC §4.4's corrected literal), and the measured count is 99. FSPEC:158 self-flags the cause (`hookCompatibility` reduced, not deleted) as "**not yet corrected here**". REQ AC-1.3 sources the literal from **FSPEC**, so the AC's stated source of truth is false at branch tip while the test transcribes from TSPEC instead. | Correct FSPEC L-5's literal to 99 at re-measurement (L-5's own escape clause), and close the FSPEC:158 erratum, so AC-1.3's cited source and the shipped oracle agree. | Local |
| 5 | 6(a) adjacent-surface falsification | low | `pdlc/workflows/lib/document-oracles.mjs:45`, `:108`–`:110` | `EXEMPTIONS` retains clause (iii) "any `distribution-manifest.json`" and `isDistributionManifest()` is live, but no surviving build step emits that artifact anywhere in the repo — the only remaining instances are two files inside the `covered-violations/` **test fixture**, which the exemption then self-justifies. AC-1.6 requires the drift scan carry "no exemption for a tree that no longer exists". Clause (i) was correctly narrowed to the surviving `pdlc/workflows/dist/`; clause (iii) was not re-examined. | Decide explicitly: either retire clause (iii) with the fixture re-fixtured to match, or record in FSPEC §7.5 why a frozen exemption for a no-longer-produced artifact is deliberate. Note `EXEMPTIONS` is oracle-pinned as a frozen four-member literal, so any change is a paired test edit. | Local |
| 6 | 6(b) deferral binding | medium | `docs/pdlc-plugin-retirement/POSTSWEEP-RUN-*.md`, `OPERATOR-OBSERVATIONS-*.md` | **Nine acceptance criteria** are deferred as `PENDING-OPERATOR` — AC-3.1 (transcript half), AC-3.2, AC-3.4, AC-3.5, AC-3.6, AC-4.4, AC-5.3, and the two **P0** criteria AC-5.1 and AC-5.2. Their only binding is prose in two ledger documents. Criterion 6(b) states that "a runbook step, operator config, or bare prose mention is **not** a successor" — a deferral must name a successor that exists as a **row in `docs/_queue/QUEUE.md`** or a successor REQ file. No such row or REQ exists: `QUEUE.md` row 24 binds REQ **O-8** only (`pdlc-consolidation-rehost`, correctly bound with its REQ file present). | Add a `QUEUE.md` row (or successor REQ) that owns the operator-acceptance run for AC-5.1/AC-5.2/AC-4.4 and the AC-3.x live-dispatch observations, so the P0 criteria cannot silently never ship. The ledgers stay as the evidence template; the queue row is what makes them due. | Local |

### 6(b) — correctly bound deferral (no finding)

REQ **O-8** (consolidation pass re-hosting) is bound to `docs/_queue/QUEUE.md` row 24
`pdlc-consolidation-rehost`, with `docs/pdlc-consolidation-rehost/REQ-pdlc-consolidation-rehost.md`
present on the branch. `QUEUE.md:88`–`:95` records the binding and the `ready: false`
operator veto. This satisfies criterion 6(b).

### 6(a) — surfaces checked and found intact

- `pdlc/OPERATIONS.md:32` re-derived to "**four** checks across **two** workflow files" and
  enumerates exactly the four jobs that exist post-sweep — AC-1.4's three-part
  count-word/name/file assertion holds.
- CLAUDE.md carries no retired machinery name; its Hooks table and CI section match
  `hooks.json` and the two PR-triggered workflow files.
- `pdlc/RELEASE-CHECKLIST.md:21`–`:27` correctly rewrites (rather than deletes) the
  packaging row to a plain file-presence check and discloses that `packagingViolations`
  no longer exists — AC-2.2 satisfied. Its retired-name content is Finding 2's concern
  only, not a stale claim.
- Writer enumeration on `pdlc/workflows/dist/`: `build-runtime.mjs` is the sole writer;
  `--check` is green at HEAD; no later stage overwrites the emitted set.

---

## §4 Process finding carried forward (recorded, not re-litigated)

**BL-08 (High, process)** — REQ BL-08 required a pre-sweep engine-path report **and** a
green gate-command transcript committed at fixed paths *before the first deletion commit*
(`2c706a54`). Neither was committed; the obligation is now unsatisfiable. This is
correctly recorded verbatim as **High, process** in
`POSTSWEEP-RUN-pdlc-plugin-retirement.md` §1, with a labelled RETROACTIVE-SUBSTITUTE
baseline (`6049c0bf`) proposed and explicitly **not** treated as discharging BL-08. It is
not re-counted in this review's totals, but it is the reason AC-5.2's comparison rests on
a substitute baseline the operator has not yet accepted (see Finding 6).

---

## §5 Verdict

Criteria 1–4 pass cleanly, and the retirement itself is materially delivered: the three
scripts, three bundles, manifest, drift-state channel and drift gate are gone; the two CI
jobs are gone; hooks, skills and the surviving CLI are intact; both suites are green in a
clean checkout; the reduced build step round-trips.

Three findings block `DOD_STATUS: passed`:

1. **AC-1.2's required-empty sweep is not empty** (Finding 2) — five prose sites in
   surviving production files plus ~20 test modules.
2. **AC-1.2 has no oracle at all** (Finding 3) — PROP-SWEEP-2/PROP-SWEEP-3 were never
   implemented despite PLAN T29 being marked complete.
3. **Nine PENDING-OPERATOR criteria, including two P0, have no queue-row successor**
   (Finding 6).

Findings 4 and 5 are lower-severity adjacent-surface corrections.

Nothing was fixed. Remediation is dispatched separately by orchestrate-dev.

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 88, "req_gaps": 2, "boundary_gaps": 3}
