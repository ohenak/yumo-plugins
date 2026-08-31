# Cross-Review: test-engineer — TSPEC (upstream-cascade confirmation)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/TSPEC-pdlc-stats.md` (v1.2, erratum round 3)
**Upstream at dispatch:** REQ `sha256:60a516fb…f1c9`, FSPEC `sha256:0b8864d6…17b0` — both re-verified
against the working tree, both match.
**Date:** 2026-08-31
**Iteration:** 4 (delta confirmation)

## Summary

Every routed item landed, and the two that mattered most landed well. §4.3's BR-11 and BR-16
paragraphs are re-grounded on FSPEC v1.4 and are now a faithful compression of it — I diffed both
against FSPEC lines 296–302 and 342–356 and the TSPEC no longer asserts a divergence the upstream
closed. §8.3's three settled bullets are gone and FSPEC §7.3 does record them closed, so the removal
is grounded rather than asserted. v3's F-03 is resolved by the right mechanism: the boundary fixture
is no longer a local invention with a vacuous predicate but AT-17's fourth leg, and §6.1's new
paragraph explains why that leg and AT-12's third are not archive baselines — a distinction a later
reader would otherwise have to rediscover.

The nine-site correction is the substantive win. §2.1 now separates five enumerations (six symbols
across five files, because `_tspec-packed-set.mjs` holds two) from four test files that pin them,
and every one of the nine checks out against the tree: `publish-preflight.mjs`'s `WORKFLOW_MEMBERS`
plus its `LIB_MODULES_AT_HEAD` (12) / `LIB_MODULES_FROM_THIS_FEATURE` (3) pair really is 15, so
option B's "15 → 16, held twice" is exact; `learningsPremises.test.js`'s P-1 really is a `toEqual`
over the parsed `MODULE_NAMES` under the title "exactly the four canonical workflow modules";
P9-02's shipped assertion really is `toEqual`, so the "position matters" note is earned. RK-1's
first-red ordering is right too — `assertAdditiveOnly`'s length equality is at HEAD and fires before
this feature's own oracle exists.

Three things stop this being a clean confirmation. One is a High and it is in the new material:
§6.4's classifier-purity oracle adds a **non-aliasing** conjunct over *all four* driver classifiers,
but §3.2 types `deriveDodRoundIndex` as returning a `number`, and two calls returning the same
integer are `===`. As specified the oracle reds against a correctly pure implementation, and the
obvious repair — dropping non-aliasing — would delete the only mechanism this round added to close
`DEC-STATS-03`'s trigger. The other two are enumeration gaps: the sweep the section now calls
authoritative returns a tenth site the table omits, and the `loop-distribution.test.js` row's
"seven assertion edits" misses an eighth edit the D-4 document oracle requires.

None of these touches a type, a signature, an `if` chain, an exit code or a traceability row. All
three are repairable inside §2.1 and §6.4 without reopening anything approved.

## Design

**The purity conjunct is the right idea, specified one word too broadly.** §6.4's new oracle reads:
"each of the four driver classifiers, called **twice with the same input inside one freshly-imported
module instance**, returns results that are `deepEqual` **and non-aliased** (the second result is not
the same object reference as the first, so a memoised return is distinguishable from a recomputed
one)". §3.2 types the four as `ReviewParse`, `RoundWindow`, `ResolvedMarker` — objects — and
`deriveDodRoundIndex(basenames, feature): number`. I checked the driver: `orchestrate-dev.js:12384`
ends `return max + 1`, a primitive. For that classifier `first !== second` is false whenever the
function is correct, so the conjunct as written is a guaranteed red on a pure implementation. This is
the F-01 finding, and the repair is small and stated in **Recommendation**.

The wider point is why the broad phrasing is dangerous rather than merely wrong. An implementer
TDDing §6.4 writes the conjunct, watches it red on one of four classifiers, and the cheapest way out
is to weaken the conjunct to `deepEqual` alone across the board. That passes, and it also passes
against a memo table — which is precisely the state `DEC-STATS-03`'s "the driver exports gain state"
trigger names and which the paragraph beneath the table correctly says every other conjunct here is
structurally blind to. The oracle would survive as a shape and die as a detector, silently. Scoping
the conjunct in the spec is what prevents that; leaving it to the implementer's judgement at red-test
time is what invites it.

