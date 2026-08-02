# Cross-Review: test-engineer — FSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/FSPEC-pdlc-rcv-budget-stop.md` (v1.3)
**Date:** 2026-08-02
**Iteration:** 4
**Scope:** Local — delta re-review against `4123ca7` (the commit v3 reviewed, FSPEC v1.2), HEAD `17a1f98`. Verified closure of v3's F-10…F-13 and scanned only the text v1.3 added: the version block, §5.3 (the *unreadable is one class* paragraph), §5.4 (the prefix-class conjunct), §7.2 (**B-HALT-4a** and the presence-probe false-negative scope-out), §7.3 (B-HALT-4's two sub-cases), §10 (E-8), §11.3 (AT-REG-06, AT-REG-07), §11.4 (the clause's re-wording and the *convergence halt* note, AT-CLR-02, AT-CLR-04), §13.1. Not re-reviewed: every section unchanged since v3.

## Prior findings — disposition

| v3 ID | Sev | Status | Evidence I checked |
|---|---|---|---|
| F-10 | Medium | **Closed, by the stronger of the two routes I offered** | §7.2's new **B-HALT-4a** takes route (a): clause 3 is stated as **read-then-write in that order** — it must locate the `Iterations` heading in the file's text before it can know what to overwrite — so an unreadable file yields no located heading, **no bytes are offered**, and the entry refuses at once. The paragraph then draws the consequence I needed explicitly: *"the whole file is byte-unchanged, not merely the region span"*. I checked the only way this could still leak — a write earlier in the entry than clause 3 — and there is none: §7.3 orders the clauses **3 → 1 → 2**, and §7.2's discriminator is a read-only presence probe. AT-REG-06's byte-equality conjunct is therefore now a **total, deterministic** oracle, identical under both realisations of *unreadable*, which is exactly what the row needs to falsify a re-author. Q-06 is answered in the same stroke by §5.3 (*"one behavioural class, deliberately"*, with the pair left to PROPERTIES as optional evidence rather than as two branches). One residue in §8.1's own wording is filed below as F-15 |
| F-11 | Medium | **Closed, by the precondition I proposed, with the arithmetic restated in the row** | AT-CLR-04's Given now names entry 2 as a **`forcePhases` re-entry** after entry 1's approval at round 2, and carries the derivation: highest existing round becomes **2**, so `D = 3 ≤ E = 3`; `A = H = 1` still closes the gate; `forcePhases` overrides the recorded **approval** only, granting no window and moving no count (§4.3, B-WIN-6), and since `D ≤ E` the forced entry is admitted a round rather than taking B-WIN-6's zero-round halt. I re-derived all of it and it holds. I also checked the one thing the row depends on that it does not restate: entry 2 must clear the **shipped step-G gate**, and it does — the row's own conjunct is that no `RESOLVED:` line was stripped on entry 1, so the marker is still readable when entry 2 arrives. **The two entries are jointly realisable, which is what I said would close this.** The row's assertion about entry 2's *terminal* outcome is one clause short of pinned; that is F-14, filed **Low**, and the reason for the severity drop is stated there |
| F-12 | Low | **Closed** | AT-CLR-02's *"a later convergence halt is not auto-cleared"* conjunct is dropped, with the reason recorded in the row (*"that antecedent never arises here and the conjunct could not fail"*) and the property re-homed to AT-CLR-04/AT-CLR-08. Recording *why* it was dropped is what stops a later editor restoring a conjunct that cannot fail |
| F-13 | Low | **Closed** | §5.4 and AT-REG-07 both gain **same last `HALT-REASON:` prefix class** — *"equivalently, the same §6.1 gate branch"*, which also covers B-CLR-3's unparseable value, the one member that is not a prefix. §5.4 states the mechanism (B-CLR-2 writes `WINDOW-RESUMED: {W}` where B-CLR-1 writes `WINDOW-START: {N}`), that the conjunct exists so the same-branch assertion cannot red on a correct implementation, and that it is latent at this ship and binding once `pdlc-rcv-fixed-point-stop` lands |
| Q-06 | — | **Answered** | §5.3, above |

## Findings

_(pending)_

## Questions

_(pending)_

## Positive Observations

_(pending)_

## Recommendation

_(pending)_

## Verdict

_(pending)_
