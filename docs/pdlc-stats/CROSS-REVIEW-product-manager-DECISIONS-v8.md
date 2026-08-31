# Cross-Review: product-manager — DECISIONS (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.6, erratum round 7)
**Upstream HEAD:** REQ `60a516fb…` · FSPEC `25af3c47…` · TSPEC `cb351bb3…`
**Date:** 2026-08-31
**Iteration:** 8 (delta confirmation)

## Context

**Delta confirmation, not re-review.** `DECISIONS-pdlc-stats.md` moved v1.5 → v1.6 across four commits
(`c10c8688d`, `0b4729034`, `3b2d38076`, `7adc96661`), answering my v7 *Approved with minor changes*
(0 High / 1 Medium / 2 Low) and te-review's parallel items from the same round. My v7 verdict was
non-gating, so this round was an erratum of housekeeping rather than a repair of a blocking defect.

**What I re-grounded before reading the delta (DEC-ERR-03).** The dispatch pins REQ at
`sha256:60a516fb…` and FSPEC at `sha256:25af3c47…`; I hashed both files at HEAD and both match
byte-for-byte, so neither upstream moved under this document. The dispatch names TSPEC by path with
no hash this round; TSPEC at HEAD is v1.4, `sha256:cb351bb3…`, the same revision v1.5 and v1.6 both
record absorbing. **No upstream decision is owed absorption**, so the raised item list is the whole of
the work available this round, and my confirmation is about whether it landed cleanly.

**What I re-verified mechanically at HEAD**, rather than trusting the changelog's account of itself:

| Claim | How checked | Result |
|---|---|---|
| K-3's row is rejoined and the obligations table is a table again | delimiter count per `^\| K-` row | K-1…K-9 all carry five delimiters; rows 586–594 contiguous, table terminates at the blank line 595 |
| The rejoin lost no cell text | whitespace-normalised diff of `c10c8688d`'s removed vs added bytes | **Identical.** Pure re-flow — no word added, none dropped |
| Both breakdowns now name ten | read *What the sweep found* (:236–243) and *Reversibility: hard* (:450–453) | Both now enumerate five enumerations + four test files + `pdlc/README.md`'s prose member list |
| No stale nine-item breakdown survives elsewhere | grep for `nine` across the body | Remaining hits are historical changelog text or the deliberate *"nine sites are enforced by CI and one by attention"* contrast — correct as written |
| The document's ten agree with upstream's ten | TSPEC §2.1 site table at HEAD (`:194`, `:1163`, `RK-1` at `:1191`) | TSPEC carries `pdlc/README.md` as a site and names it *"pinned by no oracle"*; DECISIONS matches |
| No other table was broken by the edit | scan of every non-fenced table for mixed delimiter counts | None found |

I did **not** re-open `DEC-STATS-01`'s chosen option, `DEC-STATS-02`, `DEC-STATS-03`, K-1, K-2, K-4
through K-8, the option table, the *decisions do not decide* section, or the standing-cost bullets.
None was touched by this round, and all were approved on their merits at v5–v7.

## Options Considered

## Decision

## Consequences

## Delta-Confirmation Findings

## Positive Observations

## Questions

## Verdict
