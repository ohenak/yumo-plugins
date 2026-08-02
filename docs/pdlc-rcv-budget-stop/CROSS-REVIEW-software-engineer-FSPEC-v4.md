# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/FSPEC-pdlc-rcv-budget-stop.md` (v1.3)
**Date:** 2026-08-02
**Iteration:** 4
**Scope:** Technical lens only — feasibility, implementability, integration risk, threshold declaration, existing-code claim verification. Delta re-review against `CROSS-REVIEW-software-engineer-FSPEC-v3.md`.

## Delta basis

v3 reviewed the FSPEC at `4123ca7` (v1.2). This round diffs `4123ca7 → HEAD` on the FSPEC alone —
**86 insertions, 18 deletions across nine hunks**, landed as three commits (`29d3aba`, `f10e94c`,
`17a1f98`). The changed spans are: the version block (v1.3 record), §5.3 (the *unreadable is one
behavioural class* paragraph and the no-write restatement), §5.4 (the prefix-class conjunct), §7.2
(the two new paragraphs — **B-HALT-4a**, and the presence-probe scope statement), §7.3 (B-HALT-4's
two sub-cases), E-8, §11.3 AT-REG-06 and AT-REG-07, §11.4's clause and its new wording note,
AT-CLR-02, AT-CLR-04, and the §13.1 AC-1.4 row. **No other byte moved**, so nothing I approved in v2
or v3 is re-litigated here.

Three of the nine hunks answer te findings I did not raise (te F-10, F-11, F-12); I read them because
they land in spans that carry my own closures, not to re-review the test lens.

**No new existing-code claims** were introduced by the diff. The two claims about *this repo's*
shipped behaviour that the new text leans on I re-checked: `forcePhases` overrides a recorded
**approval** only (AT-CLR-04's entry-2 premise) matches the documented contract and §4.3's B-WIN-6,
and B-WIN-6's zero-round halt is correctly excluded there because `D = 3 ≤ E = 3`. The v2 verification
table stands unchanged and is not repeated.

## Disposition of my v3 findings

All three Lows closed, each with the one-clause edit I named — no scope creep, no new surface.

| v3 ID | Sev | Status | Evidence in v1.3 |
|---|---|---|---|
| F-06 | Low | **Closed** | §5.4's equivalence gains **`and the same last HALT-REASON: prefix class`** — "equivalently, the same §6.1 gate branch" — and states *why* the first four conjuncts are insufficient (they fix the value the answering line carries, not the kind of line; §6.1 discriminates B-CLR-1 / B-CLR-2/2a / B-CLR-3 on that prefix alone, and B-CLR-2 writes `WINDOW-RESUMED: {W}` where B-CLR-1 writes `WINDOW-START: {N}`). It also records the latency correctly — *"latent at this ship — no path emits S-11 … binding once `pdlc-rcv-fixed-point-stop` makes B-CLR-2 reachable"* — which is the half I said should not land nowhere. AT-REG-07 carries the same conjunct with the failure mode named inline (*"without it a pair may write `WINDOW-RESUMED:` against `WINDOW-START:` and the same-branch conjunct reds on a correct implementation"*). I re-checked the worked pair against the widened relation: `H = 3, A = 1` and `H = 2, A = 1` still pair, since the prefix is a free coordinate PROPERTIES holds fixed. No fixture changed, as predicted. |
| F-07 | Low | **Closed** | §11.4's clause now reads *"an approval is reached before the window's last round — the phase completes inside the window"*, and a new *Wording, because the root is overloaded* paragraph states that the clause deliberately does **not** say "converge", that §6.1's **convergence halt** is the opposite outcome, and that such a halt *"is **not** an exception to this clause: no row grants a window and then reaches one"*. That is both dispositions I offered, taken together. te F-12 then removed the AT-CLR-02 conjunct that made the collision visible. Residue: one call site still uses the retired name — see F-10 below, which does not reopen this. |
| F-08 | Low | **Closed** | §7.2 gains *"The discriminator is a presence probe, and only one direction of its failure is in scope"*: the unevaluable direction is §7.4's, and a probe that *"answers **absent** for a file that is present"* is named as causing exactly the harm the clause prevents and declared **out of scope for this feature** (**F-N-1**-style, alongside `REQ-RCV-07` AC-7.5's torn write), with **F-N-4** giving TSPEC the obligation to choose a probe whose failure mode is *unevaluable*-rather-than-*absent*. The paragraph also keeps the justification I asked not to lose — presence is the strongest predicate at this altitude because a content read cannot distinguish *absent* from *unreadable*. This is disposition (a) plus (b), which is more than I asked for. One indexing residue at F-11. |

I also read the three te-driven hunks, since two of them sit inside spans my own closures depend on:

- **B-HALT-4a (§7.2)** strengthens F-01's closure rather than disturbing it. Clause 3 is stated as a
  **read-then-write** step that must *locate* the `Iterations` heading before it can overwrite, so an
  unreadable file yields no located heading, no insert position, and therefore no write — and §8.1's
  B-HALT-3 insert is explicitly **not** reached, because *heading absent* and *file unreadable* are
  different observations. I checked that this does not contradict B-HALT-3's own text (§8.1 line 743:
  *"when no such heading is found, the loop inserts one rather than failing"*, whose disposition is a
  **readable** file) — it does not; the two are now disjoint by observation, not by precedence.
  Consequence: whole-file byte equality becomes a total oracle for E-8, which is strictly stronger
  than the region-span equality AT-REG-06 asserted at v1.2.
