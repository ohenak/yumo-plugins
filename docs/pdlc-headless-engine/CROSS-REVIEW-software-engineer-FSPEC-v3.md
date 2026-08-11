# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.2)
**Date:** 2026-08-11
**Iteration:** 3
**Scope:** delta re-review of v1.1 → v1.2 against my own v2 findings, plus new issues in changed
sections only

## Delta scope

One commit touches the FSPEC since `cb3ab14` (the commit v2 reviewed): `e1bdbcc0` "FSPEC v1.2 —
re-ground on REQ v0.8 erratum round", 20 insertions / 13 deletions, in three places — the upstream
version cell, §2's AC-2.3 paragraph, and §13.1's preamble plus its O-ENG-4 row. The change note
declares "upstream re-grounding, no new content" and "No decision or rule changed". Everything
else in the document is byte-unchanged and not re-litigated here.

Because the revision's entire claim is *"§13.1's five items are resolved in REQ v0.8, and what this
FSPEC does is now confirmed upstream"*, the delta check is exactly: for each of the five rows, does
the REQ v0.8 resolution actually confirm the behaviour the FSPEC specifies? Four of the five hold.
One does not, and the FSPEC now asserts confirmation it does not have.

## Prior findings (v2)

| v2 ID | Severity | Status | Evidence in v1.2 |
|---|---|---|---|
| F-13 | Medium | **Open** | BR-PARITY-5's clause 3 still attributes the approval anchors to "the dispatched agent's tool calls, never the modules" (§10.2, byte-unchanged); the anchors are still written by `orchestrate-dev.js:6190` through `_appendFile`. Untouched by v1.2 — consistent with "no new content", not a regression. |
| F-14 | Medium | **Open** | §3.2's closed-flag-surface rule still has no unrecognised-flag edge case in §3.4 and no acceptance test in §3.5. Untouched. |
| F-15 | Low | **Open** | BR-REP-0 still cites `bin/pdlc.mjs:208-215` / `:215-221`; the emission is `console.log(JSON.stringify(stamped))` at `:235`. Untouched. |
| F-16 | Low | **Open** | BR-EXIT-3 still says "a later or earlier iteration halted". Untouched. |
| F-17 | Low | **Open** | EC-REP-1's HEAD-state note unchanged. Untouched. |

