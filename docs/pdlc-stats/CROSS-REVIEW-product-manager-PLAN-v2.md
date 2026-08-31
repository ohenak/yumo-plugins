# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PLAN-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Delta re-review: prior findings plus changed sections only.

## Method

Diffed `b09180c00..HEAD` on the PLAN (51 insertions, 25 deletions across five commits: `852e369ee`, `7a0c6dbca`, `9cd7271e2`, `628cf2446`, `7a0c6dbca`). Verified every changed claim against the checkout at HEAD on `feat-pdlc-stats`, not against the upstream documents.

## Disposition of v1 findings

| ID | Severity | Status | Evidence at HEAD |
|----|----------|--------|------------------|
| F-01 | Medium / Cross-Feature | **Resolved** | The Overview's standing-cost premise now reads "Adding a module the shipped engine **loads at runtime**", names `lib/document-oracles.mjs` as the counterexample, and T-21's promoted constraint is explicitly "**scoped to modules the shipped engine loads at runtime**, never to `pdlc/workflows/lib/` membership as such", carrying `document-oracles.mjs` as its worked exclusion. Re-verified: `pdlc/workflows/lib/` holds `document-oracles.mjs`, `escalation-view.mjs`, `loop-session.mjs`; `document-oracles.mjs` appears in none of `prepack.mjs`'s `MODULE_NAMES`, either `WORKFLOW_MEMBERS` copy, `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES`, or `pdlc/workflows/package.json`'s `c8.include`. The over-broad wording can no longer reach `DOMAIN-CONSTRAINTS.md`. |
| F-02 | Medium / Local | **Resolved** | §Verification → "Claims verified against the tree" now states three `lib/` modules at HEAD by name and adds the enumeration-exclusion sentence. Matches the directory listing. |
| F-03 | Low / Local | **Resolved** | §Verification → "Acceptance-test coverage" now reads "owned by **at least one** task, and where ownership is split the split is named in the row", with AT-24 cited as the worked case. The 29-AT table still enumerates 29 distinct ATs (AT-01…AT-28 plus AT-14b); every one carries at least one task. |
| F-04 | Low / Local | **Resolved** | Now "20 `.js` modules at HEAD". `ls pdlc/workflows/__tests__/helpers/*.js | wc -l` → 20. |

## Findings

No findings.

## Questions

| ID | Question |
|----|---------|
| Q-01 | T-23's ninth site paraphrases `assertAdditiveOnly`'s message as "delta over baseline must be exactly two members"; the shipped string is "delta over baseline must be exactly the two new members". The paraphrase is still greppable and the instruction (the message goes stale once `NEW_LIB_MEMBERS_VENDORED` drops to one member) is correct, so I am not filing it — flagging only so the implementer copies from source rather than from the PLAN. |
| Q-02 | v1's Q-01 (precedent for amending an archived feature's frozen specs) and Q-02 (REQ-STATS-07's unqualified "fails" versus FSPEC EC-10/BR-26's `unclassified` runtime reporting) remain open from round 1. Neither gates this document — both are questions for harvest and for the erratum channel respectively — but they should not be lost when the PLAN converges. |

## Positive Observations

- **The F-01 fix is better than what I asked for.** I asked for the promoted constraint to be scoped; the revision scoped the *premise* as well, in both the Overview and the Verification section, and stated the worked exclusion in all three places. A future reviewer applying the constraint literally now gets the right answer without reading this cross-review. That is the difference between fixing a sentence and fixing the reason the sentence was wrong.
- **Every new claim in the diff is a measurement, and every one checks out.** `resolveWorkflowRoot` is `export function resolveWorkflowRoot` at `pdlc/engine/lib/run.mjs:90`, and `bin/cli.mjs:48` imports it without re-exporting — so T-01's corrected pre-flight target is right and the old one would indeed have redded the gate spuriously. The second P9-02 test exists with the title T-24 quotes and a driver that `import()`s `loop-session.mjs` and `escalation-view.mjs` by name (`coverageInstrumentation.test.js:278`, `:283-284`). `postFixMembers` concatenates a filtered `WORKFLOW_MEMBERS` with `NEW_LIB_MEMBERS_VENDORED` at `loop-distribution.test.js:228-231`, so T-23's double-count analysis is real. `pdlc/engine/` carries no `docs/` directory, so T-09's `--cwd` requirement under the `Engine tests` job (`working-directory: pdlc/engine`, `pr-tests.yml:127`) is a genuine constraint, not a precaution.
- **The AT-15 split is a fidelity gain, not a narrowing.** T-04 gives up the symbolic-link leg with a stated reason (a fake returns the fixture's declared size and cannot distinguish `lstatSync` from `statSync`), T-18 picks it up over a real filesystem, and T-10 adds the structural conjunct naming the call. EC-19's user-visible promise — byte totals count the link, not its target — is now covered by a test that can actually fail. Acceptance-criterion coverage went up, and the coverage table records the split rather than hiding it.
- **The manifest split is correct under its own rule.** Five `lib/stats.mjs` rows read as a violation of single ownership until you re-read the preamble — "One file, one owning task **per batch**" — and see the rows are batches 3 through 7, one owner each. The invariant DoD audits is intact.
- **T-26 closing its own ownership gap.** Declaring "T-26 authors no test file" and routing mutant remediation back into the owning task's file keeps the manifest honest at batch 11, where T-26 and T-27 touch disjoint files.

## Recommendation

**Approved**

All four v1 findings are resolved, each verified against the tree rather than against the revision note. The changed sections introduce no new product finding: no acceptance criterion is narrowed, reinterpreted or dropped, nothing outside REQ scope appears, and the one ownership change (AT-15) strengthens coverage. The PLAN is ready to proceed to PROPERTIES.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
