# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.14)
**Date:** 2026-08-16
**Iteration:** 14
**Scope:** Delta only — `c1d7f0e7..HEAD` on the TSPEC (64 insertions, 23 deletions across
four commits: §8.5, §8.1/§8.2/§14 K-1, §6.5/§3.1/§10.1 S-7, §5.1 + changelog v0.14).
Rounds 1–12 not re-litigated; §5.4 untouched this round and stays deferred.

## Delta verified against HEAD

| # | Claim in the delta | Landed? | Evidence at HEAD |
|---|---|---|---|
| 1 | §8.5: `publish.yml`'s gate equals **every** PR-gate job's commands, expected side **derived from `PR_GATE_FILES`** | **Yes** | `pdlc/engine/__tests__/ci-arrangement.test.js:685-688` — `for (const [file, jobIds] of Object.entries(PR_GATE_FILES))` builds `expectedCommands`; `PR_GATE_FILES` (`:64-67`) maps `pr-tests.yml → GATE_JOB_IDS` (five) and `fixture-machine.yml → FIXTURE_MACHINE_JOB_IDS` (`:55`, one). Test name at `:666` matches the TSPEC's cited `T49` title verbatim |
| 2 | §8.5: the equality's failure message names the whole set | **Yes** | `ci-arrangement.test.js:697-700` — "must run the same commands as EVERY PR-gate job — pr-tests.yml's five and fixture-machine.yml's" |
| 3 | §8.5 / changelog: `publish.yml`'s `gate` carries the fixture-machine legs | **Yes** | `.github/workflows/publish.yml:174` `Fixture-machine legs`, `:170` `Launcher real-spawn legs`, inside `:33` `name: Gate (PR checks re-run at the tag)` |
| 4 | §8.1 `gate` row, §8.2 opening, §8.2 third reason, §14 K-1 all restated over the trigger-derived set | **Yes** | Re-grepped every `five`/`six` occurrence in §8 and §14: the surviving "five" instances are all scoped to `pr-tests.yml`'s own five bodies/`name:` keys (true at HEAD — five job blocks) and the totals read six |
| 5 | §8.1's dangling "V-18's five rendered check names" now reads six and adds `fixture-machine.yml` | **Yes** | TSPEC `:1236-1238`; matches V-18's six-job enumeration and the six job `name:` keys across the two PR-triggered files |
| 6 | §6.5 / §3.1 / §10.1 S-7: `cmdDoctor` flattens `result.notices` on its own path, not through `formatStartup` | **Yes** | `pdlc/engine/bin/cli.mjs:457-458` — prints `result.banner` itself, then `typeof notice === "string" ? notice : notice.text`; `formatStartup` is not called in `cmdDoctor` (`:451-479`) |
| 7 | §6.5: `formatStartup` has five call sites in `bin/cli.mjs` | **Yes (count)** | `bin/cli.mjs:491, 655, 669, 689, 704` — exactly five, excluding the `:38` import. See F-55 on the surface→site mapping |
| 8 | Changelog: "no §12.1 oracle keyed on the singleness, so no test text changes" | **Yes** | No `formatStartup` or render-site token appears in §12.1; the only other occurrence (`:1592`) is the banner-spread note, untouched |
| 9 | Changelog: "no upstream moved this round (REQ v0.12, FSPEC v0.8 unchanged at HEAD)" | **Yes** | `REQ-…md:18` `0.12`, `FSPEC-…md:16` `0.8`; neither file has a commit after `c1d7f0e7` |

