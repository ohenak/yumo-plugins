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

Closed, and closed at the right tier. `pdlc/engine/__tests__/stats-cli.test.js:380-408` builds a
real temporary tree (a healthy feature, a `chmod 000` feature for EC-21's per-feature gap, and a
leading-underscore directory for BR-26), and `:414-447` / `:449-484` invoke
`main(["node","pdlc","stats","--cwd",fixture.root])` and its `--json` twin — the *same* entry point
as the single-feature legs, so `cmdStats`'s null-feature forwarding, `buildReport`'s fleet branch,
`renderFleetHuman` and `renderJson`'s fleet arm are all now on a production path rather than
reachable only through `runStats` with an injected `fakeStatsIo`.

The assertions are on the operator-visible artifact, not on a builder's return value: the healthy
row must carry `REQ=1` and `malformed=0` (`:428-430`), the gap row must carry a non-empty reason
after `gap: ` (`:432-437`) — REQ-STATS-07's "the reason is visible, never a bare feature name" —
and the unclassified row must be present and marked (`:439-443`). The `--json` leg pins the fleet
document's top-level key set by set-equality (`:465-469`), the per-entry discriminant by
set-equality on both arms (`:471-479`), and that an unclassified name never leaks into `features`
(`:481`). REQ-STATS-07 (P1) is now proven where an operator would experience it.

A second, unconditional fleet leg lands at `pdlc/engine/__tests__/stats-read-only.test.js:243-266`:
the same `main([...,"stats","--json","--cwd",REPO_ROOT])` call, wrapped in the tree-snapshot pair,
which discharges REQ-STATS-08's "either mode" reading for fleet at the same time. Live confirmation:
the no-argument fleet run prints one row per feature with every metric column populated, exit 0.

### F-04 (Medium) — read-only snapshot covered only single-feature `--json`

Closed on both axes I named. `stats-read-only.test.js:224-245` adds the human-mode success leg —
snapshot pair around `main([...,"stats",REAL_FEATURE,"--cwd",REPO_ROOT])`, plus the paired positive
conjunct the protocol demands (exit 0, a report head, and all four REQ-STATS-01 metric labels
present), so "no write happened" cannot false-green on a command that silently did nothing.
`:247-272` adds the fleet leg with the same positive pairing (three-key set-equality on the parsed
document, plus the roll-up containing the real feature). REQ-STATS-08's "any invocation … in either
mode" is now covered for {single, fleet} x {human, json} at the snapshot tier.

### F-02 / F-03 (Medium) — unfalsifiable cross-mode oracles

F-02 is closed at `pdlc/workflows/__tests__/statsRender.test.js:366-381`: the former
`stringContaining("2")` / `("D")` / `("resolved")` substrings — which an unrelated byte total
already satisfied — are now whole rendered lines matched against the split line array
(`"DoD rounds      2"`, `"Halts"`, `"  D           resolved"`,
`"Byte ratio      1.42  (process 123456 B / spec 87000 B)"`). A dropped or wrong-valued row now
fails. The related fleet conjunct at `:485-488` moved from a bare `"2"` to the rendered
`malformed=2` cell, and the fixture's halt count was changed to three against two malformed
basenames so the two cells can no longer alias each other — the aliasing risk I flagged is
structurally removed, not merely re-asserted.

F-03 is closed at `statsRender.test.js:406-435`. `METRIC_LABEL_TO_JSON_KEY` is a literal
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
`computeDodRounds` (`pdlc/workflows/lib/stats.mjs:255-265`) now branches on **presence**
(`dodReviews.length > 0`) rather than on the derived index being `> 0`, which was the source of the
off-by-one blind spot: `deriveDodRoundIndex` returns `max + 1`
(`pdlc/workflows/orchestrate-dev.js:12396`), so a lone `-v0.md` derived `1 - 1 = 0`, indistinguishable
from "no file at all".

I checked the grammar and the blast radius rather than taking the fix on trust. `dodReviewNames`
(`stats.mjs:250-253`) uses `^CODE_REVIEW-{feature}-v(\d+)\.md$`, byte-identical to
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

All six of my v1 findings are resolved, including the High. Scanning only the changed sections, I
found nothing that regresses the product contract; one new Low is worth recording about the
coverage of the fix to F-01 itself.

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | Low | Local | The human-mode fleet leg at the production caller is guarded `{ skip: isRoot }` (`pdlc/engine/__tests__/stats-cli.test.js:415`), so in a root-executing environment REQ-STATS-07's *human* fleet artifact — the gap reason and the unclassified marker an operator actually reads — has no production-caller proof; the only unconditional fleet leg (`stats-read-only.test.js:247`) is `--json`. | REQ-STATS-07 |

