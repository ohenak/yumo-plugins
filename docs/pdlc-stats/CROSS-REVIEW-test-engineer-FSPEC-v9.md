# Cross-Review: test-engineer — FSPEC (delta re-review)

**Reviewer:** test-engineer
**Document reviewed:** `docs/pdlc-stats/FSPEC-pdlc-stats.md` (v1.6)
**Upstream:** `docs/pdlc-stats/REQ-pdlc-stats.md` (v1.4)
**Date:** 2026-08-31
**Iteration:** 9 (delta re-review, decision freeze)
**Scope:** Local

## Delta Under Review

`git diff 324873d16..HEAD -- docs/pdlc-stats/FSPEC-pdlc-stats.md` — 19 insertions, 7 deletions
across exactly three sites, no oracle deletions:

| Site | Change | Answering |
|---|---|---|
| Changelog (v1.6 entry) | New paragraph recording the two carried findings | — |
| BR-16 | The `docs/completed/pdlc-advisory-wave-gate/` citation is narrowed to the malformed *basename shape*; the directory's own verdict (measured ratio) is stated explicitly | TE v7 F-02 |
| AT-15 | The neither-list gains a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file, plus a *Then* clause that a `CROSS-REVIEW-*` glob into the process total fails here | TE v7 F-03 |

No BR text outside BR-16 moved; no AT body outside AT-15 moved; §7.3, §8's EC→AT block, exit codes
and the JSON shape are byte-identical.

## Carried Findings — Resolution

**TE v7 F-02 (BR-16 borrowed a real directory's verdict, not just its shape) — resolved.**
BR-16 now reads: "That basename shape is cited from `docs/completed/pdlc-advisory-wave-gate/`, which
carries two of them **alongside** grammar-matching cross-reviews and so reports a measured ratio
itself; only the shape is borrowed, not the verdict." Checked against HEAD: the directory holds
58 basenames matching BR-14's `CROSS-REVIEW-{role}-{doc-type}[-v{N}].md` grammar over BR-09's six
types, two `CODE_REVIEW-pdlc-advisory-wave-gate-v{1,2}.md`, two post-mortems (`POSTMORTEM-{D,T}-…`),
all six spec documents, and `LEARNINGS-pdlc-advisory-wave-gate.md`. Both harvest-deleted process
families are non-empty, so BR-16's harvested predicate is false and the spec total is non-zero —
the directory does report a measured ratio, exactly as BR-16 now says. The corrected reading is
sound and the sentence no longer invites an implementer to build a `harvested` fixture out of a
directory that is not one. The count is wrong (F-01 below); the verdict claim is right.

**TE v7 F-03 (BR-16's no-bytes half was unpinned) — resolved, and resolved with a falsifiable
oracle.** AT-15's *Given* now carries a `CROSS-REVIEW-{role}-REVIEW-v{N}.md` file on the neither
list, and its *Then* states the consequence positively and negatively on the same path: the totals
still equal the literal sums of their nine members, adding the out-of-catalogue cross-review leaves
both unchanged, and "an implementation that globs `CROSS-REVIEW-*` into the process total fails
here". That is the mutation this AT previously could not kill. Two properties I checked
specifically:

- **Not an absence-only oracle.** "Its bytes reach neither side" is asserted alongside the positive
  arithmetic (both totals equal literal sums; each removal moves its side by exactly that file's
  size), on the same fixture and the same run — the negative rides on a positive.
- **Set-equality, not containment, is preserved.** The added file lands on the *neither* list, so
  the "nine" in "removing any one of the nine changes its side's total" is untouched (six BR-14 spec
  documents + three process families = nine, still correct). The removal probe — the clause that
  makes AT-15 set-equality rather than containment — is unchanged and still marked non-skippable.
- **No implementation echo.** The expected values stay literal sums over a constructed fixture; the
  AT names files, not code paths, and derives no expectation from the driver.

AT-17's fourth directory (`CODE_REVIEW` files intact plus only out-of-catalogue `CROSS-REVIEW-`
basenames) still pins BR-16's *harvested* half, so the two halves of the agreement claim are now
pinned by two different tests on two different fixtures. That is the right split.

## Findings

| ID | Severity | Scope | Finding | Section ref |
|----|----------|-------|---------|------------|
| F-01 | Medium | Local | BR-16 says `docs/completed/pdlc-advisory-wave-gate/` "carries two of them". At HEAD it carries **four** out-of-catalogue cross-reviews: `CROSS-REVIEW-product-manager-REVIEW-v{1,2}.md` and `CROSS-REVIEW-test-engineer-REVIEW-v{1,2}.md`. The load-bearing half of the sentence (alongside grammar-matching cross-reviews, so it reports a measured ratio) is correct and verified; only the count is false. No oracle reads the count — AT-15 and AT-17 both use constructed fixtures — so nothing breaks, but a reader auditing the citation against the tree finds the document wrong about the tree. One-word fix: "two" → "four", or drop the count. | §4.2, BR-16 |
| F-02 | Medium | Local | §8's BR→AT trace row still reads `BR-16 \| AT-17`, but AT-15's *Then* now asserts BR-16 explicitly ("so an implementation that globs `CROSS-REVIEW-*` into the process total fails here (BR-14, BR-16)"). The delta added the assertion without adding the trace edge, so the trace table no longer set-equals the ATs that pin BR-16. This matters downstream: PROPERTIES and PLAN derive test tasks from §8, and a te-author reading only the table would not know AT-15 carries half of BR-16's agreement claim. Fix: `BR-16 \| AT-15, AT-17`. Compare BR-14, whose row was already `AT-15`. | §8, BR→AT table |
| F-03 | Low | Local | Carried unresolved from v8 F-01 (§7.3 was not touched by this delta). E-5's "FSPEC sites that stand unchanged" column reads `BR-27, AT-19`. AT-19 pins the exclusion set (BR-23/BR-26/EC-10), not the zero-state row; the oracles standing behind E-5 are **AT-26** (EC-03's trace target) and **AT-20**, as §8's own `BR-27 \| AT-20, AT-26, AT-27` row already says. Record-keeping only, no behaviour turns on it. | §7.3, row E-5 |

