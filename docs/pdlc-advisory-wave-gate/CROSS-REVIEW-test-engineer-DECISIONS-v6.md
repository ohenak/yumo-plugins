# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.4)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v5.md` (v1.3)
**Delta reviewed:** `082be248..HEAD` (one commit, `ff07bc84`, DECISIONS only — 56 insertions, 30 deletions)
**Date:** 2026-08-19
**Iteration:** 6

## Context

Both v5 findings were non-gating (one Medium, one Low) and both lived in the same bullet pair. The
round spent one commit, `ff07bc84`, rewriting that pair — and it did more than close my two: it
re-derived the **seam** half of the enumeration too, which PM v5 F-01 had opened and which no
previous round had measured at HEAD. Scope held to the delta: `git diff 082be248..HEAD` touches this
file only, no decision line altered, no verdict or supersession text moved.

Four things in the delta are checkable against the repository, and I checked all four: the seam
literal's surviving-site claim, the envelope's five-transcription enumeration and its
"none of these is an oracle" characterisation, the seven already-migrated sites, and the two TSPEC
§1.3 quotations the bullets lean on. I re-read only the changed passages and re-grounded every
anchor in HEAD source rather than in the upstream documents' description of HEAD.

## Options Considered

The delta's substantive choice was how far to re-derive. My v5 findings asked only that the
envelope enumeration stop saying "still moves" about five sites that no gate touches — a two-clause
fix. The author could have made exactly that edit and left the seam half alone, which is what v1.3
did in the other direction (re-deriving the envelope half only). The revision took the wider option
and says why in-line: v1.2 sized the seam half "against a pre-`e3b9d5a3` repository", so the two
literals "read in two different tenses inside one paragraph, the seam list reading as checked
because its neighbour had been". That diagnosis is correct and the wider option was the right one —
the seam half was six times wrong, not slightly wrong (six sites claimed, one survives).

The cost of the wider option is the one this review has to price: a paragraph re-derived in a single
pass inherits whatever was wrong in the *reviews* it is closing, and one of my own v5 findings was
under-measured. F-01 below is that inheritance.

## Decision

**Both v5 findings are resolved, no High finding is open, and the delta's headline claim — the seam
literal survives at one site, not six — is true at HEAD.** Two new Medium findings are recorded; both
are corrections inside the re-derived paragraph, neither changes its conclusion.

| v5 finding | Disposition | Evidence re-verified at HEAD |
|---|---|---|
| F-01 (Medium) — enumeration framed as "a count of what still moves" when five of the sites are inputs that stay green | **Resolved.** A dedicated bullet now states it outright: "None of those five transcriptions is an oracle … all five stay green and no gate demands their edit", names the one oracle that does fail on drift, and reframes the five as hand-*copy* surfaces where "a stale copy silently re-scopes a fixture instead of reddening a suite" — with an explicit note that an implementer sizing A6 off v1.3's wording "would budget five edits no gate asks for" | All five re-confirmed as inputs: `advisoryDisabled.test.js:136` (`disabledConfig()` fixture), `:623` (inline config JSON), `advisoryHarvest.test.js:203` (config fixture), `helpers/advisoryDoubles.js:325` (`ADVISORY_DEFAULTS_SHAPE`), `:423` (generator shuffle). The one drift oracle is `advisoryEnvelope.test.js:284`, `[...devModule.ENVELOPE_DEFAULTS].sort()` against a six-member literal, red against `orchestrate-dev.js:1942`'s four members |
| F-02 (Low) — "both assert against a production default that still has four members" was true of one site only | **Resolved as to the claim I filed**, and the correction landed verbatim: "Only the first of those two asserts against production and is therefore red today". See F-01 below — the *second* half of that sentence, which I supplied in v5, is wrong at HEAD | `advisoryConfig.test.js:51` carries the six-member literal; `orchestrate-dev.js:1948` still resolves `envelope: ENVELOPE_DEFAULTS` |

**The seam re-derivation is the strongest item in the delta and it holds.** The record now claims
`["A1", "A2", "A3", "A4", "A5"]` is carried at exactly one place under `pdlc/workflows/__tests__/`.
Grepping HEAD returns exactly one such five-member array in that tree:
`advisoryRecord.test.js:496`, `expect(rows.map((r) => r.seam)).toEqual([...])`, and it does sit
inside `PROP-SUM-01` (`describe` at `:492`). The five sites v1.2 listed beside it are all at the
six-member value: `advisoryEnvelope.test.js:317`, `advisoryRecord.test.js:544` (`test.each`),
`advisoryHarvest.test.js:580`, `consolidationProperties.test.js:250`,
`helpers/advisoryDoubles.js:354`. The commit boundary the record blames for v1.2's staleness checks
out too: `git log -S'"A1", "A2", "A3", "A4", "A5", "A6"'` over those files returns exactly one
commit, `e3b9d5a3`, whose diffstat touches `advisoryHarvest.test.js`,
`consolidationProperties.test.js` and `helpers/advisoryDoubles.js`.

**Both TSPEC quotations are verbatim and correctly anchored.** "the one test-side literal not yet
transcribed" is `TSPEC:305`'s per-seam-report-rows drift row, and it is that row's own words for
`advisoryRecord`'s `rows.map` equality. The claim that §1.3's `ADVISORY_DEFAULTS` row "records a
*different* drift … and says nothing about that file's envelope member" is accurate: `TSPEC:304`
names only `waveBudgetPerRun: 1` against an absent production key. "Three production constants" is
backed by `TSPEC:274`, which names `ADVISORY_SEAMS` / `ENVELOPE_DEFAULTS` / `ADVISORY_DEFAULTS` as
the three surfaces BL-06 requires to move together.

## Findings

## Questions

## Positive Observations

## Consequences

## Recommendation

## Verdict
