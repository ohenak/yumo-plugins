# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-workflow-distribution/PROPERTIES-pdlc-workflow-distribution.md` (v2.1)
**Date:** 2026-07-28
**Iteration:** 3
**Scope:** narrow verification — disposition of `CROSS-REVIEW-product-manager-PROPERTIES-v2.md`'s
findings only (1H/0M/2L). No re-review of the document at large; no new fronts opened outside the
v2.1 diff (`535671c..fe22176`).

## Verification of v2 findings

| v2 ID | Sev | Claimed disposition (§15.4.1, PM F-01/F-02/F-03) | Verified in body | Verdict |
|---|---|---|---|---|
| F-01 | High | PROP-MTM-03's plain-sync conjunct corrected from exit 1 to exit 2 per AC-3.3's precedence; §13.1's AC-3.2 row corrected identically; note added that exit 1 on a sync run is reachable only when §5.5's post-copy verification is absent or defeated | §7 PROP-MTM-03 (line ~1019): "the run's exit is **2** per AC-3.3's precedence (any row `local-edit` or `unverified` outranks any row `stale` or `missing`; TSPEC AT-8a and AT-10 are both worked at exit 2)", followed by "Exit **1** on a sync run is reachable only when §5.5's post-copy verification is absent or defeated (FSPEC §5.8, O-14) — this property's fixtures never construct that case, so exit 1 must not appear here (PM F-01)." §13.1's AC-3.2 row: "the plain-sync conjuncts (byte-unchanged rows, exact state string in the report, exit 2 per AC-3.3's precedence)". `grep -n "exit.*1"` over the whole document turns up no surviving exit-1 claim for a skipped local-edit/unverified row — every other exit-1 hit is either the historical narrative of what was wrong (v2.1 preamble, §15.4.1's PM F-01 ledger row), an unrelated `pdlc_backup_format`/`pdlc_backup_parse` exit code, or PROP-MTM-01's *rejected reading* ("under the rejected reading a fully successful sync exits **1**", §7, unrelated property) | **Resolved** |
| F-02 | Low | §13.1's AC-2.4 row corrected to say PROP-BSL-06 covers "three representative `E1 = holds` vectors", not "every" | §13.1: "The exit-0 half is asserted by **PROP-BSL-06** on three representative `E1 = holds` vectors (§5.2's stated domain: 10 vectors on `--check`, of which 3 are re-run on sync and the hook for the exit-code conjunct — not every one)" — matches PROP-BSL-06's actual 3-vector hook/sync domain exactly | **Resolved** |
| F-03 | Low | §2.5's shrink ladder step 1 corrected from "nine-row" to "eight-row" | §2.5 step 1: "A packed **eight-row** run that fails is almost always failing on one row" — the stale "nine" is gone, and this now agrees with §1.4/§3's "eight packable leaves" already in place since v2.0 | **Resolved** |

## Diff-scope check

`git diff 535671c..fe22176 -- docs/pdlc-workflow-distribution/PROPERTIES-pdlc-workflow-distribution.md`
touches: the version/preamble block (2.0 → 2.1, new disposition summary); §1.4's §8/§10 row
corrections (47→48, 27→32) and the ceiling recomputation (rows sum to 181); §2.1(2)'s
co-holdable-vs-observable split criterion and its table; §2.3's L7 ancestor path; §2.5's
eight-row correction; PROP-CLS-02(a)'s heading/table and the third-row reclassification;
P-R-10's residual (two → three adjacencies, PROP-CLS-07 scoped as a different compensating
control); PROP-CLS-07's present-without-this-id sub-recipe; PROP-MTM-03's exit 1→2 fix;
PROP-MTM-04's heading and conjunct 2 (biconditional retracted); PROP-MTM-07's domain scoping;
§8.0's idempotent-source guard; PROP-SEAM-03's malformed-selector scoping; §13.1's AC-2.4 and
AC-3.2 row corrections plus four new rows (AC-1.1a, AC-6.2a, NFR-4, NFR-5); §15's SE F-05 ledger
correction; and the new §15.4 ledger section itself. Every hunk maps one-to-one to one of the
11 round-2 dispositions (PM F-01–F-03, SE F-01–F-08) named in §15.4, or to the version-bump/ledger
bookkeeping that records them. Nothing else changed — REQ, FSPEC, TSPEC are untouched and the
document states as much explicitly. No new front is opened by this diff.

## Findings

None.

## Questions

None.

## Positive Observations

- The exit-code fix is not a bare swap: the site now carries the precedence arithmetic
  (`local-edit`/`unverified` outranks `stale`/`missing`) and the boundary condition under which
  exit 1 *would* be legitimate on a sync run, so a future reader cannot reintroduce the v2.0 defect
  by "simplifying" the note away.
- The AC-2.4 domain fix and the eight-row correction are both one-line precision fixes exactly as
  scoped in v2 — no scope creep into surrounding prose.
- §15.4's ledger disposes PM and SE findings by reviewer-qualified id in one place, keeping the
  verification mechanical: every id named in v2 has a corresponding row naming the section changed.

## Recommendation

**Approved**

All three v2 findings (1H/2L) are verified resolved at the sites the review named, and the v2.1
diff contains nothing beyond those 11 round-2 dispositions plus version/ledger bookkeeping.

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
