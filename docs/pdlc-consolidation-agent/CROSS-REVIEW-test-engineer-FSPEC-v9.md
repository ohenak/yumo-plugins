# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v9.0)
**Date:** 2026-08-06
**Iteration:** 9
**Scope:** Testing lens only, delta re-review under the structural freeze declared in
`POSTMORTEM-F-pdlc-consolidation-agent.md` §Resolution step 2 and under `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md`, confirmed present). Baseline for the diff is
`f264860` — the commit v8 was written against; the revision is eight commits, `4f32af4`…`84fdb30`.
Prior findings M-01, L-01, L-02 are verified for disposition; new observations are drawn **only**
from changed text.

## Prior findings — disposition

All three v8 findings are **resolved**, and both v8 questions are answered inside the document. Each
was checked against the revised text and, where it made a claim about another section or about this
repository, against the cited target.

| v8 ID | Sev | Disposition | Evidence in v9.0 |
|----|---|---|---|
| M-01 | Medium | **Resolved, and the branch I argued for was the branch taken** | §6.4 gained a dedicated paragraph, "**A record short of `passId` does not un-suppress**" (`:831-846`): the predicate "is **decidable without `passId`** … an enacting record with `route != degraded` makes the pair `enacted` and the proposal **suppressed**, and nothing is appended", with only the evidence spelling degrading to "an explicit unavailable statement rather than a guessed value — `pass:undefined` is never written, and the entry is never dropped, which would read as 'not suppressed'". The contradiction is gone in **both** directions: §6.4's carrier row now enumerates four fields *and* states the normative split ("`failure-mode-id`, `action` and `route` are the three the `enacted` predicate below is a function of; `passId` is indexed **only** to spell the evidence", `:819`), and §8.1's reader row (`:1168`) states the same split with two named arms. The rule's downstream statements were carried through rather than left stale: §10.3's `suppressed-by:` row (`:1748`), BR-26 (`:2494`), BR-33a (`:2512`) and E-12b (`:2567`) all now carry "a rendering of the second spelling, not a third". The arm also has a home — §14.5 LD-4 — so it is neither silently uncovered nor silently claimed. I re-derived the safety direction against REQ NFR-4 (`REQ-pdlc-consolidation-agent.md:506-507`, key = the pair) rather than from the prose: the chosen branch is the one that keeps NFR-4's key sufficient |
| L-01 | Low | **Resolved, in the durable form** | The `(`:1712`)` line-number self-citation is gone; §8.1's §6.4 row now reads "§10.3's `suppressed-by:` row is normative for the two spellings" (`:1168`). I checked the target: `:1748` is the `suppressed-by:` row and does carry both spellings. A section-and-row anchor is the repair that survives the next edit, which is why this is closed rather than re-filed |
| L-02 | Low | **Resolved, and generalised past what the finding asked** | BR-33a's AT cell (`:2512`) no longer enumerates three arms: it states "The AT cell enumerates by **set-equality over §8.1's reader table**, so every arm has exactly one home", puts the `artifact` arms and the **`passId` arm** in the PROPERTIES-owned class with §14.5 pointers (LD-1, LD-4), and disposes of the remaining two field names in a closing clause. E-12b (`:2567`) absorbed the same arm. The enumeration is set-equal to the table's arms again — my L-01 below is about the accuracy of that closing clause, not about the enumeration being short |
| Q-01 | — | **Answered in the document, as asked** | The bookkeeping paragraph (`:1177-1184`) now scopes its own count: "**Four is the count of the readers of the bookkeeping fields, not of the record**: all seven readers of the record are enumerated once, in the reader table above, and the other three (§10.2 order 2, §8.3, §8.5) index no bookkeeping field." I checked the three named: §10.2 order 2's cell is "the record as written", §8.3's is `failure-mode-id` + `artifact`, §8.5's is `artifact` — none of the four bookkeeping fields, so the gloss is true as written |
| Q-02 | — | **Answered in the row, as a pin** | AT-F21's Given (`:2098`) now states "**All three records carry a `passId`**, pinned present", and says why in the same clause: §6.4 indexes it only to spell evidence, "so pinning it keeps conjunct (5) decidable and keeps this fixture on the two arms it does cover — the short-`passId` arm is deliberately **not** exercised here and is PROPERTIES-owned per DEC-LAYER-01 (BR-33a, E-12b)". That is the right resolution of the question: the fixture is scoped explicitly rather than left ambiguous, and the unexercised arm is named with an owner instead of falling between the covered and deferred sets |

## Findings

