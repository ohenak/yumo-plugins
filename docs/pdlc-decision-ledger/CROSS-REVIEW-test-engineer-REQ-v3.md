# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/REQ-pdlc-decision-ledger.md` (v1.2, `ba52b2460`)
**Date:** 2026-08-28
**Iteration:** 3
**Scope:** Delta re-review over `CROSS-REVIEW-test-engineer-REQ-v2.md`. Diff base `34beffcbc` (v1.1, the bytes v2 reviewed) → `ba52b2460`. Changed sections only: header table, §2 G-1/G-2/G-4, §4 C-5, §5 REQ-DECLEDGER-01/03/04/06/08, §6 R-5, §7 O-1, A-1. Unchanged sections already approved in v2 were not re-litigated.

## Round-2 finding disposition

| v2 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-12 | High | **Not resolved (re-filed as F-16)** | The edit replaced the per-file scope rule with a per-decision one — right direction — but the rule now turns on "whatever carries the id (heading or bullet)" while O-1 routes *"which id carriers are recognised"* to TSPEC. AC-01 still promises set equality. The load-bearing exemplar is also false at HEAD (see F-16). Expected set at HEAD is still reader-dependent: 41, 46 or 48. |
| F-13 | Medium | **Resolved** | REQ-DECLEDGER-06 now names one observable — "**The observable is the prompt text**, as in REQ-DECLEDGER-03; the reviewer's prose is the intended effect, not an asserted outcome." A tester now asserts against rendered prompt text and nothing against generated prose. The `DEC-LOOPECON-06` reconciliation survived intact. |
| F-14 | Medium | **Resolved** | Two halves both landed: AC-01's set equality is now explicitly over the **rendered** set ("the in-scope set after REQ-DECLEDGER-07's budgeting"), and C-5's `maxEntries` moved `40` → `60` with a HEAD-measured rationale, so the default no longer drops a line on day one. A-1 and R-5 were re-split accordingly (`maxEntries` measured, `maxBytes` still an analogy) rather than left claiming both are unmeasured. The residual is narrower and non-gating — see F-18. |
| F-15 | Low | **Resolved** | G-2's heading now reads "one key with G-1 — C-3", so no TSPEC reader can infer a fourth switch behind "requires G-1"; it points at the enumeration that forbids one. |

**Verification of new/changed claims against HEAD (not against the document):**