None of these were gating and none were expected to move in an upstream re-grounding round; they
are carried forward, not re-raised as new.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-18 | High | Local | **§13.1 declares O-ENG-1 "confirmed upstream", but REQ v0.8 resolved it the opposite way, and §4.4 now contradicts the AC it derives from.** The row's behaviour cell — under a column header the revision rewrote to read "This FSPEC's behaviour, now confirmed upstream" — still reads "§4.4: Direction A enforced, Direction B reported not refused". REQ v0.8 did not confirm that. It removed the unsatisfiability by **scoping** the equality: AC-3.5 now reads "the set of skill identifiers the modules can dispatch equals the set of prompt files the installed plugin holds **for those identifiers**", and "**The equality is over the dispatchable subset, not over the plugin's whole `skills/` tree** (Phase-F erratum) … at HEAD the derived set is 10 identifiers over 12 prompt files … with 5 further operator-invoked skills present in the plugin and outside the set" (`REQ-pdlc-headless-engine.md:493-507`). Under that scoping both directions **are** satisfiable on a correct install, and the AC requires both to fail closed: "a dispatchable identifier with no readable file, and a prompt file for a dispatchable identifier that the engine cannot dispatch, **both fail closed at startup** with the differing identifiers named" (`:496-498`). §4.4 is byte-unchanged and still says the opposite in three places: Direction B is "reported" and "does **not** refuse"; the justification paragraph still asserts "at HEAD the two sets are not equal and cannot be … an equality gate would refuse on every correctly installed machine" — a premise REQ v0.8 deleted; and it still says "This is a defect in AC-3.5's oracle … raised as an erratum against the REQ, and §13 O-ENG-1 carries it", while §13.1's new preamble says "No row below is still open". A TSPEC author reads §4.4 and builds a non-refusing Direction B; a test author reads AC-3.5 and writes a refusal fixture; the parenthetical count problem is also stale (§4.4 says AC-3.5's count "is a count of *files*, not of dispatchable identifiers" — v0.8 states both, 10 and 12, and declares them "an observation of HEAD, never the assertion"). Fix, all in one pass: rewrite §4.4's Direction B to refuse over the **dispatchable subset**, delete the unsatisfiability justification, restate the HEAD-red note against the scoped set (the frozen 17-name list at `pdlc/engine/lib/startup.mjs:20`, `:102` over-declares it — M-ENG-06's red row already says so), fix §14.1's AC-3.5 row which still reads "§4.4 (with O-ENG-1)", and rewrite O-ENG-1's behaviour cell to what v0.8 actually settled. | §13.1 O-ENG-1, §4.4, §14.1 |
| F-19 | Medium | Local | **O-ENG-5's behaviour cell still describes the gap the REQ closed.** The cell reads "§14.1 traces it to no AC, which is the gap", under the same "now confirmed upstream" header. REQ v0.8 gave `pdlc doctor` upstream authority inside AC-2.1: "The **same startup posture is readable without starting a run**, through a diagnostic command that dispatches nothing and bills nothing … That command is this REQ's, not an inheritance from the command set FSPEC enumerates (Phase-F erratum: `pdlc doctor` was an operator-visible surface with no upstream authority); its name and flags are FSPEC's to fix" (`REQ-pdlc-headless-engine.md:422-426`). §14.1's AC-2.1 row is unchanged and still maps to §5.1 / AT-ENG-13, AT-ENG-15 only, so the traceability table still does not carry the doctor surface, and AT-ENG-09 (doctor's rungs equal a run's rungs, §4.6) traces to no AC. Fix: add §3.1/§4.1 and AT-ENG-09 to AC-2.1's row in §14.1, and restate the O-ENG-5 cell as what the FSPEC now owns (the command's name, flags and read-only posture) rather than as a traceability gap. | §13.1 O-ENG-5, §14.1 |
| F-20 | Medium | Local | **O-ENG-4's behaviour cell describes the paragraph this revision deleted.** The cell still says "§2: AC-2.3's state stated directly — green for the single-dispatch case, red for BR-ENV-3's every-dispatch quantifier". That sentence was §2's v1.1 text; v1.2 replaced it precisely so that §2 stops stating AC-2.3's state and defers instead — "The table is total over the REQ's criteria, so it — not this section — is the authority" (§2). The row and the section it points at now say incompatible things about who is authoritative, in a document whose whole change is that deferral. Fix: restate the cell as "§2 defers to M-ENG-06's AC-2.3 row (partially green); the unasserted half, BR-ENV-3's every-dispatch quantifier, is what §7.1 schedules". | §13.1 O-ENG-4, §2 |
| F-21 | Medium | Local | **§2's new paragraph mis-routes AC-4.1's set-equality half to §12.4.** The sentence "as is AC-4.4 (§8.4) and AC-4.1's set-equality half (§12.4)" is right about AC-4.4 but wrong about AC-4.1: the set-equality obligation is BR-FAIL-1 in **§8.1** ("Set-equality is asserted between the classifier's possible outputs and these six"), tested by AT-ENG-33 (§8.6), and §14.1's own row maps AC-4.1 → §8.1 → AT-ENG-33, AT-ENG-34. §12.4 is BR-VER-1/2/3 — hermeticity guard, per-transport fixtures, opt-in live smoke — and contains no catalogue set-equality. Since §2's stated job is telling the plan author which unasserted halves to schedule first, the one wrong pointer sends that reader to a section with no such obligation. Fix: `(§8.1, AT-ENG-33)`. | §2, §8.1, §12.4, §14.1 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried unanswered from v2 (BR-MSG-1's whole-suite id-accumulation invariant): under a parallel sharded runner no single process observes every emitted id, so the end-of-run set-equality either constrains the harness (one process, serial suite) or needs an aggregation step. Still a question, not a finding — either answer is cheap now and expensive after the harness exists. It is TSPEC's to answer; I note it only so it is not lost between rounds. |
| Q-02 | §13.1's preamble now asserts "No row below is still open" as a property of the whole table. Would you consider making that per-row — a `Resolved in` column citing the REQ line that settles each item — so the next re-grounding round can be checked cell by cell instead of by re-reading five ACs? F-18 and F-19 are both cases where the blanket statement was written ahead of the row it covers. |

## Positive Observations

- The re-grounding of §2 is the right structural move, and it is done in the direction that
  survives: M-ENG-06 is now declared total over the ACs with an explicit three-state vocabulary
  ("*Partially green* is a state in its own right: some half of the criterion is asserted at HEAD
  and the row names the unasserted half", `docs/_constraints/pdlc-engine-baseline.md:87-89`), and
  §2 stops carrying a private answer for one AC. One authority, one place to correct — a document
  that states a fact the constraints file also states will drift, and this deletes that copy.
- Every citation in the new §2 paragraph lands exactly. `transport.mjs:159` is
  `const dispatchEnv = { ...env };`, `:168` is `const options = { abortController, env: dispatchEnv };`,
  and `__tests__/transport.test.js:170` is the test named "dispatch env spreads the provided env
  rather than replacing it" — so the "green for the single-dispatch spread, red for BR-ENV-3's
  every-dispatch quantifier" split is verifiable at HEAD in three lookups. The upstream M-ENG-06
  row carries the same three citations, which is what makes the deferral safe rather than a
  hand-off into fog.
- The AC-4.4 pointer (§8.4) is right, and the upstream row it defers to names its unasserted half
  concretely — "that the run stops through the modules' halt path, and the closed-catalogue naming
  AC-4.1 owns" — with `AuthPolicyError` at `transport.mjs:23`, classified first at `:100`, and
  `adapter.mjs:291` rethrowing anything that is not a `RateLimitedError`. A plan author can
  schedule that half without re-deriving anything.
- The change note is honest about its own scope ("no new content", "No decision or rule changed"),
  which is what let this review be a three-place diff rather than a re-read. The three findings
  below High are all instances of the same missed step — cells that describe the pre-erratum world
  — not new disagreements.

## Recommendation

**Needs revision**

One High. The revision's claim is that §13.1's five items are resolved upstream and that this
FSPEC's behaviour is confirmed by that resolution. For O-ENG-1 the opposite is true: REQ v0.8
resolved the unsatisfiability by scoping AC-3.5's equality to the dispatchable subset and requiring
**both** directions to fail closed, while §4.4 still specifies Direction B as report-not-refuse and
still justifies it with a premise the REQ deleted. Asserting upstream confirmation for a rule the
upstream document contradicts is worse than leaving the erratum open, because the next reader stops
checking. F-19 and F-20 are the same omission in smaller form (two behaviour cells describing text
that no longer exists), and F-21 is a single wrong section pointer in the new paragraph.

The fix is bounded and does not reopen a decision: rewrite §4.4's Direction B to the scoped
both-directions gate AC-3.5 now states, refresh the three stale cells in §13.1, and correct two
pointers in §14.1 plus one in §2. My five v2 findings remain open and remain non-gating.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 0}
