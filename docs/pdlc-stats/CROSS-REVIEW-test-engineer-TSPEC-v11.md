# Cross-Review: test-engineer — TSPEC (delta confirmation, erratum round 8)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-stats/TSPEC-pdlc-stats.md (v1.8, `sha256:f32d9cb5…`)
**Upstream at HEAD:** REQ `sha256:f75c348f…` (v1.7), FSPEC `sha256:a493133f…` (v1.8)
**Reviewed range:** `bf496d9aa..0d72080f3` (three commits, TSPEC only)
**Date:** 2026-08-31
**Iteration:** 11 (delta confirmation; decision freeze in force)

## Overview

**All four v10 findings are resolved, nothing regressed, and the rule the round settled is green in
production code.** This is the cleanest confirmation round this document has had: the delta is
exactly the re-stamp §4.3 promised it would make when the dispute settled, and I can now check it
against something better than prose — the implementation landed in the meantime, so the settled rule
has a running oracle.

**What the round did** (three commits, TSPEC-only, 41 insertions / 21 deletions):

| Commit | Site | v10 finding it answers |
|---|---|---|
| `bc456b415` | §4.3 — contested paragraph re-stamped to the settled rule; BR-16 pin v1.7 → v1.8; AT-17 fourth-leg narration drops the withdrawn `measured` alternative | F-01, F-03 |
| `1d3976d70` | §8.3 — REQ-STATS-06/BR-16 bullet closed as discharged; count word two → one | F-02 |
| `0d72080f3` | §0 — v1.8 changelog re-grounds on REQ v1.7 / FSPEC v1.8; v1.7's superseded row neutralised in place | F-04 |

**Verification, not acceptance of the changelog's word.** I re-derived every load-bearing claim:

- The REQ text §4.3 now quotes is **verbatim** REQ-STATS-06 at HEAD (`REQ-pdlc-stats.md:207-213`),
  truncated at "reports **harvested**" — no paraphrase, no drift.
- FSPEC BR-16 at HEAD (`FSPEC-pdlc-stats.md:373-383`) states the same rule, and the FSPEC v1.8 diff
  is **11 insertions / 2 deletions confined to the header and changelog** — so §4.3's "FSPEC v1.8
  absorbed the same decision with no rule changed" is measured, not assumed.
- Both grounding hashes in the v1.8 changelog match `sha256sum` at HEAD exactly. F-04's stale pin is
  gone and the replacement is correct.
- §8.3 now carries exactly **one** bullet (BR-26/EC-10), matching its own count word, and
  `TSPEC:155` independently agrees ("only BR-26/EC-10 remains open").

**The new evidence this round affords.** The implementation has landed since v10, so I checked the
settled rule against code rather than documents. `computeByteRatio` (`lib/stats.mjs:277-294`)
filters `crossReviews` through `parsers.parseReviewFilename(b).ok` and fires
`harvested && (crossReviews.length === 0 || dodReviews.length === 0)` — precisely §4.3's sketch. The
AT-17 leg-4 oracle exists (`__tests__/statsMetrics.test.js:389-399`), asserts the positive token
`harvested` plus `ratio === null` over `realParsers()` with `CODE_REVIEW` intact, and **passes**: I
ran the suite (21/21 green). The expected value the dispute could have flipped is now pinned in
three documents and one running test, all reading the same token.

**What is left.** Two Low nits, neither touching an oracle: one wrap-width artefact the
neutralisation edit introduced, one imprecise section attribution in §8.3's closure prose that
predates this round. No High, no Medium. Approved with minor changes.

## Architecture

**F-01 (Medium) — resolved.** §4.3's closing paragraph (`TSPEC:806-818`) previously opened "What the
shape itself yields is contested upstream and is not decided here" and concluded "Both cannot hold".
It now opens **"What the shape itself yields is settled upstream, in BR-16's favour"** and states the
rule. Three things make this a good resolution rather than a wording swap:

1. **The quotation is now current and verbatim.** The paragraph quotes REQ-STATS-06 at v1.7 —
   "evaluated over exactly the file set whose bytes the process side sums … contributes no process
   bytes and counts as no file of its family remaining: a feature whose only `CROSS-REVIEW-`
   basenames are of that shape reports **harvested**". I diffed this against `REQ:207-213`
   character by character. It matches, including the C-5 parenthetical.
