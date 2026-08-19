# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.2)
**Date:** 2026-08-18
**Iteration:** 3
**Scope:** testing lens only — testability, edge-case coverage, oracle falsifiability, acceptance-test implementability. Delta re-review: resolution of the v2 findings, plus new issues in changed text only. Unchanged sections are not re-litigated.

## Delta scope

Reviewed `dcc935e1..HEAD` on the FSPEC (19 insertions, 17 deletions, three commits). Changed: header version and v1.2 revision note; §3.2 step 3 budget sentence; §4 BR-11 (seam-budget window restated as per-dispatch); §5.4 E-25, E-33 (moved after E-28, non-negative-integer validator); §5.5 E-30 (carrier named); §6.2 AT-02-7; §6.4 AT-04-3; §6.6 AT-06-6; §6.7 AT-07-1, AT-07-2b. Nothing else moved.

## Status of v2 findings

| ID | Sev | Status | Evidence |
|----|-----|--------|----------|
| F-01 | Medium | **Resolved, with a new defect inside the fix** | AT-07-1's partition over BR-1…BR-16 is now total and arithmetically complete: six proposable (BR-2, BR-3, BR-5, BR-6, BR-7, BR-8) plus ten not-proposable (BR-1, BR-4, BR-9…BR-16) = sixteen, no rule left silently unlisted. The closure defect I filed is gone. The *Then* clause that now ranges over the widened list is where F-01 below lands. |
| F-02 | Medium | **Resolved** | E-30 names the halt report as the carrier and ties it to BR-14's existing diagnosis/root-cause payload; AT-06-6 inherits it verbatim ("surfaced in the halt report, the carrier E-30 names"). A test author now has one place to read. |
| F-03 | Low | **Resolved** | AT-04-3's unanchored "no commit attributable to A6" conjunct is dropped; the oracle is now writer-identity set-equality plus the green-gate precondition, and the deliberate non-assertion on pathspec scope is still stated. |
| F-04 | Low | **Resolved** | E-33 now sits after E-28, in numeric order at the end of §5.4. |

### Grounding checks run this round

Claims the changed text makes about HEAD, verified in code rather than in documents:

- BR-11's "as the shipped tier already measures" is **accurate**. `budgetExceeded` (`pdlc/workflows/orchestrate-dev.js:2288-2289`) is called with `elapsedMs: 0` at every attempt-loop site (`:3433`, `:3464`, `:3560`); wall-clock exhaustion is enforced by the per-attempt deadline race, documented at `:3383-3385`, which is constructed per attempt and raced against the dispatch promise only. The window really is per-dispatch, and the gate command really does run outside it — BR-11's "structural, not a subtraction A6 performs" is a correct reading of HEAD, and AT-02-7 is implementable through the same `neverResolves` double the shipped suite already uses (`:3381`).
- E-33's "a distinct variant from the shipped positive-integer validator, which rejects `0` and substitutes the default" is **accurate**. `positiveInt`/`positiveNumber` require `v > 0` and otherwise push to `invalidKeys` and return the default (`pdlc/workflows/orchestrate-dev.js:1999-2005`, `:2020`); `attemptBudget` is bound to `positiveInt` at `:2020`. An operator's `0` would indeed become `1` under reuse, so AT-07-2b's companion is a genuine falsifier of the wrong-validator implementation, not a restatement.
- AT-07-1's BR-2 arm was checked against BR-2's own text and against `ADVISORY_REFUSAL_REASONS` (`pdlc/workflows/orchestrate-dev.js:2297-2306`); that check is F-01 below.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AT-07-1's single *Then* clause is false for the BR-2 arm it just gained, so the test cannot be written as specified.** The widened partition adds BR-2 ("a class outside the vocabulary") to the proposable list, but the *Then* is unchanged and blanket: "the proposal is refused by the workflow script, the shipped refusal reason is reported, and the working tree is unchanged." BR-2 specifies the opposite for exactly that input: an out-of-set classification "reads as `unclassified` rather than being rejected", authorises nothing, and escalates **without consuming an attempt**. AT-02-8 pins the same path and asserts the outcome carries **no** refusal reason. REQ AC-2.2 agrees, and its precedence rule (`REQ:288-289`) reserves the malformed-verdict reading for verdicts that are *also* malformed under AC-2.1 — a merely out-of-vocabulary class is not one. So an engineer implementing AT-07-1 over its enumerated list will assert a reported refusal reason on the BR-2 stub proposal, and that assertion is specified to fail; there is no member of `ADVISORY_REFUSAL_REASONS` (`orchestrate-dev.js:2297-2306`) it could name. Two ATs currently demand opposite outcomes on one input, which is not resolvable by the test author. Fix by giving the BR-2 arm its own stated outcome (escalated, `unclassified`, no refusal reason, no attempt consumed, tree unchanged) or by moving BR-2 to the not-proposable half with the reason stated — either keeps the partition total. | §6.7 AT-07-1, §4 BR-2, §6.2 AT-02-8 |
| F-02 | Medium | Local | **AT-02-7's companion case is now an absence-only arm.** The primary case is positive and fine (escalates `budget-exhausted`). The companion — slow gate command, fast working time — asserts only that it "does **not** escalate", with no statement of what the run does instead. Under the rewritten window that arm is the one carrying the regression value (it falsifies an implementation that times the whole episode rather than the dispatch), so it deserves a positive conjunct: name the terminal disposition the fixture reaches, e.g. `resolved` on a green re-gate, or `escalated` with the *attempt*-budget reason if the fixture stays red — the distinction matters because E-24 and E-25 share the `budget-exhausted` literal, so "did not escalate on time" is not observable from the reason string alone. As written, an implementation that escalated for an unrelated cause could satisfy the arm. | §6.2 AT-02-7, §5.4 E-25 |
| F-03 | Low | Local | **AT-07-1's BR-3 arm needs its fixture budget pinned to be terminal.** A diagnosis citing no gate output is malformed under BR-3, and a malformed verdict *consumes an attempt and re-enters the loop* rather than terminating; the shipped `malformed-verdict` reason is only reported at termination (`refusalReasonFor`'s signals are built once, at termination — `orchestrate-dev.js:2307-2310`). With the default `attemptBudget` of `3` the stub double would be dispatched three times and the terminal reason would be `budget-exhausted`, not `malformed-verdict`. One clause — the BR-3 arm runs with `advisory.attemptBudget` at `1` — makes the reported-reason assertion deterministic. | §6.7 AT-07-1, §4 BR-3 |
| F-04 | Low | Local | **AT-02-7 still describes the window with the subtraction phrasing BR-11 removed.** Its *Given* reads "an invocation whose working time excluding gate-command run time exceeds `advisory.seamBudgetMinutes`", while the sentence two lines later says the window is one dispatch and the gate sits outside every measured window. Both readings are now in one AT. The second is the one BR-11 and HEAD support; drop "excluding gate-command run time" from the *Given* so the fixture description matches the oracle. | §6.2 AT-02-7 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | REQ NFR-4 (`REQ:453-456`) still carries the subtraction rationale — "less the time spent running the gate command — without that carve-out a slow suite ends every invocation inside attempt 1" — which the FSPEC's v1.2 note says was raised as an erratum rather than folded in. I have not re-raised it, since it is already routed. Confirmation wanted that the routed item covers the *rationale* clause and not only the window definition: the FSPEC's reading (structural exclusion, nothing subtracted) and REQ's (an explicit subtraction) still differ in what a PROPERTIES author would write for NFR-4. |
| Q-02 | AT-07-1's not-proposable half rests on "each decided by the script before or after any proposal is read". BR-7 is on the *proposable* side because a verdict asserting the wave is fixed is itself a proposal — is BR-10 (the reversibility claim in the record and halt report) on the not-proposable side for the same test, i.e. is A6 never able to author the reversibility sentence itself? The partition says so; if a verdict field feeds that sentence, the arm belongs on the other side. |

