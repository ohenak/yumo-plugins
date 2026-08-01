# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.4, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 4
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. The baseline reviewed at v3 was the REQ as of `94e2137`; this review
covers `94e2137..HEAD` on that file, plus the same-change amendment to
`docs/_constraints/pdlc-rcv-catalogue.md` (`33bdf80`). Sections unchanged since v3 were not
re-litigated.

## 1. Disposition of the v3 findings

All five v3 findings are **closed**, and the High was closed by the resolution I recommended —
amending the shared catalogue rather than minting a row here.

| v3 id | Sev | Status | Where it closed, and what was checked |
|---|---|---|---|
| **F-01** | **High** | ✅ closed | Option (i), carried through in the same change (`33bdf80`). `docs/_constraints/pdlc-rcv-catalogue.md` §3 now reads *"**Three rows have no dispatch behind them** — row B covering **two** entry classes, both dispatch-less"*, defines row B as *"the row of an entry that opens no round on `pdlc-rcv-budget-stop` AC-1.5(4)'s step-4 path — either because its reset region **failed validation** … or because an answering line's write could **not be confirmed**"*, and states *"B carries **S-16 alone on its validation-failure variant and an empty `notice` on its unconfirmable-append variant**"*, plus the discriminator *"told apart by the ❌ phase-row text … never by the `notice` cell alone."* The four consequential edits I listed all landed: §5's row-B paragraph is now *"in two variants"* with the `notice` cell split and the `round` cell's justification scoped (*"**never** from `W` (1 on the validation-failure variant, unchanged on the unconfirmable-append one — neither is this cell)"*); AC-1.5(1)'s *"the **third** dispatch-less row"* for row C is now correct against the amended catalogue (three rows, A/B/C, row C third); §2's *"the two no-round rows"* is still true of **rows**; and O-10 splits its leg into *"row B's **validation-failure variant**"* and *"**the unconfirmable-append entry**"*. I checked the catalogue amendment against the rest of the family: no other document cites row B (`grep -rn "row B" docs/` finds only the catalogue, this REQ and the discarded predecessor), so nothing else was falsified by widening it. |
| **F-02** | Medium | ✅ closed | The recovery text is now pinned by identity rather than by the bare word *re-run*: *"its recovery text is the **shipped generic** *'set the `{feature}` row in `docs/_queue/QUEUE.md` back to pending, then re-run the queue'* (`orchestrate-dev.js:4926`), reused **on this path alone**"*, with the asymmetry argued (*"step 4 has already written that row `halted`, so resetting it is the whole repair — the opposite disposition to the corrupt-region row"*). The citation is right: `:4926` is an unconditional `emit` in the halt catch. O-10 gained the leg — *"— deliberately, on this class alone — the shipped generic queue-reset string as its recovery text"* — and, crucially, scoped the corrupt-region negative controls *"**for that entry class**"*, without which the two legs would have contradicted each other. That scoping was not in my ask; it was needed and it was spotted. |
| **F-03** | Medium | ✅ closed (with a residue — F-03 below) | The torn write is named as a third outcome: *"**Three** outcomes, all safe … the write **tore** (a truncated line, a value without its newline) ⇒ the next entry reads a step-2 value fault ⇒ S-16 `invalid-window-start`/`invalid-window-resumed` ⇒ the *corrupt-region* refusal, its texts, and the sanctioned … repair"*, closing with *"only the torn write needs an operator, and it says so on the next entry"* — which is exactly the operator-experience statement I asked for, and O-10 carries the sequel as its own leg. The finding is closed; what the new sentence introduced is a smaller repair-vocabulary contradiction, filed fresh as F-03. |
| **F-04** | Low | ✅ closed | §6's *Unconfirmed-append text* row now cites rather than restates: *"Not a catalogue id (AC-1.5(4))"*, and the row's remaining content is threshold data (the pinned string, `{path}`'s derivation, which recovery text applies). |
| **F-05** | Low/Process | ✅ observed; constraint still live | 509 lines / **61,323 bytes** against 700 / 61,440 (`check-req-size.sh:40`–`:41`) — **117 bytes** of headroom, five bytes better than v1.3 despite the row-B split, because the catalogue absorbed the new prose exactly as F-05 predicted it would. Re-filed as F-04 below, unchanged in kind: it is a constraint on how this round's edits are made, not a finding against content. |

## 2. Disposition of the v3 questions

| v3 id | Status | Note |
|---|---|---|
| **Q-01** (was a single in-entry retry of the confirmation read considered and rejected?) | Still unrecorded | R-11's gloss is unchanged and the unconfirmable path still halts an unattended queue on a transient read. I said I was not filing it and I am not filing it now either — but it is the only place in this document where a *transient* fault takes the same exit as a fault only a human can repair, and one clause in R-11 would record the choice. Carried, not escalated. |
| **Q-02** (is `W` guaranteed not to be emitted on a refusing entry?) | Still unanswered, and now slightly larger | AC-1.5(4) still says the unconfirmable entry keeps `W` at *"its prior value"*, and §5's row-B `round` cell now says explicitly that `W` is *"unchanged on the unconfirmable-append one — **neither is this cell**"*, which is the right disposition for the row but still does not say `W` is invisible everywhere on a refusal. Inert today; a half-sentence would close it for `pdlc-rcv-fixed-point-stop`'s author, who states both tests over `W`. |
| **Q-03** (is `{path}` in the unconfirmed-append string the same post-mortem path S-16 fixes?) | ✅ answered in the document | §6's row now reads *"`{path}` the same repo-root-relative post-mortem path S-16 fixes"*. Checkable without inference, which is what I asked for. |

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
