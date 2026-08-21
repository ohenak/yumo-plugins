# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-21
**Iteration:** 12 (upstream-cascade confirmation — PROPERTIES bytes unchanged; PLAN moved v0.8 → v0.9)

**UPSTREAM-STATE at review:** REQ `sha256:ff605dd3…` (v0.9) · FSPEC `sha256:ae75fa62…` (v0.13) · TSPEC `sha256:22dee8ce…` (v0.9) · DECISIONS `sha256:56617f5a…` · PLAN `sha256:eaddd392…` (**v0.9**, erratum `ba120270`). PROPERTIES at HEAD is `sha256:e9de08bc…` — byte-identical to the bytes I approved at v11.

## Overview

**The one question this round asks.** PROPERTIES has not moved — its bytes hash to the same
`sha256:e9de08bc…` recorded on my v11 approval anchor. PLAN moved beneath it: erratum `ba120270`
took PLAN from v0.8 to v0.9 with two targeted corrections and no structural change. The question is
whether this PROPERTIES is still a faithful compression of PLAN **as it now stands**, not merely
whether the two named items landed.

**What the PLAN erratum actually changed.** `git show ba120270` is three hunks:

| Hunk | PLAN passage | Change |
|---|---|---|
| 1 | Version cell, line 18 | `0.8` → `0.9` |
| 2 | P-A-7 lead-in, line 487 | *"in the two cases that can arise"* → *"in the three cases that can arise (A, B and C below)"* |
| 3 | LI-08's amendment note, line 147 | *"`ordinal`, `gloss` and a free-form `body`, all three unexercised by any landed suite"* → `ordinal` and `gloss` unexercised, `body` **already exercised** (`learningsBlock.test.js` on all six section specs, `learningsSelect.test.js` on the non-BR-6 section); conclusion *"adds callers, not knobs"* unchanged |
| — | Changelog | New v0.9 row recording both, and asserting the A/B/C table's own text is untouched |

