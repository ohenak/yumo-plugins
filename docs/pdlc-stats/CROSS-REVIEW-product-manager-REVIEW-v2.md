# Cross-Review: product-manager — Implementation (Phase CR)

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-stats/ (feature implementation; delta since `76aeb3dc6`)
**Date:** 2026-08-31
**Iteration:** 2

## Scope of this round

Delta re-review under the protocol: I read my own v1 (`CROSS-REVIEW-product-manager-REVIEW-v1.md`,
six findings — one High, three Medium, two Low) and then examined only what changed since the
commit I reviewed at (`76aeb3dc6`, the v1 verdict commit).

Five commits land the response, touching **no** document under `docs/pdlc-stats/` — the delta is
entirely code and tests (`git diff --stat 76aeb3dc6..HEAD`: `pdlc/workflows/lib/stats.mjs` +52/-19,
five test files, plus the test-engineer's own v1 review file):

| Commit | Subject | Answers |
|--------|---------|---------|
| `85c900b30` | close CR-v1 oracle gaps in render and outcome suites | PM F-02, PM F-03 (+ TE F-01/F-02/F-03) |
| `eae55da1a` | PROP-PBT-04's ratio oracle independent | TE finding (not mine) |
| `728dc891e` | drive fleet mode through the production caller | **PM F-01 (High)**, PM F-04 |
| `a1bbb91c0` | branch the DoD metric on file presence, per BR-11 | PM F-05 |
| `01dfb0f4a` | no-capability and halt-column findings | PM F-06 (+ TE F-05) |

Two of those commits change **production** code (`lib/stats.mjs`), not only tests, so I re-checked
both against the FSPEC clause each cites rather than accepting the commit message. Verification was
run, not read: `npm test` over the five stats workflow suites (74 passed), `npm test` in
`pdlc/engine` (828 assertions, all ok), and two live invocations of the operator-visible surface —
`node pdlc/engine/bin/cli.mjs stats pdlc-stats --cwd .` and the no-argument fleet form.

Sections of the implementation I approved in v1 and that this delta does not touch are not
re-litigated here.

## Prior findings — resolution status

| Prior ID | Severity | Status | Evidence |
|----------|----------|--------|----------|
| F-01 | High | **Resolved** | Fleet mode now runs through `main()` in both modes, over real `statsIo()` |
| F-02 | Medium | **Resolved** | AT-06's human conjuncts are whole transcribed lines |
| F-03 | Medium | **Resolved** | New set-equality oracle, human metric labels vs JSON key set |
| F-04 | Medium | **Resolved** | Read-only snapshot pair now covers a human success leg and a fleet leg |
| F-05 | Low | **Resolved** | `computeDodRounds` branches on presence, per BR-11 |
| F-06 | Low | **Resolved** | Structural no-capability oracle over `lib/stats.mjs`'s own source |

### F-01 (High) — fleet mode never driven through the production caller

Closed, and closed at the right tier. `pdlc/engine/__tests__/stats-cli.test.js:379-403` builds a
real temporary tree (a healthy feature, a `chmod 000` feature for EC-21's per-feature gap, and a
leading-underscore directory for BR-26), and `:415-437` / `:450-483` invoke
`main(["node","pdlc","stats","--cwd",fixture.root])` and its `--json` twin — the *same* entry point
as the single-feature legs, so `cmdStats`'s null-feature forwarding, `buildReport`'s fleet branch,
`renderFleetHuman` and `renderJson`'s fleet arm are all now on a production path rather than
reachable only through `runStats` with an injected `fakeStatsIo`.

The assertions are on the operator-visible artifact, not on a builder's return value: the healthy
row must carry `REQ=1` and `malformed=0` (`:427-429`), the gap row must carry a non-empty reason
after `gap: ` (`:431-437`) — REQ-STATS-07's "the reason is visible, never a bare feature name" —
and the unclassified row must be present and marked (`:439-442`). The `--json` leg pins the fleet
document's top-level key set by set-equality (`:466-469`), the per-entry discriminant by
set-equality on both arms (`:472-478`), and that an unclassified name never leaks into `features`
(`:480`). REQ-STATS-07 (P1) is now proven where an operator would experience it.

A second, unconditional fleet leg lands at `pdlc/engine/__tests__/stats-read-only.test.js:243-266`:
the same `main([...,"stats","--json","--cwd",REPO_ROOT])` call, wrapped in the tree-snapshot pair,
which discharges REQ-STATS-08's "either mode" reading for fleet at the same time. Live confirmation:
the no-argument fleet run prints one row per feature with every metric column populated, exit 0.

### F-04 (Medium) — read-only snapshot covered only single-feature `--json`

Closed on both axes I named. `stats-read-only.test.js:220-241` adds the human-mode success leg —
snapshot pair around `main([...,"stats",REAL_FEATURE,"--cwd",REPO_ROOT])`, plus the paired positive
conjunct the protocol demands (exit 0, a report head, and all four REQ-STATS-01 metric labels
present), so "no write happened" cannot false-green on a command that silently did nothing.
`:243-266` adds the fleet leg with the same positive pairing (three-key set-equality on the parsed
document, plus the roll-up containing the real feature). REQ-STATS-08's "any invocation … in either
mode" is now covered for {single, fleet} x {human, json} at the snapshot tier.

### F-02 / F-03 (Medium) — unfalsifiable cross-mode oracles

F-02 is closed at `pdlc/workflows/__tests__/statsRender.test.js:366-381`: the former
`stringContaining("2")` / `("D")` / `("resolved")` substrings — which an unrelated byte total
already satisfied — are now whole rendered lines matched against the split line array
(`"DoD rounds      2"`, `"Halts"`, `"  D           resolved"`,
`"Byte ratio      1.42  (process 123456 B / spec 87000 B)"`). A dropped or wrong-valued row now
fails. The related fleet conjunct at `:463-468` moved from a bare `"2"` to the rendered
`malformed=2` cell, and the fixture's halt count was changed to three against two malformed
basenames so the two cells can no longer alias each other — the aliasing risk I flagged is
structurally removed, not merely re-asserted.

F-03 is closed at `statsRender.test.js:405-427`. `METRIC_LABEL_TO_JSON_KEY` is a literal
transcription of BR-17's four block labels paired with BR-21's JSON keys — no value is derived from
the module under test — and the check is set-equality in both directions between the labels found
on the human side and `Object.keys(json)` minus `schemaVersion`, with a cardinality assertion
pinning the enumeration at four. A metric printed in one mode only, or a JSON key with no human
counterpart, now goes red. That is REQ-STATS-02's stated direction made falsifiable, which is
exactly what I asked for.

### F-05 (Low) — a surviving `CODE_REVIEW-{feature}-v0.md` reported `harvested`

Closed with a **production** change, and the change is faithful to the clause it cites.
FSPEC BR-11 (`FSPEC-pdlc-stats.md:327-333`) reads: "Where any survives, the measured highest
version wins — the harvested state never displaces evidence this metric can actually read."
`computeDodRounds` (`pdlc/workflows/lib/stats.mjs:253-263`) now branches on **presence**
(`dodReviews.length > 0`) rather than on the derived index being `> 0`, which was the source of the
off-by-one blind spot: `deriveDodRoundIndex` returns `max + 1`
(`pdlc/workflows/orchestrate-dev.js:12396`), so a lone `-v0.md` derived `1 - 1 = 0`, indistinguishable
from "no file at all".

I checked the grammar and the blast radius rather than taking the fix on trust. `dodReviewNames`
(`stats.mjs:250-252`) uses `^CODE_REVIEW-{feature}-v(\d+)\.md$`, byte-identical to
`deriveDodRoundIndex`'s own pattern (`orchestrate-dev.js:12387`), so BR-11's qualifier holds — a
`-draft` leftover still neither raises the number nor suppresses `harvested`. Because the derivation
floors at `max + 1 = 1`, the measured branch can never emit a negative round count. Behaviour for
every previously-passing case is unchanged (`n > 0` and presence agree there); only the `-v0`
case moves, and it moves toward the spec. The same basename set is now threaded into
`computeByteRatio` (`stats.mjs:289`, `:337-346`) instead of being recomputed from a duplicate
regex — so the two metrics can no longer disagree about whether such a file exists. That is a
product-visible consistency win beyond the finding I filed.

New oracle at `statsMetrics.test.js:226-238`: `{LEARNINGS, CODE_REVIEW-v0}` must report
`{state:"measured", rounds:0}`, with the comment recording *why* the derived index alone cannot
distinguish the case. Live check: this feature still reports `DoD rounds      0`, and harvested
features still report `DoD=harvested` in the fleet row.

### F-06 (Low) — the "runs no `git` command" conjunct had no oracle reaching `cmdStats`

Closed by a structural oracle at `pdlc/workflows/__tests__/statsAntiDrift.test.js:150-167`, which
is the right instrument for the hole I described: PROP-RO-05 pins `statsIo()`'s key set, and the
empirical snapshot deliberately excludes `.git/`, so neither could reach it. The oracle strips
comments (so a capability named in prose cannot trip it), then asserts `lib/stats.mjs` declares no
static import, no dynamic `import(`, and no `require(` at all — from which "cannot spawn a process,
run `git`, or open a socket" follows totally rather than by enumeration. Every capability must
arrive through the injected `StatsIo`/`StatsParsers`.

It also satisfies the review bar I would have applied anyway: the negative assertions are paired
with a positive conjunct (`stringContaining("export function runStats")`), so a misresolved or
empty read cannot false-green the whole test. `pdlc/OPERATIONS.md:295-298` states the read-only
stance to operators in exactly these terms, and it is now backed on the failure paths as well as
the success path.

## Findings

## Questions

## Positive Observations

## Recommendation

