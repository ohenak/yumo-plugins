# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-workflow-distribution/PROPERTIES-pdlc-workflow-distribution.md` (v2.0, Draft)
**Date:** 2026-07-28
**Iteration:** 2

**Lens:** delta re-review of v2.0 against `CROSS-REVIEW-product-manager-PROPERTIES-v1.md` (2H/5M/2L).
Every v1 finding's disposition is verified in §15.2 **and** in the body it claims to change; new
findings are drawn only from the changed sections. REQ v17.0 / FSPEC v5.1 / TSPEC v2.1 are approved
and are not re-litigated — but they are the oracle every new assertion is checked against.

## Verification of v1 findings

| v1 ID | Sev | Claimed disposition (§15.2) | Verified in body | Verdict |
|---|---|---|---|---|
| F-01 | High | §13's closing paragraph replaced by **§13.1**, a full table over every AC absent from §13 | §13.1 present; all four P0 gaps rowed with owning surfaces | **Resolved**, with one overstated quantifier (F-02 below) |
| F-02 | High | **PROP-MTM-07** added, five conjuncts | §7 lines 1059–1081; §12 places it in `driftSync.test.js`; §13 traces it to AC-3.7/AC-3.4; §1.4 budgets its one spawn | **Resolved** |
| F-03 | Med | L3/L4 covered by L2/L5; §1.6's duplicate table **removed**, not repaired | §1.6 carries argument only; §11.1 is the sole table; §0.2's O-11 row agrees | **Resolved** |
| F-04 | Med | §9 row = 9 against six PROP-DET rows; "nine hash-present leaves" → **eight packable**; ceiling restated | §1.4 rows sum to 175 ≈ 180; §9 has exactly six PROP-DET properties summing to 9; §3 says "**Eight** leaves … packed as eight rows" | **Resolved** (one stale "nine" survives — F-03 below) |
| F-05 | Med | D-2's `(NFR-2)` routing removed; §0.3 makes the no-routing rule general; residual becomes **P-R-8**, unowned | §0.3 bullet 4, §11.2 D-2, §14 P-R-8 all say the same thing in the same terms | **Resolved** |
| F-06 | Med | `pluginHash` added as PROP-NEG-05 draw (5) **and** pinned in §2.3's L9/L10 in opposite directions | §2.3 L9 (third value ≠ `sha1(plugin)`) / L10 (= `sha1(plugin)`); PROP-NEG-05 draw (5) with the reached-the-subject conjunct | **Resolved**, and stronger than asked |
| F-07 | Med | `advertisedVersionViolation` routed by name in §0.3, rowed in §13.1, own residual **P-R-5a** | §0.3 final bullet, §13.1 AC-6.6 row, §14 P-R-5a with its own argument; P-R-5's scope narrowed explicitly | **Resolved** |
| F-08 | Low | AC-0.1 removed from the no-property list; both halves stated positively | §13.1 closing paragraph | **Resolved** |
| F-09 | Low | Recorded as **P-R-9**, with the cross-feature note | §1.3 rule 1 first consequence + §14 P-R-9 | **Resolved** |

All nine v1 findings are genuinely disposed. The two Highs' dispositions are the ones worth stating
in detail:

- **F-01.** The four P0 rows are each *owned*, not merely listed. AC-2.4 is honestly split — the
  exit-0 half to PROP-BSL-06/PROP-SEAM-04, the never-silent half to PROP-NEG-04, the in-the-drift-state
  half to PROP-BSL-05, and the **write-failure ladder named as what AT-14/-16 own alone**, which is the
  part a table like this usually hides. AC-3.8 is the same shape: L6 and PROP-MTM-01 as property-level
  supports, with *directory-creation ordering* identified as AT-24's sole territory. AC-3.7 and AC-3.2
  are moved from "absent" to "property-covered", which is the right answer rather than the cheap one.
