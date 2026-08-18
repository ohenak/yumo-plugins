# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.6)
**Date:** 2026-08-17
**Iteration:** 6
**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria fidelity.

## v5 findings disposition

Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v5.md`; `git diff 92ae9145..HEAD` on the
TSPEC (99 insertions / 25 deletions, one file) scanned for new issues. Unchanged sections already
approved are not re-litigated.

| v5 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved as written, then overtaken upstream** | v0.6 stops asserting the relaxed clause *is* AT-1.3 and routes it instead: §5.5's new second paragraph says plainly "This TSPEC does **not** restate AT-1.3 as if it already tolerated that skip. It *proposes* narrowing the clause … and routes the proposal upstream as §6.1 erratum 9" (TSPEC:815–818), and erratum 9 lands at TSPEC:1020–1032 with an owner (FSPEC) and a requested edit. That is exactly the change v5 asked for. It has since been overtaken: FSPEC accepted and folded erratum 9 in at v0.7, 2026-08-18 (`FSPEC-pdlc-plugin-retirement.md:838`–`:843`), so the "not yet landed" framing v0.6 now carries is stale in the opposite direction — see F-01 and F-02 below. |
| F-02 | Low | **Resolved** | §5.2's TT-1b now distinguishes the two files correctly: "both from the registration API `helpers/driftCapabilities.js` … the on-disk sink those records land in is `helpers/skipSink.js`" (TSPEC:738). Matches HEAD — `itOrSkip` is exported from `driftCapabilities.js:324`, `KNOWN_CAPABILITY_KEYS`/`validateSkipRecords` from `skipSink.js:55`/`:118`. |
| Q-01 | — | **Answered** | Erratum 9 states the collision predates the sweep because `SKIP_INVENTORY` already carries ten `uid-nonroot` entries (TSPEC:1025–1026). Verified at HEAD: `driftCapabilities.js:94`–`:121` holds exactly ten `capability: "uid-nonroot"` records. |
| Q-02 | — | **Answered** | §5.5's orphan universal ranges over `*.js` under `helpers/`, and TT-1b's inventory edit is placed in §2.9's class-3 row (TSPEC:861–864), so the criterion and the file it touches land in the same commit. |

Changed regions in this round: the version/lineage header, §2.6's class-3 row in the change table,
§5.2's TT-1b, all of §5.5's skip discussion (rewritten and roughly tripled), §5.5's orphan-oracle
scope rules (three → four), and §6.1's new erratum 9. Scanning those regions surfaces two High
findings, both from the same cause — the upstream moved between v0.5 and v0.6 and the TSPEC's
account of AT-1.3 did not follow it — plus one Medium and one Low.

## Findings

## Questions

## Positive Observations

## Recommendation
