# Cross-Review: test-engineer — Implementation (Phase CR)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/` implementation — `pdlc/workflows/lib/stats.mjs`, `pdlc/engine/bin/cli.mjs` (`cmdStats`/`statsParsers`/`statsIo`), and the stats test files on `feat-pdlc-stats`
**Date:** 2026-08-31
**Iteration:** 2

## Scope

Delta re-review. This round judges two things only: whether my own v1 blocking findings
(F-01, F-02) are resolved, and whether the revision broke anything. Sections of the
implementation unchanged since `88c0d289c` are not re-litigated. Testing lens only.

## Delta Under Review

`git diff 88c0d289c..HEAD` — five commits, 403 insertions across eight files:

| File | Change |
|---|---|
| `pdlc/workflows/lib/stats.mjs` | +42/-10 — BR-11 presence branch, shared `dodReviewNames`, `LABEL_COLUMN_WIDTH` |
| `pdlc/workflows/__tests__/statsOutcome.test.js` | +9 — AT-27 positive condition clause (F-01) |
| `pdlc/workflows/__tests__/statsRender.test.js` | +98/-7 — single-feature malformed row (F-02), `malformed=2` cell (F-03), column width (F-05), human/JSON metric set-equality |
| `pdlc/workflows/__tests__/statsProperties.test.js` | +36 — PROP-PBT-04 independent oracle (F-04) |
| `pdlc/workflows/__tests__/statsMetrics.test.js` | +13 — BR-11 `-v0.md` case |
| `pdlc/workflows/__tests__/statsAntiDrift.test.js` | +34 — no-capability structural oracle |
| `pdlc/engine/__tests__/stats-cli.test.js` | +119 — fleet mode through the production caller |
| `pdlc/engine/__tests__/stats-read-only.test.js` | +52 — AT-21 human and fleet legs |

**Note this round changed production code, not only tests** (`stats.mjs`, +42/-10), so the
delta scan below covers behavior as well as oracles.

### Verification performed

| # | Check | Result |
|---|-------|--------|
| 1 | `git rev-parse --abbrev-ref HEAD` | `feat-pdlc-stats` — confirmed before any commit |
| 2 | Workflows suite (`npm test`) | 163 suites, **5121 passed**, 70 skipped — green (was 5116) |
| 3 | Engine suite (`cd pdlc/engine && npm test`) | 34 suites, **925 passed**, 2 skipped, **0 fail** |
| 4 | Targeted c8 over `lib/stats.mjs` | **96.27% branch** (was 95.62), 99.68% stmt/line — above the 85 floor |
| 5 | v1's uncovered `503-504` (F-02's malformed row) | now covered |
| 6 | v1's uncovered `422-423` (now `443-444`) | single-feature `unreadable_feature` catch — covered by `stats-cli.test.js:279-307`, which runs in the *engine* suite and so is invisible to the workflows c8 run; not a real gap |
| 7 | `node pdlc/workflows/build-runtime.mjs --check` | `in-sync pdlc/workflows/dist/pdlc-cli.mjs` — the production change reached the shipped artifact |

## Disposition of v1 Findings

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | `statsOutcome.test.js:287,290,339-340` |
| F-02 | High | **Resolved** | `statsRender.test.js` AT-06/EC-05 case; `stats.mjs:503-504` now covered |
| F-03 | Medium | **Resolved** | `statsRender.test.js:490` — `malformed=2` cell |
| F-04 | Medium | **Resolved** | `statsProperties.test.js:237-252,276-300` |
| F-05 | Low | **Resolved** | `stats.mjs:517-524` `LABEL_COLUMN_WIDTH`; `statsRender.test.js:383-404` |

### F-01 — the positive condition conjunct now exists, and it is falsifiable

The `rootScenario` rows now carry the clause AT-27 asks for, and the matrix asserts it:

