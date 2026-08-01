# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.5, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 5
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. The baseline reviewed at v4 was the REQ as of `68cfec7`; this review
covers `68cfec7..HEAD` on that file (`6fa79c0`, `5079bad`, `eddf09a`, `779cc35`). Sections unchanged
since v4 were not re-litigated.

## 1. Disposition of the v4 findings

All five v4 findings are **closed**, and the High was closed by the route I recommended — the
mechanism named, not only the value. I re-traced every citation this round added.

| v4 id | Sev | Status | Where it closed, and what was checked |
|---|---|---|---|
| **F-01** | **High** | ✅ closed | v1.5 replaced the `none` pin with **`written`** *and* the production mechanism: *"the refusal sets no `gatePostmortem` and attaches none to its thrown halt, so the halt catch's third branch (`orchestrate-dev.js:4890`–`:4901`) probes `POSTMORTEM-{haltPhase}-{feature}.md`, the file this refusal is *about*, which exists by the path's premise."* I checked the line numbers by counting the catch block at HEAD: `:4880` is `if (gatePostmortem)`, `:4883` the `err.postmortemStatus` branch, `:4890` `} else if (haltPhase) {`, `:4899` `postmortemStatus = "written"`, `:4901` its closing brace. The citation is exact, and the value it claims is the value the shipped chain produces on this path — `haltPhase` is non-null because a ❌ row is recorded, and `checkFileFn` finds the operator's post-mortem. The disambiguating sentence — *"That is the probe's sense — *this phase has a post-mortem* — not a claim this run wrote one, which the ❌ text carries"* — is the part that makes `written` honest rather than least-wrong, and it is the sentence I would have filed for if it were missing. Stated for **both** row-B variants, as asked; §6's *Refusal phase-row text* row and O-10's oracle both moved with it. |
| **F-02** | Medium | ✅ closed | *"or whole-section deletion"* is gone from the torn-write text. The residue is now *"the operator's sanctioned in-place **correction**, like any other bad value"*, singular, and `counts-mismatch` keeps whole-section deletion to itself. §6's *Refusal recovery text* row stays a derivation rule and is now derivable: one repair per reason. (What the replacement sentence introduced is a different problem — F-02 below — but the two-repairs-per-reason ambiguity is closed.) |
| **F-03** | Medium | ✅ closed | Handled at the root rather than papered over: *"`none` is **rejected, not merely unreachable**: `:4922` emits `No POSTMORTEM was written.` on `none` alone, beside a ❌ row naming the post-mortem the operator hand-resolved; O-10 asserts that line **absent**."* `:4922` is `if (postmortemStatus === "none") {` at HEAD — correct. §6's row carries the same statement (*"does **not** appear beside this row"*), and O-10 gained the absence leg. The coupling an implementer could not have discovered from §6 alone is now stated in §6. |
| **F-04** | Low | ✅ closed | O-10's dispatch-count oracle reads *"exactly **0** dispatches on **each** refusing entry (both row-B variants), on the exhausted-budget entry and on the skipped entry"*. |
| **F-05** | Low/Process | ⚠️ observed; **worse, and now binding** | 502 lines / **61,437 bytes** against 700 / 61,440 (`check-req-size.sh`'s `LINE_LIMIT`/`BYTE_LIMIT`) — **3 bytes** of headroom, down from 117. The round was funded, but by spending the last of the reserve rather than by moving prose out. Re-filed as F-04 below, and this time it is not merely a constraint on style: the two findings below both require net-positive text. |

## 2. Disposition of the v4 questions

| v4 id | Status | Note |
|---|---|---|
| **Q-01** (does the refusal throw a halt error carrying its own fields, or set a new gate variable?) | ✅ answered | Neither, and the third answer is better than both I offered: the refusal carries **nothing** and lets branch 3's existence probe speak. AC-1.5(4) says so explicitly (*"sets no `gatePostmortem` and attaches none to its thrown halt"*), which is a falsifiable statement about the thrown error, not a silence. It also keeps the refusal step-G-shaped without adding a seam. |
| **Q-02** (is `W` guaranteed absent from every operator- and downstream-visible surface on a refusing entry?) | Still unanswered — and the one clause that pointed at the dependant was **deleted** this round | §3.1 lost *"`pdlc-rcv-fixed-point-stop` depends on this REQ because both its tests are stated over `W`"* in the compression pass. The question is unchanged in substance and still not filed; the deletion is filed separately as F-03 for a different reason (a dangling *"both"*). |
| **Q-03** (was a single in-entry retry of the confirmation read considered and rejected?) | Still unrecorded, and now larger | The confirmation is now a **byte comparison**, so it fails on strictly more inputs than a presence check did, and every failure takes the unattended-queue halt. R-11's gloss is unchanged. Carried, not escalated — but this is the third round it has been carried, and one clause in R-11 would retire it. |

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
