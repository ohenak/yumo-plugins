# Cross-Review: test-engineer — DECISIONS (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md` (v1.12)
**Date:** 2026-08-20
**Iteration:** 4

## Context

Iteration 3 was an upstream-cascade confirmation that returned **Needs revision** on one High
(`CROSS-REVIEW-test-engineer-DECISIONS-v3.md`): `DEC-A6-03` asserted, as a checked negative fact,
that the halt-message overwrite obligation "has not landed" upstream, when REQ v1.16 had already
landed it. The document has since moved v1.11 → v1.12 across three commits
(`5f35bd8f`, `a147c9cf`, `279d38a2`).

**Scope of this round.** Delta only. I read my v3 file, then diffed the document against the commit
I last reviewed:

```
git diff 3143290a..HEAD -- docs/pdlc-advisory-wave-gate/DECISIONS-pdlc-advisory-wave-gate.md
75 insertions(+), 22 deletions(-)
```

Four regions changed, and nothing else:

| Region | Change |
|---|---|
| Header `Upstream` cell (`:5`), version row (`:12`) | pins all three upstream hashes; v1.11 → v1.12 |
| v1.9 re-grounding note (`:42-45`) | hashes date-scoped as that round's observation, not a current pin |
| Revision note `On v1.12` (`:123-138`) | new paragraph recording the cascade round |
| `DEC-A6-03` Reversibility / gap paragraph / Re-evaluation triggers (`:372-419`) | the F-01 repair |
| `## Consequences` operator-remedy bullet (`:515-521`) | remedy is no longer record-only |

No decision moves: `DEC-A6-01`…`DEC-A6-04`'s `Decision`, `Constraints` and option tables are
byte-identical to v1.11, and `## Options Considered` is untouched — I confirmed this from the diff
hunk list, which contains no line inside those regions. My v2 findings F-08 (DEC-A6-02 cardinality
oracle) and F-09 (packed-set fixture count) remain open, accepted, non-gating and untouched; I do
not re-file them.

**Everything below is verified against the repository at HEAD, not against the document's own
citations.** Every hash in this review I recomputed; every upstream claim I re-ran the document's
own grep against.

## Options Considered

Two readings of the delta were open to me; I record both and why I took the first.

**A. Verify the repair by re-running the check that falsified the old text, then stop.** This is the
delta protocol applied literally: F-01 was a false negative claim about upstream, so the resolution
test is mechanical — does the new text match HEAD? Taken.

**B. Re-open the entry's substance because the routing landed.** Rejected. REQ v1.16 / FSPEC v1.7 /
TSPEC v1.15 ratify DEC-A6-03's remedy on the operator surface; none of them contests the ref's
wave-scoped shape, which is what the entry actually decides. Re-litigating a decision because its
*documentation of upstream* changed would be the inverse of the mistake I filed in v3.

**The verification I ran, and its result.** The repair replaces a negative claim with a
three-level positive one, so I checked each level rather than trusting the citation:

| Claim in v1.12 | Where I checked | Result |
|---|---|---|
| REQ v1.16 AC-6.3 lands the warning, citing this entry | `REQ:535` ("re-running this feature overwrites that capture"); changelog `REQ:23`; version row `REQ:18` = `1.16` | **holds** |
| FSPEC v1.7 BR-14 states the conjunct and names co-location as the observable | `FSPEC:249` — verbatim "a pointer in the halt report and the warning in a runbook does not satisfy it"; version row `FSPEC:12` = `1.7` | **holds** |
| `AT-06-4` conjunct (3) is its AT; `AT-06-4b` the negative arm | `FSPEC:477-478` (oracle asserts co-location and presence, never the capture's name), `FSPEC:481` (negative arm carries no overwrite warning) | **holds** |
| E-34 requires no warning, there being no capture to point at | `FSPEC:312` — "**no** overwrite warning, there being no capture to point at" | **holds** |
| TSPEC v1.15 §4.5 is no longer the closed four-literal halt set; adds a notice rendered by `renderSnapshotOverwriteNotice(snapshotRef)` into `notices` | `TSPEC:1428` (notice row), `TSPEC:1460` (named pure helper, exported, pushed through `advisoryNotice`), `TSPEC:1446` (`snapshotRef: null` suppresses the notice), `TSPEC:1530` (four shipped four-key set-equalities widened to five); version row `TSPEC:12` = `1.15` | **holds** |
| Emitted on every A6-touched halt with non-`null` `snapshotRef`, never when `null` | `TSPEC:1446`, `TSPEC:1942` (universal quantifier incl. the post-gate un-skip arm), `TSPEC:1943` | **holds** |
| At HEAD the conjunct has no property and no test | `grep -ci overwrit PROPERTIES` = **0**; `PROP-REC-05` (`PROPERTIES:180`) asserts diagnosis + root-cause class only; `grep -rn renderSnapshotOverwriteNotice pdlc/` = **no match** — the helper does not exist in `pdlc/workflows/` yet | **holds** |
| Header pins REQ `f97f4f66…`, FSPEC `d602c440…`, TSPEC `1f6ea486…` | `shasum -a 256` on all three at HEAD: `f97f4f660140…`, `d602c440fc9f…`, `1f6ea4869d10…` | **all three match** |

The three-hash pin is the part I most expected to drift, since it is the exact failure mode F-03
named. It does not drift: the document now pins a hash I can recompute, for each of the three
documents whose edits can falsify its claims.

## Decision

## Consequences

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