2. **The withdrawn reading is recorded in place, not deleted.** "*Record of a withdrawn reading, so
   it is not re-raised:* REQ v1.6 briefly called such a basename 'a survivor'…". This is the v1.3
   precedent I praised at v9 applied again, and it is the right call: a reader who encounters the
   v1.6 wording in an old review or an old test comment can now find out what happened to it
   without re-opening the question. Deleting the history would have invited a good-faith
   re-litigation of exactly the clause that cost this feature two rounds.
3. **The pre-declared re-stamp list is discharged honestly.** §4.3 said three sites would re-stamp;
   the paragraph now says they "re-stamp here" and adds "no type, signature, exit code, oracle or
   expected value moves, because the value they carried was already the settled one". That last
   clause is the accurate description of what happened, and it matches my own v10 finding that two
   of the three sites needed no substantive change.

**F-02 (Medium) — resolved, and the surrounding bookkeeping holds.** §8.3 (`TSPEC:1307-1327`) now
reads "**One remains open** — BR-26/EC-10's unclassified predicate, below", and the discharged
bullet is gone. I checked the closure did not damage its neighbour: the BR-26/EC-10 bullet survives
intact with its circularity argument, its EC-03/AT-26 reasoning and its §4.4 leading-underscore
note. That was the specific risk I flagged in v10 Q-02 — closing by wholesale deletion — and it did
not happen.

The count arithmetic is internally consistent: "Four others this section carried are **closed**"
enumerates BR-16's ambiguity, BR-11's dropped qualifier, BR-25's loose-file illustration (all at REQ
v1.4 / FSPEC v1.4) and the REQ-STATS-06-versus-BR-16 item (REQ v1.7 / FSPEC v1.8) — four, and
"All four are removed" agrees. `TSPEC:155`, in a different section and untouched by this round,
independently states "§7.3 declares closed (BR-16, BR-11, BR-25); only BR-26/EC-10 remains open".
Two independently-authored count claims agreeing is the cheap check that catches a half-applied
closure edit, and it passes.

**F-04 (Low) — resolved, and this is the one I checked hardest.** This document has a history of a
false no-movement attestation (v1.5), so a grounding pin is not something I take on trust. The v1.8
changelog claims REQ `sha256:f75c348f…` (v1.7, commit `e12b78fd8`) and FSPEC `sha256:a493133f…`
(v1.8). `sha256sum` at HEAD returns `f75c348f299ebff8…` and `a493133f67150b27…`. Both correct. The
changelog also correctly records that **FSPEC moved this round too** — v10 grounded on FSPEC
`c7d2c832…`, HEAD is `a493133f…` — which is a movement my own v10 dispatch had not anticipated and
which the author caught and pinned rather than inheriting the old hash. That is the attestation
discipline this document was missing three rounds ago.

**Scope discipline.** The delta touches §0, §4.3's narration and §8.3. It does not touch the §4.3
code sketch, §5's types, §6's levels, §7's tables or §2.1's co-change derivation. I confirmed this
from the diff rather than the changelog's assurance: the three hunks in §4.3/§8.3 and one in §0 are
the entire change set.

## Interfaces

**Did the delta move a seam? No — and for the first time I can prove it against production code
rather than against the document's own prose.** The implementation of this feature landed between
v10 and v11 (`ca8031311`…`1846a8a96`), so §4.3's sketch now has a shipped counterpart.

| TSPEC §4.3 claim | Production code at HEAD | Agrees? |
|---|---|---|
| Cross-review membership is `parseReviewFilename(...).ok`, not a `CROSS-REVIEW-` glob | `const crossReviews = basenames.filter((b) => parsers.parseReviewFilename(b).ok);` (`lib/stats.mjs:281`) | ✅ |
| Harvest is a **disjunction** over the two families, guarded by LEARNINGS presence | `if (harvested && (crossReviews.length === 0 \|\| dodReviews.length === 0))` (`lib/stats.mjs:293`) | ✅ |
| The `harvested` arm returns a null ratio with byte totals retained | `return { state: "harvested", ratio: null, processBytes, specBytes };` (`lib/stats.mjs:294`) | ✅ |
| Harvested is tested **before** the zero-denominator branch (BR-16 precedence) | the `harvested` guard at `:293` precedes the zero-`specBytes` branch below it | ✅ |
| `harvested` is derived from LEARNINGS presence once and threaded to each metric | `const harvested = basenames.includes(\`LEARNINGS-${feature}.md\`);` (`lib/stats.mjs:316`), passed to `computeReviewRounds`/`computeDodRounds`/`computeByteRatio` (`:318-321`) | ✅ |

