# Cross-Review: test-engineer — PLAN (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/PLAN-pdlc-advisory-wave-gate.md
**Date:** 2026-08-20
**Iteration:** 5 (delta re-confirmation — TSPEC moved v1.7 → v1.8)
**Scope:** Whether the v4 approval of PLAN still holds against TSPEC as it now stands. PLAN's own
bytes are unchanged. No re-litigation of settled PLAN decisions.

## Overview

The v4 approval anchored `UPSTREAM-STATE: TSPEC sha256:c0ee14a4…`, which is TSPEC at commit
`61a9605d` (v1.7). HEAD is `a349767b` (v1.8), a single-commit erratum round: 43 insertions, 3
deletions, all of them the version-table row, the v1.8 changelog entry, and prose added to §3.1.
No signature, no AT, no §5.1 row, no §5.5 fixture and no batch-relevant obligation moved.

What §3.1 now says that it did not say at v1.7:

1. `ADVISORY_SEAM_PHASES` is explicitly marked *(module-private)*, so its absence from the §3.1
   export block is licensed by §3's preamble rather than being a gap.
2. The behavioural oracle for the sixth row is named as the **written escalation entry**, with the
   `unknown`/`unknown` fallback at `orchestrate-dev.js:3338` as the negative control, and
   PROP-REC-07's file home is stated to be `advisoryEscalationLog.test.js`, "already on §5.1's
   edited-files list for AC-6.2", whose owning PLAN task is named as **A6-17**.
3. Phase P is instructed in as many words to "transcribe the sixth row and leave the `const`
   unexported"; a PLAN task adding `export` here is declared outside the TSPEC's interface surface.

All three are checks *on* PLAN rather than changes PLAN must absorb, so the confirmation question is
whether PLAN is still a faithful compression of §3.1 as it now reads. It is, on every load-bearing
point, and each point was verified against PLAN's bytes rather than against the item list:

| §3.1 (v1.8) now requires | PLAN at HEAD | Verdict |
|---|---|---|
| Sixth row transcribed, `const` left unexported | A6-05 (`:99`) owns `ADVISORY_SEAM_PHASES.A6 = {id: "I", outcome: "halted"}` in `orchestrate-dev.js` and says nothing about exporting it; no other task adds an export | Holds |
| No unit test may import the constant | A6-02's constant-surface RED list (`:97`) enumerates `ADVISORY_SEAMS`, `ENVELOPE_DEFAULTS`, `ADVISORY_ROOT_CAUSES`, `A6_PROHIBITIONS`, `ADVISORY_REFUSAL_REASONS`, `ADVISORY_EXCLUSIONS`, `ADVISORY_DEFAULTS` — `ADVISORY_SEAM_PHASES` is absent, so no import-based oracle is planned | Holds |
| PROP-REC-07 lands on `advisoryEscalationLog.test.js`, owner A6-17 | A6-17 (`:111`) declares exactly that test file, and the ownership manifest (`:152`) gives the file a single owning task, A6-17 | Holds |
| No new file, no new owner minted | PLAN's task table and manifest are unchanged; no row was needed | Holds |
| A6-17's ordering still works for an oracle that observes a GREEN-landed row | A6-17 is batch 11 on dep A6-14; the `A6` row lands in A6-05 (batch 2) and the escalation write in A6-18 (batch 12) — the red-then-green span is intact and the batch column re-derives correctly (`max(dep batch) + 1 = 11`) | Holds |

PLAN also already models the export/module-private distinction the erratum turns on: A6-00 (`:94`)
excludes `pathsCollide` from the pre-flight import list for precisely this reason — it is a bare
`function` at `orchestrate-dev.js:4726` with no `export` — so the v1.8 marking lands on a document
that treats unexported symbols correctly by habit, not by luck.

## Findings

_pending_

## Questions

_pending_

## Positive Observations

_pending_

## Recommendation

_pending_

## Verdict

_pending_
