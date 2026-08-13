# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/FSPEC-pdlc-engine-distribution.md` (v0.2)
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** delta re-review of `eb24c485..HEAD` against
`CROSS-REVIEW-test-engineer-FSPEC-v1.md`. Prior findings verified resolved or not;
changed sections scanned for new defects; unchanged sections not re-reviewed.

## Prior-finding disposition

| v1 ID | Severity | Disposition | Evidence in v0.2 |
|---|---|---|---|
| F-01 | High | **Resolved** | §5.2 now transcribes members literally: `package.json`, `bin/pdlc.mjs`, and the twelve `lib/*.mjs` names. Verified against HEAD — `pdlc/engine/lib/` holds exactly `adapter, auth, catalogue, guard-measurement, handshake, outcome, report, run, skills, startup, transport-cli, transport`, member-for-member with the table. BR-8.1 now names the echo it forbids ("an oracle that reads `pdlc/engine/lib/` for its expectation passes a deleted module and is a defect"). The unenumerable half is split off as AT-3.8b **[blocked on O-10]**, citing `run.mjs:53` — confirmed: `WORKFLOW_MODULE_URLS` reaches `../../workflows/*.js`, outside the package root |
| F-02 | High | **Resolved** | BR-7.1 scopes both set-equalities to **job-level** `name:` keys of the PR-gate file and names it (`.github/workflows/pr-tests.yml`). Verified: that file has exactly five job-level `name:` keys (`:28,78,112,138,196`) matching §5.1's five rows, and the step-level strings it excludes are real (`:46,53,66,70,92,…`). BR-7.5 puts the publish workflow's jobs outside the set explicitly, and E-29 makes the exclusion a falsifiable row rather than a note |
| F-03 | High | **Resolved** | BR-3.9 obliges an injectable channel seam, F-5 steps 8–10 route publish, re-run and secret-scan through it, and AT-3.1/AT-3.3/AT-3.5 are re-`Given` over the stub. AT-3.3 now names why (`DECISIONS-plugin-distribution.md:125`) and asserts *both* branches, one per stub configuration. The one leg a stub cannot cover is a named, dated, non-gating observation in BR-3.9 — the BR-7.4 shape, reused correctly |
| F-04 | Medium | **Resolved** | AT-4 heading reads "[blocked on O-9 for AT-4.2 and AT-4.5]", and AT-4.4 carries "**Writable today** — no carrier is missing" |
| F-05 | Medium | **Resolved** | §8 preamble defines `[auto]` / `[fixture]` / `[manual]`, declares an unlabelled family a defect, and every family heading carries a label. AT-2's per-test override names the fixture shape (clean container or `npm pack` into a temp prefix with scoped `PATH`), so no AT can be discharged on the maintainer's own machine by default |
| F-06 | Medium | **Resolved** | BR-9.1 names the carrier (the run's own authored-file enumeration, partitioned into the four kinds, plus the commit list), BR-9.2 states what equality means for kinds a run did not produce, and AT-5.3 names the exotic fixture explicitly — a halted, queue-driven run, the only shape producing all four kinds |
| F-07 | Medium | **Resolved** | BR-3.8 makes manifest publish-preconditions an offline gate, E-28 gives it a row, F-5 step 7 and §9 Q-8 own the three HEAD blockers. All three verified: `pdlc/engine/package.json:4` `"private": true`, `:2` unscoped `pdlc-engine`, `:11` `"UNLICENSED"` |
| F-08 | Low | **Resolved** | BR-7.6 sends mutations to fixture copies and assigns the overlapping assertions in `pdlc/engine/__tests__/ci-arrangement.test.js:44-60` to §5.1's carrier on landing — one failure, one remedy |
| Q-01 | — | **Answered** | §5.2 states there is no separate adapter row; the adapter *is* `lib/adapter.mjs`, and `pdlc/workflows/runtime-adapter.js` is not a member. Confirmed at `lib/adapter.mjs:8-13` ("deliberately does NOT port …") |
| Q-02 | — | **Answered** | BR-2.3 and AT-2.2 key uniqueness on the **engine's own** invocations and put `claude plugin install` outside the set. Citations verified: `README.md:115`, `pdlc/README.md:139,145` |
| Q-03 | — | **Answered** | Q-7's deferral is now bounded to an observable event ("expires when §5.1's carrier lands, in that same pass") |
| Q-04 | — | **Answered** | AT-6.2 is labelled `[manual]` with install state recorded out of band as its evidence |

## Grounding checks (changed passages only)

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
