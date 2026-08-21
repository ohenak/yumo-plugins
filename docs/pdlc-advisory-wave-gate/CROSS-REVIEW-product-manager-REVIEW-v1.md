# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** the `feat-pdlc-advisory-wave-gate` implementation diff against `main` (`pdlc/workflows/orchestrate-dev.js`, `pdlc/workflows/dist/pdlc-cli.mjs`, `pdlc/workflows/__tests__/**`), read against `REQ-pdlc-advisory-wave-gate.md` and `FSPEC-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-21
**Iteration:** 1

## Scope and Method

**What the diff actually is.** `git merge-base main HEAD` is `9cf4805`, and the branch's production
footprint against it is small: `pdlc/workflows/orchestrate-dev.js` (+56/-1), its regenerated
`dist/pdlc-cli.mjs`, `package.json`'s engine bump to `^0.2.2`, and ~500 lines of test change across
eight `__tests__` files. Only two of the 488 branch commits touch the production module —
`6593b633` (A6-21) and `16a478ae` (the `snapshotRef` wiring). Everything else in A6 — the seam, the
snapshot/restore pair, the envelope, the record and escalation carriers — was already at the merge
base, so this round's product surface is: **FSPEC BR-14 / REQ AC-6.3's co-located overwrite
warning**, plus the test-only tasks A6-08 (AC-2.2's two-class arm), A6-10 (AC-5.1's `.gitignore`
boundary) and the PROP-REST-10 ordering case.

**What I verified, and how.**

1. Read the full production diff and walked each AC it claims to serve back through the shipped call
   chain: `runWaveGateSeam` (`orchestrate-dev.js:3361`) → `_notice` (`:3383`) → the run's one sink
   `const advisoryNotice = (line) => notices.push(line)` (`:14676`) → the wave-loop wiring
   `_notice: advisoryNotice` (`:15432`) → the halt-path `buildFinalReport({ … notices, … })`
   (`:16119`) → `...(haltAdvisory ? { haltAdvisory } : {})` (`:16303`).
2. For every AC that claims an **operator-visible artifact** contains something, I looked for a test
   that drives the *production assembler* (`main` / `mainDev`), not the builder alone. That sweep is
   what F-01 records.
3. Ran the suites: `cd pdlc/workflows && npm test` → **102 suites, 4159 passed, 70 skipped, exit 0**;
   `node pdlc/workflows/build-runtime.mjs --check` → `in-sync pdlc/workflows/dist/pdlc-cli.mjs`,
   exit 0 (PLAN DoD line 622 satisfied).
4. Read `docs/_constraints/DOMAIN-CONSTRAINTS.md` and `docs/_decisions/DECISIONS-*.md`, and the prior
   `CROSS-REVIEW-*` rounds for this feature, before tagging severities — F-02 below is reconciled
   against the software-engineer's still-open FSPEC v2 F-01 rather than re-tagged independently.

Citations are `file:line` only where the position **is** the evidence (a shipped call site, a
shipped oracle); everything else is cited by symbol, spec id or verbatim quote per DEC-DOC-01.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