```js
{ label: "absent", clause: /docs root not found:/, buildIo: () => fakeStatsIo({}) },
{ label: "unreadable", clause: /docs root unreadable:/, ... }
...
expect(outcome.stderr).toMatch(root.clause);
expect(outcome.stderr).not.toMatch(/feature not found:/);
```

I re-ran the exact mutation from v1 — swapping the two branch bodies in `docsRootStatus`
(`stats.mjs:388-398`) so the absent path emits the unreadable message — and the matrix now
goes **red** on `toMatch(root.clause)`, where in v1 it stayed green. That is the falsification
the finding asked for.

The second half of PROP-ERR-03 is closed too: `not.toMatch(/feature not found:/)` is the
human-mode counterpart of the JSON legs' `reason` assertion, so "no message is EC-01's
not-found message" is now proven on both surfaces rather than one. Note this negative is
correctly *paired* — it sits alongside the positive `toMatch(root.clause)` on the same path,
so it is not an absence-only oracle.

### F-02 — the single-feature malformed row is now rendered and asserted verbatim

The new AT-06/EC-05 case renders the row and pins the whole line, both directions:

```js
expect(human).toEqual(expect.arrayContaining([
  "  malformed: CROSS-REVIEW-pm-REQ-v01.md, CROSS-REVIEW-pm-FSPEC-v01.md",
]));
expect(emptyHuman).not.toEqual(expect.stringContaining("malformed"));
```

This is the right shape on three counts: the basename appears **verbatim** as EC-05 requires
rather than as a substring match; the empty-list leg pins BR-17's "omitted entirely when none",
which answers v1's Q-02 in the affirmative; and the expected string is a literal transcription
of the FSPEC block, not a value derived from the report object. Deleting `stats.mjs:503` now
fails the suite. c8 confirms lines `503-504` moved from uncovered to covered.

### F-03 — the malformed conjunct can now fail on its own

`statsRender.test.js:490` asserts the rendered cell `malformed=2` rather than the bare
substring `"2"`, and the fixture was changed so the halt count (3) differs from the malformed
count (2) — `Halts=3 (1 resolved)`. The two reductions can no longer alias, which was the
substance of the finding rather than the literal edit I suggested.

### F-04 — the property's oracle is now independent of the code under test

Both totals are re-derived inside the test from the sizes the generator chose and from BR-14's
transcribed basename grammars (`SPEC_BASENAMES_LITERAL`, `isProcessBasenameLiteral`), then
asserted against the reported totals. The ratio is expressed as BR-15 states it —
`|ratio - process/spec| <= 0.005` plus 2dp representability — instead of as a copy of `round2`'s
body. The circularity is gone: a mutation moving a basename between the two sides now moves the
expected totals but not the reported ones, so the property goes red.

### F-05 — the column width is now a named decision with a test

`LABEL_COLUMN_WIDTH = 12` is shared by both blocks (`stats.mjs:517-524,542`), and the new test
pins exact spacing including a phase token at the review block's own label length:

```js
expect.arrayContaining(["  REQ         3", "  PROP        open", "  D           resolved"])
```

Pinning literal spacing is the right call — it makes cross-block alignment an asserted contract
rather than a coincidence.

## Findings

No High findings. Both v1 blockers are resolved, the revision broke nothing, and the full
gate command (`npm run test:coverage`) exits 0.

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Low | Local | The no-capability oracle's forbidden-substring list omits `spawn`, `execFile`, `node:child_process` and a bare `git` token (only `"git "` with a trailing space is listed), so the list itself catches less than it appears to; the no-import conjuncts are what actually carry the proof | `statsAntiDrift.test.js:164` |
| F-02 | Low | Local | PROP-PBT-04 now expresses BR-15 as a `<= 0.005` tolerance plus 2dp representability, which does not pin the rounding tie-break direction at an exact `.005` boundary | `statsProperties.test.js:295-298` |

### F-01 (Low) — the capability list is weaker than the conjuncts around it

