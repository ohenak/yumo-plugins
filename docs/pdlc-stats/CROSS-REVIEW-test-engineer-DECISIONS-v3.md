# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.2)
**Date:** 2026-08-31
**Iteration:** 3

## Scope

Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v2.md`. Diffed
`ab700d142..HEAD` on the document (six commits, +73/−16). I verified the one blocking v2 finding and
the two non-gating ones, then scanned only the changed sections for new issues. Unchanged sections
already approved in v1/v2 are not re-litigated. Every claim below was re-measured against the tree at
HEAD, not read off the document.

## v2 findings — disposition

| v2 ID | Severity | Status | Evidence at HEAD |
|---|---|---|---|
| F-01 | High | **Resolved** | `pdlc/engine/__tests__/loop-distribution.test.js` is now the sixth row of DEC-STATS-01's site table, with its six assertions named; option A's cost moves five → six; K-8 owns the site; K-1 names it as what reds first and restates the partition over three rows / six sites; the third residual is narrowed to `PK-26`'s row. Every arithmetic claim re-checks: `assertAdditiveOnly`'s third conjunct is `actual.length === baseline.length + added.length` (`loop-distribution.test.js:73-77`), four live un-`skip`ped tests (`grep -c '^test('` → 4, no `.skip`), `tspecPackedCount({licence:false})` pinned to `4 + 15 + 5 + 1` (`:158-162`) and the derived `assert.equal(vendoredClassSize, 5, …)` (`:203-207`). B's "same sixth site" claim also holds: `pdlc/engine/lib/*.mjs` is exactly 15 files, so B moves the `15` term in that same expression |
| F-02 | Medium | **Resolved** | The trigger now reads **eleven hand-written lists across seven files (ten distinct member facts)**. Re-counted: the four enumerations, `c8.include`, `coverageInstrumentation.test.js`'s literal, and `loop-distribution.test.js:49-61`'s five (`NEW_LIB_MEMBERS_BARE`, `NEW_LIB_MEMBERS_VENDORED`, `D1_BASELINE`, `D2_D3_BASELINE`, `D5_BASELINE`) = 11; `D1_BASELINE` and `D5_BASELINE` are byte-identical (`["orchestrate-dev.js", "orchestrate-queue.js"]`), so ten distinct facts is right |
| F-03 | Low | **Resolved** | K-3 now says **array-equality, position-sensitive and strictly stronger than set-equality**, and draws the operative consequence (append at the same index in both). The shipped assertion is `expect(include).toEqual([...REQUIRED_INCLUDES, CAPTURE_SCRIPT_INCLUDE, …])` (`coverageInstrumentation.test.js:266-272`) — order-sensitive, as now described |

Both v2 questions were answered in the revision: Q-01 by K-8's re-baselining shape, Q-02 by the
narrowed third residual.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Cross-Feature | **The six-site table applies the round's own lesson to four enumerations but not to the fifth.** `pdlc/workflows/__tests__/coverageInstrumentation.test.js` holds a member list that reds under array-equality when `c8.include` moves, and K-3 obliges editing it — but it is not a row in the site table, which names `pdlc/workflows/package.json` alone as site 5. The same paragraph's own trigger counts **seven files**; the table has six rows over six files. Option A's measured cost is therefore still one file short | *Option A's six sites* table; *Re-evaluation triggers*, first bullet; K-3 |
| F-02 | Medium | Local | **K-8 says "Six assertion edits in all" and then enumerates seven.** Three baselines + two `added` lists + `tspecPackedCount`'s literal + the derived `assert.equal(vendoredClassSize, 5, …)` = 7. The count-versus-enumeration mismatch is the same shape as v2 F-02, in the row a PLAN task will be built from | K-8 |
| F-03 | Low | Local | **DEC-STATS-02's reversibility line and its re-evaluation trigger now use "hoist" in two senses.** "Three hoists in one function" counts *sites of one field*; "Two hoists is where an envelope type becomes cheaper" counts *hoisted fields*. Read together, the trigger looks already fired at authoring time, which makes it undetectable as a forward condition | DEC-STATS-02, *Reversibility* and *Re-evaluation trigger* |
| F-04 | Low | Local | **K-8's edit list omits `assertAdditiveOnly`'s failure message.** `:76` reads *"delta over baseline must be exactly the two new members"*; after re-baselining, `added` holds one member. Message text only — no oracle weakens — but it is part of the same edit and is cheaper to name now than to rediscover in review | K-8; `loop-distribution.test.js:73-77` |
