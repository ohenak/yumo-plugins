# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 14 (delta re-review, DECISION FREEZE in force)
**Baseline reviewed at v13:** `4e16392d`
**Delta under review:** `7d83a393`, `682212e3`, `d52f2eba`, `1dae7981`, `739fea34` (TSPEC v0.8 → v0.9)

## Overview

**Round type.** Ordinary delta re-review under DECISION FREEZE, not a delta confirmation. My v13
round approved with zero findings, so I hold no open items of my own; this round asks only whether
the v0.9 revision broke anything I had approved, or landed a claim the repository contradicts at
HEAD.

**What changed.** `git diff 4e16392d..HEAD` on the TSPEC is +149/−11 lines across five commits, all
of which respond to te-review v13's four findings (my v13 raised none). Four loci moved:

| Locus | Change | Origin |
|---|---|---|
| §T.5 (new subsection) | AT-11's three conjuncts get an oracle each, over the **rendered block**, owned by `learningsBlock.test.js`, with three named killing mutations | TE v13 F-01 (High) |
| §I.3 `extractInjectableMaterial` JSDoc | `sections[]` demoted from "AT-11's section-set-equality operand" to a **supporting** assertion; assembly rule summarised | TE v13 F-01 |
| §D.3 (new subsection) | Three-step material-assembly rule (normalise / join `"\n\n"` in priority order / cut once), `sections[]` redefined over the assembled result | TE v13 F-04 (Medium) |
| §D.3 rule 2, §D.5, §OQ errata | Prefix candidate rejected on its own ground rather than on E-33's; §D.5 byte sum made mechanical; FSPEC Step 5 sequencing recorded as **ERR-8** | TE v13 F-02, F-04, F-03 |

**Verification stance.** I re-checked the four v13 conclusions that the delta could have invalidated
— the `BR6_SECTION_NAMES` transcription, the Approval Record's structural exclusion, F-O-1's two
bounds (bytes only, no model call), and the corpus measurements — and re-grounded every new factual
claim in the delta against the repository rather than against the prose. Nothing I approved at v13
was weakened, narrowed or reinterpreted, and the one product-visible change (which artifact AT-11
asserts over) moves the oracle **closer** to FSPEC's own wording, not away from it.

**Answer.** Approved. No High findings; one Low, recorded and non-gating, plus two deferred items.

## Architecture

**The one product-visible change is a fidelity correction, and it lands in the right direction.**
At v13 §I.3 called `sections[]` "AT-11's section-set-equality operand". FSPEC's AT-11 at HEAD states
its final clause over *"the set of section names appearing in its **block material**"*
(`FSPEC-pdlc-learnings-injection.md`, AT-11, third sentence). Those are different artifacts: one is
the extractor's own report of what it took, the other is what the authoring dispatch actually
receives. The v13 wording let a conforming-looking implementation take a section, report it in
`sections[]`, and drop it from the emitted block, with AT-11 still green — the requirement is about
the block, so the test would have proved the wrong thing. §T.5's new subsection and §I.3's demotion
put the oracle back on the block and keep `sections[]` as a **supporting** equality. That is the
faithful reading of AT-11 restored, and it is the kind of change a freeze is meant to allow: no new
decision, an upstream-mandated correction.

**The correction is argued from a standing constraint, correctly cited.** §I.3's JSDoc grounds the
demotion in DC-14, quoted as *"an oracle never sources its expected value from the code under test"*.
`docs/_constraints/DOMAIN-CONSTRAINTS.md:379` carries `## DC-14: An oracle never sources its expected
value from the code under test` — the citation is verbatim and the constraint is the one that
applies. §T.5's absence conjunct cites DC-03 for the pairing requirement
(`DOMAIN-CONSTRAINTS.md:79`, *"Every load-bearing assertion is falsified before it is trusted"*),
which is the constraint that forbids an absence-only oracle. Both exist; neither is invented.

**No scope moved.** I diffed the delta for behaviour the REQ does not ask for and found none: the
five commits add assembly determinism, an oracle relocation, an argument correction and an erratum.
No new configuration key, no new reason code, no new user-visible surface. BR-6's five priority
sections, the Approval Record's `never`, and the three thresholds are byte-identical to what I
approved at v13.

