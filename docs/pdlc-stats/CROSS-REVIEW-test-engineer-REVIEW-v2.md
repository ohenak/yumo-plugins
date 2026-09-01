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

<!-- pending -->

## Questions

<!-- pending -->

## Positive Observations

<!-- pending -->

## Recommendation

<!-- pending -->
