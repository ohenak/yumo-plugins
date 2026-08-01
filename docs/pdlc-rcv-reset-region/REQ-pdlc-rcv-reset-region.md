---
feature: pdlc-rcv-reset-region
ready: true
depends-on: [pdlc-rcv-budget-stop]
---

# REQ — pdlc-rcv-reset-region

| Field | Value |
|---|---|
| Shared baseline | `docs/_constraints/pdlc-rcv-baseline.md` — the measured run, the measured facts `M-*`, the declared thresholds and the shared non-goals `N-1 … N-10`. **Read it first.** Facts are cited by id (`M-8d`), never restated. |
| Shared catalogue | `docs/_constraints/pdlc-rcv-catalogue.md` — the family vocabulary (§1), the closed catalogue `S-1 … S-17` (§2), the run-report row schema (§3) and **row B's unconfirmable-append render (§4)**, used by reference. |
| Predecessor | `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` v2.0 (`REQ-RCV-01`) — this REQ is the **implementation-altitude half** split out of that document's v1.6 AC-1.5(4), §6 and O-10 on 2026-08-01. See §10 and `docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md`. |
| Siblings | `docs/pdlc-rcv-fixed-point-stop/REQ-pdlc-rcv-fixed-point-stop.md` (REQ-RCV-02); `docs/pdlc-rcv-panel-topology/REQ-pdlc-rcv-panel-topology.md` (REQ-RCV-03, REQ-RCV-04); `docs/pdlc-rcv-finding-quality/REQ-pdlc-rcv-finding-quality.md` (REQ-RCV-05, REQ-RCV-06) |
| Upstream | `docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md` (v1.0) root causes 1 and 3, recommendations R-3 and R-4; operator direction of 2026-08-01 |
| Downstream | `FSPEC-pdlc-rcv-reset-region.md` |
| Targets | `pdlc/workflows/orchestrate-dev.js`; generated artifacts under `pdlc/workflows/dist/` rebuilt in the same commit |
| Citation baseline | Commit **`41f9369`** on `feat-pdlc-rcv-budget-stop`, at which every line cited below was re-derived. Baseline §2.8's `M-8*` rows were read at `cf207bd` and hold unchanged at `41f9369`. Citations name the enclosing symbol and a distinctive literal; re-baselining is a mechanical fix, not a finding. |

| Product | Status | Author | Version | Date |
|---|---|---|---|---|
| pdlc | draft | Claude + operator | 1.0 | 2026-08-01 |

**v1.0** is the split half. Nothing here is new material: every criterion below was `REQ-RCV-01`
v1.6's AC-1.5(4), §6 or O-10 text, re-stated against the measured facts `M-8a … M-8j` that
`docs/_constraints/pdlc-rcv-baseline.md` §2.8 added on the same day. **No `S-*` id is minted, and no
requirement, AC or threshold of `REQ-RCV-01` changed meaning** — only which document states it.

## 1. Problem

`REQ-RCV-01` establishes the **window**: three rounds per document, counted from an origin `W` that
only an operator's `RESOLVED: yes` can move, anchored in machine-written state — the **reset region**
(S-12) — inside `POSTMORTEM-{phase}-{feature}.md`. It states *what the region means*: the counts `H`
and `A`, the one-shot clearance gate, the answering line that spends it, and the fail-closed outcome
when the region does not validate. It deliberately does **not** state *how the region is validated*,
what a partial write of the answering line leaves behind, or what an operator does about either.

That remainder is this REQ, and it is a different kind of question. Three problems, none of them
requirements-altitude:

- **P-A — the region is machine state in a file an operator is instructed to edit, and the validation
  predicate is where that meets ground.** `REQ-RCV-01` AC-1.5(4) names a predicate — *the region
  validates* — and fixes its failure disposition. What makes the predicate **total and
  single-valued** (DC-01) is an ordered algorithm over an appended, order-sensitive line sequence,
  plus an invariant on two counts with a stated domain. Independent rows do not compose into a
  single-valued answer; an order matters, and it has to be written down once.
- **P-B — a half-landed answering line is the fail-open the whole mechanism exists to close.** The
  append that makes `A = H` is the *sole* mechanism keeping the clearance one-shot. A lost append
  re-grants a fresh window every invocation. A **value-tear** — `WINDOW-START: 12` landing as
  `WINDOW-START: 1` — is worse than a lost one: it is well-formed, so it validates, balances the
  counts, and moves the origin **down**, spending the clearance on a window the operator never
  bought. Deciding what the failing entry does, and what the *next* entry finds, is a design.
- **P-C — the refusal's operator-facing surface is decided by shipped control flow this family does
  not own.** A phase refusal must not be mistaken for a halt, must reach the same exit step G
  reaches, and must not be narrated by the shipped generic recovery line, which is emitted
  **unguarded** on every halt class that reaches the halt catch (M-8d). Every claim of that shape is
  falsifiable by reading one line further, which is precisely how `REQ-RCV-01`'s Phase R failed to
  converge. It is settled here, once, against `docs/_constraints/pdlc-rcv-baseline.md` §2.8's
  measured facts and `docs/_constraints/pdlc-rcv-catalogue.md` §4's render — never re-derived in
  prose.

