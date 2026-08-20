# Cross-Review: test-engineer — REQ (delta confirmation)

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md
**Date:** 2026-08-19
**Iteration:** 10
**Round type:** delta confirmation under decision freeze — delta present (`a2353445`, erratum v0.9)
**Scope:** the v0.9 diff (`386e4f0c..a2353445`, +14/-8, four hunks) and the three findings v9 left open.

## Problem / Context

Round 9 was a no-delta round: the erratum dispatch had not landed, so its three findings
(F-01 High, F-02 Medium, F-03 Low) stood against unedited bytes. Round 10 has a real delta.
`a2353445` ("REQ erratum v0.9 — v9 findings: unlistable divergence, AC-3.1 closure scope")
touches exactly four passages: the changelog row, §1.2 claim 2, AC-3.1's closure sentence with
an adjacent AC-3.2 clause, and AC-5.1b's sibling-reader attribution. That is one passage per
routed item plus the version bump, with no collateral edits elsewhere in the 493-line document.

All three routed items landed, and all three landed *correctly against HEAD source* — I
re-derived each code claim from the working tree rather than accepting the erratum's own
account of it. F-01, which had survived three rounds, is now stated in terms that match
`consolidate-learnings.js` line for line and, more importantly, names the divergence the
previous phrasing concealed. No High finding remains open.

Under the decision freeze, two observations about the delta are recorded as Low findings and
one as a `DEFERRED:` line; none meets the blocking bar, since none is a defect the delta
introduced and none contradicts the repository at HEAD.

## Goals

- Confirm the v0.9 delta resolves v9's F-01, F-02 and F-03 without breaking approved sections.
- Re-verify every code-level premise the delta touches directly against HEAD, not against the
  erratum's summary of HEAD.
- Scan only the four changed passages for new issues, and check the delta against the sections
  that cite them (§1.3, C-3, AC-3.3) for contradictions the edit could have opened.

## Non-Goals

- Re-litigating unchanged sections already approved in earlier rounds.
- Opening any new decision. The round is frozen; improvements I would have argued for in an
  open round are recorded as `DEFERRED:` lines, not findings.
- TSPEC-altitude mechanics. Findings below ask only whether the REQ's black-box observables are
  writable as tests today and whether its premises match shipped code.

## Constraints

- Decision freeze: a finding blocks only if (i) the delta broke something that worked before, or
  (ii) a load-bearing claim contradicts the repository at HEAD. Neither applies below.
- Delta-confirmation tagging: findings carry `{delta|inherited}` and `{local|nonlocal}`. Both
  Lows below are `delta, local` — introduced by this edit, inside the passages it changed.
- REQ altitude: findings ask only for black-box observables. Where the delta's wording affects
  what a completeness or oracle test can assert, that is in-lens; where it affects test-double
  or seam design, it is not, and I have not filed it.
- Rigour bar: any open High, old or new, means Needs revision. There is none.

## Delta disposition

| Check | Result |
|---|---|
| Last REQ commit | `a2353445` (erratum v0.9) — new since v9's `386e4f0c` |
| `git diff 386e4f0c a2353445 -- REQ` | 4 hunks, +14/-8 |
| Sections changed | changelog row; §1.2 claim 2; AC-3.1 closure sentence + AC-3.2 mirror clause; AC-5.1b attribution |
| Collateral edits outside routed passages | none |
| Working-tree modification to REQ | none (`git status --short` shows only `.claude/workflows/.pdlc-drift-state.json`) |
| Version / changelog | header now 0.9, changelog row names all three fixes |
| Size budget | 493 lines / 40,164 bytes — inside the 700-line, 60 KB REQ budget |

## Routed-item disposition

| # | Routed item (v9 id) | Landed? | Evidence at HEAD |
|---|---|---|---|
| 1 | F-01 High — §1.2 claim 2 asserted a fail-open-on-unlistable outcome the sibling does not ship, and sourced it to DEC-CONS-05 | **Yes, and correctly** | REQ:71-75 now reads "Its listing failure is **not** fail-open: `consolidate-learnings.js`'s `enumerateCorpus` is total — it returns an unlistable outcome rather than throwing — but the pass around it then marks itself `failed` and stops on that outcome. This feature deliberately diverges and fails **open** (`RSN-UNLISTABLE`, AC-3.2) … (G-4, C-7)". Both halves verified: `enumerateCorpus` returns `{unlistable: true, detail}` on a non-ok reply (`pdlc/workflows/consolidate-learnings.js:1348-1355`), and the pass sets `state.status = "failed"` and returns `finishPass` on that outcome (`:587-593`, comment "§10.3 row 1a — `failed` … Never `no-op`"). The DEC-CONS-05 citation is gone from the fail-open sentence; the surviving use at REQ:79-80 ("one predicate, two enumerations, and nothing in it claims readers agree on sets") matches the decision's own title (`docs/completed/pdlc-consolidation-agent/DECISIONS-pdlc-consolidation-agent.md:54,:422`) |
| 2 | F-02 Medium — AC-3.1's closure carve-out named only AC-3.3, leaving erratum v0.8's co-located AC-3.2 fields undecidable | **Yes** | AC-3.1 REQ:315-320 now scopes the closure explicitly — "that closure is over each **selected document's row**, not over the dispatch record as a whole. AC-3.2's per-dispatch not-selected rows and corpus-level outcomes, and AC-3.3's rule inputs, share the dispatch record but sit outside AC-3.1's set, each closed by its own completeness test at the loci AC-3.2 and AC-3.3 name." A test author can now mechanically place every field. Cross-checked against AC-3.3's own closure sentence (REQ:345, "set equality, one per locus, as AC-3.2's catalogues do") — consistent, no second reading left |
| 3 | F-03 Low — AC-5.1b's unattributed "the sibling reader" | **Yes** | AC-5.1b REQ:391-393 now names `orchestrate-dev.js`'s `parseImplementationConfig`. Verified: `parseImplementationConfig` (`pdlc/workflows/orchestrate-dev.js:191`) returns `IMPLEMENTATION_DEFAULTS` with `sectionMalformed: true` for a non-object section (`:209`), and the wave-mode caller emits the operator notice (`:14128-14134`) |

No routed item is partly landed, and no previously approved section changed.
