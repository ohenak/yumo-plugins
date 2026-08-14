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

The changelog claims counts and set-equality are unchanged. A revision that adds a row while
claiming "no property added" is exactly the shape that silently corrupts coverage accounting, so I
re-measured rather than accepted the claim.

**PROP-NEG-18 is a catalogue row, not a 90th property.** §3 catalogues negatives already stated in
§2 (`:246`: "Every negative below is stated with a positive conjunct"). PROP-NEG-18 catalogues
PROP-LAUNCH-9's existing clauses (c) and (d); no §2 row changed. §7's "89 properties in §2"
(`:420`) and the column sum 95 / Unit 74 therefore stand, and §3 carries no row count of its own to
invalidate.

**Its exclusion from §4 is the convention, not an omission.** `awk` over §4 returns **zero**
`PROP-NEG-` occurrences — no `PROP-NEG-*` id has ever appeared there, including ones that trace an
`AT-` (PROP-NEG-3 → AT-2.4, PROP-NEG-7 → AC-4.1). PROP-NEG-18's `AC-1.1, AT-1.1` cell follows the
same pattern; AT-1.1's §4 row continues to carry PROP-LAUNCH-9.

**§4 set-equality re-run, not assumed.** §4 yields **35** distinct `AT-` ids, the same 35 as at
v0.5 — the `AT-` rows are byte-unchanged in this diff and FSPEC is unmoved since `06e74162`, so the
set-equality I verified in both directions last round holds by construction.

**PROP-NEG-18's oracle passes the three bars.** It is a negative paired with positive assertions on
the same path: dispatch count asserted `=== 0` (not "no dispatch observed") and tree-and-index
byte-identity against a **non-empty** recorded pre-state, which is what stops an empty fixture
green-lighting it. Its HEAD anchors check out: `pdlc/engine/__tests__/handshake.test.js:110-118` is
the missing-plugin test, pinning `pluginVersion === "not found"` and matching the range, `not
found`, `Remedy:` and `PDLC_PLUGIN_ROOT` on `checkCompat`'s reason; `pdlc/engine/lib/handshake.mjs`
composes that reason with `${REMEDY}` at the cited site. No expected value is derived from the code
under test — the literals are transcribed from FSPEC's AT-1.1.

**Product criteria are where they were.** AC-1.1's two halves still split PROP-LAUNCH-9 / -2
(plugin-compat) from PROP-LAUNCH-1, -3, -4 (engine-store), per §5:348. AC-5.5 now has exactly one
carrier line of reasoning. No P0/P1 requirement lost a carrier in this diff.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-08 | Low | Local | The new changelog row is filed **out of order**: `PROPERTIES:22` is `0.6` and `PROPERTIES:23` is `0.5`, so the table reads 0.1, 0.2, 0.3, 0.4, 0.6, 0.5. The history is append-only and correct in content, but a reader scanning for the latest entry lands on the 0.5 erratum row. Move the 0.6 row below 0.5 — a one-row swap, no text change. | — (document hygiene; §1 reading rules) |

Both prior Lows (F-06, F-07) are closed and are not carried forward. F-08 is new but non-gating, and
I am deliberately raising nothing else: the diff is five hunks, all of them findings-responses, and
everything they touch verifies.

## Questions

None. The two questions this round could have raised — whether dropping AC-5.5 loses coverage, and
whether PROP-NEG-18 disturbs the counts — are answered mechanically in §2 and §3 above.

## Positive Observations

- **The AC-5.5 fix removes a claim instead of adding a justification.** The tempting response to
  "two properties claim one criterion" is to argue why two carriers are fine. This round did the
  harder, more honest thing: PROP-LAUNCH-1 gives the criterion up, states that it *has* no criterion
  of its own, and points at the real carrier by id. Coverage accounting that can be trusted is worth
  more than a coverage number that looks fuller.
- **It names the criterion verbatim rather than paraphrasing it.** The Given is quoted from
  `REQ:427-429` character for character. Paraphrase is how the drift in rounds 2–3 started; quoting
  the source is what stops round 5 re-raising it.
- **The §4 prose and the `AT-` table now give one answer.** The old paragraph named observation sites
  the table did not support. The new one names a leg that exists, quotes that leg's own words, and
  explicitly negates the two sites it is *not* — with the positive statement alongside each negation,
  so the correction does not itself become an absence-only claim.
- **PROP-NEG-18 catalogues without inflating.** Adding a row to §3 while §2, §4, §5 and §7 stay
  numerically fixed is precisely the right shape for "§3's every-negative claim holds again": the
  oracle was already correct in §2.1, and the fix is bookkeeping, stated as bookkeeping.
- **Scope discipline held for a fourth round.** Four commits, five hunks, every one traceable to a
  named finding. No settled decision re-opened, no carrier moved, no count nudged, upstream untouched.

## Recommendation

**Approved with minor changes.**

The two findings that were open against this document are resolved on their merits, verified against
REQ, FSPEC and the shipped code rather than against the changelog's account of itself. The revision
broke nothing: counts, §4's 35-row set-equality, §5's accounting and every carrier cell are intact,
and PROP-NEG-18 is a catalogue entry rather than a hidden 90th property. No High findings are open.

The one new Low (F-08, changelog row order) is a one-row swap and does not gate. It can be folded
into any later edit to this document, or left to the harvest.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
