# Cross-Review: software-engineer — PROPERTIES (delta confirmation, round 5)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 5 (delta confirmation of the round-4 erratum)

## Overview

**Scope of this round.** Delta confirmation only. The dispatch reports every routed item ABSORBED
against upstream HEAD, so the question is not "did the items land" but the DEC-ERR-03 question:
measured against its upstream *at the versions named in this dispatch*, is PROPERTIES still a
faithful compression of them?

**Upstream at HEAD, verified.** I re-hashed all five upstream documents in the working tree; every
one matches the sha256 given in the dispatch (REQ `817b6745…`, FSPEC `82f74a2d…`, TSPEC `1531143c…`,
DECISIONS `84deee10…`, PLAN `e97acf66…`). So the upstream I read is the upstream this confirmation
is measured against — no silent drift underneath the round.

**The delta.** Six commits (`811f3484`…`0c0475a7`), +46/-21 lines, all prose. Nothing in the
property statements, categories, level assignments, oracle forms or PLAN homes moved — I diffed the
tables and confirmed the only table-cell edits are inside PROP-SEAM-02's and PROP-CFG-03's
*Property* cells and two Fixtures rows, and each of those edits changes a citation or a HEAD-state
sentence, never an assertion.

**Round-4 findings, disposition.**

| v4 finding | Severity | State after the delta |
|---|---|---|
| F-01 — Overview records both `new` files "verified absent at HEAD" | High | **Resolved.** Both files are on disk (`pdlc/workflows/__tests__/advisoryWaveGate.test.js`, `pdlc/engine/__tests__/advisory-config-example.test.js`); the paragraph now says so and quotes TSPEC §5.1's *Status column caveat* accurately, ellipsis and all. |
| F-02 — derivation rule 1 claims the four bare row-count sites read `toHaveLength(5)` at HEAD | High | **Resolved.** All four now recorded as already reading `6` and red at HEAD; I checked each site (see Oracles below). |
| F-03 — PROP-SEAM-02 carries raw line pins TSPEC re-anchored | Medium | **Resolved.** Re-anchored to symbol and block-title anchors per DEC-DOC-01, matching TSPEC §1.3's own re-anchoring. |
| F-04 — `ci-arrangement.test.js:799`–`:819` pins wrong | Low | **Resolved.** PROP-CFG-03 and the Example-config fixture now anchor on `const configPath` and the test title. |
| F-05 — Scope derives from "TSPEC v1.6" | Low | **Resolved.** Now TSPEC v1.10. |

**Nothing previously approved broke.** The edits are additive prose plus citation re-anchoring; no
property lost a requirement trace, a PLAN task home or a level.

## Properties

I re-read the two property rows the delta touched against TSPEC at `1531143c…`.

**PROP-SEAM-02.** The rewritten cell states the invariant unchanged — every cardinality-coupled
transcription surface reads six, as one set — and now anchors its members by symbol or block title:
`advisoryDriver.test.js`'s module-scope `GATE_EXCLUSIVITY_REGISTRY` and the set-equality `it`;
`advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality and its `test.each` seam list;
`advisoryHarvest.test.js`'s `seamNames` equality; `consolidationProperties.test.js`'s `rng.pick([…])`
seam list; `helpers/advisoryDoubles.js`'s `SEAMS` literal; and the four bare row-count sites by
reference to derivation rule 1. That is the same member set TSPEC §1.3's *required end state* table
enumerates, in the same anchoring style TSPEC adopted this round. The added HEAD sentence — every
one already reads six *except* `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality, which
still reads `["A1" … "A5"]` — is exactly what TSPEC §1.3's *State of these surfaces at HEAD* table
says ("the one test-side literal not yet transcribed"), and it is true on disk:
`advisoryRecord.test.js:496` reads `toEqual(["A1", "A2", "A3", "A4", "A5"])`, while `:505` already
compares against `devModule.ADVISORY_SEAMS`. The distinction the cell draws — the property fixes
the end state, not the edit list — is the right altitude for PROPERTIES and keeps the remedy
question (revert `e3b9d5a3` vs. re-derive A6 batches) where TSPEC routed it, to PLAN.

**PROP-CFG-03.** The assertion is untouched: the whole `advisory` section present, both keys, a
non-negative integer `waveBudgetPerRun`, plus the `implementation.testCommand` blast-radius
conjunct with both regexes verbatim. Only the *precedent* citation changed, from drifted line pins
to `const configPath` and the test title — both of which exist at HEAD
(`ci-arrangement.test.js:39` declares `const configPath`, and the test titled
`ci arrangement — .claude/pdlc.config.example.json's implementation.testCommand` is at `:789`). The
"never in `ci-arrangement.test.js`" batch-safety rule and the "`ci-arrangement.test.js` stays
unowned by PLAN" clause survive unchanged, which is the part FSPEC §5.1's required-check oracle
depends on.

