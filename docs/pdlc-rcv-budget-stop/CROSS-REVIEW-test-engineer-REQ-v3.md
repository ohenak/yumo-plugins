# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v1.3, 508 lines / 61,328 bytes)
**Scope:** Testing lens only, **delta re-review**. Verification that each v2 finding is closed, plus a scan of the text added or rewritten since v2 for new issues. Sections unchanged since v1/v2 and already approved are not re-litigated. Product strategy, architecture and prose style remain out of scope.
**Reviewed range:** `fa83925..94e2137` (7 commits touching the REQ; 80 insertions, 69 deletions)
**Date:** 2026-08-01
**Iteration:** 3

## Disposition of v2 findings

Four of five are **closed**. F-12 is **partly closed** — the render it asked for now exists and is
registered, but the row it is assigned to still contradicts its own definition (see F-17 and F-18).
Each was checked against the current text and, where it cites code, against HEAD.

| v2 | Severity | Status | Where it was answered |
|----|----------|--------|----------------------|
| F-12 | Medium | **Partly closed** | The three things I asked for are three-quarters done. The render exists: AC-1.5(4) now says the unconfirmable-append entry emits *"row B with an empty `notice` — no S-16, no S-4"*, its ❌ text is §6's new **Unconfirmed-append text** row (`Refused — answering line unconfirmed at {path}`), and its recovery text is *re-run*. The two false invariants are scoped: *"the file is not byte-unchanged … and the ratchet's same reason next entry has no reason to be stable"* — exactly the scoping asked for. O-10 carries the leg. What is **not** closed is the row assignment itself: row B is still defined four paragraphs earlier as `notice` = **S-16 alone**, and catalogue §3 still keys row B to *"an entry whose reset region failed validation"* — which this entry is not. Filed forward as **F-18**. |
| F-13 | Low | **Closed** | Step 5 now reads *"the greatest `WINDOW-START:` value present, or 1 if there is none — read **after** any answering line this entry confirmed, so on a granting entry step 5 and clause 4 agree that `W` = `N`. The grant is part of the algorithm, not a separate rule beside it."* The double definition is gone and the read order is fixed. |
| F-14 | Low | **Closed** | Row C's gloss *"the round that would have opened"* is deleted; the mechanical rule stands alone, so the migration case (highest 5, `W` = 1) has one answer and it is the one a test author derives. |
| F-15 | Low | **Closed** | §7 now says *"**Four** are worth pointing at"* over the four-row table, and *"`N-5`, `N-6` and `N-8` are **inapplicable to this REQ, not overlooked**"*. Both halves fixed. The §5 count moved with it and is now right: six owned (S-12, S-13, S-14, S-15, S-16, S-4) and two read (S-11, S-3) — counted against the table, not the prose. |
| F-16 | Low | **Closed** | O-10 now reads *"the S-4 reason rendered from the window's own origin, its slots computed from `W`, `windowEnd` and the constant (the `rounds 4..6 of 3` shape is **illustrative**, never a literal expectation)"*. The literal is explicitly demoted to an example inside the test obligation, which is where it had to be fixed. |

Q-04 and Q-05 are both still open — see the Questions section; neither is a finding.

## Findings

