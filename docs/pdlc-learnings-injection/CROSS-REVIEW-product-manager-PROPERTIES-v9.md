# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 9 (delta re-review under DECISION FREEZE — PROPERTIES v0.5 → v0.6)

**UPSTREAM-STATE at this review:** REQ (v0.9) · FSPEC (v0.13) · TSPEC (v0.9) · DECISIONS · PLAN
(v0.7, unchanged since my v7) · PROPERTIES under review **v0.6** (was v0.5), branch
`feat-pdlc-learnings-injection` at `23adb5e5`, previously reviewed at `7ac7fe8b`.

## Overview

**The question.** At v8 I raised one High finding and two Low ones, all three inside §C.4's HEAD
accounting and §G.3's routed-errata list. F-01: §C.4's closing sentence claimed two newly found gaps
in PLAN's P-A-7 case B were *"routed as errata rather than decided here"*, while §G.3 — the list that
does the routing — still read *"Still open — one item, re-routed this round"* and carried neither, so
the sentence was false and the gaps reached no author from this document. F-02: the P-A-6 citation was
punctuated as a quotation but substituted *it* for *the suite*. F-03: four bare `file:line` anchors
(`learningsConfig.test.js:226`/`:242`/`:258`, `.gitignore:13`) with no quoted text beside them, a Low
`Process` item under `DEC-DOC-01`. This round measures v0.6 — 32 insertions / 10 deletions across two
commits (`2769ce86` §G.3, `23adb5e5` §C.4) — against those three findings and against the repository
at `23adb5e5`.

**All three findings are resolved, and the High one is resolved exactly as specified.** §G.3 now reads
*"Still open — three items:"* and carries both P-A-7 case-B gaps as their own bullets ahead of the
AT-15 item, each stating the gap, the evidence at the pinned commit, and an explicit *"this document
routes the gap and decides nothing"* disclaimer that keeps PLAN's call unprejudged — which is what my
v8 Q-01 asked for. §C.4's sentence needed no edit and got none; it is now true because the list
carries what it asserts. F-02's quote is restored verbatim (*"the first point the suite is green"*,
matching PLAN P-A-6). F-03's anchors are replaced by the three `test(` titles quoted in full and by
the rule text `/.baseline-worktree/`.

**The delta also absorbs SE v8 F-02, and the absorption is a correction I got wrong at v8.** My v8
Oracles section endorsed §C.4's claim that `learningsBlock.test.js` *"carries no un-numbered
`## Cross-Feature Patterns` … arm"*. That was too strong: the spelling does appear, and the suite
asserts the matcher accepts it. v0.6 narrows the claim rather than restating it — the un-numbered
spelling *does* appear as LI-AT-05's material and LI-AT-12's fixture text, with
`expect(result.sections).toEqual(["Cross-Feature Patterns"])` proving acceptance, so *"what is owed
there is the variant fixture as a whole, not that spelling"*. I re-measured the file and the narrowed
claim is correct in every conjunct.

**Nothing else moves, and nothing broke.** No property, oracle, fixture, AT id, severity, group
membership or red/green trace changed. §C.4's count table (70 / 35 / 23 / 21 / 12) and the fourteen-row
inventory are byte-unchanged, and the `21edb7c5` pin is still honest: `git diff --name-status 21edb7c5
HEAD` returns only this PROPERTIES document and the two v8 cross-reviews — no test file has landed
since the pin.

**One Low finding, delta-introduced.** §G.3's second new bullet quotes PLAN case B as *"every batch
from the landing batch through the batch that greens them"*; PLAN reads *"every batch from the one the
commit lands in through the batch that greens them"* (PLAN line 492). Same meaning, not verbatim — the
same class as v8's F-02, fixed in one place and reintroduced in another. Low, non-gating, recorded
below.

## Properties

**No property moves, and none is disturbed.** The diff touches the version cell (0.5 → 0.6), three
sentences of §C.4 and §G.3's still-open list. No property id, no `red LI-xx` / `green LI-yy` trace, no
AT id, no severity and no group membership changed. §C.4's reconciliation table — 70 properties, 35
ATs, 23 tasks, 21 owning tasks, 0 properties with no owning task, 12 fail-open arms — is
byte-unchanged, as is §C.3's 23-of-23 task accounting and the fourteen-row inventory whose adding
commits I re-derived and matched fourteen-for-fourteen at v8.

**Every task in PLAN's table still traces.** The delta adds no property and removes none, so the
23-of-23 accounting I verified at v7 and v8 stands unchanged. The two ids the delta names in prose
verify at HEAD: LI-17 is `2cbacada` (*"GREEN the renderer. renderLearningsBlock({selected})…"*) and
LI-21 is `92b7ea0c` (*"GREEN the run wiring and the report key. In main(): re…"*), both on the branch,
which is what makes §G.3's second bullet's premise — *"no remaining batch greens them"* — a statement
about the repository rather than a conjecture.

