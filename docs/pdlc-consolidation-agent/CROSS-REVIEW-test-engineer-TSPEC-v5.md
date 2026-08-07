# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.4)
**Date:** 2026-08-06
**Iteration:** 5
**Scope:** Delta re-review. Baseline `74f990a` (the bytes v4 reviewed) → HEAD; 188 insertions, 38
deletions across seven commits. Two passes: (1) each of v4's four findings and three questions,
verified against the repository rather than against the revision's prose; (2) the changed sections
only, read for new issues. Unchanged sections already approved are not re-litigated. The approval
bar is unchanged — any open High or Medium means **Needs revision**.

## Disposition of v4 findings

All four are resolved, each checked at the mechanism rather than at the revision's account of it.
All three questions are answered in the document.

| v4 | Severity | Status | Evidence I checked |
|----|----------|--------|--------------------|
| F-01 | Medium | **Resolved** | §7.3 now decides both halves and states why they are one decision. `releaseMarker` is `await _writeFile(markerPath, "")` — added to the §7 signature block and to the §12.1 CONS-03 row — and `present` is `(await _checkFile(markerPath)).ok === true`, *only* that. I checked the seam it now depends on: `rtCheckFile` (`runtime-adapter.js:817-831`) does return `{ok:true}` / `{ok:false, reason:"file_empty"}` / `{ok:false, reason:"file_missing"}` exactly as quoted, so the empty released form reads as absent and cannot re-enter §7.3's `reclaim` arm. `_checkFile` was added to §5.1's protocol and to §5.3's defaults row; `fakeFs` already doubles it (`__tests__/helpers/seams.js:292`, exposed at `:313`), so no new double is owed. T-13's conjunct (ii) is restated against the observable that decision produces — the write double's **last** recorded contents for the marker path, having been the `IN-PROGRESS:` line earlier in the same history — and `fakeFs` supports the history half (`:281` pushes every write into `self.writes`) |
| F-02 | Medium | **Resolved, exactly as asked** | §12.2 carries a new unnumbered `(no FSPEC AT)` row for the unreadable corpus entry, §12.3 assigns it to `consolidationPass.test.js`, and §7.1 back-references both ("These three obligations are not left to inspection either"). All three observables are asserted, each against the readable control in the **same fixture**: the count includes both, the consumed pair contains both basenames, and the report body names the unreadable one and **not** the readable one. That is the pair-not-absence shape I asked for, and the control is what stops (1) and (3) passing on a fixture where nothing was readable |
| F-03 | Low | **Resolved, and the anchor problem was solved rather than worked around** | The pin is no longer over a line index. §7.1 specifies the hook edit that gives it a nameable anchor — `CORPUS_GLOBS = ("docs/*/LEARNINGS-*.md", "docs/completed/*/LEARNINGS-*.md")` plus a comprehension using `*g.split("/")` — and states the pin over the *declaration*, located by name. I verified the premise at HEAD: `nudge-consolidation.sh:28` is `learnings = glob.glob(os.path.join(proj, "docs", "*", "LEARNINGS-*.md"))`, neither literal occurs anywhere in the file, and `glob.glob(` occurs **exactly once**, so the added "occurs once, inside the comprehension" conjunct is a real falsifier and not a tautology. The proposed comprehension is behaviour-preserving: `"docs/*/LEARNINGS-*.md".split("/")` splats to the shipped `("docs", "*", "LEARNINGS-*.md")` argument list, so portability is unchanged |
| F-04 | Low | **Resolved beyond the suggestion** | §11.1 adds the L4 pathspec-semantics case and §12.3 lists it. Better than what I asked for: I proposed running the argv in *this* repository, which would have drifted as `docs/` grows; the revision runs it against a temp repository the case builds itself (`git init`, three LEARNINGS under `docs/{f}/`, `docs/completed/{f}/`, `docs/discarded/{f}/`, `git add -A`) and keeps DC-04. It is explicitly held outside the differential fixture table so `executed === TABLE.length` still means what §11.1 says it means. The oracle discriminates: drop `:(glob)` and `*` crosses `/`, so the `docs/discarded/` conjunct reds |

**Questions.** Q-01 is answered in §11.2 by two named constraints on the PLAN task (per-case double
construction, and a drain after the assertions) — see F-03 below for the one residue. Q-02 is
answered in §11.1: the `PY_BIN` probe is performed **once at module scope** and skips every
differential row or none, so the "rows run against a degraded probe" world I asked about does not
exist by construction. Q-03 is answered in §12.3, and answered the right way — by explaining why the
converse assertion is not implementable (it would red the report row that deliberately cites AT-L5)
and by bounding the residual exposure, rather than by inventing a parser that reads intent.

## Findings

## Detail

## Questions

## Positive Observations

## Recommendation

## Verdict
