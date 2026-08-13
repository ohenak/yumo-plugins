# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.5)
**Upstream read:** `REQ-pdlc-engine-distribution.md` (AC-2.4, AC-5.3), `FSPEC-pdlc-engine-distribution.md` (§5.2, AT-2.5, AT-3.8b)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v4.md` (Needs revision — 1 High, 1 Medium, 1 Low)
**Diff reviewed:** `fb831c7e^..HEAD` on the TSPEC (156 +/50 −)
**Date:** 2026-08-13
**Iteration:** 5
**Scope:** Delta re-review. Only v4's findings and this round's changed sections. Unchanged sections already approved are not re-litigated.

## 1. Prior findings disposition

| v4 ID | Severity | Status | Evidence in v0.5 |
|---|---|---|---|
| F-01 | High | **Resolved** | §5.4's FSPEC-§5.2 unblocking note now names the **vendored** members — "PK-20 (`vendor/workflows/orchestrate-dev.js`), PK-21 (`vendor/workflows/orchestrate-queue.js`) and PK-22 (`vendor/workflows/VENDOR-MANIFEST.json`) … and nothing else" (`:375-379`) — and says explicitly that AT-3.8b's expected set is defined by *that* sentence, so a PLAN author transcribing it lands on the vendored three. The renumbering that caused the stale line is named in place rather than quietly overwritten. §5.4's own summary sentence (`:352-354`) and the new note now agree |
| F-02 | Medium | **Resolved**, and beyond the ask | The finding asked only that the `E-nn`/`E-nn` collision be *disambiguated*; the revision renamed the whole packed set to `PK-nn` and stated the rename's motive in the section itself (`:294-302`). I re-grepped the document for surviving `E-nn` tokens: every one left (`:237`, `:487`, `:508`, `:1082-1083`, `:1296-1298`, `:1377-1393`, `:1420`) is an FSPEC **error** id in §6, §8.5, §10 or §11 — no packed member is still called `E-nn` outside the historical changelog rows, which the section says are quoted as written at the time |
| F-03 | Medium | **Resolved** | §12.1's module-side row now reads "kinds 1 and 2 against `orchestrate-dev.js`; kinds 3 and 4 across both modules" (`:1411`) and gives the reason in the row — two of kind 4's five helpers are queue-side. Re-verified at HEAD: `commitQueueRow` `orchestrate-queue.js:1598`, `commitAdvisoryRecord` `:1637`, both in the queue module, so the corrected split is the true one |

All three closed on their own terms, and F-02's closure removed the collision rather than
annotating it. The blocker below is new work introduced by this round, in the section this
round rewrote.

## 2. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§9.3's new clause 3 goes red against a correct implementation, because the same section orders a header comment that will contain the token the clause forbids.** Clause 3 now reads "its source contains **zero occurrences of the `await` keyword token**" (`:1201-1202`), and the mechanism is spelled out as "a plain source scan (a token match over the file's text)" (`:1219-1220`) — raw text, deliberately parser-free. Twelve lines later the same section requires that "the Node-12.17 subset claim survives as a **documented constraint on the file** … a header comment in `bin/pdlc.mjs` states the subset **and the reason**" (`:1224-1227`). The reason, per this section's own statement of it at `:1174-1179`, *is* top-level `await`: "top-level `await` is a **Node 14.8+ parse-level** feature, so on Node 12 the guard is a `SyntaxError`". A comment that states that reason contains the string `await`, so the guard file that most faithfully implements §9.3 fails §9.3's own oracle. Note that clause 2 says "its only **non-comment** top-level statements" (`:1199`) while clause 3 says only "its source" — the omission reads as deliberate to an implementer, not as shorthand. This is the defect kind rounds 3 and 4 closed one level up, in a section whose whole subject is falsifiability: an oracle whose expected side is wrong, so the honest build is the red one, and the pressure is on the implementer to weaken the comment (drop the reason) or to silently deviate from the stated mechanism. Fix is one clause: scan the **non-comment** source, borrowing clause 2's own word — or state the token match as `await` in statement position. Either keeps the falsifier for the regression that motivated the round (`await import("./cli.mjs")` restored) while letting the mandated comment exist | AC-2.4, FSPEC AT-2.5 |
| F-02 | Medium | Local | **The instruction to edit `PROP-PARITY-12`'s third case describes an edit that either is a no-op or, read literally, contradicts the wiring.** §12.1 (`:1409`), §13's sequencing rule (`:1489-1497`) and the v0.5 changelog all send the wiring task to `seam-contract.test.js:47-63` **and** `:79-82`, the latter described as "the 'rows do not leak each other's seams' assertion, which gains `_provenance` on **both** sides". I read that test at HEAD: `:79-90` asserts only **absences** — `devKeys.has("_runPipeline") === false` (`:82`) and, for each of `_parallel`/`_pipeline`/`_runCommand`, `queueKeys.has(…) === false` (`:83-89`). Its content is each row's *exclusion* list. `_provenance` is going onto **both** rows, so it belongs in neither list, and the presence of the key is already pinned no-more-no-less by the two set-equalities at `:65-73` against the constants at `:47-63` — which the same instruction correctly names. So the literal reading of "gains `_provenance` on both sides" is "assert each row does **not** carry it", which is red against the correct implementation; the charitable reading is a positive presence assertion the set-equality already makes. Two further precision issues in the same citation: the range `:79-82` names only the first of that test's four assertions (it runs to `:90`), and the file has a **third** site constraining `devInjection`'s keys — `PROP-PARITY-15` at `:268-282`, which asserts every produced key is in `TSPEC_3_1_DEV_SEAMS` and not in `UNOVERRIDDEN_IO_SEAMS` (`:223-238`). That one turns green once `:47-63` is edited and `_provenance` is kept out of the un-overridden list, so no coverage is lost — but the sequencing rule's "two places" framing does not match the file. Fix: name the constants at `:47-63` as the required edit, state that the leak case needs **no** change because `_provenance` is on both rows, and note `PROP-PARITY-15` as the third reader of the same constant | AC-5.3 |
| F-03 | Low | Local | **§12.1's production-path row overstates a shipped constraint.** The row says "**No test spans the two suites** — jest owns `pdlc/workflows/__tests__/`, `node --test` owns `pdlc/engine/__tests__/` — so this leg lives entirely on the engine side and needs no cross-runner import" (`:1412`). The conclusion is right and the reason after the dash is right, but the flat claim is false at HEAD: `PROP-PARITY-10` in the engine suite imports the real workflow module directly (`pdlc/engine/__tests__/seam-contract.test.js:299`, `await import("../../workflows/orchestrate-dev.js")`) and is green. What is true is that no test spans the two **runners** — an engine-side test may import a workflow module, it just cannot be executed by jest. As written a task author may read a shipped, deliberate pattern as forbidden and build a redundant fake where a real-module import would give a stronger production-path leg. Fix: say "no test runs under both runners" and cite `:299` as the sanctioned precedent | AC-5.3 |

## 3. Questions

## 4. Positive Observations

## 5. Recommendation

## Verdict
