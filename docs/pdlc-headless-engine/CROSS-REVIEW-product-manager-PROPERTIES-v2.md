# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-headless-engine/PROPERTIES-pdlc-headless-engine.md` (v1.1)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** Delta re-review of PROPERTIES v1.0 → v1.1 for feature `pdlc-headless-engine`, product lens (requirements traceability, scope compliance, acceptance-criteria fidelity). Prior review: `CROSS-REVIEW-product-manager-PROPERTIES-v1.md` (2 High, 2 Medium, 2 Low).

## Round-1 findings — disposition

Diff reviewed: `git diff 22a2b1ec HEAD -- docs/pdlc-headless-engine/PROPERTIES-pdlc-headless-engine.md` (13 commits, v1.0 → v1.1).

| Prior | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | `PROP-SKILL-15` now carries AC-3.1's negative clause (`:182`), and it is not written as a bare substring absence: the oracle is a positive provenance statement (the prompt equals the identifier's prompt-file set plus the module-supplied text, no engine-authored segment between), with EC-SKILL-5's permitted case (`FSPEC:634`) as the boundary fixture and a scratch prepend fixture as the falsifier. `NEG-26` (`:433`) carries the paired must-not. §14's AC-3.1 row (`:489`) stops over-reporting and names the property that closes the half it was missing. |
| F-02 | High | **Resolved** | §15 was regenerated from PLAN v1.2's task table (`:523-530`). I checked it mechanically rather than by eye: expanding every range in §15 and comparing against the 227 property ids defined in §§3–12 gives **set-equality in both directions** — no property is unplaced, no §15 cell names a property that does not exist. T01, T08 and T09 now own rows (`suite-spine`/`spine-probe-a`/`spine-probe-b`, `ci-arrangement.test.js`, `fixtures-redaction.test.js`, `:535`, `:542`, `:543`), the seven invented filenames are gone, and every filename in §15 appears in PLAN §9's ownership table. `PROP-AUTH-8…11` land in `transport-boundary.test.js` and `PROP-AUTH-12` in `adapter-descriptor.test.js` (`:547`, `:545`). The reverse direction is handled explicitly too: the seven HEAD files PLAN names but no property owns are listed with the reason (`:581-586`). |
| F-03 | Medium | **Resolved** | `PROP-CLI-1` and `PROP-CLI-2` (`:297-298`) carry AT-ENG-01 and AT-ENG-02. PROP-CLI-1 asserts the closed command set in both directions and says why neither half stands alone; PROP-CLI-2 asserts `--flag value` ≡ `--flag=value` as a deep-equality over **every** value-taking flag rather than one representative, and names US-02's cron slot as the operator cost. |
| F-04 | Medium | **Resolved** | `PROP-CLI-3` (`:299`) pins BR-CMD-1's exemption as a two-member set-equality `{hello, spike:sdk}` and bounds it: neither member may claim a ladder/report/catalogue obligation and `spike:sdk` must not be asserted as non-billing. Anchors check out — `USAGE` names the pair at `bin/pdlc.mjs:41`, and the two dispatch arms are `bin/pdlc.mjs:332` and `:335`. §14's constraints paragraph (`:508-510`) now routes C-1a through PROP-CLI-3 so the zero-token promise is never read as covering `spike:sdk`'s real call. |
| F-05 | Low | **Resolved** | §2's budget (`:90-102`) now names `PROP-VER-11` as the fifth member and states plainly that PROP-VER-6 is `Unit` and was named by mistake. I checked the set-equality the clause claims to be checkable by: exactly five rows in §§3–12 carry `Level: E2E`, and they are exactly the five named. PROP-VER-10 and PROP-GUARD-23 are explained as deliberately outside it. |
| F-06 | Low | **Resolved** | `G-PROP-7` (`:613`) closes it as a decision rather than an omission: EC-RUN-1 is covered as PROP-SKILL-11's third trigger (`:178`), EC-CLI-4 as PROP-CLI-4 (`:300`), and EC-RUN-2/3/4/5 are named with the reason each is a property of the modules or an out-of-scope non-goal. |
| Q-01 | — | **Answered** | §14's AC-6.2 row (`:493`) now reads "**properties yes, gate no**" instead of a plain `yes`. The asymmetry I asked about is stated where an operator reading only §14 will meet it. |
| Q-02 | — | **Answered** | Same row, plus G-PROP-5's evidence line. |

## Findings

