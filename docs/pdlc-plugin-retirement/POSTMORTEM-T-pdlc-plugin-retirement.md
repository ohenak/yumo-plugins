# POSTMORTEM — Phase T (TSPEC cross-review) — pdlc-plugin-retirement

**Date:** 2026-08-17
**Phase:** T (TSPEC cross-review)
**Rounds used:** 5 of 5 — iteration cap reached, halted open
**Document at halt:** `TSPEC-pdlc-plugin-retirement.md` v0.6 (`200068da`)

RESOLVED: no

## Phase

Phase T authored and revised the TSPEC for the pdlc plugin retirement against
`REQ-pdlc-plugin-retirement.md` (v0.11) and `FSPEC-pdlc-plugin-retirement.md` (v0.5).
Five author/review rounds ran, carrying the document from v0.2 to v0.6. The phase halted
on the iteration cap, not on a stalled or contested finding.

## Iterations (5 reached)

| Round | Doc reviewed | PM verdict | TE verdict | Revision that followed |
|---|---|---|---|---|
| 1 | v0.2 | Needs revision (3H / 3M / 1L) | Needs revision (5H / 5M / 4L) | v0.3 — AT-3.3 transcription, AT-5.2 comparison rule, `driftGenerators.js` consumer measurement, cleanup-script harness invocation path, §4.5 clause 1(b) |
| 2 | v0.3 | Needs revision (2H / 0M / 1L) | Needs revision (2H / 4M / 1L) | v0.4 — §4.5 clause 1(b) run-variable rewrite, TT-3 five-script scope, §3.2 row 4 parse/runtime split, §6.1 erratum 7 |
| 3 | v0.4 | Needs revision (1H / 0M / 2L) | Needs revision (2H / 1M / 2L) | v0.4 rev — TT-3 set-equality companion, §4.4 AC-3.3 hook set, §2.6/§5.5/§6.1 withdraw the AT-1.3 orphan citation, row 4b TT-1b oracle |
| 4 | v0.4 rev | Needs revision (1H / 0M / 1L) | Needs revision (1H / 2M / 0L) | v0.5 — §5.5 two-channel no-orphan oracle (import-specifier + `globalSetup`/`globalTeardown`), §2.6 config-wired carve-out, erratum 8 |
| 5 | v0.5 | **Needs revision (1H / 0M / 1L)** | **Needs revision (2H / 1M / 1L)** | v0.6 — §6.1 erratum 9 routes the AT-1.3/BR-SWEEP-6 narrowing upstream; §5.5 states the skip-set join oracle; §5.2 TT-1b sink naming; §2.9 class 3 owns the `driftCapabilities.js` entry; §5.5 orphan-oracle reachability + `helpers/bin/` removal |

High-severity trajectory is monotone downward and near-closed: PM 3 → 2 → 1 → 1 → 1,
TE 5 → 2 → 2 → 1 → 2. No finding was carried unaddressed across a round; every round-5
finding has a matching commit in v0.6 (`3b295554`, `0dbc7554`, `a36bd3bb`, `200068da`).
What is missing is a **round 6 to confirm v0.6** — the cap consumed the confirmation round,
not a disputed one.

## Reviewers

| Reviewer | Lens | Rounds |
|---|---|---|
| product-manager | Requirements traceability, scope compliance, acceptance-criteria fidelity | v1–v5 |
| test-engineer | Testability, oracle falsifiability, test-level fit, property coverage, TDD orderability | v1–v5 |

Both reviewers ran delta re-reviews from round 3 onward (changed hunks only, prior
approvals not re-litigated), which is why finding counts fell without the document
shrinking.

## Pattern of Disagreement

**There is no reviewer-versus-reviewer disagreement in this phase.** PM and TE converged,
and by round 5 converged on the *same* High finding from two lenses: PM F-01 and TE F-01
both say §5.5 attributes a relaxed clause ("no *unregistered* `skip`") to FSPEC AT-1.3,
whose approved text reads "no skipped or pending test **at all**". Both prescribed the
identical fix: route the narrowing through a §6.1 erratum instead of restating upstream in
narrowed form. Agreement this tight is the opposite of a stall.

The disagreement that actually consumed the rounds is **author-versus-upstream**, and it
had one recurring shape:

1. **Each fix opened its successor in the same neighbourhood.** Rounds 3, 4 and 5 all
   landed inside the §2.6 / §5.5 / AT-1.3 cluster. Round 3 withdrew a bad AT-1.3 orphan
   citation; round 4 found the replacement no-orphan oracle red-by-construction against
   live infrastructure (`skipSinkSetup.js` / `skipSinkTeardown.js` are config-wired, not
   imported); round 5 found the two-channel oracle correct but its companion skip clause
   re-narrating AT-1.3. Three rounds spent on one obligation.
2. **Oracles specified as prose, then found non-constructible.** TE F-04 (v1), F-01 (v3),
   F-01 (v4) and F-02 (v5) are all the same defect class: an assertion stated in English
   that either cannot fail, cannot pass, or has no stated evaluation mechanism. TE round 5
   F-02 is the sharpest instance — the narrowed clause leaned on `validateSkipRecords`
   (`helpers/skipSink.js`), which checks only the registered direction and would have
   green-lit a bare `it.skip` added by the sweep.
3. **Arithmetic and set-membership slips in enumerations** (PM F-03 v2, PM F-01/F-02 v3,
   TE F-09 v1, TE F-02 v2): five-scripts count, AC-3.3's four hooks quoted as three,
   `check-req-size.sh` missing from TT-3's set-equal enumeration. Cheap to fix, but each
   consumed a High or a round slot.

## Best-Guess Root Cause

**Proximate:** the TSPEC repeatedly restated upstream acceptance criteria in its own
words — sometimes narrowed, sometimes widened — instead of citing them verbatim and
routing any needed change through the §6.1 erratum channel. Every restatement is a place
where the TSPEC and the binding FSPEC text can diverge silently, and reviewers correctly
treated each one as High. The erratum mechanism existed from round 2 (errata 7, 8) and was
used correctly for other items; it was simply not reached for on the AT-1.3 skip clause
until round 5 told the author to reach for it.

**Structural:** the feature's hardest obligations are *self-referential* — the TSPEC
specifies oracles over the very test infrastructure the sweep is deleting. §5.5's
no-orphan universal must range over helpers while four helpers are being removed and two
survive only through `package.json` wiring the import graph cannot see. Designing an
oracle over a moving tree is not something a single authoring pass gets right; it needed
the author to *run* the grep against a simulated post-sweep tree, which is what TE finally
did in round 5's disposition and what closed F-01. Rounds 3–5 are the cost of specifying
that oracle by inspection rather than by execution.

**Not the cause:** reviewer severity inflation, scope creep, or upstream churn. FSPEC and
REQ were stable across all five rounds; every High is grounded in a cited line and none
was withdrawn as mistaken except TE F-07 (v2), which the reviewer withdrew himself.

## Recommendation

v0.6 is very likely approvable. The cheapest correct path is a **single delta round on
v0.6**, not a Phase T restart:

1. **Re-run one delta round (both lenses) on v0.6**, scoped to `92ae9145..200068da`. Both
   round-5 reviewers named the exact fix they wanted and v0.6 implements it; the round is
   a confirmation, not a negotiation.
2. **Close the one genuine cross-artifact open item before or during that round.**
   §6.1 erratum 9 *proposes* narrowing FSPEC AT-1.3 / BR-SWEEP-6 to "no skip or pending
   test absent from the skip sink's inventory". The FSPEC has not been amended — grepping
   `FSPEC-pdlc-plugin-retirement.md` for `unregistered` returns nothing. Until the FSPEC
   owner accepts erratum 9, the binding text is the wider one and TT-1b's root-conditional
   skip is a violation on a root runner. This needs a short FSPEC erratum round, and it is
   the only item that can still block Phase P.
   - If the owner rejects the narrowing, TE's Q-01 states the fallback: drop TT-1b's
     root-conditional arm and leave row 4b's runtime-failure exit status uncovered. That
     choice should be costed in §5.5 rather than re-derived at implementation time.
3. **Sweep the two remaining non-gating items** if any survive the delta round: PM F-02
   (Low, TT-1b naming — already fixed in `a36bd3bb`) and TE F-04 (Low, channel (a)
   satisfiable by a mutually-importing pair — already addressed in `0dbc7554`).
4. **Carry forward to Phase P authoring:** for any oracle that ranges over the tree the
   sweep modifies, *execute* the derivation against a simulated post-sweep tree before
   writing the assertion down. Three of the five rounds here were spent discovering by
   review what one grep would have shown the author.

If the operator accepts, flip `RESOLVED: no` to `RESOLVED: yes` and re-run Phase T for a
single delta round on v0.6.