The new structural oracle is a good idea, well-motivated by a comment that correctly explains
why PROP-RO-05 and the empirical snapshot each leave a hole (`statsAntiDrift.test.js:136-146`).
The loop, though:

```js
for (const capability of ["child_process", "execSync", "spawnSync", "node:fs", "fetch(", "git "]) {
  expect(code).not.toEqual(expect.stringContaining(capability));
}
```

`spawn(`, `execFile(`, and a `git` token not followed by a space (`execFile("git", [...])`)
all pass this list. So would `eval(`. The list reads as a set-equality-style enumeration but
is a hand-picked sample, and it is not derived from any catalogue in the FSPEC, so nothing
keeps it honest as the module evolves.

This is Low rather than Medium because the list is not where the proof lives. The three
preceding assertions — `not.toMatch(/^\s*import\b/m)`, `not.toMatch(/\bimport\s*\(/)`,
`not.toMatch(/\brequire\s*\(/)` — are **total**: `lib/stats.mjs` declares no imports at all,
so it provably cannot reach `child_process`, `fs` or the network by any spelling, listed or
not. The capability loop is belt-and-braces over an already-closed door. I am recording it so
a later reader does not mistake the list for the guarantee and start maintaining it as if it
were.

If it is kept, the cheapest strengthening is to drop the sample list entirely and lean on the
import conjuncts, which are the falsifiable ones — or, if a defence-in-depth list is wanted,
assert on a word-boundary regex (`/\bgit\b/`) rather than a space-suffixed substring.

### F-02 (Low) — the 2dp contract no longer pins tie-breaking

Removing the `round2` echo was the right fix and I would not trade it back. The replacement
contract is:

```js
expect(Math.abs(ratio - expectedProcessBytes / expectedSpecBytes)).toBeLessThanOrEqual(0.005);
expect(Number(ratio.toFixed(2))).toBe(ratio);
```

Together these pin "a 2dp value within half a hundredth of the true quotient", which is BR-15
as stated. What they no longer pin is the direction taken at an exact `.005` tie: both
`Math.round`'s half-up and a half-even rounding satisfy the pair, since `<=` admits either
neighbour. A mutation from `Math.round` to `Math.floor(x + 0.5)` is indistinguishable here
(they agree anyway), but a switch to banker's rounding would survive.

This is Low, and arguably the correct trade: pinning the tie-break in the *property* would
drag the implementation's formula back in, which is exactly what F-04 objected to. The clean
close, if wanted, is one **example-based** test next to the property with a literal tie fixture
transcribed from BR-15 (e.g. spec 200 B / process 405 B → the value BR-15 says an operator
sees), leaving the property to carry the invariant and the example to carry the tie-break.

## Questions

| ID | Question |
|----|---------|
| Q-01 | v1's Q-02 is now answered by test (empty malformed list → no row). v1's Q-01 stands unchanged: `parseStatsArgv` returns a field no production caller consumes, pinned only by `statsArgv.test.js`. Still not an erratum — the implementation matches the TSPEC signature exactly — but a future round may want to decide whether the field earns its pin. |

## Positive Observations

- **The production change is a genuine spec-conformance fix, not a test-driven fudge.** The
  BR-11 rewrite branches on file **presence** rather than on the derived index, which is what
  FSPEC BR-11 actually says: *"if a file survives, it is measured, highest version wins — the
  harvested state never displaces evidence the metric actually read."* The lone `-v0.md` case
  (`statsMetrics.test.js:226`) is exactly the input where the old index-only branch was
  indistinguishable from "no file at all", and it is now pinned to
  `{ state: "measured", rounds: 0 }`. Fixing production code rather than bending the oracle is
  the right instinct.
- **`dodReviewNames` is shared without violating metric independence.** BR-11 and BR-14 now read
  one derivation instead of two copies of the same regex, so the two metrics cannot disagree
  about whether a DoD review is present. This does not breach FSPEC §3.1's independence rule —
  a shared *derivation over `basenames`* is not one metric consuming another's *result*, and the
  comment at `stats.mjs:246-247` says so explicitly.
