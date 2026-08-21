# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` (v0.9)
**Compared against:** `739fea34` (the commit v14 approved)
**Date:** 2026-08-21
**Iteration:** 15 (delta confirmation)

## Overview

This round was dispatched as a delta confirmation on a targeted erratum edit. **No erratum edit
landed on the TSPEC.** The file at HEAD is byte-identical to the bytes I approved in v14:

- v14's `APPROVAL-HASH: sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131`
- `shasum -a 256 docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` at HEAD → the same digest
- `git diff 739fea34..HEAD -- docs/pdlc-learnings-injection/TSPEC-pdlc-learnings-injection.md` → empty

That is the correct outcome here rather than a missing edit, because the routed item is a
**disposition, not a change request**. Its own text says so: ERR-8 is recorded against **FSPEC**,
§D.5 already states the rule the implementer follows, and "the PLAN's rows already encode the
corrected order, so no PLAN change is owed". Every clause of that disposition was already in the
pre-round bytes at `739fea34` — the commit whose subject is *"TSPEC v0.9 — round-13 changelog and
ERR-8 (FSPEC Step 5 sequencing)"* — which is the commit I approved. Nothing was owed to this
document, so nothing changed, and nothing I previously approved could have been broken by a
zero-byte delta.

**I re-measured the disposition's three factual claims rather than trusting the item text:**

| Claim | Measured at HEAD | Holds |
|---|---|---|
| TSPEC §D.5 records ERR-8 and states the implementer's rule | §D.5: *"raised as ERR-8, and the rule the implementer follows is this one: **extract for every eligible document, then apply the count and total bounds**"* | ✅ |
| The §Open questions entry describes the FSPEC defect and supplies a fix | ERR-8 entry names items 15–16, the structural-vs-extraction mismatch, E-36's no-slot drop, and the suggested item reordering | ✅ |
| The PLAN's rows already encode the corrected order | PLAN's ERR-8 row: *"Already absorbed; no task moves"* — LI-16 runs `extractInjectableMaterial` for every eligible document and `selectLearnings` drops `sections: []` before both bounds; LI-12's third `LI-AT-30` case is the oracle that reds on Step 5's literal order | ✅ |

**Upstream is unchanged since the round I approved.** The dispatch's REQ and FSPEC digests
(`ff605dd3…`, `ae75fa62…`) are byte-for-byte the ones recorded in v14's `UPSTREAM-STATE` trailer, and
`shasum` over both files at HEAD reproduces them. There is therefore no DEC-ERR-03 drift surface this
round: nothing this TSPEC cites can have stopped saying what it said, because no cited document
moved. I confirmed the one upstream passage the item turns on — FSPEC Step 5, items 15–17 — still
reads exactly as ERR-8 describes it: item 15 drops on the structural condition *then* takes the first
`maxDocuments`, item 16 extracts "for each taken document". ERR-8 is still an accurate, still-open
report, not a stale one.

## Architecture

**A zero-byte delta cannot regress structure, so this section records what I re-verified rather than
what I re-read.** The confirmation question — "does the delta resolve the items without breaking what
was previously approved?" — has a mechanical answer when the delta is empty: the only way this round
could carry a defect is if the *disposition itself* were wrong, i.e. if ERR-8's "no behavioural
divergence" claim were false and the TSPEC were silently specifying something FSPEC forbids. That is
the claim worth re-testing, and it is the one I re-tested.

**ERR-8's outcome-equivalence claim, re-derived.** The two orderings differ only in *when* extraction
runs relative to the count cut:

| Ordering | At `maxBytesPerDocument > 0` | At `maxBytesPerDocument: 0` |
|---|---|---|
| FSPEC Step 5 literal (drop structurally → count cut → extract) | Structural drops consume no slot; count cut applies to the rest; every taken document extracts non-empty material | Count-surviving documents extract to `""`; the count-cut remainder is *already* `RSN-COUNT`, so the zero-bound drop is unobservable for them |
| TSPEC §D.5 (extract for all eligible → drop on *yields no material* → count and total bounds) | Extraction of a document that is later count-cut is wasted work but changes no reported row: a structurally-empty document still drops `RSN-NO-MATERIAL` before the bounds | **Every** eligible document yields no material, so all drop `RSN-NO-MATERIAL` before the count bound, none consumes a slot, and none carries `RSN-COUNT` — E-36's shape |

