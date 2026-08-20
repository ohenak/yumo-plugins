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
---

### F-03 (High) — PROP-DISPATCH-03's universe is mostly unreachable at the composition site

PROP-DISPATCH-03 reads:

> Every dispatch **outside** BR-1's rule — reviews, **implementation**, **DoD verification and remediation**, harvest, **ship**, **advisory seams**, and the authoring-classified Phase CR optimizer whose `docType` is `null` — **must** compose a prompt byte-identical to the recorded pre-feature baseline.

Measured at HEAD, `dispatchAndVerify` has exactly **two** call sites — `reviewLoop`'s `wrapped` closure and `main()`'s `wrappedDispatch` — and `orchestrate-dev.js` states in its own words which dispatches sit outside that primitive:

> `PHASE_DISPATCH` names every skill the `converge()` primitive reaches, but four dispatches sit outside it — the `ship-pr` rebase/PR calls, the **wave-mode `se-implement` and `se-author` calls**, the **DOD verify/remediate pair** and the harvest distil call.

I confirmed the wave path: the V-wave dispatches `agentFn("se-implement", propertiesTestPrompt(featureName), …)` directly, never through `dispatchAndVerify`.

So of the seven members this property enumerates, **four — implementation, DoD verify, DoD remediate, and ship — cannot differ between the enabled and disabled runs by construction**, because the code that composes the block is not on their path at all. Asserting byte-identity for them is a tautology, and the property does not say which instrument observes them. §F.2's baseline captures `{caseId}/{dispatchIndex}.txt` by driving `main()` — whether a wave-mode or DOD dispatch produces a numbered file in that capture is exactly the thing left unstated.

This matters because §O.2 already identifies byte-identity as the family most prone to vacuity, and pairs PROP-DISPATCH-03 with PROP-DISPATCH-01 as its positive control. But PROP-DISPATCH-01's positive covers only the **authoring/target-doctype** set. Nothing in the document shows that a single implementation, DoD or ship dispatch was ever in the observed population, so the enumeration reads as coverage it does not have — and a reader auditing AC-4.3 / BR-11 against this property will believe those four are checked.

**Resolution — cheap, and it strengthens the property:**

1. State the operand: the outside-set population is the set of `dispatchAndVerify` episodes whose `(dispatchKind, docType)` pair fails `injectHere` — reviews, harvest, and the Phase CR `null` optimizer. Those are the members with a real byte-identity oracle, and they *are* falsifiable (a mutation dropping the `docType` conjunct reds Phase CR, which M-1 already claims).
2. Move implementation / DoD / ship / advisory out of this property and into a **separate structural conjunct**: assert that the wave-mode, DOD and ship dispatch paths do not reach `dispatchAndVerify` — a call-graph or call-count assertion, hand-transcribed against the two known call sites, with the citation above. That converts a tautology into a real invariant: if a later change routes `se-implement` through `dispatchAndVerify`, the assertion reds and someone has to decide whether implementation dispatches inherit injection.
3. Do not simply add them to a fixture's expected byte-identity set; that reintroduces the same tautology with more bytes.

---

### F-04 (Medium) — the Overview's property count is wrong

The Overview opens "**47 properties** over the region PLAN §Batches builds". I counted the bullet-leading definitions across Groups A–J: **66** distinct `PROP-*` ids (DISPATCH 7, CORPUS 9, ORDER 6, BOUND 7, BLOCK 3, RECORD 11, FAILOPEN 4, CONFIG 8, ISOLATE 2, FOOTPRINT 4, META 5 = 66), matching §C.4's reconciliation row exactly. `47` is stale.

The Overview is the paragraph a reviewer reads to decide whether the proof system is proportionate to the feature, and it is the only count in the document that is not backed by a table. Correct it to 66, or drop the number and let §C.4 carry it — one number in one place is what stops this recurring.

---

### F-05 (Medium) — four of PLAN's twelve suites are never named, and §C.4's paragraph miscounts itself

PLAN's file-ownership manifest creates twelve `learnings*.test.js` suites. This document names eight of them. It never names:

| Suite (PLAN) | The property that lives in it | How this document refers to it |
|---|---|---|
| `__tests__/learningsPremises.test.js` (LI-01) | PROP-META-01 | "the premises suite" |
| `__tests__/learningsPredicatePin.test.js` (LI-13) | PROP-CORPUS-01 | not named; the *sibling's existing* `consolidationPredicate.test.js` is named instead |
| `__tests__/learningsBaselineGuard.test.js` (LI-06) | PROP-META-04 | "the baseline guard" |
| `__tests__/learningsSuiteMap.test.js` (LI-14) | PROP-META-05 | "the suite-map closure" |

