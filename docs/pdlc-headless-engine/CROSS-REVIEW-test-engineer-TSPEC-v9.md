# Cross-Review: test-engineer — TSPEC

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` (v1.7)
**Date:** 2026-08-11
**Iteration:** 9

**Scope:** delta re-review of v1.7 against v1.6, the revision I reviewed in round 8.
`git diff 3feae567~1..HEAD -- docs/pdlc-headless-engine/TSPEC-pdlc-headless-engine.md` is
+251/−53 across: the v1.7 changelog, §3.3 (guard rescoped by site, census, transcription
conjunct), §4.3 (rung 4a pointer), §5.3 (catch marked as added; return-site citation),
§6.4 (rung 4a vs EC-GUARD-4), §6.5 (Q-19), §7.4 row 4, §7.5 (Q-18), **new §7.8**,
§8.1/§8.2/§8.3 (C-11 row, `startup.mjs`, `run.mjs`), §9.2 and §9.3. Unchanged sections
were not re-reviewed. Every claim below is grounded in HEAD source on
`feat-pdlc-headless-engine`, cited `file:line`.

## Prior findings disposition

All four v8 findings and both v8 questions were addressed. I re-verified each repair against
HEAD rather than against the changelog's account of it.

| v8 | Disposition | Verification at HEAD |
|---|---|---|
| F-40 (High) — the no-bare-literal guard's "skill-identifier shape" predicate was unwritable | **Direction resolved, predicate not yet.** Scoping by *site* rather than by string shape is the right repair and the reasoning is now airtight: the reviewer-role map's keys and values are indeed syntactically indistinguishable on the same three lines, and the map is none of the four classes so it needs no exemption. The census answers the ∅-extraction hole I raised, and class 2's figure re-derives exactly. But classes **3 and 4 as defined select strictly more sites than the census counts**, and the "cannot resolve ⇒ failure" rule makes those extra sites red on correct code — see F-44. | `orchestrate-dev.js:6229-6231`; `:3316`, `orchestrate-queue.js:45`; `PHASE_DISPATCH` `:3338-3436` |
| F-41 (High) — rung 4a arrived with no oracle, no seam, no traceability row | **Resolved, in full and in the shape asked for.** New §7.8 declares `GUARD_INTERPRETERS` + `probeGuardInterpreter({runProbe})` on `lib/startup.mjs`, names why neither §7.0/§7.1's bootstrap nor `_runCommand` reaches the startup path, and specifies both branches as hermetic `runProbe`-injected tests. "Nothing dispatched" became the positive conjunct I asked for (`accumulator.length === 0` plus a dispatching control in the same file). §8.2 carries the C-11 row, §8.1 names the two constraint-borne obligations that have no AC row, §6.4 and §8.3's `startup.mjs` row now separate EC-GUARD-4 from rung 4a. `GUARD_INTERPRETERS`'s three names match the shipped script exactly. | `guard-harvest-before-delete.sh:15`; `FSPEC:299`, `:406-407`, `:918-924`, `:967`; TSPEC §7.8, §8.2 |
| F-42 (Medium) — derivation test recomputed from the same imported data | **Resolved.** The ten identifiers are transcribed test-side as a second conjunct, and the asymmetry with §7.4 is stated rather than left implicit: BR-START-4 forbids a *production-side* declaration, not a test-side assertion of what production must derive. I checked the ten against HEAD — `PHASE_DISPATCH`'s eight rows yield `pm-author, se-author, te-author, pm-review, se-review, te-review, dod-verify, se-implement`, plus `ship-pr` (`:8008`, `:8112`) and `harvest-learnings` (`:10448`, `:10542`) = 10, exactly the transcribed list. | `orchestrate-dev.js:3338-3436`, `:8008`, `:8112`, `:10448`, `:10542` |
| F-43 (Low) — §5.3 cited the consumption site as the return site | **Resolved.** §5.3 now reads "constructed and returned at `orchestrate-dev.js:1847` and `:1857`; the caller reads it at `:3143-3149`", matching §7.4 row 4. | `orchestrate-dev.js:1847`, `:1857`, `:3143` |
| Q-18 (corpus scoping asserted, not merely supplied) | **Answered as a sixth conjunct**, set-equality over the five named configurations — not containment, so both an unnamed sixth configuration and a configuration that recorded nothing are red. §8.3's `_assert-suite-wide.mjs` row was updated in step. | TSPEC §7.5, §8.3 |
| Q-19 (what the M-ENG-09 gate asserts about the row) | **Answered with the one clause I asked for**, and the answer is the load-bearing one: presence **and** consistency between the recorded `denyFired` value and the shipped mechanism, so `denyFired: no` with the hook carrier still shipped is red. | TSPEC §6.5 |

The PM-side repairs also land: `run.mjs` at HEAD really does contain no `catch` clause — only
`withCwd`'s `try` at `:159`, paired with `finally` — so marking §5.3's top-level catch as *added*
(`runDev` `:187`, `runQueue` `:228`) corrects a claim that read as observation. §9.2's sweep onto
the one-platform matrix matches `pr-tests.yml:40` (`os: [ubuntu-latest]`).

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-44 | **High** | Local | **Site classes 3 and 4 select strictly more sites than the census counts, and the "cannot resolve ⇒ failure" rule makes the surplus red on correct code — the F-40 failure mode reproduced one layer down.** The classes are declared *closed*: **(3)** "a `skill:` object field", **(4)** "the first argument of a dispatch call", with "a site the extractor cannot resolve to [a string literal or a module-level constant] is a **failure**, never a skip". Measured at HEAD, class 3 has **five** members, not one: `skill: reviewers[0]` and `skill: reviewers[1]` (`orchestrate-dev.js:5909`, `:5910`), `skill: authorSkill` (`:9288`), `skill: dispatch.creator` (`:9528`), and the census's single literal `skill: "harvest-learnings"` (`:10448`). Class 4 likewise: beyond the eleven literal first arguments the census lists, HEAD dispatches through a variable at `_sessionAgent(sessionKey, skill, …)` (`:5573`), `_agent(skill, prompt, opts)` (`:5579`, `:5585`, `:7124`), `_agent(optimizer, postmortemPrompt)` (`:5876`), `_agent(reviewer, recoveryPrompt, …)` (`:7463`) and `agentFn(PHASE_DISPATCH[phaseId].optimizer, …)` (`:9244`) — seven more. None of these resolves statically to a literal or to a module-level constant, so by the stated rule each is a failure and the guard is **permanently red on correct code**; the only repair available to a harness author is to loosen the rule to "skip what you cannot resolve", which is precisely the pressure §3.3 exists to remove, and which re-opens the ∅ hole the census was added to close. A twelfth class-4 site, `_agent(ADVISORY_RUNG_SKILL, prompt, {model})` (`:1841`), *does* resolve — to a module constant, exactly as the rule prescribes — yet is absent from the eleven, so the census cannot be reproduced from the class definitions even for the resolvable cases. **Repair, one clause:** define classes 3 and 4 by *argument syntax* — a string literal, or an identifier bound to a module-level constant — and name **indirect dispatch** (an argument that is a parameter, a local, or a member expression) as an explicit third outcome that is neither a site nor a failure, because those arguments are values the derivation already governs at their source. Then assert its count too (5909, 5910, 9288, 9528 + 5573, 5579, 5585, 5876, 7124, 7463, 9244 = 11 at HEAD), so a literal *becoming* indirect moves a number rather than disappearing. With that, the census reads 7 / 28 / 1 / 12 direct + 11 indirect and every figure re-derives from the text. | §3.3 (site classes, census); §8.3's `orchestrate-dev.js` row |
| F-45 | Medium | Local | **EC-START-11's "rung 5 is reached" conjunct is absence-shaped on a three-valued enum, in a fixture that can afford the positive form.** §7.8's second test asserts `state !== "skipped"` for rung 5. `RungRecord.state` is `"pass"|"fail"|"skipped"` (§4.3), so the assertion is satisfied by a rung-5 **failure** as readily as by a pass — it proves the ladder did not skip, not that it continued. The branch's core assertions (`rung 4a state === "pass"`, `interpreter === "python"`, `attempts` records both in order) are positive and carry the behaviour, which is why this is Medium rather than High; but the fixture is hermetic and fully injected, so the exact value is available: assert rung 5's record exists and `state === "pass"` under a green billing posture, which is what "the next candidate decides" means operationally. | §7.8 (EC-START-11 row); §4.3 (`RungRecord`) |
| F-46 | Medium | Local | **§7.8's citations into the shipped guard script are each off by one, and §9.3 propagates the error into a correction of FSPEC that is itself wrong.** HEAD: `PY_BIN=""` is `:14`, the candidate loop `for cand in python3 python py; do` is `:15`, the probe `"$cand" -c "import sys"` is `:16` (conjoined with `command -v "$cand"`), the loop closes at `:20`, and the fail-open `[ -z "$PY_BIN" ] && exit 0` is `:21`. §7.8 cites `:15` for the probe command (it is `:16`), `:14` for "the loop" (it is `:15`) and `:20` for the fail-open (it is `:21`). §9.3 then states that FSPEC's `guard-harvest-before-delete.sh:14-21` "is a line off at each end — the candidate loop is `:14-19` and the fail-open is `:20`", and concludes "§7.8 cites the precise lines". **FSPEC's range is correct**: `:14-21` spans `PY_BIN=""` through the fail-open exactly. The content claims are all true — the candidate set and the probe command are transcribed correctly, which is why this is not High — but a transcription whose whole justification is "a script-side change turns the test red" should anchor on the lines it names, and a §9.3 paragraph asserting an upstream defect that does not exist invites a needless upstream edit. Fix the three anchors and delete the incidental note. | §7.8 (seam block); §9.3 (final paragraph) |
| F-47 | Low | Local | **The census is labelled "at HEAD" but only one of its four classes is measurable at HEAD.** §3.3 says "At HEAD, after the edit §8.3 specifies, the four classes hold 7 / 28 / 1 / 11", and the v1.7 changelog compresses this to "47 at HEAD, each figure measured". Only class 2 (28) is measurable at HEAD; the seven class-1 constants do not exist yet (`grep -n 'SKILL_' pdlc/workflows/*.js` returns nothing — `ADVISORY_RUNG_SKILL` at `orchestrate-dev.js:1797` is the sole constant, and `SKILL_TRIAGE` is introduced by this feature per §8.3), and classes 3 and 4 change shape when literals become constant references. Say "post-edit" once, in both places; a reader who greps for `SKILL_TRIAGE` before the edit lands otherwise concludes the census is wrong rather than forward-dated. | §3.3 (census); v1.7 changelog |

## Questions

| ID | Question |
|----|---------|
| Q-20 | §7.8's probe runs a subprocess *during* the ladder, at rung 4a. FSPEC's BR-START-1 says "No model call, and no probe of any kind, is made while the ladder is running" (`FSPEC:302-303`), and its surrounding sentence is about billed tokens, so the intended reading is plainly "no *billable* probe". BR-GUARD-6 requires the opposite for rung 4a — observation "by **running** a candidate" (`FSPEC:922-924`). I have raised this upstream as an erratum rather than folding it into a finding, but §7.8 is where an implementer will meet it: one sentence saying rung 4a's `spawnSync` is a local process probe, not the kind BR-START-1 forbids, would stop a careful implementer stalling on the contradiction. |
| Q-21 | §7.8 says `runProbe`'s default is `spawnSync(candidate, ["-c", "import sys"])`, "the shipped script's own probe command, verbatim". The script's test is a *conjunction*: `command -v "$cand"` **and** `"$cand" -c "import sys"` (`guard-harvest-before-delete.sh:16`). `spawnSync` on an absent binary yields `error.code === "ENOENT"` rather than a non-zero status, so the two agree on the accept/reject verdict — but they differ on the `outcome` phrase the refusal quotes, and EC-START-10's oracle asserts each candidate's own outcome phrase. Is the `{ran, outcome}` mapping from `spawnSync`'s three shapes (`ENOENT`, non-zero `status`, `status === 0`) meant to be fixed by this document, or left to the plan? Either answer is fine; a fixture author needs to know which. |

## Positive Observations

- **The F-40 repair went to the harder, correct place, and its central argument is one I could
  falsify and could not.** "Sites are enumerable; shapes are not" is the right generalisation, and
  the reviewer-role map is the right proof: `"se-review"` and `"software-engineer"` sit on
  `orchestrate-dev.js:6229` as key and value, and no string predicate separates them — but the map
  is none of the four classes, so it needs no exemption. The section also anticipated the two
  readings I had not written down (the `meta.name` reading, red at `:3316` and
  `orchestrate-queue.js:45`) and closed them. Class 2's census re-derives exactly against HEAD:
  5 non-null `creator`, 7 `optimizer`, 14 across seven two-member `reviewers` arrays, 1 `verifier`,
  1 `remediator` = 28 over eight `PHASE_DISPATCH` rows. F-44 is a defect in two of the four class
  definitions, not in the idea.
- **§7.8 is the most complete new section this document has produced, and it answers F-41 in the
  order a harness author reads.** Branch table → why no existing seam reaches it → the seam, typed,
  with its totality and ordering stated → two fixtures → assertions. The `_runCommand` exclusion is
  argued rather than asserted (it is a workflow-module seam supplied to `orchestrate-dev.js` for
  Phase I's wave gate, not on the startup path), and I verified the candidate set against the shipped
  script line by line: `python3 python py`, in that order, matching `GUARD_INTERPRETERS` and
  FSPEC's "never widens or narrows that set independently".
- **"Nothing dispatched" became exactly the positive conjunct I asked for, and then went one better.**
  `accumulator.length === 0` over a live instrument, *plus* a companion control in the same file
  asserting a dispatching run records non-zero — so an accumulator that was never installed cannot
  score the refusal green. That control is the part I did not ask for and the part that makes the
  oracle honest; it is the same move §7.5's sixth conjunct makes for corpus scoping.
- **§5.3's correction is a reversal against the document's own interest, made on evidence.** v1.6
  described the top-level catch as mechanism; HEAD's `run.mjs` has no `catch` at all, only
  `withCwd`'s `try` at `:159` closing on `finally`. Saying "this is designed behaviour, not observed"
  and threading it through §7.4 row 4, §8.1's AC-4.4 row and §8.3 is four edits where one would have
  passed review. Documents that mark their own unbuilt parts are the ones whose citations stay
  trustworthy.
- **§6.5's Q-19 answer picked the load-bearing branch.** It would have been easy to answer "presence,
  keyed on `process.platform`" and be done. Instead the gate is red on `denyFired: no` while the hook
  carrier is still shipped, and green again once the posture is tightened — so the gate tracks the
  agreement between the recorded fact and the shipped mechanism rather than the existence of a line
  in a file. That is the difference between a measurement and a checkbox.

## Recommendation

## Verdict
