# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/FSPEC-pdlc-consolidation-agent.md` (v10.0)
**Date:** 2026-08-06
**Iteration:** 10
**Scope:** Testing lens only, delta re-review under the structural freeze declared in
`POSTMORTEM-F-pdlc-consolidation-agent.md` §Resolution step 2 and under `DEC-LAYER-01`
(`docs/_decisions/DECISIONS-spec-layer-boundary.md`, confirmed present). Baseline for the diff is
`84fdb30` — the commit v9 was written against; the revision is seven commits, `a5843b5`…`9fff001`.
Prior findings M-01, L-01, L-02 and questions Q-01, Q-02 are verified for disposition; new
observations are drawn **only** from changed text.

## Prior findings — disposition

All three v9 findings are **resolved**, and both v9 questions are answered inside the document. Each
was checked against the revised text and, where it made a claim about another section or about this
repository, against the cited target.

| v9 ID | Sev | Disposition | Evidence in v10.0 |
|----|---|---|---|
| M-01 | Medium | **Resolved by the larger of the two admissible shapes — the table was completed, not the claim scoped** | The revision took shape (2) of my two, and took it in both places the audit failed. (a) **`phase`.** §8.1's §8.3 cell (`:1182`) now names three fields — "`failure-mode-id`; `artifact`, for the row's canonical path; **`phase`**, which the `prevented` test is a function of" — and spells **three arms, one per field**: short of `phase` "the row is likewise still emitted and its **verdict falls to `insufficient-evidence`**, never to a guessed `prevented`". That is exactly the direction I derived from `:1383-1384`, and §8.3 itself was carried back rather than left to the table: consequence 2 (`:1396-1399`) now states "A promotion **record** short of the `phase` field is the same epistemic state and takes the same direction". (b) **`symptom`.** The §8.4 harvest question is now an eighth **reader with its own row** (`:1180`), indexing `symptom`, `artifact`, `phase` and `failure-mode-id`, and §8.4 step 2 (`:1435`) says so from its own side. The counts were carried through consistently — `:1104` "The eight readers", `:1153-1157` the eight-member enumeration, `:1191-1193` "all eight readers … the other four" with the bookkeeping gloss re-derived. I re-checked the field-side direction the claim asserts and it now holds: every one of §8.1's eight fields is named by at least one cell (`target` §5.1/§8.6, `failure-mode-id`/`action`/`route`/`passId` §6.4, `symptom`/`artifact`/`phase` §8.4 steps 2–3, `phase`/`id`/`artifact` §8.3, `artifact` §8.5). (c) The **third outcome I said the document forbade elsewhere** — "skip the record for §8.3", which the general rule at `:1143-1145` literally directed — was closed at its source: the skip rule (`:1155-1161`) now states "Nor is skipping the safe direction where dropping the reader's **output** would itself be read as a decision … because a missing row and an unasked question both move a verdict silently", and settles precedence explicitly: "**Where a cell states an arm, the cell is normative and this rule is its default, not its override**". A test author asked today what a `phase`-short record does has exactly one answer |
| L-01 | Low | **Resolved, and in the durable form I offered second** | The two arms are no longer disposed of by assertion. BR-33a (`:2535`) replaces "indexed by readers whose `route`/`target`/`artifact` arms already carry them" with the principle plus the enumeration: "**Sharing a reader is not sharing an arm**, so the four remaining fields are named rather than folded into another field's", then names `phase`, `failure-mode-id`, `action` and `symptom` with an outcome each — and the one I said was unstateable from the table now has its statement: `failure-mode-id` ⇒ "§8.3 emits **no** row — a row cannot be keyed on an absent id". §14.5 gained **LD-5** (`:2239`) carrying all four with a defective-implementation column, and E-12b (`:2590`) absorbed the same four. This is the repair I described, generalised: the principle is stated before the list, so a ninth field would inherit it |
| L-02 | Low | **Resolved, one token, in the sentence it belonged to** | `:1276` now reads "the rows named here are the **three classes** §13's rows fall into on this axis", and the enumeration was re-punctuated into three parallel arms ("either … , or … , or places a `revise` or `retire` beside an earlier `promote` … **across passes**"). Count and list agree |
| Q-01 | — | **Answered, and answered by building the second register rather than by one clause** | §14.1 gained **T-10** (`:2160`) collecting the TSPEC-owned spellings, and §14.5's lead (`:2225-2231`) states the scoping as deliberate with the boundary named — "deferrals of a *literal* to the layer that pins literals, not of a fixture to the layer that writes fixtures". That is more than I asked for and is the right shape. It is also where my one new Medium lands: the two registers now overlap on two arms and miss the one literal the revision actually introduced (M-01 below) |
| Q-02 | — | **Answered, and the answer is the one that keeps AT-F21 honest** | AT-F21's Given (`:2113`) now pins `phase`, `failure-mode-id` and `symptom` present on all three records alongside `passId`, and names the choice: "this fixture stays at two arms rather than growing a fourth short record, so the `phase` arm's one home is §8.1's reader table for the rule and §14.5 LD-5 for the fixture, never both here and there." The fixture is not stretched, the arm is not double-claimed, and BR-33a's coverage cell stays true |

