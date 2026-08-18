# Cross-Review: test-engineer — DECISIONS (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md` (v0.4, bytes unchanged since v4 approval)
**Upstream trigger:** REQ v0.12 erratum, `cc009367` (REQ sha256:41fb21e8…)
**Date:** 2026-08-18
**Iteration:** 5 (delta confirmation — not a full re-review)

## Context

Scope of this round: **one question only** — does DECISIONS v0.4 still hold against the REQ as it
now stands? DECISIONS' own bytes are unchanged since the v4 approval (`APPROVAL-HASH`
sha256:8d0c2b02…, `REVIEWED-COMMIT` `8281ef70`). The recorded upstream anchor was REQ
sha256:1038b816… (commit `68e72db2`, REQ v0.11). HEAD's REQ is sha256:41fb21e8… (commit `cc009367`,
REQ v0.12), so the v4 approval was taken against a REQ that no longer exists.

The erratum is +16/−1 lines and lands in exactly one place of substance: a new **"Held classes and
the interim state"** paragraph under C-7 (`REQ-pdlc-plugin-retirement.md:264`–`:275`), plus the
version row and changelog line. It disposes of the held-branch interim state as follows:

- C-7 governs **repo CI checks at each commit**; it does **not** govern this REQ's completion
  criteria, which are evaluated when the sweep is complete (`:265`–`:266`).
- While a deletion class is held, AC-1.1 being unsatisfied is "an incomplete feature on an unmerged
  branch — it is **not** a C-7 red, it is **not** registered anywhere as an expected or tolerated
  failure, and it does not forbid the ungated classes from landing as their own commits"
  (`:267`–`:269`).
- "There is no skip-list, no expected-failure inventory and no tolerated-red register in this
  feature" (`:270`–`:271`).
- "Where a check that observes a held class would otherwise run red in repo CI before that class
  lands, the resolution is **ordering** — the check becomes live with the class it covers — never
  registration" (`:272`–`:274`).
- "The branch does not merge on a green subset: completion is all criteria satisfied at HEAD, held
  classes included" (`:274`–`:275`).

