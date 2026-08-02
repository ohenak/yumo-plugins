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

### 5.3 Why a refusal is not a halt

Relocated from `REQ-RCV-01` AC-1.5(4) (2026-08-01, round 9); nothing changed meaning in the move.
`REQ-RCV-01` AC-1.5(4) states the **rule** (the entry returns without running the rest of AC-1.5);
`REQ-RCV-07` AC-7.2 states the **refusal** in full; this states why the two cannot be the same act.

Left running, `REQ-RCV-01` AC-1.5's clause 1 would halt on the budget path, and its AC-1.4 governs
**every** halt — so that halt would append its own `HALT-REASON:` (`H += 1`) and strip the operator's
`RESOLVED:`, spending the clearance it declined to spend and converting a repairable region into an
unrepairable one. The refusal therefore takes no halt and leaves the marker in place.

### 5.4 The three interim-composition legs, stated once

Relocated from `REQ-RCV-01` O-10 (2026-08-01, round 10) so both ends of the split cite one copy —
`REQ-RCV-07` O-10 receives the non-validating legs and leg 3's inversion, so the fixtures are read
from both ends; nothing changed meaning in the move. `REQ-RCV-01` O-10 states which legs it owes and
why (the 0-call contract leg is asserted on leg 1); this states the fixtures and their asserted
dispositions.