- **F-02.** PROP-MTM-07's five conjuncts do stop the failure mode the finding named. Conjunct 2 is the
  load-bearing one and it is stated in the only form that works — **zero `backup` records *and* an
  identical backup-directory name → bytes map, no renumbered `NN`** — so a spurious backup is caught
  both at the trace and at the artifact, and the "no new file" half is what protects AC-3.4's 5-deep
  window from eviction. Conjunct 3 pins `syncedAtUtc` explicitly, closing the re-stamping hole.
  Conjunct 4's "equal up to `generatedAtUtc`" is the right normalisation (§1.5 rule 2) rather than a
  loophole. The closing note ("conjunct 2 asserts no backup is *taken*, not that the window is full —
  retention is PROP-BKP-09's") correctly declines to overclaim. **Both re-stamping and spurious-backup
  syncs are now red.**

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **The new AC-3.2 conjunct asserts the wrong exit code, and it is the conjunct §13.1 relies on to call AC-3.2 property-covered.** PROP-MTM-03 (§7) now states: on a plain sync over a tree with at least one `local-edit` and one `unverified` row, "the run's exit is **1** per AC-3.3's precedence". AC-3.3's table ranks *any row `local-edit` or `unverified`* → **2**, above *any row `stale` or `missing`* → 1; a tree containing both rows exits **2** post-run, always. The document's own cited examples say so — TSPEC **AT-8a** (one `local-edit` row, plain sync) → exit **2**, **AT-10** (a `stale` and an `unverified`, plain sync) → exit **2** "(post-run precedence) — O-14's worked case" — and §13 line 1468 traces PROP-MTM-03 to exactly those two ATs. Worse than an off-by-one: REQ §7's exit table and FSPEC §5.8/O-14 record that **exit 1 on a sync run is reachable only if §5.5's post-copy verification is absent or defeated** ("no test should construct exit 1 as a normal sync outcome"; it is AT-35's red direction (i)). So as written this property is red against a conforming implementation and green against precisely the skipped-verification defect the FSPEC warns about — the same failure shape SE F-04 corrected in PROP-MTM-04 one section earlier. Fix in **both** places: PROP-MTM-03's bullet and §13.1's AC-3.2 row ("…exact state string in the report, exit 1") | **AC-3.2**, AC-3.3 (both P0); FSPEC §5.8 / O-14; TSPEC AT-8a, AT-10 |
| F-02 | Low | Local | **§13.1's AC-2.4 row claims more coverage than PROP-BSL-06 delivers.** The row says the exit-0 half is asserted by "**PROP-BSL-06** (hook exits 0 on every `E1 = holds` vector)". PROP-BSL-06's own stated domain (§5.2, per SE F-03/PM Q-02) is the **10** `E1 = holds` vectors on `--check`, plus **3 representative** vectors re-run on sync and the hook for the exit-code conjunct. The hook is exercised on 3 of the 10, not on every one. The AC is still substantively owned (3 baseline vectors + PROP-SEAM-04's token runs + PROP-NEG-04 + PROP-BSL-05 + AT-3/-14/-16/-18a), so this is a precision defect in the disposition table rather than a hole — but the disposition table is the artifact that makes a P0 AC's absence acceptable, and an overstated quantifier there is v1 F-01's failure mode in a smaller costume. One-line fix: say "on three representative `E1 = holds` vectors" | AC-2.4 (P0) |
| F-03 | Low | Local | **One stale "nine" survives the F-04 recount.** §2.5's shrink ladder step 1 still reads "A packed **nine-row** run that fails is almost always failing on one row"; §1.4 and §3 now correctly say **eight** packable leaves packed as eight rows. Editorial, but it is the same number the v1 finding was about, so it reads as an incomplete correction | §1.4, §2.5; NFR-2-adjacent budget prose |

## Questions

| ID | Question |
|----|---------|
| Q-01 | With F-01 corrected to exit **2**, is the plain-sync conjunct still discriminating enough? Exit 2 is also what a run reaching AT-7's `unverified` state produces without any `--force` decision being made. The byte-unchanged and exact-state-string conjuncts carry the AC-3.2 claim; is the exit code worth asserting at all here, or should the row instead assert exit **2** *and* that the run's `writeFailures` is empty (i.e. the rows were declined, not failed)? |
| Q-02 | P-R-7 instructs "the first implementation batch should report the measured `npm test` delta and this row should be updated with it". Is that instruction routed anywhere the implementation phase will actually see it — a PLAN task — or does it live only in this document's residual table? |

## Positive Observations

- **§13.1 is the right artifact, not just the requested one.** It applies §13's absence-is-a-disposition
  contract to *every* AC outside the traceability table, and for the split cases it names what the AT
  owns **alone** (AC-2.4's write-failure ladder; AC-3.8's directory-creation ordering). That is the form
  that survives a later reader — "AT-24" alone would not have.
- **PROP-MTM-07 is the strongest addition in v2.0.** It closes the one operator-facing idempotency claim
  with an assertion of exactly the shape the product risk has: silent backup-window eviction is a defect
  the operator only discovers at restore time, i.e. at the worst possible moment, and conjunct 2 makes it
  a red test on the first idle sync rather than on the fifth.
- **The ≈ 55 → ≈ 180 recomputation is the honest move, and the re-argument survives the honest number.**
  The rows are individually derivable (they sum to ~175), and re-basing R-3 on **wall clock** rather than
  spawn count is the correct correction: R-3's product risk was always "a suite that stops being run", and
  27–45 s of added full-suite time is inside what a maintainer tolerates for `npm test` while being outside
  a tight edit loop — which the document then answers with jest file selection and the §12 placement rule
  that makes it usable. The re-expression rule is now ordered *and* has named first candidates (§8's 32
  token spawns, §3's 8 solo runs), so it can actually fire instead of being a wish. Accepting a 3× worse
  number rather than defending the flattering one is the right product behaviour.
- **P-R-10 is the correct product disposition of the pure-reordering hole.** "A defect that is unobservable
  is also harmless at the observable level; it becomes a hazard only if a later change makes one of the
  guards partial" is exactly right at PROPERTIES altitude — the operator cannot experience a reordering
  that produces identical output on every input. Crucially the residual does **not** stop there: it names
  the reachable defects in the same neighbourhood (vacuous equality, degraded-manifest fall-through,
  wrong-field comparison) and points at the controls that catch each, so the hole is bounded rather than
  merely confessed. Replacing v1's false "every adjacency has a co-holding fixture" with this is a net gain
  in product trust.
- **P-R-8 is disclosed at the right altitude.** NFR-2 is P1 and structurally discharged; accepting a latency
  residual with **no** owning surface is a legitimate product call *provided it is said out loud*, and §0.3,
  §11.2 D-2 and P-R-8 now say it in identical terms with the exposure named (scales with row count, lands on
  the hook path at session start) and the single thing that would change it identified (a trace `op` for the
  probe). "Routed to nothing" is no longer possible in this document.
- **P-R-4a's fallback is the product-safe one.** "If the implementation cannot achieve the finer granularity,
  relax the floor claim on a hash-less runner and **say so in the skip message** — never leave both statements
  standing" preserves the O-11 promise the operator actually depends on (never silently green, never silently
  absent) instead of preserving the flattering claim. It is also correctly filed as an upstream note against an
  approved TSPEC rather than an edit to one.
- **F-06's fix is stronger than the finding asked for.** Pinning `pluginHash` in *opposite* directions on L9 and
  L10 means a wrong-field implementation is red on each leaf independently, not merely detectable in aggregate —
  and the perturbation draw is kept as well. US-03's direction answer is now asserted twice over.
- **The §15 ledger is reviewer-qualified and disposes findings by mechanism, not by adjective.** Every row names
  the section changed and, where the v1 claim was retracted, says what was wrong with it (PROP-MTM-04's
  bytes-only argument; PROP-CLS-02's universal co-holding claim). That is what makes iteration 2 cheap.

## Recommendation

**Needs revision**

Required to clear:

1. **F-01** — correct the plain-sync exit conjunct to **2** in PROP-MTM-03 and in §13.1's AC-3.2 row,
   per AC-3.3's precedence table and the property's own cited AT-8a/AT-10. If any reading makes exit 1
   defensible on a sync run, it must be reconciled with FSPEC §5.8 / O-14's "exit 1 on a sync run is a
   diagnosis of skipped verification, not a spec case" before it is asserted.

F-02 and F-03 are one-line precision fixes and may be folded into the same revision. No other finding
is open: all nine v1 findings are verified resolved, and the v2.0 additions (P-R-8, P-R-9, P-R-10,
P-R-4a, P-R-5a) are sound product dispositions.

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 2}
