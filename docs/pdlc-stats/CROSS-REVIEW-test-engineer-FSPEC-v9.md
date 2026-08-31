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
