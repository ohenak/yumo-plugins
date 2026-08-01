# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.1, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 1
**Scope:** every finding below carries its own Scope tag in the findings table.

## Verification pass (single pass, all existing-code claims)

Every claim this document makes about existing code, existing documents or sibling REQs was
checked once, here, against the working tree. Line numbers have drifted from the `9486c81`
baseline; per the document's own header row that is a mechanical fix and is not filed as a
finding. Navigation was by symbol and literal.

| Claim | Verified | Where at HEAD |
|---|---|---|
| Citation baseline `9486c81` is a real commit on `main` | ✅ | `git cat-file -t 9486c81` → commit |
| BL-01 — `docs/completed/pdlc-review-loop-hardening/` carries REQ, FSPEC, TSPEC, PLAN, PROPERTIES, LEARNINGS (and the cited POSTMORTEM) | ✅ | all seven files present |
| BL-06 / M-7a — `parseResolvedMarker` → `checkPostmortem` → step-G refusal → `haltError` | ✅ | `parseResolvedMarker` (`orchestrate-dev.js:1105`), `checkPostmortem` (`:2695`), step-G literal `Refused — unresolved POSTMORTEM at` (`:4246`), `throw haltError` (`:4247`) |
| M-7b — the halt catch rewrites the queue row, and the entry-validation halts do **not** | ✅ | `recordHaltFn({ feature: featureName, status: "halted" })` (`:4907`); the REQ-path / `forcePhases` / REQ-existence halts each `return buildFinalReport({… outcome: "halted" …})` directly (`:4292`–`:4360`) |
| M-1a — one module-scope constant | ✅ | `const MAX_REVIEW_ROUNDS = 5;` (`:52`) |
| M-1b — `windowEnd` is the sole width site, two callers | ✅ | `return startIndex + MAX_REVIEW_ROUNDS - 1;` (`:2451`); callers `reviewLoop` default (`:1830`) and `deriveRoundWindow` (`:2433`) |
| M-1c — three arithmetic-free value-reading sites | ✅ | `recordPhase` argument (`:1779`), post-mortem prompt literal (`:1938`), `iterations: MAX_REVIEW_ROUNDS` (`:1984`) |
| M-1d — per-invocation budget | ✅ | `deriveRoundWindow` (`:2386`); its JSDoc still says *"Step 6 makes `MAX_REVIEW_ROUNDS` a per-invocation BUDGET rather than an absolute cap"* (`:2364`) |
| M-1e — the halt path recomputes `last` from the same helper | ✅ | `const last = endIndex === undefined ? windowEnd(first) : endIndex;` (`:1772`) |
| M-7e — the halt dispatch is a bare `Write ${postmortemPath}.` plus a section list, no preservation obligation | ✅ | `:1935`–`:1938` |
| One `docType` per phase, so a per-phase POSTMORTEM is a per-document one | ✅ | `PHASE_DISPATCH` (`:108`) — R/REQ, F/FSPEC, T/TSPEC, D/DECISIONS, P/PLAN, PR/PROPERTIES |
| Sibling AC citations resolve: `pdlc-rcv-fixed-point-stop` AC-2.1, AC-2.2, AC-2.8; `pdlc-rcv-panel-topology` AC-3.2, AC-4.1 | ✅ | all present in the cited files |
| Catalogue ids S-3, S-4, S-11, S-12, S-13, S-14, S-15, S-16 owned/read as §4 states | ✅ | `docs/_constraints/pdlc-rcv-catalogue.md` §2 |
| §1's "66 KB — 40% of the finished document" | ✅ | baseline §1.1: 165.3 − 99.0 = 66.3 KB; 66.3/165.3 = 40% |
| §1's "blocking count reached its minimum at round 2 and rose thereafter" | ⚠️ partly | baseline §1.1 table is 11, 6, **6**, 7, 9 — round 3 held the minimum. See F-08 |
| **The claim that a step-4 refusal "reaches step G's path"** | ✅ mechanically available | step G's `throw haltError` is inside the `try` that wraps `pipelineFn`, so it reaches the catch at `:4111` and therefore `recordHaltFn`. But see F-02/F-03 for what is *not* determined |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The write that consumes the clearance has no confirmation and no failure disposition — the one fail-open hole the REQ exists to close is still open, and it needs no hand-edit to reach.** AC-1.4 requires the halt's post-mortem write to be *confirmed* ("confirming the write rather than trusting the agent's reply"), and O-5 assigns TSPEC the read-modify-write **for the halt path**. The answering line of AC-1.5(4) is written on a *granting* entry, which is not a halt, so O-5 does not reach it and no obligation in §8 does either. If that append fails or is lost — unwritable file, a crash between the append and the round dispatch, a partial write — then `A < H` still holds on the next entry, the same `RESOLVED: yes` is observed unconsumed, and **a fresh three-round window is granted again, every invocation**. That is precisely §1's *"the per-invocation budget restored silently and fail-open"* and R-10's stated hazard, reached without any operator hand-edit. Required: state that the answering-line write is confirmed on the same terms AC-1.4 confirms the post-mortem write, state the fail-closed disposition when the confirmation fails (do not open the window; refuse or halt), and add the obligation to §8 alongside O-5. | AC-1.5(4); §4.1 row *"Whether a clearance is still unanswered"*; O-5 |
| F-02 | High | Local | **The refusal and the grant are both stated as running "on every entry", but the phase gate has a skip exit that is never analysed — and both placements of the algorithm are materially different behaviours.** At HEAD `phaseGate` can return `{ skip: true }` *before* step G, on an approved-and-fresh document (`freshness === "FRESH"` → `recordPhase(phaseId, label, "⏭", …)`, `orchestrate-dev.js:4213`–`:4225`), and on that path `checkPostmortem` is deliberately evaluated **for reporting only**. AC-1.5(4) says the step-4 refusal "sits inside `W`'s resolution, which runs on **every** entry" and then enumerates exactly **two** branches (exhausted, mid-window). The skip branch is a third, and it is the worst one: a corrupt region in a post-mortem left behind by an *already-approved* phase (harvest has not run yet, so the file is still there) would refuse and halt the whole pipeline on a phase that has nothing to review, indefinitely, with no round to be gained by repairing it. The mirror problem applies to the grant: a skipping entry that observes an unconsumed clearance would **spend the operator's one-shot escape hatch on an entry that opens no round**. O-6 asks TSPEC only *where the algorithm runs so a refusal reaches step G's path* — that does not decide this. The REQ must state whether `W`'s resolution runs before or after the skip decision, and add the skip branch to the refusal's cost analysis. | AC-1.5(4) step 4 and its two-bullet justification; O-6 |
| F-03 | Medium | Local | **The refusal's operator-facing text is unspecified, and the shipped recovery line actively misleads on this path.** AC-1.5(4) says only that "a ❌ phase row is recorded". At HEAD the step-G path it borrows records the literal `Refused — unresolved POSTMORTEM at ${gate.path}` and sets `gatePostmortem`, which makes the final report's `postmortemStatus` = `"unresolved"` and `postmortemPath` = that file (`orchestrate-dev.js:4246`, `:4130`–`:4132`). A step-4 refusal fires on a post-mortem the operator **did** resolve, so reusing that row tells the operator the opposite of the truth. Worse, the halt catch unconditionally emits `Recover: set the ${featureName} row in docs/_queue/QUEUE.md back to pending, then re-run the queue` (`:4926`) — an operator who follows exactly that, without noticing the S-16 notice, reproduces the refusal on every queue iteration. Fix in the REQ, not downstream: name what the ❌ row and the halt reason say on a step-4 refusal (and whether they are new boundary-crossing strings the catalogue must own, or whether S-16 is deliberately the only new string). | AC-1.5(4) *"a refusal is not a halt"*, fourth bullet |
| F-04 | Medium | Cross-Feature | **The window end must now be a function of `W`, but `deriveRoundWindow` is contractually seam-free and synchronous, and the REQ never says how `W` gets there.** AC-1.5(1)/(2) require `endIndex = W + MAX_REVIEW_ROUNDS − 1` while `startIndex` stays one past the highest existing round. At HEAD both are computed inside `deriveRoundWindow(basenames, docType)` (`orchestrate-dev.js:2386`, `endIndex = windowEnd(startIndex)` at `:2433`), whose JSDoc pins the contract *"Synchronous, total, takes no seam (§3.7)"* — a property `CLAUDE.md` also documents as load-bearing ("purely content-addressed"). `W` is read from the post-mortem through an async `_readFile`. AC-1.2's claim that a maintainer changes "exactly one module-scope constant and **no arithmetic anywhere else**" understates this: the *argument* to `windowEnd` changes identity, and the function that computes it either gains a seam (breaking a documented invariant) or gains a `W` parameter (fine, but must be said). State that `W` arrives as a resolved **value**, so `deriveRoundWindow` keeps its seam-free contract, or record the contract change explicitly. | AC-1.2; AC-1.5(1)–(2); O-6 |
| F-05 | Medium | Local | **`forcePhases` is a documented operator entry point whose behaviour this REQ silently changes, and it is not mentioned anywhere in the document.** Today `forcePhases R` on a branch with three rounds re-enters and is admitted rounds 4…8 (M-1d). Under AC-1.1/AC-1.5(1) that same force is admitted **no rounds** and halts immediately on the budget path, writing a post-mortem and a `halted` queue row. So the override that `CLAUDE.md` describes as "overrides a recorded approval only" becomes inoperable for its main purpose after round 3 — and a *second* force is refused again, because at `A = H` the marker on disk grants nothing. Either forcing also grants a window (in which case say so, and say how it interacts with `A`/`H`, because it would be a second grant path competing with the one-shot clearance), or it explicitly does not and the REQ says the only route past the cap is the `RESOLVED: yes` clearance. Silence here means FSPEC decides an operator-visible policy. | AC-1.1, AC-1.5(1); §7 |
| F-06 | Medium | Local | **"On every halt, without exception" is stated over a scope wider than any mechanism can satisfy, and it collides with N-7.** At HEAD the only writer of `POSTMORTEM-{phase}-{feature}.md` is the review loop's non-convergence path (`orchestrate-dev.js:1935`); every other halt class — creator-agent failure (`:4419`), the branch guard (`:276`, `:341`), the listing failure in `phaseWindow` (`:4128`), Phase PUB/CI (`:3690`), DoD — throws `haltError` and writes **no** post-mortem. Read literally, AC-1.4 obliges the region to be maintained on those halts too, which is either impossible (no file to hold a region) or means creating a post-mortem where none exists today — an N-4 violation. Separately, N-7 excludes Phase CR and Phase DOD from the family's mechanisms while AC-1.4 says "every halt". Scope the rule to *every halt that writes `POSTMORTEM-{phase}-{feature}.md` for this document's phase*, and restate §4.1's *"`H` is exactly the number of halts this document has taken"* accordingly — the *pairing* argument survives that narrowing (a halt with no post-mortem leaves no marker to clear), but the sentence as written is false at HEAD. | AC-1.4 clause 1; §4.1; §7 N-4/N-7 |
| F-07 | Medium | Local | **`iterations` is ambiguous exactly on the entry the new rule makes common.** AC-1.3 requires the post-mortem's Iterations section, the phase record and the returned `iterations` field to state **three** and be "consistent". At HEAD `iterations: MAX_REVIEW_ROUNDS` (`orchestrate-dev.js:1984`) is the **budget**, not the rounds run. Under AC-1.5(1) the commonest new halt is the branch admitted **no rounds at all** — the report would then claim three iterations for an invocation that dispatched nobody. That directly contradicts the care taken elsewhere over the same case (row B derives its `round` cell from the listing precisely because "the mechanical derivation from absent files gives the wrong answer", and the refusal path is at pains to say "no halt was taken"). State whether `iterations` means the budget or the rounds consumed in the window, and what it reads on a zero-round budget halt. | AC-1.3; AC-1.5(1); AC-1.5(4) row B |
| F-08 | Low | Local | **A checkable claim about the baseline is off by one round.** §1 and the REQ-RCV-01 rationale both say the blocking count "reached its minimum at round 2 and rose thereafter". The baseline's own table (§1.1) is 11, 6, **6**, 7, 9 — round 3 held the minimum; the rise starts at round 4. The conclusion is unaffected, but this is the exact class of mechanically-checkable defect P-4 and REQ-RCV-06 exist to stop consuming review rounds. Suggested: "reached its minimum at round 2, held it at round 3, and rose thereafter". | §1 bullet 2; §5 REQ-RCV-01 preamble |
| F-09 | Low | Local | **The migration case — branches already carrying more than three rounds — is not stated.** At the commit that lands `MAX_REVIEW_ROUNDS = 3`, every in-flight phase whose branch already has 3+ rounds is admitted no rounds and halts on the next entry, and its S-4 render reads `budget-exhausted: rounds 1..3 of 3` while five rounds sit on disk. That is the correct render per the catalogue and arguably the intended behaviour, but an operator meeting it will read it as false. One row in §9 (or one sentence in AC-1.5(1)) naming the case, and confirming the escape is the ordinary `RESOLVED: yes` clearance, closes it. | AC-1.5(1); §6 `budget-exhausted:` row; §9 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does `W`'s resolution — and therefore both the step-4 refusal and the clearance-consuming append — run **before** or **after** `phaseGate`'s skip decision? This is F-02's core, and I do not think either answer is obviously wrong; I need the REQ to pick one. |
| Q-02 | Is a repeating S-11 halt bounded? Each S-11 clearance writes `WINDOW-RESUMED: {W}` and leaves `W` unchanged, and AC-2.8 says the undispatched round is "not counted against the budget". An authoring side that keeps producing zero-delta rounds therefore yields an unbounded sequence of halt/clearance pairs, `H` and `A` growing together, `W` never moving, and the budget never exhausting. Each iteration costs an operator action, so it is not unattended — is that considered sufficient, or should a resumed window that produces no round be capped? |
| Q-03 | An entry that grants a window (writes `WINDOW-START: N`) and then fails before opening any round: the clearance is spent and `A = H`, so a subsequent entry grants nothing, but the window at `N` is intact and usable. Is that the intended reading? It is derivable but never stated, and it is the case an operator will hit after a stall-killed dispatch. |
| Q-04 | Is anything required of the region's durability *between* the halt dispatch and O-5's re-apply? The post-mortem is written by an agent and the region re-applied afterwards; a crash in that gap leaves either no region (next halt re-creates a one-line region — `H` now understates the halts) or a truncated one (fail-closed refusal with no clearance to spend). O-5 says "reporting a lost or unwritable region rather than proceeding", which covers the report but not the resulting `H`. |
| Q-05 | An unreadable-but-present post-mortem (an IO error rather than an absence) is read by `checkPostmortem` as `status: "none"` at HEAD, which means no halt is in force **and** the region reads empty ⇒ `W = 1`, `H = A = 0`. `W = 1` is the conservative direction, so this is not a fail-open on the window — but it is a fail-open on the halt gate, and the REQ now leans the whole window accounting on that same read. Worth one row in §4.1, or is it deliberately N-4's territory? |

