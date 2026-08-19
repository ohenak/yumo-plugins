# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** docs/pdlc-advisory-wave-gate/TSPEC-pdlc-advisory-wave-gate.md (v1.1)
**Date:** 2026-08-20
**Iteration:** 2
**Scope:** Local
**Delta base:** `2747599e` (v1 review commit) → HEAD, 465 insertions / 78 deletions

## Round-1 findings: disposition

| Prior | Verdict | Evidence |
|---|---|---|
| F-01 High — AT-05-4's halt-report conjunct undesigned | **Resolved** | §4.5 now specifies the un-skip `haltError` gaining a second `{advisory: waveAdvisoryFields}` argument, `undefined` when A6 did not fire. Shipped site is a one-argument call (`pdlc/workflows/orchestrate-dev.js:14386`) and `haltError(message, fields)` already `Object.assign`s a second argument (`:3778-3785`), so the change is additive and the byte-identity claim survives |
| F-02 High — §5.1 under-scopes §1.3 | **Resolved** | §5.1 now carries 11 rows including `advisoryRecord`, `advisoryEscalationLog`, `advisoryHarvest`, `consolidationProperties`; every file §1.3 names is present. See F-14 for the arithmetic in the prose |
| F-03 High — no AT-to-test mapping | **Resolved, and checked mechanically** | §5.6 is a 45-row table; the AT id set in §5.6 is **set-equal** to the AT id set in FSPEC (45 = 45, no residue either way). This is the finding whose fix most changes what PLAN can derive |
| F-04 Medium — snapshot fixture unnamed | **Resolved** | §5.2 names `mkdtempSync` + `execFileSync` over a real temporary repo, the precedent it cites exists (`__tests__/advisoryDodSeams.test.js:371-384`, `:1216-1217`), and the status-vs-hash-map companion case is written |
| F-05 Medium — coverage mechanics wrong | **Resolved, and now accurate** | §5.4's two-stage table matches `pdlc/workflows/package.json` exactly: stage 1 c8 aggregate (branches 85, lines/functions/statements 90), stage 2 `--per-file --branches 85 --lines 0 --functions 0 --statements 0`, include set `orchestrate-dev.js`, `orchestrate-queue.js`, `build-runtime.mjs`. The added "coverage is a backstop, not an oracle, because A6 lands inside a ~15k-line module" paragraph is the honest reading and is why §5.5/§5.6 carry the weight |
| F-06 Medium — directory-row precondition | **Resolved** | §3.4 states the trailing-slash precondition and §5.5 tests both spellings. `pathsCollide`'s docblock and body confirm it (`orchestrate-dev.js:4720-4731`) |
| F-07 Medium — `apply`'s "tree changed" undefined | **Resolved** | §3.3 defines it as `producedPaths()` non-empty, and states the ignored-path-only consequence rather than leaving it latent |
| F-08 Medium — one-statement oracle | **Resolved** | §2.6 pins the widened notice as a single `emit` with a list, and §5.5 gives it the both-absent fixture |
| F-09 Medium — citation floor untested at the boundary | **Resolved** | §5.5 pins 23 and 24 on one fixture |
| F-10 / F-11 / F-12 Low | **Resolved** | `async () => true`; `commitPaths`'s `message` now spelled with a literal (the shipped destructure requires it, `orchestrate-dev.js:11755-11763`); Phase H2 citation corrected |

