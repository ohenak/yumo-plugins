# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-consolidation-agent/PROPERTIES-pdlc-consolidation-agent.md` (v1.3, 2026-08-09)
**Date:** 2026-08-09
**Iteration:** 4
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity. Delta re-review against v3 (`CROSS-REVIEW-product-manager-PROPERTIES-v3.md`); `git diff 6d6ce3cb..HEAD` on the document (79 insertions, 6 deletions). Every citation re-checked against HEAD.

## Prior findings disposition

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-08 — PROP-PASS-11's file is derived from its subject, not licensed by PLAN T20's text, while §12.2's derivation sentence claimed the whole table was read from PLAN | Medium | **Resolved** | Fixed on both halves, and fixed by disclosure rather than by moving the property. PROP-PASS-11's trailer now carries an explicit **Placement note** — "the file is derived from the property's subject — a whole pass — not from a PLAN block that declares it" — and states the trailer's `T20 → T31` is "this document's judgment pending that erratum" (`:1367-1371`). §12.2's preamble gains a paragraph naming **both** derived rows and separating them from the rest: PROP-PASS-01…05's row "*is* read from PLAN — T20's `T31` block enumerates AT-C1 … AT-C8 there (`PLAN:264`) — but PROP-PASS-11 is not", closing with "Every other row in this table is read from PLAN §4 directly" (`:1681-1688`). I re-verified the premise at HEAD: PLAN T20's `T31 — pass lifecycle` block still closes its unregistered list at "(i) … only remaining unregistered obligation in this row" (the unreadable-corpus-entry case PROP-COR-09 owns), and PLAN T23 still declares release-across-terminal-statuses, neither arm the no-op pass. The AC-1.4 gap is now routed as **erratum 7** (`:1919-1927`) rather than absorbed. |
| F-09 — §12.2 and §12.3 carry different green lists for T24 and T15, explicable but unexplained | Low | **Resolved** | §12.3's preamble gains the task-axis union rule (`:1728-1737`): a task's green list is the union over every property filed under it including spanning properties whose other home is another task's file, so it may exceed the §12.2 row for the same task's file. Both divergences are named with their carrier — T26 on `T24` from PROP-MRG-03, T28 on `T15` from PROP-ID-03 — and the rule is stated as a checkable obligation ("a §12.3 green absent from the matching §12.2 row must be traceable to a named spanning property"). I checked that obligation exhaustively rather than taking it: comparing all 18 rows of §12.2 (`:1698-1716`) against §12.3 (`:1738-1762`), T24 and T15 are the **only** two rows where the task green list exceeds its file's, and both are the named ones. The claim is exhaustive, not illustrative. |

## Findings

None. Both prior findings are resolved, and the revision introduces no new product-lens defect.

I scanned only the changed sections, per the delta protocol: the v1.3 changelog (`:16-30`), §4.3's fixtures-directory correction (`:446-449`), PROP-PASS-11's placement note (`:1367-1371`), §12.2's derived-rows paragraph (`:1681-1688`), §12.3's union-rule paragraph (`:1728-1737`), §12.4's AT-C and AT-P cells (`:1774-1775`), erratum 3's parenthetical (`:1877-1879`), and errata 6 and 7 (`:1896-1927`). Every factual claim added in this revision is grounded at HEAD and correct — see Positive Observations for the checks. Nothing added asserts behaviour REQ does not ask for, and no acceptance criterion lost a property: the id set is byte-identical to the reviewed base at 118 ids (`git show 6d6ce3cb:… | grep -oE 'PROP-[A-Z]+-[0-9]+' | sort -u` diffs empty against HEAD), so the coverage this document promised at v1.2 is exactly the coverage it promises now.

One product judgement worth stating explicitly rather than filing as a finding: §12.4's AT-P cell now qualifies the single-file invariant instead of asserting it (`:1775`). A weaker stated invariant would normally be a step backwards. Here it is the opposite — the invariant was **false** as stated at v1.2, and the honest cell plus erratum 6 is what makes the falsity visible to the Phase I implementer who would otherwise have written AT-P6 and AT-P10 into a file where they cannot pass. Disclosure of a real upstream gap is not a coverage regression, and the two ids remain discharged at L2 by PROP-COR-10 and PROP-COR-11 throughout.

## Questions

None. Q-01 and Q-02 were answered in the artifact at v1.2; Q-03 (v3) is subsumed by erratum 7, which now states the same gap as a routed upstream defect rather than an open question.

## Positive Observations

