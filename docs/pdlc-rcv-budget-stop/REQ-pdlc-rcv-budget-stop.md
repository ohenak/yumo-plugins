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
| Downstream | `FSPEC-pdlc-rcv-budget-stop.md`; `REQ-RCV-07`; every subsequent `docs/_queue/QUEUE.md` row, all of which are reviewed by the loop this REQ changes |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`9486c81`** on `main`, per the shared baseline. **This document cites shipped behaviour only by measured-fact id (`M-*`)** — no line citation, no control-flow claim of its own (NB-4). |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 2.8 | 2026-08-01 |

**v2.8** (round 2) decides three things v2.7 left undecided or self-contradictory, adding no requirement: the **Iterations section is refreshed on every budget halt**, carved out of AC-1.4's byte-unchanged quantification alongside the region (AC-1.3, AC-1.4, O-14 — whose licence for FSPEC to *amend the clause* is deleted); clause 4's `N` is the **resolved start**, so `WINDOW-START:` values never descend (AC-1.5(2)/(4), §4.1, §6); AC-1.2's *one* is quantified over **executable declarations**, with prose sites owned by O-13(b). O-10's leg (4) control corrected to `highest + 1 = 7`, its re-halt oracle stated as byte-equality against the mandated edits, its property bound made total on an empty draw; **O-15** (PLAN) takes DC-10's lifecycle disposition.
**v2.7** (round 1) answered thirteen findings: pickup order **10 → 12 → 13 → 17 → 18** (§3.1, R-14, paired into `REQ-RCV-07` X-07/R-16); the second `forcePhases` blocked by the step-G refusal, not the counts; the zero-round halt does not re-author an existing post-mortem; a derived start below `W` decided; the Iterations render declared; O-10 regained the **0-call** and interim-only legs split §5.4 cites, plus a property obligation and DC-03's ledger; O-13/O-14 added; DC-09's stopping rule pasted into §9.
**v2.6** (operator-directed) removed all implementation contracts to TSPEC altitude — signatures, seams, algorithms, write mechanics, fixture and oracle design, module placement — with no id, AC, threshold or semantic changed. **v2.5** (round 10) let the validation result carry a `{reason}` and relocated O-10's fixtures to split **§5.4**; **v2.4** (round 9) deferred the consistency check, not the word. **v1.6 … v1.2** addressed rounds 5 … 1. **On size:** shared relocation targets are exhausted and the hard ceiling is binding, so every revision since v2.5 pays for its additions by compressing prose.

## 1. Problem

This REQ carries the **window**: how many rounds a document gets, what they are counted from, and what an operator does when they run out.

- **P-1's cost half — the budget does not bound the document.** At HEAD `MAX_REVIEW_ROUNDS` is a *per-invocation* budget (M-1d), so a document can be reviewed six times across two invocations with no operator action.
- **The budget is five, and the fifth round is measurably worse than the second.** On the predecessor the blocking count bottomed at round 2, held at round 3 and rose thereafter (baseline §1.1: 11, 6, 6, 7, 9), and 66 KB — 40% of the finished document — was added by rounds running *after* its own fixed-point test fired.
- **An absolute cap needs an escape hatch, and the hatch needs durable state.** A cap counted from round 1 of the *document* is a dead end without an operator reset, and a reset leaving no record is re-granted every invocation — the per-invocation budget restored fail-open.

`REQ-RCV-07` carries **how the region is validated, what a partially-written answering line leaves behind, and what an operator does about either** — the implementation-altitude half of AC-1.5(4). `pdlc-rcv-fixed-point-stop` carries the two **tests** evaluated inside this window (P-2); `pdlc-rcv-panel-topology` P-1's *review-surface* half; `pdlc-rcv-finding-quality` P-3 and P-4.

## 2. Users and value

| ID | User story |
|---|---|
| **US-01** | *As the operator*, I want a loop that stops when it stops making progress, so a non-convergent phase costs three rounds instead of five and I am told why. |
| **US-02** | *As the operator*, I want a bounded, predictable cost per reviewed document, so a queue of ten features does not become a 3 MB corpus nobody can read. |
| **US-04** | *As the operator*, I want my one escape hatch spent exactly once and leaving a record, so clearing a halt grants one fresh window, not a window per invocation. |

**Value.** This REQ delivers the baseline §1.4 **pessimistic-regime** saving alone and unconditionally — ~40% fewer reviewer dispatches and ~40% fewer bytes than the measured run, from one constant; the only member of the family whose saving is not contingent on a regime. **The new halt does not erode it:** AC-1.5(1)'s zero-round halt is the commonest new case, and AC-1.4 makes it **dispatch no authoring agent** when a post-mortem already exists, so the cheapest entry stays cheap and the operator's `## Recommendation` is not overwritten by an agent with nothing to say. **Operator-visible surfaces:** the budget and rounds-run in the post-mortem's Iterations section and the run report; the `## Reset Region`; and row C, saying why an invocation did nothing. Row B is `REQ-RCV-07` AC-7.6's.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-01** | `pdlc-review-loop-hardening` merged to the default branch | `docs/completed/pdlc-review-loop-hardening/` exists there with that feature's full artifact set. **Satisfied at `9486c81`** (archived by `7bc559a`). | Must hold at HEAD before FSPEC authoring |
| **BL-06** | The shipped POSTMORTEM gate is intact: an unresolved post-mortem refuses the phase, records a ❌ row, terminates the invocation, and the halt writes the queue row `halted` | Behaviour present at HEAD (M-7a, M-7b) | Must hold at HEAD — AC-1.4, AC-1.5's refusal path and AC-1.5(1)'s second-force clause are stated over exactly that shape |

**Both hold at `9486c81`**, each checkable by its Resolution-form observable. No fallback if that upstream mechanism is later reverted.

### 3.1 One cross-REQ prerequisite, and what happens before it ships

This REQ is the **head of the family at requirements altitude** — nothing it needs *as a requirement* is owed by a sibling, hence the empty `depends-on`. X-06 is a decision **procedure** a sibling owes: a forward edge, not a dependency. Two clauses reach across:

