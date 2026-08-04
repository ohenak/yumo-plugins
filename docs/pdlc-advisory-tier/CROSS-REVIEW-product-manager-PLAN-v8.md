# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md
**Date:** 2026-08-04
**Iteration:** 8 (delta re-review)
**Scope of this round:** delta only. Base `7097b57` (PLAN v1.6, the bytes approved in this
reviewer's v6) → head `279bc38` (PLAN v1.8). Two content commits, `584b791` and `279bc38`, both
inside §8.2's single T-03-6 cell, plus the §10 changelog rows and the header version stamp.
Sections outside that diff are not re-reviewed.

*(Note on numbering: no `CROSS-REVIEW-product-manager-PLAN-v7.md` exists on this branch — the
round-7 window carried a te review only. This file is written as v8 per the orchestrator's
instruction; the prior product-manager round under confirmation is v6.)*

## Prior findings — disposition

Both v6 findings were Low and both were about the *representation of a gateless seam*. Each is
checked against the repository, not against the changelog's claim about itself.

| Prior | What it asked for | Disposition |
|---|---|---|
| **v6 F-01** (Low, Local) — §8.2's T-03-6 row cited "TSPEC §5.4's five `verifyGate` rows"; TSPEC §5.4 is *Prohibitions*, the gate rows are TSPEC §5.5, and the quantifier being transcribed is *FSPEC's* §5.4 | cite "FSPEC §5.4's gate table; TSPEC §5.5's five `verifyGate` rows" | ✅ **Resolved** by `279bc38`. The item column now reads "every gate row of **FSPEC** §5.4" with both pointers spelled out inline. Every one of the four line citations verifies at HEAD: FSPEC §5.4 gate table is `FSPEC:361` (§5.5 begins at `:382`, so `361-380` is exact); FSPEC §18.2 is `FSPEC:1102` and its T-03-6 row — "every prohibition P-1…P-4 **and every gate row of §5.4**" — sits at `:1111`, confirming the quantifier is FSPEC-internal; TSPEC §5.4 is `TSPEC:630` *Prohibitions — structural, not asserted*; TSPEC §5.5 *gate re-runs, per seam* is `TSPEC:648`. |
| **v6 F-02** (Low, Cross-Feature) — A3's gate had two representations across the document set; the PLAN followed FSPEC's "Phase DOD verify" row while TSPEC declared `verifyGate: null`. Emitted as `ERRATUM: TSPEC`. The PLAN-side ask was: **"once TSPEC resolves, §3's A-07 row *and* §8.2 must state A3's direction explicitly the way they now state A1's"** | upstream convergence, then both PLAN sites updated | ⚠️ **Half resolved.** Upstream is genuinely settled: `DECISIONS:698` carries **DEC-ADV-11** ("A3 — no post-action gate; FSPEC ⟷ TSPEC divergence resolved in TSPEC's favour"), FSPEC §5.4's A3 row now reads "**none.** A3's product is classification only: `permittedActions` is `[]` … *(Decided at the Phase PR erratum round — see DEC-ADV-11)*", and `TSPEC:657` reads "**`null`** — same shape as A1". **§8.2 is updated** and is now correct in both directions. **§3's A-07 row (`PLAN:258`) is not** — see F-01 below. |

## Findings

One Medium, no High, no Low. The Medium is the unfixed half of v6 F-02 — the same defect class the
delta fixed one cell over, left standing in the row an implementer reads first.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§3's A-07 row still states A3's gate case on the premise that A3 has a gate — the exact premise §8.2 just retired, and the exact mistake PROPERTIES warns costs a wasted RED batch.** `PLAN:258` reads: "(b) The per-seam gate-exclusivity cases … **each need that seam's `verifyGate` to exist**, so A3+A4 sit in **A-23's block**, A5 in **A-24's block**, and A1+A2 in **A-31's block** (**A1** declares no gate — `verifyGate: null` per TSPEC §5.5/§6.3 — so its case asserts `verifyGate === null` … and that *installing* `async () => ({ passed: true })` makes the case fail…)". After DEC-ADV-11 (`DECISIONS:698`), FSPEC §5.4's A3 row ("**none.**", `FSPEC:361-380`) and `TSPEC:657` (`verifyGate` = **`null`**, "same shape as A1"), the clause "each need that seam's `verifyGate` to exist" is false for A3, and the parenthetical exception names only A1 — so §3 tells the authoring task that A3 takes the *replace-the-gate* form while §8.2 (`PLAN:869`) now tells it A3 takes the *install-the-stub* form. Two statements about one test case in one document, and the changelog's v1.7 row asserts this contradiction was removed. This is not a cosmetic duplication: **A-07 is the RED task that authors the case**, and `PROPERTIES:570-572` states the consequence in as many words — "Asserting conjunct 1 at A3 would require stubbing a gate A3 never reaches and observing a disposition A3 cannot produce — it would fail against a correct build, **in the RED batch (A-07) that authors it**, and not be diagnosed until A-23." **Fix (one cell, no structural change):** in §3's A-07 row change "each need that seam's `verifyGate` to exist" to "each need that seam's gate *representation* to exist — its `verifyGate` for A2/A4/A5, its `verifyGate: null` for A1 and A3", and extend the parenthetical to "**A1 and A3** declare no gate — `verifyGate: null` per FSPEC §5.4, TSPEC §5.5 (`TSPEC:657`) and DEC-ADV-11 — so each case asserts `verifyGate === null`, that `resolved` is unreachable on every path, that the seam terminates in `escalated` or `no-action` with its own O-1 triple, and that *installing* `async () => ({ passed: true })` makes the case fail; §8.2 states the mutation in both directions". Block assignment (A3+A4 ⇒ A-23) is correct and must not change. | AC-4.5 (FSPEC §5.4 gate table), AC-4.6 / BR-6, DEC-ADV-11 |

## Questions

## Positive Observations

## Recommendation

## Verdict
