# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/PROPERTIES-pdlc-engine-distribution.md` (v0.2)
**Date:** 2026-08-14
**Iteration:** 1
**Scope:** Technical lens — testability against the actual architecture, oracle strength, carrier
existence, and fidelity of every existing-code claim to HEAD.

## Verification performed

Claims were checked against the repository, not against the upstream documents alone.

| Claim under review | Method | Result |
|---|---|---|
| §7 "88 properties", column sums to 94, six two-level | Parsed the `Level` column of every §2 row | **Holds exactly.** Unit 73 / Integration 9 / Machine 12 = 94; the six multi-level rows are precisely the six named |
| §4 "all 35 `AT-` ids appear exactly once" | Extracted col 1; diffed against FSPEC's `AT-` set | **Holds.** 35 ids, each once, set-equal to FSPEC §8 |
| §4 "`Carried by` is copied from PLAN §2.1" | Machine-diffed both tables per id | **Zero mismatches across all 35 rows.** The transpose claim is literally true, not approximately |
| §5 "two of PLAN's 59 tasks are named by no property (T01, T04)" | Diffed §2/§4 task citations against PLAN §2's 59 ids | **Holds.** T01 appears only in the accounting prose; T04 only there and in §8's fixture attribution — neither in a carrier column |
| Preservation floors (§1) | Ran `node --test` on each of the five files | **All five exact at HEAD:** `engine-config` 9, `run` 21, `skills-composition` 32, `ci-arrangement` 6, `seam-contract` 12 |
| `skills-composition` "≥ 32 from ≥ 14 `test(` sites" | Enumerated real call sites | **Holds** — 14 sites (12 plain + 2 sweeps), 32 executed. See F-03 |
| PROP-PROV-9 "five commit sites, each in a named function" | Grepped both workflow modules | **Exactly five**, in `commitPaths`, `appendApprovalAnchors`, `commitQueueRow`, `commitAdvisoryRecord`, `buildA5SeamOps` (`orchestrate-dev.js:2838,6736,10429`; `orchestrate-queue.js:1603,1645`) |
| PROP-PROV-15 anchors `build-runtime.mjs:274` / `:307` | Read both lines | **Correct** — both are `__queue.rewriteStatus(...)` emission sites |
| PROP-PACK-7 anchor `run.test.js:67-79` | Read the test | **Correct, and the hazard is real** — the `Object.entries(WORKFLOW_MODULE_URLS)` loop at `:74-77` has its assertions inside the body with no non-zero member count before it |
| PROP-PACK-4 "replaces HEAD's directory walk" | Read `run.test.js:53-64` | **Correct** — HEAD is `walk(engineRoot)` + `assert.deepEqual(offenders, [])`, an absence-only oracle over a walk |
| Q-1 "`lib/catalogue.mjs` carries no `node.*` id at HEAD" | Grepped the module | **Confirmed** — none of the twelve ids exists yet; HEAD ids are `auth.*` and `guard.*` |
| §2.8 `skipSink` precedent (fail-closed, `KNOWN_CAPABILITY_KEYS`) | Read `skipSink.js` | **Confirmed** — `:55` is exactly `["bash","git","hash","uid-nonroot"]`; non-empty `unverifiedInvariants` enforced; teardown throws |
| §1 seam mirrors are hand-maintained frozen literals | Read `seam-contract.test.js` | **Confirmed** — `TSPEC_3_1_DEV_SEAMS` `:47`, `QUEUE_SEAMS` `:57`, `deepEqual` at `:67`/`:72`; `UNOVERRIDDEN_IO_SEAMS` `:223` |
| PROP-PACK-11 "`license` … in place of `UNLICENSED` (HEAD value)" | Read `pdlc/engine/package.json` | **Confirmed** `"license": "UNLICENSED"`. `engines`/`files`/`prepack`/`postinstall` are absent at HEAD, consistent with being new work |
| All `DEC-EDIST-*` and `DEC-DOC-01` citations | Diffed against DECISIONS files | **All resolve.** No nonexistent-authority citation — the defect this repo has shipped three times |
| Every test file named in §2 | Checked HEAD + PLAN | **28 files: 5 exist (the extended ones), 23 are named in PLAN.** No invented carrier |
| Both blocking open questions | Read PLAN §7 | **Confirmed recorded** as open errata with "Phase I must not begin while they are open" |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **PROP-CAT-2 asserts an expected value the document elsewhere says is undecided, and is not marked conditional.** PROP-CAT-4 is explicitly conditional on the open TSPEC §10.3 / §9.3 erratum and states both resolutions. PROP-CAT-2 sits two rows above it and asserts the feature's added ids are **"exactly"** a twelve-member list **including `node.below-floor`**, "each with a named emitter task" — but Q-1 and PLAN §7 say `node.below-floor` may have **no possible emitter**, and under the resolution where the guard emits a literal string and the catalogue does not register the id, the registered set is **eleven**, not twelve. So PROP-CAT-2's set-equality and its "each with a named emitter task" clause are both already known-possibly-false, with no marking. §5's `REQ-EDIST-05` row compounds this by listing `PROP-CAT-1…3` as "Complete" with no conditionality note. **Fix:** give PROP-CAT-2 the same conditional treatment PROP-CAT-4 already has — state 11-or-12 with the branch condition — and footnote the §5 row. This is a marking gap, not a missing halt: PLAN §7 does block Phase I, which is why it is not High. | §2.7 PROP-CAT-2, §5, §9 Q-1 |
| F-02 | Medium | Local | **§7's Unit-row discriminator does not discriminate.** The Unit row defines its 73 members as "Everything reachable from `cd pdlc/engine && npm test` and `cd pdlc/workflows && npm test`". But the nine Integration properties are reachable from *exactly those same two commands* — PROP-PUB-1…5 live in `pdlc/engine/__tests__/publish-channel.test.js`, PROP-LAUNCH-5 in `version-doctor.test.js`, and PROP-REGR-3 is partly Unit. Only the Machine legs are outside them, and reading rule 5 already gives the correct discriminator (Machine = the fixture-machine workflow or `[manual]`). As written the definition, read literally, would place all 82 non-Machine properties in the Unit row and contradict the very column it labels. **Fix:** restate the Unit row by scope-of-assertion (a single module/function over injected seams) rather than by reachability, and let reading rule 5 keep owning the Machine boundary. Cheap, and it removes a sentence a DoD reader could act on wrongly. | §7 |
| F-03 | Low | Process | **PROP-REGR-1's `skills-composition.test.js` floor is correct but not mechanically reproducible as stated.** "≥ 32 from ≥ 14 `test(` call sites" is true — I confirmed 14 real sites and 32 executed. But a naive `grep -c 'test('` on that file at HEAD returns **20**, because the file contains a `test()` mention in a comment and several `/…/.test(x)` regex-predicate calls. A DoD verifier or implementer checking the floor the obvious way gets a number that matches neither 14 nor 32 and cannot tell whether the floor drifted. Every other floor in that row is a plain executed count and has no such ambiguity. **Fix:** state the counting method inline — "top-level `test(` call sites, excluding `.test(` regex predicates and comments" — or drop the site count and pin only the executed 32, since the "twelve plain + two ten-member sweeps" prose already carries the anti-deletion argument the site count was added to make. | §2.9 PROP-REGR-1 |
| F-04 | Low | Local | **PROP-PACK-7's positional anchor lacks the "at HEAD" qualifier its sibling carries, and its own carrier task edits the anchored lines.** PROP-PROV-15 says its `build-runtime.mjs:274`/`:307` anchors are "read at HEAD"; PROP-PACK-7's `run.test.js:67-79` anchor has no such qualifier. Both anchors are correct today (verified), but T41 and T44/T55 respectively **edit those very files**, so both line numbers are guaranteed stale by the time the properties are satisfied. PROP-PROV-15's phrasing survives that; PROP-PACK-7's reads as a durable location. **Fix:** add "at HEAD" to PROP-PACK-7's parenthetical, matching PROP-PROV-15. Reading rule 2's permission for positional anchors is sound — this is only about making both uses say the same thing. | §2.3 PROP-PACK-7 |

None of these is High. No finding contradicts a standing constraint in `docs/_constraints/` or a promoted decision, and I found no unverified existing-code claim anywhere in the document.

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-GATE-4 asserts all three probes exit 0 on `ubuntu-latest`, making the recorded skip set empty. `docker` and `npm-pack` are safe there, but is the `real-spawn` probe probing a *capability* or merely that `spawnSync` exists? If the latter it can never be absent, and PROP-GATE-1's fail-closed ladder has one arm that is unreachable by construction — harmless, but worth saying so the empty-skip-set assertion is not read as evidence the ladder was exercised. |
| Q-02 | On the document's own Q-4: I confirmed `KNOWN_CAPABILITY_KEYS` at HEAD is exactly `["bash","git","hash","uid-nonroot"]` (`skipSink.js:55`) and that it is a *workflows-suite* helper, while `scripts/fixture-machine.mjs` is engine-side. Given the two suites are separate npm packages with separate runners, shipping a second closed key set looks correct rather than a missed reuse — sharing it would create an engine→workflows test-helper dependency that no other engine test has. Endorsing the separation unless se-author sees a reason otherwise; this needs no change. |
| Q-03 | PROP-REGR-6 puts `scripts/publish-preflight.mjs` under the 85 % per-module branch floor, and its only carrier (PROP-PUB-5) is Integration-level. I confirmed the assertions land in `pdlc/engine/__tests__/publish-channel.test.js`, which the coverage run does execute, so the floor looks attainable — but PROP-REGR-6 spells out that reasoning for `fixture-machine.mjs` and not for this module. Worth one clause, on the same pattern, so a below-floor reading there is diagnosed as fast? |

## Positive Observations

- **The §4 → PLAN §2.1 transpose is exact.** I diffed all 35 rows mechanically and got zero mismatches. A document that claims "this column is copied from upstream" and is *actually* byte-faithful is rare; PLAN §2.1's `iff` rule is genuinely holding rather than being asserted.
- **Every existing-code claim I checked is true, including the awkward ones.** Five commit sites in five named functions, two `rewriteStatus` emission sites at the exact lines cited, `KNOWN_CAPABILITY_KEYS` verbatim, `UNLICENSED` at HEAD, no `node.*` id in the catalogue, and all five preservation floors matching the runner's own output exactly. The line-cited anchors are used only where position *is* the claim, per the document's own reading rule 2.
- **The falsifiability audit in §6 is the strongest part of the document and is not decorative.** Each row names a failure mode, the properties exposed to it, and the structural defence — and I could verify the defences are real (PROP-PACK-7's hazard genuinely exists at `run.test.js:74-77`; PROP-PACK-4's replacement genuinely strengthens an absence-over-a-walk oracle into a tracked-ness assertion that a `.gitignore`'d fork cannot hide behind).
- **Negative properties are paired, without exception.** All 17 §3 rows carry a positive conjunct, and the pairings are the right ones — call-count oracles where the envelope is identical (`_appendFile === 0`, probe `=== 0`, capture `=== 0`), non-empty pre-state fixtures under every byte-identity claim, and set-equality rather than "the new entry is absent" for the partial-install case.
- **Expected-set ownership is stated and consistent with the upstream erratum.** Reading rule 3's split — member names owned by TSPEC §5.4's `PK-*` table, classes and per-class counts by FSPEC §5.2 — matches REQ v0.11's AC-1.3 decision and TSPEC v0.12's derived 23/24, so no verifier is asked to read a literal member list out of the wrong document. PROP-PACK-2's refusal to assert against the tarball's own length is exactly right.
- **The declared gaps are honest and scheduled rather than hand-waved.** Gap 1 names the defect a `[manual]` observation cannot catch, names the narrow reason it is not automated (no leg installs an older plugin over a newer one), and states the condition under which it should close. That is a gap statement a future reader can act on.
- **The T01/T04 accounting is the kind of thing usually skipped.** Stating which PLAN tasks *no* property names, and why each is infrastructure, turns a silent coverage hole into a checkable claim — and it is correct.
- **Fixture and generator hygiene (§8) is specified where it belongs.** Bounded generators, explicit printed seed, pinned counter-examples, and a non-zero per-member assertion rule that ties directly back to PROP-PACK-7's hazard.

## Recommendation

**Approved with minor changes**

All four findings are Medium or Low and none blocks Phase I on its own. F-01 is the one to fix
before implementation begins, and it costs one sentence: PROP-CAT-2 must inherit the conditional
marking PROP-CAT-4 already carries, so no implementer transcribes a twelve-id expected set that the
open TSPEC §10.3 erratum may resolve to eleven. F-02 and F-03 are precision fixes to prose a DoD
reader could act on wrongly; F-04 is a one-phrase consistency fix.

Phase I remains blocked on the two open upstream errata (Q-1, Q-2) already recorded in PLAN §7 —
that is correct and this review does not change it. This document does not create a third.

I am raising no `ERRATUM` against an upstream document: the root cause behind F-01 is TSPEC §10.3,
which is **already** an open erratum recorded in PLAN §7 and correctly routed by this document's own
Q-1. Re-raising it would spend a confirmation round to restate a blocker that is already blocking.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

