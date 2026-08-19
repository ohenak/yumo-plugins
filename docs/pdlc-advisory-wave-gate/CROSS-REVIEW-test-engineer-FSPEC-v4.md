# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.3)
**Date:** 2026-08-19
**Iteration:** 4
**Scope:** testing lens only — testability, edge-case coverage, oracle falsifiability, acceptance-test implementability. Delta re-review: my own v3 findings, plus new issues in changed lines only. Unchanged sections not re-litigated.

## Delta scope

Reviewed `e9c50bfa..HEAD` on the FSPEC (15 insertions, 10 deletions, one commit `7b8b314c`). Touched: the v1.1/v1.2 revision notes (compressed) and the new v1.3 note; §5.5 E-30 (carrier named); §6.2 AT-02-7 (restated *Given* + positive companion disposition); §6.6 AT-06-6 (carrier named); §6.7 AT-07-1 (BR-2 arm, BR-3 arm). Nothing else moved.

## Status of v3 findings

| ID | Sev | Status | Evidence |
|----|-----|--------|----------|
| F-01 | High | **Resolved** | AT-07-1's *Then* now carries an explicit BR-2 exception: an out-of-set class "reads `unclassified`, authorises nothing, and the wave escalates with **no** refusal reason and **no** attempt consumed, the tree still unchanged", cross-referenced to AT-02-8. That is BR-2's own text (§4 BR-2: "an absent or out-of-set classification reads `unclassified` and is rejected … escalates **without consuming an attempt**") and it agrees with AT-02-8's "carries **no** refusal reason". The contradiction — one AT demanding a shipped refusal reason for an input the shipped catalogue (`pdlc/workflows/orchestrate-dev.js:2297-2306`) has no member for — is gone, and the partition stays total. |
| F-02 | Medium | **Resolved** | AT-02-7's companion now names a positive terminal disposition — "terminates `resolved` on a green re-gate" — and states why the reason string alone is insufficient (E-24 shares the `budget-exhausted` literal). `resolved` is a real disposition of the shipped seam driver (`orchestrate-dev.js:3574`), so the arm is implementable as written and falsifies an implementation that escalates for an unrelated cause. |
| F-03 | Low | **Resolved** | AT-07-1's BR-3 arm pins `advisory.attemptBudget` to `1`. Verified against HEAD: the malformed-verdict branch reports `refuse({ "malformed-verdict": attempts === 1, "budget-exhausted": true })` (`orchestrate-dev.js:3474`), and `malformed-verdict` precedes `budget-exhausted` in the frozen catalogue (`:2297-2306`), so a one-attempt fixture does report the malformed-verdict reason and a three-attempt one would not. The pin is load-bearing exactly as the finding described. |
| F-04 | Low | **Resolved** | AT-02-7's *Given* is now "one A6 dispatch whose dispatch→verdict elapsed time exceeds `advisory.seamBudgetMinutes`" — the second, unsupported "excluding gate-command run time" clause is gone, and the exclusion is stated once, structurally, in the *Then* ("the companion's slow gate command sits between dispatches, outside every measured window"). That matches HEAD: the deadline races only the dispatch promise (`orchestrate-dev.js:3416-3418`), it is reconstructed fresh per attempt (`:3372-3385`), `elapsedMs` is `0` at every attempt-loop call site (`:3433`, `:3464`, `:3560`), and the gate command runs in the VERIFY step after the race, never inside it. |

