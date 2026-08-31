# Cross-Review: product-manager — DECISIONS

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.2)
**Date:** 2026-08-31
**Iteration:** 3

Delta re-review. Diffed `3e4780c8a` (the commit carrying my v2 cross-review) to HEAD: the document
moved across six commits, `da99bbffb` → `06277f5d1`, +73/−16 lines. I re-read my v2 findings first,
diffed the document, verified every new factual claim against the tree at HEAD, and scanned only the
changed sections for new issues. Sections untouched by the revision and approved in v2 are not
re-litigated.

## Prior findings disposition

| v2 finding | Severity | Status | Evidence |
|---|---|---|---|
| F-01 — a sixth co-change site (`loop-distribution.test.js`) missing from option A's cost table, and one of its assertions goes red | High | **Resolved** | The site table gains a sixth row; the option table's cell moves *five* → **six**; a new subsection explains the miss; K-8 owns the obligation; K-1 names it as the conjunct that reds first. All four asks landed |
| F-02 — the third residual asserted the absence of an oracle that exists at HEAD | High | **Resolved, and correctly narrowed** | The row now states the real gap — `PK-26`'s existence *as a row* — and points at P7-02 for the count half. Verified: the oracle's two regexes match member-count **sentences** (`names the vendored ${word}`, `\*\*${word} vendored workflow members\*\*`, `loop-distribution.test.js:194-201`), never the `PK-*` rows above them, so a counts-only edit is green exactly as the row claims |
| F-03 — K-7's "exactly as that document's 0.15 row records" overstated the precedent | Low | **Resolved** | K-7 now says "by the same versioned route … **bundled more tightly than 0.15 was**", and quotes the split clause it originally elided |

Both gating findings are closed on the evidence, not on assertion. The revision also went further than
I asked in two places that were right calls: it re-derived the trigger's list count (six → eleven) and
restated K-3's conjunct as array-equality.

## Verification of the revision's new claims against HEAD

Every new claim the revision makes, checked against the tree rather than against the prose:

| Claim | Where | Verified |
|---|---|---|
| `loop-distribution.test.js` is **live** at HEAD — four un-`skip`ped tests | Sixth-site subsection | Confirmed. The file's own header comment still says *"Every block below is committed `test.skip`"*, but `loop-distribution.test.js:91,135,182,226` are four bare `test(` calls. The document's claim is right and the file's comment is stale |
| `assertAdditiveOnly` is not containment-only; its last assertion is a set-size equality | Sixth-site subsection | Confirmed at `loop-distribution.test.js:75-79`: `assert.equal(actual.length, baseline.length + added.length, …)`. The *"both-directions-lite"* quote is verbatim (`loop-distribution.test.js:63`) |
| The additive-only test applies it to `prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`, `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS` and `fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES` | Sixth-site subsection | Confirmed, four call sites at `loop-distribution.test.js:137,145,153,166` |
| **Six assertions** in that file pin the four enumerations and the count K-2 moves | Cost table, sixth row | Confirmed: four `assertAdditiveOnly` calls + `assert.equal(tspecPackedCount(…), 4 + 15 + 5 + 1, …)` (`:159-163`) + the derived `assert.equal(vendoredClassSize, 5, …)` (`:204-208`) = six |
| The document oracle derives rather than transcribes | K-7 falsifier | Confirmed at `loop-distribution.test.js:186-187`: `tspecPackedCount({licence:false}) - (4 + 15 + 1)`, then the word is derived from it |
| **Eleven** hand-written lists across **seven** files; ten distinct member facts; `D1_BASELINE` and `D5_BASELINE` hold identical content | DEC-STATS-01 re-evaluation trigger | Confirmed. Both baselines are `["orchestrate-dev.js", "orchestrate-queue.js"]` (`loop-distribution.test.js:55,61`). The arithmetic and the dedup note are both right |
| `c8.include` is asserted with **array**-equality, position-sensitive | K-3 | Confirmed: `coverageInstrumentation.test.js:266` is `expect(include).toEqual([…])` against the seven `**/`-anchored entries in `pdlc/workflows/package.json`. Array-equality is strictly stronger than set-equality, as K-3 now says |
| FSPEC BR-30 makes the error object *"a released shape under REQ R-5"*, key set exactly `schemaVersion`, `error`, `feature`, governed by BR-24's increment rule | DEC-STATS-02, PM Q-02 answer | Confirmed verbatim at `FSPEC-pdlc-stats.md:517-528`. The Q-02 answer is an accurate reading of the FSPEC, not a new product decision — which is the right disposition |
| The re-baselining shape: the four enumerations are at `pdlc-engineering-loop`'s **post**-state at HEAD, so the baselines must absorb its two `lib/` members | K-8 | Confirmed: `prepack.mjs:20-25` holds four entries including both `lib/` members, while `D1_BASELINE` holds the pre-state two. The prescribed shape is the correct one |