The orderings agree wherever the bound is non-zero, and diverge exactly at `maxBytesPerDocument: 0`,
where FSPEC's own E-36 decides the outcome the TSPEC implements. So the TSPEC is not diverging from
FSPEC's *decisions*; it is diverging from FSPEC's *procedure prose*, which contradicts E-36 — and it
says so, in the right register, with the fix addressed to FSPEC's author. That is the faithful-
compression behaviour I want from a TSPEC that finds an upstream self-contradiction: implement the
decided outcome, record the prose defect, do not silently pick either side.

**The architectural split the disposition rests on is unchanged.** §D.5 keeps the zero-bound
short-circuit inside `extractInjectableMaterial` and the no-slot drop inside `selectLearnings`, one
branch keyed on *yields no material* covering both of §T.7's disjuncts (structural E-33, zero-bound
E-36) with no zero-bound special case in the selector. §T.7's "two disjuncts, one branch" and the
twelve-arm fail-open table are outside this round's (empty) diff and I did not re-review them; I did
confirm the PLAN's arm table still routes the zero-bound disjunct to AT-30 case 3 with LI-16 as the
production owner, which is the wiring that makes "no PLAN change is owed" true rather than merely
asserted.

## Interfaces

**No interface contract moved this round** — the file is byte-identical, so `parseLearningsConfig`'s
`{config, sectionMalformed, invalidKeys}`, `renderLearningsBlock({selected})`'s `""`-when-empty rule,
`orderCorpus`'s comparator, `selectLearnings`'s totality over `entries`, and
`extractInjectableMaterial(text, maxBytes)`'s return shape are all exactly as approved in v14.

**Two of v14's open findings live in this lens and are still unlanded.** They are inherited, not
introduced, and neither is gating — but a confirmation that reported "nothing to see" would be
hiding them, so I carry them forward explicitly rather than letting an empty delta launder them into
silence:

- **§I.3's JSDoc byte identity is still unscoped** (v14 F-02, Low). The comment states the
  `bytes = Σ(normalised section lengths) + 2·(n−1)` arithmetic unconditionally, but the identity
  holds only on the **uncut** path; where the bound binds, `bytes` is the character-safe cut length
  ≤ the bound, and on the `maxBytes <= 0` short-circuit it is `0`. §D.5's restatement is correctly
  scoped, so the document as a whole is not wrong — an implementer reading the interface comment
  alone still could be. One qualifying clause fixes it.
- **§T.5's AT-11 block scan is still whole-block rather than per-document** (v14 F-03, Low). FSPEC's
  AT-11 asserts over the section names appearing in **its** block material; the oracle scans the
  rendered block entire. The two coincide only while the fixture's corpus holds exactly one selected
  document. Scoping the scan to the document's `<<< {path} … >>>` / `<<< end {path} >>>` extent
  (§OQ.1 supplies the delimiters) makes the oracle prove the per-document placement AT-11 is
  actually about, and immunises it against a later fixture gaining a second selected document.

**The interface the routed item touches needs no change.** `extractInjectableMaterial`'s zero-bound
branch — `maxBytes <= 0` tested *before* the cut, returning `{material: "", bounded: false, bytes: 0,
sections: []}` for every `text` including one carrying all five sections — is the contract that makes
§D.5's ordering rule implementable, and it is stated in §I.3 and owned by PLAN task LI-16. `bounded`
is `false` because nothing was taken, so nothing was cut; that is the conjunct that distinguishes the
zero-bound drop from a cut-to-zero, and it survives untouched.

## Data Model

**Unchanged this round:** `LEARNINGS_NOTICES`, `LEARNINGS_CORPUS_OUTCOMES`,
`LEARNINGS_REJECT_REASONS`, BR-8's row key set, `parseHarvestDate`'s `null` fallback, and §D.3's
assembly rule and `\r\n` fixture obligation are all outside the (empty) diff and outside the routed
item. I re-measured only the two claims the routed item leans on and the one open Medium that sits
in this lens.

