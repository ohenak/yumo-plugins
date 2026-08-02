# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/FSPEC-pdlc-rcv-budget-stop.md` (v1.2)
**Date:** 2026-08-02
**Iteration:** 3
**Scope:** Technical lens only — feasibility, implementability, integration risk, threshold declaration, existing-code claim verification. Delta re-review against `CROSS-REVIEW-software-engineer-FSPEC-v2.md`.

## Delta basis

Delta protocol applied properly this round: v2 reviewed the whole document at `096b64d`, and this
round diffs the FSPEC from `096b64d` to HEAD — **106 insertions, 15 deletions across nine hunks**,
all of them in sections v2's findings named plus the two te-round closures. The changed spans are the
version block, §4.4, §5.3, §5.4, §6.1 (B-CLR-2), §7.2, §7.3, §7.4, E-8/E-14b, AT-REG-06, AT-REG-07,
§11.4 and AT-CLR-04, and the §13.1 AC-1.4 row. **No other section moved a byte**, so nothing I
approved in v2 is re-litigated here.

No new existing-code claims were introduced by the diff. The v2 verification table stands unchanged
and is not repeated; the two shipped literals the closures lean on were re-checked against the
document's own catalogue rather than re-derived (see the disposition of F-01 below).

## Disposition of my v2 findings

All five closed. The two blockers are closed on the write path, not by restating the read — which is
the failure mode I pre-committed to reject.

| v2 ID | Sev | Status | Evidence in v1.2 |
|---|---|---|---|
| F-01 | High | **Closed** | §7.2 now states the discriminator in terms: *"the discriminator between creating and existing is **file presence** — never the region read, and never the shipped post-mortem status"*, with the outcome spelled out (*"a halt that can see a post-mortem it cannot read takes the existing path"*, no authoring dispatch). §7.4 repeats it in the safe direction and gives the asymmetry argument (a false *creating* read is unrecoverable; a false *existing* read costs one refused entry). The continuation is then closed rather than left dangling: clause 3 runs first (§7.3's 3 → 1 → 2 order, unchanged) and is an **equality read-back**, which cannot succeed on an unreadable file, so the entry lands on **B-HALT-4**'s phase refusal — region byte-unchanged, no halt recorded, no marker stripped, both counts unmoved. This is disposition (a) from my v2 recommendation, and it is the cheaper one. I pre-committed to check the `{which}` literal rather than accept the claim: §7.2 asserts *"no fourth `{which}` literal is minted and the catalogue is unchanged"*, and §8.3's variant table already carries `Refused — iterations section unconfirmed at {path}` (B-HALT-4) at line 724 — **pre-existing, not added by this diff**, and the string E-8 and AT-REG-06 quote is byte-identical to it. Catalogue §4's three-literal enum is untouched. §5.3, E-8 and AT-REG-06 all now carry the entry's continuation instead of stopping at *"nothing written"*: AT-REG-06's Given pins highest existing round **3** so `D = 4 > E = 3` and the entry genuinely reaches a halt, and its Then adds the two conjuncts that actually falsify a re-author — **zero authoring dispatches** and **post-mortem bytes unchanged**. §13.1's AC-1.4 row picks up AT-REG-06. Also worth recording: §7.2 closes my Q-02 explicitly — *"`H − A > 1` … unreachable on every specified path"* is now stated where the invariant is established, not only in a reviewer's margin. |
| F-02 | Medium | **Closed** | §5.4 replaces *same counts* with an equivalence over the **gate-relevant state** — same truth of `A < H`, same resolved `W`, same highest existing round (hence same `D`), hence same resolved `N = max(D, W)` — and states the reason the counts relation was unsatisfiable for the `H − A ∉ {0, 1}` member. The worked pair is given (`H = 3, A = 1` with `H = 2, A = 1`), and I checked it: same open gate, same `W`, same `D`, same `N`, so both members take B-CLR-1 and write the same granting line. All three mandated family members are now constructible. AT-REG-07 carries the same relation verbatim, and the *"fixtures are PROPERTIES' (O-10)"* boundary is stated on both sides — the relation moved without the altitude moving. See F-06 below for the one conjunct the relation still leaves implicit; it does not reopen this. |
| F-03 | Low | **Closed** | §4.4 gains the ordering clause: *"`D` is derived before the gate; only the admission arithmetic follows it"*, with the cycle argument spelled out (the gate **consumes** `D`; the gate may move `W`; the admission arithmetic is evaluated once, after). A TSPEC author reading the flow table now has the seam right. |
| F-04 | Low | **Closed** | B-CLR-2's guard reads `S = max(D, W)` and adds *"on this branch `W ≤ D`, so `S = D` and the guard may be read as `D ≤ E`; the three quantities keep the meanings §4.1 gives them and none is reassigned"* — both halves of what I asked for. |
| F-05 | Low | **Closed** | E-14b added, and §7.3's accepted-cost paragraph restated to cover both writes with the extra surprise named (clause 3 runs **after** the authoring dispatch, so the refusal leaves a fully authored post-mortem with no `## Reset Region`, `H = 0`, no marker — a file that reads like a recorded halt but records none). |
| Q-01 | — | **Answered** | AT-CLR-04's Given is now marked *"a **constructed** state, not one driven through production"*, with the unreachability argument for both `WINDOW-START: 1` and `WINDOW-RESUMED: 1` and the note that the row is evidence about the gate. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