**Why the 0-call contract leg sits on leg 1** (relocated from `REQ-RCV-01` O-10, 2026-08-01 round 2 of
the reset window; nothing changed meaning). Leg 1 is the only interim fixture that defeats **both**
decidable conjuncts, hence the only one a **wired** implementation answers differently — so it is the
interim ship's *only* falsifiable oracle for X-06: without it, *"deliberately not consulted"* and
*"wired with an ad-hoc interim procedure"* (§5.1's granting horn) pass every other leg identically.
It is asserted as a **count of 0 calls**, not an absence, and it is a **contract** leg — replaced,
not deleted, when row 18 wires the call.

**The counting rule both ends read:** `H` and `A` are counted **by line prefix, whatever the
value** — a malformed `WINDOW-START:` value contributes no origin (`REQ-RCV-01` §6) but still
answers a halt (`REQ-RCV-01` AC-1.5(4) clause 4). `REQ-RCV-07` AC-7.1 step 3's `H − A ∈ {0, 1}`
check reads the same count, so it is stated here once rather than at either end.

*Leg 1, well-formed non-empty region:* one `HALT-REASON:` line, no answering line (`H = 1`, `A = 0`), a readable `RESOLVED: yes`, and highest round on the branch = `windowEnd(1)` = **3** ⇒ the entry **grants** — exactly one `WINDOW-START: 4` appended at the end of the region, `A = H = 1` after, **no** `reset-region-corrupt` notice, no refusal and no ❌ row, and **≥ 1** reviewer dispatch. *Leg 2, no region at all:* `H = A = 0`, highest round below `windowEnd(1)` ⇒ `W = 1`, the ordinary window opens — **no** refusal, **no** S-16, **no** answering line written, both counts still `0`, and **≥ 1** dispatch. *Leg 3, a malformed answering-line value* — decidable at row 10 from §6's grammar alone, which is why it is this REQ's: one `HALT-REASON:` line, one `WINDOW-START: abc` (equally `-2`, or empty), a readable `RESOLVED: yes` and — as in leg 2 — **highest round below `windowEnd(1)`**, since a fixture about the *origin* must leave the window open or the budget halt masks what it exists to pin ⇒ the malformed line **still counts toward `A`** (AC-1.5(4) clause 4: counted by line prefix, whatever the value), so `A = H = 1` and no clearance is observed; it contributes **no value**, so `W` = **1**, never `NaN` into `windowEnd` or `deriveRoundWindow` (AC-1.2, O-12). The ordinary window `[1, 3]` opens — **no** refusal, **no** S-16, **no** answering line, counts unmoved, **≥ 1** dispatch. Unlike legs 1 and 2 it is **interim-only and inverts at row 18**, where AC-7.1 step 4 refuses this fixture with `invalid-window-start`; it is marked as such so that commit replaces it rather than deleting an assertion it cannot explain. What it pins today is the one thing both wirings must agree on: `W` is a decimal integer.

### 5.5 Why the answering line is recorded before dispatch, and why every clearance is answered

Relocated from `REQ-RCV-01` AC-1.5(4) and (5) (2026-08-01, v2.7) so both ends cite one copy of the
argument; nothing changed meaning in the move. `REQ-RCV-01` states the **rules** — the line durably
exists before any round of that entry is dispatched, and *every* clearance is answered by exactly one
line, `WINDOW-RESUMED:` on the S-11 path included; `REQ-RCV-07` AC-7.5 states what a partially-landed
line leaves behind. This states the reasons behind them.

- **The ordering.** An entry that records the line and then dies before dispatching has spent the
  clearance while the window at `N` is intact, so the next entry runs those rounds — a bounded loss of
  nothing. Recording it last loses the record of a window already **used** and re-grants it, which is
  the fail-open the criterion exists to close. Fail toward the recoverable direction.
- **Answering the S-11 clearance.** With nothing written on that path the clearance stays unanswered
  forever, so the **next** halt of any kind banks a free window on a marker written for an unrelated
  authoring failure — *k* authoring failures, *k* free windows. `WINDOW-RESUMED: {W}` keeps the
  intent — origin unmoved, spent rounds spent, no window charged — while restoring `A = H`.

### 5.6 Why a re-halt strips the marker and does not re-author the post-mortem

Relocated from `REQ-RCV-01` AC-1.4 (2026-08-01, v2.8) so both ends cite one copy; nothing changed
meaning in the move. `REQ-RCV-01` AC-1.4 states the **rules** — a halt finding an existing
post-mortem preserves the region and appends its own `HALT-REASON:`, strips every unfenced
`RESOLVED:` line, refreshes the Iterations section, and changes nothing else. `REQ-RCV-07` AC-7.1
reads the region those rules maintain. This states the reasons.

- **Why not re-author.** The operator's `RESOLVED: yes` answers a *specific* `## Recommendation`, and
  re-authoring would replace it with one written from **zero rounds of new evidence** — the commonest
  new case. That case must also stay cheap: an authoring dispatch on an entry that dispatched no
  reviewer spends roughly a review round against a value claim stated in dispatches.
- **Why the Iterations section is nonetheless refreshed.** It is a loop-computed two-integer render,
  not an authoring dispatch, and leaving it stale would show the operator the *previous* halt's
  rounds-run on exactly the entry `REQ-RCV-01` AC-1.3 promises reports this one's.
- **Why the strip.** `RESOLVED:` is a single-valued, human-owned, fail-closed marker, never a counter.
  Preserved, it makes the next halt's post-mortem read as already resolved, so that halt has no
  durable effect; a *second* marker reads as duplicated, hence permanently unresolved. Those are the
  alternative's only two reachable states, and they fail in opposite directions. Removing a spent
  marker is not writing one, so the human-only prohibition is untouched.
- **Why the creating halt is stated too.** Scoped only to a halt finding an existing post-mortem, the
  first halt would be governed by nothing: no region ⇒ `H = 0` ⇒ the gate `A < H` is false ⇒ the
  operator's **first** clearance is silently swallowed.

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
`pdlc-rcv-budget-stop` §6"* is `REQ-RCV-07` §6's, since `REQ-RCV-01` mints no **refusal** string (its
§6) — the clause being redirected is row B's ❌ refusal text. Worded that way from `REQ-RCV-01` v2.7
onward, which added one non-refusal operator string of its own (AC-1.3's Iterations render), so
*"mints no operator string"* is no longer true of that REQ even though the redirect is. The catalogue may say so directly once `REQ-RCV-07` ships.
