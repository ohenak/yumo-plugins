# Cross-Review: software-engineer — FSPEC (round 15, erratum delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md
**Date:** 2026-08-07
**Iteration:** 15
**Scope:** Delta confirmation only. Prior approval: CROSS-REVIEW-software-engineer-FSPEC-v14.md
(`Approved with minor changes`). Delta under review: commit `91059d41` — the one-item Phase D
erratum round (AT-Q7c's invoking-tree upper bound), plus the two Low locator repairs of the v14
reviews. No re-review of unchanged sections.

## 1. What changed

`git diff 99aff9bc..91059d41 -- FSPEC` is 18 insertions / 4 deletions across exactly four hunks.
Three are prose or locator text; one is the AT-Q7c cell. Nothing else in the document moved.

| Hunk | Lines | Change | Class |
|---|---|---|---|
| 1 | `:9-26` | version row `11.4 → 11.5`, date `2026-08-07`; new 14-line erratum-round note recording the one erratum and the two locator repairs | header/provenance |
| 2 | `:527` (§4.2 producers table) | `§4.3 ':511-512'` → `§4.3 ':557-558'` | locator repair (my v14 F-01a) |
| 3 | `:2120` (AT-P7) | `§14's change register (':2401')` → `§15.3's change register (':2449')` | locator repair (my v14 F-01b) |
| 4 | `:2168` (AT-Q7c) | the invoking-tree upper bound restated as §6.5's frozen set ∪ TSPEC's recorded widenings, plus a paragraph naming what the row fixes as the *shape* of the bound | the erratum |

Zero changes to §6.5 itself, to any rule, AC, BR, NFR, E-row, fixture, or to any other AT row. The
14-line header insertion is what shifted every downstream line number by exactly 14 — which is why
the two locator repairs land on `:557-558` and `:2449` rather than the `:543-544` / `:2435` I named
in v14. I re-derived both against HEAD rather than trusting the arithmetic: §4.3 spans `:542-561`
and its release-after-append sentence is at `:557-558`; §15.3 is at `:2445` and its
`nudge-consolidation.sh` row is at `:2449`. Both correct.

## 2. Erratum item — resolved?

All seven routed erratum entries are the same defect, raised three ways by three reviewers: AT-Q7c
spelled the invoking-tree upper bound as the literal `{add, commit, read-branch, read-status}` and
called it "its permitted set", which is §6.5's **pre-widening** set, so a property transcribing the
row was red on correct code.

**The premise checks out at HEAD, independently of the erratum text.** TSPEC §9.3
(`TSPEC-pdlc-consolidation-agent.md:1714`) records four widenings under `DEC-LAYER-01`; the
invoking-tree row (`:1724`) reads `read-branch`, `read-status`, ⊕ `read-object`, ⊕ `read-remote`,
⊕ `read-index`, and the widening table at `:1741-1745` attributes `read-index` to
`git ls-files --cached --others --exclude-standard` — "§7.1's corpus enumeration". AT-Q7c's own
Given is a **`promoted`** pass, and a pass that promotes has enumerated the corpus, so `read-index`
is observed on this row's Given by construction. The reviewers' claim is exactly right and it is a
red-on-correct-code defect, not a wording preference.

**The fix is the right one.** The row now bounds the invoking tree above by "§6.5's frozen
`{add, commit, read-branch, read-status}` ∪ every widening TSPEC has recorded against it under
DEC-LAYER-01, which at TSPEC §9.3 is ⊕ `read-object`, ⊕ `read-remote`, ⊕ `read-index`", and spells
the resulting seven-member set out. Three things make this the correct shape rather than a patch:

1. **It matches HEAD's TSPEC exactly** — seven members, and I diffed them member-for-member against
   `TSPEC:1724`. No member is invented and none is missing.
2. **It does not edit §6.5.** §6.5's own text (`:1058`) makes the permitted sets "a frozen statement
   TSPEC inherits", with widening "a recorded TSPEC decision against this set, never a silent
   reading of it". Restating §6.5's literal to include TSPEC's widenings would have *broken*
   DEC-LAYER-01 by letting the FSPEC track the implementing layer. The erratum edits the AT row —
   the surface a test author transcribes — and leaves the frozen layer frozen. That is the layering
   the seam table asks for.
3. **It names the invariant, not just the new members.** The row now says what it fixes is the
   *shape* of the bound — obliged-below, permitted-above, no merge or branch verb in either — "not
   a literal frozen ahead of the widenings the seam table's own DEC-LAYER-01 clause invites". That
   is what stops this erratum recurring on the next recorded widening: a fifth ⊕ read does not
   falsify the row, it extends the set the row already points at. A patch that had simply inlined
   the three new verbs would have been red again at widening five.

The row's falsifying half survives the edit intact and is still load-bearing: it still asserts
containment in both directions on all three domains, still refuses set-equality (an oracle asserting
`= {add, commit}` in the invoking tree is still named as red on a conforming pass), and still pins
the Given to `promoted` so the containment reading is not satisfiable vacuously by `∅` everywhere.
Widening the upper bound weakens the assertion only by three non-mutating read verbs — no merge
verb, no branch verb, nothing AC-3.7 or AC-3.8 depends on entered the set. AC-3.7's prohibition is
carried by "merge verb ∉ any permitted set", and that is unchanged.

**Item resolved.**

## 3. Regression check against the v14 approval

Four things could have broken. I checked each against HEAD rather than against the erratum note.

**(a) Does the sibling row AT-Q7 carry the same defect?** No — and this is the check that decides
whether the erratum was correctly *scoped* rather than merely correctly *applied*. AT-Q7's
assertion (1) (`:2166`) bounds every domain by "that domain's permitted set (§6.5's obliged ∪
permitted columns)" — a **reference to the shape** of the set, resolved through §6.5, whose own text
(`:1058`) tells the reader the set is widened by recorded TSPEC decision. AT-Q7 never inlines the
literal, so an author following it arrives at the widened set. AT-Q7c was defective precisely
because it *did* inline the literal and then asserted it was "its permitted set". Leaving AT-Q7
untouched is correct, not an omission; editing it would have added a second place to keep in sync.
AT-Q7's assertion (2) does name literals, but only in the **obliged** column (`{add, commit}` in the
invoking tree), which no widening touches — TSPEC §9.3 records all four widenings in
permitted-but-not-obliged columns (`TSPEC:1718-1719`), so the obliged literals are still exact.

