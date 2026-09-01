# Cross-Review: software-engineer — PROPERTIES

**Reviewer:** software-engineer
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 6 (delta re-review of the v1.3 round-5 revision, frozen round)

## Overview

Delta re-review under the decision freeze. My v5 verdict was **Needs revision** on exactly one open
item — F-01 High, delta-introduced and local: the §PLAN tasks preamble v1.2 added asserted that
wave 9 had not run and that `statsRealPaths.test.js` was "legitimately absent", both false at HEAD.

The base I reviewed in v5 was `1be839ea8` (PROPERTIES v1.2, round-3 revision history). Three
commits have touched the document since — `5db3218a9`, `c5725fe88`, `359874bb1`, all v1.3 — and
`git diff 1be839ea8..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` is **+34 / −13**, confined to
four places: the revision-history block (new v1.3 entry, corrected v1.2 sentence), §Subject under
test's status paragraph, the §PLAN tasks preamble, and T-18's status cell. **No property row, no
oracle, no fixture, no trace, no coverage-matrix row and no level-distribution figure moved.** That
matches the revision note's own claim about its scope, which I checked by diffing rather than
reading.

**My v5 F-01 is resolved, in both halves.** The preamble no longer claims wave 9 is outstanding and
no longer names `statsRealPaths.test.js` as absent; it now states the measured position and cites
the three wave-9 commits, and T-18's status cell carries the same commit-anchor form T-09 and T-10
already used. I re-measured every anchor rather than trusting the prose, and every one resolves to
the commit the document names (§Oracles). The revision also picked up a cross-round inconsistency
the fix exposed — §Subject under test still said `lib/stats.mjs` was absent and that
`FLAGS_BY_COMMAND` had no `stats` row — which was the right call: leaving it would have put two
contradictory status claims in one document.

I found one new item in the delta, a Medium, and it does not gate: the corrected preamble's
universal quantifier ("every new file the manifest declares is tracked") is wider than the sixteen
files it then enumerates, and PLAN's manifest declares a seventeenth `new` row that is genuinely
absent. Detail in §Findings. Under the freeze I opened no new design question and re-litigated
nothing settled in v1…v5.

## Oracles

Every check I ran this round, as a command a later reader can re-run against this file.

| Check | Command | Result |
|---|---|---|
| Delta scope since v5's base | `git diff --stat 1be839ea8..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` | +34 / −13, four locations only ✅ |
| No property/oracle/fixture/trace moved | full `git diff` of the range, read hunk by hunk | four hunks: revision history, §Subject under test, §PLAN preamble, T-18 cell ✅ |
| Wave 9 ran — `statsRealPaths.test.js` | `git ls-files --error-unmatch …/statsRealPaths.test.js`; `git log --oneline -1 9a3a70fd9` | tracked; `T-18 🟢 Real-path acceptance…` ✅ (this is exactly what v5 F-01 denied) |
| `statsProperties.test.js` anchor | `git log --oneline -1 ca8031311` | `T-19 🟢 Property tests (fast-check…)` ✅ |
| `stats-vendoring.test.js` anchor | `git log --oneline -1 1846a8a96` | `T-20 🔴 Vendoring co-change oracle (TSPEC §6.4)` ✅ — and red-by-design, consistent with PLAN batch 9's split gate |
| `lib/stats.mjs` landed at `308afef94` | `git log --oneline --diff-filter=A -- pdlc/workflows/lib/stats.mjs` | `308afef94` is the adding commit ✅ (subject reads `docs(…): se PROPERTIES v3 scope section` — see DEFERRED below) |
| "all sixteen tracked" | `git ls-files --error-unmatch` over each of the sixteen | all sixteen tracked ✅ |
| Sixteen is the right count | manifest `new` rows, less the doc artifact | 15 new test/helper files + `lib/stats.mjs` = 16 ✅ |
| Seventeenth `new` manifest row | `git ls-files --error-unmatch docs/pdlc-stats/MUTATION-EVIDENCE-pdlc-stats.md` | **absent** ❌ — narrows the preamble's quantifier (F-01, Medium) |
| `FLAGS_BY_COMMAND` fifth row, line 190 | `grep -n 'stats: \["json", "cwd"\]' pdlc/engine/bin/cli.mjs` | `190:  stats: ["json", "cwd"]` ✅ |
| "fifth row" is literally fifth | rows between `FLAGS_BY_COMMAND` (`:169`) and `:190` | `dev`, `queue`, `doctor`, `decide`, `stats` ✅ |
| T-09 row's surviving caveat still true | `grep -c 'symlink\|lstat' pdlc/engine/__tests__/stats-cli.test.js` | `0` — the symbolic-link leg is still not in the shipped file ✅ |
| No stale absence claim left elsewhere | `grep -n 'absent\|not yet\|does not exist\|has not run'` over the document | remaining hits are property text (`reason:"absent"`, `F-NO-ROOT`) or correctly past-tense ✅ |

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | §PLAN tasks preamble claims "**every new file the manifest declares is tracked** — all sixteen". PLAN's File Ownership Manifest declares **seventeen** rows `new`; the seventeenth is `docs/pdlc-stats/MUTATION-EVIDENCE-pdlc-stats.md` (batch 11, T-26), which is untracked at HEAD. The enumeration that follows is correct and self-scoping, so no reader is misled about a test file — but the quantifier is wider than the set measured. | §PLAN tasks, preamble |

**Why F-01 is Medium and not High.** It is delta-introduced, so limb (i) of the frozen-round rule
is technically available, and I want to be explicit about why I am not using it. My v5 F-01 was
High because the sentence named a *specific present file as absent* and told an implementer that a
whole wave of test work was outstanding — a reader acted on it wrongly. This inverts the direction
and the materiality: the over-broad claim is about a **documentation artifact** for a batch that
genuinely has not run, and the same sentence enumerates its own scope ("all sixteen, the fifteen
new test files plus `pdlc/workflows/lib/stats.mjs`") in the next clause, so the reader's operative
takeaway — which *test* files exist — is exactly right. No property, oracle, fixture or trace
depends on it. The fix is one word ("every new **code** file", or "all sixteen of the seventeen
`new` rows, the exception being T-26's evidence document"), and it is not worth another round on
its own.

**Nothing else in the delta is gating, and I looked for the same failure mode twice.** The class of
defect this round was fixing is *status claims that contradict HEAD*, so I re-measured every status
claim the revision makes rather than only the ones v5 named: four commit anchors, the sixteen-file
tracked set, the count arithmetic, the `FLAGS_BY_COMMAND` line number and its "fifth row" ordinal,
and the one caveat the previous round left standing (T-09's symbolic-link leg). All hold. I also
swept the whole document for surviving absence language and found none that is stale.

**On the freeze.** I opened no new decision. The three items below are recorded, not raised.

DEFERRED: `lib/stats.mjs`'s anchor `308afef94` is accurate as the adding commit, but that commit's subject is `docs(pdlc-stats): se PROPERTIES v3 scope section` — a production module landed inside a docs commit, so the document's "(T-12)" attribution is true of the content and not of the commit message; worth a note at harvest rather than an edit here.
DEFERRED: T-19's and T-20's rows still read `(new)` while their files are tracked, which is consistent with the preamble's restated definition of `(new)` as provenance, but inconsistent in *precision* with T-18, T-09 and T-10, which now carry commit anchors.
DEFERRED: my v5 DEFERRED items are unchanged and still stand — T-11's "(both new)", PROP-RATIO-05's literal regex versus the shipped call-set oracle, and PLAN T-10's stale pre-implementation baseline note.
