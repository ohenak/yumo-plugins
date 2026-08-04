# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.1, 2026-08-03)
**Date:** 2026-08-03
**Iteration:** 1
**Scope:** Local

## Grounding

Every structural claim in this review was checked against the working tree, not against the upstream
documents alone. Branch `feat-pdlc-advisory-tier`, HEAD `e7ffd1d` (the PLAN cites `ca55bb6`; the
thirteen commits since are the PLAN's own authoring commits, and `orchestrate-dev.js`,
`orchestrate-queue.js` and `build-runtime.mjs` are byte-for-byte unchanged at 8,642 / 1,587 / 383
lines — the PLAN's §1 figures).

What was verified, and what it showed:

- **The §2.1 pre-flight claim.** `git merge-base --is-ancestor 26c3f1c HEAD` and
  `… 5d66c48 HEAD` both succeed. The rebase TSPEC §13.6 asks for is genuinely already satisfied.
- **Every §2.2 `BL-PREREQ` symbol and line.** All eighteen resolve at the stated locations:
  `effectiveGuardPaths` (`orchestrate-dev.js:708`), `guardVerdict` (`:731`),
  `parseImplementationConfig` (`:181`), `MERGE_ESCALATIONS` (`:1321`), `MODEL_IMPLEMENTATION`
  (`:1621`), `parsePlanTasks` (`:2039`), `checkPrCi` (`:5927`), `parseDodStatus` (`:6059`),
  `rebaseOntoDefault` (`:6254`), `dodVerifyLoop` (`:6273`), `raisePrAndVerifyCi` (`:6337`),
  `computeTopologicalBatches` (`:6533`), `defaultAppendFile` (`:6805`), `gitWithLockRetry` (`:6862`),
  `commitPaths` (`:6905`), `buildFinalReport` (`:8595`); `parseQueue` (`orchestrate-queue.js:116`),
  `parseTriageVerdict` (`:302`), `precheckDependencies` (`:630`), `triagePrompt` (`:653`),
  `runPicked` (`:961`), `buildQueueReport` (`:1221`). The two "module-private at HEAD" claims are
  correct: `commitPaths` (`:6905`) and `buildFinalReport` (`:8595`) carry no `export`.
- **The §7 integration ranges.** `orchestrate-dev.js:8282-8288` is exactly the rebase-conflict
  `recordPhase` + `throw haltError`; `:8294-8302` is exactly the DoD-not-passed pair; `:6371-6373`
  is exactly `if (status === "failed") { throw haltError(...) }`; `:8342`/`:8348` are the literal
  guard-block test and the `/pdlc guard: refusing to delete CROSS-REVIEW files in \[([^\]]+)\]/`
  extraction; `build-runtime.mjs:87` is the dev export array and `:96-103` the queue prelude;
  `guard-harvest-before-delete.sh:35`, `:43`, `:57-59` are the early-exit test, token regex and
  refusal message.
- **The §5.1 defect the new task A-00 repairs.** `.claude/pdlc.config.json` holds
  `cd pdlc/workflows && npm test -- --testPathIgnorePatterns=documentOracles` verbatim, and
  `pdlc/workflows/package.json`'s `jest` block sets `testPathIgnorePatterns` to
  `["/node_modules/", "/__tests__/helpers/", "/__tests__/fixtures/"]`. The override-replaces-list
  claim is real, and it does bite this feature specifically (A-02 lands a module under
  `__tests__/helpers/`, A-15 a fixture under `__tests__/fixtures/`).
- **The §6.4 coverage claim.** That same `jest` block carries no `collectCoverage`,
  `coverageThreshold` or `coverageProvider` key — the PLAN's "there is no configured coverage gate
  to inherit" is accurate, and the withdrawal recorded in the v1.1 changelog was the right call.
- **The test-suite layout the coverage map assumes.** 69 `*.test.js` files exist under
  `pdlc/workflows/__tests__/`; excluding `documentOracles` leaves 68, exactly the count §5.1 states.
  `helpers/mergeDoubles.js`, `helpers/seams.js`, `helpers/guardFixtures.js` and
  `fixtures/tmpGitFixture.js` — the four shipped assets §6.1/§6.2 compose with rather than
  re-author — all exist.
- **Case-count arithmetic against FSPEC §18.1.** The ten series and the 81 total are FSPEC's own,
  and every per-file split in §8.1 sums to its series count (T-01 2+5=7, T-02 2+4=6, T-03 8+2=10,
  T-08 4+7=11).

Only findings that survived that check appear below.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **§8.2 narrows T-03-6's quantification, and AC-4.5's gate table loses its named test.** FSPEC §18.2 quantifies T-03-6 over "every prohibition P-1…P-4 **and every gate row of §5.4**", and names the widening it catches as "a prohibition that holds only by accident, **with no gate re-run behind it**". PLAN §8.2 expands it as "four cases, each asserting the negative *and* the positive triple on the same path" — the gate rows are dropped, and §9.2's DoD checkbox inherits the same narrowing ("Each of P-1…P-4 has a test asserting the negative **and** the V-8 positive triple"). REQ AC-4.6 requires a test for **AC-4.1 through AC-4.5**, and AC-4.5 *is* the five-row gate table (A1 none / A2 next-invocation triage / A3 DOD verify / A4 rebase+tests / A5 rollup read); TSPEC §5.4 ships it as a second table of five `verifyGate` rows. As written, a PLAN executor satisfies §8.2 and §9.2 with four cases and AC-4.5 has no case of its own — the per-seam T-05/T-06/T-07 cases exercise `verifyGate` incidentally but nothing quantifies over the row set, so a seam whose gate is silently removed or stubbed to `() => ({passed:true})` fails no test. **Fix:** restate §8.2's T-03-6 row as "every prohibition P-1…P-4 **and** every gate row of TSPEC §5.4 — four prohibition cases plus one parameterised case per `ADVISORY_SEAMS` member asserting that the seam's `resolved` outcome is reachable only through its declared `verifyGate`", assign it to A-07 (the driver's contract) with A-23/A-24 as green owners, and mirror the widened wording into §9.2's third checkbox. | REQ-ADV-04 AC-4.5, AC-4.6; FSPEC §18.2 |
| F-02 | Medium | Local | **T-10-4 is assigned to two test files, contradicting §8.1's own one-home rule.** §8.1 opens "Every case has exactly one home" and routes all of T-10-1…T-10-5 to `advisoryDisabled.test.js` (🔴 owner A-16, 🟢 owner A-33). But A-03's task row in §3 reads "T-01-1, T-01-6, **T-10-4**: … the emit gate on effective `enabled`", placing T-10-4 in `advisoryConfig.test.js` (🔴 A-03, 🟢 A-17) as well. Two owners for one case is the classic route to zero real assertions — each owner can reasonably read the other as the home — and the case at stake is a product-visible one: TSPEC §3.2 C-2 requires that a degraded config key which resolves the tier **disabled** produces a run carrying no advisory content on the report at all, which is NFR-3's inertness promise on the failure path. **Fix:** pick one home. Recommended: keep T-10-4 in `advisoryDisabled.test.js` (it is a disabled-run equivalence claim, and §8.1's series-to-section mapping is the auditable one), drop the `T-10-4` token from A-03's row, and describe A-03's third obligation as the `invalidKeys` emit-gate mechanism without claiming the FSPEC case id. | REQ-ADV-01 AC-1.6, AC-1.7; NFR-3 |
| F-03 | Medium | Local | **A-34 is a manual, out-of-band verification scheduled inside an automated implementation wave, with no stated rule for what to record when the wave cannot perform it.** The row asks the implementer to "dispatch one trivial advisory agent on `\"fable\"` in a real workflow runtime; record which branch of the §3.4 ladder fired, verbatim". Its batch-17 gate (§5.2, executor 19–20) is "Green + full oracles" — a jest gate that cannot observe whether the dispatch happened, and an se-implement agent in a wave has no real workflow runtime to dispatch into. The failure mode is not a red suite, it is a plausible-looking `MANUAL-VERIFICATION-*.md` transcribing an assumed result — mock data in a document the §9.4 DoD checkbox then ticks, and the sole evidence the operator has for which model rung is actually the production path (AC-1.3's "always distinguishable" promise). **Fix:** give A-34 an explicit discharge rule in its own row and in §9.4: if no real runtime is available to the executing agent, the file must record `RESULT: unverified — no runtime available`, name what would settle it, and the §9.4 checkbox is satisfied by that honest record; a recorded branch is admissible **only** with the verbatim runtime output pasted in. Also state that fabricating or inferring the result is a DoD violation, so `dod-verify`'s mock-data scan has something to bind to. | REQ-ADV-01 AC-1.1, AC-1.2, AC-1.3; BL-01 |
| F-04 | Low | Local | **§8.1's total row miscounts the test files, and undercounts by one against §4's manifest.** The row reads "13 files (11 above + `advisoryPreflight.test.js`, `advisoryBundle.test.js`)". Twelve distinct files appear in the rows above — `advisoryConfig`, `advisoryRung`, `advisoryVerdict`, `advisoryDriver`, `advisoryEnvelope`, `advisoryQueueSeams`, `advisoryDodSeams`, `advisoryPubSeam`, `advisoryRecord`, `advisoryHarvest`, `advisoryEscalationLog`, `advisoryDisabled` — so the true total is 14, which is exactly what §4's manifest owns (A-01, A-03…A-14, A-16). The coverage map is the instrument a DoD reviewer counts against; a total that disagrees with the manifest by one lets a missing file pass an audit. **Fix:** "14 files (12 above + `advisoryPreflight.test.js`, `advisoryBundle.test.js`)". | Traceability (FSPEC §18.1) |
| F-05 | Low | Local | **§4.1's prose count contradicts its own table.** The section opens "Nine tasks own `orchestrate-dev.js`, four own `orchestrate-queue.js`", and the table immediately below lists twelve dev-side owners (A-17, A-18, A-19, A-20, A-21, A-22, A-23, A-24, A-25, A-26, A-27, A-33) and states "twelve distinct batches for twelve owners". The four queue-side owners are right. §4.1 is the disjointness audit that batch-safety rule 2 rests on, so an internal contradiction there is worth removing even though the table itself is correct. **Fix:** "Twelve tasks own `orchestrate-dev.js`, four own `orchestrate-queue.js`". | Batch-safety rule 2 |
| F-06 | Low | Local | **§6.3's queue-side disposition stops one sentence short of AC-9.1's stated mechanism.** The `ADVISORY-{feature}.md` row ends "Queue-side records persist by design — no queue-side path distils them." That is faithful to TSPEC H-2b, but AC-9.1 says more: the A1/A2 record is written under the **candidate feature's** directory precisely so that a `hold`/`escalate` adjudication "leaves it for **that feature's next run** to harvest at Phase PUB (AC-9.3)". Read alone, "persist by design" reads as permanent retention and contradicts AC-9.3's "`ADVISORY-{feature}.md` is absent at end of run". §6.3 is the section an operator consults to know whether a file in their tree is scaffolding or output, so the eventual-harvest path belongs in it. **Fix:** append "— the candidate feature's own next dev-side run picks the record up at its post-PUB distil step (AC-9.1), so persistence is deferral, not retention." | REQ-ADV-09 AC-9.1, AC-9.3 |
| F-07 | Low | Local | **A-00 is enabling work outside REQ §5's scope statement and is not declared as such.** REQ §5 scopes this feature to the advisory rung, contract, envelope, five seams, prohibitions, record, escalation output and tests; repairing `.claude/pdlc.config.json` → `implementation.testCommand` is none of those, and it changes a repo-wide file every future feature's wave gate reads. The PLAN's justification in §5.1 is sound and the defect is real (verified above), so this is not a request to remove the task — but §1's "Not in scope" paragraph and §10.1's open-items table are where a DoD reviewer looks, and neither mentions it, so A-00 will read as scope creep at Phase DOD. **Fix:** add one line to §1 declaring A-00 as out-of-REQ-scope enabling work that batch 1 must land before any advisory batch can run, cross-referencing §5.1's reproduction, and add it to §10.1 as a carried item. | REQ §5 Scope |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §5.1 says batch 1's gate is "re-run by hand once after A-00 lands" because the wave runner may have cached `implementation.testCommand` before the wave began. In an unattended queue run there is no hand. Does A-00 need to be landed by an operator *before* the pipeline is invoked, rather than as batch-1 task — and if so, should it be lifted out of the task table into a pre-flight instruction alongside §2.1? |
| Q-02 | §6.3 lists `MANUAL-VERIFICATION-pdlc-advisory-tier.md` as "harvested into LEARNINGS at Phase H, then deleted", and notes the harvest guard does not watch that pattern. Given F-03, is the LEARNINGS entry required to carry the verification verbatim — including an `unverified` outcome — so the one durable fact survives the delete? |
| Q-03 | §8.1 assigns T-08-6 ("all five seams appear in the summary, four with zero counts") to `advisoryHarvest.test.js` while the sibling summary case T-08-10 goes to `advisoryRecord.test.js`. Both are AC-9.4 assertions about the same six-row table. Is the split deliberate (harvest owns T-08-3…T-08-6 as a contiguous range), or would AC-9.4's obligation be easier to audit with both summary cases in one file? |
| Q-04 | §10.1 item 4 accepts that Phase MERGE will defer more often because of the extra post-PUB commit, "visible as a deferral with a reason on the report, never silent". Is the *reason string* an operator can act on already covered by an existing MERGE reason, or does that reason need to name the advisory distil commit specifically to be actionable? |

## Positive Observations

## Recommendation