Five, all in text added or rewritten since v2. One High.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-17 | High | Local | **The one positive conjunct v1.3 added to replace v2's absence-only `postmortemStatus` oracle asserts a value the shipped field cannot take, and the alternative it offers is unreachable by construction — so O-10's oracle cannot be written, and the absence-only oracle it was meant to retire is what a test author is left with.** AC-1.5(4) now reads *"`postmortemStatus` reads `resolved` — the operator did clear it — or is unset; **never** `unresolved`"*, and O-10 mandates *"`postmortemStatus` asserted `resolved`-or-unset and **never** `unresolved`"*. Checked at HEAD: (a) the field's reachable values are exactly `"none"`, `"unresolved"`, `"written"` and `"write_failed"` (`pdlc/workflows/orchestrate-dev.js:4875`, `:4881`, `:4888`, `:4899`, `:1802`, `:4958`). **There is no `resolved`.** (b) *Unset* is unreachable **on purpose**: `buildFinalReport` declares `postmortemStatus = "none"` as a **default parameter** (`:5035`) and emits the key unconditionally (`:5054`), under a comment that spells out why — *"§4.7's four halt-disposition fields ride on EVERY report, present with a readable value on success too: a conditionally-spread field cannot express 'no POSTMORTEM', which is precisely the fact `RLH-AT-46` reads"*. So a test written from this clause asserts a disjunction whose left member does not exist and whose right member an existing AT pins as impossible; the only assertion that can be written from it is `!== "unresolved"` — the absence-only oracle v2's F-12 and this REQ's own O-10 discipline (*"a count, not an absence"*) exist to forbid. The document also contradicts itself here: AC-1.5(4) says *"no other new string is minted"* and §5 says *"FSPEC may not add an eighteenth id"*, yet `resolved` is a new value of a shipped enum registered in neither §5 nor §6. Fix is one clause and one word: name the **shipped** value this path leaves the field at — on the refusal path `gatePostmortem` is not set and no post-mortem is written this run, so `"none"` is the value the shipped code produces — and if a distinct value is genuinely wanted, register it in §6 as an owned threshold and say which code sets it. Then O-10's oracle becomes a single positive equality with step G's `"unresolved"` as the negative control, which is what was intended. | AC-1.5(4) *"A refusal is not a halt"* third bullet, O-10, §6 *Refusal phase-row text*, `orchestrate-dev.js:4875`–`:4902`, `:5035`, `:5054` |
| F-18 | Medium | Cross-Feature | **The unconfirmable-append entry is assigned to row B, and row B is now defined twice with two mutually exclusive `notice` cells — both asserted character for character by O-10.** AC-1.5(4)'s row B definition is unchanged: *"`notice` = **S-16 alone**, **no S-4 reason**"*. The new clause four paragraphs above says this entry emits *"**row B with an empty `notice`** — no S-16, no S-4"*. O-10 now asks for **both**: *"**row B** asserted character for character with **no** S-4 reason"* and *"the unconfirmable-append entry emitting §6's *Unconfirmed-append text* with an **empty** `notice`"*. A test author reading "row B, character for character" has two answers for one row identity and no rule for choosing; whichever they pick, the other leg is unfalsifiable. The cross-document half is worse, and is why this is `Cross-Feature`: `docs/_constraints/pdlc-rcv-catalogue.md` §3 states *"**Three rows have no dispatch behind them**"* and keys row B to *"the row of an entry whose **reset region failed validation**"* — this entry's region **passed** steps 1–3 (that is why a grant was attempted), so on the catalogue's own key it is not row B, and it is a **fourth** dispatch-less row the catalogue's count excludes. That is the same defect v2's F-12 raised; naming it "row B" resolves the REQ's silence without resolving the disagreement. One of two fixes closes it: give the variant its own identity (row D, or "row B with the empty-`notice` variant") and amend catalogue §3's count and row-B key in the same change; **or** widen row B's `notice` cell in AC-1.5(4) to *"S-16 alone on the validation-failure path, empty on the unconfirmable-append path"* and amend the catalogue's row-B key to cover both. Either way O-10 must then name which entry class each character-for-character assertion belongs to. | AC-1.5(4) *"Row B — the report row of a step-4 refusal"* vs. the unconfirmable-append clause, O-10, `docs/_constraints/pdlc-rcv-catalogue.md` §3 |
| F-19 | Low | Local | **The exhaustiveness claim about minted strings is now false, and it is exactly the claim a test author would turn into a negative assertion.** AC-1.5(4) still says of the two refusal renders *"they are **not** new catalogue ids, and **no other new string is minted**"* — while §6, in the same revision, registers a **third** (`Unconfirmed-append text`) and its own new scope paragraph says *"the **three** refusal-render rows"*. The two statements are in the same document and disagree on the count. Neither number is load-bearing for behaviour, but "no other new string is minted" reads as an exhaustiveness invariant, and §6 is the registry that would be asserted against. Change "no other new string is minted" to name §6 as the closed list, or say "these three". | AC-1.5(4) *"A refusal is not a halt"* third bullet vs. §6 preamble and its three refusal-render rows |
| F-20 | Low | Local | **AC-1.2's new sentence states a disjunctive obligation whose second disjunct has no observable, and no O-\* carries it.** *"**`W` is `windowEnd`'s sole production argument:** the dormant `windowEnd(startIndex)` parameter defaults (`reviewLoop`'s `endIndex`, `checkConverged`'s fallback) compute a *wider* window whenever `W ≠ startIndex`, so they must be **removed or made unreachable**."* The citation is **correct** at HEAD — `reviewLoop` declares `endIndex = windowEnd(startIndex)` as a default parameter (`orchestrate-dev.js:1830`) and `checkConverged` falls back with `const last = endIndex === undefined ? windowEnd(first) : endIndex` (`:1771`–`:1772`) — and the hazard is real. But *removed* is falsifiable (the default is gone) and *made unreachable* is not: no test distinguishes an unreachable default from a reachable one that no fixture happens to hit, and O-10's enumeration never mentions `windowEnd` defaults at all. State the observable instead of the implementation choice — e.g. "on every production entry the admitted window is exactly `[W, windowEnd(W)]`, asserted at the seam that opens the round" — and add it to O-10 so the clause has a home. | AC-1.2, O-10, `orchestrate-dev.js:1771`–`:1772`, `:1830` |
| F-21 | Low | Local | **The document has 112 bytes of headroom, so the next revision cannot be written as prose.** 61,328 bytes against the 61,440-byte hard ceiling `pdlc/hooks/scripts/check-req-size.sh` enforces (`BYTE_LIMIT=61440`, `:41`); lines are fine (508 of 700). v2 had 548 bytes and this round consumed 436 of them. Not a defect in the content — filed because it constrains the fix for F-17 and F-18, both of which land in AC-1.5(4) and §6, and because the round-2 compression pass has already taken the easy slack. F-17 is a one-word change and F-19 a phrase; F-18's cheapest form is amending row B's existing `notice` cell in place rather than adding a paragraph. | whole document, `pdlc/hooks/scripts/check-req-size.sh:39`–`:41` |

