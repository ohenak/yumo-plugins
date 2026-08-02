# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/FSPEC-pdlc-rcv-budget-stop.md` (v1.1)
**Date:** 2026-08-02
**Iteration:** 2
**Scope:** Local — delta re-review against `2462079` (the commit v1 reviewed). Verified closure of F-01…F-07 and scanned only the sections the revision touched: §3.1 (B-BUD-3 observable), §5.4 (B-REG-7 observable), §6.1 (B-CLR-2/2a), §8.3 (step-G row), §10 (E-1b, E-7), §11.1–11.6 (AT rows added/rewritten), §12 (a, d–f), §13.1. Not re-reviewed: §5.1–5.3, §6.2–6.3, §7, §8.1–8.2, §9 — unchanged and approved at v1.

## Prior findings — disposition

| v1 ID | Sev | Status | Evidence I checked |
|---|---|---|---|
| F-01 | High | **Closed** | AT-BUD-03 is gone; §3.1 now states the discriminating observable and §11.1 splits it. AT-BUD-03a is structural (Phase DOD's bound appears in §3.2's enumeration under *deliberately pinned non-budget literal*, never under *the declaration* / *read from it*, and the two declarations are distinct) and AT-BUD-03b is behavioural under a **varied** `BUDGET`, with **both** legs required — vary `BUDGET`, DOD's count is unchanged; vary DOD's own declaration, it moves. That pair does falsify "Phase DOD reads `BUDGET`" while both values are `3`, which the round-count oracle could not. The FSPEC also states *why* the count cannot substitute, so the defect cannot be reintroduced by a later simplification |
| F-02 | Medium | **Closed** | B-CLR-2 now carries the guard `D ≤ E` (`E = W + BUDGET − 1`) and B-CLR-2a dispositions `D > E` as a **fresh window**, with a stated rationale that removes the state rather than accepting it. §12(a) is scoped per branch and the `WINDOW-RESUMED:` leg now rests on B-CLR-2's own guard rather than the false `N = max(D, W)` argument. I re-derived both new AT rows: AT-CLR-02 (`W=1`, highest 1 → `D=2 ≤ E=3`) resumes; AT-CLR-02a (highest 3 → `D=4 > E=3`) writes `WINDOW-START: 4`. Arithmetic checks. E-7 updated consistently |
| F-03 | Medium | **Closed** | E-1b states the disposition explicitly — **accepted cost, two clearances for the first window, once per pre-feature post-mortem** — and argues *why* honouring the pre-feature marker is refused (it would mint an `H` the region never recorded, against BR-10/BR-12). AT-CLR-08 covers it. I re-derived it: first entry `H=A=0` → gate closed → `W=1`, `E=3`, `D=6 > 3` → zero rounds, region created `H=1, A=0`, marker stripped; second entry `A=0 < H=1` → `WINDOW-START: max(6,1) = 6`. The row's numbers are right |
| F-04 | Medium | **Closed** (one residue → F-08) | §5.4 replaces the 0-consultation claim with two conjuncts — a **positive** same-branch equivalence over a family of would-fail-validation regions, plus an **empty enumeration of consultation sites** (structural, decidable while no callable exists) — and demotes the absence conjuncts to "the weaker half". That is a falsifiable oracle against an ad-hoc **inline** interim procedure, which the count was not. AT-REG-07 carries it. The fixture-pairing rule has one contradiction, filed below as F-08 |
| F-05 | Medium | **Partially closed** (→ F-09) | AT-CLR-04's Given now pins `W = 1`, highest existing round 1, and the parenthetical states why the window must be open. That closes the case I named — the *pre-entry* exhausted window. It does not close the case one round later: entry 1 dispatches rounds 2–3 and, if those rounds do not converge, **budget-halts, appends a `HALT-REASON:` and strips the marker**, so entry 2 meets B-CLR-5's step-G refusal and "nothing is appended on either entry" is false. The prescription was mine and the author followed it exactly; the residue is a family defect, filed at Low as F-09 |
| F-06 | Low | **Closed** | §8.3 states "the shipped step-G refusal (B-CLR-5) emits no row at all — it is not row B", closes row B's source list, and AT-CLR-05 / AT-WIN-07 both gain the *no row B* conjunct. New AT-RPT-07 pins it from the report side |
| F-07 | Low | **Closed** | AT-RPT-06 now runs **all three** unconfirmable-append fixtures and asserts the ❌ texts are **pairwise distinct**, all three `notice` cells empty, so the discrimination is never by that cell. The `Then` states the purpose, so a later split cannot silently drop the three-way comparison |
| Q-01…Q-03 | — | **Answered** | §12(d) a zero-round entry's report carries row C **and nothing else**, with the reason; §12(e) a second `Iterations` heading is left **byte-unchanged**, accepted, tied to AT-HALT-02's *unchanged elsewhere*; §12(f) AT-HALT-02's expected file is a **checked-in golden**, explicitly not derived in-test. All three are the answers that make the oracles falsifiable rather than the convenient ones |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
