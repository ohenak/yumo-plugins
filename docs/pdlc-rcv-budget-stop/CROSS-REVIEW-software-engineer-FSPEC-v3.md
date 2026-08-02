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

Three Low, none blocking. Ids continue v2's sequence so nothing collides in harvest. All three are in
spans this diff changed; I opened no ground in sections I approved in v2.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-06 | Low | Local | **The new gate-relevant equivalence relation omits the one input the gate branches on: the last `HALT-REASON:` prefix.** §5.4 defines two regions as equivalent when they agree on the truth of `A < H`, the resolved `W`, the highest existing round (hence `D`) and hence `N`. Those four fix the *value* the granting line carries, but not the *branch* — §6.1 discriminates B-CLR-1 (`fixed-point:` / `budget-exhausted:`), B-CLR-2/2a (`no-revision:`) and B-CLR-3 (unparseable) purely on that prefix, and B-CLR-2 writes `WINDOW-RESUMED:` rather than `WINDOW-START:`. So two regions satisfying the stated relation can take different branches and write different line *kinds*, which is exactly what conjunct 1 asserts they do not. Harmless at this ship — no path emits S-11, so every constructible region's last reason is a convergence or budget reason and the whole family lands on B-CLR-1 — and PROPERTIES would naturally hold the reason fixed when building the pairs. But the relation was rewritten this round precisely to be exact, and it is one conjunct short of being so at target state, when B-CLR-2 becomes live. **Fix:** add *same last `HALT-REASON:` prefix class* to the four (or, equivalently, "same gate branch"), which is one clause and changes no fixture. | §5.4 (B-REG-7) conjunct 1; §11.3 AT-REG-07; §6.1 |
| F-07 | Low | Local | **§11.4's new convergence clause uses "converge" for the outcome that AT-CLR-02/03 call a "convergence halt" — opposite meanings for the same root, in adjacent rows of the same table.** The clause fixes the dispatch outcome as *"the granted window's dispatched rounds **converge** before the window's last round — an approval is reached inside the window … **No row in this table states otherwise**"*. But AT-CLR-02's Then reads *"a later **convergence halt** is not auto-cleared"*, and AT-CLR-03's reads *"treated as a **convergence halt**"* — where the term means the fixed-point / `no-revision:` non-convergence stop, i.e. a halt, not an approval. Read literally, AT-CLR-02 both grants a window and contemplates its rounds ending in a halt, which is the "otherwise" the clause says no row states. I checked whether this can red a correct implementation: it cannot — AT-CLR-02's conjuncts are *exactly one `WINDOW-RESUMED: 1`*, `W` unchanged, spent rounds stay spent, `≥ 1` dispatch at round 2, and a later halt appends a `HALT-REASON:` rather than a second `WINDOW-*` line, so every conjunct survives either outcome. That is why this is Low rather than a defect in the clause's purpose. But the clause exists to make the negative conjuncts unambiguous, and a reader who takes both uses of the word at face value cannot tell whether AT-CLR-02 is inside or outside its scope. **Fix:** name the clause's outcome *"an approval is reached"* and drop the word "converge", or say in the clause that a *convergence halt* in the §6.1 sense is not an exception to it. | §11.4 convergence clause; AT-CLR-02, AT-CLR-03 |
| F-08 | Low | Local | **The discriminator is now an existence-shaped check, in a document whose §7.3 argues existence-shaped checks are insufficient — and only the *unevaluable* direction is dispositioned, not the *wrong-answer* direction.** §7.4 states the safe rule as *"when the discriminator cannot be evaluated, the halt takes the existing path"*. That closes the read-failure case (F-01) and is right. It does not cover a presence probe that **answers, and answers absent for a file that is present**: that is not "cannot be evaluated", so the specified path is *creating* — an authoring dispatch that erases the live region and the operator's `## Recommendation`, i.e. F-01's exact harm reached by the other fault. This is not the same class of concern as F-01 was: presence is the strongest predicate available at this altitude (a content read cannot distinguish *absent* from *unreadable*, which is what made the shipped status the wrong discriminator), so I am not asking for a different predicate, and §9.1's B-PMT-1 clause tells the authoring agent the region is machine state — belt-and-braces, explicitly not the mechanism. What is missing is one line saying which side of the probe this feature is entitled to rely on. **Cheapest disposition:** state in §7.2 that the discriminator is a **presence probe whose false-negative is out of scope** (`F-N`-style, alongside the torn write at `REQ-RCV-07` AC-7.5), or that TSPEC owns choosing a probe whose failure mode is unevaluable-rather-than-absent. Either makes the boundary explicit instead of leaving the harmful direction unnamed. | §7.2 (discriminator); §7.4; §7.3; §9.1 (B-PMT-1) |

## Questions

## Positive Observations

## Recommendation

## Verdict
