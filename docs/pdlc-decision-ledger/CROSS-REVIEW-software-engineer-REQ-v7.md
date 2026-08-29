# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.7)
**Date:** 2026-08-28
**Iteration:** 7
**Scope:** delta re-review `3feee9461..HEAD` (v1.6 → v1.7, commits `d90a3a297`, `84d1a2fe5`,
`479716725`, `6fd604320`) plus the cited substrate `docs/_constraints/pdlc-decision-corpus-baseline.md`
v1.1 (`3bdf541b6`). Only the changed sections were re-read for new issues: the header/disposition
note, §2 G-1's version citation, §5 REQ-DECLEDGER-01, §7 O-1 and the new §7 O-6. Unchanged
sections already approved were not re-litigated.

## Prior-Round Disposition

The round-6 High is resolved, and resolved in the place I asked for it — inside the constraints
file this REQ owns, with no recognition rule returning to §2. I replayed the new enumerations
against the working tree independently of the Baseline's text before comparing.

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | The Baseline now enumerates ids, not only extents. `M-1d` lists the 41 project-level ids grouped by file in `M-1b` path order; replayed at `8c673a09f` it matches file-for-file and, in `DECISIONS-review-severity-bars.md`, id-for-id in the interleaved order written (`DEC-SEV-01`, `DEC-SEV-02`, `DEC-SEV-03`, `DEC-ERR-01`, `DEC-BAR-01`, `DEC-BAR-02`, `DEC-ERR-02`, `DEC-ERR-03`, `DEC-DOC-01`, `DEC-FRZ-01`, `DEC-ERR-04`, `DEC-SEV-04`). `M-2e` lists the 100 feature-level ids per directory; replayed under the `M-1`-§1 reading — including the numbered-heading form `## 3. DEC-CONS-01:` that `docs/completed/pdlc-consolidation-agent/` and `docs/completed/pdlc-engine-distribution/` use exclusively — the per-directory counts match in full (22 / 11 / 10 / 10 / 10 / 8 / 8 / 7 / 6 / 4 / 4 / 0) and sum to 100. AC-01 (`REQ:188-190`) now names `M-1d` / `M-2e` as the expected value, so set equality has a referent an implementer can compute. |
| F-02 | Medium | **Resolved** | AC-01 no longer asserts over ids alone: `REQ:185-188` widens the check to the rendered line and names `M-3c`'s twice-opened block as the reason. A first-record-wins TSPEC choice that renders the question rather than the decision now fails the criterion. See F-01 below for the one loose end this leaves. |
| F-03 | Medium | **Resolved, and decided the safer way** | `REQ:190-192` picks the frozen fixture copy over the live repository, and says why in the terms the finding raised ("which grows — on this branch included"). This also closes Q-01: whether this feature authors its own `DECISIONS-pdlc-decision-ledger.md` no longer moves the shipped acceptance test. |
| F-04 | Low | **Partly resolved** | The Baseline's `Cited by` field gained `§5 REQ-DECLEDGER-04` and `§7 O-5`, and gained an explicit propagation rule. Two citation sites are still missing — see F-02 below. |

Both Baseline pin claims also hold at HEAD: `8c673a09f` is the post-mortem commit as v1.1 now
states, and `git diff --name-only 8c673a09f..HEAD` touches no `DECISIONS-*.md`, so the pinned
extent is still the live extent as of this review.
