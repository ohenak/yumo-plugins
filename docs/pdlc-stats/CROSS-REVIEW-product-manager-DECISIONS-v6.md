# Cross-Review: product-manager — DECISIONS (upstream-cascade confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.4, bytes unchanged)
**Upstream re-grounded on:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.3, erratum round 4)
**Date:** 2026-08-31
**Iteration:** 6 (upstream-cascade confirmation)

## Context

This is an **upstream-cascade confirmation**, not a re-review. `DECISIONS-pdlc-stats.md` is
byte-identical to the v1.4 I approved at `42cf8850d` (`CROSS-REVIEW-product-manager-DECISIONS-v5.md`,
*Approved with minor changes*, 0 High / 2 Medium). What moved is TSPEC: my approval recorded
`UPSTREAM-STATE: TSPEC` against the v1.1 blob at `66c4049ac`, and TSPEC has since taken **erratum
rounds 3 and 4** (`3eefae1ef` … `e952268bd`, +170/−59 lines), reaching v1.3 at
`sha256:ad630797…`. REQ (`60a516fb…`) and FSPEC (`0b8864d6…`) are unchanged from my approval, so the
whole cascade surface is TSPEC.

The single question: **is DECISIONS still a faithful compression of TSPEC as it now stands?**

What the two erratum rounds changed in the material DECISIONS leans on:

| TSPEC change (v1.1 → v1.3) | Where | Does DECISIONS lean on it? |
|---|---|---|
| Co-change set restated five → nine → **ten** in-repo sites; `pdlc/README.md`'s prose enumeration added as a **row of the site table** | §2.1, §6.4, §7.3, RK-1 | Yes — DEC-STATS-01's cost is the decision's whole rationale |
| The count is made **derivable**: repo-scoped `git grep -l` on probe `lib/loop-session.mjs` → **24** candidates, one stated filter drops the **14** pure consumers, 24 − 14 = 10 | §2.1 | Yes — K-9 promotes the sweep as a durable constraint |
| `loop-distribution.test.js` row gains an eighth assertion edit (P7-02's `vendoredClassWord` ternary) | §2.1 | Yes — K-8 owns that file |
| `coverageInstrumentation.test.js` row names P9-02's title, six → **seven** | §2.1 | Yes — K-3 owns that pair |
| §6.4 grows five → **seven** oracles; classifier purity is **split by return type** — non-aliasing for the three object-returning classifiers, **A-B-A** for `deriveDodRoundIndex` — plus a construction-site-count oracle | §6.4 | Yes — DEC-STATS-03's named detector and K-4 |
| BR-11 / BR-16 / BR-25 errata closed at FSPEC v1.4 and removed from §8.3 | §4.3, §8.3 | No — DECISIONS routes no BR erratum |
| Option B's row now names `publish-preflight.mjs`'s second copy of the engine `lib/` class | §2.1 table | Partly — DECISIONS already carries this from its own v1.4 |

I re-ran TSPEC's new derivation at HEAD rather than trusting it: `git grep -l "lib/loop-session.mjs"
-- . ':!docs/'` returns **24** files; the 14 the stated filter drops are `bin/cli.mjs`,
`orchestrate-dev.js`, `orchestrate-queue.js`, the generated `workflows/dist/pdlc-cli.mjs` and ten
`loop*`/`loopSession*` test files; the ten that survive are exactly §2.1's rows, `pdlc/README.md`
included. TSPEC's ten is reproducible. DECISIONS' nine is not a different-but-defensible count — it
is the same class measured before the README row was admitted, and DECISIONS states in prose that
the README **is not** a tenth site-table row. That sentence is now a positive contradiction of its
upstream, not a lag.

## Options Considered

_pending_

## Decision

_pending_

## Consequences

_pending_

## Positive Observations

_pending_

## Delta-Confirmation Findings

_pending_

## Verdict

_pending_
