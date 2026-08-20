# Cross-Review: product-manager — PROPERTIES (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-wave-gate/PROPERTIES-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 5
**Scope:** Delta confirmation of the round-4 erratum edit, plus re-verification of this document against its upstream at HEAD (DEC-ERR-03)

## Overview

The dispatch reports every routed item ABSORBED against upstream HEAD, so the confirmation question
is the DEC-ERR-03 one: is this PROPERTIES still a faithful compression of REQ/FSPEC/TSPEC/DECISIONS/
PLAN *as they read now*? I verified all five upstream digests against the tree before reading a line
of the delta — REQ `817b6745…`, FSPEC `82f74a2d…`, TSPEC `1531143c…`, DECISIONS `84deee10…`, PLAN
`e97acf66…` — all five match the dispatch exactly, so the base I am measuring against is the base
the orchestrator named.

**What the delta is.** Four commits (`811f3484`, `af5c3784`, `58bf21a3`, `50aa3950`) plus a lineage
commit (`0c0475a7`): +46/−21 lines across the Overview, derivation rule 1, PROP-SEAM-02, PROP-CFG-03
and two Fixtures rows. No property statement, category, level assignment, oracle form, PLAN home or
AC mapping changed — I diffed the property tables end to end to confirm that claim in the v1.2
changelog row rather than take it on trust. The edit is exactly the "grounding restatement of two
paragraphs" v4's F-01 asked for, plus the two citation re-anchors.

**Round-4 findings, disposition.**

| v4 finding | Severity | Landed? | Evidence at HEAD |
|---|---|---|---|
| F-01 file-existence paragraph asserts both `new` files "absent at HEAD" | High | **Yes** | Both paragraphs restated. `advisoryWaveGate.test.js` (1.8 K) and `pdlc/engine/__tests__/advisory-config-example.test.js` (2.5 K) are on disk; the document now says so, attributes the landing to `e3b9d5a3`, and quotes TSPEC §5.1's *Status column caveat* verbatim — I diffed the quotation against §5.1 and it matches byte for byte, including "both are on disk, the latter red because `.claude/pdlc.config.example.json` carries no `advisory` section at HEAD" |
| F-02 derivation rule 1's four cardinality sites pinned at `(5)` and stale lines | Medium | **Yes** | Rule 1 now re-anchors all four by block title, in the same words TSPEC §1.3's end-state table uses, and records them as **already reading `toHaveLength(6)` and red at HEAD**. Measured: `advisoryDisabled.test.js:629`, `advisoryQueueSeams.test.js:634`, `advisoryHarvest.test.js:578` and `:733` all read `(6)` |
| F-03 PROP-CFG-03 / Example-config row cite raw `ci-arrangement.test.js:39`, `:799`–`:819` | Low (Process) | **Yes** | Both re-anchored to `const configPath` and the test titled `ci arrangement — .claude/pdlc.config.example.json's implementation.testCommand`. Verified at `ci-arrangement.test.js:39` (the symbol) and `:789` (the title) — the title anchor is correct and the line pin it replaced had already drifted |

Beyond the routed list, the edit also re-anchored PROP-SEAM-02's member-literal pins and the `SEAMS`
fixture row off `advisoryDoubles.js:271` — a pin that had drifted to `:354`. That is the DEC-DOC-01
bar being met without being asked, and it caught real drift.

**One thing the delta did not sweep**, carried as the sole finding of this round: the
verbatim-string-discipline paragraph still pins the eight refusal reasons at
`orchestrate-dev.js:2297`–`:2306` and the exclusion ids at `:2311`. Both are raw `file:line` anchors
and both have drifted — the catalogue now spans `:2301`–`:2310`, and `:2311` lands on a comment. Low,
`Process`, inherited, non-gating.

## Properties

Scope here is the product lens only: does the property set still say what the approved requirements
say, after the erratum and after upstream moved? I re-read the property statements the delta touched
or leaned on, against upstream at the dispatched digests.

| Property | What it now says | Upstream at HEAD | Faithful? |
|---|---|---|---|
| PROP-SEAM-02 | Every cardinality-coupled transcription surface must read six, "as one set", anchored by symbol or block title; at HEAD all read six **except** `advisoryRecord.test.js`'s `rows.map((r) => r.seam)` equality, still `["A1" … "A5"]` | TSPEC §1.3's *State of these surfaces at HEAD* table: "its `rows.map((r) => r.seam)` equality **still reads `["A1" … "A5"]`** / the one test-side literal not yet transcribed" | **Yes, exactly.** I confirmed the residue independently — `advisoryRecord.test.js:496` reads the five-member list while `:505` already compares against `ADVISORY_SEAMS`. The property still states the required end state, and the new sentence is careful to say so ("the set-equality this property fixes is the end state, not the edit list"), which is the right product framing: the AC is about the shipped contract, not about who edits which line |
| PROP-CFG-03 | Example config must carry the whole `advisory` section `{"enabled": false, "waveBudgetPerRun": 1}`; asserted in the purpose-named engine file, never in `ci-arrangement.test.js` | REQ §5 C-2 (`waveBudgetPerRun` default `1`), TSPEC §4.4 and §5.1's engine-channel row | **Yes.** The default `1` in the property matches REQ C-2 at v1.9; the disposition (second reader, `ci-arrangement.test.js` stays unowned) matches TSPEC §5.1 and PLAN's manifest. Only the citation form changed |
| PROP-CTR-10 / NFR-4 | Unchanged this round | REQ v1.9 NFR-4 unchanged since v4 | Yes — v4 already confirmed this pair; nothing in the delta touches it |
| PROP-CTR-13 / `waveBudgetPerRun: 0` | Unchanged this round | TSPEC §4.4 unchanged | Yes |
| PROP-DIS-06 | Unchanged; `.enabled` count of three | TSPEC §1.3 end-state table: "**unchanged at three** — a constraint on A6, not an edit" | Yes |

**Scope compliance.** The delta adds no behaviour, no new property, no new AC. The one genuinely new
paragraph ("The `new` files are on disk at HEAD, and `new` means required end state") is *grounding*
prose, and it explicitly declines to make the product decision that is not this document's to make:
"Whether those early-landed edits are reverted or PLAN's A6 batches are re-derived around them is
PLAN's and Phase I's call, not this document's." That is the correct boundary — a PROPERTIES doc
that had picked a disposition here would have been a scope finding.

**Acceptance-criteria traceability.** The AC→property map in §C-1 is byte-unchanged in the diff, so
every P0/P1 criterion that resolved at v4 still resolves. I spot-checked the chain v4 flagged as
load-bearing: AC-6.2 → PROP-REC-03/-04/-07 → A6-17 → `advisoryEscalationLog.test.js`, which TSPEC
§5.1 still carries as an `edited` row. Intact.

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