Three findings, all in sections this revision changed, none blocking.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-07 | Medium | Local | **`PROP-CLI-1…4`'s own `Task` cells contradict §15's assignment of the same properties.** All four rows read `T31 → T47` (`:297-300`), but §15 places `PROP-CLI-1…4` in `pdlc/engine/__tests__/cli.test.js` with **T47** as both red and green task (`:557`). T31's file, per PLAN, is `exit-loop.test.js` and nothing else (`PLAN:172`, ownership `PLAN:243`); `cli.test.js` is T47's (`PLAN:188`, `PLAN:265`), and T31 is batch 4 while T47 is batch 7. An implementer working T31 from the property rows would write CLI assertions into a file their task does not own, three batches early — the exact class of collision §5's batch safety exists to prevent. §15's preamble states the reconciliation rule ("task ids are PLAN's, taken from §9's ownership table", `:528-529`) but the fix was not back-propagated into §8's rows. Set the four `Task` cells to `T47` (or `T47 → T47`, matching §15's phrasing) so the two tables say one thing. | AC-1.4, BR-CLI-1, AT-ENG-01/02, PLAN §5/§9 |
| F-08 | Medium | Local | **Two new rows are typed `red` when a weak form of the assertion already exists at HEAD, so §2's own `partial` vocabulary is bypassed.** §2 defines `partial` as "the function exists but nothing asserts the property" / one half missing, and requires every `partial` cell to cite a `file:line` (`:69-71`). (a) `PROP-CLI-1` reads `red` (`:297`), but `cli.test.js:162` already asserts "an unknown command prints the usage block naming dev and queue" — that is EC-CLI-1's negative half, present today; the missing half is the positive one (every §3.1 command accepted). (b) `PROP-SKILL-15` reads `red` (`:182`), but `cli.test.js:42-49` already asserts "the composed prompt names no Skill tool and no `pdlc:` namespace of its own" — and it does so as `assert.equal(/Skill tool/i.test(scaffolding), false)`, i.e. precisely the absence-only oracle PROP-SKILL-15 was written to replace. Typing it `red` hides the most useful fact the implementer of T24/T38 has: there is an existing vacuous assertion to *supersede*, not a blank file. Retype both `partial` with those anchors, and have PROP-SKILL-15 name the assertion it replaces. | AC-3.1, AC-1.4, §2 state vocabulary, BR-SKILL-1 |
| F-09 | Low | Local | **§15's `cli.test.js` row does not mark the file extended, though the document marks `smoke.test.js` that way for the same reason.** `cli.test.js` is tracked at HEAD (167 lines) and is one of the nine `__tests__/*.test.js` PLAN itself measures at HEAD (`PLAN:53`). §15's `smoke.test.js` row is careful about this — "**extended**, not new; green at HEAD" (`:561`) — while the `cli.test.js` row (`:557`) reads as though T47 creates it. Applying the convention the document already established costs one word and keeps the "what will I find when I open this file" promise §15 opens with (`:519-521`). | Team Principle 3 (traceability), §15's stated purpose |

## Questions

| ID | Question |
|----|---------|
| Q-03 | §15 assigns `PROP-CLI-1…4` a red and green task that are the same task (T47), noted as "red and green in one task". For the other 30 rows the split is what makes the red state meaningful. Is the intent that T47's implementer writes the four CLI assertions against the pre-change `bin/pdlc.mjs` first within the task, or is the red state genuinely unobservable here — and if the latter, is that worth a line in §16.3's risks alongside the other same-task cases (T10, T41)? |

## Positive Observations

- The §15 regeneration is the strongest thing in this revision, and it is strong in a way I could check rather than take on trust. Expanding every range in the table and diffing against the property ids defined in §§3–12 yields exact set-equality over 227 properties in both directions. The reverse direction — PLAN files that own no property — is handled explicitly rather than left silent (`:581-586`), which is what turns the table from a claim into an instrument. The v1.0 version of this table named seven files no task creates; the v1.1 version could not do that without failing its own check.
- PROP-SKILL-15 does more than close AC-3.1's negative clause: it closes it *without* an absence-only oracle, which is the harder thing. Asserting that the composed prompt equals the prompt-file set plus module text with no engine-authored segment between them is a statement a smuggled instruction fails whatever words it uses, and pairing it with EC-SKILL-5's permitted case (a skill author's own `pdlc:` prose) keeps the property from over-firing on prose the engine did not write. The scratch prepend fixture as falsifier means the oracle is proven able to fail.
- PROP-CLI-3 went further than F-04 asked. I raised the unpinned exempt pair; the revision pinned it as a set-equality *and* bounded the exemption — no ladder/report/catalogue obligation, and `spike:sdk` explicitly not assertable as a non-billing surface. That last clause is the one that protects C-1a's zero-token promise from being read over a command that really does bill.
- §14's AC-3.1 and AC-6.2 rows now record what they used to overstate, including the sentence explaining what the AC-3.1 row said before it was correct. A coverage matrix that documents its own former over-report is more trustworthy than one that quietly changes a cell.
- The E2E budget is now checkable in the sense the clause claims: five ids named, five rows carrying `Level: E2E`, and the two live-credentialed properties placed outside the budget with the reason each is not a pipeline run.

## Recommendation

**Approved with minor changes**

Both round-1 High findings are closed, and closed at the level of mechanism rather than wording — I verified §15's coverage claim and §2's budget claim by expanding and comparing the sets, not by reading the prose. All four lower-severity findings and both questions are addressed. Nothing in the revision broke a section that was previously sound; §§3–12's property statements, §12's negative table and §13's strategies are unchanged where they were already approved.

The three new findings are all one- or two-cell corrections in the tables this revision touched, and none of them leaves an acceptance criterion uncovered:

1. **F-07** — set `PROP-CLI-1…4`'s `Task` cells to T47 so §8 and §15 agree on who writes the CLI tests.
2. **F-08** — retype `PROP-CLI-1` and `PROP-SKILL-15` `partial` with the `cli.test.js:162` and `cli.test.js:42-49` anchors, and have PROP-SKILL-15 name the absence-only assertion it supersedes.
3. **F-09** — mark `cli.test.js` **extended** in §15, matching the `smoke.test.js` row's convention.

These can land in the next authoring pass without a further review round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