**F-01 (Low) — detail and suggested fix.** The skip is not wrong: the fixture uses `chmod 000` to
produce EC-21's gap row, and a root process reads that directory anyway, so the leg would false-fail
under root. The precedent is established (`stats-cli.test.js:280`, `:294` guard the
unreadable-feature legs the same way, and those predate this round). The gap is narrower than the
guard: the healthy-row and unclassified-row assertions (`:428-430`, `:439-443`) need no permission
trick at all, and they are the ones carrying BR-18's "no metric is dropped" and BR-26's "an
unclassified directory is never silently a feature" — both operator-visible in the human rendering
only. As it stands, under root the human fleet report has no production-caller test anywhere in the
suite, while the `--json` fleet document keeps one.

The fix is small and needs no new fixture machinery: split the fleet human test in two — an
unguarded leg over a fixture with only the healthy and `_odd-directory` entries (asserting
`lines[0] === "Fleet"`, the `REQ=1` / `malformed=0` row, and the `unclassified` row), and keep
`{ skip: isRoot }` on a second leg that adds the `chmod 000` directory and asserts only the gap row
and its reason. That preserves every assertion made today while making the majority of them
unconditional.

I am filing this Low rather than Medium deliberately: the GitHub-hosted `ubuntu-latest` runner that
executes the `Engine tests (ubuntu-latest)` gate check runs as a non-root user, so this leg does run
on every PR today, and REQ-STATS-07 is a P1 that is separately proven at the unit tier and by live
invocation. The finding is about durability of the guard, not about a hole in what CI verifies now.
It does not gate this phase.

## Questions

| ID | Question |
|----|---------|
| Q-01 | BR-17's illustrative block (`FSPEC-pdlc-stats.md:410-421`) is explicitly "illustrative of layout and token spelling, not a fixture", and the halt rows now render at the review block's 12-character label column rather than 4 (`stats.mjs:518-545`). I read that as inside the latitude the FSPEC grants, and no operator doc reproduces a halt row, so I raise no finding — but if any downstream consumer parses the human halt row by column offset, this delta would be a breaking change worth an FSPEC note. Is there such a consumer? |
| Q-02 | With F-05 fixed, a partially-harvested feature (LEARNINGS present, `CODE_REVIEW-…-v0.md` surviving) reports `DoD rounds 0 / measured` rather than `harvested`. That is what BR-11 says, and it is the reading I asked for. Does the operator-facing wording in `pdlc/OPERATIONS.md:262-270` need a sentence making the presence-beats-harvest precedence explicit, or is BR-11 the only place that needs to say it? |

## Positive Observations

- **F-01 was fixed at the tier the finding named, not one tier down.** The response could have added
  another `runStats` test with a richer fake and called the fleet branch covered. Instead it stood up
  a real temporary tree and went through `main()`, so `cmdStats`'s null-feature forwarding is now
  load-bearing in a test. That is the AC → production caller → served artifact walk done properly.
- **The F-05 fix went beyond the finding.** I filed a Low about one wrong token; the response
  noticed that `computeDodRounds` and `computeByteRatio` were carrying two independent copies of the
  same basename grammar and collapsed them into one shared `dodReviewNames` — so the two metrics can
  no longer disagree about whether a DoD review exists. Fixing the class rather than the instance is
  the right instinct, and it was done without widening the behavioural change beyond BR-11.
- **The new oracles carry their own justification.** Each added test comments *why* the previous
  form could not falsify the claim (`statsRender.test.js:366-369` on substring aliasing,
  `statsMetrics.test.js:234-236` on the derived index being indistinguishable from absence,
  `statsAntiDrift.test.js:137-147` on what the snapshot and PROP-RO-05 each could not reach). A
  future reader will not re-weaken them by accident.
- **Negative assertions are paired throughout the delta.** The no-capability oracle carries a
  positive `export function runStats` conjunct; both read-only snapshot legs assert exit 0 plus real
  report content alongside "the tree did not change"; the AT-27 root-failure legs now assert the
  condition-specific clause *and* that the message is not EC-01's. None of the new evidence can
  false-green on a command that did nothing.
- **Set-equality where the contract is an enumeration.** The human-vs-JSON metric oracle and the
  fleet document's top-level key check are both set-equal in both directions rather than
  containment, so a deleted metric fails rather than passing quietly.

## Recommendation

**Approved with minor changes**

My v1 High (F-01, fleet mode never driven through the production caller) is resolved, and resolved
at the production tier rather than by a broader unit test. All three Mediums and both Lows are
resolved as well. The two production changes in this delta (`computeDodRounds`'s presence branch,
the shared halt/review label column) were each checked against the FSPEC clause they cite —
BR-11 at `FSPEC-pdlc-stats.md:327-333` and BR-17's explicitly illustrative layout block at
`:410-421` — and both are faithful; neither narrows or reinterprets an acceptance criterion.
Nothing in the delta regresses a section I approved in v1: all 74 stats workflow assertions and all
828 engine assertions pass, and both operator-visible surfaces render correctly live.

The one new finding (F-01, Low) is about the durability of the human-mode fleet leg's `isRoot`
guard, not about a gap in what CI verifies today. It is recorded, not gating. Nothing blocks this
phase.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 0, "low": 1}
