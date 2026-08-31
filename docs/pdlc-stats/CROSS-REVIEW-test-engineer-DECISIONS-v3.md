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

### F-03 (Low, Local) — "hoist" means two different things two lines apart

This round changed *"One constant and one hoist site"* to *"One constant and three hoists in one
function"*, which is the accurate statement: `renderJson` hoists `SCHEMA_VERSION` into the single
success, fleet success and refusal documents. The re-evaluation trigger below it was not touched and
still reads:

> A second JSON-only field appears. Two hoists is where an explicitly named envelope type
> (`JsonEnvelope<T>`) becomes cheaper than repeating the hoist.

Under the old text ("one hoist site") the threshold read forward. Under the new text the two
sentences appear to count the same thing and disagree: the decision already ships three hoists, so
the trigger's stated threshold is already exceeded on the day it is written. It is recoverable from
the first sentence — the condition is *a second JSON-only field*, and "two hoists" means two hoisted
fields, not two call sites — but a re-evaluation trigger has to be readable as a condition someone
could later observe firing. As written, a reader checking "are we at two hoists yet?" answers yes
immediately.

**Change that resolves it.** Say *"A second hoisted **field** is where an explicitly named envelope
type (`JsonEnvelope<T>`) becomes cheaper than repeating the hoist"*, so the noun matches the trigger
condition above it and cannot be read against the three sites.

### F-04 (Low, Local) — the re-baselining leaves one message string stale

`assertAdditiveOnly`'s length assertion carries the message *"delta over baseline must be exactly the
two new members"* (`loop-distribution.test.js:76`). K-8's re-baselining makes `added` a
single-member list, so the message misdescribes the failure it reports for all four call sites. No
oracle weakens — the assertion itself is `actual.length === baseline.length + added.length` and stays
exact — but a wrong failure message costs the next debugger real time, and it belongs in the same
edit K-8 already owns. Worth one clause in K-8's list.

## Questions

| ID | Question |
|----|---------|
| Q-01 | Does `pdlc/workflows/__tests__/coverageInstrumentation.test.js`'s P9-02 test belong to K-3 as a *conjunct to be added* or as a *site already pinning at HEAD*? K-3 currently reads both ways: it says the literal "gains the same module" (site, live now) and that the two conjuncts are "both to be added in this change and routed to TSPEC §6.4" (new work). At HEAD the P9-02 test is live and array-equal over six entries, so the literal edit is a co-change of an existing oracle, and only the c8-run driver's third import is new. Splitting those two halves in K-3's text would also settle F-01's table question mechanically. |
| Q-02 | The third residual now says the P7-02 document oracle greps two member-count *sentences*, not `PK-*` rows, so a counts-only edit that omits `PK-26` stays green — accurate at HEAD. Given K-7 is a single owning task that writes the row and the counts together, is the residual still worth carrying, or has it shrunk to "one task could be done half-way", which is true of every task? I lean toward keeping it, because the sibling document is frozen and the failure is silent, but the row would read stronger if it said what a DoD reviewer should actually *look at* (the §5.4 table's last row id) rather than what the oracle does not cover. |

## Positive Observations

- **The v2 High was resolved by measuring, not by hedging.** The revision could have added a table
  row and moved on. Instead it wrote *"The sixth site, and why it was missed on the first
  measurement"* and named the mechanism — the assertions that pin an enumeration's size live in a
  different package from the enumeration, so a per-file scan never reaches them. That paragraph is
  what makes the same defect findable next time, and it is why F-01 above is a Medium about one
  remaining instance rather than a High about a missing guard.
- **Every re-measured figure in the delta holds at HEAD.** `MODULE_NAMES` is exactly the four entries
  the site table claims (`prepack.mjs:20-25`); `loop-distribution.test.js` has four live tests and no
  `.skip`; `assertAdditiveOnly`'s third conjunct is a length equality, not containment; the vendored
  count is pinned twice, once literally (`:158-162`) and once derived (`:203-207`); `pdlc/engine/lib`
  holds exactly 15 `.mjs` files, so B's *"the `15` in that arithmetic is B's own class term"* is
  correct and B really does pay the sixth site.
- **K-8 chose the harder and correct shape.** Re-baselining rather than widening the delta is the
  right answer to v2's Q-01: `D1_BASELINE` at HEAD is `pdlc-engineering-loop`'s *pre*-state, and
  simply appending `lib/stats.mjs` to `NEW_LIB_MEMBERS_*` would silently rewrite that completed
  feature's frozen measurement into something it never measured. Folding its two members into the
  baselines and making `added` this feature's single member keeps each constant meaning what its name
  says. That is a subtle call and the document made it explicitly rather than by default.
- **The word-map obligation is the kind of coupling that usually ships as a surprise.** `:187`'s
  `vendoredClassSize === 5 ? "five" : String(vendoredClassSize)` greps for the *digit* at 6 while K-7
  writes the *word*, so K-7 landing exactly as specified would red K-8's file. Catching a
  cross-obligation red before PLAN exists — and stating it in both rows, K-7's *"the prose target is
  the word 'six'"* and K-8's *"K-7 landed exactly as specified would leave this oracle red"* — is
  precisely the work a DECISIONS document is for.
- **The K-7 precedent claim was softened to what the source actually says.** The 0.15 changelog row
  really does end *"`tspecPackedCount`'s vendored-class literal moves separately, in a later task"*
  (`docs/completed/pdlc-engine-distribution/TSPEC-…md:32`), and K-7 now says this feature bundles
  *more tightly* than that precedent rather than claiming the precedent for its own bundling. A
  citation corrected against the cited file, in the direction that weakens the author's own case.
- **The third residual now describes a real gap.** It went from asserting the document half has no
  falsifier — false at HEAD, and the kind of statement that sends a DoD reviewer past the one guard
  that exists — to naming the guard, quoting its own comment, and narrowing the residual to
  `PK-26`'s row, which the sentence-level grep genuinely does not see.
- **PM Q-02 was answered against FSPEC, not asserted.** BR-30's closing sentence reads *"the error
  object is a released shape under REQ R-5 and BR-24's increment rule governs it as it governs the
  success document"* (`FSPEC-pdlc-stats.md:527-528`), and the three-key set is stated there too. The
  DECISIONS quote is verbatim and the conclusion — K-5's scope covers all three emitted documents —
  follows from it.

## Recommendation

**Approved with minor changes**

The v2 blocking finding is fully resolved and the resolution is stronger than the change I asked for:
the site is in the table, it has an owning obligation with the re-baselining shape spelled out, the
cross-obligation word-map red is named on both sides, and the residual that asserted a false absence
now describes the real one. Nothing in this document is unowned or unfalsifiable, and no High finding
is open.

The four remaining findings are documentary and none blocks. F-01 is the one worth landing before
PLAN: the site table and the trigger paragraph disagree about whether this feature touches six files
or seven, and the file they disagree about — `coverageInstrumentation.test.js` — is the fifth site's
pinning test, the same relationship site 6 has to the four enumerations. The obligation is safe
because K-3 owns it explicitly; the cost table is what needs the seventh row. F-02 is one word
("Six" → "Seven") in K-8's own list, F-03 one noun in DEC-STATS-02's trigger, F-04 one clause in
K-8's edit list. All four are local edits with no decision consequence.

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 2}
