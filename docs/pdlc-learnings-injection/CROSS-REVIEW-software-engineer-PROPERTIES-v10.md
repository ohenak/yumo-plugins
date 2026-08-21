# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 10 (upstream-cascade confirmation — PROPERTIES bytes unchanged; PLAN moved v0.7 → v0.8)

## Overview

**What this round is.** An upstream-cascade confirmation, not a re-review. The bytes of
`PROPERTIES-pdlc-learnings-injection.md` have not moved since my v9 approval —
`shasum -a 256` still returns `3e9fdf8b…`, matching v9's `APPROVAL-HASH`, and
`git log -1 --format=%H` on the file is still `23adb5e5`, matching v9's `REVIEWED-COMMIT`.
What moved is **PLAN**. My v9 approval recorded `UPSTREAM-STATE: PLAN sha256:b9fbd3ea…`
(commit `f73046ad`, PLAN v0.7); PLAN at HEAD is `sha256:281c60c0…` (commit `be64a0c6`, **v0.8**).
The one question I answer: is this PROPERTIES still a faithful compression of PLAN as it now stands?

**Answer: no, in three places, one of them load-bearing.** The other four upstream pins
(REQ `ff605dd3…`, FSPEC `ae75fa62…`, TSPEC `22dee8ce…`, DECISIONS `56617f5a…`) are byte-identical to
the ones v9 recorded, so REQ/FSPEC/TSPEC/DECISIONS fidelity is untouched and I did not re-open it.

**The delta.** `git diff f73046ad..be64a0c6` on PLAN is **10 insertions / 5 deletions**, all inside
*Amendment commits on landed suites (P-A-7)* plus the version cell and one changelog row:

1. The version cell: `0.7 / 2026-08-20` → **`0.8 / 2026-08-21`**.
2. **Case A** gains a derivation of its "before batch 7" window (batches 2–6 carry no ledger at all;
   their red reason is the earlier one). Its ruling — no row — is unchanged.
3. **Case B is re-scoped.** Its trigger column now reads "after LI-17 has greened the suite, **with a
   greening batch still ahead** (batch 9 through batch 12)", and its span is annotated "well-formed
   only while a greening batch remains ahead, which is why case C exists".
4. **New case C**, and it is the case PLAN says is live at HEAD: "after batch 13, the case that is
   live at HEAD … **None — and the amendment is expected to land green.**" It states in terms that
   *"Case B's span therefore has no terminus here and does not apply"*, replaces the span with batch
   14's unqualified gate, and closes by naming **this document's own routed re-reds** —
   "the PROPERTIES-driven re-reds §C.4 of PROPERTIES routes to this PLAN (PROP-BOUND-03's
   `maxBytesPerDocument <= 0` case, PROP-BOUND-05/07/08, and the Group D amendments to the landed
   `learningsSelect.test.js`): under case C they owe no ledger row, and **they owe green**".
5. The fixture-consumer paragraph scopes its "no row of their own" ruling to this follow-up commit
   and adds the case-C branch.
6. A v0.8 changelog row recording the erratum and stating it answers PM Q-02.

**Why that cascades here.** §C.4 and §G.3 of PROPERTIES do not merely mention P-A-7 — they lean on
its *shape*. §C.4 states, in the document's own words, that under "PLAN's two-case follow-up table …
**case B is the live case and case A is unreachable**", derives from case B's wording the two gaps it
routes, and never records a green-at-landing obligation. §G.3 carries both of those gaps under
**"Still open — three items"**. The header's upstream row pins PLAN "(v0.7 — … the *Amendment
commits on landed suites (P-A-7)* two-case table was added at **v0.6** and is unchanged at v0.7)".
Every one of those is a statement about upstream that upstream no longer makes: the table is not
two-case, case B is not live, and the two "still open" items are exactly what PLAN v0.8's changelog
records itself as answering. Under DEC-ERR-03 those are findings of this confirmation.

**Verification method.** `shasum -a 256` on PROPERTIES and on all five upstream documents;
`git rev-list` over PLAN's history with a per-commit `shasum` to locate the blob my v9 approval named
(`b9fbd3ea` → `f73046ad`); `git diff f73046ad..be64a0c6` on PLAN; exact-substring greps of PLAN's
case A/B/C rows and its v0.8 changelog row; `sed -n` over PROPERTIES §C.4 (`:1052–1167`) and §G.3
(`:1235–1305`) and its header row (`:11`); `git diff 23adb5e5..HEAD` over PROPERTIES (empty).
I re-verified no code claim this round: no code claim in the document is downstream of the PLAN edit.

