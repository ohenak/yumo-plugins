# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.7)
**Upstream read:** `REQ-pdlc-engine-distribution.md` (AC-2.1, AC-2.4, AC-5.3), `FSPEC-pdlc-engine-distribution.md` (§5.2)
**Prior review:** `CROSS-REVIEW-product-manager-TSPEC-v6.md` (Needs revision — 1 High, 1 Medium)
**Diff reviewed:** `9a201879..HEAD` on the TSPEC (six commits, v0.6 → v0.7)
**Date:** 2026-08-13
**Iteration:** 7
**Scope:** Delta re-review. v6's findings and questions, plus this round's own new work. Sections settled in rounds 1–5 are not re-litigated.

## 1. Disposition of v6's findings

| v6 ID | Severity | Status | Evidence in v0.7 |
|---|---|---|---|
| F-01 | High | **Resolved** | §9.3's "moves unchanged" bullet now states the move is **not byte-identical** and names the two exceptions explicitly (`:1224-1250`): (1) *entry shape* — `main` is exported and self-invocation moves behind an `import.meta.url` entry guard, because HEAD ends in a bare `main().catch(…)` so importing runs the CLI against the importer's `argv`; (2) *runner seam* — `main(argv, deps)` and the command bodies take a default-valued `{runDev, runQueue, runQueueLoop}` object, since HEAD's bindings are static imports and `mock.module` is unavailable on the pinned runner. Every HEAD fact the fix leans on checks out: `grep -c "^export" bin/pdlc.mjs` → `0`; `main().catch((err) =>` at `bin/pdlc.mjs:505`; `import { runDev, runQueue, runQueueLoop, … } from "../lib/run.mjs"` at `:30`; `async function cmdDev(argv)` at `:352` and `async function cmdQueue(argv)` at `:396`; `spawnSync(process.execPath, [BIN, …])` at `__tests__/cli.test.js:22`; local Node `v20.20.1`, and `node:test`'s `mock.module` did not land until Node 22.3. The fix propagated to all four readers I named — §5.4 (`:352-358`), §12.1's production-path row, §12.3's leg, §12.4's new ordering bullet — and K-3 prices it. The rejected alternative (subprocess + observable artifact) is stated with its cost, so the choice is reviewable rather than asserted |
| F-02 | Medium | **Resolved** | §12.3 now enumerates the merge fixture's remaining preconditions in the ladder's own order rather than sending the task author to read `decideMerge` (`:1544-1557`), and says why: "an expectation read off the code under test is not an expectation". The guard *numbers* and *conditions* are correct against `orchestrate-dev.js` — guard 2 `:1076`, guards 7–8 `:1128`/`:1141`, guard 11 `:1169`, guards 12/14/15 `:1184`/`:1200`/`:1212`, guards 17–18 `:1232`/`:1244`, guards 19–21 `:1256`/`:1260`/`:1273`. One of the six line-range pointers is wrong; see F-01 below. The emptiness guard is kept as the CI-side backstop, correctly described as the worse place to catch it |
| Q-01 | — | **Answered** | §7.2 gains "One assertion, applied per pass — identity, not structural equality" (`:805-813`): one comparison form `captured[i].provenance === p` plus `Object.isFrozen`, evaluated for every pass, no second weaker assertion. It also derives the fixture bound the answer implies — `maxPasses: 2`, since a single-pass fixture satisfies "same object every pass" vacuously — and grounds the bound at `run.mjs:478`, where `runQueueLoop({maxPasses = null, ...args})` does read it. The answer closed the ambiguity *and* the vacuity the ambiguity was hiding |
| Q-02 | — | **Answered** | R-E now carries a mechanical expiry trigger (`:1711-1717`): if `bin/pdlc.mjs` ever needs a top-level statement beyond the three clause 2 admits, the parser stops being optional and the risk is re-decided. It notes clause 2 goes red at exactly that moment, so the trigger fires in CI, not on a reviewer noticing — which is what I asked for |

