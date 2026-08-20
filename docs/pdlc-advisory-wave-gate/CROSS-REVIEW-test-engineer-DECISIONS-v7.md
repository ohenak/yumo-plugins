# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.5)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v6.md` (v1.4)
**Delta reviewed:** `ff07bc84..HEAD` — two commits, `96e4d08a` (v6 F-01) and `6e80e476` (v6 F-02), DECISIONS only, 43 insertions / 12 deletions
**Date:** 2026-08-19
**Iteration:** 7

## Context

Both v6 findings were addressed in one commit each, and the scope of the delta held: `git diff
ff07bc84..HEAD` touches this file only, no decision body moved, no verdict-supersession text
changed. Four things in the delta are checkable against the repository and I checked all four at
runtime rather than by reading: whether `PROP-CFG-02` really is a second envelope oracle, whether
its five cases are red today and on which members, whether the new three-column sizing line's
column (2) is set-equal to the oracles that actually behave that way, and whether column (3)'s
eleven seam prose sites are set-equal to what is in the tree. Three held; the taxonomy the round
introduced does not, and one new scheduling claim handed to PLAN is false against PLAN v1.3.

I re-read only the changed passages and re-grounded every anchor in them.

## Options Considered

v6 asked for two things: correct the envelope oracle count to two (F-01, filed High by PM), and
either count the seam half's prose sites alongside the envelope comment or narrow the prose-site
rule (F-02, my Medium). The narrow option was available and cheap — deleting the
`advisoryDoubles` comment from the count would have made the rule consistent in one line. The
author took the wide option instead and counted the seam half, which is the better choice: the
rule is right, and applying it evenly is what surfaces that column (3)'s tail is the long one.

The round also went past both findings and introduced a three-column taxonomy (gate-demanded
edits / no-edit oracles / ungated hand-copy). That is new material nobody asked for, and it is
where this round's problems are — not in the two fixes, which are correct.

## Decision

**Both v6 findings are resolved and the corrections are runtime-verified. One High finding is
open on the round's new material: the "split schedule" the record hands PLAN does not exist, and
the task id it is keyed to (`A-17`) is not a task in PLAN v1.3.**

| v6 finding | Disposition | Evidence re-verified at HEAD |
|---|---|---|
| F-01 (Medium) — "`advisoryConfig`'s six-member envelope is never compared to anything" was false | **Resolved, and verified by running the suite rather than reading it.** v1.5 now states the envelope's drift oracles are **two**, names `PROP-CFG-02`'s `expect(config).toEqual(ADVISORY_DEFAULTS)` as the second, explains why it was easy to miss (whole-object deep equality, not a dedicated envelope assertion), and retracts the half of TE v5 F-02 that I supplied wrong | `npm test -- __tests__/advisoryConfig.test.js` at HEAD: all five `PROP-CFG-02` cases fail — the four `test.each` inputs (`advisoryConfig.test.js:129-132`: file absent, no advisory section, unparseable JSON, top-level array) at `:135`, and the non-object-section case at `:143`. Each diff drops `"E-5"`, `"E-6"` **and** `"waveBudgetPerRun": 1`, exactly as the bullet claims. Production is four-member and key-absent at `orchestrate-dev.js:1942`, `:1945-1950`; the local literal is six-member at `advisoryConfig.test.js:46-52` |
| F-02 (Medium) — prose-site rule applied to the envelope half only | **Resolved in substance**, with a counting defect (F-03 below). v1.5 counts the seam half and restates the total as seventeen, not six (`DECISIONS:427`), and correctly excuses `advisoryDisabled.test.js:54`'s A-15 capture note as an unrelated sense of "five seams" — which it is | Grep for `five` across the eight advisory suites returns the sites the record names, plus one it misses and one it should not have included (F-03) |

