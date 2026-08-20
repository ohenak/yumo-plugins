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

## Oracles

## Fixtures

## Findings

## Questions

## Positive Observations

## Recommendation

