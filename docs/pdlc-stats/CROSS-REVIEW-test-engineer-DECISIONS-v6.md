# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.4, bytes unchanged)
**Upstream that moved:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.1 → v1.3, erratum rounds 3–4)
**Date:** 2026-08-31
**Iteration:** 6 (upstream-cascade confirmation, not a re-review)

## Context

`DECISIONS-pdlc-stats.md` was approved at v5 (`CROSS-REVIEW-test-engineer-DECISIONS-v5.md`,
*Approved with minor changes*, one Low open). Its own bytes have not moved since. What moved is the
upstream this document compresses: `TSPEC-pdlc-stats.md` went v1.1 → v1.3 across erratum rounds 3
and 4, so the v5 approval was taken against a TSPEC that no longer exists. My v5 anchor records
`UPSTREAM-STATE: TSPEC sha256:db285ea2…`; HEAD is `sha256:c270fc5c…`.

This is a cascade confirmation, not a re-review. I did not re-open DEC-STATS-01/02/03's verdicts,
the option tables, K-1's partition, or anything v1–v5 settled. The single question is whether
DECISIONS is still a faithful compression of the TSPEC as it now stands. Per DEC-ERR-03 I read the
current upstream text this document leans on rather than working an item list, so findings below
are not confined to the four routed items.

**The delta I read.** `git diff 42cf8850..HEAD -- docs/pdlc-stats/TSPEC-pdlc-stats.md` (the v5
approval commit to HEAD): §2.1's co-change set nine → **ten** with `pdlc/README.md` added as a row,
the sweep restated as a 24-candidate set plus one stated filter; the `loop-distribution.test.js` row
gaining an eighth assertion edit; the `coverageInstrumentation.test.js` row naming a title count;
§6.4 growing five oracles → seven and splitting the classifier-purity conjunct by return type;
§7.3, RK-1 and §8.4 carrying the ten; §8.3 dropping three now-closed FSPEC errata; §4.3/§6.1
re-grounding on FSPEC v1.4.

**What I verified at HEAD rather than reading off either document**, because three of the findings
below turn on a number and one turns on a type:

| Claim | Command / source | Result |
|---|---|---|
| DECISIONS' sweep, 25 files | `git grep -l "escalation-view" -- . ':!docs/' ':!*/dist/*'` | **25** — reproduces |
| TSPEC's new sweep, 24 candidates | `git grep -l "lib/loop-session.mjs" -- . ':!docs/'` | **24** — reproduces, but only with `dist/` *included* |
| `deriveDodRoundIndex`'s return type | `pdlc/workflows/orchestrate-dev.js:12384` | returns `max + 1`, a **`number`** |
| `c8.include`'s size at HEAD | `pdlc/workflows/package.json` | **seven** entries |
| `REQUIRED_INCLUDES`'s size at HEAD | `coverageInstrumentation.test.js:37-46` | **four** entries |
| P9-02's title count at HEAD | `coverageInstrumentation.test.js:264` | says **six** |

§8.3's three closed errata (FSPEC BR-11, BR-16, BR-25) and §4.3/§6.1's AT-12/AT-17 re-grounding
touch nothing in DECISIONS: `grep -n "BR-16\|BR-11\|BR-25\|AT-12\|AT-17"` over the document
returns nothing. Those parts of the delta are confirmed clean and are not discussed further.

## Options Considered

## Decision

## Consequences

## Delta-Confirmation Findings

## Verdict
