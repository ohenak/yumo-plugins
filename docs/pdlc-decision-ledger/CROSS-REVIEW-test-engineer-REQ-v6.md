# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.6, `3feee9461`)
**Date:** 2026-08-28
**Iteration:** 6
**Scope:** Delta re-review against `CROSS-REVIEW-test-engineer-REQ-v5.md`. Diff base `20a551c7f`
(v1.4, what v5 reviewed) → HEAD (v1.6, two commits: `a0cd343bc` v1.5, `3feee9461` v1.6). The
round also lands a new project-level reference the REQ now leans on,
`docs/_constraints/pdlc-decision-corpus-baseline.md` v1.0, which I read and re-derived in full
because §5 REQ-DECLEDGER-01's expected value now lives there. Unchanged REQ sections already
approved in earlier rounds are not re-litigated.

## Round-5 finding disposition

| v5 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-23 | High | **Resolved — by removal, and the removal is the right shape** | The "first record wins" key is gone from §2 G-1 entirely, along with the rest of the recognition predicate. What replaces it is not a corrected key but a routing decision: G-1 now states only the *outcome* (every in-scope decision renders once; the citation names a real record; the statement field "says what was decided rather than what was asked"), and the twice-opened case is relocated to Baseline `M-3a`–`M-3d`. `M-3c` records the fact my finding turned on — the second opening decides — and states the consequence for a consumer without minting a rule the REQ then has to defend. I re-derived it: `docs/completed/pdlc-engineering-loop/DECISIONS-pdlc-engineering-loop.md` carries 13 heading-records over 7 distinct ids, first openings at `:237,249,259,282,322,337` under `## Options Considered` (`:232`), second at `:363,397,420,465,508,582` under `## Decision` (`:355`), `DEC-LOOP-07` once at `:618`. `M-3b` matches line for line. The field contract in G-1 ("what was decided rather than what was asked") now *derives* the same answer instead of contradicting it, which is what I asked for and better than the one-word "last" fix I proposed. |
| F-24 | Medium | **Resolved** | The undefined "files in path order" clause is deleted. `M-5a` records the measurement I could only assert negatively last round — swept all 25 tracked `DECISIONS-*.md`, **zero** ids are heading-recorded in two files; I reproduced this exactly. `M-5b` draws the correct testing consequence (inert at this commit, no HEAD instance to transcribe, therefore a synthetic-fixture obligation), and `M-5c` states the semantic intent (`docs/_decisions/` wins) *plus* the collation caveat I raised — byte order and case-folded collation invert on `_` (`0x5F`) — as a reason path-ordering is not a substitute. Q-02 is answered in the direction I suggested. |
| F-25 | Low | **Resolved** | `M-2a` names all three live directory shapes with an exemplar each: `docs/{feature}/` (`docs/orchestrate-dev-workflow/`), `docs/completed/{feature}/`, `docs/discarded/{feature}/` (`docs/discarded/pdlc-rcv-budget-stop/`, 4 records). All three reproduce. A fixture author laying out a two-file corpus no longer has to infer the layout. |

## Baseline re-derivation

§5 REQ-DECLEDGER-01's expected value is now *entirely* the Baseline's, so I re-derived every
`M-*` fact from the working tree rather than reading them. Method: `git ls-files` filtered to
`(^|/)DECISIONS-[^/]*\.md$`, then Baseline §1's stated reading — heading line, optional leading
section number, id `DEC-{NAMESPACE}-{NUMBER}` with `NUMBER` decimal opening the heading content.

| Fact | Claim | Re-derived | |
|---|---|---|---|
| corpus | 25 files, 12 project + 13 across 12 feature dirs | 25 / 12 / 13 across 12 | ✓ |
| `M-1a` | 41 records, 41 distinct ids under `docs/_decisions/` | 41 / 41 | ✓ |
| `M-1b` | 0,1,4,2,2,7,2,12,1,1,6,3 in path order, sum 41 | identical, file for file | ✓ |
| `M-2b` | 22,11,10,10,10,8,8,7,6,4,4,0 per feature directory | identical, ordering included | ✓ |
| `M-2c` | `pdlc-headless-engine` holds two files, 14 + 8; `DEC-HE-01`…`08` at `:11,37,62,87,108,130,155,184`, recorded nowhere else | 14 + 8, all eight line numbers exact, zero `DEC-HE-*` records elsewhere | ✓ |
| `M-2d` | largest file 14, largest directory 22 | 14 / 22 | ✓ |
| `M-3a`–`M-3d` | 13 records / 7 ids; the only file recording any id twice | 13 / 7, and it is the only such file in the corpus | ✓ |
| `M-4a` | `DECISIONS-advisory-wave-gate-questions.md` zero records; `DEC-AWG-Q1…Q5` prose at `:14`; `Q-1`…`Q-5` bullets at `:19,59,84,99,132` | zero; prose shorthand at `:14`; five bullets at those lines | ✓ |
| `M-4b` | `pdlc-plugin-retirement` zero; `### DEC-01`…`10` at `:37,45,53,61,76,84,92,100,108,116` | zero; ten headings, line numbers exact | ✓ |
| `M-4c` | four non-`DECISIONS-*.md` files; log items `:275,277,279,281` under `:271`, all four ids recorded in sibling files | four files present; four items under the "Corroborated, not re-promoted" lead at `:271`; `DEC-ERRROUTE-01/03`, `DEC-TERM-02`, `DEC-ORACLE-06` all heading-recorded in `docs/_decisions/` siblings | ✓ |
| `M-4d` | 4 records `:261,315,362,420`; 8 non-records — 4 question headings `:208,217,231,251`, 4 back-references `:443,493,509,526` | exact, all twelve lines | ✓ |
| `M-5a` | zero cross-file duplicate ids over all 25 files | zero | ✓ |
| `M-6a`/`M-6b`/`M-6c` | 41+14=55; 41+22=63; 70 clears 63 by 7 and 55 by 15 | arithmetic and both terms check out | ✓ |

Sixteen facts, sixteen reproductions, no discrepancy. `8c673a09f` exists on this branch and is
the post-mortem commit. Every other path the REQ names also exists:
`docs/design/PROPOSAL-pdlc-pipeline-optimization-2026-08-27.html`,
`pdlc/workflows/__tests__/learningsBaselineGuard.test.js` (and `pdlc/OPERATIONS.md` names it),
`docs/_decisions/DECISIONS-loop-termination.md` (`DEC-TERM-02`),
`docs/completed/pdlc-loop-economics/`.

## Findings

<!--PLACEHOLDER-FINDINGS-->

## Questions

<!--PLACEHOLDER-QUESTIONS-->

## Positive Observations

<!--PLACEHOLDER-POSITIVE-->

## Recommendation

<!--PLACEHOLDER-RECOMMENDATION-->