**What does not hold.** `DECISIONS:405-408` tells PLAN "the two oracles do not clear together …
`advisoryEnvelope`'s equality goes green on A6-02's envelope growth alone; `PROP-CFG-02` needs
A-17's `ADVISORY_DEFAULTS` … as well, so an implementer who lands A6-02 and sees `advisoryConfig`
still red has not regressed anything." Measured against PLAN v1.3: `A-17` does not exist
(`grep -c "A-17"` over PLAN returns `0`; the only occurrence anywhere in the feature's documents
is this DECISIONS line). `A6-02` is not a task either — PLAN's v1.3 restructure row
(`PLAN:16`) folded it into `A6-05` as a **red test step**, so "landing A6-02" writes tests, not
production constants. And both production constants land in the **same green step of the same
task**: `PLAN:209`'s "**Green step (A6-05 proper)**" lists `export const ENVELOPE_DEFAULTS` + `E-5`,
`E-6` and `export const ADVISORY_DEFAULTS` gaining `waveBudgetPerRun` in one sentence, in one
task, at one wave boundary. The two oracles therefore clear **together**, and the reassurance is
the wrong way round: at A6-05's wave boundary a still-red `advisoryConfig` means the green step is
incomplete and the gate will halt the wave.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | **The "split schedule" handed to PLAN is false at HEAD, and its citation names a task that does not exist.** `A-17` appears nowhere in PLAN (0 matches) — it is a stale id surviving only in a test-helper comment (`__tests__/helpers/advisoryDoubles.js:313`, "`ADVISORY_DEFAULTS` … is authored by A-17, a downstream task"), which is where the record appears to have picked it up. `A6-02` is a red **test** step folded into `A6-05` by PLAN's v1.3 restructure (`PLAN:16`), not a task that grows production. Both constants land in one green step: `PLAN:209`, "**Green step (A6-05 proper)** … `export const ENVELOPE_DEFAULTS` + `E-5`, `E-6` … `export const ADVISORY_DEFAULTS` gaining `waveBudgetPerRun`". So the oracles clear together, and the operative sentence — "an implementer who lands A6-02 and sees `advisoryConfig` still red has not regressed anything" — instructs an implementer to ignore the one signal that says the green step is unfinished, at a wave boundary whose gate has no expected-red channel (`PLAN:16`). Column (2) at `:424` inherits the same error via "on the split schedule the bullet above gives" | `DECISIONS:405-408`, `:424` |
| F-02 | Medium | Process | **The new column (2) repeats the exact envelope-only asymmetry v6 F-02 was filed about.** "Oracles that flip red→green with no edit at all" is enumerated as exactly two, both envelope-side. The seam half has members of the same class, red at HEAD, needing no edit: `advisoryEnvelope.test.js:317-320`'s `expect(devModule.ADVISORY_SEAMS).toEqual(["A1" … "A6"])`, and `advisoryDriver.test.js:845-850`'s `PROP-GATE-06` registry key-set equality against `ADVISORY_SEAMS` — the registry already carries its `A6` row at `:225`. Both confirmed failing by `npm test -- __tests__/advisoryEnvelope.test.js __tests__/advisoryDriver.test.js` (5 failed / 79 passed; `PROP-GATE-06` is active, not skipped). This is the third consecutive round in which a re-derivation is applied to one half of the same pair — the durable lesson, not this document's fix | `DECISIONS:419-424` |
| F-03 | Medium | Local | **Column (3)'s "eleven seam prose sites" fails set-equality in both directions.** One member does not belong: `advisoryRecord.test.js:436` ("the table stays exactly five rows regardless of the injected newline") counts the diagnosis table's five `\| Field \| Value \|` rows — Seam, Confidence, Envelope, Disposition, Model (`:431`) — not `ADVISORY_SEAMS` members; it does not move at A6, and its twin at `:32` is correctly uncounted, so including `:436` is inconsistent with the record's own exclusion. One member is missing: `advisoryDriver.test.js:30-31`, "the five per-seam gate-exclusivity cases, one per `ADVISORY_SEAMS` member (PROP-GATE-01…05)" — a prose restatement of the seam cardinality sitting directly above the registry whose key set is asserted set-equal to `ADVISORY_SEAMS`, which is precisely the shape the rule was written for. Net the total stays eleven by coincidence; the membership is wrong, and a coincidentally-right total is the shape this record has already been caught banking on once (v1.4's "unchanged at seven") | `DECISIONS:427-434` |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-01 and F-02 have the same root: the round reasoned about the envelope half against PLAN and about the seam half not at all. Would it be cheaper to drop the scheduling sentence entirely rather than repair it? The record's job here is to say what the taxonomy is; **when** each column clears is PLAN's to say, and PLAN already says it correctly in `A6-05`. A DECISIONS record that re-derives PLAN's schedule takes on a maintenance obligation it has now failed three rounds running. |
| Q-02 | Column (3) is explicitly described as a tail that "will stay long". If no consumer acts on its exact membership, is the enumeration earning the re-derivation cost it keeps imposing? A named rule plus one worked example may serve PLAN as well as a roll-call that has to be re-counted every round. |

