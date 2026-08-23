# Cross-Review: software-engineer — PROPERTIES (upstream-cascade confirmation)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-wave-resume/PROPERTIES-pdlc-wave-resume.md
**Date:** 2026-08-23
**Iteration:** 5 (upstream-cascade confirmation — TSPEC v1.3 → v1.4)

## Overview

**Question answered.** PROPERTIES' own bytes have not moved since my v4 approval. TSPEC has: my v4
recorded `UPSTREAM-STATE: TSPEC sha256:5ed76227…`, which is TSPEC at commit `03483136` (v1.3); TSPEC
at HEAD is `sha256:4b5f7f5b…` (v1.4). The approval was therefore taken against a version of TSPEC
that no longer exists, and the only question here is whether PROPERTIES is still a faithful
compression of the TSPEC that now stands. This is **not** an item-list check: I re-read the upstream
text PROPERTIES actually leans on at its current version, per DEC-ERR-03.

**Measured delta.** `git diff 03483136 HEAD -- docs/pdlc-wave-resume/TSPEC-pdlc-wave-resume.md`
lands nine commits, of which seven change body text PROPERTIES cites:

| TSPEC edit | Section | Does PROPERTIES lean on it? |
|---|---|---|
| Version 1.3 → 1.4, round-5 erratum changelog | header, §7 | No — version cell only |
| §1.3 repointed at REQ OB-1's HEAD (v1.7) framing; citation defect closed | §1.3 | No — PROPERTIES makes no OB-1 claim |
| §2.4 exclusion column now names the **first** conjunct as the discriminating one | §2.4 | Yes — PROP-OVERRIDE-05; still faithful (see § Properties) |
| §2.5 restated from "FSPEC does not state" to ratification of the FSPEC §3.4 clause now at HEAD | §2.5 | Yes — PROP-RECORD-02/03/04/07/09; still faithful |
| §3.1 / DEC-WVR-06: interpolated-value count four → **five** | §3.1, §6.1 | No count claim in PROPERTIES; the verbatim-string rule at § Fixtures is unaffected |
| **AT-05 gains a write-side conjunct; §5.5 grows from three to five mutations** | §5.4, §5.5 | Yes — and PROPERTIES no longer matches (F-01) |
| §5.7 pins `numRuns: 500`; §5.8 corrects `c8.include` to four `**/`-anchored entries | §5.7, §5.8 | Yes — the *substance* already agreed; the routed-erratum bookkeeping is now stale (F-02, F-03) |

**Shape of the result.** The two erratum items PROPERTIES routed upstream against TSPEC have both
landed the way PROPERTIES argued, so its properties and oracles get *more* correct, not less — but
its § "Findings routed upstream" table still reports them as open and still promises `ERRATUM: TSPEC`
lines, which re-raises settled questions (the defect DEC-ERR-01 names, and which that same section
cites). Separately, the AT-05 / §5.5 edit added a normative obligation PROPERTIES has no property
and no mutation row for. That last one is a fidelity gap, not bookkeeping, and it gates.

**Not re-litigated.** Everything settled in rounds v1–v4 — the AT-14 two-property split, the
outcome-catalogue set-equality design, the H-1 event-sink ordering oracles, the coverage-floor
scoping to `orchestrate-dev.js`, the pyramid budget — is untouched here and stays approved.

## Properties

**§5 Operator override — AT-05 now carries a conjunct no property asserts (F-01).** TSPEC §5.4's
AT-05 row at HEAD (`TSPEC:756`) has grown a third conjunct beyond the resume point and the
provenance token:

> **Write-side conjunct (PM):** the run must show that the operator-pointed run itself *written* a
> record — `ledgerWrites` non-empty, the written `lastGreenWave` the **plan-absolute** number of the
> last wave the run completed, not a run-relative count.

