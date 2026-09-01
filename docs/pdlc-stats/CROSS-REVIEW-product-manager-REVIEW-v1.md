# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** implementation diff of `feat-pdlc-stats` against `main` (production code: `pdlc/workflows/lib/stats.mjs`, `pdlc/engine/bin/cli.mjs`), verified against `docs/pdlc-stats/REQ-pdlc-stats.md` v1.7 and `FSPEC-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 1

## Scope and Method

Product lens only: does the shipped code deliver REQ-STATS-01…09 as written, without scope creep,
and is each operator-visible artifact proven at the production caller that assembles it?

What I read and ran:

- `pdlc/workflows/lib/stats.mjs` (601 lines, new) and the `pdlc stats` additions to
  `pdlc/engine/bin/cli.mjs` (`USAGE` line, `FLAGS_BY_COMMAND.stats`, `statsParsers()`,
  `statsIo()`, `cmdStats`, the `case "stats"` arm).
- The nine test files added or touched under `pdlc/engine/__tests__/` and
  `pdlc/workflows/__tests__/`.
- `REQ-pdlc-stats.md` v1.7 §5 (all nine ACs) and §4 (C-1…C-5), and `FSPEC-pdlc-stats.md` §8
  (BR-01…BR-30) and §6 (AT-01…AT-28) for the token/layout choices REQ O-1 delegates.
- The driver parsers the feature is required to defer to (REQ C-5):
  `deriveRoundWindow` (`pdlc/workflows/orchestrate-dev.js:10192`),
  `deriveDodRoundIndex` (`orchestrate-dev.js:12384`),
  `parseResolvedMarker` (`orchestrate-dev.js:7601`).

What I executed:

- `cd pdlc/engine && npm test` — 921 pass, 0 fail, 2 skipped.
- `cd pdlc/workflows && npm test` — 163 suites, 5116 pass, 0 fail.
- The real binary, end to end, against this repository and against hand-built fixture trees
  outside it (`node pdlc/engine/bin/cli.mjs stats …`), to confirm each AC's operator-visible
  output rather than inferring it from a unit test.

Every finding below cites either a changed line or a command I ran and its output.

## Requirement-by-Requirement Trace

For each AC: the production caller that assembles the operator-visible artifact, the test that
drives **that** caller, and my own live run.

| AC (P) | Production assembler | Test driving that caller | Live check | Verdict |
|---|---|---|---|---|
| REQ-STATS-01 human table (P0) | `cmdStats` → `runStats` → `renderSingleHuman` (`pdlc/workflows/lib/stats.mjs:514`) | `pdlc/engine/__tests__/stats-cli.test.js:284` — `main(["node","pdlc","stats",fixture.featureName,"--cwd",fixture.root])` | `node pdlc/engine/bin/cli.mjs stats pdlc-stats` printed all four metric blocks | Met |
| REQ-STATS-02 `--json` (P0) | `cmdStats` → `runStats` → `renderJson` (`stats.mjs:585`) | `stats-cli.test.js:298` in-process **and** `stats-cli.test.js:193-196` real `spawnSync` of `bin/cli.mjs`; key set pinned at `pdlc/engine/__tests__/stats-read-only.test.js:214-218` | one well-formed document on stdout, nothing else | Met; oracle gaps F-02, F-03 |
| REQ-STATS-03 review rounds (P0) | `computeReviewRounds` (`stats.mjs:220-244`), deferring to `deriveRoundWindow` (`pdlc/workflows/orchestrate-dev.js:10192`) | driven through `main()` at `stats-cli.test.js:284/298` | live run reported `REQ 9 / FSPEC 12 / TSPEC 11 / PLAN 7 / PROPERTIES 7 / DECISIONS 12`, and listed `CROSS-REVIEW-product-manager-REVIEW-v1.md` plus the two `-IMPLEMENTATION-` files as `malformed` | Met |
| REQ-STATS-04 DoD rounds (P0) | `computeDodRounds` (`stats.mjs:248-253`) via `deriveDodRoundIndex` (`orchestrate-dev.js:12384`) | same | `DoD rounds 0` on this feature | Met except F-05 |
| REQ-STATS-05 halts (P0) | `computeHalts` (`stats.mjs:257-273`) via `parseResolvedMarker` (`orchestrate-dev.js:7601`) | same | `Halts none` here; `Halts=2 (2 resolved)` for `pdlc-advisory-wave-gate` in the live fleet run | Met |
| REQ-STATS-06 byte ratio (P0) | `computeByteRatio` (`stats.mjs:277-300`) | same | `Byte ratio 4.22 (process 1856978 B / spec 439983 B)` | Met |
| REQ-STATS-07 fleet mode (P1) | `discoverFeatures` (`stats.mjs:339`) + `buildReport`'s fleet branch (`stats.mjs:431-440`) → `renderFleetHuman` (`stats.mjs:549`) | **none** — see F-01 | `node pdlc/engine/bin/cli.mjs stats` produced the fleet report, exit 0 | Behaviour met, **unproven at the production caller** (F-01) |
| REQ-STATS-08 read-only (P0) | `statsIo()` (`pdlc/engine/bin/cli.mjs`, four members, no write member) | `stats-read-only.test.js:199-218` (AT-21), `:222-239` (AT-22a), `:242-256` (AT-22b) | snapshot pair green in the suite | Met for the covered legs; F-04, F-06 |
| REQ-STATS-09 unknown feature (P0/P1) | `buildReport`'s `not_found` arm (`stats.mjs:411-418`) | `stats-cli.test.js:225` (human) and `:233` (`--json`); `stats-read-only.test.js:227` pins the exact error key set, `reason`, and echoed feature | exit 1, error object, no partial success document | Met |

