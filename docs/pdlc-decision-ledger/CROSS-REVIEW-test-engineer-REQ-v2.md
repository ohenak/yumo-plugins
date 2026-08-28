# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.1, `34beffcbc`)
**Date:** 2026-08-28
**Iteration:** 2
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-REQ-v1.md`. Diff base `990c09aba`
(the commit carrying v1 of this review) → `HEAD`. Changed sections only: §1, §2 G-1..G-4,
§3 NG-4/NG-6/NG-7, §4 C-1..C-5, §5 REQ-DECLEDGER-01..08, §6 R-1..R-5, §7 O-1..O-4 + A-3, §8.

## Round-1 finding disposition

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | G-1 now requires exactly two fields plus a source citation; the "phase/round it closed in" field — present in no shipped record shape — is gone, and absent origin/evidence data is explicitly "not a defect". No implementation-echo left in the field list. |
| F-02 | High | **Resolved** | REQ-DECLEDGER-03's Who is now the reviewer, not the driver; the observable moved to prompt text ("no parser compares citations"). REQ-DECLEDGER-08 pins the driver side as unchanged, so no invented driver observable remains. |
| F-03 | High | **Resolved** | Evidence novelty is declared a reviewer judgement, deliberately not a machine predicate, and the rule text carries one in-example and one out-example. A tester now asserts exemplar presence in the prompt rather than a pass/fail boundary that could not be written. |
| F-04 | High | **Partially resolved — see F-12** | Per-document "relevance" is gone, replaced by a stated in-scope set, and AC-01 now names set equality explicitly. But the set is not derivable against HEAD's corpus (F-12). |
| F-05 | High | **Resolved** | REQ-DECLEDGER-08 pins the erratum-minting and the fail-closed confirmation read as identical flag-on/flag-off, making NG-4 falsifiable by a two-run replay over one fixed reviewer output. |
| F-06 | Medium | **Resolved** | G-4 is now labelled non-binding with no acceptance criterion, and its measurement source moved to committed `CROSS-REVIEW-*` artifacts, which exist every round regardless of any flag. §8 records the deliberate absence. |
| F-07 | Medium | **Partially resolved — see F-13** | The driver-side/reviewer-side key conflict is reconciled against `DEC-LOOPECON-06`, but the AC's observable is now named twice, inconsistently. |
| F-08 | Medium | **Resolved** | REQ-DECLEDGER-04 now states both paths — every source unavailable → full fallback; one record of several → that line omitted, rest render — with the safe direction argued. |
| F-09 | Medium | **Resolved** | `maxBytes` is pinned to the rendered index block alone, and REQ-DECLEDGER-07 enumerates the three boundary cases (zero in scope, `maxEntries` `0`, single oversized line omitted whole, never truncated mid-line). |
| F-10 | Low | **Resolved (routed)** | C-2 now routes the baseline commit identity and its pinning to O-4 as TSPEC material, which is the right altitude. |
| F-11 | Low | **Resolved** | C-3 declares the block holds exactly three keys and calls the enumeration exhaustive; REQ-DECLEDGER-05 restates the check as set equality over that enumeration crossed with {wrong type, malformed, absent}. |

Every cross-feature citation added or re-pointed this round resolves and says what the REQ claims:
`DEC-ERR-01` (`docs/_decisions/DECISIONS-review-severity-bars.md:88`, summarised at
`pdlc/OPERATIONS.md:29`) — the v1 mis-citation to `DECISIONS-erratum-routing.md` is corrected;
`DEC-LOOPECON-06`'s identity triple (`docs/completed/pdlc-loop-economics/DECISIONS-pdlc-loop-economics.md:163-173`);
`REQ-LOOPECON-01b`'s recompute-at-dispatch contract
(`docs/completed/pdlc-loop-economics/REQ-pdlc-loop-economics.md:146-155`);
and NG-6's newly named engine precedents both exist
(`pdlc/engine/__tests__/learnings-config-example.test.js`, `loop-config-example.test.js`),
as does `pdlc/workflows/__tests__/learningsBaselineGuard.test.js`.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-12 | High | Local | **The new in-scope set is not derivable against HEAD's corpus, so AC-01's set-equality oracle cannot be written — and one required field is unrenderable for a real source.** G-1 defines in scope as "every record under `docs/_decisions/` plus the feature's own `DECISIONS-{feature}.md`", and REQ-DECLEDGER-01 leans on that to claim the expected index is "checkable as **set equality, not containment**". But "record" has no stated predicate, and HEAD's directory holds at least three different shapes. (a) Eleven files carry `## DEC-…:` headings, 41 in total. (b) Four `*.md` files carry **zero** such headings — `CONSOLIDATION-PROPOSAL-2026-07-29.md`, `-2026-08-19-1.md`, `-2026-08-27-1.md` (whose only `##` heading is `## Not proposed / deferred`, `:24`) and `DECISIONS-advisory-wave-gate-questions.md`, plus the untracked-from-the-glob `.consolidation-log.md`. (c) `DECISIONS-advisory-wave-gate-questions.md` self-declares "**Project-level decision record.**" (`:5`) and carries `DEC-AWG-Q1…Q5` (`:14`), yet records them as `- **Q-1** —` bullets with **no `##` heading at all** — so REQ-DECLEDGER-01's required "source citation naming record file **and heading**" has no value to render for a decision the REQ's own scope rule includes. Is the unit a file or a heading? Is a `CONSOLIDATION-PROPOSAL` a record? Is `DEC-AWG-Q3` in scope, and if so what is its heading? Two testers derive two different expected sets, and the only way to make the test green is to read the implementation's own scan — the implementation-echo the pipeline forbids, dressed as set equality. Fix at REQ altitude: state the record predicate as a black-box rule (e.g. "a record is a `## DEC-` heading; files with none contribute nothing"), and say which side of it the four heading-less files fall on. | §2 G-1; §5 REQ-DECLEDGER-01 |
| F-13 | Medium | Local | **REQ-DECLEDGER-06 names two different observables in one Then, one of which no deterministic test can assert.** The Then's main clause is about prompt text ("the rule text directs the reviewer to treat the decision id as the reopening key"), which is testable exactly as REQ-DECLEDGER-03's is. Its trailing clause then says "the observable is that artifact's text" — the reviewer's own cross-review prose, an LLM output. A tester cannot tell which to assert, and the second reading is not runnable: no fixture makes an agent phrase a repeat one way rather than another, so the test would either be skipped or written as a containment check over generated prose. Pick the prompt-text observable (consistent with REQ-DECLEDGER-03 and with G-2's "the rule reaches the reviewer as prompt text"), and demote the artifact-text sentence to rationale. The `DEC-LOOPECON-06` reconciliation in the same AC is correct and should stay. | §5 REQ-DECLEDGER-06 |
| F-14 | Medium | Local | **The `maxEntries` default of 40 is already exceeded by HEAD's own corpus, and AC-01 and AC-07 then disagree about what the expected index is.** HEAD carries **41** `## DEC-` headings under `docs/_decisions/` before any feature's own `DECISIONS-{feature}.md` is added, against C-5's `maxEntries` default of `40`. So on this repo, at default config, the very first enabled dispatch drops at least one line. AC-01 says the index has "one line per decision in G-1's in-scope set … set equality"; AC-07 says lines are omitted when the set exceeds the bound. Read together at HEAD defaults they cannot both hold, and a tester writing AC-01's set-equality check against a realistic fixture gets a red that AC-07 says is correct behaviour. State that AC-01's set equality is over the **rendered** set — the in-scope set after budgeting — or say AC-01's Given is a within-budget in-scope set. Separately, this is the measurement A-1 says was never taken: 41 > 40 is a concrete datum an operator can now use when exercising the veto. | §4 C-5; §5 REQ-DECLEDGER-01, REQ-DECLEDGER-07; §7 A-1 |
| F-15 | Low | Local | **G-2's "requires G-1 enabled" has no key behind it and no criterion pins it.** G-2 is titled "requires G-1", but C-3 closes the config block at exactly three keys, so there is no separate G-1/G-2 switch: one `enabled` renders both index and rule text (AC-01 and AC-03 share the same Given). Harmless as written, but the phrase invites a TSPEC reader to invent a fourth key that C-3 forbids. Either drop "requires G-1 enabled" or restate it as "index and rule text are rendered together, under the single `enabled` key — neither is renderable without the other", which is also a cheap positive assertion to test. | §2 G-2; §4 C-3 |
