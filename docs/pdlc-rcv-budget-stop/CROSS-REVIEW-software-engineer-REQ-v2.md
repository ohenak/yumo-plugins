# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.9, 403 lines / 61,439 bytes)
**Date:** 2026-08-01
**Iteration:** 2 (delta re-review of v2.9 against the v2.8 I reviewed at v1; base commit `932860d~1`)
**Scope:** Technical lens only — feasibility, implementability, integration risk, threshold declaration, existing-code claim verification. Not product strategy, not test-pyramid choices, not fixture construction.

## Disposition of v1's findings

All seven are closed. I verified each against the changed text, not against the commit message.

| v1 | Severity | Status | Evidence in v2.9 |
|---|---|---|---|
| F-01 | High | **Closed** | AC-1.2 now excludes "every artifact `build-runtime.mjs` derives from that declaration" by name (`pdlc/workflows/dist/`, `.claude/workflows/`), quantifies *one* over **hand-maintained** executable declarations, and adds the fifth class *generated copy rebuilt by O-11* to the enumeration. §6's `MAX_REVIEW_ROUNDS` row and O-13(b) carry the same five classes, and O-13(b) now names both bundles explicitly. The count is decidable on the day the change ships. |
| F-02 | Medium | **Closed** | **NB-6** dispositions the zero-round *creating* halt's authored content as correct-and-known-accepted, states what the operator does get (AC-1.3's render with `rounds run 0`, plus the `HALT-REASON:` line), and routes a prompt change to N-4 as a new REQ. §2's cost claim is amended to match — "the **first** such halt still authors one, at the ordinary cost of a halt (NB-6)". |
| F-03 | Medium | **Closed** | AC-1.4 clause 3 now says the loop writes the section "on every halt in scope, creating halt and re-halt alike", overwriting whatever the agent emitted, **"Not the agent's"**, with the heading anchor and the not-found append disposition both declared. AC-1.3 and O-14 say the same. O-10 leg (i) is therefore falsifiable against production, and split §5.4 states the three fixtures. |
| F-04 | Medium | **Closed** | AC-1.3 names the per-reviewer verdict list as a fourth quantity and fixes it **empty** on a zero-round halt; AC-1.5(1) row C repeats it cell-by-cell; O-10's row-C leg and O-14 both receive it. |
| F-05 | Medium | **Closed as filed, re-raised as F-02 below** | The relocations happened and are real (§4.1's rows → baseline §3.2; O-10's fixtures and the pickup-order derivation → split §5.1/§5.4; §6's S-13/S-14 restatements collapsed), and this round's fixes did land. But the freed bytes were spent to the last one: 61,439 of 61,440. |
| F-06 | Low | **Closed** | §3.1 now names `precheckDependencies` and its `Order`-ordered candidate walk, cites split §5.1 as the home, and states why NB-4's `M-*` discipline does not reach a queue-driver claim. Split §5.1 line 87 carries the derivation. |
| F-07 | Low | **Closed** | §6 now reads "exactly **one** operator string **not already rendered by the catalogue**", with the parenthetical fixing S-4 as owned-but-not-minted, catalogue §2's render, unamendable here. |

## Findings

Two blocking, both about material **added in this round**. Nothing in the unchanged body is re-litigated.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **AC-1.4 clause 1's new confirmation obligation creates a refusal path that is in force at *this* ship and has no operator-visible surface owned by any document.** The clause is new in v2.9 and its failure disposition is "the halt is not recorded as taken, the entry **refuses the phase** and reports it." Three problems compound. (a) **No string owns it.** §4 states this REQ "mints no **refusal** string" and NB-3 routes "which strings a refusing entry emits" to `REQ-RCV-07`. But `REQ-RCV-07` AC-7.6 (`docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md:374-375`) is stated over "an entry that refuses under **AC-7.1 step 4 or AC-7.5**" — region-validation failure and the **answering-line** append. A lost `HALT-REASON:` append is neither. Catalogue §4's ❌ text is literally `Refused — answering line unconfirmed at {path}`, fixed *character for character* and registered **read-only** in `REQ-RCV-07` §6 (`:411`) — it names the wrong line. So no row, no ❌ text, no notice. (b) **The timing is inverted.** AC-1.5(4)'s answering-line refusal is explicitly **target state, X-06-gated**, not in force until row 18; AC-1.4 carries no such gate, so this refusal is live at *this* ship while every render it could borrow ships three features later. (c) **`REQ-RCV-01`'s own consistency claims now read false**: §10 asserts "v2.9 carries no change to that edge — its relocations are into split §5.4 and baseline §3.2, neither of which the edge reads", yet this obligation reaches AC-7.6's variant taxonomy, which *is* the paired edge, and §10's own rule requires a revision to either end carried to the other **within the same revision**. **Consequence for the operator** is the exact failure §6's S-16 row exists to prevent — a "silent permanent halt": an IO fault the loop cannot distinguish from anything else refuses the phase every entry, forever, with nothing written and nothing said. Split §5.4 leg (iii) says "exactly one notice" without naming which. **Cheap fix, and it is a REQ-altitude decision, not an oracle:** state in AC-1.4 clause 1 which surface the operator reads **at this ship** — either (i) this refusal reuses row B's unconfirmable-append variant with catalogue §4's ❌ text generalised from *answering line* to *region line*, in which case say so and carry the edit to `REQ-RCV-07` AC-7.6 and catalogue §4 in the same revision per §10, **and** say what is emitted before row 18 lands; or (ii) name it as this REQ's one exception to §4's no-refusal-string rule and put the render in §6. | AC-1.4 clause 1, §4, §6 S-16 row, §10, NB-3, split §5.4(iii) |
| F-02 | Medium | Cross-Feature | **The size constraint is not relieved; it is at 1 byte.** 61,439 of the 61,440-byte hard ceiling `check-req-size.sh` enforces (99.998%), against 61,198 at v1 — the relocations were real but every freed byte was re-spent, so the class-D signature the predecessor post-mortem's root cause 2 identifies is *worse*, not better. This is not a stylistic point: F-01's fix is prose that must be **added**, and at 1 byte of headroom the document again determines *how* a finding may be closed rather than the finding determining it — the recorded failure mode where a compression pass deletes a reason instead of a restatement. Two targets are mechanical and cost no argument: **the v2.9/v2.8/v2.6 revision narrative at lines 25–27 is 1,542 bytes of round-by-round history**, which §10's closing paragraph already declares this document deliberately does not carry ("citing round files would be structurally wrong") — collapse it to a one-line "current version, what it decided" and the history is gone with nothing lost; and **§4.1's second paragraph (lines 95–96, ~600 bytes) restates NB-5** almost verbatim (harvest deletes the post-mortem ⇒ `W = 1`, `H = A = 0`, the default of a feature that never halted), so one of the two can become a cross-reference. Together that is >2 KB. Per R-5 / pm-author rule 5e, do this **before** F-01, not after. | header lines 25–27, §4.1, §10 |
| F-03 | Low | Local | **AC-1.5(2)'s "always inside `{W … W+2}`" is false in general and could be implemented as a clamp.** The sentence reads "the start is the later of the two, always inside `{W … W+2}` and never below it". The *never below* half is the load-bearing one and is correct. The *always inside* half is not: split §5.4 leg 4's own control fixture has `W = 4`, highest existing round 6, derived start **7** — outside `{4,5,6}`, which is exactly why that fixture halts. Read charitably the clause is scoped to the case under discussion; read literally it invites an implementer to **clamp** the start into the window, which would dispatch a round on an exhausted window — a widening. **This is unchanged text I did not flag at v1**, so I am not blocking on it; deleting three words closes it whenever the document is next touched. | AC-1.5(2), split §5.4 leg 4 |
| F-04 | Low | Local | **NB-6 restates HEAD's post-mortem prompt section-by-section, which NB-4 says belongs in the baseline.** NB-6 enumerates "Phase, Iterations, Reviewers, Pattern of Disagreement, Root Cause, Recommendation over the phase's cross-review files" and cites M-7e — but M-7e records only "bare `Write ${postmortemPath}.` prompt **plus section list**" and does not enumerate the sections, so the enumeration is this document's own claim about shipped code, the thing NB-4 exists to forbid. **I verified it and it holds** (`9486c81:1727`, `Include the required sections: Phase, Iterations (${MAX_REVIEW_ROUNDS} — limit reached), Reviewers, Pattern of Disagreement, Best-Guess Root Cause, Recommendation.`) — and note the baseline's own name is *Best-Guess Root Cause*, which NB-6 abbreviates. Either extend M-7e's evidence column with the section list and cite it, or drop the enumeration to "HEAD's section list (M-7e)". | NB-6, NB-4, M-7e |

## Questions

_(filled below)_

## Positive Observations

_(filled below)_

## Recommendation

_(filled below)_

## Verdict

_(filled below)_