| # | Direction | What crosses | Behaviour until it ships |
|---|---|---|---|
| **X-05** | **read from** `pdlc-rcv-fixed-point-stop` AC-2.8 — the S-11 reason `no-revision: …` | AC-1.5(5)'s first row, which resumes rather than resets the window on an S-11 halt | Until that REQ ships no halt path emits S-11, so the row is **unreachable**, every halt is a convergence halt, and AC-1.5(5) reduces to its second row. Stated over both from the start, so nothing is re-specified when the successor lands. |
| **X-06** | **read from** `REQ-RCV-07` AC-7.1 — the ordered validation algorithm behind AC-1.5(4)'s *region validates* predicate, and AC-7.2/AC-7.5's refusal | AC-1.5(4)'s third gate conjunct, and everything following a failure of it | A **forward** edge, not a `depends-on`: the predicate's *meaning* and fail-closed disposition are fixed below, so nothing here is under-determined; its **decision procedure** is `REQ-RCV-07` AC-7.1's, and the conjunct is **not in force until that REQ ships**. Until then AC-1.5(4)'s gate evaluates its **two decidable conjuncts** — a readable `RESOLVED: yes`, and `A < H` — and every branch behaves as at HEAD: **no refusal, no S-16**, region or none. **Not deferred:** §6's S-13/S-14 **grammar** is in force at this ship; only the analysis layer (ordering, highest round, `H − A ∈ {0, 1}`) is AC-7.1's. The rationale and the cost are stated once for both ends at `pdlc-rcv-split.md` **§5.1** (see R-14). |

**Consequence for sequencing.** This REQ is deliverable alone as a **requirement**: its window, budget, halt path and clearance accounting are determined without any successor. `pdlc-rcv-reset-region` is queued at **`Order 18`**, and the net pickup order after this row is **12 → 13 → 17 → 18**: the driver picks the lowest `Order` among `pending` rows and defers a dependency **absent from the table** to the readiness triage, so row 13 is pickable (its only dependency was removed as merged) and row **17** is picked **before** row 18, `17 < 18`. QUEUE.md's gloss *"10 → 12 → 18, with 18 ahead of 17"* inverts that comparison and is superseded here; the table is corrected with the row it describes, not here. Two consequences, both reasons X-06's interim must not be able to refuse: the interim is live across **three** intervening features and row 18's own Phase R, not one; and **row 17, which emits S-11 (X-05), ships first**, so `WINDOW-RESUMED:` lines are machine-written into the region while the validation conjunct is still unwired — the one interim exposure not merely *no wider than HEAD's*, since HEAD writes no region lines at all (R-14).

`pdlc-rcv-fixed-point-stop` depends on this REQ because both its tests are stated over `W`, and `pdlc-rcv-panel-topology` on the two of them.

## 4. Definitions and the catalogue ids this REQ owns

Every term used with a family meaning — *current window* / round `W`, *reset region*, *phase refusal* and the rest — is defined in `pdlc-rcv-catalogue.md` §1 and **not** restated; that file's §2 holds the closed catalogue `S-1 … S-17` and §3 the row schema. This REQ **owns** six ids and **reads** two:

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

