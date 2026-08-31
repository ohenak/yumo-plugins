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