DEFERRED: AT-15's neither-list now carries four distinct shapes — consider asserting it as a set (all four present leaves both totals unchanged) rather than relying on the singular "adding a file on neither list"; extra coverage, not a defect, out of scope for a frozen round.

## Questions

None. The delta is self-contained and every claim it makes is checkable against the tree.

## Positive Observations

- **The fix for F-03 (v7) chose the harder and better option.** The easy resolution would have been
  a sentence in BR-16 asserting that out-of-catalogue bytes reach neither side. Instead AT-15 gained
  a fixture member and a named mutation ("globs `CROSS-REVIEW-*` into the process total"), which is
  the difference between a rule that is stated and a rule that can fail a test. The mutation is
  concrete enough to hand to a mutation-testing run as-is.
- **The two halves of BR-16's agreement claim are now pinned separately.** AT-15 pins "these bytes
  are not in the numerator"; AT-17's fourth directory pins "these files do not count as remaining".
  Splitting them across two fixtures means an implementation that conflates the two — the exact
  failure BR-16 warns about — cannot pass both.
- **The BR-16 rewrite is honest about its own citation.** Saying "only the shape is borrowed, not
  the verdict" of a real directory that reports the opposite outcome is precisely the discipline a
  spec citing live repository state needs, and it is what stopped this round from shipping a
  fixture built on a false premise. The count slip in F-01 is the residue of a good instinct.
- **Zero oracle churn elsewhere.** No AT was deleted or weakened, the nine-member arithmetic is
  intact, the non-skippable removal probe survived, and the neither-list grew without disturbing the
  set-equality property that makes AT-15 load-bearing.

## Recommendation

**Approved with minor changes**

Both carried findings are resolved, and resolved with falsifiable oracles rather than prose. I
re-verified BR-16's directory citation and AT-15's arithmetic against HEAD; the behaviour the delta
describes is the behaviour the repository exhibits. Two Medium findings are recorded and neither
gates: F-01 is a wrong count inside a citation whose substantive claim I verified as true, and F-02
is a missing trace edge that the AT body already carries in prose. No High finding is open anywhere
in the document. Both are single-token fixes that can be folded into the next touch of this file.

## Delta-Confirmation Findings

| ID | Severity | Provenance | Locality | Finding | Section anchor |
|----|----------|-----------|----------|---------|----------------|
| F-01 | Medium | delta | local | BR-16 says the cited directory "carries two of them"; at HEAD it carries four out-of-catalogue `CROSS-REVIEW-{role}-REVIEW-v{N}.md` files. The measured-ratio claim itself is verified true. | §4.2, BR-16 |
| F-02 | Medium | delta | local | §8's BR→AT row `BR-16 \| AT-17` omits AT-15, whose *Then* now asserts BR-16 explicitly. | §8, BR→AT table |
| F-03 | Low | inherited | nonlocal | §7.3 row E-5 cites AT-19; the oracles behind it are AT-26 and AT-20, as §8's BR-27 row states. Carried from v8 F-01, untouched by this delta. | §7.3, row E-5 |

FINDING: Medium | delta | local | §4.2 BR-16 | citation says the advisory-wave-gate directory carries two out-of-catalogue cross-reviews; it carries four
FINDING: Medium | delta | local | §8 BR→AT table | BR-16's trace row omits AT-15, which now asserts BR-16 in its Then clause
FINDING: Low | inherited | nonlocal | §7.3 row E-5 | cites AT-19 instead of AT-26/AT-20 as the oracles standing behind the zero-state row

## Verdict

VERDICT: Approved with minor changes
{"high": 0, "medium": 2, "low": 1}
