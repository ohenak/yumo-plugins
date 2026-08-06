# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 10
**Scope:** Local (delta re-review — v9 findings + changed sections only)
**Baseline diffed:** `216b65d..HEAD` (5 REQ commits, +48/−56 on the REQ; 636 lines / 61,096 bytes), plus the 5 commits' changes to `docs/_constraints/pdlc-consolidation-vocabularies.md` (+60/−5, now v1.3 with two new sections)

## Prior-Finding Disposition

All three v9 findings, checked against the revision and against the code each cites.

| v9 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | Medium | **Resolved — option (a), written in both files and hardened past what I asked** | §4b now states the range instead of saying "the table": "**This REQ owns every row of that file's §1 and §2**, and changes none of anyone else's; a successor feature's vocabulary belongs in its own section of that file or in its own file, never interleaved into §1 or §2. So the oracle's range is stated, not 'the table': downstream completeness is checkable by **set-equality over the rows this REQ owns — §1 and §2 entire at Version 1.3**" (`:559-568`). Two things were added that I did not ask for and that matter more than the sentence I did ask for. First, the **symmetry**: "the defect rule is symmetric, a value used here with no row there **and** a row there naming a value this REQ never uses being equally defects. The symmetry is what makes a *deleted* row a breach" — that is the difference between a set-equality oracle and a containment check, stated at the REQ layer where the obligation lives, so the PROPERTIES author cannot implement it one-sided by accident. Second, the **version pin**: `Version 1.3`, plus the mirror rule in the file itself — "Consumers cite this file **at its `Version`**; a row change that is not accompanied by a version bump is itself a defect" (`pdlc-consolidation-vocabularies.md:23-24`) — which gives a downstream test a fixed expected value to transcribe, the thing my finding said was missing. Both halves are in the file too (`:16-24`), so a successor reading only the shared file sees the same rule. The pin checks out: the file's header is `Version 1.3 · 2026-08-06` (`:7`), and all three of the REQ's citations name 1.3. |
| F-02 | Low | **Resolved, both instances, and both verified at HEAD** | REQ `:475` now reads "The honest limit (baseline **§4**)" — and `pdlc-advisory-corpus-baseline.md` §4 is `## 4. The honest limit` (`:55`), whose body is exactly the sentence the REQ paraphrases ("`ESCALATIONS.md` records escalations, not resolutions… A resolution-**rate** input needs `advisorySummaryRows` persisted…", `:57-60`). The vocabularies citation is fixed in both places it appears: `nudge-consolidation.sh:41`'s read is now given as `:36-37` in the REQ (`:78`) and as "whose read of the log is at `:36-37`" in the file (`:105`). Checked against the script: `:36` is `with open(log, encoding="utf-8", errors="ignore") as fh:`, `:37` is `logtext = fh.read()`; `:32` (the old citation) is the `os.path.join` that composes the path. Correct now, in both files. |
| F-03 | Low | **Resolved — both paths named, and the clause repointed** | §5's in-scope list gains "the two project-level reference files this feature authors and thereafter owns — `docs/_constraints/pdlc-consolidation-vocabularies.md` (§4b's owned rows) and `docs/_constraints/pdlc-advisory-corpus-baseline.md` (REQ-CONS-06's corpus facts), both kept current with this REQ under §4b's change-control rule" (`:583-587`), and the trailing clause is repointed from "reporting against §4b's vocabularies" to "reporting against `pdlc-consolidation-vocabularies.md` §1's vocabularies" (`:586-587`). Both halves of the finding, and the added "thereafter owns" ties the scope line to F-01's ownership rule rather than merely listing two paths. The parenthetical is where my new F-01 lands — see below — but the finding as filed is closed. |

Three of three resolved, no v9 fix regressed. The single finding below is **not** a regression of
those three: it is the one seam between two fixes that landed in the same round — the ownership rule
(v9 F-01) was scoped to §1 and §2 in the same five commits that relocated two *further* normative
blocks into the same file as §3 and §4.

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict
