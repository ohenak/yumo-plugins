# Cross-Review: product-manager — TSPEC (round 13, frozen round)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-engine-distribution/TSPEC-pdlc-engine-distribution.md (v0.13)
**Date:** 2026-08-16
**Iteration:** 13
**Scope:** Delta only. Decision freeze respected — no new decision opened here.

## 1. Scope confirmation

The commit I last reviewed (`a9f1584b`) is no longer an ancestor of HEAD; the branch was
rebased and that edit now lands as `965a7220` with identical content. Baseline for this
delta is therefore `965a7220`. Five TSPEC commits since (`5f9c27f0`, `d1c63b73`, `bf1495f9`,
`401c0b48`, `c1d7f0e7`), 64 insertions / 32 deletions, touching: the lineage header and
version row, the v0.13 changelog row, §2's V-18 and V-19, §3.1's handshake/startup row,
§5.2's `version` row, §6.5, §8.5's three bullets, §10.1's S-7, §12.1's unit row.

Nothing outside those sections moved. §5.4's `PK-*` table and its derivation — the subject of
my v12 review — are byte-unchanged.

## 2. Upstream re-grounding at HEAD

Both upstreams moved since the last approval and the lineage header now names them
correctly: REQ **v0.11 → v0.12** (`REQ:18`), FSPEC **v0.2 → v0.8** (`FSPEC:16`). I read the
REQ and FSPEC deltas directly rather than accepting the changelog's account.

The decision both carry is the one the changelog absorbs *ahead of* the raised items, per
DEC-ERR-01: PR-check membership is trigger-derived, not a fixed count and not a filename
list (`REQ:86` O-B, `FSPEC:537` BR-7.5, `FSPEC:515`). That ordering is right, and it is what
makes the raised items resolvable rather than being smuggled in as a fix.

## 3. Delta claims checked against code, not prose

Every load-bearing claim the delta adds is true at HEAD:

| Claim | Evidence at HEAD |
|---|---|
| V-18: three workflow files, two PR-triggered, six in-scope jobs | `.github/workflows/` holds `pr-tests.yml`, `fixture-machine.yml`, `publish.yml`; `publish.yml`'s `on:` is `push.tags: engine-v*` only (`publish.yml:10-13`); five jobs in `pr-tests.yml` (`:27`, `:83`, `:117`, `:143`, `:201`) plus `fixture-machine` (`fixture-machine.yml:42`) |
| V-18: per-job matrices — `unit-tests` `os`+`node`, `engine-tests` `os` only, the other four none | `pr-tests.yml:31-41`, `:87-92`; no `strategy:` under `:117`, `:143`, `:201` or `fixture-machine.yml:42` |
| V-19: `PR_GATE_FILES` / `GATE_JOB_IDS` / `FIXTURE_MACHINE_JOB_IDS` and a `§5.1's file scope` test that re-derives the key set from `on:` triggers | `pdlc/engine/__tests__/ci-arrangement.test.js:47`, `:55`, `:64-66`, and the test at `:552` asserting `Object.keys(PR_GATE_FILES)` against the trigger-derived set (`:558`) |
| §6.5: `resolvePluginRoot` returns six keys, `notices` an `{id, text}` array | `lib/skills.mjs:212-216` (JSDoc), `:226` |
| §6.5: `notices` initialised once and carried on **every** return including both refusal legs | `lib/skills.mjs:226`; returns at `:250`, `:261` (wrong-override refusal), `:284`, `:295` (exhausted ladder) all carry it — the deep-equal-`[]` oracle and the "cannot pass by attaching it to the success legs alone" claim are both sound |
| §6.5 / §12.1: the honour row resolves before testing, so the assertion is against `path.resolve(env value)` | `lib/skills.mjs:245` |
| §6.5: `runStartupChecks`'s own return gains `notices`, unflattened | `lib/startup.mjs:353`, `:376`, `:494-505` |
| §6.5: `readEngineConfig`'s is a *different* channel — `string[]`, drained by `bin/cli.mjs`'s `tunablesFor`, and `bin/pdlc.mjs` carries no notice code | `lib/run.mjs:273-274`; `bin/cli.mjs:515-517`; `grep -n notice pdlc/engine/bin/pdlc.mjs` returns nothing |
| §5.2: `version` `0.1.0 → 0.2.0`, guarded by a skew test | `pdlc/engine/package.json:3`; `pdlc/engine/__tests__/version-skew.test.js` exists; `EVIDENCE-BR-3.9.md` present |

Round-11's two PM findings are closed at the level raised, not merely acknowledged: v11 F-01
asked that the honour row stop promising the raw env string is echoed back, and v11 F-02
asked which field reaches the console. Both are now stated, and both match code.

## 4. Findings

