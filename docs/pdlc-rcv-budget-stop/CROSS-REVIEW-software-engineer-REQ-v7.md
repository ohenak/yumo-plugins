# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v2.1, 2026-08-01)
**Date:** 2026-08-01
**Iteration:** 7
**Scope:** every finding below carries its own Scope tag in the findings table.
**Protocol:** delta re-review. The baseline reviewed at v6 was the REQ as of the tree at `a0afcf6`;
this review covers `a0afcf6..HEAD` on that file — commits `eff9523`, `fd9c400`, `a112501`, `28ff461`,
`33b73d9`, `5122a5e`, `8a60091` (29 insertions, 14 deletions across §0 changelog, §3.1, §4, §7, O-10,
R-14). Sections unchanged since v6 were not re-litigated.

## 1. Disposition of the v6 findings

**All four v6 findings are textually closed, and the one that mattered — F-01 — was answered in the
right register: the document now argues about the stub's *shape* rather than its value, and says so
in X-06, R-14 and O-10 with one vocabulary.** That is the change I asked for. What I could not
confirm is that the shape it chose is safe; §3 F-01 below is about the chosen shape, not about the
refusal to state one.

| v6 id | Sev | Status | What was checked |
|---|---|---|---|
| **F-01** | **High** | ⚠️ addressed, new mechanism defect | X-06 now reads *"**Fail-closed here is a shape, not a constant.** A constant *invalid* is **not** the fail-closed reading … a constant would refuse every document-typed review phase on every feature and block the delivery of its own replacement"*, and prescribes an **injected, controllable seam** whose production default is *valid on the empty region, invalid on any non-empty one*. R-14 carries the same words (*"Mitigated by fixing the interim **shape**, not by sequencing"*), and O-10 gained both halves I asked for: each granting leg now *"drives the *validate* seam explicitly to **true** and never reads its production default"*, and a new interim-ship oracle asserts the default with no override. The constant is gone; the naming of the seam is exact. **But the replacement shape has its own blast radius, and O-10 now pins it as a required property** — see F-01 below. |
| **F-02** | Low | ✅ closed | §3.1 now reads *"queued at **`Order 18`** — `docs/_queue/QUEUE.md`'s stated net pickup order is **10 → 12 → 18**, so X-06's interim shape is live across a whole intervening feature and row 18's own Phase R"*, and R-14 repeats the exposure. I checked the queue: rows 10 / 12 / 18 are as cited and `QUEUE.md`'s own note says *"Net pickup order: **10 → 12 → 18 → 17 → 11**"*. Both sentences now match the fact. The sibling's copy of the claim was **not** corrected — F-03 below. |
| **F-03** | Low | ✅ closed, by rule rather than by rename | §7 now states *"`O-*`, `R-*` and `X-*` are **not** namespaced and do collide across the v2.0 split (`O-10`, `O-12`, `R-10` and `R-14` differ between this REQ and `REQ-RCV-07`), so **every cross-document citation of one must name the owning REQ**, as each here does."* That is cheaper than renaming and it states the hazard where the next reader meets it. I re-checked the citations added this round — O-10's *"that REQ's AC-7.1–AC-7.6 and **its** O-10"*, §10's *"`REQ-RCV-07` §6 / catalogue §4"* — and all are qualified. Accepting the rule as the fix. |
| **F-04** | Low | ✅ closed | X-06's *Direction* cell now reads *"**read from** `pdlc-rcv-reset-region`"*, matching X-05, and §3.1's opening is qualified to *"head of the family **at requirements altitude** — nothing it needs *as a requirement* is owed by a sibling"*, with the forward-edge distinction stated immediately after. Both were exactly the suggested wording. |

**Independent re-verification of the new cross-document claims** (a relocation or a delegation is only
as good as its citations):

- **§4's widened delegation rule checks out against the catalogue.** It claims catalogue **§3**'s
  *"AC-1.5(4)'s step-4 path"* and *"fixed by `pdlc-rcv-budget-stop` §6"*. Both strings are present in
  `docs/_constraints/pdlc-rcv-catalogue.md` §3 verbatim, in the row-B paragraph, and the substitution
  it prescribes (read them as AC-7.1 step 4 and `REQ-RCV-07` §6) is the only reading consistent with
  §6's *"this REQ now mints no operator string of its own"*. Widening the rule from one phrase to
  *every* reference is the correct generalisation — the four rows do word it differently.
- **The queue citation is exact**, as above.
- **The S-16 enum is genuinely closed at three members** — catalogue §2's S-16 row, *"`{reason}` ∈
  `{invalid-window-start, invalid-window-resumed, counts-mismatch}` — closed three-member enum"*, and
  *"a reason outside [it is a] defect, not a fallback"*. This is what F-02 below turns on.
- **The sibling was not updated in step.** `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md`
  X-07 and R-16 still prescribe the constant and the superseded sequencing claim — F-03 below.

## 2. Disposition of the v6 questions

| v6 id | Status | Note |
|---|---|---|
| **Q-01** (is the conjunct wired into the gate from row 10, or added by row 18?) | ✅ answered, unambiguously | X-06: *"The conjunct **is wired into the gate at this REQ's own ship** — only the **decision procedure** waits."* That is the first of the two branches I offered, stated in the cell I asked for it in. It also fixes what O-10 can assert, and O-10 was updated to match. The answer is clear; F-01 below is a consequence of it, not a complaint about it. |
| **Q-02** (must the two halves land in the same *release*, not merely the same queue sweep?) | ❌ not addressed | Nothing in v2.1 speaks to the distribution boundary. The interim default now has a stated shape, so the question is sharper rather than moot: a consumer who installs the plugin between row 10 and row 18 gets that default, and F-01 argues what it costs them. Re-asked below. |
| **Q-03** (carried, `REQ-RCV-07`'s: is `W` absent from every operator-visible surface on a refusing entry?) | — | Still that REQ's. Recorded only so the trail is unbroken for harvest. |


## 3. Findings

## 4. Questions

## 5. Positive Observations

## 6. Recommendation

## Verdict
