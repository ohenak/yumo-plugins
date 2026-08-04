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

| ID | Question |
|----|---------|
| Q-01 | §8.2 now says the un-skipper for `A-23 — A3/A4 gate exclusivity` is "A3's `SeamOps`", while §3's A-23 row (`PLAN:274`) lands **both** A3's `SeamOps` and A4's `verifyGate` in that one task. Since one task lands both symbols the block assignment is unambiguous either way, so this is bookkeeping rather than a defect — but if a later revision splits A-23, the un-skipper rule (§3: "the un-skipper is the task landing the *last* symbol the block's cases exercise") would resolve to A4's `verifyGate`, not A3's `SeamOps`. Worth stating the rule's answer rather than a symbol name, so a future split cannot silently move the un-skip point. |
| Q-02 | Not a PLAN matter, flagged so it is not carried into harvest as a live disagreement: `PROPERTIES:559-561` still reads "The A1 row of PROP-GATE-01…05 is the one place the upstream documents disagree on what is being asserted — see §13 item 1", two lines above `PROPERTIES:563` which now states the settled A1-and-A3 form. DEC-ADV-11 closed that disagreement. Relatedly, `PROPERTIES:565-568` cites TSPEC §5.5's A1/A3 gate rows as `TSPEC:638` / `TSPEC:640`; at HEAD §5.5 begins at `TSPEC:648` and the A3 row is `TSPEC:657`. Both are PROPERTIES-side bookkeeping, and PROPERTIES is in its own loop. |

## Positive Observations

- **The A3 fix went upstream first, which is what v6 F-02 asked for and the harder path to take.**
  The erratum could have been closed by editing this PLAN to agree with TSPEC. Instead FSPEC §5.4's
  gate table — the approved product contract AC-4.5 quantifies over — was itself changed to "A3:
  **none**", with `DEC-ADV-11` recording *why* and the FSPEC row citing the decision inline. The
  product contract and the engineering contract now say the same thing for the same stated reason,
  rather than the plan quietly conforming to code-side reasoning.
- **The registry gained a `gate` column, and that closes v6 Q-02 better than the question asked.**
  §8.2 now specifies that the generated case branches on the registry's own `gate` column
  (`gate: null` for A1 and A3), "never on inspecting the shipped `SeamOps` at test time, so a seam
  that silently *lost* its gate cannot drift into the gateless branch and pass". Branching on the
  code under test would have made the oracle derive its expectation from the implementation; this
  keeps the expected value a literal transcription of the FSPEC row. That is the difference between
  a mutation control and a mirror.
- **Set-equality survived the generalisation.** Adding a second gateless seam is exactly the edit
  that tempts an author to special-case two rows out of the enumeration. Instead both stay inside
  the one iterated registry, and §8.2 states the closure in both directions — a deleted case means a
  deleted registry row (caught by PROP-GATE-06's set-equality against `ADVISORY_SEAMS`), and a sixth
  `ADVISORY_SEAMS` member with no row fails the same case. No enumerated contract was weakened to
  containment.
- **v6 Q-01 was answered, not deflected.** §8.2 now records why A1's and A3's identical case bodies
  live in different blocks (§3's un-skipper rule follows the last symbol a block's cases exercise),
  pre-empting a future reader deleting one as a duplicate.
- **Scope discipline held, again.** The whole delta is prose inside one §8.2 cell plus two changelog
  rows and the version stamp. 36 task rows and 36 ownership rows are still present and paired
  (72 `| A-NN` rows in the document), no dependency edge, batch label, phase boundary, requirement
  or acceptance criterion moved, and §10's 1.7 and 1.8 rows each state that explicitly rather than
  leaving the reader to diff for it.

## Recommendation

**Needs revision** — one Medium (F-01), and the fix is a single cell.

The delta breaks nothing. No task, dependency edge, ownership row, batch label, phase boundary,
requirement or acceptance criterion changed; the task↔manifest bijection still holds at 36/36; every
citation the two commits introduced verifies against the file and line it names. v6 F-01 is fully
resolved, and v6 F-02's upstream half is resolved better than requested — via FSPEC and DEC-ADV-11
rather than by conforming the PLAN to TSPEC.

What blocks approval is the half of v6 F-02 that was named explicitly and only half-applied. That
finding asked for **§3's A-07 row *and* §8.2**; only §8.2 was edited. `PLAN:258` still asserts that
every per-seam gate case "need[s] that seam's `verifyGate` to exist" and still names A1 as the sole
gateless exception, which after DEC-ADV-11 is a false statement about A3 and directly contradicts
`PLAN:869`. This is not duplicated prose drifting harmlessly: §3's task table is what the RED task
A-07 is dispatched with, and `PROPERTIES:570-572` states that authoring A3's case in the
gate-stubbing form "would fail against a correct build, in the RED batch (A-07) that authors it, and
not be diagnosed until A-23" — a wasted red batch and a misdiagnosed failure ten batches later.
Severity is Medium rather than Low precisely because upstream is now settled: at v6 the ambiguity
was genuine and unresolvable here, so it was correctly Low and routed as an erratum; today the
answer exists in three approved documents and this one row still contradicts it.

Exactly what must change to reach Approved:

1. **§3's A-07 row (`PLAN:258`), clause (b) only.** Replace "each need that seam's `verifyGate` to
   exist" with a formulation that covers both representations, and extend the A1-only parenthetical
   to **A1 and A3** — asserting `verifyGate === null`, `resolved` unreachable on every path,
   termination in `escalated`/`no-action` with the seam's own O-1 triple, and that *installing*
   `async () => ({ passed: true })` fails the case. Cite FSPEC §5.4, `TSPEC:657` and DEC-ADV-11, and
   keep the block assignment (A3+A4 ⇒ `A-23`) exactly as it stands.
2. Nothing else. Q-01 and Q-02 are informational; neither needs a round.

No erratum is emitted this round: the upstream divergence this reviewer routed at v6 is closed in
FSPEC, TSPEC and DECISIONS, and the residue is local to this document.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 0}
