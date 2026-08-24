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

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