## Properties

**No property statement is invalidated.** I re-read the ten groups' claim text against the PLAN
delta: nothing in the edit touches a level, an owning task, an AT partition, a bound, an enum, a
scale or a return type, and PLAN's own changelog says so explicitly ("no task moved batch, no `Deps`
edge changed, no AT partition, fixture or manifest row was touched, and the batches 7–13 ledger is
byte-identical"). I confirmed the second half independently: the diff's five hunks are the version
cell, the case A/B/C rows, the fixture-consumer paragraph and one changelog row — the batch ledger
tables are outside every hunk. So §C.1 (35/35), §C.2 and §C.3 (23/23 tasks) still reconcile against
the same PLAN task table, and the document's 70 `PROP-` ids still each have an owning task.

**What is invalidated is §C.4's account of *when and under what rule* four of them may land.**
Four properties — PROP-BOUND-03 (the `maxBytesPerDocument <= 0` case), PROP-BOUND-05, PROP-BOUND-07
and PROP-BOUND-08 — are, by §C.4's own measurement at `21edb7c5`, amendments to the **landed**
`learningsBlock.test.js`, and the Group D properties amend the landed `learningsSelect.test.js`.
That measurement is unchanged and still true. What changed is the rule that governs the commit
carrying them:

- **§C.4 says case B governs.** Verbatim: "under PLAN's two-case follow-up table … case B is the
  live case and case A is unreachable", and it derives the two gaps it routes from case B's wording
  ("the named row covers `LI-AT-11`'s heading-form cases only … its span ends at 'the batch that
  greens them', which no remaining batch is").
- **PLAN v0.8 says case B does not apply.** Case B's trigger is now bounded to "batch 9 through
  batch 12", and case C states of the post-batch-13 world: "Case B's span therefore has no terminus
  here and does not apply." HEAD is post-batch-13 — LI-21 is landed at `92b7ea0c`, which §C.4 itself
  measured and which case C names.
- **PLAN v0.8 places a new obligation on exactly these four properties, and the document does not
  carry it.** Case C names them by id and rules: "under case C they owe no ledger row, and **they owe
  green**." It goes further — "If such an amendment nonetheless lands **red**, it has found a real
  defect, not staged a TDD red: there is no later batch to name in a ledger row, so the fix commit is
  owed **before batch 14 runs**, and a red surviving into batch 14 is a gate failure."

That is a live, actionable scheduling instruction with a gate consequence, and PROPERTIES now states
its opposite premise. An author writing the PROPERTIES suite from this document would read §C.4 and
wait for PLAN to name ledger rows that PLAN has now ruled will never be written, or stage a red that
batch 14's unqualified gate fails. That is **F-01**, and it is the reason this confirmation does not
approve. The fix is a §C.4 rewrite of one paragraph — not a property change: re-attribute the four
to **case C**, state the green-at-landing obligation and the before-batch-14 fix rule, and keep the
conclusion §C.4 already reaches ("no property in this document changes either way"), which case C
independently confirms.

**Case C's green-at-landing premise is technically sound, and I checked it rather than inheriting
it.** PLAN grounds it on `canonicalSectionName` already shipping F-O-1's second rule. I re-measured
the same production surface I measured at v8/v9: `SECTION_HEADING_RE`'s `^##[ \t]+` anchor cannot
match a `###` line, `BR6_SECTION_NAMES` is compared case-sensitively, and the optional ordinal and
trailing gloss are stripped. So PROP-BOUND-05's and PROP-BOUND-07's heading-form arms should indeed
land green. **PROP-BOUND-03's zero case is the one I would not assume green** — §C.4's own
measurement is that no `extractInjectableMaterial(text, 0)` call exists in the landed suite, and
PLAN v0.7 named LI-16 the owner of TSPEC §D.5's zero-bound production half. Case C's rule handles
that cleanly (a red there is a real defect owed a fix before batch 14, not a ledger row), but the
document should say so rather than leave a reader to infer it — that is **F-04**, Low, and it is a
completeness point inside the same paragraph F-01 already reopens.

## Oracles

**No oracle moved, and none is downstream of the PLAN edit.** §O.1–§O.9, §G.1's obligation table and
§O.8's mutation ledger derive from FSPEC, TSPEC and DECISIONS — all four of those pins are
byte-identical to the ones my v9 approval recorded — so the oracle surface is untouched by this
cascade. I re-ran the three discipline checks anyway against the one thing the edit could plausibly
disturb, PLAN's ledger semantics, and all three hold:

- **No implementation echo.** PLAN's edit introduces no expected value and moves none. §G.2.2's
  hand-computed 40/66 derivation and the landed suite's "Hand-computed (never derived here)" label
  are outside the diff, and case C's premise sentence is a claim about production behaviour, not a
  value this document may assert.
- **No absence-only oracle is created.** Case C's ruling is "no ledger row", which is an *absence in
  PLAN's table*, not an absence-shaped assertion in a test. The one absence-shaped oracle nearby,
  PROP-BOUND-03's zero case, keeps its positive conjunct — the `{material: "", bounded: false,
  bytes: 0, sections: []}` return on the same path — unchanged.
- **Set-equality, not containment.** Untouched; the LI-AT-30 citations §C.4 carries are into
  `learningsConfig.test.js`, which the PLAN edit does not mention.

**I did verify case C's production-behaviour claim, because PROPERTIES will inherit it.** PLAN
asserts that F-O-1's second rule is already shipped, and the four owed heading-form arms therefore
assert shipped behaviour. At HEAD, `pdlc/workflows/orchestrate-dev.js:2242` is verbatim
`const SECTION_HEADING_RE = /^##[ \t]+(?:\d+\.[ \t]*)?(.*?)[ \t]*$/;` — `^##` followed by a required
`[ \t]+` cannot match a `###` line, since the third `#` is not whitespace, so the `###`-as-body case
is genuinely shipped. `canonicalSectionName` (`:2248–:2255`) tries an exact `BR6_SECTION_NAMES`
membership first (case-sensitive — `includes` on an array of strings, no folding anywhere), then
strips a trailing gloss from both sides via `GLOSS_RE` (`:2243`) and re-compares. So the un-numbered
and un-glossed spellings canonicalise and `## Process Findings` returns `null`. PLAN's premise is
correct as written, and the document may compress it without qualification.

