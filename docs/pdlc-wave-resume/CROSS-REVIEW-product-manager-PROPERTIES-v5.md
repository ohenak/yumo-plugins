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

The property set is measured here against TSPEC at HEAD, not against the TSPEC I approved it over.

### The one property that no longer compresses its upstream (F-01)

TSPEC §5.4 AT-05 at HEAD carries a conjunct it did not carry when I approved PROPERTIES:

> **Write-side conjunct (PM):** after the run the operator-pointed run must itself have *written* a
> record — `ledgerWrites` is non-empty and the written `lastGreenWave` is the **plan-absolute**
> number of the last wave this run completed, not a run-relative count.

and TSPEC §5.5 now opens "**Five** mutations this suite is specifically designed to kill" with a
fifth row:

> 5. **Suppressing the record write while `explicitPointer` is true** (writing only on automatic
>    runs). Killed **only** by AT-05's write-side conjunct.

PROP-OVERRIDE-01 is the property that owns AT-05 (`Traces: AT-05 (TE F-05), BR-04, REQ-WVR-04`). At
HEAD it asserts three things: resume at wave 2, no `wave ledger … was ignored` line, and the
` (provenance: operator-set)` token on the named operator banner. It asserts nothing about the
write. So the mutation TSPEC now says is killed *only* by that conjunct is killed by nothing in this
document — PROP-RECORD-01/-04 and PROP-RESUME-05, the other write-side properties, all drive
automatic-provenance runs, exactly as TSPEC §5.5 item 5 says.

Why this matters at the product level rather than as a test-design nit: REQ-WVR-04 gives the
operator pointer as the **recovery** path, and REQ-WVR-09/BR-08 make the per-wave record what makes
recovery repeatable. A build that silently stops recording on operator-pointed runs satisfies every
property in this document and still hands the operator a run they cannot resume from — which is the
user-visible failure the feature exists to remove. Whether the property carries the conjunct is a
statement about what we promise the operator, so it belongs in my lens.

The resolution is narrow: add the write-side conjunct to PROP-OVERRIDE-01 (or a new PROP-OVERRIDE-06
tracing AT-05), and take PROP-COV-03 from "PLAN §4.3's **four** mutations" to five, adding the
suppressed-write row to the mutation → oracle table in `## Fixtures` with PROP-OVERRIDE-01 as the
property that must red. Note the count is also now split against PLAN §4.3, which still lists four —
that is PLAN's cascade to resolve, not this document's, but the implementer reading PROP-COV-03 will
meet the disagreement, so PROP-COV-03 should name TSPEC §5.5's five explicitly rather than
delegating the count to PLAN.

### Properties confirmed unaffected

- **PROP-RECORD-02/-03/-04/-07/-09** cite `TSPEC §2.5 item 1/2/4/5`. §2.5's five numbered items are
  byte-identical after the erratum — the edit rewrote only the surrounding paragraph, which changed
  §2.5 from "routed upstream as an erratum" to "ratifies FSPEC §3.4 at HEAD". The item numbering
  these five properties depend on is stable, and the behaviour they pin (write inside the `waveGit`
  transport branch, after the wave's commits, `head` best-effort, plan-absolute `lastGreenWave`, no
  provenance field) is unchanged. PROP-RECORD-09's "provenance is announced content, never persisted
  state" is if anything now *better* grounded: FSPEC §3.4 at HEAD says "no record content
  distinguishes the two provenances".
- **PROP-DISREGARD-01/-02/-05 and PROP-SAFETY-04** transcribe the seven codes and the two provenance
  literals from TSPEC §3.1. The §3.1 edit changed only the prose count of *interpolated values*
  (four → five) inside the set-equality justification; the code set and the literals are untouched,
  and PROPERTIES never restates that count. Confirmed intact.
- **PROP-REPO-01/-03 and the AT-14 split**, the OB-F1-dependent gap notes, and PROP-SKIP-04's
  re-expression are all downstream of TSPEC §6.2/§6.3, where the erratum struck a *re-raise
  justification* and re-labelled four items as landed. TSPEC is explicit that OB-F1's substance —
  BL-04 unmet, AT-14 red until the rebase, the wave-sequencing precondition — is unchanged, and that
  substance is what PROPERTIES leans on. Confirmed intact.

## Oracles

The oracle table is where the AT-05 gap becomes concrete, and where one rationale now contradicts
upstream.

### PROP-OVERRIDE-01's oracle stops one assertion short (F-01, same finding)

At HEAD the oracle reads:

> `logs.filter(m => m.startsWith("Resuming at wave 2 of 3 (implementation.startWave)"))` has length 1
> and that element ends with ` (provenance: operator-set)`; plus
> `expect(logs.some(m => m.includes("was ignored"))).toBe(false)`.

Both halves are log-side. The helper the write-side needs already exists in this document —
`ledgerWrites(writes)` is declared in `## Fixtures` and is used by PROP-RECORD-01's oracle
(`expect(ledgerWrites(writes)).toEqual([])`). So the fix is an assertion, not new machinery:
`ledgerWrites(writes)` non-empty, and the parsed `lastGreenWave` of the last write equal to the
plan-absolute number of the final wave this run completed. Recording it here so the revision does not
have to rediscover that the fixture support is already in place.

### PROP-OVERRIDE-05's rationale now states the reasoning TSPEC rejected (F-04)

PROP-OVERRIDE-05 says the config-validation notice must not gain a provenance token because "it
precedes the resume decision **and** is about a rejected value, not a resolved start point", tracing
to `TSPEC §2.4 exclusion table`. TSPEC's §2.4 exclusion row at HEAD now says the opposite about the
second half of that sentence:

> **The discriminating conjunct is the first one — *the resume decision emits it*.** … The second
> conjunct does **not** discriminate here and is not what excludes it (TE): a past-the-end
> `implementation.startWave` is also a rejected value, is clamped, and still yields a start point
> that carries ` (provenance: operator-set)`.

The **assertion** is unaffected — the notice still gains no token, and PROP-OVERRIDE-05's oracle
(`.not.toContain("provenance:")` on the filtered notice) still holds. What is stale is the stated
reason, and PROPERTIES states it in a form TSPEC has explicitly ruled out as a discriminator. Left as
is, this document is the place a reader would meet the rejected reasoning, and it sits next to
PROP-OVERRIDE-03, which is the very past-the-end row that falsifies it. Low, because no oracle or
requirement mapping moves; worth fixing because the reasoning is the reason the announcement
catalogue's count is stable. Suggested edit: replace the second conjunct with "the resume decision
never emits it — config validation does, before any resume decision runs", and keep the trace.

### Oracles confirmed unaffected

- PROP-DISREGARD-11's table-driven case over "TSPEC §2.4's six rows … the five announcing rows" is
  unaffected: the erratum changed the *exclusion* row's justification prose, not the six-row table
  above it, and did not add or remove a row. The count words in PROPERTIES stay true.
- PROP-DISREGARD-01's transcription of the seven codes and PROP-SAFETY-02's three outcome literals
  are untouched by this round.
- PROP-LAW-01…04's oracles already read `fc.assert(fc.property(…), { numRuns: 500 })`. TSPEC §5.7 at
  HEAD now pins the same 500 on the same `advisoryHelperProperties.test.js` precedent, so the oracles
  are *more* aligned than when I approved them. Only the surrounding narrative is stale (F-02).

## Fixtures

_(pending)_

## Delta-Confirmation Findings

_(pending)_

## Verdict

_(pending)_