- **AT-CLR-04's entry-2 precondition** is arithmetically sound. I re-derived it: entry 1 starts at
  `D = 2`, approves at round 2, leaving highest existing round 2, so `D = 3 ≤ E = 3` and entry 2 has
  a round to dispatch; `A = H = 1` keeps the gate shut; `forcePhases` overrides the recorded approval
  only, so it grants no window and moves no count, and does not take B-WIN-6's zero-round halt because
  `D ≤ E`. The row's conjuncts survive on both entries. Two wording residues, F-09 and F-10.
- **AT-CLR-02's dropped conjunct** is correctly justified as vacuous under the §11.4 clause, and the
  obligation it used to carry (*one clearance grants exactly one window*) is re-homed to AT-CLR-04 and
  AT-CLR-08, both of which do assert it. Nothing lost.

## Findings

Three Low, none blocking. Ids continue v3's sequence. All three are in spans this diff changed; I
opened no ground in sections I approved earlier, per my v3 pre-commitment.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-09 | Low | Local | **AT-CLR-04 cites §11.4's clause as the authority for its entry-1 outcome, but the clause's antecedent — *"in each row that grants a window"* — is false for AT-CLR-04, which grants nothing on either entry.** The row is the one place in §11.4's table where rounds are dispatched **inside a window the row did not grant** (`W = 1` from a prior, off-row clearance; the gate is shut at `A = H = 1`), and it leans on the clause twice: in the Given (*"entry 1's dispatched rounds reach an approval at round **2** (§11.4's clause)"*) and in the parenthetical (*"§11.4's convergence clause is what keeps entry 1's dispatched rounds from budget-halting"*). Read literally, neither citation holds — the clause simply does not quantify over this row. I checked whether that leaves a testable fact unpinned, because that would be Medium: it does **not**, because this round's rewrite moved the outcome *into the Given* ("entry 1's dispatched rounds reach an approval at round 2"), so a fixture builder reads it from the row itself and the §11.4 reference is decoration rather than load-bearing. Were the outcome not pinned there, entry 1's rounds could legitimately run to exhaustion — round 3 **is** the window's last — appending a `HALT-REASON:`, stripping the marker, and falsifying both *"nothing is appended … on either entry"* and entry 2's stated `forcePhases` premise (a halted phase, not a completed one). That is the failure the parenthetical claims the clause prevents, and it is prevented by the Given instead. **Fix (one clause, no fixture change):** widen the antecedent to *"in each row in which rounds are dispatched inside a window, whether or not the row grants it"*, so the clause covers the one row that needs it and the two citations become true. | §11.4 clause; AT-CLR-04 (Given and parenthetical) |
| F-10 | Low | Local | **AT-CLR-04 still calls it "§11.4's *convergence* clause" — the exact name the F-07 fix retired one paragraph earlier.** §11.4 now says in terms that the clause *"deliberately does **not** say the rounds 'converge'"* because §6.1 owns **convergence halt** for the opposite outcome; the last surviving use of the retired name is in the row that most depends on the clause. This is not the v3 ambiguity returning — the clause's meaning is now unambiguous wherever it is stated — but a reader arriving at AT-CLR-04 first meets the overloaded root before the disavowal, and a grep for *convergence* in this document still returns a hit that means "approval". **Fix:** call it *"§11.4's approval clause"* (or just *"§11.4's clause"*, which AT-CLR-02's new parenthetical already does). Naturally folded into F-09's edit, since both are in the same sentence pair. | AT-CLR-04 parenthetical; §11.4 wording note |
| F-11 | Low | Local | **The presence probe's false-negative is excluded from scope in §7.2's prose but is not indexed in §1.1's F-N table, which is this document's single index of what it does not specify.** §7.2 states the exclusion and names the owner (TSPEC, **F-N-4**). But **F-N-4**'s row text is *"where in the pipeline each rule runs, which values are threaded through which seam, how test code reaches the budget declaration, the site enumeration"* — probe selection under a stated failure-mode constraint is none of those, and **F-N-1**'s row (the *region validates* predicate, torn regions, S-16 repair, refusal strings) does not cover it either, so the §7.2 text cites it only as an analogue. Consequence is narrow but real: a TSPEC author who reads §1.1 as the scope boundary — which §1.1 invites, being a table with an Owner column — inherits an obligation (*choose a probe whose failure mode is unevaluable rather than absent*) that the index does not carry, and §13.2's obligation disposition does not carry it either. **Fix:** extend **F-N-4**'s row with *"and the choice of presence probe, whose false-negative is out of scope here (§7.2)"* — one cell, no new id, no renumbering. | §1.1 (F-N-4, F-N-1); §7.2 presence-probe paragraph; §13.2 |

## Questions

## Positive Observations

## Recommendation

## Verdict