**The answer: PROPERTIES still holds, and hunk 2 moves upstream toward this document, not away from
it.** PROPERTIES §C.4 has read the table as **three**-case since v0.7 (line 1110: *"of PLAN's
**three**-case table at v0.8, **case C is the live case**"*; line 1155: *"in **any of the three
cases**"*). PLAN's stale *"two cases"* lead-in was the one place upstream still contradicted that
reading — the table body already had three rows. v0.9 removes the contradiction. A compression that
was faithful to the table and ahead of the prose is now faithful to both.

**Hunk 3 does not reach this document at all.** I grepped PROPERTIES for `renderSection`, `knob`,
`caller`, `unexercised`, `ordinal`, `gloss`: the only hit touching LI-08's amendment note is the
header cell's *"relocated LI-08's amendment note"* (a fact about PLAN v0.7's edit, still true), and
the only `body` hits are property text about section **body markers** (line 274, PROP-BOUND-05's
*"five presence conjuncts on each section's **body** marker rather than its heading"*), which is a
claim about rendered corpus documents, not about `renderSection`'s parameter list. PROPERTIES never
restated the false *"all three unexercised"* claim, so it did not inherit it and does not now need
correcting for it. The premise it **does** lean on — additivity — sits in PLAN's paragraph **below**
the case table (*"the landed helper already renders an optional ordinal and an optional gloss, and
existing callers that declare neither keep byte-identical output"*), which hunk 3 did not touch and
which hunk 3's correction strengthens rather than weakens: `body` being already-exercised is one
fewer knob whose first caller could perturb output.

**Every load-bearing quotation re-verified against PLAN at HEAD.** I re-grepped PROPERTIES' verbatim
citations into PLAN with fixed-string matching, at `sha256:eaddd392…`: *"after batch 13, the case
that is live at HEAD"*, *"under case C they owe no ledger row, and they owe green"*, *"batch 9
through batch 12"*, *"no** row of their own in"* and *"**this** heading-form follow-up commit, not a
standing exemption"* each match exactly once. No quotation rotted.

**One thing did go stale, and it is the header pin.** PROPERTIES line 11 pins PLAN at **v0.8** and
line 1155 attributes the exemption ruling to *"PLAN v0.8"*; PLAN is v0.9. The substance behind every
such reference is unchanged, so this is a pin-freshness finding, not a fidelity one — recorded Low
below, non-gating, exactly as the equivalent pin lag was handled in v11.

## Properties

**No property statement can have moved — the file is byte-identical — so the test is whether any
property's *upstream footing* moved.** Two footings are in play for this erratum: the P-A-7 case
that governs each property-owed amendment, and the additivity premise under the fixture helper.

| PROPERTIES claim leaning on PLAN | PLAN at v0.9 | Holds? |
|---|---|---|
| §C.4: PLAN's P-A-7 table is a **three**-case table, case C live | Table still three rows; lead-in now says *"three cases … (A, B and C below)"* — agreement is now textual as well as substantive | Yes — improved |
| Case A scoped *before batch 7* | Case A row unchanged, still *"before batch 7"* with the derived batches 2–6 window | Yes |
| Case B scoped *"batch 9 through batch 12"* | Case B row byte-unchanged | Yes |
| Case C: *"after batch 13, the case that is live at HEAD"* | Case C row byte-unchanged | Yes |
| Case C's obligation: *"under case C they owe no ledger row, and they owe green"* | Character-exact at HEAD | Yes |
| A landing red *"has found a real defect"*, fix owed **before batch 14**, survival into batch 14 a **gate failure** | Case C row states all three, unchanged | Yes |
| Group D amendments to landed `learningsSelect.test.js` travel under case C | Case C's closing clause still names them | Yes |
| `helpers/learningsFixtures.js` consumers carry no row *"in any of the three cases"*, scoped to *"**this** heading-form follow-up commit, not a standing exemption"* | Paragraph below the table, unchanged | Yes |
| P-A-6 governs this document's own PROPERTIES suite, *"byte-unchanged at v0.8"* | P-A-6 untouched by the erratum; the v0.8 label is a pin, addressed in F-01 | Yes (substance) |

**The four property-owed amendments are unaffected in kind and in count.** PROP-BOUND-03's
`maxBytesPerDocument <= 0` case and PROP-BOUND-05/07/08's heading-form arms still land in
`learningsBlock.test.js` under case C: empty ledger, green expected at landing, fix-before-batch-14
if one reds. Nothing in the erratum adds, removes or re-routes an amendment, and nothing changes the
set of properties the amendment scope covers — which is the question that matters for a product
reading, since a silently widened or narrowed set would hand the implementer a different obligation
than the one PLAN schedules.

**Hunk 3 read for product consequence, not just for text.** The corrected note says the follow-up
commit adds callers for **two** unexercised knobs (`ordinal`, `gloss`) and reuses one already
exercised (`body`). PROPERTIES' §C.4 evidence never counted knobs — it counted *arms absent from the
landed suite* (no un-glossed `## Rejected Proposals`, no `###`-as-body case, no `## Process Findings`
near-miss, no `extractInjectableMaterial(text, 0)` call). Those four absence claims are facts about
the landed test files, independent of how many `renderSection` parameters were previously exercised.
I re-measured them at HEAD in v11 and the erratum touches no test file, so they stand.

**One asymmetry worth stating plainly.** The erratum's `body`-already-exercised correction makes the
`###`-as-body arm *less* novel than PLAN previously implied: the mechanism it needs (`body` text
passed through `renderSection`, which hardcodes the two-`#` prefix) is already in daily use by both
landed suites. That further supports case C's "expected green" ruling, which PROPERTIES already
records. No finding — a confirmation of the reading this document took.

## Oracles

**No oracle in this document draws on either changed PLAN passage.** §O.1–§O.10 map properties to
AT ids, levels and red/green owners; the erratum moved no task, no batch, no `Deps` edge, no AT
partition and no red/green attribution (PLAN v0.9 changelog states this, and the diff confirms it —
the only task-table hunk is LI-08's prose note, whose `Suite` / `Prod` / `Batch` / `Deps` / `Status`
cells are byte-identical).

| Oracle-side dependency | Erratum effect | Holds? |
|---|---|---|
| PROP-BOUND-03/05/07/08 → red LI-08 / green LI-17 | LI-08's row cells unchanged; only its amendment-note prose edited | Yes |
| LI-16 named owner of TSPEC §D.5's zero-bound production half | v0.7 ruling, untouched at v0.9 | Yes |
| PROP-CONFIG-09 ↔ LI-12's three-case `LI-AT-30` | LI-12 row untouched | Yes |
| Case C's shipped-production evidence — `canonicalSectionName` strips ordinal and gloss, compares case-sensitively against `BR6_SECTION_NAMES`, `^##[ \t]+` never matches `###` | Case C row byte-unchanged; production at HEAD (`orchestrate-dev.js:2313`, `:2319-2326`) unchanged this round | Yes |
| PROP-BOUND-03's transcribed four-field zero-bound return | Production short-circuit at `orchestrate-dev.js:2370-2371` untouched | Yes |

**The heading-form oracle question the erratum brushes against.** Hunk 3 concerns which
`renderSection` knobs the amendment must newly drive. An oracle-level reading asks instead which
*behaviours* the amendment asserts — the second rule of F-O-1: ordinal stripped and discarded (not
read as priority), gloss stripped, case-sensitive comparison, `###` never a heading. Those four are
what PROPERTIES' PROP-BOUND-05/07/08 pin, and the fixture mechanism used to produce the variant text
is deliberately not part of the property statement. That separation is why hunk 3 cannot invalidate
an oracle here: PLAN corrected a claim about the *fixture builder's* exercised surface, and
PROPERTIES' oracles are stated over the *extractor's* observable output.

**PM Q-02 stays closed on the right channel.** §G.3 records the closure (*"answering PM Q-02"*, PLAN
v0.8's changelog) rather than re-emitting a routed erratum line. v0.9 does not reopen it — the case C
row that answered it is byte-unchanged. I carry no question forward this round either.

**§G.3's "Also answered — by PLAN v0.6/v0.7/v0.8" list is history, and history did not change.**
Each struck item cites the PLAN version that answered it, not the current PLAN version, so v0.9
leaves the list correct as written. This is the right citation form for a resolved-items list, and
it is why that section needs no edit even though the document's version pin does.

## Fixtures

**This is where the erratum comes closest to PROPERTIES, so I measured it rather than reasoning about
it.** Hunk 3 is a claim about `helpers/learningsFixtures.js`'s exercised surface, and PROPERTIES §F.1
declares its corpus fixtures against that helper. I verified PLAN v0.9's corrected claim at HEAD:

| PLAN v0.9 claim | Measured at HEAD | Holds? |
|---|---|---|
| `learningsBlock.test.js` passes `body:` on all six of its section specs | `grep -c "body:"` → **6** | Yes |
| `learningsSelect.test.js` passes `body:` on the non-BR-6 section | `grep -c "body:"` → **1** | Yes |
| `ordinal` and `gloss` are unexercised knobs that already exist in the landed helper | `learningsFixtures.js:57-68` declares and renders both (`ordinalPrefix`, `glossSuffix`); no landed suite passes either | Yes |

So the correction PLAN made is true, and the claim it replaced was false. That matters to this
confirmation in one direction only: PROPERTIES never carried the false claim, so it inherits no
defect from it.

| PROPERTIES fixture-side claim | State at PLAN v0.9 / HEAD | Holds? |
|---|---|---|
| §F.1 corpus fixtures declared against `helpers/learningsFixtures.js` | Helper unchanged this round; no fixture row moved | Yes |
| Additivity premise: existing callers declaring neither ordinal nor gloss keep byte-identical output | PLAN's paragraph below the case table, untouched; helper's renderer confirms (`ordinalPrefix`/`glossSuffix` both empty-string when unset) | Yes — and strengthened, since `body` is now known to be already in use rather than newly driven |
| `helpers/learningsFixtures.js` and its consumers carry no ledger row in any of the three cases | Ruling unchanged, still scoped to this follow-up commit only | Yes |
| PROP-BOUND-07's hand-computed byte literals over the AT-11 fixture | No fixture bytes moved; literals stand | Yes |
| AT-11 fixture, `GATE-GRAMMAR` corpus, `fixtures/learnings-baseline/`, `scripts/capture-learnings-baseline.mjs`, `.gitignore` entry | None touched by the erratum | Yes |

**The fixture-debt scoping survived again.** §C.4's ruling is that what the amendment owes is *the
variant fixture as a whole* rather than four separate knobs. v0.9 refines the arithmetic behind that
sentence (two knobs plus one already-exercised, not three unexercised) without changing the sentence's
conclusion, and PROPERTIES states the conclusion, not the arithmetic. Had PROPERTIES compressed the
"four new knobs" framing into its own text, this erratum would have rotted it; it did not, which is a
compression choice paying off two rounds later.

**Fourteen-row fixture inventory and the 23-of-23 task accounting are untouched.** Every property
still names a fixture PLAN creates under a task PLAN still owns, and no PLAN task changed batch,
suite, production target or dependency in this erratum.

## Positive Observations

- **The erratum closed a gap in upstream's favour, not against this document.** PLAN's *"two cases"*
  lead-in was the last place upstream disagreed with PROPERTIES' three-case reading. §C.4 had been
  right and PLAN's prose wrong; v0.9 makes them agree textually. A cascade that *reduces* the
  citation surface at risk is worth naming.
- **PROPERTIES compressed the conclusion, not the arithmetic.** It records *"the variant fixture as a
  whole"* and case C's obligation, never PLAN's "four new knobs" accounting. That is why hunk 3 —
  which corrected precisely that accounting — reaches nothing here. Compressing what upstream *rules*
  rather than how upstream *counts* is the property that made this confirmation cheap.
- **Verbatim quotation kept the check mechanical.** Five fixed-string greps against PLAN at HEAD
  settled the fidelity question in one pass. Paraphrase would have required re-reading both documents
  and would have failed silently rather than loudly on a future upstream move.

## Recommendation

**Approved with minor changes.**

PROPERTIES still holds as approved against PLAN v0.9. Neither changed passage undercuts a claim this
document makes: hunk 2 aligns PLAN's lead-in with the three-case reading PROPERTIES already took, and
hunk 3 corrects an accounting claim PROPERTIES never restated, in a direction that strengthens the
additivity premise it does rely on. Every verbatim citation into PLAN still matches character-exactly
at HEAD; every case-A/B/C row PROPERTIES quotes is byte-unchanged; no property, oracle, fixture row,
AT mapping or red/green trace is affected.

The single finding is Low and non-gating: the header pins PLAN at **v0.8** and §C.4's exemption
attribution reads *"PLAN v0.8"*, while PLAN is now v0.9. Substance behind both references is intact,
so this is pin freshness. Suggested handling — re-pin to v0.9 whenever the next round touches the
header cell for its own reason, rather than opening a revision loop for a version label.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Low | delta | local | Header line 11 pins PLAN at **v0.8** (and §C.4 line 1155 attributes the fixture-consumer exemption ruling to *"PLAN v0.8"*), but PLAN at HEAD is **v0.9** (`sha256:eaddd392…`). Every claim behind those references is unchanged — the case A/B/C rows and the exemption paragraph are byte-identical across the erratum — so this is pin freshness, not fidelity. Re-pin to v0.9 on the next round that touches the header for its own reason | Header table, `Upstream` cell (line 11); §C.4 closing paragraph (line 1155) |

FINDING: Low | delta | local | Header `Upstream` cell (line 11) and §C.4 line 1155 | PLAN is pinned as v0.8; PLAN at HEAD is v0.9 (`sha256:eaddd392…`) — the underlying case A/B/C rows and exemption paragraph are byte-unchanged, so the pin is stale but no claim is false

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