## Positive Observations

- **The partition fix went the whole way rather than the safe way.** F-01 asked for a total partition over BR-1…BR-16; the revision produced one that names each proposable rule with the violating proposal a stub would return ("a class outside the vocabulary", "a diagnosis citing no gate output", "a verdict asserting the wave is fixed"), and justifies the not-proposable half by mechanism rather than by assertion. BR-16's claim is now discharged, not sampled — that was the point of the finding and it landed. The defect I file above is a consequence of widening the list, not of the widening being wrong.
- **BR-11's window restatement is the rarer kind of revision: it made the spec match the code rather than making the code's job harder.** The old wording asked for a cumulative-with-subtraction measurement that HEAD does not perform anywhere; the new wording describes the per-attempt race at `orchestrate-dev.js:3383` exactly, and correctly declines to fold the REQ's stale rationale in, routing it instead. Specs that quietly absorb an upstream error are the more common failure.
- **E-33 now names the wrong implementation before an engineer can write it.** "Reusing it would turn an operator's `0` into `1`" plus AT-07-2b's `0`-in/`0`-out companion, with the key absent from the invalid-key report, is precisely the assertion the shipped `positiveInt` fails — a falsifier chosen against the likeliest defect rather than against the abstract requirement. The pattern this document has been consistent about — naming the weaker oracle beside the right one — held through another revision.
- **E-30 and AT-06-6 now share one carrier, and the contrast with AT-06-2 survived the edit.** A failed record write refuses the action; a failed escalation-log write does not undo the escalation. Two adjacent failure modes with opposite dispositions are exactly where a test author guesses, and the document tells them.

## Recommendation

**Needs revision**

One High finding. F-01 is a contradiction between AT-07-1's widened enumeration and BR-2/AT-02-8: on the out-of-vocabulary-class input, one AT demands a reported refusal reason and the other demands its absence, and no member of the shipped refusal catalogue could satisfy the first. That is not a wording preference — it is an acceptance test an engineer cannot implement without choosing which of two specified outcomes to disbelieve. The fix is one clause, either an own *Then* for the BR-2 arm or a move to the not-proposable half with the reason stated; both keep the partition total, which is what the previous round bought.

Everything else this round is small and non-gating: F-02 asks for a positive conjunct on AT-02-7's companion arm, F-03 pins that AT-07-1's BR-3 fixture run at `attemptBudget: 1` so the reported reason is deterministic, F-04 removes a leftover phrase. All four v2 findings are resolved, and I verified the three load-bearing claims the delta makes about HEAD in `pdlc/workflows/orchestrate-dev.js` rather than trusting the document. Nothing outside the changed lines regressed.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 2}
