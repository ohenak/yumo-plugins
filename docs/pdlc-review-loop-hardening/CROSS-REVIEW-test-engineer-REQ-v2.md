# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-review-loop-hardening/REQ-pdlc-review-loop-hardening.md` (v1.1)
**Date:** 2026-07-29
**Iteration:** 2
**Scope:** testability of ACs, edge-case completeness, measurability of thresholds, negative cases. Not product strategy, not architecture.
**Delta basis:** `git diff 9220a20..HEAD -- docs/pdlc-review-loop-hardening/REQ-pdlc-review-loop-hardening.md` (348 changed lines). Only changed sections reviewed; §H-1/§H-2 citation refreshes, AC-1, AC-2, AC-4, AC-5, §4a, §6, §7, §8, §9 diffs read in full. Unchanged, previously-approved material not re-litigated.

## Disposition of my v1 findings

| v1 ID | Sev | Status | Evidence in v1.1 |
|---|---|---|---|
| F-01 | High | **Resolved** | AC-4.2 is re-based on a persisted, machine-readable verdict field in the cross-review *artifact*; `Targets` now names `pm-review`/`se-review`/`te-review`; §4a A-4 measures the current response-only contract (I re-verified: `se-review/SKILL.md` §VERDICT Trailer says "the last content of your **response**", and my own v1 file carries no trailer — A-4's "one of two" observation is accurate); AC-4.2a makes the read fail **closed**; O-17 owns the grammar; R-7 records the scope widening. Q-01 answered affirmatively. This is the shape I asked for. |
| F-02 | High | **Resolved** | §4a A-1 (eleven host globals — re-verified verbatim against `pdlc/workflows/runtime-adapter.js:13-16`), A-2 (no stall/retry primitive, grep recorded), A-3 (re-entrancy recorded as *unknown* rather than assumed). AC-3.3 is now derived from on-disk state and AC-3.5 counts a **script-owned** dispatch-and-verify attempt; the runtime counter is disclaimed and deferred as D-RLH-04 with a named successor row. The unmeasured predicate is gone. |
| F-03 | Medium | **Partly resolved** | `MAX_AUTHORING_WRITE_BYTES = 12,000` is a decidable primary bound and AC-3.6 is bound to the same number — the "well inside" / "comparable size" phrasing is gone. Two residues remain: the co-bound (F-03 below) and the derivation arithmetic (F-04 below). |
| F-04 | Medium | **Resolved** | AC-4.1a defines dual approval as both reviewers approving in the **same round index**, cites the existing gate, and states the outcome for the exact cross-round state I posed ("the phase **runs**"). O-18 owns the pairing mechanism including a missing per-round file. |
| F-05 | Low | **Resolved** | AC-1.4 names the **script** as enforcing party, deterministic and model-call-free per C-5, with prompt text explicitly insufficient. |
| F-06 | Low | **Resolved** | AC-1.6a/b/c: the constant is a budget, the terminal condition is relative to the starting index, every reporting artifact carries actual numbers instead of the literal `5`, and the H-2 "fresh budget" reconciliation is written out. |

Q-02 and Q-03 are answered in-document (AC-2.3a, AC-3.2a + O-20).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **AC-3.5's no-progress predicate is saturated by AC-3.1's mandatory skeleton, so a healthy authoring run reports "no progress".** AC-3.1 now requires the *first* write to contain **"all top-level section headings, no prose"**. AC-3.5's progress test is *"the script re-checks the artifact's structural completeness (AC-3.4). If completeness did not advance — **no new section since the previous check** — the script counts that as one failed script-owned attempt"*. After write 1 every section already exists, so under the predicate as literally stated no later dispatch can ever produce a "new section": an artifact being filled in correctly, one prose section per dispatch, burns an attempt on every dispatch and halts with the operator-facing message "no progress across N attempts" — a false positive on the pipeline's principal new halt path, and the one arm a test would be written against first. Conversely, if "advance" is meant as *one more section acquired prose*, the REQ does not say so, and the two readings give opposite terminal statuses for identical on-disk sequences. O-7 does **not** dispose of this: O-7 owns the *terminal* completeness criterion per document type, whereas the defect is the **delta** predicate, stated in the REQ in terms of section presence that AC-3.1 makes constant. Fix at requirements altitude in one clause: state that progress means a *strict increase in the count of sections satisfying the AC-3.4 criterion* (not section presence), and that the skeleton write itself is progress. | AC-3.5, AC-3.1, AC-3.4, O-7 |
| F-02 | Medium | Local | **`MAX_AUTHORING_ATTEMPTS` has no counting rule, and the two candidate rules differ in whether the loop terminates at all.** AC-3.5 says a no-advance dispatch "counts as one failed script-owned attempt and re-dispatches … up to a named budget"; the threshold table sets the budget to 3 and justifies it with *"attempts are cumulative rather than repetitive"*. Neither states whether the counter is (a) a cumulative cap on **all** dispatches for the artifact or (b) a cap on **consecutive** no-advance dispatches, reset by any advance. Under (a) a legitimate 12-section document halts at dispatch 3 while still advancing; under (b) nothing anywhere in AC-3 bounds the **total** dispatch count, so an artifact that gains one section per dispatch can loop unboundedly — which is the exact cost failure mode (§H-3's 71 min / 1.34 M tokens) this feature exists to bound. A test writer cannot pick a terminal-status assertion without guessing, and the negative test ("advancing run must **not** halt") cannot be written at all. O-19 asks for the *oracle* for the message, which presupposes the counting rule rather than supplying it. State the rule, and if (b), state the total bound. | AC-3.5 threshold table, AC-3.2, O-19 |
| F-03 | Medium | Local | **The pacing bound carries an unmeasured, approximate second threshold that is operative.** The `Name` row reads `` MAX_AUTHORING_WRITE_BYTES `` *"(equivalently ≈150 lines, **whichever is hit first**)"*. "Whichever is hit first" makes the line count a binding constraint, and `≈` makes it undecidable: a 160-line / 8,000-byte write violates the line bound and satisfies the byte bound, and no reviewer or test can say whether it is conforming. It is also unmeasured — the surviving witnesses cited are 88 and 48 lines and the failing one is ~1,000, so nothing in the Derivation row supports 150, while the Revision rule states the default "is not raised by argument". This is v1 F-03's defect in miniature, at the one AC that is the primary fix for H-3. Either delete the parenthetical (the byte bound alone is decidable and sufficient), or state an exact line bound with its own surviving-write witness. | AC-3.1 threshold declaration, AC-3.6 |
| F-04 | Low | Local | **The Derivation row does not reproduce at the HEAD it declares.** Measured per its own stated method (`wc -lc`) at the declared baseline `9220a20`: `REQ-pdlc-workflow-distribution.md` is **1017 lines / 89,069 bytes**, not "970 lines / 84,671 bytes"; and 12,000 is **not** "the smaller of the two surviving witnesses, rounded down" — the smaller witness is `CROSS-REVIEW-software-engineer-REQ-v1.md` at **11,933 bytes**, i.e. the default sits 67 bytes *above* it (it is 0.94× the *larger* witness, as the same sentence separately and correctly says). Neither error moves the conclusion — the true failing floor is 7.4× the default, and 12,000 is still under a demonstrated-safe 12,767 — but a threshold whose Revision rule forbids raising "by argument" must have a basis that reproduces, or the next maintainer cannot apply the rule. Correct the two numbers and the "smaller of" clause. | AC-3.1 Derivation row |
| F-05 | Low | Local | **AC-4.6's force-run is not sequenced against AC-2.3's refusal, in the state that motivates both.** AC-2.3b fixes precedence for the *skip* path ("skipped ⇒ AC-2.3 has nothing to refuse"). It does not cover force-run: on the worked example AC-2.3b itself names — `pdlc-workflow-distribution`, dual-approved REQ **and** an unresolved `POSTMORTEM-R` — an operator invoking AC-4.6 either gets the phase they asked for or an AC-2.3 refusal, and the document supports both. That is the principal intended use of AC-4.6 (re-do a phase whose review record is disputed), so it needs one sentence. O-9 is scoped to precedence "relative to the recorded approval", not relative to AC-2.3; AC-2.4's resolve-then-run path is the likely intended answer but is not stated as exclusive. | AC-4.6, AC-2.3, AC-2.3b, O-9 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AC-1.1 computes the index per (feature, document type) **across roles**, and AC-1.2 makes it common to both reviewers in a round. On a role-asymmetric branch (SE at v13, TE at v1) TE's next file is `-v14`, leaving TE with no v2–v13. Is that intended, and does O-18's same-round pairing then treat TE's absent `-vN` as "not approving" (fail-closed) for every N in the gap? I read AC-4.2a as implying yes; a word in O-18 would remove the guess. |
| Q-02 | AC-3.2a mandates one commit per section write. Does that cadence apply to the **review** and remediation agents AC-3.6 binds to the same byte budget, or only to the three author SKILLs named in AC-3.2a? A partial cross-review left uncommitted is the same loss mode. |

## Positive Observations

- §4a is the right response to v1 F-02 and is the strongest new section: each row carries the measuring command, and **A-3 records an unknown as an unknown** rather than resolving it by assumption — then AC-3 is written to hold under both readings. That is the discipline DC-02 is for, and it makes AC-3.3 unit-testable against injected disk state with no runtime dependency.
- AC-4.2a is a fail-closed default on the one path where failing open would launder an unreviewed document (R-1), and it makes legacy artifacts cause *extra* review. This is exactly the falsifiable direction, and it pairs with O-14's negative case.
- AC-2.3b supplies a **worked example with a named feature and a stated expected outcome** (skip, continue, report both), which is a directly transcribable acceptance test rather than a policy statement; O-12 was updated to carry both the precedence and the scope case.
- v1 F-05 and F-06 were fixed by naming the enforcing party and by separating "budget" from "absolute index" (AC-1.6a) — the latter removes a resumed-loop trip-on-entry bug that would otherwise have been found in implementation.
- The `Citation baseline` header row plus symbol+literal citations makes the whole document re-verifiable under line drift; I spot-checked A-1 against `runtime-adapter.js:13-16` and A-4 against `se-review/SKILL.md`, and both are accurate as written.
- Every v1.1 addition that expands scope is paired with a risk row (R-6, R-7) and every new deferral (D-RLH-04) names a successor row, so nothing new is left as prose intent.

## Recommendation

**Needs revision**

Exactly what must change:

1. **F-01** — restate AC-3.5's progress predicate as a strict increase in AC-3.4-satisfying sections, so AC-3.1's skeleton does not make it constant.
2. **F-02** — state whether `MAX_AUTHORING_ATTEMPTS` bounds consecutive no-advance dispatches or all dispatches; if the former, state the total bound.
3. **F-03** — delete the `≈150 lines … whichever is hit first` co-bound, or give it an exact value and a witness.

F-04 and F-05 are one edit each and need not gate a further round on their own. No other section of v1.1 blocks approval; F-01–F-03 are all inside AC-3.