**The fresh-instance requirement is correct and worth keeping verbatim.** The paragraph's reasoning —
a module-level cache populated by an earlier test in the same worker makes the first call itself a
cache hit, so the conjunct passes vacuously — is exactly right, and it is the kind of vacuity that
would never surface as a failure. Keep it; it applies to all four classifiers including the
number-returning one.

**The construction-site count oracle is well-grounded.** "The four-classifier object literal occurs
**exactly once** … a set-equality over occurrences, not an 'at least one'" is the correct shape:
an at-least-one probe cannot detect the second construction site that voids the parser-identity
oracle. The cited precedent is real — `pdlc/engine/__tests__/bin-guard-structure.test.js` does pin
`bin/pdlc.mjs` to zero static imports, three top-level statements and zero `await` tokens in
comment-stripped source, and it ships a comment/string-aware tokeniser to do it. Naming that file
tells the implementer to reuse the tokeniser rather than reach for a naive `String.match`, which
would count the literal inside a comment. Nothing to add.

**§6.4's header count is consistent.** "Seven" matches the table: parser identity, doc-type
catalogue, exclusion set, vendoring co-change, classifier purity, construction-site count, no-write
capability.

**The vendoring row's coverage arithmetic checks out.** "Covers four of the nine directly and a fifth
(`c8.include`) by way of `coverageInstrumentation.test.js`" is right: the four directly-asserted
sites are `prepack.mjs`, `publish-preflight.mjs`, `fixture-machine.mjs` and `_tspec-packed-set.mjs`,
and the remaining four of the nine are the pinning tests themselves, which cannot be covered by an
oracle because they *are* the oracles. The row's demotion from "the exact failure" to "not the first
thing that reds" is honest and matches HEAD.

## Seams

No seam moved this round. `StatsIo`'s four keys, `StatsParsers`'s four members, the injection
rationale in §2.5 and the no-write oracle are byte-identical to the approved v1.1 text, and I
re-read them only to confirm the purity oracle does not implicitly widen the bundle. It does not:
the oracle is asserted over the same four exports the identity oracle already covers, at the same
production construction site (`statsParsers()` in `bin/cli.mjs`), so it adds a property to an
existing seam rather than a seam.

One seam-adjacent observation supports F-01 rather than standing alone. §6.4's purity row says the
recording double of §6.1 "wraps the real parsers and would silently inherit the shared state rather
than expose it". That is correct and it is the reason the oracle must run against a freshly-imported
*driver* module and not through `fakeStatsIo` or the recording double — the double is transparent to
exactly the state being hunted. The TSPEC says this; I flag it only because an implementer reading
§6.1 first might reach for the double out of habit, and the sentence that forbids it lives in §6.4.
A cross-reference from §6.1's double description back to §6.4's purity row would close that, but it
is a readability nicety, not a finding.

## Data structures

Unchanged and still faithful. `ReviewParse`, `RoundWindow` and `ResolvedMarker` are transcribed
correctly from the driver, and the two load-bearing details §3.2 calls out — `deriveRoundWindow`
returning early on a collision without a `skipped` array, and `not_cross_review` being BR-06's "not
a cross-review at all" bucket — still match `orchestrate-dev.js` at HEAD.

The only data-structure-relevant change is the one F-01 turns on: `deriveDodRoundIndex`'s `number`
return type was already in §3.2 at approval and is unchanged, so the purity conjunct's overreach is
a delta-side error, not an upstream drift. §3.2 is the document that already holds the fact the new
§6.4 text contradicts, which is why the repair is local to §6.4 and needs no type edit.

## Verification

I re-derived the sweep the section now calls authoritative rather than trusting the count.
`git grep -l 'lib/loop-session.mjs'` over the tracked tree returns 42 paths. Filtering to sites that
*enumerate the class or pin its size* — dropping this feature's own docs, sibling-feature history,
`loop-cli.test.js` (two comment references, no enumeration), `pdlc/workflows/dist/pdlc-cli.mjs` (two
comment references in generated output), and the ten `pdlc/workflows/__tests__/loop*.test.js` files
that merely import the module — leaves the nine §2.1 lists **plus one**: `pdlc/README.md:231`.