Three findings, all new, all inside text this revision introduced. No unchanged section was
re-litigated. One is **Medium**, and — as in v8 — it is not a fixture-strength deferral of the class
`DEC-LAYER-01` places below this layer: it is a **completeness claim newly strengthened at this
layer** that the document's own text falsifies, and the field it leaves unaccounted for is one whose
absence moves an effectiveness verdict. The other two are Low.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| M-01 | Medium | Local | **The new cell-level set-equality claim over §8.1's reader table is false as written, and the arm it hides is `phase` — the one bookkeeping-adjacent field whose absence silently moves a §8.3 verdict.** This revision promoted §8.1's row-level set-equality into a cell-level one (`:1158-1162`): "**The set-equality is over the table's cells, not only its rows**: for every field in §8.1's eight, the readers that index it are exactly those whose `Fields it indexes` cell names it. A reader that indexes an unlisted field, and a field indexed by a reader whose row omits it, are the same defect." I audited it field by field against the document, which is what the claim invites, and it fails on `phase` and `symptom`. (a) **§8.3 indexes `phase` and its row omits it.** §8.3's verdict rule (`:1371`) is "`prevented` \| no consumed LEARNINGS names the id, **and** at least one consumed LEARNINGS is decided by the phase observable to have exercised **the promotion's recorded `phase`**", and `:1372` makes `insufficient-evidence` its complement on the same field; `:1408-1409` restates that the slug is a function of "a *prior promotion's* recorded `phase` and canonical `artifact` (§8.1)". §8.3's reader cell (`:1171`) names "`failure-mode-id`, and `artifact` for the row's canonical path" — no `phase`. By the new sentence's own words this is "the same defect" as a reader indexing an unlisted field. (b) **§8.4's harvest question indexes `symptom`, `artifact` and `phase`, and no row carries them.** Step 2 (`:1420`) asks, per open promotion, "Does this open item report the failure this promotion's **`symptom`** describes, on this promotion's subject **`artifact`** …, in this promotion's **`phase`**?" — three fields read off the record; §8.4's row (`:1169`) is scoped to "step 1 open list" and names `failure-mode-id`, `action`, `route`. Either step 2 is an eighth reader with no row, or §8.4's row is short three fields; the claim admits neither. (c) **The consequence is a missing arm, not a bookkeeping quibble, and it is the arm with a verdict attached.** The reader table exists so that "no reader is left to infer its own arm" (`:1154`). A record short of `phase` — the same legacy/truncated record E-12b contemplates for `route`, `target`, `artifact` and now `passId` — has **no stated arm anywhere in the document**, yet §8.3's rule cannot evaluate `prevented` without it. The two reachable implementations are (i) fall to `insufficient-evidence` with the notice, and (ii) treat the phase as unexercised, which §8.3 `:1383-1384` already prescribes for an *undecidable* phase and which reaches the same verdict — but a third, "skip the record for §8.3" is what the general skip rule at `:1143-1145` literally directs, and skipping contradicts §8.3's own row ("the row is still emitted"; dropping it "would read as `insufficient-evidence` and silently move a verdict"). A test author asked today to assert the behaviour of a `phase`-short record cannot choose between three outcomes, one of which the document forbids elsewhere. **FSPEC-layer repair, no new AT and no new BR needed** — and two admissible shapes, either of which clears this: (1) *scope the claim*: state the set-equality over **the fields the table's readers index**, and name `phase` and `symptom` as read by §8.3 and by the §8.4 harvest question with their arms stated in those sections rather than in the table; or (2) *complete the table*: add `phase` to §8.3's cell (arm: the row is still emitted and the verdict falls to `insufficient-evidence`, never to a guessed `prevented` — the direction `:1383-1384` already fixes) and either add `symptom`/`artifact`/`phase` to §8.4's cell or give the harvest question its own row. (1) is the smaller edit and is fully inside the freeze | §8.1 `:1158-1162`, `:1169`, `:1171`; §8.3 `:1371-1372`, `:1383-1384`, `:1408-1409`; §8.4 `:1420` |
| L-01 | Low | Local | **BR-33a's new closing clause disposes of two arms by assertion rather than by coverage.** The cell (`:2512`) ends: "`failure-mode-id` and `action` are indexed by readers whose `route`/`target`/`artifact` arms already carry them." That is the one clause in the new set-equality enumeration that names neither a fixture nor a deferral owner, and it is not true in the sense the surrounding sentence uses ("every arm has exactly one home"). AT-F21's three records are short of `route` and `target` only (`:2098`), so no §13 fixture carries a record short of `failure-mode-id` or of `action`; and the `failure-mode-id` arm is not merely uncovered but **unstateable from the table as written** — §8.3's cell says a short record's "row is still emitted, **keyed on the id**" (`:1171`), which is exactly what a record with no id cannot do. Sharing a *reader* with another arm is not sharing an *arm*: what a record short of `failure-mode-id` does to §8.3, §8.4 step 1 and §6.4 is a different observable from what a record short of `route` does. **Repair, one clause:** either state the two arms (my reading: an id-less record is reported as the notice and contributes **no** §8.3 row, because a row cannot be keyed — which is the one place the "never dropped" rule cannot apply and therefore needs saying), or give them a §14.5 row as LD-5 with their observable, as this revision correctly did for `passId` | §18 BR-33a `:2512`, §8.1 `:1171`, AT-F21 `:2098` |
| L-02 | Low | Local | **The §8.2 partition says "two classes" and then enumerates three.** The repaired sentence (`:1264-1268`) reads "the rows named here are the two **classes** §13's rows fall into on this axis, not a sample of rows: every §13 row is either single-action over a subject by construction (AT-R6b's five fixtures …) or partitions on PR-opening … (AT-Q7, AT-Q7c …), **and** the rows that place a `revise` or `retire` beside an earlier `promote` (AT-F9, AT-F10, AT-F18) do so **across passes**". The third group is a real third class, not a sub-case of either named one: an AT-F9 row is neither single-action over its subject nor partitioned on PR-opening. I verified the group's substance and it holds — BR-35 (`:2516`) makes AT-F9/AT-F10 fire on "two consecutive counted passes", and AT-F18's Given is a promotion whose subject "has been **deleted** since the promotion landed" (`:2095`), so all three are cross-pass and none of them touches the intra-pass merge — the *claim* is sound and only the **count** is wrong. Tagged Low and `Local`, but it is the fourth appearance of the counting-mismatch class in this section (v8 Q-01 was the third), and the mechanical fix is the same one that worked there: state the count as **three** and let the enumeration carry it, or drop the numeral and write "the classes". A completeness claim whose stated cardinality disagrees with its own list is the failure mode a set-equality audit is supposed to catch | §8.2 `:1264-1268`, BR-35 `:2515`, AT-F18 `:2095` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §14.5's lead says the register "is **set-equal** to the deferrals this document names; a deferral added later is a row added here". I audited it and it holds for the **PROPERTIES-owned** deferrals — I grepped every `PROPERTIES-owned` / `no fixture at this layer` site (`:1269`, `:1341`, `:2041`, `:2098`, `:2512`, `:2513`, `:2567`) and each maps onto LD-1…LD-4 with no fifth. But the document also defers three *spellings* to **TSPEC** under the same `DEC-LAYER-01` (§8.1's §8.3 unavailable-path cell `:1171`, §10.3's `suppressed-by:` unavailable rendering `:1748`, §6.4's `:842`), and §6.5's seam permitted-set widening is a "recorded TSPEC decision" (`:960`). Those are not in the register, and on my reading they should not be — the register's title and lead scope it to PROPERTIES. Is that scoping deliberate and worth one clause ("TSPEC-owned spellings are §14.1's, not this table's")? If the answer is yes, this is free; if the register was meant to be the one place a downstream author looks for *any* deferral, the four TSPEC sites are missing rows and I would want that decided at this layer rather than discovered at TSPEC. |
| Q-02 | If M-01 is repaired by shape (2) — completing the table — §8.3's `phase` arm becomes assertable at this layer with the fixture already in §13: AT-F21's log fixture would need one more short record (`phase` absent, `failure-mode-id`/`artifact` present) and one more conjunct (the §8.3 row is emitted and its verdict is `insufficient-evidence`, never `prevented`). Is that inside the freeze, or does it read as a new fixture arm and therefore as PROPERTIES-owned under `DEC-LAYER-01` with a §14.5 row (LD-5)? I am not asking for the fixture — I am asking which of the two the repair should say, because whichever it is, the arm needs exactly one home, which is the discipline BR-33a's cell now imposes on itself. |

