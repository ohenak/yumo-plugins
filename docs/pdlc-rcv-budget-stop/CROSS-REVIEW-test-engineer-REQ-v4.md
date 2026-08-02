# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v3.1)
**Date:** 2026-08-01
**Iteration:** 4 (delta re-review of v3.0 → v3.1; baseline `2f3cfd9`, the commit I reviewed at v3; document at `18faa48`, paired edits at `1858865` and `1ad20a5`)
**Scope:** resolution of my v3 findings, plus the changed sections only — §0 revision row and note, §4 *one refusal* note, AC-1.3, AC-1.4 clauses 1 and 3 and *the ordering and its report*, AC-1.5(2) clause 1, O-5, O-13, O-14, R-14, §10 — and the paired edits made in the same revision at `docs/_constraints/pdlc-rcv-catalogue.md` §3/§4, `docs/_constraints/pdlc-rcv-split.md` §5.4 and the new §5.8, and `docs/pdlc-rcv-reset-region/REQ-pdlc-rcv-reset-region.md` AC-7.6 and its *one exception* paragraph. Unchanged sections I approved in v1–v3 are not re-litigated.

## Prior findings — disposition

| v3 | Severity | Status | Evidence in v3.1 |
|----|----------|--------|------------------|
| F-01 | High | **Resolved, by the first option I named, and made count-decidable** | The discriminator is back as a token rather than a second string: catalogue §4's ❌ text is now `Refused — {which} unconfirmed at {path}`, `{which}` exactly one of `answering line` / `halt line` / `iterations section`, each attributed to the AC that attempts the write. The recovery is fixed at the level the finding was actually about: act 1 is no longer *"delete the trailing unconfirmed line"* — a predicate the file does not carry — but a **count test the operator takes from the region**: `answering line` → delete only if `A = H`; `halt line` → delete only if `H > A`; `iterations section` → **act 1 does not apply and must not be performed**, with the reason (clause 3 runs before clause 1, so no region line was attempted). I re-derived the counts on every path a halt is reachable on — creating halt (`H = 0, A = 0`, clause 1 lands ⇒ `H = 1 > A = 0`), re-halt after a granting clearance (`A = H` at entry, lands ⇒ `H > A`), zero-round halt on a spent marker (`A = H` at entry, same) — and in each the test is exactly *"the write landed"*, with the not-landed state failing it. A halt taken while `A < H` would break the `halt line` test; it is not reachable, because step G refuses an unresolved post-mortem and a force does not bypass it (AC-1.5(2) clause 1 says so explicitly). The oracle half landed too: split §5.4 leg (iii) is now **two fixtures discriminated by the ❌ text**, with the reason stated — *"a single leg asserting the generalised render passes either way and falsifies nothing"*. |
| F-02 | Medium | **Resolved, and more than the three words I asked for** | Catalogue §3 now reads *"row B covering **three** entry classes"*, the condition is widened to AC-1.5(4)'s step-4 path **or AC-1.4's halt path**, the *unconfirmable-append* variant names its three sources, and the B/C discriminator reads *"B's entry **records** no halt, C's records one — *records*, not *takes*, because AC-1.4's source **does** take a halt and is refused before recording it"*. `REQ-RCV-07` AC-7.6's closing paragraph carries the identical correction, so the three documents now state one sentence. §10 was updated to describe what actually moved (§3 as well as §4, the `{which}` token, *records* for *takes*). |
| F-03 | Low | **Resolved by the pinning option** | Split §5.4 leg (iii) fixture A now states the expected file carries **this entry's Iterations render**, *"pinned, not incidental"*, so the post-clause-3 state on an append failure is an asserted conjunct rather than a state the test happens to observe. The clause order is unchanged, which is the option I routed. |
| F-04 | Low | **Resolved** | Clause 3's confirmation is now written, not referred: *"read back as an **equality**, the located heading's text equalling §6's render (AC-1.3), never a write's return code"*. That is the predicate leg (iii) fixture B has to defeat, and it is now derivable from the AC. |
| Q-01 | — | **Answered in the catalogue, at the altitude I asked** | §4's *Residue disposition* gained both missing sources: a torn `HALT-REASON:` *"carries no origin, so nothing moves down; what it can do is still parse as S-15 and **over-count `H`**"*, routed to `REQ-RCV-07` AC-7.5 per NB-3; a torn Iterations rewrite is *"region-external and benign"*, with both tear shapes dispositioned (`## Iterations…` still matches the anchor; a tear destroying `## ` leaves an inert line the not-found path steps around). *"Named so a fixture author is not left guessing which"* — which was the ask. |
| Q-02 | — | **Not answered; not re-raised** | The creating halt still authors-and-confirms the post-mortem and then has clause 3 re-read and rewrite the same file. Two confirmed writes of one file on that path is implementable and harmless; it shows up only as a write count in leg (i)'s creating-halt fixture, and I am content to leave it to FSPEC. |

## Findings

_TBD_

## Questions

_TBD_

## Positive Observations

_TBD_

## Recommendation

_TBD_

## Verdict

_TBD_
