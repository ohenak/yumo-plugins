# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.8)
**Date:** 2026-08-11
**Iteration:** 10

**Scope:** delta re-review of v1.8 against v1.7, the revision reviewed in round 9.
Diff read: `git diff fe45a936..HEAD -- docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md`
(+122/−29), across: v1.8 changelog, §3.3 (site classes 3/4, indirect dispatch, census),
§7.8 (probe mapping table, script anchors, BR-START-1 reading, EC-START-11 assertions),
§8.3 (`orchestrate-dev.js` row), §9.3 (note withdrawn, FSPEC erratum recorded).
Unchanged sections were not re-reviewed. Every claim below is grounded in HEAD on
`feat-pdlc-headless-engine` and cited `file:line`.

## Prior findings disposition

| v9 finding | Disposition | Verification at HEAD |
|---|---|---|
| F-44 (High) — classes 3/4 select far more sites than the census counts, so "cannot resolve ⇒ failure" makes the guard permanently red | **Resolved.** Classes 3 and 4 now require a string literal or an identifier bound to a module-level constant; **indirect dispatch** (parameter, local binding, member expression) is a declared third outcome — neither site nor failure — with its own asserted count. Census re-derived at HEAD and it lands exactly: class 3 direct = 1 (`skill: "harvest-learnings"`, `orchestrate-dev.js:10448`); class 4 direct = 12 = eleven first-argument literals (`:8008`, `:8035`, `:8064`, `:8112`, `:9964`, `:10028`, `:10068`, `:10142`, `:10251`, `:10542`, `orchestrate-queue.js:1216`) plus the module constant `_agent(ADVISORY_RUNG_SKILL, …)` (`:1841`, constant declared `:1797`); indirect = 11 = `skill: reviewers[0]`/`[1]` (`:5909`, `:5910`), `skill: authorSkill` (`:9288`), `skill: dispatch.creator` (`:9528`), and `:5573`, `:5579`, `:5585`, `:5876`, `:7124`, `:7463`, `:9244`. A full grep of `skill:` fields and of `_agent(`/`agentFn(`/`_sessionAgent(` call sites at HEAD returns no member of any class beyond these — the two stub declarations `async function agent(skill, …)` (`orchestrate-dev.js:8458`, `orchestrate-queue.js:932`) are declarations, not calls. The "a direct site becoming indirect moves a number rather than disappearing" clause closes the escape the census existed to close. | `orchestrate-dev.js:1797`, `:1841`, `:5573-5585`, `:5876`, `:5909-5910`, `:7124`, `:7463`, `:9244`, `:9288`, `:9528`, `:10448`; `orchestrate-queue.js:1216` |
| F-45 (Medium) — EC-START-11's rung-5 conjunct was absence-shaped on a three-valued enum | **Resolved.** §7.8's second test now asserts "rung 5's record exists with `state === "pass"` under a green billing posture", and the changed row explains why `state !== "skipped"` was insufficient. Rung 5 is the billing-posture rung (§4.3 line 1058), `RungRecord.state` is `"pass"\|"fail"\|"skipped"` (line 1030), so the positive form is available in a fully injected fixture and is now taken. | TSPEC §4.3 (`:1029-1030`, `:1058`), §7.8 (`:2239`) |
| F-46 (Medium) — §7.8's script anchors off by one, and §9.3 alleged an upstream defect that was not there | **Resolved, and the withdrawal is the correct call.** At HEAD `PY_BIN=""` is `:14`, the candidate loop `for cand in python3 python py; do … done` is `:15-20`, the probe `command -v "$cand" … && "$cand" -c "import sys"` is `:16`, and the fail-open `[ -z "$PY_BIN" ] && exit 0` is `:21`. §7.8 now cites `:16` for the probe, `:15-20` for the loop and `:21` for fail-open — all three correct. FSPEC's `:14-21` spans initialisation through fail-open and is correct, exactly as §9.3 now says; the incidental note is withdrawn rather than left to provoke a needless upstream edit. | `pdlc/hooks/scripts/guard-harvest-before-delete.sh:14-21` |
| F-47 (Low) — census labelled "at HEAD" though only some figures are measurable there | **Resolved.** §3.3 now separates "classes 2 and 4's figures are measured at HEAD" from "class 1's 7 is counted after the edit", names `ADVISORY_RUNG_SKILL` (`orchestrate-dev.js:1797`) as the only constant existing today, and the v1.7 changelog line is retro-annotated rather than silently restated. Confirmed at HEAD: `grep -n 'SKILL_' pdlc/workflows/*.js` yields no `SKILL_*` constant besides `ADVISORY_RUNG_SKILL`. | `orchestrate-dev.js:1797`; TSPEC §3.3, v1.7/v1.8 changelog |
| Q-20 (rung 4a probe vs BR-START-1) | **Answered, and routed correctly.** §7.8 states the reading an implementer builds to (a local `spawnSync` bills nothing; BR-START-1's own justification is "zero tokens billed") and raises the missing qualifier as an FSPEC erratum rather than narrowing the design to fit prose. | TSPEC §7.8, §9.3; `FSPEC:302-303`, `:922-924` |
| Q-21 (`{ran, outcome}` mapping) | **Answered with a fixed table** — `ENOENT` ⇒ `{false, "not found"}`, non-zero `status` ⇒ `{false, "found but exited ${status}"}`, `status === 0` ⇒ `{true, "ran"}` — and EC-START-11's fixture was re-cut to use those exact phrases (`"found but exited 9009"`, `"ran"`), so the two sections no longer disagree. | TSPEC §7.8 (`:2239`) |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-48 | Medium | Local | **One of the eleven indirect positions is not reachable from the class definitions, so the asserted count is 11 by enumeration and 10 by rule.** Class 4 is "the first argument of a dispatch call", and indirect dispatch is defined as "a class 3/4 argument" that is a parameter, local, or member expression. At `orchestrate-dev.js:5573` the call is `_sessionAgent(sessionKey, skill, prompt, opts)` — the skill is the **second** argument, so under the stated rules this position is neither class 4 nor a class-4 argument, and a harness author implementing the definitions literally counts 10 indirect positions while the census asserts 11. The count is a gate conjunct, so the disagreement surfaces as a red suite on correct code, not as prose drift. The prose gestures at it ("a `skill` parameter threaded through a wrapper"), which is why this is Medium rather than a repeat of F-44: the intent is legible, the rule is not yet. Fix is one clause — name the skill-argument position per dispatch function (`_agent`/`agentFn` first argument, `_sessionAgent` second) so both the direct 12 and the indirect 11 derive from the rule rather than from the list. | §3.3 (class 4, indirect dispatch, census) |
| F-49 | Low | Local | **§8.3's per-file edit-surface arithmetic double-counts one literal.** The `orchestrate-dev.js` row says literals are replaced "at their **direct** dispatch sites (the eleven class-4 literals and the one class-3 `skill:` literal §3.3 enumerates)", but only ten of the eleven class-4 literals are in that file — the eleventh is `orchestrate-queue.js:1216`, which has its own row. That row, in turn, adds `SKILL_TRIAGE` as an export without saying the `"se-author"` literal at `:1216` is what becomes the reference, leaving class 1's seventh constant with no stated use site. Neither affects a census figure (both are per-class, not per-file), so this is documentation arithmetic: say "the ten class-4 literals in this file" and let the queue row own its own. | §8.3 (`orchestrate-dev.js`, `orchestrate-queue.js` rows) |

## Questions

None. Q-20 and Q-21 are closed by §7.8, and no new ambiguity was introduced by the changed sections.

## Positive Observations

- **The F-44 repair chose the harder and more durable of the two available fixes.** The cheap fix was
  to loosen "cannot resolve ⇒ failure" into "skip what you cannot resolve", which re-opens the ∅ hole
  the census was built to close. Instead the document added a *third* outcome with its own asserted
  count, and justified it on a real property rather than on convenience: an indirect argument carries
  a value the derivation already governs at its source, so scoring it again at the point of use would
  demand the extractor evaluate the program. That reasoning is checkable and it holds — every one of
  the eleven indirect positions traces to a class-2 role field or a class-4 direct site.
- **The census now fails in the right direction in both directions.** "A direct site rewritten to
  dispatch through a variable moves one count out of the direct 12 and into the indirect 11 rather
  than vanishing from both" is the property that makes two asserted numbers stronger than one: the
  refactor that would previously have quietly shrunk the guarded set now has to move a number a human
  reads. That is the difference between a census and a checksum.
- **§9.3's withdrawal is the round's best moment.** Round 8 alleged an off-by-one in FSPEC's
  `:14-21`; round 9 re-measured, found the error was this document's own, said so in those words, and
  deleted the upstream allegation instead of hedging it. I re-measured independently and the
  withdrawal is right at every line. A document that retracts its own findings against upstream is a
  document whose remaining citations are worth spending time on.
- **Q-21's answer went past the question into the fixture.** I asked whether the `{ran, outcome}`
  mapping was fixed or left to the plan; the answer fixed it in a table *and* re-cut EC-START-11's
  fixture to use the table's exact phrases (`"found but exited 9009"` in place of `"found but did not
  execute"`). Answering a question without propagating it into the test that depends on it is how
  specs acquire internally inconsistent examples; that did not happen here.
- **F-45's fix names why the weak form was weak.** The row does not merely assert `state === "pass"`;
  it records that `state !== "skipped"` "would be satisfied by a rung-5 *failure* as readily as by a
  pass". The next author to be tempted by an absence oracle in this file has the counter-argument in
  front of them.

## Recommendation

**Approved with minor changes**

The one blocker from round 9 is closed on the merits. Classes 3 and 4 are now scoped by argument
syntax, indirect dispatch is a named third outcome rather than a silent failure, and the census
re-derives from the class definitions instead of from a hand-list — I re-measured all four classes at
HEAD and the 12 direct / 11 indirect split is exact, with no class member outside the enumeration.
The rule that gave the census its teeth ("cannot resolve is a failure") survives intact for the
syntactic forms it can actually govern, which was the whole point of the finding.

The two Medium/Low findings that remain are not gating and neither reopens the review. F-48 is the
last unswept corner of the same repair: `_sessionAgent`'s skill sits in the second argument, so one
of the eleven indirect positions is reachable by enumeration but not by rule, and the fix is a clause
naming the skill-argument position per dispatch function. F-49 is per-file arithmetic in §8.3 that no
test reads. Both can land with the next edit that touches §3.3 or §8.3.

On the review contract's three oracle clauses, applied to the changed sections only. **No
implementation echoes:** §3.3's census remains an asserted test-side transcription, explicitly "not
observed", and §7.8 restates that `GUARD_INTERPRETERS` is a transcription of the shipped script's
candidate list, "never an import from it" — the `spawnSync` mapping table added this round is
likewise literal, with the phrases spelled out rather than derived from a helper. **No absence-only
oracles:** the one remaining absence shape I flagged in round 9 (EC-START-11's `state !== "skipped"`)
is now a positive assertion on rung 5's record, and EC-START-10's "nothing dispatched" was already
the positive `accumulator.length === 0` over a live instrument with a dispatching control beside it;
I find no new negative-only assertion in the changed text. **Completeness is set-equality:**
§7.8's `GUARD_INTERPRETERS` is set-equality against three transcribed names, §4.3's rung-id
set-equality against `RUNG_ORDER` stands, and §3.3's containment is still backed by the per-class
census — now by two counts rather than one, which strictly strengthens it.

One erratum is raised against FSPEC and emitted in this dispatch's final message rather than folded
into any document. It is the same defect I raised as Q-20 in round 9 and which §9.3 now records:
BR-START-1's "no probe of any kind ... while the ladder is running" (`FSPEC:302-303`) is literally
contradicted by BR-GUARD-6's requirement that rung 4a observe availability "by **running** a
candidate" (`FSPEC:922-924`). I re-emit it because the erratum channel, not §9.3's prose, is what
routes it to FSPEC's author; the TSPEC's handling of it is correct and needs no change.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}

APPROVAL-HASH: sha256:18cdb56fec9a0b5694b198f2ae5a786cc83b2172d5c12238499e4832449ae483
REVIEWED-COMMIT: ed0e0eecc6b19b3e17436fbb71d290670b09f8a4