**Scope compliance.** I found no behaviour in the shipped code that the REQ/FSPEC does not authorise.
`--cwd` is not in REQ-STATS-01's `pdlc stats {feature}` wording, but it is an accepted flag under
FSPEC BR-01's closed surface and is what makes the read-only snapshot tests addressable; it is
authorised, not creep. The flag set is genuinely closed — `--dev`, `--plugin-root` and `--dry-run`
are each refused (`FLAGS_BY_COMMAND.stats = ["json","cwd"]`, `bin/cli.mjs`), pinned at
`stats-cli.test.js:124/133/142`.

**Engine channel.** `pdlc stats` is only useful to an operator if it ships. `lib/stats.mjs` is
vendored in all three places that decide that: `pdlc/engine/scripts/prepack.mjs:25`,
`pdlc/engine/scripts/publish-preflight.mjs:226`, `pdlc/engine/scripts/fixture-machine.mjs:431`.
Operator documentation landed too — `pdlc/README.md:228` and `pdlc/OPERATIONS.md:262-284`.

**No P0 or P1 requirement is silently omitted.** Every one of the nine is implemented and
observably correct on a live run. Every finding below is about proof, or about one edge the code
reads differently from its own rule — none is a missing capability.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Local | Fleet mode is never driven through the production caller, at any tier. No test anywhere invokes `main([...,"stats"])` **without** a feature argument, and `runStats`'s fleet branch is never driven over a real `StatsIo`. | REQ-STATS-07, REQ-STATS-08 |
| F-02 | Medium | Local | AT-06's human-side assertions are single-character substring containment that unrelated output already satisfies, so the cross-mode agreement oracle cannot falsify a dropped human metric. | REQ-STATS-02 |
| F-03 | Medium | Local | No oracle relates the human printed metric set to the JSON top-level key set; each is asserted against its own hardcoded literal, so REQ-STATS-02's stated direction is unfalsifiable. | REQ-STATS-02, REQ R-5 |
| F-04 | Medium | Local | The read-only snapshot pair covers only single-feature `--json`; there is no human-mode success leg and no fleet leg, though the criterion binds "any invocation … in either mode". | REQ-STATS-08 |
| F-05 | Low | Local | `CODE_REVIEW-{feature}-v0.md` matches the version grammar and survives on disk, yet the DoD metric reports `harvested`, contradicting "where any survives, the measured highest version wins". | REQ-STATS-04 |
| F-06 | Low | Local | REQ-STATS-08's "runs no `git` write command" conjunct has no oracle reaching `cmdStats` itself, and the snapshot that would catch one deliberately excludes `.git/`. | REQ-STATS-08, REQ C-1, REQ R-3 |

### F-01 (High) — fleet mode is unproven at the production caller

REQ-STATS-07 is a P1 acceptance criterion whose whole product point is an operator-visible artifact:
"it discovers every feature directory … and for any feature whose directory cannot be read, reports
it by name with the reason rather than omitting it". FSPEC states its acceptance tests over the
command itself — AT-18, AT-20, AT-26 ("`pdlc stats {feature}` **and** `pdlc stats` are both run")
and AT-27 ("the single-feature run …, then `pdlc stats`").

Walking AC → production caller → served artifact:

- The assembler is `buildReport`'s fleet branch (`pdlc/workflows/lib/stats.mjs:431-440`), reached
  only when `parsed.feature === null` (`stats.mjs:409`), rendered by `renderFleetHuman`
  (`stats.mjs:549`) / `renderJson`'s fleet arm (`stats.mjs:589-594`).
