# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` (v1.3)
**Date:** 2026-08-11
**Iteration:** 3
**Scope:** Delta re-review of v1.2 (`07bb1b0a`) against my own `CROSS-REVIEW-product-manager-DECISIONS-v2.md`. Product lens only — traceability to REQ v0.10 / FSPEC v1.5, scope compliance, acceptance-criteria fidelity. Changed sections only; sections approved in rounds 1–2 are not re-litigated.

## Prior findings disposition

Diff reviewed: `git diff 07bb1b0a..HEAD -- docs/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` — 30 changed lines across four places: the Cross-Reviews lineage row, the version/change-note header, DEC-ENG-03's authority paragraph, and one deleted bullet in §8's standing-costs list. Commits `d02d764e` and `4c89a75a`. No other entry, alternative table or consequence row moved, and I confirmed that by reading the diff rather than trusting the change note.

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | Medium | **Open, carried forward** | §8's row still reads "containment test asserts every skill-identifier literal in either module is a member of the union (no exemption list)" unqualified (`DECISIONS:846`). The v1.3 change note states plainly that nothing outside DEC-ENG-03 and the §8 bullet changed, so this is deliberate deferral, not oversight. The evidence I cited last round still stands at HEAD: `meta.name = "orchestrate-dev"` (`pdlc/workflows/orchestrate-dev.js:3316`) and `meta.name = "orchestrate-queue"` (`pdlc/workflows/orchestrate-queue.js:45`) are skill-identifier-shaped literals that are not union members. Non-gating; restated below as F-01. |
| F-02 | Medium | **Resolved — by upstream landing, not by rewording** | I asked for "reported at startup" to move to the upstream side of DEC-ENG-03's split. The revision instead kept it local *and* obtained the authority for it: C-11 (`REQ-pdlc-headless-engine.md:284`, v0.10) states the precondition is "observed once at startup rather than discovered per dispatch" and explicitly leaves "how the observation is made, the refusal string and where it sits among startup checks" to FSPEC and TSPEC. That is a better resolution than the one I proposed — the retained half is now cited, not assumed. |
| F-03 | Low | **Open, carried forward** | DEC-ENG-13's §8 row still does not draw the suite-runner-output boundary; DEC-ENG-10's filtered-run skip reason remains unclassified against the operator-visible-string catalogue. Untouched in v1.3 by design. Non-gating; restated below as F-02. |
| Q-01 | — | **Half answered at HEAD** | The REQ erratum landed: C-11 exists at `REQ:284-298`, REQ header shows v0.10 (`REQ:20`), commit `6ff9871a` "REQ v0.10 — C-11 authorises the interpreter precondition". The FSPEC erratum has **not** landed: `grep -inE "python\|interpreter"` over `FSPEC-pdlc-headless-engine.md` returns zero hits at HEAD. DEC-ENG-03 now says exactly this and nothing more. Re-emitted as an FSPEC erratum below. |
| Q-02 | — | Not re-raised | The O-ENG-T5 time-box question stays an open question, appropriately. |

Both round-1 Highs remain closed. The revision introduced no new High, and I found nothing it broke.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **Carried forward unchanged from v2 F-01: §8's "no exemption list" claim is stated without the scoping that makes it true.** DEC-ENG-05's body scopes the containment predicate to four positions (dispatch call site, `PHASE_DISPATCH` role field, `skill:` field, bound module-local constant), but §8's summary row (`DECISIONS:846`) drops the scoping and reads as a position-free "every skill-identifier literal is a member" predicate. That predicate is red at HEAD — `orchestrate-dev.js:3316` and `orchestrate-queue.js:45` both bind `meta.name` to a skill identifier that is not a union member. The consequence claim ("a new dispatch site naming a skill the modules do not export fails") holds only for the four idioms; a fifth idiom escapes silently. Fix costs one clause in the §8 row: name the four positions and state the re-evaluation trigger. This is a summary-fidelity gap, not a decision defect — the entry body is already correct. | REQ AC-3.5 (`REQ:499-516`); FSPEC BR-START-4 |
| F-02 | Low | Local | **Carried forward unchanged from v2 F-03: DEC-ENG-13's operator-visible-string catalogue has no stated boundary against suite-runner output.** §8's DEC-ENG-13 row enumerates the strings DEC-ENG-03 and DEC-ENG-04 introduce and binds them to a once-per-suite emit obligation. DEC-ENG-10's filtered-run step 4 prints a skip reason into the run summary; whether that is a catalogue member or test-harness output is unstated. Either answer is defensible — one clause fixes it, and PLAN needs the answer to know whether the filtered-run skip line carries a catalogue id. | FSPEC BR-START-2; AC-6.1 |

