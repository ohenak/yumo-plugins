# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/PROPERTIES-pdlc-decision-ledger.md` (v1.1)
**Date:** 2026-08-29
**Iteration:** 2

## Delta scope

Base reviewed at v1: `9d8dc6db9^`. Delta: `git diff 9d8dc6db9^..HEAD -- PROPERTIES-*.md` = **106 insertions,
38 deletions** over nine commits (`9d8dc6db9`…`ae0a4a5f0`), all cited to round-1 findings. Sections
touched: the version block's v1.1 changelog, PROP-CFG-06, the BND conjunct table and the note beneath
it, FAIL's `Traces`, the DISC preamble/table and the census-provenance paragraph, ORC-04 clause (b),
and §Coverage Matrix (family rows, new module manifest, pyramid arithmetic, AT map, upstream-obligation
table). I re-derived every existing-code claim the delta introduces or moves; unchanged sections were
not re-reviewed.

Existing-code claims new in this delta, all reproduced at HEAD:

| Claim | Where | Result |
|---|---|---|
| `documentOracles.test.js` filters four prefixes and asserts `expect(count).toBe(102)`, cited `:398–420` | PROP-DISC-07 | **Reproduced** — filter at `documentOracles.test.js:412–419`, `expect(count).toBe(102)` at `:420` |
| Eight HEAD symbols importable from `pdlc/workflows/orchestrate-dev.js`, plus `runCaptureScript` from `scripts/capture-learnings-baseline.mjs` | PROP-DISC-09 | **Reproduced** — all eight carry an `export` at HEAD; `runCaptureScript` exported at `scripts/capture-learnings-baseline.mjs:122`. The path is repo-root-relative and correct |
| `plugin.json` HEAD version `0.23.6`; `pdlcPluginCompat: "^0.23.0"` | PROP-DISC-08 | **Reproduced** — `pdlc/.claude-plugin/plugin.json:4`, `pdlc/engine/package.json:18` |
| `PROP-DIS-06` is `pdlc-advisory-tier`'s id, at `advisoryDisabled.test.js:711` and referenced in `orchestrate-dev.js:9263` | §Census prose | **Reproduced** — `describe("PROP-DIS-06 …")` at `advisoryDisabled.test.js:711`; the destructuring comment naming PROP-DIS-06 at `orchestrate-dev.js:9263` |
| `parseLearningsConfig` returns `degraded(false)` for a non-plain-object top level and reserves `degraded(true)` for a present non-plain-object section | PROP-CFG-06 | **Reproduced verbatim** — `orchestrate-dev.js:2268` (`!isPlainObject(parsed)` → `degraded(false)`) and `:2271` (`!isPlainObject(section)` → `degraded(true)`) |
| 101 property rows partitioned `10+11+9+6+12+11+5+10+11+6+10` | §Coverage Matrix | **Reproduced** — mechanical count of line-leading `| **PROP-…**` rows is exactly 101, and the per-family counts match the stated partition term for term |
| All 24 `PLAN` task ids named | §Coverage Matrix | **Reproduced** — each of T-00, T-00a, T-01…T-12a, T-13…T-20 occurs at least once |

Not one figure is off, and the module manifest's fourteen rows are a faithful transcription of `PLAN`'s
file-ownership manifest (`PLAN`:145–186) in owner **and** batch for every row.

## Prior findings — disposition

