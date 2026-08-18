# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.4)
**Date:** 2026-08-18
**Iteration:** 4
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.
**Delta base:** v3 was written against `875c67cf` (DECISIONS v0.3). `git diff 875c67cf..HEAD` on the document shows 10 insertions / 9 deletions across four commits (`96a3b180`, `5eb9e31c`, `b6529219`, `8281ef70`). Only sections those edits touch are re-reviewed; sections approved in v1–v3 are not re-litigated.

## Prior findings disposition (v3)

| ID | Severity | Disposition | Evidence in v0.4 |
|---|---|---|---|
| F-01 | Medium | **Resolved** | The closure now reaches class 12. `:150` reads "Blocking class 7 therefore blocks **six of the thirteen classes FSPEC §3.1 enumerates — 7, 8, 9, 10, 11 and 12**" and "**seven of thirteen classes are gated: 6 on erratum 6, and 7–12 on erratum 3.**" I re-verified the FSPEC rows the extension rests on: class 12 (Documentation) carries "Last of the deletion classes" (`FSPEC-pdlc-plugin-retirement.md:164`) and class 13 carries "Independent; may land any time, but its documentation is part of the one story class 12 tells" (`:165`). Both propagation sites landed: the Consequences row now reads "Six of thirteen classes (7, 8, 9, 10, 11, 12)" (`:234`), and the gated-merge partition (`:237`) now accounts for all thirteen rows — 1–5 ungated, 13 ungated, 6 on erratum 6, 7–12 on erratum 3. The downstream obligation moved with it: PROPERTIES is now told to place the ATs for classes 7–12 behind the edge (`:150`, `:237`), and DEC-10's owner cell names a `Deps` edge on every class-7/8/9/10/11/12 task (`:171`). |
| F-02 | Low | **Resolved** | The splice is gone. `:111` now closes the negative-arm sentence at "an assertion that cannot fail is not an oracle." and opens a new one: "Both arms call the shipped `satisfiesRange` (`pdlc/engine/lib/handshake.mjs:93`) against `pdlc/engine/package.json`'s declared range rather than transcribing the comparison, so the range semantics are exercised and not restated." The clause now attaches to the assertion pair it actually qualifies, and it makes the no-implementation-echo requirement explicit for **both** arms rather than for the positive one only. |
| F-03 | Low | **Resolved** | Both anchor slips corrected and verified in the tree. `consolidationBuild.test.js:94` → `:95`: the four `readWorkflowSource("runtime-adapter.js")` sites are `:88`, `:95`, `:136`, `:141` exactly. The builder-side comment anchor `build-runtime.mjs:668` is now included in the excluded-references list and is correct — `grep -n 'runtime-adapter.js' pdlc/workflows/build-runtime.mjs` returns `17`, `97`, `668`, `690`, `691`, `692`, matching every anchor DEC-06 cites. |

Additionally, my v3 **Q-01** is answered in the document rather than in prose to me: the M-8 host claim at `:237` now cites **FSPEC L-5's M-8 deletion list** instead of the bare anchor `FSPEC:378`, satisfying `DEC-DOC-01`'s preference for a spec id where one exists. I re-verified the claim itself: L-5's enumeration of M-8's 21 modules (`FSPEC:377`–`:381`) names neither `consolidationPreflight.test.js` nor `consolidationRoute.test.js`, so both remain valid hosts.

All three v3 findings are resolved with evidence. No previously approved section was re-opened.

## Findings