## Interfaces

**F-O-1's bounds still hold after the rewrite.** FSPEC F-O-1 delegates the two heading-recognition
rules to this TSPEC under two constraints: the rule consults only the document's own bytes, and it
is decidable without a model call. The delta rewrote rule 2's *rationale* and added an assembly
rule; neither introduces a lookup outside the document. §I.3's contract still reads
`extractInjectableMaterial(text, maxBytes)` — text and an integer, nothing else — and
`looksLikeLearningsDocument(text)` still carries *"Bytes only, no model call (F-O-1)"*. The
delegation is discharged on the same terms I confirmed at v13.

**The prefix-rejection correction is right, and it corrects *my* v13 reading too.** At v13 I
credited the prefix rejection as forced by E-33: *"Under prefix rule `Cross-Feature Findings` would
match `Cross-Feature Patterns`"*. That was wrong, and the delta says so plainly — neither string is
a prefix of the other, so a strict prefix rule leaves E-33 reachable. §D.3 now splits the argument:
substring/token-overlap/fuzzy matching is rejected **on E-33** (which does reach them, since the
shared token `Cross-Feature` is what would match), and the prefix candidate is rejected on its own
ground (it admits `## Process`, `## Open Items`, `## Cross-Feature` as full sections and creates a
same-priority collision needing a tiebreak). I verified E-33's document at HEAD:
`docs/completed/…` is not where it lives — it is `regime-ledger`'s corpus, cited from FSPEC, not
this repository, so the claim I can check here is the *shape* of the argument, and the shape is now
sound. **The decision did not change** (exact match, case-sensitive, with rule 3's single gloss
tolerance); only its justification did. Under freeze that is exactly the permitted kind of edit: the
outcome is stable, the reasoning is no longer false.

**§I.3's JSDoc and §D.3 still state the rule once.** The failure mode I checked for at v13 — two
loci each normatively stating the matcher, drifting apart — has not reappeared. §I.3 now carries a
two-line *summary* of §D.3's assembly (normalise, join, cut once) and points at §D.3 for the rule;
§T.5 points at §D.3 for `SECTION_HEADING_RE` rather than restating the regex. One normative
statement, several pointers. The summary is a compression, not a second normative source, and it
agrees with §D.3 on every clause I compared.

**ERR-8 is correctly scoped as upstream, not folded into this document's design.** §D.5 now records
that FSPEC Step 5 drops on the structural condition at item 15 (before the count cut) and extracts
at item 16 (after it), while §D.5 requires extraction first. I read Step 5 at HEAD: item 15 is
*"Drop any eligible document carrying none of BR-6's priority sections … then take the first
`learningsInjection.maxDocuments` of the rest"*; item 16 is *"For each taken document, extract its
injectable material per BR-6"*. The TSPEC's characterisation is accurate to the byte, its
"outcomes agree at every bound" claim holds (at non-zero bounds the structural and material
predicates coincide; at a zero bound BR-6/E-36 demand the no-slot behaviour), and it is filed as an
erratum with a suggested fix rather than silently resolved here. Correct handling.

## Data Model

**Every empirical claim in §D.3's new assembly rule re-measured at HEAD.** The rule leans on three
repository facts. All three hold:

| §D.3's claim | Command I ran | Result |
|---|---|---|
| No corpus document at HEAD carries `\r\n` | `git grep -Il $'\r' -- ':(glob)docs/*/LEARNINGS-*.md' ':(glob)docs/completed/*/LEARNINGS-*.md'` | no match (exit 1) — the command is quoted verbatim in §D.3 and reproduces |
| `buildLearningsCorpus` assembles document text by joining lines with `"\n"` | read `pdlc/workflows/__tests__/helpers/learningsFixtures.js` | `buildLearningsDocument` at `learningsFixtures.js:92`, `return lines.join("\n")` at `:112`; `buildLearningsCorpus` at `:161` forwards `s.doc` to it at `:165` |
| Sections are taken in priority order, which is **not** document order for any corpus document | enumerated `^## ` headings across all 9 corpus paths | every one of the 9 writes `## 1. Non-Convergences` before `## 2. Cross-Feature Patterns`, i.e. BR-6's top two inverted in document order, in all 9 — the "not document order for any corpus document" quantifier is literally true, not a rounding of "most" |

