# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-learnings-injection/PROPERTIES-pdlc-learnings-injection.md`
**Date:** 2026-08-20
**Iteration:** 1

## Verification Performed

Every premise below was re-measured against the working tree at
`e2ccaa8` on `feat-pdlc-learnings-injection`, not read off a document.

**Overview premise table — all confirmed.**

| PROPERTIES claim | Result |
|---|---|
| `dispatchAndVerify` destructures `dispatchKind` and `docType` | Confirmed — `orchestrate-dev.js`, `async function dispatchAndVerify({...})`, params include `docType` and `dispatchKind` |
| A literal grep for `dispatchKind: "authoring"` returns 3, not 4 | Confirmed — exactly 3 object-literal sites, in `erratumRound` (the `erratumAuthorPrompt` dispatch and the land-proof retry) and in `converge`'s creator; the fourth is the positional `"authoring"` argument to `runWrapped(optimizer, optPrompt, doc, "authoring", …)` inside `reviewLoop`, and `wrapped` forwards `docType: roundDocType` |
| Phase CR reaches the composition site with `docType: null` | Confirmed — the `reviewLoop` call in `main()`'s Phase CR block passes `phase: "CR"` with `docType: null`, and `roundDocType` is that `null` |
| Phase H reaches it with `docType: "LEARNINGS"` | Confirmed — exactly one `docType: "LEARNINGS"` site, alongside the sole `dispatchKind: "harvest"` |
| `consolidate-learnings.js` keeps `LS_FILES_ARGV` module-private and exports `enumerateCorpus(_git)` | Confirmed |
| The engine vendors only `MODULE_NAMES = ["orchestrate-dev.js", "orchestrate-queue.js"]` | Confirmed in `pdlc/engine/scripts/prepack.mjs` |
| `defaultReadFile` returns `null` on a caught error; `rtReadFile` throws | Confirmed — both shapes are real |
| `buildFinalReport` takes `notices = []` and spreads `advisory` conditionally | Confirmed |
| `MERGE_CONFIG_PATH = ".claude/pdlc.config.json"` | Confirmed |
| The corpus at HEAD is 9 documents, all well-formed | Confirmed — the exact predicate returns 9 paths; all 9 open `# LEARNINGS — {feature}` and all 9 carry a **bare** ISO `Date Completed` value on line 7 |
| Zero line-initial gate tokens in the shipped corpus | Confirmed — no corpus document carries a line-initial `VERDICT:`, `ERRATUM:` or `REVISION-COMPLETE:` line |
| `git check-ignore -v .baseline-worktree` exits 1 | Confirmed |
| `WALK_SKIP_DIRS = new Set([".git", "node_modules"])` | Confirmed in `pdlc/workflows/lib/document-oracles.mjs` |
| No `learnings*` test file exists; no root `scripts/` directory | Confirmed for both |
| `orchestrate-dev.js` is 15,311 lines; the gate is `--per-file --branches 85` | Confirmed |

**Traceability closure — mechanically checked.**

- **REQ ACs:** all 25 (`AC-1.1 … AC-6.2`) appear in §C.2. No AC uncovered, no invented AC.
- **FSPEC BRs:** all 16 (`BR-1 … BR-16`) are cited. No BR uncovered.
- **FSPEC edge cases:** every `E-*` cited resolves to an FSPEC `E-*`. No dangling id.
- **`C-*`, `NG-*`, `G-*`, `DC-*`, `DEC-*`:** every id cited resolves upstream.
- **ATs:** FSPEC and TSPEC each carry exactly 35 `AT-*`; §C.1 maps all 35, and the suite split `2+9+3+3+6+12` sums to 35.
- **PLAN tasks:** PLAN's table carries exactly `LI-01 … LI-23`; §C.3 lists all 23, and **every one of the 66 defined properties appears in a red or green column** — no orphan property.
- **Property count:** 66 distinct `PROP-*` ids are defined across Groups A–J, matching §C.4's `66` and contradicting the Overview's `47` (F-04).
- **Catalogues:** TSPEC's frozen sets are 6 reject reasons, 2 corpus outcomes, 2 notices — matching PROP-RECORD-03, PROP-RECORD-04 and PROP-CONFIG-07. `RSN-TRUNCATED` appears only as the negative PROP-CORPUS-07 forbids, correctly paired with positive acceptance clauses.
- **Test files:** `consolidationPredicate.test.js` and `helpers/seams.js` (`fakeFs`, `fakeGit`) and `helpers/consolidationDoubles.js` all exist at HEAD; the twelve `learnings*.test.js` suites, `helpers/learningsFixtures.js`, `fixtures/learnings-baseline/` and `scripts/capture-learnings-baseline.mjs` are all explicitly planned as new in PLAN's file-ownership manifest. **No property names a test file the PLAN does not create** — but four of the twelve are never named here at all (F-05).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | `BYTES-BINDING` is specified two incompatible ways inside this document | §F.1 vs PROP-BOUND-02 |
| F-02 | High | Local | PROP-FOOTPRINT-04 is an absence-only static oracle with no positive control and a vacuity mode the document polices everywhere else | PROP-FOOTPRINT-04, §O.1 |
| F-03 | High | Local | PROP-DISPATCH-03 enumerates a universe most of whose members never reach the composition site, so the enumeration is decorative and its operand is unstated | PROP-DISPATCH-03, §O.2 |
| F-04 | Medium | Local | The Overview says **47 properties**; 66 are defined and §C.4 says 66 | §Overview, §C.4 |
| F-05 | Medium | Local | Four of PLAN's twelve new suites are never named; §C.4's "planned new files" paragraph opens "Two named test files" and then lists ten | §C.4, PROP-META-01/04/05, PROP-CORPUS-01 |
| F-06 | Medium | Local | `F-O-8` does not exist — FSPEC carries `F-O-1 … F-O-7` | PROP-BOUND-01 |
| F-07 | Medium | Local | PROP-BOUND-07's expected values are defined by expressions over the implementation's own outputs — an implementation echo | PROP-BOUND-07, §F.1 closing sentence |
| F-08 | Medium | Local | PROP-ISOLATE-02 is absence-shaped and carries no positive control in §O.1 or §O.2 | PROP-ISOLATE-02 |
| F-09 | Low | Process | Raw `file:line` anchors used as citations (DEC-DOC-01), one of which mis-describes what sits at the line | §F.4 |
| F-10 | Low | Local | PROP-META-04's falsification proof is a human-run, human-recorded procedure, not a CI oracle; §G.2 gap 4 does not name it | PROP-META-04, §G.2 |
| F-11 | Low | Local | The `87 of 89` measurement is not reproducible from this repository and a prior review re-derived different numbers | §O.7 |