**The one property the new §G.3 bullets speak for is correctly identified, in both of its two names.**
Bullet 1 attributes the uncovered re-red to *"PROP-BOUND-03's `maxBytesPerDocument <= 0` case"*, while
§C.4 line 1129 calls the same case *"PROP-BOUND-03's `maxBytes <= 0` case"*. Both readings are right in
their own frame and neither is a drift: PROP-BOUND-03 is stated *"over every non-negative
`maxBytesPerDocument`, zero included"* (PROPERTIES line 235) — the REQ §4.1 configuration threshold —
whereas `maxBytes` is the parameter name of the unit the property falsifies, `extractInjectableMaterial(text, maxBytes)`
(PLAN LI-16 uses exactly *"`maxBytes <= 0` is tested _before_ the cut"*, PLAN line 156). A reader who
greps either spelling reaches the same property.

**The gap bullet 1 asserts is real at the pin, and I re-measured it rather than reading it.** The claim
is that at `21edb7c5` the landed suite *"carries no `extractInjectableMaterial(text, 0)` call at all"*.
Running `git show 21edb7c5:pdlc/workflows/__tests__/learningsBlock.test.js | grep
extractInjectableMaterial` returns exactly three call sites — `(text, 100000)`, and twice
`(text, maxBytes)` with `maxBytes` bound to `40` and `66`. No zero-bound call exists, so PROP-BOUND-03's
zero case genuinely re-reds committed green code with no ledger row standing for it. That is a true
statement about PLAN, correctly routed upward rather than decided here.

**PROP-BOUND-03's own downstream traces are untouched by the delta and still hold**: the coverage matrix
rows `AT-11 → PROP-BLOCK-02, PROP-BOUND-03, PROP-BOUND-05`, `AT-12 → PROP-BOUND-03`, `AC-2.3 →
PROP-BLOCK-02, PROP-BOUND-03/05/07/08`, and the red/green pair `LI-08` (red) / `LI-17` (green) are all
byte-identical to the version I approved these rows in.

## Oracles

**No oracle statement changed.** §O.1–§O.10 are byte-identical. All movement is in §C.4's account of
which oracles are *owed* to landed suites — the account I over-endorsed at v8 and which this delta
corrects — and in §G.3's routing of the two consequences.

**The narrowed absence claim is right in every conjunct, re-measured at HEAD.** v0.6 replaces the flat
"carries none of these four" with a case-by-case statement. Each part verifies against
`pdlc/workflows/__tests__/learningsBlock.test.js`:

| Claim in v0.6 §C.4 | Verified at HEAD |
|---|---|
| no un-glossed `## Rejected Proposals` arm; *"the builder renders the canonical glossed"* form | the only occurrence is the section spec `{ name: "Rejected Proposals (with rationale)", body: "REJECTED_MARKER body text." }` (line 81) — the canonical glossed name, not the un-glossed heading form |
| no `###`-as-body case | grep for `###` over the suite returns nothing |
| no `## Process Findings` near-miss | absent |
| the un-numbered `## Cross-Feature Patterns` spelling **does** appear, as LI-AT-05's material | `const material = "## Cross-Feature Patterns\n\nSample AT-05 material text.\n"` (line 42), inside `test("LI-AT-05: the preamble is byte-equal to TSPEC §OQ.1's literal wording…")` |
| …and as LI-AT-12's fixture text | `"## Cross-Feature Patterns\n\n" + "a".repeat(100)` (line 110) and the multi-byte fixture (line 130), both inside `test("LI-AT-12: character-safe cut…")` |
| `expect(result.sections).toEqual(["Cross-Feature Patterns"])` proves the matcher accepts it | present at lines 118 and 139, on both LI-AT-12 cases — and it is `toEqual` over the whole array, i.e. set equality over the section enumeration, not containment |
| *"what is owed there is the variant fixture as a whole, not that spelling"* | follows: the spelling is exercised, the **variant-heading fixture** (ordinal/gloss/`###`/near-miss knobs together) is not |

**This is the correction I needed, not a cosmetic softening.** My v8 review recorded the un-numbered
spelling as absent and cited *"fixture bodies at `:42`, `:110`, `:130`"* as if bodies were not
exercise. They are: line 118's `toEqual` is an assertion **on** that spelling. Had the claim stayed as
written, a future reader could have concluded F-O-1's second rule had no landed coverage at all, and
the owed amendment would have been scoped wider than it is. v0.6 fixes the direction of the error — it
narrows what is owed, and it narrows it to something checkable.

