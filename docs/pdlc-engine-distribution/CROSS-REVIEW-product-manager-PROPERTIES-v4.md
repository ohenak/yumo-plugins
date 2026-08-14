# Cross-Review: product-manager — PROPERTIES (delta re-review)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.6)
**Date:** 2026-08-14
**Iteration:** 4 (delta re-review of v0.5 → v0.6)
**Scope:** Changes since the commit I last reviewed (`06e74162`, v0.5, approved in v3). Confirms my two open Lows are closed and that the revision broke nothing. Unchanged sections already approved are not re-litigated.

## 1. What changed

`git diff 06e74162..HEAD` on the document is four commits and five hunks. Nothing else in the
feature's document set moved: `git diff --stat 06e74162..HEAD` over REQ, FSPEC, TSPEC and PLAN is
empty, and the Upstream cell (`PROPERTIES:5`) still names REQ v0.11, FSPEC v0.7, TSPEC v0.12,
DECISIONS v0.3, PLAN v0.8 — the versions on disk (`FSPEC:16` = 0.7, `PLAN:12` = 0.8). So this is a
pure findings-response round with no re-grounding surface.

| Hunk | Site | Change | Serves |
|---|---|---|---|
| 1 | `:12` | Version cell 0.5 → 0.6 | — |
| 2 | `:22` | New changelog row | — |
| 3 | `:86` | PROP-LAUNCH-1's `Traces` cell drops `AC-5.5`, keeps `TSPEC §6.2`; body states it is a resolver-shape property with no criterion of its own | PM F-06 (v2/v3), SE F-01(a) |
| 4 | `:269` | New `PROP-NEG-18` row in §3 | SE F-02 |
| 5 | `:316-323` | §4's no-`AT-`-row paragraph rewritten for PROP-LAUNCH-1 | PM F-07 (v2/v3), SE F-01(b) |

No property added, removed or re-scoped in §2; no `Carrier` cell, task id or ownership-manifest row
touched; §4's 35 `AT-` rows byte-unchanged.

## 2. Prior findings — disposition

Two open Lows carried from v2 through v3. Both closed, and both closed on the axis I raised rather
than by relabelling.

### F-06 (Low) — PROP-LAUNCH-1 claimed AC-5.5 while asserting a different message id — **Resolved**

The finding was that two properties claimed AC-5.5 while asserting different reason ids, so a DoD
reader could read "AC-5.5 has two carriers" and count coverage twice.

`PROPERTIES:86` now traces `TSPEC §6.2` alone and says so explicitly. I checked the substance, not
the wording:

- The quoted Given is verbatim. `REQ:427-429` reads *"a pin naming a version that is not
  installed … the run refuses with a message naming the pinned version and what is installed"* —
  exactly the string the row quotes, at exactly the cited lines.
- AC-5.5's carrier is real and asserts the id the row names. `PROP-VER-5` (`PROPERTIES:194`) traces
  `AC-5.5, AT-5.5` and pins `version.pin-missing` with three positive conjuncts. The named
  reinforcers exist and also trace AC-5.5: PROP-VER-6 (`:195`), PROP-VER-9 (`:198`), PROP-VER-11
  (`:200`).
- The two branches really are distinct, which is what makes dropping the claim correct rather than
  merely tidy: `store.empty` is the no-versions-installed branch, `version.pin-missing` the
  pin-names-an-absent-version branch. PROP-VER-6 exists precisely to hold `pin-malformed` and
  `pin-missing` apart, so the ids are load-bearing.
- No coverage was lost by the drop. §5's REQ-EDIST-01 row (`:348`) cites PROP-LAUNCH-1 only for
  **AC-1.1's** engine-store half, never for AC-5.5; §5's REQ-EDIST-05 row carries the `AT-5.*` ids
  through `PROP-VER-1…16`. `grep -n "AC-5.5"` over the document returns no orphaned claim.

### F-07 (Low) — §4's "observed inside AT-5.5's and AT-1.3's legs" was uncorroborated — **Resolved**

The old prose asserted an observation site the `AT-` table did not support. `PROPERTIES:316-323` now
names PROP-LAUNCH-4's resolution state (b) instead, and negates the two sites I flagged by name.

Corroborated in both directions:

- The cited leg exists and says what the paragraph says it says. PROP-LAUNCH-4 (`:88`) lists three
  resolution states, and state (b) is *"empty store reports the launcher's own triple with
  `mode: "unresolved"` and carries the refusal text as a notice"* — the paragraph's wording is the
  row's wording, not a paraphrase of it.
- The "triple it reports there is AT-1.6's" claim holds upstream. `FSPEC:694` defines AT-1.6 under
  AC-1.4 as the version-query triple, and `FSPEC:680` separates that triple-member reading from
  AT-1.1's literal — the same split this document has been maintaining since v0.3.
- The negations are the honest kind: each pairs with the positive statement of where the state *is*
  observed, so this is not an absence-only claim.

## 3. Did the revision break anything

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