PROPERTIES' AT-05 owner is PROP-OVERRIDE-01 (`PROPERTIES:170`, coverage matrix row
`PROPERTIES:530`), and it asserts exactly two things: resume at wave 2 with no `wave ledger … was
ignored` line, and the provenance token on the named banner. There is no write-side conjunct, and no
sibling property covers it: every PROP-RECORD-01…10 fixture drives an **automatic**-provenance run
(§7), so none of them exercises the `explicitPointer` arm. AT-05's write side is, at HEAD, traced to
nothing.

This is a real behavioural hole rather than a wording mismatch. TSPEC's own justification for adding
the conjunct is that a mutation suppressing the write while `explicitPointer` is true leaves AT-05,
AT-07, AT-15 and AT-18 green — i.e. it survives the whole suite as PROPERTIES currently specifies it
— "removing resume from exactly the recovery path §2.5 ratifies the write for". §2.5's ratification
is now anchored on FSPEC §3.4 at HEAD ("an operator-pointed run records exactly as any other run
does … no record content distinguishes the two provenances"), so the behaviour is specified upstream
and unowned downstream.

**Fix is small and additive.** Add the conjunct to PROP-OVERRIDE-01 (or a PROP-OVERRIDE-06 owned by
T-07 on the same fixture): on the `startWave: 2` run, `ledgerWrites(writes)` is non-empty and the
written `lastGreenWave` equals the plan-absolute number of the last completed wave. Same fixture,
same file, no new harness — the H-1 sink and `ledgerWrites` helper already exist in § Fixtures.

**§11 Coverage and mutation duty — the count is pinned at four (F-01, same finding).**
PROP-COV-03 (`PROPERTIES:234`) requires "PLAN §4.3's **four** mutations" to be applied and observed,
and it traces to `PLAN §4.3 (F-04), TSPEC §5.5`. TSPEC §5.5 at HEAD (`TSPEC:790`) opens "**Five**
mutations this suite is specifically designed to kill", the fifth being the suppressed write under
`explicitPointer`. PROPERTIES therefore under-counts a duty it names TSPEC §5.5 as a source for.
PLAN §4.3 still says four (`PLAN:347`), so PLAN lags the same edit — but that is PLAN's cascade to
answer, not a reason for PROPERTIES to stay at four while citing §5.5.

**§2.4 exclusion — still faithful, no finding.** The §2.4 edit renamed which conjunct discriminates
(the first: *the resume decision emits it*) without changing the exclusion or the catalogue's shape.
PROP-OVERRIDE-05 states the excluded notice as "it precedes any resume decision and is about a
rejected value" — the first conjunct is the one it leads with, so the property reads correctly
against the new column. The dependent count is also intact: TSPEC still says the changed shipped
assertions "remain exactly three" (`TSPEC:277`, §2.4 heading at `TSPEC:295`), which is the figure
PROP-OVERRIDE-05 pins.

**§2.5 ratification — still faithful, no finding.** The rewrite removed the "unspecified upstream /
raised as an erratum" framing and replaced it with ratification of the landed FSPEC §3.4 clause. The
five §2.5 items PROP-RECORD-02/03/04/07/09 trace by number are unchanged and still say what those
properties compress. PROPERTIES carries no "FSPEC does not state" language of its own (grepped: no
hits for `FSPEC does not`, `no clause`, `unspecified`), so nothing there went stale.

**§3.1 interpolated-value count — no exposure.** The four → five correction is confined to a count
sentence and the DEC-WVR-06 rejection rationale. PROPERTIES asserts no such count; its dependency on
§3.1 is the verbatim-string ownership rule, which is unchanged.

## Oracles

**PROP-OVERRIDE-01's oracle needs one more assertion, not a redesign.** The oracle at
`PROPERTIES:336` filters logs by the banner prefix, asserts length 1 and the trailing
` (provenance: operator-set)`, plus `expect(logs.some(m => m.includes("was ignored"))).toBe(false)`.
Both halves survive the upstream edit unchanged — AT-05's first two conjuncts are byte-identical at
v1.4. What is missing is an oracle over `writes`: the same integration fixture already threads the
write log that PROP-RECORD-01's `ledgerWrites(writes)` oracle reads, so the addition is one
`expect(ledgerWrites(writes)).not.toEqual([])` plus a plan-absolute `lastGreenWave` equality on the
last entry. Level stays `I`, owner stays T-07, no fixture is added.

**The mutation → oracle map is now a four-row table against a five-row catalogue (F-01).**
`PROPERTIES:374` opens "Four mutations, and the property task must **run** them (PLAN §4.3, TSPEC
§5.5)" and lists: delete ancestry guard; move record outside `if (waveGit)`; record run-relative
wave number; resolve ancestry probe eagerly. TSPEC §5.5's fifth row — suppress the record write
while `explicitPointer` is true — has no row here, and by construction it cannot get one until
PROP-OVERRIDE-01 grows the write-side conjunct: TSPEC states the mutation is "killed only by AT-05's
write-side conjunct". So the map's missing row and the missing property conjunct are one defect with
two surfaces, and both must land together or the new row would name an oracle that cannot go red.

