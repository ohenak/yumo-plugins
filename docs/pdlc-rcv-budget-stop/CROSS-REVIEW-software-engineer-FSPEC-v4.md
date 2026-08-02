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

## Questions

## Positive Observations

## Recommendation

## Verdict