## Positive Observations

- **The document is inside the size budget it was cut to satisfy:** 410 lines / 48 KB, against the
  700-line / 60 KB ceiling the `check-req-size` hook enforces. §10 documents the v1.0 → v1.1 cut and
  claims no id was renumbered — I checked, and every `S-*`, `M-*`, `N-*`, `X-*`, `O-*` and sibling
  `AC-*` reference in this document resolves in the file it names. That is the first REQ in this
  family's lineage for which the citation-verification pass produced no unresolved reference.
- **The §4.1 durability table is the right instrument, and it is honest.** Every quantity the ACs
  read is named with an on-branch home and an if-absent disposition, and the table's own claim — "a
  criterion stated over an in-process-only row is a defect in this document; there is no such row" —
  held under checking. This is the discipline the predecessor's Phase R lacked (M-1d, M-2f).
- **AC-1.5(4)'s `H`/`A` accounting is a genuinely good design.** Counting halts against answers keeps
  the clearance one-shot *without* touching the single-valued human marker the shipped reader
  requires (M-7a). The ratchet table that walks both reachable values of `H − A` under a hand-edit,
  and the derivation that "deleting an answering line is unsafe at every `H − A`", close a real
  fail-open hole rather than gesturing at it.
- **"A refusal is not a halt" is exactly the right distinction to have noticed.** The observation
  that leaving the entry running would let AC-1.4 fire and spend the clearance the refusal declined
  to spend is subtle, correct, and would have been a very expensive implementation bug.
