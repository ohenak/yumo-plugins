# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/PLAN-pdlc-headless-engine.md`
**Date:** 2026-08-12
**Iteration:** 7
**Scope:** product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

Delta re-review against `CROSS-REVIEW-product-manager-PLAN-v6.md`. Unchanged sections are not re-litigated.

## Delta

`git diff 6fe6c019..HEAD -- PLAN` — **41 insertions, 17 deletions**. Unlike round 6, this round is
*not* bookkeeping: three of the four changed regions are content.

| Region | What changed |
|---|---|
| §0 header + v1.5 changelog | version 1.4 → 1.5; five changelog rows added |
| §0 (TE F-17 paragraph), §6 | four self-referential line numbers (`:238`, `:507`, `:765`, `:796`, `:211`) replaced by section references carrying the same quoted header text |
| §3 preamble | new paragraph: the Status column is **advisory, swept once at phase end, never a gate** |
| §3 task table | T18's row repaired (🟢 restored to the Task cell, `✅` moved to Status); 12 Status cells swept `⬚` → `✅` |
| §10 | three new dispositions — O-ENG-T6, O-ENG-T7, O-ENG-T8 |

**Structural contract re-derived at HEAD** (`parsePlanTasks` / `parsePlanOwnership` /
`validatePlanContract` / `computeWaves` over `orchestrate-dev.js`): **54** tasks, **54** owning rows,
`{"ok":true}`, **17** waves — identical to v5 and v6. The changelog's own re-derivation row states the
same four figures, and it is accurate.

## Disposition of v6 findings

All five closed. Every one verified at HEAD, not read off the changelog.

| v6 | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| **F-01** T18's tick written into the Task cell, destroying the `🟢` marker | Medium | **Resolved** | `parsePlanTasks(PLAN)` returns T18's description beginning `🟢 \`[Fake first]\` per-transport recorded fixture sets…` with no tick in the string, and the row's Status cell reads `✅`. Verified in the parsed field, which is the form the changelog claims and the form that matters — a dispatched implementer reads the parsed description, not the rendering |
| **F-02** Status column materially understates what landed | Medium | **Resolved as a governance decision, not a sweep** — accepted | §3's new paragraph makes the column advisory and states the tie-break: "Where this column and the branch disagree, the branch wins." Twelve rows were also swept. Eight `⬚` rows still sit against landed deliverables (T06 / `auth.test.js` 363 lines; T11 / `_run-suite.mjs` + `package.json:13`; T19 / `_assert-suite-wide.mjs`), but under the new rule that is no longer a defect, it is the rule operating. See F-03 for the one residue worth recording |
| **F-03** live mutable state inside a byte-pinned approved document | Medium (Process) | **Resolved** | This was the finding I most wanted answered, and §3 answers it in the stronger of the two directions I offered: not "freeze the column" but "the column is advisory, swept once at phase end, never incrementally". Both halves of the reason are stated — no parser reads it, and mid-wave edits re-open Phase P by changing bytes an approval anchor is pinned to. The parser claim is accurate: `orchestrate-dev.js:3807-3823` selects id, deps, description and batch cells only, and no fifth index is taken |
| **F-04** four stale self-citations (`:238`, `:507`/`:765`/`:796`) | Low (Process) | **Resolved, and in the form that cannot recur** | The pointers are gone rather than re-pinned. §6 now reads "§4's ownership manifest, whose header at HEAD is `Files \| Task \| Batch`" with no line number; §0's TE F-17 paragraph now says "the live headers of §7, §10 and §11". `grep` for the five numerals finds them only inside the v1.5 changelog row that narrates their removal — i.e. as history, not as live pointers |
| **F-05** v1.4 changelog's `:211` landing on T42's task row | Low | **Resolved** | Same edit; the v1.4 row now reads "§4's **live** header (`Files \| Task \| Batch`)" with no number |