**F-51 (v13's blocking High) is resolved and resolved at the right altitude** — the fix states
the rule (derived from `PR_GATE_FILES`) rather than swapping five for six, so a seventh
PR-gating workflow does not re-open the sentence. **Q-28 is answered explicitly ("derived",
two-file edit, T49 red until the second lands)**, which is the answer HEAD actually implements.
**F-52 is resolved by scoping rather than by withdrawal**, which is the better of the two
available fixes: it removes the invitation to author "only `formatStartup` reads `notice.text`"
as an oracle without pretending `cmdDoctor` does not exist. No previously approved oracle was
weakened: PF-4, AT-3.8a/b, §12.1's four-row resolver oracle and §5.4's `PK-*` rows are
byte-identical.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-54 | Medium | Local | **F-53's new owner is a task that is already complete at HEAD, so the obligation cannot fire.** §5.1's new paragraph assigns the owed FSPEC §5.1/BR-7.7 transcription to "the PLAN task that builds §8.5's arrangement oracle (the task that edits `ci-arrangement.test.js`)", with a fallback of "if Phase T re-opens this TSPEC … before Phase P". At HEAD both candidate tasks are done: PLAN `:190` T17 and `:220` T49 carry `✅`, `ci-arrangement.test.js` ships T49 (`:666`) and the six-job derivation (`:64-67`), and Phase P is behind, not ahead — PLAN is at v0.15 with Phase I complete. So both the named owner and the fallback point at rounds that have passed. This is strictly better than v0.13 (the gap is at least named) and turns nothing red — no oracle depends on the transcription — but as written the tracking is decorative. A live owner (a Phase DOD check, or an explicit "carried into the next TSPEC revision, whenever that is") would make it real. Recorded, not gating: the underlying gap was already deferred, and the round's blocking defect it was written about (F-51) is independently fixed | §5.1 `:229-241`; PLAN `:190`, `:220` |
| F-55 | Low | Local | **"Five surfaces" and "five call sites" are used interchangeably, and they do not enumerate the same way.** §6.5 `:714-717` says "`dev`, `queue`, `queue --loop`, both `--dry-run` surfaces and the refusal path are the **five `formatStartup` call sites** in `bin/cli.mjs`". The count is right — five sites at `bin/cli.mjs:491, 655, 669, 689, 704` — but the mapping is not one-to-one: both `--dry-run` surfaces share **one** site (`emitDryRun`, `:491`), `queue` and `queue --loop` share **one** (`:704`), and the refusal path is **two** (`:655` `cmdDev`, `:689` `cmdQueue`, both `console.error` with `{withChecks: true}`). An implementer transcribing the enumeration rather than the number looks for six sites and finds five. Since the arithmetic coincides no oracle goes red; one clause ("six operator surfaces reached through five call sites, the two dry-runs sharing `emitDryRun` and the refusal appearing in both commands") closes it | §6.5 `:714-717`; §3.1 `:105`; §10.1 S-7 `:1748` |

## Questions

| ID | Question |
|----|---------|
| Q-29 | For F-54: is the transcription still wanted at all, now that §3.2's V-18/V-19 and §8.5 carry the two facts that had a live consumer? If it is bookkeeping only, saying so ("no remaining consumer; closed") is a cleaner end state than an owner that cannot fire — and it is the answer the round's evidence supports, since F-51's real cost was in §8.5, which is now correct. |

## Positive Observations

- The F-51 fix is stated as a **rule with a derivation**, not as a corrected count, and the
  §8.5 bullet names the exact constants (`PR_GATE_FILES` / `GATE_JOB_IDS` /
  `FIXTURE_MACHINE_JOB_IDS`) plus the test title. I could check every clause against
  `ci-arrangement.test.js` without inferring anything — that is what a spec claim about a
  shipped oracle should read like.
- Answering Q-28 in the document with its **consequence** ("a two-file edit; T49 goes red until
  the second lands") rather than with the word "derived" alone is what makes the answer
  testable. The consequence is the falsifier.
- The F-52 scoping keeps the `doctor` divergence visible *and* explains why it is out of scope
  (AC-5.6 is about the running pipeline), then declines to schedule a change no criterion
  requires. Naming an unscheduled cheap fix without smuggling it into the spec is the right
  call in a frozen round.
- Holding the two `notices` channels apart survived the edit intact — `{id, text}` through
  `formatStartup` versus `readEngineConfig`'s `string[]` through `tunablesFor` — including in
  §3.1 and S-7, so the three statements still agree after being touched in three places.

DEFERRED: F-49 (v12, Medium) — §5.4's stale `TSPEC:386-389` line window; §5.4 frozen this round, replace with a `PK-*` table anchor whenever §5.4 is next edited.
DEFERRED: F-50 (v12, Low) — §5.4's derived size reads term-by-term against FSPEC §5.2's per-class sum.
DEFERRED: F-54's live owner for the owed FSPEC §5.1/BR-7.7 transcription (see Q-29).

## Recommendation

**Approved with minor changes**

My v13 blocking finding (F-51) is resolved against HEAD, at the altitude that keeps it resolved,
and Q-28 is answered the way the shipped test behaves. F-52 is resolved by scoping, with the
`cmdDoctor` divergence named so a later oracle author cannot go red against correct code. The
two findings above are a dead tracking hook and an enumeration imprecision: neither changes an
expected value, neither can turn a test red or green, and neither is a defect this revision
introduced into the testable content of the spec.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
