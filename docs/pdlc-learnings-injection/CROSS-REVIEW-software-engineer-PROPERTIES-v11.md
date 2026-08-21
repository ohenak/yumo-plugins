# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md
**Date:** 2026-08-21
**Iteration:** 11 (delta re-review under DECISION FREEZE — v0.6 → v0.7, the PLAN v0.8 cascade absorption)

## Overview

**What this round is.** A delta re-review under DECISION FREEZE of the revision that answers my v10
confirmation. My v10 was an upstream-cascade confirmation that did **not** approve: PLAN had moved
v0.7 → v0.8 (two-case P-A-7 table → three cases, new **case C** live at HEAD) and PROPERTIES still
asserted case B was live, still listed the two case-B gaps as open, and still pinned PLAN v0.7. This
revision is exactly that absorption and nothing else.

**Scope of the delta.** `git diff 23adb5e5..HEAD` on the document is **67 insertions / 32 deletions**
across three commits — `33c93eb6` (header pin), `b49143a9` (§C.4), `a469ef4b` (§G.3) — touching
three regions only: the header's Upstream row and version cell (line 11, line 18: `0.6` → `0.7`),
§C.4's re-red paragraph plus two new paragraphs, and §G.3's routed-errata list. No property
statement, level, owning task, AT partition, bound, enum, oracle, fixture row or count is inside any
hunk. Per the delta protocol I re-verified my five prior findings and scanned only these regions.

**Answer: all five of my v10 findings are resolved, and the revision breaks nothing.** F-01 (High)
is resolved substantively, not cosmetically: §C.4 now re-derives the obligation under case C, carries
the green-at-landing rule, the empty ledger and the fix-before-batch-14 gate consequence, and
extends the same rule to the Group D `learningsSelect.test.js` amendments. F-02 and F-03 (Medium)
are resolved — §G.3 reads "**Still open — one item**" with both case-B items struck into *Also
answered — by PLAN v0.6/v0.7/v0.8*, and the header pins **v0.8** with the three-case structure.
F-04 (Low) is resolved by a new paragraph that names PROP-BOUND-03's zero case as the one arm not
obviously green and cites case C's fix rule as its cover. F-05 (Low) is resolved incidentally, as
predicted, by the strike of the bullet that carried the paraphrase.

**Verification method — repository, not documents.** `git diff 23adb5e5..HEAD` on PROPERTIES;
exact-substring comparison of every quotation the revision adds against `PLAN-…md` at HEAD
(`:492`, `:493`, `:495–:506`, `:594`, `:610`); `git diff f73046ad..HEAD` on PLAN filtered for
`P-A-6` (0 hits — the "byte-unchanged at v0.8" claim is measured, not asserted);
`git show 21edb7c5:pdlc/workflows/__tests__/learningsBlock.test.js` grepped for
`extractInjectableMaterial(` and `sections).toEqual`; `git log -1` on each of `1544fdbd`,
`d462ddd8`, `2cbacada`, `92b7ea0c`; `shasum -a 256` over all five upstream documents;
`ls pdlc/workflows/__tests__/learnings*.test.js`.

**Upstream pins at HEAD, all five verified this round.** REQ `ff605dd3…`, FSPEC `ae75fa62…`,
TSPEC `22dee8ce…`, DECISIONS `56617f5a…` — byte-identical to what v9/v10 recorded, so no second
cascade is open. PLAN is `sha256:281c60c0…`, version cell `| pdlc | Draft | Claude | 0.8 |`
(`PLAN-…md:18`), which is exactly what the revised header now pins. PROPERTIES itself is
`sha256:e9de08bc…` at `a469ef4b`.

**Freeze discipline.** I record two wording observations as `DEFERRED` lines rather than findings:
neither is a defect this delta introduced nor a contradiction with HEAD, and neither would block.

## Properties