**One oracle-adjacent consequence the rewrite must not lose.** §G.3's third "still open" item — the
TSPEC AT-15 suite-assignment mismatch — is **not** touched by the PLAN edit and remains genuinely
open: it is a TSPEC item, its subject is §T.5's suite table, and TSPEC's pin is unchanged. When
§G.3's header count drops from three to one, that bullet must survive verbatim. I flag this here
because the last time a bullet was struck from that list the surrounding sentence went untrue and had
to be re-labelled a round later — the document records that episode itself, in the same bullet.

## Fixtures

**No fixture obligation moved, and this is the half of the cascade that comes through clean.**
§F.1–§F.4 are byte-identical, and the PLAN hunk that touches fixtures — the
`helpers/learningsFixtures.js` paragraph — preserves its ruling and its premise exactly:

- **The additivity premise is unchanged.** PLAN still says the declared-heading-form knob is
  "**additive** to `buildLearningsCorpus`'s section spec — the landed helper already renders an
  optional ordinal and an optional gloss, and existing callers that declare neither keep
  byte-identical output". That is the sentence §F.1 and §C.4 lean on, and it is outside the diff.
  So `learningsSelect.test.js`, `learningsCorpus.test.js` and every other consumer still hold their
  status across the follow-up commit, and no consumer suite gains a ledger row.
- **The ruling still lands the same way, by a different route.** Before: consumers carry "no row of
  their own in **either** case". Now: "in **any of the three cases**", with the ruling scoped to this
  heading-form follow-up commit rather than reading as a standing exemption, and with the non-additive
  escape hatch re-pointed — "or, once batch 13 is behind us, under **case C**, where the obligation is
  green-at-landing rather than a ledger row." The outcome for every fixture row in §F.1 is identical.
