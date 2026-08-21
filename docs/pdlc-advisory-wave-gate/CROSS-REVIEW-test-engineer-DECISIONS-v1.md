# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.10, `sha256:9712b6b0…`)
**Date:** 2026-08-20
**Iteration:** 1

## Context

A full review, not a delta: the round history for this document was deleted by the harvest commit
`9cf48051` ("delete harvested cross-reviews and DoD code reviews"), so no
`CROSS-REVIEW-*-DECISIONS-v*.md` exists on disk and this dispatch is iteration 1 against the whole
of v1.10. I read the document end to end rather than diffing it.

**Upstream state, computed rather than trusted.** At `a9148c2f`:

| Document | sha256 | Version cell |
|---|---|---|
| REQ | `c62cfc35…` | 1.15 |
| FSPEC | `91ef2557…` | 1.6 |
| TSPEC | `3fa21acf…` | **1.11** |
| DECISIONS (under review) | `9712b6b0…` | 1.10 |

The document's `Upstream` cell (`:5`) and four prose sites (`:20`, `:81`, `:149`, `:396`) name
**TSPEC v1.10**. TSPEC is at v1.11, and its changelog opens with the change that matters most to
this record: "**OQ-7 is closed upstream, in this TSPEC's favour**"
(`TSPEC-pdlc-advisory-wave-gate.md:19`). That is not a version-cell nit — DECISIONS hedges four of
its own claims on OQ-7 still being open (F-02).

**How I reviewed it.** This document's stated purpose is to hold no tree measurements (`:24-33`,
`:52-55`), and its v1.10 preamble claims every claim was "re-grounded against the working tree". My
lens is testability, so I checked the claims that a PROPERTIES or test author would transcribe into
an oracle: the failure mode of each mechanism, the argv literals, the rejection reasons that
foreclose an alternative, and every "this is now asserted / a regression now fails the suite" claim.
Each was checked against the shipped module and the shipped suite, not against the citing document.

What holds at HEAD, verified and left alone: `stash` has no call site anywhere in
`pdlc/workflows/orchestrate-dev.js`; `reset --hard` has exactly one, on the seam-revert path
(`orchestrate-dev.js:3018`); `ADVISORY_DEFAULTS.enabled` is `false` (`:1945`); `nonNegativeInt`
exists as a sibling of `positiveInt` and `waveBudgetPerRun` is its only caller (`:2073-2077`,
`:2096`); the promotion `commitPaths` call is where DEC-A6-02 says it is, past the same green gate,
with the message literal the entry fixes (`:15472-15482`); and the build-outputs commit precedent it
cites is verbatim at `:15487-15488`.

## Options Considered

## Decision

## Findings

## Questions

## Consequences

## Positive Observations

## Recommendation

## Verdict
