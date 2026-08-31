# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, byte-unchanged)
**Date:** 2026-08-31
**Iteration:** 11

## Context

**Upstream-cascade confirmation.** My own bytes have not moved: `sha256:48522bf9…`, byte-identical to
the `APPROVAL-HASH` recorded at v8 and re-confirmed at v9 and v10. `git diff` over
`docs/pdlc-stats/DECISIONS-pdlc-stats.md` across this round's range
(`10963e85dcf2d62fb869f704f02d9d2c76484ba7..HEAD`) is empty.

Measured on `feat-pdlc-stats` HEAD (`a2f1201b0`):

| Upstream | v10's pin | HEAD sha256 | Moved? |
|---|---|---|---|
| REQ | `5f3e8051…` (v1.6) | `f75c348f…` (v1.7) | **yes** — the erratum under confirmation |
| FSPEC | `c7d2c832…` | `c7d2c832…` | no — byte-identical |
| TSPEC | `f2261510…` (phantom) | `a06a6032…` | no — matches v10's *body* measurement |

Both HEAD hashes match the dispatch's cited REQ `f75c348f…` and FSPEC `c7d2c832…`, so I am
confirming against exactly the versions the orchestrator named.

**The delta.** One commit, `e12b78fd8`, +12/−3, touching only the version header and one clause of
REQ-STATS-06. It withdraws the v1.6 survivor clause — *"the predicate is set-membership over C-4's
grammars, so a grammatical basename outside the driver's document-type catalogue is a survivor even
where REQ-STATS-03 reports it malformed"* — and replaces it with the opposite disposition: such a
basename *"contributes no process bytes and counts as no file of its family remaining"*, so a feature
carrying only those reports **harvested**. C-5, R-5, REQ-STATS-01 through 05 and 07 are byte-unchanged.

**A third consecutive phantom TSPEC pin.** v10's `UPSTREAM-STATE` trailer recorded TSPEC
`f2261510…`. I hashed every revision of `TSPEC-pdlc-stats.md` on this branch's history path: it
matches none of them. This is the third round running — v8's `512a9fcf…`, v9's `235fd3dd…`, now
v10's `f2261510…` — and the third time the reviewing round has had to recover by falling back to the
hash measured in the prior round's own body (v10's body: `a06a6032…`, which *does* match HEAD, and is
how I know TSPEC did not move). Carried below as F-04, escalated; see there for why the recurrence
changes its severity.

## Options Considered

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
