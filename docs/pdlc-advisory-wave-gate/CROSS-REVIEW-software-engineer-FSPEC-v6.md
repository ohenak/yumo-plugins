# Cross-Review: software-engineer — FSPEC (delta re-review)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md` (v1.4)
**Date:** 2026-08-19
**Iteration:** 6
**Scope:** Delta only. Diff `7b8b314c..HEAD` (five commits, 26 insertions / 17 deletions), against my v5 findings F-01…F-06 and REQ HEAD v1.8. Reviewed on `feat-pdlc-advisory-wave-gate`.

## Disposition of prior findings

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 — AT-04-1 carried the pre-erratum shape of AC-4.1 | High | **Resolved** | AT-04-1 now names conjunct (ii) only and defers restoration to AT-05-1; AT-04-1a carries conjunct (i) (applies + green re-gate ⇒ resolved, proceeds, green invocation in AT-04-2's sequence); AT-04-1b carries conjunct (iii) (applies, no gate invocation follows ⇒ halts, resolved count `0`), naming the suppressed re-gate as fixture construction owed to TSPEC under O-1. The "No existential negative — not assertable" rationale is deleted. Matches `REQ:382-395` conjunct for conjunct, one run each. |
| F-02 — BR-11 defined "invocation" as one A6 dispatch, contradicting AC-2.4 | High | **Resolved** | BR-11 now puts the seam window on a single **attempt** over the window AC-2.4 pins (dispatch→verdict, deadline restarting each attempt), reserves **invocation** for "A6 on one red wave, REQ §5", and carries NFR-4's `attemptBudget` × value worst case (`FSPEC:213-221`). Reads identically to `REQ:488-492` and `REQ:223`. |
| F-03 — inherited carve-out that NFR-4 had deleted | Medium | **Resolved** | BR-11 now states the exclusion in its own right: "Gate-command run time falls outside the window structurally, no subtraction performed" — the noun is gone. v1.4 changelog records the re-emitted REQ errata as landed in REQ v1.7/v1.8 (`FSPEC:20`), and the v1.2 line is marked superseded rather than left standing. |
| F-04 — AT-01-5's population wider than AC-1.5 | Medium | **Resolved** | Population is now "runs that reach Phase I **and evaluate wave mode**, wave-executing and no-manifest legacy alike", with the legacy arm named as a fixture and ledger-skip / early-halt runs named as exclusions (`FSPEC:328`). Tracks `REQ:274-281` and FSPEC's own E-04. |
| F-05 — A-1 booked two enumerations where BL-06 requires three | Medium | **Resolved** | A-1 now reads "BL-06's three enumerations", naming the third as the notice's mutual exclusivity against BL-04's, which is the fact E-04 consumes (`FSPEC:505`). |
| F-06 — A-4 used retired *invocation* vocabulary for R-3 | Low | **Resolved** | A-4 now reads "within a single run … drift across runs" (`FSPEC:502-504`), matching `REQ:513-516`. |

No unchanged section was re-litigated. Nothing in the delta re-opens a settled decision, and no new upstream defect surfaced: REQ HEAD v1.8 and FSPEC v1.4 now agree on AC-4.1's conjunct set, AC-2.4's attempt-scoped window, NFR-4's structural exclusion, AC-1.5's population, BL-06's three enumerations and R-3's run scope.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | **Two residual "per-dispatch" phrasings survive the vocabulary rewrite.** §3.2 Step 3 still closes "time budget is per-dispatch (BR-11)" (`FSPEC:94`), and AT-02-7 still says "the window is BR-11's: one dispatch, dispatch→verdict" (`FSPEC:360-361`). Both are *behaviourally* correct — an attempt encloses exactly one dispatch (§3.2 steps 3b–4; BR-11's "an attempt is one repair-and-re-gate cycle"), so per-dispatch and per-attempt name the same window today — and both are grounded in shipped code: the wall-clock deadline is constructed fresh on every attempt and `budgetExceeded`'s `elapsedMs` is `0` at every attempt-loop call site, so exhaustion is a per-attempt race, never cumulative (`pdlc/workflows/orchestrate-dev.js:3369-3384`, `:2288-2289`). But REQ's erratum round separated *run*, *A6 invocation* and *attempt* deliberately (`REQ:25`), and BR-11/E-25 now speak attempt while these two sentences speak dispatch; a TSPEC author reading Step 3 alone could re-fuse the pair. **Fix:** substitute "per attempt" in both, keeping "one dispatch per attempt" as the parenthetical if the identity is worth stating. Not gating: no oracle changes. | §3.2 Step 3, §6.2 AT-02-7; REQ AC-2.4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v3–v5, still non-gating and now half-answered upstream: NFR-4 names the worst case (`REQ:488-491`) and BR-11 repeats it, but neither document asks for an oracle over `attemptBudget` × `seamBudgetMinutes`. Is the worst case meant to stay rationale-only, or does the TSPEC owe it a test? A one-line statement in §7 would close it. |
| Q-02 | Carried from v5 and now sharper, since AT-04-1b exists: the fixture suppressing the re-gate is TSPEC's construction under O-1, but §6 elsewhere pins *who* runs each AT and through which transport. Does AT-04-1b run through the same injected command transport as AT-04-2, or does it need a distinct harness that patches control flow? Answering in §6.4's preamble would let the TSPEC author cost it without a round-trip. |

## Positive Observations

- **The AT-04-1 split is the right repair, not the minimum one.** Rather than widening one fixture's assertion list, the author gave each of AC-4.1's conjuncts its own run and said so explicitly ("Each conjunct gets its own run — none exhibits two"), which is what makes conjunct (iii) a real prohibition test rather than a corollary of (ii). AT-04-1b also declines to specify the mutation mechanism, correctly leaving it to TSPEC under O-1 — the altitude discipline held under pressure to over-specify.
- **BR-11's rewrite is verifiable against shipped code, not just against REQ.** "Deadline restarting each attempt, not cumulative" is exactly what the runtime does: a fresh `Promise.race` deadline per attempt, with `elapsedMs` deliberately zero in the loop (`orchestrate-dev.js:3369-3384`). The clause now describes inherited behaviour that actually exists, so the TSPEC inherits a true premise.
- **The changelog now closes its own loops.** v1.2's superseded seam-budget line is marked superseded rather than silently overwritten, and v1.4 records where the re-emitted REQ errata landed (v1.7/v1.8). A reader of the FSPEC alone is no longer told an upstream disagreement is open when it is settled — that was F-03's real cost, and it is paid.
- **Six findings addressed in one round with no collateral drift.** The diff is 26 insertions across four sections; no flow, refusal-catalogue row, restoration trigger or writer-identity invariant moved. Delta-scoped revision done at delta scope.

## Recommendation

**Approved with minor changes**

Both High findings from v5 are resolved at the level they were raised: AC-4.1's three conjuncts now have three fixtures with the not-assertable rationale deleted, and the seam budget speaks *attempt* with *invocation* reserved for A6-engaged-on-one-wave. The remaining finding is a two-sentence vocabulary residue with no oracle consequence; it can land in the TSPEC round or in a v1.5 touch-up without blocking Phase F.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
