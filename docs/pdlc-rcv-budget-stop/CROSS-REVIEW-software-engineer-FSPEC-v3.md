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

| ID | Question |
|---|---|
| Q-03 | **An unreadable post-mortem on a document with rounds still available runs a normal window over a file whose marker is unknown — I checked, and it is HEAD's behaviour, not this feature's.** §5.3's continuation is written for the case with rounds on disk (`S > E`, halt, refusal). Where `D = 1`, `W = 1` and `E = 3`, the entry admits rounds and dispatches normally over a present-but-unreadable post-mortem, because the shipped `checkPostmortem` maps unreadable to `status: "none"` and step G does not refuse. If those rounds converge, nothing is written and the file is never touched; if they exhaust, the entry reaches the same B-HALT-4 refusal §5.3 describes. So both exits are specified and fail-closed, and the "runs anyway" half is unchanged from HEAD (`orchestrate-dev.js:2738`). Not a finding — recorded so the next reader does not re-derive it, and because AT-REG-06 deliberately pins only the halting arm. |

## Positive Observations

- **F-01 was closed on the write path, with no new surface.** The disposition I feared — restating
  E-8 so it reads better while the entry still authors — is not what happened. The document names the
  predicate (file presence), states the outcome, derives the refusal from the clause order it already
  had, and reuses an existing `{which}` literal rather than minting a fourth. The catalogue is
  genuinely unchanged: `Refused — iterations section unconfirmed at {path}` was already in §8.3 for
  B-HALT-4, and the string E-8 and AT-REG-06 quote matches it byte for byte. Closing a High by
  discovering that a shipped refusal already covers the case is the cheapest correct fix available.
- **The asymmetry argument in §7.4 is the right justification, stated at the right altitude.** *"A
  false creating reading is unrecoverable … a false existing reading costs at most one refused entry
  that the operator re-runs"* is a one-sentence derivation of the fail-safe direction from the cost of
  each error, not an assertion of it. It is also what makes F-08 a Low rather than a reopening: the
  rule generalises, only its domain is stated narrowly.
- **AT-REG-06 now falsifies the thing it exists to falsify.** The old row's Then stopped at "nothing
  written" and could pass on an implementation that re-authored. The new one pins the Given so the
  entry actually reaches a halt (`highest existing round 3` ⇒ `D = 4 > E = 3` — I checked the
  arithmetic), asserts **zero authoring dispatches** and **byte equality** of the post-mortem, and
  says in the row which conjuncts fail on a re-author. That is a test that discriminates.
- **§4.4's ordering clause resolves the apparent cycle by naming the dependency direction rather than
  reordering the flow table.** `D` is read from the branch listing and depends on nothing the gate
  does; the gate consumes `D`; the admission arithmetic runs once, after. The flow table keeps its
  operator-facing order and the seam is now unambiguous — a better fix than the renumbering I
  half-expected.
- **§7.3's accepted-cost paragraph now states both writes symmetrically, including the surprise.**
  E-14b's *"a file that reads like a recorded halt but records none"* is the sentence an operator
  needs, and pinning it as **accepted** rather than discovering it in implementation is the same
  discipline E-1b showed for the migration case.
- **§11.4's clause is the right kind of fix even with F-07's wording collision.** It fixes an
  *outcome* the Givens did not pin, explains precisely which conjuncts would false-red without it
  (*"a granted window whose rounds run to exhaustion budget-halts at its end, appending exactly that
  line and stripping exactly that marker"*), and leaves the verdict sequence to PROPERTIES. Naming
  the failure mode a missing clause would cause is what makes it reviewable.

## Recommendation

**Approved with minor changes** — zero High, zero Medium, three Low.

My v2 pre-commitment was that a v1.2 doing the two required things clears my side, and it does. F-01
is closed on the write path with the discriminator named and the harmful direction made
unreachable; F-02's equivalence is now constructible for all three mandated members. Both blockers
are down, and the blocking count went 1 High + 1 Medium → 0 + 0, so the trajectory is convergence,
not churn. I am not re-opening either.

**The three Lows are recorded, not required.** None blocks TSPEC authoring, and all three are
one-clause edits:

1. **F-06** — add *same last `HALT-REASON:` prefix class* (or "same gate branch") to §5.4/AT-REG-07's
   equivalence conjuncts. Latent until `pdlc-rcv-fixed-point-stop` makes B-CLR-2 reachable, so it can
   land with this document or with that feature; it should not land nowhere.
2. **F-07** — say "an approval is reached" in §11.4 instead of "converge", so the clause does not
   share a root with §6.1's *convergence halt*.
3. **F-08** — one line in §7.2 naming which direction of the presence probe this feature relies on.

I would take F-06 and F-07 in this document because both are wording inside spans that were rewritten
this round. F-08 is legitimately arguable as TSPEC's (probe selection), and §13.4's stopping rule
covers it either way.

**Applying §13.4's stopping rule.** All three findings are Low by that rule's own classes — F-06 and
F-07 are precision defects in prose that changes no branch at this ship, F-08 is a boundary statement
about a mechanism TSPEC selects. None of them is a specified branch with an unspecified continuation,
which is the class F-01 was and the reason it was High. Holding a fourth round for them would be the
churn I said I would recommend against.

**Pre-commitment.** I will not open new ground on this document. If a v1.3 takes any of the three
Lows, I will re-read only the touched clauses.

## Verdict

VERDICT: Approved with minor changes
