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

## Questions

## Positive Observations

## Recommendation

## Verdict