## Questions

Both are v2 questions the revision did not touch. Neither blocks approval; both are things PROPERTIES
will have to decide, and deciding them here costs one clause each.

| ID | Question |
|----|---------|
| Q-04 | *(carried from v2, unanswered)* Does the **confirmation read** of the answering line (AC-1.5(4)) also re-run steps 1–3 on the re-read region? The clause still says only *"the loop re-reads the file and confirms the line is present, in the region, at the end"*. If a partial write left the appended line malformed, presence-only confirmation passes while the region is now corrupt — and the entry opens a window on a region the *next* entry refuses with S-16. Confirming presence **and** validity makes the ratchet hold; confirming presence alone does not. PROPERTIES needs to know which assertion to write, and the two produce different fixtures. |
| Q-05 | *(carried from v2, unanswered)* Can a single entry both **grant** and **halt** — grant `W` = `N`, then take some other halt path before round `N` opens? If so, `H − A` still lands in {0, 1}, but the **order** of the appended `WINDOW-START:` and `HALT-REASON:` lines decides step 2's `WINDOW-RESUMED:` check on the following entry, and the document fixes the order only for lines written by *different* entries. |
| Q-06 | The refusal's recovery text is declared as *"names the sanctioned repair for `{reason}`"* (§6) and, for the unconfirmable-append entry, as *"re-run"*. Is *re-run* a distinct render with fixed wording, or does that entry emit the shipped generic *"set the row back to pending, then re-run the queue"* (`orchestrate-dev.js:4928`)? O-10 asserts the corrupt-region recovery text character for character and uses the shipped generic as a **negative control** — if the unconfirmable-append entry emits that same generic string, the negative control and this leg's positive assertion collide on the same string. |

## Positive Observations

