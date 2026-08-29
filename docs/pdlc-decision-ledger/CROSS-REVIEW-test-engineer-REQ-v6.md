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

| ID | Question |
|----|---------|
| Q-03 | F-26: is there a reason not to enumerate the 41 project ids in the Baseline? It is the same kind of fact as the counts already there, it is what AC-01 actually needs, and it converts the acceptance test from a re-derivation into a transcription. |
| Q-04 | F-27: is the directory-glob reading (`M-6b`, already governing the floor) the intended membership reading too? If yes, one clause in O-1 says so and AC-01 becomes single-valued. |

## Positive Observations

- **The fix is structural, not another clause, and that is why it holds.** Five rounds ran the
  same loop: each rewrite of G-1's predicate was true against the corpus the previous round cited
  and false against one it had not looked at. v1.6 does not attempt a sixth predicate — it removes
  the predicate, states the outcome, and moves the measurement to a commit-pinned reference. A
  measurement against a named commit cannot be falsified by a counterexample from elsewhere in a
  live corpus, which is precisely the property the previous five clauses lacked. From a testing
  standpoint this is the difference between an oracle and an argument.
- **Every number in the new reference reproduces exactly — sixteen facts, sixteen checks, zero
  discrepancies.** Including the ones easiest to get wrong: the twelve-entry per-file count vector
  in path order, the twelve-entry per-directory vector, and twenty-nine individual line numbers
  across four files. I did not spot-check; I re-derived the whole corpus and diffed. A document
  that exists to be trusted by downstream fixtures earned that trust on first inspection.
- **`M-2c` is a finding the reviewers had not made, found by the author.** The second
  `DECISIONS-*.md` in `docs/completed/pdlc-headless-engine/` carries eight `DEC-HE-*` ids recorded
  nowhere else, invisible to a `DECISIONS-{feature}.md` file scope. That is a real 8-line drop
  under one plausible reading, and it moved the floor from 55 to 63 — which is why the old
  `maxEntries` default of 60 was wrong. `M-6c` states the consequence in the falsifiable form: a
  cap of 60 "drops a line against the standing corpus on day one". Raising the default to 70 on
  the strength of a measured floor, rather than defending the old number, is the right call.
- **`M-3c` answers F-23 by deriving the answer instead of asserting it.** Rather than declaring
  "last record wins", it records which opening carries the decision (`:363`, the outcome heading)
  and lets G-1's field contract — "says what was decided rather than what was asked" — select it.
  The REQ now has one statement where it previously had two that disagreed, and the surviving one
  is the black-box one.
- **`M-5b`/O-5 draw the correct testing conclusion from a null measurement.** "Zero cross-file
  duplicates" could have been read as "nothing to test". It is read instead as "not coverable by
  transcription, therefore a synthetic-fixture obligation for PROPERTIES" — with an explicit owner
  and an explicit note that it is a coverage obligation, not a REQ defect. That is the reasoning I
  would want a test engineer to do, arriving from the author's side. F-28 asks only that the same
  reasoning be applied to AC-04's legs.
- **The routing in the version note is auditable.** Each of the five open findings is named with
  its destination id (`F-23 → M-3a–M-3d`, `F-24 → M-5a–M-5c`, `F-25 → M-2a`, SE `F-01 → M-2c`/`M-6b`,
  SE `F-02 → O-5`), and none is silently dropped. I checked all five landed where claimed.
- **No stale residue from the excision.** "First record wins", "files in path order", the
  `.consolidation-log.md` construction and the old 41-based floor prose are gone from the REQ with
  no dangling reference left behind; C-5, A-1 and R-5 were all updated in step with the new
  `maxEntries`.

## Recommendation

**Approved with minor changes** — no High findings. F-23, the High that blocked rounds 1–5 in one
form or another, is resolved, and resolved by removing the clause rather than re-arguing it. The
rewrite touched §2 G-1, §4 C-5, §5 REQ-DECLEDGER-01, §5 REQ-DECLEDGER-04 and §7; I re-read all
five and found no previously approved behavior broken. The new Baseline is accurate in every fact
I could check, which is all sixteen.

The three Mediums are worth landing before FSPEC but none of them blocks it: F-26 (enumerate the
ids the Baseline counts, so AC-01's set-equality oracle is a transcription rather than a
re-derivation), F-27 (say which `M-2` reading governs membership, since C-5 has already chosen one
for the floor), F-28 (extend O-5's synthetic-fixture obligation to AC-04's three construction-only
legs). F-29 is a one-sentence correction to the Baseline's own provenance note. All four are
additive; none requires reopening G-1's altitude decision, which I think is right.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 3, "low": 1}