| v1 | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | PROP-DISC-07 now states the split explicitly and names `PLAN` **T-00a** (batch 1) as the owner of the exclusion edit, quoting T-00a's own title. The batch-1 required-check hazard I raised is gone: the exclusion lands in the batch that adds the first three `decisionLedger*` modules, matching `PLAN`:99. §Coverage Matrix's DISC row and the module manifest both carry the same owner. |
| F-02 | Medium | **Resolved** | PROP-DISC-08 is now owned by **T-20** (batch 10), matching `PLAN`:121 and `PLAN`'s file-ownership rows for `pdlc/workflows/dist/pdlc-cli.mjs` and `pdlc/.claude-plugin/plugin.json` (`PLAN`:185–186). The manifest adds the explicit "T-20 owns no test module by design" row, which is the honest form. |
| F-03 | Medium | **Resolved** | A module manifest table now names all fourteen test files with owning task and batch; the two previously id-less modules get **PROP-DISC-09** (`decisionLedgerPreflight.test.js`, T-00) and **PROP-DISC-10** (`decisionLedgerFixtureGuard.test.js`, T-03); INV's row names `decisionLedgerCensus.test.js` under T-11 → T-18 (`PLAN`:167, :243); OFF's row correctly records T-02 as having **no** red predecessor (`PLAN`:251). All four contradictions I listed are gone. |
| F-04 | Medium | **Resolved** | The pyramid is restated as a partition summing to **101**, and the count is checkable: the document's line-leading property rows number exactly 101, family by family. The superseded "47 / 11 / 37" reading is explicitly retracted rather than silently dropped. |
| F-05 | Medium | **Resolved** | PROP-BND-07 is a numbered conjunct row (`✖`, Category Contract) with its own falsifying mutation column, BND re-counted at 12, and it is discharged at AT-13. |
| F-06 | Medium | **Resolved** | PROP-CFG-06 now carries a positive return conjunct — three defaults, `invalidKeys: []`, `sectionMalformed: false` — on **each** input in its range, with the `false` (not `true`) value correctly derived from the shipped `parseLearningsConfig` short-circuit. The stub-returning-`undefined` escape is closed. |
| F-07 | Low | **Resolved** | The dangling id is now labelled as a deliberate cross-feature reference to `pdlc-advisory-tier`'s PROP-DIS-06, with both referents cited; I verified both. |
| F-08 | Low | **Resolved** | The three BND ranges are reconciled on one surface and the whole family is mapped to AT rows (01…04, 07, 12 → AT-13; 08, 09 → AT-14; 05, 06, 10, 11 → AT-15), which closes the two properties that no AT discharged. One stale fourth spelling survives in §Overview — F-03 below, Low. |

No prior finding regressed, and the delta introduced no factual error: every claim it adds reproduces at HEAD.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | PROP-DISC-07's second conjunct is attributed to `T-12a → T-19`, but `PLAN`:99 makes it half of **T-00a**'s two-sided acceptance; `PLAN`:104 gives T-12a a different obligation | §DISC preamble, PROP-DISC-07 |
| F-02 | Medium | Local | `PLAN` T-12a's terminal namespace census — twelve module names asserted by **set equality** — is owned by no property; the document routes it to prose instead | PROP-DISC-07's note, §Coverage Matrix |
| F-03 | Low | Local | §Overview's O-8 row still spells the discharge `PROP-BND-01…06`, a fourth range not covered by the new "three BND ranges reconciled once here" paragraph and disagreeing with §Coverage Matrix | §Overview O-8 row |

### F-01 (Medium) — the two halves are split one task later than `PLAN` splits them

