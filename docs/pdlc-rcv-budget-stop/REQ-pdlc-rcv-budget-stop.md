---
feature: pdlc-rcv-budget-stop
ready: true
depends-on: []
---

# REQ — pdlc-rcv-budget-stop

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the measured facts `M-*`, the declared thresholds (§3, this REQ's row notes at §3.1), the window-accounting quantities' durable homes (§3.2) and the shared non-goals `N-1 … N-10`. **Read it first.** Facts are cited by id (`M-1d`), never restated. |
| Shared split record | `docs/_constraints/pdlc-rcv-split.md` — the v2.0 altitude split, what moved, and the **paired edges** this REQ and `REQ-RCV-07` revise together (§5), the shared arguments — *why the validation conjunct is unwired* (§5.1), *why validation is a conjunct of the gate* (§5.2), *why a refusal is not a halt* (§5.3), the three interim legs (§5.4) — and the catalogue delegation (§6). |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — the family vocabulary (§1), the closed catalogue `S-1 … S-17` (§2) and the run-report row schema (§3), used by reference. |
| Predecessor | `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` v1.8 (**superseded 2026-08-01**) — this REQ carries its REQ-RCV-01 unchanged in substance. Its REQ-RCV-02 moved to `docs/pdlc-rcv-fixed-point-stop/` at v1.1 of this document; see §10. |
| Siblings | `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` (**REQ-RCV-07**) — **the implementation-altitude half split out of this document's v1.6 on 2026-08-01** (§10); `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` (REQ-RCV-02) — the successor that depends on this one; `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04); `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-pdlc-review-loop-hardening.md` (v1.0) root causes 2 and 3; `docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md` (v1.0) root causes 1 and 3; operator direction of 2026-07-29 and 2026-08-01 |
| Downstream | `FSPEC-pdlc-rcv-budget-stop.md`; `REQ-RCV-07`; every subsequent `docs/_queue/QUEUE.md` row, all of which are reviewed by the loop this REQ changes |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`9486c81`** on `main`, per the shared baseline. **This document cites shipped behaviour only by measured-fact id (`M-*`)** — it contains no line citation and no claim about control flow of its own (§10). Facts are cited by id, never restated. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 2.7 | 2026-08-01 |

**v2.7** (round 1 of the reset Phase R window) answered thirteen findings without adding a requirement: the pickup-order premise is corrected to the order the driver actually produces (**10 → 12 → 13 → 17 → 18**, §3.1, R-14, paired into `REQ-RCV-07` X-07/R-16 in this revision); the second-`forcePhases` clause now names the step-G refusal that actually blocks it; the zero-round budget halt states what it writes (**it does not re-author an existing post-mortem**, AC-1.4); the derived start falling **below** `W` is decided (AC-1.5(2)); the Iterations render is **declared** (§6, baseline §3) rather than assumed; O-10 regains the **0-call contract leg** and the interim-only leg `REQ-RCV-07` and `pdlc-rcv-split.md` §5.4 cite, and gains a property-based obligation and DC-03's ledger routing; O-13 and O-14 are new owners for the budget-width blast radius and the Iterations render; DC-09's stopping conditions are pasted into §9 R-1.
**v2.6** (operator-directed): all implementation contracts removed to TSPEC altitude per the updated `pm-author` altitude rule; no requirement, AC, `S-*` id or threshold changed meaning. What went: function and seam signatures, injected-dependency design, interim call-graph statements, algorithms and control flow, byte-level write mechanics, test-fixture and oracle design, and module-internal placement. What stayed: every id, the window/budget/halt/clearance semantics, the durable-state homes, the operator-facing grammars, the fail-closed dispositions, and the cross-REQ delegations.
**v2.5** (round 10) fixed the validation result's ability to carry a `{reason}`, scoped §6's grammar exclusion to `W`, and relocated O-10's fixture legs to split **§5.4**. **On size:** shared relocation targets are exhausted; the 90% soft threshold is advisory, the hard ceiling binding.
**v2.4** (round 9) deferred the consistency check, not the word: §6's grammar is in force at this ship and `W` falls back to **1** on a malformed value (§4.1, X-06, O-12).
**v1.6** … **v1.2** addressed rounds 5 … 1.

## 1. Problem

This REQ carries the **window**: how many rounds a document gets, what they are counted from, and what an operator does when they run out.

- **P-1's cost half — the budget does not bound the document.** At HEAD `MAX_REVIEW_ROUNDS` is a *per-invocation* budget (M-1d), so a document can be reviewed six times across two
  invocations with no operator action at all.
- **The budget is five, and the fifth round is measurably worse than the second.** On the predecessor the blocking count reached its minimum at round 2, held it at round 3, and rose thereafter (baseline §1.1: 11, 6, 6, 7, 9), and 66 KB —
  40% of the finished document — was added by rounds that ran *after* its own fixed-point test fired.
- **An absolute cap needs an escape hatch, and the escape hatch needs durable state.** A cap counted from round 1 of the *document* is a dead end without an operator reset, and a reset
  leaving no record is re-granted every invocation — the per-invocation budget restored fail-open.

Successor `pdlc-rcv-reset-region` (`REQ-RCV-07`) carries **how the reset region is validated, what a partially-written answering line leaves behind, and what an operator does about either** — the implementation-altitude half of AC-1.5(4). Successor `pdlc-rcv-fixed-point-stop` carries the two **tests** evaluated inside this window (P-2); `pdlc-rcv-panel-topology` carries P-1's *review-surface* half; `pdlc-rcv-finding-quality` P-3 and P-4.

## 2. Users and value

| ID | User story |
|---|---|
| **US-01** | *As the operator*, I want a review loop that stops when it stops making progress, so that a non-convergent phase costs me three rounds instead of five and I am told why. |
| **US-02** | *As the operator*, I want a bounded, predictable cost per reviewed document, so that a queue of ten features does not become a 3 MB corpus of specs nobody can read. |
| **US-04** | *As the operator*, I want my one escape hatch to be spent exactly once and to leave a record, so that clearing a halt grants one fresh window and not a window per invocation. |

**Value.** This REQ delivers the baseline §1.4 **pessimistic-regime** saving alone and unconditionally — ~40% fewer reviewer dispatches and ~40% fewer bytes than the measured run, from one constant, and is the only member of the family whose saving is not contingent on a regime. **The saving is not eroded by the new halt:** the zero-round budget halt (AC-1.5(1)) is the commonest new case, and AC-1.4 states that when a post-mortem already exists that halt **dispatches no authoring agent** — so the cheapest entry stays cheap and the operator's own `## Recommendation` is not overwritten by an agent with nothing to say. **Operator-visible surfaces:** the budget in the run report and the post-mortem's Iterations table; the `## Reset Region`; and row C (AC-1.5(1)), the no-round budget halt, saying why an invocation did nothing. Row B — the other no-round row — is `REQ-RCV-07` AC-7.6's.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | Feature `pdlc-review-loop-hardening` merged to the default branch | `docs/completed/pdlc-review-loop-hardening/` exists there with that feature's `REQ`, `FSPEC`, `TSPEC`, `PLAN`, `PROPERTIES` and `LEARNINGS`. **Satisfied at `9486c81`** (archived by `7bc559a`). | Must hold at HEAD before FSPEC authoring |
| **BL-06** | The shipped POSTMORTEM gate is intact: an unresolved post-mortem refuses the phase, records a ❌ row and terminates the invocation, and the halt writes the feature's queue row `halted` | Behaviour present at HEAD (M-7a, M-7b) | Must hold at HEAD — AC-1.4 and AC-1.5's refusal path are stated over exactly that shape |

**Both hold on the default branch** at `9486c81`, each checkable by its Resolution-form observable. No fallback is offered if that upstream mechanism is later reverted.

### 3.1 One cross-REQ prerequisite, and what happens before it ships

This REQ is the **head of the family at requirements altitude** — nothing it needs *as a requirement* is owed by a sibling, which is why `depends-on` is empty. X-06 below is a decision **procedure** a sibling owes, which is a forward edge and not a dependency (§10). Two clauses reach across:

| # | Direction | What crosses | Behaviour until it ships |
|---|---|---|---|
| **X-05** | **read from** `pdlc-rcv-fixed-point-stop` REQ-RCV-02 AC-2.8 — the S-11 halt reason `no-revision: …` | AC-1.5(5)'s first table row, which resumes rather than resets the window on an S-11 halt | Until that REQ ships no halt path emits S-11, so the row is **unreachable**, every halt is a convergence halt, and AC-1.5(5) reduces to its second row. The clause is stated over both from the start, so nothing is re-specified when the successor lands. |
| **X-06** | **read from** `pdlc-rcv-reset-region` REQ-RCV-07 AC-7.1 — the ordered validation algorithm behind AC-1.5(4)'s *region validates* predicate, and AC-7.2/AC-7.5's refusal | AC-1.5(4)'s third gate conjunct, and everything that follows a failure of it | This is a **forward** edge, not a `depends-on`: the predicate's *meaning* and its fail-closed disposition are fixed below, so nothing here is under-determined; its **decision procedure** is `REQ-RCV-07` AC-7.1's. The validation conjunct is **not in force until `REQ-RCV-07` ships**. Until then AC-1.5(4)'s clearance gate evaluates its **two decidable conjuncts** — a readable `RESOLVED: yes`, and `A < H` — and every branch behaves as at HEAD: **no refusal and no S-16**, region or none, leaving every entry on the path AC-1.1–AC-1.5(3) and (5) already put it on. **What is *not* deferred:** §6's S-13/S-14 **grammar** is in force at this ship; only the analysis layer (ordering, highest round, `H − A ∈ {0, 1}`) is AC-7.1's. The rationale for shipping the conjunct late, and the cost — R-10's hand-edited-region fail-open, no wider than HEAD's — is stated once for both ends of the edge at `pdlc-rcv-split.md` **§5.1** (see also R-14). |

**Consequence for sequencing.** This REQ is deliverable alone as a **requirement**: its window, budget, halt path and clearance accounting are determined without any successor. `pdlc-rcv-reset-region` is queued at **`Order 18`**, and the net pickup order after this row is **12 → 13 → 17 → 18** — the queue driver picks the lowest `Order` among `pending` rows and treats a dependency **absent from the table** as undecidable, deferring it to the readiness triage, so row 13 (`pdlc-merge-phase`, whose only dependency was removed from the table as merged) is pickable and row **17** (`pdlc-rcv-fixed-point-stop`, `17 < 18`) is picked **before** row 18. QUEUE.md's own gloss *"10 → 12 → 18, with 18 ahead of 17 by `Order`"* inverts that comparison and is superseded by this row; the queue table itself is corrected under the same revision as the row it describes, not here.

Two consequences follow, and both are the reason X-06's interim must not be able to refuse:

1. X-06's interim is live across **three** intervening features and row 18's own Phase R, not one.
2. **Row 17 ships before row 18**, and row 17 is the REQ that emits S-11 (X-05). So `WINDOW-RESUMED: {W}` lines (AC-1.5(5)) become **machine-written into the reset region while the validation conjunct is still unwired**. This is stated, and its residual accepted, in R-14 — it is the one interim exposure that is not merely *no wider than HEAD's*, since HEAD writes no region lines at all.

`pdlc-rcv-fixed-point-stop` depends on this REQ because both its tests are stated over `W`, and `pdlc-rcv-panel-topology` on the two of them.

## 4. Definitions and the catalogue ids this REQ owns

Every term this document uses with a family meaning — *current window* / round `W`, *reset region*, *phase refusal* and the rest — is defined in `docs/_constraints/pdlc-rcv-catalogue.md` §1 and **not** restated here; that file's §2 holds the closed catalogue `S-1 … S-17` and its §3 the row schema.

This REQ **owns** six catalogue ids and **reads** two:

| id | Owned / read | Where it is used here |
|---|---|---|
| **S-12** `## Reset Region` | owned | AC-1.4 clause 1 creates and preserves it; AC-1.5(4) reads it |
| **S-13** `WINDOW-START: {N}` | owned | AC-1.5(4)'s answering line on a convergence-halt clearance |
| **S-14** `WINDOW-RESUMED: {W}` | owned | AC-1.5(5)'s answering line on an S-11 clearance |
| **S-15** `HALT-REASON: {value}` | owned | Written by every halt in AC-1.4's scope; read by AC-1.5(5) |
| **S-16** `reset-region-corrupt: …` | owned | AC-1.5(4)'s report notice when the region does not validate. Its render is catalogue §2's; its `{reason}` selection is **`REQ-RCV-07` AC-7.1's** |
| **S-4** `budget-exhausted: …` | owned | AC-1.5(1)'s halt reason, rendered from the window's origin |
| **S-11** `no-revision: …` | read only | AC-1.5(5)'s first row. Emitted by `pdlc-rcv-fixed-point-stop` AC-2.8 (X-05); this REQ never emits it |
| **S-3** `fixed-point: …` | read only | AC-1.5(5)'s second row, and the `; `-joined `HALT-REASON:` value of a co-occurring halt |

**FSPEC may not add an eighteenth catalogue id**, here or anywhere in the family.

**One delegation, stated once — and stated in `docs/_constraints/pdlc-rcv-split.md` §6**, which both halves cite: every catalogue reference to *AC-1.5(4)'s ordered algorithm*, its numbered steps or the refusal renders it produces reads as **`REQ-RCV-07` AC-7.1** (X-06). Ownership of the ids is unchanged, the catalogue is untouched, and this REQ mints no operator **refusal** string (§6).

**One dangling citation into this REQ, recorded rather than silently left.** `pdlc-rcv-catalogue.md` §4's Recovery-text row attributes the generic queue-reset line's suppression to *"`pdlc-rcv-budget-stop` O-6"*. This REQ has **no O-6** — split §2 moved that obligation to `REQ-RCV-07`, and split §6's delegation is scoped to AC-1.5(4)'s algorithm, steps and renders, so it does not reach an `O-*` id. The correct reading is **`REQ-RCV-07` O-6**. The catalogue is edited **once, by `REQ-RCV-07`** (split §5's second paired-edge row), so the correction lands there; it is recorded here so a reader arriving from catalogue §4 is not sent to a non-existent authority in the meantime.

### 4.1 Durability: what survives an invocation boundary

The loop *re-derives its state from the branch on every invocation* (M-1d, M-2f), so any criterion stated over in-process state is undefined on a resumed phase — the normal case. Every quantity this REQ's criteria read has a durable home and **there is no in-process-only row**; the full map is `pdlc-rcv-baseline.md` **§3.2** (relocated there at round 9, read by the whole family). The two rows this REQ's own clearance gate turns on stay here:

| Quantity | Read by | Durable home | If absent |
|---|---|---|---|
| **First round of the current window** `W` | AC-1.1, AC-1.5(4); `pdlc-rcv-fixed-point-stop` AC-2.1 and AC-2.8 | The `WINDOW-START: {N}` lines in the **reset region** of `POSTMORTEM-{phase}-{feature}.md` — the **greatest** value present, and only if the region **validates** (AC-1.5(4)). Lines are appended, so document order is event order | Treated as **1** — no reset in effect, AC-1.1's cap applies from round 1. Fail-closed: no absent or malformed value ever widens the window. Only *invalid*'s **consistency** half — ordering, the highest round, `H − A ∈ {0, 1}` — is **target state** (`REQ-RCV-07` AC-7.1, X-06); **§6's S-13/S-14 grammar is in force at this ship**, so a value that is not a decimal integer ≥ 1 contributes no origin and `W` falls back to **1**. **Survives a second halt**, since AC-1.4 preserves the region |
| **Rounds this entry ran** (AC-1.3's second reported quantity) | AC-1.3 | Not durable and not required to be: it is a property of the **entry**, computed within the invocation that reports it, and no criterion reads it on a later entry. It is listed here so the *"no in-process-only row"* invariant above is read correctly — the invariant is over quantities the **criteria** read across a boundary, and this one is read only by the operator, in the artifact the same entry writes | n/a — an entry always knows how many rounds it dispatched; on the zero-round halt the value is `0` |
| **Whether a clearance is still unanswered** (the reset is one-shot) | AC-1.5(4), AC-1.5(5) | The **counts**, in that same region, of `H` = `HALT-REASON:` lines and `A` = `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines — **by line prefix, not by value** (AC-1.5(4) clause 4). A clearance is unconsumed exactly when a `RESOLVED: yes` is readable, `A < H`, **and the region validates** | `A = H` ⇒ every halt answered; nothing written, nothing granted. A region that does not validate ⇒ the refusal AC-1.5(4) fixes, which moves neither count — **target state; that conjunct is not in force until `REQ-RCV-07` (X-06)** |

**The durable home has one documented deleter, and it is benign within a feature.** `harvest-learnings` deletes `POSTMORTEM-*` files once `LEARNINGS-{feature}.md` exists (`CLAUDE.md`, *Artifact convention*; the `guard-harvest-before-delete` hook permits exactly that). Phase H runs after every review phase of the feature, so no window this REQ governs outlives its own post-mortem. The one consequence worth stating: a **post-harvest re-entry** — a `forcePhases` run on a feature whose LEARNINGS has already been written — finds no region, so `W = 1`, `H = A = 0`, and the entry starts from a fresh window with no S-16 and no refusal. That is the same fail-closed default as a feature that never halted, it grants no window the operator did not ask for by forcing, and it is **not** a defect this REQ closes (NB-5).


## 5. Acceptance criteria

One requirement. Every acceptance criterion is in Who/Given/When/Then form over an in-band observable named in baseline §2.

---

### REQ-RCV-01 — Round budget reduced from five to three

**Priority:** P0 · **Source:** US-01, US-02 · **Depends on:** BL-01, BL-06

**AC-1.1 — The budget is three, per document, not per invocation.** *Who:* the pipeline. *Given:* any review-loop phase **that reviews a named document type** — R/REQ, F/FSPEC, T/TSPEC, D/DECISIONS, P/PLAN, PR/PROPERTIES. The discriminator is *"the phase names a document type"*, not membership of any particular dispatch table: the round history the window is counted from is derived from that document type's cross-review basenames (M-1d), so a phase naming no document type has nothing to count. *When:* the review window is opened. *Then:* the window ends at round **3 counted from round 1 of
that document**, and the loop halts on entering round 4 — *whatever invocation opened the earlier rounds*.

**Scope: untyped loops are out.** Phase CR reviews no named document type and Phase DOD runs its own loop; N-7 excludes both and **this REQ does not change that**. For such a loop, AC-1.1's per-document window, AC-1.4's reset region and AC-1.5's `W`, clearance accounting and refusal **do not apply**. What does reach them is AC-1.2's shared constant: their **per-invocation** budget becomes 3 instead of 5 — unchanged in kind, still bounded. **That narrowing is deliberate, not a side effect the REQ is tolerating**: the same §1 evidence — blocking counts reaching their minimum at round 2 and rising after round 3 — was measured on review rounds, and nothing about Phase CR argues it converges later than a document review does. If a later measurement shows otherwise, the answer is a second declared constant for the untyped loops, which is a new threshold and therefore a new REQ; it is **not** a reason to keep 5 here. Stated here because the other reading is unsafe: an untyped loop has no per-document round history to anchor a window on, so giving it a reset region would refuse Phase CR permanently after the second clearance (O-10).

This is a **second behavioural change** — §1's per-invocation defect, without which §2's cost claim would bound nothing. AC-1.5 states the replacement rule and its escape hatch.

**AC-1.2 — One constant, one budget.** *Who:* a maintainer. *Given:* the pipeline. *When:* they change the budget. *Then:* they change exactly one declared constant (M-1a) and no arithmetic anywhere else (M-1b). Every place the budget is reported (M-1c) must show the *effective* budget, so a halt message that says "5" while the budget is 3 is a defect.

**"One" is quantified over the whole repository, not over production code**, and that is the part this criterion adds: after the change there is **no second place where the budget's value is written down** — no restated literal and no second declaration, in production or in test code. A test that needs the budget obtains it from the one declaration. This is stated as a requirement because the alternative has an operator-visible failure: a duplicate that is not updated in the same commit leaves a green suite asserting the old width while the pipeline runs the new one, which is exactly the *"reported budget disagrees with the effective budget"* defect one line up, moved into the oracle. **How** the single declaration is made reachable from test code, and **which** existing assertions encode today's width and must move with it, are O-13's — this criterion fixes the outcome, not the mechanism.

**The observable:** on every production entry of a **document-typed** phase (AC-1.1's scope) the admitted window runs from the window's origin `W` for exactly the budget's number of rounds — no entry is ever admitted a window wider than that. On an **untyped** loop, which has no `W` (AC-1.1 *Scope*), the observable is the same width with an unconstrained origin: the per-invocation window is exactly the budget's number of rounds, counted from wherever that invocation starts.

**AC-1.3 — The reduction is not silently partial, and the two quantities are named.** *Who:* the operator. *Given:* a non-convergent phase. *When:* the loop halts on the budget. *Then:*
the post-mortem's Iterations section, the phase record and the returned `iterations` field all report the **effective budget** — the value of `MAX_REVIEW_ROUNDS`, 3 at the declared default
(§6). `iterations` is the **budget**, not the rounds run (M-1c). Because AC-1.5(1) makes a **zero-round** halt the commonest new
case, the Iterations section additionally states the **rounds this entry ran** — `0` there — so the two are never conflated where the operator reads them. Both are asserted **over the
constant**, never the literal `3`.

**The render is declared, not left to the implementer.** At HEAD that section is a fixed literal carrying one number and the phrase *"limit reached"* (M-1c), which is false on a zero-round entry, so this criterion replaces it rather than extending it. The declared render is §6's `Iterations (budget {MAX_REVIEW_ROUNDS}, rounds run {k})` row — two labelled integers in one line, which is what makes the O-10 leg an equality on a fixed string instead of a substring match that any rendering satisfies. **O-14 owns producing it**; O-10 owns asserting it.

**AC-1.4 — Existing halt behaviour is unchanged in kind, and every halt maintains the reset region.** *Who:* the operator. *Given:* the budget is exhausted. *When:* the loop halts.
*Then:* it halts the way it halts today — writing `POSTMORTEM-{phase}-{feature}.md`, confirming the write rather than trusting the agent's reply, and refusing to re-run the phase until
a human writes `RESOLVED: yes`. This REQ changes *when* the halt happens, not *what* a halt is.

Two things about that write do change, because this REQ puts machine-written state in that file. `POSTMORTEM-{phase}-{feature}.md` is a **fixed**, unversioned path, so a document that
halts twice has its post-mortem written twice, and the reset region (catalogue §1, S-12) lives there.

**The scope of "every halt".** The rule below is quantified over **every halt that writes `POSTMORTEM-{phase}-{feature}.md` for a document-typed review-loop phase** (AC-1.1's scope, M-7e). **Not** over the pipeline's other halt classes — creator-agent failure, the branch guard, a listing failure, Phase PUB/CI, Phase DOD — none of which writes a post-mortem at HEAD, and none of which this REQ asks to start (N-4); nor over the phases N-7 excludes. So §4.1's and §6's `H` counts **post-mortem-writing halts of this phase for this document** — the only halts that leave a marker for a clearance to clear, which is what makes the pairing exact. Within that scope, no exception:

1. **the reset region exists after the halt, and it carries this halt's line.** A halt that finds **no existing post-mortem** — the first halt of a phase, which is the halt that creates
   the file — **creates `## Reset Region` containing exactly one `HALT-REASON:` line, its own**. A halt that finds an existing post-mortem **preserves** the region — every `WINDOW-START:`
   (S-13), `WINDOW-RESUMED:` (S-14) and `HALT-REASON:` (S-15) line already in it, in document order — and **appends its own `HALT-REASON:` to the end of that region**, nothing above or
   between the preserved lines. The two cases are one rule read over an empty starting region. So `H` is **exactly the number of halts in AC-1.4's scope**, on every path, and AC-1.5(5)'s
   *"the last `HALT-REASON:`"* is the most recent halt's.
2. **any `RESOLVED:` line already in the file is stripped** — every **unfenced** one, wherever in the file it sits. The new post-mortem is therefore **unresolved on arrival**, and the
   operator must clear *this* halt before the phase runs again. The strip is scoped to unfenced lines because every other reader is (M-7a, M-7d): a fenced `RESOLVED: yes` is invisible to
   the gate either way, so the scoping changes no decision and stops the halt path editing prose inside a human's code fence.
   **The strip reaches inside the `## Reset Region` span too, and the two rules do not collide:** a `RESOLVED:` line is *never* a region line — the region is read as `HALT-REASON:`,
   `WINDOW-START:` and `WINDOW-RESUMED:` lines only (catalogue §1) — so they quantify over disjoint sets, and a `RESOLVED: yes` inside the region is stripped like any other.

**Why the creating halt is stated.** Scoped only to a halt finding an existing post-mortem, the first halt would be governed by nothing: no region ⇒ `H = 0` ⇒ AC-1.5(4)'s gate `A < H` false ⇒ the operator's **first** clearance silently swallowed.

**Why clause 2.** `RESOLVED:` is a **single-valued, human-owned, fail-closed marker**, never a counter (M-7a). Preserved, it makes the next halt's post-mortem read as already resolved, so that halt has no durable effect; a *second* marker reads as duplicated and therefore permanently unresolved — opposite failures, and the alternative's only two reachable states. **The prohibition is untouched:** removing a marker already spent is not writing one (N-4).

**The region is maintained by the loop, not by an agent's diligence** — the shipped halt path asks an agent to write the post-mortem under no preservation obligation (M-7e), so the region's survival must be the loop's own guarantee. O-5 owns that obligation; O-9's prompt clause is belt-and-braces, not the mechanism.

**AC-1.5 — The window is absolute, and only an operator resets it.** *Who:* the review loop. *Given:* a phase whose document already carries cross-review rounds on the branch — the
round history the loop derives from the branch (M-1d). *When:* the phase is (re-)entered. *Then:*

1. the window's **end** is round 3 counted from the window's **origin** `W` (clause 4; `W = 1` when no reset is in effect), not from the highest existing round: with `W = 1`, a branch
   whose highest existing round is 2 is admitted **round 3 only**, and a branch whose highest existing round is 3 or more is admitted **no rounds** and halts immediately on the budget path
   (AC-1.4), emitting S-4 rendered as the window's own range and the effective budget — the three slots are **computed from the window and the constant**, never written as the literal
   `1..3 of 3` (§6). **Not reached on an entry whose region fails to validate** (clause 4): that entry refuses before the budget is evaluated, so no halt and no S-4.

   **The zero-round budget halt has a report row, and it is row C** — the **third** dispatch-less row,
   stated cell by cell here as the catalogue requires of the REQ owning the condition, because the
   per-round table would otherwise be empty for the commonest new halt. `round` = **one past the
   highest round of this document type on the branch** (from the listing); `panel-shape`, `blocking`,
   `growth-bytes`, `classification` **empty**, nothing dispatched or measured; `notice` = this halt's
   **S-4** reason, `; `-joined with any co-occurring reason in catalogue §3 precedence order;

   **`forcePhases` does not grant a window; the clearance is the only route past the cap.**
   `forcePhases` overrides a **recorded approval** and nothing else (`CLAUDE.md`, *Entry (single
   feature)*), so a forced Phase R on a document already at round 3 is admitted **no rounds**: it halts
   on the budget path, writes the post-mortem and row C, and writes the queue row `halted` — and a
   second force changes nothing, because at `A = H` a marker grants nothing. A deliberate change to a
   documented operator entry point, stated so it has an oracle;
2. the window's **start** is unchanged — one past the highest existing round (M-1d), so review history stays append-only and no existing file is ever overwritten;
3. the **one** reset is an operator's: a `POSTMORTEM-{phase}-{feature}.md` carrying a human-written `RESOLVED: yes` outside any fenced block clears the halt, and the rounds recorded
   *before* that marker do not count against the budget of the window opened after it. This is the existing operator escape hatch, stated here because it is what makes an absolute cap
   operable rather than a dead end: an operator who has addressed the finding gets a fresh window; an unattended re-invocation does not. **No agent and no script ever writes `RESOLVED:
   yes`**;
4. **the reset is anchored and consumed, in the POSTMORTEM, by the loop.** The **reset region** is read as two counts: `H`, the number of `HALT-REASON:` lines, and `A`, the number of
   `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines — both counted **by line prefix, whatever the value**, so a malformed value contributes no origin (§6) but still answers a halt. A clearance is **unconsumed** exactly when all three hold: a `RESOLVED: yes` is readable, `A < H`, **and the region
   validates** (the named predicate below). On any entry that observes all three — there is no observable "first entry"; the counts are the whole state — the loop **appends** exactly one answering
   line to the **end** of the region — `WINDOW-START: {N}` on a convergence halt, `WINDOW-RESUMED: {W}` on an S-11 halt (clause 5) — which makes `A = H` again. For `WINDOW-START:`, `N` is
   one past the highest round then on the branch and becomes the origin `W`: the budget of 3 is counted from `W`, and rounds below `W` are outside the window. When `A = H` every halt so
   far has been answered and the loop writes nothing and grants nothing.

   **"The highest round on the branch" always means: of the document type under review.** Every such
   phrase in this REQ — clause 2's start, this clause's `N`, row C's `round` cell, and (in the
   successor) the validation range check and row B's `round` cell — is taken over that document
   type's cross-review rounds only (M-1d), never over the whole directory. A feature directory holds
   cross-reviews for several document types at once, and the two readings disagree on such a
   directory; it is the doc-type-scoped one, because a window is a property of a document.

   **The clearance is spent only when the answering line durably exists**, and it must durably exist
   **before any round of that entry is dispatched**. That line is the sole record keeping the
   clearance one-shot; a lost one re-grants a fresh window on every invocation — the fail-open this
   criterion exists to close — so it carries the **same confirmation obligation AC-1.4 puts on the
   post-mortem write**. Failure is fail-closed: no window opens (`W` keeps its prior value), no round
   is dispatched, and the entry **refuses the phase**. What a partially-landed line leaves behind is
   **`REQ-RCV-07` AC-7.5**; its operator-facing render is **catalogue §4**'s, and it mints **no new
   catalogue id and no new S-16 reason** — that enum is closed at three — because it is a fault of the
   loop, not a state of the region. The ordering is deliberate: an entry that records the line then
   dies before dispatching has spent the clearance while the window at `N` is intact, and the next
   entry runs those rounds; recording it last would instead lose the record of a window already
   *used*, and re-grant it.

   **Answering lines are appended, like `HALT-REASON:` lines**, and that is **normative**: document
   order is event order, and validation reads each line against the lines before it. A region whose
   lines land out of order fails validation ⇒ `W = 1` permanently, since AC-1.4 clause 1 preserves the
   region verbatim on every later halt and no clearance repairs it.

   **The third conjunct, as a named predicate.** *The region validates* is a predicate on the region
   and the branch listing, **total and single-valued** (DC-01), whose decision procedure is
   `REQ-RCV-07` AC-7.1's ordered algorithm and is **not restated here** (X-06). What this REQ fixes is
   its **meaning and its failure disposition**:

   - it is **true** exactly when every answering-line value is well-formed and consistent with the
     lines before it and with the highest round on the branch, **and** the counts satisfy the
     invariant `H − A ∈ {0, 1}`. The empty region satisfies it vacuously — an empty region is valid,
     not corrupt;
   - when it is **false**, fail-closed and in all four respects at once: **`W` = 1**; **the clearance
     is not consumed** — no answering line is written, and neither count moves; the run report emits
     exactly one `reset-region-corrupt: {reason}` notice (S-16, rendered per catalogue §2); and the
     entry **refuses the phase** rather than halting, terminating the invocation the way an unresolved
     post-mortem already does (M-7a, M-7b), with the feature's queue row written `halted`. The refusal's semantics, its
     operator-facing strings and the sanctioned repair per reason are `REQ-RCV-07` AC-7.2, AC-7.4 and
     §6; the report row it produces is that REQ's AC-7.6 (row B).

   **This conjunct becomes operative when `REQ-RCV-07` ships** (X-06): until then the gate is its two
   decidable conjuncts, so the dispositions above — and §4.1's two rows that restate them — are the
   **target state**, not behaviour this REQ's own delivery exhibits. The predicate's meaning and
   disposition are fixed here so that later ship adds no requirement.

   **Validation is a conjunct of the gate, not merely a constraint on `W`** — that is this REQ's
   claim; the arithmetic behind it is stated once for both ends of the edge at
   `pdlc-rcv-split.md` **§5.2**.

   **A refusal is not a halt: the entry returns without running the rest of AC-1.5**, takes no halt
   and leaves the marker in place — why, stated once for both ends at `pdlc-rcv-split.md` **§5.3**;
   the refusal itself in full at `REQ-RCV-07` AC-7.2.

5. **every halt records which halt it was, and a no-revision halt resumes the window rather than replacing it.** Each halt appends exactly one `HALT-REASON: {value}` line to the **end** of
   the region (S-15, AC-1.4 clause 1), `{value}` being the `; `-joined render, in the catalogue §3 precedence order, of every halt reason that halt raised — so a round on which S-3 and S-4 both
   hold writes **one** line reading `fixed-point: …; budget-exhausted: …`. Because each halt appends and
   nothing is written after the region, the **last** such line is the most recent halt's. On the entry that observes an unconsumed clearance (clause 4), the loop reads that last line and
   its **leading** reason:

   | Last `HALT-REASON:` begins | Effect of the `RESOLVED: yes` | Line the loop writes |
   |---|---|---|
   | `no-revision:` (S-11) | the halt is cleared and the **interrupted window is resumed** — `W` is unchanged and the rounds the window had already spent stay spent | `WINDOW-RESUMED: {W}` (S-14) |
   | `fixed-point:` (S-3) or `budget-exhausted:` (S-4) | the reset is granted and consumed as clause 4 states: a fresh three-round window opens at `N` | `WINDOW-START: {N}` (S-13) |
   | unparseable, or any other value | treated as S-3/S-4 — **fail-closed**, because the safe error is to consume a reset the operator can re-grant, never to hand out a free window | `WINDOW-START: {N}` |

   Reading the **leading** reason is exact: S-11 is decided at round-open and never co-occurs with S-3 or S-4 (`pdlc-rcv-fixed-point-stop` AC-2.2), so a joined value never begins
   `no-revision:`. **The table has three rows, not four: "absent" is unreachable** — it is read only on an entry observing an unconsumed clearance, whose gate requires `A < H`, hence
   `H ≥ 1`, hence a last line exists. The *absent* case is the region's, one level up, and is S-12's.

   **Every clearance is answered by exactly one line, including this one.** With nothing written on the S-11 path the clearance stays unanswered forever, so the **next** halt of any kind
   banks a free window on a marker written for an unrelated authoring failure — *k* authoring failures, *k* free windows. `WINDOW-RESUMED: {W}` keeps the intent — origin unmoved, spent
   rounds spent, no window charged — while restoring `A = H`. Same confirmation obligation and fail-closed disposition as `WINDOW-START:`.

   **Row B — the report row of a refusing entry, in two variants** — is `REQ-RCV-07` AC-7.6's, stated
   cell by cell there as catalogue §3 requires of the REQ owning the condition. It is **row C's
   complement**: B's entry takes no halt, C's takes one, so B never carries S-4 and C never carries
   S-16.

All five clauses' durable observables are §4.1's, all already read by the loop. Nothing here needs a clock, a process identity, or a memory of a previous invocation.

**Observability.** The declared budget is 3; the highest `-v{N}` for a document with no resolved POSTMORTEM never exceeds 3; on an entry past the window **no reviewer is dispatched** and no
new cross-review file appears; the post-mortem carries the budget and the S-4 reason string.

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3, and this REQ's per-row notes are
**baseline §3.1** (relocated there at round 9). This REQ **owns** six of its rows and reads two more;
it changes none of the others, and a threshold used here and absent there is a defect. **The three
refusal-render rows v1.6 carried here are `REQ-RCV-07` §6's and catalogue §4's** — this REQ now mints
no operator string of its own. Two grammars are restated below because §4.1 and AC-1.5(4) depend on
their being **in force at this ship** rather than deferred with the consistency checks (X-06).

| Row | Owned / read | Default and note |
|---|---|---|
| `MAX_REVIEW_ROUNDS` | owned | **3** (was 5); baseline §3 for the derivation, §3.1 for this REQ's note |
| `## Reset Region` (S-12), `HALT-REASON: {value}` (S-15), `reset-region-corrupt: …` (S-16), `budget-exhausted: …` (S-4) | owned | **Stated once in baseline §3, with this REQ's local notes at baseline §3.1** — relocated there at round 9, nothing changed meaning in the move. **S-4 excepted: outside baseline §3 deliberately, its render fixed by catalogue §2 (baseline §3.1)** |
| **`WINDOW-START: {N}` (S-13)** | owned | **`{N}` a decimal integer ≥ 1** — the grammar, restated here because it is **in force at this ship** and §4.1's `W` row depends on it: a line whose value is not one contributes **no value to `W`** — it is still a `WINDOW-START:` line for the `A` count (AC-1.5(4) clause 4). Baseline §3.1 for the authoring prohibition and the deletion rule |
| **`WINDOW-RESUMED: {W}` (S-14)** | owned | **`{W}` a decimal integer ≥ 1** equal to the origin then in effect — same grammar, same in-force status |
| `no-revision: …` (S-11) / `fixed-point: …` (S-3) | **read only** | As the catalogue fixes them; emitted by `pdlc-rcv-fixed-point-stop` (X-05). Baseline §3.1 for how AC-1.5(5) reads them |

## 7. Non-goals and out of scope

The shared list is baseline §4, which defines **N-1 … N-10 only**; all of `N-1, N-2, N-3, N-4, N-7,
N-9, N-10` apply unchanged and are not restated, and `N-5`, `N-6` and `N-8` are **inapplicable to
this REQ, not overlooked**. **Ids above `N-10` are not shared** — the family has minted
colliding `N-1x` ids — so this document's own non-goals use a **per-REQ namespace, `NB-*`**; restated
shared rows keep their shared ids. `O-*`, `R-*` and `X-*` are **not** namespaced, so
`pdlc-rcv-split.md` §5's rule applies — every cross-document citation names the owning REQ. Four non-goals are worth pointing at:

| # | Not in scope | Why |
|---|---|---|
| **N-4** (shared) | Changing what a halt is. | AC-1.4: the POSTMORTEM path, the write confirmation, and the rule that **only a human ever writes `RESOLVED: yes`** are untouched, as is the shipped gate that reads it (M-7a). This REQ changes *when* a halt happens and *what it says* — plus the one lifecycle change AC-1.4 clause 2 states, which is the fail-closed direction. |
| **N-7** (shared) | Applying these mechanisms to Phase CR or Phase DOD. | Restated here because AC-1.1 now says so explicitly: `docType: null` loops keep a per-invocation budget, take the new value of the shared constant, and get no reset region. |
| **NB-1** | Specifying the fixed-point test, the zero-delta test, or how a round's blocking count is read. | They are `pdlc-rcv-fixed-point-stop`'s. This REQ states only the window they are evaluated inside and the halt path they halt on. A finding that this document never says *when* the loop compares two rounds is **correct and known** — file it there. |
| **NB-2** | Specifying the verifier panel, the growth measurement or the anchor writer. | They are `pdlc-rcv-panel-topology`'s. A finding that this document does not define `DOC-BYTES:` is **correct and known** — file it as Low. |
| **NB-3** | Specifying **how** the reset region is validated, what a partially-written answering line leaves behind, which operator strings a refusing entry emits, or the sanctioned repair per S-16 reason. | They are `pdlc-rcv-reset-region`'s (`REQ-RCV-07`, X-06). AC-1.5(4) names the *region validates* predicate and fixes its meaning and its fail-closed disposition; the decision procedure, the refusal's semantics, the repair taxonomy and the row-B renders are AC-7.1–AC-7.6 and catalogue §4. A finding that this document does not state the algorithm, does not pin a shipped string, or does not say which line a torn write leaves behind is **correct and known by construction** — file it there. So is the validation conjunct being **not in force** at this ship (X-06): `REQ-RCV-07` brings it into force with AC-7.1, and it is **not** to be remediated here. |
| **NB-4** | Asserting anything about `pdlc/workflows/orchestrate-dev.js`'s control flow that is not a measured fact. | Per the predecessor post-mortem's root cause 1, this document cites shipped behaviour **only by `M-*` id** and carries no line citation. A claim about a guard, an emit or a branch belongs in `docs/_constraints/pdlc-rcv-baseline.md`, and a criterion that needs one belongs in `REQ-RCV-07`. |

## 8. Downstream obligations

A review finding of the form "this AC has no oracle / no fixture / no seam / no test" is answered
here: an obligation on the FSPEC, TSPEC, PLAN or PROPERTIES, not a REQ revision.

| # | Obligation | Owner |
|---|---|---|
| **O-5** | Specify the mechanism by which AC-1.4's **reset region survives every halt**: the region is loop-owned state preserved across halts, **not** discharged by a prompt clause. The obligation's outcome is fixed here — the first halt of a phase creates the region, a later halt preserves every line already in it and appends its own, unfenced `RESOLVED:` lines are stripped, and a region that is lost or cannot be written is **reported fail-closed** rather than proceeded past on a silently widened window. Any partial outcome lands fail-closed too (`W` = 1, or S-16 and a sanctioned repair), with `H` understating the halts by at most the lost lines and the next halt re-creating the region. | TSPEC |
| **O-12** | Specify **how `W` is resolved before the round window is computed**, and how the *region validates* predicate is supplied to the clearance gate; the seam contract itself is `REQ-RCV-07` O-12's, and the halt path's region maintenance is O-5's. This REQ fixes only the observables: the gate is **fail-closed** — a region that does not validate refuses the phase and consumes nothing; the run report carries **exactly one** `reset-region-corrupt: {reason}` notice, `{reason}` drawn from `REQ-RCV-07`'s closed set of three; and `W` falls back to **1** whenever no well-formed `WINDOW-START:` value exists (§6, §4.1). | TSPEC |
| **O-9** | The post-mortem prompt gains a belt-and-braces clause telling the agent `## Reset Region` (S-12) is machine state to be left alone — the baseline prompt is a bare `Write ${postmortemPath}.` plus a section list (M-7e). **Not the mechanism**; O-5 is. | FSPEC → implementation |
| **O-10** | Properties and tests for this requirement, at the level of observable outcomes. **The region's maintenance (AC-1.4):** the first halt of a phase creating `## Reset Region` with exactly one `HALT-REASON:` line, and the operator's first clearance then granting a window; a later halt preserving the region and stripping the spent marker, so the phase reads as unresolved again; a **fenced** `RESOLVED: yes` surviving the strip while an unfenced one is removed; region lines **appended, not prepended**; a **Phase CR halt creating no `## Reset Region`** (N-7). **The window (AC-1.1–AC-1.3, AC-1.5(1)–(3)):** the budget and the reported iterations asserted **over the constant, never a literal** (the `rounds 4..6 of 3` shape is illustrative), with rounds-run `0` on the zero-round halt; **row C** asserted cell by cell with **zero reviewer dispatches asserted positively** — a dispatch count of `0` alongside the absence of any new cross-review file, since a test double that writes nothing satisfies absence either way; a **forced** phase on an exhausted document halting rather than re-reviewing, and a second force changing nothing. **The gate (AC-1.5(4)–(5)):** one clearance granting **exactly one** window (`A < H` grants, `A = H` grants nothing); an S-11 clearance writing `WINDOW-RESUMED:`, leaving `W` unchanged, with a subsequent convergence halt then **not** auto-cleared. **The validation-dependent legs are deferred to `REQ-RCV-07` O-10** (X-06): the refusal, its renders and *a region that does not validate consuming no clearance* belong to the REQ under which the conjunct is in force and can be exercised on a production path. | PROPERTIES |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, and honour the repo's documented workflow-runtime constraints (`CLAUDE.md`), so the shipped artifacts behave as the tests do. | implementation |

## 9. Risks, assumptions and deferrals

| # | Risk | Disposition |
|---|---|---|
| **R-1** | **This REQ is reviewed by the loop it is changing, under the old behaviour** — five per-invocation rounds, no enforced stop. The predecessor's Phase R died exactly here. | Mitigated by splitting the parent, depending on no unmeasured runtime fact (baseline §5), and keeping this document short. **Accepted and unenforceable** — the enforcement is this REQ and its successor, neither shipped; the operator watches the trajectory and halts by hand. |
| **R-12** | **A repeating S-11 halt is unbounded.** Each S-11 clearance writes `WINDOW-RESUMED: {W}`, leaves `W` unchanged and (per the successor's AC-2.8) costs the window no round, so an authoring side that keeps producing zero-delta rounds yields an unbounded halt/clearance sequence with `H` and `A` growing together and the budget never exhausting. | **Accepted, and bounded by the operator rather than by the loop.** Every iteration costs one hand-written `RESOLVED: yes`, so the sequence is never unattended; capping it would need a second counter that could only deny an operator *choosing*, each time, to continue. Revisit if the S-11 path repeats in practice. |
| **R-13** | **Migration: branches that already carry more than three rounds.** At the commit that lands `MAX_REVIEW_ROUNDS = 3`, every in-flight phase whose document has 3+ rounds is admitted no rounds and halts on the next entry, rendering S-4 as `rounds 1..3 of 3` while five rounds sit on disk. | **Correct and expected, not a defect** — the render states the *window*, not the file count. The escape is the ordinary clearance (AC-1.5(3)). No migration script, no back-fill of reset regions. |
| **R-10** | **The reset region is machine state in a file an operator is instructed to edit.** A hand-edit can make the counts lie in either direction, and one direction restores the per-invocation budget AC-1.1 abolishes — silently and fail-open. | **Mechanised, not accepted.** AC-1.5(4) makes *the region validates* a **conjunct of the clearance gate**, so a region whose accounting cannot be trusted consumes nothing and opens nothing. The mechanism that decides it, and the sanctioned repairs that leave the operator a way back, are `REQ-RCV-07` AC-7.1 and AC-7.4 (that REQ's R-10). The residual carried here is §6's *never authored by a human*. |
| **R-14** | **This REQ's *region validates* decision procedure is not implementable until `REQ-RCV-07` ships** (X-06), and that REQ is a whole intervening feature away — row 18, net pickup 10 → 12 → 18 (§3.1). | **Mitigated by not bringing the conjunct into force until its procedure exists** — not by sequencing, which is too weak at that distance, and not by an interim procedure, all three of which are rejected once for both ends at `pdlc-rcv-split.md` §5.1 (X-06). Until `REQ-RCV-07` ships, every branch keeps HEAD's behaviour: no refusal, no S-16, nothing AC-1.1–AC-1.5(3) and (5) do not already do. **Residual, accepted and time-boxed:** R-10's hand-edited-region fail-open stays open until row 18 — operator-caused and no wider than HEAD's, where it is open unconditionally. Nothing requires the two halves to land in the same plugin release, so no `pdlc/RELEASE-CHECKLIST.md` line is owed. |

**Deferrals and their binding.** This REQ defers nothing of its own. The predecessor's deferrals
belong to the successors carrying the criteria that raise them: cross-panel comparability and finding
identity to `docs/discarded/pdlc-review-convergence-calibration/REQ-pdlc-review-convergence-calibration.md`,
the authoring-side zero-write residue to `docs/pdlc-runtime-measurement-spike/REQ-pdlc-runtime-measurement-spike.md`;
both recorded in `pdlc-rcv-fixed-point-stop` §9. Each stub is `ready: false`, so neither is
queue-eligible until an operator specifies it and opts it in.

## 10. Traceability

| Requirement | Baseline measured facts | Baseline defect | User story | Obligations |
|---|---|---|---|---|
| REQ-RCV-01 | M-1a, M-1b, M-1c, M-1d, M-1e; M-7a, M-7b, M-7d, M-7e | P-1 (cost half) | US-01, US-02, US-04 | O-5, O-9, O-10, O-11, O-12 |

**Why one requirement and not two.** v1.0 carried REQ-RCV-01 and REQ-RCV-02 together past the 60 KB
ceiling; v1.1 cut at the seam they already had — this REQ the **window**,
`docs/pdlc-rcv-fixed-point-stop/` the two **tests** inside it, kept as a `depends-on` edge.

### v2.0 — the altitude split

**Relocated, not deleted.** The narrative, the *what moved / what stayed* mapping and the three
consequences are stated once for both halves in **`docs/_constraints/pdlc-rcv-split.md`** (§1–§4). In
one line: v1.6 was cut at the **altitude** seam the postmortem named, the implementation-altitude
half of AC-1.5(4) moved to `REQ-RCV-07`, the window stayed, and **no requirement, AC, `S-*` id,
threshold or user story changed meaning**.

**Paired edges must be revised together.** `REQ-RCV-01` X-06/R-14 and `REQ-RCV-07` X-07/R-16 are the
**same edge described from both ends**, so any revision to X-06 or R-14 is carried to X-07 and R-16
**within the same revision**, and the reviewer checks both ends **at HEAD**. The unit is the
revision, not the commit. The edge table, the three facts both ends must agree on, and the
`O-*`/`R-*`/`X-*` collision rule are in `pdlc-rcv-split.md` §5.

**Round-by-round history is deliberately not restated here:** `harvest-learnings` deletes
`CROSS-REVIEW-*` once LEARNINGS is written, so citing round files would be structurally wrong.