## Findings

Three findings, all new, all inside text this revision introduced. No unchanged section was
re-litigated. One is **Medium**, and — as in v8 and v9 — it is not a fixture-strength deferral of the
class `DEC-LAYER-01` places below this layer: it is a **new completeness claim** ("Between the two
registers, every deferral this document makes has exactly one home") that the text immediately below
it falsifies, and the arm it mis-files is one whose spelling decides a §15.2 lexicon value. The other
two are Low.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| M-01 | Medium | Local | **§14.5's new lead and its own LD-5 row assign the `phase` and `failure-mode-id` arms to two different owners, three lines apart — and the one "unavailable" literal this revision actually introduced is in neither register.** The revision built a second register (T-10, `:2160`) and declared the two disjoint: §14.5's lead (`:2225-2231`) states "**The scope is PROPERTIES-owned deferrals only** … the *spellings* this document defers to TSPEC … — §8.3's unavailable-path cell and **§8.1's unavailable-`phase`/id arms**, §10.3's `suppressed-by:` unavailable rendering, §6.4's — and §6.5's seam permitted-set widening are **§14.1's, collected there as T-10**, not this table's … Between the two registers, every deferral this document makes has exactly one home." T-10 says the same from its side: "§8.3's unavailable **path** cell and, from §8.1's reader row, its unavailable **`phase`** rendering". **LD-5, in the table that paragraph introduces (`:2239`), claims the same two arms as PROPERTIES-owned**: "**`phase`** (§8.3 emits the row, verdict `insufficient-evidence`), **`failure-mode-id`** (§8.3 emits no row …)". Two homes, not one, for exactly the arms v9's M-01 was about. (a) **The T-10 side is wrong on the merits, not merely duplicative, and its harm is a verdict value.** There is no unavailable-`phase` *rendering* anywhere in the document to defer: §8.1's §8.3 cell (`:1182`) says a `phase`-short record's row "is likewise still emitted and its **verdict falls to `insufficient-evidence`**", and §10.4 item 5 (`:1835`) fixes what that row renders — "one row per distinct `failure-mode-id`, its verdict, and its state" — with no `phase` cell to spell. `insufficient-evidence` is a **§15.2 lexicon value this document pins**, which is the exact opposite of T-10's own criterion ("the spelling of a value this document does not pin is TSPEC's, and §15.2's lexicon owns no such value" — but here it *does* own one). A TSPEC author who follows T-10 as written renders that verdict as a TSPEC-chosen unavailable literal; the row then never carries `insufficient-evidence`, §8.7's streak (`:1543-1546`, N consecutive `insufficient-evidence` evaluated passes ⇒ `unmeasurable`) never accumulates for a `phase`-short promotion, and `unmeasurable` becomes unreachable on that path — the drift-to-silence O-C7 and §8.4 both exist to refuse. The id arm is the same shape: its outcome is "no row and the parse notice", not a spelling. (b) **The register that should have grown a row did not.** The one genuinely TSPEC-owned literal this revision introduced is in §8.1's new §8.4 steps 2–3 cell (`:1180`): short of `symptom`, `artifact` or `phase` the promotion "is **still put to the harvest agent**, on the fields the record does carry, **with the missing half stated as unavailable rather than guessed**". That "unavailable" is undeniably a spelling this document does not pin — and it is in neither T-10 nor §14.5. So the set-equality fails in both directions at once: two false rows in T-10, one missing. **FSPEC-layer repair, no new AT, no new BR, two clauses:** delete `phase`/id from T-10 and from §14.5's lead (they are LD-5's, and LD-5 already states them correctly), and add §8.1's §8.4 steps 2–3 unavailable-half rendering to T-10 in their place. Then "exactly one home" is true as written | §14.5 `:2225-2231`, `:2239`; §14.1 T-10 `:2160`; §8.1 `:1180`, `:1182`; §10.4 item 5 `:1835`; §8.7 `:1543-1546` |
| L-01 | Low | Local | **The new §8.4 steps 2–3 reader's `artifact` arm has no register row, because LD-1 is scoped by reader and the new reader post-dates it.** BR-33a's new principle is explicit — "**Sharing a reader is not sharing an arm**" (`:2535`) — and it is right; but LD-1 (`:2235`) was written before the eighth reader existed and is scoped by reader, not by field: "The `artifact` arms of §8.1's reader rule: **§8.3** emits its row with an unavailable path …, and **§8.5** refuses to guess a `retirement`". LD-5 (`:2239`) enumerates four fields and `artifact` is deliberately not among them. Meanwhile E-12b's Given (`:2590`) now names three readers of `artifact` — "`artifact` for §8.3 / §8.5 **and for §8.4's harvest question**" — while its arm enumeration two sentences later still names two ("The `artifact` arms (§8.3's row emitted with an unavailable path, §8.5's refusal to guess a `retirement`) … PROPERTIES-owned per §14.5 LD-1, LD-4"). By BR-33a's own principle the third is a distinct arm with a distinct observable (the question is still asked on the fields present, vs. a row emitted with an unavailable path) and therefore needs its own home. The behaviour is stated, so nothing is undecidable — this is a gap in a coverage enumeration, not a missing rule, which is why it is Low and not a repeat of M-01. **Repair, one clause:** widen LD-1's scope line to "(§8.3, §8.5 and §8.4 steps 2–3 rows)" with the third observable named, or add `artifact` to LD-5 | §14.5 LD-1 `:2235`, LD-5 `:2239`; BR-33a `:2535`; E-12b `:2590`; §8.1 `:1180` |
| L-02 | Low | Local | **v9's L-01 was repaired for §8.3 and left standing for §8.4 step 1: "the id stays open" cannot describe a record that carries no id.** §8.3's cell now handles this exactly right — "this is the one arm where 'never dropped' cannot apply, because a row cannot be keyed on an id the record does not carry" (`:1182`) — and I closed L-01 on it. But §8.4 step 1's row (`:1179`) is unchanged and still gives one undifferentiated arm for three fields: `failure-mode-id`, `action`, `route` ⇒ "the id stays **open**". For an `action`- or `route`-short record that is exact; for an **id-short** record it is unstateable in the same way §8.3's was — there is no id to be open, and §8.4 step 1's list is a set of ids (AT-F19 `:2111` asserts it by set-equality, so an unnameable member is not assertable). LD-5 nevertheless asserts the `failure-mode-id` arm is "stated in the table", and cites §8.3 and §8.4 steps 2–3 for it — not step 1, whose cell names the field. A test author writing LD-5's `failure-mode-id` property must decide what step 1's computed list contains for an id-less record and the table gives no answer; the safe reading (it contributes no member, and the parse notice is the report) is the one §8.3 and §8.4 steps 2–3 both take, so this is a one-clause transcription, not a decision. **Repair:** split §8.4 step 1's cell as §8.3's was split, or add "an id-less record contributes no member and the notice is the report" to it, and point LD-5's `Observable stated at` at it | §8.1 `:1179`, `:1182`; §14.5 LD-5 `:2239`; AT-F19 `:2111` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The skip rule's new precedence sentence (`:1160-1161`) is the right mechanism — "**Where a cell states an arm, the cell is normative and this rule is its default, not its override**" — but the sentence immediately before it states two cell-level facts in general terms: "§8.3 emits its row on a record short of `artifact` or of `phase`, and **§8.4 still asks its question on the fields present**". §8.1's §8.4 steps 2–3 cell (`:1180`) states the opposite for one field: short of `failure-mode-id`, "no question is asked for it and the notice is the report". The precedence sentence resolves it correctly on a careful read (the cell wins), but the general sentence is the one a reader hits first and it is stated without the qualifier. Is one clause worth spending — "§8.4 still asks its question on the fields present **where the id is present** (`:1180` is normative for the id-short case)"? I am not filing it, because the document does decide it; I am asking because the two sentences are three lines apart and the cheaper of the two readings is the wrong one. |
| Q-02 | LD-5's defective-implementation column (`:2239`) carries three failure modes — a guessed `prevented`, a dropped §8.3 row, a minted/re-slugged id, a dropped id-less notice — but none for its `action` and `symptom` arms, which the Obligation column does state. The column is the part of §14.5 I called an oracle sketch in v9, and for `phase` and `failure-mode-id` it is directly transcribable into falsifying assertions; for `action` ("§6.4's predicate is undecidable, so that contract skips and the promotion is re-proposed") and `symptom` ("the harvest question is still asked on the fields present") the PROPERTIES author has to invert the obligation themselves. Both inversions are obvious — an `action`-short record whose pair is read `enacted` and therefore *not* re-proposed; a `symptom`-short promotion dropped from the question list, which `:1180` already names as "the failure direction". Is leaving them to the author deliberate (the obligation is enough), or is the column meant to be total across the row's four arms? If the latter it is two clauses, and it would keep LD-5 the same quality of artifact as LD-1…LD-4, each of which does state its defect. |

