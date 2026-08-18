# Cross-Review: software-engineer — FSPEC (delta confirmation)

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.8)
**Date:** 2026-08-18
**Iteration:** 11 (delta confirmation — errata 3 and 5)

## Scope

Delta confirmation, not a re-review. The FSPEC was approved at `REVIEWED-COMMIT: fe306b11`
(v0.7) and re-confirmed against REQ v0.12 in SE v10. Three commits since — `8c5847a6`,
`76e40b98`, `1eccc97c` — carry the erratum edit and lift the document to v0.8. The one
question answered here: **does this delta resolve without breaking anything previously
approved?** Landing the routed items is necessary, not sufficient; the whole FSPEC is
re-measured against REQ v0.12 and the measured baseline at HEAD (DEC-ERR-03).

Answer: **no.** The class-10 correction is technically right — the reduced build step still
emits the probe CLI into `pdlc/workflows/dist/`, so `postWaveCommand` and `postWavePathspecs`
are still live values — but it landed **downstream only**. REQ C-5 (`REQ:229`), REQ AC-1.2's
term rationale (`REQ:319`) and the measured baseline's M-11h row
(`docs/_constraints/pdlc-retirement-baseline.md:63`) all still say the two values retire, and
§7.2 (`FSPEC:836`–`:837`) still asserts no criterion was relaxed. That is one High: the
contract chain now says two opposite things about the same commit class and no upstream
erratum is open to close the gap. The erratum-3 disposition itself lands cleanly.

## Delta examined

`git diff 638413b4..HEAD -- docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` —
seven hunks:

| # | Location | Change |
|---|---|---|
| 1 | `FSPEC:9`–`:16` | Upstream pin REQ v0.11 → **v0.12**; cross-review list compressed; version 0.7 → **0.8** |
| 2 | `FSPEC:162` | Class 10 restated as **prose only**; values stay; preflight assertions survive, `postWavePathspecs` tightened to set-equality |
| 3 | `FSPEC:163` | Class 11: `consolidate-learnings/SKILL.md`'s bundle reference **deleted, not rewritten**; points at §3.3 step 4 |
| 4 | `FSPEC:167`–`:170` | New **Held classes** note: class 6 on erratum 6; classes 7–12 on erratum 3, released |
| 5 | `FSPEC:192`–`:199` | §3.3 step 4 rewritten; **capability disposition** for `consolidate-learnings` decided |
| 6 | `FSPEC:347`–`:348` | §4.2 L-2's `postWavePathspecs` rationale restated as prose-only |
| 7 | `FSPEC:836`, `:847`–`:854` | §7.2 lead-in re-grounded to v0.12; §7.3 lead-in and two new erratum rows; erratum-9 row gains the SE v9 F-01 conjunct |

No other bytes moved. Everything outside these hunks is the text approved at `fe306b11`,
re-read here against the current upstream rather than re-litigated.

## Routed-item ledger

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