The corpus enumeration itself is unchanged from v13: the `:(glob)` pathspec returns exactly 9 paths
at HEAD, `docs/discarded/` excluded as the document states.

**The Approval-Record marker §T.5 relies on is constructible with the fixture builder that exists.**
§T.5 asserts *"`buildLearningsDocument`'s `sections`/`extraLines` inputs make this constructible"*.
`learningsFixtures.js:86-90` documents `spec.sections` (rendered in array order via `renderSection`)
and `spec.extraLines` (raw text appended verbatim); `renderSection` at `:64-72` takes
`section.body` and emits `## {ordinal}. {name}{gloss}\n\n{body}\n`, so a distinctive marker string
inside the `## 6. Approval Record` body is a one-line fixture change. The obligation is not
hypothetical — it lands on a helper that is on disk today.

**The normalisation rule is consistent with what that helper actually emits.** `renderSection`
terminates each section with a trailing `\n` and `buildLearningsDocument` joins section blocks with
`"\n"`, so each extent in a fixture document ends with a blank line. §D.3's step 1 (drop trailing
empty/whitespace-only lines, no trailing newline) is exactly the normalisation that makes those
builder-introduced blanks stop counting, and step 2's `"\n\n"` join re-supplies exactly one. The
rule and the fixture builder agree; a hand-recomputed literal will match a conforming
implementation.

