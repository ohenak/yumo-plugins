# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/REQ-pdlc-consolidation-agent.md`
**Date:** 2026-08-06
**Iteration:** 11
**Scope:** Local (delta re-review — v10 finding + changed sections only)
**Baseline diffed:** `e775262..HEAD` (6 commits; REQ +30/−27, 637 lines / 61,109 bytes), plus the same commits' changes to `docs/_constraints/pdlc-consolidation-vocabularies.md` (v1.3 → v1.4) and `docs/_constraints/pdlc-advisory-corpus-baseline.md` (+7, still v1.0), and the new project-level `docs/_decisions/DECISIONS-review-severity-bars.md`

## Prior-Finding Disposition

| v10 | Severity | Status | Evidence in the revision |
|---|---|---|---|
| F-01 | Medium | **Resolved — the harder of the two alternatives I offered, taken in all four places, and taken in the second file too** | The finding asked that the ownership rule and the set-equality range stop pretending the governed file has two sections when it has four. §4b now reads "**This REQ owns every section of each `docs/_constraints/` file it authors — §1–§4 entire in both**", with the interleaving clause repointed to "never interleaved into §1–§4" (`:557-559`). The oracle half was not merely widened — it was *split*, which is the answer to my Q-02 rather than a dodge of it: "Of the owned sections, **§1, §2 and §4 are enumerations** and **§3 is owned normative prose** — binding, but carrying no table a downstream layer transcribes, so no row oracle ranges over it", and the range is now "set-equality over every enumerated row this REQ owns — **§1, §2 and §4 entire at Version 1.4** (§4's four-row trailer table and its two derived names included)" (`:559-565`). That is exactly the shape my Recommendation named as the correct second alternative: §3 is *owned-but-not-enumerated*, so "unowned" became a decision instead of an omission, and §4 — the trailer table whose deletion previously failed no obligation — is now inside the oracle by name. The mirror landed in the governed file itself with the same split (`pdlc-consolidation-vocabularies.md:18-27`), so a successor reading only that file inherits both halves; the version bumped 1.3 → 1.4 (`:7`) under the file's own rule, and all seven of the REQ's vocabularies citations were repinned to 1.4 in the same round (`:83`, `:99`, `:182`, `:222`, `:398`, `:557`, `:565` — checked individually, none left at 1.3). §5's parenthetical, which I flagged as inheriting the gap, is repointed from "(§4b's owned rows)" to "(§1–§4 entire, per §4b)" for the vocabularies file *and* given the same treatment for the baseline (`:585-586`), which I had not asked for. The one thing I did not anticipate: the same round wrote the equivalent governance paragraph into `pdlc-advisory-corpus-baseline.md` (`:15-20`), which had none — that file was under an ownership claim by §5 with no reciprocal statement of its own. That is where F-01's residue lands (F-02 below), but the finding as filed is closed. |

Resolved, and the round went past the finding: two further v10 recommendations that were not
findings at all — stop restating vocabularies §3 in three places (`:99-101`, `:182-185`) and stop
recapitulating baseline §1/§2 in the REQ-CONS-06 preamble (`:447-451`) — were executed as
cite-don't-restate compressions, which is what bought the byte headroom the repins cost.

## Standing-Decision Check

`docs/_decisions/DECISIONS-review-severity-bars.md` is new since v10 and is a project-level
adjudication of a split **this reviewer** is one side of, so I read it first and apply it below
rather than around it.

**DEC-SEV-01** decides that a REQ-layer finding about *the scope of a governance rule over a shared
normative file* is **Low**, not Medium, when the governed file carries a version-pin obligation whose
breach is itself a defect — Medium only when a downstream author cannot decide today (no pinnable
version, no defect clause, or unranged enumerated content with no stated oracle). That is precisely
the class my v9 F-01 and v10 F-01 belonged to, both scored Medium, and it decides against my bar.

I accept it, and I want to record why rather than merely comply. The decision's stated reason — the
bar that keys on *detectability* is the one the documents themselves enforce — is sound, and it is
sound because of a mechanism this REQ shipped after my v9 finding: the version-pin/defect clause. My
Medium was calibrated for a file with no such clause, where scope drift lands silently. With the
clause present the failure mode is a maintenance lag, not a blind spot. Both findings below are of
this class and are scored **Low** under DEC-SEV-01. Neither would I have scored Medium in any case:
F-02 is a self-referential genesis question and F-03 is resolvable by reading a binding file that
answers it in one sentence.

I found no violation of the standing decision in the document under review. Nor of
`docs/_constraints/DOMAIN-CONSTRAINTS.md`: the two constraints this round's edits could plausibly
have breached both hold. **DC-09** ("a REQ stays at requirements altitude and carries its own
stopping rule", `:245`) is *better* served after the round than before — the three compressions
moved mechanism prose (log write granularity, the freeze clauses, the baseline's corpus facts) out
of the REQ into the files that own it, leaving citations at the altitude DC-09 asks for, and §5a's
stopping rule is untouched. **DC-13** ("Scope-tag accurately — an untagged repo-wide finding never
reaches consolidation", `:356`) is why F-02 below is tagged `Cross-Feature` rather than `Local`:
the version-pin/defect clause is now stated in two shared files that `pdlc-engineering-loop` will
read, so how the clause treats its own genesis commit is a question about the mechanism, not about
this REQ.

## Findings

## Existing-Code Claim Verification (changed sections)

## Questions

## Positive Observations

## Recommendation

## Verdict