Both v6 findings are closed, and neither closure narrowed the finding. Nothing settled in rounds 1–6 was re-opened: the six commits touch §5.4, §7.2, §9.3, §12.1, §12.3, §12.4, §14.1 and §14.2 only, and every edit is additive to text I had already approved.

## 2. Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **§12.3's new precondition list points at the wrong lines for the one guard pair it was written to answer.** The O3 clause reads "an **O3** that is `ok` with **`unresolved: 0`** (guards 17–18, `:1152-1175` — the case PM v5 Q-02 asked about)" (`:1553-1554`). Guards 17 and 18 are at `orchestrate-dev.js:1232` (`if (!record.o3.ok)`) and `:1244` (`if (record.o3.unresolved > 0)`); `:1152-1175` spans guards 9, 10 and 11 — the CLOSED-PR and CI-rule rungs. So the address is ~80 lines off and lands on a *different* precondition that the same list already cites separately for guard 11 (`:1168`). The condition and the guard numbers are right, so a careful author recovers; an author who navigates by line number transcribes the CI rung twice and leaves O3 at its `null` default, at which point the ladder resolves early, no kind 3 is produced, and the leg fails via the emptiness guard in CI — exactly the outcome this paragraph says is "worse than writing it down here". Fix: `:1152-1175` → `:1232-1254`. While there, guard 4's pointer reads `:1090` (the return body inside guard 3) where guard 4 is at `:1092`; the other four pointers land within ±1 of their block starts and are fine | AC-5.3 |
| F-02 | Medium | Local | **§12.1's process-entry leg says it calls `main(argv, deps)` "with a real `argv` array" without saying which `argv` shape it means, and HEAD's body strips two elements.** `main()` at HEAD opens `const [, , cmd, ...rest] = process.argv` (`bin/pdlc.mjs:479`), so the array it destructures is the *full* `process.argv`, execPath and script path included. §9.3 (`:1236-1243`) and §12.1 (`:1494`) both name the new signature but neither says whether the parameter keeps that convention (`argv = process.argv`, two-element skip retained) or becomes the sliced argument list. A task author who passes `["dev", "docs/…/REQ.md"]` gets the `default:` branch, `USAGE`, `process.exitCode = 1` and a recorder that was never called — and the plausible "fix" is to delete the two-element skip, which changes what the shipped subprocess entry parses. It is caught fast either way (`cli.test.js`'s subprocess oracles are unforgiving), but it is a one-clause statement now versus a confusing red later: state that `argv` defaults to `process.argv` and keeps HEAD's `[, , cmd, ...rest]` convention, so the leg passes `["node", "pdlc", "queue", "--loop", …]`-shaped input | AC-5.3, AC-2.1 |

## 3. Questions

| ID | Question |
|----|---------|
| Q-01 | §9.3's runner-seam bullet cites `engines.node: ">=20"` as "the pinned runner" (`:1238`), but §5.1's manifest table lists `engines.node` as **absent** at HEAD and added by this feature (`:204`). The conclusion is unaffected — local Node is v20.20.1 and `mock.module` landed in Node 22.3, so the seam is needed either way — but is the intent that the `deps` seam is justified by the *declared floor* (in which case the citation is fine and forward-looking) or by *whatever the maintainer actually runs* (in which case a floor of `>=20` permits Node 22+, where `mock.module` exists, and the seam's justification becomes a choice rather than a necessity)? One clause naming which reading governs would keep a future reviewer from "simplifying" the seam away on a newer runner. |

## 4. Positive Observations

- **The F-01 fix names the cost of the shape change instead of hiding it inside "moves unchanged".** The honest version of this revision was one sentence in §3.1. What landed instead states the exception *at the section that promises the move* (§9.3), names both halves, shows the entry-guard condition literally, weighs the alternative shape that would have avoided touching `cli.mjs` at all, and says why it was rejected — the subprocess oracle "proves the `:434` loop hand-off only through a full `pdlc queue --loop` run in a throwaway repo". Then K-3 re-prices with the line I most wanted to see: the change is "small in bytes and large in review attention, since it is the one place this feature changes behaviour in a file §9.3 otherwise moves verbatim". A reader deciding whether to accept this feature can now see the one behavioural exception without reading §12.

- **The new §9.3 bullet declines to add an oracle, and argues for the absence.** "`cli.mjs` gets no structural-oracle clause of its own; the import-based tests are the pin" — because a restored bare `main()` call "would break every process-entry test at once and loudly". That is the right shape of answer to a testability question: not a fourth clause added defensively, but a statement of which existing test fails first and how visibly. It also keeps the three structural clauses scoped to where the hazard actually is (evaluation order on an old runtime), which is why they stayed falsifiable through six rounds.

- **Q-01's answer found a vacuity I did not ask about.** I asked whether the identity bar applied per pass. The answer says yes, one assertion form evaluated for every pass — and then adds that the fixture must drive `maxPasses: 2`, "since a single-pass fixture satisfies 'same object every pass' trivially and cannot falsify a per-pass rebuild". A one-pass fixture would have been green forever against the exact defect the leg exists to catch. The bound is grounded at `run.mjs:478`, where `runQueueLoop` really does read `maxPasses`.

- **§12.4's new ordering bullet is written against the mechanism that would have rejected the PLAN, not against a preference.** It names the two work items that touch `bin/cli.mjs`, assigns owners per batch, states the dependency direction, and closes with "a PLAN that lists the path under both tasks in one batch is rejected by the manifest, which is the point of stating the edge here". The bullet count in the preamble moved four → six and I counted six bullets in §12.4, so the "a dropped bullet is visible" device still works.

- **R-E's expiry trigger converts a judgement into an observation.** Risk sections usually rot because the condition for revisiting them is "someone notices". Tying the re-decision to structural clause 2 going red means the risk expires mechanically, in CI, at the moment the mitigation stops being true.

## 5. Recommendation

**Approved with minor changes** — no open High findings. Two Medium
findings are recorded and are not gating; both are single-clause edits the
author can fold into the next touch of the document or the PLAN task that
consumes the section.

v6's High (F-01, the unwritable process-entry leg) is closed properly rather
than papered over. The revision did the thing I could not have demanded: it
did not just add the export, it stated that the "moves unchanged" promise now
has exactly two exceptions, named them, priced them in K-3, sequenced them in
§12.4, and named the alternative it rejected. v6's F-02 is closed by
enumerating the merge fixture's preconditions in the ladder's own order,
with the right reason attached — an expectation read off `decideMerge` is not
an expectation. Both questions were answered in the sections operators read,
and Q-01's answer surfaced a fixture vacuity (`maxPasses: 1`) beyond what was
asked.

Every HEAD claim added this round checks out against the repo: `bin/pdlc.mjs`
at `:30` (static runner imports), `:352`, `:396`, `:479`
(`const [, , cmd, ...rest] = process.argv`), `:505` (bare `main().catch`),
zero `^export` lines; `lib/run.mjs:387`, `:427` (`importWorkflow` default-value
precedent), `:478`, `:491`; `__tests__/cli.test.js:22` (`spawnSync`); local
Node `v20.20.1` with `mock.module` absent before Node 22.3; and the merge
ladder's guard numbering in `orchestrate-dev.js` (`:1064`…`:1273`).

The two Mediums are both citation/shape precision in this round's own new
work, in sections whose *semantics* are correct:

1. **F-01** — §12.3's O3 clause cites `:1152-1175` for guards 17–18, which
   live at `:1232-1254`; `:1152-1175` is the CLOSED-PR/CI-rule span. Change
   the range; optionally nudge guard 4's `:1090` to `:1092`.
2. **F-02** — §12.1/§9.3 should say which `argv` shape `main(argv, deps)`
   takes, given HEAD's two-element skip at `:479`.

Neither changes a product decision, narrows an acceptance criterion, or
affects whether AC-5.3's `pdlc queue --loop` provenance hole stays closed —
which, six rounds in, it does, at all three call sites and at process entry.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 0}
