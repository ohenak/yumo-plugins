# Cross-Review: software-engineer — REQ (delta re-review, frozen round)

**Reviewer:** software-engineer
**Document reviewed:** docs/pdlc-engine-distribution/REQ-pdlc-engine-distribution.md
**Date:** 2026-08-16
**Iteration:** 9
**Scope:** Delta since `20c87cd3` (the commit reviewed at v8). One commit touches the REQ:
`3605092b` "fix(engine): bump past the published 0.1.0 and guard the skew (CR v4 §3-1)",
+11 lines, all inside **NG-5**. Nothing else in the document moved; unchanged sections
already approved are not re-litigated. Decision freeze respected — no new decision opened.

## Delta

A second recorded note under NG-5 (`REQ:194-204`): the engine's own manifest version moved
`0.1.0 → 0.2.0` for the same reason the plugin's did, plus a named mechanical guard.

## Verification of the delta's claims against HEAD

Every factual assertion in the added text was checked against the repository, not against
neighbouring documents:

- **`pdlc/engine/package.json` is at 0.2.0.** `pdlc/engine/package.json:3` reads
  `"version": "0.2.0"`. True at HEAD.
- **`engine-v0.1.0` was published from `30773d0c`.** `EVIDENCE-BR-3.9.md:7-8` records
  `@kaneho/pdlc-engine@0.1.0` from tag `engine-v0.1.0` at commit
  `30773d0cf5399b5c2191ea0d76a29851cb99e09f`, with the `npm view` transcript at `:30-31`.
- **The packed members changed after that publish.** `git diff --stat 30773d0c..HEAD --
  pdlc/engine/bin pdlc/engine/lib pdlc/engine/scripts/postinstall.mjs pdlc/engine/package.json`
  reports 5 files, 401 insertions / 15 deletions (`bin/pdlc.mjs`, `lib/catalogue.mjs`,
  `lib/startup.mjs`, `package.json` among them). The claim "HEAD was claiming a version number
  that already named different, older bytes" is therefore true, not rhetorical.
- **The cited tasks are the right ones.** T41, T43, T45, T46, T48, T50 all own packed-member
  files in the PLAN's ownership manifest (`PLAN:350,352,354,355,357,359` — `lib/run.mjs`,
  `lib/catalogue.mjs`, `lib/store.mjs`, `bin/pdlc.mjs`, `bin/cli.mjs`,
  `scripts/fixture-machine.mjs`). No task is named that touches nothing packed.
- **`EVIDENCE-BR-3.9.md` was not edited.** Confirmed: the delta touches only the REQ; the
  evidence file is unchanged in `3605092b`. The REQ's framing ("a dated record … is not
  edited; the stale surface was the manifest version") matches what happened.
- **The guard exists and does what the sentence says.** `pdlc/engine/__tests__/version-skew.test.js`
  carries two assertions on this axis: `:78-92` fails when `package.json`'s version is a member
  of the published set (`equals`), and `:94-105` fails when `compareSemver(pkg.version, latest)`
  is not `1` (`fails to exceed`). Both legs named in the REQ sentence are real assertions, not
  one assertion glossed as two. Run at HEAD: `node --test __tests__/version-skew.test.js` →
  3 pass, 0 fail.
- **Oracle quality of the named guard.** The published set is read from tracked, dated evidence
  (`ls-files` over `docs/pdlc-engine-distribution/EVIDENCE-*.md`, `:33,:40-41`), not from the
  registry, so the oracle is hermetic and the expected values are transcriptions of a spec-side
  artifact rather than anything derived from the code under test. `:82-85` asserts the published
  set is non-empty before asserting non-membership, so the negative assertion (version not in the
  set) cannot pass vacuously and is paired with a positive one — no absence-only oracle.

## NG-5 scope reasoning

The note's self-classification is correct and does not widen the non-goal: a manifest version
number is not phase graph, review bar, completeness criterion, queue lifecycle or report shape
(`REQ:179-181`), so recording it as "not itself an NG-5 exception" is the accurate disposition.
It reads as the second half of the plugin-side note at `REQ:188-193` and creates no second
change-control point.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | **The register was not bumped with the delta.** The metadata row still reads `Version 0.12` (`REQ:18`) and the 0.12 changelog entry still closes with *"No other change."* (`REQ:23`) — but the document now carries an eleven-line NG-5 note that entry does not describe. This is exactly the class of skew the added note is about, one layer up. Non-gating: approval anchors pin bytes by hash, so nothing detects staleness by this number and no mechanism silently breaks. Fix is a 0.13 row naming the engine-version note. | Header table `:18`; changelog `:20-24` |
| F-02 | Low | Local | The guard harvests `engine-v{X.Y.Z}` tag mentions from *any* `EVIDENCE-*.md`, so a future evidence file that names a tag it intends to cut would enter the published set before the publish happens. The test comment acknowledges the narrowing choice (`version-skew.test.js:51-53`); the REQ sentence says "recorded as published", which is slightly tighter than what the pathspec actually reads. Registers as prose precision, not a defect. | NG-5 `:203-204` |

DEFERRED: bump the REQ to 0.13 with a changelog row for the engine-version note, and correct the 0.12 entry's "No other change." closer.
DEFERRED: TSPEC's Upstream cell still pins REQ v0.11 (carried from v8 Q-01) — expected to re-anchor in the engine's downstream re-confirmation pass.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Is `EVIDENCE-BR-3.9.md` intended to stay the sole publish-evidence file, or will successors accumulate under the same glob? The guard is written for the latter (`:12` "successor"), which is the right call; only asking so the naming convention is deliberate rather than incidental. |

## Positive Observations

- The delta closes a real skew rather than describing one: the 401-line drift across packed
  members since `30773d0c` is measurable, and the bump is the minimum correct response to it.
- Recording the bump in NG-5 *while explicitly declining to call it an NG-5 exception* is the
  honest disposition — it keeps the exception list meaning what it says and still leaves the
  reasoning discoverable next to its plugin-side twin.
- The guard is the part that makes this durable. A prose note about version discipline decays;
  a test that reds on equality *and* on non-advance survives the next person who forgets.
- Choosing tracked evidence over `npm view` keeps the oracle offline and deterministic, and the
  non-empty-set precondition means it cannot pass by finding nothing.

## Recommendation

**Approved with minor changes** — the delta is factually true at HEAD in every claim it makes,
the guard it names exists and passes, and nothing previously approved is contradicted. F-01 and
F-02 are register and wording, both non-gating in a frozen round.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 1, "low": 1}
