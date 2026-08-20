# Cross-Review: product-manager — PLAN (upstream-cascade confirmation, round 11)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md` (unchanged bytes since round 10)
**Date:** 2026-08-19
**Iteration:** 11
**Scope:** Upstream-cascade confirmation only. PLAN's own bytes are unchanged since the round-10 approval at `b902f40b`. TSPEC moved `4a092e85` → `1531143c` via one erratum commit (`1f2a4fbf`, +18/−1). Question answered: does PLAN still hold as approved against TSPEC as it now stands?

## Overview

**What moved upstream.** Exactly one commit touched TSPEC after round 10's approval was recorded:
`1f2a4fbf` *"docs(tspec): size PROP-SWEEP-2(b) residue in §1.3 and route it to PLAN (Phase P
erratum)"*, +18/−1 across two hunks — a sentence appended to the §1 changelog's Phase-P erratum note,
and a new paragraph in §1.3 titled *"Sizing the hygiene residue, and where it is owned."* No other
TSPEC section changed; REQ, FSPEC and DECISIONS are byte-identical to the versions round 10 approved
against (their dispatch hashes match this file's `UPSTREAM-STATE` trailer from round 10).

**What the edit does.** It corrects an under-sizing in TSPEC's own prose. §1.3 previously named only
the 14 tracked `.pdlc-backups/*.bak` blobs as what `e3b9d5a3` left behind. It now states the measured
residual — **28 tracked paths in three classes at PLAN's dated 2026-08-19 measurement, of which
untracking the 14 `.bak` blobs closes 14** — and explicitly routes the partition, the owners, the
dispositions and the figures themselves to **PLAN's Overview HEAD-drift note and A6-00's Edit 1**,
stating that TSPEC "does not restate further and does not re-litigate" them.

**Why this direction of travel is benign for PLAN.** The edit moves ownership *toward* this document,
not away from it. PLAN was already the sole owner of these figures — round 9 consolidated them into
the Overview's HEAD-drift note precisely so one site carries them, and round 10 approved that. TSPEC
now names that site as the owner. Nothing PLAN cites upstream was withdrawn, narrowed or renumbered;
nothing PLAN must now say was added to its obligations.

**The one thing I checked hardest.** A routing edit that also *restates* the routed figures can drift
from the owner it routes to. I therefore re-read the new paragraph against PLAN's HEAD-drift note
clause by clause, and against the shipped oracle, rather than accepting that the numbers "look the
same". They agree on every figure and every class; they diverge on one subordinate clause about A-1's
glob list, recorded below as F-01 (Low, upstream's to fix, not PLAN's).

## Batches

_(pending)_

## Dependencies

_(pending)_

## Verification

_(pending)_

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

