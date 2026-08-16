# Cross-Review: test-engineer — TSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md` (v0.13)
**Date:** 2026-08-16
**Iteration:** 13
**Scope:** Delta only — `965a7220..HEAD` on the TSPEC (64 insertions, 32 deletions across the
lineage header, changelog, §3.1, §3.2 V-18/V-19, §5.2 version row, §6.5, §8.5, §10.1 S-7,
§12.1), plus the DEC-ERR-01 re-grounding those edits carry. Rounds 1–11 are not re-litigated.

## Delta verified against HEAD

| # | Claim in the delta | Landed? | Evidence at HEAD |
|---|---|---|---|
| 1 | V-18: three workflow files, two PR-triggered, one tag-triggered; six in-scope jobs | **Yes** | `.github/workflows/` holds `pr-tests.yml`, `fixture-machine.yml`, `publish.yml`; `on: pull_request` on the first two, `on: push: tags: ['engine-v*']` on `publish.yml`; job `name:` keys `Unit tests …`, `Engine tests …`, `Generated artifacts are in sync`, `Fresh-clone bootstrap works`, `Shell scripts parse`, `Fixture machine (install/upgrade, launcher, container, two-repo)` — set-equal to FSPEC v0.8 §5.1's six authored rows |
| 2 | V-18: matrix axes are per job (`os`+`node`, `os`, none×4) | **Yes** | `pr-tests.yml` `unit-tests` name renders `${{ matrix.os }}`/`${{ matrix.node }}`, `engine-tests` `${{ matrix.os }}` only; the other four names carry no expression |
| 3 | V-19: `GATE_JOB_IDS` / `FIXTURE_MACHINE_JOB_IDS` / `PR_GATE_FILES` and a `§5.1's file scope` test re-deriving the key set from the files' own `on:` triggers | **Yes** | `pdlc/engine/__tests__/ci-arrangement.test.js`, those three constants, and `test("ci … §5.1's … PR-triggered (BR-7.1)")` asserting `Object.keys(PR_GATE_FILES)` against the trigger-derived set |
| 4 | §6.5: resolver's return is the shipped shape extended with `notices` of `{id, text}` | **Yes** | `lib/skills.mjs`, `resolvePluginRoot`'s JSDoc `@returns` names the six keys and the `{id, text}` element type |
| 5 | §6.5 (TE Q-26 / PM Q-01): `notices` initialised once and carried on **every** return including both refusals — so `[]` deep-equality is assertable and success-only attachment cannot pass | **Yes** | `lib/skills.mjs`: `const notices = []` at entry; all four returns carry it — explicit-success, wrong-`--plugin-root` refusal, ladder-success, exhausted-ladder refusal |
| 6 | §6.5 / §12.1 (PM F-01): honour row asserts `path.resolve(env value)` | **Yes** | `lib/skills.mjs`, explicit branch: `const root = path.resolve(explicit)` before `isPluginRoot` |
| 7 | §3.1 / §6.5 / §10.1 S-7: `runStartupChecks`'s own return gains a `notices` key, records verbatim, not folded into `banner` | **Yes** | `lib/startup.mjs`, `runStartupChecks`'s return object carries `notices` alongside `ok`/`rungs`/`banner`/… (ten keys), assigned from `resolution.notices` |
| 8 | §6.5: `readEngineConfig`'s channel is a different one — `string[]`, drained by `bin/cli.mjs`'s `tunablesFor`; `bin/pdlc.mjs` carries no notice code | **Yes** | `lib/run.mjs` `@returns {{config, notices: string[], engine}}`; `bin/cli.mjs`'s `tunablesFor` prints each line; `grep notices pdlc/engine/bin/pdlc.mjs` → no match |
| 9 | §5.2: `version` `0.1.0 → 0.2.0`, guarded by a skew test | **Yes** | `pdlc/engine/package.json` `"version": "0.2.0"`; `pdlc/engine/__tests__/version-skew.test.js` asserts HEAD's version never reuses and is ahead of every recorded published version |