- C-5's "41 ids under `docs/_decisions/`" — confirmed for the **heading-only** reading: `grep -rhoE '^#{1,6} +DEC-…' docs/_decisions/*.md` = 41.
- C-5's "largest feature record (14)" — confirmed: `docs/completed/pdlc-headless-engine/DECISIONS-pdlc-headless-engine.md` carries 14 `## DEC-` headings, the maximum across all non-project `DECISIONS-*.md`.
- G-1's "at HEAD `DEC-AWG-Q1`…`Q5` are bullets in `DECISIONS-advisory-wave-gate-questions.md`" — **not confirmed; false at HEAD** (F-16).
- REQ-DECLEDGER-04's re-pointed `learningsInjection` fail-open precedent and NG-6's engine precedents were verified in round 2 and are untouched by this diff.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-16 | High | Local | **The new per-decision scope rule still does not yield one derivable expected set, and its load-bearing HEAD exemplar is false — so AC-01's set-equality oracle remains unwritable without reading the implementation.** Three defects compound. (a) *The exemplar does not exist at HEAD.* G-1 asserts "at HEAD `DEC-AWG-Q1`…`Q5` are bullets in `DECISIONS-advisory-wave-gate-questions.md`". They are not. `grep -n 'DEC-AWG' docs/ pdlc/` returns exactly **one** hit in the whole repository: `docs/_decisions/DECISIONS-advisory-wave-gate-questions.md:14`, a prose sentence — "(DEC-AWG-Q1…Q5 map onto Q-1…Q-5 below)" — using an ellipsis range that no id matcher expands into five ids. The bullets themselves are `- **Q-1**` … `- **Q-5**` (`:19`, `:59`, `:84`, `:99`, `:132`) and carry **no** `DEC-` id. So the one worked example given for the bullet carrier, and for the disposition of the file v2 asked about, is not reproducible: a tester following G-1 gets 0 decisions from that file, not 5. (b) *"Whatever carries the id" sweeps in citations, not just records.* At HEAD, `DEC-` ids appear in prose and table cells that cite *other files'* decisions: `DECISIONS-review-severity-bars.md:331` names `DEC-ROUNDS-02` — which has **no record anywhere in the repo**, only that mention — and `:402` names `DEC-ORACLE-05`, whose record lives in a different file (`DECISIONS-test-oracle-mechanics.md:106`); `.consolidation-log.md:170` carries `DEC-CONV-01`, `DEC-SEV-01/02/03`, `DEC-LAYER-01`, `DEC-ERR-01/02/03`, `DEC-DOC-01`, `DEC-FRZ-01` inside one table cell; all three `CONSOLIDATION-PROPOSAL-*.md` carry ids likewise. G-1 says a *record* is in scope when it "carries a decision id", but never distinguishes carrying from citing, so the four heading-less files v2 asked to dispose of are **not** disposed of by the new "a file with no decision id contributes zero lines" clause — every one of them carries ids. Counts at HEAD: heading-only **41**; +AWG bullets **46** (were they real); any-mention **48** unique ids. (c) *The document's own arithmetic picks reading (a) while its rule states reading (b).* C-5 derives `maxEntries` from "41 ids under `docs/_decisions/`" — the heading-only count — which is inconsistent with a rule that admits bullets and mentions. Fix at REQ altitude, one paragraph: state the black-box predicate that distinguishes a decision record from a citation of one (e.g. "a decision is in scope where its id opens the line that states it — a heading or a bullet whose first token is the id; a line that merely mentions an id defined elsewhere is a citation, not a record"), replace the false `DEC-AWG` exemplar with one that exists (any `## DEC-…` heading), and state which side the three `CONSOLIDATION-PROPOSAL-*.md` files and `.consolidation-log.md` fall on. Until then, two testers derive two expected sets and the only way to green a set-equality check is to read the renderer — the implementation echo AC-01's own wording forbids. | §2 G-1; §4 C-5; §5 REQ-DECLEDGER-01; §7 O-1 |
| F-17 | Medium | Local | **The stated id grammar and the stated exemplar contradict each other, so the membership regex is undecidable.** G-1 pins the convention as `DEC-{NAMESPACE}-{NUMBER}`, then illustrates it with `DEC-AWG-Q1`…`Q5`, whose final segment is `Q1` — not a number. HEAD contains both shapes of segment in practice, so a tester cannot tell whether the matcher is `\d+` or `[A-Za-z0-9]+`, and the two differ on real ids. This is separable from F-16: even after the carrier question is settled, the id *shape* still needs one grammar the test can transcribe literally. Either widen the stated convention to the alphanumeric form or drop the `Q1` exemplar; do not leave both. | §2 G-1; §7 O-3 |
| F-18 | Medium | Local | **AC-01's set equality is now over the rendered set, but the rendered set is not derivable at REQ altitude when the bounds bite.** AC-01 says the expected index is checkable as set equality "over the **rendered** set: the in-scope set after REQ-DECLEDGER-07's budgeting", while O-1 routes *which lines are omitted* under `maxEntries`/`maxBytes` to TSPEC. For any fixture that exceeds a bound, the expected set therefore comes from TSPEC's omission rule, not from AC-01 — and AC-01's Given (`enabled` is `true`) does not exclude that case. One clause fixes it: add "the in-scope set is within both C-5 bounds" to AC-01's Given, leaving over-budget behaviour wholly to REQ-DECLEDGER-07 where the boundary cases already live. Then AC-01 is a clean equality over G-1's set and AC-07 owns budgeting, with no criterion depending on a routed rule. | §5 REQ-DECLEDGER-01, REQ-DECLEDGER-07; §7 O-1 |
| F-19 | Low | Local | **REQ-DECLEDGER-08's new leg-split closes v2's Q-03 but leaves the excluded leg unasserted.** "the replay compares the **accounting** leg; the dispatch-construction leg legitimately differs" is exactly the clarification asked for. As written, though, "legitimately differs" is a negative carve-out with nothing positive on the other side, so a test can satisfy the criterion while the dispatch leg is silently broken in either direction. One conjunct makes it falsifiable and costs nothing, since both halves are already criteria elsewhere: the `false` run's dispatch is byte-identical to the baseline (REQ-DECLEDGER-02) and the `true` run's dispatch contains the rendered index (REQ-DECLEDGER-01) — differing in exactly that way, not merely differing. | §5 REQ-DECLEDGER-08 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | F-16(a): was `DEC-AWG-Q1`…`Q5` read from `DECISIONS-advisory-wave-gate-questions.md:14`'s prose rather than from its bullets? If the intended exemplar is "ids that exist only in a summarising sentence count", that is a much wider rule than "heading or bullet" and needs saying explicitly; if not, the file contributes zero at HEAD and the four heading-less files still need a disposition. |
| Q-02 | F-16(b): is a line that cites a decision recorded in another file (`DECISIONS-review-severity-bars.md:331` → `DEC-ROUNDS-02`, which has no record at all) intended to be in scope? If not — and R-2's "reuses a decision id in passing" suggests not — the record-versus-citation predicate belongs in G-1, not in TSPEC via O-1. |
| Q-03 | F-17: is the id grammar `DEC-{NAMESPACE}-{NUMBER}` literal, or shorthand for an alphanumeric final segment? The answer changes the expected set on real HEAD ids. |

## Questions

## Positive Observations

## Recommendation

## Verdict