- Its production caller is `cmdStats` in `pdlc/engine/bin/cli.mjs`, which hands `argv` straight to
  `runStats`.
- Every `stats` invocation in the engine test suite passes a feature argument:
  `pdlc/engine/__tests__/stats-cli.test.js:124, 133, 142, 151, 160, 169, 196, 225, 233, 284, 298,
  331, 356` and `pdlc/engine/__tests__/stats-read-only.test.js:205, 227, 246`. I grepped the whole
  suite for a no-argument form and found none.
- The only fleet coverage is `runStats({argv: [], …})` against `fakeStatsIo`
  (`pdlc/workflows/__tests__/statsOutcome.test.js:100, 259, 299, 382`).
- The real-filesystem leg (`pdlc/workflows/__tests__/statsRealPaths.test.js`, AT-18) calls
  `discoverFeatures` — the *builder* — over `realStatsIo()`, never the assembled fleet report.
  A builder unit-tested but never assembled is exactly the seam this check exists to catch.

The consequence is not hypothetical wiring doubt — I ran `node pdlc/engine/bin/cli.mjs stats` and it
produced a correct fleet report, exit 0. The consequence is that this operator-visible artifact has
no regression oracle: `cmdStats` could stop forwarding the null-feature case, `renderFleetHuman`
could drop the gap or unclassified rows, or the fleet exit code could go non-zero, and both suites
stay green. REQ-STATS-07's own guarantee — "a gap-flagged feature is a row, not a failure: fleet
mode exits zero whenever it produced its report" — is the specific thing left unpinned at the edge.

REQ-STATS-08 compounds it: the criterion binds "**any** invocation of `pdlc stats`, in either mode",
and fleet mode walks far more of the tree than a single-feature run, so it is the invocation most
able to violate the read-only stance.

**What must change.** Add at least one process-level leg that runs
`main(["node","pdlc","stats","--cwd",<root>])` — no feature argument — and asserts the assembled
artifact, not just an exit code: for the human mode, that a named gap row and an unclassified row
each appear in the one list with their reason/marker; for `--json`, that the top-level key set is
exactly `{schemaVersion, features, unclassified}` and that a gap entry is discriminated by the
presence of the `gap` key. Then add the AT-26/AT-27 fleet halves at that same tier, since both
criteria are written as two-mode comparisons and only the single-feature half is currently driven
through `main()`.

### F-02 (Medium) — AT-06's human-side oracle is satisfied by unrelated output

REQ-STATS-02's guarantee is that human and JSON never disagree, and FSPEC names AT-06 as the oracle
for it. `pdlc/workflows/__tests__/statsRender.test.js:353-375` asserts the human side with
`expect(human).toEqual(expect.stringContaining("2"))` for the DoD count and
`expect.stringContaining("D")` for the halt phase.

I ran `renderHuman` over that same report shape and then deleted the `DoD rounds` line from the
output. The assertions still hold: `contains 2 = true` (from `processBytes` `123456`) and
`contains D = true` (from the literal `DoD rounds` label and the `DECISIONS` row). So the human half
of the cross-mode oracle cannot falsify a dropped or wrong DoD value at all; only the `"1.42"`
ratio assertion carries real content.

**What must change.** Assert the human side by exact line, not by substring: transcribe the expected
`DoD rounds      2` and `  D   resolved` lines literally from the FSPEC layout and compare, so a
changed value or a deleted row fails. Keep the JSON-side assertions as they are — those are already
literal.

### F-03 (Medium) — the human/JSON set-equality REQ-STATS-02 promises is never asserted

REQ-STATS-02's observable guarantee is stated as a set relation: stdout's "top-level key set is
set-equal to REQ-STATS-01's printed metric set plus one schema-version field — … so a metric added
to human mode without a JSON field fails". R-5 makes that the mitigation JSON consumers rely on.

The suite asserts each side against its own hardcoded literal and never relates them:
`statsRender.test.js:112-138` (AT-05) pins `Object.keys(json)` to a five-element literal, and
`statsRender.test.js:83-110` (AT-01) checks that the four known human labels are present and
ordered. Nothing derives one set from the other. A fifth human metric block added to
`renderSingleHuman` (`pdlc/workflows/lib/stats.mjs:514-524`) with no corresponding JSON field leaves
both assertions green — the exact failure REQ-STATS-02 names.

**What must change.** Add one oracle that derives the human metric labels from the rendered output
(or from a single shared literal list of metric names transcribed from FSPEC) and asserts
set-equality against `Object.keys(renderJson(report))` minus `schemaVersion`. It must be a
set-equality, not a containment check, so a metric present on one side only goes red.