- **Erratum 6 is the round's real contribution, and it survives grounding on every leg.** The claim is that AT-P6 and AT-P10 are registered to a file whose subject cannot reach them. All four legs check out at HEAD: TSPEC §12.3's `consolidationPredicate.test.js` row is L1 and does carry `AT-P1 … AT-P6, AT-P8 … AT-P11` (`TSPEC:2499`); PLAN T14's `T25 — corpus and predicate` block enumerates the same ids (`PLAN:258`); AT-P6's *Then* is "the consumed pair is still appended, **empty**, before any other record" and AT-P10's is "the §10.4 report names the collision explicitly" (`FSPEC:2119`, `:2123`) — both whole-pass writes; and `classifyCorpus` is declared pure, returning `basenameCollisions` "reported by §7.9 and never repaired", with no append and no render in its five-step algorithm (`TSPEC:674`, `:750-770`). A pure predicate cannot produce either observable. This is a defect that would have surfaced as two red tests on correct code in Phase I, caught one layer early.
- **The erratum refuses the cheap fix and says why.** It would have been easy to absorb this the way PROP-TRG-03/06 absorb AT-C5/C6/C7 — cite the obligation, drop the id. The document works out that doing so would leave AT-P6 and AT-P10 with **no** property discharging them at T14, since PROP-COR-01/04/05/06 cover AT-P1…P5, P8, P9, P11 only (`:1888-1892`). Declining a fix that would have quietly reduced acceptance-criteria coverage, and showing the arithmetic that makes it a reduction, is exactly the reasoning I want to see at this layer.
- **Erratum 7 correctly identifies that the gap predates the re-home.** The valuable sentence is "no PLAN block declares AC-1.4's no-op case at all, before or after the v1.2 re-home; the earlier homing merely hid it behind a file that was wrong for other reasons" (`:1921-1923`). That reframes my F-08 accurately — I had read it as a placement problem, and it is an upstream declaration problem — and the proposed PLAN correction is concrete enough to action verbatim: name a third unregistered obligation (no-op terminal status, consumed pair written, no PR, no proposal file) and restate the "only remaining" sentence to cover both.
- **The §12.3 union rule is exhaustively true, not just plausible.** I compared all 18 file rows against all task rows. Exactly two tasks carry a green their file's row does not — T24 (T26, from PROP-MRG-03, whose other home `consolidationIdentity.test.js` carries T26) and T15 (T28, from PROP-ID-03, whose other home `consolidationRoute.test.js` carries T28) — and those are precisely the two the preamble names. Every other row matches its file exactly. A stated invariant that holds under mechanical check is worth more than the two divergences it explains.
- **§4.3's correction is verified rather than asserted, and it narrows the ask.** `git ls-files pdlc/workflows/__tests__/fixtures/` returns 36 tracked files at HEAD, so the directory does exist; the document's "20+ files, including `completeness/`, `covered-violations/` and `digest-vectors.js`" is accurate and conservative. The consequence is handled correctly on both sites (`:446-449`, `:1877-1879`): the new thing is the file, the missing thing is PLAN §5's manifest row, and the pathspec-scoped-commit hazard that made erratum 3 matter is unchanged.
- **The changelog's invariant claim is true and cheaply checkable.** "Three fixes, no property moved and no id reassigned" (`:17`) holds exactly — 118 distinct ids at `6d6ce3cb` and at HEAD, set difference empty. Three consecutive rounds of restructuring with a stable id set means the traceability tables downstream readers depend on have not silently drifted under them.
- **Findings were resolved by routing, not by folding.** Both round-3 findings and both SE findings produced either a disclosure in this document or an erratum aimed at the document that actually owns the defect. Nothing was fixed by quietly editing a claim to match the document in hand, which is the failure mode this layer is most exposed to.

## Recommendation

**Approved**

Both open items from v3 are resolved, the revision introduces no new product-lens defect, and nothing in it weakens a previously-approved section: coverage is unchanged at 118 ids, no property moved, and the two tables I re-derived by hand agree with the trailers and with each other. The document is product-complete for Phase PR.

Three upstream gaps this document correctly declines to fix itself are routed as errata in my response trailer, for TSPEC and PLAN respectively. They are Phase I hazards, not PROPERTIES defects: left unfixed, PLAN T14 would have an implementer write AT-P6 and AT-P10 into a pure-predicate suite that cannot observe them, PLAN T20 would leave AC-1.4's no-op pass undeclared by any RED block, and PLAN T04's manifest row would let a wave commit drop the fixture PROP-COR-12/13 depend on. Each needs to land before Phase I dispatches the affected task.

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:8c8a4024ae87d944e105e9dad771c7dc1469fa006fdbd922beb065921466e4ac
REVIEWED-COMMIT: c568c4c3e1404bc9425ca6ee3003bb8e92fc01b0
