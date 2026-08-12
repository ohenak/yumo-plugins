# Cross-Review: test-engineer — PLAN

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`
**Date:** 2026-08-12
**Iteration:** 7

**Scope:** Delta re-review of the v1.4→v1.5 revision. Round 6 closed with no High, two
Medium (F-19, F-20) and one Low (F-18). Sections untouched by the delta are not
re-reviewed.

## What changed since round 6

`git diff 6fe6c019..HEAD -- docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`:
**41 insertions, 17 deletions**, across four kinds of edit:

| Edit | Where | Character |
|---|---|---|
| v1.5 changelog block added | §0 | five rows, addressing PM F-01/F-02, TE F-18/F-19/Q-01/Q-02/Q-03 |
| Self-referential line numbers deleted, replaced by section references | §0 (v1.4 row), §0's TE F-17 paragraph, §6 | `:238` → `§4`; `:507`/`:765`/`:796` → `§7`, `§10`, `§11`; `:211` dropped |
| §3 gains a paragraph declaring the Status column **advisory, swept at phase end, never a gate** | §3, above the task table | new prose, no table change |
| Status/phase glyphs flipped on twelve rows | §3 | T02, T03, T04, T05, T09, T26, T27, T32, T33, T43, T45, T46 |
| Three new dispositions O-ENG-T6/T7/T8 | §10 | answers my v6 Q-01, Q-02, Q-03 |

No `Deps`, no `Batch`, no `Test File`, no `Source File`, and no oracle prose changed.

## Prior findings — disposition at HEAD

Re-verified by running the shipped parsers over the live file, not by reading the
document's own claims.

| ID | Sev | Status | Evidence at HEAD |
|----|-----|--------|------------------|
| F-18 | Low | **Resolved — in the form that cannot recur** | Every self-referential line number is gone, replaced by a section reference carrying the same quoted header text. §6's three quotations are still byte-exact against the live headers: `# \| Integration point at HEAD \| What attaches` (§7, `:529`), `# \| Question \| Disposition here` (§10, `:787`), `# \| Command \| Observes \| State at HEAD` (§11, `:821`). Grepping for remaining `:NNN` citations returns only **out-of-document** ones — `transport.mjs:17`, `guard-harvest-before-delete.sh:29-30/35-38/53-57/6`, `pr-tests.yml:40/27/68/75/77/93/99/103/127/133/148/161/172/188` — which the changelog explicitly keeps, correctly: this document does not edit those files |
| F-19 | Med | **Resolved for T18; recurred on three new rows** — see F-21 | T18 now parses as `🟢 \`[Fake first]\` per-transport recorded fixture sets…` with the tick in the Status cell. But `parsePlanTasks` reports three descriptions still containing `✅`: **T09, T43, T46** |
| F-20 | Med | **Dispositioned by decision, not by sweeping** | §3's new paragraph settles the class rather than the instance: the column is advisory, no parser reads it, `⬚` is never evidence of absence, and *where this column and the branch disagree, the branch wins*. That is the right resolution and it makes the remaining stale rows (T06, T07, T10, T11, T17, T19, T48, T49 all `⬚` with files on disk) a declared property instead of a defect |
| Q-01 | — | **Answered** — O-ENG-T6 | Declines the task, and names the durable alternative. Verified: `pdlc/workflows/__tests__/planOwnership.test.js` and `waveExecution.test.js` both exist; `documentOracles.test.js:62` really is `const LIVE_ROOT = realpathSync(...)`, so the named attachment point is real |
| Q-02 | — | **Answered** — O-ENG-T7, with one false clause | See F-22 |
| Q-03 | — | **Answered** — O-ENG-T8 | Per-module over `pdlc/engine/lib/`, aggregate reported but not the gate. This is the stronger of the two readings and closes the question |

**Manifest re-derived at HEAD after the delta**, importing `parsePlanTasks`,
`parsePlanOwnership`, `validatePlanContract` and `computeWaves` from
`pdlc/workflows/orchestrate-dev.js` and running them over the live file:
**54 tasks / 54 owning rows / `{"ok":true}` / 17 waves** — identical to rounds 5 and 6.

**Every completion claim added this round checked against the branch, file by file.**
T02 `hermeticity.test.js`, T03 `assert-suite-wide.test.js`, T04 `outcome.test.js`,
T05 `catalogue.test.js`, T09 `fixtures-redaction.test.js`, T26 `startup-ladder.test.js`,
T27 `startup-guard-executable.test.js`, T32 `report-engine.test.js`,
T33 `fs-observation.test.js`, T43 `_bootstrap.mjs`, T45 `lib/adapter.mjs` — all present.
T46's fixture is the one worth checking rather than assuming, because its deliverable is a
*populated* tree: `fixtures/consumer-ac12/` carries `.claude/workflows/` with four artifacts
plus `.pdlc-drift-state.json`, `.claude/pdlc.config.json`, and a `docs/ac12-widget/REQ-*.md`.
Not one `✅` added this round is aspirational.