No High. Nothing the delta introduced narrows, reinterprets or drops an acceptance criterion,
and no scope was added or removed.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Medium | Local | **"The flattening happens once, at the single render site" is false at HEAD — there are two flatten sites.** §6.5's new paragraph and `lib/startup.mjs:515-518`'s own JSDoc both say `formatStartup` is the single site, but `cmdDoctor` flattens the same records inline with the same `typeof notice === "string" ? notice : notice.text` expression (`pdlc/engine/bin/cli.mjs:456-458`), bypassing `formatStartup` entirely. No user harm and no AC-5.6 exposure: AC-5.6 is about *running the pipeline* (`REQ:459-464`), `doctor` is not a pipeline surface, and it prints the notice rather than swallowing it — so the operator sees the text on `doctor` too. But the invariant as written is what a future implementer would trust when adding a seventh surface, and it is not the invariant the code holds. Fix is one clause: name `formatStartup` the single render site **for the pipeline surfaces**, and note that `cmdDoctor` renders its own copy. The six surfaces enumerated (`dev`, `queue`, `queue --loop`, both `--dry-run`, refusal) do all route through `formatStartup` — verified at `bin/cli.mjs:491`, `:655`, `:669`, `:689`, `:704` | AC-5.6 (REQ-EDIST-05) |
| F-02 | Low | Local | **v12 F-01 carried unchanged.** §5.4's derivation still publishes a merged four-member bucket ("four manifest-adjacent/`bin/` members") where FSPEC §5.2 counts three classes at 1 + 1 + 2 (`FSPEC:509-511`), so the arithmetic the TSPEC shows is not class-for-class with the change-control point the same paragraph names. §5.4 was untouched this round, which is correct under freeze. Spelling it `1 + 1 + 2 + 15 + 3 + 1 + 0/1` remains a one-line fix for whichever round next opens §5.4 | AC-1.3 (REQ-EDIST-01) |
| F-03 | Low | Local | **v12 F-02 carried unchanged.** §5.4 line-anchors FSPEC §5.2 at a range that no longer covers the `23/24` value after round 10 moved it. Nothing false — the range still points into the right paragraph — but a `§5.4`-style anchor would survive future edits where a line span will not. Rides the next §5.4 edit | AC-1.3 (REQ-EDIST-01) |

DEFERRED: v0.13's changelog names FSPEC v0.3–v0.7 absorption as "still owed" — reviewed for §5.4 surface but not given a full section-by-section re-grounding, and §5.1's six-row expected set and BR-7.7 are not transcribed into §5.1's narrative beyond the V-18/V-19/§8.5 corrections. That is a scope call for the next round or for Phase P, not a defect in this delta.

## 5. Questions

| ID | Question |
|----|---------|
| Q-01 | F-01's duplicate flatten in `cmdDoctor` predates this feature and is behaviourally harmless. Is it worth a PLAN task to route `cmdDoctor` through `formatStartup` so the "one render site" invariant becomes true rather than aspirational? I lean yes-but-cheap, and am not raising it as a finding. |

## 6. Positive Observations

- **V-18 was outright false and the round said so in those words.** It claimed one workflow
  file with five jobs where HEAD has three files and six rendered checks. Naming a false
  verification claim as false, rather than quietly widening it, is exactly what keeps V-rows
  worth reading.
- **The `publish.yml` exclusion is justified by a reason that discriminates.** "Tag-triggered,
  a reason true of it and false of `fixture-machine.yml`" is a real test, not a restatement of
  the outcome — and it matches `publish.yml:10-13`. The old filename-based exclusion would have
  silently dropped `fixture-machine.yml` too.
- **The oracle got stronger in the direction that matters.** V-19 no longer describes a test
  that hard-codes filenames; `ci-arrangement.test.js:552` re-derives the key set from the files'
  own triggers, so a new PR-gating workflow cannot join the repo without joining §5.1. That is
  a set-equality over the real enumeration, not containment.
- **TE Q-26 / PM Q-01 were answered against code, not prose.** The "`notices` is never
  `undefined`, so assert deep-equal `[]` not truthiness" clause is checkable, and it checks
  out on all four returns including both refusals — closing the loophole where an implementer
  attaches the key to the success legs alone.
- **The absorption debt is named rather than hidden.** The changelog states what was *not*
  re-grounded. That is the honest form and it is what let me scope this review correctly.

## 7. Recommendation

**Approved with minor changes.**

The delta resolves round-11's findings at the level raised, and it corrects two verification
rows that were false at HEAD — one of them (V-18) materially so. The upstream re-grounding is
real: REQ v0.12 and FSPEC v0.8 are named, and the trigger-derived membership decision they
carry is absorbed ahead of the raised items and is what fixes them. I checked the six-job
enumeration, the per-job matrix shapes, the trigger of every workflow file, the resolver's six
keys and its four returns, both `notices` channels and the version bump against the repository
directly; every load-bearing claim the delta adds is true.

Nothing previously approved is broken. The one Medium is a precision defect in a sentence the
delta introduced — "single render site" where HEAD has two — with no acceptance-criterion
exposure, and the two Lows are v12's presentational findings carried forward on a section
this round correctly did not touch.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 2}
