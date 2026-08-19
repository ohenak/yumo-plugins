# CODE REVIEW — pdlc-plugin-retirement — v2 (re-verification round 2)

Scope: Local + Cross-Feature
Role: dod-verify (Definition of Done verifier)
Feature: pdlc-plugin-retirement
Branch: `feat-pdlc-plugin-retirement` (verified via `git rev-parse --abbrev-ref HEAD`)
HEAD reviewed: `f530a359`
Prior round: `CODE_REVIEW-pdlc-plugin-retirement-v1.md` (`DOD_STATUS: failed`, 2 req gaps + 3 boundary gaps)
Remediation diff scanned: `fe7ff91b..f530a359` (35 files, +462 / −109) — commits `07ba02e0`, `ca69efaa`, `f530a359`
Date: 2026-08-18

This is a **delta re-verification** per the dod-verify skill's §"Re-verification Rounds (v2+)":
the six-criteria full scan from v1 is not re-run. Each v1 finding is traced to a production
path **and** a test that would fail if the fix were reverted; the remediation diff is then
scanned on its own for new stubs, mock data, unwired integrations and integration-boundary
gaps. v1's §2 traceability table is carried forward, updated only where the remediation
touched a row.

## Preamble — host-tree artifacts, re-confirmed as non-defects

v1 recorded two red tests in the maintainer's working tree that are **host-dirty-tree
artifacts, not defects**. Both were re-proved so this round:

- The live tree at review time carries ` M .claude/pdlc-wave-state.json` and `?? .claude/workflows/`.
  Running the suite there reds `documentOracles.test.js › AT-22` (`coveredViolations(LIVE_ROOT)`
  walks untracked host state — `.serena/cache/**`, `.tokensave/tokensave.db`) and
  `consumerCleanup.test.js › AT-4.1` (asserts `git status --porcelain === ""`).
