# Cross-Review: product-manager — PLAN (Delta Confirmation)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-decision-ledger/PLAN-pdlc-decision-ledger.md (v0.8)
**Date:** 2026-08-29
**Iteration:** 9
**Scope:** Erratum delta-confirmation of the three routed items, plus a DEC-ERR-03 re-grounding sweep of the whole PLAN against upstream at HEAD.

## Upstream re-grounding (DEC-ERR-03)

All four dispatch pins were re-measured with `shasum -a 256` and match byte for byte:

| Document | Dispatch pin | Measured at HEAD | Match |
|---|---|---|---|
| REQ | `ce6b133f…3c7b7c` | `ce6b133f…3c7b7c` | ✅ |
| FSPEC | `2bd5c3ef…5aed39` | `2bd5c3ef…5aed39` | ✅ |
| TSPEC | `21c913b4…9c8e49` | `21c913b4…9c8e49` | ✅ |
| DECISIONS | `13aba061…4fb89a` | `13aba061…4fb89a` | ✅ |

One label note, not a finding: the dispatch prose calls the TSPEC pin "v1.0", but the document carrying `21c913b4…9c8e49` self-identifies as **v1.1**. The hash is authoritative and the author re-derived the round against v1.1 explicitly before touching any raised item (`PLAN`:19), which is exactly what DEC-ERR-03 asks for. The routed items survive the version move — TSPEC v1.1 §7.3 states the correction direction is "downstream-to-here, never the reverse" — so nothing routed was dissolved by the upstream advance.

## Routed-item disposition

| # | Routed item | Landed? | Evidence |
|---|---|---|---|
| 1 | T-10a conjunct 3 names FX-BASELINE referents TSPEC §7.2 retires | ❌ **No** | T-10a's row is not in this round's diff; `PLAN`:157 is byte-unchanged |
| 2 | PLAN contradicts TSPEC on census constants in six places | ✅ Yes | `PLAN`:19, :21, :158, :164, :213, :225, :494–505 |
| 3 | Census-constant home/cardinality wrong in five places | ✅ Yes | Same loci; six ∪ eight = fourteen throughout |

**Items 2 and 3 are fully closed and closed well.** These were the same correction from two directions, and the author took it all the way down. `DECISION_LEDGER_CENSUS_TOKENS` is now a test-file constant of `decisionLedgerCensus.test.js` at every site (T-11 `:158`, T-18 `:164`, both manifest rows `:213`/`:225`, the DoD bullet `:494`); T-18's production-declaration instruction is gone and replaced by an explicit "writes **no** census constant" statement with its §7.3 rationale; the partition reads six ∪ eight = fourteen everywhere it appears; the exempt list correctly loses exactly one member and stays at eight with no token member moving; and the v0.7 history entry is retained but stamped *superseded in part by v0.8*, so the fifteen-member reading survives only as history and never as contract. The TE F-03 tail — deleting the verbatim §7.3 sentence that justified the retired membership — landed too. I checked each of these against TSPEC §7.3's *The size of the owned list, stated once* and found no residual daylight.

**Item 1 did not land.** T-10a's row was never opened this round; the diff touches only the header pin, the revision history, T-11, T-18, the two manifest rows and the DoD bullet. The revision history is candid about this — "the only moved bytes are the census contract's three operands and their citations" (`PLAN`:23) — but the round was dispatched with three items, and this one is left exactly as the v8 round found it. See F-01.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Section anchor | Finding |
|----|----------|-----------|----------|---------|----------------|
| F-01 | High | delta | nonlocal | T-10a, conjunct 3 (`PLAN`:157) | Flag-off arm still names two referents TSPEC §7.2/§7.4 retire, leaving a P0 acceptance-test instruction unimplementable as written |
| F-02 | Low | delta | local | DoD census bullet (`PLAN`:494–499) and `PLAN`:21 | Single-siting claim contradicted by the same sentence that makes it |

### F-01 (High) — T-10a's flag-off conjunct still cites referents that do not exist

`PLAN`:157 states conjunct 3 as: the prompt is byte-identical to T-02's committed merge-base recording, "`report`'s key set is **set-equal** to the flag-off key set", and "`notices` is **set-equal** to the baseline notices array".

TSPEC §7.4 at HEAD defines the recorded stream as **"deliberately narrow: one case, `REVIEW-LOOP-REVIEWER-PROMPTS`, driving the exported `reviewLoop` directly and recording the reviewer-prompt streams"** — and gives the reason a whole-`main()` recording was rejected: it "would red on this feature's own intended additions (the new notices, the new report field)". So the fixture holds reviewer-prompt bytes only. There is no baseline notices array and no flag-off `report` key set anywhere in it.

TSPEC §7.2 anticipates this exact misreading and closes it in terms:

> Note the referent split, because it is easy to get wrong: §7.4's recording is cited for the **prompt** conjunct only. It records one narrow case driving exported `reviewLoop` and captures reviewer-prompt streams, never `report` keys … so it cannot serve as the key-set referent.

and supplies the two replacements the design actually wants:

- **Key set:** the `report` object the flag-off `main()` run itself returns has a key set whose **symmetric difference from the flag-on run's key set is exactly `{decisionLedger}`**, asserted as a set equality in both directions so a spuriously added *or dropped* key on **either** arm fails. The referent is the paired flag-off/flag-on runs inside the arm itself, not a stored artefact.
- **Notices:** the emitted `NTC-DECLEDGER-*` notice set is **set-equal to empty** — not set-equal to a recorded array.

