# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md`
**Date:** 2026-08-17
**Iteration:** 8

**Scope:** delta re-review against `b6f0516` (the `REVIEWED-COMMIT` of v7). `git diff b6f0516 HEAD --
docs/pdlc-plugin-retirement/FSPEC-pdlc-plugin-retirement.md` is 20 insertions / 4 deletions in three
places: the version row (0.5 → 0.6, 2026-08-18), **BR-SWEEP-6** (§4.x), **AT-1.3** (§6.1) and a new
**§7.3 Downstream errata — accepted**. Everything else is untouched and is not re-litigated.
Decision-freeze round: only a defect the delta introduced, or a load-bearing claim false at HEAD,
can block.

## Disposition of the delta's claims (all verified against HEAD)

| Claim in the delta | Verdict | Evidence |
|---|---|---|
| `SKIP_INVENTORY` registration API lives in `helpers/driftCapabilities.js` | True | `pdlc/workflows/__tests__/helpers/driftCapabilities.js:93` (`export const SKIP_INVENTORY`), `:324` (`export function itOrSkip`) |
| Records land in `helpers/skipSink.js` | True | `pdlc/workflows/__tests__/helpers/skipSink.js:17`; `driftCapabilities.js:134` names it as the on-disk sink compared to `SKIP_INVENTORY` at end of run |
| `SKIP_INVENTORY` already carries `uid-nonroot` entries at HEAD, so the old "no skipped test at all" clause was already unsatisfiable on a root runner | True | `driftCapabilities.js:94`–`:121` (AT-14b, AT-16, AT-27, AT-32(a), AT-34 and four further rows, all `capability: "uid-nonroot"`); probe at `:192` |
| The registration API is actually used this way today | True | `documentOracles.test.js:54`, `:340`, `:572`; `skipSinkTransport.test.js:47` |
| The exempting mechanism survives the sweep (so AT-1.3 is decidable post-sweep) | Consistent | TSPEC `:231`–`:232` keeps `driftCapabilities.js` and `skipSink.js` via `documentOracles.test.js` / `skipSinkTransport.test.js`; both modules exist at HEAD |
| L-5's `119` still matches the pre-sweep corpus | True | `ls pdlc/workflows/__tests__/*.test.js \| wc -l` = 119 |
| REQ needs no edit | Sound conclusion, imprecise wording | REQ `:326` (AC-1.3) is M-8-scoped and M-8's modules do not survive the sweep, so no registered skip can belong to M-8 post-sweep; see F-03 on the "silent" wording |

