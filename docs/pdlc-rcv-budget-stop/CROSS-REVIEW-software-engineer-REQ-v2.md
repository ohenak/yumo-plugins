# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.2, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 2
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. Baseline reviewed at v1 was the REQ as of `624054c`; this review
covers `624054c..fa83925` on that file. Sections unchanged since v1 were not re-litigated.

## 1. Disposition of the v1 findings

All nine v1 findings are **closed**. Each was checked against the revised text, not against the
commit message that claims it.

| v1 id | Sev | Status | Where it closed, and what was checked |
|---|---|---|---|
| **F-01** | High | ✅ closed | AC-1.5(4) now carries *"The answering line is written, and confirmed, before the window opens"*: the loop re-reads the file, confirms the line is present **in the region, at the end, before any round of that entry is dispatched**, and on failure takes a named fail-closed exit (no window, `W` keeps its prior value, no dispatch, phase refused on step 4's path). The obligation is in §8 as **O-12**, the granting-path counterpart to O-5. The "mints no new S-16 reason" clause is the right call — the enum is closed at three in catalogue §2 and an unconfirmable write is a loop IO fault, not a region state. The *"Consequence an operator will meet"* paragraph additionally pins the write-first ordering and its justification, which is what makes the one-shot property hold in both directions. |
| **F-02** | High | ✅ closed | AC-1.5(4) step 4 now states the placement outright — **after** `phaseGate`'s `{ skip: true }` exit, before any round opens — and O-6 restates it. I re-verified the skip exit at HEAD: `freshness === "FRESH"` → `checkPostmortem` *for reporting only* → `recordPhase(phaseId, label, "⏭", …)` → `return { skip: true }` (`pdlc/workflows/orchestrate-dev.js:4211`–`:4226`). The cost analysis now enumerates **three** entry classes (skipped / exhausted / mid-window) rather than two, and the skipped row is argued rather than asserted: no round to gain, no clearance to spend. |
| **F-03** | Medium | ✅ closed *(with a residue — F-01, F-02 below)* | AC-1.5(4) now fixes the ❌ row as `Refused — reset region corrupt at {path} ({reason})`, states that `postmortemStatus` is **not** `unresolved`, and replaces the shipped generic recovery line with one naming the sanctioned repair. §6 declares both as operator-facing renders of S-16 that are explicitly **not** catalogue ids. The decision I asked for was made. The two new findings below are about *anchoring* that decision, not about reopening it. |
| **F-04** | Medium | ✅ closed | AC-1.2 gained *"What changes at `windowEnd` and what does not"*: `W` is resolved **before** `deriveRoundWindow` and passed as an ordinary resolved decimal integer, so the function keeps its documented *synchronous, total, takes no seam* contract; the async `_readFile` lives in the caller; **"Any FSPEC or TSPEC that gives either function a seam violates this clause."** O-12 carries the obligation. That is exactly the shape I asked for and it preserves the invariant `CLAUDE.md` documents as load-bearing. |
| **F-05** | Medium | ✅ closed | AC-1.5(1) now carries *"`forcePhases` does not grant a window; the clearance is the only route past the cap"*, states the resulting behaviour cell by cell (no rounds, budget halt, post-mortem, row C, queue row `halted`, a second force changes nothing at `A = H`), names it a deliberate change to a documented operator entry point, and gives it an oracle in O-10 (*"a **forced** phase on an exhausted document halting rather than re-reviewing"*). |
| **F-06** | Medium | ✅ closed | AC-1.4 gained *"The scope of 'every halt'"*, quantifying the rule over **halts that write `POSTMORTEM-{phase}-{feature}.md` for a document-typed review-loop phase**, explicitly excluding creator-agent failure, the branch guard, listing failure, Phase PUB/CI and Phase DOD (none of which writes a post-mortem at HEAD, and N-4 forbids making them), and restating §4.1's `H` sentence to match. The pairing argument survives the narrowing, as I expected it would. |
| **F-07** | Medium | ✅ closed | AC-1.3 now states that `iterations` is the **budget** (matching the shipped site at `orchestrate-dev.js:1984`, `iterations: MAX_REVIEW_ROUNDS`) and that the post-mortem's Iterations section **additionally** states the rounds this entry ran — `0` on the zero-round halt — so the two are never conflated where the operator reads them. O-10 asserts both **over the constant**. |
| **F-08** | Low | ✅ closed | Both sites now read *"reached its minimum at round 2, **held it at round 3**, and rose thereafter (11, 6, 6, 7, 9)"* (§1 bullet 2; §5 REQ-RCV-01 preamble). Note for the family, not for this REQ: `docs/_constraints/pdlc-rcv-baseline.md` §3's `MAX_REVIEW_ROUNDS` Derivation cell still carries the uncorrected *"minimum at round 2 and rose thereafter"*. Not filed — it is that document's row, not this one's. |
| **F-09** | Low | ✅ closed | §9 **R-13** names the migration case, gives the render an operator will meet (`rounds 1..3 of 3` with five rounds on disk), calls it correct-and-expected rather than a defect, and confirms the escape is the ordinary clearance. No migration script, no back-fill — the right disposition. |

## 2. Disposition of the v1 questions

| v1 id | Answered where | Adequate? |
|---|---|---|
| **Q-01** (skip placement) | AC-1.5(4) step 4, O-6 | Yes — see F-02 above. The REQ picked one and justified it. |
| **Q-02** (unbounded S-11 repetition) | §9 **R-12** | Yes. Accepted, bounded by the operator rather than the loop, with the argument stated (every iteration costs one hand-written `RESOLVED: yes`, so it is never unattended) and a revisit trigger. I agree with the disposition. |
| **Q-03** (grant that dies before dispatching) | AC-1.5(4), *"Consequence an operator will meet"* | Yes, and it is now load-bearing rather than incidental: it is the reason the answering line is written first. |
| **Q-04** (durability between dispatch and re-apply) | **O-5**, final sentence | Yes. Both crash outcomes land fail-closed (`W` = 1, or S-16 plus a sanctioned repair), `H` understating the halts by at most the lost lines, recovery is the next halt re-creating the region. |
| **Q-05** (unreadable-but-present post-mortem) | §4.1, row *"That the post-mortem is readable at all"* | Yes. `checkPostmortem` reads it as `status: "none"` (M-7a) ⇒ empty region ⇒ `H = A = 0`, `W = 1`; named as the conservative direction, with the halt-gate half left as the shipped reader's under N-4. |

## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