### F-04 (Medium) — the read-only proof covers one mode and one invocation shape

REQ-STATS-08 binds "any invocation of `pdlc stats`, **in either mode**, on success or on failure",
and BR-28 repeats "on any path". The empirical snapshot pair is asserted three times, all
single-feature: `pdlc/engine/__tests__/stats-read-only.test.js:199` (success, `--json`), `:222`
(unknown feature, `--json`), `:242` (unknown flag — the usage-error path, which returns before any
directory is read). So the human-mode success path is never snapshotted, and neither is any fleet
invocation — the one that reads the most of the tree.

I accept that `runStats` is mode-agnostic, so the risk today is low; the finding is that the
criterion's own quantifier is not the quantifier the suite proves.

**What must change.** Extend the AT-21 snapshot leg to a human-mode success run and to one
no-feature fleet run (which F-01 requires adding anyway), asserting the same liveness conjunct —
report emitted, exit 0 — alongside the unchanged snapshot.

### F-05 (Low) — a surviving `CODE_REVIEW-…-v0.md` is reported `harvested`

REQ-STATS-04 and FSPEC BR-11 both say the harvested state applies only when **no**
`CODE_REVIEW-{feature}-v{N}.md` matching the version grammar remains, and that "where any survives,
the measured highest version wins — the harvested state never displaces evidence this metric can
actually read".

`deriveDodRoundIndex` (`pdlc/workflows/orchestrate-dev.js:12384-12397`) returns `max + 1`, so it
returns `1` both when no file matches and when only `…-v0.md` matches. `computeDodRounds`
(`pdlc/workflows/lib/stats.mjs:248-253`) subtracts one and branches on `n > 0`, so the two cases are
indistinguishable and the surviving file is treated as absent.

Reproduced:

```
/tmp/pmchk2/docs/alpha/{LEARNINGS-alpha.md, CODE_REVIEW-alpha-v0.md, REQ-alpha.md}
$ node pdlc/engine/bin/cli.mjs stats alpha --json --cwd /tmp/pmchk2
… "dodRounds":{"state":"harvested","rounds":null} …
```

Expected per BR-11: `{"state":"measured","rounds":0}`. Note the ratio metric gets the same input
right — `computeByteRatio` (`stats.mjs:285`) tests `dodReviews.length`, file presence, not the
derived index — so the two metrics disagree about whether that file exists.

Operator impact is close to nil: the pipeline's own `deriveDodRoundIndex` never emits `v0`, so a
`v0` file only appears if hand-created. Severity is Low on that basis, not because the rule is
soft — R-6's harvested-versus-measured distinction is the thing being blurred.

**What must change.** Branch on file presence rather than on the derived index — e.g. compute the
matching basenames once (the `dodPattern` filter `stats.mjs:284-285` already does) and report
`harvested` only when that list is empty and `LEARNINGS-{feature}.md` is present. Add a leg pinning
the `v0` case to `{measured, 0}`.

### F-06 (Low) — the no-`git`-write conjunct has no oracle reaching `cmdStats`

REQ-STATS-08 requires the command run "no `git` write command (`commit`, `push`, `add`, `checkout`,
or similar)". PROPERTIES accepts a structural argument for this (PROP-RO-06, resting on PROP-RO-05),
and PROP-RO-05 **is** implemented: `pdlc/engine/__tests__/stats-cli-structure.test.js:500` pins
`Object.keys(statsIo())` set-equal to the four read members.

The hole is that `statsIo()` is not the only code that runs. `cmdStats` and `statsWorkflowModule`
(`pdlc/engine/bin/cli.mjs`) execute outside that bundle, and no oracle forbids them importing
`node:child_process` or `fetch`. Meanwhile the empirical snapshot excludes `.git/`
(`pdlc/engine/__tests__/stats-read-only.test.js:38`) — the one directory a `git` write would touch —
so the empirical half cannot catch it either. `pdlc/workflows/lib/stats.mjs` genuinely has zero
`import` statements today (I checked), but nothing pins that.

I am recording this as Low rather than pressing it: the structural argument was reviewed and
accepted upstream at PROPERTIES, and the behaviour is correct today. A cheap close, if the author
wants it: assert that `stats.mjs`'s source contains no `import` statement and that the `cmdStats`
span in `bin/cli.mjs` names no `child_process`/`fetch`/`spawn` token — the same source-inspection
technique `stats-cli-structure.test.js:525` already uses for `statSync`.

## Questions

