# Cross-Review: software-engineer — REQ

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.1)
**Date:** 2026-08-28
**Iteration:** 2
**Scope:** delta re-review of `git diff 61332f990..HEAD` on the REQ; prior findings in
`CROSS-REVIEW-software-engineer-REQ-v1.md` re-checked, unchanged sections not re-litigated.

## Prior-Round Disposition

| Prior ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | G-1 now requires exactly two fields (id, one-line statement) plus a source citation, and drops "phase/round closed in" — the field no shipped record carries. Every id-bearing record does carry an id and a statement in its heading (`docs/_decisions/DECISIONS-review-severity-bars.md:88`, `docs/_decisions/DECISIONS-erratum-routing.md:12`). Residual granularity gap re-filed as F-01 below. |
| F-02 | High | **Resolved** | G-2 / REQ-DECLEDGER-03 are now explicitly reviewer-side prompt text with the cross-review artifact as the observable; "the driver never reads a decision id" is consistent with the corpus — no decision-id parse exists in `pdlc/workflows/orchestrate-dev.js` (only the `FINDING:` grammar at `:3375`, `:6606-6689`). |
| F-03 | High | **Resolved** | REQ-DECLEDGER-06 now states `DEC-LOOPECON-06`'s exact-match triple stays the sole driver-side key and names the two consumers, matching the shipped rule (`docs/completed/pdlc-loop-economics/DECISIONS-pdlc-loop-economics.md:163-173`, implemented `pdlc/workflows/orchestrate-dev.js:6740-6798`). |
| F-04 | Medium | **Resolved** | REQ-DECLEDGER-08 pins `review.derivativeStop` flat/non-flat classification as identical flag-on vs flag-off, closing the unspecified interaction. |
| F-05 | Medium | **Resolved** | "relevant to the document" replaced by G-1's derivable in-scope set; O-1 is now correctly scoped to omission only. |
| F-06 | Medium | **Resolved** | G-4 is demoted to non-binding rationale measured from committed `CROSS-REVIEW-*` artifacts, with no acceptance criterion. |
| F-07 | Medium | **Resolved** | NG-6 now says "no engine **runtime** changes" and admits the disclosure-test precedent; both cited files exist (`pdlc/engine/__tests__/learnings-config-example.test.js`, `pdlc/engine/__tests__/loop-config-example.test.js`). |
| F-08 | Low | **Resolved** | §1 now attributes `DEC-ERR-01` to `docs/_decisions/DECISIONS-review-severity-bars.md:88`, where it is in fact defined. |
| F-09 | Low | **Resolved** | §1 now marks `structure-directional-options-scoring` as belonging to the separate `regime-ledger` corpus, not this repository. |