## Findings

No High. The manifest is byte-stable in the shape approved in round 5, no oracle,
dependency, batch or ownership text moved, and the two structural questions the delta
answers are answered well. Two Mediums and one Low, all in the bookkeeping layer.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-21 | Medium | Local | **The exact defect F-19 named was repaired on T18 and reintroduced on three other rows in the same delta.** T09's Task cell was `🔴`, and is now `✅ fixture redaction scanner…`; T43's was `🟢`, now `✅ bootstrap v2…`; T46's was `🟢`, now `✅ [Fake first] AC-1.2 consumer fixture…`. In each the completion tick **overwrote** the TDD phase marker rather than going in the Status cell beside it. Confirmed in the parsed field, which is the changelog's own stated verification criterion: `parsePlanTasks(...).tasks.filter(t => t.description.includes("✅"))` returns exactly `["T09", "T43", "T46"]`. Two things follow. (a) The v1.5 changelog's claim is true only of the row it names — "verified in the parsed field, not the rendering — `parsePlanTasks` now returns T18's description with no tick" holds for T18 and is false for three siblings edited in the same window, so the verification was applied to the repair and not to the sweep. (b) T09 is a **batch-2 red-terminal** task, and §5's gate wording for that batch is "a batch-2 test that *passes* is a defect in the test, not progress"; the row's own `🔴` marker — which §3's new paragraph explicitly designates as "the red-before-green record that §5's gate is read off" — is now deleted from precisely one of the nine rows that gate governs. The delta raised the stakes on the Task-cell marker in §3 and deleted it from three rows in §3, in one revision. Fix is the same one-cell move already applied to T18: restore `🔴` on T09 and `🟢` on T43/T46, leave the `✅` in Status | §3 rows T09, T43, T46; §3's new paragraph; §5 batch-2 gate |
| F-22 | Medium | Local | **O-ENG-T7's mechanism clause is false at HEAD, and T04 is already marked Done.** The disposition answers my Q-02 substantively and correctly — the corpus *is* pinned, and it is pinned with exactly the non-`Error` shapes I asked about: `outcome.test.js` carries `generateArbitraryThrownShapes()` yielding `string`, `string-empty`, `number`, `number-nan`, `null`, `undefined`, `boolean`, `plain-object`, `array`, `error-no-cause`, `error-with-cause`, `error-nested-cause`, `throwing-message-getter`, `frozen-object`. My concern (a generator emitting only `Error` instances satisfies totality while proving nothing) is genuinely discharged. But the disposition says the corpus "is a **named export** from the same test file" and that "any later task needing throwables **imports it** rather than re-rolling one" — and `outcome.test.js` has **no export statement at all**; the generator is module-local. T04 is marked `✅` this round, so this is not a forward commitment an implementer can still satisfy, it is a description of landed code that does not match the code. Either add `export` to the generator (one word, makes the disposition true and the import path real) or reword O-ENG-T7 to say the corpus is pinned in-file and a later task needing it must lift it to an export first | §10 O-ENG-T7; `pdlc/engine/__tests__/outcome.test.js` |
| F-23 | Low | Process | **§3's own sweep discipline was violated by the commits that wrote §3's sweep discipline.** The new paragraph says the column is swept "**once, at phase end**, never incrementally mid-wave, because editing it commit-by-commit re-opens Phase P by changing the bytes an approval anchor is pinned to". The twelve rows flipped in this delta arrived in exactly that forbidden shape — separate per-task chore commits (`5a067bf7` "mark T02 hermeticity guard complete", `f72a9165` "mark T09 fixture redaction scanner complete", `bf4a19fa` "mark T26 done", `d9683562` "mark T27 landed", among others), each mutating §3 mid-wave. The rule is the right one and I am not asking for it to be relaxed; I am noting that it is stated in the same revision that breaks it, so nothing yet demonstrates the rule is load-bearing rather than aspirational. This is the mechanism that produced F-19 and now F-21 — a rule honoured would have produced neither | §3 new paragraph; commits `5a067bf7`, `f72a9165`, `bf4a19fa`, `d9683562` |

## Questions

