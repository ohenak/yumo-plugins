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

Every new code citation in the delta was checked against the working tree, not against the REQ's
or the FSPEC's account of it.

| New claim in v0.2 | Checked at | Result |
|---|---|---|
| F-1 step 2: `bin/pdlc.mjs:143` reads `pkg.pdlcPluginCompat`, passes it as `engineCompat` into `startup.mjs:302`; `satisfiesRange` is the comparison, not the resolution | `pdlc/engine/bin/pdlc.mjs:140-145` (`engineCompat: pkg.pdlcPluginCompat` inside the `runStartupChecks` call); `package.json:10` (`"pdlcPluginCompat": "^0.22.0"`) | **Correct**, and the round-1 SE correction it encodes is right |
| F-1 step 6 / BR-1.7: the diagnostic is `pdlc doctor`, shipped at `bin/pdlc.mjs:489` | `bin/pdlc.mjs:487-491` — `case "doctor": … cmdDoctor(rest)` | **Correct**; naming the command closes the "fixed by the TSPEC" hole without over-specifying |
| F-5 preamble: `.github/workflows/` holds exactly one file, so the publish pipeline is wholly new | `ls .github/workflows/` → `pr-tests.yml` only | **Correct** |
| F-5 step 7 / E-28 / Q-8: three manifest blockers at HEAD | `pdlc/engine/package.json:4,2,11` | **Correct**, all three, at the cited lines |
| §5.2: twelve named `lib/*.mjs` members | `ls pdlc/engine/lib/` | **Correct**, exact set equality with the table |
| §5.2 / AT-3.8b: workflow modules reached outside the package root | `pdlc/engine/lib/run.mjs:51-55` | **Correct** |
| §5.2 note: `runtime-adapter.js` deliberately not ported | `pdlc/engine/lib/adapter.mjs:8-13` | **Correct** |
| BR-7.1: five job-level names; step-level names at `:46,53,66,70,92` | `.github/workflows/pr-tests.yml:27,28,77,78,111,112,137,138,195,196` | **Correct** — job keys `unit-tests, engine-tests, artifact-freshness, fresh-clone-bootstrap, script-syntax`, names byte-identical to §5.1's authored column |
| F-7 step 2 / AT-6.1: plain sync exits non-zero on `local-edit`/`unverified`, `sync-workflows.sh:703-722` | `pdlc/hooks/scripts/sync-workflows.sh:713-722` — `exit 3` unknown, `exit 2` local-edit/unverified, `exit 1` stale/missing | **Correct** ("exits non-zero" is accurate; the code is finer-grained than the claim, which is the safe direction) |
| AT-6.1: CI establishes the fresh-clone precondition at `pr-tests.yml:138,152` | `.github/workflows/pr-tests.yml:137-158` — job `Fresh-clone bootstrap works`, step `No consumer copy exists yet` asserting `.claude/workflows` absent | **Correct**, and the precondition is genuinely *asserted* by that job, not merely assumed |
| AT-2.2: `claude plugin install` occurrences outside the engine set | `README.md:115`, `pdlc/README.md:139,145` | **Correct** — three occurrences, one of them the local-marketplace variant |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