Eleven claims checked, eleven hold. What did not hold is a claim of *completeness* the revision
inherits rather than makes — see F-01.

## Findings

| ID | Severity | Scope | Finding | Requirement ref |
|----|----------|-------|---------|----------------|
| F-01 | High | Cross-Feature | **A seventh co-change site is missing, and it is the same class of miss as v2's F-01 — one round later.** `pdlc/engine/__tests__/run.test.js` is live (no `test.skip` anywhere in it) and transcribes the vendored member list **three** times, all of which move when `lib/stats.mjs` joins `MODULE_NAMES`: (1) `run.test.js:117-122` — `assert.deepEqual(names, ["lib/escalation-view.mjs", "lib/loop-session.mjs", "orchestrate-dev.js", "orchestrate-queue.js"])` over `runPrepack`'s manifest, with its own comment stating the intent as *"Set-equality, not `length > 0` (§5.3): a prepack that silently vendored nothing, **or vendored a third file**, must still fail this assertion"* — so a fifth file reds it by design; (2) `run.test.js:247-252` — the copy list that stages `scratchWorkflows` for the process-entry prepack run, which, left at four, makes the real `runPrepack` throw `ENOENT` on the missing `lib/stats.mjs` and reds `assert.equal(result.status, 0, result.stderr)` at `run.test.js:257`; (3) `run.test.js:270-277` — a second `assert.deepEqual` over the same four names for the process-entry manifest. That file appears in **no** row of DEC-STATS-01's cost table and is owned by **no** `K-*` row, so the document's headline cost is understated for the second consecutive round, and — the sharper problem — the same is true of option B, C and D's cells, since `run.test.js` fences `MODULE_NAMES` itself and every option that adds a vendored module pays it. The product consequence is the one v2's F-01 named: the required `Engine tests (ubuntu-latest)` check goes red on a change no obligation predicted, and REQ O-2's "this REQ requires only C-5's outcome" reasoning rests on a measured cost that is still not measured. This is *not* a request for a ninth K-row bolted on after a third file turns up. The document itself already wrote the durable lesson — *"an enumeration's co-change set includes the tests that pin the enumeration's size"* — and then applied it to exactly one file instead of sweeping for all of them. **Fix:** run the sweep once and cite it (`grep -rln "escalation-view" pdlc/engine/__tests__/ pdlc/workflows/__tests__/` yields exactly one further enumeration-fencing file beyond the six already listed — `run.test.js`; `loop-cli.test.js` and the `pdlc/workflows/` hits are ordinary module consumers, not enumerations); add `run.test.js` as a seventh row with its three lists named; move the option-A cell to **seven** edit sites and add the site to B and C's cells too; correct the re-evaluation trigger's count from eleven lists across seven files to **fourteen across eight**; and state in K-8 (or a K-9) that the owning task covers *both* test files, since they red on the same commit. | REQ O-2, REQ C-5 |
| F-02 | Medium | Local | **K-8's re-baselining silently narrows an existing conjunct, and K-8 does not say so.** K-8 prescribes that `NEW_LIB_MEMBERS_BARE` become *"this feature's single member (`lib/stats.mjs`, bare …)"*. But that constant is consumed by two tests, not one. Beyond the additive-only test K-8 discusses, `loop-distribution.test.js:108` loops over it in conjunct (a), the importability test, which for each member reads its bytes from the temp vendor tree **and `await import()`s it** (`:113-117`) — the conjunct whose own comment exists because *"a manifest-only or enumeration-only assertion passes while `ERR_MODULE_NOT_FOUND` still fires on an installed engine"*. Re-baselining as prescribed leaves that loop running over `lib/stats.mjs` alone, so `loop-session.mjs` and `escalation-view.mjs` lose their `import()`-resolves-from-the-vendor-tree proof. Nothing else replaces it: `run.test.js:124-130` and `:279-283` check the vendored **bytes** and `existsSync` for those two, never `import()`. The test stays green, so no oracle reports the loss — this is precisely the shape the third residual was rewritten to stop doing. Note this does *not* apply to conjunct (d), which derives `postFixMembers` from the live `WORKFLOW_MEMBERS` (`loop-distribution.test.js:227-231`) and so keeps its coverage automatically; the asymmetry is worth naming because it shows the right shape. **Fix:** have K-8 prescribe that conjunct (a)'s loop iterate the *full* post-state member set (e.g. `[...D1_BASELINE_LIB_MEMBERS, ...NEW_LIB_MEMBERS_BARE]`, or derive it from `prepackNs.MODULE_NAMES`), and state explicitly that importability must remain proved for all three `lib/` members, not just this feature's. | REQ C-5 |
| F-03 | Medium | Local | **K-8's edit count says six; its own list enumerates seven.** *"Six assertion edits in all: the three baselines, the two `added` lists, `tspecPackedCount`'s `4 + 15 + 5 + 1` → `4 + 15 + 6 + 1`, and the derived `assert.equal(vendoredClassSize, 5, …)` → `6`"* — that is 3 + 2 + 1 + 1 = **seven**. The itemised list is correct and complete (each of `D1_BASELINE`, `D2_D3_BASELINE`, `D5_BASELINE`, `NEW_LIB_MEMBERS_BARE`, `NEW_LIB_MEMBERS_VENDORED` is a distinct declaration at `loop-distribution.test.js:49-61`; `D1_BASELINE` and `D5_BASELINE` hold identical *content* but are two edits); only the headline number is wrong. The likely cause is a collision with the cost table's **six assertions** — a different and correctly-counted quantity in the same document about the same file. K-8 is a DoD checklist: a reviewer counting seven items against a stated six will reasonably conclude one is redundant and drop it. Two of the seven (`D1_BASELINE`, `D5_BASELINE`) are the pair that *looks* redundant and is not. **Fix:** say **seven**, and add the half-sentence that `D1_BASELINE` and `D5_BASELINE` are separate declarations with identical content — the same dedup note the re-evaluation trigger already makes correctly. | REQ O-2 |
| F-04 | Medium | Local | **DEC-STATS-02's re-evaluation trigger now contradicts the reversibility line directly above it, because this round's edit moved one and not the other.** The revision changed *"One constant and one hoist site"* to *"One constant and **three** hoists in one function"*. Two lines later the trigger reads *"A second JSON-only field appears. **Two hoists** is where an explicitly named envelope type (`JsonEnvelope<T>`) becomes cheaper than repeating the hoist."* The word "hoists" now carries two different referents in adjacent sentences — hoist *sites* above, hoisted *fields* below — and on the surface reading the threshold has already been passed at design time, which would mean the decision should be re-evaluated toward `JsonEnvelope<T>` before a line of it is written. The whole point of a re-evaluation trigger is that a future reader can tell whether it has fired; this one cannot be read that way as written. **Fix:** restate the threshold in the unit the first sentence uses — *"a second JSON-only **field**; two such fields is where an explicitly named envelope type becomes cheaper than repeating the hoist"* — so it is unambiguous that today's three hoist sites of one field do not fire it. | REQ R-5 |
| F-05 | Low | Local | **K-8 prescribes the value edits but not the provenance edits they invalidate.** Re-baselining repurposes constants whose header comment (`loop-distribution.test.js:44-48`) binds them to a *different* feature's spec: *"TSPEC §7's shared delta, transcribed once, here, exactly as its D-1…D-6 table names the two new members"*. After K-8, `NEW_LIB_MEMBERS_*` holds `pdlc-stats`'s member and no longer transcribes that table, while the comment still says it does. Two assertion messages go stale the same way: `loop-distribution.test.js:78` (*"delta over baseline must be exactly the two new members"*, which will be one) and `:162` (*"vendored class size must be 5"*, whose literal K-8 moves to 6 without mentioning the message). None of this is load-bearing on a check, which is why it is Low — but the document's own K-6 rationale is that stale restatement across documents is a defect generator, and this is that pattern inside a file K-8 owns. **Fix:** add a clause to K-8 covering the constants' provenance comment and the two message strings. | REQ O-2 |