## Positive Observations

- **The M-01 repair was taken as a decision, not as a hedge, and it propagated.** The v8 defect was
  one rule stated two ways. The repair could have been a single reconciling sentence; instead §6.4
  gained the rule with its safety argument attached ("skipping … would re-append a constraint that
  already landed in the consuming repo, which is exactly the duplicate the paragraph above promises
  does not happen, produced by a field outside the suppression key", `:840-846`), and every place
  the rule is visible downstream was updated in the same revision — §8.1's reader row, §10.3's
  `suppressed-by:` row, BR-26, BR-33a, E-12b. I checked all five at their line numbers. A rule that
  changes in one place and stales in four is the usual outcome of a spec repair; this one did not.
- **`passId` was distinguished from the predicate fields *normatively*, which is what makes the arm
  testable at all.** §6.4's carrier row now states the split as binding ("The four are indexed for
  two different jobs and the split is normative", `:819`), and §8.1's row spells two arms rather than
  one exception. That is the difference between "this field is special" and a rule an implementer can
  apply to a field added later: the test is whether the reader's predicate is a *function* of the
  field, and BR-33a (`:2512`) now states it in exactly that form. It is the generalisation, not the
  patch.
- **§14.5 is the strongest thing in this revision, and it is a testing artifact.** The register gives
  each deferral three columns — what is owed, where its observable is stated, and **what a defective
  implementation does**. That third column is an oracle sketch: LD-4's "skips the contract and
  re-appends a constraint that already landed … or writes `pass:undefined`, or drops the
  `suppressed-by:` entry so the suppression is unevidenced" is directly transcribable into three
  falsifying assertions by a PROPERTIES author who never reads §6.4. Deferrals in this document were
  previously discoverable only from the point they arose; now they are enumerated once, and the table
  states its own set-equality obligation so a later deferral without a row is a defect rather than an
  omission. I verified the set-equality holds today (Q-01 records the one scoping question).
- **AT-F21 was scoped rather than stretched.** The easy answer to my v8 Q-02 would have been to add
  a fourth short record and claim the `passId` arm. The row instead pins `passId` *present* on all
  three records and says why — the fixture stays on the two arms it can actually decide, and the
  third arm is named PROPERTIES-owned with a §14.5 row. A fixture that declines a case explicitly is
  worth more than one that covers it ambiguously, because the coverage claim in BR-33a stays true.
- **The §8.2 class repair is substantively right and I checked it against the fixtures.** The claim
  that AT-F9, AT-F10 and AT-F18 place a later action beside an earlier `promote` **across passes**
  holds at BR-35 (`:2516`) and at AT-F18's Given (`:2095`); the intra-pass two-action case really is
  uncovered by §13, which is what LD-3 now records. Only the numeral is wrong (L-02).

## Recommendation

**Needs revision**

All three v8 findings are resolved, and the Medium was resolved in the strong form: the branch was
decided, argued from NFR-4's key, and propagated to all five downstream statements. Both v8
questions are answered inside the document rather than in a reply. Nothing in this revision re-opens
a settled decision, and nothing in it broke a section I had previously approved — I checked every
section the diff touched, re-verified the `:1748` citation target, re-grepped the deferral sites for
§14.5's set-equality, and re-derived the §8.2 cross-pass claim from BR-35 and AT-F18 rather than from
the prose.

The verdict is **Needs revision on M-01 alone**, and the reasoning is the same shape as v8's, applied
consistently. `DEC-LAYER-01` puts fixture construction and set-equality *domains* below this layer,
and I have applied that: L-01 is a missing arm in a coverage enumeration and is Low for exactly that
reason; the `passId` and `artifact` deferrals are not findings at all. M-01 is neither. This revision
**strengthened a completeness claim** — from row-level to cell-level set-equality over §8.1's reader
table — and the document's own text falsifies the strengthened form at two cells (§8.3 indexes
`phase` at `:1371`; the §8.4 harvest question indexes `symptom`, `artifact` and `phase` at `:1420`).
The claim is load-bearing for testing precisely because the table is the enumeration from which a
test author derives the short-record arms: read as true, it says `phase` has no reader and therefore
no arm, when in fact a `phase`-short record leaves §8.3 unable to evaluate `prevented` and the
document directs three mutually exclusive outcomes for it, one of which (`skip`) §8.3's own row
forbids. That is a false-verdict path with no stated oracle — the same class of harm §8.3's
"never dropped, which would read as `insufficient-evidence` and silently move a verdict" exists to
close.

The repair is one scoping clause or two table cells, adds no BR and — at the author's choice under
Q-02 — either no new AT or one extra record in an existing Given, so it is admissible under the
freeze:

1. **M-01** — either scope the cell-level claim to the fields the table's readers index, naming
   `phase` and `symptom` as read by §8.3 and by the §8.4 harvest question with their arms stated
   there; or complete the table (add `phase` to §8.3's cell with the arm "row still emitted, verdict
   falls to `insufficient-evidence`, never a guessed `prevented`", the direction `:1383-1384`
   already fixes, and give the §8.4 harvest question its fields or its own row). Then answer Q-02 so
   the `phase` arm has exactly one home.
2. **L-01** — state the `failure-mode-id` and `action` arms, or give them a §14.5 LD-5 row. "Shares a
   reader" is not "shares an arm", and §8.3's "keyed on the id" cannot describe an id-less record.
3. **L-02** — "the two **classes**" → three, or drop the numeral.

Taking (1) clears the verdict. (2) and (3) are Low and may be carried as tracked deferrals per
`DEC-LAYER-01`, though (3) is a one-token edit in the sentence this revision rewrote, and the
counting-mismatch class has now recurred four times in this section.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 2}
