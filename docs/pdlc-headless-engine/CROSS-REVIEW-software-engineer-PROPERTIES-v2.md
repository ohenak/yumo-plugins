# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-headless-engine/PROPERTIES-pdlc-headless-engine.md` (v1.1)
**Date:** 2026-08-11
**Iteration:** 2
**Scope:** Delta re-review. Round 1's four High and two Medium findings, verified resolved or not
against HEAD on `feat-pdlc-headless-engine` and against PLAN v1.2; then the changed sections only
(§2's budget clause, §4's PROP-SKILL-11/15, §8's PROP-QUEUE-1/2 and the new PROP-CLI group, §9's
PROP-TUNE-4, §12's NEG-26…28, §14, §15 in full, §16.2's G-PROP-2/4/7, §16.4). Unchanged sections
already reviewed in v1 were not re-litigated.

## Verification performed

Delta computed as `git diff 8642f64e HEAD` on the document (114 insertions, 46 deletions across
eight commits, `6536c939`…`82835ef1`). Every claim below was checked at HEAD, not read from the
document.

- **§15 against PLAN v1.2's §9 task table, row by row.** All 33 file rows now name a file PLAN
  creates, with PLAN's own task ids: T03 → T19/T52 (`assert-suite-wide.test.js`), T05 → T14, T06 →
  T15, T08 → T17, T09 → T18, T20 → T35, T25 → **T39** (was T35), T30 → **T47** (was T44), T34 →
  **T49** (was T39), T50 → T52, T47 red-and-green in one task for `cli.test.js`. T01, T08 and T09
  now each own a row. Every path is full (`pdlc/engine/__tests__/…`), the one workflows-side file
  excepted.
- **E2E set-equality.** `grep '| E2E |'` over §§3–12 returns exactly five rows — PROP-PARITY-1/2,
  PROP-READ-1/2, PROP-VER-11 — which is precisely the set §2 names. PROP-VER-6 is back to `Unit`.
- **`pr-tests.yml` at HEAD** declares `unit-tests`, `artifact-freshness`, `fresh-clone-bootstrap`,
  `script-syntax` and no `engine-tests`; `:40` is `os: [ubuntu-latest]` under `unit-tests`. G-PROP-4's
  corrected text matches, and matches PLAN T08/T17.
- **`bin/pdlc.mjs`**: `:332` `case "hello"`, `:335` `case "spike:sdk"`, the pair in `USAGE` at `:41`
  — PROP-CLI-3's three anchors are right, and agree with BR-CMD-1's own citation.
- **`FSPEC:635`** is EC-SKILL-5's row (the permitted `pdlc:`-in-prose case) — PROP-SKILL-15's
  boundary fixture cites the right line. **`FSPEC:194-199`** is BR-CMD-1, whose `:198` states
  `spike:sdk` "is not a non-billing surface" — PROP-CLI-3's exemption bound is grounded.
- **`adapter.mjs:57`** is `DEFAULT_MAX_RATE_LIMIT_PAUSES = 3`; `:58`/`:59`/`:60` are the backoff
  base, cap and jitter; `transport.mjs:64` is `DEFAULT_TIMEOUT_MS`. PROP-TUNE-4's re-sourcing is
  correct, including that no `retryAttempts` constant exists until T45.
- **Property coverage of §15**, checked by walking §§3–12's ids: no id is unplaced. PROP-AUTH-8…11
  land in `transport-boundary.test.js` and PROP-AUTH-12 in `adapter-descriptor.test.js`.

## Prior findings

