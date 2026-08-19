# Cross-Review: software-engineer — REQ (delta confirmation, erratum round 3)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/REQ-pdlc-advisory-wave-gate.md
**Date:** 2026-08-18
**Iteration:** 5 (delta confirmation of the v1.7 erratum round)
**Scope:** Local

## Method

Re-read the REQ at HEAD in full (not only the erratum diff), then diffed `119bdaf4`
(`REQ v1.7 — erratum round 3`, the only commit in this round's window) against `6565080a`.
Every claim about shipped behaviour that the round's new text rests on was re-checked against
HEAD source rather than against the raised item's summary of it:

- wave-mode derivation and the BL-03 carrier — `pdlc/workflows/orchestrate-dev.js:14039-14045`
- the BL-04 script-gate carrier in the wave arm — `pdlc/workflows/orchestrate-dev.js:14142-14154`
- the ledger skip that reaches Phase I but executes no wave — `pdlc/workflows/orchestrate-dev.js:14267-14283`
- the advisory budget race the NFR-4 window describes — `pdlc/workflows/orchestrate-dev.js:3414-3423`

Per DEC-ERR-03 this confirmation is not limited to the raised item list: anything the REQ
still asserts that HEAD or the REQ's own definitions no longer support is a finding here.

## Raised Items — Landing Assessment

The round carried five distinct items (the dispatch list repeats several of them from
different raisers). Landing verdicts:

| Item | Landed? | Evidence at HEAD |
|---|---|---|
| AC-1.5 notice cardinality unscoped (F-18) | **No — mis-landed** | REQ:265-266 scopes the population to a run "that reaches Phase I **and executes a wave**". F-18 asked for "runs that reach Phase I". The narrower scope excludes the no-manifest legacy run — the only run in which BL-03's carrier fires (`orchestrate-dev.js:14041-14045`) — i.e. exactly the case AC-1.5 exists to constrain. See F-01. |
| AC-1.5's two carriers mutually exclusive (F-19) | Partially | REQ:270-274 now records the exclusivity and binds the requirement to whichever carrier fires, naming BL-03's as the both-absent carrier. The prose is correct against HEAD. It is however unmeasurable under the population the same edit wrote (F-01), so the fix does not stand on its own. |
| NFR-4's carve-out and `attemptBudget`-starvation rationale false | Partially | REQ:471-475 deletes both the carve-out and the false rationale, and states the exclusion as structural. That much is right and matches HEAD: the gate runs between dispatches, never inside one. What did not land is the *granularity* of the window the raisers named — see F-02. |
| §5 config table restated to AC-2.4's window | Partially | REQ:214 no longer says "excluding gate-command run time" and no longer implies subtraction, which is correct: HEAD performs none. It now says "per A6 invocation, measured dispatch to verdict", which inherits F-02's defect. |
| AC-4.1's unbounded existential negative replaced | **No — regressed** | REQ:370-376 replaces one unfalsifiable-but-true sentence with three conjuncts, two of which are impossible under the REQ's own definition of "resolves". See F-03. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-22 | High | Local | **AC-1.5's new population excludes the one run shape its own carrier fires in.** REQ:265-266 scopes the cardinality to a run "that reaches Phase I and executes a wave". A run lacking the ownership manifest does not execute a wave: `waveMode` is false and the phase takes the worktree exception path (`orchestrate-dev.js:14039-14045`), which is precisely where BL-03's carrier notice is emitted and precisely the run AC-1.5's "both, in a run lacking manifest and script-owned gate alike" clause (REQ:266-268) is about. As written, the both-absent run is outside the population, so the criterion's central case is unmeasured and the F-19 fix at REQ:270-274 has nothing to bind to. F-18's stated fix was "runs that execute Phase I"; the added "and executes a wave" conjunct is what breaks it. Fix: scope to runs that *reach Phase I and evaluate wave mode* (i.e. exclude only the earlier-phase halt and the ledger skip at `orchestrate-dev.js:14267-14283`), not to runs that execute a wave. | §6 AC-1.5 (REQ:261-276) |
| F-23 | High | Local | **NFR-4's window is stated per A6 invocation but enforced per attempt at HEAD, so the requirement is false by up to `attemptBudget`×.** REQ:471-472 reads "No A6 invocation exceeds `advisory.seamBudgetMinutes`, measured … dispatch to verdict on that one invocation"; REQ:214 and AC-2.4 (REQ:311-313) say the same. But §5 defines an invocation as containing attempts (`attemptBudget` = "remediation attempts per wave invocation", REQ:213; "One attempt is one repair→re-gate cycle", REQ:314-315), and HEAD constructs a **fresh** deadline inside the attempt loop on every iteration (`const deadline = _sleep(totalBudgetMs)…` at `orchestrate-dev.js:3416`, inside the `while (true)` opened at `:3393`), with `budgetExceeded` called with `elapsedMs: 0` by design (`:3383-3385`, `:3436`). A three-attempt invocation may therefore consume 3 × `seamBudgetMinutes`. This is the pm-author item ("the window is the A6 episode on one wave, spanning up to `attemptBudget` cycles") that the round did not land: the false rationale was deleted, the false granularity was not. Fix: state the budget as per-dispatch, restarting on each attempt, and say plainly that an invocation's worst case is `attemptBudget` × `seamBudgetMinutes` — or, if a per-episode cap is wanted, record it as a change to shipped behaviour rather than as a description of it. | §7 NFR-4 (REQ:471-475), §5 (REQ:214), §6 AC-2.4 (REQ:311-313) |
| F-24 | High | Local | **AC-4.1's two new conjuncts are impossible under the REQ's own definition of "resolves".** The document uses resolution to mean a green re-gate: "Only resolutions consume wave budget" with the red-re-gate case explicitly consuming an *attempt* instead (REQ:314-317, REQ:395), AC-4.6 "once A6 resolves a wave … the wave's commit step completes" (REQ:413), AC-5.3 "A6 resolves the wave, the run continues along the wave's normal post-gate path" (REQ:432). Under that definition conjunct (ii) "A6 resolves and the re-gate is red" (REQ:373-374) is a contradiction and conjunct (iii) "A6 resolves and **no** gate invocation follows" (REQ:375) is unreachable — yet (iii) is the one the AC nominates as carrying the whole prohibition. Two of three "positive conjuncts observable on one run" are thus not observable on any run, which is a worse oracle than the sentence they replaced. Fix: name the antecedent for what it is at HEAD — A6 *applies a proposal* / *returns an applied verdict* — and reserve "resolves" for the green-re-gate outcome the rest of the document gives it. | §6 AC-4.1 (REQ:370-376) |
| F-25 | Medium | Local | **"Invocation" now carries three incompatible referents in one document.** R-3 uses it for a whole pipeline run ("a per-run knob bounds drift within an invocation only, and drift across invocations…", REQ:495-497); §5 uses it for one A6 episode on one wave (REQ:213); NFR-4 as restated uses it for one dispatch→verdict window (REQ:471-472). The round's edit did not create the overload but made NFR-4 and the §5 config row depend on it, which is how F-23 became invisible to the edit. Fix alongside F-23: one term per referent — *run*, *A6 invocation*, *attempt/dispatch*. | §7 NFR-4, §5, §7 R-3 |

## Questions

| ID | Question |
|----|---------|
| Q-06 | For F-23: is the intended product bound per-attempt (describe HEAD) or per-episode (change HEAD)? If per-episode, that is new behaviour in a REQ that otherwise only compresses shipped behaviour, and it needs a BL/M row plus an FSPEC obligation rather than an NFR sentence. |
| Q-07 | For F-22: should the ledger-skip run (`orchestrate-dev.js:14267-14283`) be excluded from the population by name, so the exclusion is checkable rather than inferred from "executes a wave"? |

## Positive Observations

- The carve-out deletion in NFR-4 is correct and well-argued: HEAD performs no subtraction, and the "structural, the gate runs between invocations" phrasing (REQ:472-474) is the right way to say why none is needed. The false `attemptBudget`-starvation rationale is fully gone, not softened.
- The §5 config row (REQ:214) and NFR-4 now say the same thing as each other; the previous round's table/NFR divergence is resolved.
- BL-06 (REQ:562) was widened to measure the carrier exclusivity, so the F-19 claim is not merely asserted in prose — it acquires a pre-FSPEC measurement obligation. That is the right instinct even though F-22 currently leaves it without a population to measure over.
- The mutual-exclusivity description at REQ:270-274 checks out exactly against HEAD's two arms (`:14041` vs the wave arm's `:14143`), including the non-obvious consequence that BL-04's carrier is unreachable in a both-absent run.

## Positive Observations

## Recommendation

**Needs revision** — three High findings. All three sit inside text this round's edit wrote, and all three are cheap to fix: one conjunct removed from AC-1.5's population (F-22), one word changed from "invocation" to "attempt/dispatch" in NFR-4, §5 and AC-2.4 plus an honest worst-case sentence (F-23), and one antecedent renamed in AC-4.1's conjuncts (F-24). No finding requires re-opening a decision, and none touches an unedited section other than F-25's vocabulary sweep.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 1, "low": 0}
