# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.6)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v7.md` (v1.5)
**Delta reviewed:** `6e80e476..HEAD` — four commits, DECISIONS only, 92 insertions / 23 deletions
**Date:** 2026-08-19
**Iteration:** 8

## Context

My v7 filed one blocking finding (F-01, the false "split schedule" keyed to a task id that does not
exist in PLAN) and two non-blocking ones (F-02, column (2) enumerated on the envelope half only;
F-03, column (3) failing set-equality in both directions). All three were addressed across four
commits. Convergence scope this round is narrow by design: did my blocker land, and did the repair
break anything.

Four things in the delta are checkable against the repository rather than against prose, and I
checked all four by running or grepping, not by reading: the withdrawal of the split-schedule claim
against PLAN's actual green step; the new "ten, not two" column (2) count, which the record
explicitly derived by *running* the suites; the new "twenty, not six" column (3) count; and the
`PROP-CFG-01/-02` id-collision claim the record volunteered. Three hold exactly. The fourth — column
(3) — is closer than v1.5 and still not set-equal, in the same direction the last three rounds
missed, and that is the only substantive item I file.

## Options Considered

v7 gave the author a choice on F-01: repair the scheduling sentence or drop it (my Q-01 asked
whether dropping was cheaper, since scheduling is PLAN's to state, not this record's). The author
took a third and better option — state the corrected fact *and* mark the boundary of the record's
own authority: "Scheduling is PLAN's to state; this record states the taxonomy only, and points at
`A6-05` for when." That keeps the useful half (an implementer reading the taxonomy learns the two
oracles are not independent) without re-deriving PLAN's schedule a fourth time. It also leaves the
withdrawn claim legible rather than silently deleted, including where the phantom `A-17` came from.

On F-02/F-03 the author again took the wide option over the cheap one: rather than patching the two
sites I named, it re-derived column (2) by running `npm test -- __tests__/advisory` and reconciled
every one of the 24 failures into "this column" or "not this column". That is the right method and it
paid — it surfaced `advisoryHarvest.test.js`'s `T-08-8`, a column (2) member **no review had named**,
including mine. The same method applied to column (3) was a grep-plus-read rather than a run, which
is unavoidable (prose sites have no runtime signal), and that is exactly where the residual gap sits.

## Findings

### Disposition of v7 findings

| v7 finding | Disposition | Evidence re-verified at HEAD |
|---|---|---|
| F-01 (High) — false "split schedule", `A-17` names no task | **Resolved, verified against PLAN.** v1.6 withdraws it explicitly ("v1.5 said the opposite"), states the corrected fact in bold — **These two oracles clear together, at one wave boundary** — names where the phantom id came from, and hands scheduling back to PLAN | `grep -c 'A-17'` on PLAN = **0**, as v1.6 states. PLAN's `A6-05` row carries "**Green step (A6-05 proper)** … `export const ADVISORY_SEAMS` + `A6`, `export const ENVELOPE_DEFAULTS` + `E-5`, `E-6` … `export const ADVISORY_DEFAULTS` gaining `waveBudgetPerRun`" — one green step, one task, so nothing splits them in time. The `A-17` provenance claim is also exact: `__tests__/helpers/advisoryDoubles.js:313` reads "`ADVISORY_DEFAULTS` (TSPEC §3.1) is authored by A-17, a downstream task" |
| F-02 (Medium) — column (2) enumerated envelope half only | **Resolved, and re-derived by running rather than reading.** Now ten sites / fourteen failures, both halves enumerated | `npm test -- __tests__/advisory` at HEAD: **24 failed / 386 passed / 410 total across 15 suites** — matching v1.6's figure exactly. I reconciled all 24 failure headers by name: envelope side 7 (`T-03-8`; `PROP-CFG-02 (T-01-1)` × 5 inputs; `PROP-CFG-01 (A6-02)`), seam side 7 (`ADVISORY_SEAMS` deep-equality; `PROP-GATE-06`; `T-08-6`; `T-08-8`; `T-10-5 / PROP-DIS-05`; `advisoryQueueSeams.test.js:634`; `PROP-SUM-02` A6 identity) = 14; the "other ten" are `ADVISORY_ROOT_CAUSES` (1), `A6_PROHIBITIONS` (1), the `nonNegativeInt` arms (7) and `P-1` (1) = 10. 14 + 10 = 24 |
| F-03 (Medium) — column (3) membership wrong in both directions | **Resolved in the direction I named, one new gap opened (F-01 below).** `advisoryRecord.test.js`'s "exactly five rows regardless of the injected newline" is correctly excluded with the reason stated; `advisoryDriver.test.js` is correctly added | The excluded site is `advisoryRecord.test.js:436`, and its neighbourhood confirms the exclusion reason verbatim — the regex two lines above matches `/^\|\s*(Seam\|Confidence\|Envelope\|Disposition\|Model)\s*\|/`, the diagnosis table's five field rows, not `ADVISORY_SEAMS` |

