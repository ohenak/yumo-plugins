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