## Positive Observations

- **The F-01 fix is not just correct, it is better-explained than the finding was.** I filed
  "`PROP-CFG-02` deep-equals the literal". v1.5 says why the site was missable — "not a *dedicated*
  envelope assertion" — keeps the accurate `PROP-CFG-01` sentence intact rather than rewriting the
  whole passage, and enumerates the five inputs. I ran it: all five are red, and every diff drops
  `E-5`, `E-6` and `waveBudgetPerRun` exactly as written. A reader who doubts the claim can
  reproduce it from the text alone.
- **The retraction is attributed to the reviewer who got it wrong, which was me.** "TE v6 F-01 —
  which retracts the second half of TE v5 F-02, the claim v1.4 transcribed" (`DECISIONS:394-395`).
  The record does not launder a reviewer error into an authorial one, and it does not hide that it
  transcribed the error faithfully. That is the right way to keep a wrong round legible.
- **The A-15 exclusion is exactly the discipline the prose-site rule needs.**
  `advisoryDisabled.test.js:54` says "five seams" and is not counted, with the reason stated
  in-line: it means the seams of an earlier run, not `ADVISORY_SEAMS`. Grepping a word and counting
  hits is how these enumerations go wrong; reading each hit and excusing the false positives in
  writing is how they stay right. F-03 asks for that same treatment on two more sites, not for a
  different method.
- **Column (1) is correct and is flagged as the one that matters.** Three production constants plus
  `advisoryRecord.test.js:496`'s `rows.map((r) => r.seam)` equality, still reading five at HEAD —
  verified, and matching `PLAN:209`'s "the one genuine transcription left at HEAD". Saying which
  number an implementer must not get wrong, and that it is small, is more useful to PLAN than the
  total ever was.

## Recommendation

**Needs revision** — one High finding (F-01).

Both v6 findings are resolved, and the F-01 fix is verified by running the suite, not by reading
it: `PROP-CFG-02` is a real second envelope oracle, its five cases are red at HEAD, and the diffs
name `E-5`, `E-6` and `waveBudgetPerRun`. Nothing in the two fixes needs to move. What blocks is
three sentences of the round's *new* material, all in the scheduling claim the record volunteered.

Exactly what to change:

1. **F-01 (blocking)** — `DECISIONS:405-408`: delete the "the two oracles do not clear together"
   consequence, or replace it with the measured position — both `ENVELOPE_DEFAULTS` + `E-5`/`E-6`
   and `ADVISORY_DEFAULTS`' `waveBudgetPerRun` land in **`A6-05`'s single green step**
   (`PLAN:209`), so both oracles clear at the same wave boundary, and a still-red `advisoryConfig`
   there means the green step is incomplete, not that nothing regressed. Remove the `A-17`
   citation (no such task in PLAN v1.3) and do not name `A6-02` as a production-landing step (it is
   a red test step folded into `A6-05` per `PLAN:16`). Then fix `:424`'s "on the split schedule the
   bullet above gives" to match.
2. **F-02 (non-blocking)** — either add the seam-side no-edit oracles to column (2)
   (`advisoryEnvelope.test.js:317-320`, `advisoryDriver.test.js:845-850`) or state that column (2)
   is enumerated for the envelope half only and why.
3. **F-03 (non-blocking)** — drop `advisoryRecord.test.js:436` from the eleven and add
   `advisoryDriver.test.js:30-31`.

Everything else in the changed block verified clean at HEAD: the five `PROP-CFG-02` inputs, the
`PROP-CFG-01` characterisation, the §1.3 attribution kept from v5 F-02, the A-15 exclusion, and
column (1)'s four.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}