All three round-1 High findings are resolved. The findings below are new, raised only against
sections the round-1→round-2 edit changed.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | The in-scope set is claimed derivable and its check pinned as **set equality** (REQ-DECLEDGER-01), but the unit slips between *record = file* and *record = decision*, and the corpus contains in-scope files that yield no line. G-1 scopes "every record under `docs/_decisions/`" — that directory holds 16 files, of which 4 carry zero id-bearing decisions (`CONSOLIDATION-PROPOSAL-2026-07-29.md`, `-2026-08-19-1.md`, `-2026-08-27-1.md`, `.consolidation-log.md`) and a fifth, `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md:1`, is a `DECISIONS-*` file with no decision ids at all. The feature-level half is no more uniform: of 11 shipped `docs/completed/*/DECISIONS-*.md`, 6 carry zero id-bearing entries (e.g. `docs/completed/pdlc-wave-resume/DECISIONS-pdlc-wave-resume.md:65` names ids only inside `### O-N` option headings; `docs/completed/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md:37` uses `### DEC-01` h3 ids). Meanwhile REQ-DECLEDGER-04's degradation says "where **one record of several** fails, **that line** is omitted" — one line per record — while G-1/REQ-DECLEDGER-01 say one line per *decision*, and `docs/_decisions/DECISIONS-review-severity-bars.md` alone holds 12. Two readings of the same P0 criterion give two different expected sets, so the set-equality expectation cannot be computed. This is an outcome question, not heading-grammar mechanics: state (a) whether the in-scope unit is the file or the individual decision, and (b) the stated outcome for an in-scope file that carries no id-bearing decision (contributes zero lines, and is that a fail-open case under REQ-DECLEDGER-04 or an ordinary empty result?). | G-1, REQ-DECLEDGER-01, REQ-DECLEDGER-04 |
| F-02 | Medium | Local | The declared `maxEntries` default (40) is already exceeded by the in-scope set on this branch before the feature ships: `grep -c '^## DEC-' docs/_decisions/*.md` sums to **41** project-level decision ids, plus whatever the feature's own `DECISIONS-{feature}.md` adds. So under C-5's own defaults the index omits lines on the very first enabled dispatch, and which lines are dropped is routed away to TSPEC (O-1) — against G-3's "a stale or wrong index is worse than none" framing, an index silently missing the decision a reviewer is about to re-open is the failure mode the feature exists to prevent. The measured count (41 today, monotonically growing) should inform A-1's vetoable default rather than the `learningsInjection` analogy alone. | C-5, O-1, REQ-DECLEDGER-07 |
| F-03 | Medium | Local | REQ-DECLEDGER-03's reviewer test is "cites evidence not part of that decision's **own record**", and its *out* exemplar is "a source the decision already cites" — but REQ-DECLEDGER-01 now states the line carries the id, the statement and a source citation, and "**no other field is required**", explicitly making the record's own citations optional in the rendered line. The reviewer is therefore asked to apply a test against data the index is not required to show, and must open the cited record file to apply it. That may be the intended outcome, but it is unstated: say whether the rule is applied against the rendered line alone (in which case the decision's own citations must be a required field when present) or against the source record the citation points at (in which case say so, since it makes every application of the rule a file read). | REQ-DECLEDGER-01, REQ-DECLEDGER-03 |
| F-04 | Low | Local | G-4's measurement basis is the committed `CROSS-REVIEW-*` artifacts "read against the decision ids in `docs/_decisions/`", but G-1's in-scope set is `docs/_decisions/` **plus** the feature's own `DECISIONS-{feature}.md`. A re-litigation of a feature-local decision would be indexed under G-1 yet invisible to G-4's measurement. Non-binding by design, so this is only a consistency nit between the two sets. | G-1, G-4 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Are the three `CONSOLIDATION-PROPOSAL-*.md` files and `.consolidation-log.md` under `docs/_decisions/` intended to be in scope at all? They live in the directory G-1 names but are proposals and a log, not closed decisions. |
| Q-02 | REQ-DECLEDGER-08 replays "one fixed set of reviewer outputs" twice. Since the flag also changes the dispatch prompt (REQ-DECLEDGER-01), is the intended reading that the replay holds reviewer output fixed *by construction* (a recorded fixture), not that a live reviewer would emit the same output either way? Stating that makes the criterion's oracle unambiguous without descending into test design. |
| Q-03 | Does an operator enabling `decisionLedger` on a repo whose feature `DECISIONS-*.md` files use `### DEC-NN` local ids (e.g. `DEC-01`, `docs/completed/pdlc-plugin-retirement/DECISIONS-pdlc-plugin-retirement.md:37`) get colliding index lines, or does O-3's uniqueness obligation cover the rendered index too? |

## Positive Observations

- The reviewer-side reframing of G-2 is the right call and is stated where it can be checked:
  REQ-DECLEDGER-08 makes NG-4 falsifiable by enumerating the driver-side outcomes that must be
  identical, and each named mechanism is real — `DEC-LOOPECON-06`'s triple
  (`pdlc/workflows/orchestrate-dev.js:6740`), the derivative-stop flat rule (`:6798`), the
  `DEC-ERRROUTE-01` mint (`docs/_decisions/DECISIONS-erratum-routing.md:12`), and the
  fail-closed read of a non-approving confirmation with no parseable `FINDING:` line
  (`pdlc/workflows/orchestrate-dev.js:6935`). A no-change guarantee written as a replay
  criterion over named mechanisms is far stronger than the round-1 prose.
- REQ-DECLEDGER-07 is now total over its boundary cases (zero in-scope decisions,
  `maxEntries: 0`, a single over-long line), and C-5 pins what `maxBytes` measures — the index
  block alone, not its contribution to dispatch size. That removes the most likely TSPEC-time
  reinterpretation.
- R-3 records the rejected alternative (driver-side scoring) *with the reason it was rejected*
  — the driver holds no decidable evidence-novelty predicate — rather than silently dropping it.
- The round-1 citation defects were fixed by re-pointing, not by deleting the claims: `DEC-ERR-01`
  now resolves (`docs/_decisions/DECISIONS-review-severity-bars.md:88`) and the `regime-ledger`
  corpus is attributed as external.

## Recommendation

**Needs revision**

One High finding (F-01). Concretely: REQ-DECLEDGER-01 pins the index check as set equality over
G-1's in-scope set, but the set's unit is stated two ways in the same document — per *decision*
in G-1/REQ-DECLEDGER-01, per *record file* in REQ-DECLEDGER-04's "that line is omitted" — and
in-scope files carrying no id-bearing decision (5 under `docs/_decisions/`, 6 of 11 shipped
feature `DECISIONS-*.md`) have no stated outcome. Fix by stating the unit and the empty-record
outcome as observable results; heading grammar stays TSPEC material. F-02 (the 40-entry default
is already below the measured 41 project-level ids), F-03 (the rule's test needs data the index
line is not required to carry) and F-04 are recorded, not gating.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