**(b) Did the header insertion drift any other intra-document locator?** No. The 14-line insertion
shifts every line below it, so I enumerated every `` `:NNNN` ``-style locator in the document (29
lines carry one) and classified each. All of them except the two repaired here point into *other
files* — `orchestrate-dev.js` (`:709`, `:1797`, `:1833`, `:3520`, `:8617`, …), `build-runtime.mjs`
(`:448-471`), `pdlc-cli.mjs` (`:291`) — and are unaffected by a shift in this document. The FSPEC
has exactly two self-locators, and both are the ones this delta repaired. The one surviving
`§14 :2401` string is inside the erratum note itself, quoting the value it replaced. No residual
drift.

**(c) Did anything I approved in v14 change meaning?** No. Hunks 2 and 3 change only digits inside a
citation, and both new targets resolve: §4.3 spans `:542-561` and its "release runs at step 16 after
the terminal row is appended" sentence is at `:557-558`; §15.3 opens at `:2445` with the
`nudge-consolidation.sh` row at `:2449`. Both of my v14 F-01 sub-findings are closed, and closed
against HEAD rather than against my (now stale by construction) v14 line numbers. Hunk 4 touches one
table cell; §6.5, every rule, AC, BR, NFR, E-row and every other AT row are byte-identical.

**(d) Is the AT-Q7c cell still internally consistent after the insertion?** Yes. The added paragraph
sits between the upper-bound clause and the pre-existing "That is containment, not equality"
sentence, and that sentence's referent is unchanged — it still refers to the two-sided bound just
stated. The cell still carries its `∅`-on-two-domains claim, its no-obligation-on-empty-domains
claim, its `promoted`-Given rationale and its two named red-on-correct-code counterexamples. Nothing
in the cell now contradicts anything else in it.

## Findings

None. No High, no Medium, no Low.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No findings this round | — |

My v14 F-01 (Low, both sub-findings) is **closed** by hunks 2 and 3.

## Questions

| ID | Question |
|----|---------|
| — | None. I raised no question this round; the delta answered the one it was routed to answer. |

## Positive Observations

- **The erratum fixed the shape, not the symptom.** The three ⊕ verbs are spelled out, but the row's
  operative clause is "§6.5's frozen set ∪ every widening TSPEC has recorded against it under
  DEC-LAYER-01". A fifth recorded read widening extends the set the row already points at instead of
  falsifying the row. This is the difference between a repair and a recurrence, and it is the reason
  I have no residual finding here.
- **The layering held under pressure.** The cheap fix — restating §6.5's literal to include the
  widenings — was available and was declined, with the reason stated in the erratum note ("§6.5 is
  unchanged: it remains the frozen statement TSPEC inherits and widens by recorded decision"). That
  is DEC-LAYER-01 being obeyed at the moment obeying it costs something.
- **The falsifying power of AT-Q7c is intact.** Widening an upper bound normally weakens an oracle.
  Here the three additions are all non-mutating reads; no merge verb and no branch verb entered any
  permitted set, so AC-3.7's "merge verb ∉ any permitted set" and AC-3.8's branch prohibition are
  carried exactly as before. The row's two named counterexamples (universal set-equality; a
  `= {add, commit}` invoking-tree bound) are both still red on correct behaviour.
- **The scope discipline is worth noting for harvest.** Three reviewers raised one defect seven ways;
  the edit is 18 lines across four hunks, none of them speculative. An erratum round that only
  touches what the errata named is the cheap case for a delta confirmation, and this is one.

**One observation, deliberately not filed as a finding.** §6.5's closing worked example (`:1058`)
still reads "…and contained in `{add, commit, read-branch, read-status}`" — the pre-widening literal,
in the frozen layer's own prose. That is **correct as written**: §6.5 is by construction the frozen
statement, and the same paragraph says widening is a recorded TSPEC decision against it, so the
literal is the frozen datum the reader is told to widen, not a stale bound. Editing it would put the
FSPEC in the business of tracking the implementing layer, which is exactly what DEC-LAYER-01
forbids. I record it only so a future reader who greps the literal knows it was seen and left
standing on purpose, and so the harvest has the reason on record.

## Recommendation

**Approved.**

The delta resolves the routed erratum — the premise is true at HEAD (`TSPEC:1724` widens the
invoking-tree domain by three non-mutating reads, and `read-index` is observed on AT-Q7c's own
`promoted` Given via §7.1's corpus enumeration), the fix states the bound as a shape rather than a
literal, and it does so without editing the frozen §6.5. It breaks nothing I approved in v14: AT-Q7
is correctly out of scope because it references the set rather than inlining it, no intra-document
locator drifted (the FSPEC has exactly two self-locators and both were repaired), and the two Low
locator findings of my v14 review are closed against HEAD. My v14 approval stands, extended to
v11.5.

## Verdict

VERDICT: Approved

APPROVAL-HASH: sha256:18df4716504e48c1c3cf1124471b4ca7eb8b2e3e1847a35a1b445549e390dd13
REVIEWED-COMMIT: 2f18dbd7349fba72f0c0e61b52fc061491d5dfb8