Prose names are not traceable. PROP-CORPUS-01 is the case that will actually mislead: it names `consolidationPredicate.test.js` as the holder of the third transcribed literal — which is correct and which I verified exists at HEAD, carrying the `:(glob)docs/*/LEARNINGS-*.md` literal — but a reader will reasonably take that to be the file the property is *implemented in*, and PLAN LI-13 is explicit that the new suite is `learningsPredicatePin.test.js` and that `consolidationPredicate.test.js` must **not** be edited ("editing it would collapse the three-way agreement into a two-way one"). That distinction is load-bearing and is invisible here.

§C.4's closing paragraph compounds it. It opens:

> **Two named test files** this document depends on **do not yet exist** — `learningsSelect.test.js`, `learningsBlock.test.js`, `learningsCorpus.test.js`, `learningsRecord.test.js`, `learningsDispatchSet.test.js`, `learningsConfig.test.js`, `learningsArmInventory.test.js`, `learningsCaptureScript.test.js`, `helpers/learningsFixtures.js` and `fixtures/learnings-baseline/` are all **planned new** files

"Two" introduces a list of ten, and the list omits the four suites above. The paragraph then concludes "**no property in this document names a test file the PLAN does not create**" — which I verified is true, and which is worth keeping — but the evidence offered for it is an incomplete enumeration.

**Resolution:** add the owning suite file to each of PROP-META-01…05 and PROP-CORPUS-01 the way every other property carries its red/green tasks; fix the lead-in to "Ten of the twelve new suites, the fixture helper and the baseline fixture directory do not yet exist"; and add one sentence to PROP-CORPUS-01 distinguishing the pin's *subject* (`consolidationPredicate.test.js`, existing, never edited) from the pin's *home* (`learningsPredicatePin.test.js`, new).

---

### F-06 (Medium) — `F-O-8` does not exist

PROP-BOUND-01's trace line cites `F-O-7/O-8`. FSPEC carries exactly `F-O-1 … F-O-7`; there is no `F-O-8`. Every other `F-O-*`, `E-*`, `C-*`, `NG-*`, `G-*`, `AC-*`, `BR-*`, `AT-*`, `DC-*` and `T-O-*` id in this document resolves to a real upstream id — this is the single exception, and it is the review checklist's named recurring failure (nonexistent-authority citations). Either drop `/O-8` or name the real id.

---

### F-07 (Medium) — PROP-BOUND-07's expected values are derived from the implementation

PROP-BOUND-07 states two of its three conjuncts as expressions over the implementation's own outputs:

> `bytesInjected` for a row **must** equal `Buffer.byteLength(material, "utf8")` for that document; `totalBytesInjected` **must** equal the sum of the rows' `bytesInjected`

If `material` is the value the production extractor returned, the first conjunct is an identity the implementation cannot fail: whatever it produced, its byte length is its byte length. The second is pure self-consistency — an implementation that charged framing to *every* row and to the total satisfies it, which is precisely mutation M-5 the ledger claims this property reds. M-5's own wording gives the right test ("`bytesInjected` no longer equals the **hand-computed** material count"), but the property does not say so, and §F.1's closing sentence — "expected values are hand-transcribed literals … never re-derived at assertion time by calling the function under test" — is the rule this property reads as violating.

**Resolution:** restate both conjuncts against the fixture, not the output. The fixture declares each document's sections and their byte sizes, so the per-row expected `bytesInjected` and the expected `totalBytesInjected` are both literals computable at fixture-authoring time and transcribed into the test. Keep the "framing charged to no bound and no row" conjunct as written — that one is already a spec claim — and state the framing cost as a separate literal so the test proves the two numbers differ, which is what makes M-5 red.

The same wording risk sits in PROP-BOUND-03's `Buffer.byteLength(material) <= maxBytes` conjunct in §O.9. That one is a genuine generated-input invariant and is fine as an inequality; it is worth one clause saying so, to keep the distinction between "generated invariant over the output" and "expected value transcribed from the spec" legible.

---

### F-08 (Medium) — PROP-ISOLATE-02 is absence-shaped with no positive control

PROP-ISOLATE-02 asserts, on an enabled run, that "**No** required section, no new heading, no new verdict token, no new approval condition, and no SKILL.md text moves." Five absences, and the only positive conjunct offered is that the criteria "**must** be exactly those in force without the feature".

That last clause is the oracle, and it is the one that needs a stated operand. §O.1's table does not list PROP-ISOLATE-02; §O.2's positive-control pairing table does not either. Compare PROP-ISOLATE-01, which gets the treatment properly: set equality over five named gate inputs, value equality per member, **and** a fixture in which contamination is made possible. PROP-ISOLATE-02 gets neither the named enumeration nor the possibility conjunct.

As written it is satisfiable by a run that produces no documents at all, or by an instrument that reads an empty criteria set on both arms.

