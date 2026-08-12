# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/PROPERTIES-pdlc-headless-engine.md` (v1.0)
**Date:** 2026-08-11
**Iteration:** 1
**Scope:** Technical lens — testability of the stated properties against the engine at HEAD, oracle
falsifiability, and the document's traceability into PLAN v1.2's task/test-file table. Product
framing and test-pyramid strategy are the PM and TE lenses and are not reviewed here.

## Verification basis

Every `file:line` anchor the document cites was opened at HEAD on `feat-pdlc-headless-engine`, and
PLAN §-task table rows were read as the authority for task→test-file ownership. What checked out:

- `deriveRoundWindow` is `orchestrate-dev.js:6366`; `:2151` is `reason: "out-of-envelope"` inside the
  envelope check. PROP-PARITY-8 / PROP-SUITE-11 and §16.1's erratum are **correct**.
- `transport.mjs` `:17` `defaultQueryFn`, `:63` `DEFAULT_API_KEY_SOURCE_POLICY = ["none"]`, `:64`
  `DEFAULT_TIMEOUT_MS = 30*60*1000`, `:89` `DEFAULT_PERMISSION_MODE = "bypassPermissions"`, `:98`
  `classifyThrown`, `:123` `TransportError`, `:135` `createTransport`, `:152`, `:159`, `:176`, `:201`.
- `adapter.mjs` `:57`–`:60` (pause cap 3, base 30 s, cap 15 min, jitter 1000), `:75`
  `computeRateLimitWaitMs`, `:116` `createGit`, `:245` `lastApiKeySource`, `:259` `composePrompt`,
  `:271` `_agent`, `:357` `_phase`.
