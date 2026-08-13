# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.2)
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** Delta re-review of the change from `6bfd98ea` to HEAD — round-1 findings
verified resolved, changed sections only scanned for new issues.

## Round-1 disposition

Twelve findings raised in v1; each checked against the diff, and every new code claim the
revision introduced re-measured at HEAD.

| v1 | Severity | Status | Evidence in the revision / at HEAD |
|---|---|---|---|
| F-01 | High | **resolved** | §9 Q-8 now carries O-8 forward with owner (operator) and what it blocks (AC-3.1's real-channel leg); F-5 step 7 and BR-3.8 make the three blockers an *offline* gate. Re-measured: `pdlc/engine/package.json:2,4,11` — all three still stand, as the document says |
| F-02 | High | **resolved** | BR-3.9 puts the publish action behind an injectable channel seam; AT-3.1/3.3/3.5 are now decided over the stub, with the single real-channel leg named as a one-time, non-gating observation. The immutability premise the fix rests on is real: `docs/_decisions/DECISIONS-plugin-distribution.md:125` |
| F-03 | Medium | **resolved** | §5's rules renumbered `BR-7.x`/`BR-8.x`/`BR-9.x`; E-19–E-22 retargeted; grep confirms no `BR-5.1.x`/`BR-5.2.x` reference survives outside the explanatory note at `:419`. §4's `BR-5` namespace is now unambiguous, and BR-9.1's `BR-5.3` citation reads correctly as provenance's comparison-set rule (`:383`) |
| F-04 | Medium | **mostly resolved** | F-1 step 6 and BR-1.7 now name `pdlc doctor` with its symbol (`pdlc/engine/bin/pdlc.mjs:489`, confirmed). AT-1.3 was the third named site and is unchanged — see F-02 below |
| F-05 | Medium | **resolved** | F-1 step 2 now attributes resolution to `bin/pdlc.mjs:143` → `startup.mjs:302` and correctly demotes `satisfiesRange` to step 4's comparison |
| F-06 | Medium | **resolved** | F-7 step 2 and AT-6.1 both state the fresh-clone precondition and put `--force` out of scope; the CI job cited does establish it (`.github/workflows/pr-tests.yml:138,152`) |
| F-07 | Medium | **resolved** | BR-2.3 now governs both engine commands and is keyed on the engine's own program name; AT-2.2 excludes `claude plugin install`'s three occurrences explicitly |
| F-08 | Medium | **resolved** | F-2 step 4 and AT-2.1 restore AC-1.4's conjunct |
| F-09 | Medium | **resolved** | BR-9.2 states equality over *kinds produced*, and pairs each kind with a positive; AT-5.3b carries the unmarked-fails half |
| F-10 | Medium | **resolved** | §3's marking convention extended: F-2/F-3/F-5/F-6 marked `[new]` at the heading, mixed flows marked step by step. Re-measured `.github/workflows/` — one file, so F-5's "every step below is new work" holds |
| F-11 | Low | **resolved, upstream residue** | Reconciled by scope (BR-2.2 / new BR-4.7), which is the honest reading. The REQ-side gloss is still wrong at HEAD (`REQ:515`) — re-emitted as an erratum, not carried as a finding here |
| F-12 | Low | **resolved** | §5.2's engine-modules row enumerates the twelve names literally and states the class rule. Re-measured `pdlc/engine/lib/` — the twelve names match member-for-member, no extras |

New claims introduced by the revision, all verified at HEAD: step-level `name:` keys at
`pr-tests.yml:46,53,66,70,92` (all step-level, as claimed); `ci-arrangement.test.js:44-60`
regex-asserts the matrix and job set; `run.mjs:53` reaches workflow modules by relative URL
outside the package root; `adapter.mjs:8-13` states the deliberate non-port. No unverifiable
claim found.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