**Resolution:** give it the PROP-ISOLATE-01 shape — enumerate the five scored artefacts by name, assert **set equality** of the criteria/heading/verdict-token/approval-condition sets between the enabled and disabled arms *and* assert each set **non-empty**, and state the SKILL.md conjunct as a digest equality over `pdlc/skills/**` rather than as a prose "no text moves". A digest is a cheap positive: it names what was compared.

---

### F-09 (Low, Process) — raw `file:line` anchors as citations

§F.4 cites `helpers/seams.js`'s `fakeFs` (`:245`) and `fakeGit` (`:413`), `helpers/consolidationDoubles.js` (`:35`), and `advisoryDisabled.test.js:70`. All four line numbers are correct today, which is the problem: they are raw positional anchors that a single inserted import invalidates, and none of them is runtime-measured evidence where position is itself the claim. Per DEC-DOC-01 (`docs/_decisions/DECISIONS-review-severity-bars.md`) that is a `Process`-scope, Low finding rather than a style nit.

One is also slightly mis-described: `advisoryDisabled.test.js:70` is the line `import mainDev, * as dev from "../orchestrate-dev.js";` — an import, not an injection. PLAN LI-12's row says it accurately ("on `advisoryDisabled.test.js`'s pattern (`import mainDev, * as dev from "../orchestrate-dev.js"`)"). Cite the exported symbol names (`fakeFs`, `fakeGit`, the re-export line's symbol list) and drop the line numbers.

---

### F-10 (Low) — PROP-META-04's falsification proof is human-run, and §G.2 does not say so

PROP-META-04's power rests on "LI-06's recorded three-step mutation proof: flip one byte, delete one whole `{caseId}` directory, add a spurious one — each step reds a **different** clause, and a step that does not red is a halt." PLAN LI-06 confirms this is performed by hand before the commit and recorded verbatim in a completion note. It is the right discipline for an oracle authored after its subject, and I would not ask for it to be mechanised.

But §G.2's gap 4 ("Mutation testing is not mechanised") names only §O.8's ledger as the un-mechanised obligation. PROP-META-04's three-step proof belongs in the same paragraph: it is a one-time human procedure guarding the expected side of every byte-identity oracle in the feature, and a reader auditing residual risk should find it listed there rather than have to derive it from a property's parenthetical.

---

### F-11 (Low) — the `87 of 89` figure is not reproducible from this repository

§O.7's precedence argument rests on "the **byte** bound binds first on measured corpora (87 of 89 documents exceed `maxBytesPerDocument` alone)". The conclusion is right — this repository's 9 corpus documents run 19,340–50,695 bytes against a 6,000-byte per-document bound, so the per-document bound binds for every one of them — but the specific figure comes from a two-repository measurement (80 of the 89 documents live in `regime-ledger`) that cannot be re-derived here, and the TE FSPEC-v2 review re-derived 91 / 76 under strict BR-6 title matching.

Since the figure is inherited rather than load-bearing for any expected value in this document, state it as inherited from FSPEC BR-5 with its basis named, or state the local re-derivation (9 of 9 here) which is checkable and makes the same point. §O.7's argument does not need the precise number — it needs "the per-document bound binds first for essentially every real document", which the local measurement establishes.


## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-BOUND-03 is red LI-08 / green LI-17, but PLAN puts `extractInjectableMaterial` in **LI-16** ("GREEN the pure selection core"), while LI-17 greens the renderer. If PROP-BOUND-03's assertions live in `learningsBlock.test.js`, they go green the moment LI-16 lands, one task before the row says. Is the row wrong, or does `learningsBlock.test.js` assert extraction only through the rendered block (in which case LI-17 is right and it is worth one clause saying so, because the expected-red ledger is written in terms of these transitions)? |
| Q-02 | PROP-DISPATCH-07 requires `_recordDocType` to be plumbed through five hops and to default to a no-op, so an uninstrumented run is byte-unchanged. That places a test-only observation seam in production code permanently. Was a lighter instrument considered — e.g. exporting `injectHere`'s predicate as a pure function and asserting the set equality over it directly, with the run-level check reduced to "every `(dispatchKind, docType)` pair reaching the site is in the predicate's domain"? §O.4 argues convincingly that the *report* is the wrong operand; it does not compare the probe against a pure-predicate operand. |
| Q-03 | §F.2 says `.baseline-worktree` is deliberately **not** ignored today and PROP-META-02 requires LI-04 to add `/.baseline-worktree/` root-anchored. After LI-04 lands, PROP-META-02's conjunct 1 goes green and the `git check-ignore` premise in the Overview's measured table becomes false. Is the premises suite (LI-01) scoped to avoid asserting that premise — PLAN says it "never asserts an absence claim … falsified on schedule by this PLAN's own tasks" — and is the Overview's table understood as a capture-time measurement rather than a standing invariant? A one-line note would stop a later reader treating the table as live. |
| Q-04 | PROP-FOOTPRINT-03 requires an empty `git status --porcelain` delta "with **no exemption list at all**", captured in a dedicated temporary git repo that is the run's `cwd`. A full `main()` run normally writes documents and commits on the feature branch. What makes the delta empty here — is the scripted `_agent` a no-op writer, and if so, does the emptiness prove anything about the *injection* path specifically, or only that the scripted run wrote nothing? Naming the mechanism would tell an implementer what must stay true. |