Both round-11 findings I could check (TE F-48's un-named destination, PM F-01's raw-string
equality) are closed against shipped code, not against prose. No previously approved oracle is
weakened: PF-4, AT-3.8a/b and §5.4's `PK-*` derivation are untouched by this delta.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-51 | High | Local | **The publish-gate command equality is specified over the wrong expected set, and the delta made the inconsistency internal.** §8.5's second bullet — whose tail this delta edited — still reads "`publish.yml`'s gate jobs run the same commands as **`pr-tests.yml`'s five**, as a set-equality over the run commands", one bullet below the corrected membership rule that now (rightly) spans six jobs across two files. At HEAD the shipped oracle is set-equal over **every** PR-gate job in `PR_GATE_FILES`: `ci-arrangement.test.js`'s `T49: ci arrangement — publish.yml/PR-gate gate-command set-equality` builds `expectedCommands` by iterating `Object.entries(PR_GATE_FILES)` (both files) and its own message says "EVERY PR-gate job — `pr-tests.yml`'s five **and `fixture-machine.yml`'s**". The workflow agrees: `publish.yml`'s `gate` job carries the fixture-machine leg (`Launcher real-spawn legs`, `Fixture-machine legs`) explicitly for CODE_REVIEW v1 §3-2. So the TSPEC now specifies a **strictly weaker** equality than the one that ships, and the weaker one is the exact defect CR v1 §3-2 found: a tag gated on fewer commands than the PR was. An implementer or PLAN author working from §8.5 would author or narrow the oracle to five and drop AT-2.3…AT-2.6 from the tag gate with the suite green. Same defect, same one-concept fix, at four more sites: §8.1's job table ("Re-runs the **five** PR-gate jobs' commands"), §8.2's opening ("its own copy of the **five** gate jobs' bodies"), §8.2's third reason ("compares … against `pr-tests.yml`'s"), and K-1 ("a duplicated copy of **five** job bodies"). §8.1's "V-18's five rendered check names" (`:1211`) is a dangling reference of the same kind — V-18 now enumerates six; the sentence's substance (`pr-tests.yml` untouched) is fine, the count is not | §8.5 `:1328-1331`; §8.1 `:1211`, `:1224`; §8.2 `:1234`, `:1256`; §14 K-1 `:2041` |
| F-52 | Medium | Local | **"The single render site" is not single at HEAD.** §6.5's new paragraph states "the flattening happens once, at the single render site: `lib/startup.mjs`'s `formatStartup`", and §10.1 S-7 repeats "rendered to `text` at the single site `formatStartup`". `formatStartup` does render them (`lib/startup.mjs`, `for (const notice of result.notices ‖ [])` pushing `notice.text`), but `cmdDoctor` flattens the same array itself on its own path — `bin/cli.mjs`, `for (const notice of result.notices ‖ []) console.log(typeof notice === "string" ? notice : notice.text)` after printing `result.banner` — because `doctor` does not print through `formatStartup`. The enumerated surfaces the delta actually names (`dev`, `queue`, `queue --loop`, both `--dry-run`, refusal) are all correct, and no oracle in §12.1 keys on the singleness, so this costs no coverage. But "single render site" is the kind of claim a later reader turns into a set-equality ("only `formatStartup` reads `notice.text`"), which would go red against a shipped `doctor` surface that is behaving correctly. Say "one render site for the five startup surfaces; `doctor` prints its own copy" | §6.5; §10.1 S-7 |
| F-53 | Low | Process | **The owed-absorption note names the gap but not its landing round.** The v0.13 changelog closes with "FSPEC v0.3–v0.7 … have not had a full section-by-section re-grounding pass; §5.1's own six-row expected set and BR-7.7 have not been transcribed into §5.1's narrative". Naming the gap instead of silently skipping it is right and I would not trade it for a fake claim of completeness. It carries no owner or round, though, so nothing turns red if it never lands — and F-51 is the first instance of exactly that gap producing a wrong expected set. One sentence saying which round or which PLAN task absorbs the remainder makes the note trackable | Changelog v0.13 |

## Questions

| ID | Question |
|----|---------|
| Q-28 | Is `publish.yml`'s gate expected to track `PR_GATE_FILES` **derivedly** (any future PR-triggered workflow's commands automatically owed at the tag) or by hand-maintained copy kept honest by T49's equality? The shipped test enforces the former's consequence, so I read it as derived; §8.2's prose reads as the latter with a fixed five. F-51's fix should state which, since it decides whether a new PR-gating workflow is a one-file edit or a two-file one. |

## Positive Observations

- V-18's correction is the right shape: it does not just swap five for six, it replaces the
  false premise ("holds exactly one workflow") with the **rule** that makes the count derived —
  trigger, not filename, not count. That is the difference between a spec that is right today
  and one that stays right when a seventh job lands.
- The `publish.yml` exclusion is justified by a discriminating reason — tag-triggered, "true of
  it and false of `fixture-machine.yml`" — instead of by naming the file. That phrasing is
  exactly what stops the next author re-deriving the CR v1 §3-1 mistake.
- TE Q-26 is answered mechanically, not rhetorically: `notices` initialised at entry and carried
  on all four returns, so the three empty rows are deep equalities against `[]` and not
  truthiness checks. I verified all four return statements; an implementer genuinely cannot pass
  by attaching the key to the success legs alone.
- PM F-01's `path.resolve` fix improves the oracle rather than loosening it — the assertion is
  written against `path.resolve(env value)` **and** the fixture is told to be absolute, so the
  two spellings coincide and the honour direction stays falsifiable.
- Holding the two `notices` channels apart, by shape and by drain site, removes the one place an
  implementer could have conflated a `string[]` with `{id, text}` records and silently rendered
  `[object Object]`.

DEFERRED: F-49 (v12, Medium) — §5.4's stale `TSPEC:386-389` line window still names a window
whose content moved; untouched by this delta and non-falsifying, replace with the `PK-*` table
anchor when §5.4 is next edited.
DEFERRED: F-50 (v12, Low) — §5.4's derived size would read term-by-term against FSPEC §5.2 if
the per-class sum were written out.

## Recommendation

**Needs revision** — one High.

The delta is otherwise sound and every claim I could check against HEAD holds. F-51 is not a
matter of taste or of extra coverage: §8.5 states an expected set that is smaller than the one
`ci-arrangement.test.js` and `publish.yml` ship, and the smaller one is the defect CODE_REVIEW
v1 §3-2 already found and fixed. The fix is mechanical — one bullet plus four count references
brought to "every PR-gate job in §5.1's trigger-derived set" — and needs no new decision.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 1, "low": 1}
