# CODE REVIEW — pdlc-plugin-retirement — v3 (re-verification round 3, final)

**Scope:** Local + Cross-Feature
**Role:** dod-verify (Definition of Done verifier)
**Feature:** pdlc-plugin-retirement
**Branch:** `feat-pdlc-plugin-retirement` (verified with `git rev-parse --abbrev-ref HEAD`, before and after)
**HEAD reviewed:** `f9065dcd`
**Prior rounds:** `CODE_REVIEW-...-v1.md` (`failed`: 2 req gaps, 3 boundary gaps), `CODE_REVIEW-...-v2.md` (`failed`: 0 req gaps, 2 boundary gaps — N-1, N-2, both documentation-only)
**Remediation diff scanned:** `f530a359..f9065dcd` — 5 files, +395 / −5. Commits `86d65b0d` (FSPEC v0.12, ASM-2), `b6517503` (baseline `:113`–`:114`), `f9065dcd` (round-15 SE/TE cross-reviews), plus the v2 review file itself.
**Date:** 2026-08-18

This is a **delta re-verification** under the skill's §"Re-verification Rounds (v2+)": the full
six-criteria scan is not re-run. Each v2 finding is traced to its correction and re-measured
independently; the remediation diff is scanned on its own terms; v2's traceability table is
carried forward.

## Preamble — measurement environment