## Positive Observations

- **The M-01 repair was taken at the source, not at the symptom.** I offered two shapes and said (1)
  was the smaller edit; the author took (2) *and* went one step further than either — the general
  skip rule itself was amended (`:1155-1161`) so the third, forbidden outcome I found reachable
  ("skip the record for §8.3") is no longer directed by the default at all, and a precedence rule
  between the default and the cells was stated rather than left to the reader. A spec that repairs
  the rule that produced the contradiction, instead of the two cells that exposed it, does not
  regenerate the same defect at the ninth reader.
- **The eighth reader is a genuine discovery, and it was carried to both of its sides.** §8.4's
  harvest question was always reading three fields off the record; nothing named it a reader until
  this revision. It now has a row (`:1180`), and §8.4 step 2 says so from its own end (`:1435`) —
  "**Steps 2–3 are a reader of the record in their own right — not step 1's — and have their own row
  in §8.1's reader table**". The row's arm also states its *failure direction* with the harm named:
  dropping a short promotion from the question list "would make `recurred` unreachable for that id
  and drift it to `insufficient-evidence` and then `unmeasurable` (§8.7)". That is a positive arm
  paired with the negative it defeats — the shape I ask for in oracles, stated in prose before any
  oracle exists.
- **The `phase` arm was derived from an existing rule rather than invented.** §8.1's cell argues it:
  "a record with no `phase` and a `phase` the §2 mapping cannot decide are the same epistemic state,
  and §8.3's totality rule already fixes that direction for the second, so **this arm inherits it
  rather than adding a concept**". I checked the antecedent — §8.3 consequence 2 (`:1396-1399`) and
  the verdict table's exhaustive third arm (`:1384`) — and the inheritance is sound. An arm that is a
  corollary needs no new fixture to be believed, which is what makes LD-5 an honest deferral rather
  than a parked decision.