Note the map's third row already asserts plan-absolute recording (PROP-RESUME-05 / PROP-RECORD-04)
— but only on **automatic** runs. It does not subsume mutation 5: a mutation guarded on
`explicitPointer` leaves every automatic-provenance fixture untouched, which is precisely why TSPEC
predicts AT-05/07/15/18 stay green under it.

**Everything else in § Oracles holds.** The four rules the oracles are held to, the `toEqual`-over-
`toContainEqual` discipline that kills the eager-probe mutation (PROP-DISREGARD-07), the H-1 event
sink as the sole ordering witness (PROP-SAFETY-01, PROP-RECORD-03), and the set-equality oracles for
`RESUME_OUTCOMES` / `RESUME_PROVENANCE` / `WAVE_IGNORE_REASONS` all cite TSPEC sections the round-5
erratum did not touch. §3.2's eight-row guard table, which PROP-SAFETY-03 enumerates, is byte-
identical across the diff. I re-read those rows rather than assuming; no drift.

## Fixtures

**Run depth: the divergence PROPERTIES routed has been resolved in its favour (F-02).**
`PROPERTIES:497-504` pins `fc.assert(fc.property(…), { numRuns: 500 })` for all four laws, cites
`advisoryHelperProperties.test.js` as the precedent, and then records: "**Note the divergence,
routed but resolved here:** TSPEC §5.7's convention paragraph says *fast-check's default run count*,
while PLAN T-08 and PLAN §4.5 pin 500 on the same precedent. This document follows PLAN; the TSPEC
clause is raised as an erratum."

That is no longer what TSPEC says. §5.7 at HEAD reads `fc.assert(fc.property(…), { numRuns: 500 })`
— "**the run count is pinned at 500, not left to fast-check's default**" — cites the same
`advisoryHelperProperties.test.js` precedent, and closes "PLAN T-08 and PROPERTIES carry the same
figure, so the three documents agree." The generator specs, bounds and the four laws are unaffected;
the numbers already match. What is stale is only the divergence note and the routed-erratum
promise — see F-02.

**The `c8.include` correction has also landed upstream (F-03).** § 11's measured-baseline paragraph
already states the include set as **four** `**/`-anchored entries including
`**/scripts/capture-learnings-baseline.mjs`, and PROP-COV-01's scoping to `orchestrate-dev.js`
rides on it. TSPEC §5.8 at HEAD now carries the same four-entry list and explains `allow-external:
true` from it. So the local correction is confirmed, not contradicted — again, only the routed row
is stale.

