# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.4, 509 lines / 61,323 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v3 finding is closed, plus a scan of the text added or rewritten since v3 for new issues. Sections unchanged since v1/v2/v3 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `94e2137..bdf893e` (9 commits touching the REQ), plus the companion amendment `33bdf80` to `docs/_constraints/pdlc-rcv-catalogue.md`
**Date:** 2026-08-01
**Iteration:** 4

## Disposition of v3 findings

Four of five are **closed**, one of them (F-18) with the cross-document amendment I asked for made in
the same change. F-17 is **not** closed: the value it named as unreachable was replaced by a second
value that is also unreachable on this path, for a different reason, and is now filed forward as
F-22. Each finding was checked against the current text and, where it cites code, against HEAD.

| v3 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-17 | High | **Not closed — re-filed as F-22** | The unreachable disjunction is gone: AC-1.5(4) and §6 no longer say `resolved`-or-unset, `resolved` appears nowhere in the document, and the shipped enum is now quoted in full (*"no value outside the shipped enum `none \| unresolved \| written \| write_failed`"*). O-10's leg is now a single positive equality with step G's `unresolved` as the negative control — exactly the shape asked for. What did **not** get checked is whether the replacement value is the one the shipped code produces on this path. It is not: with `gatePostmortem` unset and no `postmortemStatus` carried on the thrown error, the halt catch's **third** branch probes `docs/{feature}/POSTMORTEM-{haltPhase}-{feature}.md` and calls an existing file `"written"` (`orchestrate-dev.js:4890`–`:4901`) — and on step 4's path that file exists by the path's own premise. See **F-22**. |
| F-18 | Medium | **Closed** | Both halves, and the cross-document half was done properly. AC-1.5(4) now says the entry emits *"row B's **unconfirmable-append variant** (§5, catalogue §3) — `notice` **empty**, no S-16, no S-4"*; §5's row B is redefined as *"the report row of a step-4 refusal, **in two variants**"* with `notice` = *"**S-16 alone** on the **validation-failure** variant and **empty** on the **unconfirmable-append** one"*; and `docs/_constraints/pdlc-rcv-catalogue.md` §3 was amended in the same change (`33bdf80`) to key row B to *"either because its reset region **failed validation** … or because an answering line's write could **not be confirmed**"*, keeping its count at three rows *"row B covering **two** entry classes"*. The distinguisher is named in both documents (*"told apart by §6's two ❌ texts"* / *"never by the `notice` cell alone"*), and O-10 now scopes each character-for-character assertion to an entry class (*"**row B's validation-failure variant**"*, *"**the unconfirmable-append entry**"*, negative controls *"for that entry class"*). One row identity, two variants, one rule for choosing. |
| F-19 | Low | **Closed** | AC-1.5(4) now reads *"they are **not** new catalogue ids, and §6's **three** refusal-render rows are the closed list of strings this REQ mints"*. The false exhaustiveness claim is replaced by a pointer to the registry, and the count agrees with §6's preamble (*"the three refusal-render rows"*) and with the three rows actually present. |
| F-20 | Low | **Closed** | AC-1.2 now states the observable rather than the implementation choice: *"The **observable**, not the implementation choice: on every production entry the admitted window is exactly `[W, windowEnd(W)]`, asserted at the seam that opens the round (O-10) — which a surviving reachable default fails whenever `W ≠ 1`."* O-10 carries the matching leg verbatim. The clause is now falsifiable and has a home. |
| F-21 | Low | **Closed as filed, re-filed as F-26** | The document is inside both limits (509 of 700 lines, 61,323 of 61,440 bytes) and the round was net −5 bytes while adding two behaviours, which is a real compression result. The *constraint* it was filed about is unchanged — 117 bytes of headroom — and it still governs how F-22 … F-25 must be made, so it is restated as F-26 rather than dropped. |

Q-06 is **answered** — see the Questions section. Q-04 and Q-05 are still open, and Q-04 has become
load-bearing rather than optional: it decides F-24.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
