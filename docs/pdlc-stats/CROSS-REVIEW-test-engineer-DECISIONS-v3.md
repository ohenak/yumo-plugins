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

## Detail

### F-01 (Medium, Cross-Feature) — the fifth site's pinning test is still outside the table

The revision writes the durable lesson correctly:

> The durable form of that lesson — *an enumeration's co-change set includes the tests that pin the
> enumeration's size* — belongs in `docs/_constraints/DOMAIN-CONSTRAINTS.md`, not only in this
> feature's LEARNINGS.

It then applies that lesson to the four enumerations `loop-distribution.test.js` fences, and stops
there. Site 5 is `pdlc/workflows/package.json` / `c8.include`. The test that pins *that* list lives
in a different directory and a different suite:

| File | What it pins | Assertion at HEAD |
|---|---|---|
| `pdlc/workflows/__tests__/coverageInstrumentation.test.js:266-272` | `c8.include`'s exact contents | `expect(include).toEqual([...REQUIRED_INCLUDES, CAPTURE_SCRIPT_INCLUDE, "**/pdlc/workflows/lib/loop-session.mjs", "**/pdlc/workflows/lib/escalation-view.mjs"])` |

Its own header comment states the intent in the same terms K-1 uses for the others — *"Transcribed
literally, not derived from a directory listing: a module dropped from the include set must fail here
rather than quietly stop being measured"* (`:30-33`) — and the test's title is *"the include set is
exactly the six modules the feature owns, no more and no fewer"* (`:265`). Under array-equality it
reds in both directions and on position, which is exactly the property that makes it a co-change
site rather than a passive observer.

Three things follow, and the third is why I file this rather than let it ride:

1. **The document contradicts itself on the count.** The re-evaluation trigger, edited this round,
   says *"eleven hand-written lists across seven files"* and enumerates
   `coverageInstrumentation.test.js`'s literal among them. The site table three sections earlier has
   six rows over six files, and `coverageInstrumentation.test.js` is not one of them. Both numbers
   are load-bearing — the trigger's for deciding whether anyone acts on derive-at-pack-time, the
   table's for option A's measured cost — and they cannot both be the count of the same thing.
2. **Option A's cost is understated by one file, again.** "Six edit sites" in *Standing costs
   accepted* is really six sites over seven files. This does not move the verdict — B and C still
   buy *"Coverage gate (verified): **none**"*, and D is still a broken A — so this is arithmetic, not
   a decision defect. That is the whole reason it is Medium and not High.
3. **The obligation itself is not lost, which is what keeps it non-gating.** K-3 names the file
   explicitly (*"`coverageInstrumentation.test.js`'s expected include literal and its c8-run driver
   gain the same module"*, owner *"same task"*), and PLAN derives owning tasks from the K rows, not
   from the cost table. So nothing ships unguarded on this: a PLAN built from K-1/K-3/K-8 touches all
   seven files. What is wrong is the table that a DoD reviewer and a cost comparison read.

**Cross-Feature tag.** The lesson this round wrote is one instance of a rule with two instances in
this very document. Promoting it to `docs/_constraints/DOMAIN-CONSTRAINTS.md` should be phrased over
*every* enumeration in the co-change set, not over the four that happened to be caught: a per-file
scan finds enumerations, never the assertions in other packages that pin their size or contents.

**Change that resolves it.** Either add a seventh row for
`pdlc/workflows/__tests__/coverageInstrumentation.test.js` (symbol: the P9-02 expected include
literal; members at HEAD: `REQUIRED_INCLUDES`' four entries plus `CAPTURE_SCRIPT_INCLUDE` plus the
two `lib/` modules) and move "six" → "seven" in the table heading, the option-A row, and *Standing
costs accepted*; or keep six rows and state explicitly, in the table, that site 5 is a **pair**
(`package.json` plus its pinning test, both owned by K-3) so the six-sites/seven-files gap is
declared rather than latent. The first is cleaner and matches the shape just given to site 6.

### F-02 (Medium, Local) — K-8's headline count is one under its own list

K-8 reads:

> Six assertion edits in all: the three baselines, the two `added` lists, `tspecPackedCount`'s
> `4 + 15 + 5 + 1` → `4 + 15 + 6 + 1`, and the derived `assert.equal(vendoredClassSize, 5, …)` → `6`.

3 + 2 + 1 + 1 = 7. All seven are real and correctly identified at HEAD — `D1_BASELINE` (`:55`),
`D2_D3_BASELINE` (`:56-60`), `D5_BASELINE` (`:61`), `NEW_LIB_MEMBERS_BARE` (`:49`),
`NEW_LIB_MEMBERS_VENDORED` (`:50-53`), the count at `:158-162`, the derived count at `:203-207`. Only
the headline number is wrong. Note the two counts in play are genuinely different and both belong:
the site table's *"six assertions"* is right (four `assertAdditiveOnly` calls plus two count
assertions), because five constants feed four calls. K-8 is counting *edits*, so it needs seven.

The remedy is one word, but the reason to spend it is v2 F-02's: the enumeration is what a PLAN task
gets built from, and the number is what tells its author whether the task is sized right. A
"six-edit" task row against a seven-edit file is the kind of understatement that leaves the seventh
edit to the wave's last reviewer.