All measurements below were taken in a **clean, tracked-files-only checkout** (`git worktree add
--detach` at `f9065dcd`, `git status --porcelain` empty, dependencies installed as real
directories so `.gitignore`'s `node_modules/` rule applies). This reproduces CI and avoids the
host-dirty-tree artifacts documented in v1/v2.

Confirmed en route (and worth recording for the harvest): the AT-4.1 red seen on the live host
tree is **caused solely by untracked files**, and its exact trigger is now pinned — `.gitignore`
line 11 is `node_modules/` (trailing slash, directories only), so a *symlinked* `node_modules`
shows as `?? …` and reds AT-4.1's `git status --porcelain` assertion, while a real installed
directory is ignored and AT-4.1 is green. Not a defect; the oracle is behaving as specified.

**Clean-tree results at `f9065dcd`:**

- `pdlc/workflows`: **99 suites / 99 passed**, 3846 passed, 70 skipped, 3916 total, **0 failed**
  (AT-22 and AT-4.1 both green).
- `pdlc/engine`: **846 tests, 844 passed, 0 failed, 2 skipped** (21 suites) — unchanged from v2.
- Branch coverage (`npm run test:coverage`, `c8 --check-coverage --per-file --branches 85`):
  aggregate **88.25 %**, per-file floor **88.19 %** (`orchestrate-dev.js`); `build-runtime.mjs`
  88.23 %, `orchestrate-queue.js` 88.75 %. Gate green, identical to v2 — expected, since this
  round's diff touched no executable source.

---

## §1 — Disposition of v2's two findings

| v2 # | Severity | v2 finding | Correction | Independent verification | Status |
|---|---|---|---|---|---|
| N-1 | low | `FSPEC:844` ASM-2 still recorded the superseded derivation "L-5's post-sweep count **119 − 22 = 97**" after v1's remediation moved L-5 to 99 — the FSPEC self-contradicted inside one version | `86d65b0d` (FSPEC v0.11 → v0.12): ASM-2 now reads **119 − 21 + 1 = 99**; §7.2 row 7 extended to record the follow-up correction and cite CODE_REVIEW-v2 N-1 | **Re-measured against the branch, not the prose.** `git ls-tree` at merge-base `1efb9a3b`: 119 `pdlc/workflows/__tests__/*.test.js`; at HEAD: **99**. Set difference: **21 deleted**, **1 added** (`consumerCleanup.test.js`). ASM-2's three terms are each individually true at branch tip. Oracle-side: `documentOracles.test.js:314`–`:317` asserts the post-sweep literal 99 and is green. Dual-confirmed by the round-15 cross-reviews (`CROSS-REVIEW-software-engineer-FSPEC-v15.md`, `CROSS-REVIEW-test-engineer-FSPEC-v15.md`), both "Approved with minor changes", both recording F-01 closed. | **Closed** |
| N-2 | low | `docs/_constraints/pdlc-retirement-baseline.md:113`, `:114` — the A-1 rows still justified their exclusions as "permanently a dependent-sweep hit" / "must be a dependent-sweep hit", which `f530a359`'s fragment-assembly had made false | `b6517503`: both rows re-worded to "landed at `f530a359` — fragment-assembly (`:24`–`:34` / `:60`–`:65`) splits each retired name across concatenated string literals, so the source text no longer sweep-hits; re-measured absent from L-3's 118-path output" | **Re-measured.** L-3's literal command (FSPEC `:368`–`:371`) re-executed over `$(git ls-files)` in the clean checkout: neither `pdlc/hooks/scripts/cleanup-consumer-workflows.sh` nor `pdlc/workflows/__tests__/consumerCleanup.test.js` appears in the output (grep count 0). Cited line ranges verified: `cleanup-consumer-workflows.sh:24`–`:34` carries `EXPECTED_ENTRIES` with `"consolidate-learnings.bundle"".js"` / `".pdlc-dri""ft-state.json"` splits; `consumerCleanup.test.js:60`–`:65` carries the mirrored frozen array. Both rows are now true statements about the branch tip. | **Closed** |

### §1.1 — Sweep total moved 118 → 119, and why that is correct

L-3's command now returns **119** paths, not v2's 118. The single added path is
`docs/pdlc-plugin-retirement/CODE_REVIEW-pdlc-plugin-retirement-v2.md` — v2's own review file,
which necessarily quotes the retired vocabulary. It falls inside A-1's frozen glob
`docs/pdlc-plugin-retirement/**`, so **AC-1.2's required-empty residual is still 0**. This is
confirmed independently by the shipped gate: `documentOracles.test.js` PROP-SWEEP-2(b) (sweep
output minus A-1 ⇒ empty) is green in the clean checkout, together with PROP-SWEEP-2(a)
non-vacuity, PROP-SWEEP-2(c) term fidelity and PROP-SWEEP-3 — 25/25 in that suite.

No A-1 glob was widened to absorb the new path (the glob list is byte-identical to v2's
transcription; PROP-SWEEP-2(c)'s set-equality is green), so the E-12 "never green a red search by
widening the filter" rule is not implicated. The baseline's own commit-pinned Partition counts
(133 at `0e86f11a`, 136 at `b73fb4de`) are historical measurements and are not falsified by the
new hit.

---

## §2 — Remediation-diff scan (criteria 1–3 over `f530a359..f9065dcd`)

| Criterion | Result |
|---|---|
| 1 — stubs in production code | **0.** The diff is five `.md` files. No executable source, shell script, config or manifest was touched (`git diff --name-only` verified). |
| 2 — unwired integrations | **0.** No integration points exist in the diff. |
| 3 — mock/fake data in production code | **0.** No production code in the diff. |
| 4 — branch coverage | Unchanged and green: 88.25 % aggregate, 88.19 % per-file floor, `--branches 85` gate passes. |

**Doc-consuming oracles re-run** (the two edited documents are parsed by three suites):
`documentOracles.test.js` **25/25 green**, `consolidationSkillAnchors.test.js` **46/46 green**
(both consume `pdlc-retirement-baseline.md`), and `pdlc/engine/__tests__/preflight-baseline.test.js`
green within the full engine run (844/844 passing). The baseline re-wording changed no
oracle-parsed structure.

**No regression introduced.** The full workflows suite (3846 passing) and full engine suite
(844 passing) match v2's clean-tree figures exactly.

---

## §3 — Traceability (criterion 5), carried forward from v2

v2 carried v1's 27-row table forward with 27/27 traced and **0 gaps**. This round's diff touched
no acceptance-criterion implementation or test path, so no row's disposition changes. Two rows
re-verified because their evidence was re-measured above:

| # | Source | Criterion / AC | Implementation path | Test path | Gap? | Severity | Scope |
|---|---|---|---|---|---|---|---|
| 2 | REQ | AC-1.2 — retired-name sweep minus A-1 is **empty** | Fragment-assembly across ~28 files (`f530a359`) | `documentOracles.test.js:571`–`:576` (PROP-SWEEP-2(b)); independently re-measured this round: residual **0 of 119** hits | **No** | — | Local |
| 3 | REQ | AC-1.3 — post-sweep workflow suite size pinned, no skip-join orphans | 21 modules deleted, 1 added; 99 at HEAD | `documentOracles.test.js:314`–`:317` (literal 99, green); measured `git ls-tree` count 99; FSPEC L-5 and ASM-2 both now read 99 | **No** | — | Local |

**Traced: 27/27. Requirement gaps: 0.**

---

## §4 — Integration-boundary re-verification (criterion 6)

**(a) Adjacent-surface falsification — nothing new.** The diff edits documents only, and both
edits were themselves boundary corrections. Re-checked that the corrections did not falsify their
own neighbours: FSPEC §4.2 L-5 (99), §7.2 row 7, TSPEC §4.4, `preflight-baseline.test.js` and
`documentOracles.test.js:314` now all agree on 99; the baseline's A-1 glob list is unchanged and
still set-equal to L-3's transcription.

**(b) Deferral binding — unchanged and intact.** Both bindings re-confirmed present at HEAD:
`docs/_queue/QUEUE.md:86` row 24 (`pdlc-consolidation-rehost`, binds REQ O-8) and `:87` row 25
(`pdlc-retirement-operator-verification`, status `blocked`, binds the nine `PENDING-OPERATOR`
criteria). The diff introduces no new deferral.

**Boundary gaps: 0.**

### §4.1 — Observations recorded, not findings

Neither item below is diff-introduced, oracle-relevant, or user-visible. They are recorded so the
harvest can pick them up as wording polish; **DoD is not gated on them.**

1. **`FSPEC:400`–`:405` (L-5) still enumerates "the sweep deletes **22**" and lists
   `hookCompatibility` among M-8's modules.** Measured reality is 21 deletions with
   `hookCompatibility.test.js` **surviving** — which is what FSPEC L-6 row 2 requires and what
   `documentOracles.test.js` asserts (PROP-COMPAT-04/05/06 retained in that host; green). This
   staleness predates round 1, was raised in neither v1 nor v2, and is **already self-flagged in
   the document**: `FSPEC:158` records that `hookCompatibility.test.js`'s disposition is contested
   against TSPEC §6.1 erratum 6 and points at the §7.2 row 7 correction, and L-5's own text
   caveats that the literal is corrected at re-measurement time. The operative number (post-sweep
   99) is correct in every location and is mechanically pinned. Suggested one-line fix at polish:
   L-5 to read "deletes **21**: M-8's 20 modules … plus M-11p's `runtimeProvenanceWiring`;
   `hookCompatibility` survives per L-6 row 2".
2. **`documentOracles.test.js:312` comment** describes class 6 as "19 M-8 modules plus
   `runtimeProvenanceWiring.test.js`". If that is a whole-sweep claim it is off by one against the
   measured 20 M-8 deletions; if it scopes only T15's batch it is fine. It is a comment in a test
   file (not production code, not a disclosure surface), and the assertion beneath it is
   independently correct.

For completeness: the round-15 SE and TE cross-reviews both carry forward **F-02 (Low)** — §7.2
row 7's phrase "already carried the corrected 99" is accurate only against an explanatory comment
in `preflight-baseline.test.js`, not an assertion in that file. Worth noting that the invariant
*is* mechanically pinned, just in the other channel: `pdlc/workflows/__tests__/documentOracles.test.js:314`
fails if the count drifts. F-02 is a wording preference, not a DoD violation.

---

## §5 — Verdict

Both v2 findings are closed, and each closure was verified by **independent re-measurement of the
branch**, not by reading the corrected prose: ASM-2's `119 − 21 + 1 = 99` matches `git ls-tree`
term for term, and the baseline's two re-worded A-1 rows match a fresh execution of L-3's literal
command. The remediation diff is documentation-only (five `.md` files, no executable source), and
the full suites plus the coverage gate reproduce v2's clean-tree numbers exactly — 99/99 workflow
suites, 3846 passing, 844 engine tests passing, 88.25 % branch coverage, sweep residual 0.

No unremediated finding remains and the remediation diff is clean. Criteria 1–6 hold.

**DoD is met.**

DOD_STATUS: passed