**No property statement moved, and I measured that rather than trusting the commit messages.** The
three hunks of `git diff 23adb5e5..HEAD` are the header (lines 8–18), §C.4 (`:1107`–`:1173`) and
§G.3 (`:1290`–`:1337`). §C.1's 35-of-35 table, §C.2, §C.3's 23-of-23 task reconciliation, and all
seventy `PROP-` statements with their levels and owning tasks lie outside every hunk, so the trace I
approved at v9 stands untouched: every task PLAN's table lists still has PROPERTIES coverage, and
every property still names an owning task and a test file that exists or is planned. I re-listed the
suite directory to confirm the file half at HEAD — all twelve `learnings*.test.js` files §C.4 and
§F.1 name exist (`learningsArmInventory`, `learningsBaselineGuard`, `learningsBlock`,
`learningsCaptureScript`, `learningsConfig`, `learningsCorpus`, `learningsDispatchSet`,
`learningsPredicatePin`, `learningsPremises`, `learningsRecord`, `learningsSelect`,
`learningsSuiteMap`), and none of the properties this revision discusses names a file the PLAN does
not create.

**F-01 (High) — resolved, and resolved with the right premise.** §C.4 now reads "of PLAN's
**three**-case table at v0.8, **case C is the live case** and cases A and B are both behind us",
scopes case B to *"after LI-17 has greened the suite, with a greening batch still ahead (batch 9
through batch 12)"* and case C to *"after batch 13, the case that is live at HEAD"*. Both quotations
are verbatim against `PLAN-…md:492` and `:493`. It then carries the obligation my v10 said was
missing, in PLAN's own words: *"under case C they owe no ledger row, and they owe green"*
(`PLAN-…md:493`, exact match), plus the consequence — a red *"has found a real defect, not staged a
TDD red"*, the fix is owed **before batch 14 runs**, and a red surviving into batch 14 is a gate
failure. The sentence I flagged as carrying the wrong case name now reads "**P-A-7 case C** governs
the amendment commits against the landed *implementation* suites `learningsBlock.test.js` and
`learningsSelect.test.js` — empty ledger, green at landing — while **P-A-6** (byte-unchanged at
v0.8) governs this document's own PROPERTIES suite". The parenthetical is a checkable claim and it
checks: `git diff f73046ad..HEAD` on PLAN contains **zero** lines matching `P-A-6`, so the P-A-6 row
(`PLAN-…md:594`, "commit at the first point the suite is green, which in practice is after LI-21
(batch 13)") is byte-identical across the v0.7 → v0.8 move.

**F-04 (Low) — resolved by a new paragraph that is more than I asked for, and every claim in it is
measured.** "Which of the four is actually green at landing, and what covers the one that may not
be" splits the four correctly:

- **PROP-BOUND-05/07/08 assert shipped behaviour.** The paragraph quotes PLAN's premise
  (`canonicalSectionName` strips an optional ordinal via `SECTION_HEADING_RE`, strips a trailing
  gloss, compares case-sensitively against `BR6_SECTION_NAMES`, returns null for `###`) verbatim
  against `PLAN-…md:493`, and — importantly — does **not** stop at the quotation: it corroborates
  from this document's own landed-suite evidence, the un-numbered `## Cross-Feature Patterns`
  spelling already accepted with `expect(result.sections).toEqual(["Cross-Feature Patterns"])`. I
  re-measured that at the pinned commit: `git show 21edb7c5:pdlc/workflows/__tests__/learningsBlock.test.js`
  carries that exact assertion at line 118 (and again at 139), over the fixture
  `"## Cross-Feature Patterns\n\n" + "a".repeat(100)` at line 110. The claim is true at the pin.
- **PROP-BOUND-03's zero case is named as the arm that may red**, on the stated ground that no
  `extractInjectableMaterial(text, 0)` call exists in the landed suite. Also measured: at `21edb7c5`
  the only three call sites pass `100000` (`:87`), and the two `maxBytes` bindings (`:113`, `:133`),
  which §C.4 elsewhere pins as `40` and `66`. There is no zero call. The document's inference — the
  zero-bound production half (LI-16, `d462ddd8`, a real commit) has never been exercised through this
  seam — follows, and case C's fix-before-batch-14 rule is correctly named as its cover instead of a
  ledger row.

**The Group D extension is new text and it is faithful.** "PLAN's case C extends its ruling to *"any
other amendment to a landed suite arriving from here on"*" is verbatim at `PLAN-…md:493`, and that
sentence does name the Group D `learningsSelect.test.js` amendments alongside the four
`learningsBlock` cases. `LI-07, 1544fdbd` resolves to a real commit ("LI-07 — [red] RED selection
suite (L1, TSPEC §T.5)"). No property changed as a result — the extension moves scheduling, not
content, which is the conclusion §C.4 has held since v0.3 and still reaches.

## Oracles

**No oracle is inside the delta, and the three discipline checks still hold on the changed text.**
§O.1–§O.9, §G.1's obligation table and §O.8's mutation ledger are outside every hunk, and their four
upstream sources (REQ, FSPEC, TSPEC, DECISIONS) are byte-identical to the v9/v10 pins, so the oracle
surface is untouched. I applied the three checks to what the revision *added*, since that is where a
new defect could enter:

- **No implementation echo.** The new §C.4 paragraphs introduce no expected value. The one place
  they touch expected values is a re-statement of the *landed* literals — `40` beside the
  "Hand-computed (never derived here)" comment, `66`, and the non-binding `100000` — which remains a
  transcription of what the suite contains, not a derivation from production code. The green-at-
  landing premise is quoted as PLAN's claim about shipped behaviour and then corroborated against a
  landed **test assertion** (`sections).toEqual(["Cross-Feature Patterns"])`), not against
  `canonicalSectionName`'s source — which is the correct direction: a spec that read its expected
  value out of the implementation would be the echo, and this does not.
- **No absence-only oracle is created.** The delta's absences are absences in *PLAN's ledger*
  ("the ledger stays empty"), not absence-shaped test assertions. The one absence-shaped oracle in
  the neighbourhood, PROP-BOUND-03's zero case, keeps its positive conjunct — the
  `{material: "", bounded: false, bytes: 0, sections: []}` return on the same path — outside the
  hunk and unchanged. Better: the new paragraph strengthens the pairing by saying what happens if
  that positive conjunct does **not** hold (a real defect, fix owed before batch 14), rather than
  leaving the red unexplained.
- **Set-equality, not containment.** §C.1's 35-of-35 and §C.3's 23-of-23 enumerations are outside the
  delta and still reconcile against a PLAN task table the v0.8 erratum did not touch (PLAN's own
  v0.8 changelog, `PLAN-…md:610`: "no task moved batch, no `Deps` edge changed, no AT partition,
  fixture or manifest row was touched, and the batches 7–13 ledger is byte-identical" — I confirmed
  the second half independently at v10 by locating every hunk of `f73046ad..be64a0c6`). §G.3's
  routed-errata list is itself an enumeration, and the revision keeps it closed: three struck items
  under *Also answered — by PLAN*, one live item, and an explicit sentence stating the live item is
  "the **only** item this dispatch emits as a routed erratum line". A struck item cannot be lost
  silently because the strike text carries the resolution.

**F-02 (Medium) — resolved, and the one thing I warned must survive did survive.** §G.3's header now
reads "**Still open — one item**", and the TSPEC AT-15 suite-assignment bullet is present **verbatim**
— clauses 2–3 asserted at L2/L3 while §T.5 lists AT-15 wholly under the L1 selection suite, with the
`learningsSelect.test.js` row / level `L1` citation and the LI-07/LI-19 workaround. TSPEC's pin is
unchanged (`22dee8ce…`), so that item is genuinely still open and correctly still routed. This is the
failure mode I named at v10 ("the last time a bullet was struck from that list the surrounding
sentence went untrue"); it did not recur — the count, the bullet and the closing parenthetical all
agree with each other.

**The two struck bullets record the resolution rather than merely deleting the question.** Both
carry what answered them (case C's *"under case C they owe no ledger row, and they owe green"*, and
case B's re-scope to *"batch 9 through batch 12"* with batch 14's unqualified gate in place of the
span), and both name the DEC-ERR-01 anti-pattern they are avoiding. The second also closes PM's
carried Q-02 by citing PLAN's v0.8 changelog phrase *"answering PM Q-02"* — which is verbatim at
`PLAN-…md:610`. That is the right disposal: the questions leave this document's open list because
upstream decided them, not because they were dropped.

## Fixtures

**§F.1–§F.4 are byte-identical across the delta, and the one fixture-adjacent sentence the revision
adds is faithful to PLAN.** The fourteen-row inventory, the `fixtures/learnings-baseline/` four-path
row (`4a6c1816`), `helpers/learningsFixtures.js` (`1920f281`), §F.2's byte-identity baseline, §F.3's
verbatim-fixture-string rule and §F.4's seam doubles are all outside every hunk.

- **The consumer-exemption sentence tracks PLAN's re-scoping exactly.** §C.4 now says
  `helpers/learningsFixtures.js` and its other consumers carry no row "in **any of the three cases**
  — a ruling PLAN v0.8 scopes to *"**this** heading-form follow-up commit, not a standing exemption
  for those files"*, which this document has never claimed". I compared that against `PLAN-…md:495–496`:
  "carry **no** row of their own in any of the three cases — a ruling scoped to **this** heading-form
  follow-up commit, not a standing exemption for those files (TE v9 F-01)". Verbatim, and the
  self-assessment is true — no earlier revision of §F.1 or §C.4 claimed a standing exemption.
- **The additivity premise the ruling rests on is untouched.** PLAN still carries "The
  declared-heading-form knob is **additive** to `buildLearningsCorpus`'s section spec — the landed
  helper already renders an optional ordinal and an optional gloss, and existing callers that declare
  neither keep byte-identical output" (`PLAN-…md:497–499`), which is the sentence §F.1 leans on. So
  `learningsSelect.test.js`, `learningsCorpus.test.js` and every other consumer hold their status
  across the follow-up commit, and no consumer suite gains a ledger row — unchanged in substance from
  what I approved at v9.
- **The non-additive escape hatch now names both branches.** PLAN's fixture paragraph routes a
  future non-additive helper amendment to case B's rule "or, once batch 13 is behind us, under
  **case C**, where the obligation is green-at-landing rather than a ledger row. That is the branch
  the PROPERTIES amendments §C.4 routes here fall under" (`PLAN-…md:503–506`). PROPERTIES' §C.4 now
  reads the same way. The two documents agree on which branch is live.
- **§F.3's verbatim-fixture rule is unaffected.** Nothing in the delta pins a user-facing string,
  moves a normative lexicon entry, or paraphrases a fixture body. The `## Cross-Feature Patterns`,
  `## Rejected Proposals` and `## Process Findings` spellings §C.4 discusses are reproduced exactly
  as the landed suite and PLAN's LI-08 row spell them, including the canonical glossed
  `"Rejected Proposals (with rationale)"`.

**Fixture-side conclusion: the cascade half that was clean at v10 is still clean at v11.** No fixture
row, path, hash pin or consumer status moved, and the `21edb7c5` snapshot pin that protects the
fourteen-row reconciliation from going stale is still in place and still resolves to a real commit.

## Findings

No blocking findings. My five v10 findings are resolved (F-01 High, F-02/F-03 Medium, F-04/F-05 Low),
and the delta introduces no defect and no contradiction with the repository at HEAD or with PLAN v0.8.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | None | — |

Under the freeze, two wording observations are recorded rather than filed:

DEFERRED: §C.4's P-A-6 paragraph still says the PROPERTIES suite's own red "rows are amended into the ledger by name first, under the same P-A-7 rule" — inherited text that under case C would instead be an empty ledger plus a fix owed before batch 14; harmless because the sentence defers to P-A-7 generically, but a future revision could name the case.
DEFERRED: §G.3's struck case-B bullets quote case B's span as "every batch from the landing batch through the batch that greens them" where PLAN reads "every batch from the one the commit lands in through the batch that greens them" — the carried v10 F-05 paraphrase, now inside strikethrough text preserved as a historical record of the item as raised.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v10, now bookkeeping rather than a gate question: do the four owed `learningsBlock.test.js` amendments and the Group D `learningsSelect.test.js` amendments land in the PROPERTIES suite's own commit (P-A-6's window, open since `92b7ea0c`) or in a separate commit? Case C makes the answer cost-free either way — no ledger row in both readings — so nothing blocks on it. |
| Q-02 | If PROP-BOUND-03's zero case does red at landing, case C owes the fix "before batch 14 runs". Does that fix commit belong to LI-16's owner (the zero-bound production half) or to whoever lands the amendment? PLAN's call, no property text depends on it. |

## Positive Observations

- **The High finding was resolved by re-derivation, not by search-and-replace.** I asked for case C
  to be substituted for case B; the revision instead re-argues the paragraph from case C's premises
  and adds the two things a substitution would have missed — which of the four arms is actually green
  at landing, and what covers the one that may not be. That is the difference between a document that
  quotes upstream and one that has absorbed it.
- **Every quotation it added is verbatim.** I diffed all six against PLAN at HEAD (`:492`, `:493`,
  `:495–496`, `:610`) and each matches character-for-character, including the awkward ones. A
  document that quotes accurately when the quotations are long is one whose unquoted claims are worth
  more trust.
- **The one claim I could have let pass on authority, it made checkable.** "**P-A-6** (byte-unchanged
  at v0.8)" is a measurable assertion about a diff, and it measures true: zero `P-A-6` lines in
  `git diff f73046ad..HEAD` on PLAN. It would have been easier and weaker to write "P-A-6 still
  governs".
- **§G.3's arithmetic is self-consistent this time.** Header count, struck bullets, surviving bullet
  and the closing parenthetical all agree — and the parenthetical states the invariant explicitly
  ("the **only** item this dispatch emits as a routed erratum line"), which is what makes the next
  strike safe. The v0.2 orphaned-bullet episode the section itself records did not repeat.
- **The Group D extension was not forced by any finding.** My v10 F-01 named the four `learningsBlock`
  cases; the revision noticed that case C's "any other amendment to a landed suite arriving from here
  on" reaches the Group D `learningsSelect.test.js` amendments too, and carried the obligation there
  as well. Volunteered scope that closes a gap rather than opening one.
- **Five rounds of pins, all still measured.** `21edb7c5`, `1544fdbd`, `d462ddd8`, `2cbacada`,
  `92b7ea0c`, `5e522a52`, `eb32d7d2` all resolve to real commits, and the assertions attributed to
  `learningsBlock.test.js` at `21edb7c5` are there at the lines claimed.

## Recommendation

**Approved.**

The delta does exactly what my v10 said must change, in the three places it said to change them, and
touches nothing else. §C.4 now governs the four owed `learningsBlock.test.js` cases and the Group D
`learningsSelect.test.js` amendments under P-A-7 **case C** — empty ledger, green at landing, fix
owed before batch 14 if one reds — and distinguishes the three arms that assert shipped behaviour
from PROP-BOUND-03's zero case, which it names as the one that may red and covers by case C's fix
rule rather than by an imagined ledger row. §G.3 carries **one** open item, the TSPEC AT-15
suite-assignment mismatch, verbatim and correctly still routed. The header pins PLAN **v0.8** and
states the three-case structure.

No property, level, owning task, AT partition, bound, oracle, fixture row or trace moved: §C.1
(35/35), §C.2, §C.3 (23/23) and the seventy `PROP-` statements are outside every hunk and still
reconcile against a PLAN task table the v0.8 erratum did not touch. All five upstream pins are
verified at HEAD, and the four non-PLAN ones are byte-identical to what my v9 approval recorded, so
no second cascade is open. This document is once again a faithful compression of its upstreams.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
