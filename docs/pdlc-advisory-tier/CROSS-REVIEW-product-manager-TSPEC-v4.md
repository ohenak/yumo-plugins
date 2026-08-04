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

**TSPEC diff (`e067f5e`).** `Status: draft → approved` (TSPEC `16`). Metadata only — it changes no requirement mapping, no acceptance criterion, and no product-visible behaviour. Nothing to review beyond confirming it is the whole diff, which it is.

**Upstream-fidelity re-check against FSPEC v1.4** (the substance of this pass). The two FSPEC amendments both land on TSPEC sections I approved in v2/v3, so I re-checked each for agreement rather than assuming it:

- **C-2 (report the substitution only when the tier resolves enabled).** FSPEC v1.4 C-2 (`FSPEC:145`) now reads: the substitution "is reported on the run report **only when the resolved configuration leaves the tier enabled** — a bad value that resolves the tier to disabled … produces a disabled run, which carries **no** advisory content on its report at all". TSPEC §3.2 (`257-267`) suppresses the emit exactly when the effective `enabled` is `false` (`if (advisory.config.enabled && advisory.invalidKeys.length)`), while the parse still records every degraded key. **Behaviourally identical to the amended rule** — the TSPEC's resolution is what the FSPEC adopted.
- **A2 durability order (record before the commit).** FSPEC v1.4 §4.1 (`FSPEC:233-240`) now states that at both A5 and A2 "steps 5 and 7 complete **before** that durable git operation … an A2 re-grounding whose record cannot be written is reverted before it is committed". TSPEC §6.4.1 (`731-753`) specifies precisely that order (`4 apply → 5 CHECK → 7 RECORD → 6 verifyGate/commitPaths`, one commit carrying both `reqPath` and `recordPath`), satisfying A2-6 (`FSPEC:454`) and H-2b. **Agrees exactly.**
- **D-6 baseline.** Covered in the disposition table above — agrees exactly.

So on substance the TSPEC is in fidelity with FSPEC v1.4 on all three amended points; no acceptance criterion is narrowed, broadened, or dropped. What has gone stale is the TSPEC's *description of its own relationship to the FSPEC*, which is the single finding below.

## Findings

## Questions

## Positive Observations

## Recommendation
