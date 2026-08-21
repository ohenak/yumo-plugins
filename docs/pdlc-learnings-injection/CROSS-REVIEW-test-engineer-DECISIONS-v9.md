# Cross-Review: test-engineer — DECISIONS (revision round, frozen)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/DECISIONS-pdlc-learnings-injection.md` (v0.5, commit `9baf60b5`)
**Previous review:** `CROSS-REVIEW-test-engineer-DECISIONS-v8.md` (v0.4, `6f28eded`)
**Date:** 2026-08-21
**Iteration:** 9

## Context

Delta re-review under DECISION FREEZE. Five commits touched the document since the v8 base
`6f28eded`, +36/−11 lines, aimed at exactly the three findings v8 left open:

| Commit | Substance | Answers |
|---|---|---|
| `dbbfcb07` | `DEC-LI-08`'s framing paragraph restates the cost as a **formula over a named fixture** — a 477-byte block constant plus `49 + 2·len(path) + len(feature) + len(orderKey)` per selected document, plus `30 + len(String(bytes))` when the document is `bounded` — and evaluates it over this repository's corpus (684 / 1,607; 718 / 1,777 abridged) | v8 F-01 |
| `79675345` | `D-O-4` cites that formula instead of restating `694` / `1,012`, and states outright that neither reported quantity has a transcribable expected constant | v8 F-01 (downstream half) |
| `6548c08a` | §Scope's grounding pin gains a "two kinds of citation" paragraph separating pre-feature *grounds* from post-implementation *shipped-code confirmations* | v8 F-02 |
| `a370ba06` | Header re-pinned on REQ v0.10 / FSPEC v0.14; version bumped to 0.5 with a round-7 changelog | v8 F-03 |
| `9baf60b5` | Upstream version note records that FSPEC v0.14's window restatement and REQ AC-2.4's attribution clause leave the byte-accounting basis, `E-36` and `AT-30` untouched | v8 F-03 |

All three findings are resolved, and I verified the fix by re-running the shipped renderer rather
than by reading the prose. Nothing v8 approved regressed. One Low, non-gating arithmetic
observation on the new ceiling sentence is recorded below.

## Options Considered

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
