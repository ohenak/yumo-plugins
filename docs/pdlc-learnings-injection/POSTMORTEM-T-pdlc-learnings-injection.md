# POSTMORTEM — Phase T — pdlc-learnings-injection

**Halt class:** ERRATUM-PROTOCOL
**Halt reason (verbatim):** Phase T halted: delta confirmation for the FSPEC erratum round was not approved — non-approving: [se-review].
**Date:** 2026-08-19
**Branch:** `feat-pdlc-learnings-injection`

## Phase

Phase T (technical specification), FSPEC erratum delta-confirmation round. The erratum under confirmation is commit `4857352e` (`FSPEC-pdlc-learnings-injection.md` v0.5 → v0.6), which landed three routed items:

| Routed item | Substance |
|---|---|
| G-1 | `"no configuration change required on a repository that already has LEARNINGS files"` contradicted AC-5.1a's §4.1 default-enabled state — FSPEC read as opt-in |
| E-13 | `(measured: occurs at HEAD)` provenance claim challenged as unobserved |
| BR-14 | `parseAdvisoryConfig` contrast cited `ADVISORY_DEFAULTS.enabled` as `false`; the stated divergence does not exist as reasoned |

The erratum edit landed all three. The halt is not about the edit's content: it is about the **channel** one confirmer answered on.

## Iterations

- FSPEC cross-review iterations v1–v6 (ordinary review loop, both reviewer lenses).
- **v7 — the halting round.** Erratum delta confirmation on `4857352e`, dispatched to both confirming channels under DEC-ERR-03.
- Follow-up budget for this erratum: unspent at halt time.

Prior context on the same branch: the REQ v8 delta confirmation (`e7219184`, `d6de2242`) was the immediately preceding erratum round. `CROSS-REVIEW-software-engineer-REQ-v8.md` also carried **zero** parseable `FINDING:` lines and escaped the fail-closed rule only because it was approving (`VERDICT: Approved with minor changes`); an approval is not silence, so no synthetic finding was minted. That was a near-miss two rounds before this halt, on the same channel, with the same shape.

## Reviewers

| Channel | Verdict | Parseable `FINDING:` lines | Gate contribution |
|---|---|---|---|
| te-review (`CROSS-REVIEW-test-engineer-FSPEC-v7.md`) | Approved with minor changes | 2 — `Medium \| delta \| local` (E-13), `Medium \| delta \| local` (AT-32) | Non-gating; recorded |
| se-review (`CROSS-REVIEW-software-engineer-FSPEC-v7.md`) | Needs revision | **0** | Fail-closed synthetic `High \| delta \| nonlocal \| (untagged confirmation)` → **R4 halt** |