---

### F-01 (High) — `BYTES-BINDING` is two different fixtures

PROP-BOUND-02 says:

> Under the mirror `BYTES-BINDING` fixture (**8 documents of 7,000 injectable bytes** under §4.1's declared values) the contributing count **must** be strictly below `maxDocuments`, with `RSN-BYTES` rows and **no** `RSN-COUNT` row

§F.1's fixture table says:

> `BYTES-BINDING` | **2 documents**, the second's material straddling `maxTotalBytes` | a whole-document drop where a per-document bound was specified, **and back-fill**

These cannot both be the fixture. TSPEC §T.4 agrees with PROP-BOUND-02 — "the mirror fixture `BYTES-BINDING` — 8 documents of 7,000 injectable bytes each under §4.1's declared values" — so §F.1's row is the wrong one, and it is the row an implementer will build from, because §F.1 is where the fixture shapes live.

The consequence is not cosmetic. §F.1's closing sentence makes every expected value a hand-transcribed literal computed from the fixture's declared content; with the fixture declared two ways, PROP-BOUND-02's and PROP-BOUND-04's expected splits are uncomputable, and the two-document shape cannot discharge what §F.1 claims for it:

- **`maxDocuments` is not asserted not to bind.** With 2 documents and `maxDocuments: 5`, "the contributing count is strictly below `maxDocuments`" is true before the byte bound does anything. The mirror's whole purpose — each bound asserted where it binds *and* asserted not to bind where the other does — is lost.
- **Back-fill has no oracle.** Back-fill is the behaviour where a document dropped by the byte cut frees room that a lower-ranked document is wrongly promoted into. Two documents cannot exhibit it: there is no third document to promote. Under the 8×7,000 shape (each bounded to 6,000, `maxTotalBytes: 20,000`) exactly 3 contribute and 5 carry `RSN-BYTES`, and document 4 sitting unpromoted behind document 3 is the observation that reds a back-filling implementation.

**Resolution:** restate §F.1's `BYTES-BINDING` row as 8 documents × 7,000 injectable bytes under §4.1's declared values, matching PROP-BOUND-02 and TSPEC §T.4, and state the expected split (3 contributing / 5 `RSN-BYTES` / 0 `RSN-COUNT`) as a literal beside `COUNT-BINDING`'s 3/5, so the mirror reads as a mirror.

---

### F-02 (High) — PROP-FOOTPRINT-04 has no positive control, and can go vacuously green

PROP-FOOTPRINT-04 asserts that the source span between LI-15's two sentinel comments contains no `fs.`, `writeFileSync`, `mkdirSync`, `appendFileSync` or `require("fs")`, "asserted by a static scan scoped to that span — the check that covers every run, not only the runs a fixture exercises."

That last clause is exactly why it matters: it is the only oracle in the document that covers AC-5.2 / NG-4 on code paths no fixture reaches. And it is stated as a pure absence with no conjunct on the instrument. The failure mode is the one the document catches everywhere else:

- If the scan cannot locate the sentinels — LI-15 rewords a comment, a later refactor moves the region, the regex is anchored on a string that drifts — the span is empty and the absence assertion passes over zero bytes.
- If the token list is scanned case-sensitively against a region that reaches the filesystem through an alias (`node:fs`, a destructured `{ writeFileSync }` imported at module top and called bare, `fsp.writeFile`), the scan passes over real writes.

§O.1's table — "every blocked/held/degraded invariant is stated as an exact id **plus** a positive retention or record conjunct" — does not list PROP-FOOTPRINT-04, and §O.2's positive-control pairing table does not either. PROP-META-02 and PROP-META-03 each got the treatment (conjuncts 2 and 3, and the `git worktree list` conjunct respectively); this one did not.

**Resolution:** add the two conjuncts that give the instrument an oracle, and say which they are in §O.1:

1. **The span is non-empty and is the right span** — assert the scan returns a region containing a known anchor the region must carry, e.g. `LEARNINGS_TARGET_DOCTYPES`. A scan that finds nothing must red, not pass.
2. **The scan reds on a planted token** — run the same scanner over a synthetic span containing `fs.writeFileSync` and assert it reports a violation. This is the negative control that proves the token list and the matcher work.

Add the alias forms to the token list, or state explicitly that the region is barred from importing `fs` under any name and assert *that* instead — a single "no filesystem module reference reachable from this span" check is stronger than an enumerated token list and does not silently narrow.

## Questions

## Positive Observations

## Recommendation

## Verdict