Scanned: only the diff's changed regions — the cross-review lineage row, the v0.4 changelog row, DEC-06's excluded-reference list, DEC-09's negative-arm sentence, DEC-10's price paragraph, DEC-10's owner cell, the "Four" → "Five cross-cutting rules" line, rule 5's gated-class range, the Consequences row, and the gated-merge paragraph.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **The class-13 quote at `:237` ships with literal backslashes, so the one place a reader checks the "is class 13 really ungated?" question renders as `\"Independent; may land any time\"`.** The escape survives in the bytes: `cat -A` on line 237 shows `\"Independent;·may·land·any·time\"`, while the same quote one paragraph up (`:150`) is written with plain quotes and correctly reproduces the full FSPEC text. This is cosmetic, but it lands on the sentence that closes F-01's partition — the one PLAN reads to decide that class 13 needs no gate edge — and rule 2's transcribe-don't-re-measure discipline is about quotes being trustworthy on sight. Fix: drop the two backslashes; optionally quote `:165` in full as `:150` does, since the truncated form silently drops the "but its documentation is part of the one story class 12 tells" half that the very next clause then paraphrases. | FSPEC §3.1 `:165`; DEC-10 |
| F-02 | Low | Local | **DEC-10's owner cell books class 12 on a class-7 predecessor edge, but FSPEC binds class 12 to *all* deletion classes, so the `Deps` edge PLAN derives from this cell is weaker than the ordering it is meant to enforce.** `:171` now reads "a `Deps` edge on every class-7/8/9/10/11/12 task", extending the same class-7-predecessor construction to class 12. That is sound as a *gate* — class 12 cannot precede class 7 — but it is not FSPEC's actual constraint: class 12's ordering cell is "Last of the deletion classes" (`FSPEC:164`), i.e. it succeeds classes 6–11 as a set, not class 7 alone. A PLAN that mechanically derives edges from this cell can produce a batch DAG in which class 12 is orderable immediately after class 7 and ahead of classes 8–11, which the FSPEC row forbids. The gate arithmetic in `:150` is unaffected (12 is still blocked), so this is not a counting error; it is an under-specified edge that the parser-checked mechanism DEC-10 is proud of will not catch. Fix: in the owner cell, distinguish the erratum-3 gate edge (class-7 predecessors, classes 7–12) from class 12's own last-of-set edge over classes 6–11. | FSPEC §3.1 `:164`; REQ C-6; DEC-10 |

No High findings. Neither Low finding changes a chosen option, a count, or a downstream obligation's scope.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The gated-merge paragraph now says class 13 "is ungated too … though its documentation lands with class 12's story" (`:237`). Since class 12 is itself held on erratum 3, does the product intent allow class 13's *code* (the operator-invoked cleanup step of §3.5) to merge while its documentation waits behind class 12 — or is class 13 ungated only in principle and in practice held with 12? Either answer is fine for PLAN; it just needs to be the stated one, because it decides whether class 13 gets a `Deps` edge at all. |

## Positive Observations

- **The closure extension was done by re-reading FSPEC, not by patching the count.** The cheap way to close my v3 F-01 was to change "five" to "six" and move on. Instead `:150` re-derives the whole chain from the ordering column, names the mechanism for each class (8, 9, 10 bound to 7; 12 as last-of-deletion-set; 13 as the single independent row), and states the blocked set once so the three downstream sites quote rather than recompute it. That is the transcribe-don't-re-measure rule applied to the document's own arithmetic.
- **The FSPEC ordering cells are now quoted verbatim, and the quotes corrected a paraphrase of mine.** v0.3 (following my own v3 evidence) rendered class 8 as bound "at the same time as class 7". FSPEC `:160` actually reads "Any time after class 7" — a materially weaker binding. v0.4 quotes all three cells exactly, with `; quoted verbatim per rule 2` naming the discipline that forced the check. I re-read `FSPEC:160`–`:162` and the new quotes are exact. A revision that corrects the reviewer's paraphrase rather than inheriting it is the behaviour this loop exists to produce.
- **Every anchor in the round holds.** `consolidationBuild.test.js:88`/`:95`/`:136`/`:141` are the four `readWorkflowSource("runtime-adapter.js")` sites; the two surviving `T12` describes are at `:86` (adapter prompt) and `:134` (`rtConsInjections`), matching DEC-06's new "two describes, four assertion sites" split exactly; `build-runtime.mjs` mentions the module at `17`, `97`, `668`, `690`–`692` and DEC-06 now cites all six. Nothing in the round was asserted without a checkable referent.
- **DEC-06's added detail strengthens the rejection it serves.** Naming `rtConsInjections`'s key set alongside `rtWriteFile`'s prompt shows two *independent* surviving suites reading the orphan's source text, not one. Option B's price rises accordingly, and it rises on evidence.
- **The M-8 host citation moved from a line anchor to a spec id.** `:237` now says "neither is named in FSPEC L-5's M-8 deletion list" in place of `FSPEC:378`. That is `DEC-DOC-01` applied without being told twice, and it makes the claim survive any renumbering of FSPEC.

## Recommendation

## Verdict
