# Cross-Review: product-manager — REVIEW (final codebase review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-wave-resume/` artifacts and the shipped diff `main...feat-pdlc-wave-resume`
**Date:** 2026-08-24
**Iteration:** 2

## Scope and method

Product lens only, and — per the delta protocol — a **narrower scope of attention, not a lower
standard**. I re-read my own `CROSS-REVIEW-product-manager-REVIEW-v1.md`, diffed the branch since
the commit v1 reviewed, and checked each of my seven prior findings against the tree at HEAD. I did
not re-litigate the requirement-by-requirement trace in v1 §"Requirement-by-requirement trace",
which I already signed off; I re-checked only what the remediation commits touched.

**Note on this file's prior content.** A `CROSS-REVIEW-product-manager-REVIEW-v2.md` already existed
on this branch, but its commits (`9c415a75`…`97e783ca`) land **before** the v1 round's commits
(`0bd2f670`…`c23696b9`) — it is an earlier, mis-numbered round reviewing an older tree, not a
partial draft of this round. Its verdict turned on a finding (T-10 unimplemented) that has since
been remediated. Shipping it as iteration 2 would have blocked the feature on already-closed work,
so I replaced it. Its findings were already reconciled into v1's Scope tags, so no signal is lost.

**The delta under review.** Nine commits since v1:

| Commit | What it claims to close |
|---|---|
| `7bd94446` | TSPEC D-1 landed; `waveResume*` census mechanised (v1 F-02, F-03) |
| `e6f9f776` | TE F-01 — over-count end-to-end |
| `6502b422` | Queue-parity citation corrected to DEC-WVR-07 / TSPEC §5.4 (v1 F-04) |
| `76171bf6` | Wave ledger documented for operators (v1 F-05) |
| `08f6d814`, `2d36dd3e` | TE F-04, TE F-06 |
| `780971b5`, `b487e3d7`, `799ae90b` | T-10's two coverage oracles + §4.5.1's table (v1 F-01) |

**Evidence I ran, not read:**

- `npm test -- __tests__/waveResume __tests__/waveExecution.test.js` in `pdlc/workflows` →
  **6 suites, 191 tests, all passing** (v1 measured 177; the delta adds 14).
- `node pdlc/workflows/build-runtime.mjs --check` → `in-sync`, exit 0. The tracked runtime artifact
  was regenerated in the same branch as the source change, per this repo's standing rule.
- Read `scripts/check-wave-resume-delta-coverage.mjs` end to end and traced its wiring into
  `pdlc/workflows/package.json:9`'s `test:coverage` chain.

**Production wiring, re-checked on the delta only.** The one new executable artifact this round adds
is `scripts/check-wave-resume-delta-coverage.mjs`. It is **not** a zero-caller seam: it is the third
step of `test:coverage` (`package.json:9`), which is what CI's `Unit tests (ubuntu-latest, node 20)`
check runs — so it executes on every PR, not only when someone remembers to invoke it. The
assertion that it *stays* wired is itself a test
(`waveResumeRepoState.test.js` › `the delta line-coverage oracle is wired into the coverage runner`),
which reads `package.json` rather than trusting the wiring to persist. That is the AC → production
caller → test-that-drives-that-caller chain I ask for, applied to a tooling artifact.

## Disposition of my round-1 findings

| v1 ID | Sev | Status at HEAD | Evidence |
|---|---|---|---|
| F-01 | **High** | ✅ **Resolved** | `scripts/check-wave-resume-delta-coverage.mjs` exists and is wired at `pdlc/workflows/package.json:9`; §4.5.1's fourth column is filled and its completeness is mechanised by four tests in `waveResumeRepoState.test.js:264-369` |
| F-02 | Medium | ✅ Resolved | `grep -rn INTERIM` over `orchestrate-dev.js`, `dist/pdlc-cli.mjs` and `waveExecution.test.js` → **no matches** |
| F-03 | Medium | ✅ Resolved | `waveResumeRepoState.test.js:210-246` — two-way set-equality between on-disk `waveResume*.test.js` and PLAN §3.3's manifest, plus a binding test that the exclusion it compensates for still exists |
| F-04 | Medium | ✅ Resolved (locally) | `waveResumeQueueParity.test.js` header now cites DEC-WVR-07 / TSPEC §5.4 verbatim and explicitly disowns the FSPEC attribution. The underlying FSPEC↔DECISIONS disagreement is upstream → **ERRATUM**, not a finding here |
| F-05 | Medium | ✅ Resolved | `pdlc/OPERATIONS.md:30-42` — the ledger, its path, the three outcomes with their verbatim announcements, and the deletion hatch; indexed from `CLAUDE.md:106` |
| F-06 | Low | ✅ Resolved | `waveExecution.test.js:2685-2699` — the second invocation now lives **inside** AT-09's own fixture, with the comment recording exactly the false-green it closes |
| F-07 | Low | ✅ Resolved | `waveResumeRepoState.test.js:144-166` — `M-WVR-1`/`M-WVR-2` rows pinned by their **measured phrases**, not by id-containment |

**All seven prior findings are closed, including the one High.** Taking each in turn on the two that
mattered most:

### F-01 (High) — the completeness oracle now exists, and it is the oracle the PLAN promised

This was the blocker, and the fix is the right shape rather than a box-tick. PLAN §2.1's T-10 row
promised two oracles. Both are present:

**Oracle (i), the per-file branch floor.** `package.json:9`'s chain ends in
`c8 report --check-coverage --per-file --branches 85`, and `coverageInstrumentation.test.js:87-97`
asserts that the per-file stage's branch floor is ≥ 85 by *parsing the script string*, plus
`:99-106` asserting the per-file stage runs **in addition to** the aggregate stage, not instead of
it. §4.5's DoD box records the measured number, **88.90 %**.

**Oracle (ii), the delta oracle — this is the one that matters.** My v1 finding was that a
whole-file percentage is blind to this feature: `orchestrate-dev.js` is ~16,300 lines and the
feature adds ~24 branches, so every new branch could be uncovered and the floor would still pass.
The compensating control now exists and is genuinely falsifiable:
`check-wave-resume-delta-coverage.mjs:82-98` derives this feature's introduced line ranges from
`git diff -U0` against the merge-base, `:104-134` reads c8's per-file uncovered-line list from the
Istanbul report (both zero-hit statements **and** never-taken branch locations), and `:165-173`
exits non-zero listing the offending lines. A new branch that loses its cover reds this — which is
exactly the mechanism v1 said the feature shipped without.

Two details I checked because they are where this class of oracle usually rots:

- **It cannot vacuously pass.** `:145-150` fails when the introduced-range set is empty, so a wrong
  base or a renamed path is a red, not a silent green. This is the "absence-only oracle" trap, and
  it was avoided without being asked.
- **It is rebase-safe.** `b487e3d7` moved it to prefer the *live* merge-base and keep the pinned sha
  only as a fallback (`:57-78`). The reasoning is written down at `:24-31`: Phase DOD rebases the
  branch, and diffing against a stale sha would attribute `main`'s lines to this feature. That is a
  real operational failure mode caught before it fired.

**The §4.5.1 table's completeness is itself checked, by set-equality.** `waveResumeRepoState.test.js`
carries three independent conjuncts (`:337`, `:343`, `:350`): the branch-class column set-equals a
**literal transcription** taken from TSPEC §3.1/§3.2/§2.4 — with the comment at `:325-326` stating
outright that it is "never read back out of the PLAN, which is the document under test here", which
is the no-implementation-echo rule applied correctly; no cell is still a `filled in by T-10`
placeholder; and every backticked test title a cell names must exist in the test file that cell
names, so renaming or deleting a covering test reds. The `expect(checked).toBeGreaterThanOrEqual(20)`
floor at `:369` closes the empty-table vacuity hole in the third conjunct. A deleted row fails
set-equality, as §2.1 promised.

### F-05 (Medium) — the ledger is now documented where an operator would look

`pdlc/OPERATIONS.md:30-42` is a better answer than the one I asked for. It gives the path, the
git-ignored status, when the record is written, the three outcomes each with its **verbatim**
announcement string, and — the part that matters for REQ-WVR-04's "documented … escape hatch" —
`:42` states plainly that `implementation.forcePhases` **cannot** name Phase I and will not override
the ledger, so deletion is the hatch. That negative is the thing an operator would otherwise waste a
run discovering. `CLAUDE.md:106` indexes it from the file people actually read first.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
