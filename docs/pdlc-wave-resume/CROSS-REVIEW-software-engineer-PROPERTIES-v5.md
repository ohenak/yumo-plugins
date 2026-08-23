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

## Oracles

## Fixtures

## Delta-Confirmation Findings

## Recommendation

## Verdict