## Questions

| ID | Question |
|----|---------|
| Q-01 | On F-01: is the sweep worth promoting to `docs/_constraints/DOMAIN-CONSTRAINTS.md` **now**, in this feature, rather than at harvest? The document already proposes the constraint text — *"an enumeration's co-change set includes the tests that pin the enumeration's size"* — and this is the second round in which a per-file reading of the enumeration holders missed a test that fences them. A constraint that arrives at harvest does not protect this feature's own PLAN, which is where the miss would next cost something. |
| Q-02 | On F-02: once conjunct (a) iterates the full post-state set rather than this feature's delta, is `NEW_LIB_MEMBERS_BARE` still the right name for what it holds? The re-baselined shape means the file has one constant that is a *delta* (used by the additive-only test) and one derivation that is a *post-state* (used by importability). Naming them apart now is cheap; the next feature to grow this class will re-baseline again and inherit whichever ambiguity is left behind. |

## Positive Observations

- **Both gating findings closed by going back to the tree, and one closed better than I asked.** On
  v2 F-02 I asked for the third residual's inverted premise to be corrected. The revision did that and
  then did the harder thing: it re-measured what P7-02 actually greps, found that the oracle covers the
  *count* half but not the `PK-26` *row*, and wrote the residual at that narrower boundary — including
  an explicit note that the first draft *"would have sent a DoD reviewer past the one guard that
  exists"*. A residual that names its own previous error is more useful to the next reader than one
  that quietly reads correctly.