The settled rule therefore reaches production by the exact path §4.3 describes: an out-of-catalogue
basename fails `parseReviewFilename`, so it is absent from `crossReviews`, so `crossReviews.length
=== 0` fires, so the directory reports `harvested`. That is REQ v1.7's sentence, executed.

**The metric-state catalogue is unmoved.** `MetricState = "measured" | "harvested" | "unmeasurable"
| "unavailable"` (`TSPEC:543`) — I re-checked that the delta neither adds nor orphans an arm, since
a withdrawn upstream clause is exactly the edit that leaves a dead discriminator behind. The shipped
JSDoc types agree (`lib/stats.mjs:72`, and the per-metric narrowings at `:76`, `:89`, `:101`), and
`"harvested"` is reachable on all three (`:230`, `:251`, `:294`). No arm is dead.

**Signatures, injected IO and the fake seam are untouched.** `parseReviewFilename` is still the
injected parser property (`lib/stats.mjs:64`), the `fakeStatsIo` seam §6.2 nominates is what AT-17's
legs run over, and no function signature in §4.2 or §5 mentions "survivor" or any name the withdrawn
clause would have introduced. I looked specifically, because the failure mode worth catching is a
vocabulary that outlives the rule that motivated it. There is none.

**The one narration F-03 named is fixed.** `TSPEC:820-826` previously described AT-17 leg 4 as
"expected `harvested` on BR-16's reading, and `measured` on REQ-STATS-06 v1.6's" and called it "the
row to re-stamp if the reconciliation lands the other way". It now reads "expected **`harvested`**,
the value BR-16 and REQ-STATS-06 v1.7 both now state … it is pinned, not provisional — the
reconciliation landed on this side, so no alternative expectation stands behind it." That is the
change that matters most for test authoring: the sentence a fixture author reads when deciding how
hard to pin the expectation no longer offers them an alternative. I checked §6.1 and §7.2 for any
surviving provisional framing of the same leg — `TSPEC:971-977` describes AT-17's fourth leg as a
constructed fixture deliberately excluded from the real-path baseline table, with no hedging about
its value. Clean.

## Data Model

No type, constant, literal, JSON key or baseline number moves in this delta. I re-verified each
class of value that a withdrawn upstream clause could plausibly have disturbed:

- **State catalogue** — unchanged, all four arms live (see §Interfaces above).
- **`ProcessSpecRatio`'s `{ state, ratio, processBytes, specBytes }`** — unchanged, and the shipped
  `harvested` return keeps both byte totals populated (`lib/stats.mjs:294`). This matters for the
  oracle: it is what lets PROP-RATIO-08 assert three positive conjuncts rather than an absence.
- **`REVIEW_DOC_TYPE_ROWS` / the six C-3 spec document types** — REQ v1.7 adds, removes and renames
  no document type, so the single-constant argument and §2.1's drift oracle stand with the same
  expected membership.
- **§6.1's measured baselines for `docs/completed/pdlc-advisory-wave-gate/`** — 62 `CROSS-REVIEW-*`,
  4 out-of-catalogue, 58 grammatical, ratio **measured**. §4.3's re-stamped paragraph preserves this
  reading ("only the malformed shape is borrowed", `TSPEC:794-805`), FSPEC BR-16 at HEAD says the
  same in its own words (`FSPEC:382-384`), and the landed real-path test transcribes the same four
  basenames (`__tests__/statsRealPaths.test.js:45-59`). Three sources, one measurement.
- **AT-17 leg 4's expected token** — `harvested` before the erratum, `harvested` after it, and
  `harvested` in the shipped assertion. Nothing to re-measure.

**One observation about the count claims §0 re-asserts.** The v1.8 changelog closes with "§2.1 still
derives **ten** co-change sites and the seven → eight `REQUIRED_INCLUDES` move stands". Both are
re-assertions of inherited numbers, so I checked them rather than waving them through:

- `REQUIRED_INCLUDES` at HEAD holds **four** entries
  (`__tests__/coverageInstrumentation.test.js:37-46`), exactly as §2.1 (`TSPEC:272`) records, and
  the `c8.include` set in `pdlc/workflows/package.json` now holds **eight** — the seventh and eighth
  being this feature's own `lib/stats.mjs` addition. So the "seven → eight move" did not merely
  stand; it **landed**, because the implementation shipped between rounds. §2.1's "seven at HEAD" is
  therefore a pre-implementation reading of HEAD that the feature's own T-19/T-20 commits have since
  overtaken. This is normal for a spec mid-implementation and is not a defect in the document — but
  it is worth knowing that §2.1's HEAD-relative counts are now historical rather than live, and I
  record it as a deferred item rather than a finding.
