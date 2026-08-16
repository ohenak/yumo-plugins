# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md
**Date:** 2026-08-16
**Iteration:** 8
**Scope:** Delta confirmation of the v0.12 erratum round (commit `20c87cd3`) — O-B's fixed check
count. Previously approved bytes re-checked only where the edit touches them, plus a citation-
fidelity pass over the upstream O-B now leans on (M-ENG-10, FSPEC §5.1, HEAD workflow files).

## Routed items

| Item | Landed? | Evidence |
|---|---|---|
| O-B still states "The PR gate is **five** required checks" (`REQ:80`), which the FSPEC §5.1 six-row table now contradicts; gloss needs trigger-derived membership | **Yes** | O-B (`REQ:86`) now reads "membership is **trigger-derived, not a fixed count**… no number stated here is authoritative", keeps the five-check figure only as a dated 2026-08-13 observation, and names FSPEC §5.1 as the authority on membership (T-7). Grounding cell extended to `M-ENG-10; FSPEC §5.1`. Changelog row 0.12 records the edit and its scope ("No other change"), which the diff confirms: 8 insertions, 2 deletions, changelog + O-B only. |

## Confirmation checks

1. **The dated observation is true as dated.** `pr-tests.yml` declares exactly five job-level
   `name:` keys (`:28`, `:84`, `:118`, `:144`, `:202`) on `os: [ubuntu-latest]` × node `'20'`, and
   `fixture-machine.yml` was added later by this feature's own T50 (`2283ec9e`). O-B's
   "at the 2026-08-13 measurement that was one file, `pr-tests.yml`" is therefore accurate, not a
   softened restatement of a stale claim.
2. **Citation fidelity — M-ENG-10.** `docs/_constraints/pdlc-engine-baseline.md:189` still records
   five checks in two alphabets, measured 2026-08-13 at `89babe8e`. O-B cites it for exactly that:
   the *names*, in both alphabets, as a point-in-time measurement — and now explicitly withholds
   membership authority from it. The citation says what O-B says it says.
3. **Citation fidelity — FSPEC §5.1.** §5.1 carries six rows over two files, with BR-7.1 deriving
   the file scope from the top-level `on:` block rather than listing it. O-B's "trigger-derived…
   whatever a PR-triggered workflow file renders" is a faithful compression of BR-7.1, and
   "including by this feature's own work" matches §5.1's row 6 note (PLAN T50, CODE_REVIEW v1 §3-1).
   `publish.yml` remains outside the set by trigger (`on: push: tags`), consistent with BR-7.5.
4. **No approved oracle was weakened.** The testable surface is AC-3.4 and T-7, both untouched by
   this edit and both already stated as two set-equalities against the FSPEC-owned expected set.
   O-B was never the carrier of an assertion; removing a count from it removes a false anchor and
   creates no new one. Nothing downstream (`grep O-B`) resolves through the deleted number.
5. **O-A not re-opened.** O-A still reads "`.github/workflows/` contains exactly one file", which is
   false at today's HEAD but true at the §1.1 heading's stated measurement point
   ("What is true at HEAD (re-measured 2026-08-13 at `89babe8e`)"). The table is dated as a whole,
   so O-A is a correct dated observation, not an inherited defect. No finding.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | None. | — |

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The fix is structural rather than arithmetic: replacing a count with a trigger-derived rule means
  the next PR-gating workflow file cannot silently falsify this row, which is the same property
  BR-7.1 gives the oracle. A "six" here would have needed the same erratum again at row seven.
- Keeping the five-check figure as an explicitly dated observation preserves the traceability of
  M-ENG-10's seed without letting it read as a live contract — the distinction TE round-4 F-03 and
  SE round-4 F-24 both pushed for.
- "no number stated here is authoritative" is the sentence that makes this row un-stale-able; it
  states the absence of authority positively rather than leaving it inferred.

## Recommendation

**Approved** — the delta resolves the routed item and breaks nothing previously approved.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}