**Why a separate REQ and not a longer `REQ-RCV-01`.**
`docs/pdlc-rcv-budget-stop/POSTMORTEM-R-pdlc-rcv-budget-stop.md` records five review rounds in which
**AC-1.5(4) was the only clause to generate a blocking finding after round 2** (root cause 3), and
root cause 1 names why: a requirements document was specifying the behaviour of shipped code it does
not own. The two generator classes — A (the answering-line write and its residue) and B (which
shipped string appears, with which value, under which guard) — are exactly P-B and P-C. Splitting at
that altitude seam is the postmortem's own analysis applied, and it is `pdlc:pm-author` rule 5g.

## 2. Users and value

| ID | User story |
|---|---|
| **US-04** | *As the operator*, I want my one escape hatch to be spent exactly once and to leave a record, so that clearing a halt grants one fresh window and not a window per invocation. *(Shared with `REQ-RCV-01`, which states the gate; this REQ makes the gate decidable.)* |
| **US-07** | *As the operator*, when the loop refuses to enter a phase because the reset region does not add up, I want to be told **which line or which pair of counts** is wrong and **exactly what to do about it**, so that a corrupt region is a five-minute hand repair rather than a permanently halted feature. |
| **US-08** | *As the operator*, when the loop cannot confirm the line it just wrote, I want it to stop before it dispatches anything and to tell me to remove the residue **first**, so that a torn write costs me one re-run rather than a silently narrowed window and an unexplained budget halt later. |

**Value.** This REQ delivers no saving of its own — `REQ-RCV-01` carries the whole baseline §1.4
pessimistic-regime saving. What it delivers is that saving's **soundness**: without P-A the clearance
gate has no decidable third conjunct, and without P-B the one-shot property is fail-open on any
partial write. **Operator-visible surfaces:** row B of the run report in both variants, the S-16
notice, the two ❌ phase-row texts, and the recovery text naming the sanctioned repair.

## 3. Prerequisites

| # | Dependency | Resolution form | Gating logic |
|---|---|---|---|
| **BL-14** | **Feature `pdlc-rcv-budget-stop` (`REQ-RCV-01`) merged.** Its AC-1.4 defines the reset region and the halt that maintains it; its AC-1.5(4) defines the counts `H`/`A`, the three-conjunct clearance gate, the answering line and the *region validates* predicate this REQ discharges; its AC-1.5(5) defines which answering line is written. | The feature's artifacts on the default branch, and `MAX_REVIEW_ROUNDS === 3` in `pdlc/workflows/orchestrate-dev.js` | **Hard dependency.** Every criterion below is stated over that REQ's region, counts and gate. Shipping this REQ first would leave the algorithm stated over a region nothing creates. |
| **BL-06** | The shipped POSTMORTEM gate is intact: `parseResolvedMarker` → `checkPostmortem` → the step-G refusal that records a ❌ row and throws, and the halt catch that writes the queue row `halted` | Symbols present (M-7a, M-7b) | Must exist at HEAD — AC-7.2's routing is stated over exactly that shape |
| **BL-15** | The halt catch's operator-facing surface is as `docs/_constraints/pdlc-rcv-baseline.md` §2.8 measures it | `M-8a … M-8j` re-readable at HEAD by their enclosing symbol and distinctive literal | Must hold at FSPEC authoring. AC-7.2's suppression and AC-7.6's `postmortemStatus` are stated **over those facts by id**; if a fact no longer holds, the fact is re-measured in the baseline and this REQ's citation follows it — it is not re-derived here |

**BL-06 and BL-15 hold at `41f9369`.** BL-14 does not yet hold and is the `depends-on` edge.

### 3.1 What this REQ owes and is owed

| # | Direction | What crosses | Behaviour until it ships |
|---|---|---|---|
| **X-07** | **owed to** `pdlc-rcv-budget-stop` | AC-1.5(4)'s *region validates* predicate, its S-16 notice, and the phase refusal that follows a failure. `REQ-RCV-01` states the conjunct and the fail-closed outcome and cites AC-7.1 for the algorithm | Until this REQ ships, `REQ-RCV-01` alone is **not implementable at its step-4 conjunct** — which is why the queue orders this row immediately behind row 10 and why `depends-on` is not empty in the other direction |
| **X-05** | **read from** `pdlc-rcv-fixed-point-stop` | The S-11 halt reason `no-revision: …` (AC-2.8). AC-7.1 step 2 validates `WINDOW-RESUMED:` lines, which only an S-11 clearance writes | Until that REQ ships no halt path emits S-11, so no `WINDOW-RESUMED:` line is ever written and step 2's second sentence is **unreachable in production**. It is stated from the start, so nothing is re-specified when the successor lands; its fixtures are hand-built (R-11) |

**Consequence for sequencing.** This REQ is deliverable immediately after `REQ-RCV-01` and needs no
other sibling. `pdlc-rcv-fixed-point-stop` and `pdlc-rcv-panel-topology` **cite** material stated
here but consume none of it (§10), so neither gains a `depends-on` edge.

## 4. Definitions and the catalogue ids this REQ reads

## 5. Acceptance criteria

## 6. Declared thresholds

## 7. Non-goals and out of scope

## 8. Downstream obligations

## 9. Risks, assumptions and deferrals

## 10. Traceability