- The **ten** co-change sites: §2.1 still derives ten and the packed-set table still sits outside
  them (`TSPEC:205-208`, `TSPEC:245-262`). Untouched by this delta.

**A drift I noticed in the landed test, recorded for the implementation phase, not against TSPEC.**
`coverageInstrumentation.test.js:263` is titled "the include set is exactly the **seven** modules the
feature owns" while asserting an eight-element array, and its adjacent comment describes "the
seven-member literal … REQUIRED_INCLUDES' **three** entries" where `REQUIRED_INCLUDES` holds four.
The **oracle is correct** — it is a `toEqual` set-equality over the full enumeration, so a deleted
entry reds exactly as §2.1 requires, and this is a printed-word staleness only. §2.1 predicted this
precise hazard ("the title and comment are already stale at HEAD"). It belongs to IMPLEMENTATION
review; TSPEC is frozen and says the right thing.

## Test Strategy

**Does any test this document specifies now assert a wrong value? No — and this round I could stop
reasoning about it and run it.**

**The assertion-bearing site, executed.** The dispute had exactly one: AT-17's fourth leg. It is
implemented at `__tests__/statsMetrics.test.js:389-399`:

```js
it("AT-17 (directory 4 of 4): LEARNINGS plus CODE_REVIEW intact, only an out-of-catalogue
    CROSS-REVIEW basename, reads harvested", async () => {
  const io = ioFor({ [`LEARNINGS-${FEATURE}.md`]: "x",
                     [`CODE_REVIEW-${FEATURE}-v1.md`]: "y",
                     "CROSS-REVIEW-product-manager-REVIEW-v1.md": "z" });
  const result = await compute(io, realParsers());
  expect(result.byteRatio.state).toBe("harvested");
  expect(result.byteRatio.ratio).toBeNull();
});
```

`NODE_OPTIONS=--experimental-vm-modules npx jest statsMetrics` → **21/21 pass**, all four AT-17 legs
among them. Four properties of this test are worth naming because they are the ones my prior rounds
asked for and they are all present:

1. **Positive oracle, not absence-shaped.** `toBe("harvested")` — the exact state token — paired
   with `ratio` being `null`. Not `!== "measured"`. This is what PROP-RATIO-08's "three positive
   conjuncts" rule requires (`PROPERTIES:272`).
2. **The discriminating conjunct is present.** `CODE_REVIEW-{feature}-v1.md` is **intact**, so the
   `dodReviews.length === 0` disjunct cannot fire and mask the result. The leg can only pass through
   `crossReviews.length === 0`, which is the branch REQ-STATS-06 v1.7 decides. Without that conjunct
   the test would be an accidental pass; with it, it is a real oracle for the settled rule.
3. **Real parser, not a stub.** `realParsers()` — so the leg traverses the actual
   `parseReviewFilename` grammar rather than a fake that could be made to agree with either reading.
   This is the seam RK-2 warns about, honoured.
4. **No implementation echo.** `"harvested"` is a literal transcription of the spec token, not
   derived from the module under test.

