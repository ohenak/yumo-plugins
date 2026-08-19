# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/FSPEC-pdlc-learnings-injection.md`
**Date:** 2026-08-19
**Iteration:** 6

Delta re-review against `CROSS-REVIEW-software-engineer-FSPEC-v5.md`, over
`git diff bc603aa0..HEAD` on the FSPEC: 23 insertions, 25 deletions, one commit (`67740c93`).
Frozen round: only defects the delta introduced, or load-bearing claims false at HEAD, can block.

## What the round changed

| Site | Change | Assessment |
|---|---|---|
| Header (FSPEC:11,18) | Upstream pinned to REQ **v0.6**; FSPEC version 0.5; cross-review list extended to v5 | Correct — REQ header at HEAD reads v0.6 (`REQ-…md:18`) |
| BR-2 (FSPEC:270-272) | ERRATUM sentence struck; direct `docs/discarded/LEARNINGS-x.md` now stated as corpus member "which is what REQ AC-2.6 states" | Correct — AC-2.6 says exactly that (`REQ-…md:300-303`); and the shipped globs confirm the mechanics: `:(glob)docs/*/LEARNINGS-*.md` matches the direct path, not the nested one (`pdlc/workflows/consolidate-learnings.js:1344-1345`) |
| BR-3 (FSPEC:296) | ERRATUM struck; now "REQ AC-3.2 carries the same catalogue: `RSN-NO-MATERIAL` is a member and truncation is not" | Correct — AC-3.2 lists `RSN-NO-MATERIAL` and says truncation is **not** a member (`REQ-…md:315-321`) |
| BR-4 (FSPEC:346-350) | "supersedes"/ERRATUM prose replaced with "Directory-rename rank-invariance is not claimed … pure function of (key value, path) … which REQ AC-2.2 states in the same terms" | Correct — AC-2.2 states the pure-function property and disclaims rename invariance (`REQ-…md:277-285`) |
| BR-5 (FSPEC:366-368) | ERRATUM struck; now "REQ AC-2.1 states the same bound and disclaims count equality … the fixture that makes the count cut binding is REQ O-8's, carried at F-O-7" | Correct and non-vacuous — AC-2.1 ends "equality above it is **not** claimed" (`REQ-…md:267-271`), O-8 exists (`REQ-…md:455-457`), and F-O-7 now exists (FSPEC:918) |
| BR-14 (FSPEC:602-603) | ERRATUM struck; now "REQ AC-5.1b reads a misspelt section name as absent on the same terms" | Correct — AC-5.1b's last sentence says precisely that (`REQ-…md:368-371`) |
| BR-9 (FSPEC:513), E-07 (FSPEC:656), AT-15 (FSPEC:793-795) | `docs/discarded/` narrowed to nested `docs/discarded/{feature}/`; AT-15 fixture made explicitly nested, keeping its second clause for the direct path | Correct, and resolves prior DEFERRED item — the only exception to "no corpus document is silently absent" is now the class the globs genuinely miss |
| AT-20 (FSPEC:818-819) | Disjointness widened from two catalogues to "across all three of BR-9's catalogues" | Correct; disjointness is stated alongside the three positive set-equality oracles (AT-19, AT-20, and BR-14's), so it is not absence-only |
| F-O-7 (FSPEC:918) | New TSPEC obligation: named non-default-threshold fixture making the count cut binding | Resolves prior F-02 exactly; wording restates O-8 unchanged |

No `ERRATUM:` line remains anywhere in the FSPEC (`grep -n ERRATUM` → no match). No rule, table, edge or AT semantics changed beyond the two corrections above.

## Prior findings disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 (five sentences quoting REQ v0.4; four live `ERRATUM: REQ`) | High | **Resolved** | All five sites rewritten to agree with REQ v0.6; all four ERRATUM routes retracted; each rewritten sentence checked against the REQ text at HEAD (rows above) |
| F-02 (REQ O-8 has no FSPEC obligation counterpart) | Medium | **Resolved** | F-O-7 added (FSPEC:918) |
| v5 DEFERRED (E-07 / BR-9 `docs/discarded/` unqualified) | — | **Resolved** | Narrowed to `docs/discarded/{feature}/` at all three sites |
| v5 DEFERRED (O-4 abbreviated section names) | — | Open, non-gating | O-4's discharge line still abbreviates BR-6's five titles |
| v5 DEFERRED (BR-5's 41,180 vs re-measured 41,175) | — | Open, non-gating | FSPEC:363 still reads 41,180 |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| — | — | — | No High, Medium or Low findings. The delta is delete-and-realign only; every claim it introduces was diffed against REQ v0.6 and, where it asserts repository behaviour, against source at HEAD. | — |

DEFERRED: O-4's discharge line abbreviates two of BR-6's five section titles (`Rejected Proposals`, `Open Items`); BR-6's full titles are the measured basis (v4 F-01, v5 DEFERRED).
DEFERRED: BR-5 states max 41,180 injectable bytes; re-measurement at HEAD gave 41,175 — a byte-accounting difference in the measurement recipe, not a rule defect (v4 F-04, v5 DEFERRED).

## Questions

| ID | Question |
|----|---------|
| — | None. |

## Positive Observations

- The retraction was done at the level the disagreement actually sat: sentences describing a conflict that no longer exists were deleted, and no rule, catalogue, edge row or AT was disturbed. Four rounds of argued positions (AC-2.1's disclaimed equality, AC-2.2's pure-function ordering, AC-3.2's third catalogue member, AC-2.6's direct-path membership) now read identically in REQ and FSPEC.
- BR-5's replacement sentence does more than retract: it names where the missing coverage lands (F-O-7), so the count bound's untestedness under default thresholds is now an obligation TSPEC inherits rather than a silence.
- The `docs/discarded/{feature}/` narrowing is mechanically right, not merely more cautious: the shipped pass-side globs (`consolidate-learnings.js:1344-1345`) match the direct path and miss the nested one, which is exactly the split BR-2, E-07/E-35 and AT-15 now encode. AT-15 keeps both fixtures, so the boundary is asserted from both sides.

## Recommendation

**Approved**

Both v5 findings are resolved, one deferred item was closed as a bonus, and the delta introduces no defect and no claim contradicted by the repository at HEAD. The two remaining DEFERRED items are cosmetic/measurement-recipe details that block neither TSPEC authoring nor implementation.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:d3d26d542296ce1234edae4377477fbbd8fc3935598beff1804ac590b1843859
APPROVAL-HASH-NORMALIZED: sha256:d3d26d542296ce1234edae4377477fbbd8fc3935598beff1804ac590b1843859
REVIEWED-COMMIT: 67740c936bf8307a943eaafa0d3b1fb6e4761b6c
UPSTREAM-STATE: REQ sha256:c13aab67f31e8c42df9b9809d2c3f571148be02407a8658a915ab375a693dfae
