# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.8)
**Upstream measured against:** FSPEC v0.13 (`sha256:ae75fa62…86a1d`), REQ v0.9 (`sha256:ff605dd3…e84dd`) — both verified byte-for-byte at HEAD
**Erratum range:** `d2ab13bb..4e16392d` (9 commits)
**Date:** 2026-08-20
**Iteration:** 13 (delta confirmation)

## Overview

Both routed items landed, and they landed with the measurement behind them rather than a bare
rule. §D.3 is retitled *The two heading-recognition rules (discharges F-O-1, both halves)* and
gains `BR6_SECTION_NAMES`, `SECTION_HEADING_RE`, `GLOSS_RE`, the three matching rules, the section
extent, and the duplicate/absence rule; the §T.6 obligations table restates F-O-1 as **both** rules
and names where each is discharged. The pm-review item ("the recognition rule for BR-6's five
priority headings is unspecified") and the te-author item ("the section matcher is specified
nowhere") are both discharged in the section upstream assigns them to.

I re-measured the erratum's factual claims rather than reading them:

- **Upstream identity.** Both dispatch shas match the files at HEAD exactly. FSPEC's header reads
  v0.13; the TSPEC header's upstream pin now reads v0.13 (v12 F-09 closed), and the five passages
  that pinned "FSPEC v0.9" now cite BR-9/BR-10/E-21…E-34 with a verbatim-unchanged note.
- **F-O-1's widening.** FSPEC:1009 assigns TSPEC "two heading-recognition rules … the predicate for
  'presents as a LEARNINGS document' (BR-3), **and** the rule by which a heading counts as one of
  BR-6's named sections", and BR-6 defers "which heading forms count as which section is F-O-1's,
  not text to be matched literally from here". §D.3 now answers exactly that, and answers it in
  full — the ordinal, the gloss, the case rule, the extent, duplicates, absences.
- **§D.3's corpus measurement.** I re-ran §I.1's own glob and counted the level-2 headings across
  all 9 documents. The claim is exact: 9 of 9 write `## 1. Non-Convergences`,
  `## 2. Cross-Feature Patterns`, `## 3. Rejected Proposals (with rationale)`,
  `## 4. Process Learnings`, `## 5. Open Items for Consolidation`; 7 add `## 6. Approval Record`;
  `docs/orchestrate-dev-workflow/LEARNINGS-orchestrate-dev-workflow.md` carries the one deviation,
  `## 6. Phase PUB Retroactive Cross-Review (2026-06-24)`, exactly as §D.3 says. The load-bearing
  observation — that the documents' own ordinals put Cross-Feature Patterns **second** while BR-6
  ranks it **first**, so priority may never be read off the heading — is true of all 9 and is the
  single most valuable thing this delta adds: it names a real inversion bug before anyone writes
  the matcher.
- **The zero-bound absorption.** FSPEC:497 ("Where the bound is **zero**, no material is
  admissible … dropped before the total bound with `RSN-NO-MATERIAL` (BR-9) and consumes no slot"),
  E-36 and AT-30's third clause are all present upstream and are compressed faithfully into §I.2,
  §I.3, §D.5, §T.6 and T-O-6.
- **AT-02's fourth shape.** FSPEC:812 enumerates four fixtures, the fourth being "a run containing
  an authoring-classified dispatch whose target is none of the six C-1 document types — so
  reverting BR-1's second conjunct reds this test". §T.6 now carries it, names
  `learningsDispatchSet.test.js` as sole owner, and states the mutation oracle. v12 F-05 closed.

Every one of my v12 findings is discharged: F-01 (§T.6's `RSN-NO-MATERIAL` arm restated over
*yields no material*), F-02 (§D.3's second rule), F-03 (AT-30 is three zeros, with E-36's per-row
oracle), F-04 (`bounded` at a zero bound decided `false`), F-05 (AT-02's fourth fixture and owner),
F-06 (`present` removed), F-07/F-08 (the stale `converge()` and seam line anchors replaced by
symbol citations — I re-checked the anchors that remain, and `parseAdvisoryConfig:1980-1983`,
`dispatchAndVerify:8862`, the PLAN-lint clause at `:8972-8978`, `rtCachePut:459-465`,
`rtReadFile:494` and `LS_FILES_ARGV:1338-1346` all land on the cited code at HEAD), F-09 (header
pin).

One divergence from upstream survives the round and is sharpened by it rather than caused by it:
§I.3 points **AT-11's** section-set equality at the `sections[]` return field, where FSPEC states
that equality over "the set of section names appearing **in its block material**", with an
Approval-Record-absence conjunct the TSPEC carries nowhere. That is F-01 below, tagged
`inherited` — it was in the pre-round bytes and does not ask FSPEC to move.

## Architecture

**What the delta moved, structurally.** The erratum did one thing of architectural consequence
beyond the two routed items: it moved the `RSN-NO-MATERIAL` drop from a *structural* test (the
document carries none of `BR6_SECTION_NAMES`) to an *outcome* test (extraction returns
`sections: []`), and put that drop **before** the count and total bounds. §D.5 states this
explicitly — "one branch covering both of BR-9's disjuncts, the structural one (E-33) and the zero
per-document bound (E-36) … there is no second branch and no zero-bound special case in the
selector."

I read that as the right compression, and it is what BR-9's catalogue entry at FSPEC:560 now says
("Eligible, but yields no material — it carries none of BR-6's priority sections, **or** the
per-document bound is zero and admits none") and what D-12 asks ("Does the document yield any
material?"). It also collapses what would otherwise be two branches whose difference no fixture can
observe. Worth recording for the implementer, since the two documents now sequence the work
differently: FSPEC's **Step 5** procedure still drops on the structural condition at item 15 and
performs extraction at item 16, *after* the count bound has been applied, so a reader implementing
Step 5 literally would extract only the `maxDocuments` documents that survived the count cut and
would never observe the zero-bound drop for the rest. TSPEC's rule requires extraction for every
eligible document before the count bound binds. **The observable outcomes are identical** — at any
non-zero bound "yields no material" and "carries no BR-6 heading" are the same predicate, and at a
zero bound BR-6/E-36 explicitly demand the no-slot behaviour Step 5's ordering could not produce —
so this is not a behavioural divergence and I am not gating on it. It is a sequencing gap in
upstream's procedural prose that the PLAN author will trip over; F-03 records it at Low.

**The obligation ledger is now self-consistent.** The §T.6 obligations table's F-O-1 row names both
rules and both discharge sites (`LEARNINGS_HEADING_RE`; `BR6_SECTION_NAMES` + ordinal + gloss +
exact), and §D.3's heading advertises "both halves". The failure mode v12 F-02 named — an
obligation recorded as discharged by a section that discharges half of it — is closed on both
sides, so a downstream reader auditing the table against the section cannot be misled.

**Nothing previously approved is broken by the delta.** I re-read the sections the erratum touched
against their pre-round bytes: §I.2's `parseLearningsConfig` divergence table (the `present` column
collapses to "identical", and `sectionMalformed`'s "true only when the section **is** present"
sentence preserves the AC-5.1a distinction the field was carrying), §D.5's byte-accounting pools
(unchanged — the erratum only re-grounds them on BR-6's now-explicit basis), §T.5's suite/AT
inventory (still 2+9+3+3+6+12 = 35, and I recounted it), and ERR-4/ERR-6's closure prose. No
oracle that was falsifiable before this round is weaker after it.

## Interfaces

**`extractInjectableMaterial(text, maxBytes)` is now writable from the document alone.** Before this
round I could not have written the matcher; now I can, and I checked the specified regexes against
the corpus rather than reading them:

- `SECTION_HEADING_RE = /^##[ \t]+(?:\d+\.[ \t]*)?(.*?)[ \t]*$/` requires whitespace after the
  two `#`, so `### Sub-heading` neither matches nor terminates a section — which is what §D.3's
  "exactly two `#`" sentence claims, and it is consistent with the extent rule's `/^##[ \t]/`
  boundary test. The two regexes agree on what a boundary is; a mismatch there would have been a
  silent extent bug.
- The optional `(?:\d+\.[ \t]*)?` group strips `1.` … `6.` from all 9 corpus documents' headings.
- `GLOSS_RE = /[ \t]*\([^()]*\)$/` applied to both sides makes `## 3. Rejected Proposals` and
  `## 3. Rejected Proposals (with rationale)` the same section, and leaves
  `## 6. Phase PUB Retroactive Cross-Review (2026-06-24)` outside the five (it strips to a
  non-member). I confirmed both against the real strings.
- Rule 2's exactness is justified by E-33's real document rather than by taste, and the
  justification is the right shape: a matcher loose enough to admit `Cross-Feature Findings` makes
  FSPEC's one measured `RSN-NO-MATERIAL` document a contributing one and renders E-33 and AT-28
  unreachable by construction. The specific claim that a **prefix** rule would do that is not true
  as stated (neither `Cross-Feature Findings` nor `Cross-Feature Patterns` is a prefix of the
  other, and F-O-1's own wording offers "a prefix of it" as one candidate rule) — F-02 below, Low,
  because the decision is right and only the argument for it overreaches.
- The zero-bound branch is stated on the interface itself: `maxBytes <= 0` returns
  `{material: "", bounded: false, bytes: 0, sections: []}` for every text, short-circuiting before
  the cut. That is a *unit-level* oracle for E-36, which previously existed only as an L3 run
  assertion — a real testability gain, and T-O-6 now carries the matching property carve-out.

**One interface question the delta sharpened without closing: how the taken sections are
assembled.** §D.3 defines each section's **extent** (heading line through the line before the next
`/^##[ \t]/` line, or EOF) and says the heading line is part of the material in the document's own
literal form. It does not say how the taken extents are concatenated into `material`: whether each
extent retains the trailing newline of its last line, whether trailing blank lines before the next
heading are inside the extent, and whether any separator is inserted between two sections that are
non-adjacent in the document (they must be, since sections are taken in **priority** order, which
§D.3 itself proves is not document order for any corpus document). §D.5 asserts AT-11's and AT-12's
expected counts are "hand-computable from the fixture alone: sum the section headings and bodies
BR-6 selects, ignore every delimiter" — but two conforming implementations can differ here by one
to several bytes per section, and AT-11/AT-12 commit their expected counts as **literal integers**
recomputed by hand (FSPEC:AT-11, AT-12). A byte-exact literal oracle over an assembly rule that is
not byte-exact is a fixture that reds for a conforming implementation. F-04 below, Medium.

## Data Model

**`sections[]` now has a stated content rule, and it is the right one — but it is pointed at the
wrong oracle.** §I.3 now says `sections` carries the **canonical** `BR6_SECTION_NAMES` taken, "not
the document's literal heading text", while §D.3 says the material carries the heading "in the
document's own literal form, ordinal included". Making that split explicit is a genuine improvement:
it stops a fixture builder and a matcher from drifting into a shared wrong spelling, and it gives
PROPERTIES a clean corpus-driven conjunct (`sections` equals the intersection of
`BR6_SECTION_NAMES` with the document's level-2 headings, ordinals and gloss ignored), which T-O-6
now states.

The cost of making the split explicit is that it exposes an operand substitution that was invisible
while the two were conflated. FSPEC's AT-11 asserts:

> the set of section names appearing **in its block material** equals BR-6's five injected names in
> priority order, and the Approval Record's distinctive fixture text is absent **while** all five
> injected sections' texts are present

§I.3 says `sections` "are AT-11's section-set-equality operand", and §T.5 restates AT-11 as
"section-set equality over what BR-6 selected". Those are different assertions now that canonical
names and literal block text are formally different things:

1. `sections[]` is the extractor's own report of what it believes it took. Asserting over it cannot
   falsify a renderer that takes a section and then drops it from the emitted block — the exact
   "produced artifact contains X, proved against the builder rather than the artifact" shape
   DC-07 exists to prevent. AT-11 is placed in `learningsBlock.test.js` precisely because it is a
   claim about the **block**; its oracle should read the block.
2. The Approval-Record conjunct has no home anywhere in the TSPEC. §D.3 explains why no exclusion
   branch is needed (`Approval Record` is simply not in `BR6_SECTION_NAMES`), which is a good design
   argument and not a test — an implementation that matched on a substring, or that emitted whole
   documents, would satisfy every `sections[]` equality the TSPEC names and still leak the Approval
   Record into an authoring prompt, which is the leak BR-11 and NG-5 care about.
3. The "all five injected sections' **texts** are present" conjunct is likewise unowned. Set
   equality over canonical names holds even if a section's body is dropped and only its heading
   taken.

This is F-01 below, High and `inherited`: the pre-round bytes already said `sections` is AT-11's
operand and already carried neither the Approval-Record nor the section-text conjunct, and FSPEC's
AT-11 wording has not moved since the v1 review (I checked with `git log -S`). It does not ask FSPEC
to move — it asks §I.3/§T.5 to restate AT-11's oracle over the rendered block, with `sections[]` as
a supporting assertion rather than the operand.

**Elsewhere the data model is unchanged and still checks out.** `parseLearningsConfig`'s return
shrinks to `{config, sectionMalformed, invalidKeys}` and both distinctions the dropped field carried
are re-homed with a stated mechanism (`config.enabled` for AC-5.1a's report-key distinction,
`sectionMalformed`-implies-present for the malformed case). `LEARNINGS_NOTICES`'s two-member frozen
literal, BR-8's row key set and AT-17's closure are untouched by this round.

## Test Strategy

**AT-30's third case is now a falsifiable oracle, not an emptiness check.** §I.2 requires the
zero-bound fixture's oracle to be a set equality over the reject rows — every enumerated non-self
path present with `RSN-NO-MATERIAL`, none `bounded` — and explicitly rejects the weaker "`selected`
is empty" reading, because an implementation that selected the documents with `bytes: 0` would pass
the weaker one and violate E-36's no-slot clause. It then names the mutation: reverting §D.5's
`maxBytes <= 0` short-circuit to the cut-and-flag path reds the fixture. That is exactly the
positive-conjunct structure the absence-oracle bar asks for (exact status + named reason + the
retention/row assertion), and it is stated by the document rather than left to the implementer.

**AT-02's fourth shape carries its mutation obligation and a sole owner.** §T.6 assigns it to
`learningsDispatchSet.test.js` and states why sole ownership matters ("no other file may claim it,
or the mutation check exists twice and is maintained in neither"), and its oracle is the existing
set equality rather than a new bespoke assertion — with BR-1's second conjunct reverted, the
code-review optimizer dispatch joins the block-carrying set and the hand-transcribed expected set
stops matching. I verified the fixture is real: FSPEC:812 enumerates the four shapes and states the
mutation obligation in the same sentence.

**T-O-6 now states its own carve-out instead of leaving PROPERTIES to discover it.** The paragraph
is unusually good: it names both failure modes of the naive property (with `0` in the domain and the
cut-and-flag rule, the property reds against a conforming implementation; with `0` excluded, the
edge falls to AT-30's L3 case with no unit oracle) and resolves them — keep `0` in the domain, state
the zero conjunct. The added corpus-driven conjunct for §D.3's matcher is the property this feature
most needs, since it is the one assertion that runs the matcher against text nobody wrote as a
fixture. v12 F-04's undecided `bounded` value is closed.

**§D.3's fixture obligation is the right shape.** "At least one fixture must carry a
non-canonical-but-matching form (bare title, or the un-glossed `Rejected Proposals`) so rules 1 and
3 are pinned by a test rather than assumed from the fixture builder's `## N. Title` shape" — this is
the finding I would otherwise have filed. A fixture builder that only ever emits the numbered,
glossed form leaves the ordinal-strip and gloss-strip branches unexercised while looking green.

**What the strategy still does not cover.** Two gaps, both recorded below:

- AT-11's oracle reads the extractor's report rather than the block (F-01). The suite placement is
  right; the operand is not.
- No test in §T.5 pins the material **assembly** rule, and none can while §D.3 stops at per-section
  extent (F-04). AT-12's ASCII cut fixture pins the bound-equals-count case, which happens to be
  insensitive to the join rule; AT-11's non-cut expected count is not.

Neither is a coverage-mode gate or routing-branch gap: the routing branches this feature introduces
(enabled/disabled, malformed, three zero thresholds, `RSN-*` catalogue) all have L3 workflow-level
owners in §T.5, and I re-checked that the 35-AT inventory is disjoint and complete after this round.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | For AT-11, is the intended operand the rendered block's material text (FSPEC's wording) with `sections[]` as a supporting assertion, or is the TSPEC deliberately narrowing AT-11 to the extractor return? If the latter, which test owns "the Approval Record's distinctive fixture text is absent while all five injected sections' texts are present"? |
| Q-02 | Does a section's extent retain the trailing newline of its last line, and are the blank lines before the next `##` heading inside it? Is any separator inserted between two taken extents that are non-adjacent in the document? |
| Q-03 | `GLOSS_RE` is stripped from **both** sides of the comparison, so `## Process Learnings (draft)` matches priority 4. Is that intended tolerance, or should the strip apply only where the canonical name itself carries a gloss (i.e. priority 3 alone)? Either answer is fine and deterministic; the fixture obligation differs. |
| Q-04 | Should FSPEC Step 5's items 15/16 be reconciled with §D.5's "drop before the count and total bounds"? The outcomes agree, but the PLAN author reading Step 5 literally will extract after the count cut. |

## Positive Observations

- §D.3's ordinal rule is the strongest paragraph the erratum adds. Measuring all 9 corpus documents
  and observing that their own numbering ranks Cross-Feature Patterns **second** while BR-6 ranks it
  **first** turns a plausible implementation shortcut ("the number is the priority") into a named,
  provably wrong one that "would invert the first two sections of every document in the corpus".
  That is a bug caught at spec time.
- Rule 2's justification is grounded in E-33's real document rather than in a preference for
  strictness: a looser matcher makes FSPEC's one measured `RSN-NO-MATERIAL` document contributing
  and makes E-33 and AT-28 unreachable by construction. Tying a matcher's strictness to the
  reachability of a specific AT is the argument I want to see.
- §D.3's honesty about which tolerances are measured and which are defensive — the gloss rule is
  explicitly "not measured (9 of 9 corpus documents write the glossed form) … stated as a defensive
  tolerance in the sense of §D.4's date-cell tolerance" — keeps a reader from mistaking a hedge for
  an observation.
- The duplicate rule ("first occurrence in document order wins, later ones ignored — a total rule,
  so no document text can make extraction non-deterministic") pre-empts a property-test failure that
  would otherwise surface only under a generator.
- §I.2's insistence that AT-30's third case assert reject **rows** rather than an empty `selected`,
  with the mutation that reds it named in the same breath, is the difference between a case that
  documents E-36 and one that enforces it.
- Dropping `present` on the stated ground that "a field whose removal reds nothing is not part of
  the contract", while explicitly re-homing both distinctions it carried, is the right way to close
  a dead-field finding — it does not merely delete, it shows what still owns the behaviour.

## Recommendation

## Delta-Confirmation Findings

## Verdict