### New findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **Column (3) still fails set-equality on the seam half: two members missing, so "twenty" should read twenty-two.** The record adds `advisoryDriver.test.js`'s `T-03-6` comment and the generated-cases banner and stops at two sites in that file. The record's own re-derivation recipe — "grep the advisory suites *and* `orchestrate-dev.js` for both `five` and `01…05`-style range restatements" — returns **four** hits in that file, not two: `advisoryDriver.test.js:31` (counted), `:230` (counted), and the two generated `it` titles at **`:238`** ("verifyGate is null; resolved is unreachable on every path … (PROP-GATE-01…05, TSPEC §5.5, §6.5)") and **`:280`** ("resolved is reachable only through its declared verifyGate … (PROP-GATE-01…05)"), both uncounted. These are members under the record's own rule and by its own precedent: it counts a `describe` title and a `test`/`it` title as separate sites in `advisoryRecord.test.js`, `advisoryDisabled.test.js` and `advisoryHarvest.test.js`, and these two are `it` titles restating the same `01…05` range that A6 moves to `01…06`. So the seam half is **fourteen**, not twelve, and the total is **twenty-two**, not twenty. Note the shape: the missed sites sit *inside the very file this round added*, and the recipe that would have caught them is printed four paragraphs below the count it should have corrected — the recipe was written but not run to exhaustion. This is the fourth consecutive round in which a column-(3)-style enumeration shipped with a plausible total and non-set-equal membership (v1.3's "roughly a dozen", v1.4's "seventeen", v1.5's "eleven", now "twenty"). Bounded impact, hence Medium and not High: the record itself says the number an implementer must not get wrong is column (1)'s four — which I re-verified as correct — and all four sites are one loop's worth of edit in one block | `DECISIONS` column (3), the "twelve seam prose sites" enumeration |
| F-02 | Low | Local | **"four lines above it" is sixteen lines.** The record describes the generated-cases banner as repeating "(PROP-GATE-01…05)" "while the registry banner four lines above it already reads `PROP-GATE-01…06`". The registry banner is `advisoryDriver.test.js:214` and the generated-cases banner is `:230` — sixteen lines apart, with the registry body in between. The *content* claim is exactly right (`:214` does read `PROP-GATE-01…06` while `:230` reads `…05`, which is the inconsistency worth naming); only the positional locator is wrong. Filed Low because the anchor that carries the argument is the quoted content, not the offset, per `DEC-DOC-01`'s preference for content anchors over positions — the offset should simply be dropped rather than corrected, since it adds nothing the quotes do not | `DECISIONS` column (3), `advisoryDriver.test.js` entry |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Column (3) has now been re-counted in four consecutive rounds and has been wrong in four consecutive rounds, each time by membership rather than by method. The record has responded correctly each time — it now ships the recipe *and* the excluded-false-positive list, which is more than most enumerations carry. Is the remaining lesson that the number should not be in the document at all? The record already says the figure is not the one an implementer must not get wrong; a sentence of the form "column (3) is long — run the recipe below to size it at the moment you need it" would be true permanently, where any integer is true for one commit. I do not file this as a finding because the current text is defensible; I raise it because the cost of the integer has now exceeded its value four times over. |
| Q-02 | `advisoryQueueSeams.test.js`'s column (2) member is cited as "`ADVISORY_SEAMS drives the row list (S-1)`", which reads like a test title but is a trailing **comment** on the assertion at `:634`, inside the test titled "S-5 — buildQueueReport's advisory summary counts an A1 escalation on the A1 row only". The quote is verbatim and the site is a genuine column (2) member, so nothing is wrong — but a reader searching for a test by that name will not find one. Worth one clarifying word ("the `…drives the row list` assertion in `S-5`")? |

