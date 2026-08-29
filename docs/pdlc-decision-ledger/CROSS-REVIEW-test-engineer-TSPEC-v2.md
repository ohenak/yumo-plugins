# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-decision-ledger/TSPEC-pdlc-decision-ledger.md` (v0.2, 2026-08-28)
**Date:** 2026-08-28
**Iteration:** 2

Delta re-review. Base for the diff is `9635b9ad2` (the tree my v1 read); the document has moved
through twelve commits to `f981ddfa4`, +304/−29 lines. My v1 raised five High findings; four are
resolved, one is resolved in prose but left unlanded in the section's normative clause list. I
re-read only the changed sections for new issues and did not re-litigate the sections I approved.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | §7.4's normative pinning list, clause (b), still specifies the non-hermetic guard my v1 F-03 asked to be replaced — `mergeBaseSha` asserted against `git merge-base origin/main HEAD` **computed at test time** — and now directly contradicts the corrected "Baseline identity" bullet 40 lines above, which adopts the shipped hand-transcribed-literal shape and says the assertion resolves against `HEAD`, "never against `origin/main`". Two incompatible instructions for one assertion; the clause list is the one an implementer follows | §7.4:968–973 vs §7.4:916–931 |
| F-02 | Medium | Local | §3.6's new safety promise — "every reviewer receives the **whole** project-level corpus, on every feature, always" — rests on the measured 6,305 + 1,200 ≤ 8,000 arithmetic, and no oracle pins it. The framing half is pinned (§4.3's ≤1,200-byte unit test); the corpus half is prose only. The corpus grows by design, and at ~154 B/line about three more promoted decisions silently break the promise with every test green | §3.6:390–399, §4.3 |

Scope legend: `Local` — addressed in this loop, discarded at harvest.

## Resolution of v1 findings

| v1 ID | Sev | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §3.6 re-executes the measurement, concedes the inertness claim, and acts on it twice: §4.3 shortens the citation to `[{sourcePath} § {id}]` (D-7, −33%), and §3.6 now states the order is live from the first dispatch. The REQ-owned default is routed upstream as ERR-2 with the numbers attached rather than decided here — the right disposition |
| F-02 | High | **Resolved** | §7.4 splits AT-04 and AT-05 onto different entry points, with a table naming what each falsifies. AT-05 now enters through `parseDecisionLedgerConfig` → `buildDecisionLedgerInjector`, so the four spellings are genuinely four inputs. The added implementer rule — "the recorded arm must consume the config text it is varying" — is the generalisation I wanted |
| F-03 | High | **Partially resolved → F-01 above** | The "Baseline identity" bullet now matches `loopEconomicsBaselineGuard.test.js:239–253` exactly, including the reason. Clause (b) of the pinning list was not edited with it |
| F-04 | High | **Resolved** | §3.4 names the positive conjunct (statement/`sourcePath` equal the project-level record's, transcribed from the fixture; `origin === "project"`; feature-level statement asserted absent) and states the two-mutation argument. §7.6's AT-18 row carries the assignment, so no conjunct points at an unassigned section |
| F-05 | High | **Resolved** | §7.3 states why the old wording was unimplementable so it is not re-attempted, then respecifies the census on the precedent's actual shape: a frozen `DECISION_LEDGER_CENSUS_TOKENS` set-equality-checked against the module's exported names, over the whole file minus four brace-matched owned regions. The non-empty-slice assertion is the anti-vacuity check I would have asked for. `sourceExcludingParser` exists at `advisoryDisabled.test.js:717` as cited |
| F-06 | Med | **Resolved** | D-8 + §4.2 make `renderDecisionLedgerBlock` the only producer; `selectDecisions` obtains `renderedBytes` by calling it |
| F-07 | Med | **Resolved, and better than asked** | §7 concedes the c8 per-file gate cannot see this feature inside a ~17k-line file, then replaces the percentage floor with a stronger checkable obligation: every one of §6.1's fourteen failure rows mapped to a named test in the PLAN task that implements it. Verified against `pdlc/workflows/package.json:9` — the gate is as described |
| F-08 | Med | **Resolved** | AT-03 now mutates the scripted `_readFile` double's returned text, not the fixture, and §7.6 explains why the two requirements were contradictory as literally stated |
| F-09 | Med | **Resolved** | §7.5 gives the property its own transcribed formatter and states the echo argument explicitly |
| F-10 | Low | **Resolved** | This spec's errata renamed `ERR-1`/`ERR-2`; `E-1` now unambiguously means FSPEC's |
| F-11 | Low | **Resolved** | §8.1 cites E-9/E-10/E-11 by id with a mechanism and a pinned fixture case each |
| F-12 | Low | **Resolved** | D-6 states placement outside the learnings sentinel region and gives the PROP-DIS-06 reason |