| Prior | Status | Evidence |
|---|---|---|
| F-01 High (§15 ⊥ PLAN) | **Resolved** | §15 regenerated from PLAN v1.2; all nine bogus filenames gone, T01/T08/T09 traced, task ids corrected in four rows I had not even flagged |
| F-02 High (PROP-AUTH-8…12 in no file) | **Resolved** | Placed in T22 and T20's rows, bolded so the fix is auditable |
| F-03 High (E2E budget fails its own set-equality) | **Resolved** | Five `E2E` rows = the five named ids; PROP-VER-11 retyped, PROP-VER-6 corrected, and the two live-credentialed `Integration` rows now say *why* they sit outside the budget |
| F-04 High (PROP-QUEUE-1/2 unfalsifiable) | **Resolved** | Expected row is transcribed from BR-QUEUE-1's stated rules into the fixture beside its reason; PROP-QUEUE-2 pairs it with the reordering-double falsifier on the same fixture |
| F-05 Medium (`engine-tests` job does not exist) | **Resolved** | G-PROP-4 rewritten, naming T08/T17 and the `410f3a07` matrix decision |
| F-06 Medium (PROP-TUNE-4's `:57`) | **Resolved** | Each default sourced individually; the `3`-vs-`3` coincidence called out and the test routed to T45's constant |
| F-07 Low (stale `:2151` in `CLAUDE.md`) | Open, operator-facing | Unchanged and correctly still not routed as a pipeline erratum |
| F-08 Low (bare `__tests__/…` paths) | **Resolved** | Full paths throughout, stated as a rule in §15's preamble |

Nothing in the revision broke a section that was sound in v1: the oracle discipline, the NEG table's
pairing rule and the HEAD anchors I spot-checked in round 1 all survive, and the three new NEG rows
(26–28) each carry a positive counterpart in the same file, as §12's own rule requires.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-09 | Medium | Local | PROP-CLI-1 and PROP-CLI-2 trace **AC-1.4**, which is the halt-recording and exit-code criterion (`REQ:391-394`) and says nothing about the command set or flag spelling. No REQ criterion covers invocation grammar — it is an FSPEC-level concern (BR-CLI-1, `FSPEC:230`; AT-ENG-01/02, `:287-288`). §14's AC-1.4 row now reports two properties that do not test it | §8, §14 |
| F-10 | Medium | Local | §15's closing note says "**the seven** PLAN files absent from this table" and then lists `handshake.test.js` and `run.test.js` among them — both of which have their own §15 rows twelve lines above. Five files are genuinely absent (`adapter`, `transport`, `skills`, `report`, `startup`). An implementer reading the note concludes `handshake.test.js` owns no property when it owns PROP-HAND-4 and PROP-HAND-6 | §15 |
| F-11 | Low | Local | §15's preamble states the invariant as "every property id in §§3–12 appears in **exactly one** row's `Properties` cell", but split properties deliberately appear in two: PROP-PARITY-15 (seam-contract + smoke), PROP-GUARD-8 (guard-parity + transport-cli), PROP-REP-10 (report-engine + transport-cli), and the suite-wide halves of PROP-FAIL-2, PROP-MSG-3, PROP-MODEL-2, PROP-SKILL-3, PROP-DISP-4, PROP-VER-5. The mechanical check §16.4 item 4 asks a future reader to run therefore fails on a correct table. "At least one row, and a split property names the half in each" is the invariant actually held | §15, §16.4 |
| F-12 | Low | Local | G-PROP-7 is inserted between G-PROP-5 and G-PROP-6, so §16.2 reads 1,2,3,4,5,7,6. Cosmetic, but §16.2 is a table an operator scans for a numbered gap | §16.2 |

### F-09 detail — what the trace should read

The property content is right and the oracles are right; only the `Traces` cell is wrong. AC-1.4's
text is *"a pipeline that halts… the CLI's exit code distinguishes a halt from a crash of the engine
itself"* — already carried by PROP-EXIT-1…10 and PROP-RETRY-14, which is what §14's row is for.
PROP-CLI-1/2 should trace `BR-CLI-1, EC-CLI-1, AT-ENG-01` and `BR-CLI-1, AT-ENG-02` respectively,
with no AC, and §14's AC-1.4 row should revert to `PROP-EXIT-1…10, PROP-RETRY-14`.

That leaves PROP-CLI-1/2 as properties with no REQ criterion above them, which is the honest state
and worth one line in §16.2 rather than a borrowed trace: the invocation grammar is specified at
FSPEC level only, so a criterion-only matrix cannot see it — the same argument §14 already makes for
the six constraints it lists separately. PROP-CLI-3 and PROP-CLI-4 do not have this problem
(`C-1a`/`AC-2.2` and `NG-1` are genuinely theirs).

## Questions

| ID | Question |
|----|---------|
| Q-05 | §15 gives `smoke.test.js` PROP-PARITY-15's *positive half* and `seam-contract.test.js` the row itself. PLAN T25 says the seam-contract test "reuses" `smoke.test.js` rather than building a second harness. Is the intent that `seam-contract.test.js` imports the smoke driver, or that the two files assert the two halves independently? The answer changes whether T48's corpus work can move the file underneath T25. |
| Q-06 | Round 1's Q-02 was answered by pinning the `green`/`partial` vocabulary, and PROP-HAND-6 and PROP-RETRY-16 were correctly demoted. Was the whole `State at HEAD` column re-swept under the new definition, or only the two rows the question named? |

## Positive Observations

- **The §15 regeneration went past what F-01 named.** I listed nine wrong filenames; the rewrite
  also corrected four green-task ids I had not caught (T25 → T39, T30 → T47, T34 → T49, T05 → T14),
  which is what regenerating from the source rather than patching the symptom buys.
- **The corrections are recorded as corrections.** G-PROP-4 says the earlier draft cited a job "as
  if it already existed"; §2 says PROP-VER-6 was named "by mistake"; §14's AC-3.1 row says it read
  `yes` over properties covering only the positive half. A future reader can tell what was wrong,
  not just what is now right — this is the opposite of the usual silent overwrite.
- **PROP-TUNE-4 handles the `3`-vs-`3` trap explicitly.** Naming that a test written today against
  `adapter.mjs:57` would pin the wrong default *and pass* is exactly the failure mode a defaults
  test exists to prevent, and routing it to T45's constant closes it in advance.
- **PROP-SKILL-15 asserts provenance, not absence.** Expressing AC-3.1's negative clause as a
  segment-level equality (prompt-file set + module text, no engine-authored segment between) makes
  it fail against a smuggled instruction whatever words it uses, and pairing it with EC-SKILL-5's
  permitted case pins the boundary in the same fixture. The scratch prepend-one-line falsifier
  proves the oracle can fire.
- **G-PROP-7 answers a gap question by decision rather than by silence,** and PROP-SKILL-11's third
  trigger (plugin tree removed in flight, EC-RUN-1) is a genuinely different failure from the empty
  and deleted cases rather than a restatement.

## Recommendation

**Approved with minor changes**

Every round-1 blocking finding is resolved, verified against HEAD and PLAN v1.2 rather than against
the document's own claim to have resolved them. The hand-off surface — the reason I blocked in round
1 — now reconciles with PLAN in both directions, and no property falls off it.

The two Mediums are corrections that ride the next edit and gate nothing: fix PROP-CLI-1/2's REQ
trace and §14's AC-1.4 row (F-09), and correct §15's closing note from seven files to five (F-10).
F-11 and F-12 are one-line edits in the same pass. None of the four requires a review round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}

APPROVAL-HASH: sha256:8125ee9a9e75c346570112d5d5ba114482e598e43057a79a032f263904369a6a
REVIEWED-COMMIT: 82835ef1ca96a5aac6a267b11a6b7bc6df948a15
