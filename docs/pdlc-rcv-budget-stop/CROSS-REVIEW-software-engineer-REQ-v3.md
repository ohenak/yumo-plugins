# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-rcv-budget-stop/REQ-pdlc-rcv-budget-stop.md` (v3.0, 403 lines / 60,753 bytes)
**Date:** 2026-08-01
**Iteration:** 3 (delta re-review of v3.0 against the v2.9 I reviewed at v2; base commit `524dd2f`)
**Scope:** Technical lens only — feasibility, implementability, integration risk, threshold declaration, existing-code claim verification. Not product strategy, not test-pyramid choices, not fixture construction.

## Disposition of v2's findings

Both blockers are closed, and both Lows and all three Questions were answered as well. I checked each
against the changed bytes and against the two paired documents, not against the commit messages.

| v2 | Severity | Status | Evidence in v3.0 |
|---|---|---|---|
| F-01 | High | **Closed** | The refusal now has a named, in-force operator surface. AC-1.4's new *ordering and its report* paragraph fixes it as **row B's *unconfirmable-append* variant**, `notice` **empty**, catalogue §4's two-act recovery, and states why it waits on nothing: the render is the **catalogue's**, not `REQ-RCV-07`'s to ship. The paired edit is real and in this revision, both ends: `docs/_constraints/pdlc-rcv-catalogue.md` §4's ❌ cell now reads **`Refused — region line unconfirmed at {path}`** with the generalisation dated and its two sources named, act 1 generalised to *the unconfirmed region line — the answering line, or the halt's `HALT-REASON:`*; and `REQ-RCV-07` AC-7.6's *Given* now names `REQ-RCV-01` AC-1.4 as a third **source** (explicitly not a third variant) with its ❌ cell updated to match. §4, NB-3, §5's row-B paragraph and §10 all carry the same statement, and §10's "v2.9 carries no change to that edge" is amended to "**v3.0 does change that edge, and carries the change here**". That was exactly option (i) of the two I offered, taken whole. |
| F-02 | Medium | **Closed** | Both named relocations happened: the three-line v2.9/v2.8/v2.6 revision narrative is one line, §4.1's harvest paragraph is a cross-reference to NB-5, and NB-6, O-10, O-13 and §8's four/three-leg paragraphs were compressed or relocated to split §5.4 on top. Headroom went from **1 byte to 687** (60,753 of 61,440). Not comfortable — see F-03 — but the constraint no longer determines how a finding may be closed, which is what the finding was about. |
| F-03 | Low | **Closed** | AC-1.5(2) now reads "the later of the two, **never below `W`**"; the three words that invited a clamp are gone, and split §5.4 leg 4's `W = 4` / highest 6 / start 7 control is no longer contradicted by the AC that governs it. |
| F-04 | Low | **Closed** | NB-6 now says "HEAD's prompt and **HEAD's section list** (M-7e)" instead of enumerating the sections itself, so the claim about shipped code is carried by the fact id rather than restated. |
| Q-01 | — | **Answered** | The clause order is now declared — **3 → 1 → 2** — and the answer is the one that preserves `A ≤ H`: the strip runs last, so no `RESOLVED:` marker is spent against a halt that left no line. Split §5.4 leg (iii) asserts it as a test leg. The half of Q-01 the new paragraph does **not** reach is F-01 below. |
| Q-02 | — | **Answered** | O-5 now explicitly receives the halt path's *present-in-the-region* confirmation and the clause order, so the seam is no longer implicit in `REQ-RCV-07` O-12's exclusion. |
| Q-03 | — | **Answered** | O-13(a) now names the feasibility inline — `stripModuleSyntax` removes the `export ` prefix from a module-scope `const` — so TSPEC does not re-derive it. |

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