- **Fleet mode is now proven through the production caller, closing the last builder-only
  surface.** `stats-cli.test.js` drives `main(["node","pdlc","stats","--cwd",root])` over a real
  temporary tree with three deliberately different directories — a healthy feature, a
  `chmod 0` unreadable one, and a leading-underscore non-feature dir — and asserts a full metric
  row, a gap row whose reason text is non-empty, and an `unclassified` row. Previously
  `renderFleetHuman` was reachable only through `runStats` with a `fakeStatsIo`; nothing stopped
  `cmdStats` from failing to forward a null feature. That hole is closed.
- **The gap-row oracle avoids the obvious cheat.** It does not merely assert `/gap: /` matches;
  it strips the prefix and asserts the remaining reason text has non-zero length, so an empty
  reason cannot pass as a gap.
- **AT-21's read-only proof was extended to the surfaces that were missing it.** Both the
  human-mode single-feature leg and the fleet leg now snapshot the tree before and after and
  pair the unchanged-tree assertion with a positive "the job was done" conjunct — exit 0 plus
  every one of BR-17's four metric labels present, and for fleet, the real repository's own
  feature appearing in `doc.features`. A no-op command still cannot pass the second half.
- **The human/JSON set-equality test is the right shape.** `METRIC_LABEL_TO_JSON_KEY` is
  transcribed from BR-17/BR-21, and the assertion is two-directional `Set` equality plus a count
  check against the full catalogue — so a metric printed in one mode only, or a dropped metric,
  goes red. This is set-equality over the enumeration, not containment.
- **`malformed=2` versus `Halts=3 (1 resolved)`.** Choosing fixture values that differ so the two
  cells can never alias again is a better fix than the literal one I suggested; it removes the
  class of bug, not the instance.
- **Coverage moved the right way for the right reason.** 95.62% → 96.27% branch on
  `lib/stats.mjs`, with the improvement landing precisely on the lines the finding named
  (`503-504`), and the full `npm run test:coverage` gate exiting 0. The one remaining uncovered
  pair (`443-444`) is a workflows-suite artifact, not a gap — the single-feature
  `unreadable_feature` path is covered by `stats-cli.test.js:279-307` in the engine suite.
- **The runtime bundle was rebuilt in the same change.** `build-runtime.mjs --check` reports
  in-sync, so the BR-11 fix actually reaches `pdlc/workflows/dist/pdlc-cli.mjs` — the artifact
  operators run — rather than living only in the source the tests import.

## Positive Observations

<!-- pending -->

## Recommendation

**Approved with minor changes**

Both v1 High findings are resolved, and resolved in the falsifiable way rather than the
minimal one: I re-ran the exact `docsRootStatus` swap mutation from F-01 and the suite now goes
red where it previously stayed green, and F-02's deleted-row mutation now fails too. The two
Medium findings and the Low are closed as well. Nothing in the delta regressed — both suites
green (5121 and 925 passing), branch coverage up, the gate command at exit 0, and the runtime
bundle in sync.

The revision also went beyond the findings in a way worth naming: the BR-11 defect it uncovered
was a real production bug — a lone `CODE_REVIEW-…-v0.md` reported `harvested` instead of
`measured 0` — found by taking the specification seriously rather than by making a test pass.

The two remaining findings are Low and non-gating. Neither needs to block: F-01 is redundancy
sitting on top of an already-total proof, and F-02 is a deliberate and defensible trade made to
remove an implementation echo. Both can be picked up opportunistically or deferred to harvest.

**No erratum items.** Every upstream document I checked against — FSPEC BR-11, BR-15, BR-17,
EC-05, AT-27, PROP-ERR-03 — was correct as written; this round's defects were all in the
implementation, and the specs were what diagnosed them.
