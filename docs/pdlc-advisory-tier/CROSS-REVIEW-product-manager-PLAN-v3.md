# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-advisory-tier/PLAN-pdlc-advisory-tier.md` (v1.3, 2026-08-03)
**Date:** 2026-08-03
**Iteration:** 3
**Scope:** Local

## Grounding

Delta re-review. Base for the diff is `2a290df`, the commit v2 reviewed; the document has moved
through eleven authoring commits to HEAD `7a44317` (+182 / −74 lines). I read the diff, not the
document, and re-executed every mechanical claim the revision newly makes.

What was re-run at HEAD, and what it showed:

- **The manifest-overlap argument holds in code, not just in prose.** `validatePlanContract`
  (`pdlc/workflows/orchestrate-dev.js:2344`) checks only the two bijection directions — task without
  a row, row without a task — and its own doc comment says so explicitly: *"File OVERLAP between rows
  is NOT a problem. Overlap is the normal case in a real PLAN … waves are what separate the writers,
  and rejecting overlap here would reject correct PLANs"* (`:2334-2338`). `pathsCollide` is at
  `:2377` and is what actually separates writers. §4's new preamble cites both correctly.
- **The re-parse figures are real, and I re-derived the wave partition rather than trusting the
  claim.** Against this document at HEAD: `parsePlanTasks` ⇒ **36 tasks**, `parsePlanOwnership` ⇒
  **36 rows**, `validatePlanContract` ⇒ `{"ok":true}`, `computeTopologicalBatches` ⇒ **20 batches**,
  no cycle, and `computeWaves` ⇒ **20 waves** — `[[A-01],[A-02],[A-03…A-07],[A-08…A-12],[A-13…A-15],
  [A-16,A-17,A-28],[A-18],[A-19],[A-20],[A-21],[A-22],[A-23,A-29],[A-24,A-30],[A-25,A-31],[A-26],
  [A-27],[A-32],[A-33],[A-34,A-35],[A-36]]`. That is identical to §5.2's transcription, so no batch
  had to be split by `pathsCollide` — the widened manifest cost nothing and §4.1's "re-executed after
  the v1.3 manifest edit" paragraph is accurate line for line.
- **Every writer of a shared test file lands in a different wave.** `advisoryDriver.test.js` is
  written by A-07 (wave 3), A-22 (11), A-23 (12), A-24 (13), A-31 (14); `advisoryDodSeams.test.js` by
  A-10 (4), A-23 (12), A-25 (14); `advisoryHarvest.test.js` by A-13 (5), A-28 (6), A-27 (16). The
  "one block, one un-skipper, one wave" discipline is now mechanically enforced, exactly as F-08
  asked.