- **K-8's re-baselining is the right shape, and the reason it gives is the right reason.** Widening
  the delta to three members would have made `NEW_LIB_MEMBERS_*` a running accumulation that every
  future feature appends to and nobody prunes. Re-baselining keeps the constant meaning "this
  feature's delta" and keeps `assertAdditiveOnly`'s length equality strict. The justification — the
  four enumerations are at the sibling's post-state at HEAD — is verifiable in one command and is
  correct (`prepack.mjs:20-25`). F-02 above asks K-8 to carry one more consequence of that shape; it
  does not ask for a different shape.
- **The word-map coupling is a genuinely good catch, and it is the kind that only comes from
  reading the file.** Spotting that `vendoredClassSize === 5 ? "five" : String(…)` greps the *digit*
  at 6 while K-7 writes the *word*, and that K-7 landed exactly as specified would therefore leave the
  oracle red, is a defect that would otherwise have surfaced as a mystery CI failure two tasks later.
  Naming the coupling in both K-7 and K-8 — *"one change or the check is red"* — is exactly how a
  decision record should hand an ordering constraint to a PLAN author.
- **The trigger's count correction moved in the direction that costs the author something.** Six →
  eleven makes DEC-STATS-01's own chosen option look more expensive, and the revision made it anyway,
  with the arithmetic shown and the dedup caveat stated. The added sentence — that understating the
  lists *"understates the payoff that decides whether anyone acts on this trigger"* — is the right
  product framing for why a re-evaluation trigger's numbers have to be honest.
- **K-3's set-equality → array-equality correction is a real strengthening, not a wording change.**
  `expect(include).toEqual([…])` is position-sensitive, so "append at the same index in both files"
  is an instruction an implementer needs and would not have derived from "set-equal". Catching that
  the shipped assertion is *stronger* than the document claimed — and saying so — is the harder
  direction to catch.
- **The PM Q-02 answer stayed in its lane.** It resolves the question by reading FSPEC BR-30 rather
  than by deciding anything new, and says so outright (*"Nothing in this decision changes on the
  answer"*). Verified verbatim against `FSPEC-pdlc-stats.md:517-528`. That is the correct disposition
  for a question whose answer already lives upstream.

## Recommendation

**Needs revision**

One High finding gates. The three decisions themselves remain right calls — F-01 raises option A's
measured cost from six sites to seven, but options B and C pay the same seventh site (`run.test.js`
fences `MODULE_NAMES` itself, which every vendoring option moves), so the comparison and the verdict
are unchanged. What is wrong is the *record* of the cost and the *completeness* of the obligations,
for the second consecutive round on the same axis.

Exactly what to change:

1. **F-01 (High, gating).** Add `pdlc/engine/__tests__/run.test.js` as a seventh site with its three
   transcribed lists named (`run.test.js:117-122`, `:247-252`, `:270-277`); move option A's cell to
   seven and add the site to B's and C's cells; correct the re-evaluation trigger to fourteen lists
   across eight files; extend K-8 (or add K-9) so one owning task covers both test files. Cite the
   sweep that produced the number, so the next reader can tell completeness was established
   mechanically rather than by another file turning up.
2. **F-02 (Medium, non-gating).** Have K-8 keep conjunct (a)'s importability loop over the full
   post-state member set, so `loop-session.mjs` and `escalation-view.mjs` do not silently lose their
   `import()` proof.
3. **F-03 (Medium, non-gating).** K-8's edit count is seven, not six; note that `D1_BASELINE` and
   `D5_BASELINE` are two edits with identical content.
4. **F-04 (Medium, non-gating).** Restate DEC-STATS-02's trigger threshold in *fields*, not *hoists*,
   so it does not read as already fired against the reversibility line above it.
5. **F-05 (Low, non-gating).** Have K-8 cover the constants' provenance comment and the two stale
   assertion messages.

Unchanged and not re-reviewed: DEC-STATS-01's chosen option and its Context section, DEC-STATS-03 in
full, K-2, K-4, K-5, K-6, the *What these decisions do not decide* section, and the relationship to
project-level decisions.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 3, "low": 1}
