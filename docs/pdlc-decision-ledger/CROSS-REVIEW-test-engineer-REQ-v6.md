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

No High findings. The clause that blocked five rounds is resolved, and nothing the rewrite
touched broke a previously approved section. Three Mediums and one Low follow, all recorded and
none gating.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-26 | Medium | Local | **AC-01 asserts set equality "against those ids", but the Baseline records cardinalities, not an enumeration — so the expected id list is not transcribable from any cited artifact.** §5 REQ-DECLEDGER-01 now reads: "the expected set is the measured extent recorded in the Baseline (`M-1`, `M-2`, `M-3`) … and equality is asserted against those ids." `M-1a`/`M-1b` give 41 and a per-file count vector; `M-2b` gives per-directory distinct-id counts. Neither names an id. Counting the ids the Baseline does spell out — `DEC-HE-01`…`08`, `DEC-LOOP-01`…`07`, `DEC-A6-01`…`04`, `DEC-01`…`10`, `DEC-AWG-Q1`, four log ids — at most 29 of the 63 in the governing (`M-6b`) set appear by name, and the 41 project-level ids are named nowhere. A fixture author therefore cannot transcribe; they must re-derive the list by applying Baseline §1's reading, which §1 itself disclaims — "It is **not** a requirement". That is the contestable-predicate loop the split was built to escape, re-entering through the fixture. It also matters that count equality is not set equality: swap one id for another and 41 still holds, so the only mechanically transcribable check the Baseline supports today cannot fail on a deleted-and-replaced case. Cheapest fix, and it is not a rule: Baseline v1.1 adds an `M-1d` enumerating the 41 ids in path order and an `M-2e` enumerating them per feature directory — pure measurement, same character as everything else in the file, and it makes AC-01's oracle a literal transcription. The REQ owns every section of that file by its own change control, so this is in-scope work, not an upstream defect. | §5 REQ-DECLEDGER-01; Baseline §2/§3 |
| F-27 | Medium | Local | **On the one case where feature file-scope readings differ, O-1's guard does not discriminate — while §4 C-5 has already silently chosen one of them.** O-1 constrains TSPEC: "A TSPEC choice that renders a set differing from `M-1`/`M-2`/`M-3` at the Baseline's commit fails REQ-DECLEDGER-01." `M-2c` records that `docs/completed/pdlc-headless-engine/` yields **14** under a `DECISIONS-{feature}.md` file scope and **22** under a `DECISIONS-*.md` directory glob, and that the readings "differ by 8, and only on this feature". Both numbers are recorded in `M-2`, so both TSPEC choices satisfy the guard as written, and AC-01's expected set stays two-valued for that feature until TSPEC lands. Meanwhile C-5's `maxEntries` rationale cites `M-6b` (63 = 41 + 22), i.e. it already assumes the directory-glob reading, and `M-6b` is described as "the governing figure". The REQ is thus one-valued for sizing and two-valued for membership. No correctness hazard — 70 clears both — but a tester writing AC-01 and AC-07 against the same corpus reads two different extents out of the same document. Naming which `M-2` reading governs membership (the directory one, matching the floor already taken) costs one clause and mints no recognition rule: it selects between two measured numbers rather than stating how to recognise a record. | §7 O-1; §4 C-5; §5 REQ-DECLEDGER-01 |
| F-28 | Medium | Local | **This round created the right vehicle for construction-only coverage (O-5) and then used it for one leg out of four.** O-5 is exactly the correct move: `M-5b` says cross-file precedence has no HEAD instance, so PROPERTIES owes a synthetic two-file fixture. But AC-04's legs are in the same position and now cite the Baseline for it. `M-4e` states plainly that an empty file and a failure to read are indistinguishable in the corpus and "are distinguished by construction rather than by measurement" — and REQ-DECLEDGER-04's edit leans on precisely that (`a file holding no decision record is an ordinary empty result, not this path — Baseline M-4e`). All three of AC-04's legs are construction-only at HEAD: every-source-unavailable, one-decision-of-several-fails-to-render, and the empty-file boundary that must *not* take the partial path. None has an obligation naming it, so the one leg with a written owner is the one that happened to arrive as a cross-review finding. Widening O-5 — or an O-6 in the same shape — to name AC-04's three synthetic legs alongside precedence closes it. Without that, the empty-vs-unreadable boundary is the classic absence-only oracle: "no index rendered" is the observable for both, and only a constructed corpus separates them. | §5 REQ-DECLEDGER-04; §7 O-5; Baseline `M-4e` |
| F-29 | Low | Local | **The Baseline's provenance sentence is self-contradictory, which will cost the next re-verifier ten minutes.** It reads: "Every number below was re-derived from the working tree at the `Verified at` commit, which differs from that commit only in `docs/pdlc-decision-ledger/POSTMORTEM-R-pdlc-decision-ledger.md`, a file holding no decision record." But `8c673a09f` **is** the post-mortem commit (`docs(pdlc-decision-ledger): Phase R post-mortem — round budget exhausted`), so the post-mortem is not a difference from it; the tree at measurement time differed by the then-untracked Baseline itself and the in-progress REQ v1.6. Materially it does not move a number — none of the three is a `DECISIONS-*.md` and I re-derived every fact at HEAD anyway — but a file whose whole purpose is reproducibility should describe its own measurement tree correctly. This repo has been bitten before by untracked files perturbing a tree-walking check, which is the same class of hazard the sentence is trying to close. | Baseline, *Change control* |

## Questions

<!--PLACEHOLDER-QUESTIONS-->

## Positive Observations

<!--PLACEHOLDER-POSITIVE-->

## Recommendation

<!--PLACEHOLDER-RECOMMENDATION-->