**Fixture inventory otherwise unchanged.** The ledger fixtures (one per reason code plus the
honoured shapes), the config fixtures, the two required queue fixtures, the H-1 ordered event sink
and H-2, the generative generators `genFeature`/`genClassifyInput`/`genWaveLayoutPair` with their
bounds, and § "String and fixture ownership" (verbatim transcription from TSPEC §2.4/§3.1, including
the U+2013 en-dash pin) all rest on TSPEC text the erratum round left alone. The §3.1 edit changed a
value **count**, not any template or literal, so no transcribed fixture string moves.

**One fixture consequence of F-01.** The AT-05 write-side conjunct needs no new fixture: the
`startWave: 2` + valid-record integration fixture already exists for PROP-OVERRIDE-01 and already
carries a `writes` log, since § Fixtures builds all integration runs through `makeLedgerArgs`. The
work is an assertion, not test data — which is why I read this as a bounded follow-up rather than a
structural revision.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | local | TSPEC §5.4 AT-05 gained a **write-side conjunct** (`ledgerWrites` non-empty, plan-absolute `lastGreenWave`) and §5.5 grew from three to five mutations, the fifth being "suppress the record write while `explicitPointer` is true". PROPERTIES' AT-05 owner PROP-OVERRIDE-01 asserts only the resume point and the provenance token; no PROP-RECORD property drives an operator-pointed run; PROP-COV-03 and the mutation → oracle map are both pinned at four. The mutation TSPEC says is required has no killing oracle and no row. Fix: add the write-side conjunct to PROP-OVERRIDE-01 (same fixture, same owner T-07), add the fifth mutation row naming it, and change "four mutations" to five in PROP-COV-03 and the map header. | PROPERTIES § 5 (PROP-OVERRIDE-01), § 11 (PROP-COV-03), § Oracles "Mutation → oracle map"; TSPEC §5.4 AT-05, §5.5 |
| F-02 | Medium | delta | local | § "Findings routed upstream" still reports the generative run-count divergence as "**Still open** … no `numRuns` or `500` appears anywhere in TSPEC" and promises one `ERRATUM: TSPEC` line. TSPEC §5.7 at HEAD pins `{ numRuns: 500 }` explicitly and states PLAN T-08 and PROPERTIES carry the same figure. The § Fixtures run-depth note ("the TSPEC clause is raised as an erratum") and the closing "What this document does with the open items" paragraph inherit the same staleness. Re-raising a settled question is the defect DEC-ERR-01 names and this very section cites. Fix: mark the row **Closed by the owner**, drop the ERRATUM promise, and restate the run-depth note as agreement. | PROPERTIES § Gaps → "Findings routed upstream" row 1; § Fixtures run-depth paragraph; TSPEC §5.7 |
| F-03 | Medium | delta | local | Same class, second row: "TSPEC §5.8 states the c8 `include` set as three modules … **Open, and newly raised this round (PM F-02)** … **Yes** — one `ERRATUM: TSPEC` line". TSPEC §5.8 at HEAD carries the four `**/`-anchored entries including `**/scripts/capture-learnings-baseline.mjs`, and derives `allow-external: true` from the fourth. § 11's local correction is confirmed by the owner rather than standing alone "in the meantime". Fix: close the row and drop the ERRATUM promise; § 11's measured text needs no change. | PROPERTIES § Gaps → "Findings routed upstream" row on §5.8; § 11 measured baseline; TSPEC §5.8 |

FINDING: High | delta | local | PROPERTIES § 5 PROP-OVERRIDE-01 and § 11 PROP-COV-03 / mutation → oracle map — AT-05's new write-side conjunct and TSPEC §5.5's fifth mutation are unowned; no property or mutation row can kill a write suppressed under `explicitPointer`
FINDING: Medium | delta | local | PROPERTIES § "Findings routed upstream" row 1 and § Fixtures run-depth note — the generative run-count erratum is reported open, but TSPEC §5.7 at HEAD pins `{ numRuns: 500 }`
FINDING: Medium | delta | local | PROPERTIES § "Findings routed upstream" c8-include row — reported open, but TSPEC §5.8 at HEAD carries the four-entry `**/`-anchored include set

**Why these are `delta`, not `inherited`.** None of the three existed against TSPEC v1.3. F-01's
obligation was created by the round-5 edit that added AT-05's conjunct and mutation 5; F-02 and F-03
were *true statements* when written and were falsified by the same round's §5.7/§5.8 corrections.
PROPERTIES' own bytes have not moved.

**Why `local`, not `nonlocal`.** Each finding sits in the PROPERTIES surface that compresses exactly
the TSPEC sections the erratum edited — §5.4/§5.5 for F-01, §5.7 for F-02, §5.8 for F-03. None
reaches into a part of the document the upstream edit does not touch, and none re-opens a settled
decision.

**Two candidate findings I checked and did not raise.** (i) The §2.4 rewrite of the exclusion
column: PROP-OVERRIDE-05 already leads with the conjunct §2.4 now names as discriminating, and the
dependent "exactly three changed shipped assertions" figure is unchanged at `TSPEC:277`. (ii) The
§2.5 rewrite from "unspecified upstream" to ratification of the landed FSPEC §3.4 clause: the five
numbered §2.5 items PROP-RECORD-02/03/04/07/09 cite are unchanged, and PROPERTIES carries no
routed-upstream language of its own about the operator-pointer write.

## Recommendation

**Needs revision** — one High finding (F-01), mandatory under the approval rules.

The v4 approval does **not** carry forward against TSPEC v1.4. Two of the three defects are
bookkeeping in PROPERTIES' routed-erratum ledger and would not on their own have cost the approval;
F-01 is a genuine fidelity gap, because the round-5 TSPEC edit added a normative obligation — an
operator-pointed run must be shown to write a plan-absolute record — that no property, oracle or
mutation row in PROPERTIES owns. TSPEC states in as many words that the mutation this defends
against leaves AT-05, AT-07, AT-15 and AT-18 green, so the gap is invisible to the suite as
currently specified.

Exactly what to change, in one bounded pass:

1. **PROP-OVERRIDE-01** (§ 5) — add the third conjunct from TSPEC §5.4 AT-05: on the `startWave: 2`
   run, `ledgerWrites(writes)` is non-empty and the written `lastGreenWave` is the plan-absolute
   number of the last wave completed, not a run-relative count. Level `I`, owner T-07, existing
   fixture. Update the § Oracles row for PROP-OVERRIDE-01 with the matching assertion. (An
   equivalent PROP-OVERRIDE-06 is fine if the author prefers one property per conjunct.)
2. **Mutation → oracle map** (§ Oracles) — header "Four mutations" → five, and add the row:
   suppress the record write while `explicitPointer` is true → PROP-OVERRIDE-01's write-side
   conjunct → applied and observed in T-07.
3. **PROP-COV-03** (§ 11) — "PLAN §4.3's four mutations" → five, keeping the `TSPEC §5.5` trace.
   PLAN §4.3 still reads four; that is PLAN's own cascade, and the mismatch should be noted rather
   than silently resolved here.
4. **§ "Findings routed upstream"** — close the §5.7 run-count row and the §5.8 c8-include row as
   *Closed by the owner*, drop both `ERRATUM: TSPEC` promises, and restate § Fixtures' run-depth
   note as agreement with TSPEC rather than divergence from it. The pinned `numRuns: 500` and the
   four-entry include figures themselves are already right and must not move.

No property is deleted, no fixture is added, and no settled decision is reopened. I expect this to
close in one round.

**Positive observations.** The document's two upstream errata both landed the way it argued, which
is the routing loop working as designed — pinning 500 against TSPEC's then-default, and correcting
the include set to four entries locally while routing the source. The `explicitPointer` write path
is the one seam the round-5 TSPEC edit found that this document had compressed faithfully but
incompletely, and it is a narrow one. § 11's measured-not-assumed baseline discipline (dated
measurement, both c8 stages, per-file scope) is why F-03 is bookkeeping rather than a wrong number.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 0}
