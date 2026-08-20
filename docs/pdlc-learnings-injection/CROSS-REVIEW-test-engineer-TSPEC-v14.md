# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.9)
**Reviewed range:** `4e16392d..HEAD` (5 commits, +138 −11)
**Date:** 2026-08-20
**Iteration:** 14 (delta re-review, DECISION FREEZE in force)

## Overview

The four items I raised in v13 are all landed, and each landed with the measurement behind it
rather than a bare assertion. I re-derived every factual claim the delta adds rather than reading
it.

- **F-01 (High, inherited) — closed.** §I.3's `extractInjectableMaterial` JSDoc now says
  `sections` is "a SUPPORTING assertion, NOT AT-11's operand", and §T.5 gains a three-row oracle
  table that states AT-11's three FSPEC conjuncts over the **rendered block**, names the mutation
  that reds each, and keeps `sections[]` as an additional equality. I checked the conjuncts against
  FSPEC's AT-11 (`FSPEC §Acceptance Tests`, AT-11's third sentence): "the set of section names
  appearing in its block material **equals** BR-6's five injected names in priority order, and the
  Approval Record's distinctive fixture text is absent **while** all five injected sections' texts
  are present". All three are now owned, in one test, in `learningsBlock.test.js`. The absence
  conjunct is explicitly paired with the positive on the same instrument ("so an all-empty block
  cannot pass the absence half") — the DC-03 pairing bar, satisfied by construction rather than by
  reminder.
- **F-04 (Medium) — closed.** §D.3 gains *How the taken extents are assembled into `material`*: a
  three-step rule (normalise each extent by dropping trailing blank/whitespace-only lines and the
  trailing newline; join in priority order with `"\n\n"`; cut once over the assembled string), plus
  the arithmetic consequence — `bytes` = sum of normalised section lengths + 2 per join. §D.5
  restates the same formula where the hand-computed literals live. A fixture author now has a
  procedure, not a judgement.
- **F-02 (Low) — closed.** Rule 2's E-33 argument is narrowed to substring/token-overlap/fuzzy
  matching (where it holds), and the prefix candidate is rejected separately on its own ground
  (it admits `## Process`, `## Open Items`, `## Cross-Feature` as full sections and needs a
  same-priority tiebreak nobody wants to own). Correct on both halves now.
- **F-03 (Low) — closed as ERR-8.** The upstream sequencing gap is recorded against FSPEC with a
  suggested fix, and §D.5 states the rule the implementer follows. I re-verified it at HEAD:
  FSPEC Step 5 item 15 drops on the *structural* condition and applies the count bound, item 16
  extracts "for each taken document" — so the zero-bound drop is unobservable for count-cut
  documents if the procedure is read literally. ERR-8's description is exact.

**Repository claims in the delta, re-measured.** Every one holds:

- `pdlc/workflows/__tests__/helpers/learningsFixtures.js` exists; `buildLearningsDocument`
  (`:92`) ends `return lines.join("\n")` (`:112`), so §D.3's claim that fixture text is
  `\n`-joined is true of the real helper, not just of intent.
- The `\r\n` claim: `git grep -Il $'\r' -- ':(glob)docs/*/LEARNINGS-*.md'
  ':(glob)docs/completed/*/LEARNINGS-*.md'` exits 1 with no match at HEAD — no corpus document
  carries `\r\n`, exactly as §D.3 states, and the command it cites is the command that proves it.
- The Approval-Record marker conjunct is constructible with the real helper: `renderSection`'s
  `section.body` is documented as "literal body text" (`learningsFixtures.js:60`) and
  `spec.extraLines` appends "raw text ... verbatim after the last section" (`:88-89`), so the
  distinctive marker §T.5 asks for needs no new fixture affordance.
- `DC-14` is real and says what the delta quotes: *"An oracle never sources its expected value from
  the code under test"* (`docs/_constraints/DOMAIN-CONSTRAINTS.md:379`); `DC-03` is *"Every
  load-bearing assertion is falsified before it is trusted"* (`:79`).
- Upstream is unchanged this round, as the changelog claims: no commit touches
  `FSPEC-pdlc-learnings-injection.md` or `REQ-pdlc-learnings-injection.md` in `4e16392d..HEAD`.

Nothing the delta touched broke a section I had previously approved. What it did do is make
`sections[]` **bound-dependent** — that is the right definition, and it is the one place where a
neighbouring obligation (T-O-6's corpus conjunct) was not carried along with the change. That is
F-01 below, Medium and non-gating.

## Architecture

**The delta's one structural move: `sections[]` becomes derived, not reported.** Before this round
`sections` was "the CANONICAL BR-6 priority names actually taken" — a report of the matcher's
intent. §D.3 now defines it over the *assembled and cut* result: "A canonical name is in
`sections[]` iff at least one byte of its normalised text survives in `material`". That is the
change F-01 asked for and it is better than what I asked for: it removes the possibility that
`sections` and `material` disagree, it makes the zero-bound `sections: []` fall out of the general
rule instead of needing its own clause, and it turns the `sections[]` assertion from an independent
claim into a redundancy check over `material` — which is exactly what a *supporting* assertion
should be.

The cost is that `sections[]` is now a function of `maxBytes`, and one downstream obligation still
reads it as a function of the document alone (§T.6's T-O-6 corpus conjunct, F-01 below). That is
the only place the redefinition did not propagate; I checked the other three consumers and all
three survive it:

- §D.3's AT-28 reading — "empty intersection ⇒ empty `sections[]` ⇒ `RSN-NO-MATERIAL`" — is
  unaffected: at an empty intersection nothing is taken at any bound.
- §I.3's zero-bound short-circuit return `{material: "", bounded: false, bytes: 0, sections: []}`
  is now *implied* by the derivability rule rather than asserted alongside it, which is the
  consistency the round was after.
- §D.5's `RSN-NO-MATERIAL` single branch ("one branch covering both of BR-9's disjuncts") is
  strengthened by it: *yields no material* and *`sections` is empty* are now the same predicate by
  definition, not by coincidence of two rules agreeing.

**The assembly rule is the right shape for a test document to fix.** It is stated as a procedure a
fixture author executes (split, drop trailing blank lines, rejoin, join with `"\n\n"`, cut once),
not as a property an implementation should satisfy — so two people hand-computing AT-11's literal
get the same integer. The interior-blank-line carve-out ("only the trailing run is dropped, so the
count does not depend on how many blank lines the author left before the next heading") is the
clause that actually removes the ambiguity, since that is the one thing a fixture author varies
without thinking. Cutting **once over the assembled string** rather than per extent is also what
keeps E-16 ("first section alone exceeds the bound") a consequence rather than a special case;
FSPEC E-16 (`FSPEC §Edge cases`, E-16) and AT-12 both read cleanly under it.

**Nothing in the delta widened the L1/L3 split or the AT inventory.** §T.5's suite table still
reads `learningsBlock.test.js | AT-05, AT-11, AT-12 | 3 | L1`, and the new oracle table adds
assertions to an existing test rather than a test to the inventory — so the 35-AT count I recounted
in v13 is unchanged and no suite acquired an unowned claim. The three mutations §T.5 names for
AT-11 (heading-without-body renderer; substring-widened matcher; whole-document renderer) all land
inside `learningsBlock.test.js`'s own subject, so none of them needs a second file to observe.

## Interfaces

**`extractInjectableMaterial(text, maxBytes)` is now byte-exact from the document alone.** With the
assembly rule in §D.3 I can compute the return value of any fixture by hand, which is the property
a literal-integer oracle needs and did not have before this round. I walked the rule against the
real fixture builder rather than reading it:

- `buildLearningsDocument` emits `renderSection(section)` entries into a `lines` array joined with
  `"\n"` (`pdlc/workflows/__tests__/helpers/learningsFixtures.js:92-113`), so a fixture section's
  extent is a `\n`-delimited run and step 1's "split on `\n`" applies to the real text with no
  encoding caveat.
- Step 1's trailing-run rule interacts correctly with that builder: `renderSection` output is
  pushed as one array element and elements are `\n`-joined, so blank separation between sections
  varies with the section body's own trailing content — precisely the variability the normalisation
  removes.
- Step 2's `"\n\n"` join with no leading or trailing separator, plus "the renderer owns every byte
  outside it", is consistent with §OQ.1's rendered form, where each document's material sits
  between `<<< {path} … >>>` and `<<< end {path} >>>` lines that are themselves whole lines. I
  checked §OQ.1 for a framing token that could collide with the material's own `##` headings —
  there is none; the framing is `---`- and `<<<`-delimited only, so §T.5's "scan the rendered block
  for lines matching `SECTION_HEADING_RE`" cannot pick up framing.
- Step 3's "cut once over the assembled string" is the same cut §D.5 already specified as
  character-safe, so `bounded`/`bytes` remain properties of one string and T-O-6's whole-character
  prefix conjunct still means what it meant.

**One imprecision the delta introduced in the interface comment.** §I.3's JSDoc states the
arithmetic unconditionally — "`bytes` is the sum of the normalised section lengths plus 2 per join"
— but that identity holds only on the **uncut** path; where the bound binds, `bytes` is the
character-safe cut length and is ≤ the bound. §D.5's restatement of the same formula is correctly
scoped to AT-11/AT-12's hand-computable counts, so this is the interface comment alone, and it is
Low: an implementer reading `maxBytes <= 0` two lines above will not conclude the sum survives a
cut. F-02 below.

**The AT-11 block-scan oracle is under-scoped by one qualifier.** FSPEC's AT-11 asserts over "the
set of section names appearing in **its** block material" — the third fixture's *own* material.
§T.5's oracle says "Scan the rendered block returned by `renderLearningsBlock` … and assert the
resulting list equals `BR6_SECTION_NAMES`". Those coincide only while that fixture's corpus holds
exactly one selected document; add a second selected document to the fixture and an oracle written
literally reds against a conforming renderer. The fix is one clause — scan between that document's
`<<< {path} … >>>` and `<<< end {path} >>>` delimiters (§OQ.1 gives them, and §T.5 already relies
on the block being renderer output) — and it also makes the oracle prove the *per-document*
placement AT-11 is really about. F-03 below, Low, because AT-11's third clause reads as its own
single-document fixture ("*And given* an unbounded document carrying all six conventional
sections") and the intended reading is recoverable.

**No interface contract regressed.** `parseLearningsConfig`'s `{config, sectionMalformed,
invalidKeys}`, `renderLearningsBlock({selected})`'s `""`-when-empty rule (§A.2 property 3), the
`orderCorpus` comparator and `selectLearnings`'s totality are untouched by this round; I diffed the
file to confirm the delta is confined to the changelog, §I.3's JSDoc, §D.3, §D.5, §T.5 and the
ERR-8 entry.

## Data Model

## Test Strategy

## Open Questions

## Findings

## Deferred

## Positive Observations

## Recommendation

## Verdict
