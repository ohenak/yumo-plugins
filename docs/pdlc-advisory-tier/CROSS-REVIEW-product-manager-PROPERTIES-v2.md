# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PROPERTIES-pdlc-advisory-tier.md`
**Date:** 2026-08-04
**Iteration:** 2
**Scope:** product lens — delta re-review of the v1→v1.1 revision; REQ traceability, scope compliance, acceptance-criteria fidelity
**Base reviewed at v1:** `44ad8fa` · **Head reviewed here:** `91439f6`

## Prior findings — disposition

All five v1 findings are **resolved**. Each was verified against the revised document and, where the
revision makes a claim about the repository, against the repository at branch head.

| v1 ID | Sev | Disposition | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | `PROP-ENV-13` added at §6.1 (`PROPERTIES:388`): with `advisory.envelope` parsed as the narrowed literal `["E-1"]`, an otherwise-decidable **E-2** candidate must classify `inside: false` / `out-of-envelope` satisfying O-1 in full, **and on the same fixture with the same `ctx`** an E-1 candidate must still classify `inside: true`. Both conjuncts are exactly the two I asked for — the first falsifies a build that reads `ENVELOPE_DEFAULTS` and ignores the parsed config; the second stops the property passing against a build that refuses everything. The accompanying paragraph names the four properties that would *not* have caught it (PROP-ENV-12, PROP-CFG-07, PROP-LIFE-04, PROP-A5-04/05/06), which is the reasoning I had to reconstruct by hand at v1. Registered where I asked: §12.1 `AC-3.1` and `AC-1.7` (the latter annotated "the operator's `envelope` knob is exercised, not only defaulted"), §12.1 `NFR-1`, and §12.2 `A-06` / `A-20` (both ranges extended to `PROP-ENV-13`). |
| F-02 | High | **Resolved** | `PROP-A5-20` added at §8.3 (`PROPERTIES:632`), asserting E-2's rule as **all three conjuncts** — passes at the merge-base commit, passes at the default-branch tip, fails at the branch head — with one fixture per dropped conjunct and, crucially, **the same positive in-envelope control** shared by all three, so no case can pass by refusing everything. The rule is transcribed faithfully: REQ:130 reads "*introduced* = the same check passes at **both** the merge-base commit and the default-branch tip, and fails at the branch head; AC-8.4's default-branch comparison is evaluated first", and conjunct (ii) routes the default-tip failure to PROP-A5-03's pre-existing escalation *because it is evaluated first* — the ordering clause preserved, not flattened. The property also pins that all three probes go through `_git` / `_ghRun` and are "never taken from the agent's claim", which is E-2's real risk given it is the only envelope member that commits and pushes unattended. Registered in §12.1 `AC-3.3` (now annotated per envelope member: `PROP-ENV-11` E-3, `PROP-A2-02` E-4, `PROP-A5-07` E-1, `PROP-A5-20` E-2 — the four-rule audit is now readable off the row) and in §12.2 `A-11` / `A-24`. |
| F-03 | High | **Resolved**, and resolved at both the property and the oracle definition | `PROP-GATE-01…05` (§6.5) is restated as two named, both-required conjuncts: (1) with the gate stubbed to fail the disposition must be **`escalated` with reason `post-action-verification-failed`**, satisfying O-1 in full — the exact reason REQ AC-3.6 row 4 assigns to an in-envelope action whose AC-4.5 gate then failed, which I verified verbatim at `REQ:159` — and (2) the existing mutation control. The document adds the sentence that makes the pairing legible: "2 proves the gate is read, 1 proves what happens when it says no." O-6 in §3 is restated in the same terms, so the oracle catalogue and the property no longer disagree. The matrix gap is closed too: §12.1 `AC-4.6` now reads `PROP-PROH-01 … PROP-PROH-04 and PROP-GATE-01 … PROP-GATE-05`, with the reason stated inline ("AC-4.6 quantifies over AC-4.1 through AC-4.5, so AC-4.5's gate properties are members of this row"), and `NFR-2` carries the same addition. The A1 carve-out appended below the property is sound and is not an absence-only escape: at A1, whose `permittedActions` is `[]`, it asserts the *stronger* positive — every A1 path terminates in `escalated` or `no-action` with its own O-1 triple. |
| F-04 | Medium | **Resolved**, and I re-derived the numbers rather than taking them | §1 now states the budget as a **shape** (`Unit ≥ 70%, Integration ≤ 30%, E2E = 0`) with a levelled count table against it, and §12.3 restates the identical totals. I recomputed from the document: 183 `PROP-` table rows (`grep -c '^| PROP-'`) + 12 prose-stated ids (`PROP-INFRA-01…04`, `PROP-XA-08`, `PROP-GATE-01…06`, `PROP-REG-08`) = **195**, matching the claim exactly. Levels: table rows are 130 `Unit` + 7 `Unit + Integration` + 39 `Integration` + the 7 `PROP-XA-*` rows (Unit, in a narrower table shape) = 183; the prose twelve are Unit except `PROP-INFRA-03`, which is `Level: Integration`. That gives **148 Unit / 40 Integration / 7 both / 0 E2E** — the document's figures, to the unit. Shares 76% / 21% / 3% sum to 100% and satisfy the stated shape. The derived "47 properties need an Integration harness" (40 + 7) is arithmetically right and is the honest cost signal for A-10/A-11/A-12 sizing. The zero-E2E claim and its justification are preserved verbatim, as I asked. |
| F-05 | Low | **Resolved** | §2.2 now reads "already consumed by sixteen suites under `pdlc/workflows/__tests__/`". Verified: `grep -rl driftGenerators pdlc/workflows/__tests__/` excluding the module itself returns exactly 16 files. |

