# Cross-Review: test-engineer — FSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/FSPEC-pdlc-advisory-wave-gate.md
**Date:** 2026-08-18
**Iteration:** 5
**Scope:** Upstream-cascade confirmation only. FSPEC bytes unchanged since the v4 approval
(REVIEWED-COMMIT 7b8b314c). Upstream REQ moved from sha256:32ba7d94… (commit 6565080a) to
sha256:a10396e8… (commit 2e262298) across erratum rounds 3 and 4. Question answered: does FSPEC
still hold as a faithful compression of REQ as it now stands? Settled decisions are not
re-litigated; unchanged FSPEC sections are read only where the REQ delta reaches them.

## Upstream Delta Read

| REQ change (6565080a → 2e262298) | Reaches FSPEC at | Still faithful? |
|---|---|---|
| `seamBudgetMinutes` restated **per attempt**, deadline restarting each attempt; §5 table and AC-2.4 name the worst case as `attemptBudget` × the value; "invocation" redefined as A6 engaged on one red wave | §4 BR-11, §5 E-25, §6.2 AT-02-7 | Mechanics yes, vocabulary no — F-01 |
| NFR-4's subtraction carve-out and its starvation rationale deleted; exclusion now structural | §4 BR-11, §6.2 AT-02-7 | Yes — FSPEC v1.2 pre-landed this reading |
| AC-4.1 rewritten from one negative into three positive conjuncts on three runs, (iii) naming a mutation fixture that drops the re-gate | §6.4 AT-04-1, AT-04-2 | No — F-02 |
| AC-1.5 population widened to runs reaching Phase I **and evaluating wave mode**, no-manifest legacy run back inside it; carriers mutually exclusive | §5 E-04, §6.1 AT-01-5 | Substantially yes — F-03 on wording |
| R-3 says *run* where it said *invocation* | §4 BR-11, §8 R-3 reference | Yes — FSPEC already said "in one run" |
| BL-06 widened to require measuring the two carriers' mutual exclusivity | §7 A-1 | Partly — F-04 |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-02 | **High** | Local | **AC-4.1's conjunct (iii) — the one REQ says carries the prohibition — has no acceptance test in FSPEC, and AT-04-1's stated reason for not having one is now false at upstream HEAD.** REQ v1.6's AC-4.1 was a bare existential negative ("no path by which an advisory verdict substitutes for a gate result"), and FSPEC was right to answer it with AT-04-1's three positive assertions plus the note "No existential negative — 'no path exists' is not assertable". REQ v1.8 has now *supplied* the assertable form: three conjuncts, **each on a run of its own, so three fixtures**, of which (iii) is "applies and **no** gate invocation follows ⇒ the wave halts", explicitly "unreachable on an ordinary run, so its fixture mutates the shipped control flow to drop the re-gate and asserts the halt survives" (REQ:386-390). FSPEC contains no mutation fixture at all (`grep -in "mutat" FSPEC` returns nothing across 505 lines), and AT-04-1's three assertions are three oracles *within one red-re-gate run* — REQ's conjunct (ii) — not REQ's three runs. Consequence for the suite: the prohibition ships unfalsified. Every current AT-04-x fixture runs a real gate command, so an implementation that skipped the re-gate and declared the wave gated on the verdict alone would still be red for the *gate-failure* reason AT-04-1 pins, never for the substitution AC-4.1 forbids. Suggested revision: add AT-04-1a (applies + green re-gate ⇒ resolved, proceeds, and the green invocation appears in AT-04-2's sequence) and AT-04-1b (mutation fixture: control flow patched to drop the re-gate ⇒ terminal disposition is a halt, resolved count `0`), keep AT-04-1 as conjunct (ii) with AC-5.1 restoration named, and retire the "not assertable" sentence, which now contradicts the AC it explains. | §6.4 AT-04-1 (FSPEC:387-389), REQ AC-4.1 (REQ:382-390) |
| F-01 | Medium | Local | **BR-11 and E-25 measure the seam budget per "invocation" and attribute that definition to REQ AC-2.4, which no longer defines the word that way.** BR-11 reads "more than `advisory.seamBudgetMinutes` of working time on a single invocation, an **invocation** being one A6 dispatch measured dispatch→verdict, **as REQ AC-2.4 defines it**" (FSPEC:209-211). REQ v1.8 separates three terms deliberately (F-25) and inverts this one: an *attempt* is the dispatch→verdict window the deadline restarts on (AC-2.4, NFR-4), while an *A6 invocation* is "A6 engaged on one red wave" (REQ:224), spanning up to `attemptBudget` attempts. So FSPEC's "invocation" is REQ's "attempt", and REQ's "invocation" is the whole engagement whose worst case is `attemptBudget` × the value — the very reading REQ v1.8 rules out as a deadline ("no cap over the invocation as a whole is required here", REQ:490-491). The mechanics FSPEC specifies are unchanged and still correct (per dispatch, not cumulative, re-armed each cycle), and BR-11, E-25 and AT-02-7 each carry the dispatch→verdict qualifier inline, so no fixture is actually ambiguous — this is a vocabulary collision plus one stale attribution clause, not a wrong test. Suggested revision: say *attempt* throughout BR-11 and E-25, drop "as REQ AC-2.4 defines it" or restate it as "the window AC-2.4 pins", and state REQ's worst case once so the FSPEC reader is not left to infer it from "re-armed". | §4 BR-11 (FSPEC:208-216), §5 E-25 (FSPEC:290), REQ AC-2.4 (REQ:321-324), NFR-4 (REQ:488-493) |
| F-03 | Low | Local | **AT-01-5's one-line population ("Population: runs that reach Phase I") no longer names the case REQ v1.8 went out of its way to put back inside it.** REQ now scopes AC-1.5 to runs that reach Phase I **and evaluate wave mode** — "executing waves or taking the no-manifest legacy path alike" (REQ:275-277) — precisely because the earlier reading pushed the BL-03 legacy run, where the only reachable carrier fires, outside the population. FSPEC E-04 does carry the substance (the carriers are mutually exclusive and "the no-manifest carrier alone discharges the requirement"), and FSPEC excludes the same two cases REQ excludes, so the populations coincide extensionally. The risk is at the fixture, not the criterion: a writer working from AT-01-5's short form can read "reaches Phase I" as "runs a wave" and build only the wave-mode arm. Suggested revision: extend AT-01-5's population clause to "runs that reach Phase I and evaluate wave mode — wave-executing and no-manifest legacy runs alike". | §6.1 AT-01-5 (FSPEC:328), REQ AC-1.5 (REQ:274-283) |
| F-04 | Low | Local | **§7's A-1 still enumerates BL-06's obligations as REQ v1.6 stated them, one short of what BL-06 now requires be measured.** REQ v1.8's BL-06 adds "and the mutual exclusivity of that notice with BL-04's" to the pre-FSPEC measurement obligation (REQ:581). A-1 lists the two enumerations and the BL-03 no-manifest re-measurement only, while E-04 already leans on mutual exclusivity as an established fact. Assumption and evidence should name the same set, or the fact E-04 rests on has no recorded provenance. | §7 A-1 (FSPEC:496), REQ BL-06 (REQ:581) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-02's conjunct (iii) fixture is described by REQ as mutating shipped control flow. Is the intended mechanism a seam-level injection (a transport that returns no gate invocation) or a genuine source mutation run under the mutation checks the project standard already calls for on load-bearing oracles? FSPEC choosing one keeps TSPEC from inventing a third. |

## Positive Observations

- **The NFR-4 erratum I raised as Q-01 in v4 landed upstream, and FSPEC had already pre-empted it.** My v4 review noted REQ still carried the subtraction reading ("**less** the time spent running the gate command") while FSPEC v1.2 had already restated the exclusion as structural — "the gate command runs between dispatches, never inside a dispatch→verdict window, so no subtraction is performed" (FSPEC:216-218). REQ v1.8 now says exactly that, in almost those words (REQ:492-493). The compression was ahead of its source; the round closed the gap rather than opening one. AT-02-7's companion fixture needs no change.
- **AC-2.4's per-attempt restatement cost the FSPEC nothing behaviourally, which is the sign the round-2 partition was right.** BR-11 already specified "not cumulative across the wave, so the budget is re-armed for each of the up to `advisory.attemptBudget` cycles a wave may run". REQ v1.8's "deadline restarting each attempt" is the same rule under a different noun. AT-02-7 and AT-02-9 stay valid as written — only the label needs the sweep F-01 describes.
- **E-04's mutual-exclusivity clause anticipated REQ v1.7 and survives v1.8's widening.** The hardest part of the AC-1.5 cascade — that a both-absent run has only one reachable carrier and the requirement binds it — is stated in FSPEC as a positive fact about which branch each carrier sits on, not as an assumption. That is why F-03 is a wording finding rather than a coverage one.
- **R-3's run/invocation correction found FSPEC already on the right side of it.** BR-11 has said "distinct waves *resolved* in one run" since v1.2, with only resolutions consuming the budget and AT-02-6's two cases pinning it. Nothing to change.

## Recommendation

**Needs revision**

One High finding is open, so the confirmation cannot approve. It is narrow and mechanical: REQ's erratum round replaced AC-4.1's unassertable negative with three positive conjuncts on three separate runs, and FSPEC §6.4 still carries the compression built for the old negative — three oracles inside one run, plus a rationale sentence ("no existential negative … is not assertable") that the new upstream text falsifies. The conjunct with no test, (iii), is the one REQ identifies as carrying the prohibition, so the gap is not a spare fixture but the falsifier for AC-4.1's whole point. Two ATs and one deleted sentence close it.

Everything else in the delta lands clean. The seam-budget change is a vocabulary sweep over BR-11 and E-25 (F-01, Medium) with no fixture consequence — the dispatch→verdict qualifier is inline everywhere it matters. F-03 and F-04 are one-clause precision edits. No previously approved section outside the reach of the REQ delta was re-read or re-litigated, and none of the settled decisions from rounds 1–4 are reopened here.

FINDING: High | delta | local | §6.4 AT-04-1 | REQ v1.8's AC-4.1 conjunct (iii) — applies with no gate invocation following ⇒ halt, proved by a mutation fixture that drops the re-gate — has no acceptance test in FSPEC, and AT-04-1's "no existential negative … is not assertable" rationale is now false against upstream HEAD, which supplies the assertable form.
FINDING: Medium | delta | local | §4 BR-11, §5 E-25 | Seam budget is measured per "invocation" and attributed to REQ AC-2.4, but REQ v1.8 makes the window per *attempt* and redefines *invocation* as A6 engaged on one red wave; mechanics still correct, the term and the attribution are stale.
FINDING: Low | delta | local | §6.1 AT-01-5 | Population clause "runs that reach Phase I" omits REQ v1.8's added qualifier "and evaluates wave mode", including the no-manifest legacy run the round deliberately put back inside the population.
FINDING: Low | delta | local | §7 A-1 | BL-06's measurement obligation gained the carriers' mutual exclusivity in REQ v1.8; A-1 still lists the prior set, leaving the fact E-04 rests on without recorded provenance.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 2}