**The two reason codes ERR-8 separates are still separated, and still keyed correctly.** §D.5 keeps
the distinction that makes the disposition load-bearing rather than cosmetic: `maxBytesPerDocument: 0`
⇒ every document `RSN-NO-MATERIAL`, no slot consumed, not `bounded`; `maxTotalBytes: 0` ⇒ material
exists but the first document's bytes carry the running total past the bound, so it and every
lower-ordered document drop whole with `RSN-BYTES`. *"The two zeros do not share a reason code."*
That sentence is what a reader implementing FSPEC Step 5 literally would get wrong, and it is what
LI-12's third `LI-AT-30` case reds on.

**v14's one Medium is still open and still sits in the data model** (inherited, non-gating): **T-O-6's
corpus-driven conjunct still lacks its no-cut qualifier.** §D.3 redefines `sections[]` as
bound-dependent ("every section whose normalised text survives in `material`"), but §T.6's T-O-6
states the corpus conjunct as `sections` equals the intersection of `BR6_SECTION_NAMES` with the
document's level-2 headings, over a domain it declares as *any* document text and *any* non-negative
`maxBytes` — `0` included. Read literally over that domain, the conjunct reds a **conforming**
implementation whenever the bound cuts, which is the exact failure mode T-O-6's first half exists to
prevent. The fix remains one clause: scope the corpus conjunct to a bound large enough that no cut
occurs (or `maxBytes = Infinity`), where "survives in `material`" and "matched in the document"
coincide. It stays non-gating because the property is not yet written and PROPERTIES' own
`PROP-BOUND-05` is already scoped to an unbounded document — but it is recoverable only until it
ships, so it should not be lost to an empty-delta round.

**One data-model consequence of the routed item is worth naming as already-correct.** Because §D.3
makes `sections[]` derivable from `material` rather than an independent report, the zero-bound
short-circuit's `sections: []` now *falls out of* the general rule instead of needing its own clause
— which is precisely why §T.7 can key one branch on *yields no material* and cover both the
structural (E-33) and zero-bound (E-36) disjuncts. The ordering ERR-8 corrects and the field
redefinition v14 approved are the same design decision seen from two sides; they remain consistent.

## Test Strategy

**The disposition is only sound if an oracle reds when an implementer follows FSPEC's literal item
order.** That is the test-engineering question behind "no PLAN change is owed", and it is the one I
re-measured. It holds:

`LI-AT-30`'s third case (`maxBytesPerDocument: 0`, LI-12, L3 workflow level) asserts **three positive
conjuncts**, not `selection is empty`:

1. the `learningsInjection` key is **present**, with BR-8's rows present and empty — the enabled-run
   shape, which a disabled run, a refusal or a crashed injector would not produce;
2. `rejected[]` is **set-equal** to every enumerated non-self corpus path, each at reason exactly
   `RSN-NO-MATERIAL`, none `bounded` — set equality, never "at least one";
3. **no** document carries `RSN-COUNT`.

Conjunct (3) is the ERR-8 oracle. An implementer who follows Step 5 literally — structural drop,
then count cut, then extract — leaves the count-cut remainder carrying `RSN-COUNT`, and (3) reds. It
is also the conjunct that kills the slot-burning mutant that takes a zero-byte first-section cut and
counts it as a contribution. And it carries its own **fixture precondition**, stated in the PLAN
because the conjunct is vacuous without it: the corpus must hold more eligible non-self documents
than the `maxDocuments` in force (≥ 6 at REQ §4.1's default of 5), below which no document could
carry `RSN-COUNT` under *any* implementation and (3) passes for free. A vacuity guard written into
the fixture obligation, at the same altitude as the conjunct it protects, is the right shape — this
is a falsifiable oracle, not a shaped-to-pass one.

The oracle sits at **L3, workflow level**, which is the correct level: the ordering under test is a
property of the selection pipeline's composition (extract → drop → bound), not of any one function,
so a unit test on `extractInjectableMaterial` structurally could not falsify it. The production
half — `maxBytes <= 0` short-circuit and the no-slot drop — is owned by a single named task (LI-16),
so the red has exactly one green counterpart, and reverting either function is a mutation the suite
catches.

**Nothing in the (empty) delta touched the suite partition or the AT inventory.** §T.5's per-file AT
counts, `LI-T-SUITEMAP`'s disjointness, the `Batch` column and every `Deps` edge are as approved.
`learningsBlock.test.js` still owns AT-05/AT-11/AT-12 with the three-row AT-11 oracle table and its
three named mutations; `learningsConfig.test.js` still owns AT-30 and AT-32 at L3.

**Two v14 residual test-strategy observations remain open and remain non-gating**: no test pins
§D.3's join rule *directly* (a violation reds AT-11's literal byte count as an off-by-N integer
mismatch rather than a named failure — a one-line junction assertion would fix the diagnosis), and
PROPERTIES' `PROP-BOUND-07` hand-computed-literal rule still omits the `+2 bytes per join` term,
which under §D.3 step 2 under-counts by `2·(n−1)`. The second is PROPERTIES' to fix, not this
document's, and I carry it as a deferred observation rather than a finding against the TSPEC.

