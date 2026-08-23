# Cross-Review: product-manager — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md
**Upstream that moved:** docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md (round-5 erratum, v1.3 → v1.4)
**Date:** 2026-08-23
**Iteration:** 5 (upstream-cascade confirmation)

## Overview

**Question answered here (one question only).** PROPERTIES' own bytes are unchanged since my v4
approval (`ba751b76` recorded the anchors; the last content commit is `91ce118c`). TSPEC moved under
it: commits `e75295b6..31df4eda` are a round-5 erratum taking TSPEC 1.3 → 1.4. The question is
whether PROPERTIES is still a faithful compression of TSPEC **as it now stands**. I did not re-read
PROPERTIES from scratch and I have not re-opened anything settled in rounds 1–4.

**What moved upstream, and whether PROPERTIES leans on it.** Seven edits landed in TSPEC; I checked
each against what PROPERTIES cites.

| TSPEC edit (round 5) | Does PROPERTIES lean on it? | Still faithful? |
|---|---|---|
| §5.7 generative run count **pinned at `numRuns: 500`** (was "fast-check's default") | Yes — PROP-LAW-01…04 pin 500, `## Fixtures` argues the divergence, and the routed-errata table records it as open | Substance yes, **record no** (F-02) |
| §5.8 `c8.include` restated as **four** entries incl. `**/scripts/capture-learnings-baseline.mjs` | Yes — PROP-COV-01 and § 11's measured baseline already carry four; the routed-errata table records the three-entry list as an open defect | Substance yes, **record no** (F-03) |
| §5.4 AT-05 gains a **write-side conjunct**; §5.5 gains a **fifth mutation** | Yes — PROP-OVERRIDE-01 owns AT-05, PROP-COV-03 owns the mutation duty | **No** (F-01) |
| §2.4 exclusion column: the **first** conjunct ("the resume decision emits it") is the discriminator; the rejected-value conjunct explicitly does **not** discriminate | Yes — PROP-OVERRIDE-05's rationale is the rejected-value conjunct | **No** (F-04) |
| §2.5 restated as a ratification of FSPEC §3.4 (from "routed upstream") | Yes — PROP-RECORD-02/03/04/07/09 cite `§2.5 item 1/2/4/5` | **Yes** — the five numbered items and their content (transport branch, after-commits ordering, `head` stamping, plan-absolute `lastGreenWave`) are byte-unchanged; only the surrounding provenance prose moved |
| §3.1/§6.1 interpolated-value count four → **five** | No — PROPERTIES cites §3.1 for the *seven codes* and the *provenance literals* only, never for a value count | **Yes** |
| §6.2 OB-F1 re-raise struck; §6.3 items 1–4 recorded as landed upstream; §1.3 repointed at REQ OB-1 | No — PROPERTIES' G-tables and gap notes cite the OB-F1 *substance* (BL-04 unmet, AT-14 red, wave sequencing), which is explicitly unchanged | **Yes** |

**Bottom line.** Five of the seven edits leave PROPERTIES intact. Two do not: one is a real coverage
gap the erratum opened (F-01, High), and the rest are the document's routed-errata ledger and one
rationale now describing a TSPEC that no longer exists (F-02/F-03/F-04). The items in the ledger
landing upstream is necessary but not sufficient — what fails here is that PROPERTIES now *asserts
they are open*, which a reader takes as live instruction to the implementer.

**Scope note.** This is a product-lens confirmation: requirement traceability, acceptance-criterion
fidelity, and whether the compression still says what upstream says. Test-design depth and
engineering feasibility remain with te-review and se-review.

## Properties

_(pending)_

## Oracles

_(pending)_

## Fixtures

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
