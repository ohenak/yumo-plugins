# Cross-Review: product-manager — PLAN

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-engine-distribution/PLAN-pdlc-engine-distribution.md` (v0.2)
**Date:** 2026-08-13
**Iteration:** 2
**Scope:** Delta re-review. Product lens only — traceability, scope compliance, acceptance-criteria
fidelity. Diffed `a5b463fc..HEAD` on the PLAN (169 insertions, 60 deletions across §1.1, §1.2, §2
header, twelve task rows, four new rows, new §2.1, §3, §4, §5, §6, §7).

## Round-1 findings — disposition

| Round-1 | Severity | Status | Evidence in v0.2 |
|---|---|---|---|
| F-01 id namespace | High | **Resolved** | §2's header now states the FSPEC `AT-` namespace outright and spells the offset pairs (`AT-2.4` *(AC-2.3)*, `AT-2.5` *(AC-2.4)*, `AT-1.5` *(AC-1.2)*, `AT-1.6` *(AC-1.4)*), which match FSPEC §8 exactly. The three mis-cited groups are all corrected: T13/T25/T45 now cite `AT-2.5`; T31/T52 cite `AC-1.5` with a note that AT-3.8a is its verifier and T16 owns it; T11/T41 cite `AT-2.1`/`AT-3.8b` and no longer `AT-6.1`, which is now T44's alone. |
| F-02 AC-4.4 unscheduled | High | **Resolved as asked** | T56 owns the three-observation change-then-revert record (`EVIDENCE-AT-4.4.md`), edged `T50 → T56`, with §4 kind 5 explaining that the machine must be able to make a different plugin version current. See F-03 below on its *strength*, which is a new and separate point. |
| F-03 AC-1.2 unscheduled | High | **Resolved** | T57 carries AT-1.5: a fixture plugin root whose dispatched role's `SKILL.md` holds a distinguishing marker, asserted on the composed prompt, with a second root as its falsifier. `composePrompt` is real at HEAD (`pdlc/engine/lib/adapter.mjs:327`, exported at `:556`), so the row is buildable as written. |
| F-04 AC-2.2 unscheduled | High | **Resolved** | T50's second leg now names all three distinguishing conjuncts of AT-2.3 — two repos, one machine-level upgrade, zero in-repo commands asserted *positively* against a recorded command log, N+1 visible in output **and** artifacts. |
| F-05 publish criteria by ellipsis | High | **Resolved** | T58 enumerates AT-3.2/3.3/3.5/3.6/3.7 leg by leg with the S-5 stub, including AT-3.3's byte-identity on *both* branches and AT-3.5's sentinel plus REQ AC-3.5's two positives; T49 lists all nine ids with the file that carries each; `T58 → T49` closes the fixture-with-no-consumer gap. |
| F-06 refusal variants | Medium | **Resolved** | T15 legs (d)–(g) name AT-1.2's `notEqual` distinguishability, AT-1.4's "not the none-installed message", AT-1.3's either-state completion and AT-1.6's three-way triple equality. |
| F-07 plan carries an unresolved upstream contradiction | Medium | **Resolved** | §7's closing paragraph now gates Phase I on three named errata and each of T16/T45/T50 states its dependence in its own cell. The FSPEC/TSPEC split of the three is stated correctly. |
| F-08 T10 undeclared extension | Low | **Resolved** | T10 states the 9-test HEAD file, forbids whole-file write, and fixes completion at 9 + added. `engine-config.test.js` does hold nine `test(` calls at HEAD. |

All five round-1 High findings are closed. Everything below is new, and confined to text this
round added.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | **The new preservation floors in DoD item 2 are stated in counts that two of the five extended files do not have, and the wrong count is satisfiable by the deletion it exists to prevent.** §5 point 1 (added this round) argues correctly that a whole-file write over an extended file "deletes passing assertions **and leaves the suite green** — the one defect class a coverage gate cannot see", and DoD item 2 turns that into the observation: "`engine-config.test.js` still has its nine, `skills-composition.test.js` its twelve, and `run.test.js`'s three tests are restated rather than removed." Checked at HEAD: `engine-config.test.js` has nine `test(` calls ✓. `run.test.js` has **21** tests (`test(` at `:41, :51, :67, :83, :96, :106, :121, :127, :133, :151, :167, :183, :212, :240, :255, :273, :291, :307, :325, :342, :353`), of which only three are the anti-fork/module-path tests T33 and T41 restate — §5 point 4 says "three *relevant* tests" and is right, but DoD item 2 drops the qualifier, so a rewrite leaving three tests and deleting eighteen (`devInjection`/`queueInjection` seam tests, the refuse-before-import tests, the cwd-pinning pair, the `runQueueLoop` pair) passes the criterion as written. `skills-composition.test.js` is worse than imprecise: it has **fourteen** `test(` call sites, twelve of them plain (`:64, :133, :147, :195, :207, :242, :255, :298, :316, :330, :378, :395`) and two of them generated sweeps inside `for` loops over `DISPATCHABLE_SET`'s ten members (`:82` AT-ENG-20's per-skill prompt-file-set property, `:166` AT-ENG-21's per-skill no-Skill-tool property), so the file executes **32** tests. A rewrite that deletes exactly the two sweeps — twenty executed tests, both named oracles — leaves precisely "its twelve" and passes. That is the AC-1.2 carrier file (T57) and the sweeps are the strongest properties in it. *Fix:* state each floor as an observation that survives the deletion it guards — for `run.test.js` "all 21 HEAD tests present, the three module-path/anti-fork ones restated"; for `skills-composition.test.js` "twelve top-level tests **plus** the two generated sweeps over `DISPATCHABLE_SET`'s ten members, 32 executed"; and mirror the same wording into T57's cell, which today repeats the bare "twelve". | AC-1.2, AC-1.3 (P0, REQ-EDIST-01) |
| F-02 | Medium | Local | **§2.1 and §2's trailing citation lists — the two mechanisms the plan declares are the coverage oracle — disagree on seven rows.** §2.1 says each `AT-` "names at least one task", and §2.1's closing paragraph says "the trailing list is the machine-readable claim". Diffed both directions: `AT-2.2` table names T18, but T18's row carries **no trailing citation list at all** (it ends at the `docs-uniqueness.test.js` cell); `AT-3.1` table names T58, T58's list does not; `AT-5.1` table names T28, T28's list is `(AT-5.5)` only; `AT-5.3` table names T29 and T38, whose lists are `(AT-4.1, AT-4.2)` and `(AT-4.5)`; `AT-5.3b` table names T24 and T39, whose lists omit it; conversely T31 claims `AT-3.8a` and T33 claims `AT-6.1`, and §2.1's rows for those two ATs do not list them. No acceptance test loses its carrier either way, so this is not a coverage gap — it is that the set-equality §2.1 was added to make mechanical is not yet mechanical, and a reader reconciling them by hand is back where round 1 started. *Fix:* make the two agree in both directions, and give T18 a trailing `(AT-2.2)` so every row that claims an acceptance test claims it in the machine-readable place. | AC-2.2, AC-3.1, AC-5.1, AC-5.3 |
| F-03 | Medium | Local | **AC-4.4 is scheduled, but as a transcribed manual observation where FSPEC classifies it as automatable today — and unlike AC-6.2 that narrowing is not declared.** FSPEC §8's AT-4 group is **[fixture]**, and its header says outright "AT-4.4 is *not* blocked: it needs two plugin versions and a revert, no new carrier". T56 delivers it as `[manual]` evidence: three pairs transcribed into `EVIDENCE-AT-4.4.md`. The capability is present — T56 depends on T50, and §4 kind 5 notes the fixture machine can already make a different plugin version current for AT-2.6's pairing leg — so this is a choice, not a constraint. The consequence is the one T56's own cell names: a hardcoded pair "satisfiable by a constant that happens to match once" is caught by the first observation and by nothing afterwards, because a dated document does not re-run. §1.2 sets the precedent for how to handle this honestly (it states AC-6.2's partial delivery in product terms and says why the automated form is impossible); AC-4.4 gets no equivalent statement, so a DoD reader sees a P0 criterion with a carrier and cannot tell its verification is one-shot. *Fix:* either add the change-then-revert assertion to T50's fixture-machine legs, where AT-2.6's capability already sits, or state in §1.2 that AC-4.4 is delivered as a one-time observation with no regression guard and say why. | AC-4.4 (P0, REQ-EDIST-04) |
| F-04 | Low | Local | **§5 point 4's line anchor spans three tests rather than the one it describes.** "`pdlc/engine/__tests__/run.test.js:45-79` asserts that the engine vendors no copy of the workflow modules (C-4) by walking `pdlc/engine/`" — the C-4 walk is `:51-64`; `:41-49` is the checkout-path equality T41 restates and `:67-79` is PROP-FORK-1, both of which the *next* paragraph anchors correctly and separately. Every other anchor I sampled this round is exact: `_assert-suite-wide.mjs:195-213` is `checkMessageCatalogue` failing in both directions, `seam-contract.test.js:47`/`:57` are the two frozen key lists with their `deepEqual`s at `:67`/`:72`, `_run-suite.mjs`'s forwarded-argv comment is at `:13-18` and the forwarding is real (`:44`, `:50` place `...forwardedArgs` before `__tests__/`), `package.json:11` is `"license": "UNLICENSED"`, `git ls-files` lists no `LICENSE`, and `README.md:115` / `pdlc/README.md:139,145` are the three `claude plugin install` occurrences T18 asserts on. *Fix:* narrow the anchor to `:51-64`. | — |

## Questions

| ID | Question |
|----|---------|
| Q-01 | §7 item 14 makes `fixture-machine.yml` a **required** check on the PR. That is the right call for DoD strength, but T50's own cell says the container and real-spawn legs are capability-gated and that skips are "recorded and reported loudly" rather than silently passing. If the workflow legitimately skips on a runner that cannot provide the capability, does the required check report success (green with recorded skips) or failure? Item 14 says "the DoD is not met while the sixth is red", which is unambiguous only if a loud skip is not red. One sentence in item 14 settles it. |
| Q-02 | Round-1 Q-02 is answered clearly — O-8 blocker 3 is in scope, T05 is atomic, item 16 stands. One consequence worth stating: the branch is now unmergeable until an operator writes an actual licence choice into `docs/_decisions/DECISIONS-plugin-distribution.md`. Is that operator obligation tracked anywhere outside this PLAN — a queue row, an escalation — or does it surface only when T05's batch is reached in Phase I? |

## Positive Observations

- **The four new rows are the four gaps, exactly, and they were added rather than argued away.**
  T56 (AT-4.4), T57 (AT-1.5), T58 (the five stub-channel legs), T59 (the hermetic recorder) each
  land with a red-before-green edge or a declared `[standing guard]` carve-out, a manifest row, a
  batch that satisfies `max(deps)+1`, and — for T58 — the S-5 fixture that previously had no
  consumer. §4's kind-1 table grew the three edges that were missing (`T05 ← T16`, `T49 ← T58`,
  `T50 ← T59`) rather than leaving them to batch arithmetic.
- **§2.1 is a genuine set-equality against FSPEC §8, not a sample.** I enumerated FSPEC's ids
  independently — 35 of them across AT-1…AT-6, including the `3.8a`/`3.8b` and `5.3`/`5.3b` splits
  — and §2.1 has 35 rows, one per id, no extras and none missing, with the `*(AC-n.m)*` annotation
  on every row matching FSPEC's own. F-02 is about it disagreeing with §2, not about the set.
- **T05's reversal is the strongest correction in this round.** The round-1 plan had T05 as a pure
  gate; v0.2 works out that recording N-2 makes PK-3 expected the same moment, that no `LICENSE`
  exists at HEAD and `package.json:11` is `UNLICENSED` — both verified — and that a gate-only T05
  would therefore have left PF-4 red from batch 2 to batch 11. Making the record and the two
  artefacts one atomic task is right, and §4 explains it in terms a reviewer can re-derive.
- **§1.2 now states REQ-EDIST-06's split delivery in product terms** — "AC-6.1 fully, AC-6.2 as a
  limited manual observation, the remainder carried by N-1" — instead of leaving a DoD reader to
  infer it from an evidence file. That is exactly what round-1 Q-01 asked for, and F-03 above is
  only asking for the same treatment of AC-4.4.
- **The counted-against-HEAD paragraph in §5 is the right instinct even though F-01 catches two of
  its numbers.** Eighteen new engine test files and five extended is correct — I checked all
  eighteen names against the `__tests__/` listing and none exists at HEAD (`preflight-baseline` is
  distinct from the existing `preflight`, `startup-announce` from `startup`), and all five
  "extended" files do exist. The error is in the per-file floors, not in the census.

## Recommendation

**Needs revision** — one High finding. The round-1 blockers are all closed and the coverage
argument now holds; what remains is a single defect in text this round introduced.

Exactly what to change:

1. **F-01 — restate DoD item 2's two wrong floors, and T57's repetition of one of them.**
   `run.test.js` has 21 tests, not three; `skills-composition.test.js` has twelve top-level tests
   **plus** two generated sweeps over ten members, 32 executed. Both floors as written are
   satisfied by the deletion they exist to catch.
2. **F-02 — reconcile §2.1 with §2's trailing lists in both directions**, and give T18 a trailing
   `(AT-2.2)` so it makes its claim where the plan says claims are made.
3. **F-03 — either automate AC-4.4's change-and-revert on the fixture machine, or declare it in
   §1.2** as a one-time observation with no regression guard, the way §1.2 already declares AC-6.2.
4. **F-04 — narrow §5 point 4's anchor** from `run.test.js:45-79` to `:51-64`.

One erratum is raised against FSPEC below; it is a dangling cross-reference, not a content defect,
and it does not gate Phase I the way §7's three do.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
