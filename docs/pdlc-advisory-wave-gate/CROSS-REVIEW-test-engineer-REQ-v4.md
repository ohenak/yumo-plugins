# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md`
**Date:** 2026-08-18
**Iteration:** 4
**Scope:** REQ (phase R), testing lens only. Delta re-review against `CROSS-REVIEW-test-engineer-REQ-v3.md`, over `git diff afa55439..HEAD` on the REQ (78 insertions, 67 deletions). Unchanged sections are not re-litigated.

## Delta Verification against v3

Verified at HEAD `6565080a` on `feat-pdlc-advisory-wave-gate`. Every shipped-behaviour claim the revision touched was re-measured in code rather than read from the changelog.

| v3 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | The "BL-03's case has no equivalent today" claim is gone. AC-1.5 now names both shipped notices as the carriers and says the inapplicability is *added to* them, never emitted beside them (`REQ:258-263`). Re-measured: BL-03's carrier is `orchestrate-dev.js:14043-14045`, emitted once at the top of the no-manifest branch; BL-04's is `:14150-14153`, emitted once before the wave loop. The two branches are mutually exclusive (`if (!waveMode) { … } else { … }`, `:14041`/`:14119`), so the surface carries exactly one carrier in every reachable run — the cardinality the AC asserts now holds mechanically instead of by author intent. Residual, non-blocking: F-02 below. |
| F-02 | Medium | **Resolved** | AC-4.4's oracle is now sequence equality, stated as such and with set-equality explicitly rejected by name and by reason ("it collapses the duplicates and admits a resolution declared on one invocation", `REQ:387-390`). The expected values are literal transcriptions — `[post-wave, test, post-wave, test]`, `[post-wave, test, post-wave]`, `[test, test]` — not derived from anything under test. The false green v2 F-01 closed cannot re-enter through this door. |
| F-03 | Medium | **Resolved** | AC-4.4 now says a green re-gate carries the wave **past the gate**, and that a later post-gate halt is neither a red re-gate nor a restore trigger, with AC-5.1's trigger set restated as exactly three members (`REQ:378-381`). That matches the shipped order: gate at `:14361-14368`, un-skip guard at `:14377-14393`, commits only at `:14396`. One consequence landed in AC-4.4 but not in AC-5.3 — F-01 below. |
| F-04 | Medium | **Resolved** | BL-06's obligation is now universally quantified over the drifted recipes rather than enumerating three rows: "every positional line-range recipe in §1–§2, the M-WG-1…M-WG-8 rows and §1's V-wave trailer sentence alike, is drifted until re-run" (`REQ:551-553`), and the row itself carries both enumerations plus the BL-03 notice measurement (`REQ:543`). The under-inclusive enumeration I flagged is no longer expressible as complete-when-it-is-not. Residual on cached grep *results* rather than recipes: F-04 below. |

Also re-measured on the revision's own material, since each is a shipped-behaviour claim the round newly asserts:

- AC-4.2's new conditional — "where a post-wave command ran and post-wave pathspecs are configured" and "otherwise those artifacts are uncommitted too" — reads true at `orchestrate-dev.js:14416`: the build-output commit is guarded by `postWaveRan && implConfig.postWavePathspecs.length > 0`, so an empty pathspec list leaves the artifacts uncommitted exactly as the AC now says.
- AC-4.4's "a post-wave command failing on the re-gate … the immediate halt it would be on the first pass" reads true at `:14347-14357`: a first-pass post-wave failure throws `haltError` before the test command is ever reached, which is also why a truncated *first* pass implies a run with no attempts and therefore no A6.
- AC-4.4's pass arithmetic is consistent with the budgets it cites: `advisory.attemptBudget` `3` per wave and `advisory.waveBudgetPerRun` `1` (`REQ:204`, `:207`), so "passes = 1 + attempts" ranges over a bounded, enumerable set rather than an open one.

## Findings