The delta strictly narrows a clause that was **false on a root runner at HEAD** and leaves the bare
`it.skip` / unregistered-pending prohibition intact. Nothing that worked before is broken by it.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | *(inherited, nonlocal — carried from v5 F-01 / v7 F-01, untouched again.)* **BR-CLN-3a's name-only expectation cannot decide E-18.** BR-CLN-3a (`:511`–`:514`) says classification rests on L-11's name set, "not content"; E-18 (`:578`) makes a git-tracked file in the target directory unexpected, and BR-CLN-5 forbids touching tracked files. A name-only predicate cannot see trackedness. Cheapest fix, still inside step 2's "no deleted artifact consulted" spirit because it consults *git*, not the manifest: state the predicate as name-in-L-11 **and** path-untracked. | BR-CLN-3a; BR-CLN-5; E-18; §3.5 step 2 |
| F-02 | Medium | Local | *(inherited from v7 F-02, untouched.)* **AT-5.2's field-set equality does not say how deep it recurses.** Clause 1 asserts field sets over "the whole report" (`:773`); clause 2 exempts the eight collections from *value* comparison but compares "presence and shape" (`:779`) without defining shape. Inside `dispatches` (`pdlc/engine/lib/report.mjs:64`, `:85`) and `loop` (`:70`, `:91`) the nested key set is run-dependent, so a whole-report recursive key-set equality reds on a correct sweep. One clause fixes it: field-set equality over the report's top level and over non-exempt objects; inside the eight exempt collections, only the collection's own presence. | §6.5 AT-5.2 (1)–(2); E-21 |
| F-03 | Medium | Local | *(delta, local.)* **§7.3's "REQ AC-1.3 is … silent on registered skips" is not what the REQ says.** REQ AC-1.3 (`REQ-pdlc-plugin-retirement.md:326`) forbids "no skipped or pending test belonging to M-8" without qualification, and C-8 (`:261`–`:263`) says M-8 tests are "removed, never skipped, marked pending". The REQ is *narrower in scope*, not silent on registered skips: inside M-8 it forbids them too. The **conclusion** (no REQ edit) still holds, because M-8's modules do not survive the sweep, so no M-8-belonging skip of any kind can exist post-sweep, and AT-1.3's L-5 post-sweep count clause reds if one did. Fix is one clause in the §7.3 row: say "vacuous post-sweep because M-8's modules are deleted", not "silent". Non-blocking: the erratum row is rationale, not a gate. | §7.3 row "TSPEC §6.1 erratum 9" |
| F-04 | Medium | Local | *(delta, local.)* **The new exemption is membership-only, with no join obligation stated at FSPEC altitude.** AT-1.3 exempts a skip "registered through `itOrSkip` with a `SKIP_INVENTORY` entry declaring its capability gap". As written, a future author could widen `SKIP_INVENTORY` and green the gate without any skip ever firing; the FSPEC does not require that each exempt skip be *joined* to an inventory entry, nor that the inventory contain no unmatched rows. HEAD's comparator (`helpers/skipSink.js` `validateSkipRecords`, TSPEC `:839`, `:859`) checks only that the records that exist are well-formed and on the ledger, which is exactly the containment reading. TSPEC §5.5's skip-join oracles carry the intent, but the FSPEC clause they implement leaves it optional. One clause — "each exempt skip joins to an inventory entry, and the join is checked, not assumed" — closes it. | §6.1 AT-1.3; BR-SWEEP-6 |
| F-05 | Low | Local | *(inherited from v7 F-03.)* **E-16b's rationale is weaker than the shipped evidence.** E-16b (`:576`) refuses on `.pdlc-tmp.*` reasoning that "no post-sweep artifact proves the residue is junk"; the retired channel reserves the `.pdlc-` prefix for its own temporaries (`pdlc/hooks/scripts/sync-workflows.sh:299`, `:323`; `pdlc/hooks/scripts/lib/pdlc-drift.sh:735`, `:1444`, `:1658`). The outcome is right; the stated reason understates the case. | §5, E-16b |
| F-06 | Low | Local | *(inherited from v7 F-04, untouched.)* **The `Cross-Reviews` header row still stops at v4** (`:11`) while v5, v7 SE and v5, v6, v7 TE cross-reviews are tracked in `docs/pdlc-plugin-retirement/`. A reader reconstructing this document's review history is pointed at the wrong set. | Header metadata table |

## Questions

| ID | Question |
|----|---------|
| Q-01 | AT-1.3 now exempts registered skips repo-wide. Is the intended post-sweep steady state that the *only* registered skips are the `uid-nonroot` family plus TT-1b's, or is the exemption open-ended? If the former, pinning the expected capability set (as L-4 pins the hook set) would make an added capability a reviewed decision rather than a silent widening. |

## Positive Observations

- **The narrowing fixes a clause that was already unsatisfiable, and it was verified rather than assumed.** The old AT-1.3 demanded a suite with "no skipped or pending test at all", while `SKIP_INVENTORY` at HEAD carries nine `uid-nonroot` rows (`driftCapabilities.js:94`–`:121`) that skip on any root runner. The erratum names both halves — TT-1b's new arm *and* the pre-existing falsity — so the edit is a correction, not an accommodation of a downstream convenience.
- **The prohibition that mattered survived intact.** A bare `it.skip` or unregistered pending marker still fails, repo-wide, in both BR-SWEEP-6 and AT-1.3, and the surrounding conjuncts (L-5's literal count, L-6's two rows and their named assertion titles, each of which must red when the re-homed behaviour is reverted) are untouched. The exemption is keyed to a mechanism that exists and is exercised, not to a promise.
- **§7.3 is a new, correctly-shaped section rather than a silent edit.** Downstream errata now have a visible ledger separate from §7.2's upstream one, and the row states what was raised, what was changed here, and why the REQ needs no edit — so the next reader can audit the narrowing without diffing four rounds.

DEFERRED: pin the expected `SKIP_INVENTORY` capability set (or a maximum) in the FSPEC so a future widening is a reviewed decision, per Q-01.
DEFERRED: fold F-01 (BR-CLN-3a name+untracked predicate) and F-02 (AT-5.2 recursion depth) into the TSPEC's implementing contracts if the FSPEC stays frozen.

## Recommendation

**Approved with minor changes**

No High findings, delta or inherited. The delta narrows exactly one clause, in exactly two places, for a reason that is true at HEAD (`driftCapabilities.js:94`–`:121`), and every path, symbol and file it newly names exists and survives the sweep. Nothing the previous revision established is weakened: bare and unregistered skips still fail, and the count and re-homing conjuncts of AT-1.3 are unchanged. F-03 and F-04 are one-clause improvements to the new text; F-01, F-02, F-05 and F-06 are inherited non-gating items already recorded in v7. The document is ready for TSPEC authoring to continue.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 4, "low": 2}
