# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** `docs/pdlc-plugin-retirement/TSPEC-pdlc-plugin-retirement.md` (v0.2)
**Date:** 2026-08-17
**Iteration:** 2

**Scope:** Product lens only — requirements traceability, scope compliance, acceptance-criteria
fidelity. Delta re-review against `CROSS-REVIEW-product-manager-TSPEC-v1.md`: prior findings
verified, then only the sections this round changed (`git diff 95908057..HEAD`, 260 insertions /
55 deletions) scanned for new issues.

## Prior findings — disposition

| v1 ID | Severity | Status | Evidence |
|---|---|---|---|
| F-01 | High | **Resolved** | §4.2 no longer claims the cleanup step introduces no retired term; it now names both files that carry L-2 terms and the reason each is unavoidable, and rejects runtime name-construction on BR-CLN-4 grounds. §4.3 pins the A-1 extension as **two named paths, not a glob**, §6.1 erratum 4 routes it upstream, and §6.3 T-4 makes class 13 blocking until the rows land. Verified the gap is real and still open upstream: `docs/_constraints/pdlc-retirement-baseline.md` §A-1 covers `docs/completed/**`, `docs/discarded/**`, `docs/_decisions/**`, the baseline file, `**/LEARNINGS-*.md`/`**/POSTMORTEM-*.md`, the two fixture corpora and `QUEUE.md` — nothing under `pdlc/hooks/scripts/`. |
| F-02 | High | **Resolved** | §2.2 now carries a "Consequence for the wave gate (class 10)" block deciding both values **survive**, with the staleness argument spelled out; §2.9's class-10 row is corrected to prose-only; §6.1 erratum 5 routes the REQ C-5 / M-11h assumption upstream. Verified: `.claude/pdlc.config.example.json` carries `postWaveCommand = "node pdlc/workflows/build-runtime.mjs"` and `postWavePathspecs = ["pdlc/workflows/dist/"]`; `build-runtime.mjs:530` `CLI_SOURCES = ["orchestrate-dev.js", "cli.mjs"]`, so the stale-artifact path §2.2 describes is the real one. |
| F-03 | High | **Resolved** | §6.3 T-5 is a blocking obligation: classes 7 and 11 may not land until erratum 3 has an upstream disposition, with the reason stated (class 7 removes the only host, class 11 is instructed to *name* it). This is the mechanism the finding asked for — the skill cannot ship host-less unnoticed. |
| F-04 | Medium | **Resolved** | §2.6 op 3 and §4.7 now agree and match the tree. Re-verified by `grep -rn "driftGenerators" pdlc/workflows/__tests__`: twelve static `*.test.js` importers, six deleted (`driftBackups:46`, `driftBaseline:56`, `driftFault:37`, `driftHook:69`, `driftOrdering:36`, `queueDriftGate:60`), six surviving (`approvalHash:39`, `completeness:55`, `forcePhases:30`, `pacingWrapper:60`, `roundDerivation:36`, `scanLines:28`), plus `helpers/mergeDoubles.js:14` and the dynamic site `consolidationPreflight.test.js:173`. **Eight surviving consumers** — set-equal to the membership `docs/_constraints/pdlc-retirement-baseline.md:45` records. The withdrawn claim is named as withdrawn rather than quietly replaced. |
| F-05 | Medium | **Resolved** | §3.2 now states rows 4 and 5 are TSPEC-introduced surface, not upstream criteria; §6.1 erratum 7 routes product ownership upstream with both dispositions named (AC-4.5, or drop `--dry-run` and TT-2 with it); §5.2 rows TT-1/TT-2 give both rows oracles. TT-2 carries the positive conjunct ("every entry still present **and byte-identical**"), not an absence-only assertion. |
| F-06 | Medium | **Resolved** | §4.4 and §6.1 erratum 6 route membership and count as one correction, with the reason the two cannot be split ("correcting the number while leaving the module inside M-8 would leave AC-1.3 asserting a deletion the sweep does not perform"). FSPEC L-5's arithmetic is as cited — `119 − 22 = 97` at ASM-2. |
| F-07 | Low | **Resolved** | §4.6's table gains the repo-engine row (`0.2.1` — **unpublished**; newest tag `engine-v0.2.0`) and a paragraph separating the published-gate reading from the tree state. Verified: `pdlc/engine/package.json:3` is `0.2.1`, `:18` `pdlcPluginCompat: "^0.23.0"`, `git tag --list 'engine-v*'` ends at `engine-v0.2.0`. |

All seven v1 findings are addressed, and every repository claim I re-checked in the revised text
holds at HEAD. The two findings below are new, both introduced by this round's edits.

## Findings

## Questions

## Positive Observations

## Recommendation

## Verdict