**Nothing in the type surface moved.** `BR6_SECTION_NAMES` is the same five names in BR-6's order
with the gloss on priority 3 and no Approval Record entry; the zero-bound return is still
`{material: "", bounded: false, bytes: 0, sections: []}` in §I.3, §D.5 and T-O-6 alike; `sections[]`
is still `string[]` of canonical names. The delta **redefined** `sections[]`'s membership predicate
(now "at least one byte of its normalised text survives in `material`") rather than retyping it,
and I checked the redefinition against the two places that consume it: T-O-6's corpus conjunct
(intersection of `BR6_SECTION_NAMES` with the document's level-2 headings) still holds at unbounded
`maxBytes`, which is the only bound T-O-6's conjunct ranges over, and the zero-bound `sections: []`
now falls out of the same rule instead of needing its own clause. Both consumers stay true.

**One imprecision, inherited and non-gating — see F-01.** §D.5's "sum of normalised byte lengths
plus 2 per join" is presented as the hand-computation for AT-11 **and AT-12**, but AT-12 is by
construction the bounded case, where §D.5's own next paragraph fixes the expected count at the bound
exactly. The sentence's "AT-11's and AT-12's expected counts are therefore hand-computable" clause
predates this delta; the delta only sharpened what "sum" means. It is a Low, recorded below.

## Test Strategy

**AT-11's three conjuncts now each have an owner, and the transcription is faithful.** I diffed
§T.5's new table against FSPEC's AT-11 clause by clause:

| FSPEC AT-11, final sentence | §T.5's conjunct | Faithful? |
|---|---|---|
| "the set of section names appearing in its block material **equals** BR-6's five injected names in priority order" | Scan the rendered block for `SECTION_HEADING_RE` lines, map through §D.3's rule, assert the list **equals** `BR6_SECTION_NAMES` as an **ordered** list | Yes — set-equality over the full enumeration, not containment, and "in priority order" is preserved as orderedness rather than dropped |
| "the Approval Record's distinctive fixture text is absent" | `block.includes(marker) === false` on a marker occurring nowhere else in the corpus | Yes |
| "**while** all five injected sections' texts are present" | For each of the five, assert the block contains that section's **body** marker, not only its heading | Yes |

This is the three-part review bar met without my having to ask for it. **Set-equality, not
containment:** the first conjunct asserts equality against `BR6_SECTION_NAMES` in full, so deleting
a case reds. **No absence-only oracle:** §T.5 states the absence conjunct is *"paired per DC-03 with
the positive below on the same instrument so an all-empty block cannot pass the absence half"* —
which is precisely the failure the pairing rule exists to catch, named explicitly. **No
implementation echo:** the expected value is `BR6_SECTION_NAMES` as transcribed from BR-6 plus the
fixture's own marker strings; §T.5 says in as many words that `sections[]` is *"the producer's own
report"* and is asserted **in addition, never instead**, citing DC-14. All three demands are
satisfied on the face of the spec.

**The killing mutations are named, and each reds a specific conjunct.** §T.5 lists three: a renderer
that emits a taken section's heading without its body (reds conjunct 3); a matcher widened to
substring (reds the absence conjunct); a renderer that emits whole documents instead of selected
material (reds the absence conjunct). The document then explains why the absence conjunct cannot be
dropped as redundant with §D.3's allow-list argument — *"That argument is a design reason no
exclusion branch is needed; it is not a test."* That distinction is the right one and is the
sentence I would have written as a finding had it been missing.

**The test file the oracles land in exists.** §T.5 assigns all three conjuncts to
`learningsBlock.test.js`; `pdlc/workflows/__tests__/learningsBlock.test.js` is on disk at HEAD,
alongside `learningsSelect.test.js`, `learningsCorpus.test.js`, `learningsPremises.test.js`,
`learningsPredicatePin.test.js` and `learningsCaptureScript.test.js`. The split §T.5 asserts —
block-material claims with the renderer's suite, eligibility/ordering/count claims with
`learningsSelect.test.js` — matches the files that exist, so this is an assignment to a real seam,
not a naming aspiration.

**The dead-oracle risk the delta removes is a real one.** Before this delta, AT-11's set equality
read `sections[]`. Since `sections[]` is what the extractor reports, an implementation that took the
five sections and then failed to render three of them into the block would have passed AT-11 while
the authoring dispatch received a third of the material the REQ promises. That is the
producer-reports-its-own-intent shape, and it is now closed on the artifact the requirement is about.
No test coverage was lost in the move: `sections[]` is still asserted, as a supporting equality.

## Open Questions

None that block. Under the freeze I opened no new decisions, and the delta closed rather than opened
questions. Three things I checked and found already answered in the text, recorded so the next
reader does not re-check them:

1. Whether §I.3's two-line assembly summary could drift from §D.3's normative rule — it is a
   compression that ends in a pointer, and it agrees with §D.3 clause by clause today.
2. Whether the `sections[]` redefinition breaks T-O-6's corpus conjunct — it does not; the conjunct
   ranges over an unbounded extraction, where survival-in-`material` and match coincide.
3. Whether ERR-8 changes any behaviour this TSPEC specifies — it does not; §D.5's rule was already
   extract-then-bound, and the erratum documents the upstream prose gap rather than adopting it.

**Pre-existing, untouched by this delta and out of scope here:** ERR-5 (FSPEC E-13's "measured:
occurs at HEAD" parenthetical) and the `docs/discarded/` scoping rationale, both already recorded in
§OQ. ERR-8 is likewise already recorded by the author against FSPEC, so I do not re-route it.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | §D.5's "AT-11's **and AT-12's** expected counts are therefore hand-computable … sum of each taken section's normalised byte length … plus 2 bytes per join" names AT-12, but AT-12's fixture is by construction the *bounded* case, where §D.5's own next paragraph fixes the expected count at the bound exactly ("AT-12's fixture is therefore ASCII, so the expected count is the bound exactly"). The sum formula gives the count of the material *before* the cut, which is not `bytesInjected` for AT-12. The clause naming AT-12 predates this delta — the delta only sharpened what "sum" means — so it is inherited, not introduced. Suggested fix, whenever this document is next unfrozen: qualify as "the unbounded material's length; where the cut applies, §D.5's bound governs and AT-12's literal is the bound". | FSPEC AC-2.3 / AT-11, AT-12 |

## Deferred Items

DEFERRED: §D.5's byte-sum sentence names AT-12 alongside AT-11, though AT-12's literal is the bound, not the sum — qualify when the document is next unfrozen (F-01).
DEFERRED: §D.3's `\r\n` paragraph proves absence at HEAD by a grep, but nothing mechanically prevents a future corpus document from introducing `\r\n`; a corpus premise test asserting the grep's emptiness would make the assumption self-defending rather than dated.

## Positive Observations

- **The delta corrected an argument I had credited as sound at v13, and said so.** My v13 review
  praised the prefix rejection as "forced by FSPEC's own measured example". It was not — neither
  `Cross-Feature Findings` nor `Cross-Feature Patterns` is a prefix of the other, so E-33 never
  reached the prefix candidate. §D.3 now splits the argument, rejects substring/fuzzy on E-33 and
  the prefix rule on its own stated ground, while leaving the decision unchanged. A document that
  fixes a reviewer's own mistaken endorsement rather than banking it is doing the job.
- **AT-11 was moved onto the artifact the requirement is about.** The old wording made `sections[]`
  the operand — the producer's report of its own intent. The new §T.5 asserts over the rendered
  block, keeps `sections[]` as a supporting equality, and cites DC-14 for why the order matters.
  This is the difference between a green test and a proof the dispatch receives the material.
- **The three-conjunct table gives each half of AT-11 an oracle and an owner.** Two of AT-11's three
  conjuncts previously belonged to no test. They now have oracles, a file, and named mutations that
  red each — including the explicit note that the absence conjunct is not redundant with §D.3's
  allow-list design argument, because "that argument is a design reason … it is not a test".
- **The assembly rule makes a hand-recomputed literal a mechanical procedure.** Priority order is
  not document order for any of the 9 corpus documents (I checked all 9), so "sum the sections" was
  genuinely ambiguous about separators. Normalise / join with `"\n\n"` / cut once, plus "2 bytes
  per join", turns AT-11's literal into arithmetic a fixture author can redo without judgement.
- **Empirical claims still carry their provenance labels.** The `\r\n` absence is stated *with the
  command that proves it*, which I re-ran and which reproduces; the un-glossed tolerance remains
  labelled *not measured*. The measured/defensive discipline I credited at v13 survived a revision
  that added a lot of new empirical prose — that is where it usually erodes.
- **ERR-8 was filed, not folded.** The FSPEC Step 5 sequencing gap is real (items 15/16 verified at
  HEAD), and the response was an erratum with a suggested fix plus a statement of the rule the
  implementer follows — not a quiet redefinition of upstream inside a downstream document.

## Recommendation

**Approved with minor changes.**

No High finding is open — neither mine (v13 raised none) nor any raised here. The v0.9 delta
introduced no defect: every production file and symbol it newly cites exists at HEAD
(`pdlc/workflows/__tests__/helpers/learningsFixtures.js` with `buildLearningsDocument`:92,
`lines.join("\n")`:112, `renderSection`:64, `spec.sections`/`spec.extraLines`:86-90;
`pdlc/workflows/__tests__/learningsBlock.test.js`; `docs/_constraints/DOMAIN-CONSTRAINTS.md`
DC-03:79 and DC-14:379), every empirical claim reproduces (the `\r` grep returns no match; all 9
corpus documents invert BR-6's top two in document order; the `:(glob)` pathspec still returns 9),
and every upstream quotation matches the byte at HEAD (FSPEC AT-11's "in its block material", Step 5
items 15 and 16). Nothing I approved at v13 was weakened, narrowed or reinterpreted: BR-6's five
names, the Approval Record's structural `never`, F-O-1's two bounds and the zero-bound return are
unchanged. The one product-visible change moves AT-11's oracle onto the artifact FSPEC names, which
is a fidelity gain.

The single Low finding (F-01) is inherited, not introduced by this delta, and does not gate. Both
deferred items are recorded above for the next unfrozen round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}

APPROVAL-HASH: sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131
APPROVAL-HASH-NORMALIZED: sha256:4907c0693d7ac86f214dadff9fd6521f1bde43be9a4d974ce21a00cea8399a35
REVIEWED-COMMIT: 739fea34dc578e37710ac7c274896ff705ad99ea
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:ae75fa6291f1a060153f65b6b1bcc3959acd62b2c0872e7b319489c964a86a1d