## Positive Observations

- **Re-deriving column (2) by running the suites found a member every reviewer had missed.** The
  record does not just assert ten; it reconciles the full 24-failure surface into "this column" and
  "not this column", and the partition is principled — members *grow* an existing literal, non-members
  need a symbol A6 *creates*. That distinction is what makes `T-08-8` visible: its neighbourhood is a
  member *lookup* (`rows.find((r) => r.seam === "A1")`) rather than a member list, so every
  reading-based pass slid past it, including three of mine. I reproduced the whole partition from a
  clean run and it is exact, including the 7/7 split and the 24 = 14 + 10 arithmetic. This is the
  method the prose-site rule has needed since v1.3, applied where a runtime signal exists.
- **The `PROP-CFG-01/-02` id-collision note is a real bench hazard, caught before it cost anyone an
  hour.** I verified it: `advisoryConfig.test.js` carries `describe("PROP-CFG-01 …")` at `:76` *and*
  `describe("PROP-CFG-01 (A6-02) …")` at `:103`, and `PROP-CFG-02` at `:127` *and* `:194` — two ids,
  four describes, different properties. PROPERTIES' `PROP-CFG-02` is the `waveBudgetPerRun`-through-
  `nonNegativeInt` property, which is the `:194` one, while the `:127` describe wearing the same id
  has no PROPERTIES row at all. The record's advice — "follow the file and the `T-01-1` deep-equality
  instead" — is the correct disambiguation, and "a red `PROP-CFG-02` names either property" is
  precisely the failure mode an implementer will hit. (The underlying collision is PROPERTIES', not
  this record's; routed as an erratum below.)
- **The withdrawal names its own provenance instead of quietly deleting.** v1.6 says v1.5 said the
  opposite, says the reassurance "was therefore backwards and is withdrawn", and traces `A-17` to the
  helper comment it was absorbed from. I confirmed that comment exists at `advisoryDoubles.js:313`
  reading exactly "authored by A-17, a downstream task". A record that can explain *how* it acquired
  a false fact is a record that will acquire fewer of them.
- **The seven-versus-ten reconciliation closes a contradiction before a reader trips on it.** Two
  counts of overlapping populations sat in one document; the new parenthetical distinguishes them by
  predicate — "sites at the post-A6 value, oracles and inputs alike" versus "oracles that are red at
  HEAD" — and names why the difference exists ("green today because nothing compares them to
  production"). Verified: `consolidationProperties.test.js:250`'s generator pick and
  `advisoryDoubles.js:354`'s `SEAMS` both already read six members and neither is compared to
  production, so both are correctly in the seven and correctly out of the ten.
- **`dist/pdlc-cli.mjs` is placed in no column, with the right reason.** This matches CLAUDE.md's
  standing rule that `pdlc/workflows/dist/` is generated, never hand-edited, and regenerated by the
  wave gate's own `postWaveCommand` (DEC-08). Answering a grep an implementer will actually run,
  with the instruction to leave it alone, is the useful shape for that answer.

## Recommendation

**Approved with minor changes**

My v7 blocker is resolved and verified against PLAN and against a clean test run, and nothing the
repair touched broke: the withdrawn schedule is now correct, column (2) is correct at ten sites and
fourteen failures, column (1)'s four — the one number that is load-bearing for an implementer — is
unchanged and still correct, and the exclusion discipline is applied with reasons stated in every
case I checked. No High finding stands, so this does not block.

Two changes worth making, neither gating:

1. **F-01 (non-blocking)** — in column (3), add `advisoryDriver.test.js:238` and `:280` (the two
   generated `it` titles restating "PROP-GATE-01…05"), making the seam half **fourteen** and the
   total **twenty-two**. Running the record's own printed recipe to exhaustion produces exactly
   these two.
2. **F-02 (non-blocking)** — drop "four lines above it" (the distance is sixteen lines); the quoted
   contents of the two banners already carry the point without an offset.

Everything else in the changed block I verified clean at HEAD: the `A-17` withdrawal and its
provenance, PLAN's single green step, the 24-failure partition and its arithmetic, the seven-versus-
ten reconciliation, the `PROP-CFG` id collision, the four excluded false positives, and the `dist/`
exclusion.

## Verdict
VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
