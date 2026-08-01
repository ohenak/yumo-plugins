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

F-01 … F-05 are round-2's F-01 … F-05, carried forward **unchanged in text, severity and required
change**. I have deliberately not rewritten them: re-phrasing an open finding across rounds makes the
trajectory unreadable and invites the author to answer the phrasing rather than the defect. Read them
at `docs/pdlc-review-convergence/CROSS-REVIEW-software-engineer-REQ-v2.md` — the section headings there
are the authoritative statements, and the *Required change* paragraph of each is still exactly what
would close it.

F-08 is new, and is not about the document's content.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `DOC-BYTES:` cannot be written by the writer AC-4.1 names: `appendApprovalAnchors` runs only on the approving terminal round (`pdlc/workflows/orchestrate-dev.js:1844-1845`), so on every failed round — the only rounds AC-4 measures — growth is `no-anchor` and AC-4.5 escalates to the full panel, making §2's target regime unreachable by construction. The ordering is separately circular: the anchor is asked for when round N *opens*, before round N's files exist. **Carried from v2 F-01, unaddressed.** | AC-4.1, S-2, §6 `DOC-BYTES:` row, AC-4.2, AC-4.5, §2 |
| F-02 | High | Local | The *crashed* predicate mis-classifies every **failed** verifier round: `REVIEW-MODE: verification` is written only on an approving round (AC-3.5's Given), so a failed verifier round is "one file with no marker" = *crashed*, and AC-2.1 only ever compares failed rounds. AC-2 therefore cannot fire in the `dual, verifier, verifier` regime AC-2.6 row 2 says it fires in. **Carried from v2 F-02, unaddressed.** | §5 *crashed* / *panel shape*, AC-2.4, AC-2.6, AC-3.5(a)(e) |
| F-03 | High | Local | AC-3.2(2)'s "not counted" rule has no reader. §5 defines the blocking count as the JSON trailer read by `extractFileVerdict` → `parseVerdict`; nothing can subtract a findings-table row from a single integer. The document still reads three ways and the halt decision turns on it. **Carried from v2 F-03, unaddressed.** | AC-3.2(2), S-9, §5 *blocking count*, AC-2.1 |
| F-04 | Medium | Local | AC-3.4 fixes *that* the count trailer is in the file but not *where*; `parseVerdict` requires it to be the first non-empty line after `VERDICT:` (`pdlc/workflows/orchestrate-dev.js:440-451`), and the anchor block appended after it makes a trailer-less file parse *malformed*, never *unavailable* — inverting AC-2.7's operator-facing distinction. **Carried from v2 F-04, unaddressed.** | AC-3.4, AC-2.7, AC-2.3, S-5 |
| F-05 | Medium | Local | AC-1.5(3)'s operator reset has no durable observable: nothing on the branch records which rounds preceded the `RESOLVED: yes` marker, and §5's own bar says an AC stated over non-durable state is a defect in the document. **Carried from v2 F-05, unaddressed.** | AC-1.5(3), §5 durability table, AC-1.1 |
| F-06 | Low | Local | §4.7 still pins both "unmeasured at" claims to `d11dad5`, which the header declares unreachable from `main`. **Carried from v2 F-06, unaddressed.** | §4.7 |
| F-07 | Low | Local | §3 calls `7bc559a` a "merge commit"; it is single-parent. Wording defect only. **Carried from v2 F-07, unaddressed.** | §3 BL-01, §3 closing paragraph |
| F-08 | Low | Process | A review round was dispatched against a document that had not been revised since the previous round. The optimizer step between iterations 2 and 3 produced no commit — `git diff` on the REQ across the two review rounds is empty and the version row still reads 1.1 — so round 3 consumed one of five rounds of the phase's budget and can only reproduce round 2's output. The loop has no guard that a re-review's target changed since the reviewer last approved-or-blocked it; **this is the exact class of waste this REQ's AC-1 and AC-2 exist to bound**, observed on the REQ that specifies them. Recorded as Low/Process because the fix is to the pipeline, not to this document; it does not affect the recommendation, which F-01 … F-05 already determine. | n/a — orchestration |

### F-08 (Low, Process) — a re-review round was dispatched with no intervening revision

Stated in full because it is new and because it is the only thing this round can contribute.

Evidence: the REQ's last commit is `2e1ccec`, the same commit that carries my v2 cross-review;
`git diff 2e1ccec -- docs/pdlc-review-convergence/REQ-pdlc-review-convergence.md` is empty; the tree is
clean; the version row reads 1.1 and §10.6 maps round-1 findings only.

Two things follow that are worth recording for harvest rather than for this document's author:

1. **The round is not free.** `MAX_REVIEW_ROUNDS = 5`. Round 3 of 5 has now been spent producing a
   verdict that was already on disk. If rounds 4 and 5 go the same way the phase halts with a
   POSTMORTEM whose recorded cause would be "non-convergence", when the actual cause is that the
   author step did not run.
2. **A cheap structural guard exists.** The review loop already derives its round window from the
   basenames on disk (`deriveRoundWindow`, `pdlc/workflows/orchestrate-dev.js:2151`) and already
   computes a content hash of the reviewed document for the tier-1 approval anchors
   (`appendApprovalAnchors`, `pdlc/workflows/orchestrate-dev.js:1934`). A re-review whose target's
   hash equals the hash recorded by the previous round is provably a no-op and could be short-circuited
   to the previous verdict, or reported as an author-step failure, without any new mechanism. This is
   adjacent to — but not the same as — AC-2's fixed-point stop, which measures *findings*, not
   *document bytes*: AC-4's `DOC-BYTES:` would give growth `0`, which AC-2 does not currently read.

I am **not** filing this as a blocking finding against the REQ. It contests neither the user need nor
an AC, and under the document's own stopping rule it is not a REQ revision. It belongs in the run
report and, at harvest, in process learnings.

## Questions

## Positive Observations

## Recommendation

## Verdict
