# Cross-Review: product-manager — TSPEC (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.2, erratum round 3)
**Date:** 2026-08-31
**Iteration:** 4 (delta confirmation)

## Overview

This is a **delta confirmation**, not a re-review. I approved this TSPEC at v3 (`Approved with minor
changes`, 0 High / 3 Medium / 1 Low) against the bytes at `66c4049ac`. Erratum round 3 has since
landed as six commits (`70c85c2fa` … `8750032f6`), touching §2.1, §4.3, §6.1, §6.4, §7, §7.3, §8.3,
§8.4 and RK-1 — 124 insertions, 60 deletions. I read the diff, not the document.

**Upstream is where the dispatch says it is.** I re-derived both hashes before reading anything:

| Upstream | Hash at HEAD | Dispatch hash | Match |
|---|---|---|---|
| `REQ-pdlc-stats.md` | `60a516fb…8f1c9` | `60a516fb…8f1c9` | yes |
| `FSPEC-pdlc-stats.md` | `0b8864d6…17b0` | `0b8864d6…17b0` | yes |

So the faithfulness question (DEC-ERR-03) is asked against exactly the REQ v1.4 / FSPEC v1.4 text the
orchestrator pinned, and I re-read the upstream clauses this document newly leans on rather than
trusting the round's own summary of them.

**Answer to the question asked: yes.** All seven routed items landed, and they landed *more*
completely than routed — items 3 and 4 were routed as "add `loop-distribution.test.js` as the sixth
site", and the author instead re-derived the whole set by sweep and found **nine**, which subsumes
the narrower correction rather than patching around it. Nothing I previously approved is broken: no
branch table, type, oracle, traceability row or specified behaviour changed. The four findings I
raised at v3 are all resolved (§4.3's BR-11 and BR-16 paragraphs re-grounded on FSPEC v1.4, §8.3's
three settled bullets deleted, AT-12/AT-17 cited as FSPEC-owned fixtures).

One **Low** finding, on a methodology claim introduced by this round. It is not gating and does not
need a round; it can ride the next edit this document takes for any reason.

### How I checked

Item-landing is necessary, not sufficient, so I verified the *substance* of each claim rather than
its presence:

- Re-read FSPEC BR-11, BR-16, BR-25, AT-12, AT-17 and §7.3, and REQ-STATS-04/06, at HEAD.
- Ran the sweep query §2.1 now specifies (`git grep -l "lib/loop-session.mjs"` over tracked
  non-`docs/` sources) and checked all nine named sites appear in its output.
- Opened each of the four newly-named test files and confirmed the symbol, the assertion form and
  the failure mode §2.1 attributes to it.
- Confirmed `DEC-STATS-01` `K-7` exists and owns the sibling-feature amendment, and that the sibling
  documents currently say the "five" the edit corrects to six.

## Architecture

§2.1 is where five of the seven routed items landed. It is now correct, and materially more honest
about cost than the version I approved.

**The count is right, and I checked it rather than counting the table.** The set is nine in-repo
sites plus two sibling-feature document edits. The internal breakdown the round introduces —
*five enumerations, holding six symbols across five files, plus four test files that pin those
enumerations* — reconciles exactly: `prepack.mjs`/`MODULE_NAMES`, `publish-preflight.mjs`/
`WORKFLOW_MEMBERS`, `fixture-machine.mjs`/`WORKFLOW_MODULE_NAMES`, `package.json`/`c8.include` are
one symbol each, `_tspec-packed-set.mjs` holds two (`WORKFLOW_MEMBERS` and `tspecPackedCount`) — 6
symbols, 5 files — and `loop-distribution.test.js`, `coverageInstrumentation.test.js`, `run.test.js`,
`learningsPremises.test.js` are the four pins. 5 + 4 = 9.