**The binding/non-binding `maxBytes` distinction is likewise exact.** v0.6 no longer says *"its only
`maxBytes` literals are 40 and 66"*; it says its only ***binding*** literals are, and qualifies the
third call as *"a deliberately non-binding `100000`"*. The file bears this out: `const maxBytes = 40`
(line 111) sits directly under the comment *"Hand-computed (never derived here): the character-safe cut
of an all-ASCII text lands on exactly the byte bound"* (line 108), `const maxBytes = 66` is at line 131,
and the third call `extractInjectableMaterial(text, 100000)` (line 87) sits under
*"Unbounded: large enough that maxBytes never binds, so nothing is cut (TSPEC §D.5)"* (line 86). Both
comments are quoted in the document verbatim, which is what makes the qualification checkable rather
than asserted — and which retires v8's F-03 anchor class rather than moving it.

**No implementation echoes in the cases the delta reasons about.** Both LI-AT-12 expectations remain
literal transcriptions: `expect(result.material).toBe("## Cross-Feature Patterns\n\naaaaaaaaaaaaa")`
with `expect(result.bytes).toBe(40)` (lines 115–116), and the multi-byte case's
`"## Cross-Feature Patterns\n\n" + "b".repeat(38)` (line 135). No expected value is imported from or
recomputed by the unit under test, and the `toBeLessThanOrEqual(maxBytes)` bound check (line 137) is
paired with the positive `toBe` on the same path — not an absence-only oracle.

**F-03 of v8 is resolved by quotation, not by deletion.** The three `LI-AT-30` cases are now cited by
their `test(` titles, and all three match the file character-for-character, including the third's full
title: `test("LI-AT-30: maxBytesPerDocument: 0 ⇒ every non-self corpus path RSN-NO-MATERIAL, none
RSN-COUNT, no slot consumed (E-36)")` at `learningsConfig.test.js` line 258, with the sibling titles at
226 and 242. `.gitignore`'s rule is cited as `/.baseline-worktree/`, which is its literal line-13 text.
Under `DEC-DOC-01` these are now symbol/quote citations, not bare positional anchors.

## Fixtures

**No fixture claim changed, and the one the delta re-scopes is now stated more conservatively.**
§F.1–§F.4 are byte-unchanged: no generator, corpus declaration, named fixture or fixture dependency is
re-pointed. The only fixture-adjacent movement is §C.4's re-scoping of what the LI-AT-11 amendment owes
`helpers/learningsFixtures.js` — from *"the un-numbered spelling is absent"* to *"the variant fixture as
a whole"* is a widening of the fixture debt and a narrowing of the assertion debt, and both directions
match the file.

| Fixture dependency | State at `23adb5e5` | Effect of this delta |
|---|---|---|
| `helpers/learningsFixtures.js` (LI-02, `1920f281`) | tracked; renders the canonical glossed section names, `ordinal`/`gloss` knobs unexercised by any landed suite | row unchanged; §C.4 now names the variant-heading fixture as what is owed here |
| `fixtures/learnings-baseline/` (LI-06, `4a6c1816`) | tracked — `MANIFEST.json`, `PHASE-F-AUTHORING-PROMPT/0.txt`, `PHASE-R-REVIEW-PROMPTS/{0,1}.txt` | unchanged from v0.5's repair |
| §F.1's named corpora (`NO-MATERIAL`, `ZERO-BOUND`, `DIVERGENT-CORPUS`, the five-section AT-11 fixture) | declared through the helper | untouched |
| PROP-BOUND-07's hand-computed byte literals over the AT-11 fixture | `learningsBlock.test.js:106–139` still carries the 25 + 2 + n arithmetic in comments and literal expected strings | unchanged; the delta now quotes the *"Hand-computed (never derived here)"* comment rather than pointing at its line |
| `scripts/capture-learnings-baseline.mjs` (LI-05, `ced75955`) | tracked | unchanged; still cited as *"the capture script (below)"* |
| `.gitignore` `/.baseline-worktree/` (LI-04, `ae2af1da`) | present at line 13 | cited by rule text instead of by `:13` |

**The `21edb7c5` snapshot pin still holds, which is what keeps the fourteen-row inventory current.** I
re-ran the document's own staleness test: `git diff --name-status 21edb7c5 HEAD` returns three paths,
all documentation — this PROPERTIES file and the two v8 cross-reviews. No test file and no fixture has
landed since the pin, so every row of the inventory and every absence claim §C.4 measures at the pin is
equally true at HEAD. This is the pinned-table method paying off exactly as designed: I could confirm
currency in one command instead of re-deriving fourteen adding commits.

**One cosmetic regression from the F-03 anchor fix.** Replacing the `.gitignore:13` anchor left the
sentence carrying the rule twice: *"whose artifact is the `/.baseline-worktree/` ignore rule (the
`.gitignore` rule `/.baseline-worktree/`, landed `ae2af1da`)"* (line 1098). Both halves are correct and
the parenthetical is what the fix needed; the outer mention is now redundant. Under the freeze this is
wording, not a defect — recorded as a DEFERRED item, not a finding.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