That line reads "The **four** workflow modules it dispatches (`orchestrate-dev.js`,
`orchestrate-queue.js`, `lib/loop-session.mjs`, `lib/escalation-view.mjs`) are vendored into the
package at pack time". It enumerates the class by name *and* states its size, which is exactly the
membership criterion §2.1 declares ("enumerated — or its size pinned"). Adding `lib/stats.mjs`
makes both halves false. I checked for a falsifier: `documentOracles.test.js` reads
`pdlc/README.md` three times but only for `workflows/dist/` mentions, seam-count prose absence and
the deletion class; `learningsDisclosure.test.js`'s LI-DOC-05 checks feature-surfacing, not member
counts. Nothing pins this sentence, so it goes stale in silence — the failure mode RK-1 exists for,
one site further out than RK-1 currently reaches. This is F-02.

I then re-derived the `loop-distribution.test.js` row edit-by-edit against the file. Five constants
(`NEW_LIB_MEMBERS_BARE`, `NEW_LIB_MEMBERS_VENDORED`, `D1_BASELINE`, `D2_D3_BASELINE`,
`D5_BASELINE`), the `4 + 15 + 5 + 1` literal in the additive-only test, and the D-4 document
oracle's `assert.equal(vendoredClassSize, 5, …)` — that is the row's seven. The eighth is two lines
above that assertion: `const vendoredClassWord = vendoredClassSize === 5 ? "five" : String(…)`.
Once the sibling FSPEC §5.2 moves to "**six** vendored workflow members" and `tspecPackedCount`
derives 6, the unedited ternary yields the string `"6"`, and the oracle's
`` new RegExp(`\\*\\*${vendoredClassWord} vendored workflow members\\*\\*`) `` fails to match the
word "six". The D-4 oracle reds — loudly, and for a reason that names itself, so this is not silent
— but an implementer working the §2.1 checklist to completion still lands red. This is F-03.

