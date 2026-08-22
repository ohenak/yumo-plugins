# LEARNINGS — pdlc-learnings-injection

| Field | Detail |
|---|---|
| Feature | pdlc-learnings-injection |
| REQ | docs/pdlc-learnings-injection/REQ-pdlc-learnings-injection.md |
| Date Completed | 2026-08-21 |
| Total Iterations | REQ: 12, FSPEC: 15, TSPEC: 15, PLAN: 15, PROPERTIES: 15, DECISIONS: 9, REVIEW: 2, DoD: 2 |
| Upstream | REQ → FSPEC → TSPEC → DECISIONS → PLAN → PROPERTIES → IMPL |
| Harvested from | _(pending — filled in §6 pass)_ |
| Phases exercised | R, F, T, D, P, PT, IMPL, DOD, PR |
| DoD rounds | 2 |

## 1. Non-Convergences

Three halts, all `ERRATUM-PROTOCOL`, all on the delta-confirmation channel. The first two are the
**same failure mode two phases apart**; the third is a different class and should not be filed with
them.

| Phase | Reviewer | Issue | Resolution | Iteration Count |
|---|---|---|---|---|
| T (FSPEC erratum, v7) | se-review | Findings written as a markdown table with `delta`/`local` tags rendered *inside* the finding-text cell; **0** line-leading `FINDING:` lines. Non-approving + zero parseable lines → fail-closed synthetic `High \| delta \| nonlocal` → R4 halt. Both confirmers actually agreed on substance (E-13 provenance, AT-32 vacuous green); the disagreement was reviewer-vs-parser | FSPEC v0.7 (`fa229bde`): E-13 measured provenance restored to the two-repository scope, AT-32 gained a positive-presence conjunct, AC-6.2 row restored to `AT-31, AT-32`. Had the reviewer's own declared tags reached the parser the gate scores **R3** (one bounded follow-up). Systemic items 4–7 **deferred to harvest** | 7 of 15 |
| D (FSPEC erratum, v9) | se-review **and** te-review | Recurrence of the T failure mode, now on both channels at once. Both tagged their Highs `inherited` in prose/table cells only; fail-closed overwrote `inherited` → `delta` on both → R4 halt. Root cause named explicitly: *nothing was changed after the first occurrence* — engine, both review skills and `findingGrammarClause()` were byte-identical to what produced the T halt | Re-scored crediting the declared tags → **R2** (re-open FSPEC approval, no halt). Locus corrections landed as FSPEC v0.9 (`cbb0a63e`, `523e2df9`). Systemic items **escalated out of the harvest channel** and landed: engine restatement retry + prompt fix (`472e505c`), skill skeleton slot + Provenance/Locality table split (`42289c5e`, `d015ff89`), `check-finding-grammar.sh` lint (`eef6fedb`) | 9 of 15 |
| PR (PLAN erratum, v1.2) | pm-review **and** te-review | **Not** a channel failure — both confirmations well-formed, correctly tagged, cleanly parsed. The erratum edit described the *routed list* rather than the *commit*: it wrote "touched six test-side surfaces" (= 4+2 from the routed item's own sentence) where `git show --name-status 2fc6fcd3` lists **45 changed files**, 5 added files and 9 second writers. Two independent channels converged on the same subsection with the same arithmetic | v1.3 erratum: §Post-batch remediation re-derived from the commit (19 rows), `package.json` premise corrected in all three places, counts reconciled, pins refreshed. Logged as **a protocol success with a document defect** — no change to `erratumGateDecision`, `parseConfirmationFindings` or DEC-ERR-03 indicated. Routed `DEC-ORACLE-05`, `DEC-SEV-04` | 12 of 15 (PLAN v1.2 erratum) |

**The distance between "phase continues" and "phase halts" was four lines of text** (POSTMORTEM-D).
For an `inherited` finding, tagging *narrows* the reading from halting to non-halting — the exact
opposite of what `findingGrammarClause()`'s leniency sentence told reviewers. Both reviewers had
already done the expensive part (dating the drift to `c1180acb` / `386e4f0c`) and then dropped the
conclusion in the one place it was load-bearing, on advice that said it could not matter.

**Grammar conformance decayed rather than held**: 3–5 `FINDING:` lines per round at REQ v5–v7, then
zero on six consecutive rounds. Four approving near-misses (REQ v8, FSPEC v8 se, REQ v10, REQ v11
both channels) carried zero lines and passed ungated, because the fail-closed rule only inspects
**non-approving** confirmations. The signal was present four times and observable only at the halt.

## 2. Cross-Feature Patterns

## 3. Rejected Proposals (with rationale)

## 4. Process Learnings

## 5. Open Items for Consolidation

## 6. Approval Record
