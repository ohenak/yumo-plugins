# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.4, 2026-08-28)
**Date:** 2026-08-28
**Iteration:** 4

Delta re-review. Diff from `64cb78029` (the v3 base) to HEAD: five commits
(`6d5a7b00c`, `c461200ca`, `1f6f59564`, `e905b0e21`, `8361a481a`) touching §2.3, §3.6, §7.3,
§7.5, §9.1's D-10 row and ERR-2. v3 left one High (F-01, §7.5's superseded model sentence),
one Medium (F-02, D-10's vacuous `omitted[]` conjunct) and two Lows. **All four are resolved.**
I re-read only the changed sections and re-executed the numbers the revision moved.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | D-10's whole-fixture build is described as "all 141 in-scope records, project-level and feature-level, **which is what a real dispatch gathers**". No dispatch gathers that set: §3.1 defines the in-scope set as project-level ∪ **one** feature directory, and states "No other feature's directory is in scope, which is what AT-01's *a build rendering all 100 feature-level ids fails* pins". So the assertion whose stated purpose is to exercise the shipped configuration runs it over an input the production gather can never produce, and the sentence contradicts the document's own defined term. The fix costs one substitution and keeps every property of the whole-fixture build: run it over the **largest reachable** in-scope set — project-level (41) ∪ `pdlc-headless-engine` (22) = `M-6b`'s 63-line floor, 10,859 index bytes against a 6,800-byte allowance. The bound still binds, `omitted[]` is still non-empty and still all-feature-level, conjunct (3) still reddens under a reversed drop order, and the input is now one a dispatch on that feature actually produces | §7.3:940–941, §7.3:953–954, §3.1:277–279 |
| F-02 | Low | Local | §7.3's "does not pin how many survive" note says "Under the shipped bound roughly **two** do", citing §3.6 — but the same revision corrected §3.6 (and ERR-2) to say **three** at the measured mean, two at the largest observed line. The two figures were made inconsistent in one round by the two halves of the same fix | §7.3:963–965, §3.6:435–437 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | At 141 records `maxEntries` 70 binds *before* `maxBytes` does — 71 records must be dropped on the entry cap alone, before any byte arithmetic runs. §7.3's justification names only the byte bound ("At 141 records the byte bound **binds** — the drop loop must run"). Under F-01's 63-record set, `maxEntries` 70 is slack and `maxBytes` is the sole binding constraint, which is the regime §3.6's arithmetic actually describes. Is that the regime the assertion means to pin? If the whole-fixture build is kept deliberately, the paragraph should say which bound is doing the cutting, since the two produce different `omitted[]` sets |
