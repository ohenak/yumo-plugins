---
feature: pdlc-rcv-budget-stop
ready: true
depends-on: []
---

# REQ — pdlc-rcv-budget-stop

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the facts `M-*`, the declared thresholds (§3, this REQ's notes at §3.1), the durable homes (§3.2) and the shared non-goals `N-1 … N-10`. **Read it first.** Facts are cited by id, never restated. |
| Shared split record | `docs/_constraints/pdlc-rcv-split.md` — the v2.0 altitude split, the **paired edges** this REQ and `REQ-RCV-07` revise together (§5), the shared arguments (§5.1 unwired conjunct, §5.2 conjunct-of-the-gate, §5.3 refusal-is-not-a-halt, §5.4 interim legs, §5.5 answering-line ordering) and the catalogue delegation (§6). |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — the vocabulary (§1), the closed catalogue `S-1 … S-17` (§2), the row schema (§3), used by reference. |
| Predecessor | `docs/discarded/pdlc-review-convergence/REQ-pdlc-review-convergence.md` v1.8 (**superseded 2026-08-01**) — its REQ-RCV-01 carried here unchanged in substance; its REQ-RCV-02 moved to `docs/pdlc-rcv-fixed-point-stop/` (§10). |
| Siblings | `docs/pdlc-rcv-reset-region/` (**REQ-RCV-07**) — the implementation-altitude half split out of this document's v1.6 (§10); `docs/pdlc-rcv-fixed-point-stop/` (REQ-RCV-02) — the successor depending on this one; `docs/pdlc-rcv-panel-topology/` (RCV-03/04); `docs/pdlc-rcv-finding-quality/` (RCV-05/06) |
| Upstream | `docs/completed/pdlc-review-loop-hardening/POSTMORTEM-R-…md` root causes 2–3; this feature's own `POSTMORTEM-R-pdlc-rcv-budget-stop.md` root causes 1 and 3; operator direction of 2026-07-29 and 2026-08-01 |
| Downstream | `FSPEC-pdlc-rcv-budget-stop.md`; `REQ-RCV-07`; every subsequent `docs/_queue/QUEUE.md` row, all reviewed by the loop this REQ changes |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`9486c81`** on `main`, per the shared baseline. **This document cites shipped behaviour only by measured-fact id (`M-*`)** — no line citation, no control-flow claim of its own (NB-4). |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 2.9 | 2026-08-01 |

**v2.9** (round 1 of the reset window) answers nine findings, adding no requirement: **the loop — not the authoring agent — writes the Iterations section on every halt in scope**, with its anchor and not-found disposition declared (AC-1.3, AC-1.4 clause 3, O-14); AC-1.1's `Then` qualified by the origin `W`; AC-1.2's *one* excludes the artifacts `build-runtime.mjs` derives, with a fifth O-13(b) class; the `HALT-REASON:` append given AC-1.5(4)'s confirmation obligation and fail-closed disposition; the zero-round halt's **reviewer-verdict list** named in AC-1.3 and row C; its **authored** post-mortem content dispositioned as **NB-6**. Paid for by relocating §4.1's rows to baseline **§3.2** and collapsing §6's S-13/S-14 restatements.
**v2.8 … v2.7** (rounds 2, 1 of the previous window) decided the Iterations refresh on every halt, clause 4's `N` as the resolved start, AC-1.2's executable-declaration quantifier, pickup order **10 → 12 → 13 → 17 → 18** (§3.1, R-14, paired into `REQ-RCV-07` X-07/R-16), the second `forcePhases` refusal, the no-re-author rule, O-10's **0-call**/interim-only legs, property obligation and DC-03 ledger, O-13/O-14/O-15, and pasted DC-09's stopping rule into §9.
**v2.6** (operator-directed) removed all implementation contracts to TSPEC altitude, no id, AC, threshold or semantic changed; **v2.5 … v1.2** addressed rounds 10 … 1. **On size:** the hard ceiling binds, so every revision since v2.5 pays for its additions by compressing prose or relocating to a shared file.

## 1. Problem

This REQ carries the **window**: how many rounds a document gets, what they are counted from, and what an operator does when they run out.

- **P-1's cost half — the budget does not bound the document.** At HEAD `MAX_REVIEW_ROUNDS` is a *per-invocation* budget (M-1d), so a document can be reviewed six times across two invocations with no operator action.
- **The budget is five, and the fifth round is measurably worse than the second.** On the predecessor the blocking count bottomed at round 2, held at round 3 and rose thereafter (baseline §1.1: 11, 6, 6, 7, 9), and 66 KB — 40% of the finished document — was added by rounds run *after* its own fixed-point test fired.
- **An absolute cap needs an escape hatch, and the hatch needs durable state.** A cap counted from round 1 of the *document* is a dead end without an operator reset, and a reset leaving no record is re-granted every invocation — the per-invocation budget restored fail-open.

`REQ-RCV-07` carries **how the region is validated, what a partially-written answering line leaves behind, and what an operator does about either** — AC-1.5(4)'s implementation-altitude half. `pdlc-rcv-fixed-point-stop` carries the two **tests** evaluated inside this window (P-2); `pdlc-rcv-panel-topology` P-1's *review-surface* half; `pdlc-rcv-finding-quality` P-3 and P-4.

## 2. Users and value

| ID | User story |
|---|---|
| **US-01** | *As the operator*, I want a loop that stops when it stops making progress, so a non-convergent phase costs three rounds instead of five and I am told why. |
| **US-02** | *As the operator*, I want a bounded, predictable cost per reviewed document, so a ten-feature queue does not become a 3 MB corpus nobody can read. |
| **US-04** | *As the operator*, I want my one escape hatch spent exactly once and leaving a record, so clearing a halt grants one fresh window, not a window per invocation. |

**Value.** This REQ delivers the baseline §1.4 **pessimistic-regime** saving alone and unconditionally — ~40% fewer reviewer dispatches and ~40% fewer bytes than the measured run, from one constant; the only member of the family whose saving is not contingent on a regime. **The new halt does not erode it:** AC-1.5(1)'s zero-round halt is the commonest new case, and AC-1.4 makes it **dispatch no authoring agent** when a post-mortem exists, so the cheapest entry stays cheap and the operator's `## Recommendation` survives. **Operator-visible surfaces:** the budget and rounds-run in the post-mortem's Iterations section and the run report; the `## Reset Region`; and row C, saying why an invocation did nothing. Row B is `REQ-RCV-07` AC-7.6's.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | `pdlc-review-loop-hardening` merged to the default branch | `docs/completed/pdlc-review-loop-hardening/` exists there with that feature's full artifact set. **Satisfied at `9486c81`** (archived by `7bc559a`). | Must hold at HEAD before FSPEC authoring |
| **BL-06** | The shipped POSTMORTEM gate is intact: an unresolved post-mortem refuses the phase, records a ❌ row, terminates the invocation, and the halt writes the queue row `halted` | Behaviour present at HEAD (M-7a, M-7b) | Must hold at HEAD — AC-1.4, AC-1.5's refusal path and the second-force clause are stated over that shape |

**Both hold at `9486c81`**, each checkable by its Resolution-form observable. No fallback if either upstream mechanism is later reverted.

### 3.1 One cross-REQ prerequisite, and what happens before it ships

This REQ is the **head of the family at requirements altitude** — nothing it needs *as a requirement* is owed by a sibling, hence the empty `depends-on`. Two clauses reach across:

| # | Direction | What crosses | Behaviour until it ships |
|---|---|---|---|
| **X-05** | **read from** `pdlc-rcv-fixed-point-stop` AC-2.8 — the S-11 reason `no-revision: …` | AC-1.5(5)'s first row, which resumes, not resets, the window on an S-11 halt | Until that REQ ships no halt path emits S-11, so the row is **unreachable**, every halt is a convergence halt, and AC-1.5(5) reduces to its second row. Stated over both from the start, so nothing is re-specified when the successor lands. |
| **X-06** | **read from** `REQ-RCV-07` AC-7.1 — the ordered validation algorithm behind AC-1.5(4)'s *region validates* predicate, and AC-7.2/AC-7.5's refusal | AC-1.5(4)'s third gate conjunct, and everything following a failure of it | A **forward** edge, not a `depends-on`: the predicate's *meaning* and fail-closed disposition are fixed below; its **decision procedure** is AC-7.1's, and the conjunct is **not in force until that REQ ships**. Until then the gate evaluates its **two decidable conjuncts** — a readable `RESOLVED: yes`, and `A < H` — every branch behaving as at HEAD: **no refusal, no S-16**. **Not deferred:** §6's S-13/S-14 **grammar** is in force at this ship; only the analysis layer (ordering, highest round, `H − A ∈ {0, 1}`) is AC-7.1's. Rationale and cost at split **§5.1** (see R-14). |

**Consequence for sequencing.** This REQ is deliverable alone as a **requirement**: its window, budget, halt path and clearance accounting are determined without any successor. `pdlc-rcv-reset-region` is queued at **`Order 18`**, and the net pickup order after this row is **12 → 13 → 17 → 18** — the driver picks the lowest `Order` among `pending` rows and defers a dependency **absent from the table** to readiness triage, so row 13 is pickable and row **17** precedes row 18. QUEUE.md's gloss *"10 → 12 → 18, with 18 ahead of 17"* inverts that comparison and is superseded here. **R-14 states the two consequences** — a three-feature interim, and row 17's machine-written `WINDOW-RESUMED:` lines landing in unvalidated regions — both reasons X-06's interim must not be able to refuse.

`pdlc-rcv-fixed-point-stop` depends on this REQ because both its tests are stated over `W`; `pdlc-rcv-panel-topology` on the two of them.

## 4. Definitions and the catalogue ids this REQ owns

Every term used with a family meaning — *current window* / round `W`, *reset region*, *phase refusal* and the rest — is defined in `pdlc-rcv-catalogue.md` §1 and **not** restated; §2 holds the closed catalogue `S-1 … S-17`, §3 the row schema. This REQ **owns** six ids and **reads** two:

| id | Owned / read | Where it is used here |
|---|---|---|
| **S-12** `## Reset Region` | owned | AC-1.4 clause 1 creates and preserves it; AC-1.5(4) reads it |
| **S-13** `WINDOW-START: {N}` | owned | AC-1.5(4)'s answering line on a convergence clearance |
| **S-14** `WINDOW-RESUMED: {W}` | owned | AC-1.5(5)'s answering line on an S-11 clearance |
| **S-15** `HALT-REASON: {value}` | owned | Written by every halt in AC-1.4's scope; read by AC-1.5(5) |
| **S-16** `reset-region-corrupt: …` | owned | AC-1.5(4)'s report notice when the region does not validate. Render catalogue §2's; `{reason}` selection **`REQ-RCV-07` AC-7.1's** |
| **S-4** `budget-exhausted: …` | owned | AC-1.5(1)'s halt reason, rendered from the window's origin |
| **S-11** `no-revision: …` | read | AC-1.5(5)'s first row; emitted by `pdlc-rcv-fixed-point-stop` AC-2.8 (X-05), never here |
| **S-3** `fixed-point: …` | read | AC-1.5(5)'s second row, and the `; `-joined `HALT-REASON:` value of a co-occurring halt |

**FSPEC may not add an eighteenth catalogue id**, here or anywhere in the family.

**One delegation, stated once at `pdlc-rcv-split.md` §6**, which both halves cite: every catalogue reference to *AC-1.5(4)'s ordered algorithm*, its steps or the refusal renders it produces reads as **`REQ-RCV-07` AC-7.1** (X-06). Id ownership is unchanged, the catalogue untouched, and this REQ mints no **refusal** string (§6).

**One dangling citation, recorded, not left silent.** Catalogue §4's Recovery-text row attributes the queue-reset line's suppression to *"`pdlc-rcv-budget-stop` O-6"*; this REQ has **no O-6** (split §2 moved it to `REQ-RCV-07`). Read it as **`REQ-RCV-07` O-6**; the catalogue is edited once, by that REQ (split §5), so the correction lands there.

### 4.1 Durability: what survives an invocation boundary

The loop *re-derives its state from the branch on every invocation* (M-1d, M-2f), so any criterion over in-process state is undefined on a resumed phase — the normal case. **Every quantity this REQ's criteria read across that boundary has a durable home, and the full map — including the two rows this REQ's clearance gate turns on, `W` and whether a clearance is still unanswered — is baseline §3.2**, relocated there at v2.9 and cited, not restated. Both rows are **in force at this ship** in their fail-closed direction (`W` = 1 absent a well-formed value; `A = H` ⇒ nothing granted); only their *region validates* conjunct is target state (X-06). AC-1.3's **rounds this entry ran** needs no row — a property of the entry, computed inside the invocation that reports it, read later by no criterion — so the *"no in-process-only row"* invariant, which is over quantities the **criteria** read across a boundary, holds.

**The durable home has one documented deleter.** `harvest-learnings` deletes `POSTMORTEM-*` once `LEARNINGS-{feature}.md` exists (`CLAUDE.md`). Benign within a feature — Phase H runs after every review phase, so no window outlives its post-mortem. One consequence: a **post-harvest `forcePhases` re-entry** finds no region, so `W = 1`, `H = A = 0`, no S-16, no refusal — the default of a feature that never halted, granting nothing the operator did not ask for by forcing (NB-5).

## 5. Acceptance criteria

One requirement. Every criterion is in Who/Given/When/Then form over an in-band observable named in baseline §2.

---

### REQ-RCV-01 — Round budget reduced from five to three

**Priority:** P0 · **Source:** US-01, US-02 · **Depends on:** BL-01, BL-06

**AC-1.1 — The budget is three, per document, not per invocation.** *Who:* the pipeline. *Given:* any review-loop phase **that reviews a named document type** — R/REQ, F/FSPEC, T/TSPEC, D/DECISIONS, P/PLAN, PR/PROPERTIES. The discriminator is *"the phase names a document type"*, not membership of a dispatch table: the round history the window is counted from is derived from that document type's cross-review basenames (M-1d), so a phase naming none has nothing to count. *When:* the review window is opened. *Then:* the window ends at round **3 counted from round 1 of
that document**, and the loop halts on entering round 4 — *whatever invocation opened the earlier rounds*.

**Scope: untyped loops are out.** Phase CR names no document type and Phase DOD runs its own loop; N-7 excludes both and **this REQ does not change that**. For such a loop, AC-1.1's per-document window, AC-1.4's reset region and AC-1.5's `W`, clearance accounting and refusal **do not apply**. What reaches them is AC-1.2's shared constant: their **per-invocation** budget becomes 3 instead of 5 — unchanged in kind, still bounded. **Deliberate**: §1's evidence was measured on review rounds and nothing about Phase CR argues it converges later; if a later measurement disagrees the answer is a second declared constant — a new threshold, hence a new REQ — never keeping 5 here. The other reading is unsafe: an untyped loop has no per-document round history to anchor a window on, so a reset region would refuse Phase CR permanently after the second clearance (O-10).

This is a **second behavioural change** — §1's per-invocation defect, without which §2's cost claim bounds nothing. AC-1.5 states the replacement rule and its escape hatch.

**AC-1.2 — One constant, one budget.** *Who:* a maintainer. *Given:* the pipeline. *When:* they change the budget. *Then:* they change exactly one declared constant (M-1a) and no arithmetic elsewhere (M-1b). Every place the budget is reported (M-1c) shows the *effective* budget, so a halt message saying "5" while the budget is 3 is a defect.

**"One" is quantified over executable declarations, repo-wide — production *and* test code, not production alone.** Afterwards **exactly one declaration in executable code states the budget's value**, and any code needing it — pipeline or test — reads that declaration, not restating it. The alternative fails operator-visibly: a duplicate not updated in the same commit leaves a green suite asserting the old width while the pipeline runs the new one — the defect one line up, moved into the oracle.

**Two kinds of site sit outside that quantifier, and both are accounted for**, since a repo-wide grep for the literal cannot by itself tell a violation from a sanctioned occurrence:

- **Prose that states the number.** Documentation cannot read a declaration — `CLAUDE.md`'s *Review loop mechanics* paragraph states the budget today, and unamended would report 5 while the pipeline runs 3, the same defect in the repo's highest-traffic reader. Not a violation of this criterion, but it **must be updated in the same commit**; O-13(b) names every such site.
- **A deliberately pinned literal that is not the budget** — an expectation whose value happens to equal today's width but whose meaning is a fixed round count. It stays a literal and **says so at its site**.

**The decidable observable is the enumeration, not the grep:** O-13(b)'s inventory is a closed list of every textual occurrence of the width, each classified as *the declaration*, *derived from it*, *prose updated in the same commit*, or *pinned non-budget literal with a stated reason*; a site absent from that list, or a second executable declaration, is the violation. **How** the declaration is reachable from tests, and **which** sites exist, are O-13's; this criterion fixes the outcome.

**The observable:** on every production entry of a **document-typed** phase (AC-1.1's scope) the admitted window runs from the origin `W` for exactly the budget's number of rounds — never wider. On an **untyped** loop, with no `W`, the observable is the same width with an unconstrained origin: the per-invocation window is the budget's number of rounds from wherever that invocation starts.

**AC-1.3 — The reduction is not silently partial, and the two quantities are named.** *Who:* the operator. *Given:* a non-convergent phase. *When:* the loop halts on the budget. *Then:*
the post-mortem's Iterations section, the phase record and the returned `iterations` field all report the **effective budget** — `MAX_REVIEW_ROUNDS`, 3 at the declared default (§6);
`iterations` is the **budget**, not the rounds run (M-1c). Because AC-1.5(1) makes a **zero-round** halt the commonest new case, the Iterations section also states the **rounds this
entry ran** — `0` there — so the two are never conflated where the operator reads them. Both asserted **over the constant**, never the literal `3`.

**On every halt in scope, including one that finds an existing post-mortem** — no exception for a re-halt, the case this criterion exists for: a second entry into an exhausted window is by construction a zero-round halt, so an operator reading the *previous* halt's `rounds run {k}` there reads exactly the conflation this criterion prohibits, on the commonest new case. **So the section is refreshed by the halt, and AC-1.4 carves it out of its byte-unchanged rule** (split §5.6) — not re-authoring, but a two-integer render the loop computes, no agent and no `## Recommendation` involved.

**The render is declared, not left to the implementer.** HEAD's section is a fixed literal carrying one number and the phrase *"limit reached"* (M-1c), false on a zero-round entry, so this replaces it: §6's `Iterations (budget {MAX_REVIEW_ROUNDS}, rounds run {k})` — two labelled integers, making O-10's leg an equality, not a substring match any rendering satisfies. **O-14 produces it on both the creating halt and the re-halt; O-10 asserts it on both.**

**AC-1.4 — Existing halt behaviour is unchanged in kind, and every halt maintains the reset region.** *Who:* the operator. *Given:* the budget is exhausted. *When:* the loop halts.
*Then:* it halts as it does today — writing `POSTMORTEM-{phase}-{feature}.md`, confirming the write, not trusting the agent's reply, and refusing to re-run the phase until
a human writes `RESOLVED: yes`. This REQ changes *when* the halt happens, not *what* a halt is.

Two things about that write do change, because this REQ puts machine-written state in that file: `POSTMORTEM-{phase}-{feature}.md` is a **fixed**, unversioned path, so a document that
halts twice would have its post-mortem written twice, and the reset region (S-12) lives there.

**So a halt that finds an existing post-mortem does not re-author it.** *Who:* the operator. *Given:* a halt in the scope below whose post-mortem already exists. *When:* the halt is taken. *Then:* the loop performs clauses 1 and 2's region maintenance, **refreshes the Iterations section to AC-1.3's render for *this* halt (clause 3)**, and **changes nothing else** — no authoring dispatch, every other section including `## Recommendation` byte-unchanged. Only a halt finding **no** post-mortem authors one (M-7e). Why — the answered `## Recommendation`, and the cost of an authoring dispatch on an entry that dispatched no reviewer — is stated once for both ends at `pdlc-rcv-split.md` **§5.6**. **What a re-halt looks like:** the same body, one new `HALT-REASON:` line, the spent `RESOLVED:` marker gone, the Iterations line rewritten to this halt's numbers — exactly the record the accounting needs, and exactly what tells the operator this is not the halt they already answered.

**The scope of "every halt".** The rule below is quantified over **every halt that writes `POSTMORTEM-{phase}-{feature}.md` for a document-typed review-loop phase** (AC-1.1's scope, M-7e) — **not** over the pipeline's other halt classes (creator-agent failure, branch guard, listing failure, Phase PUB/CI, Phase DOD), none of which writes a post-mortem at HEAD or is asked to start (N-4), nor the phases N-7 excludes. So `H` counts **post-mortem-writing halts of this phase for this document** — the only halts leaving a marker for a clearance to clear, making the pairing exact. No exception within that scope:

1. **the reset region exists after the halt, and it carries this halt's line.** A halt finding **no existing post-mortem** — the first halt of a phase, creating the file —
   **creates `## Reset Region` containing exactly one `HALT-REASON:` line, its own**. A halt finding an existing post-mortem **preserves** the region — every `WINDOW-START:` (S-13),
   `WINDOW-RESUMED:` (S-14) and `HALT-REASON:` (S-15) line already in it, in document order — and **appends its own `HALT-REASON:` to the end**, nothing above or between them. One rule
   read over an empty starting region. So `H` is **exactly the number of halts in scope** on every path, and AC-1.5(5)'s *"the last `HALT-REASON:`"* is the most recent halt's.
2. **any `RESOLVED:` line already in the file is stripped** — every **unfenced** one, wherever it sits. The post-mortem is thus **unresolved after the halt**, and the operator must
   clear *this* halt before the phase runs again. Scoped to unfenced lines because every other reader is (M-7a, M-7d): a fenced `RESOLVED: yes` is invisible to the gate either way, so the
   scoping changes no decision and stops the halt path editing prose inside a human's code fence. **The strip reaches inside the region span too, without collision:** a `RESOLVED:` line is
   *never* a region line (catalogue §1 reads only the three prefixes), so the two rules quantify over disjoint sets.
3. **the Iterations section states *this* halt's two quantities** — §6's render, `{k}` the rounds this halting entry dispatched (AC-1.3). A creating halt's authored section carries it; a re-halt
   rewrites that one section and nothing around it. With clauses 1 and 2 this is the **closed list** of what a re-halt changes — the region span, every unfenced `RESOLVED:` line, the Iterations
   section — and everything else is byte-unchanged — what O-10's re-halt oracle compares against.

**Why the creating halt is stated, why clause 2 strips, not counts, and why the human-only prohibition is untouched (removing a spent marker is not writing one, N-4): split §5.6**, over M-7a. **The region is the loop's guarantee, not an agent's diligence** (M-7e) — O-5 owns it; O-9's prompt clause is belt-and-braces.

**AC-1.5 — The window is absolute, and only an operator resets it.** *Who:* the review loop. *Given:* a phase whose document already carries cross-review rounds on the branch (M-1d). *When:* the phase is (re-)entered. *Then:*

1. the window's **end** is round 3 counted from the **origin** `W` (clause 4; `W = 1` when no reset is in effect), not from the highest existing round: with `W = 1`, a branch whose highest
   existing round is 2 is admitted **round 3 only**, and one at 3 or more is admitted **no rounds** and halts at once on the budget path (AC-1.4), emitting S-4 rendered as the window's
   own range and the effective budget — **computed from the window and the constant**, never the literal `1..3 of 3` (§6). **Not reached on an entry whose region fails to validate**
   (clause 4): that entry refuses before the budget is evaluated, so no halt and no S-4.

   **The zero-round budget halt has a report row, row C** — the **third** dispatch-less row, stated
   cell by cell here as the catalogue requires of the REQ owning the condition. `round` = **the start
   clause 2 resolves**; `panel-shape`, `blocking`, `growth-bytes`, `classification` **empty**, nothing
   dispatched or measured; `notice` = this halt's **S-4** reason, `; `-joined with any co-occurring
   reason in catalogue §3 precedence order — **vacuous on row C, deliberately**: no round is
   dispatched, so no S-3/S-5/S-6 can be raised, and rows B and C are mutually exclusive, so no S-16
   either. A test may assert the cell is **exactly** the S-4 render, no separator. The join stays in
   the cell so the rule is one rule at every row;

   **`forcePhases` does not grant a window; the clearance is the only route past the cap.** It
   overrides a **recorded approval** and nothing else (`CLAUDE.md`, *Entry (single feature)*), so a
   forced Phase R on a document already at round 3 is admitted **no rounds**: it halts on the budget
   path, maintains the region and row C, and writes the queue row `halted`. **A second force changes
   nothing, and what stops it is the shipped step-G refusal, not the counts.** The first forced halt
   leaves `H = 1` and, by AC-1.4 clause 2, strips the `RESOLVED:` line, so the region reads
   `H = 1, A = 0` — `A < H`, a clearance *outstanding*. The second force is refused because the
   post-mortem is now unresolved (M-7a). The counts are not the gate here; they are what the operator's
   *next* `RESOLVED: yes` will spend. A deliberate change to a documented entry point, stated so it has
   an oracle;
2. the window's **start** is unchanged — one past the highest existing round (M-1d), so review history stays append-only and no existing file is ever overwritten. **When that derived start falls
   *below* the origin `W`, the origin wins: the entry starts at `W`** — the start is the later of the
   two, always inside `{W … W+2}` and never below it — what clause 4's *"rounds below `W` are
   outside the window"* asserts. Reachable by a documented operator act and by no loop path: deleting
   cross-review files after a window was granted while the post-mortem survives (this branch's own
   `e9f3264`). Both properties survive the choice — **append-only**, since a start above `highest + 1`
   collides with no file; and **no window widened**, since the window is still three rounds from `W`,
   some now unspent again. The alternative would place a round outside every window, countable by no
   clause;
3. the **one** reset is an operator's: a post-mortem carrying a human-written `RESOLVED: yes` outside any fenced block clears the halt, and rounds recorded *before* that marker do not count
   against the window opened after it. The existing escape hatch, stated because it is what makes an absolute cap operable, not a dead end — an operator who addressed the finding
   gets a fresh window, an unattended re-invocation does not. **No agent and no script ever writes `RESOLVED: yes`**;
4. **the reset is anchored and consumed, in the POSTMORTEM, by the loop.** The **reset region** is read as two counts: `H`, the number of `HALT-REASON:` lines, and `A`, the number of
   `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines — both counted **by line prefix, whatever the value**, so a malformed value contributes no origin (§6) but still answers a halt. A clearance is **unconsumed** exactly when all three hold: a `RESOLVED: yes` is readable, `A < H`, **and the region
   validates** (the named predicate below). On any entry that observes all three — there is no observable "first entry"; the counts are the whole state — the loop **appends** exactly one answering
   line to the **end** of the region — `WINDOW-START: {N}` on a convergence halt, `WINDOW-RESUMED: {W}` on an S-11 halt (clause 5) — making `A = H` again. For `WINDOW-START:`, `N` is
   **the start clause 2 resolves — the later of one past the highest round then on the branch and the origin `W` then in effect** — and becomes the new origin `W`: the budget of 3 is counted
   from `W`, and rounds below `W` are outside the window. When `A = H` every halt so far has been answered and the loop writes nothing and grants nothing.

   **So `WINDOW-START:` values are non-descending on every path** — normative, and what makes baseline §3.2's
   *greatest* and *last well-formed* readings coincide and keeps the region valid under `REQ-RCV-07`
   AC-7.1. Why, once for both ends, at split **§5.5**. **Accepted consequence:** after a deletion the
   granted window may span the round numbers the deleted files held — correct, since those rounds no
   longer exist on the branch, so all three slots are dispatchable.

   **"The highest round on the branch" always means: of the document type under review** — clause 2's
   start, this clause's `N`, row C's `round` cell, and in the successor the range check and row B's
   `round` cell (M-1d), never the whole directory, holding several document types at once and
   reads differently. A window is a property of a document.

   **The clearance is spent only when the answering line durably exists**, and it must exist **before
   any round of that entry is dispatched** — that line is the sole record keeping the clearance
   one-shot, and a lost one re-grants a window every invocation, the fail-open this criterion closes.
   So it carries the **same confirmation obligation AC-1.4 puts on the post-mortem write**, fail-closed
   on failure: no window, no dispatch, the entry **refuses the phase**. A partially-landed line is
   **`REQ-RCV-07` AC-7.5**, rendered per **catalogue §4**, minting **no new catalogue id and no new
   S-16 reason** — a fault of the loop, not a state of the region. Why the ordering: split **§5.5**.

   **Answering lines are appended, like `HALT-REASON:` lines** — **normative**: document order is
   event order, and validation reads each line against those before it. Lines landing out of order
   fail validation ⇒ `W = 1` permanently, since AC-1.4 clause 1 preserves the region verbatim.

   **The third conjunct, as a named predicate.** *The region validates* is a predicate on the region
   and the branch listing, **total and single-valued** (DC-01), whose decision procedure is
   `REQ-RCV-07` AC-7.1's and is **not restated here** (X-06). This REQ fixes its **meaning and failure
   disposition**:

   - **true** exactly when every answering-line value is well-formed and consistent with the lines
     before it and with the highest round on the branch, **and** `H − A ∈ {0, 1}`. The empty region
     satisfies it vacuously — empty is valid, not corrupt;
   - when **false**, fail-closed in all four respects at once: **`W` = 1**; **the clearance is not
     consumed** — no answering line written, neither count moves; the run report emits exactly one
     `reset-region-corrupt: {reason}` notice (S-16, per catalogue §2); and the entry **refuses the
     phase**, not halting, terminating the invocation as an unresolved post-mortem does
     (M-7a, M-7b), with the queue row written `halted`. The refusal's semantics, strings and sanctioned
     repair per reason are `REQ-RCV-07` AC-7.2, AC-7.4 and §6; its report row is that REQ's AC-7.6
     (row B).

   **This conjunct becomes operative when `REQ-RCV-07` ships** (X-06): until then the gate is its two
   decidable conjuncts, so the dispositions above — and baseline §3.2's rows restating them — are **target
   state**, fixed here so later ship adds no requirement. **Validation is a conjunct of the gate,
   not merely a constraint on `W`** — this REQ's claim, arithmetic at `pdlc-rcv-split.md` **§5.2**. **A
   refusal is not a halt: the entry returns without running the rest of AC-1.5**, takes no halt and
   leaves the marker in place — why, at split **§5.3**; the refusal in full at `REQ-RCV-07` AC-7.2.

5. **every halt records which halt it was, and a no-revision halt resumes the window, not replacing it.** Each halt appends exactly one `HALT-REASON: {value}` line to the **end** of
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
   `no-revision:`. **Three rows, not four: "absent" is unreachable** — the table is read only on an entry observing an unconsumed clearance, whose gate requires `A < H`, hence `H ≥ 1`.
   The *absent* case is the region's, one level up, and is S-12's.

   **Every clearance is answered by exactly one line, including this one** — same confirmation
   obligation and fail-closed disposition as `WINDOW-START:` (split **§5.5**).

   **Row B — the report row of a refusing entry, in two variants** — is `REQ-RCV-07` AC-7.6's. It is
   **row C's complement**: B's entry takes no halt, C's takes one, so B never carries S-4 and C never
   carries S-16.

All five clauses' durable observables are baseline §3.2's, already read by the loop. Nothing here needs a clock, a process identity or a memory of a previous invocation.

**Observability.** The highest `-v{N}` for a document with no resolved POSTMORTEM never exceeds 3; past the window **no reviewer is dispatched** and no new cross-review file appears; the post-mortem carries both quantities (§6) and the S-4 reason.

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3, with this REQ's per-row notes at
**baseline §3.1**. This REQ **owns** six rows and reads two more; a threshold used here and absent
there is a defect. **The three refusal-render rows v1.6 carried here are `REQ-RCV-07` §6's and
catalogue §4's** — this REQ mints no **refusal** string, and exactly **one** operator string **not
already rendered by the catalogue**: AC-1.3's Iterations render. (S-4 is owned but not minted here:
its render is catalogue §2's, character for character, and this REQ may not amend it.) The S-13/S-14
grammars are **not** restated below: they are baseline §3's, cited once in the row beneath, and their
being **in force at this ship** — not deferred with the consistency checks (X-06) — is asserted there.

| Row | Owned / read | Default and note |
|---|---|---|
| `MAX_REVIEW_ROUNDS` | owned | **3** (was 5); baseline §3 for the derivation, §3.1 for this REQ's note. **Exactly one *executable* declaration repo-wide** (AC-1.2), test code included; prose sites and pinned non-budget literals are outside that count but inside O-13(b)'s enumeration — the criterion's decidable observable |
| **`Iterations (budget {MAX_REVIEW_ROUNDS}, rounds run {k})`** | owned | **That exact render**, two decimal integers ≥ 0, in the post-mortem's Iterations section — restated here because AC-1.3 needs a fixed string, not a shape. It **replaces** the baseline literal, whose single number and *"limit reached"* phrase are false on the zero-round halt (M-1c). `{k}` is the rounds the halting **entry** dispatched, so it is rewritten on a re-halt too (AC-1.4 clause 3). Baseline §3 carries the row; O-14 produces it, O-10 asserts it |
| `## Reset Region` (S-12), `HALT-REASON:` (S-15), `reset-region-corrupt:` (S-16), `budget-exhausted:` (S-4) | owned | **Stated once in baseline §3, notes at §3.1.** **S-4 excepted: outside baseline §3 deliberately, its render fixed by catalogue §2** |
| **`WINDOW-START: {N}` (S-13)**, **`WINDOW-RESUMED: {W}` (S-14)** | owned | **Grammar baseline §3's, notes §3.1's; both grammars are IN FORCE AT THIS SHIP**, not deferred (X-06), because baseline §3.2's `W` row depends on them: a value outside the grammar contributes **no value to `W`** while still counting toward `A` (AC-1.5(4)). **Well-formed `WINDOW-START:` values are non-descending** across the region, since AC-1.5(4) writes the resolved start |
| `no-revision: …` (S-11) / `fixed-point: …` (S-3) | **read** | As the catalogue fixes them; emitted by `pdlc-rcv-fixed-point-stop` (X-05). Baseline §3.1 for how AC-1.5(5) reads them |

## 7. Non-goals and out of scope

The shared list is baseline §4 (**N-1 … N-10 only**): `N-1, N-2, N-3, N-4, N-7, N-9, N-10` apply
unchanged; `N-5`, `N-6`, `N-8` are **inapplicable, not overlooked**. **Ids above `N-10` are not
shared** — the family minted colliding `N-1x` ids — so this document's own non-goals use the per-REQ
namespace `NB-*`. `O-*`, `R-*` and `X-*` are **not** namespaced, so split §5's rule applies: every
cross-document citation names the owning REQ. The rows worth pointing at:

| # | Not in scope | Why |
|---|---|---|
| **N-4** (shared) | Changing what a halt is. | AC-1.4: the POSTMORTEM path, the write confirmation and the rule that **only a human ever writes `RESOLVED: yes`** are untouched, as is the gate reading it (M-7a). This REQ changes *when* a halt happens and *what it says* — plus clause 2's one lifecycle change, fail-closed. |
| **N-7** (shared) | Applying these mechanisms to Phase CR or Phase DOD. | Restated because AC-1.1 says so: untyped loops keep a per-invocation budget, take the shared constant's new value, and get no reset region. |
| **NB-1** | The fixed-point test, the zero-delta test, how a round's blocking count is read. | `pdlc-rcv-fixed-point-stop`'s. This REQ states only the window they are evaluated inside and the halt path they halt on. A finding that it never says *when* the loop compares two rounds is **correct and known**. |
| **NB-2** | The verifier panel, the growth measurement, the anchor writer. | `pdlc-rcv-panel-topology`'s. A finding that it does not define `DOC-BYTES:` is **correct and known** — file it Low. |
| **NB-3** | **How** the region is validated, what a partially-written answering line leaves behind, which strings a refusing entry emits, the sanctioned repair per S-16 reason. | `REQ-RCV-07`'s (X-06). AC-1.5(4) fixes the predicate's meaning and fail-closed disposition; the procedure, refusal semantics, repair taxonomy and row-B renders are AC-7.1–AC-7.6 and catalogue §4. A finding that this document states no algorithm, pins no shipped string, or omits what a torn write leaves behind is **correct and known by construction**, as is the conjunct being **not in force** at this ship — file it there. |
| **NB-5** | Making the window survive Phase H, or restoring a region `harvest-learnings` deleted. | The post-mortem is the region's home and harvest deletes it once LEARNINGS exists (§4.1) — benign within a feature, and a post-harvest re-entry gets `W = 1`, `H = A = 0`, the default of a feature that never halted. A finding that a post-harvest re-entry has no window history is **correct and known**; a surviving home is a new artifact, hence a new REQ. |
| **NB-4** | Asserting anything about `orchestrate-dev.js`'s control flow that is not a measured fact. | Per the predecessor post-mortem's root cause 1, this document cites shipped behaviour **only by `M-*` id**, with no line citation. A claim about a guard, an emit or a branch belongs in the baseline, and a criterion needing one belongs in `REQ-RCV-07`. |

## 8. Downstream obligations

A finding of the form "this AC has no oracle / fixture / seam / test" is answered here — an obligation
on FSPEC, TSPEC, PLAN or PROPERTIES, not a REQ revision (§9's stopping rule).

| # | Obligation | Owner |
|---|---|---|
| **O-5** | Specify how AC-1.4's **reset region survives every halt** — loop-owned state, **not** a prompt clause. The outcome is fixed here: the first halt creates the region, a later halt preserves every line and appends its own, unfenced `RESOLVED:` lines are stripped, and a region lost or unwritable is **reported fail-closed**, not proceeded past on a silently widened window. Partial outcomes land fail-closed too (`W` = 1, or S-16 and a sanctioned repair). | TSPEC |
| **O-12** | Specify **how `W` is resolved before the round window is computed**, and how the *region validates* predicate is supplied to the clearance gate; the halt path's region maintenance is O-5's. **The seam's contract is fixed in exactly one place, `REQ-RCV-07` O-12** — one-directional: this REQ's TSPEC adopts it and states none of it (corrected at v2.7, since the two obligations previously cited each other). What this REQ owes is the interim composition's **observable**: the predicate is reachable from the gate and consulted **zero times** while the conjunct is unwired (X-06) — O-10's 0-call leg; behaviour, not a signature. Observables fixed here: the gate is **fail-closed**, a non-validating region refusing the phase and consuming nothing; the report carries **exactly one** `reset-region-corrupt: {reason}` notice; `W` falls back to **1** whenever no well-formed `WINDOW-START:` value exists (§6, baseline §3.2). | TSPEC |
| **O-9** | The post-mortem prompt gains a belt-and-braces clause telling the agent `## Reset Region` (S-12) is machine state to leave alone (M-7e). **Not the mechanism**; O-5 is. | FSPEC → implementation |
| **O-10** | Properties and tests, at observable-outcome level. **Region maintenance (AC-1.4):** the first halt creating `## Reset Region` with exactly one `HALT-REASON:` line, and the operator's first clearance then granting a window; a later halt preserving the region and stripping the spent marker, so the phase reads unresolved again; a **fenced** `RESOLVED: yes` surviving the strip while an unfenced one is removed; region lines **appended, not prepended**; a **Phase CR halt creating no `## Reset Region`** (N-7) — non-vacuous, since untyped phases reach the same halt path and do write a post-mortem (**M-7f**), so the leg asserts a file that exists lacks the section. **The window (AC-1.1–AC-1.3, AC-1.5(1)–(3)):** budget and reported iterations asserted **over the constant, never a literal**; **row C** cell by cell with **zero dispatches asserted positively** — a dispatch count of `0` alongside the absence of any new cross-review file, since a double that writes nothing satisfies absence either way; a **forced** phase on an exhausted document halting, not re-reviewing, and a second force refused as unresolved (M-7a) — on the fixture **no prior post-mortem → force → zero-round halt → force again**, the path reaching a first force with no unconsumed clearance present (a resolved post-mortem with `A < H` grants a window on that entry, so it would dispatch). **The gate (AC-1.5(4)–(5)):** one clearance granting **exactly one** window (`A < H` grants, `A = H` nothing); an S-11 clearance writing `WINDOW-RESUMED:`, `W` unchanged, a later convergence halt **not** auto-cleared. **Validation-dependent legs go to `REQ-RCV-07` O-10** (X-06): the refusal, its renders and *a non-validating region consuming no clearance* belong where the conjunct is in force.

**Four legs this REQ keeps, not defers**, over the fixtures — and, for the first, the rationale — at split **§5.4**. (1) **The 0-call contract leg:** on **leg 1**, the interim composition consults the *region validates* predicate **exactly 0 times**, asserted as a count. (2) **Legs 1 and 2** — the granting region, and no region at all — each with **≥ 1** dispatch asserted positively. (3) **The interim-only malformed-value leg** (**leg 3**): a malformed `WINDOW-START:` still counts toward `A` but contributes no origin, so `W` = 1 and no non-numeric value reaches the window arithmetic; decidable from §6's grammar alone, so it is this REQ's, and **interim-only — it inverts at row 18**. (4) **The derived start below `W`** (AC-1.5(2)), both legs stated by the **highest existing round**, since "start" and "highest + 1" read alike and the pair must discriminate. *Granting leg:* `W = 4`, clearance already spent (`A = H`, so this entry grants nothing and `W` is durable), every cross-review file of that document type removed ⇒ **no** highest existing round, derived start 1, origin wins ⇒ the entry starts at **4**, dispatches, overwrites nothing. *Control:* the same `W = 4` with highest existing round **6** ⇒ derived start **7**, past the window end `W + 2 = 6` ⇒ **halts on the budget path**, no dispatch. A control at highest **5** would *dispatch* — round 6 is the window's last slot — so it discriminates nothing.

**Two legs AC-1.3 and AC-1.4 add.** (i) The Iterations section as an **equality on §6's declared render**, both integers — not a substring match, which any rendering satisfies — on **two named fixtures**: the creating halt, and the **re-halt** on a post-mortem whose section reads `rounds run {k}`, `k > 0`, asserted to read `rounds run 0` after (AC-1.4 clause 3). The second fixture is the point: it is the case AC-1.3 exists for, and the leg is vacuous without it. (ii) The **re-halt leg**: **0** authoring dispatches, and only what AC-1.4's three clauses mandate changed — stated as **byte-equality against the expected file, the prior bytes with clauses 1, 2 and 3's edits applied**, plus the dispatch count, since a body an agent rewrites identically satisfies neither alone. *"A byte comparison with the region span excised"* would be unsatisfiable on every reachable fixture: a re-halt is reachable only through a post-mortem the operator resolved (M-7a), so every such fixture carries an unfenced `RESOLVED: yes` **outside** the region which clause 2 removes.

**One property-based obligation, not only the enumerated points.** The origin-and-counts resolution is a parser over an ordered line sequence, and the interleaving of the three prefixes is what enumerated fixtures cannot cover. Over **generated** sequences (arbitrary order, well-formed and malformed values, arbitrary `RESOLVED:` state) assert: `W` is always a decimal integer ≥ 1; `W` never exceeds the greatest well-formed `WINDOW-START:` present, **or is `1` when none is present** — so the bound is total over the declared domain, including sequences with no well-formed `WINDOW-START:` at all (leg 3's shape, or a region of only `HALT-REASON:`/`WINDOW-RESUMED:` lines), where a bare *max* is over the empty set; no absent or malformed value ever **widens** the window; at most one answering line per entry. The fail-closed direction is the property.

**DC-03 routing.** Every assertion whose failure is the **only** signal of its defect — the 0-call count, budget and `iterations` over the constant, one clearance granting one window, row C's zero-dispatch conjunct, the re-halt byte comparison — is load-bearing under DC-03 and passes the falsification cycle recorded in `FALSIFICATION-LEDGER.md`: mutation named in writing before the run, red ids recorded, revert re-verified green, any assertion with no nameable mutation filed as a **Residual**. The ledger's **lifecycle disposition is O-15's**. | PROPERTIES |
| **O-13** | Own the **budget-width change's blast radius**, which AC-1.2 states as an outcome and does not resolve. Two parts, both due before implementation, not discovered inside it. (a) **Decide how test code obtains the effective budget**, so AC-1.2's one executable declaration and AC-1.3's "asserted over the constant" are simultaneously satisfiable — today they are not: the constant is unexported and the suite keeps its own copy, the second declaration AC-1.2 forbids, disagreeing with the module the moment 5 becomes 3. Exporting it, or any other single-source mechanism, is TSPEC's call; keeping two is not, because it is the defect. (b) **Enumerate every site encoding today's width of five** before the change, classifying each per AC-1.2. Executable sites — the round-derivation, pacing-wrapper (including an acceptance-test *title* naming the width) and review-loop suites — are re-expressed over the constant, or kept as a **pinned non-budget literal** with the reason recorded at the site. **Prose sites too**, since AC-1.2's quantifier does not reach them: name every document stating the budget — `CLAUDE.md`'s *Review loop mechanics* paragraph is the known one, loaded into every session and pdlc dispatch here — updated **in the same commit**, so the highest-traffic reader never reports 5 while the pipeline runs 3. Whether a document-drift oracle (`coveredViolations`) or a checklist line carries that is TSPEC's call; leaving prose unnamed is not. **The enumeration is AC-1.2's decidable observable**, and an implementer meeting these mid-PLAN re-decides (a) under time pressure. | TSPEC |
| **O-14** | Produce AC-1.3's Iterations render — **both** quantities, at §6's declared string — replacing the baseline literal (M-1c), meaning threading the rounds this entry ran to wherever that section is produced. Also specify the **no-re-author** path AC-1.4 requires: on a halt finding an existing post-mortem the file changes in exactly three places — the region span, every unfenced `RESOLVED:` line, and the Iterations section refreshed to *this* halt's numbers (clause 3) — everything else byte-unchanged, the refresh being a loop-computed render, not an authoring dispatch. **Mechanism only: this obligation does not vary the outcome** — the ACs fix what the operator reads, and no downstream document amends them. | FSPEC → implementation |
| **O-15** | Carry a **lifecycle disposition for every tracked artifact this feature introduces** — DC-10 places that line in the PLAN, so it is not O-10's. The one artifact is `FALSIFICATION-LEDGER.md`: harvest deletes `CROSS-REVIEW-*`, `CODE_REVIEW-*` and `POSTMORTEM-*` but **not** this file, the durable record of which assertions were proven to fail. Precedent: `docs/completed/pdlc-workflow-distribution/PLAN-…md` §3.1. | PLAN |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, honouring the repo's workflow-runtime constraints (`CLAUDE.md`), so the shipped artifacts behave as the tests do. **The freshness gate is load-bearing under DC-03** and is this repo's named example of a dead oracle — falsified by mutating the built artifact and observing the check red, recorded in `FALSIFICATION-LEDGER.md`, not asserted by running it on an already-fresh tree. | implementation |

## 9. Risks, assumptions and deferrals

### The stopping rule for this document's own review loop

Pasted from `docs/_constraints/DOMAIN-CONSTRAINTS.md` **DC-09** deliberately, not cited: DC-09's own
evidence is that a stopping rule *"living only in a constraints file nobody loads does nothing"*,
while the same rule written into the REQ changed both reviewers' behaviour at once. This document
most needs it — it has already exhausted one Phase R window (R-1). **Reviewers may cite these by name
to route a finding downstream, not block on it.**

- A round whose blocking findings are **all** implementability or oracle-falsifiability defects — none
  contesting user need, scope, priority, or phasing — means the REQ has met its bar. **Approve it and
  move the findings downstream** as named entry obligations; §8 exists to receive them.
- A finding of the form *"this AC has no oracle"* must be closable by **deferring** the oracle to
  TSPEC or PROPERTIES, not only by writing one into the REQ — otherwise it is closable only by adding
  prose that the next round reviews, the fix-begets-finding loop this feature exists to bound.
- **Two consecutive rounds with a non-decreasing blocking count is a fixed point, not slow
  convergence**, and a round in which the document grows while the count does not fall is stronger
  evidence of the same. Distinguish plateau from **churn**: a non-decreasing count is not a fixed
  point when all prior findings closed and the new blockers came from the latest revision — but say
  so explicitly, and pre-commit to escalating if the next round does not close them.
- A REQ does **not** specify trace grammars, fault-injection vocabularies, fixture construction,
  coverage floors, emitter escaping or property-generation axis tables. A finding that it
  omits one is evidence it is at its layer, not of a gap.

| # | Risk | Disposition |
|---|---|---|
| **R-1** | **This REQ is reviewed by the loop it is changing, under the old behaviour** — five per-invocation rounds, no enforced stop. The predecessor's Phase R died exactly here. | **Mitigated by the stopping rule pasted above**, the structural mitigation DC-09 evidences, replacing v2.6's *"accepted and unenforceable"* disposition. Also mitigated by splitting the parent, depending on no unmeasured runtime fact (baseline §5), and keeping this document short. **Residual:** the rule binds reviewer and author behaviour, not the loop — mechanical enforcement is this REQ and its successor, neither shipped — so the operator still watches the trajectory and can halt by hand. |
| **R-12** | **A repeating S-11 halt is unbounded.** Each S-11 clearance leaves `W` unchanged and (per the successor's AC-2.8) costs the window no round, so a zero-delta authoring side yields an unbounded halt/clearance sequence with `H` and `A` growing together. | **Accepted, bounded by the operator, not the loop.** Every iteration costs one hand-written `RESOLVED: yes`, so it is never unattended; capping it needs a second counter that could only deny an operator *choosing* to continue. |
| **R-13** | **Migration: branches already carrying more than three rounds.** At the landing commit, every in-flight phase whose document has 3+ rounds is admitted no rounds and halts, rendering S-4 as `rounds 1..3 of 3` while five rounds sit on disk. | **Correct and expected** — the render states the *window*, not the file count. The escape is the ordinary clearance (AC-1.5(3)); no migration script. |
| **R-10** | **The region is machine state in a file an operator is instructed to edit.** A hand-edit can make the counts lie either way, and one way restores the per-invocation budget AC-1.1 abolishes — silently, fail-open. | **Mechanised, not accepted.** AC-1.5(4) makes *the region validates* a **conjunct of the clearance gate**, so an untrustworthy region consumes and opens nothing; the deciding mechanism and sanctioned repairs are `REQ-RCV-07` AC-7.1/AC-7.4. Residual: §6's *never authored by a human*. |
| **R-14** | **This REQ's *region validates* decision procedure is not implementable until `REQ-RCV-07` ships** (X-06), **three** intervening features away — row 18, net pickup **10 → 12 → 13 → 17 → 18** (§3.1). One intervening row is **row 17**, emitting S-11. | **Mitigated by not bringing the conjunct into force until its procedure exists** — not by sequencing, weaker still at this distance, and not by an interim procedure; all three rejected once for both ends at split §5.1. Until then every branch keeps HEAD's behaviour: no refusal, no S-16. **Two residuals, accepted and time-boxed to row 18.** (i) R-10's hand-edited-region fail-open — operator-caused, no wider than HEAD's, where it is open unconditionally. (ii) **From row 17 onward, machine-written `WINDOW-RESUMED:` lines land in regions nothing validates** — *not* covered by "no wider than HEAD's", since HEAD writes no region lines at all. Accepted because the exposure is bounded by the accounting the two live conjuncts enforce: the line still answers exactly one halt, so the worst case is an origin the operator can read and repair once AC-7.4 exists. If row 17 is picked up first, that is the moment to reconsider **moving row 18 ahead of it by `Order`** — a queue decision, not a requirement. Nothing requires the two halves in one plugin release, so no `pdlc/RELEASE-CHECKLIST.md` line is owed. |

**Deferrals and their binding.** This REQ defers nothing of its own. The predecessor's deferrals go to
the successors carrying the criteria that raise them — cross-panel comparability and finding identity
to `docs/discarded/pdlc-review-convergence-calibration/`, the authoring-side zero-write residue to
`docs/pdlc-runtime-measurement-spike/` — both recorded in `pdlc-rcv-fixed-point-stop` §9, each stub
`ready: false` until an operator specifies it and opts it in.

## 10. Traceability

| Requirement | Baseline measured facts | Baseline defect | User story | Obligations |
|---|---|---|---|---|
| REQ-RCV-01 | M-1a, M-1b, M-1c, M-1d, M-1e; M-7a, M-7b, M-7d, M-7e, M-7f | P-1 (cost half) | US-01, US-02, US-04 | O-5, O-9, O-10, O-11, O-12, O-13, O-14, O-15 |

**Why one requirement and not two.** v1.0 carried REQ-RCV-01 and REQ-RCV-02 past the 60 KB ceiling;
v1.1 cut at the seam they already had — this REQ the **window**, `docs/pdlc-rcv-fixed-point-stop/` the
two **tests** inside it, as a `depends-on` edge. **v2.0 then cut at the altitude seam** the postmortem
named: the implementation-altitude half of AC-1.5(4) moved to `REQ-RCV-07`, the window stayed, and
**no requirement, AC, `S-*` id, threshold or user story changed meaning**. The narrative and the
*what moved / what stayed* mapping are in `pdlc-rcv-split.md` §1–§4.

**Paired edges are revised together.** `REQ-RCV-01` X-06/R-14 and `REQ-RCV-07` X-07/R-16 are the same
edge from both ends, so a revision to either is carried to the other **within the same revision** and
the reviewer checks both ends **at HEAD**. v2.7 carried the pickup-order correction; v2.8 carries
split §6's redirect wording and the relocations into split §5.4 and §5.6. The edge table and the
`O-*`/`R-*`/`X-*` collision rule are in split §5.

**Round-by-round history is deliberately not restated here:** harvest deletes `CROSS-REVIEW-*` once
LEARNINGS is written, so citing round files would be structurally wrong.