**No other property row moved.** PROP-SEAM-01/03/04/05, the REC/GATE/CTR/ENV/REST/NFR families and
their PLAN task homes are byte-identical to the version I reviewed in v4.

## Oracles

The delta's load-bearing claim is derivation rule 1's re-grounding, and it is a claim about existing
code, so I checked all four sites on disk rather than trusting the prose.

| Site as PROPERTIES anchors it | On disk at HEAD | Verdict |
|---|---|---|
| `advisoryDisabled.test.js`'s `T-10-5 / PROP-DIS-05 — enabled-but-quiet reports five zero rows (S-1)` block | block title matches verbatim; `expect(result.advisory.rows).toHaveLength(6)` at `:629` | ✅ |
| `advisoryQueueSeams.test.js`'s assertion with trailing comment `ADVISORY_SEAMS drives the row list (S-1)` | `:634`, `toHaveLength(6)`, comment verbatim | ✅ |
| `advisoryHarvest.test.js`, the site immediately above the `seamNames` literal | `:578` `toHaveLength(6)`, `:579` `const seamNames = …` | ✅ |
| `advisoryHarvest.test.js`, the site whose neighbourhood is `rows.find((r) => r.seam === "A1")` | `:733` `toHaveLength(6)`, `:734` the lookup | ✅ |

All four read six and are red against a five-row report, because
`orchestrate-dev.js`'s `ADVISORY_SEAMS` is still the frozen five-member array — which is what TSPEC
§1.3 records as the unmoved production half. So PROPERTIES' new sentence is now the same statement
its upstream makes, in the same direction, and a Phase I author reading either one will expect the
same baseline: red before the wave opens, with the production constant as the pending edit.

The anchoring style is the other thing worth confirming: these are block titles and trailing
comments, not `file:line`, so the round did not trade one drift-prone citation for another. That is
DEC-DOC-01 applied, not merely cited.

Oracle *forms* are unchanged everywhere. No property gained or lost a positive conjunct, no
absence-only oracle appeared, and the negative controls (PROP-REC-07's `unknown`/`unknown` arm,
PROP-SEAM-05's byte-for-byte baseline) read exactly as approved.

## Fixtures

Two fixture rows changed, and one whole-document check applies here.

**`SEAMS` literal row.** Was: "verified at HEAD as five at `helpers/advisoryDoubles.js:271`". Now:
the `const SEAMS` declaration already carries the six-member form at HEAD, so the row records the
required end state. On disk, `helpers/advisoryDoubles.js:354` reads
`const SEAMS = ["A1", "A2", "A3", "A4", "A5", "A6"];` — the old claim was doubly wrong (wrong count,
wrong line) and the new one is right and line-free. Matches TSPEC §1.3's "already carry six members
and an A6 double".

**Example-config fixture row.** Re-anchored off `ci-arrangement.test.js:39` / `:799`–`:819` onto
`const configPath` and the `implementation.testCommand` test, and it now spells the two regexes
inline so the pre-edit baseline is readable without chasing a line number. Both anchors verified on
disk. The verbatim-string discipline paragraph below the table still governs, and the two regexes
are byte-identical to the ones in PROP-CFG-03 — no duplication drift between the property and its
fixture.

**Residual raw line pins (the one thing this round did not sweep).** The erratum re-anchored the
citations round 4 flagged, but the same DEC-DOC-01 class survives untouched elsewhere in the
document, and several of those pins have drifted by ~4 lines at HEAD:

| Citation | At HEAD |
|---|---|
| PROP-REC-07: `ADVISORY_SEAM_PHASES` "module-private at `orchestrate-dev.js:3108`" | declaration is at `:3112` (`:3108` is a comment line) |
| PROP-REC-07: `unknown` fallback at `orchestrate-dev.js:3338` | the `ADVISORY_SEAM_PHASES[seam]` lookup is at `:3342` |
| PROP-GATE ledger note: `orchestrate-dev.js:3428`, `:3459` | `:3428` is blank; the `ADVISORY ESCALATION:` notice is at `:1584`/`:3585` |
| Fixtures/Overview: eight refusal reasons `orchestrate-dev.js:2297`–`:2306`; five exclusion ids `:2311` | catalogue is `:2301`–`:2310`; `ADVISORY_EXCLUSIONS` is `:2315` |

`advisoryDodSeams.test.js:371` is the one raw pin still accurate (`mkdtempSync(join(tmpdir(), …))`).
These are inherited — pre-round bytes this edit did not touch — and per DEC-DOC-01 they are Low,
`Process`-flavoured findings, not gating. I record them so the next erratum, if one is opened for
another reason, can finish the sweep in one pass rather than one pin per round; opening a round
*solely* for them would cost more than it buys.

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