Two new High findings below are both in sections this round introduced.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-13 | High | Local | **The capture-failure escalation route and the one-snapshot-per-wave invariant cannot both hold as specified.** §3.2 step 4 routes a `captureTreeSnapshot` failure through "the same `__preDispatch` escape step 3 uses". That escape exists in exactly one place: the value returned by `seamOps.gatherEvidence()` (`orchestrate-dev.js:3395`, read at `:3401-3409`). `gatherEvidence` is called **inside the attempt loop** (`while (true)` at `:3393`), and a `verifyGate` returning `consumesAttempt: true` re-enters that loop (`:3554`) — which §3.3's `verifyGate` row explicitly relies on for the red-re-gate path. So capture-in-`gatherEvidence` re-captures on attempt 2, contradicting §2.5's "One snapshot per wave, not per attempt" and its consequence "attempt 2 starts where attempt 1 started"; capture-outside-`runAdvisorySeam` (which is what §3.2's step numbering literally reads, step 4 before step 5's `runAdvisorySeam` call) has no `__preDispatch` to reach and so writes neither the advisory record nor the escalation entry — the exact silence PM F-02 was raised about. Name the capture's home, state the memoisation (capture iff `snapshot === null`), and give §5.5 a two-attempt fixture asserting the capture verb reaches `_git` **once** and the second attempt's restore target hash-map equals the first's. Without that assertion the regression is invisible: a re-captured snapshot restores to a tree that still contains attempt 1's repair, and every existing oracle stays green | §3.2 step 4, §2.5, §3.3, §3.5 |
| F-14 | High | Local | **AC-4.1 conjunct (iii)'s mutation fixture has no design surface to be red against.** §5.5 specifies a fixture that injects a `verifyGate` which "records its call and returns without running the gate sequence" and then asserts the terminal disposition is not `resolved`. But nothing in §3.2 step 6 or §3.3 makes a resolution conditional on a gate invocation: step 6 reads `outcome === "resolved" ⇒ resolved: true`, and the driver derives `resolved` from the seam ops' own return. An injected `verifyGate` returning `{passed:true}` without gating therefore yields `resolved`, and the fixture fails not because the implementation is wrong but because the specified design has no rule to violate; an injected `verifyGate` returning `{passed:false}` makes the fixture a duplicate of conjunct (ii). The missing surface is one sentence in §3.2 step 6: a `resolved` terminal additionally requires the wave's `invocations` ledger (§2.4) to have grown by a `["post-wave", "test"]` pair since dispatch, and a resolution without it halts. That conjunct is what makes the mutation falsifiable and what discharges BR-7's "no advisory verdict substitutes for a gate result". State it in §3, then §5.5's fixture is a real red test | §5.5 (AC-4.1 (iii)), §3.2 step 6, §2.4 |
| F-15 | Medium | Local | **AT-06-1's oracle is written as containment where the contract is an enumeration.** §5.6's AT-06-1 row reads "containment against the tier's shape, with the class assertion A6's own". The entry's fields are an enumerated contract (wave, root-cause class, envelope determination, action, citation), so a dropped field passes a containment check. Assert the entry's field set by **set-equality** against a transcribed literal — the same doctrine §5.5 already applies to `A6_PROHIBITIONS` — and keep the value assertions on top of it | §5.6 (AT-06-1) |
| F-16 | Medium | Local | **§5.2's ignored-path round-trip case has an oracle that is not yet decided, and §5.6's AT-05-1 row still asserts the undecided side.** §5.2 case 4 is written "to the boundary that comes back from §2.5's erratum" and flagged upstream-pending, which is the right disclosure. But §5.6's AT-05-1 row states the oracle as "over tracked and untracked files alike, generated outputs included" with no pending flag, so the traceability table and the test description disagree about the same assertion. Mark the AT-05-1 row upstream-pending too, or the PLAN will mint a red-test task whose expected value is the one §2.5 says it does not get to choose | §5.6 (AT-05-1), §5.2, §6 OQ-7 |
| F-17 | Medium | Local | **The `(h)` prohibition test's negative is asserted against the `_git` double, but §5.5 does not say the double is the *only* transport A6 can reach.** "No `commit`/`push`/`tag` argv reached the transport" is falsifiable only if the repair agent cannot shell out independently. §3.3's dispatch options are stated to equal a shipped seam's (AT-07-5), which is where the tool grants live; say so in the `(h)` row so the oracle's premise is visible, and assert on the same run that the dispatch options object contains no additional grant relative to the shipped seam's — otherwise the negative is an assertion about the fixture rather than about A6 | §5.5 `(h)`, §3.3 |
| F-18 | Medium | Local | **A `snapshot-unavailable` escalation is claimed to carry §4.5's halt fields, but three of the four fields have no value at that point.** §2.5's table and §4.5's row both attach `{rootCause, diagnosis, repairApplied, repairPaths}` to the capture-failure halt, while the same table records that no dispatch and no diagnosis ever occurred. State the literal values (`rootCause: "unclassified"`, `diagnosis: null` or the fixed `snapshot-unavailable` sentence, `repairApplied: false`, `repairPaths: []`) so §5.5's six-assertion capture-failure fixture has transcribable expected values rather than deriving them from whatever the implementation produces | §2.5, §4.5, §5.5 |
| F-19 | Low | Local | §5.1's preamble says the earlier draft "named seven files where §1.3 declares ten"; §1.3's table names seven test-side files and §5.1 now carries eleven rows, so the relation is superset, not set-equality. The table itself is correct and complete — only the sentence describing it is arithmetically off, and a later reader checking the claim will stall on it | §5.1 |
| F-20 | Low | Local | §5.6's AT-07-1 row says the non-proposable rules are "listed and justified in the same test as a transcribed literal". Say against what the literal is compared: BR-1…BR-16 minus the proposable set must equal the transcribed non-proposable set, checked by set-equality, or a rule that silently becomes proposable leaves the partition still green | §5.6 (AT-07-1) |

## Questions

| ID | Question |
|----|---------|
| Q-01 | If F-13 resolves toward capture inside `gatherEvidence` with memoisation, does the wave-budget check (§3.2 step 3) also re-run per attempt, and is that harmless? It reads harmless — the budget only increments on `resolved` — but it is the second escape sharing the same per-attempt call site, and the answer belongs in §3.3's `gatherEvidence` row rather than in a reader's head. |
| Q-02 | §5.5's `(g)` row asserts `.claude/pdlc.config.json` is byte-identical after the run. Is the fixture's repo required to *have* that file? A byte-identity assertion over an absent file is satisfied by absence, which is not the property meant. |

## Positive Observations

- §5.6 is the change that most improves what Phase P can produce: a 45-row AT→home→oracle table that I could check by set-equality against FSPEC rather than by reading. That is the difference between a theme list and a contract.
- §5.4's correction did not stop at the mechanics; it drew the consequence (A6's branches cannot move a 15k-line module's per-file number, so the floor is a backstop and not an oracle) and then paid for it with an explicit branch inventory. Getting a worse answer and stating it is the right trade.
- §3.3's precedence residual is argued in three parts — what is not at risk, what is, and why a script conjunct would be worse — instead of quietly dropping BR-16's over-broad claim.
- §5.5's rule that every prohibition test carries its paired positive on the same run, named as `AC-4.5` in the suite so it is greppable, is exactly the discipline that keeps a negative from being satisfied by a seam that never fired.
- §5.2's rejection of an injected `_git` for the round-trip oracle, with the reason stated (a fake can only replay what the fixture told it), is the correct call on the one assertion in this feature that a double would turn into an echo.

## Recommendation

**Needs revision**

Two High findings, both additive and both in §3. F-13 is the load-bearing one: as written, the capture-failure escalation route and the one-snapshot-per-wave invariant are mutually exclusive, and the failure mode is silent under every oracle currently named. F-14 asks for one sentence in §3.2 step 6 that turns a specified-but-vacuous mutation fixture into a red test. Neither implies a design change beyond naming a home and a conjunct that the document already assumes.

## Verdict

VERDICT: Needs revision
{"high": 2, "medium": 4, "low": 2}