The product consequence is not cosmetic. AT-04 / REQ-DECLEDGER-02 is the P0 guarantee that turning the feature off returns the reviewer experience to exactly its pre-feature state. T-10a is the only task that proves it on a live `main()` run. As written, an implementer reaching for "the baseline notices array" or "the flag-off key set" finds nothing in the fixture to compare against, and the likely recoveries are both bad: fabricate a second recording (which §7.4 rejects, and which would need re-transcribing mid-feature), or quietly weaken the conjunct to the `"decisionLedger" not in report` negative that TSPEC and the v8 round both specifically asked to be paired with a positive. Either way the strongest flag-off assurance the design has is lost at implementation time, and lost silently.

One wrinkle worth flagging for the author, because it may be what caused the miss: TSPEC §7.2 closes its conjunct-3 paragraph with "which is the form PLAN T-10a already states." That is upstream being generous — T-10a does **not** state that form, it states the retired one. The sentence is easy to read as "nothing to do here". It does not discharge the item; §7.2's normative body and §7.4's *Recorded stream* are unambiguous, and the PLAN is the stale side exactly as it was for the census items.

**Suggested fix**, confined to T-10a's conjunct 3, no other row affected: keep the prompt clause as-is; replace "`report`'s key set is set-equal to the flag-off key set" with the symmetric-difference-equals-`{decisionLedger}` form asserted in both directions against the arm's own paired flag-on run; replace "`notices` is set-equal to the baseline notices array, not merely free of `NTC-DECLEDGER-*`" with "the emitted `NTC-DECLEDGER-*` notice set is set-equal to empty". The AC traceability row at `PLAN`:436 and T-11's one-clause echo at `:158` both describe this arm loosely enough ("flag-off report/notices set equality", "a set-equality on the report's key set") that they stay true under the corrected wording and need no edit — worth confirming rather than assuming.

*Provenance note:* tagged **delta** because this is a routed item left unlanded, per the tagging legend, not because the round's bytes introduced it. **nonlocal** because T-10a sits outside every section this round edited.

### F-02 (Low) — "stated nowhere else" is contradicted in the same breath

The round adopts a single-siting discipline for the census arithmetic, which is the right instinct and is what makes the TSPEC §7.3 citation load-bearing. But three sites now assert the arithmetic lives elsewhere while writing it out:

- `PLAN`:21 — "The partition is **six ∪ eight = fourteen**, cited from TSPEC §7.3 and stated nowhere else in this document."
- `PLAN`:158 (T-11) — states "six ∪ eight = fourteen, cited from §7.3 and **not restated elsewhere in this document**".
- `PLAN`:494–499 (DoD) — writes "(**six**) ∪ … (**eight**) = … (**fourteen**)" and then parenthetically claims "(TSPEC §7.3, which is the sole home of that arithmetic; this bullet **cites it and does not restate it**)".

Each of the three claims to be the non-restating one. No reader is misled about the count — all three agree, and all three agree with §7.3 — so this is not a contract defect and is not gating. It is worth a light touch on the next pass because the self-refuting phrasing undercuts the very discipline the erratum was about: either drop the "stated nowhere else" clauses and let §7.3 be the cited authority, or genuinely reduce the restatement to one site. `Local` scope; no upstream implication.

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC §7.2 asserts "which is the form PLAN T-10a already states," which is not true of the PLAN's current bytes. Once F-01 lands, that sentence becomes accurate and needs no upstream change — but is it worth a one-line `ERRATUM: TSPEC` note so a future reader does not take §7.2's claim as evidence the PLAN was already conformant? Not gating either way. |

## Positive Observations

- The DEC-ERR-03 re-grounding is the strongest part of this round. Discovering mid-round that the pin had moved twice (v0.9 → v1.0 → v1.1), re-deriving before touching anything, and quoting §7.3's explicit correction-direction sentence to establish which side was stale is precisely the discipline that stops erratum rounds from ping-ponging against a moving upstream.
- Items 2 and 3 were closed at **every** locus, including the two easy-to-miss ones: the file-ownership manifest rows and the DoD bullet. A partial fix here would have left the wave gate red at batch 8 with a confusing diagnosis; this one will not.
- Marking the v0.7 entry *superseded in part* rather than deleting or silently rewriting it preserves the audit trail of a reversed decision. A future reader can see that fifteen was once believed and why it was abandoned — that is real traceability value, and it is not the path of least resistance.
- Reverting T-18's instruction is a genuine reversal of the author's own prior round, argued from upstream rather than defended. That is not easy to do and it is the right call.
- Dropping version labels from in-body citations while keeping the pin in the header row alone (the `pdlc-wave-resume` lesson) is a good structural fix — it removes a whole class of staleness that this feature has already been bitten by twice.

## Recommendation

**Needs revision**

One High finding, and it is a narrow one. Items 2 and 3 need no further work — I would ask that they not be reopened. The next revision needs exactly one edit: rewrite T-10a's conjunct 3 (`PLAN`:157) to TSPEC §7.2's two replacement referents as spelled out in F-01. F-02 is optional polish that can ride along in the same edit or be left alone.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 0, "low": 1}
