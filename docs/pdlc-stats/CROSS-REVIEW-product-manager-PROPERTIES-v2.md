# Cross-Review: product-manager — PROPERTIES

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-stats/PROPERTIES-pdlc-stats.md`
**Date:** 2026-08-31
**Iteration:** 2

## Delta scope

Re-review of v1.1 against my `CROSS-REVIEW-product-manager-PROPERTIES-v1.md`. The diff reviewed is
`git diff 6f3be45e6..HEAD -- docs/pdlc-stats/PROPERTIES-pdlc-stats.md` — 37 insertions, 19
deletions across six commits (`108bb7c8f`, `fcb192ea3`, `ce8fd619f`, `e302679d3`, `ea4eb301e`,
`aa7e06626`). Changed sections: revision history, §Properties preamble, PROP-CLI-03, PROP-DISC-04,
PROP-DISC-08, new PROP-DISC-10, new PROP-ERR-10, §Oracles (exclusion-set row, new
reason-catalogue row), §Fixtures (`F-EXCLUDED-ONLY`, real-path `docs/` row), §Coverage Matrix (REQ,
FSPEC AT/EC, PLAN task, test-level distribution tables), §Gaps G-4. Sections outside this set were
approved in v1 and were not re-read.

### Prior findings — disposition

| Prior | Severity | Status at HEAD | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | PROP-DISC-10 added, `integration-fake`, with the positive outcome spelled out (same header line as a populated run, empty feature list, `features` set-equal `{}`, `unclassified` set-equal `[]`, both keys present, exit `0`) and a named falsifier (an implementation taking EC-09's root-failure branch fails). `F-EXCLUDED-ONLY` added under §Fixtures' constructed table carrying all eight names; matrix rows `EC-20 \| PROP-DISC-10` and `AT-18 \| …, PROP-DISC-10` repointed. Faithful to FSPEC EC-20 (`FSPEC-pdlc-stats.md:568`: "An empty report — a header and no feature rows — and exit 0") and to the fleet JSON shape (`FSPEC-pdlc-stats.md:758-759`: three top-level keys, `features` keyed by feature name). |
| F-02 | Medium | **Resolved and independently re-verified** | §Fixtures and §Oracles now read twenty-one directories / thirteen feature directories. Re-measured at HEAD: `ls -d docs/*/` = 21; eight excluded names present; the remaining thirteen each satisfy the artifact-naming witness (`docs/pdlc-stats/` included, six matching basenames of 66 files; `orchestrate-dev-workflow` 7/7; the other eleven 1/1). The "verified green at HEAD" warranty is now arithmetically true. |
| F-03 | Medium | **Resolved** | PROP-CLI-03 gained a verbatim conjunct on the `USAGE` line. The mechanism is grounded: `checkFlags` (`pdlc/engine/bin/cli.mjs:1012-1019`) writes `USAGE` to stderr before exiting 1, and `USAGE` at HEAD (`pdlc/engine/bin/cli.mjs:59-69`) carries exactly the five command lines the property names — `dev`, `queue`, `decide`, `doctor`, `hello \| spike:sdk` — and no `stats` line, so the half is red until T-17, exactly as stated. G-4 narrowed to the prose in `OPERATIONS.md`/`README.md` only. |
| F-04 | Medium | **Resolved, with one residual claim to soften** (new F-01 below) | PROP-ERR-10 added: set-equality in both directions against a hand-transcribed literal, collected behaviourally, never by reading a module constant. §Oracles gained a reason-catalogue row. |
| F-05 | Low | **Resolved** | REQ table gained an `O-2` row (`PROP-DRIFT-01…04, PROP-RR-13, PROP-NEG-07`) whose label — "no divergence from the driver's classification" — is REQ O-2's own requirement clause (`REQ-pdlc-stats.md:261-263`), plus an explicit statement of why `A-3`, `O-1`, `O-4` carry none. The closing enumeration checks out: nine `REQ-STATS-*` ids exist in REQ, and `A-3` is indeed an assumption about this document's production (`REQ-pdlc-stats.md:281`). |
| F-06 | Low | **Resolved** | EC-17 repointed into PROP-DISC-04 as an explicit REQ-less-directory conjunct naming `docs/pdlc-halt-hardening/`, verified at HEAD to hold only `PLAN-pdlc-halt-hardening.md`. The property now states both halves and names a falsifier for each.  |

### Counts re-derived

The revision moves several totals; all of them check out against the document's own tables. Counting
`PROP-` ids in §Properties gives **104**, matching the preamble. Per-level counts: `unit-pure` 5,
`unit-seamed` 27, `unit-render` 16, `integration-fake` 21, `integration-fs` 13, `process` 22 — sum
104, and the §Test-level distribution table's Count column matches each one. `5+27+16+21 = 69`, the
new "69 properties falsifiable without a filesystem or a process". Both new properties are
`integration-fake`, which is exactly the one level whose count moved (19 → 21).