- `run.mjs:58`/`:80`/`:114`/`:155`/`:273` (`runQueueLoop({ maxPasses = 100 })` — PROP-QUEUE-15's and
  PROP-QUEUE-5's `100`-vs-`Infinity` split with `pdlc.mjs:305` is real).
- `report.mjs:50` `transport: "agent-sdk"` literal, `:51`, `:53`, `:70-72`; `startup.mjs:20`
  `EXPECTED_SKILLS` frozen (17 entries); `skills.mjs:312` `composeDispatchPrompt`;
  `handshake.mjs:20`/`:86`/`:183`; `bin/pdlc.mjs` `:88-93`, `:227-228`, `:236-238`, `:243-247`,
  `:305-308`, `:317`.
- `DISPATCHABLE_SKILLS` has **no occurrence** in either workflow module — PROP-SKILL-3's HEAD note is
  accurate.
- `M-ENG-09` is genuinely **absent** from `docs/_constraints/pdlc-engine-baseline.md` (M-ENG-01…08
  only) — PROP-GUARD-20's HEAD column is accurate.
- `pdlc/engine/package.json` `pdlcPluginCompat: "^0.22.0"` against plugin `0.22.0` — PROP-HAND-4's
  green is real.
- `guard-harvest-before-delete.sh` `:14-21` fail-open interpreter loop, `:29-30` unparseable ⇒ exit 0,
  `:35-38` scope predicate — PROP-GUARD-11/19 pin what the script actually does.
- PROP-SKILL-4's `17` / `10` / `12` reconcile exactly: 17 `EXPECTED_SKILLS` entries, 15 skill
  directories (10 dispatchable + 5 operator-invoked), 12 prompt files for the dispatchable subset
  (10 `SKILL.md` + 2 `se-implement` supplements).

The findings below are the places where the check did **not** hold.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Local | §15's per-test-file roll-up does not match PLAN v1.2's task→test-file table. Nine of the 25 named test files exist in **neither** HEAD nor PLAN, and thirteen rows name a red or green task that PLAN assigns to a different file. Detail below | §15 |
| F-02 | High | Local | PROP-AUTH-8…12 — five properties, four of them `Security` — appear in **no** §15 row, no test file and no §16 gap. §15 claims to roll up every property and §14 promises an uncovered property lands in §16; neither holds for these five | §15, §16.2 |
| F-03 | High | Local | §2's E2E budget fails its own set-equality. It names five members; only **four** rows carry `Level: E2E` (PROP-PARITY-1/2, PROP-READ-1/2). The named fifth, PROP-VER-6, is `Level: Unit` and is not the live smoke — it is the per-process trap-scope property. The actual live-credentialed properties (PROP-VER-10/11, PROP-GUARD-23) are typed `Integration`, which contradicts §2's own `E2E` definition ("…or a live credentialed run") | §2, §11, rows 102–103, 120–121, 345, 349–350 |
| F-04 | High | Local | PROP-QUEUE-1 and PROP-QUEUE-2 derive the expected value from the system under test. The engine's queue path *is* a call into the module (`run.mjs:273` → `orchestrate-queue.js`), so "the engine selects exactly the row the module's own triage selects, asserted against the module's selection observed on the same fixture" compares one observation with itself and cannot fail | §8 |
| F-05 | Medium | Local | G-PROP-5's neighbour G-PROP-4 states as HEAD fact that "the `engine-tests` job runs one platform (`pr-tests.yml:40`, `ubuntu-latest`)". There is no `engine-tests` job at HEAD — `pr-tests.yml` declares `unit-tests`, `artifact-freshness`, `fresh-clone-bootstrap`, `script-syntax`, and `:40` is `unit-tests`' matrix. The job is *created* by PLAN T08/T17 | §16.2 |
| F-06 | Medium | Local | PROP-TUNE-4 cites `adapter.mjs:57` as "the retry budget". `:57` is `DEFAULT_MAX_RATE_LIMIT_PAUSES = 3`, the rate-limit **pause** cap — a different tunable from `dispatch.retryAttempts`, which has no constant at HEAD. A test written to this row pins the wrong default and passes | §9 |
| F-07 | Low | Cross-Feature | §16.1's TSPEC erratum is correct and is re-emitted by this review. Worth noting for the operator that the same stale `:2151` anchor is also carried by `CLAUDE.md`'s review-loop section, so fixing TSPEC alone leaves one copy of the wrong number in repo documentation | §16.1 |
| F-08 | Low | Local | §15 writes bare `__tests__/…` paths for engine files while §1 and PLAN both use `pdlc/engine/__tests__/…`, and one §15 row (`pdlc/workflows/__tests__/dispatchableSkills.test.js`) uses the full form. The inconsistent convention is what let F-01's filename drift pass unnoticed | §1, §15 |

### F-01 detail — the §15 rows that do not reconcile with PLAN

PLAN's table is the authority for which task owns which file. Files named in §15 that appear
**nowhere** in PLAN or HEAD: `dispatch.test.js` (PLAN: `skills-composition.test.js`, T24/T38),
`env-cwd.test.js` (PLAN: `transport-boundary.test.js`, T22/T36), `permission.test.js` (no PLAN file),
`model-map.test.js` (PLAN: `corpus-model-map.test.js`, T50/T52), `guard-measurement-gate.test.js`
(PLAN: `m-eng-09.test.js`, T29/T42), `fixtures.test.js` (PLAN: `fixtures-redaction.test.js`,
T09/T18), `suite-mechanics.test.js` (PLAN: `suite-spine.test.js`, T01/T11), `live/guard-measurement.
test.js` (PLAN: `live/smoke.test.js`, T51), and `_assert-suite-wide.mjs` as a T03→T35 step (PLAN:
`assert-suite-wide.test.js`, T03→T19).

Task attributions that contradict PLAN — and, in four cases, contradict the property rows' own
`Task` cells in the same document:

| §15 row | §15 says | PLAN says | Also contradicts |
|---|---|---|---|
| `catalogue.test.js` | T05 → T35 | T05 → **T14** | PROP-MSG-* rows say T06 → T35 |
| `auth.test.js` | T06 → **T44** | T06 → **T15** | PROP-AUTH-1…7 rows say T06 → T15 |
| `startup.test.js` | **T14** → T36 | T14 owns `catalogue.test.js`; startup is T26/T27 → T44 | PROP-START-1…8 rows say T26 → T44 |
| `parity.test.js` | T34 → **T39** | T34 → **T49** | PROP-PARITY-1…9 rows say T34 → T49 |
| `seam-contract.test.js` | T25 → **T35** | T25 → **T39** | PROP-PARITY-12…15 rows say T25 → T39 |
| `tunables.test.js` | T30 → **T44** | T30 → **T47** | PROP-TUNE-* rows say T32 → T40 |
| `hermeticity.test.js` | T02 → **T35** | T02 → **T12** | — |
| `guard-parity.test.js` | T28 → T36, T37 | T28 only; T36/T37 own the transport files | — |

Consequence in the other direction: **T01, T08 and T09 are referenced by no property in the whole
document**, even though T01's behaviour is PROP-SUITE-4's and T09's is PROP-VER-8/9's — they were
attributed to T03 and T05 instead. §15's own stated purpose ("what am I writing in this file, and
what must be true before I can") is not currently answerable from it.

Suggested repair: regenerate §15 mechanically from PLAN's task table rather than by hand — one row
per PLAN test file, PLAN's task ids verbatim — and then reconcile each property row's `Task` cell
against it, so the two views cannot drift again.

### F-04 detail — a falsifiable form for PROP-QUEUE-1/2

The anti-fixture-fixing instinct is right; the fix is to move the expected value out of the SUT
rather than into a hard-coded row name. Two clauses that can fail:

1. Transcribe the expected selection from the **fixture's own declared rules** (BR-QUEUE-1's
   readiness/dependency semantics as stated in FSPEC), not from a run — the fixture author states
   which row is ready and why, and the test asserts that row.
2. Pair it with the negative that carries the actual content: a fixture whose lowest `Order` row is
   dependency-blocked **must** yield the module's row, and a deliberately reordering engine double
   **must** fail the same assertion. Without clause 2 the property proves nothing about the engine
   contributing no ordering opinion, which is the thing AC-1.3 and G-2 care about.

