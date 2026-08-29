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

## Findings

No High findings. The blocking gap from round 6 is closed and nothing in the delta opened another.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The comparison basis is now wider than the expected value that backs it.** AC-01 asserts "equality of the rendered line set … the runs agree only where each line's id, statement and citation all agree" (`REQ:185-187`), but the expected value it then cites supplies ids only — `M-1d` and `M-2e` are id enumerations, and no `M-*` fact pins a statement or a citation string except `M-3c`, which pins the two openings of the single contested block verbatim. So for 62 of the 63 in-scope lines the criterion demands agreement on two fields whose expected text has no stated source. There is a second, smaller edge in the same sentence: G-1 permits an optional origin/evidence datum to follow on the line (`REQ:64-66`), so *line*-set equality and *three-field* equality are not the same test, and AC-01 asserts both spellings in one sentence. Neither needs new REQ machinery to fix — the frozen fixture copy is authored test material, so a one-clause statement that statement and citation are transcribed from the frozen fixture (never re-derived by the code under test) while membership is pinned by `M-1d`/`M-2e`, and that the optional datum is outside the compared fields, closes it without any predicate returning to §2. | §5 REQ-DECLEDGER-01 |
| F-02 | Medium | Local | **The `Cited by` propagation rule added in this round is already violated by this round's own edit.** Baseline v1.1 states the list "is the propagation path for a `Version` bump, so a new citation is added here in the same edit that mints it", and lists `§2 G-1, §4 C-5, §5 REQ-DECLEDGER-01, §5 REQ-DECLEDGER-04, §7 O-1, §7 O-5`. Grepping every `M-*` citation in the REQ at HEAD gives two further sites: **§7 O-6** (`REQ:361`, cites `M-4e`) — minted this round, in `479716725`, after the Baseline edit `3bdf541b6` — and **§7 A-1** (`REQ:370`, cites `M-6b`/`M-6c`), which predates it. The A-1 omission is the one that costs: A-1 is where the `maxEntries` default is justified, so a future re-measurement that bumps `M-6b` has no pointer to the clause that must move with it. Fix is two list entries in the Baseline, no REQ change. | Baseline *Cited by*; §7 O-6, §7 A-1 |
| F-03 | Low | Local | **Two small referential slips in the new AC-01 and O-1 text.** (a) "the runs agree only where each line's id, statement and citation all agree" (`REQ:186-187`) — "the runs" has no antecedent; the comparison is expected-versus-actual for one construction, not two runs of the driver, and the phrase reads as a determinism check, which is a different property. (b) `M-2e` is cited as "per feature directory" (`REQ:189`) but enumerates all twelve directories and 100 ids; the in-scope set per G-1 is the project set plus *the directory of the document under review*, so the criterion is asserting against a slice of `M-2e`, not `M-2e`. Both are one-word fixes and neither changes what an implementer would build. | §5 REQ-DECLEDGER-01 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01: is the intended oracle (i) membership pinned by `M-1d`/`M-2e` plus statement/citation transcribed literally from the frozen fixture, or (ii) a fully transcribed 63-line expected block in PROPERTIES? Both are sound; (i) is cheaper and keeps the REQ at altitude, but only (ii) is what "equality of the rendered line set" reads as today. |

## Positive Observations

- **The fix landed where the round-6 finding said it could, and it survives independent replay.**
  I re-derived `M-1d` and `M-2e` from the tree at `8c673a09f` before reading them, including the
  awkward parts: the interleaved five-namespace ordering inside `DECISIONS-review-severity-bars.md`,
  the two files whose records only ever appear as `## N. DEC-…` numbered headings, and the two
  directories that contribute zero. Every one matches. That is the difference between a measured
  fact and an argued predicate, and it is the whole point of the post-mortem's Recommendation 1.
- **F-03 was decided rather than deferred.** The frozen fixture copy is the answer that stops the
  shipped acceptance test from being hostage to unrelated future decisions — including the ones
  this branch may itself author — and O-6 carries the fixture obligation to te-author instead of
  leaving it implicit. Deciding it in one clause and routing the coverage cost is exactly the
  split that was missing in rounds 2–5.
- **O-1's new membership sentence selects between two measured numbers without minting a rule.**
  "Where `M-2c`'s two feature file-scope readings differ (14 ids against 22), the directory
  reading governs, matching the floor C-5 already took from `M-6b`" (`REQ:336-338`) is
  self-consistent with the shipped default: 41 + 22 = 63, and `maxEntries` 70 clears it by 7.
  The alternative reading would have silently made the declared default wrong. Naming the choice
  here closes the one place where TSPEC could have picked the other branch in good faith.

## Recommendation

**Approved with minor changes** — no High findings.

Round 6's High is closed by construction, not by rewording: the Baseline now carries the
enumeration AC-01 needs, and I could reproduce all of it. The two Medium findings are both
one-clause edits that do not reopen anything — F-01 says where the non-id expected fields come
from, F-02 adds two entries to a list. Neither needs another full round; folding them into the
FSPEC-opening edit is proportionate. I want to be explicit that nothing here asks for the
recognition predicate to return to §2, and nothing here contests the split.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
