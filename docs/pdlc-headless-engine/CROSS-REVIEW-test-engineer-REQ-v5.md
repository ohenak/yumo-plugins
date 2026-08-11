# Cross-Review: test-engineer — REQ

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/REQ-pdlc-headless-engine.md` (v0.8)
**Date:** 2026-08-11
**Iteration:** 5
**Scope:** delta confirmation of the Phase-F erratum round (`0664b6e6`…`ba92cb92`) against the
v4 approval. Not a re-review: the eleven routed erratum items, the citations the edited text
touches, and whether any previously approved oracle was broken. Every `AC-`/`BR-` claim in the
changed text was re-read at HEAD (DEC-ERR-03), not carried from the prior round.

## Erratum disposition

| # | Erratum item (raiser) | Status | Verified at HEAD |
|---|---|---|---|
| 1 | AC-4.5 records nothing about which transport ran (se-review) | **Confirmed** | AC-4.5 now records transport per dispatch, closed two-member set, "from what the engine actually invoked, never from configuration intent" — see F-01 for the start-state half |
| 2 | AC-4.5 names no surface the operator reads the report on (se-review) | **Confirmed** | delivered on the run's output stream, no engine-owned file in the consumer repo — consistent with NG-7, no new drift surface |
| 3 | `pdlc doctor` had no upstream authority (se-review) | **Confirmed** | AC-2.1 now authorises a diagnostic startup-posture command that dispatches and bills nothing, name/flags left to FSPEC; the shipped surface is `pdlc/engine/bin/pdlc.mjs:40` |
| 4 | AC-2.1 rows 2/4/5 rested on an unobservable "settings state" (te-review) | **Confirmed** | M-ENG-08 names `~/.claude.json`'s `oauthAccount` object; row 5 is fixturable by withholding that record with `ANTHROPIC_API_KEY` set, no operator credential involved. This was the round's load-bearing fix for me |
| 5 | §1.2a's per-AC red/green claim not total (te-review) | **Confirmed with a residue** | M-ENG-06 declares itself total and gains AC-2.3 and AC-4.4 rows; I re-derived the union over AC-1.1…AC-6.4 and all 26 criteria are present. Residue: F-01, F-03 |
| 6 | M-ENG-06 missing AC-2.3 row (pm-author) | **Confirmed** | row present, cites `transport.mjs:159` (`{ ...env }`) / `:168` (dispatch options' `env`) — both verified; the row correctly names BR-ENV-3's every-dispatch half as the unasserted one |
| 7 | M-ENG-08 per-platform / `auth.unknown` over-broad (se-review) | **Confirmed** | per-platform scope stated (C-9); unreadable evidence now decides by `ANTHROPIC_API_KEY` presence, not by unreadability alone |
| 8 | M-ENG-08's "never a refusal" contradicts AC-2.1 row 5 (te-review) | **Confirmed** | corrected in place: key absent → row 6 `auth.unknown`; key present without the flag → row 5 refusal. FSPEC §5.1 BR-AUTH-0 (`FSPEC:379`) and EC-AUTH-2 (`:464`) agree |
| 9 | AC-3.5's both-directions equality unsatisfiable at HEAD (pm-author) | **Confirmed** | equality scoped to the dispatchable subset. I re-derived the subset from the modules rather than trusting the count: exactly 10 identifiers are dispatched (`se-author`, `se-review`, `se-implement`, `pm-author`, `pm-review`, `te-author`, `te-review`, `dod-verify`, `harvest-learnings`, `ship-pr`) over 12 prompt files; the 5 remaining plugin skills (`consolidate-learnings`, `tech-lead`, `tech-lead-python`, `orchestrate-dev`, `orchestrate-queue`) are operator-invoked. 10 + 5 = the 15 `SKILL.md` files present. The counts hold |
| 10 | AC-1.2(c) attributed the empty read-set to the wrong cause (pm-author) | **Confirmed** | `.claude/workflows/` occurs exactly once in `orchestrate-dev.js`, at `:52`, inside the Phase-MERGE self-modification guard set — a path list, not a read. The queue-side chain re-verified end to end: `parseDistributionCheckEnabledOptOut` (`orchestrate-queue.js:2068`) called at `:1072` *before* the drift-state read in the else-branch at `:1074` (`DRIFT_STATE_PATH`, `:64`), and `:1947`'s `record.checkEnabled === false` is `mapDriftState`'s row 2, a record field, not the config opt-out |
| 11 | AC-1.3's loop had no iteration bound (pm-author) | **Confirmed in the document, red at HEAD** | `queue.maxIterations` added to §4.1 and AC-1.3's two-reason stop; see F-02 on the declared default |

Nothing outside the routed items changed in substance: AC-1.1's creation-event window, AC-2.1's
ordered first-match list, AC-3.3's descriptor corpus, AC-4.1/AC-6.4's set-equality catalogues,
AC-4.2's attempt table and AC-6.1's hermeticity gate all survive the edit byte-intact. My v4
findings F-01 (AC-1.1 POSTMORTEM member) and F-02 (AC-4.2 table as enumeration) were not in
scope for this round and are carried, not re-raised.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The erratum widened two criteria without re-deriving their start state, so §1.2a is total by row but not by clause.** M-ENG-06 gained the two *missing rows* (AC-2.3, AC-4.4), but AC-4.5 and AC-1.3 gained new *clauses* in the same round and both still sit in the "green — regression-protecting" row. Neither clause is green at HEAD: the report carries `transport: "agent-sdk"` as one configuration-derived scalar (`pdlc/engine/lib/report.mjs:50`), not a per-dispatch field recorded from what was invoked; and the loop's stop reason exists only as a console line (`bin/pdlc.mjs:316`, `final outcome "${outcome}"`) while the emitted report is the last pass's module report (`emitReport(last && last.report, …)`), which never carries it. §1.2a's whole purpose is that a test author knows whether to write a failing test or a regression test (TE v1 F-07); reading "green" here yields a re-assert-green test that fails on the first run. Fix is two clause-level qualifiers in M-ENG-06's green row, matching the "partially green is a state in its own right" pattern that row 4 already uses. | §1.2a; AC-4.5; AC-1.3; `docs/_constraints/pdlc-engine-baseline.md` M-ENG-06 |
| F-02 | Medium | Local | **`queue.maxIterations`'s declared default is contradicted at HEAD, and AC-1.3's two-reason closure is not testable while it is.** §4.1 declares the default *unbounded* — the loop ends on exhaustion unless the operator sets a positive bound. HEAD defaults to 100 (`pdlc/engine/lib/run.mjs:273`, `maxPasses = 100`), and `bin/pdlc.mjs:305` only overrides it when the flag is passed. So at HEAD a loop has a **third** stop reason AC-1.3 does not admit: a bound the operator never set, reported through the same `max-passes` outcome as one they did — exactly the indistinguishability the erratum was raised to remove, relocated rather than closed. Either §4.1's default is the requirement and AC-1.3 is red at HEAD (needs a red row, cf. F-01), or the default is 100 and §4.1 should say so with the operator-set and defaulted bounds distinguishable in the report. A test author cannot pick between those from the REQ. | §4.1; AC-1.3 |
| F-03 | Low | Local | **M-ENG-06's new totality sentence over-states its own shape.** It reads "every criterion AC-1.1…AC-6.4 appears in **exactly one row** below", but AC-4.5 is deliberately split across two rows by clause (its per-dispatch auth clause is red, its report-fields clause green) — legibly, and correctly. As written the sentence makes a reader who finds AC-4.5 twice suspect a duplication defect rather than read the split. One trailing subordinate clause fixes it, and it is the sentence F-01's fix will want anyway. | `docs/_constraints/pdlc-engine-baseline.md` M-ENG-06 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | *(re-asked from rounds 2–4, unchanged)* O-2 still names hook/settings provenance as the largest open safety gap while AC-5.1 requires the guard refusal on **either** transport, asserted with no pdlc hooks registered. If the SDK path turns out to accept no PreToolUse-equivalent, does AC-5.1 become a blocking gate on the primary transport — meaning any run that deletes artifacts must use the fallback? |

## Positive Observations

- **Erratum item 4 is the round's real fix.** "Logged-in evidence readable" resolving to a named
  file and a named field turns three of AC-2.1's six rows from posture-shaped assertions into
  fixtures a test can build under a scratch `HOME` — and row 5, the refusal, is now provable
  without an operator credential and without one being withheld. FSPEC's AT-ENG-13 already reads
  as the six-fixture table this makes derivable, so the two documents agree without either
  having to guess.
- **AC-3.5's scoping is a correctness fix, not a weakening.** I checked the count against the
  modules rather than the plugin tree, and 10/12/5 is exactly right. The AC keeps the strong
  form (set-equality, both directions, fail closed at startup) and moves only the *domain*,
  which is what made it unsatisfiable. It also closes my standing Q-01 from rounds 2–4: HEAD's
  frozen 17-name list is now explicitly named over-broad in M-ENG-06's red row, so the AC and
  the engine's start state finally describe the same object.
- **Every citation the edit touched verifies.** `orchestrate-dev.js:52`, `orchestrate-queue.js:64`
  / `:1072` / `:1074` / `:1947` / `:2068`, `transport.mjs:159` / `:168`, `report.mjs:50`,
  `bin/pdlc.mjs:40`, `package.json`'s `pdlcPluginCompat: "^0.22.0"` — read at HEAD this round,
  not carried. The ordering claim AC-1.2 rests on (opt-out evaluated before any drift-state
  read) is visible in one expression at `:1072-1074`, which is the cheapest possible form for a
  reviewer to re-verify.
- **The change note is auditable.** It names each absorbed erratum, separates "statements
  corrected to HEAD" from "gaps closed", and says which file each correction landed in. I could
  route every one of the eleven items to a diff hunk from the note alone.

## Recommendation

**Approved with minor changes**

All eleven routed errata are addressed in the document, none of the previously approved oracles
regressed, and the two corrections I raised last round (AC-2.1's unobservable evidence, M-ENG-08's
over-broad closing sentence) are closed at the mechanism level rather than by re-wording. The REQ
is a sound basis for TSPEC and PROPERTIES authoring as it stands.

The three findings are residue of the round's own widening rather than defects it failed to fix:
F-01 and F-02 both ask that a criterion the erratum *extended* have its HEAD start state
re-derived, since the erratum corrected row presence but not clause coverage. Neither blocks
downstream authoring — a TSPEC author reading AC-4.5 and AC-1.3 knows what to build; they would
only mis-estimate whether a test starts red. F-03 is a one-clause wording fix in the same
sentence F-01's fix will edit.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
