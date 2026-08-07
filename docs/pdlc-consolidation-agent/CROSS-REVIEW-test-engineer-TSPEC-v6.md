# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-consolidation-agent/TSPEC-pdlc-consolidation-agent.md` (v1.6)
**Date:** 2026-08-06
**Iteration:** 6

**Scope:** Delta re-review under the Phase-T decision freeze (POSTMORTEM-T `## Resolution`,
`RESOLVED: yes` at `:14`). Baseline `9436e87` (the v1.4 bytes v5 reviewed) → HEAD `c8c5760`; 183
insertions, 27 deletions across fourteen commits. Two passes: (1) each of v5's three findings and
three questions, verified at the mechanism rather than at the revision's account of it; (2) the
changed text only, read for new issues. Unchanged sections already approved are not re-litigated.
The approval bar is unchanged — any open High or Medium means **Needs revision**.

## Disposition of v5 findings

All three are resolved, and all three questions are answered in the document.

| v5 | Severity | Status | Evidence I checked |
|----|----------|--------|--------------------|
| F-01 | Medium | **Resolved, both halves** | §12.2 carries a new unnumbered `(no FSPEC AT)` row asserting the **key set of `rtConsInjections()` set-equal to §5.1's declared seam names**, explicitly widened from `adapterProbe.test.js:253-258`'s per-name containment ("wires all three into `rtDevInjections`" — I read it; it is three `toBe` identities, so the widening is a real change of shape and not a re-description) because a *surplus* key is as much a drift signal as a missing one. §12.3 assigns it to `consolidationBuild.test.js` (L3) and states why that file owns it. §5.5 now says what the module defaults do **in the runtime**: I verified the premise — `defaultReadFile` is `const { readFileSync } = await import("fs")` (`orchestrate-queue.js:948-955`), and `import()` does not exist in the bundle — and `defaultCheckFile` is specified to **throw** rather than return a legal `{ok:false}`, deliberately not copying `checkFileNonEmpty`'s never-throw catch (`orchestrate-dev.js:3690-3692` — the `catch { return {ok:false, reason:"file_missing"} }`, correctly cited after this round's fix). The unwired-seam precedent is quoted accurately from `runtime-adapter.js:1098-1100` |
| F-02 | Medium | **Resolved, and the wrong line is withdrawn by name** | §7.3's sequence is now `check → read → verdict → write → read back → …` (`:990`), the lead-in reads "Take is `_checkFile`, then `_readFile`, then `_writeFile` — **observe-then-write**" (`:969`), §10.4 item 1 is respelled to the three-call span, and §13.1 row 5's "non-atomic" spelling was made consistent in a commit of its own. The added paragraph states the expected call prefix `["check", "read", "write", "read"]` — I checked the double: `fakeFs` pushes `op: "check"` (`__tests__/helpers/seams.js:304`), `"read"` (`:259`) and `"write"` (`:282`), so that expected value is spelled in the vocabulary the double actually records, and the header example it cites (`:241`) exists |
| F-03 | Low | **Resolved** | §11.2 now shows the drain as `try { …assertions… } finally { await new Promise((r) => setTimeout(r, 0)); }` and says in as many words why the trailing form was wrong — the timer is pending only on the broken implementation, which is the world the mandated mutation check puts the suite in |

**Questions.** Q-01 is answered in §11.1 by a paragraph that records the L4 pathspec case's
*non*-coverage and ties the choice to §13.3's erratum: `--exclude-standard` is inert under
`git add -A` + `--cached`, pinning it would pre-empt the answer this layer declined to give, and the
paragraph states what happens to the conjunct under each answer. Q-02 is answered structurally
rather than verbally — the counter assertion moved out of `afterAll` into its own top-level `test()`
declared last, which is the repair, not a softening. Q-03 is answered in §5.1's `CheckReply` comment,
which now records the byte-size (`test -s`, `runtime-adapter.js:823`) vs. trimmed-content
(`seams.js:298`) divergence, states that nothing in the document reads *which* reason came back, and
tells a future editor not to build on the distinction. I re-verified both mechanisms; the citations
are exact after this round's `:820`→`:823` correction.

## Findings

Three, all in text that did not exist at v5. One Medium: the decision this whole round exists to
confirm — decision 2, "`present` is never derived from `_readFile(...) !== null`" — has no fixture
anywhere in §12 that can tell the two implementations apart. Neither of the other two is blocking.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | No fixture in §12.2/§12.3 puts an **empty** marker on the tree, so §10.3's new row 4a is asserted by nothing and the forbidden `_readFile(...) !== null` derivation greens the entire specified suite. This is the round's central decision and the one it names as the bug being avoided | §7.3 decision 2, §10.3 row 4a, §12.2, §12.3 |
| F-02 | Low | Local | §12.2's new release row keys `{taken?, released?}` on the terminal status, but `refused` has **two** arms with opposite `taken` values — §7.3's failed-take arm writes `IN-PROGRESS` and releases nothing. The row's expected pair is therefore fixture-dependent and reds on correct code if the implementer picks the other arm | §12.2 release row, §7.3, §10.3 row 5a |
| F-03 | Low | Local | `BR-15` is cited as `FSPEC-…:2500`; it is at `:2502` (`:2500` is BR-13). Every other citation in the new text verifies exactly | §12.2 release row |

## Detail

## Questions

## Positive Observations

## Recommendation

## Verdict
