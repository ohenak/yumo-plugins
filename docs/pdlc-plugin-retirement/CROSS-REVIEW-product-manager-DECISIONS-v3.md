# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.3)
**Date:** 2026-08-18
**Iteration:** 3
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.
**Delta base:** v2 was written at `812a7863`; this review reads `git diff 812a7863..HEAD` on the document
(26 insertions, 12 deletions across six commits, `29717bec`…`875c67cf`) and the sections those edits touch.
Unchanged sections already approved in v1/v2 are not re-litigated.

## Prior findings disposition (v2)

| ID | Severity | Disposition | Evidence in v0.3 |
|---|---|---|---|
| F-01 | Medium | **Resolved, with a residue** | "Two of eleven classes" is gone. DEC-10's price paragraph (`:149`) now states the transitive closure — classes 7, 8, 9, 10, 11 of **thirteen** — citing FSPEC's ordering column, and the Consequences row (`:233`) reuses the same set. Verified upstream: FSPEC §3.1 enumerates thirteen classes; class 8 is bound "same time as class 7", class 9 "same commit as class 7", class 10 after class 7 (`FSPEC-pdlc-plugin-retirement.md:160`, `:161`, `:162`). The stated-once discipline now holds between the two sites. The closure stops one class short — see F-01 below. |
| F-02 | Medium | **Resolved** | New cross-cutting **rule 5** (`:203`–`:213`) states the additive-and-conservative / subtractive principle that separates DEC-04's ship-ahead-of-criterion from DEC-07's and DEC-10's block-until-criterion, and names the conservative half explicitly ("an additive surface that deleted on default would be gated"). DEC-04's oracle cell (`:161`) now names TT-1 for row 4a, TT-2 for `--dry-run`, and records that **TT-1b owns row 4b's exit status only** with the partial-`rm` arm deliberately oracle-free. Both transcriptions are faithful: TSPEC `:737`–`:739` scope TT-1 to 4a, and TT-1b's row states "Only these two conjuncts are asserted — the partial-`rm` arm of row 4b is deliberately…" oracle-free. |
| F-03 | Low | **Resolved** | DEC-06 (`:87`) now reads "Nine **such** cite sites… The nine count **load-bearing prose citations in modules that survive unchanged** — it is not the whole live-reference set", and names the two excluded kinds (the builder's own reads; surviving suites asserting on source text), correctly concluding the second kind *strengthens* the rejection of option B. Two transcription slips remain — see F-03 below. |

All three v2 findings addressed. No previously approved section re-opened. The three TE findings this round also landed (DEC-09's `.ok`/negative arm, the gated oracle cells, DEC-10's PLAN-side owner) and are re-verified in Positive Observations rather than re-reviewed as mine.

## Findings

Scanned: only the diff's changed regions — the changelog row, DEC-06's option-B paragraph, DEC-09's
option-A paragraph, DEC-10's price paragraph, the Decision table's DEC-01/DEC-02/DEC-04/DEC-09/DEC-10
oracle cells, new rule 5, and the two Consequences additions.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **The transitive closure stops one class short: class 12 is bound to the deletion classes too, so the blocked set is six of thirteen on erratum 3 and seven of thirteen overall.** `:149` derives the closure from FSPEC's ordering column and reaches 7, 8, 9, 10, 11. But FSPEC's class 12 (Documentation) carries the ordering obligation "**Last of the deletion classes**" (`FSPEC-pdlc-plugin-retirement.md:164`) — holding class 7 holds class 12 by exactly the same mechanism the paragraph just used for classes 8–10. Class 13 genuinely is exempt: "Independent; may land any time" (`:165`). So the honest counts are **six of thirteen blocked on erratum 3 (7–12)** and **seven of thirteen gated** once DEC-07's class 6 is added — not five and six. The same gap shows up in the new "What a gated merge looks like" paragraph (`:235`), which partitions "Classes 1–5 ungated; class 6 on erratum 6; classes 7–11 on erratum 3" and leaves classes 12 and 13 unaccounted for — an enumeration over thirteen that names eleven. This is the F-01 defect one level up, and it matters for the same reason: the document promises the blocked set is "stated once here and reused wherever a count appears", so PLAN sizes the gated wave from this sentence and will under-book by a class. Fix: extend the closure to 12 with the `:164` citation, state "six of the thirteen classes — 7, 8, 9, 10, 11 and 12", carry the same set into `:233`, and add class 13 to `:235`'s partition as explicitly ungated and independent. | REQ C-6; FSPEC §3.1 `:157`–`:165`; DEC-07, DEC-10 |
| F-02 | Low | Local | **DEC-09's inserted negative arm leaves the surrounding sentence spliced, so the reason the shipped function is *called* rather than transcribed now dangles off the wrong clause.** `:109` ends "…an assertion that cannot fail is not an oracle, calling the shipped `satisfiesRange` (`pdlc/engine/lib/handshake.mjs:93`) against `pdlc/engine/package.json`'s declared range rather than transcribing the comparison." The trailing participle attached to "returns true" before the edit; it now hangs off the negative-arm sentence and reads as if the negative arm is what calls the shipped function. The decision content is right and independently verified — `satisfiesRange` at `handshake.mjs:93` returns `{ok, reason}` (`{"ok":true,"reason":null}` for `0.23.2`/`^0.23.0`; `{"ok":false,"reason":"…0.24.0…^0.23.0"}` for `0.24.0`), and the caret upper bound for a `0.minor.patch` base is `{0, minor+1, 0}` as claimed — so this is prose repair, not a change of decision: close the negative-arm sentence and re-attach the "calling the shipped… rather than transcribing" clause to the positive assertion it qualifies. | REQ BR-VER-1; TSPEC class 9 (M-11g) |
| F-03 | Low | Local | **DEC-06's newly added exclusion list carries two transcription slips against the tree it cites.** (i) The surviving-suite anchors read `consolidationBuild.test.js:88`, `:94`, `:136`, `:141`; the actual `readWorkflowSource("runtime-adapter.js")` sites are `:88`, **`:95`**, `:136`, `:141` (`:94` is a `describe`/`it` title line). The `:94` came from my own v2 text, so rule 2's transcribe-don't-re-measure worked exactly as designed and faithfully propagated a reviewer's off-by-one — the fix is mine to hand over, not a lapse by the author. (ii) The builder-side exclusion names `build-runtime.mjs:17`, `:97` and the three `*_SOURCES` arrays at `:690`–`:692`, but `build-runtime.mjs:668` also names `runtime-adapter.js` in a load-bearing comment about dead code inside the runtime. Since the paragraph's whole purpose is to bound a set the nine does *not* cover, the excluded set should be complete: add `:668`. Neither slip changes option B's rejection. | DEC-06; REQ C-6 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | The gated-merge paragraph (`:235`) says the assertion DEC-09 requires "must be hosted in a module outside M-8's deletion set (`consolidationPreflight.test.js` or `consolidationRoute.test.js` both qualify, FSPEC:378)". Both files exist and neither appears in M-8's 21-module list at `FSPEC:378`–`:381`, so the claim holds. But the citation is a bare `file:line` anchor doing identification work where a spec id (L-5) is available — worth naming L-5 alongside the anchor, per `DEC-DOC-01`. |
| Q-02 | Q-01 of v2 is now answered by the "What a gated merge looks like" paragraph — partial merge held on the branch, AC-1.1 red until class 7 lands, no green-subset merge. That is the right product answer. Does the same paragraph's promise that PROPERTIES "places the classes 7–11 ATs behind the same edge" need widening to 7–12 if F-01 is accepted? |

## Positive Observations

- **Rule 5 is the sentence this document was missing.** It does not merely reconcile DEC-04 with DEC-07/DEC-10 after the fact; it states a rule a PLAN author can apply to a surface none of us has seen yet, and it guards its own edge case ("the conservative half matters — an additive surface that deleted on default would be gated"). That is a durable product principle, not a local patch, and it is the reason F-02 of v2 closes cleanly.
- **The gated oracle cells now distinguish *pending* from *gated*.** DEC-01's cell reads "**gated**: it cannot go green before class 7 lands, so DEC-10's erratum-3 gate holds it red", and DEC-02's rides the same edge. A reviewer opening the Decision table can now tell a criterion that is merely unwritten from one that is written and deliberately red — the difference between an oracle nobody built and an oracle correctly failing.
- **DEC-10's owner cell names a mechanism, not an intention.** "PLAN's batch-DAG check over the class-7 predecessor edges… a `Deps` edge on every class-7/8/9/10/11 task, which PLAN's parser re-derives, not a runtime assertion" states what would catch a violation and where. Naming a parser-checked edge instead of prose is the strongest available answer for a gate that has no runtime witness.
- **DEC-09's negative arm is the right test of the right thing.** "Without the negative arm a truthy-shaped check passes on any object the function could return, including `{ ok: false }` — an assertion that cannot fail is not an oracle." I re-ran the shipped function: `0.24.0` against `^0.23.0` returns `{ok:false}` with a non-null reason, so the arm is constructible exactly as written, and the `.ok` field naming corrects a real shape error rather than a stylistic one.
- **Every re-verified anchor held again.** Thirteen FSPEC classes; classes 8/9/10 bound to class 7 at `FSPEC:160`–`:162`; TT-1/TT-1b/TT-2 scoping at `TSPEC:737`–`:739`; `satisfiesRange` at `handshake.mjs:93` returning `{ok, reason}`; `consolidationPreflight.test.js` and `consolidationRoute.test.js` both outside M-8's deletion set. The only misses this round are the two anchor slips in F-03, one of which I supplied.

## Recommendation

**Approved with minor changes.**

All three v2 findings are resolved with evidence, no High finding appears in the changed sections, and nothing here blocks Phase D. One Medium and two Low items are recorded for the next revision; none changes a chosen option:

1. **F-01** — extend DEC-10's closure to class 12 (`FSPEC:164`, "Last of the deletion classes"), restate the blocked set once as **six of thirteen on erratum 3 (7–12), seven of thirteen gated overall**, propagate to the Consequences row (`:233`), and complete `:235`'s partition by naming class 13 as ungated and independent.
2. **F-02** — repair DEC-09's spliced sentence so the "calling the shipped `satisfiesRange`… rather than transcribing" clause attaches to the positive assertion.
3. **F-03** — correct `consolidationBuild.test.js:94` to `:95` and add `build-runtime.mjs:668` to DEC-06's excluded-reference list.

No finding contradicts a promoted decision in `docs/_decisions/` or a standing `DOMAIN-CONSTRAINTS.md` row; DEC-08's narrowing of `DECISIONS-plugin-distribution.md` remains declared. All three are `Local` — they are defects in this document's record of its own choices, not constraints other features inherit. No upstream defect was found that is not already routed as TSPEC §6.1 erratum 3, 6 or 7, so no erratum is raised this round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
