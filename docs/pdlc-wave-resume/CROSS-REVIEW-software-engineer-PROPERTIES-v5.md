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

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
