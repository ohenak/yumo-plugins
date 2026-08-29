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

## v3 findings disposition

| v3 ID | Status | Evidence |
|---|---|---|
| F-01 (High) — §7.5 still carried the superseded "the model is built from the production line renderer" sentence four lines above the paragraph proving that makes the no-truncation conjunct unfalsifiable | **Resolved** — deleted, in exactly the shape asked for | §7.5:1118–1120 now reads "The model applies its **own** formatter (below) per record, not a re-implementation of the drop loop, so a bug in the loop cannot be mirrored into the oracle." The own-formatter paragraph below it (`:1122–1128`) is unchanged, the four-row mutation table is unchanged, and the section now says one thing about the model instead of two incompatible things. Commit `6d5a7b00c` deletes the clause rather than adding a third statement about it — the durable point of v3's Process tag |
| F-02 (Medium) — D-10's `omitted[]` conjunct was empty-by-construction on the project-level-only slice | **Resolved, and re-argued more sharply than I asked** | §7.3:937–961 now builds over the whole fixture, splits the assertion into three numbered conjuncts, and adds the positive counterpart I offered as optional: conjunct (1) is a **set-equality** over the 41 project-level ids, not a containment. Conjunct (3) is now `omitted[]` non-empty **and** every id in it `origin === "feature"` — an origin partition, not a bare absence. D-10's rejected-alternative column records *why* the project-level-only build was rejected, in the vacuity terms, so the next author cannot re-adopt it by accident. My F-01 above is about the input set chosen, not about this structure, which is right |
| F-03 (Low) — 12,059 attributed to `pdlc-headless-engine` rather than to the 63-line in-scope set | **Resolved** | ERR-2 (§9.2:1309–1312) now reads "The largest feature directory is `pdlc-headless-engine` at **22 lines / 4,553 bytes**; the in-scope set that directory produces — project-level plus itself, which is `M-6b`'s 63-line floor — is 10,859 index bytes, and **12,059** with framing charged". Both figures are now attached to the objects that carry them |
| F-04 (Low) — "~495 bytes ≈ two feature-level lines" was retired arithmetic | **Resolved in §3.6 and ERR-2, and this is what F-02 above is about** | §3.6:435–437 and ERR-2:1305–1308 both say three at the mean, two at the largest observed line. §7.3's new note still says two |
| Q-01 — should §2.3 say that "sentinel region" names two different regions? | **Answered in place** | §2.3:176–184 is new and it answers by citing the mechanism, not by reassurance: `advisoryDisabled.test.js:718–719` matches `"// === LEARNINGS INJECTION REGION START ==="` by exact string, not by sentinel *shape*, so this feature's `DECISION LEDGER WIRING` sentinels are invisible to PROP-DIS-06's slice and the wiring stays inside its `/\.enabled\b/` count. I verified both operands: `sourceExcludingParser` at `pdlc/workflows/__tests__/advisoryDisabled.test.js:718–719` uses `source.indexOf` on the two full literals, and `orchestrate-dev.js:2184` / `:2892` are the only sentinel pair in the file today |