## Questions

| ID | Question |
|----|---------|
| Q-01 | PROP-SKILL-3 states that a "string literal in first argument position" scanner "derives only 5 of the 10 identifiers at HEAD". I could not reproduce the `5` without knowing the exact scanner shape assumed. Is that number an observation you took, and from which scanner definition? If it is illustrative rather than measured, saying so keeps §16.4's third check honest. |
| Q-02 | Several HEAD cells read `green` where only the *mechanism* exists and no test asserts the property (PROP-HAND-6 "green (functions exist); property strategy red", PROP-RETRY-16 "green by construction"). Should those be `partial`, reserving `green` for "a test asserts this today"? As written, a reader counting greens over-counts delivered coverage. |
| Q-03 | PROP-GUARD-8 requires both directions asserted **per transport**, and G-PROP-2 records that the fallback half reads recorded fixtures only. Is there a property that fails when the fallback fixture set goes stale — i.e. is PROP-VER-7's "documented, repeatable refresh step" itself asserted, or only documented? |
| Q-04 | §15 lists no test file for the `pdlc doctor` surface specifically (PROP-START-6, PROP-DISP-7 land in `startup.test.js` / `dispatch.test.js` under names F-01 disputes). Once §15 is regenerated, which PLAN file owns the doctor-report properties — `startup-ladder.test.js` (T26) or `cli.test.js` (T47)? |

## Positive Observations

- **§2's three oracle rules are applied, not merely stated.** The absence-only pairing shows up
  concretely where it is hardest — PROP-GUARD-3/4 pair the deny with an allow *and* with a real
  deletion that removes the file, PROP-VER-4 makes the socket trap fire deliberately, PROP-VER-8
  carries a positive control in the same test, PROP-SUITE-6 fails on its own empty input. This is the
  discipline that stops a suite going vacuously green on an engine that does nothing.
- **Falsifiers for the instruments themselves (§11) are the strongest part of the document.**
  PROP-SUITE-2's reasoning about sibling processes and first-use minting, and PROP-SUITE-9's
  collected-file count, are the kind of thing normally discovered in week three of implementation.
- **HEAD is described honestly rather than aspirationally.** `red` / `partial` columns cite real
  anchors and name what is missing (`report.mjs:51`'s scalar `apiKeySource`, `report.mjs:50`'s
  hard-coded `"agent-sdk"`, `run.mjs:273`'s `100` default against `pdlc.mjs:305`'s `Infinity`). Every
  one I opened was where the document said it was.
- **The `deriveRoundWindow` erratum was caught and routed rather than silently patched** — §16.1 is
  correct on both the stale anchor and the fact that the claim it supports is unaffected.
- **§16.2's gaps are stated as gaps.** G-PROP-1 refusing to claim that hermetic tests prove the SDK
  feeds a `PreToolUse` deny back under `bypassPermissions`, and G-PROP-6 recording the clock posture
  so a later author does not "improve" it, are both better than the usual silence.
- **PROP-DISP-3 / S-4's counter-property** — noticing that `DEFAULT_TIMEOUT_MS` equals the tunable's
  own default, so an assertion taken at the default is self-consistent and false, and pinning
  `dispatch.timeoutMinutes: 7` ⇒ `420000` because of it — is exactly the reasoning this feature needs.

## Recommendation

**Needs revision**

The property content is strong and the oracle discipline is real. What blocks approval is that the
document's *hand-off surface* — the table an implementer opens to know which file to write and which
task turns it green — does not agree with PLAN, and one branch of properties (PROP-AUTH-8…12) falls
off that surface entirely. Four concrete changes clear it:

1. Regenerate §15 from PLAN v1.2's task table: PLAN's filenames, PLAN's red/green task ids, full
   `pdlc/engine/__tests__/…` paths. Then reconcile every property row's own `Task` cell against it
   and confirm T01, T08 and T09 are each traced or explicitly recorded as not property-bearing (F-01,
   F-08).
2. Add §15 rows for PROP-AUTH-8…12 — per PLAN these belong with the transport boundary (T22 → T36)
   and the report (T32 → T40) — or carry them in §16.2 as an explicit gap (F-02).
3. Fix §2's E2E budget: state the four `E2E` rows that exist, and decide whether the live-credentialed
   properties (PROP-VER-10/11, PROP-GUARD-23) are `E2E` under §2's own level definition or whether
   that definition should drop its "or a live credentialed run" clause (F-03).
4. Rewrite PROP-QUEUE-1 and PROP-QUEUE-2 so the expected selection is transcribed from the fixture's
   declared rules and paired with a reordering-double falsifier (F-04).

F-05 and F-06 are one-line corrections and can ride the same revision.

## Verdict

VERDICT: Needs revision
{"high": 4, "medium": 2, "low": 2}