- **The prompt lines the revision reasons from.** `Do NOT run git add or git commit — the
  orchestrator verifies your work and commits it.` is `orchestrate-dev.js:5851`, and the script
  commits once per task at `:8143-8159`, pathspec-scoped to `task.files`. The ownership line is at
  **`:5850`**, not `:5849` (`:5849` is the *"Run only your task's targeted tests — do not run the
  full suite"* line) — a one-line citation slip carried over from my own v2 finding, noted below and
  not worth a finding of its own. F-10 is about `:5849`'s actual content.
- **A-01's fresh-clone branch is grounded.** `.github/workflows/pr-tests.yml:75` is bare
  `run: npm test`, and `parseImplementationConfig`'s `if (text == null) return degraded(false)` at
  `:188` returns exactly `{ config: IMPLEMENTATION_DEFAULTS, sectionMalformed: false, invalidKeys: [] }`
  (`:182-186`), with `IMPLEMENTATION_DEFAULTS.testCommand === null` at `:160-164`. Both cited line
  ranges and the asserted literal are correct.
- **§6.4's arithmetic after the F-09 fix.** The dev-module row lists 22 names, the queue row now
  lists 2 (`hasResidualSeamToken`, `honourA1Verdict`) — 24, matching §9.1's "all 24 enumerated
  function names resolve" unchanged. The denominator and the declared surface now agree.
- **`PLAN_FILES_HEADER_CELLS`** is an exact-cell set at `:2188-2195`, so §4's parenthetical warning
  against re-wording the header cell is correct and worth keeping.

Only findings that survived that check appear below.

## Prior findings — disposition

| v2 ID | Severity | Status | Evidence in v1.3 |
|---|---|---|---|
| F-08 | High | **Resolved, in all three parts.** | (1) §4's manifest gives every 🟢 task the test file it un-skips (A-17…A-33 rows), and §4's opening is restated as "the 🔴 task … remains its only writer of **case bodies**", which is the invariant that matters. (2) §3 step 3 now explains *why* the edit is legal against the runner, and step 4 replaces the two-commit pair with "captures the verbatim failure output and reports it in its task summary … the red evidence is that transcript plus the wave's single script-owned commit"; §9.2's first checkbox is restated identically, including "A green task whose summary contains no captured failure output does not satisfy this row" — so the DoD row is still falsifiable, just against something the runner can produce. (3) The gate was re-run and §4.1 re-transcribed; I re-executed it independently and got the same 36/36/`{"ok":true}`/20 batches/20 waves, with the wave partition unchanged. §9.1's "No task's diff touches a file outside its §4 manifest row" is now satisfiable by construction. |
| F-09 | Low | **Resolved** | §6.4's queue row now reads "`hasResidualSeamToken` and `honourA1Verdict` — **and nothing else**", and the exclusion paragraph explains the mechanical reason (the reducer selects by `fnMap` name match, so a partial function cannot be expressed) and names the behavioural evidence that replaces it (T-04-1, T-04-2, T-04-3, T-04-3b plus the A2 citation-drift obligation, owned by A-12 🔴 / A-29 🟢). The declared surface and the measured surface are the same 24 names. |
| Q-05 | — | **Answered, and the answer became §5.2's new paragraph** | The per-file assertions are now read off a `--json` run rather than the aggregate summary, with the exact fields named (`numPassingTests`/`numFailingTests`/`numPendingTests` per `testFilePath`) and the pass/fail authority left with the script-owned aggregate. The mechanism is right; F-10 below is only about which command produces it. |
| Q-06 | — | **Answered by execution, not by assertion** | §4.1 re-ran `computeWaves` and reports 20 waves identical to §5.2. I re-ran it too and confirm it. |
| Q-07 | — | **Answered and recorded** | §2.4 gains an explicit "*The residual risk the operator accepts by leaving it untracked*" paragraph, and §10.1 item 7 carries it with the failure mode named ("no signal until wave 1 halts") and the recovery. It is now a recorded deferral rather than an implied one. |

## Findings

Both v2 findings are resolved. Both findings below are **new** and both live inside sections the
revision changed — §5.2's new evidence paragraph and §10's changelog.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-10 | Medium | Local | **§5.2's new evidence procedure instructs the wave agent to run the full suite, which the wave prompt explicitly forbids — so the per-file oracles that prove the skipped-red discipline worked cannot be produced by a compliant agent.** §5.2:465-466 reads "the wave agent runs `npm test -- --json --outputFile=/tmp/adv-gate.json --testPathIgnorePatterns …`", and batch 3–5, batch 7–17 and batch 18 all read their per-file numbers off that run. But the wave prompt tells every agent, verbatim, `Run only your task's targeted tests — do not run the full suite; the orchestrator runs it.` (`pdlc/workflows/orchestrate-dev.js:5849`) — the line immediately above the two lines this revision correctly reasoned from (`:5850`, `:5851`). This is the same class of defect F-08 named, one paragraph further on: a procedure written against a runner that forbids it. The product consequence is narrower than F-08's, which is why this is Medium and not High — the primary red evidence (§3 step 4) is the task's own *targeted* run and is permitted, and §5.2 batch 18's zero-skips check (a) is a shipped in-file case that runs in the ordinary suite. What is at risk is the supporting half: batch 3–5's "the newly added files contribute zero passing and zero failing cases" (the oracle that catches a *defective red* — a case that passes before the production code exists) and batch 7–17's "`numPendingTests` falls by exactly that block's case count and by no more". An agent that obeys `:5849` produces neither, and §9.2's first checkbox — the DoD row carrying FSPEC §18.1's "failing before, passing after" for all 81 cases — loses its corroboration. **Fix (one sentence, no loss of power):** scope the `--json` run to the advisory paths, which is a *targeted* run the prompt permits and which yields every number §5.2 reads — e.g. `npm test -- --json --outputFile=/tmp/adv-gate.json --testPathIgnorePatterns '/node_modules/' '/__tests__/helpers/' '/__tests__/fixtures/' 'documentOracles' -- advisory` (or an explicit `--testPathPattern 'advisory.*\.test\.js'`). Every assertion in §5.2 is already stated over `advisory*.test.js` paths only, so nothing is given up. State in the same paragraph that the run is deliberately targeted because `:5849` reserves full-suite runs to the script. | REQ-ADV-04 AC-4.6; FSPEC §18.1; §5.2, §9.2 |
| F-11 | Low | Local | **A blank line splits the changelog table in two, so the 1.2 and 1.3 rows — the two rows a Phase DOD reviewer most needs — render as literal pipe text rather than as table rows.** `PLAN-pdlc-advisory-tier.md:907` is empty, between the `1.1` row (`:906`) and the `1.2` row (`:908`); a markdown table ends at a blank line, and the rows that follow carry no header/delimiter pair of their own, so they render unformatted. This is cosmetic — nothing parses the changelog, and the frontmatter status table at `:13-15` is correctly a separate table now that the stray 1.2 row was moved out of it (a real improvement over v1.2) — but the two revision rows that explain *why* the skip discipline and the manifest look the way they do are the ones a reviewer reads first. **Fix:** delete the blank line at `:907` so all four version rows sit in the one table under the `| Version | Date | Change |` header at `:903`. | §10 |

## Questions

| ID | Question |
|----|---------|
| Q-08 | §8.2 puts the `ADVISORY_SEAMS` set-equality case in A-22's block at wave 11, written "over an in-file registry of names, not over case results", while the five per-seam cases are un-skipped later (waves 12–14). That is the right call for the *sixth-seam* failure mode. But the registry is hand-maintained: does anything fail if a registry entry exists and its per-seam case is deleted or never authored? If the five cases are generated *from* the registry (as §8.2's "the five per-seam cases are generated from that registry" suggests), the answer is yes and the loop is closed — worth stating in one clause so a reviewer does not have to infer it. |
| Q-09 | §5.2 batch 7–17 asserts `numPendingTests` "falls by exactly that block's case count and by no more". Where does the executor get the expected per-block case count from — the 🔴 task's summary, a count written into the block name, or a re-read of the file? A number nobody records is a number nobody can compare against. One clause naming its source would make the assertion mechanical rather than nominal. |

## Positive Observations

- **F-08 was resolved by making the discipline mechanical instead of merely argued.** The v1.2 PLAN
  claimed "each block has exactly one un-skipper" and asked the reader to trust the batch labels.
  v1.3 puts the test files in the manifest rows so `computeWaves`/`pathsCollide` (`:2377`) *enforces*
  it, and then proves the enforcement cost nothing by re-running the partition. I re-executed it
  independently — 20 waves, identical to §5.2 — and every writer of every shared test file lands in
  a distinct wave. Turning a promise into an invariant the tooling checks is the strongest form this
  fix could have taken.
- **§3's new un-skipper rule is the general law the special cases were instances of.** "A
  `describe.skip` block's un-skipper is the task that lands the **last** symbol the block's cases
  exercise", with both failure directions named (un-skipped early ⇒ the wave gate halts at
  `:8113-8118`; un-skipped late ⇒ cases that never ran), converts a per-row judgement call into
  something a reviewer can check row by row. It immediately paid for itself: it is what moved
  T-02-4/T-02-5 to the driver file (FSPEC:287-288 — the attempt loop needs `runAdvisorySeam`, which
  A-22 lands at wave 11, not A-19 at wave 8) and what splits T-03-6(b) into three further blocks by
  gate owner. Rules that produce their own corollaries are worth more than the corollaries.
- **A-01's config pin now asserts a positive in both worlds, and the CI branch is the one that was
  most likely to be a silent skip.** Branching on presence and asserting
  `parseImplementationConfig(null)` ⇒ `{ config: IMPLEMENTATION_DEFAULTS, sectionMalformed: false,
  invalidKeys: [] }` with `testCommand === null` — verified at `:182-188` and `:160-164` — means the
  fresh-clone leg (`pr-tests.yml:75` runs bare `npm test`) tests the *documented degradation* rather
  than skipping. That is the no-absence-only-oracles rule applied to a test-environment branch, which
  is exactly where it usually gets dropped, and it also makes the operator's tracking decision
  (§10.1 item 7) genuinely free rather than nominally free.
- **P-9 declined to invent a spec, and said so where it can be acted on.** Scoping the property to
  non-empty multisets, transcribing the order from `TSPEC:856` rather than deriving it, stating
  plainly that "pinning a value here would make the test assert the implementer's pick rather than
  the spec", and then carrying `governingClass([])` as §10.1 item 6 *and* an erratum — that is the
  correct handling of an upstream gap. The closing note that no seam path reaches it with an empty
  list (A3-1 already treats an under-classified finding set as malformed) is what makes it a
  non-blocker rather than a deferral of unknown size.
- **P-4 was rewritten against the real signature instead of the imagined one.** Replacing the
  idempotence law — which `classifyEnvelope(candidate, ctx) ⇒ { inside, reason, matched }`
  (TSPEC:517) cannot support, since it returns no `ctx` — with determinism + purity, closure over
  `ADVISORY_REFUSAL_REASONS ∪ {null}`, and the coherence conjunct `inside === (reason === null)` is a
  strictly better property: the third is the invariant a wrong implementation actually breaks, and
  the explicit refusal to pin `matched`'s contents applies P-9's lesson in the same edit.
- **§6.4's exclusion is argued from the instrument's limits, not asserted.** "The percentage cannot
  express 'part of a function'" is the honest reason, and pairing it with the named behavioural cases
  that do cover the branches (T-04-1…T-04-3b, the A2 citation-drift obligation) means the surface is
  still covered — just not by that number. Adding `documentOracles` to the coverage invocation for
  the reason §5.1 already gives (`coveredViolations` walks the whole tree, so an untracked local file
  reddens it) while keeping §9.1's full-oracle run on a clean tree is the right split.
- **The changelog marks its own superseded clause rather than quietly rewriting history.** The 1.2
  row now carries "(**superseded in 1.3** — the runner commits once per task)" inline. A reader who
  finds the old red→green-pair language in a downstream document can now trace why it changed instead
  of concluding the two documents disagree.

## Recommendation

**Needs revision.**

Both v2 findings are resolved, and the revision is convergent: the High was fixed at its root, the
fix was verified by execution rather than asserted, and I re-executed the verification myself and got
the same numbers. Nothing I approved in earlier rounds was broken by these edits. The document is one
sentence away from approval.

1. **F-10** (Medium) — scope §5.2's `--json` evidence run to the `advisory*.test.js` paths, so it is a
   *targeted* run the wave prompt permits (`orchestrate-dev.js:5849` reserves full-suite runs to the
   script). Every per-file assertion in §5.2 is already stated over those paths only, so the change
   costs nothing and restores the corroboration behind §9.2's first checkbox.
2. **F-11** (Low) — delete the blank line at `:907` so the 1.2 and 1.3 changelog rows render inside
   the table.

No erratum is raised by this review. TSPEC's unspecified `governingClass([])` is already raised as an
erratum by the PLAN itself (§10.1 item 6) and needs nothing further from this document; TSPEC §7.4's
`T-06-8`, outside FSPEC §18.1's catalogue, remains flagged in §8.3 note 2 and was raised against TSPEC
in round 1.

## Verdict

VERDICT: Needs revision
{"high": 0, "medium": 1, "low": 1}