| ID | Question |
|----|---------|
| Q-01 | TSPEC RK-5 already records the leading-underscore discovery predicate as **provisional** with an erratum open against FSPEC BR-26. As shipped, `discoverFeatures` (`pdlc/workflows/lib/stats.mjs:349-351`) marks a directory unclassified only when its name starts with `_`, so a future bare-named non-feature directory at the `docs/` root (say `docs/templates/`) would join the fleet as a feature with meaningless metrics — the outcome BR-26 exists to prevent. I am **not** re-raising this as an erratum, since it is already raised and open and re-routing a settled question is DEC-ERR-01's anti-pattern. The question for the operator is only whether the residue is still acceptable now that the command is shipping to consuming repositories whose `docs/` roots this team does not control. |
| Q-02 | The fleet report prints `Ratio=0.00` for a feature holding only a REQ (e.g. `pdlc-adapter-read-cache` in the live run), which is a correct measurement — spec bytes non-zero, process bytes zero. Is `0.00` distinguishable enough from `n/a` for an operator skimming a wide fleet table, or would the roll-up benefit from an explicit "no process artifacts yet" reading in a later REQ? Not a defect; a product observation for the NG-1 harvest integration. |

## Positive Observations

- **The REQ C-5 fidelity constraint is honoured structurally, not by assertion.** The four driver
  classifiers are injected by reference from the same `orchestrate-dev.js` instance
  (`statsParsers()` in `pdlc/engine/bin/cli.mjs`), and
  `pdlc/engine/__tests__/stats-cli-structure.test.js:447` asserts identity with `===` against the
  real exports, with `:483` pinning that the bundle is constructed exactly once. This is the
  strongest available answer to O-2, and it means the command cannot drift from the driver's
  classification of the same bytes. Keep this arrangement.
- **REQ-STATS-03's hardest clause is right, and I could see it being right.** Running the command on
  this feature listed `CROSS-REVIEW-product-manager-REVIEW-v1.md` and the two `-IMPLEMENTATION-`
  files as `malformed` — the grammatical-but-out-of-catalogue basenames the pipeline itself writes,
  reported under one label with no third bucket, exactly as REQ v1.7 decided.
- **R-6's harvested-versus-zero distinction survives end to end.** Per-document-type harvested
  states, the DoD harvested state and the ratio's harvested state each ride inside their own
  metric's value in `--json` (`renderJson`, `pdlc/workflows/lib/stats.mjs:585-601`) rather than as
  extra top-level keys, which is precisely REQ-STATS-02's requirement, and
  `stats-read-only.test.js:214-218` pins the five-key set against a literal.
- **REQ-STATS-08's liveness conjunct is taken seriously.** AT-21/AT-22 assert the snapshot pair
  **and** the decided output on the same invocation, so a binary that prints nothing cannot pass —
  the exact trap the criterion's last sentence names. The scratch-prefix guard
  (`stats-read-only.test.js:162-195`) additionally proves the exclusion set is not a hole.
- **The engine channel was not forgotten.** `lib/stats.mjs` is vendored in `prepack.mjs`,
  `publish-preflight.mjs` and `fixture-machine.mjs`, and the operator documentation landed in both
  `pdlc/README.md` and `pdlc/OPERATIONS.md`. A metrics command that shipped without reaching the
  installed CLI would have met every AC on paper and none in practice.
- **Both suites are green and fast** — 921 engine tests, 5116 workflow tests, zero failures — and the
  real-path tests declare their literals as dated measurements with a re-measure instruction, which
  is the honest way to pin against a live archive.

## Recommendation

**Needs revision**

F-01 is a High finding and is mandatory to close. Concretely, before this can be approved:

1. **F-01** — add process-level legs that run `main([...,"stats","--cwd",<root>])` with **no**
   feature argument, asserting the assembled fleet artifact in both modes (gap row with reason,
   unclassified row, exit 0; and the `--json` fleet key set with the `gap`-key discriminant), plus
   the fleet halves of AT-26 and AT-27.

The three Medium findings should be closed in the same pass, since each is a small, local test edit:

2. **F-02** — replace AT-06's substring assertions with literal line comparisons.
3. **F-03** — add a set-equality oracle between the human metric set and the JSON top-level key set.
4. **F-04** — extend the read-only snapshot pair to a human-mode success run and to the new fleet run.

F-05 and F-06 are Low and non-gating; F-05 is a genuine rule divergence worth fixing while the code
is open, F-06 is an optional hardening of an argument PROPERTIES already accepted.

To be clear about what this verdict is **not** saying: every one of the nine acceptance criteria is
implemented and behaves correctly on a live run, no P0 or P1 requirement is omitted or narrowed, and
I found no scope creep. The revision asked for is proof at the production edge for one criterion,
plus three oracles that currently cannot fail.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 2}