The repair to my v1 F-01 landed the important half: the exclusion edit is now T-00a, batch 1, and the
batch-1 required-check hazard is gone. But the delta also assigns the *second* conjunct — "the filtered
count is still `102` once all twelve exist" — to `PLAN` **T-12a → T-19**, batch 9, in two places
(§DISC preamble, and PROP-DISC-07's "The two halves have different owners" sentence). `PLAN`:99 states
T-00a's acceptance is itself two-sided: *"Acceptance is two-sided: the exclusion lands **and** the
filtered count is still `102`"*. Both conjuncts are T-00a's, and both are satisfiable in batch 1 —
excluding the namespace pins the complement, whose value does not depend on how many `decisionLedger*`
modules exist yet, which is exactly why T-00a can be green-at-both-ends.

This is not a scheduling hazard the way v1's F-01 was — a redundant recheck at batch 9 is harmless —
but the document is the traceability surface, and an implementer reading it will believe T-00a's
acceptance is one-sided and stop after the filter edit. **What must change:** state both conjuncts as
T-00a's (batch 1), and give T-12a → T-19 the obligation `PLAN` actually assigns it — F-02.

### F-02 (Medium) — `PLAN` T-12a's set-equality census has no owning property

`PLAN`:104 gives T-12a, beyond the disclosure family, *"one conjunct asserting that the
`pdlc/workflows/__tests__/decisionLedger*.test.js` names are **set-equal** to the twelve names
hand-transcribed from this PLAN's file-ownership manifest … It is a set, not a count, so a dropped or
renamed module names itself in the failure."* That conjunct appears nowhere as a `PROP-*`. The
document instead writes, under PROP-DISC-07's note, that the module count *"is pinned separately by
`PLAN`'s file-ownership manifest … verified by enumeration of the PLAN's own task table"* — an
enumeration in prose, not an oracle in a test.

That leaves a `PLAN`-mandated set-equality assertion with no property behind it, in a document whose
own stated standard is that enumerated contracts are checked by set equality so a deleted case fails
(the same standard PROP-CFG-05, PROP-CFG-09, PROP-DISC-02 and PROP-DISC-10 are held to). It is also
the one assertion that would catch a module silently dropped from the twelve during batches 3–8 — the
failure mode the namespace exclusion, by design, makes invisible to the `102` count.

**What must change:** add `PROP-DISC-11` — the `decisionLedger*.test.js` name set in
`pdlc/workflows/__tests__/` must be set-equal to a hand-transcribed twelve-name literal, owner
`PLAN` T-12a → T-19 — and re-point the DISC preamble's T-12a mapping at it. DISC becomes 11 and the
partition 102; both are one-line edits given the delta's new arithmetic.

### F-03 (Low) — a fourth BND range survives the reconciliation

The new paragraph reconciles *"the three BND ranges quoted elsewhere"* as `01…07` (ORC-05's conjunct
table), `01…12` (the family) and `01…04` (the mutation subset). §Overview's obligation table still
reads *"PROP-BND-01…06 (`TSPEC` §7.5's four conjuncts …)"* for O-8, while §Coverage Matrix's
upstream-obligation row for the same O-8 now reads `PROP-BND-01…04` plus `PROP-BND-07`. Three
spellings of one discharge, and the paragraph that exists to reconcile them does not mention the
§Overview one. **What must change:** re-point §Overview's O-8 row at the §Coverage Matrix spelling, or
add it to the reconciliation's list.

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-DISC-09 asserts the nine-name list by "set equality". I read the left side as *the subset of the nine that actually imports*, compared against the nine-name literal — non-vacuous, since a dropped symbol shrinks it. If instead the intent is "the module's export set equals the nine names", that is false at HEAD (`orchestrate-dev.js` exports far more) and the test cannot be written. Worth one clause fixing which side is which; the batch-1 guard is only as good as that. |
| Q-02 | My v1 Q-03 (whether FX-CORPUS's per-file digests must be re-transcribed if an unrelated feature rewrites one of the 25 `DECISIONS-*.md` on `main`) is now partly answered by PROP-DISC-10 — the guard reds on drift. It still does not say what the operator should **do** when it reds. Is the intended remedy always "the fixture is frozen at `8c673a09f`; investigate why it moved", never "re-capture"? If so, that sentence belongs in PROP-DISC-10's failure text, since re-capture is the reflex a digest mismatch invites. |

## Positive Observations

- **Every repair is grounded, not asserted.** PROP-CFG-06's new positive conjunct does not just demand
  a return value — it derives the specific value (`sectionMalformed: false`, not `true`) from the
  shipped `parseLearningsConfig` short-circuit, and I confirmed the derivation line for line at
  `orchestrate-dev.js:2268` and `:2271`. That is the difference between closing the absence-only hole
  and moving it.
- **The pyramid repair replaced an unfalsifiable claim with a checkable one.** "101 properties over 11
  families, `10 + 11 + 9 + 6 + 12 + 11 + 5 + 10 + 11 + 6 + 10 = 101`" is mechanically verifiable from
  the document's own rows in one command, and it verifies. The superseded reading is retracted in
  place, with the reason (BND double-counted, OFF and DISC outside the breakdown), so a reader of the
  next revision cannot re-derive the old number by accident.
- **The module manifest is the right shape for the "none orphaned" claim.** Owner *and* batch per row,
  set-equal to `PLAN`:145–186 in both directions over test files, with T-20's module-less-ness stated
  as a design fact rather than papered over. I checked all fourteen rows against `PLAN`; every owner
  and batch matches.
- **PROP-DISC-09 and PROP-DISC-10 are genuinely load-bearing, not id-assignment for its own sake.**
  PROP-DISC-09's "existence only, so it passes at HEAD" clause is the correct discipline for a
  green-at-both-ends batch-1 guard, and PROP-DISC-10's two-way pin (path set **and** per-file digest)
  is what keeps ORC-01's transcribed byte literals honest against a silently re-synced fixture.
- **PROP-OFF-06's promotion to AT-14 names the right property.** "All three zero cases produce a
  dispatch byte-identical to PROP-OFF-01's stream … no rule text standing alone above a missing index"
  is the criterion AT-14 states, and pairing it with PROP-FAIL-06 on the same row — with the reason
  spelled out, that a zero-record corpus shares E-6's bytes with a *failed* read — is exactly the
  absence/positive pairing this review asks for elsewhere.

## Recommendation

**Approved with minor changes**

My one High from v1 is resolved and the fix is the right one: the census exclusion is T-00a's batch-1
obligation, so the batch-1 required-check red I diagnosed cannot occur. Seven further findings are
resolved, none regressed, and every claim the delta adds reproduces at HEAD. Two Mediums and a Low
remain, all in the same neighbourhood — the DISC family's task attribution (F-01) and the one `PLAN`
conjunct that still has no property (F-02), plus a stale range in §Overview (F-03). None of them
blocks: they are traceability repairs the author can land in a single pass, and none changes a
property's content, a fixture, or a byte literal.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