| ID | Question |
|----|---------|
| Q-04 | O-ENG-T6 declines the live-PLAN parse check and names `documentOracles.test.js`'s `LIVE_ROOT` pattern as the durable form, scoped out as "repo infrastructure, not this feature". I accept that scoping — it is the right boundary. The question that survives it: **is anything filing that infrastructure item where it will be seen after this feature merges?** Three rounds have now produced the same class of §3 edit defect (v6 F-19 on T18, this round F-21 on T09/T43/T46), and the sweep is the only writer. A `docs/*/PLAN-*.md` sweep asserting `validatePlanContract().ok` would not have caught any of them — they are all in an unparsed column — so I am *not* asking for it as a remedy here. I am asking whether O-ENG-T6's "if the operator wants it mechanical" ends as a line in this PLAN or as a row somewhere durable |
| Q-05 | Carried from Q-03's disposition, now that O-ENG-T8 fixes the floor as per-module over `pdlc/engine/lib/`: **which task owns the per-module measurement?** §8 carries the floor as a DoD item, but the gate command has to actually produce per-module numbers — the repo's own `DOMAIN-CONSTRAINTS.md` DC-09 warns that a coverage source list silently excludes packages outside it. `lib/transport-cli.mjs` is the module O-ENG-T8 names as the one an aggregate would hide, and it is also the one with no CI-observable happy path. If the per-module reading is enforced by reading a report by eye at DoD, say so; if a task asserts it, name the task |

## Positive Observations

- **F-18 was fixed in the form that cannot recur, which is the harder and better fix.** Three rounds produced this defect class (v3 F-04, v4 F-01, v5/v6 F-18) and each earlier round corrected the number. Deleting the self-reference entirely — and keeping line numbers only for files this document does not edit — removes the mechanism, not the instance. The distinction the changelog draws is exactly right, and I verified it holds both ways: no in-document `:NNN` survives, and every out-of-document one does.
- **O-ENG-T8 chose the strict reading of an ambiguous sentence.** Q-03 could have been closed with "aggregate, and it passes". It was closed per-module, with the reason named — an aggregate 85 % with `transport-cli.mjs` below it satisfies the sentence while leaving the least-exercised module in the feature unmeasured. A disposition that makes the author's own gate harder is a good sign about the rest of them.
- **O-ENG-T7 answered the part of Q-02 that actually mattered.** The risk in that question was a corpus of `Error` instances passing a totality property vacuously. The landed corpus includes `null`, `undefined`, a bare string, an array, a frozen object, a three-deep `cause` chain, and an object whose `message` getter throws — that last one is a shape I did not ask for and would not have thought to. The mechanism clause is wrong (F-22); the testing judgement behind it is better than the question deserved.
- **The delta is inert where it must be, and I proved it rather than assumed it.** Real parsers over the real file returned 54 / 54 / `{"ok":true}` / 17, identical to rounds 5 and 6. §3's new paragraph makes the reason explicit and checkable — `parsePlanTasks` selects only the id, deps, description and batch cells (`orchestrate-dev.js:3808-3830`, `findCol` skipping `idIdx`/`depsIdx` then matching `isDescCell`/`isBatchCell`) — so the Status column genuinely is unreachable by the dispatcher, as claimed.
- **Nothing was quietly re-litigated.** Zero changes to `Deps`, `Batch`, `Test File`, `Source File` or any oracle prose. F-16's positional set-equality oracle on T11, §6's membership argument, §8/§11's `LIVE_ROOT` attribution, and §5's batch-2 exemption for T10 are byte-identical at HEAD.

## Recommendation

**Approved with minor changes**

No High findings, and none opened by the delta. Both of round 6's Mediums are addressed:
F-18's defect class is removed rather than patched, and F-20 is settled by a decision —
the Status column is advisory, the branch wins where they disagree — which is a better
answer than a sweep, because it retires the finding instead of deferring it. The three
new §10 dispositions close all three of my carried questions on their merits.

The manifest is unchanged at HEAD in the shape approved in round 5: 54 tasks, 54 owning
rows, `{"ok":true}`, 17 waves, re-derived with the shipped parsers after these edits. No
dependency edge, batch number, test-file assignment, ownership row or oracle sentence
moved.

What holds this at "minor changes" rather than "Approved" is F-21: the one-cell mis-edit
this revision repaired on T18 was simultaneously committed on T09, T43 and T46, and one of
those three is a batch-2 red-terminal row whose `🔴` marker §3's own new paragraph
designates as the record §5's gate reads. The fix is three cells and is the same move
already demonstrated on T18. F-22 is one missing `export` keyword or one reworded
sentence. Neither blocks Phase P: the dispatcher cannot read either column, and the
underlying work for every row marked complete this round exists on the branch — I checked
all eleven files and T46's populated fixture tree individually rather than trusting the
ticks.

F-23 is recorded as Process rather than pressed. The sweep discipline §3 now states is
correct and would have prevented both F-19 and F-21; the note is that this revision
states it and breaks it in the same commits, so it is not yet demonstrated.

No erratum round. Every defect this round is in the PLAN itself, the document in front of
me — F-22 concerns a §10 disposition's description of code on this branch, not a claim
inherited from an upstream document. The upstream citations re-checked in rounds 5 and 6
(`FSPEC:1347`, `orchestrate-dev.js`, `document-oracles.mjs`, `documentOracles.test.js`,
`.claude/pdlc.config.json`) are untouched by this delta.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
