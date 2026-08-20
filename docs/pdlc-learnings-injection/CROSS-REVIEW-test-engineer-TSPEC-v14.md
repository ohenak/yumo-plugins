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

**`sections[]`'s new definition is bound-dependent, and T-O-6's second conjunct was not carried
along.** §D.3 now defines membership as "at least one byte of its normalised text survives in
`material`", so at a bound that cuts mid-way through the third section, `sections` is the first
three. T-O-6 (§ *Named obligations carried forward*) still states its corpus conjunct without a
bound qualifier:

> A second, corpus-driven conjunct covers §D.3's matcher: for a real corpus document, `sections`
> equals the intersection of `BR6_SECTION_NAMES` with the level-2 headings it carries, ordinals
> and an optional trailing gloss ignored.

T-O-6's own domain, stated two sentences earlier, is "**any** document text and **any** non-negative
`maxBytes`", and it deliberately keeps `0` in that domain. Written literally over that domain the
corpus conjunct is false for every bound that cuts — including `0`, where the same paragraph
already carves out `sections: []`. This is the exact failure mode T-O-6's first half exists to
prevent ("A generated-bound property written from the cut-and-flag rule alone with `0` in its
domain reds against a conforming implementation"), reintroduced one conjunct later by the
redefinition this round made. The fix is one clause: state the corpus conjunct at a bound large
enough that no cut occurs (or `maxBytes = Infinity`), where "surviving in `material`" and "matched
in the document" coincide. F-01 below, Medium — the property is not yet written, and PROPERTIES'
own `PROP-BOUND-05` is already scoped to "an unbounded document"
(`PROPERTIES-pdlc-learnings-injection.md:245`), so the mis-scoped obligation is recoverable rather
than shipped.

**The `+2 bytes per join` term does not yet exist downstream.** PROPERTIES `PROP-BOUND-07` requires
`bytesInjected` to "equal the **hand-computed literal** byte count of that document's declared
sections in the fixture" and `totalBytesInjected` to be "the hand-computed sum of those literals"
(`PROPERTIES-pdlc-learnings-injection.md:257-260`) — a sum over section lengths with no join term.
Under §D.3 step 2 that under-counts by `2 × (n − 1)` for an `n`-section document. This is a
downstream propagation, not a defect of the TSPEC (the TSPEC is the authority for assembly and the
PROPERTIES text was written before the rule existed), so I record it rather than route it: it will
surface at PROPERTIES review, and it is worth naming here because `PROP-BOUND-07`'s whole point is
that the literal must not be derived from the implementation — an author who cannot reproduce the
integer by hand is the author who reaches for `Buffer.byteLength(material)`. Deferred below.

**`\r\n` handling is stated and bounded, and the boundary is enforced by a fixture obligation.**
§D.3 preserves `\r` as an interior byte and strips it only where the whole line is whitespace, then
constrains the exposure: "No fixture may introduce `\r\n` without stating what it expects here."
That is the right way to write a tolerance whose input space is empty at HEAD — the rule is total,
the corpus claim is measured (I re-ran the `git grep` and it matches nothing), and the fixture
obligation stops the rule from silently becoming load-bearing later.

**Everything else in the data model is unchanged this round** — `LEARNINGS_NOTICES`, BR-8's row key
set, `RSN-*`'s catalogue, `parseHarvestDate`'s `null` fallback and `parseLearningsConfig`'s return
shape are all outside the diff, and I did not re-review them.

## Test Strategy

**AT-11's oracle table is the strongest thing this delta adds, and it satisfies all three bars this
round tests against.**

| Bar | How §T.5's table meets it |
|---|---|
| No implementation echoes | Every expected value is a literal from the spec or the fixture: `BR6_SECTION_NAMES` as an ordered list transcribed from BR-6, a fixture-authored Approval-Record marker string, and each section's own body marker. Nothing is read back from `extractInjectableMaterial`. `sections[]` is explicitly demoted "per DC-14" so the producer's report cannot become the expected value |
| No absence-only oracles | The Approval-Record absence conjunct is paired on the same instrument with the five-texts-present conjunct, and §T.5 says why in the document ("so an all-empty block cannot pass the absence half"). The pairing is a stated requirement of the oracle, not a reviewer's inference |
| Set equality over the full enumeration | The first conjunct is equality against the whole of `BR6_SECTION_NAMES`, **ordered** — "since 'in priority order' is part of the claim". A deleted case reds; a reordered one reds too, which containment would not catch |

The three named mutations are the right three, and I checked each is actually falsifying under the
document's own rules: a renderer emitting a heading without its body reds the texts-present
conjunct (and *only* that conjunct — which is why the conjunct earns its place); a matcher widened
to substring admits an `Approval Record`-adjacent heading and reds the absence conjunct; a renderer
emitting whole documents reds the absence conjunct as well. §T.5 states the last point explicitly —
the absence conjunct "cannot be dropped as redundant with §D.3's allow-list argument. That argument
is a design reason no exclusion branch is needed; it is not a test." That sentence is the exact
distinction I have been trying to get into this document since v11, and it is now in the document
rather than in my review.

**The assembly rule closes the literal-oracle hole without weakening any oracle.** AT-12's ASCII
cut fixture was already insensitive to the join rule; AT-11's non-cut expected count was not, and
now is computable. Neither AT's assertion was relaxed to achieve it — the fix went into the
specification of the value, not into the tolerance of the assertion, which is the correct direction.

**§D.3's fixture obligations remain, and one was added.** The pre-existing obligation (at least one
fixture carries a non-canonical-but-matching form, so rules 1 and 3 are pinned by a test rather
than by the builder's habitual `## N. Title` shape) is untouched, and the delta adds the `\r\n`
obligation. Both are stated as constraints on fixture authorship rather than as prose hopes.

**Residual coverage question, recorded not gating.** No test named in §T.5 pins the **assembly**
rule itself as distinct from the counts it produces — i.e. nothing asserts that two sections
non-adjacent in the document are joined by exactly one blank line, or that a section's trailing
blank lines are dropped. AT-11's literal byte count is sensitive to both, so a violation reds
*something*; but it reds as an off-by-N integer mismatch whose diagnosis is a hand recount, rather
than as a named failure. A one-line addition to AT-11's table — assert the block contains the two
adjacent sections' junction as `"{last body line}\n\n## "` — would make the join rule falsifiable
directly. Deferred; the freeze bars me from asking for it as a finding, and the coverage is
adequate without it.

**Routing branches and coverage-mode gates:** unchanged this round. The enabled/disabled, malformed,
three-threshold and `RSN-*` branches all keep their L3 workflow-level owners, and the delta added
no branch. D-12's branch (`FSPEC §Decision points, named`, D-12) remains owned by AT-28 and AT-30's
third case.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | T-O-6's corpus conjunct: is the intended bound "large enough that no cut occurs", or should the conjunct be restated over the document's matched headings (a matcher property) rather than over `sections[]` (now an assembly property)? Either is fine; the second is closer to what the conjunct is trying to prove about §D.3's matcher. |
| Q-02 | Does the `+2 bytes per join` term need to reach PROPERTIES `PROP-BOUND-07` before implementation, or is the TSPEC's §D.5 formula the single source a fixture author will actually consult? |
| Q-03 | For AT-11's block scan, is the third fixture's corpus single-document by construction? If a later fixture change adds a second selected document, the unscoped scan reds without the implementation changing. |

*(All three are recorded for the author's convenience; none is a blocking question under the freeze.)*

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §D.3 redefines `sections[]` as bound-dependent ("at least one byte of its normalised text survives in `material`"), but T-O-6's corpus-driven conjunct still states `sections` equals the intersection of `BR6_SECTION_NAMES` with the document's level-2 headings, over a domain explicitly declared as "any non-negative `maxBytes`" including `0`. Written literally the conjunct reds against a conforming implementation at every cutting bound — the failure mode T-O-6's own first half exists to prevent. Add the no-cut qualifier | §T.6 *Named obligations carried forward*, T-O-6; §D.3 "`sections[]` is defined over the assembled result" |
| F-02 | Low | Local | §I.3's JSDoc states "`bytes` is the sum of the normalised section lengths plus 2 per join" unconditionally; the identity holds only on the uncut path. §D.5's restatement is correctly scoped to AT-11/AT-12's hand-computable counts | §I.3 `extractInjectableMaterial` JSDoc |
| F-03 | Low | Local | §T.5's AT-11 oracle scans the **whole** rendered block for `SECTION_HEADING_RE` and asserts equality with `BR6_SECTION_NAMES`, where FSPEC AT-11 asserts over "the set of section names appearing in **its** block material". The two coincide only while that fixture selects exactly one document; scope the scan to the document's `<<< {path} … >>>` / `<<< end {path} >>>` extent (§OQ.1) | §T.5 "AT-11's oracle reads the rendered block", first table row |
| F-04 | Low | Local | §D.5 retains "sum the section headings and bodies BR-6 selects, **ignore every delimiter**" immediately before the sentence that adds "**2 bytes per join**". The join separator is a delimiter, so the two clauses read as contradicting each other until the reader reaches the parenthetical. Rewrite the older clause rather than qualifying it | §D.5 "AT-11's and AT-12's expected counts are therefore hand-computable" |

## Deferred

Observations that would be improvements rather than defects, recorded and not raised as findings
under the freeze:

DEFERRED: PROPERTIES `PROP-BOUND-07`'s hand-computed literal rule sums declared section lengths with no join term, and under §D.3 step 2 under-counts by `2 × (n − 1)` per document — propagate the join term at PROPERTIES review.
DEFERRED: No test named in §T.5 pins §D.3's join rule directly; a junction assertion (`"{last body line}\n\n## "`) would turn an off-by-N count mismatch into a named failure.
DEFERRED: §D.3's `\r\n` clause is a total rule over an input space that is empty at HEAD; if a fixture ever introduces `\r\n`, the stated obligation should become an actual fixture rather than a prohibition.
DEFERRED: §D.5's paragraph now carries one unwrapped ~200-character line ("bytes per section and a conforming implementation reds a literal fixture. A fixture that wants to pin framing cost asserts on"), inconsistent with the file's ~100-column wrapping.
DEFERRED: ERR-8 stands open against FSPEC Step 5 items 15/16; it is recorded with a suggested fix in this TSPEC and needs no re-routing from this review.

## Positive Observations

- The `sections[]` redefinition is a better answer than the one my v13 finding asked for. I asked
  for the oracle to move off `sections[]`; the delta moved the oracle **and** redefined the field so
  the two can no longer disagree. A supporting assertion that is derivable from the primary one is
  worth writing; an independent report of intent is not.
- §T.5's sentence "That argument is a design reason no exclusion branch is needed; it is not a
  test" is the clearest statement of the design-argument/oracle distinction anywhere in this
  document set. It is the reason the Approval-Record absence conjunct survives as a test instead of
  being optimised away as redundant with §D.3's allow-list.
- The assembly rule is written as a *procedure a fixture author executes*, in three numbered steps
  with the arithmetic consequence spelled out ("`n` sections ⇒ `n − 1` joins"). Specifications that
  fix a literal oracle usually stop at the property; this one goes to the arithmetic, which is what
  a hand-recomputed integer actually needs.
- The `\r\n` clause measures its own exposure with the command that proves it, and then constrains
  future fixtures rather than leaving the tolerance to rot. I re-ran the `git grep` — no match — and
  cross-checked the fixture builder's `lines.join("\n")`; both halves of the claim hold.
- F-02's correction is handled honestly: rather than deleting the overreaching argument, §D.3 keeps
  the E-33 argument where it holds (substring/token-overlap/fuzzy), states plainly that it "does not
  reach" the prefix candidate, and rejects prefix on a separate, weaker, *stated* ground. That is
  how a wrong argument for a right decision should be repaired.
- ERR-8's write-up names the consequence for the reader who matters ("a PLAN author reading the
  procedure sequentially") and supplies the fix, instead of only recording the discrepancy.

## Recommendation

**Approved with minor changes** — no High findings; one Medium and three Low, none gating.

All four v13 findings are closed, and closed with the measurement behind them: AT-11's three FSPEC
conjuncts now have oracles, an owner and named mutations in `learningsBlock.test.js`; `sections[]`
is both demoted to a supporting assertion and redefined so it cannot disagree with `material`; the
assembly rule makes AT-11/AT-12's literal counts a mechanical sum; the prefix argument is repaired
on its own ground; and the upstream sequencing gap is recorded as ERR-8 with the implementer's rule
stated in §D.5. Every repository and upstream claim the delta adds — `learningsFixtures.js`'s
`lines.join("\n")`, the empty `\r\n` grep over the corpus, `DC-03`/`DC-14`'s texts, FSPEC AT-11's
wording and Step 5's item ordering — holds at HEAD.

Nothing the delta touched broke a section previously approved. The single Medium is the one place
the `sections[]` redefinition did not propagate (T-O-6's corpus conjunct, which now needs a no-cut
qualifier or it reds against a conforming implementation); it is a one-clause fix, the property is
not yet written, and it does not block. The three Lows are an unscoped identity in a JSDoc comment,
an unscoped block scan in one oracle row, and a stale "ignore every delimiter" clause left standing
next to its own correction.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}
