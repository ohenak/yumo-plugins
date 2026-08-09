# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.2, 2026-08-09)
**Date:** 2026-08-09
**Iteration:** 3
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Delta re-review against v2 (`CROSS-REVIEW-product-manager-PROPERTIES-v2.md`) over `git diff 6d8ff5ba..HEAD` on the document (97 insertions, 41 deletions). Grounded against PLAN §4/§5 at HEAD.

## Prior findings — disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-06 T25 named as a green un-skipper in a file it does not own | Medium | **Resolved** | T25 is gone from all three trailers: PROP-COR-10 and PROP-COR-11 now read `T20 → T31` (`:381`, `:388`), PROP-CFG-03 reads `consolidationReport.test.js` (T24 → T29/T31) and `consolidationPass.test.js` (T20 → T31) (`:488-489`). §12.2's pass-file row reads Green `T28, T31` (`:1682`) and §12.3's reads `T20 → T28/T31` (`:1714`). Checked against PLAN §5: T25's manifest row (`PLAN:328`) gives it `consolidationPredicate.test.js`, `consolidationHookParity.test.js`, `consolidationProperties.test.js` and no pass-level file — so no trailer now sends a T25 implementer outside its pathspec. |
| F-07 §12.1's AC-1.1 row claimed the whole `PROP-COR-01…13` range | Low | **Resolved** | The row now reads `PROP-COR-01…11` and says in terms that 12/13 are **not** trigger coverage but the L4 differential's fixture and validity pin (`:1607`). Verified against the trailers: both cite `(no FSPEC AT), TSPEC §7.1 pin (b)`, exactly as the row now claims. |
| Q-01 AC-3.4 erratum landing vs PROP-PR-09 | — | **Answered in the document** | §13.1's row now states that an "in each carrier that exists" reconciliation leaves PROP-PR-09 unchanged, that no second arm is owed because PROP-RTE-06(a) already carries the "no proposal file on a fully-`promoted` pass" half, and names the one reading that *would* reopen it (`:1782`). That is the sentence I asked for, and it is the right one. |
| Q-02 retired ids vs PROP-TRC-01's sweep | — | **Answered in the document** | §5.1 now states that PROP-TRC-01's parser ranges over the `AT-…` token grammar in the FSPEC register and TSPEC §12.3, never over `PROP-…` ids in this document, so no exclusion rule is owed (`:520-524`). The count claim is unchanged and the id set is byte-identical to v1.1's — I re-derived it mechanically: 118 distinct `PROP-*` ids at both `6d8ff5ba` and HEAD, none added, none removed, none renumbered, which matches the changelog's claim exactly. |

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-08 | Medium | Local | **PROP-PASS-11's new home is the one part of the AT-C re-home PLAN T20 does not license, and §12.2's stated derivation does not hold for it.** The re-home of PROP-PASS-01…05 is well-grounded: PLAN T20's `T31 — pass lifecycle` block declares `AT-C1, AT-C1b, AT-C2 … AT-C8` in `consolidationPass.test.js` (`PLAN:264`), and PLAN T23 is titled "lifecycle (L2), two cases, **no register id**" (`PLAN:267`) — the document's claim is true for every AT-C property. PROP-PASS-11 is different: it carries `(no FSPEC AT)` and cites AC-1.4, AC-5.3, AC-5.5 (`:1349-1350`), and PLAN T20's row closes its unregistered list explicitly — "the only remaining `(no FSPEC AT)` obligation in this row is (i)", where (i) is the unreadable-corpus-entry case (`PLAN:264`). So the property is now filed under a task whose PLAN text says, in terms, that it owes exactly one unregistered obligation and this is not it. It does not fit T23's PLAN text either (T23's two cases are the `await` discipline and release-across-terminal-statuses), which is why I am not asking for it to be moved back. The product consequence is the one that matters: **AC-1.4's positive obligations — a `no-op` pass still reports, still restates the AC-5.2 effectiveness table, and advances the AC-5.5 streaks by consumed-set emptiness rather than by the `no-op` label — are carried by no PLAN task row at all.** `no-op`/AC-1.4 appears nowhere in PLAN §4's task text (grep over `PLAN`: only `:47`, `:265`, `:267`, `:595`, none of them declaring these cases), so an implementer working from PLAN alone writes the AT-C and AT-M blocks and never writes this one. This is a PLAN defect, not a PROPERTIES one, and it is routed as an erratum rather than folded into the verdict. The PROPERTIES-side half is narrow: §12.2's derivation sentence ("Red owner and green owners are read from PLAN §4's task table", `:1653`) and the v1.2 changelog's "the file TSPEC §12.3 and PLAN T20 actually give it" (`:14-15`) are true of PROP-PASS-01…05 and are an over-claim for PROP-PASS-11. One clause naming it as a placement judgment pending PLAN's erratum would make the row honest without moving anything. | AC-1.4, AC-5.3, AC-5.5; PLAN §4 T20/T23 |
| F-09 | Low | Local | **§12.2 and §12.3 give different green lists for the same two tasks.** §12.2's `consolidationReport.test.js` row reads Green `T29, T31` (`:1686`) while §12.3's row reads `T24 → T26/T29/T31` (`:1718`); §12.2's `consolidationIdentity.test.js` row reads `T26, T31` (`:1677`) while §12.3's reads `T15 → T26/T28/T31` (`:1709`). Both are explicable under the newly-stated spanning convention — the extra greens come from spanning properties (PROP-MRG-03, PROP-ID-03) whose other file has those un-skippers — and the new §12.2 preamble already explains the *file*-axis rule ("a per-property green is a subset of its file's green list", `:1655-1659`). What it does not say is the converse for the task axis: that a §12.3 row's green list is the **union over the property's homes**, so it can exceed the same task's §12.2 file row. Since v1.2 claims both tables were re-derived from the corrected trailers, a reader checking the two against each other will read these as residue of the re-derivation. One sentence in §12.3's preamble closes it. | §12.2, §12.3 internal consistency |

## Questions

| ID | Question |
|----|---------|
| Q-03 | With PROP-PASS-01…05 and PROP-PASS-11 moved onto `consolidationPass.test.js`, T20's file now carries 13 properties against T23's 3. PLAN's batch-safety rule serialises writers of one physical file, and T20's file is already the widest RED task in batch 3. Is the concentration acceptable as-is, or is it worth a note in §12.2 that the file's size follows from TSPEC §12.3's register placement rather than from a sizing decision this document made? |

## Positive Observations

- **The re-home was justified from the PLAN text, not asserted.** The changelog names *why* the AT-C register belongs in `consolidationPass.test.js` — TSPEC §12.3 gives it, and PLAN T23 declares no register id — and both claims check out at HEAD (`PLAN:264`, `PLAN:267`). This is the version of the fix that survives a reader who does not trust it.
- **The single-file rule for register ids is now enforced rather than described.** PROP-TRG-03 and PROP-TRG-06 dropped their AT-C5/C6/C7 citations for the TSPEC §7.2 obligation and say why (`:534-537`, `:547-550`), so the L1 arms keep their invariant without claiming an id their file does not own. That is exactly the layered-coverage reading O-4 sanctions, and it leaves each register id claimed once.
- **Erratum 3's second half is the one Phase I would actually have tripped over.** The document worked out that a fixture named only in T04's task text and not in PLAN §5's manifest row would be authored and then dropped by the pathspec-scoped wave commit, leaving PROP-COR-12/13 red on correct code. I verified the premise: `PLAN:307` names only `consolidationHookParity.test.js`, and no §5 row names anything under `pdlc/workflows/__tests__/fixtures/`. Catching a commit-mechanics defect from a properties document is above the bar for this layer.
- **Q-01 and Q-02 were answered in the artifact, not in a reply.** Both answers landed as durable text in §13.1 and §5.1 where the next reader meets the question, which is what makes a review round compound rather than evaporate.
- **The invariant count held across a structural move.** 118 ids before and after, none renumbered, with the claim stated in the changelog and checkable in one command — the discipline that makes a re-home reviewable as a delta at all.
- **Still no scope creep.** Nothing in this revision asserts behaviour REQ does not ask for; the two genuinely unresolved product tensions (AC-3.4's second carrier, PLAN T04's fixture) stay routed upstream as errata rather than being settled by a test that quietly picks a reading.

## Recommendation

**Approved with minor changes**

Both prior findings are resolved, both questions are answered in the document, and nothing in the revision broke a previously-approved section — I re-derived §12.2's pass-file and lifecycle rows from the per-property trailers and they agree, the AT-C single-file claim holds, and the id set is unchanged. The two open items are non-gating:

1. **F-08** — add one clause marking PROP-PASS-11's placement as a judgment pending PLAN's erratum; the PLAN-side gap is routed as an erratum, not as a change owed here.
2. **F-09** — state the task-axis union rule in §12.3's preamble so the two tables' green lists read as consistent.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