`assertAdditiveOnly`'s length equality is listed as an edit and is in fact derived
(`baseline.length + added.length`), so it needs no change; only its failure message ("must be
exactly the two new members") goes stale. Listing it is harmless over-inclusion and I raise nothing
on it — the row's error is under-counting, not over-counting.

Two smaller verifications, both clean. The `coverageInstrumentation.test.js` row's "the shipped
assertion is `toEqual`, i.e. array-equality, so position matters" is confirmed at
`coverageInstrumentation.test.js:264-272`. The `run.test.js` row's "omission reds as an `ENOENT` or
a set mismatch" is consistent with the manifest `deepEqual`s and the `prepack` process-entry leg.
And the cross-check the round's ordering claim rests on holds: `run.test.js` sits in `Engine tests
(ubuntu-latest)` and `learningsPremises.test.js` in `Unit tests (ubuntu-latest, node 20)`, so a
partial edit really does red on either side of the package boundary.

Upstream fidelity, checked directly rather than inferred. FSPEC BR-11 at HEAD states the version-
grammar condition and names both leftover shapes; §4.3's paragraph is a faithful compression with no
residue of the deleted divergence. FSPEC BR-16 states the condition over BR-14's grammar, adds
"evaluated over exactly the file set BR-14's numerator sums", and names the
`docs/completed/pdlc-advisory-wave-gate/` shape — all three are what §4.3 now says it says. AT-12's
third directory and AT-17's fourth leg exist in FSPEC §6.4/§6.6 with the wording §4.3 and §6.1 quote,
including AT-17's "`CODE_REVIEW` files intact", which is the conjunct v3's F-03 asked for. FSPEC §7.3
opens "The three harvested-predicate errata this section carried are **closed**", which grounds
§8.3's deletion. Nothing the TSPEC cites has moved or now says something different.

## Risks

RK-1's rewrite is an improvement and I want to record why, because the residue sentence is the part
that matters. Naming `publish-preflight.mjs`'s production-side copy as unreachable by a
`__tests__/`-scoped sweep, and naming `loop-distribution.test.js`'s `assertAdditiveOnly` as what
reds first, both turn a vague "co-change is risky" row into two checkable claims — and both check
out. The new residue sentence is honest in the way that is hard to be: `PK-26`'s existence row in
the sibling TSPEC's table genuinely has no mechanical falsifier, only the *count* half does via the
D-4 document oracle, and saying so beats implying oracle coverage the design does not have.

F-02 is the same residue class one site further out, which is why I file it as a finding rather than
a note. `pdlc/README.md`'s member list has no falsifier either, and unlike `PK-26` it is not
acknowledged anywhere — not in §2.1's table, not in RK-1's residue sentence, not in §7's cost
paragraph. An unlisted un-falsified site is worse than a listed one: `DEC-STATS-01`'s `K-7` gives
`PK-26` a single owning task, and there is nothing analogous to own the README line.

I considered and rejected raising RK-1's rewrite as understating the purity oracle's risk. It does
not: RK-1 is scoped to vendoring co-change, and `DEC-STATS-03`'s trigger is a DECISIONS-owned
re-evaluation trigger, not a TSPEC risk row. §6.4's paragraph is the right home for it and it is
there.

## Recommendation

**Needs revision** — one High, both of the others cheap. No behavioural claim, type, signature, code
sketch, `if` chain, key set, exit code or traceability row needs to move.

1. **§6.4, classifier-purity row and the paragraph beneath it (F-01).** Scope the non-aliasing
   conjunct to the three classifiers §3.2 types as returning objects — `parseReviewFilename`,
   `deriveRoundWindow`, `parseResolvedMarker` — and say why: `deriveDodRoundIndex` returns a
   `number` (`orchestrate-dev.js:12384`, `return max + 1`), so two equal results are `===` and the
   conjunct would red against a correct implementation. Then give the number-returning classifier
   its own state detector rather than dropping it to `deepEqual`-only, which detects nothing: call
   it **A, B, A** within the same fresh module instance and assert the third result equals the
   first. That is red against an accumulating ledger or an order-dependent memo — the shape a
   primitive return can actually acquire — and it keeps `DEC-STATS-03`'s trigger closed for all
   four. Keep the fresh-module-instance requirement and its vacuity rationale unchanged; it applies
   to all four.
2. **§2.1's site table and the paragraph above it, §7's cost paragraph, RK-1 (F-02).** Add
   `pdlc/README.md` as a tenth in-repo site (symbol: the "four workflow modules it dispatches"
   sentence's member list and its count word; edit: add `lib/stats.mjs`, four → **five**), and move
   the counts from nine to ten in the four places the round just synchronised. Because nothing pins
   that sentence, extend RK-1's residue sentence to name it alongside `PK-26` — or, better, give it
   the same treatment `PK-26` got and route it to a `DEC-STATS-01` owning task, so the one site with
   no falsifier is not also the one site with no owner.
3. **§2.1's `loop-distribution.test.js` row (F-03).** Add the `vendoredClassWord` ternary
   (`vendoredClassSize === 5 ? "five"` → `6 ? "six"`) to the row's symbol list and correct "Seven
   assertion edits" to eight. Optionally note that `assertAdditiveOnly`'s length equality is derived
   and only its failure message goes stale, so the row does not over-promise an edit that is not
   one.

If the §6.4 repair lands as described, I expect this green in one pass. The purity oracle is the
right instrument and I would rather see it scoped than weakened.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Description | Section anchor |
|----|----------|-----------|----------|-------------|----------------|
| F-01 | High | delta | local | §6.4's new classifier-purity oracle asserts that "each of the four driver classifiers … returns results that are `deepEqual` **and non-aliased** (the second result is not the same object reference as the first)". §3.2 types `deriveDodRoundIndex` as returning a `number`, and `orchestrate-dev.js:12384` confirms it (`return max + 1`). Two calls returning the same integer are `===`, so the non-aliasing conjunct is a guaranteed red against a correctly pure implementation on one of the four. The cheapest repair at red-test time — weakening the conjunct to `deepEqual` alone across all four — passes against a memo table too, deleting the only mechanism this round added to close `DEC-STATS-03`'s "driver exports gain state" trigger, and doing so silently. Scope non-aliasing to the three object-returning classifiers and give `deriveDodRoundIndex` an A-B-A same-instance oracle (third result equals the first) so an accumulating ledger or order-dependent memo is still detectable. Keep the fresh-module-instance requirement for all four. | §6.4 (classifier-purity row; "The purity conjunct closes `DEC-STATS-03`'s trigger" paragraph); §3.2 |
| F-02 | Medium | delta | local | §2.1 now declares its nine "sweep-derived, not hand-counted", by `git grep -l` for `lib/loop-session.mjs` "repo-scoped rather than `__tests__/`-scoped". Run as specified, that sweep also returns `pdlc/README.md:231` — "The **four** workflow modules it dispatches (`orchestrate-dev.js`, `orchestrate-queue.js`, `lib/loop-session.mjs`, `lib/escalation-view.mjs`) are vendored into the package at pack time" — which enumerates the class by name and states its size, the exact membership criterion §2.1 declares. Adding `lib/stats.mjs` falsifies both halves. No oracle pins it: `documentOracles.test.js` reads the file only for `workflows/dist/` mentions, seam-count-prose absence and the deletion class, and `learningsDisclosure.test.js`'s LI-DOC-05 checks feature-surfacing, not counts. So the site is both unlisted and unfalsified — worse than `PK-26`, which is at least named in RK-1's residue and owned by `DEC-STATS-01` `K-7`. Add it as a tenth site, move the counts in §2.1, §6.4's vendoring row, §7 and RK-1, and give it an owner or name it in RK-1's residue. | §2.1 (co-change table and the "sweep-derived" paragraph); §7; RK-1 |
| F-03 | Medium | delta | local | §2.1's `loop-distribution.test.js` row enumerates the re-baseline as "Seven assertion edits" and names five constants, `assertAdditiveOnly`'s length equality and the derived class-size assertion. An eighth edit is required and unlisted: the D-4 document oracle's `const vendoredClassWord = vendoredClassSize === 5 ? "five" : String(vendoredClassSize)`, two lines above the `assert.equal(vendoredClassSize, 5, …)` the row does name. Once the sibling FSPEC §5.2 moves to "**six** vendored workflow members" and `tspecPackedCount` derives 6, the unedited ternary yields `"6"` and the oracle's `new RegExp("\\*\\*" + vendoredClassWord + " vendored workflow members\\*\\*")` cannot match "six" — the D-4 oracle reds after a checklist-complete edit. Not silent, but it defeats the row's purpose as a co-change checklist. Add the ternary and correct the count to eight. (Separately, `assertAdditiveOnly`'s length equality is derived from `baseline.length + added.length` and needs no edit; only its failure message goes stale.) | §2.1 (`pdlc/engine/__tests__/loop-distribution.test.js` row) |
| F-04 | Low | delta | local | §2.1's `coverageInstrumentation.test.js` row names "P9-02's expected `c8.include` literal (and the real-c8-run driver …)" but not the test title it sits under — "the include set is exactly the **six** modules the feature owns, no more and no fewer" (`coverageInstrumentation.test.js:264`), which becomes seven. The parallel `learningsPremises.test.js` row does name its title ("its 'exactly four workflow modules' title"), so the omission is an internal inconsistency in how the two rows are specified rather than a new obligation. A stale title misdescribes a passing test; no assertion is affected. | §2.1 (`pdlc/workflows/__tests__/coverageInstrumentation.test.js` row) |

FINDING: High | delta | local | §6.4 (classifier-purity row and its paragraph) | The non-aliasing conjunct is asserted over all four driver classifiers, but §3.2 types `deriveDodRoundIndex` as returning a `number` (`orchestrate-dev.js:12384`), so two equal results are `===` and the conjunct reds against a correct pure implementation; the natural repair of dropping non-aliasing silently deletes the only detector closing `DEC-STATS-03`'s state trigger. Scope non-aliasing to the three object-returning classifiers and give the number-returning one an A-B-A same-instance oracle.
FINDING: Medium | delta | local | §2.1 (co-change table; "sweep-derived" paragraph; §7; RK-1) | The sweep §2.1 now declares authoritative also returns `pdlc/README.md:231`, which enumerates the vendored class and states its size ("four workflow modules … are vendored"); it is omitted from the nine and pinned by no oracle, so it goes stale in silence. Add it as a tenth site, move the four synchronised counts, and give it an owner or name it in RK-1's residue.
FINDING: Medium | delta | local | §2.1 (`loop-distribution.test.js` row) | "Seven assertion edits" omits an eighth: the D-4 document oracle's `vendoredClassWord` ternary (`=== 5 ? "five"`), which must move to `6`/"six" or the oracle reds after a checklist-complete edit because it matches the sibling FSPEC's word, not its digit.
FINDING: Low | delta | local | §2.1 (`coverageInstrumentation.test.js` row) | The row omits P9-02's "exactly the six modules the feature owns" test title (→ seven), while the parallel `learningsPremises.test.js` row does name its title; no assertion is affected.

## Verdict

VERDICT: Needs revision
{"high": 1, "medium": 2, "low": 1}