- **The fourteen-row inventory is untouched.** PLAN's §File-ownership manifest is outside the diff
  (PLAN's own changelog: "no … fixture or manifest row was touched"), so §C.4's fourteen-versus-
  fourteen reconciliation against it still holds, including the `fixtures/learnings-baseline/`
  four-path row (`4a6c1816`) and `helpers/learningsFixtures.js` (`1920f281`). The `21edb7c5` snapshot
  pin still protects it from going silently stale.
- **§F.3's verbatim-fixture-string rule is unaffected.** Nothing in the PLAN edit pins a user-facing
  string or moves a normative lexicon entry.

**One wording consequence for the rewrite.** §C.4's phrase "the two mechanisms stay distinct … as
this document has held since v0.3: **P-A-7 case B** governs the amendment commit against the landed
*implementation* suite `learningsBlock.test.js`, while **P-A-6** governs this document's own
PROPERTIES suite" is still *structurally* right — two mechanisms, one for the amendment and one for
the PROPERTIES suite's own commit — but its left-hand name is now wrong: the governing case for an
amendment landing today is **C**, not **B**. The P-A-6 half is unchanged and still verifies: PLAN's
P-A-6 row reads "commit at the first point the suite is green, which in practice is after LI-21
(batch 13)", and case C's own text confirms that window is open ("LI-16 (`d462ddd8`), LI-17
(`2cbacada`) and LI-21 (`92b7ea0c`) are all landed"). So the fix is a substitution inside one
sentence, not a re-argument — which is the shape I would want a cascade fix to have.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | §C.4 states "case B is the live case and case A is unreachable" under "PLAN's two-case follow-up table". PLAN v0.8 bounds case B to batches 9–12 and rules of HEAD "Case B's span therefore has no terminus here and does not apply"; **case C** governs, names PROP-BOUND-03/05/07/08 and the Group D `learningsSelect.test.js` amendments by id, and binds them: "they owe no ledger row, and **they owe green**", with a red owed a fix "before batch 14 runs" and a red surviving into batch 14 a gate failure. The document carries neither the case name nor the obligation | §C.4, "PLAN's two-case follow-up table" paragraph |
| F-02 | Medium | delta | local | §G.3's "**Still open — three items**" carries the two P-A-7 case-B items that PLAN v0.8's changelog records itself as answering ("Case B is re-scoped to batches 9–12 … new case C governs … the PROPERTIES re-reds §C.4 routes here … are routed to case C (TE v9 F-01)"). Leaving them listed as open re-routes a question upstream has decided — the DEC-ERR-01 anti-pattern this same section invokes twice | §G.3, "Still open — three items" |
| F-03 | Medium | delta | local | The header's upstream row pins PLAN "(v0.7 — … the *Amendment commits on landed suites (P-A-7)* two-case table was added at **v0.6** and is unchanged at v0.7 …)". PLAN at HEAD is v0.8 (`sha256:281c60c0…`) with a three-case table, so the pin is stale and the parenthetical asserts a structure upstream no longer has | Header, Upstream row (line 11) |
| F-04 | Low | delta | local | §C.4 quotes case B's retired span ("the landing batch through the batch that greens them") and derives its two routed gaps from it. PLAN now annotates that span "well-formed only while a greening batch remains ahead". In the same rewrite, PROP-BOUND-03's zero case deserves an explicit word: §C.4's own measurement is that no `extractInjectableMaterial(text, 0)` call is landed and PLAN v0.7 named LI-16 the owner of the zero-bound production half, so unlike the heading-form arms it is not obviously green-at-landing — case C's fix-before-batch-14 rule covers it, but the document should say so rather than leave it inferred | §C.4, quoted case-B span |
| F-05 | Low | inherited | nonlocal | My v9 F-01, unaddressed and now overtaken: §G.3's second case-B bullet quotes PLAN as "every batch from the landing batch through the batch that greens them" where PLAN v0.7 read "every batch from the one the commit lands in through …". F-02 strikes that bullet, which resolves this incidentally — recorded so the ledger closes it rather than losing it | §G.3, second case-B bullet |

FINDING: High | delta | local | §C.4, "PLAN's two-case follow-up table" paragraph | §C.4 attributes the four owed Group-B/D amendments to P-A-7 case B and calls it "the live case"; PLAN v0.8 bounds case B to batches 9–12, states it "does not apply" at HEAD, and puts these properties under case C by name, which owes no ledger row but owes green at landing — an obligation the document does not carry, and whose absence would have an author stage a red that batch 14's unqualified gate fails
FINDING: Medium | delta | local | §G.3, "Still open — three items" | Both P-A-7 case-B items are answered by PLAN v0.8's case C, which its changelog names as the resolution; keeping them under "Still open" re-routes a decided question, and the header count must drop to one while the TSPEC AT-15 bullet survives verbatim
FINDING: Medium | delta | local | Header, Upstream row (line 11) | The upstream row pins PLAN v0.7 and asserts the P-A-7 table is two-case and unchanged; PLAN at HEAD is v0.8 with a three-case table, so both the pin and the structural claim are stale
FINDING: Low | delta | local | §C.4, quoted case-B span | §C.4 quotes case B's retired span wording and derives its routed gaps from it; the rewrite should also say explicitly that PROP-BOUND-03's zero case is the one arm not obviously green at landing, and that case C's fix-before-batch-14 rule is what covers it
FINDING: Low | inherited | nonlocal | §G.3, second case-B bullet | Carried v9 F-01: a paraphrase of PLAN's case-B span presented inside quotation marks; F-02's strike of that bullet resolves it

## Questions

| ID | Question |
|----|---------|
| Q-01 | Case C rules that the PROPERTIES-driven amendments "owe green". PROP-BOUND-03's zero case is the one that may not be — no `extractInjectableMaterial(text, 0)` call is landed and LI-16 owns the zero-bound production half. If it lands red, case C says that is a real defect owed a fix before batch 14. Does the PROPERTIES suite's own commit (P-A-6, "the first point the suite is green, which in practice is after LI-21") therefore have to carry that production fix in the same commit, or does the fix precede it? This is PLAN's call and blocks no property text, but the rewrite of §C.4 reads better if it can state the answer. |
| Q-02 | Unchanged and still PLAN's: with P-A-6's window open and case C now governing the amendment, do the four owed Group-D amendments to `learningsBlock.test.js` land in the PROPERTIES suite's own commit or a separate one? Case C makes the answer cheaper — either way no ledger row is owed — so this is now bookkeeping rather than a gate question. |

## Positive Observations

- **The erratum answered the two items I routed, in the form I asked for.** Both of my v8/v9 case-B
  routings — the unnamed row for PROP-BOUND-03's zero case and the span with no terminus — are
  answered by one construct rather than patched twice, and PLAN's changelog names them explicitly.
  The gap is only that PROPERTIES has not yet absorbed the answer.
- **Case C names the downstream properties by id.** PLAN could have stated a general rule and left
  the mapping to be re-derived; instead it writes "PROP-BOUND-03's `maxBytesPerDocument <= 0` case,
  PROP-BOUND-05/07/08, and the Group D amendments to the landed `learningsSelect.test.js`". That
  makes this confirmation mechanical and makes the §C.4 rewrite a substitution rather than an
  argument.
- **The premise case C rests on is checkable, and it checks out.** `SECTION_HEADING_RE`'s `^##[ \t]+`
  anchor cannot match `###`, and `canonicalSectionName` compares case-sensitively before and after
  gloss-stripping (`orchestrate-dev.js:2242–2255`). PLAN asserted shipped behaviour and the behaviour
  is shipped.
- **The blast radius is genuinely small.** No property, level, owning task, oracle, fixture, count or
  trace is disturbed — three passages in two sections plus a version pin. §C.1/§C.2/§C.3 reconcile
  unchanged against a task table the edit did not touch.
- **Case A's window is now derived rather than asserted**, and the fixture-consumer ruling is scoped
  to this commit rather than reading as a standing exemption. Neither was forced by my findings; both
  make the section harder to misread.

## Recommendation

**Needs revision.**

PROPERTIES' own bytes are still sound — every property, oracle, level, fixture and trace I approved
at v9 stands, and four of the five upstream pins are unmoved. But it is no longer a faithful
compression of PLAN: it names a case that upstream has bounded away from HEAD, it omits the
green-at-landing obligation upstream now places on four of its own properties by id, it lists two
items as open that upstream has answered, and its version pin asserts a table shape that no longer
exists.

Exactly what must change, in one revision, touching nothing else:

1. **§C.4** — replace "under PLAN's two-case follow-up table … case B is the live case and case A is
   unreachable" with case C: three cases; case B bounded to batches 9–12; case C live at HEAD; the
   four (plus Group D) owe **no ledger row** and **owe green**; a red is a real defect owed a fix
   before batch 14 runs. Fix the "P-A-7 case B governs the amendment / P-A-6 governs this suite"
   sentence to read case C on the left. Keep §C.4's existing conclusion — no property changes either
   way — which case C independently confirms.
2. **§G.3** — strike both P-A-7 case-B bullets into the "Answered by PLAN" group with case C named as
   where they landed, and change the header from "Still open — three items" to one item. The TSPEC
   AT-15 bullet is untouched by this edit and must survive verbatim.
3. **Header, line 11** — repin PLAN to v0.8 and restate the parenthetical: three-case table, case C
   added at v0.8 and governing the post-batch-13 amendments this document routes.

## Verdict

TBD
