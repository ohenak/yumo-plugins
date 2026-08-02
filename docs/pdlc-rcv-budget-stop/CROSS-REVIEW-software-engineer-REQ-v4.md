# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v3.1, 401 lines / 61,311 bytes)
**Date:** 2026-08-02
**Iteration:** 4 (delta re-review of v3.1 against the v3.0 I reviewed at v3; base commit `2f3cfd9`, head `18faa48`)
**Scope:** Technical lens only — feasibility, implementability, integration risk, threshold declaration, existing-code claim verification. Not product strategy, not test-pyramid choices, not fixture construction.

## Disposition of v3's findings

The single blocker is closed, both Lows are closed or held per my own pre-commitment, and both
Questions were answered. I checked each against the changed bytes and against the three paired
documents at HEAD, not against the commit message.

| v3 | Severity | Status | Evidence in v3.1 |
|---|---|---|---|
| F-01 | High | **Closed** | Closed by option (b), and closed *better* than option (a) would have. *The ordering and its report* now reads "**two** confirmed loop writes, not three, because **clauses 1 and 2 are one update of one file**: after a halt in scope there is **no reachable state in which this halt's `HALT-REASON:` line is present and an unfenced `RESOLVED:` line survives**". That removes the fail-open state rather than dispositioning it, which is the stronger of the two answers I offered: with the state unreachable there is no "unconfirmed strip" to give a refusal render to. The consequential edits are all present and all correct: clause 2 is explicitly said to owe no separate disposition ("its confirmation is clause 1's — this halt's line present in the region **and** no unfenced `RESOLVED:` line left in the file — and its failure is clause 1's failure"); the refusal sentence is re-quantified over "an unconfirmed write of 3, or of the 1-and-2 update"; the reason is relocated to new split **§5.8**, which states my v3 F-01 trace back verbatim in the right direction (marker readable, `A < H`, window granted, re-granted every halt while a persistent fault lasts) as the *reason the rule exists*; O-5 receives "the **one-update rule** over clauses 1 and 2 — the strip has no failure mode of its own to specify"; and split §5.4 leg (iii) is rewritten into **two discriminated fixtures** whose fixture A says "nothing is stripped because clauses 1 and 2 are **one update** and the update did not land". Every site I named in the "exactly what must change" list moved. |
| F-02 | Low | **Closed** | Catalogue §4's *Residue disposition* cell no longer reasons only about a torn answering line. It now carries "**The other two sources' residues, added 2026-08-01 with the `{which}` discriminator**" and states the torn `HALT-REASON:` residue in exactly the terms I named — carries no origin so nothing moves down, still parses as S-15 and **over-counts `H`**, making `A < H` true against a clearance nobody spent — routes its disposition to `REQ-RCV-07` AC-7.5 via NB-3, and adds the third source's residue (a torn Iterations rewrite, region-external and benign, with both tear shapes worked). More than I asked for. |
| F-03 | Low | **Open, and I am not blocking on it** — see F-03 below. Headroom went **687 → 129** bytes of 61,440. I pre-committed twice not to block on the ceiling and I am keeping that. |
| Q-01 | — | **Answered, at the catalogue rather than in the REQ.** My question was whether an implementer reading clauses 3-then-1 in numeric order could place the Iterations heading below `## Reset Region`. Catalogue §4's recovery cell now states the ordering fact explicitly for the operator — "clause 3 runs *before* clause 1 (`REQ-RCV-01` AC-1.4's clause order), so no region line was attempted and every line present belongs to an earlier, confirmed write" — which is the same fact, load-bearing for a different reader, and it makes the order impossible to read the other way. Acceptable; the REQ parenthetical I suggested is now redundant. |
| Q-02 | — | **Answered.** R-14 goes from **two** residuals to **three**: "(iii) **from this ship, so do AC-1.4 clause 1's own `HALT-REASON:` appends**", with the bound stated ("each line still answers or records exactly one halt") and the tear routed ("a **torn** one is AC-7.5's (NB-3), which ships with the procedure"). That is precisely the gap I described — this REQ starts writing region lines at row 10, eight rows before the procedure that disposes of a torn one. |

## Findings

*(pending)*

## Questions

*(pending)*

## Positive Observations

*(pending)*

## Recommendation

*(pending)*

## Verdict

*(pending)*