This paragraph is the upstream answer to my own v4 **Q-02** ("do the gated ATs sit behind an edge as
registered expected failures, or as rows simply not authored yet?"). The answer is neither: they are
authored to become live with their class. That answer is now binding on DECISIONS, because DECISIONS
is the document PLAN and PROPERTIES mine for whether a gated oracle may exist red on the branch.

What I re-read at the current version: REQ §C-7/C-8 in full (`:256`–`:281`), and every DECISIONS
sentence that leans on C-7, on "red", or on the gated/held interim state — DEC-07's blocking clause
(`:95`), DEC-10's price paragraph (`:150`), the Decision-table cells for DEC-01 (`:162`) and DEC-07
(`:168`), cross-cutting rule 1 (`:177`), the Consequences class-6 row (`:235`), the gated-merge
paragraph (`:237`), and the PLAN/PROPERTIES obligation sentence (`:281`). Nothing else in DECISIONS
cites C-7 or the interim state, so the confirmation surface is those eight sites.

## Options Considered

Three dispositions were available for this confirmation, and the choice between them is a testing
call, not a bookkeeping one:

- **A — re-affirm unchanged.** The erratum adds no new criterion, deletes none, and changes no
  literal, no count and no ordering fact. Every mechanical claim DECISIONS makes (class closure
  7–12, the batch-DAG edge set, the FSPEC ordering quotes, the M-8 host claim for DEC-09's
  assertion) survives the erratum untouched. Rejected as the whole answer: faithfulness is measured
  against the upstream text as it now reads, not against the item list, and the erratum re-words
  precisely the concept three DECISIONS sites lean on.
- **B — treat the divergence as a fresh substantive conflict.** Rejected: DECISIONS' *conclusions*
  are the erratum's conclusions. "The branch does not merge on a green subset" appears in both
  documents in almost the same words (`REQ:274`, `DECISIONS:237`), and DECISIONS registers nothing
  as an expected failure anywhere — the shape C-8 and the new paragraph forbid is absent from the
  document. There is no decision to reopen.
- **C — confirm the substance, file the transcription divergence (chosen).** DECISIONS says
  "red" for a state the REQ now expressly says is **not** a red, and it nowhere carries the
  erratum's positive rule (ordering, never registration; the check becomes live with the class it
  covers). Under DECISIONS' own cross-cutting rule 2 — transcribe, don't re-measure — the wording
  of a load-bearing upstream term is the contract, and PLAN/PROPERTIES author test rows from this
  document, not from REQ §C-7.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **Two sites call the held-class interim state "red"; the REQ now says in terms that it is not.** The gated-merge paragraph reads "each ungated class is independently green per REQ C-7, but AC-1.1's `dist/` set-equality stays red while classes 7–12 are held" (`DECISIONS:237`), and DEC-01's owning-oracle cell reads "**gated**: cannot go green before class 7 lands, and DEC-10's erratum-3 gate holds it red" (`:162`). REQ v0.12 now disposes of exactly this state: "AC-1.1 being unsatisfied is simply an incomplete feature on an unmerged branch — it is **not** a C-7 red, it is **not** registered anywhere as an expected or tolerated failure" (`REQ:267`–`:269`). The conclusions DECISIONS draws from its own sentence are still upstream-faithful (branch does not merge on a green subset; PROPERTIES places the 7–12 ATs behind the class-7 edge) — but the sentence now supports a second reading the erratum forbids, namely that AT-1.1 exists and fails on branch as a tolerated red. Because PROPERTIES authors AT placement from this document rather than from REQ §C-7, the ambiguity is live: if the red-on-branch reading lands in PROPERTIES it becomes a High there. Fix is a clause-level edit at two sites, no restructuring: say **unsatisfied / not yet assertable**, not "red", and add the erratum's positive rule — the check becomes live with the class it covers, ordering never registration (`REQ:272`–`:274`). | Gated-merge paragraph (`:237`), DEC-01 oracle cell (`:162`) |
| F-02 | Low | Local | **The erratum's no-registration rule is nowhere transcribed, and DECISIONS never cites C-8.** REQ now states "There is no skip-list, no expected-failure inventory and no tolerated-red register in this feature: C-8 already forbids that shape, and a criterion that is allowed to be red by registration stops being a criterion" (`REQ:270`–`:272`). DECISIONS contains no reference to C-8 at all, and no prohibition on registration. Nothing in the document *violates* the rule — no gated oracle is registered anywhere, which is why this is Low, not a substantive conflict — but the document that PLAN and PROPERTIES read to place gated ATs is silent on the one shape they must not use. One transcribed clause in the gated-merge paragraph, quoted under cross-cutting rule 2, closes it. | Gated-merge paragraph (`:237`) |
| F-03 | Medium | Local | **Inherited from v4 F-01 and still unfixed: the sentence PLAN mines for dependency edges states the narrow pair, not the closure.** "PLAN must also carry DEC-10's block (classes 7 and 11 gated on erratum 3) … as dependency edges, not prose notes" (`:281`). The authoritative closure is classes **7–12**, stated correctly at `:150`, in DEC-10's owning-oracle cell (`:171`), in the Consequences row (`:234`) and in the gated-merge paragraph (`:237`). I re-file rather than let it ride this round because the erratum makes ordering the *only* admissible resolution for a check that would otherwise run red (`REQ:272`–`:274`) — which promotes the edge set from bookkeeping to the mechanism the REQ now relies on. An understated edge set is now an upstream-criterion risk, not just a batch-column nit. Fix: `:281` reads 7–12. | PLAN/PROPERTIES obligation sentence (`:281`) |

