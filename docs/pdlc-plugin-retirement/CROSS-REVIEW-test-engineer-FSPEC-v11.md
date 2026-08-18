# Cross-Review: test-engineer — FSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` (v0.8, 2026-08-18)
**Upstream re-read:** `docs/pdlc-plugin-retirement/REQ-pdlc-plugin-retirement.md` v0.12; measured surface `docs/_constraints/pdlc-retirement-baseline.md`
**Date:** 2026-08-18
**Iteration:** 11 (delta confirmation on the erratum edit `8c5847a6`…`1eccc97c`)

## Overview

Not a re-review. The FSPEC was approved at v0.7 and has since taken a targeted erratum edit
folding in TSPEC §6.1 errata 3 and 5, plus a held-class ledger and a REQ v0.12 re-pin. This
round answers one question: **does the delta resolve its routed items without breaking anything
previously approved?**

Method: `git diff 638413b4..HEAD` on the FSPEC, then re-read the FSPEC against upstream **at
HEAD** (DEC-ERR-03) — REQ v0.12 §A-1 and NG-1/NG-3/AC-3.3, and the measured-surface rows
`docs/_constraints/pdlc-retirement-baseline.md` M-11h, M-11n, M-11o — not just the dispatch
list. Where the delta makes a claim about the repo (a host surviving, a value staying valid,
an assertion tightening), I checked the repo rather than the prose: `pdlc/skills/consolidate-learnings/SKILL.md`,
`pdlc/engine/scripts/publish-preflight.mjs`, `pdlc/engine/package.json`,
`pdlc/workflows/__tests__/consolidationPreflight.test.js` and `.claude/pdlc.config.example.json`.

**Answer: no — three High findings.** Two of the four routed items land as text but do not hold
against HEAD (F-01, F-03); one lands in a form that contradicts its own upstream without routing
the contradiction (F-02). The other two routed items — the held-class ledger and the transitive
closure over classes 7–12 — land cleanly and are recorded under Positive Observations.

## Routed-item ledger

| Routed item | Landed? | Holds? |
|---|---|---|
| Class 11 / §3.3 step 4 — capability disposition for `consolidate-learnings` | Yes (:163, :193–:199) | **No** — F-01, F-02 |
| Class 10 (:162) — prose only, values stay | Yes | **No** — F-03, F-04 |
| Class 10 — `consolidationPreflight.test.js` tightened to set-equality | Yes (:162) | **No** — F-03 |
| §3.1 held-class set recorded (class 6, classes 7–12) | Yes (:167–:170) | Yes |