## Findings

Scope of this pass: the changed sections only (`git diff 44ad8fa..91439f6` on the document —
236 insertions, 65 deletions across §1, §2.1, §2.2, §2.4, §3 (O-6), §4.1, §4.2, §5.2, §5.3, §6.1,
§6.5, §8.3, §9.1, §9.2, §9.3, §10.1, §10.3, §11, §12.1–§12.4, §13.1). Unchanged sections approved at
v1 were not re-litigated.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | **A stale cross-reference is now visibly inconsistent with the section it points at.** PROP-A4-09 (§8.1, `PROPERTIES:605`) ends "…no `T-06-7` invented for it (§13 item 3)". §13.1 item 3 is the P-4 closure-conjunct erratum, not the `implementation.testCommand` degradation; the fact PROP-A4-09 is pointing at lives in §13.2's negative-space table, which is unnumbered. This mis-pointer predates the revision, but this revision made it *visible*: the new §12.4 states the same fact and cites **§13.2** correctly ("which is a TSPEC/PLAN-level obligation (§13.2)"), so the two now disagree in print, and §13.1 gained a fourth item in this pass — exactly the kind of edit that makes a reader trust the numbered pointer. It costs an operator nothing but a wasted lookup, hence Low. **Fix:** change PROP-A4-09's parenthetical to `(§13.2)`, matching §12.4. | §12.4 / §13.2 self-consistency |

## Questions

My v1 Q-01 is **answered** and needs no further response: §12.4 is exactly the fourth audit direction
I asked whether was deliberately delegated, and it answers the delegation question head-on —
"Delegating case coverage to PLAN §8.1 is **not** sufficient: PLAN §8.1 says which file a case lives
in, never what its oracle asserts." Q-02 and Q-03 were confirmations rather than requests and stand
answered by the revision leaving both readings intact.

| ID | Question |
|----|---------|
| Q-01 | Carried forward from v1 Q-04, and narrowed by this revision rather than closed. PROP-DIS-06 now scopes its scan to a **named file set** (`orchestrate-dev.js` and `orchestrate-queue.js`, never `dist/*.bundle.js`) and pre-empts the most likely fourth site by ruling the report field out of the count — good, and the `dist/` exclusion is a real trap avoided, since the bundle inlines both modules (`pdlc/workflows/dist/` per CLAUDE.md). The count of **exactly three** is still a snapshot of TSPEC §11.1. If Phase I finds a legitimate fourth read, is the intended resolution "the property fails and TSPEC §11.1 is amended", or "the property fails and the fourth read is refactored away"? Stating which of the two the operator is buying would settle at authoring time what would otherwise be argued at implementation time. Not blocking — the property is falsifiable and correctly scoped either way. |
| Q-02 | `PROP-A5-20` is levelled `Unit` but its three fixtures probe `_git` / `_ghRun` at the merge base, the default-branch tip and the branch head, and its home `advisoryPubSeam.test.js` is one of the two real-tree files PLAN §6.2 designates. If it in fact needs the real-tree fixture, it belongs in the 47-property Integration cost I checked in §12.3, and the levelled totals shift by one. This is a test-engineering call and I raise it as a question rather than a finding — but the level totals are now a stated budget, so the answer has a number attached to it. |

## Positive Observations

## Recommendation

## Verdict