**Not a finding — DEC-07's use of "red" is upstream-faithful and must not be swept up in F-01's fix.**
DEC-07's blocking clause says that until erratum 6 lands, the in-place reduction "reds AC-1.3 —
correctly, because tree and spec disagree" (`:95`), echoed in the Consequences row (`:235`). That is
a *landed* class producing a *repo CI* red at a commit, which is squarely what C-7 governs
(`REQ:264`–`:265`), and DECISIONS' conclusion — "class 6 must not land until erratum 6 has landed
upstream" — is verbatim the erratum's prescribed resolution ("the resolution is ordering … never
registration", `REQ:272`–`:274`). Applying F-01's wording change here would erase a distinction the
erratum was written to draw.

## Questions

| ID | Question |
|----|---------|
| Q-01 | v4's Q-02 is now answered upstream — the gated ATs are authored to become live with their class, never registered. Does that answer reach PROPERTIES as an authoring rule, or only as an ordering fact? Concretely: is AT-1.1 written once and gated by PLAN's class-7 edge (so it never executes on branch before class 7), or written and expected to fail until class 7? The erratum admits only the first. DECISIONS' `:150`/`:237` obligation sentences are consistent with the first reading; F-01's wording is the only thing pulling the other way. |
| Q-02 | The erratum says the resolution is ordering "where a check that observes a held class would otherwise run red **in repo CI**" (`REQ:272`–`:273`). AT-1.1 is a PROPERTIES-level acceptance test, not a repo CI job. Are the feature's own ATs in scope of that clause, or does it bind only the `pr-tests.yml`/`fixture-machine.yml` gate set? DECISIONS is where that distinction would land for PLAN; today neither document draws it, and the two answers imply different PLAN rows (a gated task versus a gated *and* CI-registered task). |

## Positive Observations

- **The erratum's central conclusion was already in DECISIONS, in almost the same words.** REQ now
  reads "The branch does not merge on a green subset: completion is all criteria satisfied at HEAD,
  held classes included" (`REQ:274`–`:275`); DECISIONS reads "the feature is not 'done' and the
  branch does not merge on a green subset" (`:237`). The compression was faithful before the
  erratum was written and stays faithful after it. This is the reason the round is a confirmation
  and not a reopening.
- **The erratum's positive licence for ungated classes is already carried, with the partition
  named.** "It does not forbid the ungated classes from landing as their own commits"
  (`REQ:269`) is DECISIONS' "Classes 1–5 are ungated and land on engineering's schedule; class 13
  is ungated too" (`:237`). The class-13 partition, added in v0.4 in response to my v3 finding, now
  turns out to be exactly the granularity the erratum needs.
- **No registered-failure shape exists anywhere in DECISIONS to be invalidated.** I searched the
  document for skip, pending, tolerated-red and expected-failure shapes: DEC-07 rejects "a
  re-measured expected value that greens by construction" (`:235`), cross-cutting rule 2 forbids
  deriving expected values from the tree, and no oracle cell registers a failure. The document is
  compliant with `REQ:270`–`:272` in substance even though it never cites C-8 (F-02).
- **Every mechanical claim I checked in v4 survives the erratum untouched.** The erratum changes no
  class ordering, no literal, no count and no criterion. The closure argument (FSPEC `:160`–`:165`),
  DEC-10's six-task edge set (`:171`), the M-8 host claim for DEC-09's surviving assertion, and the
  DEC-06 citation arithmetic all rest on FSPEC and on source anchors that this REQ edit does not
  touch. Nothing in the v4 approval's evidence base needed re-measuring for this round, and I did
  not re-litigate it.
- **The erratum improves testability rather than only clarifying prose.** Before it, "AC-1.1 stays
  red while classes are held" was a state with no named oracle disposition — the shape that
  produces a registered expected failure by default. The erratum converts it into an ordering
  constraint PLAN can express as a dependency edge and PROPERTIES can express as an AT that only
  ever runs green. That is a strictly more falsifiable arrangement.

## Decision

## Consequences

## Verdict
