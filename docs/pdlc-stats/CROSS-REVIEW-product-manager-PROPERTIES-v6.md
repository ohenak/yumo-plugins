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

## Standards applied to the changed material

The three standards I hold every round — no implementation echoes, no absence-only oracles,
completeness by set-equality — have no new surface to bite on this round: the revision changed no
property, no oracle and no fixture. I re-confirmed that by diff rather than by assumption
(`git diff 1be839ea8 HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` touches only the four prose
regions above). The v1.2 material that satisfied those standards in round 5 — PROP-ERR-10's
hand-transcribed reason catalogue, PROP-RATIO-11's paired positive/negative assertion on the same
path, PROP-RATIO-05's literal regex — is unchanged and stands.

Scope compliance: the revision added no product behaviour, no new property and no new claim about
what the feature must do. It corrected repository-status prose only. There is no scope creep here
to flag, and nothing REQ or FSPEC requires was narrowed or dropped — the property count and the
per-level distribution are untouched.

## Delta-Confirmation Findings

No findings.

## Questions

| ID | Question |
|----|---------|
| Q-01 | The table's column header reads "Test file (status at HEAD)" while rows for files that *are* present at HEAD still read `(new)`. The preamble now defines `(new)` as provenance rather than absence, so the document is internally consistent and I raise no finding — but the header and the cell vocabulary pull in different directions for a reader who skips the preamble. Worth a wording pass at harvest, not now. |

## Positive Observations

- **The fix was measured, not narrated.** The preamble does not assert wave 9 ran; it states the
  method (`git ls-files --error-unmatch` over PLAN's File Ownership Manifest), the population
  (all sixteen new files) and the three commit anchors. Every one of those reproduced for me
  exactly. A status claim that carries its own reproduction recipe is the version that stays true
  — or fails loudly — after the next wave.
- **The round widened the fix to the defect's real boundary.** Both reviewers named the preamble.
  The author also found and fixed §Subject under test's stale "absent at HEAD" premise, which
  neither of us had flagged, and said in the changelog why leaving it would have contradicted the
  corrected preamble. Fixing the class rather than the instance is what stops this finding
  recurring in v1.4.
- **Nothing else moved.** In a frozen round, restraint is a feature. The diff is 34 added and 13
  removed lines across four prose regions, with zero property, oracle, fixture or trace churn, so
  the round-5 verification of that material carries forward intact and this confirmation is cheap
  to trust.
- **The erroneous count was corrected in place rather than erased.** Marking v1.2's "ten of the
  fifteen" as wrong, in the v1.2 entry, preserves the audit trail that makes the revision history
  worth keeping.

## Recommendation

**Approved**

Both halves of the v5 High finding are fixed exactly as requested and verified against HEAD: the
preamble states wave 9 has run with three correct commit anchors, and T-18's status cell carries
`(present at HEAD, 9a3a70fd9)`. No open High finding remains anywhere in the document — mine or
the software engineer's. The revision introduced no defect, contradicts nothing in the repository
at HEAD, and touched no property, oracle, fixture or trace. Q-01 is non-blocking and belongs to
harvest.

DEFERRED: replace the per-row `(new)` / `(present at HEAD, {sha})` mix in §PLAN tasks with a single
dated "status measured at commit X" line above the table, so the table does not need re-truing
after every implementation wave (carried from v5 Q-01; software-engineer v5 raised the same on
T-11's row).
DEFERRED: reconcile the §PLAN tasks column header "status at HEAD" with rows that read `(new)` as
provenance rather than absence (Q-01).

## Verdict

VERDICT: Approved
{"high": 0, "medium": 0, "low": 0}

APPROVAL-HASH: sha256:02fc6fbf76cb68d3510e0cf2a58ffbb9ddcb8b75c858312ae9ce5addc72f1531
APPROVAL-HASH-NORMALIZED: sha256:63fc8529055ba49ade526ef8be0a64ab8af3f26c2fa4e2a9cd2d17778ff04f48
REVIEWED-COMMIT: 359874bb1adbf8438a8b0e0982844b9afc5ba953
UPSTREAM-STATE: REQ sha256:f75c348f299ebff8518b590f64668d054587c0c9d4d7ba442477e6fdfa7a8862
UPSTREAM-STATE: FSPEC sha256:a493133f67150b27020b10d05cd676a505e172f0b89082a208ce8198a3137f5d
UPSTREAM-STATE: TSPEC sha256:7b119eb7fa68475db641e2c244a3b9c10b742b2310d0079ccbb137d9e6d3e85e
UPSTREAM-STATE: DECISIONS sha256:ca3f7219e1acaefe3024bb3a6da78d844b7c1d992213af3f84e4086437b7b5cc
UPSTREAM-STATE: PLAN sha256:6ab4d08138f8ae90875a5c8c65961c5e14747865128aeb8b9676b55840610a7a