All four v3 findings are resolved and no new High is open. The findings below are new, confined to sections this round changed, and none of them gates.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | AC-5.3's consequent is unconditioned and is now falsified by a case AC-4.4 admits. AC-4.4 says a green re-gate carries the wave past the gate and that a later post-gate check "may still halt the wave" (`REQ:378-380`); AC-5.3 says that given A6 resolves the wave, the run "continues along the wave's normal post-gate path, its commit step and on to the next wave" (`REQ:414-416`). The un-skip guard is exactly such a later check, and it halts between gate and commits (`orchestrate-dev.js:14377-14393`, comment: "a vacuous green halts the wave with its work uncommitted, exactly as a red gate does"). So a run can satisfy AC-5.3's Given — A6 resolved the wave — and reach neither the commit step nor the next wave. A test writer takes one of two roads and both are bad: write AC-5.3's test only on the happy path, and the AC's universal reads as proven when it was never exercised; write it over post-gate outcomes, and it reds against behaviour AC-4.4 sanctions. Condition AC-5.3 on the absence of a post-gate halt (AC-4.4), and say in one clause what the report shows for a resolved-then-halted wave — that observable is what a PROPERTIES author will need, and Q-02 of v3 asked for it. | AC-5.3, AC-4.4 |
| F-02 | Low | Local | AC-1.5's both-absent case has exactly one carrier available, and it is the one that today cannot see the missing half. The AC requires the single notice to name **every** absent prerequisite, "both, in a run lacking manifest and script-owned gate alike" (`REQ:255-257`), and names the two shipped notices as carriers. But the notices sit on opposite sides of one branch: the no-manifest notice at `orchestrate-dev.js:14043` is in the `!waveMode` arm, and the gate-degradation notice at `:14150` — along with the config read that computes `scriptGate` at all (`:14123-14140`) — is inside the `else` arm entered only in wave mode (`:14119`). A run lacking both therefore emits the BL-03 notice alone, from a branch that never reads `implementation.testCommand` and never resolves the `_runCommand` transport. The count-of-one is right and is in fact *guaranteed* by that exclusivity; what is missing is one sentence saying the BL-03 carrier is the one that absorbs both names in that run. Without it, an implementer reading "added to them, never emitted beside them" may reasonably conclude the both-absent oracle is unsatisfiable, or satisfy it with a second notice and red the cardinality. | AC-1.5 |
| F-03 | Low | Local | "Each pass truncated at its first failing command" (`REQ:385`) does not say whether the failing command is inside or outside the truncation, and the two readings give different expected sequences for the same run. The enumerated examples do disambiguate — `[post-wave, test, post-wave]` for a re-gate whose post-wave command failed keeps the failing invocation — but the examples are illustrations and the rule is the contract; a PROPERTIES author generalising the rule to a case the examples do not cover can transcribe the wrong expected sequence and never learn it from a green suite. Say "truncated after its first failing command, that invocation included". | AC-4.4 |
| F-04 | Low | Cross-Feature | BL-06's widened obligation covers drifted *recipes* but leaves the cached grep *results* beside them ambiguous, and those results are what a hurried reader actually follows. M-WG-8's recipe is symbol-anchored and still resolves, but its recorded result `:1669` is stale — `ADVISORY_SEAMS` is at `orchestrate-dev.js:1947` and `ENVELOPE_DEFAULTS` at `:1938` — and the same shape appears in M-WG-1, M-WG-6 and M-WG-7. BL-06 reads as sweeping them ("the M-WG-1…M-WG-8 rows … is drifted until re-run", `REQ:551-553`), which is the correct outcome, but a reader who parses the row as scoped to "positional line-range recipes" (`REQ:543`) will judge M-WG-8 not drifted and leave `:1669` standing. One phrase — recorded line results as well as recipes — closes the reading. The baseline is a shared project-level reference, so the cost of the wrong reading is paid by whichever feature cites it next. | BL-06, §9 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Under F-01: for a wave A6 resolved whose run then halts on the un-skip guard, does the run report show the wave as resolved *and* the run as halted, or does the halt suppress the resolution row? AC-6.1's advisory record and AC-5.2's unchanged halt both fire; only the report's own shape is unstated, and it is the observable a PROPERTIES test would assert on. |

## Positive Observations

- AC-4.4's oracle is now the strongest one in the document. It states the unit (sequence, not set), says why the weaker unit is wrong and which specific false green it admits, gives three literal expected sequences rather than a construction rule, and names the truncation case as an *admitted form* rather than leaving a red-looking sequence to be argued about later. That is a criterion an author can transcribe into a test without asking anything.
- The F-01 repair was made by measurement, not by wording. Rather than narrowing the scan to A6-authored notices — the easy escape, and the one that would have quietly changed the oracle — the revision adopted the shipped notices as carriers, which is what makes the cardinality-of-one true by branch structure at `orchestrate-dev.js:14041`/`:14119` instead of true by convention.
- AC-4.2 now states both halves of the conditional, including the "otherwise" branch where no build-output writer is configured. Claims that read true only in this repo have been a recurring shape in this document; this round it was caught and generalised before FSPEC could inherit it.
- BL-06 moved from an enumeration of three rows to a universal over the section. Enumerations under-include silently and universals do not, and that change is the difference between a baseline obligation that can be declared complete while stale and one that cannot.

## Recommendation

**Approved with minor changes**

All four v3 findings — the High on AC-1.5's shipped-behaviour claim and the three Mediums on the re-gate oracle, the post-gate halt and BL-06's scope — are resolved, each verified against code at HEAD rather than against the changelog. No High finding is open, so the REQ is testable enough to carry into FSPEC.

F-01 is the one worth folding into the next revision that touches this document: AC-5.3's universal is falsified by a post-gate halt AC-4.4 explicitly permits, and the fix is one conditioning clause plus one sentence naming the report observable. F-02, F-03 and F-04 are single-phrase clarifications that make three oracles transcribable without inference; none changes a decision, and none needs its own round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}

APPROVAL-HASH: sha256:32ba7d949d59041db6d67de80c06c10d270c3e545c11473debe5694cfe851f6c
APPROVAL-HASH-NORMALIZED: sha256:ed6d6c06cbe90159b979f728994337a18553c22a1fb2b7c401082f5d5ca4f713
REVIEWED-COMMIT: 6565080a9efbd4a524d6d5bf1296b0b6ed6712c5
