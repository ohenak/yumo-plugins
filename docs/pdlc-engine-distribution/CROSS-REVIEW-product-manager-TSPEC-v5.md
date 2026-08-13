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

| ID | Question |
|----|---------|
| Q-01 | §9.3 drops the "parses under an ES-2020 parser" clause and keeps the Node-12.17 subset claim as a comment rather than a test (`:1209-1227`). The trade is argued well and I accept it on cost grounds — `acorn` would land a dependency row in the very manifest §5.4's equality is auditing. But the claim that remains unmechanised is the one AC-2.4's user-visible promise rests on: that an operator on an old Node sees a named floor rather than a stack trace. §14.2 lists the design's carried risks; should "the Node-12.17 syntax-subset claim is documented, not tested — a future edit to `bin/pdlc.mjs` using a post-12.17 construct is caught only at review" appear there as a named risk, so the accepted gap is visible to the operator deciding on this design rather than only to a reader of §9.3? |
| Q-02 | §12.3's green-direct-run leg now sets `mergeMode: "on"` and asserts the produced-kind set is non-empty and contains kind 3 (`:1445-1456`). I verified the precondition is real — `MERGE_DEFAULTS.mergeMode: "off"` (`orchestrate-dev.js:61`) and `decideMerge`'s guard 1 returns `mergeStatus: "skipped"` before the `{status: "done", evidence}` row write at `:1753` (`:1064-1070`). But guard 1 is only the first rung: the ladder below it can still resolve `refused`/`deferred` on repo capability, mergeable state or CI, and the self-modification guard path refuses outright for a PR touching `pdlc/workflows/`. The emptiness guard means such a fixture fails loudly rather than quietly, which is the important half — is the fixture's remaining setup (capabilities, mergeable state, CI status) enumerated anywhere the PLAN can transcribe it, or is the leg's author expected to derive it from `decideMerge` at implementation time? |

## 4. Positive Observations

- **The production-carrier section is the round's real work, and it closes a gap that would have shipped every oracle green and AC-5.3 broken in production.** §7.2's new table (`:780-795`) names the last unnamed hop: the engine hands the workflow modules **exactly two** frozen seam objects and no others. I re-verified all of it at HEAD — `devInjection` at `run.mjs:80` with seven keys, `queueInjection` at `:114` with five, constructed at `runDev:392` and `runQueue:450-453`, and the delegated wrapper at `:450-451` spreading `devInjection`'s result so the dev pipeline a queue run delegates to inherits the key with no second change. Every number in the table matches the file. More to the point, `:207-213` names the failure mode in the operator's terms rather than the implementer's: module-side tests inject into `main()` directly, so all four kinds go green while a real engine-driven run emits `NO_PROVENANCE` into every commit it makes. That is AC-5.3 satisfied on paper and broken for every user, and the section says so plainly instead of burying it as a wiring detail.

- **The fix for it is a test level, not a promise.** The new production-path row (`:1412`) drives `runDev`/`runQueue` through the shipped `importWorkflow` seam (`run.mjs:387`, `:427` — both present) with a recording module, and asserts the captured object carries the value. Paired with the oracle-2 leg at `:1456-1462`, the design now has a leg that is red if either injection forgets the key. This is the DC-07 `builder-not-wired` sweep applied by the author to their own design before a reviewer ran it, which is the cheapest place it can ever happen.

- **The seam contract is treated as a shipped contract with a cost, not as an obstacle.** §13's new sequencing rule (`:1489-1497`) and K-3's reprice (`:1553`) both state the thing that is easy to leave out of a cost row: adding one key to a frozen injection costs a shipped green test's transcribed expected values, in a different file, in the same task. F-02 above is about the *citation*, not about this judgement — the judgement is right, and the file-ownership consequence (`lib/run.mjs` and `seam-contract.test.js` under one task) is exactly what the batch-safety rule needs.

- **§12.3's precondition finding was accepted with an emptiness guard rather than a fixture tweak.** Setting `mergeMode: "on"` alone would have fixed the immediate vacuity and left the leg able to go quiet again the next time a default or a guard rung moves. Asserting the produced-kind set is non-empty makes the leg's own vacuity falsifiable — the absence-only failure mode fixed by a positive assertion on the same path, which is the discipline the properties are meant to carry.

- **F-02's closure removed the collision instead of documenting it.** The finding would have been closed by disambiguating two labels; the revision renamed the packed set to `PK-nn`, said why in the section (`:294-302`), left §11 and §8.5's `E-nn` citations alone as error ids, and explicitly preserved the historical changelog rows as written at the time rather than rewriting history. I grepped for survivors and found none. Renaming a namespace mid-review is more work than the finding asked for and is the reason a PLAN author will never have to read two tables to learn which catalogue an id belongs to.

## 5. Recommendation

**Needs revision** — one High, and it is a one-clause edit.

All three of v4's findings are closed, and two of them are closed more thoroughly than the
finding asked: the packed set was renamed out of the colliding namespace rather than annotated,
and §12.1's module-side split now carries the reason for the split in the row. Nothing settled
in earlier rounds was re-opened. The round's own new work — the production-carrier table, the
production-path test level and the oracle-2 leg — closes a real `builder-not-wired` hole that
would have shipped AC-5.3 green in the test suite and broken for every operator; every line
number in it checks out against `run.mjs` and `seam-contract.test.js` at HEAD.

The blocker is internal to §9.3, and is this round's own: clause 3 now forbids **any**
occurrence of the `await` token in `bin/pdlc.mjs`'s raw source, while the same section requires
a header comment stating the Node-12.17 subset **and the reason** — a reason this section
itself expresses as "top-level `await` is a Node 14.8+ parse-level feature". The faithful
implementation is the red one. Clause 2 already has the word that fixes it.

To resolve **F-01**: narrow clause 3 to the **non-comment** source (or to `await` in statement
position), at `:1201-1202` and in the mechanism sentence at `:1219-1220`, and mirror it in
§12.1's arrangement row at `:1409`. No design moves; the falsifier for
`await import("./cli.mjs")` is unaffected.

F-02 (the `PROP-PARITY-12` leak-case instruction, which is a no-op at best and a
contradiction if read literally) and F-03 (§12.1's "no test spans the two suites", false at
`seam-contract.test.js:299`) are worth the same pass but do not gate on their own.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
