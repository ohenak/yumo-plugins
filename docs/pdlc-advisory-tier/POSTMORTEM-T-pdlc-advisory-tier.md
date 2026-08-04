# POSTMORTEM — Phase T (erratum channel to FSPEC) — pdlc-advisory-tier

| Field | Value |
|---|---|
| Upstream | `TSPEC-pdlc-advisory-tier.md` (v1, HEAD `ae55f25`) → **POSTMORTEM-T** |
| Downstream | `LEARNINGS-pdlc-advisory-tier.md`, `docs/_queue/QUEUE.md` |
| Cross-Reviews | `CROSS-REVIEW-{software-engineer,test-engineer}-FSPEC-v4.md` (the erratum delta-confirmation round) |
| LEARNINGS | `docs/pdlc-advisory-tier/LEARNINGS-pdlc-advisory-tier.md` |
| Author | se-author (Claude) |
| Date | 2026-08-03 |
| Version | 1.0 |
| Scope | Non-convergence of the FSPEC **erratum** delta-confirmation dispatched from Phase T. Not a re-review of the TSPEC or FSPEC; not a technical-design record. |

---

## Phase

**Phase T — TSPEC authoring and cross-review**, feature `pdlc-advisory-tier`, branch
`feat-pdlc-advisory-tier`. The halt is not in the TSPEC review loop itself — that loop **converged**:
pm-review, se-review and te-review all approved TSPEC v3 (`5f280c5`, `b5b9708`, and the pm/te/se v3
files). The halt is in the **erratum channel** Phase T opened against the *upstream* FSPEC.

While authoring the TSPEC, the author found what looked like four defects in
`FSPEC-pdlc-advisory-tier.md` and — per the erratum protocol (CLAUDE.md, "Errata are a first-class
signal") — emitted `ERRATUM: FSPEC: …` lines rather than editing the FSPEC or mis-filing the findings
in the TSPEC. After the phase converged, the orchestrator routed those errata to the FSPEC's author,
who applied a single targeted versioned edit (commit `3bbf934`, FSPEC v1.2 → v1.3), and then
dispatched the FSPEC's own two approvers — se-review and te-review — to write the **delta-confirmation**
as the next append-only cross-review round (`-v4`).

That confirmation did not pass. Per the bounded rule — **one erratum round per upstream doc per
phase** (CLAUDE.md, "Bounded: … a failed confirmation … halts to the current phase's POSTMORTEM") —
Phase T halts here rather than opening a second erratum round.

The single most important fact in this document: **two of the four erratum items were false.** They
rest on the premise that default-branch commit `26c3f1c` *predates* Phase PUB's file-creating code
`raisePrAndVerifyCi`. It does not — `26c3f1c` already carries it. The confirmation reviewer's own
grounding discipline caught this, withdrew the erratum, and refused the edit that acted on it. The halt
is therefore the protocol working, not misfiring: it stopped a regression from landing on the FSPEC.
This is developed in Root Cause 1.

## Iterations

<!-- body -->

## Reviewers

<!-- body -->

## Pattern of Disagreement

<!-- body -->

## Best-Guess Root Cause

<!-- body -->

## Recommendation

<!-- body -->