## Positive Observations

- **The oracle section is the best part of this document and is unusually honest about its own weak points.** §O.4's argument for why the report is the wrong operand for the dispatch-universe set equality — a seventh authoring phase rejected by `injectHere` produces no `dispatches[]` row, so a report-sourced equality stays green through exactly the drift it was written to detect — is a real falsifiability argument, not a restatement. So is the follow-on: naming *containment* as the predictable repair under time pressure, and forbidding it in advance.
- **Every premise in the Overview table checked out.** Fifteen claims about existing code, all re-measurable, all correct, including the subtle ones: that a literal grep for `dispatchKind: "authoring"` returns 3 and not 4, that both `_readFile` failure shapes are real (`defaultReadFile` returns `null`, `rtReadFile` throws), and that all nine HEAD corpus documents carry a bare ISO `Date Completed` value. Writing "a literal grep returns 3, not 4" into the premise table — rather than asserting four sites and letting the suite red on day one — is the kind of measured-before-asserted discipline that keeps a premises suite from becoming noise.
- **Traceability closes mechanically in every direction I could check.** All 25 ACs, all 16 BRs, all 35 ATs, all 23 PLAN tasks, and all 66 properties are accounted for, with zero orphan properties and zero dangling upstream ids apart from `F-O-8`. §C.3's split-ownership paragraph — three properties red by one task and green by two, each split named with its reason — is exactly the bookkeeping that usually goes missing and then surfaces as a wave halt.
- **The count/byte precedence problem is correctly diagnosed and correctly fixtured.** §O.7 identifies that under §4.1's declared thresholds the byte bound binds first on real corpora, so a default-threshold fixture would satisfy PROP-BOUND-01 with `RSN-COUNT` unimplemented, and builds `COUNT-BINDING` specifically to defeat the earlier branches. That is the "new blocking cause must defeat every earlier branch" check applied properly rather than recited. (F-01 is about the mirror fixture's description, not about this reasoning.)
- **PROP-RECORD-09 is the right kind of negative property.** Forbidding any test from pinning `runMirror` — because upstream leaves its value unconstrained and an implementation omitting it conforms — protects a conforming implementation from a test that would red it, and §G.2 gap 3 commits to retiring the property if a later revision constrains the field. Recording the retirement condition alongside the property is what keeps this from becoming a stale prohibition.
- **The gaps section declines to invent answers.** `maxBytesPerDocument: 0` is reachable by configuration and undecided upstream, and the document says so and routes it rather than freezing a guess into the suite; the FSPEC/TSPEC framing-bytes conflict is named, the reading actually used is declared, and the consequence if the other reading is intended is spelled out down to which PLAN row changes. That is the correct handling of an upstream defect from a downstream document, and I have re-confirmed both conflicts independently and re-routed them below.

## Recommendation

**Needs revision**

Three High findings, each with a concrete and bounded fix:

1. **F-01** — restate §F.1's `BYTES-BINDING` row as 8 documents × 7,000 injectable bytes (matching PROP-BOUND-02 and TSPEC §T.4) and give its expected split as a literal. Without this the mirror fixture asserts neither the byte bound where it binds nor the count bound where it does not, and PROP-BOUND-04's no-back-fill clause has no oracle.
2. **F-02** — give PROP-FOOTPRINT-04 a positive control (span non-empty and anchored on a known token) and a negative control (the same scanner reds on a planted `fs.writeFileSync`), and list it in §O.1. It is the only oracle covering AC-5.2 / NG-4 on unexercised paths, and as written it passes over an empty span.
3. **F-03** — scope PROP-DISPATCH-03 to the dispatches that actually reach `dispatchAndVerify`, and convert the implementation / DoD / ship members into a structural assertion that those paths do **not** reach the composition site. That replaces four tautological conjuncts with one invariant that reds if a later change routes them through it.

The five Medium findings (F-04 … F-08) are corrections and tightenings that cost a line or two each; the three Low findings are recorded, not gating. Nothing in the document's architecture needs to move, and the property set itself is sound — the revisions are to three oracles and to the document's own bookkeeping.

## Verdict

VERDICT: Needs revision
{"high": 3, "medium": 5, "low": 3}
