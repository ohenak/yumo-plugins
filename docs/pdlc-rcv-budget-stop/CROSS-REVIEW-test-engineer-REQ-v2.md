# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.7)
**Date:** 2026-08-01
**Iteration:** 2
**Scope:** delta re-review of v2.6 → v2.7 (`git diff 7bc8602..HEAD`). Prior findings verified against the
revision; new-issue scan restricted to the changed sections (§2, §3.1, §4, §4.1, AC-1.1–AC-1.5, §6, §7,
§8, §9, §10). Paired ends checked **at HEAD**: `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md`
(X-07, O-10, O-12, R-16), `docs/_constraints/pdlc-rcv-split.md` §5.4/§5.5/§6,
`docs/_constraints/pdlc-rcv-baseline.md` §3 and M-7f, `docs/_constraints/pdlc-rcv-catalogue.md` §3.

## Disposition of v1 findings

| v1 | Verdict | Evidence at HEAD |
|----|---------|------------------|
| F-01 (High) — paired edge desynced; interim's only falsifiable oracle owed by nobody | **Resolved** | `REQ-RCV-07` O-12 now fixes the *validate* seam alone ("fixed here, by this obligation, and nowhere else … arity 2 (the region, the branch listing)"), and this REQ's O-12 adopts it one-directionally — the circularity is gone. O-10 restores the **0-call contract leg** on split §5.4 leg 1 with the "only interim fixture defeating both decidable conjuncts" argument, plus legs 1/2 (`≥ 1` dispatch each) and the interim-only leg 3. Split §5.4's "the 0-call contract leg is asserted on leg 1" and `REQ-RCV-07` X-07's "calls it 0 times (`REQ-RCV-01` O-10)" now have a referent. |
| F-02 (High) — derived start below `W` undefined | **Resolved as a rule** | AC-1.5(2) decides it (the origin wins; the start is the later of the two), argues both invariants survive, and names the reachable operator act. O-10 gains a leg for it — but the leg's declared control is arithmetically wrong; see F-01 below. |
| F-03 (Medium) — AC-1.3's second quantity had no declared render | **Resolved** | §6 declares `Iterations (budget {MAX_REVIEW_ROUNDS}, rounds run {k})`, baseline §3 carries the row (`:249`) and §3.1 the note (`:274`), the "mints no operator string" claim is now correctly scoped to *refusal* strings, and O-10's leg is an **equality**, not a substring match. Residual interaction with AC-1.4 raised fresh at F-02 below. |
| F-04 (Medium) — example fixtures only for a parameterisable resolver | **Resolved** | O-10's *"One property-based obligation, not only the enumerated points"* names the generated domain (arbitrary order, well-formed and malformed values, arbitrary `RESOLVED:` state) and four invariants, with the fail-closed direction as the property. One bound is under-defined on an empty draw — F-05, Low. |
| F-05 (Medium) — DC-03 not routed | **Resolved** | O-10's *"DC-03 routing and the ledger's lifecycle"* names the five load-bearing assertions, the mutation-before-run discipline, `Residual` filing, and DC-10's lifecycle (harvest does not delete the ledger). O-11 adds the freshness gate as a named falsification target rather than a green-tree assertion. |
| F-06 (Medium) — DC-09's stopping rule not pasted | **Resolved** | §9 opens with the four conditions pasted verbatim-in-substance, with the "cite these by name to route downstream" licence, and R-1's disposition is re-stated as *mitigated* rather than "accepted and unenforceable". |
| F-07 (Low) — dangling catalogue → `O-6` citation | **Resolved** | §4's *"One dangling citation, recorded rather than left silent"* records the correction and routes the catalogue edit to `REQ-RCV-07`. |
| Q-01 (row C join vacuity) | **Answered** | AC-1.5(1) states the join is vacuous on row C and licenses the exact-string assertion. |
| Q-02 (Phase CR halt leg non-vacuity) | **Answered** | Baseline **M-7f** added (`:210`), and O-10 cites it so the leg asserts *a file that exists lacks the section*. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
