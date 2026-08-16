# Cross-Review: product-manager — Codebase Review (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** implementation on `feat-pdlc-engine-distribution` (delta `2bc136d2..HEAD`), against `REQ-pdlc-engine-distribution.md` §5 and my own round-2 review `CROSS-REVIEW-product-manager-REVIEW-v2.md`
**Date:** 2026-08-16
**Iteration:** 3
**Scope:** Local / Cross-Feature / Process tags on every finding

## Method

Delta review per the protocol. Read my round-2 review first, then `git diff
2bc136d2..HEAD` (8 files, +415/−64 across six commits), and exercised only what
changed. Nothing outside the delta is re-litigated; every claim below was
checked against the tree rather than read off a commit message.

**Both suites run, not quoted.** `pdlc/engine` → `1..747`, 808 tests, **806 pass
/ 0 fail / 2 skipped** (the two documented `PDLC_LIVE=1` opt-in legs).
`pdlc/workflows` → **4 516 pass / 1 fail**, the same known-local false red
carried since round 1 (`documentOracles.test.js` AT-23 walking this checkout's
untracked `.claude/` and `.serena/` trees; CI is green).

**The two behaviour fixes were run as an operator, not read.** With an empty
store, `pdlc --version` still prints branch 7's refusal wording — correct, since
nothing runs — while `pdlc dev …` now prints `no engine version is installed;
running in place as 0.1.0 — run `npm install -g @kaneho/pdlc-engine` to populate
the version store if you want to pin a version`, and the pipeline then proceeds.
That is the fix F-02 asked for, observed end to end.

**The ledger's own evidence was re-derived, not accepted.** All 57 extractable
paths in PLAN §3's ownership manifest exist at HEAD (none missing); both `[gate]`
rows check out against their records — `DEC-DIST-06` exists at
`docs/_decisions/DECISIONS-plugin-distribution.md:143`, `**N-2 recorded:** yes`
at `:176`, `pdlc/engine/LICENSE` is present, and `package.json:19` carries
`"license": "MIT"`.

## Round-2 disposition

All four round-2 findings (0 High, 2 Medium, 2 Low) are resolved. None was
closed by widening a test.

| Round-2 ID | Sev | Status | Evidence checked at HEAD |
|---|---|---|---|
| F-01 | Medium | **Resolved** | The empty-store dispatching arm now has two legs (`launch-wiring.test.js:291-338`, commit `dd7eb185`). They assert the arm *by count* — `runMain` once, `exec` zero, so a spawn against a store with no entry is a bug the leg names — and assert `{mode:"unresolved",version:null,pin:null}` in the marker `runMain` stamps. This was the one launcher arm no oracle observed |
| F-02 | Medium | **Resolved** | New catalogue id `store.empty-in-place` (`lib/catalogue.mjs:112-118`), selected in `launchMoveFor` only on the proceeding arm (`bin/cli.mjs:320-325`). `--version`/`doctor` keep the refusal wording where it is correct. Verified by running both. The oracle pairs positives (`running in place as \d+\.\d+\.\d+`, `npm install -g`) with the negative (`before running pdlc` absent) on the same path, so it is not absence-only |
| F-03 | Medium | **Resolved** | `659f8ed2` flips 53 rows; the Status column is now **59 ✅ / 0 ⬚**. I re-derived the flip's evidence independently rather than trusting the changelog — see Method. The two `[gate]` rows are the ones most easily asserted without proof, and both hold |
| F-04 | Low | **Resolved** | `devModeKinds.test.js` leg 5 (`de512cfe`) drives two provenance values differing *only* in resolved mode through the same placement and asserts each message carries its own rendering and never the other's. It first asserts the two renderings differ, so the discrimination cannot be vacuous. Runs green (6/6). The two suites now say the same thing about the mark |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
