# Cross-Review: product-manager — TSPEC

**Reviewer:** product-manager
**Document reviewed:** docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md
**Date:** 2026-08-03
**Iteration:** 4
**Scope:** Delta re-review of the TSPEC across `dd46b66`→HEAD (`e067f5e`), plus the upstream FSPEC movement `1.2`→`1.4` that landed after my v3 review (`3bbf934`, `1950734`); product fidelity only; grounded against the branch working tree and git history.

## Delta context

My v3 verdict was **Approved** (0/0/0). Two things changed since:

1. **The TSPEC itself moved by exactly one line.** `git diff dd46b66 HEAD -- docs/pdlc-advisory-tier/TSPEC-pdlc-advisory-tier.md` is a single hunk: the metadata table's `Status` cell `draft` → `approved` (`e067f5e`, TSPEC `16`). No requirement text, no acceptance-criterion mapping, no type, no test attribution changed.
2. **The upstream FSPEC moved from `1.2` to `1.4`** *after* my v3 review commit (`b5b9708`) — `3bbf934` (erratum round: C-2 gated on enabled, A2 record/commit order decided, D-6 baseline decoupled from the citation pin) and `1950734` (D-6 errata withdrawn, disabled-run baseline restored to `26c3f1c`). Since the TSPEC derives from the FSPEC, an unchanged TSPEC can still drift out of fidelity when its upstream moves, so this pass re-verifies the TSPEC against FSPEC **v1.4**, not only against its own diff.

## Prior findings — disposition

| Prior | Status | Ground check |
|-------|--------|--------------|
| v2 F-01 (High — §11.2 reinterpreted FSPEC D-6's baseline on a false "predates" premise and routed an unwarranted FSPEC erratum) | **Resolved, and now confirmed upstream** | Re-verified at HEAD: TSPEC `1213` still pins the baseline to "REQ's behavioral pin `26c3f1c`, exactly as FSPEC D-6 / T-10-3 fix it", the fixture is `created-files-26c3f1c.json` (`1222`, manifest row `1405`), and the ancestry facts at `1215-1217` hold (`git merge-base --is-ancestor 4d5e4dc 26c3f1c` ⇒ true; `raisePrAndVerifyCi` at `26c3f1c:6222`). The upstream now agrees rather than merely not contradicting: FSPEC v1.4 D-6 (`FSPEC:835`) and T-10-3 (`FSPEC:855`) both name `26c3f1c` as the literal, transcribed pre-feature baseline, and the D-6 erratum was formally withdrawn in `1950734`. |
| v3 (no open findings) | n/a | — |

No prior finding is reopened by this delta.

## Changed-section scan

## Findings

## Questions

## Positive Observations

## Recommendation