- **The id-less record got the one honest exception in the document.** Every other arm ends in "the
  row is never dropped". §8.3's cell (`:1182`) says plainly that this is "the one arm where 'never
  dropped' cannot apply, because a row cannot be keyed on an id the record does not carry" — and then
  reconciles it with §8.3's set-equality obligation instead of leaving the two in tension: "the
  obligation there ranges over the **distinct ids the log carries**, and an id-less record
  contributes none". That reconciliation is what stops a PROPERTIES author from writing a
  set-equality property that the correct implementation fails.
- **Both v9 questions were answered by building something, not by replying.** Q-01 produced T-10 and
  a stated register boundary; Q-02 produced an explicit pin on AT-F21's Given plus a sentence naming
  which register owns the unexercised arm ("never both here and there"). I verified AT-F21 still
  covers exactly the two arms BR-33a claims for it, and it does — the Given grew pins, not arms,
  which is the outcome that keeps the coverage claim true.
- **Grounding spot-checks all passed.** `MERGE_GUARD_DEFAULTS` is at `pdlc/workflows/orchestrate-dev.js:48-53`
  as AT-R6b fixture 3 cites; `docs/_decisions/DECISIONS-spec-layer-boundary.md` exists;
  `pdlc/skills/harvest-learnings/SKILL.md:70-78` is the harvest metadata table §8.3 amends; and
  `docs/_constraints/pdlc-consolidation-vocabularies.md` is at `Version` 1.4, the version §8.3 binds
  to (`:7`). No repo path this revision touched is misdescribed.