- **The v2 Lows were fixed at the mechanism, not at the sentence.** F-13 was not answered by asserting
  that clause 4 governs; step 5 now *contains* the read order (*"read after any answering line this
  entry confirmed"*) and says the grant is part of the algorithm. F-16 was not answered by deleting the
  example; it was answered by demoting it in place (*"the `rounds 4..6 of 3` shape is illustrative,
  never a literal expectation"*), which keeps the grammar visible to a reader while removing the trap
  from the test obligation. Both are the durable form.
- **The compression that paid for round 2 did not cost a single stated behaviour.** I diffed all 69
  deleted lines: every one is a restated justification (the *"worst shape an operator-facing failure
  takes"* gloss, the disjoint-sets re-derivation, the *"machine-maintained describes normal operation"*
  aside, the round-history re-narration in §10). No AC clause, no cell, no oracle and no citation was
  dropped to make room. That is the hard part of a size-constrained revision and it was done cleanly.
- **O-10's new negative controls are the right shape.** *"with step G's shipped strings (`Refused —
  unresolved POSTMORTEM at …` and `set the row back to pending, then re-run the queue`) as **negative
  controls**"* turns a pair of look-alike renders into a mutation pair: an implementation that reuses
  step G's row passes a naive assertion and fails this one. Both strings check out at HEAD
  (`orchestrate-dev.js:4928` for the recovery line). This is the conjunct that makes "the refusal has
  its own operator text" testable rather than aspirational.
- **AC-1.2's new clause is a genuinely useful hazard call, and its citation is exact.** The two
  `windowEnd` defaults it names are both real and both silently widen the window when `W ≠ startIndex`
  — a defect that would have surfaced as an off-by-`W` in production and never in a unit test that
  passes `endIndex` explicitly, which every existing call site does. F-20 asks only for its observable,
  not for the clause.
- **§6's new scope paragraph answers the right question.** Baseline §3 says a threshold used by a child
  REQ and absent there is a defect; four rows of §6 are deliberately not baseline rows, and the
  paragraph now names them and gives each a registered authority (catalogue §2, or this table). Without
  it a reviewer of the baseline would have filed those four as defects on every future pass.
- Citations re-spot-checked at HEAD for the **changed** text only: `reviewLoop`'s `endIndex =
  windowEnd(startIndex)` default (`:1830`) and `checkConverged`'s `endIndex === undefined` fallback
  (`:1771`–`:1772`) are as described; step G's two shipped strings are as quoted; baseline §3 contains
  exactly six RCV-01-owned rows, matching §6's *"owns six of its rows"*; §5's table is six owned and two
  read, matching its new count; catalogue §2's S-16 enum is still closed at three reasons. The only
  citation that does **not** check out is `postmortemStatus`'s `resolved` (F-17).

## Recommendation

**Needs revision**

Four of the five v2 findings are closed and the fifth is three-quarters closed. What blocks approval is
**one High and one Medium**, and both live in the same two paragraphs of AC-1.5(4) — the paragraphs
this round rewrote. Neither needs a decision about behaviour; both are about naming the thing the
behaviour already is.

1. **F-17 (High)** — `postmortemStatus` cannot read `resolved`, and it cannot be unset. The shipped
   enum is `none | unresolved | written | write_failed` and `buildFinalReport` defaults the field to
   `"none"` and always emits it, deliberately, because `RLH-AT-46` reads that fact. As written, O-10's
   oracle is unwritable, and the only assertion derivable from the clause is `!== "unresolved"` — the
   absence-only oracle this clause was added to retire. Name the shipped value the refusal path leaves
   the field at (on that path `gatePostmortem` is unset and no post-mortem is written, so it is
   `"none"`), or register a new one in §6 and say what sets it. **One word, plus deleting "or is
   unset".**

2. **F-18 (Medium)** — say which row the unconfirmable-append entry emits, in a way that does not
   define row B twice. Row B's own cell says `notice` = S-16 alone; the new clause says row B with an
   empty `notice`; O-10 asserts both, character for character. Catalogue §3 independently keys row B to
   a **failed-validation** region and counts exactly **three** dispatch-less rows, so this entry is not
   row B on the catalogue's own definition. Either widen row B's `notice` cell to the two-path form and
   amend the catalogue's row-B key, or give the variant its own row id and amend the catalogue's count.
   Either way, O-10 must say which entry class each character-for-character assertion belongs to.

The three Lows are one line each and none needs a decision: fix the "no other new string is minted"
count against §6's three rows (F-19), state AC-1.2's observable and give it a home in O-10 (F-20), and
budget the edit against 112 bytes of headroom (F-21).

**On room.** F-21 is not decoration. At 61,328 of 61,440 bytes, the fixes above have to be made *in
place*: F-17 is a word, F-19 a phrase, and F-18 is cheapest as an amendment to row B's existing
`notice` cell rather than a new paragraph. The one place a few hundred bytes are still recoverable is
O-10, which now restates the mid-window fixture's synthetic provenance that AC-1.5(4) step 4 and R-11
both already state.

Explicitly **not** filed, per §8 and DC-09: fixtures, seams, test levels and oracle wiring — O-10 and
O-12 own them and, F-17 and F-18 aside, now name the conjuncts that matter. Also not filed: anything in
§1, §2, §3, §4, §9 or §10, approved at v1 and changed here only by the compression the disposition
table records; and nothing in §5, §6 or §7 beyond the counts I re-derived. Nothing in this review
contests user need, priority, phasing, the choice of three rounds, or the reset-region design.

## Verdict

VERDICT: Needs revision

{"high": 1, "medium": 1, "low": 3}
