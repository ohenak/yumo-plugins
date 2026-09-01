# Cross-Review: product-manager — PROPERTIES (delta confirmation)

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 6
**Round type:** delta confirmation of the v1.3 status-correction round (+34 / −13 lines)

## Overview

This is a frozen confirmation round over a narrow, single-purpose revision. v1.2 → v1.3 is
three commits (`5db3218a9`, `c5725fe88`, `359874bb1`) touching four regions and nothing else:
the front-matter revision history, the v1.2 changelog paragraph's wrong count, §Subject under
test's stale "absent at HEAD" premise, and §Coverage Matrix → PLAN tasks (preamble plus T-18's
status cell). `git diff 1be839ea8 HEAD` confirms **no property, oracle, fixture, trace or
coverage row changed** — the material both reviewers verified against code in round 5 is
byte-identical, so nothing previously approved is re-litigated here.

The round discharges the one High finding filed identically by both reviewers (product-manager
F-01, software-engineer F-01): that the preamble asserted wave 9 had not run and that
`statsRealPaths.test.js` was absent. Both halves were false at HEAD. I re-measured every claim
the revision now makes rather than reading the changelog's account of them.

## Verification of the delta

**F-01 (v5) is discharged, and discharged by measurement rather than by softening.** The preamble
(`PROPERTIES-pdlc-stats.md:530-540`) no longer claims wave 9 is unrun. It now states that every
new file PLAN's File Ownership Manifest declares is tracked — "all sixteen, the fifteen new test
files plus `pdlc/workflows/lib/stats.mjs`" — and names the three wave-9 commits. I checked each
claim independently:

- All sixteen manifest-declared new files pass `git ls-files --error-unmatch` at HEAD. The
  manifest (`PLAN-pdlc-stats.md:160-180`) carries exactly sixteen rows marked `new`; removing
  `stats.mjs` leaves fifteen test files, so the document's arithmetic is right, not merely
  plausible.
- Wave 9's three files and their anchors are exact. `git log --diff-filter=A` gives
  `statsRealPaths.test.js` → `9a3a70fd9`, `statsProperties.test.js` → `ca8031311`,
  `stats-vendoring.test.js` → `1846a8a96` — the three commits the preamble cites, each the
  *adding* commit rather than a later touch.
- T-18's status cell (`:558`) now reads `(present at HEAD, 9a3a70fd9)`, matching the form T-09
  and T-10 already used. This was the second half of my requested fix, and it landed verbatim.

**The §Subject under test correction is a real repair, not collateral.** v1.2 said
`pdlc/workflows/lib/stats.mjs` "is absent at HEAD" and that `FLAGS_BY_COMMAND` carries no `stats`
row. Both were false and both are now stated in the past tense with anchors (`:78-86`).
`stats.mjs` was indeed introduced by `308afef94` (confirmed by `--diff-filter=A`; note the commit
carries a docs-shaped message, an implementation-history oddity, not a documentation defect), and
`FLAGS_BY_COMMAND`'s fifth row `stats: ["json", "cwd"]` sits at `pdlc/engine/bin/cli.mjs:190`
exactly as cited, under a `const FLAGS_BY_COMMAND = {` opened at `:169`. Fixing this alongside
the preamble was correct: leaving it would have put two contradictory present-tense status claims
in one document, which is the same defect class F-01 named.

**The one inherited status claim I could falsify is true.** T-09's row (`:552`) still qualifies
itself with "the symbolic-link leg PLAN v1.2 adds is not yet in it". Grepping
`pdlc/engine/__tests__/stats-cli.test.js` for `symlink` / `symbolic` / `lstat` returns nothing, so
PROP-RATIO-11's shipped-seam evidence is genuinely still outstanding and the row says so. That
honesty is what makes the table usable for scoping remaining work — the exact consumer F-01 was
misdirecting.

**The changelog corrects itself rather than quietly dropping the error.** The v1.2 entry's "ten of
the fifteen files" is not deleted; it is marked wrong and pointed at v1.3 (`:41-46`). A reader
reconstructing the round history is told the count was wrong, not shown a clean record that never
was. That is the right call for a document whose value is traceability.
