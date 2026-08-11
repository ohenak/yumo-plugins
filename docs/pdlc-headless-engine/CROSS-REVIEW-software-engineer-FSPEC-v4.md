# Cross-Review: software-engineer — FSPEC

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/FSPEC-pdlc-headless-engine.md` (v1.3)
**Date:** 2026-08-11
**Iteration:** 4
**Scope:** delta re-review of v1.2 → v1.3 against my own v3 findings (and the v2 set they carried),
plus new issues in changed sections only.

## Delta scope

Eight commits touch the FSPEC since `e1bdbcc0` (the v1.2 I reviewed at iteration 3), ending at
`e74cb61b`: 102 insertions, 51 deletions across §1, §2, §3.2/3.4/3.5, §4.1/4.4/4.5/4.6, §6.4, §8.1,
§8.6, §9.4, §10.2, §10.3, §11.2, §12.1, §13.1, §14.1, §16.1, §17.1 and §18.3. The change note claims
the High is §4.4 and that no v1.0–v1.2 decision is reopened. I checked both claims: the §4.4 rewrite
is a rescoping that follows REQ v0.8, not a new decision, and no rule outside the listed sections
moved. Every line-cited fact added this round I re-read at HEAD rather than taking on the note's word.

## Status of my prior findings

| ID | Severity | Status | Evidence in v1.3 |
|---|---|---|---|
| F-18 | High | **Resolved** | §4.4 now scopes AC-3.5's equality to "the prompt files the installed plugin holds **for those identifiers**", makes **both** directions refuse inside that scope, and deletes the unsatisfiability justification the REQ removed. That is REQ v0.8's resolution transcribed, not paraphrased (`REQ-pdlc-headless-engine.md:493-507`: "a dispatchable identifier with no readable file, and a prompt file for a dispatchable identifier that the engine cannot dispatch, both fail closed"). The three dependents followed: §13.1 O-ENG-1's behaviour cell restates rescoping-not-weakening with the counts marked "an observation of HEAD, never the assertion"; §14.1's AC-3.5 row drops "(with O-ENG-1)"; §6.4 stops citing the erratum and ranges over the same modules-derived set. The HEAD-red note is now scoped correctly to one-direction containment over `EXPECTED_SKILLS` — `pdlc/engine/lib/startup.mjs:20` is the frozen 17-name list (I counted: 15 skills + the two `se-implement` supplements), probed by containment at `:102`, and the over-declaration is dropped from the FSPEC's parenthetical where `docs/_constraints/pdlc-engine-baseline.md:99` already carries it. |
| F-19 | Medium | **Resolved** | BR-START-3 now names `doctor` as the surface AC-2.1 requires and pins its three fields (version pair, effective base URL, auth catalogue id) — matching `REQ:422-426` field for field. AT-ENG-09 asserts those three plus zero dispatches; §14.1's AC-2.1 row splits mapping (§5.1) from diagnostic surface (§4.1, §4.6); O-ENG-5's cell describes the resolution rather than the gap. |
| F-20 | Medium | **Resolved** | O-ENG-4's cell now reads "§2 defers to M-ENG-06's AC-2.3 row (partially green) and names the unasserted half it schedules … The table, not §2, is the authority" — which is what §2 actually does, and what `pdlc-engine-baseline.md:97` records. |
| F-21 | Medium | **Resolved** | §2's pointer is `(§8.1, AT-ENG-33)`, agreeing with §14.1's AC-4.1 row and with §8.1's set-equality. |
| F-13 (v2) | Medium | **Resolved** | BR-PARITY-5 now separates clauses 1–2 (agent-written) from clause 3 and states the anchors are the module's own write, citing `orchestrate-dev.js:6190` — verified: `await _appendFile(path, \`\nAPPROVAL-HASH: ${hash}\nREVIEWED-COMMIT: ${commit}\n\`)`, after the pre-count check. The added "the double must **not** write them" is the non-vacuity clause the rule was missing. |
| F-14 (v2) | Medium | **Resolved** | EC-CLI-7 exists, AT-ENG-05 and §17.1's range extend to it, and §3.2's HEAD-red note is exact: `positionals()` skips any token starting with `--` (`pdlc/engine/bin/pdlc.mjs:62-75`), and `--dry-runn` is not in `VALUE_FLAGS`, so it consumes no value and `hasFlag(argv, "dry-run")` is false — `pdlc dev REQ.md --dry-runn` does run live today. |
| F-15 (v2) | Medium | **Resolved** | §12.1's citations now land: the one-line/last-line convention is stated at `bin/pdlc.mjs:208-215` and emitted at `:235` (`console.log(JSON.stringify(stamped))`). |
| F-16 (v2) | Medium | **Resolved** | BR-EXIT-3 adds "it is always the *last* iteration, since BR-LOOP-4 stops the loop on a refusal" — consistent with §11.2's table, whose "engine refusal (startup, auth)" row reads "stop". |
| F-17 (v2) | Medium | **Resolved** | §12.1 now marks EC-REP-1's refusal half red at HEAD with both branch citations — verified: `cmdDev` returns at `:257` and `cmdQueue` at `:286`, both after `console.error(startup.reason)` and before any `emitReport`. AT-ENG-68's refusal half is correctly called out as starting red. |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-22 | Medium | Local | **BR-REP-0a and EC-CLI-7 are both new this round and disagree about whether an unknown flag emits a report line.** BR-REP-0a divides invocations by whether they "parsed into a well-formed command": those the ladder then rejects always emit the line; "an invocation that never became a command — unknown command, missing required positional, value flag with no value (EC-CLI-1/2/5)" emits none. EC-CLI-7 (`pdlc dev REQ.md --dry-runn`) is declared a usage error with exit `1`, but it is absent from that enumeration, and under BR-REP-0a's own criterion it falls on the *other* side: `dev` plus a REQ path **is** a well-formed command, so the rule as written requires a report line while §3.4 classifies it as a usage error. AT-ENG-05 does not settle it either — it pins EC-CLI-2 and EC-CLI-5 as no-line and EC-CLI-3 as line, and is silent on EC-CLI-7, which is the one case in its range whose oracle a test author cannot derive. This is the set-completeness problem, not a wording preference: BR-REP-0a's list is an explicit closed enumeration over a surface §3.4 has just widened by one row. Fix in one edit: add EC-CLI-7 to BR-REP-0a's list and restate its criterion as "an invocation the engine declined to accept as a command *or its flags*", then extend AT-ENG-05's parenthetical to name EC-CLI-7's side of the split. | §12.1 BR-REP-0a, §3.4 EC-CLI-7, §3.5 AT-ENG-05 |
| F-23 | Low | Local | **§14.1's AC-2.1 row and O-ENG-5's cell both cite AT-ENG-24 (and AT-ENG-11) as evidence for the diagnostic surface, and neither test observes `doctor`.** AT-ENG-24 asserts "`--dry-run` prints composed prompts and executes no dispatch; an attempted dispatch fails the run (BR-SKILL-5, EC-SKILL-6)" (§6.6) — a dry-run oracle, on a different command, naming none of BR-START-3's three fields. AT-ENG-11 asserts the version pair on "banner and run report", not on `doctor`'s report. Since AT-ENG-09 now carries the whole diagnostic obligation (three fields, zero dispatches, on the same fixture as a run), the extra two make the trace row read as broader coverage than exists. Fix: drop AT-ENG-24 and AT-ENG-11 from AC-2.1's diagnostic half in §14.1 and from O-ENG-5's cell, leaving AT-ENG-09 — or, if the "bills nothing" half is meant to be pinned separately, say which test does it. | §14.1 AC-2.1, §13.1 O-ENG-5, §6.6 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | Carried from v2/v3, and now doubled: §8.1's forward direction joins BR-MSG-1 in requiring an observable that **accumulates across the whole suite**. Under a parallel or sharded runner no single process sees every classification or every emitted id, so both invariants need either a one-process suite or an aggregation step. §18.4 explicitly hands test arrangement to TSPEC, so this stays a question for TSPEC rather than a finding here — but it is now two suite-wide accumulators, and a plan that discovers the constraint after choosing a runner pays for it twice. |
| Q-02 | §4.4 Direction B refuses when the plugin holds a file "for a dispatchable identifier that the engine cannot dispatch". Read against BR-START-4, that is only reachable if the engine *declares* a set and verifies it against the modules (drift between declaration and capability); under pure derivation the case cannot arise. Both are permitted by BR-START-4 and the choice is TSPEC's — but is AT-ENG-10's second fixture expected to be constructible under either choice, or does it presuppose the declare-and-verify shape? |

## Positive Observations

- The §4.4 rewrite is the right kind of fix for an erratum: it re-reads the resolved AC and
  transcribes it, rather than negotiating a middle position. "The distinction is membership of the
  modules-derived identifier set, never a judgement about the file" is the sentence that makes the
  rescoping implementable — it forecloses the obvious wrong reading, in which the engine would need
  a second list naming the operator-invoked skills, which is exactly the "second place to forget a
  skill" BR-START-4 forbids. One sentence closes a design trap the plan would otherwise walk into.
- AT-ENG-10 grew from two fixtures to three, and the third (an operator-invoked skill's file
  present ⇒ pass, reported only) is the one that keeps the rescoping honest: without it the new
  Direction B could be implemented as an unscoped equality and still pass.
- BR-PARITY-5's exception is stated with its reason attached — "or clause 3 asserts the fixture's
  bytes instead of the module's append logic, which is the vacuity this rule exists to prevent".
  A reader who later wonders why the double is forbidden one write finds the answer in place.
- The HEAD-red admissions added this round (§3.2's dropped unknown flag, §12.1's unstamped refusal)
  each name the branch that makes them red and the test whose half therefore starts red. Nothing in
  them is an absence-only claim, and I could confirm each in one lookup.
- AT-ENG-37 and AT-ENG-43 both moved from restating the rule to fixing an oracle — a jitter interval
  `[d, d+1000]` and three named message obligations. Those are the two tests a suite could otherwise
  have written vacuously.

## Recommendation

**Approved with minor changes**

My v3 High is closed at its root, not patched at its symptoms: §4.4 now states the equality REQ v0.8
settled, and the four places that derived from the old reading (§6.4, §13.1 O-ENG-1, §14.1, §18.3)
moved with it. The five findings I carried from v2 are all closed too, each with a citation I could
confirm at HEAD. No open High remains, in changed or unchanged sections.

The two findings above are both non-gating and both editorial in cost. F-22 is one sentence and one
list entry — a report-line rule and an edge case added in the same round that have not yet been
reconciled with each other. F-23 is two stale test ids in a trace row that AT-ENG-09 has since made
redundant. Neither reopens a decision, and neither needs my re-review.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
