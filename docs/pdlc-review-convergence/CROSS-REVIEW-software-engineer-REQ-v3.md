# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md`
**Date:** 2026-07-31
**Iteration:** 3
**Scope:** REQ-pdlc-review-convergence v1.1, delta re-review against the v1.1 tree reviewed at iteration 2 — technical lens (feasibility, implementability, integration risk)

## Delta baseline

**The document under review is byte-identical to the one I reviewed at iteration 2.** This is the
finding that determines everything below, so it is stated first and with its evidence.

- The last commit touching `docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` is
  `2e1ccec` (*"docs(pdlc-review-convergence): recover Phase R artifacts mis-committed to main"*),
  which is the same commit that carries `CROSS-REVIEW-software-engineer-REQ-v2.md`.
- `git diff 2e1ccec -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` is **empty**, and
  the working tree is clean. There is no v1.2 anywhere on the branch.
- The document's own version row still reads **`| pdlc | draft | Claude + operator | 1.1 | 2026-07-31 |`**,
  its revision note is still headed *"Revision note (v1.1)"*, and §10.6 still maps round-**1** findings
  only. No round-2 disposition exists in the document.
- Spot-checked the three surfaces my round-2 Highs named, all unchanged: AC-4.1 still names
  `appendApprovalAnchors` as the `DOC-BYTES:` writer (also §5 S-2's Emitter column and §6's
  `DOC-BYTES:` row); §5's *crashed* definition still turns on the `REVIEW-MODE: verification` marker;
  AC-3.4 still says only *"inside that same section, after the `VERDICT:` line"* with no adjacency rule.

Consequently the delta protocol's step 3 — *scan only the changed sections* — has an empty set of
changed sections. There is nothing new to review, and **every finding from v2 is open verbatim**. I
have not re-derived them; v2's evidence stands unamended and is cited by reference rather than
restated at length.

I re-ran no verification pass this round: the citation pass and the `orchestrate-dev.js` write-path
pass in v2 were run against `main` at `9486c81`, which is unchanged, over a document that is unchanged.
Re-running them would produce the same result at the cost of a round.

## Round-2 disposition

All seven round-2 findings are **open, unchanged, and unaddressed** — not contested, not answered,
not attempted. Recorded per finding so the operator can see the state without opening v2.

| v2 finding | Sev | Disposition | Evidence that it is still open |
|---|---|---|---|
| F-01 — `DOC-BYTES:` cannot be written by `appendApprovalAnchors` (runs only on the approving round; also the ordering is circular) | High | **open** | AC-4.1 (`REQ:768`), §5 S-2 Emitter (`REQ:381`) and §6's `DOC-BYTES:` row (`REQ:1060`) all still name `appendApprovalAnchors` (M-4a). The function still has one call site, inside `if (gatePass)` (`pdlc/workflows/orchestrate-dev.js:1844-1845`). |
| F-02 — a failed verifier round reads as *crashed*, so AC-2 cannot fire in the target regime | High | **open** | §5's *crashed* definition and AC-2.4 still turn on `REVIEW-MODE: verification`; AC-3.5's Given is still *"round N ≥ 2 dispatched a single verifier **which approved**"* (`REQ:~684`). The `verifier` slug discriminator is still unused by the comparability test. |
| F-03 — AC-3.2(2)'s "not counted" rule has no reader | High | **open** | AC-3.2(2) unchanged; §5's *blocking count* is still defined as the trailer read by `extractFileVerdict` → `parseVerdict`. No S-10, no choice recorded in R-5. |
| F-04 — the in-file trailer's placement is unspecified, and the anchor block makes a trailer-less file *malformed* not *unavailable* | Medium | **open** | AC-3.4 still reads *"inside that same section, after the `VERDICT:` line"* with no adjacency clause (`REQ:653-668`); AC-2.7's *unavailable* case is unamended. |
| F-05 — AC-1.5(3)'s operator reset has no durable observable | Medium | **open** | §5's durability table still gives AC-1.5 one row (the cross-review basenames); no POSTMORTEM-window row was added. |
| F-06 — §4.7 pins two "unmeasured at" claims to `d11dad5`, declared unreachable by the header | Low | **open** | §4.7 unchanged. |
| F-07 — `7bc559a` is called a merge commit; it is single-parent | Low | **open** | §3 unchanged. |

The four mechanical fixes (MF-1 … MF-4) are likewise unapplied. They do not block and are not
re-filed as findings.

**Blocking-finding count: 5 (3 High, 2 Medium), identical to round 2.** The count is non-decreasing
across two consecutive rounds. Under the document's own binding stopping rule this is a fixed point —
see the Recommendation.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