This retires the specific defect item 6 named: the old text held **two different sets of five** (§2.1
counted vendoring symbols, §7.3 counted co-change table rows including the non-vendoring
`c8.include`, and collapsed `_tspec-packed-set.mjs`'s two symbols into one). Both are now stated in
the same vocabulary, and I swept the document for stale counts — the only surviving "five"s are in
the changelog describing the correction and in §7's accurate breakdown. No stale count remains.

**Each of the four new test-file rows is accurate.** I opened all four; this is the part of a
co-change claim most likely to be aspirational, and it is not:

| Site | §2.1's claim | Verified |
|---|---|---|
| `loop-distribution.test.js` | `NEW_LIB_MEMBERS_BARE`, `NEW_LIB_MEMBERS_VENDORED`, three baselines, `assertAdditiveOnly` length equality | all present (lines 49–66); `assertAdditiveOnly` does assert length equality |
| `learningsPremises.test.js` | P-1's parsed `MODULE_NAMES` array-equality, "exactly four workflow modules" in the title | present; `toEqual` over the regex-parsed list, and the title does carry the stale-able word "four" |
| `run.test.js` | three `deepEqual` manifest-membership literals plus a process-entry `prepack` leg | present |
| `coverageInstrumentation.test.js` | P9-02 pins the `c8.include` literal; `toEqual`, so position matters | present |

**The sibling-feature rows are a scope decision, and they are properly owned.** Amending a
*completed, approved, frozen* feature's artifacts is exactly the kind of move that should not be
made inside an engineering document on its own authority — so I checked the authority. `DEC-STATS-01`
`K-7` exists and owns it, the TSPEC cites rather than restates it (correctly invoking
`pdlc-engineering-loop`'s verbatim-restatement lesson), and the pattern is precedented: the sibling
TSPEC's own 0.15 changelog row records `pdlc-engineering-loop` making the identical amendment and
frames it as "not a re-opening of this completed feature — a spec-first edit … that its own §5.4
obligates for any `PK-*` addition". The edit described is also factually right: the sibling TSPEC
§5.4 and FSPEC §5.2 both currently say **five**, so `5 → 6` plus `PK-26` is the correct delta. This
is a scope expansion made visible and traceable, which is the outcome I want — the previous version
hid two real document edits behind a five-row table.

**Option B's row (item 5) is fixed and is the sharper claim.** "`lib/` class grows 15 → 16" now
names that the class is held **twice**, the second copy being `publish-preflight.mjs`'s
production-side `LIB_MODULES_AT_HEAD` / `LIB_MODULES_FROM_THIS_FEATURE` pair (12 + 3). That matters
for the product decision the table exists to support: B was rejected partly on co-change cost, and
understating B's cost while overstating precision would have made the rejection look better-founded
than it was. Correcting it *against* the chosen option's interest is the right instinct.

## Interfaces

This is the DEC-ERR-03 half of the job: §4.3 was rewritten to lean on upstream text, so I re-read
that upstream text at HEAD rather than accepting the round's characterisation of it. **Every citation
holds.**

| TSPEC §4.3 now claims | FSPEC/REQ at HEAD | Faithful |
|---|---|---|
| BR-11 v1.4 states the DoD harvested condition in the same terms as REQ-STATS-04, naming the version grammar | BR-11: "no `CODE_REVIEW-{feature}-v{N}.md` file whose version matches the grammar remains (REQ-STATS-04)" | yes |
| BR-16 v1.4 phrases the condition over BR-14's grammar and is evaluated over exactly the set BR-14's numerator sums | BR-16: "…either no file matching BR-14's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` grammar remains… It is evaluated over exactly the file set BR-14's numerator sums, so the two never disagree" | yes |
| BR-16 names the `docs/completed/pdlc-advisory-wave-gate/` shape and reports it `harvested` | BR-16 names that directory explicitly, and the out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files it carries | yes |
| A stray `CODE_REVIEW-{feature}-draft.md` or foreign `CODE_REVIEW-` file does not hold the DoD family open | BR-16 says exactly this, in those words | yes |
| REQ-STATS-06 v1.4 carries the same scoping | confirmed in the REQ at the pinned hash | yes |
| AT-17's fourth leg is a FSPEC-owned boundary fixture, not a local invention | AT-17's fourth leg: `LEARNINGS` present, one `CODE_REVIEW` intact, only out-of-catalogue `CROSS-REVIEW-` basenames → `harvested` | yes |
| FSPEC §7.3 records the three harvested-predicate errata as closed | §7.3: "The three harvested-predicate errata this section carried are **closed** … BR-11, BR-16, AT-12 and AT-17 state and pin that form; nothing about them is routed upstream now" | yes |

**The behaviour did not move — only its justification did.** This is the distinction that decides
whether an erratum is safe, so I checked it specifically. At v3 §4.3 implemented the grammar-matching
reading and defended it as a *TSPEC choice* against a looser FSPEC ("the two readings genuinely
disagree", "and that is a choice", routed as an erratum in §8.3). At v1.2 the same branch is
described as the *specified* behaviour, because upstream moved to meet it. The matcher, the escaping
idiom, the precedence of the harvested test over the zero-denominator test, and the EC-16/AT-28
"silent, not malformed" disposition are all unchanged. That is precisely what my v3 F-01 and F-02
asked for, and it is the correct direction: a downstream document should stop claiming authorship of
a decision once upstream has taken it.

**The one place I looked hardest for a contradiction, and did not find one.** §4.3 now says the
`pdlc-advisory-wave-gate` directory reports `harvested` for the ratio, while §6.1's AT-09 row says
the four `CROSS-REVIEW-{role}-{doc-type}-REVIEW-v{1,2}.md` basenames in that *same* directory are
listed as `malformed` (`reason: "bad_doc_type"`). Those look like they collide. They do not: they
are different metrics — BR-06 malformed-disposition for the review-round metric, BR-16 harvested for
the byte ratio — and FSPEC BR-16 itself makes the joint reading explicit by describing them as "the
out-of-catalogue … files BR-06 reports as malformed". The TSPEC holds both dispositions for one
fixture directory without blurring them, which is the harder and the right thing to do.

I also note FSPEC §7.3 still carries an open REQ-STATS-03 erratum about whether reporting those four
files to an operator as "malformed" is the intended wording. The TSPEC does not restate it, and
should not — it is REQ-owned, already recorded upstream, and restating it here would be the
verbatim-restatement defect generator §2.1 explicitly avoids.

## Data Model

Nothing in the specified surface moved, which is the primary thing a delta confirmation has to
establish before it can approve.

**Traceability is intact.** §7.1's BR → component table still carries a row for every business rule
BR-01…BR-30, and none of the rows the erratum's sections touch (BR-11, BR-16, BR-25, BR-26) changed
its mapping. The erratum edited *prose about* BR-11 and BR-16 in §4.3; it did not edit the components
those rules bind to (`n > 0` before the harvested test for BR-11; harvested-before-zero-denominator
for BR-16). No P0 or P1 requirement lost a mapping, and no acceptance criterion was narrowed,
broadened or re-triggered by this round.

**No types, keys or enumerations changed.** `StatsReport`, `FeatureStats`, the `state`-carrying
metric types, `SCHEMA_VERSION`, `renderJson`'s five-key `SingleDocument` projection and three-key
`FleetDocument`, and `NON_FEATURE_DIRS`' eight names are all byte-identical to the version I
approved. The two counts this round *did* move — the vendored workflow-member class `5 → 6` and the
sibling packed-set note — are not product-facing data model; they are packaging enumerations, and
they move because the feature adds a module, which the REQ already contemplates.

**No scope crept in.** I checked both directions, since a round that adds 124 lines is exactly where
scope arrives unannounced:

- *Added but not required?* The only genuinely new obligations are the two sibling-document edits and
  two new §6.4 oracles. The sibling edits are not new scope — they are previously-unstated cost of
  scope the REQ already accepted (shipping `lib/stats.mjs` through the vendoring channel), now
  written down. The oracles are verification, not behaviour.
- *Required but dropped?* Nothing. The erratum deletes only §8.3 bullets whose upstream answers have
  landed, and stale count words.

**One deletion I checked before accepting it.** §8.3 lost three bullets (BR-16, BR-11, BR-25).
Deleting an open question is the kind of edit that can quietly discard a real gap, so I verified each
independently rather than trusting §8.3's own claim: FSPEC §7.3 confirms the BR-11 and BR-16 errata
closed, and FSPEC BR-25 at HEAD now names **both** archive-root loose files
(`docs/completed/REQ-completed.md` *and* `docs/completed/QUEUE-HISTORY-rows-0-1.md`), which is
exactly the incompleteness the third bullet reported. All three are genuinely settled upstream, so
removing them is correct — and the round is right that leaving them would re-route a decided question
(`DEC-ERR-01`'s anti-pattern) and cost a round.

## Test Strategy

Item 1 (the classifier-purity conjunct) landed here, along with the vendoring-row and reds-first
corrections. §6.4's oracle count moves five → seven.

**The purity conjunct does what it was routed to do.** `DEC-STATS-03`'s re-evaluation trigger is
"driver exports gain state" — previously detectable only by reading `orchestrate-dev.js`, i.e.
review-only, which is not a trigger a pipeline can act on. The new oracle calls each of the four
driver classifiers **twice on the same input inside one freshly-imported module instance** and
asserts the results are `deepEqual` **and non-aliased**. All three conjuncts are load-bearing and the
document says why each is, which is the part I care about:

- *Twice-called* is what makes a memo observable at all.
- *Non-aliased* is the conjunct that actually bites: a memoised classifier returns the **same object
  reference** on call *n* as on call *n − 1*, so `deepEqual` alone passes and only the reference
  check goes red. Asserting equality without non-aliasing would have been a false-green oracle.
- *Fresh module instance* matters because a module-level cache populated by an earlier test is
  invisible to a within-instance comparison.

The document also names the failure mode it is guarding against honestly: §6.1's recording double
wraps the real parsers, so a shared cache would be *inherited* by the double rather than exposed by
it. That is a real false-green path, and closing it converts a review-only trigger into a mechanical
one. This is a genuine improvement in the feature's verifiability, not paperwork.

**The construction-site count oracle closes `K-4`.** Asserting the four-classifier object literal
occurs **exactly once** in `bin/cli.mjs`'s source, as set-equality over occurrences rather than an
"at least one" containment probe, is the right shape — a containment probe cannot detect a second
construction site, which is the thing `K-4` exists to prevent.

**The vendoring-oracle row is now accurate about its own reach, and that is the best edit in the
round.** The old row implied the oracle covered the co-change set. It now states that it covers four
of the nine sites directly, a fifth (`c8.include`) only by way of `coverageInstrumentation.test.js`,
and — critically — that it is **not the first thing that reds**. An oracle that overstates its
coverage is worse than a missing one, because the team stops looking.

**The reds-first ordering is correct, and I verified the claim RK-1 leans on.** §6.4 now states that
`loop-distribution.test.js` reds first because it exists at HEAD *already* and its `assertAdditiveOnly`
length equality fires the moment the first four enumerations are edited — before this feature's own
new oracle exists. I confirmed `assertAdditiveOnly` does assert length equality, and that P7-02's
document-oracle leg ("`docs/completed/pdlc-engine-distribution/` TSPEC §5.4, FSPEC §5.2 and AT-3.8b
agree with `tspecPackedCount`'s vendored class size", `loop-distribution.test.js:182`) exists as
claimed. That leg is what makes RK-1's residue statement precise rather than hand-waving: the *count*
half of the sibling-document edit really is mechanically falsified; only `PK-26`'s *existence* row is
not. Stating exactly which half of a risk is guarded, and which is not, is the standard I want other
risk rows held to.

The observation that sites 8–9 (`run.test.js`, `learningsPremises.test.js`) sit in *different*
required CI checks — `Engine tests (ubuntu-latest)` and `Unit tests (ubuntu-latest, node 20)` — so a
partial edit reds a check on either side of the package boundary is a real and useful property, and
consistent with the four-check gate this repo's CI table documents.

## Open Questions

**§8.3 is down to one open erratum, correctly.** The surviving bullet — FSPEC BR-26/EC-10 name an
"unclassified" outcome but state no positive feature-recognition predicate — is genuinely still open
upstream, and it is the right one to keep. It is a *product* gap, not a technical one: "in neither
the exclusion set nor recognizable as a feature" is circular as written, EC-03/AT-26 rule out
artifact-presence as the discriminant by making a readable-but-empty directory a normal measured row,
and §4.4's leading-underscore predicate is explicitly marked provisional in consequence. The FSPEC
owes the predicate it intends. I am content for this to remain routed rather than resolved here.

**RK-1 is now the strongest row in §8.** It went from a vague "five-site vendoring co-change done
partially" to a row that names the nine sites, the two sibling-feature edits, the production-side
`publish-preflight.mjs` copy the `__tests__/`-scoped view misses, which test reds first, which two
required checks straddle the package boundary, and an explicit **Residue** clause separating the
mechanically-falsified count half from the unguarded `PK-26` existence half, with `K-7` named as the
single owning task. A risk row that says what is *not* covered is doing its job.

**Positive observations.**

- **The round over-delivered on its mandate, in the right direction.** Items 3 and 4 asked for a
  sixth site; the author re-derived the set and found nine. Treating a routed correction as evidence
  the method was wrong, rather than patching the one instance named, is what stops a document
  needing a fourth erratum round for a seventh site.
- **The cost correction runs against the document's own interest.** Option A is the chosen option,
  and this round nearly doubles its stated co-change cost while also sharpening rejected option B's.
  Making your preferred option look more expensive because that is what the evidence says is the
  behaviour that makes an options table trustworthy.
- **Two hidden sibling-feature document edits became visible work.** Before this round, amending a
  completed, frozen feature's approved artifacts was implied by a note; now it is two table rows, an
  owning decision (`K-7`), and a named single task. That is the difference between a surprise during
  implementation and a planned one.
- **`_tspec-packed-set.mjs`'s two symbols are no longer collapsed into one row.** The old
  four-plus-a-fifth phrasing hid a symbol edit; six-symbols-across-five-files is what an implementer
  actually has to do.
- **The carve-out is stated once and cited everywhere**, with `pdlc-engineering-loop`'s LEARNINGS
  cited for *why* — verbatim restatement across sites is a defect generator. The round adds four new
  places that could have restated it and none of them do.
- **My four v3 findings are all closed**, and none by argument — each by re-grounding on upstream
  text that has since landed.

**Questions.** None. I raised two at v3; both were about upstream drift that this round resolved.

## Recommendation

**Approved with minor changes**

The delta resolves all seven routed items and breaks nothing I previously approved. The TSPEC remains
a faithful compression of REQ v1.4 and FSPEC v1.4 at the pinned hashes: every clause it cites,
upstream still says, and says the same way. Specified behaviour is unchanged; the changes are to
cost, coverage and provenance claims, all of which moved toward accuracy.

One **Low**, non-gating: §2.1 describes the nine-site figure as "sweep-derived, not hand-counted",
but the query it names returns 24 tracked files, and reaching nine requires a judgement filter
(sites that *enumerate or pin* the member class, versus sites that merely consume it). The number is
sweep-*seeded* and hand-filtered. That is a perfectly sound method — and I verified all nine named
sites do appear in the sweep's output — but "sweep-derived" reads as mechanically complete, which is
load-bearing precisely where completeness is the claim: RK-1's residue argument and `DEC-STATS-03`'s
re-evaluation trigger both rest on the set being exhaustive. Suggested fix: say the sweep produced
the *candidate* set and name the filter applied to it. No round needed; fold into the next edit.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | §2.1 calls the nine-site figure "sweep-derived, not hand-counted", but the named query (`git grep -l "lib/loop-session.mjs"` over tracked sources) returns 24 files; reaching nine requires an unstated judgement filter separating sites that enumerate or pin the member class from sites that merely consume it. All nine named sites do appear in the sweep output, so the set is not wrong — but "sweep-derived" reads as mechanically exhaustive, and exhaustiveness is exactly what RK-1's residue argument and DEC-STATS-03's re-evaluation trigger rest on. State that the sweep produced the candidate set, and name the filter applied to it. | §2.1, "The number is *sweep-derived*, not hand-counted" |

FINDING: Low | delta | local | §2.1 sweep-derivation claim | "sweep-derived, not hand-counted" overstates the method: the named `git grep -l` query returns 24 tracked files and reaching nine requires an unstated filter (sites that enumerate or pin the class vs. sites that merely consume it). All nine named sites are genuinely in the sweep output, so the set is sound; the wording should say the sweep produced the candidate set and name the filter, since RK-1's residue argument and DEC-STATS-03's re-evaluation trigger both rely on the set being exhaustive.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