**Mutation check, now concrete.** The mutation the withdrawn REQ clause effectively argued for is
relaxing `lib/stats.mjs:281` from `parseReviewFilename(b).ok` to a bare
`b.startsWith("CROSS-REVIEW-")`. Under that mutation the leg-4 fixture would put
`CROSS-REVIEW-product-manager-REVIEW-v1.md` into `crossReviews`, the harvested disjunct would go
dark, and the test would report a measured ratio — **RED**, as required. The guarded behaviour is
genuinely guarded, and PROPERTIES records it (PROP-RATIO-08's "the fourth leg is the one that proves
the condition is a disjunction rather than a DoD-side test", `PROPERTIES:173`). Given that this
repository has now argued both sides of this rule across two REQ versions, that mutation coverage is
the thing that will stop a future editor re-introducing the loosening in good faith.

**Set-equality where enumerations are asserted.** PROP-RATIO-08 requires *all four* AT-17 legs, and
all four exist as separate `it` blocks (`statsMetrics.test.js:349, 361, 373, 389`) — a deleted leg
fails the enumeration rather than silently shrinking coverage. The parallel enumeration oracle for
the c8 include set is a `toEqual` array-equality (`coverageInstrumentation.test.js:264-272`), so a
dropped entry reds too. Both are set-equality, not containment.

**Real-path versus constructed fixtures still prove different things.** `pdlc-advisory-wave-gate/`
remains **measured** (58 grammatical survivors alongside the 4 out-of-catalogue files) and is pinned
by a real-path test (`statsRealPaths.test.js:45-59`); leg 4's harvested verdict is a constructed
`fakeStatsIo` fixture. §7.2's exclusion of leg 4 from the real-path baseline table is still correct,
and the delta does not blur the two.

**Nothing in the delta softens an oracle.** That was the specific risk I filed as Medium at v10 —
that a test author reading §4.3's "contested … may re-stamp" hedge would weaken the assertion to
`one of harvested|measured`, or skip the leg. The hedge is gone from both §4.3 and §8.3, and the
test that was subsequently written pins the token hard. The Medium did its job.

**No new property is owed.** REQ v1.7 changed only what a *rejection* means downstream, not the
grammar; `parseReviewFilename`'s round-trip and rejection properties are unaffected, and the
property suite (`statsProperties.test.js`) needs no addition on account of this delta.

## Open Questions

**Q-01 — none blocking.** The v10 questions are both discharged or unchanged. Q-01 asked whether
§8.3's closure would land before PROPERTIES/PLAN were re-read; it landed, and PROPERTIES already
reads the settled direction (PROP-RATIO-08 at `PROPERTIES:173` names all four AT-17 legs including
the out-of-catalogue one). Q-02 asked that the closure not delete the BR-26/EC-10 bullet along with
it; it did not.

**Q-02 — BR-26/EC-10 remains genuinely open, and is correctly parked.** §8.3's surviving bullet
states that "in neither the exclusion set nor recognizable as a feature" is circular as written and
that FSPEC should state the predicate it intends. That is inherited, FSPEC-owned, and untouched by
this delta. §4.4 adopts the leading-underscore discriminant as the interim rule and RK-5 records the
residue with its oracle, so the open question is not blocking test authoring. I raise it here only
to confirm it survived the closure edit intact — it did.

**Assumption recorded.** I read §0's v1.7 and earlier changelog paragraphs as historical record.
The v1.8 round neutralised v1.7's superseded row **in place** ("*Superseded — this row is history,
not a live claim*") rather than deleting it, which is the same template the document used at v1.3
and which I have twice endorsed. I did not file the remaining older changelog rows as defects.

**Deferred observations** — recorded, not gating, and out of scope for a frozen round:

DEFERRED: §2.1's "seven `REQUIRED_INCLUDES` entries at HEAD" is a pre-implementation reading; the feature's own T-19/T-20 commits landed `lib/stats.mjs` and `pkg.c8.include` now holds eight, so §2.1's HEAD-relative counts are historical rather than live.
DEFERRED: `coverageInstrumentation.test.js:263`'s title word ("seven modules") and its adjacent comment ("REQUIRED_INCLUDES' three entries") are stale against an eight-element literal and a four-entry constant — the `toEqual` oracle is correct, only the printed words drifted; belongs to IMPLEMENTATION review.
DEFERRED: §8.3's closure prose says "§4.3 now states each of the four as the specified behaviour it is", but BR-25's loose-file illustration is stated in §4.4 (`TSPEC:847`), not §4.3; the attribution predates this round and the count itself is right.

**Not re-reviewed.** Everything outside §0, §4.3's narration and §8.3: §2.1's co-change derivation,
§4.2/§5's types, §4.4's discovery predicate, §6.2's levels, §6.4's vendoring oracle, §6.6's kill
map, §7's tables and §8.4's DECISIONS questions. Those were approved at v9/v10 against upstream
whose only movement this round is the clause above, and I re-litigated none of them.

## Recommendation

**Approved with minor changes**

TSPEC v1.8 is a faithful compression of REQ v1.7 and FSPEC v1.8. All four v10 findings are resolved
at their named sites, and I verified each against HEAD rather than against the changelog: the REQ
quotation is verbatim, both grounding hashes match `sha256sum`, FSPEC's v1.8 diff really is
changelog-only, and §8.3's count word matches its bullet count and an independent count claim
elsewhere in the document.

The delta broke nothing. No type, signature, exit code, branch order, code sketch, baseline literal
or acceptance-test expected value moved — and this round I could confirm that against shipped code
rather than prose: `computeByteRatio` (`lib/stats.mjs:277-294`) implements §4.3's sketch exactly,
and AT-17's fourth leg (`statsMetrics.test.js:389-399`) asserts the settled token `harvested` with a
positive oracle, a real parser and the discriminating `CODE_REVIEW`-intact conjunct. It passes.

Two Low findings remain, neither touching an oracle: a 161-character line the neutralisation edit
introduced, and an imprecise section attribution in §8.3's closure prose that predates this round.
Both are cosmetic and can be swept whenever the document is next opened. Nothing here requires a
round.

**Positive observations.**

- **The document predicted its own delta and then discharged it exactly.** §4.3 pre-declared three
  re-stamp sites; all three re-stamped, and the paragraph says plainly that no expected value moved
  "because the value they carried was already the settled one". Routing beat guessing, and the
  ledger closed clean.
- **Withdrawn readings are neutralised in place, not deleted.** Both §0's v1.7 row and §4.3's
  survivor clause are kept as marked history. On a question this document has now seen argued both
  ways, that is what stops a future editor re-raising it in good faith.
- **The author caught an upstream movement my dispatch did not name.** FSPEC moved to v1.8 this
  round as well as REQ to v1.7; the changelog re-grounded on both and pinned both hashes correctly,
  in a document whose v1.5 shipped a false no-movement attestation. That habit has now visibly
  changed.
- **The count bookkeeping is cross-checked.** §8.3's "one remains open" agrees with its bullet
  count and with `TSPEC:155`, written in a different section at a different time.
- **The settled rule reached production correctly.** The single-parser seam §4.3 argued for is what
  shipped, and its guarded branch has a mutation-sensitive test. The chain from REQ sentence to
  green assertion is complete and I walked all of it.

## Delta-Confirmation Findings

**Prior-round findings — all resolved.**

| Prior ID | Severity | Site | Status at v1.8 |
|----|----------|---------|----------------|
| F-01 (v10) | Medium | §4.3 contested paragraph | **Resolved** — states the settled rule, quotes REQ v1.7 verbatim, records the withdrawn reading in place |
| F-02 (v10) | Medium | §8.3 second bullet | **Resolved** — closed as discharged, count word two → one, BR-26/EC-10 bullet intact |
| F-03 (v10) | Low | AT-17 fourth-leg narration | **Resolved** — withdrawn `measured` alternative dropped, expectation pinned hard |
| F-04 (v10) | Low | v1.7 changelog grounding pin | **Resolved** — re-pinned to REQ `f75c348f…` and FSPEC `a493133f…`, both verified by `sha256sum` |

**This round's findings.**

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | The v1.7 changelog's neutralisation edit joined the "(c) §5's types survive REQ v1.6's halt withdrawal" sentence onto the preceding line, producing a 161-character line against the document's ~100-column wrap convention. Renders fine; purely a diff-readability nit for the next edit that opens §0. | TSPEC §0, v1.7 changelog row (line 72) |
| F-02 | Low | inherited | nonlocal | §8.3's closure prose says "§4.3 now states each of the four as the specified behaviour it is", but BR-25's loose-file illustration is stated in §4.4 (Discovery), not §4.3. The count of four is correct and the attribution predates this round — the delta only carried it from "three" to "four". Read "§4.3/§4.4" when sweeping. | TSPEC §8.3, closure paragraph |

FINDING: Low | delta | local | TSPEC §0 v1.7 changelog row, line 72 | The neutralisation edit joined a sentence onto the preceding line, leaving a 161-character line against the document's ~100-column wrap convention; rendering is unaffected, it is a diff-readability nit only.
FINDING: Low | inherited | nonlocal | TSPEC §8.3 closure paragraph | "§4.3 now states each of the four as the specified behaviour it is" misattributes BR-25's loose-file illustration, which is stated in §4.4 (Discovery); the count of four is correct and the imprecision predates this round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 2}

APPROVAL-HASH: sha256:7b119eb7fa68475db641e2c244a3b9c10b742b2310d0079ccbb137d9e6d3e85e
APPROVAL-HASH-NORMALIZED: sha256:b0074824271ab5233a5e14a208122cbd42160d922864e211f89d23ffd8875aa0
REVIEWED-COMMIT: 0d72080f399274f7c36cc7c998fef5431979947d
UPSTREAM-STATE: REQ sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862
UPSTREAM-STATE: FSPEC sha256:a493133f67150b27020b10d05cd676a505e172f0b89082a208ce8198a3137f5d