Neither finding gates. Both are one-clause edits in §8 and can be folded into the PLAN hand-off rather than costing another DECISIONS round.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The FSPEC half of DEC-ENG-03's authority is still outstanding at HEAD (zero hits for `python|interpreter` in FSPEC v1.5). DEC-ENG-03 is honest about this and the decision it records does not depend on it. But C-11 closes with "Which interpreters satisfy the precondition, how the observation is made, the refusal string and where it sits among startup checks are FSPEC's and TSPEC's to specify" (`REQ:284-298`) — so REQ has now explicitly delegated four sub-questions to a document that mentions none of them. Does Phase D close with that delegation open and PLAN inheriting it, or does the FSPEC erratum land first? I have re-emitted it either way; the answer is the orchestrator's, not this document's. |
| Q-02 | §8's standing-costs list lost its DEC-ENG-14 bullet in `4c89a75a` as a dedupe. I verified the survivor is the stronger statement — "Two concurrent runs are not merely undetected but undisclosed: nothing the operator reads mentions the gap" (`DECISIONS:859`) strictly contains the deleted "remain undetected" line, so nothing was lost. Worth confirming the dedupe was deliberate in that direction rather than a keep-first accident, because the two lines are not interchangeable: the survivor is the one that names the disclosure gap C-5's spirit cares about. |

## Positive Observations

- **The correction is self-reporting about being half wrong, in the change note itself.** v1.2 claimed "zero hits in both" REQ and FSPEC; v1.3's header says that claim "was half false" and names which half. A document that opens by stating its previous version's error is worth more to the next reader than one that quietly reads correct — and it is the second time this document has done it.
- **The resolution of my F-02 is better than the fix I asked for.** I proposed moving "reported at startup" to the upstream side of the split. The author instead got the authority landed (C-11) and kept the half local with a citation. Same honesty, less deferral, and the decision now stands on a constraint rather than on a promise — verified at `REQ:284-298`, `REQ:20` (v0.10), `6ff9871a`.
- **The conditional framing survived its own good news.** The easy failure mode after an upstream erratum lands is to relax the whole paragraph. DEC-ENG-03 relaxes exactly the REQ sentence and leaves the FSPEC sentence explicitly outstanding with a re-run of the grep as evidence. I re-ran it; still zero.
- **The lineage row correction is small and real.** `CROSS-REVIEW-{software-engineer,…}` → `{product-manager,test-engineer}` matches what exists on disk: there are pm and te DECISIONS cross-reviews and no software-engineer ones. Provenance rows that name reviewers who never reviewed are how approval records go wrong at harvest.
- **The change note's scope claim is accurate.** "No other entry, alternative or consequence table changed" — the diff confirms it exactly. A scope claim that survives a diff check is what makes delta re-review cheap for the next round.

## Recommendation

**Approved with minor changes** — no High findings, open or new. The one blocking-class concern from earlier rounds (DEC-ENG-03 originating a host precondition it had no authority for) is fully closed: the authority landed as C-11 in REQ v0.10 and the entry cites it, while the still-unauthorised FSPEC half stays explicitly conditional with re-verified evidence. The revision broke nothing — I checked all four changed places against HEAD and the §8 deletion removed a strictly weaker duplicate.

Two Medium/Low findings carry forward from v2, both untouched by design and neither gating:

1. **F-01** (Medium) — qualify §8's "no exemption list" row with DEC-ENG-05's four-position scoping and a re-evaluation trigger (evidence: `orchestrate-dev.js:3316`, `orchestrate-queue.js:45`).
2. **F-02** (Low) — one clause stating whether DEC-ENG-10's filtered-run skip reason is inside or outside DEC-ENG-13's catalogue.

Both are one-clause edits in §8. My recommendation is to fold them into the PLAN hand-off rather than spend a fourth DECISIONS round on them; the decisions themselves are settled and the entry bodies are already correct.

One dependency remains open and is upstream's state, not this document's: the FSPEC EC row for the interpreter precondition. Re-emitted as an erratum in the response trailer.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:a55bd7b4160bd8dc9367e0d512aef0efa0a7503441b1207fbcd95f8a78303371
REVIEWED-COMMIT: 4c89a75aff43be09dade15f96430b7cc6fbd0470
