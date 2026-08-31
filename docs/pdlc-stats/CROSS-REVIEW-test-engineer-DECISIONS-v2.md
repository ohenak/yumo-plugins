# Cross-Review: test-engineer — DECISIONS

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/DECISIONS-pdlc-stats.md` (v1.1)
**Date:** 2026-08-31
**Iteration:** 2

## Scope

Delta re-review against `CROSS-REVIEW-test-engineer-DECISIONS-v1.md`. Diffed
`07bf532e9..HEAD` on the document: six commits, all revision-driven. I verified each v1 finding is
resolved, then scanned only the changed sections for new issues. Unchanged sections already
approved in v1 were not re-litigated. Every claim below was re-measured against the tree at HEAD.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | High | Cross-Feature | **`pdlc/engine/__tests__/loop-distribution.test.js` is a mandatory sixth co-change site that the document names nowhere, and the new Residuals table's third row asserts the opposite of HEAD: the sibling-document half *does* have an oracle (`loop-distribution.test.js:182`), and it is pinned to `5` in three places plus a word-map that demands `6`, not `six`.** | Residuals — obligations with no oracle at HEAD, row 3; K-1; K-7; DEC-STATS-01 site table |
| F-02 | Medium | Local | **The re-evaluation trigger's "six hand-written lists" enumeration is short by four.** `loop-distribution.test.js`'s `D1_BASELINE`, `D2_D3_BASELINE`, `D5_BASELINE` and `NEW_LIB_MEMBERS_*` are transcribed member lists too, so the trigger understates what deriving-from-a-listing would have to change. | DEC-STATS-01, *Re-evaluation triggers*, first bullet |
| F-03 | Low | Local | **K-3 describes the P9-02 declared conjunct as "set-equal … in both directions"; the shipped assertion is `toEqual` on an array, which is order-sensitive.** A correct-set/wrong-position edit is red. | Consequences, K-3, *Declared* |

Scope legend: `Local` — this artifact only. `Cross-Feature` — a testing constraint that outlives this
feature. `Process` — a skill/checklist gap.

## Disposition of v1 findings

| v1 | Severity | Status | Evidence at HEAD |
|----|----------|--------|------------------|
| F-01 | High | **Resolved** | K-3's Falsified-by now names two conjuncts that exist as real, extensible test shapes. Both are HEAD facts, not aspirations: `coverageInstrumentation.test.js`'s P9-02 test asserts `pkg.c8.include` `toEqual` a transcribed literal (`...REQUIRED_INCLUDES, CAPTURE_SCRIPT_INCLUDE`, plus the two `lib/` modules), and the second P9-02 test spawns a real c8 run whose driver `import()`s `lib/loop-session.mjs` and `lib/escalation-view.mjs` so an `allow-external` bare-basename entry that resolves to nothing is caught by the `json-summary` rather than by a string comparison. Adding `stats.mjs` to both is exactly the co-change K-3 now obliges, and the omission is red in both directions. **My v1 F-01 was partly mis-measured** — I read `REQUIRED_INCLUDES`' containment check and missed the set-equality test below it. The obligation the revision landed is right regardless, and it is now anchored to the assertions that carry it |
| F-02 | Medium | **Resolved** | The Option D paragraph now states the measured position: `document-oracles.mjs` is in none of the four vendoring enumerations **and in no coverage include set** — true, `c8.include` is the seven `**/`-anchored entries and it is not among them. The corroborating citation resolves: `docs/completed/pdlc-engineering-loop/PLAN-…md:64` does say the include list is four-entry and `lib/document-oracles.mjs` is **not** in it. The added two-axes paragraph (reachability decides vendoring; include membership is an independent edit) is the distinction I asked for, and it now sharpens the rejection rather than supplying a false precedent |
| F-03 | Medium | **Resolved** | DEC-STATS-03's trigger now carries a named detector — a purity conjunct calling each classifier twice in a fresh module instance, asserting deep-equal and non-aliased results — and states plainly why the identity oracle and the recording double are both blind to the trigger's arrival. Routed to TSPEC §6.4 as an erratum rather than restated as a rule (correct under K-6), with the interim gap listed as an explicit residual |
| F-04 | Medium | **Resolved** | K-4's disposition is no longer "review-blocking finding". It is a construction-site count conjunct: read `bin/cli.mjs`'s source, assert the four-classifier object literal occurs **exactly once**, inside `statsParsers` — occurrences counted, not "at least one". The precedent cited is real and is exactly this shape: `pdlc/engine/__tests__/bin-guard-structure.test.js` pins `bin/pdlc.mjs` at zero static import declarations (`:278`), exactly three non-comment top-level statements (`:284`) and zero `await` tokens (`:290`) |
| F-05 | Low | **Resolved as written, but see F-01** | K-1 now says four of five and hands the fifth (`c8.include`) to K-3, stating the two rows partition the set. The partition is stated correctly over the sites the document enumerates; F-01 is that the enumeration itself is one site short |
| F-06 | Low | **Resolved** | The threshold now reads "a **fourth** runtime-reachable member added after `stats.mjs`" and names the detector. Both halves check out: `prepack.mjs:20-25`'s `MODULE_NAMES` has exactly four entries, of which exactly two are `lib/` members (`lib/loop-session.mjs`, `lib/escalation-view.mjs`), so `stats.mjs` is the third and `MODULE_NAMES.length` exceeding five is the right trip-wire |

Q-01 and Q-02 from v1 were both answered in the revision (K-5's `SCHEMA_VERSION` scope stands as
TSPEC §6.3's; the `docs/completed/` literals are declared as *measurements of the archive*, and that
convention is now cited in the third residual's mitigation rather than left implicit).

## Detail

### F-01 (High, Cross-Feature) — the sixth co-change site, and a residual that is false at HEAD

The revision added a Residuals table whose third row reads:

> **The sibling feature's document edits (K-7)** have no mechanical falsifier … *nothing compares a
> shipped enumeration to a completed feature's prose table* … **Accepted.** Building that oracle is
> a repo-wide mechanism, not this feature's scope.

That oracle already exists. `pdlc/engine/__tests__/loop-distribution.test.js:182` is a test named
*"P7-02: `docs/completed/pdlc-engine-distribution/` TSPEC §5.4, FSPEC §5.2 and AT-3.8b agree with
`tspecPackedCount`'s vendored class size"*, and its header comment states the intent verbatim:
*"a test-time document-oracle conjunct, never a review-time obligation … derived from the live
constant, never compared against a literal transcribed here."* It reads the two completed-feature
documents off disk and regex-matches their member-count sentences against the class size it derives
from `tspecPackedCount`. The sibling PLAN row that commissioned it (`PLAN-pdlc-engineering-loop.md`,
P7-00) says so in as many words: *"The open window is now closed by an oracle, not by argument."*

So the residual's premise is inverted. This matters in the expensive direction rather than the
cheap one: the document half is not unguarded, it is **rigidly** guarded, and the guard is pinned
against this feature.

**The file is a co-change site, and it is not in the five-site table.** Every one of the five
enumerations DEC-STATS-01 obliges is fenced by that one test file, with strict-length assertions:

| Guard at HEAD | What it pins | Effect of adding `stats.mjs` |
|---|---|---|
| `assertAdditiveOnly(prepackNs.MODULE_NAMES, D1_BASELINE, NEW_LIB_MEMBERS_BARE)` (`:137`) | `actual.length === baseline.length + added.length` (`:74-78`) — 2 + 2 | fails: length 5 ≠ 4 |
| `assertAdditiveOnly(publishPreflightNs.WORKFLOW_MEMBERS, D2_D3_BASELINE, NEW_LIB_MEMBERS_VENDORED)` (`:145`) | 3 + 2 | fails: 6 ≠ 5 |
| `assertAdditiveOnly(packedSetNs.WORKFLOW_MEMBERS, …)` (`:153`) | 3 + 2 | fails: 6 ≠ 5 |
| `assertAdditiveOnly(fixtureMachineNs.WORKFLOW_MODULE_NAMES, D5_BASELINE, NEW_LIB_MEMBERS_BARE)` (`:166`) | 2 + 2 | fails: 5 ≠ 4 |
| `assert.equal(tspecPackedCount({licence:false}), 4 + 15 + 5 + 1, "vendored class size must be 5")` (`:159-163`) | K-2's literal | fails on the `5 → 6` move K-2 obliges |
| `assert.equal(vendoredClassSize, 5, …)` (`:204-208`) | same, derived | fails identically |

`assertAdditiveOnly` is not containment-only — its own comment says *"both-directions-lite"* and its
last assertion is the length equality. This is a well-built oracle doing precisely its job: it was
written so a later feature cannot quietly widen the vendored class. This feature is that later
feature, and the decision document does not know it exists.

**The word-map makes K-7 and this test contradictory as written.** Line 187 computes
`vendoredClassWord = vendoredClassSize === 5 ? "five" : String(vendoredClassSize)`. At a class size
of 6 the two regexes become `names the vendored 6` and `\*\*6 vendored workflow members\*\*`.
K-7 obliges the sibling documents to move *"five → six"* — the word. Land K-7 exactly as specified
and this oracle is still red, because it will be looking for the digit. Either the ternary is
extended to carry a number-word map, or K-7's prose target must match what the oracle greps for.
The document currently specifies neither, and nothing in DECISIONS, TSPEC or FSPEC mentions the file
(`grep -c loop-distribution` returns 0 in all three).

**Why High rather than Medium.** Three distinct claims in the document are false or incomplete
because of it, and two are load-bearing for phases downstream:

1. The **cost basis of the chosen option** is understated. DEC-STATS-01's differentiator table says
   option A costs *"five edit sites"* and opens with *"Every cost below was measured against the
   tree at HEAD, not estimated"*. The measured cost is six files, one of which needs six separate
   assertion edits. That is still nowhere near enough to unseat A — B and C remain disqualified on
   *"Coverage gate (verified): **none**"* — so the **decision does not change**, only its arithmetic.
2. **K-1's partition claim is falsely complete.** *"The two rows partition the set rather than
   overlapping"* is exactly the property I asked for in v1 F-05, and it is now stated over a set
   that is missing a member. A PLAN author reading K-1 and K-3 as a partition will build the
   co-change task set from them and ship a wave that reds the `Engine tests (ubuntu-latest)`
   required check — `loop-distribution.test.js` sits in `pdlc/engine/__tests__/`, so `npm test` in
   `pdlc/engine` runs it.
3. The **residual is accepted on an inverted premise**, and residuals are explicitly written to be
   inherited: *"Named here so PLAN and the DoD reviewer inherit them as known risks."* A DoD
   reviewer told the document half has no falsifier will not go looking for the one that does, and
   the failure it would have caught — sibling tables left at five — is the exact failure K-7 exists
   to prevent.

**The Cross-Feature tag.** The durable lesson is not about `pdlc stats`: it is that *an
enumeration's co-change set includes the tests that pin the enumeration's size*. Four of the five
sites here are guarded by strict-length additive-only oracles in a **different package** from the
files they guard, so a per-file scan of the five sites never reaches them. That belongs in
`docs/_constraints/DOMAIN-CONSTRAINTS.md` alongside DC-14, not in this feature's LEARNINGS only.

**Change that resolves it.** Three edits, all local to this document:

- Add `pdlc/engine/__tests__/loop-distribution.test.js` to DEC-STATS-01's co-change site table as
  the sixth site, with the six assertions named, and move option A's "five edit sites" to six.
- Give it an owning row — either widen K-1 to six sites or add K-8 — and state the word-map
  obligation so K-7's `five → six` prose and the oracle's expected token cannot disagree.
- Replace the third residual. The document half **is** oracle-covered; what remains genuinely
  unguarded is narrower and worth stating honestly: the oracle checks the two member-count
  *sentences*, not that `PK-26` exists as a row in TSPEC §5.4, so a `PK-26`-less edit that moves
  only the counts would still be green.

### F-02 (Medium, Local) — the "six hand-written lists" count is short by four

The first re-evaluation trigger now enumerates *"what this trigger would change"* as six hand-written
lists: `prepack.mjs`'s `MODULE_NAMES`, `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`,
`fixture-machine.mjs`'s `WORKFLOW_MODULE_NAMES`, `_tspec-packed-set.mjs`'s `WORKFLOW_MEMBERS`,
`c8.include`, and `coverageInstrumentation.test.js`'s expected include literal. All six are real and
correctly described. But `loop-distribution.test.js:49-61` holds four more transcribed member lists —
`NEW_LIB_MEMBERS_BARE`, `NEW_LIB_MEMBERS_VENDORED`, `D1_BASELINE`/`D5_BASELINE`, `D2_D3_BASELINE` —
and they are transcriptions of exactly the same membership facts. A trigger whose remedy is *"derive
from a directory listing at pack time"* has to say what stops being transcribed; understating that
by four lists understates the payoff the trigger is supposed to buy, which is the one number that
decides whether anyone acts on it. Same root cause as F-01, different paragraph, so I file it
separately: fixing F-01's site table does not by itself correct this sentence.

The rest of the bullet is exact and worth keeping: K-1's *"derived rather than transcribed"* really
does describe only the `vendoredClassSize === MODULE_NAMES.length + 1` count conjunct, and the
member arrays really are all literals.

### F-03 (Low, Local) — "set-equal … in both directions" is order-sensitive in the shipped assertion

K-3's *Declared* conjunct says the P9-02 test asserts `c8.include` *"**set-equal** to a transcribed
literal, in both directions"*. The shipped assertion is
`expect(include).toEqual([...REQUIRED_INCLUDES, CAPTURE_SCRIPT_INCLUDE, …])` — array equality, so
position-sensitive, strictly stronger than set-equality. The obligation K-3 states is unaffected
(omission is red either way), and the direction claim is right. The reason it is worth a word: the
implementer adding `**/pdlc/workflows/lib/stats.mjs` must append it at the **same index** in both
`package.json` and the test literal, and a reader who trusts "set-equal" will read a green-looking
diff that reds. One clause — "array-equal, so the new entry's position must match in both" — closes
it.

## Questions

## Positive Observations

## Recommendation

## Verdict