The changelog's stated rationale is the right one and worth naming: a changelog that grows at the top
moves every line beneath it, so *self*-citations by line number are structurally doomed while
citations *out* of the document are not. v1.5 keeps the latter and deletes the former. That is a
class fix, and it is why F-04/F-05 are closed rather than carried a fourth time.

## Findings

**No High findings.** Nothing this round blocks Phase P. No requirement was dropped, narrowed or
re-traced; no scope was added to the task set; the machine-read contract re-derives byte-identically.
The two Mediums below are both in §10's *new* dispositions — new text, so in delta scope — and each
is a one-phrase fix.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **O-ENG-T8 widens §8's coverage floor from four named modules to every module in `pdlc/engine/lib/`, and §8 was not edited to match — the two sections now disagree about what the gate is.** §8's DoD item is explicit and enumerated: "Branch coverage over the four new modules (`lib/outcome.mjs`, `lib/catalogue.mjs`, `lib/auth.mjs`, `lib/transport-cli.mjs`) is **≥ 85 %**" (`PLAN` §8, coverage item), and §11's V5 row says the same — "the ≥ 85 % branch-coverage floor over the four new modules". O-ENG-T8 answers TE Q-03 with "**Per-module over `pdlc/engine/lib/`**… §8's coverage item is read as a floor every `lib/*.mjs` file must clear on its own". At HEAD `pdlc/engine/lib/` holds **12** modules, not four — eight of them (`adapter`, `handshake`, `report`, `run`, `skills`, `startup`, `transport`, `guard-measurement`) pre-date this feature and no task in §3 produces coverage for them. Read literally, the disposition adds a DoD obligation over eight out-of-scope modules; read charitably (and the module it cites as the motivating example, `transport-cli.mjs`, is one of the four), it means *per-module rather than aggregate, over the four*. The distinction is product-visible because it decides whether Phase DOD can pass. **Fix (one phrase):** make O-ENG-T8 read "per-module over the four modules §8 names, not an aggregate across them". If the operator genuinely wants all twelve, that is a scope increase and belongs in REQ/TSPEC before it appears in a DoD checklist — I would raise it High in that reading | REQ C-9; PLAN §8, §10, §11 |
| F-02 | Medium | Local | **O-ENG-T7 describes T04's throwables corpus as "a named export from the same test file", and at HEAD it is not exported — while T04 is already marked `✅`.** The disposition's operative promise is the last clause: "Any later task needing throwables imports it rather than re-rolling one (§4 keeps `outcome.test.js` under T04's sole ownership, so there is one writer)." At HEAD the corpus is a module-local generator: `outcome.test.js:220` `function* generateArbitraryThrownShapes()`, consumed once at `:250` `const shapes = [...generateArbitraryThrownShapes()]`. The file (345 lines) carries **no** `export` statement. The *substance* of the disposition is satisfied — the corpus is pinned in code, not left to an implementer, and covers exactly the shapes named (strings, `null`, `undefined`, plain objects, a nested `cause` chain, and an object carrying a `message` property, here as a throwing getter) — so this is a wrong claim about a landed artifact, not a missing test. But it is not importable, and §4's sole-ownership rule means no later task may add the export without re-opening T04. **Fix:** either restate as "pinned as a module-local generator in `outcome.test.js`; a later consumer needs T04 re-opened to export it", or add the one-line export obligation to T04's cell and let the sweep re-tick it | REQ C-9; PLAN §3, §4, §10 |
| F-03 | Low | Process | **§3's new rule is right, and the column it now governs is in a mid-sweep state that its own rule says to ignore — record, do not act.** Twelve rows were ticked in this window and eight `⬚` rows still stand against landed deliverables, which leaves one visible dependency inversion in the ledger: T45 reads `✅` while its declared dep T35 reads `⬚` (`lib/adapter.mjs` exists, so the branch is coherent even though the column is not). Under §3 as now written this is exactly what "the branch wins" covers, and no parser reads the cells, so it cannot mis-execute a wave. Recording it only so the phase-end sweep §3 promises is not skipped on the grounds that the column was "already updated" — a half-swept column is the state that most looks finished | REQ C-9; PLAN §3 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | **Closed** (carried v4→v6). §3 settles what the Status column is. No further question. |
| Q-02 | **Closed** (carried from v6, on T17's CI/`testCommand` split). §8's DoD item now writes the post-T17 value out literally — `cd pdlc/engine && npm test && cd ../workflows && npm test -- --testPathIgnorePatterns …` with all four existing ignore patterns preserved verbatim, and states the set-equality argument for why the workflows leg cannot be dropped. That is a stronger answer than the half-sentence I asked for: a future reader cannot mark T17 done off the `engine-tests` job's existence alone, because the item names a second, checkable artifact. `.claude/pdlc.config.json` still carries only the workflows leg at HEAD, which is the correct state for an open T17. |

## Positive Observations

- **The stale-citation defect class was fixed by removing the possibility, not the instance.** Three
  rounds produced it (v3 F-04, v4 F-01, v5/v6 F-01+F-02) and each earlier fix corrected a number,
  which is why it kept coming back — the changelog grows at the top and moves every line beneath it.
  v1.5 deletes self-citation by line number outright, keeps the byte-exact quoted header text that
  made the citations useful, and keeps line numbers for citations *out* of the document, where they
  are stable. That is the right cut, stated with the right reason, and it is the kind of fix a
  reviewer should not have to ask for twice.
- **§3's Status-column paragraph answers the process finding on both sides.** It gives the mechanism
  (`parsePlanTasks` reads id, deps, description, batch — verified at `orchestrate-dev.js:3807-3823`),
  the cost of the alternative (mid-wave edits change bytes an approval anchor is pinned to, re-opening
  Phase P), where the real red/green record lives (the phase glyph at the head of the Task cell, which
  is what §5's gate reads), and an explicit tie-break for a reader who finds the column disagreeing
  with the branch. Four sentences that remove a whole class of future review noise.
- **T18's repair was verified in the parsed field, not the rendering.** The changelog says so, and it
  is true: I re-ran `parsePlanTasks` and T18's description comes back with the `🟢` marker and no
  tick. Checking the machine-visible form rather than the markdown is the difference between fixing
  the defect and fixing its appearance.
- **O-ENG-T6 declines to build the check and says why, then names the durable form anyway.** "No, and
  none is added" with the reasoning that a test over a per-feature document goes stale the moment the
  feature merges is a better answer than a task nobody will maintain — and the attachment point it
  offers is real: `documentOracles.test.js:62`'s `LIVE_ROOT` pattern exists at HEAD, and
  `planOwnership.test.js` / `waveExecution.test.js` both exist and are the synthetic-PLAN half it
  claims. Correctly routed to repo infrastructure rather than absorbed into this feature's scope.
- **The plan's product content is now four rounds stable.** Scope, task set, dependency graph,
  ownership manifest and oracle choices have not moved while roughly twenty tasks' worth of work
  landed against them. 54 tasks, 54 owning rows, `{"ok":true}`, 17 waves — identical to v5 and v6.
  Plans that are wrong show it under implementation contact; this one has not.

## Recommendation

**Approved with minor changes.**

All five v6 findings are closed, three of them by fixes that remove the defect class rather than the
instance. No High findings, and nothing here blocks Phase P: no requirement was dropped or narrowed,
no scope was added, and the structural contract re-derives identically (54 tasks, 54 owning rows,
`{"ok":true}`, 17 waves).

Two Mediums, both in §10's new dispositions, both fixable in a phrase and neither gating:

1. **F-01** — bound O-ENG-T8's per-module floor to the four modules §8 names, or take the widening to
   REQ/TSPEC first. As written, §8 says four modules and §10 says twelve.
2. **F-02** — O-ENG-T7 calls T04's corpus a named export; at HEAD it is a module-local generator
   (`outcome.test.js:220`). Restate it, or add the export to T04's cell.

**F-03** is Low and needs no edit — only that the phase-end sweep §3 promises actually happens, since
a half-swept column is the state that most looks finished.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