- Re-run in a **clean tracked-files-only checkout** (`git worktree add --detach HEAD`, with
  `node_modules` present as a real directory so `.gitignore`'s `node_modules/` rule applies):
  **99 suites passed / 99 total, 3846 passed / 70 skipped / 3916 total, 0 failed.**
  AT-22 and AT-4.1 both pass. AC-1.6's "clean tracked-files-only checkout" scoping is the
  governing clause; nothing here is a code defect.

Independent gate evidence at HEAD, all measured in the clean checkout:

- `pdlc/workflows`: **99 suites / 3916 tests, 0 fail** (v1: 99/3842+4-new).
- `pdlc/engine`: **846 tests, 844 pass / 0 fail / 2 skipped** — unchanged from v1.
- `node pdlc/workflows/build-runtime.mjs --check` → `in-sync  pdlc/workflows/dist/pdlc-cli.mjs`, exit 0.
- `bash -n` over all five `pdlc/hooks/scripts/*.sh` → clean.
- Branch coverage (`npm run test:coverage`, `c8 --check-coverage --per-file --branches 85`):
  aggregate **88.25%**, per-file floor **88.19%** (`orchestrate-dev.js`); `build-runtime.mjs`
  88.23%, `orchestrate-queue.js` 88.75%. Gate green, identical to v1 (the remediation touched
  only comments and string-literal spelling in production sources).

---

## §1 — v1 findings, remediation traced

| v1 # | Severity | v1 finding | Remediation | Falsifying test | Status |
|---|---|---|---|---|---|
| 2 | high | AC-1.2's required-empty sweep returned **~30 tracked paths**, not zero (four surviving production sources + ~20 test modules carrying retired names contiguously) | `f530a359` applied M-11o's fragment-assembly discipline across ~28 files (`orchestrate-dev.js:7`, `orchestrate-queue.js:7`, `consolidate-learnings.js:6`, `build-runtime.mjs:6`–`:7`, `dist/pdlc-cli.mjs:15`, `pdlc/RELEASE-CHECKLIST.md:21`–`:27`, `cleanup-consumer-workflows.sh:22`–`:34`, `document-oracles.mjs:45`/`:108`–`:119`, and the test corpus), plus re-fixturing of three `covered-violations/` fixture files | `documentOracles.test.js` PROP-SWEEP-2(b) — **mutation-verified**: appending a `sync-workflows` mention to `pdlc/README.md` in a clean worktree reds the test (`documentOracles.test.js:574`), reverting greens it | **Closed** |
| 3 | high | PROP-SWEEP-2 / PROP-SWEEP-3 had **no oracle at all** despite PLAN T29 marked complete | `f530a359` added a 4-test block to `documentOracles.test.js:443`–`:591` implementing PROP-SWEEP-2(a)/(b)/(c) and PROP-SWEEP-3 | All four pass; **each is load-bearing** (see §1.1) | **Closed** |
| 4 | medium | FSPEC L-5 pinned "Post-sweep expectation: **97**" while the shipped oracle and TSPEC §4.4 carried 99; FSPEC:158 self-flagged "not yet corrected here" | `07ba02e0` bumped FSPEC to v0.11, corrected L-5 to **99**, closed FSPEC:158's self-flag, and recorded the correction as §7.2 ledger row 7 | `documentOracles.test.js:314` asserts 99; measured `ls pdlc/workflows/__tests__/*.test.js \| wc -l` = **99** at HEAD; `pdlc/engine/__tests__/preflight-baseline.test.js` T13 gate green | **Closed** (but see finding N-1) |
| 5 | low | `EXEMPTIONS` clause (iii) not re-examined after the sweep removed every live writer of the index-manifest filename | `f530a359` made the decision explicit in `document-oracles.mjs:105`–`:114`: clause (iii) is **kept**, because completed-feature `pdlc-workflow-distribution` FSPEC §7.5 pins `EXEMPTIONS` as a frozen four-member literal, and its only remaining decisive role is un-shadowing the DOD-04 fixture witness | `documentOracles.test.js:49` (four-member `EXEMPTIONS` set-equality) and the DOD-04 exemption-(iii)-is-decisive block, all green | **Closed** |
| 6 | medium | Nine `PENDING-OPERATOR` acceptance criteria (AC-3.1 transcript half, AC-3.2, AC-3.4, AC-3.5, AC-3.6, AC-4.4, AC-5.3 and the two **P0** criteria AC-5.1, AC-5.2) bound only to prose in two ledger docs — criterion 6(b) unbound deferral | `f530a359` added `docs/_queue/QUEUE.md` **row 25** `pdlc-retirement-operator-verification` (status `blocked`, Depends-On `pdlc-plugin-retirement`) with a 13-line rationale naming all nine criteria and the AT-3.x/AT-5.3 live-dispatch observations that back them | QUEUE row present at `docs/_queue/QUEUE.md:87` + `:88`–`:100` | **Closed** — see §1.2 |

### §1.1 — the new PROP-SWEEP oracle is load-bearing, not decorative

Per the skill's mutation rule for new invariants, each new assertion was reverted-and-checked:

- **PROP-SWEEP-2(a)** (non-vacuity control): asserts the *unfiltered* sweep is non-empty and
  contains both of A-1's mandatory positive-control members
  (`docs/_decisions/DECISIONS-plugin-distribution.md`, `docs/_constraints/pdlc-retirement-baseline.md`).
  Verified independently: both appear at sweep lines 1–2.
- **PROP-SWEEP-2(b)** (the AC-1.2 gate): mutation → RED (see table above).
- **PROP-SWEEP-2(c)** (term fidelity): mutation → narrowing one term to `distribution-manifestXX`
  reds at `documentOracles.test.js:579`.
- **PROP-SWEEP-3** (exclusion-side mirror): mutation → adding `docs/bogus-not-in-baseline/**` to
  `A1_GLOBS` reds at `documentOracles.test.js:589`.

**Command fidelity, verified byte-for-byte.** The oracle assembles its pattern from a
fragment-split `L2_TERMS` array. Rendering that array and comparing against FSPEC §4.2 L-3's
literal alternation gives an **exact string match**:

```
sync-workflows\|pdlc-drift\|check-workflow-drift\|\.bundle\.js\|distribution-manifest\|pdlc-drift-state\|distribution\.checkEnabled
```

**A-1 transcription fidelity, verified against the baseline.** The oracle's `A1_GLOBS` array
holds **15** globs. The baseline's §*A-1 retired-name allow-list* glob table holds 11 rows
carrying exactly those same 15 globs (rows 5, 6 and 9 each list two or three). The
transcription is faithful — no glob added, none dropped, none broadened.

**Independent re-execution of the AC-1.2 gate.** Not trusting the oracle alone, L-3's command
was run by hand over a clean `git archive HEAD` checkout and filtered through the baseline's
A-1 globs with an independent matcher:

```
total sweep hits: 118        residual after A-1: 0
```

**AC-1.2's required-empty condition holds at HEAD.** (v1 measured ~30.)

### §1.2 — criterion 6(b): row 25 is a valid binding

The skill's 6(b) rule is that a named successor must exist **as a row in the consuming repo's
`docs/_queue/QUEUE.md`** when that file is present; only when it is absent does the rule fall
back to requiring a successor REQ file. `QUEUE.md` is present and row 25 exists, so the
binding is satisfied.

`docs/pdlc-retirement-operator-verification/REQ-…md` is **not yet authored**. That is
consistent with existing repo convention rather than a defect: three other queue rows
(`pdlc-authoring-contract`, `pdlc-halt-hardening-followups`, `pdlc-release-ci`) likewise point
at REQ paths not yet on the branch, and `blocked` is an established status in this queue
(rows 8, 9). No queue oracle in `pdlc/workflows/__tests__/` or `pdlc/engine/__tests__/`
requires the path to resolve; the full suite is green. **No finding.**

---

## §2 — Remediation-diff scan (criteria 1–3 over `fe7ff91b..f530a359` only)

| Criterion | Result |
|---|---|
| 1 — stubs in production code | **0.** The diff's production-source changes are comment rewordings plus string-literal fragment-splitting; no new `TODO`/`FIXME`/`NotImplementedError`, no hollow bodies. |
| 2 — unwired integrations | **0.** No new integration points. `build-runtime.mjs --check` green; `cleanup-consumer-workflows.sh` still executable and bare-path-invocable; its `EXPECTED_NAMES` array is fragment-assembled in shell (`"consolidate-learnings.bundle"".js"`) — **verified under `sh`** to concatenate to the identical nine names, and `consumerCleanup.test.js` AT-4.1/4.2/4.3 all pass in the clean checkout. |
| 3 — mock/fake data in production code | **0.** The three edited files under `__tests__/fixtures/covered-violations/` are fixtures (excluded), and the DOD-04 witness fixture still carries a covered pattern (its dedicated assertion passes). |
| 4 — branch coverage | Unchanged and green: 88.25% aggregate, 88.19% per-file floor, `--branches 85` gate passes. |

**Assertion-preservation check.** The diff converts a number of regex literals to
`new RegExp(...)` string constructions so the test sources stop being sweep hits. Because
three of these back **negative** assertions (`assert.doesNotMatch`), a mis-escaped pattern
would pass vacuously. All three were evaluated directly and confirmed non-vacuous:

- `preflight-baseline.test.js:275` — matches `execFileSync("bash", [".../check-workflow-drift.sh"])` ✓
- `ci-arrangement.test.js:913` — matches `bash pdlc/hooks/scripts/sync-workflows.sh --check` ✓
- `ci-arrangement.test.js:918` — matches `check_mode 100755 pdlc/hooks/scripts/sync-workflows.sh` ✓

A whole-diff normalisation pass (collapsing `" + "` and `""` concatenations, then diffing
removed against added lines) found no assertion whose *value* changed — every unmatched line
is comment prose, a test title, or an assertion **message**, never an asserted literal.

---

## §3 — Traceability (criterion 5), carried forward from v1

v1's 27-row table stands; only the rows the remediation touched are restated. All other rows
retain their v1 disposition.

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 2 | REQ AC-1.2 | Retired-name sweep minus A-1 is **empty** | Fragment-assembly across ~28 files (`f530a359`) | `documentOracles.test.js:571`–`:576` (PROP-SWEEP-2(b)); independently re-measured: residual **0/118** | **No** (was YES/high) | — | Local |
| 3 | REQ AC-1.3 | Workflow suite size pinned, no skip-join | `pdlc/workflows/__tests__/*.test.js` = 99 files | `documentOracles.test.js:314` asserts 99; FSPEC L-5 now reads 99 (`07ba02e0`) | No | — | Local |
| 14, 15, 17, 18, 19, 23, 24, 25, 26 | REQ AC-3.1 (transcript half), AC-3.2, AC-3.4, AC-3.5, AC-3.6, AC-4.4, AC-5.1, AC-5.2, AC-5.3 | operator-observed acceptance | as v1 | still `PENDING-OPERATOR`, but now **bound** to `docs/_queue/QUEUE.md` row 25 | No (criterion-6(b) satisfied) | — | Local |
| 27 | PROPERTIES PROP-SWEEP-2 / PROP-SWEEP-3 | L-3 command's three conjuncts; A-1 glob ↔ baseline disposition | `documentOracles.test.js:443`–`:591` | 4 tests, all mutation-verified | **No** (was YES/high) | — | Local |

**Traced: 27/27.** No requirement gap remains.

---

## §4 — Integration-boundary findings (criterion 6) — new in the remediation diff

| # | Sub-criterion | Severity | File:Line | Falsified / unhandled / unbound item | Required fix | Scope |
|---|---|---|---|---|---|---|
| N-1 | 6(a) adjacent-surface falsification | medium | `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md:844` | The v1-finding-4 erratum (`07ba02e0`) corrected L-5 to **99** but did not touch **ASM-2**, which still records the superseded derivation "L-5's post-sweep count is **119 − 22 = 97**". The assumptions table now contradicts, inside one document version, the literal it exists to justify — and ASM-2's own veto path ("if the TSPEC creates a new module, L-5 is corrected at re-measurement") narrates exactly the event that already fired without updating its numbers. Dual-confirmed by the round-14 cross-reviews (`CROSS-REVIEW-software-engineer-FSPEC-v14.md` F-01, `CROSS-REVIEW-test-engineer-FSPEC-v14.md` F-01), both Medium, both explicitly left open. Not build-blocking: no oracle parses ASM-2's prose, and `97` survives legitimately at `TSPEC:518`/`:522`/`:1296` and `FSPEC:870` as the *record* of the erratum (NEG-3 forbids unifying those). | Correct ASM-2's derivation to the post-sweep 99 (or restate it as a superseded assumption pointing at §7.2 row 7), so a reader taking ASM-2 as the derivation record does not land on the wrong number. | Local |
| N-2 | 6(a) adjacent-surface falsification | low | `docs/_constraints/pdlc-retirement-baseline.md:113`, `:114` | `f530a359`'s fragment-assembly reached `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` and `pdlc/workflows/__tests__/consumerCleanup.test.js`. Both A-1 glob rows still justify their exclusion by asserting these files are sweep hits — "its own source text is **permanently a dependent-sweep hit**" and "it **is a dependent-sweep hit** for the same reason". Re-measured at branch tip: **neither file appears in L-3's 118-path output.** Both dispositions are now false. Harmless to the gate (A-1 membership is "matched by at least one glob"; a glob that filters nothing cannot widen the required-empty search, and PROP-SWEEP-3 only checks the glob string is recorded) — but it is a stale recorded derivation of exactly the class criterion 6(a)'s "re-measure recorded derivations" rule targets. | Re-word both rows to record the actual post-sweep disposition (the globs are retained defensively; the files are no longer sweep hits because their name sets are fragment-assembled), or drop the two globs and record why. | Cross-Feature |

### 6(a) — surfaces checked and intact

- `pdlc/OPERATIONS.md`, `CLAUDE.md`, `pdlc/RELEASE-CHECKLIST.md`, READMEs, the three SKILL.md
  files: all still green under `documentOracles.test.js` AT-2.1/2.2/2.3 and `skillFiles.test.js`.
- `EXEMPTIONS` remains the frozen four-member literal FSPEC §7.5 pins; the fragment-splitting
  in `document-oracles.mjs:45` preserves the member **values** exactly.
- Fixture *filenames* under `covered-violations/` still contain the retired names — correct,
  since `grep -rln` matches file **content**, not paths, and the DOD-04 witness must sit at
  that basename for exemption (iii) to be the decisive clause.
- The baseline's Partition table counts (133 at `0e86f11a`, 136 at `b73fb4de`) are explicitly
  commit-pinned pre-sweep measurements, not claims about branch tip — not falsified.
- FSPEC L-3's "A-1's two mandatory members remain covered; AT-1.2's positive control is
  non-empty" — re-verified true (sweep lines 1–2).

### 6(b) — deferral bindings, both satisfied

- REQ **O-8** → `docs/_queue/QUEUE.md` row 24 `pdlc-consolidation-rehost`, with its REQ file
  present on branch (`ready: false`, awaiting operator veto). Unchanged from v1.
- The nine `PENDING-OPERATOR` criteria → `docs/_queue/QUEUE.md` row 25
  `pdlc-retirement-operator-verification`. New in `f530a359`; see §1.2.

No unbound deferral remains.

---

## §5 — Verdict

**All five v1 findings are closed**, and each closure is backed by a test that reverts to RED
under mutation rather than by assertion-free green. In particular the two v1 High findings —
AC-1.2's non-empty sweep and the wholly absent PROP-SWEEP-2/3 oracle — are demonstrably
fixed: the required-empty gate now measures **0 residual over 118 hits** both through the
shipped oracle and through an independent hand re-execution of L-3's literal command in a
clean tracked-files-only checkout, and the new oracle's command is byte-identical to FSPEC
L-3 while its A-1 transcription is faithful to all 15 baseline globs.

Two **new** criterion-6(a) findings arose inside the remediation diff itself. Both are
documentation-only, neither is build-blocking, and both are single-edit fixes:

1. **N-1 (medium)** — `07ba02e0` corrected FSPEC L-5 to 99 but left ASM-2 deriving 97, so the
   FSPEC now self-contradicts. Already dual-flagged by the round-14 SE and TE cross-reviews.
2. **N-2 (low)** — `f530a359` made two baseline A-1 dispositions false by fragment-assembling
   the very files those rows describe as permanent sweep hits.

Per the re-verification contract ("any new violation in the diff means `DOD_STATUS: failed`"),
this round does not pass. The remaining work is two prose corrections; no code change and no
test change is required.

Nothing was fixed here. Remediation is dispatched separately by orchestrate-dev.

DOD_STATUS: failed
{"stubs": 0, "mock_data": 0, "unwired_integrations": 0, "coverage_below_threshold": false, "branch_coverage_pct": 88, "req_gaps": 0, "boundary_gaps": 2}