Also checked, since v1.3 claims it: E-30 and AT-06-6 now name "the run report's notice channel" as the failed-escalation-log-write carrier. That is the inherited behaviour at HEAD — the `appendEscalationEntry` throw is caught by the caller and pushed onto `notice(...)` (`orchestrate-dev.js:3358-3364`), with the disposition never upgraded, exactly as the JSDoc at `:3081-3085` records. The carrier claim is grounded, not asserted.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AT-06-6's log-failure conjunct is satisfied by a notice the escalation path emits unconditionally.** The oracle reads "the failure to log is surfaced on the carrier E-30 names — the run report's notice channel". At HEAD the escalation path always appends a notice on that same channel — `notice(ADVISORY_ESCALATIONS.seam({...}))` at `orchestrate-dev.js:3365`, outside the try/catch — so a test written to this wording ("a notice is present") passes an implementation that swallows the write failure entirely. The distinguishing content exists and is cheap to pin: the failure notice is a second, distinct entry naming the failure and the seam (`ADVISORY escalation log write failed for seam …`, `:3359-3363`). Suggested restatement: the notice channel carries **two** entries, one of which identifies the escalation-log write failure and names the seam — a counting-or-identifying conjunct in the same shape §5's E-04/AT-01-5 counting oracle already uses in this spec. | §6.6 AT-06-6, §5.5 E-30 |
| F-02 | Low | Local | **AT-07-1's BR-2 arm asserts "no attempt consumed" without naming where an attempt count is observed.** The other quantitative arm in this spec does name its surface — AT-02-9 counts *dispatches* through the agent double. "No attempt consumed" is not derivable from dispatch count alone here, because the BR-2 fixture terminates after one dispatch either way; it is observable only from the disposition's own attempt field, which the shipped driver already returns (`orchestrate-dev.js:3221`, `:3306`) and already documents a zero reading for ("no attempt consumed", `:3196`). One clause — "the disposition's reported attempt count is zero" — makes the arm mechanically decidable rather than leaving the engineer to choose a surface. | §6.7 AT-07-1, §4 BR-2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ NFR-4 (`REQ:453-455`) and the config table (`REQ:205`) still carry the subtraction reading — "**less** the time spent running the gate command", "excluding gate-command run time". FSPEC v1.3 says the erratum was re-emitted; I have re-emitted it below rather than assume it landed. Nothing in the FSPEC depends on it now — BR-11 and E-25 both state the structural reading — so this is upstream hygiene, not an FSPEC defect. |

## Positive Observations

- **F-01's fix took the harder of the two offered routes, and it was the right one.** I offered either an own-*Then* for the BR-2 arm or demotion to the not-proposable half. The revision kept BR-2 proposable and gave it its own outcome, which preserves the thing the round-2 partition bought — BR-16's "every §4 boundary is script-enforced" stays discharged over all sixteen rules rather than fifteen — while making the arm agree with BR-2 and AT-02-8. One input, one specified outcome, three places saying the same thing.
- **AT-02-7 now states the exclusion once, where it is true.** The clause moved out of the *Given* (where it described a measurement no code performs) into the *Then*'s explanation of the companion fixture (where it describes the code's actual shape: the gate command sits between dispatches). The spec stopped asserting a subtraction and started asserting a structure, and the structure is what a test can falsify.
- **The BR-3 attempt-budget pin is the kind of detail that stops a false green before it is written.** Without it, the default three-attempt budget makes the same fixture report `budget-exhausted`, and an engineer would have "fixed" the implementation to match. The spec now names the fixture parameter that makes the intended reason the reported one, and HEAD's `attempts === 1` guard (`:3474`) confirms the reading.
- **Round-over-round, the revision notes are getting shorter without losing their referents.** v1.1 and v1.2 were compressed to one line each while keeping the finding ids; v1.3 names each fix against the reviewer and severity that raised it. That is the record a harvest can read mechanically.

## Recommendation

**Approved with minor changes**

No High findings. All four v3 findings are resolved, each verified against HEAD rather than against the revision note: the BR-2 contradiction is gone and the partition stays total, AT-02-7's companion carries a positive disposition that the shipped driver can actually reach, the BR-3 pin is load-bearing under the shipped catalogue order, and the gate-command exclusion is now stated as the structural fact the code exhibits. Nothing outside the changed lines regressed.

Two non-gating items remain, both in changed lines: F-01 (AT-06-6's log-failure conjunct is satisfiable by the unconditional escalation notice — one counting-or-identifying clause fixes it) and F-02 (AT-07-1's BR-2 arm should name the surface on which "no attempt consumed" is observed). Both are one-clause edits and neither blocks the phase; they are worth folding in before PROPERTIES, since a properties author writing AT-06-6 as it stands would ship a passing test that cannot fail.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