`se-review` did write its findings — as a markdown findings table (`| F-01 | High | Local | …`), with the provenance and locality tags rendered as prose *inside* the finding-text cell (`` `delta` `local` — E-13's provenance is now false in the opposite direction ``). That is semantically complete and mechanically invisible: `erratumGateDecision` parses line-leading `FINDING:` grammar, not table cells.

## Pattern of Disagreement

**There is essentially none on substance.** Both confirmers converged on the same two defects in the same erratum:

| Defect | se-review | te-review | Agreement |
|---|---|---|---|
| E-13 provenance overshot into `(declared; not seen at HEAD)`, contradicting BR-4's measured two-repository 89-document basis (`regime-ledger` carries real free-text `Date Completed` values) | F-01, High, delta, local | F-01, Medium, delta, local | Same defect, same direction, same fix shape; **severity differs one notch** |
| AT-32 / AC-6.2 area of the new default-enabled oracle | F-02, Medium — AC-6.2 traceability row narrowed to `AT-31`, under-reporting coverage | F-02, Medium — AT-32 compares against a live enabled sibling with no positive-presence conjunct, so it passes vacuously | Adjacent defects in the same rework, both Medium, both cheap |

Both confirmers also agreed the routed items **landed** (3/3 present) and that the G-1 and BR-14 corrections are right. The only real divergence is one severity notch on E-13 — and even se-review tagged that finding `local`, not `nonlocal`.

The disagreement that actually halted the phase is therefore between `se-review` and the **parser**, not between the two reviewers.

## Best-Guess Root Cause

The gate is fail-closed by design: a non-approving confirmation with no parseable `FINDING:` line is credited with a synthetic `{High, delta, nonlocal}` finding, which is R4 → halt. That rule fired exactly as specified. The defect is upstream of it.

1. **Two competing output shapes are both in scope for the same reviewer.** The se-review skill teaches an ordinary review-loop findings **table** (used in v1–v6 of this very document) and, in a separate later section, an erratum-round `FINDING:` **line grammar**. On an erratum dispatch the reviewer reached for the shape it had used six times on this document and tagged inside it. The line grammar is an *addition* to the review contract that looks like a *restatement* of it.
2. **The dispatch clause understates the consequence.** `findingGrammarClause()` says an untagged finding "is not an error… tagging can only ever widen the outcome, never narrow it." Read from the reviewer's seat, that is permission to skip. It is true for an *approving* confirmation and false for a non-approving one, where zero lines is the difference between one bounded follow-up round and a POSTMORTEM halt. The clause never names that consequence.
3. **Nothing checks the confirmation before the gate scores it.** There is no pre-return, pre-commit, or dispatcher-side lint asserting "non-approving confirmation ⟹ ≥1 parseable `FINDING:` line." The first thing that notices the missing grammar is the rule that halts the phase, at which point the cheapest possible fix (restate two rows as two lines) costs a full postmortem-and-recovery cycle.
4. **Consequence of 1–3, quantified.** Had se-review emitted its own declared tags — `High | delta | local` — the gate would have scored R3 (`highDelta.length > 0`, `allLocal === true`, follow-up budget unspent): one bounded follow-up round, no halt. The halt is a pure formatting artifact costing one wave.

## Recommendation

**Immediate (unblocks this phase, no substantive rework):**

1. Re-run the erratum confirmation gate for the FSPEC v0.6 round, crediting se-review's own declared tags (`F-01: High | delta | local`, `F-02: Medium | delta | local`). That resolves to R3 — one bounded follow-up erratum, scoped to the sections `4857352e` touched.
2. That follow-up erratum carries exactly three edits, all agreed by both confirmers:
   - **E-13** — restore measured provenance, scoped per repository: free-text-suffixed `Date Completed` values do occur at HEAD in BR-4's two-repository corpus (`regime-ledger/docs/completed/02-macro-prediction/LEARNINGS-macro-prediction.md`, `…/78-structure-options-scoring/LEARNINGS-structure-options-scoring.md`); the routed premise held only for the 9 `yumo-plugins` documents.
   - **AT-32** — add a positive-presence conjunct (the three default-enabled compositions must *contain* the delimited block naming its source document path, per C-4 / AC-1.1), closing the vacuous-green shape.
   - **AC-6.2 traceability row** — restore `AT-31, AT-32`.
3. Do **not** reopen the default-enabled rework. Both confirmers approved the G-1 and BR-14 corrections and the AT-31/AT-32 split.

**Systemic (prevents recurrence):**

4. **Engine — bounded restatement retry before fail-closed.** In the erratum gate path, when a confirmation is non-approving and yields zero parseable `FINDING:` lines, issue one single-turn re-dispatch asking the confirmer to restate its existing findings in the grammar (no re-review, no new reading). Synthesize the `{High, delta, nonlocal}` finding only if the retry also returns nothing. Silence still halts; a formatting slip costs one turn instead of one wave.
5. **Skill — make the shapes mutually exclusive on erratum rounds.** In `se-review/SKILL.md` and `te-review/SKILL.md`, state in the *Delta Re-Review Protocol* section (not only in the later erratum section) that on an erratum confirmation the findings table is **not** a substitute for the grammar, and require one `FINDING:` line per findings-table row under a literal `## Delta-Confirmation Findings` heading immediately above `## Verdict`. `CROSS-REVIEW-test-engineer-FSPEC-v7.md` is the conforming exemplar; cite it.
6. **Prompt — name the consequence.** Amend `findingGrammarClause()` so the leniency sentence is conditioned: tagging widens the outcome for approving confirmations, but a *non-approving* confirmation with zero `FINDING:` lines is read as `{High, delta, nonlocal}` and **halts the phase**.
7. **Cheap mechanical guard.** Add a check (PostToolUse hook or dispatcher-side lint on the written cross-review file) that warns when a `CROSS-REVIEW-*` file whose verdict is not an approval, written during an erratum round, contains zero line-leading `FINDING:` occurrences. This catches the REQ v8 near-miss class as well as this halt.

## Traceability

| Artifact | Reference |
|---|---|
| Erratum under confirmation | `4857352e` — FSPEC v0.6 |
| Confirmations | `3c348b2b` (te-review v7), `c45b064d` (se-review v7) |
| Gate rule that fired | `erratumGateDecision` R4, fail-closed branch (`ERRATUM_FAIL_CLOSED_SECTION`) |
| Governing decision | DEC-ERR-03 (`docs/_decisions/DECISIONS-review-severity-bars.md`) |
| Prior near-miss | `CROSS-REVIEW-software-engineer-REQ-v8.md` — 0 `FINDING:` lines, approving, ungated |
