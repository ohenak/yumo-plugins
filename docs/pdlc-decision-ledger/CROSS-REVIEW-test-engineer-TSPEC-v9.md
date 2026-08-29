# Cross-Review: test-engineer — TSPEC (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.8)
**Date:** 2026-08-29
**Iteration:** 9 (delta confirmation on Phase P's five-item erratum)

## Overview

**Upstream: unmoved, and re-checked rather than assumed.** I recomputed both digests at HEAD:
REQ `sha256:ce6b133f…3c7b7c`, FSPEC `sha256:2bd5c3ef…5aed39`. Both are byte-identical to the
`UPSTREAM-STATE` anchors on my round-8 approval, so the compression question DEC-ERR-03 asks —
"does this document still say what upstream says?" — has the same answer it had at round 8 for
every section this delta did not touch, and for the sections it did touch I re-read the upstream
each new sentence leans on (FSPEC §6.1's failure table, REQ NG-4 / BR-11, REQ-DECLEDGER-02 / AT-04)
against the changed text. No citation in the delta attributes anything to upstream that upstream
no longer says.

**Scope of this round.** The delta is five TSPEC commits — `039555ea9`, `d462a9475`, `471d3a4b9`,
`396a7b0f3`, `cc2c09e53` — +153 / −13 against `277db8b27`, the commit I last reviewed. Every
insertion is inside §7 or the changelog; I confirmed by diff that no section outside §7 moved, so
§§1–6 and §§8–9 are not re-litigated here. I verified each landed claim against the shipped code it
cites rather than against the prose that asserts it: `pdlc/workflows/package.json`,
`pdlc/workflows/scripts/check-wave-resume-delta-coverage.mjs`, `orchestrate-dev.js`'s
`buildFinalReport` / `learningsInjectionField` sites, and `.claude/pdlc.config.example.json`.

**The one-line answer.** All five routed items landed, four of them in the strongest available form.
But the fix to item 5 was applied to a single member of a set whose siblings fail the *same*
satisfiability test the fix itself articulates, so §7.3's census remains an oracle that cannot go
green on conforming code. That is a High I did not catch in earlier rounds — it is inherited, not
introduced here — and it is why this confirmation does not approve.

## Architecture

Nothing in §§2–6 changed, and the delta introduces no new component, seam or dependency edge. What
it changes is *which evidence the design claims for the components already specified* — three
additions, each of which alters the test-obligation graph rather than the module graph:

1. **A live composition-root arm** is added to §7.2's category table and given a rationale
   paragraph. This is a new test level for `main()`, previously owed only §7.3's source census.
2. **Two properties** (`P-REC`, `P-LINE`) are promoted into §7.5, which previously carried only
   O-8's bounds invariant. Both target pure functions §7.1 already exercises, so no new seam and no
   new double: the addition is genuinely free at the architecture layer.
3. **One census token is removed**, narrowing §7.3's forbidden set from seven members to six.

The first two strictly enlarge the evidence the design claims; the third strictly narrows it. That
asymmetry is worth naming, because it is where this round's residual risk sits — a narrowing
justified by an argument that was not swept across the rest of the set.

## Interfaces

## Data Model

## Test Strategy

## Open Questions

## Positive Observations

## Recommendation

## Delta-Confirmation Findings

## Verdict