## Recommendation

**Needs revision**

All three v9 findings are resolved, and the Medium was resolved by the larger of the two shapes I
offered: the reader table was completed rather than the claim scoped, the arms were carried back into
§8.3 and §8.4 themselves, and the general skip rule was amended so the forbidden third outcome is no
longer reachable from the default. Both v9 questions were answered by construction. Nothing in this
revision re-opens a settled decision, and nothing in it broke a section I had previously approved — I
re-derived the field-side set-equality over all eight fields, re-checked the eight-reader counts at
`:1104`, `:1153-1157` and `:1191-1193`, re-verified the `phase` arm's antecedent at `:1384` and
`:1396-1399`, confirmed AT-F21 still covers exactly the two arms BR-33a claims for it, and re-checked
every repo path the changed text names.

The verdict is **Needs revision on M-01 alone**, and the reasoning is the same shape as v8's and
v9's, applied consistently. `DEC-LAYER-01` puts fixture construction and set-equality *domains* below
this layer, and I have applied that: L-01 and L-02 are gaps in coverage enumerations whose rules are
stated, and they are Low for exactly that reason; LD-1…LD-5 are not findings at all. M-01 is neither.
This revision **made a new completeness claim** — "Between the two registers, every deferral this
document makes has exactly one home" (`:2230-2231`) — and the table three lines below it falsifies
the claim on two arms, while the one literal the revision actually introduced (`:1180`'s "stated as
unavailable rather than guessed") is in neither register. It is load-bearing for testing because the
two registers are precisely where a TSPEC author and a PROPERTIES author are told to look, and here
they are told to look in both: T-10 sends TSPEC to invent a spelling for a `phase`-short §8.3 row
whose verdict this document **pins** to the §15.2 value `insufficient-evidence` (`:1182`, `:1835`
fixing what the row renders), against T-10's own criterion that "§15.2's lexicon owns no such value".
Take that instruction literally and the row never carries `insufficient-evidence`, §8.7's streak
(`:1543-1546`) never accumulates for that promotion, and `unmeasurable` is unreachable on the path —
a silent drift with no oracle, which is the harm §8.4's lookup and O-C7 both exist to refuse.

The repair is two clauses in the two registers, adds no BR and no AT, touches no fixture, and is
fully inside the freeze:

1. **M-01** — delete the `phase` and `failure-mode-id` arms from T-10 (`:2160`) and from §14.5's lead
   (`:2227`); they are LD-5's, and LD-5 already states them correctly. In their place, register the
   literal that is genuinely TSPEC's: §8.1's §8.4 steps 2–3 unavailable-half rendering (`:1180`).
   Then "exactly one home" is true in both directions.
2. **L-01** — widen LD-1's scope line to name the §8.4 steps 2–3 row with its own `artifact`
   observable, or add `artifact` to LD-5, and reconcile E-12b's arm enumeration with the three
   readers its own Given now names.
3. **L-02** — split §8.4 step 1's cell as §8.3's was split ("an id-less record contributes no member;
   the notice is the report"), and point LD-5's `Observable stated at` at it.

Taking (1) clears the verdict. (2) and (3) are Low and may be carried as tracked deferrals per
`DEC-LAYER-01` — though (3) is the residue of a repair this revision already made correctly one row
away, and is a transcription rather than a decision.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 2}