- **The positive control is named as such.** Identifying the mid-window branch as the only branch on
  which honouring step 4 and falling back are distinguishable — and binding it to a PROPERTIES
  obligation in O-10 — is the kind of falsifiability the family's other documents should copy.

## Recommendation

**Needs revision**

Two High findings must close before FSPEC authoring:

1. **F-01** — give the clearance-consuming append a stated write-confirmation and a fail-closed
   disposition on failure, and add the obligation to §8. As written, the document's central promise
   (the escape hatch is spent exactly once) rests on a write nothing checks.
2. **F-02** — state whether `W`'s resolution runs before or after the phase gate's skip exit, and
   extend the refusal's cost analysis to that third branch. Both the refusal and the grant behave
   differently depending on the answer, and neither behaviour is currently derivable from the
   document.

The five Medium findings (F-03 the refusal's operator-facing text, F-04 `deriveRoundWindow`'s
seam-free contract, F-05 `forcePhases`, F-06 the scope of "every halt", F-07 `iterations`) are each
a decision the FSPEC would otherwise have to make on the REQ's behalf, and each is operator-visible.
F-08 and F-09 are corrections, not blockers.

Nothing here contests the requirement itself. The budget reduction, the absolute-per-document
window, and the anchored one-shot reset are the right shape, and the mechanism is stated at a level
of precision that made this review checkable rather than speculative.

## Verdict

The document is not yet implementable without the FSPEC author resolving decisions the REQ should
own. Two High and five Medium findings are open.

VERDICT: Needs revision