**One dangling citation, recorded rather than left silent.** Catalogue §4's Recovery-text row attributes the queue-reset line's suppression to *"`pdlc-rcv-budget-stop` O-6"*; this REQ has **no O-6** (split §2 moved it to `REQ-RCV-07`, and split §6's delegation does not reach an `O-*` id). Read it as **`REQ-RCV-07` O-6**. The catalogue is edited once, by that REQ (split §5), so the correction lands there.

### 4.1 Durability: what survives an invocation boundary

The loop *re-derives its state from the branch on every invocation* (M-1d, M-2f), so any criterion over in-process state is undefined on a resumed phase — the normal case. Every quantity this REQ's criteria read across that boundary has a durable home; the full map is baseline **§3.2**. The rows this REQ's clearance gate turns on stay here:

| Quantity | Read by | Durable home | If absent |
|---|---|---|---|
| **First round of the current window** `W` | AC-1.1, AC-1.5(4); `pdlc-rcv-fixed-point-stop` AC-2.1, AC-2.8 | The `WINDOW-START: {N}` lines in the **reset region** of `POSTMORTEM-{phase}-{feature}.md` — the **greatest** value present, and only if the region **validates** (AC-1.5(4)). Appended, so document order is event order | **1** — no reset in effect, the cap applies from round 1. Fail-closed: no absent or malformed value ever widens the window. **§6's grammar is in force at this ship**, so a value that is not a decimal integer ≥ 1 contributes no origin; only the **consistency** half is target state (`REQ-RCV-07` AC-7.1, X-06). Survives a second halt, since AC-1.4 preserves the region |
| **Rounds this entry ran** (AC-1.3) | AC-1.3 only | Not durable and not required to be — a property of the **entry**, computed inside the invocation that reports it; no criterion reads it later. Listed so the *"no in-process-only row"* invariant is read correctly: that invariant is over quantities the **criteria** read across a boundary | n/a — an entry knows what it dispatched; `0` on the zero-round halt |
| **Whether a clearance is still unanswered** (the reset is one-shot) | AC-1.5(4), AC-1.5(5) | The **counts**, in that same region, of `H` = `HALT-REASON:` lines and `A` = `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines — **by line prefix, not by value** (AC-1.5(4) clause 4). A clearance is unconsumed exactly when a `RESOLVED: yes` is readable, `A < H`, **and the region validates** | `A = H` ⇒ every halt answered; nothing written, nothing granted. A region that does not validate ⇒ the refusal AC-1.5(4) fixes, which moves neither count — **target state; that conjunct is not in force until `REQ-RCV-07` (X-06)** |

**The durable home has one documented deleter.** `harvest-learnings` deletes `POSTMORTEM-*` once `LEARNINGS-{feature}.md` exists (`CLAUDE.md`, *Artifact convention*). Benign within a feature — Phase H runs after every review phase, so no window outlives its post-mortem. The one consequence: a **post-harvest `forcePhases` re-entry** finds no region, so `W = 1`, `H = A = 0`, no S-16, no refusal — the same default as a feature that never halted, granting nothing the operator did not ask for by forcing (NB-5).


## 5. Acceptance criteria

One requirement. Every criterion is in Who/Given/When/Then form over an in-band observable named in baseline §2.

---

### REQ-RCV-01 — Round budget reduced from five to three

**Priority:** P0 · **Source:** US-01, US-02 · **Depends on:** BL-01, BL-06

**AC-1.1 — The budget is three, per document, not per invocation.** *Who:* the pipeline. *Given:* any review-loop phase **that reviews a named document type** — R/REQ, F/FSPEC, T/TSPEC, D/DECISIONS, P/PLAN, PR/PROPERTIES. The discriminator is *"the phase names a document type"*, not membership of any particular dispatch table: the round history the window is counted from is derived from that document type's cross-review basenames (M-1d), so a phase naming no document type has nothing to count. *When:* the review window is opened. *Then:* the window ends at round **3 counted from round 1 of
that document**, and the loop halts on entering round 4 — *whatever invocation opened the earlier rounds*.

**Scope: untyped loops are out.** Phase CR names no document type and Phase DOD runs its own loop; N-7 excludes both and **this REQ does not change that**. For such a loop, AC-1.1's per-document window, AC-1.4's reset region and AC-1.5's `W`, clearance accounting and refusal **do not apply**. What does reach them is AC-1.2's shared constant: their **per-invocation** budget becomes 3 instead of 5 — unchanged in kind, still bounded. **That narrowing is deliberate, not tolerated**: §1's evidence — blocking counts bottoming at round 2 and rising after round 3 — was measured on review rounds, and nothing about Phase CR argues it converges later. If a later measurement disagrees, the answer is a second declared constant for the untyped loops — a new threshold, hence a new REQ — never keeping 5 here. Stated because the other reading is unsafe: an untyped loop has no per-document round history to anchor a window on, so a reset region would refuse Phase CR permanently after the second clearance (O-10).

This is a **second behavioural change** — §1's per-invocation defect, without which §2's cost claim bounds nothing. AC-1.5 states the replacement rule and its escape hatch.

**AC-1.2 — One constant, one budget.** *Who:* a maintainer. *Given:* the pipeline. *When:* they change the budget. *Then:* they change exactly one declared constant (M-1a) and no arithmetic anywhere else (M-1b). Every place the budget is reported (M-1c) must show the *effective* budget, so a halt message that says "5" while the budget is 3 is a defect.

**"One" is quantified over executable declarations, repo-wide — production *and* test code, not production alone.** That is what this criterion adds: afterwards **exactly one declaration in executable code states the budget's value**, and any code needing the budget — the pipeline or a test — obtains it from that declaration rather than restating it. Required because the alternative fails operator-visibly: a duplicate not updated in the same commit leaves a green suite asserting the old width while the pipeline runs the new one — the *"reported budget disagrees with the effective budget"* defect one line up, moved into the oracle.

**Two kinds of site are outside that quantifier, and both are accounted for rather than ignored** — otherwise the criterion has no decidable pass condition, since a repo-wide grep for the literal cannot by itself tell a violation from a sanctioned occurrence:

- **Prose that states the number.** Documentation is not a declaration and cannot read one — `CLAUDE.md`'s *Review loop mechanics* paragraph states the budget today, and after this ships it would report 5 while the pipeline runs 3, which is the very defect above in the repo's highest-traffic reader. Such a site does not violate this criterion, but it **must be updated in the same commit**, and O-13(b) owns naming every one of them.
- **A deliberately pinned literal that is not the budget** — a fixture or expectation whose value happens to be today's width but whose meaning is a fixed round count, which does not change when the budget changes. It stays a literal and **says so at its site**.

**The decidable observable is therefore the enumeration, not the grep:** O-13(b)'s inventory is a closed list of every textual occurrence of the width, each classified as *the one declaration*, *derived from it*, *prose updated in the same commit*, or *pinned non-budget literal with a stated reason*; a site absent from that list, or a second executable declaration, is the violation. **How** the declaration is made reachable from tests, and **which** sites exist, are O-13's; this criterion fixes the outcome, not the mechanism.

**The observable:** on every production entry of a **document-typed** phase (AC-1.1's scope) the admitted window runs from the window's origin `W` for exactly the budget's number of rounds — no entry is ever admitted a window wider than that. On an **untyped** loop, which has no `W` (AC-1.1 *Scope*), the observable is the same width with an unconstrained origin: the per-invocation window is exactly the budget's number of rounds, counted from wherever that invocation starts.

**AC-1.3 — The reduction is not silently partial, and the two quantities are named.** *Who:* the operator. *Given:* a non-convergent phase. *When:* the loop halts on the budget. *Then:*
the post-mortem's Iterations section, the phase record and the returned `iterations` field all report the **effective budget** — the value of `MAX_REVIEW_ROUNDS`, 3 at the declared default
(§6). `iterations` is the **budget**, not the rounds run (M-1c). Because AC-1.5(1) makes a **zero-round** halt the commonest new
case, the Iterations section additionally states the **rounds this entry ran** — `0` there — so the two are never conflated where the operator reads them. Both are asserted **over the
constant**, never the literal `3`.

**The render is declared, not left to the implementer.** HEAD's section is a fixed literal carrying one number and the phrase *"limit reached"* (M-1c), false on a zero-round entry, so this replaces it. The declared render is §6's `Iterations (budget {MAX_REVIEW_ROUNDS}, rounds run {k})` — two labelled integers, which makes O-10's leg an equality rather than a substring match any rendering satisfies. **O-14 produces it; O-10 asserts it.**

**AC-1.4 — Existing halt behaviour is unchanged in kind, and every halt maintains the reset region.** *Who:* the operator. *Given:* the budget is exhausted. *When:* the loop halts.
*Then:* it halts the way it halts today — writing `POSTMORTEM-{phase}-{feature}.md`, confirming the write rather than trusting the agent's reply, and refusing to re-run the phase until
a human writes `RESOLVED: yes`. This REQ changes *when* the halt happens, not *what* a halt is.

Two things about that write do change, because this REQ puts machine-written state in that file. `POSTMORTEM-{phase}-{feature}.md` is a **fixed**, unversioned path, so a document that
halts twice would have its post-mortem written twice, and the reset region (catalogue §1, S-12) lives there.

**So a halt that finds an existing post-mortem does not re-author it.** *Who:* the operator. *Given:* a halt in the scope below whose post-mortem already exists. *When:* the halt is taken. *Then:* the loop performs the region maintenance clauses 1 and 2 mandate and **changes nothing else in the file** — no authoring dispatch, every other section including `## Recommendation` byte-unchanged. Only a halt finding **no** post-mortem authors one, as HEAD does (M-7e). Two independent reasons: the operator's `RESOLVED: yes` answers a *specific* `## Recommendation`, and re-authoring replaces it with one an agent writes from **zero rounds of new evidence** on the commonest new case; and that same case must stay cheap, since paying an authoring dispatch on an entry that dispatched no reviewer spends roughly a review round against a §2 value claim stated in dispatches. **What a re-halt looks like:** the same body, one new `HALT-REASON:` line, the spent `RESOLVED:` marker gone — exactly the record the accounting needs and exactly what tells the operator this is not the halt they already answered.

**The scope of "every halt".** The rule below is quantified over **every halt that writes `POSTMORTEM-{phase}-{feature}.md` for a document-typed review-loop phase** (AC-1.1's scope, M-7e) — **not** over the pipeline's other halt classes (creator-agent failure, branch guard, listing failure, Phase PUB/CI, Phase DOD), none of which writes a post-mortem at HEAD or is asked to start (N-4), nor over the phases N-7 excludes. So `H` counts **post-mortem-writing halts of this phase for this document** — the only halts leaving a marker for a clearance to clear, which is what makes the pairing exact. Within that scope, no exception:

1. **the reset region exists after the halt, and it carries this halt's line.** A halt finding **no existing post-mortem** — the first halt of a phase, which creates the file —
   **creates `## Reset Region` containing exactly one `HALT-REASON:` line, its own**. A halt finding an existing post-mortem **preserves** the region — every `WINDOW-START:` (S-13),
   `WINDOW-RESUMED:` (S-14) and `HALT-REASON:` (S-15) line already in it, in document order — and **appends its own `HALT-REASON:` to the end**, nothing above or between the preserved
   lines. One rule read over an empty starting region. So `H` is **exactly the number of halts in scope**, on every path, and AC-1.5(5)'s *"the last `HALT-REASON:`"* is the most recent
   halt's.
2. **any `RESOLVED:` line already in the file is stripped** — every **unfenced** one, wherever it sits. The post-mortem is therefore **unresolved after the halt**, and the operator must
   clear *this* halt before the phase runs again. Scoped to unfenced lines because every other reader is (M-7a, M-7d): a fenced `RESOLVED: yes` is invisible to the gate either way, so the
   scoping changes no decision and stops the halt path editing prose inside a human's code fence. **The strip reaches inside the region span too, and the rules do not collide:** a
   `RESOLVED:` line is *never* a region line (catalogue §1 reads only the three prefixes), so they quantify over disjoint sets.

**Why the creating halt is stated.** Scoped only to a halt finding an existing post-mortem, the first halt would be governed by nothing: no region ⇒ `H = 0` ⇒ gate `A < H` false ⇒ the operator's **first** clearance silently swallowed. **Why clause 2.** `RESOLVED:` is a single-valued, human-owned, fail-closed marker, never a counter (M-7a): preserved, it makes the next halt's post-mortem read as already resolved, so that halt has no durable effect; a *second* marker reads as duplicated and therefore permanently unresolved — opposite failures, and the alternative's only two reachable states. **The prohibition is untouched:** removing a marker already spent is not writing one (N-4). **The region is the loop's guarantee, not an agent's diligence** — the shipped halt path imposes no preservation obligation (M-7e). O-5 owns it; O-9's prompt clause is belt-and-braces.

**AC-1.5 — The window is absolute, and only an operator resets it.** *Who:* the review loop. *Given:* a phase whose document already carries cross-review rounds on the branch (M-1d). *When:* the phase is (re-)entered. *Then:*

1. the window's **end** is round 3 counted from the **origin** `W` (clause 4; `W = 1` when no reset is in effect), not from the highest existing round: with `W = 1`, a branch whose highest
   existing round is 2 is admitted **round 3 only**, and one at 3 or more is admitted **no rounds** and halts immediately on the budget path (AC-1.4), emitting S-4 rendered as the window's
   own range and the effective budget — three slots **computed from the window and the constant**, never the literal `1..3 of 3` (§6). **Not reached on an entry whose region fails to
   validate** (clause 4): that entry refuses before the budget is evaluated, so no halt and no S-4.

   **The zero-round budget halt has a report row, row C** — the **third** dispatch-less row, stated
   cell by cell here as the catalogue requires of the REQ owning the condition, since the per-round
   table would otherwise be empty for the commonest new halt. `round` = **the start clause 2
   resolves** — one past the highest round of this document type on the branch, or `W` when that is
   higher; `panel-shape`, `blocking`, `growth-bytes`, `classification` **empty**, nothing dispatched or
   measured; `notice` = this halt's **S-4** reason, `; `-joined with any co-occurring reason in
   catalogue §3 precedence order — **vacuous on row C, deliberately**: no round is dispatched, so no
   S-3/S-5/S-6 can be raised, and rows B and C are mutually exclusive, so no S-16 either. A test may
   assert the cell is **exactly** the S-4 render, no separator. The join is kept in the cell so the
   rule is one rule at every row;

   **`forcePhases` does not grant a window; the clearance is the only route past the cap.**
   `forcePhases` overrides a **recorded approval** and nothing else (`CLAUDE.md`, *Entry (single
   feature)*), so a forced Phase R on a document already at round 3 is admitted **no rounds**: it halts
   on the budget path, maintains the post-mortem's region and row C, and writes the queue row
   `halted`. **A second force changes nothing, and what stops it is the shipped step-G refusal, not
   the counts.** The first forced halt leaves `H = 1` and, by AC-1.4 clause 2, **strips** the
   `RESOLVED:` line — so the region reads `H = 1, A = 0`: `A < H`, a clearance *outstanding*, not
   `A = H`. The second force is refused because the post-mortem is now unresolved (M-7a), and
   `forcePhases` overrides a recorded approval only. The counts are not the gate here; they are what
   the operator's *next* `RESOLVED: yes` will spend. A deliberate change to a documented operator entry point, stated so it
   has an oracle;
2. the window's **start** is unchanged — one past the highest existing round (M-1d), so review history stays append-only and no existing file is ever overwritten. **When that derived start falls
   *below* the origin `W`, the origin wins: the entry starts at `W`** — the start is the later of the
   two, always inside `{W … W+2}` and never below it, which is what clause 4's *"rounds below `W` are
   outside the window"* asserts. Reachable by a documented operator act and by no loop path: deleting
   cross-review files after a window was granted while the post-mortem survives (this branch's own
   `e9f3264`). Both properties survive the choice — **append-only**, since a start above `highest + 1`
   collides with no file; and **no window widened**, since the window is still three rounds from `W`,
   some now unspent again. The alternative would place a round outside every window, countable by no
   clause;
3. the **one** reset is an operator's: a post-mortem carrying a human-written `RESOLVED: yes` outside any fenced block clears the halt, and rounds recorded *before* that marker do not count
   against the window opened after it. This is the existing escape hatch, stated here because it is what makes an absolute cap operable rather than a dead end — an operator who addressed
   the finding gets a fresh window; an unattended re-invocation does not. **No agent and no script ever writes `RESOLVED: yes`**;
4. **the reset is anchored and consumed, in the POSTMORTEM, by the loop.** The **reset region** is read as two counts: `H`, the number of `HALT-REASON:` lines, and `A`, the number of
   `WINDOW-START:` **plus** `WINDOW-RESUMED:` lines — both counted **by line prefix, whatever the value**, so a malformed value contributes no origin (§6) but still answers a halt. A clearance is **unconsumed** exactly when all three hold: a `RESOLVED: yes` is readable, `A < H`, **and the region
   validates** (the named predicate below). On any entry that observes all three — there is no observable "first entry"; the counts are the whole state — the loop **appends** exactly one answering
   line to the **end** of the region — `WINDOW-START: {N}` on a convergence halt, `WINDOW-RESUMED: {W}` on an S-11 halt (clause 5) — which makes `A = H` again. For `WINDOW-START:`, `N` is
   one past the highest round then on the branch and becomes the origin `W`: the budget of 3 is counted from `W`, and rounds below `W` are outside the window. When `A = H` every halt so
   far has been answered and the loop writes nothing and grants nothing.

   **"The highest round on the branch" always means: of the document type under review.** Every such
   phrase here — clause 2's start, this clause's `N`, row C's `round` cell, and in the successor the
   range check and row B's `round` cell — is over that document type's cross-review rounds only
   (M-1d), never the whole directory: a feature directory holds several document types at once and the
   two readings disagree there. A window is a property of a document.

   **The clearance is spent only when the answering line durably exists**, and it must exist **before
   any round of that entry is dispatched**. That line is the sole record keeping the clearance
   one-shot; a lost one re-grants a fresh window every invocation — the fail-open this criterion
   closes — so it carries the **same confirmation obligation AC-1.4 puts on the post-mortem write**.
   Failure is fail-closed: no window, no dispatch, the entry **refuses the phase**. A partially-landed
   line is **`REQ-RCV-07` AC-7.5**; its render is **catalogue §4**'s, and it mints **no new catalogue
   id and no new S-16 reason** — that enum is closed at three — being a fault of the loop, not a state
   of the region. The ordering is deliberate, and why is stated once for both ends at
   `pdlc-rcv-split.md` **§5.5**.

   **Answering lines are appended, like `HALT-REASON:` lines** — **normative**: document order is
   event order, and validation reads each line against those before it. Lines landing out of order
   fail validation ⇒ `W = 1` permanently, since AC-1.4 clause 1 preserves the region verbatim and no
   clearance repairs it.

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
   decidable conjuncts, so the dispositions above — and §4.1's rows restating them — are **target
   state**, not behaviour this REQ's delivery exhibits. They are fixed here so that later ship adds no
   requirement. **Validation is a conjunct of the gate, not merely a constraint on `W`** — this REQ's
   claim; the arithmetic is at `pdlc-rcv-split.md` **§5.2**. **A refusal is not a halt: the entry
   returns without running the rest of AC-1.5**, takes no halt and leaves the marker in place — why,
   at split **§5.3**; the refusal in full at `REQ-RCV-07` AC-7.2.

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

   **Every clearance is answered by exactly one line, including this one** — same confirmation
   obligation and fail-closed disposition as `WINDOW-START:`; why, stated once for both ends at
   `pdlc-rcv-split.md` **§5.5**.

   **Row B — the report row of a refusing entry, in two variants** — is `REQ-RCV-07` AC-7.6's, stated
   cell by cell there as catalogue §3 requires of the REQ owning the condition. It is **row C's
   complement**: B's entry takes no halt, C's takes one, so B never carries S-4 and C never carries
   S-16.

All five clauses' durable observables are §4.1's, already read by the loop. Nothing here needs a clock, a process identity or a memory of a previous invocation.

**Observability.** The declared budget is 3; the highest `-v{N}` for a document with no resolved POSTMORTEM never exceeds 3; past the window **no reviewer is dispatched** and no new cross-review file appears; the post-mortem carries both quantities (§6) and the S-4 reason.

## 6. Declared thresholds

The shared table is `docs/_constraints/pdlc-rcv-baseline.md` §3, and this REQ's per-row notes are
**baseline §3.1** (relocated there at round 9). This REQ **owns** six of its rows and reads two more;
it changes none of the others, and a threshold used here and absent there is a defect. **The three
refusal-render rows v1.6 carried here are `REQ-RCV-07` §6's and catalogue §4's** — this REQ mints no
**refusal** string. It mints exactly **one** operator string, added at v2.7: AC-1.3's Iterations
render. Two grammars are restated below because §4.1 and AC-1.5(4) depend on their being **in force at
this ship** rather than deferred with the consistency checks (X-06).

| Row | Owned / read | Default and note |
|---|---|---|
| `MAX_REVIEW_ROUNDS` | owned | **3** (was 5); baseline §3 for the derivation, §3.1 for this REQ's note. **Exactly one *executable* declaration repo-wide** (AC-1.2), test code included; prose sites and pinned non-budget literals are outside that count but inside O-13(b)'s enumeration, which is the criterion's decidable observable |
| **`Iterations (budget {MAX_REVIEW_ROUNDS}, rounds run {k})`** | owned | **That exact render**, two decimal integers ≥ 0, in the post-mortem's Iterations section. **New at v2.7**, restated here because AC-1.3 needs a fixed string rather than a shape. It **replaces** the baseline literal, whose single number and *"limit reached"* phrase are false on the zero-round halt (M-1c). `{k}` is the rounds the halting **entry** dispatched. Baseline §3 carries the row; O-14 produces it, O-10 asserts it |
| `## Reset Region` (S-12), `HALT-REASON:` (S-15), `reset-region-corrupt:` (S-16), `budget-exhausted:` (S-4) | owned | **Stated once in baseline §3, local notes at baseline §3.1.** **S-4 excepted: outside baseline §3 deliberately, its render fixed by catalogue §2** |
| **`WINDOW-START: {N}` (S-13)** | owned | **`{N}` a decimal integer ≥ 1** — restated because it is **in force at this ship** and §4.1's `W` row depends on it: a line whose value is not one contributes **no value to `W`**, while still counting toward `A` (AC-1.5(4) clause 4). Baseline §3.1 for the authoring prohibition and the deletion rule |
| **`WINDOW-RESUMED: {W}` (S-14)** | owned | **`{W}` a decimal integer ≥ 1** equal to the origin then in effect — same grammar, same in-force status as S-13 |
| `no-revision: …` (S-11) / `fixed-point: …` (S-3) | **read** | As the catalogue fixes them; emitted by `pdlc-rcv-fixed-point-stop` (X-05). Baseline §3.1 for how AC-1.5(5) reads them |

## 7. Non-goals and out of scope

The shared list is baseline §4 (**N-1 … N-10 only**): `N-1, N-2, N-3, N-4, N-7, N-9, N-10` apply
unchanged and are not restated; `N-5`, `N-6`, `N-8` are **inapplicable, not overlooked**. **Ids above
`N-10` are not shared** — the family minted colliding `N-1x` ids — so this document's own non-goals
use the per-REQ namespace `NB-*`. `O-*`, `R-*` and `X-*` are **not** namespaced, so split §5's rule
applies: every cross-document citation names the owning REQ. The rows worth pointing at:

| # | Not in scope | Why |
|---|---|---|
| **N-4** (shared) | Changing what a halt is. | AC-1.4: the POSTMORTEM path, the write confirmation and the rule that **only a human ever writes `RESOLVED: yes`** are untouched, as is the gate reading it (M-7a). This REQ changes *when* a halt happens and *what it says* — plus AC-1.4 clause 2's one lifecycle change, in the fail-closed direction. |
| **N-7** (shared) | Applying these mechanisms to Phase CR or Phase DOD. | Restated because AC-1.1 now says so explicitly: untyped loops keep a per-invocation budget, take the new value of the shared constant, and get no reset region. |
| **NB-1** | The fixed-point test, the zero-delta test, how a round's blocking count is read. | `pdlc-rcv-fixed-point-stop`'s. This REQ states only the window they are evaluated inside and the halt path they halt on. A finding that this document never says *when* the loop compares two rounds is **correct and known** — file it there. |
| **NB-2** | The verifier panel, the growth measurement, the anchor writer. | `pdlc-rcv-panel-topology`'s. A finding that this document does not define `DOC-BYTES:` is **correct and known** — file it Low. |
| **NB-3** | **How** the region is validated, what a partially-written answering line leaves behind, which strings a refusing entry emits, the sanctioned repair per S-16 reason. | `REQ-RCV-07`'s (X-06). AC-1.5(4) names the *region validates* predicate and fixes its meaning and fail-closed disposition; the procedure, refusal semantics, repair taxonomy and row-B renders are AC-7.1–AC-7.6 and catalogue §4. A finding that this document states no algorithm, pins no shipped string, or omits what a torn write leaves behind is **correct and known by construction** — file it there. So is the conjunct being **not in force** at this ship: `REQ-RCV-07` AC-7.1 brings it into force, and it is **not** remediated here. |
| **NB-5** | Making the window survive Phase H, or restoring a region `harvest-learnings` deleted. | The post-mortem is the region's home and harvest deletes it once LEARNINGS exists (§4.1) — benign within a feature, and a post-harvest re-entry gets `W = 1`, `H = A = 0`, the same default as a feature that never halted. A finding that a post-harvest re-entry has no window history is **correct and known**; a home surviving harvest is a new artifact, hence a new REQ. |
| **NB-4** | Asserting anything about `pdlc/workflows/orchestrate-dev.js`'s control flow that is not a measured fact. | Per the predecessor post-mortem's root cause 1, this document cites shipped behaviour **only by `M-*` id** and carries no line citation. A claim about a guard, an emit or a branch belongs in `docs/_constraints/pdlc-rcv-baseline.md`, and a criterion that needs one belongs in `REQ-RCV-07`. |

## 8. Downstream obligations

A finding of the form "this AC has no oracle / fixture / seam / test" is answered here — an obligation
on FSPEC, TSPEC, PLAN or PROPERTIES, not a REQ revision (§9's stopping rule).

| # | Obligation | Owner |
|---|---|---|
| **O-5** | Specify the mechanism by which AC-1.4's **reset region survives every halt** — loop-owned state preserved across halts, **not** discharged by a prompt clause. The outcome is fixed here: the first halt creates the region, a later halt preserves every line and appends its own, unfenced `RESOLVED:` lines are stripped, and a region lost or unwritable is **reported fail-closed** rather than proceeded past on a silently widened window. Partial outcomes land fail-closed too (`W` = 1, or S-16 and a sanctioned repair), `H` understating the halts by at most the lost lines and the next halt re-creating the region. | TSPEC |
| **O-12** | Specify **how `W` is resolved before the round window is computed**, and how the *region validates* predicate is supplied to the clearance gate; the halt path's region maintenance is O-5's. **The seam's contract is fixed in exactly one place, `REQ-RCV-07` O-12** — one-directional: this REQ's TSPEC adopts it and states none of it, and that obligation is corrected in this same revision to stop citing this one (the two pointed at each other, so no document fixed it). What this REQ owes is the interim composition's **observable**: the predicate is reachable from the clearance gate and consulted **zero times** while the conjunct is unwired (X-06) — O-10's 0-call leg. A fact about behaviour, not a signature, which is why it can be stated here. This REQ fixes only the observables: the gate is **fail-closed** — a non-validating region refuses the phase and consumes nothing; the report carries **exactly one** `reset-region-corrupt: {reason}` notice from `REQ-RCV-07`'s closed set of three; and `W` falls back to **1** whenever no well-formed `WINDOW-START:` value exists (§6, §4.1). | TSPEC |
| **O-9** | The post-mortem prompt gains a belt-and-braces clause telling the agent `## Reset Region` (S-12) is machine state to leave alone — the baseline prompt imposes nothing (M-7e). **Not the mechanism**; O-5 is. | FSPEC → implementation |
| **O-10** | Properties and tests, at the level of observable outcomes. **Region maintenance (AC-1.4):** the first halt creating `## Reset Region` with exactly one `HALT-REASON:` line, and the operator's first clearance then granting a window; a later halt preserving the region and stripping the spent marker, so the phase reads unresolved again; a **fenced** `RESOLVED: yes` surviving the strip while an unfenced one is removed; region lines **appended, not prepended**; a **Phase CR halt creating no `## Reset Region`** (N-7) — non-vacuous because the untyped phases reach the same halt path and do write a post-mortem (**M-7f**), so the leg asserts a file that exists lacks the section, not that no file exists. **The window (AC-1.1–AC-1.3, AC-1.5(1)–(3)):** budget and reported iterations asserted **over the constant, never a literal** (`rounds 4..6 of 3` is illustrative), rounds-run `0` on the zero-round halt; **row C** cell by cell with **zero dispatches asserted positively** — a dispatch count of `0` alongside the absence of any new cross-review file, since a double that writes nothing satisfies absence either way; a **forced** phase on an exhausted document halting rather than re-reviewing, and a second force refused as unresolved (M-7a). **The gate (AC-1.5(4)–(5)):** one clearance granting **exactly one** window (`A < H` grants, `A = H` nothing); an S-11 clearance writing `WINDOW-RESUMED:`, `W` unchanged, a later convergence halt **not** auto-cleared. **The validation-dependent legs are deferred to `REQ-RCV-07` O-10** (X-06): the refusal, its renders and *a region that does not validate consuming no clearance* belong to the REQ under which the conjunct is in force and can be exercised on a production path.

**Four legs this REQ keeps rather than defers**, over the fixtures stated once for both ends at `pdlc-rcv-split.md` **§5.4**. (1) **The 0-call contract leg:** on split §5.4 **leg 1** — a well-formed region that *grants* — the interim composition consults the *region validates* predicate **exactly 0 times**, asserted as a count, not an absence. Leg 1 carries it because it is the only interim fixture defeating both decidable conjuncts, hence the only one a **wired** implementation answers differently; it is the interim ship's **only** falsifiable oracle for X-06, since without it *"deliberately not consulted"* and *"wired with an ad-hoc interim procedure"* (split §5.1's granting horn) pass every other leg identically. A **contract** leg — replaced, not deleted, when row 18 wires the call. (2) **Split §5.4 legs 1 and 2** themselves — the granting region, and no region at all — each with **≥ 1** dispatch asserted positively. (3) **The interim-only malformed-value leg** (split §5.4 **leg 3**): a malformed `WINDOW-START:` still counts toward `A` but contributes no origin, so `W` = 1 and no non-numeric value reaches the window arithmetic; decidable from §6's grammar alone, which is why it is this REQ's, and it **inverts at row 18** (AC-7.1 refuses that fixture with `invalid-window-start`) — marked interim-only so that commit rewrites it rather than deleting an assertion it cannot explain. (4) **The derived start below `W`** (AC-1.5(2)): `W = 4` with every cross-review file removed ⇒ the entry starts at **4**, dispatches, overwrites nothing; control, `highest + 1 = 6` at `W = 4`, halts on the budget path.

**Two legs AC-1.3 and AC-1.4 add.** The Iterations section as an **equality on §6's declared render**, both integers, `rounds run 0` on the zero-round halt — not a substring match, which any rendering satisfies. And the **re-halt leg**: a halt finding an existing post-mortem makes **0** authoring dispatches and leaves every byte outside the region unchanged — a byte comparison with the region span excised **plus** the dispatch count, since a body an agent happens to rewrite identically satisfies neither alone.

**One property-based obligation, not only the enumerated points.** The origin-and-counts resolution is a parser over an ordered line sequence, and the interleaving of `HALT-REASON:`/`WINDOW-START:`/`WINDOW-RESUMED:` lines is what enumerated fixtures cannot cover. Over **generated** line sequences (arbitrary order, well-formed and malformed values, arbitrary `RESOLVED:` state) assert the invariants stated above: `W` is always a decimal integer ≥ 1; `W` never exceeds the greatest well-formed `WINDOW-START:` present; no absent or malformed value ever **widens** the window; at most one answering line is written per entry. The fail-closed direction is the property.

**DC-03 routing and the ledger's lifecycle.** Every assertion here whose failure is the **only** signal of its defect — the 0-call count, budget and `iterations` over the constant, one clearance granting exactly one window, row C's zero-dispatch conjunct, the re-halt byte comparison — is load-bearing under DC-03 and passes the falsification cycle recorded in `docs/pdlc-rcv-budget-stop/FALSIFICATION-LEDGER.md`: mutation named in writing before the run, red ids recorded, revert re-verified green, and any assertion with no nameable mutation filed as a **Residual** rather than counted. **Lifecycle (DC-10):** the ledger is a feature artifact — harvest deletes `CROSS-REVIEW-*`, `CODE_REVIEW-*` and `POSTMORTEM-*`, **not** this file, which stays as the durable record of which assertions were proven to fail. | PROPERTIES |
| **O-13** | Own the **budget-width change's blast radius**, which AC-1.2 states as an outcome and does not resolve. Two parts, both due before implementation rather than discovered inside it. (a) **Decide how test code obtains the effective budget**, so AC-1.2's "one declaration repo-wide" and AC-1.3's "asserted over the constant" are simultaneously satisfiable — today they are not: the constant is deliberately unexported and the suite keeps its own copy, the second declaration AC-1.2 forbids, which disagrees with the module the moment 5 becomes 3. Exporting it, or any other single-source mechanism, is TSPEC's call; keeping two is not, because it is the defect. (b) **Enumerate every existing assertion encoding today's width of five** before the change — the round-derivation, pacing-wrapper (including an acceptance-test *title* naming the width) and review-loop suites all carry them — stating for each whether it is re-expressed over the constant or is a genuine width-5 expectation that changes value. The enumeration is the deliverable: an implementer who meets these mid-PLAN re-decides (a) under time pressure. | TSPEC |
| **O-14** | Produce AC-1.3's Iterations render — **both** quantities, at §6's declared string — replacing the baseline literal (M-1c), which means threading the rounds this entry ran to wherever that section is produced. Also specify the **no-re-author** path AC-1.4 requires: on a halt finding an existing post-mortem, this REQ requires only that everything outside the reset region is byte-unchanged, which fixes that file's Iterations section as *left as the prior halt wrote it* unless FSPEC states otherwise and amends the clause. | FSPEC → implementation |
| **O-11** | Rebuild `pdlc/workflows/dist/` in the same commit as every workflow-source change, and honour the repo's documented workflow-runtime constraints (`CLAUDE.md`), so the shipped artifacts behave as the tests do. **The freshness gate is itself load-bearing under DC-03** and is the named example of a dead oracle in this repo — it is falsified by mutating the built artifact and observing the check red, recorded in the `FALSIFICATION-LEDGER.md` O-10 names, not asserted by running it on an already-fresh tree. | implementation |

## 9. Risks, assumptions and deferrals

### The stopping rule for this document's own review loop

Pasted from `docs/_constraints/DOMAIN-CONSTRAINTS.md` **DC-09** deliberately, not cited: DC-09's own
evidence is that a stopping rule *"living only in a constraints file nobody loads does nothing"*,
while the same rule written into the REQ changed both reviewers' behaviour immediately. This document
most needs it — it has already exhausted one Phase R window, and R-1 records that it is reviewed by
the loop it is changing. **Reviewers may cite these by name to route a finding downstream rather than
block on it.**

- A round whose blocking findings are **all** implementability or oracle-falsifiability defects — none
  contesting user need, scope, priority, or phasing — means the REQ has met its bar. **Approve it and
  move the findings downstream** as named entry obligations for the receiving phase. §8 exists to
  receive them.
- A finding of the form *"this AC has no oracle"* must be closable by **deferring** the oracle to
  TSPEC or PROPERTIES, not only by writing one into the REQ. Otherwise it is closable only by adding
  prose that the next round reviews — the fix-begets-finding loop this feature exists to bound.
- **Two consecutive rounds with a non-decreasing blocking count is a fixed point, not slow
  convergence**, and a round in which the document grows while the count does not fall is stronger
  evidence of the same. Distinguish plateau from **churn**: a non-decreasing count is not a fixed
  point when all prior findings closed and the new blockers were introduced by the latest revision —
  but say so explicitly, and pre-commit to escalating if the next round does not close them.
- A REQ does **not** specify trace grammars, fault-injection vocabularies, fixture construction,
  coverage floors, emitter escaping or property-generation axis tables. A finding that this document
  omits one of those is evidence it is at its layer, not evidence of a gap.

| # | Risk | Disposition |
|---|---|---|
| **R-1** | **This REQ is reviewed by the loop it is changing, under the old behaviour** — five per-invocation rounds, no enforced stop. The predecessor's Phase R died exactly here. | **Mitigated by the stopping rule pasted above**, which is the structural mitigation DC-09 evidences and replaces v2.6's *"accepted and unenforceable"* disposition — that shape is the advisory one §1's P-2 identifies as having failed on three features. Also mitigated by splitting the parent, by depending on no unmeasured runtime fact (baseline §5) and by keeping this document short. **Residual:** the rule binds reviewer and author behaviour, not the loop — the mechanical enforcement is this REQ and its successor, neither shipped — so the operator still watches the trajectory and can halt by hand. |
| **R-12** | **A repeating S-11 halt is unbounded.** Each S-11 clearance leaves `W` unchanged and (per the successor's AC-2.8) costs the window no round, so an authoring side producing zero-delta rounds yields an unbounded halt/clearance sequence with `H` and `A` growing together. | **Accepted, bounded by the operator rather than the loop.** Every iteration costs one hand-written `RESOLVED: yes`, so it is never unattended; capping it needs a second counter that could only deny an operator *choosing* to continue. Revisit if it repeats in practice. |
| **R-13** | **Migration: branches already carrying more than three rounds.** At the landing commit, every in-flight phase whose document has 3+ rounds is admitted no rounds and halts, rendering S-4 as `rounds 1..3 of 3` while five rounds sit on disk. | **Correct and expected** — the render states the *window*, not the file count. The escape is the ordinary clearance (AC-1.5(3)). No migration script, no back-fill. |
| **R-10** | **The region is machine state in a file an operator is instructed to edit.** A hand-edit can make the counts lie either way, and one way restores the per-invocation budget AC-1.1 abolishes — silently, fail-open. | **Mechanised, not accepted.** AC-1.5(4) makes *the region validates* a **conjunct of the clearance gate**, so an untrustworthy region consumes and opens nothing. The deciding mechanism and the sanctioned repairs are `REQ-RCV-07` AC-7.1/AC-7.4. Residual here: §6's *never authored by a human*. |
| **R-14** | **This REQ's *region validates* decision procedure is not implementable until `REQ-RCV-07` ships** (X-06), and that REQ is **three** intervening features away — row 18, with net pickup **10 → 12 → 13 → 17 → 18** (§3.1). The distance is longer than v2.6 stated, and one of the intervening rows is **row 17**, which emits S-11. | **Mitigated by not bringing the conjunct into force until its procedure exists** — not by sequencing, which is weaker still at this distance, and not by an interim procedure, all three of which are rejected once for both ends at `pdlc-rcv-split.md` §5.1 (X-06). Until `REQ-RCV-07` ships, every branch keeps HEAD's behaviour: no refusal, no S-16, nothing AC-1.1–AC-1.5(3) and (5) do not already do. **Two residuals, accepted and time-boxed to row 18.** (i) R-10's hand-edited-region fail-open — operator-caused, no wider than HEAD's, where it is open unconditionally. (ii) **From row 17 onward, machine-written `WINDOW-RESUMED:` lines land in regions nothing validates** — *not* covered by "no wider than HEAD's", since HEAD writes no region lines at all. Accepted because the alternative is an interim procedure, rejected on all three horns above, and because the exposure is bounded by the accounting the two live conjuncts enforce: the line still answers exactly one halt, so the worst case is an origin the operator can read and repair once AC-7.4 exists. If row 17 is picked up before row 18, that is the moment to reconsider **moving row 18 ahead of it by `Order`** — a queue decision, deliberately not a requirement. Nothing requires the two halves to land in the same plugin release, so no `pdlc/RELEASE-CHECKLIST.md` line is owed. |

**Deferrals and their binding.** This REQ defers nothing of its own. The predecessor's deferrals go to
the successors carrying the criteria that raise them — cross-panel comparability and finding identity
to `docs/discarded/pdlc-review-convergence-calibration/`, the authoring-side zero-write residue to
`docs/pdlc-runtime-measurement-spike/` — both recorded in `pdlc-rcv-fixed-point-stop` §9. Each stub is
`ready: false`, so neither is queue-eligible until an operator specifies it and opts it in.

## 10. Traceability

| Requirement | Baseline measured facts | Baseline defect | User story | Obligations |
|---|---|---|---|---|
| REQ-RCV-01 | M-1a, M-1b, M-1c, M-1d, M-1e; M-7a, M-7b, M-7d, M-7e, M-7f | P-1 (cost half) | US-01, US-02, US-04 | O-5, O-9, O-10, O-11, O-12, O-13, O-14 |

**Why one requirement and not two.** v1.0 carried REQ-RCV-01 and REQ-RCV-02 past the 60 KB ceiling;
v1.1 cut at the seam they already had — this REQ the **window**, `docs/pdlc-rcv-fixed-point-stop/` the
two **tests** inside it, kept as a `depends-on` edge. **v2.0 then cut at the altitude seam** the
postmortem named: the implementation-altitude half of AC-1.5(4) moved to `REQ-RCV-07`, the window
stayed, and **no requirement, AC, `S-*` id, threshold or user story changed meaning**. The narrative,
the *what moved / what stayed* mapping and the consequences are stated once for both halves in
`docs/_constraints/pdlc-rcv-split.md` §1–§4.

**Paired edges are revised together.** `REQ-RCV-01` X-06/R-14 and `REQ-RCV-07` X-07/R-16 are the same
edge from both ends, so a revision to either is carried to the other **within the same revision** (the
unit is the revision, not the commit) and the reviewer checks both ends **at HEAD**. v2.7 exercised
this: the pickup-order correction landed at both ends. The edge table, the facts both ends must agree
on, and the `O-*`/`R-*`/`X-*` collision rule are in split §5.

**Round-by-round history is deliberately not restated here:** harvest deletes `CROSS-REVIEW-*` once
LEARNINGS is written, so citing round files would be structurally wrong.
