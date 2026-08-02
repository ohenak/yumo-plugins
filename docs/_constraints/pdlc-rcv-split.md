# pdlc-rcv — the v2.0 altitude split, stated once

Shared record of the 2026-08-01 operator-directed split of `docs/pdlc-rcv-budget-stop/`'s v1.6 into
two documents at the **altitude** seam. Read by both halves — `REQ-RCV-01`
(`docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md`, the **window**) and `REQ-RCV-07`
(`docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md`, the **region's machinery**) — and cited
by both rather than restated in either.

## 1. What happened

Phase R ran five rounds without a dual approval and wrote
`docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md`. Its finding is precise: the
document **converged as a requirements artifact by round 2** — across ten reviews not one blocking
finding contests user need, scope, priority, phasing, the choice of three rounds or the reset-region
design — and every blocking finding from round 2 onward landed in **AC-1.5(4)'s machinery,
`REQ-RCV-01` §6's render rows and O-10's corresponding legs**.

- **Root cause 1:** the REQ was *specifying, at requirements altitude, the behaviour of shipped code
  it does not own and cannot change from inside a requirements document* — a claim a reviewer with
  the source open can falsify by reading one line further, answered by pinning one more fact,
  falsified one line further still.
- **Root cause 3:** the v1.1 split reduced the document's **size** and not its **altitude**, because
  *"splitting by topic does not separate the requirements-altitude material from the
  implementation-altitude material when both live in the same acceptance criterion."*

## 2. What moved, and where

The cut is at that altitude seam, not at a topic boundary.

| v1.6 clause | v2.0 home |
|---|---|
| AC-1.5(4)'s ordered algorithm, steps 1–5, and the `H − A ∈ {0, 1}` invariant with its stated domain | `REQ-RCV-07` **AC-7.1** |
| *A refusal is not a halt*, its four bullets, the step-G routing, the suppression of the shipped generic recovery line, the `postmortemStatus` mechanism | **AC-7.2** (renders in catalogue §4) |
| *Where `W`'s resolution runs*, and the three entry classes | **AC-7.3** |
| The sanctioned-repair table and the delete-an-answering-line table | **AC-7.4** |
| The answering line's byte confirmation, the torn-write and value-tear analysis, act 1 | **AC-7.5** |
| Row B, in two variants | **AC-7.6** |
| `REQ-RCV-01` §6's *Refusal phase-row text*, *Refusal recovery text*, *Unconfirmed-append text* | `REQ-RCV-07` §6 and catalogue §4 |
| O-6, and O-12's append-and-confirm half | `REQ-RCV-07` O-6, O-12 |
| O-10's algorithm, refusal, string, confirmation, row-B and placement legs | `REQ-RCV-07` O-10 |
| R-11 (a refusal costs a mid-window round) | `REQ-RCV-07` R-11 |

## 3. What stayed, and why that is the whole test of the cut

`REQ-RCV-01` §1–§4.1, AC-1.1, AC-1.2, AC-1.3, AC-1.4, AC-1.5(1)–(3) and (5), O-5, O-9, O-11 and the
O-10 legs that test them are exactly the material that drew **zero blocking findings after round 2**.
AC-1.5(4) keeps the clearance gate's three conjuncts, the answering-line append and its confirmation
*obligation*, and states *the region validates* as a **named predicate** with its fail-closed
outcome — delegating only the decision procedure (`REQ-RCV-01` X-06 / `REQ-RCV-07` X-07).

## 4. Consequences

1. **No `S-*` id changed, and none was minted.** The catalogue stays closed at seventeen; every id
   `REQ-RCV-01` owned at v1.6 it still owns (its §4), and `REQ-RCV-07` owns none. Where
   `pdlc-rcv-catalogue.md` §2 says *"AC-1.5(4)'s ordered algorithm"*, read `REQ-RCV-07` AC-7.1 — the
   delegation stated in `REQ-RCV-01` §4.
2. **No requirement id, AC id, threshold or user story changed meaning.** `REQ-RCV-07`'s criteria are
   numbered `AC-7.x` because they sit under a new requirement id, not because any clause was
   re-decided, and **every round-5 finding v1.6 closed remains closed** in whichever document now
   owns the material.
3. **`REQ-RCV-01` now carries no line citation and no claim about shipped control flow**, only `M-*`
   ids (its NB-4). That is root cause 1's remedy applied to the surface that generated it, and it is
   what makes the two documents reviewable independently — which the postmortem records as the thing
   five rounds of in-place revision could not achieve in one.

## 5. Paired edges: clauses that must be revised together

The split left **two-ended edges** — one clause in each half describing the *same* edge from its own
end. A revision to one end that is not carried to the other makes the two halves contradict each
other, and an implementer reading the wrong end implements the superseded decision. `O-*`, `R-*` and
`X-*` ids are **not** namespaced and do collide across the split, so every cross-document citation
must name the owning REQ.

| Edge | `REQ-RCV-01` end | `REQ-RCV-07` end | Obligation |
|---|---|---|---|
| The *region validates* decision procedure, and what happens before it ships | **X-06**, **R-14** | **X-07**, **R-16** | Revise all four **within the same revision**, in the same words, before that revision is submitted for review — the reviewer checks both ends **at HEAD**, not at a commit boundary. (Stated over the revision rather than the commit because the authoring pacing contract mandates one top-level section per edit and a commit after each, so an edit spanning two documents' several clauses is structurally more than one commit; a rule the authoring discipline forbids would keep being violated and reported as satisfied.) Both ends must agree on whether the conjunct is wired in the interim, on the queue distance between the two rows, and on what an interim procedure would cost. |
| The catalogue delegation of AC-1.5(4)'s algorithm, its steps and its renders | §4's pointer to §6 below | AC-7.1, §6 | The catalogue itself is edited **once**, by `REQ-RCV-07`, when the clauses become true of it. |

### 5.1 Why the validation conjunct is not wired before its procedure ships

Relocated from `REQ-RCV-01` X-06 (2026-08-01, round 8) so both ends of the paired edge cite one copy
of the argument instead of restating it; nothing changed meaning in the move. `REQ-RCV-01` X-06/R-14
and `REQ-RCV-07` X-07/R-16 state the **decision**; this states the **reasons** behind it.

- **Refusing horn.** An interim procedure that refuses what it cannot decide refuses on
  **non-emptiness** — and a region is non-empty exactly when the phase has halted (`REQ-RCV-01`
  AC-1.4 clause 1) — so the first halt of each phase would be terminal, `RESOLVED: yes` could not
  clear it (the marker is read *inside* the failing gate), no sanctioned repair exists until AC-7.4,
  and `MAX_REVIEW_ROUNDS` 3 produces *more* halts reaching that disabled path — including row 18's
  own Phase R, gating the replacement on not halting.
- **Granting horn.** One that grants what it cannot decide is the fail-open the conjunct exists to
  close.
- **The narrower procedure.** One deciding only what `REQ-RCV-01` AC-1.5(4) specifies (well-formed
  answering lines, `H − A ∈ {0, 1}`) escapes both horns, but must still disagree with AC-7.1 on
  ordering and highest-round analysis, and a disagreement in the **refusing** direction is
  unclearable for the same reason, until AC-7.4 ships.
- **Co-delivery** under a `depends-on` edge was rejected because it would make `REQ-RCV-01`'s
  unconditional saving wait on a successor it does not need as a requirement.

Leaving the conjunct unwired is therefore the only interim whose behaviour is **HEAD's**. The cost,
stated: R-10's hand-edited-region fail-open stays open until row 18 — operator-caused,
operator-visible, and no wider than HEAD's, where it is open unconditionally.

### 5.2 Why validation is a conjunct of the gate, not merely a constraint on `W`

Relocated from `REQ-RCV-01` AC-1.5(4) (2026-08-01, round 9) so both ends of the paired edge cite one
copy; nothing changed meaning in the move. `REQ-RCV-01` AC-1.5(4) states the **claim**; this states
the **arithmetic** behind it, which both halves depend on and neither restates.

- **Were validation only a constraint on `W`**, two `HALT-REASON:` lines and one *invalid*
  `WINDOW-START:` would give `A < H`, so the loop would write an answering line and consume the
  clearance while `W` is still 1 — permanently, since the region is preserved by every later halt.
- **`H − A ≤ 1` is the invariant** that AC-1.5(4)'s *exactly one answering line* relies on: without a
  stated domain, two `HALT-REASON:` lines and no answering line pass every value-level check
  vacuously, and the loop grants `H − A − 1` windows beyond the one paid for, every invocation,
  fail-**open**.

## 6. The catalogue delegation, stated once

Relocated from `REQ-RCV-01` §4 (2026-08-01, round 8) so both halves cite one copy; no clause changed
meaning in the move.

`pdlc-rcv-catalogue.md` §2's **S-12**, **S-13**, **S-14** and **S-16** rows describe their receive
side as *"AC-1.5(4)'s ordered algorithm"*. That algorithm is **`REQ-RCV-07` AC-7.1**, which
`REQ-RCV-01` AC-1.5(4) names as its predicate's decision procedure (`REQ-RCV-01` X-06 / `REQ-RCV-07`
X-07). **Ownership of the ids is unchanged and the catalogue is untouched**: read **every catalogue
reference to AC-1.5(4)'s algorithm, its numbered steps, or the refusal renders it produces** as
`REQ-RCV-07` AC-7.1 — renders as that REQ's §6 and catalogue §4. The rule is over the references, not
one phrase, because the four rows word them differently, and it reaches catalogue **§3**'s row schema
on the same terms: its *"AC-1.5(4)'s step-4 path"* is AC-7.1 step 4's, and its *"fixed by
`pdlc-rcv-budget-stop` §6"* is `REQ-RCV-07` §6's, since `REQ-RCV-01` mints no operator string (its
§6). The catalogue may say so directly once `REQ-RCV-07` ships.