## Open Questions

| ID | Question |
|----|---------|
| Q-01 | ERR-8 is still **open with FSPEC's author** at HEAD (Step 5 items 15–17 read exactly as ERR-8 describes). Since the outcomes agree at every bound and both the TSPEC and the PLAN encode the corrected rule, is the intended endgame (a) an FSPEC erratum reordering items 15–16 before Phase I closes, or (b) shipping with ERR-8 recorded as a known prose defect? Either is defensible; only (b) needs the ERR-8 entry to survive into the harvest so a later reader of Step 5 finds the correction. |
| Q-02 | T-O-6's corpus conjunct (v14 F-01, still open): should the no-cut qualifier be written as `maxBytes = Infinity` in the property's domain, or should the conjunct be restated over the *document's matched headings* rather than over `sections[]`? The second is closer to the matcher property T-O-6 is trying to prove; either closes the red-on-conforming-implementation hole. |
| Q-03 | Does the `+2 bytes per join` term need to reach PROPERTIES' `PROP-BOUND-07`, or is §D.5's formula the single source a fixture author actually consults when hand-computing AT-11's literal? Carried from v14 Q-02, still unanswered, still not blocking. |

*(All three are recorded for the author's convenience. None gates this confirmation.)*

## Recommendation

**Approved with minor changes.**

The delta resolves the routed item and breaks nothing previously approved — for the strongest
possible reason: the delta is empty, and the routed item was a disposition already fully landed in
the bytes I approved at `739fea34`. I verified this by digest rather than by reading:
`shasum` over the TSPEC at HEAD reproduces v14's `APPROVAL-HASH` exactly, and
`git diff 739fea34..HEAD` on the file is empty. I then re-measured all three of the disposition's
factual claims independently (§D.5 states the implementer's rule; §Open questions records ERR-8 with
its fix; the PLAN's LI-16/LI-12 rows encode the corrected order and say so explicitly), and confirmed
the upstream FSPEC passage ERR-8 reports still reads as described — so ERR-8 is an accurate, still-
open report rather than a stale one.

**DEC-ERR-03 check: no drift surface this round.** The dispatch's REQ (`ff605dd3…`) and FSPEC
(`ae75fa62…`) digests are byte-for-byte the ones recorded in v14's `UPSTREAM-STATE` trailer and
reproduce at HEAD. Nothing this TSPEC cites has moved since I last measured it against upstream, so
there is nothing upstream "no longer says the same way".

**No High findings, so nothing halts and nothing routes back as gating.** The four findings below are
all **inherited** — they are v14's open Medium and Lows, unchanged because the bytes are unchanged.
I re-file them rather than reporting a clean round so that an empty-delta confirmation does not
launder them into silence: the one Medium (T-O-6's missing no-cut qualifier) reds a conforming
implementation if the property ships as written, and it is recoverable only until the property is
written. None of the four blocks the erratum from closing.

## Delta-Confirmation Findings

The routed item is **resolved** and required no edit: its disposition ("§D.5 records ERR-8; the
PLAN's rows already encode the corrected order; no PLAN change is owed") was already present in the
pre-round bytes and re-measured true this round. No `delta` finding is owed against it.

All four findings below are **inherited** — carried forward unchanged from v14 because the file is
byte-identical — and all are **nonlocal**, since this edit changed no sections.

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | inherited | nonlocal | §D.3 makes `sections[]` bound-dependent ("every section whose normalised text survives in `material`"), but §T.6's T-O-6 still states its corpus conjunct as `sections` equals the intersection of `BR6_SECTION_NAMES` with the document's level-2 headings, over a domain declared as any text and any non-negative `maxBytes` — `0` included. Read literally, the conjunct reds a conforming implementation whenever the bound cuts, the exact failure mode T-O-6's first half exists to prevent. Add a no-cut qualifier (bound large enough that no cut occurs, or `maxBytes = Infinity`) | §T.6, T-O-6 corpus conjunct |
| F-02 | Low | inherited | nonlocal | §I.3's JSDoc states the `bytes = Σ(normalised section lengths) + 2·(n−1)` identity unconditionally; it holds only on the uncut path (`bytes` is the character-safe cut length when the bound binds, and `0` on the `maxBytes <= 0` short-circuit). §D.5's restatement is correctly scoped; the interface comment alone is not | §I.3, `extractInjectableMaterial` JSDoc |
| F-03 | Low | inherited | nonlocal | §T.5's AT-11 oracle scans the **whole** rendered block and asserts equality with `BR6_SECTION_NAMES`, while FSPEC's AT-11 asserts over the section names appearing in **its** block material. The two coincide only while the fixture's corpus holds exactly one selected document; scope the scan to the document's `<<< {path} … >>>` / `<<< end {path} >>>` extent (§OQ.1) | §T.5, AT-11 oracle table, first row |
| F-04 | Low | inherited | nonlocal | §D.5 retains "headings and bodies BR-6 selects, **ignore the delimiter**" one sentence before adding "**2 bytes per join**". The join separator is a delimiter; the two clauses read as contradicting each other until the reader reaches the parenthetical. Qualify the older clause | §D.5, "AT-11's and AT-12's expected counts are hand-computable" |

FINDING: Medium | inherited | nonlocal | §T.6 T-O-6 corpus conjunct | T-O-6's corpus conjunct still asserts `sections` == intersection of `BR6_SECTION_NAMES` with the document's level-2 headings over a domain including `maxBytes: 0`, while §D.3 now defines `sections[]` as bound-dependent — written literally the property reds a conforming implementation whenever the bound cuts; add a no-cut qualifier
FINDING: Low | inherited | nonlocal | §I.3 extractInjectableMaterial JSDoc | The `bytes = Σ(section lengths) + 2·(n−1)` identity is stated unconditionally but holds only on the uncut path; scope it, since `bytes` is the cut length when the bound binds and `0` on the zero-bound short-circuit
FINDING: Low | inherited | nonlocal | §T.5 AT-11 oracle table, first row | The AT-11 oracle scans the whole rendered block, while FSPEC's AT-11 asserts over the names appearing in *its* block material; scope the scan to the document's `<<< {path} >>>` / `<<< end {path} >>>` extent so a second selected document cannot false-red it
FINDING: Low | inherited | nonlocal | §D.5 hand-computable-counts paragraph | "ignore the delimiter" stands one sentence before "2 bytes per join"; the join separator is a delimiter, so the two clauses contradict until the parenthetical resolves them

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 3}

APPROVAL-HASH: sha256:22dee8ce1c9ba928f0796b77702321a1f6e873b729107114d0fd9fe07d562131
APPROVAL-HASH-NORMALIZED: sha256:4907c0693d7ac86f214dadff9fd6521f1bde43be9a4d974ce21a00cea8399a35
REVIEWED-COMMIT: 0214c54fc68fb2b194ecd5c6bdb3b4802d4bf6eb
UPSTREAM-STATE: REQ sha256:ff605dd373ded6dce3ee18212ecd44c0ad38dd1e669fe6100ba29f6dd92e84dd
UPSTREAM-STATE: FSPEC sha256:ae75fa6291f1a060153f65b6b1bcc3959acd62b2c0872e7b319489c964a86a1d
